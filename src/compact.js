// ─── A run small enough for a QR code ───
// The fewest bits that still replay a Sprint: which pieces came, where each
// was put down, whether a T was a spin, and the time the run took. Everything
// else a replay shows (lines, combos, the board) follows from those. A
// 40-line run comes to about 100 bytes, which a phone reads easily off the
// rank card. What is not kept: how the pieces moved on the way down, when
// each one landed (the replay spaces them evenly) and the key counts, of
// which only the finesse score they came to is kept; the longer link
// (pack.js) has those.
//
// The run is written as a row of choices, each one out of a known number:
//   version (of 16), goal lines (1024), events (1024), time in ms (2^22),
//   the finesse score (101),
//   how the pieces are told (3): each one named, by its place in a bag of
//   seven, or by the seed that dealt them, and then that seed (2^32),
//   how many pieces did not simply fall to rest (events + 1), and for each
//   of those which placement it was (events) and its row (32),
//   then the events in order. Before an event that takes a new piece from
//   the queue, that piece, unless a seed tells it: its place among those left
//   in the bag (7, 6, … 1), or one of 8 if not in bags. Then where it went.
//   For a T that was placed, spin (2) and then mini (2).
// A piece's row is not written unless it is one of the exceptions: dropping
// it in its column gives the row back.
//
// Where a piece went is the costly part, so it is not written as a plain
// number. Every way the piece can stand on the board (9 for O, 17 for I, 34
// for the rest) is ranked by how tidy it leaves the stack (cost below), and
// what is written is the rank: most pieces go to one of the first few, and
// those take a bit or two instead of five (ODDS). Holding is one more choice
// in the same list.
//
// The choices are folded into one number, a likely choice growing it less
// than an unlikely one, and the number is written in 41 characters that a QR
// code packs tightly and that are safe in the path of a link: digits,
// capitals and "$*+-:".
//
// Reading a run back needs the same ranking and the same odds, so changing
// cost, ODDS or the engine's piece order means a new VERSION: codes made
// before stop opening.
import { COLS, ROWS, FLOOR, floorOf, getShape, pieceOrder } from "./game.js";
import { parseLog, logMode } from "./replay.js";
import { finesseScore } from "./analysis.js";

const VERSION = 7;
const NAMED = 0;
const BAGS = 1;
const SEED = 2;
const O = 7;
const T = 2;
const LETTERS = " ITLJSZO";
const LINES = ["", "Single", "Double", "Triple", "Quad"];
const SIGNS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$*+-:";
const BASE = BigInt(SIGNS.length);
// A run's link is the site, this, and the run: all capitals, so the whole
// link packs tightly.
export const RUN_PATH = "/Q/";

// Every way each piece can stand on the board, as [rot, x].
const STANDS = [null];
for (let id = 1; id <= 7; id++) {
  const list = [];
  for (let rot = 0; rot < (id === O ? 1 : 4); rot++) {
    const shape = getShape(id, rot);
    for (let x = -3; x < COLS; x++) {
      if (shape.every((row) => row.every((on, c) => !on || (x + c >= 0 && x + c < COLS)))) list.push([rot, x]);
    }
  }
  STANDS.push(list);
}

// Choices → text, and back. Each choice is [where its share starts, how big
// its share is, the sum of all shares]: one of n equally likely is [which, 1, n].
function toText(choices) {
  let v = 0n;
  for (let i = choices.length - 1; i >= 0; i--) {
    const [start, share, sum] = choices[i].map(BigInt);
    v = (v / share) * sum + start + (v % share);
  }
  let out = "";
  for (; v > 0n; v /= BASE) out += SIGNS[Number(v % BASE)];
  // An "E" at the end, so the text never ends in a sign that a chat app
  // would leave out of a link.
  return out + "E";
}
function reader(text) {
  let v = 0n;
  const body = text.slice(0, -1);
  for (let i = body.length - 1; i >= 0; i--) {
    const d = SIGNS.indexOf(body[i]);
    if (d < 0) throw new Error("not a run");
    v = v * BASE + BigInt(d);
  }
  // One of count, equally likely.
  const get = (count) => {
    const which = Number(v % BigInt(count));
    v /= BigInt(count);
    return which;
  };
  // One of shares.length, each as likely as its share.
  get.of = (shares) => {
    const sum = shares.reduce((a, b) => a + b, 0);
    const slot = Number(v % BigInt(sum));
    let which = 0;
    let start = 0;
    while (start + shares[which] <= slot) start += shares[which++];
    v = BigInt(shares[which]) * (v / BigInt(sum)) + BigInt(slot - start);
    return which;
  };
  return get;
}
const pick = (shares, which) => [shares.slice(0, which).reduce((a, b) => a + b, 0), shares[which], shares.reduce((a, b) => a + b, 0)];

