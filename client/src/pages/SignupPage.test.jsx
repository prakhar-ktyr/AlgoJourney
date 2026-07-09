import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SignupPage from "./SignupPage";

// ---------------------------------------------------------------------------
// Mock AuthContext
// ---------------------------------------------------------------------------

const mockSignup = vi.fn();
const mockUseAuth = vi.fn(() => ({
  user: null,
  loading: false,
  login: vi.fn(),
  signup: mockSignup,
  logout: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: (...args) => mockUseAuth(...args),
}));

// ---------------------------------------------------------------------------

function renderSignup(initialEntries = ["/signup"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SignupPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: vi.fn(),
    signup: mockSignup,
    logout: vi.fn(),
  });
});

describe("SignupPage", () => {
  it("renders the signup form", () => {
    renderSignup();

    expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    renderSignup();

    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows error when username is empty", async () => {
    renderSignup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/username is required/i);
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("shows error when username is too short", async () => {
    renderSignup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), "ab");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 3 characters/i);
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    renderSignup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), "testuser");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 8 characters/i);
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("calls signup with correct values", async () => {
    mockSignup.mockResolvedValue({ username: "testuser" });
    renderSignup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), "testuser");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockSignup).toHaveBeenCalledWith("testuser", "test@example.com", "Password123!");
  });

  it("displays server error on signup failure", async () => {
    mockSignup.mockRejectedValue(new Error("Email already exists"));
    renderSignup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), "testuser");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email already exists/i);
  });
});
