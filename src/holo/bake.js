// The foil as it is on screen, painted into the saved picture. The card on
// screen is a picture with the foil's layers over it (css/: gradients and
// textures, blended into each other and into the card, then filtered). Rather
// than a look-alike, this reads each layer's computed style off the card that
// is showing and paints it again, at the picture's size: the same textures, the
// same sizes and places, the same blends, over the whole card.

const images = new Map();
function load(src) {
  if (!images.has(src)) {
    images.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }),
    );
  }
  return images.get(src);
}

// "a(b, c), d" → ["a(b, c)", "d"]: commas outside brackets.
function split(text) {
  const out = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      out.push(text.slice(from, i).trim());
      from = i + 1;
    }
  }
  const last = text.slice(from).trim();
  if (last) out.push(last);
  return out;
}
const words = (text) => text.trim().split(/\s+(?![^(]*\))/);

const canvasOf = (w, h) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

// A length ("30%", "12px", "0") against a whole, at the picture's scale.
function length(text, whole, scale) {
  if (text.endsWith("%")) return (parseFloat(text) / 100) * whole;
  if (text.endsWith("px")) return parseFloat(text) * scale;
  return parseFloat(text) || 0;
}

// Colour stops: "rgb(1, 2, 3) 10%", "rgba(…) 10% 20%", "rgb(…)". Positions
// as shares of `line` (px); missing ones are spread evenly, as CSS does.
function stops(parts, line, scale) {
  const list = [];
  for (const part of parts) {
    const m = part.match(/^((?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]+|[a-z]+)\s*(.*)$/i);
    if (!m) continue;
    const at = m[2] ? m[2].split(/\s+/).filter(Boolean) : [];
    if (!at.length) list.push({ color: m[1], at: null });
    for (const a of at) list.push({ color: m[1], at: a.endsWith("deg") ? parseFloat(a) / 360 : length(a, line, scale) / line });
  }
  if (!list.length) return list;
  if (list[0].at === null) list[0].at = 0;
  if (list.at(-1).at === null) list.at(-1).at = 1;
  for (let i = 1; i < list.length; i++) if (list[i].at !== null && list[i].at < list[i - 1].at) list[i].at = list[i - 1].at;
  for (let i = 1; i < list.length; i++) {
    if (list[i].at !== null) continue;
    let j = i;
    while (list[j].at === null) j++;
    const a = list[i - 1].at;
    const step = (list[j].at - a) / (j - i + 1);
    for (let k = i; k < j; k++) list[k].at = a + step * (k - i + 1);
  }
  return list;
}

// Stops (as shares, maybe outside 0–1) onto a canvas gradient that runs over
// 0–1. A repeating gradient repeats its stops across all of it.
function addStops(g, list, repeat) {
  if (!list.length) return;
  let all = list;
  if (repeat) {
    const a = list[0].at;
    const period = list.at(-1).at - a;
    if (period > 0) {
      all = [];
      for (let k = Math.floor(-a / period) - 1; a + k * period < 1 + period; k++) for (const s of list) all.push({ color: s.color, at: s.at + k * period });
    }
  }
  // Clamped into 0–1, with the colour where the gradient crosses each end.
  const at = (x) => {
    if (x <= all[0].at) return all[0].color;
    if (x >= all.at(-1).at) return all.at(-1).color;
    for (let i = 1; i < all.length; i++) if (x <= all[i].at) return mix(all[i - 1], all[i], x);
    return all.at(-1).color;
  };
  // CSS mixes the colours between two stops with their alpha premultiplied,
  // a canvas without: where one stop is see-through the two differ a lot
  // (a fade to clear goes grey on a canvas). So the steps between such stops
  // are given here, mixed the CSS way.
  const put = (x, color) => g.addColorStop(Math.min(1, Math.max(0, x)), color);
  put(0, at(0));
  for (let i = 0; i < all.length; i++) {
    const s = all[i];
    const prev = all[i - 1];
    if (prev && rgba(prev.color)[3] !== rgba(s.color)[3] && s.at > prev.at) {
      for (let k = 1; k < 16; k++) {
        const x = prev.at + ((s.at - prev.at) * k) / 16;
        if (x > 0 && x < 1) put(x, mix(prev, s, x));
      }
    }
    if (s.at > 0 && s.at < 1) put(s.at, s.color);
  }
  put(1, at(1));
}
// The colour between two stops, at x, mixed with premultiplied alpha as CSS does.
function mix(a, b, x) {
  const ca = rgba(a.color);
  const cb = rgba(b.color);
  const t = b.at === a.at ? 1 : (x - a.at) / (b.at - a.at);
  const alpha = ca[3] + (cb[3] - ca[3]) * t;
  const v = [0, 1, 2].map((i) => (alpha ? (ca[i] * ca[3] + (cb[i] * cb[3] - ca[i] * ca[3]) * t) / alpha : 0));
  return `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${alpha})`;
}
const probe = document.createElement("canvas").getContext("2d");
function rgba(color) {
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  const c = probe.fillStyle;
  if (c.startsWith("#")) return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 1];
  const n = c.match(/[\d.]+/g).map(Number);
  return [n[0], n[1], n[2], n[3] ?? 1];
}

