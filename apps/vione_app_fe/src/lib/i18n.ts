import { createContext, useContext } from "react";
import vi from "../../../../packages/shared/locales/vi.json";
import en from "../../../../packages/shared/locales/en.json";
import ja from "../../../../packages/shared/locales/ja.json";
import ko from "../../../../packages/shared/locales/ko.json";
import zh from "../../../../packages/shared/locales/zh.json";
import lo from "../../../../packages/shared/locales/lo.json";
import km from "../../../../packages/shared/locales/km.json";
import my from "../../../../packages/shared/locales/my.json";

/** Canonical dictionary languages. */
export type BaseLang = "vi" | "en";
export type ExtraLang = "my" | "km" | "lo" | "ja" | "ko" | "zh";
/** All selectable UI languages. */
export type Lang = BaseLang | ExtraLang;

export const SUPPORTED_LANGS: Lang[] = ["vi", "en", "ja", "ko", "zh", "my", "km", "lo"];

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (SUPPORTED_LANGS as string[]).includes(v);
}

export const EXTRA_LANG_LOCALES: Record<ExtraLang, string> = {
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  my: "my-MM",
  km: "km-KH",
  lo: "lo-LA",
};

// Reconstruct translations mapping key -> { vi, en, ja, ko, zh, lo, km, my }
export const translations: Record<
  string,
  { vi: string; en: string; ja?: string; ko?: string; zh?: string; lo?: string; km?: string; my?: string }
> = {};

const allKeys = new Set<string>([
  ...Object.keys(vi),
  ...Object.keys(en),
  ...Object.keys(ja),
  ...Object.keys(ko),
  ...Object.keys(zh),
  ...Object.keys(lo),
  ...Object.keys(km),
  ...Object.keys(my),
]);

for (const key of allKeys) {
  translations[key] = {
    vi: (vi as Record<string, string>)[key] || "",
    en: (en as Record<string, string>)[key] || "",
    ja: (ja as Record<string, string>)[key],
    ko: (ko as Record<string, string>)[key],
    zh: (zh as Record<string, string>)[key],
    lo: (lo as Record<string, string>)[key],
    km: (km as Record<string, string>)[key],
    my: (my as Record<string, string>)[key],
  };
}

export type TKey = keyof typeof vi;

/** Safe presence check for a dynamically-derived translation key. */
export function hasTKey(key: string): key is TKey {
  return Object.prototype.hasOwnProperty.call(translations, key);
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "vi",
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

/** Map any UI language to a language present in the canonical dictionary. */
export function baseLang(lang: Lang): BaseLang {
  return lang === "vi" ? "vi" : "en";
}

export function translate(key: TKey, lang: Lang): string {
  const entry = translations[key as string];
  if (!entry) return String(key);
  if (lang === "vi" || lang === "en") return entry[lang] ?? entry.en ?? entry.vi ?? String(key);
  return entry[lang] ?? entry.en ?? entry.vi ?? String(key);
}

export function useT() {
  const { lang } = useLang();
  return (key: TKey, vars?: Record<string, string | number>) => {
    let s: string = translate(key, lang);
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
      }
    }
    return s;
  };
}

export function useFmt() {
  const { lang } = useLang();
  const locale =
    lang === "en" ? "en-US" : lang === "vi" ? "vi-VN" : (EXTRA_LANG_LOCALES[lang] ?? "en-US");

  return {
    locale,
    date: (iso: string) => (iso === "—" ? "—" : new Date(iso).toLocaleDateString(locale)),
    /** Localized relative time from an ISO string (e.g. "5 phút trước" / "5 min ago"). */
    rel: (iso: string | null | undefined) => {
      if (!iso) return "";
      const tr = (
        k: "m.rel.justNow" | "m.rel.minAgo" | "m.rel.hourAgo" | "m.rel.dayAgo",
        n?: number,
      ) => translate(k, lang).replace("{n}", String(n ?? ""));
      const diff = Date.now() - new Date(iso).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return tr("m.rel.justNow");
      if (min < 60) return tr("m.rel.minAgo", min);
      const h = Math.floor(min / 60);
      if (h < 24) return tr("m.rel.hourAgo", h);
      return tr("m.rel.dayAgo", Math.floor(h / 24));
    },
    money: (n: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(n),
    num: (n: number) => n.toLocaleString(locale),
  };
}
