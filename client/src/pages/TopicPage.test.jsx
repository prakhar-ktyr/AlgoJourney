import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TopicPage from "./TopicPage";

const renderPage = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutorials/:slug" element={<TopicPage />} />
        <Route path="/tutorials/:slug/:lessonSlug" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("TopicPage — coming-soon topic", () => {
  it("renders topic name for a valid slug", () => {
    renderPage("/tutorials/javascript");
    expect(screen.getByRole("heading", { name: "JavaScript" })).toBeInTheDocument();
    expect(screen.getByText("Programming Languages")).toBeInTheDocument();
  });

  it("shows coming soon message when no course exists", () => {
    renderPage("/tutorials/javascript");
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("has a back link to tutorials", () => {
    renderPage("/tutorials/javascript");
    expect(screen.getByText("← All tutorials")).toHaveAttribute("href", "/tutorials");
  });

  it("renders 404-like message for unknown slug", () => {
    renderPage("/tutorials/nonexistent-xyz");
    expect(screen.getByText("Topic Not Found")).toBeInTheDocument();
  });

  it("shows link to browse all tutorials on 404", () => {
    renderPage("/tutorials/nonexistent-xyz");
    expect(screen.getByText("Browse all tutorials")).toHaveAttribute("href", "/tutorials");
  });
});

describe("TopicPage — C course", () => {
  it("renders the course landing page (first lesson) at /tutorials/c", () => {
    renderPage("/tutorials/c");
    expect(screen.getByRole("heading", { level: 1, name: "C Tutorial" })).toBeInTheDocument();
    const navItems = screen.getAllByRole("link");
    expect(navItems.length).toBeGreaterThan(10);
  });

  it("renders a specific lesson by slug", () => {
    renderPage("/tutorials/c/c-pointers");
    expect(screen.getByRole("heading", { name: /C Pointers/ })).toBeInTheDocument();
  });

  it("shows a Lesson Not Found page for an unknown lesson slug", () => {
    renderPage("/tutorials/c/no-such-lesson");
    expect(screen.getByText("Lesson Not Found")).toBeInTheDocument();
  });
});
