---
title: Next.js Server Actions
---

# Next.js Server Actions

Server Actions let you run server-side code directly from your React components — no need to create API endpoints. They're the primary way to handle form submissions and data mutations in Next.js.

## What are Server Actions?

Server Actions are async functions that run on the **server**. They can be called from Client and Server Components, typically to handle form submissions.

```javascript
// src/app/contact/page.js
export default function ContactPage() {
  async function submitForm(formData) {
    "use server";

    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    await db.message.create({
      data: { name, email, message },
    });
  }

  return (
    <form action={submitForm}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

## The "use server" directive

Mark functions as Server Actions with `"use server"`:

### Inline in Server Components

```javascript
export default function Page() {
  async function create(formData) {
    "use server";
    // runs on the server
  }

  return <form action={create}>...</form>;
}
```

### In a separate file (recommended)

```javascript
// src/app/actions.js
"use server";

// ALL exports from this file are Server Actions
export async function createPost(formData) {
  const title = formData.get("title");
  await db.post.create({ data: { title } });
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } });
}
```

```javascript
// src/app/blog/page.js
import { createPost } from "../actions";

export default function BlogPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Using with Client Components

```javascript
// actions.js
"use server";

export async function addTodo(formData) {
  const text = formData.get("text");
  await db.todo.create({ data: { text } });
}
```

```javascript
// TodoForm.js
"use client";

import { useRef } from "react";
import { addTodo } from "./actions";

export default function TodoForm() {
  const formRef = useRef(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addTodo(formData);
        formRef.current?.reset();
      }}
    >
      <input name="text" placeholder="Add a todo..." />
      <button type="submit">Add</button>
    </form>
  );
}
```

## Passing additional arguments

Use `bind` to pass extra arguments:

```javascript
"use server";

export async function updateUser(userId, formData) {
  const name = formData.get("name");
  await db.user.update({ where: { id: userId }, data: { name } });
}
```

```javascript
import { updateUser } from "./actions";

export default function EditUser({ user }) {
  const updateWithId = updateUser.bind(null, user.id);

  return (
    <form action={updateWithId}>
      <input name="name" defaultValue={user.name} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Pending states with useFormStatus

```javascript
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export default function Form({ action }) {
  return (
    <form action={action}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

> **Important**: `useFormStatus` must be used in a component that's a **child** of the `<form>`.

## Handling return values with useActionState

```javascript
"use server";

export async function createPost(prevState, formData) {
  const title = formData.get("title");

  if (!title) {
    return { error: "Title is required" };
  }

  await db.post.create({ data: { title } });
  return { success: true };
}
```

```javascript
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

export default function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">Post created!</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

## Revalidating data after mutations

```javascript
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData) {
  await db.post.create({
    data: { title: formData.get("title") },
  });

  revalidatePath("/blog"); // refresh the blog listing
}
```

## Redirecting after mutations

```javascript
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData) {
  const post = await db.post.create({
    data: { title: formData.get("title") },
  });

  redirect(`/blog/${post.slug}`);
}
```

## Non-form usage

Server Actions can be called from event handlers too:

```javascript
"use client";

import { deletePost } from "./actions";

export default function DeleteButton({ postId }) {
  return (
    <button onClick={() => deletePost(postId)}>
      Delete
    </button>
  );
}
```

## Key takeaways

- Server Actions run on the **server** — called from forms or event handlers.
- Use `"use server"` directive to define actions (inline or in separate files).
- Pass actions to `<form action={...}>` for progressive enhancement.
- Use `useFormStatus` for pending states and `useActionState` for return values.
- Call `revalidatePath` or `revalidateTag` to refresh data after mutations.
- Use `bind` to pass extra arguments to Server Actions.
- Server Actions work without JavaScript — forms submit natively.
