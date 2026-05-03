---
title: Operator Overloading
---

# Operator Overloading

**Operator overloading** lets you define how operators like `+`, `-`, `==`, and `<` work with your custom objects.

---

## What is Operator Overloading?

Normally, `+` adds numbers. But what if you want to add two `Vector` objects?

```
v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2  # How should + work for Vectors?
```

Operator overloading lets you define exactly that.

---

## Operator Overloading Support by Language

| Language | Operator Overloading |
|----------|---------------------|
| **C++** | Full native support |
| **Python** | Full support via magic methods |
| **Java** | **Not supported** — use named methods instead |
| **JavaScript** | **Not supported** — use named methods instead |

---

## C++ — Full Native Support

C++ supports overloading most operators directly:

| Operator | Syntax | Example |
|----------|--------|---------|
| `+` | `operator+` | `a + b` |
| `-` | `operator-` | `a - b` |
| `*` | `operator*` | `a * b` |
| `==` | `operator==` | `a == b` |
| `!=` | `operator!=` | `a != b` |
| `<` | `operator<` | `a < b` |
| `<<` | `operator<<` | `cout << a` |
| `[]` | `operator[]` | `a[0]` |

---

## Python — Full Support via Magic Methods

| Operator | Magic Method | Example |
|----------|-------------|---------|
| `+` | `__add__(self, other)` | `a + b` |
| `-` | `__sub__(self, other)` | `a - b` |
| `*` | `__mul__(self, other)` | `a * b` |
| `/` | `__truediv__(self, other)` | `a / b` |
| `==` | `__eq__(self, other)` | `a == b` |
| `!=` | `__ne__(self, other)` | `a != b` |
| `<` | `__lt__(self, other)` | `a < b` |
| `<=` | `__le__(self, other)` | `a <= b` |
| `>` | `__gt__(self, other)` | `a > b` |
| `>=` | `__ge__(self, other)` | `a >= b` |
| `str()` | `__str__(self)` | `print(a)` |
| `repr()` | `__repr__(self)` | `repr(a)` |
| `len()` | `__len__(self)` | `len(a)` |
| `[]` | `__getitem__(self, key)` | `a[0]` |

---

## Vector Example

```cpp
#include <iostream>
#include <cmath>

class Vector {
public:
    double x, y;

    Vector(double x, double y) : x(x), y(y) {}

    Vector operator+(const Vector& other) const {
        return Vector(x + other.x, y + other.y);
    }

    Vector operator-(const Vector& other) const {
        return Vector(x - other.x, y - other.y);
    }

    Vector operator*(double scalar) const {
        return Vector(x * scalar, y * scalar);
    }

    bool operator==(const Vector& other) const {
        return x == other.x && y == other.y;
    }

    double magnitude() const {
        return std::sqrt(x * x + y * y);
    }

    friend std::ostream& operator<<(std::ostream& os, const Vector& v) {
        os << "Vector(" << v.x << ", " << v.y << ")";
        return os;
    }
};

int main() {
    Vector v1(1, 2);
    Vector v2(3, 4);

    std::cout << v1 + v2 << std::endl;      // Vector(4, 6)
    std::cout << v1 - v2 << std::endl;      // Vector(-2, -2)
    std::cout << v1 * 3 << std::endl;       // Vector(3, 6)
    std::cout << (v1 == v2) << std::endl;   // 0 (false)
    std::cout << v2.magnitude() << std::endl; // 5
}
```

