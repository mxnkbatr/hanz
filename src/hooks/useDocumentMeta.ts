import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";
import {
  getCourseById,
  getNewsById,
  getProductById,
  getTravelById,
  getUniversityById,
} from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type {
  CourseLive,
  NewsLive,
  ProductLive,
  TravelLive,
} from "../lib/cms";
import { loc } from "../lib/i18nText";

const routeMetaKey: Record<string, string> = {
  "/": "meta_home",
  "/about": "meta_about",
  "/courses": "meta_courses",
  "/enroll": "meta_enroll",
  "/medee": "meta_news",
  "/university": "meta_uni",
  "/travel": "meta_travel",
  "/shop": "meta_shop",
  "/contact": "meta_contact",
  "/profile": "meta_profile",
  "/auth": "meta_auth",
  "/quiz": "meta_quiz",
  "/translation": "nav_translation",
};

const BRAND = "Ханз Академи";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Page-level structured data (e.g. a Course), next to the static organisation block. */
function setPageJsonLd(data: Record<string, unknown> | undefined) {
  let el = document.getElementById("ld-page");
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = "ld-page";
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { t, lang } = useI18n();
  const {
    coursesLive,
    newsLive,
    productsLive,
    travelLive,
    universitiesLive,
  } = useSiteContent();

  useEffect(() => {
    const siteTitle = t("meta_title");
    let description = t("meta_desc");
    let image: string | undefined;
    let course: { name: string; description: string } | undefined;
    const newsMatch = matchPath("/medee/:id", pathname);
    const shopMatch = matchPath("/shop/:id", pathname);
    const uniMatch = matchPath("/university/:id", pathname);
    const travelMatch = matchPath("/travel/:id", pathname);
    const courseMatch = matchPath("/courses/:id", pathname);

    if (courseMatch?.params.id) {
      const id = courseMatch.params.id;
      const item = (coursesLive.find((c) => c.id === id) ??
        getCourseById(id)) as CourseLive | undefined;
      if (item) {
        description = t(item.descKey) || description;
        image = item.image;
        course = { name: loc(lang, t, item.title, item.titleKey), description };
      }
      document.title = item
        ? `${loc(lang, t, item.title, item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (newsMatch?.params.id) {
      const id = newsMatch.params.id;
      const item = (newsLive.find((n) => n.id === id) ??
        getNewsById(id)) as NewsLive | undefined;
      if (item) {
        description = loc(lang, t, item.excerpt, item.excerptKey) || description;
        image = item.image;
      }
      document.title = item
        ? `${loc(lang, t, item.title, item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (shopMatch?.params.id) {
      const id = shopMatch.params.id;
      const item = (productsLive.find((p) => p.id === id) ??
        getProductById(id)) as ProductLive | undefined;
      if (item) {
        if (item.descKey) description = t(item.descKey) || description;
        image = item.image;
      }
      document.title = item
        ? `${loc(lang, t, item.title, item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else if (uniMatch?.params.id) {
      const id = uniMatch.params.id;
      const track = getUniversityById(id);
      const school = universitiesLive.find((u) => u.id === id);
      if (track) {
        document.title = `${t(track.titleKey)} · ${BRAND}`;
      } else if (school) {
        document.title = `${loc(lang, t, school.title, school.nameMnKey || school.titleKey)} · ${BRAND}`;
      } else {
        document.title = `${t("not_found_title")} · ${BRAND}`;
      }
    } else if (travelMatch?.params.id) {
      const id = travelMatch.params.id;
      const item = (travelLive.find((p) => p.id === id) ??
        getTravelById(id)) as TravelLive | undefined;
      if (item) {
        description = t(item.descKey) || description;
        image = item.image;
      }
      document.title = item
        ? `${loc(lang, t, item.title, item.titleKey)} · ${BRAND}`
        : `${t("not_found_title")} · ${BRAND}`;
    } else {
      const known = routeMetaKey[pathname];
      if (!known) {
        document.title = `${t("not_found_title")} · ${BRAND}`;
      } else if (pathname === "/") {
        document.title = siteTitle;
      } else {
        document.title = `${t(known)} · ${BRAND}`;
      }
    }

    const url = window.location.origin + pathname;
    const imageUrl = image
      ? new URL(image, window.location.origin).href
      : `${window.location.origin}/images/og-cover.jpg`;
    setMeta("name", "description", description);
    setMeta("property", "og:title", document.title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:title", document.title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    setPageJsonLd(
      course && {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.name,
        description: course.description,
        url,
        image: imageUrl,
        inLanguage: lang === "zh" ? "zh-CN" : lang,
        provider: {
          "@type": "EducationalOrganization",
          name: "Ханз Академи · Hanz Academy Mongolia",
          sameAs: window.location.origin + "/",
        },
      },
    );

    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [
    pathname,
    lang,
    t,
    coursesLive,
    newsLive,
    productsLive,
    travelLive,
    universitiesLive,
  ]);
}
