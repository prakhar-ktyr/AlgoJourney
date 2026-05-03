---
title: Exploratory Testing
---

## What Is Exploratory Testing?

Exploratory testing is a style of software testing that emphasizes the **simultaneous** nature of learning, test design, and test execution. Unlike scripted testing where test cases are written in advance, exploratory testing relies on the tester's skill, intuition, and creativity to discover defects in real time.

Key characteristics:

- **Learning**: Understanding the application as you test it
- **Test design**: Creating tests on the fly based on observations
- **Execution**: Running those tests immediately
- **Adaptation**: Adjusting your approach based on results

Exploratory testing is not ad-hoc or random — it is a disciplined, structured approach guided by charters, heuristics, and note-taking.

---

## Session-Based Test Management (SBTM)

SBTM provides structure to exploratory testing by organizing work into **sessions** — uninterrupted blocks of testing time (typically 60–120 minutes).

### Components of SBTM

| Component | Description |
|-----------|-------------|
| **Charter** | A mission statement defining the scope and goal of the session |
| **Session** | A time-boxed period of focused exploratory testing |
| **Session report** | Notes, bugs found, questions raised, and areas covered |
| **Debrief** | A review meeting between tester and manager after the session |

### Writing Effective Charters

A charter answers three questions:

1. **What** are you exploring? (Target area)
2. **Why** are you exploring it? (Purpose or risk)
3. **How** will you explore? (Resources, techniques)

Example charter:

> Explore the checkout flow using boundary values for coupon codes to discover validation issues.

### Session Metrics

- **Session duration**: Total time spent
- **Bug count**: Defects discovered
- **Charter coverage**: Percentage of charter objectives met
- **Test vs. opportunity ratio**: Time testing vs. investigating side issues

---

## Heuristics: SFDPOT

The **SFDPOT** mnemonic (also called the "Consistency Heuristics") helps testers think about different dimensions of the product:

### S — Structure

- How is the product built?
- What are the components, modules, and their relationships?
- Test internal structure: code paths, data flows, architecture layers

### F — Function

- What does the product do?
- Test each feature against its intended purpose
- Consider edge cases, error states, and alternate paths

### D — Data

- What data does the product process?
- Test with various data types, sizes, formats, and encodings
- Consider empty data, null values, maximum lengths, special characters

### P — Platform

- What environment does the product run on?
- Test across browsers, operating systems, devices, network conditions
- Consider dependencies: databases, APIs, third-party services

### O — Operations

- How will the product be used in practice?
- Test installation, configuration, maintenance, and monitoring
- Consider logging, error recovery, backup and restore

### T — Time

- How does time affect the product?
- Test timeouts, scheduling, concurrency, time zones
- Consider race conditions, expiration, and data staleness

---

## Tours: FCC CUTS VIDS

The **FCC CUTS VIDS** mnemonic provides a set of "tours" — different perspectives for exploring an application:

| Tour | Focus |
|------|-------|
| **F** — Feature | Test the main features one by one |
| **C** — Complexity | Find and test the most complex areas |
| **C** — Claims | Verify marketing claims and documentation |
| **U** — User | Follow real user workflows end to end |
| **T** — Testability | Evaluate how easy the product is to test |
| **S** — Scenario | Walk through realistic scenarios |
| **V** — Variability | Change configurations and settings |
| **I** — Interoperability | Test with other systems, imports/exports |
| **D** — Data | Focus on data: input, output, transformations |
| **S** — Structure | Examine the underlying architecture |

### Applying Tours in Practice

1. Pick a tour based on the risk area or charter
2. Spend a focused session following that tour's perspective
3. Document observations, questions, and defects
4. Switch tours to cover the application from multiple angles

---

## Note-Taking and Bug Reporting During Exploration

Effective note-taking is critical during exploratory testing because you cannot rely on pre-written test cases to document what was done.

### What to Record

- **Steps taken**: Brief description of actions performed
- **Observations**: What you noticed (expected and unexpected)
- **Questions**: Things to investigate further
- **Bugs**: Defects with reproduction steps
- **Ideas**: Future test ideas generated during the session
- **Environment**: Browser, OS, data state, timestamps

### Note-Taking Formats

- **Plain text / Markdown**: Lightweight, searchable
- **Screen recordings**: Capture exact steps for complex bugs
- **Screenshots with annotations**: Quick visual evidence
- **Mind maps**: Show relationships between tested areas

### Bug Reporting Template