```csharp
using System;

class Vector
{
    public double X { get; }
    public double Y { get; }

    public Vector(double x, double y) { X = x; Y = y; }

    public static Vector operator +(Vector a, Vector b)
        => new Vector(a.X + b.X, a.Y + b.Y);

    public static Vector operator -(Vector a, Vector b)
        => new Vector(a.X - b.X, a.Y - b.Y);

    public static Vector operator *(Vector v, double scalar)
        => new Vector(v.X * scalar, v.Y * scalar);

    public static bool operator ==(Vector a, Vector b)
        => a.X == b.X && a.Y == b.Y;

    public static bool operator !=(Vector a, Vector b)
        => !(a == b);

    public double Magnitude() => Math.Sqrt(X * X + Y * Y);

    public override string ToString() => $"Vector({X}, {Y})";

    public override bool Equals(object? obj)
        => obj is Vector v && this == v;

    public override int GetHashCode() => HashCode.Combine(X, Y);
}

var v1 = new Vector(1, 2);
var v2 = new Vector(3, 4);

Console.WriteLine(v1 + v2);      // Vector(4, 6)
Console.WriteLine(v1 - v2);      // Vector(-2, -2)
Console.WriteLine(v1 * 3);       // Vector(3, 6)
Console.WriteLine(v1 == v2);     // False
Console.WriteLine(v2.Magnitude()); // 5
```

```java
// Java does NOT support custom operator overloading.
// Use named methods instead.
class Vector {
    double x, y;

    Vector(double x, double y) {
        this.x = x;
        this.y = y;
    }

    Vector add(Vector other) {
        return new Vector(x + other.x, y + other.y);
    }

    Vector subtract(Vector other) {
        return new Vector(x - other.x, y - other.y);
    }

    Vector multiply(double scalar) {
        return new Vector(x * scalar, y * scalar);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Vector)) return false;
        Vector other = (Vector) obj;
        return x == other.x && y == other.y;
    }

    double magnitude() {
        return Math.sqrt(x * x + y * y);
    }

    @Override
    public String toString() {
        return "Vector(" + x + ", " + y + ")";
    }
}

Vector v1 = new Vector(1, 2);
Vector v2 = new Vector(3, 4);

System.out.println(v1.add(v2));       // Vector(4.0, 6.0)
System.out.println(v1.subtract(v2));  // Vector(-2.0, -2.0)
System.out.println(v1.multiply(3));   // Vector(3.0, 6.0)
System.out.println(v1.equals(v2));    // false
System.out.println(v2.magnitude());   // 5.0
```

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)

print(v1 + v2)      # Vector(4, 6)
print(v1 - v2)      # Vector(-2, -2)
print(v1 * 3)       # Vector(3, 6)
print(v1 == v2)     # False
print(abs(v2))      # 5.0
```

```javascript
// JavaScript does NOT support custom operator overloading.
// Use named methods instead.
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  toString() {
    return `Vector(${this.x}, ${this.y})`;
  }
}

const v1 = new Vector(1, 2);
const v2 = new Vector(3, 4);

console.log(v1.add(v2).toString());       // Vector(4, 6)
console.log(v1.subtract(v2).toString());  // Vector(-2, -2)
console.log(v1.multiply(3).toString());   // Vector(3, 6)
console.log(v1.equals(v2));               // false
console.log(v2.magnitude());              // 5
```

---

## Money Class Example

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <iomanip>

class Money {
    double amount;
    std::string currency;

public:
    Money(double amount, std::string currency = "USD")
        : amount(std::round(amount * 100) / 100), currency(currency) {}

    Money operator+(const Money& other) const {
        if (currency != other.currency)
            throw std::invalid_argument("Cannot add " + currency + " and " + other.currency);
        return Money(amount + other.amount, currency);
    }

    Money operator-(const Money& other) const {
        if (currency != other.currency)
            throw std::invalid_argument("Cannot subtract different currencies");
        return Money(amount - other.amount, currency);
    }

    Money operator*(double factor) const {
        return Money(amount * factor, currency);
    }

    bool operator<(const Money& other) const { return amount < other.amount; }
    bool operator==(const Money& other) const {
        return amount == other.amount && currency == other.currency;
    }

    friend std::ostream& operator<<(std::ostream& os, const Money& m) {
        os << "$" << std::fixed << std::setprecision(2) << m.amount << " " << m.currency;
        return os;
    }
};

Money price(29.99);
Money tax(2.40);
Money total = price + tax;
std::cout << total << std::endl;        // $32.39 USD

Money discount = total * 0.9;
std::cout << discount << std::endl;     // $29.15 USD
std::cout << (price < total) << std::endl;  // 1 (true)
```

