---
title: What is Unit Testing?
---

# What is Unit Testing?

Unit testing is a software testing technique where individual components of a program are tested in isolation to verify they work correctly. It forms the foundation of the testing pyramid and is the first line of defense against bugs.

## What is a "Unit"?

A **unit** is the smallest testable piece of code in your application. Depending on the language and paradigm, a unit can be:

- A **function** or **method**
- A **class** (in object-oriented languages)
- A **module** or **component**

The key characteristic is that a unit should have a single, well-defined responsibility. When testing a unit, you isolate it from its dependencies to ensure you're testing only that specific piece of logic.

## Why Unit Test?

| Benefit | Description |
|---------|-------------|
| **Early bug detection** | Catch issues before they reach production |
| **Documentation** | Tests describe expected behavior |
| **Refactoring confidence** | Change code knowing tests will catch regressions |
| **Design feedback** | Hard-to-test code often indicates poor design |
| **Faster debugging** | Pinpoint exactly which unit failed |
| **Reduced cost** | Bugs found early are cheaper to fix |

## The Testing Pyramid

```
        /  E2E  \          ← Few, slow, expensive
       /----------\
      / Integration \      ← Some, moderate speed
     /----------------\
    /   Unit Tests     \   ← Many, fast, cheap
   /____________________\
```

Unit tests form the base because they are:
- **Fast** — execute in milliseconds
- **Isolated** — no database, network, or filesystem needed
- **Deterministic** — same input always produces same output
- **Numerous** — you should have hundreds or thousands of them

## Testing Frameworks Overview

| Language | Framework | Test Runner | Assertion Style |
|----------|-----------|-------------|-----------------|
| Python | pytest | pytest CLI | `assert` keyword |
| JavaScript | Jest | jest CLI | `expect().toBe()` |
| Java | JUnit 5 | Maven/Gradle | `assertEquals()` |
| C# | xUnit | dotnet test | `Assert.Equal()` |

## Setting Up Your Testing Environment

### Python — pytest

```python
# Install pytest
# pip install pytest

# Project structure:
# my_project/
# ├── src/
# │   └── calculator.py
# ├── tests/
# │   └── test_calculator.py
# └── pytest.ini

# pytest.ini
# [pytest]
# testpaths = tests
# python_files = test_*.py
# python_functions = test_*

# Verify installation
# pytest --version
```

### JavaScript — Jest

```javascript
// Install Jest
// npm install --save-dev jest

// package.json
// {
//   "scripts": {
//     "test": "jest"
//   },
//   "devDependencies": {
//     "jest": "^29.0.0"
//   }
// }

// Project structure:
// my_project/
// ├── src/
// │   └── calculator.js
// ├── __tests__/
// │   └── calculator.test.js
// └── package.json

// Verify installation
// npx jest --version
```

### Java — JUnit 5

```java
// Maven dependency (pom.xml):
// <dependency>
//     <groupId>org.junit.jupiter</groupId>
//     <artifactId>junit-jupiter</artifactId>
//     <version>5.10.0</version>
//     <scope>test</scope>
// </dependency>

// Project structure:
// my_project/
// ├── src/
// │   └── main/java/com/example/Calculator.java
// ├── src/
// │   └── test/java/com/example/CalculatorTest.java
// └── pom.xml

// Gradle dependency (build.gradle):
// testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
```

### C# — xUnit

```csharp
// Create test project
// dotnet new xunit -n MyProject.Tests

// Or add to existing project:
// dotnet add package xunit
// dotnet add package xunit.runner.visualstudio
// dotnet add package Microsoft.NET.Test.Sdk

// Project structure:
// MyProject/
// ├── src/
// │   └── MyProject/
// │       └── Calculator.cs
// └── tests/
//     └── MyProject.Tests/
//         └── CalculatorTests.cs
```

## Your First Unit Test

Let's test a simple `add` function that takes two numbers and returns their sum.

### The Code Under Test

#### Python

```python
# src/math_utils.py

def add(a, b):
    """Add two numbers and return the result."""
    return a + b
```

#### JavaScript

```javascript
// src/mathUtils.js

function add(a, b) {
  return a + b;
}

module.exports = { add };
```

#### Java

```java
// src/main/java/com/example/MathUtils.java

package com.example;

public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }
}
```

#### C#

```csharp
// src/MyProject/MathUtils.cs

namespace MyProject;

public static class MathUtils
{
    public static int Add(int a, int b)
    {
        return a + b;
    }
}
```

### The Test

#### Python

```python
# tests/test_math_utils.py

from src.math_utils import add


def test_add_two_positive_numbers():
    result = add(2, 3)
    assert result == 5


def test_add_negative_numbers():
    result = add(-1, -1)
    assert result == -2


def test_add_zero():
    result = add(5, 0)
    assert result == 5


def test_add_positive_and_negative():
    result = add(10, -3)
    assert result == 7
```

#### JavaScript

```javascript
// __tests__/mathUtils.test.js

const { add } = require("../src/mathUtils");

describe("add", () => {
  test("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  test("adds negative numbers", () => {
    expect(add(-1, -1)).toBe(-2);
  });

  test("adds zero", () => {
    expect(add(5, 0)).toBe(5);
  });

  test("adds positive and negative", () => {
    expect(add(10, -3)).toBe(7);
  });
});
```

