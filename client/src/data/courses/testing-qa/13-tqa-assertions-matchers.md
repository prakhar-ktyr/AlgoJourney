---
title: Assertions & Matchers
---

# Assertions & Matchers

Assertions are the verification statements in your tests. They compare actual results against expected values and fail the test if there's a mismatch. Each framework provides a rich set of matchers (also called assertion methods) for different comparison needs.

## Assertion Categories

| Category | What It Checks |
|----------|---------------|
| **Equality** | Values are equal or identical |
| **Truthiness** | Values are true, false, null, or defined |
| **Exceptions** | Code throws expected errors |
| **Collections** | Arrays/lists contain expected items |
| **Numeric** | Numbers are within range or close to expected |
| **String** | Strings match patterns or contain substrings |

## Framework Comparison Table

| Assertion Type | pytest | Jest | JUnit 5 | xUnit |
|---------------|--------|------|----------|-------|
| Equal | `assert a == b` | `expect(a).toBe(b)` | `assertEquals(a, b)` | `Assert.Equal(a, b)` |
| Not equal | `assert a != b` | `expect(a).not.toBe(b)` | `assertNotEquals(a, b)` | `Assert.NotEqual(a, b)` |
| True | `assert x` | `expect(x).toBeTruthy()` | `assertTrue(x)` | `Assert.True(x)` |
| False | `assert not x` | `expect(x).toBeFalsy()` | `assertFalse(x)` | `Assert.False(x)` |
| Null | `assert x is None` | `expect(x).toBeNull()` | `assertNull(x)` | `Assert.Null(x)` |
| Not null | `assert x is not None` | `expect(x).not.toBeNull()` | `assertNotNull(x)` | `Assert.NotNull(x)` |
| Throws | `pytest.raises(E)` | `expect(fn).toThrow()` | `assertThrows(E, fn)` | `Assert.Throws<E>(fn)` |
| Contains | `assert item in list` | `expect(arr).toContain(x)` | `assertTrue(list.contains(x))` | `Assert.Contains(x, coll)` |
| Approx equal | `pytest.approx(x)` | `expect(a).toBeCloseTo(b)` | `assertEquals(a, b, delta)` | `Assert.Equal(a, b, prec)` |
| Same instance | `assert a is b` | `expect(a).toBe(b)` | `assertSame(a, b)` | `Assert.Same(a, b)` |

## Equality Assertions

Testing that two values are equal is the most common assertion.

### Python

```python
import pytest


def test_equality_basic():
    assert 42 == 42
    assert "hello" == "hello"
    assert [1, 2, 3] == [1, 2, 3]
    assert {"key": "value"} == {"key": "value"}


def test_equality_not_equal():
    assert 42 != 43
    assert "hello" != "world"
    assert [1, 2] != [1, 2, 3]


def test_identity():
    a = [1, 2, 3]
    b = a
    c = [1, 2, 3]

    assert a is b      # Same object reference
    assert a is not c  # Different objects, same value
    assert a == c      # Equal values


def test_deep_equality():
    expected = {
        "name": "Alice",
        "scores": [95, 87, 92],
        "address": {"city": "Springfield", "zip": "62701"},
    }
    actual = {
        "name": "Alice",
        "scores": [95, 87, 92],
        "address": {"city": "Springfield", "zip": "62701"},
    }
    assert actual == expected
```

### JavaScript

