export const NEST_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse(response: Response) {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibe_token');
      localStorage.removeItem('vibe_refresh_token');
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.location.href = `/auth?reason=expired&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  const text = await response.text();
  if (!text || text === 'null') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

export async function fetchNestApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vibe_token') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${NEST_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

export async function fetchNestApiFromServer(endpoint: string, token: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${NEST_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

