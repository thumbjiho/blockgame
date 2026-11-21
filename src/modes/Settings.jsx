import { useState, useEffect, useRef } from "react";
import { t } from "../i18n.js";
import {
  ACTIONS,
  EXTRA_ACTIONS,
  DEFAULT_BINDINGS,
  loadKeyBindings,
  saveKeyBindings,
  keyLabel,
  FORBIDDEN_CODES,
} from "../keys.js";

import { Segmented, KeyName, ConfirmDialog } from "../ui.jsx";
import { SKINS, cell, prep } from "../render.js";
import { COLORS } from "../game.js";
import { sfx } from "../sound.js";

const PROFILE_LIST = [
  { id: "solo", label: "Solo" },
  { id: "p1", label: "Battle P1" },
  { id: "p2", label: "Battle P2" },
];

// Display order: moves, then rotations in Z X A order, then hold.
const KEY_ORDER = ["left", "right", "softdrop", "harddrop", "rotateCCW", "rotateCW", "rotate180", "hold"];

const ACTION_NAMES = {
  left: "Move left",
  right: "Move right",
  softdrop: "Soft drop",
  harddrop: "Hard drop",
  rotateCW: "Rotate clockwise",
  rotateCCW: "Rotate counter-clockwise",
  rotate180: "Rotate 180",
  hold: "Hold",
  restart: "Restart",
};

