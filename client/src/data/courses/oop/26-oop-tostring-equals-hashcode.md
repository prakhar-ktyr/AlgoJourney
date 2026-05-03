---
title: toString, equals, and hashCode
---

# toString, equals, and hashCode

Every class should override three fundamental methods: `toString()`, `equals()`, and `hashCode()`. These methods control how objects are printed, compared, and stored in collections.

---

## The `toString()` Method

Controls what happens when you print an object or convert it to a string.

### Without `toString()`

```cpp
#include <iostream>

class Dog {
public:
    std::string name;
    Dog(std::string name) : name(name) {}
};

Dog rex("Rex");
std::cout << &rex << std::endl;  // 0x7ffeeb2c ← memory address, not helpful!
```

```csharp
class Dog
{
    public string Name { get; }
    public Dog(string name) => Name = name;
}

var rex = new Dog("Rex");
Console.WriteLine(rex);  // Namespace.Dog  ← not helpful!
```

```java
class Dog {
    String name;
    Dog(String name) { this.name = name; }
}

Dog rex = new Dog("Rex");
System.out.println(rex);  // Dog@15db9742  ← not helpful!
```

```python
class Dog:
    def __init__(self, name):
        self.name = name

rex = Dog("Rex")
print(rex)  # <__main__.Dog object at 0x...>  ← not helpful!
```

```javascript
class Dog {
  constructor(name) {
    this.name = name;
  }
}

const rex = new Dog("Rex");
console.log(rex.toString());  // [object Object]  ← not helpful!
```

### With `toString()`

```cpp
#include <iostream>
#include <string>

class Dog {
public:
    std::string name;
    int age;

    Dog(std::string name, int age) : name(name), age(age) {}

    friend std::ostream& operator<<(std::ostream& os, const Dog& d) {
        os << "Dog{name='" << d.name << "', age=" << d.age << "}";
        return os;
    }
};

Dog rex("Rex", 3);
std::cout << rex << std::endl;  // Dog{name='Rex', age=3}  ← much better!
```

```csharp
using System;

class Dog
{
    public string Name { get; }
    public int Age { get; }

    public Dog(string name, int age) { Name = name; Age = age; }

    public override string ToString()
    {
        return $"Dog{{name='{Name}', age={Age}}}";
    }
}

var rex = new Dog("Rex", 3);
Console.WriteLine(rex);  // Dog{name='Rex', age=3}  ← much better!
```

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Dog{name='" + name + "', age=" + age + "}";
    }
}

Dog rex = new Dog("Rex", 3);
System.out.println(rex);  // Dog{name='Rex', age=3}  ← much better!
```

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        """Human-readable — used by print()"""
        return f"{self.name} (age {self.age})"

    def __repr__(self):
        """Developer-readable — used by debugger, repr()"""
        return f"Dog('{self.name}', {self.age})"

rex = Dog("Rex", 3)
print(rex)        # Rex (age 3)       — calls __str__
print(repr(rex))  # Dog('Rex', 3)     — calls __repr__
```

```javascript
class Dog {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  toString() {
    return `Dog{name='${this.name}', age=${this.age}}`;
  }
}

const rex = new Dog("Rex", 3);
console.log(rex.toString());  // Dog{name='Rex', age=3}
console.log(`${rex}`);        // Dog{name='Rex', age=3} — template literals call toString()
```

| Method | Purpose | Language |
|--------|---------|----------|
| `operator<<` | Stream output | C++ |
| `toString()` | String representation | Java, JavaScript |
| `__str__` | User-friendly display | Python |
| `__repr__` | Developer-friendly, unambiguous | Python |

---

## The `equals()` Method

By default, `==` compares **references** (are they the same object?), not **values**:

```cpp
#include <iostream>

class Point {
public:
    int x, y;
    Point(int x, int y) : x(x), y(y) {}

    // Overload == operator for value comparison
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }

    bool operator!=(const Point& other) const {
        return !(*this == other);
    }
};

Point p1(3, 4);
Point p2(3, 4);
std::cout << (p1 == p2) << std::endl;   // 1 (true) ✅
std::cout << (&p1 == &p2) << std::endl; // 0 (false) — different addresses
```

