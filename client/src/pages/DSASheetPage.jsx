import { useState, useMemo } from "react";

const DSA_TOPICS = [
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
  "BFS & DFS",
  "Shortest Path",
  "Topological Sort",
  "Minimum Spanning Tree",
  "Segment Trees",
  "Fenwick Trees",
  "Math & Number Theory",
  "Combinatorics",
  "Geometry",
  "Linear Algebra",
  "Probability & Statistics",
  "Calculus & Optimization",
  "Mathematics for ML",
];

/** Placeholder data — will be replaced with API data */
const SAMPLE_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/two-sum",
  },
  {
    id: 2,
    title: "Best Time to Buy and Sell Stock",
    topic: "Arrays",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock",
  },
  {
    id: 3,
    title: "Valid Parentheses",
    topic: "Stacks",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/valid-parentheses",
  },
  {
    id: 4,
    title: "Merge Two Sorted Lists",
    topic: "Linked Lists",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/merge-two-sorted-lists",
  },
  {
    id: 5,
    title: "Binary Tree Inorder Traversal",
    topic: "Trees",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/binary-tree-inorder-traversal",
  },
  {
    id: 6,
    title: "Longest Substring Without Repeating Characters",
    topic: "Sliding Window",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters",
  },
  {
    id: 7,
    title: "3Sum",
    topic: "Two Pointers",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/3sum",
  },
  {
    id: 8,
    title: "LRU Cache",
    topic: "Hash Tables",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/lru-cache",
  },
  {
    id: 9,
    title: "Number of Islands",
    topic: "BFS & DFS",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/number-of-islands",
  },
  {
    id: 10,
    title: "Coin Change",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/coin-change",
  },
  {
    id: 11,
    title: "Trapping Rain Water",
    topic: "Two Pointers",
    difficulty: "Hard",
    url: "https://leetcode.com/problems/trapping-rain-water",
  },
  {
    id: 12,
    title: "Median of Two Sorted Arrays",
    topic: "Binary Search",
    difficulty: "Hard",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays",
  },
];

const DIFF_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

export default function DSASheetPage() {
  const [topicFilter, setTopicFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [completed, setCompleted] = useState(() => new Set());

  const filtered = useMemo(() => {
    return SAMPLE_PROBLEMS.filter((p) => {
      if (topicFilter !== "All" && p.topic !== topicFilter) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      return true;
    });
  }, [topicFilter, diffFilter]);

  const toggle = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress =
    SAMPLE_PROBLEMS.length > 0
      ? Math.round((completed.size / SAMPLE_PROBLEMS.length) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">DSA Tracking Sheet</h1>
      <p className="text-gray-400 mb-8">
        Curated problems organized by topic and difficulty. Track your progress
        as you go.
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">
            {completed.size}/{SAMPLE_PROBLEMS.length} ({progress}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          aria-label="Filter by topic"
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Topics</option>
          {DSA_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          aria-label="Filter by difficulty"
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/80 text-gray-400 text-left">
              <th className="p-3 w-10">✓</th>
              <th className="p-3">Problem</th>
              <th className="p-3 hidden sm:table-cell">Topic</th>
              <th className="p-3">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-800 hover:bg-gray-900/40 transition"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={completed.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    aria-label={`Mark ${p.title} as completed`}
                  />
                </td>
                <td className="p-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-indigo-400 transition ${completed.has(p.id) ? "line-through text-gray-500" : "text-white"}`}
                  >
                    {p.title}
                  </a>
                </td>
                <td className="p-3 hidden sm:table-cell text-gray-400">
                  {p.topic}
                </td>
                <td className={`p-3 font-medium ${DIFF_COLORS[p.difficulty]}`}>
                  {p.difficulty}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No problems match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
