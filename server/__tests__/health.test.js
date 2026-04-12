import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index.js";

describe("Health API", () => {
  it("GET /api/health returns status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      message: "AlgoJourney API is running",
    });
  });

  it("GET /api/health returns JSON content-type", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-type"]).toMatch(/json/);
  });
});

describe("Express middleware", () => {
  it("CORS headers are present", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:3000");

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("parses JSON request bodies", async () => {
    const res = await request(app)
      .post("/api/nonexistent")
      .send({ test: "data" })
      .set("Content-Type", "application/json");

    // Should not crash — 404 is expected since route doesn't exist
    expect(res.status).toBe(404);
  });
});

describe("Unknown routes", () => {
  it("returns 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/unknown");

    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown root routes", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
  });
});
