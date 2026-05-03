---
title: What is OOP?
---

# What is OOP?

**Object-Oriented Programming (OOP)** is a programming paradigm — a way of thinking about and structuring your code — based on the concept of **objects**.

An **object** bundles together **data** (what it knows) and **behaviour** (what it can do) into a single unit.

---

## Programming Paradigms

Before OOP, let's understand what a "paradigm" is. A programming paradigm is a style or approach to writing programs.

| Paradigm | Core Idea | Example Languages |
|----------|-----------|-------------------|
| **Procedural** | Step-by-step instructions in functions | C, Pascal, early BASIC |
| **Object-Oriented** | Code organized around objects | Java, Python, C++, C# |
| **Functional** | Pure functions, no mutable state | Haskell, Lisp, Erlang |
| **Multi-Paradigm** | Supports multiple styles | Python, JavaScript, Scala |

Most modern languages support multiple paradigms, but OOP is the dominant one in industry.

---

## Procedural vs OOP — A Comparison

Imagine you're building a banking system. Here's how the two paradigms differ:

### Procedural Approach

```cpp
#include <iostream>
#include <string>
using namespace std;

// Data is separate from functions
string account_name = "Alice";
double account_balance = 1000;

double deposit(double balance, double amount) {
    return balance + amount;
}

double withdraw(double balance, double amount) {
    if (amount > balance) {
        cout << "Insufficient funds" << endl;
        return balance;
    }
    return balance - amount;
}

int main() {
    account_balance = deposit(account_balance, 500);
    account_balance = withdraw(account_balance, 200);
    return 0;
}
```

```csharp
using System;

// Data is separate from functions
class Program
{
    static string accountName = "Alice";
    static double accountBalance = 1000;

    static double Deposit(double balance, double amount)
    {
        return balance + amount;
    }

    static double Withdraw(double balance, double amount)
    {
        if (amount > balance)
        {
            Console.WriteLine("Insufficient funds");
            return balance;
        }
        return balance - amount;
    }

    static void Main()
    {
        accountBalance = Deposit(accountBalance, 500);
        accountBalance = Withdraw(accountBalance, 200);
    }
}
```

```java
public class Main {
    // Data is separate from functions
    static String accountName = "Alice";
    static double accountBalance = 1000;

    static double deposit(double balance, double amount) {
        return balance + amount;
    }

    static double withdraw(double balance, double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds");
            return balance;
        }
        return balance - amount;
    }

    public static void main(String[] args) {
        accountBalance = deposit(accountBalance, 500);
        accountBalance = withdraw(accountBalance, 200);
    }
}
```

```python
# Data is separate from functions
account_name = "Alice"
account_balance = 1000

def deposit(balance, amount):
    return balance + amount

def withdraw(balance, amount):
    if amount > balance:
        print("Insufficient funds")
        return balance
    return balance - amount

# You must manually pass data to functions
account_balance = deposit(account_balance, 500)
account_balance = withdraw(account_balance, 200)
```

```javascript
// Data is separate from functions
let accountName = "Alice";
let accountBalance = 1000;

function deposit(balance, amount) {
    return balance + amount;
}

function withdraw(balance, amount) {
    if (amount > balance) {
        console.log("Insufficient funds");
        return balance;
    }
    return balance - amount;
}

// You must manually pass data to functions
accountBalance = deposit(accountBalance, 500);
accountBalance = withdraw(accountBalance, 200);
```

Problems with this approach:
- Data (`account_name`, `account_balance`) and functions (`deposit`, `withdraw`) are **separate**
- Nothing prevents you from accidentally modifying `account_balance` directly
- Hard to manage when you have hundreds of accounts

### OOP Approach

```cpp
#include <iostream>
#include <string>
using namespace std;

class BankAccount {
public:
    string name;
    double balance;

    BankAccount(string name, double balance) {
        this->name = name;
        this->balance = balance;
    }

    void deposit(double amount) {
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount > balance) {
            cout << "Insufficient funds" << endl;
            return;
        }
        balance -= amount;
    }
};

int main() {
    BankAccount alice("Alice", 1000);
    alice.deposit(500);
    alice.withdraw(200);
    cout << alice.balance << endl;  // 1300
    return 0;
}
```

```csharp
using System;

class BankAccount
{
    public string Name;
    public double Balance;

    public BankAccount(string name, double balance)
    {
        Name = name;
        Balance = balance;
    }

    public void Deposit(double amount)
    {
        Balance += amount;
    }

    public void Withdraw(double amount)
    {
        if (amount > Balance)
        {
            Console.WriteLine("Insufficient funds");
            return;
        }
        Balance -= amount;
    }
}

class Program
{
    static void Main()
    {
        BankAccount alice = new BankAccount("Alice", 1000);
        alice.Deposit(500);
        alice.Withdraw(200);
        Console.WriteLine(alice.Balance);  // 1300
    }
}
```

