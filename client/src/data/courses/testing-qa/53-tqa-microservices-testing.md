---
title: Testing Microservices
---

## Challenges of Testing Microservices

Distributed systems introduce testing complexities absent in monoliths:

- **Network boundaries**: Services communicate over HTTP, gRPC, or messaging—each call can fail
- **Data consistency**: No single transaction spans multiple services
- **Deployment independence**: Services evolve at different speeds
- **Environment complexity**: Reproducing the full system locally is impractical
- **Observability**: Failures may be intermittent, timing-dependent, or cascading

## Testing Strategies: The Microservices Testing Pyramid

```
         ┌─────────┐
         │  E2E    │  Few: critical user journeys
         ├─────────┤
       ┌─┤Contract ├─┐  Medium: API compatibility
       │ ├─────────┤ │
     ┌─┤ │ Service │ ├─┐  Many: single service with mocked deps
     │ │ ├─────────┤ │ │
   ┌─┤ │ │  Unit   │ │ ├─┐  Most: isolated logic
   │ │ │ └─────────┘ │ │ │
   └─┘ └─────────────┘ └─┘
```

- **Unit tests**: Pure logic, no I/O, no network
- **Service tests**: One service under test, dependencies mocked/stubbed
- **Contract tests**: Verify API agreements between producer and consumer
- **End-to-end tests**: Full system deployed, real network calls

## Service-Level Testing

Test a single microservice with all external dependencies mocked:

- Mock downstream HTTP services using WireMock, nock, or responses
- Replace message brokers with in-memory queues
- Use an in-memory or containerized database
- Verify the service handles errors from dependencies gracefully

## Contract Testing Between Services

Contracts define the API agreement between two services:

- **Consumer-driven contracts**: The consumer defines what it needs
- **Provider verification**: The provider runs contract tests to ensure compliance
- **Schema evolution**: Contracts catch breaking changes before deployment
- Tools: Pact, Spring Cloud Contract, Specmatic

## Testing Asynchronous Communication

Microservices often communicate via events or messages:

- Verify messages are published to the correct topic/queue
- Test consumers process messages and produce expected side effects
- Simulate message ordering and delivery guarantees
- Test dead-letter queue handling for failed messages

## Saga Pattern Testing

Long-running distributed transactions (sagas) require special testing:

- Test the happy path: all steps succeed
- Test compensating actions: step N fails, steps 1..N-1 are rolled back
- Test idempotency: replaying a step doesn't cause duplicates
- Test timeout handling: what happens when a step never responds

## Code Examples

### Python: Testing a Microservice with Mocked Dependencies

```python
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()


class OrderRequest(BaseModel):
    product_id: str
    quantity: int
    customer_id: str


class InventoryClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def check_stock(self, product_id: str, quantity: int) -> bool:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/inventory/{product_id}",
                                    params={"quantity": quantity})
            return resp.json().get("available", False)


class PaymentClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def charge(self, customer_id: str, amount: float) -> str:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}/payments",
                                     json={"customer_id": customer_id, "amount": amount})
            return resp.json().get("transaction_id")


inventory_client = InventoryClient("http://inventory-service:8001")
payment_client = PaymentClient("http://payment-service:8002")


@app.post("/orders")
async def create_order(order: OrderRequest):
    available = await inventory_client.check_stock(order.product_id, order.quantity)
    if not available:
        raise HTTPException(status_code=409, detail="Insufficient stock")

    total = order.quantity * 29.99
    txn_id = await payment_client.charge(order.customer_id, total)
    if not txn_id:
        raise HTTPException(status_code=502, detail="Payment failed")

    return {"order_id": f"ORD-{txn_id[:8]}", "status": "confirmed", "total": total}


class TestOrderService:
    @pytest.fixture
    def client(self):
        return TestClient(app)

    @patch.object(inventory_client, "check_stock", new_callable=AsyncMock)
    @patch.object(payment_client, "charge", new_callable=AsyncMock)
    def test_successful_order(self, mock_charge, mock_stock, client):
        mock_stock.return_value = True
        mock_charge.return_value = "txn-12345678-abcd"

        response = client.post("/orders", json={
            "product_id": "PROD-001", "quantity": 2, "customer_id": "CUST-001",
        })

        assert response.status_code == 200
        assert response.json()["status"] == "confirmed"
        mock_stock.assert_called_once_with("PROD-001", 2)

    @patch.object(inventory_client, "check_stock", new_callable=AsyncMock)
    def test_insufficient_stock(self, mock_stock, client):
        mock_stock.return_value = False
        response = client.post("/orders", json={
            "product_id": "PROD-001", "quantity": 100, "customer_id": "CUST-001",
        })
        assert response.status_code == 409

    @patch.object(inventory_client, "check_stock", new_callable=AsyncMock)
    @patch.object(payment_client, "charge", new_callable=AsyncMock)
    def test_payment_failure(self, mock_charge, mock_stock, client):
        mock_stock.return_value = True
        mock_charge.return_value = None
        response = client.post("/orders", json={
            "product_id": "PROD-001", "quantity": 1, "customer_id": "CUST-001",
        })
        assert response.status_code == 502
```

