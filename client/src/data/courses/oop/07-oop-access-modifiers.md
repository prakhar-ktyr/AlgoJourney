---
title: Access Modifiers
---

# Access Modifiers

**Access modifiers** control who can see and use a class's attributes and methods. They are the foundation of **encapsulation** — one of the four pillars of OOP.

---

## Why Access Modifiers?

Without access control, any code can read or change an object's internal data:

```cpp
BankAccount acc("Alice", 1000);
acc.balance = -999999;  // Dangerous! No validation!
```

```csharp
BankAccount acc = new BankAccount("Alice", 1000);
acc.Balance = -999999;  // Dangerous! No validation!
```

```java
BankAccount acc = new BankAccount("Alice", 1000);
acc.balance = -999999;  // Dangerous! No validation!
```

```python
acc = BankAccount("Alice", 1000)
acc.balance = -999999  # Dangerous! No validation!
```

```javascript
const acc = new BankAccount("Alice", 1000);
acc.balance = -999999;  // Dangerous! No validation!
```

Access modifiers prevent this by restricting direct access to sensitive data.

---

## The Four Access Levels (Java/C++)

Java has four access modifiers, C++ has three sections:

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| *(default)* | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

### `public`

Accessible from **anywhere**:

```cpp
class Dog {
public:
    string name;   // Anyone can read/write

    void bark() {  // Anyone can call
        cout << name << " says: Woof!" << endl;
    }
};
```

```csharp
using System;

class Dog
{
    public string Name;   // Anyone can read/write

    public void Bark()    // Anyone can call
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
}
```

```java
public class Dog {
    public String name;   // Anyone can read/write

    public void bark() {  // Anyone can call
        System.out.println(name + " says: Woof!");
    }
}
```

```python
class Dog:
    def __init__(self, name):
        self.name = name   # Public — anyone can read/write

    def bark(self):        # Public — anyone can call
        print(f"{self.name} says: Woof!")
```

```javascript
class Dog {
    constructor(name) {
        this.name = name;   // Public — anyone can read/write
    }

    bark() {               // Public — anyone can call
        console.log(`${this.name} says: Woof!`);
    }
}
```

### `private`

Accessible **only within the same class**:

```cpp
class BankAccount {
private:
    double balance;  // Only BankAccount methods can access

public:
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;  // OK — same class
        }
    }

    double getBalance() {
        return balance;         // OK — same class
    }
};

int main() {
    BankAccount acc;
    // acc.balance = 500;   // ❌ Compile error — private!
    acc.deposit(500);       // ✅ Uses the public method
    return 0;
}
```

```csharp
using System;

class BankAccount
{
    private double balance;  // Only BankAccount methods can access

    public void Deposit(double amount)
    {
        if (amount > 0)
        {
            balance += amount;  // OK — same class
        }
    }

    public double GetBalance()
    {
        return balance;         // OK — same class
    }
}

class Program
{
    static void Main()
    {
        BankAccount acc = new BankAccount();
        // acc.balance = 500;   // ❌ Compile error — private!
        acc.Deposit(500);       // ✅ Uses the public method
    }
}
```

```java
public class BankAccount {
    private double balance;  // Only BankAccount methods can access

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;  // OK — same class
        }
    }

    public double getBalance() {
        return balance;         // OK — same class
    }
}

BankAccount acc = new BankAccount();
// acc.balance = 500;   // ❌ Compile error — private!
acc.deposit(500);       // ✅ Uses the public method
```

```python
class BankAccount:
    def __init__(self):
        self.__balance = 0  # "Private" via name mangling

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount  # OK — same class

    def get_balance(self):
        return self.__balance         # OK — same class

acc = BankAccount()
# acc.__balance = 500   # ❌ AttributeError
acc.deposit(500)        # ✅ Uses the public method
```

