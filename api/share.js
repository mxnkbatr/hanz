/**
 * Link previews for shared pages (Vercel function, GET /api/share).
 *
 * Facebook, Messenger, Telegram and Viber read only a page's HTML, and the site is a
 * single-page app whose HTML is the same for every address — so a shared article
 * showed the generic site card. The share button links here instead, with the
 * article's path, title, description and photo; this answers with those as Open
 * Graph tags and sends people (not crawlers) straight on to the article.
 *
 * Guarded: the target must be a path on this site (no open redirect), and the
 * photo must be on this site or one of the hosts the site already uses.
 */
const SITE = (process.env.VITE_SITE_URL || "https://hanz.mn").replace(/\/+$/, "");
const IMAGE_HOSTS = [/^hanz\.mn$/, /\.supabase\.co$/, /^images\.unsplash\.com$/, /^res\.cloudinary\.com$/];

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const clip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

function safePath(p) {
  const v = String(p || "");
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\") || v.length > 400) return "/";
  return v;
}

function safeImage(i) {
  const v = String(i || "");
  if (v.startsWith("/") && !v.startsWith("//")) return SITE + v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" && IMAGE_HOSTS.some((re) => re.test(u.hostname))) return u.href;
  } catch {
    /* fall through */
  }
  return `${SITE}/images/og-cover.jpg`;
}

export default function handler(req, res) {
  const q = req.query || {};
  const path = safePath(q.p);
  const url = SITE + path;
  const title = clip(q.t, 120) || "Ханз Академи";
  const desc = clip(q.d, 220) || "Хятад хэл, HSK, Хятад, Польшид суралцах — Ханз Академи.";
  const image = safeImage(q.i);

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
<meta http-equiv="refresh" content="0; url=${esc(path)}" />
</head>
<body>
<script>location.replace(${JSON.stringify(path)});</script>
<a href="${esc(path)}">${esc(title)}</a>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400");
  res.status(200).send(html);
}
