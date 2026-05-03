---
title: SDLC & Testing
---

# SDLC & Testing

The Software Development Life Cycle (SDLC) defines how software is planned, built,
tested, and delivered. Different SDLC models treat testing very differently — some
relegate it to a late-stage phase, while others weave it into every activity from
day one.

Understanding how testing integrates with each model helps you choose the right
approach for your project and advocate for quality at every stage.

---

## Waterfall Model

The Waterfall model is the oldest and most linear SDLC approach. Each phase must be
completed before the next begins, flowing downward like a waterfall.

### The Phases

```
Requirements  →  Design  →  Implementation  →  Testing  →  Deployment  →  Maintenance
```

Each phase produces a deliverable that feeds into the next:

| Phase           | Output                        | Testing Involvement        |
|-----------------|-------------------------------|----------------------------|
| Requirements    | Requirements document (SRS)   | None (traditionally)       |
| Design          | Design documents, architecture| None (traditionally)       |
| Implementation  | Source code                   | None (traditionally)       |
| Testing         | Test reports, bug fixes       | All testing happens here   |
| Deployment      | Released software             | Verification only          |
| Maintenance     | Patches, updates              | Regression testing         |

### Problems with Waterfall Testing

The Waterfall model concentrates all testing into a single phase that occurs **after**
all code is written. This creates several serious problems:

**1. Late defect discovery**

Bugs in requirements or design are not found until testing — months after they were
introduced. By then, they're deeply embedded in the code and extremely expensive to fix.

**2. Compressed testing timelines**

When development runs late (as it often does), the testing phase gets squeezed.
Stakeholders pressure teams to "test faster" or skip tests to meet deadlines.

**3. No feedback loop**

Testers cannot influence requirements or design because those phases are already
complete. Fundamental flaws must be lived with or require costly rework.

**4. Big-bang integration**

All components are integrated at once during testing, making it extremely difficult
to isolate the source of failures.

**5. Limited stakeholder involvement**

Users don't see the software until after testing is complete. If it doesn't meet
their needs, the entire project may need to restart.

### When Waterfall Testing Works

Despite its drawbacks, Waterfall testing can work for:
- Projects with stable, well-understood requirements
- Regulated industries requiring extensive documentation
- Small projects with minimal complexity
- Hardware-dependent projects with fixed specifications

---

## V-Model (Verification and Validation Model)

The V-Model addresses Waterfall's biggest weakness by pairing each development phase
with a corresponding testing phase. The left side represents development activities
(going down), and the right side represents testing activities (going up).

### The V-Shape

```
Requirements Analysis          ←→          Acceptance Testing
        \                                         /
    System Design              ←→      System Testing
            \                                 /
      Architecture Design      ←→   Integration Testing
              \                           /
         Module Design         ←→    Unit Testing
                \                     /
              Implementation (Coding)
```

### Phase Mapping

| Development Phase      | Corresponding Test Phase   | What's Verified              |
|------------------------|----------------------------|------------------------------|
| Requirements Analysis  | Acceptance Testing         | Business needs met           |
| System Design          | System Testing             | System-level requirements    |
| Architecture Design    | Integration Testing        | Component interactions       |
| Module Design          | Unit Testing               | Individual module logic      |

### Key Principles

**1. Early test planning**

Test cases are designed during the corresponding development phase — not after coding
is complete. When requirements are written, acceptance test cases are designed
simultaneously.

**2. Traceability**

Every requirement can be traced to a test case, and every test case traces back to
a requirement. This ensures nothing falls through the cracks.

**3. Verification on the left, validation on the right**

The left side verifies work products (are we building it right?). The right side
validates the running software (are we building the right thing?).

### Advantages Over Waterfall

- Test design happens early (test cases exist before code is written)
- Clear relationship between development and testing activities
- Defects in requirements/design are caught earlier through test planning
- Structured and easy to manage

### Limitations

- Still sequential — no flexibility for changing requirements
- No working software until the bottom of the V
- Expensive for projects with evolving requirements
- Heavy documentation overhead

---

## Agile and Scrum

Agile methodologies fundamentally change the relationship between development and
testing. Instead of separate phases, testing is integrated into every iteration
(sprint).

### Agile Testing Principles

| Principle                                    | Implication for Testing                |
|----------------------------------------------|----------------------------------------|
| Working software over documentation          | Tests demonstrate working features     |
| Customer collaboration over contracts        | Testers collaborate with stakeholders  |
| Responding to change over following a plan   | Tests adapt as requirements evolve     |
| Individuals and interactions over processes  | Developers and testers work as one team|

### Testing in a Sprint

A typical two-week sprint includes testing throughout:

| Sprint Day    | Testing Activities                                          |
|---------------|-------------------------------------------------------------|
| Day 1-2       | Sprint planning: testers help refine user stories, define   |
|               | acceptance criteria, estimate test effort                    |
| Day 2-3       | Test planning: identify test scenarios, prepare test data    |
| Day 3-10      | Development + testing in parallel: TDD, pair programming,   |
|               | continuous testing as features are developed                 |
| Day 8-12      | Integration testing, exploratory testing, bug fixes          |
| Day 13        | Regression testing, sprint demo preparation                  |
| Day 14        | Sprint review (demo), retrospective                          |

