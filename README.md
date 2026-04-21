# AlgoJourney

A comprehensive MERN-stack learning platform for Computer Science, AI, and Data Structures & Algorithms — similar to W3Schools with an interactive DSA tracking sheet.

## Project Structure

```
AlgoJourney/
├── package.json                 # Root: orchestrates dev/test/build across workspaces
├── server/                      # Express.js REST API
│   ├── package.json
│   ├── index.js                 # App entry point (Express setup)
│   ├── db.js                    # MongoDB connection module
│   ├── vitest.config.js         # Server test configuration
│   ├── .env                     # Environment variables (not committed)
│   ├── models/
│   │   ├── index.js             # Barrel export for all models
│   │   ├── User.js              # User schema & model
│   │   ├── Tutorial.js          # Tutorial schema, model & categories
│   │   └── DSAQuestion.js       # DSA question schema, model & topics
│   └── __tests__/
│       ├── health.test.js       # API endpoint tests
│       ├── db.test.js           # DB module tests
│       ├── user.model.test.js   # User model validation tests
│       ├── tutorial.model.test.js   # Tutorial model validation tests
│       └── dsaQuestion.model.test.js # DSAQuestion model validation tests
└── client/                      # React SPA (Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js           # Vite + Tailwind + test config
    ├── index.html               # HTML entry point
    └── src/
        ├── main.jsx             # React DOM render entry
        ├── index.css            # Tailwind CSS import
        ├── App.jsx              # Landing page component
        ├── App.test.jsx         # Component tests
        └── test/
            └── setup.js         # Test setup (jest-dom matchers)
```

## Prerequisites

- **Node.js** >= 22.0.0 (tested with v22.3.0)
- **npm** >= 10
- **MongoDB** running locally or a remote connection string

## Getting Started

### 1. Install dependencies

From the project root:

```bash
# Install root dependencies (concurrently)
npm install

# Install server + client dependencies
npm run install:all
```

### 2. Configure environment

Copy the example file and fill in real values:

```bash
cp server/.env.example server/.env
```

