---
title: Remote Procedure Calls
---

## Remote Procedure Calls (RPC)

In this lesson, you'll learn about **Remote Procedure Calls (RPC)** — the foundational abstraction that makes calling a function on a remote machine look and feel like calling a local function. RPC is the backbone of communication in most modern distributed systems.

---

## What Is RPC?

**RPC (Remote Procedure Call)** lets a program call a procedure (function) on another machine as if it were a local call. The network communication details are hidden from the programmer.

```
Local function call:
  result = add(3, 5)         ← runs in same process

Remote procedure call:
  result = remote.add(3, 5)  ← runs on a different machine!
                                (but looks the same to the caller)
```

### The Core Idea

```
┌──────────────────────────┐        ┌──────────────────────────┐
│        Client            │        │        Server            │
│                          │        │                          │
│  result = add(3, 5)      │        │  def add(a, b):          │
│       │                  │        │      return a + b        │
│       ▼                  │        │       ▲                  │
│  ┌──────────┐            │        │  ┌──────────┐            │
│  │Client    │  request   │        │  │Server    │            │
│  │Stub      │───────────────────────►│Stub      │            │
│  │          │◄───────────────────────│          │            │
│  └──────────┘  response  │        │  └──────────┘            │
└──────────────────────────┘        └──────────────────────────┘
```

---

## How RPC Works: Step by Step

Here's what happens when you make an RPC call:

| Step | Component | Action |
|------|-----------|--------|
| 1 | **Client code** | Calls `add(3, 5)` on the client stub |
| 2 | **Client stub** | **Marshalls** (serializes) the function name and arguments into bytes |
| 3 | **Client runtime** | Sends the serialized request over the network |
| 4 | **Server runtime** | Receives the bytes from the network |
| 5 | **Server stub** | **Unmarshalls** (deserializes) the function name and arguments |
| 6 | **Server code** | Executes `add(3, 5)` and gets result `8` |
| 7 | **Server stub** | Marshalls the return value `8` |
| 8 | **Server runtime** | Sends the serialized response back |
| 9 | **Client stub** | Unmarshalls the response |
| 10 | **Client code** | Receives `8` as the return value |

### Marshalling and Unmarshalling

**Marshalling** (also called serialization) is the process of converting in-memory data structures into a byte sequence that can be sent over the network.

```python
# Conceptual marshalling example
def marshall(function_name, args):
    """Convert function call to bytes."""
    payload = {
        "method": function_name,
        "params": args,
        "id": generate_request_id(),
    }
    return json.dumps(payload).encode("utf-8")

# marshall("add", [3, 5]) → b'{"method":"add","params":[3,5],"id":"abc123"}'

def unmarshall(data):
    """Convert bytes back to function call components."""
    payload = json.loads(data.decode("utf-8"))
    return payload["method"], payload["params"], payload["id"]
```

### Key Serialization Formats

| Format | Type | Speed | Size | Human Readable |
|--------|------|-------|------|---------------|
| **JSON** | Text | Moderate | Large | Yes |
| **Protocol Buffers** | Binary | Fast | Small | No |
| **MessagePack** | Binary | Fast | Small | No |
| **Avro** | Binary | Fast | Small | No (schema separate) |
| **XML** | Text | Slow | Very large | Yes |

---

## RPC Semantics

When a network call fails, the client doesn't know if the server **received and executed** the request or not. This ambiguity leads to three possible **RPC semantics**:

### At-Most-Once

The operation executes **zero or one time**. The client does **not** retry on failure.

```
Client           Network          Server
  │── request ──►  ✗              │     ← lost!
  │                               │
  │  (timeout, give up)           │
  │  Error returned to caller     │
```

- **Guarantee**: The function ran 0 or 1 times
- **Use when**: Operations are NOT idempotent (e.g., charging a credit card)
- **Risk**: The operation might have succeeded but the response was lost

### At-Least-Once

The client **retries** until it gets a response. The operation may execute **multiple times**.

