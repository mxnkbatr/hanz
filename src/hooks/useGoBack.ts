import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navKeys } from "../i18n/translations";

const TAB_ROOTS = new Set(navKeys.filter((k) => k.tab).map((k) => k.to));

/** Tab-bar pages are roots on a phone: no back button, no swipe back. */
export const isTabRoot = (path: string) => TAB_ROOTS.has(path);

/**
 * Back like a native nav bar: pop the history entry when there is one inside the
 * app, otherwise go up a level (a shared deep link still has somewhere to go).
 */
export function useGoBack() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(pathname.split("/").slice(0, -1).join("/") || "/");
  }, [navigate, pathname]);
}
