import { PageShell, Reveal } from "../components/PageShell";
import { AppLink } from "../components/AppLink";
import { IconCourses, IconQuiz, NavIcon } from "../components/Icons";
import { DarkModeRow, Group, LanguageRow, Row } from "../components/SettingsList";
import { HelpGroups } from "../components/HelpGroups";
import { useAuth } from "../lib/AuthContext";
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

  if (loading) {
    return (
      <PageShell className="page-profile pf">
        <h1 className="pf-title">{t("profile_title")}</h1>
      </PageShell>
    );
  }

  if (!user) return <GuestProfile />;

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

          <HelpGroups />

          <p className="pf-version">
            {t("brand")} · {t("profile_version")} 1.0
          </p>
        </div>
      </div>
    </PageShell>
  );
}

/** Not signed in: the tab still works — sign-in card, settings, help, contact. */
function GuestProfile() {
  const { t } = useI18n();
  return (
    <PageShell className="page-profile pf">
      <h1 className="pf-title">{t("profile_title")}</h1>
      <div className="pf-grid">
        <div className="pf-side">
          <section className="pf-card pf-guest">
            <span className="pf-avatar is-guest" aria-hidden>
              <NavIcon name="profile" />
            </span>
            <strong className="pf-email">{t("pf_guest_t")}</strong>
            <span className="pf-meta">{t("pf_guest_d")}</span>
            <div className="pf-guest-actions">
              <AppLink to="/auth?mode=login" className="btn btn-seal">
                <span>{t("auth_login")}</span>
              </AppLink>
              <AppLink to="/auth?mode=signup" className="pf-guest-link">
                {t("pf_guest_signup")}
              </AppLink>
            </div>
          </section>
        </div>
        <div className="pf-main">
          <Group title={t("mm_settings")}>
            <LanguageRow id="pf-lang" />
            <DarkModeRow />
          </Group>
          <HelpGroups />
          <p className="pf-version">
            {t("brand")} · {t("profile_version")} 1.0
          </p>
        </div>
      </div>
    </PageShell>
  );
}
