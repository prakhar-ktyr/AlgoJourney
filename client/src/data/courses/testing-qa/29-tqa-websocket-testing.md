---
title: WebSocket & Real-Time Testing
---

## Challenges of Testing Real-Time Systems

Testing real-time communication introduces complexities that traditional request-response testing does not face:

- **Asynchronous by nature**: Messages arrive at unpredictable times; tests must wait without blocking indefinitely
- **Bidirectional communication**: Both client and server can initiate messages, requiring tests to handle interleaved events
- **Stateful connections**: Unlike HTTP, WebSocket connections maintain state — tests must manage the full lifecycle
- **Timing sensitivity**: Race conditions between connect, send, and receive are common sources of flaky tests
- **Connection persistence**: Long-lived connections require testing reconnection, heartbeats, and graceful shutdown
- **Ordering guarantees**: Messages may arrive out of order depending on the implementation

Effective real-time testing strategies:
1. Use deterministic timeouts rather than arbitrary `sleep()` calls
2. Test the connection lifecycle (open → message → close) as a state machine
3. Isolate tests to avoid shared connection state
4. Simulate network failures and verify recovery behaviour
5. Use event-driven assertions that wait for specific messages

## WebSocket Lifecycle: Connect, Message, Disconnect

Every WebSocket interaction follows a lifecycle. Tests should verify each phase independently.

```python
import asyncio
import pytest
import websockets

WS_URL = "ws://localhost:8080/ws"

@pytest.mark.asyncio
async def test_websocket_connection_opens():
    async with websockets.connect(WS_URL) as ws:
        assert ws.open is True

@pytest.mark.asyncio
async def test_websocket_receives_welcome_message():
    async with websockets.connect(WS_URL) as ws:
        message = await asyncio.wait_for(ws.recv(), timeout=5.0)
        data = json.loads(message)
        assert data["type"] == "welcome"
        assert "connectionId" in data

@pytest.mark.asyncio
async def test_websocket_clean_disconnect():
    ws = await websockets.connect(WS_URL)
    assert ws.open is True
    await ws.close(code=1000, reason="test complete")
    assert ws.closed is True
    assert ws.close_code == 1000

@pytest.mark.asyncio
async def test_server_initiated_disconnect():
    async with websockets.connect(WS_URL) as ws:
        # Send a message that triggers server-side disconnect
        await ws.send(json.dumps({"action": "disconnect_me"}))
        # Server should close the connection
        with pytest.raises(websockets.ConnectionClosed) as exc_info:
            await asyncio.wait_for(ws.recv(), timeout=5.0)
        assert exc_info.value.code == 1000
```

```javascript
const WebSocket = require("ws");

describe("WebSocket Lifecycle", () => {
  let ws;

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it("should establish connection successfully", (done) => {
    ws = new WebSocket("ws://localhost:8080/ws");
    ws.on("open", () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });
    ws.on("error", done);
  });

  it("should receive welcome message on connect", (done) => {
    ws = new WebSocket("ws://localhost:8080/ws");
    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.type).toBe("welcome");
      expect(msg.connectionId).toBeDefined();
      done();
    });
  });

  it("should handle clean disconnect", (done) => {
    ws = new WebSocket("ws://localhost:8080/ws");
    ws.on("open", () => {
      ws.close(1000, "test complete");
    });
    ws.on("close", (code, reason) => {
      expect(code).toBe(1000);
      done();
    });
  });
});
```

```java
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.net.URI;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class WebSocketLifecycleTest {

    @Test
    @Timeout(10)
    void shouldConnectSuccessfully() throws Exception {
        CompletableFuture<Boolean> connected = new CompletableFuture<>();

        WebSocketClient client = new WebSocketClient(new URI("ws://localhost:8080/ws")) {
            @Override
            public void onOpen(ServerHandshake handshake) {
                connected.complete(true);
            }

            @Override
            public void onMessage(String message) {}

            @Override
            public void onClose(int code, String reason, boolean remote) {}

            @Override
            public void onError(Exception ex) {
                connected.completeExceptionally(ex);
            }
        };

        client.connect();
        assertThat(connected.get(5, TimeUnit.SECONDS)).isTrue();
        client.closeBlocking();
    }

    @Test
    @Timeout(10)
    void shouldReceiveWelcomeMessage() throws Exception {
        CompletableFuture<String> messageFuture = new CompletableFuture<>();

        WebSocketClient client = new WebSocketClient(new URI("ws://localhost:8080/ws")) {
            @Override
            public void onOpen(ServerHandshake handshake) {}

            @Override
            public void onMessage(String message) {
                messageFuture.complete(message);
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {}

            @Override
            public void onError(Exception ex) {
                messageFuture.completeExceptionally(ex);
            }
        };

        client.connect();
        String message = messageFuture.get(5, TimeUnit.SECONDS);
        assertThat(message).contains("welcome");
        client.closeBlocking();
    }
}
```

