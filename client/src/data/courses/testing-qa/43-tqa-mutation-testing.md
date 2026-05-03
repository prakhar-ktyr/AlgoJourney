---
title: Mutation Testing
---

# Mutation Testing

Mutation testing measures test suite effectiveness by introducing small bugs (mutants) into source code and checking whether existing tests detect them. If a test fails after a mutation, the mutant is "killed." If all tests still pass, the mutant "survived" — revealing a gap in test coverage.

## How Mutation Testing Works

1. **Parse source code** into an abstract syntax tree
2. **Apply mutation operators** to create modified versions (mutants)
3. **Run the test suite** against each mutant
4. **Classify results**: killed (test failed), survived (tests passed), timed out, or equivalent

```text
Original:  if (a > b) return a;
Mutant 1:  if (a >= b) return a;   ← Relational operator change
Mutant 2:  if (a < b) return a;    ← Boundary swap
Mutant 3:  if (a > b) return b;    ← Return value change
```

## Mutation Operators

### Arithmetic Operators

| Original | Mutants |
|----------|---------|
| `a + b` | `a - b`, `a * b`, `a / b` |
| `a * b` | `a + b`, `a - b`, `a / b` |
| `a % b` | `a * b`, `a + b` |

### Relational Operators

| Original | Mutants |
|----------|---------|
| `a > b` | `a >= b`, `a < b`, `a == b` |
| `a == b` | `a != b`, `a >= b` |
| `a != b` | `a == b` |

### Logical & Other Mutations

- `a && b` → `a || b`, `true`, `false`
- `!a` → `a`
- **Statement deletion**: Remove a line of code entirely
- **Return value mutation**: Change return values (`true` → `false`, `0` → `1`)
- **Negate conditionals**: Flip if-conditions
- **Constant mutation**: Replace literals (`0` → `1`, `""` → `"mutant"`)

## Mutation Score

The mutation score quantifies test suite strength:

$$\text{Mutation Score} = \frac{\text{Killed Mutants}}{\text{Total Mutants} - \text{Equivalent Mutants}} \times 100\%$$

- **80%+**: Good — **90%+**: Strong — **95%+**: Excellent (diminishing returns beyond)

### Interpreting Results

**Surviving mutants** indicate missing test cases or weak assertions (checking existence but not correctness).

**Equivalent mutants** produce functionally identical behavior and cannot be killed. Most tools detect and exclude them automatically.

## Tools

| Language | Tool | Command |
|----------|------|---------|
| Python | mutmut | `mutmut run --paths-to-mutate=src/` |
| JavaScript | Stryker | `npx stryker run` |
| Java | PITest | `mvn org.pitest:pitest-maven-plugin:mutationCoverage` |
| C# | Stryker.NET | `dotnet stryker` |

## Code: Mutation Testing Examples

### Python

```python
# src/calculator.py
class Calculator:
    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def max_value(self, a: float, b: float) -> float:
        if a > b:
            return a
        return b

    def is_positive(self, n: float) -> bool:
        return n > 0

    def clamp(self, value: float, low: float, high: float) -> float:
        if value < low:
            return low
        if value > high:
            return high
        return value


# tests/test_calculator.py — designed to kill all major mutants
import pytest
from calculator import Calculator


class TestCalculator:
    def setup_method(self):
        self.calc = Calculator()

    def test_add(self):
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0
        assert self.calc.add(0, 0) == 0

    def test_subtract(self):
        assert self.calc.subtract(5, 3) == 2
        assert self.calc.subtract(3, 5) == -2

    def test_multiply(self):
        assert self.calc.multiply(3, 4) == 12
        assert self.calc.multiply(0, 100) == 0

    def test_divide(self):
        assert self.calc.divide(10, 2) == 5
        assert self.calc.divide(7, 2) == 3.5
        with pytest.raises(ValueError):
            self.calc.divide(1, 0)

    def test_max_value(self):
        assert self.calc.max_value(5, 3) == 5
        assert self.calc.max_value(3, 5) == 5
        assert self.calc.max_value(4, 4) == 4

    def test_is_positive(self):
        assert self.calc.is_positive(1) is True
        assert self.calc.is_positive(-1) is False
        assert self.calc.is_positive(0) is False

    def test_clamp(self):
        assert self.calc.clamp(5, 0, 10) == 5
        assert self.calc.clamp(-5, 0, 10) == 0
        assert self.calc.clamp(15, 0, 10) == 10
        assert self.calc.clamp(0, 0, 10) == 0
        assert self.calc.clamp(10, 0, 10) == 10
```

