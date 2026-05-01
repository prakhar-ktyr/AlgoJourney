---
title: HTML WebSockets
---

# HTML WebSockets

WebSockets provide **full-duplex, bidirectional** communication between the browser and server over a single, persistent connection.

---

## How WebSockets Work

1. The client sends an HTTP **upgrade request**
2. The server accepts and the connection is **upgraded** to WebSocket protocol
3. Both sides can send messages **at any time**
4. The connection stays open until either side closes it

---

## Creating a WebSocket Connection

```html
<script>
    const socket = new WebSocket("wss://example.com/socket");

    // Connection opened
    socket.onopen = function() {
        console.log("Connected!");
        socket.send("Hello, Server!");
    };

    // Receive messages
    socket.onmessage = function(e) {
        console.log("Received:", e.data);
    };

    // Handle errors
    socket.onerror = function(e) {
        console.error("WebSocket error:", e);
    };

    // Connection closed
    socket.onclose = function(e) {
        console.log(`Closed: code=${e.code}, reason=${e.reason}`);
    };
</script>
```

---

## Sending Data

```html
<script>
    // Send text
    socket.send("Hello!");

    // Send JSON
    socket.send(JSON.stringify({
        type: "chat",
        message: "Hello everyone!",
        user: "Alice"
    }));
</script>
```

---

## WebSocket URL Schemes

| Scheme | Description |
|--------|-------------|
| `ws://` | Unencrypted WebSocket |
| `wss://` | Encrypted WebSocket (TLS) — always prefer this |

> [!IMPORTANT]
> Always use **`wss://`** (WebSocket Secure) in production. Like HTTPS, it encrypts the data in transit.

---

## Practical Example: Simple Chat

```html
<div id="chat"></div>
<input type="text" id="msg" placeholder="Type a message...">
<button onclick="sendMessage()">Send</button>

<script>
    const socket = new WebSocket("wss://example.com/chat");
    const chat = document.getElementById("chat");

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        chat.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`;
    };

    function sendMessage() {
        const input = document.getElementById("msg");
        socket.send(JSON.stringify({
            user: "You",
            message: input.value
        }));
        input.value = "";
    }
</script>
```

---

## Connection States

```html
<script>
    console.log(socket.readyState);
    // 0 = CONNECTING
    // 1 = OPEN
    // 2 = CLOSING
    // 3 = CLOSED
</script>
```

---

## Reconnection Pattern

WebSockets don't auto-reconnect. Implement it manually:

```html
<script>
    function connect() {
        const socket = new WebSocket("wss://example.com/socket");

        socket.onclose = function() {
            console.log("Disconnected. Reconnecting in 3s...");
            setTimeout(connect, 3000);
        };

        socket.onmessage = function(e) {
            console.log("Message:", e.data);
        };
    }

    connect();
</script>
```

---

## Summary

- WebSockets enable **bidirectional, real-time** communication
- Use `new WebSocket("wss://url")` to connect
- **Events**: `onopen`, `onmessage`, `onerror`, `onclose`
- Send data with **`socket.send()`**
- Always use **`wss://`** in production
- Implement **manual reconnection** (unlike SSE)
- Best for: chat, multiplayer games, live collaboration
