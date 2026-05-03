---
title: Mock Servers & Service Virtualization
---

## Why Mock External Services

Production applications integrate with third-party APIs — payment processors, email providers, geolocation services, and more. Testing against real external services introduces problems:

- **Rate limits**: APIs throttle requests, causing CI failures during heavy test runs
- **Cost**: Each API call to services like Stripe or Twilio may incur charges
- **Reliability**: External service outages break your test suite through no fault of your code
- **Speed**: Network round-trips slow down test execution significantly
- **Determinism**: External APIs may return different data across runs, making assertions fragile
- **Environment isolation**: You cannot control the state of external systems

Mock servers solve these problems by simulating external API behaviour locally, giving you full control over responses, latency, and error conditions.

## Mock Server Tools Overview

| Tool | Language/Ecosystem | Key Features |
|------|-------------------|--------------|
| **WireMock** | Java (standalone JAR works anywhere) | Request matching, recording, stateful scenarios |
| **MSW** (Mock Service Worker) | JavaScript/TypeScript | Intercepts at the network level, works in browser + Node |
| **json-server** | JavaScript | Instant REST API from a JSON file |
| **responses** | Python | Decorator-based HTTP mocking for `requests` library |
| **httpretty** | Python | Socket-level HTTP mocking |
| **WireMock.Net** | C#/.NET | .NET port of WireMock with fluent API |
| **Hoverfly** | Language-agnostic | Proxy-based, supports record/replay |

Choose based on your stack and needs:
- **Unit tests**: Use in-process mocking (responses, MSW handlers)
- **Integration tests**: Use standalone mock servers (WireMock, json-server)
- **Contract tests**: Use record/replay with schema validation

## Recording and Replaying HTTP Interactions

Instead of manually crafting mock responses, you can record real API interactions and replay them in tests. This ensures your mocks accurately reflect the real API's behaviour.

```python
import responses
import requests
import json
from pathlib import Path

# --- Recording phase (run once against real API) ---
def record_api_interaction(url, output_file):
    """Record a real API response to a file for later replay."""
    response = requests.get(url)
    recording = {
        "url": url,
        "status": response.status_code,
        "headers": dict(response.headers),
        "body": response.json()
    }
    Path(output_file).write_text(json.dumps(recording, indent=2))

# --- Replay phase (used in tests) ---
def load_recording(file_path):
    return json.loads(Path(file_path).read_text())

@responses.activate
def test_user_service_with_recorded_response():
    recording = load_recording("fixtures/get_user_response.json")

    responses.add(
        responses.GET,
        recording["url"],
        json=recording["body"],
        status=recording["status"]
    )

    # Now test your code that calls this API
    from myapp.services import UserService
    service = UserService(base_url="https://api.example.com")
    user = service.get_user("123")

    assert user.name == recording["body"]["name"]
    assert user.email == recording["body"]["email"]

@responses.activate
def test_handles_api_error_response():
    responses.add(
        responses.GET,
        "https://api.example.com/users/999",
        json={"error": "Not found", "code": "USER_NOT_FOUND"},
        status=404
    )

    from myapp.services import UserService
    service = UserService(base_url="https://api.example.com")
    user = service.get_user("999")

    assert user is None
```

```javascript
const { http, HttpResponse } = require("msw");
const { setupServer } = require("msw/node");
const fs = require("fs");
const path = require("path");

// Load a recorded response fixture
function loadFixture(name) {
  const filePath = path.join(__dirname, "fixtures", `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Setup MSW server with recorded responses
