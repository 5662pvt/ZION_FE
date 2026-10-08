const STORAGE_KEY = "zion.cartToken";

export function getCartToken(): string {
  if (typeof window === "undefined") return "";

  let token = window.localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}
