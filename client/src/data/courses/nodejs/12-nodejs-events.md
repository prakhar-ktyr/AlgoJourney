---
title: Node.js Events
---

# Node.js Events

Node.js is built around an **event-driven architecture**. Many core objects — HTTP servers, streams, child processes — emit events that you can listen and react to. The `events` module provides the `EventEmitter` class that powers all of this.

## The EventEmitter class

```javascript
import { EventEmitter } from "node:events";

const emitter = new EventEmitter();
```

An `EventEmitter` has two main operations:

1. **Listen** for an event — `.on(eventName, callback)`
2. **Emit** an event — `.emit(eventName, ...args)`

## Basic usage

```javascript
import { EventEmitter } from "node:events";

const emitter = new EventEmitter();

// Register a listener
emitter.on("greet", (name) => {
  console.log(`Hello, ${name}!`);
});

// Emit the event
emitter.emit("greet", "Alice"); // Hello, Alice!
emitter.emit("greet", "Bob");   // Hello, Bob!
```

## Multiple listeners

You can attach multiple listeners to the same event. They fire in the order they were registered:

```javascript
const emitter = new EventEmitter();

emitter.on("save", () => console.log("1. Validating data..."));
emitter.on("save", () => console.log("2. Writing to database..."));
emitter.on("save", () => console.log("3. Sending notification..."));

emitter.emit("save");
// 1. Validating data...
// 2. Writing to database...
// 3. Sending notification...
```

## Passing data with events

You can pass any number of arguments when emitting:

```javascript
const emitter = new EventEmitter();

emitter.on("order", (item, quantity, price) => {
  console.log(`Order: ${quantity}x ${item} @ $${price} = $${quantity * price}`);
});

emitter.emit("order", "Widget", 3, 9.99);
// Order: 3x Widget @ $9.99 = $29.97
```

## once() — Listen only once

```javascript
const emitter = new EventEmitter();

emitter.once("connect", () => {
  console.log("Connected! (this only fires once)");
});

emitter.emit("connect"); // Connected! (this only fires once)
emitter.emit("connect"); // nothing happens
```

## Removing listeners

### Remove a specific listener

```javascript
const emitter = new EventEmitter();

function onData(msg) {
  console.log("Received:", msg);
}

emitter.on("data", onData);
emitter.emit("data", "hello"); // Received: hello

emitter.off("data", onData);   // same as removeListener
emitter.emit("data", "world"); // nothing happens
```

> **Note:** You must pass the same function reference. Anonymous functions can't be removed this way.

### Remove all listeners

```javascript
emitter.removeAllListeners("data");  // remove all "data" listeners
emitter.removeAllListeners();        // remove ALL listeners on ALL events
```

## Useful methods

| Method | Description |
|---|---|
| `emitter.on(event, fn)` | Add a listener |
| `emitter.once(event, fn)` | Add a one-time listener |
| `emitter.off(event, fn)` | Remove a listener (alias: `removeListener`) |
| `emitter.emit(event, ...args)` | Fire an event |
| `emitter.listenerCount(event)` | Number of listeners for an event |
| `emitter.eventNames()` | Array of event names with listeners |
| `emitter.removeAllListeners(event?)` | Remove listeners |
| `emitter.prependListener(event, fn)` | Add a listener to the front |

## The "error" event

If an `EventEmitter` emits an `"error"` event and there is no listener for it, Node.js throws the error and crashes the process. **Always handle the error event:**

```javascript
const emitter = new EventEmitter();

// Without a listener, this crashes:
// emitter.emit("error", new Error("something broke")); // THROWS

// With a listener, you handle it gracefully:
emitter.on("error", (err) => {
  console.error("Error caught:", err.message);
});

emitter.emit("error", new Error("something broke"));
// Error caught: something broke
```

## Creating your own event-driven class

The real power of EventEmitter shows when you extend it in your own classes:

```javascript
import { EventEmitter } from "node:events";

class TaskQueue extends EventEmitter {
  #tasks = [];

  add(task) {
    this.#tasks.push(task);
    this.emit("added", task);
  }

  process() {
    while (this.#tasks.length > 0) {
      const task = this.#tasks.shift();
      this.emit("processing", task);

      try {
        task.execute();
        this.emit("completed", task);
      } catch (err) {
        this.emit("error", err);
      }
    }

    this.emit("drained");
  }
}

const queue = new TaskQueue();

queue.on("added", (task) => console.log(`Task added: ${task.name}`));
queue.on("processing", (task) => console.log(`Processing: ${task.name}`));
queue.on("completed", (task) => console.log(`Done: ${task.name}`));
queue.on("error", (err) => console.error(`Failed: ${err.message}`));
queue.on("drained", () => console.log("All tasks complete!"));

queue.add({ name: "Send email", execute() { /* ... */ } });
queue.add({ name: "Resize image", execute() { /* ... */ } });
queue.process();
```

## Events in core Node.js

Many built-in modules use EventEmitter:

### HTTP server

```javascript
import http from "node:http";

const server = http.createServer();

server.on("request", (req, res) => {
  res.end("Hello!\n");
});

server.on("listening", () => {
  console.log("Server is ready");
});

server.listen(3000);
```

### Streams

```javascript
import fs from "node:fs";

const stream = fs.createReadStream("bigfile.txt");

stream.on("data", (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

stream.on("end", () => {
  console.log("File read complete");
});

stream.on("error", (err) => {
  console.error("Read failed:", err.message);
});
```

### Process

```javascript
process.on("exit", (code) => {
  console.log(`Process exiting with code ${code}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err.message);
  process.exit(1);
});
```

## Async event listeners

Listeners can be async, but EventEmitter does not await them. If you need to handle errors from async listeners, catch them yourself:

```javascript
emitter.on("save", async (data) => {
  try {
    await database.save(data);
    console.log("Saved");
  } catch (err) {
    console.error("Save failed:", err.message);
  }
});
```

## Maximum listeners warning

By default, Node.js warns if you add more than 10 listeners to a single event (it's usually a sign of a memory leak):

```
MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
11 "data" listeners added.
```

If you intentionally need more:

```javascript
emitter.setMaxListeners(50);
// or remove the limit
emitter.setMaxListeners(0);
```

## Key takeaways

- `EventEmitter` is the foundation of Node.js event-driven architecture.
- Use `.on()` to listen, `.emit()` to fire events.
- Always handle the `"error"` event to prevent crashes.
- Extend `EventEmitter` to make your own event-driven classes.
- Many core modules (http, fs, streams, process) are EventEmitters.
