// ─── SOUND ───
// Small synthesized sound kit (Web Audio, no files). Everything is short and
// quiet; a single global switch follows the Sound setting.

let ctx = null;
let enabled = true;

export function setSoundEnabled(on) {
  enabled = !!on;
}

// Sounds that can be switched off one by one (Settings → Sound).
const opts = { fault: true, b2b: true, combo: true };
// Start from what was saved, so the switches hold from the first sound on
// (and through a reload of this module), not only once the app has set them.
try {
  const saved = JSON.parse(localStorage.getItem("jbl-settings") || "{}");
  if (saved.soundEnabled === false) enabled = false;
  Object.assign(opts, saved.soundOpts);
} catch {
  // no saved settings: the defaults
}
export function setSoundOptions(o) {
  Object.assign(opts, o);
}
// The sound test plays every sound, whatever is switched off for the game.
let audition = false;
export function setAudition(on) {
  audition = !!on;
}
const on = (key) => audition || opts[key];

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// The waveform every note is played with. "mixed" leaves each sound the wave
// it was written with (sine, triangle and square, by sound); the others put
// the whole kit on one wave. Chosen in Lab → Sound test and kept.
export const WAVES = ["mixed", "sine", "triangle", "square", "sawtooth"];
const WAVE_KEY = "jbl-wave";
// Square and sawtooth carry far more harmonics, so they are turned down to
// sit about as loud as a sine or triangle of the same level.
const WAVE_LEVEL = { sine: 1, triangle: 1, square: 0.45, sawtooth: 0.5 };
let wave = "mixed";
try {
  const saved = localStorage.getItem(WAVE_KEY);
  if (WAVES.includes(saved)) wave = saved;
} catch {
  // no storage: the default
}
export const getWave = () => wave;
export function setWave(name) {
  if (!WAVES.includes(name)) return;
  wave = name;
  try {
    localStorage.setItem(WAVE_KEY, name);
  } catch {
    // not kept, still used for this visit
  }
}

