export default function ComingSoon({ label, color, onBack }) {
  return (
    <div style={{ textAlign: "center", zIndex: 10 }}>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: -1,
          marginBottom: 8,
          color: color,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#444",
          marginBottom: 40,
          letterSpacing: 2,
        }}
      >
        COMING SOON
      </div>

      <button
        onClick={onBack}
        style={{
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
