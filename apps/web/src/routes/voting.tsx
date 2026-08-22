import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Link2, Pencil, Plus, Trash2, Vote as VoteIcon, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import {
  listVotesFn,
  createVoteFn,
  updateVoteFn,
  deleteVoteFn,
  type Vote,
} from "@/lib/voting.functions";
import { getVotingOpenPrefFn, setVotingOpenPrefFn } from "@/lib/settings.functions";
import { supabase } from "@/integrations/supabase/client";
import { useFmt, useT, type TKey } from "@/lib/i18n";

import {
  VOTE_FILTERS as FILTERS,
  VOTE_PAGE_SIZES as PAGE_SIZES,
  type VoteFilter,
} from "@/lib/voting-search";

type VotingSearch = { tab: VoteFilter; page: number; size: number };

export const Route = createFileRoute("/voting")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): VotingSearch => {
    const tab = FILTERS.includes(search.tab as VoteFilter) ? (search.tab as VoteFilter) : "all";
    const page = Math.max(1, Number(search.page) || 1);
    const size = PAGE_SIZES.includes(Number(search.size)) ? Number(search.size) : 10;
    return { tab, page, size };
  },
  loader: () => listVotesFn(),
  component: VotingPage,
});

const STATUS_KEY: Record<Vote["status"], TKey> = {
  open: "vote.status.open",
  scheduled: "vote.status.scheduled",
  closed: "vote.status.closed",
};
const STATUS_COLOR: Record<Vote["status"], "success" | "info" | "neutral"> = {
  open: "success",
  scheduled: "info",
  closed: "neutral",
};

function deriveStatus(startsAt: string, endsAt: string): Vote["status"] {
  const today = new Date().toISOString().slice(0, 10);
  if (startsAt > today) return "scheduled";
  if (endsAt < today) return "closed";
  return "open";
}
const TYPE_KEY: Record<Vote["type"], TKey> = {
  policy: "vote.type.policy",
  election: "vote.type.election",
  amendment: "vote.type.amendment",
};

type OpenMode = "same" | "new";
const OPEN_PREF_KEY = "voting:openPref";

function getOpenPref(): OpenMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(OPEN_PREF_KEY);
  return v === "same" || v === "new" ? v : null;
}

function setOpenPref(mode: OpenMode) {
  window.localStorage.setItem(OPEN_PREF_KEY, mode);
}

