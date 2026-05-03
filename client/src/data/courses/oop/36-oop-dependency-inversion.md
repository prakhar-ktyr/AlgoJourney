---
title: Dependency Inversion Principle
---

# Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."
> — Robert C. Martin

The **Dependency Inversion Principle** is about decoupling your code by depending on **abstractions** (interfaces) instead of **concrete implementations**.

---

## The Problem

```cpp
// ❌ BAD — High-level depends directly on low-level
class OrderService {
    MySQLDatabase database;
    EmailSender emailSender;

public:
    void placeOrder(const Order& order) {
        database.save(order);
        emailSender.send("Order confirmed", order.getEmail());
    }
};
```

```csharp
// ❌ BAD — High-level depends directly on low-level
class OrderService {
    private MySQLDatabase database = new MySQLDatabase();
    private EmailSender emailSender = new EmailSender();

    public void PlaceOrder(Order order) {
        database.Save(order);
        emailSender.Send("Order confirmed", order.Email);
    }
}
```

```java
// ❌ BAD — High-level depends directly on low-level
class OrderService {
    private MySQLDatabase database = new MySQLDatabase();
    private EmailSender emailSender = new EmailSender();

    void placeOrder(Order order) {
        database.save(order);
        emailSender.send("Order confirmed", order.getEmail());
    }
}
```

```python
# ❌ BAD — High-level depends directly on low-level
class OrderService:
    def __init__(self):
        self.database = MySQLDatabase()
        self.email_sender = EmailSender()

    def place_order(self, order):
        self.database.save(order)
        self.email_sender.send("Order confirmed", order.email)
```

```javascript
// ❌ BAD — High-level depends directly on low-level
class OrderService {
  constructor() {
    this.database = new MySQLDatabase();
    this.emailSender = new EmailSender();
  }

  placeOrder(order) {
    this.database.save(order);
    this.emailSender.send("Order confirmed", order.email);
  }
}
```

Problems:
- `OrderService` is **tightly coupled** to `MySQLDatabase` and `EmailSender`
- Can't switch to PostgreSQL without modifying `OrderService`
- Can't test `OrderService` without a real database and email server

---

## The Solution: Depend on Abstractions

```cpp
// ✅ GOOD — Both high-level and low-level depend on abstractions
#include <iostream>
#include <string>

// Abstractions (interfaces)
class Database {
public:
    virtual void save(const Order& order) = 0;
    virtual Order* findById(int id) = 0;
    virtual ~Database() = default;
};

class NotificationService {
public:
    virtual void send(const std::string& message, const std::string& recipient) = 0;
    virtual ~NotificationService() = default;
};

// Low-level modules implement abstractions
class MySQLDatabase : public Database {
public:
    void save(const Order& order) override {
        std::cout << "MySQL: Saving order" << std::endl;
    }
    Order* findById(int id) override { return nullptr; }
};

class PostgreSQLDatabase : public Database {
public:
    void save(const Order& order) override {
        std::cout << "PostgreSQL: Saving order" << std::endl;
    }
    Order* findById(int id) override { return nullptr; }
};

class EmailNotification : public NotificationService {
public:
    void send(const std::string& message, const std::string& recipient) override {
        std::cout << "Email to " << recipient << ": " << message << std::endl;
    }
};

class SMSNotification : public NotificationService {
public:
    void send(const std::string& message, const std::string& recipient) override {
        std::cout << "SMS to " << recipient << ": " << message << std::endl;
    }
};

// High-level module depends on abstractions, NOT concrete classes
class OrderService {
    Database& database_;
    NotificationService& notifier_;

public:
    // Dependencies INJECTED through constructor
    OrderService(Database& database, NotificationService& notifier)
        : database_(database), notifier_(notifier) { }

    void placeOrder(const Order& order) {
        database_.save(order);
        notifier_.send("Order confirmed", order.getEmail());
    }
};

// Usage — easy to swap implementations!
MySQLDatabase mysql;
EmailNotification email;
OrderService service1(mysql, email);

PostgreSQLDatabase postgres;
SMSNotification sms;
OrderService service2(postgres, sms);
```

