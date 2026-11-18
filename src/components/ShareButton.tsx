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
 * Share a page. Phones (and the app) open the system share sheet — Messenger,
 * Facebook, Telegram, Viber, SMS…; elsewhere a small menu offers Facebook,
 * Telegram and "copy link".
 */
export function ShareButton({
  path,
  title,
  text,
  image,
}: {
  path: string;
  title: string;
  text?: string;
  /** Photo for the link preview (Facebook, Messenger, Telegram). */
  image?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Shared links go through /api/share so previews show this page’s title and photo.
  const params = new URLSearchParams({ p: path, t: title });
  if (text) params.set("d", text.slice(0, 220));
  if (image) params.set("i", image);
  const url = publicUrl(`/api/share?${params.toString()}`);

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
    window.setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1400);
  }

  const enc = encodeURIComponent;

  return (
    <div className="share" ref={box}>
      <button type="button" className="share-btn" onClick={() => void share()} aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </svg>
        <span>{t("share")}</span>
      </button>
      {open && (
        <div className="share-menu" role="menu">
          <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            <span className="share-ico is-fb">f</span>Facebook
          </a>
          <a role="menuitem" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">
            <span className="share-ico is-tg">➤</span>Telegram
          </a>
          <button type="button" role="menuitem" onClick={() => void copy()}>
            <span className="share-ico is-link">⧉</span>
            {copied ? t("share_copied") : t("share_copy")}
          </button>
        </div>
      )}
    </div>
  );
}
