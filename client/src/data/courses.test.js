import { describe, it, expect } from "vitest";
import { COURSES, getCourse, hasCourse, getLesson, getAdjacentLessons } from "./courses";

describe("courses loader", () => {
  it("registers the C course", () => {
    expect(hasCourse("c")).toBe(true);
    expect(getCourse("c")).not.toBeNull();
  });

  it("loads multiple lessons for C in the right order", () => {
    const c = getCourse("c");
    expect(c.lessons.length).toBeGreaterThanOrEqual(10);
    const orders = c.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
  });

  it("uses the first lesson as the landing page when lessonSlug is omitted", () => {
    const first = getCourse("c").lessons[0];
    expect(getLesson("c").slug).toBe(first.slug);
    expect(getLesson("c", undefined).slug).toBe(first.slug);
  });

  it("looks up a lesson by slug", () => {
    const lesson = getLesson("c", "c-pointers");
    expect(lesson).not.toBeNull();
    expect(lesson.title.toLowerCase()).toContain("pointer");
    expect(lesson.body.length).toBeGreaterThan(50);
  });

  it("returns null for an unknown course or lesson", () => {
    expect(getCourse("not-a-real-course")).toBeNull();
    expect(getLesson("c", "no-such-lesson")).toBeNull();
    expect(hasCourse("python")).toBe(false);
  });

  it("computes prev/next correctly", () => {
    const c = getCourse("c");
    const second = c.lessons[1];
    const [prev, next] = getAdjacentLessons("c", second.slug);
    expect(prev.slug).toBe(c.lessons[0].slug);
    expect(next.slug).toBe(c.lessons[2].slug);
  });

  it("returns null prev for the first lesson and null next for the last", () => {
    const c = getCourse("c");
    const [firstPrev] = getAdjacentLessons("c", c.lessons[0].slug);
    const [, lastNext] = getAdjacentLessons("c", c.lessons[c.lessons.length - 1].slug);
    expect(firstPrev).toBeNull();
    expect(lastNext).toBeNull();
  });

  it("exposes COURSES as a slug-keyed object", () => {
    expect(COURSES.c).toBeDefined();
    expect(COURSES.c.slug).toBe("c");
  });
});
