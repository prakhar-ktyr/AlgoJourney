import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

// Mock AuthContext — tests run as logged-out user
vi.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock api module to prevent real network calls from DSASheetPage
vi.mock("./lib/api", () => ({
  apiFetch: vi.fn().mockResolvedValue({ ok: false }),
  apiJson: vi.fn().mockResolvedValue({ ok: true }),
  apiUrl: vi.fn((p) => `/api${p}`),
}));

const renderApp = (route = "/") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
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
    expect(screen.getByText("A2Z DSA Sheet")).toBeInTheDocument();
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
