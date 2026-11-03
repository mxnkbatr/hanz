import { useState, type FormEvent } from "react";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";
import { academy } from "../../data/content";

export function AdminSettings() {
  const { t } = useI18n();
  const { bundle, saveBundle, academyLive } = useSiteContent();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone0 = String(fd.get("phone0") || "").trim();
    const phone1 = String(fd.get("phone1") || "").trim();
    const phoneRaw0 = phone0.replace(/\D/g, "");
    const phoneRaw1 = phone1.replace(/\D/g, "");

    setBusy(true);
    setErr("");
    setMsg("");
    const next = {
      ...bundle,
      settings: {
        ...bundle.settings,
        phone: [phone0, phone1].filter(Boolean),
        phoneRaw: [phoneRaw0, phoneRaw1].filter(Boolean),
        email: String(fd.get("email") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        hours: String(fd.get("hours") || "").trim(),
        registerUrl: String(fd.get("registerUrl") || "").trim(),
        facebook: String(fd.get("facebook") || "").trim(),
        instagram: String(fd.get("instagram") || "").trim(),
        messenger: String(fd.get("messenger") || "").trim(),
        shopUrl: String(fd.get("shopUrl") || "").trim(),
        whatsapp: String(fd.get("whatsapp") || "").trim(),
        founded: String(fd.get("founded") || "").trim(),
        yearsExp: String(fd.get("yearsExp") || "").trim(),
        graduates: String(fd.get("graduates") || "").trim(),
        scholarshipStudents: String(fd.get("scholarshipStudents") || "").trim(),
        polandUnis: String(fd.get("polandUnis") || "").trim(),
      },
    };
    const res = await saveBundle(next);
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  const a = academyLive;

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_settings")}</h1>
        <p>{t("admin_settings_lead")}</p>
      </header>

      <form className="admin-form admin-card" onSubmit={onSubmit}>
        <h3 className="admin-form-section">{t("admin_settings_contact")}</h3>
        <label>
          <span>{t("form_phone")} 1</span>
          <input name="phone0" defaultValue={a.phone[0] || academy.phone[0]} />
        </label>
        <label>
          <span>{t("form_phone")} 2</span>
          <input name="phone1" defaultValue={a.phone[1] || academy.phone[1]} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" defaultValue={a.email} />
        </label>
        <label>
          <span>{t("footer_address")}</span>
          <textarea name="address" rows={3} defaultValue={a.address} />
        </label>
        <label>
          <span>{t("hours_label")}</span>
          <input name="hours" defaultValue={a.hours || academy.hours} />
        </label>
        <label>
          <span>{t("admin_register_url")}</span>
          <input
            name="registerUrl"
            defaultValue={a.registerUrl || academy.registerUrl}
          />
        </label>

        <h3 className="admin-form-section">{t("admin_settings_social")}</h3>
        <label>
          <span>Facebook</span>
          <input name="facebook" defaultValue={a.facebook} />
        </label>
        <label>
          <span>Instagram</span>
          <input name="instagram" defaultValue={a.instagram} />
        </label>
        <label>
          <span>Messenger</span>
          <input name="messenger" defaultValue={a.messenger} />
        </label>
        <label>
          <span>WhatsApp</span>
          <input name="whatsapp" defaultValue={a.whatsapp} />
        </label>
        <label>
          <span>Shop URL</span>
          <input name="shopUrl" defaultValue={a.shopUrl} />
        </label>

        <h3 className="admin-form-section">{t("admin_settings_stats")}</h3>
        <label>
          <span>{t("stat_founded")}</span>
          <input name="founded" defaultValue={a.founded || academy.founded} />
        </label>
        <label>
          <span>{t("stat_years")}</span>
          <input name="yearsExp" defaultValue={a.yearsExp || academy.yearsExp} />
        </label>
        <label>
          <span>{t("stat_students")}</span>
          <input
            name="graduates"
            defaultValue={a.graduates || academy.graduates}
          />
        </label>
        <label>
          <span>{t("stat_scholarship")}</span>
          <input
            name="scholarshipStudents"
            defaultValue={
              a.scholarshipStudents || academy.scholarshipStudents
            }
          />
        </label>
        <label>
          <span>{t("stat_poland")}</span>
          <input name="polandUnis" defaultValue={a.polandUnis || academy.polandUnis} />
        </label>

        {err && <p className="admin-err">{err}</p>}
        {msg && <p className="admin-ok">{msg}</p>}

        <div className="admin-sticky-save">
          <button type="submit" className="admin-btn is-seal" disabled={busy}>
            {busy ? t("form_sending") : t("admin_save")}
          </button>
        </div>
      </form>
    </div>
  );
}
