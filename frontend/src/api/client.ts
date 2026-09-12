import { clearSession } from "../store/auth-slice";
import { store } from "../store/store";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = store.getState().auth.token;
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401 && token) {
    store.dispatch(clearSession());
    throw new Error("Session expired, please log in again");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body as { message?: string | string[] } | null)?.message ??
      `Request failed with ${res.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  if (res.status === 204) return null;
  return res.json();
}
