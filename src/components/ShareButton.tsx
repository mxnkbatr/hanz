import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

/** Public address of a page: the live site, never localhost or the app's capacitor:// origin. */
export function publicUrl(path: string) {
  const site = ((import.meta.env.VITE_SITE_URL as string | undefined) || "https://hanz.mn").replace(/\/+$/, "");
  const origin = window.location.origin;
  const base = /^https:\/\//.test(origin) && !/localhost|127\.0\.0\.1/.test(origin) ? origin : site;
  return `${base}${path}`;
}

/**
 * One tap copies the page's own address (readable, e.g.
 * https://hanz.mn/medee/хятад-хэл-…), ready to paste anywhere. Link previews on
 * Facebook / Messenger / Telegram show the page's photo (vercel.json → api/share).
 */
export function ShareButton({ path }: { path: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  // Keep Cyrillic readable when pasted (not %D1%85…).
  let readable = path;
  try {
    readable = decodeURI(path);
  } catch {
    /* keep as is */
  }
  const url = publicUrl(readable);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    void hapticLight();
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="share">
      <button
        type="button"
        className={`share-btn${copied ? " is-copied" : ""}`}
        onClick={() => void copy()}
        aria-live="polite"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5 10 17l9-10" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
        )}
        <span>{copied ? t("share_copied_link") : t("share")}</span>
      </button>
    </div>
  );
}
