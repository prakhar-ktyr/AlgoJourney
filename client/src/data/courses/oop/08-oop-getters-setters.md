---
title: Getters and Setters
---

# Getters and Setters

**Getters** and **setters** are methods that provide controlled access to an object's private attributes. They are the practical tools of encapsulation.

---

## The Problem

If attributes are `public`, anyone can set invalid values:

```cpp
class Person {
public:
    int age;
};

Person p;
p.age = -50;   // Nonsense, but allowed!
p.age = 9999;  // Also allowed — no validation
```

```csharp
class Person
{
    public int Age;
}

Person p = new Person();
p.Age = -50;   // Nonsense, but allowed!
p.Age = 9999;  // Also allowed — no validation
```

```java
public class Person {
    public int age;
}

Person p = new Person();
p.age = -50;   // Nonsense, but allowed!
p.age = 9999;  // Also allowed — no validation
```

```python
class Person:
    def __init__(self):
        self.age = 0

p = Person()
p.age = -50   # Nonsense, but allowed!
p.age = 9999  # Also allowed — no validation
```

```javascript
class Person {
    constructor() {
        this.age = 0;
    }
}

const p = new Person();
p.age = -50;   // Nonsense, but allowed!
p.age = 9999;  // Also allowed — no validation
```

**Getters and setters** are the solution — they give controlled access.

---

## What Are They?

| Method | Purpose | Naming (Java/C++) |
|--------|---------|-------------------|
| **Getter** | Read an attribute's value | `getAttributeName()` |
| **Setter** | Modify an attribute's value (with validation) | `setAttributeName(value)` |

---

## Basic Example

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
using namespace std;

class Person {
private:
    string name;
    int age;

public:
    string getName() {
        return name;
    }

    void setName(string name) {
        if (name.empty()) {
            throw invalid_argument("Name cannot be empty");
        }
        this->name = name;
    }

    int getAge() {
        return age;
    }

    void setAge(int age) {
        if (age < 0 || age > 150) {
            throw invalid_argument("Age must be 0-150");
        }
        this->age = age;
    }
};

int main() {
    Person p;
    p.setName("Alice");
    p.setAge(25);

    cout << p.getName() << endl;  // Alice
    cout << p.getAge() << endl;   // 25

    // p.setAge(-5);  // ❌ Throws exception!
    return 0;
}
```

```csharp
using System;

class Person
{
    private string name;
    private int age;

    public string Name
    {
        get { return name; }
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Name cannot be empty");
            name = value.Trim();
        }
    }

    public int Age
    {
        get { return age; }
        set
        {
            if (value < 0 || value > 150)
                throw new ArgumentException("Age must be 0-150");
            age = value;
        }
    }
}

class Program
{
    static void Main()
    {
        Person p = new Person();
        p.Name = "Alice";
        p.Age = 25;

        Console.WriteLine(p.Name);  // Alice
        Console.WriteLine(p.Age);   // 25

        // p.Age = -5;  // ❌ Throws exception!
    }
}
```

```java
public class Person {
    private String name;
    private int age;

    // Getter for name
    public String getName() {
        return name;
    }

    // Setter for name
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        this.name = name.trim();
    }

    // Getter for age
    public int getAge() {
        return age;
    }

    // Setter for age
    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Age must be 0-150");
        }
        this.age = age;
    }

    public static void main(String[] args) {
        Person p = new Person();
        p.setName("Alice");
        p.setAge(25);

        System.out.println(p.getName());  // Alice
        System.out.println(p.getAge());   // 25

        // p.setAge(-5);  // ❌ Throws exception!
    }
}
```

```python
class Person:
    def __init__(self, name, age):
        self.name = name   # Calls the setter
        self.age = age     # Calls the setter

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not value or not value.strip():
            raise ValueError("Name cannot be empty")
        self._name = value.strip()

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0 or value > 150:
            raise ValueError("Age must be 0-150")
        self._age = value

p = Person("Alice", 25)
print(p.name)    # Alice  — calls the getter
print(p.age)     # 25

