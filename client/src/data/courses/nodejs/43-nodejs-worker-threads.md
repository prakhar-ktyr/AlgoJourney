---
title: Node.js Worker Threads
---

# Node.js Worker Threads

Node.js runs JavaScript on a single thread. Heavy computation (image processing, data crunching, encryption) blocks the event loop and freezes your server. **Worker threads** run JavaScript in separate threads, keeping the main thread responsive.

## When to use worker threads

| Scenario | Use workers? | Why |
|----------|-------------|-----|
| CPU-intensive calculation | Yes | Prevents blocking the event loop |
| Image/video processing | Yes | Heavy computation |
| Data parsing (large CSV/JSON) | Yes | Can take seconds |
| File I/O | No | Already async via libuv |
| HTTP requests | No | Already non-blocking |
| Database queries | No | Already async |

**Rule of thumb**: if it's I/O, Node.js handles it. If it's CPU work, use worker threads.

## Basic worker thread

### Main thread

```javascript
// main.js
import { Worker } from "node:worker_threads";

const worker = new Worker("./worker.js");

// Send data to worker
worker.postMessage({ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });

// Receive result from worker
worker.on("message", (result) => {
  console.log("Sum:", result); // Sum: 55
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

worker.on("exit", (code) => {
  console.log("Worker exited with code:", code);
});
```

### Worker thread

```javascript
// worker.js
import { parentPort } from "node:worker_threads";

parentPort.on("message", (data) => {
  const sum = data.numbers.reduce((a, b) => a + b, 0);
  parentPort.postMessage(sum);
});
```

## Inline workers (no separate file)

```javascript
import { Worker, isMainThread, parentPort } from "node:worker_threads";

if (isMainThread) {
  // Main thread
  const worker = new Worker(new URL(import.meta.url));
  worker.postMessage(42);
  worker.on("message", (result) => {
    console.log("Fibonacci:", result);
  });
} else {
  // Worker thread
  parentPort.on("message", (n) => {
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    parentPort.postMessage(fibonacci(n));
  });
}
```

## Passing data to workers

### workerData (initial data)

```javascript
// main.js
const worker = new Worker("./worker.js", {
  workerData: { threshold: 1000000, multiplier: 2 },
});
```

```javascript
// worker.js
import { workerData, parentPort } from "node:worker_threads";

console.log(workerData.threshold);  // 1000000
console.log(workerData.multiplier); // 2

// Process and return result
parentPort.postMessage("done");
```

### postMessage (ongoing communication)

```javascript
// main.js
worker.postMessage({ task: "process", data: [1, 2, 3] });
worker.postMessage({ task: "stop" });

// worker.js
parentPort.on("message", (msg) => {
  if (msg.task === "process") {
    // do work
    parentPort.postMessage({ result: "processed" });
  } else if (msg.task === "stop") {
    process.exit(0);
  }
});
```

## SharedArrayBuffer

For high-performance scenarios, share memory between threads:

```javascript
// main.js
import { Worker } from "node:worker_threads";

// Create shared memory (1024 bytes)
const sharedBuffer = new SharedArrayBuffer(1024);
const sharedArray = new Int32Array(sharedBuffer);

// Initialize
sharedArray[0] = 0;

const worker = new Worker("./worker.js", {
  workerData: { sharedBuffer },
});

worker.on("exit", () => {
  console.log("Counter:", sharedArray[0]); // modified by worker
});
```

```javascript
// worker.js
import { workerData } from "node:worker_threads";
import { Atomics } from "node:worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);

// Atomic operations prevent race conditions
for (let i = 0; i < 1000; i++) {
  Atomics.add(sharedArray, 0, 1);
}
```

## Worker pool pattern

Creating a new worker for every task is expensive. A worker pool reuses workers:

```javascript
// worker-pool.js
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";

class WorkerPool {
  constructor(workerFile, poolSize = cpus().length) {
    this.workerFile = workerFile;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];

    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }

  addWorker() {
    const worker = new Worker(this.workerFile);
    worker.busy = false;
    worker.on("message", (result) => {
      worker.busy = false;
      worker.resolve(result);
      this.processQueue();
    });
    worker.on("error", (err) => {
      worker.busy = false;
      worker.reject(err);
      this.processQueue();
    });
    this.workers.push(worker);
  }

  processQueue() {
    if (this.queue.length === 0) return;
    const freeWorker = this.workers.find((w) => !w.busy);
    if (!freeWorker) return;

    const { data, resolve, reject } = this.queue.shift();
    freeWorker.busy = true;
    freeWorker.resolve = resolve;
    freeWorker.reject = reject;
    freeWorker.postMessage(data);
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
  }
}

export default WorkerPool;
```

Usage:

```javascript
const pool = new WorkerPool("./heavy-task.js", 4);

// Run tasks concurrently across 4 workers
const results = await Promise.all([
  pool.execute({ data: "task1" }),
  pool.execute({ data: "task2" }),
  pool.execute({ data: "task3" }),
  pool.execute({ data: "task4" }),
  pool.execute({ data: "task5" }), // queued until a worker is free
]);

pool.destroy();
```

## Using with Express

Keep the event loop free by offloading heavy work:

```javascript
import express from "express";
import { Worker } from "node:worker_threads";

const app = express();

app.get("/api/fibonacci/:n", (req, res) => {
  const n = parseInt(req.params.n);

  const worker = new Worker("./fib-worker.js", {
    workerData: { n },
  });

  worker.on("message", (result) => {
    res.json({ n, result });
  });

  worker.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });
});

app.listen(3000);
```

```javascript
// fib-worker.js
import { workerData, parentPort } from "node:worker_threads";

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort.postMessage(fibonacci(workerData.n));
```

## Key takeaways

- Worker threads run JavaScript in **separate threads** for CPU-intensive tasks.
- Use `postMessage` / `on("message")` to communicate between threads.
- Use `workerData` to pass initial data to a worker.
- Use `SharedArrayBuffer` with `Atomics` for high-performance shared memory.
- Create a **worker pool** to reuse workers instead of spawning one per request.
- Don't use workers for I/O operations — they're already async in Node.js.
