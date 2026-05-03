---
title: Usability Testing
---

## What Is Usability Testing?

Usability testing evaluates a product by testing it with representative users. Participants attempt to complete tasks while observers watch, listen, and take notes. The goal is to identify usability problems, collect qualitative and quantitative data, and determine user satisfaction.

Core questions usability testing answers:

- Can users complete key tasks successfully?
- How long does it take to complete tasks?
- Where do users get confused or frustrated?

---

## Types of Usability Testing

### Moderated vs. Unmoderated

| Aspect | Moderated | Unmoderated |
|--------|-----------|-------------|
| Facilitator present | Yes, in real time | No, instructions only |
| Follow-up questions | Possible | Not possible |
| Cost | Higher (facilitator time) | Lower (scalable) |
| Flexibility | Can probe deeper | Fixed script |
| Best for | Complex tasks, early design | Quantitative data, large samples |

### Remote vs. In-Person

| Aspect | Remote | In-Person |
|--------|--------|-----------|
| Participant location | Anywhere | Lab or office |
| Equipment | User's own device | Controlled setup |
| Body language | Limited visibility | Fully observable |
| Recruitment | Easier, broader pool | Limited to local |
| Best for | Diverse audiences | Hardware, physical products |

### Common Combinations

- **Remote moderated**: Video call with screen sharing (most common today)
- **Remote unmoderated**: Tools like UserTesting or Maze
- **In-person moderated**: Traditional usability lab

---

## Think-Aloud Protocol

The think-aloud protocol asks participants to verbalize their thoughts as they interact with the product. This reveals:

- What users expect to happen next
- Where they look for information
- Why they make specific choices
- What confuses or frustrates them

### Guidelines for Think-Aloud Sessions

1. **Brief the participant**: Explain that you are testing the product, not them
2. **Demonstrate**: Show what "thinking aloud" sounds like with a simple example
3. **Prompt gently**: If they go silent, say "What are you thinking right now?"
4. **Stay neutral**: Do not react positively or negatively to their actions
5. **Record**: Capture audio and screen for later analysis

### Concurrent vs. Retrospective

- **Concurrent**: Participant thinks aloud during the task (may slow them down)
- **Retrospective**: Participant reviews a recording and explains after (less natural but preserves task speed)

---

## Usability Metrics

### Task Completion Rate

The percentage of participants who successfully complete a given task.

```
Completion Rate = (Successful completions / Total attempts) × 100
```

Benchmark: 78% average across web studies (Sauro & Lewis, 2016).

### Time on Task

How long it takes users to complete a task. Measured in seconds or minutes.

- **Geometric mean** is preferred over arithmetic mean (task times are typically log-normal)
- Compare against benchmark or design goal
- Large variance indicates inconsistent user experience

### Error Rate

The number of errors users make while attempting a task.

- **Errors per task**: Average mistakes before completion
- **Error categories**: Slips (wrong click), mistakes (wrong mental model)
- **Critical errors**: Prevent task completion
- **Non-critical errors**: Recovered from but add friction

### System Usability Scale (SUS)

A standardized 10-question post-test questionnaire scored from 0 to 100.

- Score above **68**: Above average usability
- Score above **80**: Good usability (top 10%)
- Score below **50**: Significant usability problems

---

## Heuristic Evaluation: Nielsen's 10 Heuristics

Heuristic evaluation is an expert review method where evaluators judge the interface against established usability principles.

### The 10 Heuristics

1. **Visibility of system status**: The system keeps users informed about what is going on through timely feedback.

2. **Match between system and the real world**: The system uses language, concepts, and conventions familiar to the user.

3. **User control and freedom**: Users can undo, redo, and navigate away from unwanted states easily.

4. **Consistency and standards**: The interface follows platform conventions and internal consistency rules.

5. **Error prevention**: The design prevents errors from occurring in the first place (confirmation dialogs, constraints).

6. **Recognition rather than recall**: Minimize memory load by making options and information visible.

7. **Flexibility and efficiency of use**: Shortcuts for expert users without confusing novices.

8. **Aesthetic and minimalist design**: Remove irrelevant or rarely needed information from the interface.

9. **Help users recognize, diagnose, and recover from errors**: Error messages should be in plain language with constructive suggestions.

10. **Help and documentation**: Provide searchable, task-focused documentation when needed.

### Conducting a Heuristic Evaluation

- Use 3–5 evaluators (diminishing returns beyond that)
- Each evaluator reviews independently
- Rate severity: 0 (not a problem) to 4 (catastrophic)
- Aggregate findings and prioritize fixes

---

## Tools for Usability Testing

### UserTesting

- Recruits participants from a panel
- Supports moderated and unmoderated sessions
- Video recordings with transcripts
- Highlight reels for stakeholder presentations

