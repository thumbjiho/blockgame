import { useState, useEffect } from "react";
import Sprint from "./modes/Sprint.jsx";
import ComingSoon from "./modes/ComingSoon.jsx";

// ─── SETTINGS PERSISTENCE ───
const STORAGE_KEY = "jbl-settings";

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ─── MENU ITEMS ───
const MENU_ITEMS = [
  { id: "sprint", label: "SPRINT", color: "#00f0f0", ready: true },
  { id: "opening", label: "OPENING", color: "#a000f0", ready: false },
  { id: "finesse", label: "FINESSE", color: "#00f000", ready: false },
  { id: "puzzle", label: "PUZZLE", color: "#f0a000", ready: false },
  { id: "challenge", label: "CHALLENGE", color: "#f00060", ready: false },
  { id: "settings", label: "SETTINGS", color: "#888", ready: true },
];

// ─── APP ───
export default function App() {
  // menu | sprint | opening | finesse | puzzle | challenge | settings
  const [view, setView] = useState("menu");

  // Settings state
  const [das, setDas] = useState(() => loadSettings().das ?? 133);
  const [arr, setArr] = useState(() => loadSettings().arr ?? 10);
  const [sdf, setSdf] = useState(() => loadSettings().sdf ?? 30);
  const [soundEnabled, setSoundEnabled] = useState(
    () => loadSettings().soundEnabled ?? true,
  );

  // Persist settings
  useEffect(() => {
    saveSettings({ das, arr, sdf, soundEnabled });
  }, [das, arr, sdf, soundEnabled]);

  // Prevent scroll globally
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventScroll);
    return () => window.removeEventListener("keydown", preventScroll);
  }, []);

  // ESC from settings → menu
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && view === "settings") {
        setView("menu");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [view]);

  const settings = { das, arr, sdf, soundEnabled };
  const goMenu = () => setView("menu");

  // ─── SETTINGS PANEL ───
  const renderSettings = () => (
    <div style={{ textAlign: "center", zIndex: 10, maxWidth: 360, margin: "0 auto" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#888", marginBottom: 32, letterSpacing: 4 }}>
        SETTINGS
      </div>
      <div style={{ padding: 24, border: "1px solid #222", background: "#111", textAlign: "left" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#888", letterSpacing: 1, display: "block", marginBottom: 4 }}>
            DAS (ms)
          </label>
          <input
            type="range" min={0} max={300} value={das}
            onChange={(e) => setDas(+e.target.value)}
            style={{ width: "100%", accentColor: "#00f0f0" }}
          />
          <span style={{ fontSize: 13, color: "#00f0f0", float: "right" }}>{das}</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#888", letterSpacing: 1, display: "block", marginBottom: 4 }}>
            ARR (ms)
          </label>
          <input
            type="range" min={0} max={100} value={arr}
            onChange={(e) => setArr(+e.target.value)}
            style={{ width: "100%", accentColor: "#00f0f0" }}
          />
          <span style={{ fontSize: 13, color: "#00f0f0", float: "right" }}>{arr}</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#888", letterSpacing: 1, display: "block", marginBottom: 4 }}>
            SDF (soft drop speed)
          </label>
          <input
            type="range" min={1} max={100} value={sdf}
            onChange={(e) => setSdf(+e.target.value)}
            style={{ width: "100%", accentColor: "#00f0f0" }}
          />
          <span style={{ fontSize: 13, color: "#00f0f0", float: "right" }}>{sdf === 100 ? "INF" : sdf}</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#888", letterSpacing: 1, display: "block", marginBottom: 4 }}>
            SOUND
          </label>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            style={{
              padding: "6px 20px", border: "1px solid",
              borderColor: soundEnabled ? "#00f0f0" : "#333",
              background: soundEnabled ? "rgba(0,240,240,0.1)" : "transparent",
              color: soundEnabled ? "#00f0f0" : "#666",
              fontSize: 12, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}
          >
            {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 12 }}>
          Controls: Arrow keys move/drop, X=CW, Z=CCW, A=180, C/Shift=Hold, Space=Hard Drop, F=Restart
        </div>
      </div>
      <button
        onClick={goMenu}
        style={{
          marginTop: 24, padding: "8px 24px", background: "transparent",
          border: "1px solid #333", color: "#888", fontSize: 12,
          fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
        }}
      >
        BACK
      </button>
    </div>
  );

  // ─── MAIN MENU ───
  const renderMainMenu = () => (
    <div style={{ textAlign: "center", zIndex: 10 }}>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -2, marginBottom: 8, color: "#fff" }}>
        JBL
      </div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 48, letterSpacing: 2 }}>
        JOJO&apos;S BLOCKGAME LABORATORY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.ready) setView(item.id);
            }}
            style={{
              width: 280, padding: "14px 0", border: "1px solid",
              borderColor: item.ready ? item.color + "66" : "#222",
              background: item.ready ? item.color + "0a" : "transparent",
              color: item.ready ? item.color : "#333",
              fontSize: 16, fontWeight: 700, fontFamily: "inherit",
              cursor: item.ready ? "pointer" : "default",
              letterSpacing: 4, position: "relative", transition: "all 0.15s",
            }}
          >
            {item.label}
            {!item.ready && (
              <span style={{
                fontSize: 9, letterSpacing: 1, color: "#444",
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              }}>
                SOON
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Find menu item for ComingSoon pages
  const currentItem = MENU_ITEMS.find((m) => m.id === view);

  return (
    <div
      style={{
        background: "#0d0d0d", height: "100vh", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        color: "#e0e0e0", position: "relative", overflow: "hidden", userSelect: "none",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Grid background */}
      <div
        style={{
          position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Footer credit */}
      <div
        style={{
          position: "absolute", bottom: 12, left: 0, right: 0,
          textAlign: "center", fontSize: 11, letterSpacing: 1.5,
          color: "#666", opacity: 0.6, pointerEvents: "auto", zIndex: 5,
        }}
      >
        Inspired by{" "}
        <a href="https://jstris.jezevec10.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none" }}>
          Jstris
        </a>
        {" \u00B7 "}SRS Guideline{" \u00B7 "}Made by Jojo Um (with love)
      </div>

      {/* Content */}
      {view === "menu" && renderMainMenu()}
      {view === "settings" && renderSettings()}
      {view === "sprint" && <Sprint settings={settings} onBack={goMenu} />}
      {currentItem && !currentItem.ready && view !== "menu" && (
        <ComingSoon label={currentItem.label} color={currentItem.color} onBack={goMenu} />
      )}

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        @keyframes countPulse {
          0% { transform: scale(1.4); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        html, body { overflow: hidden; height: 100%; margin: 0; }
        input[type=range] {
          height: 4px; -webkit-appearance: none; appearance: none;
          background: #333; outline: none; border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #00f0f0; cursor: pointer;
        }
        button:hover { opacity: 0.85; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