p.age = 30       # Calls the setter
# p.age = -5     # ❌ Raises ValueError
```

```javascript
class Person {
    #name;
    #age;

    constructor(name, age) {
        this.name = name;  // Calls the setter
        this.age = age;    // Calls the setter
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (!value || !value.trim()) {
            throw new Error("Name cannot be empty");
        }
        this.#name = value.trim();
    }

    get age() {
        return this.#age;
    }

    set age(value) {
        if (value < 0 || value > 150) {
            throw new Error("Age must be 0-150");
        }
        this.#age = value;
    }
}

const p = new Person("Alice", 25);
console.log(p.name);  // Alice — calls the getter
console.log(p.age);   // 25

p.age = 30;           // Calls the setter
// p.age = -5;        // ❌ Throws Error
```

Notice how Python's `@property` and JavaScript's `get`/`set` let you use normal attribute syntax (`p.age = 30`) while still running validation behind the scenes.

---

## Read-Only Properties

Sometimes you want an attribute that can be read but not changed:

```cpp
class Circle {
private:
    double radius;

public:
    Circle(double radius) : radius(radius) {}

    double getRadius() {
        return radius;
        // No setRadius() → radius can't be changed after creation
    }

    double getArea() {
        return 3.14159 * radius * radius;
    }
};

int main() {
    Circle c(5);
    cout << c.getRadius() << endl;  // 5
    cout << c.getArea() << endl;    // 78.5398
    // No way to change radius!
    return 0;
}
```

```csharp
using System;

class Circle
{
    public double Radius { get; }

    public Circle(double radius)
    {
        Radius = radius;
    }

    public double Area => Math.PI * Radius * Radius;
}

class Program
{
    static void Main()
    {
        Circle c = new Circle(5);
        Console.WriteLine(c.Radius);  // 5
        Console.WriteLine(c.Area);    // 78.5398...
        // c.Radius = 10;  // ❌ Compile error — read-only!
    }
}
```

```java
public class Circle {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    public double getRadius() {
        return radius;
        // No setRadius() → radius can't be changed after creation
    }

    public double getArea() {
        return Math.PI * radius * radius;
    }

    public static void main(String[] args) {
        Circle c = new Circle(5);
        System.out.println(c.getRadius());  // 5.0
        System.out.println(c.getArea());    // 78.53...
        // c.setRadius(10);  // ❌ Method doesn't exist
    }
}
```

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

c = Circle(5)
print(c.radius)  # 5
print(c.area)    # 78.53975
# c.radius = 10  # ❌ AttributeError: can't set attribute
```

```javascript
class Circle {
    #radius;

    constructor(radius) {
        this.#radius = radius;
    }

    get radius() {
        return this.#radius;
    }

    get area() {
        return Math.PI * this.#radius ** 2;
    }
}

const c = new Circle(5);
console.log(c.radius);  // 5
console.log(c.area);    // 78.5398...
// c.radius = 10;       // Silently ignored (no setter defined)
```

---

## Computed Properties

A getter doesn't have to return a stored value — it can **compute** the result:

```cpp
class Rectangle {
private:
    double width;
    double height;

public:
    Rectangle(double width, double height)
        : width(width), height(height) {}

    double getWidth() { return width; }
    double getHeight() { return height; }

    // Computed — not stored anywhere
    double getArea() {
        return width * height;
    }

    double getPerimeter() {
        return 2 * (width + height);
    }

    bool isSquare() {
        return width == height;
    }
};
```

```csharp
class Rectangle
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    // Computed — not stored anywhere
    public double Area => Width * Height;
    public double Perimeter => 2 * (Width + Height);
    public bool IsSquare => Width == Height;
}
```

```java
public class Rectangle {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    public double getWidth() { return width; }
    public double getHeight() { return height; }

    // Computed — not stored anywhere
    public double getArea() {
        return width * height;
    }

    public double getPerimeter() {
        return 2 * (width + height);
    }

    public boolean isSquare() {
        return width == height;
    }
}
```