### Agile Testing Quadrants

The Agile Testing Quadrants (from Brian Marick, popularized by Lisa Crispin and
Janet Gregory) organize testing types by their purpose:

```
         Business-Facing
              |
   Q2: Functional Tests     |  Q3: Exploratory Testing
   (Acceptance, Story)      |  (Usability, UAT, Alpha/Beta)
   Automated                |  Manual
              |
  ----------------------------|----------------------------
              |
   Q1: Technology Tests     |  Q4: Performance & Security
   (Unit, Component)        |  (Load, Stress, Security)
   Automated                |  Automated (tools)
              |
         Technology-Facing
              
   ←— Supporting the Team       Critiquing the Product —→
```

| Quadrant | Purpose                    | Approach        | Examples                    |
|----------|----------------------------|-----------------|-----------------------------|
| Q1       | Guide development          | Automated       | Unit tests, component tests |
| Q2       | Verify business logic      | Automated       | Acceptance tests, BDD       |
| Q3       | Explore and learn          | Manual          | Exploratory, usability      |
| Q4       | Evaluate non-functional    | Tools/automated | Performance, security       |

### Roles in Agile Testing

- **Whole team responsibility:** Quality is everyone's job, not just the tester's
- **Developers** write unit and integration tests
- **Testers** focus on exploratory testing, acceptance criteria, and test strategy
- **Product Owner** defines acceptance criteria and validates features
- **No "throwing over the wall"** — development and testing are not separate phases

### Definition of Done (DoD)

In Agile, a user story is not "done" until it meets the team's quality criteria:

- Code is written and peer-reviewed
- Unit tests pass
- Integration tests pass
- Acceptance criteria verified
- No critical or major bugs
- Documentation updated
- Deployed to staging and verified

---

## DevOps and Continuous Testing

DevOps extends Agile by eliminating the wall between development and operations,
enabling continuous delivery of software. Testing in DevOps is **continuous** —
automated tests run at every stage of the delivery pipeline.

### The CI/CD Pipeline

```
Code Commit → Build → Unit Tests → Integration Tests → Deploy to Staging →
    → Acceptance Tests → Performance Tests → Security Scan → Deploy to Production →
    → Production Monitoring
```

### Continuous Testing Stages

| Stage                    | Testing Activities                              | Speed      |
|--------------------------|-------------------------------------------------|------------|
| Pre-commit               | Linting, static analysis, fast unit tests       | Seconds    |
| Commit/Build             | Full unit test suite, compile checks            | Minutes    |
| Integration              | API tests, database tests, service integration  | Minutes    |
| Staging Deployment       | Smoke tests, sanity checks                      | Minutes    |
| Pre-Production           | Full regression, performance, security scans    | Hours      |
| Production               | Smoke tests, monitoring, synthetic transactions | Continuous |

### Key DevOps Testing Practices

**1. Infrastructure as Code (IaC) Testing**

Test environments are defined in code and can be spun up/down automatically. This
ensures consistency and enables parallel testing.

**2. Canary Releases**

Deploy to a small subset of users first. Monitor for errors before rolling out to
everyone. This is testing in production with controlled blast radius.

**3. Feature Flags**

Deploy code to production behind a flag. Enable/disable features without redeploying.
This allows testing in production without exposing unfinished features.

**4. Chaos Engineering**

Intentionally inject failures (kill servers, add latency, corrupt data) to verify
the system handles real-world failures gracefully.

**5. Observability as Testing**

Monitor production systems with metrics, logs, and traces. Detect anomalies that
indicate bugs that escaped all pre-production testing.

---

## Test Phases in Detail

Regardless of SDLC model, testing follows a logical sequence of activities:

### 1. Requirements Review

- Review requirements for testability
- Identify ambiguities, conflicts, and gaps
- Define acceptance criteria
- Create traceability matrix (requirement → test case)

### 2. Test Planning

- Define test strategy and approach
- Identify resources, tools, and environments needed
- Establish schedule and milestones
- Define entry and exit criteria
- Assess risks and plan mitigations

### 3. Test Design

- Create detailed test cases from requirements and scenarios
- Design test data
- Set up test environments and fixtures
- Write automation scripts (if applicable)
- Review test cases with developers and stakeholders

### 4. Test Execution

- Execute test cases (manual and automated)
- Log results (pass, fail, blocked, skipped)
- Report defects with full details
- Retest after fixes
- Track progress against plan

### 5. Test Reporting

- Summarize test results and coverage
- Report defect metrics (found, fixed, open, closed)
- Assess quality against exit criteria
- Provide go/no-go recommendation
- Highlight risks and outstanding issues

### 6. Test Closure

- Evaluate what went well and what to improve
- Archive test artifacts (cases, data, reports)
- Document lessons learned
- Release test environment resources
- Update processes based on retrospective

---

## Roles in Testing

### Developer

