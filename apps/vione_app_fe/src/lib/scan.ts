// Helpers for resolving scanned QR/NFC payloads into an attendee identifier.
// A badge QR may encode the attendee id directly, or a verify URL such as
// `https://.../verify?code=HV-000123`. We extract the most likely identifier.

export function extractScanCode(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  // URL-style payloads: pull the code/c query param.
  try {
    const url = new URL(value);
    const code = url.searchParams.get("code") ?? url.searchParams.get("c");
    if (code) return code.trim();
    // Fall back to the last path segment for pretty URLs (/verify/HV-000123).
    const seg = url.pathname.split("/").filter(Boolean).pop();
    if (seg) return decodeURIComponent(seg).trim();
  } catch {
    // Not a URL — treat the raw value as the code.
  }
  return value;
}

export function resolveAttendeeId<T extends { id: string }>(raw: string, attendees: T[]): T | null {
  const code = extractScanCode(raw).toLowerCase();
  if (!code) return null;
  return (
    attendees.find((a) => a.id.toLowerCase() === code) ??
    attendees.find((a) => a.id.toLowerCase().endsWith(code)) ??
    null
  );
}
