---
title: "Idempotency"
---

# Idempotency

Idempotency is one of the most important concepts in distributed systems. An operation is **idempotent** if performing it multiple times produces the same result as performing it once.

---

## Why Idempotency Matters

In distributed systems, failures are inevitable. Networks drop packets, services crash mid-request, and clients retry operations. Without idempotency, retries can cause unintended side effects.

| Problem | Without Idempotency | With Idempotency |
|---------|---------------------|------------------|
| Network timeout | Payment charged twice | Payment charged once |
| Client retry | Duplicate order created | Same order returned |
| Message replay | Counter incremented multiple times | Counter set to correct value |
| Crash recovery | Partial state corruption | Consistent final state |

### Real-World Consequences

```
Client → Server: "Transfer $100 from A to B"
         ↓ (timeout, no response received)
Client → Server: "Transfer $100 from A to B"  (retry)

Without idempotency: $200 transferred!
With idempotency:    $100 transferred (correct)
```

---

## Idempotent vs Non-Idempotent Operations

### Naturally Idempotent Operations

These operations produce the same result regardless of how many times they are executed:

```
// Setting a value (absolute assignment)
SET user.name = "Alice"       // Always results in name = "Alice"

// Deleting a resource
DELETE /users/123             // User gone after first call, no-op after

// Reading data
GET /users/123               // Same response every time (if no changes)

// Replacing a resource entirely
PUT /users/123 { "name": "Alice", "age": 30 }  // Same state every time
```

### Non-Idempotent Operations

These operations produce different results on each execution:

```
// Incrementing a counter
POST /counter/increment      // 1, 2, 3, 4... different each time

// Appending to a list
POST /messages { "text": "Hello" }  // Creates new message each time

// Generating unique IDs
POST /orders                 // New order with new ID each time

// Relative updates
UPDATE accounts SET balance = balance + 100  // Grows with each call
```

---

## HTTP Methods and Idempotency

The HTTP specification defines idempotency for standard methods:

| Method | Idempotent | Safe | Description |
|--------|-----------|------|-------------|
| GET | Yes | Yes | Retrieve a resource |
| HEAD | Yes | Yes | Retrieve headers only |
| OPTIONS | Yes | Yes | Retrieve allowed methods |
| PUT | Yes | No | Replace a resource entirely |
| DELETE | Yes | No | Remove a resource |
| POST | **No** | No | Create a resource or trigger action |
| PATCH | **No** | No | Partial update (depends on implementation) |

### Why PUT is Idempotent but POST is Not

```javascript
// PUT: Replaces entire resource — same result every time
PUT /users/42
{ "name": "Alice", "email": "alice@example.com" }
// Result: User 42 is always { name: "Alice", email: "alice@example.com" }

// POST: Creates new resource — different result each time
POST /users
{ "name": "Alice", "email": "alice@example.com" }
// First call:  Creates user 101
// Second call: Creates user 102 (duplicate!)
```

### Making PATCH Idempotent

```javascript
// Non-idempotent PATCH (relative update)
PATCH /accounts/1
{ "op": "increment", "field": "balance", "value": 100 }

// Idempotent PATCH (absolute update)
PATCH /accounts/1
{ "op": "replace", "field": "balance", "value": 500 }
```

---

## Idempotency Keys

An **idempotency key** is a unique identifier that clients attach to requests so servers can detect and deduplicate retries.

### How Idempotency Keys Work

```
┌────────┐                           ┌────────┐
│ Client │                           │ Server │
└───┬────┘                           └───┬────┘
    │                                    │
    │  POST /payments                    │
    │  Idempotency-Key: abc-123          │
    │  { amount: 100 }                   │
    │───────────────────────────────────→│
    │                                    │ Process payment
    │         200 OK                     │ Store result with key "abc-123"
    │←───────────────────────────────────│
    │                                    │
    │  (timeout — client didn't get response)
    │                                    │
    │  POST /payments (RETRY)            │
    │  Idempotency-Key: abc-123          │
    │───────────────────────────────────→│
    │                                    │ Key "abc-123" found!
    │         200 OK (cached response)   │ Return stored result
    │←───────────────────────────────────│
```

