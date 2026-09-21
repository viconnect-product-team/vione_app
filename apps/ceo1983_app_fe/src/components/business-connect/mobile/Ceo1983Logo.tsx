// BC-Mobile — CEO 1983 official brand logo.
// Used in the Executive Home top-left header slot and auth screens.

export function Ceo1983Logo({
  className,
}: {
  className?: string;
  wordmarkOnly?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className || ""}`}>
      <img
        src="/ceo1983-official-logo.png"
        alt="CEO 1983"
        className="h-full w-auto object-contain max-h-7"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
      <span className="font-extrabold tracking-tight bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#C29B69] bg-clip-text text-transparent text-sm font-sans">
        CEO 1983
      </span>
    </div>
  );
}
