import { useI18n } from "../i18n/I18nContext";

/** Announcement above the university list (client copy, 2026-11-17). */
export function UniNotice() {
  const { t } = useI18n();
  return (
    <p className="uni-notice" role="status">
      <span className="uni-notice-mark" aria-hidden>
        告
      </span>
      <span>{t("uni_prep_notice")}</span>
    </p>
  );
}