```
Client           Network          Server
  │── request ──►  ✗              │     ← lost!
  │                               │
  │  (timeout, retry)             │
  │── request ──────────────────►│
  │                    execute!   │
  │◄── response ─────────────────│
```

- **Guarantee**: The function ran 1 or more times
- **Use when**: Operations ARE idempotent (e.g., reading data, setting a value)
- **Risk**: Side effects may happen multiple times

### Exactly-Once

The operation executes **exactly one time**, regardless of retries or failures. This is the **hardest** to achieve.

```
Client           Network          Server
  │── request(id=42) ───────────►│
  │                    execute!   │
  │◄── response ──  ✗            │     ← response lost!
  │                               │
  │  (timeout, retry)             │
  │── request(id=42) ───────────►│
  │               already did 42! │     ← dedup!
  │◄── cached response ─────────│     ← return same result
```

**Requirements for exactly-once:**

| Requirement | Purpose |
|-------------|---------|
| **Unique request IDs** | Identify duplicate requests |
| **Server-side dedup table** | Remember which requests were processed |
| **Persistent state** | Survive server crashes |
| **Idempotent retries** | Client retries with same ID |

> **Reality check**: True exactly-once is impossible in general (see the Two Generals Problem). Systems approximate it with **effectively-once** semantics using deduplication.

---

## Challenges of RPC

RPC tries to make remote calls look like local calls, but they are **fundamentally different**:

| Challenge | Local Call | Remote Call |
|-----------|-----------|-------------|
| **Latency** | Nanoseconds | Milliseconds to seconds |
| **Failure modes** | Process crash | Network failure, timeout, partial failure |
| **Data transfer** | Shared memory (zero-cost) | Serialization + network transfer |
| **Security** | Trusted | Untrusted network, authentication needed |
| **Versioning** | Recompile together | Client/server may run different versions |
| **Discovery** | Link-time binding | Runtime service discovery needed |

### Partial Failure

The most dangerous challenge. With local calls, either the call succeeds or the entire process crashes. With RPC, the call might:

- Succeed, but the response is lost
- Fail after the server partially executed
- Time out (you don't know what happened)

```
Possible outcomes of an RPC call:
┌─────────────────────────────────────────┐
│ 1. Success: got response                │ ← easy
│ 2. Server error: got error response     │ ← clear
│ 3. Timeout: no response at all          │ ← DANGEROUS
│    - Did the server execute the call?   │
│    - Is the server down?                │
│    - Is the network partitioned?        │
│    - Did the response get lost?         │
│    → YOU DON'T KNOW!                    │
└─────────────────────────────────────────┘
```

---

## Interface Definition Language (IDL)

An **IDL** defines the contract between client and server — what methods are available, what types they accept, and what they return. Code generators produce client stubs and server stubs from the IDL.

### Why IDL?

```
Without IDL:
  Client (Python) → ???  → Server (Java)
  "What methods exist? What types do they expect?"

With IDL:
  service.proto (shared contract)
     ↓ code generation
  Client stub (Python)  +  Server stub (Java)
  Both agree on the interface!
```

### Protocol Buffers IDL (used by gRPC)

```protobuf
// calculator.proto
syntax = "proto3";

package calculator;

// Service definition
service Calculator {
  rpc Add(AddRequest) returns (AddResponse);
  rpc Multiply(MultiplyRequest) returns (MultiplyResponse);
  rpc SumStream(stream Number) returns (SumResponse);  // client streaming
}

// Message definitions
message AddRequest {
  int32 a = 1;   // field number, not default value!
  int32 b = 2;
}

message AddResponse {
  int32 result = 1;
}

message MultiplyRequest {
  int32 a = 1;
  int32 b = 2;
}

message MultiplyResponse {
  int32 result = 1;
}

message Number {
  int32 value = 1;
}

message SumResponse {
  int32 total = 1;
}
```

### Apache Thrift IDL

```thrift
// calculator.thrift
namespace java com.example.calculator
namespace py calculator

service Calculator {
  i32 add(1: i32 a, 2: i32 b),
  i32 multiply(1: i32 a, 2: i32 b),
}
```

---

## Major RPC Frameworks

| Framework | IDL | Transport | Serialization | Language Support |
|-----------|-----|-----------|---------------|-----------------|
| **gRPC** | Protocol Buffers | HTTP/2 | Protobuf (binary) | 10+ languages |
| **Apache Thrift** | Thrift IDL | TCP | Binary, Compact, JSON | 20+ languages |
| **JSON-RPC** | None (convention) | HTTP, WebSocket | JSON | Any |
| **XML-RPC** | None (convention) | HTTP | XML | Any |
| **Cap'n Proto** | Cap'n Proto schema | TCP | Zero-copy binary | C++, Rust, others |
| **Twirp** | Protocol Buffers | HTTP 1.1 | Protobuf or JSON | Go-focused |

### JSON-RPC Example

JSON-RPC is the simplest RPC protocol — just JSON over HTTP:

```python
import json
import http.client

# JSON-RPC Request
request = {
    "jsonrpc": "2.0",
    "method": "add",
    "params": [3, 5],
    "id": 1,
}

# Send the request
conn = http.client.HTTPConnection("localhost", 8080)
conn.request(
    "POST",
    "/rpc",
    body=json.dumps(request),
    headers={"Content-Type": "application/json"},
)

# JSON-RPC Response
response = json.loads(conn.getresponse().read())
# {"jsonrpc": "2.0", "result": 8, "id": 1}
print(f"Result: {response['result']}")
```

### JSON-RPC Server (Python)

```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class RPCHandler(BaseHTTPRequestHandler):
    """A minimal JSON-RPC server."""

    methods = {}

    @classmethod
    def register(cls, name, func):
        cls.methods[name] = func

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        request = json.loads(body)

        method = request.get("method")
        params = request.get("params", [])
        req_id = request.get("id")

        if method in self.methods:
            result = self.methods[method](*params)
            response = {"jsonrpc": "2.0", "result": result, "id": req_id}
        else:
            response = {
                "jsonrpc": "2.0",
                "error": {"code": -32601, "message": "Method not found"},
                "id": req_id,
            }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

# Register methods
RPCHandler.register("add", lambda a, b: a + b)
RPCHandler.register("multiply", lambda a, b: a * b)

# Start server
server = HTTPServer(("0.0.0.0", 8080), RPCHandler)
print("JSON-RPC server on port 8080")
server.serve_forever()
```

---

## gRPC Deep Dive

**gRPC** is Google's modern, high-performance RPC framework. It's the most popular RPC framework for microservices.

### Why gRPC?

| Feature | Benefit |
|---------|---------|
| **HTTP/2** | Multiplexing, header compression, server push |
| **Protocol Buffers** | Fast serialization, small messages, strong typing |
| **Streaming** | Client, server, and bidirectional streaming |
| **Deadlines** | Automatic timeout propagation |
| **Interceptors** | Middleware for auth, logging, metrics |
| **Code generation** | Auto-generate client/server code in 10+ languages |
| **Load balancing** | Built-in client-side load balancing |

### gRPC Communication Patterns

```
1. Unary RPC (request-response):
   Client ──request──► Server
   Client ◄──response── Server

2. Server streaming:
   Client ──request──────────► Server
   Client ◄──response 1────── Server
   Client ◄──response 2────── Server
   Client ◄──response N────── Server

3. Client streaming:
   Client ──request 1──────► Server
   Client ──request 2──────► Server
   Client ──request N──────► Server
   Client ◄──response─────── Server

4. Bidirectional streaming:
   Client ──request 1──────► Server
   Client ◄──response 1──── Server
   Client ──request 2──────► Server
   Client ◄──response 2──── Server
   (interleaved, independent streams)
```

### Building a gRPC Service: Step by Step

**Step 1: Define the service (`.proto` file)**

```protobuf
// greeter.proto
syntax = "proto3";

package greeter;

service Greeter {
  // Unary
  rpc SayHello (HelloRequest) returns (HelloReply);

  // Server streaming
  rpc SayHelloMany (HelloRequest) returns (stream HelloReply);
}

message HelloRequest {
  string name = 1;
  int32 times = 2;   // for streaming: how many greetings
}

message HelloReply {
  string message = 1;
  string timestamp = 2;
}
```

**Step 2: Generate code**

```bash
# Install gRPC tools
pip install grpcio grpcio-tools

# Generate Python code from .proto
python -m grpc_tools.protoc \
  -I. \
  --python_out=. \
  --grpc_python_out=. \
  greeter.proto

# This generates:
#   greeter_pb2.py        ← message classes
#   greeter_pb2_grpc.py   ← client/server stubs
```

**Step 3: Implement the server**

```python
# server.py
import grpc
from concurrent import futures
from datetime import datetime, timezone

import greeter_pb2
import greeter_pb2_grpc


class GreeterServicer(greeter_pb2_grpc.GreeterServicer):
    """Implementation of the Greeter service."""

    def SayHello(self, request, context):
        """Unary RPC: one request, one response."""
        print(f"Received request for: {request.name}")
        return greeter_pb2.HelloReply(
            message=f"Hello, {request.name}!",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    def SayHelloMany(self, request, context):
        """Server streaming: one request, many responses."""
        for i in range(request.times):
            yield greeter_pb2.HelloReply(
                message=f"Hello #{i + 1}, {request.name}!",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    greeter_pb2_grpc.add_GreeterServicer_to_server(
        GreeterServicer(), server
    )
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC server started on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
```

**Step 4: Implement the client**

```python
# client.py
import grpc
import greeter_pb2
import greeter_pb2_grpc


def run():
    # Create a channel (connection) to the server
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = greeter_pb2_grpc.GreeterStub(channel)

        # Unary call
        response = stub.SayHello(
            greeter_pb2.HelloRequest(name="Alice")
        )
        print(f"Unary: {response.message} at {response.timestamp}")

        # Server streaming call
        print("\nStreaming responses:")
        responses = stub.SayHelloMany(
            greeter_pb2.HelloRequest(name="Bob", times=3)
        )
        for response in responses:
            print(f"  {response.message} at {response.timestamp}")


if __name__ == "__main__":
    run()
```

### gRPC Deadlines and Timeouts

Deadlines propagate across service calls — if Service A calls B calls C, the deadline is shared:

```python
# Client sets a deadline of 5 seconds
try:
    response = stub.SayHello(
        greeter_pb2.HelloRequest(name="Alice"),
        timeout=5.0,  # 5-second deadline
    )
except grpc.RpcError as e:
    if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
        print("Request timed out!")
    elif e.code() == grpc.StatusCode.UNAVAILABLE:
        print("Server is unavailable!")
```

**Deadline propagation:**

```
Service A (deadline: 5s)
  → calls Service B (remaining: 4.8s)
    → calls Service C (remaining: 4.5s)
      → if C takes > 4.5s → DEADLINE_EXCEEDED propagates back
```

### gRPC Interceptors

Interceptors are middleware for cross-cutting concerns:

```python
import grpc
import time

class LoggingInterceptor(grpc.UnaryUnaryClientInterceptor):
    """Log every RPC call with timing."""

    def intercept_unary_unary(self, continuation, call_details, request):
        method = call_details.method
        start = time.time()

        # Make the actual call
        response = continuation(call_details, request)

        elapsed = time.time() - start
        print(f"RPC {method} took {elapsed:.3f}s")

        return response

# Use the interceptor
channel = grpc.insecure_channel("localhost:50051")
intercept_channel = grpc.intercept_channel(
    channel, LoggingInterceptor()
)
stub = greeter_pb2_grpc.GreeterStub(intercept_channel)
```

---

## RPC vs REST Comparison

| Feature | RPC (gRPC) | REST (HTTP/JSON) |
|---------|-----------|-----------------|
| **Contract** | Strict (IDL/Protobuf) | Loose (OpenAPI optional) |
| **Serialization** | Binary (Protobuf) | Text (JSON) |
| **Transport** | HTTP/2 | HTTP/1.1 or HTTP/2 |
| **Streaming** | Native support | WebSockets or SSE needed |
| **Performance** | High (small messages, fast parsing) | Moderate (verbose, text parsing) |
| **Browser support** | Limited (needs grpc-web proxy) | Native |
| **Human readable** | No (binary) | Yes (JSON) |
| **Tooling** | Specialized (protoc, grpcurl) | Universal (curl, Postman) |
| **Caching** | Application-level | HTTP caching built-in |
| **Discovery** | Service mesh / registry | URL-based |

### When to Use Each

| Scenario | Recommendation |
|----------|---------------|
| Microservice ↔ microservice | **gRPC** (performance, streaming) |
| Browser ↔ server | **REST** (native support) |
| Mobile app ↔ server | **gRPC** (small payloads save bandwidth) |
| Public API | **REST** (universally accessible) |
| Real-time streaming | **gRPC** (bidirectional streaming) |
| Polyglot services | **gRPC** (code gen for all languages) |

### Performance Comparison

Serialization size for a typical message:

| Format | Size (bytes) | Parse Time (relative) |
|--------|-------------|----------------------|
| Protobuf | ~50 | 1× |
| JSON | ~120 | 3–5× |
| XML | ~200 | 5–10× |

For $N$ messages per second, the bandwidth difference is:

$$\text{Bandwidth}_{saved} = N \times (\text{Size}_{JSON} - \text{Size}_{Protobuf})$$

At 100,000 messages/sec: $(120 - 50) \times 100{,}000 = 7$ MB/s saved.

---

## Exercises

1. **JSON-RPC Implementation**: Build a JSON-RPC server with methods for `add`, `subtract`, `multiply`, and `divide`. Handle division by zero as an RPC error. Write a client that calls all four methods.

2. **Retry Logic**: Implement a function `rpc_call_with_retry(func, max_retries=3, backoff=1.0)` that:
   - Retries on timeout errors
   - Uses exponential backoff: wait $b \times 2^{n}$ seconds after attempt $n$
   - Adds jitter to prevent thundering herd
   - Returns the result or raises after max retries

3. **IDL Design**: Design a Protocol Buffers `.proto` file for a simple key-value store with `Get(key)`, `Put(key, value)`, `Delete(key)`, and `List()` operations.

4. **Semantics Analysis**: For each of these operations, decide if at-most-once, at-least-once, or exactly-once semantics is most appropriate, and explain why:
   - Reading a user's profile
   - Transferring money between accounts
   - Sending a notification email
   - Incrementing a page view counter

5. **gRPC Service**: Using the gRPC example from this lesson, add a bidirectional streaming method where the client sends names and the server responds with personalized greetings in real-time.

---

## Key Takeaways

| Concept | Key Point |
|---------|-----------|
| **RPC** | Makes remote calls look like local calls — but they aren't! |
| **Stubs** | Client and server stubs handle marshalling/unmarshalling |
| **Marshalling** | Serialization of data for network transfer |
| **At-most-once** | No retry — safe but may lose requests |
| **At-least-once** | Retry — safe only for idempotent operations |
| **Exactly-once** | Hardest; needs dedup + persistent state |
| **IDL** | Shared contract between client and server |
| **gRPC** | Modern, fast, uses Protobuf + HTTP/2 + streaming |
| **RPC vs REST** | RPC for internal services; REST for public/browser APIs |
| **Partial failure** | The fundamental challenge — timeouts are ambiguous |

---

## Next Steps

Now that you understand RPC, the next lesson covers **Message Passing** — an alternative communication model where processes communicate by sending messages through queues and brokers, enabling loose coupling and asynchronous processing.
