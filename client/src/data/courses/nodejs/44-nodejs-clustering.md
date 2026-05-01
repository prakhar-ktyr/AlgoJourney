---
title: Node.js Clustering
---

# Node.js Clustering

A single Node.js process uses one CPU core. On a server with 8 cores, 87% of the CPU sits idle. The **cluster module** spawns multiple worker processes that share the same port, utilizing all available cores.

## How clustering works

```
                    ┌──────────────┐
                    │ Master Process│
                    │ (manages)     │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐
    │  Worker 1  │  │  Worker 2  │  │  Worker 3  │
    │  (core 1)  │  │  (core 2)  │  │  (core 3)  │
    └────────────┘  └────────────┘  └────────────┘
```

The master process forks worker processes. Incoming connections are distributed across workers by the OS (round-robin on Linux, random on other platforms).

## Basic cluster example

```javascript
// server.js
import cluster from "node:cluster";
import { cpus } from "node:os";
import http from "node:http";

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} starting`);
  console.log(`Forking ${numCPUs} workers...`);

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart crashed workers
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code})`);
    console.log("Starting a new worker...");
    cluster.fork();
  });
} else {
  // Worker process — create the server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  }).listen(3000);

  console.log(`Worker ${process.pid} started`);
}
```

Output:

```
Primary process 12345 starting
Forking 8 workers...
Worker 12346 started
Worker 12347 started
Worker 12348 started
...
```

## Clustering with Express

```javascript
import cluster from "node:cluster";
import { cpus } from "node:os";
import express from "express";

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  const app = express();

  app.get("/", (req, res) => {
    res.json({ pid: process.pid, message: "Hello!" });
  });

  app.get("/heavy", (req, res) => {
    // Simulate CPU work
    let sum = 0;
    for (let i = 0; i < 1e8; i++) sum += i;
    res.json({ pid: process.pid, sum });
  });

  app.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });
}
```

## Communication between primary and workers

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();

  // Send message to worker
  worker.send({ type: "config", data: { maxRetries: 3 } });

  // Receive from worker
  worker.on("message", (msg) => {
    console.log("From worker:", msg);
  });

  // Broadcast to all workers
  for (const id in cluster.workers) {
    cluster.workers[id].send({ type: "update", data: "new config" });
  }
} else {
  // Worker
  process.on("message", (msg) => {
    console.log("From primary:", msg);
  });

  // Send to primary
  process.send({ type: "status", ready: true });
}
```

## Graceful shutdown

```javascript
if (cluster.isPrimary) {
  function shutdown() {
    console.log("Shutting down...");
    for (const id in cluster.workers) {
      cluster.workers[id].send("shutdown");
    }
    setTimeout(() => process.exit(0), 10000); // force after 10s
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} else {
  const server = app.listen(3000);

  process.on("message", (msg) => {
    if (msg === "shutdown") {
      server.close(() => {
        console.log(`Worker ${process.pid} closed`);
        process.exit(0);
      });
    }
  });
}
```

## PM2 — production process manager

In production, use **PM2** instead of manual clustering. PM2 handles forking, restarting, logging, and monitoring:

```bash
npm install -g pm2
```

### Starting your app

```bash
# Start with clustering (all CPUs)
pm2 start server.js -i max

# Start with specific worker count
pm2 start server.js -i 4

# Start with a name
pm2 start server.js --name "myapp" -i max
```

### PM2 commands

```bash
pm2 list                  # show all processes
pm2 monit                 # real-time monitoring dashboard
pm2 logs                  # view logs
pm2 logs myapp            # view specific app logs
pm2 restart myapp         # restart all workers
pm2 reload myapp          # zero-downtime reload
pm2 stop myapp            # stop
pm2 delete myapp          # remove from PM2
pm2 info myapp            # detailed process info
```

### PM2 ecosystem file

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "myapp",
      script: "server.js",
      instances: "max",       // use all CPUs
      exec_mode: "cluster",   // enable cluster mode
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      max_memory_restart: "500M", // restart if exceeds 500MB
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
    },
  ],
};
```

```bash
pm2 start ecosystem.config.cjs
pm2 start ecosystem.config.cjs --env production
```

### Zero-downtime reload

```bash
pm2 reload myapp
```

PM2 restarts workers one at a time — old workers finish their current requests before shutting down. No dropped connections.

### Auto-start on boot

```bash
pm2 startup          # generate startup script
pm2 save             # save current process list
```

## Cluster vs. Worker Threads

| Feature | Cluster | Worker Threads |
|---------|---------|---------------|
| Creates | Separate processes | Threads in same process |
| Memory | Separate (isolated) | Can share (`SharedArrayBuffer`) |
| Communication | IPC messages | `postMessage` or shared memory |
| Use case | Scale HTTP servers | CPU-intensive tasks |
| Overhead | Higher (process fork) | Lower (thread) |

**Use cluster** to scale your server across cores. **Use worker threads** for specific CPU tasks within a single process.

## Key takeaways

- The **cluster module** forks multiple worker processes to use all CPU cores.
- Workers share the same port — the OS distributes connections.
- Auto-restart crashed workers with `cluster.on("exit")`.
- In production, use **PM2** for clustering, monitoring, log management, and zero-downtime reloads.
- Cluster = scale servers across cores. Worker threads = offload CPU work within a process.