// Whether the piece fits on the board at row y.
const fitsAt = (matrix, id, rot, x, y) =>
  getShape(id, rot).every((row, r) => row.every((on, c) => !on || (x + c >= 0 && x + c < COLS && y + r < ROWS && (y + r < 0 || !matrix[y + r][x + c]))));
// The row a piece comes to rest on when it falls straight down this column.
function restY(matrix, id, x, rot) {
  const fits = (y) => fitsAt(matrix, id, rot, x, y);
  let y = -3;
  if (!fits(y)) return null;
  while (fits(y + 1)) y++;
  return y;
}
// The board after a piece is put down, and how many lines that cleared.
function settle(matrix, id, x, y, rot) {
  const next = matrix.map((row) => row.slice());
  getShape(id, rot).forEach((row, r) => row.forEach((on, c) => on && next[y + r]?.[x + c] !== undefined && (next[y + r][x + c] = id)));
  const kept = next.filter((row) => row[0] === FLOOR || row.some((v) => !v));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(new Array(COLS).fill(0));
  return [kept, cleared];
}

// How untidy the stack is after the piece falls in this column: holes, an
// uneven top (the deepest column, the well, left out), height. A quad is
// worth a lot, any other clear a little less than none. Whole numbers only,
// so every device ranks alike.
function cost(matrix, id, rot, x) {
  return costAt(matrix, id, rot, x, restY(matrix, id, x, rot));
}
// The same, for the piece put down on row y (null: it does not fit there).
function costAt(matrix, id, rot, x, y) {
  if (y === null) return 1e6;
  const [after, cleared] = settle(matrix, id, x, y, rot);
  const heights = [];
  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let top = 0;
    while (top < ROWS && !after[top][c]) top++;
    heights.push(ROWS - top);
    for (let r = top + 1; r < ROWS; r++) if (!after[r][c]) holes++;
  }
  const well = heights.indexOf(Math.min(...heights));
  const tops = heights.filter((_, i) => i !== well);
  let bumps = 0;
  for (let i = 1; i < tops.length; i++) bumps += Math.abs(tops[i] - tops[i - 1]);
  const shape = getShape(id, rot);
  const foot = shape.findLastIndex((row) => row.some(Boolean));
  return 12 * holes + 2 * bumps + 2 * (ROWS - y - foot) + Math.max(...heights) - (cleared === 4 ? 16 : cleared ? -2 : 0);
}
// The ways this piece can stand, most likely first: indexes into STANDS[id].
function ranked(matrix, id) {
  return STANDS[id]
    .map(([rot, x], i) => [cost(matrix, id, rot, x), i])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(([, i]) => i);
}
// How often a piece goes to the first-ranked way, the second, …, out of their
// sum, from games played by people and by the CPUs; and how often it is held.
const ODDS = [480, 100, 80, 45, 30, 20, 14, 10, 8, 6, 5, 4, 3, 3, 2, 2, 2, 2];
const HOLD_ODDS = 70;
const sharesOf = (ways) => [...Array.from({ length: ways }, (_, i) => ODDS[i] ?? 1), HOLD_ODDS];

const emptyBoard = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

// The pieces in the order they came from the queue. A piece shows up as the
// type of the first event after one is taken; swapping with the hold takes
// none.
function dealtOf(events) {
  const dealt = [];
  let hold = null;
  let take = true;
  for (const ev of events) {
    if (ev.kind === "garbage" || ev.kind === "floor") continue; // rising rows deal nothing
    if (take) dealt.push(LETTERS.indexOf(ev.type));
    if (ev.kind === "hold") {
      take = hold === null;
      hold = ev.type;
    } else {
      take = true;
    }
  }
  return dealt;
}
const BAG = [1, 2, 3, 4, 5, 6, 7];

