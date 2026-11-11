import type { QpayInvoice } from "../domain/types";

export type CachedInvoice = QpayInvoice | { unavailable: true; reason: string };

const cache = new Map<string, CachedInvoice>();

export function rememberInvoice(id: string, invoice: CachedInvoice) {
  cache.set(id, invoice);
}

export function recallInvoice(id: string) {
  return cache.get(id);
}
