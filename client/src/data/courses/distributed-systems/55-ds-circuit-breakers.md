---
title: "Circuit Breakers and Retries"
---

# Circuit Breakers and Retries

In distributed systems, services depend on other services. When a downstream service becomes slow or unavailable, cascading failures can bring down the entire system. Circuit breakers and retry patterns protect your system from these failures.

---

## Why Do We Need Circuit Breakers?

Without protection, a failing service causes:

| Problem | Impact |
|---------|--------|
| Thread exhaustion | Waiting threads block new requests |
| Cascading failures | One slow service brings down others |
| Resource waste | Retrying a dead service wastes CPU/network |
| Poor user experience | Users wait indefinitely with no response |
| Thundering herd | All clients retry simultaneously on recovery |

A **circuit breaker** stops calling a failing service, fails fast, and gives the service time to recover.

---

## The Circuit Breaker Pattern

The circuit breaker has three states, modeled after an electrical circuit breaker:

```
┌──────────┐    failure threshold    ┌──────────┐
│  CLOSED  │ ─────────────────────► │   OPEN   │
│ (normal) │                         │  (fail   │
│          │ ◄───────────────────── │   fast)  │
└──────────┘    success in half-open └──────────┘
      ▲                                    │
      │                                    │ timeout expires
      │            ┌───────────┐           │
      └─────────── │ HALF-OPEN │ ◄─────────┘
        success    │  (probe)  │
                   └───────────┘
```

### State Descriptions

| State | Behavior | Transitions |
|-------|----------|-------------|
| **Closed** | Requests pass through normally; failures are counted | → Open (when failure threshold exceeded) |
| **Open** | Requests fail immediately without calling the service | → Half-Open (after timeout period) |
| **Half-Open** | Limited probe requests are allowed through | → Closed (on success) or → Open (on failure) |

---

## Circuit Breaker States in Detail

### Closed State

```javascript
class CircuitBreaker {
  constructor(options) {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenMax = options.halfOpenMax || 3;
    this.listeners = [];
  }

  async call(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.transitionTo("HALF_OPEN");
      } else {
        throw new CircuitBreakerOpenError("Circuit is OPEN");
      }
    }

    if (this.state === "HALF_OPEN" && this.activeProbes >= this.halfOpenMax) {
      throw new CircuitBreakerOpenError("Circuit is HALF_OPEN, max probes reached");
    }

    try {
      if (this.state === "HALF_OPEN") this.activeProbes++;
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### Open State

When the circuit is open, calls fail immediately:

```javascript
onFailure() {
  this.failureCount++;

  if (this.state === "HALF_OPEN") {
    this.activeProbes--;
    this.transitionTo("OPEN");
    return;
  }

  if (this.failureCount >= this.failureThreshold) {
    this.lastFailureTime = Date.now();
    this.transitionTo("OPEN");
  }
}
```

### Half-Open State

After a timeout, the circuit enters half-open to probe the service:

```javascript
onSuccess() {
  if (this.state === "HALF_OPEN") {
    this.activeProbes--;
    this.successCount++;
    if (this.successCount >= this.halfOpenMax) {
      this.transitionTo("CLOSED");
    }
  } else {
    this.failureCount = 0;
  }
}

transitionTo(newState) {
  const oldState = this.state;
  this.state = newState;

  if (newState === "CLOSED") {
    this.failureCount = 0;
    this.successCount = 0;
  }
  if (newState === "HALF_OPEN") {
    this.activeProbes = 0;
    this.successCount = 0;
  }

  this.listeners.forEach(fn => fn(oldState, newState));
}
```

---

## Circuit Breaker Configuration

Key parameters to tune:

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `failureThreshold` | Failures before opening | 5–10 |
| `resetTimeout` | Time before trying half-open | 15–60 seconds |
| `halfOpenMax` | Probe requests in half-open | 1–5 |
| `failureRateThreshold` | Percentage-based threshold | 50% |
| `slowCallDuration` | What counts as "slow" | 2–5 seconds |
| `slowCallRateThreshold` | Slow call percentage to open | 80% |
| `slidingWindowSize` | Window for counting failures | 10–100 calls |

### Sliding Window Types

```java
// Count-based sliding window
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .slidingWindowType(SlidingWindowType.COUNT_BASED)
    .slidingWindowSize(100)
    .failureRateThreshold(50)
    .build();

