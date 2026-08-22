import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Mail, Smartphone } from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { LangSwitcher } from "@/components/LangSwitcher";
import { useT } from "@/lib/i18n";
import type { PublicAssociation } from "@/lib/associations.functions";

/** Shared public landing UI for an association, used by /h/:slug and hostname routing. */
export function AssociationLandingView({ a }: { a: PublicAssociation }) {
  const t = useT();
  const [appUrl, setAppUrl] = useState("/m");

  useEffect(() => {
    setAppUrl(`${window.location.origin}/m`);
  }, []);

  const primary = a.brandPrimary ?? "#c9a227";
  const styleVars = { ["--brand" as any]: primary } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background text-foreground" style={styleVars}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          {a.logoUrl ? (
            <img src={a.logoUrl} alt={a.name} className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
              style={{ background: primary }}
            >
              {a.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-base font-semibold">{a.name}</span>
        </div>
        <LangSwitcher />
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        {/* Hero */}
        <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground"
              style={{ background: primary }}
            >
              <Smartphone className="h-3.5 w-3.5" /> {a.name}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              {a.tagline ?? `Ứng dụng hội viên ${a.name}`}
            </h1>
            {a.about && (
              <p className="mt-4 max-w-prose whitespace-pre-line text-base text-muted-foreground">
                {a.about}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/m"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                style={{ background: primary }}
              >
                {t("land.cta.open")} <ArrowRight className="h-4 w-4" />
              </Link>
              {a.contactEmail && (
                <a
                  href={`mailto:${a.contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  <Mail className="h-4 w-4" /> {a.contactEmail}
                </a>
              )}
            </div>
          </div>

          {/* QR install card */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4" style={{ color: primary }} />
                {t("land.qr.title")}
              </div>
              <div className="flex justify-center rounded-xl bg-card p-3">
                <QrCanvas value={appUrl} size={196} dark={primary} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{t("land.qr.hint")}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {a.name}
      </footer>
    </div>
  );
}
