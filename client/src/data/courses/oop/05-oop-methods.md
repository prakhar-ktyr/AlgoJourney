---
title: Methods and Behaviour
---

# Methods and Behaviour

**Methods** are functions defined inside a class. They define what an object can **do** — its behaviour. While attributes represent state, methods represent actions.

---

## Defining Methods

```cpp
#include <iostream>
using namespace std;

class Calculator {
public:
    int result = 0;

    void add(int number) {
        result += number;
    }

    void subtract(int number) {
        result -= number;
    }

    int getResult() {
        return result;
    }
};
```

```csharp
class Calculator
{
    public int Result = 0;

    public void Add(int number)
    {
        Result += number;
    }

    public void Subtract(int number)
    {
        Result -= number;
    }

    public int GetResult()
    {
        return Result;
    }
}
```

```java
public class Calculator {
    int result;

    void add(int number) {
        result += number;
    }

    void subtract(int number) {
        result -= number;
    }

    int getResult() {
        return result;
    }
}
```

```python
class Calculator:
    def __init__(self):
        self.result = 0

    def add(self, number):
        self.result += number

    def subtract(self, number):
        self.result -= number

    def get_result(self):
        return self.result
```

```javascript
class Calculator {
    constructor() {
        this.result = 0;
    }

    add(number) {
        this.result += number;
    }

    subtract(number) {
        this.result -= number;
    }

    getResult() {
        return this.result;
    }
}
```

---

## Calling Methods

Methods are called on an **object** using the dot operator:

```cpp
Calculator calc;
calc.add(10);
calc.add(5);
calc.subtract(3);
cout << calc.getResult() << endl;  // 12
```

```csharp
Calculator calc = new Calculator();
calc.Add(10);
calc.Add(5);
calc.Subtract(3);
Console.WriteLine(calc.GetResult());  // 12
```

```java
Calculator calc = new Calculator();
calc.add(10);
calc.add(5);
calc.subtract(3);
System.out.println(calc.getResult());  // 12
```

```python
calc = Calculator()
calc.add(10)
calc.add(5)
calc.subtract(3)
print(calc.get_result())  # 12
```

```javascript
const calc = new Calculator();
calc.add(10);
calc.add(5);
calc.subtract(3);
console.log(calc.getResult());  // 12
```

---

## Method Components

Every method has these parts:

| Component | Description | Example |
|-----------|-------------|---------|
| **Return type** | What the method gives back | `int`, `String`, `void` |
| **Name** | What you call the method | `add`, `getResult` |
| **Parameters** | Input values | `(int number)` |
| **Body** | The code that runs | `{ result += number; }` |

```
//  return type    name     parameters
//     ↓           ↓          ↓
      int        add     (int a, int b) {
          return a + b;    // ← body
      }
```

---

## Methods with Parameters

Methods can take zero or more parameters:

```cpp
class MathHelper {
public:
    void sayHello() {
        cout << "Hello!" << endl;
    }

    int square(int n) {
        return n * n;
    }

    int add(int a, int b) {
        return a + b;
    }

    double average(double a, double b, double c) {
        return (a + b + c) / 3;
    }
};
```

```csharp
using System;

class MathHelper
{
    public void SayHello()
    {
        Console.WriteLine("Hello!");
    }

    public int Square(int n)
    {
        return n * n;
    }

    public int Add(int a, int b)
    {
        return a + b;
    }

    public double Average(double a, double b, double c)
    {
        return (a + b + c) / 3;
    }
}
```

```java
public class MathHelper {
    // No parameters
    void sayHello() {
        System.out.println("Hello!");
    }

    // One parameter
    int square(int n) {
        return n * n;
    }

    // Two parameters
    int add(int a, int b) {
        return a + b;
    }

    // Three parameters
    double average(double a, double b, double c) {
        return (a + b + c) / 3;
    }
}
```