### Generating Idempotency Keys

```javascript
// Option 1: UUID v4 (most common)
const idempotencyKey = crypto.randomUUID();
// "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Option 2: Deterministic key from business context
const idempotencyKey = `order-${userId}-${cartId}-${timestamp}`;
// "order-42-cart-789-1706745600"

// Option 3: Hash of request payload
const idempotencyKey = sha256(JSON.stringify(requestBody));
// "a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4"
```

### Client-Side Implementation

```javascript
class IdempotentClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.pendingKeys = new Map();
  }

  async createPayment(amount, currency) {
    // Generate key before first attempt
    const idempotencyKey = crypto.randomUUID();

    return this.retryWithKey("/payments", {
      method: "POST",
      body: { amount, currency },
      idempotencyKey,
      maxRetries: 3,
    });
  }

  async retryWithKey(path, { method, body, idempotencyKey, maxRetries }) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 409) {
          // Key already used with different parameters
          throw new Error("Idempotency key conflict");
        }

        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await this.backoff(attempt);
      }
    }
  }

  backoff(attempt) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
```

---

## Implementing Server-Side Idempotency

### Deduplication Table Pattern

```sql
CREATE TABLE idempotency_keys (
  key         VARCHAR(255) PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  request_path VARCHAR(500) NOT NULL,
  request_body JSONB,
  response_code INTEGER,
  response_body JSONB,
  created_at  TIMESTAMP DEFAULT NOW(),
  expires_at  TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
```

### Server Handler Implementation

```javascript
async function handlePayment(req, res) {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency-Key header required" });
  }

  // Step 1: Check for existing result
  const existing = await db.query(
    "SELECT response_code, response_body FROM idempotency_keys WHERE key = $1 AND user_id = $2",
    [idempotencyKey, req.userId]
  );

  if (existing.rows.length > 0) {
    const { response_code, response_body } = existing.rows[0];

    if (response_body === null) {
      // Request is still being processed
      return res.status(409).json({ error: "Request in progress" });
    }

    // Return cached response
    return res.status(response_code).json(response_body);
  }

  // Step 2: Lock the key (mark as in-progress)
  try {
    await db.query(
      "INSERT INTO idempotency_keys (key, user_id, request_path, request_body) VALUES ($1, $2, $3, $4)",
      [idempotencyKey, req.userId, req.path, req.body]
    );
  } catch (error) {
    if (error.code === "23505") {
      // Race condition: another request locked the key
      return res.status(409).json({ error: "Request in progress" });
    }
    throw error;
  }

  // Step 3: Process the request
  try {
    const result = await processPayment(req.body);

    // Step 4: Store the result
    await db.query(
      "UPDATE idempotency_keys SET response_code = $1, response_body = $2 WHERE key = $3",
      [201, result, idempotencyKey]
    );

    return res.status(201).json(result);
  } catch (error) {
    // Remove key on failure so client can retry
    await db.query("DELETE FROM idempotency_keys WHERE key = $1", [idempotencyKey]);
    throw error;
  }
}
```

---

## Exactly-Once Semantics Through Idempotency

True exactly-once delivery is impossible in distributed systems. Instead, we achieve **effectively-once** processing:

```
At-most-once:  Fire and forget (may lose messages)
At-least-once: Retry until acknowledged (may duplicate)
Exactly-once:  Impossible to guarantee in theory

At-least-once + Idempotency = Effectively-once ✓
```

### The Formula

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Effectively-Once = At-Least-Once + Idempotent  │
│                      Delivery        Processing │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementation Strategy

