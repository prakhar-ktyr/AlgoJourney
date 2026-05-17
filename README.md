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

### E2E Tests (Playwright)

End-to-end tests run in a real headless Chromium browser and validate visual rendering, user interactions, and navigation flows:

```bash
cd client && npm run test:e2e      # headless (CI-friendly)
cd client && npm run test:e2e:ui   # interactive UI runner (requires display)
```

E2E tests live in `client/e2e/` and require system browser dependencies. Install them with:

```bash
npx playwright install --with-deps chromium
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
- **Resource column** — Per-problem "📘 Notes" link to an in-app course material page (`/dsa-sheet/problem/:slug`) with overview, concepts, approach, complexity, and a reference solution. The page has a language selector at the top (C++ / Java / Python / JavaScript) that swaps every code snippet; the choice persists in `localStorage` under `preferred-language`. Each code snippet has a one-click **Copy** button. Course content lives as Markdown files under [client/src/data/resources/](client/src/data/resources/) — one `<id>-<slug>.md` per problem with YAML frontmatter (`id`, `time`, `space`, `concepts`) and `## Overview` / `## Approach` / `## Solution` sections; solutions are authored as fenced code blocks tagged ` ```cpp `, ` ```java `, ` ```python `, ` ```javascript ` and loaded via Vite's `import.meta.glob`.
- **Difficulty indicators** — Color-coded Easy / Medium / Hard labels

### Reader Mode (Client)

Available on tutorial lesson pages and DSA problem resource pages — any page with substantial reading content:

- **Distraction-free view** — Hides navbar, footer, and sidebar for focused reading
- **Floating toolbar** (top-right) — Settings gear + exit button; click outside to dismiss settings panel
- **4 Themes** — Dark (default), Light, Sepia, Night
- **3 Font families** — Sans-serif, Serif, Monospace
- **4 Font sizes** — Small, Medium, Large, Extra-Large
- **Minimal navigation preserved** — Floating lesson menu (bottom-left) on tutorial pages; language selector on DSA pages; prev/next links always visible
- **Keyboard shortcut** — Press `Esc` to exit reader mode
- **Preferences persisted** — Theme, font, and size choices saved to `localStorage`

### Server

- **Health endpoint** — `GET /api/health` for uptime monitoring
- **CORS enabled** — Allows cross-origin requests from the client
- **JSON body parsing** — Accepts JSON request bodies
- **MongoDB connection** — Dedicated `db.js` module with error handling
- **Mongoose models** — User, Tutorial, DSAQuestion (see [Data Models](#data-models))

## Documentation

For deep technical details and contribution guidelines, see the following documents:

- **[API Endpoints](docs/api.md)**
- **[Data Models](docs/architecture/database.md)**
- **[Test Coverage](docs/testing.md)**
- **[Contributing & Adding Features](CONTRIBUTING.md)**

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
