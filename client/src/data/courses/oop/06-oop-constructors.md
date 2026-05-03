---
title: Constructors
---

# Constructors

A **constructor** is a special method that runs automatically when you create a new object. Its purpose is to **initialize** the object's attributes with proper starting values.

---

## Why Constructors?

Without a constructor, you have to set every attribute manually after creating the object:

```cpp
Dog rex;
rex.name = "Rex";
rex.breed = "Labrador";
rex.age = 3;
// Easy to forget an attribute!
```

```csharp
Dog rex = new Dog();
rex.Name = "Rex";
rex.Breed = "Labrador";
rex.Age = 3;
// Easy to forget an attribute!
```

```java
// Without constructor — tedious and error-prone
Dog rex = new Dog();
rex.name = "Rex";
rex.breed = "Labrador";
rex.age = 3;
// Easy to forget an attribute!
```

```python
# Without a proper constructor
rex = Dog()
rex.name = "Rex"
rex.breed = "Labrador"
rex.age = 3
# Easy to forget an attribute!
```

```javascript
// Without a proper constructor
const rex = new Dog();
rex.name = "Rex";
rex.breed = "Labrador";
rex.age = 3;
// Easy to forget an attribute!
```

With a constructor, you set everything at creation time:

```cpp
Dog rex("Rex", "Labrador", 3);
```

```csharp
Dog rex = new Dog("Rex", "Labrador", 3);
```

```java
// With constructor — clean and safe
Dog rex = new Dog("Rex", "Labrador", 3);
```

```python
rex = Dog("Rex", "Labrador", 3)
```

```javascript
const rex = new Dog("Rex", "Labrador", 3);
```

---

## Defining a Constructor

```cpp
#include <iostream>
#include <string>
using namespace std;

class Dog {
public:
    string name;
    string breed;
    int age;

    // Constructor
    Dog(string name, string breed, int age) {
        this->name = name;
        this->breed = breed;
        this->age = age;
    }

    void bark() {
        cout << name << " says: Woof!" << endl;
    }
};

int main() {
    Dog rex("Rex", "Labrador", 3);
    rex.bark();  // Rex says: Woof!
    return 0;
}
```

```csharp
using System;

class Dog
{
    public string Name;
    public string Breed;
    public int Age;

    // Constructor
    public Dog(string name, string breed, int age)
    {
        Name = name;
        Breed = breed;
        Age = age;
    }

    public void Bark()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
}

class Program
{
    static void Main()
    {
        Dog rex = new Dog("Rex", "Labrador", 3);
        rex.Bark();  // Rex says: Woof!
    }
}
```

```java
public class Dog {
    String name;
    String breed;
    int age;

    // Constructor — same name as class, no return type
    Dog(String name, String breed, int age) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }

    void bark() {
        System.out.println(name + " says: Woof!");
    }

    public static void main(String[] args) {
        Dog rex = new Dog("Rex", "Labrador", 3);
        rex.bark();  // Rex says: Woof!
    }
}
```

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age

    def bark(self):
        print(f"{self.name} says: Woof!")

rex = Dog("Rex", "Labrador", 3)
rex.bark()  # Rex says: Woof!
```

```javascript
class Dog {
    constructor(name, breed, age) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }

    bark() {
        console.log(`${this.name} says: Woof!`);
    }
}

const rex = new Dog("Rex", "Labrador", 3);
rex.bark();  // Rex says: Woof!
```

---

## Default Constructor

If you don't write any constructor, the language provides a **default constructor** that takes no arguments:

```cpp
class Dog {
public:
    string name;
    int age;
    // No constructor defined — compiler provides a default one
};

int main() {
    Dog d;          // Calls the default constructor
    // d.name is "" , d.age is 0 (uninitialized in practice)
    return 0;
}
```

```csharp
class Dog
{
    public string Name;
    public int Age;
    // No constructor defined — C# provides a default one
}

Dog d = new Dog();  // Calls the default constructor
// d.Name is null, d.Age is 0
```

```java
public class Dog {
    String name;
    int age;
    // No constructor defined — Java provides a default one
}

Dog d = new Dog();  // Calls the default constructor
// d.name is null, d.age is 0
```

```python
class Dog:
    pass  # No __init__ — Python provides a basic constructor

d = Dog()  # Creates an empty object
# d has no attributes yet
```

```javascript
class Dog {
    // No constructor defined — JS provides a default one
}

const d = new Dog();  // Creates an empty object
// d has no properties yet
```

**Important**: If you define **any** constructor, the default one is no longer provided automatically. You must explicitly create a no-argument constructor if you still want one.

---

## Constructor Overloading

You can define **multiple constructors** with different parameter lists:

```cpp
class Dog {
public:
    string name;
    string breed;
    int age;

