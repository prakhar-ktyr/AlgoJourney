---
title: Test-Driven Development (TDD)
---

# Test-Driven Development (TDD)

Test-Driven Development is a software development methodology where you write tests **before** writing the production code. It inverts the traditional workflow: instead of writing code then testing it, you let the tests drive the design of your code.

## The Red-Green-Refactor Cycle

TDD follows a strict three-step cycle:

1. **Red** — Write a failing test that defines desired behavior
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Clean up the code while keeping tests green

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  RED    │────▶│  GREEN  │────▶│ REFACTOR │
│ (fail)  │     │ (pass)  │     │ (clean)  │
└─────────┘     └─────────┘     └──────────┘
      ▲                                │
      └────────────────────────────────┘
```

### Rules of TDD

1. Write production code **only** to make a failing test pass
2. Write only **enough** of a test to demonstrate a failure
3. Write only **enough** production code to pass the test

## Walkthrough: FizzBuzz via TDD

Let's build FizzBuzz step by step using TDD in all four languages. The rules:
- Return "Fizz" for multiples of 3
- Return "Buzz" for multiples of 5
- Return "FizzBuzz" for multiples of both 3 and 5
- Otherwise return the number as a string

### Python (pytest)

**Step 1: RED — Test for regular numbers**

```python
# test_fizzbuzz.py
from fizzbuzz import fizzbuzz

def test_returns_number_as_string():
    assert fizzbuzz(1) == "1"
    assert fizzbuzz(2) == "2"
```

Running this fails: `ModuleNotFoundError: No module named 'fizzbuzz'`

**Step 2: GREEN — Minimal implementation**

```python
# fizzbuzz.py
def fizzbuzz(n):
    return str(n)
```

Tests pass. Move on.

**Step 3: RED — Test for Fizz**

```python
def test_returns_fizz_for_multiples_of_3():
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(6) == "Fizz"
    assert fizzbuzz(9) == "Fizz"
```

**Step 4: GREEN — Add Fizz logic**

```python
def fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    return str(n)
```

**Step 5: RED — Test for Buzz**

```python
def test_returns_buzz_for_multiples_of_5():
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(10) == "Buzz"
    assert fizzbuzz(20) == "Buzz"
```

**Step 6: GREEN — Add Buzz logic**

```python
def fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)
```

**Step 7: RED — Test for FizzBuzz**

```python
def test_returns_fizzbuzz_for_multiples_of_3_and_5():
    assert fizzbuzz(15) == "FizzBuzz"
    assert fizzbuzz(30) == "FizzBuzz"
    assert fizzbuzz(45) == "FizzBuzz"
```

**Step 8: GREEN — Add FizzBuzz logic**

```python
def fizzbuzz(n):
    if n % 3 == 0 and n % 5 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)
```

**Step 9: REFACTOR — Clean up**

```python
def fizzbuzz(n):
    result = ""
    if n % 3 == 0:
        result += "Fizz"
    if n % 5 == 0:
        result += "Buzz"
    return result or str(n)
```

All tests still pass. The design emerged from the tests.

### JavaScript (Jest)

**Step 1: RED — Regular numbers**

```javascript
// fizzbuzz.test.js
const fizzbuzz = require("./fizzbuzz");

describe("fizzbuzz", () => {
  test("returns number as string for non-multiples", () => {
    expect(fizzbuzz(1)).toBe("1");
    expect(fizzbuzz(2)).toBe("2");
  });
});
```

**Step 2: GREEN**

```javascript
// fizzbuzz.js
function fizzbuzz(n) {
  return String(n);
}
module.exports = fizzbuzz;
```

**Step 3: RED — Fizz**

```javascript
  test("returns Fizz for multiples of 3", () => {
    expect(fizzbuzz(3)).toBe("Fizz");
    expect(fizzbuzz(6)).toBe("Fizz");
    expect(fizzbuzz(9)).toBe("Fizz");
  });
```

**Step 4: GREEN**

```javascript
function fizzbuzz(n) {
  if (n % 3 === 0) return "Fizz";
  return String(n);
}
```

**Step 5: RED — Buzz**

```javascript
  test("returns Buzz for multiples of 5", () => {
    expect(fizzbuzz(5)).toBe("Buzz");
    expect(fizzbuzz(10)).toBe("Buzz");
    expect(fizzbuzz(20)).toBe("Buzz");
  });
