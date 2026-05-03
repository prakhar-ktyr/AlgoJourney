---
title: Accessibility Testing
---

# Accessibility Testing

Accessibility testing ensures that applications are usable by people with disabilities, including those who rely on assistive technologies like screen readers, keyboard navigation, or voice control. It verifies compliance with accessibility standards and guidelines.

## Why Accessibility Matters

Approximately 15% of the world's population lives with some form of disability. Accessible applications:

- **Reach more users**: Expanding your audience to include people with visual, auditory, motor, or cognitive disabilities
- **Meet legal requirements**: Laws like ADA (US), EAA (EU), and Section 508 mandate accessibility
- **Improve SEO**: Semantic HTML and proper labeling improve search engine indexing
- **Enhance usability for everyone**: Accessibility improvements (keyboard nav, clear labels) benefit all users

## WCAG 2.1 Guidelines

The Web Content Accessibility Guidelines (WCAG) 2.1 define four principles (POUR):

### 1. Perceivable

Information must be presentable in ways users can perceive:
- Text alternatives for non-text content
- Captions for audio/video
- Content adaptable to different presentations
- Sufficient color contrast (minimum 4.5:1 for normal text)

### 2. Operable

UI components must be operable by all users:
- All functionality available via keyboard
- Enough time to read and interact
- No content that causes seizures (flashing)
- Navigable structure with clear headings

### 3. Understandable

Information and UI operation must be understandable:
- Readable text content
- Predictable page behavior
- Input assistance (error identification, labels, suggestions)

### 4. Robust

Content must be robust enough for assistive technologies:
- Compatible with current and future user agents
- Valid HTML markup
- Proper ARIA usage

### Conformance Levels

| Level | Description | Example |
|-------|------------|---------|
| A     | Minimum accessibility | Alt text on images |
| AA    | Acceptable for most | Color contrast 4.5:1, keyboard navigation |
| AAA   | Highest level | Enhanced contrast 7:1, sign language for video |

Most organizations target **Level AA** compliance.

## Accessibility Testing Types

### Automated Testing

Tools scan the DOM and check for common violations:
- Missing alt text
- Insufficient color contrast
- Missing form labels
- Invalid ARIA attributes
- Heading hierarchy issues

**Coverage**: Catches ~30-40% of accessibility issues automatically.

### Manual Testing

Human testers verify aspects automation cannot:
- Logical reading order
- Meaningful alt text (not just present, but descriptive)
- Focus management in dynamic content
- Cognitive load and clarity
- Context of error messages

### Assistive Technology Testing

Testing with actual assistive tools:
- Screen readers (NVDA, JAWS, VoiceOver)
- Screen magnifiers
- Voice control (Dragon NaturallySpeaking)
- Switch access devices

## ARIA Roles, Labels, and Semantic HTML

### Semantic HTML First

Always prefer semantic HTML over ARIA. Native elements carry implicit roles:

```html
<!-- Good: Semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<button type="submit">Submit Form</button>
<input type="email" id="email" aria-required="true" />
<label for="email">Email Address</label>

<!-- Bad: Non-semantic with ARIA -->
<div role="navigation">
  <div role="list">
    <div role="listitem"><span role="link" tabindex="0">Home</span></div>
  </div>
</div>

<div role="button" tabindex="0" onclick="submit()">Submit Form</div>
```

### ARIA Roles

ARIA roles define what an element is or does:

- **Landmark roles**: `banner`, `navigation`, `main`, `complementary`, `contentinfo`
- **Widget roles**: `button`, `checkbox`, `dialog`, `tab`, `tabpanel`
- **Document structure**: `heading`, `list`, `listitem`, `article`
- **Live region roles**: `alert`, `status`, `log`, `timer`

### ARIA Properties and States

