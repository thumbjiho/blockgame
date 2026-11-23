// Form controls: segmented pill, dropdown, chips, switch, stepper, checkbox, collapsible.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sfx } from "../sound.js";
import { t } from "../i18n.js";
import { tr } from "./tr.js";
import { Tip } from "./primitives.jsx";
import { PieceIcon } from "./pieces.jsx";

// Move a segmented control's highlight onto its selected button.
function placePill(group, pill, instant) {
  const on = group?.querySelector("button.on");
  if (!pill) return;
  if (!on) {
    pill.style.opacity = "0";
    return;
  }
  if (instant) pill.style.transition = "none";
  pill.style.opacity = "1";
  pill.style.width = on.offsetWidth + "px";
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
  if (instant) {
    void pill.offsetWidth;
    pill.style.transition = "";
  }
}

export function Segmented({ options, value, onChange, focus = false, label }) {
  const groupRef = useRef(null);
  const pillRef = useRef(null);

  // The highlight is one element that slides to the selected option. It is a
  // CSS transition, so a new pick mid-slide just retargets it (interruptible),
  // and the value itself changes immediately (optimistic).
  // Value changes slide; the very first placement does not.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    placePill(groupRef.current, pill, !pill?.dataset.ready);
    if (pill) pill.dataset.ready = "1";
  }, [value, options.length]);

  // Size changes (fonts loading, window resize) snap without animating.
  useLayoutEffect(() => {
    let seen = false;
    const ro = new ResizeObserver(() => {
      if (seen) placePill(groupRef.current, pillRef.current, true);
      seen = true;
    });
    ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={groupRef} className={"group" + (focus ? " focus" : "")} role="radiogroup" aria-label={label}>
      <span ref={pillRef} className="seg-pill" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          disabled={o.disabled}
          // An option whose label is a picture names itself with `title`; with
          // `keys` as well, the name and the keys show in a tip over it.
          className={(value === o.id ? "on" : "") + (o.keys ? " has-tip" : "")}
          title={o.title && !o.keys ? t(o.title) : undefined}
          aria-label={o.title ? t(o.title) : undefined}
          onClick={(e) => {
            e.currentTarget.blur();
            if (o.id !== value) sfx.tick();
            onChange(o.id);
          }}
        >
          {tr(o.label)}
          {o.keys && <Tip label={t(o.title)} keys={o.keys} />}
        </button>
      ))}
    </div>
  );
}

// Collapsible "Advanced settings" block for options most players never change.
// While collapsed it lists any option that differs from its default, so a
// changed setting is never hidden. Expanding is a CSS transition (interruptible).
export function Advanced({ open, onToggle, changed = [], children }) {
  return (
    <div className={"adv" + (open ? " open" : "")}>
      <button
        type="button"
        className="adv-toggle"
        aria-expanded={open}
        onClick={() => {
          sfx.tick();
          onToggle();
        }}
      >
        <span>{t("Advanced settings")}</span>
        <svg className="adv-chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 10l4 4 4-4" />
        </svg>
      </button>
      {!open && changed.length > 0 && <div className="adv-sum">{changed.map(tr).join(" · ")}</div>}
      <div className="adv-body" aria-hidden={!open}>
        <div className="adv-inner">{children}</div>
      </div>
    </div>
  );
}

