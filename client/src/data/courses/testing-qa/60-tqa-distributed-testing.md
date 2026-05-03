---
title: Testing Distributed Systems
---

# Testing Distributed Systems

Distributed systems are notoriously difficult to test. Network partitions, clock drift, message reordering, and partial failures create failure modes that don't exist in single-node applications.

## Challenges of Distributed Testing

### Network Partitions

- Complete network isolation between nodes
- Asymmetric partitions (A can reach B, but B cannot reach A)
- Partial partitions affecting only certain message types
- Transient network flaps

### Clock Drift

- Wall clock times differ between nodes
- NTP corrections can cause time to jump backward
- Logical clocks (Lamport, vector) order events without wall time
- Timeouts based on wall clocks are unreliable

### Eventual Consistency

- Reads from different nodes may return different values
- Writes may appear in different orders on different replicas
- Conflict resolution (last-writer-wins, CRDTs) needs testing
- Convergence time is bounded but unpredictable

## CAP Theorem Implications for Testing

During a network partition, a system must choose between Consistency and Availability.

**Testing CP Systems**: verify writes are rejected during partitions; confirm consistency after healing; test leader election correctness.

**Testing AP Systems**: verify responsiveness during partitions; test conflict resolution; validate eventual convergence.

## Testing Consensus Protocols

### Raft Behaviors to Test

- Leader election completes within bounded time
- Log replication maintains ordering across followers
- Split-brain is prevented (at most one leader per term)
- Committed entries survive leader failures

### Paxos Behaviors to Test

- Proposals accepted by a quorum
- Conflicting proposals resolve deterministically
- Proposer failures don't block progress indefinitely

## Jepsen-Style Testing

1. **Set up** a cluster of nodes
2. **Run** concurrent operations against the cluster
3. **Inject faults** (partitions, process kills, clock skew)
4. **Verify** that system guarantees still hold

### Fault Injection Techniques

- Network partitions via `iptables` rules
- Process crashes via `kill -9`
- Clock skew via `ntpd` manipulation
- Slow I/O via `tc` (traffic control)

### Checking Invariants

- **Linearizability**: operations appear atomically between invocation and response
- **Serializability**: transactions execute in some serial order
- **Causal consistency**: causally related operations appear in order

## Testing Idempotency

- Duplicate message delivery produces same state
- Retried writes don't create duplicate records
- Idempotency keys are properly validated
- Side effects (emails, charges) execute exactly once

## Timeout and Retry Testing

### Retry Patterns

- **Exponential backoff**: progressive delay between retries
- **Jitter**: randomized delay to prevent thundering herd
- **Circuit breaker**: stop retrying after threshold failures
- **Deadline propagation**: remaining time budget passes downstream

## Code: Test Retry Mechanism with Exponential Backoff

```python
import pytest
import time
from unittest.mock import Mock


class RetryExhaustedError(Exception):
    def __init__(self, attempts, last_error):
        self.attempts = attempts
        super().__init__(f"Exhausted {attempts} retries: {last_error}")


class RetryWithBackoff:
    def __init__(self, max_retries=3, base_delay_ms=100, max_delay_ms=5000,
                 backoff_factor=2.0, sleep_fn=None):
        self.max_retries = max_retries
        self.base_delay_ms = base_delay_ms
        self.max_delay_ms = max_delay_ms
        self.backoff_factor = backoff_factor
        self._sleep = sleep_fn or time.sleep
        self.attempts = []

    def calculate_delay(self, attempt):
        delay = self.base_delay_ms * (self.backoff_factor ** attempt)
        return min(delay, self.max_delay_ms)

    def execute(self, operation):
        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                result = operation()
                self.attempts.append({"attempt": attempt, "success": True})
                return result
            except Exception as e:
                last_error = e
                self.attempts.append({"attempt": attempt, "success": False})
                if attempt < self.max_retries:
                    self._sleep(self.calculate_delay(attempt) / 1000)
        raise RetryExhaustedError(self.max_retries + 1, last_error)


class TestRetryWithBackoff:
    def _make_retry(self, **kwargs):
        return RetryWithBackoff(sleep_fn=lambda _: None, **kwargs)

    def test_succeeds_on_first_try(self):
        retry = self._make_retry()
        result = retry.execute(lambda: "ok")
        assert result == "ok"
        assert len(retry.attempts) == 1

    def test_succeeds_after_failures(self):
        retry = self._make_retry(max_retries=3)
        call_count = {"n": 0}
        def op():
            call_count["n"] += 1
            if call_count["n"] < 3:
                raise IOError("timeout")
            return "recovered"
        assert retry.execute(op) == "recovered"

    def test_raises_after_max_retries(self):
        retry = self._make_retry(max_retries=2)
        with pytest.raises(RetryExhaustedError) as exc_info:
            retry.execute(Mock(side_effect=IOError("fail")))
        assert exc_info.value.attempts == 3

    def test_exponential_delays(self):
        retry = self._make_retry(base_delay_ms=100, backoff_factor=2.0)
        assert retry.calculate_delay(0) == 100
        assert retry.calculate_delay(1) == 200
        assert retry.calculate_delay(2) == 400

    def test_delay_capped_at_max(self):
        retry = self._make_retry(base_delay_ms=1000, max_delay_ms=5000)
        assert retry.calculate_delay(5) == 5000
```

