---
title: Security Testing
---

# Security Testing

Security testing identifies vulnerabilities before attackers exploit them. It combines automated scanning, manual review, and targeted attack simulation to validate that applications resist common threats.

## OWASP Top 10 Overview

The OWASP Top 10 represents the most critical web application security risks:

1. **Injection** — SQL, NoSQL, OS command injection via untrusted data
2. **Broken Authentication** — Flawed session management, credential stuffing
3. **Sensitive Data Exposure** — Inadequate encryption, leaked secrets
4. **XML External Entities (XXE)** — Malicious XML input processing
5. **Broken Access Control** — Unauthorized function or data access
6. **Security Misconfiguration** — Default credentials, verbose errors
7. **Cross-Site Scripting (XSS)** — Injecting scripts into web pages
8. **Insecure Deserialization** — Tampering with serialized objects
9. **Using Components with Known Vulnerabilities** — Outdated libraries
10. **Insufficient Logging & Monitoring** — Undetected breaches

## Static Application Security Testing (SAST)

SAST tools analyze source code without executing it, finding vulnerabilities early.

- **Python — Bandit**: Detects hardcoded passwords, `eval()`, weak cryptography
- **JavaScript — ESLint security plugins**: Flags `eval()`, `innerHTML`, prototype pollution
- **Java — SpotBugs + Find Security Bugs**: SQL injection, path traversal, XXE
- **C# — Roslyn analyzers**: SQL injection, insecure cryptography at compile time

```bash
pip install bandit && bandit -r src/
npm install eslint-plugin-security --save-dev
mvn com.github.spotbugs:spotbugs-maven-plugin:check
dotnet add package SecurityCodeScan.VS2019
```

## Dynamic Application Security Testing (DAST)

DAST tools test running applications by sending crafted requests and observing responses.

**OWASP ZAP** crawls applications and tests for injection, XSS, and misconfigurations:

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://target-app.example.com -r report.html
```

**Burp Suite** offers an intercepting proxy, scanner, and extensibility for testing authentication flows and business logic flaws.

## Dependency Scanning

Third-party libraries introduce transitive vulnerabilities requiring continuous monitoring:

```bash
# Python
safety check --json --output report.json

# JavaScript
npm audit --json > audit-report.json

# Java
mvn org.owasp:dependency-check-maven:check

# C#
dotnet list package --vulnerable --include-transitive
```

## SQL Injection Testing

SQL injection occurs when user input is concatenated into queries without parameterization. Test payloads include:

- `' OR 1=1 --`
- `'; DROP TABLE users; --`
- `' UNION SELECT null, password FROM users --`
- `1; WAITFOR DELAY '0:0:5' --` (time-based blind)

## XSS Testing

Cross-site scripting injects malicious scripts into pages viewed by other users. Test payloads:

- `<script>alert('XSS')</script>`
- `<img src=x onerror=alert('XSS')>`
- `javascript:alert('XSS')`
- `" onfocus="alert('XSS')" autofocus="`

## Code: Security Tests in All Languages

### Python

```python
import pytest
import re
import html


class SQLInjectionChecker:
    DANGEROUS_PATTERNS = [
        r"('\s*OR\s+.*=.*)",
        r"(;\s*DROP\s+TABLE)",
        r"(UNION\s+SELECT)",
        r"(--\s*$)",
    ]

    def is_safe(self, user_input: str) -> bool:
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, user_input, re.IGNORECASE):
                return False
        return True


class XSSChecker:
    DANGEROUS_PATTERNS = [
        r"<script[^>]*>",
        r"on\w+\s*=",
        r"javascript:",
        r"<iframe[^>]*>",
    ]

    def is_safe(self, user_input: str) -> bool:
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, user_input, re.IGNORECASE):
                return False
        return True

    def sanitize(self, user_input: str) -> str:
        return html.escape(user_input)


class TestSQLInjection:
    def setup_method(self):
        self.checker = SQLInjectionChecker()

    def test_normal_input_passes(self):
        assert self.checker.is_safe("john_doe")
        assert self.checker.is_safe("select a book")

    def test_or_injection_detected(self):
        assert not self.checker.is_safe("' OR '1'='1'")

    def test_drop_table_detected(self):
        assert not self.checker.is_safe("'; DROP TABLE users;")

    def test_union_select_detected(self):
        assert not self.checker.is_safe("' UNION SELECT password FROM users")

    def test_comment_injection_detected(self):
        assert not self.checker.is_safe("admin' --")


class TestXSS:
    def setup_method(self):
        self.checker = XSSChecker()

    def test_normal_input_passes(self):
        assert self.checker.is_safe("Hello, World!")

    def test_script_tag_detected(self):
        assert not self.checker.is_safe("<script>alert('xss')</script>")

    def test_event_handler_detected(self):
        assert not self.checker.is_safe('<img onerror="alert(1)">')

    def test_javascript_uri_detected(self):
        assert not self.checker.is_safe("javascript:alert(1)")

    def test_sanitize_escapes_html(self):
        result = self.checker.sanitize("<script>alert('xss')</script>")
        assert "&lt;script&gt;" in result
```