```javascript
describe("Equality Assertions", () => {
  test("strict equality with toBe", () => {
    expect(42).toBe(42);
    expect("hello").toBe("hello");
    expect(true).toBe(true);
  });

  test("deep equality with toEqual", () => {
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    expect({ key: "value" }).toEqual({ key: "value" });
  });

  test("not equal", () => {
    expect(42).not.toBe(43);
    expect("hello").not.toBe("world");
  });

  test("toBe vs toEqual for objects", () => {
    const a = { x: 1 };
    const b = { x: 1 };
    const c = a;

    expect(a).toBe(c);         // Same reference
    expect(a).not.toBe(b);     // Different reference
    expect(a).toEqual(b);      // Same value
  });

  test("deep equality with nested objects", () => {
    const expected = {
      name: "Alice",
      scores: [95, 87, 92],
      address: { city: "Springfield", zip: "62701" },
    };
    const actual = {
      name: "Alice",
      scores: [95, 87, 92],
      address: { city: "Springfield", zip: "62701" },
    };
    expect(actual).toEqual(expected);
  });

  test("toStrictEqual checks undefined properties", () => {
    expect({ a: 1 }).not.toStrictEqual({ a: 1, b: undefined });
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.Map;

class EqualityAssertionsTest {

    @Test
    void basicEquality() {
        assertEquals(42, 42);
        assertEquals("hello", "hello");
        assertEquals(3.14, 3.14);
    }

    @Test
    void notEqual() {
        assertNotEquals(42, 43);
        assertNotEquals("hello", "world");
    }

    @Test
    void sameReference() {
        String a = new String("hello");
        String b = a;
        String c = new String("hello");

        assertSame(a, b);        // Same reference
        assertNotSame(a, c);     // Different reference
        assertEquals(a, c);      // Equal value
    }

    @Test
    void collectionEquality() {
        List<Integer> expected = List.of(1, 2, 3);
        List<Integer> actual = List.of(1, 2, 3);
        assertEquals(expected, actual);
    }

    @Test
    void mapEquality() {
        Map<String, Integer> expected = Map.of("a", 1, "b", 2);
        Map<String, Integer> actual = Map.of("a", 1, "b", 2);
        assertEquals(expected, actual);
    }
}
```

### C#

```csharp
using Xunit;
using System.Collections.Generic;

public class EqualityAssertionsTests
{
    [Fact]
    public void BasicEquality()
    {
        Assert.Equal(42, 42);
        Assert.Equal("hello", "hello");
        Assert.Equal(3.14, 3.14);
    }

    [Fact]
    public void NotEqual()
    {
        Assert.NotEqual(42, 43);
        Assert.NotEqual("hello", "world");
    }

    [Fact]
    public void SameReference()
    {
        var a = new List<int> { 1, 2, 3 };
        var b = a;
        var c = new List<int> { 1, 2, 3 };

        Assert.Same(a, b);       // Same reference
        Assert.NotSame(a, c);    // Different reference
        Assert.Equal(a, c);      // Equal value
    }

    [Fact]
    public void CollectionEquality()
    {
        var expected = new List<int> { 1, 2, 3 };
        var actual = new List<int> { 1, 2, 3 };
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void DictionaryEquality()
    {
        var expected = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
        var actual = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
        Assert.Equal(expected, actual);
    }
}
```

## Truthiness Assertions

Testing boolean conditions, null/undefined values, and existence.

### Python

```python
def test_truthiness():
    assert True
    assert not False
    assert 1          # Truthy
    assert not 0      # Falsy
    assert "hello"    # Non-empty string is truthy
    assert not ""     # Empty string is falsy
    assert [1]        # Non-empty list is truthy
    assert not []     # Empty list is falsy


def test_none():
    value = None
    assert value is None
    assert not (value is not None)

    result = "something"
    assert result is not None
```

### JavaScript

```javascript
describe("Truthiness Assertions", () => {
  test("truthy values", () => {
    expect(true).toBeTruthy();
    expect(1).toBeTruthy();
    expect("hello").toBeTruthy();
    expect([]).toBeTruthy();      // Empty array is truthy in JS!
    expect({}).toBeTruthy();      // Empty object is truthy in JS!
  });

  test("falsy values", () => {
    expect(false).toBeFalsy();
    expect(0).toBeFalsy();
    expect("").toBeFalsy();
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
    expect(NaN).toBeFalsy();
  });

  test("null and undefined", () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect("value").toBeDefined();
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TruthinessAssertionsTest {

    @Test
    void booleanAssertions() {
        assertTrue(true);
        assertFalse(false);
        assertTrue(5 > 3);
        assertFalse(2 > 7);
    }

    @Test
    void nullAssertions() {
        String value = null;
        assertNull(value);

        String result = "something";
        assertNotNull(result);
    }

    @Test
    void conditionalAssertions() {
        int age = 25;
        assertTrue(age >= 18, "User should be an adult");
        assertFalse(age < 0, "Age should not be negative");
    }
}
```

