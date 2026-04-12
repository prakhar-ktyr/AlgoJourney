import { describe, it, expect } from "vitest";
import Tutorial, { TUTORIAL_CATEGORIES } from "../models/Tutorial.js";

const validTutorialData = (overrides = {}) => ({
  title: "Introduction to Arrays",
  slug: "introduction-to-arrays",
  category: "Data Structures & Algorithms",
  markdownContent: "# Arrays\n\nAn array is a collection of elements...",
  orderIndex: 1,
  ...overrides,
});

describe("Tutorial model — schema validation", () => {
  // --- valid document ---
  it("validates a complete tutorial", () => {
    const tutorial = new Tutorial(validTutorialData());
    const err = tutorial.validateSync();
    expect(err).toBeUndefined();
  });

  // --- required fields ---
  it("requires title", () => {
    const tutorial = new Tutorial(validTutorialData({ title: undefined }));
    const err = tutorial.validateSync();
    expect(err.errors.title).toBeDefined();
  });

  it("requires slug", () => {
    const tutorial = new Tutorial(validTutorialData({ slug: undefined }));
    const err = tutorial.validateSync();
    expect(err.errors.slug).toBeDefined();
  });

  it("requires category", () => {
    const tutorial = new Tutorial(validTutorialData({ category: undefined }));
    const err = tutorial.validateSync();
    expect(err.errors.category).toBeDefined();
  });

  it("requires markdownContent", () => {
    const tutorial = new Tutorial(
      validTutorialData({ markdownContent: undefined }),
    );
    const err = tutorial.validateSync();
    expect(err.errors.markdownContent).toBeDefined();
  });

  it("defaults orderIndex to 0 when omitted", () => {
    const tutorial = new Tutorial(validTutorialData({ orderIndex: undefined }));
    expect(tutorial.orderIndex).toBe(0);
  });

  // --- slug format ---
  it("rejects slug with spaces", () => {
    const tutorial = new Tutorial(validTutorialData({ slug: "has spaces" }));
    const err = tutorial.validateSync();
    expect(err.errors.slug).toBeDefined();
  });

  it("lowercases slug before validation", () => {
    const tutorial = new Tutorial(validTutorialData({ slug: "HasUpperCase" }));
    expect(tutorial.slug).toBe("hasuppercase");
  });

  it("accepts valid kebab-case slug", () => {
    const tutorial = new Tutorial(
      validTutorialData({ slug: "intro-to-react-19" }),
    );
    const err = tutorial.validateSync();
    expect(err).toBeUndefined();
  });

  // --- category enum ---
  it("rejects invalid category", () => {
    const tutorial = new Tutorial(
      validTutorialData({ category: "Basket Weaving" }),
    );
    const err = tutorial.validateSync();
    expect(err.errors.category).toBeDefined();
  });

  it("accepts every valid category", () => {
    for (const cat of TUTORIAL_CATEGORIES) {
      const tutorial = new Tutorial(
        validTutorialData({
          category: cat,
          slug: `slug-${TUTORIAL_CATEGORIES.indexOf(cat)}`,
        }),
      );
      const err = tutorial.validateSync();
      expect(err).toBeUndefined();
    }
  });

  // --- difficulty enum ---
  it("defaults difficulty to Beginner", () => {
    const tutorial = new Tutorial(validTutorialData());
    expect(tutorial.difficulty).toBe("Beginner");
  });

  it("accepts Intermediate difficulty", () => {
    const tutorial = new Tutorial(
      validTutorialData({ difficulty: "Intermediate" }),
    );
    expect(tutorial.difficulty).toBe("Intermediate");
  });

  it("rejects invalid difficulty", () => {
    const tutorial = new Tutorial(validTutorialData({ difficulty: "Expert" }));
    const err = tutorial.validateSync();
    expect(err.errors.difficulty).toBeDefined();
  });

  // --- defaults ---
  it("defaults published to false", () => {
    const tutorial = new Tutorial(validTutorialData());
    expect(tutorial.published).toBe(false);
  });

  it("defaults tags to empty array", () => {
    const tutorial = new Tutorial(validTutorialData());
    expect(tutorial.tags).toEqual([]);
  });

  it("defaults prerequisites to empty array", () => {
    const tutorial = new Tutorial(validTutorialData());
    expect(tutorial.prerequisites).toEqual([]);
  });

  // --- optional fields ---
  it("accepts summary, subcategory, estimatedMinutes", () => {
    const tutorial = new Tutorial(
      validTutorialData({
        summary: "A quick guide to arrays",
        subcategory: "Linear Data Structures",
        estimatedMinutes: 15,
      }),
    );
    const err = tutorial.validateSync();
    expect(err).toBeUndefined();
  });

  it("rejects estimatedMinutes less than 1", () => {
    const tutorial = new Tutorial(validTutorialData({ estimatedMinutes: 0 }));
    const err = tutorial.validateSync();
    expect(err.errors.estimatedMinutes).toBeDefined();
  });
});

describe("TUTORIAL_CATEGORIES constant", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(TUTORIAL_CATEGORIES)).toBe(true);
    expect(TUTORIAL_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("covers core CS topics", () => {
    const expected = [
      "Operating Systems",
      "Computer Networks",
      "Database Management Systems",
      "Data Structures & Algorithms",
      "Artificial Intelligence",
      "Machine Learning",
      "System Design",
    ];
    for (const topic of expected) {
      expect(TUTORIAL_CATEGORIES).toContain(topic);
    }
  });

  it("covers web development topics", () => {
    const expected = ["HTML", "CSS", "React", "Node.js"];
    for (const topic of expected) {
      expect(TUTORIAL_CATEGORIES).toContain(topic);
    }
  });

  it("covers programming languages", () => {
    const expected = ["Python", "Java", "C++", "JavaScript"];
    for (const topic of expected) {
      expect(TUTORIAL_CATEGORIES).toContain(topic);
    }
  });
});