// One oscillator note. slide: end frequency (glide). delay in seconds.
function tone({ freq, type = "sine", dur = 0.08, vol = 0.1, slide = null, delay = 0, attack = 0.004 }) {
  if (!enabled) return;
  const a = ac();
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  if (wave !== "mixed" && wave !== type) {
    vol = (vol * WAVE_LEVEL[wave]) / WAVE_LEVEL[type];
    type = wave;
  }
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Short filtered noise burst (thuds, garbage).
function noise({ dur = 0.12, vol = 0.12, freq = 400, delay = 0 }) {
  if (!enabled) return;
  const a = ac();
  const t = a.currentTime + delay;
  const len = Math.ceil(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = freq;
  const gain = a.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
}

// Scales the combo note can climb, as semitones above C within one octave.
// The choice is made in Lab → Sound test and kept for the game itself.
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};
// A clear says how hard it hits: the attacks in the game come in five sizes
// (0, 1, 2, 4 or 6 lines sent, before back-to-back and combo), and each size
// is one note more than the last, from C4 G4 C5 G5 C6 (root and fifth, no
// third, so they sit under any combo scale). Three ways to play the notes:
//   hits      counted out on one note
//   arpeggio  one after another, climbing
//   chord     together: the stronger the clear, the fuller the sound
export const CLEAR_STYLES = ["arpeggio", "chord", "hits"];
const CLEAR_NOTES = [261.63, 392, 523.25, 783.99, 1046.5, 1567.98];
// Notes for a clear, by the size of its attack in the game's table (game.js):
// single 1, double 2, triple 3, quad 4; T-spin single 3 (as much as a
// triple), double 4 (as much as a quad), triple 5; a mini 1.
export function attackNotes(lines, spin = false, mini = false) {
  if (spin) return mini ? 1 : [1, 3, 4, 5][Math.min(lines, 3)];
  return [1, 1, 2, 3, 4][Math.min(lines, 4)];
}
const STYLE_KEY = "jbl-clear-style";
let clearStyle = "arpeggio";
try {
  const saved = localStorage.getItem(STYLE_KEY);
  if (CLEAR_STYLES.includes(saved)) clearStyle = saved;
} catch {
  // no storage: the default style
}
export const getClearStyle = () => clearStyle;
export function setClearStyle(name) {
  if (!CLEAR_STYLES.includes(name)) return;
  clearStyle = name;
  try {
    localStorage.setItem(STYLE_KEY, name);
  } catch {
    // not kept, still used for this visit
  }
}
// Seconds from the placement to the end of the clear's own notes, which is
// where the combo note comes in.
const clearSpan = (notes) => (clearStyle === "chord" ? 0.07 : (clearStyle === "hits" ? Math.max(notes, 1) : Math.min(Math.max(notes, 1), 2)) * CLEAR_STEP + 0.02);

const SCALE_KEY = "jbl-combo-scale";
let comboScale = "major";
try {
  const saved = localStorage.getItem(SCALE_KEY);
  if (saved && SCALES[saved]) comboScale = saved;
} catch {
  // no storage: the default scale
}
export const getComboScale = () => comboScale;
export function setComboScale(name) {
  if (!SCALES[name]) return;
  comboScale = name;
  try {
    localStorage.setItem(SCALE_KEY, name);
  } catch {
    // not kept, still used for this visit
  }
}

const SPIN_ROOT = 2; // the rung a T-spin stands on: C5, an octave over a plain clear
const SPIN_LEAD = 0.06; // length of the twist before a T-spin's notes
// The notes of a clear. after: seconds to wait first.
// Only the root and the top note are played: the stronger the attack, the
// wider the leap (a fifth, an octave, an octave and a fifth, two octaves).
// The notes between would say the same thing with more noise. Hits has no
// pitch to leap with, so it still counts them all out.
// root, top: the two rungs of the ladder to play (the same rung: one note).
function clearNotes(notes, after = 0, root = 0, top = Math.min(Math.max(notes, 1), CLEAR_NOTES.length) - 1) {
  const n = Math.min(Math.max(notes, 1), CLEAR_NOTES.length);
  if (clearStyle === "hits") {
    for (let i = 0; i < n; i++) tone({ freq: 392, type: "triangle", dur: 0.07, vol: 0.1, delay: after + i * CLEAR_STEP });
    return;
  }
  const played = top <= root ? [root] : [root, top];
  played.forEach((at, i) => {
    const last = i === played.length - 1;
    if (clearStyle === "chord") tone({ freq: CLEAR_NOTES[at], type: "triangle", dur: 0.24, vol: 0.1 / Math.sqrt(played.length), delay: after });
    else tone({ freq: CLEAR_NOTES[at], type: "triangle", dur: last ? 0.18 : 0.08, vol: 0.09, delay: after + i * CLEAR_STEP });
  });
}

const CLEAR_STEP = 0.06; // seconds between the hits of a line clear

export const sfx = {
  // input
  move: () => tone({ freq: 520, type: "triangle", dur: 0.03, vol: 0.035 }),
  rotate: () => tone({ freq: 660, type: "triangle", dur: 0.045, vol: 0.05, slide: 780 }),
  hold: () => tone({ freq: 440, type: "sine", dur: 0.09, vol: 0.07, slide: 330 }),
  drop: () => tone({ freq: 800, type: "sine", dur: 0.08, vol: 0.12 }),
  // results of a placement
  // A line clear: one to four notes by its attack, in the chosen style (see CLEAR_STYLES).
  clear: (lines) => clearNotes(attackNotes(lines)),
  // A T-spin comes after a quick upward twist and stands an octave above a
  // plain clear, on C5. From there it leaps like a plain clear does: nothing
  // for a mini, a fifth for a single, an octave for a double, an octave and
  // a fifth for a triple.
  // A mini gets a smaller twist: quieter, and up a fifth, not an octave.
  spin: (lines, mini = false) => {
    if (mini) tone({ freq: 523.25, type: "sine", dur: SPIN_LEAD, vol: 0.04, slide: 783.99 });
    else tone({ freq: 523.25, type: "sine", dur: SPIN_LEAD, vol: 0.07, slide: 1046.5 });
    const size = mini ? 0 : Math.min(Math.max(lines, 1), 3); // mini, single, double, triple
    clearNotes(attackNotes(lines, true, mini), SPIN_LEAD, SPIN_ROOT, SPIN_ROOT + size);
  },
  perfect: () => {
    [523, 659, 784, 1047, 1319, 2093].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.22, vol: 0.08, delay: i * 0.06 }));
  },
  // Fault: two falling buzzes. Kept above 200 Hz so small speakers carry it.
  miss: () => {
    if (!on("fault")) return;
    tone({ freq: 330, type: "square", dur: 0.08, vol: 0.06, slide: 294 });
    tone({ freq: 233, type: "square", dur: 0.13, vol: 0.06, slide: 196, delay: 0.09 });
  },
  // Back-to-back: a low note answered an octave up, under the clear sound.
  b2b: () => {
    if (!on("b2b")) return;
    tone({ freq: 392, type: "square", dur: 0.09, vol: 0.035, delay: 0.1 });
    tone({ freq: 784, type: "square", dur: 0.14, vol: 0.035, delay: 0.18 });
  },
  // Combo: one short note that climbs the chosen scale with every clear in a
  // row, from C5 (combo 1) up two octaves to C7, then comes back down.
  // notes, spin: what the clear played, so the combo note lands after it.
  combo: (n, notes = 1, spin = false) => {
    if (!on("combo")) return;
    const scale = SCALES[comboScale];
    // Up two octaves to C7, then back down the same way, and up again.
    const top = 2 * scale.length;
    const at = (Math.max(n, 1) - 1) % (2 * top);
    const step = at > top ? 2 * top - at : at;
    const semitones = 12 * Math.floor(step / scale.length) + scale[step % scale.length];
    tone({ freq: 523.25 * 2 ** (semitones / 12), type: "sine", dur: 0.1, vol: 0.07, delay: clearSpan(notes) + (spin ? SPIN_LEAD : 0) });
  },
  garbage: () => noise({ dur: 0.14, vol: 0.18, freq: 300 }),
  // flow
  ready: () => tone({ freq: 440, type: "sine", dur: 0.1, vol: 0.08 }),
  go: () => tone({ freq: 880, type: "sine", dur: 0.16, vol: 0.1 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.25, vol: 0.09, delay: i * 0.09 })),
  lose: () => [392, 330, 262].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.28, vol: 0.08, delay: i * 0.12 })),
  // UI
  tick: () => tone({ freq: 1200, type: "sine", dur: 0.025, vol: 0.025 }),
  select: () => tone({ freq: 900, type: "sine", dur: 0.06, vol: 0.05, slide: 1200 }),
};

