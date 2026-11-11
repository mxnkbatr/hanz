import type { Intake, Plan, Program } from "../domain/types";

export const MEDIA = "https://hanz-swart.vercel.app";

export function media(path: string) {
  if (path.startsWith("http")) return path;
  return `${MEDIA}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatMnt(amount: number) {
  const body = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${body}₮`;
}

export function priceLabel(program: Program, plan?: Plan) {
  const picked = plan ?? program.plans[0];
  if (!picked || program.priceSource === "covered" || picked.amount <= 0) return "Үнэгүй";
  return formatMnt(picked.amount);
}

export function priceCaption(program: Program) {
  if (program.priceSource === "official") return "Албан ёсны төлбөр";
  if (program.priceSource === "covered") return "Сургалт, байр үнэгүй";
  return "Жишиг үнэ";
}

export function daysUntil(iso: string, now = Date.now()) {
  const end = new Date(`${iso}T23:59:59+08:00`).getTime();
  return Math.ceil((end - now) / 86_400_000);
}

export function soonestIntake(program: Program, now = Date.now()): Intake | undefined {
  return [...program.intakes]
    .filter((i) => daysUntil(i.deadline, now) >= 0 && i.seats > 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
}

export function seatsLeft(program: Program) {
  const open = program.intakes.filter((i) => daysUntil(i.deadline) >= 0);
  const pool = open.length ? open : program.intakes;
  return pool.reduce((min, i) => Math.min(min, i.seats), pool[0]?.seats ?? 0);
}

export function deadlineSoon(program: Program) {
  const intake = soonestIntake(program);
  if (!intake) return false;
  const days = daysUntil(intake.deadline);
  return days >= 0 && days <= 21;
}

export function formatRange(start: string, end: string) {
  const s = start.slice(5).replace("-", ".");
  const e = end.slice(5).replace("-", ".");
  return `${start.slice(0, 4)}.${s} – ${e}`;
}

export function formatDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${y}.${m}.${d}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "Өглөөний мэнд";
  if (h < 17) return "Өдрийн мэнд";
  return "Оройн мэнд";
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function receiptNo(id: string) {
  return `HNZ-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