    // Constructor 1: all fields
    Dog(string name, string breed, int age) {
        this->name = name;
        this->breed = breed;
        this->age = age;
    }

    // Constructor 2: name only (defaults for others)
    Dog(string name) {
        this->name = name;
        this->breed = "Unknown";
        this->age = 0;
    }

    // Constructor 3: no arguments
    Dog() {
        name = "Unnamed";
        breed = "Unknown";
        age = 0;
    }
};

int main() {
    Dog d1("Rex", "Labrador", 3);
    Dog d2("Bella");
    Dog d3;
    return 0;
}
```

```csharp
class Dog
{
    public string Name;
    public string Breed;
    public int Age;

    // Constructor 1: all fields
    public Dog(string name, string breed, int age)
    {
        Name = name;
        Breed = breed;
        Age = age;
    }

    // Constructor 2: name only (defaults for others)
    public Dog(string name)
    {
        Name = name;
        Breed = "Unknown";
        Age = 0;
    }

    // Constructor 3: no arguments
    public Dog()
    {
        Name = "Unnamed";
        Breed = "Unknown";
        Age = 0;
    }
}

Dog d1 = new Dog("Rex", "Labrador", 3);
Dog d2 = new Dog("Bella");
Dog d3 = new Dog();
```

```java
public class Dog {
    String name;
    String breed;
    int age;

    // Constructor 1: all fields
    Dog(String name, String breed, int age) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }

    // Constructor 2: name only (defaults for others)
    Dog(String name) {
        this.name = name;
        this.breed = "Unknown";
        this.age = 0;
    }

    // Constructor 3: no arguments
    Dog() {
        this.name = "Unnamed";
        this.breed = "Unknown";
        this.age = 0;
    }
}

Dog d1 = new Dog("Rex", "Labrador", 3);
Dog d2 = new Dog("Bella");
Dog d3 = new Dog();
```

```python
class Dog:
    def __init__(self, name="Unnamed", breed="Unknown", age=0):
        self.name = name
        self.breed = breed
        self.age = age

d1 = Dog("Rex", "Labrador", 3)
d2 = Dog("Bella")
d3 = Dog()
```

```javascript
class Dog {
    constructor(name = "Unnamed", breed = "Unknown", age = 0) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }
}

const d1 = new Dog("Rex", "Labrador", 3);
const d2 = new Dog("Bella");
const d3 = new Dog();
```

Python and JavaScript don't support constructor overloading directly, but you can use default parameter values to achieve the same result.

---

## Constructor Chaining

One constructor can call another to avoid duplicating initialization logic:

```cpp
class Dog {
public:
    string name;
    string breed;
    int age;

    Dog(string name, string breed, int age)
        : name(name), breed(breed), age(age) {}

    Dog(string name) : Dog(name, "Unknown", 0) {}  // Delegates

    Dog() : Dog("Unnamed") {}  // Delegates
};
```

```csharp
class Dog
{
    public string Name;
    public string Breed;
    public int Age;

    public Dog(string name, string breed, int age)
    {
        Name = name;
        Breed = breed;
        Age = age;
    }

    public Dog(string name) : this(name, "Unknown", 0) { }  // Delegates

    public Dog() : this("Unnamed") { }  // Delegates
}
```

```java
public class Dog {
    String name;
    String breed;
    int age;

    Dog(String name, String breed, int age) {
        this.name = name;
        this.breed = breed;
        this.age = age;
    }

    Dog(String name) {
        this(name, "Unknown", 0);  // Calls the 3-parameter constructor
    }

    Dog() {
        this("Unnamed");  // Calls the 1-parameter constructor
    }
}
```

```python
class Dog:
    def __init__(self, name="Unnamed", breed="Unknown", age=0):
        # Python uses default parameters instead of chaining
        self.name = name
        self.breed = breed
        self.age = age
```

```javascript
class Dog {
    constructor(name = "Unnamed", breed = "Unknown", age = 0) {
        // JavaScript uses default parameters instead of chaining
        this.name = name;
        this.breed = breed;
        this.age = age;
    }
}
```

---

## Validation in Constructors

Constructors are the perfect place to validate initial values:

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
using namespace std;

class BankAccount {
public:
    string owner;
    double balance;

    BankAccount(string owner, double initialBalance) {
        if (owner.empty()) {
            throw invalid_argument("Owner name required");
        }
        if (initialBalance < 0) {
            throw invalid_argument("Balance cannot be negative");
        }
        this->owner = owner;
        this->balance = initialBalance;
    }
};
```

```csharp
using System;

class BankAccount
{
    public string Owner;
    public double Balance;

    public BankAccount(string owner, double initialBalance)
    {
        if (string.IsNullOrWhiteSpace(owner))
        {
            throw new ArgumentException("Owner name required");
        }
        if (initialBalance < 0)
        {
            throw new ArgumentException("Balance cannot be negative");
        }
        Owner = owner;
        Balance = initialBalance;
    }
}

// This throws an exception:
// BankAccount bad = new BankAccount("", -100);
```

