import { useState, useEffect, useRef } from "react";
import { useReaderMode } from "../context/ReaderModeContext";

/**
 * Floating toolbar displayed when reader mode is active.
 * Provides: exit button, theme switcher, font family, and font size controls.
 * Collapses to a minimal icon on mobile to avoid blocking content.
 */
export default function ReaderModeToolbar() {
  const {
    active,
    exit,
    prefs,
    setTheme,
    setFontFamily,
    setFontSize,
    theme,
    THEMES,
    FONT_FAMILIES,
    FONT_SIZES,
  } = useReaderMode();
  const [expanded, setExpanded] = useState(false);
  const toolbarRef = useRef(null);

  // Close settings panel when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  if (!active) return null;

  return (
    <div
      ref={toolbarRef}
      className={`fixed top-4 right-4 z-[100] flex flex-col items-end gap-2 transition-all ${theme.toolbar} rounded-xl border backdrop-blur shadow-2xl`}
      role="toolbar"
      aria-label="Reader mode controls"
    >
      {/* Collapsed state: just the toggle + exit */}
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`p-2 rounded-lg hover:bg-black/10 transition ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-700" : "text-gray-300"}`}
          aria-label={expanded ? "Collapse reader settings" : "Expand reader settings"}
          title="Reader settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={exit}
          className={`p-2 rounded-lg hover:bg-red-500/20 transition ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-700 hover:text-red-600" : "text-gray-300 hover:text-red-400"}`}
          aria-label="Exit reader mode"
          title="Exit reader mode (Esc)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Expanded settings panel */}
      {expanded && (
        <div
          className={`p-4 border-t ${prefs.theme === "light" || prefs.theme === "sepia" ? "border-gray-300" : "border-gray-700"} min-w-[220px] space-y-4`}
        >
          {/* Theme selector */}
          <div>
            <label
              className={`text-xs font-medium uppercase tracking-wider mb-2 block ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-600" : "text-gray-400"}`}
            >
              Theme
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`px-2 py-1.5 text-xs rounded-md border transition ${
                    prefs.theme === key
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-medium"
                      : `${prefs.theme === "light" || prefs.theme === "sepia" ? "border-gray-300 text-gray-600 hover:border-gray-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`
                  }`}
                  aria-pressed={prefs.theme === key}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font family */}
          <div>
            <label
              className={`text-xs font-medium uppercase tracking-wider mb-2 block ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-600" : "text-gray-400"}`}
            >
              Font
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(FONT_FAMILIES).map(([key, f]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFontFamily(key)}
                  className={`px-2 py-1.5 text-xs rounded-md border transition ${f.className} ${
                    prefs.fontFamily === key
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-medium"
                      : `${prefs.theme === "light" || prefs.theme === "sepia" ? "border-gray-300 text-gray-600 hover:border-gray-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`
                  }`}
                  aria-pressed={prefs.fontFamily === key}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label
              className={`text-xs font-medium uppercase tracking-wider mb-2 block ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-600" : "text-gray-400"}`}
            >
              Size
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(FONT_SIZES).map(([key, s]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFontSize(key)}
                  className={`px-2 py-1.5 text-xs rounded-md border transition ${
                    prefs.fontSize === key
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-medium"
                      : `${prefs.theme === "light" || prefs.theme === "sepia" ? "border-gray-300 text-gray-600 hover:border-gray-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`
                  }`}
                  aria-pressed={prefs.fontSize === key}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <p
            className={`text-[10px] ${prefs.theme === "light" || prefs.theme === "sepia" ? "text-gray-500" : "text-gray-600"}`}
          >
            Press <kbd className="px-1 py-0.5 rounded bg-black/10 text-[10px]">Esc</kbd> to exit
          </p>
        </div>
      )}
    </div>
  );
}
