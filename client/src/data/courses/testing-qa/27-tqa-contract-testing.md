---
title: Contract Testing
---

## Contract Testing

Contract testing verifies that two services (a consumer and a provider) can communicate correctly by testing against a shared contract — without requiring both services to run simultaneously.

### What is Contract Testing?

A contract is an agreement between a consumer (client) and a provider (server) about the structure of their interactions:

- What requests the consumer will make
- What responses the provider must return
- The shape of request/response bodies

### Why Contract Testing?

In microservice architectures:

- Services are deployed independently
- Integration tests are slow and flaky
- A provider change might break unknown consumers
- You need fast feedback on compatibility

Contract testing gives you confidence that services remain compatible without end-to-end tests.

### Consumer-Driven Contracts

The consumer defines the contract based on what it actually needs:

1. Consumer writes tests describing expected interactions
2. Tests generate a contract file (pact)
3. Provider verifies it can fulfill the contract
4. Both sides get fast, independent CI feedback

### Provider vs Consumer Side

| Aspect | Consumer Side | Provider Side |
|--------|--------------|---------------|
| Who writes | Consumer team | Provider team |
| What it tests | "I expect this response" | "I can fulfill this contract" |
| When it runs | Consumer CI | Provider CI |
| Output | Contract file (pact) | Verification result |

### Contract Testing vs Integration Testing

| | Contract Testing | Integration Testing |
|---|---|---|
| Speed | Fast (no network) | Slow (real services) |
| Reliability | Deterministic | Flaky (timeouts, state) |
| Scope | One interaction at a time | Full workflow |
| Feedback | Immediate | Late (after deploy) |
| Maintenance | Low | High |

### Schema Evolution and Breaking Changes

A breaking change violates an existing contract:

- Removing a required field from a response
- Changing a field's type
- Renaming an endpoint
- Adding a required field to a request

Non-breaking changes:

- Adding optional fields to responses
- Adding new endpoints
- Adding optional request parameters

### Pact Framework Overview

Pact is the most popular contract testing framework. It supports:

