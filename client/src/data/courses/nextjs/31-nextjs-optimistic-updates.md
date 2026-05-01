---
title: Next.js Optimistic Updates
---

# Next.js Optimistic Updates

Optimistic updates let you update the UI **immediately** before the server responds, making your app feel instant. If the server request fails, the UI reverts to the previous state.

## useOptimistic hook

React's `useOptimistic` hook manages optimistic state:

```javascript
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export default function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, newTodo]
  );

  async function handleSubmit(formData) {
    const text = formData.get("text");

    // Immediately update UI
    addOptimisticTodo({
      id: crypto.randomUUID(),
      text,
      pending: true,
    });

    // Server action runs in background
    await addTodo(formData);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input name="text" placeholder="Add todo..." />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            className={todo.pending ? "opacity-50" : ""}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## How it works

1. User submits the form.
2. `addOptimisticTodo` immediately adds the item to the list (with `pending: true`).
3. The server action runs in the background.
4. When the server responds, React replaces optimistic state with the real data.
5. If the action fails, the optimistic update is automatically reverted.

## Optimistic like button

```javascript
"use client";

import { useOptimistic } from "react";
import { toggleLike } from "./actions";

export default function LikeButton({ postId, liked, likeCount }) {
  const [optimistic, setOptimistic] = useOptimistic(
    { liked, likeCount },
    (current, newLiked) => ({
      liked: newLiked,
      likeCount: current.likeCount + (newLiked ? 1 : -1),
    })
  );

  async function handleClick() {
    const newLiked = !optimistic.liked;
    setOptimistic(newLiked);
    await toggleLike(postId, newLiked);
  }

  return (
    <button onClick={handleClick}>
      {optimistic.liked ? "❤️" : "🤍"} {optimistic.likeCount}
    </button>
  );
}
```

## Optimistic delete

```javascript
"use client";

import { useOptimistic } from "react";
import { deleteItem } from "./actions";

export default function ItemList({ items }) {
  const [optimisticItems, removeOptimisticItem] = useOptimistic(
    items,
    (currentItems, removedId) =>
      currentItems.filter((item) => item.id !== removedId)
  );

  async function handleDelete(id) {
    removeOptimisticItem(id);
    await deleteItem(id);
  }

  return (
    <ul>
      {optimisticItems.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

## Optimistic toggle

```javascript
"use client";

import { useOptimistic } from "react";
import { toggleComplete } from "./actions";

export default function TodoItem({ todo }) {
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    todo,
    (current, completed) => ({ ...current, completed })
  );

  async function handleToggle() {
    const newCompleted = !optimisticTodo.completed;
    setOptimisticTodo(newCompleted);
    await toggleComplete(todo.id, newCompleted);
  }

  return (
    <li
      onClick={handleToggle}
      className={optimisticTodo.completed ? "line-through opacity-50" : ""}
    >
      {optimisticTodo.text}
    </li>
  );
}
```

## Key takeaways

- `useOptimistic` updates the UI **instantly** before the server responds.
- Pass the current state and an **update function** that produces the optimistic state.
- Optimistic state **automatically reverts** if the server action fails.
- Use a `pending` flag to visually distinguish optimistic items (e.g., lower opacity).
- Works with forms (`action`) and event handlers (`onClick`).
- Combine with Server Actions for seamless mutations.
