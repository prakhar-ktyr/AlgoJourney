---
title: Attributes and Properties
---

# Attributes and Properties

**Attributes** (also called **fields**, **properties**, or **instance variables**) are variables that belong to an object. They represent the **state** of the object.

---

## What Are Attributes?

Every object has attributes that describe it. Think of a person:

| Attribute | Example Value |
|-----------|---------------|
| `name` | "Alice" |
| `age` | 25 |
| `email` | "alice@example.com" |
| `isStudent` | true |

Each object of the same class has the **same set of attributes** but can hold **different values**.

---

## Declaring Attributes

```cpp
#include <iostream>
#include <string>
using namespace std;

class Person {
public:
    // Instance attributes
    string name;
    int age;
    string email;
    bool isStudent;
};
```

```csharp
class Person
{
    // Instance attributes
    public string Name;
    public int Age;
    public string Email;
    public bool IsStudent;
}
```

```java
public class Person {
    // Instance attributes
    String name;
    int age;
    String email;
    boolean isStudent;
}
```

```python
class Person:
    def __init__(self, name, age, email, is_student):
        self.name = name
        self.age = age
        self.email = email
        self.is_student = is_student
```

```javascript
class Person {
    constructor(name, age, email, isStudent) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.isStudent = isStudent;
    }
}
```

---

## Setting and Getting Attributes

```cpp
Person p;
p.name = "Alice";          // Set
p.age = 25;                // Set

cout << p.name << endl;    // Get → "Alice"
cout << p.age << endl;     // Get → 25

p.age = 26;               // Modify attribute
cout << p.age << endl;    // 26
```

```csharp
Person p = new Person();
p.Name = "Alice";              // Set
p.Age = 25;                    // Set

Console.WriteLine(p.Name);     // Get → "Alice"
Console.WriteLine(p.Age);      // Get → 25

p.Age = 26;                    // Modify attribute
Console.WriteLine(p.Age);      // 26
```

```java
Person p = new Person();
p.name = "Alice";         // Set
p.age = 25;               // Set

System.out.println(p.name);  // Get → "Alice"
System.out.println(p.age);   // Get → 25

p.age = 26;               // Modify attribute
System.out.println(p.age); // 26
```

```python
p = Person("Alice", 25, "alice@example.com", True)

print(p.name)    # Alice
print(p.age)     # 25

p.age = 26       # Modify attribute
print(p.age)     # 26
```

```javascript
const p = new Person("Alice", 25, "alice@example.com", true);

console.log(p.name);    // Alice
console.log(p.age);     // 25

p.age = 26;             // Modify attribute
console.log(p.age);     // 26
```

---

## Default Values

In Java, uninitialized attributes get default values:

| Type | Default Value |
|------|---------------|
| `int`, `long`, `short`, `byte` | `0` |
| `float`, `double` | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` (null character) |
| `String` / any object | `null` |

```cpp
class Demo {
public:
    int count = 0;        // Must initialize explicitly in C++
    string text = "";
    bool flag = false;
};

Demo d;
cout << d.count << endl;  // 0
cout << d.text << endl;   // ""
```

```csharp
class Demo
{
    public int Count;        // defaults to 0
    public string Text;      // defaults to null
    public bool Flag;        // defaults to false
}

Demo d = new Demo();
Console.WriteLine(d.Count);   // 0
Console.WriteLine(d.Text);    // (null)
```

```java
public class Demo {
    int count;       // defaults to 0
    String text;     // defaults to null
    boolean flag;    // defaults to false
}

Demo d = new Demo();
System.out.println(d.count);  // 0
System.out.println(d.text);   // null
```

```python
class Demo:
    def __init__(self, count=0, text="", flag=False):
        self.count = count
        self.text = text
        self.flag = flag

d = Demo()          # Uses defaults
print(d.count)      # 0
print(d.text)       # ""
```

```javascript
class Demo {
    constructor(count = 0, text = "", flag = false) {
        this.count = count;
        this.text = text;
        this.flag = flag;
    }
}

