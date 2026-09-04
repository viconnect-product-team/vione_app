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
      <div className="flex items-center pl-10 pr-4 relative self-stretch w-full h-[42px] bg-[#0c1522] rounded-lg border border-solid border-[#D8B282]/25 transition-colors focus-within:border-[#D8B282] focus-within:ring-1 focus-within:ring-[#D8B282]/30">
        <input
          id={searchId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:!outline-none focus:!ring-0 focus:!border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!border-none focus:bg-transparent text-sm text-[#f5f7fa] placeholder:text-[#D4C3A3]/50 py-0 px-0"
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
        className="absolute top-1/2 -translate-y-1/2 left-3 w-[15px] h-[15px] text-[#d8c3b180] pointer-events-none"
        aria-hidden="true"
        strokeWidth={2}
      />
    </div>
  );
}
