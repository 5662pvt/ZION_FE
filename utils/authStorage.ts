const REFRESH_TOKEN_KEY = "zion.refreshToken";

let accessToken: string | null = null;
const authClearedListeners = new Set<() => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthStorage(): void {
  setAccessToken(null);
  setRefreshToken(null);
  authClearedListeners.forEach((cb) => cb());
}

export function onAuthCleared(cb: () => void): () => void {
  authClearedListeners.add(cb);
  return () => authClearedListeners.delete(cb);
}
