---
title: Testing REST APIs
---

## Testing REST APIs

REST APIs form the backbone of modern web services. Thorough testing of every HTTP verb, status code, and edge case ensures your API behaves correctly under all conditions.

### Testing HTTP Verbs

Each HTTP method has specific semantics that must be verified:

- **GET** — Retrieve resources, must be safe and idempotent
- **POST** — Create resources, returns 201 with Location header
- **PUT** — Full replacement of a resource
- **PATCH** — Partial update of specific fields
- **DELETE** — Remove a resource, often returns 204

### Response Validation

Every response must be validated for:

1. **Status codes** — Correct code for the operation
2. **Headers** — Content-Type, Location, Cache-Control
3. **Body schema** — Correct structure, types, and required fields

### Query Parameters and Pagination

APIs must handle pagination correctly:

- Default page size when no params provided
- Custom page/limit parameters
- Out-of-range page numbers
- Total count headers or metadata
- Sorting and filtering combinations

### Error Responses

Test all error scenarios:

- **400** — Malformed request body, invalid field types
- **404** — Resource not found
- **409** — Conflict (duplicate creation)
- **422** — Semantic validation failures

### Content Negotiation

Verify the API responds correctly based on Accept headers and supports multiple content types when applicable.

### Idempotency Testing

PUT and DELETE must be idempotent — calling them multiple times produces the same result. POST is not idempotent by default but can be made so with idempotency keys.

---

## Code Examples

### Python (httpx + pytest)

```python
import httpx
import pytest


BASE_URL = "http://localhost:8000/api"


@pytest.fixture
def client():
    with httpx.Client(base_url=BASE_URL) as client:
        yield client


@pytest.fixture
def created_user(client):
    payload = {"name": "Alice", "email": "alice@example.com"}
    response = client.post("/users", json=payload)
    assert response.status_code == 201
    return response.json()


class TestGetEndpoints:
    def test_get_all_users(self, client):
        response = client.get("/users")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data["users"], list)
        assert "total" in data

    def test_get_user_by_id(self, client, created_user):
        user_id = created_user["id"]
        response = client.get(f"/users/{user_id}")
        assert response.status_code == 200
        body = response.json()
        assert body["id"] == user_id
        assert body["name"] == "Alice"
        assert body["email"] == "alice@example.com"

    def test_get_nonexistent_user(self, client):
        response = client.get("/users/999999")
        assert response.status_code == 404
        assert response.json()["error"] == "User not found"

    def test_pagination_defaults(self, client):
        response = client.get("/users")
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 20

    def test_pagination_custom(self, client):
        response = client.get("/users", params={"page": 2, "limit": 5})
        data = response.json()
        assert data["page"] == 2
        assert data["limit"] == 5

    def test_pagination_out_of_range(self, client):
        response = client.get("/users", params={"page": 9999})
        assert response.status_code == 200
        assert response.json()["users"] == []


class TestPostEndpoints:
    def test_create_user(self, client):
        payload = {"name": "Bob", "email": "bob@example.com"}
        response = client.post("/users", json=payload)
        assert response.status_code == 201
        assert "location" in response.headers
        body = response.json()
        assert body["name"] == "Bob"
        assert "id" in body

    def test_create_user_missing_fields(self, client):
        response = client.post("/users", json={"name": "Bob"})
        assert response.status_code == 400
        assert "email" in response.json()["errors"]

    def test_create_duplicate_user(self, client, created_user):
        payload = {"name": "Alice", "email": "alice@example.com"}
        response = client.post("/users", json=payload)
        assert response.status_code == 409


class TestPutEndpoints:
    def test_full_update_user(self, client, created_user):
        user_id = created_user["id"]
        payload = {"name": "Alice Updated", "email": "alice.new@example.com"}
        response = client.put(f"/users/{user_id}", json=payload)
        assert response.status_code == 200
        assert response.json()["name"] == "Alice Updated"

    def test_put_idempotency(self, client, created_user):
        user_id = created_user["id"]
        payload = {"name": "Same", "email": "same@example.com"}
        r1 = client.put(f"/users/{user_id}", json=payload)
        r2 = client.put(f"/users/{user_id}", json=payload)
        assert r1.json() == r2.json()


class TestPatchEndpoints:
    def test_partial_update(self, client, created_user):
        user_id = created_user["id"]
        response = client.patch(f"/users/{user_id}", json={"name": "Patched"})
        assert response.status_code == 200
        assert response.json()["name"] == "Patched"
        assert response.json()["email"] == "alice@example.com"


class TestDeleteEndpoints:
    def test_delete_user(self, client, created_user):
        user_id = created_user["id"]
        response = client.delete(f"/users/{user_id}")
        assert response.status_code == 204

    def test_delete_idempotency(self, client, created_user):
        user_id = created_user["id"]
        client.delete(f"/users/{user_id}")
        response = client.delete(f"/users/{user_id}")
        assert response.status_code in (204, 404)

    def test_get_after_delete(self, client, created_user):
        user_id = created_user["id"]
        client.delete(f"/users/{user_id}")
        response = client.get(f"/users/{user_id}")
        assert response.status_code == 404


class TestContentNegotiation:
    def test_json_response(self, client):
        response = client.get("/users", headers={"Accept": "application/json"})
        assert "application/json" in response.headers["content-type"]

    def test_unsupported_media_type(self, client):
        response = client.post(
            "/users",
            content="<user><name>X</name></user>",
            headers={"Content-Type": "application/xml"},
        )
        assert response.status_code == 415
```

