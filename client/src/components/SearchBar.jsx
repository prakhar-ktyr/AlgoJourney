import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_TOPICS } from "../data/topics";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_TOPICS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q) ||
        t.slug.includes(q),
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (slug) => {
    setQuery("");
    setOpen(false);
    navigate(`/tutorials/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0].slug);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tutorials… (e.g. Python, System Design, React)"
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-5 py-3.5 pl-12 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          aria-label="Search tutorials"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
          />
        </svg>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 py-2 shadow-2xl">
          {results.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => handleSelect(t.slug)}
                className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-800 transition"
              >
                <span className="text-lg">{t.icon}</span>
                <div>
                  <span className="text-white">{t.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{t.group}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 py-4 px-5 text-gray-500 text-sm shadow-2xl">
          No topics found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
