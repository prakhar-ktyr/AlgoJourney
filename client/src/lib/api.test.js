import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiUrl, apiFetch } from "./api";

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

  it("calls fetch with the prefixed URL", async () => {
    await apiFetch("/health");
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/health", undefined);
  });

  it("forwards init options", async () => {
    const init = { method: "POST", body: "{}" };
    await apiFetch("/things", init);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/things", init);
  });
});