### C#

```csharp
using Xunit;

public class TruthinessAssertionsTests
{
    [Fact]
    public void BooleanAssertions()
    {
        Assert.True(true);
        Assert.False(false);
        Assert.True(5 > 3);
        Assert.False(2 > 7);
    }

    [Fact]
    public void NullAssertions()
    {
        string? value = null;
        Assert.Null(value);

        string result = "something";
        Assert.NotNull(result);
    }

    [Fact]
    public void TypeAssertions()
    {
        object obj = "hello";
        Assert.IsType<string>(obj);
        Assert.IsNotType<int>(obj);
        Assert.IsAssignableFrom<object>(obj);
    }
}
```

## Exception Assertions

Verifying that code throws the correct exception under error conditions.

### Python

```python
import pytest


def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


def parse_age(value):
    age = int(value)
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age > 150:
        raise ValueError("Age seems unrealistic")
    return age


def test_raises_value_error():
    with pytest.raises(ValueError):
        divide(10, 0)


def test_raises_with_message():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)


def test_raises_with_context():
    with pytest.raises(ValueError) as exc_info:
        parse_age("-5")
    assert "negative" in str(exc_info.value)


def test_raises_type_error():
    with pytest.raises(TypeError):
        divide("hello", 2)


def test_does_not_raise():
    # This should NOT raise — just call it normally
    result = divide(10, 2)
    assert result == 5.0
```

### JavaScript

```javascript
describe("Exception Assertions", () => {
  function divide(a, b) {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  }

  function parseAge(value) {
    const age = parseInt(value, 10);
    if (isNaN(age)) throw new TypeError("Invalid number");
    if (age < 0) throw new RangeError("Age cannot be negative");
    if (age > 150) throw new RangeError("Age seems unrealistic");
    return age;
  }

  test("throws any error", () => {
    expect(() => divide(10, 0)).toThrow();
  });

  test("throws error with specific message", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });

  test("throws error matching regex", () => {
    expect(() => divide(10, 0)).toThrow(/divide by zero/);
  });

  test("throws specific error type", () => {
    expect(() => parseAge("abc")).toThrow(TypeError);
  });

  test("throws RangeError for negative age", () => {
    expect(() => parseAge("-5")).toThrow(RangeError);
    expect(() => parseAge("-5")).toThrow("negative");
  });

  test("async function throws", async () => {
    async function fetchData() {
      throw new Error("Network error");
    }
    await expect(fetchData()).rejects.toThrow("Network error");
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ExceptionAssertionsTest {

    double divide(double a, double b) {
        if (b == 0) throw new ArithmeticException("Cannot divide by zero");
        return a / b;
    }

    int parseAge(String value) {
        int age = Integer.parseInt(value);
        if (age < 0) throw new IllegalArgumentException("Age cannot be negative");
        if (age > 150) throw new IllegalArgumentException("Age seems unrealistic");
        return age;
    }

    @Test
    void throwsException() {
        assertThrows(ArithmeticException.class, () -> divide(10, 0));
    }

    @Test
    void throwsWithMessage() {
        ArithmeticException exception = assertThrows(
            ArithmeticException.class,
            () -> divide(10, 0)
        );
        assertEquals("Cannot divide by zero", exception.getMessage());
    }

    @Test
    void throwsIllegalArgument() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> parseAge("-5")
        );
        assertTrue(exception.getMessage().contains("negative"));
    }

    @Test
    void throwsNumberFormat() {
        assertThrows(NumberFormatException.class, () -> parseAge("abc"));
    }

    @Test
    void doesNotThrow() {
        assertDoesNotThrow(() -> divide(10, 2));
    }
}
```

### C#