```csharp
using System;

class Money
{
    public double Amount { get; }
    public string Currency { get; }

    public Money(double amount, string currency = "USD")
    {
        Amount = Math.Round(amount, 2);
        Currency = currency;
    }

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException($"Cannot add {a.Currency} and {b.Currency}");
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public static Money operator -(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException("Cannot subtract different currencies");
        return new Money(a.Amount - b.Amount, a.Currency);
    }

    public static Money operator *(Money m, double factor)
        => new Money(m.Amount * factor, m.Currency);

    public static bool operator <(Money a, Money b) => a.Amount < b.Amount;
    public static bool operator >(Money a, Money b) => a.Amount > b.Amount;

    public static bool operator ==(Money a, Money b)
        => a.Amount == b.Amount && a.Currency == b.Currency;
    public static bool operator !=(Money a, Money b) => !(a == b);

    public override string ToString() => $"${Amount:F2} {Currency}";
    public override bool Equals(object? obj) => obj is Money m && this == m;
    public override int GetHashCode() => HashCode.Combine(Amount, Currency);
}

var price = new Money(29.99);
var tax = new Money(2.40);
var total = price + tax;
Console.WriteLine(total);        // $32.39 USD

var discount = total * 0.9;
Console.WriteLine(discount);     // $29.15 USD
Console.WriteLine(price < total); // True
```

```java
// Java: no operator overloading — use methods
class Money {
    private final double amount;
    private final String currency;

    Money(double amount, String currency) {
        this.amount = Math.round(amount * 100.0) / 100.0;
        this.currency = currency;
    }

    Money(double amount) { this(amount, "USD"); }

    Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Cannot add " + currency + " and " + other.currency);
        return new Money(amount + other.amount, currency);
    }

    Money subtract(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Cannot subtract different currencies");
        return new Money(amount - other.amount, currency);
    }

    Money multiply(double factor) {
        return new Money(amount * factor, currency);
    }

    boolean isLessThan(Money other) { return amount < other.amount; }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Money)) return false;
        Money other = (Money) obj;
        return amount == other.amount && currency.equals(other.currency);
    }

    @Override
    public String toString() {
        return String.format("$%.2f %s", amount, currency);
    }
}

Money price = new Money(29.99);
Money tax = new Money(2.40);
Money total = price.add(tax);
System.out.println(total);              // $32.39 USD

Money discount = total.multiply(0.9);
System.out.println(discount);           // $29.15 USD
System.out.println(price.isLessThan(total));  // true
```

```python
class Money:
    def __init__(self, amount, currency="USD"):
        self.amount = round(amount, 2)
        self.currency = currency

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError(f"Cannot add {self.currency} and {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other):
        if self.currency != other.currency:
            raise ValueError(f"Cannot subtract {self.currency} and {other.currency}")
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, factor):
        return Money(self.amount * factor, self.currency)

    def __lt__(self, other):
        return self.amount < other.amount

    def __eq__(self, other):
        return self.amount == other.amount and self.currency == other.currency

    def __str__(self):
        return f"${self.amount:.2f} {self.currency}"

price = Money(29.99)
tax = Money(2.40)
total = price + tax
print(total)           # $32.39 USD

discount = total * 0.9
print(discount)        # $29.15 USD

print(price < total)   # True
```

```javascript
// JavaScript: no operator overloading — use methods
class Money {
  constructor(amount, currency = "USD") {
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract different currencies`);
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  isLessThan(other) {
    return this.amount < other.amount;
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString() {
    return `$${this.amount.toFixed(2)} ${this.currency}`;
  }
}

const price = new Money(29.99);
const tax = new Money(2.40);
const total = price.add(tax);
console.log(total.toString());            // $32.39 USD

