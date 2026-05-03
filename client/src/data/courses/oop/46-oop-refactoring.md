---
title: Refactoring OOP Code
---

# Refactoring OOP Code

**Refactoring** is the process of improving code structure without changing its external behaviour. Good refactoring makes code cleaner, more maintainable, and easier to extend.

---

## What is Refactoring?

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behaviour." — Martin Fowler

Key principle: **behaviour stays the same**, structure improves.

---

## Code Smells (Signs You Need to Refactor)

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| **Long method** | Method does too many things | Extract Method |
| **Large class** | Class has too many responsibilities | Extract Class |
| **Duplicate code** | Same logic in multiple places | Extract Method/Class |
| **Long parameter list** | Method takes too many parameters | Introduce Parameter Object |
| **Feature envy** | Method uses another class's data more than its own | Move Method |
| **Data clumps** | Same group of data appears together repeatedly | Extract Class |
| **Switch statements** | Long if/else or switch on type | Replace with Polymorphism |
| **Refused bequest** | Subclass doesn't use inherited methods | Replace Inheritance with Composition |

---

## Refactoring 1: Extract Method

### Before

```cpp
void printReport(const std::vector<Employee>& employees) {
    // Print header
    std::cout << "=================================\n";
    std::cout << "     EMPLOYEE REPORT\n";
    std::cout << "=================================\n";

    // Calculate and print each employee
    double totalSalary = 0;
    for (const auto& e : employees) {
        double bonus = e.getYearsWorked() > 5 ? e.getSalary() * 0.1 : 0;
        double total = e.getSalary() + bonus;
        totalSalary += total;
        std::cout << e.getName() << ": $" << total << "\n";
    }

    // Print footer
    std::cout << "---------------------------------\n";
    std::cout << "Total: $" << totalSalary << "\n";
    std::cout << "=================================\n";
}
```

```csharp
void PrintReport(List<Employee> employees)
{
    // Print header
    Console.WriteLine("=================================");
    Console.WriteLine("     EMPLOYEE REPORT");
    Console.WriteLine("=================================");

    // Calculate and print each employee
    double totalSalary = 0;
    foreach (var e in employees)
    {
        double bonus = e.YearsWorked > 5 ? e.Salary * 0.1 : 0;
        double total = e.Salary + bonus;
        totalSalary += total;
        Console.WriteLine($"{e.Name}: ${total}");
    }

    // Print footer
    Console.WriteLine("---------------------------------");
    Console.WriteLine($"Total: ${totalSalary}");
    Console.WriteLine("=================================");
}
```

```java
void printReport(List<Employee> employees) {
    // Print header
    System.out.println("=================================");
    System.out.println("     EMPLOYEE REPORT");
    System.out.println("=================================");

    // Calculate and print each employee
    double totalSalary = 0;
    for (Employee e : employees) {
        double bonus = e.getYearsWorked() > 5 ? e.getSalary() * 0.1 : 0;
        double total = e.getSalary() + bonus;
        totalSalary += total;
        System.out.println(e.getName() + ": $" + total);
    }

    // Print footer
    System.out.println("---------------------------------");
    System.out.println("Total: $" + totalSalary);
    System.out.println("=================================");
}
```

```python
def print_report(employees):
    # Print header
    print("=================================")
    print("     EMPLOYEE REPORT")
    print("=================================")

    # Calculate and print each employee
    total_salary = 0
    for e in employees:
        bonus = e.salary * 0.1 if e.years_worked > 5 else 0
        total = e.salary + bonus
        total_salary += total
        print(f"{e.name}: ${total}")

    # Print footer
    print("---------------------------------")
    print(f"Total: ${total_salary}")
    print("=================================")
```

```javascript
function printReport(employees) {
  // Print header
  console.log("=================================");
  console.log("     EMPLOYEE REPORT");
  console.log("=================================");

  // Calculate and print each employee
  let totalSalary = 0;
  for (const e of employees) {
    const bonus = e.yearsWorked > 5 ? e.salary * 0.1 : 0;
    const total = e.salary + bonus;
    totalSalary += total;
    console.log(`${e.name}: $${total}`);
  }

  // Print footer
  console.log("---------------------------------");
  console.log(`Total: $${totalSalary}`);
  console.log("=================================");
}
```

### After

