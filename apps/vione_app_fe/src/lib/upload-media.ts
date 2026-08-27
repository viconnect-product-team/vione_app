import { getNestApiUrl } from "@/lib/api-client";

export async function uploadProductMedia(file: File, sellerId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getNestApiUrl("/upload/file"), {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  const data = await response.json();
  return getNestApiUrl(data.url);
}

export async function signProductMediaPreview(pathOrUrl: string): Promise<string> {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return getNestApiUrl(pathOrUrl);
}

export async function uploadAssociationLogo(file: File, associationId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getNestApiUrl("/upload/file"), {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  const data = await response.json();
  return getNestApiUrl(data.url);
}