### JavaScript

```javascript
// src/calculator.js
class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
  multiply(a, b) { return a * b; }

  divide(a, b) {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  }

  maxValue(a, b) {
    if (a > b) return a;
    return b;
  }

  isPositive(n) { return n > 0; }

  clamp(value, low, high) {
    if (value < low) return low;
    if (value > high) return high;
    return value;
  }
}

// tests/calculator.test.js — kills Stryker mutants
describe("Calculator", () => {
  const calc = new Calculator();

  test("add returns sum", () => {
    expect(calc.add(2, 3)).toBe(5);
    expect(calc.add(-1, 1)).toBe(0);
    expect(calc.add(0, 0)).toBe(0);
  });

  test("subtract returns difference", () => {
    expect(calc.subtract(5, 3)).toBe(2);
    expect(calc.subtract(3, 5)).toBe(-2);
  });

  test("multiply returns product", () => {
    expect(calc.multiply(3, 4)).toBe(12);
    expect(calc.multiply(0, 100)).toBe(0);
  });

  test("divide returns quotient", () => {
    expect(calc.divide(10, 2)).toBe(5);
    expect(calc.divide(7, 2)).toBe(3.5);
    expect(() => calc.divide(1, 0)).toThrow();
  });

  test("maxValue returns larger", () => {
    expect(calc.maxValue(5, 3)).toBe(5);
    expect(calc.maxValue(3, 5)).toBe(5);
    expect(calc.maxValue(4, 4)).toBe(4);
  });

  test("isPositive checks sign", () => {
    expect(calc.isPositive(1)).toBe(true);
    expect(calc.isPositive(-1)).toBe(false);
    expect(calc.isPositive(0)).toBe(false);
  });

  test("clamp constrains value", () => {
    expect(calc.clamp(5, 0, 10)).toBe(5);
    expect(calc.clamp(-5, 0, 10)).toBe(0);
    expect(calc.clamp(15, 0, 10)).toBe(10);
    expect(calc.clamp(0, 0, 10)).toBe(0);
    expect(calc.clamp(10, 0, 10)).toBe(10);
  });
});

// stryker.conf.json
// {
//   "testRunner": "jest",
//   "reporters": ["html", "clear-text", "progress"],
//   "thresholds": { "high": 90, "low": 70, "break": 60 }
// }
```

### Java

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class Calculator {
    double add(double a, double b) { return a + b; }
    double subtract(double a, double b) { return a - b; }
    double multiply(double a, double b) { return a * b; }

    double divide(double a, double b) {
        if (b == 0) throw new ArithmeticException("Cannot divide by zero");
        return a / b;
    }

    double maxValue(double a, double b) {
        if (a > b) return a;
        return b;
    }

    boolean isPositive(double n) { return n > 0; }

    double clamp(double value, double low, double high) {
        if (value < low) return low;
        if (value > high) return high;
        return value;
    }
}

// Tests designed to kill PITest mutants
public class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() { calc = new Calculator(); }

    @Test void testAdd() {
        assertEquals(5.0, calc.add(2, 3));
        assertEquals(0.0, calc.add(-1, 1));
        assertEquals(0.0, calc.add(0, 0));
    }

    @Test void testSubtract() {
        assertEquals(2.0, calc.subtract(5, 3));
        assertEquals(-2.0, calc.subtract(3, 5));
    }

    @Test void testMultiply() {
        assertEquals(12.0, calc.multiply(3, 4));
        assertEquals(0.0, calc.multiply(0, 100));
    }

    @Test void testDivide() {
        assertEquals(5.0, calc.divide(10, 2));
        assertEquals(3.5, calc.divide(7, 2));
        assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));
    }

    @Test void testMaxValue() {
        assertEquals(5.0, calc.maxValue(5, 3));
        assertEquals(5.0, calc.maxValue(3, 5));
        assertEquals(4.0, calc.maxValue(4, 4));
    }

    @Test void testIsPositive() {
        assertTrue(calc.isPositive(1));
        assertFalse(calc.isPositive(-1));
        assertFalse(calc.isPositive(0));
    }

    @Test void testClamp() {
        assertEquals(5.0, calc.clamp(5, 0, 10));
        assertEquals(0.0, calc.clamp(-5, 0, 10));
        assertEquals(10.0, calc.clamp(15, 0, 10));
        assertEquals(0.0, calc.clamp(0, 0, 10));
        assertEquals(10.0, calc.clamp(10, 0, 10));
    }
}