// A Sprint packed as version 7, the first form of it (written until
// version 10 took over) → its log, or null.
function unpackSprint(packed) {
  try {
    const get = reader(packed);
    if (get(16) !== VERSION) return null;
    const goal = get(1024);
    const count = get(1024);
    const end = get(2 ** 22);
    const finesse = get(101);
    const how = get(3);
    const seed = how === SEED ? get(2 ** 32) : null;
    const deal = how === SEED ? pieceOrder(seed) : null;
    const odd = new Map();
    for (let k = get(count + 1); k > 0; k--) {
      const n = get(count);
      odd.set(n, get(32) - 2);
    }
    const lines = [];
    let matrix = emptyBoard();
    let combo = 0;
    let left = [];
    let current = 0;
    let hold = 0;
    let take = true;
    for (let n = 0; n < count; n++) {
      if (take) {
        if (deal) {
          current = deal();
        } else if (how === BAGS) {
          if (!left.length) left = [...BAG];
          current = left.splice(get(left.length), 1)[0];
        } else {
          current = get(8);
        }
      }
      if (!current) return null;
      const num = `#${String(n + 1).padStart(2, "0")}`;
      // When each piece landed is not kept: they are spaced evenly to the end.
      const stamp = `[${((end * (n + 1)) / count / 1000).toFixed(3)}s]`;
      const stands = STANDS[current];
      const rank = get.of(sharesOf(stands.length));
      if (rank === stands.length) {
        lines.push(`${num} ${stamp} ${LETTERS[current]} hold`);
        take = !hold;
        [hold, current] = [current, hold];
        continue;
      }
      const [rot, x] = stands[ranked(matrix, current)[rank]];
      const y = odd.has(n) ? odd.get(n) : restY(matrix, current, x, rot);
      if (y === null) return null;
      const spin = current === T ? get(2) : 0;
      const mini = spin ? get(2) : 0;
      // Put the piece down to see what it cleared.
      let cleared;
      [matrix, cleared] = settle(matrix, current, x, y, rot);
      combo = cleared ? combo + 1 : 0;
      const name = cleared ? (spin ? `T-Spin ${mini ? "Mini " : ""}${LINES[cleared]}` : LINES[cleared]) : "";
      const words = [name + (combo > 1 ? ` Combo ${combo - 1}` : ""), cleared && matrix.every((row) => row.every((v) => !v)) ? "PC" : ""].filter(Boolean).join(" ");
      // Key counts are not kept, so the line says nothing of finesse.
      lines.push(`${num} ${stamp} ${LETTERS[current]} spawn(3,-1) → placed(${x},${y}) rot=${rot} | keys=0${words ? ` | ${words}` : ""}`);
      take = true;
    }
    return [`SPRINT ${goal}L | FNS:${finesse}${deal ? ` | SEED:${seed}` : ""}`, "", ...lines].join("\n");
  } catch {
    return null;
  }
}

