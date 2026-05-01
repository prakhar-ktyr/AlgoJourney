---
title: Node.js Streams
---

# Node.js Streams

Streams let you process data **piece by piece** instead of loading everything into memory at once. This is essential for large files, network connections, and real-time data. A 2 GB file that would crash your program with `readFile` can be processed smoothly with streams.

## The problem streams solve

```javascript
// BAD — loads the entire file into memory
import fs from "node:fs/promises";
const data = await fs.readFile("huge-file.csv", "utf8");
// If the file is 4 GB, you need 4 GB of RAM

// GOOD — processes the file in small chunks
import fs from "node:fs";
const stream = fs.createReadStream("huge-file.csv", "utf8");
stream.on("data", (chunk) => {
  // Each chunk is ~64 KB — you never hold the whole file
  processChunk(chunk);
});
```

## Four types of streams

| Type | Description | Example |
|---|---|---|
| **Readable** | Source of data you read from | File read, HTTP request body, stdin |
| **Writable** | Destination you write to | File write, HTTP response, stdout |
| **Duplex** | Both readable and writable | TCP socket, WebSocket |
| **Transform** | Duplex that modifies data passing through | gzip compression, encryption |

## Readable streams

### Creating a readable stream

```javascript
import fs from "node:fs";

const readable = fs.createReadStream("data.txt", {
  encoding: "utf8",
  highWaterMark: 64 * 1024, // chunk size in bytes (default: 64 KB)
});
```

### Consuming with events

```javascript
readable.on("data", (chunk) => {
  console.log(`Received ${chunk.length} characters`);
});

readable.on("end", () => {
  console.log("No more data");
});

readable.on("error", (err) => {
  console.error("Read error:", err.message);
});
```

### Consuming with async iteration (modern, recommended)

```javascript
import fs from "node:fs";

const readable = fs.createReadStream("data.txt", "utf8");

for await (const chunk of readable) {
  console.log(`Chunk: ${chunk.length} chars`);
}

console.log("Done reading");
```

### Pausing and resuming

Readable streams start in **paused mode**. Attaching a `"data"` listener switches them to **flowing mode**. You can pause and resume:

```javascript
readable.on("data", (chunk) => {
  console.log("Received chunk");

  readable.pause(); // stop receiving data

  setTimeout(() => {
    readable.resume(); // continue after 1 second
  }, 1000);
});
```

## Writable streams

### Creating a writable stream

```javascript
import fs from "node:fs";

const writable = fs.createWriteStream("output.txt");
```

### Writing data

```javascript
writable.write("Line 1\n");
writable.write("Line 2\n");
writable.write("Line 3\n");
writable.end("Last line\n"); // end() writes final data and closes the stream
```

### Events

```javascript
writable.on("finish", () => {
  console.log("All data written");
});

writable.on("error", (err) => {
  console.error("Write error:", err.message);
});
```

### Handling backpressure

`write()` returns `false` when the internal buffer is full. You should wait for the `"drain"` event before writing more:

```javascript
function writeData(writable, data) {
  const ok = writable.write(data);
  if (!ok) {
    // Buffer is full — wait for drain
    return new Promise((resolve) => writable.once("drain", resolve));
  }
}

const writable = fs.createWriteStream("big-output.txt");

for (let i = 0; i < 1_000_000; i++) {
  await writeData(writable, `Line ${i}\n`);
}

writable.end();
```

## Piping — connecting streams

The `pipe()` method connects a readable stream to a writable stream. Data flows automatically, and backpressure is handled for you:

```javascript
import fs from "node:fs";

const readable = fs.createReadStream("input.txt");
const writable = fs.createWriteStream("output.txt");

readable.pipe(writable);

writable.on("finish", () => {
  console.log("File copied!");
});
```

### Chaining pipes

```javascript
import fs from "node:fs";
import { createGzip } from "node:zlib";

// Read a file, compress it, write the compressed version
fs.createReadStream("data.txt")
  .pipe(createGzip())
  .pipe(fs.createWriteStream("data.txt.gz"));
```

### Pipeline (recommended over pipe)

`pipe()` doesn't handle errors well — if a stream in the middle errors, the others may leak. Use `pipeline()` instead:

```javascript
import { pipeline } from "node:stream/promises";
import fs from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(
  fs.createReadStream("data.txt"),
  createGzip(),
  fs.createWriteStream("data.txt.gz"),
);

console.log("Compression complete");
```

`pipeline()` properly destroys all streams if any of them error.

## Transform streams

A transform stream modifies data as it passes through:

```javascript
import { Transform } from "node:stream";

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

// Usage: pipe input through the transform to output
process.stdin.pipe(upperCase).pipe(process.stdout);
```

### Practical transform: Line counter

```javascript
import { Transform } from "node:stream";

class LineCounter extends Transform {
  constructor() {
    super();
    this.count = 0;
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString();
    this.count += (str.match(/\n/g) || []).length;
    this.push(chunk); // pass data through unchanged
    callback();
  }

  _flush(callback) {
    this.push(`\n--- Total lines: ${this.count} ---\n`);
    callback();
  }
}
```

## Duplex streams

A duplex stream is both readable and writable. TCP sockets are the most common example:

```javascript
import net from "node:net";

const server = net.createServer((socket) => {
  // socket is a duplex stream
  socket.on("data", (data) => {
    socket.write(`Echo: ${data}`); // read from client, write back
  });
});

server.listen(8080);
```

## Standard I/O streams

Node.js provides built-in streams for standard I/O:

```javascript
// process.stdin  — Readable stream
// process.stdout — Writable stream
// process.stderr — Writable stream

process.stdin.setEncoding("utf8");

process.stdin.on("data", (input) => {
  process.stdout.write(`You typed: ${input}`);
});
```

## Stream utilities

### stream.Readable.from() — Create a stream from an iterable

```javascript
import { Readable } from "node:stream";

const stream = Readable.from(["Hello", " ", "World"]);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
// Hello World
```

### Collecting a stream into a string

```javascript
import { Readable } from "node:stream";

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
```

Or in Node.js 20+:

```javascript
import { text } from "node:stream/consumers";

const str = await text(readableStream);
```

## Practical example: CSV line processor

```javascript
import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

class CSVParser extends Transform {
  #buffer = "";

  _transform(chunk, encoding, callback) {
    this.#buffer += chunk.toString();
    const lines = this.#buffer.split("\n");
    this.#buffer = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      if (line.trim()) {
        this.push(JSON.stringify(line.split(",")) + "\n");
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.#buffer.trim()) {
      this.push(JSON.stringify(this.#buffer.split(",")) + "\n");
    }
    callback();
  }
}

await pipeline(
  fs.createReadStream("data.csv"),
  new CSVParser(),
  fs.createWriteStream("data.jsonl"),
);
```

## Key takeaways

- Streams process data in chunks, keeping memory usage low.
- Four types: Readable, Writable, Duplex, Transform.
- Use `pipeline()` (not `pipe()`) for proper error handling.
- Use `for await...of` to consume readable streams.
- Backpressure prevents fast producers from overwhelming slow consumers.
- Streams are used everywhere: file I/O, HTTP, compression, encryption.
