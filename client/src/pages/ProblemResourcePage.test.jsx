import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProblemResourcePage from "./ProblemResourcePage";

const renderAt = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/dsa-sheet/problem/${slug}`]}>
      <Routes>
        <Route path="/dsa-sheet/problem/:slug" element={<ProblemResourcePage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProblemResourcePage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders course material for a known problem", () => {
    renderAt("1-user-input-output");
    expect(screen.getByRole("heading", { name: "User Input / Output" })).toBeInTheDocument();
    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
    expect(screen.getByTestId("solution-code")).toHaveTextContent(
      "int multiplication(int A, int B)",
    );
  });

  it("switches code snippet when language changes", async () => {
    const user = userEvent.setup();
    renderAt("1-user-input-output");
    const select = screen.getByLabelText("Select code snippet language");
    await user.selectOptions(select, "Python");
    const code = screen.getByTestId("solution-code");
    expect(code).toHaveTextContent("def multiplication(self, A, B)");
    expect(code).not.toHaveTextContent("int multiplication(int A, int B)");
  });

  it("swaps per-language prose sections when the language changes", async () => {
    const user = userEvent.setup();
    renderAt("1-user-input-output");
    // C++ approach override mentions the iostream library.
    expect(screen.getAllByText(/iostream/i).length).toBeGreaterThan(0);
    await user.selectOptions(
      screen.getByLabelText("Select code snippet language"),
      "Python",
    );
    // Python override replaces the approach copy.
    expect(screen.getAllByText(/arbitrary precision/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/iostream/i)).toHaveLength(0);
  });

  it("persists the selected language across mounts", async () => {
    const user = userEvent.setup();
    const { unmount } = renderAt("1-user-input-output");
    await user.selectOptions(screen.getByLabelText("Select code snippet language"), "Java");
    unmount();
    renderAt("1-user-input-output");
    expect(screen.getByLabelText("Select code snippet language")).toHaveValue("Java");
  });

  it("shows a coming-soon placeholder for problems without resources yet", () => {
    renderAt("7-while-loops");
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
  });

  it("treats complexity and solution as optional when absent", () => {
    renderAt("5-what-are-arrays-strings");
    expect(screen.queryByRole("heading", { name: "Complexity" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solution" })).not.toBeInTheDocument();
  });

  it("shows a not-found message for unknown slugs", () => {
    renderAt("999999-does-not-exist");
    expect(screen.getByText("Problem Not Found")).toBeInTheDocument();
  });

  it("copies the current snippet to the clipboard via the Copy button", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderAt("1-user-input-output");
    // The C++ approach section also renders an inline code block, so there are
    // multiple "Copy C++ code" buttons — scope to the solution block via its testId.
    const solutionBlock = screen.getByTestId("solution-code").closest(".rounded-lg");
    const copyBtn = within(solutionBlock).getByRole("button", {
      name: /copy c\+\+ code to clipboard/i,
    });
    await user.click(copyBtn);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("int multiplication(int A, int B)");
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it("renders concept bullets with inline markdown formatting (bold + code)", () => {
    renderAt("1-user-input-output");
    // Per-language Concepts section for the default language (C++) uses
    // **bold** terms and `inline code` — both should render as elements,
    // not as raw markdown characters.
    const cinCode = screen.getAllByText("cin").find((el) => el.tagName === "CODE");
    expect(cinCode).toBeDefined();
    expect(screen.queryByText(/\*\*cin\*\*/)).not.toBeInTheDocument();
  });

  it("renders bold labels in approach as strong elements with no raw ** markers", () => {
    renderAt("1-user-input-output");
    // C++ Approach uses **Input:** and **Output:** — these must become <strong>,
    // not leak the literal ** characters into the DOM.
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
    const inputLabel = screen.getByText("Input:", { selector: "strong" });
    expect(inputLabel).toBeInTheDocument();
  });
});
