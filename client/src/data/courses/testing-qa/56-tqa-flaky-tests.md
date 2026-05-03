---
title: Dealing with Flaky Tests
---

# Dealing with Flaky Tests

Flaky tests are one of the most insidious problems in software testing. They erode trust in the test suite, slow down development, and can mask real bugs. This lesson covers how to identify, diagnose, and fix flaky tests.

## What Are Flaky Tests?

A **flaky test** is a test that produces different results (pass or fail) when run multiple times against the same code without any changes. The test is non-deterministic — sometimes it passes, sometimes it fails, for no apparent reason.

The impact of flaky tests:
- Developers stop trusting the test suite
- CI/CD pipelines become unreliable
- Real failures get ignored ("it's probably just flaky")
- Developer productivity drops as they re-run pipelines
- Bug escape rate increases

## Common Causes of Flakiness

### 1. Timing and Race Conditions

Tests that depend on specific timing, such as waiting for async operations, animations, or network responses, without proper synchronization.

### 2. Shared Mutable State

Tests that read from or write to shared resources (databases, files, global variables) without proper isolation.

### 3. Test Order Dependency

Tests that only pass when run in a specific order because they rely on state set up by a previous test.

### 4. External Service Dependencies

Tests that call real external services (APIs, databases, message queues) that may be unavailable or slow.

### 5. Resource Leaks

Tests that don't properly clean up resources (open connections, spawned processes, temporary files).

### 6. Floating-Point Comparisons

Tests that compare floating-point numbers with exact equality instead of approximate comparison.

### 7. Time-Dependent Logic

Tests that depend on the current date/time, day of week, or timezone.

### 8. Non-Deterministic Data Structures

Tests that depend on the iteration order of hash maps or sets, which may vary between runs.

## Detection Strategies

### Repeated Execution

Run the test suite multiple times (e.g., 10-50 runs) and look for inconsistent results:

```
# Run tests 20 times and track failures
for i in {1..20}; do npm test 2>&1 | tail -1 >> results.txt; done
```

### Statistical Analysis

Track test results over time. A test with a pass rate between 1% and 99% over many runs is flaky.

### Deflaking in CI

Configure CI to automatically re-run failed tests and flag those that pass on retry as potentially flaky.

### Test Impact Analysis

When a test fails but no related code changed, it is likely flaky.

## Fixing Strategies

### Remove Non-Determinism

Replace random values with fixed seeds, mock time-dependent functions, and avoid relying on hash map ordering.

### Isolate State

Each test should set up its own state and tear it down afterward. Never rely on state from another test.

### Use Deterministic Waits

Replace `sleep()` calls with polling or event-driven waiting that checks for the actual condition.

### Mock External Services

Replace real external service calls with deterministic mocks or stubs.

### Proper Resource Management

Use `try/finally`, `defer`, or `using` blocks to ensure cleanup happens regardless of test outcome.

## Retry Mechanisms

### When Retries Are Acceptable

- Infrastructure flakiness (network blips, CI resource contention)
- Transitioning legacy suites (temporary measure while fixing)
- Integration tests with unavoidable external dependencies

### When Retries Mask Bugs

- Race conditions in application code
- Resource leaks that compound over time
- Intermittent logic errors

**Rule of thumb**: If a test needs retries, flag it for investigation. Retries are a bandage, not a cure.

## Test Quarantine

Quarantining isolates flaky tests from the main suite so they don't block deployments while being investigated.

