---
title: "Containers and Docker"
---

# Containers and Docker

In this lesson, you will learn what containers are, how they differ from virtual machines, and how to use **Docker** — the most popular containerization platform — to build, ship, and run applications consistently across any environment.

---

## What Are Containers?

A **container** is a lightweight, standalone, executable package that includes everything needed to run a piece of software:

- Application code
- Runtime (e.g., Node.js, Python)
- System libraries
- Configuration files

Containers **share the host operating system's kernel** but run in isolated user spaces. This makes them much more efficient than traditional virtual machines.

### Real-World Analogy

Think of containers like **shipping containers** in global trade. No matter what's inside — electronics, food, furniture — the container has a standard shape that fits on any ship, truck, or train. Similarly, software containers package your app so it runs the same everywhere.

---

## Containers vs Virtual Machines

Understanding the difference between containers and VMs is fundamental:

| Feature | Containers | Virtual Machines |
|---|---|---|
| **Size** | Megabytes (lightweight) | Gigabytes (heavy) |
| **Startup time** | Seconds | Minutes |
| **OS** | Shares host kernel | Full guest OS |
| **Isolation** | Process-level | Hardware-level |
| **Performance** | Near-native | Overhead from hypervisor |
| **Density** | Hundreds per host | Tens per host |
| **Portability** | Highly portable | Less portable |
| **Resource usage** | Minimal | Significant |

### Architecture Comparison

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│       CONTAINERS            │    │     VIRTUAL MACHINES        │
├─────────────────────────────┤    ├─────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌─────┐ │    │  ┌──────────┐ ┌──────────┐ │
│  │App A │ │App B │ │App C│ │    │  │  App A   │ │  App B   │ │
│  │Libs  │ │Libs  │ │Libs │ │    │  │  Libs    │ │  Libs    │ │
│  └──────┘ └──────┘ └─────┘ │    │  │ Guest OS │ │ Guest OS │ │
│  ┌─────────────────────────┐│    │  └──────────┘ └──────────┘ │
│  │    Container Runtime    ││    │  ┌─────────────────────────┐│
│  └─────────────────────────┘│    │  │       Hypervisor        ││
│  ┌─────────────────────────┐│    │  └─────────────────────────┘│
│  │      Host OS            ││    │  ┌─────────────────────────┐│
│  └─────────────────────────┘│    │  │       Host OS           ││
│  ┌─────────────────────────┐│    │  └─────────────────────────┘│
│  │     Infrastructure      ││    │  ┌─────────────────────────┐│
│  └─────────────────────────┘│    │  │     Infrastructure      ││
└─────────────────────────────┘    │  └─────────────────────────┘│
                                   └─────────────────────────────┘
```

> **Key Insight:** Containers share the host kernel, eliminating the need for a full guest operating system. This is why they are so much lighter and faster.

### When to Use Each

| Use Case | Best Choice |
|---|---|
| Running multiple apps efficiently | Containers |
| Strong security isolation required | VMs |
| Rapid scaling and deployment | Containers |
| Running different OS (Linux on Windows) | VMs |
| Microservices architecture | Containers |
| Legacy application isolation | VMs |

---

## Docker Fundamentals

**Docker** is an open-source platform that automates the deployment of applications inside containers. Let's understand its core concepts.

### Docker Images

A Docker **image** is a read-only template used to create containers. Think of it as a blueprint.

```
Image = Application Code + Dependencies + Configuration
```

Images are built in **layers**. Each instruction in a Dockerfile creates a new layer:

```
┌─────────────────────────┐
│    Application Code     │  ← Your code (top layer)
├─────────────────────────┤
│    npm install          │  ← Dependencies
├─────────────────────────┤
│    Node.js 20           │  ← Runtime
├─────────────────────────┤
│    Alpine Linux         │  ← Base OS (bottom layer)
└─────────────────────────┘
```

### Docker Containers

A **container** is a running instance of an image. You can create multiple containers from the same image.

```bash
# One image, many containers
docker run myapp    # Container 1
docker run myapp    # Container 2
docker run myapp    # Container 3
```

### Dockerfile

A **Dockerfile** is a text file with instructions to build a Docker image. Each instruction creates a layer.

```dockerfile
# Start from a base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]
```

### Common Dockerfile Instructions

| Instruction | Purpose | Example |
|---|---|---|
| `FROM` | Set base image | `FROM python:3.12-slim` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files into image | `COPY . .` |
| `ADD` | Copy files (supports URLs, tar extraction) | `ADD app.tar.gz /app` |
| `RUN` | Execute command during build | `RUN apt-get update` |
| `CMD` | Default command when container starts | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Configure container as executable | `ENTRYPOINT ["python"]` |
| `ENV` | Set environment variable | `ENV NODE_ENV=production` |
| `EXPOSE` | Document which port the container listens on | `EXPOSE 8080` |
| `VOLUME` | Create mount point for external storage | `VOLUME ["/data"]` |
| `ARG` | Define build-time variable | `ARG VERSION=1.0` |
| `LABEL` | Add metadata to image | `LABEL maintainer="you"` |

### Docker Hub

**Docker Hub** is the default public registry for Docker images. It's like GitHub but for container images.

```bash
# Pull an image from Docker Hub
docker pull nginx:latest

