import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TopicPage from "./TopicPage";

const renderPage = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/tutorials/${slug}`]}>
      <Routes>
        <Route path="/tutorials/:slug" element={<TopicPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("TopicPage", () => {
  it("renders topic name for a valid slug", () => {
    renderPage("python");
    expect(screen.getByRole("heading", { name: "Python" })).toBeInTheDocument();
    expect(screen.getByText("Programming Languages")).toBeInTheDocument();
  });

  it("shows coming soon message", () => {
    renderPage("python");
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("has a back link to tutorials", () => {
    renderPage("python");
    expect(screen.getByText("← All tutorials")).toHaveAttribute(
      "href",
      "/tutorials",
    );
  });

  it("renders 404-like message for unknown slug", () => {
    renderPage("nonexistent-xyz");
    expect(screen.getByText("Topic Not Found")).toBeInTheDocument();
  });

  it("shows link to browse all tutorials on 404", () => {
    renderPage("nonexistent-xyz");
    expect(screen.getByText("Browse all tutorials")).toHaveAttribute(
      "href",
      "/tutorials",
    );
  });
});
