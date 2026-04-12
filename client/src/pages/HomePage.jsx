import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import TopicCard from "../components/TopicCard";
import { TUTORIAL_CATEGORIES } from "../data/topics";

export default function HomePage() {
  return (
    <>
      {/* Hero with search */}
      <section className="flex flex-col items-center text-center pt-20 pb-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl">
          Learn <span className="text-indigo-400">Computer Science</span> &{" "}
          <span className="text-emerald-400">AI</span>
        </h1>
        <p className="mt-4 text-gray-400 max-w-lg">
          Free tutorials, interactive examples, and a DSA tracking sheet. Pick a
          topic and start learning.
        </p>
        <div className="mt-8 w-full max-w-xl">
          <SearchBar />
        </div>
      </section>

      {/* Quick-start banners */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
        <Link
          to="/tutorials"
          className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6 hover:bg-indigo-500/20 transition"
        >
          <h2 className="text-lg font-bold text-white">Browse All Tutorials</h2>
          <p className="mt-1 text-sm text-indigo-300/80">
            48 topics from HTML basics to Quantum Computing
          </p>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-30">
            →
          </span>
        </Link>
        <Link
          to="/dsa-sheet"
          className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 hover:bg-emerald-500/20 transition"
        >
          <h2 className="text-lg font-bold text-white">DSA Tracking Sheet</h2>
          <p className="mt-1 text-sm text-emerald-300/80">
            Curated problems by topic &amp; difficulty — track your progress
          </p>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-30">
            →
          </span>
        </Link>
      </section>

      {/* Topic grid by category */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {TUTORIAL_CATEGORIES.map((cat) => (
          <div key={cat.group} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${cat.color}`}
              />
              <h2 className="text-lg font-semibold text-white">{cat.group}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cat.topics.map((topic) => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
