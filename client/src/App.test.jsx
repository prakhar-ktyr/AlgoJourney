import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

const renderApp = (route = "/") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );

describe("App routing & layout", () => {
  it("renders without crashing", () => {
    renderApp();
  });

  it("shows Navbar on every page", () => {
    renderApp();
    expect(screen.getByRole("link", { name: /Journey/i })).toBeInTheDocument();
  });

  it("shows Footer on every page", () => {
    renderApp();
    expect(screen.getByText(/AlgoJourney\. Learn CS/)).toBeInTheDocument();
  });

  it("renders HomePage at /", () => {
    renderApp("/");
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByLabelText("Search tutorials")).toBeInTheDocument();
  });

  it("renders TutorialsPage at /tutorials", () => {
    renderApp("/tutorials");
    expect(screen.getByText("All Tutorials")).toBeInTheDocument();
  });

  it("renders DSASheetPage at /dsa-sheet", () => {
    renderApp("/dsa-sheet");
    expect(screen.getByText("DSA Tracking Sheet")).toBeInTheDocument();
  });

  it("renders AboutPage at /about", () => {
    renderApp("/about");
    expect(screen.getByText("About AlgoJourney")).toBeInTheDocument();
  });

  it("renders NotFoundPage for unknown routes", () => {
    renderApp("/xyz-unknown");
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
