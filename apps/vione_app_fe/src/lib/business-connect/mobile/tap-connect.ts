import { isValidPublicToken } from "./identity.validation";

export type TapConnectTarget = { kind: "token"; token: string } | { kind: "unknown" };

function pathFromSameOrigin(raw: string, origin: string): string | null {
  try {
    const url = new URL(raw, origin);
    if (origin && url.origin !== origin) {
      if (url.protocol.startsWith("http")) {
        return url.pathname;
      }
      return null;
    }
    return url.pathname;
  } catch {
    return null;
  }
}

/**
 * Extract target identifier (token, card slug, member code) from tapped NFC / scanned QR value.
 * Supports all ViOne QR formats:
 * - /c/<64-hex-token> (Share link QR)
 * - /b/<slug> (Business card QR)
 * - /card/<slug-or-code>
 * - /verify?t=<token> or /verify?code=<code> (Member VIP card QR)
 * - VBA-MEMBER:<code>
 * - Bare tokens / slugs
 */
export function parseTapConnectValue(raw: string, origin: string): TapConnectTarget {
  const value = (raw || "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  if (!value) return { kind: "unknown" };

  // 1. Bare token (64-hex)
  if (isValidPublicToken(value)) return { kind: "token", token: value.toLowerCase() };

  // 2. Direct match for /c/<token> anywhere in URL / text
  const cTokenMatch = /\/c\/([a-f0-9]{64})(?:[\/?#\s]|$)/i.exec(value);
  if (cTokenMatch && cTokenMatch[1]) {
    const token = cTokenMatch[1].toLowerCase();
    if (isValidPublicToken(token)) return { kind: "token", token };
  }

  // 3. Match for /verify?t=<token> or /verify?code=<code>
  const verifyTMatch = /[?&]t=([a-f0-9]{64})(?:[&#\s]|$)/i.exec(value);
  if (verifyTMatch && verifyTMatch[1]) {
    return { kind: "token", token: verifyTMatch[1].toLowerCase() };
  }
  const verifyCodeMatch = /[?&]code=([^&#\s]+)/i.exec(value);
  if (verifyCodeMatch && verifyCodeMatch[1]) {
    return { kind: "token", token: decodeURIComponent(verifyCodeMatch[1]) };
  }

  // 4. Match for /b/<slug>
  const bSlugMatch = /\/b\/([^/?#\s]+)/i.exec(value);
  if (bSlugMatch && bSlugMatch[1]) {
    return { kind: "token", token: decodeURIComponent(bSlugMatch[1]) };
  }

  // 5. Match for /card/<slug-or-code>
  const cardMatch = /\/card\/([^/?#\s]+)/i.exec(value);
  if (cardMatch && cardMatch[1]) {
    return { kind: "token", token: decodeURIComponent(cardMatch[1]) };
  }

  // 6. Match for VBA-MEMBER:<code>
  const vbaMemberMatch = /^VBA-MEMBER:([^\s]+)$/i.exec(value);
  if (vbaMemberMatch && vbaMemberMatch[1]) {
    return { kind: "token", token: decodeURIComponent(vbaMemberMatch[1]) };
  }

  // 7. Same origin path matching
  const path = pathFromSameOrigin(value, origin);
  if (path) {
    const cMatch = /^\/c\/([^/]+)\/?$/.exec(path);
    if (cMatch && cMatch[1]) return { kind: "token", token: cMatch[1].toLowerCase() };
    const bMatch = /^\/b\/([^/]+)\/?$/.exec(path);
    if (bMatch && bMatch[1]) return { kind: "token", token: decodeURIComponent(bMatch[1]) };
    const cardM = /^\/card\/([^/]+)\/?$/.exec(path);
    if (cardM && cardM[1]) return { kind: "token", token: decodeURIComponent(cardM[1]) };
  }

  // 8. If value is a clean alphanumeric slug / code (3-64 chars), allow trying it
  if (/^[a-zA-Z0-9_-]{3,64}$/.test(value)) {
    return { kind: "token", token: value };
  }

  return { kind: "unknown" };
}


