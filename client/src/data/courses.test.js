import { describe, it, expect } from "vitest";
import {
  COURSES,
  getCourse,
  hasCourse,
  getLesson,
  getAdjacentLessons,
  hasLanguageSupport,
  LANGUAGE_COURSES,
  COURSE_LANGUAGE_MAP,
  getCourseLanguages,
  filterLessonBody,
} from "./courses";

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

  it("registers the Quantum Computing course with substantive content", () => {
    expect(hasCourse("quantum-computing")).toBe(true);
    const course = getCourse("quantum-computing");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("quantum-computing");
    expect(home.title.toLowerCase()).toContain("quantum");
    expect(home.body.length).toBeGreaterThan(50);

    const grovers = getLesson("quantum-computing", "qc-grovers-algorithm");
    expect(grovers).not.toBeNull();
    expect(grovers.body.toLowerCase()).toContain("grover");
  });

  it("registers the OOP course with substantive content", () => {
    expect(hasCourse("oop")).toBe(true);
    const course = getCourse("oop");
    expect(course.lessons.length).toBeGreaterThanOrEqual(55);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("oop");
    expect(home.title.toLowerCase()).toContain("oop");
    expect(home.body.length).toBeGreaterThan(50);

    const encapsulation = getLesson("oop", "oop-encapsulation");
    expect(encapsulation).not.toBeNull();
    expect(encapsulation.body.toLowerCase()).toContain("encapsulation");
  });

  it("registers the Discrete Mathematics course with substantive content", () => {
    expect(hasCourse("discrete-mathematics")).toBe(true);
    const course = getCourse("discrete-mathematics");
    expect(course.lessons.length).toBeGreaterThanOrEqual(65);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("discrete-mathematics");
    expect(home.title.toLowerCase()).toContain("discrete");
    expect(home.body.length).toBeGreaterThan(50);

    const induction = getLesson("discrete-mathematics", "dm-mathematical-induction");
    expect(induction).not.toBeNull();
    expect(induction.body.toLowerCase()).toContain("induction");

    const graphs = getLesson("discrete-mathematics", "dm-intro-to-graphs");
    expect(graphs).not.toBeNull();
    expect(graphs.body.toLowerCase()).toContain("graph");
  });

  it("registers the DSA course with substantive content", () => {
    expect(hasCourse("dsa")).toBe(true);
    const course = getCourse("dsa");
    expect(course.lessons.length).toBeGreaterThanOrEqual(65);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("dsa");
    expect(home.title.toLowerCase()).toContain("dsa");
    expect(home.body.length).toBeGreaterThan(50);

    const bigO = getLesson("dsa", "dsa-big-o-notation");
    expect(bigO).not.toBeNull();
    expect(bigO.body.toLowerCase()).toContain("big o");

    const mergeSort = getLesson("dsa", "dsa-merge-sort");
    expect(mergeSort).not.toBeNull();
    expect(mergeSort.body.toLowerCase()).toContain("merge");
  });

  it("registers the Testing & QA course with substantive content", () => {
    expect(hasCourse("testing-qa")).toBe(true);
    const course = getCourse("testing-qa");
    expect(course.lessons.length).toBeGreaterThanOrEqual(65);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("testing-qa");
    expect(home.title.toLowerCase()).toContain("testing");
    expect(home.body.length).toBeGreaterThan(50);

    const unitTest = getLesson("testing-qa", "tqa-unit-testing");
    expect(unitTest).not.toBeNull();
    expect(unitTest.body.toLowerCase()).toContain("unit");

    const integration = getLesson("testing-qa", "tqa-integration-testing");
    expect(integration).not.toBeNull();
    expect(integration.body.toLowerCase()).toContain("integration");
  });

  it("registers the Linux & Shell Scripting course with substantive content", () => {
    expect(hasCourse("linux-shell")).toBe(true);
    const course = getCourse("linux-shell");
    expect(course.lessons.length).toBeGreaterThanOrEqual(65);

    const orders = course.lessons.map((l) => l.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);

    const home = getLesson("linux-shell");
    expect(home.title.toLowerCase()).toContain("linux");
    expect(home.body.length).toBeGreaterThan(50);

    const grep = getLesson("linux-shell", "ls-grep");
    expect(grep).not.toBeNull();
    expect(grep.body.toLowerCase()).toContain("grep");

    const scripting = getLesson("linux-shell", "ls-intro-scripting");
    expect(scripting).not.toBeNull();
    expect(scripting.body.toLowerCase()).toContain("script");
  });

  it("marks DSA, OOP, Discrete Math, and Testing & QA as language-supported courses", () => {
    expect(hasLanguageSupport("dsa")).toBe(true);
    expect(hasLanguageSupport("oop")).toBe(true);
    expect(hasLanguageSupport("discrete-mathematics")).toBe(true);
    expect(hasLanguageSupport("testing-qa")).toBe(true);
    expect(hasLanguageSupport("c")).toBe(false);
    expect(hasLanguageSupport("javascript")).toBe(false);
    expect(hasLanguageSupport("linux-shell")).toBe(false);
    expect(LANGUAGE_COURSES.has("dsa")).toBe(true);
    expect(LANGUAGE_COURSES.has("oop")).toBe(true);
    expect(LANGUAGE_COURSES.has("discrete-mathematics")).toBe(true);
    expect(LANGUAGE_COURSES.has("testing-qa")).toBe(true);
  });

  it("provides per-course language lists", () => {
    expect(getCourseLanguages("dsa")).toEqual(["C++", "Java", "Python", "JavaScript"]);
    expect(getCourseLanguages("oop")).toEqual(["C++", "C#", "Java", "Python", "JavaScript"]);
    expect(getCourseLanguages("discrete-mathematics")).toEqual(
      ["C++", "C#", "Java", "Python", "JavaScript"],
    );
    expect(getCourseLanguages("testing-qa")).toEqual(
      ["Python", "JavaScript", "Java", "C#"],
    );
    expect(getCourseLanguages("c")).toBeNull();
    expect(COURSE_LANGUAGE_MAP.dsa).not.toContain("C#");
    expect(COURSE_LANGUAGE_MAP.oop).toContain("C#");
    expect(COURSE_LANGUAGE_MAP["discrete-mathematics"]).toContain("C#");
    expect(COURSE_LANGUAGE_MAP["testing-qa"]).toContain("Python");
    expect(COURSE_LANGUAGE_MAP["testing-qa"]).toContain("C#");
  });

  it("filters code fences by selected language", () => {
    const body = [
      "# Heading",
      "",
      "```cpp",
      "int x = 1;",
      "```",
      "",
      "```python",
      "x = 1",
      "```",
    ].join("\n");

    const forCpp = filterLessonBody(body, "C++");
    expect(forCpp).toContain("```cpp");
    expect(forCpp).not.toContain("```python");

    const forPy = filterLessonBody(body, "Python");
    expect(forPy).toContain("```python");
    expect(forPy).not.toContain("```cpp");
  });

  it("resolves per-language section overrides", () => {
    const body = [
      "## Overview",
      "Generic overview.",
      "",
      "## Overview (Python)",
      "Python-specific overview.",
      "",
      "## Details",
      "Shared details.",
    ].join("\n");

    const pyResult = filterLessonBody(body, "Python");
    expect(pyResult).toContain("Python-specific overview.");
    expect(pyResult).not.toContain("Generic overview.");
    expect(pyResult).toContain("Shared details.");

    const javaResult = filterLessonBody(body, "Java");
    expect(javaResult).toContain("Generic overview.");
    expect(javaResult).not.toContain("Python-specific overview.");
    expect(javaResult).toContain("Shared details.");
  });

  it("keeps untagged code fences when filtering by language", () => {
    const body = ["```", "plain code", "```", "", "```java", "int x = 1;", "```"].join("\n");

    const forPy = filterLessonBody(body, "Python");
    expect(forPy).toContain("plain code");
    expect(forPy).not.toContain("int x = 1;");
  });

  it("includes standalone language sections only for the matching language", () => {
    const body = [
      "## Intro",
      "Shared intro.",
      "",
      "## Properties (C#)",
      "C#-specific properties.",
      "",
      "## @classmethod (Python)",
      "Python classmethod.",
      "",
      "## Outro",
      "Shared outro.",
    ].join("\n");

    const csharpResult = filterLessonBody(body, "C#");
    expect(csharpResult).toContain("C#-specific properties.");
    expect(csharpResult).not.toContain("Python classmethod.");
    expect(csharpResult).toContain("Shared intro.");
    expect(csharpResult).toContain("Shared outro.");

    const pyResult = filterLessonBody(body, "Python");
    expect(pyResult).toContain("Python classmethod.");
    expect(pyResult).not.toContain("C#-specific properties.");

    const javaResult = filterLessonBody(body, "Java");
    expect(javaResult).not.toContain("C#-specific properties.");
    expect(javaResult).not.toContain("Python classmethod.");
    expect(javaResult).toContain("Shared intro.");
  });
});
