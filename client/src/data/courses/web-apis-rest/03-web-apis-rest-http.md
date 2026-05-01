---
title: How the Web Works (HTTP)
---

# How the Web Works (HTTP)

Before building APIs, you need to understand **HTTP** — the protocol that powers all communication on the web. Every API call is an HTTP transaction.

---

## What is HTTP?

**HTTP** (HyperText Transfer Protocol) is the language that web clients and servers use to communicate. It was designed for transferring web pages, but it's now the foundation for all web APIs.

```
Client                          Server
  │                               │
  │──── HTTP Request ────────────▶│
  │     GET /api/users            │
  │                               │
  │◀──── HTTP Response ──────────│
  │      200 OK                   │
  │      [{ "name": "Alice" }]    │
```

Key characteristics of HTTP:

- **Text-based**: Requests and responses are human-readable
- **Stateless**: Each request is independent — the server doesn't remember previous requests
- **Client-server**: Clear separation between who asks (client) and who answers (server)
- **Request-response**: Every request gets exactly one response

---

## Anatomy of an HTTP Request

Every HTTP request has these parts:

```
GET /api/users?page=1 HTTP/1.1        ← Request Line
Host: api.example.com                  ← Headers
Accept: application/json               ← Headers
Authorization: Bearer abc123           ← Headers
                                       ← Empty line
                                       ← Body (empty for GET)
```

### 1. Request Line

The first line contains three things:

```
METHOD  PATH        VERSION
GET     /api/users  HTTP/1.1
```

- **Method**: What action to perform (GET, POST, PUT, DELETE, etc.)
- **Path**: The resource being accessed
- **Version**: The HTTP version (usually 1.1 or 2)

### 2. Headers

Key-value pairs that provide metadata about the request:

```
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123
Accept: application/json
User-Agent: Mozilla/5.0
```

### 3. Body

Optional data sent with the request (used with POST, PUT, PATCH):

```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

---

## Anatomy of an HTTP Response

```
HTTP/1.1 200 OK                        ← Status Line
Content-Type: application/json          ← Headers
Content-Length: 45                       ← Headers
                                        ← Empty line
{ "id": 1, "name": "Alice" }           ← Body
```

### 1. Status Line

```
VERSION   STATUS_CODE  REASON_PHRASE
HTTP/1.1  200          OK
```

### 2. Response Headers

```
Content-Type: application/json
Content-Length: 45
Cache-Control: max-age=3600
Set-Cookie: session=abc123
```

### 3. Response Body

The actual data returned:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}
```

---

## HTTP Versions

| Version | Year | Key Features |
|---------|------|-------------|
| **HTTP/1.0** | 1996 | One request per connection |
| **HTTP/1.1** | 1997 | Keep-alive connections, chunked transfer |
| **HTTP/2** | 2015 | Multiplexing, header compression, server push |
| **HTTP/3** | 2022 | QUIC protocol (UDP-based), faster connections |

Most APIs work with HTTP/1.1 or HTTP/2. The differences are handled by the infrastructure — your API code stays the same.

---

## HTTPS: Secure HTTP

**HTTPS** is HTTP with encryption via **TLS** (Transport Layer Security):

```
HTTP:   http://api.example.com   (unencrypted — anyone can read)
HTTPS:  https://api.example.com  (encrypted — data is private)
```

**Always use HTTPS for APIs.** It encrypts:

- The request URL (path and query parameters)
- Headers (including authentication tokens)
- The request and response body

---

## Seeing HTTP in Action

### Using the Browser

1. Open DevTools (F12) → **Network** tab
2. Visit `https://jsonplaceholder.typicode.com/posts/1`
3. Click on the request to see:
   - **Headers**: Request and response headers
   - **Response**: The JSON body
   - **Timing**: How long each phase took

### Using curl

`curl` is a command-line tool for making HTTP requests:

```bash
# Simple GET request
curl https://jsonplaceholder.typicode.com/posts/1

# See full headers (-v for verbose)
curl -v https://jsonplaceholder.typicode.com/posts/1

# POST request with data
curl -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "body": "World", "userId": 1}'
```

### Using JavaScript

```javascript
// Using fetch (built into browsers and Node.js 18+)
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
const data = await response.json();
console.log(data);
// { id: 1, title: "...", body: "...", userId: 1 }
```

---

## The Request-Response Cycle

Here's what happens when you call an API:

```
1. DNS Resolution
   api.example.com → 93.184.216.34

2. TCP Connection
   Client connects to server on port 443 (HTTPS)

3. TLS Handshake (if HTTPS)
   Client and server agree on encryption

4. HTTP Request Sent
   GET /api/users HTTP/1.1
   Host: api.example.com

5. Server Processes Request
   - Validates the request
   - Queries the database
   - Builds the response

6. HTTP Response Sent
   HTTP/1.1 200 OK
   Content-Type: application/json
   [{"name": "Alice"}, {"name": "Bob"}]

7. Connection Kept Alive (HTTP/1.1+)
   Ready for next request
```

---

## Ports

Servers listen on specific **ports**:

| Port | Usage |
|------|-------|
| **80** | HTTP (default) |
| **443** | HTTPS (default) |
| **3000** | Common for development servers |
| **5000** | Common for API servers |
| **8080** | Alternative HTTP port |

When you visit `https://api.example.com`, the browser automatically connects to port 443.

During development, you'll typically run your API on `http://localhost:3000` or `http://localhost:5000`.

---

## Try It Yourself

Open your terminal and run:

```bash
# Make a GET request and see the response
curl -i https://jsonplaceholder.typicode.com/posts/1
```

The `-i` flag shows both headers and body. Identify:

1. The status code
2. The Content-Type header
3. The response body format

---

## Key Takeaways

- **HTTP** is the protocol for all web API communication
- Every HTTP transaction has a **request** and a **response**
- Requests contain a **method**, **path**, **headers**, and optional **body**
- Responses contain a **status code**, **headers**, and **body**
- **HTTPS** adds encryption — always use it for APIs
- Tools like **curl**, **browser DevTools**, and **fetch** let you make HTTP requests

---

Next, we'll explore **URLs & Endpoints** — how to address resources in an API →
