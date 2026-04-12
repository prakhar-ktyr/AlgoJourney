import mongoose from "mongoose";

/**
 * Full list of categories covering end-to-end CS topics (W3Schools breadth).
 * Grouped logically:
 *   - Programming fundamentals & languages
 *   - Core CS theory
 *   - Systems & infrastructure
 *   - Data & databases
 *   - Web & mobile development
 *   - AI / ML / Data Science
 *   - Software engineering practices
 *   - Specialised / emerging
 */
export const TUTORIAL_CATEGORIES = [
  // Programming fundamentals
  "Programming Fundamentals",
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",

  // Core CS theory
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Discrete Mathematics",
  "Theory of Computation",
  "Compiler Design",
  "Computer Architecture",

  // Systems & infrastructure
  "Operating Systems",
  "Computer Networks",
  "Distributed Systems",
  "Cloud Computing",
  "DevOps & CI/CD",
  "Cybersecurity",
  "Linux & Shell Scripting",

  // Data & databases
  "Database Management Systems",
  "SQL",
  "NoSQL & MongoDB",

  // Web & mobile development
  "HTML",
  "CSS",
  "React",
  "Node.js",
  "Next.js",
  "Web APIs & REST",
  "GraphQL",
  "Mobile Development",

  // AI / ML / Data Science
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Data Science & Analytics",
  "Mathematics for ML",

  // Software engineering
  "System Design",
  "Design Patterns",
  "Software Engineering",
  "Testing & QA",
  "Git & Version Control",

  // Specialised / emerging
  "Blockchain",
  "Quantum Computing",
];

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe kebab-case"],
    },
    category: {
      type: String,
      required: true,
      enum: TUTORIAL_CATEGORIES,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    markdownContent: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: {
      type: [String],
      default: [],
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedMinutes: {
      type: Number,
      min: 1,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutorial",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: list tutorials within a category in order
tutorialSchema.index({ category: 1, orderIndex: 1 });
tutorialSchema.index({ slug: 1 });
tutorialSchema.index({ tags: 1 });
tutorialSchema.index({ published: 1 });

const Tutorial = mongoose.model("Tutorial", tutorialSchema);
export default Tutorial;