```java
public class BankAccount {
    String owner;
    double balance;

    BankAccount(String owner, double initialBalance) {
        if (owner == null || owner.isEmpty()) {
            throw new IllegalArgumentException("Owner name required");
        }
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Balance cannot be negative");
        }
        this.owner = owner;
        this.balance = initialBalance;
    }
}

// This throws an exception:
// BankAccount bad = new BankAccount("", -100);
```

```python
class BankAccount:
    def __init__(self, owner, initial_balance):
        if not owner:
            raise ValueError("Owner name required")
        if initial_balance < 0:
            raise ValueError("Balance cannot be negative")
        self.owner = owner
        self.balance = initial_balance
```

```javascript
class BankAccount {
    constructor(owner, initialBalance) {
        if (!owner || owner.trim() === "") {
            throw new Error("Owner name required");
        }
        if (initialBalance < 0) {
            throw new Error("Balance cannot be negative");
        }
        this.owner = owner;
        this.balance = initialBalance;
    }
}

// This throws an error:
// const bad = new BankAccount("", -100);
```

---

## Copy Constructor

A constructor that creates a new object as a copy of an existing one:

```cpp
class Point {
public:
    int x, y;

    Point(int x, int y) : x(x), y(y) {}

    // Copy constructor
    Point(const Point& other) {
        x = other.x;
        y = other.y;
    }
};

int main() {
    Point p1(3, 4);
    Point p2(p1);   // Copy of p1

    cout << p2.x << endl;        // 3
    cout << p2.y << endl;        // 4
    cout << (&p1 == &p2) << endl;  // 0 (different objects)
    return 0;
}
```

```csharp
class Point
{
    public int X, Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    // Copy constructor
    public Point(Point other)
    {
        X = other.X;
        Y = other.Y;
    }
}

Point p1 = new Point(3, 4);
Point p2 = new Point(p1);   // Copy of p1

Console.WriteLine(p2.X);                          // 3
Console.WriteLine(p2.Y);                          // 4
Console.WriteLine(ReferenceEquals(p1, p2));        // False (different objects)
```

```java
public class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Copy constructor
    Point(Point other) {
        this.x = other.x;
        this.y = other.y;
    }

    public static void main(String[] args) {
        Point p1 = new Point(3, 4);
        Point p2 = new Point(p1);   // Copy of p1

        System.out.println(p2.x);          // 3
        System.out.println(p2.y);          // 4
        System.out.println(p1 == p2);      // false (different objects)
    }
}
```

```python
class Point:
    def __init__(self, x=0, y=0, other=None):
        if other:
            self.x = other.x
            self.y = other.y
        else:
            self.x = x
            self.y = y

p1 = Point(3, 4)
p2 = Point(other=p1)

print(p2.x)        # 3
print(p2.y)        # 4
print(p1 is p2)    # False (different objects)
```

```javascript
class Point {
    constructor(xOrOther, y) {
        if (xOrOther instanceof Point) {
            this.x = xOrOther.x;
            this.y = xOrOther.y;
        } else {
            this.x = xOrOther;
            this.y = y;
        }
    }
}

const p1 = new Point(3, 4);
const p2 = new Point(p1);   // Copy of p1

console.log(p2.x);          // 3
console.log(p2.y);          // 4
console.log(p1 === p2);     // false (different objects)
```

---

## Constructor vs Method

| Feature | Constructor | Method |
|---------|------------|--------|
| Purpose | Initialize new objects | Define behaviour |
| Name | Same as class name (or `__init__`/`constructor`) | Any valid name |
| Return type | None (not even void) | Must specify (or void) |
| Called by | `new` keyword / instantiation | Dot operator on object |
| Called when | Object creation only | Any time after creation |
| Can be overloaded | Yes | Yes |

---

## Practical Example — Book

```cpp
#include <iostream>
#include <string>
using namespace std;

class Book {
public:
    string title;
    string author;
    int pages;
    double price;
    bool available;

    Book(string title, string author, int pages, double price) {
        this->title = title;
        this->author = author;
        this->pages = pages;
        this->price = price;
        this->available = true;
    }

    Book(string title, string author)
        : Book(title, author, 0, 0.0) {}

    void printInfo() {
        cout << "\"" << title << "\" by " << author << endl;
        cout << "Pages: " << pages << " | Price: $" << price << endl;
        cout << "Available: " << (available ? "true" : "false") << endl;
    }
};

int main() {
    Book b1("Clean Code", "Robert Martin", 464, 29.99);
    Book b2("The Art of War", "Sun Tzu");

    b1.printInfo();
    b2.printInfo();
    return 0;
}
```

