---
title: Fuzz Testing
---

# Fuzz Testing

Fuzz testing automatically generates random or semi-random inputs to discover crashes, hangs, assertion failures, and unexpected behavior. It excels at finding edge cases that developers never anticipated.

## What Is Fuzzing?

Fuzzing feeds a program with malformed, unexpected, or random data and monitors for failures. Unlike example-based tests that check specific scenarios, fuzzers explore the input space systematically to find inputs that trigger bugs.

### Key Concepts

- **Test oracle**: How to determine if a test passed (crash detection, assertion checks)
- **Input corpus**: Initial set of valid inputs that guide the fuzzer
- **Mutation**: Modifying existing inputs to create new test cases
- **Generation**: Creating inputs from scratch based on grammar specifications
- **Coverage feedback**: Using code coverage to guide exploration toward new paths

## Types of Fuzzing

### Dumb Fuzzing

Generates completely random bytes with no knowledge of input format. Simple to implement with zero setup cost, but achieves low code coverage since most inputs are rejected early by parsers.

### Smart Fuzzing (Grammar-Based)

Uses knowledge of the input format to generate structurally valid but semantically interesting inputs. Higher code coverage at the cost of requiring format specification and more setup effort.

### Coverage-Guided Fuzzing

Instruments the target and uses coverage feedback to evolve inputs toward unexplored code paths:

```text
Corpus → Mutate → Execute (instrumented) → New coverage? → Add to corpus
```

This is the most effective approach. Tools: AFL, libFuzzer, Jazzer, SharpFuzz.

## When to Fuzz

Fuzzing is most effective on code that:

- **Parses complex inputs**: JSON, XML, HTML, protocol buffers, file formats
- **Validates user data**: Email addresses, URLs, phone numbers, form fields
- **Performs serialization/deserialization**: Converting between formats
- **Handles network protocols**: HTTP parsers, WebSocket frames
- **Processes untrusted data**: File uploads, API inputs, configuration files

## Fuzzing Tools

| Language | Tool | Approach |
|----------|------|----------|
| Python | Hypothesis | Strategy-based generation with shrinking |
| JavaScript | fast-check | Arbitraries with configurable constraints |
| Java | JQF | Coverage-guided + property-based |
| C# | FsCheck | QuickCheck-style generation for .NET |

## Property-Based Testing Overlap

Fuzzing and property-based testing share the idea of generating many inputs and checking invariants:

| Aspect | Fuzzing | Property-Based Testing |
|--------|---------|----------------------|
| Goal | Find crashes, security bugs | Verify logical properties |
| Input | Random/mutated bytes | Typed, structured values |
| Oracle | Crash = bug | Property violation = bug |
| Shrinking | Optional | Core feature |
| Coverage | Often guided | Usually random |

In practice, modern tools blur these boundaries.

## Code: Fuzz a String Parser/Validator

We fuzz an email validator that should handle any input without crashing.

### Python

```python
import re
from hypothesis import given, settings, assume
from hypothesis import strategies as st


class EmailValidator:
    PATTERN = re.compile(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    )
    MAX_LENGTH = 254

    def validate(self, email: str) -> bool:
        if not email or len(email) > self.MAX_LENGTH:
            return False
        if not self.PATTERN.match(email):
            return False
        local, domain = email.rsplit("@", 1)
        if len(local) > 64:
            return False
        if domain.startswith(".") or domain.endswith("."):
            return False
        return True


validator = EmailValidator()


@given(st.text(min_size=0, max_size=300))
@settings(max_examples=1000)
def test_validator_never_crashes(text):
    """The validator must never crash regardless of input."""
    result = validator.validate(text)
    assert isinstance(result, bool)


@given(
    local=st.from_regex(r"[a-zA-Z0-9._%+-]{1,64}", fullmatch=True),
    domain=st.from_regex(r"[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}", fullmatch=True),
)
@settings(max_examples=500)
def test_valid_emails_accepted(local, domain):
    """Well-formed emails should be accepted."""
    assume(not domain.startswith("."))
    assume(not domain.endswith("."))
    email = f"{local}@{domain}"
    assume(len(email) <= 254)
    assert validator.validate(email)


@given(st.text(alphabet=st.characters(blacklist_categories=("Cs",))))
@settings(max_examples=500)
def test_rejects_no_at_sign(text):
    """Strings without @ should never validate."""
    assume("@" not in text)
    assert not validator.validate(text)
```

