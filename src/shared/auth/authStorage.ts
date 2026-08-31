const STORAGE_KEY = "treinotrack:auth";
const AUTH_CHANGED_EVENT = "treinotrack:auth-changed";

export interface StoredAuth {
  token: string;
  email: string;
  expiresAtUtc: string;
}

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function onAuthChanged(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGED_EVENT, listener);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, listener);
}
