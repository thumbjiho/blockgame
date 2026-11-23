import { Fragment, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { t } from "../i18n.js";
import { usePlaying, useDisplayToggles, useSettingsDialog, tune, heldActions, useCountdown } from "../display.js";
import { ROWS, CELL, BlockEngine, buildLogText, formatTime } from "../game.js";
import { CPUPlayer } from "../cpu.js";
import { BotPlayer } from "../bots/player.js";
import { createTrace } from "../trace.js";
import { buildKeyMap, loadKeyBindings } from "../keys.js";
import { drawBoard, drawHold, drawQueue, prep, boardTone, BOARD_W, BOARD_H, HOLD_W, HOLD_H, SLOT } from "../render.js";
import { SetupInfo, Countdown, KeyHints, Dropdown, Stepper, EngineLog, KeyStrokes, Icon, Stat } from "../ui.jsx";
import { sfx, sfxForAction, trackSfx } from "../sound.js";
import { useFit } from "../fit.js";

const METER_W = 6;
const NO_CURSORS = [0, 0];
const SIDE_W = 120; // hold column: wide enough for the key input and a long bot name
const LOG_W = 196; // piece log and its gap

const WHO = [
  { id: "p1", label: "Player 1" },
  { id: "cpu", label: "CPU" },
  { id: "p2", label: "Player 2" },
];
const LEVELS = [
  { id: "easy", label: "Easy" },
  { id: "normal", label: "Normal" },
  { id: "hard", label: "Hard" },
  { id: "max", label: "Max" },
];
// Which engine plays the CPU seat. Stacker is SZO's own simple heuristic.
const BOTS = [
  { id: "cc", label: "Cold Clear" },
  { id: "misa", label: "MisaMino" },
  { id: "stacker", label: "Stacker", note: "Simple" },
];
const botName = (id) => BOTS.find((b) => b.id === id)?.label ?? "CPU";
const makeCpu = (engine, bot, level) => (bot === "stacker" ? new CPUPlayer(engine, level === "max" ? "hard" : level) : new BotPlayer(engine, bot, level));
// Handicap: lines added to (or taken from) every attack this seat sends.
const SEAT_COLOR = { p1: "#41b6e6", p2: "#e8505b", cpu: "#8a8a8a" };

// A seat in the match: who plays it, and the CPU level when it's the CPU.
function SeatCard({ seat, seats, humans }) {
  const isCpu = seat.who === "cpu";
  const name = WHO.find((w) => w.id === seat.who).label;
  const sub = isCpu ? botName(seat.bot) : t(humans === 1 ? "Solo keys" : seat.who === "p1" ? "P1 keys" : "P2 keys");
  // Picking a player who already sits elsewhere swaps the two seats.
  const options = WHO.map((w) => {
    const takenBy = w.id !== "cpu" && seats.find((o) => o !== seat && o.who === w.id);
    return { ...w, note: takenBy ? t("Swap with seat {n}", { n: takenBy.n }) : null };
  });
  const choose = (id) => {
    const other = id !== "cpu" && seats.find((o) => o !== seat && o.who === id);
    if (other) other.setWho(seat.who);
    seat.setWho(id);
  };
  return (
    <div className="seat" style={{ "--seat": SEAT_COLOR[seat.who] }}>
      <div className="k">{t("Seat {n}", { n: seat.n })}</div>
      <div className="seat-id">
        <div className="seat-name">{t(name)}</div>
        <div className="seat-sub">{sub}</div>
      </div>
      <div className="seat-fields">
        <Dropdown label={t("Seat {n} player", { n: seat.n })} value={seat.who} options={options} onChange={choose} />
        {/* Always rendered so switching to/from CPU never shifts the layout */}
        <div className="seat-row" style={{ visibility: isCpu ? "visible" : "hidden" }}>
          <Dropdown label={t("Seat {n} bot", { n: seat.n })} value={seat.bot} options={BOTS} onChange={seat.setBot} />
          <Dropdown label={t("Seat {n} CPU level", { n: seat.n })} value={seat.level} options={LEVELS} onChange={seat.setLevel} />
        </div>
        <div className="seat-hc">
          <span className="k" title={t("Lines added to or taken from every attack")}>{t("Handicap")}</span>
          <Stepper
            label={t("Seat {n} handicap", { n: seat.n })}
            value={seat.handicap}
            onChange={seat.setHandicap}
            min={-3}
            max={3}
            format={(v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0")}
          />
        </div>
      </div>
    </div>
  );
}

function loadBattlePrefs() {
  try {
    return JSON.parse(localStorage.getItem("jbl-battle") || "{}");
  } catch {
    return {};
  }
}

// The rising floor, always on: from 30 seconds in, one solid row every two
// seconds, so a match between two who never top out still ends (and its log
// stays short enough for a QR code). It stops at 15 rows, leaving 5 at the
// top to play in.
const FLOOR_RULE = { start: 30, every: 2, max: 15 };

function createEngine(settings, attackBonus = 0, seed) {
  return new BlockEngine({
    attackBonus,
    seed,
    floor: FLOOR_RULE,
    das: settings.das,
    arr: settings.arr,
    sdf: settings.sdf,
    sprintLines: 999999, // never trigger sprint completion
  });
}

// log: "left" | "right" | null, the side the piece log sits on; isCpu hides its
// key counts; keyProfile: the key profile to show as input, for a human seat;
// hints: key hints under the queue, where the solo modes have them.
// The pause or result menu over one seat's board. cursor: the button this
// seat's own keys are on, when each player drives their own menu (two humans);
// without it the shared keyboard navigation works the menu.
// side: 0 left, 1 right, handed to the button's action.
function SeatMenu({ k, title, items, cursor, side }) {
  return (
    <div className="veil pause" data-nav={cursor == null ? undefined : "off"}>
      {k && <div className="k">{k}</div>}
      <div className="title">{title}</div>
      <div className="row-btns">
        {items.map((it, i) => {
          return (
            <button key={it.label} className={"btn" + (it.kind ? " " + it.kind : "") + (cursor === i ? " cursor" : "")} onClick={() => it.run(side)}>
              {it.icon && <Icon name={it.icon} size={16} />}
              {t(it.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// overlay: the pause or result screen, shown over this seat's board.
function PlayerBoard({ engineRef, label, sub, mirror, log, isCpu, keyProfile, hints, overlay }) {
  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);
  const meterRef = useRef(null);
  const [stats, setStats] = useState({ time: formatTime(0), pps: "0.00", attack: 0 });

  useEffect(() => {
    let raf;
    const tick = () => {
      const engine = engineRef.current;
      drawBoard(canvasRef.current, engine, { dead: engine?.gameOver });
      if (engine) {
        const now = { time: formatTime(engine.clock), pps: (engine.clock > 0 ? engine.placedBlocks / engine.clock : 0).toFixed(2), attack: engine.totalAttack };
        setStats((was) => (was.time === now.time && was.pps === now.pps && was.attack === now.attack ? was : now));
        drawHold(holdRef.current, engine.hold, engine.holdUsed);
        drawQueue(queueRef.current, engine.queue);
        const m = meterRef.current;
        if (m) {
          const ctx = prep(m, METER_W, BOARD_H);
          ctx.fillStyle = boardTone().meter;
          ctx.fillRect(0, 0, METER_W, BOARD_H);
          // Ready garbage (will rise on the next drop) is solid; garbage that
          // is still charging sits above it, dimmed.
          const { ready, charging } = engine.garbageCounts();
          const r = Math.min(ready, ROWS);
          const ch = Math.min(charging, ROWS - r);
          ctx.fillStyle = r >= 4 ? "#e8505b" : boardTone().mark;
          ctx.fillRect(0, BOARD_H - r * CELL, METER_W, r * CELL);
          ctx.fillStyle = boardTone().charge;
          ctx.fillRect(0, BOARD_H - (r + ch) * CELL, METER_W, ch * CELL);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engineRef]);

  const hold = (
    <div className="side" style={{ width: SIDE_W }}>
      <div>
        <div className="k">{t("Hold")}</div>
        <canvas ref={holdRef} width={HOLD_W} height={HOLD_H} style={{ marginTop: 8 }} />
      </div>
      <div>
        <div className="v s">{label}</div>
        {sub && <div className="k" style={{ marginTop: 4 }}>{sub}</div>}
      </div>
      {/* As in Sprint: the time, the pace and what this side has sent. */}
      <Stat k="Time" v={stats.time} big />
      <Stat k="PPS" v={stats.pps} />
      <Stat k="Attack" v={stats.attack} />
      {keyProfile && <KeyStrokes key={keyProfile} profile={keyProfile} />}
    </div>
  );
  const next = (
    <div className="side right" style={{ width: HOLD_W }}>
      <div>
        <div className="k">{t("Next")}</div>
        <canvas ref={queueRef} width={HOLD_W} height={SLOT * 5} style={{ marginTop: 8 }} />
      </div>
      {hints && <KeyHints style={{ flexDirection: "column", alignItems: "flex-start", whiteSpace: "nowrap" }} items={hints} />}
    </div>
  );
  const board = (
    <div style={{ display: "flex", gap: 6, flexDirection: mirror ? "row-reverse" : "row" }}>
      <div className="board-wrap">
        <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="board-frame" style={{ display: "block" }} />
        {overlay}
      </div>
      <canvas ref={meterRef} width={METER_W} height={BOARD_H} />
    </div>
  );

  return (
    <div className="play" style={{ gap: 20 }}>
      {log && <EngineLog engineRef={engineRef} side={log} keys={!isCpu} />}
      {hold}
      {board}
      {next}
    </div>
  );
}

export default function Battle({ settings, onBack }) {
  // J and K show or hide the piece logs and the key input, as in the solo modes.
  const showLog = settings.showLog !== false;
  const showKeys = !!settings.showKeys;
  // select | countdown | playing | finished
  const [phase, setPhase] = useState("select");
  // Each side is Player 1, Player 2 or CPU (a human can only be on one side).
  const saved = loadBattlePrefs();
  const [left, setLeft] = useState(saved.left ?? "p1");
  const [right, setRight] = useState(saved.right ?? "cpu");
  const [leftLevel, setLeftLevel] = useState(saved.leftLevel ?? "normal");
  const [rightLevel, setRightLevel] = useState(saved.rightLevel ?? "normal");
  const [leftBot, setLeftBot] = useState(saved.leftBot ?? "cc");
  const [rightBot, setRightBot] = useState(saved.rightBot ?? "cc");
  const [leftHandicap, setLeftHandicap] = useState(saved.leftHandicap ?? 0);
  const [rightHandicap, setRightHandicap] = useState(saved.rightHandicap ?? 0);
  const humanSeats = [left, right].filter((x) => x !== "cpu").length;
  // Only the key profiles this match uses can take J or K away from the toggles.
  useDisplayToggles(settings, humanSeats === 2 ? ["p1", "p2"] : humanSeats === 1 ? ["solo"] : []);
  const profileOf = (slot) => (!showKeys || slot === "cpu" ? null : humanSeats === 1 ? "solo" : slot);
  // Room for the logs and the key input is always kept, so J and K never move
  // or rescale the boards.
  const zoom = useFit(2 * (SIDE_W + BOARD_W + METER_W + HOLD_W + 46) + 56 + 2 * LOG_W, 600);
  const [, forceUpdate] = useState(0);
  const [winner, setWinner] = useState(null); // "p1" | "p2"

  const engine1Ref = useRef(null);
  const engine2Ref = useRef(null);
  const cpusRef = useRef([]);
  const tracesRef = useRef([]);
  const seatsRef = useRef(["p1", "cpu"]);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const phaseRef = useRef("select");
  const settingsRef = useRef(settings);
  const [countdownText, countdown, cancelCountdown] = useCountdown();
  const loopRef = useRef(null);

  // Key map per player
  const p1KeysRef = useRef({});
  const p2KeysRef = useRef({});

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    try {
      localStorage.setItem("jbl-battle", JSON.stringify({ left, right, leftLevel, rightLevel, leftBot, rightBot, leftHandicap, rightHandicap }));
    } catch {
      /* ignore */
    }
  }, [left, right, leftLevel, rightLevel, leftBot, rightBot, leftHandicap, rightHandicap]);

  const reloadKeys = useCallback(() => {
    const all = loadKeyBindings();
    const humans = [left, right].filter((x) => x !== "cpu").length;
    const mapFor = (slot) => (slot === "cpu" ? {} : buildKeyMap(humans === 1 ? all.solo : all[slot]));
    p1KeysRef.current = mapFor(left);
    p2KeysRef.current = mapFor(right);
  }, [left, right]);

  useEffect(() => {
    reloadKeys();
  }, [reloadKeys]);

  // Shared loop, ref-based to avoid stale closures.
  useEffect(() => {
    loopRef.current = (timestamp) => {
      const e1 = engine1Ref.current;
      const e2 = engine2Ref.current;
      if (!e1 || !e2 || phaseRef.current !== "playing") return;

      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;
      const cappedDt = Math.min(dt, 100);
      const now = performance.now();

      e1.update(cappedDt, now);
      e2.update(cappedDt, now);
      for (const cpu of cpusRef.current) cpu.update(now);
      tracesRef.current[0]?.sample(e1);
      tracesRef.current[1]?.sample(e2);

      // Hand over attack whenever it is there: player pieces lock inside key
      // handlers, between frames, so "placed this frame" would miss them.
      if (e1.outgoingAttack > 0) {
        e2.receiveGarbage(e1.outgoingAttack);
        e1.outgoingAttack = 0;
      }
      if (e2.outgoingAttack > 0) {
        e1.receiveGarbage(e2.outgoingAttack);
        e2.outgoingAttack = 0;
      }

      // Sounds follow the human players' boards only (CPU boards stay quiet).
      if (seatsRef.current[0] !== "cpu") trackSfx(e1, { topout: false });
      if (seatsRef.current[1] !== "cpu") trackSfx(e2, { topout: false });

      forceUpdate((x) => x + 1);

      if (e1.gameOver || e2.gameOver) {
        const w = e1.gameOver ? "p2" : "p1";
        const winnerSeat = seatsRef.current[w === "p1" ? 0 : 1];
        const humans = seatsRef.current.filter((x) => x !== "cpu").length;
        if (winnerSeat !== "cpu" || humans === 0) sfx.win();
        else sfx.lose();
        setWinner(w);
        setPhase("finished");
        return;
      }

      rafRef.current = requestAnimationFrame(loopRef.current);
    };
  }, []);

  // Both boards are replaced at once when a match (re)starts, so the two sides
  // always begin together; the countdown then starts them.
  const launch = useCallback(() => {
    const e1 = engine1Ref.current;
    const e2 = engine2Ref.current;
    e1.start(heldActions(p1KeysRef.current));
    e2.start(heldActions(p2KeysRef.current));
    seatsRef.current = [left, right];
    // How each side's pieces moved, for the replay (see trace.js).
    const traces = [createTrace(), createTrace()];
    tracesRef.current = traces;
    traces[0].sample(e1);
    traces[1].sample(e2);
    const watched = (cpu, engine, trace) => {
      if (cpu) cpu.onStep = () => trace.sample(engine);
      return cpu;
    };
    cpusRef.current = [
      left === "cpu" ? watched(makeCpu(e1, leftBot, leftLevel), e1, traces[0]) : null,
      right === "cpu" ? watched(makeCpu(e2, rightBot, rightLevel), e2, traces[1]) : null,
    ].filter(Boolean);
    setWinner(null);
    phaseRef.current = "playing";
    setPhase("playing");
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, [left, right, leftLevel, rightLevel, leftBot, rightBot]);

  const runCountdown = useCallback(() => {
    cancelCountdown();
    setPhase("countdown");
    countdown(launch, 700, 500);
  }, [launch, cancelCountdown, countdown]);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    reloadKeys();
    // Same seed on both sides: both players get exactly the same pieces.
    const seed = Math.floor(Math.random() * 2 ** 31);
    engine1Ref.current = createEngine(settingsRef.current, leftHandicap, seed);
    engine2Ref.current = createEngine(settingsRef.current, rightHandicap, seed);
    for (const c of cpusRef.current) c.dispose?.();
    cpusRef.current = [];
    setWinner(null);
    runCountdown();
  }, [runCountdown, reloadKeys, leftHandicap, rightHandicap, cancelCountdown]);

  // Pause (Esc). A match is shared, so nothing restarts from a single key:
  // rematch and exit live in the pause menu.
  const pausedFromRef = useRef(null);
  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    pausedFromRef.current = phaseRef.current;
    // Let go of every held key so nothing keeps moving after the pause.
    for (const e of [engine1Ref.current, engine2Ref.current]) {
      if (!e) continue;
      for (const a of ["left", "right", "softdrop"]) e.onKeyUp(a);
    }
    phaseRef.current = "paused";
    setPhase("paused");
  }, [cancelCountdown]);
  const resume = useCallback(() => {
    if (pausedFromRef.current === "countdown") {
      runCountdown();
      return;
    }
    phaseRef.current = "playing";
    setPhase("playing");
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loopRef.current);
  }, [runCountdown]);
  usePlaying(phase === "playing" || phase === "countdown");
  const toSetup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelCountdown();
    setPhase("select");
  }, [cancelCountdown]);

  const settingsOpen = !!settings.settingsOpen;

  // Pause and result menus. With two humans each seat moves its own cursor with
  // its own keys: left / right (or soft drop) to move, hard drop to pick,
  // rotate counter-clockwise to go back.
  // Copies the log of the seat that asked (0 left, 1 right); that seat's
  // button says so for a moment.
  // Header of a copied log: whose board it is and who they played, with a
  // CPU's level in brackets and each side's handicap when it has one, e.g.
  // "BATTLE P1 +2 vs Cold Clear (Hard)".
  const logModes = useMemo(() => {
    const seat = (slot, bot, level, handicap) =>
      (slot === "cpu" ? `${botName(bot)} (${level[0].toUpperCase() + level.slice(1)})` : slot === "p1" ? "P1" : "P2") +
      (handicap ? ` ${handicap > 0 ? "+" : ""}${handicap}` : "");
    const a = seat(left, leftBot, leftLevel, leftHandicap);
    const b = seat(right, rightBot, rightLevel, rightHandicap);
    return [`BATTLE ${a} vs ${b}`, `BATTLE ${b} vs ${a}`];
  }, [left, right, leftBot, rightBot, leftLevel, rightLevel, leftHandicap, rightHandicap]);
  // A side's log, with how its pieces moved underneath.
  const logText = useCallback(
    (side) => {
      const moves = tracesRef.current[side]?.text();
      return buildLogText((side ? engine2Ref : engine1Ref).current, logModes[side]) + (moves ? "\n\n" + moves : "");
    },
    [logModes],
  );
  const { analyze } = settings;
  const analyzeLog = useCallback((side) => analyze(logText(side)), [analyze, logText]);
  const menuItems = useMemo(
    () =>
      phase === "paused"
        ? [
            { label: "Resume", kind: "primary", run: resume },
            { label: "Rematch", run: startGame },
            { label: "Mode options", run: toSetup },
            { label: "Main menu", kind: "ghost", run: onBack },
          ]
        : phase === "finished"
          ? [
              { label: "Rematch", kind: "primary", run: startGame },
              { label: "Analyze", kind: "replay", icon: "robot", run: analyzeLog },
              { label: "Mode options", run: toSetup },
              { label: "Main menu", kind: "ghost", run: onBack },
            ]
          : null,
    [phase, resume, startGame, toSetup, analyzeLog, onBack],
  );
  // A CPU's board has no menu of its own, but its game can be looked at too.
  const cpuItems = useMemo(() => [{ label: "Analyze", kind: "replay", icon: "robot", run: analyzeLog }], [analyzeLog]);
  const ownMenus = humanSeats === 2;
  // Cursors of the left and right seat, kept per phase so each menu opens on
  // its first button.
  const [cursorState, setCursorState] = useState({ phase, at: [0, 0] });
  const cursors = cursorState.phase === phase ? cursorState.at : NO_CURSORS;
  const menuSinceRef = useRef(0);
  useEffect(() => {
    menuSinceRef.current = performance.now();
  }, [phase]);
  useSettingsDialog(settings, {
    pause: () => (phaseRef.current === "playing" || phaseRef.current === "countdown") && pause(),
    apply: () => {
      tune(engine1Ref.current, settings);
      tune(engine2Ref.current, settings);
      reloadKeys();
    },
  });

  // Key handling for in-game.
  useEffect(() => {
    if (settingsOpen) return;
    const onDown = (e) => {
      if (e.code === "Escape" || e.key === "Escape") {
        if (phase === "playing" || phase === "countdown") pause();
        else if (phase === "paused") resume();
        else if (phase === "finished") toSetup();
        else if (phase === "select") onBack();
        return;
      }
      if (menuItems && ownMenus) {
        const side = p1KeysRef.current[e.code] ? 0 : p2KeysRef.current[e.code] ? 1 : -1;
        if (side < 0) return;
        e.preventDefault();
        // A short wait first, so keys mashed as the match ends pick nothing.
        if (e.repeat || performance.now() - menuSinceRef.current < 600) return;
        const action = (side ? p2KeysRef : p1KeysRef).current[e.code];
        const d = { left: -1, rotateCW: -1, right: 1, softdrop: 1 }[action];
        if (d) {
          sfx.tick();
          setCursorState({ phase, at: cursors.map((v, i) => (i === side ? Math.min(menuItems.length - 1, Math.max(0, v + d)) : v)) });
        } else if (action === "harddrop") {
          menuItems[cursors[side]]?.run(side);
        } else if (action === "rotateCCW") {
          if (phase === "paused") resume();
          else toSetup();
        }
        return;
      }
      if (phase !== "playing") return;
      if (e.repeat) return;

      const a1 = p1KeysRef.current[e.code];
      if (a1) {
        e.preventDefault();
        tracesRef.current[0]?.sample(engine1Ref.current);
        engine1Ref.current?.onKeyDown(a1, performance.now());
        tracesRef.current[0]?.sample(engine1Ref.current);
        sfxForAction(a1);
        return;
      }
      const a2 = p2KeysRef.current[e.code];
      if (a2) {
        e.preventDefault();
        tracesRef.current[1]?.sample(engine2Ref.current);
        engine2Ref.current?.onKeyDown(a2, performance.now());
        tracesRef.current[1]?.sample(engine2Ref.current);
        sfxForAction(a2);
      }
    };
    const onUp = (e) => {
      const a1 = p1KeysRef.current[e.code];
      if (a1) engine1Ref.current?.onKeyUp(a1);
      const a2 = p2KeysRef.current[e.code];
      if (a2) engine2Ref.current?.onKeyUp(a2);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [phase, onBack, startGame, pause, resume, toSetup, settingsOpen, menuItems, ownMenus, cursors]);

  // Cleanup
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cancelCountdown();
    },
    [cancelCountdown],
  );

  // ─── SELECT SCREEN ───
  if (phase === "select") {
    // One card per seat. Built from an array so more seats can be added later.
    const seats = [
      { n: 1, who: left, setWho: setLeft, bot: leftBot, setBot: setLeftBot, level: leftLevel, setLevel: setLeftLevel, handicap: leftHandicap, setHandicap: setLeftHandicap },
      { n: 2, who: right, setWho: setRight, bot: rightBot, setBot: setRightBot, level: rightLevel, setLevel: setRightLevel, handicap: rightHandicap, setHandicap: setRightHandicap },
    ];
    const bothCpu = left === "cpu" && right === "cpu";
    const humans = [left, right].filter((x) => x !== "cpu").length;
    return (
      <div className="page wide" style={{ "--accent": "#e8505b" }}>
        <h1 className="title">{t("Battle")}</h1>
        <p className="lede">
          {t("Clear lines to attack until your opponent tops out.")}
        </p>
        <div className="opts fill">
          <div className="seats">
            {seats.map((seat, i) => (
              <Fragment key={seat.n}>
                {i > 0 && (
                  <div className="vs">
                    <button
                      type="button"
                      className="swap"
                      aria-label={t("Swap seats")}
                      title={t("Swap seats")}
                      onClick={() => {
                        const a = seats[i - 1];
                        const b = seat;
                        const [aw, al, ah, ab] = [a.who, a.level, a.handicap, a.bot];
                        a.setWho(b.who);
                        a.setLevel(b.level);
                        a.setBot(b.bot);
                        b.setBot(ab);
                        a.setHandicap(b.handicap);
                        b.setWho(aw);
                        b.setLevel(al);
                        b.setHandicap(ah);
                      }}
                    >
                      <span className="swap-vs" aria-hidden="true">vs</span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 9.5h11l-2.5-2.5M17 14.5H6l2.5 2.5" />
                      </svg>
                    </button>
                  </div>
                )}
                <SeatCard seat={seat} seats={seats} humans={humans} />
              </Fragment>
            ))}
          </div>
          <p className="note slot-note">
            {bothCpu ? (
              <span className="warn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3.5 22 20.5H2Z" />
                  <path d="M12 10v4.5M12 17.2v.3" />
                </svg>
                {t("Both sides are CPU, so you'll be watching.")}
              </span>
            ) : null}
          </p>
        </div>
        <div className="actions">
          <SetupInfo settings={settings} profiles={humans === 2 ? ["p1", "p2"] : humans === 1 ? ["solo"] : []} />
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

  const nameOf = (slot, bot) => (slot === "cpu" ? botName(bot) : slot === "p1" ? "P1" : "P2");
  const levelOf = (slot, lv) => (slot === "cpu" ? t(lv[0].toUpperCase() + lv.slice(1)) : null);
  const nameP1 = nameOf(left, leftBot);
  const nameP2 = nameOf(right, rightBot);
  const done = phase === "finished";
  // The pause and result screens sit inside the board, as in the solo modes: on
  // every human seat, never on a CPU seat (with two CPUs, on the left board).
  const menuUp = phase === "paused" || done;
  const showMenu = [menuUp && (left !== "cpu" || humanSeats === 0), menuUp && right !== "cpu"];
  // A result reads the same on every board, a CPU's too: what ended the game
  // (small, above), then how it went for whoever is looking at that board.
  // A board without a menu of its own (a CPU's) shows the words and no buttons.
  const reason = done ? t("{name} topped out", { name: winner === "p1" ? nameP2 : nameP1 }) : null;
  const seatMenu = (side) => {
    if (!showMenu[side] && !done) return null;
    const won = winner === (side ? "p2" : "p1");
    return (
      <SeatMenu
        k={reason}
        title={done ? t(won ? "You win" : "You lose") : t("Paused")}
        items={showMenu[side] ? menuItems : done ? cpuItems : []}
        cursor={ownMenus && showMenu[side] ? cursors[side] : null}
        side={side}
      />
    );
  };
  // Each human seat gets the key hints under its own queue; a CPU seat has none.
  const hints = [[["Esc"], phase === "paused" ? "resume" : "pause"]];

  return (
    <>
      <div className="mode-label">
        {t("Battle")} · {nameP1} vs {nameP2}
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            gap: 56,
            alignItems: "flex-start",
            zoom,
          }}
        >
          <PlayerBoard
            engineRef={engine1Ref}
            label={nameP1}
            sub={levelOf(left, leftLevel)}
            log={showLog ? "left" : null}
            isCpu={left === "cpu"}
            keyProfile={profileOf(left)}
            hints={left === "cpu" ? null : hints}
            overlay={seatMenu(0)}
          />
          <PlayerBoard
            engineRef={engine2Ref}
            label={nameP2}
            sub={levelOf(right, rightLevel)}
            log={showLog ? "right" : null}
            isCpu={right === "cpu"}
            keyProfile={profileOf(right)}
            hints={right === "cpu" ? null : hints}
            overlay={seatMenu(1)}
          />
        </div>
        {phase === "countdown" && <Countdown text={countdownText} />}
      </div>
    </>
  );
}
