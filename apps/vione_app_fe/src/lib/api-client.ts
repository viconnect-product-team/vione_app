export const NEST_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function mapEndpoint(endpoint: string): string {
  let mapped = endpoint;
  
  if (mapped === '/connect-app/briefing') {
    mapped = '/me/briefing';
  } else if (mapped === '/connect-app/me/profile' || mapped === '/profile') {
    mapped = '/me/profile';
  } else if (mapped === '/connect-app/me/identity') {
    mapped = '/me/identity';
  } else if (mapped === '/connect-app/me/identity/visibility') {
    mapped = '/me/identity/visibility';
  } else if (mapped === '/connect-app/me/identity/share-link') {
    mapped = '/me/identity/share-link';
  } else if (mapped === '/connect-app/me/identity/share-link/rotate') {
    mapped = '/me/identity/share-link/rotate';
  } else if (mapped.startsWith('/connect-app/me/showcase')) {
    mapped = mapped.replace('/connect-app/me/showcase', '/me/showcase');
  } else if (mapped === '/connect-app/abuse/report') {
    mapped = '/network/abuse/report';
  } else if (mapped === '/connect-app/community' || mapped.startsWith('/connect-app/community/')) {
    mapped = mapped.replace('/connect-app/community', '/communities');
  } else if (mapped.startsWith('/connect-app/network/')) {
    mapped = mapped.replace('/connect-app/network/', '/network/');
  } else if (mapped.startsWith('/connect-app/me/')) {
    mapped = mapped.replace('/connect-app/me/', '/me/');
  } else if (mapped.startsWith('/connect-app/dm/')) {
    mapped = mapped.replace('/connect-app/dm/', '/dm/');
  } else if (mapped === '/connect-app/customer' || mapped.startsWith('/connect-app/customer/')) {
    mapped = mapped.replace('/connect-app/customer', '/customers');
  } else if (mapped === '/connect-app/card-scan' || mapped.startsWith('/connect-app/card-scan/')) {
    mapped = mapped.replace('/connect-app/card-scan', '/card-scans');
  } else if (mapped.startsWith('/connect-app/public/identity/')) {
    mapped = mapped.replace('/connect-app/public/identity/', '/public/identity/');
  } else if (mapped.startsWith('/connect-app/notifications')) {
    mapped = mapped.replace('/connect-app/notifications', '/me/notifications');
  } else if (mapped.startsWith('/connect-app/moment/')) {
    mapped = mapped.replace('/connect-app/moment/', '/moments/');
  }

  const clean = mapped.startsWith('/') ? mapped : `/${mapped}`;
  return clean.startsWith('/api') ? clean : `/api${clean}`;
}

export function getNestApiUrl(endpoint: string): string {
  return `${NEST_API_URL}${mapEndpoint(endpoint)}`;
}

function transformUrls(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    if (obj.startsWith('/upload/')) {
      return `${NEST_API_URL}/api${obj}`;
    }
    if (obj.startsWith('/uploads/')) {
      return `${NEST_API_URL}${obj}`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(transformUrls);
  }
  
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = transformUrls(obj[key]);
    }
    return res;
  }
  
  return obj;
}

function cleanUrls(body: any): any {
  if (body === null || body === undefined) return body;
  
  if (typeof body === 'string') {
    const apiPrefix = `${NEST_API_URL}/api/upload/`;
    const cleanPrefix = `${NEST_API_URL}/upload/`;
    const uploadsPrefix = `${NEST_API_URL}/uploads/`;
    if (body.startsWith(apiPrefix)) {
      return body.substring(NEST_API_URL.length + 4);
    }
    if (body.startsWith(cleanPrefix)) {
      return body.substring(NEST_API_URL.length);
    }
    if (body.startsWith(uploadsPrefix)) {
      return body.substring(NEST_API_URL.length);
    }
    return body;
  }
  
  if (Array.isArray(body)) {
    return body.map(cleanUrls);
  }
  
  if (typeof body === 'object') {
    const res: any = {};
    for (const key of Object.keys(body)) {
      res[key] = cleanUrls(body[key]);
    }
    return res;
  }
  
  return body;
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibe_token');
      localStorage.removeItem('vibe_refresh_token');
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      const pathname = window.location.pathname;
      if (pathname !== '/auth') {
        window.location.href = `/auth?reason=expired&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
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
    const parsed = JSON.parse(text);
    return transformUrls(parsed);
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

  const mappedEndpoint = mapEndpoint(endpoint);
  let requestBody = options.body;
  if (requestBody && typeof requestBody === 'string') {
    try {
      const parsedBody = JSON.parse(requestBody);
      requestBody = JSON.stringify(cleanUrls(parsedBody));
    } catch (e) {
      // Ignore if not JSON
    }
  }

  const response = await fetch(`${NEST_API_URL}${mappedEndpoint}`, {
    ...options,
    body: requestBody,
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

  const mappedEndpoint = mapEndpoint(endpoint);
  let requestBody = options.body;
  if (requestBody && typeof requestBody === 'string') {
    try {
      const parsedBody = JSON.parse(requestBody);
      requestBody = JSON.stringify(cleanUrls(parsedBody));
    } catch (e) {
      // Ignore if not JSON
    }
  }

  const response = await fetch(`${NEST_API_URL}${mappedEndpoint}`, {
    ...options,
    body: requestBody,
    headers,
  });

  return handleResponse(response);
}

export async function uploadFileToNest(file: File | Blob, filename: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vibe_token') : null;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const formData = new FormData();
  formData.append('file', file, filename);

  const response = await fetch(`${NEST_API_URL}/api/upload/file`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const text = await response.text();
  const data = JSON.parse(text); // Bypasses automatic URL transform so we get raw path e.g., "/upload/file/documents/..."
  return data.url;
}
