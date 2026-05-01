---
title: What Are APIs?
---

# What Are APIs?

An **API** (Application Programming Interface) is a set of rules that allows one piece of software to talk to another. Think of it as a waiter in a restaurant — you (the client) tell the waiter (the API) what you want, and the waiter brings it from the kitchen (the server).

---

## APIs in Everyday Life

You use APIs every day, even if you don't realize it:

| Action | API Behind the Scenes |
|--------|----------------------|
| Checking the weather on your phone | Weather API sends forecast data |
| Logging in with Google | Google OAuth API verifies your identity |
| Paying with a credit card online | Stripe/PayPal API processes the payment |
| Viewing a map in an app | Google Maps API renders the map |
| Posting on social media | Twitter/Instagram API creates the post |

---

## How APIs Work

At the most basic level, an API follows a **request-response** pattern:

```
1. Client sends a REQUEST
   "Give me the current weather in London"

2. Server processes the request
   (looks up weather data)

3. Server sends a RESPONSE
   { "city": "London", "temp": 15, "condition": "Cloudy" }
```

The client doesn't need to know **how** the server gets the data. It only needs to know **what to ask for** and **what format the answer will be in**. This is the power of APIs — they provide **abstraction**.

---

## Types of APIs

### By Access Level

| Type | Description | Example |
|------|-------------|---------|
| **Public (Open) APIs** | Available to anyone | OpenWeatherMap, REST Countries |
| **Private (Internal) APIs** | Used within a company | Internal microservices |
| **Partner APIs** | Shared with specific partners | Payment gateways for merchants |

### By Protocol/Style

| Type | Description |
|------|-------------|
| **REST** | Uses HTTP methods, most popular for web APIs |
| **GraphQL** | Query language, client specifies exact data needed |
| **SOAP** | XML-based, strict standards, used in enterprises |
| **gRPC** | Binary protocol, high performance, used in microservices |
| **WebSocket** | Real-time, bidirectional communication |

In this course, we focus on **REST APIs** — the most widely used style for web development.

---

## A Real API Example

Let's try a real public API right now. Open your browser and visit:

```
https://jsonplaceholder.typicode.com/users/1
```

You'll see something like:

```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  "address": {
    "street": "Kulas Light",
    "suite": "Apt. 556",
    "city": "Gwenborough"
  },
  "phone": "1-770-736-8031 x56442",
  "website": "hildegard.org"
}
```

Congratulations — you just made your first API call! Your browser sent an HTTP request, and the server responded with JSON data.

---

## API vs. Web Page

When you visit a website, the server returns **HTML** (a web page). When you call an API, the server returns **data** (usually JSON).

```
Browser Request → Web Server → HTML page (for humans)
API Request    → API Server → JSON data (for programs)
```

```javascript
// A web page response (HTML)
"<html><body><h1>Welcome</h1></body></html>"

// An API response (JSON)
{ "message": "Welcome" }
```

APIs return **structured data** that programs can easily read and use. This is why mobile apps, single-page applications, and IoT devices all communicate through APIs.

---

## Why APIs Matter

1. **Separation of Concerns**: Frontend and backend can be developed independently
2. **Reusability**: One API serves web apps, mobile apps, and third-party integrations
3. **Scalability**: Backend services can scale independently
4. **Integration**: Connect different systems (payment, email, maps, AI)
5. **Ecosystem**: Build platforms that others can extend (like the App Store)

```
                    ┌─── Web App
                    │
  ┌──────────┐     ├─── Mobile App
  │  REST API │ ◀──┤
  └──────────┘     ├─── IoT Device
                    │
                    └─── Third-party Service
```

---

## Try It Yourself

1. Open your browser's developer tools (F12 or Cmd+Option+I)
2. Go to the **Network** tab
3. Visit any website
4. Look at the requests — many of them are API calls!

You'll see requests to URLs like `/api/user`, `/api/feed`, or `/graphql`. These are APIs powering the website.

---

## Key Takeaways

- An **API** is a set of rules for software-to-software communication
- APIs follow a **request-response** pattern
- **REST** is the most popular style for web APIs
- APIs return **structured data** (usually JSON), not web pages
- APIs enable **reusability**, **scalability**, and **integration**

---

Next, we'll learn **How the Web Works** — the foundation for understanding REST APIs →
