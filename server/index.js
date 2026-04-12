import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "AlgoJourney API is running" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
