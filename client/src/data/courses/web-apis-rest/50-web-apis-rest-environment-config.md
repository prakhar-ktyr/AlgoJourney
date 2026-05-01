---
title: Environment Configuration
---

# Environment Configuration

APIs run in different environments (development, staging, production). Each needs different settings for databases, API keys, and URLs.

---

## Environment Variables

Store configuration outside your code using environment variables:

```bash
# .env (development)
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=dev-secret-not-for-production
CORS_ORIGIN=http://localhost:5173
```

```bash
# .env.production
NODE_ENV=production
PORT=8080
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/myapp
JWT_SECRET=a-very-long-random-string-here
CORS_ORIGIN=https://myapp.com
```

---

## Loading with dotenv

```bash
npm install dotenv
```

```javascript
import "dotenv/config";

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
};

// Validate required variables at startup
const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

export default config;
```

---

## Configuration Module Pattern

```javascript
// config.js
import "dotenv/config";

const environments = {
  development: {
    db: { url: process.env.DATABASE_URL, debug: true },
    cors: { origin: "http://localhost:5173" },
    rateLimit: { windowMs: 60000, max: 1000 },
  },
  production: {
    db: { url: process.env.DATABASE_URL, debug: false },
    cors: { origin: process.env.CORS_ORIGIN },
    rateLimit: { windowMs: 60000, max: 100 },
  },
  test: {
    db: { url: "mongodb://localhost:27017/myapp-test", debug: false },
    cors: { origin: "*" },
    rateLimit: { windowMs: 60000, max: 10000 },
  },
};

const env = process.env.NODE_ENV || "development";
export default environments[env];
```

---

## Security Rules

**Never** put secrets in code or commit `.env` files:

```gitignore
# .gitignore
.env
.env.local
.env.production
```

Provide an example file instead:

```bash
# .env.example (committed to git)
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=change-me-in-production
CORS_ORIGIN=http://localhost:5173
```

---

## Platform Environment Variables

Most hosting platforms provide a UI or CLI for setting env vars:

```bash
# Heroku
heroku config:set JWT_SECRET=my-secret

# Vercel
vercel env add JWT_SECRET

# Railway
railway variables set JWT_SECRET=my-secret

# Docker
docker run -e JWT_SECRET=my-secret myapp
```

---

## Key Takeaways

- Store configuration in **environment variables**, not in code
- **Validate required variables** at startup — fail fast
- Never commit `.env` files — commit `.env.example` instead
- Use a **config module** for structured access
- Different environments need different settings (dev, staging, prod)

---

Next, we'll learn about **Docker for APIs** — containerizing your application →
