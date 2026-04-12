export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} AlgoJourney. Learn CS, one topic at
          a time.
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
