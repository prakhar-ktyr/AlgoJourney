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
 *   import { apiFetch } from "./lib/api";
 *   const res = await apiFetch("/health");
 *   const data = await res.json();
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export function apiUrl(path) {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api${normalised}`;
}

export function apiFetch(path, init) {
  return fetch(apiUrl(path), init);
}
