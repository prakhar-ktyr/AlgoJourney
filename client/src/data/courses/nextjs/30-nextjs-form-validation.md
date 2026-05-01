---
title: Next.js Form Validation
---

# Next.js Form Validation

Form validation should happen on both the **client** (for UX) and the **server** (for security). Never trust client-side validation alone — always validate on the server.

## Server-side validation with Zod

Zod is the most popular validation library for Next.js:

```bash
npm install zod
```

### Define a schema

```javascript
// src/lib/schemas.js
import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["tech", "life", "news"], {
    errorMap: () => ({ message: "Select a valid category" }),
  }),
});

export const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.coerce.number().min(13, "Must be at least 13").max(120, "Invalid age"),
});
```

### Validate in a Server Action

```javascript
// src/app/actions.js
"use server";

import { PostSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createPost(prevState, formData) {
  const result = PostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.post.create({ data: result.data });
  revalidatePath("/blog");
  return { success: true };
}
```

### Display errors in the form

```javascript
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

export default function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <div>
        <label>Title</label>
        <input name="title" />
        {state?.errors?.title && (
          <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label>Content</label>
        <textarea name="content" />
        {state?.errors?.content && (
          <p className="text-red-500 text-sm">{state.errors.content[0]}</p>
        )}
      </div>

      <div>
        <label>Category</label>
        <select name="category">
          <option value="">Select...</option>
          <option value="tech">Tech</option>
          <option value="life">Life</option>
          <option value="news">News</option>
        </select>
        {state?.errors?.category && (
          <p className="text-red-500 text-sm">{state.errors.category[0]}</p>
        )}
      </div>

      {state?.success && (
        <p className="text-green-500">Post created successfully!</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

## Client-side validation (HTML5)

Use native HTML validation for instant feedback:

```javascript
<input name="email" type="email" required />
<input name="age" type="number" min={13} max={120} required />
<input name="name" minLength={2} maxLength={50} required />
<select name="category" required>
  <option value="">Select...</option>
</select>
```

## Client-side validation (custom)

```javascript
"use client";

import { useState } from "react";

export default function ContactForm({ action }) {
  const [errors, setErrors] = useState({});

  function validate(formData) {
    const newErrors = {};
    const email = formData.get("email");
    const message = formData.get("message");

    if (!email || !email.includes("@")) {
      newErrors.email = "Valid email is required";
    }
    if (!message || message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  }

  async function handleSubmit(formData) {
    const clientErrors = validate(formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    // Still validates on the server via the action
    await action(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      <textarea name="message" />
      {errors.message && <p className="text-red-500">{errors.message}</p>}

      <button type="submit">Send</button>
    </form>
  );
}
```

## Zod form data parsing helpers

```javascript
// Coerce form data types
const Schema = z.object({
  name: z.string(),
  age: z.coerce.number(),         // "25" → 25
  active: z.coerce.boolean(),     // "true" → true
  date: z.coerce.date(),          // "2024-01-01" → Date
  tags: z.array(z.string()),      // multiple checkboxes
});

// Optional fields
const Schema = z.object({
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});
```

## Preserving form values on error

```javascript
"use server";

export async function createUser(prevState, formData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  const result = UserSchema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      values: rawData, // send back for re-population
    };
  }

  await db.user.create({ data: result.data });
  return { success: true };
}
```

```javascript
// In the form component
<input name="name" defaultValue={state?.values?.name || ""} />
<input name="email" defaultValue={state?.values?.email || ""} />
```

## Key takeaways

- **Always validate on the server** — client validation is for UX only.
- Use **Zod** for schema-based server validation in Server Actions.
- Use `safeParse` and return `fieldErrors` for per-field error messages.
- Use `useActionState` to access validation errors in the form component.
- Combine HTML5 validation (instant) with server validation (secure).
- Use `z.coerce` to convert form string values to the correct types.
- Preserve form values on validation error for better UX.
