---
title: Authentication & Authorization Testing
---

## Authentication & Authorization Testing

Authentication verifies *who* a user is. Authorization determines *what* they can do. Testing both is critical — a single flaw can expose sensitive data or allow privilege escalation.

### Testing Login Flows

Verify the complete authentication lifecycle:

- Valid credentials return a token/session
- Invalid credentials return 401 with a generic message (no info leaks)
- Account lockout after N failed attempts
- Password complexity enforcement
- Multi-factor authentication flows

### JWT Token Testing

JSON Web Tokens require testing several scenarios:

| Scenario | Expected Result |
|----------|----------------|
| Valid token | 200 — Access granted |
| Expired token | 401 — Token expired |
| Tampered payload | 401 — Invalid signature |
| Missing token | 401 — No token provided |
| Wrong algorithm (alg:none) | 401 — Rejected |
| Token from wrong issuer | 401 — Invalid issuer |

### Role-Based Access Control

Test that each role can only access appropriate endpoints:

- **Admin** — Full CRUD on all resources
- **User** — Read all, write own resources only
- **Guest** — Read public resources only

### 401 vs 403

- **401 Unauthorized** — Identity not established (missing/invalid credentials)
- **403 Forbidden** — Identity established but insufficient permissions

### API Key Testing

- Valid key grants access
- Invalid/revoked key returns 401
- Rate limiting per key
- Key rotation doesn't break existing sessions immediately

### CSRF Protection

- Requests without CSRF token are rejected (403)
- Token is bound to the user session
- Cross-origin POST requests are blocked

---

## Code Examples

### Python (pytest + httpx + JWT)

```python
import time
import jwt
import httpx
import pytest


BASE_URL = "http://localhost:8000/api"
SECRET_KEY = "test-secret-key"


def create_token(payload, secret=SECRET_KEY, algorithm="HS256"):
    return jwt.encode(payload, secret, algorithm=algorithm)


def expired_token(user_id="user-1", role="user"):
    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(time.time()) - 3600,
        "iat": int(time.time()) - 7200,
    }
    return create_token(payload)


def valid_token(user_id="user-1", role="user"):
    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    return create_token(payload)


def admin_token():
    return valid_token(user_id="admin-1", role="admin")


@pytest.fixture
def client():
    with httpx.Client(base_url=BASE_URL) as c:
        yield c


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


class TestLoginFlow:
    def test_login_success(self, client):
        response = client.post("/auth/login", json={
            "email": "alice@example.com",
            "password": "SecurePass123!",
        })
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "Bearer"

    def test_login_invalid_credentials(self, client):
        response = client.post("/auth/login", json={
            "email": "alice@example.com",
            "password": "WrongPassword",
        })
        assert response.status_code == 401
        assert response.json()["error"] == "Invalid credentials"
        assert "password" not in response.json().get("details", "")

    def test_login_nonexistent_user(self, client):
        response = client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "SomePass123!",
        })
        assert response.status_code == 401
        assert response.json()["error"] == "Invalid credentials"

    def test_login_missing_fields(self, client):
        response = client.post("/auth/login", json={"email": "a@b.com"})
        assert response.status_code == 400

    def test_account_lockout_after_failures(self, client):
        for _ in range(5):
            client.post("/auth/login", json={
                "email": "alice@example.com",
                "password": "Wrong",
            })
        response = client.post("/auth/login", json={
            "email": "alice@example.com",
            "password": "SecurePass123!",
        })
        assert response.status_code == 429


class TestJWTValidation:
    def test_valid_token_grants_access(self, client):
        token = valid_token()
        response = client.get("/users/me", headers=auth_header(token))
        assert response.status_code == 200

    def test_expired_token_rejected(self, client):
        token = expired_token()
        response = client.get("/users/me", headers=auth_header(token))
        assert response.status_code == 401
        assert "expired" in response.json()["error"].lower()

    def test_tampered_token_rejected(self, client):
        token = valid_token()
        tampered = token[:-5] + "XXXXX"
        response = client.get("/users/me", headers=auth_header(tampered))
        assert response.status_code == 401

    def test_missing_token_rejected(self, client):
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_wrong_secret_rejected(self, client):
        token = create_token(
            {"sub": "user-1", "role": "user",
             "exp": int(time.time()) + 3600},
            secret="wrong-secret",
        )
        response = client.get("/users/me", headers=auth_header(token))
        assert response.status_code == 401

    def test_none_algorithm_rejected(self, client):
        token = jwt.encode(
            {"sub": "user-1", "role": "admin",
             "exp": int(time.time()) + 3600},
            key="",
            algorithm="none",
        )
        response = client.get("/admin/users", headers=auth_header(token))
        assert response.status_code == 401


class TestRoleBasedAccess:
    def test_admin_can_access_admin_endpoint(self, client):
        token = admin_token()
        response = client.get("/admin/users", headers=auth_header(token))
        assert response.status_code == 200

    def test_user_cannot_access_admin_endpoint(self, client):
        token = valid_token(role="user")
        response = client.get("/admin/users", headers=auth_header(token))
        assert response.status_code == 403

    def test_user_can_access_own_profile(self, client):
        token = valid_token(user_id="user-1")
        response = client.get("/users/user-1", headers=auth_header(token))
        assert response.status_code == 200

    def test_user_cannot_modify_other_profile(self, client):
        token = valid_token(user_id="user-1")
        response = client.put(
            "/users/user-2",
            json={"name": "Hacked"},
            headers=auth_header(token),
        )
        assert response.status_code == 403

    def test_admin_can_modify_any_profile(self, client):
        token = admin_token()
        response = client.put(
            "/users/user-2",
            json={"name": "Admin Edit"},
            headers=auth_header(token),
        )
        assert response.status_code == 200


class TestAPIKeyAuth:
    def test_valid_api_key(self, client):
        response = client.get(
            "/data/export",
            headers={"X-API-Key": "valid-key-123"},
        )
        assert response.status_code == 200

    def test_invalid_api_key(self, client):
        response = client.get(
            "/data/export",
            headers={"X-API-Key": "invalid-key"},
        )
        assert response.status_code == 401

    def test_missing_api_key(self, client):
        response = client.get("/data/export")
        assert response.status_code == 401
```