```python
class MathHelper:
    def say_hello(self):
        print("Hello!")

    def square(self, n):
        return n * n

    def add(self, a, b):
        return a + b

    def average(self, a, b, c):
        return (a + b + c) / 3
```

```javascript
class MathHelper {
    sayHello() {
        console.log("Hello!");
    }

    square(n) {
        return n * n;
    }

    add(a, b) {
        return a + b;
    }

    average(a, b, c) {
        return (a + b + c) / 3;
    }
}
```

---

## Return Values

Methods can return a value using `return`:

```cpp
class Circle {
public:
    double radius;

    Circle(double radius) : radius(radius) {}

    double area() {
        return 3.14159 * radius * radius;
    }

    string describe() {
        return "Circle with radius " + to_string(radius);
    }

    void printArea() {
        cout << "Area: " << area() << endl;
    }
};
```

```csharp
using System;

class Circle
{
    public double Radius;

    public Circle(double radius)
    {
        Radius = radius;
    }

    public double Area()
    {
        return Math.PI * Radius * Radius;
    }

    public string Describe()
    {
        return $"Circle with radius {Radius}";
    }

    public void PrintArea()
    {
        Console.WriteLine($"Area: {Area()}");
    }
}
```

```java
public class Circle {
    double radius;

    // Returns a double
    double area() {
        return Math.PI * radius * radius;
    }

    // Returns a String
    String describe() {
        return "Circle with radius " + radius;
    }

    // Returns nothing (void)
    void printArea() {
        System.out.println("Area: " + area());
    }
}
```

```python
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def describe(self):
        return f"Circle with radius {self.radius}"

    def print_area(self):
        print(f"Area: {self.area()}")
```

```javascript
class Circle {
    constructor(radius) {
        this.radius = radius;
    }

    area() {
        return Math.PI * this.radius ** 2;
    }

    describe() {
        return `Circle with radius ${this.radius}`;
    }

    printArea() {
        console.log(`Area: ${this.area()}`);
    }
}
```

| Return Type | Meaning |
|-------------|---------|
| `void` | Returns nothing |
| `int` | Returns an integer |
| `double` | Returns a decimal number |
| `String` | Returns text |
| `boolean` | Returns true/false |
| `ClassName` | Returns an object |

---

## Methods That Modify State

Methods often modify the object's attributes:

```cpp
#include <iostream>
#include <string>
using namespace std;

class BankAccount {
public:
    string owner;
    double balance;

    BankAccount(string owner, double balance) {
        this->owner = owner;
        this->balance = balance;
    }

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            cout << "Deposited " << amount << endl;
        }
    }

    void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            cout << "Withdrew " << amount << endl;
        } else {
            cout << "Invalid withdrawal" << endl;
        }
    }

    void printBalance() {
        cout << owner << "'s balance: $" << balance << endl;
    }
};

int main() {
    BankAccount acc("Alice", 1000);
    acc.deposit(500);       // Deposited 500
    acc.withdraw(200);      // Withdrew 200
    acc.printBalance();     // Alice's balance: $1300
    return 0;
}
```

```csharp
using System;

class BankAccount
{
    public string Owner;
    public double Balance;

    public BankAccount(string owner, double balance)
    {
        Owner = owner;
        Balance = balance;
    }

    public void Deposit(double amount)
    {
        if (amount > 0)
        {
            Balance += amount;
            Console.WriteLine($"Deposited {amount}");
        }
    }

    public void Withdraw(double amount)
    {
        if (amount > 0 && amount <= Balance)
        {
            Balance -= amount;
            Console.WriteLine($"Withdrew {amount}");
        }
        else
        {
            Console.WriteLine("Invalid withdrawal");
        }
    }

    public void PrintBalance()
    {
        Console.WriteLine($"{Owner}'s balance: ${Balance}");
    }
}

class Program
{
    static void Main()
    {
        BankAccount acc = new BankAccount("Alice", 1000);
        acc.Deposit(500);       // Deposited 500
        acc.Withdraw(200);      // Withdrew 200
        acc.PrintBalance();     // Alice's balance: $1300
    }
}
```

