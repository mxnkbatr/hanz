import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

const AGENT = ["pla_ag_1", "pla_ag_2", "pla_ag_3", "pla_ag_4", "pla_ag_5", "pla_ag_6"] as const;
const PROGRAM = ["pla_pr_1", "pla_pr_2", "pla_pr_3", "pla_pr_4"] as const;
const FACTS = [
  ["pla_f_choice_k", "pla_f_choice_v"],
  ["pla_f_intake_k", "pla_f_intake_v"],
  ["pla_f_reply_k", "pla_f_reply_v"],
] as const;

/**
 * Polish university admission, 3+1 programme (client copy, 2026-11-25).
 * Order as asked: the 3+1 highlight, our agency's advantages first, the
 * programme's advantages in their own box, then general facts and documents.
 */
export function PolandAdmission() {
  const { t } = useI18n();

  return (
    <section className="pla" aria-labelledby="pla-title">
      <header className="pla-head">
        <p className="pla-eyebrow">
          <span aria-hidden>🇵🇱</span> {t("pla_eyebrow")}
        </p>
        <h2 id="pla-title">{t("pla_title")}</h2>
      </header>

      <div className="pla-hero">
        <span className="pla-hero-badge">3+1</span>
        <strong>{t("pla_hero_t")}</strong>
      </div>

      <div className="pla-grid">
        <article className="pla-card is-agent">
          <h3>{t("pla_ag_title")}</h3>
          <ul className="pla-checks">
            {AGENT.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </article>

        <article className="pla-card is-program">
          <h3>{t("pla_pr_title")}</h3>
          <ul className="pla-checks">
            {PROGRAM.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </article>

        <article className="pla-card">
          <h3>{t("pla_f_title")}</h3>
          <dl className="pla-facts">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <dt>{t(k)}</dt>
                <dd>{t(v)}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="pla-card">
          <h3>{t("pla_doc_title")}</h3>
          <ul className="pla-docs">
            <li>
              <strong>{t("pla_doc_lang_k")}</strong> {t("pla_doc_lang_v")}
            </li>
            <li>
              <strong>{t("pla_doc_edu_k")}</strong>
              <ul>
                <li>{t("pla_doc_edu_1")}</li>
                <li>{t("pla_doc_edu_2")}</li>
              </ul>
            </li>
            <li>
              <strong>{t("pla_doc_exam_k")}</strong> {t("pla_doc_exam_v")}
            </li>
            <li>
              <strong>{t("pla_doc_ref_k")}</strong> {t("pla_doc_ref_v")}
            </li>
          </ul>
        </article>
      </div>

      <Link to="/enroll?interest=university&uni=poland" className="pla-cta">
        {t("pla_cta")} <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