// Time-based sliding window
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .slidingWindowType(SlidingWindowType.TIME_BASED)
    .slidingWindowSize(60)  // 60 seconds
    .failureRateThreshold(50)
    .build();
```

---

## Hystrix (Netflix)

Netflix pioneered the circuit breaker pattern with Hystrix (now in maintenance mode):

```java
public class PaymentCommand extends HystrixCommand<PaymentResult> {

    private final PaymentService paymentService;
    private final Order order;

    public PaymentCommand(PaymentService service, Order order) {
        super(HystrixCommandGroupKey.Factory.asKey("PaymentGroup"));
        this.paymentService = service;
        this.order = order;
    }

    @Override
    protected PaymentResult run() throws Exception {
        return paymentService.processPayment(order);
    }

    @Override
    protected PaymentResult getFallback() {
        return PaymentResult.pending("Payment queued for retry");
    }
}

// Usage
PaymentResult result = new PaymentCommand(service, order).execute();
```

> **Note:** Hystrix is in maintenance mode since 2018. Use Resilience4j for new Java projects.

---

## Resilience4j

The modern Java circuit breaker library:

```java
// Configuration
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)
    .slowCallRateThreshold(80)
    .slowCallDurationThreshold(Duration.ofSeconds(2))
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .permittedNumberOfCallsInHalfOpenState(3)
    .slidingWindowSize(10)
    .recordExceptions(IOException.class, TimeoutException.class)
    .ignoreExceptions(BusinessException.class)
    .build();

// Create circuit breaker
CircuitBreaker circuitBreaker = CircuitBreaker.of("paymentService", config);

// Decorate a function
Supplier<PaymentResult> decorated = CircuitBreaker
    .decorateSupplier(circuitBreaker, () -> paymentService.process(order));

// Execute with Try monad
Try<PaymentResult> result = Try.ofSupplier(decorated)
    .recover(CallNotPermittedException.class, e -> PaymentResult.cached());
```

### Resilience4j with Spring Boot

```java
@Service
public class PaymentService {

    @CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")
    public PaymentResult processPayment(Order order) {
        return externalPaymentGateway.charge(order);
    }

    private PaymentResult paymentFallback(Order order, Exception e) {
        log.warn("Payment circuit open, using fallback", e);
        return PaymentResult.queued(order.getId());
    }
}
```

---

## Polly (.NET)

The resilience library for .NET:

```csharp
// Circuit breaker policy
var circuitBreaker = Policy
    .Handle<HttpRequestException>()
    .Or<TimeoutException>()
    .CircuitBreakerAsync(
        exceptionsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (exception, duration) =>
            logger.LogWarning($"Circuit opened for {duration.TotalSeconds}s"),
        onReset: () =>
            logger.LogInformation("Circuit closed"),
        onHalfOpen: () =>
            logger.LogInformation("Circuit half-open, probing...")
    );

// Advanced circuit breaker (percentage-based)
var advancedBreaker = Policy
    .Handle<HttpRequestException>()
    .AdvancedCircuitBreakerAsync(
        failureThreshold: 0.5,           // 50% failure rate
        samplingDuration: TimeSpan.FromSeconds(10),
        minimumThroughput: 8,            // minimum calls before evaluating
        durationOfBreak: TimeSpan.FromSeconds(30)
    );
