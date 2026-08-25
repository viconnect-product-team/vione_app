// "Chạm để kết nối" — tap an NFC business card (or scan its QR) and send a
// connection request straight from the app.
//
// The tapped value is parsed client-side into a canonical share token; the
// owner is resolved SERVER-SIDE (5E), so no identity id ever reaches this
// bundle. The resulting state is the canonical connection state — it shows up
// in the viewer's own requests surface, not in local storage.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CircleCheck, Loader2, Nfc, QrCode, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useNfcScanner } from "@/hooks/use-nfc-scanner";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useIdentityConnection } from "@/hooks/use-identity-connection";
import { MeSheet } from "@/components/business-connect/mobile/me/MeSheet";
import { ConnectionSuccessOverlay } from "@/components/business-connect/mobile/ConnectionSuccessOverlay";
import { parseTapConnectValue } from "@/lib/business-connect/mobile/tap-connect";
import { reportIdentityMetric } from "@/lib/business-connect/mobile/identity.telemetry";

const PRIMARY_BTN =
  "flex min-h-12 w-full items-center justify-center gap-2 bc-cta-gold rounded-full px-6 text-[15px] font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none";
const SECONDARY_BTN =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none";

export function TapToConnectSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [token, setToken] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDetected(raw: string) {
    const target = parseTapConnectValue(raw, window.location.origin);
    if (target.kind === "unknown") {
      setError(t("bc.mobile.tapConnect.unknown"));
      return;
    }
    setError(null);
    setCamera(false);
    setToken(target.token);
    reportIdentityMetric("PUBLIC_CARD_CONNECT_TAPPED");
  }

  const nfc = useNfcScanner({ active: !token, onDetect: handleDetected });
  const { videoRef, status: qrStatus } = useQrScanner({
    active: camera && !token,
    onDetect: handleDetected,
  });

  return (
    <MeSheet
      title={t("bc.mobile.tapConnect.title")}
      subtitle={t("bc.mobile.tapConnect.subtitle")}
      onClose={onClose}
    >
      <div className="grid gap-4 pb-2">
        {token ? (
          <TapConnectResult
            token={token}
            onReset={() => {
              setToken(null);
              setError(null);
            }}
          />
        ) : (
          <>
            <div className="grid justify-items-center gap-2 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-5 py-7 text-center">
              <Nfc
                aria-hidden="true"
                className="h-8 w-8 text-[var(--bc-mobile-accent)]"
                strokeWidth={1.6}
              />
              <p aria-live="polite" className="text-[14px] text-[var(--bc-mobile-muted)]">
                {nfc.status === "scanning"
                  ? t("bc.mobile.tapConnect.listening")
                  : nfc.status === "denied"
                    ? t("bc.mobile.tapConnect.nfcDenied")
                    : nfc.status === "unsupported"
                      ? t("bc.mobile.tapConnect.nfcUnsupported")
                      : nfc.status === "error"
                        ? t("bc.mobile.tapConnect.nfcError")
                        : t("bc.mobile.tapConnect.starting")}
              </p>
            </div>

            {camera ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[var(--bc-mobile-surface-2)]">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                {qrStatus !== "scanning" && (
                  <p
                    role="status"
                    className="absolute inset-0 grid place-items-center px-6 text-center text-[13.5px] text-[var(--bc-mobile-muted)]"
                  >
                    {qrStatus === "denied"
                      ? t("bc.mobile.tapConnect.cameraDenied")
                      : qrStatus === "unsupported"
                        ? t("bc.mobile.tapConnect.cameraUnsupported")
                        : qrStatus === "error"
                          ? t("bc.mobile.tapConnect.cameraError")
                          : t("bc.mobile.tapConnect.cameraStarting")}
                  </p>
                )}
              </div>
            ) : null}

            <button type="button" onClick={() => setCamera((v) => !v)} className={SECONDARY_BTN}>
              <QrCode aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              {camera ? t("bc.mobile.tapConnect.stopQr") : t("bc.mobile.tapConnect.useQr")}
            </button>

            {error ? (
              <p role="alert" className="text-[13.5px] text-[var(--bc-mobile-muted)]">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </MeSheet>
  );
}