### JavaScript

```javascript
class SQLInjectionChecker {
  static PATTERNS = [
    /'\s*OR\s+.*=.*/i,
    /;\s*DROP\s+TABLE/i,
    /UNION\s+SELECT/i,
    /--\s*$/,
  ];

  isSafe(input) {
    return !SQLInjectionChecker.PATTERNS.some((p) => p.test(input));
  }
}

class XSSChecker {
  static PATTERNS = [
    /<script[^>]*>/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /<iframe[^>]*>/i,
  ];

  isSafe(input) {
    return !XSSChecker.PATTERNS.some((p) => p.test(input));
  }

  sanitize(input) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
    return input.replace(/[&<>"]/g, (ch) => map[ch]);
  }
}

describe("SQLInjectionChecker", () => {
  const checker = new SQLInjectionChecker();

  test("allows normal input", () => {
    expect(checker.isSafe("john_doe")).toBe(true);
    expect(checker.isSafe("select a book")).toBe(true);
  });

  test("detects OR injection", () => {
    expect(checker.isSafe("' OR '1'='1'")).toBe(false);
  });

  test("detects DROP TABLE", () => {
    expect(checker.isSafe("'; DROP TABLE users;")).toBe(false);
  });

  test("detects UNION SELECT", () => {
    expect(checker.isSafe("' UNION SELECT password FROM users")).toBe(false);
  });

  test("detects comment injection", () => {
    expect(checker.isSafe("admin' --")).toBe(false);
  });
});

describe("XSSChecker", () => {
  const checker = new XSSChecker();

  test("allows normal input", () => {
    expect(checker.isSafe("Hello, World!")).toBe(true);
  });

  test("detects script tags", () => {
    expect(checker.isSafe("<script>alert('xss')</script>")).toBe(false);
  });

  test("detects event handlers", () => {
    expect(checker.isSafe('<img onerror="alert(1)">')).toBe(false);
  });

  test("detects javascript URIs", () => {
    expect(checker.isSafe("javascript:alert(1)")).toBe(false);
  });

  test("sanitize escapes dangerous characters", () => {
    const result = checker.sanitize("<script>alert('xss')</script>");
    expect(result).toContain("&lt;script&gt;");
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;
import java.util.regex.Pattern;
import java.util.List;

public class SecurityTest {

    static class SQLInjectionChecker {
        private static final List<Pattern> PATTERNS = List.of(
            Pattern.compile("'\\s*OR\\s+.*=.*", Pattern.CASE_INSENSITIVE),
            Pattern.compile(";\\s*DROP\\s+TABLE", Pattern.CASE_INSENSITIVE),
            Pattern.compile("UNION\\s+SELECT", Pattern.CASE_INSENSITIVE),
            Pattern.compile("--\\s*$")
        );

        public boolean isSafe(String input) {
            return PATTERNS.stream().noneMatch(p -> p.matcher(input).find());
        }
    }

    static class XSSChecker {
        private static final List<Pattern> PATTERNS = List.of(
            Pattern.compile("<script[^>]*>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE),
            Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE)
        );

        public boolean isSafe(String input) {
            return PATTERNS.stream().noneMatch(p -> p.matcher(input).find());
        }

        public String sanitize(String input) {
            return input.replace("&", "&amp;").replace("<", "&lt;")
                        .replace(">", "&gt;").replace("\"", "&quot;");
        }
    }

    private final SQLInjectionChecker sqlChecker = new SQLInjectionChecker();
    private final XSSChecker xssChecker = new XSSChecker();

    @Test
    void normalInputPassesSQLCheck() {
        assertTrue(sqlChecker.isSafe("john_doe"));
        assertTrue(sqlChecker.isSafe("select a book"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "' OR '1'='1'",
        "'; DROP TABLE users;",
        "' UNION SELECT password FROM users",
        "admin' --"
    })
    void detectsSQLInjection(String payload) {
        assertFalse(sqlChecker.isSafe(payload));
    }

    @Test
    void normalInputPassesXSSCheck() {
        assertTrue(xssChecker.isSafe("Hello, World!"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "<script>alert('xss')</script>",
        "<img onerror=\"alert(1)\">",
        "javascript:alert(1)"
    })
    void detectsXSSPayloads(String payload) {
        assertFalse(xssChecker.isSafe(payload));
    }

    @Test
    void sanitizeEscapesHTML() {
        String result = xssChecker.sanitize("<script>alert('xss')</script>");
        assertTrue(result.contains("&lt;script&gt;"));
    }
}
```

