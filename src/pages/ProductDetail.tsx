import { useEffect, useState } from "react";
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
import { checkQpayPaid, createQpayInvoice, type QpayInvoice } from "../lib/qpay";
import { getSupabase } from "../lib/supabase";

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

  if (!p) return <Navigate to="/shop" replace />;

  const related = productsLive.filter((x) => x.id !== p.id).slice(0, 3);
  const title = loc(lang, t, p.title, p.titleKey);
  const desc = loc(lang, t, p.body, p.descKey);
  const bodyText = loc(lang, t, p.body, p.bodyKey || p.descKey);
  const paragraphs = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const specs = p.specs ?? [];
  const catLabel =
    p.cat === "books"
      ? t("cat_books")
      : p.cat === "porcelain"
        ? t("cat_porcelain")
        : loc(lang, t, p.tag, p.tagKey) || t("nav_shop");
  const canBuy = p.inStock && p.price > 0;

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
    const inv = await createQpayInvoice(id, "shop");
    if (inv) {
      setInvoice(inv);
      setPhase("paying");
    } else {
      setPhase("done");
    }
  }

  if (phase === "paying" && invoice) {
    return (
      <PageShell className="page-detail page-shop is-app ios-app">
        <section className="wz wz-pay">
          <h2 className="wz-title">{t("wz_pay_title")}</h2>
          <p className="wz-lead">{t("wz_pay_lead")}</p>
          <p className="wz-amount">{formatPrice(invoice.amount, lang)}</p>
          <img className="wz-qr" src={`data:image/png;base64,${invoice.qr_image}`} alt="QPay QR" />
          {invoice.urls.length > 0 && (
            <ul className="wz-banks">
              {invoice.urls.map((u) => (
                <li key={u.link}>
                  <a href={u.link}>
                    <img src={u.logo} alt="" loading="lazy" />
                    <span>{u.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="wz-waiting">{t("wz_pay_waiting")}</p>
          <div className="wz-actions">
            <button
              type="button"
              className="btn btn-seal"
              onClick={async () => {
                if (await checkQpayPaid(orderId, "shop")) setPhase("paid");
              }}
            >
              <span>{t("wz_pay_check")}</span>
            </button>
            <button type="button" className="btn hsk-btn-ghost" onClick={() => setPhase("done")}>
              <span>{t("wz_pay_later")}</span>
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  if (phase === "paid" || phase === "done") {
    return (
      <PageShell className="page-detail page-shop is-app ios-app">
        <section className="wz wz-done">
          <span className="wz-done-mark" aria-hidden>
            ✓
          </span>
          <h2 className="wz-title">
            {phase === "paid" ? t("shop_paid_title") : t("shop_order_saved")}
          </h2>
          <p className="wz-lead">
            {phase === "paid" ? t("shop_paid_msg") : t("shop_order_saved_msg")}
          </p>
          <Link to="/shop" className="btn btn-seal">
            <span>{t("nav_shop")}</span>
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell className="page-detail page-shop is-app ios-app">
      <Reveal>
        <Link to="/shop" className="text-link back-link">
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
          <p className="app-sub">{desc}</p>

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

          {phase === "form" || phase === "sending" ? (
            <div className="wz-fields consult-form shop-checkout">
              <p className="enroll-fixed">
                <span>{t("shop_checkout_for")}</span>
                <strong>
                  {title} · {formatPrice(p.price, lang)}
                </strong>
              </p>
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
              {error && <p className="form-err">{error}</p>}
              <div className="product-cta-row desk-detail-actions">
                <button
                  type="button"
                  className="btn hsk-btn-ghost"
                  disabled={phase === "sending"}
                  onClick={() => {
                    setPhase("idle");
                    setError("");
                  }}
                >
                  <span>{t("back")}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-seal"
                  disabled={phase === "sending"}
                  onClick={() => void startPay()}
                >
                  <span>{phase === "sending" ? t("form_sending") : t("shop_pay_qpay")}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="app-sticky-actions desk-detail-actions product-cta-row">
              {canBuy ? (
                <motion.button
                  type="button"
                  className="btn btn-seal"
                  onClick={() => {
                    setPhase("form");
                    void hapticLight();
                  }}
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <span>{t("buy")}</span>
                </motion.button>
              ) : (
                <span className="btn btn-ink is-disabled" aria-disabled>
                  <span>{t("out_stock")}</span>
                </span>
              )}
            </div>
          )}
        </Reveal>
      </article>

      {related.length > 0 && phase === "idle" && (
        <section className="section tight section-last related-block">
          <Reveal>
            <h2 className="app-section-title">{t("related")}</h2>
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
    </PageShell>
  );
}
