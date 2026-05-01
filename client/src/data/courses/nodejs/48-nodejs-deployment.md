---
title: Node.js Deployment
---

# Node.js Deployment

Getting your Node.js application from your laptop to a production server involves several steps: preparing the app, choosing a hosting platform, configuring the environment, and setting up process management.

## Preparing for production

### 1. Environment variables

Never hard-code secrets. Use environment variables:

```javascript
// config.js
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
```

### 2. Production dependencies only

```bash
# Install only production dependencies
npm install --omit=dev
# or
npm ci --omit=dev
```

`npm ci` installs exact versions from `package-lock.json` — faster and reproducible.

### 3. Start script

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

### 4. Health check endpoint

```javascript
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});
```

## Hosting platforms

### Platform-as-a-Service (PaaS) — easiest

| Platform | Free tier | Deploy method |
|----------|-----------|--------------|
| **Railway** | $5 credit/month | Git push or CLI |
| **Render** | Free (spins down) | Git push |
| **Fly.io** | Free tier | CLI (`fly deploy`) |
| **Heroku** | No free tier | Git push or CLI |
| **Vercel** | Serverless only | Git push |

### Virtual Private Server (VPS) — more control

| Provider | Starting price |
|----------|---------------|
| **DigitalOcean** | $4/month |
| **Linode (Akamai)** | $5/month |
| **AWS EC2** | Free tier (1 year) |
| **Hetzner** | €3.79/month |

### Deploying to Railway (example)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL="mongodb+srv://..."
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Deploying to a VPS

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone your repo
git clone https://github.com/you/your-app.git
cd your-app

# Install dependencies
npm ci --omit=dev

# Set environment variables
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="mongodb+srv://..."

# Start with PM2
npm install -g pm2
pm2 start server.js --name myapp -i max
pm2 save
pm2 startup # auto-start on reboot
```

## PM2 — process manager

PM2 keeps your app running, restarts on crashes, and manages logs:

```bash
# Start
pm2 start server.js --name myapp

# Cluster mode (use all CPUs)
pm2 start server.js --name myapp -i max

# Monitor
pm2 monit

# Logs
pm2 logs myapp

# Restart / Reload (zero-downtime)
pm2 reload myapp

# Stop
pm2 stop myapp

# Auto-start on boot
pm2 startup
pm2 save
```

## Reverse proxy with Nginx

In production, put Nginx in front of Node.js to handle SSL, static files, and load balancing:

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name myapp.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name myapp.com;

    ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t  # test config
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d myapp.com
```

## Docker

Package your app in a container for consistent deployment:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Non-root user for security
USER node

EXPOSE 3000

CMD ["node", "server.js"]
```

### .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

### Build and run

```bash
docker build -t myapp .
docker run -p 3000:3000 --env-file .env myapp
```

### Docker Compose (with MongoDB)

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

```bash
docker compose up -d
```

## CI/CD with GitHub Actions

Automate testing and deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && git pull && npm ci --omit=dev && pm2 reload myapp"
```

## Production checklist

| Area | Check |
|------|-------|
| Environment | `NODE_ENV=production`, secrets in env vars |
| Dependencies | `npm ci --omit=dev`, `npm audit` |
| Process management | PM2 or Docker (auto-restart) |
| Reverse proxy | Nginx for SSL, compression, static files |
| SSL | HTTPS with Let's Encrypt |
| Logging | Structured logs, log rotation |
| Monitoring | Health endpoint, uptime monitoring |
| Security | Helmet, rate limiting, input validation |
| Database | Connection pooling, backups |
| Error handling | Global error handler, graceful shutdown |

## Key takeaways

- Use environment variables for all configuration — never hard-code secrets.
- **PaaS** (Railway, Render) is simplest. **VPS** gives more control. **Docker** ensures consistency.
- Use **PM2** for process management: clustering, auto-restart, and logging.
- Put **Nginx** in front for SSL termination, static files, and load balancing.
- Set up **CI/CD** to automate testing and deployment on every push.
- Follow the production checklist before going live.
