---
title: Server-Sent Events & Long Polling
---

# Server-Sent Events & Long Polling

Beyond WebSockets, there are simpler real-time communication patterns that work over standard HTTP.

---

## Server-Sent Events (SSE)

**SSE** is a one-way channel from server to client over HTTP. The server pushes updates; the client can only listen.

### Server

```javascript
app.get("/api/events", (req, res) => {
  // Set SSE headers
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // Send an event every 5 seconds
  const interval = setInterval(() => {
    const data = JSON.stringify({ time: new Date().toISOString(), value: Math.random() });
    res.write(`data: ${data}\n\n`);
  }, 5000);

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(interval);
  });
});
```

### Client

```javascript
const eventSource = new EventSource("/api/events");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

eventSource.onerror = () => {
  console.log("Connection lost, reconnecting...");
  // EventSource auto-reconnects
};
```

### Named Events

```javascript
// Server
res.write(`event: notification\ndata: ${JSON.stringify(notif)}\n\n`);
res.write(`event: metric\ndata: ${JSON.stringify(metric)}\n\n`);

// Client
eventSource.addEventListener("notification", (event) => {
  console.log("Notification:", JSON.parse(event.data));
});

eventSource.addEventListener("metric", (event) => {
  console.log("Metric:", JSON.parse(event.data));
});
```

---

## Long Polling

The client makes a request and the server **holds it open** until there's new data:

```javascript
// Server
const waitingClients = [];

app.get("/api/poll", (req, res) => {
  const timeout = setTimeout(() => {
    // No data after 30s — return empty
    res.json({ data: null });
    const idx = waitingClients.indexOf(res);
    if (idx > -1) waitingClients.splice(idx, 1);
  }, 30000);

  waitingClients.push({ res, timeout });
});

// When data is available, respond to all waiting clients
function notifyClients(data) {
  while (waitingClients.length > 0) {
    const { res, timeout } = waitingClients.shift();
    clearTimeout(timeout);
    res.json({ data });
  }
}

app.post("/api/messages", (req, res) => {
  const message = req.body;
  notifyClients(message);
  res.status(201).json(message);
});
```

```javascript
// Client — reconnect immediately after each response
async function poll() {
  while (true) {
    try {
      const response = await fetch("/api/poll");
      const { data } = await response.json();
      if (data) console.log("New data:", data);
    } catch {
      await new Promise((r) => setTimeout(r, 5000)); // Wait before retry
    }
  }
}
poll();
```

---

## Comparison

| Feature | SSE | Long Polling | WebSocket |
|---------|-----|-------------|-----------|
| Direction | Server → Client | Server → Client | Bidirectional |
| Protocol | HTTP | HTTP | WebSocket |
| Reconnection | Automatic | Manual | Manual |
| Complexity | Low | Low | Medium |
| Browser support | All modern | All | All modern |
| Best for | Notifications, feeds | Legacy support | Chat, gaming |

---

## When to Use What

- **SSE**: Notifications, live feeds, dashboards (one-way server push)
- **Long Polling**: When SSE isn't available, legacy browser support
- **WebSocket**: Chat, collaborative editing, gaming (bidirectional needed)
- **Webhooks**: Server-to-server event delivery

---

## Key Takeaways

- **SSE** is the simplest real-time server push (one-way, auto-reconnects)
- **Long Polling** holds connections open until data is available
- **WebSockets** are needed for bidirectional communication
- SSE is ideal for **notifications** and **live dashboards**
- All three can coexist alongside your REST API

---

Next, we'll learn about **API Testing with Postman** — testing your endpoints →
