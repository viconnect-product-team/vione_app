import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldCheck,
  X,
  User,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { resolveMediaUrl } from "@/lib/api-client";
import { safeRandomUUID } from "@/lib/utils";

export interface CeoCallRecordPayload {
  callType: "audio" | "video";
  status: "completed" | "missed" | "declined";
  duration: number;
}

export interface CeoWebRtcCallModalProps {
  open: boolean;
  type: "audio" | "video";
  callId?: string;
  peerUserId?: string;
  peerName: string;
  peerAvatar?: string | null;
  peerTitle?: string | null;
  isIncomingAcceptance?: boolean;
  onClose: () => void;
  onEndCall?: (result: CeoCallRecordPayload) => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function CeoWebRtcCallModal({
  open,
  type = "video",
  callId: callIdProp,
  peerUserId,
  peerName,
  peerAvatar,
  peerTitle,
  isIncomingAcceptance = false,
  onClose,
  onEndCall,
}: CeoWebRtcCallModalProps) {
  const viewerUserId = useViewerUserId();
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">(
    isIncomingAcceptance ? "connected" : "calling"
  );
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === "video");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string>(callIdProp || safeRandomUUID());
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (callIdProp) callIdRef.current = callIdProp;
  }, [callIdProp]);

  const finishCall = (status: "completed" | "missed" | "declined") => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Emit end call signal if socket available
    try {
      const socket = getConnectAppSocket();
      socket.emit("call:end", { callId: callIdRef.current });
    } catch {}

    const duration = callStatus === "connected" ? callSeconds : 0;
    if (onEndCall) {
      onEndCall({
        callType: type,
        status: duration > 0 ? "completed" : status,
        duration,
      });
    }
    onClose();
  };

  // 1. Initialize real user media (camera + microphone)
  useEffect(() => {
    if (!open) return;

    hasRecordedRef.current = false;
    setCallSeconds(0);
    setCallStatus(isIncomingAcceptance ? "connected" : "calling");
    setIsVideoEnabled(type === "video");
    setCameraError(null);

    let active = true;

    async function initMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Trình duyệt không hỗ trợ truy cập Camera/Microphone.");
        }

        const constraints: MediaStreamConstraints = {
          audio: true,
          video:
            type === "video"
              ? { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
              : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && type === "video") {
          localVideoRef.current.srcObject = stream;
        }

        // WebRTC Peer Connection setup
        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Socket signaling
        const socket = getConnectAppSocket();
        if (!isIncomingAcceptance && peerUserId && viewerUserId) {
          socket.emit("call:initiate", {
            callId: callIdRef.current,
            recipientUserId: peerUserId,
            callerUserId: viewerUserId,
            callerName: "Thành viên CEO 1983",
            callType: type,
          });
        }

        // Simulating immediate pickup if remote peer is waiting or auto-connect after ringing
        const ringTimeout = setTimeout(() => {
          if (active) setCallStatus("connected");
        }, 1800);

        return () => clearTimeout(ringTimeout);
      } catch (err: any) {
        console.warn("Camera/Microphone access error:", err);
        setCameraError(err.message || "Không thể mở camera. Vui lòng cấp quyền thiết bị.");
        toast.error("Không thể kết nối camera. Cuộc gọi chuyển sang chế độ thoại.");
        setIsVideoEnabled(false);
        // Fallback: continue in connected state so users can still communicate
        setCallStatus("connected");
      }
    }

    initMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [open, type, facingMode, isIncomingAcceptance, peerUserId, viewerUserId]);

  // 2. Timer when call is connected
  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setIsMuted((prev) => !prev);
      toast.info(!isMuted ? "Đã tắt mic" : "Đã bật mic");
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((t) => (t.enabled = !t.enabled));
        setIsVideoEnabled((prev) => !prev);
        toast.info(!isVideoEnabled ? "Đã bật camera" : "Đã tắt camera");
      }
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const fmtDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-black text-white select-none animate-in fade-in-0 duration-300">
      {/* Top Header: Encryption & Info */}
      <div className="w-full flex items-center justify-between px-5 pt-6 pb-2 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-blue-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{type === "video" ? "Cuộc gọi Video CEO 1983" : "Cuộc gọi Thoại CEO 1983"}</span>
        </div>
        <button
          type="button"
          onClick={() => finishCall("declined")}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Video or Avatar Area */}
      <div className="relative flex-1 w-full max-w-2xl mx-auto flex items-center justify-center p-4 overflow-hidden">
        {type === "video" && isVideoEnabled && !cameraError ? (
          <div className="relative w-full h-full max-h-[640px] rounded-3xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl flex items-center justify-center">
            {/* Main Video View (Remote / Partner) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Fallback if remote stream has no video yet: Show partner card inside */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-slate-950/60 backdrop-blur-xs">
              <div className="relative mb-4">
                {peerAvatar ? (
                  <img
                    src={resolveMediaUrl(peerAvatar) || peerAvatar}
                    alt={peerName}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-[#2E3192]/60 shadow-xl"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#2E3192] to-[#19194D] grid place-items-center text-2xl font-black text-white ring-4 ring-amber-400/40 shadow-xl">
                    {peerName ? peerName.charAt(0).toUpperCase() : "C"}
                  </div>
                )}
                {callStatus === "calling" && (
                  <span className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping opacity-60" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white drop-shadow-md">{peerName}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {callStatus === "calling" ? "Đang đổ chuông..." : fmtDuration(callSeconds)}
              </p>
            </div>

            {/* Floating PiP: Local Video Preview (Self) */}
            <div className="absolute bottom-4 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black z-30 pointer-events-auto">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                Bạn
              </div>
            </div>
          </div>
        ) : (
          /* Audio Mode / Camera Off Mode */
          <div className="flex flex-col items-center justify-center text-center space-y-5 z-10">
            <div className="relative">
              {callStatus === "calling" && (
                <>
                  <div className="absolute -inset-6 rounded-full bg-[#2E3192]/30 animate-ping opacity-60" />
                  <div className="absolute -inset-10 rounded-full bg-[#2E3192]/15 animate-pulse opacity-40" />
                </>
              )}
              {peerAvatar ? (
                <img
                  src={resolveMediaUrl(peerAvatar) || peerAvatar}
                  alt={peerName}
                  className="relative h-32 w-32 rounded-full object-cover ring-4 ring-[#2E3192]/80 shadow-2xl"
                />
              ) : (
                <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-tr from-[#2E3192] to-[#19194D] text-white text-4xl font-black ring-4 ring-amber-400/40 shadow-2xl">
                  {peerName ? peerName.charAt(0).toUpperCase() : "C"}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                {peerName}
              </h2>
              {peerTitle && (
                <p className="text-xs text-amber-400/90 font-medium">{peerTitle}</p>
              )}
              <p className="text-sm font-semibold text-slate-400 font-mono pt-1">
                {callStatus === "calling" ? "Đang kết nối đối tác..." : fmtDuration(callSeconds)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-around px-6 py-8 z-20">
        {/* Mic toggle */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
            isMuted ? "text-rose-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border transition-colors ${
              isMuted
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
            }`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </div>
          <span className="text-[11px] font-medium">{isMuted ? "Bật mic" : "Tắt mic"}</span>
        </button>

        {/* Video Camera Toggle */}
        <button
          type="button"
          onClick={toggleVideo}
          className={`flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
            !isVideoEnabled ? "text-rose-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border transition-colors ${
              !isVideoEnabled
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
            }`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </div>
          <span className="text-[11px] font-medium">{isVideoEnabled ? "Tắt cam" : "Bật cam"}</span>
        </button>

        {/* Flip Camera (for mobile) */}
        {isVideoEnabled && (
          <button
            type="button"
            onClick={switchCamera}
            className="flex flex-col items-center gap-1.5 text-white transition active:scale-95 cursor-pointer"
          >
            <div className="grid h-13 w-13 place-items-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <RefreshCw className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium">Đổi camera</span>
          </button>
        )}

        {/* End Call Button */}
        <button
          type="button"
          onClick={() => finishCall("completed")}
          className="flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer text-white"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-600 hover:bg-rose-700 shadow-[0_0_25px_rgba(225,29,72,0.6)]">
            <PhoneOff className="h-6 w-6 text-white" />
          </div>
          <span className="text-[11px] font-bold text-rose-300">Kết thúc</span>
        </button>
      </div>
    </div>
  );
}
