import { Search } from "lucide-react";
import { useId } from "react";

interface MobileSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
}: MobileSearchBarProps) {
  const searchId = useId();

  return (
    <div className="flex flex-col items-start relative flex-1 w-full">
      <label htmlFor={searchId} className="sr-only">
        {placeholder}
      </label>
      <div className="flex items-center pl-10 pr-4 relative self-stretch w-full h-[40px] bg-[var(--bc-mobile-surface-2,#F1F5F9)] dark:bg-[var(--bc-mobile-surface-2,#0a0f1a)] rounded-full border border-[var(--bc-mobile-border,#e2e8f0)] transition-colors">
        <input
          id={searchId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:!outline-none focus:!ring-0 focus:!border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!border-none text-[13px] text-[var(--bc-mobile-text,#0F172A)] dark:text-[var(--bc-mobile-text,#f5f7fa)] placeholder:text-[var(--bc-mobile-muted,#64748B)] py-0 px-0"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <Search
        className="absolute top-1/2 -translate-y-1/2 left-3.5 w-4 h-4 text-[var(--bc-mobile-muted,#64748B)] pointer-events-none"
        aria-hidden="true"
        strokeWidth={1.8}
      />
    </div>
  );
}

