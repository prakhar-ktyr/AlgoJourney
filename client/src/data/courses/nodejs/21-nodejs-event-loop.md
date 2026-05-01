---
title: Node.js Event Loop
---

# Node.js Event Loop

The event loop is the heart of Node.js. It is the mechanism that allows Node.js to perform non-blocking I/O operations on a single thread by offloading work to the operating system whenever possible. Understanding the event loop is what separates beginners from confident Node.js developers.

## The big picture

```
   ┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks deferred to next loop
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll             │  ← retrieve new I/O events; execute I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │  ← socket.on('close'), etc.
│  └─────────────┬─────────────┘
│                 │
└─────────────────┘
```

The event loop cycles through these **phases** repeatedly. Each phase has a queue of callbacks to execute. When the queue is exhausted (or a maximum number of callbacks is reached), the loop moves to the next phase.

## The phases explained

### 1. Timers

Executes callbacks scheduled by `setTimeout()` and `setInterval()`.

A timer specifies a **minimum delay**, not an exact time. If the event loop is busy in another phase, the callback will be delayed.

```javascript
// "Run after at least 100ms" — could be longer if the loop is busy
setTimeout(() => console.log("timer"), 100);
```

### 2. Pending callbacks

Executes I/O callbacks that were deferred to the next loop iteration. For example, certain TCP errors.

### 3. Idle, prepare

Internal phases used by Node.js internals. You never interact with these.

### 4. Poll

The poll phase does two things:

1. Calculates how long to block and wait for I/O.
2. Processes events in the poll queue (I/O callbacks like file reads, network responses).

If there are no timers scheduled, the poll phase will **block and wait** for I/O events. This is what makes Node.js efficient — it's not busy-looping; it's sleeping until there's work to do.

### 5. Check

Executes `setImmediate()` callbacks. This phase runs right after the poll phase completes.

### 6. Close callbacks

Executes close event callbacks, like `socket.on("close", ...)`.

## Microtasks: process.nextTick and Promises

Between **every phase transition**, Node.js processes two special queues:

1. **nextTick queue** — callbacks from `process.nextTick()`
2. **Microtask queue** — resolved Promise callbacks (`.then()`, `await` continuations)

The nextTick queue always runs before the microtask queue.

```javascript
console.log("1. Synchronous");

process.nextTick(() => console.log("2. nextTick"));

Promise.resolve().then(() => console.log("3. Promise microtask"));

setTimeout(() => console.log("4. setTimeout"), 0);

setImmediate(() => console.log("5. setImmediate"));
```

Output:

```
1. Synchronous
2. nextTick
3. Promise microtask
4. setTimeout
5. setImmediate
```

## Visual execution order

```
┌─────────────────────────────────┐
│         Synchronous code        │  ← runs first, completely
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│      process.nextTick queue     │  ← runs before any async
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│     Microtask queue (Promises)  │  ← .then(), await continuations
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│     Event loop phases begin     │  ← timers → poll → check → ...
└─────────────────────────────────┘
```

## Deep-dive example

```javascript
import fs from "node:fs";

console.log("A: sync start");

setTimeout(() => {
  console.log("B: setTimeout 0ms");
}, 0);

setImmediate(() => {
  console.log("C: setImmediate");
});

fs.readFile("package.json", () => {
  console.log("D: I/O callback");

  setTimeout(() => {
    console.log("E: setTimeout inside I/O");
  }, 0);

  setImmediate(() => {
    console.log("F: setImmediate inside I/O");
  });

  process.nextTick(() => {
    console.log("G: nextTick inside I/O");
  });
});

Promise.resolve().then(() => {
  console.log("H: Promise microtask");
});

process.nextTick(() => {
  console.log("I: nextTick");
});

console.log("J: sync end");
```

Output:

```
A: sync start
J: sync end
I: nextTick
H: Promise microtask
B: setTimeout 0ms
C: setImmediate
D: I/O callback
G: nextTick inside I/O
F: setImmediate inside I/O
E: setTimeout inside I/O
```

Let's trace through:

1. **Synchronous:** A, J print.
2. **nextTick queue:** I prints.
3. **Microtask queue:** H prints.
4. **Timers phase:** B prints (setTimeout 0).
5. **Check phase:** C prints (setImmediate).
6. **Poll phase (next iteration):** D prints (I/O callback).
7. **nextTick (between phases):** G prints.
8. **Check phase:** F prints (setImmediate inside I/O always before setTimeout inside I/O).
9. **Timers phase (next iteration):** E prints.

## Why does this matter?

Understanding the event loop helps you:

1. **Avoid blocking the loop.** CPU-intensive synchronous code (sorting a million items, complex regex, image processing) freezes your entire server. No requests are handled while the loop is stuck.

```javascript
// BAD — blocks the event loop for seconds
app.get("/heavy", (req, res) => {
  const result = fibonacci(45); // CPU-bound — blocks everything
  res.json({ result });
});

// GOOD — offload to a worker thread
import { Worker } from "node:worker_threads";

app.get("/heavy", (req, res) => {
  const worker = new Worker("./fibonacci-worker.js", {
    workerData: { n: 45 },
  });
  worker.on("message", (result) => res.json({ result }));
});
```

2. **Predict execution order** when mixing setTimeout, setImmediate, Promises, and nextTick.

3. **Avoid starving the loop** with recursive nextTick:

```javascript
// BAD — I/O callbacks never run
function bad() {
  process.nextTick(bad); // nextTick runs before I/O!
}
bad();

// GOOD — give I/O a chance
function good() {
  setImmediate(good); // runs after I/O
}
```

## The thread pool (libuv)

While JavaScript runs on a single thread, Node.js uses a **thread pool** (default: 4 threads) via libuv for operations that the OS can't do asynchronously:

- File system operations (on some OSes)
- DNS lookups (`dns.lookup`)
- Certain crypto operations
- Compression (zlib)

You can increase the pool size:

```bash
UV_THREADPOOL_SIZE=8 node app.js
```

The default of 4 threads is usually enough. Only increase it if you see contention (e.g., many concurrent file reads slowing down).

## Monitoring the event loop

### Event loop delay

```javascript
const start = process.hrtime.bigint();

setImmediate(() => {
  const delay = Number(process.hrtime.bigint() - start) / 1e6;
  console.log(`Event loop delay: ${delay.toFixed(2)}ms`);
});
```

If the delay is consistently high, something is blocking the event loop.

### Using perf_hooks

```javascript
import { monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setTimeout(() => {
  console.log(`Mean event loop delay: ${histogram.mean / 1e6}ms`);
  console.log(`P99 event loop delay: ${histogram.percentile(99) / 1e6}ms`);
  histogram.disable();
}, 5000);
```

## Key takeaways

- The event loop has phases: timers → pending → poll → check → close.
- `process.nextTick` and Promise microtasks run **between** every phase.
- The poll phase is where I/O callbacks execute and where the loop waits for new events.
- Never block the event loop with CPU-heavy synchronous code — use worker threads.
- `setImmediate` runs after I/O, `process.nextTick` runs before everything else.
- The thread pool handles file I/O, DNS, crypto, and compression behind the scenes.
