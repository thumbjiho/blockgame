// ─── The rank of a run ───
// The three scores (0–100 each, macro counted twice) are brought together
// into points out of 130, so the letters have room at the top: S starts where
// a near-flawless run sits, and SS and SSS are there to chase.
export const RANK_MAX = 130;

// [lowest points, letter, title]. A to D span 20 points each, in three steps
// (+, plain, −); the S ranks and E have no steps.
const LETTERS = [
  [125, "SSS", "Beyond perfect"],
  [118, "SS", "Flawless"],
  [110, "S", "Outstanding"],
  [90, "A", "Polished"],
  [70, "B", "Solid"],
  [50, "C", "Decent"],
  [30, "D", "On the rise"],
  [0, "E", "Getting there"],
];
const STEPPED = "ABCD";

export const pointsOf = (scores) => Math.round(((2 * scores.macro + scores.dexterity + scores.finesse) / 4) * (RANK_MAX / 100));

export function rankOf(points) {
  const [min, letter, title] = LETTERS.find(([low]) => points >= low);
  const step = !STEPPED.includes(letter) ? "" : points >= min + 14 ? "+" : points < min + 7 ? "−" : "";
  return { letter, step, title };
}

// Every rank there is, best first, each with the fewest points that earn it.
export const ALL_RANKS = LETTERS.flatMap(([min, letter, title]) =>
  STEPPED.includes(letter)
    ? [
        { letter, step: "+", title, min: min + 14 },
        { letter, step: "", title, min: min + 7 },
        { letter, step: "−", title, min },
      ]
    : [{ letter, step: "", title, min }],
);
