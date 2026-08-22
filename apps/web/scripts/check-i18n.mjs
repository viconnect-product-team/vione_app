// Build-time guard: fail the build when a literal i18n key used anywhere in
// the app (t("...")) is missing from src/lib/i18n.ts, or is defined but empty
// in either language (vi / en).
//
// Runs in prebuild (see package.json). Exits non-zero so broken/half-translated
// labels are caught before shipping instead of rendering raw keys.
//
// Scope is intentionally conservative: only *literal* t("...") calls are
// checked. Dynamically-built keys (t(SOME_MAP[x]), t(`a.${b}`)) are skipped —
// they can't be verified statically and would produce false positives.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const I18N_FILE = resolve(root, "src/lib/i18n.ts");
const SCAN_DIRS = ["src/routes", "src/components"].map((d) => resolve(root, d));
const EXTS = new Set([".ts", ".tsx"]);

// ---- 1. Collect defined keys + per-key vi/en presence --------------------
const i18nSrc = readFileSync(I18N_FILE, "utf8");

// Match each `"key": {` and remember where its entry starts so we can slice
// the body (which may span multiple lines) up to the next entry.
const entryStarts = [...i18nSrc.matchAll(/"([^"\n]+)"\s*:\s*\{/g)].map((m) => ({
  key: m[1],
  index: m.index,
}));

const defined = new Map(); // key -> { vi: bool, en: bool }
for (let i = 0; i < entryStarts.length; i++) {
  const { key, index } = entryStarts[i];
  const end = i + 1 < entryStarts.length ? entryStarts[i + 1].index : i18nSrc.length;
  const body = i18nSrc.slice(index, end);
  // Values may be double- or single-quoted (single quotes used when the text
  // contains a double quote, e.g. "{name}" prompts).
  const vi = /\bvi\s*:\s*(?:"([^]*?)"|'([^]*?)')/.exec(body);
  const en = /\ben\s*:\s*(?:"([^]*?)"|'([^]*?)')/.exec(body);
  const lo = /\blo\s*:\s*(?:"([^]*?)"|'([^]*?)')/.exec(body);
  const km = /\bkm\s*:\s*(?:"([^]*?)"|'([^]*?)')/.exec(body);
  const my = /\bmy\s*:\s*(?:"([^]*?)"|'([^]*?)')/.exec(body);
  const val = (m) => (m ? (m[1] ?? m[2] ?? "") : "");
  defined.set(key, {
    vi: !!vi && val(vi).trim().length > 0,
    en: !!en && val(en).trim().length > 0,
    lo: !!lo && val(lo).trim().length > 0,
    km: !!km && val(km).trim().length > 0,
    my: !!my && val(my).trim().length > 0,
  });
}

// ---- 2. Collect literal keys used across the app -------------------------
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(extname(p))) out.push(p);
  }
  return out;
}

const used = new Map(); // key -> Set(relative file paths)
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    // Only scan files where `t` is the global translator (from useT()). Files
    // with their own local `t` (e.g. card.$code.tsx uses a local lookup table)
    // reference a different, self-contained key space.
    if (!/\buseT\s*\(/.test(src)) continue;
    for (const m of src.matchAll(/\bt\(\s*"([^"]+)"/g)) {
      const key = m[1];
      if (!used.has(key)) used.set(key, new Set());
      used.get(key).add(file.replace(root + "/", ""));
    }
  }
}

// ---- 3. Report ------------------------------------------------------------
const missing = [];
const emptyLang = [];
for (const [key, files] of used) {
  const def = defined.get(key);
  const where = ` (${[...files].join(", ")})`;
  if (!def) {
    missing.push(`${key}${where}`);
  } else if (!def.vi || !def.en || !def.lo || !def.km || !def.my) {
    const langs = [!def.vi && "vi", !def.en && "en", !def.lo && "lo", !def.km && "km", !def.my && "my"].filter(Boolean).join(", ");
    emptyLang.push(`${key} — thiếu/để trống: ${langs}${where}`);
  }
}

if (missing.length || emptyLang.length) {
  console.error("\n[i18n-check] Phát hiện key i18n không hợp lệ:\n");
  if (missing.length) {
    console.error(`Thiếu định nghĩa (${missing.length}):`);
    for (const k of missing.sort()) console.error(`  - ${k}`);
  }
  if (emptyLang.length) {
    console.error(`\nThiếu bản dịch (${emptyLang.length}):`);
    for (const k of emptyLang.sort()) console.error(`  - ${k}`);
  }
  console.error(`\nCập nhật src/lib/i18n.ts (cả vi và en) rồi build lại.\n`);
  process.exit(1);
}

console.log(`[i18n-check] OK — ${used.size} key i18n dùng trong app đều có bản dịch vi + en.`);