```java
public class BankAccount {
    String owner;
    double balance;

    BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited " + amount);
        }
    }

    void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Withdrew " + amount);
        } else {
            System.out.println("Invalid withdrawal");
        }
    }

    void printBalance() {
        System.out.println(owner + "'s balance: $" + balance);
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Alice", 1000);
        acc.deposit(500);       // Deposited 500
        acc.withdraw(200);      // Withdrew 200
        acc.printBalance();     // Alice's balance: $1300.0
    }
}
```

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"Deposited {amount}")

    def withdraw(self, amount):
        if amount > 0 and amount <= self.balance:
            self.balance -= amount
            print(f"Withdrew {amount}")
        else:
            print("Invalid withdrawal")

    def print_balance(self):
        print(f"{self.owner}'s balance: ${self.balance}")

acc = BankAccount("Alice", 1000)
acc.deposit(500)       # Deposited 500
acc.withdraw(200)      # Withdrew 200
acc.print_balance()    # Alice's balance: $1300
```

```javascript
class BankAccount {
    constructor(owner, balance) {
        this.owner = owner;
        this.balance = balance;
    }

    deposit(amount) {
        if (amount > 0) {
            this.balance += amount;
            console.log(`Deposited ${amount}`);
        }
    }

    withdraw(amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            console.log(`Withdrew ${amount}`);
        } else {
            console.log("Invalid withdrawal");
        }
    }

    printBalance() {
        console.log(`${this.owner}'s balance: $${this.balance}`);
    }
}

const acc = new BankAccount("Alice", 1000);
acc.deposit(500);       // Deposited 500
acc.withdraw(200);      // Withdrew 200
acc.printBalance();     // Alice's balance: $1300
```

---

## Methods That Return Objects

Methods can return new objects:

```cpp
#include <iostream>
#include <cmath>
using namespace std;

class Point {
public:
    int x, y;

    Point(int x, int y) : x(x), y(y) {}

    Point translate(int dx, int dy) {
        return Point(x + dx, y + dy);
    }

    double distanceTo(Point other) {
        int diffX = x - other.x;
        int diffY = y - other.y;
        return sqrt(diffX * diffX + diffY * diffY);
    }

    string describe() {
        return "(" + to_string(x) + ", " + to_string(y) + ")";
    }
};

int main() {
    Point p1(0, 0);
    Point p2 = p1.translate(3, 4);

    cout << p1.describe() << endl;         // (0, 0)
    cout << p2.describe() << endl;         // (3, 4)
    cout << p1.distanceTo(p2) << endl;     // 5
    return 0;
}
```

```csharp
using System;

class Point
{
    public int X, Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public Point Translate(int dx, int dy)
    {
        return new Point(X + dx, Y + dy);
    }

    public double DistanceTo(Point other)
    {
        int diffX = X - other.X;
        int diffY = Y - other.Y;
        return Math.Sqrt(diffX * diffX + diffY * diffY);
    }

    public string Describe()
    {
        return $"({X}, {Y})";
    }
}

class Program
{
    static void Main()
    {
        Point p1 = new Point(0, 0);
        Point p2 = p1.Translate(3, 4);

        Console.WriteLine(p1.Describe());         // (0, 0)
        Console.WriteLine(p2.Describe());         // (3, 4)
        Console.WriteLine(p1.DistanceTo(p2));     // 5
    }
}
```

```java
public class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Returns a new Point object
    Point translate(int dx, int dy) {
        return new Point(x + dx, y + dy);
    }

    double distanceTo(Point other) {
        int diffX = this.x - other.x;
        int diffY = this.y - other.y;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    String describe() {
        return "(" + x + ", " + y + ")";
    }

    public static void main(String[] args) {
        Point p1 = new Point(0, 0);
        Point p2 = p1.translate(3, 4);

        System.out.println(p1.describe());           // (0, 0)
        System.out.println(p2.describe());           // (3, 4)
        System.out.println(p1.distanceTo(p2));       // 5.0
    }
}
```

```python
import math

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def translate(self, dx, dy):
        return Point(self.x + dx, self.y + dy)

    def distance_to(self, other):
        diff_x = self.x - other.x
        diff_y = self.y - other.y
        return math.sqrt(diff_x ** 2 + diff_y ** 2)

    def describe(self):
        return f"({self.x}, {self.y})"

