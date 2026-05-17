# Test Coverage

This project has over 120 tests covering both the Express API and the React SPA.

## Server Tests (`server/__tests__/health.test.js`)

| Test                                        | What it verifies                                       |
| ------------------------------------------- | ------------------------------------------------------ |
| `Health API > returns status ok`            | `GET /api/health` returns `200` with correct JSON body |
| `Health API > returns JSON content-type`    | Response Content-Type header is `application/json`     |
| `Express middleware > CORS headers present` | CORS `access-control-allow-origin` header is set       |
| `Express middleware > parses JSON bodies`   | Express doesn't crash on JSON POST to unknown route    |
| `Unknown routes > 404 for /api/unknown`     | Non-existent API routes return 404                     |
| `Unknown routes > 404 for /does-not-exist`  | Non-existent root routes return 404                    |

## DB Module Test (`server/__tests__/db.test.js`)

| Test                 | What it verifies                   |
| -------------------- | ---------------------------------- |
| `exports a function` | `connectDB` is a callable function |

## User Model Tests (`server/__tests__/user.model.test.js`) — 18 tests

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

## Tutorial Model Tests (`server/__tests__/tutorial.model.test.js`) — 23 tests

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

## DSAQuestion Model Tests (`server/__tests__/dsaQuestion.model.test.js`) — 22 tests

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

## Client Tests (`client/src/App.test.jsx`)

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

## DSASheetPage Tests (`client/src/pages/DSASheetPage.test.jsx`) — 14 tests

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
