---
title: Node.js Buffers
---

# Node.js Buffers

A **Buffer** is a fixed-size chunk of raw binary data. Think of it as an array of bytes. Buffers exist because JavaScript strings are designed for text (Unicode), but many operations — reading files, network packets, image data, cryptography — deal with raw bytes.

## Why buffers?

When you read a file without specifying an encoding, you get a Buffer:

```javascript
import fs from "node:fs";

const data = fs.readFileSync("image.png");
console.log(data);
// <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d ...>
```

Each two-character pair (like `89`, `50`) is one byte in hexadecimal. Buffers are how Node.js handles binary data.

## Creating Buffers

### From a string

```javascript
const buf = Buffer.from("Hello, World!");
console.log(buf);        // <Buffer 48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21>
console.log(buf.length); // 13 bytes
```

### With a specific encoding

```javascript
const buf = Buffer.from("Hello", "utf8");     // default
const buf2 = Buffer.from("48656c6c6f", "hex"); // from hex
const buf3 = Buffer.from("SGVsbG8=", "base64"); // from base64

console.log(buf2.toString());  // 'Hello'
console.log(buf3.toString());  // 'Hello'
```

### Allocate a buffer of a specific size

```javascript
// Filled with zeros (safe — recommended)
const buf = Buffer.alloc(10);
console.log(buf); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Filled with a specific value
const buf2 = Buffer.alloc(5, 0xff);
console.log(buf2); // <Buffer ff ff ff ff ff>

// Uninitialized (faster but may contain old data — use carefully)
const buf3 = Buffer.allocUnsafe(10);
```

> **Security note:** `Buffer.allocUnsafe()` is faster because it skips zeroing memory, but the buffer may contain sensitive leftover data from previous allocations. Only use it when you will immediately overwrite the entire buffer.

### From an array of bytes

```javascript
const buf = Buffer.from([72, 101, 108, 108, 111]);
console.log(buf.toString()); // 'Hello'
```

## Converting Buffers to strings

```javascript
const buf = Buffer.from("Hello, World!");

buf.toString();          // 'Hello, World!' (default: utf8)
buf.toString("hex");     // '48656c6c6f2c20576f726c6421'
buf.toString("base64");  // 'SGVsbG8sIFdvcmxkIQ=='
buf.toString("utf8", 0, 5); // 'Hello' (start, end offsets)
```

## Buffer length vs string length

Buffer length is in **bytes**, not characters. This matters for multi-byte characters:

```javascript
const ascii = Buffer.from("Hello");
console.log(ascii.length); // 5 bytes (1 byte per char)

const emoji = Buffer.from("👋");
console.log(emoji.length); // 4 bytes (emoji uses 4 bytes in UTF-8)

const japanese = Buffer.from("こんにちは");
console.log(japanese.length); // 15 bytes (3 bytes per char in UTF-8)
```

## Reading and writing individual bytes

```javascript
const buf = Buffer.from("Hello");

// Read
console.log(buf[0]);       // 72 (ASCII code for 'H')
console.log(buf[1]);       // 101 (ASCII code for 'e')

// Write
buf[0] = 74;               // ASCII code for 'J'
console.log(buf.toString()); // 'Jello'
```

## Slicing buffers

`subarray()` creates a view into the same memory (no copy):

```javascript
const buf = Buffer.from("Hello, World!");
const slice = buf.subarray(0, 5);

console.log(slice.toString()); // 'Hello'

// Modifying the slice modifies the original!
slice[0] = 74; // 'J'
console.log(buf.toString()); // 'Jello, World!'
```

## Copying buffers

```javascript
const source = Buffer.from("Hello");
const target = Buffer.alloc(5);

source.copy(target);
console.log(target.toString()); // 'Hello'

// Copy a portion
source.copy(target, 0, 1, 4); // copy bytes 1-3 of source to target starting at 0
console.log(target.toString()); // 'elllo' (partial overwrite)
```

## Concatenating buffers

```javascript
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.from(", ");
const buf3 = Buffer.from("World!");

const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString()); // 'Hello, World!'
```

## Comparing buffers

```javascript
const a = Buffer.from("abc");
const b = Buffer.from("abc");
const c = Buffer.from("def");

a.equals(b); // true
a.equals(c); // false

Buffer.compare(a, c); // -1 (a comes before c)
Buffer.compare(c, a); // 1  (c comes after a)
Buffer.compare(a, b); // 0  (equal)
```

## Searching in buffers

```javascript
const buf = Buffer.from("Hello, World! Hello, Node!");

buf.includes("World");   // true
buf.indexOf("Hello");    // 0
buf.lastIndexOf("Hello"); // 14
buf.indexOf("Missing");  // -1
```

## Iterating over a buffer

```javascript
const buf = Buffer.from("Hello");

for (const byte of buf) {
  console.log(byte); // 72, 101, 108, 108, 111
}

// Or use values(), keys(), entries()
for (const [index, byte] of buf.entries()) {
  console.log(`${index}: ${byte} (${String.fromCharCode(byte)})`);
}
```

## Typed array interop

Buffers are `Uint8Array` subclasses, so they work with typed array methods:

```javascript
const buf = Buffer.from([10, 20, 30, 40, 50]);

const mapped = buf.map((b) => b * 2);
console.log(mapped); // Uint8Array [20, 40, 60, 80, 100]

const filtered = buf.filter((b) => b > 20);
console.log(filtered); // Uint8Array [30, 40, 50]
```

> **Note:** `map()` and `filter()` return `Uint8Array`, not `Buffer`.

## Practical examples

### Base64 encoding/decoding

```javascript
// Encode
const encoded = Buffer.from("Hello, World!").toString("base64");
console.log(encoded); // 'SGVsbG8sIFdvcmxkIQ=='

// Decode
const decoded = Buffer.from(encoded, "base64").toString("utf8");
console.log(decoded); // 'Hello, World!'
```

### Reading binary file headers

```javascript
import fs from "node:fs/promises";

const buf = await fs.readFile("image.png");

// PNG files start with these magic bytes
const isPNG =
  buf[0] === 0x89 &&
  buf[1] === 0x50 &&
  buf[2] === 0x4e &&
  buf[3] === 0x47;

console.log("Is PNG:", isPNG);
```

### Convert between hex and bytes

```javascript
const hex = "48656c6c6f";
const buf = Buffer.from(hex, "hex");
console.log(buf.toString()); // 'Hello'

const backToHex = buf.toString("hex");
console.log(backToHex); // '48656c6c6f'
```

## Key takeaways

- Buffers represent raw binary data as a fixed-size byte array.
- Use `Buffer.from()` to create from strings, arrays, or other buffers.
- Use `Buffer.alloc()` for safe, zero-filled buffers.
- Convert to strings with `.toString(encoding)` — `"utf8"`, `"hex"`, `"base64"`.
- Buffer length is in **bytes**, not characters.
- `subarray()` creates a view (shared memory), not a copy.
- Buffers are critical for file I/O, network protocols, and cryptography.
