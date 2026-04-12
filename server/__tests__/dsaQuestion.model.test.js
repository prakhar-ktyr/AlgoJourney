import { describe, it, expect } from "vitest";
import DSAQuestion, { DSA_TOPICS } from "../models/DSAQuestion.js";

const validQuestionData = (overrides = {}) => ({
  title: "Two Sum",
  topic: "Arrays",
  difficulty: "Easy",
  problemUrl: "https://leetcode.com/problems/two-sum",
  ...overrides,
});

describe("DSAQuestion model — schema validation", () => {
  // --- valid document ---
  it("validates a complete question", () => {
    const q = new DSAQuestion(validQuestionData());
    const err = q.validateSync();
    expect(err).toBeUndefined();
  });

  // --- required fields ---
  it("requires title", () => {
    const q = new DSAQuestion(validQuestionData({ title: undefined }));
    const err = q.validateSync();
    expect(err.errors.title).toBeDefined();
  });

  it("requires topic", () => {
    const q = new DSAQuestion(validQuestionData({ topic: undefined }));
    const err = q.validateSync();
    expect(err.errors.topic).toBeDefined();
  });

  it("requires difficulty", () => {
    const q = new DSAQuestion(validQuestionData({ difficulty: undefined }));
    const err = q.validateSync();
    expect(err.errors.difficulty).toBeDefined();
  });

  it("requires problemUrl", () => {
    const q = new DSAQuestion(validQuestionData({ problemUrl: undefined }));
    const err = q.validateSync();
    expect(err.errors.problemUrl).toBeDefined();
  });

  // --- topic enum ---
  it("rejects invalid topic", () => {
    const q = new DSAQuestion(validQuestionData({ topic: "Cooking" }));
    const err = q.validateSync();
    expect(err.errors.topic).toBeDefined();
  });

  it("accepts every valid topic", () => {
    for (const topic of DSA_TOPICS) {
      const q = new DSAQuestion(validQuestionData({ topic }));
      const err = q.validateSync();
      expect(err).toBeUndefined();
    }
  });

  // --- difficulty enum ---
  it("accepts Easy difficulty", () => {
    const q = new DSAQuestion(validQuestionData({ difficulty: "Easy" }));
    expect(q.difficulty).toBe("Easy");
  });

  it("accepts Medium difficulty", () => {
    const q = new DSAQuestion(validQuestionData({ difficulty: "Medium" }));
    expect(q.difficulty).toBe("Medium");
  });

  it("accepts Hard difficulty", () => {
    const q = new DSAQuestion(validQuestionData({ difficulty: "Hard" }));
    expect(q.difficulty).toBe("Hard");
  });

  it("rejects invalid difficulty", () => {
    const q = new DSAQuestion(validQuestionData({ difficulty: "Extreme" }));
    const err = q.validateSync();
    expect(err.errors.difficulty).toBeDefined();
  });

  // --- defaults ---
  it("defaults published to false", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.published).toBe(false);
  });

  it("defaults tags to empty array", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.tags).toEqual([]);
  });

  it("defaults companies to empty array", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.companies).toEqual([]);
  });

  it("defaults hints to empty array", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.hints).toEqual([]);
  });

  it("defaults solutionApproaches to empty array", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.solutionApproaches).toEqual([]);
  });

  it("defaults orderIndex to 0", () => {
    const q = new DSAQuestion(validQuestionData());
    expect(q.orderIndex).toBe(0);
  });

  // --- optional fields ---
  it("accepts description, tags, companies, hints", () => {
    const q = new DSAQuestion(
      validQuestionData({
        description: "Given an array of integers...",
        tags: ["hash-map", "brute-force"],
        companies: ["Google", "Amazon"],
        hints: ["Think about what complement you need"],
        solutionApproaches: ["Hash Map O(n)", "Brute Force O(n²)"],
      }),
    );
    const err = q.validateSync();
    expect(err).toBeUndefined();
    expect(q.tags).toHaveLength(2);
    expect(q.companies).toHaveLength(2);
  });

  it("rejects description longer than 1000 chars", () => {
    const q = new DSAQuestion(
      validQuestionData({ description: "x".repeat(1001) }),
    );
    const err = q.validateSync();
    expect(err.errors.description).toBeDefined();
  });
});

describe("DSA_TOPICS constant", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(DSA_TOPICS)).toBe(true);
    expect(DSA_TOPICS.length).toBeGreaterThan(0);
  });

  it("covers classic DSA topics", () => {
    const expected = [
      "Arrays",
      "Linked Lists",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Sorting",
      "Binary Search",
    ];
    for (const topic of expected) {
      expect(DSA_TOPICS).toContain(topic);
    }
  });

  it("covers ML-adjacent math topics", () => {
    const expected = [
      "Linear Algebra",
      "Probability & Statistics",
      "Mathematics for ML",
    ];
    for (const topic of expected) {
      expect(DSA_TOPICS).toContain(topic);
    }
  });
});
