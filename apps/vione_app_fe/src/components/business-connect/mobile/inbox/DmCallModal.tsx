import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RefreshCw,
  Sparkles,
  User,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { safeRandomUUID } from "@/lib/utils";

export interface DmCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "audio" | "video";
  counterpartUserId?: string;
  counterpartName: string;
  counterpartAvatar?: string | null;
  counterpartTitle?: string | null;
  isIncomingAcceptance?: boolean;
}

export function DmCallModal({
  isOpen,
  onClose,
  callType,
  counterpartUserId,
  counterpartName,
  counterpartAvatar,
  counterpartTitle,
  isIncomingAcceptance = false,
}: DmCallModalProps) {
  const viewerUserId = useViewerUserId();
  const [status, setStatus] = useState<"calling" | "connected" | "ended">(
    isIncomingAcceptance ? "connected" : "calling"
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string>(safeRandomUUID());

  // Initialize camera/mic
  useEffect(() => {
    if (!isOpen) return;

    setStatus(isIncomingAcceptance ? "connected" : "calling");
    setDuration(0);
    setIsVideoEnabled(callType === "video");

    const socket = getConnectAppSocket();

    if (!isIncomingAcceptance && counterpartUserId && viewerUserId) {
      const callId = safeRandomUUID();
      callIdRef.current = callId;


      socket.emit("call:initiate", {
        callId,
        recipientUserId: counterpartUserId,
        callerUserId: viewerUserId,
        callerName: "Bạn",
        callType,
      });

      // Ringing timeout (40 seconds)
      const ringTimeout = setTimeout(() => {
        if (status === "calling") {
          setStatus("ended");
          toast.info("Đối phương không trả lời cuộc gọi");
          socket.emit("call:end", {
            callId: callIdRef.current,
            targetUserId: counterpartUserId,
          });
          setTimeout(onClose, 800);
        }
      }, 40000);

      const handleCallAccepted = (payload: any) => {
        if (payload?.callId === callIdRef.current || !payload?.callId) {
          clearTimeout(ringTimeout);
          setStatus("connected");
          toast.success(`Đã kết nối cuộc gọi với ${counterpartName}`);
        }
      };

      const handleCallDeclined = () => {
        clearTimeout(ringTimeout);
        setStatus("ended");
        toast.error(`${counterpartName} đang bận hoặc đã từ chối cuộc gọi`);
        setTimeout(onClose, 1000);
      };

      const handleCallEnded = () => {
        clearTimeout(ringTimeout);
        setStatus("ended");
        toast.info("Cuộc gọi đã kết thúc");
        setTimeout(onClose, 600);
      };

      socket.on("call:accepted", handleCallAccepted);
      socket.on("call:declined", handleCallDeclined);
      socket.on("call:ended", handleCallEnded);

      return () => {
        clearTimeout(ringTimeout);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("call:declined", handleCallDeclined);
        socket.off("call:ended", handleCallEnded);
      };
    } else if (isIncomingAcceptance) {
      const handleCallEnded = () => {
        setStatus("ended");
        toast.info("Cuộc gọi đã kết thúc");
        setTimeout(onClose, 600);
      };
      socket.on("call:ended", handleCallEnded);
      return () => {
        socket.off("call:ended", handleCallEnded);
      };
    }
  }, [isOpen, callType, isIncomingAcceptance, counterpartUserId, viewerUserId, counterpartName, onClose]);

  // Setup local media stream
  useEffect(() => {
    if (!isOpen) return;

    if (callType === "video" && typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode },
          audio: true,
        })
        .then((stream) => {
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setIsVideoEnabled(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, callType, facingMode]);

  // Call duration timer
  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleToggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    if (isVideoEnabled) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      setIsVideoEnabled(false);
    } else {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
      }
      setIsVideoEnabled(true);
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleEndCall = () => {
    setStatus("ended");
    const socket = getConnectAppSocket();
    if (counterpartUserId) {
      socket.emit("call:end", {
        callId: callIdRef.current,
        targetUserId: counterpartUserId,
        duration,
      });
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    toast.info("Cuộc gọi đã kết thúc", {
      description: status === "connected" ? `Thời lượng: ${formatTime(duration)}` : undefined,
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background Animated Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm h-[90dvh] max-h-[720px] rounded-3xl border border-white/15 bg-gradient-to-b from-[#141A26]/95 via-[#0D111A]/95 to-[#07090E]/98 p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Bar: Call Type Badge & Status */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D8B282]/40 bg-[#D8B282]/10 text-xs font-bold uppercase tracking-wider text-[#E8C986]">
            {callType === "video" ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            <span>{callType === "video" ? "Cuộc gọi Video HD" : "Cuộc gọi thoại"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#9DA3AE] font-mono">
            {status === "connected" ? (
              <span className="flex items-center gap-1 text-[#22c55e] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                {formatTime(duration)}
              </span>
            ) : status === "calling" ? (
              <span className="flex items-center gap-1 text-[#E8C986] animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Đang đổ chuông...
              </span>
            ) : (
              <span className="text-red-400">Đã kết thúc</span>
            )}
          </div>
        </div>

        {/* Middle Stage: Video Feed or VIP Avatar */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-6 z-10">
          {callType === "video" && isVideoEnabled ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner flex items-center justify-center">
              {/* Local Camera Video */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />

              {/* Floating Counterpart PiP Overlay */}
              <div className="absolute top-3 right-3 w-28 h-36 rounded-xl border border-[#D8B282]/60 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2 text-center backdrop-blur-md">
                {counterpartAvatar ? (
                  <img
                    src={counterpartAvatar}
                    alt={counterpartName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-[#D8B282]/80 mb-1.5"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2C261E] border border-[#D8B282]/60 flex items-center justify-center text-[#E8C986] font-bold mb-1.5">
                    {counterpartName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] font-bold text-white truncate w-full">{counterpartName}</span>
                <span className="text-[9.5px] text-[#D8B282] font-medium">Đối tác ViOne</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {/* Pulsating Halo Rings for Voice Call */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#D8B282]/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div className="absolute -inset-4 rounded-full bg-[#D8B282]/10 blur-md" />

                {counterpartAvatar ? (
                  <img
                    src={counterpartAvatar}
                    alt={counterpartName}
                    className="relative w-28 h-28 rounded-full object-cover ring-4 ring-[#D8B282]/80 shadow-[0_0_40px_rgba(216,178,130,0.3)]"
                  />
                ) : (
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#2C261E] via-[#1F1A14] to-[#120F0B] border-2 border-[#D8B282] flex items-center justify-center text-[#E8C986] text-4xl font-extrabold shadow-[0_0_40px_rgba(216,178,130,0.3)]">
                    {counterpartName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">{counterpartName}</h2>
              {counterpartTitle && (
                <p className="text-xs text-[#9DA3AE] mt-1 font-medium max-w-[240px] truncate">{counterpartTitle}</p>
              )}
              <p className="text-xs text-[#D8B282] mt-2 font-medium">
                {status === "connected" ? "Đang đàm thoại an toàn" : "Đang chờ đối phương nhận cuộc gọi..."}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="flex items-center justify-center gap-4 w-full">
            {/* Mute Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                isMuted
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
              title={isMuted ? "Bật micro" : "Tắt micro"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle (if video call) */}
            {callType === "video" && (
              <>
                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    !isVideoEnabled
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                  title={isVideoEnabled ? "Tắt Camera" : "Bật Camera"}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                  title="Đổi camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            )}

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(220,38,38,0.6)] active:scale-95 transition-all cursor-pointer"
              title="Kết thúc cuộc gọi"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