```csharp
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Xunit;

public class WebSocketLifecycleTests
{
    private const string WsUrl = "ws://localhost:8080/ws";

    [Fact]
    public async Task ShouldConnectSuccessfully()
    {
        using var ws = new ClientWebSocket();
        await ws.ConnectAsync(new Uri(WsUrl), CancellationToken.None);

        Assert.Equal(WebSocketState.Open, ws.State);

        await ws.CloseAsync(
            WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
    }

    [Fact]
    public async Task ShouldReceiveWelcomeMessage()
    {
        using var ws = new ClientWebSocket();
        await ws.ConnectAsync(new Uri(WsUrl), CancellationToken.None);

        var buffer = new byte[4096];
        var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
        var data = JsonSerializer.Deserialize<JsonDocument>(message);

        Assert.Equal("welcome",
            data.RootElement.GetProperty("type").GetString());

        await ws.CloseAsync(
            WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
    }

    [Fact]
    public async Task ShouldHandleServerDisconnect()
    {
        using var ws = new ClientWebSocket();
        await ws.ConnectAsync(new Uri(WsUrl), CancellationToken.None);

        // Request server to close connection
        var payload = Encoding.UTF8.GetBytes(
            JsonSerializer.Serialize(new { action = "disconnect_me" }));
        await ws.SendAsync(payload, WebSocketMessageType.Text, true,
            CancellationToken.None);

        var buffer = new byte[4096];
        var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
        Assert.Equal(WebSocketMessageType.Close, result.MessageType);
    }
}
```

## Testing Event Emission and Reception

Real-time apps often use event-based patterns (chat messages, notifications, live updates). Tests must verify that events are correctly broadcast to the right recipients.

```python
import json

@pytest.mark.asyncio
async def test_broadcast_message_to_all_clients():
    async with websockets.connect(WS_URL) as ws1, \
               websockets.connect(WS_URL) as ws2:
        # Skip welcome messages
        await asyncio.wait_for(ws1.recv(), timeout=2.0)
        await asyncio.wait_for(ws2.recv(), timeout=2.0)

        # ws1 sends a chat message
        await ws1.send(json.dumps({
            "type": "chat",
            "message": "Hello everyone"
        }))

        # Both clients should receive the broadcast
        msg1 = json.loads(await asyncio.wait_for(ws1.recv(), timeout=5.0))
        msg2 = json.loads(await asyncio.wait_for(ws2.recv(), timeout=5.0))

        assert msg1["type"] == "chat"
        assert msg1["message"] == "Hello everyone"
        assert msg2["type"] == "chat"
        assert msg2["message"] == "Hello everyone"

@pytest.mark.asyncio
async def test_private_message_only_reaches_target():
    async with websockets.connect(WS_URL) as sender, \
               websockets.connect(WS_URL) as recipient, \
               websockets.connect(WS_URL) as bystander:
        # Get connection IDs from welcome messages
        sender_info = json.loads(await asyncio.wait_for(sender.recv(), timeout=2.0))
        recipient_info = json.loads(await asyncio.wait_for(recipient.recv(), timeout=2.0))
        await asyncio.wait_for(bystander.recv(), timeout=2.0)

        # Send private message
        await sender.send(json.dumps({
            "type": "private",
            "to": recipient_info["connectionId"],
            "message": "Secret"
        }))

        # Recipient gets the message
        msg = json.loads(await asyncio.wait_for(recipient.recv(), timeout=5.0))
        assert msg["message"] == "Secret"

        # Bystander should NOT receive anything
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(bystander.recv(), timeout=1.0)
```

