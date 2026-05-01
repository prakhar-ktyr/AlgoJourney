---
title: Node.js WebSockets
---

# Node.js WebSockets

HTTP is request-response: the client asks, the server answers. **WebSockets** open a persistent, two-way connection — the server can push data to the client at any time. This enables real-time features: chat, live notifications, multiplayer games, stock tickers, and collaborative editing.

## HTTP vs. WebSocket

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Connection | New connection per request | Persistent connection |
| Direction | Client → Server (request-response) | Bidirectional (full-duplex) |
| Overhead | Headers sent every request | Minimal framing after handshake |
| Protocol | `http://` / `https://` | `ws://` / `wss://` |
| Use case | REST APIs, web pages | Real-time communication |

## The ws library

The `ws` package is the most popular, lightweight WebSocket library for Node.js:

```bash
npm install ws
```

### Basic WebSocket server

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Receive messages from client
  ws.on("message", (data) => {
    const message = data.toString();
    console.log("Received:", message);

    // Send response
    ws.send(`Echo: ${message}`);
  });

  // Handle disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // Handle errors
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  // Send welcome message
  ws.send("Welcome to the WebSocket server!");
});

console.log("WebSocket server running on ws://localhost:8080");
```

### Basic WebSocket client (browser)

```javascript
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("Connected");
  ws.send("Hello, server!");
};

ws.onmessage = (event) => {
  console.log("Received:", event.data);
};

ws.onclose = () => {
  console.log("Disconnected");
};

ws.onerror = (err) => {
  console.error("Error:", err);
};
```

### Node.js WebSocket client

```javascript
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  ws.send("Hello from Node.js client");
});

ws.on("message", (data) => {
  console.log("Server says:", data.toString());
});
```

## Broadcasting to all clients

```javascript
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const message = data.toString();

    // Broadcast to ALL connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
```

### Broadcast to others (exclude sender)

```javascript
ws.on("message", (data) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data.toString());
    }
  });
});
```

## Chat application example

### Server

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map(); // ws → username

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.type) {
      case "join": {
        clients.set(ws, msg.username);
        broadcast({
          type: "system",
          text: `${msg.username} joined the chat`,
        });
        break;
      }

      case "message": {
        const username = clients.get(ws) || "Anonymous";
        broadcast({
          type: "message",
          username,
          text: msg.text,
          timestamp: Date.now(),
        });
        break;
      }
    }
  });

  ws.on("close", () => {
    const username = clients.get(ws);
    clients.delete(ws);
    if (username) {
      broadcast({ type: "system", text: `${username} left the chat` });
    }
  });
});

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(json);
    }
  });
}

console.log("Chat server on ws://localhost:8080");
```

### Client (browser)

```html
<div id="messages"></div>
<input id="input" placeholder="Type a message..." />
<button onclick="sendMessage()">Send</button>

<script>
  const ws = new WebSocket("ws://localhost:8080");
  const messages = document.getElementById("messages");

  // Join on connect
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", username: "Alice" }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const div = document.createElement("div");

    if (msg.type === "system") {
      div.textContent = `[System] ${msg.text}`;
      div.style.color = "gray";
    } else {
      div.textContent = `${msg.username}: ${msg.text}`;
    }

    messages.appendChild(div);
  };

  function sendMessage() {
    const input = document.getElementById("input");
    ws.send(JSON.stringify({ type: "message", text: input.value }));
    input.value = "";
  }
</script>
```

## WebSocket with Express

Share the same HTTP server for both Express and WebSocket:

```javascript
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Regular HTTP routes
app.get("/", (req, res) => {
  res.send("HTTP and WebSocket on the same port!");
});

app.get("/api/status", (req, res) => {
  res.json({ clients: wss.clients.size });
});

// WebSocket handling
wss.on("connection", (ws) => {
  ws.send("Connected to WebSocket");

  ws.on("message", (data) => {
    ws.send(`Echo: ${data}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

## Heartbeat (keep-alive)

Detect broken connections with periodic pings:

```javascript
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true; // client responded to ping
  });

  ws.on("close", () => {
    ws.isAlive = false;
  });
});

// Check every 30 seconds
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate(); // dead connection
    }
    ws.isAlive = false;
    ws.ping(); // send ping, wait for pong
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});
```

## Socket.IO (alternative)

Socket.IO adds features on top of WebSockets: automatic reconnection, rooms, namespaces, and fallback to HTTP polling:

```bash
npm install socket.io
```

```javascript
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a room
  socket.join("general");

  // Listen for events
  socket.on("chat message", (msg) => {
    // Broadcast to room
    io.to("general").emit("chat message", {
      user: socket.id,
      text: msg,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000);
```

Client (include Socket.IO client library):

```javascript
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.emit("chat message", "Hello everyone!");

socket.on("chat message", (msg) => {
  console.log(`${msg.user}: ${msg.text}`);
});
```

## Key takeaways

- WebSockets enable **persistent, bidirectional** communication.
- Use the `ws` library for lightweight WebSocket servers.
- Share an HTTP server between Express and WebSocket with `createServer`.
- Use JSON for structured message passing between client and server.
- Implement **heartbeat** (ping/pong) to detect dead connections.
- Consider **Socket.IO** for features like rooms, auto-reconnect, and fallback transport.
