/**
 * Link previews for shared pages (Vercel function).
 *
 * Facebook, Messenger, Telegram and Viber read only a page's HTML, and the site is a
 * single-page app whose HTML is the same for every address. Shared news links are
 * short — hanz.mn/m/<code> (vercel.json sends them here as ?c=<code>) — and this
 * finds the article, answers with its title, text and photo as Open Graph tags, and
 * sends people (not crawlers) straight on to the article.
 *
 * Older long links (?p=&t=&d=&i=) keep working. Targets are always paths on this
 * site and photos must be on this site or a host the site already uses.
 */
const SITE = (process.env.VITE_SITE_URL || "https://hanz.mn").replace(/\/+$/, "");
const SB_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const IMAGE_HOSTS = [/^hanz\.mn$/, /\.supabase\.co$/, /^images\.unsplash\.com$/, /^res\.cloudinary\.com$/];
const DEFAULT_TITLE = "Ханз Академи";
const DEFAULT_DESC = "Хятад хэл, HSK, Хятад, Польшид суралцах — Ханз Академи.";

/* Built-in articles (shown when the news table is empty). */
const STATIC_NEWS = {
  tips: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=72",
  scholarship: "/images/news-scholarship.webp",
  agent: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=72",
  kids: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=72",
};

/** Same as src/lib/shortCode.ts. */
function shortCode(id) {
  let h = 0x811c9dc5;
  for (const ch of id) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(6, "0").slice(-6);
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

const pick = (j) => (j && typeof j === "object" ? j.mn || j.en || j.zh || "" : "");

function safePath(p) {
  const v = String(p || "");
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\") || v.length > 400) return "/";
  return v;
}

/** trusted = the photo came from our own database (admin-entered), not from the link. */
function safeImage(i, trusted = false) {
  const v = String(i || "");
  if (v.startsWith("/") && !v.startsWith("//")) return SITE + v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" && (trusted || IMAGE_HOSTS.some((re) => re.test(u.hostname)))) return u.href;
  } catch {
    /* fall through */
  }
  return `${SITE}/images/og-cover.jpg`;
}

/** Find a news article by short code or slug: the news table first, then built-ins. */
async function findNews(code, slug) {
  const match = (s) => (slug ? s === slug : shortCode(s) === code);
  if (SB_URL && SB_KEY) {
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/news?select=slug,title,excerpt,image_url&hidden=eq.false&limit=1000`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } },
      );
      if (r.ok) {
        const rows = await r.json();
        const hit = rows.find((x) => x.slug && match(x.slug));
        if (hit) {
          return {
            path: `/medee/${encodeURIComponent(hit.slug)}`,
            title: pick(hit.title),
            desc: pick(hit.excerpt),
            image: hit.image_url || "",
          };
        }
      }
    } catch {
      /* fall back below */
    }
  }
  const id = Object.keys(STATIC_NEWS).find((k) => match(k));
  return id ? { path: `/medee/${id}`, title: "", desc: "", image: STATIC_NEWS[id] } : null;
}

export default async function handler(req, res) {
  const q = req.query || {};
  let page;
  let trusted = false;
  const code = String(q.c || "").toLowerCase();
  let slug = "";
  try {
    slug = decodeURIComponent(String(q.s || "")).slice(0, 300);
  } catch {
    slug = "";
  }
  if (slug || /^[0-9a-z]{6}$/.test(code)) {
    page = (await findNews(code, slug)) || { path: slug ? `/medee/${encodeURIComponent(slug)}` : "/medee", title: "", desc: "", image: "" };
    trusted = true;
  } else {
    page = { path: safePath(q.p), title: q.t, desc: q.d, image: q.i };
  }

  const path = safePath(page.path);
  const url = SITE + path;
  const title = clip(page.title, 120) || DEFAULT_TITLE;
  const desc = clip(page.desc, 220) || DEFAULT_DESC;
  const image = safeImage(page.image, trusted);

  const html = `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8" />
<title>${esc(title)} · Ханз Академи</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ханз Академи" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
${slug ? "" : `<meta http-equiv="refresh" content="0; url=${esc(path)}" />
`}</head>
<body>
<script>location.replace(${JSON.stringify(path)});</script>
<a href="${esc(path)}">${esc(title)}</a>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.status(200).send(html);
}
