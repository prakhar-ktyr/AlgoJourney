---
title: Writing Your First Unit Test
---

# Writing Your First Unit Test

In this lesson, we build a complete Calculator class and write thorough unit tests for every method. You'll learn test naming conventions, organization patterns, and how to handle edge cases like division by zero.

## The Calculator Class

Our Calculator supports four operations: add, subtract, multiply, and divide.

### Python

```python
# src/calculator.py

class Calculator:
    """A simple calculator with basic arithmetic operations."""

    def add(self, a, b):
        """Return the sum of a and b."""
        return a + b

    def subtract(self, a, b):
        """Return the difference of a and b."""
        return a - b

    def multiply(self, a, b):
        """Return the product of a and b."""
        return a * b

    def divide(self, a, b):
        """Return the quotient of a divided by b.

        Raises:
            ValueError: If b is zero.
        """
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
```

### JavaScript

```javascript
// src/calculator.js

class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }
}

module.exports = Calculator;
```

### Java

```java
// src/main/java/com/example/Calculator.java

package com.example;

public class Calculator {

    public double add(double a, double b) {
        return a + b;
    }

    public double subtract(double a, double b) {
        return a - b;
    }

    public double multiply(double a, double b) {
        return a * b;
    }

    public double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }
}
```

### C#

```csharp
// src/MyProject/Calculator.cs

namespace MyProject;

public class Calculator
{
    public double Add(double a, double b)
    {
        return a + b;
    }

    public double Subtract(double a, double b)
    {
        return a - b;
    }

    public double Multiply(double a, double b)
    {
        return a * b;
    }

    public double Divide(double a, double b)
    {
        if (b == 0)
        {
            throw new DivideByZeroException("Cannot divide by zero");
        }
        return a / b;
    }
}
```

## Test Naming Conventions

Good test names tell you exactly what failed without reading the test body.

| Framework | Convention | Example |
|-----------|-----------|---------|
| pytest | `test_<method>_<scenario>_<expected>` | `test_add_positive_numbers_returns_sum` |
| Jest | Descriptive string in `test()` | `"adds two positive numbers correctly"` |
| JUnit 5 | `<method>_<scenario>_<expected>` or `@DisplayName` | `add_positiveNumbers_returnsSum` |
| xUnit | `<Method>_<Scenario>_<Expected>` | `Add_PositiveNumbers_ReturnsSum` |

## Complete Test Suite

### Python — pytest

