// BC-Mobile — nguồn dữ liệu danh tính DUY NHẤT của người dùng đang đăng nhập.
//
// Trước đây mỗi màn (Trang chủ, V-Sheet, Tôi, Chỉnh sửa) tự gọi
// bcIdentityGetMineFn riêng lẻ nên ảnh đại diện lệch nhau sau khi cập nhật.
// Hook này gom về một khoá cache theo viewer để mọi vị trí đồng bộ tức thì.

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { bcIdentityGetMineFn } from "@/lib/business-connect/mobile/identity.functions";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";

export function myIdentityQueryKey(viewerUserId: string | null | undefined) {
  return ["bc-mobile", "identity", "mine", viewerUserId ?? "anon"] as const;
}

export function useMyIdentity(options?: { enabled?: boolean }) {
  const viewerUserId = useViewerUserId();
  const getMine = useServerFn(bcIdentityGetMineFn);
  return useQuery({
    queryKey: myIdentityQueryKey(viewerUserId),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    queryFn: async () => (await getMine()) ?? null,
  });
}

/** Làm mới danh tính ở MỌI màn sau khi người dùng lưu hồ sơ/ảnh đại diện. */
export function useInvalidateMyIdentity() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["bc-mobile", "identity", "mine"] }),
    [queryClient],
  );
}