```

---

## Retry Strategies

### Immediate Retry

```javascript
async function retryImmediate(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying immediately...`);
    }
  }
}
```

### Fixed Delay Retry

```javascript
async function retryWithFixedDelay(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }
}
```

### Exponential Backoff

```javascript
async function retryWithExponentialBackoff(fn, options = {}) {
  const {
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}
```

### Exponential Backoff with Jitter

Jitter prevents the **thundering herd** problem where all clients retry at the same time:

```javascript
async function retryWithJitter(fn, options = {}) {
  const {
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const exponentialDelay = baseDelay * Math.pow(factor, attempt - 1);
      // Full jitter: random between 0 and exponential delay
      const jitteredDelay = Math.min(
        Math.random() * exponentialDelay,
        maxDelay
      );

      console.log(`Attempt ${attempt} failed, retrying in ${Math.round(jitteredDelay)}ms...`);
      await sleep(jitteredDelay);
    }
  }
}
```

| Jitter Strategy | Formula | Use Case |
|----------------|---------|----------|
| Full jitter | `random(0, exponentialDelay)` | General purpose, best spread |
| Equal jitter | `exponentialDelay/2 + random(0, exponentialDelay/2)` | Guaranteed minimum wait |
| Decorrelated jitter | `random(baseDelay, previousDelay * 3)` | AWS recommendation |

---

## Retry Budgets

Retry budgets prevent retry storms from overwhelming a recovering service:

```javascript
class RetryBudget {
  constructor(options) {
    this.maxRetryRatio = options.maxRetryRatio || 0.1;  // 10% of requests
    this.minRetriesPerSecond = options.minRetriesPerSecond || 10;
    this.ttl = options.ttl || 10000;  // 10 second window
    this.requests = [];
    this.retries = [];
  }

  recordRequest() {
    this.requests.push(Date.now());
    this.cleanup();
  }

  canRetry() {
    this.cleanup();
    const requestCount = this.requests.length;
    const retryCount = this.retries.length;

    // Always allow minimum retries
    if (retryCount < this.minRetriesPerSecond * (this.ttl / 1000)) {
      return true;
    }

    // Check ratio
    return retryCount / requestCount < this.maxRetryRatio;
  }

  recordRetry() {
    if (!this.canRetry()) return false;
    this.retries.push(Date.now());
    return true;
  }

  cleanup() {
    const cutoff = Date.now() - this.ttl;
    this.requests = this.requests.filter(t => t > cutoff);
    this.retries = this.retries.filter(t => t > cutoff);
  }
}
```

---

## Bulkhead Pattern

The bulkhead pattern isolates failures to prevent one slow service from consuming all resources:

### Thread Pool Isolation

```java
// Resilience4j Bulkhead (thread pool)
ThreadPoolBulkheadConfig config = ThreadPoolBulkheadConfig.custom()
    .maxThreadPoolSize(10)
    .coreThreadPoolSize(5)
    .queueCapacity(20)
    .keepAliveDuration(Duration.ofMillis(100))
    .build();

ThreadPoolBulkhead bulkhead = ThreadPoolBulkhead.of("paymentBulkhead", config);

CompletionStage<PaymentResult> result = bulkhead.executeSupplier(
    () -> paymentService.process(order)
);
```

### Semaphore Isolation

```java
// Semaphore-based bulkhead (lighter weight)
BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(25)
    .maxWaitDuration(Duration.ofMillis(500))
    .build();

Bulkhead bulkhead = Bulkhead.of("inventoryBulkhead", config);

Supplier<InventoryResult> decorated = Bulkhead.decorateSupplier(
    bulkhead,
    () -> inventoryService.check(item)
);
```

| Isolation Type | Pros | Cons |
|---------------|------|------|
| Thread pool | Complete isolation, timeout support | Higher overhead, context switching |
| Semaphore | Lightweight, no thread overhead | No timeout on execution, shared thread |

---

## Timeout Pattern

Always set timeouts to prevent indefinite waiting:

```javascript
async function withTimeout(fn, timeoutMs) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn(controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new TimeoutError(`Operation timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage with fetch
const data = await withTimeout(
  (signal) => fetch("https://api.example.com/data", { signal }),
  5000
);
```

### Timeout Guidelines

| Service Type | Suggested Timeout | Rationale |
|-------------|-------------------|-----------|
| Cache (Redis) | 50–200ms | Should be fast; fail quickly |
| Database query | 1–5s | Depends on query complexity |
| Internal API call | 1–3s | Within your network |
| External API call | 5–15s | Internet latency variance |
| File upload | 30–120s | Large payload |

---

## Fallback Strategies

### Cache Fallback

```javascript
class CacheFallbackService {
  constructor(primaryService, cache) {
    this.primary = primaryService;
    this.cache = cache;
  }

  async getData(key) {
    try {
      const data = await this.primary.fetch(key);
      await this.cache.set(key, data);  // Update cache on success
      return { data, source: "primary" };
    } catch (error) {
      const cached = await this.cache.get(key);
      if (cached) {
        return { data: cached, source: "cache", stale: true };
      }
      throw new Error("Primary failed and no cache available");
    }
  }
}
```

### Default Value Fallback

```javascript
async function getProductRecommendations(userId) {
  try {
    return await recommendationService.getPersonalized(userId);
  } catch (error) {
    // Return popular items as fallback
    return getPopularProducts();
  }
}
```

### Graceful Degradation

```javascript
async function getProductPage(productId) {
  const product = await productService.get(productId);  // Required

  // Non-critical: degrade gracefully
  const [reviews, recommendations, inventory] = await Promise.allSettled([
    reviewService.getForProduct(productId),
    recommendationService.getSimilar(productId),
    inventoryService.getStock(productId),
  ]);

  return {
    product,
    reviews: reviews.status === "fulfilled" ? reviews.value : [],
    recommendations: recommendations.status === "fulfilled" ? recommendations.value : [],
    inventory: inventory.status === "fulfilled" ? inventory.value : { available: true },
  };
}
```

---

## Combining Patterns

In production, you combine multiple resilience patterns:

```javascript
class ResilientClient {
  constructor(options) {
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    this.retryBudget = new RetryBudget(options.retryBudget);
    this.bulkhead = new Semaphore(options.maxConcurrent || 25);
    this.timeout = options.timeout || 5000;
  }

  async call(fn) {
    // 1. Bulkhead: limit concurrency
    await this.bulkhead.acquire();

    try {
      // 2. Circuit breaker: fail fast if service is down
      return await this.circuitBreaker.call(async () => {
        // 3. Retry with backoff
        return await this.retryWithBackoff(async () => {
          // 4. Timeout: don't wait forever
          return await withTimeout(fn, this.timeout);
        });
      });
    } finally {
      this.bulkhead.release();
    }
  }

  async retryWithBackoff(fn, attempt = 1) {
    try {
      this.retryBudget.recordRequest();
      return await fn();
    } catch (error) {
      if (attempt >= 3 || !this.isRetryable(error)) throw error;
      if (!this.retryBudget.canRetry()) throw error;

      this.retryBudget.recordRetry();
      const delay = 1000 * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5);
      await sleep(delay);
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }

  isRetryable(error) {
    return error instanceof TimeoutError ||
           error.status === 503 ||
           error.status === 429 ||
           error.code === "ECONNRESET";
  }
}
```

### Pattern Ordering (Outside → Inside)

```
Request → Rate Limiter → Bulkhead → Circuit Breaker → Retry → Timeout → Service Call
```

| Layer | Purpose |
|-------|---------|
| Rate limiter | Protect from excessive load |
| Bulkhead | Isolate resource pools |
| Circuit breaker | Fail fast on known failures |
| Retry | Handle transient errors |
| Timeout | Prevent indefinite blocking |

---

## Rate Limiting as Protection

Rate limiting protects services from being overwhelmed:

```javascript
class TokenBucketRateLimiter {
  constructor(options) {
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;  // tokens per second
    this.tokens = options.capacity;
    this.lastRefill = Date.now();
  }

  tryAcquire() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens--;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// Usage: 100 requests per second with burst of 150
const limiter = new TokenBucketRateLimiter({
  capacity: 150,
  refillRate: 100,
});
```

---

## Practical Implementation: HTTP Client

A production-ready HTTP client combining all patterns:

```javascript
class ResilientHttpClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.breaker = new CircuitBreaker({
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 30000,
      halfOpenMax: options.halfOpenMax || 3,
    });
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 5000;
    this.rateLimiter = new TokenBucketRateLimiter({
      capacity: options.rateLimit || 100,
      refillRate: options.rateLimit || 100,
    });
  }

  async get(path, options = {}) {
    return this.request("GET", path, options);
  }

  async post(path, body, options = {}) {
    return this.request("POST", path, { ...options, body });
  }

  async request(method, path, options = {}) {
    if (!this.rateLimiter.tryAcquire()) {
      throw new RateLimitError("Rate limit exceeded");
    }

    return this.breaker.call(() =>
      this.retryableRequest(method, path, options)
    );
  }

  async retryableRequest(method, path, options, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeout || this.timeout
      );

      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new HttpError(response.status, response.statusText);
        if (this.isRetryableStatus(response.status) && attempt < this.maxRetries) {
          return this.retryAfterDelay(method, path, options, attempt);
        }
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
      }
      if (this.isRetryableError(error) && attempt < this.maxRetries) {
        return this.retryAfterDelay(method, path, options, attempt);
      }
      throw error;
    }
  }

  async retryAfterDelay(method, path, options, attempt) {
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
    const jitter = delay * (0.5 + Math.random() * 0.5);
    await sleep(jitter);
    return this.retryableRequest(method, path, options, attempt + 1);
  }

  isRetryableStatus(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  isRetryableError(error) {
    return error instanceof TimeoutError || error.code === "ECONNRESET";
  }
}
```

---

## Monitoring and Observability

Always monitor your resilience patterns:

```javascript
// Emit metrics for circuit breaker state changes
circuitBreaker.on("stateChange", (from, to) => {
  metrics.increment("circuit_breaker.state_change", {
    service: "payment",
    from,
    to,
  });

  if (to === "OPEN") {
    alerts.fire("circuit_breaker_opened", {
      service: "payment",
      message: "Payment service circuit breaker opened",
    });
  }
});

