---
title: Testing OOP Code
---

# Testing OOP Code

Testing is essential for reliable software. OOP introduces specific testing techniques: testing classes in isolation, mocking dependencies, and testing inheritance hierarchies.

---

## Unit Testing Basics

A **unit test** verifies that a single class or method works correctly in isolation.

```cpp
// Using Google Test (gtest) framework
#include <gtest/gtest.h>
#include <stdexcept>

class Calculator {
public:
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw std::invalid_argument("Division by zero");
        return a / b;
    }
};

TEST(CalculatorTest, Add) {
    Calculator calc;
    EXPECT_EQ(calc.add(2, 3), 5);
    EXPECT_EQ(calc.add(-1, 1), 0);
    EXPECT_EQ(calc.add(-2, -3), -5);
}

TEST(CalculatorTest, Divide) {
    Calculator calc;
    EXPECT_EQ(calc.divide(10, 2), 5);
}

TEST(CalculatorTest, DivideByZero) {
    Calculator calc;
    EXPECT_THROW(calc.divide(10, 0), std::invalid_argument);
}
```

```csharp
using Xunit;
using System;

public class Calculator
{
    public int Add(int a, int b) => a + b;
    public int Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("Division by zero");
        return a / b;
    }
}

public class CalculatorTests
{
    private readonly Calculator _calc = new();

    [Fact]
    public void Add_ReturnsCorrectSum()
    {
        Assert.Equal(5, _calc.Add(2, 3));
        Assert.Equal(0, _calc.Add(-1, 1));
        Assert.Equal(-5, _calc.Add(-2, -3));
    }

    [Fact]
    public void Divide_ReturnsCorrectQuotient()
    {
        Assert.Equal(5, _calc.Divide(10, 2));
    }

    [Fact]
    public void Divide_ByZero_ThrowsException()
    {
        Assert.Throws<DivideByZeroException>(() => _calc.Divide(10, 0));
    }
}
```

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Calculator {
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Division by zero");
        return a / b;
    }
}

class CalculatorTest {
    Calculator calc = new Calculator();

    @Test
    void testAdd() {
        assertEquals(5, calc.add(2, 3));
        assertEquals(0, calc.add(-1, 1));
        assertEquals(-5, calc.add(-2, -3));
    }

    @Test
    void testDivide() {
        assertEquals(5, calc.divide(10, 2));
    }

    @Test
    void testDivideByZero() {
        assertThrows(ArithmeticException.class,
            () -> calc.divide(10, 0));
    }
}
```

```python
import pytest

class Calculator:
    def add(self, a, b):
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Division by zero")
        return a / b

class TestCalculator:
    def setup_method(self):
        self.calc = Calculator()

    def test_add(self):
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0

    def test_divide(self):
        assert self.calc.divide(10, 2) == 5

    def test_divide_by_zero(self):
        with pytest.raises(ValueError):
            self.calc.divide(10, 0)
```

```javascript
// Using Jest framework
class Calculator {
  add(a, b) { return a + b; }
  divide(a, b) {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

describe("Calculator", () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  test("add", () => {
    expect(calc.add(2, 3)).toBe(5);
    expect(calc.add(-1, 1)).toBe(0);
    expect(calc.add(-2, -3)).toBe(-5);
  });

  test("divide", () => {
    expect(calc.divide(10, 2)).toBe(5);
  });

  test("divide by zero throws", () => {
    expect(() => calc.divide(10, 0)).toThrow("Division by zero");
  });
});
```

---

## Testing Classes with Dependencies

When a class depends on another class (database, email, etc.), you test it using **mocks**:

### The Problem

```
OrderService depends on Database and EmailSender.
How to test without a real database and email server?
```

### The Solution: Mock Objects

```cpp
// Using interfaces and manual mocks
#include <gtest/gtest.h>
#include <vector>
#include <string>

struct Order {
    std::string item;
    std::string email;
};

class IDatabase {
public:
    virtual void save(const Order& order) = 0;
    virtual ~IDatabase() = default;
};

class IEmailSender {
public:
    virtual void send(const std::string& msg, const std::string& to) = 0;
    virtual ~IEmailSender() = default;
};

class OrderService {
    IDatabase& db;
    IEmailSender& email;
public:
    OrderService(IDatabase& db, IEmailSender& email) : db(db), email(email) {}
    void placeOrder(const Order& order) {
        db.save(order);
        email.send("Order confirmed", order.email);
    }
};

// Mock implementations
class MockDatabase : public IDatabase {
public:
    std::vector<Order> saved;
    void save(const Order& order) override { saved.push_back(order); }
};

class MockEmailSender : public IEmailSender {
public:
    std::vector<std::string> sentTo;
    void send(const std::string& msg, const std::string& to) override {
        sentTo.push_back(to);
    }
};

TEST(OrderServiceTest, PlaceOrder) {
    MockDatabase mockDb;
    MockEmailSender mockEmail;
    OrderService service(mockDb, mockEmail);

    Order order{"Laptop", "alice@example.com"};
    service.placeOrder(order);

    EXPECT_EQ(mockDb.saved.size(), 1);
    EXPECT_EQ(mockDb.saved[0].item, "Laptop");
    EXPECT_EQ(mockEmail.sentTo.size(), 1);
}
```

```csharp
using Xunit;
using Moq;
using System.Collections.Generic;

public record Order(string Item, string Email);

public interface IDatabase
{
    void Save(Order order);
}

public interface IEmailSender
{
    void Send(string message, string to);
}

public class OrderService
{
    private readonly IDatabase _db;
    private readonly IEmailSender _email;