```html
<!-- Expandable section -->
<button aria-expanded="false" aria-controls="section1">
  Show Details
</button>
<div id="section1" aria-hidden="true">
  Detailed content here...
</div>

<!-- Loading state -->
<div role="status" aria-live="polite" aria-busy="true">
  Loading results...
</div>

<!-- Error message -->
<input type="text" id="username" aria-describedby="username-error" aria-invalid="true" />
<span id="username-error" role="alert">Username is required</span>
```

## Automated Tools

### axe-core

The most popular accessibility testing engine. Open-source, runs in the browser, integrates with test frameworks. Checks against WCAG 2.0/2.1 rules at levels A and AA.

### Lighthouse

Google's auditing tool built into Chrome DevTools. Provides an accessibility score and actionable recommendations. Can be run via CLI or Node API.

### pa11y

Command-line accessibility testing tool. Supports multiple standards (WCAG2A, WCAG2AA, Section508). Can test single pages or crawl entire sites.

### Testing Library

`@testing-library/react` encourages accessible queries (`getByRole`, `getByLabelText`) that inherently validate accessibility patterns in component tests.

## Keyboard Navigation Testing

All interactive elements must be accessible via keyboard:

| Key | Action |
|-----|--------|
| Tab | Move focus to next interactive element |
| Shift+Tab | Move focus to previous element |
| Enter | Activate links and buttons |
| Space | Toggle checkboxes, activate buttons |
| Arrow keys | Navigate within widgets (tabs, menus, radio groups) |
| Escape | Close modals, dismiss dropdowns |

### Focus Management Checklist

- [ ] Visible focus indicator on all interactive elements
- [ ] Logical tab order (follows visual reading order)
- [ ] No keyboard traps (user can always Tab away)
- [ ] Focus moves to modals when opened, returns when closed
- [ ] Skip navigation link provided for repetitive content
- [ ] Custom widgets implement expected keyboard patterns

## Screen Reader Testing Basics

Screen readers announce content in a specific order and manner:

1. **Element role**: "button", "link", "heading level 2"
2. **Element name/label**: "Submit Form", "Navigation menu"
3. **Element state**: "expanded", "checked", "disabled"
4. **Element value**: input content, selected option

### Quick Screen Reader Tests

- Navigate by headings (H key in NVDA/JAWS) — verify hierarchy makes sense
- Navigate by landmarks — verify page regions are identified
- Tab through interactive elements — verify labels are announced
- Trigger dynamic content — verify live regions announce updates

## Color Contrast Testing

WCAG requires minimum contrast ratios:

- **Normal text** (< 18pt or < 14pt bold): **4.5:1** ratio (AA)
- **Large text** (≥ 18pt or ≥ 14pt bold): **3:1** ratio (AA)
- **Enhanced** (AAA): **7:1** for normal, **4.5:1** for large text
- **Non-text elements** (icons, borders, focus indicators): **3:1** ratio

### Tools for Contrast Checking

- Chrome DevTools color picker (shows contrast ratio inline)
- Colour Contrast Analyser (desktop app)
- WebAIM Contrast Checker (online)
- axe-core (programmatic checking)

## Code Examples

### Python: axe Accessibility Audit with axe-selenium-python

