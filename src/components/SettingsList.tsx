import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGroup, motion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { navSpring } from "../lib/motion";
import { useTheme } from "../lib/theme";

/** iOS Settings-style grouped lists, shared by the phone menu sheet and Profile. */

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sl-group">
      <h2 className="sl-group-title">{title}</h2>
      <div className="sl-list">{children}</div>
    </section>
  );
}

type RowBody = { icon: ReactNode; label: string; detail?: string };

function RowInner({ icon, label, detail }: RowBody) {
  return (
    <>
      <span className="sl-tile" aria-hidden>
        {icon}
      </span>
      <span className="sl-label">
        {label}
        {detail && <small className="sl-detail">{detail}</small>}
      </span>
      <svg className="sl-chevron" viewBox="0 0 12 12" aria-hidden>
        <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
}

/** A row that navigates inside the app. */
export function Row({ to, onGo, ...body }: RowBody & { to: string; onGo?: () => void }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sl-row${isActive ? " is-active" : ""}`}
      onClick={() => {
        onGo?.();
        void hapticLight();
      }}
    >
      <RowInner {...body} />
    </NavLink>
  );
}

/** A row that leaves the app: phone, mail, social. */
export function LinkRow({ href, external, ...body }: RowBody & { href: string; external?: boolean }) {
  return (
    <a
      href={href}
      className="sl-row"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <RowInner {...body} />
    </a>
  );
}

export function LanguageRow({ id }: { id: string }) {
  const { t, lang, setLang, langs } = useI18n();
  return (
    <div className="sl-row sl-row-static">
      <span className="sl-label">{t("profile_lang")}</span>
      <LayoutGroup id={id}>
        <div className="sl-seg" role="tablist" aria-label={t("profile_lang")}>
          {langs.map((l) => (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={lang === l.code}
              className={lang === l.code ? "is-active" : ""}
              onClick={() => {
                setLang(l.code);
                void hapticLight();
              }}
            >
              {lang === l.code && (
                <motion.span className="sl-seg-pill" layoutId={`${id}-pill`} transition={navSpring} />
              )}
              <span>{l.short}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

export function DarkModeRow() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  return (
    <label className="sl-row sl-row-static">
      <span className="sl-label">{t("theme_dark")}</span>
      <input
        type="checkbox"
        className="sl-switch"
        role="switch"
        checked={theme === "dark"}
        onChange={() => {
          toggle();
          void hapticLight();
        }}
      />
    </label>
  );
}
