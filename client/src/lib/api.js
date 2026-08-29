/**
 * Centralised API helper.
 *
 * - In development the Vite dev server proxies `/api/*` to http://localhost:5000
 *   (see client/vite.config.js), so a relative base works.
 * - In production (e.g. GitHub Pages, where there is no proxy) set
 *   `VITE_API_BASE_URL` at build time to point at the deployed API origin,
 *   e.g. `VITE_API_BASE_URL=https://api.example.com`.
 *
 * Usage:
 *   import { apiFetch, apiJson } from "./lib/api";
 *   const res = await apiFetch("/health");
 *   const data = await res.json();
 *
 *   const res2 = await apiJson("/auth/login", { email, password });
 *   const data2 = await res2.json();
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export function apiUrl(path) {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api${normalised}`;
}

/**
 * Fetch wrapper that always sends credentials (HttpOnly cookies).
 * On a 403 ("Token expired") response, automatically attempts one
 * token refresh and retries the original request.
 */
export async function apiFetch(path, init = {}) {
  const url = apiUrl(path);
  const opts = { ...init, credentials: "include" };

  let res = await fetch(url, opts);

  // If token expired, try refreshing once
  if (res.status === 403) {
    const refreshRes = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry the original request with fresh cookies
      res = await fetch(url, opts);
    }
  }

  return res;
}

/**
 * Convenience wrapper for POST/PUT requests with a JSON body.
 */
export function apiJson(path, body, method = "POST") {
  return apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
