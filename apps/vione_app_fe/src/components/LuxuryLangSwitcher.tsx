import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";

const LANGUAGES = [
  { 
    code: "vi", 
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-4.5 h-3 rounded-[1px] shadow-sm shrink-0">
        <rect width="3" height="2" fill="#da251d"/>
        <polygon points="1.5,0.4 1.62,0.85 2.08,0.85 1.71,1.13 1.85,1.58 1.5,1.3 1.15,1.58 1.29,1.13 0.92,0.85 1.38,0.85" fill="#ffff00"/>
      </svg>
    ), 
    label: "Tiếng Việt", 
    codeLabel: "VI" 
  },
  { 
    code: "en", 
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" className="w-4.5 h-3 rounded-[1px] shadow-sm stroke-none shrink-0">
        <rect width="7410" height="3900" fill="#b22234"/>
        <path d="M0,300H7410M0,900H7410M0,1500H7410M0,2100H7410M0,2700H7410M0,3300H7410" stroke="#fff" strokeWidth="300"/>
        <rect width="2964" height="2100" fill="#3c3b6e"/>
        <g fill="#fff">
          <circle cx="247" cy="175" r="50"/><circle cx="741" cy="175" r="50"/><circle cx="1235" cy="175" r="50"/><circle cx="1729" cy="175" r="50"/><circle cx="2223" cy="175" r="50"/><circle cx="2717" cy="175" r="50"/>
          <circle cx="494" cy="350" r="50"/><circle cx="988" cy="350" r="50"/><circle cx="1482" cy="350" r="50"/><circle cx="1976" cy="350" r="50"/><circle cx="2470" cy="350" r="50"/>
          <circle cx="247" cy="525" r="50"/><circle cx="741" cy="525" r="50"/><circle cx="1235" cy="525" r="50"/><circle cx="1729" cy="525" r="50"/><circle cx="2223" cy="525" r="50"/><circle cx="2717" cy="525" r="50"/>
          <circle cx="494" cy="700" r="50"/><circle cx="988" cy="700" r="50"/><circle cx="1482" cy="700" r="50"/><circle cx="1976" cy="700" r="50"/><circle cx="2470" cy="700" r="50"/>
          <circle cx="247" cy="875" r="50"/><circle cx="741" cy="875" r="50"/><circle cx="1235" cy="875" r="50"/><circle cx="1729" cy="875" r="50"/><circle cx="2223" cy="875" r="50"/><circle cx="2717" cy="875" r="50"/>
          <circle cx="494" cy="1050" r="50"/><circle cx="988" cy="1050" r="50"/><circle cx="1482" cy="1050" r="50"/><circle cx="1976" cy="1050" r="50"/><circle cx="2470" cy="1050" r="50"/>
          <circle cx="247" cy="1225" r="50"/><circle cx="741" cy="1225" r="50"/><circle cx="1235" cy="1225" r="50"/><circle cx="1729" cy="1225" r="50"/><circle cx="2223" cy="1225" r="50"/><circle cx="2717" cy="1225" r="50"/>
          <circle cx="494" cy="1400" r="50"/><circle cx="988" cy="1400" r="50"/><circle cx="1482" cy="1400" r="50"/><circle cx="1976" cy="1400" r="50"/><circle cx="2470" cy="1400" r="50"/>
          <circle cx="247" cy="1575" r="50"/><circle cx="741" cy="1575" r="50"/><circle cx="1235" cy="1575" r="50"/><circle cx="1729" cy="1575" r="50"/><circle cx="2223" cy="1575" r="50"/><circle cx="2717" cy="1575" r="50"/>
        </g>
      </svg>
    ), 
    label: "English", 
    codeLabel: "EN" 
  },
  { 
    code: "lo", 
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-4.5 h-3 rounded-[1px] shadow-sm shrink-0">
        <rect width="3" height="2" fill="#ce1126"/>
        <rect y="0.5" width="3" height="1" fill="#002868"/>
        <circle cx="1.5" cy="1" r="0.4" fill="#ffffff"/>
      </svg>
    ), 
    label: "ພາສາລາວ", 
    codeLabel: "LO" 
  },
  { 
    code: "km", 
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 16" className="w-4.5 h-3 rounded-[1px] shadow-sm shrink-0">
        <rect width="25" height="16" fill="#032ea6"/>
        <rect y="4" width="25" height="8" fill="#e21c12"/>
        <g fill="#ffffff">
          <path d="M12.5,5.5 L13.3,7 L14.5,7 L14.1,8 L15.5,8 L15,10.5 L10,10.5 L9.5,8 L10.9,8 L10.5,7 L11.7,7 Z"/>
        </g>
      </svg>
    ), 
    label: "ភាសាខ្មែរ", 
    codeLabel: "KM" 
  },
  { 
    code: "my", 
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-4.5 h-3 rounded-[1px] shadow-sm shrink-0">
        <rect width="3" height="0.67" fill="#fecb00"/>
        <rect y="0.67" width="3" height="0.67" fill="#34b233"/>
        <rect y="1.34" width="3" height="0.67" fill="#ea2839"/>
        <polygon points="1.5,0.45 1.58,0.73 1.87,0.73 1.63,0.9 1.72,1.18 1.5,1.01 1.28,1.18 1.37,0.9 1.13,0.73 1.42,0.73" fill="#ffffff"/>
      </svg>
    ), 
    label: "မြန်မာဘာသာ", 
    codeLabel: "MY" 
  },
] as const;