```python
# tests/test_calculator.py

import pytest
from src.calculator import Calculator


@pytest.fixture
def calc():
    """Create a Calculator instance for each test."""
    return Calculator()


# --- Addition Tests ---

class TestAdd:
    def test_add_two_positive_numbers(self, calc):
        assert calc.add(2, 3) == 5

    def test_add_two_negative_numbers(self, calc):
        assert calc.add(-2, -3) == -5

    def test_add_positive_and_negative(self, calc):
        assert calc.add(5, -3) == 2

    def test_add_zeros(self, calc):
        assert calc.add(0, 0) == 0

    def test_add_floating_point(self, calc):
        result = calc.add(0.1, 0.2)
        assert result == pytest.approx(0.3)

    def test_add_large_numbers(self, calc):
        assert calc.add(1_000_000, 2_000_000) == 3_000_000


# --- Subtraction Tests ---

class TestSubtract:
    def test_subtract_larger_from_smaller(self, calc):
        assert calc.subtract(2, 5) == -3

    def test_subtract_equal_numbers(self, calc):
        assert calc.subtract(5, 5) == 0

    def test_subtract_negative_numbers(self, calc):
        assert calc.subtract(-3, -2) == -1

    def test_subtract_from_zero(self, calc):
        assert calc.subtract(0, 5) == -5

    def test_subtract_zero(self, calc):
        assert calc.subtract(10, 0) == 10

    def test_subtract_floating_point(self, calc):
        result = calc.subtract(0.3, 0.1)
        assert result == pytest.approx(0.2)


# --- Multiplication Tests ---

class TestMultiply:
    def test_multiply_positive_numbers(self, calc):
        assert calc.multiply(3, 4) == 12

    def test_multiply_by_zero(self, calc):
        assert calc.multiply(5, 0) == 0

    def test_multiply_by_one(self, calc):
        assert calc.multiply(7, 1) == 7

    def test_multiply_negative_numbers(self, calc):
        assert calc.multiply(-3, -4) == 12

    def test_multiply_positive_and_negative(self, calc):
        assert calc.multiply(3, -4) == -12

    def test_multiply_floating_point(self, calc):
        result = calc.multiply(0.1, 0.2)
        assert result == pytest.approx(0.02)


# --- Division Tests ---

class TestDivide:
    def test_divide_evenly(self, calc):
        assert calc.divide(10, 2) == 5.0

    def test_divide_with_remainder(self, calc):
        result = calc.divide(7, 2)
        assert result == pytest.approx(3.5)

    def test_divide_negative_numbers(self, calc):
        assert calc.divide(-10, -2) == 5.0

    def test_divide_positive_by_negative(self, calc):
        assert calc.divide(10, -2) == -5.0

    def test_divide_zero_by_number(self, calc):
        assert calc.divide(0, 5) == 0.0

    def test_divide_by_zero_raises_error(self, calc):
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calc.divide(10, 0)

    def test_divide_zero_by_zero_raises_error(self, calc):
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calc.divide(0, 0)
```

### JavaScript — Jest

```javascript
// __tests__/calculator.test.js

const Calculator = require("../src/calculator");

describe("Calculator", () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  // --- Addition Tests ---

  describe("add", () => {
    test("adds two positive numbers", () => {
      expect(calc.add(2, 3)).toBe(5);
    });

    test("adds two negative numbers", () => {
      expect(calc.add(-2, -3)).toBe(-5);
    });

    test("adds positive and negative number", () => {
      expect(calc.add(5, -3)).toBe(2);
    });

    test("adds zeros", () => {
      expect(calc.add(0, 0)).toBe(0);
    });

    test("adds floating point numbers", () => {
      expect(calc.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    test("adds large numbers", () => {
      expect(calc.add(1_000_000, 2_000_000)).toBe(3_000_000);
    });
  });

  // --- Subtraction Tests ---

  describe("subtract", () => {
    test("subtracts larger from smaller gives negative", () => {
      expect(calc.subtract(2, 5)).toBe(-3);
    });

    test("subtracts equal numbers gives zero", () => {
      expect(calc.subtract(5, 5)).toBe(0);
    });

    test("subtracts negative numbers", () => {
      expect(calc.subtract(-3, -2)).toBe(-1);
    });

    test("subtracts from zero", () => {
      expect(calc.subtract(0, 5)).toBe(-5);
    });

    test("subtracts zero", () => {
      expect(calc.subtract(10, 0)).toBe(10);
    });

    test("subtracts floating point numbers", () => {
      expect(calc.subtract(0.3, 0.1)).toBeCloseTo(0.2);
    });
  });

  // --- Multiplication Tests ---

  describe("multiply", () => {
    test("multiplies positive numbers", () => {
      expect(calc.multiply(3, 4)).toBe(12);
    });

    test("multiplies by zero gives zero", () => {
      expect(calc.multiply(5, 0)).toBe(0);
    });

    test("multiplies by one gives same number", () => {
      expect(calc.multiply(7, 1)).toBe(7);
    });

    test("multiplies two negatives gives positive", () => {
      expect(calc.multiply(-3, -4)).toBe(12);
    });

    test("multiplies positive and negative gives negative", () => {
      expect(calc.multiply(3, -4)).toBe(-12);
    });

    test("multiplies floating point numbers", () => {
      expect(calc.multiply(0.1, 0.2)).toBeCloseTo(0.02);
    });
  });

  // --- Division Tests ---

  describe("divide", () => {
    test("divides evenly", () => {
      expect(calc.divide(10, 2)).toBe(5);
    });

    test("divides with remainder", () => {
      expect(calc.divide(7, 2)).toBe(3.5);
    });

    test("divides two negatives gives positive", () => {
      expect(calc.divide(-10, -2)).toBe(5);
    });

    test("divides positive by negative gives negative", () => {
      expect(calc.divide(10, -2)).toBe(-5);
    });

    test("divides zero by number gives zero", () => {
      expect(calc.divide(0, 5)).toBe(0);
    });

    test("throws error when dividing by zero", () => {
      expect(() => calc.divide(10, 0)).toThrow("Cannot divide by zero");
    });

    test("throws error when dividing zero by zero", () => {
      expect(() => calc.divide(0, 0)).toThrow("Cannot divide by zero");
    });
  });
});
```