### JavaScript: Testing a Microservice with Mocked Dependencies

```javascript
// Service: OrderService depends on InventoryService and PaymentService
// We mock HTTP calls using nock

const express = require("express");
const axios = require("axios");
const nock = require("nock");
const request = require("supertest");

// --- Application Code ---
function createApp(config) {
  const app = express();
  app.use(express.json());

  const inventoryUrl = config.inventoryUrl || "http://inventory-service:8001";
  const paymentUrl = config.paymentUrl || "http://payment-service:8002";

  app.post("/orders", async (req, res) => {
    const { productId, quantity, customerId } = req.body;

    try {
      // Check inventory
      const stockResponse = await axios.get(
        `${inventoryUrl}/inventory/${productId}`,
        { params: { quantity } }
      );

      if (!stockResponse.data.available) {
        return res.status(409).json({ error: "Insufficient stock" });
      }

      // Process payment
      const total = quantity * 29.99;
      const paymentResponse = await axios.post(`${paymentUrl}/payments`, {
        customerId,
        amount: total,
      });

      return res.status(201).json({
        orderId: `ORD-${paymentResponse.data.transactionId.slice(0, 8)}`,
        status: "confirmed",
        total,
      });
    } catch (error) {
      if (error.response?.status === 503) {
        return res.status(503).json({ error: "Downstream service unavailable" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}

// --- Tests ---
describe("Order Service", () => {
  const INVENTORY_URL = "http://inventory-service:8001";
  const PAYMENT_URL = "http://payment-service:8002";
  let app;

  beforeAll(() => {
    app = createApp({
      inventoryUrl: INVENTORY_URL,
      paymentUrl: PAYMENT_URL,
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("creates order when stock available and payment succeeds", async () => {
    nock(INVENTORY_URL)
      .get("/inventory/PROD-001")
      .query({ quantity: "2" })
      .reply(200, { available: true, remaining: 50 });

    nock(PAYMENT_URL)
      .post("/payments", { customerId: "CUST-001", amount: 59.98 })
      .reply(200, { transactionId: "txn-abcdef12-3456" });

    const response = await request(app)
      .post("/orders")
      .send({ productId: "PROD-001", quantity: 2, customerId: "CUST-001" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("confirmed");
    expect(response.body.total).toBe(59.98);
    expect(response.body.orderId).toMatch(/^ORD-/);
  });

  test("returns 409 when stock is insufficient", async () => {
    nock(INVENTORY_URL)
      .get("/inventory/PROD-001")
      .query({ quantity: "100" })
      .reply(200, { available: false, remaining: 5 });

    const response = await request(app)
      .post("/orders")
      .send({ productId: "PROD-001", quantity: 100, customerId: "CUST-001" });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Insufficient stock");
  });

  test("returns 503 when downstream service is unavailable", async () => {
    nock(INVENTORY_URL)
      .get("/inventory/PROD-001")
      .query({ quantity: "1" })
      .reply(503);

    const response = await request(app)
      .post("/orders")
      .send({ productId: "PROD-001", quantity: 1, customerId: "CUST-001" });

    expect(response.status).toBe(503);
    expect(response.body.error).toBe("Downstream service unavailable");
  });

  test("handles payment service timeout gracefully", async () => {
    nock(INVENTORY_URL)
      .get("/inventory/PROD-001")
      .query({ quantity: "1" })
      .reply(200, { available: true });

    nock(PAYMENT_URL)
      .post("/payments")
      .delayConnection(5000)
      .reply(200, { transactionId: "txn-late" });

    // axios will timeout (default or configured)
    const response = await request(app)
      .post("/orders")
      .send({ productId: "PROD-001", quantity: 1, customerId: "CUST-001" });

    expect(response.status).toBe(500);
  });
});
```

### Java: Testing a Microservice with WireMock

