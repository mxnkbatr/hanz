import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, langs, type Lang } from "./translations";
import { featureKeys } from "./featureKeys";
import { siteCopy } from "./siteCopy";
import { anketCopy } from "./anketCopy";

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  langs: typeof langs;
};

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE = "hanz-lang";

/**
 * Languages switched off for now (client, 2026-11-24: Chinese is hidden until it is
 * ready). The texts stay in place; remove a code here to offer it again.
 */
const OFF: Lang[] = ["zh"];
const offered = langs.filter((l) => !OFF.includes(l.code));

const copy = siteCopy as Partial<Record<Lang, Record<string, string>>>;
const anket = anketCopy as Partial<Record<Lang, Record<string, string>>>;

function lookup(lang: Lang, key: string) {
  const features = featureKeys[lang] as Record<string, string>;
  const fallback = featureKeys.mn as Record<string, string>;
  return (
    anket[lang]?.[key] ??
    copy[lang]?.[key] ??
    features[key] ??
    dictionaries[lang][key] ??
    anket.mn?.[key] ??
    copy.mn?.[key] ??
    fallback[key] ??
    dictionaries.mn[key] ??
    key
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE) as Lang | null;
    return saved && dictionaries[saved] && !OFF.includes(saved) ? saved : "mn";
  });

  const setLang = (l: Lang) => {
    if (OFF.includes(l)) return;
    setLangState(l);
    localStorage.setItem(STORAGE, l);
  };

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      langs: offered,
      t: (key: string) => lookup(lang, key),
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