```javascript
class ExactlyOnceProcessor {
  constructor(db) {
    this.db = db;
  }

  async processMessage(message) {
    const messageId = message.id;

    // Check if already processed
    const processed = await this.db.query(
      "SELECT result FROM processed_messages WHERE message_id = $1",
      [messageId]
    );

    if (processed.rows.length > 0) {
      return processed.rows[0].result; // Already done
    }

    // Process within transaction
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // Double-check with row lock
      const locked = await client.query(
        "SELECT message_id FROM processed_messages WHERE message_id = $1 FOR UPDATE",
        [messageId]
      );

      if (locked.rows.length > 0) {
        await client.query("ROLLBACK");
        return locked.rows[0].result;
      }

      // Perform business logic
      const result = await this.execute(message, client);

      // Mark as processed
      await client.query(
        "INSERT INTO processed_messages (message_id, result, processed_at) VALUES ($1, $2, NOW())",
        [messageId, JSON.stringify(result)]
      );

      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
```

---

## Database-Level Idempotency

### Upserts (INSERT ... ON CONFLICT)

```sql
-- Idempotent: same result regardless of how many times executed
INSERT INTO user_preferences (user_id, theme, language)
VALUES (42, 'dark', 'en')
ON CONFLICT (user_id)
DO UPDATE SET theme = EXCLUDED.theme, language = EXCLUDED.language;

-- Idempotent: only updates if value actually changes
INSERT INTO inventory (product_id, quantity)
VALUES (101, 50)
ON CONFLICT (product_id)
DO UPDATE SET quantity = EXCLUDED.quantity
WHERE inventory.quantity != EXCLUDED.quantity;
```

### Conditional Writes (Optimistic Locking)

```sql
-- Only update if version matches (prevents double-processing)
UPDATE orders
SET status = 'shipped', version = version + 1
WHERE order_id = 123 AND version = 5;

-- If 0 rows affected, the update was already applied
```

### MongoDB Equivalent

```javascript
// Upsert — idempotent by nature
await db.collection("payments").updateOne(
  { paymentId: "pay_abc123" },
  {
    $set: {
      amount: 100,
      status: "completed",
      processedAt: new Date(),
    },
  },
  { upsert: true }
);

// Conditional write — only transition once
await db.collection("orders").updateOne(
  { orderId: "ord_456", status: "pending" },
  { $set: { status: "confirmed", confirmedAt: new Date() } }
);
```

---

## Message Processing Idempotency

### Kafka Consumer with Idempotency

```javascript
class IdempotentConsumer {
  constructor(db, topic) {
    this.db = db;
    this.topic = topic;
  }

  async handleMessage(message) {
    const offsetKey = `${this.topic}-${message.partition}-${message.offset}`;

    // Use offset as natural idempotency key
    const alreadyProcessed = await this.db.query(
      "SELECT 1 FROM consumed_offsets WHERE offset_key = $1",
      [offsetKey]
    );

    if (alreadyProcessed.rows.length > 0) {
      console.log(`Skipping duplicate message: ${offsetKey}`);
      return;
    }

    await this.db.transaction(async (tx) => {
      // Process business logic
      await this.processBusinessLogic(message.value, tx);

      // Record consumption
      await tx.query(
        "INSERT INTO consumed_offsets (offset_key, processed_at) VALUES ($1, NOW())",
        [offsetKey]
      );
    });
  }
}
```

### RabbitMQ with Deduplication

```javascript
async function consumeWithDedup(channel, queue, handler) {
  channel.consume(queue, async (msg) => {
    const messageId = msg.properties.messageId;

    if (!messageId) {
      channel.nack(msg, false, false); // Reject: no dedup possible
      return;
    }

    const isDuplicate = await redis.set(
      `dedup:${messageId}`,
      "1",
      "NX",  // Only set if not exists
      "EX",  // Expire
      86400  // 24 hours
    );

    if (!isDuplicate) {
      // Already processed
      channel.ack(msg);
      return;
    }

    try {
      await handler(JSON.parse(msg.content));
      channel.ack(msg);
    } catch (error) {
      // Remove dedup key on failure to allow retry
      await redis.del(`dedup:${messageId}`);
      channel.nack(msg, false, true); // Requeue
    }
  });
}
```

---

## Stripe's Idempotency Key Pattern

