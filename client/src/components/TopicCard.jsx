import { Link } from "react-router-dom";
import TopicLogo from "./TopicLogo";

export default function TopicCard({ topic }) {
  return (
    <Link
      to={`/tutorials/${topic.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/60 px-4 py-3 hover:border-indigo-500/50 hover:bg-gray-800/80 transition"
    >
      <TopicLogo topic={topic} size="sm" />
      <span className="text-sm font-medium text-gray-200 group-hover:text-white transition">
        {topic.name}
      </span>
    </Link>
  );
}
