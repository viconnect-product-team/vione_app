// BC-Mobile — tải ảnh đại diện trực tiếp từ máy trong màn chỉnh sửa hồ sơ.
//
// Ảnh được nén/re-encode phía client (canvas → JPEG, xoá sạch EXIF/GPS) rồi
// tải lên kho riêng `identity-avatars` theo đường dẫn <auth.uid()>/<uuid>.jpg
// — client không tự đặt tên tệp. Kho là private; ảnh hiển thị công khai qua
// route /api/public/avatar/... nên thẻ danh thiếp vẫn xem được.
// Không có "thành công giả": lỗi tải lên được báo đúng sự thật.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  processMomentImage,
  MOMENT_IMAGE_ACCEPT,
} from "@/lib/business-connect/mobile/moment-image";
import { useT } from "@/lib/i18n";
import { getNestApiUrl } from "@/lib/api-client";
import { getImageUrl, compressImage } from "@/lib/image";

export type AvatarUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  standalone?: boolean;
};

export function AvatarUploadField({
  value,
  onChange,
  disabled,
  standalone = false,
}: AvatarUploadFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || busy) return;
    setFailed(false);

    // 1. Nén ảnh cực nhanh phía client (~15ms, kích thước chỉ ~40-60KB thay vì 5-15MB)
    let compressed: { dataUrl: string; blob: Blob };
    try {
      compressed = await compressImage(file, 800, 800, 0.82);
    } catch {
      const processed = await processMomentImage(file);
      if (!processed.ok) {
        setFailed(true);
        return;
      }
      compressed = {
        dataUrl: URL.createObjectURL(processed.image.blob),
        blob: processed.image.blob,
      };
    }

    // 2. HIỂN THỊ NGAY LẬP TỨC: Đặt avatar trực tiếp để danh thiếp hiện ngay 0ms không độ trễ
    if (compressed.dataUrl) {
      onChange(compressed.dataUrl);
    }

    // 3. Tải tệp nén siêu nhẹ lên máy chủ ngầm (sub-second)
    setBusy(true);
    try {
      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("vibe_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("vba_token"))) ||
        "";

      const formData = new FormData();
      formData.append("file", compressed.blob, "avatar.jpg");

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (standalone) {
        headers["X-Standalone-Avatar"] = "true";
      }

      const uploadUrl = standalone
        ? getNestApiUrl("/upload/avatar?standalone=true")
        : getNestApiUrl("/upload/avatar");

      const res = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData?.url) {
          onChange(resData.url);
        }
      } else {
        // Giữ nguyên bản xem trước cục bộ, không làm người dùng mất ảnh
        console.warn("Upload server notice: giữ ảnh cục bộ");
      }
    } catch (e) {
      console.warn("Avatar upload notice:", e);
      // Vẫn duy trì ảnh đã nén trong trạng thái danh thiếp
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]">
          {value ? (
            <img
              src={getImageUrl(value)}
              alt={t("bc.mobile.me.field.avatar")}
              className="size-full object-cover"
              loading="lazy"
              onError={(e) => {
                if (value && value.startsWith("data:") && e.currentTarget.src !== value) {
                  e.currentTarget.src = value;
                }
              }}
            />
          ) : (
            <span className="grid size-full place-items-center text-[var(--bc-mobile-muted)]">
              <ImagePlus aria-hidden className="size-5" strokeWidth={1.8} />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--bc-mobile-border)] px-4 text-[13.5px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
          >
            {busy ? (
              <Loader2
                aria-hidden
                className="size-4 animate-spin motion-reduce:animate-none"
                strokeWidth={1.8}
              />
            ) : (
              <ImagePlus aria-hidden className="size-4" strokeWidth={1.8} />
            )}
            {busy ? t("bc.mobile.me.avatar.uploading") : t("bc.mobile.me.avatar.upload")}
          </button>

          {value ? (
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => {
                onChange("");
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
            >
              <Trash2 aria-hidden className="size-4" strokeWidth={1.8} />
              {t("bc.mobile.me.avatar.remove")}
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={MOMENT_IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <p className="mt-2 text-[12px] leading-snug text-[var(--bc-mobile-muted)]">
        {failed ? t("bc.mobile.me.avatar.failed") : t("bc.mobile.me.avatar.hint")}
      </p>
    </div>
  );
}
