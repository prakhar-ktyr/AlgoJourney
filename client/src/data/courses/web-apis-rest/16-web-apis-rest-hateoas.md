---
title: HATEOAS
---

# HATEOAS

**HATEOAS** (Hypermedia As The Engine Of Application State) is the final sub-constraint of REST's Uniform Interface. It means API responses should include **links** that tell the client what it can do next.

---

## The Concept

Instead of the client knowing all possible API endpoints upfront, the server **guides** the client by including links in every response:

```json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "links": {
    "self": { "href": "/api/users/42", "method": "GET" },
    "update": { "href": "/api/users/42", "method": "PUT" },
    "delete": { "href": "/api/users/42", "method": "DELETE" },
    "posts": { "href": "/api/users/42/posts", "method": "GET" }
  }
}
```

The client doesn't hard-code URLs — it follows links from the response.

---

## Why HATEOAS?

Think of how you browse the web:

1. You go to `google.com` (the entry point)
2. You see links on the page
3. You click a link to navigate
4. The new page has more links

You don't memorize URLs — you follow links. HATEOAS brings this to APIs.

**Benefits:**
- **Discoverability**: Clients can explore the API by following links
- **Decoupling**: Server can change URLs without breaking clients
- **Self-documentation**: Responses tell you what's possible
- **State-driven**: Links change based on the resource's state

---

## Practical Example

### Without HATEOAS

```json
{
  "id": 100,
  "status": "pending",
  "total": 59.99
}
```

The client must **know** that pending orders can be approved or cancelled, and **hard-code** those endpoints.

### With HATEOAS

```json
{
  "id": 100,
  "status": "pending",
  "total": 59.99,
  "links": {
    "self": "/api/orders/100",
    "approve": "/api/orders/100/approve",
    "cancel": "/api/orders/100/cancel",
    "items": "/api/orders/100/items"
  }
}
```

After the order is approved:

```json
{
  "id": 100,
  "status": "approved",
  "total": 59.99,
  "links": {
    "self": "/api/orders/100",
    "ship": "/api/orders/100/ship",
    "items": "/api/orders/100/items"
  }
}
```

Notice: `approve` and `cancel` links are **gone** (no longer valid actions). `ship` link **appeared** (now valid).

---

## Implementation

```javascript
app.get("/api/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });

  const links = {
    self: `/api/orders/${order.id}`,
    items: `/api/orders/${order.id}/items`,
  };

  // Add links based on current state
  if (order.status === "pending") {
    links.approve = `/api/orders/${order.id}/approve`;
    links.cancel = `/api/orders/${order.id}/cancel`;
  }
  if (order.status === "approved") {
    links.ship = `/api/orders/${order.id}/ship`;
  }
  if (order.status === "shipped") {
    links.track = `/api/orders/${order.id}/tracking`;
  }

  res.json({
    id: order.id,
    status: order.status,
    total: order.total,
    links,
  });
});
```

### Collection with Pagination Links

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "links": {
    "self": "/api/users?page=2&limit=20",
    "first": "/api/users?page=1&limit=20",
    "prev": "/api/users?page=1&limit=20",
    "next": "/api/users?page=3&limit=20",
    "last": "/api/users?page=8&limit=20"
  },
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150
  }
}
```

---

## HATEOAS in the Real World

Most real-world APIs implement **partial HATEOAS** — including pagination links and self links, but not full hypermedia:

**GitHub API** (partial HATEOAS):
```json
{
  "login": "octocat",
  "url": "https://api.github.com/users/octocat",
  "repos_url": "https://api.github.com/users/octocat/repos",
  "followers_url": "https://api.github.com/users/octocat/followers"
}
```

**Stripe API** (minimal links):
```json
{
  "id": "ch_123",
  "object": "charge",
  "url": "/v1/charges/ch_123"
}
```

Full HATEOAS is Level 3 on the Richardson Maturity Model. Most APIs are at Level 2 and do fine.

---

## Key Takeaways

- **HATEOAS** means including navigational **links** in API responses
- Links change based on the resource's **current state**
- It enables **discoverability** and reduces client-server coupling
- Most real APIs implement **partial HATEOAS** (pagination links, self links)
- Full HATEOAS is ideal but pragmatism wins — Level 2 REST is usually sufficient

---

Next, we'll compare **REST vs SOAP** — understanding the alternative →