function CopyToast({
  shortUrl,
  onChoose,
  canRemember = true,
  rememberHint = "Ghi nhớ lựa chọn của tôi",
}: {
  shortUrl: string;
  onChoose: (mode: OpenMode, remember: boolean) => void;
  canRemember?: boolean;
  rememberHint?: string;
}) {
  const [remember, setRemember] = useState(false);
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 shadow-lg">
      <div className="text-sm font-semibold text-foreground">Đã sao chép liên kết!</div>
      <div className="mt-0.5 break-all text-xs text-muted-foreground">{shortUrl}</div>
      {canRemember && (
        <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border"
          />
          {rememberHint}
        </label>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onChoose("new", remember)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          Mở ở tab mới
        </button>
        <button
          onClick={() => onChoose("same", remember)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Mở ở tab này
        </button>
      </div>
    </div>
  );
}

function VotingPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { tab: filter, page, size: PAGE_SIZE } = Route.useSearch();
  const VOTES = Route.useLoaderData() as Vote[];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vote | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [remotePref, setRemotePref] = useState<OpenMode | null>(null);
  const deleteVote = useServerFn(deleteVoteFn);
  const loadPref = useServerFn(getVotingOpenPrefFn);
  const savePref = useServerFn(setVotingOpenPrefFn);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        try {
          const res = await loadPref({});
          if (active) setRemotePref(res.pref);
        } catch {
          /* ignore */
        }
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      if (!session?.user) setRemotePref(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadPref]);

  const filtered = VOTES.filter(
    (v) => filter === "all" || deriveStatus(v.startsAt, v.endsAt) === filter,
  );
  const countFor = (key: "all" | Vote["status"]) =>
    key === "all"
      ? VOTES.length
      : VOTES.filter((v) => deriveStatus(v.startsAt, v.endsAt) === key).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const TABS: { key: "all" | Vote["status"]; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "scheduled", label: t("vote.status.scheduled") },
    { key: "open", label: t("vote.status.open") },
    { key: "closed", label: t("vote.status.closed") },
  ];

  function selectFilter(key: "all" | Vote["status"]) {
    navigate({ search: (prev: VotingSearch) => ({ ...prev, tab: key, page: 1 }) });
  }

  function setPage(updater: (p: number) => number) {
    navigate({
      search: (prev: VotingSearch) => ({ ...prev, page: Math.max(1, updater(prev.page)) }),
    });
  }

  function setSize(size: number) {
    navigate({ search: (prev: VotingSearch) => ({ ...prev, size, page: 1 }) });
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa bình chọn này?")) return;
    setDeleting(id);
    try {
      await deleteVote({ data: { id } });
      await router.invalidate();
    } finally {
      setDeleting(null);
    }
  }

  function openUrl(url: string, mode: OpenMode) {
    if (mode === "new") window.open(url, "_blank");
    else window.location.assign(url);
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      const shortUrl = url.length > 60 ? `${url.slice(0, 57)}...` : url;
      const pref = userId ? remotePref : getOpenPref();
      if (pref) {
        openUrl(url, pref);
        toast.success("Đã sao chép liên kết!", { description: shortUrl });
        return;
      }
      toast.custom((id) => (
        <CopyToast
          shortUrl={shortUrl}
          canRemember
          rememberHint={
            userId
              ? "Lưu vào tài khoản (đồng bộ mọi thiết bị)"
              : "Ghi nhớ lựa chọn của tôi (chỉ thiết bị này)"
          }
          onChoose={async (mode, remember) => {
            if (remember) {
              if (userId) {
                try {
                  await savePref({ data: { pref: mode } });
                  setRemotePref(mode);
                } catch {
                  toast.error("Không thể lưu tuỳ chọn");
                }
              } else {
                setOpenPref(mode);
              }
            }
            openUrl(url, mode);
            toast.dismiss(id);
          }}
        />
      ));
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={t("vote.title")}
        subtitle={t("vote.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            {userId ? (
              <>
                <button
                  onClick={() => navigate({ to: "/account-settings" })}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cài đặt
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success("Đã đăng xuất");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Đăng nhập
              </button>
            )}
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <Link2 className="h-4 w-4" />
              {copied ? "Đã sao chép!" : "Sao chép liên kết"}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              {t("vote.create")}
            </button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("vote.kpi.total")}
          value={VOTES.length}
          icon={<VoteIcon className="h-4 w-4" />}
        />
        <StatCard
          label={t("vote.kpi.open")}
          value={VOTES.filter((v) => deriveStatus(v.startsAt, v.endsAt) === "open").length}
          tone="success"
          icon={<VoteIcon className="h-4 w-4" />}
        />
        <StatCard
          label={t("vote.kpi.closed")}
          value={VOTES.filter((v) => deriveStatus(v.startsAt, v.endsAt) === "closed").length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                filter === tab.key ? "bg-primary-foreground/20" : "bg-background"
              }`}
            >
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Không có bình chọn nào.
          </Card>
        )}
        {paged.map((v) => {
          const pct = v.eligible > 0 ? Math.round((v.voted / v.eligible) * 100) : 0;
          const status = deriveStatus(v.startsAt, v.endsAt);
          return (
            <Card key={v.id} className="p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Pill color={STATUS_COLOR[status]}>{t(STATUS_KEY[status])}</Pill>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(TYPE_KEY[v.type])}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmt.date(v.startsAt)} → {fmt.date(v.endsAt)}
                  </div>
                  {v.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {v.options.map((o, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{pct}%</div>
                    <div className="text-[11px] text-muted-foreground">
                      {v.voted}/{v.eligible} {t("vote.voted")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setEditing(v)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary"
                      aria-label="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting === v.id}
                      className="rounded-lg border border-border p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Hiển thị
          <select
            value={PAGE_SIZE}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}/trang
              </option>
            ))}
          </select>
        </label>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-sm text-muted-foreground">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {open && <VoteModal onClose={() => setOpen(false)} />}
      {editing && <VoteModal vote={editing} onClose={() => setEditing(null)} />}
    </AppShell>
  );
}

function VoteModal({ vote, onClose }: { vote?: Vote; onClose: () => void }) {
  const router = useRouter();
  const createVote = useServerFn(createVoteFn);
  const updateVote = useServerFn(updateVoteFn);
  const [title, setTitle] = useState(vote?.title ?? "");
  const [type, setType] = useState<Vote["type"]>(vote?.type ?? "policy");
  const [startsAt, setStartsAt] = useState(vote?.startsAt ?? "");
  const [endsAt, setEndsAt] = useState(vote?.endsAt ?? "");
  const [options, setOptions] = useState<string[]>(
    vote && vote.options.length >= 2 ? vote.options : ["", ""],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setOpt(i: number, val: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  }

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      if (vote) {
        await updateVote({ data: { id: vote.id, title, type, startsAt, endsAt, options } });
      } else {
        await createVote({ data: { title, type, startsAt, endsAt, options } });
      }
      await router.invalidate();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {vote ? "Sửa bình chọn" : "Tạo bình chọn"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Câu hỏi</label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Nội dung bình chọn..."
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Vote["type"])}
              className={inputCls}
            >
              <option value="policy">Chính sách</option>
              <option value="election">Bầu cử</option>
              <option value="amendment">Sửa đổi điều lệ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Bắt đầu</label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Kết thúc</label>
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Lựa chọn</label>
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={o}
                    onChange={(e) => setOpt(i, e.target.value)}
                    placeholder={`Lựa chọn ${i + 1}`}
                    className={inputCls}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setOptions((prev) => [...prev, ""])}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              <Plus className="h-4 w-4" /> Thêm lựa chọn
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Hủy
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {saving ? "Đang lưu..." : "Lưu bình chọn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