```cpp
void printReport(const std::vector<Employee>& employees) {
    printHeader();
    double total = printEmployees(employees);
    printFooter(total);
}

void printHeader() {
    std::cout << "=================================\n";
    std::cout << "     EMPLOYEE REPORT\n";
    std::cout << "=================================\n";
}

double printEmployees(const std::vector<Employee>& employees) {
    double totalSalary = 0;
    for (const auto& e : employees) {
        double pay = calculatePay(e);
        totalSalary += pay;
        std::cout << e.getName() << ": $" << pay << "\n";
    }
    return totalSalary;
}

double calculatePay(const Employee& e) {
    double bonus = e.getYearsWorked() > 5 ? e.getSalary() * 0.1 : 0;
    return e.getSalary() + bonus;
}

void printFooter(double total) {
    std::cout << "---------------------------------\n";
    std::cout << "Total: $" << total << "\n";
    std::cout << "=================================\n";
}
```

```csharp
void PrintReport(List<Employee> employees)
{
    PrintHeader();
    double total = PrintEmployees(employees);
    PrintFooter(total);
}

void PrintHeader()
{
    Console.WriteLine("=================================");
    Console.WriteLine("     EMPLOYEE REPORT");
    Console.WriteLine("=================================");
}

double PrintEmployees(List<Employee> employees)
{
    double totalSalary = 0;
    foreach (var e in employees)
    {
        double pay = CalculatePay(e);
        totalSalary += pay;
        Console.WriteLine($"{e.Name}: ${pay}");
    }
    return totalSalary;
}

double CalculatePay(Employee e)
{
    double bonus = e.YearsWorked > 5 ? e.Salary * 0.1 : 0;
    return e.Salary + bonus;
}

void PrintFooter(double total)
{
    Console.WriteLine("---------------------------------");
    Console.WriteLine($"Total: ${total}");
    Console.WriteLine("=================================");
}
```

```java
void printReport(List<Employee> employees) {
    printHeader();
    double total = printEmployees(employees);
    printFooter(total);
}

private void printHeader() {
    System.out.println("=================================");
    System.out.println("     EMPLOYEE REPORT");
    System.out.println("=================================");
}

private double printEmployees(List<Employee> employees) {
    double totalSalary = 0;
    for (Employee e : employees) {
        double pay = calculatePay(e);
        totalSalary += pay;
        System.out.println(e.getName() + ": $" + pay);
    }
    return totalSalary;
}

private double calculatePay(Employee e) {
    double bonus = e.getYearsWorked() > 5 ? e.getSalary() * 0.1 : 0;
    return e.getSalary() + bonus;
}

private void printFooter(double total) {
    System.out.println("---------------------------------");
    System.out.println("Total: $" + total);
    System.out.println("=================================");
}
```

```python
def print_report(employees):
    print_header()
    total = print_employees(employees)
    print_footer(total)

def print_header():
    print("=================================")
    print("     EMPLOYEE REPORT")
    print("=================================")

def print_employees(employees):
    total_salary = 0
    for e in employees:
        pay = calculate_pay(e)
        total_salary += pay
        print(f"{e.name}: ${pay}")
    return total_salary

def calculate_pay(e):
    bonus = e.salary * 0.1 if e.years_worked > 5 else 0
    return e.salary + bonus

def print_footer(total):
    print("---------------------------------")
    print(f"Total: ${total}")
    print("=================================")
```

```javascript
function printReport(employees) {
  printHeader();
  const total = printEmployees(employees);
  printFooter(total);
}

function printHeader() {
  console.log("=================================");
  console.log("     EMPLOYEE REPORT");
  console.log("=================================");
}

function printEmployees(employees) {
  let totalSalary = 0;
  for (const e of employees) {
    const pay = calculatePay(e);
    totalSalary += pay;
    console.log(`${e.name}: $${pay}`);
  }
  return totalSalary;
}

function calculatePay(e) {
  const bonus = e.yearsWorked > 5 ? e.salary * 0.1 : 0;
  return e.salary + bonus;
}

function printFooter(total) {
  console.log("---------------------------------");
  console.log(`Total: $${total}`);
  console.log("=================================");
}
```

---

## Refactoring 2: Replace Conditionals with Polymorphism

### Before

```cpp
class PaymentProcessor {
public:
    void process(const Payment& payment) {
        if (payment.getType() == "credit_card") {
            std::cout << "Processing credit card\n";
            // 20 lines of credit card logic
        } else if (payment.getType() == "paypal") {
            std::cout << "Processing PayPal\n";
            // 20 lines of PayPal logic
        } else if (payment.getType() == "crypto") {
            std::cout << "Processing crypto\n";
            // 20 lines of crypto logic
        }
    }
};
```

