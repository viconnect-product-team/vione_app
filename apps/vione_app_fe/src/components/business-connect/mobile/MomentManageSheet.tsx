// BC-Mobile — Sửa / Xoá một khoảnh khắc đã lưu.
//
// Chỉ nội dung do người dùng nhập (thời điểm, tên dịp, nơi gặp, ghi chú riêng)
// được sửa. Người liên quan là bất biến ở màn này — muốn đổi người thì
// tạo khoảnh khắc mới. Ảnh có thể gỡ hoặc thêm ngay trong sheet.
// Xoá khoảnh khắc là vĩnh viễn, có bước xác nhận riêng.
//
// Sheet dùng ngữ nghĩa hộp thoại: Escape/nền bị vô hiệu khi đang xử lý.
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useT, type TKey } from "@/lib/i18n";
import {
  deleteMomentDirect,
  bcMobileMomentUpdateFn,
} from "@/lib/business-connect/mobile/moment.functions";
import { MomentPhotosEditor } from "./MomentPhotosEditor";
import { MomentRemindersSection } from "./MomentRemindersSection";
import {
  MOMENT_MAX_EVENT_NAME_LEN,
  MOMENT_MAX_NOTE_LEN,
  MOMENT_MAX_PLACE_LABEL_LEN,
  type BcMobileMomentErrorCode,
} from "@/lib/business-connect/mobile/moment.types";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 py-3 text-[15px] text-[var(--bc-mobile-text)] outline-none transition-colors placeholder:text-[var(--bc-mobile-muted)] focus:border-[var(--bc-mobile-accent)] disabled:opacity-60";
const LABEL_CLASS =
  "block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--bc-mobile-muted)]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]";

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function errorKeyFor(code: BcMobileMomentErrorCode, fallback: TKey): TKey {
  switch (code) {
    case "invalid_occurred_at":
      return "bc.mobile.moment.error.occurredAt";
    case "relationship_not_authorized":
      return "bc.mobile.moment.error.relationship";
    case "not_found":
      return "bc.mobile.moment.error.notFound";
    default:
      return fallback;
  }
}

export type MomentManageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentId: string;
  occurredAt: string;
  title: string | null;
  placeLabel: string | null;
  note: string | null;
  /** @deprecated giữ để tương thích; ảnh nay sửa trực tiếp trong sheet. */
  hasPhotos?: boolean;
  /** Gọi sau khi sửa hoặc xoá thành công để làm mới dòng thời gian. */
  onChanged: () => void;
};