// ─── Version 10 (Sprint) and 9 (one board of a Battle) ───
// Both are written more tightly than version 7 (8 was an early, looser form
// of a Battle board). A Battle board also holds the garbage that rose under it
// and who sat at each side:
//   version (of 16), for a Sprint the goal lines (1024), events (4096), the
//   time (a Battle's in tens of ms, 2^19; a Sprint's in ms, 2^22), the finesse
//   score (101), how the pieces are told (3) and the seed (2^31); for a
//   Battle the two seats, each who (14: P1, P2, or one of three CPUs at one
//   of four levels) and the handicap (7, no handicap the likeliest).
//   Then the events. For each piece: the piece, as in version 7, then
//   whether it was held (not asked right after a hold, which cannot be held
//   again), whether it was tucked (put down somewhere a straight fall does
//   not reach; not asked when there is no such place) and where it went: its
//   rank among the straight falls, or among the tucked places. A T that
//   cleared lines with three corners filled says whether it was a spin; the
//   corners tell mini from full. In a Battle, after each piece put down,
//   whether garbage rose; when it did, how many rows, the hole of the first
//   and, for each next row, whether its hole moved and where.
// Yes-or-no choices take the odds the run has shown so far (a CPU holds far
// more than most people), and so do the ranks, so each costs about what it
// tells.
const BATTLE = 9;
const SPRINT = 10;
// Version 11: a Battle board whose floor rose (see BlockEngine.floorRule).
// After each piece (and the garbage under it), whether the floor rose, and
// by how many rows.
const RISING = 11;
const BOTS = ["Cold Clear", "MisaMino", "Stacker"];
const BOT_LEVELS = ["Easy", "Normal", "Hard", "Max"];
const HANDICAP_ODDS = [1, 1, 2, 16, 2, 1, 1];
// Rows of garbage in one rise, 1 to 20.
const ROW_ODDS = [12, 7, 5, 5, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const rowShares = (seen) => ROW_ODDS.map((n, i) => n + 4 * seen[i]);

// A yes-or-no whose odds follow what came before: [no, yes] seen so far.
const flag = () => [0, 0];
const flagShares = ([no, yes]) => [2 * no + 1, 2 * yes + 1];
function putFlag(out, seen, yes) {
  out.push(pick(flagShares(seen), yes ? 1 : 0));
  seen[yes ? 1 : 0]++;
}
function getFlag(get, seen) {
  const yes = get.of(flagShares(seen));
  seen[yes]++;
  return yes === 1;
}

// Garbage rising from the floor, a row per hole, as the replay builds it.
function rise(matrix, holes) {
  const next = matrix.map((row) => row.slice());
  for (const hole of holes) {
    next.shift();
    const row = new Array(COLS).fill(8);
    row[hole] = 0;
    next.splice(ROWS - 1 - floorOf(next), 0, row); // on top of the floor
  }
  return next;
}
// The floor coming up n rows (Battle, version 11).
function raise(matrix, n) {
  const next = matrix.map((row) => row.slice());
  for (let i = 0; i < n; i++) {
    next.shift();
    next.push(new Array(COLS).fill(FLOOR));
  }
  return next;
}
// Whether the floor rose after this piece. It rises on a clock, so after
// about as many pieces as last time: the odds follow how far along that gap
// the run is (no rise yet; well short of it; about there; past it).
const floorContext = (since, gap) => (gap < 0 ? 0 : since < gap - 2 ? 1 : since <= gap + 2 ? 2 : 3);
// Every place a piece can be tucked into: resting, but below where it would
// fall straight to. Tidiest first, as [stand, row].
function tucks(matrix, id) {
  const list = [];
  STANDS[id].forEach(([rot, x], i) => {
    const top = restY(matrix, id, x, rot);
    for (let y = top === null ? -3 : top + 1; y < ROWS; y++) {
      if (fitsAt(matrix, id, rot, x, y) && !fitsAt(matrix, id, rot, x, y + 1)) list.push([costAt(matrix, id, rot, x, y), i, y]);
    }
  });
  return list.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).map(([, i, y]) => [i, y]);
}
// Tucked places by rank.
const tuckShares = (n) => Array.from({ length: n }, (_, i) => ODDS[i] ?? 1);
const RANK_K = 8;
// Straight falls by rank, the odds learning from the run as it goes, plus one
// more for a piece that is neither (left hanging as the board tops out),
// which then names its stand and row.
const placeShares = (ways, seen) => [...Array.from({ length: ways }, (_, i) => (ODDS[i] ?? 1) + RANK_K * seen[i]), 1];
// A T's corners on the board it was put down on, as the engine reads them:
// how many are filled, and whether both in front are.
function corners(matrix, x, y, rot) {
  const on = (r, c) => r < 0 || r >= ROWS || c < 0 || c >= COLS || matrix[r][c] > 0;
  const k = [on(y, x), on(y, x + 2), on(y + 2, x), on(y + 2, x + 2)];
  const front = [[0, 1], [1, 3], [2, 3], [0, 2]][rot].every((i) => k[i]);
  return [k.filter(Boolean).length, front];
}

// Which odds a hold takes: the hold empty, the same piece in it (nothing to
// gain), or whether the held piece would sit better than the one in hand.
const best = (matrix, id) => Math.min(...STANDS[id].map(([rot, x]) => cost(matrix, id, rot, x)));
const holdHint = (matrix, current, hold) => (!hold ? 0 : hold === current ? 1 : best(matrix, hold) < best(matrix, current) ? 3 : 2);

// "Cold Clear (Hard) -1" → [who, handicap], or null.
function seatOf(part) {
  const m = (part || "").trim().match(/^(.*?)(?:\s+\(([^)]+)\))?(?:\s+([+-]\d+))?$/);
  if (!m) return null;
  const handicap = m[3] ? +m[3] : 0;
  if (handicap < -3 || handicap > 3) return null;
  if (m[1] === "P1" || m[1] === "P2") return m[2] ? null : [m[1] === "P1" ? 0 : 1, handicap];
  const bot = BOTS.indexOf(m[1]);
  const level = BOT_LEVELS.indexOf(m[2]);
  return bot < 0 || level < 0 ? null : [2 + bot * BOT_LEVELS.length + level, handicap];
}
const SEATS = 2 + BOTS.length * BOT_LEVELS.length;
function seatText([who, handicap]) {
  const name = who < 2 ? `P${who + 1}` : `${BOTS[Math.floor((who - 2) / BOT_LEVELS.length)]} (${BOT_LEVELS[(who - 2) % BOT_LEVELS.length]})`;
  return name + (handicap ? ` ${handicap > 0 ? "+" : ""}${handicap}` : "");
}

