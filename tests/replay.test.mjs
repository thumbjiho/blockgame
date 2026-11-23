import test from "node:test";
import assert from "node:assert/strict";
import { BlockEngine, buildLogText } from "../src/game.js";
import { findBestPlacement } from "../src/cpu.js";
import { parseLog, buildFrames, logMode } from "../src/replay.js";
import { sampleLog } from "../src/sample.js";
import { rng } from "./helpers.mjs";

const cells = (matrix) => matrix.map((row) => row.map((v) => (v ? 1 : 0)).join("")).join("\n");

// Plays a game with holds and incoming garbage, keeping the board, hold and
// line count as they were after every piece.
function recorded(seed, pieces = 60, floor = null) {
  const e = new BlockEngine({ seed, sprintLines: 999999, floor });
  e.start();
  const rand = rng(seed);
  const after = [];
  for (let n = 0; e.playing && n < pieces; n++) {
    if (n % 7 === 3) e.holdPiece();
    if (n % 11 === 5) e.receiveGarbage(1 + Math.floor(rand() * 3));
    const best = findBestPlacement(e.liveMatrix(), e.currentId);
    if (!best) break;
    let { x, rot } = best;
    if (rand() < 0.2) x = Math.floor(rand() * 8);
    for (let i = 0; i < rot; i++) e.rotate(1);
    for (let i = 0; i < 14; i++) {
      const dx = x - e.currentX;
      if (!dx || !e.move(dx < 0 ? -1 : 1)) break;
    }
    e.hardDrop();
    e.clock += 0.4;
    after.push({ board: cells(e.matrix), hold: e.hold || null, lines: e.lines });
  }
  return { engine: e, after };
}

test("a log replays to the same board, hold and lines after every piece", () => {
  let steps = 0;
  let garbage = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const { engine, after } = recorded(seed);
    const events = parseLog(buildLogText(engine, "BATTLE P1 vs CPU"));
    const { frames } = buildFrames(events);
    garbage += events.filter((ev) => ev.kind === "garbage").length;
    let k = 0;
    for (let i = 0; i < events.length; i++) {
      if (events[i].kind !== "place") continue;
      // The garbage that rose on this lock is logged right after it.
      let end = i + 1;
      while (end < events.length && events[end].kind === "garbage") end++;
      const frame = frames[end];
      // A top out is logged, but the engine stops before the board settles.
      if (k === after.length - 1 && engine.gameOver) break;
      assert.equal(cells(frame.matrix), after[k].board, `seed ${seed}, piece ${k + 1}: board`);
      assert.equal(frame.hold || null, after[k].hold, `seed ${seed}, piece ${k + 1}: hold`);
      assert.equal(frame.lines, after[k].lines, `seed ${seed}, piece ${k + 1}: lines`);
      k++;
      steps++;
    }
  }
  assert.ok(steps > 1000, `only ${steps} steps were compared`);
  assert.ok(garbage > 50, `only ${garbage} garbage events were replayed`);
});

test("the log's first line says what was played", () => {
  assert.deepEqual(logMode("SPRINT 40L | 101 blocks"), { mode: "sprint", lines: 40 });
  const battle = logMode("BATTLE P1 vs Cold Clear (Hard) -1 | 80 blocks");
  assert.equal(battle.mode, "battle");
  assert.equal(battle.me, "P1");
  assert.equal(battle.vs, "Cold Clear");
  assert.equal(battle.level, "Hard");
  assert.deepEqual(battle.handicap, [0, -1]);
  assert.equal(logMode("something else").mode, "unknown");
});

test("the sample is the same 40-line run every time", () => {
  const a = sampleLog();
  assert.equal(a, sampleLog());
  const events = parseLog(a);
  const { frames } = buildFrames(events);
  assert.equal(logMode(a, events).lines, 40);
  assert.ok(frames[frames.length - 1].lines >= 40);
});