const d = new Demo();
console.log(d.count);  // 0
console.log(d.text);   // ""
```

---

## Attribute Types

Attributes can hold any data type:

```cpp
class Product {
public:
    string name;            // Text
    double price;           // Decimal number
    int quantity;           // Whole number
    bool inStock;           // True/false
    vector<string> tags;    // Array
    Category* category;     // Pointer to another object!
};
```

```csharp
class Product
{
    public string Name;          // Text
    public double Price;         // Decimal number
    public int Quantity;         // Whole number
    public bool InStock;         // True/false
    public string[] Tags;        // Array
    public Category Category;    // Another object!
}
```

```java
public class Product {
    String name;          // Text
    double price;         // Decimal number
    int quantity;         // Whole number
    boolean inStock;      // True/false
    String[] tags;        // Array
    Category category;    // Another object!
}
```

```python
class Product:
    def __init__(self, name, price, quantity, in_stock, tags, category):
        self.name = name          # Text
        self.price = price        # Decimal number
        self.quantity = quantity   # Whole number
        self.in_stock = in_stock  # True/false
        self.tags = tags          # List
        self.category = category  # Another object!
```

```javascript
class Product {
    constructor(name, price, quantity, inStock, tags, category) {
        this.name = name;          // Text
        this.price = price;        // Decimal number
        this.quantity = quantity;   // Whole number
        this.inStock = inStock;    // True/false
        this.tags = tags;          // Array
        this.category = category;  // Another object!
    }
}
```

Holding another object as an attribute is called **composition** — we'll cover it in depth later.

---

## Instance vs Class Attributes

There are two kinds of attributes:

### Instance Attributes

Belong to a specific object. Each object has its own copy.

```cpp
class Car {
public:
    string colour;   // instance attribute — different for each car
    int speed;       // instance attribute
};

int main() {
    Car c1;
    c1.colour = "Red";

    Car c2;
    c2.colour = "Blue";

    // c1.colour and c2.colour are independent
    return 0;
}
```

```csharp
class Car
{
    public string Colour;   // instance attribute — different for each car
    public int Speed;       // instance attribute
}

Car c1 = new Car();
c1.Colour = "Red";

Car c2 = new Car();
c2.Colour = "Blue";

// c1.Colour and c2.Colour are independent
```

```java
public class Car {
    String colour;   // instance attribute — different for each car
    int speed;       // instance attribute
}

Car c1 = new Car();
c1.colour = "Red";

Car c2 = new Car();
c2.colour = "Blue";

// c1.colour and c2.colour are independent
```

```python
class Car:
    def __init__(self, colour):
        self.colour = colour   # instance attribute — different for each car
        self.speed = 0         # instance attribute

c1 = Car("Red")
c2 = Car("Blue")

# c1.colour and c2.colour are independent
```

```javascript
class Car {
    constructor(colour) {
        this.colour = colour;  // instance attribute — different for each car
        this.speed = 0;        // instance attribute
    }
}

const c1 = new Car("Red");
const c2 = new Car("Blue");

// c1.colour and c2.colour are independent
```

### Class Attributes (Static)

Belong to the **class itself**, shared by all objects.

```cpp
#include <iostream>
#include <string>
using namespace std;

class Car {
public:
    string colour;
    int speed;
    static int totalCars;

    Car(string colour) {
        this->colour = colour;
        totalCars++;
    }
};

int Car::totalCars = 0;

int main() {
    Car c1("Red");
    Car c2("Blue");
    cout << Car::totalCars << endl;  // 2
    return 0;
}
```

```csharp
using System;

class Car
{
    public string Colour;
    public int Speed;
    public static int TotalCars = 0;  // shared across all Car objects

    public Car(string colour)
    {
        Colour = colour;
        TotalCars++;
    }
}

class Program
{
    static void Main()
    {
        Car c1 = new Car("Red");
        Car c2 = new Car("Blue");
        Console.WriteLine(Car.TotalCars);  // 2
    }
}
```

```java
public class Car {
    String colour;
    int speed;
    static int totalCars = 0;  // shared across all Car objects

    Car(String colour) {
        this.colour = colour;
        totalCars++;
    }
}

Car c1 = new Car("Red");
Car c2 = new Car("Blue");
System.out.println(Car.totalCars);  // 2
```

```python
class Car:
    total_cars = 0  # class attribute

    def __init__(self, colour):
        self.colour = colour   # instance attribute
        Car.total_cars += 1

c1 = Car("Red")
c2 = Car("Blue")
print(Car.total_cars)  # 2
```

```javascript
class Car {
    static totalCars = 0;  // class attribute

