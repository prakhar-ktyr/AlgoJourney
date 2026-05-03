---
title: Test Metrics & Reporting
---

# Test Metrics & Reporting

Measuring testing effectiveness is essential for continuous improvement. This lesson covers the key metrics that matter, how to collect them, and how to build reporting that drives better quality decisions.

## Why Measure Testing?

Without metrics, you cannot answer critical questions:
- Is our test suite effective at catching bugs?
- Are we testing the right things?
- Is our testing investment paying off?
- Where should we focus testing effort?
- Are we getting better or worse over time?

## Key Metrics

### Test Pass Rate

**Definition**: Percentage of tests that pass in a given run.

$$\text{Pass Rate} = \frac{\text{Tests Passed}}{\text{Total Tests}} \times 100\%$$

- Target: > 99% for a healthy suite
- Drops indicate new bugs or flaky tests
- Track trend over time, not just current value

### Code Coverage

**Definition**: Percentage of code lines/branches executed during tests.

Types:
- **Line coverage**: Which lines were executed
- **Branch coverage**: Which conditional branches were taken
- **Function coverage**: Which functions were called
- **Statement coverage**: Which statements were executed

Important caveats:
- High coverage ≠ good tests (tests can execute code without verifying correctness)
- 100% coverage is rarely practical or necessary
- Use as a minimum bar (e.g., 80%), not a target to game

### Defect Density

**Definition**: Number of defects per unit of code size.

$$\text{Defect Density} = \frac{\text{Number of Defects}}{\text{KLOC (thousands of lines of code)}}$$

Useful for:
- Identifying high-risk modules
- Comparing quality across components
- Tracking improvement over releases

### Defect Escape Rate

**Definition**: Percentage of defects found in production vs. total defects found.

$$\text{Escape Rate} = \frac{\text{Production Defects}}{\text{Total Defects Found}} \times 100\%$$

- Lower is better — means more bugs caught before release
- Industry average: 10-30% for mature organizations
- World-class: < 5%

### Mean Time to Detect (MTTD)

**Definition**: Average time between defect introduction and detection.

$$\text{MTTD} = \frac{\sum(\text{Detection Time} - \text{Introduction Time})}{\text{Number of Defects}}$$

- Shorter MTTD = faster feedback loops
- Shift-left testing reduces MTTD
- Track by defect source (unit, integration, production)

### Mean Time to Resolve (MTTR)

**Definition**: Average time between defect detection and fix deployment.

$$\text{MTTR} = \frac{\sum(\text{Resolution Time} - \text{Detection Time})}{\text{Number of Defects}}$$

- Shorter MTTR = more responsive team
- Depends on test isolation (can you pinpoint the cause?)
- Track separately for different severity levels

## Test Execution Time Trends

Fast test suites enable rapid feedback. Track:

- **Total suite execution time**: Should stay under CI timeout
- **Slowest tests**: Top 10 slowest tests for optimization
- **Time per category**: Unit vs. integration vs. E2E
- **Trend over time**: Growing suite shouldn't mean growing time

Guidelines:
- Unit tests: < 10ms each
- Integration tests: < 1s each
- E2E tests: < 30s each
- Full suite: < 10 minutes for CI

## Defect Distribution

### By Module

Identify which modules have the most defects to focus testing effort:

| Module | Defects | Lines of Code | Defect Density |
|--------|---------|---------------|----------------|
| Auth | 12 | 2,000 | 6.0 |
| Payments | 8 | 3,500 | 2.3 |
| Search | 3 | 1,500 | 2.0 |
| Reports | 1 | 4,000 | 0.25 |

### By Severity

Track the severity breakdown to prioritize:
- **Critical**: System down, data loss
- **High**: Major feature broken
- **Medium**: Feature partially broken, workaround exists
- **Low**: Cosmetic, minor inconvenience

### By Phase Found

Where in the process defects are caught:
- Requirements review
- Design review
- Unit testing
- Integration testing
- System testing
- UAT
- Production

