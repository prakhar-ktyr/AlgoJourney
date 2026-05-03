---
title: Creational Patterns
---

# Creational Patterns

Creational patterns control **how objects are created**. They abstract the instantiation process, making your code more flexible and decoupled.

---

## 1. Singleton Pattern

**Purpose**: Ensure a class has exactly **one instance** and provide a global access point.

### When to Use

- Configuration settings
- Database connection pool
- Logger
- Cache

### Implementation

```cpp
#include <iostream>
#include <string>

class DatabaseConnection {
    std::string connectionString_;

    // Private constructor — prevents external instantiation
    DatabaseConnection()
        : connectionString_("mysql://localhost:3306/mydb") {
        std::cout << "Database connected" << std::endl;
    }

public:
    // Delete copy/move to prevent copies
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;

    // Thread-safe Meyers' Singleton
    static DatabaseConnection& getInstance() {
        static DatabaseConnection instance;
        return instance;
    }

    void query(const std::string& sql) {
        std::cout << "Executing: " << sql << std::endl;
    }
};

// Usage
DatabaseConnection& db1 = DatabaseConnection::getInstance();
DatabaseConnection& db2 = DatabaseConnection::getInstance();
std::cout << (&db1 == &db2) << std::endl;  // 1 (true — same instance!)
db1.query("SELECT * FROM users");
```

```csharp
class DatabaseConnection {
    private static readonly Lazy<DatabaseConnection> _instance =
        new(() => new DatabaseConnection());

    private string _connectionString;

    // Private constructor — prevents external instantiation
    private DatabaseConnection() {
        _connectionString = "Server=localhost;Database=mydb";
        Console.WriteLine("Database connected");
    }

    // Thread-safe via Lazy<T>
    public static DatabaseConnection Instance => _instance.Value;

    public void Query(string sql) {
        Console.WriteLine($"Executing: {sql}");
    }
}

// Usage
var db1 = DatabaseConnection.Instance;
var db2 = DatabaseConnection.Instance;
Console.WriteLine(db1 == db2);  // True — same instance!
db1.Query("SELECT * FROM users");
```

```java
class DatabaseConnection {
    private static DatabaseConnection instance;
    private String connectionString;

    // Private constructor — prevents external instantiation
    private DatabaseConnection() {
        this.connectionString = "jdbc:mysql://localhost:3306/mydb";
        System.out.println("Database connected");
    }

    // Thread-safe lazy initialization
    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }
}

// Usage
DatabaseConnection db1 = DatabaseConnection.getInstance();
DatabaseConnection db2 = DatabaseConnection.getInstance();
System.out.println(db1 == db2);  // true — same instance!
db1.query("SELECT * FROM users");
```

```python
class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection_string = "mysql://localhost/mydb"
            print("Database connected")
        return cls._instance

    def query(self, sql):
        print(f"Executing: {sql}")

# Usage
db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True — same instance!
db1.query("SELECT * FROM users")
```

```javascript
class DatabaseConnection {
  static #instance = null;

  constructor() {
    if (DatabaseConnection.#instance) {
      return DatabaseConnection.#instance;
    }
    this.connectionString = "mysql://localhost/mydb";
    console.log("Database connected");
    DatabaseConnection.#instance = this;
  }

  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }

  query(sql) {
    console.log(`Executing: ${sql}`);
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2);  // true — same instance!
db1.query("SELECT * FROM users");
```

### Caution

Singleton can be overused. Problems:
- Hard to test (global state)
- Hidden dependencies
- Violates Single Responsibility (manages its own lifecycle)

---

## 2. Factory Method Pattern

**Purpose**: Create objects without specifying the exact class. Let subclasses decide which class to instantiate.

### When to Use

- Object creation logic is complex
- You need to return different types based on input
- You want to decouple creation from usage

### Implementation

