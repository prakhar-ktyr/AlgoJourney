---
title: Testing Terminology
---

# Testing Terminology

Before diving deeper into testing techniques and tools, you need a solid grasp of the
vocabulary used by QA professionals, developers, and project managers. This lesson
provides precise definitions for the most important testing terms, organized by category.

Mastering this terminology will help you:
- Communicate clearly with your team
- Understand test documentation and bug reports
- Navigate job interviews confidently
- Read testing literature and standards (like ISTQB) without confusion

---

## Core Concepts

### Test Case

A **test case** is a set of conditions, inputs, and expected results designed to verify
a specific aspect of the software's behavior.

A well-written test case includes:

| Component           | Description                                         |
|---------------------|-----------------------------------------------------|
| Test Case ID        | Unique identifier (e.g., TC-LOGIN-001)              |
| Title               | Brief description of what is being tested           |
| Preconditions       | What must be true before the test runs              |
| Test Steps          | Exact actions to perform                            |
| Test Data           | Specific inputs to use                              |
| Expected Result     | What should happen if the software works correctly  |
| Actual Result       | What actually happened (filled during execution)    |
| Status              | Pass, Fail, Blocked, or Skipped                     |

**Example:**
- **Title:** Verify login with valid credentials
- **Preconditions:** User account exists, user is on login page
- **Steps:** 1. Enter valid email. 2. Enter valid password. 3. Click "Login"
- **Expected Result:** User is redirected to the dashboard

### Test Suite

A **test suite** is a collection of related test cases grouped together for a specific
purpose. Test suites are typically organized by:
- Feature (Login Suite, Payment Suite)
- Type (Smoke Test Suite, Regression Suite)
- Priority (Critical Path Suite, Edge Case Suite)
- Sprint or release

Running an entire test suite gives you confidence about a particular area of the
application.

### Test Plan

A **test plan** is a document that describes the scope, approach, resources, and
schedule of testing activities for a project or release.

A test plan typically includes:
- **Objectives:** What testing aims to achieve
- **Scope:** What will and will not be tested
- **Strategy:** Approach and techniques to use
- **Schedule:** Timeline and milestones
- **Resources:** People, tools, environments needed
- **Entry/Exit Criteria:** When testing starts and when it's "done"
- **Risk Assessment:** What could go wrong and contingencies
- **Deliverables:** Test reports, bug reports, metrics

### Test Scenario

A **test scenario** is a high-level description of what to test, without detailed steps.
It represents a real-world user action or business workflow.

**Example test scenarios for an e-commerce site:**
- Scenario 1: User searches for a product and adds it to cart
- Scenario 2: User completes checkout with a credit card
- Scenario 3: User returns a purchased item

Each scenario may have multiple test cases covering different variations (valid data,
invalid data, edge cases).

### Relationship Between These Concepts

```
Test Plan (overall strategy)
  └── Test Suites (grouped by feature/type)
        └── Test Cases (specific verifications)
              └── Test Steps (individual actions)
```

A test scenario sits alongside test cases as a higher-level description that one or
more test cases implement.

---

## Bug-Related Terms

Understanding the precise difference between these terms is crucial for accurate
communication:

### Error (Mistake)

An **error** is a human action that produces an incorrect result. It's the mistake
made by a developer, designer, or analyst.

**Example:** A developer writes `if (age > 18)` when the requirement says "18 and
older" — the correct code should be `if (age >= 18)`.

### Defect (Bug)

A **defect** is a flaw in the software product — the manifestation of an error in
the code, documentation, or design.

**Example:** The code contains `if (age > 18)` instead of `if (age >= 18)`. This
is the defect in the codebase.

### Failure

A **failure** is the observable deviation of the software from its expected behavior
during execution. It's what happens when a defect is triggered.

**Example:** An 18-year-old user is denied access to a feature that should be
available to users aged 18 and older. This is the failure visible to the user.

### The Causal Chain

```
Error (human mistake) → Defect (flaw in code) → Failure (incorrect behavior)
```

Important notes:
- Not every error leads to a defect (it might be caught in code review)
- Not every defect leads to a failure (the buggy code might never execute)
- A single defect can cause multiple failures
- A single failure might be caused by multiple defects

### Bug Report

A **bug report** (or defect report) documents a discovered defect. A good bug report
includes:

