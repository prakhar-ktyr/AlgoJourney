import { useState } from "react";
import STRIVERS_SHEET from "../data/striversSheet";

const DIFF_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

/** Flatten all problems for total count / progress */
function flattenProblems(sheet) {
  const list = [];
  for (const step of sheet) {
    for (const sub of step.subSteps) {
      for (const p of sub.problems) {
        list.push(p);
      }
    }
  }
  return list;
}

/** Count completed problems in a step */
function countStepCompleted(step, completed) {
  let count = 0;
  for (const sub of step.subSteps) {
    for (const p of sub.problems) {
      if (completed.has(p.id)) count++;
    }
  }
  return count;
}

/** Count total problems in a step */
function countStepProblems(step) {
  return step.subSteps.reduce((acc, sub) => acc + sub.problems.length, 0);
}

const ALL_PROBLEMS = flattenProblems(STRIVERS_SHEET);

export default function DSASheetPage() {
  const [openSteps, setOpenSteps] = useState(new Set());
  const [openSubSteps, setOpenSubSteps] = useState(new Set());
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem("dsa-sheet-completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleStep = (stepNo) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNo)) next.delete(stepNo);
      else next.add(stepNo);
      return next;
    });
  };

  const toggleSubStep = (key) => {
    setOpenSubSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCompleted = (id) => {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">A2Z DSA Sheet</h1>
      <p className="text-gray-400 mb-8">
        {ALL_PROBLEMS.length} curated problems organized topic-wise — from
        basics to advanced. Expand each topic to explore subtopics and problems.
        Track your progress as you go.
      </p>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Overall Progress</span>
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

      {/* Accordion — all steps */}
      <div className="space-y-3" data-testid="steps-accordion">
        {STRIVERS_SHEET.map((step) => {
          const isStepOpen = openSteps.has(step.stepNo);
          const stepTotal = countStepProblems(step);
          const stepDone = countStepCompleted(step, completed);
          const stepPct =
            stepTotal > 0 ? Math.round((stepDone / stepTotal) * 100) : 0;

          return (
            <div
              key={step.stepNo}
              className="rounded-xl border border-gray-800 overflow-hidden"
            >
              {/* Step header */}
              <button
                onClick={() => toggleStep(step.stepNo)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-gray-900/60 hover:bg-gray-900 transition text-left"
                aria-expanded={isStepOpen}
                aria-label={`Step ${step.stepNo}: ${step.stepTitle}`}
              >
                <span
                  className={`text-gray-400 transition-transform duration-200 ${isStepOpen ? "rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  ▶
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-indigo-400 font-medium shrink-0">
                      Step {step.stepNo}
                    </span>
                    <h2 className="text-white font-semibold text-sm truncate">
                      {step.stepTitle}
                    </h2>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden max-w-xs">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${stepPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">
                      {stepDone}/{stepTotal}
                    </span>
                  </div>
                </div>
              </button>

              {/* Subtopics (expanded) */}
              {isStepOpen && (
                <div
                  className="border-t border-gray-800"
                  data-testid={`step-${step.stepNo}-subtopics`}
                >
                  {step.subSteps.map((sub) => {
                    const subKey = `${step.stepNo}-${sub.subStepNo}`;
                    const isSubOpen = openSubSteps.has(subKey);
                    const subDone = sub.problems.filter((p) =>
                      completed.has(p.id),
                    ).length;
                    const subTotal = sub.problems.length;

                    return (
                      <div key={sub.subStepNo}>
                        {/* Subtopic header */}
                        <button
                          onClick={() => toggleSubStep(subKey)}
                          className="w-full flex items-center gap-4 px-5 py-3 pl-10 bg-gray-900/30 hover:bg-gray-900/50 transition text-left border-t border-gray-800/60 first:border-t-0"
                          aria-expanded={isSubOpen}
                          aria-label={sub.subStepTitle}
                        >
                          <span
                            className={`text-gray-500 text-xs transition-transform duration-200 ${isSubOpen ? "rotate-90" : ""}`}
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-300 text-sm truncate">
                              {sub.subStepTitle}
                            </h3>
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">
                            {subDone}/{subTotal}
                          </span>
                        </button>

                        {/* Problems table */}
                        {isSubOpen && (
                          <div className="bg-gray-950/40">
                            <table
                              className="w-full text-sm"
                              data-testid={`substep-${subKey}-problems`}
                            >
                              <thead>
                                <tr className="text-gray-500 text-left text-xs">
                                  <th className="px-5 py-2 pl-14 w-10">✓</th>
                                  <th className="px-3 py-2">Problem</th>
                                  <th className="px-3 py-2">Difficulty</th>
                                  <th className="px-3 py-2 text-center">
                                    Links
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sub.problems.map((p) => (
                                  <tr
                                    key={p.id}
                                    className="border-t border-gray-800/40 hover:bg-gray-900/30 transition"
                                  >
                                    <td className="px-5 py-2.5 pl-14">
                                      <input
                                        type="checkbox"
                                        checked={completed.has(p.id)}
                                        onChange={() => toggleCompleted(p.id)}
                                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                        aria-label={`Mark ${p.title} as completed`}
                                      />
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span
                                        className={
                                          completed.has(p.id)
                                            ? "line-through text-gray-500"
                                            : "text-white"
                                        }
                                      >
                                        {p.title}
                                      </span>
                                    </td>
                                    <td
                                      className={`px-3 py-2.5 font-medium ${DIFF_COLORS[p.difficulty]}`}
                                    >
                                      {p.difficulty}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
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
                                          <span className="text-gray-600 text-xs">
                                            —
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
