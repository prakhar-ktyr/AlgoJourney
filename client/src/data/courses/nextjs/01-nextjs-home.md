---
title: Next.js Home
---

# Next.js Tutorial

Next.js is a **React framework** for building full-stack web applications. It extends React with powerful features like server-side rendering, file-based routing, and automatic code splitting — so you can build fast, SEO-friendly applications without configuring everything from scratch.

## What is Next.js?

Next.js is built on top of React. While React is a library for building user interfaces, Next.js is a **framework** that provides:

- **File-based routing** — create a file, get a route
- **Server-side rendering (SSR)** — pages render on the server for fast loads and SEO
- **Static site generation (SSG)** — pre-build pages at build time
- **API routes** — build your backend in the same project
- **Automatic code splitting** — only load the JavaScript needed for each page
- **Built-in optimizations** — images, fonts, scripts, and more

## Why Next.js?

| Feature | Plain React (Vite/CRA) | Next.js |
|---------|----------------------|---------|
| Routing | Manual (react-router) | Built-in (file-based) |
| SEO | Poor (client-only rendering) | Excellent (SSR/SSG) |
| Performance | Good | Optimized out of the box |
| Data fetching | Client-side only | Server + Client |
| API backend | Separate server needed | Built-in route handlers |
| Deployment | Static hosting | Vercel, Node.js, Docker |

## Who uses Next.js?

Next.js powers some of the world's largest websites:

- **Vercel** (creators of Next.js)
- **Netflix** (jobs portal)
- **TikTok** (web app)
- **Twitch** (marketing pages)
- **Hulu**, **Nike**, **Notion**, and many more

## Next.js versions

This course covers **Next.js 14+** with the **App Router**, which is the modern, recommended way to build Next.js applications.

| Version | Key feature |
|---------|------------|
| Next.js 9 | API routes, dynamic routing |
| Next.js 12 | Middleware, Rust compiler (SWC) |
| Next.js 13 | App Router (beta), Server Components |
| Next.js 14 | App Router (stable), Server Actions |
| Next.js 15 | Enhanced caching, Turbopack stable |

## Prerequisites

Before starting this course, you should know:

- **HTML, CSS, JavaScript** — comfortable with web fundamentals
- **React basics** — components, props, state, hooks, JSX
- **ES6+** — arrow functions, destructuring, modules, async/await
- **Node.js basics** — npm, running scripts (helpful, not required)

## What you'll learn

By the end of this course, you'll be able to:

1. Build full-stack web applications with Next.js
2. Implement file-based routing with dynamic segments
3. Choose the right rendering strategy (SSR, SSG, CSR, ISR)
4. Fetch data on the server and client
5. Handle forms with Server Actions
6. Implement authentication and protected routes
7. Optimize performance with caching, images, and fonts
8. Deploy your application to production

## How this course is structured

The course is organized into sections that build on each other:

1. **Fundamentals** — project setup, routing, layouts, styling
2. **Rendering & Data** — server/client components, data fetching, loading/error states
3. **Routing Deep Dive** — dynamic routes, route groups, middleware
4. **Forms & Mutations** — server actions, validation, revalidation
5. **State & Data Management** — context, caching, cookies
6. **Authentication & Security** — auth, sessions, protected routes
7. **Database & Backend** — Prisma, API design, edge runtime
8. **Advanced Topics** — performance, testing, deployment, TypeScript
9. **Best Practices** — project structure, production checklist

Let's get started!
