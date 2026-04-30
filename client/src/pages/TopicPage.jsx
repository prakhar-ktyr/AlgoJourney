import { useParams, Link } from "react-router-dom";
import { ALL_TOPICS } from "../data/topics";
import { getCourse, getLesson, getAdjacentLessons } from "../data/courses";
import CourseLayout from "../components/CourseLayout";
import TopicLogo from "../components/TopicLogo";

export default function TopicPage() {
  const { slug, lessonSlug } = useParams();
  const topic = ALL_TOPICS.find((t) => t.slug === slug);

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Topic Not Found</h1>
        <p className="text-gray-400 mb-8">
          We couldn&apos;t find a tutorial for &ldquo;{slug}&rdquo;.
        </p>
        <Link
          to="/tutorials"
          className="text-indigo-400 hover:text-indigo-300 underline transition"
        >
          Browse all tutorials
        </Link>
      </div>
    );
  }

  const course = getCourse(slug);

  if (course) {
    const lesson = getLesson(slug, lessonSlug);
    if (!lesson) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Lesson Not Found</h1>
          <p className="text-gray-400 mb-8">
            The lesson &ldquo;{lessonSlug}&rdquo; doesn&apos;t exist in the {topic.name} course.
          </p>
          <Link
            to={`/tutorials/${slug}`}
            className="text-indigo-400 hover:text-indigo-300 underline transition"
          >
            Go to {topic.name} course home
          </Link>
        </div>
      );
    }
    const [prev, next] = getAdjacentLessons(slug, lesson.slug);
    return (
      <CourseLayout
        topic={topic}
        course={course}
        lesson={lesson}
        prev={prev}
        next={next}
        basePath={`/tutorials/${slug}`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/tutorials"
        className="text-sm text-gray-500 hover:text-gray-300 transition mb-6 inline-block"
      >
        ← All tutorials
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TopicLogo topic={topic} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-white">{topic.name}</h1>
          <span className="text-sm text-gray-500">{topic.group}</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8">
        <p className="text-gray-300 leading-relaxed">
          Tutorial content for <strong>{topic.name}</strong> is coming soon. This page will contain
          in-depth markdown-based lessons, interactive code examples, and quizzes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">Beginner</span>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
            Intermediate
          </span>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">Advanced</span>
        </div>
      </div>
    </div>
  );
}