```python
class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height

    @property
    def area(self):
        return self._width * self._height

    @property
    def perimeter(self):
        return 2 * (self._width + self._height)

    @property
    def is_square(self):
        return self._width == self._height

r = Rectangle(5, 5)
print(r.area)       # 25
print(r.is_square)  # True
```

```javascript
class Rectangle {
    #width;
    #height;

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
    }

    get area() {
        return this.#width * this.#height;
    }

    get perimeter() {
        return 2 * (this.#width + this.#height);
    }

    get isSquare() {
        return this.#width === this.#height;
    }
}

const r = new Rectangle(5, 5);
console.log(r.area);       // 25
console.log(r.isSquare);   // true
```

---

## Boolean Getters

For `boolean` attributes, Java uses `is` instead of `get`:

```cpp
class User {
private:
    bool active;
    bool admin;

public:
    bool isActive() { return active; }
    bool isAdmin() { return admin; }

    void setActive(bool active) {
        this->active = active;
    }
};
```

```csharp
class User
{
    public bool IsActive { get; set; }
    public bool IsAdmin { get; private set; }
}

User u = new User();
u.IsActive = true;
Console.WriteLine(u.IsActive);  // True
```

```java
public class User {
    private boolean active;
    private boolean admin;

    // Boolean getter uses "is" prefix
    public boolean isActive() {
        return active;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

User u = new User();
u.setActive(true);
System.out.println(u.isActive());  // true
```

```python
class User:
    def __init__(self):
        self._active = False
        self._admin = False

    @property
    def is_active(self):
        return self._active

    @is_active.setter
    def is_active(self, value):
        self._active = value

    @property
    def is_admin(self):
        return self._admin

u = User()
u.is_active = True
print(u.is_active)  # True
```

```javascript
class User {
    #active = false;
    #admin = false;

    get isActive() {
        return this.#active;
    }

    set isActive(value) {
        this.#active = value;
    }

    get isAdmin() {
        return this.#admin;
    }
}

const u = new User();
u.isActive = true;
console.log(u.isActive);  // true
```

---

## Setter Side Effects

Setters can do more than just assign a value:

```cpp
class TemperatureSensor {
private:
    double temperature;
    double maxRecorded;

public:
    TemperatureSensor() : temperature(0), maxRecorded(0) {}

    void setTemperature(double temp) {
        temperature = temp;

        if (temp > maxRecorded) {
            maxRecorded = temp;
        }

        if (temp > 100) {
            cout << "WARNING: Temperature critical!" << endl;
        }
    }

    double getTemperature() { return temperature; }
    double getMaxRecorded() { return maxRecorded; }
};
```

```csharp
using System;

class TemperatureSensor
{
    private double temperature;
    private double maxRecorded;

    public double Temperature
    {
        get { return temperature; }
        set
        {
            temperature = value;

            // Side effect: track the highest temperature
            if (value > maxRecorded)
                maxRecorded = value;

            // Side effect: alert if too hot
            if (value > 100)
                Console.WriteLine("WARNING: Temperature critical!");
        }
    }

    public double MaxRecorded => maxRecorded;
}
```

```java
public class TemperatureSensor {
    private double temperature;
    private double maxRecorded;

    public void setTemperature(double temp) {
        this.temperature = temp;

        // Side effect: track the highest temperature
        if (temp > maxRecorded) {
            maxRecorded = temp;
        }

        // Side effect: alert if too hot
        if (temp > 100) {
            System.out.println("WARNING: Temperature critical!");
        }
    }

    public double getTemperature() {
        return temperature;
    }

    public double getMaxRecorded() {
        return maxRecorded;
    }
}
```

```python
class TemperatureSensor:
    def __init__(self):
        self._temperature = 0
        self._max_recorded = 0

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, temp):
        self._temperature = temp

        # Side effect: track the highest temperature
        if temp > self._max_recorded:
            self._max_recorded = temp

        # Side effect: alert if too hot
        if temp > 100:
            print("WARNING: Temperature critical!")

    @property
    def max_recorded(self):
        return self._max_recorded
```

