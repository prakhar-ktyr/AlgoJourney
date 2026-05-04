import { useReaderMode } from "../context/ReaderModeContext";

/**
 * A button to activate reader mode. Placed on content-heavy pages
 * (tutorials, problem resources). Hidden when reader mode is already active.
 */
export default function ReaderModeToggle() {
  const { active, enter } = useReaderMode();

  if (active) return null;

  return (
    <button
      type="button"
      onClick={enter}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:border-indigo-500 hover:bg-gray-800 transition backdrop-blur"
      aria-label="Enter reader mode"
      title="Enter reader mode for distraction-free reading"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06V3.44a.75.75 0 00-.556-.723A9.006 9.006 0 0015 2.5a8.99 8.99 0 00-4.25 1.065v13.255zM9.25 4.565A8.99 8.99 0 005 2.5c-.853 0-1.681.118-2.444.34A.75.75 0 002 3.56v11.62a.75.75 0 00.956.723A7.462 7.462 0 015 15.5a7.46 7.46 0 014.25 1.32V4.565z" />
      </svg>
      <span className="hidden sm:inline">Reader Mode</span>
    </button>
  );
}