```python
import json
from dataclasses import dataclass
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from axe_selenium_python import Axe


@dataclass
class AccessibilityViolation:
    """Represents a single accessibility violation."""
    rule_id: str
    impact: str
    description: str
    help_url: str
    affected_nodes: int


class AccessibilityAuditor:
    """Automated accessibility testing using axe-core."""

    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        self.results = None

    def setup_driver(self):
        options = Options()
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1280,800")
        self.driver = webdriver.Chrome(options=options)

    def run_audit(self, url, rules_tags=None):
        """Run accessibility audit on a URL.

        Args:
            url: Page URL to audit.
            rules_tags: List of rule tags to run (e.g., ['wcag2a', 'wcag2aa']).
        """
        if not self.driver:
            self.setup_driver()

        self.driver.get(url)
        axe = Axe(self.driver)
        axe.inject()

        options = {}
        if rules_tags:
            options["runOnly"] = {"type": "tag", "values": rules_tags}

        self.results = axe.run(options=options)
        return self._parse_results()

    def _parse_results(self):
        violations = []
        for violation in self.results.get("violations", []):
            violations.append(AccessibilityViolation(
                rule_id=violation["id"],
                impact=violation["impact"],
                description=violation["description"],
                help_url=violation["helpUrl"],
                affected_nodes=len(violation["nodes"]),
            ))
        return violations

    def get_summary(self):
        """Get a summary of the audit results."""
        if not self.results:
            return "No audit has been run yet."

        violations = self.results.get("violations", [])
        passes = self.results.get("passes", [])
        incomplete = self.results.get("incomplete", [])

        impact_counts = {}
        for v in violations:
            impact = v["impact"]
            impact_counts[impact] = impact_counts.get(impact, 0) + 1

        return {
            "total_violations": len(violations),
            "total_passes": len(passes),
            "incomplete_checks": len(incomplete),
            "by_impact": impact_counts,
        }

    def check_specific_rules(self, url, rules):
        """Check specific accessibility rules.

        Args:
            url: Page URL to audit.
            rules: List of rule IDs (e.g., ['color-contrast', 'image-alt']).
        """
        if not self.driver:
            self.setup_driver()

        self.driver.get(url)
        axe = Axe(self.driver)
        axe.inject()

        options = {"runOnly": {"type": "rule", "values": rules}}
        self.results = axe.run(options=options)
        return self._parse_results()

    def generate_report(self, output_file="accessibility_report.json"):
        """Save full audit results to a JSON file."""
        if self.results:
            with open(output_file, "w") as f:
                json.dump(self.results, f, indent=2)

    def teardown(self):
        if self.driver:
            self.driver.quit()


if __name__ == "__main__":
    auditor = AccessibilityAuditor()
    try:
        violations = auditor.run_audit(
            "http://localhost:3000",
            rules_tags=["wcag2a", "wcag2aa"]
        )

        print(f"Found {len(violations)} violations:\n")
        for v in violations:
            print(f"  [{v.impact.upper()}] {v.rule_id}")
            print(f"    {v.description}")
            print(f"    Affected nodes: {v.affected_nodes}")
            print(f"    Help: {v.help_url}\n")

        summary = auditor.get_summary()
        print(f"Summary: {summary}")
        auditor.generate_report()
    finally:
        auditor.teardown()
```

### JavaScript: axe with Playwright

