// ─── Replay from a copied piece log ───
// The log (Sprint's "Copy log", or the copy button beside a log) records where
// every piece ended up, so the board can be rebuilt placement by placement.
// It does not record the path a piece took, only where and when it locked.
// Garbage that rose (Battle) is in the log too, with the hole of each row,
// and so is the floor: solid rows that rise under it all and never clear.
import { ROWS, COLS, EMPTY, FLOOR, floorOf, getShape } from "./game.js";

const LETTER_ID = { I: 1, T: 2, L: 3, J: 4, S: 5, Z: 6, O: 7 };
const LINE = /^#\d+\s+\[([\d.]+)s\]\s+([ITLJSZO])\s+(?:(hold)|spawn\((-?\d+),(-?\d+)\)\s*→\s*placed\((-?\d+),(-?\d+)\)\s+rot=(\d))(.*)$/;

// What the log says was played, from its first line: { mode, lines? }.
// Older logs (headed "LOG") do not say; garbage in the log means a Battle.
export function logMode(text, events = []) {
  const head = (text.split(/\r?\n/).find((l) => l.trim()) || "").trim();
  const sprint = head.match(/^SPRINT\s+(\d+)L/i);
  // "FNS:87": the finesse score, in a log that kept only that (compact.js).
  const finesse = head.match(/\bFNS:(\d+)/);
  if (sprint) return { mode: "sprint", lines: +sprint[1], ...(finesse ? { finesse: +finesse[1] } : {}) };
  // "BATTLE P1 vs Cold Clear | …": the board's player, then the opponent.
  const battle = head.match(/^BATTLE(?:\s+(.+?)\s+vs\s+(.+?))?\s*(?:\||$)/i);
  if (battle) {
    // "Cold Clear (Hard) -1" → name, level, handicap (0 when not written).
    const seat = (text) => {
      const m = (text || "").match(/^(.*?)(?:\s+\(([^)]+)\))?(?:\s+([+-]\d+))?$/);
      return text ? { name: m[1], level: m[2] || null, handicap: m[3] ? +m[3] : 0 } : null;
    };
    const me = seat(battle[1]);
    const vs = seat(battle[2]);
    return { mode: "battle", me: me?.name || null, vs: vs?.name || null, level: vs?.level || null, handicap: me && vs ? [me.handicap, vs.handicap] : null, ...(finesse ? { finesse: +finesse[1] } : {}) };
  }
  const named = head.match(/^(OPENING|FINESSE)\b/i);
  if (named) return { mode: named[1].toLowerCase() };
  return { mode: events.some((e) => e.kind === "garbage") ? "battle" : "unknown" };
}

const GARBAGE = /^#\d+\s+\[([\d.]+)s\]\s+garbage\s+\+\d+\s+holes=\[([\d,]*)\]/;
const RISE = /^#\d+\s+\[([\d.]+)s\]\s+floor\s+\+(\d+)/;

// Text → events in the shape the piece log shows ({ kind, type, t, ... }).
export function parseLog(text) {
  const events = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const gm = line.match(GARBAGE);
    if (gm) {
      events.push({ kind: "garbage", t: +gm[1], holes: gm[2] ? gm[2].split(",").map(Number) : [] });
      continue;
    }
    const fm = line.match(RISE);
    if (fm) {
      events.push({ kind: "floor", t: +fm[1], rows: +fm[2] });
      continue;
    }
    const m = line.match(LINE);
    if (!m) continue;
    const [, t, type, hold, sx, sy, px, py, rot, rest] = m;
    if (hold) {
      events.push({ kind: "hold", type, t: +t });
      continue;
    }
    const parts = rest.split("|").map((s) => s.trim()).filter(Boolean);
    const keys = +(parts.find((p) => p.startsWith("keys="))?.slice(5) ?? 0);
    const opt = parts.find((p) => p.startsWith("optimal="));
    const optimal = opt ? parseInt(opt.slice(8), 10) : -1;
    // What is left is the clear text, e.g. "T-Spin Double B2B".
    const words = (parts.find((p) => !p.startsWith("keys=") && !p.startsWith("optimal=")) || "").split(/\s+/).filter(Boolean);
    events.push({
      kind: "place",
      type,
      t: +t,
      spawn: [+sx, +sy],
      placed: [+px, +py],
      rot: +rot,
      keys,
      optimal,
      finesseFault: optimal > 0 ? Math.max(0, keys - optimal) : 0,
      action: words.filter((w) => w !== "B2B" && w !== "PC").join(" "),
      b2b: words.includes("B2B"),
      pc: words.includes("PC"),
    });
  }
  return events;
}

// Board, hold and queue after each event. frames[k] is the state once the
// first k events have happened; frames[0] is the empty start.
export function buildFrames(events) {
  // The order the pieces were dealt in. A piece shows up as the type of the
  // first event after a deal; swapping with the hold deals nothing.
  const dealt = [];
  const dealsBefore = []; // pieces dealt before event i happened
  let hold = null;
  let deal = true;
  for (const ev of events) {
    if (ev.kind === "garbage" || ev.kind === "floor") {
      dealsBefore.push(null); // no piece of its own: filled in below
      continue;
    }
    if (deal) dealt.push(LETTER_ID[ev.type]);
    dealsBefore.push(dealt.length);
    if (ev.kind === "hold") {
      deal = hold === null;
      hold = ev.type;
    } else {
      deal = true;
    }
  }
  // Rising garbage (and floor) deals nothing, so it shares the count of the event after it.
  for (let i = events.length - 1; i >= 0; i--) {
    if (dealsBefore[i] === null) dealsBefore[i] = i + 1 < events.length ? dealsBefore[i + 1] : dealt.length;
  }

  let matrix = Array.from({ length: ROWS }, () => new Array(COLS).fill(EMPTY));
  let lines = 0;
  let placed = 0;
  hold = null;
  const frames = [{ matrix, hold, lines, placed, dealtCount: dealt.length ? 1 : 0 }];
  events.forEach((ev, i) => {
    if (ev.kind === "garbage") {
      matrix = matrix.map((row) => row.slice());
      for (const hole of ev.holes) {
        matrix.shift();
        const row = new Array(COLS).fill(8);
        row[hole] = EMPTY;
        // On top of the floor, never under it.
        matrix.splice(ROWS - 1 - floorOf(matrix), 0, row);
      }
    } else if (ev.kind === "floor") {
      matrix = matrix.map((row) => row.slice());
      for (let i = 0; i < ev.rows; i++) {
        matrix.shift();
        matrix.push(new Array(COLS).fill(FLOOR));
      }
    } else if (ev.kind === "hold") {
      hold = LETTER_ID[ev.type];
    } else {
      matrix = matrix.map((row) => row.slice());
      const id = LETTER_ID[ev.type];
      const shape = getShape(id, ev.rot);
      const [px, py] = ev.placed;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape.length; c++) {
          if (!shape[r][c]) continue;
          const y = py + r;
          const x = px + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) matrix[y][x] = id;
        }
      }
      const kept = matrix.filter((row) => row[0] === FLOOR || row.some((v) => v === EMPTY));
      lines += ROWS - kept.length;
      while (kept.length < ROWS) kept.unshift(new Array(COLS).fill(EMPTY));
      matrix = kept;
      placed++;
    }
    // The piece in play after this event has been dealt already, so the queue
    // starts one further on (unless the log ends here).
    frames.push({ matrix, hold, lines, placed, dealtCount: i + 1 < events.length ? dealsBefore[i + 1] : dealt.length });
  });
  return { frames, dealt };
}
