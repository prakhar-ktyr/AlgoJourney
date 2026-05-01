---
title: Cross-Site Request Forgery
---

# Cross-Site Request Forgery (CSRF)

CSRF (also called XSRF or "sea-surf") tricks a user's browser into making unwanted requests to a site where they're already authenticated. The attacker exploits the browser's automatic inclusion of cookies.

---

## How CSRF Works

1. User logs into `bank.com` — browser stores session cookie
2. User visits `evil.com` (attacker-controlled)
3. `evil.com` contains a hidden request to `bank.com/transfer`
4. Browser automatically attaches the `bank.com` cookie
5. `bank.com` processes the request thinking it's legitimate

The attacker never sees the response — they just trigger the action.

---

## CSRF Attack Examples

### Form-Based Attack

Hidden auto-submitting form on attacker's site:

```html
<!-- On evil.com -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById("csrf-form").submit();</script>
```

The victim visits the page and the transfer happens automatically.

### Image Tag Attack (GET requests)

```html
<!-- On evil.com or in a forum post -->
<img src="https://bank.com/transfer?to=attacker&amount=5000" width="0" height="0" />
```

The browser makes a GET request trying to load the "image."

### Link-Based Attack

```html
<a href="https://admin-panel.com/delete-user?id=42">Click for free prize!</a>
```

### Ajax-Based Attack

```html
<script>
  fetch("https://api.example.com/change-email", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "email=attacker@evil.com"
  });
</script>
```

---

## What Makes CSRF Possible

| Condition | Explanation |
|-----------|-------------|
| **Cookie-based auth** | Browser auto-sends cookies with every request |
| **Predictable requests** | Attacker can guess all parameters |
| **No verification** | Server doesn't verify request origin |
| **GET side effects** | State-changing actions via GET requests |

---

## CSRF vs XSS

| Feature | CSRF | XSS |
|---------|------|-----|
| **Exploits** | Browser's trust in the user | User's trust in the website |
| **Requires** | User is authenticated | Vulnerable input/output |
| **Attacker sees response** | No | Yes |
| **Executes code in context** | No | Yes |
| **Scope** | Limited to available actions | Full control of page |

---

## Prevention Techniques

### 1. CSRF Tokens (Synchronizer Token Pattern)

Include a unique, unpredictable token in every form:

```html
<!-- Server generates and embeds token -->
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="a1b2c3d4e5f6" />
  <input name="to" />
  <input name="amount" />
  <button type="submit">Transfer</button>
</form>
```

Server-side validation:
```javascript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

app.get("/form", csrfProtection, (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

app.post("/transfer", csrfProtection, (req, res) => {
  // csurf middleware automatically validates the token
  // Rejects request if token is missing or invalid
  processTransfer(req.body);
});
```

### 2. SameSite Cookies

Tell the browser when to send cookies cross-site:

```javascript
res.cookie("session", token, {
  sameSite: "Strict", // Never sent cross-site
  // sameSite: "Lax",  // Sent on top-level GET navigations only
  // sameSite: "None", // Always sent (requires Secure flag)
  secure: true,
  httpOnly: true
});
```

| Value | Behavior | CSRF Protection |
|-------|----------|-----------------|
| `Strict` | Never sent cross-site | Strong |
| `Lax` | Only on top-level GET navigations | Good (default in modern browsers) |
| `None` | Always sent (must use `Secure`) | None |

### 3. Double-Submit Cookie Pattern

Send the CSRF token both as a cookie AND a request parameter:

```javascript
// Server sets a CSRF cookie
res.cookie("csrf-token", generateToken(), { sameSite: "Strict" });

// Client reads cookie and sends it in a header
fetch("/api/transfer", {
  method: "POST",
  headers: {
    "X-CSRF-Token": getCookie("csrf-token")
  },
  body: JSON.stringify(data)
});
```

The attacker cannot read the cookie value, so they can't include it in the header.

### 4. Check Origin/Referer Headers

Verify the request comes from your own domain:

```javascript
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = ["https://myapp.com"];

  if (req.method !== "GET" && !allowedOrigins.some(o => origin?.startsWith(o))) {
    return res.status(403).json({ error: "Invalid origin" });
  }
  next();
});
```

### 5. Custom Request Headers

APIs can require a custom header that simple forms can't set:

```javascript
// Client
fetch("/api/data", {
  headers: { "X-Requested-With": "XMLHttpRequest" }
});

// Server
app.use((req, res, next) => {
  if (req.method !== "GET" && !req.headers["x-requested-with"]) {
    return res.status(403).json({ error: "Missing custom header" });
  }
  next();
});
```

HTML forms cannot add custom headers — only JavaScript can.

---

## Prevention Summary

| Method | Strength | Complexity |
|--------|----------|------------|
| **CSRF tokens** | Strong | Medium |
| **SameSite cookies** | Strong | Low |
| **Double-submit** | Good | Medium |
| **Origin check** | Good | Low |
| **Custom headers** | Good (APIs) | Low |

---

## Best Practices

- Never use GET requests for state-changing operations
- Always use `SameSite=Lax` or `Strict` for session cookies
- Implement CSRF tokens for all forms
- Combine multiple defenses (defense in depth)
- Re-authenticate for sensitive actions (e.g., password change)
- Log and monitor for CSRF attempts

---

## Key Takeaways

- CSRF exploits the browser's automatic cookie inclusion
- Attackers trick users into making requests they didn't intend
- **CSRF tokens** are the most reliable defense
- **SameSite cookies** provide strong built-in protection
- Never perform state changes with GET requests
- Combine multiple defenses for robust protection
- CSRF is different from XSS — CSRF can't read responses

---

Next, we'll learn about **Broken Authentication** →