const discount = total.multiply(0.9);
console.log(discount.toString());         // $29.15 USD
console.log(price.isLessThan(total));     // true
```

---

## Operator Overloading (C#)

C# has **full native support** for operator overloading, similar to C++:

| Operator | Syntax | Notes |
|----------|--------|-------|
| `+` | `operator +` | Must be `public static` |
| `-` | `operator -` | Unary and binary |
| `*` | `operator *` | |
| `==` / `!=` | Must override both | Also override `Equals()` and `GetHashCode()` |
| `<` / `>` | Must override both | |
| `<=` / `>=` | Must override both | |
| `implicit` | `implicit operator` | Implicit type conversion |
| `explicit` | `explicit operator` | Explicit type conversion |

C# requires that if you override `==`, you must also override `!=`, `Equals()`, and `GetHashCode()`. Comparison operators (`<`, `>`, `<=`, `>=`) must also be overridden in pairs.

---

## Comparable Interface (Java) — Alternative to `<` Operator

Java uses `Comparable` for ordering (instead of `<`, `>` operators):

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

class Student {
public:
    std::string name;
    double gpa;

    Student(std::string name, double gpa) : name(name), gpa(gpa) {}

    // Overload < for sorting
    bool operator<(const Student& other) const {
        return gpa < other.gpa;
    }
};

std::vector<Student> students = {{"Alice", 3.8}, {"Bob", 3.2}};
std::sort(students.begin(), students.end());  // Sorts by GPA
```

```csharp
using System;
using System.Collections.Generic;

class Student : IComparable<Student>
{
    public string Name { get; }
    public double Gpa { get; }

    public Student(string name, double gpa) { Name = name; Gpa = gpa; }

    public int CompareTo(Student? other)
        => Gpa.CompareTo(other?.Gpa ?? 0);
}

var students = new List<Student> { new("Alice", 3.8), new("Bob", 3.2) };
students.Sort();  // Sorts by GPA using CompareTo
```

```java
class Student implements Comparable<Student> {
    String name;
    double gpa;

    Student(String name, double gpa) {
        this.name = name;
        this.gpa = gpa;
    }

    @Override
    public int compareTo(Student other) {
        return Double.compare(this.gpa, other.gpa);
    }
}

List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 3.8));
students.add(new Student("Bob", 3.2));
Collections.sort(students);  // Sorts by GPA
```

```python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, name, gpa):
        self.name = name
        self.gpa = gpa

    def __lt__(self, other):
        return self.gpa < other.gpa

    def __eq__(self, other):
        return self.gpa == other.gpa

students = [Student("Alice", 3.8), Student("Bob", 3.2)]
students.sort()  # Sorts by GPA using __lt__
```

```javascript
// JavaScript uses comparator functions for sorting
class Student {
  constructor(name, gpa) {
    this.name = name;
    this.gpa = gpa;
  }
}

const students = [new Student("Alice", 3.8), new Student("Bob", 3.2)];
students.sort((a, b) => a.gpa - b.gpa);  // Sorts by GPA
```

---

## Custom Collection with `[]` Operator

```cpp
#include <iostream>
#include <vector>
#include <string>

class Matrix {
    std::vector<std::vector<int>> rows;

public:
    Matrix(std::vector<std::vector<int>> rows) : rows(rows) {}

    std::vector<int>& operator[](int index) {
        return rows[index];
    }

    const std::vector<int>& operator[](int index) const {
        return rows[index];
    }

    int size() const { return rows.size(); }

    friend std::ostream& operator<<(std::ostream& os, const Matrix& m) {
        for (const auto& row : m.rows) {
            for (int val : row) os << val << " ";
            os << "\n";
        }
        return os;
    }
};

Matrix m({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}});
std::cout << m[0][0] << std::endl;  // 1
std::cout << m[1][2] << std::endl;  // 6
m[0] = {10, 20, 30};
std::cout << m << std::endl;
```

