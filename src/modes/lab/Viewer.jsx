// The replay itself: the board stepping through the log, the review beside it, the transport under it.
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { t } from "../../i18n.js";
import { formatTime, getShape } from "../../game.js";
import { analyze, bestLine } from "../../analysis.js";
import { evalPosition } from "../../bots/review.js";
import { drawBoard, drawHold, drawQueue, BOARD_W, BOARD_H, HOLD_W, HOLD_H, SLOT } from "../../render.js";
import { Stat, KeyHints, ReplayLog, PauseMenu, IconButton, Icon } from "../../ui.jsx";
import { toast } from "../../ui/toast.js";
import { useFit, usePhone } from "../../fit.js";
import { selectKey, keyLabel } from "../../keys.js";
import { pathAt } from "../../trace.js";
import { replayLink } from "../../pack.js";
import { runLink } from "../../compact.js";
import { ACCENT, LETTER_ID, SPEEDS, MODE_NAMES, modeName, NO_MOMENTS, GRADES, BEAT_MS, LOAD_MS, STAGES, stageOf, LINE_AHEAD, KIND_NAMES } from "./consts.js";
import { Award, ScoreHelp } from "./Summary.jsx";
import { preloadFoils } from "../../holo/foils.js";
import { KindIcon, GradeIcon } from "./icons.jsx";
import { Typed } from "./motion.jsx";