function TapConnectResult({ token, onReset }: { token: string; onReset: () => void }) {
  const t = useT();
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const { stateQuery, send, accept, decline, withdraw, busy } = useIdentityConnection(token, true);
  const state = stateQuery.data;

  useEffect(() => {
    if (state?.state === "unavailable") reportIdentityMetric("PUBLIC_CARD_CONNECT_FAILED");
  }, [state?.state]);

  function fail() {
    reportIdentityMetric("PUBLIC_CARD_CONNECT_FAILED");
    toast.error(t("bc.mobile.connection.error"));
  }

  if (stateQuery.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2
          aria-hidden="true"
          className="h-6 w-6 animate-spin text-[var(--bc-mobile-muted)] motion-reduce:animate-none"
          strokeWidth={1.8}
        />
      </div>
    );
  }

  const retryRow = (
    <button type="button" onClick={onReset} className={SECONDARY_BTN}>
      <Nfc aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      {t("bc.mobile.tapConnect.again")}
    </button>
  );

  const profileLink = (
    <Link to="/connect-app/network/requests" className={SECONDARY_BTN}>
      {t("bc.mobile.tapConnect.viewInProfile")}
    </Link>
  );

  if (!state || state.state === "unavailable" || state.state === "self") {
    return (
      <div className="grid gap-3">
        <p role="status" className="text-[14px] text-[var(--bc-mobile-muted)]">
          {state?.state === "self"
            ? t("bc.mobile.tapConnect.self")
            : t("bc.mobile.tapConnect.unavailable")}
        </p>
        {retryRow}
      </div>
    );
  }

  if (state.state === "connected") {
    return (
      <div className="grid gap-3">
        {!dismissedSuccess ? (
          <ConnectionSuccessOverlay onDismiss={() => setDismissedSuccess(true)} />
        ) : null}
        <p
          role="status"
          className="flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--bc-mobile-text)]"
        >
          <CircleCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.connection.connected")}
        </p>
        <div className="flex gap-2">
          {profileLink}
          {retryRow}
        </div>
      </div>
    );
  }

  if (state.state === "outgoing_pending") {
    return (
      <div className="grid gap-3">
        <p
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--bc-mobile-text)]"
        >
          <CircleCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.connection.pending")}
        </p>
        <p className="text-center text-[13px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.tapConnect.savedHint")}
        </p>
        <div className="flex gap-2">
          {profileLink}
          {state.connectionId ? (
            <button
              type="button"
              disabled={busy}
              className={SECONDARY_BTN}
              onClick={() =>
                withdraw.mutate(state.connectionId!, {
                  onSuccess: () => {
                    reportIdentityMetric("CONNECTION_REQUEST_WITHDRAWN");
                    toast.success(t("bc.mobile.connection.toast.withdrawn"));
                  },
                  onError: fail,
                })
              }
            >
              {withdraw.isPending ? (
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  strokeWidth={1.8}
                />
              ) : null}
              {t("bc.mobile.connection.withdraw")}
            </button>
          ) : (
            retryRow
          )}
        </div>
      </div>
    );
  }

  if (state.state === "incoming_pending" && state.connectionId) {
    const connectionId = state.connectionId;
    return (
      <div className="grid gap-3">
        <button
          type="button"
          disabled={busy}
          className={PRIMARY_BTN}
          onClick={() =>
            accept.mutate(connectionId, {
              onSuccess: () => {
                reportIdentityMetric("CONNECTION_REQUEST_ACCEPTED");
                toast.success(t("bc.mobile.connection.toast.accepted"));
              },
              onError: fail,
            })
          }
        >
          {accept.isPending ? (
            <Loader2
              aria-hidden="true"
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              strokeWidth={1.8}
            />
          ) : null}
          {t("bc.mobile.connection.accept")}
        </button>
        <button
          type="button"
          disabled={busy}
          className={SECONDARY_BTN}
          onClick={() =>
            decline.mutate(connectionId, {
              onSuccess: () => {
                reportIdentityMetric("CONNECTION_REQUEST_DECLINED");
                toast.success(t("bc.mobile.connection.toast.declined"));
              },
              onError: fail,
            })
          }
        >
          {t("bc.mobile.connection.decline")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={busy}
        className={PRIMARY_BTN}
        onClick={() =>
          send.mutate(undefined, {
            onSuccess: () => {
              reportIdentityMetric("PUBLIC_CARD_CONNECT_SENT");
              toast.success(t("bc.mobile.connection.toast.sent"));
            },
            onError: fail,
          })
        }
      >
        {send.isPending ? (
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            strokeWidth={1.8}
          />
        ) : (
          <UserPlus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        )}
        {t("bc.mobile.connection.connect")}
      </button>
      {retryRow}
    </div>
  );
}