```javascript
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

class RetryExhaustedError extends Error {
  constructor(attempts, lastError) {
    super(`Exhausted ${attempts} retries: ${lastError.message}`);
    this.attempts = attempts;
  }
}

class RetryWithBackoff {
  constructor({ maxRetries = 3, baseDelayMs = 100, maxDelayMs = 5000,
                backoffFactor = 2.0, sleepFn = null } = {}) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.backoffFactor = backoffFactor;
    this.sleepFn = sleepFn || ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.attempts = [];
  }

  calculateDelay(attempt) {
    return Math.min(this.baseDelayMs * this.backoffFactor ** attempt, this.maxDelayMs);
  }

  async execute(operation) {
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.attempts.push({ attempt, success: true });
        return result;
      } catch (err) {
        lastError = err;
        this.attempts.push({ attempt, success: false });
        if (attempt < this.maxRetries) await this.sleepFn(this.calculateDelay(attempt));
      }
    }
    throw new RetryExhaustedError(this.maxRetries + 1, lastError);
  }
}

describe("RetryWithBackoff", () => {
  const noopSleep = () => Promise.resolve();

  it("succeeds on first try", async () => {
    const retry = new RetryWithBackoff({ sleepFn: noopSleep });
    assert.equal(await retry.execute(() => "ok"), "ok");
    assert.equal(retry.attempts.length, 1);
  });

  it("succeeds after transient failures", async () => {
    const retry = new RetryWithBackoff({ maxRetries: 3, sleepFn: noopSleep });
    let n = 0;
    const result = await retry.execute(() => { if (++n < 3) throw new Error("fail"); return "ok"; });
    assert.equal(result, "ok");
  });

  it("throws after max retries", async () => {
    const retry = new RetryWithBackoff({ maxRetries: 2, sleepFn: noopSleep });
    await assert.rejects(() => retry.execute(() => { throw new Error("fail"); }),
      (e) => { assert.equal(e.attempts, 3); return true; });
  });

  it("calculates exponential delays", () => {
    const retry = new RetryWithBackoff({ baseDelayMs: 100, backoffFactor: 2 });
    assert.equal(retry.calculateDelay(0), 100);
    assert.equal(retry.calculateDelay(1), 200);
    assert.equal(retry.calculateDelay(2), 400);
  });

  it("caps delay at max", () => {
    const retry = new RetryWithBackoff({ baseDelayMs: 1000, maxDelayMs: 5000 });
    assert.equal(retry.calculateDelay(5), 5000);
  });
});
```

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

class RetryExhaustedError extends RuntimeException {
    final int attempts;
    RetryExhaustedError(int attempts, Throwable last) {
        super("Exhausted " + attempts + " retries", last);
        this.attempts = attempts;
    }
}

class RetryWithBackoff {
    private final int maxRetries;
    private final long baseDelayMs;
    private final long maxDelayMs;
    private final double backoffFactor;
    private final boolean skipSleep;
    int attemptCount = 0;

    RetryWithBackoff(int maxRetries, long baseDelayMs, long maxDelayMs,
                     double backoffFactor, boolean skipSleep) {
        this.maxRetries = maxRetries;
        this.baseDelayMs = baseDelayMs;
        this.maxDelayMs = maxDelayMs;
        this.backoffFactor = backoffFactor;
        this.skipSleep = skipSleep;
    }

    long calculateDelay(int attempt) {
        return (long) Math.min(baseDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
    }

    <T> T execute(Supplier<T> operation) {
        Throwable last = null;
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                T result = operation.get();
                attemptCount = attempt + 1;
                return result;
            } catch (Exception e) {
                last = e;
                attemptCount = attempt + 1;
                if (attempt < maxRetries && !skipSleep) {
                    try { Thread.sleep(calculateDelay(attempt)); }
                    catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
            }
        }
        throw new RetryExhaustedError(maxRetries + 1, last);
    }
}

class RetryWithBackoffTest {
    @Test
    void succeedsOnFirstTry() {
        var retry = new RetryWithBackoff(3, 100, 5000, 2.0, true);
        assertEquals("ok", retry.execute(() -> "ok"));
        assertEquals(1, retry.attemptCount);
    }

    @Test
    void succeedsAfterFailures() {
        var retry = new RetryWithBackoff(3, 100, 5000, 2.0, true);
        var counter = new AtomicInteger(0);
        String result = retry.execute(() -> {
            if (counter.incrementAndGet() < 3) throw new RuntimeException("fail");
            return "recovered";
        });
        assertEquals("recovered", result);
    }