Stripe popularized the idempotency key pattern for payment APIs. Their approach is considered a gold standard:

### How Stripe Implements It

```javascript
// Client sends idempotency key with request
const charge = await stripe.charges.create(
  { amount: 2000, currency: "usd", source: "tok_visa" },
  { idempotencyKey: "order-42-charge-attempt" }
);
```

### Stripe's Rules

| Rule | Description |
|------|-------------|
| Key scope | Tied to API key (per-merchant isolation) |
| Key lifetime | 24 hours, then expired |
| Request matching | Key + request body must match |
| Conflict handling | 409 if same key, different body |
| In-progress | Returns 409 if original still processing |
| Error results | NOT cached (allows retry with same key) |

### Implementing Stripe-Style Idempotency

```javascript
class StripeStyleIdempotency {
  constructor(redis) {
    this.redis = redis;
    this.TTL = 86400; // 24 hours
  }

  async execute(key, userId, requestHash, handler) {
    const cacheKey = `idem:${userId}:${key}`;

    // Try to acquire lock
    const lockResult = await this.redis.set(
      cacheKey,
      JSON.stringify({ status: "processing", requestHash }),
      "NX",
      "EX",
      this.TTL
    );

    if (!lockResult) {
      // Key exists — check if same request
      const stored = JSON.parse(await this.redis.get(cacheKey));

      if (stored.requestHash !== requestHash) {
        throw new ConflictError("Idempotency key used with different request");
      }

      if (stored.status === "processing") {
        throw new ConflictError("Original request still processing");
      }

      return stored.result;
    }

    // Execute the operation
    try {
      const result = await handler();

      // Cache successful result
      await this.redis.set(
        cacheKey,
        JSON.stringify({ status: "complete", requestHash, result }),
        "XX",
        "EX",
        this.TTL
      );

      return result;
    } catch (error) {
      // Don't cache errors (allow retry)
      await this.redis.del(cacheKey);
      throw error;
    }
  }
}
```

---

## Practical Patterns and Anti-Patterns

### Patterns (Do This)

| Pattern | Example |
|---------|---------|
| Use absolute values | `SET balance = 500` instead of `balance += 100` |
| Client-generated IDs | Client creates UUID before request |
| Conditional updates | `UPDATE ... WHERE status = 'pending'` |
| Upserts | `INSERT ... ON CONFLICT DO UPDATE` |
| Token-based dedup | Store and check idempotency tokens |
| Natural keys | Use business IDs as dedup keys |

### Anti-Patterns (Avoid This)

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Server-generated dedup keys | Client can't retry safely | Client generates key before first attempt |
| Caching error responses | Client can never succeed | Only cache successful results |
| No key expiration | Storage grows forever | Expire keys after 24-48 hours |
| Global keys without user scope | Key collision across users | Scope keys to user/merchant |
| Relative operations without dedup | `balance += 100` doubles on retry | Use absolute values or dedup table |
| Idempotency at wrong layer | Applied too late in the pipeline | Apply at the entry point (API gateway) |

### Decision Flowchart

```
Is the operation naturally idempotent?
├── YES → No extra work needed (GET, PUT with full body, DELETE)
└── NO → Does the client control a unique identifier?
    ├── YES → Use that as idempotency key
    └── NO → Have client generate UUID before first request
        │
        └── Server-side: Store key + result in dedup table
            │
            ├── Same key + same body → Return cached result
            ├── Same key + different body → Return 409 Conflict
            └── Key not found → Process and store result
```

---

## Exercises

### Exercise 1: Identify Idempotent Operations

Classify each operation as idempotent or non-idempotent:

```
1. DELETE /users/42
2. POST /users { name: "Alice" }
3. PUT /config { theme: "dark" }
4. POST /counter/increment
5. PATCH /users/42 { email: "new@mail.com" }
6. UPDATE items SET quantity = 10 WHERE id = 5
7. UPDATE items SET quantity = quantity + 1 WHERE id = 5
8. INSERT INTO logs (message) VALUES ('event occurred')
```

