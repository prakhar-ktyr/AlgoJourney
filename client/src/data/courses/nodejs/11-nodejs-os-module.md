---
title: Node.js OS Module
---

# Node.js OS Module

The `os` module provides operating system-related utility methods. It lets you get information about the CPU, memory, network interfaces, user info, and more — all without shelling out to system commands.

## Importing

```javascript
import os from "node:os";
```

## System information

### Platform

```javascript
os.platform();  // 'darwin' (macOS), 'linux', 'win32' (Windows)
```

### Operating system type

```javascript
os.type();      // 'Darwin', 'Linux', 'Windows_NT'
```

### OS release version

```javascript
os.release();   // '23.1.0' (macOS), '5.15.0-91-generic' (Linux)
```

### Architecture

```javascript
os.arch();      // 'x64', 'arm64'
```

### Machine type

```javascript
os.machine();   // 'x86_64', 'arm64' (Node.js 18.9+)
```

### Hostname

```javascript
os.hostname();  // 'my-macbook-pro'
```

### System uptime

```javascript
os.uptime();    // 1234567 (seconds since last boot)

// Convert to hours
const hours = (os.uptime() / 3600).toFixed(1);
console.log(`System uptime: ${hours} hours`);
```

## CPU information

### CPU details

```javascript
const cpus = os.cpus();
console.log(`CPU cores: ${cpus.length}`);
console.log(`Model: ${cpus[0].model}`);
console.log(`Speed: ${cpus[0].speed} MHz`);
```

Each CPU object contains:

```javascript
{
  model: 'Apple M2 Pro',
  speed: 3490,
  times: {
    user: 1234567,    // time spent in user mode (ms)
    nice: 0,          // time spent in nice mode
    sys: 567890,      // time spent in system mode
    idle: 9876543,    // time spent idle
    irq: 0            // time spent servicing interrupts
  }
}
```

### CPU usage example

```javascript
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
    usage: ((1 - totalIdle / totalTick) * 100).toFixed(1) + "%",
  };
}

console.log(getCpuUsage());
```

## Memory information

### Total and free memory

```javascript
os.totalmem();  // Total system memory in bytes
os.freemem();   // Available memory in bytes
```

### Human-readable memory info

```javascript
function formatBytes(bytes) {
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(2)} GB`;
}

console.log(`Total memory: ${formatBytes(os.totalmem())}`);
console.log(`Free memory:  ${formatBytes(os.freemem())}`);
console.log(`Used memory:  ${formatBytes(os.totalmem() - os.freemem())}`);
```

Output:

```
Total memory: 16.00 GB
Free memory:  4.23 GB
Used memory:  11.77 GB
```

## User information

### Current user

```javascript
os.userInfo();
```

Returns:

```javascript
{
  uid: 501,
  gid: 20,
  username: 'alice',
  homedir: '/Users/alice',
  shell: '/bin/zsh'
}
```

### Home directory

```javascript
os.homedir();   // '/Users/alice' (macOS), '/home/alice' (Linux)
```

### Temp directory

```javascript
os.tmpdir();    // '/tmp' (Unix), 'C:\\Users\\alice\\AppData\\Local\\Temp' (Windows)
```

## Network interfaces

```javascript
const interfaces = os.networkInterfaces();

for (const [name, addrs] of Object.entries(interfaces)) {
  for (const addr of addrs) {
    if (addr.family === "IPv4" && !addr.internal) {
      console.log(`${name}: ${addr.address}`);
    }
  }
}
```

Output:

```
en0: 192.168.1.42
```

### Get local IP address

```javascript
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const addrs of Object.values(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return "127.0.0.1";
}

console.log(`Local IP: ${getLocalIP()}`);
```

## End-of-line marker

```javascript
os.EOL; // '\n' on Unix, '\r\n' on Windows
```

Use this when writing files that need platform-correct line endings:

```javascript
import fs from "node:fs/promises";

const lines = ["Line 1", "Line 2", "Line 3"];
await fs.writeFile("output.txt", lines.join(os.EOL) + os.EOL);
```

## Practical example: System info reporter

```javascript
import os from "node:os";

function systemReport() {
  const formatBytes = (b) => `${(b / 1024 ** 3).toFixed(2)} GB`;
  const formatUptime = (s) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return {
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
    memory: `${formatBytes(os.freemem())} free / ${formatBytes(os.totalmem())} total`,
    uptime: formatUptime(os.uptime()),
    user: os.userInfo().username,
    nodeVersion: process.version,
  };
}

console.table(systemReport());
```

## Key takeaways

- `os.platform()`, `os.type()`, `os.arch()` tell you about the OS.
- `os.cpus()` returns CPU info per core.
- `os.totalmem()` and `os.freemem()` return memory in bytes.
- `os.homedir()` and `os.tmpdir()` give you common directories.
- `os.networkInterfaces()` lists network adapters and IP addresses.
- `os.EOL` gives the platform-correct line ending.
