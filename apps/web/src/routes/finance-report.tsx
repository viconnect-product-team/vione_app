import { createFileRoute } from "@tanstack/react-router";
import { Download, PieChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, StatCard } from "@/components/dashboard/PageKit";
import { listTransactionsFn, type Transaction } from "@/lib/finance.functions";
import { useFmt, useT } from "@/lib/i18n";

export const Route = createFileRoute("/finance-report")({
  ssr: false,
  loader: () => listTransactionsFn(),
  component: FinanceReport,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

function FinanceReport() {
  const t = useT();
  const fmt = useFmt();
  const TRANSACTIONS = Route.useLoaderData() as Transaction[];
  const income = TRANSACTIONS.filter((tx) => tx.type === "income");
  const expense = TRANSACTIONS.filter((tx) => tx.type === "expense");
  const totalIn = income.reduce((s, tx) => s + tx.amount, 0);
  const totalOut = expense.reduce((s, tx) => s + tx.amount, 0);

  const byCat = (list: typeof TRANSACTIONS) => {
    const m = new Map<string, number>();
    for (const tx of list) m.set(tx.category, (m.get(tx.category) ?? 0) + tx.amount);
    const arr = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((s, [, v]) => s + v, 0);
    return arr.map(([k, v]) => ({ k, v, pct: total > 0 ? Math.round((v / total) * 100) : 0 }));
  };

  const incomeByCat = byCat(income);
  const expenseByCat = byCat(expense);

  return (
    <AppShell>
      <PageHeader
        title={t("freport.title")}
        subtitle={t("freport.subtitle")}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted">
            <Download className="h-4 w-4 text-muted-foreground" />
            {t("common.exportPdf")}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("inc.kpi.in")}
          value={fmt.money(totalIn)}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label={t("inc.kpi.out")}
          value={fmt.money(totalOut)}
          tone="danger"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          label={t("freport.kpi.profit")}
          value={fmt.money(totalIn - totalOut)}
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label={t("freport.kpi.ratio")}
          value={`${totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0}%`}
          tone="info"
          icon={<PieChart className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("freport.incomeBreak")}</h3>
          <div className="space-y-3.5">
            {incomeByCat.map((c) => (
              <div key={c.k}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-foreground">{c.k}</span>
                  <span className="font-semibold text-muted-foreground">
                    {fmt.money(c.v)} · {c.pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.pct}%`,
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.15 155), oklch(0.78 0.14 155))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {t("freport.expenseBreak")}
          </h3>
          <div className="space-y-3.5">
            {expenseByCat.map((c) => (
              <div key={c.k}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-foreground">{c.k}</span>
                  <span className="font-semibold text-muted-foreground">
                    {fmt.money(c.v)} · {c.pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.pct}%`,
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.20 25), oklch(0.74 0.17 25))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
