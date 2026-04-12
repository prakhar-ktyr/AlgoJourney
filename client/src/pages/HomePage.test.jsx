import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe("HomePage", () => {
  it("renders the hero heading", () => {
    renderPage();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    renderPage();
    expect(screen.getByLabelText("Search tutorials")).toBeInTheDocument();
  });

  it("renders the Browse All Tutorials banner", () => {
    renderPage();
    expect(screen.getByText("Browse All Tutorials")).toBeInTheDocument();
  });

  it("renders the DSA Tracking Sheet banner", () => {
    renderPage();
    expect(screen.getByText("DSA Tracking Sheet")).toBeInTheDocument();
  });

  it("renders all 8 category group headings", () => {
    renderPage();
    const groups = [
      "Programming Languages",
      "Web Development",
      "Core CS Theory",
      "Systems & Infrastructure",
      "Databases",
      "AI, ML & Data Science",
      "Emerging Topics",
    ];
    for (const group of groups) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
    // "Software Engineering" appears as both group name and topic card
    expect(
      screen.getAllByText("Software Engineering").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders topic cards (e.g. Python, React, SQL)", () => {
    renderPage();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
  });

  it("topic cards are links to /tutorials/:slug", () => {
    renderPage();
    const pythonLink = screen.getByText("Python").closest("a");
    expect(pythonLink).toHaveAttribute("href", "/tutorials/python");
  });
});
