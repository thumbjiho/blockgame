import { useState, useEffect, useRef, useCallback } from "react";
import {
  COLS,
  ROWS,
  CELL,
  BlockEngine,
  formatTime,
  getShape,
  buildReplayText,
  drawBlock,
  drawPiecePreview,
  DEFAULT_KEYS,
} from "../game.js";

// ─── DROP SOUND ───
let audioCtx = null;

function playDropSound() {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext || window.webkitAudioContext
    )();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 800;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + 0.08,
  );
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.08);
}

const SPRINT_OPTIONS = [1, 20, 40, 100, 1000];

export default function Sprint({ settings, onBack }) {
  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const keysRef = useRef(DEFAULT_KEYS);
  const prevPlacedRef = useRef(0);
  const stateRef = useRef("select");
  const settingsRef = useRef(settings);
  const gameLoopRef = useRef(null);

  // select | countdown | playing | completed | gameover
  const [phase, setPhase] = useState("select");
  const [countdownText, setCountdownText] = useState("");
  const [displayTime, setDisplayTime] = useState("0:00.000");
  const [displayLines, setDisplayLines] = useState(40);
  const [displayPPS, setDisplayPPS] = useState("0.00");
  const [displayAction, setDisplayAction] = useState("");
  const [actionKey, setActionKey] = useState(0);
  const [displayAttack, setDisplayAttack] = useState(0);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sprintLines, setSprintLines] = useState(
    () => {
      try {
        const saved = localStorage.getItem("jbl-settings");
        return saved ? JSON.parse(saved).sprintLines ?? 40 : 40;
      } catch {
        return 40;
      }
    },
  );

  // Sync refs
  useEffect(() => {
    stateRef.current = phase;
  }, [phase]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("jbl-settings") || "{}");
      saved.sprintLines = sprintLines;
      localStorage.setItem("jbl-settings", JSON.stringify(saved));
    } catch { /* ignore */ }
  }, [sprintLines]);

  // ─── RENDERER ───
  const render = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL + 0.5);
      ctx.lineTo(COLS * CELL, r * CELL + 0.5);
      ctx.stroke();
    }
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL + 0.5, 0);
      ctx.lineTo(c * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    ctx.strokeStyle = "#222";
    for (let r = 1; r < ROWS; r++) {
      for (let c = 1; c < COLS; c++) {
        const cx = c * CELL,
          cy = r * CELL;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 0.5);
        ctx.lineTo(cx + 3, cy + 0.5);
        ctx.moveTo(cx + 0.5, cy - 3);
        ctx.lineTo(cx + 0.5, cy + 3);
        ctx.stroke();
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (engine.matrix[r][c] !== 0) {
          drawBlock(ctx, c, r, engine.matrix[r][c]);
        }
      }
    }

    if (
      engine.currentId &&
      (engine.playing || engine.completed || engine.gameOver)
    ) {
      const shape = getShape(engine.currentId, engine.currentRot);
      const size = shape.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shape[r][c]) {
            const gy = engine.ghostY + r;
            if (gy >= 0)
              drawBlock(ctx, engine.currentX + c, gy, engine.currentId, 1, true);
          }
        }
      }
      if (engine.playing) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (shape[r][c]) {
              const py = engine.currentY + r;
              if (py >= 0)
                drawBlock(ctx, engine.currentX + c, py, engine.currentId);
            }
          }
        }
      }
    }

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, COLS * CELL - 2, ROWS * CELL - 2);

    const hCanvas = holdRef.current;
    if (hCanvas) {
      const hctx = hCanvas.getContext("2d");
      hctx.clearRect(0, 0, hCanvas.width, hCanvas.height);
      if (engine.hold !== null) {
        drawPiecePreview(hctx, engine.hold, 4, 6, 16);
      }
    }

    const qCanvas = queueRef.current;
    if (qCanvas) {
      const qctx = qCanvas.getContext("2d");
      qctx.clearRect(0, 0, qCanvas.width, qCanvas.height);
      for (let i = 0; i < Math.min(5, engine.queue.length); i++) {
        drawPiecePreview(qctx, engine.queue[i], 4, 6 + i * 50, 16);
      }
    }
  }, []);

  // ─── END STATS ───
  const buildEndStats = useCallback((engine) => {
    const pps =
      engine.clock > 0
        ? (engine.placedBlocks / engine.clock).toFixed(2)
        : "0.00";
    const s = settingsRef.current;
    return {
      ...engine.stats,
      time: engine.clock,
      pps: parseFloat(pps),
      lines: engine.lines,
      attack: engine.totalAttack,
      blocks: engine.placedBlocks,
      replayText: buildReplayText(
        engine,
        { das: s.das, arr: s.arr, sprintLines: engine.sprintLines },
        {
          time: engine.clock,
          pps: parseFloat(pps),
          blocks: engine.placedBlocks,
        },
      ),
    };
  }, []);

  // ─── GAME LOOP ───
  useEffect(() => {
    gameLoopRef.current = (timestamp) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (engine.placedBlocks > prevPlacedRef.current) {
        prevPlacedRef.current = engine.placedBlocks;
        if (settingsRef.current.soundEnabled) playDropSound();
      }

      if (engine.completed && stateRef.current !== "completed") {
        setPhase("completed");
        setStats(buildEndStats(engine));
        render();
        return;
      }
      if (engine.gameOver && stateRef.current !== "gameover") {
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

      setDisplayTime(formatTime(engine.clock));
      setDisplayLines(engine.linesRemaining);
      const pps =
        engine.clock > 0
          ? (engine.placedBlocks / engine.clock).toFixed(2)
          : "0.00";
      setDisplayPPS(pps);
      setDisplayAction(engine.lastAction);
      setActionKey((k) => k + 1);
      setDisplayAttack(engine.totalAttack);

      if (engine.completed) {
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
    const s = settingsRef.current;
    const engine = new BlockEngine({
      das: s.das,
      arr: s.arr,
      sdf: s.sdf,
      sprintLines,
    });
    engineRef.current = engine;
    prevPlacedRef.current = 0;
    engine.start();
    setPhase("playing");
    setDisplayAction("");
    setDisplayAttack(0);
    setStats(null);
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoopRef.current);
  }, [sprintLines]);

  const countdownRef = useRef(null);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setPhase("countdown");
    setCountdownText("READY");
    countdownRef.current = setTimeout(() => {
      setCountdownText("START!");
      countdownRef.current = setTimeout(() => {
        launchGame();
      }, 500);
    }, 700);
  }, [launchGame]);

  // ─── KEY HANDLING ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const action = keysRef.current[e.key];

      if (e.key === "f" || e.key === "F" || e.key === "\u3139") {
        if (phase === "playing" || phase === "gameover" || phase === "completed") {
          startGame();
          return;
        }
      }
      if (e.key === "c" || e.key === "C" || e.key === "\u314A") {
        if ((phase === "completed" || phase === "gameover") && stats?.replayText) {
          navigator.clipboard
            .writeText(stats.replayText)
            .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => console.error("Copy failed:", err));
          return;
        }
      }
      if (e.key === "Escape") {
        if (phase === "playing" || phase === "gameover" || phase === "completed") {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setPhase("select");
          return;
        }
        if (phase === "select") {
          onBack();
          return;
        }
      }
      if (e.key === "Enter" && phase === "select") {
        startGame();
        return;
      }

      if (!action || phase !== "playing") return;
      e.preventDefault();
      engineRef.current?.onKeyDown(action, performance.now());
    };
    const handleKeyUp = (e) => {
      const action = keysRef.current[e.key];
      if (!action) return;
      engineRef.current?.onKeyUp(action);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, startGame, stats, onBack]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  const isGame = phase === "playing" || phase === "completed" || phase === "gameover" || phase === "countdown";

  // ─── SELECT SCREEN ───
  if (phase === "select") {
    return (
      <div style={{ textAlign: "center", zIndex: 10 }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -1,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          <span style={{ color: "#00f0f0" }}>SPRINT</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#555",
            marginBottom: 40,
            letterSpacing: 2,
          }}
        >
          SELECT LINE COUNT
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {SPRINT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSprintLines(n)}
              style={{
                padding: "8px 20px",
                border: "1px solid",
                fontSize: 14,
                fontFamily: "inherit",
                cursor: "pointer",
                borderColor: sprintLines === n ? "#00f0f0" : "#333",
                background:
                  sprintLines === n ? "rgba(0,240,240,0.1)" : "transparent",
                color: sprintLines === n ? "#00f0f0" : "#888",
                transition: "all 0.15s",
              }}
            >
              {n}L
            </button>
          ))}
        </div>

        <button
          onClick={startGame}
          style={{
            padding: "14px 56px",
            background: "#00f0f0",
            color: "#000",
            border: "none",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            letterSpacing: 2,
            transition: "all 0.15s",
          }}
        >
          START
        </button>
        <div style={{ fontSize: 11, color: "#555", marginTop: 12 }}>
          or press ENTER
        </div>

        <button
          onClick={onBack}
          style={{
            marginTop: 32,
            padding: "8px 24px",
            background: "transparent",
            border: "1px solid #333",
            color: "#888",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          BACK
        </button>
      </div>
    );
  }

  // ─── GAME VIEW ───
  return (
    <>
      {/* Title badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 24,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 4,
          color: "#00f0f0",
          textTransform: "uppercase",
          opacity: 0.7,
          zIndex: 20,
        }}
      >
        {sprintLines}L SPRINT
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        {/* Left panel: Hold + Stats */}
        <div style={{ width: 90, textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 4 }}>HOLD</div>
          <canvas
            ref={holdRef}
            width={80}
            height={48}
            style={{ border: "1px solid #222", background: "#0a0a0a", display: "block", margin: "0 auto 16px" }}
          />
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 2 }}>TIME</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{displayTime}</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 2 }}>LINES</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              color: displayLines <= 5 ? "#f00" : displayLines <= 10 ? "#f0a000" : "#00f0f0",
            }}
          >
            {displayLines}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 2 }}>PPS</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#aaa", marginBottom: 12 }}>{displayPPS}</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 2 }}>ATK</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#f0a000" }}>{displayAttack}</div>
        </div>

        {/* Main board */}
        <div style={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            style={{ display: "block", border: "2px solid #333" }}
          />

          {/* Countdown overlay */}
          {phase === "countdown" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 30,
              }}
            >
              <div
                key={countdownText}
                style={{
                  fontSize: countdownText === "START!" ? 42 : 36,
                  fontWeight: 700,
                  color: countdownText === "START!" ? "#00f0f0" : "#fff",
                  letterSpacing: 6,
                  textShadow: "0 0 24px rgba(0,240,240,0.6)",
                  animation: "countPulse 0.4s ease-out",
                }}
              >
                {countdownText}
              </div>
            </div>
          )}

          {displayAction && (
            <div
              key={actionKey}
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 0 12px rgba(0,240,240,0.8), 0 2px 4px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                animation: "fadeUp 1s ease-out forwards",
              }}
            >
              {displayAction}
            </div>
          )}

          {/* Completed overlay */}
          {phase === "completed" && stats && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: "#00f0f0", marginBottom: 8 }}>
                {sprintLines}L SPRINT CLEAR
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
                {formatTime(stats.time)}
              </div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 2, textAlign: "center" }}>
                <span style={{ color: "#aaa" }}>{stats.blocks} blocks</span> &middot;{" "}
                <span style={{ color: "#f0a000" }}>{stats.pps.toFixed(2)} PPS</span> &middot;{" "}
                <span style={{ color: "#00f0f0" }}>{stats.attack} ATK</span>
                <br />
                Quads: {stats.quads} &middot; T-Spins: {stats.tspins} &middot; PCs: {stats.pcs}
                <br />
                Max Combo: {stats.maxCombo} &middot; B2Bs: {stats.b2bs}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => {
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                    startGame();
                  }}
                  style={{
                    width: 160, padding: "10px 0", fontSize: 13, fontWeight: 700,
                    color: "#000", background: "#00f0f0", border: "none", borderRadius: 4,
                    cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 0 16px rgba(0,240,240,0.4)",
                  }}
                >
                  NEW GAME
                </button>
                <button
                  onClick={() => {
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                    onBack();
                  }}
                  style={{
                    width: 160, padding: "8px 0", fontSize: 12, fontWeight: 600,
                    color: "#666", background: "transparent", border: "1px solid #333",
                    borderRadius: 4, cursor: "pointer", letterSpacing: 1,
                  }}
                >
                  MAIN MENU
                </button>
                {stats.replayText && (
                  <button
                    title="Copy replay"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(stats.replayText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (e) {
                        console.error("Copy failed:", e);
                      }
                    }}
                    style={{
                      width: 160, padding: "8px 0", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600,
                      color: copied ? "#00f0f0" : "#555", background: "transparent",
                      border: "none", borderRadius: 4, cursor: "pointer", letterSpacing: 1,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{copied ? "\u2713" : "\u29C9"}</span>
                    {copied ? "COPIED" : "COPY LOG"}
                  </button>
                )}
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: "#555", lineHeight: 1.6, textAlign: "center" }}>
                F = new game<br />C = copy<br />ESC = menu
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {phase === "gameover" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: "#f00", marginBottom: 16 }}>
                TOP OUT
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>
                {stats?.lines || 0} lines in {formatTime(stats?.time || 0)}
              </div>
              {stats?.replayText && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(stats.replayText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (e) {
                      console.error("Copy failed:", e);
                    }
                  }}
                  style={{
                    marginTop: 16, padding: "8px 18px", fontSize: 12, fontWeight: 600,
                    color: copied ? "#000" : "#00f0f0", background: copied ? "#00f0f0" : "transparent",
                    border: "1px solid #00f0f0", borderRadius: 4, cursor: "pointer", letterSpacing: 1,
                  }}
                >
                  {copied ? "COPIED!" : "COPY REPLAY"}
                </button>
              )}
              <div style={{ marginTop: 20, fontSize: 11, color: "#555", lineHeight: 1.6, textAlign: "center" }}>
                F = new game<br />C = copy<br />ESC = menu
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Queue */}
        <div style={{ width: 90, textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 4 }}>NEXT</div>
          <canvas
            ref={queueRef}
            width={80}
            height={260}
            style={{ border: "1px solid #222", background: "#0a0a0a", display: "block", margin: "0 auto" }}
          />
          <div style={{ marginTop: 16, fontSize: 10, letterSpacing: 2, color: "#666", marginBottom: 2 }}>DAS/ARR</div>
          <div style={{ fontSize: 12, color: "#555" }}>{settings.das}/{settings.arr}</div>
        </div>
      </div>
    </>
  );
}