| Field             | Description                                    |
|-------------------|------------------------------------------------|
| ID                | Unique identifier                              |
| Title             | Clear, concise summary                         |
| Severity          | Impact on the system                           |
| Priority          | Urgency of the fix                             |
| Steps to Reproduce| Exact steps to trigger the bug                 |
| Expected Behavior | What should happen                             |
| Actual Behavior   | What actually happens                          |
| Environment       | OS, browser, version, etc.                     |
| Screenshots/Logs  | Visual evidence or error logs                  |
| Assignee          | Who is responsible for fixing                  |
| Status            | New, Open, In Progress, Fixed, Closed, etc.    |

---

## Severity vs Priority

These two concepts are frequently confused but represent fundamentally different
dimensions of a bug:

### Severity

**Severity** measures the **technical impact** of a defect on the system. It answers:
"How badly does this break things?"

| Level      | Description                                          | Example                              |
|------------|------------------------------------------------------|--------------------------------------|
| Critical   | System crash, data loss, security breach             | App crashes on launch                |
| Major      | Major feature broken, no workaround                  | Cannot complete checkout             |
| Moderate   | Feature impaired but workaround exists               | Search fails but filtering works     |
| Minor      | Cosmetic issue, trivial impact                       | Typo on settings page                |

### Priority

**Priority** measures the **business urgency** of fixing a defect. It answers:
"How soon must this be fixed?"

| Level    | Description                                            | Example                              |
|----------|--------------------------------------------------------|--------------------------------------|
| Urgent   | Fix immediately, blocks release                        | Security vulnerability in production |
| High     | Fix in current sprint/iteration                        | Login broken for new users           |
| Medium   | Fix in next sprint/iteration                           | Minor UX issue on popular page       |
| Low      | Fix when convenient                                    | Typo on rarely-visited page          |

### Severity ≠ Priority

These dimensions are independent. Here are examples of each combination:

| Combination              | Example                                               |
|--------------------------|-------------------------------------------------------|
| High Severity, High Priority | Payment processing crashes for all users           |
| High Severity, Low Priority  | App crashes on an obsolete browser nobody uses      |
| Low Severity, High Priority  | Company logo is wrong on the homepage (CEO noticed) |
| Low Severity, Low Priority   | Misaligned icon on admin panel                      |

The distinction matters because:
- **Developers** care about severity (how complex is the fix?)
- **Business stakeholders** care about priority (how much does it affect users/revenue?)
- The **product manager** typically sets priority
- The **tester/developer** typically assesses severity

---

## Types of Test Runs

### Regression Testing

**Regression testing** verifies that previously working functionality still works after
code changes. When you fix a bug or add a feature, regression tests ensure you haven't
accidentally broken something else.

Key characteristics:
- Performed after every code change
- Ideally automated (regression suites can be large)
- Grows over time as new tests are added
- Critical for continuous delivery

**The name comes from "regressing"** — software going backward to a previously broken
state.

### Smoke Testing

**Smoke testing** (also called build verification testing) is a quick, shallow test
to verify that the most critical functions of the application work after a new build
or deployment.

Think of it as a "sanity check" before investing time in deeper testing.

Origin: The term comes from hardware testing — when you plug in a new circuit board
and turn it on, if it doesn't smoke, it passes the smoke test.

**Characteristics:**
- Fast to execute (minutes, not hours)
- Covers only critical paths
- Pass = proceed with full testing
- Fail = reject the build immediately
- Typically the first tests run in a CI pipeline

**Example smoke test for a web app:**
1. Does the application start without errors?
2. Can a user log in?
3. Does the main page load?
4. Can the core feature be accessed?

### Sanity Testing

**Sanity testing** is a narrow, focused test to verify that a specific bug fix or
feature works as expected, without testing the entire system.

| Aspect       | Smoke Testing                  | Sanity Testing                  |
|--------------|--------------------------------|---------------------------------|
| **Scope**    | Broad (critical paths)         | Narrow (specific fix/feature)   |
| **When**     | After every new build          | After a specific change         |
| **Purpose**  | Is the build stable enough?    | Does this fix actually work?    |
| **Depth**    | Shallow                        | Slightly deeper but focused     |

---

## Testing Approaches

### Black Box Testing

**Black box testing** examines the software's functionality without knowledge of its
internal structure, code, or implementation details.

The tester knows:
- What the software should do (requirements)
- What inputs to provide
- What outputs to expect

The tester does NOT know:
- How the code is written
- Internal data structures
- Algorithms used
- Database schema

**Analogy:** Testing a vending machine — you put in money, press buttons, and verify
you get the right product. You don't need to know how the mechanism works inside.

### White Box Testing

**White box testing** (also called clear box, glass box, or structural testing)
examines the software's internal structure. The tester has full visibility into
the code.

The tester knows:
- Source code
- Internal logic and data flow
- Architecture and design
- Database structure

