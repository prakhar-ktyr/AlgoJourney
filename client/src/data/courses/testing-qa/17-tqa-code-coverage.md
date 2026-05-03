---
title: Code Coverage
---

# Code Coverage

Code coverage measures how much of your source code is executed when your test suite runs. It's a quantitative metric that helps identify untested parts of your codebase, but it must be interpreted carefully.

## Types of Code Coverage

### Line Coverage

Line coverage (or statement coverage) measures the percentage of executable lines that were run during testing.

```python
# If tests only call add(2, 3), line coverage = 2/3 = 66%
def add(a, b):
    return a + b  # covered

def subtract(a, b):
    return a - b  # NOT covered
```

### Branch Coverage

Branch coverage measures whether each branch of control structures (if/else, switch) has been executed.

```python
def classify_age(age):
    if age < 18:       # branch 1
        return "minor"
    elif age < 65:     # branch 2
        return "adult"
    else:              # branch 3
        return "senior"

# Testing only classify_age(25) gives 33% branch coverage
# Testing classify_age(10), classify_age(25), classify_age(70) gives 100%
```

### Function Coverage

Function coverage tracks whether each function/method in your code has been called at least once.

### Statement Coverage

Statement coverage is similar to line coverage but counts individual statements. A single line may contain multiple statements (e.g., `x = 1; y = 2`).

## Coverage Tools

| Language | Tool | Report Formats |
|----------|------|----------------|
| Python | coverage.py | HTML, XML, JSON, terminal |
| JavaScript | Istanbul/c8 | HTML, LCOV, text, JSON |
| Java | JaCoCo | HTML, XML, CSV |
| C# | Coverlet | Cobertura, LCOV, OpenCover |

## Running Coverage Reports

### Python — coverage.py

```python
# Install
# pip install pytest-cov

# calculator.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# test_calculator.py
import pytest
from calculator import add, subtract, multiply, divide

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

def test_subtract():
    assert subtract(5, 3) == 2

def test_multiply():
    assert multiply(4, 3) == 12

def test_divide():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)

# Run with coverage:
# pytest --cov=calculator --cov-report=html --cov-report=term
#
# Output:
# Name             Stmts   Miss  Cover
# ------------------------------------
# calculator.py        8      0   100%
# ------------------------------------
# TOTAL                8      0   100%
```

### JavaScript — c8 (Istanbul)

```javascript
// Install
// npm install --save-dev c8 jest

// calculator.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

module.exports = { add, subtract, multiply, divide };

// calculator.test.js
const { add, subtract, multiply, divide } = require("./calculator");

describe("Calculator", () => {
  test("add returns sum", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  test("subtract returns difference", () => {
    expect(subtract(5, 3)).toBe(2);
  });

  test("multiply returns product", () => {
    expect(multiply(4, 3)).toBe(12);
  });

  test("divide returns quotient", () => {
    expect(divide(10, 2)).toBe(5);
  });

  test("divide throws on zero", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });
});

// package.json script:
// "test:coverage": "jest --coverage"
//
// Or with c8:
// "test:coverage": "c8 jest"
//
// Output:
// -------------------|---------|----------|---------|---------|
// File               | % Stmts | % Branch | % Funcs | % Lines |
// -------------------|---------|----------|---------|---------|
// calculator.js      |     100 |      100 |     100 |     100 |
// -------------------|---------|----------|---------|---------|
```

### Java — JaCoCo

```java
// pom.xml plugin configuration:
// <plugin>
//   <groupId>org.jacoco</groupId>
//   <artifactId>jacoco-maven-plugin</artifactId>
//   <version>0.8.11</version>
//   <executions>
//     <execution>
//       <goals><goal>prepare-agent</goal></goals>
//     </execution>
//     <execution>
//       <id>report</id>
//       <phase>test</phase>
//       <goals><goal>report</goal></goals>
//     </execution>
//   </executions>
// </plugin>

// Calculator.java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public int subtract(int a, int b) {
        return a - b;
    }

    public int multiply(int a, int b) {
        return a * b;
    }

    public double divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return (double) a / b;
    }
}

// CalculatorTest.java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    private final Calculator calc = new Calculator();

    @Test
    void addReturnSum() {
        assertEquals(5, calc.add(2, 3));
        assertEquals(0, calc.add(-1, 1));
    }

    @Test
    void subtractReturnsDifference() {
        assertEquals(2, calc.subtract(5, 3));
    }

    @Test
    void multiplyReturnsProduct() {
        assertEquals(12, calc.multiply(4, 3));
    }

    @Test
    void divideReturnsQuotient() {
        assertEquals(5.0, calc.divide(10, 2));
    }

    @Test
    void divideThrowsOnZero() {
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }
}

// Run: mvn test
// Report generated at: target/site/jacoco/index.html
```

### C# — Coverlet

```csharp
// Install:
// dotnet add package coverlet.collector
// dotnet add package coverlet.msbuild

// Calculator.cs
namespace MyApp;

public class Calculator
{
    public int Add(int a, int b) => a + b;

    public int Subtract(int a, int b) => a - b;

    public int Multiply(int a, int b) => a * b;

    public double Divide(int a, int b)
    {
        if (b == 0)
            throw new DivideByZeroException("Cannot divide by zero");
        return (double)a / b;
    }
}

// CalculatorTests.cs
using Xunit;
using MyApp;

public class CalculatorTests
{
    private readonly Calculator _calc = new();

    [Fact]
    public void Add_ReturnsSum()
    {
        Assert.Equal(5, _calc.Add(2, 3));
        Assert.Equal(0, _calc.Add(-1, 1));
    }

    [Fact]
    public void Subtract_ReturnsDifference()
    {
        Assert.Equal(2, _calc.Subtract(5, 3));
    }

    [Fact]
    public void Multiply_ReturnsProduct()
    {
        Assert.Equal(12, _calc.Multiply(4, 3));
    }

    [Fact]
    public void Divide_ReturnsQuotient()
    {
        Assert.Equal(5.0, _calc.Divide(10, 2));
    }

    [Fact]
    public void Divide_ThrowsOnZero()
    {
        Assert.Throws<DivideByZeroException>(() => _calc.Divide(10, 0));
    }
}

// Run:
// dotnet test --collect:"XPlat Code Coverage"
//
// Or with MSBuild:
// dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=lcov
```

