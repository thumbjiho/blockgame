// Top bar (always visible, top right): settings, sound, language, full
// screen. The theme lives in Settings only. On a phone they fold into one menu, with rows tall enough to tap.
import { useEffect, useState } from "react";
import { sfx } from "../sound.js";
import { IconButton } from "./primitives.jsx";
import { ActionMenu } from "./overlays.jsx";
import { usePhone } from "../fit.js";

export function TopBar({ lang, setLang, sound, setSound, onSettings }) {
  const [full, setFull] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const click = (fn) => (e) => {
    e.currentTarget.blur();
    sfx.tick();
    fn();
  };
  const canFull = !!document.documentElement.requestFullscreen;
  const phone = usePhone();
  const toggleFull = () => (full ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  if (phone)
    return (
      <div className="topbar phone">
        <ActionMenu
          icon="menu"
          label="Menu"
          size="m"
          touch
          items={[
            { label: "Settings", icon: "gear", onClick: onSettings },
            { label: sound ? "Sound off" : "Sound on", icon: sound ? "sound" : "mute", onClick: () => setSound(!sound) },
            { label: lang === "ko" ? "English" : "한국어", icon: "globe", onClick: () => setLang(lang === "ko" ? "en" : "ko") },
            ...(canFull ? [{ label: full ? "Exit full screen" : "Full screen", icon: full ? "shrink" : "expand", onClick: toggleFull }] : []),
          ]}
        />
      </div>
    );
  return (
    <div className="topbar">
      <IconButton icon="gear" label="Settings" onClick={click(onSettings)} />
      <IconButton icon={sound ? "sound" : "mute"} label={sound ? "Sound off" : "Sound on"} aria-pressed={sound} onClick={click(() => setSound(!sound))} />
      <button
        type="button"
        className="icon-btn s lang"
        title={lang === "ko" ? "Switch to English" : "한국어로 보기"}
        aria-label={lang === "ko" ? "Switch to English" : "한국어로 보기"}
        onClick={click(() => setLang(lang === "ko" ? "en" : "ko"))}
      >
        {lang === "ko" ? "한" : "EN"}
      </button>
      {canFull && (
        <IconButton
          icon={full ? "shrink" : "expand"}
          label={full ? "Exit full screen" : "Full screen"}
          onClick={click(toggleFull)}
        />
      )}
    </div>
  );
}