**Testing responsibilities:**
- Write unit tests for their code
- Participate in code reviews
- Fix defects found by testers
- Ensure code passes CI pipeline checks
- Practice TDD or write tests alongside code

### QA Engineer (Tester)

**Testing responsibilities:**
- Design and execute test cases
- Perform exploratory testing
- Report and track defects
- Maintain test documentation
- Verify bug fixes

### SDET (Software Development Engineer in Test)

**Testing responsibilities:**
- Build and maintain test automation frameworks
- Write automated test scripts
- Develop testing tools and infrastructure
- Integrate tests into CI/CD pipelines
- Mentor team on testing best practices

### Test Lead / QA Manager

**Testing responsibilities:**
- Define test strategy and approach
- Plan and allocate testing resources
- Monitor progress and risks
- Report quality metrics to stakeholders
- Coordinate between development and testing
- Make go/no-go release decisions

### Comparison

| Aspect           | Developer      | QA Engineer    | SDET           | Test Lead     |
|------------------|----------------|----------------|----------------|---------------|
| **Focus**        | Code quality   | Product quality| Test tooling   | Strategy      |
| **Tests written**| Unit, some int.| Manual + some  | Automation     | Planning only |
| **Skills**       | Dev languages  | Domain, testing| Dev + testing  | Management    |
| **Perspective**  | Inside-out     | Outside-in     | Both           | High-level    |

---

## Shift-Left and Shift-Right Testing

### Shift-Left (Test Earlier)

Moving testing activities to the beginning of the development lifecycle:

| Traditional                          | Shift-Left                              |
|--------------------------------------|-----------------------------------------|
| Test after code is written           | Test during requirements/design         |
| Testers are downstream               | Testers are involved from day one       |
| Find bugs in testing phase           | Prevent bugs during development         |
| Long feedback loops                  | Immediate feedback                      |

**Shift-left practices:**
- TDD (Test-Driven Development)
- BDD (Behavior-Driven Development)
- Static code analysis in IDE
- Pre-commit hooks running tests
- Requirements reviews with testers
- Pair programming (developer + tester)

### Shift-Right (Test in Production)

Moving some testing activities past deployment into the production environment:

| Pre-Production Testing               | Shift-Right                             |
|--------------------------------------|-----------------------------------------|
| Simulated environments only          | Real user traffic and behavior          |
| Artificial test data                 | Real data (privacy-respecting)          |
| Limited scale                        | Full production scale                   |
| Controlled conditions                | Real-world chaos                        |

**Shift-right practices:**
- A/B testing with real users
- Canary deployments
- Feature flags for gradual rollout
- Production monitoring and alerting
- Chaos engineering
- Real User Monitoring (RUM)
- Synthetic monitoring (scheduled health checks)

### The Full Spectrum

```
←——— Shift Left ————————————————————————— Shift Right ———→

Requirements → Design → Code → Test → Deploy → Production → Monitor
     ↑           ↑        ↑      ↑       ↑          ↑           ↑
   Reviews    Design    TDD    Full    Smoke     Canary      Chaos
   BDD        reviews   SAST   suite   tests    releases    engineering
   Acceptance                          Feature   A/B        Monitoring
   criteria                            flags     testing    Alerting
```

The most mature organizations test across the entire spectrum — from the earliest
requirements discussions to production monitoring — creating a continuous quality
feedback loop.

---

## Choosing the Right Model

| Factor                    | Waterfall/V-Model    | Agile              | DevOps             |
|---------------------------|----------------------|--------------------|--------------------|
| Requirements stability    | Stable, well-known   | Evolving           | Continuously evolving|
| Team size                 | Any                  | Small-medium       | Any                |
| Release frequency         | Months/years         | Every 2-4 weeks    | Multiple per day   |
| Customer involvement      | Minimal during dev   | Frequent           | Continuous         |
| Testing approach          | Phase-based          | Embedded in sprints| Fully automated    |
| Automation level          | Low to moderate      | Moderate to high   | Very high          |
| Documentation             | Heavy                | Light              | As-code            |
| Feedback speed            | Slow                 | Fast               | Immediate          |
| Risk tolerance            | Low                  | Moderate           | High (with safety nets)|

---

## Summary

| Model       | Testing Philosophy                                           |
|-------------|--------------------------------------------------------------|
| Waterfall   | Testing is a distinct phase after development                |
| V-Model     | Each dev phase has a corresponding test phase                |
| Agile       | Testing is continuous within each sprint                     |
| DevOps      | Testing is automated across the entire delivery pipeline     |

Key takeaways:
- The SDLC model you use determines when and how testing happens
- Modern approaches (Agile, DevOps) integrate testing throughout development
- Shift-left catches bugs early and cheap; shift-right catches real-world issues
- Testing roles range from developers writing unit tests to SDETs building frameworks
- The trend is toward continuous, automated testing at every stage
- Choose your model based on requirements stability, team size, and release needs

The evolution from Waterfall to DevOps represents a fundamental shift: from testing
as a gate to testing as a continuous activity embedded in everything the team does.
