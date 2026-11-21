import { useState, useEffect, useRef, useCallback } from "react";
import { t } from "../i18n.js";
import { ROWS, COLS, COLORS, BlockEngine, formatTime } from "../game.js";
import { buildKeyMap, loadKeyBindings, restartKey, keyLabel } from "../keys.js";
import { drawBoard, clearPlayfield, BOARD_W, BOARD_H } from "../render.js";
import { sfx, sfxForAction, trackSfx } from "../sound.js";
import { Stat, SetupInfo, Countdown, KeyHints, Kbd, Advanced, KeyName, MultiSelect, Switch, KeyStrokes, EngineLog, PauseMenu } from "../ui.jsx";
import { useDisplayToggles, usePause, useSettingsDialog, tune, heldActions } from "../display.js";
import { useFit } from "../fit.js";
import { placements, bestPaths, sameCells } from "../finesse.js";

const ACCENT = "#5cc45c";
const PREFS_KEY = "jbl-finesse";
const GOALS = [20, 40, 100];
const PIECES = [
  { id: 1, label: "I" },
  { id: 2, label: "T" },
  { id: 3, label: "L" },
  { id: 4, label: "J" },
  { id: 5, label: "S" },
  { id: 6, label: "Z" },
  { id: 7, label: "O" },
];
const EMPTY_HUD = { clock: 0, done: 0, faults: 0, clean: 0, last: null };

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
  } catch {
    return {};
  }
}

// Shuffled bags of just the given pieces, `n` pieces long.
function bagsOf(ids, n) {
  const out = [];
  while (out.length < n) {
    const bag = ids.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    out.push(...bag);
  }
  return out;
}

function pickTarget(id, prevKey, allow180) {
  const all = placements(id);
  let t;
  do t = all[Math.floor(Math.random() * all.length)];
  while (all.length > 1 && t.key === prevKey);
  return { id, cells: t.cells, key: t.key, best: bestPaths(id, t.cells, { allow180 }) };
}

// Fill the board so only the target is left open: each row the target
// occupies is solid except the target cells, so dropping the piece in clears
// those rows. A row is left empty instead when completing it would need a
// block above a target cell (that would block the drop).
function buildWell(cells) {
  const m = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  const isTarget = new Set(cells.map(([r, c]) => r * COLS + c));
  const covers = (r, c) => {
    for (let rr = r + 1; rr < ROWS; rr++) if (isTarget.has(rr * COLS + c)) return true;
    return false;
  };
  for (const r of new Set(cells.map(([row]) => row))) {
    const fill = [];
    let ok = true;
    for (let c = 0; c < COLS; c++) {
      if (isTarget.has(r * COLS + c)) continue;
      if (covers(r, c)) ok = false;
      fill.push(c);
    }
    if (ok) for (const c of fill) m[r][c] = 8;
  }
  return m;
}

// Every optimal input (up to three), using the player's own bindings.
function BestInputs({ paths, bind }) {
  return (
    <div className="paths">
      {paths.slice(0, 3).map((p, i) => (
        <PathCaps key={i} path={p} bind={bind} />
      ))}
      {paths.length > 3 && <div className="note">+{paths.length - 3} more</div>}
    </div>
  );
}

// Key caps for one optimal path, using the player's own bindings.
function PathCaps({ path, bind }) {
  const cap = (a) => {
    if (a === "dasLeft") return <><KeyName code={bind.left} /> {t("hold")}</>;
    if (a === "dasRight") return <><KeyName code={bind.right} /> {t("hold")}</>;
    return <KeyName code={bind[a]} />;
  };
  return (
    <span className="path">
      {path.map((a, i) => (
        <Kbd key={i}>{cap(a)}</Kbd>
      ))}
    </span>
  );
}

