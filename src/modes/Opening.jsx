import { useState, useEffect, useRef, useCallback } from "react";
import { t } from "../i18n.js";
import { ROWS, COLS, COLORS, BlockEngine, formatTime } from "../game.js";
import { buildKeyMap, loadKeyBindings, restartKey, keyLabel } from "../keys.js";
import {
  drawBoard,
  drawHold,
  drawQueue,
  clearPlayfield,
  drawPicture,
  BOARD_W,
  BOARD_H,
  HOLD_W,
  HOLD_H,
  SLOT,
} from "../render.js";
import { sfx, sfxForAction, trackSfx } from "../sound.js";
import { Segmented, Stat, SetupInfo, Countdown, KeyHints, Kbd, Advanced, KeyStrokes, EngineLog, PauseMenu } from "../ui.jsx";
import { useDisplayToggles, usePause, useSettingsDialog, tune, heldActions, useCountdown } from "../display.js";
import { useFit } from "../fit.js";
import {
  OPENERS,
  LETTER_ID,
  ID_LETTER,
  stepTarget,
  stepPicture,
  openerSequence,
  mirrorOpener,
  stageOpener,
  boardBefore,
} from "../openings.js";
import { getSolver, solvableRun } from "../openSolver.js";

const PREFS_KEY = "jbl-opening-v2";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
  } catch {
    return {};
  }
}

function hasLetters(grid) {
  for (const row of grid) for (const ch of row) if (ch && ch !== "X") return true;
  return false;
}

// Static picture of one step
function StepPicture({ step, size = 12 }) {
  const ref = useRef(null);
  useEffect(() => {
    drawPicture(ref.current, stepPicture(step), size);
  }, [step, size]);
  return <canvas ref={ref} width={COLS * size} height={step.grid.length * size} />;
}

// Queue pieces sit closer here: the same column holds eight key hints.
const QUEUE_SLOT = SLOT - 10;

