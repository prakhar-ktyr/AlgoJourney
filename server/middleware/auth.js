import jwt from "jsonwebtoken";

/**
 * Express middleware that verifies the access token from an HttpOnly cookie.
 * On success, attaches `req.user = { id, role }` to the request.
 *
 * Responds with:
 *  - 401 if no token is present
 *  - 403 if the token is expired (signals the client to refresh)
 *  - 401 if the token is invalid
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Optional middleware: restricts access to users with the "admin" role.
 * Must be used AFTER `authenticate`.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
