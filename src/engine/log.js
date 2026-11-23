// The piece log as text, and what it says about each placement (finesse, heights, holes).
import { COLS, ROWS, EMPTY, SPAWNS } from "./pieces.js";

// m:ss.cc — hundredths are enough to read; truncated so it never shows 60.00.
export function formatTime(seconds) {
  const cs = Math.floor(seconds * 100 + 1e-6);
  const m = Math.floor(cs / 6000);
  const s = (cs % 6000) / 100;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

function replayLines(engine) {
  const lines = [];
  let pieceNum = 0;
  for (const ev of engine.replay) {
    const ts = `[${ev.t.toFixed(3)}s]`;
    if (ev.kind === "garbage") {
      pieceNum++;
      lines.push(`#${String(pieceNum).padStart(2, "0")} ${ts} garbage +${ev.holes.length} holes=[${ev.holes.join(",")}]`);
    } else if (ev.kind === "floor") {
      pieceNum++;
      lines.push(`#${String(pieceNum).padStart(2, "0")} ${ts} floor +${ev.rows}`);
    } else if (ev.kind === "hold") {
      pieceNum++;
      lines.push(
        `#${String(pieceNum).padStart(2, "0")} ${ts} ${ev.type} hold`,
      );
    } else {
      pieceNum++;
      const tags = [];
      if (ev.action) tags.push(ev.action);
      if (ev.b2b) tags.push("B2B");
      if (ev.pc) tags.push("PC");
      const finesseStr =
        ev.optimal > 0
          ? ` | optimal=${ev.optimal}${ev.finesseFault > 0 ? ` (+${ev.finesseFault} fault)` : " ✓"}`
          : "";
      const tagStr = tags.length ? ` | ${tags.join(" ")}` : "";
      lines.push(
        `#${String(pieceNum).padStart(2, "0")} ${ts} ${ev.type} spawn(${ev.spawn[0]},${ev.spawn[1]}) → placed(${ev.placed[0]},${ev.placed[1]}) rot=${ev.rot} | keys=${ev.keys}${finesseStr}${tagStr}`,
      );
      lines.push(
        `    board: height=[${ev.heights.join(",")}] holes=${ev.holes}`,
      );
    }
  }
  return lines;
}

// The piece log so far as text (the log panel's copy button).
// mode: what was being played, as the first word(s) of the header ("SPRINT
// 40L", "BATTLE", "OPENING", "FINESSE"). A replay reads it back to know how to
// judge the run: a Sprint and a Battle are not stacked the same way.
const seedNote = (engine) => (engine.orderSeed == null ? "" : ` | SEED:${engine.orderSeed}`);
export function buildLogText(engine, mode = "LOG") {
  if (!engine) return "";
  return [`${mode} | ${engine.placedBlocks} blocks | ${formatTime(engine.clock)}${seedNote(engine)}`, "", ...replayLines(engine)].join("\n");
}

export function buildReplayText(engine, settings, summary) {
  const { das, arr, sprintLines } = settings;
  const lines = [];
  const time = summary.time.toFixed(3);
  const timeStr = formatTime(summary.time);
  lines.push(
    `SPRINT ${sprintLines}L | ${timeStr} (${time}s) | ${summary.blocks} blocks | ${summary.pps.toFixed(2)} PPS | DAS:${das} ARR:${arr}${seedNote(engine)}`,
  );

  lines.push("");

  lines.push(...replayLines(engine));

  lines.push("");
  const s = engine.stats;
  const breakdown = [];
  if (s.singles) breakdown.push(`${s.singles}S`);
  if (s.doubles) breakdown.push(`${s.doubles}D`);
  if (s.triples) breakdown.push(`${s.triples}T`);
  if (s.quads) breakdown.push(`${s.quads}Q`);
  if (s.tspins) breakdown.push(`${s.tspins}TS`);
  lines.push(
    `STATS: ${breakdown.join(" ")} | Combo max:${s.maxCombo} | B2B:${s.b2bs}`,
  );

  const placeEvents = engine.replay.filter((e) => e.kind === "place");
  const totalKeys = placeEvents.reduce((sum, e) => sum + e.keys, 0);
  const totalOptimal = placeEvents.reduce(
    (sum, e) => sum + (e.optimal > 0 ? e.optimal : e.keys),
    0,
  );
  const totalFaults = placeEvents.reduce(
    (sum, e) => sum + e.finesseFault,
    0,
  );
  const faultyPieces = placeEvents.filter(
    (e) => e.finesseFault > 0,
  ).length;
  const efficiency =
    totalKeys > 0
      ? ((totalOptimal / totalKeys) * 100).toFixed(1)
      : "0.0";
  lines.push(
    `KEYS: ${totalKeys} actual / ${totalOptimal} optimal = ${efficiency}% efficiency`,
  );
  lines.push(
    `FINESSE: ${totalFaults} extra keys across ${faultyPieces}/${placeEvents.length} pieces`,
  );

  if (placeEvents.length > 0) {
    const allHeights = placeEvents.map((e) => Math.max(...e.heights));
    const avgMaxH = (
      allHeights.reduce((a, b) => a + b, 0) / allHeights.length
    ).toFixed(1);
    const peakH = Math.max(...allHeights);
    const finalHoles = placeEvents[placeEvents.length - 1].holes;
    lines.push(
      `HEIGHT: avg-peak-per-piece=${avgMaxH} max=${peakH} | HOLES: final=${finalHoles}`,
    );
  }

  return lines.join("\n");
}