Earlier detection = lower cost to fix.

## Test Reporting Tools

### Allure Report

Open-source test reporting framework. Features:
- Rich HTML reports with charts and graphs
- Test step visualization
- Attachments (screenshots, logs)
- History and trend tracking
- Integration with most test frameworks

### ReportPortal

Real-time test reporting and analytics platform:
- Centralized dashboard for all test results
- AI-powered failure analysis
- Flaky test detection
- Integration with CI/CD pipelines
- Historical trends and comparisons

### TestRail

Test management tool:
- Test case organization
- Execution tracking
- Coverage mapping to requirements
- Custom reports and dashboards
- API for automation integration

### Custom Dashboards

Build dashboards with:
- Grafana + InfluxDB for time-series metrics
- Elasticsearch + Kibana for log-based analysis
- Custom web dashboards with charting libraries

## Code Examples

### Generating Test Reports

```python
import json
import time
import os
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path


@dataclass
class TestResult:
    name: str
    status: str  # "passed", "failed", "skipped", "broken"
    duration_ms: float
    suite: str
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    error_message: Optional[str] = None
    labels: dict = field(default_factory=dict)


@dataclass
class TestSuiteReport:
    suite_name: str
    results: list = field(default_factory=list)
    start_time: Optional[str] = None
    end_time: Optional[str] = None

    @property
    def total(self):
        return len(self.results)

    @property
    def passed(self):
        return sum(1 for r in self.results if r.status == "passed")

    @property
    def failed(self):
        return sum(1 for r in self.results if r.status == "failed")

    @property
    def skipped(self):
        return sum(1 for r in self.results if r.status == "skipped")

    @property
    def pass_rate(self):
        if self.total == 0:
            return 0.0
        return (self.passed / self.total) * 100

    @property
    def total_duration_ms(self):
        return sum(r.duration_ms for r in self.results)

    def add_result(self, result: TestResult):
        self.results.append(result)

    def get_slowest(self, n=5):
        return sorted(self.results, key=lambda r: r.duration_ms, reverse=True)[:n]

    def get_failures(self):
        return [r for r in self.results if r.status == "failed"]


class ReportGenerator:
    """Generates test reports in multiple formats."""

    def __init__(self, output_dir: str = "./test-reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_json_report(self, report: TestSuiteReport) -> str:
        """Generate JSON report (compatible with Allure-style tooling)."""
        data = {
            "suite": report.suite_name,
            "summary": {
                "total": report.total,
                "passed": report.passed,
                "failed": report.failed,
                "skipped": report.skipped,
                "pass_rate": round(report.pass_rate, 2),
                "duration_ms": round(report.total_duration_ms, 2),
            },
            "slowest_tests": [asdict(t) for t in report.get_slowest()],
            "failures": [asdict(t) for t in report.get_failures()],
            "results": [asdict(r) for r in report.results],
        }

        filepath = self.output_dir / f"{report.suite_name}-report.json"
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        return str(filepath)

    def generate_summary(self, report: TestSuiteReport) -> str:
        """Generate human-readable summary."""
        lines = [
            f"{'=' * 60}",
            f"  TEST REPORT: {report.suite_name}",
            f"{'=' * 60}",
            f"  Total: {report.total} | Passed: {report.passed} | "
            f"Failed: {report.failed} | Skipped: {report.skipped}",
            f"  Pass Rate: {report.pass_rate:.1f}%",
            f"  Duration: {report.total_duration_ms:.0f}ms",
            f"{'=' * 60}",
        ]

        if report.get_failures():
            lines.append("\n  FAILURES:")
            for failure in report.get_failures():
                lines.append(f"    ✗ {failure.name}")
                if failure.error_message:
                    lines.append(f"      {failure.error_message}")

        lines.append(f"\n  SLOWEST TESTS:")
        for test in report.get_slowest(3):
            lines.append(f"    {test.duration_ms:.0f}ms - {test.name}")

        return "\n".join(lines)


# Usage example
def run_example():
    report = TestSuiteReport(suite_name="unit-tests")
    report.start_time = datetime.now(timezone.utc).isoformat()

    # Simulate test results
    test_data = [
        ("test_user_creation", "passed", 12.5),
        ("test_login_valid", "passed", 8.3),
        ("test_login_invalid", "passed", 7.1),
        ("test_payment_processing", "failed", 145.2),
        ("test_report_generation", "passed", 230.8),
        ("test_email_notification", "skipped", 0.0),
        ("test_data_export", "passed", 89.4),
    ]

    for name, status, duration in test_data:
        result = TestResult(
            name=name,
            status=status,
            duration_ms=duration,
            suite="unit-tests",
            error_message="Connection timeout" if status == "failed" else None,
        )
        report.add_result(result)

    report.end_time = datetime.now(timezone.utc).isoformat()

    generator = ReportGenerator()
    json_path = generator.generate_json_report(report)
    summary = generator.generate_summary(report)
    print(summary)
    print(f"\nJSON report saved to: {json_path}")


if __name__ == "__main__":
    run_example()
```

