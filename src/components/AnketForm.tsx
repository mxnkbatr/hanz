import type { ReactNode } from "react";
import {
  anketOccupations,
  anketSchedules,
  anketSources,
  type Anket,
  type YesNo,
} from "../data/anket";
import { useI18n } from "../i18n/I18nContext";

type Props = { value: Anket; onChange: (next: Anket) => void };

/** Screen 1 of the student form: who you are and how to reach you. */
export function AnketPersonal({ value: a, onChange }: Props) {
  const { t } = useI18n();
  const set = (patch: Partial<Anket>) => onChange({ ...a, ...patch });

  return (
    <div className="wz-fields consult-form ak-form">
      <p className="wz-lead">{t("ak_personal_lead")}</p>
      <div className="ak-pair">
        <label>
          <span>{t("ak_surname")}</span>
          <input
            value={a.surname}
            onChange={(e) => set({ surname: e.target.value })}
            autoComplete="family-name"
            maxLength={60}
          />
        </label>
        <label>
          <span>{t("ak_name")}</span>
          <input
            value={a.name}
            onChange={(e) => set({ name: e.target.value })}
            autoComplete="given-name"
            maxLength={60}
          />
        </label>
      </div>

      <label>
        <span>
          {t("ak_regno")} <small>{t("ak_optional")}</small>
        </span>
        <input
          value={a.regNo}
          onChange={(e) => set({ regNo: e.target.value.toUpperCase() })}
          placeholder="УБ00000000"
          autoComplete="off"
          maxLength={12}
        />
      </label>

      <div className="ak-pair">
        <Choices label={t("ak_gender")}>
          {(["male", "female"] as const).map((g) => (
            <Chip key={g} name="ak-gender" on={a.gender === g} onPick={() => set({ gender: g })}>
              {t(`ak_gender_${g}`)}
            </Chip>
          ))}
        </Choices>
        <label>
          <span>{t("ak_age")}</span>
          <input
            value={a.age}
            onChange={(e) => set({ age: e.target.value.replace(/\D/g, "") })}
            inputMode="numeric"
            maxLength={3}
          />
        </label>
      </div>

      <label>
        <span>{t("ak_phone")}</span>
        <input
          value={a.phone}
          onChange={(e) => set({ phone: e.target.value })}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
        />
      </label>
      <label>
        <span>
          {t("ak_facebook")} <small>{t("ak_optional")}</small>
        </span>
        <input
          value={a.facebook}
          onChange={(e) => set({ facebook: e.target.value })}
          placeholder="facebook.com/…"
          maxLength={120}
        />
      </label>
      <label>
        <span>
          {t("ak_email")} <small>{t("ak_optional")}</small>
        </span>
        <input
          value={a.email}
          onChange={(e) => set({ email: e.target.value })}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={120}
        />
      </label>
    </div>
  );
}

