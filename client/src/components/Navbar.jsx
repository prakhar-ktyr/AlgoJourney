import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

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

          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                /* Logged-in: avatar + dropdown */
                <div className="relative ml-2" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition"
                    aria-label="User menu"
                  >
                    {/* Avatar circle with initial */}
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white uppercase">
                      {user.username?.[0] || "?"}
                    </span>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
                    {/* Chevron */}
                    <svg
                      className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-700 bg-gray-900 shadow-xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-sm font-medium text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged-out: login button */
                <Link
                  to="/login"
                  className="ml-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition text-sm"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
