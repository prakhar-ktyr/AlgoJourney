# API Endpoints

## `GET /api/health`

Health check endpoint. Returns:

```json
{
  "status": "ok",
  "message": "AlgoJourney API is running"
}
```

---

## Auth Endpoints

All auth endpoints use **HttpOnly cookies** for token transport. The access token has a 15-minute TTL; the refresh token lasts 7 days.

### `POST /api/auth/signup`

Create a new user account.

**Request body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Validation:**

- `username`: required, 3–30 characters
- `email`: required, valid email format
- `password`: required, min 8 characters

**Success (201):**

```json
{
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Sets `accessToken` and `refreshToken` cookies.

**Errors:**

- `400` — validation error
- `409` — email or username already exists

---

### `POST /api/auth/login`

Authenticate an existing user.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success (200):** Same shape as signup. Sets auth cookies.

**Errors:**

- `400` — missing fields
- `401` — invalid email or password

---

### `POST /api/auth/logout`

Log out the current user. **Requires authentication.**

**Success (200):**

```json
{ "message": "Logged out" }
```

Clears auth cookies.

**Errors:**

- `401` — not authenticated

---

### `POST /api/auth/refresh`

Refresh the access token using the refresh token cookie.

**Success (200):**

```json
{ "message": "Token refreshed" }
```

Sets a new `accessToken` cookie.

**Errors:**

- `401` — no refresh token or invalid token

---

### `GET /api/auth/me`

Get the current authenticated user's profile. **Requires authentication.**

**Success (200):**

```json
{
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "completedDSASlugs": ["two-sum", "reverse-linked-list"],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

- `401` — not authenticated
- `403` — token expired (client should refresh)
- `404` — user not found

---

## Progress Endpoints

Both endpoints require authentication via HttpOnly cookies.

### `GET /api/progress`

Get the authenticated user's DSA progress (completed problem slugs).

**Success (200):**

```json
{
  "completedSlugs": ["two-sum", "reverse-linked-list", "valid-parentheses"]
}
```

**Errors:**

- `401` — not authenticated
- `404` — user not found

---

### `PUT /api/progress`

Replace the authenticated user's DSA progress.

**Request body:**

```json
{
  "completedSlugs": ["two-sum", "reverse-linked-list"]
}
```

**Validation:**

- `completedSlugs`: required, must be an array of non-empty strings
- Duplicates are automatically removed

**Success (200):** Same shape as GET response with updated data.

**Errors:**

- `400` — invalid body (not an array, contains empty strings)
- `401` — not authenticated
- `404` — user not found