export function MomentManageSheet({
  open,
  onOpenChange,
  momentId,
  occurredAt,
  title,
  placeLabel,
  note,
  onChanged,
}: MomentManageSheetProps) {
  const t = useT();
  const [occurredLocal, setOccurredLocal] = useState("");
  const [eventName, setEventName] = useState("");
  const [place, setPlace] = useState("");
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState<false | "save" | "delete">(false);
  const [confirming, setConfirming] = useState(false);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);

  // Nạp lại giá trị gốc mỗi lần mở để không bao giờ hiển thị bản nháp cũ.
  useEffect(() => {
    if (!open) return;
    const d = new Date(occurredAt);
    setOccurredLocal(toLocalInputValue(Number.isNaN(d.getTime()) ? new Date() : d));
    setEventName(title ?? "");
    setPlace(placeLabel ?? "");
    setNoteText(note ?? "");
    setConfirming(false);
    setErrorKey(null);
    setBusy(false);
  }, [open, occurredAt, title, placeLabel, note]);

  const close = () => {
    if (busy) return;
    onOpenChange(false);
  };

  const save = async () => {
    if (busy) return;
    setBusy("save");
    setErrorKey(null);
    try {
      const iso = new Date(occurredLocal).toISOString();
      const res = await bcMobileMomentUpdateFn({
        data: {
          momentId,
          occurredAt: iso,
          eventName: eventName.trim() || null,
          placeLabel: place.trim() || null,
          note: noteText.trim() || null,
        },
      });
      if (!res.ok) {
        setErrorKey(errorKeyFor(res.error, "bc.mobile.moment.error.update"));
        setBusy(false);
        return;
      }
      toast.success(t("bc.mobile.moment.edit.savedToast"));
      setBusy(false);
      onOpenChange(false);
      onChanged();
    } catch {
      setErrorKey("bc.mobile.moment.error.update");
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy("delete");
    setErrorKey(null);
    try {
      // Use direct API call to bypass requireSupabaseAuth middleware
      const res = await deleteMomentDirect(momentId);
      if (!res.ok) {
        setErrorKey(errorKeyFor(res.error, "bc.mobile.moment.error.delete"));
        setBusy(false);
        return;
      }
      toast.success(t("bc.mobile.moment.delete.deletedToast"));
      setBusy(false);
      onOpenChange(false);
      onChanged();
    } catch {
      setErrorKey("bc.mobile.moment.error.delete");
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
      dismissible={!busy}
    >
      <DrawerContent className="bc-app mx-auto w-full max-w-[480px] rounded-t-[var(--bc-mobile-radius-sheet)] border border-[#D8B282]/25 bg-[linear-gradient(165deg,rgba(10,16,25,0.98)_0%,rgba(7,12,19,0.98)_50%,rgba(4,8,14,0.99)_100%)] backdrop-blur-xl shadow-2xl">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-[17px] text-[var(--bc-mobile-text)]">
            {t("bc.mobile.moment.edit.title")}
          </DrawerTitle>
          <DrawerDescription className="text-[13px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.moment.edit.description")}
          </DrawerDescription>
        </DrawerHeader>

        <form
          className="max-h-[76dvh] space-y-4 overflow-y-auto px-4"
          style={{ paddingBottom: "max(1.25rem, var(--bc-mobile-safe-bottom))" }}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div>
            <label htmlFor="bc-moment-edit-time" className={LABEL_CLASS}>
              {t("bc.mobile.moment.field.occurredAt")}
            </label>
            <input
              id="bc-moment-edit-time"
              type="datetime-local"
              value={occurredLocal}
              max={toLocalInputValue(new Date())}
              onChange={(e) => setOccurredLocal(e.target.value)}
              disabled={busy !== false}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="bc-moment-edit-title" className={LABEL_CLASS}>
              {t("bc.mobile.moment.field.eventName")}
            </label>
            <input
              id="bc-moment-edit-title"
              type="text"
              value={eventName}
              maxLength={MOMENT_MAX_EVENT_NAME_LEN}
              placeholder={t("bc.mobile.moment.field.eventName.placeholder")}
              onChange={(e) => setEventName(e.target.value)}
              disabled={busy !== false}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="bc-moment-edit-place" className={LABEL_CLASS}>
              {t("bc.mobile.moment.field.place")}
            </label>
            <input
              id="bc-moment-edit-place"
              type="text"
              value={place}
              maxLength={MOMENT_MAX_PLACE_LABEL_LEN}
              placeholder={t("bc.mobile.moment.field.place.placeholder")}
              onChange={(e) => setPlace(e.target.value)}
              disabled={busy !== false}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="bc-moment-edit-note" className={LABEL_CLASS}>
              {t("bc.mobile.moment.field.note")}
            </label>
            <textarea
              id="bc-moment-edit-note"
              rows={3}
              value={noteText}
              maxLength={MOMENT_MAX_NOTE_LEN}
              placeholder={t("bc.mobile.moment.field.note.placeholder")}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={busy !== false}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <MomentPhotosEditor momentId={momentId} disabled={busy !== false} onChanged={onChanged} />

          <MomentRemindersSection momentId={momentId} />

          {errorKey ? (
            <p role="alert" className="text-[13px] text-[var(--bc-mobile-danger,#E5484D)]">
              {t(errorKey)}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={busy !== false}
              className={`min-h-12 flex-1 rounded-2xl border border-[var(--bc-mobile-border)] text-[15px] font-medium text-[var(--bc-mobile-text)] disabled:opacity-60 ${FOCUS}`}
            >
              {t("bc.mobile.moment.edit.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy !== false}
              className={`min-h-12 flex-1 rounded-2xl bg-[var(--bc-mobile-accent)] text-[15px] font-semibold text-[var(--bc-mobile-navy)] disabled:opacity-60 ${FOCUS}`}
            >
              {busy === "save"
                ? t("bc.mobile.moment.edit.saving")
                : t("bc.mobile.moment.edit.submit")}
            </button>
          </div>

          <div className="border-t border-[var(--bc-mobile-border)] pt-3">
            {confirming ? (
              <div role="group" aria-label={t("bc.mobile.moment.delete.title")}>
                <p className="text-[14px] font-medium text-[var(--bc-mobile-text)]">
                  {t("bc.mobile.moment.delete.title")}
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.moment.delete.description")}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={busy !== false}
                    className={`min-h-12 flex-1 rounded-2xl border border-[var(--bc-mobile-border)] text-[15px] font-medium text-[var(--bc-mobile-text)] disabled:opacity-60 ${FOCUS}`}
                  >
                    {t("bc.mobile.moment.edit.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove()}
                    disabled={busy !== false}
                    className={`min-h-12 flex-1 rounded-2xl bg-[var(--bc-mobile-danger,#E5484D)] text-[15px] font-semibold text-white disabled:opacity-60 ${FOCUS}`}
                  >
                    {busy === "delete"
                      ? t("bc.mobile.moment.delete.deleting")
                      : t("bc.mobile.moment.delete.confirm")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={busy !== false}
                className={`inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-[var(--bc-mobile-danger,#E5484D)] disabled:opacity-60 ${FOCUS}`}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {t("bc.mobile.moment.manage.delete")}
              </button>
            )}
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
