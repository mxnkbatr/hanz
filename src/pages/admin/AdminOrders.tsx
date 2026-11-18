import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useI18n } from "../../i18n/I18nContext";
import { formatPrice } from "../../data/content";

export type OrderStatus = "new" | "paid" | "shipped" | "cancelled" | "spam";

export type ShopOrderRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  product_id: string;
  product_title: string;
  amount: number;
  name: string;
  phone: string;
  note: string | null;
  status: OrderStatus;
  qpay_invoice_id: string | null;
  paid_amount: number | null;
  paid_at: string | null;
  admin_note: string | null;
};

const STATUSES: OrderStatus[] = ["new", "paid", "shipped", "cancelled", "spam"];

export const ORDER_LABEL: Record<OrderStatus, string> = {
  new: "Шинэ",
  paid: "Төлсөн",
  shipped: "Хүргэсэн",
  cancelled: "Цуцалсан",
  spam: "Спам",
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Shop orders placed through the QPay checkout (table shop_orders). Paid status
 * and amount are written by the qpay edge function; staff move orders on to
 * "shipped" (delivered) or cancel them, and keep a private note.
 */
export function AdminOrders() {
  const { t } = useI18n();
  const [rows, setRows] = useState<ShopOrderRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from("shop_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoaded(true);
    if (error) {
      setErr(error.message);
      return;
    }
    setErr("");
    setRows((data as ShopOrderRow[]) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: rows.length };
    for (const r of rows) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [rows]);

  const revenue = useMemo(
    () => rows.filter((r) => r.status === "paid" || r.status === "shipped").reduce((s, r) => s + (r.paid_amount ?? r.amount), 0),
    [rows],
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!query) return true;
      return `${r.name} ${r.phone} ${r.product_title} ${r.note ?? ""}`.toLowerCase().includes(query);
    });
  }, [rows, filter, q]);

  async function update(id: string, patch: Partial<ShopOrderRow>) {
    setBusyId(id);
    const { error } = await supabase
      .from("shop_orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusyId("");
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Захиалга</h1>
        <p>Дэлгүүрээс QPay-ээр орсон захиалгууд. Төлбөр орж ирэхэд автоматаар "Төлсөн" болно.</p>
      </header>

      {err && (
        <p className="admin-err">
          {err}
          {/shop_orders|relation|does not exist/i.test(err) && (
            <>
              <br />
              supabase/shop_orders.sql файлыг Supabase SQL Editor-т ажиллуулна уу.
            </>
          )}
        </p>
      )}

      <div className="admin-stats">
        <article>
          <em>Нийт</em>
          <strong>{counts.all ?? 0}</strong>
        </article>
        <article className="is-accent">
          <em>Шинэ</em>
          <strong>{counts.new ?? 0}</strong>
        </article>
        <article>
          <em>Төлсөн</em>
          <strong>{(counts.paid ?? 0) + (counts.shipped ?? 0)}</strong>
        </article>
        <article>
          <em>Орлого</em>
          <strong>{formatPrice(revenue)}</strong>
        </article>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Нэр, утас, бараа…"
        />
        <div className="admin-chips">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`admin-chip${filter === s ? " is-on" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Бүгд" : ORDER_LABEL[s]}
              <i>{counts[s] ?? 0}</i>
            </button>
          ))}
        </div>
        <button type="button" className="admin-ghost-btn" onClick={() => void load()}>
          ↻ Шинэчлэх
        </button>
      </div>

      {!loaded ? (
        <p className="admin-empty">{t("auth_busy")}</p>
      ) : list.length === 0 ? (
        <p className="admin-empty">Захиалга алга.</p>
      ) : (
        <div className="admin-orders">
          {list.map((r) => (
            <article key={r.id} className={`admin-order is-${r.status}`}>
              <header>
                <div>
                  <strong>{r.product_title || r.product_id}</strong>
                  <em>{fmtDate(r.created_at)}</em>
                </div>
                <span className={`admin-badge is-${r.status === "shipped" ? "done" : r.status === "cancelled" ? "declined" : r.status}`}>
                  {ORDER_LABEL[r.status] ?? r.status}
                </span>
              </header>

              <dl>
                <div>
                  <dt>Үнэ</dt>
                  <dd>{formatPrice(r.amount)}</dd>
                </div>
                <div>
                  <dt>Төлсөн</dt>
                  <dd>{r.paid_amount ? `${formatPrice(r.paid_amount)} · ${r.paid_at ? fmtDate(r.paid_at) : ""}` : "—"}</dd>
                </div>
                <div>
                  <dt>Захиалагч</dt>
                  <dd>
                    {r.name} · <a href={`tel:${r.phone}`}>{r.phone}</a>
                  </dd>
                </div>
                {r.note && (
                  <div>
                    <dt>Хүргэлт</dt>
                    <dd>{r.note}</dd>
                  </div>
                )}
              </dl>

              <div className="admin-order-actions">
                <select
                  value={r.status}
                  disabled={busyId === r.id}
                  onChange={(e) => void update(r.id, { status: e.target.value as OrderStatus })}
                  aria-label="Төлөв"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_LABEL[s]}
                    </option>
                  ))}
                </select>
                <input
                  value={notes[r.id] ?? r.admin_note ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                  onBlur={() => {
                    const v = (notes[r.id] ?? r.admin_note ?? "").trim();
                    if (v !== (r.admin_note ?? "")) void update(r.id, { admin_note: v || null });
                  }}
                  placeholder="Тэмдэглэл…"
                  aria-label="Тэмдэглэл"
                />
                <a className="admin-btn" href={`tel:${r.phone}`}>
                  ☎ Залгах
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