### JavaScript

```javascript
const fc = require("fast-check");

class EmailValidator {
  static PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  static MAX_LENGTH = 254;

  validate(email) {
    if (!email || email.length > EmailValidator.MAX_LENGTH) return false;
    if (!EmailValidator.PATTERN.test(email)) return false;
    const atIndex = email.lastIndexOf("@");
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (local.length > 64) return false;
    if (domain.startsWith(".") || domain.endsWith(".")) return false;
    return true;
  }
}

describe("Fuzz EmailValidator", () => {
  const validator = new EmailValidator();

  test("never crashes on arbitrary strings", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 300 }), (input) => {
        const result = validator.validate(input);
        return typeof result === "boolean";
      }),
      { numRuns: 1000 }
    );
  });

  test("rejects strings without @", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.includes("@")),
        (input) => validator.validate(input) === false
      ),
      { numRuns: 500 }
    );
  });

  test("accepts well-formed emails", () => {
    const emailArb = fc
      .tuple(
        fc.stringOf(
          fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"),
          { minLength: 1, maxLength: 20 }
        ),
        fc.stringOf(
          fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"),
          { minLength: 1, maxLength: 10 }
        ),
        fc.constantFrom("com", "org", "net", "io")
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    fc.assert(
      fc.property(emailArb, (email) => validator.validate(email) === true),
      { numRuns: 500 }
    );
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.regex.Pattern;
import java.util.Random;

public class FuzzTest {

    static class EmailValidator {
        private static final Pattern PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
        );

        public boolean validate(String email) {
            if (email == null || email.isEmpty() || email.length() > 254)
                return false;
            if (!PATTERN.matcher(email).matches()) return false;
            int atIndex = email.lastIndexOf('@');
            String local = email.substring(0, atIndex);
            String domain = email.substring(atIndex + 1);
            if (local.length() > 64) return false;
            return !domain.startsWith(".") && !domain.endsWith(".");
        }
    }

    private final EmailValidator validator = new EmailValidator();
    private final Random random = new Random(42);

    @Test
    void fuzzNeverCrashes() {
        for (int i = 0; i < 1000; i++) {
            String input = generateRandomString(random.nextInt(300));
            boolean result = validator.validate(input);
            assertTrue(result || !result); // must not throw
        }
    }

    @Test
    void fuzzRejectsNoAtSign() {
        for (int i = 0; i < 500; i++) {
            String input = generateRandomString(random.nextInt(100))
                .replace("@", "");
            assertFalse(validator.validate(input));
        }
    }

    @Test
    void validEmailsAccepted() {
        String[] emails = {
            "user@example.com", "test.name@domain.org",
            "admin123@mail.io", "a@b.co"
        };
        for (String email : emails) {
            assertTrue(validator.validate(email));
        }
    }

    @Test
    void invalidEmailsRejected() {
        String[] invalid = {"", "no-at-sign", "@missing.com", "a@.bad.com"};
        for (String email : invalid) {
            assertFalse(validator.validate(email));
        }
    }

    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append((char) (random.nextInt(95) + 32));
        }
        return sb.toString();
    }
}
```

### C#

