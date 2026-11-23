// The game itself: one board, one falling piece, time. Knows nothing of React.
import { COLS, ROWS, EMPTY, FLOOR, PIECE_NAMES, SPAWNS, getShape } from "./pieces.js";
import { computeFinesseOptimal, computeHeights, countHoles } from "./placement.js";
import { getKicks } from "./srs.js";
import { ATTACK_TABLE, COMBO_TABLE } from "./rules.js";
import { mulberry32, sevenBag, awkwardStart } from "./deal.js";

const createMatrix = () =>
  Array.from({ length: ROWS }, () => new Array(COLS).fill(EMPTY));

export class BlockEngine {
  constructor(settings = {}) {
    this.das = settings.das ?? 133;
    this.arr = settings.arr ?? 10;
    this.sdf = settings.sdf ?? 30;
    this.sprintLines = settings.sprintLines ?? 40;
    this.attackBonus = settings.attackBonus ?? 0;
    this.seed = settings.seed;
    // Opening practice: fixed piece order consumed before random bags, and a
    // hook that can reject a placement before it locks in.
    this.sequence = settings.sequence ? settings.sequence.slice() : null;
    // Incoming garbage waits this long (seconds of play) before it can rise,
    // like the "charging" garbage in TETR.IO: you get a moment to clear and
    // cancel it, and only garbage that is ready comes up on your next drop.
    this.garbageDelay = settings.garbageDelay ?? 0.5;
    // Battle's rising floor: from `start` seconds on, a solid row that never
    // clears comes up from the bottom every `every` seconds, so a long match
    // has to end. null: the floor stays where it is.
    this.floorRule = settings.floor ?? null;
    this.validatePlacement = null;

    this.reset();
  }

