---
title: Webhooks
---

# Webhooks

Webhooks let your API **push** notifications to other servers when events happen, instead of the other server repeatedly **polling** for changes.

---

## Polling vs Webhooks

```
Polling (wasteful):
Client: "Any new orders?"  → Server: "No"
Client: "Any new orders?"  → Server: "No"
Client: "Any new orders?"  → Server: "Yes! Here's order #42"

Webhooks (efficient):
Server: *order #42 created* → POST to client's webhook URL
```

---

## How Webhooks Work

```
1. Client registers a webhook URL:
   POST /api/webhooks
   { "url": "https://partner.com/webhook", "events": ["order.created"] }

2. Event happens on your server:
   New order #42 is created

3. Your server sends a POST to the registered URL:
   POST https://partner.com/webhook
   {
     "event": "order.created",
     "timestamp": "2024-01-15T10:30:00Z",
     "data": { "orderId": 42, "total": 59.99 }
   }

4. Partner server processes the event and responds 200 OK
```

---

## Implementing Webhook Delivery

### Register Webhooks

```javascript
const webhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  events: [{ type: String, enum: ["order.created", "order.updated", "user.registered"] }],
  secret: { type: String, required: true },
  active: { type: Boolean, default: true },
});

app.post("/api/webhooks", authenticate, async (req, res) => {
  const secret = randomBytes(32).toString("hex");
  const webhook = await Webhook.create({
    url: req.body.url,
    events: req.body.events,
    secret,
  });
  res.status(201).json({ id: webhook._id, secret }); // Client stores the secret
});
```

### Deliver Events

```javascript
import { createHmac } from "crypto";

async function deliverWebhook(webhook, event, data) {
  const payload = JSON.stringify({ event, timestamp: new Date().toISOString(), data });

  // Sign the payload so the receiver can verify it's from us
  const signature = createHmac("sha256", webhook.secret)
    .update(payload)
    .digest("hex");

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
      },
      body: payload,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`Webhook delivery error: ${error.message}`);
    // Queue for retry
  }
}

// Trigger webhook after event
app.post("/api/orders", authenticate, async (req, res) => {
  const order = await Order.create(req.body);

  // Fire and forget — don't block the response
  const webhooks = await Webhook.find({ events: "order.created", active: true });
  for (const wh of webhooks) {
    deliverWebhook(wh, "order.created", order).catch(console.error);
  }

  res.status(201).json(order);
});
```

### Receiving Webhooks

On the receiving end, verify the signature:

```javascript
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const expected = `sha256=${createHmac("sha256", WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex")}`;

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body);
  console.log(`Received: ${event.event}`, event.data);

  res.status(200).json({ received: true });
});
```

---

## Retry Strategy

Implement exponential backoff for failed deliveries:

```javascript
const RETRY_DELAYS = [60, 300, 3600, 86400]; // 1min, 5min, 1hr, 24hr

async function deliverWithRetry(webhook, event, data, attempt = 0) {
  try {
    await deliverWebhook(webhook, event, data);
  } catch (error) {
    if (attempt < RETRY_DELAYS.length) {
      // Schedule retry (use a job queue in production)
      setTimeout(() => {
        deliverWithRetry(webhook, event, data, attempt + 1);
      }, RETRY_DELAYS[attempt] * 1000);
    } else {
      // Disable webhook after max retries
      await Webhook.findByIdAndUpdate(webhook._id, { active: false });
    }
  }
}
```

---

## Key Takeaways

- Webhooks **push** events to registered URLs (vs polling)
- **Sign** payloads with HMAC so receivers can verify authenticity
- Always **verify signatures** when receiving webhooks
- Implement **retry with exponential backoff** for failed deliveries
- Don't block the main request — deliver webhooks **asynchronously**
- Disable webhooks after repeated failures

---

Next, we'll learn about **WebSockets** — real-time bidirectional communication →