The server reads:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algojourney
NODE_ENV=development
CLIENT_URL=                       # required only when NODE_ENV=production (CORS origin)
```

The client optionally reads `VITE_API_BASE_URL` at build time. Leave unset for local
development (the Vite dev server proxies `/api/*` to the Express server). Set it for
production deployments where there is no proxy:

```bash
# client/.env.production (or pass inline at build time)
VITE_API_BASE_URL=https://api.example.com
```

Update `MONGODB_URI` if your MongoDB instance runs elsewhere (e.g., MongoDB Atlas).

### 3. Run the app

```bash
# Start both server (port 5000) and client (port 3000) simultaneously
npm run dev

# Or run them individually:
npm run dev:server    # Express API on http://localhost:5000
npm run dev:client    # React app on http://localhost:3000
```

The client dev server proxies `/api` requests to the backend automatically.

### 4. Build for production

```bash
npm run build         # Builds the client to client/dist/
```

### 5. Deploy frontend to GitHub Pages

The client is configured for GitHub Pages deployment with clean SPA routing.

**Automatic (CI):** Push to `main` and the GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds and deploys automatically. Enable GitHub Pages in your repo: Settings → Pages → Source: **GitHub Actions**.

**Manual:**

```bash
cd client
npm run deploy        # Builds with /AlgoJourney/ base path and deploys via gh-pages
```

Your site will be live at `https://prakhar-ktyr.github.io/AlgoJourney/`.

> **Note:** Locally, `npm run dev` runs without the base path. The `/AlgoJourney/` prefix is only applied when `GITHUB_PAGES=true` (set automatically by the CI workflow and `build:ghpages` script).

## Running Tests

```bash
# Run ALL tests (server + client)
npm test

# Run only server tests
npm run test:server

# Run only client tests
npm run test:client

# Watch mode (re-runs on file changes) — both server + client
npm run test:watch
```

You can also run tests directly inside each workspace:

```bash
cd server && npm test           # or: npm run test:watch
cd client && npm test           # or: npm run test:watch
```

## Tech Stack

### Server

| Package   | Version | Purpose                          |
| --------- | ------- | -------------------------------- |
| Express   | 5.x     | HTTP framework                   |
| Mongoose  | 9.x     | MongoDB ODM                      |
| cors      | 2.x     | Cross-Origin Resource Sharing    |
| dotenv    | 17.x    | Environment variable management  |
| nodemon   | 3.x     | Auto-restart on file changes     |
| Vitest    | 3.x     | Test runner                      |
| Supertest | latest  | HTTP assertion library for tests |

### Client

| Package                   | Version | Purpose                     |
| ------------------------- | ------- | --------------------------- |
| React                     | 19.x    | UI library                  |
| React Router              | 7.x     | Client-side routing         |
| Vite                      | 6.x     | Build tool & dev server     |
| Tailwind CSS              | 4.x     | Utility-first CSS framework |
| Vitest                    | 3.x     | Test runner                 |
| React Testing Library     | latest  | Component testing utilities |
| @testing-library/jest-dom | latest  | Custom DOM matchers         |
| ESLint                    | 9.x     | Code linting                |

## API Endpoints

### `GET /api/health`

Health check endpoint. Returns:

```json
{
  "status": "ok",
  "message": "AlgoJourney API is running"
}
```

## Features

### Landing Page (Client)

- **Navbar** — Brand name + navigation links (Tutorials, DSA Sheet, About)
- **Hero Section** — Headline, description, and two CTA buttons (Start Learning, DSA Sheet)
- **Feature Cards** — Three cards showcasing the platform's core offerings:
  - **Tutorials** — CS fundamentals, web dev, databases
  - **AI & ML** — Neural networks, transformers, hands-on examples
  - **DSA Tracker** — Curated problem list with progress tracking

### DSA Sheet Page (Client)

- **Accordion layout** — All 18 topics displayed on a single page as expandable/collapsible sections (like takeuforward.org)
- **Two-level dropdowns** — Click a topic to reveal subtopics; click a subtopic to reveal its problems table
- **Multiple open sections** — Any number of steps and subtopics can be open simultaneously
- **Per-step progress bars** — Each step header shows a progress bar and completion count
- **Overall progress bar** — Tracks completion across all 455 problems
- **Completion persistence** — Checked problems are saved to localStorage
- **Problem links** — LeetCode and GeeksforGeeks links where available
- **Difficulty indicators** — Color-coded Easy / Medium / Hard labels

### Server

- **Health endpoint** — `GET /api/health` for uptime monitoring
- **CORS enabled** — Allows cross-origin requests from the client
- **JSON body parsing** — Accepts JSON request bodies
- **MongoDB connection** — Dedicated `db.js` module with error handling
- **Mongoose models** — User, Tutorial, DSAQuestion (see [Data Models](#data-models))

## Data Models

### User (`server/models/User.js`)

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

### Tutorial (`server/models/Tutorial.js`)

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

### DSAQuestion (`server/models/DSAQuestion.js`)

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

## Test Coverage

### Server Tests (`server/__tests__/health.test.js`)

| Test                                        | What it verifies                                       |
| ------------------------------------------- | ------------------------------------------------------ |
| `Health API > returns status ok`            | `GET /api/health` returns `200` with correct JSON body |
| `Health API > returns JSON content-type`    | Response Content-Type header is `application/json`     |
| `Express middleware > CORS headers present` | CORS `access-control-allow-origin` header is set       |
| `Express middleware > parses JSON bodies`   | Express doesn't crash on JSON POST to unknown route    |
| `Unknown routes > 404 for /api/unknown`     | Non-existent API routes return 404                     |
| `Unknown routes > 404 for /does-not-exist`  | Non-existent root routes return 404                    |

### DB Module Test (`server/__tests__/db.test.js`)

| Test                 | What it verifies                   |
| -------------------- | ---------------------------------- |
| `exports a function` | `connectDB` is a callable function |

### User Model Tests (`server/__tests__/user.model.test.js`) — 18 tests

| Test                                     | What it verifies                            |
| ---------------------------------------- | ------------------------------------------- |
| Complete user validates                  | All required fields pass validation         |
| Requires username / email / passwordHash | Missing required fields trigger errors      |
| Rejects invalid email format             | `"not-an-email"` fails regex                |
| Lowercases email                         | `"John@Example.COM"` → `"john@example.com"` |
| Username min/max length                  | 2 chars rejected, 31 chars rejected         |
| Role enum (`user`, `admin`)              | Invalid role rejected, admin accepted       |
| Defaults (streak, arrays)                | `currentStreak=0`, empty arrays             |
| ObjectId refs                            | Valid ObjectIds accepted in arrays          |
| toJSON strips passwordHash               | `passwordHash` never in JSON output         |
| Bio / displayName limits                 | 301-char bio and 51-char name rejected      |

### Tutorial Model Tests (`server/__tests__/tutorial.model.test.js`) — 23 tests

| Test                                       | What it verifies                                              |
| ------------------------------------------ | ------------------------------------------------------------- |
| Complete tutorial validates                | All required fields pass                                      |
| Requires title / slug / category / content | Missing fields error                                          |
| Slug format                                | Spaces rejected, kebab-case accepted                          |
| Slug auto-lowercased                       | Uppercase input lowercased                                    |
| Category enum                              | Invalid category rejected, all 47 valid categories pass       |
| Difficulty enum                            | Defaults to Beginner, Intermediate accepted, invalid rejected |
| Defaults (published, tags, prerequisites)  | Correct default values                                        |
| Optional fields                            | summary, subcategory, estimatedMinutes accepted               |
| estimatedMinutes min                       | `0` rejected (min is 1)                                       |
| TUTORIAL_CATEGORIES constant               | Non-empty, covers core CS / web / languages                   |

### DSAQuestion Model Tests (`server/__tests__/dsaQuestion.model.test.js`) — 22 tests

| Test                                        | What it verifies                                 |
| ------------------------------------------- | ------------------------------------------------ |
| Complete question validates                 | All required fields pass                         |
| Requires title / topic / difficulty / URL   | Missing fields error                             |
| Topic enum                                  | Invalid topic rejected, all 36 valid topics pass |
| Difficulty enum                             | Easy/Medium/Hard accepted, invalid rejected      |
| Defaults (published, tags, companies, etc.) | Correct default values                           |
| Optional fields                             | description, tags, companies, hints accepted     |
| Description max length                      | 1001-char description rejected                   |
| DSA_TOPICS constant                         | Non-empty, covers classic DSA + ML math          |

### Client Tests (`client/src/App.test.jsx`)

| Test                           | What it verifies                             |
| ------------------------------ | -------------------------------------------- |
| `renders without crashing`     | App mounts successfully                      |
| `Navbar > brand name`          | "AlgoJourney" text is displayed              |
| `Navbar > Tutorials link`      | Tutorials nav link exists                    |
| `Navbar > DSA Sheet link`      | DSA Sheet nav link exists                    |
| `Navbar > About link`          | About nav link exists                        |
| `Hero > heading`               | "Computer Science" and "AI" text displayed   |
| `Hero > description`           | Hero paragraph text present                  |
| `Hero > Start Learning button` | CTA button rendered                          |
| `Hero > DSA Sheet button`      | Secondary CTA button rendered                |
| `Feature cards > Tutorials`    | Card icon + description present              |
| `Feature cards > AI & ML`      | Card icon + title + description present      |
| `Feature cards > DSA Tracker`  | Card icon + title + description present      |
| `Feature cards > exactly 3`    | DOM contains exactly 3 feature card elements |

### DSASheetPage Tests (`client/src/pages/DSASheetPage.test.jsx`) — 14 tests

| Test                                               | What it verifies                                           |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `renders the page title`                           | "A2Z DSA Sheet" heading displayed                          |
| `shows the progress bar at 0%`                     | Progress shows 0/455                                       |
| **Accordion – Step headers**                       |                                                            |
| `renders all step headers on one page`             | Accordion container + representative step titles present   |
| `shows progress count on each step header`         | Step 1 header shows completion count (0/N)                 |
| `all steps are collapsed by default`               | No subtopics or problems visible on initial render         |
| **Accordion – Expanding steps**                    |                                                            |
| `clicking a step expands its subtopics`            | Step 1 subtopics appear after click                        |
| `clicking an expanded step collapses it`           | Subtopics disappear after second click                     |
| `multiple steps can be open simultaneously`        | Steps 1 and 2 can both be expanded at the same time        |
| **Accordion – Expanding subtopics (problems)**     |                                                            |
| `clicking a subtopic reveals its problems table`   | Problems like "User Input / Output" appear                 |
| `can check a problem as completed`                 | Checkbox toggles completion, progress updates to 1/455     |
| `shows difficulty labels with color`               | Easy/Medium/Hard labels rendered                           |
| `clicking a subtopic again collapses the problems` | Problems disappear after second click on the same subtopic |

## Adding New Features

When adding a new feature, follow this checklist:

1. **Server route/model** — Add to `server/` and create tests in `server/__tests__/`
2. **Client component** — Add to `client/src/` and create a co-located `.test.jsx` file
3. **Documentation** — Update this README: add the endpoint to [API Endpoints](#api-endpoints), the feature to [Features](#features), and the tests to [Test Coverage](#test-coverage)
4. **Verify** — Run `npm test` from root to ensure nothing is broken

## Available Scripts (Quick Reference)

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Start both server + client in dev mode |
| `npm run dev:server`  | Start only the Express server          |
| `npm run dev:client`  | Start only the React dev server        |
| `npm run build`       | Build client for production            |
| `npm test`            | Run all tests (server + client)        |
| `npm run test:server` | Run server tests only                  |
| `npm run test:client` | Run client tests only                  |
| `npm run test:watch`  | Run all tests in watch mode            |
| `npm run install:all` | Install deps in both server + client   |

### Client-only Scripts (run from `client/`)

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run build:ghpages` | Build with GitHub Pages base path (`/AlgoJourney/`) |
| `npm run deploy`        | Build and deploy to GitHub Pages via `gh-pages`     |

## License

ISC