# Push your image to Docker Hub
docker tag myapp username/myapp:v1.0
docker push username/myapp:v1.0
```

Popular official images on Docker Hub:

| Image | Description | Pull Command |
|---|---|---|
| `nginx` | Web server / reverse proxy | `docker pull nginx` |
| `node` | Node.js runtime | `docker pull node:20` |
| `python` | Python runtime | `docker pull python:3.12` |
| `postgres` | PostgreSQL database | `docker pull postgres:16` |
| `redis` | In-memory data store | `docker pull redis:7` |
| `mongo` | MongoDB database | `docker pull mongo:7` |

---

## Docker Architecture

Docker uses a **client-server architecture** with three main components:

```
┌──────────┐       REST API        ┌──────────────┐
│  Docker   │ ──────────────────── │   Docker      │
│  Client   │                      │   Daemon      │
│  (CLI)    │                      │  (dockerd)    │
└──────────┘                       └──────┬───────┘
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                        ┌─────┴──┐  ┌─────┴──┐  ┌────┴────┐
                        │Containers│ │ Images │  │Registry │
                        └────────┘  └────────┘  └─────────┘
```

### Docker Daemon (`dockerd`)

The daemon is the background process that manages Docker objects (images, containers, networks, volumes). It listens for Docker API requests.

### Docker Client (`docker`)

The CLI tool you use to interact with Docker. When you type `docker run`, the client sends the command to the daemon.

### Docker Registry

A storage and distribution system for Docker images. Docker Hub is the default public registry, but you can run private registries.

---

## Hands-On: Building and Running Containers

### Step 1: Create a Simple Application

```javascript
// server.js
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    message: "Hello from Docker!",
    timestamp: new Date().toISOString(),
    hostname: require("os").hostname()
  }));
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Step 2: Write a Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Step 3: Build the Image

```bash
# Build the image and tag it
docker build -t my-node-app:v1 .

# List images to verify
docker images
```

**Output:**

```
REPOSITORY    TAG    IMAGE ID       CREATED          SIZE
my-node-app   v1     a1b2c3d4e5f6   10 seconds ago   180MB
```

### Step 4: Run the Container

```bash
# Run in detached mode, map port 3000
docker run -d -p 3000:3000 --name my-app my-node-app:v1

# Check running containers
docker ps

# View logs
docker logs my-app

# Test the application
curl http://localhost:3000
```

### Step 5: Manage the Container

```bash
# Stop the container
docker stop my-app

# Start it again
docker start my-app

# Remove the container (must be stopped first)
docker rm my-app

# Remove the image
docker rmi my-node-app:v1
```

### Essential Docker Commands

| Command | Description |
|---|---|
| `docker build -t name .` | Build image from Dockerfile |
| `docker run -d -p 80:80 image` | Run container in background |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker logs <container>` | View container logs |
| `docker exec -it <container> sh` | Open shell in container |
| `docker stop <container>` | Stop a container |
| `docker rm <container>` | Remove a container |
| `docker images` | List images |
| `docker rmi <image>` | Remove an image |
| `docker system prune` | Clean up unused resources |

---

## Docker Compose for Multi-Container Apps

Real applications often need multiple services (web server, database, cache). **Docker Compose** lets you define and run multi-container applications with a single YAML file.

### Example: Web App with Database and Cache

```yaml
# docker-compose.yml
version: "3.9"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Docker Compose Commands

```bash
# Start all services
docker compose up -d

# View status
docker compose ps

# View logs for all services
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes too
docker compose down -v

# Rebuild images
docker compose up -d --build
```

---

## Docker Networking

Docker creates isolated networks for containers to communicate.

### Network Types

| Network Driver | Description | Use Case |
|---|---|---|
| `bridge` | Default; isolated network on host | Single-host container communication |
| `host` | Shares host's network stack | Performance-critical applications |
| `none` | No networking | Security-sensitive containers |
| `overlay` | Multi-host networking | Docker Swarm / distributed apps |

### Working with Networks

```bash
# Create a custom network
docker network create my-network

# Run containers on the same network
docker run -d --name api --network my-network my-api
docker run -d --name db --network my-network postgres

# Containers can reach each other by name
# From the "api" container: connect to "db:5432"

# List networks
docker network ls

# Inspect a network
docker network inspect my-network
```

---

## Docker Volumes

Containers are **ephemeral** — data is lost when a container is removed. **Volumes** provide persistent storage.

### Volume Types