/** Screen 2: the paper form's questions and the training agreement. */
export function AnketQuestions({ value: a, onChange, isCourse }: Props & { isCourse: boolean }) {
  const { t } = useI18n();
  const set = (patch: Partial<Anket>) => onChange({ ...a, ...patch });
  const setContact = (i: number, patch: Partial<Anket["emergency"][number]>) =>
    set({ emergency: a.emergency.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const toggleSource = (s: string) =>
    set({ source: a.source.includes(s) ? a.source.filter((x) => x !== s) : [...a.source, s] });

  return (
    <div className="wz-fields consult-form ak-form">
      {isCourse && (
        <Choices label={t("ak_q_schedule")} stacked>
          {anketSchedules.map((s) => (
            <Chip key={s} name="ak-schedule" on={a.schedule === s} onPick={() => set({ schedule: s })}>
              {t(`ak_sch_${s}`)}
            </Chip>
          ))}
          {a.schedule === "other" && (
            <input
              value={a.scheduleOther}
              onChange={(e) => set({ scheduleOther: e.target.value })}
              placeholder={t("ak_sch_other_ph")}
              aria-label={t("ak_sch_other_ph")}
              maxLength={60}
            />
          )}
        </Choices>
      )}

      <Choices label={t("ak_q_occupation")}>
        {anketOccupations.map((o) => (
          <Chip key={o} name="ak-occupation" on={a.occupation === o} onPick={() => set({ occupation: o })}>
            {t(`ak_occ_${o}`)}
          </Chip>
        ))}
        {a.occupation === "other" && (
          <input
            value={a.occupationOther}
            onChange={(e) => set({ occupationOther: e.target.value })}
            placeholder={t("ak_occ_other_ph")}
            aria-label={t("ak_occ_other_ph")}
            maxLength={60}
          />
        )}
      </Choices>

      <fieldset className="ak-group">
        <legend>{t("ak_q_emergency")}</legend>
        <p className="ak-hint">{t("ak_q_emergency_hint")}</p>
        {a.emergency.map((c, i) => (
          <div key={i} className="ak-pair">
            <label>
              <span>
                {t("ak_em_phone")} {i + 1}
              </span>
              <input
                value={c.phone}
                onChange={(e) => setContact(i, { phone: e.target.value })}
                type="tel"
                inputMode="tel"
                maxLength={20}
              />
            </label>
            <label>
              <span>{t("ak_em_relation")}</span>
              <input
                value={c.relation}
                onChange={(e) => setContact(i, { relation: e.target.value })}
                placeholder={t("ak_em_relation_ph")}
                maxLength={40}
              />
            </label>
          </div>
        ))}
      </fieldset>

      <label>
        <span>{t("ak_q_address")}</span>
        <textarea
          value={a.address}
          onChange={(e) => set({ address: e.target.value })}
          placeholder={t("ak_address_ph")}
          autoComplete="street-address"
          rows={2}
          maxLength={300}
        />
      </label>

      <Choices label={`${t("ak_q_source")} · ${t("ak_optional")}`}>
        {anketSources.map((s) => (
          <label key={s} className={`enroll-chip${a.source.includes(s) ? " is-on" : ""}`}>
            <input type="checkbox" checked={a.source.includes(s)} onChange={() => toggleSource(s)} />
            <span>{t(`ak_src_${s}`)}</span>
          </label>
        ))}
        {a.source.includes("other") && (
          <input
            value={a.sourceOther}
            onChange={(e) => set({ sourceOther: e.target.value })}
            placeholder={t("ak_src_other_ph")}
            aria-label={t("ak_src_other_ph")}
            maxLength={80}
          />
        )}
      </Choices>

      <YesNoRow
        label={t("ak_q_scholarship")}
        name="ak-scholarship"
        value={a.scholarship}
        onPick={(v) => set({ scholarship: v })}
      />
      <YesNoRow
        label={t("ak_q_langprep")}
        name="ak-langprep"
        value={a.langPrep}
        onPick={(v) => set({ langPrep: v })}
      />

      {isCourse && (
        <details className="ak-terms">
          <summary>{t("ak_terms_title")}</summary>
          <ol>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <li key={n}>{t(`ak_t${n}`)}</li>
            ))}
          </ol>
        </details>
      )}

      <label className={`ak-agree${a.agreed ? " is-on" : ""}`}>
        <input type="checkbox" checked={a.agreed} onChange={(e) => set({ agreed: e.target.checked })} />
        <span>{isCourse ? t("ak_agree") : t("ak_agree_uni")}</span>
      </label>
    </div>
  );
}

function Choices({ label, stacked, children }: { label: string; stacked?: boolean; children: ReactNode }) {
  return (
    <fieldset className={`enroll-choices${stacked ? " is-stacked" : ""}`}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
}

function Chip({
  name,
  on,
  onPick,
  children,
}: {
  name: string;
  on: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <label className={`enroll-chip${on ? " is-on" : ""}`}>
      <input type="radio" name={name} checked={on} onChange={onPick} />
      <span>{children}</span>
    </label>
  );
}

function YesNoRow({
  label,
  name,
  value,
  onPick,
}: {
  label: string;
  name: string;
  value: YesNo;
  onPick: (v: YesNo) => void;
}) {
  const { t } = useI18n();
  return (
    <Choices label={label}>
      {(["yes", "no"] as const).map((v) => (
        <Chip key={v} name={name} on={value === v} onPick={() => onPick(v)}>
          {t(`ak_${v}`)}
        </Chip>
      ))}
    </Choices>
  );
}
