---
title: Static Members
---

# Static Members

**Static members** belong to the **class itself**, not to any particular object. They are shared across all instances of the class.

---

## Instance vs Static

| Feature | Instance Member | Static Member |
|---------|----------------|---------------|
| Belongs to | An object | The class |
| Accessed via | `object.member` | `ClassName.member` |
| Memory | One copy per object | One copy total |
| Can access | Instance + static members | Static members only |
| Keyword | (none) | `static` |

---

## Static Fields (Class Variables)

A static field is shared by all objects of the class:

```cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    string name;
    static int totalStudents;  // Static — shared by all

    Student(string name) : name(name) {
        totalStudents++;
    }
};

int Student::totalStudents = 0;  // Must define static member outside class

int main() {
    Student s1("Alice");
    Student s2("Bob");
    Student s3("Charlie");

    cout << Student::totalStudents << endl;  // 3
}
```

```csharp
using System;

class Student {
    public string Name;
    public static int TotalStudents = 0;  // Static — shared by all

    public Student(string name) {
        Name = name;
        TotalStudents++;
    }
}

Student s1 = new Student("Alice");
Student s2 = new Student("Bob");
Student s3 = new Student("Charlie");

Console.WriteLine(Student.TotalStudents);  // 3
```

```java
class Student {
    String name;              // Instance — unique per student
    static int totalStudents = 0;  // Static — shared by all

    Student(String name) {
        this.name = name;
        totalStudents++;       // Incremented for every new Student
    }
}

Student s1 = new Student("Alice");
Student s2 = new Student("Bob");
Student s3 = new Student("Charlie");

System.out.println(Student.totalStudents);  // 3
// All three share the same counter
```

```python
class Student:
    total_students = 0   # Class variable (static)

    def __init__(self, name):
        self.name = name  # Instance variable
        Student.total_students += 1

s1 = Student("Alice")
s2 = Student("Bob")
s3 = Student("Charlie")

print(Student.total_students)  # 3
```

```javascript
class Student {
    static totalStudents = 0;  // Static — shared by all

    constructor(name) {
        this.name = name;  // Instance — unique per student
        Student.totalStudents++;
    }
}

const s1 = new Student("Alice");
const s2 = new Student("Bob");
const s3 = new Student("Charlie");

console.log(Student.totalStudents);  // 3
```

---

## Static Methods

A static method doesn't need an object to be called. It can only access other static members.

```cpp
#include <iostream>
using namespace std;

class MathHelper {
public:
    static int add(int a, int b) {
        return a + b;
    }

    static int max(int a, int b) {
        return a > b ? a : b;
    }

    static double celsiusToFahrenheit(double c) {
        return c * 9.0 / 5.0 + 32;
    }
};

int main() {
    int sum = MathHelper::add(3, 5);                    // 8
    double temp = MathHelper::celsiusToFahrenheit(100); // 212.0
    cout << sum << endl;
    cout << temp << endl;
}
```

```csharp
using System;

static class MathHelper {
    public static int Add(int a, int b) {
        return a + b;
    }

    public static int Max(int a, int b) {
        return a > b ? a : b;
    }

    public static double CelsiusToFahrenheit(double c) {
        return c * 9.0 / 5.0 + 32;
    }
}

int sum = MathHelper.Add(3, 5);                    // 8
double temp = MathHelper.CelsiusToFahrenheit(100); // 212.0
Console.WriteLine(sum);
Console.WriteLine(temp);
```

```java
class MathHelper {
    static int add(int a, int b) {
        return a + b;
    }

    static int max(int a, int b) {
        return a > b ? a : b;
    }

    static double celsiusToFahrenheit(double c) {
        return c * 9.0 / 5.0 + 32;
    }
}

// Called on the CLASS, not an object
int sum = MathHelper.add(3, 5);          // 8
double temp = MathHelper.celsiusToFahrenheit(100);  // 212.0
```

```python
class MathHelper:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def max_val(a, b):
        return a if a > b else b

    @staticmethod
    def celsius_to_fahrenheit(c):
        return c * 9.0 / 5.0 + 32

print(MathHelper.add(3, 5))                    # 8
print(MathHelper.celsius_to_fahrenheit(100))    # 212.0
```

```javascript
class MathHelper {
    static add(a, b) {
        return a + b;
    }

    static max(a, b) {
        return a > b ? a : b;
    }

    static celsiusToFahrenheit(c) {
        return c * 9.0 / 5.0 + 32;
    }
}

console.log(MathHelper.add(3, 5));                   // 8
console.log(MathHelper.celsiusToFahrenheit(100));    // 212.0
```

