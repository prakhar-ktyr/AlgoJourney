import mongoose from "mongoose";

/**
 * DSA topics covering the full spectrum — classic DSA plus math topics
 * commonly tested in coding interviews and ML prep.
 */
export const DSA_TOPICS = [
  // Classic data structures
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Hash Tables",
  "Trees",
  "Binary Search Trees",
  "Heaps",
  "Tries",
  "Graphs",
  "Disjoint Sets",

  // Algorithm paradigms
  "Sorting",
  "Searching",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Recursion",
  "Backtracking",
  "Divide and Conquer",
  "Greedy",
  "Dynamic Programming",
  "Bit Manipulation",

  // Graph algorithms
  "BFS & DFS",
  "Shortest Path",
  "Topological Sort",
  "Minimum Spanning Tree",

  // Advanced
  "Segment Trees",
  "Fenwick Trees",
  "Math & Number Theory",
  "Combinatorics",
  "Geometry",

  // ML-adjacent math
  "Linear Algebra",
  "Probability & Statistics",
  "Calculus & Optimization",
  "Mathematics for ML",
];

const dsaQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    topic: {
      type: String,
      required: true,
      enum: DSA_TOPICS,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    problemUrl: {
      type: String,
      required: true,
      trim: true,
    },
    // Extra fields for a richer tracker
    description: {
      type: String,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      default: [],
    },
    companies: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    solutionApproaches: {
      type: [String],
      default: [],
    },
    orderIndex: {
      type: Number,
      default: 0,
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

dsaQuestionSchema.index({ topic: 1, orderIndex: 1 });
dsaQuestionSchema.index({ difficulty: 1 });
dsaQuestionSchema.index({ tags: 1 });
dsaQuestionSchema.index({ published: 1 });

const DSAQuestion = mongoose.model("DSAQuestion", dsaQuestionSchema);
export default DSAQuestion;