```csharp
using System;

class Matrix
{
    private int[][] rows;

    public Matrix(int[][] rows) => this.rows = rows;

    // C# supports indexer overloading
    public int[] this[int index]
    {
        get => rows[index];
        set => rows[index] = value;
    }

    public int Size => rows.Length;

    public override string ToString()
    {
        var sb = new System.Text.StringBuilder();
        foreach (var row in rows)
            sb.AppendLine(string.Join(" ", row));
        return sb.ToString();
    }
}

var m = new Matrix(new[] { new[] {1,2,3}, new[] {4,5,6}, new[] {7,8,9} });
Console.WriteLine(m[0][0]);  // 1
Console.WriteLine(m[1][2]);  // 6
m[0] = new[] {10, 20, 30};
Console.Write(m);
```

```java
// Java doesn't support [] overloading — use get()/set() methods
class Matrix {
    private int[][] rows;

    Matrix(int[][] rows) { this.rows = rows; }

    int[] getRow(int index) { return rows[index]; }
    void setRow(int index, int[] value) { rows[index] = value; }
    int get(int row, int col) { return rows[row][col]; }
    int size() { return rows.length; }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (int[] row : rows) {
            sb.append(java.util.Arrays.toString(row)).append("\n");
        }
        return sb.toString();
    }
}

Matrix m = new Matrix(new int[][]{{1,2,3},{4,5,6},{7,8,9}});
System.out.println(m.get(0, 0));    // 1
System.out.println(m.get(1, 2));    // 6
m.setRow(0, new int[]{10, 20, 30});
System.out.println(m);
```

```python
class Matrix:
    def __init__(self, rows):
        self.rows = rows

    def __getitem__(self, index):
        return self.rows[index]

    def __setitem__(self, index, value):
        self.rows[index] = value

    def __len__(self):
        return len(self.rows)

    def __str__(self):
        return "\n".join(str(row) for row in self.rows)

m = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(m[0])       # [1, 2, 3]
print(m[1][2])    # 6
print(len(m))     # 3

m[0] = [10, 20, 30]
print(m)
# [10, 20, 30]
# [4, 5, 6]
# [7, 8, 9]
```

```javascript
// JavaScript uses Proxy for [] overloading (advanced)
// Simpler approach: use get()/set() methods
class Matrix {
  constructor(rows) {
    this.rows = rows;
  }

  getRow(index) {
    return this.rows[index];
  }

  setRow(index, value) {
    this.rows[index] = value;
  }

  get(row, col) {
    return this.rows[row][col];
  }

  get length() {
    return this.rows.length;
  }

  toString() {
    return this.rows.map((row) => row.join(" ")).join("\n");
  }
}

const m = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
console.log(m.getRow(0));    // [1, 2, 3]
console.log(m.get(1, 2));    // 6
console.log(m.length);       // 3

m.setRow(0, [10, 20, 30]);
console.log(m.toString());
// 10 20 30
// 4 5 6
// 7 8 9
```

---

## Best Practices

| Do | Don't |
|----|-------|
| Overload operators that make **intuitive sense** | Overload `+` to subtract (confusing) |
| Keep the **return type** consistent | `Vector + Vector` should return `Vector` |
| Implement **related operators** together | If you define `==`, also define `!=` |
| Follow **mathematical conventions** | `+` should be commutative if expected |
| Use methods in Java/JS where operators aren't available | Fight the language to fake operators |

---

## Key Takeaways

- **Operator overloading** defines how operators work with custom objects
- C++ has full native support via `operator+`, `operator==`, etc.
- Python has full support via **magic methods** (`__add__`, `__eq__`, etc.)
- Java and JavaScript do **not** support custom operator overloading — use named methods instead
- Java uses `equals()`, `hashCode()`, `compareTo()`, and `toString()`
- Only overload operators when the meaning is **intuitive and clear**

Next: **The `toString` and `equals` Methods** — the essential methods every class needs.