```javascript
describe("Event Emission and Reception", () => {
  it("should broadcast messages to all connected clients", (done) => {
    const ws1 = new WebSocket("ws://localhost:8080/ws");
    const ws2 = new WebSocket("ws://localhost:8080/ws");
    let messagesReceived = 0;

    const checkDone = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "chat") {
        expect(msg.message).toBe("Hello");
        messagesReceived++;
        if (messagesReceived === 2) {
          ws1.close();
          ws2.close();
          done();
        }
      }
    };

    let readyCount = 0;
    const onReady = () => {
      readyCount++;
      if (readyCount === 2) {
        ws1.send(JSON.stringify({ type: "chat", message: "Hello" }));
      }
    };

    ws1.on("open", onReady);
    ws2.on("open", onReady);
    ws1.on("message", checkDone);
    ws2.on("message", checkDone);
  });

  it("should route private messages only to recipient", (done) => {
    const sender = new WebSocket("ws://localhost:8080/ws");
    const recipient = new WebSocket("ws://localhost:8080/ws");
    const bystander = new WebSocket("ws://localhost:8080/ws");
    let recipientId;

    recipient.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "welcome") {
        recipientId = msg.connectionId;
      } else if (msg.type === "private") {
        expect(msg.message).toBe("Secret");
        // Verify bystander did not receive it
        setTimeout(() => {
          sender.close();
          recipient.close();
          bystander.close();
          done();
        }, 500);
      }
    });

    bystander.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "private") {
        done(new Error("Bystander received private message"));
      }
    });

    sender.on("open", () => {
      setTimeout(() => {
        sender.send(JSON.stringify({
          type: "private",
          to: recipientId,
          message: "Secret",
        }));
      }, 300);
    });
  });
});
```

## Testing Reconnection and Error Handling

Robust real-time clients implement reconnection logic. Tests should verify that the application recovers gracefully from connection drops.

```java
@Test
@Timeout(30)
void shouldReconnectAfterServerDisconnect() throws Exception {
    CompletableFuture<Integer> connectionCount = new CompletableFuture<>();
    var connections = new java.util.concurrent.atomic.AtomicInteger(0);

    WebSocketClient client = new WebSocketClient(new URI("ws://localhost:8080/ws")) {
        @Override
        public void onOpen(ServerHandshake handshake) {
            int count = connections.incrementAndGet();
            if (count == 2) {
                connectionCount.complete(count);
            }
        }

        @Override
        public void onMessage(String message) {}

        @Override
        public void onClose(int code, String reason, boolean remote) {
            if (remote) {
                // Server closed the connection — attempt reconnect
                try {
                    Thread.sleep(1000);
                    this.reconnect();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        @Override
        public void onError(Exception ex) {}
    };

    client.connect();
    // Simulate server dropping the connection
    Thread.sleep(2000);
    // Server closes our connection (triggered externally)

    int totalConnections = connectionCount.get(15, TimeUnit.SECONDS);
    assertThat(totalConnections).isEqualTo(2);
    client.closeBlocking();
}

@Test
@Timeout(10)
void shouldHandleMalformedServerMessage() throws Exception {
    CompletableFuture<Boolean> errorHandled = new CompletableFuture<>();

    WebSocketClient client = new WebSocketClient(new URI("ws://localhost:8080/ws")) {
        @Override
        public void onOpen(ServerHandshake handshake) {
            // Request server to send malformed data
            send("{\"action\": \"send_malformed\"}");
        }

        @Override
        public void onMessage(String message) {
            try {
                var json = new com.google.gson.JsonParser()
                    .parse(message).getAsJsonObject();
            } catch (Exception e) {
                // Gracefully handle parse error
                errorHandled.complete(true);
            }
        }

        @Override
        public void onClose(int code, String reason, boolean remote) {}

        @Override
        public void onError(Exception ex) {}
    };

    client.connect();
    assertThat(errorHandled.get(5, TimeUnit.SECONDS)).isTrue();
    client.closeBlocking();
}
```

```csharp
[Fact]
public async Task ShouldReconnectAfterDisconnection()
{
    int connectionCount = 0;
    using var ws = new ClientWebSocket();

    // First connection
    await ws.ConnectAsync(new Uri(WsUrl), CancellationToken.None);
    connectionCount++;

    // Simulate server drop by requesting disconnect
    var payload = Encoding.UTF8.GetBytes(
        JsonSerializer.Serialize(new { action = "disconnect_me" }));
    await ws.SendAsync(payload, WebSocketMessageType.Text, true,
        CancellationToken.None);

    // Wait for close
    var buffer = new byte[4096];
    var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
    Assert.Equal(WebSocketMessageType.Close, result.MessageType);

    // Reconnect
    using var ws2 = new ClientWebSocket();
    await ws2.ConnectAsync(new Uri(WsUrl), CancellationToken.None);
    connectionCount++;

    Assert.Equal(2, connectionCount);
    Assert.Equal(WebSocketState.Open, ws2.State);

    await ws2.CloseAsync(
        WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
}

[Fact]
public async Task ShouldHandleUnexpectedMessageFormat()
{
    using var ws = new ClientWebSocket();
    await ws.ConnectAsync(new Uri(WsUrl), CancellationToken.None);

    // Request malformed response
    var payload = Encoding.UTF8.GetBytes(
        JsonSerializer.Serialize(new { action = "send_malformed" }));
    await ws.SendAsync(payload, WebSocketMessageType.Text, true,
        CancellationToken.None);

    var buffer = new byte[4096];
    var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
    var raw = Encoding.UTF8.GetString(buffer, 0, result.Count);

    // Application should gracefully handle invalid JSON
    var parsed = Record.Exception(() =>
        JsonSerializer.Deserialize<JsonDocument>(raw));

    // Even if parsing fails, connection remains open
    Assert.Equal(WebSocketState.Open, ws.State);

    await ws.CloseAsync(
        WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
}
```

