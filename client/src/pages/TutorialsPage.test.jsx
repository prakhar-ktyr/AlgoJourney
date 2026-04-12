import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TutorialsPage from "./TutorialsPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <TutorialsPage />
    </MemoryRouter>,
  );

describe("TutorialsPage", () => {
  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("All Tutorials")).toBeInTheDocument();
  });

  it("shows the topic count", () => {
    renderPage();
    expect(screen.getByText(/topics across.*categories/)).toBeInTheDocument();
  });

  it("renders a filter input", () => {
    renderPage();
    expect(screen.getByLabelText("Filter topics")).toBeInTheDocument();
  });

  it("shows all categories by default", () => {
    renderPage();
    expect(screen.getByText("Programming Languages")).toBeInTheDocument();
    expect(screen.getByText("Databases")).toBeInTheDocument();
  });

  it("filters topics when typing", async () => {
    const user = userEvent.setup();
    renderPage();
    const input = screen.getByLabelText("Filter topics");
    await user.type(input, "python");
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.queryByText("SQL")).not.toBeInTheDocument();
  });

  it("shows no-match message when filter returns nothing", async () => {
    const user = userEvent.setup();
    renderPage();
    const input = screen.getByLabelText("Filter topics");
    await user.type(input, "xyznonexistent");
    expect(
      screen.getByText("No topics match your filter."),
    ).toBeInTheDocument();
  });
});
