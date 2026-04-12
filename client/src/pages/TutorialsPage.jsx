import { useState, useMemo } from "react";
import TopicCard from "../components/TopicCard";
import { TUTORIAL_CATEGORIES, ALL_TOPICS } from "../data/topics";

export default function TutorialsPage() {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return TUTORIAL_CATEGORIES;
    const q = filter.toLowerCase();
    return TUTORIAL_CATEGORIES.map((cat) => ({
      ...cat,
      topics: cat.topics.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.includes(q) ||
          cat.group.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.topics.length > 0);
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">All Tutorials</h1>
      <p className="text-gray-400 mb-8">
        {ALL_TOPICS.length} topics across {TUTORIAL_CATEGORIES.length}{" "}
        categories. Pick one to start learning.
      </p>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter topics…"
        aria-label="Filter topics"
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition mb-10"
      />

      {filtered.length === 0 && (
        <p className="text-gray-500">No topics match your filter.</p>
      )}

      {filtered.map((cat) => (
        <div key={cat.group} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${cat.color}`}
            />
            <h2 className="text-lg font-semibold text-white">{cat.group}</h2>
            <span className="text-xs text-gray-500">({cat.topics.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cat.topics.map((topic) => (
              <TopicCard key={topic.slug} topic={topic} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
