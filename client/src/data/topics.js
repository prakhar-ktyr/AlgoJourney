/**
 * Shared topic/category data used across the client.
 * Mirrors the server's TUTORIAL_CATEGORIES and DSA_TOPICS.
 */

export const TUTORIAL_CATEGORIES = [
  {
    group: "Programming Languages",
    color: "bg-blue-500",
    topics: [
      { name: "C", slug: "c", icon: "🔵" },
      { name: "C++", slug: "cpp", icon: "🟣" },
      { name: "Java", slug: "java", icon: "☕" },
      { name: "Python", slug: "python", icon: "🐍" },
      { name: "JavaScript", slug: "javascript", icon: "🟨" },
      { name: "TypeScript", slug: "typescript", icon: "🔷" },
      { name: "Go", slug: "go", icon: "🐹" },
      { name: "Rust", slug: "rust", icon: "🦀" },
    ],
  },
  {
    group: "Web Development",
    color: "bg-emerald-500",
    topics: [
      { name: "HTML", slug: "html", icon: "📄" },
      { name: "CSS", slug: "css", icon: "🎨" },
      { name: "React", slug: "react", icon: "⚛️" },
      { name: "Node.js", slug: "nodejs", icon: "🟩" },
      { name: "Next.js", slug: "nextjs", icon: "▲" },
      { name: "Web APIs & REST", slug: "web-apis-rest", icon: "🔗" },
      { name: "GraphQL", slug: "graphql", icon: "◈" },
      { name: "Mobile Development", slug: "mobile-development", icon: "📱" },
    ],
  },
  {
    group: "Core CS Theory",
    color: "bg-violet-500",
    topics: [
      { name: "Data Structures & Algorithms", slug: "dsa", icon: "🌲" },
      { name: "Object-Oriented Programming", slug: "oop", icon: "🧱" },
      {
        name: "Discrete Mathematics",
        slug: "discrete-mathematics",
        icon: "🔢",
      },
      {
        name: "Theory of Computation",
        slug: "theory-of-computation",
        icon: "🤔",
      },
      { name: "Compiler Design", slug: "compiler-design", icon: "⚙️" },
      {
        name: "Computer Architecture",
        slug: "computer-architecture",
        icon: "🖥️",
      },
    ],
  },
  {
    group: "Systems & Infrastructure",
    color: "bg-orange-500",
    topics: [
      { name: "Operating Systems", slug: "operating-systems", icon: "💻" },
      { name: "Computer Networks", slug: "computer-networks", icon: "🌐" },
      { name: "Distributed Systems", slug: "distributed-systems", icon: "🔀" },
      { name: "Cloud Computing", slug: "cloud-computing", icon: "☁️" },
      { name: "DevOps & CI/CD", slug: "devops-cicd", icon: "🚀" },
      { name: "Cybersecurity", slug: "cybersecurity", icon: "🔒" },
      { name: "Linux & Shell Scripting", slug: "linux-shell", icon: "🐧" },
    ],
  },
  {
    group: "Databases",
    color: "bg-cyan-500",
    topics: [
      { name: "Database Management Systems", slug: "dbms", icon: "🗄️" },
      { name: "SQL", slug: "sql", icon: "📊" },
      { name: "NoSQL & MongoDB", slug: "nosql-mongodb", icon: "🍃" },
    ],
  },
  {
    group: "AI, ML & Data Science",
    color: "bg-pink-500",
    topics: [
      {
        name: "Artificial Intelligence",
        slug: "artificial-intelligence",
        icon: "🧠",
      },
      { name: "Machine Learning", slug: "machine-learning", icon: "🤖" },
      { name: "Deep Learning", slug: "deep-learning", icon: "🔮" },
      { name: "Natural Language Processing", slug: "nlp", icon: "💬" },
      { name: "Computer Vision", slug: "computer-vision", icon: "👁️" },
      { name: "Data Science & Analytics", slug: "data-science", icon: "📈" },
      { name: "Mathematics for ML", slug: "math-for-ml", icon: "∑" },
    ],
  },
  {
    group: "Software Engineering",
    color: "bg-amber-500",
    topics: [
      { name: "System Design", slug: "system-design", icon: "🏗️" },
      { name: "Design Patterns", slug: "design-patterns", icon: "🧩" },
      {
        name: "Software Engineering",
        slug: "software-engineering",
        icon: "📐",
      },
      { name: "Testing & QA", slug: "testing-qa", icon: "✅" },
      {
        name: "Git & Version Control",
        slug: "git-version-control",
        icon: "🔀",
      },
    ],
  },
  {
    group: "Emerging Topics",
    color: "bg-rose-500",
    topics: [
      { name: "Blockchain", slug: "blockchain", icon: "⛓️" },
      { name: "Quantum Computing", slug: "quantum-computing", icon: "⚛️" },
    ],
  },
];

/** Flat list of all topics for search */
export const ALL_TOPICS = TUTORIAL_CATEGORIES.flatMap((cat) =>
  cat.topics.map((t) => ({ ...t, group: cat.group, color: cat.color })),
);