### Maze

- Integrates with Figma, Sketch, and InVision prototypes
- Quantitative metrics: task success, misclicks, time
- Heatmaps showing click patterns
- Unmoderated, asynchronous testing

### Hotjar

- Heatmaps (click, scroll, movement)
- Session recordings of real users
- Feedback polls and surveys
- Funnel analysis for conversion tracking

### Additional Tools

| Tool | Primary Use |
|------|-------------|
| Lookback | Moderated remote sessions |
| Optimal Workshop | Card sorting, tree testing |
| Crazy Egg | Heatmaps, A/B testing |
| FullStory | Session replay, analytics |

---

## Automated UX Checks: Lighthouse Audits

Google Lighthouse provides automated audits for performance, accessibility, best practices, and SEO. While it does not replace human usability testing, it catches many UX-impacting issues.

### What Lighthouse Measures

| Category | Key Metrics |
|----------|-------------|
| Performance | FCP, LCP, TBT, CLS, Speed Index |
| Accessibility | Color contrast, ARIA, labels, focus |
| Best Practices | HTTPS, no deprecated APIs, console errors |
| SEO | Meta tags, crawlability, mobile-friendly |

### Interpreting Scores

- **90–100**: Good (green)
- **50–89**: Needs improvement (orange)
- **0–49**: Poor (red)

---

## Code: Automated Lighthouse / Web Performance Audits

### JavaScript (Primary — Node.js Lighthouse)

```javascript
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

async function runLighthouseAudit(url, categories = ["performance", "accessibility"]) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  const options = {
    logLevel: "error",
    output: "json",
    onlyCategories: categories,
    port: chrome.port,
  };

  const result = await lighthouse(url, options);
  await chrome.kill();

  const { categories: scores } = result.lhr;
  const report = {};

  for (const [key, category] of Object.entries(scores)) {
    report[key] = {
      title: category.title,
      score: Math.round(category.score * 100),
    };
  }

  return report;
}

function evaluateResults(report, thresholds = { performance: 90, accessibility: 90 }) {
  const failures = [];

  for (const [key, threshold] of Object.entries(thresholds)) {
    if (report[key] && report[key].score < threshold) {
      failures.push({
        category: report[key].title,
        score: report[key].score,
        threshold,
      });
    }
  }

  return {
    passed: failures.length === 0,
    results: report,
    failures,
  };
}

// Usage
async function main() {
  const url = "https://example.com";
  console.log(`Running Lighthouse audit for ${url}...`);

  const report = await runLighthouseAudit(url);
  const evaluation = evaluateResults(report);

  for (const [key, value] of Object.entries(report)) {
    const status = value.score >= 90 ? "PASS" : "FAIL";
    console.log(`  [${status}] ${value.title}: ${value.score}/100`);
  }

  if (!evaluation.passed) {
    console.log("\nFailing categories:");
    evaluation.failures.forEach((f) => {
      console.log(`  ${f.category}: ${f.score} (threshold: ${f.threshold})`);
    });
    process.exitCode = 1;
  }
}

main();
```

### Python

```python
import json
import subprocess
import sys


def run_lighthouse_audit(url: str, categories: list = None) -> dict:
    """Run Lighthouse via CLI and parse JSON output."""
    if categories is None:
        categories = ["performance", "accessibility"]

    cmd = [
        "lighthouse", url,
        "--output=json", "--quiet",
        "--chrome-flags=--headless",
        f"--only-categories={','.join(categories)}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    report = json.loads(result.stdout)

    return {
        key: {"title": cat["title"], "score": round(cat["score"] * 100)}
        for key, cat in report["categories"].items()
    }


def evaluate_results(scores: dict, thresholds: dict = None) -> list:
    if thresholds is None:
        thresholds = {"performance": 90, "accessibility": 90}
    return [
        {"category": scores[k]["title"], "score": scores[k]["score"],
         "threshold": t, "passed": scores[k]["score"] >= t}
        for k, t in thresholds.items() if k in scores
    ]


if __name__ == "__main__":
    url = "https://example.com"
    print(f"Running Lighthouse audit for {url}...")
    scores = run_lighthouse_audit(url)
    results = evaluate_results(scores)
    for r in results:
        status = "PASS" if r["passed"] else "FAIL"
        print(f"  [{status}] {r['category']}: {r['score']}/100")
    if any(not r["passed"] for r in results):
        sys.exit(1)
```

