const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: "include",
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(json?.error?.message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json();
  return json.data as T;
}

async function adminRaw(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
    credentials: "include",
  });
}

export const adminApi = {
  get: <T>(endpoint: string) => adminRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    adminRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    adminRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => adminRequest<T>(endpoint, { method: "DELETE" }),
  raw: adminRaw,
};

export function isAdminAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return true;
}

export function setAdminToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

export function clearAdminToken(): void {
  localStorage.removeItem("admin_token");
}
