import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "./PageShell";
import { SafeImage } from "./SafeImage";
import { BookingSheet, type BookingMode } from "./BookingSheet";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { mergeEnrollWindows, type SiteBundle, type UniInfoCms } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";
import { getUniversityById } from "../data/content";
import { CITY_LABELS, cityLabel, universities, type University } from "../data/universities";
import {
  polandIntake,
  polandStudentLife,
  polandTopUniversities,
  thinkPolandUniversities,
  type Txt,
} from "../data/poland";

type Country = "cn" | "pl";
type Lang = "mn" | "en" | "zh";

const txt = (x: Txt, lang: Lang) => (lang === "zh" ? x.zh : x.mn);

/** Admin-entered facts for a school, by slug or by name. */
export function uniInfoFor(bundle: SiteBundle, key: string): UniInfoCms | undefined {
  const k = key.trim().toLowerCase();
  return (bundle.uniInfo ?? []).find((x) => !x.hidden && x.id.trim().toLowerCase() === k);
}

const majorsOf = (info?: UniInfoCms) =>
  (info?.majors ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

const ICONS: Record<string, ReactNode> = {
  lang: <path d="M4 6h9M8.5 4v2M6 6c.4 3 2.4 5.4 5.5 6.6M11 6c-.5 3.2-2.6 5.6-6.5 6.8M13 20l3.5-9 3.5 9M14.2 17h4.6" />,
  tuition: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  living: <path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9M10 19v-5h4v5" />,
  visa: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 16h6" />
    </>
  ),
  work: (
    <>
      <rect x="3.5" y="8" width="17" height="11" rx="2.5" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M3.5 13h17" />
    </>
  ),
  intake: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  degree: <path d="M2.5 9.5 12 5l9.5 4.5L12 14zM6.5 11.7V16c1.6 1.5 3.4 2.2 5.5 2.2s3.9-.7 5.5-2.2v-4.3" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
};

/**
 * Phone "Зуучлал" tab: pick the country, read its guide (cost, visa, work rights),
 * browse its universities with city / major filters, then book a free
 * consultation or ask for an agency agreement.
 */
