---
title: Optimistic Updates
---

# Optimistic Updates

Optimistic updates make your UI feel instant by updating the cache **before** the server responds.

---

## How It Works

```
1. User clicks "Like"
2. UI immediately shows the like (optimistic)
3. Mutation sent to server
4. Server confirms → keep the update
   Server fails → rollback to previous state
```

---

## Basic Example

```jsx
const TOGGLE_LIKE = gql`
  mutation ToggleLike($postId: ID!) {
    toggleLike(postId: $postId) {
      id
      isLiked
      likeCount
    }
  }
`;

function LikeButton({ post }) {
  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    optimisticResponse: {
      toggleLike: {
        __typename: "Post",
        id: post.id,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      },
    },
  });

  return (
    <button onClick={() => toggleLike({ variables: { postId: post.id } })}>
      {post.isLiked ? "❤️" : "🤍"} {post.likeCount}
    </button>
  );
}
```

The like count updates **immediately** — no loading spinner needed.

---

## Adding to a List

```jsx
const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $text: String!) {
    createComment(postId: $postId, text: $text) {
      id
      text
      author { id, name }
      createdAt
    }
  }
`;

function AddComment({ postId, currentUser }) {
  const [createComment] = useMutation(CREATE_COMMENT, {
    optimisticResponse: {
      createComment: {
        __typename: "Comment",
        id: `temp-${Date.now()}`,  // Temporary ID
        text: commentText,
        author: {
          __typename: "User",
          id: currentUser.id,
          name: currentUser.name,
        },
        createdAt: new Date().toISOString(),
      },
    },
    update(cache, { data: { createComment } }) {
      // Add new comment to the post's comment list
      cache.modify({
        id: `Post:${postId}`,
        fields: {
          comments(existing = []) {
            const newRef = cache.writeFragment({
              data: createComment,
              fragment: gql`
                fragment NewComment on Comment {
                  id text author { id name } createdAt
                }
              `,
            });
            return [...existing, newRef];
          },
        },
      });
    },
  });
}
```

---

## Deletion

```jsx
const [deletePost] = useMutation(DELETE_POST, {
  optimisticResponse: { deletePost: { __typename: "Post", id: postId } },
  update(cache) {
    cache.evict({ id: `Post:${postId}` });
    cache.gc();
  },
});
```

The post disappears from the UI immediately.

---

## Rollback on Error

Apollo handles rollback automatically:

1. Optimistic response applied to cache
2. Mutation sent to server
3. If server returns **success** → optimistic data replaced with real data
4. If server returns **error** → optimistic data removed, cache reverts

No manual rollback code needed.

---

## When to Use Optimistic Updates

| Action | Use Optimistic? | Why |
|--------|----------------|-----|
| Like/Unlike | ✅ Yes | Instant feedback, predictable |
| Add comment | ✅ Yes | Instant, but use temp ID |
| Delete | ✅ Yes | Instant removal |
| Create complex entity | ⚠️ Maybe | Server may generate fields |
| Payment | ❌ No | Must confirm before showing |

---

## Key Takeaways

- Optimistic updates make UI feel **instant**
- Provide `optimisticResponse` with the expected mutation result
- Apollo **auto-rolls back** on server error
- Use temporary IDs for new entities (replaced by real IDs from server)
- Best for **predictable** mutations (likes, comments, deletes)

---

Next, we'll learn about **Client Error Handling** →