export default function Viewer({ replay, shared = false, look, keysOff, onClose, onMenu }) {
  const { events, frames, dealt } = replay;
  const total = events.length;
  // A link that opens this run for anyone (the run itself rides in the link).
  const [linked, setLinked] = useState(false);
  const copyLink = () =>
    replayLink(replay.text)
      .then((url) => navigator.clipboard.writeText(url))
      .then(() => {
        toast("Link copied");
        setLinked(true);
        setTimeout(() => setLinked(false), 2000);
      })
      .catch((err) => console.error("Copy failed:", err));
  // The play area is 584 wide, with the log hanging 196 off its left and the
  // review 328 off its right; the three are centred as one. The log goes
  // first when the window narrows, before anything is scaled down.
  const PLAY_W = 584, LOG_W = 196, REVIEW_W = 328;
  const roomy = window.innerWidth - 64 >= LOG_W + PLAY_W + REVIEW_W;
  const fit = useFit((roomy ? LOG_W : 0) + PLAY_W + REVIEW_W, 600);
  const shift = (REVIEW_W - (roomy ? LOG_W : 0)) / 2;
  // On a phone (someone who scanned a card's QR code) the screen is laid out
  // tall instead: the board as wide as it goes with hold and next beside it,
  // then the transport and the review under it, and the page scrolls. 372 is
  // the board and its narrow side column, centred. They are as large as the
  // width allows, but no taller than what the summary above and the controls
  // below (352 px in all, with a little air) leave of the screen's height, so
  // that nothing on a phone ever scrolls.
  const phone = usePhone();
  const zoom = phone ? Math.min((window.innerWidth - 40) / 372, Math.max(0.45, (window.innerHeight - 352) / 560), 1.15) : fit;
  // The rank card's foils are fetched while the analysis is still running.
  useEffect(preloadFoils, []);
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
  const [speed, setSpeed] = useState(1); // the real pace; the button steps through the others
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

  // A log that kept how the pieces moved plays as it was played at 1× and
  // slower: the clock runs at the real pace and the piece follows its path.
  const live = !!replay.moves && speed <= 1;
  const stepRef = useRef(0);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    if (!playing || !live) return;
    let raf = 0;
    let prev = 0;
    const tick = (now) => {
      clockRef.current += prev ? (Math.min(now - prev, 100) / 1000) * speed : 0;
      prev = now;
      let n = stepRef.current;
      while (n < total && events[n].t <= clockRef.current) n++;
      if (n !== stepRef.current) {
        stepRef.current = n;
        setStep(n);
      }
      setClock(clockRef.current);
      if (n >= total) return setPlaying(false);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, live, speed, total, events]);

  // Otherwise: one event per beat, at an even pace, showing where each piece
  // ended up; the clock on the left still shows the real time of each move.
  useEffect(() => {
    if (!playing || live || step >= total) return;
    const id = setTimeout(() => {
      seek(step + 1);
      if (step + 1 >= total) setPlaying(false);
    }, BEAT_MS / speed);
    return () => clearTimeout(id);
  }, [playing, live, speed, step, total, seek]);

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
    if (playing && live) {
      // The piece in hand, where it was at this moment (garbage has no piece
      // of its own: the one falling is the next event's).
      const mine = events.slice(step).find((e) => e.kind !== "garbage" && e.kind !== "floor");
      const at = mine && pathAt(replay.moves, step, clock);
      if (at) Object.assign(board, { playing: true, currentId: LETTER_ID[mine.type], currentRot: at.rot, currentX: at.x, currentY: at.y, ghostY: at.y });
    } else if (next?.kind === "place") {
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
  }, [events, dealt, frame, step, moment, shownLine, playing, look, live, clock, replay.moves]);

  const held = step > 0 && events[step - 1].kind === "hold";
  const shown = useMemo(() => events.slice(Math.max(0, step - 40), step), [events, step]);
  const blur = (fn) => (e) => {
    e.currentTarget.blur();
    fn();
  };

  // One button that steps through the speeds: 1×, 2×, 4×, 0.5×, round again.
  // It ends the row of transport buttons; on a phone it sits beside the timeline.
  // Play and pause: in the middle of the transport, or on a phone at the head of the timeline.
  const playButton = <IconButton icon={playing ? "pause" : "play"} label={playing ? "Pause" : "Play"} onClick={blur(toggle)} variant="lead" />;
  const speedButton = (
                <button
                  type="button"
                  className="lab-speed"
                  onClick={blur(() => setSpeed((v) => SPEEDS[(SPEEDS.indexOf(v) + 1) % SPEEDS.length]))}
                  title={t("Speed")}
                  aria-label={`${t("Speed")} ${speed}×`}
                >
                  {speed}×
                </button>
  );

  return (
    <>
      <div className="mode-label">
        {t("Replay")}
        {replay.mode.mode === "unknown" ? "" : ` · ${modeName(replay.mode, "")}`}
      </div>
      <div style={{ zoom, "--accent": ACCENT, "--unzoom": 1 / zoom, "--phone-w": `${(window.innerWidth - 40) / zoom}px` }}>
        <div className={"play" + (phone ? " lab-phone" : "")} style={phone ? undefined : { position: "relative", left: -shift }}>
          {!phone && roomy && <ReplayLog events={shown} total={step} />}
          <div className="side">
            {/* A hold is easy to miss in a replay, so the step it happens on lights
                the hold up; the key restarts the pop on every new hold. */}
            <div key={held ? step : "hold"} className={held ? "lab-held" : ""}>
              <div className="k">{t("Hold")}</div>
              <canvas ref={holdRef} width={HOLD_W} height={HOLD_H} style={{ marginTop: 8 }} />
            </div>
            {/* What was played, with the run's other facts. */}
            <div className="lab-stats">
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
            {/* The scores live in the summary card (Summary.jsx). */}
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
                      <Award
                        review={review}
                        mode={replay.mode.mode}
                        card={{
                          // A run that came by a link is someone else's: the card is to
                          // look at. So is one unpacked from a QR code, however it got
                          // here (such a log carries its finesse score in its header).
                          shared: shared || replay.mode.finesse != null,
                          // A CPU's card carries its name; a person's, the name they set on the card.
                          name: replay.mode.me && !/^P[12]$/.test(replay.mode.me) ? replay.mode.me : "",
                          mode: modeName({ mode: replay.mode.mode, lines: replay.mode.lines }, ""),
                          // What the card's QR code opens: this run, where it packs small enough.
                          link: runLink(replay.text),
                          // A Sprint that reached its goal shows its time above all else.
                          time: replay.mode.mode === "sprint" && frames[total].lines >= (replay.mode.lines || Infinity) ? formatTime(events[total - 1].t) : "",
                          vs: replay.mode.vs ? `vs ${replay.mode.vs}${replay.mode.level ? ` (${t(replay.mode.level)})` : ""}` : "",
                        }}
                      />
                    ) : (
                      <p className="lab-quiet">{t(moments.length ? "Nothing to note at this move." : "Nothing stood out in this run.")}</p>
                    )}
                    {/* On a phone the link to this run sits beside the summary (the way
                        home is the mark at the top left, so the last row is not needed). */}
                    {phone && overview && (
                      <span className="lab-slot-close">
                        <IconButton icon={linked ? "check" : "link"} label={linked ? "Link copied" : "Copy link"} size="m" variant="filled" onClick={blur(copyLink)} />
                      </span>
                    )}
                    {/* On a phone the way back to the summary sits beside the comment. */}
                    {phone && !overview && (
                      <span className="lab-slot-close">
                        <IconButton icon="close" label="Back to summary" size="m" onClick={blur(restart)} />
                      </span>
                    )}
                  </div>
                  {/* Previous and Next come first and never move; Show best joins
                      them on the right when there is a better line to show. */}
                  <div className={"lab-moment-nav" + (overview ? " at-overview" : "")}>
                    {overview ? (
                      <>
                        <button type="button" className="btn primary compact" onClick={blur(() => jump(1))} disabled={!moments.length}>
                          {moments.length ? t("See {n} key moments", { n: moments.length }) : t("No key moments")}
                        </button>
                        {/* What the scores mean, at the far end of the row. */}
                        {review && typeof review === "object" && (
                          <span className="lab-close lab-nav-help">
                            <ScoreHelp review={review} mode={replay.mode.mode} />
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <IconButton icon="prev" label="Previous" onClick={blur(() => jump(-1))} disabled={!moments.some((m) => m.step < step)} />
                        {/* After the last moment it leads back to the first one.
                            Both labels are laid out, so the button keeps one width. */}
                        <button type="button" className="btn primary compact lab-next" onClick={blur(() => (hasNext ? jump(1) : firstMoment()))} disabled={!moments.length}>
                          <span style={{ visibility: hasNext ? "visible" : "hidden" }}>{t("Next")}</span>
                          <span style={{ visibility: hasNext ? "hidden" : "visible" }}>{t("Restart")}</span>
                        </button>
                    {moment?.best && (
                      <button type="button" className={"btn compact lab-best" + (shownLine ? " ghost" : "")} onClick={blur(() => (shownLine ? setLine(null) : showLine()))}>
                        <Icon name={shownLine ? "stop" : "eye"} size={15} />
                        {t(shownLine ? "Stop" : "Show")}
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
              <div className="lab-trackrow">
              {phone && <span className="lab-play">{playButton}</span>}
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
              {phone && speedButton}
              </div>
              <div className="lab-buttons">
                {/* A phone has no room for the jumps to either end or the single steps: the timeline does that. */}
                {!phone && <IconButton icon="first" label="First move" onClick={blur(() => stepBy(-total))} disabled={step === 0} />}
                {!phone && <IconButton icon="prev" label="Previous move" onClick={blur(() => stepBy(-1))} disabled={step === 0} />}
                {!phone && playButton}
                {!phone && <IconButton icon="next" label="Next move" onClick={blur(() => stepBy(1))} disabled={step >= total} />}
                {!phone && <IconButton icon="last" label="Last move" onClick={blur(() => stepBy(total))} disabled={step >= total} />}
                {!phone && speedButton}
                {/* On a phone the way into the key moments ends this row. */}
                {phone && overview && review && typeof review === "object" && (
                  <button type="button" className="btn primary compact lab-keys" onClick={blur(() => jump(1))} disabled={!moments.length}>
                    {moments.length ? t("{n} key moments", { n: moments.length }) : t("No key moments")}
                  </button>
                )}
                {/* And once among them: back to the one before at the left, on to the
                    next in the middle, and the engine's line at the end when there is one. */}
                {phone && !overview && review && typeof review === "object" && (
                  <>
                    <IconButton icon="undo" label="Previous" variant="filled" onClick={blur(() => jump(-1))} disabled={!moments.some((m) => m.step < step)} />
                    <span className="lab-hop lab-hop-mid">
                      <button type="button" className="btn primary compact lab-next" onClick={blur(() => (hasNext ? jump(1) : firstMoment()))} disabled={!moments.length}>
                        <span style={{ visibility: hasNext ? "visible" : "hidden" }}>{t("Next")}</span>
                        <span style={{ visibility: hasNext ? "hidden" : "visible" }}>{t("Restart")}</span>
                      </button>
                    </span>
                    {moment?.best && (
                      <span className="lab-hop">
                        <button type="button" className={"btn compact lab-best" + (shownLine ? " ghost" : "")} onClick={blur(() => (shownLine ? setLine(null) : showLine()))}>
                          <Icon name={shownLine ? "stop" : "eye"} size={15} />
                          {t(shownLine ? "Stop" : "Show")}
                        </button>
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="lab-foot">
                <button type="button" className="btn lab-menu" onClick={onMenu}>
                  {t("Main menu")}
                </button>
                <IconButton icon={linked ? "check" : "link"} label={linked ? "Link copied" : "Copy link"} size="m" variant="filled" onClick={blur(copyLink)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
