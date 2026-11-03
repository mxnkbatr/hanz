import { Reveal } from "./PageShell";
import { SafeImage } from "./SafeImage";
import { useI18n } from "../i18n/I18nContext";
import {
  famousPoles,
  polandAdmission,
  polandAdvantages,
  polandCities,
  polandDidYouKnow,
  polandEduStats,
  polandFacts,
  polandHeadings as h,
  polandIntake,
  polandLifeImage,
  polandScholarships,
  polandServicesBefore,
  polandServicesImage,
  polandServicesInPoland,
  polandStudentLife,
  polandTopUniversities,
  thinkPolandUniversities,
  type Txt,
} from "../data/poland";

/** The Think Poland webinar content, section by section (data/poland.ts). */
export function PolandGuide() {
  const { lang } = useI18n();
  // Chinese has its own text; English reads the Mongolian original.
  const tx = (x: Txt) => (lang === "zh" ? x.zh : x.mn);

  return (
    <div className="pl-guide">
      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.facts)}</h2>
          <dl className="pl-facts">
            {polandFacts.map((f) => (
              <div key={f.label.mn}>
                <dt>{tx(f.label)}</dt>
                <dd>{tx(f.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="pl-note">
            <strong>{tx(h.famous)}:</strong> {famousPoles.join(" · ")}
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.didYouKnow)}</h2>
          <div className="pl-cards">
            {polandDidYouKnow.map((c) => (
              <article key={c.title.mn} className="pl-card">
                <h3>{tx(c.title)}</h3>
                <p>{tx(c.body)}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.advantages)}</h2>
          <div className="pl-photo">
            <SafeImage src={polandLifeImage} alt="" loading="lazy" />
          </div>
          <div className="pl-cards">
            {polandAdvantages.map((a) => (
              <article key={a.title.mn} className="pl-card">
                <h3>{tx(a.title)}</h3>
                <ul>
                  {a.points.map((p) => (
                    <li key={p.mn}>{tx(p)}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.edu)}</h2>
          <ul className="pl-list">
            {polandEduStats.map((s) => (
              <li key={s.mn}>{tx(s)}</li>
            ))}
          </ul>
        </section>
      </Reveal>

      <section className="pl-section">
        <Reveal>
          <h2 className="pl-h">{tx(h.top)}</h2>
        </Reveal>
        <div className="pl-unis">
          {polandTopUniversities.map((u) => (
            <Reveal key={u.name}>
              <article className="pl-uni">
                {u.image && (
                  <div className="pl-uni-media">
                    <SafeImage src={u.image} alt={u.name} loading="lazy" />
                  </div>
                )}
                <div className="pl-uni-body">
                  <h3>{u.name}</h3>
                  <p className="pl-uni-programs">
                    <span>{tx(h.programs)}:</span> {tx(u.programs)}
                  </p>
                  <p>{tx(u.summary)}</p>
                  {u.details && (
                    <ul className="pl-list">
                      {u.details.map((d) => (
                        <li key={d.mn}>{tx(d)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.list)}</h2>
          <ul className="pl-chips">
            {thinkPolandUniversities.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.scholarships)}</h2>
          <div className="pl-cards">
            {polandScholarships.map((s) => (
              <article key={s.title.mn} className="pl-card">
                <h3>{tx(s.title)}</h3>
                <p>{tx(s.body)}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.life)}</h2>
          <div className="pl-cards">
            {polandStudentLife.map((s) => (
              <article key={s.title.mn} className="pl-card">
                <h3>{tx(s.title)}</h3>
                <p>{tx(s.body)}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.cities)}</h2>
          <div className="pl-cities">
            {polandCities.main.map((c) => (
              <figure key={c.name.mn} className="pl-city">
                <SafeImage src={c.image} alt={tx(c.name)} loading="lazy" />
                <figcaption>{tx(c.name)}</figcaption>
              </figure>
            ))}
          </div>
          <p className="pl-note">
            <strong>{tx(h.moreCities)}:</strong> {polandCities.more}
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.before)}</h2>
          <ol className="pl-steps">
            {polandServicesBefore.map((s) => (
              <li key={s.mn}>{tx(s)}</li>
            ))}
          </ol>
          <h2 className="pl-h">{tx(h.inPoland)}</h2>
          <div className="pl-photo">
            <SafeImage src={polandServicesImage} alt="Think Poland" loading="lazy" />
          </div>
          <ul className="pl-chips is-services">
            {polandServicesInPoland.map((s) => (
              <li key={s.mn}>{tx(s)}</li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.intake)}</h2>
          <p className="pl-lead">{tx(polandIntake.lead)}</p>
          {[polandIntake.deadlines, polandIntake.preAcceptance].map((block) => (
            <div key={block.title.mn} className="pl-card">
              <h3>{tx(block.title)}</h3>
              <ul>
                {block.items.map((i) => (
                  <li key={i.mn}>{tx(i)}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section className="pl-section">
          <h2 className="pl-h">{tx(h.admission)}</h2>
          <ul className="pl-list">
            {polandAdmission.map((a) => (
              <li key={a.mn}>{tx(a)}</li>
            ))}
          </ul>
        </section>
      </Reveal>
    </div>
  );
}
