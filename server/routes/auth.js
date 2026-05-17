import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Set HttpOnly auth cookies on the response.
 *
 * - accessToken: short-lived, sent on every request
 * - refreshToken: long-lived, sent only to /api/auth/refresh
 */
function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateSignupInput(body) {
  const errors = [];
  const { username, email, password } = body;

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  } else {
    const trimmed = username.trim();
    if (trimmed.length < 3) errors.push("Username must be at least 3 characters");
    if (trimmed.length > 30) errors.push("Username must be at most 30 characters");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push("Please enter a valid email");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  return errors;
}

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------

router.post("/signup", async (req, res) => {
  const errors = validateSignupInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const { username, email, password } = req.body;

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: email.trim().toLowerCase() }, { username: username.trim() }],
  });

  if (existingUser) {
    const field = existingUser.email === email.trim().toLowerCase() ? "Email" : "Username";
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    username: username.trim(),
    email: email.trim(),
    passwordHash,
  });

  // Issue tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({ user });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user — passwordHash is included in queries, only stripped by toJSON
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Issue tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({ user });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

router.post("/logout", authenticate, (_req, res) => {
  clearAuthCookies(res);
  res.json({ message: "Logged out" });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------

router.post("/refresh", (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Issue a new access token
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role ?? "user" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
});

export default router;
