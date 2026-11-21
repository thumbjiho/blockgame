import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { t } from "../i18n.js";
import { formatTime, getShape } from "../game.js";
import { parseLog, buildFrames, logMode } from "../replay.js";
import { analyze, bestLine } from "../analysis.js";
import { evalPosition } from "../bots/review.js";
import { sampleLog } from "../sample.js";
import { drawBoard, drawHold, drawQueue, BOARD_W, BOARD_H, HOLD_W, HOLD_H, SLOT } from "../render.js";
import { Stat, KeyHints, ReplayLog, Kbd, PauseMenu } from "../ui.jsx";
import { useFit } from "../fit.js";
import { selectKey, keyLabel } from "../keys.js";

const ACCENT = "#3fc8b4";
const LETTER_ID = { I: 1, T: 2, L: 3, J: 4, S: 5, Z: 6, O: 7 };
const SPEEDS = [0.5, 1, 2, 4];
const PASTE_MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
// What a replay is of: "Sprint 40 lines", "Battle · P1 vs Cold Clear". Empty
// when the log does not say. tail is added after it (for the summary line).
const MODE_NAMES = { sprint: "Sprint", battle: "Battle", opening: "Opening", finesse: "Finesse" };
function modeName(m, tail = " · ") {
  if (!MODE_NAMES[m.mode]) return "";
  const detail = m.lines ? " " + t("{n} lines", { n: m.lines }) : m.vs ? ` · ${m.me} vs ${m.vs}${m.level ? ` (${t(m.level)})` : ""}` : "";
  return t(MODE_NAMES[m.mode]) + detail + tail;
}
const NO_MOMENTS = [];
// Short labels on the score row (the help beside it spells them out).
const SCORES = [
  ["macro", "MCR", "Stack planning, whatever the speed"],
  ["dexterity", "DXT", "Raw speed of the hands"],
  ["finesse", "FNS", "How few key presses each placement took"],
];
const GRADES = { brilliant: "Brilliant", good: "Good", inaccuracy: "Inaccuracy", mistake: "Mistake", blunder: "Blunder", slow: "Slow", waste: "Wasted keys" };
const BEAT_MS = 400; // one event per beat at 1× (so 4× shows ten a second)
const LOAD_MS = 2200; // staged length of the analysis loading
const STAGES = ["Reading the log…", "Weighing every placement…", "Timing the hands…", "Counting key presses…", "Picking the key moments…"];
const stageOf = (p) => Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
const LINE_AHEAD = 3; // pieces of the queue the better line goes on for
const KIND_NAMES = { macro: "Macro", dexterity: "Dexterity", finesse: "Finesse" };
// The run as a whole: a rank from the three scores together, a title that
// goes with it, and which of the three carried it or held it back.
const RANKS = [
  [90, "S", "Near flawless"],
  [80, "A", "A strong run"],
  [65, "B", "A solid run"],
  [50, "C", "Room to grow"],
  [35, "D", "An uneven run"],
  [0, "E", "Back to basics"],
];
function verdict(review) {
  const kinds = Object.keys(KIND_NAMES);
  // Macro counts double: quick, exact hands do not make up for a poor stack.
  const avg = (2 * review.scores.macro + review.scores.dexterity + review.scores.finesse) / 4;
  const [, rank, title] = RANKS.find(([min]) => avg >= min);
  const sorted = [...kinds].sort((a, b) => review.scores[b] - review.scores[a]);
  const [best, worst] = [sorted[0], sorted[sorted.length - 1]];
  const even = review.scores[best] - review.scores[worst] < 10;
  return { rank, title, note: even ? ["Even across all three."] : ["Strongest in {best}, weakest in {worst}.", { best: KIND_NAMES[best], worst: KIND_NAMES[worst] }] };
}
const MAX_LINES = 400; // lines of a pasted log shown on the input page