```
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Charter: [Which session charter]
Steps:
  1. ...
  2. ...
  3. ...
Actual Result: ...
Expected Result: ...
Evidence: [Screenshot/recording link]
Environment: [Browser, OS, etc.]
```

---

## When to Use Exploratory vs. Scripted Testing

| Factor | Exploratory | Scripted |
|--------|-------------|----------|
| New features | Excellent for learning | Hard to script without knowledge |
| Regression | Good supplement | Primary approach |
| Compliance | Supplementary | Required for audit trails |
| Time pressure | Fast feedback | Slower but thorough |
| Tester skill | Leverages expertise | Consistent regardless of skill |
| Documentation | Lighter | Full traceability |

### Best Practices for Combining Both

- Use **exploratory testing** early in development to find major issues fast
- Use **scripted testing** for critical paths that must always pass
- Run **exploratory sessions** after scripted tests pass to find gaps
- Convert **exploratory findings** into automated regression tests

---

## Code: Exploration Session Logger

A lightweight helper to log exploratory testing sessions — tracks charter, observations, bugs found, and session duration.

### Python

```python
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import List


@dataclass
class Observation:
    timestamp: str
    category: str  # "bug", "question", "note", "idea"
    description: str


@dataclass
class ExplorationSession:
    charter: str
    tester: str
    start_time: float = field(default_factory=time.time)
    observations: List[Observation] = field(default_factory=list)
    end_time: float = 0.0

    def log(self, category: str, description: str) -> None:
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.observations.append(Observation(timestamp, category, description))

    def log_bug(self, description: str) -> None:
        self.log("bug", description)

    def log_question(self, description: str) -> None:
        self.log("question", description)

    def log_note(self, description: str) -> None:
        self.log("note", description)

    def log_idea(self, description: str) -> None:
        self.log("idea", description)

    def end_session(self) -> dict:
        self.end_time = time.time()
        duration_min = (self.end_time - self.start_time) / 60
        bugs = [o for o in self.observations if o.category == "bug"]
        return {
            "charter": self.charter,
            "tester": self.tester,
            "duration_minutes": round(duration_min, 1),
            "total_observations": len(self.observations),
            "bugs_found": len(bugs),
            "observations": [
                {"time": o.timestamp, "type": o.category, "text": o.description}
                for o in self.observations
            ],
        }


# Usage
session = ExplorationSession(
    charter="Explore login flow with invalid credentials",
    tester="Alice",
)
session.log_note("Login page loads in under 2 seconds")
session.log_bug("No rate limiting after 50 failed attempts")
session.log_question("Is there an account lockout policy?")
session.log_idea("Test with SQL injection in email field")
report = session.end_session()
print(f"Session: {report['charter']}")
print(f"Duration: {report['duration_minutes']} min, Bugs: {report['bugs_found']}")
```

### JavaScript

```javascript
class ExplorationSession {
  constructor(charter, tester) {
    this.charter = charter;
    this.tester = tester;
    this.startTime = Date.now();
    this.observations = [];
    this.endTime = null;
  }

  #timestamp() {
    return new Date().toLocaleTimeString("en-US", { hour12: false });
  }

  log(category, description) {
    this.observations.push({
      timestamp: this.#timestamp(),
      category,
      description,
    });
  }

  logBug(description) {
    this.log("bug", description);
  }

  logQuestion(description) {
    this.log("question", description);
  }

  logNote(description) {
    this.log("note", description);
  }

  logIdea(description) {
    this.log("idea", description);
  }

  endSession() {
    this.endTime = Date.now();
    const durationMin = ((this.endTime - this.startTime) / 60000).toFixed(1);
    const bugs = this.observations.filter((o) => o.category === "bug");

    return {
      charter: this.charter,
      tester: this.tester,
      durationMinutes: parseFloat(durationMin),
      totalObservations: this.observations.length,
      bugsFound: bugs.length,
      observations: this.observations.map((o) => ({
        time: o.timestamp,
        type: o.category,
        text: o.description,
      })),
    };
  }
}

// Usage
const session = new ExplorationSession(
  "Explore login flow with invalid credentials",
  "Alice",
);
session.logNote("Login page loads in under 2 seconds");
session.logBug("No rate limiting after 50 failed attempts");
session.logQuestion("Is there an account lockout policy?");
session.logIdea("Test with SQL injection in email field");
const report = session.endSession();
console.log(`Session: ${report.charter}`);
console.log(`Duration: ${report.durationMinutes} min, Bugs: ${report.bugsFound}`);
```