### Java — JUnit 5

```java
// src/test/java/com/example/CalculatorTest.java

package com.example;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();
    }

    // --- Addition Tests ---

    @Nested
    @DisplayName("add")
    class AddTests {

        @Test
        @DisplayName("adds two positive numbers")
        void add_positiveNumbers_returnsSum() {
            assertEquals(5.0, calc.add(2, 3));
        }

        @Test
        @DisplayName("adds two negative numbers")
        void add_negativeNumbers_returnsSum() {
            assertEquals(-5.0, calc.add(-2, -3));
        }

        @Test
        @DisplayName("adds positive and negative number")
        void add_positiveAndNegative_returnsSum() {
            assertEquals(2.0, calc.add(5, -3));
        }

        @Test
        @DisplayName("adds zeros")
        void add_zeros_returnsZero() {
            assertEquals(0.0, calc.add(0, 0));
        }

        @Test
        @DisplayName("adds floating point numbers")
        void add_floatingPoint_returnsApproximate() {
            assertEquals(0.3, calc.add(0.1, 0.2), 0.0001);
        }

        @Test
        @DisplayName("adds large numbers")
        void add_largeNumbers_returnsSum() {
            assertEquals(3_000_000.0, calc.add(1_000_000, 2_000_000));
        }
    }

    // --- Subtraction Tests ---

    @Nested
    @DisplayName("subtract")
    class SubtractTests {

        @Test
        @DisplayName("subtracts larger from smaller gives negative")
        void subtract_largerFromSmaller_returnsNegative() {
            assertEquals(-3.0, calc.subtract(2, 5));
        }

        @Test
        @DisplayName("subtracts equal numbers gives zero")
        void subtract_equalNumbers_returnsZero() {
            assertEquals(0.0, calc.subtract(5, 5));
        }

        @Test
        @DisplayName("subtracts negative numbers")
        void subtract_negativeNumbers_returnsDifference() {
            assertEquals(-1.0, calc.subtract(-3, -2));
        }

        @Test
        @DisplayName("subtracts from zero")
        void subtract_fromZero_returnsNegative() {
            assertEquals(-5.0, calc.subtract(0, 5));
        }

        @Test
        @DisplayName("subtracts zero gives same number")
        void subtract_zero_returnsSameNumber() {
            assertEquals(10.0, calc.subtract(10, 0));
        }
    }

    // --- Multiplication Tests ---

    @Nested
    @DisplayName("multiply")
    class MultiplyTests {

        @Test
        @DisplayName("multiplies positive numbers")
        void multiply_positiveNumbers_returnsProduct() {
            assertEquals(12.0, calc.multiply(3, 4));
        }

        @Test
        @DisplayName("multiplies by zero gives zero")
        void multiply_byZero_returnsZero() {
            assertEquals(0.0, calc.multiply(5, 0));
        }

        @Test
        @DisplayName("multiplies by one gives same number")
        void multiply_byOne_returnsSameNumber() {
            assertEquals(7.0, calc.multiply(7, 1));
        }

        @Test
        @DisplayName("multiplies two negatives gives positive")
        void multiply_twoNegatives_returnsPositive() {
            assertEquals(12.0, calc.multiply(-3, -4));
        }

        @Test
        @DisplayName("multiplies positive and negative gives negative")
        void multiply_positiveAndNegative_returnsNegative() {
            assertEquals(-12.0, calc.multiply(3, -4));
        }
    }

    // --- Division Tests ---

    @Nested
    @DisplayName("divide")
    class DivideTests {

        @Test
        @DisplayName("divides evenly")
        void divide_evenly_returnsQuotient() {
            assertEquals(5.0, calc.divide(10, 2));
        }

        @Test
        @DisplayName("divides with remainder")
        void divide_withRemainder_returnsDecimal() {
            assertEquals(3.5, calc.divide(7, 2));
        }

        @Test
        @DisplayName("divides two negatives gives positive")
        void divide_twoNegatives_returnsPositive() {
            assertEquals(5.0, calc.divide(-10, -2));
        }

        @Test
        @DisplayName("divides positive by negative gives negative")
        void divide_positiveByNegative_returnsNegative() {
            assertEquals(-5.0, calc.divide(10, -2));
        }

        @Test
        @DisplayName("divides zero by number gives zero")
        void divide_zeroByNumber_returnsZero() {
            assertEquals(0.0, calc.divide(0, 5));
        }

        @Test
        @DisplayName("throws when dividing by zero")
        void divide_byZero_throwsException() {
            ArithmeticException exception = assertThrows(
                ArithmeticException.class,
                () -> calc.divide(10, 0)
            );
            assertEquals("Cannot divide by zero", exception.getMessage());
        }

        @Test
        @DisplayName("throws when dividing zero by zero")
        void divide_zeroByZero_throwsException() {
            assertThrows(
                ArithmeticException.class,
                () -> calc.divide(0, 0)
            );
        }
    }
}
```

