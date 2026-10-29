import { Link } from "react-router-dom";
import { formatPrice } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { loc } from "../lib/i18nText";
import type { ProductLive } from "../lib/cms";
import { SharedMedia } from "./SharedMedia";

export function ProductCard({ product }: { product: ProductLive }) {
  const { t, lang } = useI18n();
  const title = loc(lang, t, product.title, product.titleKey);
  const tag = loc(lang, t, product.tag, product.tagKey);
  const unit = product.descKey
    ? t(product.descKey)
    : loc(lang, t, product.body);
  const catLabel =
    product.cat === "books"
      ? t("cat_books")
      : product.cat === "porcelain"
        ? t("cat_porcelain")
        : tag || t("nav_shop");

  return (
    <div className="tilt-card">
      <div className="tilt-card-inner">
        <Link
          to={`/shop/${product.id}`}
          className={`shop-card${!product.inStock ? " is-soldout" : ""}`}
        >
          <div className="shop-media">
            <SharedMedia
              id={`shop-${product.id}`}
              src={product.image}
              alt={title}
              loading="lazy"
            />
            {tag && <span className="tag">{tag}</span>}
            {!product.inStock ? (
              <em className="badge-stock">{t("out_stock")}</em>
            ) : (
              <em className="badge-stock is-in">{t("in_stock")}</em>
            )}
          </div>
          <div className="shop-body">
            <p className="shop-cat">{catLabel}</p>
            <h3>{title}</h3>
            {unit && <p className="muted">{unit}</p>}
            <div className="shop-foot">
              <p className="price">{formatPrice(product.price, lang)}</p>
              <em className="card-cta">
                {t("view_detail")} <i aria-hidden>→</i>
              </em>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