p1 = Point(0, 0)
p2 = p1.translate(3, 4)

print(p1.describe())          # (0, 0)
print(p2.describe())          # (3, 4)
print(p1.distance_to(p2))    # 5.0
```

```javascript
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    translate(dx, dy) {
        return new Point(this.x + dx, this.y + dy);
    }

    distanceTo(other) {
        const diffX = this.x - other.x;
        const diffY = this.y - other.y;
        return Math.sqrt(diffX ** 2 + diffY ** 2);
    }

    describe() {
        return `(${this.x}, ${this.y})`;
    }
}

const p1 = new Point(0, 0);
const p2 = p1.translate(3, 4);

console.log(p1.describe());          // (0, 0)
console.log(p2.describe());          // (3, 4)
console.log(p1.distanceTo(p2));      // 5
```

---

## Method Chaining

Some methods return `this` (the current object) to allow chaining:

```cpp
#include <iostream>
#include <string>
using namespace std;

class QueryBuilder {
public:
    string table;
    string condition;
    int limitVal;

    QueryBuilder& from(string t) {
        table = t;
        return *this;
    }

    QueryBuilder& where(string c) {
        condition = c;
        return *this;
    }

    QueryBuilder& limit(int l) {
        limitVal = l;
        return *this;
    }

    string build() {
        return "SELECT * FROM " + table
             + " WHERE " + condition
             + " LIMIT " + to_string(limitVal);
    }
};

int main() {
    string query = QueryBuilder()
        .from("users")
        .where("age > 18")
        .limit(10)
        .build();

    cout << query << endl;
    // SELECT * FROM users WHERE age > 18 LIMIT 10
    return 0;
}
```

```csharp
using System;

class QueryBuilder
{
    public string Table;
    public string Condition;
    public int LimitVal;

    public QueryBuilder From(string table)
    {
        Table = table;
        return this;
    }

    public QueryBuilder Where(string condition)
    {
        Condition = condition;
        return this;
    }

    public QueryBuilder Limit(int limit)
    {
        LimitVal = limit;
        return this;
    }

    public string Build()
    {
        return $"SELECT * FROM {Table} WHERE {Condition} LIMIT {LimitVal}";
    }
}

class Program
{
    static void Main()
    {
        string query = new QueryBuilder()
            .From("users")
            .Where("age > 18")
            .Limit(10)
            .Build();

        Console.WriteLine(query);
        // SELECT * FROM users WHERE age > 18 LIMIT 10
    }
}
```

```java
public class QueryBuilder {
    String table;
    String condition;
    int limit;

    QueryBuilder from(String table) {
        this.table = table;
        return this;       // returns itself
    }

    QueryBuilder where(String condition) {
        this.condition = condition;
        return this;
    }

    QueryBuilder limit(int limit) {
        this.limit = limit;
        return this;
    }

    String build() {
        return "SELECT * FROM " + table
             + " WHERE " + condition
             + " LIMIT " + limit;
    }

