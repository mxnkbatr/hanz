import { useEffect, useRef, useState } from "react";
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
 * Share a page by its short link (e.g. hanz.mn/m/k3x9qa — previews show the page's
 * own photo, see api/share.js). Next to the Share button the short link itself is
 * shown with a one-tap Copy. Phones (and the app) open the system share sheet;
 * elsewhere a small menu offers Facebook and Telegram.
 */
export function ShareButton({ shortPath, title, text }: { shortPath: string; title: string; text?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const url = publicUrl(shortPath);
  const shown = url.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  async function share() {
    void hapticLight();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch (e) {
        // Dismissed by the user: nothing to do. Anything else: fall back to the menu.
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    void hapticLight();
    window.setTimeout(() => setCopied(false), 1600);
  }

  const enc = encodeURIComponent;

  return (
    <div className="share" ref={box}>
      <div className="share-row">
        <button type="button" className="share-btn" onClick={() => void share()} aria-expanded={open}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
          <span>{t("share")}</span>
        </button>

        {/* The short link itself: tap anywhere on it to copy. */}
        <button
          type="button"
          className={`share-link${copied ? " is-copied" : ""}`}
          onClick={() => void copy()}
          aria-label={`${t("share_copy")}: ${url}`}
        >
          <span className="share-link-url">{shown}</span>
          <span className="share-link-action">{copied ? t("share_copied") : t("share_copy_short")}</span>
        </button>
      </div>

      {open && (
        <div className="share-menu" role="menu">
          <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            <span className="share-ico is-fb">f</span>Facebook
          </a>
          <a role="menuitem" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">
            <span className="share-ico is-tg">➤</span>Telegram
          </a>
          <a role="menuitem" href={`fb-messenger://share?link=${enc(url)}`}>
            <span className="share-ico is-ms">m</span>Messenger
          </a>
        </div>
      )}
    </div>
  );
}
