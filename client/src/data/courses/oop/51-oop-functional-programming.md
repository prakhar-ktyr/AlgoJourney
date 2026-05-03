---
title: OOP in Functional Programming
---

# OOP in Functional Programming

Functional programming (FP) and OOP are often presented as opposites, but modern languages blend both paradigms. Understanding how they interact makes you a more effective developer.

---

## FP vs OOP: Core Differences

| Aspect | OOP | Functional |
|--------|-----|------------|
| Core unit | Objects (data + behaviour) | Functions (input → output) |
| State | Mutable (objects change) | Immutable (no side effects) |
| Data flow | Method calls on objects | Function composition |
| Abstraction | Classes, interfaces | Higher-order functions |
| Side effects | Common (modify state) | Avoided (pure functions) |

---

## Blending OOP and FP

Modern languages let you use OOP for modelling and FP for processing:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
#include <string>

class Product {
public:
    std::string name;
    double price;
    std::string category;

    Product(std::string n, double p, std::string c)
        : name(std::move(n)), price(p), category(std::move(c)) {}
};

int main() {
    std::vector<Product> products = {
        {"Laptop", 999, "Electronics"},
        {"Book", 15, "Education"},
        {"Phone", 699, "Electronics"},
        {"Pen", 2, "Office"}
    };

    // Functional: filter + transform using lambdas and algorithms
    std::vector<std::string> expensiveNames;
    for (const auto& p : products) {
        if (p.price > 100) {
            expensiveNames.push_back(p.name);
        }
    }
    std::sort(expensiveNames.begin(), expensiveNames.end());

    for (const auto& n : expensiveNames) {
        std::cout << n << " ";
    }
    // Output: Laptop Phone

    // Higher-order function: pass behaviour as parameter
    auto isExpensive = [](const Product& p) { return p.price > 100; };
    auto isElectronics = [](const Product& p) { return p.category == "Electronics"; };

    long count = std::count_if(products.begin(), products.end(),
        [&](const Product& p) { return isExpensive(p) && isElectronics(p); });

    std::cout << "\nExpensive electronics: " << count << std::endl;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Product
{
    public string Name { get; }
    public double Price { get; }
    public string Category { get; }

    public Product(string name, double price, string category)
    {
        Name = name; Price = price; Category = category;
    }
}

var products = new List<Product>
{
    new("Laptop", 999, "Electronics"),
    new("Book", 15, "Education"),
    new("Phone", 699, "Electronics"),
    new("Pen", 2, "Office")
};

// Functional: LINQ (Language Integrated Query)
var expensiveNames = products
    .Where(p => p.Price > 100)
    .Select(p => p.Name)
    .OrderBy(n => n)
    .ToList();

Console.WriteLine(string.Join(", ", expensiveNames)); // Laptop, Phone

// Higher-order functions with Func<> delegates
Func<Product, bool> isExpensive = p => p.Price > 100;
Func<Product, bool> isElectronics = p => p.Category == "Electronics";

int count = products.Count(p => isExpensive(p) && isElectronics(p));
Console.WriteLine($"Expensive electronics: {count}"); // 2
```

```java
import java.util.List;
import java.util.stream.Collectors;
import java.util.function.Predicate;

class Product {
    String name;
    double price;
    String category;

    Product(String name, double price, String category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }

    String getName() { return name; }
    double getPrice() { return price; }
}

// OOP: Products are objects with data and methods
// FP: Processing uses functions, lambdas, and streams
List<Product> products = List.of(
    new Product("Laptop", 999, "Electronics"),
    new Product("Book", 15, "Education"),
    new Product("Phone", 699, "Electronics"),
    new Product("Pen", 2, "Office")
);

// Functional: filter, map, reduce via streams
List<String> expensiveNames = products.stream()
    .filter(p -> p.getPrice() > 100)           // Predicate (function)
    .map(Product::getName)                      // Method reference
    .sorted()                                    // Function
    .collect(Collectors.toList());              // Terminal

System.out.println(expensiveNames);  // [Laptop, Phone]

// Higher-order function: pass behaviour as parameter
Predicate<Product> isExpensive = p -> p.getPrice() > 100;
Predicate<Product> isElectronics = p -> p.category.equals("Electronics");

long count = products.stream()
    .filter(isExpensive.and(isElectronics))
    .count();
```

```python
class Product:
    def __init__(self, name, price, category):
        self.name = name
        self.price = price
        self.category = category

    def __repr__(self):
        return f"Product({self.name}, ${self.price})"

products = [
    Product("Laptop", 999, "Electronics"),
    Product("Book", 15, "Education"),
    Product("Phone", 699, "Electronics"),
    Product("Pen", 2, "Office"),
]

# Functional: filter, map, reduce
expensive = filter(lambda p: p.price > 100, products)
names = sorted(map(lambda p: p.name, expensive))
print(names)  # ['Laptop', 'Phone']

# List comprehension (Pythonic FP)
expensive_electronics = [
    p.name for p in products
    if p.price > 100 and p.category == "Electronics"
]

# Higher-order functions with OOP
from functools import reduce

total = reduce(lambda acc, p: acc + p.price, products, 0)
print(f"Total: ${total}")  # Total: $1715
```

```javascript
class Product {
  constructor(name, price, category) {
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

const products = [
  new Product("Laptop", 999, "Electronics"),
  new Product("Book", 15, "Education"),
  new Product("Phone", 699, "Electronics"),
  new Product("Pen", 2, "Office"),
];

// Functional: filter, map, sort using array methods
const expensiveNames = products
  .filter((p) => p.price > 100)
  .map((p) => p.name)
  .sort();

console.log(expensiveNames); // ['Laptop', 'Phone']

// Higher-order functions: pass behaviour as parameter
const isExpensive = (p) => p.price > 100;
const isElectronics = (p) => p.category === "Electronics";

const count = products.filter(
  (p) => isExpensive(p) && isElectronics(p)
).length;

console.log(`Expensive electronics: ${count}`); // 2
```

---

## Immutable Objects (FP Principle in OOP)

Immutability is a core FP concept that improves OOP code:

```cpp
#include <iostream>
#include <string>
#include <stdexcept>

class Money {
    double amount_;
    std::string currency_;
public:
    Money(double amount, std::string currency)
        : amount_(amount), currency_(std::move(currency)) {}

    double amount() const { return amount_; }
    const std::string& currency() const { return currency_; }

    // "Modification" returns new object (FP style)
    Money add(const Money& other) const {
        if (currency_ != other.currency_) {
            throw std::runtime_error("Currency mismatch");
        }
        return Money(amount_ + other.amount_, currency_);
    }

    Money multiply(double factor) const {
        return Money(amount_ * factor, currency_);
    }
};

int main() {
    Money price(100, "USD");
    Money tax = price.multiply(0.1);    // New object
    Money total = price.add(tax);       // New object
    // price is still $100 — never modified!
    std::cout << total.amount() << std::endl; // 110
}
```

```csharp
// Immutable class — FP principle in OOP
public record Money(double Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Currency mismatch");
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Multiply(double factor) => new(Amount * factor, Currency);
}

var price = new Money(100, "USD");
var tax = price.Multiply(0.1);       // New object
var total = price.Add(tax);          // New object
// price is still $100 — never modified!
Console.WriteLine(total.Amount);     // 110
```

```java
// Immutable class — FP principle in OOP
final class Money {
    private final double amount;
    private final String currency;

    Money(double amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    double getAmount() { return amount; }
    String getCurrency() { return currency; }

    // "Modification" returns new object (FP style)
    Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new RuntimeException("Currency mismatch");
        }
        return new Money(amount + other.amount, currency);
    }

    Money multiply(double factor) {
        return new Money(amount * factor, currency);
    }
}

Money price = new Money(100, "USD");
Money tax = price.multiply(0.1);        // New object
Money total = price.add(tax);           // New object
// price is still $100 — never modified!
```

```python
from dataclasses import dataclass

@dataclass(frozen=True)  # Immutable
class Money:
    amount: float
    currency: str

    def add(self, other):
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

    def multiply(self, factor):
        return Money(self.amount * factor, self.currency)

price = Money(100, "USD")
tax = price.multiply(0.1)    # New object
total = price.add(tax)       # New object
# price is still $100 — never modified!
print(total.amount)  # 110.0
```

```javascript
class Money {
  #amount;
  #currency;

  constructor(amount, currency) {
    this.#amount = amount;
    this.#currency = currency;
    Object.freeze(this); // Enforce immutability
  }

  get amount() { return this.#amount; }
  get currency() { return this.#currency; }

  // "Modification" returns new object (FP style)
  add(other) {
    if (this.#currency !== other.currency) {
      throw new Error("Currency mismatch");
    }
    return new Money(this.#amount + other.amount, this.#currency);
  }

  multiply(factor) {
    return new Money(this.#amount * factor, this.#currency);
  }
}

const price = new Money(100, "USD");
const tax = price.multiply(0.1);    // New object
const total = price.add(tax);       // New object
// price is still $100 — never modified!
console.log(total.amount); // 110
```

---

## Strategy Pattern vs Higher-Order Functions

The Strategy pattern in OOP has a simpler FP equivalent:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>

// OOP Strategy Pattern
class SortStrategy {
public:
    virtual void sort(std::vector<int>& arr) = 0;
    virtual ~SortStrategy() = default;
};

// FP equivalent — just pass a function!
void processData(std::vector<int>& data,
                 std::function<void(std::vector<int>&)> sortFn) {
    sortFn(data);
}

int main() {
    std::vector<int> data = {5, 3, 8, 1, 2};
    processData(data, [](std::vector<int>& v) {
        std::sort(v.begin(), v.end());
    });
    // data is now sorted: [1, 2, 3, 5, 8]
}
```

```csharp
using System;
using System.Collections.Generic;

// OOP Strategy Pattern
public interface ISortStrategy
{
    void Sort(List<int> arr);
}
// class QuickSort : ISortStrategy { ... }

// FP equivalent — just pass a delegate/Action!
void ProcessData(List<int> data, Action<List<int>> sortFn)
{
    sortFn(data);
}

var data = new List<int> { 5, 3, 8, 1, 2 };
ProcessData(data, list => list.Sort());
// data is now sorted: [1, 2, 3, 5, 8]
```

```java
// OOP Strategy Pattern
interface SortStrategy {
    void sort(int[] arr);
}
// class QuickSort implements SortStrategy { ... }
// class MergeSort implements SortStrategy { ... }

// FP equivalent — just pass a function!
void processData(int[] data, Consumer<int[]> sortFunction) {
    sortFunction.accept(data);
}

processData(data, Arrays::sort);  // Pass any sort function
```

```python
# OOP: Strategy class
class UpperFormatter:
    def format(self, text):
        return text.upper()

class LowerFormatter:
    def format(self, text):
        return text.lower()

# FP: Just a function — no class needed!
def format_text(text, formatter):
    return formatter(text)

result = format_text("hello", str.upper)  # Pass function directly
print(result)  # HELLO
```

```javascript
// OOP: Strategy class
class UpperFormatter {
  format(text) {
    return text.toUpperCase();
  }
}

class LowerFormatter {
  format(text) {
    return text.toLowerCase();
  }
}

// FP: Just a function — no class needed!
function formatText(text, formatter) {
  return formatter(text);
}

const result = formatText("hello", (t) => t.toUpperCase());
console.log(result); // HELLO
```

---

## Functional Features with LINQ and Delegates (C#)

C# has rich FP support built into the language:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

// Func<> and Action<> delegates replace strategy interfaces
Func<int, int, int> add = (a, b) => a + b;
Func<int, bool> isEven = n => n % 2 == 0;
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");

// LINQ: powerful FP pipeline over collections
var numbers = Enumerable.Range(1, 20);

var result = numbers
    .Where(isEven)                        // Filter
    .Select(n => n * n)                   // Map
    .Aggregate(0, (acc, n) => acc + n);   // Reduce

Console.WriteLine(result); // Sum of squares of even numbers 1-20

// Pattern matching (C# 8+) — FP-style type dispatch
string Describe(object obj) => obj switch
{
    int i when i > 0 => $"Positive integer: {i}",
    string s         => $"String of length {s.Length}",
    null             => "Nothing",
    _                => "Something else"
};
```

---

## When to Use Each

| Approach | Best For |
|----------|---------|
| **OOP** | Complex domain models, stateful systems, large teams |
| **FP** | Data transformations, pipelines, concurrency |
| **Both** | Most real-world applications |

---

## Key Takeaways

- OOP and FP are **complementary**, not competing paradigms
- Modern languages (Java, Python, C++, JavaScript) blend both
- Use **immutable objects** for thread safety and predictability
- **Streams/lambdas** bring FP elegance to OOP collections
- Many **design patterns** simplify to functions in FP
- The best developers know when to use **each approach**

Next: **OOP and Domain-Driven Design** — modelling real-world domains.
