/**
 * App icon + launch screen for the Capacitor apps, from public/images/logo.png.
 * Icon: the red 汉 seal on white. Launch screen: seal + "ХАНЗ" on the app's page
 * colour (#f6f4f4), so the app opens on the same colour the first page uses.
 * Every existing Android/iOS image slot is rewritten at its current size.
 *
 * Usage: node scripts/make-app-assets.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const LOGO = "public/images/logo.png";
const BG = "#f6f4f4";
const BG_RGB = { r: 246, g: 244, b: 244, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Regions of the 1024×1024 logo.
const SEAL = { left: 346, top: 178, width: 334, height: 332 };
const MARK = { left: 196, top: 170, width: 640, height: 640 }; // seal + ХАНЗ + subtitle

/** Logo crop with its white paper made transparent. */
const cut = (region) => sharp(LOGO).extract(region).unflatten().png().toBuffer();

async function onCanvas(region, w, h, scale, background) {
  const size = Math.round(Math.min(w, h) * scale);
  const art = await sharp(await cut(region)).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .flatten({ background })
    .png();
}

async function rewrite(file, make) {
  const { width, height } = await sharp(file).metadata();
  const img = await make(width, height);
  const buf = await img.toBuffer();
  fs.writeFileSync(file, buf);
  console.log("wrote", file, `${width}x${height}`);
}

const res = "android/app/src/main/res";
const dirs = fs.readdirSync(res);

// Android launch screens
for (const d of dirs.filter((x) => x.startsWith("drawable"))) {
  const f = path.join(res, d, "splash.png");
  if (fs.existsSync(f)) await rewrite(f, (w, h) => onCanvas(MARK, w, h, 0.42, BG_RGB));
}

// Android icons (legacy square/round, and adaptive foreground with its safe zone)
for (const d of dirs.filter((x) => x.startsWith("mipmap-") && !x.includes("anydpi"))) {
  for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
    const f = path.join(res, d, name);
    if (fs.existsSync(f)) await rewrite(f, (w, h) => onCanvas(SEAL, w, h, 0.62, WHITE));
  }
  const fg = path.join(res, d, "ic_launcher_foreground.png");
  if (fs.existsSync(fg)) {
    await rewrite(fg, async (w, h) => {
      const size = Math.round(Math.min(w, h) * 0.42);
      const art = await sharp(await cut(SEAL)).resize(size, size).toBuffer();
      return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: art, gravity: "center" }])
        .png();
    });
  }
}
const bgXml = path.join(res, "values", "ic_launcher_background.xml");
if (fs.existsSync(bgXml)) {
  fs.writeFileSync(
    bgXml,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n`,
  );
  console.log("wrote", bgXml);
}

// iOS: app icon (no transparency allowed) and launch screens
const iosIcon = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png";
if (fs.existsSync(iosIcon)) await rewrite(iosIcon, (w, h) => onCanvas(SEAL, w, h, 0.6, WHITE));
const splashDir = "ios/App/App/Assets.xcassets/Splash.imageset";
if (fs.existsSync(splashDir)) {
  for (const f of fs.readdirSync(splashDir).filter((x) => x.endsWith(".png"))) {
    await rewrite(path.join(splashDir, f), (w, h) => onCanvas(MARK, w, h, 0.26, BG_RGB));
  }
}
console.log("done");
