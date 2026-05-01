---
title: Token Authentication (JWT)
---

# Token Authentication (JWT)

**JSON Web Tokens** (JWTs) are the most popular authentication mechanism for REST APIs. They're stateless, self-contained, and work across services.

---

## How JWT Works

```
1. Client sends credentials:
   POST /api/auth/login
   { "email": "alice@example.com", "password": "secret" }

2. Server verifies and returns a token:
   { "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyfQ.signature" }

3. Client sends token with subsequent requests:
   GET /api/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

4. Server verifies the token and processes the request
```

---

## JWT Structure

A JWT has three parts separated by dots:

```
header.payload.signature

eyJhbGciOiJIUzI1NiJ9.          ← Header (algorithm)
eyJ1c2VySWQiOjQyLCJyb2xlIjoi.  ← Payload (data)
SflKxwRJSMeKKF2QT4fwpMeJf36.   ← Signature (verification)
```

**Header**: `{ "alg": "HS256", "typ": "JWT" }`
**Payload**: `{ "userId": 42, "role": "admin", "exp": 1705311000 }`
**Signature**: HMAC-SHA256(header + payload, secret)

---

## Implementation

```bash
npm install jsonwebtoken bcrypt
```

### User Model

```javascript
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", userSchema);
```

### Auth Routes

```javascript
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

// Register
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "Email and password (8+ chars) required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = await User.create({ email, passwordHash: password });
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.status(201).json({ token, user: { id: user._id, email: user.email } });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
});
```

### Auth Middleware

```javascript
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Protected routes
app.get("/api/profile", authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  res.json(user);
});
```

---

## Role-Based Authorization

```javascript
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Only admins can delete users
app.delete("/api/users/:id", authenticate, authorize("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
```

---

## Token Refresh

```javascript
app.post("/api/auth/refresh", authenticate, (req, res) => {
  const token = jwt.sign(
    { userId: req.user.userId, role: req.user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  res.json({ token });
});
```

---

## JWT Security Best Practices

1. **Use strong secrets**: At least 256-bit random strings
2. **Set short expiration**: 15min–24h depending on sensitivity
3. **Use HTTPS only**: Tokens are bearer credentials
4. **Don't store sensitive data** in the payload (it's base64-encoded, not encrypted)
5. **Validate all claims**: Check `exp`, `iss`, `aud` when verifying
6. **Use `HS256` or `RS256`**: Never `none` algorithm

---

## Key Takeaways

- **JWT** is the standard for REST API authentication
- Tokens are **stateless** — the server doesn't store session data
- Use `bcrypt` to **hash passwords** — never store plaintext
- Include `userId` and `role` in the JWT payload
- Always **verify** tokens in middleware before processing requests
- Set **expiration** on all tokens

---

Next, we'll learn about **OAuth 2.0** — delegated authorization for third-party access →
