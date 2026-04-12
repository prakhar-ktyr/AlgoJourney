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
    expect(screen.getByText("DSA Tracking Sheet")).toBeInTheDocument();
  });

  it("shows the progress bar at 0%", () => {
    renderPage();
    expect(screen.getByText(/0\/12/)).toBeInTheDocument();
  });

  it("renders topic and difficulty filter dropdowns", () => {
    renderPage();
    expect(screen.getByLabelText("Filter by topic")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by difficulty")).toBeInTheDocument();
  });

  it("renders sample problems in the table", () => {
    renderPage();
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("LRU Cache")).toBeInTheDocument();
  });

  it("shows difficulty labels with color", () => {
    renderPage();
    const easyElements = screen.getAllByText("Easy");
    expect(easyElements.length).toBeGreaterThan(0);
  });

  it("can check a problem as completed", async () => {
    const user = userEvent.setup();
    renderPage();
    const checkbox = screen.getByLabelText("Mark Two Sum as completed");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText(/1\/12/)).toBeInTheDocument();
  });

  it("can filter by difficulty", async () => {
    const user = userEvent.setup();
    renderPage();
    const diffSelect = screen.getByLabelText("Filter by difficulty");
    await user.selectOptions(diffSelect, "Hard");
    expect(screen.getByText("Trapping Rain Water")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("shows empty message when no problems match filter", async () => {
    const user = userEvent.setup();
    renderPage();
    const topicSelect = screen.getByLabelText("Filter by topic");
    await user.selectOptions(topicSelect, "Fenwick Trees");
    expect(
      screen.getByText("No problems match the selected filters."),
    ).toBeInTheDocument();
  });
});