## Interpreting Coverage Reports

### What the Numbers Mean

- **100% line coverage** — every line was executed at least once
- **90% branch coverage** — 9 out of 10 decision branches were taken
- **Low function coverage** — dead code or untested utilities exist

### HTML Report Anatomy

Most tools generate HTML reports with:
- Green highlighted lines = covered
- Red highlighted lines = not covered
- Yellow highlighted lines = partially covered (some branches taken)

## Coverage Targets

### The 80% Guideline

Many teams aim for 80% code coverage as a reasonable baseline. This catches most regressions while acknowledging that some code (error handlers, edge cases) may be impractical to test.

### When 100% Is Wrong

Pursuing 100% coverage can be counterproductive:

```python
# Testing this getter adds coverage but zero value
@property
def name(self):
    return self._name

# Testing framework-generated code is wasteful
# Testing trivial constructors is wasteful
# Testing third-party library wrappers is often wasteful
```

100% coverage might mean:
- Tests are too tightly coupled to implementation
- Time was spent on trivial tests instead of meaningful ones
- Developers wrote tests to satisfy a metric, not to catch bugs

## Coverage != Quality

### The False Sense of Security

```python
# 100% coverage, zero assertions — useless tests!
def test_divide():
    divide(10, 2)  # covered but never checked

# 100% coverage, but misses edge cases
def test_sort():
    assert sort([3, 1, 2]) == [1, 2, 3]
    # What about empty list? Already sorted? Duplicates?
```

High coverage does NOT guarantee:
- Correct assertions are being made
- Edge cases are tested
- Integration between components works
- Performance requirements are met
- Security vulnerabilities are caught

### What Coverage Actually Tells You

Coverage is a **negative indicator**: low coverage reliably indicates insufficient testing. But high coverage does NOT reliably indicate sufficient testing.

Think of it as a necessary but insufficient condition for quality.

## Mutation Testing as a Complement

Mutation testing evaluates the **quality** of your tests by introducing small changes (mutations) to your code and checking if tests catch them.

```python
# Original code
def is_adult(age):
    return age >= 18

# Mutations the tool might create:
# return age > 18    (boundary mutation)
# return age <= 18   (negation mutation)
# return age >= 19   (constant mutation)
# return True        (return value mutation)

# If your tests pass with a mutation, the test suite is weak
# A "killed" mutation means your tests caught the change
```

**Mutation testing tools:**
- Python: mutmut, cosmic-ray
- JavaScript: Stryker
- Java: PIT (pitest)
- C#: Stryker.NET

## Configuring Coverage Thresholds

### Python — pytest-cov

```python
# pytest.ini or pyproject.toml
# [tool.pytest.ini_options]
# addopts = "--cov=src --cov-fail-under=80"

# .coveragerc
# [report]
# fail_under = 80
# exclude_lines =
#     pragma: no cover
#     def __repr__
#     raise NotImplementedError
```

### JavaScript — Jest

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
  ],
};
```

### Java — JaCoCo

```java
// pom.xml — enforce minimum coverage
// <execution>
//   <id>check</id>
//   <goals><goal>check</goal></goals>
//   <configuration>
//     <rules>
//       <rule>
//         <element>BUNDLE</element>
//         <limits>
//           <limit>
//             <counter>LINE</counter>
//             <value>COVEREDRATIO</value>
//             <minimum>0.80</minimum>
//           </limit>
//           <limit>
//             <counter>BRANCH</counter>
//             <value>COVEREDRATIO</value>
//             <minimum>0.75</minimum>
//           </limit>
//         </limits>
//       </rule>
//     </rules>
//   </configuration>
// </execution>
```

### C# — Coverlet

```csharp
// Run with threshold enforcement:
// dotnet test /p:CollectCoverage=true \
//   /p:CoverletOutputFormat=lcov \
//   /p:Threshold=80 \
//   /p:ThresholdType=line \
//   /p:ThresholdStat=total

// Exclude from coverage using attributes:
[System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
public class GeneratedCode
{
    // This class won't count toward coverage
}
```

## Best Practices

1. **Track trends, not absolutes** — coverage going down signals a problem
2. **Enforce minimums in CI** — prevent coverage from dropping below a threshold
3. **Exclude generated code** — auto-generated files skew metrics
4. **Focus on critical paths** — business logic deserves higher coverage than glue code
5. **Combine with mutation testing** — coverage quantity + mutation quality = confidence
6. **Review uncovered lines** — ask "is this a risk?" not "how do I cover this?"

## Summary

Code coverage is a useful metric when understood properly:
- It tells you what's NOT tested (low coverage = risk)
- It does NOT tell you if tests are good (high coverage ≠ quality)
- Use it as one signal among many (mutation score, code review, integration tests)
- Set reasonable thresholds (80% line coverage is a common target)
- Never chase 100% — invest testing effort where it provides the most value
