import { useMemo, useState } from "react";
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

  const track = getUniversityById(country === "pl" ? "poland" : "china");
  const windows =
    (track && mergeEnrollWindows(bundle, "university", track.id)) ?? track?.enrollWindows ?? [];
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

  if (!track) {
    return (
      <PageShell className="page-uni is-app ios-app ab">
        <header className="page-head app-head">
          <h1 className="h1">{t("ab_title")}</h1>
        </header>
        <p className="ios-empty">{t("uni_list_empty")}</p>
      </PageShell>
    );
  }

  return (
    <PageShell className="page-uni is-app ios-app ab">
      <header className="page-head app-head">
        <h1 className="h1">{t("ab_title")}</h1>
      </header>

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

      <Link to={`/university/${track.id}`} className="ab-hero" onClick={() => void hapticLight()}>
        <SafeImage src={track.image} alt="" priority />
        <span className="ab-hero-shade" aria-hidden />
        <span className="ab-hero-body">
          {open ? <em className="ab-open">{t("mh_enrolling")}</em> : null}
          <strong>{t(track.titleKey)}</strong>
        </span>
      </Link>

      {/* Actions → sheet / country page (like Courses match CTA) */}
      <div className="ab-actions">
        <button
          type="button"
          className="course-match glass-panel course-match-compact is-intro ab-action"
          onClick={() => {
            setBooking("consult");
            void hapticLight();
          }}
        >
          <span className="course-match-compact-row">
            <span className="course-match-mark" aria-hidden>
              咨
            </span>
            <span className="course-match-compact-copy">
              <strong>{t("ab_help")}</strong>
            </span>
            <span className="btn btn-seal course-match-start-mini">
              <span>{t("ab_book_t")}</span>
            </span>
          </span>
        </button>
        <div className="ab-action-links">
          <Link to={`/university/${track.id}`} className="text-link" onClick={() => void hapticLight()}>
            {t("ab_guide_more")} <i aria-hidden>→</i>
          </Link>
          <button type="button" className="ab-help-link" onClick={() => setBooking("contract")}>
            {t("ab_contract_t")}
          </button>
        </div>
      </div>

      {/* Compact facts — full guide lives on the country page */}
      <ul className="ab-facts" aria-label={t("ab_guide")}>
        {guide.slice(0, 3).map((r) => (
          <li key={r.label}>
            <em>{r.label}</em>
            <strong>{r.value}</strong>
          </li>
        ))}
      </ul>

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

/** Short meta under a school card title — tuition or deadline only. */
function SchoolMeta({ info }: { info?: UniInfoCms }) {
  const { t, lang } = useI18n();
  if (!info) return null;
  const tuition = loc(lang, t, info.tuition);
  const deadline = loc(lang, t, info.deadline);
  const line = tuition || deadline;
  return line ? <em className="ab-card-meta">{line}</em> : null;
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
        <>
          <ul className="ab-product-grid">
            {shown.map((u) => {
              const info = uniInfoFor(bundle, u.slug);
              const city = cityLabel(u, lang);
              return (
                <li key={u.slug}>
                  <Link
                    to={`/university/${u.slug}`}
                    className="ab-product-card"
                    onClick={() => void hapticLight()}
                  >
                    <div className="ab-product-media">
                      <SafeImage src={u.photo?.src ?? ""} alt="" loading="lazy" />
                      {city && <span className="ab-product-tag">{city}</span>}
                    </div>
                    <div className="ab-product-body">
                      <h3>{u.name}</h3>
                      {u.zh && <em className="ab-card-zh">{u.zh}</em>}
                      <SchoolMeta info={info} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {!filtered && list.length > FIRST && (
            <button type="button" className="ab-more is-grid" onClick={() => setAll((v) => !v)}>
              {all ? t("ab_unis_less") : t("ab_unis_more").replace("{n}", String(list.length))}
              <span aria-hidden>{all ? "‹" : "›"}</span>
            </button>
          )}
        </>
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
        <ul className="ab-product-grid">
          {top.map((u) => {
            const info = uniInfoFor(bundle, u.name);
            const programs = txt(u.programs, lang);
            return (
              <li key={u.name}>
                <Link
                  to="/university/poland"
                  className="ab-product-card"
                  onClick={() => void hapticLight()}
                >
                  <div className="ab-product-media">
                    {u.image ? (
                      <SafeImage src={u.image} alt="" loading="lazy" />
                    ) : (
                      <span className="ab-initial">{u.name.charAt(0)}</span>
                    )}
                    <span className="ab-product-tag">{t("country_pl")}</span>
                  </div>
                  <div className="ab-product-body">
                    <h3>{u.name}</h3>
                    {programs && <em className="ab-card-zh">{programs}</em>}
                    <SchoolMeta info={info} />
                  </div>
                </Link>
              </li>
            );
          })}
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
