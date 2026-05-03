---
title: API Testing Fundamentals
---

# API Testing Fundamentals

API testing validates your application's HTTP endpoints — ensuring they accept correct requests, return proper responses, handle errors gracefully, and enforce business rules at the boundary between client and server.

## What Is API Testing?

API testing sends HTTP requests to your application's endpoints and verifies the responses. It tests the contract your server exposes to clients without involving a browser or UI.

**Scope:** Request enters the server → passes through middleware, routing, controllers, services, database → response is returned and verified.

## Why Test at the API Layer?

| Reason | Explanation |
|--------|-------------|
| **Contract enforcement** | Ensures clients receive expected response shapes |
| **Faster than E2E** | No browser, no UI rendering |
| **More realistic than unit** | Tests the full server stack |
| **Language-agnostic** | Any client can verify the API |
| **Catches integration bugs** | Middleware, auth, validation, serialization |
| **Documentation** | Tests serve as living API documentation |

## HTTP Methods

### GET
Retrieve a resource or collection. Should be idempotent (safe to call multiple times).

```
GET /api/users       → List all users
GET /api/users/42    → Get user with ID 42
```

### POST
Create a new resource. Request body contains the data.

```
POST /api/users
Body: { "name": "Alice", "email": "alice@example.com" }
```

### PUT
Replace an entire resource. Client sends the complete updated object.

```
PUT /api/users/42
Body: { "name": "Alicia", "email": "alicia@example.com" }
```

### DELETE
Remove a resource.

```
DELETE /api/users/42
```

### PATCH
Partially update a resource. Only modified fields are sent.

```
PATCH /api/users/42
Body: { "name": "Alicia" }
```

## HTTP Status Codes

### 2xx — Success

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE with no response body |

### 4xx — Client Errors

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email taken) |
| 422 | Unprocessable Entity | Validation failure |

### 5xx — Server Errors

| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unhandled exception |
| 502 | Bad Gateway | Upstream service failure |
| 503 | Service Unavailable | Server overloaded or in maintenance |

## Request/Response Structure

### Request Components

```
POST /api/users?role=admin HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

- **Method + URL** — what action and which resource
- **Query parameters** — filtering, pagination, sorting
- **Headers** — content type, auth tokens, custom metadata
- **Body** — JSON payload for POST/PUT/PATCH

### Response Components

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/42

{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

- **Status code** — success or failure category
- **Headers** — content type, pagination info, rate limit
- **Body** — JSON data or error message

## API Testing Tools

| Tool | Type | Best For |
|------|------|----------|
| **Postman** | GUI | Manual exploration, team collaboration |
| **curl** | CLI | Quick ad-hoc requests, scripting |
| **HTTPie** | CLI | Human-friendly curl alternative |
| **supertest** | Library | Node.js automated tests |
| **requests/httpx** | Library | Python automated tests |
| **RestAssured** | Library | Java automated tests |
| **HttpClient** | Library | .NET automated tests |

## Test Structure

Every API test follows the same pattern:

```
1. Arrange — set up test data, configure headers
2. Act    — send HTTP request to endpoint
3. Assert — verify status code, response body, headers
```

**What to verify:**
- Status code matches expected
- Response body contains correct data
- Response body shape matches contract
- Headers are set correctly (Content-Type, Location)
- Error responses have useful messages
- Side effects occurred (record created in DB)

## Code: Testing REST Endpoints

We'll test two endpoints:
- `GET /api/users` — returns list of users
- `POST /api/users` — creates a new user

### Python (pytest + httpx + FastAPI)

```python
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

# In-memory store for testing
users_db: list[dict] = []
next_id = 1


class CreateUserRequest(BaseModel):
    name: str
    email: str


@app.get("/api/users")
async def get_users():
    return users_db


@app.post("/api/users", status_code=201)
async def create_user(request: CreateUserRequest):
    global next_id
    if not request.name or not request.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if not request.email or not request.email.strip():
        raise HTTPException(status_code=400, detail="Email is required")
    for user in users_db:
        if user["email"] == request.email:
            raise HTTPException(status_code=409, detail="Email already exists")
    user = {"id": next_id, "name": request.name, "email": request.email}
    next_id += 1
    users_db.append(user)
    return user


@pytest.fixture(autouse=True)
def reset_db():
    global next_id
    users_db.clear()
    next_id = 1
    yield


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestGetUsers:
    @pytest.mark.anyio
    async def test_returns_empty_list_initially(self, client):
        response = await client.get("/api/users")

        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.anyio
    async def test_returns_all_users(self, client):
        await client.post("/api/users", json={"name": "Alice", "email": "alice@example.com"})
        await client.post("/api/users", json={"name": "Bob", "email": "bob@example.com"})

        response = await client.get("/api/users")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Alice"
        assert data[1]["name"] == "Bob"

    @pytest.mark.anyio
    async def test_response_has_correct_content_type(self, client):
        response = await client.get("/api/users")

        assert "application/json" in response.headers["content-type"]