```cpp
#include <iostream>
#include <string>
#include <memory>
#include <stdexcept>

// Product interface
class Notification {
public:
    virtual void send(const std::string& message) = 0;
    virtual ~Notification() = default;
};

// Concrete products
class EmailNotification : public Notification {
public:
    void send(const std::string& message) override {
        std::cout << "Email: " << message << std::endl;
    }
};

class SMSNotification : public Notification {
public:
    void send(const std::string& message) override {
        std::cout << "SMS: " << message << std::endl;
    }
};

class PushNotification : public Notification {
public:
    void send(const std::string& message) override {
        std::cout << "Push: " << message << std::endl;
    }
};

// Factory
class NotificationFactory {
public:
    static std::unique_ptr<Notification> create(const std::string& type) {
        if (type == "email") return std::make_unique<EmailNotification>();
        if (type == "sms")   return std::make_unique<SMSNotification>();
        if (type == "push")  return std::make_unique<PushNotification>();
        throw std::invalid_argument("Unknown type: " + type);
    }
};

// Usage — client doesn't know concrete classes
auto n = NotificationFactory::create("email");
n->send("Hello!");  // Email: Hello!
```

```csharp
using System;
using System.Collections.Generic;

// Product interface
interface INotification {
    void Send(string message);
}

// Concrete products
class EmailNotification : INotification {
    public void Send(string message) => Console.WriteLine($"Email: {message}");
}

class SMSNotification : INotification {
    public void Send(string message) => Console.WriteLine($"SMS: {message}");
}

class PushNotification : INotification {
    public void Send(string message) => Console.WriteLine($"Push: {message}");
}

// Factory
class NotificationFactory {
    private static readonly Dictionary<string, Func<INotification>> _factories = new() {
        ["email"] = () => new EmailNotification(),
        ["sms"] = () => new SMSNotification(),
        ["push"] = () => new PushNotification(),
    };

    public static INotification Create(string type) {
        if (_factories.TryGetValue(type.ToLower(), out var factory))
            return factory();
        throw new ArgumentException($"Unknown type: {type}");
    }
}

// Usage — client doesn't know concrete classes
var n = NotificationFactory.Create("email");
n.Send("Hello!");  // Email: Hello!
```

```java
// Product interface
interface Notification {
    void send(String message);
}

// Concrete products
class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Email: " + message);
    }
}

class SMSNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("SMS: " + message);
    }
}

class PushNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Push: " + message);
    }
}

// Factory
class NotificationFactory {
    static Notification create(String type) {
        switch (type.toLowerCase()) {
            case "email": return new EmailNotification();
            case "sms":   return new SMSNotification();
            case "push":  return new PushNotification();
            default: throw new IllegalArgumentException("Unknown type: " + type);
        }
    }
}

// Usage — client doesn't know concrete classes
Notification n = NotificationFactory.create("email");
n.send("Hello!");  // Email: Hello!
```

```python
class Notification:
    def send(self, message):
        raise NotImplementedError

class EmailNotification(Notification):
    def send(self, message):
        print(f"Email: {message}")

class SMSNotification(Notification):
    def send(self, message):
        print(f"SMS: {message}")

class PushNotification(Notification):
    def send(self, message):
        print(f"Push: {message}")

class NotificationFactory:
    @staticmethod
    def create(notification_type):
        factories = {
            "email": EmailNotification,
            "sms": SMSNotification,
            "push": PushNotification,
        }
        creator = factories.get(notification_type.lower())
        if not creator:
            raise ValueError(f"Unknown type: {notification_type}")
        return creator()

# Usage — client doesn't know concrete classes
notification = NotificationFactory.create("sms")
notification.send("Hello!")  # SMS: Hello!
```

```javascript
class Notification {
  send(message) { throw new Error("Must implement send()"); }
}

class EmailNotification extends Notification {
  send(message) { console.log(`Email: ${message}`); }
}

class SMSNotification extends Notification {
  send(message) { console.log(`SMS: ${message}`); }
}

class PushNotification extends Notification {
  send(message) { console.log(`Push: ${message}`); }
}

class NotificationFactory {
  static create(type) {
    const factories = {
      email: EmailNotification,
      sms: SMSNotification,
      push: PushNotification,
    };
    const Creator = factories[type.toLowerCase()];
    if (!Creator) throw new Error(`Unknown type: ${type}`);
    return new Creator();
  }
}

// Usage — client doesn't know concrete classes
const n = NotificationFactory.create("email");
n.send("Hello!");  // Email: Hello!
```

