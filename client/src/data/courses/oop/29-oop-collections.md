---
title: Collections and OOP
---

# Collections and OOP

Collections (lists, sets, maps) are a cornerstone of programming. Understanding how they work with OOP principles — generics, polymorphism, and interfaces — is essential for real-world development.

---

## The Collections Framework

```
Java Collections:
Iterable
  └── Collection
        ├── List (ordered, duplicates allowed)
        │     ├── ArrayList
        │     ├── LinkedList
        │     └── Vector
        ├── Set (no duplicates)
        │     ├── HashSet
        │     ├── LinkedHashSet
        │     └── TreeSet
        └── Queue
              ├── PriorityQueue
              └── ArrayDeque

Map (key-value pairs)
  ├── HashMap
  ├── LinkedHashMap
  └── TreeMap
```

---

## Lists — Ordered Collections

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

class Student {
public:
    std::string name;
    double gpa;

    Student(std::string name, double gpa) : name(name), gpa(gpa) {}
};

std::vector<Student> students;
students.push_back(Student("Alice", 3.8));
students.push_back(Student("Bob", 3.2));
students.push_back(Student("Charlie", 3.5));

// Iterate
for (const auto& s : students) {
    std::cout << s.name << ": " << s.gpa << std::endl;
}

// Sort by GPA
std::sort(students.begin(), students.end(),
    [](const Student& a, const Student& b) { return a.gpa < b.gpa; });
```

```csharp
using System;
using System.Collections.Generic;

class Student
{
    public string Name { get; }
    public double Gpa { get; }
    public Student(string name, double gpa) { Name = name; Gpa = gpa; }
}

var students = new List<Student>
{
    new Student("Alice", 3.8),
    new Student("Bob", 3.2),
    new Student("Charlie", 3.5),
};

// Iterate
foreach (var s in students)
    Console.WriteLine($"{s.Name}: {s.Gpa}");

// Sort by GPA
students.Sort((a, b) => a.Gpa.CompareTo(b.Gpa));
```

```java
import java.util.ArrayList;
import java.util.List;

// Generic list of custom objects
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 3.8));
students.add(new Student("Bob", 3.2));
students.add(new Student("Charlie", 3.5));

// Iterate
for (Student s : students) {
    System.out.println(s.getName() + ": " + s.getGpa());
}

// Sort using Comparable
students.sort(null);  // Uses Student's compareTo()
```

```python
students = [
    Student("Alice", 3.8),
    Student("Bob", 3.2),
    Student("Charlie", 3.5),
]

for s in students:
    print(f"{s.name}: {s.gpa}")

# Sort using key function
students.sort(key=lambda s: s.gpa)
```

```javascript
const students = [
  new Student("Alice", 3.8),
  new Student("Bob", 3.2),
  new Student("Charlie", 3.5),
];

for (const s of students) {
  console.log(`${s.name}: ${s.gpa}`);
}

// Sort by GPA
students.sort((a, b) => a.gpa - b.gpa);
```

---

## Polymorphism with Collections

Store different subtypes in a single collection:

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <cmath>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string typeName() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return M_PI * radius * radius; }
    std::string typeName() const override { return "Circle"; }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
    std::string typeName() const override { return "Rectangle"; }
};

std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(5));
shapes.push_back(std::make_unique<Rectangle>(4, 6));

double totalArea = 0;
for (const auto& s : shapes) {
    totalArea += s->area();
    std::cout << s->typeName() << ": " << s->area() << std::endl;
}
std::cout << "Total area: " << totalArea << std::endl;
```

```csharp
using System;
using System.Collections.Generic;

abstract class Shape
{
    public abstract double Area();
    public abstract string TypeName { get; }
}

class Circle : Shape
{
    private double radius;
    public Circle(double r) => radius = r;
    public override double Area() => Math.PI * radius * radius;
    public override string TypeName => "Circle";
}

class Rectangle : Shape
{
    private double width, height;
    public Rectangle(double w, double h) { width = w; height = h; }
    public override double Area() => width * height;
    public override string TypeName => "Rectangle";
}

var shapes = new List<Shape> { new Circle(5), new Rectangle(4, 6) };

double totalArea = 0;
foreach (var s in shapes)
{
    totalArea += s.Area();
    Console.WriteLine($"{s.TypeName}: {s.Area()}");
}
Console.WriteLine($"Total area: {totalArea}");
```

