---
title: API Testing with Postman
---

# API Testing with Postman

**Postman** is the most popular tool for testing REST APIs manually. It lets you send requests, inspect responses, and organize tests into collections.

---

## Getting Started

1. Download Postman from [postman.com](https://www.postman.com/)
2. Create a new request
3. Set the method (GET, POST, etc.) and URL
4. Click Send

---

## Sending Requests

### GET Request

```
Method: GET
URL: http://localhost:3000/api/users
```

### POST Request with JSON Body

```
Method: POST
URL: http://localhost:3000/api/users
Headers:
  Content-Type: application/json
Body (raw, JSON):
  {
    "name": "Alice",
    "email": "alice@example.com"
  }
```

### With Authentication

```
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Or use Postman's Authorization tab → Bearer Token.

---

## Collections

Organize requests into collections:

```
My API Collection
├── Auth
│   ├── POST Register
│   ├── POST Login
│   └── POST Refresh Token
├── Users
│   ├── GET List Users
│   ├── GET Get User
│   ├── POST Create User
│   ├── PATCH Update User
│   └── DELETE Delete User
└── Posts
    ├── GET List Posts
    └── POST Create Post
```

---

## Environment Variables

Store reusable values:

```
Variable: baseUrl = http://localhost:3000
Variable: token = eyJhbGci...

Use in requests:
URL: {{baseUrl}}/api/users
Header: Authorization: Bearer {{token}}
```

Switch between environments (development, staging, production).

---

## Automated Tests in Postman

Add test scripts to requests:

```javascript
// Test status code
pm.test("Status is 200", () => {
  pm.response.to.have.status(200);
});

// Test response body
pm.test("Returns an array of users", () => {
  const json = pm.response.json();
  pm.expect(json.data).to.be.an("array");
  pm.expect(json.data.length).to.be.greaterThan(0);
});

// Save token from login response
pm.test("Save token", () => {
  const json = pm.response.json();
  pm.environment.set("token", json.token);
});
```

---

## Alternatives to Postman

| Tool | Type | Best For |
|------|------|----------|
| **Postman** | GUI | Manual testing, collections |
| **curl** | CLI | Quick tests, scripting |
| **HTTPie** | CLI | Human-friendly curl alternative |
| **Insomnia** | GUI | Lightweight Postman alternative |
| **VS Code REST Client** | Editor | Test from within VS Code |

### VS Code REST Client

Create a `.http` file:

```http
### Get all users
GET http://localhost:3000/api/users

### Create user
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}

### Get user with auth
GET http://localhost:3000/api/users/42
Authorization: Bearer {{token}}
```

---

## Key Takeaways

- **Postman** is the standard tool for manual API testing
- Use **collections** to organize and share requests
- Use **environment variables** for reusable values (URLs, tokens)
- Add **test scripts** for automated validation
- Consider **VS Code REST Client** for lightweight in-editor testing

---

Next, we'll learn about **Automated Testing** — testing APIs with code →
