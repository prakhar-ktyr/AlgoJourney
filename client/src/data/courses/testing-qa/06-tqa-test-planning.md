---
title: Test Planning & Strategy
---

# Test Planning & Strategy

Test planning is the foundation of any structured testing effort. A well-crafted test plan provides direction, sets expectations, and ensures that testing activities align with project goals. Without a plan, testing becomes ad-hoc, inconsistent, and prone to missing critical defects.

---

## What Is a Test Plan?

A **test plan** is a document that describes the scope, approach, resources, schedule, and activities for testing a software product. It serves as a blueprint for the entire testing effort.

### What Goes in a Test Plan

A comprehensive test plan typically includes:

- **Test Plan Identifier** — unique ID for tracking
- **Introduction** — purpose and overview of the document
- **Test Items** — features or modules to be tested
- **Features to Be Tested** — specific functionalities in scope
- **Features Not to Be Tested** — explicitly excluded items with justification
- **Approach** — overall testing strategy and techniques
- **Pass/Fail Criteria** — what constitutes a successful test
- **Suspension and Resumption Criteria** — when to pause and restart testing
- **Test Deliverables** — documents, reports, and artifacts produced
- **Testing Tasks** — activities required to complete testing
- **Environmental Needs** — hardware, software, tools required
- **Responsibilities** — who does what
- **Staffing and Training Needs** — skills required and training plan
- **Schedule** — timeline and milestones
- **Risks and Contingencies** — potential problems and mitigation

---

## Test Strategy vs Test Plan

These two terms are often confused but serve different purposes:

### Test Strategy

| Aspect | Test Strategy | Test Plan |
|--------|--------------|-----------|
| Scope | Organization-wide or program-level | Project-specific |
| Author | Test manager or QA lead | Test lead or senior tester |
| Lifespan | Long-lived, rarely changes | Created per project/release |
| Content | High-level approach, standards | Detailed activities, schedule |
| Focus | "How we test in general" | "How we test this project" |

### Test Strategy Components

A test strategy typically defines:

1. **Testing levels** — unit, integration, system, acceptance
2. **Testing types** — functional, performance, security, usability
3. **Test design techniques** — which techniques to apply and when
4. **Entry and exit criteria templates** — standard criteria across projects
5. **Test metrics** — what to measure and report
6. **Tool strategy** — approved tools and their usage
7. **Defect management process** — how bugs are tracked and resolved
8. **Test environment strategy** — environment provisioning approach

### When to Use Which

- Use a **test strategy** when establishing organizational testing standards
- Use a **test plan** when planning testing for a specific project or release
- A test plan should reference and comply with the test strategy

---

## Risk-Based Testing

Risk-based testing prioritizes testing effort based on the likelihood and impact of failures. Not all features carry equal risk, so testing resources should be allocated proportionally.

### Risk Assessment Process

1. **Identify risks** — what could go wrong?
2. **Assess likelihood** — how probable is the failure?
3. **Assess impact** — how severe would the consequences be?
4. **Calculate risk level** — likelihood × impact
5. **Prioritize testing** — test high-risk areas first and more thoroughly

### Risk Matrix

| | Low Impact | Medium Impact | High Impact |
|---|-----------|---------------|-------------|
| **High Likelihood** | Medium Priority | High Priority | Critical Priority |
| **Medium Likelihood** | Low Priority | Medium Priority | High Priority |
| **Low Likelihood** | Low Priority | Low Priority | Medium Priority |

### Risk Categories

**Technical Risks:**
- Complex algorithms with many edge cases
- Third-party integrations
- New or unfamiliar technology
- Performance-critical modules
- Security-sensitive features

**Business Risks:**
- Features with high user visibility
- Revenue-generating functionality
- Regulatory compliance requirements
- Features with legal implications
- Core business workflows

### Applying Risk-Based Testing

For **critical priority** items:
- Apply multiple test design techniques
- Include positive, negative, and boundary tests
- Perform exploratory testing
- Automate regression tests
- Test under stress conditions

For **low priority** items:
- Basic positive path testing
- Rely on developer unit tests
- Test only during regression cycles
- Apply minimal test design techniques