    public static void main(String[] args) {
        String query = new QueryBuilder()
            .from("users")
            .where("age > 18")
            .limit(10)
            .build();

        System.out.println(query);
        // SELECT * FROM users WHERE age > 18 LIMIT 10
    }
}
```

```python
class QueryBuilder:
    def __init__(self):
        self.table = ""
        self.condition = ""
        self.limit_val = 0

    def from_table(self, table):
        self.table = table
        return self

    def where(self, condition):
        self.condition = condition
        return self

    def limit(self, limit_val):
        self.limit_val = limit_val
        return self

    def build(self):
        return (f"SELECT * FROM {self.table}"
                f" WHERE {self.condition}"
                f" LIMIT {self.limit_val}")

query = (QueryBuilder()
    .from_table("users")
    .where("age > 18")
    .limit(10)
    .build())

print(query)
# SELECT * FROM users WHERE age > 18 LIMIT 10
```

```javascript
class QueryBuilder {
    constructor() {
        this.table = "";
        this.condition = "";
        this.limitVal = 0;
    }

    from(table) {
        this.table = table;
        return this;
    }

    where(condition) {
        this.condition = condition;
        return this;
    }

    limit(limitVal) {
        this.limitVal = limitVal;
        return this;
    }

    build() {
        return `SELECT * FROM ${this.table}`
             + ` WHERE ${this.condition}`
             + ` LIMIT ${this.limitVal}`;
    }
}

const query = new QueryBuilder()
    .from("users")
    .where("age > 18")
    .limit(10)
    .build();

console.log(query);
// SELECT * FROM users WHERE age > 18 LIMIT 10
```

---

## The `self` / `this` Parameter

In Python, every method's first parameter is `self` — it refers to the current object. In Java, C++, and JavaScript, this is implicit via the `this` keyword.

```cpp
class Dog {
public:
    string name;

    Dog(string name) {
        this->name = name;  // this = pointer to the current object
    }

    void bark() {
        cout << this->name << " says: Woof!" << endl;
    }
};
```

```csharp
class Dog
{
    public string Name;

    public Dog(string name)
    {
        this.Name = name;  // this = the current object
    }

    public void Bark()
    {
        Console.WriteLine($"{this.Name} says: Woof!");
    }
}
```

```java
public class Dog {
    String name;

    Dog(String name) {
        this.name = name;  // this = the object being created
    }

    void bark() {
        System.out.println(this.name + " says: Woof!");
        // "this" is optional here, but makes it explicit
    }
}
```

```python
class Dog:
    def __init__(self, name):
        self.name = name   # self = the object being created

    def bark(self):
        print(f"{self.name} says: Woof!")  # self = the object calling bark()

rex = Dog("Rex")
rex.bark()  # Python passes rex as self automatically
```

```javascript
class Dog {
    constructor(name) {
        this.name = name;  // this = the object being created
    }

    bark() {
        console.log(`${this.name} says: Woof!`);
    }
}

const rex = new Dog("Rex");
rex.bark();  // JS binds rex as this automatically
```

---

## Arrow Functions and this Binding (JavaScript)

Arrow functions do **not** have their own `this` — they capture `this` from the enclosing scope. This is a common pitfall in JS OOP.

```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }

  // ❌ Problem: regular function loses `this` in callbacks
  startBroken() {
    setInterval(function () {
      this.seconds++; // `this` is undefined (or window), NOT the Timer
    }, 1000);
  }

  // ✅ Fix: arrow function captures `this` from startFixed()
  startFixed() {
    setInterval(() => {
      this.seconds++; // `this` correctly refers to the Timer instance
    }, 1000);
  }
}
```

**Rule of thumb:** Use arrow functions for callbacks inside methods. Use regular methods on the class itself (so they appear on the prototype).

---

## Key Takeaways

- Methods define an object's **behaviour**
- Use `void` when a method returns nothing; use a type when it returns a value
- Methods can take **parameters** and **return values**
- Methods can modify the object's internal state (attributes)
- **Method chaining** returns `this` for fluent APIs
- `self` (Python) and `this` (Java/C++/JS) refer to the current object

Next: **Constructors** — initializing objects properly.