// "at 30% 40%" in a gradient's head → the point, in the tile.
function centre(head, w, h, scale) {
  const m = head.match(/at\s+(\S+)(?:\s+(\S+))?/);
  if (!m) return [w / 2, h / 2];
  const word = { left: "0%", center: "50%", right: "100%", top: "0%", bottom: "100%" };
  return [length(word[m[1]] || m[1], w, scale), length(word[m[2]] || m[2] || "50%", h, scale)];
}

// One gradient, painted on a tile of w × h.
function gradient(text, w, h, scale) {
  const kind = text.slice(0, text.indexOf("("));
  const parts = split(text.slice(text.indexOf("(") + 1, text.lastIndexOf(")")));
  const repeat = kind.startsWith("repeating-");
  const tile = canvasOf(w, h);
  const ctx = tile.getContext("2d");
  const first = parts[0];
  const headed = !/^(rgba?|hsla?)\(|^#/i.test(first);
  const head = headed ? first : "";
  const colours = headed ? parts.slice(1) : parts;
  if (kind.endsWith("linear-gradient")) {
    let angle = 180;
    if (/deg$/.test(head)) angle = parseFloat(head);
    else if (/turn$/.test(head)) angle = parseFloat(head) * 360;
    else if (head.startsWith("to ")) {
      const side = { top: 0, right: 90, bottom: 180, left: 270, "top right": 45, "right top": 45, "bottom right": 135, "right bottom": 135, "bottom left": 225, "left bottom": 225, "top left": 315, "left top": 315 };
      angle = side[head.slice(3)] ?? 180;
    }
    const a = (angle * Math.PI) / 180;
    const line = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    const [dx, dy] = [Math.sin(a), -Math.cos(a)];
    const g = ctx.createLinearGradient(w / 2 - (dx * line) / 2, h / 2 - (dy * line) / 2, w / 2 + (dx * line) / 2, h / 2 + (dy * line) / 2);
    addStops(g, stops(colours, line, scale), repeat);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (kind.endsWith("radial-gradient")) {
    const [cx, cy] = centre(head, w, h, scale);
    const ellipse = !/circle/.test(head);
    const corners = [[0, 0], [w, 0], [0, h], [w, h]];
    const near = /closest-corner|closest-side/.test(head);
    const sides = /side/.test(head);
    let rx, ry;
    if (sides) {
      const fx = near ? Math.min(cx, w - cx) : Math.max(cx, w - cx);
      const fy = near ? Math.min(cy, h - cy) : Math.max(cy, h - cy);
      [rx, ry] = ellipse ? [fx, fy] : [near ? Math.min(fx, fy) : Math.max(fx, fy), 0];
      if (!ellipse) ry = rx;
    } else {
      const d = corners.map(([x, y]) => Math.hypot(x - cx, y - cy));
      const r = near ? Math.min(...d) : Math.max(...d);
      if (ellipse) {
        // An ellipse through the corner, shaped like the box's sides from the centre.
        const sx = near ? Math.min(cx, w - cx) : Math.max(cx, w - cx);
        const sy = near ? Math.min(cy, h - cy) : Math.max(cy, h - cy);
        rx = sx * Math.SQRT2;
        ry = sy * Math.SQRT2;
      } else rx = ry = r;
    }
    const list = stops(colours, rx, scale);
    const far = Math.max(1, ...list.map((s) => s.at));
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * far);
    addStops(g, list.map((s) => ({ ...s, at: s.at / far })), repeat);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx || 1);
    ctx.fillStyle = g;
    ctx.fillRect(-w * 4, -h * 4, w * 8, h * 8);
    ctx.restore();
  } else if (kind.endsWith("conic-gradient")) {
    const from = head.match(/from\s+([-\d.]+)deg/);
    const [cx, cy] = centre(head, w, h, scale);
    const g = ctx.createConicGradient((((from ? parseFloat(from[1]) : 0) - 90) * Math.PI) / 180, cx, cy);
    addStops(g, stops(colours, 1, scale), repeat);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  return tile;
}

// The size one layer's picture is drawn at (background-size / mask-size).
function sizeOf(text, W, H, iw, ih, scale) {
  if (text === "cover" || text === "contain") {
    if (!iw) return [W, H];
    const k = text === "cover" ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
    return [iw * k, ih * k];
  }
  const [a, b = "auto"] = words(text);
  let w = a === "auto" ? null : length(a, W, scale);
  let h = b === "auto" ? null : length(b, H, scale);
  if (w === null && h === null) [w, h] = iw ? [iw * scale, ih * scale] : [W, H];
  else if (w === null) w = iw ? (h * iw) / ih : W;
  else if (h === null) h = iw ? (w * ih) / iw : H;
  return [w, h];
}

// One background layer, tiled and placed over a W × H canvas.
async function layer(ctx, image, size, position, repeat, W, H, scale) {
  let pic = null;
  let iw = 0;
  let ih = 0;
  const url = image.match(/^url\("?(.*?)"?\)$/);
  if (url) {
    pic = await load(url[1]);
    if (!pic) return;
    [iw, ih] = [pic.naturalWidth, pic.naturalHeight];
  } else if (!/gradient\(/.test(image)) return;
  const [tw, th] = sizeOf(size, W, H, iw, ih, scale);
  if (tw < 0.5 || th < 0.5) return;
  if (!pic) pic = gradient(image, tw, th, scale);
  const [px, py = "50%"] = words(position);
  const place = (p, room) => (p.endsWith("%") ? (parseFloat(p) / 100) * room : length(p, room, scale));
  const x0 = place(px, W - tw);
  const y0 = place(py, H - th);
  const [rx, ry] = repeat === "no-repeat" ? [false, false] : repeat === "repeat-x" ? [true, false] : repeat === "repeat-y" ? [false, true] : [true, true];
  const xs = rx ? Math.floor(-x0 / tw) : 0;
  const ys = ry ? Math.floor(-y0 / th) : 0;
  for (let j = ys; j === ys || (ry && y0 + j * th < H); j++) for (let i = xs; i === xs || (rx && x0 + i * tw < W); i++) ctx.drawImage(pic, x0 + i * tw, y0 + j * th, tw, th);
}

// The CSS filter functions the foils use, on the pixels.
function filter(canvas, text) {
  const fns = [...text.matchAll(/(brightness|contrast|saturate)\(([-\d.]+)(%?)\)/g)].map(([, f, v, pc]) => [f, parseFloat(v) / (pc ? 100 : 1)]);
  if (!fns.length) return;
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  for (const [f, v] of fns) {
    if (f === "brightness") for (let i = 0; i < d.length; i += 4) (d[i] *= v), (d[i + 1] *= v), (d[i + 2] *= v);
    else if (f === "contrast") {
      const off = 128 - 128 * v;
      for (let i = 0; i < d.length; i += 4) (d[i] = d[i] * v + off), (d[i + 1] = d[i + 1] * v + off), (d[i + 2] = d[i + 2] * v + off);
    } else {
      const s = v;
      const m = [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s];
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        d[i] = m[0] * r + m[1] * g + m[2] * b;
        d[i + 1] = m[3] * r + m[4] * g + m[5] * b;
        d[i + 2] = m[6] * r + m[7] * g + m[8] * b;
      }
    }
  }
  ctx.putImageData(data, 0, 0); // Uint8ClampedArray keeps each value in 0–255
}

const blendOf = (mode) => (mode === "normal" ? "source-over" : mode);

// What painting a layer needs of its style, copied out at once, so the card
// can be posed for the picture and put back before the screen shows it.
const PROPS = ["display", "content", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat", "backgroundBlendMode", "mixBlendMode", "opacity", "filter", "maskImage", "webkitMaskImage", "maskSize", "webkitMaskSize", "maskPosition", "webkitMaskPosition", "maskRepeat", "webkitMaskRepeat"];
function read(el, pseudo) {
  const s = getComputedStyle(el, pseudo);
  const out = {};
  for (const k of PROPS) out[k] = s[k];
  return out;
}
// The foil's layers on a card, as they are styled right now.
export function snapshot(card) {
  return [...card.querySelectorAll(":scope .card__shine, :scope .card__glare")].map((el) => ({ style: read(el, ""), before: read(el, "::before"), after: read(el, "::after") }));
}

// A layer (an element, or one of its ::before / ::after) painted on its own,
// W × H, its pseudo-elements in it, its filter on all of it. Null when not shown.
async function paint(s, children, W, H, scale) {
  if (s.display === "none" || (children === null && (s.content === "none" || s.content === "normal"))) return null;
  const canvas = canvasOf(W, H);
  const ctx = canvas.getContext("2d");
  const list = s.backgroundImage === "none" ? [] : split(s.backgroundImage);
  const at = (text, i) => {
    const all = split(text);
    return all[i % all.length];
  };
  // Bottom layer first; each blends into those under it.
  for (let i = list.length - 1; i >= 0; i--) {
    ctx.globalCompositeOperation = i === list.length - 1 ? "source-over" : blendOf(at(s.backgroundBlendMode, i));
    await layer(ctx, list[i], at(s.backgroundSize, i), at(s.backgroundPosition, i), at(s.backgroundRepeat, i), W, H, scale);
  }
  ctx.globalCompositeOperation = "source-over";
  for (const cs of children || []) {
    const child = await paint(cs, null, W, H, scale);
    if (!child) continue;
    ctx.globalCompositeOperation = blendOf(cs.mixBlendMode);
    ctx.globalAlpha = parseFloat(cs.opacity);
    ctx.drawImage(child, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  const mask = s.maskImage && s.maskImage !== "none" ? s.maskImage : s.webkitMaskImage && s.webkitMaskImage !== "none" ? s.webkitMaskImage : null;
  if (mask) {
    const m = canvasOf(W, H);
    const mctx = m.getContext("2d");
    const ms = s.maskSize || s.webkitMaskSize || "auto";
    const mp = s.maskPosition || s.webkitMaskPosition || "0% 0%";
    const mr = s.maskRepeat || s.webkitMaskRepeat || "repeat";
    const masks = split(mask);
    for (let i = masks.length - 1; i >= 0; i--) await layer(mctx, masks[i], at(ms, i), at(mp, i), at(mr, i), W, H, scale);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(m, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
  if (s.filter && s.filter !== "none") filter(canvas, s.filter);
  return canvas;
}

// The foil (a snapshot of the card's layers) over the card's picture, as on
// screen. width: how wide the card showing it is, in CSS pixels.
export async function bakeLive(layers, width, base) {
  const W = base.width;
  const H = base.height;
  const scale = W / width;
  const out = canvasOf(W, H);
  const ctx = out.getContext("2d");
  ctx.drawImage(base, 0, 0);
  for (const { style, before, after } of layers) {
    const layerCanvas = await paint(style, [before, after], W, H, scale);
    if (!layerCanvas) continue;
    ctx.globalCompositeOperation = blendOf(style.mixBlendMode);
    ctx.globalAlpha = parseFloat(style.opacity);
    ctx.drawImage(layerCanvas, 0, 0);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  return out;
}