// Dropdown: a button showing the current choice, with a list that opens below.
// Opening/closing is a CSS transition (interruptible); the choice applies the
// moment it's clicked (optimistic). Esc or a click outside closes it.
export function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  // The list opens over the button with the current item sitting right on it
  // (like a native select), then shifts to stay inside the visible area.
  const [place, setPlace] = useState({ top: 0, origin: 0 });
  const ref = useRef(null);
  const menuRef = useRef(null);
  const measure = () => {
    const dd = ref.current;
    const menu = menuRef.current;
    if (!dd || !menu) return;
    const r = dd.getBoundingClientRect();
    const idx = Math.max(0, options.findIndex((o) => o.id === value));
    const li = menu.children[idx];
    if (!li) return;
    let top = -li.offsetTop + (r.height - li.offsetHeight) / 2;
    // Keep it inside the window and any clipping ancestor.
    let ceil = 0;
    let floor = window.innerHeight;
    for (let el = dd.parentElement; el; el = el.parentElement) {
      const o = getComputedStyle(el);
      if (o.overflowY !== "visible" || o.overflowX !== "visible") {
        const b = el.getBoundingClientRect();
        ceil = Math.max(ceil, b.top);
        floor = Math.min(floor, b.bottom);
      }
    }
    const h = menu.offsetHeight;
    if (r.top + top + h > floor - 8) top -= r.top + top + h - (floor - 8);
    if (r.top + top < ceil + 8) top += ceil + 8 - (r.top + top);
    setPlace({ top, origin: li.offsetTop + li.offsetHeight / 2 });
  };
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  const current = options.find((o) => o.id === value);
  return (
    <div
      ref={ref}
      className={"dd" + (open ? " open" : "")}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          sfx.tick();
          if (!open) measure();
          setOpen((o) => !o);
        }}
      >
        <span>{tr(current?.label)}</span>
        <svg className="dd-chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 10l4 4 4-4" />
        </svg>
      </button>
      <ul ref={menuRef} className="dd-menu" role="listbox" aria-label={label} style={{ top: place.top, transformOrigin: `50% ${place.origin}px` }}>
        {options.map((o, i) => (
          <li key={String(o.id)} style={{ "--i": i }}>
            <button
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={o.id === value ? "on" : ""}
              disabled={o.disabled}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                // The current choice just closes the list.
                if (o.id === value) {
                  sfx.tick();
                  setOpen(false);
                  return;
                }
                sfx.select();
                onChange(o.id);
                setOpen(false);
              }}
            >
              <span className="dd-label">
                {/* The current choice is marked; picking it again closes the list */}
                <svg className="dd-check" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {tr(o.label)}
              </span>
              {o.note && <span className="dd-note">{tr(o.note)}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Multi-select chips: each option toggles on/off; at least `min` stay on.
// `all` adds a leading chip that selects every option at once.
export function MultiSelect({ options, values, onChange, min = 1, all = false, label }) {
  const set = new Set(values);
  const everything = options.every((o) => set.has(o.id));
  const toggle = (id) => {
    const next = new Set(set);
    if (next.has(id)) {
      if (next.size <= min) return;
      next.delete(id);
    } else next.add(id);
    sfx.tick();
    onChange(options.filter((o) => next.has(o.id)).map((o) => o.id));
  };
  return (
    <div className="multi" role="group" aria-label={label}>
      {all && (
        <button
          type="button"
          className={"chip-btn" + (everything ? " on" : "")}
          aria-pressed={everything}
          onClick={() => {
            if (everything) return;
            sfx.tick();
            onChange(options.map((o) => o.id));
          }}
        >
          {t("All")}
        </button>
      )}
      {options.map((o) => (
        <button
          type="button"
          key={String(o.id)}
          className={"chip-btn" + (set.has(o.id) ? " on" : "")}
          aria-pressed={set.has(o.id)}
          onClick={() => toggle(o.id)}
        >
          {o.piece ? <PieceIcon id={o.piece} /> : o.color && <i className="chip-dot" style={{ background: o.color }} />}
          {!o.piece && tr(o.label)}
        </button>
      ))}
    </div>
  );
}

// On/off switch with its label, e.g. "Retry on a fault".
export function Switch({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={"switch-row" + (checked ? " on" : "")}
      onClick={(e) => {
        e.currentTarget.blur();
        sfx.tick();
        onChange(!checked);
      }}
    >
      <span className="switch-text">
        <span className="switch-label">{tr(label)}</span>
        {hint && <span className="switch-hint">{tr(hint)}</span>}
      </span>
      <span className="switch" aria-hidden="true">
        <span className="knob" />
      </span>
    </button>
  );
}

// Stepper: − value + for small number ranges. Buttons go dim at the limits.
export function Stepper({ value, onChange, min, max, label, format = (v) => String(v) }) {
  const step = (d) => (e) => {
    e.currentTarget.blur();
    const v = Math.min(max, Math.max(min, value + d));
    if (v === value) return;
    sfx.tick();
    onChange(v);
  };
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="step-btn" onClick={step(-1)} disabled={value <= min} aria-label={t("Less")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 12h10" />
        </svg>
      </button>
      <span className="step-v" aria-live="polite">
        {format(value)}
      </span>
      <button type="button" className="step-btn" onClick={step(1)} disabled={value >= max} aria-label={t("More")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 12h10M12 7v10" />
        </svg>
      </button>
    </div>
  );
}

// Checkbox row: a small flat box and its label, for compact on/off options.
export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={"check-row" + (checked ? " on" : "")}
      onClick={(e) => {
        e.currentTarget.blur();
        sfx.tick();
        onChange(!checked);
      }}
    >
      <span className="check-box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="check-label">{tr(label)}</span>
    </button>
  );
}
