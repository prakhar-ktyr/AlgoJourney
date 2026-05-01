---
title: REST vs SOAP
---

# REST vs SOAP

Before REST became dominant, **SOAP** (Simple Object Access Protocol) was the standard for web services. Understanding the differences helps you appreciate REST's simplicity and know when SOAP might still be appropriate.

---

## Quick Comparison

| Feature | REST | SOAP |
|---------|------|------|
| **Protocol** | HTTP (any method) | HTTP POST only (or SMTP, TCP) |
| **Data Format** | JSON (or XML, etc.) | XML only |
| **Contract** | Informal (docs/OpenAPI) | Formal (WSDL) |
| **Complexity** | Simple | Complex |
| **Performance** | Fast, lightweight | Slower, verbose |
| **Caching** | Built-in (HTTP caching) | Not supported |
| **Statefulness** | Stateless | Can be stateful |
| **Error Handling** | HTTP status codes | SOAP fault elements |
| **Security** | HTTPS, OAuth, JWT | WS-Security (enterprise) |
| **Best For** | Web/mobile apps, public APIs | Enterprise, banking, legacy |

---

## REST Example

```
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

Response:
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "name": "Alice Johnson",
  "email": "alice@example.com"
}
```

Concise, readable, uses standard HTTP.

---

## SOAP Example

The same operation in SOAP:

```xml
POST /UserService HTTP/1.1
Host: api.example.com
Content-Type: text/xml

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <auth:Token xmlns:auth="http://example.com/auth">
      abc123
    </auth:Token>
  </soap:Header>
  <soap:Body>
    <GetUser xmlns="http://example.com/users">
      <UserId>42</UserId>
    </GetUser>
  </soap:Body>
</soap:Envelope>

Response:
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUserResponse xmlns="http://example.com/users">
      <User>
        <Id>42</Id>
        <Name>Alice Johnson</Name>
        <Email>alice@example.com</Email>
      </User>
    </GetUserResponse>
  </soap:Body>
</soap:Envelope>
```

Much more verbose. Every operation uses POST. Actions are defined in the XML body, not the HTTP method.

---

## When to Use Each

### Use REST When:

- Building **web or mobile** applications
- Creating **public APIs** (developer-friendly)
- You need **caching** and performance
- You want **simplicity** and quick development
- Working with **JSON** data

### Use SOAP When:

- Working with **enterprise systems** (banking, healthcare)
- You need **formal contracts** (WSDL)
- You need **WS-Security** for complex security requirements
- Integrating with **legacy systems** that already use SOAP
- You need **ACID transactions** across services

---

## The Verdict

For **95%+ of modern web APIs**, REST is the right choice. SOAP is still used in enterprise contexts where formal contracts and advanced security are required.

---

## Key Takeaways

- **REST** is simpler, faster, and uses JSON over HTTP
- **SOAP** is more formal, uses XML, and has built-in security standards
- REST dominates modern web development
- SOAP persists in enterprise and legacy systems
- Choose based on your use case, not dogma

---

Next, we'll compare **REST vs GraphQL** — the modern alternative →
