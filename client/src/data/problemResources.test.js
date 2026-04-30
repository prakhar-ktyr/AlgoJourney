import { describe, it, expect } from "vitest";
import { __buildResource } from "./problemResources";

describe("buildResource — multi-solution support", () => {
  it("collects multiple ## Solution sections into an ordered array", () => {
    const md = [
      "## Solution: Brute Force",
      "",
      "```cpp",
      "// O(n^2)",
      "```",
      "",
      "## Solution: Optimized",
      "",
      "```cpp",
      "// O(n log n)",
      "```",
      "",
      "```python",
      "# optimized py",
      "```",
      "",
    ].join("\n");

    const resource = __buildResource(md, "./resources/multi.md");
    expect(resource).not.toBeNull();
    expect(resource.solutions).toHaveLength(2);
    expect(resource.solutions[0].title).toBe("Brute Force");
    expect(resource.solutions[0].code["C++"]).toContain("O(n^2)");
    expect(resource.solutions[1].title).toBe("Optimized");
    expect(resource.solutions[1].code["C++"]).toContain("O(n log n)");
    expect(resource.solutions[1].code.Python).toContain("optimized py");
  });

  it("preserves the legacy single ## Solution shape (title null)", () => {
    const md = ["## Solution", "", "```cpp", "// only one", "```", ""].join("\n");

    const resource = __buildResource(md, "./resources/legacy.md");
    expect(resource.solutions).toHaveLength(1);
    expect(resource.solutions[0].title).toBeNull();
    expect(resource.solutions[0].code["C++"]).toContain("only one");
  });

  it("accepts `:` and `-` separators for solution labels", () => {
    const md = [
      "## Solution - Two Pointers",
      "",
      "```cpp",
      "// a",
      "```",
      "",
      "## Solution: Hash Map",
      "",
      "```cpp",
      "// b",
      "```",
      "",
    ].join("\n");

    const resource = __buildResource(md, "./resources/sep.md");
    expect(resource.solutions.map((s) => s.title)).toEqual(["Two Pointers", "Hash Map"]);
  });

  it("parses per-solution Time/Space declared above the code fence", () => {
    const md = [
      "## Solution: Brute Force",
      "Time: O(n^2)",
      "Space: O(1)",
      "",
      "```cpp",
      "// brute",
      "```",
      "",
      "## Solution: Optimized",
      "Time: O(n log n)",
      "",
      "```cpp",
      "// opt",
      "```",
      "",
      "## Solution: Plain",
      "",
      "```cpp",
      "// no complexity",
      "```",
      "",
    ].join("\n");

    const resource = __buildResource(md, "./resources/complexity.md");
    expect(resource.solutions[0].complexity).toEqual({ time: "O(n^2)", space: "O(1)" });
    expect(resource.solutions[0].code["C++"]).toBe("// brute");
    expect(resource.solutions[1].complexity).toEqual({ time: "O(n log n)" });
    expect(resource.solutions[1].code["C++"]).toBe("// opt");
    // The third solution has no Time/Space lines — complexity is null and the
    // code block is unaffected.
    expect(resource.solutions[2].complexity).toBeNull();
    expect(resource.solutions[2].code["C++"]).toBe("// no complexity");
  });
});