<details>
<summary>Answer</summary>

1. **Idempotent** — deleting again is a no-op
2. **Non-idempotent** — creates new user each time
3. **Idempotent** — replaces entire config
4. **Non-idempotent** — increments on each call
5. **Idempotent** — sets absolute value (not relative)
6. **Idempotent** — sets absolute value
7. **Non-idempotent** — relative increment
8. **Non-idempotent** — appends new row each time

</details>

### Exercise 2: Implement Idempotent Payment

Design a payment endpoint that handles retries safely:

```javascript
// TODO: Implement idempotent payment handler
app.post("/api/payments", async (req, res) => {
  const { amount, currency, recipientId } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  // Your implementation here:
  // 1. Validate idempotency key presence
  // 2. Check dedup table for existing result
  // 3. Lock the key
  // 4. Process payment
  // 5. Store result
  // 6. Handle errors properly
});
```

<details>
<summary>Solution</summary>

```javascript
app.post("/api/payments", async (req, res) => {
  const { amount, currency, recipientId } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency-Key required" });
  }

  // Check for existing result
  const cached = await redis.get(`payment:${req.userId}:${idempotencyKey}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.status === "processing") {
      return res.status(202).json({ message: "Still processing" });
    }
    return res.status(parsed.code).json(parsed.body);
  }

  // Lock
  const acquired = await redis.set(
    `payment:${req.userId}:${idempotencyKey}`,
    JSON.stringify({ status: "processing" }),
    "NX", "EX", 86400
  );

  if (!acquired) {
    return res.status(409).json({ error: "Duplicate request in progress" });
  }

  try {
    const payment = await chargeCard({ amount, currency, recipientId });

    await redis.set(
      `payment:${req.userId}:${idempotencyKey}`,
      JSON.stringify({ status: "done", code: 201, body: payment }),
      "XX", "EX", 86400
    );

    return res.status(201).json(payment);
  } catch (error) {
    await redis.del(`payment:${req.userId}:${idempotencyKey}`);
    return res.status(500).json({ error: error.message });
  }
});
```

</details>

### Exercise 3: Message Deduplication

Write a function that processes messages exactly once using a database:

```javascript
// TODO: Complete the function
async function processOnce(db, message) {
  // message has: { id, type, payload }
  // Ensure each message.id is processed exactly once
  // Return the processing result
}
```

<details>
<summary>Solution</summary>

```javascript
async function processOnce(db, message) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Attempt insert (fails if duplicate)
    const inserted = await client.query(
      `INSERT INTO processed_messages (message_id, started_at)
       VALUES ($1, NOW())
       ON CONFLICT (message_id) DO NOTHING
       RETURNING message_id`,
      [message.id]
    );

    if (inserted.rows.length === 0) {
      // Already processed — fetch stored result
      await client.query("ROLLBACK");
      const existing = await db.query(
        "SELECT result FROM processed_messages WHERE message_id = $1",
        [message.id]
      );
      return JSON.parse(existing.rows[0].result);
    }

    // Process
    const result = await handleMessage(message, client);

    // Store result
    await client.query(
      "UPDATE processed_messages SET result = $1, completed_at = NOW() WHERE message_id = $2",
      [JSON.stringify(result), message.id]
    );

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Idempotency | Same operation, same result — no matter how many times |
| HTTP methods | GET, PUT, DELETE are idempotent; POST is not |
| Idempotency keys | Client-generated UUID sent with each request |
| Dedup table | Server stores key → result mapping |
| Exactly-once | Achieved via at-least-once + idempotent processing |
| Database tricks | Upserts, conditional writes, optimistic locking |
| Stripe pattern | 24h TTL, user-scoped, error responses not cached |
| Golden rule | At-least-once delivery + idempotent handler = effectively-once |

---

## Next Steps

- Explore **distributed transactions** for multi-service idempotency
- Study **saga patterns** and compensating transactions
- Learn about **outbox pattern** for reliable event publishing
- Investigate **content-addressed storage** as natural idempotency