```csharp
using System;

class Book
{
    public string Title;
    public string Author;
    public int Pages;
    public double Price;
    public bool Available;

    public Book(string title, string author, int pages, double price)
    {
        Title = title;
        Author = author;
        Pages = pages;
        Price = price;
        Available = true;
    }

    public Book(string title, string author)
        : this(title, author, 0, 0.0) { }

    public void PrintInfo()
    {
        Console.WriteLine($"\"{Title}\" by {Author}");
        Console.WriteLine($"Pages: {Pages} | Price: ${Price}");
        Console.WriteLine($"Available: {Available}");
    }
}

class Program
{
    static void Main()
    {
        Book b1 = new Book("Clean Code", "Robert Martin", 464, 29.99);
        Book b2 = new Book("The Art of War", "Sun Tzu");

        b1.PrintInfo();
        b2.PrintInfo();
    }
}
```

```java
public class Book {
    String title;
    String author;
    int pages;
    double price;
    boolean available;

    Book(String title, String author, int pages, double price) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.price = price;
        this.available = true;  // Default to available
    }

    Book(String title, String author) {
        this(title, author, 0, 0.0);
    }

    void printInfo() {
        System.out.println("\"" + title + "\" by " + author);
        System.out.println("Pages: " + pages + " | Price: $" + price);
        System.out.println("Available: " + available);
    }

    public static void main(String[] args) {
        Book b1 = new Book("Clean Code", "Robert Martin", 464, 29.99);
        Book b2 = new Book("The Art of War", "Sun Tzu");

        b1.printInfo();
        b2.printInfo();
    }
}
```

```python
class Book:
    def __init__(self, title, author, pages=0, price=0.0):
        self.title = title
        self.author = author
        self.pages = pages
        self.price = price
        self.available = True

    def print_info(self):
        print(f'"{self.title}" by {self.author}')
        print(f"Pages: {self.pages} | Price: ${self.price}")
        print(f"Available: {self.available}")

b1 = Book("Clean Code", "Robert Martin", 464, 29.99)
b2 = Book("The Art of War", "Sun Tzu")

b1.print_info()
b2.print_info()
```

```javascript
class Book {
    constructor(title, author, pages = 0, price = 0.0) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.price = price;
        this.available = true;
    }

    printInfo() {
        console.log(`"${this.title}" by ${this.author}`);
        console.log(`Pages: ${this.pages} | Price: $${this.price}`);
        console.log(`Available: ${this.available}`);
    }
}

const b1 = new Book("Clean Code", "Robert Martin", 464, 29.99);
const b2 = new Book("The Art of War", "Sun Tzu");

b1.printInfo();
b2.printInfo();
```

---

## Copy and Move Constructors (C++)

C++ uniquely provides **copy constructors** and **move constructors** (C++11) for controlling how objects are duplicated or transferred.

- **Copy constructor**: creates a new object as a copy of an existing one
- **Move constructor**: transfers ownership of resources from a temporary object
- **Rule of Three**: if you define a destructor, copy constructor, or copy assignment operator, you should define all three
- **Rule of Five** (C++11): adds move constructor and move assignment operator

```cpp
#include <iostream>
#include <cstring>
using namespace std;

class DynamicArray {
    int* data;
    size_t size;

public:
    // Constructor
    DynamicArray(size_t n) : size(n), data(new int[n]{}) {
        cout << "Constructed (size " << n << ")" << endl;
    }

    // Copy constructor — deep copy
    DynamicArray(const DynamicArray& other) : size(other.size), data(new int[other.size]) {
        memcpy(data, other.data, size * sizeof(int));
        cout << "Copy constructed" << endl;
    }

    // Move constructor — steal resources
    DynamicArray(DynamicArray&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        cout << "Move constructed" << endl;
    }

    // Destructor
    ~DynamicArray() {
        delete[] data;
    }

    size_t getSize() const { return size; }
};

int main() {
    DynamicArray a(5);              // Constructed
    DynamicArray b(a);              // Copy constructed (deep copy)
    DynamicArray c(std::move(a));   // Move constructed (a is now empty)
    cout << "a size: " << a.getSize() << endl;  // 0
    cout << "c size: " << c.getSize() << endl;  // 5
}
```

---

## Key Takeaways

- A **constructor** initializes an object when it's created
- Constructors have the **same name as the class** and **no return type**
- You can have **multiple constructors** (overloading) with different parameters
- Use **constructor chaining** (`this(...)` / delegating constructors) to avoid duplicating code
- **Validate inputs** in constructors to prevent invalid objects
- A **copy constructor** creates a new object from an existing one

Next: **Access Modifiers** — controlling who can see your attributes and methods.