```javascript
import fs from "fs";
import path from "path";

/**
 * Custom test reporter that generates metrics and reports.
 * Compatible with Vitest custom reporter interface.
 */
class MetricsReporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || "./test-reports";
    this.results = [];
    this.suiteStartTime = null;
    this.metricsHistory = [];
  }

  onInit() {
    this.suiteStartTime = Date.now();
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestResult(test) {
    this.results.push({
      name: test.name,
      fullName: test.fullName,
      status: test.status, // "pass", "fail", "skip"
      duration: test.duration || 0,
      file: test.file,
      error: test.error ? test.error.message : null,
      timestamp: new Date().toISOString(),
    });
  }

  onFinished() {
    const endTime = Date.now();
    const report = this.generateReport(endTime);
    this.writeJsonReport(report);
    this.writeMarkdownReport(report);
    this.updateHistoricalMetrics(report);
    this.printSummary(report);
  }

  generateReport(endTime) {
    const passed = this.results.filter((r) => r.status === "pass");
    const failed = this.results.filter((r) => r.status === "fail");
    const skipped = this.results.filter((r) => r.status === "skip");

    const durations = this.results
      .filter((r) => r.duration > 0)
      .map((r) => r.duration);

    return {
      timestamp: new Date().toISOString(),
      duration: endTime - this.suiteStartTime,
      summary: {
        total: this.results.length,
        passed: passed.length,
        failed: failed.length,
        skipped: skipped.length,
        passRate: this.results.length
          ? ((passed.length / this.results.length) * 100).toFixed(2)
          : 0,
      },
      timing: {
        totalMs: endTime - this.suiteStartTime,
        averageMs: durations.length
          ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
          : 0,
        maxMs: durations.length ? Math.max(...durations) : 0,
        p95Ms: this.percentile(durations, 95),
      },
      slowestTests: this.results
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map((r) => ({ name: r.name, duration: r.duration, file: r.file })),
      failures: failed.map((r) => ({
        name: r.fullName,
        error: r.error,
        file: r.file,
      })),
      byFile: this.groupByFile(),
    };
  }

  groupByFile() {
    const groups = {};
    for (const result of this.results) {
      const file = result.file || "unknown";
      if (!groups[file]) {
        groups[file] = { total: 0, passed: 0, failed: 0, duration: 0 };
      }
      groups[file].total++;
      if (result.status === "pass") groups[file].passed++;
      if (result.status === "fail") groups[file].failed++;
      groups[file].duration += result.duration || 0;
    }
    return groups;
  }

  percentile(sorted, p) {
    if (!sorted.length) return 0;
    const values = [...sorted].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  writeJsonReport(report) {
    const filepath = path.join(this.outputDir, "test-metrics.json");
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  writeMarkdownReport(report) {
    const md = [
      "# Test Report",
      "",
      `**Date**: ${report.timestamp}`,
      `**Duration**: ${report.duration}ms`,
      "",
      "## Summary",
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Tests | ${report.summary.total} |`,
      `| Passed | ${report.summary.passed} |`,
      `| Failed | ${report.summary.failed} |`,
      `| Skipped | ${report.summary.skipped} |`,
      `| Pass Rate | ${report.summary.passRate}% |`,
      "",
      "## Timing",
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total | ${report.timing.totalMs}ms |`,
      `| Average | ${report.timing.averageMs}ms |`,
      `| Max | ${report.timing.maxMs}ms |`,
      `| P95 | ${report.timing.p95Ms}ms |`,
      "",
    ];

    if (report.failures.length) {
      md.push("## Failures", "");
      for (const f of report.failures) {
        md.push(`- **${f.name}** (${f.file})`);
        md.push(`  - ${f.error}`);
      }
      md.push("");
    }

    md.push("## Slowest Tests", "");
    for (const t of report.slowestTests.slice(0, 5)) {
      md.push(`- ${t.duration}ms — ${t.name}`);
    }

    const filepath = path.join(this.outputDir, "test-report.md");
    fs.writeFileSync(filepath, md.join("\n"));
  }

  updateHistoricalMetrics(report) {
    const historyFile = path.join(this.outputDir, "metrics-history.json");
    let history = [];
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
    }
    history.push({
      timestamp: report.timestamp,
      passRate: report.summary.passRate,
      total: report.summary.total,
      duration: report.duration,
      failures: report.summary.failed,
    });
    // Keep last 100 entries
    if (history.length > 100) history = history.slice(-100);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  printSummary(report) {
    console.log("\n" + "=".repeat(50));
    console.log(`  Tests: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.total} total`);
    console.log(`  Pass Rate: ${report.summary.passRate}%`);
    console.log(`  Time: ${report.timing.totalMs}ms (p95: ${report.timing.p95Ms}ms)`);
    console.log("=".repeat(50));
  }
}

export default MetricsReporter;
```

