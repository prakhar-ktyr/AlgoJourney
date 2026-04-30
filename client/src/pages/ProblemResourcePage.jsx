import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import STRIVERS_SHEET from "../data/striversSheet";
import {
  SUPPORTED_LANGUAGES,
  getProblemResource,
  resolveProblemResource,
} from "../data/problemResources";
import { problemSlug } from "../lib/slugify";
import CodeBlock from "../components/CodeBlock";
import Markdown, { MarkdownInline } from "../components/Markdown";

const LANG_STORAGE_KEY = "preferred-language";
const DIFF_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

/** Find a problem (and its step/sub context) by slug. */
function findProblemBySlug(slug) {
  for (const step of STRIVERS_SHEET) {
    for (const sub of step.subSteps) {
      for (const problem of sub.problems) {
        if (problemSlug(problem) === slug) {
          return { problem, step, sub };
        }
      }
    }
  }
  return null;
}

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return SUPPORTED_LANGUAGES[0];
}

export default function ProblemResourcePage() {
  const { slug } = useParams();
  const match = useMemo(() => findProblemBySlug(slug), [slug]);
  const [language, setLanguage] = useState(readStoredLanguage);

  // Always start the resource page from the top when navigating in.
  useEffect(() => {
    if (typeof window.scrollTo === "function") {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Problem Not Found</h1>
        <p className="text-gray-400 mb-8">
          We couldn&apos;t find a problem matching &ldquo;{slug}&rdquo;.
        </p>
        <Link
          to="/dsa-sheet"
          className="text-indigo-400 hover:text-indigo-300 underline transition"
        >
          Back to the DSA Sheet
        </Link>
      </div>
    );
  }

  const { problem, step, sub } = match;
  const resource = getProblemResource(slug);
  const resolved = resolveProblemResource(slug, language);
  const solutions = resolved?.solutions ?? [];
  const hasAnySolution = solutions.length > 0 && (resolved?.availableLanguages?.length ?? 0) > 0;
  const showSolutionTitles = solutions.length > 1;
  // If every solution declares its own complexity, the top-level Complexity
  // section becomes redundant — hide it to avoid duplication.
  const everySolutionHasComplexity = solutions.length > 0 && solutions.every((s) => s.complexity);
  const showGlobalComplexity =
    !!resolved?.complexity &&
    (resolved.complexity.time || resolved.complexity.space) &&
    !everySolutionHasComplexity;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/dsa-sheet"
        className="text-sm text-gray-500 hover:text-gray-300 transition mb-6 inline-block"
      >
        ← Back to DSA Sheet
      </Link>

      <header className="mb-6">
        <p className="text-xs text-indigo-400 font-medium mb-1">
          Step {step.stepNo} · {step.stepTitle} ›{" "}
          <span className="text-gray-400">{sub.subStepTitle}</span>
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-bold text-white">{problem.title}</h1>
          <span className={`text-sm font-medium ${DIFF_COLORS[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>
      </header>

      {/* Language selector — controls every code snippet on this page */}
      <div
        className="flex flex-wrap items-center gap-2 mb-8 sticky top-0 z-10 bg-gray-950/85 backdrop-blur py-3 border-b border-gray-800"
        data-testid="language-selector"
      >
        <label htmlFor="language-select" className="text-sm text-gray-400 mr-1">
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:border-indigo-500"
          aria-label="Select code snippet language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {resource ? (
        <article className="space-y-10">
          {resolved.intro && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
              <Markdown source={resolved.intro} />
            </section>
          )}

          {resolved.concepts && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Concepts to Review</h2>
              <Markdown source={resolved.concepts} />
            </section>
          )}

          {resolved.approach && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Approach</h2>
              <Markdown source={resolved.approach} />
            </section>
          )}

          {showGlobalComplexity && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Complexity</h2>
              <ul className="text-gray-300 space-y-1">
                {resolved.complexity.time && (
                  <li>
                    <span className="text-gray-500">Time:</span>{" "}
                    <MarkdownInline source={resolved.complexity.time} />
                  </li>
                )}
                {resolved.complexity.space && (
                  <li>
                    <span className="text-gray-500">Space:</span>{" "}
                    <MarkdownInline source={resolved.complexity.space} />
                  </li>
                )}
              </ul>
            </section>
          )}

          {hasAnySolution && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Solution</h2>
              <div className="space-y-6">
                {solutions.map((entry, index) => {
                  const heading =
                    entry.title || (showSolutionTitles ? `Approach ${index + 1}` : null);
                  const testId = index === 0 ? "solution-code" : `solution-code-${index}`;
                  const complexity = entry.complexity;
                  return (
                    <div key={index}>
                      {heading && (
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">{heading}</h3>
                      )}
                      {complexity && (complexity.time || complexity.space) && (
                        <p
                          className="text-sm text-gray-300 mb-3 flex flex-wrap gap-x-5 gap-y-1"
                          data-testid={
                            index === 0 ? "solution-complexity" : `solution-complexity-${index}`
                          }
                        >
                          {complexity.time && (
                            <span>
                              <span className="text-gray-500">Time:</span>{" "}
                              <MarkdownInline source={complexity.time} />
                            </span>
                          )}
                          {complexity.space && (
                            <span>
                              <span className="text-gray-500">Space:</span>{" "}
                              <MarkdownInline source={complexity.space} />
                            </span>
                          )}
                        </p>
                      )}
                      {entry.code ? (
                        <CodeBlock code={entry.code} language={language} testId={testId} />
                      ) : (
                        <p className="text-gray-400 italic">
                          A {language} version of this approach hasn&apos;t been written yet. Try
                          another language above.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8">
          <p className="text-gray-300 leading-relaxed">
            Course material for <strong>{problem.title}</strong> is coming soon. This page will
            contain the conceptual breakdown, intuition, and reference solutions in your selected
            language ({language}).
          </p>
        </div>
      )}
    </div>
  );
}