```javascript
const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");

class AccessibilityTester {
  constructor(options = {}) {
    this.standard = options.standard || "wcag2aa";
    this.browser = null;
  }

  async setup() {
    this.browser = await chromium.launch({ headless: true });
  }

  async auditPage(url, options = {}) {
    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    let builder = new AxeBuilder({ page });

    // Configure analysis scope
    if (options.includeRules) {
      builder = builder.withRules(options.includeRules);
    }
    if (options.excludeRules) {
      builder = builder.disableRules(options.excludeRules);
    }
    if (options.includeTags) {
      builder = builder.withTags(options.includeTags);
    }
    if (options.excludeSelectors) {
      for (const selector of options.excludeSelectors) {
        builder = builder.exclude(selector);
      }
    }

    const results = await builder.analyze();
    await context.close();
    return results;
  }

  formatViolations(results) {
    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));

    return {
      url: results.url,
      timestamp: results.timestamp,
      totalViolations: violations.length,
      totalPasses: results.passes.length,
      incompleteChecks: results.incomplete.length,
      violations,
      byImpact: violations.reduce((acc, v) => {
        acc[v.impact] = (acc[v.impact] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async auditMultiplePages(urls) {
    const reports = [];
    for (const url of urls) {
      const results = await this.auditPage(url, {
        includeTags: ["wcag2a", "wcag2aa", "best-practice"],
      });
      reports.push(this.formatViolations(results));
    }
    return reports;
  }

  async checkKeyboardAccessibility(url) {
    const context = await this.browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements).map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().slice(0, 50) || "",
        hasTabIndex: el.hasAttribute("tabindex"),
        tabIndex: el.tabIndex,
        isVisible: el.offsetParent !== null,
        hasFocusStyle: false, // checked below
      }));
    });

    // Check focus visibility
    const focusResults = [];
    for (let i = 0; i < Math.min(interactiveElements.length, 20); i++) {
      await page.keyboard.press("Tab");
      const hasFocusIndicator = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) return false;
        const styles = window.getComputedStyle(active);
        const outlineStyle = styles.getPropertyValue("outline-style");
        const boxShadow = styles.getPropertyValue("box-shadow");
        return outlineStyle !== "none" || boxShadow !== "none";
      });
      focusResults.push({ index: i, hasFocusIndicator });
    }

    await context.close();
    return { interactiveElements, focusResults };
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Usage
(async () => {
  const tester = new AccessibilityTester({ standard: "wcag2aa" });
  await tester.setup();

  try {
    const results = await tester.auditPage("http://localhost:3000", {
      includeTags: ["wcag2a", "wcag2aa"],
      excludeSelectors: [".third-party-widget"],
    });

    const report = tester.formatViolations(results);
    console.log(`\nAccessibility Audit: ${report.url}`);
    console.log(`Violations: ${report.totalViolations}`);
    console.log(`Passes: ${report.totalPasses}`);
    console.log(`By Impact:`, report.byImpact);

    report.violations.forEach((v) => {
      console.log(`\n  [${v.impact.toUpperCase()}] ${v.id}`);
      console.log(`  ${v.description}`);
      v.nodes.forEach((node) => {
        console.log(`    Target: ${node.target.join(" > ")}`);
      });
    });

    // Check keyboard accessibility
    const kbResults = await tester.checkKeyboardAccessibility("http://localhost:3000");
    const missingFocus = kbResults.focusResults.filter((r) => !r.hasFocusIndicator);
    console.log(`\nKeyboard: ${missingFocus.length} elements missing focus indicator`);
  } finally {
    await tester.teardown();
  }
})();
```

### Java: axe-core with Selenium

