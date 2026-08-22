// "Chạm để kết nối" — pure parsing of a tapped NFC tag / scanned QR value
// into a canonical 5A share token.
//
// The only accepted payload is a SAME-ORIGIN link to the public card route
// (`/c/<token>`) or a bare 64-hex token. Anything else is rejected — we never
// follow an external target and never invent an identity.

import { isValidPublicToken } from "./identity.validation";

export type TapConnectTarget = { kind: "token"; token: string } | { kind: "unknown" };

function pathFromSameOrigin(raw: string, origin: string): string | null {
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

/** Extract the public card token from a tapped/scanned value. */
export function parseTapConnectValue(raw: string, origin: string): TapConnectTarget {
  const value = raw.trim();
  if (!value) return { kind: "unknown" };

  if (isValidPublicToken(value)) return { kind: "token", token: value };

  const path = pathFromSameOrigin(value, origin);
  if (!path) return { kind: "unknown" };

  const match = /^\/c\/([^/]+)\/?$/.exec(path);
  if (!match) return { kind: "unknown" };

  const token = match[1]!.toLowerCase();
  return isValidPublicToken(token) ? { kind: "token", token } : { kind: "unknown" };
}