export function AbroadMobile() {
  const { t, lang } = useI18n();
  const { bundle } = useSiteContent();
  const [params, setParams] = useSearchParams();
  const country: Country = params.get("c") === "pl" ? "pl" : "cn";
  const [booking, setBooking] = useState<BookingMode | null>(null);

  const track = getUniversityById(country === "pl" ? "poland" : "china")!;
  const windows = mergeEnrollWindows(bundle, "university", track.id) ?? track.enrollWindows;
  const open = windows.find((w) => w.status === "open");

  function pick(c: Country) {
    const next = new URLSearchParams(params);
    if (c === "cn") next.delete("c");
    else next.set("c", c);
    setParams(next, { replace: true });
    void hapticLight();
  }

  // Guide rows: the admin's own when set, else the academy's existing copy.
  const guide = useMemo(() => {
    const custom = ((country === "cn" ? bundle.guideCn : bundle.guidePl) ?? []).filter(
      (r) => !r.hidden && loc(lang, t, r.label),
    );
    if (custom.length) {
      return custom.map((r) => ({ icon: "info", label: loc(lang, t, r.label), value: loc(lang, t, r.value) }));
    }
    return country === "cn"
      ? [
          { icon: "lang", label: t("ab_g_lang"), value: t("cmp_c1") },
          { icon: "tuition", label: t("ab_g_tuition"), value: t("cmp_c2") },
          { icon: "visa", label: t("ab_g_visa"), value: t("cmp_c3") },
          { icon: "degree", label: t("ab_g_degree"), value: t("cmp_c4") },
        ]
      : [
          { icon: "lang", label: t("ab_g_lang"), value: t("cmp_p1") },
          { icon: "tuition", label: t("ab_g_tuition"), value: t("ab_pl_tuition") },
          { icon: "living", label: t("ab_g_living"), value: t("ab_pl_living") },
          { icon: "visa", label: t("ab_g_visa"), value: t("cmp_p3") },
          { icon: "work", label: t("ab_g_work"), value: txt(polandStudentLife[1].body, lang) },
          { icon: "intake", label: t("ab_g_intake"), value: txt(polandIntake.lead, lang) },
          { icon: "degree", label: t("ab_g_degree"), value: t("cmp_p4") },
        ];
  }, [country, bundle, lang, t]);

  return (
    <PageShell className="page-uni is-app ios-app ab">
      <header className="page-head app-head">
        <h1 className="h1">{t("ab_title")}</h1>
      </header>

      {/* Country switch */}
      <div className="ab-seg" role="tablist" aria-label={t("form_country")}>
        {(["cn", "pl"] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={country === c}
            className={country === c ? "is-on" : ""}
            onClick={() => pick(c)}
          >
            <span className={`bk-flag is-${c}`} aria-hidden />
            {t(`country_${c}`)}
          </button>
        ))}
      </div>

      {/* Country card */}
      <Link to={`/university/${track.id}`} className="ab-hero">
        <SafeImage src={track.image} alt="" priority />
        <span className="ab-hero-shade" aria-hidden />
        <span className="ab-hero-body">
          {open ? (
            <em className="ab-open">
              {t("mh_enrolling")}
            </em>
          ) : null}
          <strong>{t(track.titleKey)}</strong>
          <span>{t(track.descKey)}</span>
        </span>
      </Link>

      {/* Guide */}
      <section className="m-section">
        <div className="m-section-head">
          <h2>{t("ab_guide")}</h2>
        </div>
        <ul className="m-group ab-guide">
          {guide.map((r) => (
            <li key={r.label} className={`ab-guide-row is-${r.icon}`}>
              <span className="cd-sched-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[r.icon] ?? ICONS.info}
                </svg>
              </span>
              <span className="ab-guide-text">
                <em>{r.label}</em>
                <strong>{r.value}</strong>
              </span>
            </li>
          ))}
          <li>
            <Link to={`/university/${track.id}`} className="ab-more">
              {t("ab_guide_more")}
              <span aria-hidden>›</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Help: the two requests */}
      <section className="ab-help">
        <strong>{t("ab_help")}</strong>
        <p>{t("ab_help_d")}</p>
        <button type="button" className="btn btn-seal" onClick={() => setBooking("consult")}>
          <span>{t("ab_book")}</span>
        </button>
        <button type="button" className="ab-help-link" onClick={() => setBooking("contract")}>
          {t("ab_contract")}
        </button>
      </section>

      {country === "cn" ? <ChinaSchools /> : <PolandSchools />}

      {booking && <BookingSheet mode={booking} country={country} onClose={() => setBooking(null)} />}
    </PageShell>
  );
}

