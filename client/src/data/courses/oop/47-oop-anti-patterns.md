---
title: OOP Anti-Patterns
---

# OOP Anti-Patterns

**Anti-patterns** are common mistakes that seem like good ideas but lead to poor design. Recognizing them helps you avoid costly pitfalls.

---

## 1. God Object / God Class

A single class that knows and does **too much**.

```cpp
// ❌ God Class — manages everything
class Application {
public:
    void handleUserLogin() { }
    void handleUserLogout() { }
    void processPayment() { }
    void sendEmail() { }
    void generateReport() { }
    void backupDatabase() { }
    void renderUI() { }
    void validateInput() { }
    void calculateTax() { }
    // ... 50 more methods
};
```

```csharp
// ❌ God Class — manages everything
class Application
{
    public void HandleUserLogin() { }
    public void HandleUserLogout() { }
    public void ProcessPayment() { }
    public void SendEmail() { }
    public void GenerateReport() { }
    public void BackupDatabase() { }
    public void RenderUI() { }
    public void ValidateInput() { }
    public void CalculateTax() { }
    // ... 50 more methods
}
```

```java
// ❌ God Class — manages everything
class Application {
    void handleUserLogin() { }
    void handleUserLogout() { }
    void processPayment() { }
    void sendEmail() { }
    void generateReport() { }
    void backupDatabase() { }
    void renderUI() { }
    void validateInput() { }
    void calculateTax() { }
    // ... 50 more methods
}
```

```python
# ❌ God Class — manages everything
class Application:
    def handle_user_login(self): pass
    def handle_user_logout(self): pass
    def process_payment(self): pass
    def send_email(self): pass
    def generate_report(self): pass
    def backup_database(self): pass
    def render_ui(self): pass
    def validate_input(self): pass
    def calculate_tax(self): pass
    # ... 50 more methods
```

```javascript
// ❌ God Class — manages everything
class Application {
  handleUserLogin() {}
  handleUserLogout() {}
  processPayment() {}
  sendEmail() {}
  generateReport() {}
  backupDatabase() {}
  renderUI() {}
  validateInput() {}
  calculateTax() {}
  // ... 50 more methods
}
```

**Problem**: One change can break everything. Impossible to test in isolation.

**Fix**: Apply **Single Responsibility Principle** — split into focused classes.

---

## 2. Spaghetti Inheritance

Deeply nested or overly complex inheritance hierarchies.

```cpp
// ❌ Too many levels — hard to understand
class A { };
class B : public A { };
class C : public B { };
class D : public C { };
class E : public D { };
class F : public E { };
// Which method comes from where? Good luck figuring out!
```

```csharp
// ❌ Too many levels — hard to understand
class A { }
class B : A { }
class C : B { }
class D : C { }
class E : D { }
class F : E { }
// Which method comes from where? Good luck figuring out!
```

```java
// ❌ Too many levels — hard to understand
class A { }
class B extends A { }
class C extends B { }
class D extends C { }
class E extends D { }
class F extends E { }
// Which method comes from where? Good luck figuring out!
```

```python
# ❌ Too many levels — hard to understand
class A: pass
class B(A): pass
class C(B): pass
class D(C): pass
class E(D): pass
class F(E): pass
# Which method comes from where? Good luck figuring out!
```

```javascript
// ❌ Too many levels — hard to understand
class A {}
class B extends A {}
class C extends B {}
class D extends C {}
class E extends D {}
class F extends E {}
// Which method comes from where? Good luck figuring out!
```

**Problem**: Hard to understand which class contributes what. Changes at the top cascade through everything.

**Fix**: Prefer **composition over inheritance**. Keep hierarchies shallow (2–3 levels max).

---

## 3. Anemic Domain Model

Classes that have **data but no behaviour** — just getters and setters.

```cpp
// ❌ Anemic — no behaviour, just data
class Order {
    double amount;
    std::string status;
public:
    double getAmount() { return amount; }
    void setAmount(double a) { amount = a; }
    std::string getStatus() { return status; }
    void setStatus(std::string s) { status = s; }
};

// All logic lives outside the class:
class OrderService {
public:
    void cancelOrder(Order& order) {
        if (order.getStatus() == "SHIPPED") {
            throw std::runtime_error("Can't cancel shipped order");
        }
        order.setStatus("CANCELLED");
    }
};
```

```csharp
// ❌ Anemic — no behaviour, just data
class Order
{
    public double Amount { get; set; }
    public string Status { get; set; }
}

// All logic lives outside the class:
class OrderService
{
    public void CancelOrder(Order order)
    {
        if (order.Status == "SHIPPED")
            throw new InvalidOperationException("Can't cancel shipped order");
        order.Status = "CANCELLED";
    }
}
```

