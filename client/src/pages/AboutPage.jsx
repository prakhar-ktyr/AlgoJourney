import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">About AlgoJourney</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          AlgoJourney is a free, open-source learning platform covering the
          entire breadth of Computer Science and AI — from HTML basics to
          Quantum Computing.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">
          What&apos;s included
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>
            <strong className="text-gray-200">48 tutorial topics</strong> —
            programming languages, core CS theory, systems, databases, web dev,
            AI/ML, software engineering, and emerging tech.
          </li>
          <li>
            <strong className="text-gray-200">DSA Tracking Sheet</strong> —
            curated problems organized by topic and difficulty with progress
            tracking.
          </li>
          <li>
            <strong className="text-gray-200">Markdown-based content</strong> —
            every tutorial is written in Markdown for easy contribution.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-white pt-4">Tech Stack</h2>
        <p className="text-gray-400">
          React 19 + Vite + Tailwind CSS on the frontend, Express 5 + Mongoose 9
          + MongoDB on the backend. Tested with Vitest + React Testing Library.
        </p>

        <div className="pt-6">
          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 underline transition"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