---

## 3. Builder Pattern

**Purpose**: Construct complex objects **step by step**. Especially useful when an object has many optional parameters.

### The Problem

```cpp
// Constructor with too many parameters — hard to read!
User user("Alice", "alice@example.com", 25, "NYC",
          "Engineer", true, false, "2020-01-15");
// What does true mean? What does false mean?
```

```csharp
// Constructor with too many parameters — hard to read!
var user = new User("Alice", "alice@example.com", 25, "NYC",
                    "Engineer", true, false, "2020-01-15");
// What does true mean? What does false mean?
```

```java
// Constructor with too many parameters — hard to read!
User user = new User("Alice", "alice@example.com", 25, "NYC",
                     "Engineer", true, false, "2020-01-15");
// What does true mean? What does false mean?
```

```python
# Constructor with too many parameters — hard to read!
user = User("Alice", "alice@example.com", 25, "NYC",
            "Engineer", True, False, "2020-01-15")
# What does True mean? What does False mean?
```

```javascript
// Constructor with too many parameters — hard to read!
const user = new User("Alice", "alice@example.com", 25, "NYC",
                      "Engineer", true, false, "2020-01-15");
// What does true mean? What does false mean?
```

### Builder Solution

```cpp
#include <iostream>
#include <string>

class User {
    std::string name_;
    std::string email_;
    int age_;
    std::string city_;
    std::string role_;
    bool active_;
    bool verified_;

    User(const std::string& name, const std::string& email, int age,
         const std::string& city, const std::string& role,
         bool active, bool verified)
        : name_(name), email_(email), age_(age), city_(city),
          role_(role), active_(active), verified_(verified) { }

public:
    friend std::ostream& operator<<(std::ostream& os, const User& u) {
        os << "User{name='" << u.name_ << "', email='" << u.email_
           << "', city='" << u.city_ << "'}";
        return os;
    }

    class Builder {
        std::string name_;     // required
        std::string email_;    // required
        int age_ = 0;
        std::string city_;
        std::string role_ = "User";
        bool active_ = true;
        bool verified_ = false;

    public:
        Builder(const std::string& name, const std::string& email)
            : name_(name), email_(email) { }

        Builder& age(int age) { age_ = age; return *this; }
        Builder& city(const std::string& city) { city_ = city; return *this; }
        Builder& role(const std::string& role) { role_ = role; return *this; }
        Builder& active(bool active) { active_ = active; return *this; }
        Builder& verified(bool verified) { verified_ = verified; return *this; }

        User build() {
            return User(name_, email_, age_, city_, role_, active_, verified_);
        }
    };
};

// Clean, readable creation
User user = User::Builder("Alice", "alice@example.com")
    .age(25)
    .city("New York")
    .role("Engineer")
    .verified(true)
    .build();

std::cout << user << std::endl;
```

```csharp
class User {
    public string Name { get; }
    public string Email { get; }
    public int Age { get; }
    public string City { get; }
    public string Role { get; }
    public bool Active { get; }
    public bool Verified { get; }

    private User(Builder builder) {
        Name = builder._name;
        Email = builder._email;
        Age = builder._age;
        City = builder._city;
        Role = builder._role;
        Active = builder._active;
        Verified = builder._verified;
    }

    public override string ToString() =>
        $"User{{Name='{Name}', Email='{Email}', City='{City}'}}";

    public class Builder {
        internal string _name;
        internal string _email;
        internal int _age;
        internal string _city = "";
        internal string _role = "User";
        internal bool _active = true;
        internal bool _verified = false;

        public Builder(string name, string email) {
            _name = name;
            _email = email;
        }

        public Builder Age(int age) { _age = age; return this; }
        public Builder City(string city) { _city = city; return this; }
        public Builder Role(string role) { _role = role; return this; }
        public Builder Active(bool active) { _active = active; return this; }
        public Builder Verified(bool verified) { _verified = verified; return this; }

        public User Build() => new User(this);
    }
}

// Clean, readable creation
var user = new User.Builder("Alice", "alice@example.com")
    .Age(25)
    .City("New York")
    .Role("Engineer")
    .Verified(true)
    .Build();

Console.WriteLine(user);
```

