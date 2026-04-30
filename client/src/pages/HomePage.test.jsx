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
    // "AI" appears in the hero copy and as a topic-card monogram badge,
    // so just assert at least one occurrence rather than uniqueness.
    expect(screen.getAllByText("AI").length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getAllByText("Software Engineering").length).toBeGreaterThanOrEqual(1);
  });

  it("renders topic cards (e.g. Python, React, SQL)", () => {
    renderPage();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    // "SQL" is both the topic name and the monogram label on its logo,
    // so multiple matches are expected — assert presence, not uniqueness.
    expect(screen.getAllByText("SQL").length).toBeGreaterThanOrEqual(1);
  });

  it("topic cards are links to /tutorials/:slug", () => {
    renderPage();
    const pythonLink = screen.getByText("Python").closest("a");
    expect(pythonLink).toHaveAttribute("href", "/tutorials/python");
  });
});
