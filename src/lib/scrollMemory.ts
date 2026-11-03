/**
 * Where the reader was on each history entry (by location key), so Back on a phone
 * lands where they left off, like a UINavigationController pop.
 */
const memo = new Map<string, number>();

export function rememberScroll(key: string, y: number) {
  memo.set(key, y);
}

export function recalledScroll(key: string) {
  return memo.get(key) ?? 0;
}
