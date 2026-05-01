---
title: HTML Server-Sent Events
---

# HTML Server-Sent Events

Server-Sent Events (SSE) allow a server to **push updates** to the browser over a single HTTP connection. It's perfect for live feeds, notifications, and real-time dashboards.

---

## How SSE Works

1. The browser opens a connection to the server using `EventSource`
2. The server sends events as text streams
3. The connection stays open — the server pushes new data whenever available
4. If the connection drops, the browser **automatically reconnects**

---

## Client-Side: Receiving Events

```html
<div id="messages"></div>

<script>
    const source = new EventSource("/api/events");

    source.onmessage = function(e) {
        const div = document.getElementById("messages");
        div.innerHTML += `<p>${e.data}</p>`;
    };

    source.onerror = function() {
        console.log("Connection error. Reconnecting...");
    };

    // Close the connection
    // source.close();
</script>
```

---

## Named Events

Listen for specific event types:

```html
<script>
    const source = new EventSource("/api/events");

    source.addEventListener("notification", (e) => {
        console.log("Notification:", e.data);
    });

    source.addEventListener("update", (e) => {
        const data = JSON.parse(e.data);
        console.log("Update:", data);
    });
</script>
```

---

## Server-Side Format

The server sends plain text with a specific format:

```
data: Hello World

data: {"user": "Alice", "message": "Hi!"}

event: notification
data: You have a new message

id: 123
data: Message with ID
retry: 5000
```

| Field | Purpose |
|-------|---------|
| `data:` | The message content |
| `event:` | Custom event name |
| `id:` | Event ID (for reconnection) |
| `retry:` | Reconnection delay in ms |

---

## SSE vs WebSockets

| Feature | SSE | WebSockets |
|---------|-----|------------|
| Direction | Server → Client (one-way) | Bidirectional |
| Protocol | HTTP | WebSocket (ws://) |
| Reconnection | Automatic | Manual |
| Data format | Text only | Text and binary |
| Complexity | Simple | More complex |
| Best for | Live feeds, notifications | Chat, gaming, collaboration |

> [!TIP]
> Use **SSE** when you only need server-to-client updates (notifications, live scores, stock prices). Use **WebSockets** when you need two-way communication (chat, multiplayer games).

---

## Summary

- SSE provides **server-to-client** push updates over HTTP
- Use **`EventSource`** to connect and receive events
- Supports **named events**, **automatic reconnection**, and **event IDs**
- Simpler than WebSockets for one-way data flows
