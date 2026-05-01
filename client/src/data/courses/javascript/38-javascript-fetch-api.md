---
title: JavaScript Fetch API
---

# JavaScript Fetch API

`fetch` is the modern, promise-based way to make HTTP requests. It's built into every browser, every modern Node.js (v18+), Deno, Bun, and edge runtimes — one API, everywhere.

## A first GET request

```javascript
const response = await fetch("/api/users/1");
const user = await response.json();
console.log(user);
```

Two `await`s are typical: one for the response headers to arrive, one for the body to be parsed.

## The Response object

`fetch` returns a `Response`. Useful things on it:

```javascript
response.ok;          // true if status is 200–299
response.status;      // 200, 404, 500, ...
response.statusText;  // "OK", "Not Found", ...
response.headers;     // Headers object
response.url;         // final URL after redirects
response.redirected;  // true if redirected

// Body (each can be called only ONCE)
await response.json();
await response.text();
await response.blob();        // binary
await response.arrayBuffer(); // raw bytes
await response.formData();
```

The body is a stream — you must pick one method to consume it.

## A serious quirk: `fetch` does not throw on HTTP errors

A 404 or 500 still **resolves**. `fetch` only rejects on network failure (DNS, offline, CORS, abort). Always check `response.ok`:

```javascript
const r = await fetch(url);
if (!r.ok) {
  throw new Error(`HTTP ${r.status} ${r.statusText}`);
}
const data = await r.json();
```

This trips up everyone the first time.

## POST / PUT / PATCH / DELETE

Pass an options object:

```javascript
const r = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ name: "Ada", email: "a@b.com" }),
});
```

The `body` can be a string, `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, or a `ReadableStream`.

### Form data (multipart, file uploads)

```javascript
const form = new FormData();
form.append("title", "Cat");
form.append("photo", fileInput.files[0]);

await fetch("/upload", { method: "POST", body: form });
// Don't set Content-Type — the browser fills it in with the boundary string.
```

### URL-encoded form

```javascript
const params = new URLSearchParams({ q: "javascript", page: 2 });
await fetch("/search?" + params);
// or as body:
await fetch("/login", { method: "POST", body: params });
```

## Query parameters

```javascript
const url = new URL("/api/users", location.origin);
url.searchParams.set("page", "2");
url.searchParams.set("limit", "20");

await fetch(url);
```

`URL` and `URLSearchParams` handle escaping correctly. Don't build URLs with string concatenation if any value comes from user input.

## Headers

```javascript
const r = await fetch(url, {
  headers: {
    "X-Trace-Id": "abc",
    Accept: "application/json",
  },
});

r.headers.get("Content-Type");   // "application/json; charset=utf-8"
r.headers.has("Set-Cookie");
for (const [name, value] of r.headers) console.log(name, value);
```

## Credentials (cookies)

By default, `fetch` does **not** send cookies on cross-origin requests. To opt in:

```javascript
fetch(url, { credentials: "include" });   // always send
fetch(url, { credentials: "same-origin" }); // only same origin (default for same-origin)
fetch(url, { credentials: "omit" });      // never
```

The server must also send `Access-Control-Allow-Credentials: true` and a non-wildcard `Access-Control-Allow-Origin`.

## CORS in 30 seconds

Browsers block JavaScript on `https://a.com` from reading responses on `https://b.com` unless the response includes the right CORS headers (`Access-Control-Allow-Origin`, etc.). The browser sends an automatic **preflight** `OPTIONS` request for non-simple requests (custom headers, methods other than GET/POST/HEAD, JSON bodies). Your server has to answer it.

CORS errors are diagnosed in the browser console — they look like network failures from `fetch`'s perspective and reject the promise.

## Aborting a request

```javascript
const ctrl = new AbortController();
const timeout = setTimeout(() => ctrl.abort(), 5000);

try {
  const r = await fetch(url, { signal: ctrl.signal });
} catch (err) {
  if (err.name === "AbortError") console.log("timed out");
} finally {
  clearTimeout(timeout);
}
```

Use this for timeouts and "user navigated away" scenarios.

## Streaming the response

Don't want to wait for the whole response to download?

```javascript
const r = await fetch(url);
const reader = r.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value, { stream: true }));
}
```

This is how server-sent events, AI streaming responses, and large file downloads work.

## A reusable helper

Most apps write a small wrapper around `fetch`:

```javascript
async function api(path, options = {}) {
  const r = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body,
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status}: ${text}`);
  }

  return r.headers.get("Content-Type")?.includes("application/json")
    ? r.json()
    : r.text();
}

// Usage
const users = await api("/users");
const created = await api("/users", { method: "POST", body: { name: "Ada" } });
```

## When NOT to use `fetch` directly

For complex apps, libraries layer features on top:

- **axios** — interceptors, request/response transforms, broad browser support.
- **ky** — tiny `fetch` wrapper with retries, timeouts, hooks.
- **TanStack Query / SWR** — caching, dedupe, refetch, suspense — usually what you actually want in React.
- **tRPC / openapi-typescript** — fully typed clients generated from your schema.

For one-off scripts and small apps, plain `fetch` + a small helper is plenty.

## Next step

Browser-only territory: manipulating the page itself with the DOM.