```javascript
class TemperatureSensor {
    #temperature = 0;
    #maxRecorded = 0;

    get temperature() {
        return this.#temperature;
    }

    set temperature(temp) {
        this.#temperature = temp;

        // Side effect: track the highest temperature
        if (temp > this.#maxRecorded) {
            this.#maxRecorded = temp;
        }

        // Side effect: alert if too hot
        if (temp > 100) {
            console.log("WARNING: Temperature critical!");
        }
    }

    get maxRecorded() {
        return this.#maxRecorded;
    }
}
```

---

## When to Use Getters/Setters

| Situation | Use |
|-----------|-----|
| Attribute needs **validation** | Setter with checks |
| Attribute is **read-only** | Getter only |
| Attribute is **write-only** (rare) | Setter only |
| Attribute is **derived/computed** | Getter that calculates |
| Simple data transfer object | Direct access may be fine |

---

## Properties (C#)

C# has first-class **property** syntax that combines getters and setters into a single concise declaration. This is one of C#'s most distinctive OOP features.

### Auto-Properties

When no validation is needed, use auto-properties — the compiler generates the backing field:

```csharp
class Person
{
    public string Name { get; set; }        // Read + write
    public int Age { get; set; }            // Read + write
    public string Id { get; private set; }  // Read from outside, write only inside
    public DateTime Created { get; }        // Read-only (set only in constructor)

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
        Id = Guid.NewGuid().ToString();
        Created = DateTime.Now;
    }
}
```

### Init-Only Properties (C# 9+)

Allow setting only during object initialization:

```csharp
class Config
{
    public string Host { get; init; }
    public int Port { get; init; }
}

var config = new Config { Host = "localhost", Port = 8080 };
// config.Host = "other";  // ❌ Compile error — init-only!
```

### Expression-Bodied Properties

For computed properties, use the `=>` syntax:

```csharp
class Circle
{
    public double Radius { get; }
    public double Area => Math.PI * Radius * Radius;
    public double Circumference => 2 * Math.PI * Radius;

    public Circle(double radius) => Radius = radius;
}
```

---

## Descriptors (Python)

Python **descriptors** are the mechanism behind `@property`. Any object that defines `__get__`, `__set__`, or `__delete__` is a descriptor:

```python
class RangeValidator:
    """Reusable descriptor that enforces min/max constraints."""
    def __init__(self, min_val=None, max_val=None):
        self.min_val = min_val
        self.max_val = max_val

    def __set_name__(self, owner, name):
        self.attr_name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.attr_name)

    def __set__(self, obj, value):
        if self.min_val is not None and value < self.min_val:
            raise ValueError(f"{self.attr_name} must be >= {self.min_val}")
        if self.max_val is not None and value > self.max_val:
            raise ValueError(f"{self.attr_name} must be <= {self.max_val}")
        obj.__dict__[self.attr_name] = value

    def __delete__(self, obj):
        del obj.__dict__[self.attr_name]

class Student:
    age = RangeValidator(min_val=0, max_val=130)
    grade = RangeValidator(min_val=0, max_val=100)

    def __init__(self, name, age, grade):
        self.name = name
        self.age = age      # Triggers __set__
        self.grade = grade  # Triggers __set__

s = Student("Alice", 20, 95)
# s.age = -1    # ValueError: age must be >= 0
# s.grade = 150 # ValueError: grade must be <= 100
```

Descriptors let you write validation logic **once** and reuse it across many attributes and classes — unlike `@property`, which must be repeated per attribute.

---

## Key Takeaways

- **Getters** read private attributes; **setters** write them with validation
- Naming: `getX()` / `setX()` (Java/C++), `@property` (Python), `get`/`set` (JavaScript), `{ get; set; }` (C#)
- Use **read-only** properties for values that shouldn't change after creation
- **Computed properties** calculate values instead of storing them
- Setters can perform **side effects** like logging, validation, or notifications
- Always prefer `private` attributes + getters/setters over `public` attributes
- C# **auto-properties** (`{ get; set; }`) are the most concise approach when no validation is needed

Next: **Encapsulation** — bringing together access modifiers and getters/setters into a complete design principle.
