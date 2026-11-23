// ─── Battle CPU backed by a WebAssembly bot (Cold Clear or MisaMino) ───
// The bot thinks in a Web Worker; the moves are then played on the engine one
// input at a time, so the opponent visibly moves its pieces. Level sets how
// hard the bot thinks and how fast it plays (pieces per second).
import { readEngine, applyMove } from "./play.js";
import { findBestPlacement } from "../cpu.js";

export const BOT_LEVELS = {
  easy: { pps: 0.9, moveMs: 70, misa: 2, cc: 200 },
  normal: { pps: 1.6, moveMs: 45, misa: 5, cc: 1000 },
  hard: { pps: 2.6, moveMs: 28, misa: 8, cc: 4000 },
  max: { pps: 5, moveMs: 10, misa: 10, cc: 12000 },
};

let worker = null;
let nextId = 1;
const pending = new Map();
function ask(bot, state, opts) {
  if (!worker) {
    worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const cb = pending.get(e.data.id);
      pending.delete(e.data.id);
      cb?.(e.data);
    };
  }
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    worker.postMessage({ id, bot, state, opts });
  });
}

export class BotPlayer {
  constructor(engine, bot = "cc", level = "normal") {
    this.engine = engine;
    this.bot = bot;
    this.p = BOT_LEVELS[level] || BOT_LEVELS.normal;
    this.plan = null; // remaining inputs for the current piece
    this.waiting = false;
    this.pieceKey = null;
    this.lastDropAt = 0;
    this.lastMoveAt = 0;
    this.alive = true;
    // Called just before a hard drop, when the piece is where it will fall
    // from (a watcher of the piece's path would otherwise miss the last move).
    this.onStep = null;
  }

  dispose() {
    this.alive = false;
  }

  // Called every frame after engine.update().
  update(now) {
    const e = this.engine;
    if (!e.playing || !e.currentId || e.gameOver) return;
    // Hold the piece at its spawn while the bot thinks or plays it, so the
    // plan (made from the spawn position) stays valid.
    if (this.waiting || this.plan) e.gravityTimer = 0;

    const key = e.placedBlocks + ":" + (e.hold ?? "-");
    if (!this.plan && !this.waiting && this.pieceKey !== key) {
      this.pieceKey = key;
      this.waiting = true;
      const opts = this.bot === "misa" ? { level: this.p.misa } : { nodes: this.p.cc };
      ask(this.bot, readEngine(e), opts).then(({ moves }) => {
        if (!this.alive) return;
        this.waiting = false;
        this.plan = moves || this.fallback();
      });
      return;
    }
    if (!this.plan) return;
    // Pace: a new piece starts no sooner than 1/pps after the last drop.
    if (now - this.lastDropAt < 1000 / this.p.pps) return;
    if (now - this.lastMoveAt < this.p.moveMs) return;
    const ch = this.plan[0];
    this.plan = this.plan.slice(1);
    this.lastMoveAt = now;
    if (ch === "V" || !this.plan) {
      if (ch !== "V") applyMove(e, ch);
      this.onStep?.();
      e.hardDrop();
      this.plan = null;
      this.lastDropAt = now;
      return;
    }
    applyMove(e, ch);
  }

  // If a bot gives no answer, place the piece with the built-in heuristic.
  fallback() {
    const e = this.engine;
    const best = findBestPlacement(e.liveMatrix(), e.currentId);
    if (!best) return "V";
    let s = best.rot === 1 ? "c" : best.rot === 3 ? "z" : best.rot === 2 ? "cc" : "";
    const dx = best.x - e.currentX;
    s += (dx > 0 ? "r" : "l").repeat(Math.abs(dx));
    return s + "V";
  }
}
