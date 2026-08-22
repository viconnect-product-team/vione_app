import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-media";
// Short-lived signed URL used only for immediate previews. Product media is
// stored as a bucket PATH (not a URL) and re-signed on every view server-side,
// so leaked preview links expire in an hour instead of granting years of access.
const PREVIEW_TTL = 60 * 60; // 1 hour

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext =
    dot >= 0
      ? name
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/** Uploads a file to product-media and returns its bucket storage PATH.
 * Persist this path (not a signed URL); it is re-signed with a short TTL on
 * every read so access always reflects current membership/RLS. */
export async function uploadProductMedia(file: File, sellerId: string): Promise<string> {
  const path = `${sellerId || "anon"}/${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

/** Signs a product-media path (or passes through an already-signed URL) for a
 * short-lived preview in the browser. */
export async function signProductMediaPreview(pathOrUrl: string): Promise<string> {
  if (!pathOrUrl || /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(pathOrUrl, PREVIEW_TTL);
  return data?.signedUrl ?? pathOrUrl;
}

const LOGO_BUCKET = "association-logos";
// Association logos are branding assets referenced from long-lived DB records.
const LOGO_SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

/** Uploads an association logo (folder = associationId, required by storage RLS). */
export async function uploadAssociationLogo(file: File, associationId: string): Promise<string> {
  const path = `${associationId}/${safeName(file.name)}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data, error: signErr } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrl(path, LOGO_SIGNED_TTL);
  if (signErr || !data?.signedUrl) throw new Error(signErr?.message ?? "Sign URL failed");
  return data.signedUrl;
}
