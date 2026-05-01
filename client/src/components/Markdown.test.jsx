import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Markdown from "./Markdown";

const renderMd = (source) =>
  render(
    <MemoryRouter>
      <Markdown source={source} />
    </MemoryRouter>,
  );

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
    const { container } = render(<Markdown source={"Time: $O(\\log_{10}(n))$ is the answer."} />);
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
      <Markdown source={["Before the break.", "", "---", "", "After the break."].join("\n")} />,
    );
    expect(container.querySelector("hr")).not.toBeNull();
    expect(container.textContent).not.toContain("---");
  });

  it("renders GitHub-style tables", () => {
    const { container } = render(
      <Markdown
        source={[
          "| Flag | Purpose |",
          "| ---- | ------- |",
          "| `-O2` | Optimize for release. |",
          "| `-g`  | Include debug info. |",
        ].join("\n")}
      />,
    );

    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(container.querySelectorAll("thead th")).toHaveLength(2);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(screen.getByRole("columnheader", { name: "Flag" })).toBeInTheDocument();
    expect(screen.getByText("Optimize for release.")).toBeInTheDocument();
    // Inline `code` inside cells is rendered as <code>.
    expect(container.querySelectorAll("tbody code").length).toBeGreaterThan(0);
    // The pipe characters should not appear as literal text.
    expect(container.textContent).not.toContain("| Flag |");
  });

  it("renders relative links with react-router and external links with target=_blank", () => {
    const { container } = renderMd(
      [
        "See [C++ Functions](/tutorials/cpp/cpp-functions) for details.",
        "",
        "Also visit [our docs](https://example.com).",
      ].join("\n"),
    );

    const internal = screen.getByRole("link", { name: "C++ Functions" });
    expect(internal).toHaveAttribute("href", "/tutorials/cpp/cpp-functions");
    expect(internal).not.toHaveAttribute("target");

    const external = screen.getByRole("link", { name: "our docs" });
    expect(external).toHaveAttribute("href", "https://example.com");
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", expect.stringContaining("noopener"));

    expect(container.textContent).not.toContain("](");
  });

  it("renders [text](#) placeholders as plain text (no link)", () => {
    const { container } = renderMd("Coming soon: [Lambdas](#).");
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("Coming soon: Lambdas.");
    expect(container.textContent).not.toContain("](");
  });

  it("renders blockquotes", () => {
    const { container } = renderMd("> This is a blockquote\n> spanning multiple lines.");
    const bq = container.querySelector("blockquote");
    expect(bq).not.toBeNull();
    expect(bq.textContent).toContain("This is a blockquote\nspanning multiple lines.");
    expect(bq.textContent).not.toContain(">");
  });

  it("renders GFM alerts", () => {
    const { container } = renderMd("> [!NOTE]\n> This is an important note.");
    const alertDiv = container.querySelector(".border-blue-500");
    expect(alertDiv).not.toBeNull();
    expect(screen.getByText("note")).toBeInTheDocument();
    expect(screen.getByText("This is an important note.")).toBeInTheDocument();
  });

  it("renders task list items with checkboxes", () => {
    const { container } = renderMd(
      ["- [x] Completed task", "- [ ] Pending task"].join("\n"),
    );
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
    // No bullet markers for task lists
    expect(container.querySelector("ul").className).toContain("list-none");
    // Checked item has filled checkbox
    expect(items[0].querySelector(".bg-indigo-500")).not.toBeNull();
    expect(items[0].textContent).toContain("Completed task");
    // Unchecked item has empty checkbox
    expect(items[1].querySelector(".bg-indigo-500")).toBeNull();
    expect(items[1].textContent).toContain("Pending task");
    // Raw brackets should not appear
    expect(container.textContent).not.toContain("[x]");
    expect(container.textContent).not.toContain("[ ]");
  });
});