```csharp
using Xunit;
using System;

public class ExceptionAssertionsTests
{
    private double Divide(double a, double b)
    {
        if (b == 0) throw new DivideByZeroException("Cannot divide by zero");
        return a / b;
    }

    private int ParseAge(string value)
    {
        int age = int.Parse(value);
        if (age < 0) throw new ArgumentException("Age cannot be negative");
        if (age > 150) throw new ArgumentException("Age seems unrealistic");
        return age;
    }

    [Fact]
    public void ThrowsException()
    {
        Assert.Throws<DivideByZeroException>(() => Divide(10, 0));
    }

    [Fact]
    public void ThrowsWithMessage()
    {
        var exception = Assert.Throws<DivideByZeroException>(
            () => Divide(10, 0)
        );
        Assert.Equal("Cannot divide by zero", exception.Message);
    }

    [Fact]
    public void ThrowsArgumentException()
    {
        var exception = Assert.Throws<ArgumentException>(
            () => ParseAge("-5")
        );
        Assert.Contains("negative", exception.Message);
    }

    [Fact]
    public void ThrowsFormatException()
    {
        Assert.Throws<FormatException>(() => ParseAge("abc"));
    }

    [Fact]
    public async void AsyncThrows()
    {
        async System.Threading.Tasks.Task FetchData()
        {
            throw new InvalidOperationException("Network error");
        }

        await Assert.ThrowsAsync<InvalidOperationException>(FetchData);
    }
}
```

## Collection Assertions

Testing arrays, lists, and other collections for contents, size, and ordering.

### Python

```python
def test_contains():
    fruits = ["apple", "banana", "cherry"]
    assert "banana" in fruits
    assert "grape" not in fruits


def test_list_length():
    items = [1, 2, 3, 4, 5]
    assert len(items) == 5


def test_empty_collection():
    assert [] == []
    assert len([]) == 0


def test_subset():
    full = {1, 2, 3, 4, 5}
    partial = {2, 3}
    assert partial.issubset(full)


def test_all_elements_satisfy():
    numbers = [2, 4, 6, 8, 10]
    assert all(n % 2 == 0 for n in numbers)


def test_any_element_satisfies():
    numbers = [1, 3, 5, 6, 7]
    assert any(n % 2 == 0 for n in numbers)


def test_sorted_order():
    items = [1, 2, 3, 4, 5]
    assert items == sorted(items)
```

### JavaScript

```javascript
describe("Collection Assertions", () => {
  test("contains element", () => {
    const fruits = ["apple", "banana", "cherry"];
    expect(fruits).toContain("banana");
    expect(fruits).not.toContain("grape");
  });

  test("array length", () => {
    const items = [1, 2, 3, 4, 5];
    expect(items).toHaveLength(5);
  });

  test("empty array", () => {
    expect([]).toHaveLength(0);
    expect([]).toEqual([]);
  });

  test("contains object in array", () => {
    const users = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    expect(users).toContainEqual({ name: "Bob", age: 25 });
  });

  test("array contains subset", () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toEqual(expect.arrayContaining([2, 4]));
  });

  test("object contains subset of properties", () => {
    const user = { name: "Alice", age: 30, email: "alice@test.com" };
    expect(user).toMatchObject({ name: "Alice", age: 30 });
  });

  test("every element satisfies condition", () => {
    const numbers = [2, 4, 6, 8];
    numbers.forEach((n) => {
      expect(n % 2).toBe(0);
    });
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.Arrays;

class CollectionAssertionsTest {

    @Test
    void containsElement() {
        List<String> fruits = List.of("apple", "banana", "cherry");
        assertTrue(fruits.contains("banana"));
        assertFalse(fruits.contains("grape"));
    }

    @Test
    void collectionSize() {
        List<Integer> items = List.of(1, 2, 3, 4, 5);
        assertEquals(5, items.size());
    }

    @Test
    void emptyCollection() {
        List<String> empty = List.of();
        assertTrue(empty.isEmpty());
        assertEquals(0, empty.size());
    }

    @Test
    void iterableEquals() {
        List<Integer> expected = List.of(1, 2, 3);
        List<Integer> actual = List.of(1, 2, 3);
        assertIterableEquals(expected, actual);
    }

    @Test
    void allMatch() {
        List<Integer> numbers = List.of(2, 4, 6, 8, 10);
        assertTrue(numbers.stream().allMatch(n -> n % 2 == 0));
    }

    @Test
    void anyMatch() {
        List<Integer> numbers = List.of(1, 3, 5, 6, 7);
        assertTrue(numbers.stream().anyMatch(n -> n % 2 == 0));
    }

    @Test
    void arrayEquals() {
        int[] expected = {1, 2, 3};
        int[] actual = {1, 2, 3};
        assertArrayEquals(expected, actual);
    }
}
```