```java
// ❌ Anemic — no behaviour, just data
class Order {
    private double amount;
    private String status;

    double getAmount() { return amount; }
    void setAmount(double a) { amount = a; }
    String getStatus() { return status; }
    void setStatus(String s) { status = s; }
}

// All logic lives outside the class:
class OrderService {
    void cancelOrder(Order order) {
        if (order.getStatus().equals("SHIPPED")) {
            throw new RuntimeException("Can't cancel shipped order");
        }
        order.setStatus("CANCELLED");
    }
}
```

```python
# ❌ Anemic — no behaviour, just data
class Order:
    def __init__(self):
        self.amount = 0
        self.status = ""

# All logic lives outside the class:
class OrderService:
    def cancel_order(self, order):
        if order.status == "SHIPPED":
            raise RuntimeError("Can't cancel shipped order")
        order.status = "CANCELLED"
```

```javascript
// ❌ Anemic — no behaviour, just data
class Order {
  constructor() {
    this.amount = 0;
    this.status = "";
  }
}

// All logic lives outside the class:
class OrderService {
  cancelOrder(order) {
    if (order.status === "SHIPPED") {
      throw new Error("Can't cancel shipped order");
    }
    order.status = "CANCELLED";
  }
}
```

**Fix**: Move behaviour into the class (Rich Domain Model):

```cpp
// ✅ Rich Domain Model — behaviour lives with the data
class Order {
    double amount;
    std::string status;
public:
    void cancel() {
        if (status == "SHIPPED") {
            throw std::runtime_error("Can't cancel shipped order");
        }
        status = "CANCELLED";
    }

    bool canCancel() {
        return status != "SHIPPED" && status != "DELIVERED";
    }
};
```

```csharp
// ✅ Rich Domain Model — behaviour lives with the data
class Order
{
    public double Amount { get; }
    public string Status { get; private set; }

    public Order(double amount, string status = "PENDING")
    {
        Amount = amount;
        Status = status;
    }

    public void Cancel()
    {
        if (Status == "SHIPPED")
            throw new InvalidOperationException("Can't cancel shipped order");
        Status = "CANCELLED";
    }

    public bool CanCancel() => Status != "SHIPPED" && Status != "DELIVERED";
}
```

```java
// ✅ Rich Domain Model — behaviour lives with the data
class Order {
    private double amount;
    private String status;

    void cancel() {
        if ("SHIPPED".equals(status)) {
            throw new RuntimeException("Can't cancel shipped order");
        }
        this.status = "CANCELLED";
    }

    boolean canCancel() {
        return !"SHIPPED".equals(status) && !"DELIVERED".equals(status);
    }
}
```

```python
# ✅ Rich Domain Model — behaviour lives with the data
class Order:
    def __init__(self, amount, status="PENDING"):
        self.amount = amount
        self.status = status

    def cancel(self):
        if self.status == "SHIPPED":
            raise RuntimeError("Can't cancel shipped order")
        self.status = "CANCELLED"

    def can_cancel(self):
        return self.status not in ("SHIPPED", "DELIVERED")
```

```javascript
// ✅ Rich Domain Model — behaviour lives with the data
class Order {
  constructor(amount, status = "PENDING") {
    this.amount = amount;
    this.status = status;
  }

  cancel() {
    if (this.status === "SHIPPED") {
      throw new Error("Can't cancel shipped order");
    }
    this.status = "CANCELLED";
  }

  canCancel() {
    return this.status !== "SHIPPED" && this.status !== "DELIVERED";
  }
}
```

---

## 4. Premature Abstraction

Creating abstractions before you have multiple use cases.

```cpp
// ❌ Over-engineered for a single use case
class IDataSource { virtual ~IDataSource() = default; };
class IDataSourceFactory { virtual ~IDataSourceFactory() = default; };
class AbstractDataSourceFactory : public IDataSourceFactory { };
class ConcreteDataSourceFactory : public AbstractDataSourceFactory { };
// ... and you only have ONE data source

// ✅ Start simple
class Database {
public:
    void query(const std::string& sql) { }
};
```

```csharp
// ❌ Over-engineered for a single use case
interface IDataSource { }
interface IDataSourceFactory { }
abstract class AbstractDataSourceFactory : IDataSourceFactory { }
class ConcreteDataSourceFactory : AbstractDataSourceFactory { }
// ... and you only have ONE data source

// ✅ Start simple
class Database
{
    public void Query(string sql) { }
}
```