```java
package com.example.order;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrderServiceIntegrationTest {

    static WireMockServer inventoryService = new WireMockServer(
        WireMockConfiguration.wireMockConfig().dynamicPort());
    static WireMockServer paymentService = new WireMockServer(
        WireMockConfiguration.wireMockConfig().dynamicPort());

    @Autowired private MockMvc mockMvc;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("services.inventory.url", inventoryService::baseUrl);
        registry.add("services.payment.url", paymentService::baseUrl);
    }

    @BeforeAll static void startWireMock() { inventoryService.start(); paymentService.start(); }
    @AfterAll static void stopWireMock() { inventoryService.stop(); paymentService.stop(); }
    @BeforeEach void resetMocks() { inventoryService.resetAll(); paymentService.resetAll(); }

    @Test
    void shouldCreateOrderWhenStockAvailable() throws Exception {
        inventoryService.stubFor(get(urlPathEqualTo("/inventory/PROD-001"))
            .willReturn(aResponse().withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"available\": true}")));

        paymentService.stubFor(post(urlEqualTo("/payments"))
            .willReturn(aResponse().withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"transactionId\": \"txn-abcdef12\"}")));

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":\"PROD-001\",\"quantity\":2,\"customerId\":\"CUST-001\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("confirmed"));

        inventoryService.verify(1, getRequestedFor(urlPathEqualTo("/inventory/PROD-001")));
        paymentService.verify(1, postRequestedFor(urlEqualTo("/payments")));
    }

    @Test
    void shouldReturn409WhenStockInsufficient() throws Exception {
        inventoryService.stubFor(get(urlPathMatching("/inventory/.*"))
            .willReturn(aResponse().withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"available\": false}")));

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":\"PROD-001\",\"quantity\":100,\"customerId\":\"CUST-001\"}"))
            .andExpect(status().isConflict());

        paymentService.verify(0, postRequestedFor(urlEqualTo("/payments")));
    }
}
```

### C#: Testing a Microservice with Mocked HTTP Dependencies

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using WireMock.Server;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using Xunit;

namespace OrderService.Tests.Integration;

public record CreateOrderRequest(string ProductId, int Quantity, string CustomerId);
public record OrderResponse(string OrderId, string Status, decimal Total);

public class OrderServiceTests : IAsyncLifetime
{
    private WireMockServer _inventoryService = null!;
    private WireMockServer _paymentService = null!;
    private HttpClient _client = null!;
    private WebApplicationFactory<Program> _factory = null!;

    public Task InitializeAsync()
    {
        _inventoryService = WireMockServer.Start();
        _paymentService = WireMockServer.Start();
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
                builder.ConfigureServices(services =>
                    services.Configure<ServiceUrls>(opts => {
                        opts.InventoryUrl = _inventoryService.Url!;
                        opts.PaymentUrl = _paymentService.Url!;
                    })));
        _client = _factory.CreateClient();
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        _client.Dispose(); _factory.Dispose();
        _inventoryService.Stop(); _paymentService.Stop();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task CreateOrder_WhenStockAvailable_ReturnsConfirmed()
    {
        _inventoryService.Given(Request.Create().WithPath("/inventory/PROD-001").UsingGet())
            .RespondWith(Response.Create().WithStatusCode(200)
                .WithBodyAsJson(new { available = true }));
        _paymentService.Given(Request.Create().WithPath("/payments").UsingPost())
            .RespondWith(Response.Create().WithStatusCode(200)
                .WithBodyAsJson(new { transactionId = "txn-abcdef12" }));

        var response = await _client.PostAsJsonAsync("/orders",
            new CreateOrderRequest("PROD-001", 2, "CUST-001"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        Assert.Equal("confirmed", order!.Status);
    }

    [Fact]
    public async Task CreateOrder_WhenStockInsufficient_Returns409()
    {
        _inventoryService.Given(Request.Create().WithPath("/inventory/*").UsingGet())
            .RespondWith(Response.Create().WithStatusCode(200)
                .WithBodyAsJson(new { available = false }));

        var response = await _client.PostAsJsonAsync("/orders",
            new CreateOrderRequest("PROD-001", 100, "CUST-001"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateOrder_WhenPaymentFails_Returns502()
    {
        _inventoryService.Given(Request.Create().WithPath("/inventory/*").UsingGet())
            .RespondWith(Response.Create().WithStatusCode(200)
                .WithBodyAsJson(new { available = true }));
        _paymentService.Given(Request.Create().WithPath("/payments").UsingPost())
            .RespondWith(Response.Create().WithStatusCode(500));

        var response = await _client.PostAsJsonAsync("/orders",
            new CreateOrderRequest("PROD-001", 1, "CUST-001"));

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }
}
```

## Best Practices

1. **Test at the right level**: Most coverage from service tests, few E2E tests
2. **Mock at boundaries**: Replace HTTP/messaging clients, not internal logic
3. **Use contract tests**: Catch API incompatibilities before deployment
4. **Test failure modes**: Timeouts, 5xx errors, malformed responses
5. **Verify interactions**: Assert that downstream services were called correctly
6. **Keep tests independent**: No shared state between test classes
7. **Use realistic data**: Test with production-like payloads and edge cases