---

## Entry and Exit Criteria

Entry and exit criteria define when testing should begin and when it can be considered complete.

### Entry Criteria

Conditions that must be met before testing starts:

- Test environment is set up and accessible
- Test data is prepared and loaded
- Build is deployed to test environment
- Build passes smoke tests
- Required test documentation is reviewed and approved
- All blocking defects from previous cycle are resolved
- Test tools are installed and configured
- Testable requirements are baselined

### Exit Criteria

Conditions that must be met before testing is complete:

- All planned test cases are executed
- Defect density falls below threshold (e.g., < 2 critical bugs per module)
- Test coverage meets target (e.g., 95% of requirements covered)
- All critical and major defects are resolved or deferred with approval
- Performance benchmarks are met
- No open critical or high-severity defects
- Test summary report is prepared and reviewed
- Stakeholder sign-off obtained

### Suspension Criteria

Conditions that warrant pausing testing:

- Critical environment failure
- Build is too unstable for meaningful testing
- Blocking defect rate exceeds threshold
- Required resources become unavailable
- Scope changes requiring test plan revision

### Resumption Criteria

Conditions for restarting after suspension:

- Root cause of suspension is resolved
- New build is deployed and smoke-tested
- Environment stability is confirmed
- Updated test plan is approved (if scope changed)

---

## Resource Planning, Schedule, and Deliverables

### Resource Planning

Identify what you need:

**Human Resources:**
- Number of testers (manual and automation)
- Required skill sets (domain knowledge, tool expertise)
- Training needs and timeline
- Availability (full-time, part-time, shared)

**Technical Resources:**
- Test environments (hardware, software, network)
- Test tools (management, automation, performance)
- Test devices (mobile, tablets, browsers)
- Access credentials and permissions

**Data Resources:**
- Test data sets
- Data generation tools
- Data refresh procedures
- Data masking for sensitive information

### Schedule Planning

A testing schedule should include:

1. **Test preparation phase**
   - Environment setup: 3–5 days
   - Test data preparation: 2–3 days
   - Test case review: 2–3 days

2. **Test execution phase**
   - Cycle 1 (new features): estimated duration
   - Cycle 2 (regression): estimated duration
   - Exploratory testing: allocated time

3. **Test closure phase**
   - Defect triage: ongoing
   - Test summary report: 1–2 days
   - Lessons learned: 1 day

### Test Deliverables

| Phase | Deliverable | Description |
|-------|-------------|-------------|
| Before Testing | Test Plan | Overall testing approach and scope |
| Before Testing | Test Cases | Detailed test scenarios |
| Before Testing | Test Data | Prepared datasets |
| During Testing | Test Execution Logs | Results of each test run |
| During Testing | Defect Reports | Bugs found during testing |
| During Testing | Daily Status Reports | Progress updates |
| After Testing | Test Summary Report | Final results and metrics |
| After Testing | Metrics Report | Coverage, defect density, etc. |
| After Testing | Lessons Learned | What worked, what didn't |

---

## Test Estimation Techniques

Accurate estimation prevents under-testing (missed defects) and over-testing (wasted resources).

### Function Point Analysis

Estimate testing effort based on the complexity of features:

1. **Count function points** — inputs, outputs, inquiries, files, interfaces
2. **Assign complexity** — simple, average, complex
3. **Calculate weighted total** — sum of (count × weight)
4. **Apply productivity factor** — hours per function point (from historical data)

Example:
- Login feature: 3 inputs (username, password, submit) × average complexity = 12 FP
- Historical rate: 2 hours per function point
- Estimated effort: 24 hours for login testing

### Experience-Based Estimation

Leverage historical data and expert judgment:

**Analogy-based:**
- Compare with similar past projects
- Adjust for known differences (complexity, team, technology)

**Expert judgment (Delphi technique):**
1. Each expert estimates independently
2. Share estimates anonymously
3. Discuss outliers
4. Re-estimate until consensus

