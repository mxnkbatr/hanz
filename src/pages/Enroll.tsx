import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { partnerUniversities } from "../data/content";
import { programFromInterest } from "../data/enroll";
import { EnrollWizard } from "../components/EnrollWizard";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";

export function Enroll() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const interest = useMemo(() => programFromInterest(params.get("interest")), [params]);
  // hsk1…hsk6 or a kids level id; the form ignores anything that does not fit the programme.
  const level = params.get("level") || "";
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

      {schoolName && (
        <Reveal>
          <div className="enroll-context">
            <span>{t("nav_uni")}</span>
            <strong>{schoolName}</strong>
          </div>
        </Reveal>
      )}

      <section className="section tight section-last enroll-wrap enroll-ios-sheet">
        <Reveal>
          {/* No ?interest= → start at "choose a programme"; with one → straight to its details. */}
          <EnrollWizard
            defaultInterest={params.get("interest")}
            defaultLevel={level}
            context={schoolName ? `${t("nav_uni")}: ${schoolName}` : undefined}
          />
        </Reveal>
      </section>
    </PageShell>
  );
}