    constructor(colour) {
        this.colour = colour;  // instance attribute
        Car.totalCars++;
    }
}

const c1 = new Car("Red");
const c2 = new Car("Blue");
console.log(Car.totalCars);  // 2
```

| Feature | Instance Attribute | Class Attribute |
|---------|-------------------|-----------------|
| Belongs to | Each object | The class |
| Accessed via | `object.attr` | `ClassName.attr` |
| Memory | One copy per object | One copy total |
| Keyword (Java/C++) | (none) | `static` |

---

## Naming Conventions

| Language | Convention | Example |
|----------|-----------|---------|
| Java | camelCase | `firstName`, `isActive` |
| Python | snake_case | `first_name`, `is_active` |
| C++ | camelCase or m_ prefix | `firstName`, `m_firstName` |
| JavaScript | camelCase | `firstName`, `isActive` |

---

## Practical Example — Rectangle

```cpp
#include <iostream>
using namespace std;

class Rectangle {
public:
    double width;
    double height;

    Rectangle(double width, double height) {
        this->width = width;
        this->height = height;
    }

    double area() {
        return width * height;
    }

    double perimeter() {
        return 2 * (width + height);
    }

    void describe() {
        cout << "Rectangle " << width << " x " << height << endl;
        cout << "Area: " << area() << endl;
        cout << "Perimeter: " << perimeter() << endl;
    }
};

int main() {
    Rectangle r1(5, 3);
    r1.describe();
    // Rectangle 5 x 3
    // Area: 15
    // Perimeter: 16

    Rectangle r2(10, 7);
    r2.describe();
    // Rectangle 10 x 7
    // Area: 70
    // Perimeter: 34
    return 0;
}
```

```csharp
using System;

class Rectangle
{
    public double Width;
    public double Height;

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Area()
    {
        return Width * Height;
    }

    public double Perimeter()
    {
        return 2 * (Width + Height);
    }

    public void Describe()
    {
        Console.WriteLine($"Rectangle {Width} x {Height}");
        Console.WriteLine($"Area: {Area()}");
        Console.WriteLine($"Perimeter: {Perimeter()}");
    }
}

class Program
{
    static void Main()
    {
        Rectangle r1 = new Rectangle(5, 3);
        r1.Describe();
        // Rectangle 5 x 3
        // Area: 15
        // Perimeter: 16

        Rectangle r2 = new Rectangle(10, 7);
        r2.Describe();
        // Rectangle 10 x 7
        // Area: 70
        // Perimeter: 34
    }
}
```

```java
public class Rectangle {
    double width;
    double height;

    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    double area() {
        return width * height;
    }

    double perimeter() {
        return 2 * (width + height);
    }

    void describe() {
        System.out.println("Rectangle " + width + " x " + height);
        System.out.println("Area: " + area());
        System.out.println("Perimeter: " + perimeter());
    }

    public static void main(String[] args) {
        Rectangle r1 = new Rectangle(5, 3);
        r1.describe();
        // Rectangle 5.0 x 3.0
        // Area: 15.0
        // Perimeter: 16.0

        Rectangle r2 = new Rectangle(10, 7);
        r2.describe();
        // Rectangle 10.0 x 7.0
        // Area: 70.0
        // Perimeter: 34.0
    }
}
```

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def describe(self):
        print(f"Rectangle {self.width} x {self.height}")
        print(f"Area: {self.area()}")
        print(f"Perimeter: {self.perimeter()}")

r1 = Rectangle(5, 3)
r1.describe()

r2 = Rectangle(10, 7)
r2.describe()
```

```javascript
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    area() {
        return this.width * this.height;
    }

    perimeter() {
        return 2 * (this.width + this.height);
    }

    describe() {
        console.log(`Rectangle ${this.width} x ${this.height}`);
        console.log(`Area: ${this.area()}`);
        console.log(`Perimeter: ${this.perimeter()}`);
    }
}

const r1 = new Rectangle(5, 3);
r1.describe();

const r2 = new Rectangle(10, 7);
r2.describe();
```

---

## Key Takeaways

- Attributes store an object's **state** (data)
- **Instance attributes** are unique to each object
- **Class attributes** (static) are shared across all objects
- Attributes can hold any data type, including other objects
- Use the dot operator to get and set attribute values

Next: **Methods and Behaviour** — making objects do things.