```csharp
using System;

class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public override bool Equals(object? obj)
    {
        if (obj is not Point other) return false;
        return X == other.X && Y == other.Y;
    }

    public override int GetHashCode() => HashCode.Combine(X, Y);
}

var p1 = new Point(3, 4);
var p2 = new Point(3, 4);
Console.WriteLine(p1.Equals(p2));            // True ✅
Console.WriteLine(ReferenceEquals(p1, p2));  // False — different objects
```

```java
class Point {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object obj) {
        // Same reference?
        if (this == obj) return true;

        // Null or different class?
        if (obj == null || getClass() != obj.getClass()) return false;

        // Cast and compare fields
        Point other = (Point) obj;
        return this.x == other.x && this.y == other.y;
    }
}

Point p1 = new Point(3, 4);
Point p2 = new Point(3, 4);
System.out.println(p1 == p2);       // false — different objects!
System.out.println(p1.equals(p2));  // true ✅
```

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

p1 = Point(3, 4)
p2 = Point(3, 4)
print(p1 == p2)      # True ✅
print(p1 is p2)      # False — different objects
```

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    if (!(other instanceof Point)) return false;
    return this.x === other.x && this.y === other.y;
  }
}

const p1 = new Point(3, 4);
const p2 = new Point(3, 4);
console.log(p1 === p2);        // false — different objects!
console.log(p1.equals(p2));    // true ✅
```

### The `equals()` Contract

Your `equals()` must be:

| Property | Meaning |
|----------|---------|
| **Reflexive** | `x.equals(x)` is always `true` |
| **Symmetric** | If `x.equals(y)` then `y.equals(x)` |
| **Transitive** | If `x.equals(y)` and `y.equals(z)`, then `x.equals(z)` |
| **Consistent** | Multiple calls return the same result |
| **Null-safe** | `x.equals(null)` is always `false` |

---

## The `hashCode()` Method

**Rule**: If two objects are `equal`, they **must** have the same hash code.

Hash codes are used by hash-based collections (HashMap, HashSet, dict, Set, unordered_map):

```cpp
#include <iostream>
#include <unordered_set>

struct Point {
    int x, y;

    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// Custom hash function for unordered containers
struct PointHash {
    size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 1);
    }
};

std::unordered_set<Point, PointHash> points;
points.insert({1, 2});
points.insert({1, 2});  // Duplicate — not added
std::cout << points.size() << std::endl;  // 1 ✅
```

```csharp
using System;
using System.Collections.Generic;

struct Point : IEquatable<Point>
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public bool Equals(Point other) => X == other.X && Y == other.Y;
    public override bool Equals(object? obj) => obj is Point p && Equals(p);
    public override int GetHashCode() => HashCode.Combine(X, Y);
}

var points = new HashSet<Point>();
points.Add(new Point(1, 2));
points.Add(new Point(1, 2));  // Duplicate — not added
Console.WriteLine(points.Count);  // 1 ✅
```

```java
import java.util.*;

class Point {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Point other = (Point) obj;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);  // Simple and correct
    }
}

// Now works correctly in HashSet and HashMap
Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.add(new Point(1, 2));  // Duplicate — not added
System.out.println(points.size());  // 1 ✅
```

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

points = {Point(1, 2), Point(1, 2), Point(3, 4)}
print(len(points))  # 2 (duplicate removed)
```

```javascript
// JavaScript doesn't use hashCode for Set/Map (uses reference identity).
// To deduplicate by value, use a custom key approach:
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  // Generate a string key for use with Map/Set
  hashKey() {
    return `${this.x},${this.y}`;
  }
}

// Use a Map with string keys for value-based deduplication
const pointMap = new Map();
const p1 = new Point(1, 2);
const p2 = new Point(1, 2);

pointMap.set(p1.hashKey(), p1);
pointMap.set(p2.hashKey(), p2);  // Overwrites (same key)
console.log(pointMap.size);  // 1 ✅
```

### Without `hashCode()` (Java)

```java
// ❌ BUG: Without hashCode, HashSet treats equal objects as different
Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.add(new Point(1, 2));
System.out.println(points.size());  // 2 (wrong!)
```

---

## Complete Example

```cpp
#include <iostream>
#include <string>
#include <unordered_set>