```csharp
// ✅ GOOD — Both high-level and low-level depend on abstractions
using System;

// Abstractions (interfaces)
interface IDatabase {
    void Save(Order order);
    Order FindById(int id);
}

interface INotificationService {
    void Send(string message, string recipient);
}

// Low-level modules implement abstractions
class MySQLDatabase : IDatabase {
    public void Save(Order order) => Console.WriteLine("MySQL: Saving order");
    public Order FindById(int id) => null;
}

class PostgreSQLDatabase : IDatabase {
    public void Save(Order order) => Console.WriteLine("PostgreSQL: Saving order");
    public Order FindById(int id) => null;
}

class EmailNotification : INotificationService {
    public void Send(string message, string recipient) =>
        Console.WriteLine($"Email to {recipient}: {message}");
}

class SMSNotification : INotificationService {
    public void Send(string message, string recipient) =>
        Console.WriteLine($"SMS to {recipient}: {message}");
}

// High-level module depends on abstractions, NOT concrete classes
class OrderService {
    private readonly IDatabase _database;
    private readonly INotificationService _notifier;

    // Dependencies INJECTED through constructor
    public OrderService(IDatabase database, INotificationService notifier) {
        _database = database;
        _notifier = notifier;
    }

    public void PlaceOrder(Order order) {
        _database.Save(order);
        _notifier.Send("Order confirmed", order.Email);
    }
}

// Usage — easy to swap implementations!
var service1 = new OrderService(new MySQLDatabase(), new EmailNotification());
var service2 = new OrderService(new PostgreSQLDatabase(), new SMSNotification());
```

```java
// ✅ GOOD — Both high-level and low-level depend on abstractions

// Abstractions (interfaces)
interface Database {
    void save(Order order);
    Order findById(int id);
}

interface NotificationService {
    void send(String message, String recipient);
}

// Low-level modules implement abstractions
class MySQLDatabase implements Database {
    @Override public void save(Order order) {
        System.out.println("MySQL: Saving order");
    }
    @Override public Order findById(int id) { return null; }
}

class PostgreSQLDatabase implements Database {
    @Override public void save(Order order) {
        System.out.println("PostgreSQL: Saving order");
    }
    @Override public Order findById(int id) { return null; }
}

class EmailNotification implements NotificationService {
    @Override public void send(String message, String recipient) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

class SMSNotification implements NotificationService {
    @Override public void send(String message, String recipient) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

// High-level module depends on abstractions, NOT concrete classes
class OrderService {
    private Database database;
    private NotificationService notifier;

    // Dependencies INJECTED through constructor
    OrderService(Database database, NotificationService notifier) {
        this.database = database;
        this.notifier = notifier;
    }

    void placeOrder(Order order) {
        database.save(order);
        notifier.send("Order confirmed", order.getEmail());
    }
}

// Usage — easy to swap implementations!
OrderService service1 = new OrderService(
    new MySQLDatabase(),
    new EmailNotification()
);

OrderService service2 = new OrderService(
    new PostgreSQLDatabase(),
    new SMSNotification()
);
```

```python
# ✅ GOOD — Both high-level and low-level depend on abstractions
from abc import ABC, abstractmethod

# Abstractions (interfaces)
class Database(ABC):
    @abstractmethod
    def save(self, order): pass
    @abstractmethod
    def find_by_id(self, id): pass

class NotificationService(ABC):
    @abstractmethod
    def send(self, message, recipient): pass

# Low-level modules implement abstractions
class MySQLDatabase(Database):
    def save(self, order):
        print("MySQL: Saving order")
    def find_by_id(self, id):
        return None

class PostgreSQLDatabase(Database):
    def save(self, order):
        print("PostgreSQL: Saving order")
    def find_by_id(self, id):
        return None

class EmailNotification(NotificationService):
    def send(self, message, recipient):
        print(f"Email to {recipient}: {message}")

class SMSNotification(NotificationService):
    def send(self, message, recipient):
        print(f"SMS to {recipient}: {message}")

# High-level module depends on abstractions, NOT concrete classes
class OrderService:
    def __init__(self, database, notifier):
        # Dependencies INJECTED through constructor
        self.database = database
        self.notifier = notifier

    def place_order(self, order):
        self.database.save(order)
        self.notifier.send("Order confirmed", order.email)

# Usage — easy to swap implementations!
service1 = OrderService(MySQLDatabase(), EmailNotification())
service2 = OrderService(PostgreSQLDatabase(), SMSNotification())
```

