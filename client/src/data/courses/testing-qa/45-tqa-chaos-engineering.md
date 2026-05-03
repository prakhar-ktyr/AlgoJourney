---
title: Chaos Engineering
---

# Chaos Engineering

## What Is Chaos Engineering?

Chaos engineering is the discipline of experimenting on a system to build confidence in its ability to withstand turbulent conditions in production. Rather than waiting for failures to happen, you proactively inject faults to discover weaknesses before they cause outages.

The core idea: **break things on purpose** so you can fix them before they break unexpectedly.

## Principles of Chaos Engineering

1. **Define Steady State**: Establish baseline metrics (response times, error rates, throughput)
2. **Form a Hypothesis**: "If we kill one replica, failover completes in <5s with no errors"
3. **Minimize Blast Radius**: Start small, test in staging first, keep a kill switch ready
4. **Run in Production**: Staging rarely matches production—real chaos targets real systems
5. **Automate Continuously**: One-off experiments help; continuous chaos builds lasting confidence

## Failure Types to Inject

| Failure Type | Description | Example |
|---|---|---|
| Network latency | Add delay to calls | 500ms on DB queries |
| Server crash | Kill a process | Terminate container |
| Disk full | Fill disk to capacity | /tmp at 100% |
| Dependency failure | Service unavailable | Payment API → 503 |
| CPU/Memory stress | Exhaust resources | Saturate CPU cores |

## Tools

- **Chaos Monkey** (Netflix): Randomly terminates production instances
- **Gremlin**: Commercial platform with network, state, and resource attacks
- **LitmusChaos**: Kubernetes-native chaos using CRDs
- **Azure Chaos Studio**: Managed chaos for Azure resources

## Game Days

A planned chaos experiment where the team defines scope, sets up monitoring, injects failures, observes behavior, and documents findings. Builds organizational muscle memory for real incidents.

## Circuit Breaker Pattern

Prevents cascading failures by stopping calls to a failing service:

- **Closed**: Requests flow normally
- **Open**: Requests fail immediately (fast fail)
- **Half-Open**: Limited requests test if the service recovered

## Code: Circuit Breaker and Retry Logic

```python
import time
import random
from functools import wraps
from unittest.mock import MagicMock
import unittest


class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "closed"
        self.last_failure_time = None

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half-open"
            else:
                raise CircuitBreakerOpenError("Circuit is open")
        try:
            result = func(*args, **kwargs)
            self.failure_count = 0
            self.state = "closed"
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise e


class CircuitBreakerOpenError(Exception):
    pass


def retry_with_backoff(max_retries=3, base_delay=1.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries:
                        raise e
                    delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), 30.0)
                    time.sleep(delay)
        return wrapper
    return decorator


class TestCircuitBreaker(unittest.TestCase):
    def test_opens_after_threshold(self):
        cb = CircuitBreaker(failure_threshold=3)
        failing = MagicMock(side_effect=ConnectionError("fail"))
        for _ in range(3):
            with self.assertRaises(ConnectionError):
                cb.call(failing)
        self.assertEqual(cb.state, "open")

    def test_rejects_when_open(self):
        cb = CircuitBreaker(failure_threshold=1)
        with self.assertRaises(ConnectionError):
            cb.call(MagicMock(side_effect=ConnectionError()))
        with self.assertRaises(CircuitBreakerOpenError):
            cb.call(MagicMock())

    def test_recovers_after_timeout(self):
        cb = CircuitBreaker(failure_threshold=1, recovery_timeout=1)
        with self.assertRaises(ConnectionError):
            cb.call(MagicMock(side_effect=ConnectionError()))
        time.sleep(1.1)
        result = cb.call(MagicMock(return_value="ok"))
        self.assertEqual(result, "ok")
        self.assertEqual(cb.state, "closed")
```

```javascript
class CircuitBreaker {
  constructor({ failureThreshold = 3, recoveryTimeout = 30000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.failureCount = 0;
    this.state = "closed";
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit is open");
      }
    }
    try {
      const result = await fn();
      this.failureCount = 0;
      this.state = "closed";
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.failureThreshold) this.state = "open";
      throw error;
    }
  }
}

async function retryWithBackoff(fn, { maxRetries = 3, baseDelay = 1000 } = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 1000, 30000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// --- Tests ---
describe("CircuitBreaker", () => {
  it("opens after threshold failures", async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    const fail = () => Promise.reject(new Error("timeout"));
    for (let i = 0; i < 3; i++) await expect(cb.call(fail)).rejects.toThrow();
    expect(cb.state).toBe("open");
  });

  it("rejects when open", async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeout: 60000 });
    await expect(cb.call(() => Promise.reject(new Error()))).rejects.toThrow();
    await expect(cb.call(() => Promise.resolve())).rejects.toThrow("Circuit is open");
  });

  it("recovers after timeout", async () => {
    vi.useFakeTimers();
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeout: 1000 });
    await expect(cb.call(() => Promise.reject(new Error()))).rejects.toThrow();
    vi.advanceTimersByTime(1100);
    expect(await cb.call(() => Promise.resolve("ok"))).toBe("ok");
    vi.useRealTimers();
  });
});
```