```

**Step 6: GREEN**

```javascript
function fizzbuzz(n) {
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}
```

**Step 7: RED — FizzBuzz**

```javascript
  test("returns FizzBuzz for multiples of both 3 and 5", () => {
    expect(fizzbuzz(15)).toBe("FizzBuzz");
    expect(fizzbuzz(30)).toBe("FizzBuzz");
  });
```

**Step 8: GREEN + REFACTOR**

```javascript
function fizzbuzz(n) {
  let result = "";
  if (n % 3 === 0) result += "Fizz";
  if (n % 5 === 0) result += "Buzz";
  return result || String(n);
}

module.exports = fizzbuzz;
```

### Java (JUnit 5)

**Step 1: RED — Regular numbers**

```java
// FizzBuzzTest.java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FizzBuzzTest {
    @Test
    void returnsNumberAsString() {
        assertEquals("1", FizzBuzz.convert(1));
        assertEquals("2", FizzBuzz.convert(2));
    }
}
```

**Step 2: GREEN**

```java
// FizzBuzz.java
public class FizzBuzz {
    public static String convert(int n) {
        return String.valueOf(n);
    }
}
```

**Step 3: RED — Fizz**

```java
    @Test
    void returnsFizzForMultiplesOf3() {
        assertEquals("Fizz", FizzBuzz.convert(3));
        assertEquals("Fizz", FizzBuzz.convert(6));
        assertEquals("Fizz", FizzBuzz.convert(9));
    }
```

**Step 4: GREEN**

```java
public static String convert(int n) {
    if (n % 3 == 0) return "Fizz";
    return String.valueOf(n);
}
```

**Step 5: RED — Buzz**

```java
    @Test
    void returnsBuzzForMultiplesOf5() {
        assertEquals("Buzz", FizzBuzz.convert(5));
        assertEquals("Buzz", FizzBuzz.convert(10));
        assertEquals("Buzz", FizzBuzz.convert(20));
    }
```

**Step 6: GREEN**

```java
public static String convert(int n) {
    if (n % 3 == 0) return "Fizz";
    if (n % 5 == 0) return "Buzz";
    return String.valueOf(n);
}
```

**Step 7: RED — FizzBuzz**

```java
    @Test
    void returnsFizzBuzzForMultiplesOf3And5() {
        assertEquals("FizzBuzz", FizzBuzz.convert(15));
        assertEquals("FizzBuzz", FizzBuzz.convert(30));
    }
```

**Step 8: GREEN + REFACTOR**

```java
public class FizzBuzz {
    public static String convert(int n) {
        StringBuilder result = new StringBuilder();
        if (n % 3 == 0) result.append("Fizz");
        if (n % 5 == 0) result.append("Buzz");
        return result.length() > 0 ? result.toString() : String.valueOf(n);
    }
}
```

### C# (xUnit)

**Step 1: RED — Regular numbers**

```csharp
// FizzBuzzTests.cs
using Xunit;

public class FizzBuzzTests
{
    [Fact]
    public void ReturnsNumberAsString()
    {
        Assert.Equal("1", FizzBuzz.Convert(1));
        Assert.Equal("2", FizzBuzz.Convert(2));
    }
}
```

**Step 2: GREEN**

```csharp
// FizzBuzz.cs
public static class FizzBuzz
{
    public static string Convert(int n) => n.ToString();
}
```

**Step 3: RED — Fizz**

```csharp
    [Fact]
    public void ReturnsFizzForMultiplesOf3()
    {
        Assert.Equal("Fizz", FizzBuzz.Convert(3));
        Assert.Equal("Fizz", FizzBuzz.Convert(6));
        Assert.Equal("Fizz", FizzBuzz.Convert(9));
    }
```

**Step 4: GREEN**

```csharp
public static string Convert(int n)
{
    if (n % 3 == 0) return "Fizz";
    return n.ToString();
}
```

**Step 5: RED — Buzz**

```csharp
    [Fact]
    public void ReturnsBuzzForMultiplesOf5()
    {
        Assert.Equal("Buzz", FizzBuzz.Convert(5));
        Assert.Equal("Buzz", FizzBuzz.Convert(10));
        Assert.Equal("Buzz", FizzBuzz.Convert(20));
    }
