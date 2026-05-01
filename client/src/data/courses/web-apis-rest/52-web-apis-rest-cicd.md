---
title: CI/CD Pipelines
---

# CI/CD Pipelines

**CI/CD** (Continuous Integration/Continuous Deployment) automates testing and deploying your API whenever you push code.

---

## CI/CD Flow

```
Push Code → Run Tests → Build → Deploy
    │            │         │        │
    ▼            ▼         ▼        ▼
  GitHub    Lint + Test  Docker   Production
```

---

## GitHub Actions

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

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      # Example: Deploy to Railway
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: my-api
```

---

## Pipeline Stages

### 1. Lint

```yaml
- run: npm run lint
```

Catches code style issues before tests run.

### 2. Test

```yaml
- run: npm test
  env:
    NODE_ENV: test
    DATABASE_URL: mongodb://localhost:27017/test
```

Runs unit and integration tests.

### 3. Build

```yaml
- run: docker build -t my-api:${{ github.sha }} .
```

Builds a Docker image tagged with the commit hash.

### 4. Deploy

```yaml
- run: |
    docker tag my-api:${{ github.sha }} registry.example.com/my-api:latest
    docker push registry.example.com/my-api:latest
```

Pushes to a container registry and deploys.

---

## Branch Strategy

```
main ────────── Production deploys
  │
  ├── develop ── Staging deploys
  │     │
  │     └── feature/add-users ── PR triggers tests
  │
  └── hotfix/fix-auth ── Emergency fixes
```

- **PRs to main**: run tests, require approval
- **Merge to main**: auto-deploy to production
- **Feature branches**: run tests on every push

---

## Secrets Management

Never put secrets in workflow files:

```yaml
# Reference secrets from GitHub Settings → Secrets
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Key Takeaways

- **CI** automatically tests every push and PR
- **CD** automatically deploys when tests pass on main
- Use **GitHub Actions** (or GitLab CI, CircleCI) for pipelines
- Store secrets in your CI platform's **secret management**
- Tag Docker images with **commit hashes** for traceability
- Require **passing tests** before merging PRs

---

Next, we'll learn about **Monitoring & Logging** — observing your API in production →
