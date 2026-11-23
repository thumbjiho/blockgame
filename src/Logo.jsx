// The mark, and the mark set with the name.
import { logoLayouts, markShape, pieceEdges } from "./logoLayouts.js";
import { MARK } from "./logoMark.js";

const layoutOf = (code) => logoLayouts().find((a) => a.code === code);

// The mark cut to its own outline. `height` is any CSS length; the width follows.
// In one colour (`mono`) the pieces are drawn in outline: filled with the
// colour of the page and edged with lines in the colour of the type, so it
// follows the theme (light lines on dark, dark lines on light).
export const MONO_LINE = 0.18; // how thick those lines are, in squares
export function LogoMark({ layout = layoutOf(MARK.code), turn = MARK.turn, height = "1em", mono = false, style, className }) {
  const s = markShape(layout, turn);
  return (
    <svg className={className} viewBox={`${s.x} ${s.y} ${s.w} ${s.h}`} style={{ height, width: `calc(${height} * ${s.w / s.h})`, flex: "none", ...style }} aria-hidden="true">
      {/* Turned, each square gets a hair of its own colour, so no line shows where two meet. */}
      <g shapeRendering={turn ? "geometricPrecision" : "crispEdges"} transform={turn ? `rotate(${turn} ${s.cx} ${s.cy})` : undefined}>
        {s.cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={1} height={1} fill={mono ? "var(--bg)" : c.color} stroke={turn ? (mono ? "var(--bg)" : c.color) : undefined} strokeWidth={turn ? 0.03 : undefined} />
        ))}
        {mono && pieceEdges(layout).map(([x1, y1, x2, y2], i) => <line key={"e" + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fg)" strokeWidth={MONO_LINE} strokeLinecap="square" shapeRendering="geometricPrecision" />)}
      </g>
    </svg>
  );
}

// How tall the capitals of the name really are, as a share of the type size,
// and how far their feet sit below the baseline (round letters overshoot it).
let measured = null;
function caps() {
  if (!measured) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = '700 100px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const m = ctx.measureText("SZO");
    measured = { up: m.actualBoundingBoxAscent / 100, down: m.actualBoundingBoxDescent / 100 };
  }
  return measured;
}

// The mark and the name together, sized by the type around it (em). The eye,
// not the box, decides the fit: the mark is as tall as the capitals, a little
// taller when it stands on a point (a point reads smaller than a flat side);
// the space between is measured from the shape itself; and beside the name it
// sits where its weight is, since a shape heavy at the top looks set too high
// when only its box is centred.
export function LogoLockup({ layout = layoutOf(MARK.code), turn = MARK.turn, stacked = false, mono = false, after, children, className = "" }) {
  const { up, down } = caps();
  const cap = up + down;
  const pointed = turn % 90 !== 0;
  const tall = cap * (stacked ? 1.5 : 1) * (pointed ? 1.16 : 1.02);
  const shift = tall / 2 - (up - down) / 2 + (0.5 - markShape(layout, turn).balance) * tall * 0.7;
  return (
    <span className={"logo-lockup" + (stacked ? " stacked" : "") + (className ? " " + className : "")} style={{ gap: `${stacked ? cap * 0.34 : cap * (pointed ? 0.3 : 0.36)}em` }}>
      <LogoMark layout={layout} turn={turn} mono={mono} height={`${tall}em`} style={stacked ? undefined : { transform: `translateY(${shift}em)` }} />
      {/* `after` follows the name on its line (the site it lives on); children go under it. */}
      <span className="logo-name">
        <strong>SZO</strong>
        {after}
      </span>
      {children}
    </span>
  );
}