```csharp
class PaymentProcessor
{
    public void Process(Payment payment)
    {
        if (payment.Type == "credit_card")
        {
            Console.WriteLine("Processing credit card");
            // 20 lines of credit card logic
        }
        else if (payment.Type == "paypal")
        {
            Console.WriteLine("Processing PayPal");
            // 20 lines of PayPal logic
        }
        else if (payment.Type == "crypto")
        {
            Console.WriteLine("Processing crypto");
            // 20 lines of crypto logic
        }
    }
}
```

```java
class PaymentProcessor {
    void process(Payment payment) {
        if (payment.getType().equals("credit_card")) {
            System.out.println("Processing credit card");
            // 20 lines of credit card logic
        } else if (payment.getType().equals("paypal")) {
            System.out.println("Processing PayPal");
            // 20 lines of PayPal logic
        } else if (payment.getType().equals("crypto")) {
            System.out.println("Processing crypto");
            // 20 lines of crypto logic
        }
    }
}
```

```python
class PaymentProcessor:
    def process(self, payment):
        if payment.type == "credit_card":
            print("Processing credit card")
            # 20 lines of credit card logic
        elif payment.type == "paypal":
            print("Processing PayPal")
            # 20 lines of PayPal logic
        elif payment.type == "crypto":
            print("Processing crypto")
            # 20 lines of crypto logic
```

```javascript
class PaymentProcessor {
  process(payment) {
    if (payment.type === "credit_card") {
      console.log("Processing credit card");
      // 20 lines of credit card logic
    } else if (payment.type === "paypal") {
      console.log("Processing PayPal");
      // 20 lines of PayPal logic
    } else if (payment.type === "crypto") {
      console.log("Processing crypto");
      // 20 lines of crypto logic
    }
  }
}
```

### After

```cpp
class Payment {
public:
    virtual void process() = 0;
    virtual ~Payment() = default;
};

class CreditCardPayment : public Payment {
public:
    void process() override {
        std::cout << "Processing credit card\n";
    }
};

class PayPalPayment : public Payment {
public:
    void process() override {
        std::cout << "Processing PayPal\n";
    }
};

class CryptoPayment : public Payment {
public:
    void process() override {
        std::cout << "Processing crypto\n";
    }
};

// No conditionals needed!
class PaymentProcessor {
public:
    void process(Payment& payment) {
        payment.process();
    }
};
```

```csharp
public interface IPayment
{
    void Process();
}

public class CreditCardPayment : IPayment
{
    public void Process() => Console.WriteLine("Processing credit card");
}

public class PayPalPayment : IPayment
{
    public void Process() => Console.WriteLine("Processing PayPal");
}

public class CryptoPayment : IPayment
{
    public void Process() => Console.WriteLine("Processing crypto");
}

// No conditionals needed!
public class PaymentProcessor
{
    public void Process(IPayment payment) => payment.Process();
}
```

```java
interface Payment {
    void process();
}

class CreditCardPayment implements Payment {
    @Override
    public void process() {
        System.out.println("Processing credit card");
    }
}

class PayPalPayment implements Payment {
    @Override
    public void process() {
        System.out.println("Processing PayPal");
    }
}

class CryptoPayment implements Payment {
    @Override
    public void process() {
        System.out.println("Processing crypto");
    }
}

// No conditionals needed!
class PaymentProcessor {
    void process(Payment payment) {
        payment.process();
    }
}
```

```python
from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def process(self):
        pass

class CreditCardPayment(Payment):
    def process(self):
        print("Processing credit card")

class PayPalPayment(Payment):
    def process(self):
        print("Processing PayPal")

class CryptoPayment(Payment):
    def process(self):
        print("Processing crypto")

# No conditionals needed!
class PaymentProcessor:
    def process(self, payment):
        payment.process()
```

```javascript
class Payment {
  process() { throw new Error("Not implemented"); }
}

class CreditCardPayment extends Payment {
  process() {
    console.log("Processing credit card");
  }
}

class PayPalPayment extends Payment {
  process() {
    console.log("Processing PayPal");
  }
}

class CryptoPayment extends Payment {
  process() {
    console.log("Processing crypto");
  }
}

// No conditionals needed!
class PaymentProcessor {
  process(payment) {
    payment.process();
  }
}
```

---

## Refactoring 3: Extract Class

### Before

```cpp
// Class doing too many things
class Employee {
public:
    std::string name;
    double salary;
    std::string street, city, state, zip;

    std::string getFullAddress() {
        return street + ", " + city + ", " + state + " " + zip;
    }

    double calculateTax() {
        return salary * 0.3;
    }
};
```