```java
import com.deque.html.axecore.results.Results;
import com.deque.html.axecore.results.Rule;
import com.deque.html.axecore.selenium.AxeBuilder;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AccessibilityTest {

    private WebDriver driver;

    public AccessibilityTest(boolean headless) {
        ChromeOptions options = new ChromeOptions();
        if (headless) {
            options.addArguments("--headless");
        }
        options.addArguments("--no-sandbox", "--disable-gpu");
        options.addArguments("--window-size=1280,800");
        this.driver = new ChromeDriver(options);
    }

    public Results runAudit(String url, List<String> tags) {
        driver.get(url);

        AxeBuilder axeBuilder = new AxeBuilder();
        if (tags != null && !tags.isEmpty()) {
            axeBuilder.withTags(tags);
        }

        return axeBuilder.analyze(driver);
    }

    public Results runAuditWithRules(String url, List<String> rules) {
        driver.get(url);

        AxeBuilder axeBuilder = new AxeBuilder();
        axeBuilder.withOnlyRules(rules);

        return axeBuilder.analyze(driver);
    }

    public void printReport(Results results) {
        List<Rule> violations = results.getViolations();
        List<Rule> passes = results.getPasses();
        List<Rule> incomplete = results.getIncomplete();

        System.out.println("\n=== Accessibility Audit Report ===");
        System.out.println("URL: " + results.getUrl());
        System.out.printf("Violations: %d | Passes: %d | Incomplete: %d%n",
            violations.size(), passes.size(), incomplete.size());

        // Group violations by impact
        Map<String, List<Rule>> byImpact = violations.stream()
            .collect(Collectors.groupingBy(Rule::getImpact));

        System.out.println("\n--- Violations by Impact ---");
        for (String impact : Arrays.asList("critical", "serious", "moderate", "minor")) {
            List<Rule> impactViolations = byImpact.getOrDefault(impact, List.of());
            if (!impactViolations.isEmpty()) {
                System.out.printf("\n[%s] (%d violations)%n",
                    impact.toUpperCase(), impactViolations.size());
                for (Rule rule : impactViolations) {
                    System.out.printf("  • %s: %s%n", rule.getId(), rule.getDescription());
                    System.out.printf("    Help: %s%n", rule.getHelpUrl());
                    System.out.printf("    Affected nodes: %d%n", rule.getNodes().size());
                }
            }
        }
    }

    public boolean meetsStandard(Results results, int maxViolations, String minImpact) {
        List<Rule> violations = results.getViolations();
        List<String> severeLevels = getSevereLevels(minImpact);

        long severeCount = violations.stream()
            .filter(v -> severeLevels.contains(v.getImpact()))
            .count();

        return severeCount <= maxViolations;
    }

    private List<String> getSevereLevels(String minImpact) {
        return switch (minImpact) {
            case "critical" -> List.of("critical");
            case "serious" -> List.of("critical", "serious");
            case "moderate" -> List.of("critical", "serious", "moderate");
            default -> List.of("critical", "serious", "moderate", "minor");
        };
    }

    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    public static void main(String[] args) {
        AccessibilityTest tester = new AccessibilityTest(true);
        try {
            // Run WCAG 2.1 AA audit
            Results results = tester.runAudit(
                "http://localhost:3000",
                Arrays.asList("wcag2a", "wcag2aa", "wcag21aa")
            );
            tester.printReport(results);

            // Check if page meets standard (0 critical/serious violations)
            boolean passes = tester.meetsStandard(results, 0, "serious");
            System.out.println("\nMeets WCAG 2.1 AA (no critical/serious): " + passes);

            // Run specific rules
            Results contrastResults = tester.runAuditWithRules(
                "http://localhost:3000",
                Arrays.asList("color-contrast", "link-color-contrast")
            );
            System.out.printf("%nColor contrast violations: %d%n",
                contrastResults.getViolations().size());
        } finally {
            tester.teardown();
        }
    }
}
```