    public OrderService(IDatabase db, IEmailSender email)
    {
        _db = db;
        _email = email;
    }

    public void PlaceOrder(Order order)
    {
        _db.Save(order);
        _email.Send("Order confirmed", order.Email);
    }
}

public class OrderServiceTests
{
    [Fact]
    public void PlaceOrder_SavesAndSendsEmail()
    {
        var mockDb = new Mock<IDatabase>();
        var mockEmail = new Mock<IEmailSender>();
        var service = new OrderService(mockDb.Object, mockEmail.Object);

        var order = new Order("Laptop", "alice@example.com");
        service.PlaceOrder(order);

        mockDb.Verify(d => d.Save(order), Times.Once);
        mockEmail.Verify(e => e.Send("Order confirmed", "alice@example.com"), Times.Once);
    }
}
```

```java
// Mock implementations for testing
class MockDatabase implements Database {
    List<Order> saved = new ArrayList<>();

    @Override
    public void save(Order order) {
        saved.add(order);
    }
}

class MockEmailSender implements EmailSender {
    List<String> sentEmails = new ArrayList<>();

    @Override
    public void send(String message, String to) {
        sentEmails.add(to + ": " + message);
    }
}

class OrderServiceTest {
    @Test
    void testPlaceOrder() {
        MockDatabase mockDb = new MockDatabase();
        MockEmailSender mockEmail = new MockEmailSender();
        OrderService service = new OrderService(mockDb, mockEmail);

        Order order = new Order("Laptop", "alice@example.com");
        service.placeOrder(order);

        assertEquals(1, mockDb.saved.size());
        assertEquals("Laptop", mockDb.saved.get(0).getItem());
        assertEquals(1, mockEmail.sentEmails.size());
    }
}
```

```python
from unittest.mock import Mock

class OrderService:
    def __init__(self, database, email_sender):
        self.database = database
        self.email_sender = email_sender

    def place_order(self, order):
        self.database.save(order)
        self.email_sender.send(f"Order confirmed: {order.item}",
                                order.email)

def test_place_order():
    mock_db = Mock()
    mock_email = Mock()
    service = OrderService(mock_db, mock_email)

    order = Mock(item="Laptop", email="alice@example.com")
    service.place_order(order)

    mock_db.save.assert_called_once_with(order)
    mock_email.send.assert_called_once()
```

```javascript
// Using Jest mocks
class OrderService {
  constructor(database, emailSender) {
    this.database = database;
    this.emailSender = emailSender;
  }

  placeOrder(order) {
    this.database.save(order);
    this.emailSender.send(`Order confirmed: ${order.item}`, order.email);
  }
}

describe("OrderService", () => {
  test("placeOrder saves and sends email", () => {
    const mockDb = { save: jest.fn() };
    const mockEmail = { send: jest.fn() };
    const service = new OrderService(mockDb, mockEmail);

    const order = { item: "Laptop", email: "alice@example.com" };
    service.placeOrder(order);

    expect(mockDb.save).toHaveBeenCalledWith(order);
    expect(mockEmail.send).toHaveBeenCalledTimes(1);
  });
});
```

---

## Testing Inheritance

Test the base class and each subclass:

```cpp
#include <gtest/gtest.h>
#include <cmath>

class Shape {
public:
    virtual double area() = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() override { return M_PI * radius * radius; }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() override { return width * height; }
};

TEST(CircleTest, Area) {
    Circle c(5);
    EXPECT_NEAR(c.area(), 78.5398, 0.001);
}

TEST(CircleTest, ZeroRadius) {
    Circle c(0);
    EXPECT_DOUBLE_EQ(c.area(), 0.0);
}

TEST(RectangleTest, Area) {
    Rectangle r(4, 6);
    EXPECT_DOUBLE_EQ(r.area(), 24.0);
}

TEST(RectangleTest, Square) {
    Rectangle r(5, 5);
    EXPECT_DOUBLE_EQ(r.area(), 25.0);
}
```

```csharp
using Xunit;
using System;

public abstract class Shape
{
    public abstract double Area();
}

public class Circle : Shape
{
    private readonly double _radius;
    public Circle(double radius) => _radius = radius;
    public override double Area() => Math.PI * _radius * _radius;
}

public class Rectangle : Shape
{
    private readonly double _width, _height;
    public Rectangle(double w, double h) { _width = w; _height = h; }
    public override double Area() => _width * _height;
}

public class CircleTests
{
    [Fact]
    public void Area_ReturnsCorrectValue()
    {
        var c = new Circle(5);
        Assert.Equal(78.5398, c.Area(), precision: 3);
    }

