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
    expect(hasCourse("not-a-real-course-xyz")).toBe(false);
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

  it("registers the Python course with substantive content", () => {
    expect(hasCourse("python")).toBe(true);
    const py = getCourse("python");
    expect(py.lessons.length).toBeGreaterThanOrEqual(30);

    const orders = py.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("python");
    expect(home.title.toLowerCase()).toContain("python");
    expect(home.body.length).toBeGreaterThan(50);

    const oop = getLesson("python", "python-classes-objects");
    expect(oop).not.toBeNull();
    expect(oop.body.toLowerCase()).toContain("class");
  });

  it("registers the Java course with substantive content", () => {
    expect(hasCourse("java")).toBe(true);
    const java = getCourse("java");
    expect(java.lessons.length).toBeGreaterThanOrEqual(40);

    const orders = java.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("java");
    expect(home.title.toLowerCase()).toContain("java");
    expect(home.body.length).toBeGreaterThan(50);

    const oop = getLesson("java", "java-classes-objects");
    expect(oop).not.toBeNull();
    expect(oop.body.toLowerCase()).toContain("class");
  });

  it("registers the TypeScript course with substantive content", () => {
    expect(hasCourse("typescript")).toBe(true);
    const ts = getCourse("typescript");
    expect(ts.lessons.length).toBeGreaterThanOrEqual(40);

    const orders = ts.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("typescript");
    expect(home.title.toLowerCase()).toContain("typescript");
    expect(home.body.length).toBeGreaterThan(50);

    // Check a file we know exists:
    const syntax = getLesson("typescript", "typescript-syntax");
    expect(syntax).not.toBeNull();
    expect(syntax.body.toLowerCase()).toContain("syntax");
  });

  it("registers the Rust course with substantive content", () => {
    expect(hasCourse("rust")).toBe(true);
    const rust = getCourse("rust");
    expect(rust.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = rust.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("rust");
    expect(home.title.toLowerCase()).toContain("rust");
    expect(home.body.length).toBeGreaterThan(50);

    const ownership = getLesson("rust", "rust-ownership");
    expect(ownership).not.toBeNull();
    expect(ownership.body.toLowerCase()).toContain("ownership");
  });

  it("registers the HTML course with substantive content", () => {
    expect(hasCourse("html")).toBe(true);
    const html = getCourse("html");
    expect(html.lessons.length).toBeGreaterThanOrEqual(65);

    const orders = html.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("html");
    expect(home.title.toLowerCase()).toContain("html");
    expect(home.body.length).toBeGreaterThan(50);

    const forms = getLesson("html", "html-forms");
    expect(forms).not.toBeNull();
    expect(forms.body.toLowerCase()).toContain("form");
  });

  it("registers the React course with substantive content", () => {
    expect(hasCourse("react")).toBe(true);
    const react = getCourse("react");
    expect(react.lessons.length).toBeGreaterThanOrEqual(50);

    const orders = react.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("react");
    expect(home.title.toLowerCase()).toContain("react");
    expect(home.body.length).toBeGreaterThan(50);

    const hooks = getLesson("react", "react-hooks");
    expect(hooks).not.toBeNull();
    expect(hooks.body.toLowerCase()).toContain("hook");
  });

  it("registers the Node.js course with substantive content", () => {
    expect(hasCourse("nodejs")).toBe(true);
    const nodejs = getCourse("nodejs");
    expect(nodejs.lessons.length).toBeGreaterThanOrEqual(50);

    const orders = nodejs.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("nodejs");
    expect(home.title.toLowerCase()).toContain("node");
    expect(home.body.length).toBeGreaterThan(50);

    const modules = getLesson("nodejs", "nodejs-modules");
    expect(modules).not.toBeNull();
    expect(modules.body.toLowerCase()).toContain("module");
  });

  it("registers the Next.js course with substantive content", () => {
    expect(hasCourse("nextjs")).toBe(true);
    const nextjs = getCourse("nextjs");
    expect(nextjs.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = nextjs.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("nextjs");
    expect(home.title.toLowerCase()).toContain("next");
    expect(home.body.length).toBeGreaterThan(50);

    const routing = getLesson("nextjs", "nextjs-pages-routing");
    expect(routing).not.toBeNull();
    expect(routing.body.toLowerCase()).toContain("route");
  });

  it("registers the Web APIs & REST course with substantive content", () => {
    expect(hasCourse("web-apis-rest")).toBe(true);
    const course = getCourse("web-apis-rest");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("web-apis-rest");
    expect(home.title.toLowerCase()).toContain("api");
    expect(home.body.length).toBeGreaterThan(50);

    const rest = getLesson("web-apis-rest", "web-apis-rest-what-is-rest");
    expect(rest).not.toBeNull();
    expect(rest.body.toLowerCase()).toContain("rest");
  });

  it("registers the GraphQL course with substantive content", () => {
    expect(hasCourse("graphql")).toBe(true);
    const course = getCourse("graphql");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("graphql");
    expect(home.title.toLowerCase()).toContain("graphql");
    expect(home.body.length).toBeGreaterThan(50);

    const resolvers = getLesson("graphql", "graphql-resolvers");
    expect(resolvers).not.toBeNull();
    expect(resolvers.body.toLowerCase()).toContain("resolver");
  });

  it("registers the Cybersecurity course with substantive content", () => {
    expect(hasCourse("cybersecurity")).toBe(true);
    const course = getCourse("cybersecurity");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("cybersecurity");
    expect(home.title.toLowerCase()).toContain("cybersecurity");
    expect(home.body.length).toBeGreaterThan(50);

    const xss = getLesson("cybersecurity", "cybersecurity-xss");
    expect(xss).not.toBeNull();
    expect(xss.body.toLowerCase()).toContain("xss");
  });

  it("registers the Blockchain course with substantive content", () => {
    expect(hasCourse("blockchain")).toBe(true);
    const course = getCourse("blockchain");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("blockchain");
    expect(home.title.toLowerCase()).toContain("blockchain");
    expect(home.body.length).toBeGreaterThan(50);

    const solidity = getLesson("blockchain", "blockchain-solidity-basics");
    expect(solidity).not.toBeNull();
    expect(solidity.body.toLowerCase()).toContain("solidity");
  });
});