// Track retry metrics
metrics.histogram("retry.attempts", attemptCount, { service: "payment" });
metrics.increment("retry.exhausted", { service: "payment" });
```

---

## Exercise 1: Implement a Circuit Breaker

Build a circuit breaker that:
1. Opens after 3 consecutive failures
2. Waits 10 seconds before half-open
3. Allows 2 probe requests in half-open
4. Emits state change events

Test it with a mock service that fails intermittently.

---

## Exercise 2: Retry with Budget

Implement a retry mechanism that:
1. Uses exponential backoff with full jitter
2. Enforces a retry budget of 20% of total requests
3. Only retries on 5xx errors and timeouts
4. Logs each retry attempt with context

---

## Exercise 3: Combine All Patterns

Build a resilient service client that combines:
- Circuit breaker (opens at 50% failure rate over 20 calls)
- Retry (max 3, exponential backoff with jitter)
- Timeout (3 seconds)
- Bulkhead (max 10 concurrent calls)
- Fallback (return cached response)

Test with a service that has varying failure rates and latencies.

---

## Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| Circuit Breaker | Fail fast, protect from cascading failures | Calling any external/remote service |
| Retry | Handle transient failures | Network blips, temporary unavailability |
| Bulkhead | Isolate resource pools | Multiple downstream dependencies |
| Timeout | Prevent indefinite blocking | Every external call |
| Fallback | Provide degraded experience | Non-critical features |
| Rate Limiter | Prevent overload | Protecting downstream services |
| Retry Budget | Prevent retry storms | High-throughput systems |

**Key Principles:**
- Always set timeouts on external calls
- Use exponential backoff with jitter for retries
- Implement retry budgets to prevent retry storms
- Combine patterns in the correct order (rate limit → bulkhead → circuit breaker → retry → timeout)
- Monitor circuit breaker state changes and alert on opens
- Design fallbacks for every critical dependency
- Test failure scenarios with chaos engineering