```java
public class BankAccount {
    String name;
    double balance;

    BankAccount(String name, double balance) {
        this.name = name;
        this.balance = balance;
    }

    void deposit(double amount) {
        this.balance += amount;
    }

    void withdraw(double amount) {
        if (amount > this.balance) {
            System.out.println("Insufficient funds");
            return;
        }
        this.balance -= amount;
    }

    public static void main(String[] args) {
        BankAccount alice = new BankAccount("Alice", 1000);
        alice.deposit(500);
        alice.withdraw(200);
        System.out.println(alice.balance);  // 1300
    }
}
```

```python
class BankAccount:
    def __init__(self, name, balance):
        self.name = name
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
            return
        self.balance -= amount

# Data and behaviour live together
alice = BankAccount("Alice", 1000)
alice.deposit(500)
alice.withdraw(200)
print(alice.balance)  # 1300
```

```javascript
class BankAccount {
    constructor(name, balance) {
        this.name = name;
        this.balance = balance;
    }

    deposit(amount) {
        this.balance += amount;
    }

    withdraw(amount) {
        if (amount > this.balance) {
            console.log("Insufficient funds");
            return;
        }
        this.balance -= amount;
    }
}

// Data and behaviour live together
const alice = new BankAccount("Alice", 1000);
alice.deposit(500);
alice.withdraw(200);
console.log(alice.balance);  // 1300
```

Benefits:
- Data and behaviour are **bundled** inside the `BankAccount` class
- Each account is an independent **object** with its own state
- Creating 100 accounts is just calling the constructor 100 times

---

## The Building Blocks of OOP

OOP is built on a few key concepts:

### 1. Class

A **class** is a blueprint or template. It defines what data an object will hold and what actions it can perform.

Think of a class like an architectural blueprint for a house — it describes the rooms, dimensions, and layout, but it's not a house itself.

### 2. Object

An **object** is a concrete instance created from a class. It's the actual "thing" with real data.

If the class is the blueprint, an object is the actual house built from it. You can build many houses from the same blueprint, and each can have different paint colours and furniture.

### 3. Attribute (Field / Property)

An **attribute** is a piece of data stored inside an object. It represents the object's **state**.

```
Dog class:
  ├── name = "Rex"       ← attribute
  ├── breed = "Labrador"  ← attribute
  └── age = 3             ← attribute
```

### 4. Method

A **method** is a function defined inside a class. It represents the object's **behaviour**.

```
Dog class:
  ├── bark()    ← method
  ├── eat()     ← method
  └── sleep()   ← method
```

---

## The Four Pillars of OOP

OOP is founded on four core principles, often called the "four pillars":

| Pillar | What It Means | Analogy |
|--------|---------------|---------|
| **Encapsulation** | Bundle data + methods, hide internals | A car dashboard — you press buttons without knowing the engine internals |
| **Inheritance** | Create new classes from existing ones | A child inherits traits from parents |
| **Polymorphism** | One interface, many implementations | A USB port works with keyboards, mice, drives — same interface, different devices |
| **Abstraction** | Show only what's necessary, hide complexity | An ATM — you interact with the screen, not the bank's servers |

We'll dedicate full lessons to each pillar.

---

## A Brief History

| Year | Event |
|------|-------|
| 1967 | **Simula** — first language with OOP features (classes, objects, inheritance) |
| 1972 | **Smalltalk** — coined the term "object-oriented", introduced message passing |
| 1979 | **C++** — brought OOP to systems programming |
| 1991 | **Python** — multi-paradigm with elegant OOP support |
| 1995 | **Java** — "everything is an object", enterprise standard |
| 2000 | **C#** — Microsoft's OOP language for the .NET platform |

---

## Real-World Analogy

Think of a **car** as an object:

- **Class**: The car's design/blueprint (e.g., Toyota Camry 2024 model spec)
- **Object**: Your specific car (license plate ABC-1234)
- **Attributes**: colour = red, fuel = 80%, speed = 0 km/h
- **Methods**: start(), accelerate(), brake(), turnLeft()
- **Encapsulation**: You turn the steering wheel (interface) without knowing the rack-and-pinion mechanism (implementation)
- **Inheritance**: An ElectricCar is a specialized Car with a `chargeBattery()` method
- **Polymorphism**: `vehicle.move()` works whether it's a Car, Bike, or Truck

---

## Key Takeaways

- OOP organizes code around **objects** that combine data and behaviour
- A **class** is a blueprint; an **object** is a concrete instance
- The four pillars are **encapsulation**, **inheritance**, **polymorphism**, and **abstraction**
- OOP helps manage complexity, especially in large programs
- Most popular languages (Java, Python, C++, C#, JavaScript) support OOP

Next up: **Classes and Objects** — let's create our first class.
