const BASE_URL = 'http://localhost:3100';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('stackit_token') || sessionStorage.getItem('stackit_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
}

// Helper for GET requests
export function apiGet(path: string) {
  return apiFetch(path, { method: 'GET' });
}

// Helper for POST requests
export function apiPost(path: string, body: any) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Helper for PUT requests
export function apiPut(path: string, body: any) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// Helper for DELETE requests
export function apiDelete(path: string) {
  return apiFetch(path, { method: 'DELETE' });
} 