  reset() {
    this.matrix = createMatrix();
    // A fixed seed gives a repeatable piece order (Battle: both boards share it).
    const seed = this.seed ?? Date.now() + Math.floor(Math.random() * 1e9);
    this.rng = mulberry32(seed);
    // The seed the pieces really came from (null when some were given).
    this.orderSeed = this.sequence ? null : seed >>> 0;
    this.bag = [];
    this.queue = [];
    this.pendingSeq = this.sequence ? this.sequence.slice() : [];
    this.fillQueue();

    // No game opens on S, Z or O (see awkwardStart): deal again. This holds in
    // every mode that deals its own pieces.
    let attempts = 0;
    while (!this.sequence && this.isBannedStart() && attempts < 1000) {
      this.rng = mulberry32(seed + ++attempts * 7919);
      this.orderSeed = (seed + attempts * 7919) >>> 0;
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
    this.gravity = 1000;
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
    this.outgoingAttack = 0; // attack to be sent this turn (after self-cancel)
    this.garbageQueue = []; // [{ amount, holeCol, readyAt }]
    this.lastGarbageHoleCol = -1;
    this.floor = 0; // solid rows at the bottom
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
    this.dasActive = 0;

    this.softDropping = false;
  }

  fillQueue() {
    while (this.queue.length < 6) {
      if (this.pendingSeq && this.pendingSeq.length) {
        this.queue.push(this.pendingSeq.shift());
        continue;
      }
      if (this.bag.length === 0) this.bag = sevenBag(this.rng);
      this.queue.push(this.bag.shift());
    }
  }

  isBannedStart() {
    return awkwardStart(this.queue);
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

    let front;
    switch (rot) {
      case 0:
        front = [corners[0], corners[1]];
        break;
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

    if (this.validatePlacement) {
      const cells = [];
      for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
          if (shape[r][c]) cells.push([this.currentY + r, this.currentX + c]);
      if (!this.validatePlacement(cells, this.currentId, this)) {
        // Undo the write and send the same piece back to its spawn.
        for (const [r, c] of cells)
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) this.matrix[r][c] = EMPTY;
        this.rejected = { cells, id: this.currentId, at: this.clock };
        this.respawnCurrent();
        return;
      }
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

    // Battle: cancel incoming with this turn's attack, dump remainder if no clear.
    // Battle handicap: every attack sends this many lines more (or fewer).
    let outgoing = this.lastAttack > 0 ? Math.max(0, this.lastAttack + this.attackBonus) : 0;
    while (outgoing > 0 && this.garbageQueue.length > 0) {
      const head = this.garbageQueue[0];
      if (head.amount <= outgoing) {
        outgoing -= head.amount;
        this.garbageQueue.shift();
      } else {
        head.amount -= outgoing;
        outgoing = 0;
      }
    }
    // Accumulate until the battle loop collects it (several pieces can lock
    // between two frames, e.g. hard drops from key events).
    this.outgoingAttack += outgoing;
    try {
      const heights = computeHeights(this.liveMatrix());
      const holes = countHoles(this.liveMatrix());
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

    // Garbage comes up after the piece is recorded, so the log keeps the order
    // things happened in: the placement, then the rows that rose under it.
    if (this.lastAttack === 0 && this.garbageQueue.length > 0) {
      this.applyGarbage();
      if (this.gameOver) return;
    }
    // The floor comes up last, once all that is in the log.
    if (this.floorRule && this.clock >= this.floorRule.start) {
      const due = Math.floor((this.clock - this.floorRule.start) / this.floorRule.every) + 1;
      if (due > this.floor) {
        this.raiseFloor(due - this.floor);
        if (this.gameOver) return;
      }
    }

    if (this.playing) this.spawn();
  }

  checkLineClears() {
    let cleared = 0;
    let totalCells = 0;

    for (let r = ROWS - 1 - this.floor; r >= 0; r--) {
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
        r++;
      }
    }

    for (let r = 0; r < ROWS - this.floor; r++)
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
        default:
          this.stats.quads++;
          actionName = cleared === 4 ? "Quad" : `${cleared}-Line`;
          attack = ATTACK_TABLE[4];
          if (this.b2b) {
            this.stats.b2bs++;
            attack += ATTACK_TABLE[10];
          } else this.b2b = true;
      }

      if (totalCells === 0) {
        this.stats.pcs++;
        attack = ATTACK_TABLE[9];
        actionName = "Perfect Clear";
      }

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

  respawnCurrent() {
    const id = this.currentId;
    this.currentRot = 0;
    const [sx, sy] = SPAWNS[id];
    this.currentX = sx;
    this.currentY = sy;
    this.spinPossible = false;
    this.spinMini = false;
    this.lockActivated = false;
    this.lockResetCount = 0;
    this.gravityTimer = 0;
    if (this.collides(this.currentX, this.currentY, this.currentRot)) this.currentY--;
    this.updateGhost();
    this._initPieceTracking();
  }

  // held: { left, right, softdrop } → time the key went down, for keys already
  // down when the game starts (held through the countdown). They count from
  // that moment, so DAS is charged for the first piece like for any later one.
  start(held = {}) {
    this.reset();
    this.playing = true;
    this.spawn();
    if (held.left != null) {
      this.pressedLeft = true;
      this.dasLeft = held.left;
    }
    if (held.right != null) {
      this.pressedRight = true;
      this.dasRight = held.right;
    }
    if (held.softdrop != null) this.softDropping = true;
  }

  update(dt, now) {
    if (!this.playing) return;
    this.clock += dt / 1000;

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
      if (now - this.lockActivatedAt >= this.maxLockDelay) {
        this.hardDrop();
      }
    }

    this.processDAS(dt, now);
  }

  processDAS(dt, now) {
    if (this.pressedLeft && this.pressedRight) {
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
        while (this.move(dir)) {
          /* slam to wall instantly when ARR is 0 */
        }
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

  receiveGarbage(amount) {
    if (amount <= 0) return;
    let holeCol;
    do {
      holeCol = Math.floor(Math.random() * COLS);
    } while (holeCol === this.lastGarbageHoleCol && COLS > 1);
    this.lastGarbageHoleCol = holeCol;
    this.garbageQueue.push({ amount, holeCol, readyAt: this.clock + this.garbageDelay });
  }

  // Lines of incoming garbage that are ready / still charging.
  garbageCounts() {
    let ready = 0,
      charging = 0;
    for (const g of this.garbageQueue) {
      if (g.readyAt <= this.clock) ready += g.amount;
      else charging += g.amount;
    }
    return { ready, charging };
  }

  applyGarbage() {
    // Only batches whose delay has passed come up; the rest keep charging.
    const queue = this.garbageQueue.filter((g) => g.readyAt <= this.clock);
    this.garbageQueue = this.garbageQueue.filter((g) => g.readyAt > this.clock);
    if (queue.length === 0) return;

    this.garbageApplied = (this.garbageApplied || 0) + queue.reduce((n, b) => n + b.amount, 0);
    // The rows that actually rose go in the log (hole column of each, bottom
    // row last), so a replay can rebuild the board.
    const holes = [];
    const record = () => holes.length && this.replay.push({ kind: "garbage", holes, t: this.clock });
    for (const batch of queue) {
      for (let i = 0; i < batch.amount; i++) {
        // Checked before the row is taken off: a top out must leave the
        // matrix at full height, or drawing it throws and the board freezes.
        if (this.matrix[0].some((v) => v !== EMPTY)) {
          this.gameOver = true;
          this.playing = false;
          record();
          return;
        }
        this.matrix.shift();
        const row = new Array(COLS).fill(8);
        row[batch.holeCol] = EMPTY;
        // Garbage rises on top of the floor, never under it.
        this.matrix.splice(ROWS - 1 - this.floor, 0, row);
        holes.push(batch.holeCol);
      }
    }
    record();

    if (this.currentId) {
      if (this.collides(this.currentX, this.currentY, this.currentRot)) {
        let push = 0;
        while (
          push < ROWS &&
          this.collides(this.currentX, this.currentY - push, this.currentRot)
        ) {
          push++;
        }
        if (push >= ROWS) {
          this.gameOver = true;
          this.playing = false;
          return;
        }
        this.currentY -= push;
      }
      this.updateGhost();
    }
  }

  // The board above the floor, with empty rows on top in place of the floor's.
  liveMatrix() {
    if (!this.floor) return this.matrix;
    const rows = this.matrix.slice(0, ROWS - this.floor);
    while (rows.length < ROWS) rows.unshift(new Array(COLS).fill(EMPTY));
    return rows;
  }

  // n solid rows come up under the stack; one that pushes a block off the
  // top ends the game, as garbage does.
  raiseFloor(n) {
    let rose = 0;
    for (; rose < n; rose++) {
      if (this.floor >= ROWS || this.matrix[0].some((v) => v !== EMPTY)) {
        this.gameOver = true;
        this.playing = false;
        break;
      }
      this.matrix.shift();
      this.matrix.push(new Array(COLS).fill(FLOOR));
      this.floor++;
    }
    if (rose) this.replay.push({ kind: "floor", rows: rose, t: this.clock });
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