#### Java

```java
// src/test/java/com/example/MathUtilsTest.java

package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.assertEquals;

class MathUtilsTest {

    @Test
    @DisplayName("adds two positive numbers")
    void testAddTwoPositiveNumbers() {
        int result = MathUtils.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    @DisplayName("adds negative numbers")
    void testAddNegativeNumbers() {
        int result = MathUtils.add(-1, -1);
        assertEquals(-2, result);
    }

    @Test
    @DisplayName("adds zero")
    void testAddZero() {
        int result = MathUtils.add(5, 0);
        assertEquals(5, result);
    }

    @Test
    @DisplayName("adds positive and negative")
    void testAddPositiveAndNegative() {
        int result = MathUtils.add(10, -3);
        assertEquals(7, result);
    }
}
```

#### C#

```csharp
// tests/MyProject.Tests/MathUtilsTests.cs

using Xunit;
using MyProject;

namespace MyProject.Tests;

public class MathUtilsTests
{
    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        int result = MathUtils.Add(2, 3);
        Assert.Equal(5, result);
    }

    [Fact]
    public void Add_NegativeNumbers_ReturnsSum()
    {
        int result = MathUtils.Add(-1, -1);
        Assert.Equal(-2, result);
    }

    [Fact]
    public void Add_Zero_ReturnsSameNumber()
    {
        int result = MathUtils.Add(5, 0);
        Assert.Equal(5, result);
    }

    [Fact]
    public void Add_PositiveAndNegative_ReturnsSum()
    {
        int result = MathUtils.Add(10, -3);
        Assert.Equal(7, result);
    }
}
```

## Running Tests from the CLI

### Python

```python
# Run all tests
# pytest

# Run with verbose output
# pytest -v

# Run a specific test file
# pytest tests/test_math_utils.py

# Run a specific test function
# pytest tests/test_math_utils.py::test_add_two_positive_numbers

# Run with coverage
# pip install pytest-cov
# pytest --cov=src
```

### JavaScript

```javascript
// Run all tests
// npx jest

// Run with verbose output
// npx jest --verbose

// Run a specific test file
// npx jest __tests__/mathUtils.test.js

// Run tests matching a pattern
// npx jest --testNamePattern="adds two positive"

// Run with coverage
// npx jest --coverage

// Watch mode (re-run on file changes)
// npx jest --watch
```

### Java

```java
// Maven
// mvn test

// Run a specific test class
// mvn test -Dtest=MathUtilsTest

// Run a specific test method
// mvn test -Dtest=MathUtilsTest#testAddTwoPositiveNumbers

// Gradle
// gradle test

// Run with verbose output
// gradle test --info
```

### C#

```csharp
// Run all tests
// dotnet test

// Run with verbose output
// dotnet test --verbosity detailed

// Run a specific test class
// dotnet test --filter "FullyQualifiedName~MathUtilsTests"

// Run a specific test method
// dotnet test --filter "Add_TwoPositiveNumbers_ReturnsSum"

// Run with coverage
// dotnet test --collect:"XPlat Code Coverage"
```

## Anatomy of a Unit Test (AAA Pattern)

Every unit test follows the **Arrange-Act-Assert** pattern:

```python
def test_example():
    # Arrange — set up the test data and conditions
    a = 5
    b = 3
    expected = 8

    # Act — call the function under test
    result = add(a, b)

    # Assert — verify the result
    assert result == expected
```

```javascript
test("example", () => {
  // Arrange
  const a = 5;
  const b = 3;
  const expected = 8;

  // Act
  const result = add(a, b);

  // Assert
  expect(result).toBe(expected);
});
```

```java
@Test
void testExample() {
    // Arrange
    int a = 5;
    int b = 3;
    int expected = 8;

    // Act
    int result = MathUtils.add(a, b);

    // Assert
    assertEquals(expected, result);
}
```

```csharp
[Fact]
public void Example()
{
    // Arrange
    int a = 5;
    int b = 3;
    int expected = 8;

    // Act
    int result = MathUtils.Add(a, b);

    // Assert
    Assert.Equal(expected, result);
}
```

## Key Principles of Good Unit Tests

1. **Fast** — Each test should run in milliseconds
2. **Independent** — Tests should not depend on each other
3. **Repeatable** — Same result every time, in any environment
4. **Self-validating** — Pass or fail, no manual interpretation
5. **Timely** — Written close in time to the production code

These principles are often remembered by the acronym **FIRST**.

## Common Mistakes to Avoid

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| Testing multiple things | Hard to identify what failed | One assertion per concept |
| Depending on external state | Tests become flaky | Use mocks/stubs |
| Testing implementation details | Tests break on refactoring | Test behavior, not internals |
| No descriptive names | Can't understand failures | Use clear, descriptive names |
| Ignoring edge cases | Bugs hide in boundaries | Test zero, null, empty, max |

## Summary

- A **unit** is the smallest testable piece of code
- Unit tests verify individual components work correctly in isolation
- The **AAA pattern** (Arrange-Act-Assert) structures every test
- Each language has a standard testing framework: pytest, Jest, JUnit 5, xUnit
- Run tests from the CLI to integrate with CI/CD pipelines
- Follow the **FIRST** principles for effective unit tests

In the next lesson, we'll build a complete Calculator class and write comprehensive unit tests for all its methods.