function packTight(text, events, mode) {
  const battle = mode.mode === "battle";
  const count = events.length;
  if ((!battle && mode.mode !== "sprint") || !count || count > 4095) return null;
  const head = text.split(/\r?\n/, 1)[0].replace(/\s*\|.*$/, "");
  const m = head.match(/^BATTLE\s+(.+?)\s+vs\s+(.+)$/i);
  const seats = battle ? m && [seatOf(m[1]), seatOf(m[2])] : [];
  if (battle && (!seats?.[0] || !seats[1])) return null;
  const dealt = dealtOf(events);
  const bags = dealt.every((id, i) => !dealt.slice(i - (i % 7), i).includes(id));
  const seed = text.split(/\r?\n/, 1)[0].match(/\bSEED:(\d+)/)?.[1];
  const deal = seed && +seed < 2 ** 31 && pieceOrder(+seed);
  const how = deal && dealt.every((id) => id === deal()) ? SEED : bags ? BAGS : NAMED;
  const body = [];
  const held = [flag(), flag(), flag(), flag()];
  const tucked = flag();
  const ranks = new Array(34).fill(0);
  const spun = flag();
  const rose = [flag(), flag()]; // after a piece that cleared nothing / cleared lines
  const moved = flag();
  const sizes = new Array(ROW_ODDS.length).fill(0);
  const rising = battle && events.some((e) => e.kind === "floor");
  const floorUp = [flag(), flag(), flag(), flag()];
  const more = flag();
  let since = 0;
  let gap = -1;
  let matrix = emptyBoard();
  let left = [];
  let next = 0;
  let current = 0;
  let hold = 0;
  let take = true;
  let canHold = true;
  let lastHole = -1;
  for (let n = 0; n < count; n++) {
    const ev = events[n];
    if (ev.kind === "garbage" || ev.kind === "floor") return null; // only ever right after a piece, below
    if (take) {
      current = dealt[next++];
      if (how === BAGS) {
        if (!left.length) left = [...BAG];
        body.push([left.indexOf(current), 1, left.length]);
        left.splice(left.indexOf(current), 1);
      } else if (how === NAMED) {
        body.push([current, 1, 8]);
      }
    }
    if (LETTERS[current] !== ev.type) return null;
    if (canHold) putFlag(body, held[holdHint(matrix, current, hold)], ev.kind === "hold");
    else if (ev.kind === "hold") return null;
    if (ev.kind === "hold") {
      take = !hold;
      [hold, current] = [current, hold];
      canHold = false;
      continue;
    }
    const [x, y] = ev.placed;
    const rot = current === O ? 0 : ev.rot;
    const at = STANDS[current].findIndex(([r, sx]) => r === rot && sx === x);
    if (at < 0) return null;
    const list = tucks(matrix, current);
    const k = list.findIndex(([i, ty]) => i === at && ty === y);
    if (list.length) putFlag(body, tucked, k >= 0);
    if (k >= 0) {
      body.push(pick(tuckShares(list.length), k));
    } else {
      const ways = STANDS[current].length;
      const straight = restY(matrix, current, x, rot) === y;
      const r = straight ? ranked(matrix, current).indexOf(at) : ways;
      body.push(pick(placeShares(ways, ranks), r));
      if (straight) ranks[r]++;
      else if (y < -4 || y > ROWS - 1) return null;
      else body.push([at, 1, ways], [y + 4, 1, ROWS + 4]);
    }
    const before = matrix;
    let cleared;
    [matrix, cleared] = settle(matrix, current, x, y, rot);
    if (current === T && cleared && corners(before, x, y, rot)[0] >= 3) putFlag(body, spun, ev.action.includes("T-Spin"));
    take = true;
    canHold = true;
    // Did garbage rise under it?
    const up = events[n + 1]?.kind === "garbage" ? events[n + 1] : null;
    if (!battle) continue;
    if (n + 1 < count) putFlag(body, rose[cleared ? 1 : 0], !!up);
    if (up) {
      n++;
      const holes = up.holes;
      if (!holes.length || holes.length > ROW_ODDS.length || holes.some((h) => !(h >= 0 && h < COLS))) return null;
      body.push(pick(rowShares(sizes), holes.length - 1));
      sizes[holes.length - 1]++;
      holes.forEach((h, i) => {
        if (i) putFlag(body, moved, h !== holes[i - 1]);
        if (i && h === holes[i - 1]) return;
        // A new hole, never where the one before it was (the engine moves it),
        // though a cancelled batch can bring the old place back.
        const prev = i ? holes[i - 1] : lastHole;
        if (i) body.push([h - (h > prev ? 1 : 0), 1, COLS - 1]);
        else body.push(prev < 0 ? [h, 1, COLS] : pick(Array.from({ length: COLS }, (_, c) => (c === prev ? 1 : 8)), h));
      });
      lastHole = holes.at(-1);
      matrix = rise(matrix, holes);
    }
    // Did the floor rise?
    if (!rising) continue;
    since++;
    const lift = events[n + 1]?.kind === "floor" ? events[n + 1] : null;
    if (n + 1 < count) putFlag(body, floorUp[floorContext(since, gap)], !!lift);
    if (!lift) continue;
    n++;
    if (!(lift.rows >= 1 && lift.rows <= ROWS)) return null;
    for (let i = 1; i < Math.min(lift.rows + 1, ROWS); i++) putFlag(body, more, i < lift.rows);
    matrix = raise(matrix, lift.rows);
    gap = since;
    since = 0;
  }
  const scored = events.filter((e) => e.kind === "place" && e.optimal > 0);
  const finesse = mode.finesse ?? finesseScore(scored.filter((e) => !e.finesseFault).length, scored.length);
  const top = [
    [battle ? (rising ? RISING : BATTLE) : SPRINT, 16],
    ...(battle ? [] : [[Math.min(1023, mode.lines || 0), 1024]]),
    [count, 4096],
    // A Battle's time to the hundredth, a Sprint's to the thousandth.
    battle ? [Math.min(2 ** 19 - 1, Math.round(events.at(-1).t * 100)), 2 ** 19] : [Math.min(2 ** 22 - 1, Math.round(events.at(-1).t * 1000)), 2 ** 22],
    [Math.min(100, finesse), 101],
    [how, 3],
    ...(how === SEED ? [[+seed, 2 ** 31]] : []),
  ].map(([which, of]) => [which, 1, of]);
  const sides = seats.flatMap(([who, handicap]) => [[who, 1, SEATS], pick(HANDICAP_ODDS, handicap + 3)]);
  return toText([...top, ...sides, ...body]);
}

