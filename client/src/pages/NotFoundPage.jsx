import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-4">
      <h1 className="text-6xl font-extrabold text-gray-700">404</h1>
      <p className="mt-4 text-lg text-gray-400">Page not found.</p>
      <Link
        to="/"
        className="mt-6 text-indigo-400 hover:text-indigo-300 underline transition"
      >
        Go back home
      </Link>
    </div>
  );
}