### C#

```csharp
using Xunit;
using System.Text.RegularExpressions;
using System.Web;

public class SQLInjectionChecker
{
    private static readonly Regex[] Patterns = {
        new(@"'\s*OR\s+.*=.*", RegexOptions.IgnoreCase),
        new(@";\s*DROP\s+TABLE", RegexOptions.IgnoreCase),
        new(@"UNION\s+SELECT", RegexOptions.IgnoreCase),
        new(@"--\s*$"),
    };

    public bool IsSafe(string input) =>
        !Array.Exists(Patterns, p => p.IsMatch(input));
}

public class XSSChecker
{
    private static readonly Regex[] Patterns = {
        new(@"<script[^>]*>", RegexOptions.IgnoreCase),
        new(@"on\w+\s*=", RegexOptions.IgnoreCase),
        new(@"javascript:", RegexOptions.IgnoreCase),
    };

    public bool IsSafe(string input) =>
        !Array.Exists(Patterns, p => p.IsMatch(input));

    public string Sanitize(string input) => HttpUtility.HtmlEncode(input);
}

public class SecurityTests
{
    private readonly SQLInjectionChecker _sql = new();
    private readonly XSSChecker _xss = new();

    [Theory]
    [InlineData("john_doe")]
    [InlineData("select a book")]
    public void NormalInput_PassesSQLCheck(string input) =>
        Assert.True(_sql.IsSafe(input));

    [Theory]
    [InlineData("' OR '1'='1'")]
    [InlineData("'; DROP TABLE users;")]
    [InlineData("' UNION SELECT password FROM users")]
    [InlineData("admin' --")]
    public void SQLInjection_IsDetected(string payload) =>
        Assert.False(_sql.IsSafe(payload));

    [Fact]
    public void NormalInput_PassesXSSCheck() =>
        Assert.True(_xss.IsSafe("Hello, World!"));

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("<img onerror=\"alert(1)\">")]
    [InlineData("javascript:alert(1)")]
    public void XSSPayload_IsDetected(string payload) =>
        Assert.False(_xss.IsSafe(payload));

    [Fact]
    public void Sanitize_EscapesHTML()
    {
        var result = _xss.Sanitize("<script>alert('xss')</script>");
        Assert.Contains("&lt;script&gt;", result);
    }
}
```

## Summary

| Phase | Technique | Tools |
|-------|-----------|-------|
| Coding | SAST | Bandit, ESLint security, SpotBugs, Roslyn |
| Build | Dependency scanning | Safety, npm audit, Dependency-Check |
| Testing | DAST | OWASP ZAP, Burp Suite |
| Review | Penetration testing | Custom scripts, checklists |

Effective security testing combines automated scanning in CI/CD pipelines with targeted manual testing for business logic flaws that scanners miss.
