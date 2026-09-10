import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0F172A]/95 group-[.toaster]:text-slate-100 group-[.toaster]:border-[#D8B282]/40 group-[.toaster]:border group-[.toaster]:shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_15px_rgba(216,178,130,0.15)] group-[.toaster]:rounded-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-slate-300 text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-[#F6E1C3] group-[.toast]:to-[#D8B282] group-[.toast]:text-slate-950 font-bold group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 group-[.toast]:rounded-xl",
          success: "group-[.toast]:text-emerald-300 group-[.toast]:border-emerald-500/40",
          error: "group-[.toast]:text-rose-300 group-[.toast]:border-rose-500/40",
          info: "group-[.toast]:text-sky-300 group-[.toast]:border-sky-500/40",
          warning: "group-[.toast]:text-amber-300 group-[.toast]:border-amber-500/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

