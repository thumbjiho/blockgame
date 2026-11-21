import { useState, useEffect, useRef } from "react";
import { t } from "../i18n.js";
import { sfx, setAudition, attackNotes, SCALES, getComboScale, setComboScale, CLEAR_STYLES, getClearStyle, setClearStyle, WAVES, getWave, setWave } from "../sound.js";
import { Dropdown } from "../ui.jsx";

const ACCENT = "#f2cb4c";

// ─── Lab: things being tried out ───
// A list of experiments; each opens on its own page. Esc goes back a step.
const EXPERIMENTS = [{ id: "sound", label: "Sound test", desc: "Hear every sound the game makes, one at a time or as a run of clears." }];

export default function Experiments({ settings, onBack }) {
  const [open, setOpen] = useState(null);
  const settingsOpen = !!settings.settingsOpen;
  useEffect(() => {
    if (settingsOpen) return;
    const onKey = (e) => {
      if (e.code !== "Escape") return;
      if (open) setOpen(null);
      else onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onBack, settingsOpen]);

  if (open === "sound") return <SoundTest kit={sfx} onBack={() => setOpen(null)} />;
  return (
    <div className="page" style={{ "--accent": ACCENT }}>
      <h1 className="title">{t("Lab")}</h1>
      <p className="lede">{t("Things being tried out, just for fun.")}</p>
      <div className="mid">
        <div className="exp-list">
          {EXPERIMENTS.map((x) => (
            <button key={x.id} type="button" className="btn exp-item" onClick={() => setOpen(x.id)}>
              <b>{t(x.label)}</b>
              <span>{t(x.desc)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="actions">
        <button className="btn ghost" onClick={onBack}>
          {t("Main menu")}
        </button>
      </div>
    </div>
  );
}

// One placement, the way the game sounds it (see trackSfx in sound.js): the
// clear, spin or perfect clear, then back-to-back and combo on top.
function place(kit, { lines = 0, spin = false, mini = false, perfect = false, b2b = false, combo = 0 }) {
  if (perfect) kit.perfect();
  else if (spin && lines) kit.spin(lines, mini);
  else if (lines) kit.clear(lines);
  else kit.drop();
  if (lines && b2b) kit.b2b();
  if (lines && combo >= 1) kit.combo(combo, attackNotes(lines, spin, mini), spin);
}

const SCALE_NAMES = {
  major: "Major",
  minor: "Minor",
  harmonicMinor: "Harmonic minor",
  dorian: "Dorian",
  lydian: "Lydian",
  majorPentatonic: "Major pentatonic",
  minorPentatonic: "Minor pentatonic",
  blues: "Blues",
  wholeTone: "Whole tone",
  chromatic: "Chromatic",
};
const SCALE_OPTIONS = Object.keys(SCALES).map((id) => ({ id, label: SCALE_NAMES[id] }));

const STYLE_NAMES = { arpeggio: "Arpeggio: a note a line sent, climbing", chord: "Chord: a note a line sent, together", hits: "Hits: a tap a line sent, one note" };
const STYLE_OPTIONS = CLEAR_STYLES.map((id) => ({ id, label: STYLE_NAMES[id] }));

const WAVE_NAMES = { mixed: "As written: a wave for each sound", sine: "Sine", triangle: "Triangle", square: "Square", sawtooth: "Sawtooth" };
const WAVE_OPTIONS = WAVES.map((id) => ({ id, label: WAVE_NAMES[id] }));

const groupsFor = (kit) => [
  {
    label: "Line clears",
    items: [1, 2, 3, 4].map((n) => ({ label: ["Single", "Double", "Triple", "Quad"][n - 1], run: () => place(kit, { lines: n }) })),
  },
  {
    label: "T-spins",
    items: [
      { label: "T-spin mini", run: () => place(kit, { lines: 1, spin: true, mini: true }) },
      ...[1, 2, 3].map((n) => ({ label: ["T-spin single", "T-spin double", "T-spin triple"][n - 1], run: () => place(kit, { lines: n, spin: true }) })),
    ],
  },
  {
    label: "Back-to-back",
    items: [
      { label: "Quad + bonus", run: () => place(kit, { lines: 4, b2b: true }) },
      { label: "T-spin single + bonus", run: () => place(kit, { lines: 1, spin: true, b2b: true }) },
      { label: "T-spin double + bonus", run: () => place(kit, { lines: 2, spin: true, b2b: true }) },
      { label: "T-spin triple + bonus", run: () => place(kit, { lines: 3, spin: true, b2b: true }) },
      { label: "The bonus alone", run: () => kit.b2b() },
    ],
  },
  {
    label: "Combo",
    tight: true, // fifteen numbers on one line
    items: Array.from({ length: 15 }, (_, i) => i + 1).map((n) => ({ label: String(n), run: () => place(kit, { lines: 1, combo: n }) })),
  },
  {
    label: "Runs",
    // Each step is one placement; they are played half a second apart.
    items: [
      { label: "Combo 1 to 15", steps: Array.from({ length: 15 }, (_, i) => ({ lines: 1, combo: i + 1 })) },
      { label: "Combo with doubles, triples and quads", steps: [1, 2, 3, 4, 2, 4, 3, 1].map((lines, i) => ({ lines, combo: i + 1 })) },
      {
        label: "Combo with T-spins",
        steps: [
          { lines: 1, spin: true },
          { lines: 2, spin: true, b2b: true },
          { lines: 3, spin: true, b2b: true },
          { lines: 1, spin: true, mini: true, b2b: true },
          { lines: 2, spin: true, b2b: true },
        ].map((step, i) => ({ ...step, combo: i + 1 })),
      },
      {
        label: "Everything mixed",
        steps: [
          { lines: 1 },
          { lines: 2 },
          { lines: 4 },
          { lines: 2, spin: true, b2b: true },
          { lines: 3 },
          { lines: 1, spin: true },
          { lines: 4, b2b: true },
          { lines: 3, spin: true, b2b: true },
          { lines: 1, spin: true, mini: true, b2b: true },
          { lines: 1 },
        ].map((step, i) => ({ ...step, combo: i + 1 })),
      },
      { label: "Four quads back to back", steps: [{ lines: 4 }, { lines: 4, b2b: true }, { lines: 4, b2b: true }, { lines: 4, b2b: true }] },
      { label: "Quad, T-spin double, T-spin triple", steps: [{ lines: 4 }, { lines: 2, spin: true, b2b: true }, { lines: 3, spin: true, b2b: true }] },
      { label: "Back-to-back inside a combo", steps: [{ lines: 4 }, { lines: 4, b2b: true, combo: 1 }, { lines: 2, spin: true, b2b: true, combo: 2 }, { lines: 1, combo: 3 }] },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Perfect clear", run: () => place(kit, { lines: 4, perfect: true }) },
      { label: "Move", run: () => kit.move() },
      { label: "Rotate", run: () => kit.rotate() },
      { label: "Hold", run: () => kit.hold() },
      { label: "Drop", run: () => kit.drop() },
      { label: "Garbage", run: () => kit.garbage() },
      { label: "Fault", run: () => kit.miss() },
      { label: "Ready", run: () => kit.ready() },
      { label: "Go", run: () => kit.go() },
      { label: "Win", run: () => kit.win() },
      { label: "Lose", run: () => kit.lose() },
    ],
  },
];

function SoundTest({ kit, onBack }) {
  const groups = groupsFor(kit);
  // A run in progress: its timers, so a new press (or leaving) cuts it short.
  const timers = useRef([]);
  const [playing, setPlaying] = useState(null);
  const [scale, setScale] = useState(getComboScale);
  const [style, setStyle] = useState(getClearStyle);
  const pickStyle = (id) => {
    setClearStyle(id);
    setStyle(id);
  };
  const [wave, setWaveName] = useState(getWave);
  const pickWave = (id) => {
    setWave(id);
    setWaveName(id);
  };
  const pickScale = (id) => {
    setComboScale(id);
    setScale(id);
  };
  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(null);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Every sound plays here, including the ones switched off for the game.
  useEffect(() => {
    setAudition(true);
    return () => setAudition(false);
  }, []);
  const press = (item) => (e) => {
    e.currentTarget.blur();
    stop();
    if (!item.steps) return item.run();
    setPlaying(item.label);
    item.steps.forEach((step, i) => timers.current.push(setTimeout(() => place(kit, step), i * 520)));
    timers.current.push(setTimeout(() => setPlaying(null), item.steps.length * 520));
  };
  return (
    <div className="page wide" style={{ "--accent": ACCENT }}>
      <h1 className="title">{t("Sound test")}</h1>
      <p className="lede">{t("Each button plays what the game would play.")}</p>
      <div className="mid">
        <div className="snd">
          <div className="snd-row">
            <div className="k">{t("Waveform")}</div>
            <div className="snd-scale wide">
              <Dropdown label={t("Waveform")} value={wave} options={WAVE_OPTIONS} onChange={pickWave} />
            </div>
          </div>
          <div className="snd-row">
            <div className="k">{t("Line clear")}</div>
            <div className="snd-scale wide">
              <Dropdown label={t("Line clear")} value={style} options={STYLE_OPTIONS} onChange={pickStyle} />
            </div>
          </div>
          <div className="snd-row">
            <div className="k">{t("Combo scale")}</div>
            <div className="snd-scale">
              <Dropdown label={t("Combo scale")} value={scale} options={SCALE_OPTIONS} onChange={pickScale} />
              <span className="k small">{t("From C. Used in the game too.")}</span>
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.label} className="snd-row">
              <div className="k">{t(g.label)}</div>
              <div className={"snd-btns" + (g.tight ? " tight" : "")}>
                {g.items.map((item) => (
                  <button key={item.label} type="button" className={"btn compact" + (playing === item.label ? " primary" : "")} onClick={press(item)}>
                    {t(item.label)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="actions">
        <button className="btn ghost" onClick={onBack}>
          {t("Back")}
        </button>
      </div>
    </div>
  );
}
