import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import User from "../models/User.js";

/** Helper: build a valid user doc (won't save to DB — just validates). */
const validUserData = (overrides = {}) => ({
  username: "johndoe",
  email: "john@example.com",
  passwordHash: "$2b$10$abcdefghijklmnopqrstuv",
  ...overrides,
});

describe("User model — schema validation", () => {
  // --- required fields ---
  it("validates a complete user object", () => {
    const user = new User(validUserData());
    const err = user.validateSync();
    expect(err).toBeUndefined();
  });

  it("requires username", () => {
    const user = new User(validUserData({ username: undefined }));
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
  });

  it("requires email", () => {
    const user = new User(validUserData({ email: undefined }));
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  it("requires passwordHash", () => {
    const user = new User(validUserData({ passwordHash: undefined }));
    const err = user.validateSync();
    expect(err.errors.passwordHash).toBeDefined();
  });

  // --- email format ---
  it("rejects invalid email format", () => {
    const user = new User(validUserData({ email: "not-an-email" }));
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  it("lowercases email", () => {
    const user = new User(validUserData({ email: "John@Example.COM" }));
    expect(user.email).toBe("john@example.com");
  });

  // --- username length ---
  it("rejects username shorter than 3 chars", () => {
    const user = new User(validUserData({ username: "ab" }));
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
  });

  it("rejects username longer than 30 chars", () => {
    const user = new User(validUserData({ username: "a".repeat(31) }));
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
  });

  // --- role enum ---
  it("defaults role to user", () => {
    const user = new User(validUserData());
    expect(user.role).toBe("user");
  });

  it("accepts admin role", () => {
    const user = new User(validUserData({ role: "admin" }));
    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.role).toBe("admin");
  });

  it("rejects invalid role", () => {
    const user = new User(validUserData({ role: "superuser" }));
    const err = user.validateSync();
    expect(err.errors.role).toBeDefined();
  });

  // --- defaults ---
  it("defaults currentStreak and longestStreak to 0", () => {
    const user = new User(validUserData());
    expect(user.currentStreak).toBe(0);
    expect(user.longestStreak).toBe(0);
  });

  it("defaults completedTutorials to empty array", () => {
    const user = new User(validUserData());
    expect(user.completedTutorials).toEqual([]);
  });

  it("defaults completedDSAQuestions to empty array", () => {
    const user = new User(validUserData());
    expect(user.completedDSAQuestions).toEqual([]);
  });

  // --- ObjectId refs ---
  it("accepts valid ObjectIds in completedTutorials", () => {
    const id = new mongoose.Types.ObjectId();
    const user = new User(validUserData({ completedTutorials: [id] }));
    expect(user.completedTutorials).toHaveLength(1);
  });

  // --- toJSON strips passwordHash ---
  it("toJSON removes passwordHash", () => {
    const user = new User(validUserData());
    const json = user.toJSON();
    expect(json.passwordHash).toBeUndefined();
    expect(json.username).toBe("johndoe");
  });

  // --- bio / displayName limits ---
  it("rejects bio longer than 300 chars", () => {
    const user = new User(validUserData({ bio: "x".repeat(301) }));
    const err = user.validateSync();
    expect(err.errors.bio).toBeDefined();
  });

  it("rejects displayName longer than 50 chars", () => {
    const user = new User(validUserData({ displayName: "x".repeat(51) }));
    const err = user.validateSync();
    expect(err.errors.displayName).toBeDefined();
  });
});
