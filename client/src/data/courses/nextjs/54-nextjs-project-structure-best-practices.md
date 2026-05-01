---
title: Next.js Project Structure Best Practices
---

# Next.js Project Structure Best Practices

As your Next.js application grows, a well-organized project structure becomes essential. This lesson covers proven patterns for organizing large-scale Next.js projects.

## Recommended structure

```
src/
├── app/                     # Routes and pages
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Main app route group
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── profile/
│   ├── api/                 # Route handlers
│   │   └── posts/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   └── global-error.tsx
├── components/              # Shared components
│   ├── ui/                  # Generic UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── forms/               # Form components
│       ├── LoginForm.tsx
│       └── PostForm.tsx
├── lib/                     # Utilities and shared logic
│   ├── db.ts                # Database client
│   ├── auth.ts              # Authentication
│   ├── utils.ts             # General utilities
│   └── validations.ts       # Zod schemas
├── actions/                 # Server Actions
│   ├── posts.ts
│   └── users.ts
├── hooks/                   # Custom React hooks
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
├── types/                   # TypeScript types
│   ├── index.ts
│   └── api.ts
├── config/                  # App configuration
│   └── site.ts
└── styles/                  # Global styles
    └── globals.css
```

## Key principles

### 1. Colocation

Keep related files close together:

```
src/app/dashboard/
├── page.tsx                 # Page component
├── loading.tsx              # Loading UI
├── error.tsx                # Error boundary
├── actions.ts               # Server Actions for this page
└── components/              # Components used ONLY by this page
    ├── StatsCard.tsx
    └── RecentActivity.tsx
```

Files used by only one page stay with that page. Files used across pages go in `src/components/`.

### 2. Feature-based organization

Group by feature, not by file type:

```
// ❌ Grouped by type (hard to navigate at scale)
components/
├── PostCard.tsx
├── PostForm.tsx
├── UserCard.tsx
├── UserForm.tsx

// ✅ Grouped by feature
features/
├── posts/
│   ├── PostCard.tsx
│   ├── PostForm.tsx
│   ├── actions.ts
│   └── types.ts
├── users/
│   ├── UserCard.tsx
│   ├── UserForm.tsx
│   ├── actions.ts
│   └── types.ts
```

### 3. Barrel exports

Use `index.ts` files for clean imports:

```typescript
// src/components/ui/index.ts
export { default as Button } from "./Button";
export { default as Input } from "./Input";
export { default as Card } from "./Card";
export { default as Modal } from "./Modal";
```

```typescript
// Usage
import { Button, Input, Card } from "@/components/ui";
```

### 4. Separate server and client code

```
src/
├── lib/                     # Server-side utilities
│   ├── db.ts                # import "server-only"
│   ├── dal.ts               # Data Access Layer
│   └── auth.ts
├── hooks/                   # Client-side hooks
│   └── useDebounce.ts
├── utils/                   # Shared utilities (both sides)
│   ├── format.ts
│   └── validate.ts
```

## Route organization patterns

### Route groups for layouts

```
app/
├── (marketing)/             # Marketing layout
│   ├── layout.tsx
│   ├── page.tsx             # /
│   ├── about/               # /about
│   └── pricing/             # /pricing
├── (app)/                   # App layout (with sidebar)
│   ├── layout.tsx
│   ├── dashboard/           # /dashboard
│   └── settings/            # /settings
├── (auth)/                  # Auth layout (centered)
│   ├── layout.tsx
│   ├── login/               # /login
│   └── register/            # /register
```

### API route organization

```
app/api/
├── posts/
│   ├── route.ts             # GET /api/posts, POST /api/posts
│   └── [id]/
│       └── route.ts         # GET/PUT/DELETE /api/posts/:id
├── users/
│   └── route.ts
└── webhooks/
    └── stripe/
        └── route.ts
```

## Naming conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` | `useDebounce.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User`, `PostWithAuthor` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Server Actions | camelCase with verb | `createPost`, `deleteUser` |
| Route files | lowercase | `page.tsx`, `layout.tsx`, `route.ts` |

## Configuration file

```typescript
// src/config/site.ts
export const siteConfig = {
  name: "My App",
  description: "A Next.js application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/username/repo",
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ],
};
```

## Key takeaways

- **Colocate** files that change together — page-specific components go with the page.
- Use **route groups** `()` to organize routes without affecting URLs.
- **Feature-based** organization scales better than type-based.
- Keep a clear boundary between **server** (`lib/`) and **client** (`hooks/`) code.
- Use **barrel exports** (`index.ts`) for cleaner imports.
- Establish **naming conventions** and stick to them across the team.
- Start simple and refactor as the project grows — don't over-engineer upfront.