// Back-compat for older call sites.
export function playDropSound() {
  sfx.drop();
}

// Plays the sound for a key action the moment it's pressed.
export function sfxForAction(action) {
  if (action === "left" || action === "right") sfx.move();
  else if (action === "rotateCW" || action === "rotateCCW" || action === "rotate180") sfx.rotate();
}

// Call once per frame with an engine: plays lock / clear / spin / perfect
// clear / hold / garbage / top-out sounds by comparing with last frame.
const seen = new WeakMap();
// fault: sound a wasted key press on the piece just placed (off where the
// mode judges finesse itself and already sounds it).
export function trackSfx(engine, { topout = true, fault = true } = {}) {
  const prev = seen.get(engine);
  const now = {
    placed: engine.placedBlocks,
    lines: engine.lines,
    hold: engine.hold,
    over: engine.gameOver,
    garbage: engine.garbageApplied || 0,
  };
  seen.set(engine, now);
  if (!prev) return;
  if (now.hold !== prev.hold) sfx.hold();
  if (now.placed > prev.placed) {
    const lines = now.lines - prev.lines;
    const action = engine.lastAction || "";
    if (/Perfect/i.test(action)) sfx.perfect();
    else if (/Spin/i.test(action) && lines > 0) sfx.spin(lines, /Mini/i.test(action));
    else if (lines > 0) sfx.clear(lines);
    else sfx.drop();
    // The last placement in the log says how it went.
    const log = engine.replay;
    let last = log.length - 1;
    while (last >= 0 && log[last].kind !== "place") last--;
    if (fault && log[last]?.finesseFault > 0) sfx.miss();
    if (lines > 0) {
      if (log[last]?.b2b) sfx.b2b();
      const spun = /Spin/i.test(action);
      if (engine.combo >= 1) sfx.combo(engine.combo, attackNotes(lines, spun, /Mini/i.test(action)), spun);
    }
  }
  if (now.garbage > prev.garbage) sfx.garbage();
  if (topout && now.over && !prev.over) sfx.lose();
}
