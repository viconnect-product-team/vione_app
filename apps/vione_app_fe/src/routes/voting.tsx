import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Gift,
  Link2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  Vote as VoteIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import {
  listVotesFn,
  createVoteFn,
  updateVoteFn,
  deleteVoteFn,
  castVoteFn,
  type Vote,
  type VoteOption,
} from "@/lib/voting.functions";
import { getVotingOpenPrefFn, setVotingOpenPrefFn } from "@/lib/settings.functions";
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
  const { user, logout } = useAuth();
  const userId = user?.id ?? null;
  const { tab: filter, page, size: PAGE_SIZE } = Route.useSearch();
  const VOTES = Route.useLoaderData() as Vote[];
  const [open, setOpen] = useState(false);
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false);
  const [editing, setEditing] = useState<Vote | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remotePref, setRemotePref] = useState<OpenMode | null>(null);
  const deleteVote = useServerFn(deleteVoteFn);
  const castVote = useServerFn(castVoteFn);
  const loadPref = useServerFn(getVotingOpenPrefFn);
  const savePref = useServerFn(setVotingOpenPrefFn);
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);

  async function handleVote(pollId: string, optionId: string) {
    setVotingOptionId(optionId);
    try {
      await castVote({ data: { pollId, optionId } });
      toast.success("Đã ghi nhận biểu quyết thành công!");
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi biểu quyết");
    } finally {
      setVotingOptionId(null);
    }
  }

  useEffect(() => {
    let active = true;
    if (userId) {
      loadPref({})
        .then((res) => {
          if (active) setRemotePref(res.pref);
        })
        .catch(() => {});
    } else {
      setRemotePref(null);
    }
    return () => {
      active = false;
    };
  }, [userId, loadPref]);

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
                    await logout();
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
              onClick={() => setLuckyDrawOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-95"
            >
              <Gift className="h-4 w-4" />
              Bốc Thăm Trúng Thưởng
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
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                      🎯 Dành cho: Người ngoài hiệp hội
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmt.date(v.startsAt)} → {fmt.date(v.endsAt)}
                  </div>
                  {/* Options breakdown with exact percentages & leading badges */}
                  {v.optionDetails && v.optionDetails.length > 0 ? (
                    <div className="mt-4 space-y-2 max-w-xl">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Danh sách lựa chọn ({v.optionDetails.length} lựa chọn)
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {v.optionDetails.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              opt.isLeading
                                ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
                                : "bg-secondary/40 border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleVote(v.id, opt.id)}
                                  disabled={votingOptionId === opt.id}
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                    v.myVote === opt.id
                                      ? "border-amber-500 bg-amber-500 text-white"
                                      : "border-muted-foreground hover:border-primary"
                                  }`}
                                  title="Bấm để bình chọn cho phương án này"
                                >
                                  {v.myVote === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </button>
                                <span className="text-xs font-semibold text-foreground">{opt.title}</span>
                                {opt.isLeading && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9.5px] font-bold">
                                    👑 Dẫn đầu
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground text-[11px]">({opt.votesCount} phiếu)</span>
                                <span className={`font-black text-xs ${opt.isLeading ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                                  {opt.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden bg-secondary">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(opt.percentage, 1)}%`,
                                  background: opt.isLeading
                                    ? "linear-gradient(90deg, #F59E0B, #D97706)"
                                    : "var(--gradient-primary)",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : v.options.length > 0 ? (
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
                  ) : null}
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
      {luckyDrawOpen && <LuckyDrawModal onClose={() => setLuckyDrawOpen(false)} />}
    </AppShell>
  );
}

function VoteModal({ vote, onClose }: { vote?: Vote; onClose: () => void }) {
  const router = useRouter();
  const createVote = useServerFn(createVoteFn);
  const updateVote = useServerFn(updateVoteFn);
  const [title, setTitle] = useState(vote?.title ?? "");
  const [type, setType] = useState<Vote["type"]>(vote?.type ?? "policy");
  const [targetAudience, setTargetAudience] = useState("non_members");
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

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Đối tượng nhận thông báo biểu quyết
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className={inputCls}
            >
              <option value="non_members">
                🎯 Chỉ người không tham gia hiệp hội (Khách mời sự kiện / Non-members)
              </option>
              <option value="all">🌐 Toàn thể cộng đồng & Hội viên</option>
              <option value="members">⭐ Chỉ hội viên chính thức hiệp hội</option>
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              * Theo quy định biểu quyết sự kiện, chỉ gửi thông báo biểu quyết cho người chưa tham gia hiệp hội để khảo sát khách quan.
            </p>
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

function LuckyDrawModal({ onClose }: { onClose: () => void }) {
  const [prize, setPrize] = useState("🌟 Giải Đặc Biệt: Xe VinFast VF3 / Apple VIP Bundle");
  const candidates = [
    { name: "Lê Hoàng Long", company: "Tập đoàn Xây dựng Hoàng Long", code: "M1983-001", seat: "Bàn VIP 01 - Ghế 01" },
    { name: "Nguyễn Văn Cường", company: "Cường Thịnh Corp", code: "M1983-002", seat: "Bàn VIP 01 - Ghế 02" },
    { name: "Vũ Thu Trang", company: "Kiến Vàng Capital", code: "M1983-003", seat: "Bàn VIP 01 - Ghế 03" },
    { name: "Phạm Quang Huy", company: "Huy Hoàng Media Group", code: "M1983-004", seat: "Bàn VIP 01 - Ghế 04" },
    { name: "Hoàng Minh Tuấn", company: "Tuấn Minh Global Trade", code: "M1983-005", seat: "Bàn VIP 02 - Ghế 01" },
    { name: "Đỗ Thị Mai", company: "EcoClean Vietnam", code: "M1983-006", seat: "Bàn VIP 02 - Ghế 02" },
    { name: "Bùi Đức Thắng", company: "Thắng Lợi XNK JSC", code: "M1983-007", seat: "Bàn 03 - Ghế 01" },
    { name: "Ngô Bảo Anh", company: "MediaPro Solution", code: "M1983-008", seat: "Bàn 04 - Ghế 01" },
    { name: "Đinh Trọng Hiếu", company: "Tài Chính Việt An", code: "M1983-009", seat: "Bàn 05 - Ghế 01" },
    { name: "Trịnh Kim Oanh", company: "An Phát Holding", code: "M1983-010", seat: "Bàn 06 - Ghế 01" },
  ];

  const [spinning, setSpinning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [winner, setWinner] = useState<(typeof candidates)[0] | null>(null);
  const [history, setHistory] = useState<Array<{ prize: string; winner: (typeof candidates)[0]; time: string }>>([]);

  const spin = () => {
    if (spinning) return;
    setWinner(null);
    setSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * candidates.length));
      counter += 1;
      if (counter > 28) {
        clearInterval(interval);
        const winIdx = Math.floor(Math.random() * candidates.length);
        setDisplayIndex(winIdx);
        const chosen = candidates[winIdx];
        setWinner(chosen);
        setSpinning(false);
        setHistory((prev) => [
          { prize, winner: chosen, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) },
          ...prev,
        ]);
        toast.success(`🎉 Chúc mừng ${chosen.name} đã trúng ${prize}!`);
      }
    }, 75);
  };

  const handleNotifyWinner = () => {
    if (!winner) return;
    toast.success(`Đã phát thông báo trúng thưởng ${prize} tới điện thoại của ${winner.name}!`);
  };

  const current = candidates[displayIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-foreground">Bốc Thăm May Mắn Sự Kiện</h3>
              <p className="text-xs text-muted-foreground">Quay số ngẫu nhiên dành cho tất cả khách tham dự</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground">Hạng mục giải thưởng</label>
            <select
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              disabled={spinning}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold text-amber-600 outline-none focus:border-primary"
            >
              <option value="🌟 Giải Đặc Biệt: Xe VinFast VF3 / Apple VIP Bundle">🌟 Giải Đặc Biệt: Xe VinFast VF3 / Apple VIP Bundle</option>
              <option value="🥇 Giải Nhất: Bộ Thẻ Thành Viên Titanium & Gói B2B 1 Năm">🥇 Giải Nhất: Bộ Thẻ Thành Viên Titanium & Gói B2B 1 Năm</option>
              <option value="🥈 Giải Nhì: Kỷ Niệm Chương Pha Lê & Quà Nhà Tài Trợ">🥈 Giải Nhì: Kỷ Niệm Chương Pha Lê & Quà Nhà Tài Trợ</option>
              <option value="🎁 Giải May Mắn: Voucher Đào Tạo Quản Trị Doanh Nghiệp">🎁 Giải May Mắn: Voucher Đào Tạo Quản Trị Doanh Nghiệp</option>
            </select>
          </div>

          {/* Wheel / Slot Box */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-background to-amber-500/5 p-6 text-center shadow-inner">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              {spinning ? "⚡ Đang quay ngẫu nhiên ứng viên..." : winner ? "🎉 NGƯỜI TRÚNG GIẢI MAY MẮN 🎉" : "Sẵn sàng quay số"}
            </div>

            <div className="my-4">
              <div className="text-2xl font-black text-foreground transition duration-150">
                {current?.name}
              </div>
              <div className="mt-1 text-sm font-semibold text-muted-foreground">
                {current?.company}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-200">
                <span>📍 {current?.seat}</span>
                <span>·</span>
                <span>{current?.code}</span>
              </div>
            </div>

            <button
              onClick={spin}
              disabled={spinning}
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {spinning ? "Đang quay số..." : "QUAY SỐ NGẪU NHIÊN"}
            </button>
          </div>

          {/* Winner Action */}
          {winner && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 animate-in fade-in zoom-in-95">
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Xác nhận người trúng giải: {winner.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{prize}</div>
              </div>
              <button
                type="button"
                onClick={handleNotifyWinner}
                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Gửi thông báo trúng
              </button>
            </div>
          )}

          {/* History of Drawn Winners */}
          {history.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-bold text-foreground">Danh sách đã trúng thưởng:</div>
              <div className="max-h-36 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-secondary/30 p-2 text-xs">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-card p-2 shadow-xs">
                    <div>
                      <strong className="text-foreground">{h.winner.name}</strong> ({h.winner.seat})
                      <div className="text-[10px] text-muted-foreground">{h.prize}</div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

