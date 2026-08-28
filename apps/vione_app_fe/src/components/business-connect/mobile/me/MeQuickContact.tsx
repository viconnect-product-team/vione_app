// @CODE-MEMORY
// UseCase: UC-BC-01
// TechSpecRef: UIUX_SPEC §3
// Author: Senior BA/SA Team
// Updated: 2026-08-28

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { buildQuickContactChannels } from "@/lib/business-connect/mobile/quick-contact";
import type { BusinessIdentity } from "@/lib/business-connect/mobile/identity.types";

import icon26 from "./icon-26.svg";
import icon27 from "./icon-27.svg";
import icon28 from "./icon-28.svg";
import icon29 from "./icon-29.svg";
import icon31 from "./icon-31.svg";

interface ContactSpec {
  key: string;
  label: string;
  icon: string;
  iconClassName: string;
  iconContainerClassName: string;
  gridClassName: string;
}

const contactMethodsSpec: ContactSpec[] = [
  {
    key: "call",
    label: "Gọi điện",
    icon: icon26,
    iconClassName: "relative w-[13.5px] h-[13.5px]",
    iconContainerClassName:
      "flex w-8 h-8 shrink-0 items-center justify-center relative bg-[#ffb9710d] rounded-lg",
    gridClassName: "row-[1_/_2] col-[1_/_2]",
  },
  {
    key: "email",
    label: "Email",
    icon: icon27,
    iconClassName: "relative w-[15px] h-3",
    iconContainerClassName:
      "flex w-8 h-8 shrink-0 items-center justify-center relative bg-[#ffb9710d] rounded-lg",
    gridClassName: "row-[1_/_2] col-[2_/_3]",
  },
  {
    key: "viber",
    label: "Viber",
    icon: icon28,
    iconClassName: "relative w-[15px] h-[15px]",
    iconContainerClassName:
      "flex w-8 h-8 shrink-0 items-center justify-center relative bg-[#ffb9710d] rounded-lg",
    gridClassName: "row-[2_/_3] col-[1_/_2]",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: icon29,
    iconClassName: "relative w-[15px] h-[15px]",
    iconContainerClassName:
      "flex w-[27.63px] h-8 shrink-0 items-center justify-center relative bg-[#ffb9710d] rounded-lg",
    gridClassName: "row-[2_/_3] col-[2_/_3]",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: icon31,
    iconClassName: "relative w-[14.25px] h-3",
    iconContainerClassName:
      "flex w-8 h-8 shrink-0 items-center justify-center relative bg-[#ffb9710d] rounded-lg",
    gridClassName: "row-[3_/_4] col-[1_/_3]",
  },
];

export function MeQuickContact({ identity }: { identity: BusinessIdentity | null }) {
  const t = useT();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  if (!identity) return null;

  const channels = buildQuickContactChannels(identity);

  return (
    <section
      className="gap-4 flex flex-col items-start p-6 relative self-stretch w-full flex-[0_0_auto] bg-[#1e1c1899] rounded-2xl border border-solid border-[#ea9a4126] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]"
      aria-labelledby="quick-contact-heading"
    >
      <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
        <h2
          id="quick-contact-heading"
          className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#d8c3b1] text-sm tracking-[0] leading-5"
        >
          {t("bc.mobile.me.contact.title")}
        </h2>
      </div>
      <div className="grid grid-cols-2 grid-rows-[58px_58px_58px] h-fit gap-3 w-full">
        {contactMethodsSpec.map((method) => {
          const activeChannel = channels.find((c) => c.key === method.key);
          const isPressed = selectedContact === method.key;

          if (activeChannel) {
            return (
              <a
                key={method.key}
                href={activeChannel.href}
                {...(activeChannel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={method.label}
                aria-pressed={isPressed}
                onClick={() => setSelectedContact(method.key)}
                className={`${method.gridClassName} w-full h-[58px] flex gap-3 p-3 bg-[#1e1c1880] rounded-xl border border-solid border-[#ea9a4126] items-center relative text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb971] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1c18] hover:bg-[#1e1c18c0]`}
              >
                <span className={method.iconContainerClassName} aria-hidden="true">
                  <span className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <img
                      className={method.iconClassName}
                      alt=""
                      src={method.icon}
                    />
                  </span>
                </span>
                <span className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <span className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#f2efe9] text-base tracking-[0] leading-6 whitespace-nowrap">
                    {method.label}
                  </span>
                </span>
              </a>
            );
          } else {
            return (
              <button
                key={method.key}
                type="button"
                disabled
                aria-label={`${method.label} (chưa thiết lập)`}
                className={`${method.gridClassName} w-full h-[58px] flex gap-3 p-3 bg-[#1e1c1830] rounded-xl border border-solid border-[#ea9a410c] items-center relative text-left opacity-35 cursor-not-allowed`}
              >
                <span className={method.iconContainerClassName} aria-hidden="true">
                  <span className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <img
                      className={method.iconClassName}
                      alt=""
                      src={method.icon}
                      style={{ filter: "grayscale(100%) brightness(70%)" }}
                    />
                  </span>
                </span>
                <span className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <span className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#d8c3b1] text-base tracking-[0] leading-6 whitespace-nowrap">
                    {method.label}
                  </span>
                </span>
              </button>
            );
          }
        })}
      </div>
    </section>
  );
}
