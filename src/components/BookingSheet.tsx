import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n/I18nContext";
import { getSupabase } from "../lib/supabase";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

export type BookingMode = "consult" | "contract";
type Country = "cn" | "pl";

const SLOTS = ["morning", "day", "evening"] as const;
const LEVELS = ["language", "bachelor", "master", "scholarship"] as const;

/**
 * Study abroad requests, in the checkout sheet's look: book a free consultation
 * (day + time of day) or ask for an agency agreement (level of study). Saved as a
 * lead in `enrollments` (kind "consult", interest "university"), where the admin
 * already reads them; the readable summary goes in `message`.
 */
export function BookingSheet({
  mode,
  country,
  school,
  onClose,
}: {
  mode: BookingMode;
  country: Country;
  /** Pre-filled when opened from a university. */
  school?: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>("day");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("bachelor");
  const [note, setNote] = useState(school ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  const title = mode === "consult" ? t("ab_book_t") : t("ab_contract_t");

  async function send() {
    const n = name.trim();
    const ph = phone.trim();
    if (!n || ph.replace(/\D/g, "").length < 8) {
      setError(t("ab_fill"));
      return;
    }
    setError("");
    setStatus("sending");
    const lines = [
      `${t("ab_title")}: ${t(`country_${country}`)}`,
      title,
      mode === "consult"
        ? `${t("ab_day")}: ${day || "—"} · ${t(`tod_${slot}`)}`
        : `${t("ab_level")}: ${t(`abroad_${level}`)}`,
      note.trim(),
    ].filter(Boolean);
    const supabase = await getSupabase();
    const { error: err } = await supabase.from("enrollments").insert({
      name: n,
      phone: ph,
      kind: "consult",
      interest: "university",
      child_age: null,
      message: lines.join("\n").slice(0, 900),
    });
    if (err) {
      console.error("[abroad]", err);
      setError(t("form_err"));
      setStatus("idle");
      return;
    }
    void hapticLight();
    setStatus("ok");
  }

  return createPortal(
    <div className="ck" role="dialog" aria-modal="true" aria-label={title}>
      <header className="ck-head">
        <button type="button" className="ck-close" onClick={onClose} aria-label={t("back")}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <strong>{title}</strong>
        <span className="ck-head-spacer" />
      </header>

      {status === "ok" ? (
        <>
          <div className="ck-body">
            <div className="ck-done">
              <span className="ck-done-mark" aria-hidden>
                ✓
              </span>
              <h2>{t("ab_sent_t")}</h2>
              <p>{t("ab_sent_d")}</p>
            </div>
          </div>
          <footer className="ck-foot">
            <button type="button" className="btn btn-seal" onClick={onClose}>
              <span>{t("back")}</span>
            </button>
          </footer>
        </>
      ) : (
        <>
          <form
            id="bk-form"
            className="ck-body"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <p className="bk-country">
              <span className={`bk-flag is-${country}`} aria-hidden />
              {t(`country_${country}`)}
            </p>

            <div className="ck-fields">
              <label>
                <span>{t("form_name")}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
              </label>
              <label>
                <span>{t("form_phone")}</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="9999 9999"
                />
              </label>
            </div>
            <p className="ck-hint">{t("ab_call_lead")}</p>

            {mode === "consult" ? (
              <>
                <div className="ck-fields">
                  <label>
                    <span>{t("ab_day")}</span>
                    <input type="date" value={day} min={today} onChange={(e) => setDay(e.target.value)} />
                  </label>
                </div>
                <div className="bk-choice" role="group" aria-label={t("ab_slot")}>
                  <span className="cf-label">{t("ab_slot")}</span>
                  <div className="bk-seg">
                    {SLOTS.map((x) => (
                      <button
                        key={x}
                        type="button"
                        className={slot === x ? "is-on" : ""}
                        aria-pressed={slot === x}
                        onClick={() => setSlot(x)}
                      >
                        {t(`tod_${x}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bk-choice" role="group" aria-label={t("ab_level")}>
                <span className="cf-label">{t("ab_level")}</span>
                <div className="cf-chips">
                  {LEVELS.map((x) => (
                    <button
                      key={x}
                      type="button"
                      className={`cf-chip${level === x ? " is-on" : ""}`}
                      aria-pressed={level === x}
                      onClick={() => setLevel(x)}
                    >
                      {t(`abroad_${x}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ck-fields">
              <label>
                <span>
                  {t("ab_note")} <small>{t("shop_optional")}</small>
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder={t("ab_note_ph")}
                />
              </label>
            </div>
            {error && <p className="form-err">{error}</p>}
          </form>
          <footer className="ck-foot">
            <button type="submit" form="bk-form" className="btn btn-seal" disabled={status === "sending"}>
              <span>{status === "sending" ? t("form_sending") : t("ab_send")}</span>
            </button>
          </footer>
        </>
      )}
    </div>,
    document.body,
  );
}
