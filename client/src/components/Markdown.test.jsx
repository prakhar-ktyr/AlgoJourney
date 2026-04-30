import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Markdown from "./Markdown";

describe("Markdown", () => {
  it("renders markdown headings as heading elements", () => {
    render(
      <Markdown
        source={[
          "Intro paragraph.",
          "",
          "### What is an Array?",
          "Arrays store values in index-based order.",
        ].join("\n")}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "What is an Array?",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("### What is an Array?")).not.toBeInTheDocument();
  });

  it("renders inline LaTeX math via KaTeX", () => {
    const { container } = render(
      <Markdown source={"Time: $O(\\log_{10}(n))$ is the answer."} />,
    );
    // KaTeX wraps the formula in a `.katex` span; the literal `$` markers
    // should be stripped from the rendered output.
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).not.toContain("$O(");
  });

  it("renders block math via $$...$$", () => {
    const { container } = render(<Markdown source={"$$E = mc^2$$"} />);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).not.toContain("$$");
  });

  it("renders --- as a horizontal rule, not literal text", () => {
    const { container } = render(
      <Markdown
        source={["Before the break.", "", "---", "", "After the break."].join(
          "\n",
        )}
      />,
    );
    expect(container.querySelector("hr")).not.toBeNull();
    expect(container.textContent).not.toContain("---");
  });
});
