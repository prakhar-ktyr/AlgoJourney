---
title: Exception Handling in OOP
---

# Exception Handling in OOP

**Exceptions** are objects that represent errors or unexpected conditions. OOP languages use exception objects and class hierarchies to handle errors gracefully.

---

## What is an Exception?

An exception is an **event that disrupts the normal flow** of a program. Instead of crashing, OOP languages let you **catch** and **handle** exceptions.

```
Normal flow:     step1() → step2() → step3() → done ✅

With exception:  step1() → step2() → 💥 ERROR
                                      ↓
                              catch block handles it → recovery ✅
```

---

## Try-Catch / Try-Except

```cpp
#include <iostream>
#include <stdexcept>

try {
    int result = 10 / 0;  // Undefined behavior in C++, but let's use exceptions
    throw std::runtime_error("Division by zero");
} catch (const std::runtime_error& e) {
    std::cout << "Error: " << e.what() << std::endl;
    // Error: Division by zero
}
// C++ doesn't have finally — use RAII for cleanup
```

```csharp
try {
    int result = 10 / 0;  // Throws DivideByZeroException
    Console.WriteLine(result);
} catch (DivideByZeroException e) {
    Console.WriteLine($"Error: {e.Message}");
    // Error: Attempted to divide by zero.
} finally {
    Console.WriteLine("This always runs");
}
```

```java
try {
    int result = 10 / 0;  // Throws ArithmeticException
    System.out.println(result);
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
    // Error: / by zero
} finally {
    System.out.println("This always runs");
}
```

```python
try:
    result = 10 / 0
    print(result)
except ZeroDivisionError as e:
    print(f"Error: {e}")
    # Error: division by zero
finally:
    print("This always runs")
```

```javascript
try {
  const result = 10 / 0;  // JavaScript returns Infinity, not an error
  if (!isFinite(result)) {
    throw new Error("Division by zero");
  }
} catch (e) {
  console.log(`Error: ${e.message}`);
  // Error: Division by zero
} finally {
  console.log("This always runs");
}
```

---

## The Exception Hierarchy

Exceptions form a class hierarchy:

### Java

```
Throwable
├── Error (serious — don't catch)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── RuntimeException (unchecked)
    │   ├── NullPointerException
    │   ├── ArithmeticException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── IllegalArgumentException
    │   └── ...
    ├── IOException (checked)
    ├── SQLException (checked)
    └── ...
```

### Python

```
BaseException
├── KeyboardInterrupt
├── SystemExit
└── Exception
    ├── ValueError
    ├── TypeError
    ├── KeyError
    ├── IndexError
    ├── FileNotFoundError
    ├── ZeroDivisionError
    └── ...
```

### C++

```
std::exception
├── std::logic_error
│   ├── std::invalid_argument
│   ├── std::out_of_range
│   └── std::domain_error
├── std::runtime_error
│   ├── std::overflow_error
│   ├── std::underflow_error
│   └── std::range_error
└── std::bad_alloc
```

### JavaScript

```
Error
├── RangeError
├── ReferenceError
├── SyntaxError
├── TypeError
├── URIError
└── EvalError
```

---

## Catching Multiple Exceptions

```cpp
#include <iostream>
#include <stdexcept>
#include <fstream>

try {
    // risky code
    throw std::out_of_range("Index out of range");
} catch (const std::out_of_range& e) {
    std::cout << "Range error: " << e.what() << std::endl;
} catch (const std::runtime_error& e) {
    std::cout << "Runtime error: " << e.what() << std::endl;
} catch (const std::exception& e) {
    std::cout << "General error: " << e.what() << std::endl;
}
```

```csharp
try {
    string text = null;
    int length = text.Length;  // NullReferenceException
} catch (NullReferenceException e) {
    Console.WriteLine($"Null value: {e.Message}");
} catch (ArithmeticException e) {
    Console.WriteLine($"Math error: {e.Message}");
} catch (Exception e) {
    Console.WriteLine($"General error: {e.Message}");
}

// C# 6+: exception filters with 'when'
try {
    // risky code
} catch (IOException e) when (e.Message.Contains("disk")) {
    Console.WriteLine("Disk I/O error");
} catch (IOException e) {
    Console.WriteLine($"Other I/O error: {e.Message}");
}
```

```java
try {
    String text = null;
    int length = text.length();  // NullPointerException
} catch (NullPointerException e) {
    System.out.println("Null value: " + e.getMessage());
} catch (ArithmeticException e) {
    System.out.println("Math error: " + e.getMessage());
} catch (Exception e) {
    System.out.println("General error: " + e.getMessage());
}

// Java 7+: multi-catch
try {
    // risky code
} catch (IOException | SQLException e) {
    System.out.println("IO or SQL error: " + e.getMessage());
}
```

