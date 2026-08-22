import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Client-only QR code rendered to a canvas. Safe for SSR (renders nothing until
 * mounted). Supports a themed rounded frame and an optional centered logo so
 * the QR can echo the active card template.
 *
 * Pass `light="transparent"` to render the QR without a white plate — the
 * frame background will also drop out, so the QR blends onto whatever surface
 * sits below it. Use only when the underlying surface is light enough for
 * reliable scanning.
 */
export function QrCanvas({
  value,
  size = 200,
  light = "#ffffff",
  dark = "#0a1834",
  frameColor,
  accent,
  logoUrl,
  logoBg = "#ffffff",
  logoScale = 0.22,
  logoOffsetX = 0,
  logoOffsetY = 0,
}: {
  value: string;
  size?: number;
  /** QR background color. Use "transparent" to skip the white plate. */
  light?: string;
  /** QR foreground color (modules). */
  dark?: string;
  /** Outer frame background. Defaults to `light`. */
  frameColor?: string;
  /** Border/accent tint for the rounded frame. */
  accent?: string;
  /** Optional center logo URL (rendered inside a rounded badge). */
  logoUrl?: string | null;
  /** Background circle color behind the logo. */
  logoBg?: string;
  /** Logo diameter as a fraction of the QR size. Clamped to 0.14–0.30. */
  logoScale?: number;
  /** Horizontal logo offset as a fraction of QR size (-0.25 to 0.25). */
  logoOffsetX?: number;
  /** Vertical logo offset as a fraction of QR size (-0.25 to 0.25). */
  logoOffsetY?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const isTransparent = light === "transparent";
  // Encode transparent as an RGBA hex the `qrcode` library accepts.
  const qrLight = isTransparent ? "#00000000" : light;

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const canvas = ref.current;
    let cancelled = false;

    (async () => {
      // High error correction so the center can absorb a logo without breaking
      // scanability. `qrcode` still scans reliably up to ~30% obstruction.
      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 1,
        color: { light: qrLight, dark },
        errorCorrectionLevel: logoUrl ? "H" : "M",
      }).catch(() => {});

      if (cancelled || !logoUrl) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        const scale = Math.min(0.3, Math.max(0.14, logoScale));
        const ox = Math.min(0.25, Math.max(-0.25, logoOffsetX));
        const oy = Math.min(0.25, Math.max(-0.25, logoOffsetY));
        const badge = Math.round(size * scale);
        const pad = Math.round(badge * 0.12);
        const cx = canvas.width / 2 + canvas.width * ox;
        const cy = canvas.height / 2 + canvas.height * oy;
        // Badge background circle so QR modules underneath don't bleed.
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, badge / 2 + pad, 0, Math.PI * 2);
        ctx.fillStyle = logoBg;
        ctx.fill();
        // Clip logo into a circle.
        ctx.beginPath();
        ctx.arc(cx, cy, badge / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - badge / 2, cy - badge / 2, badge, badge);
        ctx.restore();
      };
      img.onerror = () => {
        /* logo failed — leave plain QR */
      };
      img.src = logoUrl;
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, value, size, qrLight, dark, logoUrl, logoBg, logoScale, logoOffsetX, logoOffsetY]);

  const frameBg = isTransparent ? "transparent" : (frameColor ?? light);
  const borderColor = accent ?? "rgba(0,0,0,0.06)";

  return (
    <div
      className="grid place-items-center rounded-2xl p-3 shadow-sm ring-1"
      style={{
        width: size + 24,
        height: size + 24,
        background: frameBg,
        boxShadow: isTransparent
          ? `inset 0 0 0 1px ${borderColor}`
          : `0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px ${borderColor}`,
        ["--tw-ring-color" as string]: borderColor,
      }}
    >
      {ready ? (
        <canvas ref={ref} width={size} height={size} aria-label="Mã QR" className="rounded-lg" />
      ) : (
        <div style={{ width: size, height: size }} />
      )}
    </div>
  );
}