```javascript
// ✅ GOOD — Both high-level and low-level depend on abstractions

// Low-level modules implement a common contract
class MySQLDatabase {
  save(order) {
    console.log("MySQL: Saving order");
  }
  findById(id) { return null; }
}

class PostgreSQLDatabase {
  save(order) {
    console.log("PostgreSQL: Saving order");
  }
  findById(id) { return null; }
}

class EmailNotification {
  send(message, recipient) {
    console.log(`Email to ${recipient}: ${message}`);
  }
}

class SMSNotification {
  send(message, recipient) {
    console.log(`SMS to ${recipient}: ${message}`);
  }
}

// High-level module depends on abstractions (duck typing), NOT concrete classes
class OrderService {
  constructor(database, notifier) {
    // Dependencies INJECTED through constructor
    this.database = database;
    this.notifier = notifier;
  }

  placeOrder(order) {
    this.database.save(order);
    this.notifier.send("Order confirmed", order.email);
  }
}

// Usage — easy to swap implementations!
const service1 = new OrderService(new MySQLDatabase(), new EmailNotification());
const service2 = new OrderService(new PostgreSQLDatabase(), new SMSNotification());
```

---

## Dependency Injection (DI)

Dependency Inversion is achieved through **Dependency Injection** — passing dependencies from outside instead of creating them inside.

### Three Forms of DI

```cpp
// 1. Constructor Injection (preferred)
class OrderService {
    Database& db_;
public:
    OrderService(Database& db) : db_(db) { }
};

// 2. Setter Injection
class OrderService {
    Database* db_ = nullptr;
public:
    void setDatabase(Database* db) { db_ = db; }
};

// 3. Method Injection
class OrderService {
public:
    void placeOrder(const Order& order, Database& db) {
        db.save(order);
    }
};
```

```csharp
// 1. Constructor Injection (preferred)
class OrderService {
    private readonly IDatabase _db;
    public OrderService(IDatabase db) { _db = db; }
}

// 2. Setter Injection
class OrderService {
    public IDatabase Db { get; set; }
}

// 3. Method Injection
class OrderService {
    public void PlaceOrder(Order order, IDatabase db) {
        db.Save(order);
    }
}
```

```java
// 1. Constructor Injection (preferred)
class OrderService {
    private Database db;

    OrderService(Database db) {
        this.db = db;
    }
}

// 2. Setter Injection
class OrderService {
    private Database db;

    void setDatabase(Database db) {
        this.db = db;
    }
}

// 3. Method Injection
class OrderService {
    void placeOrder(Order order, Database db) {
        db.save(order);
    }
}
```

```python
# 1. Constructor Injection (preferred)
class OrderService:
    def __init__(self, db):
        self.db = db

# 2. Setter Injection
class OrderService:
    def set_database(self, db):
        self.db = db

# 3. Method Injection
class OrderService:
    def place_order(self, order, db):
        db.save(order)
```

```javascript
// 1. Constructor Injection (preferred)
class OrderService {
  constructor(db) {
    this.db = db;
  }
}

// 2. Setter Injection
class OrderService {
  setDatabase(db) {
    this.db = db;
  }
}

// 3. Method Injection
class OrderService {
  placeOrder(order, db) {
    db.save(order);
  }
}
```

**Constructor injection** is preferred because:
- Dependencies are required and clear
- Object is fully initialized after construction
- Immutability is possible

---

## Payment Gateway Example

