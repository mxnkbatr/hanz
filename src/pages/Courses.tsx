import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { courseFacts, isEnrolling, shortDate } from "../data/courseFacts";
import type { CourseLive } from "../lib/cms";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";

export function Courses() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();

  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const langFilter = params.get("lang") || "all";
  const [level, setLevel] = useState("all");
  const [format, setFormat] = useState("all");
  const [time, setTime] = useState("all");

  const rows = useMemo(
    () => coursesLive.map((c) => ({ course: c, facts: courseFacts(c, t) })),
    [coursesLive, t],
  );

  const dims = useMemo(() => {
    const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];
    const levelOrder = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true });
    return {
      lang: uniq(rows.map((r) => r.facts.language)),
      level: uniq(
        rows
          .filter((r) => langFilter === "all" || r.facts.language === langFilter)
          .map((r) => r.facts.levelLabel),
      ).sort(levelOrder),
      format: uniq(rows.map((r) => r.facts.format)),
      time: uniq(rows.map((r) => r.facts.timeOfDay)),
    };
  }, [rows, langFilter]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows
      .filter(({ course: c, facts: f }) => {
        if (langFilter !== "all" && f.language !== langFilter) return false;
        if (level !== "all" && f.levelLabel !== level) return false;
        if (format !== "all" && f.format !== format) return false;
        if (time !== "all" && f.timeOfDay !== time) return false;
        if (!query) return true;
        const hay =
          `${loc(lang, t, c.title, c.titleKey)} ${loc(lang, t, c.body, c.descKey)} ${loc(lang, t, c.tag, c.tagKey)} ${f.levelLabel}`.toLowerCase();
        return hay.includes(query);
      })
      .map((r) => r.course);
  }, [rows, langFilter, level, format, time, q, t, lang]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = langFilter !== "all" || level !== "all" || format !== "all" || time !== "all" || hasQuery;
  const filterCount =
    Number(dims.lang.length > 1) +
    Number(dims.level.length > 1) +
    Number(dims.format.length > 1) +
    Number(dims.time.length > 1);

  function setLang(v: string) {
    const next = new URLSearchParams(params);
    if (v === "all") next.delete("lang");
    else next.set("lang", v);
    setParams(next, { replace: true });
    setLevel("all");
  }

  function clearAll() {
    setLang("all");
    setLevel("all");
    setFormat("all");
    setTime("all");
    setQ("");
  }

  return (
    <PageShell className="page-courses is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("courses_title")}</h1>
          <Link to="/pricing" className="text-link">
            {t("nav_pricing")} <i aria-hidden>→</i>
          </Link>
        </Reveal>
      </header>

      <Reveal>
        <Link
          to="/courses/match"
          className="course-match glass-panel course-match-compact is-intro"
          onClick={() => void hapticLight()}
        >
          <span className="course-match-compact-row">
            <span className="course-match-mark" aria-hidden>
              测
            </span>
            <span className="course-match-compact-copy">
              <strong>{t("cmatch_title")}</strong>
            </span>
            <span className="btn btn-seal course-match-start-mini">
              <span>{t("cmatch_start")}</span>
            </span>
          </span>
        </Link>
      </Reveal>

      <Reveal>
        <div className="ios-toolbar course-toolbar">
          <label className="ios-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("cmatch_search")}
              autoComplete="off"
            />
            {hasQuery && (
              <button
                type="button"
                className="ios-search-clear"
                onClick={() => setQ("")}
                aria-label={t("news_clear")}
              >
                ×
              </button>
            )}
          </label>

          <div className={`cf cf-bar${filterCount <= 1 ? " is-single" : ""}`}>
            {dims.lang.length > 1 && (
              <FilterRow
                label={t("f_lang")}
                value={langFilter}
                onChange={setLang}
                options={dims.lang.map((x) => ({ id: x, label: t(`lang_${x}`) }))}
                hideLabel={filterCount <= 1}
              />
            )}
            {dims.level.length > 1 && (
              <FilterRow
                label={t("f_level")}
                value={level}
                onChange={setLevel}
                options={dims.level.map((x) => ({ id: x, label: x }))}
                hideLabel={filterCount <= 1}
              />
            )}
            {dims.format.length > 1 && (
              <FilterRow
                label={t("f_format")}
                value={format}
                onChange={setFormat}
                options={dims.format.map((x) => ({ id: x, label: t(`fmt_${x}`) }))}
                hideLabel={filterCount <= 1}
              />
            )}
            {dims.time.length > 1 && (
              <FilterRow
                label={t("f_time")}
                value={time}
                onChange={setTime}
                options={dims.time.map((x) => ({ id: x, label: t(`tod_${x}`) }))}
                hideLabel={filterCount <= 1}
              />
            )}
            {isFiltered && (
              <button type="button" className="cf-clear" onClick={clearAll}>
                {t("news_clear")}
              </button>
            )}
          </div>
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          langFilter === "pl" && !rows.some((r) => r.facts.language === "pl") ? (
            <div className="cf-empty">
              <span className="cf-empty-mark" aria-hidden>
                Ą
              </span>
              <p>{t("courses_pl_empty")}</p>
              <Link to="/contact" className="btn btn-seal">
                <span>{t("courses_contact")}</span>
              </Link>
              <button type="button" className="cf-clear" onClick={clearAll}>
                {t("mh_quick_zh")} →
              </button>
            </div>
          ) : (
            <p className="ios-empty">{isFiltered ? t("courses_empty_filter") : t("cmatch_empty")}</p>
          )
        ) : (
          <Stagger className="course-product-grid">
            {list.map((c) => {
              const facts = courseFacts(c, t);
              const discount =
                c.discountPercent != null && c.discountPercent > 0 ? c.discountPercent : 0;
              const seats =
                c.seatsLeft != null
                  ? c.seatsLeft <= 0
                    ? t("mh_full")
                    : t("mh_seats_left").replace("{n}", String(c.seatsLeft))
                  : "";
              return (
                <StaggerItem key={c.id}>
                  <Link
                    to={`/courses/${c.id}`}
                    className="course-product-card"
                    onClick={() => void hapticLight()}
                  >
                    <div className="course-product-media">
                      <SafeImage
                        src={c.image}
                        alt={loc(lang, t, c.title, c.titleKey)}
                        loading="lazy"
                      />
                      <span className="course-product-badges">
                        {facts.levelLabel && (
                          <span className="course-product-tag">{facts.levelLabel}</span>
                        )}
                        {discount > 0 && (
                          <span className="course-product-sale">
                            {t("course_discount").replace("{n}", String(discount))}
                          </span>
                        )}
                      </span>
                      {seats && (
                        <span
                          className={`course-product-seats${
                            c.seatsLeft != null && c.seatsLeft <= 3 ? " is-low" : ""
                          }`}
                        >
                          {seats}
                        </span>
                      )}
                    </div>
                    <div className="course-product-body">
                      <h3>{loc(lang, t, c.title, c.titleKey)}</h3>
                      <CourseFactsLine course={c} hideLevel hideSeats />
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
  hideLabel = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  hideLabel?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="cf-row" role="group" aria-label={label}>
      {!hideLabel && <span className="cf-label">{label}</span>}
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

/** Meta chips + price — level / seats often sit on the photo instead. */
function CourseFactsLine({
  course,
  hideLevel = false,
  hideSeats = false,
}: {
  course: CourseLive;
  hideLevel?: boolean;
  hideSeats?: boolean;
}) {
  const { t, lang } = useI18n();
  const f = courseFacts(course, t);
  const start =
    course.startDate && isEnrolling(course)
      ? t("mh_starts").replace("{d}", shortDate(course.startDate, lang))
      : "";
  const chips = [
    hideLevel ? "" : f.levelLabel,
    f.format === "online" ? t("fmt_online") : "",
    f.timeOfDay ? t(`tod_${f.timeOfDay}`) : "",
    start,
  ].filter(Boolean);
  const showSeats = !hideSeats && course.seatsLeft != null;
  return (
    <span className="cp-facts">
      {(chips.length > 0 || showSeats) && (
        <span className="cp-chips">
          {chips.map((c) => (
            <i key={c}>{c}</i>
          ))}
          {showSeats && (
            <i className={`cp-seats${course.seatsLeft! <= 3 ? " is-low" : ""}`}>
              {course.seatsLeft! <= 0
                ? t("mh_full")
                : t("mh_seats_left").replace("{n}", String(course.seatsLeft))}
            </i>
          )}
        </span>
      )}
      <span className="cp-meta">
        {f.duration && <em className="cp-duration">{f.duration}</em>}
        {f.priceText && <strong className="cp-price">{f.priceText}</strong>}
      </span>
    </span>
  );
}