```java
List<Shape> shapes = new ArrayList<>();
shapes.add(new Circle(5));
shapes.add(new Rectangle(4, 6));
shapes.add(new Triangle(3, 8));

// Polymorphic iteration — each shape's area() is called correctly
double totalArea = 0;
for (Shape s : shapes) {
    totalArea += s.area();
    System.out.println(s.getClass().getSimpleName() + ": " + s.area());
}
System.out.println("Total area: " + totalArea);
```

```python
import math

shapes = [
    Circle(5),
    Rectangle(4, 6),
    Triangle(3, 8),
]

# Polymorphic iteration
total_area = 0
for s in shapes:
    total_area += s.area()
    print(f"{type(s).__name__}: {s.area()}")
print(f"Total area: {total_area}")
```

```javascript
const shapes = [
  new Circle(5),
  new Rectangle(4, 6),
  new Triangle(3, 8),
];

// Polymorphic iteration
let totalArea = 0;
for (const s of shapes) {
  totalArea += s.area();
  console.log(`${s.constructor.name}: ${s.area()}`);
}
console.log(`Total area: ${totalArea}`);
```

---

## Maps — Key-Value Pairs

```cpp
#include <iostream>
#include <unordered_map>
#include <string>

std::unordered_map<int, Student> studentMap;
studentMap[101] = Student("Alice", 3.8);
studentMap[102] = Student("Bob", 3.2);
studentMap[103] = Student("Charlie", 3.5);

// Lookup
auto& alice = studentMap[101];
std::cout << alice.name << std::endl;  // Alice

// Iterate over entries
for (const auto& [id, student] : studentMap) {
    std::cout << "ID " << id << ": " << student.name << std::endl;
}
```

```csharp
using System;
using System.Collections.Generic;

var studentMap = new Dictionary<int, Student>
{
    [101] = new Student("Alice", 3.8),
    [102] = new Student("Bob", 3.2),
    [103] = new Student("Charlie", 3.5),
};

// Lookup
var alice = studentMap[101];
Console.WriteLine(alice.Name);  // Alice

// Iterate over entries
foreach (var (id, student) in studentMap)
    Console.WriteLine($"ID {id}: {student.Name}");
```

```java
import java.util.HashMap;
import java.util.Map;

// Map from student ID to Student object
Map<Integer, Student> studentMap = new HashMap<>();
studentMap.put(101, new Student("Alice", 3.8));
studentMap.put(102, new Student("Bob", 3.2));
studentMap.put(103, new Student("Charlie", 3.5));

// Lookup
Student alice = studentMap.get(101);
System.out.println(alice.getName());  // Alice

// Iterate over entries
for (Map.Entry<Integer, Student> entry : studentMap.entrySet()) {
    System.out.println("ID " + entry.getKey()
        + ": " + entry.getValue().getName());
}
```

```python
student_map = {
    101: Student("Alice", 3.8),
    102: Student("Bob", 3.2),
    103: Student("Charlie", 3.5),
}

alice = student_map[101]
print(alice.name)  # Alice

for id, student in student_map.items():
    print(f"ID {id}: {student.name}")
```

```javascript
const studentMap = new Map();
studentMap.set(101, new Student("Alice", 3.8));
studentMap.set(102, new Student("Bob", 3.2));
studentMap.set(103, new Student("Charlie", 3.5));

// Lookup
const alice = studentMap.get(101);
console.log(alice.name);  // Alice

// Iterate over entries
for (const [id, student] of studentMap) {
  console.log(`ID ${id}: ${student.name}`);
}
```

---

## Sets — No Duplicates

For sets to work correctly with custom objects, your class must implement equality and hashing:

```cpp
#include <iostream>
#include <unordered_set>

struct Student {
    std::string name;
    double gpa;

    bool operator==(const Student& other) const {
        return name == other.name && gpa == other.gpa;
    }
};

struct StudentHash {
    size_t operator()(const Student& s) const {
        return std::hash<std::string>()(s.name) ^ std::hash<double>()(s.gpa);
    }
};

std::unordered_set<Student, StudentHash> honors;
Student alice1{"Alice", 3.8};
Student alice2{"Alice", 3.8};

honors.insert(alice1);
honors.insert(alice2);  // Duplicate detected
std::cout << honors.size() << std::endl;  // 1 ✅
```

```csharp
using System;
using System.Collections.Generic;

class Student : IEquatable<Student>
{
    public string Name { get; }
    public double Gpa { get; }
    public Student(string name, double gpa) { Name = name; Gpa = gpa; }

    public bool Equals(Student? other)
        => other != null && Name == other.Name && Gpa == other.Gpa;
    public override bool Equals(object? obj) => Equals(obj as Student);
    public override int GetHashCode() => HashCode.Combine(Name, Gpa);
}

var honors = new HashSet<Student>();
honors.Add(new Student("Alice", 3.8));
honors.Add(new Student("Alice", 3.8));  // Duplicate detected
Console.WriteLine(honors.Count);  // 1 ✅
```

```java
Set<Student> honors = new HashSet<>();
Student alice1 = new Student("Alice", 3.8);
Student alice2 = new Student("Alice", 3.8);

honors.add(alice1);
honors.add(alice2);

// Without equals/hashCode: size = 2 (both added)
// With equals/hashCode:    size = 1 (duplicate detected)
System.out.println(honors.size());
```

```python
class Student:
    def __init__(self, name, gpa):
        self.name = name
        self.gpa = gpa

    def __eq__(self, other):
        return self.name == other.name and self.gpa == other.gpa

    def __hash__(self):
        return hash((self.name, self.gpa))

honors = set()
honors.add(Student("Alice", 3.8))
honors.add(Student("Alice", 3.8))  # Duplicate detected
print(len(honors))  # 1 ✅
```

```javascript
// JavaScript Set uses reference identity by default.
// For value-based deduplication, use a Map with a string key:
class Student {
  constructor(name, gpa) {
    this.name = name;
    this.gpa = gpa;
  }
  hashKey() {
    return `${this.name}:${this.gpa}`;
  }
}

const honorsMap = new Map();
const alice1 = new Student("Alice", 3.8);
const alice2 = new Student("Alice", 3.8);

honorsMap.set(alice1.hashKey(), alice1);
honorsMap.set(alice2.hashKey(), alice2);  // Overwrites (same key)
console.log(honorsMap.size);  // 1 ✅
```

---

## Custom Sorting

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

std::vector<Student> students = {
    {"Charlie", 3.5}, {"Alice", 3.8}, {"Bob", 3.2}
};

// Sort by GPA (descending)
std::sort(students.begin(), students.end(),
    [](const Student& a, const Student& b) { return a.gpa > b.gpa; });

// Sort by name
std::sort(students.begin(), students.end(),
    [](const Student& a, const Student& b) { return a.name < b.name; });
```

```csharp
using System;
using System.Collections.Generic;

var students = new List<Student>
{
    new("Charlie", 3.5), new("Alice", 3.8), new("Bob", 3.2)
};

// Sort by GPA (descending)
students.Sort((a, b) => b.Gpa.CompareTo(a.Gpa));

// Sort by name
students.Sort((a, b) => string.Compare(a.Name, b.Name, StringComparison.Ordinal));

// Multiple criteria: by GPA desc, then name asc
students.Sort((a, b) =>
{
    int cmp = b.Gpa.CompareTo(a.Gpa);
    return cmp != 0 ? cmp : string.Compare(a.Name, b.Name, StringComparison.Ordinal);
});
```

```java
List<Student> students = new ArrayList<>();
students.add(new Student("Charlie", 3.5));
students.add(new Student("Alice", 3.8));
students.add(new Student("Bob", 3.2));

// Sort by GPA (descending)
students.sort((s1, s2) -> Double.compare(s2.getGpa(), s1.getGpa()));

// Sort by name
students.sort((s1, s2) -> s1.getName().compareTo(s2.getName()));

