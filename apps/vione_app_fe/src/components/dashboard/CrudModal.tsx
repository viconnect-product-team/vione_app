import { type ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";

export type CrudField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "date";
      required?: boolean;
      placeholder?: string;
    }
  | { name: string; label: string; type: "textarea"; required?: boolean; placeholder?: string }
  | {
      name: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      required?: boolean;
      placeholder?: string;
    };

export type CrudValues = Record<string, string | number>;

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

export function CrudModal({
  open,
  title,
  fields,
  initial,
  submitting,
  submitLabel,
  cancelLabel,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  fields: CrudField[];
  initial?: CrudValues;
  submitting?: boolean;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (values: CrudValues) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<CrudValues>({});

  useEffect(() => {
    if (open) {
      const base: CrudValues = {};
      for (const f of fields) {
        base[f.name] =
          initial?.[f.name] ??
          (f.type === "number" ? 0 : f.type === "select" ? (f.placeholder ? "" : (f.options[0]?.value ?? "")) : "");
      }
      setValues(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (name: string, v: string | number) => setValues((s) => ({ ...s, [name]: v }));

  const submit = () => {
    const out: CrudValues = {};
    for (const f of fields) {
      const raw = values[f.name];
      out[f.name] = f.type === "number" ? Number(raw) || 0 : String(raw ?? "");
    }
    onSubmit(out);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-glow)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {fields.map((f) => (
            <Labeled key={f.name} label={f.label} required={f.required}>
              {f.type === "textarea" ? (
                <textarea
                  value={String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={`${inputCls} h-24 py-2`}
                />
              ) : f.type === "select" ? (
                <select
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={`${inputCls} font-medium`}
                >
                  {f.placeholder && (
                    <option value="" disabled hidden={f.required}>
                      {f.placeholder}
                    </option>
                  )}
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  value={String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  className={inputCls}
                />
              )}
            </Labeled>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
