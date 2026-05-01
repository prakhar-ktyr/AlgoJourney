---
title: JavaScript Storage
---

# JavaScript Storage

Browsers ship several APIs for keeping data on the user's machine — settings, drafts, cached responses, offline data. Pick the right one for the job.

| API              | Capacity      | Persistence            | Async? | Best for                          |
| ---------------- | ------------- | ---------------------- | ------ | --------------------------------- |
| `localStorage`   | ~5–10 MB      | until cleared          | sync   | small key/value strings           |
| `sessionStorage` | ~5–10 MB      | until tab closes       | sync   | per-tab state                     |
| `Cookies`        | ~4 KB total   | configurable           | sync   | server-readable identity / auth   |
| `IndexedDB`      | hundreds of MB | until cleared          | async  | structured/queryable client data  |
| `Cache Storage`  | large         | until cleared          | async  | offline HTTP responses (PWAs)     |

## `localStorage` and `sessionStorage`

Identical APIs; different lifetimes. Both store **strings only**.

```javascript
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");  // "dark"
localStorage.removeItem("theme");
localStorage.clear();

localStorage.length;
localStorage.key(0); // first key

// Iterate
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

For objects and arrays, JSON-serialize:

```javascript
localStorage.setItem("user", JSON.stringify({ id: 1, name: "Ada" }));
const user = JSON.parse(localStorage.getItem("user") ?? "null");
```

A tiny helper makes this less error-prone:

```javascript
const storage = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(key); },
};
```

### Reacting to changes from other tabs

The `storage` event fires in **other** tabs of the same origin when you write:

```javascript
window.addEventListener("storage", (e) => {
  console.log(e.key, "changed from", e.oldValue, "to", e.newValue);
});
```

Useful for syncing UI across tabs (e.g. logging out everywhere when one tab logs out).

### Caveats

- **Synchronous** — every read/write blocks the main thread. Don't put hundreds of keys in a hot path.
- **String-only** — JSON-serialize anything complex.
- **Same-origin only** — `https://a.com` cannot see `https://b.com`'s storage.
- **Private/incognito modes** can quietly throw on write or have a 0-byte quota.

Wrap writes in `try/catch` if you care about being defensive.

## `sessionStorage`

Same API; cleared when the tab closes. Useful for things like "the multi-step form I was filling out", which shouldn't survive a quit.

```javascript
sessionStorage.setItem("draft", JSON.stringify(form));
```

## Cookies

Cookies predate every modern API, but they're the only client storage the **server** sees on every request. Use them when the server needs to know something (auth tokens, session IDs, locale).

The raw API is awkward:

```javascript
document.cookie = "theme=dark; max-age=31536000; path=/; SameSite=Lax";

// Read all cookies as one string
document.cookie; // "theme=dark; lang=en"

// Parse
const cookies = Object.fromEntries(
  document.cookie.split("; ").map((s) => s.split("=").map(decodeURIComponent)),
);
```

Important attributes when setting cookies:

- `Max-Age` or `Expires` — how long it lives.
- `Path` and `Domain` — where it's sent.
- `Secure` — HTTPS only.
- `HttpOnly` — JavaScript cannot read it (only the server). Set this for auth tokens.
- `SameSite=Lax|Strict|None` — controls cross-site sending. `Lax` is the modern default.

For real apps, set cookies from the **server** (with `Set-Cookie`) and treat `document.cookie` as read-only.

## `IndexedDB`

A real, transactional, indexed, async database in the browser. The native API is verbose; everyone uses a wrapper.

With **`idb-keyval`** (tiny, key/value):

```javascript
import { get, set, del } from "idb-keyval";

await set("user", { id: 1, name: "Ada" });
const user = await get("user");
await del("user");
```

With **`idb`** (full IndexedDB with promises) when you need indexes, queries, and migrations.

Use IndexedDB for offline data, large datasets, or anything you'd want to query — drafts, downloaded media, cached query results, user-generated data in offline-first PWAs.

## `Cache Storage` (and Service Workers)

Designed for *HTTP responses*. A service worker can intercept `fetch` requests and serve cached responses for offline support.

```javascript
const cache = await caches.open("v1");
await cache.put("/api/users", new Response(JSON.stringify(users)));

const cached = await cache.match("/api/users");
if (cached) return cached;
```

You'll most often use `workbox` or framework PWA plugins rather than touching this directly.

## Choosing storage

A simple decision tree:

1. **Server needs to know on every request?** → cookie (`HttpOnly` for auth).
2. **Just a setting / preference / draft?** → `localStorage`.
3. **Per-tab only?** → `sessionStorage`.
4. **Lots of structured data, async OK?** → `IndexedDB` (via `idb-keyval` or similar).
5. **Caching HTTP responses for offline?** → Cache Storage + service worker.

## What NOT to put in browser storage

- **Passwords or unencrypted secrets.** Anything in `localStorage` is readable by any script on the page (including third-party libraries and XSS payloads).
- **Auth tokens, ideally.** Many security pros prefer `HttpOnly` cookies. If you must use `localStorage`, accept the XSS risk and harden accordingly.
- **PII you don't strictly need on the device.**

## A complete example: persisted preferences

```javascript
const KEY = "prefs.v1";
const DEFAULTS = { theme: "system", fontSize: 16, locale: "en" };

function loadPrefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; }
  catch { return DEFAULTS; }
}
function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

const prefs = loadPrefs();
prefs.theme = "dark";
savePrefs(prefs);

// Sync across tabs
window.addEventListener("storage", (e) => {
  if (e.key === KEY) location.reload();
});
```

## Next step

Time for two slightly more specialized data structures: `Map` and `Set`.
