---
title: Single Responsibility Principle
---

# Single Responsibility Principle (SRP)

> "A class should have only one reason to change."
> — Robert C. Martin

The **Single Responsibility Principle** states that every class should be responsible for **one thing** and **one thing only**.

---

## What Does "One Responsibility" Mean?

A responsibility is a **reason to change**. If a class has two responsibilities, it has two reasons to change — and changes in one can break the other.

---

## Violation Example

```cpp
// ❌ BAD — Three responsibilities in one class
#include <iostream>
#include <string>

class Employee {
public:
    std::string name;
    double salary;

    // Responsibility 1: Calculate pay
    double calculatePay() {
        return salary * 1.1;  // 10% bonus
    }

    // Responsibility 2: Save to database
    void saveToDatabase() {
        std::cout << "Saving " << name << " to DB" << std::endl;
    }

    // Responsibility 3: Format a report
    std::string generateReport() {
        return "Employee Report\nName: " + name
             + "\nSalary: $" + std::to_string(salary);
    }
};
```

```csharp
// ❌ BAD — Three responsibilities in one class
using System;

class Employee
{
    public string Name { get; set; }
    public double Salary { get; set; }

    // Responsibility 1: Calculate pay
    public double CalculatePay() => Salary * 1.1;  // 10% bonus

    // Responsibility 2: Save to database
    public void SaveToDatabase()
    {
        Console.WriteLine($"Saving {Name} to DB");
    }

    // Responsibility 3: Format a report
    public string GenerateReport()
    {
        return $"Employee Report\nName: {Name}\nSalary: ${Salary}";
    }
}
```

```java
// ❌ BAD — Three responsibilities in one class
class Employee {
    String name;
    double salary;

    // Responsibility 1: Calculate pay
    double calculatePay() {
        return salary * 1.1;  // 10% bonus
    }

    // Responsibility 2: Save to database
    void saveToDatabase() {
        // SQL insert...
        System.out.println("Saving " + name + " to DB");
    }

    // Responsibility 3: Format a report
    String generateReport() {
        return "Employee Report\nName: " + name
             + "\nSalary: $" + salary;
    }
}
```

```python
# ❌ BAD — Three responsibilities in one class
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    # Responsibility 1: Calculate pay
    def calculate_pay(self):
        return self.salary * 1.1  # 10% bonus

    # Responsibility 2: Save to database
    def save_to_database(self):
        print(f"Saving {self.name} to DB")

    # Responsibility 3: Format a report
    def generate_report(self):
        return f"Employee Report\nName: {self.name}\nSalary: ${self.salary}"
```

```javascript
// ❌ BAD — Three responsibilities in one class
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }

  // Responsibility 1: Calculate pay
  calculatePay() {
    return this.salary * 1.1;  // 10% bonus
  }

  // Responsibility 2: Save to database
  saveToDatabase() {
    console.log(`Saving ${this.name} to DB`);
  }

  // Responsibility 3: Format a report
  generateReport() {
    return `Employee Report\nName: ${this.name}\nSalary: $${this.salary}`;
  }
}
```

Problems:
- If the payroll rules change → modify `Employee`
- If the database schema changes → modify `Employee`
- If the report format changes → modify `Employee`
- Three unrelated changes all touch the same class

---

## SRP-Compliant Version

```cpp
// ✅ Each class has ONE responsibility
#include <iostream>
#include <string>

// Responsibility: Employee data
class Employee {
public:
    std::string name;
    double salary;

    Employee(const std::string& name, double salary)
        : name(name), salary(salary) { }
};

// Responsibility: Payroll calculations
class PayrollCalculator {
public:
    double calculatePay(const Employee& employee) {
        return employee.salary * 1.1;
    }
};

// Responsibility: Database persistence
class EmployeeRepository {
public:
    void save(const Employee& employee) {
        std::cout << "Saving " << employee.name << " to DB" << std::endl;
    }

    Employee* findByName(const std::string& name) {
        // database query...
        return nullptr;
    }
};

// Responsibility: Report generation
class EmployeeReportGenerator {
public:
    std::string generate(const Employee& employee) {
        return "Employee Report\nName: " + employee.name
             + "\nSalary: $" + std::to_string(employee.salary);
    }
};
```