```java
class User {
    private String name;
    private String email;
    private int age;
    private String city;
    private String role;
    private boolean active;
    private boolean verified;

    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
        this.city = builder.city;
        this.role = builder.role;
        this.active = builder.active;
        this.verified = builder.verified;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email
             + "', city='" + city + "'}";
    }

    static class Builder {
        private String name;    // required
        private String email;   // required
        private int age;
        private String city;
        private String role = "User";
        private boolean active = true;
        private boolean verified = false;

        Builder(String name, String email) {
            this.name = name;
            this.email = email;
        }

        Builder age(int age) { this.age = age; return this; }
        Builder city(String city) { this.city = city; return this; }
        Builder role(String role) { this.role = role; return this; }
        Builder active(boolean active) { this.active = active; return this; }
        Builder verified(boolean verified) { this.verified = verified; return this; }

        User build() { return new User(this); }
    }
}

// Clean, readable creation
User user = new User.Builder("Alice", "alice@example.com")
    .age(25)
    .city("New York")
    .role("Engineer")
    .verified(true)
    .build();

System.out.println(user);
```

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    email: str
    age: int = 0
    city: str = ""
    role: str = "User"
    active: bool = True
    verified: bool = False

# Python's keyword arguments serve as a built-in builder
user = User(
    name="Alice",
    email="alice@example.com",
    age=25,
    city="New York",
    role="Engineer",
    verified=True,
)

print(user)
```

```javascript
class User {
  constructor(builder) {
    this.name = builder.name;
    this.email = builder.email;
    this.age = builder.age;
    this.city = builder.city;
    this.role = builder.role;
    this.active = builder.active;
    this.verified = builder.verified;
  }

  toString() {
    return `User{name='${this.name}', email='${this.email}', city='${this.city}'}`;
  }

  static Builder = class {
    constructor(name, email) {
      this.name = name;       // required
      this.email = email;     // required
      this.age = 0;
      this.city = "";
      this.role = "User";
      this.active = true;
      this.verified = false;
    }

    setAge(age) { this.age = age; return this; }
    setCity(city) { this.city = city; return this; }
    setRole(role) { this.role = role; return this; }
    setActive(active) { this.active = active; return this; }
    setVerified(verified) { this.verified = verified; return this; }

    build() { return new User(this); }
  };
}

// Clean, readable creation
const user = new User.Builder("Alice", "alice@example.com")
  .setAge(25)
  .setCity("New York")
  .setRole("Engineer")
  .setVerified(true)
  .build();

console.log(user.toString());
```

---

## Pattern Comparison

| Pattern | Use When | Returns |
|---------|----------|---------|
| **Singleton** | Need exactly one instance | The same instance every time |
| **Factory** | Need to create different types based on input | New instance of the appropriate type |
| **Builder** | Object has many optional parameters | A fully configured object |

---

## Lazy Initialization (C#)

C# provides `Lazy<T>` as a built-in thread-safe lazy initialization pattern:

```csharp
using System;

class ExpensiveResource {
    public ExpensiveResource() {
        Console.WriteLine("Heavy initialization...");
    }

    public void DoWork() => Console.WriteLine("Working!");
}

class Application {
    // Resource is only created when first accessed
    private static readonly Lazy<ExpensiveResource> _resource =
        new(() => new ExpensiveResource());

    public static ExpensiveResource Resource => _resource.Value;
}

// First access triggers creation
Application.Resource.DoWork();  // "Heavy initialization..." then "Working!"
// Subsequent access returns same instance
Application.Resource.DoWork();  // "Working!" (no re-initialization)
```

---

## Key Takeaways

- **Singleton**: one instance only — use sparingly (logger, config, connection pool)
- **Factory**: create objects without knowing the exact class — great for extensibility
- **Builder**: construct complex objects step by step — great for readability
- All three patterns **decouple** the creation process from the usage
- Don't over-use Singleton — it can make testing difficult

Next: **Structural Patterns** — Adapter, Decorator, and Facade.