function unpackTight(packed) {
  try {
    const get = reader(packed);
    const version = get(16);
    if (version !== BATTLE && version !== SPRINT && version !== RISING) return null;
    const battle = version !== SPRINT;
    const rising = version === RISING;
    const floorUp = [flag(), flag(), flag(), flag()];
    const more = flag();
    let since = 0;
    let gap = -1;
    const goal = battle ? 0 : get(1024);
    const count = get(4096);
    const end = battle ? get(2 ** 19) * 10 : get(2 ** 22);
    const finesse = get(101);
    const how = get(3);
    const seed = how === SEED ? get(2 ** 31) : null;
    const deal = how === SEED ? pieceOrder(seed) : null;
    const seats = battle ? [0, 1].map(() => [get(SEATS), get.of(HANDICAP_ODDS) - 3]) : null;
    const held = [flag(), flag(), flag(), flag()];
    const tucked = flag();
  const ranks = new Array(34).fill(0);
    const spun = flag();
    const rose = [flag(), flag()];
    const moved = flag();
    const sizes = new Array(ROW_ODDS.length).fill(0);
    const lines = [];
    let matrix = emptyBoard();
    let combo = 0;
    let left = [];
    let current = 0;
    let hold = 0;
    let take = true;
    let canHold = true;
    let lastHole = -1;
    const line = (n, what) => lines.push(`#${String(n + 1).padStart(2, "0")} [${((end * (n + 1)) / count / 1000).toFixed(3)}s] ${what}`);
    for (let n = 0; n < count; n++) {
      if (take) {
        if (deal) current = deal();
        else if (how === BAGS) {
          if (!left.length) left = [...BAG];
          current = left.splice(get(left.length), 1)[0];
        } else current = get(8);
      }
      if (!current) return null;
      if (canHold && getFlag(get, held[holdHint(matrix, current, hold)])) {
        line(n, `${LETTERS[current]} hold`);
        take = !hold;
        [hold, current] = [current, hold];
        canHold = false;
        continue;
      }
      const stands = STANDS[current];
      let at, y;
      const list = tucks(matrix, current);
      if (list.length && getFlag(get, tucked)) {
        [at, y] = list[get.of(tuckShares(list.length))];
      } else {
        const r = get.of(placeShares(stands.length, ranks));
        if (r < stands.length) {
          ranks[r]++;
          at = ranked(matrix, current)[r];
          y = restY(matrix, current, stands[at][1], stands[at][0]);
          if (y === null) return null;
        } else [at, y] = [get(stands.length), get(ROWS + 4) - 4];
      }
      const [rot, x] = stands[at];
      const before = matrix;
      let cleared;
      [matrix, cleared] = settle(matrix, current, x, y, rot);
      const [filled, front] = current === T && cleared ? corners(before, x, y, rot) : [0, false];
      const spin = filled >= 3 && getFlag(get, spun);
      combo = cleared ? combo + 1 : 0;
      const name = cleared ? (spin ? `T-Spin ${front ? "" : "Mini "}${LINES[cleared]}` : LINES[cleared]) : "";
      const words = [name + (combo > 1 ? ` Combo ${combo - 1}` : ""), cleared && matrix.every((row) => row[0] === FLOOR || row.every((v) => !v)) ? "PC" : ""].filter(Boolean).join(" ");
      line(n, `${LETTERS[current]} spawn(3,-1) → placed(${x},${y}) rot=${rot} | keys=0${words ? ` | ${words}` : ""}`);
      take = true;
      canHold = true;
      if (!battle) continue;
      if (n + 1 < count && getFlag(get, rose[cleared ? 1 : 0])) {
        n++;
        const holes = [];
        const size = get.of(rowShares(sizes));
        sizes[size]++;
        for (let i = size; i >= 0; i--) {
          const prev = holes.length ? holes.at(-1) : lastHole;
          if (holes.length && !getFlag(get, moved)) holes.push(prev);
          else if (holes.length) {
            const h = get(COLS - 1);
            holes.push(h >= prev ? h + 1 : h);
          } else holes.push(prev < 0 ? get(COLS) : get.of(Array.from({ length: COLS }, (_, c) => (c === prev ? 1 : 8))));
        }
        lastHole = holes.at(-1);
        matrix = rise(matrix, holes);
        line(n, `garbage +${holes.length} holes=[${holes.join(",")}]`);
      }
      if (!rising) continue;
      since++;
      if (n + 1 >= count || !getFlag(get, floorUp[floorContext(since, gap)])) continue;
      n++;
      let rows = 1;
      while (rows < ROWS && getFlag(get, more)) rows++;
      matrix = raise(matrix, rows);
      line(n, `floor +${rows}`);
      gap = since;
      since = 0;
    }
    const title = battle ? `BATTLE ${seatText(seats[0])} vs ${seatText(seats[1])}` : `SPRINT ${goal}L`;
    return [`${title} | FNS:${finesse}${deal ? ` | SEED:${seed}` : ""}`, "", ...lines].join("\n");
  } catch {
    return null;
  }
}

// Log text → the packed run, or null when it is not a run this can hold: a
// Sprint, or one board of a Battle.
export function packRun(text) {
  const events = parseLog(text);
  const mode = logMode(text, events);
  return packTight(text, events, mode);
}
// The packed run → a log the replay reads like any other, or null.
export const unpackRun = (packed) => unpackSprint(packed) ?? unpackTight(packed);

// A link that opens this run, short enough for a QR code; null when the run
// cannot be packed this way. In capitals throughout (a site's name reads the
// same either way), which is what lets a QR code pack it tightly.
export function runLink(text) {
  const packed = packRun(text);
  return packed ? `${location.origin.toUpperCase()}${RUN_PATH}${packed}` : null;
}
// The run a link like that names, from the page's path; null when it is not one.
export const runInPath = (path) => (path.toUpperCase().startsWith(RUN_PATH) ? path.slice(RUN_PATH.length).toUpperCase() : null);
