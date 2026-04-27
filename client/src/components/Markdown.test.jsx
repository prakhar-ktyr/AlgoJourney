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
});