- HTTP interactions (request/response)
- Message-based interactions (async)
- Multiple languages (JS, Java, Python, C#, Go, Ruby)
- A Pact Broker for sharing contracts

The workflow:

1. Consumer test creates a mock provider
2. Test makes requests and asserts responses
3. Pact file is generated (JSON contract)
4. Provider test replays the pact against real implementation
5. Results are published to Pact Broker

---

## Code Examples

### Python (pact-python — Consumer Side)

```python
import pytest
import requests
from pact import Consumer, Provider


PACT_DIR = "./pacts"


@pytest.fixture(scope="session")
def pact():
    consumer = Consumer("UserService")
    provider = Provider("UserAPI")
    pact = consumer.has_pact_with(
        provider,
        pact_dir=PACT_DIR,
        log_dir="./logs",
    )
    pact.start_service()
    yield pact
    pact.stop_service()


@pytest.fixture
def base_url(pact):
    return f"http://localhost:{pact.port}"


class TestGetUser:
    def test_get_existing_user(self, pact, base_url):
        expected_body = {
            "id": "user-123",
            "name": "Alice",
            "email": "alice@example.com",
            "role": "user",
        }

        (
            pact.given("a user with ID user-123 exists")
            .upon_receiving("a request for user user-123")
            .with_request("GET", "/api/users/user-123")
            .will_respond_with(
                200,
                headers={"Content-Type": "application/json"},
                body=expected_body,
            )
        )

        with pact:
            response = requests.get(f"{base_url}/api/users/user-123")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "user-123"
        assert data["name"] == "Alice"
        assert data["email"] == "alice@example.com"

    def test_get_nonexistent_user(self, pact, base_url):
        (
            pact.given("no user with ID user-999 exists")
            .upon_receiving("a request for nonexistent user")
            .with_request("GET", "/api/users/user-999")
            .will_respond_with(
                404,
                headers={"Content-Type": "application/json"},
                body={"error": "User not found"},
            )
        )

        with pact:
            response = requests.get(f"{base_url}/api/users/user-999")

        assert response.status_code == 404
        assert response.json()["error"] == "User not found"


class TestCreateUser:
    def test_create_user_success(self, pact, base_url):
        request_body = {
            "name": "Bob",
            "email": "bob@example.com",
            "role": "user",
        }
        expected_response = {
            "id": "user-456",
            "name": "Bob",
            "email": "bob@example.com",
            "role": "user",
        }

        (
            pact.given("the email bob@example.com is not taken")
            .upon_receiving("a request to create a new user")
            .with_request(
                "POST",
                "/api/users",
                headers={"Content-Type": "application/json"},
                body=request_body,
            )
            .will_respond_with(
                201,
                headers={
                    "Content-Type": "application/json",
                    "Location": "/api/users/user-456",
                },
                body=expected_response,
            )
        )

        with pact:
            response = requests.post(
                f"{base_url}/api/users",
                json=request_body,
                headers={"Content-Type": "application/json"},
            )

        assert response.status_code == 201
        assert response.json()["id"] == "user-456"
        assert response.headers["Location"] == "/api/users/user-456"

    def test_create_user_duplicate_email(self, pact, base_url):
        request_body = {
            "name": "Alice",
            "email": "alice@example.com",
            "role": "user",
        }

        (
            pact.given("a user with email alice@example.com already exists")
            .upon_receiving("a request to create user with duplicate email")
            .with_request(
                "POST",
                "/api/users",
                headers={"Content-Type": "application/json"},
                body=request_body,
            )
            .will_respond_with(
                409,
                headers={"Content-Type": "application/json"},
                body={"error": "Email already exists"},
            )
        )

        with pact:
            response = requests.post(
                f"{base_url}/api/users",
                json=request_body,
                headers={"Content-Type": "application/json"},
            )

        assert response.status_code == 409


class TestListUsers:
    def test_list_users_with_pagination(self, pact, base_url):
        expected_body = {
            "users": [
                {"id": "user-123", "name": "Alice",
                 "email": "alice@example.com", "role": "user"},
            ],
            "total": 1,
            "page": 1,
            "limit": 20,
        }

        (
            pact.given("users exist in the system")
            .upon_receiving("a request to list users")
            .with_request("GET", "/api/users", query={"page": "1", "limit": "20"})
            .will_respond_with(
                200,
                headers={"Content-Type": "application/json"},
                body=expected_body,
            )
        )

        with pact:
            response = requests.get(
                f"{base_url}/api/users",
                params={"page": 1, "limit": 20},
            )

        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) == 1
        assert data["total"] == 1
```

### JavaScript (Pact JS — Consumer Side)

```javascript
const { PactV3, MatchersV3 } = require("@pact-foundation/pact");
const { like, eachLike, string, integer } = MatchersV3;
const axios = require("axios");
const path = require("path");

const provider = new PactV3({
  consumer: "UserService",
  provider: "UserAPI",
  dir: path.resolve(process.cwd(), "pacts"),
});

describe("User API Contract Tests", () => {
  describe("GET /api/users/:id", () => {
    it("returns an existing user", async () => {
      provider
        .given("a user with ID user-123 exists")
        .uponReceiving("a request for user user-123")
        .withRequest({
          method: "GET",
          path: "/api/users/user-123",
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            id: string("user-123"),
            name: string("Alice"),
            email: string("alice@example.com"),
            role: string("user"),
          },
        });

      await provider.executeTest(async (mockserver) => {
        const response = await axios.get(
          `${mockserver.url}/api/users/user-123`
        );

        expect(response.status).toBe(200);
        expect(response.data.id).toBe("user-123");
        expect(response.data.name).toBe("Alice");
        expect(response.data.email).toBe("alice@example.com");
      });
    });

    it("returns 404 for nonexistent user", async () => {
      provider
        .given("no user with ID user-999 exists")
        .uponReceiving("a request for nonexistent user")
        .withRequest({
          method: "GET",
          path: "/api/users/user-999",
        })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: { error: string("User not found") },
        });

      await provider.executeTest(async (mockserver) => {
        try {
          await axios.get(`${mockserver.url}/api/users/user-999`);
        } catch (error) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error).toBe("User not found");
        }
      });
    });
  });

  describe("POST /api/users", () => {
    it("creates a new user", async () => {
      const requestBody = {
        name: "Bob",
        email: "bob@example.com",
        role: "user",
      };

      provider
        .given("the email bob@example.com is not taken")
        .uponReceiving("a request to create a new user")
        .withRequest({
          method: "POST",
          path: "/api/users",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        })
        .willRespondWith({
          status: 201,
          headers: {
            "Content-Type": "application/json",
            Location: string("/api/users/user-456"),
          },
          body: {
            id: string("user-456"),
            name: string("Bob"),
            email: string("bob@example.com"),
            role: string("user"),
          },
        });

      await provider.executeTest(async (mockserver) => {
        const response = await axios.post(
          `${mockserver.url}/api/users`,
          requestBody,
          { headers: { "Content-Type": "application/json" } }
        );

        expect(response.status).toBe(201);
        expect(response.data.id).toBeDefined();
        expect(response.data.name).toBe("Bob");
        expect(response.headers.location).toBe("/api/users/user-456");
      });
    });

    it("returns 409 for duplicate email", async () => {
      provider
        .given("a user with email alice@example.com already exists")
        .uponReceiving("a create request with duplicate email")
        .withRequest({
          method: "POST",
          path: "/api/users",
          headers: { "Content-Type": "application/json" },
          body: { name: "Alice", email: "alice@example.com", role: "user" },
        })
        .willRespondWith({
          status: 409,
          headers: { "Content-Type": "application/json" },
          body: { error: string("Email already exists") },
        });

      await provider.executeTest(async (mockserver) => {
        try {
          await axios.post(
            `${mockserver.url}/api/users`,
            { name: "Alice", email: "alice@example.com", role: "user" },
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          expect(error.response.status).toBe(409);
        }
      });
    });
  });

  describe("GET /api/users (list)", () => {
    it("returns paginated user list", async () => {
      provider
        .given("users exist in the system")
        .uponReceiving("a request to list users")
        .withRequest({
          method: "GET",
          path: "/api/users",
          query: { page: "1", limit: "20" },
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            users: eachLike({
              id: string("user-123"),
              name: string("Alice"),
              email: string("alice@example.com"),
              role: string("user"),
            }),
            total: integer(1),
            page: integer(1),
            limit: integer(20),
          },
        });

      await provider.executeTest(async (mockserver) => {
        const response = await axios.get(`${mockserver.url}/api/users`, {
          params: { page: 1, limit: 20 },
        });

        expect(response.status).toBe(200);
        expect(response.data.users).toBeInstanceOf(Array);
        expect(response.data.total).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
```

### Java (Pact JVM — Consumer Side)

```java
import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslJsonBody;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "UserAPI")
class UserApiContractTest {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Pact(consumer = "UserService")
    V4Pact getUserPact(PactDslWithProvider builder) {
        return builder
            .given("a user with ID user-123 exists")
            .uponReceiving("a request for user user-123")
            .path("/api/users/user-123")
            .method("GET")
            .willRespondWith()
            .status(200)
            .headers(java.util.Map.of("Content-Type", "application/json"))
            .body(new PactDslJsonBody()
                .stringType("id", "user-123")
                .stringType("name", "Alice")
                .stringType("email", "alice@example.com")
                .stringType("role", "user"))
            .toPact(V4Pact.class);
    }

    @Pact(consumer = "UserService")
    V4Pact getUserNotFoundPact(PactDslWithProvider builder) {
        return builder
            .given("no user with ID user-999 exists")
            .uponReceiving("a request for nonexistent user")
            .path("/api/users/user-999")
            .method("GET")
            .willRespondWith()
            .status(404)
            .headers(java.util.Map.of("Content-Type", "application/json"))
            .body(new PactDslJsonBody()
                .stringType("error", "User not found"))
            .toPact(V4Pact.class);
    }

    @Pact(consumer = "UserService")
    V4Pact createUserPact(PactDslWithProvider builder) {
        return builder
            .given("the email bob@example.com is not taken")
            .uponReceiving("a request to create a new user")
            .path("/api/users")
            .method("POST")
            .headers("Content-Type", "application/json")
            .body(new PactDslJsonBody()
                .stringType("name", "Bob")
                .stringType("email", "bob@example.com")
                .stringType("role", "user"))
            .willRespondWith()
            .status(201)
            .headers(java.util.Map.of(
                "Content-Type", "application/json",
                "Location", "/api/users/user-456"))
            .body(new PactDslJsonBody()
                .stringType("id", "user-456")
                .stringType("name", "Bob")
                .stringType("email", "bob@example.com")
                .stringType("role", "user"))
            .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "getUserPact")
    void testGetExistingUser(MockServer mockServer) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(mockServer.getUrl() + "/api/users/user-123"))
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"id\":\"user-123\""));
        assertTrue(response.body().contains("\"name\":\"Alice\""));
    }

    @Test
    @PactTestFor(pactMethod = "getUserNotFoundPact")
    void testGetNonexistentUser(MockServer mockServer) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(mockServer.getUrl() + "/api/users/user-999"))
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofString());

        assertEquals(404, response.statusCode());
        assertTrue(response.body().contains("User not found"));
    }

    @Test
    @PactTestFor(pactMethod = "createUserPact")
    void testCreateUser(MockServer mockServer) throws Exception {
        String body = """
            {"name":"Bob","email":"bob@example.com","role":"user"}
            """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(mockServer.getUrl() + "/api/users"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = httpClient.send(
            request, HttpResponse.BodyHandlers.ofString());

        assertEquals(201, response.statusCode());
        assertTrue(response.body().contains("\"id\":\"user-456\""));
        assertEquals("/api/users/user-456",
            response.headers().firstValue("Location").orElse(""));
    }
}
```

### C# (PactNet — Consumer Side)

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using PactNet;
using PactNet.Matchers;
using Xunit;
using Xunit.Abstractions;

public class UserApiContractTests
{
    private readonly IPactBuilderV4 _pactBuilder;

    public UserApiContractTests(ITestOutputHelper output)
    {
        var pact = Pact.V4("UserService", "UserAPI", new PactConfig
        {
            PactDir = "../../../pacts",
            DefaultJsonSettings = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }
        });
        _pactBuilder = pact.WithHttpInteractions();
    }

    [Fact]
    public async Task GetUser_WhenUserExists_ReturnsUser()
    {
        _pactBuilder
            .Given("a user with ID user-123 exists")
            .UponReceiving("a request for user user-123")
            .WithRequest(HttpMethod.Get, "/api/users/user-123")
            .WillRespond()
            .WithStatus(HttpStatusCode.OK)
            .WithHeader("Content-Type", "application/json")
            .WithJsonBody(new
            {
                id = Match.Type("user-123"),
                name = Match.Type("Alice"),
                email = Match.Type("alice@example.com"),
                role = Match.Type("user")
            });

        await _pactBuilder.VerifyAsync(async ctx =>
        {
            var client = new HttpClient
            {
                BaseAddress = ctx.MockServerUri
            };

            var response = await client.GetAsync("/api/users/user-123");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var body = await response.Content
                .ReadFromJsonAsync<JsonElement>();
            Assert.Equal("user-123", body.GetProperty("id").GetString());
            Assert.Equal("Alice", body.GetProperty("name").GetString());
        });
    }

    [Fact]
    public async Task GetUser_WhenNotExists_Returns404()
    {
        _pactBuilder
            .Given("no user with ID user-999 exists")
            .UponReceiving("a request for nonexistent user")
            .WithRequest(HttpMethod.Get, "/api/users/user-999")
            .WillRespond()
            .WithStatus(HttpStatusCode.NotFound)
            .WithHeader("Content-Type", "application/json")
            .WithJsonBody(new
            {
                error = Match.Type("User not found")
            });

        await _pactBuilder.VerifyAsync(async ctx =>
        {
            var client = new HttpClient
            {
                BaseAddress = ctx.MockServerUri
            };

            var response = await client.GetAsync("/api/users/user-999");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            var body = await response.Content
                .ReadFromJsonAsync<JsonElement>();
            Assert.Equal("User not found",
                body.GetProperty("error").GetString());
        });
    }

    [Fact]
    public async Task CreateUser_WhenEmailAvailable_Returns201()
    {
        var requestBody = new
        {
            name = "Bob",
            email = "bob@example.com",
            role = "user"
        };

        _pactBuilder
            .Given("the email bob@example.com is not taken")
            .UponReceiving("a request to create a new user")
            .WithRequest(HttpMethod.Post, "/api/users")
            .WithHeader("Content-Type", "application/json")
            .WithJsonBody(requestBody)
            .WillRespond()
            .WithStatus(HttpStatusCode.Created)
            .WithHeader("Content-Type", "application/json")
            .WithHeader("Location", "/api/users/user-456")
            .WithJsonBody(new
            {
                id = Match.Type("user-456"),
                name = Match.Type("Bob"),
                email = Match.Type("bob@example.com"),
                role = Match.Type("user")
            });

        await _pactBuilder.VerifyAsync(async ctx =>
        {
            var client = new HttpClient
            {
                BaseAddress = ctx.MockServerUri
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("/api/users", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.Equal("/api/users/user-456",
                response.Headers.Location?.ToString());

            var body = await response.Content
                .ReadFromJsonAsync<JsonElement>();
            Assert.Equal("user-456", body.GetProperty("id").GetString());
            Assert.Equal("Bob", body.GetProperty("name").GetString());
        });
    }

    [Fact]
    public async Task CreateUser_DuplicateEmail_Returns409()
    {
        var requestBody = new
        {
            name = "Alice",
            email = "alice@example.com",
            role = "user"
        };

        _pactBuilder
            .Given("a user with email alice@example.com already exists")
            .UponReceiving("a create request with duplicate email")
            .WithRequest(HttpMethod.Post, "/api/users")
            .WithHeader("Content-Type", "application/json")
            .WithJsonBody(requestBody)
            .WillRespond()
            .WithStatus(HttpStatusCode.Conflict)
            .WithHeader("Content-Type", "application/json")
            .WithJsonBody(new
            {
                error = Match.Type("Email already exists")
            });

        await _pactBuilder.VerifyAsync(async ctx =>
        {
            var client = new HttpClient
            {
                BaseAddress = ctx.MockServerUri
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("/api/users", content);

            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        });
    }
}
```

---

## Key Takeaways

- Contract testing fills the gap between unit tests and slow integration tests
- Consumer-driven contracts ensure providers don't break their consumers
- Pact is the industry standard — available in all major languages
- Only test the contract shape, not business logic
- Use a Pact Broker to share contracts across teams
- Non-breaking changes (adding optional fields) should never fail a contract
- Contract tests run fast because they use mock servers, not real infrastructure
