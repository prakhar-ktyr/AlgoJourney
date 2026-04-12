import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          <span className="text-indigo-400">Algo</span>Journey
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link
            to="/tutorials"
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            Tutorials
          </Link>
          <Link
            to="/dsa-sheet"
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            DSA Sheet
          </Link>
          <Link
            to="/about"
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
