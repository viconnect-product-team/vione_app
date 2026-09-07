// "Chạm để kết nối" — pure parsing of a tapped NFC tag / scanned QR value
// into a canonical 5A share token.
//
// The only accepted payload is a link to the public card route
// (`/c/<token>`) or a bare 64-hex token. Anything else is rejected — we never
// follow an external target and never invent an identity.

import { isValidPublicToken } from "./identity.validation";

export type TapConnectTarget = { kind: "token"; token: string } | { kind: "unknown" };

function pathFromSameOrigin(raw: string, origin: string): string | null {
  try {
    const url = new URL(raw, origin);
    if (origin && url.origin !== origin) {
      // If it's a valid /c/<token> pathname on an HTTP(S) url, allow resolving it
      if (url.protocol.startsWith("http") && /^\/c\/[a-f0-9]{64}\/?$/i.test(url.pathname)) {
        return url.pathname;
      }
      return null;
    }
    return url.pathname;
  } catch {
    return null;
  }
}

/** Extract the public card token from a tapped/scanned value. */
export function parseTapConnectValue(raw: string, origin: string): TapConnectTarget {
  // Strip control and non-printable characters
  const value = (raw || "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  if (!value) return { kind: "unknown" };

  // 1. Bare token (64-hex)
  if (isValidPublicToken(value)) return { kind: "token", token: value.toLowerCase() };

  // 2. Direct regex match for /c/<64-hex-token> anywhere in payload (e.g. within vCard URL: or query)
  const directMatch = /\/c\/([a-f0-9]{64})(?:[\/?#\s]|$)/i.exec(value);
  if (directMatch && directMatch[1]) {
    const token = directMatch[1].toLowerCase();
    if (isValidPublicToken(token)) return { kind: "token", token };
  }

  // 3. Same-origin or standard card path
  const path = pathFromSameOrigin(value, origin);
  if (path) {
    const match = /^\/c\/([^/]+)\/?$/.exec(path);
    if (match) {
      const token = match[1]!.toLowerCase();
      if (isValidPublicToken(token)) return { kind: "token", token };
    }
  }

  return { kind: "unknown" };
}

