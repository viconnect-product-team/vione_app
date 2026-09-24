export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("data:")) return path;

  // Xử lý chống Mixed Content khi đang chạy HTTPS
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (
      path.startsWith("http://14.225.217.232") ||
      path.includes(":5001") ||
      path.includes(":5002") ||
      path.includes(":5003") ||
      path.includes(":5004") ||
      path.includes(":5005") ||
      path.includes(":4000")
    ) {
      try {
        const u = new URL(path);
        return `${window.location.origin}${u.pathname}${u.search}`;
      } catch {
        // fallback
      }
    }
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // VITE_API_URL là địa chỉ NestJS Backend
  const baseUrl =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" ||
      window.location.port === "5443" ||
      window.location.port === "5444" ||
      window.location.port === "5445")
      ? ""
      : import.meta.env.VITE_API_URL || "http://localhost:4000";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/upload/")) {
    cleanPath = `/api${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
}

/**
 * Fast client-side image downscaling and compression before upload and localStorage caching.
 * Reduces 10-20MB smartphone photos down to ~40-90KB JPEG without visible quality loss,
 * ensuring instant preview, sub-second upload, and zero localStorage QuotaExceededError.
 */
export function compressImage(
  file: File | Blob,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.82
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !file) {
      return reject(new Error("File không hợp lệ"));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Ảnh bị lỗi hoặc không đúng định dạng"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const fallbackDataUrl = (e.target?.result as string) || "";
          return resolve({ dataUrl: fallbackDataUrl, blob: file });
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              resolve({ dataUrl, blob: file });
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
