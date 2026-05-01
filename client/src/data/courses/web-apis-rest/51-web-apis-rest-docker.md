---
title: Docker for APIs
---

# Docker for APIs

**Docker** packages your API and its dependencies into a container that runs identically on any machine. No more "works on my machine" problems.

---

## Dockerfile

```dockerfile
# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
```

---

## .dockerignore

Keep images small by excluding unnecessary files:

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
__tests__
*.test.js
```

---

## Build and Run

```bash
# Build the image
docker build -t my-api .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL=mongodb://host.docker.internal:27017/myapp \
  -e JWT_SECRET=my-secret \
  my-api
```

---

## Docker Compose

Run your API with its database:

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
      - JWT_SECRET=my-secret
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f api

# Stop everything
docker compose down
```

---

## Multi-Stage Build

Smaller production images:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

---

## Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

## Key Takeaways

- **Dockerfile** defines how to build your API container
- Use **`.dockerignore`** to keep images small
- **Docker Compose** runs your API with databases and other services
- **Multi-stage builds** create smaller production images
- Add **health checks** for container orchestration

---

Next, we'll learn about **CI/CD Pipelines** — automating testing and deployment →