```cpp
#include <iostream>
#include <string>

// Abstractions
class PaymentGateway {
public:
    virtual bool charge(double amount) = 0;
    virtual ~PaymentGateway() = default;
};

class Logger {
public:
    virtual void log(const std::string& message) = 0;
    virtual ~Logger() = default;
};

// Implementations
class StripeGateway : public PaymentGateway {
public:
    bool charge(double amount) override {
        std::cout << "Stripe: Charging $" << amount << std::endl;
        return true;
    }
};

class PayPalGateway : public PaymentGateway {
public:
    bool charge(double amount) override {
        std::cout << "PayPal: Charging $" << amount << std::endl;
        return true;
    }
};

class ConsoleLogger : public Logger {
public:
    void log(const std::string& message) override {
        std::cout << "[LOG] " << message << std::endl;
    }
};

class FileLogger : public Logger {
public:
    void log(const std::string& message) override {
        std::cout << "[FILE] " << message << std::endl;
    }
};

// High-level module — depends on abstractions
class CheckoutService {
    PaymentGateway& gateway_;
    Logger& logger_;

public:
    CheckoutService(PaymentGateway& gateway, Logger& logger)
        : gateway_(gateway), logger_(logger) { }

    void checkout(double amount) {
        logger_.log("Processing $" + std::to_string(amount));
        if (gateway_.charge(amount)) {
            logger_.log("Payment successful");
        }
    }
};

// Easy to swap — different configurations
int main() {
    StripeGateway stripe;
    ConsoleLogger console;
    CheckoutService service1(stripe, console);
    service1.checkout(99.99);

    PayPalGateway paypal;
    FileLogger file;
    CheckoutService service2(paypal, file);
    service2.checkout(49.99);
}
```

```csharp
using System;

// Abstractions
interface IPaymentGateway {
    bool Charge(double amount);
}

interface ILogger {
    void Log(string message);
}

// Implementations
class StripeGateway : IPaymentGateway {
    public bool Charge(double amount) {
        Console.WriteLine($"Stripe: Charging ${amount}");
        return true;
    }
}

class PayPalGateway : IPaymentGateway {
    public bool Charge(double amount) {
        Console.WriteLine($"PayPal: Charging ${amount}");
        return true;
    }
}

class ConsoleLogger : ILogger {
    public void Log(string message) => Console.WriteLine($"[LOG] {message}");
}

class FileLogger : ILogger {
    public void Log(string message) => Console.WriteLine($"[FILE] {message}");
}

// High-level module — depends on abstractions
class CheckoutService {
    private readonly IPaymentGateway _gateway;
    private readonly ILogger _logger;

    public CheckoutService(IPaymentGateway gateway, ILogger logger) {
        _gateway = gateway;
        _logger = logger;
    }

    public void Checkout(double amount) {
        _logger.Log($"Processing ${amount}");
        if (_gateway.Charge(amount)) {
            _logger.Log("Payment successful");
        }
    }
}

// Easy to swap — different configurations
var service1 = new CheckoutService(new StripeGateway(), new ConsoleLogger());
service1.Checkout(99.99);

var service2 = new CheckoutService(new PayPalGateway(), new FileLogger());
service2.Checkout(49.99);
```

```java
import java.util.*;

// Abstractions
interface PaymentGateway {
    boolean charge(double amount);
}

interface Logger {
    void log(String message);
}

// Implementations
class StripeGateway implements PaymentGateway {
    @Override
    public boolean charge(double amount) {
        System.out.println("Stripe: Charging $" + amount);
        return true;
    }
}

class PayPalGateway implements PaymentGateway {
    @Override
    public boolean charge(double amount) {
        System.out.println("PayPal: Charging $" + amount);
        return true;
    }
}

class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

class FileLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println("[FILE] " + message);
    }
}

// High-level module — depends on abstractions
class CheckoutService {
    private PaymentGateway gateway;
    private Logger logger;

    CheckoutService(PaymentGateway gateway, Logger logger) {
        this.gateway = gateway;
        this.logger = logger;
    }

    void checkout(double amount) {
        logger.log("Processing $" + amount);
        if (gateway.charge(amount)) {
            logger.log("Payment successful");
        }
    }
}

// Easy to swap — different configurations
CheckoutService service1 = new CheckoutService(new StripeGateway(), new ConsoleLogger());
service1.checkout(99.99);

CheckoutService service2 = new CheckoutService(new PayPalGateway(), new FileLogger());
service2.checkout(49.99);
```

