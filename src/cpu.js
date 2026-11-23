// ─── CPU AI ───
// Heuristic: enumerate every (rotation, x) for the current piece, simulate the
// drop on a copy of the board, score the result with a Dellacherie-style
// weighted sum, and pick the highest. Same algorithm at every difficulty —
// difficulties differ only in playback speed and a per-decision noise rate.

import { COLS, ROWS, getShape } from "./game.js";

function collidesAt(matrix, shape, x, y) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const mx = x + c;
      const my = y + r;
      if (mx < 0 || mx >= COLS || my >= ROWS) return true;
      if (my >= 0 && matrix[my][mx] !== 0) return true;
    }
  }
  return false;
}

function placeShape(matrix, shape, x, y, id) {
  const out = matrix.map((row) => row.slice());
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const mx = x + c;
      const my = y + r;
      if (my < 0) return null;
      out[my][mx] = id;
    }
  }
  return out;
}

function clearLines(matrix) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (matrix[r].every((v) => v !== 0)) {
      matrix.splice(r, 1);
      matrix.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  return cleared;
}

function evaluate(matrix, linesCleared, landingHeight) {
  const heights = new Array(COLS).fill(0);
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (matrix[r][c] !== 0) {
        heights[c] = ROWS - r;
        break;
      }
    }
  }
  let agg = 0;
  for (const h of heights) agg += h;

  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let blocked = false;
    for (let r = 0; r < ROWS; r++) {
      if (matrix[r][c] !== 0) blocked = true;
      else if (blocked) holes++;
    }
  }

  let bumpiness = 0;
  for (let c = 0; c < COLS - 1; c++) {
    bumpiness += Math.abs(heights[c] - heights[c + 1]);
  }

  let wells = 0;
  for (let c = 0; c < COLS; c++) {
    const left = c === 0 ? ROWS : heights[c - 1];
    const right = c === COLS - 1 ? ROWS : heights[c + 1];
    const wellDepth = Math.min(left, right) - heights[c];
    if (wellDepth > 0) wells += wellDepth;
  }

  return (
    agg * -0.51 +
    linesCleared * 1.5 +
    holes * -2.2 +
    bumpiness * -0.18 +
    landingHeight * -0.25 +
    wells * -0.15
  );
}

// For a given matrix and piece, find the best placement (rot, x).
export function findBestPlacement(matrix, pieceId) {
  let best = null;
  let bestScore = -Infinity;
  const numRot = pieceId === 7 ? 1 : pieceId === 1 || pieceId === 5 || pieceId === 6 ? 2 : 4;

  for (let rot = 0; rot < numRot; rot++) {
    const shape = getShape(pieceId, rot);
    for (let x = -2; x <= COLS; x++) {
      // Drop from above
      let y = -2;
      if (collidesAt(matrix, shape, x, y)) continue;
      while (!collidesAt(matrix, shape, x, y + 1)) y++;

      const placed = placeShape(matrix, shape, x, y, pieceId);
      if (!placed) continue;

      const cleared = clearLines(placed);
      const landingHeight = ROWS - y;
      const score = evaluate(placed, cleared, landingHeight);
      if (score > bestScore) {
        bestScore = score;
        best = { rot, x, y, score, cleared };
      }
    }
  }
  return best;
}

const DIFFICULTY_PARAMS = {
  easy: { thinkMs: 700, moveMs: 220, mistake: 0.30 },
  normal: { thinkMs: 280, moveMs: 90, mistake: 0.06 },
  hard: { thinkMs: 90, moveMs: 25, mistake: 0 },
};

export class CPUPlayer {
  constructor(engine, difficulty = "normal") {
    this.engine = engine;
    this.params = DIFFICULTY_PARAMS[difficulty] || DIFFICULTY_PARAMS.normal;
    this.target = null;
    this.lastMoveAt = 0;
    this.thinkAt = 0;
    this.lastPieceId = -1;
  }

  // Called every frame.
  update(now) {
    const e = this.engine;
    if (!e.playing || !e.currentId || e.gameOver) return;

    if (this.lastPieceId !== e.currentId || !this.target) {
      this.lastPieceId = e.currentId;
      if (this.target == null) {
        if (now < this.thinkAt) return;
      }
      const best = findBestPlacement(e.liveMatrix(), e.currentId);
      if (!best) return;
      // Inject noise on Easy: shift the target column by ±1..2 sometimes.
      if (Math.random() < this.params.mistake) {
        const shift = (Math.random() < 0.5 ? -1 : 1) * (1 + (Math.random() < 0.3 ? 1 : 0));
        best.x = Math.max(-2, Math.min(COLS, best.x + shift));
      }
      this.target = best;
      this.lastMoveAt = now;
      return;
    }

    if (now - this.lastMoveAt < this.params.moveMs) return;

    // Step 1: rotate to target rotation
    if (e.currentRot !== this.target.rot) {
      const need = (this.target.rot - e.currentRot + 4) % 4;
      if (need === 1) e.rotate(1);
      else if (need === 3) e.rotate(-1);
      else e.rotate(2);
      this.lastMoveAt = now;
      return;
    }

    // Step 2: shift to target x
    if (e.currentX !== this.target.x) {
      const dir = this.target.x > e.currentX ? 1 : -1;
      e.move(dir);
      this.lastMoveAt = now;
      return;
    }

    // Step 3: hard drop
    e.hardDrop();
    this.target = null;
    this.thinkAt = now + this.params.thinkMs;
  }
}