### JavaScript (supertest + Jest)

```javascript
const request = require("supertest");
const app = require("../app");

describe("REST API Tests", () => {
  let createdUserId;

  describe("POST /api/users", () => {
    it("should create a user and return 201", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ name: "Alice", email: "alice@example.com" })
        .expect(201);

      expect(res.headers["location"]).toBeDefined();
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Alice");
      createdUserId = res.body.id;
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ name: "Bob" })
        .expect(400);

      expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });

    it("should return 409 for duplicate email", async () => {
      await request(app)
        .post("/api/users")
        .send({ name: "Alice", email: "alice@example.com" })
        .expect(409);
    });
  });

  describe("GET /api/users", () => {
    it("should return paginated users", async () => {
      const res = await request(app).get("/api/users").expect(200);

      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
    });

    it("should support custom pagination", async () => {
      const res = await request(app)
        .get("/api/users?page=2&limit=5")
        .expect(200);

      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(5);
    });

    it("should return empty array for out-of-range page", async () => {
      const res = await request(app)
        .get("/api/users?page=9999")
        .expect(200);

      expect(res.body.users).toEqual([]);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a single user", async () => {
      const res = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.name).toBe("Alice");
    });

    it("should return 404 for nonexistent user", async () => {
      await request(app).get("/api/users/999999").expect(404);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should fully replace the user", async () => {
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({ name: "Alice Updated", email: "new@example.com" })
        .expect(200);

      expect(res.body.name).toBe("Alice Updated");
    });

    it("should be idempotent", async () => {
      const payload = { name: "Same", email: "same@example.com" };
      const r1 = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send(payload);
      const r2 = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send(payload);

      expect(r1.body).toEqual(r2.body);
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should partially update the user", async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}`)
        .send({ name: "Patched" })
        .expect(200);

      expect(res.body.name).toBe("Patched");
      expect(res.body.email).toBeDefined();
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete the user", async () => {
      await request(app)
        .delete(`/api/users/${createdUserId}`)
        .expect(204);
    });

    it("should return 404 after deletion", async () => {
      await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(404);
    });
  });

  describe("Content Negotiation", () => {
    it("should return JSON by default", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/);

      expect(res.body).toBeDefined();
    });

    it("should reject unsupported content types", async () => {
      await request(app)
        .post("/api/users")
        .set("Content-Type", "application/xml")
        .send("<user><name>X</name></user>")
        .expect(415);
    });
  });
});
```

### Java (Spring MockMvc + JUnit 5)

```java
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserRestApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String createdUserId;

    @Test
    @Order(1)
    void createUser_returnsCreated() throws Exception {
        String payload = """
            {"name": "Alice", "email": "alice@example.com"}
            """;

        MvcResult result = mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.id").exists())
            .andReturn();

        JsonNode body = objectMapper.readTree(
            result.getResponse().getContentAsString());
        createdUserId = body.get("id").asText();
    }

    @Test
    @Order(2)
    void createUser_missingFields_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Bob\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors").isArray())
            .andExpect(jsonPath("$.errors[*].field", hasItem("email")));
    }

    @Test
    @Order(3)
    void createDuplicateUser_returnsConflict() throws Exception {
        String payload = """
            {"name": "Alice", "email": "alice@example.com"}
            """;

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isConflict());
    }

    @Test
    @Order(4)
    void getAllUsers_returnsPaginatedList() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.users").isArray())
            .andExpect(jsonPath("$.total").isNumber())
            .andExpect(jsonPath("$.page").value(1));
    }

    @Test
    @Order(5)
    void getAllUsers_customPagination() throws Exception {
        mockMvc.perform(get("/api/users")
                .param("page", "2")
                .param("limit", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.page").value(2))
            .andExpect(jsonPath("$.limit").value(5));
    }

    @Test
    @Order(6)
    void getUserById_returnsUser() throws Exception {
        mockMvc.perform(get("/api/users/{id}", createdUserId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdUserId))
            .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    @Order(7)
    void getUserById_notFound() throws Exception {
        mockMvc.perform(get("/api/users/999999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    @Order(8)
    void putUser_fullReplacement() throws Exception {
        String payload = """
            {"name": "Alice Updated", "email": "new@example.com"}
            """;

        mockMvc.perform(put("/api/users/{id}", createdUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice Updated"));
    }

    @Test
    @Order(9)
    void patchUser_partialUpdate() throws Exception {
        mockMvc.perform(patch("/api/users/{id}", createdUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Patched\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Patched"))
            .andExpect(jsonPath("$.email").exists());
    }

    @Test
    @Order(10)
    void deleteUser_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", createdUserId))
            .andExpect(status().isNoContent());
    }

    @Test
    @Order(11)
    void getDeletedUser_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/users/{id}", createdUserId))
            .andExpect(status().isNotFound());
    }

    @Test
    @Order(12)
    void unsupportedMediaType_returns415() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_XML)
                .content("<user><name>X</name></user>"))
            .andExpect(status().isUnsupportedMediaType());
    }
}
```

### C# (xUnit + HttpClient + WebApplicationFactory)

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class UserRestApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static string? _createdUserId;

    public UserRestApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact, TestPriority(1)]
    public async Task CreateUser_Returns201WithLocation()
    {
        var payload = new { name = "Alice", email = "alice@example.com" };

        var response = await _client.PostAsJsonAsync("/api/users", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Alice", body.GetProperty("name").GetString());
        _createdUserId = body.GetProperty("id").GetString();
    }

    [Fact, TestPriority(2)]
    public async Task CreateUser_MissingFields_Returns400()
    {
        var payload = new { name = "Bob" };

        var response = await _client.PostAsJsonAsync("/api/users", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("errors").GetArrayLength() > 0);
    }

    [Fact, TestPriority(3)]
    public async Task CreateDuplicateUser_Returns409()
    {
        var payload = new { name = "Alice", email = "alice@example.com" };

        var response = await _client.PostAsJsonAsync("/api/users", payload);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact, TestPriority(4)]
    public async Task GetAllUsers_ReturnsPaginatedList()
    {
        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("application/json",
            response.Content.Headers.ContentType?.ToString());

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("users").GetArrayLength() >= 0);
        Assert.True(body.GetProperty("total").GetInt32() >= 0);
    }

    [Fact, TestPriority(5)]
    public async Task GetAllUsers_CustomPagination()
    {
        var response = await _client.GetAsync("/api/users?page=2&limit=5");
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(2, body.GetProperty("page").GetInt32());
        Assert.Equal(5, body.GetProperty("limit").GetInt32());
    }

    [Fact, TestPriority(6)]
    public async Task GetUserById_ReturnsUser()
    {
        var response = await _client.GetAsync($"/api/users/{_createdUserId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Alice", body.GetProperty("name").GetString());
    }

    [Fact, TestPriority(7)]
    public async Task GetUserById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/users/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact, TestPriority(8)]
    public async Task PutUser_FullReplacement()
    {
        var payload = new { name = "Alice Updated", email = "new@example.com" };

        var response = await _client.PutAsJsonAsync(
            $"/api/users/{_createdUserId}", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Alice Updated", body.GetProperty("name").GetString());
    }

    [Fact, TestPriority(9)]
    public async Task PutUser_IsIdempotent()
    {
        var payload = new { name = "Same", email = "same@example.com" };

        var r1 = await _client.PutAsJsonAsync(
            $"/api/users/{_createdUserId}", payload);
        var r2 = await _client.PutAsJsonAsync(
            $"/api/users/{_createdUserId}", payload);

        var body1 = await r1.Content.ReadAsStringAsync();
        var body2 = await r2.Content.ReadAsStringAsync();
        Assert.Equal(body1, body2);
    }

    [Fact, TestPriority(10)]
    public async Task DeleteUser_Returns204()
    {
        var response = await _client.DeleteAsync(
            $"/api/users/{_createdUserId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact, TestPriority(11)]
    public async Task GetDeletedUser_Returns404()
    {
        var response = await _client.GetAsync(
            $"/api/users/{_createdUserId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

---

## Key Takeaways

- Test every HTTP verb with both success and failure scenarios
- Validate status codes, headers, and response body structure
- Verify idempotency for PUT and DELETE operations
- Test pagination edge cases including empty results
- Always test content negotiation and unsupported media types
- Error responses should have consistent, predictable structure