/** Chips for one filter; hidden unless there is a real choice. */
function Chips({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  const { t } = useI18n();
  if (options.length < 2) return null;
  return (
    <div className="cf-row" role="group" aria-label={label}>
      <span className="cf-label">{label}</span>
      <div className="cf-chips">
        {[{ id: "all", label: t("f_all") }, ...options].map((o) => (
          <button
            key={o.id}
            type="button"
            className={`cf-chip${value === o.id ? " is-on" : ""}`}
            aria-pressed={value === o.id}
            onClick={() => {
              onChange(o.id);
              void hapticLight();
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoLine({ info }: { info?: UniInfoCms }) {
  const { t, lang } = useI18n();
  if (!info) return null;
  const parts = [
    loc(lang, t, info.tuition) && `${t("ab_tuition")}: ${loc(lang, t, info.tuition)}`,
    loc(lang, t, info.deadline) && `${t("ab_deadline")}: ${loc(lang, t, info.deadline)}`,
    loc(lang, t, info.dorm) && `${t("ab_dorm")}: ${loc(lang, t, info.dorm)}`,
  ].filter(Boolean);
  return parts.length ? <span className="ab-info">{parts.join(" · ")}</span> : null;
}

const FIRST = 8;

function ChinaSchools() {
  const { t, lang } = useI18n();
  const { bundle } = useSiteContent();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [major, setMajor] = useState("all");
  const [all, setAll] = useState(false);

  // Cities with at least three schools, biggest first.
  const cities = useMemo(() => {
    const n: Record<string, number> = {};
    for (const u of universities) if (u.city) n[u.city] = (n[u.city] ?? 0) + 1;
    return Object.entries(n)
      .filter(([, c]) => c >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => ({ id, label: cityLabel({ city: id } as University, lang) }));
  }, [lang]);

  const majors = useMemo(() => {
    const set = new Set<string>();
    for (const u of universities) for (const m of majorsOf(uniInfoFor(bundle, u.slug))) set.add(m);
    return [...set].sort().map((m) => ({ id: m, label: m }));
  }, [bundle]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return universities.filter((u) => {
      if (city !== "all" && u.city !== city) return false;
      if (major !== "all" && !majorsOf(uniInfoFor(bundle, u.slug)).includes(major)) return false;
      if (!query) return true;
      const names = u.city ? Object.values(CITY_LABELS[u.city] ?? {}).join(" ") : "";
      return `${u.name} ${u.zh ?? ""} ${u.city ?? ""} ${names}`.toLowerCase().includes(query);
    });
  }, [q, city, major, bundle]);

  const filtered = q.trim() !== "" || city !== "all" || major !== "all";
  const shown = all || filtered ? list : list.slice(0, FIRST);

  return (
    <section className="m-section">
      <div className="m-section-head">
        <h2>{t("ab_unis")}</h2>
      </div>
      <label className="ios-search">
        <span aria-hidden>⌕</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search_uni")}
          autoComplete="off"
        />
      </label>
      <div className="cf">
        <Chips label={t("ab_f_city")} value={city} onChange={setCity} options={cities} />
        <Chips label={t("ab_f_major")} value={major} onChange={setMajor} options={majors} />
      </div>

      {shown.length === 0 ? (
        <p className="ios-empty">{t("uni_list_empty")}</p>
      ) : (
        <ul className="m-group ab-list">
          {shown.map((u) => (
            <li key={u.slug}>
              <Link to={`/university/${u.slug}`} className="m-group-row">
                <span className="m-group-thumb">
                  <SafeImage src={u.photo?.src ?? ""} alt="" />
                </span>
                <span className="m-group-body">
                  <strong>{u.name}</strong>
                  <em>{[u.zh, cityLabel(u, lang)].filter(Boolean).join(" · ")}</em>
                  <InfoLine info={uniInfoFor(bundle, u.slug)} />
                </span>
                <span className="m-group-chev" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
          {!filtered && list.length > FIRST && (
            <li>
              <button type="button" className="ab-more" onClick={() => setAll((v) => !v)}>
                {all ? t("ab_unis_less") : t("ab_unis_more").replace("{n}", String(list.length))}
                <span aria-hidden>{all ? "‹" : "›"}</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function PolandSchools() {
  const { t, lang } = useI18n();
  const { bundle } = useSiteContent();
  const [major, setMajor] = useState("all");

  const majors = useMemo(() => {
    const set = new Set<string>();
    for (const u of polandTopUniversities) for (const m of majorsOf(uniInfoFor(bundle, u.name))) set.add(m);
    return [...set].sort().map((m) => ({ id: m, label: m }));
  }, [bundle]);

  const top = polandTopUniversities.filter(
    (u) => major === "all" || majorsOf(uniInfoFor(bundle, u.name)).includes(major),
  );
  const topNames = new Set(polandTopUniversities.map((u) => u.name));
  const partners = thinkPolandUniversities.filter((n) => !topNames.has(n));

  return (
    <>
      <section className="m-section">
        <div className="m-section-head">
          <h2>{t("ab_unis")}</h2>
        </div>
        <div className="cf">
          <Chips label={t("ab_f_major")} value={major} onChange={setMajor} options={majors} />
        </div>
        <ul className="m-group ab-list">
          {top.map((u) => (
            <li key={u.name}>
              <Link to="/university/poland" className="m-group-row">
                <span className="m-group-thumb">
                  {u.image ? <SafeImage src={u.image} alt="" /> : <span className="ab-initial">{u.name.charAt(0)}</span>}
                </span>
                <span className="m-group-body">
                  <strong>{u.name}</strong>
                  <em>{txt(u.programs, lang)}</em>
                  <InfoLine info={uniInfoFor(bundle, u.name)} />
                </span>
                <span className="m-group-chev" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {partners.length > 0 && major === "all" && (
        <section className="m-section">
          <div className="m-section-head">
            <h2>{t("ab_partner")}</h2>
          </div>
          <ul className="ab-partners">
            {partners.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