### C#: Selenium with Deque axe

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using Deque.AxeCore.Commons;
using Deque.AxeCore.Selenium;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace AccessibilityTesting
{
    public class AccessibilityAuditor
    {
        private IWebDriver _driver;
        private readonly bool _headless;

        public AccessibilityAuditor(bool headless = true)
        {
            _headless = headless;
            SetupDriver();
        }

        private void SetupDriver()
        {
            var options = new ChromeOptions();
            if (_headless)
            {
                options.AddArguments("--headless");
            }
            options.AddArguments("--no-sandbox", "--disable-gpu", "--window-size=1280,800");
            _driver = new ChromeDriver(options);
        }

        public AxeResult RunAudit(string url, string[] tags = null)
        {
            _driver.Navigate().GoToUrl(url);

            var builder = new AxeBuilder(_driver);

            if (tags != null && tags.Length > 0)
            {
                builder.WithTags(tags);
            }

            return builder.Analyze();
        }

        public AxeResult RunAuditWithRules(string url, string[] rules)
        {
            _driver.Navigate().GoToUrl(url);

            var builder = new AxeBuilder(_driver)
                .WithRules(rules);

            return builder.Analyze();
        }

        public AxeResult RunAuditExcluding(string url, string[] excludeSelectors)
        {
            _driver.Navigate().GoToUrl(url);

            var builder = new AxeBuilder(_driver);
            foreach (var selector in excludeSelectors)
            {
                builder.Exclude(selector);
            }

            return builder.Analyze();
        }

        public AuditReport GenerateReport(AxeResult result)
        {
            var violations = result.Violations ?? Array.Empty<AxeResultItem>();
            var passes = result.Passes ?? Array.Empty<AxeResultItem>();
            var incomplete = result.Incomplete ?? Array.Empty<AxeResultItem>();

            var byImpact = violations
                .GroupBy(v => v.Impact)
                .ToDictionary(g => g.Key, g => g.Count());

            return new AuditReport
            {
                Url = result.Url,
                TotalViolations = violations.Length,
                TotalPasses = passes.Length,
                IncompleteChecks = incomplete.Length,
                ViolationsByImpact = byImpact,
                Violations = violations.Select(v => new ViolationSummary
                {
                    RuleId = v.Id,
                    Impact = v.Impact,
                    Description = v.Description,
                    HelpUrl = v.HelpUrl,
                    AffectedNodes = v.Nodes?.Length ?? 0,
                }).ToList(),
            };
        }

        public bool MeetsStandard(AxeResult result, int maxCritical = 0, int maxSerious = 0)
        {
            var violations = result.Violations ?? Array.Empty<AxeResultItem>();

            int criticalCount = violations.Count(v => v.Impact == "critical");
            int seriousCount = violations.Count(v => v.Impact == "serious");

            return criticalCount <= maxCritical && seriousCount <= maxSerious;
        }

        public void Teardown()
        {
            _driver?.Quit();
        }
    }

    public class AuditReport
    {
        public string Url { get; set; }
        public int TotalViolations { get; set; }
        public int TotalPasses { get; set; }
        public int IncompleteChecks { get; set; }
        public Dictionary<string, int> ViolationsByImpact { get; set; }
        public List<ViolationSummary> Violations { get; set; }

        public void Print()
        {
            Console.WriteLine($"\n=== Accessibility Audit: {Url} ===");
            Console.WriteLine($"Violations: {TotalViolations} | Passes: {TotalPasses} | Incomplete: {IncompleteChecks}");
            Console.WriteLine("\nBy Impact:");
            foreach (var kvp in ViolationsByImpact.OrderByDescending(k => k.Key))
            {
                Console.WriteLine($"  {kvp.Key.ToUpper()}: {kvp.Value}");
            }
            Console.WriteLine("\nViolation Details:");
            foreach (var v in Violations)
            {
                Console.WriteLine($"  [{v.Impact.ToUpper()}] {v.RuleId}");
                Console.WriteLine($"    {v.Description}");
                Console.WriteLine($"    Nodes affected: {v.AffectedNodes}");
                Console.WriteLine($"    Help: {v.HelpUrl}");
            }
        }
    }

    public class ViolationSummary
    {
        public string RuleId { get; set; }
        public string Impact { get; set; }
        public string Description { get; set; }
        public string HelpUrl { get; set; }
        public int AffectedNodes { get; set; }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var auditor = new AccessibilityAuditor(headless: true);
            try
            {
                // Run full WCAG 2.1 AA audit
                var result = auditor.RunAudit(
                    "http://localhost:3000",
                    new[] { "wcag2a", "wcag2aa", "wcag21aa" }
                );

                var report = auditor.GenerateReport(result);
                report.Print();

                // Check compliance
                bool passes = auditor.MeetsStandard(result, maxCritical: 0, maxSerious: 0);
                Console.WriteLine($"\nMeets WCAG 2.1 AA: {passes}");

                // Check specific rules
                var contrastResult = auditor.RunAuditWithRules(
                    "http://localhost:3000",
                    new[] { "color-contrast", "image-alt", "label" }
                );
                var contrastReport = auditor.GenerateReport(contrastResult);
                Console.WriteLine($"\nTargeted rules — violations: {contrastReport.TotalViolations}");
            }
            finally
            {
                auditor.Teardown();
            }
        }
    }
}
```

## Summary

Accessibility testing is both a legal requirement and a moral imperative:

- **Start with automated tools** (axe-core) to catch common violations quickly
- **Supplement with manual testing** for context-dependent issues
- **Test keyboard navigation** to ensure all functionality is operable without a mouse
- **Verify color contrast** meets WCAG 2.1 AA minimums (4.5:1)
- **Use semantic HTML first**, ARIA only when native elements are insufficient
- **Integrate into CI/CD** to prevent regressions from reaching production
