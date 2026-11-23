// ─── A run, packed small ───
// A log is written for reading; a link wants it short. pack() keeps only
// what a replay cannot work out again (each piece's place, keys and time, the
// clears, and how the pieces moved), writes that tersely and compresses it;
// unpack() gives back a log the replay reads like any other. A 40-line Sprint
// comes to a couple of thousand characters, short enough to sit in a link.
import { parseLog } from "./replay.js";
import { parseMoves, movesText } from "./trace.js";

const VERSION = "1";
const ms = (t) => Math.round(t * 1000);

async function squeeze(text, how) {
  const stream = new Blob([text]).stream().pipeThrough(how);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
const toUrl = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromUrl = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function pack(text) {
  const head = (text.split(/\r?\n/).find((l) => l.trim()) || "").trim();
  let prev = 0;
  const rows = parseLog(text).map((ev) => {
    const dt = ms(ev.t) - prev;
    prev = ms(ev.t);
    if (ev.kind === "garbage") return `G${dt};${ev.holes.join(",")}`;
    if (ev.kind === "floor") return `F${dt};${ev.rows}`;
    if (ev.kind === "hold") return `H${ev.type}${dt}`;
    const tags = ev.action + (ev.b2b ? "!" : "") + (ev.pc ? "*" : "");
    return `${ev.type}${[dt, ev.placed[0], ev.placed[1], ev.rot, ev.keys, ev.optimal, ev.spawn[0], ev.spawn[1]].join(",")};${tags}`;
  });
  const moves = parseMoves(text);
  const body = [VERSION, head, ...rows, moves ? movesText(moves) : ""].join("\n");
  return toUrl(await squeeze(body, new CompressionStream("deflate-raw")));
}

// Packed → log text, or null when it does not read.
export async function unpack(packed) {
  try {
    const body = new TextDecoder().decode(await squeeze(fromUrl(packed), new DecompressionStream("deflate-raw")));
    const [version, head, ...rest] = body.split("\n");
    if (version !== VERSION) return null;
    const at = rest.indexOf("MOVES");
    const rows = at < 0 ? rest : rest.slice(0, at);
    let t = 0;
    const lines = rows.filter(Boolean).map((row, n) => {
      const num = `#${String(n + 1).padStart(2, "0")}`;
      const stamp = (dt) => `[${((t += +dt) / 1000).toFixed(3)}s]`;
      if (row[0] === "G") {
        const [dt, holes] = row.slice(1).split(";");
        return `${num} ${stamp(dt)} garbage +${holes ? holes.split(",").length : 0} holes=[${holes}]`;
      }
      if (row[0] === "F") {
        const [dt, n] = row.slice(1).split(";");
        return `${num} ${stamp(dt)} floor +${n}`;
      }
      if (row[0] === "H") return `${num} ${stamp(row.slice(2))} ${row[1]} hold`;
      const [nums, tags] = row.slice(1).split(";");
      const [dt, px, py, rot, keys, optimal, sx, sy] = nums.split(",");
      const words = [tags.replace(/[!*]/g, ""), tags.includes("!") && "B2B", tags.includes("*") && "PC"].filter(Boolean).join(" ");
      return `${num} ${stamp(dt)} ${row[0]} spawn(${sx},${sy}) → placed(${px},${py}) rot=${rot} | keys=${keys}${+optimal > 0 ? ` | optimal=${optimal}` : ""}${words ? ` | ${words}` : ""}`;
    });
    return [head, "", ...lines, ...(at < 0 ? [] : ["", ...rest.slice(at)])].join("\n");
  } catch {
    return null;
  }
}

// A link that opens this run in Replay, wherever the app is served from.
export const HASH = "#r=";
export async function replayLink(text) {
  return `${location.origin}${location.pathname}${HASH}${await pack(text)}`;
}