Quarantine workflow:
1. Detect flaky test (automated or manual)
2. Move to quarantine suite (still runs, but doesn't block)
3. Assign owner for investigation
4. Fix the root cause
5. Move back to main suite
6. Monitor for recurrence

## Code Examples

### Flaky Patterns and Their Fixes

```python
import time
import threading
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone


# ============================================================
# FLAKY PATTERN 1: Timing dependency
# ============================================================

class CacheWithExpiry:
    def __init__(self):
        self._store = {}

    def put(self, key, value, ttl_seconds):
        expiry = time.time() + ttl_seconds
        self._store[key] = (value, expiry)

    def get(self, key):
        if key not in self._store:
            return None
        value, expiry = self._store[key]
        if time.time() > expiry:
            del self._store[key]
            return None
        return value


# BAD: Flaky due to timing - sleep may not be enough on slow CI
class TestCacheFlaky(unittest.TestCase):
    def test_expiry_flaky(self):
        cache = CacheWithExpiry()
        cache.put("key", "value", 1)  # 1 second TTL
        time.sleep(1.1)  # Might not be enough on slow machines!
        result = cache.get("key")
        self.assertIsNone(result)  # FLAKY: sometimes fails


# GOOD: Deterministic by mocking time
class TestCacheFixed(unittest.TestCase):
    @patch("time.time")
    def test_expiry_deterministic(self, mock_time):
        cache = CacheWithExpiry()

        # Set initial time
        mock_time.return_value = 1000.0
        cache.put("key", "value", 60)  # 60 second TTL

        # Simulate time passing (before expiry)
        mock_time.return_value = 1050.0
        self.assertEqual(cache.get("key"), "value")

        # Simulate time passing (after expiry)
        mock_time.return_value = 1061.0
        self.assertIsNone(cache.get("key"))


# ============================================================
# FLAKY PATTERN 2: Shared state between tests
# ============================================================

# BAD: Global state leaks between tests
_user_count = 0


class UserRegistry:
    def __init__(self):
        global _user_count
        # Does NOT reset — accumulates across tests
        pass

    def add_user(self, name):
        global _user_count
        _user_count += 1
        return _user_count


class TestRegistryFlaky(unittest.TestCase):
    def test_first_user_gets_id_1(self):
        registry = UserRegistry()
        uid = registry.add_user("Alice")
        # FLAKY: depends on test execution order
        self.assertEqual(uid, 1)


# GOOD: Isolate state per test
class IsolatedUserRegistry:
    def __init__(self):
        self._count = 0  # Instance state, not global

    def add_user(self, name):
        self._count += 1
        return self._count


class TestRegistryFixed(unittest.TestCase):
    def test_first_user_gets_id_1(self):
        registry = IsolatedUserRegistry()
        uid = registry.add_user("Alice")
        self.assertEqual(uid, 1)  # Always passes — isolated state

    def test_second_user_gets_id_2(self):
        registry = IsolatedUserRegistry()
        registry.add_user("Alice")
        uid = registry.add_user("Bob")
        self.assertEqual(uid, 2)  # Independent of other tests


# ============================================================
# FLAKY PATTERN 3: Race condition in async code
# ============================================================

class AsyncCounter:
    def __init__(self):
        self.value = 0
        self._lock = threading.Lock()

    def increment_unsafe(self):
        """Not thread-safe — causes flakiness"""
        current = self.value
        time.sleep(0.001)  # Simulates some work
        self.value = current + 1

    def increment_safe(self):
        """Thread-safe version"""
        with self._lock:
            self.value += 1


class TestAsyncCounterFixed(unittest.TestCase):
    def test_concurrent_increments_are_safe(self):
        counter = AsyncCounter()
        threads = []

        for _ in range(100):
            t = threading.Thread(target=counter.increment_safe)
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        # Deterministic with proper synchronization
        self.assertEqual(counter.value, 100)


if __name__ == "__main__":
    unittest.main()
```

```javascript
// ============================================================
// FLAKY PATTERN 1: Timing dependency with async operations
// ============================================================

class MessageQueue {
  constructor() {
    this.messages = [];
    this.subscribers = [];
  }

  publish(message) {
    // Simulates async message delivery
    setTimeout(() => {
      this.messages.push(message);
      this.subscribers.forEach((cb) => cb(message));
    }, Math.random() * 50); // Random delay causes flakiness!
  }

  publishDeterministic(message) {
    // Fixed: immediate delivery for testability
    return new Promise((resolve) => {
      this.messages.push(message);
      this.subscribers.forEach((cb) => cb(message));
      resolve();
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  getMessages() {
    return [...this.messages];
  }
}

// BAD: Flaky test relying on setTimeout timing
// test("messages are delivered", () => {
//   const queue = new MessageQueue();
//   queue.publish("hello");
//   setTimeout(() => {
//     expect(queue.getMessages()).toContain("hello"); // FLAKY!
//   }, 100);
// });

// GOOD: Deterministic async test
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("MessageQueue - Fixed", () => {
  it("delivers messages deterministically", async () => {
    const queue = new MessageQueue();
    await queue.publishDeterministic("hello");
    expect(queue.getMessages()).toContain("hello");
  });

  it("notifies subscribers on publish", async () => {
    const queue = new MessageQueue();
    const received = [];
    queue.subscribe((msg) => received.push(msg));

    await queue.publishDeterministic("event-1");
    await queue.publishDeterministic("event-2");

    expect(received).toEqual(["event-1", "event-2"]);
  });
});

// ============================================================
// FLAKY PATTERN 2: Test order dependency
// ============================================================

// BAD: Shared database state between tests
class InMemoryStore {
  constructor() {
    this.data = new Map();
  }
  set(key, value) {
    this.data.set(key, value);
  }
  get(key) {
    return this.data.get(key);
  }
  clear() {
    this.data.clear();
  }
}

// GOOD: Each test gets its own store instance
describe("InMemoryStore - Isolated", () => {
  let store;

  beforeEach(() => {
    store = new InMemoryStore(); // Fresh instance per test
  });

  it("stores and retrieves values", () => {
    store.set("name", "Alice");
    expect(store.get("name")).toBe("Alice");
  });

  it("returns undefined for missing keys", () => {
    // This test doesn't depend on previous test's state
    expect(store.get("nonexistent")).toBeUndefined();
  });

  it("overwrites existing values", () => {
    store.set("key", "first");
    store.set("key", "second");
    expect(store.get("key")).toBe("second");
  });
});

// ============================================================
// FLAKY PATTERN 3: Date/time dependency
// ============================================================

class TokenGenerator {
  generate(userId) {
    const now = Date.now();
    const expiry = now + 3600000; // 1 hour from now
    return { userId, issuedAt: now, expiresAt: expiry };
  }

  isExpired(token) {
    return Date.now() > token.expiresAt;
  }
}

// GOOD: Mock Date.now for deterministic tests
describe("TokenGenerator - Deterministic", () => {
  const FIXED_TIME = 1700000000000; // Fixed timestamp

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates token with correct expiry", () => {
    const generator = new TokenGenerator();
    const token = generator.generate("user-123");

    expect(token.issuedAt).toBe(FIXED_TIME);
    expect(token.expiresAt).toBe(FIXED_TIME + 3600000);
  });

  it("detects expired tokens", () => {
    const generator = new TokenGenerator();
    const token = generator.generate("user-123");

    // Advance time past expiry
    vi.advanceTimersByTime(3600001);

    expect(generator.isExpired(token)).toBe(true);
  });

  it("detects valid tokens", () => {
    const generator = new TokenGenerator();
    const token = generator.generate("user-123");

    // Advance time but stay within expiry
    vi.advanceTimersByTime(1800000); // 30 minutes

    expect(generator.isExpired(token)).toBe(false);
  });
});

// ============================================================
// FLAKY PATTERN 4: Non-deterministic iteration order
// ============================================================

describe("Avoiding order-dependent assertions", () => {
  function getActiveUsers() {
    // Returns users from a Set (no guaranteed order)
    const users = new Set(["charlie", "alice", "bob"]);
    return [...users];
  }

  // BAD: Depends on Set iteration order
  // it("returns active users", () => {
  //   expect(getActiveUsers()).toEqual(["alice", "bob", "charlie"]); // FLAKY
  // });

  // GOOD: Sort before comparing, or use unordered matchers
  it("returns all active users regardless of order", () => {
    const users = getActiveUsers();
    expect(users.sort()).toEqual(["alice", "bob", "charlie"]);
  });

  it("contains expected users (order-independent)", () => {
    const users = getActiveUsers();
    expect(users).toContain("alice");
    expect(users).toContain("bob");
    expect(users).toContain("charlie");
    expect(users).toHaveLength(3);
  });
});
```

```java
import org.junit.jupiter.api.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// ============================================================
// FLAKY PATTERN 1: Race condition with shared state
// ============================================================

class EventCounter {
    private int count = 0; // Not thread-safe!
    private final AtomicInteger safeCount = new AtomicInteger(0);

    // BAD: Race condition causes flaky tests
    public void incrementUnsafe() {
        count++;
    }

    public int getUnsafeCount() {
        return count;
    }

    // GOOD: Thread-safe increment
    public void incrementSafe() {
        safeCount.incrementAndGet();
    }

    public int getSafeCount() {
        return safeCount.get();
    }
}

class EventCounterTest {

    @Test
    void concurrentIncrements_threadSafe_isReliable() throws InterruptedException {
        EventCounter counter = new EventCounter();
        int threadCount = 100;
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                counter.incrementSafe();
                latch.countDown();
            });
        }

        latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        // Deterministic: AtomicInteger guarantees correctness
        assertEquals(100, counter.getSafeCount());
    }
}

// ============================================================
// FLAKY PATTERN 2: Time-dependent logic
// ============================================================

interface TimeProvider {
    Instant now();
}

class SystemTimeProvider implements TimeProvider {
    public Instant now() {
        return Instant.now();
    }
}

class FixedTimeProvider implements TimeProvider {
    private Instant fixedTime;

    public FixedTimeProvider(Instant fixedTime) {
        this.fixedTime = fixedTime;
    }

    public Instant now() {
        return fixedTime;
    }

    public void advanceBy(Duration duration) {
        fixedTime = fixedTime.plus(duration);
    }
}

class SessionManager {
    private final Map<String, Instant> sessions = new HashMap<>();
    private final TimeProvider timeProvider;
    private final Duration timeout;

    public SessionManager(TimeProvider timeProvider, Duration timeout) {
        this.timeProvider = timeProvider;
        this.timeout = timeout;
    }

    public void createSession(String sessionId) {
        sessions.put(sessionId, timeProvider.now());
    }

    public boolean isSessionValid(String sessionId) {
        Instant created = sessions.get(sessionId);
        if (created == null) return false;
        return Duration.between(created, timeProvider.now()).compareTo(timeout) < 0;
    }
}

class SessionManagerTest {
    private FixedTimeProvider timeProvider;
    private SessionManager manager;

    @BeforeEach
    void setUp() {
        timeProvider = new FixedTimeProvider(Instant.parse("2024-01-01T12:00:00Z"));
        manager = new SessionManager(timeProvider, Duration.ofMinutes(30));
    }

    @Test
    void newSession_isValid() {
        manager.createSession("sess-1");
        assertTrue(manager.isSessionValid("sess-1"));
    }

    @Test
    void session_expiresAfterTimeout() {
        manager.createSession("sess-1");

        // Deterministic: advance time past timeout
        timeProvider.advanceBy(Duration.ofMinutes(31));

        assertFalse(manager.isSessionValid("sess-1"));
    }

    @Test
    void session_validBeforeTimeout() {
        manager.createSession("sess-1");

        timeProvider.advanceBy(Duration.ofMinutes(29));

        assertTrue(manager.isSessionValid("sess-1"));
    }
}

// ============================================================
// FLAKY PATTERN 3: External service dependency
// ============================================================

interface WeatherApi {
    double getTemperature(String city);
}

class OutdoorActivityRecommender {
    private final WeatherApi weatherApi;

    public OutdoorActivityRecommender(WeatherApi weatherApi) {
        this.weatherApi = weatherApi;
    }

    public String recommend(String city) {
        double temp = weatherApi.getTemperature(city);
        if (temp > 25) return "swimming";
        if (temp > 15) return "hiking";
        if (temp > 5) return "jogging";
        return "stay indoors";
    }
}

class OutdoorActivityRecommenderTest {

    @Test
    void hotWeather_recommendsSwimming() {
        // GOOD: Mock external service for determinism
        WeatherApi mockApi = mock(WeatherApi.class);
        when(mockApi.getTemperature("Miami")).thenReturn(32.0);

        OutdoorActivityRecommender recommender = new OutdoorActivityRecommender(mockApi);

        assertEquals("swimming", recommender.recommend("Miami"));
    }

    @Test
    void coldWeather_recommendsStayIndoors() {
        WeatherApi mockApi = mock(WeatherApi.class);
        when(mockApi.getTemperature("Helsinki")).thenReturn(-5.0);

        OutdoorActivityRecommender recommender = new OutdoorActivityRecommender(mockApi);

        assertEquals("stay indoors", recommender.recommend("Helsinki"));
    }

    @Test
    void mildWeather_recommendsHiking() {
        WeatherApi mockApi = mock(WeatherApi.class);
        when(mockApi.getTemperature("London")).thenReturn(18.0);

        OutdoorActivityRecommender recommender = new OutdoorActivityRecommender(mockApi);

        assertEquals("hiking", recommender.recommend("London"));
    }
}
```

```csharp
using Xunit;
using Moq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// ============================================================
// FLAKY PATTERN 1: Async timing issues
// ============================================================

public interface IEventBus
{
    Task PublishAsync(string eventName, object payload);
    void Subscribe(string eventName, Action<object> handler);
}

public class InMemoryEventBus : IEventBus
{
    private readonly Dictionary<string, List<Action<object>>> _handlers = new();

    public async Task PublishAsync(string eventName, object payload)
    {
        if (_handlers.TryGetValue(eventName, out var handlers))
        {
            foreach (var handler in handlers)
            {
                handler(payload);
            }
        }
        await Task.CompletedTask;
    }

    public void Subscribe(string eventName, Action<object> handler)
    {
        if (!_handlers.ContainsKey(eventName))
            _handlers[eventName] = new List<Action<object>>();
        _handlers[eventName].Add(handler);
    }
}

public class EventBusTests
{
    // GOOD: Deterministic async test using awaitable publish
    [Fact]
    public async Task PublishAsync_NotifiesAllSubscribers()
    {
        var bus = new InMemoryEventBus();
        var received = new List<string>();

        bus.Subscribe("order.created", payload => received.Add((string)payload));
        bus.Subscribe("order.created", payload => received.Add($"copy:{payload}"));

        await bus.PublishAsync("order.created", "ORD-123");

        Assert.Equal(2, received.Count);
        Assert.Contains("ORD-123", received);
        Assert.Contains("copy:ORD-123", received);
    }

    [Fact]
    public async Task PublishAsync_NoSubscribers_DoesNotThrow()
    {
        var bus = new InMemoryEventBus();

        // Should not throw even with no subscribers
        await bus.PublishAsync("unknown.event", "data");
    }
}

// ============================================================
// FLAKY PATTERN 2: Shared state with parallel test execution
// ============================================================

public class ShoppingCart
{
    private readonly List<(string Item, decimal Price)> _items = new();

    public void Add(string item, decimal price)
    {
        _items.Add((item, price));
    }

    public decimal GetTotal() => _items.Sum(i => i.Price);

    public int ItemCount => _items.Count;

    public void Clear() => _items.Clear();
}

public class ShoppingCartTests
{
    // GOOD: Each test creates its own instance - no shared state
    [Fact]
    public void Add_SingleItem_UpdatesTotal()
    {
        var cart = new ShoppingCart(); // Fresh instance
        cart.Add("Book", 29.99m);

        Assert.Equal(29.99m, cart.GetTotal());
        Assert.Equal(1, cart.ItemCount);
    }

    [Fact]
    public void Add_MultipleItems_SumsCorrectly()
    {
        var cart = new ShoppingCart(); // Fresh instance
        cart.Add("Book", 29.99m);
        cart.Add("Pen", 4.99m);

        Assert.Equal(34.98m, cart.GetTotal());
        Assert.Equal(2, cart.ItemCount);
    }

    [Fact]
    public void EmptyCart_HasZeroTotal()
    {
        var cart = new ShoppingCart(); // Fresh instance
        Assert.Equal(0m, cart.GetTotal());
    }
}

// ============================================================
// FLAKY PATTERN 3: Time-dependent logic
// ============================================================

public interface IClock
{
    DateTime UtcNow { get; }
}

public class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}

public class FakeClock : IClock
{
    public DateTime UtcNow { get; set; }

    public FakeClock(DateTime startTime)
    {
        UtcNow = startTime;
    }

    public void Advance(TimeSpan duration)
    {
        UtcNow = UtcNow.Add(duration);
    }
}

public class RateLimiter
{
    private readonly IClock _clock;
    private readonly int _maxRequests;
    private readonly TimeSpan _window;
    private readonly ConcurrentDictionary<string, List<DateTime>> _requests = new();

    public RateLimiter(IClock clock, int maxRequests, TimeSpan window)
    {
        _clock = clock;
        _maxRequests = maxRequests;
        _window = window;
    }

    public bool IsAllowed(string clientId)
    {
        var now = _clock.UtcNow;
        var windowStart = now.Subtract(_window);

        _requests.AddOrUpdate(clientId,
            _ => new List<DateTime> { now },
            (_, list) =>
            {
                list.RemoveAll(t => t < windowStart);
                if (list.Count < _maxRequests)
                    list.Add(now);
                return list;
            });

        return _requests[clientId].Count <= _maxRequests;
    }
}

public class RateLimiterTests
{
    [Fact]
    public void AllowsRequestsWithinLimit()
    {
        var clock = new FakeClock(new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc));
        var limiter = new RateLimiter(clock, maxRequests: 3, window: TimeSpan.FromMinutes(1));

        Assert.True(limiter.IsAllowed("client-1"));
        Assert.True(limiter.IsAllowed("client-1"));
        Assert.True(limiter.IsAllowed("client-1"));
    }

    [Fact]
    public void BlocksRequestsOverLimit()
    {
        var clock = new FakeClock(new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc));
        var limiter = new RateLimiter(clock, maxRequests: 2, window: TimeSpan.FromMinutes(1));

        Assert.True(limiter.IsAllowed("client-1"));
        Assert.True(limiter.IsAllowed("client-1"));
        Assert.False(limiter.IsAllowed("client-1")); // Over limit
    }

    [Fact]
    public void AllowsRequestsAfterWindowExpires()
    {
        var clock = new FakeClock(new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc));
        var limiter = new RateLimiter(clock, maxRequests: 2, window: TimeSpan.FromMinutes(1));

        Assert.True(limiter.IsAllowed("client-1"));
        Assert.True(limiter.IsAllowed("client-1"));
        Assert.False(limiter.IsAllowed("client-1"));

        // Advance past the window - deterministic!
        clock.Advance(TimeSpan.FromMinutes(2));

        Assert.True(limiter.IsAllowed("client-1")); // Allowed again
    }

    [Fact]
    public void IsolatesClients()
    {
        var clock = new FakeClock(new DateTime(2024, 1, 1, 12, 0, 0, DateTimeKind.Utc));
        var limiter = new RateLimiter(clock, maxRequests: 1, window: TimeSpan.FromMinutes(1));

        Assert.True(limiter.IsAllowed("client-1"));
        Assert.False(limiter.IsAllowed("client-1")); // Blocked

        Assert.True(limiter.IsAllowed("client-2")); // Different client, allowed
    }
}
```

## Flaky Test Checklist

When investigating a flaky test, work through this checklist:

| Question | If Yes |
|----------|--------|
| Does the test use `sleep()` or `Thread.sleep()`? | Replace with deterministic waits or mocked time |
| Does the test share state with other tests? | Isolate with fresh instances in setup |
| Does the test call external services? | Mock the external dependency |
| Does the test depend on current time? | Inject a clock/time provider |
| Does the test check iteration order? | Sort before comparing or use unordered assertions |
| Does the test use random values? | Use fixed seeds or deterministic values |
| Does the test spawn threads? | Use proper synchronization primitives |
| Does the test leave resources open? | Add proper cleanup in teardown |

## Prevention Strategies

1. **Write deterministic tests from the start** — inject time, mock externals, isolate state
2. **Run tests in random order** regularly to catch order dependencies early
3. **Set up a flaky test dashboard** to track and trend flakiness
4. **Enforce a "fix or delete" policy** — flaky tests older than 2 weeks get deleted
5. **Review tests in code review** with flakiness in mind
6. **Use test containers** instead of shared test databases

## Summary

Flaky tests are a symptom of non-determinism in your test suite. The cure is to eliminate every source of non-determinism: mock time, isolate state, synchronize concurrency, and replace external dependencies with controlled test doubles. A reliable test suite is worth the investment — it's the foundation of continuous delivery.