```csharp
// ✅ Each class has ONE responsibility
using System;

// Responsibility: Employee data
class Employee
{
    public string Name { get; }
    public double Salary { get; }
    public Employee(string name, double salary) { Name = name; Salary = salary; }
}

// Responsibility: Payroll calculations
class PayrollCalculator
{
    public double CalculatePay(Employee employee) => employee.Salary * 1.1;
}

// Responsibility: Database persistence
class EmployeeRepository
{
    public void Save(Employee employee)
        => Console.WriteLine($"Saving {employee.Name} to DB");

    public Employee? FindByName(string name) => null; // database query...
}

// Responsibility: Report generation
class EmployeeReportGenerator
{
    public string Generate(Employee employee)
        => $"Employee Report\nName: {employee.Name}\nSalary: ${employee.Salary}";
}
```

```java
// ✅ Each class has ONE responsibility

// Responsibility: Employee data
class Employee {
    String name;
    double salary;

    Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }
}

// Responsibility: Payroll calculations
class PayrollCalculator {
    double calculatePay(Employee employee) {
        return employee.salary * 1.1;
    }
}

// Responsibility: Database persistence
class EmployeeRepository {
    void save(Employee employee) {
        System.out.println("Saving " + employee.name + " to DB");
    }

    Employee findByName(String name) {
        // database query...
        return null;
    }
}

// Responsibility: Report generation
class EmployeeReportGenerator {
    String generate(Employee employee) {
        return "Employee Report\nName: " + employee.name
             + "\nSalary: $" + employee.salary;
    }
}
```

```python
# ✅ Each class has ONE responsibility

# Responsibility: Employee data
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

# Responsibility: Payroll calculations
class PayrollCalculator:
    def calculate_pay(self, employee):
        return employee.salary * 1.1

# Responsibility: Database persistence
class EmployeeRepository:
    def save(self, employee):
        print(f"Saving {employee.name} to DB")

    def find_by_name(self, name):
        # database query...
        return None

# Responsibility: Report generation
class EmployeeReportGenerator:
    def generate(self, employee):
        return f"Employee Report\nName: {employee.name}\nSalary: ${employee.salary}"
```

```javascript
// ✅ Each class has ONE responsibility

// Responsibility: Employee data
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
}

// Responsibility: Payroll calculations
class PayrollCalculator {
  calculatePay(employee) {
    return employee.salary * 1.1;
  }
}

// Responsibility: Database persistence
class EmployeeRepository {
  save(employee) {
    console.log(`Saving ${employee.name} to DB`);
  }

  findByName(name) {
    // database query...
    return null;
  }
}

// Responsibility: Report generation
class EmployeeReportGenerator {
  generate(employee) {
    return `Employee Report\nName: ${employee.name}\nSalary: $${employee.salary}`;
  }
}
```

Now each class has **one reason to change**:
- Payroll rules change → only `PayrollCalculator` changes
- Database schema changes → only `EmployeeRepository` changes
- Report format changes → only `EmployeeReportGenerator` changes

---

## Another Example — User Service

### Before SRP

```cpp
// ❌ BAD
#include <iostream>
#include <string>
#include <stdexcept>

class UserService {
public:
    void registerUser(const std::string& email, const std::string& password) {
        // Validate email
        if (email.find('@') == std::string::npos)
            throw std::runtime_error("Invalid email");

        // Hash password
        std::string hashed = hashPassword(password);

        // Save to database
        saveToDb(email, hashed);

        // Send welcome email
        sendEmail(email, "Welcome!", "Thanks for joining!");

        // Log the event
        std::cout << "User registered: " << email << std::endl;
    }

private:
    std::string hashPassword(const std::string& pw) { return pw; }
    void saveToDb(const std::string& email, const std::string& pw) { }
    void sendEmail(const std::string& to, const std::string& subject, const std::string& body) { }
};
```

```csharp
// ❌ BAD
using System;

class UserService
{
    public void RegisterUser(string email, string password)
    {
        // Validate email
        if (!email.Contains("@")) throw new Exception("Invalid email");

        // Hash password
        string hashed = HashPassword(password);

        // Save to database
        SaveToDb(email, hashed);

        // Send welcome email
        SendEmail(email, "Welcome!", "Thanks for joining!");

        // Log the event
        Console.WriteLine($"User registered: {email}");
    }

    private string HashPassword(string pw) => pw;
    private void SaveToDb(string email, string pw) { }
    private void SendEmail(string to, string subject, string body) { }
}
```