## Timeout Handling in Async Tests

Proper timeout handling prevents tests from hanging indefinitely. Every async wait should have an explicit timeout, and tests should distinguish between "no response yet" and "will never respond."

```python
@pytest.mark.asyncio
async def test_response_within_timeout():
    async with websockets.connect(WS_URL) as ws:
        await ws.send(json.dumps({"type": "ping"}))
        try:
            response = await asyncio.wait_for(ws.recv(), timeout=3.0)
            data = json.loads(response)
            assert data["type"] == "pong"
        except asyncio.TimeoutError:
            pytest.fail("Server did not respond to ping within 3 seconds")

@pytest.mark.asyncio
async def test_heartbeat_keeps_connection_alive():
    async with websockets.connect(WS_URL, ping_interval=5) as ws:
        # Skip welcome
        await asyncio.wait_for(ws.recv(), timeout=2.0)
        # Wait longer than the server's idle timeout
        await asyncio.sleep(12)
        # Connection should still be open due to heartbeats
        assert ws.open is True
        await ws.send(json.dumps({"type": "ping"}))
        response = await asyncio.wait_for(ws.recv(), timeout=3.0)
        assert json.loads(response)["type"] == "pong"
```

```javascript
describe("Timeout Handling", () => {
  jest.setTimeout(15000);

  it("should respond to ping within timeout", (done) => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    const timeout = setTimeout(() => {
      ws.close();
      done(new Error("Ping response timed out"));
    }, 3000);

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "ping" }));
    });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "pong") {
        clearTimeout(timeout);
        ws.close();
        done();
      }
    });
  });

  it("should detect stale connections", (done) => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    ws.on("open", () => {
      // Don't send any messages — server should eventually close
      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
          done(new Error("Server did not close idle connection"));
        }
      }, 12000);

      ws.on("close", () => {
        clearTimeout(timeout);
        done();
      });
    });
  });
});
```

## Load Testing WebSockets

While unit and integration tests cover correctness, load testing verifies that the WebSocket server handles concurrent connections and message throughput. Tools like `artillery`, `k6`, or custom scripts help simulate real-world load.

```python
@pytest.mark.asyncio
async def test_server_handles_many_concurrent_connections():
    """Verify server accepts at least 100 simultaneous WebSocket clients."""
    connections = []
    try:
        for _ in range(100):
            ws = await websockets.connect(WS_URL)
            connections.append(ws)

        # All connections should be open
        assert all(ws.open for ws in connections)

        # Broadcast a message and verify all receive it
        await connections[0].send(json.dumps({"type": "chat", "message": "load test"}))

        received = 0
        for ws in connections:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                if "load test" in msg:
                    received += 1
            except asyncio.TimeoutError:
                pass

        assert received >= 95  # Allow small tolerance
    finally:
        await asyncio.gather(*[ws.close() for ws in connections])

@pytest.mark.asyncio
async def test_message_throughput():
    """Verify server processes messages at acceptable rate."""
    async with websockets.connect(WS_URL) as ws:
        await asyncio.wait_for(ws.recv(), timeout=2.0)  # welcome

        start = asyncio.get_event_loop().time()
        message_count = 500

        for i in range(message_count):
            await ws.send(json.dumps({"type": "echo", "seq": i}))

        received = 0
        while received < message_count:
            try:
                await asyncio.wait_for(ws.recv(), timeout=10.0)
                received += 1
            except asyncio.TimeoutError:
                break

        elapsed = asyncio.get_event_loop().time() - start
        throughput = received / elapsed

        assert received == message_count
        assert throughput > 50  # At least 50 messages/second round-trip
```

## Summary

Testing WebSocket and real-time systems requires:
- **Lifecycle awareness**: Test connect, message exchange, and disconnect as distinct phases
- **Deterministic timeouts**: Never rely on sleep — use explicit `wait_for` with timeouts
- **Event verification**: Confirm messages reach the correct recipients and are excluded from others
- **Reconnection resilience**: Verify clients recover from server-initiated disconnects
- **Concurrency testing**: Validate the server handles multiple simultaneous connections
- **Proper cleanup**: Always close connections in test teardown to avoid resource leaks
