// The piece log beside a board.
import { useEffect, useState } from "react";
import { t } from "../i18n.js";
import { PieceIcon } from "./pieces.jsx";

// The per-piece record of the run, shown live beside the board.
// Newest at the bottom; older rows fade out at the top.
const PIECE_COLOR = { I: "#41b6e6", T: "#b14fd0", L: "#f2913d", J: "#3d6fe0", S: "#5cc45c", Z: "#e8505b", O: "#f2cb4c" };

// side: which side of the board it sits on; keys: false hides the key counts
// (a CPU presses no keys).
export function ReplayLog({ events, total, side = "left", keys = true }) {
  const first = total - events.length;
  return (
    <div className={"rlog" + (side === "right" ? " right" : "")} aria-label="Piece log">
      <div className="k rlog-head">
        {t("Log")}
      </div>
      <ol className="rlog-list">
        {events.map((ev, i) => {
          const n = first + i + 1;
          const fault = keys && ev.kind === "place" && ev.finesseFault > 0;
          return (
            <li key={n} className="rlog-row">
              <span className="rlog-n">#{n}</span>
              <span className="rlog-t">{ev.t.toFixed(2)}s</span>
              <span className="rlog-p">
                {ev.kind === "garbage" ? (
                  <>
                    <i style={{ background: "#5a5a5a" }} />G
                  </>
                ) : ev.kind === "floor" ? (
                  <>
                    <i style={{ background: "#333333" }} />F
                  </>
                ) : (
                  <PieceIcon type={ev.type} size={3} />
                )}
              </span>
              {ev.kind === "garbage" ? (
                <>
                  <span className="rlog-dim">+{ev.holes.length}</span>
                  <span className="rlog-dim">{t("garbage")}</span>
                </>
              ) : ev.kind === "floor" ? (
                <>
                  <span className="rlog-dim">+{ev.rows}</span>
                  <span className="rlog-dim">{t("floor")}</span>
                </>
              ) : ev.kind === "hold" ? (
                <span className="rlog-dim">{t("hold")}</span>
              ) : (
                <>
                  <span className={"rlog-keys" + (fault ? " bad" : "")}>
                    {keys && ev.keys}
                    {keys && ev.optimal > 0 && <span className="rlog-dim">/{ev.optimal}</span>}
                  </span>
                  <span className="rlog-tag">{[ev.action, ev.b2b && "B2B", ev.pc && "PC"].filter(Boolean).join(" ")}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Piece log for modes that don't track it themselves: polls the engine.
export function EngineLog({ engineRef, side, keys }) {
  const [log, setLog] = useState({ events: [], total: 0 });
  useEffect(() => {
    let seen = -1;
    let eng = null;
    const id = setInterval(() => {
      const e = engineRef.current;
      const n = e?.replay?.length ?? 0;
      if (e === eng && n === seen) return;
      eng = e;
      seen = n;
      setLog({ events: e ? e.replay.slice(-40) : [], total: n });
    }, 100);
    return () => clearInterval(id);
  }, [engineRef]);
  return <ReplayLog events={log.events} total={log.total} side={side} keys={keys} />;
}
