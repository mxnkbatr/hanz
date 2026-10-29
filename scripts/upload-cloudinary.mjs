/**
 * Upload a local file to Cloudinary (signed, server-side keys from .env.local).
 *
 *   node scripts/upload-cloudinary.mjs public/videos/hero-banner.mp4 hanz/hero-banner
 *
 * Args: <file> <public_id>. Video/image is detected from the extension.
 * Overwrites the same public_id. Prints the secure URL.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

const [file, publicId] = process.argv.slice(2);
if (!file || !publicId) {
  console.error("Usage: node scripts/upload-cloudinary.mjs <file> <public_id>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const cloud = env.VITE_CLOUDINARY_CLOUD_NAME;
const key = env.CLOUDINARY_API_KEY;
const secret = env.CLOUDINARY_API_SECRET;
if (!cloud || !key || !secret) {
  console.error("Missing VITE_CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local");
  process.exit(1);
}

const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(file);
const timestamp = Math.floor(Date.now() / 1000);
// Signature: sorted params joined with &, then the secret appended, SHA-1.
const params = { overwrite: "true", public_id: publicId, timestamp: String(timestamp) };
const toSign = Object.keys(params)
  .sort()
  .map((k) => `${k}=${params[k]}`)
  .join("&");
const signature = crypto.createHash("sha1").update(toSign + secret).digest("hex");

const form = new FormData();
form.append("file", new Blob([fs.readFileSync(file)]), path.basename(file));
for (const [k, v] of Object.entries(params)) form.append(k, v);
form.append("api_key", key);
form.append("signature", signature);

const url = `https://api.cloudinary.com/v1_1/${cloud}/${isVideo ? "video" : "image"}/upload`;
const res = await fetch(url, { method: "POST", body: form });
const body = await res.json();
if (!res.ok) {
  console.error("Upload failed:", res.status, body.error?.message ?? body);
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      public_id: body.public_id,
      secure_url: body.secure_url,
      bytes: body.bytes,
      duration: body.duration,
      width: body.width,
      height: body.height,
    },
    null,
    2,
  ),
);