test("a piece's path survives the trip through text and ends where it locked", async () => {
  const { BlockEngine, buildLogText } = await import("../src/game.js");
  const { createTrace, parseMoves, pathAt } = await import("../src/trace.js");
  const { parseLog } = await import("../src/replay.js");
  const { findBestPlacement } = await import("../src/cpu.js");
  const e = new BlockEngine({ seed: 7, sprintLines: 999999 });
  e.start();
  const trace = createTrace();
  const act = (f) => {
    f();
    e.clock += 0.05;
    trace.sample(e);
  };
  trace.sample(e);
  for (let n = 0; e.playing && n < 30; n++) {
    const best = findBestPlacement(e.matrix, e.currentId);
    for (let i = 0; i < best.rot; i++) act(() => e.rotate(1));
    for (let i = 0; i < 12 && e.currentX !== best.x; i++) act(() => e.move(best.x < e.currentX ? -1 : 1));
    act(() => e.hardDrop());
  }
  const text = buildLogText(e, "SPRINT 40L") + "\n\n" + trace.text();
  const events = parseLog(text);
  const paths = parseMoves(text);
  assert.equal(events.length, 30, "the moves do not read as pieces");
  assert.deepEqual(paths, trace.paths.slice(0, paths.length));
  events.forEach((ev, n) => {
    const end = pathAt(paths, n, ev.t);
    assert.deepEqual([end.x, end.rot], [ev.placed[0], ev.rot], `piece ${n + 1}`);
  });
  assert.equal(parseMoves(buildLogText(e, "SPRINT 40L")), null, "a log without moves");
});

test("a packed run unpacks to a log that reads the same", async () => {
  const { pack, unpack } = await import("../src/pack.js");
  const { parseLog, logMode } = await import("../src/replay.js");
  const { parseMoves } = await import("../src/trace.js");
  const { sampleLog } = await import("../src/sample.js");
  const text = sampleLog() + "\n\nMOVES\n#01 0:3,-1,0 120:4,-1,0 80:4,-1,1\n#02 900:3,-1,0";
  const packed = await pack(text);
  const back = await unpack(packed);
  assert.deepEqual(parseLog(back), parseLog(text));
  assert.deepEqual(logMode(back, parseLog(back)), logMode(text, parseLog(text)));
  assert.deepEqual(parseMoves(back), parseMoves(text));
  assert.ok(/^[\w-]+$/.test(packed) && packed.length < text.length / 5, `packed to ${packed.length} of ${text.length}`);
  assert.equal(await unpack("not-a-run"), null);
});

test("a Sprint packed for a QR code replays to the same board, lines and final time", async () => {
  const { packRun, unpackRun } = await import("../src/compact.js");
  const { parseLog, buildFrames, logMode } = await import("../src/replay.js");
  const { sampleLog } = await import("../src/sample.js");
  const text = sampleLog();
  const packed = packRun(text);
  const back = unpackRun(packed);
  const a = parseLog(text);
  const b = parseLog(back);
  assert.equal(b.length, a.length);
  assert.deepEqual(b.map((e) => [e.kind, e.type, e.placed, e.type === "O" ? 0 : e.rot]), a.map((e) => [e.kind, e.type, e.placed, e.type === "O" ? 0 : e.rot]));
  assert.deepEqual(b.map((e) => e.action), a.map((e) => e.action), "lines and combos follow from the placements");
  assert.ok(b.every((e, i) => i === 0 || e.t >= b[i - 1].t), "times in order (each landing is not kept)");
  assert.equal(b.at(-1).t, a.at(-1).t, "the final time exactly");
  assert.deepEqual(buildFrames(b).frames.at(-1).matrix, buildFrames(a).frames.at(-1).matrix);
  const { analyze } = await import("../src/analysis.js");
  const buildReplay = (log) => ((events) => ({ events, ...buildFrames(events), mode: logMode(log, events) }))(parseLog(log));
  assert.deepEqual({ ...logMode(back, b), finesse: undefined }, { ...logMode(text, a), finesse: undefined });
  assert.equal((await analyze(buildReplay(back))).scores.finesse, (await analyze(buildReplay(text))).scores.finesse, "the finesse score is kept");
  assert.ok(packed.length < 100, `packed to ${packed.length} characters for ${a.length} events`);
  assert.equal(packRun(back), packed, "and packs again to the same text");
  // A log that does not name its seed lists the pieces, and reads back the same.
  const listed = packRun(text.replace(/ \| SEED:\d+/, ""));
  assert.ok(listed.length > packed.length);
  assert.deepEqual(parseLog(unpackRun(listed)).map((e) => e.type), a.map((e) => e.type));
  assert.equal(packRun(text.replace(/^SPRINT 40L/, "BATTLE P1 vs CPU")), null, "a Battle names both seats");
  assert.ok(/^[0-9A-Z$*+\-:]+$/.test(packed), "only characters a QR code packs tightly");
  assert.equal(unpackRun("AAAAE"), null);
});

