---
title: HTML Web Workers
---

# HTML Web Workers

Web Workers run JavaScript in a **background thread**, preventing long-running scripts from freezing the UI.

---

## The Problem

JavaScript runs on a single thread. Heavy computations block everything:

```html
<script>
    // This freezes the page for several seconds!
    function heavyTask() {
        let result = 0;
        for (let i = 0; i < 1e9; i++) {
            result += Math.sqrt(i);
        }
        return result;
    }
</script>
```

Web Workers solve this by running code in a **separate thread**.

---

## Creating a Web Worker

**main.html:**
```html
<button onclick="startWorker()">Start Heavy Task</button>
<p id="result">Result: waiting...</p>

<script>
    let worker;

    function startWorker() {
        worker = new Worker("worker.js");

        worker.onmessage = function(e) {
            document.getElementById("result").textContent = "Result: " + e.data;
        };

        worker.onerror = function(e) {
            console.error("Worker error:", e.message);
        };

        worker.postMessage("start");
    }
</script>
```

**worker.js:**
```javascript
self.onmessage = function(e) {
    if (e.data === "start") {
        let result = 0;
        for (let i = 0; i < 1e9; i++) {
            result += Math.sqrt(i);
        }
        self.postMessage(result);
    }
};
```

---

## Communication

Workers communicate via **message passing**:

```html
<script>
    // Main thread → Worker
    worker.postMessage({ type: "calculate", data: [1, 2, 3, 4, 5] });

    // Worker → Main thread
    worker.onmessage = function(e) {
        console.log("Result:", e.data);
    };
</script>
```

**In the worker:**
```javascript
self.onmessage = function(e) {
    const { type, data } = e.data;
    if (type === "calculate") {
        const sum = data.reduce((a, b) => a + b, 0);
        self.postMessage(sum);
    }
};
```

---

## Terminating Workers

```html
<script>
    // From main thread
    worker.terminate();
</script>
```

```javascript
// From within the worker
self.close();
```

---

## Worker Limitations

| Can Do | Cannot Do |
|--------|-----------|
| JavaScript computation | Access the DOM |
| `fetch()` / `XMLHttpRequest` | Access `document` or `window` |
| `setTimeout` / `setInterval` | Use `alert()` or `confirm()` |
| `postMessage` communication | Access parent's variables |
| Import scripts | Use some Web APIs |

---

## Summary

- Web Workers run JavaScript in a **background thread**
- Communicate via **`postMessage()`** and **`onmessage`**
- Workers **cannot access the DOM** — only compute and return results
- Use for **heavy computations**, data processing, image manipulation
- Terminate with **`worker.terminate()`**
