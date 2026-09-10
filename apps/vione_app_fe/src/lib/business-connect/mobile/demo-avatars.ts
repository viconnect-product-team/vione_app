// Ảnh nhân vật demo (chỉ dùng khi hồ sơ chưa có ảnh đại diện thật).
// Đảm bảo 100% không dùng đường dẫn cục bộ __l5e bị 404, luôn hiển thị hình ảnh doanh nhân chuẩn nét.

const POOL = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80",
];

export function demoAvatar(seed: string): string {
  let hash = 0;
  const str = seed || "default_vione_seed";
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return POOL[hash % POOL.length] as string;
}

/** Ảnh thật nếu có (hợp lệ và không chứa URL rác __l5e / relative path bị 404), ngược lại dùng ảnh demo tất định. */
export function avatarOrDemo(url: string | null | undefined, seed: string): string {
  if (
    url &&
    typeof url === "string" &&
    url.trim().length > 0 &&
    !url.includes("__l5e") &&
    !url.includes("undefined") &&
    !url.includes("null") &&
    !url.includes("demo-person-") &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("/landing/") ||
      url.startsWith("/assets/"))
  ) {
    return url;
  }
  return demoAvatar(seed);
}
