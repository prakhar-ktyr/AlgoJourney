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

describe("TopicPage — coming-soon / not-found topics", () => {
  it("renders 404-like message for unknown slug", () => {
    renderPage("/tutorials/nonexistent-xyz");
    expect(screen.getByText("Topic Not Found")).toBeInTheDocument();
  });

  it("shows link to browse all tutorials on 404", () => {
    renderPage("/tutorials/nonexistent-xyz");
    expect(screen.getByText("Browse all tutorials")).toHaveAttribute("href", "/tutorials");
  });
});

describe("TopicPage — Rust course", () => {
  it("renders the course landing page (first lesson) at /tutorials/rust", () => {
    renderPage("/tutorials/rust");
    const headings = screen.getAllByRole("heading", { name: /Rust Tutorial/ });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    const navItems = screen.getAllByRole("link");
    expect(navItems.length).toBeGreaterThan(10);
  });

  it("renders a specific lesson by slug", () => {
    renderPage("/tutorials/rust/rust-ownership");
    expect(screen.getByRole("heading", { name: /Rust Ownership/ })).toBeInTheDocument();
  });

  it("shows a Lesson Not Found page for an unknown lesson slug", () => {
    renderPage("/tutorials/rust/no-such-lesson");
    expect(screen.getByText("Lesson Not Found")).toBeInTheDocument();
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