```java
// ❌ BAD
class UserService {
    void registerUser(String email, String password) {
        // Validate email
        if (!email.contains("@")) throw new RuntimeException("Invalid email");

        // Hash password
        String hashed = hashPassword(password);

        // Save to database
        saveToDb(email, hashed);

        // Send welcome email
        sendEmail(email, "Welcome!", "Thanks for joining!");

        // Log the event
        System.out.println("User registered: " + email);
    }

    private String hashPassword(String pw) { return pw; }
    private void saveToDb(String email, String pw) { }
    private void sendEmail(String to, String subject, String body) { }
}
```

```python
# ❌ BAD
class UserService:
    def register_user(self, email, password):
        # Validate email
        if "@" not in email:
            raise ValueError("Invalid email")

        # Hash password
        hashed = self._hash_password(password)

        # Save to database
        self._save_to_db(email, hashed)

        # Send welcome email
        self._send_email(email, "Welcome!", "Thanks for joining!")

        # Log the event
        print(f"User registered: {email}")

    def _hash_password(self, pw): return pw
    def _save_to_db(self, email, pw): pass
    def _send_email(self, to, subject, body): pass
```

```javascript
// ❌ BAD
class UserService {
  registerUser(email, password) {
    // Validate email
    if (!email.includes("@")) throw new Error("Invalid email");

    // Hash password
    const hashed = this.#hashPassword(password);

    // Save to database
    this.#saveToDb(email, hashed);

    // Send welcome email
    this.#sendEmail(email, "Welcome!", "Thanks for joining!");

    // Log the event
    console.log(`User registered: ${email}`);
  }

  #hashPassword(pw) { return pw; }
  #saveToDb(email, pw) { }
  #sendEmail(to, subject, body) { }
}
```

### After SRP

```cpp
// ✅ GOOD — Each class has one focus
#include <iostream>
#include <string>

class EmailValidator {
public:
    bool isValid(const std::string& email) {
        return !email.empty() && email.find('@') != std::string::npos;
    }
};

class PasswordHasher {
public:
    std::string hash(const std::string& password) {
        // hashing logic
        return password;
    }
};

class UserRepository {
public:
    void save(const std::string& email, const std::string& hashedPassword) {
        // database logic
    }
};

class EmailService {
public:
    void sendWelcome(const std::string& email) {
        // email sending logic
    }
};

class Logger {
public:
    void log(const std::string& message) {
        std::cout << message << std::endl;
    }
};

// Orchestrator — coordinates the workflow
class UserRegistrationService {
    EmailValidator& validator_;
    PasswordHasher& hasher_;
    UserRepository& repository_;
    EmailService& emailService_;
    Logger& logger_;

public:
    UserRegistrationService(EmailValidator& v, PasswordHasher& h,
                            UserRepository& r, EmailService& e, Logger& l)
        : validator_(v), hasher_(h), repository_(r), emailService_(e), logger_(l) { }

    void registerUser(const std::string& email, const std::string& password) {
        if (!validator_.isValid(email))
            throw std::runtime_error("Invalid email");
        std::string hashed = hasher_.hash(password);
        repository_.save(email, hashed);
        emailService_.sendWelcome(email);
        logger_.log("User registered: " + email);
    }
};
```

```csharp
// ✅ GOOD — Each class has one focus
using System;

class EmailValidator
{
    public bool IsValid(string email) => !string.IsNullOrEmpty(email) && email.Contains("@");
}

class PasswordHasher
{
    public string Hash(string password) => password; // hashing logic
}

class UserRepository
{
    public void Save(string email, string hashedPassword) { /* database logic */ }
}

class EmailService
{
    public void SendWelcome(string email) { /* email sending logic */ }
}

class Logger
{
    public void Log(string message) => Console.WriteLine(message);
}

// Orchestrator — coordinates the workflow
class UserRegistrationService
{
    private readonly EmailValidator validator;
    private readonly PasswordHasher hasher;
    private readonly UserRepository repository;
    private readonly EmailService emailService;
    private readonly Logger logger;

    public UserRegistrationService(EmailValidator v, PasswordHasher h,
        UserRepository r, EmailService e, Logger l)
    {
        validator = v; hasher = h; repository = r;
        emailService = e; logger = l;
    }

    public void Register(string email, string password)
    {
        if (!validator.IsValid(email))
            throw new InvalidOperationException("Invalid email");
        string hashed = hasher.Hash(password);
        repository.Save(email, hashed);
        emailService.SendWelcome(email);
        logger.Log($"User registered: {email}");
    }
}
```

