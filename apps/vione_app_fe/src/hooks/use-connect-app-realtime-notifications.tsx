import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConnectAppSocket } from "./use-connect-app-socket";
import { useViewerUserId } from "./use-viewer-user-id";
import { notificationKeys } from "./use-bc-notifications";
import { bcMobileHomeKeys } from "./use-business-connect-home";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";

export function useConnectAppRealtimeNotifications() {
  const qc = useQueryClient();
  const viewerUserId = useViewerUserId();
  const socket = useConnectAppSocket();

  useEffect(() => {
    if (!socket || !viewerUserId) return;

    let lastShownKey = "";
    let lastShownTime = 0;

    const playNotificationSound = () => {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate([100, 60, 150]);
        }
      } catch {
        /* ignore */
      }
    };

    const invalidateEverything = () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.root });
      void qc.invalidateQueries({ queryKey: bcMobileHomeKeys.root });
      void qc.invalidateQueries({ queryKey: ["bc-home"] });
      void qc.invalidateQueries({ queryKey: ["user-connections"] });
      void qc.invalidateQueries({ queryKey: ["network-requests"] });
      void qc.invalidateQueries({ queryKey: ["network-incoming-requests"] });
      void qc.invalidateQueries({ queryKey: ["network-status-counts"] });
      void qc.invalidateQueries({ queryKey: ["crm-events-home"] });
      void qc.invalidateQueries({ queryKey: ["my-notifications"] });
      void qc.invalidateQueries({ queryKey: ["member-notifications"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["member-app"] });
    };

    const shouldShowToast = (dedupeId: string): boolean => {
      const now = Date.now();
      if (dedupeId && dedupeId === lastShownKey && now - lastShownTime < 3000) {
        return false;
      }
      lastShownKey = dedupeId;
      lastShownTime = now;
      return true;
    };

    // Show Luxury Interactive Toast for Connection Requests
    const showConnectionRequestToast = ({
      title,
      senderName,
      senderCompany,
      senderTitle,
      senderAvatar,
      senderUserId,
      connectionId,
    }: {
      title: string;
      senderName: string;
      senderCompany?: string;
      senderTitle?: string;
      senderAvatar?: string;
      senderUserId?: string;
      connectionId?: string;
    }) => {
      playNotificationSound();

      toast.custom(
        (toastId) => (
          <div className="w-full max-w-sm rounded-2xl border border-[#D8B282]/50 bg-[#0F1420]/95 p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(216,178,130,0.15)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#E8C986]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#E8C986] animate-pulse" />
                <span>{title}</span>
              </div>
              <button
                type="button"
                onClick={() => toast.dismiss(toastId)}
                className="text-white/40 hover:text-white text-xs px-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              {senderAvatar ? (
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D8B282]/60 shadow-md shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C261E] to-[#16130F] border border-[#D8B282]/60 flex items-center justify-center text-[#E8C986] font-bold text-base shadow-md shrink-0">
                  {senderName ? senderName.charAt(0).toUpperCase() : "V"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-white truncate">{senderName}</p>
                {(senderTitle || senderCompany) && (
                  <p className="text-xs text-[#9DA3AE] truncate mt-0.5">
                    {senderTitle ? `${senderTitle} · ` : ""}
                    {senderCompany || ""}
                  </p>
                )}
                <p className="text-[11px] text-[#D8B282]/90 mt-0.5 font-medium">
                  Đã gửi lời mời kết nối danh thiếp
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t border-white/10">
              {connectionId && (
                <button
                  type="button"
                  onClick={async () => {
                    toast.dismiss(toastId);
                    try {
                      await GlobalNetworkSDK.mutations.accept(connectionId);
                      invalidateEverything();
                      toast.success(`Đã kết nối thành công với ${senderName}!`, {
                        description: "Bạn có thể trò chuyện và trao đổi cơ hội kinh doanh ngay.",
                      });
                    } catch (e) {
                      toast.error("Không thể hoàn tất kết nối. Vui lòng thử lại sau.");
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ✓ Đồng ý
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  toast.dismiss(toastId);
                  if (typeof window !== "undefined") {
                    if (senderUserId) {
                      window.location.href = `/connect-app/network/u:${senderUserId}`;
                    } else {
                      window.location.href = "/connect-app/network/requests";
                    }
                  }
                }}
                className="flex-1 py-2 px-3 rounded-full font-semibold text-xs border border-[#D8B282]/40 bg-white/5 hover:bg-white/10 text-[#E8C986] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                🔍 Xem chi tiết
              </button>

              {connectionId && (
                <button
                  type="button"
                  onClick={async () => {
                    toast.dismiss(toastId);
                    try {
                      await GlobalNetworkSDK.mutations.decline(connectionId);
                      invalidateEverything();
                      toast.info("Đã từ chối lời mời kết nối.");
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="py-2 px-2.5 rounded-full font-medium text-xs text-[#8A8D91] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Từ chối
                </button>
              )}
            </div>
          </div>
        ),
        { duration: 10000 }
      );
    };

    const handleNewNotification = (notif: any) => {
      invalidateEverything();
      const dedupeId = notif?.sourceRecordId || notif?.id || "notif";
      if (!shouldShowToast(dedupeId)) return;

      const isConnectionRequest =
        notif?.notificationKind === "connection_request_received" ||
        notif?.type === "connection_request" ||
        notif?.titleKey === "connection_request_received";

      const senderName =
        notif?.safeDisplayData?.counterpartDisplayName ||
        notif?.actorDisplayName ||
        "Hội viên ViOne";
      const senderCompany = notif?.safeDisplayData?.companyName || notif?.actorCompanyName;
      const senderTitle = notif?.safeDisplayData?.jobTitle || notif?.actorJobTitle;
      const senderAvatar = notif?.safeDisplayData?.avatarUrl || notif?.actorAvatarUrl;
      const connectionId = notif?.sourceRecordId || notif?.connectionId;
      const senderUserId = notif?.safeDisplayData?.counterpartUserId || notif?.actorUserId;

      if (isConnectionRequest) {
        showConnectionRequestToast({
          title: "📱 Lời mời kết nối mới",
          senderName,
          senderCompany,
          senderTitle,
          senderAvatar,
          senderUserId,
          connectionId,
        });
        return;
      }

      playNotificationSound();
      const title = notif?.safeDisplayData?.title || "Bạn có thông báo mới";
      const desc = notif?.safeDisplayData?.body || notif?.safeDisplayData?.companyName;

      toast.info(title, {
        description: desc,
        action: {
          label: "Xem ngay",
          onClick: () => {
            if (typeof window !== "undefined") {
              const route = notif?.action?.targetRoute || "/connect-app/notifications";
              window.location.href = route;
            }
          },
        },
        duration: 8000,
      });
    };

    const handleNfcTapped = (data: any) => {
      invalidateEverything();
      const dedupeId = data?.connectionId || "nfc";
      if (!shouldShowToast(dedupeId)) return;

      const name = data?.requesterProfile?.display_name || "Hội viên ViOne";
      const company = data?.requesterProfile?.company_name;
      const title = data?.requesterProfile?.professional_title;
      const avatar = data?.requesterProfile?.avatar_url;
      const connectionId = data?.connectionId;
      const senderUserId = data?.requesterProfile?.id || data?.requesterUserId;

      showConnectionRequestToast({
        title: "⚡ Quét QR / Chạm danh thiếp VIP",
        senderName: name,
        senderCompany: company,
        senderTitle: title,
        senderAvatar: avatar,
        senderUserId,
        connectionId,
      });
    };

    const handleConnectionRequested = (data: any) => {
      invalidateEverything();
      const dedupeId = data?.connectionId || "req";
      if (!shouldShowToast(dedupeId)) return;

      const name = data?.requesterProfile?.display_name || "Hội viên ViOne";
      const company = data?.requesterProfile?.company_name;
      const title = data?.requesterProfile?.professional_title;
      const avatar = data?.requesterProfile?.avatar_url;
      const connectionId = data?.connectionId;
      const senderUserId = data?.requesterProfile?.id || data?.requesterUserId;

      showConnectionRequestToast({
        title: "📱 Lời mời kết nối mới",
        senderName: name,
        senderCompany: company,
        senderTitle: title,
        senderAvatar: avatar,
        senderUserId,
        connectionId,
      });
    };

    const handleConnectionAccepted = (data: any) => {
      invalidateEverything();
      playNotificationSound();
      const name = data?.accepterProfile?.display_name || "Hội viên ViOne";
      toast.success("Kết nối thành công", {
        description: `${name} đã chấp nhận lời mời kết nối của bạn.`,
        action: {
          label: "Xem mạng lưới",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = "/connect-app/network";
            }
          },
        },
        duration: 8000,
      });
    };

    const handleConnectionDeclined = (_data: any) => {
      invalidateEverything();
      toast.info("Yêu cầu kết nối", {
        description: "Lời mời kết nối đã được cập nhật.",
        duration: 4000,
      });
    };

    const handleConnectionCancelled = (_data: any) => {
      invalidateEverything();
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("nfc:tapped", handleNfcTapped);
    socket.on("connection:requested", handleConnectionRequested);
    socket.on("connection:accepted", handleConnectionAccepted);
    socket.on("connection:declined", handleConnectionDeclined);
    socket.on("connection:cancelled", handleConnectionCancelled);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("nfc:tapped", handleNfcTapped);
      socket.off("connection:requested", handleConnectionRequested);
      socket.off("connection:accepted", handleConnectionAccepted);
      socket.off("connection:declined", handleConnectionDeclined);
      socket.off("connection:cancelled", handleConnectionCancelled);
    };
  }, [socket, viewerUserId, qc]);
}