```python
try:
    # risky code
    pass
except (ValueError, TypeError) as e:
    print(f"Value or type error: {e}")
except FileNotFoundError as e:
    print(f"File not found: {e}")
except Exception as e:
    print(f"General error: {e}")
```

```javascript
try {
  // risky code
  null.property;  // TypeError
} catch (e) {
  if (e instanceof TypeError) {
    console.log(`Type error: ${e.message}`);
  } else if (e instanceof RangeError) {
    console.log(`Range error: ${e.message}`);
  } else {
    console.log(`General error: ${e.message}`);
  }
}
```

---

## Creating Custom Exceptions

This is where OOP shines — you can create your own exception classes:

```cpp
#include <iostream>
#include <stdexcept>
#include <string>

class InsufficientFundsException : public std::runtime_error {
    double amount;
    double balance;
public:
    InsufficientFundsException(double amount, double balance)
        : std::runtime_error("Cannot withdraw $" + std::to_string(amount)
            + " — balance is $" + std::to_string(balance)),
          amount(amount), balance(balance) {}

    double getDeficit() const { return amount - balance; }
};

class BankAccount {
    double balance;
public:
    BankAccount(double balance) : balance(balance) {}

    void withdraw(double amount) {
        if (amount > balance) {
            throw InsufficientFundsException(amount, balance);
        }
        balance -= amount;
    }
};

BankAccount acc(100);
try {
    acc.withdraw(150);
} catch (const InsufficientFundsException& e) {
    std::cout << e.what() << std::endl;
    std::cout << "Deficit: $" << e.getDeficit() << std::endl;
}
```

```csharp
using System;

class InsufficientFundsException : Exception {
    public double Amount { get; }
    public double Balance { get; }
    public double Deficit => Amount - Balance;

    public InsufficientFundsException(double amount, double balance)
        : base($"Cannot withdraw ${amount} — balance is ${balance}") {
        Amount = amount;
        Balance = balance;
    }
}

class BankAccount {
    private double balance;

    public BankAccount(double balance) {
        this.balance = balance;
    }

    public void Withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientFundsException(amount, balance);
        }
        balance -= amount;
    }
}

BankAccount acc = new BankAccount(100);
try {
    acc.Withdraw(150);
} catch (InsufficientFundsException e) {
    Console.WriteLine(e.Message);
    Console.WriteLine($"Deficit: ${e.Deficit}");
}
// Cannot withdraw $150 — balance is $100
// Deficit: $50
```

```java
// Custom exception
class InsufficientFundsException extends Exception {
    private double amount;
    private double balance;

    InsufficientFundsException(double amount, double balance) {
        super("Cannot withdraw $" + amount + " — balance is $" + balance);
        this.amount = amount;
        this.balance = balance;
    }

    double getAmount() { return amount; }
    double getBalance() { return balance; }
    double getDeficit() { return amount - balance; }
}

class BankAccount {
    private double balance;

    BankAccount(double balance) {
        this.balance = balance;
    }

    void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount, balance);
        }
        balance -= amount;
    }
}

// Usage
BankAccount acc = new BankAccount(100);
try {
    acc.withdraw(150);
} catch (InsufficientFundsException e) {
    System.out.println(e.getMessage());
    System.out.println("Deficit: $" + e.getDeficit());
}
// Cannot withdraw $150.0 — balance is $100.0
// Deficit: $50.0
```

```python
class InsufficientFundsError(Exception):
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(
            f"Cannot withdraw ${amount} — balance is ${balance}"
        )

    @property
    def deficit(self):
        return self.amount - self.balance

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(amount, self.balance)
        self.balance -= amount

acc = BankAccount(100)
try:
    acc.withdraw(150)
except InsufficientFundsError as e:
    print(e)
    print(f"Deficit: ${e.deficit}")
# Cannot withdraw $150 — balance is $100
# Deficit: $50
```

```javascript
class InsufficientFundsError extends Error {
  constructor(amount, balance) {
    super(`Cannot withdraw $${amount} — balance is $${balance}`);
    this.name = "InsufficientFundsError";
    this.amount = amount;
    this.balance = balance;
  }

  get deficit() {
    return this.amount - this.balance;
  }
}

class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }

  withdraw(amount) {
    if (amount > this.balance) {
      throw new InsufficientFundsError(amount, this.balance);
    }
    this.balance -= amount;
  }
}

const acc = new BankAccount(100);
try {
  acc.withdraw(150);
} catch (e) {
  if (e instanceof InsufficientFundsError) {
    console.log(e.message);
    console.log(`Deficit: $${e.deficit}`);
  }
}
// Cannot withdraw $150 — balance is $100
// Deficit: $50
```

