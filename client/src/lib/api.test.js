import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiUrl, apiFetch, apiJson } from "./api";

describe("apiUrl", () => {
  it("prefixes /api to the path", () => {
    expect(apiUrl("/health")).toBe("/api/health");
  });

  it("normalises paths missing a leading slash", () => {
    expect(apiUrl("health")).toBe("/api/health");
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("{}"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetch with the prefixed URL and credentials", async () => {
    await apiFetch("/health");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/health", {
      credentials: "include",
    });
  });

  it("forwards init options and adds credentials", async () => {
    const init = { method: "POST", body: "{}" };
    await apiFetch("/things", init);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/things", {
      method: "POST",
      body: "{}",
      credentials: "include",
    });
  });

  it("retries on 403 after successful refresh", async () => {
    const expiredResponse = new Response("{}", { status: 403 });
    const refreshResponse = new Response('{"message":"Token refreshed"}', { status: 200 });
    const retriedResponse = new Response('{"data":"ok"}', { status: 200 });

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(expiredResponse) // first call — expired
      .mockResolvedValueOnce(refreshResponse) // refresh call
      .mockResolvedValueOnce(retriedResponse); // retry

    const res = await apiFetch("/protected");
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});

describe("apiJson", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("{}"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a JSON POST request by default", async () => {
    await apiJson("/auth/login", { email: "a@b.com", password: "pass" });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "pass" }),
      credentials: "include",
    });
  });

  it("supports PUT method", async () => {
    await apiJson("/progress", { completedSlugs: ["two-sum"] }, "PUT");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/progress",
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