```csharp
// Class doing too many things
class Employee
{
    public string Name;
    public double Salary;
    public string Street, City, State, Zip;

    public string GetFullAddress()
    {
        return $"{Street}, {City}, {State} {Zip}";
    }

    public double CalculateTax()
    {
        return Salary * 0.3;
    }
}
```

```java
// Class doing too many things
class Employee {
    String name;
    double salary;
    String street, city, state, zip;

    String getFullAddress() {
        return street + ", " + city + ", " + state + " " + zip;
    }

    double calculateTax() {
        return salary * 0.3;
    }
}
```

```python
# Class doing too many things
class Employee:
    def __init__(self, name, salary, street, city, state, zip_code):
        self.name = name
        self.salary = salary
        self.street = street
        self.city = city
        self.state = state
        self.zip_code = zip_code

    def get_full_address(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

    def calculate_tax(self):
        return self.salary * 0.3
```

```javascript
// Class doing too many things
class Employee {
  constructor(name, salary, street, city, state, zip) {
    this.name = name;
    this.salary = salary;
    this.street = street;
    this.city = city;
    this.state = state;
    this.zip = zip;
  }

  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  }

  calculateTax() {
    return this.salary * 0.3;
  }
}
```

### After

```cpp
// Each class has one responsibility
class Address {
public:
    std::string street, city, state, zip;

    std::string getFullAddress() {
        return street + ", " + city + ", " + state + " " + zip;
    }
};

class TaxCalculator {
public:
    double calculate(double salary) {
        return salary * 0.3;
    }
};

class Employee {
public:
    std::string name;
    double salary;
    Address address;  // Composition

    std::string getFullAddress() {
        return address.getFullAddress();
    }
};
```

```csharp
// Each class has one responsibility
public class Address
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string Zip { get; }

    public Address(string street, string city, string state, string zip)
    {
        Street = street; City = city; State = state; Zip = zip;
    }

    public string GetFullAddress() => $"{Street}, {City}, {State} {Zip}";
}

public class TaxCalculator
{
    public double Calculate(double salary) => salary * 0.3;
}

public class Employee
{
    public string Name { get; }
    public double Salary { get; }
    public Address Address { get; }  // Composition

    public Employee(string name, double salary, Address address)
    {
        Name = name; Salary = salary; Address = address;
    }

    public string GetFullAddress() => Address.GetFullAddress();
}
```

```java
// Each class has one responsibility
class Address {
    String street, city, state, zip;

    String getFullAddress() {
        return street + ", " + city + ", " + state + " " + zip;
    }
}

class TaxCalculator {
    double calculate(double salary) {
        return salary * 0.3;
    }
}

class Employee {
    String name;
    double salary;
    Address address;  // Composition

    String getFullAddress() {
        return address.getFullAddress();
    }
}
```

```python
# Each class has one responsibility
class Address:
    def __init__(self, street, city, state, zip_code):
        self.street = street
        self.city = city
        self.state = state
        self.zip_code = zip_code

    def get_full_address(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

class TaxCalculator:
    def calculate(self, salary):
        return salary * 0.3

class Employee:
    def __init__(self, name, salary, address):
        self.name = name
        self.salary = salary
        self.address = address  # Composition

    def get_full_address(self):
        return self.address.get_full_address()
```

```javascript
// Each class has one responsibility
class Address {
  constructor(street, city, state, zip) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zip = zip;
  }

  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  }
}

class TaxCalculator {
  calculate(salary) {
    return salary * 0.3;
  }
}

class Employee {
  constructor(name, salary, address) {
    this.name = name;
    this.salary = salary;
    this.address = address; // Composition
  }

  getFullAddress() {
    return this.address.getFullAddress();
  }
}
```

---

## Refactoring Safely

1. **Write tests first** — ensure existing behaviour is captured
2. **Make small changes** — one refactoring at a time
3. **Run tests after each change** — verify nothing broke
4. **Use your IDE** — most IDEs have built-in refactoring tools (rename, extract, move)
5. **Commit frequently** — easy to rollback if something goes wrong

---

## Key Takeaways

- Refactoring improves structure **without changing behaviour**
- **Code smells** indicate when refactoring is needed
- Common refactorings: **Extract Method**, **Extract Class**, **Replace Conditional with Polymorphism**
- Always **test before and after** refactoring
- Make **small, incremental changes**
- Refactoring is a **continuous process**, not a one-time event

Next: **OOP Anti-Patterns** — common mistakes and how to avoid them.