---

## Exception Hierarchy for Applications

Design a hierarchy of exceptions for your application:

```cpp
#include <stdexcept>
#include <string>

// Base exception for the application
class AppException : public std::runtime_error {
public:
    AppException(const std::string& msg) : std::runtime_error(msg) {}
};

class ValidationException : public AppException {
public:
    std::string field;
    ValidationException(const std::string& field, const std::string& msg)
        : AppException("Validation error on '" + field + "': " + msg),
          field(field) {}
};

class AuthenticationException : public AppException {
public:
    AuthenticationException(const std::string& msg)
        : AppException("Authentication failed: " + msg) {}
};

class NotFoundException : public AppException {
public:
    NotFoundException(const std::string& entity, int id)
        : AppException(entity + " with ID " + std::to_string(id) + " not found") {}
};

try {
    throw NotFoundException("User", 999);
} catch (const NotFoundException& e) {
    std::cout << e.what() << std::endl;
} catch (const AppException& e) {
    std::cout << "App error: " << e.what() << std::endl;
}
```

```csharp
using System;

// Base exception for the application
class AppException : Exception {
    public AppException(string message) : base(message) {}
}

class ValidationException : AppException {
    public string Field { get; }

    public ValidationException(string field, string message)
        : base($"Validation error on '{field}': {message}") {
        Field = field;
    }
}

class AuthenticationException : AppException {
    public AuthenticationException(string message)
        : base($"Authentication failed: {message}") {}
}

class NotFoundException : AppException {
    public NotFoundException(string entity, int id)
        : base($"{entity} with ID {id} not found") {}
}

// Usage
try {
    throw new NotFoundException("User", 999);
} catch (NotFoundException e) {
    Console.WriteLine(e.Message);
    // User with ID 999 not found
} catch (AuthenticationException) {
    Console.WriteLine("Please log in first");
} catch (AppException e) {
    Console.WriteLine($"App error: {e.Message}");
}
```

```java
// Base exception for the application
class AppException extends Exception {
    AppException(String message) {
        super(message);
    }
}

// Domain-specific exceptions
class ValidationException extends AppException {
    String field;

    ValidationException(String field, String message) {
        super("Validation error on '" + field + "': " + message);
        this.field = field;
    }
}

class AuthenticationException extends AppException {
    AuthenticationException(String message) {
        super("Authentication failed: " + message);
    }
}

class NotFoundException extends AppException {
    NotFoundException(String entity, int id) {
        super(entity + " with ID " + id + " not found");
    }
}

// Usage
try {
    User user = findUser(999);
} catch (NotFoundException e) {
    System.out.println(e.getMessage());
    // User with ID 999 not found
} catch (AuthenticationException e) {
    System.out.println("Please log in first");
} catch (AppException e) {
    System.out.println("App error: " + e.getMessage());
}
```

```python
# Base exception for the application
class AppError(Exception):
    pass

class ValidationError(AppError):
    def __init__(self, field, message):
        self.field = field
        super().__init__(f"Validation error on '{field}': {message}")

class AuthenticationError(AppError):
    def __init__(self, message):
        super().__init__(f"Authentication failed: {message}")

class NotFoundError(AppError):
    def __init__(self, entity, id):
        super().__init__(f"{entity} with ID {id} not found")

# Usage
try:
    user = find_user(999)
except NotFoundError as e:
    print(e)  # User with ID 999 not found
except AuthenticationError:
    print("Please log in first")
except AppError as e:
    print(f"App error: {e}")
```

```javascript
// Base exception for the application
class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppError";
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(`Validation error on '${field}': ${message}`);
    this.name = "ValidationError";
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(`Authentication failed: ${message}`);
    this.name = "AuthenticationError";
  }
}

class NotFoundError extends AppError {
  constructor(entity, id) {
    super(`${entity} with ID ${id} not found`);
    this.name = "NotFoundError";
  }
}

// Usage
try {
  const user = findUser(999);
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log(e.message);  // User with ID 999 not found
  } else if (e instanceof AuthenticationError) {
    console.log("Please log in first");
  } else if (e instanceof AppError) {
    console.log(`App error: ${e.message}`);
  }
}
```

