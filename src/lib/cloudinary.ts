/**
 * Cloudinary delivery URLs. Only the public cloud name is used here; the API key and
 * secret live in .env.local for scripts/upload-cloudinary.mjs and never ship.
 */
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const BASE = CLOUD ? `https://res.cloudinary.com/${CLOUD}/video/upload` : null;

/** Optimised video (codec/quality picked per browser), or null without a cloud name. */
export function cloudVideo(publicId: string, width = 1920): string | null {
  return BASE ? `${BASE}/f_auto:video,q_auto,w_${width}/${publicId}` : null;
}

/** First frame of a video as an optimised still, for `poster`. */
export function cloudPoster(publicId: string, width = 1600): string | null {
  return BASE ? `${BASE}/so_0,f_auto,q_auto,w_${width}/${publicId}.jpg` : null;
}