// ─── Lab: watch a run again from its copied piece log ───
export default function Lab({ settings, initial = "", onBack }) {
  // A log handed over from a result screen opens straight into its replay.
  const [text, setText] = useState(initial);
  const [open, setOpen] = useState(!!initial);
  const [error, setError] = useState("");
  const settingsOpen = !!settings.settingsOpen;

  // The log is read as soon as it arrives, so the page can say what is in it.
  const replay = useMemo(() => {
    const events = parseLog(text);
    return events.some((e) => e.kind === "place") ? { events, ...buildFrames(events), mode: logMode(text, events) } : null;
  }, [text]);
  const lines = useMemo(() => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean), [text]);

  const take = useCallback((pasted) => {
    const clean = (pasted || "").trim();
    if (!clean) return setError("The clipboard is empty.");
    const valid = parseLog(clean).some((e) => e.kind === "place");
    setText(clean);
    setError(valid ? "" : "No pieces found in this log.");
    // A log that reads goes straight to its replay, which analyses it at once.
    if (valid) setOpen(true);
  }, []);
  // The button is always offered where the browser has the API. A refusal
  // (blocked for this site, or an embedded browser) is explained on the spot.
  const canRead = !!navigator.clipboard?.readText;
  const pasteFromClipboard = () =>
    navigator.clipboard
      .readText()
      .then(take)
      .catch(() => setError("This browser blocked clipboard access for this site. Allow it in the site settings, or paste with {key}."));

  // Pasting with the keyboard works anywhere on the page; Esc goes back.
  useEffect(() => {
    if (open || settingsOpen) return;
    const onPaste = (e) => {
      e.preventDefault();
      take(e.clipboardData?.getData("text"));
    };
    const onKey = (e) => {
      if (e.code === "Escape") onBack();
    };
    window.addEventListener("paste", onPaste);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, settingsOpen, onBack, take]);

  if (open && replay) return <Viewer replay={replay} look={settings.look} keysOff={settingsOpen} onClose={() => setOpen(false)} onMenu={onBack} />;

  const last = replay?.frames[replay.frames.length - 1];
  return (
    <div className="page" style={{ "--accent": ACCENT }}>
      <h1 className="title">{t("Replay")}</h1>
      <p className="lede">{t("Paste a log to watch the run again and analyse it.")}</p>
      <div className="mid">
        {/* What the pasted log holds, above the box. The row is there even while
            empty, so nothing moves when a log lands. */}
        <div className="lab-head">
          {lines.length > 0 && (
            <>
              <span>
                {replay
                  ? `${modeName(replay.mode)}${t("{n} pieces", { n: last.placed })} · ${formatTime(replay.events[replay.events.length - 1].t)} · ${t("{n} lines", { n: last.lines })}`
                  : t("Not a log")}
              </span>
              {canRead && (
                <button className="link" onClick={pasteFromClipboard}>
                  {t("Paste again")}
                </button>
              )}
            </>
          )}
        </div>
        <div className="lab-box">
          {/* An unseen text field over the box: a click puts the cursor in it,
              so the paste shortcut and the right-click menu always have a
              real field to paste into. It never keeps what lands in it. */}
          <textarea
            className="lab-catch"
            value=""
            aria-label={t("Paste a log here")}
            spellCheck={false}
            onChange={(e) => {
              take(e.target.value);
              e.target.blur();
            }}
            onPaste={(e) => {
              e.preventDefault();
              e.stopPropagation();
              take(e.clipboardData.getData("text"));
              e.target.blur();
            }}
          />
          {lines.length === 0 ? (
            <div className="lab-empty">
              {/* Where the browser refuses clipboard access the button could only
                  fail, so the keyboard shortcut is offered on its own. */}
              {canRead && (
                <button className="btn" onClick={pasteFromClipboard}>
                  {t("Paste from clipboard")}
                </button>
              )}
              {/* For a look without a log of your own: a made-up 40-line run. */}
              <button className="btn ghost" onClick={() => take(sampleLog())}>
                {t("Try a sample")}
              </button>
              <div className="lab-keys">
                <Kbd>{PASTE_MOD}</Kbd>
                <Kbd>V</Kbd>
                <span>{t(canRead ? "also pastes" : "to paste the log")}</span>
              </div>
            </div>
          ) : (
            // Long lines are cut short, so the box never scrolls sideways.
            <ol className="lab-lines scroll">
              {lines.slice(0, MAX_LINES).map((l, n) => (
                <li key={n}>{l}</li>
              ))}
              {lines.length > MAX_LINES && <li>…</li>}
            </ol>
          )}
        </div>
        <div className="key-msg">{error && <span className="err">{t(error, { key: `${PASTE_MOD}V` })}</span>}</div>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={() => setOpen(true)} disabled={!replay}>
          {t("Play replay")}
        </button>
        <button className="btn ghost" onClick={onBack}>
          {t("Back")}
        </button>
      </div>
    </div>
  );
}

