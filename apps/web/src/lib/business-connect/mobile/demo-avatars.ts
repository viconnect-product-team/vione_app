// Ảnh nhân vật demo (chỉ dùng khi hồ sơ chưa có ảnh đại diện thật).
// Thuần trình bày: chọn tất định theo id để giao diện demo ổn định.

import p1 from "@/assets/demo-person-1.jpg.asset.json";
import p2 from "@/assets/demo-person-2.jpg.asset.json";
import p3 from "@/assets/demo-person-3.jpg.asset.json";
import p4 from "@/assets/demo-person-4.jpg.asset.json";

const POOL = [p1.url, p2.url, p3.url, p4.url];

export function demoAvatar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return POOL[hash % POOL.length] as string;
}

/** Ảnh thật nếu có, ngược lại dùng ảnh demo tất định. */
export function avatarOrDemo(url: string | null | undefined, seed: string): string {
  return url && url.trim() ? url : demoAvatar(seed);
}
