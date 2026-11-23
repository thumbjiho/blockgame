// The board's size and the seven pieces: colours, names, shapes, where they enter.
export const COLS = 10,
  ROWS = 20,
  CELL = 28;
export const EMPTY = 0;
// A row of the rising floor (Battle): solid, and never cleared.
export const FLOOR = 9;
// Rows of floor at the bottom of a board.
export const floorOf = (matrix) => {
  let n = 0;
  while (n < matrix.length && matrix[matrix.length - 1 - n][0] === FLOOR) n++;
  return n;
};

export const COLORS = {
  1: "#41b6e6", // I - cyan
  2: "#b14fd0", // T - purple
  3: "#f2913d", // L - orange
  4: "#3d6fe0", // J - blue
  5: "#5cc45c", // S - green
  6: "#e8505b", // Z - red
  7: "#f2cb4c", // O - yellow
  8: "#5a5a5a", // garbage
  9: "#333333", // solid/dead
};

export const PIECE_NAMES = {
  1: "I",
  2: "T",
  3: "L",
  4: "J",
  5: "S",
  6: "Z",
  7: "O",
};

// Each piece in its spawn state, as rows of its box (three wide; I and O four).
// The other three states are the box turned clockwise, which is how SRS
// defines them. O does not turn.
const BOXES = {
  1: ["....", "IIII", "....", "...."],
  2: [".T.", "TTT", "..."],
  3: ["..L", "LLL", "..."],
  4: ["J..", "JJJ", "..."],
  5: [".SS", "SS.", "..."],
  6: ["ZZ.", ".ZZ", "..."],
  7: [".OO.", ".OO.", "....", "...."],
};
const clockwise = (m) => m.map((_, r) => m.map((__, c) => m[m.length - 1 - c][r]));
const SHAPES = {};
for (const [id, rows] of Object.entries(BOXES)) {
  let state = rows.map((row) => [...row].map((ch) => (ch === "." ? 0 : 1)));
  SHAPES[id] = [];
  for (let rot = 0; rot < 4; rot++) {
    SHAPES[id].push(state);
    if (+id !== 7) state = clockwise(state);
  }
}
export function getShape(id, rot) {
  return SHAPES[id][rot];
}

// Spawn positions (x, y), as the Guideline asks: flat side down, the three-wide
// pieces in columns 4 to 6, I and O in the middle, starting above the board.
export const SPAWNS = {
  1: [3, -1],
  2: [3, -1],
  3: [3, -1],
  4: [3, -1],
  5: [3, -1],
  6: [3, -1],
  7: [3, -1],
};
