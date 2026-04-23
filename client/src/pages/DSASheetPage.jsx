import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import STRIVERS_SHEET from "../data/striversSheet";
import { problemSlug } from "../lib/slugify";

/* Compact platform icons (16×16 inline SVGs) */
const LCIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    className="inline-block"
  >
    <path
      fill="currentColor"
      d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l.257.213c.615.516 1.53.439 2.048-.174a1.384 1.384 0 0 0-.174-2.048l-.257-.213a5.304 5.304 0 0 0-1.951-1.074 5.46 5.46 0 0 0-2.24-.278H13.483zM19.063 7.832a1.38 1.38 0 0 0-.976.442l-5.084 5.133a1.384 1.384 0 0 0 .976 2.364c.367 0 .719-.15.976-.442l5.084-5.133a1.384 1.384 0 0 0-.976-2.364z"
    />
  </svg>
);

const GFGIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    className="inline-block"
  >
    <path
      fill="currentColor"
      d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.16-.677H17.2c.048.2.135.386.26.547.128.16.29.29.474.38.373.186.8.21 1.191.063a1.27 1.27 0 0 0 .466-.32c.12-.135.215-.294.28-.47a2.13 2.13 0 0 0 .123-.79V12h-.01a2.595 2.595 0 0 1-.936 1.057 2.722 2.722 0 0 1-1.485.42 3.266 3.266 0 0 1-1.407-.293 2.637 2.637 0 0 1-.98-.813 3.303 3.303 0 0 1-.559-1.2 5.503 5.503 0 0 1-.178-1.424c0-.488.063-.96.186-1.403a3.373 3.373 0 0 1 .563-1.186 2.736 2.736 0 0 1 .97-.811 2.857 2.857 0 0 1 1.392-.33c.543.007 1.07.176 1.514.485.224.16.418.358.57.585h.017V6.2h2.516v6.06a4.12 4.12 0 0 1-.2 1.345c-.003.007-.009.015-.012.022v-.013l.001.001zm-2.95-2.77c.182.249.39.34.68.34.29 0 .498-.091.68-.34.193-.274.29-.62.29-1.035 0-.413-.097-.76-.29-1.034-.182-.248-.39-.34-.68-.34-.29 0-.498.092-.68.34-.194.274-.29.62-.29 1.034 0 .414.096.761.29 1.035zM2.552 14.315a3.86 3.86 0 0 1-.564-.745 4.12 4.12 0 0 1-.2-1.345L1.786 6.2h2.516v.627h.017c.152-.226.346-.425.57-.585a2.857 2.857 0 0 1 1.514-.485 2.857 2.857 0 0 1 1.392.33c.39.214.72.49.97.811.26.34.452.734.563 1.186.123.443.186.915.186 1.403a5.503 5.503 0 0 1-.178 1.424 3.303 3.303 0 0 1-.559 1.2 2.637 2.637 0 0 1-.98.813 3.266 3.266 0 0 1-1.407.293 2.722 2.722 0 0 1-1.485-.42A2.595 2.595 0 0 1 4.97 12h-.01v.413c0 .28.04.547.123.79.065.176.16.335.28.47.13.133.29.24.466.32a1.489 1.489 0 0 0 1.19-.063 1.27 1.27 0 0 0 .475-.38c.125-.161.212-.347.26-.547h2.83a3.571 3.571 0 0 1-.16.677 3.79 3.79 0 0 1-2.134 2.078 4.51 4.51 0 0 1-3.118.016 3.691 3.691 0 0 1-1.103-.695 3.86 3.86 0 0 1-.566-.745l.001.001v-.013-.009zm2.95-2.77c.183.249.39.34.68.34.291 0 .499-.091.681-.34.193-.274.29-.62.29-1.035 0-.413-.097-.76-.29-1.034-.182-.248-.39-.34-.68-.34-.291 0-.498.092-.681.34-.193.274-.29.62-.29 1.034 0 .414.097.761.29 1.035z"
    />
  </svg>
);

const CNIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    className="inline-block"
  >
    <path
      fill="currentColor"
      d="M20.88 5.12 16.2.44a1.5 1.5 0 0 0-2.12 0L.44 14.08a1.5 1.5 0 0 0 0 2.12l4.68 4.68a1.5 1.5 0 0 0 2.12 0L20.88 7.24a1.5 1.5 0 0 0 0-2.12Zm-8.2 11.06-1.42-1.42 4.25-4.24 1.42 1.42-4.25 4.24Zm-3.54-3.54L7.72 11.22l4.24-4.25 1.42 1.42-4.24 4.25Z"
    />
  </svg>
);

const DIFF_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

/** Badge with a dropdown for language-specific links */
function MultiLinkBadge({ links, icon, label, className, title }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded transition cursor-pointer ${className}`}
        title={title}
        aria-expanded={open}
        aria-label={`${title} language links`}
      >
        {icon} {label} <span className="text-[10px] ml-0.5">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-gray-900 border border-gray-700 rounded shadow-lg min-w-[100px]">
          {Object.entries(links).map(([lang, url]) => (
            <a
              key={lang}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition first:rounded-t last:rounded-b"
            >
              {lang}
            </a>
          ))}
        </div>
      )}
    </span>
  );
}

/** Renders a platform link — handles both string URL and object (multi-language) */
function PlatformLink({ link, icon, label, className, title }) {
  if (!link) return null;
  if (typeof link === "object") {
    return (
      <MultiLinkBadge links={link} icon={icon} label={label} className={className} title={title} />
    );
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded transition ${className}`}
      title={title}
    >
      {icon} {label}
    </a>
  );
}

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
    ALL_PROBLEMS.length > 0 ? Math.round((completed.size / ALL_PROBLEMS.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">A2Z DSA Sheet</h1>
      <p className="text-gray-400 mb-8">
        {ALL_PROBLEMS.length} curated problems organized topic-wise — from basics to advanced.
        Expand each topic to explore subtopics and problems. Track your progress as you go.
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
          const stepPct = stepTotal > 0 ? Math.round((stepDone / stepTotal) * 100) : 0;

          return (
            <div key={step.stepNo} className="rounded-xl border border-gray-800 overflow-hidden">
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
                    <h2 className="text-white font-semibold text-sm truncate">{step.stepTitle}</h2>
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
                    const subDone = sub.problems.filter((p) => completed.has(p.id)).length;
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
                            <h3 className="text-gray-300 text-sm truncate">{sub.subStepTitle}</h3>
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
                                  <th className="px-3 py-2 text-center">Links</th>
                                  <th className="px-3 py-2 text-center">Resource</th>
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
                                        <PlatformLink
                                          link={p.lcLink}
                                          icon={<LCIcon />}
                                          label="LC"
                                          className="bg-amber-900/40 text-amber-400 hover:bg-amber-900/70"
                                          title="LeetCode"
                                        />
                                        <PlatformLink
                                          link={p.gfgLink}
                                          icon={<GFGIcon />}
                                          label="GFG"
                                          className="bg-green-900/40 text-green-400 hover:bg-green-900/70"
                                          title="GeeksforGeeks"
                                        />
                                        <PlatformLink
                                          link={p.cnLink}
                                          icon={<CNIcon />}
                                          label="CN"
                                          className="bg-orange-900/40 text-orange-400 hover:bg-orange-900/70"
                                          title="Coding Ninjas"
                                        />
                                        {!p.lcLink && !p.gfgLink && !p.cnLink && (
                                          <span className="text-gray-600 text-xs">—</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <Link
                                        to={`/dsa-sheet/problem/${problemSlug(p)}`}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/70 transition"
                                        title={`Course material for ${p.title}`}
                                        aria-label={`Open course material for ${p.title}`}
                                      >
                                        📘 Notes
                                      </Link>
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
