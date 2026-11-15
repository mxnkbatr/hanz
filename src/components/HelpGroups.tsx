import { useState } from "react";
import { IconPhone } from "./Icons";
import { Group, LinkRow } from "./SettingsList";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";

const FAQ = [
  ["faq1_q", "faq1_a"],
  ["faq2_q", "faq2_a"],
  ["faq3_q", "faq3_a"],
  ["faq4_q", "faq4_a"],
] as const;

/** Profile tab: live chat (Messenger), FAQ that opens in place, and contact rows. */
export function HelpGroups() {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <Group title={t("pf_help")}>
        <LinkRow
          href={academy.messenger}
          external
          tone="blue"
          icon={<span className="sl-glyph">💬</span>}
          label={t("pf_chat")}
          detail={t("pf_chat_d")}
        />
        <LinkRow href={`tel:${academy.phoneRaw[0]}`} tone="green" icon={<IconPhone />} label={academy.phone[0]} detail={t("call")} />
        <LinkRow href={`mailto:${academy.email}`} tone="gray" icon={<span className="sl-glyph">@</span>} label={academy.email} />
      </Group>

      <Group title={t("pf_faq")}>
        {FAQ.map(([q, a]) => {
          const isOpen = open === q;
          return (
            <div key={q} className={`sl-faq${isOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="sl-row sl-faq-q"
                aria-expanded={isOpen}
                onClick={() => {
                  setOpen(isOpen ? null : q);
                  void hapticLight();
                }}
              >
                <span className="sl-label">{t(q)}</span>
                <svg className="sl-chevron" viewBox="0 0 12 12" aria-hidden>
                  <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && <p className="sl-faq-a">{t(a)}</p>}
            </div>
          );
        })}
      </Group>
    </>
  );
}