    @Test
    void throwsAfterMaxRetries() {
        var retry = new RetryWithBackoff(2, 100, 5000, 2.0, true);
        var ex = assertThrows(RetryExhaustedError.class,
            () -> retry.execute(() -> { throw new RuntimeException("fail"); }));
        assertEquals(3, ex.attempts);
    }

    @Test
    void exponentialDelays() {
        var retry = new RetryWithBackoff(4, 100, 5000, 2.0, true);
        assertEquals(100, retry.calculateDelay(0));
        assertEquals(200, retry.calculateDelay(1));
        assertEquals(400, retry.calculateDelay(2));
    }

    @Test
    void capsAtMax() {
        var retry = new RetryWithBackoff(10, 1000, 5000, 2.0, true);
        assertEquals(5000, retry.calculateDelay(5));
    }
}
```

```csharp
using Xunit;
using System;
using System.Threading.Tasks;

public class RetryExhaustedError : Exception
{
    public int Attempts { get; }
    public RetryExhaustedError(int attempts, Exception last)
        : base($"Exhausted {attempts} retries", last) { Attempts = attempts; }
}

public class RetryWithBackoff
{
    private readonly int _maxRetries;
    private readonly double _baseDelayMs;
    private readonly double _maxDelayMs;
    private readonly double _backoffFactor;
    private readonly Func<double, Task> _sleepFn;
    public int AttemptCount { get; private set; }

    public RetryWithBackoff(int maxRetries = 3, double baseDelayMs = 100,
        double maxDelayMs = 5000, double backoffFactor = 2.0, Func<double, Task>? sleepFn = null)
    {
        _maxRetries = maxRetries;
        _baseDelayMs = baseDelayMs;
        _maxDelayMs = maxDelayMs;
        _backoffFactor = backoffFactor;
        _sleepFn = sleepFn ?? (ms => Task.Delay(TimeSpan.FromMilliseconds(ms)));
    }

    public double CalculateDelay(int attempt)
        => Math.Min(_baseDelayMs * Math.Pow(_backoffFactor, attempt), _maxDelayMs);

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> operation)
    {
        Exception? last = null;
        for (int attempt = 0; attempt <= _maxRetries; attempt++)
        {
            try { var r = await operation(); AttemptCount = attempt + 1; return r; }
            catch (Exception ex)
            {
                last = ex;
                AttemptCount = attempt + 1;
                if (attempt < _maxRetries) await _sleepFn(CalculateDelay(attempt));
            }
        }
        throw new RetryExhaustedError(_maxRetries + 1, last!);
    }
}

public class RetryTests
{
    private static Func<double, Task> Noop => _ => Task.CompletedTask;

    [Fact]
    public async Task SucceedsOnFirstTry()
    {
        var retry = new RetryWithBackoff(sleepFn: Noop);
        var result = await retry.ExecuteAsync(() => Task.FromResult("ok"));
        Assert.Equal("ok", result);
        Assert.Equal(1, retry.AttemptCount);
    }

    [Fact]
    public async Task SucceedsAfterFailures()
    {
        var retry = new RetryWithBackoff(maxRetries: 3, sleepFn: Noop);
        int n = 0;
        var result = await retry.ExecuteAsync(() =>
        {
            if (++n < 3) throw new Exception("fail");
            return Task.FromResult("recovered");
        });
        Assert.Equal("recovered", result);
    }

    [Fact]
    public async Task ThrowsAfterMaxRetries()
    {
        var retry = new RetryWithBackoff(maxRetries: 2, sleepFn: Noop);
        var ex = await Assert.ThrowsAsync<RetryExhaustedError>(
            () => retry.ExecuteAsync<string>(() => throw new Exception("fail")));
        Assert.Equal(3, ex.Attempts);
    }

    [Fact]
    public void ExponentialDelays()
    {
        var retry = new RetryWithBackoff(baseDelayMs: 100, backoffFactor: 2.0, sleepFn: Noop);
        Assert.Equal(100, retry.CalculateDelay(0));
        Assert.Equal(200, retry.CalculateDelay(1));
        Assert.Equal(400, retry.CalculateDelay(2));
    }

    [Fact]
    public void CapsAtMax()
    {
        var retry = new RetryWithBackoff(baseDelayMs: 1000, maxDelayMs: 5000, sleepFn: Noop);
        Assert.Equal(5000, retry.CalculateDelay(5));
    }
}
```

## Key Takeaways

1. **Distributed failures are different** — network partitions, clock drift, and partial failures don't occur in single-node systems
2. **Jepsen-style testing finds real bugs** — combining concurrent operations with fault injection reveals subtle issues
3. **Idempotency must be tested explicitly** — duplicate delivery is the norm in distributed systems
4. **Exponential backoff with jitter prevents cascading failures** — always cap delays and add randomness
5. **Timeout testing is critical** — test what happens when services respond slowly, not just when they fail fast
