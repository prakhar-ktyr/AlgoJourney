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
    expect(
      screen.getByText("Striver's A2Z DSA Sheet"),
    ).toBeInTheDocument();
  });

  it("shows the progress bar at 0%", () => {
    renderPage();
    expect(screen.getByText(/0\/455/)).toBeInTheDocument();
  });

  it("renders step and difficulty filter dropdowns", () => {
    renderPage();
    expect(screen.getByLabelText("Filter by step")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by difficulty")).toBeInTheDocument();
  });

  it("renders problems from the Striver sheet in the table", () => {
    renderPage();
    expect(screen.getByText("User Input / Output")).toBeInTheDocument();
  });

  it("shows difficulty labels with color", () => {
    renderPage();
    const easyElements = screen.getAllByText("Easy");
    expect(easyElements.length).toBeGreaterThan(0);
  });

  it("can check a problem as completed", async () => {
    const user = userEvent.setup();
    renderPage();
    const checkbox = screen.getByLabelText(
      "Mark User Input / Output as completed",
    );
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText(/1\/455/)).toBeInTheDocument();
  });

  it("can filter by difficulty", async () => {
    const user = userEvent.setup();
    renderPage();
    const diffSelect = screen.getByLabelText("Filter by difficulty");
    await user.selectOptions(diffSelect, "Hard");
    // Basic problem shouldn't show under Hard
    expect(
      screen.queryByText("User Input / Output"),
    ).not.toBeInTheDocument();
  });

  it("shows empty message when no problems match filter", async () => {
    const user = userEvent.setup();
    renderPage();
    // Select a step + difficulty combo that yields no results
    const stepSelect = screen.getByLabelText("Filter by step");
    await user.selectOptions(stepSelect, "1");
    const diffSelect = screen.getByLabelText("Filter by difficulty");
    await user.selectOptions(diffSelect, "Hard");
    expect(
      screen.getByText("No problems match the selected filters."),
    ).toBeInTheDocument();
  });
});
