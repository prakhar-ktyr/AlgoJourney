---
title: OAuth 2.0 & OpenID Connect
---

# OAuth 2.0 & OpenID Connect

**OAuth 2.0** is an authorization framework that lets applications access resources on behalf of a user without knowing their password. **OpenID Connect (OIDC)** adds an identity/authentication layer on top of OAuth 2.0.

---

## Authorization vs Authentication

| Concept | Question Answered | Protocol |
|---------|-------------------|----------|
| **Authentication** | Who are you? | OpenID Connect |
| **Authorization** | What can you access? | OAuth 2.0 |

OAuth 2.0 alone does NOT authenticate users — it only grants access tokens. OIDC adds ID tokens that prove the user's identity.

---

## OAuth 2.0 Roles

| Role | Description | Example |
|------|-------------|---------|
| **Resource Owner** | The user who owns the data | You |
| **Client** | Application requesting access | A third-party app |
| **Authorization Server** | Issues tokens after user consent | Google, Auth0 |
| **Resource Server** | Hosts the protected resources | Google Drive API |

---

## OAuth 2.0 Grant Types

| Grant Type | Use Case | Security Level |
|------------|----------|----------------|
| **Authorization Code** | Server-side web apps | High |
| **Authorization Code + PKCE** | SPAs, mobile apps | High |
| **Client Credentials** | Machine-to-machine | High (no user) |
| **Device Code** | Smart TVs, CLI tools | Medium |
| **Implicit** (deprecated) | Was used for SPAs | Low — do not use |
| **Resource Owner Password** (deprecated) | Legacy apps | Low — do not use |

---

## Authorization Code Flow (with PKCE)

This is the **recommended flow** for all client types (web, mobile, SPA).

```
1. Client generates code_verifier (random) and code_challenge (SHA256 hash)
2. Client redirects user to Authorization Server:
   GET /authorize?response_type=code&client_id=X&redirect_uri=Y
       &scope=openid profile&code_challenge=Z&code_challenge_method=S256

3. User authenticates and consents
4. Auth server redirects back with authorization code:
   GET /callback?code=AUTH_CODE

5. Client exchanges code for tokens (sends code_verifier):
   POST /token
   { grant_type: "authorization_code", code: AUTH_CODE,
     redirect_uri: Y, code_verifier: ORIGINAL_VERIFIER }

6. Auth server returns access_token + id_token + refresh_token
```

### Why PKCE?

PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks. The `code_verifier` proves that the entity exchanging the code is the same one that initiated the flow.

---

## Client Credentials Flow

Used for server-to-server communication with no user involvement.

```bash
# Request token directly
curl -X POST https://auth.example.com/token \
  -d "grant_type=client_credentials" \
  -d "client_id=SERVICE_ID" \
  -d "client_secret=SERVICE_SECRET" \
  -d "scope=api.read"
```

---

## OpenID Connect (OIDC)

OIDC extends OAuth 2.0 with:

| Addition | Purpose |
|----------|---------|
| **ID Token** | JWT proving the user's identity |
| **UserInfo endpoint** | Fetch user profile data |
| **Standard scopes** | `openid`, `profile`, `email` |
| **Discovery** | `.well-known/openid-configuration` endpoint |

### ID Token Structure

```json
{
  "iss": "https://auth.example.com",
  "sub": "user123",
  "aud": "client_app_id",
  "exp": 1699000000,
  "iat": 1698996400,
  "nonce": "abc123",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

### Access Token vs ID Token

| Token | Purpose | Audience | Format |
|-------|---------|----------|--------|
| Access Token | Authorize API access | Resource server | Opaque string or JWT |
| ID Token | Prove user identity | Client application | Always JWT |
| Refresh Token | Get new access tokens | Authorization server | Opaque string |

---

## Token Storage Best Practices

| Environment | Recommended Storage |
|-------------|-------------------|
| Server-side app | Encrypted server session |
| SPA (browser) | Memory only (not localStorage) |
| Mobile app | OS secure storage (Keychain/Keystore) |
| Refresh tokens | HttpOnly secure cookie or server-side |

> **Never** store tokens in `localStorage` — it's accessible to any JavaScript on the page (XSS vulnerable).

---

## Common OAuth/OIDC Vulnerabilities

| Vulnerability | Description | Mitigation |
|---------------|-------------|------------|
| **CSRF on callback** | Attacker injects their auth code | Use `state` parameter |
| **Code interception** | Auth code stolen in transit | Use PKCE |
| **Open redirect** | Manipulated `redirect_uri` | Strict URI validation |
| **Token leakage** | Tokens in URL fragments or logs | Use authorization code flow |
| **Insufficient scope** | Over-privileged tokens | Request minimal scopes |
| **ID token misuse** | Using ID token as API credential | Use access token for APIs |
| **Refresh token theft** | Attacker obtains long-lived token | Rotate refresh tokens, bind to device |

---

## Implementation Example (Express + OIDC)

```javascript
import { auth } from "express-openid-connect";

app.use(auth({
  authRequired: false,
  auth0Logout: true,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  secret: process.env.SESSION_SECRET,
}));

// Protected route
app.get("/profile", requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});
```

---

## Key Takeaways

- OAuth 2.0 handles authorization (access to resources); OIDC adds authentication (user identity).
- Always use Authorization Code + PKCE — never the implicit or password grant.
- ID tokens prove identity (for your app); access tokens authorize API calls (for the resource server).
- Validate the `state` parameter, enforce strict `redirect_uri`, and never store tokens in localStorage.
- Client credentials flow is for machine-to-machine; no user is involved.

---

[Next: Role-Based Access Control](38-cybersecurity-rbac)
