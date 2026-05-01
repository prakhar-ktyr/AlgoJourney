---
title: WebSockets
---

# WebSockets

**WebSockets** provide full-duplex, bidirectional communication between client and server over a single persistent connection. Unlike HTTP's request-response model, both sides can send messages at any time.

---

## REST vs WebSockets

| Feature | REST (HTTP) | WebSocket |
|---------|-------------|-----------|
| Communication | Request-response | Bidirectional |
| Connection | New for each request | Persistent |
| Latency | Higher (connection overhead) | Low (always connected) |
| Use case | CRUD operations | Real-time updates |

---

## When to Use WebSockets

- **Chat applications** — instant message delivery
- **Live notifications** — real-time alerts
- **Collaborative editing** — multiple users editing simultaneously
- **Live dashboards** — streaming metrics
- **Gaming** — real-time game state
- **Trading platforms** — live price updates

---

## Implementation with Socket.IO

```bash
npm install socket.io
```

### Server

```javascript
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

// REST endpoints still work
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// WebSocket connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Listen for messages from client
  socket.on("chat:message", (data) => {
    console.log(`Message from ${socket.id}:`, data);
    // Broadcast to all other clients
    socket.broadcast.emit("chat:message", {
      userId: socket.id,
      text: data.text,
      timestamp: new Date().toISOString(),
    });
  });

  // Join a room
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit("room:joined", { userId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(5000);
```

### Client

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected!");

  // Send a message
  socket.emit("chat:message", { text: "Hello!" });

  // Join a room
  socket.emit("room:join", "room-123");
});

// Receive messages
socket.on("chat:message", (data) => {
  console.log(`${data.userId}: ${data.text}`);
});
```

---

## REST + WebSocket Pattern

Use REST for CRUD and WebSocket for real-time updates:

```javascript
// REST: Create a message (persistent)
app.post("/api/messages", authenticate, async (req, res) => {
  const message = await Message.create({
    text: req.body.text,
    roomId: req.body.roomId,
    userId: req.user.id,
  });

  // Notify connected clients via WebSocket
  io.to(req.body.roomId).emit("message:new", message);

  res.status(201).json(message);
});

// REST: Load message history
app.get("/api/rooms/:roomId/messages", authenticate, async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ data: messages });
});
```

---

## Key Takeaways

- **WebSockets** enable real-time bidirectional communication
- Use REST for **CRUD** and WebSockets for **real-time updates**
- **Socket.IO** is the easiest library for WebSockets in Node.js
- Use **rooms** for targeted broadcasts
- WebSockets complement REST — they don't replace it

---

Next, we'll learn about **Server-Sent Events & Long Polling** — other real-time patterns →