class Employee {
    std::string name;
    int id;
    std::string department;

public:
    Employee(std::string name, int id, std::string dept)
        : name(name), id(id), department(dept) {}

    bool operator==(const Employee& other) const {
        return id == other.id && name == other.name
            && department == other.department;
    }

    friend std::ostream& operator<<(std::ostream& os, const Employee& e) {
        os << "Employee{id=" << e.id << ", name='" << e.name
           << "', dept='" << e.department << "'}";
        return os;
    }

    // For use in unordered containers
    struct Hash {
        size_t operator()(const Employee& e) const {
            return std::hash<std::string>()(e.name)
                 ^ std::hash<int>()(e.id)
                 ^ std::hash<std::string>()(e.department);
        }
    };
};

Employee e1("Alice", 101, "Engineering");
Employee e2("Alice", 101, "Engineering");
std::cout << e1 << std::endl;     // Employee{id=101, name='Alice', dept='Engineering'}
std::cout << (e1 == e2) << std::endl;  // 1 (true)
```

```csharp
using System;

class Employee : IEquatable<Employee>
{
    public string Name { get; }
    public int Id { get; }
    public string Department { get; }

    public Employee(string name, int id, string department)
    {
        Name = name;
        Id = id;
        Department = department;
    }

    public override string ToString()
        => $"Employee{{id={Id}, name='{Name}', dept='{Department}'}}";

    public bool Equals(Employee? other)
    {
        if (other is null) return false;
        return Id == other.Id && Name == other.Name
            && Department == other.Department;
    }

    public override bool Equals(object? obj) => Equals(obj as Employee);
    public override int GetHashCode() => HashCode.Combine(Name, Id, Department);
}

var e1 = new Employee("Alice", 101, "Engineering");
var e2 = new Employee("Alice", 101, "Engineering");

Console.WriteLine(e1);             // Employee{id=101, name='Alice', dept='Engineering'}
Console.WriteLine(e1.Equals(e2));  // True
Console.WriteLine(e1.GetHashCode() == e2.GetHashCode());  // True
```

```java
import java.util.Objects;

class Employee {
    private String name;
    private int id;
    private String department;

    Employee(String name, int id, String department) {
        this.name = name;
        this.id = id;
        this.department = department;
    }

    @Override
    public String toString() {
        return "Employee{id=" + id + ", name='" + name
             + "', dept='" + department + "'}";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Employee other = (Employee) obj;
        return id == other.id
            && Objects.equals(name, other.name)
            && Objects.equals(department, other.department);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, id, department);
    }
}

Employee e1 = new Employee("Alice", 101, "Engineering");
Employee e2 = new Employee("Alice", 101, "Engineering");

System.out.println(e1);             // Employee{id=101, name='Alice', dept='Engineering'}
System.out.println(e1.equals(e2));  // true
System.out.println(e1.hashCode() == e2.hashCode());  // true
```

```python
class Employee:
    def __init__(self, name, emp_id, department):
        self.name = name
        self.id = emp_id
        self.department = department

    def __str__(self):
        return f"Employee{{id={self.id}, name='{self.name}', dept='{self.department}'}}"

    def __repr__(self):
        return self.__str__()

    def __eq__(self, other):
        if not isinstance(other, Employee):
            return NotImplemented
        return (self.id == other.id
                and self.name == other.name
                and self.department == other.department)

    def __hash__(self):
        return hash((self.name, self.id, self.department))

e1 = Employee("Alice", 101, "Engineering")
e2 = Employee("Alice", 101, "Engineering")

print(e1)            # Employee{id=101, name='Alice', dept='Engineering'}
print(e1 == e2)      # True
print(hash(e1) == hash(e2))  # True
```

```javascript
class Employee {
  constructor(name, id, department) {
    this.name = name;
    this.id = id;
    this.department = department;
  }

  toString() {
    return `Employee{id=${this.id}, name='${this.name}', dept='${this.department}'}`;
  }