```python
from abc import ABC, abstractmethod

# Abstractions
class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount):
        pass

class Logger(ABC):
    @abstractmethod
    def log(self, message):
        pass

# Implementations
class StripeGateway(PaymentGateway):
    def charge(self, amount):
        print(f"Stripe: Charging ${amount}")
        return True

class PayPalGateway(PaymentGateway):
    def charge(self, amount):
        print(f"PayPal: Charging ${amount}")
        return True

class ConsoleLogger(Logger):
    def log(self, message):
        print(f"[LOG] {message}")

class FileLogger(Logger):
    def log(self, message):
        print(f"[FILE] {message}")

# High-level module — depends on abstractions
class CheckoutService:
    def __init__(self, gateway: PaymentGateway, logger: Logger):
        self.gateway = gateway
        self.logger = logger

    def checkout(self, amount):
        self.logger.log(f"Processing ${amount}")
        if self.gateway.charge(amount):
            self.logger.log("Payment successful")

# Easy to swap — different configurations
service1 = CheckoutService(StripeGateway(), ConsoleLogger())
service1.checkout(99.99)

service2 = CheckoutService(PayPalGateway(), FileLogger())
service2.checkout(49.99)
```

```javascript
// Abstractions are implicit in JS (duck typing)

// Implementations
class StripeGateway {
  charge(amount) {
    console.log(`Stripe: Charging $${amount}`);
    return true;
  }
}

class PayPalGateway {
  charge(amount) {
    console.log(`PayPal: Charging $${amount}`);
    return true;
  }
}

class ConsoleLogger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

class FileLogger {
  log(message) {
    console.log(`[FILE] ${message}`);
  }
}

// High-level module — depends on abstractions (duck typing)
class CheckoutService {
  constructor(gateway, logger) {
    this.gateway = gateway;
    this.logger = logger;
  }

  checkout(amount) {
    this.logger.log(`Processing $${amount}`);
    if (this.gateway.charge(amount)) {
      this.logger.log("Payment successful");
    }
  }
}

// Easy to swap — different configurations
const service1 = new CheckoutService(new StripeGateway(), new ConsoleLogger());
service1.checkout(99.99);

const service2 = new CheckoutService(new PayPalGateway(), new FileLogger());
service2.checkout(49.99);
```

---

## Benefits for Testing

DIP makes testing easy — inject **mock** dependencies:

```cpp
// Test with mock database — no real DB needed!
class MockDatabase : public Database {
public:
    std::vector<Order> saved;

    void save(const Order& order) override {
        saved.push_back(order);
    }

    Order* findById(int id) override { return nullptr; }
};

class MockNotifier : public NotificationService {
public:
    std::vector<std::string> messages;

    void send(const std::string& message, const std::string& recipient) override {
        messages.push_back(message);
    }
};

// Test
MockDatabase mockDb;
MockNotifier mockNotifier;
OrderService service(mockDb, mockNotifier);

service.placeOrder(testOrder);
assert(mockDb.saved.size() == 1);
assert(mockNotifier.messages.size() == 1);
```

```csharp
// Test with mock database — no real DB needed!
class MockDatabase : IDatabase {
    public List<Order> Saved { get; } = new();

    public void Save(Order order) => Saved.Add(order);
    public Order FindById(int id) => null;
}

class MockNotifier : INotificationService {
    public List<string> Messages { get; } = new();

    public void Send(string message, string recipient) =>
        Messages.Add(message);
}

// Test
var mockDb = new MockDatabase();
var mockNotifier = new MockNotifier();
var service = new OrderService(mockDb, mockNotifier);

service.PlaceOrder(testOrder);
Debug.Assert(mockDb.Saved.Count == 1);
Debug.Assert(mockNotifier.Messages.Count == 1);
```