### Java

```java
import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ExplorationSession {

    public record Observation(String timestamp, String category, String description) {}

    private final String charter;
    private final String tester;
    private final Instant startTime;
    private final List<Observation> observations = new ArrayList<>();
    private Instant endTime;

    public ExplorationSession(String charter, String tester) {
        this.charter = charter;
        this.tester = tester;
        this.startTime = Instant.now();
    }

    private String timestamp() {
        return LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    public void log(String category, String description) {
        observations.add(new Observation(timestamp(), category, description));
    }

    public void logBug(String description) { log("bug", description); }
    public void logQuestion(String description) { log("question", description); }
    public void logNote(String description) { log("note", description); }
    public void logIdea(String description) { log("idea", description); }

    public Map<String, Object> endSession() {
        this.endTime = Instant.now();
        long durationMin = Duration.between(startTime, endTime).toMinutes();
        long bugCount = observations.stream()
            .filter(o -> "bug".equals(o.category()))
            .count();

        return Map.of(
            "charter", charter,
            "tester", tester,
            "durationMinutes", durationMin,
            "totalObservations", observations.size(),
            "bugsFound", bugCount,
            "observations", observations.stream()
                .map(o -> Map.of("time", o.timestamp(), "type", o.category(), "text", o.description()))
                .collect(Collectors.toList())
        );
    }

    public static void main(String[] args) {
        var session = new ExplorationSession(
            "Explore login flow with invalid credentials", "Alice");
        session.logNote("Login page loads in under 2 seconds");
        session.logBug("No rate limiting after 50 failed attempts");
        session.logQuestion("Is there an account lockout policy?");
        session.logIdea("Test with SQL injection in email field");
        var report = session.endSession();
        System.out.printf("Session: %s%n", report.get("charter"));
        System.out.printf("Duration: %s min, Bugs: %s%n",
            report.get("durationMinutes"), report.get("bugsFound"));
    }
}
```

### C#

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

public record Observation(string Timestamp, string Category, string Description);

public class ExplorationSession
{
    public string Charter { get; }
    public string Tester { get; }
    private readonly Stopwatch _stopwatch = Stopwatch.StartNew();
    private readonly List<Observation> _observations = new();

    public ExplorationSession(string charter, string tester)
    {
        Charter = charter;
        Tester = tester;
    }

    private static string Timestamp() => DateTime.Now.ToString("HH:mm:ss");

    public void Log(string category, string description)
        => _observations.Add(new Observation(Timestamp(), category, description));

    public void LogBug(string description) => Log("bug", description);
    public void LogQuestion(string description) => Log("question", description);
    public void LogNote(string description) => Log("note", description);
    public void LogIdea(string description) => Log("idea", description);

    public Dictionary<string, object> EndSession()
    {
        _stopwatch.Stop();
        var bugs = _observations.Where(o => o.Category == "bug").ToList();

        return new Dictionary<string, object>
        {
            ["charter"] = Charter,
            ["tester"] = Tester,
            ["durationMinutes"] = Math.Round(_stopwatch.Elapsed.TotalMinutes, 1),
            ["totalObservations"] = _observations.Count,
            ["bugsFound"] = bugs.Count,
            ["observations"] = _observations.Select(o => new
            {
                time = o.Timestamp,
                type = o.Category,
                text = o.Description
            }).ToList()
        };
    }

    public static void Main()
    {
        var session = new ExplorationSession(
            "Explore login flow with invalid credentials", "Alice");
        session.LogNote("Login page loads in under 2 seconds");
        session.LogBug("No rate limiting after 50 failed attempts");
        session.LogQuestion("Is there an account lockout policy?");
        session.LogIdea("Test with SQL injection in email field");
        var report = session.EndSession();
        Console.WriteLine($"Session: {report["charter"]}");
        Console.WriteLine($"Duration: {report["durationMinutes"]} min, Bugs: {report["bugsFound"]}");
    }
}
```

---

## Summary

Exploratory testing is a powerful complement to scripted and automated testing. It leverages human creativity and domain knowledge to find defects that rigid test scripts might miss. Key takeaways:

- Use **SBTM** to add structure and accountability to exploration
- Apply **SFDPOT** heuristics to systematically cover product dimensions
- Follow **FCC CUTS VIDS** tours to explore from different perspectives
- **Document everything** — notes, screenshots, and session reports preserve your findings
- Combine exploratory and scripted testing for maximum coverage
