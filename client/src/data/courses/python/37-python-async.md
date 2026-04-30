---
title: Python Async
---

# Python Async

`async`/`await` lets a single thread juggle many I/O-bound tasks (network, disk, subprocess) concurrently. It's the backbone of modern Python web frameworks (**FastAPI**, **aiohttp**, **httpx**) and tools that need to talk to many things at once.

> **Async is for I/O, not CPU.** A pure-Python loop running async code uses one CPU core. For parallel CPU work, use `multiprocessing` or `concurrent.futures`.

## A first taste

```python
import asyncio

async def hello(name, delay):
    await asyncio.sleep(delay)
    print(f"Hello, {name}!")

async def main():
    await asyncio.gather(
        hello("Ada", 1),
        hello("Bo", 2),
        hello("Carol", 0.5),
    )

asyncio.run(main())
```

Total runtime: ~2 seconds (the longest sleep), not 3.5. The three coroutines wait _concurrently_.

## Coroutines

A function defined with `async def` is a **coroutine function**. Calling it returns a **coroutine object** — it doesn't run yet:

```python
async def f():
    return 42

f()        # <coroutine object f at 0x...>  — not run!
```

To run it you need to **await** it inside another coroutine, or schedule it on the event loop with `asyncio.run`, `asyncio.create_task`, or `asyncio.gather`.

## `await` — pause this coroutine

```python
async def fetch():
    await asyncio.sleep(1)        # pauses for 1s without blocking the loop
    return "done"
```

While one coroutine is awaiting, the event loop runs other ready ones. That's where the concurrency comes from.

You can only `await` inside an `async def`. The interpreter enforces this.

## Running coroutines

```python
import asyncio

async def main():
    print("hi")

asyncio.run(main())          # the standard entry point
```

`asyncio.run` creates an event loop, runs the coroutine, then closes the loop.

### Concurrently — `gather`

```python
async def fetch(url):
    ...
    return body

async def main():
    results = await asyncio.gather(
        fetch("https://example.com/a"),
        fetch("https://example.com/b"),
        fetch("https://example.com/c"),
    )
```

### Fire-and-forget — `create_task`

```python
async def main():
    task = asyncio.create_task(some_work())
    await do_other_stuff()
    result = await task          # await it later
```

A task is a coroutine that's been scheduled to run.

### Timeouts

```python
async def main():
    try:
        result = await asyncio.wait_for(slow(), timeout=2.0)
    except asyncio.TimeoutError:
        print("gave up")
```

In Python 3.11+:

```python
async with asyncio.timeout(2.0):
    result = await slow()
```

### Task groups (Python 3.11+)

A safer `gather` that cancels siblings on failure:

```python
async with asyncio.TaskGroup() as tg:
    tg.create_task(work_a())
    tg.create_task(work_b())
# Both tasks are awaited at the end of the block.
# If one raises, the other is cancelled.
```

## A real example — concurrent HTTP

With `httpx` (`pip install httpx`):

```python
import asyncio
import httpx

async def fetch(client, url):
    r = await client.get(url)
    return url, r.status_code

async def main():
    urls = [
        "https://api.github.com",
        "https://pypi.org",
        "https://python.org",
    ]
    async with httpx.AsyncClient(timeout=10) as client:
        tasks = [fetch(client, u) for u in urls]
        for url, status in await asyncio.gather(*tasks):
            print(status, url)

asyncio.run(main())
```

Three requests, started essentially in parallel, total time ≈ the slowest single request.

## Async context managers and iterators

```python
async with httpx.AsyncClient() as client:        # __aenter__ / __aexit__
    ...

async for line in stream:                         # __aiter__ / __anext__
    print(line)
```

You can write your own:

```python
class AsyncTimer:
    async def __aenter__(self):
        self.start = time.perf_counter()
        return self
    async def __aexit__(self, *exc):
        print(f"{time.perf_counter() - self.start:.2f}s")
```

## Don't mix blocking and async

The cardinal sin: calling `time.sleep(5)` or `requests.get(...)` inside an async function blocks the event loop — every other coroutine grinds to a halt.

```python
async def bad():
    time.sleep(5)                # BLOCKS the loop

async def good():
    await asyncio.sleep(5)       # yields to the loop
```

For unavoidable blocking calls, push them onto a thread:

```python
import asyncio

result = await asyncio.to_thread(blocking_call, arg1, arg2)
```

## Async vs threads vs processes

| Tool                                      | Best for                                                      |
| ----------------------------------------- | ------------------------------------------------------------- |
| `asyncio`                                 | many concurrent **I/O** operations in one process             |
| `threading`                               | a few I/O operations, or libraries that don't have async APIs |
| `multiprocessing` / `ProcessPoolExecutor` | **CPU-bound** parallelism                                     |
| `concurrent.futures`                      | one API for thread/process pools                              |

Async is great when you need to handle thousands of slow network calls at once (web scrapers, web servers). It's overkill for a script that does five DB queries — just write it synchronously.

## Try it — fetch many URLs

```python
import asyncio
import time
import urllib.request

URLS = ["https://example.com"] * 10

def sync_run():
    start = time.perf_counter()
    for u in URLS:
        urllib.request.urlopen(u).read()
    return time.perf_counter() - start

async def fetch(url):
    return await asyncio.to_thread(lambda: urllib.request.urlopen(url).read())

async def async_run():
    start = time.perf_counter()
    await asyncio.gather(*(fetch(u) for u in URLS))
    return time.perf_counter() - start

print(f"sync : {sync_run():.2f}s")
print(f"async: {asyncio.run(async_run()):.2f}s")
```

The async version should be roughly N× faster, where N is the number of URLs (up to network limits).
