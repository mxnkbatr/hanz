import { Navigate } from "react-router-dom";
import { PageShell, Reveal } from "../components/PageShell";
import { AppLink } from "../components/AppLink";
import { IconCourses, IconPhone, IconQuiz, NavIcon } from "../components/Icons";
import { DarkModeRow, Group, LanguageRow, LinkRow, Row } from "../components/SettingsList";
import { useAuth } from "../lib/AuthContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

const LOCALE = { mn: "mn-MN", en: "en-GB", zh: "zh-CN" } as const;

/**
 * Account page. Phone: iOS Settings — identity card, quick actions, grouped lists.
 * Desktop: the identity card becomes a sticky left column, lists sit beside it.
 * Only real data is shown (email, join date); there is no per-user progress yet.
 */
export function Profile() {
  const { t, lang } = useI18n();
  const { user, loading, signOut, isAdmin } = useAuth();
  const { academyLive: academy } = useSiteContent();

  if (loading) {
    return (
      <PageShell className="page-profile pf">
        <h1 className="pf-title">{t("profile_title")}</h1>
      </PageShell>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  const email = user.email ?? "";
  const initial = (email.trim()[0] ?? "H").toUpperCase();
  const joined = user.created_at ? new Date(user.created_at) : null;
  // Browsers have no Mongolian month names (mn-MN falls back to English), so spell it out.
  const since = !joined
    ? null
    : lang === "mn"
      ? `${joined.getFullYear()} оны ${joined.getMonth() + 1}-р сар`
      : joined.toLocaleDateString(LOCALE[lang as keyof typeof LOCALE] ?? "en-GB", {
          year: "numeric",
          month: "long",
        });

  return (
    <PageShell className="page-profile pf">
      <h1 className="pf-title">{t("profile_title")}</h1>

      <div className="pf-grid">
        <Reveal className="pf-side">
          <section className="pf-card">
            <span className="pf-avatar" aria-hidden>
              {initial}
            </span>
            <strong className="pf-email">{email}</strong>
            <span className="pf-meta">
              <i className="pf-dot" aria-hidden />
              {t("auth_signed_in")}
              {since && (
                <>
                  {" · "}
                  {t("pf_since")} {since}
                </>
              )}
            </span>
            {isAdmin && <span className="pf-badge">{t("admin_title")}</span>}
            <button
              type="button"
              className="pf-signout"
              onClick={() => {
                void hapticLight();
                void signOut();
              }}
            >
              {t("auth_logout")}
            </button>
          </section>

          <div className="pf-quick">
            <AppLink to="/courses" className="pf-quick-btn">
              <IconCourses />
              <span>{t("nav_courses")}</span>
            </AppLink>
            <AppLink to="/quiz" className="pf-quick-btn">
              <IconQuiz />
              <span>{t("pf_quiz")}</span>
            </AppLink>
            <AppLink to="/enroll" className="pf-quick-btn is-seal">
              <span className="pf-quick-arrow" aria-hidden>
                →
              </span>
              <span>{t("register_cta")}</span>
            </AppLink>
          </div>
        </Reveal>

        <div className="pf-main">
          <Group title={t("mm_settings")}>
            <LanguageRow id="pf-lang" />
            <DarkModeRow />
          </Group>

          {isAdmin && (
            <Group title={t("admin_title")}>
              <Row
                to="/admin"
               
                icon={<span className="sl-glyph">⌘</span>}
                label={t("admin_open")}
                detail={t("admin_open_d")}
              />
            </Group>
          )}

          <Group title={t("profile_explore")}>
            <Row to="/courses" icon={<NavIcon name="courses" />} label={t("nav_courses")} />
            <Row to="/university" icon={<NavIcon name="uni" />} label={t("nav_uni")} />
            <Row to="/shop" icon={<NavIcon name="bag" />} label={t("nav_shop")} />
            <Row to="/translation" icon={<span className="sl-glyph">译</span>} label={t("nav_translation")} />
            <Row to="/about" icon={<NavIcon name="about" />} label={t("nav_about")} />
          </Group>

          <Group title={t("footer_contact")}>
            <LinkRow href={`tel:${academy.phoneRaw[0]}`} icon={<IconPhone />} label={academy.phone[0]} detail={t("call")} />
            <LinkRow href={academy.messenger} external icon={<span className="sl-glyph">m</span>} label="Messenger" />
            <LinkRow href={`mailto:${academy.email}`} icon={<span className="sl-glyph">@</span>} label={academy.email} />
          </Group>

          <p className="pf-version">
            {t("brand")} · {t("profile_version")} 1.0
          </p>
        </div>
      </div>
    </PageShell>
  );
}