    [Fact]
    public void Area_ZeroRadius_ReturnsZero()
    {
        var c = new Circle(0);
        Assert.Equal(0, c.Area());
    }
}

public class RectangleTests
{
    [Fact]
    public void Area_ReturnsCorrectValue()
    {
        var r = new Rectangle(4, 6);
        Assert.Equal(24, r.Area());
    }

    [Fact]
    public void Area_Square_ReturnsCorrectValue()
    {
        var r = new Rectangle(5, 5);
        Assert.Equal(25, r.Area());
    }
}
```

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
    abstract double area();
}

class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    double width, height;
    Rectangle(double w, double h) { this.width = w; this.height = h; }
    double area() { return width * height; }
}

class CircleTest {
    @Test void testArea() {
        Circle c = new Circle(5);
        assertEquals(78.5398, c.area(), 0.001);
    }

    @Test void testZeroRadius() {
        Circle c = new Circle(0);
        assertEquals(0, c.area());
    }
}

class RectangleTest {
    @Test void testArea() {
        Rectangle r = new Rectangle(4, 6);
        assertEquals(24, r.area());
    }

    @Test void testSquare() {
        Rectangle r = new Rectangle(5, 5);
        assertEquals(25, r.area());
    }
}
```

```python
class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

# Tests
class TestCircle:
    def test_area(self):
        c = Circle(5)
        assert abs(c.area() - 78.53975) < 0.001

    def test_zero_radius(self):
        c = Circle(0)
        assert c.area() == 0

class TestRectangle:
    def test_area(self):
        r = Rectangle(4, 6)
        assert r.area() == 24

    def test_square(self):
        r = Rectangle(5, 5)
        assert r.area() == 25
```

```javascript
class Shape {
  area() { throw new Error("Not implemented"); }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(width, height) { super(); this.width = width; this.height = height; }
  area() { return this.width * this.height; }
}

describe("Circle", () => {
  test("area", () => {
    const c = new Circle(5);
    expect(c.area()).toBeCloseTo(78.5398, 3);
  });

  test("zero radius", () => {
    const c = new Circle(0);
    expect(c.area()).toBe(0);
  });
});

describe("Rectangle", () => {
  test("area", () => {
    const r = new Rectangle(4, 6);
    expect(r.area()).toBe(24);
  });

  test("square", () => {
    const r = new Rectangle(5, 5);
    expect(r.area()).toBe(25);
  });
});
```

---

## Test-Driven Development (TDD)

Write tests **before** writing the code:

```
1. RED    — Write a failing test
2. GREEN  — Write minimal code to pass
3. REFACTOR — Clean up while tests stay green
```

```cpp
// Step 1: RED — Write the test first
TEST(StackTest, PushPop) {
    Stack stack;
    stack.push(42);
    EXPECT_EQ(stack.pop(), 42);
    EXPECT_TRUE(stack.isEmpty());
}

// Step 2: GREEN — Write minimal code
class Stack {
    std::vector<int> items;
public:
    void push(int item) { items.push_back(item); }
    int pop() { int val = items.back(); items.pop_back(); return val; }
    bool isEmpty() { return items.empty(); }
};

// Step 3: REFACTOR — add edge cases
TEST(StackTest, EmptyPop) {
    Stack stack;
    EXPECT_THROW(stack.pop(), std::runtime_error);
}
```

```csharp
using Xunit;
using System;
using System.Collections.Generic;

// Step 1: RED — Write the test first
public class StackTests
{
    [Fact]
    public void PushPop_ReturnsLastPushed()
    {
        var stack = new Stack<int>();
        stack.Push(42);
        Assert.Equal(42, stack.Pop());
        Assert.True(stack.IsEmpty);
    }

    // Step 3: REFACTOR — add edge cases
    [Fact]
    public void Pop_WhenEmpty_ThrowsException()
    {
        var stack = new Stack<int>();
        Assert.Throws<InvalidOperationException>(() => stack.Pop());
    }
}

// Step 2: GREEN — Write minimal code
public class Stack<T>
{
    private readonly List<T> _items = new();

    public void Push(T item) => _items.Add(item);

    public T Pop()
    {
        if (_items.Count == 0)
            throw new InvalidOperationException("Stack is empty");
        var val = _items[^1];
        _items.RemoveAt(_items.Count - 1);
        return val;
    }

    public bool IsEmpty => _items.Count == 0;
}
```

```java
// Step 1: RED — Write the test first
@Test
void testStackPushPop() {
    Stack stack = new Stack();
    stack.push(42);
    assertEquals(42, stack.pop());
    assertTrue(stack.isEmpty());
}

// Step 2: GREEN — Write minimal code
class Stack {
    private List<Integer> items = new ArrayList<>();

    void push(int item) { items.add(item); }
    int pop() { return items.remove(items.size() - 1); }
    boolean isEmpty() { return items.isEmpty(); }
}

// Step 3: REFACTOR — add edge cases
@Test
void testStackEmptyPop() {
    Stack stack = new Stack();
    assertThrows(IndexOutOfBoundsException.class, stack::pop);
}
```

```python
# Step 1: RED — Write the test first
def test_stack_push_pop():
    stack = Stack()
    stack.push(42)
    assert stack.pop() == 42
    assert stack.is_empty()

# Step 2: GREEN — Write minimal code
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def is_empty(self):
        return len(self._items) == 0

# Step 3: REFACTOR — add edge cases
def test_stack_empty_pop():
    stack = Stack()
    with pytest.raises(IndexError):
        stack.pop()
```

```javascript
// Step 1: RED — Write the test first
test("stack push and pop", () => {
  const stack = new Stack();
  stack.push(42);
  expect(stack.pop()).toBe(42);
  expect(stack.isEmpty()).toBe(true);
});

// Step 2: GREEN — Write minimal code
class Stack {
  constructor() { this.items = []; }
  push(item) { this.items.push(item); }
  pop() { return this.items.pop(); }
  isEmpty() { return this.items.length === 0; }
}

// Step 3: REFACTOR — add edge cases
test("stack empty pop throws", () => {
  const stack = new Stack();
  expect(() => stack.pop()).toThrow();
});
```

---

## What to Test in OOP

| What | How |
|------|-----|
| **Constructor** | Correct initialization, validation |
| **Methods** | Correct output, state changes |
| **Edge cases** | Null, empty, boundary values |
| **Exceptions** | Correct exception for invalid input |
| **Equality** | `equals()` and `hashCode()` consistency |
| **Inheritance** | Subclass doesn't break parent contracts |
| **Integration** | Multiple classes working together |

---

## Key Takeaways

- **Unit tests** verify individual classes and methods
- Use **mock objects** to test classes with dependencies
- Test both **normal** and **edge** cases
- **TDD**: write tests first, then implement
- Test **inheritance** hierarchies — verify subclasses honour parent contracts
- Dependency injection makes classes **easy to test** with mocks
- Use the right framework: Google Test (C++), xUnit/NUnit (C#), JUnit (Java), pytest (Python), Jest (JS)

---

## Testing with xUnit (C#)

C# has excellent testing frameworks — **xUnit**, **NUnit**, and **MSTest**. xUnit is the most popular:

```csharp
using Xunit;
using System;

// [Fact] marks a single test case
// [Theory] marks a parameterized test

public class MathService
{
    public int Fibonacci(int n)
    {
        if (n < 0) throw new ArgumentException("n must be >= 0");
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}

public class MathServiceTests
{
    private readonly MathService _service = new();

    [Fact]
    public void Fibonacci_Zero_ReturnsZero()
    {
        Assert.Equal(0, _service.Fibonacci(0));
    }

    [Theory]
    [InlineData(1, 1)]
    [InlineData(5, 5)]
    [InlineData(10, 55)]
    public void Fibonacci_ValidInput_ReturnsCorrectValue(int input, int expected)
    {
        Assert.Equal(expected, _service.Fibonacci(input));
    }

    [Fact]
    public void Fibonacci_NegativeInput_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => _service.Fibonacci(-1));
    }
}
```

Next: **Refactoring OOP Code** — improving design without changing behaviour.
