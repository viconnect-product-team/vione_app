import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Send, Loader2 } from "lucide-react";
import { uploadChatAttachment } from "@/lib/upload-media";
import { mobileToast } from "@/lib/mobile-toast";

interface VoiceMessageRecorderProps {
  onSendVoice: (payload: { url: string; duration: number }) => Promise<void>;
  onCancel: () => void;
}

export function VoiceMessageRecorder({ onSendVoice, onCancel }: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("[VoiceRecorder] Microphone permission denied or not available", err);
      mobileToast.error("Không thể truy cập Micro", { description: "Vui lòng cấp quyền Micro trên thiết bị để ghi âm." });
      onCancel();
    }
  };

  const handleStopAndSend = async () => {
    if (!mediaRecorderRef.current || isProcessing) return;
    setIsProcessing(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const duration = recordingTime;

    mediaRecorderRef.current.onstop = async () => {
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Create audio File object for standard attachment uploader
        const fileExt = mimeType.includes("mp4") ? "mp4" : "webm";
        const audioFile = new File([audioBlob], `voice_${Date.now()}.${fileExt}`, { type: mimeType });

        const uploadRes = await uploadChatAttachment(audioFile);
        await onSendVoice({ url: uploadRes.url, duration });
      } catch (err: any) {
        console.error("[VoiceRecorder] Upload voice message failed", err);
        mobileToast.error("Gửi tin nhắn thoại thất bại", { description: "Vui lòng thử lại sau." });
      } finally {
        cleanup();
        setIsProcessing(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleCancelRecording = () => {
    cleanup();
    onCancel();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 w-full bg-[var(--bc-mobile-surface-2)] px-4 py-2 rounded-2xl border border-red-500/30 animate-fade-in shadow-lg">
      {/* Left: Red pulse recording indicator & Live Timer */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-red-500 dark:text-red-400">
            {formatTime(recordingTime)}
          </span>
          <span className="text-xs text-[var(--bc-mobile-muted)] truncate hidden sm:inline">
            Đang thu âm giọng nói...
          </span>
        </div>
      </div>

      {/* Right Controls: Delete (Trash) & Send Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleCancelRecording}
          aria-label="Hủy thu âm"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500/20 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={isProcessing || recordingTime < 1}
          onClick={handleStopAndSend}
          aria-label="Gửi tin nhắn thoại"
          className="flex h-8.5 px-3.5 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 font-bold text-xs shadow-[0_2px_12px_rgba(216,178,130,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Gửi Voice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
