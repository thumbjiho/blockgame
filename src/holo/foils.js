// Which foil each rank's card gets (the names are that project's card types),
// and the small ways one card differs from the next.
import "./index.css";
import illusion from "./img/illusion.png";
import illusion2 from "./img/illusion2.png";
import geometric from "./img/geometric.png";
import angular from "./img/angular.png";
import wave from "./img/wave.png";
import metal from "./img/metal.png";
import stylish from "./img/stylish.png";
import stylish2 from "./img/stylish2.png";
import ancient from "./img/ancient.png";
import crossover from "./img/crossover.png";
import glitter from "./img/glitter.png";
import grain from "./img/grain.webp";
import illusionMask from "./img/illusion-mask.png";

const PATTERNS = [illusion, illusion2, geometric, angular, wave, metal, stylish, stylish2, ancient, crossover];

// The foils' pictures are only asked for when a card first shows, which made
// the card appear plain and then fill in. This fetches and decodes them ahead
// of that, once, when the browser is idle; the card's own stylesheets then
// find them already in memory.
let warmed = false;
export function preloadFoils() {
  if (warmed || typeof Image === "undefined") return;
  warmed = true;
  const fetchAll = () => {
    for (const src of [...PATTERNS, glitter, grain, illusionMask]) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.decode?.().catch(() => {});
      kept.push(img); // held, so the decoded pictures are not let go before a card needs them
    }
  };
  if (typeof requestIdleCallback === "function") requestIdleCallback(fetchAll, { timeout: 2000 });
  else setTimeout(fetchAll, 300);
}
const kept = [];

// rarity   the foil
// strength how much of it shows (1 is as that project has it)
// pattern  the foil has a pattern laid in it, which differs card to card
const FOILS = {
  SSS: { rarity: "rare shiny vmax", strength: 0.6 },
  SS: { rarity: "rare holo" },
  // S: the same foil as SS, fainter.
  S: { rarity: "rare holo", strength: 0.6 },
  A: { rarity: "rare rainbow", pattern: true },
  B: { rarity: "rare shiny v", pattern: true },
  C: { rarity: "rare secret", pattern: true },
  D: { rarity: "trainer gallery rare holo" },
  E: null,
};

// A number from the card's own contents, so the same run always gets the
// same card and two runs seldom get the same one.
function seedOf(what) {
  const text = [what.letter, what.step, what.title, what.time, what.name, what.vs, ...what.scores.flat()].join("|");
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// What to put on the card: { rarity, card: style for the card, shine: style
// for its shine layer }, or null for a matte card.
export function foilOf(what) {
  const foil = FOILS[what.letter];
  if (!foil) return null;
  const seed = seedOf(what);
  const pick = (n, shift) => (seed >>> shift) % n;
  // Every foil covers the whole card: the windows those stylesheets cut for a
  // trading card's picture and borders are lifted.
  const card = { "--card-opacity": foil.strength ?? 1, "--clip": "none", "--clip-stage": "none", "--clip-trainer": "none", "--clip-borders": "none" };
  // The glitter's grain size, a little different each time.
  card["--glittersize"] = `${22 + pick(9, 3)}%`;
  const shine = {};
  if (foil.pattern) {
    shine["--foil"] = `url(${PATTERNS[pick(PATTERNS.length, 8)]})`;
    shine["--imgsize"] = `${26 + pick(5, 14) * 4}%`;
  }
  return { rarity: foil.rarity, card, shine };
}
