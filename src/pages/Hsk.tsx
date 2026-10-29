import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { formatPrice } from "../data/content";
import { hskIntro, hskLevels, hskSchedule, type HskLevel } from "../data/hsk";
import { useSiteContent } from "../lib/SiteContentContext";

const ENROLL = "/enroll?interest=hsk";
const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * HSK 3.0 programme: intro, six level cards (3 / 2 / 1 columns), a large detail
 * card per level in a dialog, then class schedule and fees. Content is in
 * data/hsk.ts (Mongolian, from the academy's document).
 */
export function Hsk() {
  const { academyLive: academy } = useSiteContent();
  // #hsk-3 in the URL opens that level straight away (shareable links).
  const [open, setOpen] = useState<HskLevel | null>(() => {
    const m = /^#hsk-(\d)$/.exec(window.location.hash);
    return (m && hskLevels.find((l) => l.level === Number(m[1]))) || null;
  });

  return (
    <PageShell className="page-hsk">
      <header className="hsk-hero">
        <Reveal>
          <p className="eyebrow">{hskIntro.eyebrow}</p>
          <h1 className="h1">{hskIntro.title}</h1>
          <p className="hsk-subtitle">{hskIntro.subtitle}</p>
          <p className="lead">{hskIntro.lead}</p>
          <div className="hsk-actions">
            <Link to={ENROLL} className="btn btn-seal">
              <span>Сургалтад бүртгүүлэх</span>
            </Link>
            <Link to="/quiz" className="btn hsk-btn-ghost">
              <span>Түвшнээ тодорхойлуулах</span>
            </Link>
            <a href="#hsk-levels" className="text-link">
              HSK түвшнүүдтэй танилцах <i aria-hidden>↓</i>
            </a>
          </div>
        </Reveal>
      </header>

      <section className="section hsk-about">
        <Reveal>
          {hskIntro.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>
      </section>

      <section className="section" id="hsk-levels">
        <Stagger className="hsk-grid">
          {hskLevels.map((lvl) => (
            <StaggerItem key={lvl.level}>
              <article className="hsk-card">
                <header>
                  <span className="hsk-card-level">HSK {lvl.level}</span>
                  <span className="hsk-card-tag">{lvl.tag}</span>
                </header>
                <dl className="hsk-card-stats">
                  <div>
                    <dt>Үгийн сан</dt>
                    <dd>
                      {fmt(lvl.totalWords)} <small>нийт · {fmt(lvl.newWords)} шинэ</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Ханз</dt>
                    <dd>{fmt(lvl.newHanzi)}</dd>
                  </div>
                </dl>
                <h3>Юу сурах вэ?</h3>
                <p>{lvl.studySummary}</p>
                <h3>Төгсөхөд эзэмших чадвар</h3>
                <p>{lvl.outcomeSummary}</p>
                <div className="hsk-card-actions">
                  <button type="button" className="btn btn-ink" onClick={() => setOpen(lvl)}>
                    <span>Дэлгэрэнгүй</span>
                  </button>
                  <Link to={ENROLL} className="text-link">
                    Бүртгүүлэх <i aria-hidden>→</i>
                  </Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="hsk-note">{hskIntro.hanziNote}</p>
        <p className="hsk-note">{hskIntro.outcomeNote}</p>
      </section>

      <section className="section section-last hsk-schedule">
        <Reveal>
          <h2 className="h2">Цагийн хуваарь ба төлбөр</h2>
        </Reveal>
        <div className="hsk-schedule-grid">
          <Reveal>
            <article className="hsk-plan">
              <h3>{hskSchedule.intensive.title}</h3>
              <p>{hskSchedule.intensive.schedule}</p>
              <ul className="hsk-fees">
                {hskSchedule.intensive.fees.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <strong>{formatPrice(f.amount)}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
          <Reveal>
            <article className="hsk-plan">
              <h3>{hskSchedule.kids.title}</h3>
              {hskSchedule.kids.options.map((o) => (
                <p key={o}>{o}</p>
              ))}
              <ul className="hsk-fees">
                {hskSchedule.kids.fees.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <strong>{formatPrice(f.amount)}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
        <Reveal>
          <dl className="class-hours">
            <div>
              <dt>Цайны цаг</dt>
              <dd>{hskSchedule.lunch}</dd>
            </div>
            <div>
              <dt>Хаяг</dt>
              <dd className="hsk-small">{academy.address}</dd>
            </div>
            <div>
              <dt>Gmail</dt>
              <dd className="hsk-small">
                <a href={`mailto:${academy.email}`}>{academy.email}</a>
              </dd>
            </div>
          </dl>
        </Reveal>
        <Reveal>
          <div className="hsk-actions">
            <Link to={ENROLL} className="btn btn-seal">
              <span>Сургалтад бүртгүүлэх</span>
            </Link>
          </div>
        </Reveal>
      </section>

      <LevelDialog level={open} onClose={() => setOpen(null)} />
    </PageShell>
  );
}

/** The large card for one level, in a native modal dialog (Esc and backdrop close it). */
function LevelDialog({ level, onClose }: { level: HskLevel | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (level && !d.open) d.showModal();
    if (!level && d.open) d.close();
  }, [level]);

  return (
    <dialog
      ref={ref}
      className="hsk-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="hsk-dialog-title"
    >
      {level && (
        <article className="hsk-detail">
          <button type="button" className="hsk-dialog-close" onClick={onClose} aria-label="Хаах">
            ×
          </button>
          <p className="eyebrow">
            HSK {level.level} — {level.tag}
          </p>
          <p className="hsk-detail-stage">{level.stage}</p>
          <h2 id="hsk-dialog-title" className="h2">
            {level.headline}
          </h2>
          <p className="lead">{level.intro}</p>

          <dl className="hsk-detail-stats">
            <div>
              <dt>Шинэ үг</dt>
              <dd>{fmt(level.newWords)}</dd>
            </div>
            <div>
              <dt>Нийт үг</dt>
              <dd>{fmt(level.totalWords)}</dd>
            </div>
            <div>
              <dt>Шинэ ханз</dt>
              <dd>{fmt(level.newHanzi)}</dd>
            </div>
          </dl>

          <div className="hsk-detail-cols">
            <section>
              <h3>Суралцах гол агуулга</h3>
              <ul>
                {level.study.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Түвшин төгсөхөд эзэмших чадвар</h3>
              <ul>
                {level.outcomes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          </div>

          <p className="hsk-detail-who">
            <strong>Хэнд тохирох вэ?</strong> {level.forWho}
          </p>
          <p className="hsk-detail-next">
            <strong>{level.level === 6 ? "Дараагийн алхам:" : "Дараагийн түвшин:"}</strong> {level.next}
          </p>

          <div className="hsk-actions">
            <Link to={ENROLL} className="btn btn-seal" onClick={onClose}>
              <span>Сургалтад бүртгүүлэх</span>
            </Link>
          </div>
        </article>
      )}
    </dialog>
  );
}
