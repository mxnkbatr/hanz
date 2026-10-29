import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  enrollInterests,
  kidsLevels,
  partnerUniversities,
  kidsSchedules,
} from "../data/content";
import { EnrollForm } from "../components/EnrollForm";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function Enroll() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const interest = useMemo(() => {
    const raw = params.get("interest") || "consult";
    return enrollInterests.some((i) => i.id === raw) ? raw : "consult";
  }, [params]);
  const level = useMemo(() => {
    const raw = params.get("level") || kidsLevels[0].id;
    return kidsLevels.some((l) => l.id === raw) ? raw : kidsLevels[0].id;
  }, [params]);
  const schedule = useMemo(() => {
    const raw = params.get("schedule") || kidsSchedules[0].id;
    return kidsSchedules.some((s) => s.id === raw) ? raw : kidsSchedules[0].id;
  }, [params]);

  const interestMeta = enrollInterests.find((i) => i.id === interest);
  // A university name from the A–Z list (/university cards); anything else is ignored.
  const school = (params.get("school") || "").trim();
  const schoolName = partnerUniversities.some((u) => u === school) ? school : "";
  const isKids = interest === "kids";
  const isTravel = interest.startsWith("travel_");
  const backTo = isTravel
    ? `/travel/${interest.replace("travel_", "")}`
    : interest === "consult" && params.get("uni")
      ? "/university"
      : "/";

  return (
    <PageShell className="page-enroll is-app ios-app">
      <Reveal>
        <Link to={backTo} className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <header className="page-head app-head enroll-ios-head">
        <Reveal>
          <p className="enroll-step-label">{t("enroll_step")}</p>
          <h1 className="h1">
            {isKids ? t("kids_enroll_title") : t("enroll_page")}
          </h1>
          <p className="lead">
            {isKids
              ? t("kids_enroll_lead")
              : isTravel
                ? t("travel_enroll_form_lead")
                : t("enroll_ios_lead")}
          </p>
        </Reveal>
      </header>

      {interestMeta && (
        <Reveal>
          <div className="enroll-context">
            <span>{t("form_interest")}</span>
            <strong>{t(interestMeta.labelKey)}</strong>
          </div>
          {schoolName && (
            <div className="enroll-context">
              <span>{t("nav_uni")}</span>
              <strong>{schoolName}</strong>
            </div>
          )}
        </Reveal>
      )}

      <section className="section tight section-last enroll-wrap enroll-ios-sheet">
        <Reveal>
          <EnrollForm
            defaultInterest={interest}
            defaultLevel={level}
            defaultSchedule={schedule}
            context={schoolName ? `${t("nav_uni")}: ${schoolName}` : undefined}
            compact
          />
        </Reveal>
      </section>
    </PageShell>
  );
}