### C#

```csharp
using Xunit;
using System.Collections.Generic;
using System.Linq;

public class CollectionAssertionsTests
{
    [Fact]
    public void ContainsElement()
    {
        var fruits = new List<string> { "apple", "banana", "cherry" };
        Assert.Contains("banana", fruits);
        Assert.DoesNotContain("grape", fruits);
    }

    [Fact]
    public void CollectionSize()
    {
        var items = new List<int> { 1, 2, 3, 4, 5 };
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public void EmptyCollection()
    {
        var empty = new List<string>();
        Assert.Empty(empty);
    }

    [Fact]
    public void NotEmptyCollection()
    {
        var items = new List<int> { 1 };
        Assert.NotEmpty(items);
    }

    [Fact]
    public void AllElementsSatisfy()
    {
        var numbers = new List<int> { 2, 4, 6, 8, 10 };
        Assert.All(numbers, n => Assert.Equal(0, n % 2));
    }

    [Fact]
    public void ContainsMatch()
    {
        var numbers = new List<int> { 1, 3, 5, 6, 7 };
        Assert.Contains(numbers, n => n % 2 == 0);
    }

    [Fact]
    public void CollectionEqual()
    {
        var expected = new List<int> { 1, 2, 3 };
        var actual = new List<int> { 1, 2, 3 };
        Assert.Equal(expected, actual);
    }

    [Fact]
    public void SingleElement()
    {
        var items = new List<int> { 42 };
        Assert.Single(items);
        Assert.Single(items, x => x == 42);
    }
}
```

## Numeric Assertions

Testing numbers for approximate equality, ranges, and comparisons.

### Python

```python
import pytest
import math


def test_approximate_equality():
    assert 0.1 + 0.2 == pytest.approx(0.3)
    assert math.pi == pytest.approx(3.14159, rel=1e-4)


def test_approx_with_tolerance():
    assert 10.0 == pytest.approx(10.5, abs=0.6)
    assert 100.0 == pytest.approx(101.0, rel=0.02)


def test_comparisons():
    assert 10 > 5
    assert 3 < 7
    assert 5 >= 5
    assert 5 <= 5


def test_numeric_range():
    value = 7
    assert 1 <= value <= 10


def test_infinity_and_nan():
    assert math.isinf(float("inf"))
    assert math.isnan(float("nan"))
    assert not math.isnan(42)
```

### JavaScript

