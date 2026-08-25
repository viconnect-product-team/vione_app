// Build-time guard: warn/fail when i18n keys used for notification
// status / priority / unread labels do not exist in src/lib/i18n.ts.
//
// Runs in prebuild (see package.json). Exits non-zero on missing keys so
// broken labels are caught before shipping instead of rendering raw keys.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const I18N_FILE = resolve(root, "src/lib/i18n.ts");
const SCREEN_FILE = resolve(root, "src/routes/m.notifications.tsx");

// Only guard the label groups the notification screen relies on.
const GUARDED = /^m\.notifications\.(status|priority|filter)\./;

const i18nSrc = readFileSync(I18N_FILE, "utf8");
const screenSrc = readFileSync(SCREEN_FILE, "utf8");

// Collect defined translation keys: matches `"some.key": {`.
const defined = new Map();
for (const match of i18nSrc.matchAll(/"([^"]+)"\s*:\s*(\{[\s\S]*?\})/g)) {
  const [key, body] = [match[1], match[2]];
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

// Collect keys referenced anywhere in the notifications screen (t("..."),
// label maps, aria-labels, etc.) that belong to the guarded groups.
const used = new Set(
  [...screenSrc.matchAll(/"(m\.notifications\.[^"]+)"/g)]
    .map((m) => m[1])
    .filter((k) => GUARDED.test(k)),
);

const missing = [...used].filter((k) => !defined.has(k)).sort();

if (missing.length > 0) {
  console.error(
    "\n[i18n-check] Thiếu key i18n cho nhãn trạng thái/priority/unread trong màn hình thông báo:",
  );
  for (const k of missing) console.error(`  - ${k}`);
  console.error(`\nThêm các key trên vào src/lib/i18n.ts (cả vi, en, lo, km, my) rồi build lại.\n`);
  process.exit(1);
}

console.log(
  `[i18n-check] OK — ${used.size} key trạng thái/priority/unread hợp lệ trong màn hình thông báo.`,
);
