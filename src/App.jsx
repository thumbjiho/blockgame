import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───
const COLS = 10,
  ROWS = 20,
  CELL = 28;
const EMPTY = 0;

// Piece definitions: id, name, color, spawn, rotations (4x4 or 3x3 grids), SRS kicks
const COLORS = {
  1: "#00f0f0", // I - cyan
  2: "#a000f0", // T - purple
  3: "#f0a000", // L - orange
  4: "#0000f0", // J - blue
  5: "#00f000", // S - green
  6: "#f00000", // Z - red
  7: "#f0f000", // O - yellow
  8: "#999999", // garbage
  9: "#444444", // solid/dead
};

const PIECE_NAMES = {
  1: "I",
  2: "T",
  3: "L",
  4: "J",
  5: "S",
  6: "Z",
  7: "O",
};

// Shapes: each piece has 4 rotation states
const SHAPES = {
  1: [
    // I
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  2: [
    // T
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  3: [
    // L
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  4: [
    // J
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  5: [
    // S
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  6: [
    // Z
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  7: [
    // O
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
};

// Spawn positions (x, y) - from Jstris source
const SPAWNS = {
  1: [3, -1],
  2: [3, -1],
  3: [3, -1],
  4: [3, -1],
  5: [3, -1],
  6: [3, -1],
  7: [3, -1],
};

// SRS wall kick data - from Jstris/Guideline
// kicks[fromRot][direction] = [[dx, dy], ...]
const KICKS_JLSTZ = {
  0: {
    1: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    "-1": [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
      [-1, 0],
      [-2, 0],
      [-1, 1],
      [-2, 1],
      [0, -1],
      [3, 0],
      [-3, 0],
    ],
  },
  1: {
    1: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    "-1": [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
      [-1, 0],
      [-2, 0],
      [-1, 1],
      [-2, 1],
      [0, -1],
      [3, 0],
      [-3, 0],
    ],
  },
  2: {
    1: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    "-1": [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
      [-1, 0],
      [-2, 0],
      [-1, 1],
      [-2, 1],
      [0, -1],
      [3, 0],
      [-3, 0],
    ],
  },
  3: {
    1: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    "-1": [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
      [-1, 0],
      [-2, 0],
      [-1, 1],
      [-2, 1],
      [0, -1],
      [3, 0],
      [-3, 0],
    ],
  },
};
const KICKS_I = {
  0: {
    1: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    "-1": [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ],
  },
  1: {
    1: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    "-1": [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
  },
  2: {
    1: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    "-1": [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    2: [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
  },
  3: {
    1: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    "-1": [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ],
  },
};

// Attack table from Jstris: [0, 0, 1, 2, 4, 4, 6, 2, 0, 10, 1]
// index: 0=unused, 1=single, 2=double, 3=triple, 4=quad, 5=TSD, 6=TST, 7=TSS, 8=mini, 9=PC, 10=b2b bonus
const ATTACK_TABLE = [0, 0, 1, 2, 4, 4, 6, 2, 0, 10, 1];
const COMBO_TABLE = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];

// ─── HELPERS ───
const createMatrix = () =>
  Array.from({ length: ROWS }, () => new Array(COLS).fill(EMPTY));

function sevenBag(rng) {
  const bag = [1, 2, 3, 4, 5, 6, 7];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Simple seedable PRNG (mulberry32)
function mulberry32(seed) {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function getKicks(pieceId) {
  return pieceId === 1 ? KICKS_I : KICKS_JLSTZ;
}

function getShape(id, rot) {
  return SHAPES[id][rot];
}
function shapeSize(id) {
  return SHAPES[id][0].length;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}

// ─── GAME ENGINE ───
class BlockEngine {
  constructor(settings = {}) {
    this.das = settings.das ?? 133;
    this.arr = settings.arr ?? 10;
    this.sdf = settings.sdf ?? 30; // soft drop factor (cells/sec like multiplier)
    this.sprintLines = settings.sprintLines ?? 40;

    this.reset();
  }

  reset() {
    this.matrix = createMatrix();
    this.rng = mulberry32(Date.now());
    this.bag = [];
    this.queue = [];
    this.fillQueue();

    // Jstris: reject banned start sequences (S/Z/O as first pieces in Sprint)
    let attempts = 0;
    while (this.isBannedStart() && attempts < 1000) {
      this.rng = mulberry32(Date.now() + ++attempts * 7919);
      this.bag = [];
      this.queue = [];
      this.fillQueue();
    }

    this.current = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentRot = 0;
    this.currentId = 0;

    this.hold = null;
    this.holdUsed = false;
    this.ghostY = 0;

    this.playing = false;
    this.gameOver = false;
    this.completed = false;

    this.clock = 0;
    this.gravity = 1000; // ms per cell
    this.gravityTimer = 0;
    this.lockDelay = 500;
    this.maxLockDelay = 5000;
    this.lockTimer = 0;
    this.lockActivated = false;
    this.lockActivatedAt = 0;
    this.lockResetCount = 0;
    this.maxLockResets = 15;

    this.lines = 0;
    this.linesRemaining = this.sprintLines;
    this.placedBlocks = 0;
    this.replay = [];
    this.currentSpawnPos = [0, 0];
    this.currentSpawnId = 0;
    this.currentPieceKeys = 0;

    this.combo = -1;
    this.b2b = false;
    this.wasB2b = false;
    this.spinPossible = false;
    this.spinMini = false;
    this.tspinType = 0;

    this.lastAction = "";
    this.lastAttack = 0;
    this.totalAttack = 0;
    this.stats = {
      singles: 0,
      doubles: 0,
      triples: 0,
      quads: 0,
      tspins: 0,
      pcs: 0,
      maxCombo: 0,
      b2bs: 0,
      finesse: 0,
      keyPresses: 0,
    };

    // DAS/ARR state
    this.pressedLeft = false;
    this.pressedRight = false;
    this.dasLeft = 0;
    this.dasRight = 0;
    this.arrTimer = 0;
    this.dasActive = 0; // -1 left, 1 right, 0 none

    this.softDropping = false;
  }

  fillQueue() {
    while (this.queue.length < 6) {
      if (this.bag.length === 0) this.bag = sevenBag(this.rng);
      this.queue.push(this.bag.shift());
    }
  }

  // Jstris isBannedStartSequence (exact match):
  // Jstris IDs: I=0, O=1, T=2, L=3, J=4, S=5, Z=6
  // Our IDs:    I=1, T=2, L=3, J=4, S=5, Z=6, O=7
  // "id >= 5" in Jstris = S(5) and Z(6) only (NOT O, which is 1)
  // Sprint: ban if first piece is S/Z, OR first is O and second is S/Z
  // Other (non-Ultra): ban if first TWO are both S/Z
  isBannedStart() {
    if (this.queue.length < 2) return false;
    const a = this.queue[0],
      b = this.queue[1];
    const isSZ = (id) => id === 5 || id === 6; // S or Z
    // Sprint mode: first is S/Z, or first is O(7) and second is S/Z
    return isSZ(a) || (a === 7 && isSZ(b));
  }

  spawn() {
    const id = this.queue.shift();
    this.fillQueue();
    this.currentId = id;
    this.currentRot = 0;
    const [sx, sy] = SPAWNS[id];
    this.currentX = sx;
    this.currentY = sy;
    this.spinPossible = false;
    this.spinMini = false;
    this.lockActivated = false;
    this.lockResetCount = 0;
    this.gravityTimer = 0;

    // Check if spawn is blocked (game over)
    if (
      this.collides(this.currentX, this.currentY, this.currentRot)
    ) {
      this.currentY--;
      if (
        this.collides(this.currentX, this.currentY, this.currentRot)
      ) {
        this.gameOver = true;
        this.playing = false;
        return;
      }
    }
    this.updateGhost();
    this._initPieceTracking();
  }

  _initPieceTracking() {
    this.currentSpawnPos = [this.currentX, this.currentY];
    this.currentSpawnId = this.currentId;
    this.currentPieceKeys = 0;
  }

  collides(x, y, rot) {
    const shape = getShape(this.currentId, rot);
    const size = shape.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (shape[r][c]) {
          const mx = x + c;
          const my = y + r;
          if (mx < 0 || mx >= COLS || my >= ROWS) return true;
          if (my >= 0 && this.matrix[my][mx] !== EMPTY) return true;
        }
      }
    }
    return false;
  }

  updateGhost() {
    let gy = this.currentY;
    while (!this.collides(this.currentX, gy + 1, this.currentRot))
      gy++;
    this.ghostY = gy;
  }

  move(dir) {
    if (
      !this.collides(
        this.currentX + dir,
        this.currentY,
        this.currentRot,
      )
    ) {
      this.currentX += dir;
      this.spinPossible = false;
      this.updateGhost();
      if (this.lockActivated) {
        if (this.lockResetCount < this.maxLockResets) {
          this.lockTimer = 0;
          this.lockResetCount++;
        }
      }
      return true;
    }
    return false;
  }

  rotate(dir) {
    // dir: 1=CW, -1=CCW, 2=180
    const kicks = getKicks(this.currentId);
    const fromRot = this.currentRot;
    let toRot;
    if (dir === 2) {
      toRot = (fromRot + 2) % 4;
    } else {
      toRot = (((fromRot + dir) % 4) + 4) % 4;
    }
    const dirKey = dir === 2 ? "2" : dir === 1 ? "1" : "-1";
    const kickList = kicks[fromRot]?.[dirKey];
    if (!kickList) return false;

    for (const [dx, dy] of kickList) {
      if (
        !this.collides(this.currentX + dx, this.currentY - dy, toRot)
      ) {
        this.currentX += dx;
        this.currentY -= dy;
        this.currentRot = toRot;
        this.spinPossible = true;
        if (dy > 0) {
          this.lockActivated = false;
          this.gravityTimer = 0;
        }
        this.updateGhost();
        if (this.lockActivated) {
          if (this.lockResetCount < this.maxLockResets) {
            this.lockTimer = 0;
            this.lockResetCount++;
          }
        }
        // T-spin detection
        if (this.currentId === 2) this.checkTSpin();
        return true;
      }
    }
    return false;
  }

  checkTSpin() {
    const x = this.currentX,
      y = this.currentY;
    const rot = this.currentRot;
    const occupied = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
      return this.matrix[r]?.[c] > 0;
    };
    // Check 4 corners of T piece (relative to 3x3 grid, center at x+1, y+1)
    const corners = [
      occupied(y, x),
      occupied(y, x + 2),
      occupied(y + 2, x),
      occupied(y + 2, x + 2),
    ];
    const total = corners.filter(Boolean).length;
    if (total < 3) {
      this.spinPossible = false;
      this.spinMini = false;
      return;
    }

    // Front corners based on rotation
    let front;
    switch (rot) {
      case 0:
        front = [corners[0], corners[1]];
        break; // top-left, top-right
      case 1:
        front = [corners[1], corners[3]];
        break;
      case 2:
        front = [corners[2], corners[3]];
        break;
      case 3:
        front = [corners[0], corners[2]];
        break;
      default:
        front = [false, false];
    }
    const frontCount = front.filter(Boolean).length;
    if (frontCount === 2) {
      this.spinPossible = true;
      this.spinMini = false;
    } else {
      this.spinPossible = true;
      this.spinMini = true;
    }
  }

  softDrop() {
    if (
      !this.collides(
        this.currentX,
        this.currentY + 1,
        this.currentRot,
      )
    ) {
      this.currentY++;
      this.spinPossible = false;
      this.updateGhost();
      this.gravityTimer = 0;
      return true;
    }
    return false;
  }

  hardDrop() {
    const dropDist = this.ghostY - this.currentY;
    this.currentY = this.ghostY;
    if (this.spinPossible && dropDist > 0) this.spinPossible = false;
    this.lock();
  }

  lock() {
    const shape = getShape(this.currentId, this.currentRot);
    const size = shape.length;
    let aboveField = 0,
      totalCells = 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (shape[r][c]) {
          totalCells++;
          const my = this.currentY + r;
          const mx = this.currentX + c;
          if (my >= 0 && my < ROWS && mx >= 0 && mx < COLS) {
            this.matrix[my][mx] = this.currentId;
          } else {
            aboveField++;
          }
        }
      }
    }

    if (aboveField === totalCells) {
      this.gameOver = true;
      this.playing = false;
      return;
    }

    this.placedBlocks++;
    this.holdUsed = false;

    const placedX = this.currentX;
    const placedY = this.currentY;
    const placedRot = this.currentRot;
    const spawnPos = this.currentSpawnPos;
    const pieceType = PIECE_NAMES[this.currentSpawnId];
    const keys = this.currentPieceKeys;
    const wasB2bBefore = this.b2b;

    this.checkLineClears();

    try {
      const heights = computeHeights(this.matrix);
      const holes = countHoles(this.matrix);
      const isPC = heights.every((h) => h === 0);
      let optimal = -1;
      try {
        optimal = computeFinesseOptimal(
          this.currentSpawnId,
          spawnPos[0],
          placedX,
          placedRot,
        );
      } catch (e) {
        console.error("[finesse] compute failed:", e);
      }
      this.replay.push({
        kind: "place",
        type: pieceType,
        spawn: spawnPos,
        placed: [placedX, placedY],
        rot: placedRot,
        keys,
        optimal,
        finesseFault: optimal > 0 ? Math.max(0, keys - optimal) : 0,
        action: this.lastAction || "",
        b2b: this.b2b && wasB2bBefore,
        pc: isPC,
        heights,
        holes,
        t: this.clock,
      });
    } catch (e) {
      console.error("[replay] record failed:", e);
    }

    if (this.playing) this.spawn();
  }

  checkLineClears() {
    let cleared = 0;
    let totalCells = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
      let full = true;
      for (let c = 0; c < COLS; c++) {
        if (this.matrix[r][c] === EMPTY) {
          full = false;
          break;
        }
      }
      if (full) {
        this.matrix.splice(r, 1);
        this.matrix.unshift(new Array(COLS).fill(EMPTY));
        cleared++;
        r++; // recheck same row
      }
    }

    // Count remaining cells for PC check
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (this.matrix[r][c] !== EMPTY) totalCells++;

    this.wasB2b = this.b2b;
    let attack = 0;
    let actionName = "";

    if (cleared > 0) {
      this.lines += cleared;

      switch (cleared) {
        case 1:
          this.stats.singles++;
          if (this.spinPossible && this.currentId === 2) {
            if (this.spinMini) {
              actionName = "T-Spin Mini Single";
              attack = ATTACK_TABLE[8];
              if (this.b2b) {
                this.stats.b2bs++;
                attack += ATTACK_TABLE[10];
              } else this.b2b = true;
            } else {
              actionName = "T-Spin Single";
              this.stats.tspins++;
              attack = ATTACK_TABLE[7];
              if (this.b2b) {
                this.stats.b2bs++;
                attack += ATTACK_TABLE[10];
              } else this.b2b = true;
            }
          } else {
            actionName = "Single";
            attack = ATTACK_TABLE[1];
            this.b2b = false;
          }
          break;
        case 2:
          this.stats.doubles++;
          if (this.spinPossible && this.currentId === 2) {
            actionName = "T-Spin Double";
            this.stats.tspins++;
            attack = ATTACK_TABLE[5];
            if (this.b2b) {
              this.stats.b2bs++;
              attack += ATTACK_TABLE[10];
            } else this.b2b = true;
          } else {
            actionName = "Double";
            attack = ATTACK_TABLE[2];
            this.b2b = false;
          }
          break;
        case 3:
          this.stats.triples++;
          if (this.spinPossible && this.currentId === 2) {
            actionName = "T-Spin Triple";
            this.stats.tspins++;
            attack = ATTACK_TABLE[6];
            if (this.b2b) {
              this.stats.b2bs++;
              attack += ATTACK_TABLE[10];
            } else this.b2b = true;
          } else {
            actionName = "Triple";
            attack = ATTACK_TABLE[3];
            this.b2b = false;
          }
          break;
        default: // 4+
          this.stats.quads++;
          actionName = cleared === 4 ? "Quad" : `${cleared}-Line`;
          attack = ATTACK_TABLE[4];
          if (this.b2b) {
            this.stats.b2bs++;
            attack += ATTACK_TABLE[10];
          } else this.b2b = true;
      }

      // Perfect Clear
      if (totalCells === 0) {
        this.stats.pcs++;
        attack = ATTACK_TABLE[9];
        actionName = "Perfect Clear";
      }

      // Combo
      this.combo++;
      if (this.combo > 0) {
        const comboAtk =
          COMBO_TABLE[Math.min(this.combo, COMBO_TABLE.length - 1)];
        attack += comboAtk;
      }
      if (this.combo > this.stats.maxCombo)
        this.stats.maxCombo = this.combo;

      this.lastAttack = attack;
      this.totalAttack += attack;
      this.lastAction =
        actionName +
        (this.wasB2b && this.b2b ? " (B2B)" : "") +
        (this.combo > 0 ? ` Combo ${this.combo}` : "");

      // Sprint line countdown
      this.linesRemaining = Math.max(
        0,
        this.linesRemaining - cleared,
      );
      if (this.linesRemaining === 0) {
        this.completed = true;
        this.playing = false;
      }
    } else {
      this.combo = -1;
      this.lastAction = "";
      this.lastAttack = 0;
      this.spinPossible = false;
    }
  }

  holdPiece() {
    if (this.holdUsed) return;
    this.replay.push({
      kind: "hold",
      type: PIECE_NAMES[this.currentId],
      t: this.clock,
    });
    this.holdUsed = true;
    this.lockActivated = false;
    this.spinPossible = false;
    if (this.hold === null) {
      this.hold = this.currentId;
      this.spawn();
    } else {
      const tmp = this.hold;
      this.hold = this.currentId;
      this.currentId = tmp;
      this.currentRot = 0;
      const [sx, sy] = SPAWNS[tmp];
      this.currentX = sx;
      this.currentY = sy;
      if (
        this.collides(this.currentX, this.currentY, this.currentRot)
      ) {
        this.currentY--;
      }
      this.updateGhost();
      this._initPieceTracking();
    }
  }

  start() {
    this.reset();
    this.playing = true;
    this.spawn();
  }

  update(dt, now) {
    if (!this.playing) return;
    this.clock += dt / 1000;

    // Gravity
    this.gravityTimer += dt;
    const grav = this.softDropping
      ? Math.min(this.gravity, 1000 / this.sdf)
      : this.gravity;
    while (this.gravityTimer >= grav) {
      this.gravityTimer -= grav;
      if (
        !this.collides(
          this.currentX,
          this.currentY + 1,
          this.currentRot,
        )
      ) {
        this.currentY++;
        this.spinPossible = false;
        this.updateGhost();
      } else {
        if (!this.lockActivated) {
          this.lockActivated = true;
          this.lockActivatedAt = now;
          this.lockTimer = 0;
        }
        break;
      }
    }

    // Lock delay
    if (this.lockActivated) {
      this.lockTimer += dt;
      if (this.lockTimer >= this.lockDelay) {
        if (
          this.collides(
            this.currentX,
            this.currentY + 1,
            this.currentRot,
          )
        ) {
          this.hardDrop();
        } else {
          this.lockActivated = false;
        }
      }
      // Max lock delay
      if (now - this.lockActivatedAt >= this.maxLockDelay) {
        this.hardDrop();
      }
    }

    // DAS/ARR
    this.processDAS(dt, now);
  }

  processDAS(dt, now) {
    if (this.pressedLeft && this.pressedRight) {
      // Both pressed: most recent wins
      if (this.dasLeft > this.dasRight) {
        this.doDAS(-1, dt, now);
      } else {
        this.doDAS(1, dt, now);
      }
    } else if (this.pressedLeft) {
      this.doDAS(-1, dt, now);
    } else if (this.pressedRight) {
      this.doDAS(1, dt, now);
    }
  }

  doDAS(dir, dt, now) {
    const dasTime = dir === -1 ? this.dasLeft : this.dasRight;
    const elapsed = now - dasTime;
    if (elapsed >= this.das) {
      if (this.arr === 0) {
        // Instant DAS
        while (this.move(dir)) {}
      } else {
        this.arrTimer += dt;
        while (this.arrTimer >= this.arr) {
          this.arrTimer -= this.arr;
          if (!this.move(dir)) break;
        }
      }
    }
  }

  onKeyDown(key, now) {
    if (!this.playing) return;
    if (
      key === "left" ||
      key === "right" ||
      key === "softdrop" ||
      key === "harddrop" ||
      key === "rotateCW" ||
      key === "rotateCCW" ||
      key === "rotate180"
    ) {
      this.currentPieceKeys++;
    }
    switch (key) {
      case "left":
        if (!this.pressedLeft) {
          this.pressedLeft = true;
          this.dasLeft = now;
          this.arrTimer = 0;
          this.move(-1);
        }
        break;
      case "right":
        if (!this.pressedRight) {
          this.pressedRight = true;
          this.dasRight = now;
          this.arrTimer = 0;
          this.move(1);
        }
        break;
      case "softdrop":
        this.softDropping = true;
        this.softDrop();
        break;
      case "harddrop":
        this.hardDrop();
        break;
      case "rotateCW":
        this.rotate(1);
        break;
      case "rotateCCW":
        this.rotate(-1);
        break;
      case "rotate180":
        this.rotate(2);
        break;
      case "hold":
        this.holdPiece();
        break;
    }
  }

  onKeyUp(key) {
    switch (key) {
      case "left":
        this.pressedLeft = false;
        break;
      case "right":
        this.pressedRight = false;
        break;
      case "softdrop":
        this.softDropping = false;
        break;
    }
  }
}

// ─── RENDERER HELPERS ───
function pieceXBounds(pieceId, rot) {
  const shape = getShape(pieceId, rot);
  let minC = Infinity,
    maxC = -Infinity;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  return { leftX: -minC, rightX: COLS - 1 - maxC };
}

function computeFinesseOptimal(pieceId, spawnX, placedX, placedRot) {
  const isO = pieceId === 7;
  const goalRot = isO ? 0 : placedRot;
  const visited = new Set();
  const startKey = `${spawnX},0`;
  visited.add(startKey);
  let frontier = [{ x: spawnX, r: 0 }];
  let cost = 0;
  while (frontier.length && cost < 20) {
    const next = [];
    for (const cur of frontier) {
      const curR = isO ? 0 : cur.r;
      if (cur.x === placedX && curR === goalRot) {
        return cost + 1;
      }
      const { leftX, rightX } = pieceXBounds(pieceId, cur.r);
      const candidates = [];
      if (cur.x - 1 >= leftX)
        candidates.push({ x: cur.x - 1, r: cur.r });
      if (cur.x + 1 <= rightX)
        candidates.push({ x: cur.x + 1, r: cur.r });
      if (cur.x !== leftX) candidates.push({ x: leftX, r: cur.r });
      if (cur.x !== rightX) candidates.push({ x: rightX, r: cur.r });
      for (const dr of [1, 3, 2]) {
        const nr = (cur.r + dr) % 4;
        const b = pieceXBounds(pieceId, nr);
        let nx = cur.x;
        if (nx < b.leftX) nx = b.leftX;
        if (nx > b.rightX) nx = b.rightX;
        candidates.push({ x: nx, r: nr });
      }
      for (const n of candidates) {
        const key = `${n.x},${isO ? 0 : n.r}`;
        if (!visited.has(key)) {
          visited.add(key);
          next.push(n);
        }
      }
    }
    frontier = next;
    cost++;
  }
  return -1;
}

function computeHeights(matrix) {
  const heights = new Array(COLS).fill(0);
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (matrix[r][c] !== EMPTY) {
        heights[c] = ROWS - r;
        break;
      }
    }
  }
  return heights;
}

function countHoles(matrix) {
  let holes = 0;
  for (let c = 0; c < COLS; c++) {
    let foundBlock = false;
    for (let r = 0; r < ROWS; r++) {
      if (matrix[r][c] !== EMPTY) foundBlock = true;
      else if (foundBlock) holes++;
    }
  }
  return holes;
}

function buildReplayText(engine, settings, summary) {
  const { das, arr, sprintLines } = settings;
  const lines = [];
  const time = summary.time.toFixed(3);
  const timeStr = formatTime(summary.time);
  lines.push(
    `SPRINT ${sprintLines}L | ${timeStr} (${time}s) | ${summary.blocks} blocks | ${summary.pps.toFixed(2)} PPS | DAS:${das} ARR:${arr}`,
  );
  lines.push("");

  let pieceNum = 0;
  for (const ev of engine.replay) {
    const ts = `[${ev.t.toFixed(3)}s]`;
    if (ev.kind === "hold") {
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

function drawBlock(ctx, x, y, colorId, alpha = 1, isGhost = false) {
  const color = COLORS[colorId] || "#333";
  const px = x * CELL;
  const py = y * CELL;
  if (isGhost) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3);
    ctx.globalAlpha = 1;
    return;
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, CELL, CELL);
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(px, py, CELL, 2);
  ctx.fillRect(px, py, 2, CELL);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(px, py + CELL - 2, CELL, 2);
  ctx.fillRect(px + CELL - 2, py, 2, CELL);
  // Inner border
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
  ctx.globalAlpha = 1;
}

function drawMiniBlock(ctx, x, y, colorId, size = 14) {
  const color = COLORS[colorId] || "#333";
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x, y, size, 1);
  ctx.fillRect(x, y, 1, size);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}

function drawPiecePreview(ctx, id, ox, oy, cellSize = 14) {
  const shape = getShape(id, 0);
  const size = shape.length;
  // Center offset
  const filled = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (shape[r][c]) filled.push([r, c]);
  const minR = Math.min(...filled.map((f) => f[0]));
  const maxR = Math.max(...filled.map((f) => f[0]));
  const minC = Math.min(...filled.map((f) => f[1]));
  const maxC = Math.max(...filled.map((f) => f[1]));
  const h = maxR - minR + 1;
  const w = maxC - minC + 1;
  const offX =
    ox + (4 * cellSize - w * cellSize) / 2 - minC * cellSize;
  const offY =
    oy + (2 * cellSize - h * cellSize) / 2 - minR * cellSize;

  for (const [r, c] of filled) {
    drawMiniBlock(
      ctx,
      offX + c * cellSize,
      offY + r * cellSize,
      id,
      cellSize,
    );
  }
}

// ─── KEY BINDINGS ───
const DEFAULT_KEYS = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "softdrop",
  " ": "harddrop",
  x: "rotateCW",
  X: "rotateCW",
  ㅌ: "rotateCW",
  ArrowUp: "rotateCW",
  z: "rotateCCW",
  Z: "rotateCCW",
  ㅋ: "rotateCCW",
  a: "rotate180",
  A: "rotate180",
  ㅁ: "rotate180",
  c: "hold",
  C: "hold",
  ㅊ: "hold",
  Shift: "hold",
};

// ─── REACT COMPONENT ───
export default function BlockSprint() {
  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const keysRef = useRef(DEFAULT_KEYS);

  const [gameState, setGameState] = useState("menu"); // menu, playing, paused, completed, gameover
  const [displayTime, setDisplayTime] = useState("0:00.000");
  const [displayLines, setDisplayLines] = useState(40);
  const [displayPPS, setDisplayPPS] = useState("0.00");
  const [displayAction, setDisplayAction] = useState("");
  const [actionKey, setActionKey] = useState(0);
  const [displayAttack, setDisplayAttack] = useState(0);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  // Settings
  const [das, setDas] = useState(133);
  const [arr, setArr] = useState(10);
  const [sdf, setSdf] = useState(30);
  const [sprintLines, setSprintLines] = useState(40);
  const [showSettings, setShowSettings] = useState(false);

  const engineUpdate = useRef(null);

  const render = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // Main canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL + 0.5);
      ctx.lineTo(COLS * CELL, r * CELL + 0.5);
      ctx.stroke();
    }
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL + 0.5, 0);
      ctx.lineTo(c * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    // Plus markers at intersections
    ctx.strokeStyle = "#222";
    for (let r = 1; r < ROWS; r++) {
      for (let c = 1; c < COLS; c++) {
        const cx = c * CELL,
          cy = r * CELL;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 0.5);
        ctx.lineTo(cx + 3, cy + 0.5);
        ctx.moveTo(cx + 0.5, cy - 3);
        ctx.lineTo(cx + 0.5, cy + 3);
        ctx.stroke();
      }
    }

    // Matrix
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (engine.matrix[r][c] !== EMPTY) {
          drawBlock(ctx, c, r, engine.matrix[r][c]);
        }
      }
    }

    if (
      engine.currentId &&
      (engine.playing || engine.completed || engine.gameOver)
    ) {
      // Ghost piece
      const shape = getShape(engine.currentId, engine.currentRot);
      const size = shape.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shape[r][c]) {
            const gy = engine.ghostY + r;
            if (gy >= 0)
              drawBlock(
                ctx,
                engine.currentX + c,
                gy,
                engine.currentId,
                1,
                true,
              );
          }
        }
      }

      // Active piece
      if (engine.playing) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (shape[r][c]) {
              const py = engine.currentY + r;
              if (py >= 0)
                drawBlock(
                  ctx,
                  engine.currentX + c,
                  py,
                  engine.currentId,
                );
            }
          }
        }
      }
    }

    // Border
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, COLS * CELL - 2, ROWS * CELL - 2);

    // Hold canvas
    const hCanvas = holdRef.current;
    if (hCanvas) {
      const hctx = hCanvas.getContext("2d");
      hctx.clearRect(0, 0, hCanvas.width, hCanvas.height);
      if (engine.hold !== null) {
        drawPiecePreview(hctx, engine.hold, 4, 6, 16);
      }
    }

    // Queue canvas
    const qCanvas = queueRef.current;
    if (qCanvas) {
      const qctx = qCanvas.getContext("2d");
      qctx.clearRect(0, 0, qCanvas.width, qCanvas.height);
      for (let i = 0; i < Math.min(5, engine.queue.length); i++) {
        drawPiecePreview(qctx, engine.queue[i], 4, 6 + i * 50, 16);
      }
    }
  }, []);

  const gameLoop = useCallback(
    (timestamp) => {
      const engine = engineRef.current;
      if (!engine) {
        render();
        return;
      }
      if (engine.completed && gameState !== "completed") {
        setGameState("completed");
        const pps =
          engine.clock > 0
            ? (engine.placedBlocks / engine.clock).toFixed(2)
            : "0.00";
        setStats({
          ...engine.stats,
          time: engine.clock,
          pps: parseFloat(pps),
          lines: engine.lines,
          attack: engine.totalAttack,
          blocks: engine.placedBlocks,
          replayText: buildReplayText(
            engine,
            { das, arr, sprintLines },
            {
              time: engine.clock,
              pps: parseFloat(pps),
              blocks: engine.placedBlocks,
            },
          ),
        });
        render();
        return;
      }
      if (engine.gameOver && gameState !== "gameover") {
        setGameState("gameover");
        const pps =
          engine.clock > 0
            ? (engine.placedBlocks / engine.clock).toFixed(2)
            : "0.00";
        setStats({
          ...engine.stats,
          time: engine.clock,
          pps: parseFloat(pps),
          lines: engine.lines,
          attack: engine.totalAttack,
          blocks: engine.placedBlocks,
          replayText: buildReplayText(
            engine,
            { das, arr, sprintLines },
            {
              time: engine.clock,
              pps: parseFloat(pps),
              blocks: engine.placedBlocks,
            },
          ),
        });
        render();
        return;
      }
      if (!engine.playing) {
        render();
        return;
      }

      const dt = lastTimeRef.current
        ? timestamp - lastTimeRef.current
        : 16;
      lastTimeRef.current = timestamp;

      engine.update(Math.min(dt, 100), performance.now());

      // Update display state periodically
      setDisplayTime(formatTime(engine.clock));
      setDisplayLines(engine.linesRemaining);
      const pps =
        engine.clock > 0
          ? (engine.placedBlocks / engine.clock).toFixed(2)
          : "0.00";
      setDisplayPPS(pps);
      setDisplayAction(engine.lastAction);
      setActionKey((k) => k + 1);
      setDisplayAttack(engine.totalAttack);

      if (engine.completed) {
        setGameState("completed");
        setStats({
          ...engine.stats,
          time: engine.clock,
          pps: parseFloat(pps),
          lines: engine.lines,
          attack: engine.totalAttack,
          blocks: engine.placedBlocks,
        });
        render();
        return;
      }
      if (engine.gameOver) {
        setGameState("gameover");
        setStats({
          ...engine.stats,
          time: engine.clock,
          pps: parseFloat(pps),
          lines: engine.lines,
          attack: engine.totalAttack,
          blocks: engine.placedBlocks,
        });
        render();
        return;
      }

      render();
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [render],
  );

  const startGame = useCallback(() => {
    const engine = new BlockEngine({ das, arr, sdf, sprintLines });
    engineRef.current = engine;
    engine.start();
    setGameState("playing");
    setDisplayAction("");
    setDisplayAttack(0);
    setStats(null);
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [das, arr, sdf, sprintLines, gameLoop]);

  // Key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const action = keysRef.current[e.key];

      if (e.key === "f" || e.key === "F" || e.key === "ㄹ") {
        if (
          gameState === "playing" ||
          gameState === "gameover" ||
          gameState === "completed"
        ) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          startGame();
          return;
        }
      }
      if (e.key === "c" || e.key === "C" || e.key === "ㅊ") {
        if (
          (gameState === "completed" || gameState === "gameover") &&
          stats?.replayText
        ) {
          navigator.clipboard
            .writeText(stats.replayText)
            .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => console.error("Copy failed:", err));
          return;
        }
      }
      if (e.key === "Escape") {
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (
          gameState === "playing" ||
          gameState === "gameover" ||
          gameState === "completed"
        ) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setGameState("menu");
          return;
        }
      }
      if (e.key === "Enter" && gameState === "menu") {
        startGame();
        return;
      }

      if (!action || gameState !== "playing") return;
      e.preventDefault();
      engineRef.current?.onKeyDown(action, performance.now());
    };
    const handleKeyUp = (e) => {
      const action = keysRef.current[e.key];
      if (!action) return;
      engineRef.current?.onKeyUp(action);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame, showSettings, stats]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const sprintOptions = [1, 20, 40, 100, 1000];

  return (
    <div
      style={{
        background: "#0d0d0d",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        color: "#e0e0e0",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Subtle grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 24,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 4,
          color: "#00f0f0",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        SPRINT
      </div>

      {gameState === "menu" ? (
        <div style={{ textAlign: "center", zIndex: 10 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -2,
              marginBottom: 8,
              color: "#fff",
            }}
          >
            JBL <span style={{ color: "#00f0f0" }}>SPRINT</span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 40,
              letterSpacing: 2,
            }}
          >
JOJO'S BLOCKGAME LABORATORY
          </div>

          {/* Sprint mode selector */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {sprintOptions.map((n) => (
              <button
                key={n}
                onClick={() => setSprintLines(n)}
                style={{
                  padding: "8px 20px",
                  border: "1px solid",
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  borderColor: sprintLines === n ? "#00f0f0" : "#333",
                  background:
                    sprintLines === n
                      ? "rgba(0,240,240,0.1)"
                      : "transparent",
                  color: sprintLines === n ? "#00f0f0" : "#888",
                  transition: "all 0.15s",
                }}
              >
                {n}L
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              padding: "14px 56px",
              background: "#00f0f0",
              color: "#000",
              border: "none",
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: 2,
              transition: "all 0.15s",
            }}
          >
            START
          </button>
          <div style={{ fontSize: 11, color: "#555", marginTop: 12 }}>
            or press ENTER
          </div>

          <button
            onClick={() => setShowSettings((s) => !s)}
            style={{
              marginTop: 32,
              padding: "8px 24px",
              background: "transparent",
              border: "1px solid #333",
              color: "#888",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            {showSettings ? "CLOSE" : "SETTINGS"}
          </button>

          {showSettings && (
            <div
              style={{
                marginTop: 16,
                padding: 24,
                border: "1px solid #222",
                background: "#111",
                textAlign: "left",
                display: "inline-block",
                minWidth: 280,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#888",
                    letterSpacing: 1,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  DAS (ms)
                </label>
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={das}
                  onChange={(e) => setDas(+e.target.value)}
                  style={{ width: "100%", accentColor: "#00f0f0" }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: "#00f0f0",
                    float: "right",
                  }}
                >
                  {das}
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#888",
                    letterSpacing: 1,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  ARR (ms)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={arr}
                  onChange={(e) => setArr(+e.target.value)}
                  style={{ width: "100%", accentColor: "#00f0f0" }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: "#00f0f0",
                    float: "right",
                  }}
                >
                  {arr}
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#888",
                    letterSpacing: 1,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  SDF (soft drop speed)
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={sdf}
                  onChange={(e) => setSdf(+e.target.value)}
                  style={{ width: "100%", accentColor: "#00f0f0" }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: "#00f0f0",
                    float: "right",
                  }}
                >
                  {sdf === 100 ? "INF" : sdf}
                </span>
              </div>
              <div
                style={{ fontSize: 10, color: "#555", marginTop: 12 }}
              >
                Controls: Arrow keys move/drop, X=CW, Z=CCW, A=180,
                C/Shift=Hold, Space=Hard Drop, F=Restart
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            zIndex: 10,
          }}
        >
          {/* Left panel: Hold + Stats */}
          <div style={{ width: 90, textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 4,
              }}
            >
              HOLD
            </div>
            <canvas
              ref={holdRef}
              width={80}
              height={48}
              style={{
                border: "1px solid #222",
                background: "#0a0a0a",
                display: "block",
                margin: "0 auto 16px",
              }}
            />

            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 2,
              }}
            >
              TIME
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              {displayTime}
            </div>

            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 2,
              }}
            >
              LINES
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 12,
                color:
                  displayLines <= 10
                    ? "#f0a000"
                    : displayLines <= 5
                      ? "#f00"
                      : "#00f0f0",
              }}
            >
              {displayLines}
            </div>

            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 2,
              }}
            >
              PPS
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#aaa",
                marginBottom: 12,
              }}
            >
              {displayPPS}
            </div>

            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 2,
              }}
            >
              ATK
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#f0a000",
              }}
            >
              {displayAttack}
            </div>
          </div>

          {/* Main board */}
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              style={{ display: "block", border: "2px solid #333" }}
            />

            {/* Action text overlay */}
            {displayAction && (
              <div
                key={actionKey}
                style={{
                  position: "absolute",
                  top: 40,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  textShadow:
                    "0 0 12px rgba(0,240,240,0.8), 0 2px 4px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                  animation: "fadeUp 1s ease-out forwards",
                }}
              >
                {displayAction}
              </div>
            )}

            {/* Completed overlay */}
            {gameState === "completed" && stats && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.85)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#00f0f0",
                    marginBottom: 8,
                  }}
                >
                  SPRINT CLEAR
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 20,
                  }}
                >
                  {formatTime(stats.time)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    lineHeight: 2,
                    textAlign: "center",
                  }}
                >
                  <span style={{ color: "#aaa" }}>
                    {stats.blocks} blocks
                  </span>{" "}
                  &middot;{" "}
                  <span style={{ color: "#f0a000" }}>
                    {stats.pps.toFixed(2)} PPS
                  </span>{" "}
                  &middot;{" "}
                  <span style={{ color: "#00f0f0" }}>
                    {stats.attack} ATK
                  </span>
                  <br />
                  Quads: {stats.quads} &middot; T-Spins:{" "}
                  {stats.tspins} &middot; PCs: {stats.pcs}
                  <br />
                  Max Combo: {stats.maxCombo} &middot; B2Bs:{" "}
                  {stats.b2bs}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      if (rafRef.current)
                        cancelAnimationFrame(rafRef.current);
                      startGame();
                    }}
                    style={{
                      padding: "10px 28px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#000",
                      background: "#00f0f0",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      letterSpacing: 1.5,
                      boxShadow: "0 0 16px rgba(0,240,240,0.4)",
                    }}
                  >
                    NEW GAME
                  </button>
                  {stats.replayText && (
                    <button
                      title="Copy replay"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            stats.replayText,
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (e) {
                          console.error("Copy failed:", e);
                        }
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: copied ? "#000" : "#888",
                        background: copied
                          ? "#00f0f0"
                          : "transparent",
                        border: "1px solid #444",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {copied ? "✓" : "⧉"}
                    </button>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 11,
                    color: "#555",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  F = new game
                  <br />
                  C = copy
                  <br />
                  ESC = menu
                </div>
              </div>
            )}

            {/* Game over overlay */}
            {gameState === "gameover" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.85)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#f00",
                    marginBottom: 16,
                  }}
                >
                  TOP OUT
                </div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  {engineRef.current?.lines || 0} lines in{" "}
                  {formatTime(engineRef.current?.clock || 0)}
                </div>
                {stats?.replayText && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          stats.replayText,
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (e) {
                        console.error("Copy failed:", e);
                      }
                    }}
                    style={{
                      marginTop: 16,
                      padding: "8px 18px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: copied ? "#000" : "#00f0f0",
                      background: copied ? "#00f0f0" : "transparent",
                      border: "1px solid #00f0f0",
                      borderRadius: 4,
                      cursor: "pointer",
                      letterSpacing: 1,
                    }}
                  >
                    {copied ? "COPIED!" : "COPY REPLAY"}
                  </button>
                )}
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 11,
                    color: "#555",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  F = new game
                  <br />
                  C = copy
                  <br />
                  ESC = menu
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Queue */}
          <div style={{ width: 90, textAlign: "center" }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 4,
              }}
            >
              NEXT
            </div>
            <canvas
              ref={queueRef}
              width={80}
              height={260}
              style={{
                border: "1px solid #222",
                background: "#0a0a0a",
                display: "block",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                marginTop: 16,
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                marginBottom: 2,
              }}
            >
              DAS/ARR
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {das}/{arr}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        input[type=range] {
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: #333;
          outline: none;
          border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #00f0f0;
          cursor: pointer;
        }
        button:hover { opacity: 0.85; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