```javascript
class BankAccount {
    #balance;  // Private field (ES2022)

    constructor() {
        this.#balance = 0;
    }

    deposit(amount) {
        if (amount > 0) {
            this.#balance += amount;  // OK — same class
        }
    }

    getBalance() {
        return this.#balance;         // OK — same class
    }
}

const acc = new BankAccount();
// acc.#balance = 500;  // ❌ SyntaxError — private!
acc.deposit(500);       // ✅ Uses the public method
```

### `protected`

Accessible within the same class, same package, and **subclasses** (even in other packages):

```cpp
class Animal {
protected:
    string species;

    void breathe() {
        cout << species << " is breathing" << endl;
    }
};

class Dog : public Animal {
public:
    void info() {
        species = "Canine";     // ✅ OK — subclass access
        breathe();              // ✅ OK — subclass access
    }
};
```

```csharp
using System;

class Animal
{
    protected string Species;

    protected void Breathe()
    {
        Console.WriteLine($"{Species} is breathing");
    }
}

class Dog : Animal
{
    public void Info()
    {
        Species = "Canine";     // ✅ OK — subclass access
        Breathe();              // ✅ OK — subclass access
    }
}
```

```java
public class Animal {
    protected String species;  // Subclasses can access

    protected void breathe() {
        System.out.println(species + " is breathing");
    }
}

public class Dog extends Animal {
    public void info() {
        species = "Canine";     // ✅ OK — subclass access
        breathe();              // ✅ OK — subclass access
    }
}
```

```python
class Animal:
    def __init__(self):
        self._species = ""  # "Protected" by convention (single underscore)

    def _breathe(self):
        print(f"{self._species} is breathing")

class Dog(Animal):
    def info(self):
        self._species = "Canine"  # ✅ OK — subclass access
        self._breathe()           # ✅ OK — subclass access
```

```javascript
class Animal {
    constructor() {
        this._species = "";  // "Protected" by convention (no enforcement)
    }

    _breathe() {
        console.log(`${this._species} is breathing`);
    }
}

class Dog extends Animal {
    info() {
        this._species = "Canine";  // ✅ OK — subclass access
        this._breathe();           // ✅ OK — subclass access
    }
}
```

---

## Access Modifiers Summary by Language

| Language | Public | Protected | Private | Enforcement |
|----------|--------|-----------|---------|-------------|
| C++ | `public:` section | `protected:` section | `private:` section | Compiler-enforced |
| C# | `public` keyword | `protected` keyword | `private` keyword | Compiler-enforced |
| Java | `public` keyword | `protected` keyword | `private` keyword | Compiler-enforced |
| Python | `name` | `_name` (convention) | `__name` (name mangling) | Convention only |
| JavaScript | `name` | `_name` (convention) | `#name` (ES2022) | `#` is enforced |

---

## The `internal` Modifier (C#)

C# has an additional access modifier not found in other languages:

| Modifier | Accessible From |
|----------|----------------|
| `internal` | Same assembly (project) only |
| `protected internal` | Same assembly OR subclasses |
| `private protected` | Same assembly AND subclasses |

```csharp
// internal — accessible anywhere within this project, but not from other projects
internal class DatabaseHelper
{
    internal void Connect() { }
    
    private string connectionString;  // private — same class only
    protected int timeout;            // protected — subclasses only
    public string Status;             // public — everyone
}
```

Use `internal` for classes and methods that should be available project-wide but hidden from external consumers of your library.

---

## Best Practices

### 1. Make Attributes Private

Always start with `private` and expose through methods:

```cpp
class Employee {
private:
    string name;
    double salary;

public:
    string getName() {
        return name;
    }

    void setSalary(double salary) {
        if (salary >= 0) {
            this->salary = salary;
        }
    }
};
```

```csharp
class Animal
{
    public string Name;        // ✅ Inherited
    protected int Age;         // ✅ Inherited (accessible in subclass)
    private string dna;        // ❌ NOT inherited (not accessible)

    public void Eat() { }      // ✅ Inherited
    private void Digest() { }  // ❌ NOT inherited
}
```

