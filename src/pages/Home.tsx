import { Link } from "react-router-dom";
import { useState } from "react";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { Marquee } from "../components/Marquee";
import { SafeImage } from "../components/SafeImage";
import { TiltCard } from "../components/TiltCard";
import { ProductCard } from "../components/ProductCard";
import { HeroIntro, shouldPlayHeroIntro } from "../components/HeroIntro";
import { MobileHome } from "../components/MobileHome";
import { DesktopHero } from "../components/DesktopHero";
import { useDesktop } from "../hooks/useDesktop";
import { LearnScroll } from "../components/LearnScroll";
import { StatsStrip } from "../components/StatsStrip";
import { MagneticButton } from "../components/MagneticButton";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";


export function Home() {
  const desktop = useDesktop();
  if (!desktop) {
    return (
      <PageShell className="page-home page-home-mobile">
        <MobileHome />
      </PageShell>
    );
  }
  return <HomeDesktop />;
}

function HomeDesktop() {
  const { t, lang } = useI18n();
  const { academyLive: academy, newsLive, productsLive } = useSiteContent();
  const [introDone, setIntroDone] = useState(() => !shouldPlayHeroIntro());
  const playIntro = !introDone;

  const heroReady = introDone;

  return (
    <PageShell className="page-home">
      {playIntro && <HeroIntro onComplete={() => setIntroDone(true)} />}

      <DesktopHero ready={heroReady} />

      <div className="home-below">
        <Reveal>
          <Marquee />
        </Reveal>

        <StatsStrip />

        <LearnScroll />

        <section className="section">
          <Stagger className="split-promo">
            <StaggerItem>
              <TiltCard>
                <Link to="/about" className="promo-panel">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=72"
                    loading="lazy"
                    decoding="async"
                    alt={t("about_title")}
                  />
                  <div>
                    <p className="eyebrow light">{t("about_title")}</p>
                    <h3>{t("courses_title")}</h3>
                    <span>
                      {t("view")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
            <StaggerItem>
              <TiltCard>
                <Link to="/university" className="promo-panel">
                  <img
                    src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=72"
                    loading="lazy"
                    decoding="async"
                    alt={t("uni_title")}
                  />
                  <div>
                    <p className="eyebrow light">{t("nav_uni")}</p>
                    <h3>{t("china_home_title")}</h3>
                    <span>
                      {t("uni_more")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
          </Stagger>
        </section>

        <section className="section">
          <Reveal>
            <div className="section-row">
              <div>
                <p className="eyebrow">{t("nav_news")}</p>
                <h2 className="h2">{t("home_news")}</h2>
              </div>
              <Link to="/medee" className="text-link">
                {t("see_all")}
                <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="news-grid home-news">
            {newsLive.slice(0, 3).map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/medee/${item.id}`} className="news-card">
                  <div className="news-card-media">
                    <SafeImage
                      src={item.image}
                      alt={loc(lang, t, item.title, item.titleKey)}
                    />
                  </div>
                  <div className="news-card-body">
                    <div className="news-meta">
                      <span>{loc(lang, t, item.tag, item.tagKey)}</span>
                      <time dateTime={toDateTime(item.date)}>{item.date}</time>
                    </div>
                    <h3>{loc(lang, t, item.title, item.titleKey)}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="section section-last">
          <Reveal>
            <div className="section-row">
              <div>
                <p className="eyebrow">{t("nav_shop")}</p>
                <h2 className="h2">{t("home_shop")}</h2>
              </div>
              <Link to="/shop" className="text-link">
                {t("shop_link")}
                <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="shop-grid home-shop">
            {productsLive.slice(0, 2).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </div>

      <section className="home-finale">
        <span className="home-finale-mark" aria-hidden>
          汉
        </span>
        <Reveal>
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h2 className="home-finale-title">
            {t("mh_cta_a")} <em>{t("mh_cta_em")}</em> {t("mh_cta_b")}
          </h2>
          <div className="home-finale-ctas">
            <MagneticButton
              href={academy.registerUrl}
              className="btn btn-seal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </MagneticButton>
            <a className="btn hero-film-ghost" href={`tel:${academy.phoneRaw[0]}`}>
              <span>{t("call")} · {academy.phone[0]}</span>
            </a>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