---

## Why Use Static?

### 1. Utility Methods

Methods that don't need object state:

```cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

class StringUtils {
public:
    static bool isEmpty(const string& s) {
        return s.empty();
    }

    static string capitalize(const string& s) {
        if (s.empty()) return s;
        string result = s;
        result[0] = toupper(result[0]);
        return result;
    }

    static string reverse(const string& s) {
        string result = s;
        std::reverse(result.begin(), result.end());
        return result;
    }
};

int main() {
    cout << StringUtils::capitalize("hello") << endl;  // Hello
    cout << StringUtils::reverse("hello") << endl;     // olleh
}
```

```csharp
using System;
using System.Linq;

static class StringUtils {
    public static bool IsEmpty(string s) {
        return string.IsNullOrWhiteSpace(s);
    }

    public static string Capitalize(string s) {
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpper(s[0]) + s[1..];
    }

    public static string Reverse(string s) {
        return new string(s.Reverse().ToArray());
    }
}

Console.WriteLine(StringUtils.Capitalize("hello"));  // Hello
Console.WriteLine(StringUtils.Reverse("hello"));     // olleh
```

```java
class StringUtils {
    static boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    static String capitalize(String s) {
        if (isEmpty(s)) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    static String reverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}

System.out.println(StringUtils.capitalize("hello"));  // Hello
System.out.println(StringUtils.reverse("hello"));     // olleh
```

```python
class StringUtils:
    @staticmethod
    def is_empty(s):
        return s is None or s.strip() == ""

    @staticmethod
    def capitalize(s):
        if not s:
            return s
        return s[0].upper() + s[1:]

    @staticmethod
    def reverse(s):
        return s[::-1]

print(StringUtils.capitalize("hello"))  # Hello
print(StringUtils.reverse("hello"))     # olleh
```

```javascript
class StringUtils {
    static isEmpty(s) {
        return !s || s.trim() === "";
    }

    static capitalize(s) {
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    static reverse(s) {
        return s.split("").reverse().join("");
    }
}

console.log(StringUtils.capitalize("hello"));  // Hello
console.log(StringUtils.reverse("hello"));     // olleh
```

### 2. Counters and Shared State

```cpp
#include <iostream>
#include <string>
using namespace std;

class Order {
    static int nextId;
    int orderId;
    string item;

public:
    Order(string item) : item(item) {
        orderId = nextId++;
    }

    void print() {
        cout << "Order #" << orderId << ": " << item << endl;
    }
};

int Order::nextId = 1;

int main() {
    Order o1("Laptop");    // Order #1
    Order o2("Phone");     // Order #2
    Order o3("Tablet");    // Order #3

    o1.print();
    o2.print();
    o3.print();
}
```

```csharp
using System;

class Order {
    private static int nextId = 1;
    private int orderId;
    private string item;

    public Order(string item) {
        this.orderId = nextId++;  // Auto-incrementing ID
        this.item = item;
    }

    public void Print() {
        Console.WriteLine($"Order #{orderId}: {item}");
    }
}

Order o1 = new Order("Laptop");
Order o2 = new Order("Phone");
Order o3 = new Order("Tablet");

o1.Print();  // Order #1: Laptop
o2.Print();  // Order #2: Phone
o3.Print();  // Order #3: Tablet
```

```java
class Order {
    private static int nextId = 1;
    private int orderId;
    private String item;

    Order(String item) {
        this.orderId = nextId++;   // Auto-incrementing ID
        this.item = item;
    }

    void print() {
        System.out.println("Order #" + orderId + ": " + item);
    }
}

Order o1 = new Order("Laptop");    // Order #1
Order o2 = new Order("Phone");     // Order #2
Order o3 = new Order("Tablet");    // Order #3

o1.print();  // Order #1: Laptop
o2.print();  // Order #2: Phone
o3.print();  // Order #3: Tablet
```

```python
class Order:
    _next_id = 1

    def __init__(self, item):
        self.order_id = Order._next_id
        Order._next_id += 1
        self.item = item

    def print_order(self):
        print(f"Order #{self.order_id}: {self.item}")

o1 = Order("Laptop")
o2 = Order("Phone")
o3 = Order("Tablet")

o1.print_order()  # Order #1: Laptop
o2.print_order()  # Order #2: Phone
o3.print_order()  # Order #3: Tablet
```

```javascript
class Order {
    static #nextId = 1;

    constructor(item) {
        this.orderId = Order.#nextId++;
        this.item = item;
    }

    print() {
        console.log(`Order #${this.orderId}: ${this.item}`);
    }
}