```

**Step 6: GREEN**

```csharp
public static string Convert(int n)
{
    if (n % 3 == 0) return "Fizz";
    if (n % 5 == 0) return "Buzz";
    return n.ToString();
}
```

**Step 7: RED — FizzBuzz**

```csharp
    [Fact]
    public void ReturnsFizzBuzzForMultiplesOf3And5()
    {
        Assert.Equal("FizzBuzz", FizzBuzz.Convert(15));
        Assert.Equal("FizzBuzz", FizzBuzz.Convert(30));
    }
```

**Step 8: GREEN + REFACTOR**

```csharp
public static class FizzBuzz
{
    public static string Convert(int n)
    {
        var result = "";
        if (n % 3 == 0) result += "Fizz";
        if (n % 5 == 0) result += "Buzz";
        return string.IsNullOrEmpty(result) ? n.ToString() : result;
    }
}
```

## Benefits of TDD

### Design Emerges from Tests

When you write the test first, you think about the **interface** before the **implementation**. This naturally leads to:
- Smaller, focused functions
- Clear input/output contracts
- Loosely coupled modules (testable code is decoupled code)

### Less Debugging

Since you run tests after every small change, bugs are caught immediately. You never go more than a few minutes between a working state and a broken one.

### Built-in Regression Suite

Every feature has tests from birth. You never accumulate test debt.

### Confidence to Refactor

With comprehensive tests, you can restructure code freely. If tests stay green, behavior is preserved.

## Challenges of TDD

### Learning Curve

The biggest challenge is knowing **what to test first**. Beginners often:
- Write tests that are too large (testing multiple behaviors)
- Write tests that are too tied to implementation
- Struggle with the discipline of not writing code before a test

### Pressure to Skip

Under deadline pressure, TDD feels slow. But studies show it reduces total development time by catching bugs earlier and reducing debugging time.

### Testing the Wrong Thing

```python
# BAD TDD: testing implementation details
def test_internal_cache_is_populated():
    service = UserService()
    service.get_user(1)
    assert service._cache[1] is not None  # fragile!

# GOOD TDD: testing behavior
def test_returns_same_user_on_repeated_calls():
    service = UserService()
    user1 = service.get_user(1)
    user2 = service.get_user(1)
    assert user1 == user2
```

## TDD vs Writing Tests After

| Aspect | TDD | Tests After |
|--------|-----|-------------|
| Design influence | Tests drive design | Code drives tests |
| Coverage | Natural high coverage | Gaps are common |
| Test quality | Tests verify behavior | Tests verify implementation |
| Debugging time | Minimal | Can be significant |
| Initial speed | Slower start | Faster start |
| Long-term speed | Faster (fewer bugs) | Slower (more debugging) |

## When TDD Works Best

TDD excels for:
- **Business logic** — rules with clear inputs and outputs
- **Algorithms** — well-defined transformations
- **APIs** — designing clean interfaces
- **Bug fixes** — write a test that reproduces the bug, then fix it

TDD is less natural for:
- **UI/visual work** — hard to test appearance
- **Exploratory prototyping** — when you don't know what you want yet
- **Infrastructure/config** — side-effect heavy code
- **Third-party integrations** — external behavior you can't control

## TDD in Practice: A Real-World Example

Building a password validator with TDD:

```python
# test_password.py — TDD cycle

# Cycle 1: RED — must be at least 8 characters
def test_rejects_short_passwords():
    assert validate_password("short") == False

# GREEN
def validate_password(password):
    return len(password) >= 8

# Cycle 2: RED — must contain uppercase
def test_rejects_no_uppercase():
    assert validate_password("lowercase1") == False

# GREEN
def validate_password(password):
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    return True

# Cycle 3: RED — must contain a digit
def test_rejects_no_digit():
    assert validate_password("NoDigits!") == False

# GREEN
def validate_password(password):
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True

# Cycle 4: RED — valid password should pass
def test_accepts_valid_password():
    assert validate_password("Valid1Pass") == True

# GREEN — already passes! No change needed.

# REFACTOR
def validate_password(password):
    checks = [
        len(password) >= 8,
        any(c.isupper() for c in password),
        any(c.isdigit() for c in password),
    ]
    return all(checks)
```

## Summary

TDD is a discipline that produces well-tested, well-designed code:
1. **Red** — write a test that fails
2. **Green** — write minimal code to pass
3. **Refactor** — improve without changing behavior

The key insight: TDD isn't about testing. It's about **design**. Tests are a byproduct of thinking carefully about what your code should do before you write it.