### Java

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class LighthouseAudit {

    public record CategoryScore(String title, int score) {}
    public record AuditResult(String category, int score, int threshold, boolean passed) {}

    public static Map<String, CategoryScore> runAudit(String url, List<String> categories)
            throws Exception {
        String cats = String.join(",", categories);
        ProcessBuilder pb = new ProcessBuilder(
            "lighthouse", url,
            "--output=json", "--quiet",
            "--chrome-flags=--headless",
            "--only-categories=" + cats
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String output;
        try (var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            output = reader.lines().collect(Collectors.joining("\n"));
        }
        process.waitFor();

        // Simplified JSON parsing (use a JSON library in production)
        Map<String, CategoryScore> scores = new HashMap<>();
        for (String cat : categories) {
            int titleIdx = output.indexOf("\"title\"", output.indexOf("\"" + cat + "\""));
            int scoreIdx = output.indexOf("\"score\"", titleIdx);
            // Extract score value (0.0 - 1.0)
            String scoreStr = output.substring(scoreIdx + 8, output.indexOf(",", scoreIdx)).trim();
            double rawScore = Double.parseDouble(scoreStr);
            scores.put(cat, new CategoryScore(cat, (int) Math.round(rawScore * 100)));
        }
        return scores;
    }

    public static List<AuditResult> evaluate(
            Map<String, CategoryScore> scores, Map<String, Integer> thresholds) {
        return thresholds.entrySet().stream()
            .filter(e -> scores.containsKey(e.getKey()))
            .map(e -> {
                int score = scores.get(e.getKey()).score();
                return new AuditResult(e.getKey(), score, e.getValue(), score >= e.getValue());
            })
            .toList();
    }

    public static void main(String[] args) throws Exception {
        String url = "https://example.com";
        System.out.printf("Running Lighthouse audit for %s...%n", url);

        var scores = runAudit(url, List.of("performance", "accessibility"));
        var thresholds = Map.of("performance", 90, "accessibility", 90);
        var results = evaluate(scores, thresholds);

        for (var r : results) {
            String status = r.passed() ? "PASS" : "FAIL";
            System.out.printf("  [%s] %s: %d/100 (threshold: %d)%n",
                status, r.category(), r.score(), r.threshold());
        }

        boolean allPassed = results.stream().allMatch(AuditResult::passed);
        if (!allPassed) System.exit(1);
    }
}
```

### C#

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

public record CategoryScore(string Title, int Score);
public record AuditResult(string Category, int Score, int Threshold, bool Passed);

public static class LighthouseAudit
{
    public static async Task<Dictionary<string, CategoryScore>> RunAuditAsync(
        string url, string[] categories)
    {
        var cats = string.Join(",", categories);
        var psi = new ProcessStartInfo
        {
            FileName = "lighthouse",
            Arguments = $"{url} --output=json --quiet --chrome-flags=--headless --only-categories={cats}",
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(psi)!;
        var output = await process.StandardOutput.ReadToEndAsync();
        await process.WaitForExitAsync();

        using var doc = JsonDocument.Parse(output);
        var root = doc.RootElement.GetProperty("categories");

        var scores = new Dictionary<string, CategoryScore>();
        foreach (var cat in categories)
        {
            if (root.TryGetProperty(cat, out var catElement))
            {
                var title = catElement.GetProperty("title").GetString()!;
                var score = (int)Math.Round(catElement.GetProperty("score").GetDouble() * 100);
                scores[cat] = new CategoryScore(title, score);
            }
        }
        return scores;
    }

    public static List<AuditResult> Evaluate(
        Dictionary<string, CategoryScore> scores,
        Dictionary<string, int> thresholds)
    {
        return thresholds
            .Where(t => scores.ContainsKey(t.Key))
            .Select(t =>
            {
                var score = scores[t.Key].Score;
                return new AuditResult(scores[t.Key].Title, score, t.Value, score >= t.Value);
            })
            .ToList();
    }

    public static async Task Main()
    {
        var url = "https://example.com";
        Console.WriteLine($"Running Lighthouse audit for {url}...");

        var scores = await RunAuditAsync(url, new[] { "performance", "accessibility" });
        var thresholds = new Dictionary<string, int>
        {
            ["performance"] = 90,
            ["accessibility"] = 90
        };
        var results = Evaluate(scores, thresholds);

        foreach (var r in results)
        {
            var status = r.Passed ? "PASS" : "FAIL";
            Console.WriteLine($"  [{status}] {r.Category}: {r.Score}/100 (threshold: {r.Threshold})");
        }

        if (results.Any(r => !r.Passed))
            Environment.Exit(1);
    }
}
```

---

## Summary

- Choose the right **type** (moderated/unmoderated, remote/in-person) for your goals and budget
- Use **think-aloud protocol** to understand user reasoning
- Track **quantitative metrics** (completion rate, time on task, errors) alongside qualitative feedback
- Apply **Nielsen's 10 heuristics** for expert reviews between user sessions