class TestCreateUser:
    @pytest.mark.anyio
    async def test_creates_user_with_valid_data(self, client):
        response = await client.post(
            "/api/users",
            json={"name": "Alice", "email": "alice@example.com"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == "Alice"
        assert data["email"] == "alice@example.com"

    @pytest.mark.anyio
    async def test_persists_user_to_database(self, client):
        await client.post(
            "/api/users",
            json={"name": "Alice", "email": "alice@example.com"},
        )

        response = await client.get("/api/users")
        assert len(response.json()) == 1

    @pytest.mark.anyio
    async def test_returns_400_for_missing_name(self, client):
        response = await client.post(
            "/api/users",
            json={"name": "", "email": "alice@example.com"},
        )

        assert response.status_code == 400

    @pytest.mark.anyio
    async def test_returns_400_for_missing_email(self, client):
        response = await client.post(
            "/api/users",
            json={"name": "Alice", "email": ""},
        )

        assert response.status_code == 400

    @pytest.mark.anyio
    async def test_returns_409_for_duplicate_email(self, client):
        await client.post(
            "/api/users",
            json={"name": "Alice", "email": "alice@example.com"},
        )

        response = await client.post(
            "/api/users",
            json={"name": "Bob", "email": "alice@example.com"},
        )

        assert response.status_code == 409
```

### JavaScript (Jest + supertest + Express)

```javascript
const express = require("express");
const request = require("supertest");

function createApp() {
  const app = express();
  app.use(express.json());

  const users = [];
  let nextId = 1;

  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (users.some((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const user = { id: nextId++, name, email };
    users.push(user);
    res.status(201).json(user);
  });

  return app;
}

describe("GET /api/users", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test("returns empty array initially", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("returns all created users", async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" });
    await request(app)
      .post("/api/users")
      .send({ name: "Bob", email: "bob@example.com" });

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe("Alice");
    expect(response.body[1].name).toBe("Bob");
  });

  test("responds with JSON content type", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("POST /api/users", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test("creates user with valid data", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe("Alice");
    expect(response.body.email).toBe("alice@example.com");
  });

  test("persists user — visible in GET", async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" });

    const response = await request(app).get("/api/users");
    expect(response.body).toHaveLength(1);
  });

  test("returns 400 when name is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "", email: "alice@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test("returns 400 when email is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test("returns 409 for duplicate email", async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" });

    const response = await request(app)
      .post("/api/users")
      .send({ name: "Bob", email: "alice@example.com" });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/already exists/i);
  });
});
```

### Java (JUnit 5 + Spring Boot + MockMvc)

```java
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Nested
    class GetUsersTests {

        @Test
        void returnsEmptyArrayInitially() throws Exception {
            mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void returnsAllUsers() throws Exception {
            userRepository.save(new User("Alice", "alice@example.com"));
            userRepository.save(new User("Bob", "bob@example.com"));

            mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Alice")))
                .andExpect(jsonPath("$[1].name", is("Bob")));
        }

        @Test
        void respondsWithJsonContentType() throws Exception {
            mockMvc.perform(get("/api/users"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }
    }

    @Nested
    class CreateUserTests {

        @Test
        void createsUserWithValidData() throws Exception {
            String json = """
                {"name": "Alice", "email": "alice@example.com"}
                """;

            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name", is("Alice")))
                .andExpect(jsonPath("$.email", is("alice@example.com")));
        }

        @Test
        void persistsUserToDatabase() throws Exception {
            String json = """
                {"name": "Alice", "email": "alice@example.com"}
                """;

            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json));

            mockMvc.perform(get("/api/users"))
                .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void returns400ForMissingName() throws Exception {
            String json = """
                {"name": "", "email": "alice@example.com"}
                """;

            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void returns400ForMissingEmail() throws Exception {
            String json = """
                {"name": "Alice", "email": ""}
                """;

            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void returns409ForDuplicateEmail() throws Exception {
            userRepository.save(new User("Alice", "alice@example.com"));

            String json = """
                {"name": "Bob", "email": "alice@example.com"}
                """;

            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("already exists")));
        }
    }
}
```

### C# (xUnit + WebApplicationFactory)

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;

public record CreateUserRequest(string Name, string Email);
public record UserResponse(int Id, string Name, string Email);

public class UserApiTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private HttpClient _client = null!;

    public UserApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace real DB with in-memory
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid()));
            });
        });
    }

    public Task InitializeAsync()
    {
        _client = _factory.CreateClient();
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        _client.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task GetUsers_ReturnsEmptyArrayInitially()
    {
        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var users = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.Empty(users!);
    }

    [Fact]
    public async Task GetUsers_ReturnsAllCreatedUsers()
    {
        await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Alice", "alice@example.com"));
        await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Bob", "bob@example.com"));

        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var users = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.Equal(2, users!.Count);
        Assert.Equal("Alice", users[0].Name);
        Assert.Equal("Bob", users[1].Name);
    }

    [Fact]
    public async Task GetUsers_RespondsWithJsonContentType()
    {
        var response = await _client.GetAsync("/api/users");

        Assert.Equal("application/json",
            response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task CreateUser_ReturnsCreatedWithValidData()
    {
        var response = await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Alice", "alice@example.com"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.True(user!.Id > 0);
        Assert.Equal("Alice", user.Name);
        Assert.Equal("alice@example.com", user.Email);
    }

    [Fact]
    public async Task CreateUser_PersistsToDatabase()
    {
        await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Alice", "alice@example.com"));

        var response = await _client.GetAsync("/api/users");
        var users = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.Single(users!);
    }

    [Fact]
    public async Task CreateUser_Returns400ForMissingName()
    {
        var response = await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("", "alice@example.com"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_Returns400ForMissingEmail()
    {
        var response = await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Alice", ""));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_Returns409ForDuplicateEmail()
    {
        await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Alice", "alice@example.com"));

        var response = await _client.PostAsJsonAsync("/api/users",
            new CreateUserRequest("Bob", "alice@example.com"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
```

## Summary

API testing is one of the most cost-effective testing strategies. It's faster than E2E testing, more realistic than unit testing, and catches the majority of bugs that affect users.

**Key principles:**
- Always verify both status code AND response body
- Test happy paths, validation errors, and edge cases
- Use the framework's test client (supertest, MockMvc, WebApplicationFactory) for speed
- Keep tests isolated — each test starts with a clean state
- Test the contract, not the implementation

**Next:** We'll explore authentication testing, request validation, and error handling patterns in APIs.
