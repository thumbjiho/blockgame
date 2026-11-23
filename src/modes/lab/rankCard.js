// The run's rank as a picture to keep or post: a card in the proportions of a
// trading card (1080 × 1504, 0.718 wide to tall)
// drawn on a canvas and handed over as a PNG. Laid out like a gift card: a
// field of the rank's colours, a glass panel on it, the seal in the middle.
import { foilTextures } from "../../holo/foils.js";
import { qr } from "../../qr.js";

const W = 1080;
const H = 1504;
// Per letter: the seal's colours (as replay.css draws them), then the three
// colours of the field behind.
const THEMES = {
  SSS: { seal: ["#ff7ab6", "#ffd75e", "#6fe3a1", "#5fb8ff", "#b98cff"], field: ["#ff5fa8", "#5f8dff", "#ffcf5e"] },
  SS: { seal: ["#f6c945", "#fff6d6", "#e3a53f", "#fff1b8"], field: ["#f6c945", "#b0711c", "#fff1b8"] },
  S: { seal: ["#e3bf3f"], field: ["#e3bf3f", "#7a5a12", "#f3dc8a"] },
  A: { seal: ["#5cc45c"], field: ["#5cc45c", "#12604a", "#b6efb0"] },
  B: { seal: ["#41b6e6"], field: ["#41b6e6", "#1f4fa8", "#a8e4ff"] },
  C: { seal: ["#a66bd6"], field: ["#a66bd6", "#4a2f9a", "#e0c2ff"] },
  D: { seal: ["#e8903a"], field: ["#e8903a", "#8a3a16", "#ffd3a6"] },
  E: { seal: ["#e8505b"], field: ["#e8505b", "#7a1f3a", "#ffb3b8"] },
};

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// what: { letter, step, title, scores: [[label, value]], name, mode, vs, date,
// time } — time is a finished Sprint's, and then it is the largest line.
export function drawRankCard({ letter, step, title, scores, name, mode, vs, date, time, link }, { baked = false, textures = null } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const font = getComputedStyle(document.body).fontFamily;
  const { seal, field } = THEMES[letter];
  const fancy = seal.length > 1;
  const text = (s, x, y, size, weight, color, align = "center") => {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
  };

  // The field: a dark base with three soft pools of the rank's colours.
  ctx.fillStyle = "#08080b";
  ctx.fillRect(0, 0, W, H);
  [
    [W * 0.18, H * 0.12, 760, field[0], 0.55],
    [W * 0.92, H * 0.42, 700, field[1], 0.6],
    [W * 0.3, H * 1.02, 760, field[2], 0.32],
  ].forEach(([x, y, r, color, a]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color + Math.round(a * 255).toString(16).padStart(2, "0"));
    g.addColorStop(1, color + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });

  // The glass panel.
  const m = 64;
  rounded(ctx, m, m, W - 2 * m, H - 2 * m, 56);
  ctx.fillStyle = "rgba(10, 10, 14, 0.52)";
  ctx.fill();
  const edge = ctx.createLinearGradient(m, m, W - m, H - m);
  edge.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  edge.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  edge.addColorStop(1, "rgba(255, 255, 255, 0.28)");
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
  // A sheen across the top of the glass.
  ctx.save();
  rounded(ctx, m, m, W - 2 * m, H - 2 * m, 56);
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, m, 0, m + 420);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.10)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(m, m, W - 2 * m, 420);
  ctx.restore();

  if (baked) bakeFoil(ctx, letter, m, textures);

  ctx.textBaseline = "middle";
  text("szo.umjo.me", m + 56, m + 78, 34, 700, "#ffffff", "left");
  if (date) text(date, W - m - 56, m + 78, 30, 500, "rgba(255, 255, 255, 0.6)", "right");

  // The seal: a ring (turning colours for SS and SSS), a dark face, the letter.
  const cx = W / 2;
  const cy = 530;
  const r = 200;
  const ring = () => {
    if (!fancy) return seal[0];
    const g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
    seal.forEach((c, i) => g.addColorStop(i / seal.length, c));
    g.addColorStop(1, seal[0]);
    return g;
  };
  ctx.save();
  ctx.shadowColor = seal[0];
  ctx.shadowBlur = letter.startsWith("S") ? 90 : 40;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0a0d";
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = ring();
  ctx.lineWidth = fancy ? 16 : 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // The letter: one colour, or left to right through the seal's colours as on the page.
  const size = 170;
  ctx.font = `800 ${size}px ${font}`;
  const lw = ctx.measureText(letter).width;
  ctx.font = `800 ${size * 0.62}px ${font}`;
  const sw = step ? ctx.measureText(step).width + 8 : 0;
  const left = cx - (lw + sw) / 2;
  let ink = seal[0];
  if (fancy) {
    ink = ctx.createLinearGradient(left, 0, left + lw, 0);
    seal.forEach((c, i) => ink.addColorStop(i / (seal.length - 1), c));
  }
  text(letter, left, cy + size * 0.04, size, 800, ink, "left");
  if (step) text(step, left + lw + 8, cy, size * 0.62, 800, seal[0], "left");

  if (time) {
    text(title.toUpperCase(), cx, 846, 44, 600, "rgba(255, 255, 255, 0.72)");
    text(time, cx, 940, 96, 800, "#ffffff");
  } else {
    text(title.toUpperCase(), cx, 880, 66, 700, "#ffffff");
  }
  // The QR code: the run itself where it packs small enough (link), and the
  // site's address otherwise. A run's code has more in it, so its tile is
  // larger, to keep each square big enough for a camera; the scores then sit
  // a little higher to clear it.
  const code = (link && qr(link)) || qr(location.origin + location.pathname);
  const big = !!code && code.length > 29;
  const down = time ? (big ? 40 : 60) : 0;
  scores.forEach(([label, value], i) => {
    const x = cx + (i - (scores.length - 1) / 2) * 250;
    text(label, x, 1020 + down, 28, 600, "rgba(255, 255, 255, 0.5)");
    text(String(value), x, 1088 + down, time ? 60 : 70, 700, "#ffffff");
  });

  // Whose run, and what it was.
  text(name, m + 56, H - m - 112, 40, 700, "#ffffff", "left");
  text([mode, vs].filter(Boolean).join("  ·  "), m + 56, H - m - 60, 30, 500, "rgba(255, 255, 255, 0.62)", "left");

  if (code) {
    const tile = big ? 190 : 150;
    const pad = 12;
    const x0 = W - m - 56 - tile;
    const y0 = H - m - 44 - tile;
    rounded(ctx, x0, y0, tile, tile, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    const cell = (tile - 2 * pad) / code.length;
    ctx.fillStyle = "#0a0a0d";
    code.forEach((row, y) => row.forEach((on, x) => on && ctx.fillRect(x0 + pad + x * cell, y0 + pad + y * cell, cell + 0.5, cell + 0.5)));
  }
  return canvas;
}