// PITest generates mutants like:
// - add(): return a - b (arithmetic)
// - maxValue(): if (a >= b) (relational)
// - isPositive(): return n >= 0 (boundary)
// - clamp(): remove if (statement deletion)
```

### C#

```csharp
using Xunit;

namespace MutationExample;

public class Calculator
{
    public double Add(double a, double b) => a + b;
    public double Subtract(double a, double b) => a - b;
    public double Multiply(double a, double b) => a * b;

    public double Divide(double a, double b)
    {
        if (b == 0) throw new DivideByZeroException();
        return a / b;
    }

    public double MaxValue(double a, double b) => a > b ? a : b;
    public bool IsPositive(double n) => n > 0;

    public double Clamp(double value, double low, double high)
    {
        if (value < low) return low;
        if (value > high) return high;
        return value;
    }
}

public class CalculatorTests
{
    private readonly Calculator _calc = new();

    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(-1, 1, 0)]
    [InlineData(0, 0, 0)]
    public void Add_ReturnsSum(double a, double b, double expected) =>
        Assert.Equal(expected, _calc.Add(a, b));

    [Theory]
    [InlineData(5, 3, 2)]
    [InlineData(3, 5, -2)]
    public void Subtract_ReturnsDifference(double a, double b, double expected) =>
        Assert.Equal(expected, _calc.Subtract(a, b));

    [Theory]
    [InlineData(3, 4, 12)]
    [InlineData(0, 100, 0)]
    public void Multiply_ReturnsProduct(double a, double b, double expected) =>
        Assert.Equal(expected, _calc.Multiply(a, b));

    [Fact]
    public void Divide_ReturnsQuotient() =>
        Assert.Equal(5.0, _calc.Divide(10, 2));

    [Fact]
    public void Divide_ThrowsOnZero() =>
        Assert.Throws<DivideByZeroException>(() => _calc.Divide(1, 0));

    [Theory]
    [InlineData(5, 3, 5)]
    [InlineData(3, 5, 5)]
    [InlineData(4, 4, 4)]
    public void MaxValue_ReturnsLarger(double a, double b, double expected) =>
        Assert.Equal(expected, _calc.MaxValue(a, b));

    [Theory]
    [InlineData(1, true)]
    [InlineData(-1, false)]
    [InlineData(0, false)]
    public void IsPositive_ChecksSign(double n, bool expected) =>
        Assert.Equal(expected, _calc.IsPositive(n));

    [Theory]
    [InlineData(5, 0, 10, 5)]
    [InlineData(-5, 0, 10, 0)]
    [InlineData(15, 0, 10, 10)]
    [InlineData(0, 0, 10, 0)]
    [InlineData(10, 0, 10, 10)]
    public void Clamp_ConstrainsValue(double val, double lo, double hi, double expected) =>
        Assert.Equal(expected, _calc.Clamp(val, lo, hi));
}

// Run: dotnet stryker
// Stryker.NET mutates arithmetic, relational, logical operators
// and reports which tests kill which mutants
```

## Practical Tips

1. **Start small** — Mutate critical modules first, not the entire codebase
2. **Set thresholds** — Fail CI if mutation score drops below a baseline (e.g., 80%)
3. **Focus on surviving mutants** — Each one reveals a missing assertion or test case
4. **Combine with coverage** — High line coverage + low mutation score means weak assertions
5. **Run incrementally** — Only mutate changed files in CI to keep feedback fast
6. **Boundary values matter** — Tests that check `>=` vs `>` boundaries kill the most mutants

## Summary

Mutation testing answers "How good are my tests?" rather than "How much code do my tests execute?" A test suite with 100% line coverage can still have a low mutation score if assertions are weak. Use mutation testing to find the gaps that traditional coverage metrics miss.
