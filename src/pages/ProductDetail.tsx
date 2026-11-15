import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { formatPrice, getProductById } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type { ProductLive } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { ease } from "../lib/motion";
import { hapticLight } from "../lib/native";
import { PhotoGlow } from "../components/PhotoGlow";
import { checkQpayPaid, requestQpayInvoice, type QpayInvoice } from "../lib/qpay";
import { getSupabase } from "../lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

type Phase = "idle" | "form" | "sending" | "paying" | "paid" | "done";

export function ProductDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const { productsLive } = useSiteContent();
  const reduce = useReducedMotion();
  const p = (productsLive.find((x) => x.id === id) ??
    getProductById(id)) as ProductLive | undefined;

  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [invoice, setInvoice] = useState<QpayInvoice | null>(null);

  useEffect(() => {
    if (phase !== "paying" || !orderId) return;
    const timer = window.setInterval(async () => {
      if (await checkQpayPaid(orderId, "shop")) setPhase("paid");
    }, 5000);
    return () => window.clearInterval(timer);
  }, [phase, orderId]);

  const sheetOpen = phase !== "idle";
  useEffect(() => {
    if (!sheetOpen) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [sheetOpen]);

  if (!p) return <Navigate to="/shop" replace />;

  const related = productsLive.filter((x) => x.id !== p.id).slice(0, 3);
  const title = loc(lang, t, p.title, p.titleKey);
  const desc = loc(lang, t, null, p.descKey);
  const bodyText = loc(lang, t, p.body, p.bodyKey || p.descKey);
  const paragraphs = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const showLead = Boolean(desc && desc !== bodyText);
  const specs = p.specs ?? [];
  const catLabel =
    p.cat === "books"
      ? t("cat_books")
      : p.cat === "porcelain"
        ? t("cat_porcelain")
        : loc(lang, t, p.tag, p.tagKey) || t("nav_shop");
  const canBuy = p.inStock && p.price > 0;
  // Checkout step: 0 details · 1 payment · 2 confirmation (-1 = closed).
  const step =
    phase === "form" || phase === "sending"
      ? 0
      : phase === "paying" && invoice
        ? 1
        : phase === "paid" || phase === "done"
          ? 2
          : -1;

  function openCheckout() {
    setError("");
    setPhase("form");
    void hapticLight();
  }

  function closeCheckout() {
    if (phase === "sending") return;
    // Closing mid-payment keeps the order: it is saved and payable later.
    if (phase === "paying") {
      setPhase("done");
      return;
    }
    setPhase("idle");
    setError("");
  }

  async function startPay() {
    if (!p) return;
    const n = name.trim();
    const ph = phone.trim();
    if (!n || ph.replace(/\D/g, "").length < 8) {
      setError(t("shop_pay_fill"));
      return;
    }
    setPhase("sending");
    setError("");
    const id = crypto.randomUUID();
    const supabase = await getSupabase();
    const { error: err } = await supabase.from("shop_orders").insert({
      id,
      product_id: p.id,
      product_title: title,
      amount: Math.round(p.price),
      name: n,
      phone: ph,
      note: note.trim() || null,
    });
    if (err) {
      console.error("[shop]", err);
      setError(t("form_err"));
      setPhase("form");
      return;
    }
    setOrderId(id);
    void hapticLight();
    const { invoice: inv, error: qerr } = await requestQpayInvoice(id, "shop");
    if (qerr === "already_paid") {
      setPhase("paid");
      return;
    }
    if (inv) {
      setInvoice(inv);
      setPhase("paying");
      return;
    }
    console.error("[shop qpay]", qerr);
    setError(t("shop_pay_unavailable"));
    setPhase("done");
  }

  return (
    <PageShell className="page-detail page-shop is-app ios-app">
      <Reveal>
        <Link to="/shop" className="text-link back-link app-mobile">
          ← {t("back")}
        </Link>
      </Reveal>

      <PhotoGlow src={p.image} />
      <article className="product-detail desk-detail">
        <Reveal className="product-detail-media">
          <div className="desk-detail-hero app-detail-hero-square product-hero-anim">
            <SharedMedia
              id={`shop-${p.id}`}
              src={p.image}
              alt={title}
              loading="eager"
            />
            <Link to="/shop" className="cd-back detail-desk-back" aria-label={t("back")}>
              ←
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="product-detail-body desk-detail-body">
          <motion.p
            className="app-pill"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease }}
          >
            {catLabel} · {p.inStock ? t("in_stock") : t("out_stock")}
          </motion.p>
          <h1 className="h1">{title}</h1>
          <motion.p
            className="app-price"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.12,
              type: "spring",
              stiffness: 380,
              damping: 28,
            }}
          >
            {formatPrice(p.price, lang)}
          </motion.p>
          {showLead ? <p className="app-sub">{desc}</p> : null}

          <div className="desk-article-copy">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 28)}>{para}</p>
            ))}
          </div>

          {specs.length > 0 && (
            <>
              <h2 className="desk-detail-label">{t("detail_specs")}</h2>
              <ul className="app-chips product-spec-chips">
                {specs.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.16 + i * 0.06,
                      duration: 0.3,
                      ease,
                    }}
                  >
                    {t(s)}
                  </motion.li>
                ))}
              </ul>
            </>
          )}

          {/* Desktop keeps its inline button; phones get the bottom bar instead. */}
          <div className="desk-only desk-detail-actions product-cta-row">
            {canBuy ? (
              <button type="button" className="btn btn-seal" onClick={openCheckout}>
                <span>{t("buy")}</span>
              </button>
            ) : (
              <span className="btn btn-ink is-disabled" aria-disabled>
                <span>{t("out_stock")}</span>
              </span>
            )}
          </div>
        </Reveal>
      </article>

      {related.length > 0 && phase === "idle" && (
        <section className="section tight section-last related-block">
          <Reveal>
            <h2 className="desk-detail-label">{t("related")}</h2>
          </Reveal>

          <Stagger className="app-list app-mobile">
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/shop/${item.id}`} className="app-row app-row-media">
                  <span className="app-row-thumb">
                    <SafeImage src={item.image} alt="" />
                  </span>
                  <span className="app-row-body">
                    <strong>{loc(lang, t, item.title, item.titleKey)}</strong>
                    <em>{formatPrice(item.price, lang)}</em>
                  </span>
                  <span className="app-row-chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger className="shop-grid desk-only desk-grid">
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <ProductCard product={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* Phone: price and one Buy button, always in reach. */}
      {phase === "idle" &&
        createPortal(
          <div className="ck-bar">
            <div className="ck-bar-price">
              <span>{t("ck_total")}</span>
              <strong>{formatPrice(p.price, lang)}</strong>
            </div>
            {canBuy ? (
              <button type="button" className="btn btn-seal" onClick={openCheckout}>
                <span>{t("buy")}</span>
              </button>
            ) : (
              <span className="btn btn-ink is-disabled" aria-disabled>
                <span>{t("out_stock")}</span>
              </span>
            )}
          </div>,
          document.body,
        )}

      {/* Checkout: one full-screen sheet, three numbered steps. */}
      {step >= 0 &&
        createPortal(
          <div className="ck" role="dialog" aria-modal="true" aria-label={t("shop_checkout_for")}>
            <header className="ck-head">
              <button type="button" className="ck-close" onClick={closeCheckout} aria-label={t("back")}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <strong>{t("shop_checkout_for")}</strong>
              <span className="ck-head-spacer" />
            </header>

            <ol className="ck-steps">
              {[t("ck_step_info"), t("ck_step_pay"), t("ck_step_done")].map((label, n) => (
                <li
                  key={label}
                  className={n < step ? "is-done" : n === step ? "is-on" : ""}
                  aria-current={n === step ? "step" : undefined}
                >
                  <span className="ck-step-dot">{n < step ? "✓" : n + 1}</span>
                  <span className="ck-step-label">{label}</span>
                </li>
              ))}
            </ol>

            <div className="ck-body">
              {/* What is being bought, on every step */}
              <div className="ck-item">
                <span className="ck-item-thumb">
                  <SafeImage src={p.image} alt="" />
                </span>
                <span className="ck-item-body">
                  <strong>{title}</strong>
                  <em>{catLabel}</em>
                </span>
                <strong className="ck-item-price">{formatPrice(p.price, lang)}</strong>
              </div>

              {step === 0 && (
                <form
                  id="ck-form"
                  className="ck-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void startPay();
                  }}
                >
                  <div className="ck-fields">
                    <label>
                      <span>{t("form_name")}</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        maxLength={80}
                        disabled={phase === "sending"}
                      />
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
                        disabled={phase === "sending"}
                      />
                    </label>
                    <label>
                      <span>
                        {t("shop_delivery_note")} <small>{t("shop_optional")}</small>
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        maxLength={300}
                        placeholder={t("shop_delivery_ph")}
                        disabled={phase === "sending"}
                      />
                    </label>
                  </div>
                  <p className="ck-hint">{t("ck_info_lead")}</p>
                  {error && <p className="form-err">{error}</p>}
                </form>
              )}

              {step === 1 && invoice && (
                <div className="ck-pay">
                  <p className="ck-amount">
                    <span>{t("ck_total")}</span>
                    <strong>{formatPrice(invoice.amount, lang)}</strong>
                  </p>

                  {invoice.urls.length > 0 && (
                    <section className="ck-pay-block">
                      <h3>{t("ck_pay_app")}</h3>
                      <p>{t("ck_pay_app_d")}</p>
                      <ul className="ck-banks">
                        {invoice.urls.map((u) => (
                          <li key={u.link}>
                            <a href={u.link}>
                              <img src={u.logo} alt="" loading="lazy" />
                              <span>{u.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section className="ck-pay-block">
                    <h3>{t("ck_pay_qr")}</h3>
                    <p>{t("ck_pay_qr_d")}</p>
                    <img className="ck-qr" src={`data:image/png;base64,${invoice.qr_image}`} alt="QPay QR" />
                  </section>

                  <p className="ck-waiting" role="status">
                    <span className="ck-spinner" aria-hidden />
                    {t("ck_auto")}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="ck-done">
                  <span className="ck-done-mark" aria-hidden>
                    ✓
                  </span>
                  <h2>{phase === "paid" ? t("shop_paid_title") : t("shop_order_saved")}</h2>
                  <p>{phase === "paid" ? t("shop_paid_msg") : t("shop_order_saved_msg")}</p>
                </div>
              )}
            </div>

            <footer className="ck-foot">
              {step === 0 && (
                <button type="submit" form="ck-form" className="btn btn-seal" disabled={phase === "sending"}>
                  <span>
                    {phase === "sending"
                      ? t("form_sending")
                      : `${t("shop_pay_qpay")} · ${formatPrice(p.price, lang)}`}
                  </span>
                </button>
              )}
              {step === 1 && (
                <>
                  <button
                    type="button"
                    className="btn btn-seal"
                    onClick={async () => {
                      if (await checkQpayPaid(orderId, "shop")) setPhase("paid");
                    }}
                  >
                    <span>{t("wz_pay_check")}</span>
                  </button>
                  <button type="button" className="ck-link" onClick={() => setPhase("done")}>
                    {t("wz_pay_later")}
                  </button>
                </>
              )}
              {step === 2 && (
                <Link to="/shop" className="btn btn-seal" onClick={closeCheckout}>
                  <span>{t("nav_shop")}</span>
                </Link>
              )}
            </footer>
          </div>,
          document.body,
        )}
    </PageShell>
  );
}