// The card's file name, by rank.
export const rankCardName = (what) => `szo-${what.letter}${what.step === "+" ? "-plus" : what.step ? "-minus" : ""}.png`;

// On the page the foil is live (it follows the pointer); a saved picture gets
// a still one, caught at one angle: slanted streaks of light, a wash of
// colour burnt into the glass, and a glare in a corner. How much, by rank.
const BAKED = { E: 0, D: 0.1, C: 0.14, B: 0.18, A: 0.22, S: 0.28, SS: 0.34, SSS: 0.42 };
function bakeFoil(ctx, letter, m, textures) {
  const k = BAKED[letter];
  if (!k) return;
  ctx.save();
  rounded(ctx, m, m, W - 2 * m, H - 2 * m, 56);
  ctx.clip();
  const slant = (stops) => {
    // A gradient running across the card at a slant (about 115°).
    const g = ctx.createLinearGradient(0, H * 0.15, W, H * 0.85);
    stops.forEach(([at, color]) => g.addColorStop(at, color));
    return g;
  };
  ctx.globalCompositeOperation = "color-dodge";
  ctx.globalAlpha = k;
  ctx.fillStyle = slant([[0, "#ff5fa8"], [0.2, "#ffd75e"], [0.4, "#6fe3a1"], [0.6, "#5fb8ff"], [0.8, "#b98cff"], [1, "#ff5fa8"]]);
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = k * 0.9;
  const clear = "rgba(255, 255, 255, 0)";
  ctx.fillStyle = slant([[0, clear], [0.3, clear], [0.36, "rgba(255, 255, 255, 0.5)"], [0.4, clear], [0.52, clear], [0.55, "rgba(255, 255, 255, 0.28)"], [0.58, clear], [0.74, clear], [0.8, "rgba(255, 255, 255, 0.4)"], [0.86, clear], [1, clear]]);
  ctx.fillRect(0, 0, W, H);
  const glare = ctx.createRadialGradient(W * 0.28, H * 0.16, 0, W * 0.28, H * 0.16, W * 0.7);
  glare.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  glare.addColorStop(1, clear);
  ctx.globalAlpha = k;
  ctx.fillStyle = glare;
  ctx.fillRect(0, 0, W, H);

  // The foil's own texture, as on screen: the pattern laid in it, lit in the
  // colours of the slant, and the glitter over it.
  const rainbow = [[0, "#ff5fa8"], [0.2, "#ffd75e"], [0.4, "#6fe3a1"], [0.6, "#5fb8ff"], [0.8, "#b98cff"], [1, "#ff5fa8"]];
  const tiled = ({ img, size }, tint) => {
    const tile = document.createElement("canvas");
    tile.width = Math.max(8, Math.round(W * size));
    tile.height = Math.max(8, Math.round((tile.width * img.height) / img.width));
    tile.getContext("2d").drawImage(img, 0, 0, tile.width, tile.height);
    const layer = document.createElement("canvas");
    layer.width = W;
    layer.height = H;
    const lc = layer.getContext("2d");
    lc.fillStyle = "#000";
    lc.fillRect(0, 0, W, H);
    lc.fillStyle = lc.createPattern(tile, "repeat");
    lc.fillRect(0, 0, W, H);
    if (tint) {
      const g = lc.createLinearGradient(0, H * 0.15, W, H * 0.85);
      rainbow.forEach(([at, color]) => g.addColorStop(at, color));
      lc.globalCompositeOperation = "multiply";
      lc.fillStyle = g;
      lc.fillRect(0, 0, W, H);
    }
    return layer;
  };
  if (textures?.pattern) {
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(0.34, k * 1.5); // capped: the top ranks must stay readable
    ctx.drawImage(tiled(textures.pattern, true), 0, 0);
  }
  if (textures?.glitter) {
    ctx.globalCompositeOperation = "color-dodge";
    ctx.globalAlpha = Math.min(0.6, k * 2.4);
    ctx.drawImage(tiled(textures.glitter, true), 0, 0);
  }
  ctx.restore();
}

// The card as shown on screen (not baked), as a picture address. Drawing it
// takes a moment, so it is kept: drawn ahead while the summary is read
// (Summary.jsx), and found here when the card opens.
const drawn = new Map();
export function cardImage(what) {
  const key = JSON.stringify(what);
  if (!drawn.has(key)) {
    if (drawn.size > 8) drawn.delete(drawn.keys().next().value);
    drawn.set(key, drawRankCard(what).toDataURL("image/png"));
  }
  return drawn.get(key);
}

export async function saveRankCard(what) {
  const textures = await foilTextures(what).catch(() => null);
  drawRankCard(what, { baked: true, textures }).toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `szo-${what.letter}${what.step === "+" ? "-plus" : what.step ? "-minus" : ""}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, "image/png");
}
