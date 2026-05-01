---
title: OAuth 2.0
---

# OAuth 2.0

**OAuth 2.0** is a delegation protocol that lets users grant third-party apps limited access to their resources without sharing passwords. It's how "Login with Google/GitHub" works.

---

## The Problem OAuth Solves

Without OAuth:
```
User gives their Google password to a third-party app
→ App has full access to their Google account 😱
```

With OAuth:
```
User authorizes the app through Google's login page
→ App receives a limited-scope token 🔐
→ App can only do what the user authorized
```

---

## OAuth 2.0 Roles

| Role | Description | Example |
|------|-------------|---------|
| **Resource Owner** | The user | Alice |
| **Client** | The app requesting access | Your web app |
| **Authorization Server** | Issues tokens | Google, GitHub |
| **Resource Server** | Hosts protected resources | Google API, GitHub API |

---

## Authorization Code Flow

The most common and secure flow for web apps:

```
1. App redirects user to authorization server:
   GET https://accounts.google.com/oauth/authorize
     ?client_id=YOUR_CLIENT_ID
     &redirect_uri=https://myapp.com/callback
     &response_type=code
     &scope=email profile

2. User logs in and consents

3. Authorization server redirects back with a code:
   GET https://myapp.com/callback?code=AUTH_CODE_HERE

4. App exchanges code for tokens (server-to-server):
   POST https://oauth2.googleapis.com/token
   {
     "code": "AUTH_CODE_HERE",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "redirect_uri": "https://myapp.com/callback",
     "grant_type": "authorization_code"
   }

5. Receives access token:
   { "access_token": "ya29...", "refresh_token": "1/...", "expires_in": 3600 }

6. App uses access token to call APIs:
   GET https://www.googleapis.com/oauth2/v2/userinfo
   Authorization: Bearer ya29...
```

---

## Implementation with Passport.js

```bash
npm install passport passport-google-oauth20 express-session
```

```javascript
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  // Find or create user in your database
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });
  }
  done(null, user);
}));

// Start OAuth flow
app.get("/api/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Handle callback
app.get("/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Issue your own JWT
    const token = jwt.sign({ userId: req.user._id }, JWT_SECRET, { expiresIn: "24h" });
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
  }
);
```

---

## OAuth 2.0 Scopes

Scopes limit what the app can do:

```
scope=email           → Read email address
scope=profile         → Read name, avatar
scope=repo            → Access GitHub repositories
scope=read:user       → Read GitHub user profile
```

Always request the **minimum scopes** needed.

---

## Key Takeaways

- **OAuth 2.0** enables secure third-party access without sharing passwords
- **Authorization Code** flow is the standard for web apps
- Use libraries like **Passport.js** for implementation
- Always request **minimum scopes**
- Exchange the auth code for tokens on the **server side** (never client-side)
- Issue your **own JWT** after OAuth authentication

---

Next, we'll compare **Session vs Token Authentication** →