test("a Sprint code made before version 10 still opens", async () => {
  const { unpackRun } = await import("../src/compact.js");
  const { parseLog } = await import("../src/replay.js");
  const { sampleLog } = await import("../src/sample.js");
  // The sample run as version 7 wrote it.
  const back = unpackRun("SYMT3W:WWW+OK*Z66+WOZTNA-DUVZ+G5KY:T8HC+9308TOCA$CD3-HM3N6KEF*LK:044W5E");
  const a = parseLog(sampleLog());
  const b = parseLog(back);
  assert.deepEqual(b.map((e) => [e.kind, e.type, e.placed, e.type === "O" ? 0 : e.rot]), a.map((e) => [e.kind, e.type, e.placed, e.type === "O" ? 0 : e.rot]));
  assert.equal(b.at(-1).t, a.at(-1).t);
});

test("a Battle board packs into a QR code with its garbage, and replays the same", async () => {
  const { packRun, unpackRun } = await import("../src/compact.js");
  const { qr } = await import("../src/qr.js");
  let checked = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const { engine } = recorded(seed, 90);
    const text = buildLogText(engine, "BATTLE Cold Clear (Hard) +1 vs P1");
    const a = parseLog(text);
    if (!a.some((e) => e.kind === "garbage")) continue;
    const packed = packRun(text);
    assert.ok(packed, `seed ${seed}: packs`);
    const back = unpackRun(packed);
    const b = parseLog(back);
    assert.equal(b.length, a.length, `seed ${seed}: as many events`);
    assert.deepEqual(
      b.map((e) => (e.kind === "garbage" ? ["g", e.holes] : [e.kind, e.type, e.placed])),
      a.map((e) => (e.kind === "garbage" ? ["g", e.holes] : [e.kind, e.type, e.placed])),
      `seed ${seed}: same pieces, places and garbage`,
    );
    assert.deepEqual(buildFrames(b).frames.at(-1).matrix, buildFrames(a).frames.at(-1).matrix, `seed ${seed}: same board`);
    const mode = logMode(back, b);
    assert.equal(mode.mode, "battle");
    assert.equal(mode.me, "Cold Clear");
    assert.equal(mode.vs, "P1");
    assert.deepEqual(mode.handicap, [1, 0]);
    assert.ok(qr(`HTTPS://SZO.UMJO.ME/Q/${packed}`), `seed ${seed}: fits a QR code (${packed.length} characters)`);
    checked++;
  }
  assert.ok(checked >= 5, `only ${checked} games had garbage`);
});

test("a rising floor replays, packs into a QR code and comes back the same", async () => {
  const { packRun, unpackRun } = await import("../src/compact.js");
  const { qr } = await import("../src/qr.js");
  const kinds = (events) => events.map((e) => (e.kind === "garbage" ? ["g", e.holes] : e.kind === "floor" ? ["f", e.rows] : [e.kind, e.type, e.placed]));
  let checked = 0;
  for (let seed = 1; seed <= 12; seed++) {
    // Early and fast, so a short game sees it rise many times.
    const { engine, after } = recorded(seed, 90, { start: 4, every: 2 });
    const text = buildLogText(engine, "BATTLE P1 vs Stacker (Hard)");
    const a = parseLog(text);
    if (!a.some((e) => e.kind === "floor")) continue;
    const { frames } = buildFrames(a);
    // The board after every piece is the engine's, floor rows and all.
    let p = 0;
    a.forEach((e, i) => {
      if (e.kind !== "place") return;
      const next = a[i + 1]?.kind === "garbage" || a[i + 1]?.kind === "floor" ? (a[i + 2]?.kind === "floor" ? i + 3 : i + 2) : i + 1;
      assert.deepEqual(cells(frames[next].matrix), after[p].board, `seed ${seed}: board after piece ${p + 1}`);
      p++;
    });
    const packed = packRun(text);
    assert.ok(packed, `seed ${seed}: packs`);
    const b = parseLog(unpackRun(packed));
    assert.deepEqual(kinds(b), kinds(a), `seed ${seed}: same pieces, garbage and floor`);
    assert.ok(qr(`HTTPS://SZO.UMJO.ME/Q/${packed}`), `seed ${seed}: fits a QR code`);
    checked++;
  }
  assert.ok(checked >= 5, `only ${checked} games had a rising floor`);
});