| Type | Syntax | Use Case |
|---|---|---|
| **Named volume** | `-v mydata:/app/data` | Databases, persistent state |
| **Bind mount** | `-v ./local:/app/data` | Development (live code reload) |
| **tmpfs mount** | `--tmpfs /app/temp` | Temporary data, secrets |

### Volume Commands

```bash
# Create a named volume
docker volume create my-data

# Run container with volume
docker run -d -v my-data:/var/lib/postgresql/data postgres

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my-data

# Remove unused volumes
docker volume prune
```

---

## Best Practices

### 1. Multi-Stage Builds

Reduce final image size by separating build and runtime stages:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Result:** The final image contains only the built artifacts — no source code, no dev dependencies.

### 2. Image Size Optimization

| Technique | Impact |
|---|---|
| Use `-alpine` or `-slim` base images | 5x-10x smaller |
| Multi-stage builds | Remove build tools from final image |
| Combine `RUN` commands | Fewer layers |
| Use `.dockerignore` | Exclude unnecessary files |
| Clean up in the same `RUN` layer | Remove temp files before layer commits |

Example `.dockerignore`:

```
node_modules
.git
.env
*.md
docker-compose.yml
.github
```

### 3. Security Scanning

```bash
# Scan image for vulnerabilities
docker scout cves my-app:latest

# Use Trivy (open-source scanner)
trivy image my-app:latest

# Use Snyk
snyk container test my-app:latest
```

### 4. General Best Practices

- **Don't run as root** — use `USER` instruction
- **Pin base image versions** — `node:20.11-alpine` not `node:latest`
- **One process per container** — follow single-responsibility
- **Use health checks** — `HEALTHCHECK CMD curl -f http://localhost/health`
- **Don't store secrets in images** — use environment variables or secrets managers
- **Order Dockerfile for caching** — put rarely-changing instructions first

```dockerfile
# Good: Non-root user
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "server.js"]
```

---

## Container Registries

Besides Docker Hub, major cloud providers offer managed container registries:

| Registry | Provider | Key Features |
|---|---|---|
| **ECR** (Elastic Container Registry) | AWS | Integrated with ECS/EKS, lifecycle policies |
| **ACR** (Azure Container Registry) | Azure | Geo-replication, integrated with AKS |
| **GCR** / **Artifact Registry** | Google Cloud | Integrated with GKE, vulnerability scanning |
| **GHCR** (GitHub Container Registry) | GitHub | Tied to repos, free for public images |
| **Docker Hub** | Docker | Largest public registry, free tier |

### Pushing to a Cloud Registry (AWS ECR Example)

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag image for ECR
docker tag my-app:v1 \
  123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:v1

# Push to ECR
docker push \
  123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:v1
```

---

## Exercises

### Exercise 1: Build Your First Image

Create a Dockerfile for a Python Flask application:

```python
# app.py
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from a container!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

Write the Dockerfile, build it, and run the container.

<details>
<summary>Solution</summary>

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
echo "flask" > requirements.txt
docker build -t flask-app .
docker run -d -p 5000:5000 flask-app
curl http://localhost:5000
```

</details>

### Exercise 2: Multi-Container with Compose

Create a `docker-compose.yml` that runs a Node.js API with a MongoDB database. The API should connect to MongoDB using the service name as hostname.

<details>
<summary>Solution</summary>

```yaml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://db:27017/myapp
    depends_on:
      - db
  db:
    image: mongo:7
    volumes:
      - mongodata:/data/db

volumes:
  mongodata:
```

</details>

### Exercise 3: Optimize an Image

Given this Dockerfile, identify the problems and rewrite it following best practices:

```dockerfile
FROM node:20
COPY . .
RUN npm install
RUN apt-get update && apt-get install -y curl
EXPOSE 3000
CMD ["node", "index.js"]
```

<details>
<summary>Solution</summary>

Problems: not using alpine, no `.dockerignore`, no `WORKDIR`, running as root, poor layer caching order, dev dependencies included.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "index.js"]
```

</details>

---

## Key Takeaways

- **Containers** package applications with all dependencies, ensuring consistent behavior across environments.
- Containers are **lighter and faster** than VMs because they share the host OS kernel.
- **Docker** is the standard platform for building, shipping, and running containers.
- A **Dockerfile** defines the steps to build an image; images are layered and cacheable.
- **Docker Compose** simplifies running multi-container applications with a single YAML file.
- **Volumes** provide persistent storage; **networks** enable container-to-container communication.
- Follow best practices: **multi-stage builds**, **non-root users**, **pinned versions**, and **security scanning**.
- Cloud providers offer managed **container registries** (ECR, ACR, GCR) integrated with their orchestration services.

---

## What's Next?

Now that you know how to containerize applications, the next lesson covers **Kubernetes** — the industry-standard platform for orchestrating containers at scale.