```java
// ❌ Over-engineered for a single use case
interface DataSource { }
interface DataSourceFactory { }
abstract class AbstractDataSourceFactory implements DataSourceFactory { }
class ConcreteDataSourceFactory extends AbstractDataSourceFactory { }
class DataSourceFactoryProvider { }
// ... and you only have ONE data source

// ✅ Start simple, add abstractions when you actually need them
class Database {
    void query(String sql) { }
}
```

```python
# ❌ Over-engineered for a single use case
class DataSourceInterface: pass
class DataSourceFactory: pass
class AbstractDataSourceFactory(DataSourceFactory): pass
class ConcreteDataSourceFactory(AbstractDataSourceFactory): pass
# ... and you only have ONE data source

# ✅ Start simple
class Database:
    def query(self, sql): pass
```

```javascript
// ❌ Over-engineered for a single use case
class DataSource {}
class DataSourceFactory {}
class AbstractDataSourceFactory extends DataSourceFactory {}
class ConcreteDataSourceFactory extends AbstractDataSourceFactory {}
// ... and you only have ONE data source

// ✅ Start simple
class Database {
  query(sql) {}
}
```

**Rule**: Don't create an interface until you have at least **two implementations**.

---

## 5. Refused Bequest

A subclass that doesn't use most of the inherited methods.

```cpp
// ❌ Stack doesn't need most vector methods
class Stack : public std::vector<int> {
public:
    void push(int item) { push_back(item); }
    int pop() { int val = back(); pop_back(); return val; }
    // But now Stack also exposes: operator[], at(), insert(), erase(), sort()...
};
```

```csharp
// ❌ Stack doesn't need most List methods
class Stack : List<int>
{
    public void Push(int item) => Add(item);
    public new int Pop() { var val = this[^1]; RemoveAt(Count - 1); return val; }
    // But now Stack also has: Insert(), Sort(), BinarySearch(), etc.
}
```

```java
// ❌ Stack doesn't need most ArrayList methods
class Stack extends ArrayList {
    void push(Object item) { add(item); }
    Object pop() { return remove(size() - 1); }
    // But now Stack also has: get(), set(), remove(index), sort(), etc.
}
```

```python
# ❌ Stack doesn't need most list methods
class Stack(list):
    def push(self, item):
        self.append(item)
    # But now Stack also has: insert(), sort(), reverse(), __getitem__()...
```

```javascript
// ❌ Stack doesn't need most Array methods
class Stack extends Array {
  pushItem(item) { this.push(item); }
  popItem() { return this.pop(); }
  // But now Stack also has: splice(), sort(), map(), filter()...
}
```

**Fix**: Use **composition** instead of inheritance.

```cpp
class Stack {
    std::vector<int> items;
public:
    void push(int item) { items.push_back(item); }
    int pop() { int val = items.back(); items.pop_back(); return val; }
    // Only exposes the methods that make sense
};
```

```csharp
class Stack
{
    private readonly List<int> _items = new();

    public void Push(int item) => _items.Add(item);
    public int Pop() { var val = _items[^1]; _items.RemoveAt(_items.Count - 1); return val; }
    // Only exposes the methods that make sense
}
```

```java
class Stack {
    private List<Object> items = new ArrayList<>();

    void push(Object item) { items.add(item); }
    Object pop() { return items.remove(items.size() - 1); }
    // Only exposes the methods that make sense
}
```

```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()
    # Only exposes the methods that make sense
```

```javascript
class Stack {
  constructor() {
    this._items = [];
  }

  push(item) { this._items.push(item); }
  pop() { return this._items.pop(); }
  // Only exposes the methods that make sense
}
```

---

## Anti-Pattern Detection Checklist

| Anti-Pattern | Signs | Fix |
|-------------|-------|-----|
| God Object | Class > 500 lines, too many methods | Split by responsibility |
| Spaghetti Inheritance | > 3 levels deep | Flatten, use composition |
| Anemic Domain Model | All getters/setters, no logic | Move behaviour into the class |
| Premature Abstraction | Interface with one implementor | YAGNI — simplify |
| Singleton Overuse | Global singletons everywhere | Use dependency injection |
| Circular Dependencies | A → B → A | Introduce interfaces |
| Refused Bequest | Subclass ignores parent methods | Use composition |

---

## Key Takeaways

- Anti-patterns are **common design mistakes** that harm maintainability
- **God Object**: split large classes into focused ones
- **Favour composition** over deep inheritance
- Put **behaviour with data** (rich domain model vs anemic)
- **Don't abstract prematurely** — wait for real use cases
- **Avoid Singleton overuse** — use dependency injection
- Regularly review code for these patterns

Next: **OOP in Different Languages** — comparing OOP features across languages.
