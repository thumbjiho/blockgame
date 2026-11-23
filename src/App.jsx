import { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { saveRecent } from "./recent.js";
import { toast } from "./ui/toast.js";
import { unpack, HASH } from "./pack.js";
import { unpackRun, runInPath } from "./compact.js";
import { t, setLang } from "./i18n.js";
import { useKeyNav } from "./nav.js";
import { useDevProfiles, labOpen, toggleLab, labCode } from "./dev.js";
import { Background } from "./bg.jsx";
import { setSkin, setCellLines, setOrientMark, setBoardTheme } from "./render.js";
import { selectKey, backKey, keyLabel } from "./keys.js";
import Sprint from "./modes/Sprint.jsx";
import Battle from "./modes/Battle.jsx";
import Opening from "./modes/Opening.jsx";
import Finesse from "./modes/Finesse.jsx";
import Lab from "./modes/Lab.jsx";
import Settings from "./modes/Settings.jsx";
import Experiments from "./modes/Experiments.jsx";
import ComingSoon from "./modes/ComingSoon.jsx";
import Sandbox from "./modes/Sandbox.jsx";
import { KeyHints, TopBar, FocusWarning, Toaster, Icon } from "./ui.jsx";
import { useFocusWarning } from "./display.js";
import { sfx, setSoundEnabled as setSfxEnabled, setSoundOptions } from "./sound.js";

// ─── SETTINGS PERSISTENCE ───
function loadSettings() {
  try {
    const saved = localStorage.getItem("jbl-settings");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem("jbl-settings", JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

// ─── MODES ───
const MODES = [
  { id: "sprint", label: "Sprint", color: "#41b6e6", desc: "Clear a set number of lines as fast as you can.", ready: true },
  { id: "battle", label: "Battle", color: "#e8505b", desc: "One on one against the CPU or a friend on the same keyboard.", ready: true },
  { id: "opening", label: "Opening", color: "#b14fd0", desc: "Practise openers piece by piece: TKI, PCO, DT Cannon, Albatross.", ready: true, beta: true },
  { id: "finesse", label: "Finesse", color: "#5cc45c", desc: "Place each piece in the fewest key presses.", ready: true, beta: true },
  { id: "lab", label: "Replay", color: "#3fc8b4", desc: "Watch a run again from its log.", ready: true },
  { id: "sandbox", label: "Sandbox", color: "#f2913d", desc: "Build a board, set the pieces, and play it.", ready: true },
  { id: "experiments", label: "Lab", color: "#f2cb4c", desc: "Things being tried out, just for fun.", ready: true, beta: true, warn: true },
];

// Next menu row in direction d, skipping modes that are not ready yet.
// Lab stays off the menu until it is unlocked (typing "lab", see dev.js).
const menuModes = () => (labOpen() ? MODES : MODES.filter((m) => m.id !== "experiments"));
function stepReady(i, d) {
  const modes = menuModes();
  let n = Math.min(i, modes.length - 1);
  const from = n;
  do n = (n + d + modes.length) % modes.length;
  while (!modes[n].ready && n !== from);
  return n;
}

// ─── APP ───
export default function App() {
  const [view, setView] = useState("menu");

  const [das, setDas] = useState(() => loadSettings().das ?? 133);
  const [arr, setArr] = useState(() => loadSettings().arr ?? 10);
  const [sdf, setSdf] = useState(() => loadSettings().sdf ?? 30);
  const [soundEnabled, setSoundEnabled] = useState(() => loadSettings().soundEnabled ?? true);
  // Sounds that have their own switch: finesse faults, back-to-back, combo.
  // v2 made the fault sound off by default; settings saved before that drop it once.
  const [soundOpts, setSoundOpts] = useState(() => {
    const saved = loadSettings();
    const o = { fault: false, b2b: true, combo: true, ...saved.soundOpts };
    if ((saved.soundV ?? 1) < 2) o.fault = false;
    return o;
  });
  const [skin, setSkinName] = useState(() => loadSettings().skin ?? "flat");
  const [cellLines, setCellLinesOn] = useState(() => loadSettings().cellLines ?? true);
  const [orientMark, setOrientMarkOn] = useState(() => loadSettings().orientMark ?? false);
  const [showLog, setShowLog] = useState(() => loadSettings().showLog ?? true);
  const [showKeys, setShowKeys] = useState(() => loadSettings().showKeys ?? false);
  const [lang, setLangState] = useState(() => loadSettings().lang ?? (navigator.language?.startsWith("ko") ? "ko" : "en"));
  const [theme, setTheme] = useState(() => loadSettings().theme ?? "dark");
  // The skin is read by the canvas drawing code, so it is set before anything draws.
  setSkin(skin);
  setCellLines(cellLines);
  setOrientMark(orientMark);
  setBoardTheme(theme);
  // Language is read by t() during render, so set it before children render.
  setLang(lang);

  // Settings are a dialog over whatever is on screen, not a view of their own.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const [menuIdx, setMenuIdx] = useState(0);
  // The Lab code as it is being entered; a toast says when it lands.
  const codeRef = useRef({ keys: [], at: 0 });
  const [, setLabTick] = useState(0); // the menu is drawn again when Lab comes or goes
  const focusLost = useFocusWarning();
  useKeyNav();
  const rowRefs = useRef([]);

  useEffect(() => {
    const prev = loadSettings();
    saveSettings({ ...prev, das, arr, sdf, soundEnabled, soundOpts, soundV: 2, skin, cellLines, orientMark, showLog, showKeys, lang, theme });
  }, [das, arr, sdf, soundEnabled, soundOpts, skin, cellLines, orientMark, showLog, showKeys, lang, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector("meta[name=theme-color]")?.setAttribute("content", theme === "light" ? "#f3f3f1" : "#0a0a0a");
  }, [theme]);

  // The whole page cross-fades between themes (where the browser can), instead
  // of each colour changing on its own.
  const changeTheme = useCallback((next) => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || still) return setTheme(next);
    document.startViewTransition(() => flushSync(() => setTheme(next)));
  }, []);

  // Every sound follows the Sound setting.
  useEffect(() => {
    setSfxEnabled(soundEnabled);
    setSoundOptions(soundOpts);
  }, [soundEnabled, soundOpts]);

  // Keep game keys from scrolling the page
  useEffect(() => {
    const preventScroll = (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        if (e.target === document.body || e.target === document.documentElement) e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventScroll);
    return () => window.removeEventListener("keydown", preventScroll);
  }, []);

  // Keyboard navigation on the index
  useEffect(() => {
    if (view !== "menu" || settingsOpen) return;
    const handleKey = (e) => {
      // The Lab code (dev.js): each key must follow the last within two seconds.
      const now = performance.now();
      const code = codeRef.current;
      code.keys = now - code.at > 2000 ? [] : code.keys;
      code.at = now;
      const wanted = labCode();
      code.keys = [...code.keys, e.code].slice(-wanted.length);
      if (code.keys.join() === wanted.join()) {
        code.keys = [];
        toast(toggleLab());
        setLabTick((n) => n + 1);
        setMenuIdx(0);
        sfx.select();
        return;
      }
      if (e.code === "ArrowDown" || (e.code === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setMenuIdx((i) => stepReady(i, 1));
        sfx.tick();
      } else if (e.code === "ArrowUp" || (e.code === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setMenuIdx((i) => stepReady(i, -1));
        sfx.tick();
      } else if (e.code === selectKey() || e.code === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        const item = menuModes()[menuIdx];
        if (item?.ready) {
          sfx.select();
          setView(item.id);
        }
      } else if (/^Digit[1-9]$/.test(e.code)) {
        const item = menuModes()[+e.code.slice(5) - 1];
        if (item?.ready) setView(item.id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [view, menuIdx, settingsOpen]);

  useEffect(() => {
    if (view !== "menu") return;
    rowRefs.current[menuIdx]?.focus();
  }, [view, menuIdx]);

  // Dev: typing "lizzy" / "jojo" swaps the solo key profile (see dev.js).
  const [devProfile, keysVersion] = useDevProfiles();
  useEffect(() => {
    if (devProfile) toast(`${devProfile} keys`);
  }, [devProfile, keysVersion]);
  // A finished game's log, handed to Replay from its result screen.
  const [labLog, setLabLog] = useState("");
  // Whether that log came by a link: someone else's run, to watch, not to keep.
  const [labShared, setLabShared] = useState(false);
  const analyze = useCallback((text) => {
    saveRecent(text);
    setLabShared(false);
    setLabLog(text);
    setView("lab");
  }, []);
  // A link to a run (see pack.js) opens straight into its replay.
  useEffect(() => {
    // Two kinds: the short one a QR code carries, in the path (compact.js; the
    // host serves the app for any path, see 404.html in the build), and the
    // full one after the #.
    const run = runInPath(location.pathname);
    if (!run && !location.hash.startsWith(HASH)) return;
    const packed = run || location.hash.slice(HASH.length);
    history.replaceState(null, "", (run ? "/" : location.pathname) + location.search);
    Promise.resolve(run ? unpackRun(packed) : unpack(packed)).then((text) => {
      if (!text) return;
      setLabShared(true);
      setLabLog(text);
      setView("lab");
    });
  }, []);
  const settings = { das, arr, sdf, soundEnabled, showLog, showKeys, setShowLog, setShowKeys, settingsOpen, openSettings, keysVersion, look: `${skin}${cellLines}${orientMark}${theme}`, analyze };
  const goMenu = () => {
    setLabLog("");
    setLabShared(false);
    setSettingsOpen(false);
    setView("menu");
  };
  const current = MODES.find((m) => m.id === view);

  return (
    <div className={"app" + (view === "menu" ? " is-home" : "")}>
      <Background theme={theme} />
      <Toaster />
      {view !== "menu" && (
        <button className="wordmark" onClick={goMenu} title={t("Home")}>
          szo<span>.umjo.me</span>
        </button>
      )}

      <FocusWarning show={focusLost} />
      <TopBar lang={lang} setLang={setLangState} sound={soundEnabled} setSound={setSoundEnabled} onSettings={openSettings} />
      {settingsOpen && (
        <Settings
          values={{ das, arr, sdf, soundEnabled, soundOpts, skin, cellLines, orientMark, theme }}
          onSave={(v) => {
            setDas(v.das);
            setArr(v.arr);
            setSdf(v.sdf);
            setSoundEnabled(v.soundEnabled);
            setSoundOpts(v.soundOpts);
            setSkinName(v.skin);
            setCellLinesOn(v.cellLines);
            setOrientMarkOn(v.orientMark);
            if (v.theme !== theme) changeTheme(v.theme);
            setSettingsOpen(false);
          }}
          onClose={closeSettings}
        />
      )}

      <main className="main">
        {view === "menu" && (
          <div className="home">
            {/* The site's whole address as the title, in lowercase, one size and weight. */}
            <h1 className="logo">
              szo
              <a className="logo-site" href="https://umjo.me" target="_blank" rel="noopener noreferrer">
                .umjo.me
              </a>
            </h1>
            <div className="sub">Jojo&apos;s Blockgame Laboratory</div>
            <div className="menu">
              {menuModes().map((m, i) => (
                <button
                  key={m.id}
                  ref={(el) => (rowRefs.current[i] = el)}
                  className={[menuIdx === i ? "on" : "", m.ready ? "" : "soon"].join(" ")}
                  style={{ "--accent": m.color }}
                  onMouseEnter={() => m.ready && setMenuIdx(i)}
                  disabled={!m.ready}
                  onClick={() => {
                    if (!m.ready) return;
                    sfx.select();
                    setView(m.id);
                  }}
                >
                  <i className="dot" />
                  {t(m.label)}
                  {!m.ready && <span className="tag">{t("Soon")}</span>}
                  {m.beta && (
                    <span className="tag">
                      {/* Lab: things that may break. */}
                      {m.warn && <Icon name="warn" size={12} />}
                      {t("Beta")}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <KeyHints items={[[["↑", "↓"], "move"], [[keyLabel(selectKey())], "open"], [[keyLabel(backKey())], "back"]]} />
          </div>
        )}

        {view === "sprint" && <Sprint settings={settings} onBack={goMenu} />}
        {view === "battle" && <Battle settings={settings} onBack={goMenu} />}
        {view === "opening" && <Opening settings={settings} onBack={goMenu} />}
        {view === "finesse" && <Finesse settings={settings} onBack={goMenu} />}
        {view === "lab" && <Lab settings={settings} initial={labLog} shared={labShared} onBack={goMenu} />}
        {view === "experiments" && <Experiments settings={settings} onBack={goMenu} />}
        {view === "sandbox" && <Sandbox settings={settings} onBack={goMenu} />}
        {current && !current.ready && <ComingSoon label={t(current.label)} color={current.color} onBack={goMenu} />}
      </main>

      <footer className="ftr">
        {t("Rules after")}{" "}
        <a href="https://jstris.jezevec10.com/" target="_blank" rel="noopener noreferrer">
          Jstris
        </a>{" "}
        · {t("Openers after")}{" "}
        <a href="https://four.lol/" target="_blank" rel="noopener noreferrer">
          four.lol
        </a>{" "}
        · CPU{" "}
        <a href="https://github.com/misakamm/MisaMino" target="_blank" rel="noopener noreferrer">
          MisaMino
        </a>
        ,{" "}
        <a href="https://github.com/MinusKelvin/cold-clear" target="_blank" rel="noopener noreferrer">
          Cold Clear
        </a>{" "}
        · {t("Card foils")}{" "}
        <a href="https://github.com/simeydotme/pokemon-cards-css" target="_blank" rel="noopener noreferrer">
          pokemon-cards-css
        </a>{" "}
        · {t("Made by")}{" "}
        <a href="https://umjo.me" target="_blank" rel="noopener noreferrer">
          umjo.me
        </a>
      </footer>
    </div>
  );
}