### C# — xUnit

```csharp
// tests/MyProject.Tests/CalculatorTests.cs

using Xunit;
using MyProject;

namespace MyProject.Tests;

public class CalculatorTests
{
    private readonly Calculator _calc = new();

    // --- Addition Tests ---

    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        Assert.Equal(5.0, _calc.Add(2, 3));
    }

    [Fact]
    public void Add_TwoNegativeNumbers_ReturnsSum()
    {
        Assert.Equal(-5.0, _calc.Add(-2, -3));
    }

    [Fact]
    public void Add_PositiveAndNegative_ReturnsSum()
    {
        Assert.Equal(2.0, _calc.Add(5, -3));
    }

    [Fact]
    public void Add_Zeros_ReturnsZero()
    {
        Assert.Equal(0.0, _calc.Add(0, 0));
    }

    [Fact]
    public void Add_FloatingPoint_ReturnsApproximate()
    {
        Assert.Equal(0.3, _calc.Add(0.1, 0.2), precision: 4);
    }

    [Fact]
    public void Add_LargeNumbers_ReturnsSum()
    {
        Assert.Equal(3_000_000.0, _calc.Add(1_000_000, 2_000_000));
    }

    // --- Subtraction Tests ---

    [Fact]
    public void Subtract_LargerFromSmaller_ReturnsNegative()
    {
        Assert.Equal(-3.0, _calc.Subtract(2, 5));
    }

    [Fact]
    public void Subtract_EqualNumbers_ReturnsZero()
    {
        Assert.Equal(0.0, _calc.Subtract(5, 5));
    }

    [Fact]
    public void Subtract_NegativeNumbers_ReturnsDifference()
    {
        Assert.Equal(-1.0, _calc.Subtract(-3, -2));
    }

    [Fact]
    public void Subtract_FromZero_ReturnsNegative()
    {
        Assert.Equal(-5.0, _calc.Subtract(0, 5));
    }

    [Fact]
    public void Subtract_Zero_ReturnsSameNumber()
    {
        Assert.Equal(10.0, _calc.Subtract(10, 0));
    }

    // --- Multiplication Tests ---

    [Fact]
    public void Multiply_PositiveNumbers_ReturnsProduct()
    {
        Assert.Equal(12.0, _calc.Multiply(3, 4));
    }

    [Fact]
    public void Multiply_ByZero_ReturnsZero()
    {
        Assert.Equal(0.0, _calc.Multiply(5, 0));
    }

    [Fact]
    public void Multiply_ByOne_ReturnsSameNumber()
    {
        Assert.Equal(7.0, _calc.Multiply(7, 1));
    }

    [Fact]
    public void Multiply_TwoNegatives_ReturnsPositive()
    {
        Assert.Equal(12.0, _calc.Multiply(-3, -4));
    }

    [Fact]
    public void Multiply_PositiveAndNegative_ReturnsNegative()
    {
        Assert.Equal(-12.0, _calc.Multiply(3, -4));
    }

    // --- Division Tests ---

    [Fact]
    public void Divide_Evenly_ReturnsQuotient()
    {
        Assert.Equal(5.0, _calc.Divide(10, 2));
    }

    [Fact]
    public void Divide_WithRemainder_ReturnsDecimal()
    {
        Assert.Equal(3.5, _calc.Divide(7, 2));
    }

    [Fact]
    public void Divide_TwoNegatives_ReturnsPositive()
    {
        Assert.Equal(5.0, _calc.Divide(-10, -2));
    }

    [Fact]
    public void Divide_PositiveByNegative_ReturnsNegative()
    {
        Assert.Equal(-5.0, _calc.Divide(10, -2));
    }

    [Fact]
    public void Divide_ZeroByNumber_ReturnsZero()
    {
        Assert.Equal(0.0, _calc.Divide(0, 5));
    }

    [Fact]
    public void Divide_ByZero_ThrowsException()
    {
        var exception = Assert.Throws<DivideByZeroException>(
            () => _calc.Divide(10, 0)
        );
        Assert.Equal("Cannot divide by zero", exception.Message);
    }

    [Fact]
    public void Divide_ZeroByZero_ThrowsException()
    {
        Assert.Throws<DivideByZeroException>(
            () => _calc.Divide(0, 0)
        );
    }
}
```

