import { useState, useMemo } from "react";
import STRIVERS_SHEET from "../data/striversSheet";

const DIFF_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

/** Flatten all problems for filtering / progress tracking */
function flattenProblems(sheet) {
  const list = [];
  for (const step of sheet) {
    for (const sub of step.subSteps) {
      for (const p of sub.problems) {
        list.push({
          ...p,
          stepNo: step.stepNo,
          stepTitle: step.stepTitle,
          subStepTitle: sub.subStepTitle,
        });
      }
    }
  }
  return list;
}

const ALL_PROBLEMS = flattenProblems(STRIVERS_SHEET);

export default function DSASheetPage() {
  const [stepFilter, setStepFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem("dsa-sheet-completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const filtered = useMemo(() => {
    return ALL_PROBLEMS.filter((p) => {
      if (stepFilter !== "All" && String(p.stepNo) !== stepFilter) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      return true;
    });
  }, [stepFilter, diffFilter]);

  const toggle = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("dsa-sheet-completed", JSON.stringify([...next]));
      return next;
    });
  };

  const progress =
    ALL_PROBLEMS.length > 0
      ? Math.round((completed.size / ALL_PROBLEMS.length) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">
        Striver&apos;s A2Z DSA Sheet
      </h1>
      <p className="text-gray-400 mb-8">
        All 455 problems from Striver&apos;s A2Z DSA Course Sheet with LeetCode
        &amp; GFG links. Track your progress as you go.
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">
            {completed.size}/{ALL_PROBLEMS.length} ({progress}%)
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
          value={stepFilter}
          onChange={(e) => setStepFilter(e.target.value)}
          aria-label="Filter by step"
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Steps</option>
          {STRIVERS_SHEET.map((s) => (
            <option key={s.stepNo} value={String(s.stepNo)}>
              Step {s.stepNo}: {s.stepTitle}
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
              <th className="p-3">#</th>
              <th className="p-3">Problem</th>
              <th className="p-3 hidden md:table-cell">Step / Topic</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3 text-center">Links</th>
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
                <td className="p-3 text-gray-500">{p.id}</td>
                <td className="p-3">
                  <span
                    className={`${completed.has(p.id) ? "line-through text-gray-500" : "text-white"}`}
                  >
                    {p.title}
                  </span>
                </td>
                <td className="p-3 hidden md:table-cell text-gray-400 text-xs">
                  <div>{p.stepTitle}</div>
                  <div className="text-gray-600">{p.subStepTitle}</div>
                </td>
                <td
                  className={`p-3 font-medium ${DIFF_COLORS[p.difficulty]}`}
                >
                  {p.difficulty}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {p.lcLink && (
                      <a
                        href={p.lcLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-400 hover:bg-amber-900/70 transition"
                        title="LeetCode"
                      >
                        LC
                      </a>
                    )}
                    {p.gfgLink && (
                      <a
                        href={p.gfgLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-400 hover:bg-green-900/70 transition"
                        title="GeeksforGeeks"
                      >
                        GFG
                      </a>
                    )}
                    {!p.lcLink && !p.gfgLink && (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
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