const server = setupServer(
  http.get("https://api.example.com/users/:id", ({ params }) => {
    const fixture = loadFixture(`user_${params.id}`);
    return HttpResponse.json(fixture.body, { status: fixture.status });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UserService with recorded responses", () => {
  it("should parse user data from recorded response", async () => {
    const { UserService } = require("../services/userService");
    const service = new UserService("https://api.example.com");

    const user = await service.getUser("123");
    expect(user.name).toBeDefined();
    expect(user.email).toContain("@");
  });

  it("should handle recorded error response", async () => {
    // Override for this specific test
    server.use(
      http.get("https://api.example.com/users/:id", () => {
        return HttpResponse.json(
          { error: "Not found" },
          { status: 404 }
        );
      })
    );

    const { UserService } = require("../services/userService");
    const service = new UserService("https://api.example.com");
    const user = await service.getUser("999");
    expect(user).toBeNull();
  });
});
```

```java
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.recording.SnapshotRecordResult;
import org.junit.jupiter.api.*;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

class RecordReplayTest {

    static WireMockServer wireMock;

    @BeforeAll
    static void setup() {
        wireMock = new WireMockServer(8089);
        wireMock.start();
        WireMock.configureFor("localhost", 8089);
    }

    @AfterAll
    static void teardown() {
        wireMock.stop();
    }

    /**
     * Record mode: proxy to real API and save responses.
     * Run once, then use saved mappings for replay.
     */
    @Test
    @Disabled("Run manually to record new fixtures")
    void recordInteractions() {
        wireMock.startRecording(
            recordSpec()
                .forTarget("https://api.example.com")
                .captureHeader("Accept")
                .makeStubsPersistent(true)
        );

        // Make calls through the proxy
        var client = HttpClient.newHttpClient();
        var request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8089/users/123"))
            .build();
        client.send(request, HttpResponse.BodyHandlers.ofString());

        SnapshotRecordResult result = wireMock.stopRecording();
        assertThat(result.getStubMappings()).isNotEmpty();
    }

    /**
     * Replay mode: use previously recorded stubs.
     */
    @Test
    void replayRecordedInteraction() {
        // Stub loaded from recorded mapping files in src/test/resources/mappings/
        stubFor(get(urlEqualTo("/users/123"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBodyFile("user_123.json")));

        // Test your service
        UserService service = new UserService("http://localhost:8089");
        User user = service.getUser("123");

        assertThat(user.getName()).isNotBlank();
        assertThat(user.getEmail()).contains("@");
    }
}
```

```csharp
using WireMock.Server;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using Xunit;

public class RecordReplayTests : IDisposable
{
    private readonly WireMockServer _server;

    public RecordReplayTests()
    {
        _server = WireMockServer.Start();
    }

    public void Dispose()
    {
        _server.Stop();
    }

    [Fact]
    public async Task ReplayRecordedUserResponse()
    {
        // Setup stub from recorded fixture
        var fixture = await File.ReadAllTextAsync("fixtures/user_123.json");

        _server.Given(
            Request.Create().WithPath("/users/123").UsingGet()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(fixture)
        );

        // Test service against mock
        var service = new UserService(_server.Url);
        var user = await service.GetUserAsync("123");

        Assert.NotNull(user);
        Assert.NotEmpty(user.Name);
        Assert.Contains("@", user.Email);
    }

    [Fact]
    public async Task ReplayErrorScenario()
    {
        _server.Given(
            Request.Create().WithPath("/users/999").UsingGet()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(404)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{""error"": ""Not found""}")
        );

        var service = new UserService(_server.Url);
        var user = await service.GetUserAsync("999");

        Assert.Null(user);
    }
}
```

## Service Virtualization for Complex APIs

Service virtualization goes beyond simple request-response mocking. It simulates stateful behaviour, conditional logic, and multi-step workflows that mirror real service interactions.

```python
import responses
import re

@responses.activate
def test_stateful_api_workflow():
    """Simulate a multi-step API workflow with state."""
    created_order = {"id": "ORD-001", "status": "pending", "items": []}

    # Step 1: Create order
    responses.add(
        responses.POST,
        "https://api.shop.com/orders",
        json=created_order,
        status=201
    )

    # Step 2: Add item to order
    responses.add(
        responses.POST,
        "https://api.shop.com/orders/ORD-001/items",
        json={**created_order, "items": [{"sku": "WIDGET-1", "qty": 2}]},
        status=200
    )

    # Step 3: Submit order (status changes)
    responses.add(
        responses.POST,
        "https://api.shop.com/orders/ORD-001/submit",
        json={**created_order, "status": "submitted", "items": [{"sku": "WIDGET-1", "qty": 2}]},
        status=200
    )

    from myapp.services import OrderService
    service = OrderService(base_url="https://api.shop.com")
    order = service.create_order()
    assert order["status"] == "pending"

    order = service.add_item(order["id"], sku="WIDGET-1", qty=2)
    assert len(order["items"]) == 1

    order = service.submit_order(order["id"])
    assert order["status"] == "submitted"

@responses.activate
def test_conditional_response_based_on_request_body():
    """Return different responses based on request content."""
    def request_callback(request):
        body = json.loads(request.body)
        if body.get("amount", 0) > 10000:
            return (400, {}, json.dumps({"error": "Amount exceeds limit"}))
        return (200, {}, json.dumps({"transaction_id": "TXN-123", "status": "approved"}))

    responses.add_callback(
        responses.POST,
        "https://api.payment.com/charge",
        callback=request_callback
    )

    from myapp.services import PaymentService
    service = PaymentService(base_url="https://api.payment.com")

    result = service.charge(amount=5000)
    assert result["status"] == "approved"

    result = service.charge(amount=15000)
    assert "error" in result
```

```javascript
const { http, HttpResponse } = require("msw");
const { setupServer } = require("msw/node");

// Stateful mock: simulates an order management system
let orders = new Map();

const handlers = [
  http.post("https://api.shop.com/orders", async ({ request }) => {
    const body = await request.json();
    const order = {
      id: `ORD-${Date.now()}`,
      status: "pending",
      items: [],
      ...body,
    };
    orders.set(order.id, order);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.post("https://api.shop.com/orders/:id/items", async ({ params, request }) => {
    const order = orders.get(params.id);
    if (!order) return HttpResponse.json({ error: "Not found" }, { status: 404 });

    const item = await request.json();
    order.items.push(item);
    return HttpResponse.json(order);
  }),

  http.post("https://api.shop.com/orders/:id/submit", ({ params }) => {
    const order = orders.get(params.id);
    if (!order) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    if (order.items.length === 0) {
      return HttpResponse.json(
        { error: "Cannot submit empty order" },
        { status: 400 }
      );
    }
    order.status = "submitted";
    return HttpResponse.json(order);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  orders.clear();
  server.resetHandlers();
});
afterAll(() => server.close());

describe("Stateful Service Virtualization", () => {
  it("should simulate full order workflow", async () => {
    const { OrderService } = require("../services/orderService");
    const service = new OrderService("https://api.shop.com");

    const order = await service.createOrder({ customer: "Jane" });
    expect(order.status).toBe("pending");

    const updated = await service.addItem(order.id, { sku: "W-1", qty: 3 });
    expect(updated.items).toHaveLength(1);

    const submitted = await service.submitOrder(order.id);
    expect(submitted.status).toBe("submitted");
  });

  it("should reject submitting empty orders", async () => {
    const { OrderService } = require("../services/orderService");
    const service = new OrderService("https://api.shop.com");

    const order = await service.createOrder({ customer: "Jane" });
    await expect(service.submitOrder(order.id)).rejects.toThrow("Cannot submit");
  });
});
```

## Stub vs Mock Server: Test Doubles at the HTTP Level

Understanding the distinction helps you choose the right approach:

| Aspect | Stub Server | Mock Server |
|--------|-------------|-------------|
| **Purpose** | Returns canned responses | Verifies expected interactions |
| **Assertion target** | Response correctness | Request correctness |
| **Behaviour** | Passive — always responds the same | Active — records and verifies calls |
| **Use case** | "Given this API exists, does my code work?" | "Does my code call the API correctly?" |

```java
import com.github.tomakehurst.wiremock.WireMockServer;
import static com.github.tomakehurst.wiremock.client.WireMock.*;

class StubVsMockTest {

    static WireMockServer wireMock = new WireMockServer(8089);

    @BeforeAll
    static void setup() {
        wireMock.start();
    }

    @AfterAll
    static void teardown() {
        wireMock.stop();
    }

    @BeforeEach
    void reset() {
        wireMock.resetAll();
    }

    @Test
    void stubExample_ReturnsFixedResponse() {
        // STUB: we only care that our code handles the response correctly
        wireMock.stubFor(get(urlEqualTo("/api/weather?city=London"))
            .willReturn(aResponse()
                .withStatus(200)
                .withBody("{\"temp\": 18, \"condition\": \"cloudy\"}")));

        WeatherService service = new WeatherService("http://localhost:8089");
        Weather weather = service.getWeather("London");

        assertThat(weather.getTemp()).isEqualTo(18);
        assertThat(weather.getCondition()).isEqualTo("cloudy");
    }

    @Test
    void mockExample_VerifiesCorrectRequest() {
        // MOCK: we verify our code sends the right request
        wireMock.stubFor(post(urlEqualTo("/api/notifications"))
            .willReturn(aResponse().withStatus(202)));

        NotificationService service = new NotificationService("http://localhost:8089");
        service.sendNotification("user@example.com", "Hello!");

        // Verify the request was made with correct body
        wireMock.verify(postRequestedFor(urlEqualTo("/api/notifications"))
            .withRequestBody(matchingJsonPath("$.email", equalTo("user@example.com")))
            .withRequestBody(matchingJsonPath("$.message", equalTo("Hello!")))
            .withHeader("Content-Type", equalTo("application/json")));
    }

    @Test
    void mockExample_VerifiesRequestCount() {
        wireMock.stubFor(post(urlEqualTo("/api/events"))
            .willReturn(aResponse().withStatus(200)));

        EventBatcher batcher = new EventBatcher("http://localhost:8089");
        batcher.addEvent("click");
        batcher.addEvent("scroll");
        batcher.addEvent("click");
        batcher.flush();  // Should batch into single request

        // Verify only ONE request was made (batching works)
        wireMock.verify(1, postRequestedFor(urlEqualTo("/api/events")));
    }
}
```

```csharp
using WireMock.Server;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Matchers;
using Xunit;

public class StubVsMockTests : IDisposable
{
    private readonly WireMockServer _server;

    public StubVsMockTests()
    {
        _server = WireMockServer.Start();
    }

    public void Dispose() => _server.Stop();

    [Fact]
    public async Task StubExample_ReturnsFixedResponse()
    {
        // STUB: fixed response, test our parsing logic
        _server.Given(
            Request.Create().WithPath("/api/weather").UsingGet()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(200)
                .WithBody(@"{""temp"": 18, ""condition"": ""cloudy""}")
        );

        var service = new WeatherService(_server.Url);
        var weather = await service.GetWeatherAsync("London");

        Assert.Equal(18, weather.Temp);
        Assert.Equal("cloudy", weather.Condition);
    }

    [Fact]
    public async Task MockExample_VerifiesCorrectRequestSent()
    {
        // MOCK: verify our code makes the right API call
        _server.Given(
            Request.Create().WithPath("/api/notifications").UsingPost()
        ).RespondWith(
            Response.Create().WithStatusCode(202)
        );

        var service = new NotificationService(_server.Url);
        await service.SendNotificationAsync("user@example.com", "Hello!");

        // Verify the request
        var entries = _server.LogEntries;
        Assert.Single(entries);

        var body = entries[0].RequestMessage.Body;
        Assert.Contains("user@example.com", body);
        Assert.Contains("Hello!", body);
    }

    [Fact]
    public async Task MockExample_SimulatesLatency()
    {
        // Simulate slow API to test timeout handling
        _server.Given(
            Request.Create().WithPath("/api/slow").UsingGet()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(200)
                .WithBody(@"{""data"": ""delayed""}")
                .WithDelay(TimeSpan.FromSeconds(3))
        );

        var service = new DataService(_server.Url);
        service.Timeout = TimeSpan.FromSeconds(1);

        await Assert.ThrowsAsync<TaskCanceledException>(
            () => service.FetchDataAsync("/api/slow"));
    }

    [Fact]
    public async Task MockExample_SimulatesFault()
    {
        // Simulate connection reset
        _server.Given(
            Request.Create().WithPath("/api/flaky").UsingGet()
        ).RespondWith(
            Response.Create().WithFault(FaultType.CONNECTION_RESET_BY_PEER)
        );

        var service = new DataService(_server.Url);
        var result = await service.FetchWithRetryAsync("/api/flaky", maxRetries: 3);

        Assert.Null(result);
        // Verify 4 attempts were made (1 original + 3 retries)
        Assert.Equal(4, _server.LogEntries.Count());
    }
}
```

## Setting Up Mock Servers: Complete Examples

### Python with `responses`

```python
import responses
import requests
import pytest

class TestPaymentGateway:
    """Test payment processing against a mocked Stripe-like API."""

    @responses.activate
    def test_successful_charge(self):
        responses.add(
            responses.POST,
            "https://api.stripe.com/v1/charges",
            json={
                "id": "ch_test_123",
                "amount": 2000,
                "currency": "usd",
                "status": "succeeded"
            },
            status=200
        )

        from myapp.payments import create_charge
        result = create_charge(amount=2000, currency="usd", token="tok_visa")

        assert result["status"] == "succeeded"
        assert result["amount"] == 2000
        # Verify request was sent correctly
        assert len(responses.calls) == 1
        assert "tok_visa" in responses.calls[0].request.body

    @responses.activate
    def test_declined_card(self):
        responses.add(
            responses.POST,
            "https://api.stripe.com/v1/charges",
            json={
                "error": {
                    "type": "card_error",
                    "code": "card_declined",
                    "message": "Your card was declined."
                }
            },
            status=402
        )

        from myapp.payments import create_charge
        with pytest.raises(PaymentError) as exc_info:
            create_charge(amount=2000, currency="usd", token="tok_declined")
        assert "declined" in str(exc_info.value)

    @responses.activate
    def test_network_timeout_with_retry(self):
        # First call times out, second succeeds
        responses.add(
            responses.POST,
            "https://api.stripe.com/v1/charges",
            body=requests.exceptions.ConnectionError("Connection timed out")
        )
        responses.add(
            responses.POST,
            "https://api.stripe.com/v1/charges",
            json={"id": "ch_retry", "status": "succeeded"},
            status=200
        )

        from myapp.payments import create_charge_with_retry
        result = create_charge_with_retry(amount=1000, currency="usd", token="tok_visa")

        assert result["status"] == "succeeded"
        assert len(responses.calls) == 2  # Retried once
```

### JavaScript with MSW

```javascript
const { http, HttpResponse, delay } = require("msw");
const { setupServer } = require("msw/node");

const handlers = [
  // Simulate a payment API
  http.post("https://api.stripe.com/v1/charges", async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);

    if (params.get("source") === "tok_declined") {
      return HttpResponse.json(
        { error: { type: "card_error", code: "card_declined" } },
        { status: 402 }
      );
    }

    return HttpResponse.json({
      id: "ch_mock_123",
      amount: parseInt(params.get("amount")),
      status: "succeeded",
    });
  }),

  // Simulate a slow endpoint
  http.get("https://api.example.com/slow", async () => {
    await delay(3000);
    return HttpResponse.json({ data: "finally" });
  }),

  // Simulate intermittent failures
  http.get("https://api.example.com/flaky", () => {
    if (Math.random() < 0.5) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ status: "ok" });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Payment Service with MSW", () => {
  it("should process successful payment", async () => {
    const { processPayment } = require("../services/payment");
    const result = await processPayment({
      amount: 2000,
      source: "tok_visa",
    });

    expect(result.status).toBe("succeeded");
    expect(result.amount).toBe(2000);
  });

  it("should handle declined cards gracefully", async () => {
    const { processPayment } = require("../services/payment");
    await expect(
      processPayment({ amount: 2000, source: "tok_declined" })
    ).rejects.toThrow("card_declined");
  });

  it("should handle unregistered endpoints strictly", async () => {
    const { fetchData } = require("../services/data");
    // onUnhandledRequest: "error" means unmocked calls throw
    await expect(
      fetchData("https://unregistered.api.com/data")
    ).rejects.toThrow();
  });
});
```

### Java with WireMock

```java
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

class PaymentServiceWireMockTest {

    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
        .options(wireMockConfig().dynamicPort())
        .build();

    @Test
    void shouldProcessSuccessfulPayment() {
        wireMock.stubFor(post(urlEqualTo("/v1/charges"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {"id": "ch_123", "amount": 2000, "status": "succeeded"}
                    """)));

        PaymentService service = new PaymentService(wireMock.baseUrl());
        PaymentResult result = service.charge(2000, "usd", "tok_visa");

        assertThat(result.getStatus()).isEqualTo("succeeded");
        assertThat(result.getAmount()).isEqualTo(2000);
    }

    @Test
    void shouldHandleTimeoutWithCircuitBreaker() {
        wireMock.stubFor(post(urlEqualTo("/v1/charges"))
            .willReturn(aResponse()
                .withStatus(200)
                .withFixedDelay(5000)));  // 5s delay

        PaymentService service = new PaymentService(wireMock.baseUrl());
        service.setTimeout(Duration.ofSeconds(2));

        assertThatThrownBy(() -> service.charge(1000, "usd", "tok_visa"))
            .isInstanceOf(PaymentTimeoutException.class);
    }

    @Test
    void shouldRetryOnServerError() {
        // First two calls return 503, third succeeds
        wireMock.stubFor(post(urlEqualTo("/v1/charges"))
            .inScenario("Retry")
            .whenScenarioStateIs("Started")
            .willReturn(aResponse().withStatus(503))
            .willSetStateTo("First Retry"));

        wireMock.stubFor(post(urlEqualTo("/v1/charges"))
            .inScenario("Retry")
            .whenScenarioStateIs("First Retry")
            .willReturn(aResponse().withStatus(503))
            .willSetStateTo("Second Retry"));

        wireMock.stubFor(post(urlEqualTo("/v1/charges"))
            .inScenario("Retry")
            .whenScenarioStateIs("Second Retry")
            .willReturn(aResponse()
                .withStatus(200)
                .withBody("{\"id\": \"ch_retry\", \"status\": \"succeeded\"}")));

        PaymentService service = new PaymentService(wireMock.baseUrl());
        PaymentResult result = service.chargeWithRetry(1000, "usd", "tok_visa");

        assertThat(result.getStatus()).isEqualTo("succeeded");
        wireMock.verify(3, postRequestedFor(urlEqualTo("/v1/charges")));
    }
}
```

### C# with WireMock.Net

```csharp
using WireMock.Server;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using Xunit;

public class PaymentServiceTests : IDisposable
{
    private readonly WireMockServer _server;
    private readonly PaymentService _service;

    public PaymentServiceTests()
    {
        _server = WireMockServer.Start();
        _service = new PaymentService(_server.Url);
    }

    public void Dispose() => _server.Stop();

    [Fact]
    public async Task SuccessfulCharge_ReturnsResult()
    {
        _server.Given(
            Request.Create().WithPath("/v1/charges").UsingPost()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(200)
                .WithBody(@"{""id"": ""ch_123"", ""status"": ""succeeded"", ""amount"": 2000}")
        );

        var result = await _service.ChargeAsync(2000, "usd", "tok_visa");

        Assert.Equal("succeeded", result.Status);
        Assert.Equal(2000, result.Amount);
    }

    [Fact]
    public async Task DeclinedCard_ThrowsPaymentException()
    {
        _server.Given(
            Request.Create().WithPath("/v1/charges").UsingPost()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(402)
                .WithBody(@"{""error"": {""code"": ""card_declined""}}")
        );

        await Assert.ThrowsAsync<PaymentDeclinedException>(
            () => _service.ChargeAsync(2000, "usd", "tok_declined"));
    }

    [Fact]
    public async Task SlowResponse_TriggersTimeout()
    {
        _server.Given(
            Request.Create().WithPath("/v1/charges").UsingPost()
        ).RespondWith(
            Response.Create()
                .WithStatusCode(200)
                .WithBody(@"{""status"": ""succeeded""}")
                .WithDelay(TimeSpan.FromSeconds(5))
        );

        _service.Timeout = TimeSpan.FromSeconds(1);

        await Assert.ThrowsAsync<TaskCanceledException>(
            () => _service.ChargeAsync(1000, "usd", "tok_visa"));
    }
}
```

## Summary

Mock servers and service virtualization enable reliable, fast, and deterministic testing of external integrations:

- **Start simple**: Use library-level mocking (responses, MSW) for unit tests
- **Scale up**: Use standalone mock servers (WireMock) for integration and contract tests
- **Record real interactions** to bootstrap accurate mock responses
- **Test failure modes**: Simulate timeouts, network errors, rate limits, and malformed responses
- **Verify requests**: Use mock assertions to confirm your code sends correct requests
- **Stateful scenarios**: Model multi-step workflows for complex integration testing
- **Keep mocks updated**: Regularly re-record or validate mocks against the real API to prevent drift
