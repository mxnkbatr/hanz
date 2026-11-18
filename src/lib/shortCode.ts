/**
 * Short, stable code for a page id (e.g. a news slug) used in share links:
 * hanz.mn/m/<code>. 32-bit FNV-1a in base36, six characters. The same function
 * runs in api/share.js to find the article again — keep the two in sync.
 */
export function shortCode(id: string): string {
  let h = 0x811c9dc5;
  for (const ch of id) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(6, "0").slice(-6);
}