const o1 = new Order("Laptop");
const o2 = new Order("Phone");
const o3 = new Order("Tablet");

o1.print();  // Order #1: Laptop
o2.print();  // Order #2: Phone
o3.print();  // Order #3: Tablet
```

### 3. Factory Methods

Static methods that create and return objects:

```cpp
class Color {
    int r, g, b;

    Color(int r, int g, int b) : r(r), g(g), b(b) {}

public:
    // Factory methods — named constructors
    static Color red()   { return Color(255, 0, 0); }
    static Color green() { return Color(0, 255, 0); }
    static Color blue()  { return Color(0, 0, 255); }
};

int main() {
    Color c1 = Color::red();
    Color c2 = Color::blue();
}
```

```csharp
class Color {
    public int R, G, B;

    private Color(int r, int g, int b) {
        R = r; G = g; B = b;
    }

    // Factory methods — named constructors
    public static Color Red() => new Color(255, 0, 0);
    public static Color Green() => new Color(0, 255, 0);
    public static Color Blue() => new Color(0, 0, 255);
    public static Color FromHex(string hex) {
        int r = Convert.ToInt32(hex[1..3], 16);
        int g = Convert.ToInt32(hex[3..5], 16);
        int b = Convert.ToInt32(hex[5..7], 16);
        return new Color(r, g, b);
    }
}

Color c1 = Color.Red();
Color c2 = Color.FromHex("#FF8800");
```

```java
class Color {
    int r, g, b;

    private Color(int r, int g, int b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    // Factory methods — named constructors
    static Color red()   { return new Color(255, 0, 0); }
    static Color green() { return new Color(0, 255, 0); }
    static Color blue()  { return new Color(0, 0, 255); }
    static Color fromHex(String hex) {
        int r = Integer.parseInt(hex.substring(1, 3), 16);
        int g = Integer.parseInt(hex.substring(3, 5), 16);
        int b = Integer.parseInt(hex.substring(5, 7), 16);
        return new Color(r, g, b);
    }
}

Color c1 = Color.red();
Color c2 = Color.fromHex("#FF8800");
```

```python
class Color:
    def __init__(self, r, g, b):
        self.r = r
        self.g = g
        self.b = b

    # Factory methods using classmethod
    @classmethod
    def red(cls):
        return cls(255, 0, 0)

    @classmethod
    def green(cls):
        return cls(0, 255, 0)

    @classmethod
    def blue(cls):
        return cls(0, 0, 255)

    @classmethod
    def from_hex(cls, hex_str):
        r = int(hex_str[1:3], 16)
        g = int(hex_str[3:5], 16)
        b = int(hex_str[5:7], 16)
        return cls(r, g, b)

c1 = Color.red()
c2 = Color.from_hex("#FF8800")
```

```javascript
class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    // Factory methods
    static red()   { return new Color(255, 0, 0); }
    static green() { return new Color(0, 255, 0); }
    static blue()  { return new Color(0, 0, 255); }
    static fromHex(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return new Color(r, g, b);
    }
}

const c1 = Color.red();
const c2 = Color.fromHex("#FF8800");
```

---

## Static Constants

Use static constants for values shared across all instances:

```cpp
class Physics {
public:
    static constexpr double SPEED_OF_LIGHT = 299792458;       // m/s
    static constexpr double GRAVITY = 9.80665;                 // m/s²
    static constexpr double PLANCK_CONSTANT = 6.62607015e-34;  // J·s
};

double force = 10 * Physics::GRAVITY;  // 98.0665
```

```csharp
static class Physics {
    public const double SpeedOfLight = 299_792_458;       // m/s
    public const double Gravity = 9.80665;                 // m/s²
    public const double PlanckConstant = 6.62607015e-34;   // J·s
}

double force = 10 * Physics.Gravity;  // 98.0665
```

```java
class Physics {
    static final double SPEED_OF_LIGHT = 299792458;       // m/s
    static final double GRAVITY = 9.80665;                  // m/s²
    static final double PLANCK_CONSTANT = 6.62607015e-34;  // J·s
}

double force = 10 * Physics.GRAVITY;  // 98.0665
```

```python
class Physics:
    SPEED_OF_LIGHT = 299_792_458       # m/s
    GRAVITY = 9.80665                   # m/s²
    PLANCK_CONSTANT = 6.62607015e-34   # J·s

force = 10 * Physics.GRAVITY  # 98.0665
```

```javascript
class Physics {
    static SPEED_OF_LIGHT = 299_792_458;       // m/s
    static GRAVITY = 9.80665;                   // m/s²
    static PLANCK_CONSTANT = 6.62607015e-34;   // J·s
}

