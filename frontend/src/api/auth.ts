import { apiFetch } from "./client";

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? "/api/auth";

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export function login(email: string, password: string) {
  return apiFetch(`${AUTH_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }) as Promise<AuthResponse>;
}

export function verify() {
  return apiFetch(`${AUTH_URL}/auth/verify`) as Promise<{
    userId: string;
    email: string;
  }>;
}
