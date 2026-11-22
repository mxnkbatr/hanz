import { Link } from "react-router-dom";
import { ConsultForm } from "../components/ConsultForm";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";
import { DEFAULT_TRANS_FEATURE_KEYS } from "../lib/cms";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { PageBanner } from "../components/PageBanner";

export function Translation() {
  const { t, lang } = useI18n();
  const { academyLive: academy, translationFeaturesLive } = useSiteContent();

  return (
    <PageShell className="page-translation is-app ios-app">
      <PageBanner eyebrow={t("nav_translation")} title={t("service_title")} lead={t("service_body")} />
      <header className="page-head app-head has-banner">
        <Reveal>
          <p className="eyebrow desk-only">{t("nav_translation")}</p>
          <h1 className="h1">{t("service_title")}</h1>
          <p className="lead">{t("service_body")}</p>
        </Reveal>
      </header>

      <section className="section tight">
        <Reveal>
          <p className="eyebrow">{t("trans_services")}</p>
          <h2 className="h2 desk-only">{t("trans_services_lead")}</h2>
        </Reveal>
        <Stagger className="app-list">
          {translationFeaturesLive.map((f, i) => {
            const def =
              DEFAULT_TRANS_FEATURE_KEYS.find((d) => d.id === f.id) ??
              DEFAULT_TRANS_FEATURE_KEYS[i] ??
              DEFAULT_TRANS_FEATURE_KEYS[0];
            return (
              <StaggerItem key={f.id}>
                <div className="app-row app-row-static">
                  <span className="app-row-icon" aria-hidden>
                    {f.ico || def.ico}
                  </span>
                  <span className="app-row-body">
                    <strong>{loc(lang, t, f.title, def.t)}</strong>
                    <em>{loc(lang, t, f.body, def.d)}</em>
                  </span>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="section tight">
        <Reveal>
          <div className="app-list">
            <a href={`tel:${academy.phoneRaw[0]}`} className="app-row">
              <span className="app-row-icon" aria-hidden>
                ☎
              </span>
              <span className="app-row-body">
                <strong>{academy.phone[0]}</strong>
                <em>{t("call")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </a>
            <a href={`mailto:${academy.email}`} className="app-row">
              <span className="app-row-icon" aria-hidden>
                @
              </span>
              <span className="app-row-body">
                <strong>{academy.email}</strong>
                <em>Email</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </a>
            <Link to="/contact" className="app-row">
              <span className="app-row-icon" aria-hidden>
                址
              </span>
              <span className="app-row-body">
                <strong>{t("nav_contact")}</strong>
                <em>{t("contact_lead")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="section tight section-last">
        <Reveal>
          <p className="eyebrow">{t("trans_request")}</p>
          <h2 className="h2">{t("trans_request_lead")}</h2>
          <div className="content-panel" style={{ marginTop: "1rem" }}>
            <ConsultForm presetInterest="translation" />
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