```java
import java.io.*;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Custom test metrics collector and report generator.
 * Integrates with JUnit 5 via TestExecutionListener.
 */
public class TestMetricsCollector {

    public record TestResult(
        String name,
        String className,
        Status status,
        long durationMs,
        String errorMessage,
        Instant timestamp
    ) {}

    public enum Status { PASSED, FAILED, SKIPPED, ABORTED }

    public record MetricsSummary(
        int total,
        int passed,
        int failed,
        int skipped,
        double passRate,
        long totalDurationMs,
        long averageDurationMs,
        long maxDurationMs,
        long p95DurationMs
    ) {}

    private final List<TestResult> results = new ArrayList<>();
    private final Path outputDir;
    private Instant suiteStartTime;

    public TestMetricsCollector(String outputDir) {
        this.outputDir = Path.of(outputDir);
        try {
            Files.createDirectories(this.outputDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create output directory", e);
        }
    }

    public void startSuite() {
        suiteStartTime = Instant.now();
    }

    public void recordResult(TestResult result) {
        results.add(result);
    }

    public MetricsSummary calculateSummary() {
        int total = results.size();
        int passed = (int) results.stream().filter(r -> r.status() == Status.PASSED).count();
        int failed = (int) results.stream().filter(r -> r.status() == Status.FAILED).count();
        int skipped = (int) results.stream().filter(r -> r.status() == Status.SKIPPED).count();
        double passRate = total > 0 ? (passed * 100.0) / total : 0.0;

        long[] durations = results.stream()
            .mapToLong(TestResult::durationMs)
            .sorted()
            .toArray();

        long totalDuration = Arrays.stream(durations).sum();
        long average = durations.length > 0 ? totalDuration / durations.length : 0;
        long max = durations.length > 0 ? durations[durations.length - 1] : 0;
        long p95 = durations.length > 0
            ? durations[(int) Math.ceil(0.95 * durations.length) - 1] : 0;

        return new MetricsSummary(
            total, passed, failed, skipped, passRate,
            totalDuration, average, max, p95
        );
    }

    public List<TestResult> getSlowestTests(int n) {
        return results.stream()
            .sorted(Comparator.comparingLong(TestResult::durationMs).reversed())
            .limit(n)
            .collect(Collectors.toList());
    }

    public List<TestResult> getFailures() {
        return results.stream()
            .filter(r -> r.status() == Status.FAILED)
            .collect(Collectors.toList());
    }

    public Map<String, MetricsSummary> getMetricsByClass() {
        Map<String, List<TestResult>> grouped = results.stream()
            .collect(Collectors.groupingBy(TestResult::className));

        Map<String, MetricsSummary> byClass = new LinkedHashMap<>();
        for (var entry : grouped.entrySet()) {
            List<TestResult> classResults = entry.getValue();
            int total = classResults.size();
            int passed = (int) classResults.stream()
                .filter(r -> r.status() == Status.PASSED).count();
            int failed = (int) classResults.stream()
                .filter(r -> r.status() == Status.FAILED).count();
            int skipped = (int) classResults.stream()
                .filter(r -> r.status() == Status.SKIPPED).count();
            long duration = classResults.stream()
                .mapToLong(TestResult::durationMs).sum();

            byClass.put(entry.getKey(), new MetricsSummary(
                total, passed, failed, skipped,
                total > 0 ? (passed * 100.0) / total : 0,
                duration, total > 0 ? duration / total : 0, 0, 0
            ));
        }
        return byClass;
    }

    public String generateTextReport() {
        MetricsSummary summary = calculateSummary();
        StringBuilder sb = new StringBuilder();
        String separator = "=".repeat(60);

        sb.append(separator).append("\n");
        sb.append("  TEST METRICS REPORT\n");
        sb.append(separator).append("\n\n");
        sb.append(String.format("  Total: %d | Passed: %d | Failed: %d | Skipped: %d%n",
            summary.total(), summary.passed(), summary.failed(), summary.skipped()));
        sb.append(String.format("  Pass Rate: %.1f%%%n", summary.passRate()));
        sb.append(String.format("  Duration: %dms (avg: %dms, p95: %dms)%n",
            summary.totalDurationMs(), summary.averageDurationMs(), summary.p95DurationMs()));
        sb.append("\n");

        List<TestResult> failures = getFailures();
        if (!failures.isEmpty()) {
            sb.append("  FAILURES:\n");
            for (TestResult f : failures) {
                sb.append(String.format("    ✗ %s.%s%n", f.className(), f.name()));
                if (f.errorMessage() != null) {
                    sb.append(String.format("      %s%n", f.errorMessage()));
                }
            }
            sb.append("\n");
        }

        sb.append("  SLOWEST TESTS:\n");
        for (TestResult t : getSlowestTests(5)) {
            sb.append(String.format("    %dms - %s.%s%n",
                t.durationMs(), t.className(), t.name()));
        }

        sb.append("\n").append(separator);
        return sb.toString();
    }

    public void writeJsonReport() throws IOException {
        MetricsSummary summary = calculateSummary();
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append(String.format("  \"timestamp\": \"%s\",%n", Instant.now()));
        json.append(String.format("  \"total\": %d,%n", summary.total()));
        json.append(String.format("  \"passed\": %d,%n", summary.passed()));
        json.append(String.format("  \"failed\": %d,%n", summary.failed()));
        json.append(String.format("  \"passRate\": %.2f,%n", summary.passRate()));
        json.append(String.format("  \"durationMs\": %d,%n", summary.totalDurationMs()));
        json.append(String.format("  \"p95Ms\": %d%n", summary.p95DurationMs()));
        json.append("}");

        Path filepath = outputDir.resolve("test-metrics.json");
        Files.writeString(filepath, json.toString());
    }
}
```

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace TestMetrics
{
    public enum TestStatus { Passed, Failed, Skipped, Inconclusive }

    public record TestResult(
        string Name,
        string ClassName,
        TestStatus Status,
        long DurationMs,
        string? ErrorMessage = null,
        DateTime? Timestamp = null
    );

    public record MetricsSummary(
        int Total,
        int Passed,
        int Failed,
        int Skipped,
        double PassRate,
        long TotalDurationMs,
        long AverageDurationMs,
        long MaxDurationMs,
        long P95DurationMs
    );

    /// <summary>
    /// Collects test metrics and generates reports in multiple formats.
    /// Can integrate with xUnit ITestOutputHelper or custom reporters.
    /// </summary>
    public class TestMetricsCollector
    {
        private readonly List<TestResult> _results = new();
        private readonly string _outputDir;
        private DateTime _suiteStartTime;

        public TestMetricsCollector(string outputDir = "./test-reports")
        {
            _outputDir = outputDir;
            Directory.CreateDirectory(outputDir);
        }

        public void StartSuite()
        {
            _suiteStartTime = DateTime.UtcNow;
        }

        public void RecordResult(TestResult result)
        {
            _results.Add(result with { Timestamp = result.Timestamp ?? DateTime.UtcNow });
        }

        public MetricsSummary CalculateSummary()
        {
            int total = _results.Count;
            int passed = _results.Count(r => r.Status == TestStatus.Passed);
            int failed = _results.Count(r => r.Status == TestStatus.Failed);
            int skipped = _results.Count(r => r.Status == TestStatus.Skipped);
            double passRate = total > 0 ? (passed * 100.0) / total : 0.0;

            var durations = _results
                .Select(r => r.DurationMs)
                .OrderBy(d => d)
                .ToArray();

            long totalDuration = durations.Sum();
            long average = durations.Length > 0 ? totalDuration / durations.Length : 0;
            long max = durations.Length > 0 ? durations[^1] : 0;
            int p95Index = (int)Math.Ceiling(0.95 * durations.Length) - 1;
            long p95 = durations.Length > 0 ? durations[Math.Max(0, p95Index)] : 0;

            return new MetricsSummary(
                total, passed, failed, skipped, passRate,
                totalDuration, average, max, p95);
        }

        public IEnumerable<TestResult> GetSlowestTests(int count = 5)
        {
            return _results
                .OrderByDescending(r => r.DurationMs)
                .Take(count);
        }

        public IEnumerable<TestResult> GetFailures()
        {
            return _results.Where(r => r.Status == TestStatus.Failed);
        }

        public Dictionary<string, MetricsSummary> GetMetricsByClass()
        {
            return _results
                .GroupBy(r => r.ClassName)
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var items = g.ToList();
                        int total = items.Count;
                        int passed = items.Count(r => r.Status == TestStatus.Passed);
                        int failed = items.Count(r => r.Status == TestStatus.Failed);
                        int skipped = items.Count(r => r.Status == TestStatus.Skipped);
                        long duration = items.Sum(r => r.DurationMs);
                        return new MetricsSummary(
                            total, passed, failed, skipped,
                            total > 0 ? (passed * 100.0) / total : 0,
                            duration, total > 0 ? duration / total : 0, 0, 0);
                    });
        }

        public string GenerateTextReport()
        {
            var summary = CalculateSummary();
            var sb = new StringBuilder();
            string separator = new('=', 60);

            sb.AppendLine(separator);
            sb.AppendLine("  TEST METRICS REPORT");
            sb.AppendLine(separator);
            sb.AppendLine();
            sb.AppendLine($"  Total: {summary.Total} | Passed: {summary.Passed} | " +
                         $"Failed: {summary.Failed} | Skipped: {summary.Skipped}");
            sb.AppendLine($"  Pass Rate: {summary.PassRate:F1}%");
            sb.AppendLine($"  Duration: {summary.TotalDurationMs}ms " +
                         $"(avg: {summary.AverageDurationMs}ms, p95: {summary.P95DurationMs}ms)");
            sb.AppendLine();

            var failures = GetFailures().ToList();
            if (failures.Any())
            {
                sb.AppendLine("  FAILURES:");
                foreach (var f in failures)
                {
                    sb.AppendLine($"    ✗ {f.ClassName}.{f.Name}");
                    if (f.ErrorMessage != null)
                        sb.AppendLine($"      {f.ErrorMessage}");
                }
                sb.AppendLine();
            }

            sb.AppendLine("  SLOWEST TESTS:");
            foreach (var t in GetSlowestTests(5))
            {
                sb.AppendLine($"    {t.DurationMs}ms - {t.ClassName}.{t.Name}");
            }

            sb.AppendLine();
            sb.AppendLine(separator);
            return sb.ToString();
        }

        public void WriteJsonReport()
        {
            var summary = CalculateSummary();
            var report = new
            {
                timestamp = DateTime.UtcNow.ToString("O"),
                summary = new
                {
                    summary.Total,
                    summary.Passed,
                    summary.Failed,
                    summary.Skipped,
                    summary.PassRate,
                    summary.TotalDurationMs,
                    summary.P95DurationMs
                },
                slowestTests = GetSlowestTests(10).Select(t => new
                {
                    t.Name, t.ClassName, t.DurationMs
                }),
                failures = GetFailures().Select(f => new
                {
                    f.Name, f.ClassName, f.ErrorMessage
                }),
                byClass = GetMetricsByClass()
            };

            var options = new JsonSerializerOptions { WriteIndented = true };
            string json = JsonSerializer.Serialize(report, options);
            File.WriteAllText(Path.Combine(_outputDir, "test-metrics.json"), json);
        }

        public void WriteMarkdownReport()
        {
            var summary = CalculateSummary();
            var sb = new StringBuilder();

            sb.AppendLine("# Test Metrics Report");
            sb.AppendLine();
            sb.AppendLine($"**Generated**: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            sb.AppendLine();
            sb.AppendLine("## Summary");
            sb.AppendLine();
            sb.AppendLine("| Metric | Value |");
            sb.AppendLine("|--------|-------|");
            sb.AppendLine($"| Total | {summary.Total} |");
            sb.AppendLine($"| Passed | {summary.Passed} |");
            sb.AppendLine($"| Failed | {summary.Failed} |");
            sb.AppendLine($"| Pass Rate | {summary.PassRate:F1}% |");
            sb.AppendLine($"| Duration | {summary.TotalDurationMs}ms |");
            sb.AppendLine($"| P95 | {summary.P95DurationMs}ms |");

            File.WriteAllText(
                Path.Combine(_outputDir, "test-report.md"),
                sb.ToString());
        }
    }
}
```

## Dashboard Best Practices

1. **Show trends, not just snapshots** — a single data point is meaningless without context
2. **Highlight anomalies** — sudden drops in pass rate or spikes in duration
3. **Make it accessible** — dashboards should be visible to the whole team
4. **Automate data collection** — metrics should flow from CI without manual effort
5. **Set thresholds and alerts** — notify the team when metrics cross warning levels
6. **Keep it simple** — start with 3-5 key metrics rather than overwhelming with data

## Summary

Effective test metrics tell the story of your quality posture:

| Metric | What It Tells You |
|--------|-------------------|
| Pass Rate | Suite health and stability |
| Coverage | How much code is exercised |
| Defect Escape Rate | Testing effectiveness |
| MTTD | Speed of feedback loops |
| MTTR | Team responsiveness |
| Execution Time | Developer productivity impact |
| Defect Density | Where risk is concentrated |

The goal is not to maximize any single metric but to use them together to make informed decisions about where to invest testing effort for maximum quality impact.
