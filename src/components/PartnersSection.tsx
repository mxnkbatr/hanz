import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

/**
 * The academy's two official partnerships (from the founder's CV, 2026-11-20):
 * Study in China Global's Ulaanbaatar office and Think Poland's sub-agent in Mongolia.
 */
export function PartnersSection({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <section className={`partners ${className}`} aria-labelledby="partners-h">
      <h2 id="partners-h" className="partners-h">
        {t("partners_h")}
      </h2>
      <div className="partners-grid">
        <a
          className="partner-card"
          href="https://studyinchinaglobal.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="partner-logo">
            <img src="/images/partners/scg.webp" alt="Study in China Global (SCG)" loading="lazy" />
          </span>
          <span className="partner-body">
            <strong>Study in China Global (SCG)</strong>
            <em>{t("partner_scg_role")}</em>
            <span className="partner-d">{t("partner_scg_d")}</span>
            <small>{t("partner_scg_meta")} · studyinchinaglobal.com ↗</small>
          </span>
        </a>
        <Link className="partner-card" to="/university/poland">
          <span className="partner-logo">
            <img src="/images/partners/think-poland.webp" alt="Think Poland" loading="lazy" />
          </span>
          <span className="partner-body">
            <strong>Think Poland</strong>
            <em>{t("partner_tp_role")}</em>
            <span className="partner-d">{t("partner_tp_d")}</span>
            <small>{t("partner_tp_meta")} →</small>
          </span>
        </Link>
      </div>
    </section>
  );
}