### JavaScript (Jest + supertest + jsonwebtoken)

```javascript
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

const SECRET = "test-secret-key";

function createToken(payload, secret = SECRET) {
  return jwt.sign(payload, secret, { algorithm: "HS256" });
}

function validToken(userId = "user-1", role = "user") {
  return createToken({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
}

function expiredToken(userId = "user-1", role = "user") {
  return createToken({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) - 3600,
  });
}

function adminToken() {
  return validToken("admin-1", "admin");
}

describe("Authentication Tests", () => {
  describe("Login Flow", () => {
    it("returns token on valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "SecurePass123!" })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.token_type).toBe("Bearer");
    });

    it("returns 401 on invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "Wrong" })
        .expect(401);

      expect(res.body.error).toBe("Invalid credentials");
      expect(res.body.details).toBeUndefined();
    });

    it("returns same error for nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "no@example.com", password: "Any" })
        .expect(401);

      expect(res.body.error).toBe("Invalid credentials");
    });

    it("returns 400 for missing fields", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "a@b.com" })
        .expect(400);
    });
  });

  describe("JWT Validation", () => {
    it("grants access with valid token", async () => {
      await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${validToken()}`)
        .expect(200);
    });

    it("rejects expired token", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${expiredToken()}`)
        .expect(401);

      expect(res.body.error.toLowerCase()).toContain("expired");
    });

    it("rejects tampered token", async () => {
      const token = validToken();
      const tampered = token.slice(0, -5) + "XXXXX";
      await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${tampered}`)
        .expect(401);
    });

    it("rejects missing token", async () => {
      await request(app).get("/api/users/me").expect(401);
    });

    it("rejects token with wrong secret", async () => {
      const token = createToken(
        { sub: "user-1", role: "user", exp: Math.floor(Date.now() / 1000) + 3600 },
        "wrong-secret"
      );
      await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);
    });
  });

  describe("Role-Based Access", () => {
    it("admin can access admin endpoints", async () => {
      await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken()}`)
        .expect(200);
    });

    it("regular user gets 403 on admin endpoints", async () => {
      await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${validToken()}`)
        .expect(403);
    });

    it("user can access own profile", async () => {
      await request(app)
        .get("/api/users/user-1")
        .set("Authorization", `Bearer ${validToken("user-1")}`)
        .expect(200);
    });

    it("user cannot modify other profiles", async () => {
      await request(app)
        .put("/api/users/user-2")
        .set("Authorization", `Bearer ${validToken("user-1")}`)
        .send({ name: "Hacked" })
        .expect(403);
    });
  });
});
```

### Java (Spring Security + JUnit 5 + MockMvc)

```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String SECRET = "test-secret-key-that-is-long-enough-for-hs256";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(
        SECRET.getBytes(StandardCharsets.UTF_8));

    private String createToken(String userId, String role, Instant expiry) {
        return Jwts.builder()
            .subject(userId)
            .claim("role", role)
            .issuedAt(Date.from(Instant.now()))
            .expiration(Date.from(expiry))
            .signWith(KEY)
            .compact();
    }

    private String validUserToken() {
        return createToken("user-1", "user",
            Instant.now().plusSeconds(3600));
    }

    private String validAdminToken() {
        return createToken("admin-1", "admin",
            Instant.now().plusSeconds(3600));
    }

    private String expiredToken() {
        return createToken("user-1", "user",
            Instant.now().minusSeconds(3600));
    }

    @Nested
    class LoginTests {

        @Test
        void validCredentials_returnsToken() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"email":"alice@example.com","password":"SecurePass123!"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").exists())
                .andExpect(jsonPath("$.token_type").value("Bearer"));
        }

        @Test
        void invalidCredentials_returns401() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"email":"alice@example.com","password":"Wrong"}
                        """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
        }

        @Test
        void missingFields_returns400() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"a@b.com\"}"))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class JwtValidationTests {

        @Test
        void validToken_grantsAccess() throws Exception {
            mockMvc.perform(get("/api/users/me")
                    .header("Authorization", "Bearer " + validUserToken()))
                .andExpect(status().isOk());
        }

        @Test
        void expiredToken_returns401() throws Exception {
            mockMvc.perform(get("/api/users/me")
                    .header("Authorization", "Bearer " + expiredToken()))
                .andExpect(status().isUnauthorized());
        }

        @Test
        void tamperedToken_returns401() throws Exception {
            String token = validUserToken();
            String tampered = token.substring(0, token.length() - 5) + "XXXXX";
            mockMvc.perform(get("/api/users/me")
                    .header("Authorization", "Bearer " + tampered))
                .andExpect(status().isUnauthorized());
        }

        @Test
        void missingToken_returns401() throws Exception {
            mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        void wrongSecret_returns401() throws Exception {
            SecretKey wrongKey = Keys.hmacShaKeyFor(
                "wrong-secret-key-long-enough-for-hmac"
                    .getBytes(StandardCharsets.UTF_8));
            String token = Jwts.builder()
                .subject("user-1")
                .claim("role", "admin")
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(wrongKey)
                .compact();

            mockMvc.perform(get("/api/users/me")
                    .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    class RoleBasedAccessTests {

        @Test
        void adminCanAccessAdminEndpoint() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                    .header("Authorization", "Bearer " + validAdminToken()))
                .andExpect(status().isOk());
        }

        @Test
        void userCannotAccessAdminEndpoint() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                    .header("Authorization", "Bearer " + validUserToken()))
                .andExpect(status().isForbidden());
        }

        @Test
        void userCanAccessOwnProfile() throws Exception {
            mockMvc.perform(get("/api/users/user-1")
                    .header("Authorization", "Bearer " + validUserToken()))
                .andExpect(status().isOk());
        }

        @Test
        void userCannotModifyOtherProfile() throws Exception {
            mockMvc.perform(put("/api/users/user-2")
                    .header("Authorization", "Bearer " + validUserToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Hacked\"}"))
                .andExpect(status().isForbidden());
        }
    }
}
```

### C# (xUnit + WebApplicationFactory + JWT)

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using Xunit;

public class AuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private const string Secret = "test-secret-key-that-is-long-enough-for-hs256";

    public AuthTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    private string CreateToken(string userId, string role, DateTime expiry)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim("role", role),
        };

        var token = new JwtSecurityToken(
            expires: expiry,
            claims: claims,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string ValidUserToken() =>
        CreateToken("user-1", "user", DateTime.UtcNow.AddHours(1));

    private string ValidAdminToken() =>
        CreateToken("admin-1", "admin", DateTime.UtcNow.AddHours(1));

    private string ExpiredToken() =>
        CreateToken("user-1", "user", DateTime.UtcNow.AddHours(-1));

    private void SetAuth(string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var payload = new { email = "alice@example.com",
                           password = "SecurePass123!" };
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.TryGetProperty("access_token", out _));
    }

    [Fact]
    public async Task Login_InvalidCredentials_Returns401()
    {
        var payload = new { email = "alice@example.com", password = "Wrong" };
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ValidToken_GrantsAccess()
    {
        SetAuth(ValidUserToken());
        var response = await _client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ExpiredToken_Returns401()
    {
        SetAuth(ExpiredToken());
        var response = await _client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TamperedToken_Returns401()
    {
        var token = ValidUserToken();
        var tampered = token[..^5] + "XXXXX";
        SetAuth(tampered);
        var response = await _client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MissingToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;
        var response = await _client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Admin_CanAccessAdminEndpoint()
    {
        SetAuth(ValidAdminToken());
        var response = await _client.GetAsync("/api/admin/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task User_CannotAccessAdminEndpoint()
    {
        SetAuth(ValidUserToken());
        var response = await _client.GetAsync("/api/admin/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task User_CanAccessOwnProfile()
    {
        SetAuth(ValidUserToken());
        var response = await _client.GetAsync("/api/users/user-1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task User_CannotModifyOtherProfile()
    {
        SetAuth(ValidUserToken());
        var response = await _client.PutAsJsonAsync(
            "/api/users/user-2", new { name = "Hacked" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task WrongSecret_Returns401()
    {
        var wrongKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("wrong-secret-key-long-enough!!!!"));
        var credentials = new SigningCredentials(
            wrongKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddHours(1),
            claims: new[] { new Claim("sub", "user-1"),
                            new Claim("role", "admin") },
            signingCredentials: credentials);
        var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);

        SetAuth(tokenStr);
        var response = await _client.GetAsync("/api/admin/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
```

---

## Key Takeaways

- Never leak information in auth error messages (same error for wrong password vs nonexistent user)
- Test token edge cases: expired, tampered, wrong algorithm, wrong issuer
- Verify 401 vs 403 semantics — they mean different things
- Test resource ownership — users must not access other users' data
- Always reject the `alg: none` attack vector
- Account lockout prevents brute-force attacks