## Test Organization Patterns

### Grouping by Method

Organize tests by the method they target. This makes it easy to find all tests for a specific behavior.

| Framework | Grouping Mechanism |
|-----------|-------------------|
| pytest | Classes (`TestAdd`, `TestSubtract`) |
| Jest | `describe()` blocks |
| JUnit 5 | `@Nested` classes |
| xUnit | Regions or separate files |

### File Naming

| Framework | Convention |
|-----------|-----------|
| pytest | `test_<module>.py` |
| Jest | `<module>.test.js` or `<module>.spec.js` |
| JUnit 5 | `<Class>Test.java` |
| xUnit | `<Class>Tests.cs` |

## Edge Cases to Always Test

When testing any method, consider these edge cases:

| Category | Examples |
|----------|----------|
| **Zero** | 0 as input, result is 0 |
| **Negative** | Negative inputs, negative results |
| **Boundaries** | Min/max values, overflow |
| **Identity** | Adding 0, multiplying by 1 |
| **Inverse** | Operations that cancel out |
| **Errors** | Invalid input, division by zero |
| **Floating point** | Precision issues (0.1 + 0.2) |
| **Large values** | Performance with big numbers |

## Summary

- Build the class under test first, then write tests for each method
- Follow the **AAA pattern**: Arrange, Act, Assert
- Use **descriptive names** that explain what is being tested
- Group tests by method using language-specific mechanisms
- Always test **edge cases**: zero, negative, boundaries, errors
- Test **one behavior per test** for clear failure messages
- Use **fixtures/setup methods** to avoid repetition

Next, we'll explore the full range of assertions and matchers available in each framework.