**Three-point estimation:**
- Optimistic (O): best case
- Most Likely (M): expected case
- Pessimistic (P): worst case
- Estimate = (O + 4M + P) / 6

### Work Breakdown Structure (WBS) Approach

Break testing into smaller tasks and estimate each:

| Task | Optimistic | Most Likely | Pessimistic | Estimate |
|------|-----------|-------------|-------------|----------|
| Write test cases for Module A | 8h | 12h | 20h | 12.7h |
| Execute test cases for Module A | 16h | 24h | 40h | 25.3h |
| Regression testing | 8h | 16h | 32h | 17.3h |
| Bug verification | 4h | 8h | 16h | 8.7h |
| **Total** | | | | **64h** |

### Percentage Distribution Method

Allocate testing effort as a percentage of development effort:

- Small project: testing = 25–35% of development
- Medium project: testing = 35–45% of development
- Complex/critical project: testing = 45–60% of development

---

## Sample Test Plan Structure (Template)

Below is a practical template you can adapt for your projects:

### 1. Document Information

```
Test Plan ID: TP-2024-001
Project Name: [Project Name]
Version: 1.0
Author: [Name]
Date: [Date]
Status: Draft / Under Review / Approved
```

### 2. Introduction

- Purpose of this test plan
- Intended audience
- References to related documents (requirements, design, strategy)

### 3. Scope

**In Scope:**
- List specific features and modules to be tested
- List testing types to be performed (functional, performance, etc.)

**Out of Scope:**
- List items explicitly excluded with reasoning
- Example: "Third-party payment gateway internals — tested by vendor"

### 4. Test Approach

- Testing levels: unit, integration, system, UAT
- Testing types: functional, regression, smoke, performance
- Test design techniques: equivalence partitioning, boundary value, etc.
- Automation scope: what will be automated and with which tools

### 5. Entry and Exit Criteria

- Entry criteria (see section above)
- Exit criteria (see section above)
- Suspension/resumption criteria

### 6. Test Environment

- Hardware requirements
- Software requirements (OS, browsers, databases)
- Network configuration
- Test tools and versions
- Environment setup responsibilities

### 7. Test Schedule

| Milestone | Start Date | End Date | Responsible |
|-----------|-----------|----------|-------------|
| Test planning | | | |
| Test case design | | | |
| Environment setup | | | |
| Test execution cycle 1 | | | |
| Test execution cycle 2 | | | |
| Regression testing | | | |
| UAT support | | | |
| Test closure | | | |

### 8. Resource Allocation

| Role | Name | Allocation | Responsibilities |
|------|------|-----------|-----------------|
| Test Lead | | 100% | Planning, coordination, reporting |
| Senior Tester | | 100% | Test design, execution, mentoring |
| Tester | | 100% | Test execution, bug reporting |
| Automation Engineer | | 50% | Framework, scripts, maintenance |

### 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Environment instability | Medium | High | Dedicated env admin, daily health checks |
| Late requirement changes | High | Medium | Buffer time, change control process |
| Resource unavailability | Low | High | Cross-training, backup assignments |

### 10. Deliverables

- List all documents and artifacts to be produced
- Include review and approval process

### 11. Approval

| Name | Role | Signature | Date |
|------|------|-----------|------|
| | Project Manager | | |
| | Test Manager | | |
| | Business Analyst | | |

---

## Key Takeaways

1. **A test plan is your roadmap** — it ensures nothing is forgotten and everyone knows the plan
2. **Strategy is organizational, plan is project-specific** — understand the hierarchy
3. **Risk-based testing maximizes ROI** — focus effort where failures matter most
4. **Clear entry/exit criteria prevent disputes** — everyone agrees on "done"
5. **Estimation improves with data** — track actuals to refine future estimates
6. **Templates save time** — adapt rather than create from scratch
7. **Living documents** — update the plan as the project evolves

---

## Summary

Test planning transforms testing from a reactive activity into a proactive, strategic discipline. A solid test plan ensures adequate coverage, efficient resource use, and clear communication with stakeholders. Combined with risk-based prioritization and realistic estimation, test planning enables teams to deliver quality software within constraints of time and budget.