export default function Settings({ values, onSave, onClose }) {
  // Every edit is a draft until Save; leaving without saving drops it.
  const [draft, setDraft] = useState(values);
  const put = (key) => (v) => setDraft((d) => ({ ...d, [key]: typeof v === "function" ? v(d[key]) : v }));
  const { das, arr, sdf, soundEnabled, soundOpts, skin, cellLines } = draft;
  const [setDas, setArr, setSdf, setSoundEnabled, setSoundOpts, setSkin, setCellLines] = ["das", "arr", "sdf", "soundEnabled", "soundOpts", "skin", "cellLines"].map(put);
  const [saved] = useState(() => loadKeyBindings());
  const [bindings, setBindings] = useState(saved);
  const [confirmReset, setConfirmReset] = useState(false);
  const keysDirty = JSON.stringify(saved) !== JSON.stringify(bindings);
  const dirty = keysDirty || JSON.stringify(values) !== JSON.stringify(draft);
  const [activeProfile, setActiveProfile] = useState("solo");
  const [recording, setRecording] = useState(null); // { profile, action }
  const [error, setError] = useState("");
  const [section, setSection] = useState("game"); // game | keys
  const recordingRef = useRef(recording);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);


  // Capture-key listener
  useEffect(() => {
    const onKey = (e) => {
      const rec = recordingRef.current;
      if (!rec) return;
      // Esc cancels capture without saving
      if (e.code === "Escape" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setRecording(null);
        setError("");
        return;
      }
      if (FORBIDDEN_CODES.has(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        setError(t("{key} cannot be used.", { key: keyLabel(e.code) }));
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const code = e.code;

      // A key already in use swaps places with the key being replaced, so
      // nothing is ever bound twice. P1 and P2 share one keyboard, so a clash
      // across those two profiles swaps too.
      const old = bindings[rec.profile][rec.action];
      const scope = rec.profile === "solo" ? ["solo"] : ["p1", "p2"];
      const next = { ...bindings, [rec.profile]: { ...bindings[rec.profile], [rec.action]: code } };
      for (const p of scope) {
        for (const a of [...ACTIONS, ...EXTRA_ACTIONS[p]]) {
          if (p === rec.profile && a === rec.action) continue;
          if (bindings[p][a] === code) {
            next[p] = { ...next[p], [a]: old };
          }
        }
      }
      setBindings(next);
      setError("");
      setRecording(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [bindings]);

  // Esc closes the dialog when not capturing a key (or resetting a profile).
  useEffect(() => {
    const onKey = (e) => {
      if (recording || confirmReset) return;
      if (e.code === "Escape" || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recording, confirmReset, onClose]);

  const profile = bindings[activeProfile];

  const resetProfile = () => {
    setBindings((prev) => ({
      ...prev,
      [activeProfile]: { ...DEFAULT_BINDINGS[activeProfile] },
    }));
    setError("");
  };
  const save = () => {
    if (keysDirty) saveKeyBindings(bindings);
    onSave(draft);
  };
  const discard = () => {
    setDraft(values);
    setBindings(saved);
    setRecording(null);
    setError("");
  };
  const profileLabel = PROFILE_LIST.find((p) => p.id === activeProfile).label;
  const atDefault = JSON.stringify(bindings[activeProfile]) === JSON.stringify(DEFAULT_BINDINGS[activeProfile]);

  return (
    // A click outside closes it, unless edits would be lost.
    <div className="dialog-back" onPointerDown={(e) => e.target === e.currentTarget && !dirty && onClose()}>
    <div className="dialog settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" style={{ "--accent": "var(--fg)" }}>
      <div className="settings-head">
        <div id="settings-title" className="dialog-title">{t("Settings")}</div>
        <Segmented
          label="Section"
          options={[
            { id: "game", label: "Handling" },
            { id: "sound", label: "Sound" },
            { id: "skin", label: "Skin" },
            { id: "keys", label: "Keys" },
          ]}
          value={section}
          onChange={setSection}
        />
      </div>

      <div className="settings">
        {section === "game" && (
          <div className="opts">
            <div className="opt">
              <div>
                <div className="k" style={{ color: "var(--fg)" }}>{t("DAS")}</div>
                <div className="k small">{t("Delay before auto-repeat")}</div>
              </div>
              <SliderField value={das} setValue={setDas} min={0} max={300} def={133} unit="ms" />
            </div>
            <div className="opt">
              <div>
                <div className="k" style={{ color: "var(--fg)" }}>{t("ARR")}</div>
                <div className="k small">{t("Auto-repeat rate")}</div>
              </div>
              <SliderField value={arr} setValue={setArr} min={0} max={100} def={10} unit="ms" />
            </div>
            <div className="opt">
              <div>
                <div className="k" style={{ color: "var(--fg)" }}>{t("SDF")}</div>
                <div className="k small">{t("Soft drop speed")}</div>
              </div>
              <SliderField value={sdf} setValue={setSdf} min={1} max={100} def={30} displayValue={sdf === 100 ? "∞" : `${sdf}×`} />
            </div>
          </div>
        )}

        {section === "sound" && (
          <div className="opts">
            {[
              { k: "All sounds", v: soundEnabled, set: setSoundEnabled },
              { k: "Fault", hint: "A wasted key press on any piece, or a wrong spot in Finesse and Opening", key: "fault" },
              { k: "Back-to-back", hint: "A quad or spin clear right after another", key: "b2b" },
              { k: "Combo", hint: "Clears in a row, rising with each one", key: "combo" },
            ].map((row) => (
              <div key={row.k} className="opt wide">
                <div>
                  <div className="k" style={{ color: "var(--fg)" }}>{t(row.k)}</div>
                  {row.hint && <div className="k small hint">{t(row.hint)}</div>}
                </div>
                <Segmented
                  label={row.k}
                  options={[
                    { id: true, label: "On", disabled: !!row.key && !soundEnabled },
                    { id: false, label: "Off", disabled: !!row.key && !soundEnabled },
                  ]}
                  value={row.key ? soundOpts[row.key] : row.v}
                  onChange={(on) => (row.key ? setSoundOpts((o) => ({ ...o, [row.key]: on })) : row.set(on))}
                />
              </div>
            ))}
          </div>
        )}

        {section === "skin" && (
          <>
          <div className="skin-list" role="radiogroup" aria-label={t("Skin")}>
            {SKINS.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={skin === name}
                className={skin === name ? "on" : ""}
                onClick={(e) => {
                  e.currentTarget.blur();
                  if (name !== skin) sfx.tick();
                  setSkin(name);
                }}
              >
                <span className="k">{t(SKIN_NAMES[name])}</span>
                <SkinPreview name={name} lines={cellLines} />
              </button>
            ))}
          </div>
          <div className="opts" style={{ marginTop: 14 }}>
            <div className="opt wide">
              <div>
                <div className="k" style={{ color: "var(--fg)" }}>{t("Cell lines")}</div>
                <div className="k small hint">{t("The thin gap between the cells of a piece")}</div>
              </div>
              <Segmented
                label="Cell lines"
                options={[
                  { id: true, label: "On" },
                  { id: false, label: "Off" },
                ]}
                value={cellLines}
                onChange={setCellLines}
              />
            </div>
          </div>
          </>
        )}

        {section === "keys" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "nowrap" }}>
              <Segmented
                label="Profile"
                options={PROFILE_LIST}
                value={activeProfile}
                onChange={(id) => {
                  setActiveProfile(id);
                  setError("");
                }}
              />
              {/* Hidden (space kept, so the row never shifts) while there's nothing to reset. */}
              <button className="btn danger compact" onClick={() => setConfirmReset(true)} disabled={atDefault} style={{ visibility: atDefault ? "hidden" : "visible" }} title={t("Only {profile} goes back to its defaults", { profile: t(profileLabel) })}>
                {t("Reset {profile}", { profile: t(profileLabel) })}
              </button>
            </div>
            <p className="note">
              {t(activeProfile === "solo" ? "Used in Sprint, Opening and Battle vs CPU." : activeProfile === "p1" ? "Used by P1 in Battle vs Player." : "Used by P2 in Battle vs Player.")}{" "}
              {t("Keys follow the physical key, so the 한/영 toggle never changes them.")}
            </p>
            <div className="key-msg">
              {error ? <span className="err">{t(error)}</span> : keysDirty ? <span>{t("Unsaved changes. Save to keep them.")}</span> : null}
            </div>
            <div className="opts" style={{ marginTop: 0 }}>
              {[...KEY_ORDER, ...EXTRA_ACTIONS[activeProfile]].map((action) => {
                const isRecording =
                  recording && recording.profile === activeProfile && recording.action === action;
                return (
                  <div key={action} className="opt" style={{ minHeight: 38, padding: "3px 0", gridTemplateColumns: "1fr auto" }}>
                    <div className="k" style={{ color: "var(--fg)" }}>{t(ACTION_NAMES[action])}</div>
                    <button
                      className={"btn keybtn" + (isRecording ? " rec" : "")}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        setError("");
                        setRecording({ profile: activeProfile, action });
                      }}
                    >
                      {isRecording ? t("Press a key…") : <KeyName code={profile[action]} />}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmReset}
        title={t("Reset {profile} keys?", { profile: t(profileLabel) })}
        body={t("Every {profile} key goes back to its default. Other profiles stay as they are. Save to keep it.", { profile: t(profileLabel) })}
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetProfile();
          setConfirmReset(false);
        }}
      />
      <div className="settings-foot">
        <button className="btn ghost" onClick={discard} disabled={!dirty}>
          {t("Discard changes")}
        </button>
        <button className="btn primary" onClick={save}>
          {t("Save")}
        </button>
      </div>
    </div>
    </div>
  );
}

// The seven pieces' colours and the garbage grey, one cell each, in a skin.
const SKIN_NAMES = { flat: "Flat", bevel: "Bevel", gloss: "Gloss", outline: "Outline", inset: "Inset" };
const PREVIEW_CELL = 24;
function SkinPreview({ name, lines }) {
  const ref = useRef(null);
  useEffect(() => {
    const ids = [6, 3, 7, 5, 1, 4, 2, 8];
    const ctx = prep(ref.current, ids.length * PREVIEW_CELL, PREVIEW_CELL);
    ids.forEach((id, i) => cell(ctx, i * PREVIEW_CELL, 0, PREVIEW_CELL, COLORS[id], 1, name, lines));
  }, [name, lines]);
  return <canvas ref={ref} width={8 * PREVIEW_CELL} height={PREVIEW_CELL} />;
}

// Slider with the default marked on the track. Double-click the slider to go
// back to the default; click the number to type a value (underline only).
function SliderField({ value, setValue, min, max, def, displayValue, unit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const pct = ((def - min) / (max - min)) * 100;
  const commit = () => {
    const n = Math.round(Number(draft.replace(/[^0-9.]/g, "")));
    if (draft.trim() !== "" && Number.isFinite(n)) setValue(Math.min(max, Math.max(min, n)));
    setEditing(false);
  };
  return (
    <div className="slider">
      <div className="slider-track">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          onDoubleClick={() => setValue(def)}
          title={t("Double-click to reset to {v}", { v: def })}
        />
        {/* Default position (thumb is 14px, so offset to its centre) */}
        <span
          className={"slider-def" + (value === def ? " at" : "")}
          style={{ left: `calc(${pct}% + ${(0.5 - pct / 100) * 14}px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="v">
        {editing ? (
          <input
            className="num-edit"
            autoFocus
            inputMode="numeric"
            value={draft}
            size={Math.max(2, draft.length)}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commit();
              else if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <button
            type="button"
            className="num"
            title={t("Click to type a value")}
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
          >
            {displayValue ?? value}
          </button>
        )}
        {unit && displayValue == null ? <span className="dim"> {unit}</span> : null}
      </div>
    </div>
  );
}
