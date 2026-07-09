import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginPage from "./LoginPage";

// ---------------------------------------------------------------------------
// Mock AuthContext
// ---------------------------------------------------------------------------

const mockLogin = vi.fn();
const mockUseAuth = vi.fn(() => ({
  user: null,
  loading: false,
  login: mockLogin,
  signup: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

// ---------------------------------------------------------------------------

function renderLogin(initialEntries = ["/login"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: mockLogin,
    signup: vi.fn(),
    logout: vi.fn(),
  });
});

describe("LoginPage", () => {
  it("renders the login form", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders link to signup page", () => {
    renderLogin();

    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("shows validation error when fields are empty", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/email and password are required/i);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login with correct credentials", async () => {
    mockLogin.mockResolvedValue({ username: "testuser" });
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "Password123!");
  });

  it("displays server error message on login failure", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid email or password"));
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid email or password/i);
  });
});
