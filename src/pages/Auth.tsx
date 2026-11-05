import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { SuccessBurst } from "../components/SuccessBurst";
import { useAuth } from "../lib/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Mode = "login" | "signup";

export function Auth() {
  const { t } = useI18n();
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (loading) {
    return (
      <PageShell className="page-auth is-app ios-app">
        <div className="auth-stage auth-stage-quiet" aria-busy="true" />
      </PageShell>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setInfo("");
    void hapticLight();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || password.length < 6) {
      setError(t("auth_err_fields"));
      return;
    }
    setBusy(true);
    void hapticLight();
    const res =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (mode === "signup") {
      setInfo(t("auth_signup_ok"));
    } else {
      navigate("/admin", { replace: true });
    }
  }

  return (
    <PageShell className="page-auth is-app ios-app">
      <div className="auth-stage">
        <div className="auth-glow" aria-hidden />
        <div className="auth-glow auth-glow-b" aria-hidden />

        <Link to="/" className="auth-close" aria-label={t("auth_close")}>
          ×
        </Link>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease }}
        >
          <div className="auth-hero">
            <div className="auth-brand" aria-hidden>
              <span>汉</span>
            </div>
            <p className="auth-wordmark">{t("brand")}</p>
          </div>

          <motion.header
            className="auth-card-head"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.25, ease }}
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease }}
              >
                {mode === "login" ? t("auth_login") : t("auth_signup")}
              </motion.h1>
            </AnimatePresence>
            <p>
              {mode === "login" ? t("auth_lead_login") : t("auth_lead_signup")}
            </p>
          </motion.header>

          <AnimatePresence mode="wait">
            {info ? (
              <motion.div
                key="auth-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <SuccessBurst
                  title={t("form_success_title")}
                  message={info}
                  doneLabel={t("auth_login")}
                  onDone={() => {
                    setInfo("");
                    setMode("login");
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`auth-body-${mode}`}
                initial={{ opacity: 0, x: mode === "login" ? -14 : 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 14 : -14 }}
                transition={{ duration: 0.26, ease }}
              >
                <LayoutGroup id="auth-mode">
                  <div className="auth-tabs" role="tablist">
                    {(["login", "signup"] as const).map((m) => {
                      const active = mode === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`auth-tab${active ? " is-active" : ""}`}
                          onClick={() => switchMode(m)}
                        >
                          {active && (
                            <motion.span
                              className="auth-tab-pill"
                              layoutId="auth-tab-pill"
                              transition={{
                                type: "spring",
                                stiffness: 480,
                                damping: 36,
                              }}
                            />
                          )}
                          <span>
                            {m === "login" ? t("auth_login") : t("auth_signup")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                <form className="auth-form" onSubmit={onSubmit}>
                  <div className="auth-fields">
                    <label className="auth-field">
                      <span>{t("auth_email")}</span>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                      />
                    </label>
                    <div className="auth-field">
                      <span id="auth-pass-label">{t("auth_password")}</span>
                      <div className="auth-pass-row">
                        <input
                          type={showPass ? "text" : "password"}
                          autoComplete={
                            mode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                          aria-labelledby="auth-pass-label"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          className="auth-pass-toggle"
                          onClick={() => {
                            setShowPass((v) => !v);
                            void hapticLight();
                          }}
                        >
                          {showPass ? t("auth_hide") : t("auth_show")}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="auth-msg is-err"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={busy || loading}
                  >
                    {busy
                      ? t("auth_busy")
                      : mode === "login"
                        ? t("auth_login")
                        : t("auth_signup")}
                  </button>
                </form>

                <p className="auth-switch">
                  {mode === "login"
                    ? t("auth_switch_to_signup")
                    : t("auth_switch_to_login")}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      switchMode(mode === "login" ? "signup" : "login")
                    }
                  >
                    {mode === "login" ? t("auth_signup") : t("auth_login")}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageShell>
  );
}
