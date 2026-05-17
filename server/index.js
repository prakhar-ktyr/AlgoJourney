import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import healthRoutes from "./routes/health.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "http://localhost:3000",
  }),
);
app.use(express.json());

// MongoDB connection
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.use("/api/health", healthRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
