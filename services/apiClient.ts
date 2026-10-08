import type { ApiEnvelope, ApiFieldError, Pagination } from "@/types/api";
import type { AuthTokenDto } from "@/types/auth";
import { clearAuthStorage, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "@/utils/authStorage";
import { getCartToken } from "@/utils/cartToken";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  errors: ApiFieldError[];

  constructor(status: number, message: string, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiResult<T> {
  data: T;
  pagination: Pagination | null;
}

let refreshPromise: Promise<boolean> | null = null;

async function parseResponseBody<T>(res: Response): Promise<ApiEnvelope<T> | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, res.ok ? "Phản hồi không hợp lệ" : `Lỗi máy chủ (${res.status})`);
  }
}

function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const body = await parseResponseBody<AuthTokenDto>(res).catch(() => null);
        if (!res.ok || !body || !body.success || !body.data) return false;
        setAccessToken(body.data.accessToken);
        setRefreshToken(body.data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit = {}, allowRetry = true, isFormData = false): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  if (!isFormData) headers.set("Content-Type", "application/json");
  headers.set("X-Cart-Token", getCartToken());

  const accessToken = getAccessToken();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ");
  }

  if (res.status === 401 && allowRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, init, false, isFormData);
    clearAuthStorage();
  }

  const body = await parseResponseBody<T>(res);

  if (!body) {
    if (res.ok) return { data: undefined as T, pagination: null };
    throw new ApiError(res.status, `Lỗi máy chủ (${res.status})`);
  }

  if (!body.success) {
    throw new ApiError(res.status, body.message, body.errors ?? []);
  }

  return { data: body.data as T, pagination: body.pagination };
}

export function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return request<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path, { method: "DELETE" });
}

export function apiUpload<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
  return request<T>(path, { method: "POST", body: formData }, true, true);
}