export default function Finesse({ settings, onBack }) {
  // In-game display toggles (K key input); they change the saved setting.
  useDisplayToggles(settings);
  const zoom = useFit(700, 600);
  const prefs = loadPrefs();
  const [phase, setPhase] = useState("select"); // select | countdown | playing | done
  const [goal, setGoal] = useState(20); // always opens on 20, whatever was played last
  const [onFault, setOnFault] = useState(prefs.onFault ?? "retry"); // retry | continue
  // Pieces to practise (any subset). Older saves stored a single piece id (0 = all).
  const [pieces, setPieces] = useState(() =>
    Array.isArray(prefs.pieces) && prefs.pieces.length
      ? prefs.pieces
      : prefs.piece
        ? [prefs.piece]
        : PIECES.map((p) => p.id),
  );
  const [allow180, setAllow180] = useState(prefs.allow180 ?? true);
  const [advOpen, setAdvOpen] = useState(false); // always starts folded
  const [countdownText, setCountdownText] = useState("");
  const [hud, setHud] = useState(EMPTY_HUD);
  const [bind, setBind] = useState(() => loadKeyBindings().solo);
  const [result, setResult] = useState(null);
  const [faultFlash, setFaultFlash] = useState(0);

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const loopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const countdownRef = useRef(null);
  const settingsRef = useRef(settings);
  const bindRef = useRef(loadKeyBindings().solo);
  const keysRef = useRef(buildKeyMap(loadKeyBindings().solo));
  const run = useRef({ target: null, done: 0, faults: 0, clean: 0, keys: 0, last: null, reject: null, finished: false });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ onFault, pieces, allow180 }));
    } catch {
      /* ignore */
    }
  }, [onFault, pieces, allow180]);

  // ─── PLACEMENT CHECK ───
  const validate = useCallback(
    (cells, id, engine) => {
      const st = run.current;
      const t = st.target;
      const keys = engine.currentPieceKeys;
      const reject = () => {
        st.reject = { cells, t: performance.now() };
        setFaultFlash((n) => n + 1);
        sfx.miss();
        return false;
      };
      if (!sameCells(cells, t.cells)) {
        st.faults++;
        st.last = { ok: false, spot: true, keys, best: t.best };
        return reject();
      }
      const clean = keys <= t.best.count;
      st.last = { ok: clean, keys, best: t.best };
      if (clean) st.clean++;
      else {
        st.faults++;
        if (onFault === "retry") return reject();
        setFaultFlash((n) => n + 1);
        sfx.miss();
      }
      // Accepted: set up the well for the next piece right away.
      st.done++;
      st.keys += keys;
      if (goal && st.done >= goal) {
        st.finished = true;
        engine.matrix = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
      } else {
        st.target = pickTarget(engine.queue[0], t.key, allow180);
        engine.matrix = buildWell(st.target.cells);
      }
      return true;
    },
    [goal, onFault, allow180],
  );

  // ─── RENDER ───
  const render = useCallback(() => {
    const engine = engineRef.current;
    const st = run.current;
    let reject = null;
    if (st.reject) {
      const age = (performance.now() - st.reject.t) / 600;
      if (age < 1) reject = { cells: st.reject.cells, alpha: 1 - age };
      else st.reject = null;
    }
    drawBoard(canvasRef.current, engine, { reject });
  }, []);

  // ─── LOOP ───
  useEffect(() => {
    loopRef.current = (timestamp) => {
      const engine = engineRef.current;
      if (!engine) return;
      const st = run.current;
      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      engine.update(Math.min(dt, 100), performance.now());
      trackSfx(engine, { fault: false });

      if (st.finished) {
        engine.playing = false;
        sfx.win();
        setHud({ clock: engine.clock, done: st.done, faults: st.faults, clean: st.clean, last: st.last });
        setResult({
          time: engine.clock,
          pieces: st.done,
          faults: st.faults,
          kpp: st.done ? st.keys / st.done : 0,
        });
        setPhase("done");
        render();
        return;
      }
      setHud({ clock: engine.clock, done: st.done, faults: st.faults, clean: st.clean, last: st.last });
      render();
      rafRef.current = requestAnimationFrame(loopRef.current);
    };
  }, [render]);

  useEffect(() => {
    render();
  }, [render, phase]);

  const launch = useCallback(() => {
    const s = settingsRef.current;
    const engine = new BlockEngine({
      das: s.das,
      arr: s.arr,
      sdf: s.sdf,
      sprintLines: 999999,
      // Only the chosen pieces, dealt in shuffled bags of that set.
      sequence: pieces.length === PIECES.length ? null : bagsOf(pieces, 5000),
    });
    engine.validatePlacement = validate;
    engineRef.current = engine;
    engine.start(heldActions(keysRef.current));
    const first = pickTarget(engine.currentId, null, allow180);
    engine.matrix = buildWell(first.cells);
    engine.updateGhost();
    run.current = {
      target: first,
      done: 0,
      faults: 0,
      clean: 0,
      keys: 0,
      last: null,
      reject: null,
      finished: false,
    };
    setResult(null);
    setPhase("playing");
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, [validate, pieces, allow180]);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    bindRef.current = loadKeyBindings().solo;
    setBind(bindRef.current);
    setHud(EMPTY_HUD);
    const map = buildKeyMap(bindRef.current);
    delete map[bindRef.current.hold]; // no hold in finesse practice
    keysRef.current = map;
    engineRef.current = null;
    clearPlayfield(canvasRef.current);
    setPhase("countdown");
    setCountdownText("Ready");
    countdownRef.current = setTimeout(() => {
      setCountdownText("Go");
      countdownRef.current = setTimeout(launch, 350);
    }, 550);
  }, [launch]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (engineRef.current?.playing && !goal && run.current.done) {
      // Endless: Esc ends the run and shows the result.
      run.current.finished = true;
      loopRef.current?.(performance.now());
      return;
    }
    setPhase("select");
  }, [goal]);

  const { pause, resume } = usePause({
    phase,
    setPhase,
    rafRef,
    countdownRef,
    lastTimeRef,
    loopRef,
    engineRef,
    restart: () => startGame(),
  });

  const settingsOpen = !!settings.settingsOpen;
  // A new skin shows at once, even on a paused board.
  useEffect(() => {
    render();
  }, [settings.look, render]);
  useSettingsDialog(settings, {
    pause,
    apply: () => {
      tune(engineRef.current, settings);
      bindRef.current = loadKeyBindings().solo;
      setBind(bindRef.current);
      const map = buildKeyMap(bindRef.current);
      delete map[bindRef.current.hold]; // no hold in finesse practice
      keysRef.current = map;
    },
  });

  // ─── KEYS ───
  useEffect(() => {
    if (settingsOpen) return;
    const onDown = (e) => {
      if (phase === "select") {
        if (e.code === "Escape") return onBack();
        return;
      }
      if (e.code === "Escape") {
        if (phase === "playing" || phase === "countdown") return pause();
        if (phase === "paused") return resume();
        return setPhase("select");
      }
      if (e.repeat) return;
      if (e.code === restartKey() && phase !== "countdown") {
        e.preventDefault();
        return startGame();
      }
      if (phase !== "playing") return;
      const action = keysRef.current[e.code];
      if (!action) return;
      e.preventDefault();
      engineRef.current?.onKeyDown(action, performance.now());
      sfxForAction(action);
    };
    const onUp = (e) => {
      const action = keysRef.current[e.code];
      if (action) engineRef.current?.onKeyUp(action);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [phase, onBack, startGame, stop, pause, resume, settingsOpen]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    },
    [],
  );

  // ─── SELECT ───
  if (phase === "select") {
    return (
      <div className="page" style={{ "--accent": ACCENT }}>
        <h1 className="title">{t("Finesse")}</h1>
        <p className="lede">
          {t("Place each piece with the fewest key presses.")}
        </p>
        <div className="opts">
          <div className="opt">
            <div className="k">{t("Pieces")}</div>
            <div className="choice-list" role="radiogroup" aria-label="Pieces">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={goal === g}
                  className={goal === g ? "on" : ""}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    if (g !== goal) sfx.tick();
                    setGoal(g);
                  }}
                >
                  <span className="n">{g}</span>
                  <span className="u">pieces</span>
                </button>
              ))}
            </div>
          </div>
          <div className="opt switches">
            <Switch
              label="Practice mode"
              hint="Repeats the piece on a fault"
              checked={onFault === "retry"}
              onChange={(on) => setOnFault(on ? "retry" : "continue")}
            />
          </div>
          <Advanced
            open={advOpen}
            onToggle={() => setAdvOpen((o) => !o)}
            changed={[
              pieces.length === PIECES.length ? null : `${t("Pieces")} ${pieces.map((id) => PIECES.find((p) => p.id === id).label).join(" ")}`,
            ].filter(Boolean)}
          >
          <div className="opts">
          <div className="opt">
            <div className="k">{t("Piece types")}</div>
            <MultiSelect
              label="Piece types"
              all
              options={PIECES.map((p) => ({ ...p, color: COLORS[p.id] }))}
              values={pieces}
              onChange={setPieces}
            />
          </div>
          <div className="opt switches">
            <Switch
              label="Use 180 rotation"
              hint="Counts the 180 key when working out the best input"
              checked={allow180}
              onChange={setAllow180}
            />
          </div>
          </div>
          </Advanced>
        </div>
        <div className="actions">
          <SetupInfo settings={settings} />
          <button className="btn primary" onClick={startGame}>
            {t("Start")}
          </button>
          <button className="btn ghost" onClick={onBack}>
            {t("Back")}
          </button>
        </div>
      </div>
    );
  }

  // ─── PLAY ───
  const st = hud;
  const last = hud.last;
  // Accuracy: clean pieces out of every attempt that ended in a fault or a clean drop.
  const attempts = st.clean + st.faults;
  const acc = attempts ? Math.round((100 * st.clean) / attempts) : 100;

  return (
    <>
      <div className="mode-label">Finesse · {goal ? `${goal} pieces` : "Endless"}</div>
      <div className="play" style={{ zoom }}>
        {settings.showLog !== false && <EngineLog engineRef={engineRef} mode="FINESSE" />}
        <div className="side" style={{ width: 150 }}>
          <Stat k="Time" v={formatTime(hud.clock)} big />
          <Stat k="Pieces" v={goal ? `${st.done} / ${goal}` : st.done} />
          <div className="stat">
            <div className="k">{t("Faults")}</div>
            <div key={faultFlash} className={"v" + (faultFlash ? " flash" : "")}>
              {st.faults}
            </div>
          </div>
          <Stat k="Accuracy" v={`${acc}%`} />
          {settings.showKeys && <KeyStrokes key={settings.keysVersion} />}
        </div>

        <div className="board-wrap">
          <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="board-frame" />
          {phase === "countdown" && <Countdown text={countdownText} />}
          {phase === "paused" && <PauseMenu onResume={resume} onRestart={() => startGame()} onSetup={() => setPhase("select")} onMenu={onBack} />}
          {phase === "done" && result && (
            <div className="veil">
              <div className="k">{result.pieces} pieces</div>
              <div className="title">
                {result.faults === 0 ? t("Clean") : t("{n} faults", { n: result.faults })}
              </div>
              <div className="grid2">
                <Stat k="Time" v={formatTime(result.time)} />
                <Stat k="Accuracy" v={`${acc}%`} />
                <Stat k="Keys / piece" v={result.kpp.toFixed(2)} />
                <Stat k="Pieces / sec" v={result.time ? (result.pieces / result.time).toFixed(2) : "0.00"} />
              </div>
              <div className="row-btns">
                <button className="btn primary" onClick={startGame}>
                  {t("Again")}
                </button>
                <button className="btn ghost" onClick={() => setPhase("select")}>
                  {t("Mode options")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="side right" style={{ width: 180 }}>
          <div>
            <div className="k" style={{ marginBottom: 8 }}>
              {t("Last piece")}
            </div>
            {!last && <div className="note">{t("Best input appears here after each piece.")}</div>}
            {last && (
              <div key={`${hud.done}-${hud.faults}`} className={"last" + (last.ok ? " ok" : " bad")}>
                <div className="v xs">
                  {last.spot ? t("Wrong spot") : last.ok ? t("Clean") : t("+{n} keys", { n: last.keys - last.best.count })}
                </div>
                {!last.spot && (
                  <div className="note" style={{ margin: "4px 0 10px" }}>
                    {last.keys} pressed · best {last.best.count}
                  </div>
                )}
                {!last.ok && <BestInputs paths={last.best.paths} bind={bind} />}
              </div>
            )}
          </div>
          <KeyHints style={{ flexDirection: "column", alignItems: "flex-start" }} items={[
            [[keyLabel(restartKey())], "restart"],
            [["J"], `log ${settings.showLog !== false ? "on" : "off"}`, settings.showLog !== false],
            [["K"], `input ${settings.showKeys ? "on" : "off"}`, !!settings.showKeys],
            [["Esc"], phase === "paused" ? "resume" : "pause"],
          ]} />
        </div>
      </div>
    </>
  );
}
