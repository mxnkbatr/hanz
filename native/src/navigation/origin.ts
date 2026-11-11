export type CardOrigin = {
  x: number;
  y: number;
  w: number;
  h: number;
  image: string;
};

let pending: CardOrigin | null = null;

export function rememberOrigin(origin: CardOrigin) {
  pending = origin;
}

export function consumeOrigin() {
  const next = pending;
  pending = null;
  return next;
}
