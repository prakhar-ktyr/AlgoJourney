import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Markdown from "./Markdown";
import TopicLogo from "./TopicLogo";
import { COURSE_LANGUAGES, filterLessonBody } from "../data/courses";

const LANG_STORAGE_KEY = "dsa-course-language";

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && COURSE_LANGUAGES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return COURSE_LANGUAGES[0];
}

/**
 * Two-column course layout inspired by w3schools: a sticky sidebar listing
 * every lesson in order, a wide reading column for the lesson body, and
 * Previous / Next pagination at the bottom. The sidebar collapses behind a
 * toggle on small screens.
 */
export default function CourseLayout({
  topic,
  course,
  lesson,
  prev,
  next,
  basePath,
  languageSupport = false,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState(readStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const filteredBody = useMemo(
    () =>
      languageSupport
        ? filterLessonBody(lesson.body, language)
        : lesson.body,
    [lesson.body, language, languageSupport],
  );

  const lessonHref = (l) =>
    l.order === course.lessons[0].order ? basePath : `${basePath}/${l.slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/tutorials"
        className="text-sm text-gray-500 hover:text-gray-300 transition mb-6 inline-block"
      >
        ← All tutorials
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TopicLogo topic={topic} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-white">{topic.name} Tutorial</h1>
          <span className="text-sm text-gray-500">{topic.group}</span>
        </div>
      </div>

      <button
        type="button"
        className="md:hidden mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 transition"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-expanded={sidebarOpen}
        aria-controls="course-sidebar"
      >
        <span aria-hidden="true">☰</span>
        {sidebarOpen ? "Hide" : "Show"} lessons ({course.lessons.length})
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
        <aside id="course-sidebar" className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
          <nav
            aria-label={`${topic.name} course lessons`}
            className="md:sticky md:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900/60 p-3"
          >
            <ol className="space-y-1">
              {course.lessons.map((l) => {
                const active = l.slug === lesson.slug;
                return (
                  <li key={l.slug}>
                    <Link
                      to={lessonHref(l)}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-indigo-600/90 text-white font-medium"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {l.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 rounded-xl border border-gray-800 bg-gray-900/60 p-6 sm:p-8">
          {languageSupport && (
            <div className="mb-6 flex items-center gap-3">
              <label
                htmlFor="course-lang-select"
                className="text-sm font-medium text-gray-400"
              >
                Language
              </label>
              <select
                id="course-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              >
                {COURSE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Markdown source={filteredBody} />

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-between border-t border-gray-800 pt-6">
            {prev ? (
              <Link
                to={lessonHref(prev)}
                rel="prev"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={lessonHref(next)}
                rel="next"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition sm:ml-auto"
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
