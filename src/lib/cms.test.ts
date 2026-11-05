import { describe, expect, it } from "vitest";
import { emptyBundle, mergeNews, mergeProducts } from "./cms";
import type { CmsRow } from "./cmsApi";

function row(partial: Partial<CmsRow> & Pick<CmsRow, "slug">): CmsRow {
  return {
    id: partial.id ?? `id-${partial.slug}`,
    title: partial.title ?? { mn: "Гарчиг", en: "Title", zh: "标题" },
    body: partial.body ?? { mn: "Бие", en: "Body", zh: "正文" },
    image_url: partial.image_url ?? null,
    hidden: partial.hidden ?? false,
    sort_order: partial.sort_order ?? 0,
    ...partial,
    slug: partial.slug,
  };
}

describe("mergeProducts", () => {
  it("falls back to static catalog when DB is empty", () => {
    const list = mergeProducts(emptyBundle(), []);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.id && p.price >= 0)).toBe(true);
  });

  it("prefers DB rows and keeps href/specs from matching slug", () => {
    const list = mergeProducts(emptyBundle(), [
      row({
        slug: "prod5",
        filter_key: "books",
        price: 99000,
        in_stock: true,
        image_url: "/courses/image11.webp",
        sort_order: 1,
      }),
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("prod5");
    expect(list[0].price).toBe(99000);
    expect(list[0].cat).toBe("books");
    expect(list[0].fromDb).toBe(true);
    expect(list[0].href).toBeTruthy();
    expect(list[0].specs?.length).toBeGreaterThan(0);
  });

  it("hides DB products marked hidden", () => {
    const list = mergeProducts(emptyBundle(), [
      row({ slug: "prod1", hidden: true, price: 1 }),
      row({ slug: "prod2", hidden: false, price: 2, sort_order: 0 }),
    ]);
    expect(list.map((p) => p.id)).toEqual(["prod2"]);
  });
});

describe("mergeNews", () => {
  it("falls back to static news when DB is empty", () => {
    const list = mergeNews(emptyBundle(), []);
    expect(list.length).toBeGreaterThan(0);
  });

  it("maps DB news slug and filter_key", () => {
    const list = mergeNews(emptyBundle(), [
      row({
        slug: "winter-intake",
        filter_key: "tag_course",
        published_at: "2026-10-01",
        title: { mn: "Өвөл", en: "Winter", zh: "冬季" },
        excerpt: { mn: "Товч", en: "Short", zh: "简介" },
        tag: { mn: "Курс", en: "Course", zh: "课程" },
        image_url: "https://example.com/n.jpg",
      }),
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("winter-intake");
    expect(list[0].tagKey).toBe("tag_course");
    expect(list[0].date).toBe("2026.10.01");
    expect(list[0].fromDb).toBe(true);
  });
});