// Transport and navigation icons. Chevrons step, the triangle plays.
const ICONS = {
  first: <path d="M17 6.5 11.5 12l5.5 5.5M7.5 6.5v11" />,
  prev: <path d="M14.5 6.5 9 12l5.5 5.5" />,
  next: <path d="M9.5 6.5 15 12l-5.5 5.5" />,
  last: <path d="M7 6.5 12.5 12 7 17.5M16.5 6.5v11" />,
  back: <path d="M11 6.5 5.5 12l5.5 5.5M6 12h12.5" />,
  close: <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />,
  play: <path className="solid" d="M8.5 5.5v13l10-6.5z" />,
  pause: <path className="solid" d="M8 5.5h2.5v13H8zM13.5 5.5H16v13h-2.5z" />,
};
// main: the filled, reversed one (play); round: a quiet filled circle (close).
function IconButton({ icon, label, main, round, ...rest }) {
  return (
    <button type="button" className={"lab-icon" + (main ? " lead" : "") + (round ? " round" : "")} title={t(label)} aria-label={t(label)} {...rest}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {ICONS[icon]}
      </svg>
    </button>
  );
}

// One picture per thing scored, used beside its score and on the comments
// about it: a brain for macro (planning the stack), a bolt for dexterity
// (speed), a target for finesse (exact, with nothing wasted).
const KIND_ICONS = {
  // Brain outline, after the Lucide icon set (ISC licence).
  macro: (
    <>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    </>
  ),
  dexterity: <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" />,
  // A target with an arrow in its centre: the fewest inputs, placed exactly.
  finesse: (
    <>
      <circle cx="10.5" cy="13.5" r="7.5" />
      <circle cx="10.5" cy="13.5" r="3" />
      <path d="M10.5 13.5 20.5 3.5M16.5 3.5h4v4" />
    </>
  ),
};
function KindIcon({ kind }) {
  return (
    <svg className={"lab-kind-icon " + kind} viewBox="0 0 24 24" aria-hidden="true">
      {KIND_ICONS[kind]}
    </svg>
  );
}

// The mark of a grade: a filled circle in one of the piece colours, with the
// annotation sign (as in chess reviews) or a small picture.
const GRADE_ICONS = {
  brilliant: "!!",
  good: <path className="solid" d="M12 4.2l2.3 4.9 5.3.7-3.9 3.7 1 5.3-4.7-2.6-4.7 2.6 1-5.3-3.9-3.7 5.3-.7z" />,
  inaccuracy: "?!",
  mistake: "?",
  blunder: "??",
  slow: (
    <>
      <circle cx="12" cy="13.5" r="6" />
      <path d="M12 13.5V10M10 4.5h4" />
    </>
  ),
  waste: (
    <>
      <rect x="5" y="7.5" width="14" height="10" rx="2.2" />
      <path d="M12 10.2v4.6M9.7 12.5h4.6" />
    </>
  ),
};
function GradeIcon({ grade }) {
  const icon = GRADE_ICONS[grade];
  return (
    <i className={"lab-badge " + grade} aria-hidden="true">
      {typeof icon === "string" ? icon : <svg viewBox="0 0 24 24">{icon}</svg>}
    </i>
  );
}

// Text that types itself out, a few characters at a time. The part not yet
// typed is there but unseen, so the bubble has its final size from the start.
// instant: show it whole at once (while the replay is running past).
function Typed({ text, instant }) {
  const still = instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = useState(still ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) return;
    const id = setTimeout(() => setN((v) => Math.min(text.length, v + 2)), 24);
    return () => clearTimeout(id);
  }, [n, text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <i className="lab-caret" aria-hidden="true" />}
      <span style={{ visibility: "hidden" }}>{text.slice(n)}</span>
    </>
  );
}

