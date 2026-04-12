import { describe, it, expect } from "vitest";
import connectDB from "../db.js";

describe("db.js module", () => {
  it("exports a function", () => {
    expect(typeof connectDB).toBe("function");
  });
});
