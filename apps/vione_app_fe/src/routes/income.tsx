import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import {
  createTransactionFn,
  deleteTransactionFn,
  listTransactionsFn,
  updateTransactionFn,
  type Transaction,
} from "@/lib/finance.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import { downloadCsv } from "@/lib/csv";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";

export const Route = createFileRoute("/income")({
  ssr: false,
  loader: () => listTransactionsFn(),
  component: IncomePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

const METHOD_KEY: Record<Transaction["method"], TKey> = {
  bank: "inc.method.bank",
  card: "inc.method.card",
  cash: "inc.method.cash",
};

function IncomePage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const TRANSACTIONS = Route.useLoaderData() as Transaction[];
  const [q, setQ] = useState("");
  const [type, setType] = useState<Transaction["type"] | "all">("all");

  const createFn = useServerFn(createTransactionFn);
  const updateFn = useServerFn(updateTransactionFn);
  const deleteFn = useServerFn(deleteTransactionFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fields: CrudField[] = [
    {
      name: "date",
      label: t("inc.col.date"),
      type: "text",
      required: true,
      placeholder: "2026-01-31",
    },
    {
      name: "type",
      label: t("inc.col.type"),
      type: "select",
      options: [
        { value: "income", label: t("inc.income") },
        { value: "expense", label: t("inc.expense") },
      ],
    },
    { name: "category", label: t("inc.col.cat"), type: "text", required: true },
    { name: "description", label: t("inc.col.desc"), type: "textarea" },
    { name: "amount", label: t("inc.col.amount"), type: "number" },
    {
      name: "method",
      label: t("inc.col.method"),
      type: "select",
      options: [
        { value: "bank", label: t("inc.method.bank") },
        { value: "card", label: t("inc.method.card") },
        { value: "cash", label: t("inc.method.cash") },
      ],
    },
    {
      name: "status",
      label: t("inc.col.status"),
      type: "select",
      options: [
        { value: "completed", label: t("inc.status.completed") },
        { value: "pending", label: t("inc.status.pending") },
      ],
    },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...(v as object) } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: v as never });
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (tx: Transaction) => {
    if (!window.confirm(t("common.confirmDelete", { name: tx.description || tx.id }))) return;
    setDeletingId(tx.id);
    try {
      await deleteFn({ data: { id: tx.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return TRANSACTIONS.filter((tx) => (type === "all" ? true : tx.type === type)).filter(
      (tx) =>
        !ql || tx.description.toLowerCase().includes(ql) || tx.category.toLowerCase().includes(ql),
    );
  }, [q, type, TRANSACTIONS]);

  const tc = useTableControls<Transaction>(
    filtered,
    {
      id: (tx) => tx.id,
      date: (tx) => tx.date,
      type: (tx) => tx.type,
      cat: (tx) => tx.category,
      amount: (tx) => tx.amount,
      status: (tx) => tx.status,
    },
    { initialSortKey: "date", initialSortDir: "desc", initialPageSize: 20 },
  );

  const income = TRANSACTIONS.filter((tx) => tx.type === "income").reduce(
    (s, tx) => s + tx.amount,
    0,
  );
  const expense = TRANSACTIONS.filter((tx) => tx.type === "expense").reduce(
    (s, tx) => s + tx.amount,
    0,
  );

  const handleExport = () => {
    downloadCsv("transactions", tc.sorted, [
      { header: "Date", value: (tx) => tx.date },
      { header: "Type", value: (tx) => tx.type },
      { header: "Category", value: (tx) => tx.category },
      { header: "Description", value: (tx) => tx.description },
      { header: "Amount", value: (tx) => tx.amount },
      { header: "Method", value: (tx) => tx.method },
      { header: "Status", value: (tx) => tx.status },
    ]);
  };

  return (
    <AppShell>
      <PageHeader
        title={t("inc.title")}
        subtitle={t("inc.subtitle")}
        actions={
          <>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              {t("common.exportExcel")}
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              {t("inc.create")}
            </button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("inc.kpi.in")}
          value={fmt.money(income)}
          tone="success"
          icon={<ArrowUpCircle className="h-4 w-4" />}
        />
        <StatCard
          label={t("inc.kpi.out")}
          value={fmt.money(expense)}
          tone="danger"
          icon={<ArrowDownCircle className="h-4 w-4" />}
        />
        <StatCard
          label={t("inc.kpi.balance")}
          value={fmt.money(income - expense)}
          tone="primary"
          hint={t("inc.kpi.balanceHint")}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("inc.searchPh")}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Transaction["type"] | "all")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">{t("common.all")}</option>
          <option value="income">{t("inc.income")}</option>
          <option value="expense">{t("inc.expense")}</option>
        </select>
      </div>

      <TableShell
        columns={[
          { label: t("inc.col.code"), key: "id" },
          { label: t("inc.col.date"), key: "date" },
          { label: t("inc.col.type"), key: "type" },
          { label: t("inc.col.cat"), key: "cat" },
          t("inc.col.desc"),
          { label: t("inc.col.amount"), key: "amount" },
          t("inc.col.method"),
          { label: t("inc.col.status"), key: "status" },
          t("common.actions"),
        ]}
        sort={{ sortKey: tc.sortKey, sortDir: tc.sortDir, onSort: tc.toggleSort }}
        footer={
          <Pagination
            page={tc.page}
            pageCount={tc.pageCount}
            pageSize={tc.pageSize}
            total={tc.total}
            from={tc.from}
            to={tc.to}
            onPage={tc.setPage}
            onPageSize={tc.setPageSize}
          />
        }
      >
        {tc.pageRows.map((tx) => (
          <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
            <td className="px-4 py-3 font-mono text-[12px] font-semibold text-primary">{tx.id}</td>
            <td className="px-4 py-3 text-muted-foreground">{fmt.date(tx.date)}</td>
            <td className="px-4 py-3">
              <Pill color={tx.type === "income" ? "success" : "danger"}>
                {tx.type === "income" ? t("inc.income") : t("inc.expense")}
              </Pill>
            </td>
            <td className="px-4 py-3 text-foreground">{tx.category}</td>
            <td className="px-4 py-3 text-foreground">{tx.description}</td>
            <td
              className="px-4 py-3 font-semibold"
              style={{
                color: tx.type === "income" ? "oklch(0.50 0.16 155)" : "oklch(0.50 0.20 25)",
              }}
            >
              {tx.type === "income" ? "+" : "-"}
              {fmt.money(tx.amount)}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{t(METHOD_KEY[tx.method])}</td>
            <td className="px-4 py-3">
              <Pill color={tx.status === "completed" ? "success" : "warning"}>
                {tx.status === "completed" ? t("inc.status.completed") : t("inc.status.pending")}
              </Pill>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditing(tx);
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  disabled={deletingId === tx.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("inc.create")}
        fields={fields}
        initial={editing ? (editing as unknown as CrudValues) : undefined}
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </AppShell>
  );
}