// What the three scores mean and where the bar sits, on hover (or focus) of a
// small question mark at the end of the score row. Macro is judged differently
// in a Battle (against the engine) than elsewhere, so its text follows the run.
function ScoreHelp({ review, mode }) {
  const rows = [
    [
      "macro",
      "Macro",
      mode === "sprint"
        ? ["How well the stack was built, read off the result: how little was left on the board, and how much was cleared in quads.", "40 lines in 100 pieces, all quads, is 100. All singles in 102 pieces is 55. The moves pointed out come from an engine tuned for Sprint."]
        : review.engine
        ? ["How well the stack was built. Every move is compared with the best move of the Cold Clear engine.", "The engine itself scores 90 to 95. Stacking flat with no mistakes, but no T-spins, is about 65 to 70."]
        : ["How well the stack was built. Every move is compared with the best spot for gaps, height and flatness.", "A stack with no covered gaps scores 90 or more. In a Battle the engine is the yardstick instead."],
    ],
    [
      "dexterity",
      "Dexterity",
      mode === "sprint"
        ? ["How fast the pieces go down.", "For 40 lines: 2:00 is 25, 1:00 is 50, 0:30 is 75, 0:15 is 100."]
        : ["How fast the pieces go down, in pieces per second (PPS).", "By TETR.IO's rank averages: D (0.7 PPS) is 37, B (1.1) is 52, S (1.6) is 67, U (2.4) is 81, X+ (3.5) is 95."],
    ],
    ["finesse", "Finesse", ["The share of pieces placed without a wasted key press.", "70% is the usual mark for moving on to harder things."]],
  ];
  return (
    <span className="lab-help">
      <button type="button" aria-label={t("About the scores")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9M12 16.9v.2" />
        </svg>
      </button>
      <span className="lab-tip" role="tooltip">
        {rows.map(([kind, name, lines]) => (
          <span key={kind} className="lab-tip-row">
            <b>
              <KindIcon kind={kind} />
              {t(name)}
            </b>
            {lines.map((line) => (
              <span key={line}>{t(line)}</span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

// The summary, set out like a certificate so it never reads as one of the
// move comments: a seal with the rank, the title, then what stood out.
function Award({ review }) {
  const v = verdict(review);
  const [key, vars] = v.note;
  return (
    <div className={"lab-award rank-" + v.rank}>
      <div className="lab-seal" aria-label={v.rank}>
        {v.rank}
      </div>
      <div className="lab-award-title">{t(v.title)}</div>
      <p className="lab-award-note">{t(key, vars && { best: t(vars.best), worst: t(vars.worst) })}</p>
      {review.traits.length > 0 && (
        <ul className="lab-traits">
          {review.traits.map((trait, n) => (
            <li key={trait.text[0]} className={trait.good ? "good" : "bad"} style={{ "--i": n }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {trait.good ? <path d="M5.5 12.5l4.2 4.2L18.5 8" /> : <path d="M12 6.5v7M12 17.2v.3" />}
              </svg>
              <span>{t(trait.text[0], trait.text[1])}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// A score that counts up to its value when it first appears.
function CountUp({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const began = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - began) / 700);
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return n;
}

function Viewer({ replay, look, keysOff, onClose, onMenu }) {
  const { events, frames, dealt } = replay;
  const total = events.length;
  // Wide enough for the log on the left and the review on the right.
  const zoom = useFit(1260, 600);
  const canvasRef = useRef(null);
  const holdRef = useRef(null);
  const queueRef = useRef(null);

  // step: how many events have happened; clock: the replay's own time.
  const [step, setStep] = useState(0);
  const [clock, setClock] = useState(0);
  // Opens stopped: the analysis starts by itself and goes to the first moment.
  const [playing, setPlaying] = useState(false);
  // Esc pauses, as in the game modes: the menu is the way out.
  const [menu, setMenu] = useState(null); // null, or { wasPlaying }
  const [speed, setSpeed] = useState(4); // starts fast; the button steps down from there
  const clockRef = useRef(0);

  const seek = useCallback(
    (k) => {
      const n = Math.min(total, Math.max(0, k));
      clockRef.current = n ? events[n - 1].t : 0;
      setClock(clockRef.current);
      setStep(n);
    },
    [events, total],
  );

  // Playback: one event per beat, at an even pace. The log says when each
  // piece locked but not how it got there, so the player's own timing is not
  // re-enacted; the clock on the left still shows the real time of each move.
  useEffect(() => {
    if (!playing || step >= total) return;
    const id = setTimeout(() => {
      seek(step + 1);
      if (step + 1 >= total) setPlaying(false);
    }, BEAT_MS / speed);
    return () => clearTimeout(id);
  }, [playing, speed, step, total, seek]);

  // Analysis: scores and the moments worth a second look. `review` is null
  // until asked for, a number (0..1) while it runs, then the result.
  const [review, setReview] = useState(0); // starts analysing as soon as it opens
  // "Show": the better line from this moment, played out piece by piece on
  // the board. It belongs to the step it was asked on; moving away ends it.
  const [line, setLine] = useState(null); // { step, moves, shown }
  const startAnalysis = () => {
    // The numbers themselves come in an instant. The loading is staged on a
    // fixed clock instead (LOAD_MS, easing out), so the review arrives with
    // some ceremony and the result is shown when both are done.
    let began = null;
    const staged = new Promise((done) => {
      const tick = (now) => {
        began ??= now;
        const p = Math.min(1, (now - began) / LOAD_MS);
        setReview((r) => (typeof r === "number" ? 1 - (1 - p) ** 2.2 : r));
        if (p < 1) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });
    Promise.all([analyze(replay, undefined, evalPosition), staged]).then(([result]) => {
      // It opens on the summary of the whole run; the moments come after.
      setReview(result);
    });
  };
  // Runs once, when the replay opens.
  const began = useRef(false);
  useEffect(() => {
    if (began.current) return;
    began.current = true;
    startAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const moments = review && typeof review === "object" ? review.moments : NO_MOMENTS;
  const momentAt = moments.findIndex((m) => m.step === step);
  // The start of the replay shows the summary: always when nothing happened
  // on the first move, and until Next is pressed when something did.
  const [intro, setIntro] = useState(true);
  const overview = step === 0 && !playing && (intro || momentAt < 0);
  const moment = momentAt >= 0 && !overview ? moments[momentAt] : null;
  const shownLine = line && line.step === step ? line : null;
  const showLine = () => {
    const ids = [LETTER_ID[events[step].type], ...dealt.slice(frames[step].dealtCount, frames[step].dealtCount + LINE_AHEAD)];
    setPlaying(false);
    // A move that clears lines takes two beats: the piece on the board with
    // the rows still full, then the board after they are gone.
    // An engine moment brings its own line; the others are worked out here.
    const moves = (moment?.line || bestLine(frames[step].matrix, ids, replay.mode.mode, moment?.first)).flatMap((m, n) =>
      m.cleared && m.placed ? [{ ...m, piece: n + 1, matrix: m.placed, cleared: 0 }, { ...m, piece: n + 1 }] : [{ ...m, piece: n + 1 }],
    );
    setLine({ step, moves, shown: 1 });
  };
  // One more piece of the line every beat. Once it is all on the board it
  // stays a moment, then goes away by itself, back to the real game.
  useEffect(() => {
    if (!shownLine) return;
    const done = shownLine.shown >= shownLine.moves.length;
    const id = setTimeout(() => setLine((l) => (done ? null : l && { ...l, shown: l.shown + 1 })), done ? 1400 : 520);
    return () => clearTimeout(id);
  }, [shownLine]);
  // Next or previous moment from wherever the replay is. Going forward, the
  // moves in between are run through quickly first (about a second at most),
  // so the moment is seen in the flow of the game and not as a cut.
  const rushRef = useRef(null);
  const stopRush = useCallback(() => {
    clearInterval(rushRef.current);
    rushRef.current = null;
  }, []);
  useEffect(() => stopRush, [stopRush]);
  const jump = useCallback(
    (d) => {
      setIntro(false);
      // From the summary, Next first shows what happened on the opening move.
      if (d > 0 && overview && momentAt >= 0) return;
      const target = d > 0 ? moments.find((m) => m.step > step) : [...moments].reverse().find((m) => m.step < step);
      if (!target) return;
      stopRush();
      setPlaying(false);
      if (d < 0) return seek(target.step);
      let at = step;
      const stride = Math.max(1, Math.ceil((target.step - step) / 22));
      rushRef.current = setInterval(() => {
        at = Math.min(target.step, at + stride);
        seek(at);
        if (at >= target.step) stopRush();
      }, 55);
    },
    [moments, step, seek, stopRush, overview, momentAt],
  );

  const hasNext = moments.some((m) => m.step > step || (overview && m.step === step));
  const restart = () => {
    stopRush();
    setPlaying(false);
    setIntro(true);
    seek(0);
  };

  const firstMoment = () => {
    stopRush();
    setPlaying(false);
    setIntro(false);
    seek(moments[0].step);
  };

  const toggle = useCallback(() => {
    stopRush();
    if (!playing && step >= total) seek(0);
    setPlaying((p) => !p);
  }, [playing, step, total, seek, stopRush]);
  const stepBy = useCallback(
    (d) => {
      stopRush();
      setPlaying(false);
      seek(step + d);
    },
    [seek, step, stopRush],
  );

  useEffect(() => {
    if (keysOff) return;
    const onKey = (e) => {
      if (e.code === "Escape") {
        // Open the pause menu, or close it and go on as before.
        if (menu) {
          setPlaying(menu.wasPlaying);
          setMenu(null);
        } else {
          stopRush();
          setMenu({ wasPlaying: playing });
          setPlaying(false);
        }
        return;
      }
      if (menu) return; // the menu takes the keys (shared navigation)
      if (e.target instanceof HTMLElement && e.target.closest("input")) return;
      if (e.code === selectKey()) {
        e.preventDefault();
        if (!e.repeat) toggle();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepBy(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepBy(1);
      } else if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        jump(e.code === "ArrowDown" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keysOff, toggle, stepBy, jump, menu, playing, stopRush]);

  // Draw: the board so far, plus the next piece above the spot it will land on.
  const frame = frames[step];
  useEffect(() => {
    const next = events[step];
    const board = { matrix: frame.matrix, currentId: 0 };
    if (next?.kind === "place") {
      Object.assign(board, {
        playing: true,
        currentId: LETTER_ID[next.type],
        currentRot: next.rot,
        currentX: next.placed[0],
        currentY: next.spawn[1],
        ghostY: next.placed[1],
      });
    }
    if (shownLine) {
      // The better line: the board as it would be, the newest piece lit, and
      // the queue moved on by as many pieces as were placed.
      const n = shownLine.shown;
      const last = shownLine.moves[n - 1];
      drawBoard(canvasRef.current, { matrix: last.matrix, currentId: 0 }, { mark: last.cleared ? null : last.cells });
      // An engine line knows what it held along the way; the others never hold.
      drawHold(holdRef.current, last.hold !== undefined ? last.hold : frame.hold);
      drawQueue(queueRef.current, last.next || dealt.slice(frame.dealtCount + last.piece - 1));
      return;
    }
    if (moment && !playing && next?.kind === "place") {
      // Stopped on a key moment: the piece is shown where it was put down
      // (before any line clears), ringed, so the move itself is easy to read.
      // The better spot is only shown by Show best, so the two never mix.
      const id = LETTER_ID[next.type];
      const shape = getShape(id, next.rot);
      const placed = frame.matrix.map((row) => row.slice());
      const cells = [];
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape.length; c++) {
          const y = next.placed[1] + r;
          const x = next.placed[0] + c;
          if (!shape[r][c] || y < 0 || y >= placed.length) continue;
          placed[y][x] = id;
          cells.push([y, x]);
        }
      }
      drawBoard(canvasRef.current, { matrix: placed, currentId: 0 }, { mark: cells });
    } else {
      drawBoard(canvasRef.current, board);
    }
    drawHold(holdRef.current, frame.hold);
    drawQueue(queueRef.current, dealt.slice(frame.dealtCount));
  }, [events, dealt, frame, step, moment, shownLine, playing, look]);

  const held = step > 0 && events[step - 1].kind === "hold";
  const shown = useMemo(() => events.slice(Math.max(0, step - 40), step), [events, step]);
  const blur = (fn) => (e) => {
    e.currentTarget.blur();
    fn();
  };

  return (
    <>
      <div className="mode-label">
        {t("Replay")}
        {replay.mode.mode === "unknown" ? "" : ` · ${modeName(replay.mode, "")}`}
      </div>
      <div style={{ zoom, "--accent": ACCENT }}>
        <div className="play">
          <ReplayLog events={shown} total={step} />
          <div className="side">
            {/* A hold is easy to miss in a replay, so the step it happens on lights
                the hold up; the key restarts the pop on every new hold. */}
            <div key={held ? step : "hold"} className={held ? "lab-held" : ""}>
              <div className="k">{t("Hold")}</div>
              <canvas ref={holdRef} width={HOLD_W} height={HOLD_H} style={{ marginTop: 8 }} />
            </div>
            {/* What was played, with the run's other facts. */}
            {MODE_NAMES[replay.mode.mode] && (
              <div className="stat">
                <div className="k">{t(MODE_NAMES[replay.mode.mode])}</div>
                <div className="v lab-mode">{replay.mode.lines ? t("{n} lines", { n: replay.mode.lines }) : replay.mode.vs ? `vs ${replay.mode.vs}` : "–"}</div>
                {/* A CPU's level, and the handicap of each side when either had
                    one: each on a line of its own, so neither wraps. */}
                {replay.mode.level && <div className="k lab-mode-sub">{t(replay.mode.level)}</div>}
                {replay.mode.handicap?.some(Boolean) && (
                  <div className="k lab-mode-sub">
                    {t("Handicap")} {replay.mode.handicap.map((h) => (h > 0 ? "+" : "") + h).join(" : ")}
                  </div>
                )}
              </div>
            )}
            <Stat k="Time" v={formatTime(clock)} big />
            <Stat k="Pieces" v={`${frame.placed} / ${frames[total].placed}`} />
            <Stat k="Lines" v={frame.lines} />
            <Stat k="PPS" v={clock > 0 ? (frame.placed / clock).toFixed(2) : "0.00"} />
          </div>
          <div className="board-wrap">
            <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="board-frame" />
            {menu && (
              <PauseMenu
                onResume={() => {
                  setPlaying(menu.wasPlaying);
                  setMenu(null);
                }}
                onSetup={onClose}
                onMenu={onMenu}
              />
            )}
          </div>
          <div className="side right">
            <div>
              <div className="k">{t("Next")}</div>
              <canvas ref={queueRef} width={HOLD_W} height={SLOT * 5} style={{ marginTop: 8 }} />
            </div>
            <KeyHints
              style={{ flexDirection: "column", alignItems: "flex-start", whiteSpace: "nowrap" }}
              items={[
                [[keyLabel(selectKey())], playing ? "pause" : "play"],
                [["←", "→"], "step"],
                ...(moments.length ? [[["↑", "↓"], "key moments"]] : []),
                [["Esc"], menu ? "resume" : "pause"],
              ]}
            />
          </div>
          {/* Everything that drives the replay sits beside the queue: the review
              on top, the timeline and transport at the bottom, level with the
              foot of the board. Nothing here changes the page's layout. */}
          <div className="lab-side">
            {/* The scores: soft pulses while they are worked out, then the numbers. */}
            <div className="lab-top">
              {review && typeof review === "object" && <ScoreHelp review={review} mode={replay.mode.mode} />}
              {review !== null && (
                <div className={"lab-scores" + (typeof review === "number" ? " waiting" : "")}>
                  {SCORES.map(([key, label, hint], n) => (
                    <div key={key} title={t(hint)} className={typeof review === "number" && review * SCORES.length > n ? "on" : ""}>
                      <div className="k lab-score-k">
                        <KindIcon kind={key} />
                        {t(label)}
                      </div>
                      {/* A soft pulse holds the place while the score is worked out. */}
                      {typeof review === "number" ? (
                        <div className="v lab-wait" style={{ "--i": n }} />
                      ) : (
                        <div className="v">
                          <CountUp to={review.scores[key]} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {typeof review === "number" && (
              <div className="lab-loading">
                <div className="lab-stage">
                  <span key={stageOf(review)}>{t(STAGES[stageOf(review)])}</span>
                  <b>{Math.round(review * 100)}%</b>
                </div>
                <i style={{ "--p": review }} />
              </div>
            )}
            {review && typeof review === "object" && (
              <>
                <div className="lab-moment">
                  {/* The comment's slot keeps one height, so the buttons under it
                      never move; away from a key moment there is only a quiet note. */}
                  <div className={"lab-slot" + (overview ? " open" : "")}>
                    {moment ? (
                      // While the replay runs, comments it passes just appear: the pop
                      // and the typing are for a moment the player stops on.
                      <div key={moment.step} className={"lab-bubble " + moment.grade + (playing ? " still" : "")}>
                        <div className="lab-bubble-head">
                          <GradeIcon grade={moment.grade} />
                          <b>
                            #{moment.step + 1} {events[moment.step].type} · {t(GRADES[moment.grade])}
                          </b>
                          <span className="lab-kind" title={t(KIND_NAMES[moment.kind])}>
                            <KindIcon kind={moment.kind} />
                          </span>
                        </div>
                        <p>
                          <Typed text={t(moment.text[0], moment.text[1])} instant={playing} />
                        </p>
                      </div>
                    ) : overview ? (
                      <Award review={review} />
                    ) : (
                      <p className="lab-quiet">{t(moments.length ? "Nothing to note at this move." : "Nothing stood out in this run.")}</p>
                    )}
                  </div>
                  {/* Previous and Next come first and never move; Show best joins
                      them on the right when there is a better line to show. */}
                  <div className="lab-moment-nav">
                    {overview ? (
                      <button type="button" className="btn primary compact" onClick={blur(() => jump(1))} disabled={!moments.length}>
                        {moments.length ? t("See {n} key moments", { n: moments.length }) : t("No key moments")}
                      </button>
                    ) : (
                      <>
                        <IconButton icon="prev" label="Previous" onClick={blur(() => jump(-1))} disabled={!moments.some((m) => m.step < step)} />
                        {/* After the last moment it leads back to the first one.
                            Both labels are laid out, so the button keeps one width. */}
                        <button type="button" className="btn primary compact lab-next" onClick={blur(() => (hasNext ? jump(1) : firstMoment()))} disabled={!moments.length}>
                          <span style={{ visibility: hasNext ? "visible" : "hidden" }}>{t("Next moment")}</span>
                          <span style={{ visibility: hasNext ? "hidden" : "visible" }}>{t("Back to start")}</span>
                        </button>
                    {moment?.best && (
                      <button type="button" className={"btn compact lab-best" + (shownLine ? " ghost" : "")} onClick={blur(() => (shownLine ? setLine(null) : showLine()))}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          {shownLine ? (
                            <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />
                          ) : (
                            <>
                              <path d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6z" />
                              <circle cx="12" cy="12" r="2.6" />
                            </>
                          )}
                        </svg>
                        {t(shownLine ? "Stop" : "Show best")}
                      </button>
                    )}
                        <span className="lab-close">
                          <IconButton icon="close" label="Back to summary" onClick={blur(restart)} />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="lab-transport">
              <div className="lab-track">
                <input
                  type="range"
                  min={0}
                  max={total}
                  value={step}
                  aria-label={t("Position")}
                  onChange={(e) => {
                    stopRush();
                    setPlaying(false);
                    seek(+e.target.value);
                  }}
                  onPointerUp={(e) => e.currentTarget.blur()}
                />
                {/* Key moments sit on the track where they happened. */}
                {moments.map((m, n) => (
                  <button
                    key={m.step}
                    type="button"
                    tabIndex={-1}
                    className={"lab-mark " + m.grade + (n === momentAt ? " on" : "")}
                    style={{ left: `calc(1.5px + (100% - 3px) * ${m.step / total})` }}
                    aria-label={`#${m.step + 1}`}
                    onClick={blur(() => {
                      stopRush();
                      setPlaying(false);
                      seek(m.step);
                    })}
                  />
                ))}
              </div>
              <div className="lab-buttons">
                <IconButton icon="first" label="First move" onClick={blur(() => stepBy(-total))} disabled={step === 0} />
                <IconButton icon="prev" label="Previous move" onClick={blur(() => stepBy(-1))} disabled={step === 0} />
                <IconButton icon={playing ? "pause" : "play"} label={playing ? "Pause" : "Play"} onClick={blur(toggle)} main />
                <IconButton icon="next" label="Next move" onClick={blur(() => stepBy(1))} disabled={step >= total} />
                <IconButton icon="last" label="Last move" onClick={blur(() => stepBy(total))} disabled={step >= total} />
                {/* One button that steps through the speeds: 4×, 2×, 1×, 0.5×, round again. */}
                <button
                  type="button"
                  className="lab-speed"
                  onClick={blur(() => setSpeed((v) => SPEEDS[(SPEEDS.indexOf(v) - 1 + SPEEDS.length) % SPEEDS.length]))}
                  title={t("Speed")}
                  aria-label={`${t("Speed")} ${speed}×`}
                >
                  {speed}×
                </button>
              </div>
              <button type="button" className="btn lab-menu" onClick={onMenu}>
                {t("Main menu")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