```java
// Test with mock database — no real DB needed!
class MockDatabase implements Database {
    List<Order> saved = new ArrayList<>();

    @Override
    public void save(Order order) {
        saved.add(order);
    }

    @Override
    public Order findById(int id) {
        return null;
    }
}

class MockNotifier implements NotificationService {
    List<String> messages = new ArrayList<>();

    @Override
    public void send(String message, String recipient) {
        messages.add(message);
    }
}

// Test
MockDatabase mockDb = new MockDatabase();
MockNotifier mockNotifier = new MockNotifier();
OrderService service = new OrderService(mockDb, mockNotifier);

service.placeOrder(testOrder);
assert mockDb.saved.size() == 1;
assert mockNotifier.messages.size() == 1;
```

```python
# Test with mock database — no real DB needed!
class MockDatabase(Database):
    def __init__(self):
        self.saved = []

    def save(self, order):
        self.saved.append(order)

    def find_by_id(self, id):
        return None

class MockNotifier(NotificationService):
    def __init__(self):
        self.messages = []

    def send(self, message, recipient):
        self.messages.append(message)

# Test
mock_db = MockDatabase()
mock_notifier = MockNotifier()
service = OrderService(mock_db, mock_notifier)

service.place_order(test_order)
assert len(mock_db.saved) == 1
assert len(mock_notifier.messages) == 1
```

```javascript
// Test with mock database — no real DB needed!
class MockDatabase {
  constructor() { this.saved = []; }

  save(order) {
    this.saved.push(order);
  }

  findById(id) { return null; }
}

class MockNotifier {
  constructor() { this.messages = []; }

  send(message, recipient) {
    this.messages.push(message);
  }
}

// Test
const mockDb = new MockDatabase();
const mockNotifier = new MockNotifier();
const service = new OrderService(mockDb, mockNotifier);

service.placeOrder(testOrder);
console.assert(mockDb.saved.length === 1);
console.assert(mockNotifier.messages.length === 1);
```

---

## The Dependency Inversion Diagram

```
WITHOUT DIP:                    WITH DIP:

┌─────────────┐                ┌─────────────┐
│ OrderService │                │ OrderService │
└──────┬──────┘                └──────┬──────┘
       │ depends on                   │ depends on
       ▼                              ▼
┌─────────────┐                ┌─────────────┐
│MySQLDatabase│                │  «interface» │
└─────────────┘                │   Database   │
                               └──────△──────┘
                                      │ implements
                               ┌──────┴──────┐
                               │MySQLDatabase│
                               └─────────────┘

Both high-level and low-level depend on the abstraction
```

---

## ASP.NET Core DI Container (C#)

C# and ASP.NET Core have a **built-in Dependency Injection container** that makes DIP a first-class citizen:

```csharp
using Microsoft.Extensions.DependencyInjection;

// Register services in Program.cs / Startup.cs
var builder = WebApplication.CreateBuilder(args);

// Register abstractions → implementations
builder.Services.AddScoped<IDatabase, PostgreSQLDatabase>();
builder.Services.AddScoped<INotificationService, EmailNotification>();
builder.Services.AddScoped<IPaymentGateway, StripeGateway>();
builder.Services.AddSingleton<ILogger, ConsoleLogger>();

var app = builder.Build();

// ASP.NET Core automatically injects dependencies into controllers
class OrderController : ControllerBase {
    private readonly IDatabase _db;
    private readonly INotificationService _notifier;

    // Constructor injection — framework resolves automatically
    public OrderController(IDatabase db, INotificationService notifier) {
        _db = db;
        _notifier = notifier;
    }

    [HttpPost]
    public IActionResult PlaceOrder(Order order) {
        _db.Save(order);
        _notifier.Send("Order confirmed", order.Email);
        return Ok();
    }
}
```

---

## Key Takeaways

- DIP: depend on **abstractions**, not **concrete classes**
- Use **Dependency Injection** to pass dependencies from outside
- **Constructor injection** is the preferred form
- DIP makes code **swappable** — change implementations without changing business logic
- DIP makes code **testable** — inject mocks for unit testing
- DIP is the foundation of **Inversion of Control (IoC)** containers used in Spring, Angular, etc.

Next: **Design Patterns Introduction** — reusable solutions to common problems.
