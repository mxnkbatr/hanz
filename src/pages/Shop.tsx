import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type ShopCat } from "../data/content";
import { IosFilterBar } from "../components/IosFilterBar";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { ProductCard } from "../components/ProductCard";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { ease } from "../lib/motion";

const cats: ShopCat[] = ["all", "porcelain", "books"];

function catLabel(c: ShopCat, t: (k: string) => string) {
  if (c === "all") return t("filter_all");
  if (c === "porcelain") return t("cat_porcelain");
  return t("cat_books");
}

export function Shop() {
  const { t, lang } = useI18n();
  const { productsLive } = useSiteContent();
  const [cat, setCat] = useState<ShopCat>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: productsLive.length };
    for (const p of productsLive) {
      const key = p.cat || "";
      if (key) map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [productsLive]);

  const options = useMemo(
    () =>
      // A category chip only while the shop has something in it.
      cats.filter((c) => c === "all" || counts[c]).map((c) => ({
        id: c,
        label: catLabel(c, t),
        count: counts[c] ?? 0,
      })),
    [counts, t],
  );

  const list = useMemo(() => {
    const base =
      cat === "all"
        ? productsLive
        : productsLive.filter((p) => (p.cat || "") === cat);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((p) => {
      const hay =
        `${loc(lang, t, p.title, p.titleKey)} ${loc(lang, t, p.body, p.bodyKey || p.descKey)} ${loc(lang, t, p.tag, p.tagKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [cat, q, t, lang, productsLive]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = cat !== "all" || hasQuery;

  return (
    <PageShell className="page-shop is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow desk-only">{t("nav_shop")}</p>
          <h1 className="h1">{t("shop_page")}</h1>
          <p className="lead desk-only">{t("shop_lead")}</p>
        </Reveal>
      </header>

      <Reveal className="desk-only">
        <div className="shop-banner">
          <div className="shop-banner-media">
            <SafeImage src="/images/shop-hero.webp" alt={t("shop_hero_t")} />
          </div>
          <div className="shop-banner-copy">
            <p className="eyebrow light">{t("shop_featured")}</p>
            <h2>{t("shop_hero_t")}</h2>
            <p>{t("shop_hero_d")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="ios-toolbar">
          <label className="ios-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_shop")}
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

          <IosFilterBar
            options={options}
            value={cat}
            onChange={(id) => setCat(id as ShopCat)}
            ariaLabel={t("shop_filter_label")}
            layoutId="shop-filter-pill"
            showClear={isFiltered}
            clearLabel={t("news_clear")}
            onClear={() => {
              setCat("all");
              setQ("");
            }}
          />

          <p className="ios-result-meta desk-only">
            {t("results_count")}: <strong>{list.length}</strong>
          </p>
        </div>
      </Reveal>

      <section className="section tight section-last">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cat}:${q}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
          >
            {list.length === 0 ? (
              <p className="ios-empty">{t("empty_shop")}</p>
            ) : (
              <Stagger className="shop-grid">
                {list.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </PageShell>
  );
}
