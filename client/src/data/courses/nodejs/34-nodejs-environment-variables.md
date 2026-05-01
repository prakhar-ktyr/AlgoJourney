---
title: Node.js Environment Variables
---

# Node.js Environment Variables

Environment variables let you configure your application without changing code. Database URLs, API keys, ports, and feature flags — all belong in environment variables, not hard-coded in your source files.

## Reading environment variables

All environment variables are available in `process.env`:

```javascript
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV; // 'development', 'production', 'test'

console.log(`Server starting on port ${port}`);
```

`process.env` values are **always strings** (or `undefined` if not set).

## Setting environment variables

### Inline (per command)

```bash
PORT=4000 NODE_ENV=production node server.js
```

### Shell export

```bash
export DATABASE_URL="mongodb://localhost:27017/myapp"
export JWT_SECRET="my-secret-key"
node server.js
```

### Windows (PowerShell)

```powershell
$env:PORT = "4000"
$env:NODE_ENV = "production"
node server.js
```

## The .env file and dotenv

Typing environment variables every time is tedious. The **dotenv** pattern loads variables from a `.env` file:

```bash
npm install dotenv
```

### .env

```
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=super-secret-key-change-in-production
API_KEY=abc123
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
```

### Loading .env

```javascript
import "dotenv/config"; // loads .env into process.env

// Or load manually
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.DATABASE_URL);
```

### Node.js 20.6+ built-in .env support

```bash
node --env-file=.env server.js
```

No package needed! Add to your `package.json` scripts:

```json
"scripts": {
  "dev": "node --env-file=.env server.js"
}
```

## .env.example

Create a `.env.example` file that documents all required variables (without actual values):

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/myapp

# Authentication
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Commit `.env.example` to git. **Never commit `.env`** — add it to `.gitignore`:

```
# .gitignore
.env
.env.local
.env.production
```

## Configuration module pattern

Create a centralized config module that validates and exports all configuration:

```javascript
// config.js
import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",

  db: {
    url: required("DATABASE_URL"),
  },

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
```

Usage:

```javascript
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});
```

## Multiple environment files

```
.env                 # default / development
.env.local           # local overrides (gitignored)
.env.production      # production values
.env.test            # test values
```

Load based on NODE_ENV:

```javascript
import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
```

## Security best practices

1. **Never commit secrets to git** — use `.gitignore` for `.env` files.
2. **Never log secrets** — mask them in logs:

```javascript
console.log("DB URL:", config.db.url.replace(/:\/\/[^@]+@/, "://*****@"));
```

3. **Use different secrets per environment** — development, staging, and production should have unique secrets.
4. **Rotate secrets regularly** — especially JWT secrets and API keys.
5. **Use a secrets manager in production** — AWS Secrets Manager, HashiCorp Vault, or your platform's secrets (Heroku config vars, Vercel env vars).

## Key takeaways

- Use `process.env` to read environment variables.
- Use `.env` files with `dotenv` or Node.js 20.6+ `--env-file` flag.
- Never commit `.env` files — commit `.env.example` as documentation.
- Create a config module that validates and centralizes all configuration.
- Keep secrets out of code, logs, and version control.
