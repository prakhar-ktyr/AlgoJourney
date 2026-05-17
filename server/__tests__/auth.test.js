import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import { User } from "../models/index.js";

let mongoServer;

// Test JWT secrets (only used in tests)
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key-for-vitest-only";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key-for-vitest-only";

const validUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123!",
};

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ---------------------------------------------------------------------------
// Helper: extract cookies from a supertest response
// ---------------------------------------------------------------------------

function getCookies(res) {
  const raw = res.headers["set-cookie"] || [];
  const cookies = {};
  for (const c of raw) {
    const [pair] = c.split(";");
    const [name, value] = pair.split("=");
    cookies[name.trim()] = value;
  }
  return cookies;
}

function cookieString(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------

describe("POST /api/auth/signup", () => {
  it("creates a new user and sets auth cookies", async () => {
    const res = await request(app).post("/api/auth/signup").send(validUser).expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe(validUser.username);
    expect(res.body.user.email).toBe(validUser.email);
    // passwordHash must never leak
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookies = getCookies(res);
    expect(cookies.accessToken).toBeDefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(validUser).expect(201);

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validUser, username: "different" })
      .expect(409);

    expect(res.body.message).toMatch(/email/i);
  });

  it("rejects duplicate username", async () => {
    await request(app).post("/api/auth/signup").send(validUser).expect(201);

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validUser, email: "other@example.com" })
      .expect(409);

    expect(res.body.message).toMatch(/username/i);
  });

  it("rejects missing username", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "a@b.com", password: "Password1!" })
      .expect(400);

    expect(res.body.message).toMatch(/username/i);
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ username: "user", email: "a@b.com", password: "short" })
      .expect(400);

    expect(res.body.message).toMatch(/8 characters/i);
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ username: "user", email: "not-an-email", password: "Password1!" })
      .expect(400);

    expect(res.body.message).toMatch(/valid email/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/signup").send(validUser);
  });

  it("logs in with correct credentials and sets cookies", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookies = getCookies(res);
    expect(cookies.accessToken).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" })
      .expect(401);

    expect(res.body.message).toMatch(/invalid/i);
  });

  it("rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Password1!" })
      .expect(401);

    expect(res.body.message).toMatch(/invalid/i);
  });

  it("rejects missing fields", async () => {
    await request(app).post("/api/auth/login").send({ email: validUser.email }).expect(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe("GET /api/auth/me", () => {
  it("returns current user when authenticated", async () => {
    const signupRes = await request(app).post("/api/auth/signup").send(validUser);
    const cookies = getCookies(signupRes);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects requests without auth cookie", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("rejects requests with invalid token", async () => {
    await request(app)
      .get("/api/auth/me")
      .set("Cookie", "accessToken=invalid.token.value")
      .expect(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

describe("POST /api/auth/logout", () => {
  it("clears auth cookies", async () => {
    const signupRes = await request(app).post("/api/auth/signup").send(validUser);
    const cookies = getCookies(signupRes);

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(res.body.message).toMatch(/logged out/i);

    // Cookies should be cleared (set to empty or expired)
    const setCookies = res.headers["set-cookie"] || [];
    const clearEntries = setCookies.filter((c) => c.includes("accessToken"));
    expect(clearEntries.length).toBeGreaterThan(0);
  });

  it("rejects logout without auth", async () => {
    await request(app).post("/api/auth/logout").expect(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------

describe("POST /api/auth/refresh", () => {
  it("issues a new access token using the refresh token", async () => {
    const signupRes = await request(app).post("/api/auth/signup").send(validUser);
    const signupCookies = getCookies(signupRes);

    // The refresh token cookie has path=/api/auth/refresh, so we need to
    // extract it from the raw set-cookie headers
    const rawCookies = signupRes.headers["set-cookie"] || [];
    const refreshCookie = rawCookies.find((c) => c.startsWith("refreshToken="));
    expect(refreshCookie).toBeDefined();

    // Extract just the refreshToken value
    const refreshToken = refreshCookie.split(";")[0].split("=").slice(1).join("=");

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .expect(200);

    expect(res.body.message).toMatch(/refreshed/i);

    const newCookies = getCookies(res);
    expect(newCookies.accessToken).toBeDefined();
  });

  it("rejects when no refresh token is present", async () => {
    await request(app).post("/api/auth/refresh").expect(401);
  });

  it("rejects an invalid refresh token", async () => {
    await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=invalid.token.value")
      .expect(401);
  });
});