// Using Comparator static methods
students.sort(Comparator.comparing(Student::getName));
students.sort(Comparator.comparing(Student::getGpa).reversed());
```

```python
# Sort by GPA descending
students.sort(key=lambda s: s.gpa, reverse=True)

# Sort by name
students.sort(key=lambda s: s.name)

# Multiple criteria: by GPA desc, then name asc
students.sort(key=lambda s: (-s.gpa, s.name))
```

```javascript
const students = [
  new Student("Charlie", 3.5),
  new Student("Alice", 3.8),
  new Student("Bob", 3.2),
];

// Sort by GPA (descending)
students.sort((a, b) => b.gpa - a.gpa);

// Sort by name
students.sort((a, b) => a.name.localeCompare(b.name));

// Multiple criteria: by GPA desc, then name asc
students.sort((a, b) => b.gpa - a.gpa || a.name.localeCompare(b.name));
```

---

## Streams and Functional Operations (Java 8+)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

std::vector<Student> students = {
    {"Alice", 3.8}, {"Bob", 3.2}, {"Charlie", 3.5},
    {"Diana", 2.9}, {"Eve", 3.7}
};

// Filter students with GPA >= 3.5
std::vector<Student> honors;
std::copy_if(students.begin(), students.end(), std::back_inserter(honors),
    [](const Student& s) { return s.gpa >= 3.5; });

// Average GPA
double avgGpa = std::accumulate(students.begin(), students.end(), 0.0,
    [](double sum, const Student& s) { return sum + s.gpa; }) / students.size();
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student>
{
    new("Alice", 3.8), new("Bob", 3.2), new("Charlie", 3.5),
    new("Diana", 2.9), new("Eve", 3.7)
};

// Filter students with GPA >= 3.5
var honors = students.Where(s => s.Gpa >= 3.5).ToList();

// Get names of honor students
var honorNames = students
    .Where(s => s.Gpa >= 3.5)
    .Select(s => s.Name)
    .OrderBy(n => n)
    .ToList();

// Average GPA
double avgGpa = students.Average(s => s.Gpa);

// Group by GPA range
var grouped = students
    .GroupBy(s => s.Gpa >= 3.5 ? "Honors" : "Regular")
    .ToDictionary(g => g.Key, g => g.ToList());
```

```java
List<Student> students = List.of(
    new Student("Alice", 3.8),
    new Student("Bob", 3.2),
    new Student("Charlie", 3.5),
    new Student("Diana", 2.9),
    new Student("Eve", 3.7)
);

// Filter students with GPA >= 3.5
List<Student> honors = students.stream()
    .filter(s -> s.getGpa() >= 3.5)
    .collect(Collectors.toList());

// Get names of honor students
List<String> honorNames = students.stream()
    .filter(s -> s.getGpa() >= 3.5)
    .map(Student::getName)
    .sorted()
    .collect(Collectors.toList());

// Average GPA
double avgGpa = students.stream()
    .mapToDouble(Student::getGpa)
    .average()
    .orElse(0.0);

// Group by GPA range
Map<String, List<Student>> grouped = students.stream()
    .collect(Collectors.groupingBy(s ->
        s.getGpa() >= 3.5 ? "Honors" : "Regular"
    ));
```

```python
students = [
    Student("Alice", 3.8),
    Student("Bob", 3.2),
    Student("Charlie", 3.5),
    Student("Diana", 2.9),
    Student("Eve", 3.7),
]

# Filter
honors = [s for s in students if s.gpa >= 3.5]

# Map
honor_names = sorted([s.name for s in students if s.gpa >= 3.5])

# Average
avg_gpa = sum(s.gpa for s in students) / len(students)

# Group by
from itertools import groupby
key_fn = lambda s: "Honors" if s.gpa >= 3.5 else "Regular"
grouped = {k: list(v) for k, v in groupby(sorted(students, key=key_fn), key_fn)}
```