  equals(other) {
    if (!(other instanceof Employee)) return false;
    return this.id === other.id
        && this.name === other.name
        && this.department === other.department;
  }

  hashKey() {
    return `${this.name}:${this.id}:${this.department}`;
  }
}

const e1 = new Employee("Alice", 101, "Engineering");
const e2 = new Employee("Alice", 101, "Engineering");

console.log(e1.toString());         // Employee{id=101, name='Alice', dept='Engineering'}
console.log(e1.equals(e2));         // true
console.log(e1.hashKey() === e2.hashKey());  // true
```

---

## ToString, Equals, GetHashCode (C#)

In C#, the equivalents are `ToString()`, `Equals()`, and `GetHashCode()`. C# also provides the `IEquatable<T>` interface for type-safe equality:

```csharp
using System;

class Point : IEquatable<Point>
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public override string ToString() => $"Point({X}, {Y})";

    public bool Equals(Point? other)
        => other is not null && X == other.X && Y == other.Y;

    public override bool Equals(object? obj) => Equals(obj as Point);

    public override int GetHashCode() => HashCode.Combine(X, Y);

    // Optional: operator overloads for convenience
    public static bool operator ==(Point? a, Point? b)
        => a?.Equals(b) ?? b is null;
    public static bool operator !=(Point? a, Point? b) => !(a == b);
}
```

For simple data types, use **records** which auto-generate all three methods:

```csharp
record Point(int X, int Y);

var p1 = new Point(3, 4);
var p2 = new Point(3, 4);
Console.WriteLine(p1);            // Point { X = 3, Y = 4 }
Console.WriteLine(p1 == p2);      // True (value equality)
Console.WriteLine(p1.GetHashCode() == p2.GetHashCode());  // True
```

---

## Symbol Methods (JavaScript)

JavaScript uses **well-known Symbols** to customise object behaviour — similar to Python's dunder methods.

```javascript
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  // Controls type coercion (called by +, ==, template literals)
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.celsius;
    if (hint === "string") return `${this.celsius}°C`;
    return this.celsius; // default
  }

  // Makes the object iterable (used by for...of, spread)
  [Symbol.iterator]() {
    const steps = [this.celsius, this.celsius * 9/5 + 32]; // C, F
    let i = 0;
    return { next: () => ({ value: steps[i], done: i++ >= steps.length }) };
  }
}

const t = new Temperature(100);
console.log(`Boiling: ${t}`);  // Boiling: 100°C  (string hint)
console.log(t + 0);            // 100              (number hint)

const [c, f] = t;              // Destructure via iterator
console.log(c, f);             // 100 212
```

---

## Dunder Methods (Python)

Python uses **dunder (double-underscore) methods** to customise how objects behave with operators and built-in functions:

```python
import functools

@functools.total_ordering  # Auto-generates __le__, __gt__, __ge__
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    def __repr__(self):
        """Unambiguous — used by debugger, containers, repr()."""
        return f"Temperature({self.celsius})"

    def __str__(self):
        """Human-friendly — used by print(), str(), f-strings."""
        return f"{self.celsius}°C"

    def __eq__(self, other):
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other):
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius < other.celsius

    def __hash__(self):
        return hash(self.celsius)

t1 = Temperature(100)
t2 = Temperature(37)

print(t1)           # 100°C          (__str__)
print(repr(t2))     # Temperature(37) (__repr__)
print(t1 > t2)      # True            (__gt__ via @total_ordering)
print(t1 == Temperature(100))  # True (__eq__)
```

The full set of comparison dunders: `__eq__`, `__ne__`, `__lt__`, `__le__`, `__gt__`, `__ge__`. Use `@functools.total_ordering` to define only `__eq__` + one of `__lt__`/`__gt__` and get the rest for free.

---

## Key Takeaways
- Python equivalents: `__str__`, `__repr__`, `__eq__`, `__hash__`
- JavaScript: `toString()`, custom `equals()` method, `hashKey()` for Map/Set usage
- These methods are essential for debugging, collections, and data structures

Next: **Type Casting and instanceof** — safely converting between types.