export default function Opening({ settings, onBack }) {
  // In-game display toggles (K key input); they change the saved setting.
  useDisplayToggles(settings);
  const zoom = useFit(700, 660);
  const prefs = loadPrefs();
  const [phase, setPhase] = useState("select"); // select | countdown | playing | done
  const [openerIdx, setOpenerIdx] = useState(() => {
    const i = OPENERS.findIndex((o) => o.id === prefs.opener && !o.disabled);
    return i >= 0 ? i : OPENERS.findIndex((o) => !o.disabled);
  });
  const [stage, setStage] = useState(null); // null = every stage, else one stage index
  const [runStage, setRunStage] = useState(null); // stage of the run in progress
  const selectOpener = (i) => {
    if (OPENERS[i]?.disabled) return;
    setOpenerIdx(i);
    if (i !== openerIdx) setStage(null);
  };
  const [order, setOrder] = useState(prefs.order ?? "random"); // fixed | random
  const [guide, setGuide] = useState(prefs.guide ?? true);
  const [mirror, setMirror] = useState(prefs.mirror ?? "on"); // off | on (on = random side each run)
  const [mirroredRun, setMirroredRun] = useState(false);
  const [autoNext, setAutoNext] = useState(prefs.autoNext ?? "all"); // off | all
  const [streak, setStreak] = useState(0);
  const [advOpen, setAdvOpen] = useState(false); // always starts folded
  const [, setTick] = useState(0);
  const [result, setResult] = useState(null);
  const [missFlash, setMissFlash] = useState(0);

  const baseOpener = OPENERS[openerIdx];
  const showMirrored = phase === "select" ? mirror === "on" : mirroredRun;
  const opener = showMirrored ? mirrorOpener(baseOpener) : baseOpener;

  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const loopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [countdownText, countdown, cancelCountdown] = useCountdown();
  const keysRef = useRef(buildKeyMap(loadKeyBindings().solo));
  const settingsRef = useRef(settings);
  const prevPlacedRef = useRef(0);

  // Read by the game loop (which is not re-created on every render).
  const autoNextRef = useRef(autoNext);
  const openerIdxRef = useRef(openerIdx);
  const stageRef = useRef(stage);
  const startRef = useRef(null);
  const restartOnChange = useRef(false);
  useEffect(() => {
    autoNextRef.current = autoNext;
    openerIdxRef.current = openerIdx;
    stageRef.current = stage;
  }, [autoNext, openerIdx, stage]);

  // Practice state lives in refs so the engine hook can read and update it.
  const playOpRef = useRef(null); // opener (possibly mirrored) of the current run
  const run = useRef({ step: 0, target: null, misses: 0, done: false, reject: null, lastAction: "", actionKey: 0 });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ opener: opener.id, order, guide, mirror, autoNext }));
    } catch {
      /* ignore */
    }
  }, [opener.id, order, guide, mirror, autoNext]);

  // ─── PLACEMENT CHECK ───
  const validate = useCallback(
    (cells, id, engine) => {
      const st = run.current;
      const letter = ID_LETTER[id];
      let ok = cells.every(([r, c]) => r >= 0 && st.target[r][c] === letter);
      // A spin step's T is the finisher: it only counts once everything else in
      // the step is down (placing it early would seal the other pieces out).
      const stepDef = playOpRef.current?.steps[st.step];
      if (ok && stepDef?.spin && letter === "T") {
        const others = st.target.some((row) => row.some((ch) => ch && ch !== "X" && ch !== "T"));
        if (others) ok = false;
      }
      if (!ok) {
        st.misses++;
        st.reject = { cells, t: performance.now() };
        setMissFlash((n) => n + 1);
        sfx.miss();
        return false;
      }
      for (const [r, c] of cells) st.target[r][c] = "X";
      // Rows this piece completes are about to clear: drop them from the target too.
      for (let r = 0; r < ROWS; r++) {
        if (engine.matrix[r].every((v) => v !== 0)) {
          st.target.splice(r, 1);
          st.target.unshift(new Array(COLS).fill(""));
        }
      }
      if (!hasLetters(st.target)) {
        const op = playOpRef.current;
        st.step++;
        if (st.step < op.steps.length) st.target = stepTarget(op.steps[st.step]);
        else st.done = true;
      }
      return true;
    },
    [],
  );

  const guideGrid = () => {
    const t = run.current.target;
    if (!t || !guide) return null;
    return t.map((row) => row.map((ch) => (ch && ch !== "X" ? LETTER_ID[ch] : 0)));
  };

  // The solution's next move from the current state: "place", "hold" or null
  // (no solution any more). Recomputed only when the state changes.
  const updateHint = (engine) => {
    const st = run.current;
    const op = playOpRef.current;
    if (!engine || !op || st.done) return;
    const key = [engine.placedBlocks, engine.hold, engine.currentId, engine.holdUsed, st.step].join();
    if (st.hintKey === key) return;
    st.hintKey = key;
    const solver = getSolver(op);
    const S = solver.steps[st.step];
    if (!S) return;
    let mask = 0;
    S.pieces.forEach((pc, i) => {
      if (!st.target.some((row) => row.includes(pc.letter))) mask |= 1 << i;
    });
    const plan = solver.solve([...engine.queue, ...(engine.pendingSeq || [])], {
      cur: engine.currentId,
      next: 0,
      hold: engine.hold,
      step: st.step,
      mask,
      canHold: !engine.holdUsed,
    });
    st.hint = plan ? plan[0] || null : "stuck";
  };

  const focusCells = () => {
    const st = run.current;
    const engine = engineRef.current;
    if (!guide || !engine || st.hint !== "place") return null;
    const L = ID_LETTER[engine.currentId];
    const cells = [];
    st.target?.forEach((row, r) => row.forEach((ch, c) => ch === L && cells.push([r, c])));
    return cells.length ? { cells, id: engine.currentId } : null;
  };

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
    drawBoard(canvasRef.current, engine, { guide: guideGrid(), focus: focusCells(), reject });
    if (engine) {
      drawHold(holdRef.current, engine.hold, engine.holdUsed);
      drawQueue(queueRef.current, engine.queue, 5, QUEUE_SLOT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide]);

  // ─── LOOP ───
  useEffect(() => {
    loopRef.current = (timestamp) => {
      const engine = engineRef.current;
      if (!engine) return;
      const st = run.current;

      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      engine.update(Math.min(dt, 100), performance.now());
      updateHint(engine);
      trackSfx(engine);

      if (engine.placedBlocks > prevPlacedRef.current) {
        prevPlacedRef.current = engine.placedBlocks;
        if (engine.lastAction && engine.lastAction !== st.lastAction) {
          st.lastAction = engine.lastAction;
          st.actionKey++;
        }
      }

      if (st.done && autoNextRef.current !== "off") {
        // Continuous: count it and go straight into the next one (no result screen).
        engine.playing = false;
        setStreak((n) => n + 1);
        sfx.select();
        const cur = openerIdxRef.current;
        let next = cur;
        if (stageRef.current == null) {
          do next = (next + 1) % OPENERS.length;
          while (OPENERS[next].disabled && next !== cur);
        }
        if (next !== cur) setOpenerIdx(next);
        startRef.current?.({ idx: next, quick: true, keepStreak: true });
        return;
      }
      if (st.done) {
        engine.playing = false;
        sfx.win();
        const pieces = engine.placedBlocks;
        setResult({
          time: engine.clock,
          misses: st.misses,
          pieces,
          pps: engine.clock > 0 ? pieces / engine.clock : 0,
          finish: engine.lastAction || "",
        });
        setPhase("done");
        render();
        return;
      }
      if (engine.gameOver) {
        setResult(null);
        setPhase("done");
        render();
        return;
      }

      setTick((x) => x + 1);
      render();
      rafRef.current = requestAnimationFrame(loopRef.current);
    };
  }, [render]);

  // Redraw when the guide is toggled while paused
  useEffect(() => {
    render();
  }, [render, phase]);

  const launch = useCallback((op, seq, startBoard, seed) => {
    playOpRef.current = op;
    const s = settingsRef.current;
    const engine = new BlockEngine({
      das: s.das,
      arr: s.arr,
      sdf: s.sdf,
      sprintLines: 999999,
      sequence: seq,
      seed,
    });
    engine.validatePlacement = validate;
    engineRef.current = engine;
    run.current = {
      step: 0,
      target: stepTarget(op.steps[0]),
      misses: 0,
      done: false,
      reject: null,
      lastAction: "",
      actionKey: 0,
      hint: null,
      hintKey: null,
    };
    prevPlacedRef.current = 0;
    engine.start(heldActions(keysRef.current));
    if (startBoard) {
      // Stage practice: begin from the board the earlier stages leave behind.
      engine.matrix = startBoard.map((row) => row.slice());
      engine.updateGhost();
    }
    setResult(null);
    setPhase("playing");
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, [validate]);

  // Countdown view: empty board and hold, with the coming pieces in the queue.
  const previewRef = useRef([]);
  const showPreview = useCallback(() => {
    clearPlayfield(canvasRef.current, holdRef.current, queueRef.current);
    drawQueue(queueRef.current, previewRef.current, 5, QUEUE_SLOT);
  }, []);
  // Coming from the setup screen the canvases only exist once the game view is up.
  useEffect(() => {
    if (phase === "countdown") showPreview();
  }, [phase, showPreview]);

  // opts.idx: opener to play (defaults to the selected one); opts.quick: skip the
  // countdown (continuous mode); opts.keepStreak: don't reset the streak.
  const startGame = useCallback((opts = {}) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    keysRef.current = buildKeyMap(loadKeyBindings().solo);
    const base = OPENERS[opts.idx ?? openerIdx];
    const stageIdx = (opts.idx ?? openerIdx) === openerIdx ? stage : null;
    const runOf = stageIdx == null ? base : stageOpener(base, stageIdx);
    if (!opts.keepStreak) setStreak(0);
    // Always a run that has a solution: random bags are rerolled until the
    // opener can be built from them; with mirror on the side is random too.
    const planned =
      solvableRun(runOf, { mirror: mirror === "on", random: order === "random", ideal: openerSequence }) ||
      solvableRun(runOf, { mirror: false, random: false, ideal: openerSequence });
    const op = planned.op;
    const seq = planned.seq;
    const mir = planned.mirrored;
    const startBoard = stageIdx == null ? null : boardBefore(mir ? mirrorOpener(base) : base, stageIdx);
    setMirroredRun(mir);
    setRunStage(stageIdx);
    if (opts.quick) {
      launch(op, seq, startBoard);
      return;
    }
    engineRef.current = null;
    // The countdown shows the pieces that are coming; the seed makes the run
    // deal the same ones.
    const seed = Math.floor(Math.random() * 2 ** 31);
    previewRef.current = new BlockEngine({ sequence: seq, seed }).queue.slice();
    showPreview();
    run.current = { ...run.current, step: 0, target: stepTarget(op.steps[0]), done: false, reject: null };
    setPhase("countdown");
    countdown(() => launch(op, seq, startBoard, seed), 550, 350);
  }, [launch, showPreview, openerIdx, mirror, order, stage, cancelCountdown, countdown]);

  useEffect(() => {
    startRef.current = startGame;
  }, [startGame]);

  // Changing order or mirror mid-game restarts with the new setting right away.
  useEffect(() => {
    if (!restartOnChange.current) return;
    restartOnChange.current = false;
    startGame();
  }, [order, mirror, startGame]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    setPhase("select");
  }, [cancelCountdown]);

  const { pause, resume } = usePause({
    phase,
    setPhase,
    rafRef,
    cancelCountdown,
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
      keysRef.current = buildKeyMap(loadKeyBindings().solo);
    },
  });

  // ─── KEYS ───
  useEffect(() => {
    if (settingsOpen) return;
    const onDown = (e) => {
      if (phase === "select") {
        if (e.code === "Escape") return onBack();
        if (e.code === "KeyG") setGuide((g) => !g);
        return;
      }
      if (e.code === "Escape") {
        if (phase === "playing" || phase === "countdown") return pause();
        if (phase === "paused") return resume();
        return stop();
      }
      if (e.repeat) return;
      if (e.code === restartKey() && phase !== "countdown") {
        e.preventDefault();
        return startGame();
      }
      // In-game settings (only when the key isn't bound to a game action)
      if (!keysRef.current[e.code]) {
        if (e.code === "KeyG") return setGuide((g) => !g);
        if (e.code === "KeyO") {
          restartOnChange.current = true;
          return setOrder((o) => (o === "fixed" ? "random" : "fixed"));
        }
        if (e.code === "KeyM") {
          restartOnChange.current = true;
          return setMirror((m) => (m === "on" ? "off" : "on"));
        }
        if (e.code === "KeyN") return setAutoNext((a) => (a === "all" ? "off" : "all"));
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
      cancelCountdown();
    },
    [cancelCountdown],
  );

  // ─── SELECT ───
  if (phase === "select") {
    return (
      <div className="page wide" style={{ "--accent": "#b14fd0" }}>
        <h1 className="title">{t("Opening")}</h1>
        <p className="lede">
          {t("Get the common openers into your hands.")}
        </p>
        <div className="mid">
        <div className="openers">
          <div>
            <div className="oplist">
              {OPENERS.map((o, i) => (
                <button
                  key={o.id}
                  className={(openerIdx === i ? "on" : "") + (o.disabled ? " off" : "")}
                  disabled={o.disabled}
                  onClick={() => selectOpener(i)}
                >
                  <span className="nm">
                    {o.name} <span className="small dim">{o.jp}</span>
                    {o.disabled && <span className="tag">{t("Soon")}</span>}
                  </span>
                  <span className="ds">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="preview stages" role="radiogroup" aria-label="Stage">
            <button type="button" className={"stage-all" + (stage == null ? " on" : "")} onClick={() => setStage(null)}>
              All stages
            </button>
            {opener.steps.map((s, i) => (
              <button
                type="button"
                key={opener.id + i}
                className={"stage" + (stage === i ? " on" : "")}
                onClick={() => setStage(stage === i ? null : i)}
              >
                <span className="k">
                  {String(i + 1).padStart(2, "0")} · {s.label}
                </span>
                <StepPicture step={s} size={8} />
              </button>
            ))}
          </div>
        </div>
        <Advanced
          open={advOpen}
          onToggle={() => setAdvOpen((o) => !o)}
          changed={[
            order === "random" ? null : "Ideal order",
            mirror === "on" ? null : "Mirror off",
            guide ? null : "Guide hidden",
            autoNext === "all" ? null : "Auto next off",
          ].filter(Boolean)}
        >
        <div className="opts inline">
          <div className="opt">
            <div className="k">{t("Piece order")}</div>
            <Segmented
              label="Piece order"
              options={[
                { id: "fixed", label: "Ideal" },
                { id: "random", label: "Random bag" },
              ]}
              value={order}
              onChange={setOrder}
            />
          </div>
          <div className="opt">
            <div className="k">{t("Mirror")}</div>
            <Segmented
              label="Mirror"
              options={[
                { id: "off", label: "Off" },
                { id: "on", label: "On" },
              ]}
              value={mirror}
              onChange={setMirror}
            />
          </div>
          <div className="opt">
            <div className="k">{t("Guide")}</div>
            <Segmented
              label="Guide"
              options={[
                { id: true, label: "Show" },
                { id: false, label: "Hide" },
              ]}
              value={guide}
              onChange={setGuide}
            />
          </div>
          <div className="opt">
            <div className="k">{t("Auto next")}</div>
            <Segmented
              label="Auto next"
              options={[
                { id: "off", label: "Off" },
                { id: "all", label: "On" },
              ]}
              value={autoNext}
              onChange={setAutoNext}
            />
          </div>
        </div>
        </Advanced>
        </div>
        <div className="actions">
          <SetupInfo settings={settings} />
          <div className="action-row">
            <button className="btn ghost" onClick={onBack}>
              {t("Back")}
            </button>
            <button className="btn primary" onClick={startGame}>
              {t("Start")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAY ───
  const st = run.current;
  const engine = engineRef.current;
  // In stage practice the run has one step; show it as that stage of the opener.
  const stepIdx = runStage != null ? runStage : Math.min(st.step, opener.steps.length - 1);
  const step = opener.steps[stepIdx];
  const remaining = new Set();
  if (st.target && !st.done) for (const row of st.target) for (const ch of row) if (ch && ch !== "X") remaining.add(ch);
  void remaining;
  const hintText =
    phase !== "playing" || !guide
      ? ""
      : st.hint === "hold"
        ? t("Hold the {p}.", { p: ID_LETTER[engine?.currentId] || "" })
        : st.hint === "stuck"
          ? t("No solution from here. Press {key} to restart.", { key: keyLabel(restartKey()) })
          : "";

  return (
    <>
      <div className="mode-label">
        {t("Opening")} · {opener.name}
        {runStage != null ? ` · ${t("Stage {n}", { n: runStage + 1 })}` : ""}
        {opener.mirrored ? " · Mirrored" : ""}
      </div>
      <div className="play" style={{ zoom }}>
        {settings.showLog !== false && <EngineLog engineRef={engineRef} />}
        <div className="side" style={{ width: 150 }}>
          <div>
            <div className="k">{t("Hold")}</div>
            <canvas ref={holdRef} width={HOLD_W} height={HOLD_H} style={{ marginTop: 8 }} />
          </div>
          <Stat k="Time" v={formatTime(engine?.clock || 0)} big />
          <div className="stat">
            <div className="k">{t("Faults")}</div>
            <div key={missFlash} className={"v" + (missFlash ? " flash" : "")}>
              {st.misses}
            </div>
          </div>
          <div>
            <div className="k">
              {t("Step {n} / {m}", { n: stepIdx + 1, m: opener.steps.length })}
            </div>
            <div className="v xs" style={{ marginTop: 4 }}>
              {step.label}
            </div>
          </div>
          {/* Always rendered so turning auto next on/off never shifts the column */}
          <div style={{ visibility: autoNext === "off" ? "hidden" : "visible" }}>
            <Stat k="Streak" v={streak} />
          </div>
          {settings.showKeys && <KeyStrokes key={settings.keysVersion} />}
        </div>

        <div className="board-wrap">
          <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="board-frame" />

          {phase === "countdown" && <Countdown text={countdownText} />}
          {phase === "paused" && <PauseMenu onResume={resume} onRestart={() => startGame()} onSetup={stop} onMenu={onBack} />}

          {phase === "playing" && st.lastAction && (
            <div key={st.actionKey} className="action-pop">
              {st.lastAction}
            </div>
          )}

          {phase === "done" && (
            <div className="veil">
              {result ? (
                <>
                  <div className="k">{t("{name} built", { name: opener.name })}</div>
                  <div className="title">
                    {formatTime(result.time)}
                  </div>
                  <div className="grid2">
                    <Stat k="Faults" v={result.misses === 0 ? "Clean" : result.misses} />
                    <Stat k="Pieces" v={result.pieces} />
                    <Stat k="PPS" v={result.pps.toFixed(2)} />
                    <Stat k="Order" v={order === "fixed" ? "Ideal" : "Random"} />
                    {result.finish && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Stat k="Finish" v={result.finish} />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="k">{t("Top out")}</div>
                  <div className="title">{t("Try again")}</div>
                  <div style={{ height: 24 }} />
                </>
              )}
              <div className="row-btns">
                <button className="btn primary" onClick={startGame}>
                  {t("Again")}
                </button>
                <button className="btn ghost" onClick={stop}>
                  {t("Mode options")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="side right" style={{ width: 150 }}>
          <div>
            <div className="k">{t("Next")}</div>
            <canvas ref={queueRef} width={HOLD_W} height={QUEUE_SLOT * 5} style={{ marginTop: 8 }} />
          </div>
          <div>
            {/* Space is always reserved so the hint never pushes anything around */}
            <p
              className="note"
              style={{ marginTop: 0, minHeight: "3.2em", visibility: hintText ? "visible" : "hidden" }}
            >
              {hintText || "–"}
            </p>
          </div>
          <KeyHints style={{ flexDirection: "column", alignItems: "flex-start" }} items={[
              [[keyLabel(restartKey())], "restart"],
              [["G"], `guide ${guide ? "on" : "off"}`, !!guide],
              [["O"], `order ${order === "fixed" ? "ideal" : "random"}`],
              [["M"], `mirror ${mirror}`, mirror === "on"],
              [["N"], `auto next ${autoNext === "all" ? "on" : "off"}`, autoNext === "all"],
              [["J"], `log ${settings.showLog !== false ? "on" : "off"}`, settings.showLog !== false],
            [["K"], `input ${settings.showKeys ? "on" : "off"}`, !!settings.showKeys],
              [["Esc"], phase === "paused" ? "resume" : "pause"],
            ]} />
        </div>
      </div>
    </>
  );
}