```javascript
const students = [
  new Student("Alice", 3.8),
  new Student("Bob", 3.2),
  new Student("Charlie", 3.5),
  new Student("Diana", 2.9),
  new Student("Eve", 3.7),
];

// Filter
const honors = students.filter((s) => s.gpa >= 3.5);

// Map
const honorNames = students
  .filter((s) => s.gpa >= 3.5)
  .map((s) => s.name)
  .sort();

// Average
const avgGpa = students.reduce((sum, s) => sum + s.gpa, 0) / students.length;

// Group by
const grouped = Object.groupBy(students, (s) =>
  s.gpa >= 3.5 ? "Honors" : "Regular"
);
```

---

## LINQ — Language Integrated Query (C#)

C#’s LINQ provides SQL-like query syntax directly in the language:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student>
{
    new("Alice", 3.8), new("Bob", 3.2), new("Charlie", 3.5),
    new("Diana", 2.9), new("Eve", 3.7)
};

// Query syntax (SQL-like)
var honors = from s in students
             where s.Gpa >= 3.5
             orderby s.Name
             select s;

// Method syntax (fluent API) — equivalent
var honors2 = students
    .Where(s => s.Gpa >= 3.5)
    .OrderBy(s => s.Name);

// Group by
var grouped = students
    .GroupBy(s => s.Gpa >= 3.5 ? "Honors" : "Regular")
    .ToDictionary(g => g.Key, g => g.ToList());
```

LINQ works with any `IEnumerable<T>`, making it a universal query tool for collections, databases (Entity Framework), XML, and more.

---

## Implementing Iterable (Custom Collection)

Make your class work with for-each loops:

```cpp
#include <iostream>

class NumberRange {
    int start, end;

public:
    NumberRange(int start, int end) : start(start), end(end) {}

    // Iterator class
    class Iterator {
        int current;
    public:
        Iterator(int val) : current(val) {}
        int operator*() const { return current; }
        Iterator& operator++() { ++current; return *this; }
        bool operator!=(const Iterator& other) const { return current != other.current; }
    };

    Iterator begin() const { return Iterator(start); }
    Iterator end() const { return Iterator(end + 1); }
};

// Now works with range-based for!
for (int n : NumberRange(1, 5)) {
    std::cout << n << " ";
}
// 1 2 3 4 5
```

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

class NumberRange : IEnumerable<int>
{
    private int start, end;

    public NumberRange(int start, int end)
    {
        this.start = start;
        this.end = end;
    }

    public IEnumerator<int> GetEnumerator()
    {
        for (int i = start; i <= end; i++)
            yield return i;
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// Now works with foreach!
foreach (int n in new NumberRange(1, 5))
    Console.Write($"{n} ");
// 1 2 3 4 5
```

```java
import java.util.Iterator;

class NumberRange implements Iterable<Integer> {
    private int start;
    private int end;

    NumberRange(int start, int end) {
        this.start = start;
        this.end = end;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            int current = start;

            @Override
            public boolean hasNext() {
                return current <= end;
            }

            @Override
            public Integer next() {
                return current++;
            }
        };
    }
}

// Now works with for-each!
for (int n : new NumberRange(1, 5)) {
    System.out.print(n + " ");
}
// 1 2 3 4 5
```

```python
class NumberRange:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __iter__(self):
        self.current = self.start
        return self

    def __next__(self):
        if self.current > self.end:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

for n in NumberRange(1, 5):
    print(n, end=" ")
# 1 2 3 4 5
```

```javascript
class NumberRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  // Make iterable with Symbol.iterator
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      },
    };
  }
}

// Now works with for...of!
for (const n of new NumberRange(1, 5)) {
  process.stdout.write(`${n} `);
}
// 1 2 3 4 5
```

---

## Key Takeaways

- Collections frameworks are built on **interfaces** and **generics** (or templates in C++)
- **Polymorphism** lets you store different subtypes in one collection
- Override `equals()` and `hashCode()` (or `operator==` + hash functor) for correct Set and Map behaviour
- Use `Comparable` / `Comparator` / lambda comparators for sorting
- Streams (Java), list comprehensions (Python), array methods (JS), and STL algorithms (C++) provide functional operations on collections
- Implement `Iterable` / `__iter__` / `Symbol.iterator` to make custom classes work with for-each loops

Next: **UML Class Diagrams** — visualizing class structures and relationships.
