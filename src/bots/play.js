// ─── Bot glue: read a BlockEngine for the bots, and play their moves back ───
// Both bots answer with the same little move language:
//   l r  one step left / right      L R  slide to the wall
//   z c  rotate ccw / cw            x    rotate 180
//   d    one row down               D    drop to the floor (no lock)
//   h v  hold                       V    hard drop (implied at the end)
import { COLS, ROWS, PIECE_NAMES } from "../game.js";

export function readEngine(engine) {
  // The board above the rising floor: a bot would take the floor's full rows
  // for lines it can clear.
  const matrix = engine.liveMatrix ? engine.liveMatrix() : engine.matrix;
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    let s = "";
    for (let c = 0; c < COLS; c++) s += matrix[r][c] ? "1" : "0";
    rows.push(s);
  }
  const { ready = 0, charging = 0 } = engine.garbageCounts ? engine.garbageCounts() : {};
  return {
    rows, // top to bottom
    cur: PIECE_NAMES[engine.currentId] || "",
    queue: engine.queue.slice(0, 5).map((id) => PIECE_NAMES[id]).join(""),
    hold: engine.hold ? PIECE_NAMES[engine.hold] : "",
    canHold: !engine.holdUsed,
    b2b: !!engine.b2b,
    combo: Math.max(0, engine.combo + 1),
    incoming: ready + charging,
  };
}

// One input. Returns false if the engine refused it (the plan is off).
export function applyMove(engine, ch) {
  switch (ch) {
    case "l": return engine.move(-1);
    case "r": return engine.move(1);
    case "L": while (engine.move(-1)); return true;
    case "R": while (engine.move(1)); return true;
    case "z": return engine.rotate(-1) !== false;
    case "c": return engine.rotate(1) !== false;
    case "x": return engine.rotate(2) !== false;
    case "d": return engine.softDrop();
    case "D": while (engine.softDrop()); return true;
    case "h":
    case "v": engine.holdPiece(); return true;
    case "V": engine.hardDrop(); return true;
    default: return true;
  }
}