---

## Checked vs Unchecked Exceptions (Java)

| Type | Must Handle? | Extends | Example |
|------|-------------|---------|---------|
| **Checked** | Yes (try-catch or throws) | `Exception` | `IOException`, `SQLException` |
| **Unchecked** | No (optional) | `RuntimeException` | `NullPointerException`, `IllegalArgumentException` |

```cpp
// C++ has no checked exceptions.
// All exceptions are unchecked — catching is always optional.
// noexcept specifier indicates a function won't throw.
void safeFunction() noexcept {
    // guaranteed not to throw
}

void riskyFunction() {
    throw std::runtime_error("Something went wrong");
}
```

```csharp
// C# has no checked exceptions (like C++, Python, JS).
// All exceptions are unchecked — catching is always optional.
// No equivalent to Java's "throws" clause.

void SafeFunction() {
    // No annotation needed — any method can throw
}

void RiskyFunction() {
    throw new InvalidOperationException("Something went wrong");
}

// Convention: document exceptions in XML docs
/// <summary>Reads a file.</summary>
/// <exception cref="FileNotFoundException">File doesn't exist.</exception>
/// <exception cref="UnauthorizedAccessException">No read permission.</exception>
string ReadFile(string path) {
    return System.IO.File.ReadAllText(path);
}
```

```java
// Checked — compiler FORCES you to handle it
void readFile() throws IOException {    // Must declare!
    FileReader f = new FileReader("file.txt");
}

// Unchecked — no requirement to handle
int divide(int a, int b) {
    return a / b;  // May throw ArithmeticException — but not forced to catch
}
```

```python
# Python has no checked exceptions.
# All exceptions are unchecked — catching is always optional.
# Convention: document exceptions in docstrings.
def read_file(path):
    """Read file contents.

    Raises:
        FileNotFoundError: If file doesn't exist.
        PermissionError: If file isn't readable.
    """
    with open(path) as f:
        return f.read()
```

```javascript
// JavaScript has no checked exceptions.
// All exceptions are unchecked — catching is always optional.
// Convention: document in JSDoc.
/**
 * @throws {TypeError} If input is not a string
 */
function parseJSON(input) {
  if (typeof input !== "string") {
    throw new TypeError("Expected a string");
  }
  return JSON.parse(input);
}
```

---

## Best Practices

| Practice | Why |
|----------|-----|
| Catch **specific** exceptions, not `Exception` | Avoid hiding bugs |
| Don't use exceptions for **flow control** | Use if-else for expected conditions |
| Always include **meaningful messages** | Helps debugging |
| Create **custom exceptions** for domain logic | Self-documenting error handling |
| Clean up resources in `finally` | Prevent resource leaks |
| Don't catch and **ignore** exceptions silently | At minimum, log the error |
| Throw early, catch late | Detect errors ASAP, handle at the right level |

---

## Exception Filters (C#)

C# 6 introduced **exception filters** with the `when` keyword, allowing you to add conditions to catch blocks without catching and rethrowing:

```csharp
using System;
using System.Net;
using System.Net.Http;

try {
    HttpResponseMessage response = await client.GetAsync(url);
    response.EnsureSuccessStatusCode();
} catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound) {
    Console.WriteLine("Resource not found — return default");
} catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.Unauthorized) {
    Console.WriteLine("Refresh token and retry");
} catch (HttpRequestException e) {
    Console.WriteLine($"Unexpected HTTP error: {e.Message}");
}

// Filters can reference any expression — including method calls
bool ShouldRetry(Exception e) => e.Message.Contains("timeout");

try {
    CallExternalService();
} catch (Exception e) when (ShouldRetry(e)) {
    // Retry logic — only catches if ShouldRetry returns true
} catch (Exception e) {
    // All other exceptions
    Console.WriteLine($"Fatal: {e.Message}");
}
```

Key advantage: exception filters don't unwind the stack, so the original stack trace is preserved for debugging.

---

## Key Takeaways

- Exceptions are **objects** with a **class hierarchy**
- Use `try/catch` (C++, Java, JS) or `try/except` (Python) to handle errors
- Create **custom exception classes** for domain-specific errors
- Design an **exception hierarchy** for larger applications
- Java has **checked** (must handle) and **unchecked** (optional) exceptions; C++, C#, Python, and JS only have unchecked
- C# adds **exception filters** (`when`) for conditional catch without rethrowing
- Always catch **specific** exceptions and include **meaningful messages**

Next: **Nested and Inner Classes** — classes inside classes.
