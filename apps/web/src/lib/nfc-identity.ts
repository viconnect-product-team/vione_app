// NFC digital identity abstraction. Uses the Web NFC (NDEF) API where available
// (Chrome on Android). Physical NFC cards and native apps can share the same
// identity because everything resolves to the member's public verify URL — NFC
// tag IDs are never hardcoded or trusted for identity; the URL is the identity.

import type { MembershipPass } from "@/lib/membership-pass";

export type NfcSupport = "supported" | "unsupported" | "insecure";

export function nfcSupport(): NfcSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!("NDEFReader" in window)) return "unsupported";
  if (!window.isSecureContext) return "insecure";
  return "supported";
}

/** NDEF records written to a physical card / shared via tap. */
export function buildNdefRecords(pass: MembershipPass): { recordType: string; data: string }[] {
  return [
    { recordType: "url", data: pass.verifyUrl },
    {
      recordType: "text",
      data: [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${pass.memberName}`,
        pass.organization ? `ORG:${pass.organization}` : "",
        `URL:${pass.verifyUrl}`,
        `NOTE:Member ${pass.memberCode}`,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

export type NfcWriteResult = { ok: true } | { ok: false; error: string };

export async function writeNfc(pass: MembershipPass): Promise<NfcWriteResult> {
  const support = nfcSupport();
  if (support === "unsupported") return { ok: false, error: "Thiết bị không hỗ trợ NFC" };
  if (support === "insecure") return { ok: false, error: "Cần kết nối HTTPS để dùng NFC" };
  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.write({ records: buildNdefRecords(pass) });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ghi NFC thất bại" };
  }
}