export function LuxuryLangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={containerRef} className={`relative inline-block text-left font-sans ${className}`}>
      {/* Luxury Trigger Wrapper */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer select-none group animate-fade-in"
      >
        {/* Glass Globe Sphere with Gold Gradient Border */}
        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#AB6D3C] to-[#FDE6B4] p-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(242,180,90,0.35)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gradient-to-b dark:from-[#3a3937] dark:to-[#161514] text-slate-800 dark:text-white">
            <Globe className="h-3.5 w-3.5 text-amber-700 dark:text-white/90" strokeWidth={1.5} />
          </div>
          {/* Translation overlay bubble */}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-[#AB6D3C] to-[#FDE6B4] p-[1px] shadow-sm text-[7px] font-extrabold text-[#f2b45a]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-[#121110] text-[6.5px] text-amber-700 dark:text-[#f2b45a]">
              A
            </div>
          </div>
        </div>

        {/* Pill Trigger with Gold Gradient Border */}
        <div className="ml-[-8px] flex h-8 items-center bg-gradient-to-r from-[#AB6D3C] to-[#FDE6B4] p-[1px] rounded-r-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(242,180,90,0.35)]">
          <div className="flex h-full items-center gap-1.5 pl-4 pr-3.5 bg-white dark:bg-[#0d0c0b] rounded-r-full text-slate-800 dark:text-[#ffe8c2] group-hover:text-amber-700 dark:group-hover:text-white transition-colors">
            <span className="flex items-center justify-center">{activeLang.flag}</span>
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-800 dark:text-[#fcd89a] group-hover:text-amber-900 dark:group-hover:text-white">
              {activeLang.codeLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-amber-600 dark:text-[#f2b45a] transition-transform duration-300 group-hover:translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-52 p-1.5 bg-white border border-amber-200/80 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 dark:bg-[#0d1527] dark:border-[#AB6D3C]/30 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="space-y-1">
            {LANGUAGES.map((l) => {
              const active = lang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-xs text-left"
                      : "text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-transparent text-left group dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-amber-200"
                  }`}
                >
                  {/* Checkmark Indicator */}
                  <div className="flex h-4 w-4 items-center justify-center shrink-0">
                    {active ? (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    ) : null}
                  </div>

                  {/* Flag Element */}
                  <span className="flex items-center justify-center shrink-0">{l.flag}</span>

                  {/* Native Language Label */}
                  <span className={`text-[12.5px] font-semibold transition-colors ${
                    active ? "text-white" : "text-slate-700 group-hover:text-amber-800 dark:text-[#d1c7b7] dark:group-hover:text-white"
                  }`}>
                    {l.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
