import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DSASheetPage from "./DSASheetPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <DSASheetPage />
    </MemoryRouter>,
  );

describe("DSASheetPage", () => {
  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("A2Z DSA Sheet")).toBeInTheDocument();
  });

  it("shows the progress bar at 0%", () => {
    renderPage();
    expect(screen.getByText(/0\/455/)).toBeInTheDocument();
  });

  describe("Accordion – Step headers", () => {
    it("renders all step headers on one page", () => {
      renderPage();
      const accordion = screen.getByTestId("steps-accordion");
      expect(accordion).toBeInTheDocument();
      expect(screen.getByText("Learn the basics")).toBeInTheDocument();
      expect(screen.getByText("Learn Important Sorting Techniques")).toBeInTheDocument();
      expect(screen.getByText(/Solve Problems on Arrays/)).toBeInTheDocument();
    });

    it("shows progress count on each step header", () => {
      renderPage();
      const step1 = screen.getByLabelText(/Step 1: Learn the basics/);
      expect(step1).toHaveTextContent(/0\/\d+/);
    });

    it("all steps are collapsed by default", () => {
      renderPage();
      expect(screen.queryByTestId("step-1-subtopics")).not.toBeInTheDocument();
      expect(screen.queryByText("User Input / Output")).not.toBeInTheDocument();
    });
  });

  describe("Accordion – Expanding steps", () => {
    it("clicking a step expands its subtopics", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      expect(screen.getByTestId("step-1-subtopics")).toBeInTheDocument();
      expect(
        screen.getByText("Things to Know in C++/Java/Python or any language"),
      ).toBeInTheDocument();
      expect(screen.getByText("Build-up Logical Thinking")).toBeInTheDocument();
    });

    it("clicking an expanded step collapses it", async () => {
      const user = userEvent.setup();
      renderPage();
      const stepBtn = screen.getByLabelText(/Step 1: Learn the basics/);
      await user.click(stepBtn);
      expect(screen.getByTestId("step-1-subtopics")).toBeInTheDocument();
      await user.click(stepBtn);
      expect(screen.queryByTestId("step-1-subtopics")).not.toBeInTheDocument();
    });

    it("multiple steps can be open simultaneously", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText(/Step 2: Learn Important Sorting Techniques/));
      expect(screen.getByTestId("step-1-subtopics")).toBeInTheDocument();
      expect(screen.getByTestId("step-2-subtopics")).toBeInTheDocument();
    });
  });

  describe("Accordion – Expanding subtopics (problems)", () => {
    it("clicking a subtopic reveals its problems table", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText("Things to Know in C++/Java/Python or any language"));
      expect(screen.getByText("User Input / Output")).toBeInTheDocument();
      expect(screen.getByText("Data Types")).toBeInTheDocument();
    });

    it("can check a problem as completed", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText("Things to Know in C++/Java/Python or any language"));
      const checkbox = screen.getByLabelText("Mark User Input / Output as completed");
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(screen.getByText(/1\/455/)).toBeInTheDocument();
    });

    it("shows difficulty labels with color", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText("Things to Know in C++/Java/Python or any language"));
      const easyElements = screen.getAllByText("Easy");
      expect(easyElements.length).toBeGreaterThan(0);
    });

    it("renders a Resource notes link for each problem", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText("Things to Know in C++/Java/Python or any language"));
      const link = screen.getByLabelText("Open course material for User Input / Output");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dsa-sheet/problem/1-user-input-output");
    });

    it("clicking a subtopic again collapses the problems", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      const subBtn = screen.getByLabelText("Things to Know in C++/Java/Python or any language");
      await user.click(subBtn);
      expect(screen.getByText("User Input / Output")).toBeInTheDocument();
      await user.click(subBtn);
      expect(screen.queryByText("User Input / Output")).not.toBeInTheDocument();
    });
  });

  describe("Multi-language link dropdown", () => {
    const expandToProblems = async (user) => {
      await user.click(screen.getByLabelText(/Step 1: Learn the basics/));
      await user.click(screen.getByLabelText("Things to Know in C++/Java/Python or any language"));
    };

    it("renders a dropdown badge for problems with language-specific links", async () => {
      const user = userEvent.setup();
      renderPage();
      await expandToProblems(user);
      const gfgDropdown = screen.getByLabelText("GeeksforGeeks language links");
      expect(gfgDropdown).toBeInTheDocument();
      expect(gfgDropdown).toHaveTextContent("GFG");
      expect(gfgDropdown).toHaveTextContent("▾");
    });

    it("clicking the dropdown badge reveals language options", async () => {
      const user = userEvent.setup();
      renderPage();
      await expandToProblems(user);
      const gfgDropdown = screen.getByLabelText("GeeksforGeeks language links");
      expect(screen.queryByText("C++")).not.toBeInTheDocument();
      await user.click(gfgDropdown);
      expect(screen.getByRole("link", { name: "C++" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Java" })).toBeInTheDocument();
    });

    it("clicking the dropdown badge again closes it", async () => {
      const user = userEvent.setup();
      renderPage();
      await expandToProblems(user);
      const gfgDropdown = screen.getByLabelText("GeeksforGeeks language links");
      await user.click(gfgDropdown);
      expect(screen.getByRole("link", { name: "C++" })).toBeInTheDocument();
      await user.click(gfgDropdown);
      expect(screen.queryByRole("link", { name: "C++" })).not.toBeInTheDocument();
    });

    it("language links open in a new tab", async () => {
      const user = userEvent.setup();
      renderPage();
      await expandToProblems(user);
      await user.click(screen.getByLabelText("GeeksforGeeks language links"));
      const cppLink = screen.getByRole("link", { name: "C++" });
      expect(cppLink).toHaveAttribute("target", "_blank");
      expect(cppLink).toHaveAttribute("rel", "noopener noreferrer");
      expect(cppLink).toHaveAttribute(
        "href",
        "https://www.geeksforgeeks.org/problems/c-input-output2432/1",
      );
    });
  });
});
