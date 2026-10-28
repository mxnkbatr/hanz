import { NavLink, Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { Suspense } from "react";
import "../../admin.css";
import { useAuth } from "../../lib/AuthContext";
import { useI18n } from "../../i18n/I18nContext";
import { Logo } from "../../components/Logo";
import {
  ADMIN_CMS_SIDE,
  ADMIN_MAIN,
  ADMIN_TABBAR,
  isAdminCmsPath,
} from "../../lib/adminNav";

function tabActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to || pathname === `${to}/`;
  if (to === "/admin/pages") {
    return isAdminCmsPath(pathname) || pathname.startsWith("/admin/media");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AdminLayout() {
  const { t } = useI18n();
  const { user, loading, isAdmin, adminChecked } = useAuth();
  const { pathname } = useLocation();

  if (loading || !adminChecked) {
    return (
      <div className="admin-shell admin-shell-native">
        <p className="admin-loading">{t("auth_busy")}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="admin-shell admin-shell-native">
      <aside className="admin-side admin-side-desk">
        <div className="admin-side-brand">
          <Logo size="sm" />
          <div>
            <strong>{t("admin_title")}</strong>
            <em>{user.email}</em>
          </div>
        </div>

        <nav className="admin-nav" aria-label={t("admin_title")}>
          <p className="admin-nav-group">{t("admin_group_main")}</p>
          {ADMIN_MAIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav-ico" aria-hidden>
                {item.ico}
              </span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}

          <p className="admin-nav-group">{t("admin_group_content")}</p>
          {ADMIN_CMS_SIDE.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav-ico" aria-hidden>
                {item.ico}
              </span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <Link to="/" className="admin-ghost-btn">
            ← {t("admin_view_site")}
          </Link>
        </div>
      </aside>

      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <Logo size="sm" />
          <div>
            <strong>{t("admin_title")}</strong>
            <em>{user.email}</em>
          </div>
        </div>
        <Link to="/" className="admin-topbar-link">
          {t("admin_view_site")}
        </Link>
      </header>

      <div className="admin-main">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>

      <nav className="admin-tabbar" aria-label={t("admin_title")}>
        {ADMIN_TABBAR.map((item) => {
          const active = tabActive(pathname, item.to, item.end);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`admin-tab${active ? " is-active" : ""}`}
            >
              <span className="admin-tab-ico" aria-hidden>
                {item.ico}
              </span>
              <span className="admin-tab-label">{t(item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
