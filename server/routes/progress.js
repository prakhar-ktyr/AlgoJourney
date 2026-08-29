import { Router } from "express";
import { User } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/progress — return the authenticated user's DSA progress
// ---------------------------------------------------------------------------

router.get("/", authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select("completedDSASlugs");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ completedSlugs: user.completedDSASlugs });
});

// ---------------------------------------------------------------------------
// PUT /api/progress — replace the authenticated user's DSA progress
// ---------------------------------------------------------------------------

router.put("/", authenticate, async (req, res) => {
  const { completedSlugs } = req.body;

  if (!Array.isArray(completedSlugs)) {
    return res.status(400).json({ message: "completedSlugs must be an array" });
  }

  // Validate that every element is a non-empty string
  const valid = completedSlugs.every((s) => typeof s === "string" && s.length > 0);
  if (!valid) {
    return res.status(400).json({ message: "completedSlugs must contain only non-empty strings" });
  }

  // Deduplicate
  const uniqueSlugs = [...new Set(completedSlugs)];

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { completedDSASlugs: uniqueSlugs },
    { returnDocument: "after", runValidators: true },
  ).select("completedDSASlugs");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ completedSlugs: user.completedDSASlugs });
});

export default router;