```java
public class Employee {
    private String name;
    private double salary;

    // Controlled access through methods
    public String getName() {
        return name;
    }

    public void setSalary(double salary) {
        if (salary >= 0) {
            this.salary = salary;
        }
    }
}
```

```python
class Employee:
    def __init__(self, name, salary):
        self.__name = name
        self.__salary = salary

    @property
    def name(self):
        return self.__name

    @property
    def salary(self):
        return self.__salary

    @salary.setter
    def salary(self, value):
        if value >= 0:
            self.__salary = value
```

```javascript
class Employee {
    #name;
    #salary;

    constructor(name, salary) {
        this.#name = name;
        this.#salary = salary;
    }

    getName() {
        return this.#name;
    }

    setSalary(salary) {
        if (salary >= 0) {
            this.#salary = salary;
        }
    }
}
```

### 2. Make Methods as Restrictive as Possible

Only make methods `public` if external code needs them. Helper methods should be `private`:

```cpp
class EmailSender {
public:
    void sendEmail(string to, string body) {
        string validated = validateAddress(to);
        string formatted = formatBody(body);
        deliverEmail(validated, formatted);
    }

private:
    string validateAddress(string email) {
        // validation logic
        return email;
    }

    string formatBody(string body) {
        return "<html><body>" + body + "</body></html>";
    }

    void deliverEmail(string to, string body) {
        // actual sending logic
    }
};
```

```csharp
class Employee
{
    private string name;
    private double salary;

    // Controlled access through methods
    public string GetName()
    {
        return name;
    }

    public void SetSalary(double salary)
    {
        if (salary >= 0)
        {
            this.salary = salary;
        }
    }
}
```

```java
public class EmailSender {
    // Public API
    public void sendEmail(String to, String body) {
        String validated = validateAddress(to);
        String formatted = formatBody(body);
        deliverEmail(validated, formatted);
    }

    // Internal helpers — no one outside needs these
    private String validateAddress(String email) {
        // validation logic
        return email.trim();
    }

    private String formatBody(String body) {
        return "<html><body>" + body + "</body></html>";
    }

    private void deliverEmail(String to, String body) {
        // actual sending logic
    }
}
```

```python
class EmailSender:
    def send_email(self, to, body):
        validated = self.__validate_address(to)
        formatted = self.__format_body(body)
        self.__deliver_email(validated, formatted)

    def __validate_address(self, email):
        return email.strip()

    def __format_body(self, body):
        return f"<html><body>{body}</body></html>"

    def __deliver_email(self, to, body):
        # actual sending logic
        pass
```

```javascript
class EmailSender {
    sendEmail(to, body) {
        const validated = this.#validateAddress(to);
        const formatted = this.#formatBody(body);
        this.#deliverEmail(validated, formatted);
    }

    #validateAddress(email) {
        return email.trim();
    }

    #formatBody(body) {
        return `<html><body>${body}</body></html>`;
    }

    #deliverEmail(to, body) {
        // actual sending logic
    }
}
```

### 3. Use `protected` Sparingly

Only use `protected` when you specifically want subclasses to access a member.

---

## Quick Reference

```
┌──────────────────────────────────────────────────┐
│                    Access Levels                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  private    →  Same class only                   │
│  (default)  →  Same class + same package         │
│  protected  →  Same class + package + subclasses │
│  public     →  Everyone                          │
│                                                   │
│  Rule of thumb:                                   │
│  Start private. Widen only when needed.           │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Key Takeaways

- Access modifiers control **visibility** of class members
- `private` = most restrictive (same class only)
- `public` = least restrictive (accessible everywhere)
- **Default rule**: make everything `private` until you have a reason to expose it
- Python uses **naming conventions** (`_` and `__`) instead of enforced modifiers
- JavaScript uses `#` prefix for true private fields (ES2022)
- Proper access control is the foundation of **encapsulation**

Next: **Getters and Setters** — controlled access to private attributes.
