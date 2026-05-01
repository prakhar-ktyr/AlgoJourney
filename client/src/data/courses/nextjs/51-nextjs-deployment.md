---
title: Next.js Deployment
---

# Next.js Deployment

Next.js can be deployed to various platforms. This lesson covers the most popular options and their trade-offs.

## Vercel (recommended)

Vercel is built by the Next.js team and provides the smoothest experience:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo on [vercel.com](https://vercel.com) for automatic deployments on every push.

**Features**: Automatic preview deployments, edge functions, image optimization, analytics, serverless functions, ISR support.

### Configuration

```javascript
// next.config.js — no special config needed for Vercel
const nextConfig = {};
export default nextConfig;
```

Set environment variables in the Vercel dashboard under Project Settings → Environment Variables.

## Self-hosting with Node.js

### Build and start

```bash
npm run build    # creates .next/ directory
npm run start    # starts production server on port 3000
```

### With PM2 (process manager)

```bash
npm install -g pm2
pm2 start npm --name "nextjs" -- start
pm2 save
pm2 startup    # auto-start on reboot
```

### Custom server port

```bash
PORT=8080 npm run start
```

## Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

Enable standalone output in config:

```javascript
// next.config.js
const nextConfig = {
  output: "standalone",
};
export default nextConfig;
```

```bash
docker build -t my-nextjs-app .
docker run -p 3000:3000 my-nextjs-app
```

## Static export

For sites without server-side features:

```javascript
// next.config.js
const nextConfig = {
  output: "export",
};
export default nextConfig;
```

```bash
npm run build
# Output in /out directory — deploy to any static host
```

**Limitations**: No Server Components, no API routes, no ISR, no middleware, no image optimization.

Deploy to: GitHub Pages, Netlify, Cloudflare Pages, S3 + CloudFront.

## Other platforms

### Netlify

```bash
npm install -D @netlify/plugin-nextjs
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### AWS Amplify

Connect your repository in the Amplify console. It auto-detects Next.js.

### Cloudflare Pages

```bash
npm install -D @cloudflare/next-on-pages
```

Uses Edge Runtime — some Node.js APIs may not be available.

## Environment variables in production

| Platform | How to set |
|----------|-----------|
| Vercel | Dashboard → Settings → Environment Variables |
| Docker | `docker run -e DATABASE_URL=...` or `.env` file |
| PM2 | `ecosystem.config.js` or `.env` file |
| Netlify | Dashboard → Site settings → Environment |

## Build optimization

```javascript
// next.config.js
const nextConfig = {
  // Reduce bundle size
  reactStrictMode: true,

  // Standalone output for Docker
  output: "standalone",

  // Compress responses
  compress: true,

  // Disable source maps in production
  productionBrowserSourceMaps: false,
};
```

## Deployment checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure all environment variables
- [ ] Run `npm run build` successfully
- [ ] Test the production build locally (`npm run start`)
- [ ] Set up HTTPS (TLS/SSL)
- [ ] Configure a CDN for static assets
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure logging
- [ ] Set up health checks
- [ ] Configure automatic deployments (CI/CD)

## Key takeaways

- **Vercel**: easiest deployment, full Next.js feature support.
- **Docker**: best for self-hosting with full control.
- **Static export**: for sites without server features — deploy anywhere.
- Use `output: "standalone"` for Docker deployments.
- Use `output: "export"` for static hosting.
- Always test the production build locally before deploying.
