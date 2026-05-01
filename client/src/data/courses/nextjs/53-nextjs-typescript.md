---
title: Next.js with TypeScript
---

# Next.js with TypeScript

Next.js has first-class TypeScript support. This lesson covers TypeScript setup, typing patterns for pages, components, and API routes.

## Setup

Create a new project with TypeScript:

```bash
npx create-next-app@latest my-app --typescript
```

Or add TypeScript to an existing project:

```bash
touch tsconfig.json
npm install -D typescript @types/react @types/node
npm run dev  # Next.js auto-configures tsconfig.json
```

## Typing pages

```typescript
// src/app/blog/[slug]/page.tsx
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;

  return <h1>Post: {slug}</h1>;
}
```

## Typing layouts

```typescript
// src/app/layout.tsx
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Typing generateMetadata

```typescript
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## Typing generateStaticParams

```typescript
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

## Typing Route Handlers

```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  return NextResponse.json({ query });
}

export async function POST(request: NextRequest) {
  const body: { title: string; content: string } = await request.json();
  return NextResponse.json({ data: body }, { status: 201 });
}
```

### Dynamic route handler

```typescript
type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  return NextResponse.json({ id });
}
```

## Typing Server Actions

```typescript
// src/app/actions.ts
"use server";

type FormState = {
  errors?: { title?: string[]; content?: string[] };
  success?: boolean;
} | null;

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get("title") as string;

  if (!title) {
    return { errors: { title: ["Title is required"] } };
  }

  await db.post.create({ data: { title } });
  return { success: true };
}
```

## Typing components

```typescript
// src/components/Button.tsx
type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  onClick,
}: ButtonProps) {
  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : children}
    </button>
  );
}
```

## Typing hooks

```typescript
"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ...
}
```

## Typing context

```typescript
"use client";

import { createContext, useContext, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

## Useful Next.js types

```typescript
import type {
  Metadata,
  Viewport,
  ResolvingMetadata,
} from "next";

import type {
  NextRequest,
  NextResponse,
} from "next/server";
```

## Path aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// Now you can import like:
import { db } from "@/lib/db";
import Button from "@/components/Button";
```

## Key takeaways

- Next.js auto-configures TypeScript — just add `tsconfig.json`.
- Type `params` and `searchParams` as `Promise<>` in the App Router.
- Use `NextRequest` and `NextResponse` for Route Handlers.
- Type Server Action state with a union type for errors and success.
- Use path aliases (`@/*`) for clean imports.
- Next.js exports useful types: `Metadata`, `NextRequest`, `NextResponse`.