```java
import java.time.Instant;
import java.util.concurrent.Callable;

public class CircuitBreaker {
    private final int failureThreshold;
    private final long recoveryTimeoutMs;
    private int failureCount = 0;
    private String state = "closed";
    private Instant lastFailureTime;

    public CircuitBreaker(int failureThreshold, long recoveryTimeoutMs) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeoutMs = recoveryTimeoutMs;
    }

    public <T> T call(Callable<T> action) throws Exception {
        if ("open".equals(state)) {
            if (Instant.now().toEpochMilli() - lastFailureTime.toEpochMilli() > recoveryTimeoutMs)
                state = "half-open";
            else
                throw new CircuitBreakerOpenException("Circuit is open");
        }
        try {
            T result = action.call();
            failureCount = 0;
            state = "closed";
            return result;
        } catch (Exception e) {
            failureCount++;
            lastFailureTime = Instant.now();
            if (failureCount >= failureThreshold) state = "open";
            throw e;
        }
    }

    public String getState() { return state; }
}

class CircuitBreakerOpenException extends RuntimeException {
    public CircuitBreakerOpenException(String msg) { super(msg); }
}

// --- JUnit 5 Tests ---
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CircuitBreakerTest {
    @Test
    void opensAfterThreshold() {
        CircuitBreaker cb = new CircuitBreaker(3, 10000);
        for (int i = 0; i < 3; i++)
            assertThrows(RuntimeException.class, () ->
                cb.call(() -> { throw new RuntimeException("fail"); }));
        assertEquals("open", cb.getState());
    }

    @Test
    void rejectsWhenOpen() {
        CircuitBreaker cb = new CircuitBreaker(1, 60000);
        assertThrows(RuntimeException.class, () ->
            cb.call(() -> { throw new RuntimeException(); }));
        assertThrows(CircuitBreakerOpenException.class, () -> cb.call(() -> "x"));
    }

    @Test
    void recoversAfterTimeout() throws Exception {
        CircuitBreaker cb = new CircuitBreaker(1, 100);
        assertThrows(RuntimeException.class, () ->
            cb.call(() -> { throw new RuntimeException(); }));
        Thread.sleep(150);
        assertEquals("recovered", cb.call(() -> "recovered"));
        assertEquals("closed", cb.getState());
    }
}
```

```csharp
using System;
using System.Threading.Tasks;

public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _recoveryTimeout;
    private int _failureCount;
    private string _state = "closed";
    private DateTime? _lastFailureTime;
    public string State => _state;

    public CircuitBreaker(int failureThreshold, TimeSpan recoveryTimeout)
    {
        _failureThreshold = failureThreshold;
        _recoveryTimeout = recoveryTimeout;
    }

    public async Task<T> CallAsync<T>(Func<Task<T>> action)
    {
        if (_state == "open")
        {
            if (DateTime.UtcNow - _lastFailureTime > _recoveryTimeout)
                _state = "half-open";
            else
                throw new CircuitBreakerOpenException("Circuit is open");
        }
        try
        {
            var result = await action();
            _failureCount = 0; _state = "closed";
            return result;
        }
        catch
        {
            _failureCount++;
            _lastFailureTime = DateTime.UtcNow;
            if (_failureCount >= _failureThreshold) _state = "open";
            throw;
        }
    }
}

public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException(string msg) : base(msg) { }
}

// --- xUnit Tests ---
using Xunit;

public class CircuitBreakerTests
{
    [Fact]
    public async Task OpensAfterThreshold()
    {
        var cb = new CircuitBreaker(3, TimeSpan.FromSeconds(10));
        for (int i = 0; i < 3; i++)
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                cb.CallAsync<string>(() => throw new InvalidOperationException()));
        Assert.Equal("open", cb.State);
    }

    [Fact]
    public async Task RejectsWhenOpen()
    {
        var cb = new CircuitBreaker(1, TimeSpan.FromMinutes(1));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            cb.CallAsync<string>(() => throw new InvalidOperationException()));
        await Assert.ThrowsAsync<CircuitBreakerOpenException>(() =>
            cb.CallAsync(() => Task.FromResult("x")));
    }

    [Fact]
    public async Task RecoversAfterTimeout()
    {
        var cb = new CircuitBreaker(1, TimeSpan.FromMilliseconds(100));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            cb.CallAsync<string>(() => throw new InvalidOperationException()));
        await Task.Delay(150);
        var result = await cb.CallAsync(() => Task.FromResult("recovered"));
        Assert.Equal("recovered", result);
        Assert.Equal("closed", cb.State);
    }
}
```

## Key Takeaways

- Chaos engineering builds confidence through controlled failure injection
- Always start with a hypothesis and minimize blast radius
- Circuit breakers prevent cascading failures across services
- Retry logic with exponential backoff handles transient failures gracefully
- Game days build team readiness for real incidents
