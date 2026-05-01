---
title: Security Best Practices
---

# Security Best Practices

GraphQL's flexibility introduces unique security challenges. This lesson covers how to protect your API.

---

## Security Checklist

- [ ] Query depth limiting
- [ ] Query complexity analysis
- [ ] Rate limiting (HTTP + query-level)
- [ ] Authentication on sensitive fields
- [ ] Authorization (role + ownership)
- [ ] Input validation and sanitization
- [ ] Disable introspection in production
- [ ] Persisted queries for public APIs
- [ ] Error masking (no stack traces)
- [ ] HTTPS everywhere
- [ ] CORS configuration

---

## Disable Introspection in Production

Introspection reveals your entire schema:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});
```

---

## Error Masking

Never expose internal details:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Log full error internally
    console.error(error);

    // Return safe error to client
    if (error.extensions?.code) return error; // Known errors pass through
    return {
      message: "An unexpected error occurred",
      extensions: { code: "INTERNAL_ERROR" },
    };
  },
});
```

---

## Prevent Injection

```javascript
// ❌ String interpolation (SQL/NoSQL injection)
const user = await db.query(`SELECT * FROM users WHERE id = '${args.id}'`);

// ✅ Parameterized queries
const user = await db.query("SELECT * FROM users WHERE id = $1", [args.id]);

// ✅ Mongoose (safe by default)
const user = await User.findById(args.id);
```

---

## Batch Attack Prevention

```javascript
// Limit array sizes in input
input CreateOrderInput {
  items: [OrderItemInput!]!  # Could be 10,000 items!
}

// Validate in resolver
if (input.items.length > 50) {
  throw new GraphQLError("Maximum 50 items per order");
}
```

---

## Field-Level Security

Hide sensitive fields based on context:

```javascript
User: {
  email: (parent, _, { user }) => {
    // Only the user themselves or admins can see email
    if (user?.id === parent.id || user?.role === "ADMIN") {
      return parent.email;
    }
    return null;
  },
  password: () => { throw new Error("Field not accessible"); },
}
```

---

## CORS Configuration

```javascript
app.use(cors({
  origin: ["https://myapp.com", "https://admin.myapp.com"],
  credentials: true,
}));
```

---

## Key Takeaways

- **Disable introspection** in production
- **Limit depth and complexity** to prevent resource exhaustion
- **Mask errors** — never expose stack traces or DB details
- Use **parameterized queries** — never interpolate user input
- Apply **field-level** auth for sensitive data
- Combine all protections: rate limit + depth + complexity + auth

---

Next, we'll learn about **DataLoader & Batching** — solving the N+1 problem →
