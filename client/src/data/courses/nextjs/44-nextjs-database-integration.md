---
title: Next.js Database Integration
---

# Next.js Database Integration

Next.js Server Components can query databases directly — no API layer needed. This lesson covers integrating popular ORMs and databases.

## Prisma setup

Prisma is the most popular ORM for Next.js:

```bash
npm install prisma @prisma/client
npx prisma init
```

### Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Database client singleton

```javascript
// src/lib/db.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

The singleton prevents creating multiple Prisma clients during hot reload in development.

## Querying in Server Components

```javascript
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

## Mutations with Server Actions

```javascript
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(formData) {
  await db.post.create({
    data: {
      title: formData.get("title"),
      content: formData.get("content"),
      authorId: formData.get("authorId"),
    },
  });

  revalidatePath("/blog");
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } });
  revalidatePath("/blog");
}
```

## Drizzle ORM alternative

Drizzle is a lighter, SQL-first ORM:

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

```javascript
// src/lib/schema.js
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

```javascript
// src/lib/db.js
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

```javascript
// Usage
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";

const allPosts = await db.select().from(posts).where(eq(posts.published, true));
```

## MongoDB with Mongoose

```javascript
// src/lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}
```

## Connection pooling

For serverless environments (Vercel), use connection pooling:

```bash
# Use a pooled connection URL
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/db?pgbouncer=true"

# Direct URL for migrations
DIRECT_URL="postgresql://user:pass@db.supabase.com:5432/db"
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Key takeaways

- Server Components can query databases **directly** — no API needed.
- Use a **singleton pattern** for the DB client to avoid hot-reload issues.
- **Prisma**: full-featured ORM with schema migrations and type safety.
- **Drizzle**: lightweight, SQL-first alternative.
- Use **connection pooling** for serverless deployments.
- Always put database code in Server Components or Server Actions — never on the client.
