import { useState, useEffect, useRef, useCallback } from "react";
import { t } from "../i18n.js";
import { BlockEngine, formatTime, buildReplayText } from "../game.js";
import { createTrace } from "../trace.js";
import { buildKeyMap, loadKeyBindings, restartKey, keyLabel } from "../keys.js";
import { drawBoard, drawHold, drawQueue, BOARD_W, BOARD_H, HOLD_W, HOLD_H, SLOT } from "../render.js";
import { sfx, sfxForAction, trackSfx } from "../sound.js";
import { Stat, SetupInfo, Countdown, KeyHints, ReplayLog, KeyStrokes, PauseMenu, Icon } from "../ui.jsx";
import { useDisplayToggles, usePause, useSettingsDialog, tune, heldActions, useCountdown } from "../display.js";
import { useFit } from "../fit.js";

const SPRINT_OPTIONS = [1, 20, 40, 100];

export default function Sprint({ settings, onBack }) {
  // In-game display toggles (L log, K key input); they change the saved setting.
  useDisplayToggles(settings);
  const zoom = useFit(640, 600);
  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const keysRef = useRef(buildKeyMap(loadKeyBindings().solo));
  const prevPlacedRef = useRef(0);
  const stateRef = useRef("select");
  const settingsRef = useRef(settings);
  const gameLoopRef = useRef(null);

  // select | countdown | playing | completed | gameover
  const [phase, setPhase] = useState("select");
  const [displayTime, setDisplayTime] = useState("0:00.00");
  const [displayLines, setDisplayLines] = useState(40);
  const [displayPPS, setDisplayPPS] = useState("0.00");
  const [displayAction, setDisplayAction] = useState("");
  const [actionKey, setActionKey] = useState(0);
  const actionPieceRef = useRef(-1);
  const [displayAttack, setDisplayAttack] = useState(0);
  const [stats, setStats] = useState(null);
  const [log, setLog] = useState({ events: [], total: 0 });
  const logLenRef = useRef(0);
  // Always opens on 40 lines, whatever was played last.
  const [sprintLines, setSprintLines] = useState(40);

  // Sync refs
  useEffect(() => {
    stateRef.current = phase;
  }, [phase]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // How each piece moved, kept beside the engine's own log.
  const traceRef = useRef(null);

  // ─── RENDERER ───
  const render = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    drawBoard(canvasRef.current, engine, { dead: engine.gameOver });
    drawHold(holdRef.current, engine.hold, engine.holdUsed);
    drawQueue(queueRef.current, engine.queue);
  }, []);

  // ─── END STATS ───
  const buildEndStats = useCallback((engine) => {
    const pps =
      engine.clock > 0
        ? (engine.placedBlocks / engine.clock).toFixed(2)
        : "0.00";
    const s = settingsRef.current;
    const moves = traceRef.current?.text();
    return {
      ...engine.stats,
      time: engine.clock,
      pps: parseFloat(pps),
      lines: engine.lines,
      attack: engine.totalAttack,
      blocks: engine.placedBlocks,
      // The log, then how each piece moved (for a replay at the real pace).
      replayText:
        buildReplayText(
          engine,
          { das: s.das, arr: s.arr, sprintLines: engine.sprintLines },
          {
            time: engine.clock,
            pps: parseFloat(pps),
            blocks: engine.placedBlocks,
          },
        ) + (moves ? "\n\n" + moves : ""),
    };
  }, []);

  // ─── GAME LOOP ───
  useEffect(() => {
    gameLoopRef.current = (timestamp) => {
      const engine = engineRef.current;
      if (!engine) return;

      trackSfx(engine);

      // The last piece usually locks inside a key handler, between two frames,
      // so the run can already be over here: bring the side numbers up to the
      // final state before stopping.
      const syncHud = () => {
        setDisplayTime(formatTime(engine.clock));
        setDisplayLines(engine.linesRemaining);
        setDisplayPPS(engine.clock > 0 ? (engine.placedBlocks / engine.clock).toFixed(2) : "0.00");
        setDisplayAttack(engine.totalAttack);
      };

      if (engine.completed && stateRef.current !== "completed") {
        syncHud();
        sfx.win();
        setPhase("completed");
        setStats(buildEndStats(engine));
        render();
        return;
      }
      if (engine.gameOver && stateRef.current !== "gameover") {
        syncHud();
        setPhase("gameover");
        setStats(buildEndStats(engine));
        render();
        return;
      }
      if (!engine.playing) {
        render();
        return;
      }

      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      engine.update(Math.min(dt, 100), performance.now());
      traceRef.current?.sample(engine);

      setDisplayTime(formatTime(engine.clock));
      setDisplayLines(engine.linesRemaining);
      const pps =
        engine.clock > 0
          ? (engine.placedBlocks / engine.clock).toFixed(2)
          : "0.00";
      setDisplayPPS(pps);
      // Pop the clear text once per clear (re-keying every frame would restart
      // its animation forever, so it only showed after the loop stopped).
      if (engine.lastAction && engine.placedBlocks !== actionPieceRef.current) {
        actionPieceRef.current = engine.placedBlocks;
        setDisplayAction(engine.lastAction);
        setActionKey((k) => k + 1);
      }
      setDisplayAttack(engine.totalAttack);
      if (engine.replay.length !== logLenRef.current) {
        logLenRef.current = engine.replay.length;
        setLog({ events: engine.replay.slice(-40), total: engine.replay.length });
      }

      if (engine.completed) {
        sfx.win();
        setPhase("completed");
        setStats(buildEndStats(engine));
        render();
        return;
      }
      if (engine.gameOver) {
        setPhase("gameover");
        setStats(buildEndStats(engine));
        render();
        return;
      }

      render();
      rafRef.current = requestAnimationFrame(gameLoopRef.current);
    };
  }, [render, buildEndStats]);

  // ─── START GAME (with countdown) ───
  const launchGame = useCallback(() => {
    const engine = engineRef.current;
    prevPlacedRef.current = 0;
    logLenRef.current = 0;
    setLog({ events: [], total: 0 });
    engine.start(heldActions(keysRef.current));
    traceRef.current = createTrace();
    traceRef.current.sample(engine);
    setPhase("playing");
    setDisplayAction("");
    setDisplayAttack(0);
    setStats(null);
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoopRef.current);
  }, []);

  const [countdownText, countdown, cancelCountdown] = useCountdown();

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    // The engine is made now, not at "Go", so the countdown can show the pieces
    // that are coming. The seed keeps that order when start() resets it.
    const s = settingsRef.current;
    engineRef.current = new BlockEngine({
      das: s.das,
      arr: s.arr,
      sdf: s.sdf,
      sprintLines,
      seed: Math.floor(Math.random() * 2 ** 31),
    });
    render();
    setPhase("countdown");
    setDisplayAction("");
    actionPieceRef.current = -1;
    countdown(launchGame, 700, 500);
  }, [launchGame, sprintLines, render, cancelCountdown, countdown]);

  // Coming from the setup screen the canvases only exist once the game view is up.
  useEffect(() => {
    if (phase === "countdown") render();
  }, [phase, render]);

  const { pause, resume } = usePause({
    phase,
    setPhase,
    rafRef,
    cancelCountdown,
    lastTimeRef,
    loopRef: gameLoopRef,
    engineRef,
    restart: startGame,
  });
  const toSetup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    setPhase("select");
  }, [cancelCountdown]);

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

  // ─── KEY HANDLING ───
  useEffect(() => {
    if (settingsOpen) return;
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const action = keysRef.current[e.code];

      if (e.code === restartKey()) {
        if (phase === "playing" || phase === "paused" || phase === "gameover" || phase === "completed") {
          startGame();
          return;
        }
      }
      if (e.key === "Escape") {
        if (phase === "playing" || phase === "countdown") return pause();
        if (phase === "paused") return resume();
        if (phase === "gameover" || phase === "completed") {
          toSetup();
          return;
        }
        if (phase === "select") {
          onBack();
          return;
        }
      }

      if (!action || phase !== "playing") return;
      e.preventDefault();
      // Noted before and after: a hard drop locks the piece inside the call.
      traceRef.current?.sample(engineRef.current);
      engineRef.current?.onKeyDown(action, performance.now());
      traceRef.current?.sample(engineRef.current);
      sfxForAction(action);
    };
    const handleKeyUp = (e) => {
      const action = keysRef.current[e.code];
      if (!action) return;
      engineRef.current?.onKeyUp(action);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, startGame, stats, onBack, pause, resume, settingsOpen, toSetup]);

  // Reload bindings whenever entering select (settings may have been edited)
  useEffect(() => {
    if (phase === "select") {
      keysRef.current = buildKeyMap(loadKeyBindings().solo);
    }
  }, [phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cancelCountdown();
    };
  }, [cancelCountdown]);

  // Take the log straight to Replay.
  const logButtons = (
    <button className="btn replay" onClick={() => settings.analyze(stats.replayText)}>
      <Icon name="robot" size={16} />
      {t("Analyze")}
    </button>
  );

  // ─── SELECT SCREEN ───
  if (phase === "select") {
    return (
      <div className="page" style={{ "--accent": "#41b6e6" }}>
        <h1 className="title">{t("Sprint")}</h1>
        <p className="lede">{t("Clear the set number of lines as fast as you can.")}</p>
        <div className="opts center">
          <div className="opt">
            <div className="k">{t("Lines")}</div>
            {/* Plenty of room here, so the choices are big buttons in a column */}
            <div className="choice-list" role="radiogroup" aria-label="Lines">
              {SPRINT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={sprintLines === n}
                  className={sprintLines === n ? "on" : ""}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    if (n !== sprintLines) sfx.tick();
                    setSprintLines(n);
                  }}
                >
                  <span className="n">{n}</span>
                  <span className="u">{n === 1 ? "line" : "lines"}</span>
                </button>
              ))}
            </div>
          </div>
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

  const linesColor = displayLines <= 5 ? "var(--bad)" : undefined;

  // ─── GAME VIEW ───
  return (
    <>
      <div className="mode-label">Sprint · {sprintLines} lines</div>
      <div className="play" style={{ zoom }}>
        {settings.showLog !== false && <ReplayLog events={log.events} total={log.total} />}
        <div className="side">
          <div>
            <div className="k">{t("Hold")}</div>
            <canvas ref={holdRef} width={HOLD_W} height={HOLD_H} style={{ marginTop: 8 }} />
          </div>
          <Stat k="Time" v={displayTime} big />
          <div className="stat">
            <div className="k">{t("Lines left")}</div>
            <div className="v big" style={{ color: linesColor }}>
              {displayLines}
            </div>
          </div>
          <Stat k="PPS" v={displayPPS} />
          <Stat k="Attack" v={displayAttack} />
          {settings.showKeys && <KeyStrokes key={settings.keysVersion} />}
        </div>

        <div className="board-wrap">
          <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="board-frame" />

          {phase === "countdown" && <Countdown text={countdownText} />}
          {phase === "paused" && <PauseMenu onResume={resume} onRestart={startGame} onSetup={toSetup} onMenu={onBack} />}

          {displayAction && (
            <div key={actionKey} className="action-pop">
              {displayAction}
            </div>
          )}

          {phase === "completed" && stats && (
            <div className="veil">
              <div className="k">{sprintLines} lines cleared</div>
              <div className="title">
                {formatTime(stats.time)}
              </div>
              <div className="grid2">
                <Stat k="Pieces" v={stats.blocks} />
                <Stat k="PPS" v={stats.pps.toFixed(2)} />
                <Stat k="Attack" v={stats.attack} />
                <Stat k="Quads" v={stats.quads} />
                <Stat k="T-spins" v={stats.tspins} />
                <Stat k="Max combo" v={stats.maxCombo} />
              </div>
              <div className="row-btns">
                <button className="btn primary" onClick={startGame}>
                  {t("Again")}
                </button>
                {logButtons}
                <button className="btn ghost" onClick={onBack}>
                  {t("Main menu")}
                </button>
              </div>
            </div>
          )}

          {phase === "gameover" && (
            <div className="veil">
              <div className="k">{t("Top out")}</div>
              <div className="title">{formatTime(stats?.time || 0)}</div>
              <div className="k">{t("{n} lines", { n: stats?.lines || 0 })}</div>
              <div className="row-btns">
                <button className="btn primary" onClick={startGame}>
                  {t("Again")}
                </button>
                {stats?.replayText && logButtons}
                <button className="btn ghost" onClick={onBack}>
                  {t("Main menu")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="side right">
          <div>
            <div className="k">{t("Next")}</div>
            <canvas ref={queueRef} width={HOLD_W} height={SLOT * 5} style={{ marginTop: 8 }} />
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