```csharp
using Xunit;
using FsCheck;
using FsCheck.Xunit;
using System.Text.RegularExpressions;

public class EmailValidator
{
    private static readonly Regex Pattern = new(
        @"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$");

    public bool Validate(string email)
    {
        if (string.IsNullOrEmpty(email) || email.Length > 254) return false;
        if (!Pattern.IsMatch(email)) return false;
        var atIndex = email.LastIndexOf('@');
        var local = email[..atIndex];
        var domain = email[(atIndex + 1)..];
        if (local.Length > 64) return false;
        return !domain.StartsWith('.') && !domain.EndsWith('.');
    }
}

public class FuzzTests
{
    private readonly EmailValidator _validator = new();

    [Property(MaxTest = 1000)]
    public Property Validator_NeverCrashes()
    {
        return Prop.ForAll<string>(input =>
        {
            var result = _validator.Validate(input ?? "");
            return (result || !result).ToProperty();
        });
    }

    [Property(MaxTest = 500)]
    public Property Validator_RejectsNoAtSign()
    {
        return Prop.ForAll(
            Arb.Default.String().Filter(s => s != null && !s.Contains('@')),
            input => (!_validator.Validate(input)).ToProperty()
        );
    }

    [Theory]
    [InlineData("user@example.com")]
    [InlineData("test.name@domain.org")]
    [InlineData("admin@mail.io")]
    public void ValidEmails_AreAccepted(string email)
    {
        Assert.True(_validator.Validate(email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("no-at-sign")]
    [InlineData("@missing-local.com")]
    [InlineData("user@.bad.com")]
    public void InvalidEmails_AreRejected(string email)
    {
        Assert.False(_validator.Validate(email));
    }
}
```

## Integrating Fuzzing into CI/CD

Fuzzing works best as a continuous process rather than a one-time activity:

```yaml
# GitHub Actions example for continuous fuzzing
name: Fuzz Tests
on:
  schedule:
    - cron: '0 2 * * *'  # nightly
  push:
    branches: [main]

jobs:
  fuzz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run fuzz tests (10 minutes)
        run: |
          pip install hypothesis
          python -m pytest tests/fuzz/ --hypothesis-seed=0 -x
        timeout-minutes: 15
      - name: Upload crash artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: fuzz-crashes
          path: .hypothesis/
```

### Corpus Management

Maintain a corpus directory in version control:

```text
tests/
  fuzz/
    corpus/
      valid_emails.txt      # known-good inputs
      edge_cases.txt        # previously found bugs
    test_email_fuzzer.py
```

Each time a fuzzer finds a new crash, add the minimal reproduction to the corpus as a regression test.

## Best Practices

1. **Start with a corpus** — Provide valid inputs so the fuzzer explores meaningful paths
2. **Run long** — Fuzzers find deeper bugs with more time; CI runs of 5+ minutes help
3. **Fix crashes immediately** — Each crash is a potential security vulnerability
4. **Save interesting inputs** — Build a regression corpus from found bugs
5. **Fuzz at boundaries** — Focus on parsers, deserializers, and trust boundaries
6. **Combine with sanitizers** — AddressSanitizer and UBSan catch memory bugs during fuzzing
7. **Set timeouts** — Detect infinite loops and hangs as bugs too
8. **Fuzz early** — Introduce fuzzing when code is first written, not after deployment

## Common Fuzzing Findings

| Bug Type | How Fuzzing Finds It |
|----------|---------------------|
| Buffer overflow | Oversized inputs exceed fixed buffers |
| Integer overflow | Extreme values trigger arithmetic wraparound |
| Null dereference | Missing null checks in edge paths |
| Infinite loops | Crafted input causes non-termination |
| Assertion failures | Violated internal invariants |
| Memory leaks | Repeated execution reveals growing memory |
| Format string bugs | Special characters in user input |

## Summary

Fuzzing complements traditional testing by exploring the vast space of possible inputs that humans cannot enumerate manually. Coverage-guided fuzzers have found thousands of bugs in production software including critical vulnerabilities in OpenSSL, libpng, and SQLite. Start with your parsers and validators — they are the highest-value fuzzing targets.
