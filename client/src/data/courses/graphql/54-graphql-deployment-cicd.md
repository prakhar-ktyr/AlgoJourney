---
title: Deployment & CI/CD
---

# Deployment & CI/CD

Deploy your GraphQL API with automated testing and continuous deployment.

---

## Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:4000/api/health || exit 1
CMD ["node", "index.js"]
```

---

## GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
        env:
          DATABASE_URL: mongodb://localhost:27017/test
          JWT_SECRET: test-secret

  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx @apollo/rover graph check my-graph@production --schema schema.graphql
        env:
          APOLLO_KEY: ${{ secrets.APOLLO_KEY }}

  deploy:
    needs: [test, schema-check]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - run: |
          docker build -t my-api:${{ github.sha }} .
          docker tag my-api:${{ github.sha }} registry.example.com/my-api:latest
          docker push registry.example.com/my-api:latest
```

---

## Schema Checks

Prevent breaking changes before deploying:

```bash
# Check schema against production
npx @apollo/rover graph check my-graph@production --schema schema.graphql
```

Catches:
- Removed fields still in use by clients
- Changed field types
- Removed enum values

---

## Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=4000
DATABASE_URL=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=https://myapp.com
APOLLO_KEY=...
```

---

## Deployment Platforms

| Platform | Type | Best For |
|----------|------|----------|
| **Railway** | PaaS | Quick deploys |
| **Render** | PaaS | Auto-scaling |
| **Fly.io** | Edge | Global distribution |
| **AWS ECS** | Containers | Enterprise |
| **Vercel** | Serverless | Edge functions |

---

## Graceful Shutdown

```javascript
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await server.stop();       // Stop accepting new requests
  await mongoose.disconnect(); // Close DB connection
  process.exit(0);
});
```

---

## Key Takeaways

- Use **Docker** for consistent deployments
- Run **tests + lint + schema check** in CI before deploying
- **Schema checks** prevent breaking client changes
- Configure environment-specific settings via **env vars**
- Implement **graceful shutdown** for zero-downtime deploys

---

Next, the final lesson — **Capstone Project** →