```java
// ✅ GOOD — Each class has one focus

class EmailValidator {
    boolean isValid(String email) {
        return email != null && email.contains("@");
    }
}

class PasswordHasher {
    String hash(String password) {
        // hashing logic
        return password;
    }
}

class UserRepository {
    void save(String email, String hashedPassword) {
        // database logic
    }
}

class EmailService {
    void sendWelcome(String email) {
        // email sending logic
    }
}

class Logger {
    void log(String message) {
        System.out.println(message);
    }
}

// Orchestrator — coordinates the workflow
class UserRegistrationService {
    private EmailValidator validator;
    private PasswordHasher hasher;
    private UserRepository repository;
    private EmailService emailService;
    private Logger logger;

    UserRegistrationService(EmailValidator v, PasswordHasher h,
                            UserRepository r, EmailService e, Logger l) {
        this.validator = v;
        this.hasher = h;
        this.repository = r;
        this.emailService = e;
        this.logger = l;
    }

    void register(String email, String password) {
        if (!validator.isValid(email)) {
            throw new RuntimeException("Invalid email");
        }
        String hashed = hasher.hash(password);
        repository.save(email, hashed);
        emailService.sendWelcome(email);
        logger.log("User registered: " + email);
    }
}
```

```python
# ✅ GOOD — Each class has one focus

class EmailValidator:
    def is_valid(self, email):
        return email is not None and "@" in email

class PasswordHasher:
    def hash(self, password):
        # hashing logic
        return password

class UserRepository:
    def save(self, email, hashed_password):
        # database logic
        pass

class EmailService:
    def send_welcome(self, email):
        # email sending logic
        pass

class Logger:
    def log(self, message):
        print(message)

# Orchestrator — coordinates the workflow
class UserRegistrationService:
    def __init__(self, validator, hasher, repository, email_service, logger):
        self.validator = validator
        self.hasher = hasher
        self.repository = repository
        self.email_service = email_service
        self.logger = logger

    def register(self, email, password):
        if not self.validator.is_valid(email):
            raise ValueError("Invalid email")
        hashed = self.hasher.hash(password)
        self.repository.save(email, hashed)
        self.email_service.send_welcome(email)
        self.logger.log(f"User registered: {email}")
```

```javascript
// ✅ GOOD — Each class has one focus

class EmailValidator {
  isValid(email) {
    return email != null && email.includes("@");
  }
}

class PasswordHasher {
  hash(password) {
    // hashing logic
    return password;
  }
}

class UserRepository {
  save(email, hashedPassword) {
    // database logic
  }
}

class EmailService {
  sendWelcome(email) {
    // email sending logic
  }
}

class Logger {
  log(message) {
    console.log(message);
  }
}

// Orchestrator — coordinates the workflow
class UserRegistrationService {
  constructor(validator, hasher, repository, emailService, logger) {
    this.validator = validator;
    this.hasher = hasher;
    this.repository = repository;
    this.emailService = emailService;
    this.logger = logger;
  }

  register(email, password) {
    if (!this.validator.isValid(email)) {
      throw new Error("Invalid email");
    }
    const hashed = this.hasher.hash(password);
    this.repository.save(email, hashed);
    this.emailService.sendWelcome(email);
    this.logger.log(`User registered: ${email}`);
  }
}
```

---

## How to Identify SRP Violations

Ask yourself:

1. **Can you describe the class in one sentence without "and"?**
   - "This class manages user data" ✅
   - "This class manages user data **and** sends emails **and** logs events" ❌

2. **Who would ask you to change this class?**
   - If different stakeholders (payroll dept, IT dept, marketing) would each want changes, the class has too many responsibilities

3. **Does the class have unrelated private methods?**
   - `hashPassword()` and `formatReport()` in the same class = red flag

---

## Common SRP Patterns

| Pattern | Single Responsibility |
|---------|----------------------|
| **Repository** | Database access for one entity |
| **Service** | Business logic for one domain |
| **Controller** | Handle requests for one resource |
| **Validator** | Validate one type of input |
| **Formatter** | Format one type of output |
| **Factory** | Create one type of object |

---

## Key Takeaways

- SRP: each class has **one responsibility** and **one reason to change**
- Split classes that do multiple unrelated things
- Use an **orchestrator** class to coordinate multiple single-responsibility classes
- Test: describe the class in one sentence — if you need "and," split it
- SRP makes code **easier to test**, **easier to maintain**, and **easier to understand**

Next: **Open/Closed Principle** — extend behaviour without modifying existing code.
