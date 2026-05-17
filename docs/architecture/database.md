# Data Models

## User (`server/models/User.js`)

| Field                    | Type       | Details                                        |
| ------------------------ | ---------- | ---------------------------------------------- |
| `username`               | String     | Required, unique, 3–30 chars                   |
| `email`                  | String     | Required, unique, validated format, lowercased |
| `passwordHash`           | String     | Required, stripped from JSON responses         |
| `role`                   | String     | `"user"` (default) or `"admin"`                |
| `displayName`            | String     | Optional, max 50 chars                         |
| `bio`                    | String     | Optional, max 300 chars                        |
| `avatarUrl`              | String     | Optional                                       |
| `completedTutorials`     | ObjectId[] | Refs → Tutorial                                |
| `completedDSAQuestions`  | ObjectId[] | Refs → DSAQuestion                             |
| `bookmarkedTutorials`    | ObjectId[] | Refs → Tutorial                                |
| `bookmarkedDSAQuestions` | ObjectId[] | Refs → DSAQuestion                             |
| `currentStreak`          | Number     | Default 0                                      |
| `longestStreak`          | Number     | Default 0                                      |
| `lastActiveDate`         | Date       | Optional                                       |
| `createdAt / updatedAt`  | Date       | Auto-managed via `timestamps: true`            |

## Tutorial (`server/models/Tutorial.js`)

| Field                   | Type       | Details                                                |
| ----------------------- | ---------- | ------------------------------------------------------ |
| `title`                 | String     | Required, max 200 chars                                |
| `slug`                  | String     | Required, unique, kebab-case, auto-lowercased          |
| `category`              | String     | Required, enum (see categories below)                  |
| `subcategory`           | String     | Optional, max 100 chars                                |
| `markdownContent`       | String     | Required                                               |
| `summary`               | String     | Optional, max 500 chars                                |
| `difficulty`            | String     | `"Beginner"` (default), `"Intermediate"`, `"Advanced"` |
| `tags`                  | String[]   | Default `[]`                                           |
| `orderIndex`            | Number     | Default 0, for sorting within category                 |
| `estimatedMinutes`      | Number     | Optional, min 1                                        |
| `prerequisites`         | ObjectId[] | Refs → Tutorial                                        |
| `author`                | ObjectId   | Ref → User                                             |
| `published`             | Boolean    | Default `false`                                        |
| `createdAt / updatedAt` | Date       | Auto-managed                                           |

**Tutorial categories** (40+ topics covering end-to-end CS):

> Programming Fundamentals, C, C++, Java, Python, JavaScript, TypeScript, Go, Rust, Data Structures & Algorithms, Object-Oriented Programming, Discrete Mathematics, Theory of Computation, Compiler Design, Computer Architecture, Operating Systems, Computer Networks, Distributed Systems, Cloud Computing, DevOps & CI/CD, Cybersecurity, Linux & Shell Scripting, Database Management Systems, SQL, NoSQL & MongoDB, HTML, CSS, React, Node.js, Next.js, Web APIs & REST, GraphQL, Mobile Development, Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Data Science & Analytics, Mathematics for ML, System Design, Design Patterns, Software Engineering, Testing & QA, Git & Version Control, Blockchain, Quantum Computing

## DSAQuestion (`server/models/DSAQuestion.js`)

| Field                   | Type     | Details                                  |
| ----------------------- | -------- | ---------------------------------------- |
| `title`                 | String   | Required, max 200 chars                  |
| `topic`                 | String   | Required, enum (see topics below)        |
| `difficulty`            | String   | Required: `"Easy"`, `"Medium"`, `"Hard"` |
| `problemUrl`            | String   | Required                                 |
| `description`           | String   | Optional, max 1000 chars                 |
| `tags`                  | String[] | Default `[]`                             |
| `companies`             | String[] | Default `[]` (e.g., Google, Amazon)      |
| `hints`                 | String[] | Default `[]`                             |
| `solutionApproaches`    | String[] | Default `[]` (e.g., "Hash Map O(n)")     |
| `orderIndex`            | Number   | Default 0                                |
| `published`             | Boolean  | Default `false`                          |
| `createdAt / updatedAt` | Date     | Auto-managed                             |

**DSA topics** (45+ covering classic DSA + ML math):

> Arrays, Strings, Linked Lists, Stacks, Queues, Hash Tables, Trees, Binary Search Trees, Heaps, Tries, Graphs, Disjoint Sets, Sorting, Searching, Binary Search, Two Pointers, Sliding Window, Recursion, Backtracking, Divide and Conquer, Greedy, Dynamic Programming, Bit Manipulation, BFS & DFS, Shortest Path, Topological Sort, Minimum Spanning Tree, Segment Trees, Fenwick Trees, Math & Number Theory, Combinatorics, Geometry, Linear Algebra, Probability & Statistics, Calculus & Optimization, Mathematics for ML