Techniques include:
- Statement coverage
- Branch coverage
- Path coverage
- Condition coverage

**Analogy:** Testing a vending machine by opening it up, examining every gear and
circuit, and verifying each internal mechanism operates correctly.

### Gray Box Testing

**Gray box testing** combines elements of both. The tester has partial knowledge of
the internal structure — enough to design better tests, but testing from the
external interface.

**Example:** A tester knows the database schema and can verify that data is stored
correctly, but tests through the user interface rather than calling internal functions.

### Comparison

| Aspect            | Black Box          | White Box           | Gray Box           |
|-------------------|--------------------|---------------------|--------------------|
| **Knowledge**     | No internal info   | Full code access    | Partial knowledge  |
| **Performed by**  | Testers            | Developers          | Either             |
| **Focus**         | Requirements       | Code structure      | Both               |
| **Techniques**    | Equivalence, BVA   | Coverage, paths     | Mixed              |
| **Level**         | System, acceptance | Unit, integration   | Integration        |

---

## Test Design Techniques

### Positive Testing

**Positive testing** verifies that the system works correctly with valid, expected
inputs. It confirms the "happy path."

**Examples:**
- Entering a valid email and password to log in
- Adding an in-stock item to the cart
- Submitting a form with all required fields filled correctly

### Negative Testing

**Negative testing** verifies that the system handles invalid, unexpected, or malicious
inputs gracefully without crashing or producing incorrect results.

**Examples:**
- Entering an invalid email format
- Submitting a form with required fields empty
- Entering SQL injection in a search box
- Uploading a file exceeding the size limit

Both are essential. Positive testing confirms features work; negative testing confirms
the system is robust.

### Boundary Value Analysis (BVA)

**Boundary value analysis** focuses on testing at the edges of input ranges, where
bugs most commonly occur.

If a field accepts values from 1 to 100:

| Test Values    | Category          | Why Test Here?                    |
|----------------|-------------------|-----------------------------------|
| 0              | Below minimum     | Invalid — should be rejected      |
| 1              | Minimum boundary  | Edge of valid range               |
| 2              | Just above minimum| First "normal" valid value        |
| 50             | Middle            | Typical valid value               |
| 99             | Just below maximum| Last "normal" valid value         |
| 100            | Maximum boundary  | Edge of valid range               |
| 101            | Above maximum     | Invalid — should be rejected      |

Bugs cluster at boundaries because developers often confuse `<` with `<=`, or
`>` with `>=`.

### Equivalence Partitioning

**Equivalence partitioning** divides the input domain into classes (partitions) where
all values in a class should behave the same way. You then test one representative
value from each partition.

**Example:** An age field that accepts 18-65:

| Partition        | Range    | Representative Value | Expected          |
|------------------|----------|---------------------|-------------------|
| Below valid      | < 18     | 10                  | Rejected          |
| Valid            | 18–65    | 35                  | Accepted          |
| Above valid      | > 65     | 70                  | Rejected          |

The insight: if the system handles 35 correctly, it will likely handle 25, 40, or 55
the same way. You don't need to test every value — just one from each partition.

BVA and equivalence partitioning are often used together for comprehensive coverage
with minimal test cases.

---

## Test Infrastructure

### Test Fixture

A **test fixture** (or test context) is the fixed state used as a baseline for running
tests. It includes everything needed to set up the test environment.

**Examples of fixtures:**
- A database pre-loaded with known test data
- Configuration files set to specific values
- Mock objects or stubs
- A logged-in user session
- Files placed in specific directories

Fixtures ensure tests are:
- **Repeatable** — same starting state every time
- **Independent** — one test doesn't affect another
- **Predictable** — known inputs produce known outputs

### Test Harness

A **test harness** is a collection of software and test data configured to test a
program under various conditions. It includes:
- Test execution engine (the framework that runs tests)
- Test data
- Stubs and drivers (for testing components in isolation)
- Results reporting

The harness automates the mechanics of testing — executing tests, collecting results,
and reporting outcomes.

### Test Oracle

A **test oracle** is the mechanism or source that determines whether a test has passed
or failed. It provides the expected result to compare against.

Types of oracles:
- **Specification:** The requirements document says what should happen
- **Previous version:** The old version's behavior is the baseline
- **Comparable system:** Another implementation that produces correct results
- **Human judgment:** A person determines if the result "looks right"
- **Statistical:** Results fall within acceptable statistical bounds

---

## Process Terms

### Test Coverage

**Test coverage** measures how much of the software has been exercised by tests. It
can be measured at different levels:

| Type                | What It Measures                                    |
|---------------------|-----------------------------------------------------|
| Statement Coverage  | Percentage of code statements executed              |
| Branch Coverage     | Percentage of decision branches taken               |
| Path Coverage       | Percentage of execution paths traversed             |
| Function Coverage   | Percentage of functions called                      |
| Requirement Coverage| Percentage of requirements tested                   |

High coverage ≠ high quality. You can have 100% line coverage with tests that never
check the results. Coverage is a useful metric but not a goal in itself.

### Test Environment

The **test environment** is the hardware, software, network, and configuration in
which tests are executed. Types include:

- **Development environment:** Developer's local machine
- **Integration environment:** Shared server for integration testing
- **Staging environment:** Production-like environment for final validation
- **Production environment:** The live system (for monitoring, not testing)

### Test Data

**Test data** is the input data used during test execution. It includes:
- Valid data for positive testing
- Invalid data for negative testing
- Boundary values
- Large data sets for performance testing
- Sensitive data (must be anonymized/masked)

Good test data management is critical — tests are only as good as their data.

---

## Comprehensive Glossary

| Term                     | Definition                                                      |
|--------------------------|-----------------------------------------------------------------|
| Acceptance Testing       | Testing to determine if a system meets business requirements     |
| Ad-hoc Testing           | Informal testing without a plan or documentation                 |
| Alpha Testing            | Internal testing before external beta release                    |
| Assertion                | A statement that checks if a condition is true in a test         |
| Beta Testing             | Testing by real users in a real environment before release        |
| Build                    | A compiled/packaged version of the software ready for testing    |
| Code Review              | Peer examination of source code for defects                      |
| Compatibility Testing    | Verifying software works across different environments           |
| Concurrency Testing      | Testing behavior under simultaneous operations                   |
| Data-Driven Testing      | Running same tests with different data sets                      |
| Defect Density           | Number of defects per unit of code size                          |
| Defect Leakage           | Defects that escape to production undetected                     |
| End-to-End Testing       | Testing the complete workflow from start to finish                |
| Entry Criteria           | Conditions that must be met before testing begins                |
| Exit Criteria            | Conditions that must be met before testing is considered done     |
| Exploratory Testing      | Simultaneous learning, test design, and execution                |
| Failover Testing         | Testing system behavior when components fail                     |
| False Positive           | A test reports failure when there is no actual defect            |
| False Negative           | A test reports success when a defect actually exists             |
| Flaky Test               | A test that sometimes passes and sometimes fails without changes |
| Integration Testing      | Testing interactions between combined components                 |
| Load Testing             | Testing system behavior under expected load                      |
| Localization Testing     | Verifying software works for specific locales/languages          |
| Mocking                  | Replacing dependencies with controlled substitutes               |
| Monkey Testing           | Random testing without a plan to find unexpected crashes         |
| Pair Testing             | Two people testing together (often tester + developer)           |
| Performance Testing      | Evaluating system speed, scalability, and stability              |
| Regression Bug           | A previously working feature that broke due to changes           |
| Release Candidate        | A build potentially ready for production release                 |
| Retesting                | Running failed tests after a defect fix to confirm resolution    |
| Risk-Based Testing       | Prioritizing testing by risk of failure and business impact      |
| Scalability Testing      | Testing system's ability to handle growth                        |
| Security Testing         | Finding vulnerabilities and verifying protections                |
| Stress Testing           | Testing beyond normal capacity to find breaking points           |
| Stub                     | A minimal implementation replacing a dependency in testing       |
| Test Automation          | Using tools to execute tests without human intervention          |
| Test Driven Development  | Writing tests before writing the implementation code             |
| Traceability Matrix      | Mapping requirements to test cases to ensure coverage            |
| Usability Testing        | Evaluating how easy the software is to use                       |
| User Acceptance Testing  | Final testing by end-users to validate the product               |
| Volume Testing           | Testing with large quantities of data                            |

---

## Summary

This lesson covered the essential vocabulary of software testing. These terms form
the foundation for everything that follows in this course.

Key takeaways:
- **Test cases** are specific and detailed; **test scenarios** are high-level
- **Errors** are human mistakes, **defects** are code flaws, **failures** are visible problems
- **Severity** is technical impact; **priority** is business urgency
- **Smoke tests** are broad and quick; **sanity tests** are narrow and focused
- **Black box** ignores internals; **white box** examines code; **gray box** uses partial knowledge
- **BVA** and **equivalence partitioning** help you design efficient test cases
- **Fixtures** provide test state; **harnesses** execute tests; **oracles** determine pass/fail

Keep this lesson as a reference — you'll encounter these terms throughout your
testing career, in documentation, in job interviews, and in daily team communication.
