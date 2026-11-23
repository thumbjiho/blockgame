// ─── Language ───
// English strings are the keys; Korean comes from ko.js. t("Seat {n}", { n: 1 })
// fills {placeholders}. App sets the language before each render.
import KO from "./ko.js";

let lang = "en";
export function setLang(l) {
  lang = l === "ko" ? "ko" : "en";
  document.documentElement.lang = lang;
}
export function getLang() {
  return lang;
}
export function t(s, vars) {
  let out = lang === "ko" ? (KO[s] ?? s) : s;
  if (vars) for (const k in vars) out = out.split(`{${k}}`).join(vars[k]);
  return lang === "ko" ? particles(out) : out;
}

// Korean particles that follow a filled-in word: "{x}은(는)" becomes 은 or 는
// by whether the word before ends in a final consonant (받침).
const PAIRS = { "은(는)": ["은", "는"], "이(가)": ["이", "가"], "을(를)": ["을", "를"], "과(와)": ["과", "와"] };
function particles(text) {
  return text.replace(/([가-힣])(은\(는\)|이\(가\)|을\(를\)|과\(와\))/g, (_, ch, pair) => ch + PAIRS[pair][(ch.charCodeAt(0) - 0xac00) % 28 ? 0 : 1]);
}
