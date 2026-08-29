import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import { User } from "../models/index.js";

let mongoServer;

// Test JWT secrets
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key-for-vitest-only";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key-for-vitest-only";

const validUser = {
  username: "progressuser",
  email: "progress@example.com",
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
// Helper: sign up and extract cookies
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

async function signupAndGetCookies() {
  const res = await request(app).post("/api/auth/signup").send(validUser).expect(201);
  return getCookies(res);
}

// ---------------------------------------------------------------------------
// GET /api/progress
// ---------------------------------------------------------------------------

describe("GET /api/progress", () => {
  it("returns empty progress for new user", async () => {
    const cookies = await signupAndGetCookies();

    const res = await request(app)
      .get("/api/progress")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(res.body.completedSlugs).toEqual([]);
  });

  it("returns saved progress", async () => {
    const cookies = await signupAndGetCookies();

    // Set some progress first
    await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["two-sum", "reverse-linked-list"] })
      .expect(200);

    const res = await request(app)
      .get("/api/progress")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(res.body.completedSlugs).toEqual(
      expect.arrayContaining(["two-sum", "reverse-linked-list"]),
    );
    expect(res.body.completedSlugs).toHaveLength(2);
  });

  it("rejects unauthenticated requests", async () => {
    await request(app).get("/api/progress").expect(401);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/progress
// ---------------------------------------------------------------------------

describe("PUT /api/progress", () => {
  it("saves progress slugs", async () => {
    const cookies = await signupAndGetCookies();

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["two-sum", "valid-parentheses"] })
      .expect(200);

    expect(res.body.completedSlugs).toEqual(
      expect.arrayContaining(["two-sum", "valid-parentheses"]),
    );
  });

  it("deduplicates slugs", async () => {
    const cookies = await signupAndGetCookies();

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["two-sum", "two-sum", "two-sum"] })
      .expect(200);

    expect(res.body.completedSlugs).toEqual(["two-sum"]);
  });

  it("replaces previous progress", async () => {
    const cookies = await signupAndGetCookies();

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["two-sum"] })
      .expect(200);

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["valid-parentheses"] })
      .expect(200);

    expect(res.body.completedSlugs).toEqual(["valid-parentheses"]);
  });

  it("rejects non-array completedSlugs", async () => {
    const cookies = await signupAndGetCookies();

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: "not-an-array" })
      .expect(400);

    expect(res.body.message).toMatch(/array/i);
  });

  it("rejects empty string slugs", async () => {
    const cookies = await signupAndGetCookies();

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookieString(cookies))
      .send({ completedSlugs: ["two-sum", ""] })
      .expect(400);

    expect(res.body.message).toMatch(/non-empty/i);
  });

  it("rejects unauthenticated requests", async () => {
    await request(app)
      .put("/api/progress")
      .send({ completedSlugs: ["two-sum"] })
      .expect(401);
  });
});