const force = 10 * Physics.GRAVITY;  // 98.0665
```

---

## Common Mistake: Accessing Instance from Static

Static methods **cannot** access instance members:

```cpp
class Example {
public:
    int instanceVar = 10;
    static int staticVar;

    static void staticMethod() {
        cout << staticVar << endl;    // ✅ OK
        // cout << instanceVar;       // ❌ Compile error!
    }

    void instanceMethod() {
        cout << staticVar << endl;    // ✅ OK
        cout << instanceVar << endl;  // ✅ OK
    }
};
```

```csharp
class Example {
    public int instanceVar = 10;
    public static int staticVar = 20;

    public static void StaticMethod() {
        Console.WriteLine(staticVar);    // ✅ OK
        // Console.WriteLine(instanceVar); // ❌ Compile error!
    }

    public void InstanceMethod() {
        Console.WriteLine(staticVar);    // ✅ OK
        Console.WriteLine(instanceVar);  // ✅ OK
    }
}
```

```java
class Example {
    int instanceVar = 10;
    static int staticVar = 20;

    static void staticMethod() {
        System.out.println(staticVar);    // ✅ OK
        // System.out.println(instanceVar); // ❌ Compile error!
    }

    void instanceMethod() {
        System.out.println(staticVar);    // ✅ OK
        System.out.println(instanceVar);  // ✅ OK
    }
}
```

```python
class Example:
    static_var = 20

    def __init__(self):
        self.instance_var = 10

    @staticmethod
    def static_method():
        print(Example.static_var)     # ✅ OK
        # print(self.instance_var)    # ❌ No 'self' available!

    def instance_method(self):
        print(Example.static_var)     # ✅ OK
        print(self.instance_var)      # ✅ OK
```

```javascript
class Example {
    static staticVar = 20;

    constructor() {
        this.instanceVar = 10;
    }

    static staticMethod() {
        console.log(Example.staticVar);  // ✅ OK
        // console.log(this.instanceVar); // ❌ 'this' is the class, not an instance!
    }

    instanceMethod() {
        console.log(Example.staticVar);  // ✅ OK
        console.log(this.instanceVar);   // ✅ OK
    }
}
```

Why? A static method runs without any object. Since instance variables belong to objects, there's no object to read from.

---

## `@classmethod` vs `@staticmethod` (Python)

Python has two kinds of class-level methods:

```python
class MyClass:
    count = 0

    def __init__(self, name):
        self.name = name
        MyClass.count += 1

    @staticmethod
    def utility():
        """No access to class or instance — just a function in a namespace"""
        print("I'm a utility function")

    @classmethod
    def get_count(cls):
        """Receives the class as first argument — can access class variables"""
        return cls.count

    @classmethod
    def create_default(cls):
        """Factory method using classmethod"""
        return cls("Default")

print(MyClass.get_count())     # 0
obj = MyClass.create_default()
print(MyClass.get_count())     # 1
```

| Decorator | First Param | Can Access Class? | Can Access Instance? |
|-----------|------------|-------------------|---------------------|
| `@staticmethod` | None | ❌ (manually) | ❌ |
| `@classmethod` | `cls` | ✅ | ❌ |
| Regular method | `self` | ✅ | ✅ |

---

## Key Takeaways

- **Static fields** are shared across all objects of a class
- **Static methods** don't need an object — called on the class itself
- Use static for **utility methods**, **counters**, **factory methods**, and **constants**
- Static methods **cannot access instance members**
- C# has `static` classes (cannot be instantiated or inherited), static constructors, and extension methods
- In Python, use `@staticmethod` for standalone utilities and `@classmethod` for methods that need the class

## Static Classes and Static Constructors (C#)

C# offers **static classes** — classes that cannot be instantiated and contain only static members. It also has **static constructors** for one-time class initialization:

```csharp
// Static class — cannot be instantiated or inherited
static class AppConfig {
    public static string Version { get; }
    public static DateTime StartTime { get; }

    // Static constructor — runs once, before first access
    static AppConfig() {
        Version = "1.0.0";
        StartTime = DateTime.Now;
        Console.WriteLine("AppConfig initialized");
    }
}

Console.WriteLine(AppConfig.Version);    // 1.0.0
Console.WriteLine(AppConfig.StartTime);  // (current time)
// new AppConfig();  // ❌ Compile error — cannot instantiate static class
```

Next: **Enumerations** — defining a fixed set of named constants.