```javascript
describe("Numeric Assertions", () => {
  test("approximate equality", () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    expect(Math.PI).toBeCloseTo(3.14159, 4);
  });

  test("greater than / less than", () => {
    expect(10).toBeGreaterThan(5);
    expect(3).toBeLessThan(7);
    expect(5).toBeGreaterThanOrEqual(5);
    expect(5).toBeLessThanOrEqual(5);
  });

  test("numeric range", () => {
    const value = 7;
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(10);
  });

  test("special numeric values", () => {
    expect(NaN).toBeNaN();
    expect(1 / 0).toBe(Infinity);
    expect(Number.isFinite(42)).toBe(true);
  });

  test("toBeCloseTo precision parameter", () => {
    // Second argument is number of decimal digits to check
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5);    // 5 decimal places
    expect(10.005).toBeCloseTo(10.006, 2);     // 2 decimal places
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class NumericAssertionsTest {

    @Test
    void approximateEquality() {
        assertEquals(0.3, 0.1 + 0.2, 0.0001);
        assertEquals(Math.PI, 3.14159, 0.001);
    }

    @Test
    void comparisons() {
        assertTrue(10 > 5);
        assertTrue(3 < 7);
        assertTrue(5 >= 5);
        assertTrue(5 <= 5);
    }

    @Test
    void numericRange() {
        int value = 7;
        assertTrue(value >= 1 && value <= 10,
            "Value should be between 1 and 10");
    }

    @Test
    void specialValues() {
        assertTrue(Double.isInfinite(Double.POSITIVE_INFINITY));
        assertTrue(Double.isNaN(Double.NaN));
        assertFalse(Double.isNaN(42));
    }

    @Test
    void deltaComparison() {
        double expected = 10.0;
        double actual = 10.0005;
        assertEquals(expected, actual, 0.001);  // Within delta
    }
}
```

### C#

```csharp
using Xunit;
using System;

public class NumericAssertionsTests
{
    [Fact]
    public void ApproximateEquality()
    {
        Assert.Equal(0.3, 0.1 + 0.2, precision: 10);
        Assert.Equal(Math.PI, 3.14159, precision: 4);
    }

    [Fact]
    public void Comparisons()
    {
        Assert.True(10 > 5);
        Assert.True(3 < 7);
        Assert.True(5 >= 5);
    }

    [Fact]
    public void InRange()
    {
        int value = 7;
        Assert.InRange(value, 1, 10);
    }

    [Fact]
    public void NotInRange()
    {
        int value = 15;
        Assert.NotInRange(value, 1, 10);
    }

    [Fact]
    public void SpecialValues()
    {
        Assert.True(double.IsInfinity(double.PositiveInfinity));
        Assert.True(double.IsNaN(double.NaN));
        Assert.False(double.IsNaN(42));
    }
}
```

## String Assertions

Testing string content, patterns, and formatting.

### Python

```python
import re


def test_string_contains():
    message = "Hello, World!"
    assert "World" in message
    assert "xyz" not in message


def test_string_starts_ends():
    filename = "report_2024.pdf"
    assert filename.startswith("report")
    assert filename.endswith(".pdf")


def test_string_regex():
    email = "user@example.com"
    pattern = r"^[\w.+-]+@[\w-]+\.[\w.-]+$"
    assert re.match(pattern, email)


def test_string_case():
    assert "HELLO".isupper()
    assert "hello".islower()


def test_string_length():
    password = "secure123"
    assert len(password) >= 8


def test_string_empty():
    assert "" == ""
    assert not ""  # Empty string is falsy
    assert "content"  # Non-empty is truthy
```

### JavaScript

```javascript
describe("String Assertions", () => {
  test("contains substring", () => {
    const message = "Hello, World!";
    expect(message).toContain("World");
    expect(message).not.toContain("xyz");
  });

  test("matches regex", () => {
    const email = "user@example.com";
    expect(email).toMatch(/^[\w.+-]+@[\w-]+\.[\w.-]+$/);
  });

  test("starts with / ends with", () => {
    const filename = "report_2024.pdf";
    expect(filename).toMatch(/^report/);
    expect(filename).toMatch(/\.pdf$/);
  });

  test("string length", () => {
    const password = "secure123";
    expect(password.length).toBeGreaterThanOrEqual(8);
  });

  test("empty string", () => {
    expect("").toBe("");
    expect("").toHaveLength(0);
    expect("").toBeFalsy();
    expect("content").toBeTruthy();
  });

  test("toMatchInlineSnapshot", () => {
    const greeting = "Hello, Alice!";
    expect(greeting).toMatchInlineSnapshot(`"Hello, Alice!"`);
  });
});
```

### Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StringAssertionsTest {

    @Test
    void containsSubstring() {
        String message = "Hello, World!";
        assertTrue(message.contains("World"));
        assertFalse(message.contains("xyz"));
    }

    @Test
    void startsWithEndsWith() {
        String filename = "report_2024.pdf";
        assertTrue(filename.startsWith("report"));
        assertTrue(filename.endsWith(".pdf"));
    }

    @Test
    void matchesRegex() {
        String email = "user@example.com";
        assertTrue(email.matches("^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$"));
    }

    @Test
    void stringLength() {
        String password = "secure123";
        assertTrue(password.length() >= 8);
    }

    @Test
    void emptyString() {
        String empty = "";
        assertTrue(empty.isEmpty());
        assertEquals(0, empty.length());

        String blank = "   ";
        assertTrue(blank.isBlank());
    }

    @Test
    void caseInsensitiveComparison() {
        assertEquals("hello", "HELLO".toLowerCase());
        assertTrue("Hello".equalsIgnoreCase("HELLO"));
    }
}
```

### C#

```csharp
using Xunit;

public class StringAssertionsTests
{
    [Fact]
    public void ContainsSubstring()
    {
        string message = "Hello, World!";
        Assert.Contains("World", message);
        Assert.DoesNotContain("xyz", message);
    }

    [Fact]
    public void StartsWithEndsWith()
    {
        string filename = "report_2024.pdf";
        Assert.StartsWith("report", filename);
        Assert.EndsWith(".pdf", filename);
    }

    [Fact]
    public void MatchesRegex()
    {
        string email = "user@example.com";
        Assert.Matches(@"^[\w.+-]+@[\w-]+\.[\w.-]+$", email);
    }

    [Fact]
    public void StringLength()
    {
        string password = "secure123";
        Assert.True(password.Length >= 8);
    }

    [Fact]
    public void EmptyString()
    {
        Assert.Equal("", string.Empty);
        Assert.True(string.IsNullOrEmpty(""));
        Assert.True(string.IsNullOrWhiteSpace("   "));
    }

    [Fact]
    public void CaseInsensitiveComparison()
    {
        Assert.Equal("hello", "HELLO", ignoreCase: true);
    }
}
```

## Custom Assertion Messages

When a test fails, a good message explains what went wrong.

### Python

```python
def test_with_message():
    age = 15
    assert age >= 18, f"Expected age >= 18, got {age}"

    items = [1, 2, 3]
    assert len(items) > 0, "List should not be empty"
```

### JavaScript

```javascript
test("custom failure messages", () => {
  const age = 15;
  expect(age).toBeGreaterThanOrEqual(18);
  // Jest shows: "expect(received).toBeGreaterThanOrEqual(expected)
  //              Expected: >= 18, Received: 15"

  // For custom messages, add a second argument to expect:
  // (available in Jest 29+)
});
```

### Java

```java
@Test
void withCustomMessage() {
    int age = 15;
    assertTrue(age >= 18,
        () -> String.format("Expected age >= 18, got %d", age));

    List<String> items = List.of();
    assertFalse(items.isEmpty(), "List should not be empty");
}
```

### C#

```csharp
[Fact]
public void WithCustomMessage()
{
    int age = 15;
    // xUnit doesn't support custom messages on all assertions
    // Use Assert.True with a message for custom checks
    Assert.True(age >= 18, $"Expected age >= 18, got {age}");
}
```

## Summary

| Category | Key Takeaway |
|----------|-------------|
| **Equality** | Use deep equality for objects/arrays, reference equality for identity |
| **Truthiness** | Know your language's truthy/falsy rules |
| **Exceptions** | Always verify both type and message of thrown errors |
| **Collections** | Test contains, size, ordering, and all/any conditions |
| **Numeric** | Use approximate equality for floating point comparisons |
| **String** | Combine contains, regex, and starts/ends-with assertions |

Choosing the right assertion makes tests more readable and produces better failure messages. Use the most specific matcher available — `toContain` is clearer than `toBeTruthy()` when checking if an array includes an element.

In the next lesson, we'll explore test doubles — mocks, stubs, and spies — to isolate units from their dependencies.
