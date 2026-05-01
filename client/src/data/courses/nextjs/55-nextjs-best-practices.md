---
title: Next.js Best Practices
---

# Next.js Best Practices

This final lesson compiles the most important best practices for building production-ready Next.js applications. Use it as a reference checklist.

## Rendering

- **Default to Server Components** — only add `"use client"` when you need interactivity.
- Push `"use client"` down to the **smallest interactive leaf** components.
- Use the **children pattern** to nest Server Components inside Client Components.
- Use `<Suspense>` boundaries for **streaming** — never make users wait for the entire page.
- Choose the right rendering strategy: SSG for static, ISR for periodic updates, SSR for personalized content.

## Data fetching

- Fetch data in **Server Components** — avoid `useEffect` for initial data loads.
- Use `Promise.all()` for **parallel data fetching** — avoid waterfalls.
- **Tag your fetches** with `next: { tags: [...] }` for granular revalidation.
- Use React `cache()` for **memoizing** non-fetch data functions.
- Always **revalidate** after mutations with `revalidatePath` or `revalidateTag`.

## Performance

- Use `next/image` for all images — add `priority` for above-the-fold images.
- Use `next/font` for fonts — eliminates layout shift.
- **Lazy load** heavy components with `dynamic()`.
- Analyze bundles periodically with `@next/bundle-analyzer`.
- Keep Server Components as the default — they ship **zero JavaScript**.

## Security

- **Never expose secrets** via `NEXT_PUBLIC_` environment variables.
- **Always validate input** on the server with Zod or similar.
- Use `import "server-only"` on files containing sensitive logic.
- Set security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- Use `httpOnly`, `secure`, and `sameSite` flags on all cookies.
- Check authentication **and** authorization in every Server Action and Route Handler.

## Authentication

- Use **middleware** for route-level auth checks — runs before rendering.
- Implement **defense in depth**: check auth in middleware AND in Server Components/Actions.
- Store session tokens in **httpOnly cookies** — never in localStorage.
- Implement **RBAC** with a reusable `requireRole()` helper.

## Forms and mutations

- Use **Server Actions** for form submissions — built-in CSRF protection and progressive enhancement.
- Use `useActionState` for form state management (errors, pending, success).
- Use `useFormStatus` for submit button loading states.
- Use `useOptimistic` for instant UI feedback on mutations.
- Validate with **Zod** on the server, HTML5 validation on the client.

## Caching

- Understand the **four caching layers**: Request Memoization, Data Cache, Full Route Cache, Router Cache.
- Use `cache: "no-store"` only when you need real-time data.
- Set appropriate `revalidate` values — don't over-cache or under-cache.
- Use `revalidateTag` for fine-grained cache invalidation.

## Project structure

- **Colocate** page-specific components with their page.
- Use **route groups** `()` for organizing layouts without affecting URLs.
- Create a **Data Access Layer** (`lib/dal.ts`) with `server-only`.
- Use **path aliases** (`@/`) for clean imports.
- Keep a clear separation between server code (`lib/`) and client code (`hooks/`).

## Error handling

- Create `error.js` files for automatic error boundaries.
- Use `not-found.js` and `notFound()` for 404 handling.
- Return error objects from Server Actions — don't throw in most cases.
- Use `global-error.js` for root layout errors.
- Log errors to a monitoring service (Sentry, LogRocket, etc.).

## TypeScript

- Use TypeScript for all new projects — Next.js has first-class support.
- Type page `params` and `searchParams` as `Promise<>`.
- Type Server Action state with a discriminated union.
- Use `satisfies` for type-safe configuration objects.

## Deployment

- Test the **production build** locally before deploying (`npm run build && npm run start`).
- Set all **environment variables** in the deployment platform.
- Use **preview deployments** for PRs (Vercel does this automatically).
- Set up **error monitoring** and **logging** from day one.
- Configure **health checks** for production monitoring.

## Common mistakes to avoid

| Mistake | Fix |
|---------|-----|
| Making everything `"use client"` | Default to Server Components |
| Fetching data with `useEffect` | Fetch in Server Components |
| Not revalidating after mutations | Always call `revalidatePath`/`revalidateTag` |
| Putting secrets in `NEXT_PUBLIC_` | Use server-only env vars |
| Not validating server input | Always validate with Zod |
| One giant Client Component | Split into small interactive leaves |
| Not using `<Suspense>` | Wrap slow sections for streaming |
| Ignoring TypeScript errors | Fix them — they prevent bugs |

## What's next?

Now that you've completed this course, you're equipped to build production-ready Next.js applications. Here are some areas to explore further:

- **Next.js documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **React Server Components**: deep dive into the RSC architecture
- **Partial Prerendering (PPR)**: the future of Next.js rendering
- **AI integration**: using the AI SDK with Next.js
- **Real-time features**: WebSockets, Server-Sent Events
- **Monorepo setup**: Turborepo for large projects
- **Advanced caching**: custom cache handlers and strategies

Build projects, experiment with features, and refer back to these lessons when you need a refresher. Happy coding!
