---
title: OOP and Domain-Driven Design
---

# OOP and Domain-Driven Design (DDD)

**Domain-Driven Design** is an approach to software development that focuses on modelling the **business domain** accurately using OOP. It bridges the gap between business experts and developers.

---

## What is DDD?

DDD is about structuring your code around the **real-world domain** it represents, using a shared language that both developers and business experts understand.

---

## Key DDD Concepts

### Ubiquitous Language

Everyone (developers, business analysts, stakeholders) uses the **same terms**:

```
❌ "The UserRecord table has a status_flag column"
✅ "An Order can be placed, shipped, or cancelled"
```

The code should reflect this language:

```cpp
// ❌ Technical naming
class UserRecord {
public:
    int statusFlag;
    void updateFlag(int newFlag) { statusFlag = newFlag; }
};

// ✅ Domain-driven naming
enum class OrderStatus { Placed, Shipped, Cancelled };

class Order {
public:
    OrderStatus status;
    void place() { status = OrderStatus::Placed; }
    void ship() { status = OrderStatus::Shipped; }
    void cancel() { status = OrderStatus::Cancelled; }
};
```

```csharp
// ❌ Technical naming
class UserRecord
{
    public int StatusFlag;
    public void UpdateFlag(int newFlag) { StatusFlag = newFlag; }
}

// ✅ Domain-driven naming
public enum OrderStatus { Placed, Shipped, Cancelled }

public class Order
{
    public OrderStatus Status { get; private set; }

    public void Place() => Status = OrderStatus.Placed;
    public void Ship() => Status = OrderStatus.Shipped;
    public void Cancel() => Status = OrderStatus.Cancelled;
}
```

```java
// ❌ Technical naming
class UserRecord {
    int statusFlag;
    void updateFlag(int newFlag) { }
}

// ✅ Domain-driven naming
class Order {
    OrderStatus status;
    void place() { }
    void ship() { }
    void cancel() { }
}
```

```python
# ❌ Technical naming
class UserRecord:
    def __init__(self):
        self.status_flag = 0

    def update_flag(self, new_flag):
        self.status_flag = new_flag

# ✅ Domain-driven naming
class Order:
    def __init__(self):
        self.status = "pending"

    def place(self):
        self.status = "placed"

    def ship(self):
        self.status = "shipped"

    def cancel(self):
        self.status = "cancelled"
```

```javascript
// ❌ Technical naming
class UserRecord {
  constructor() {
    this.statusFlag = 0;
  }
  updateFlag(newFlag) {
    this.statusFlag = newFlag;
  }
}

// ✅ Domain-driven naming
class Order {
  constructor() {
    this.status = "pending";
  }
  place() { this.status = "placed"; }
  ship() { this.status = "shipped"; }
  cancel() { this.status = "cancelled"; }
}
```

### Entities

Objects with a **unique identity** that persists over time:

```cpp
#include <string>

class Customer {
    std::string id_;      // Identity
    std::string name_;    // Can change
    std::string email_;   // Can change
public:
    Customer(std::string id, std::string name, std::string email)
        : id_(std::move(id)), name_(std::move(name)), email_(std::move(email)) {}

    const std::string& getId() const { return id_; }
    const std::string& getName() const { return name_; }

    // Two customers are equal if they have the same ID
    bool operator==(const Customer& other) const {
        return id_ == other.id_;
    }
};
```

```csharp
public class Customer
{
    public string Id { get; }        // Identity
    public string Name { get; set; } // Can change
    public string Email { get; set; } // Can change

    public Customer(string id, string name, string email)
    {
        Id = id; Name = name; Email = email;
    }

    // Two customers are equal if they have the same ID
    public override bool Equals(object? obj)
        => obj is Customer c && Id == c.Id;

    public override int GetHashCode() => Id.GetHashCode();
}
```

```java
class Customer {
    private final String id;       // Identity
    private String name;           // Can change
    private String email;          // Can change

    Customer(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Two customers are equal if they have the same ID
    @Override
    public boolean equals(Object o) {
        if (o instanceof Customer) {
            return id.equals(((Customer) o).id);
        }
        return false;
    }
}
```

```python
class Customer:
    def __init__(self, customer_id, name, email):
        self.id = customer_id   # Identity
        self.name = name        # Can change
        self.email = email      # Can change

    # Two customers are equal if they have the same ID
    def __eq__(self, other):
        return isinstance(other, Customer) and self.id == other.id

    def __hash__(self):
        return hash(self.id)
```

```javascript
class Customer {
  #id;    // Identity
  #name;  // Can change
  #email; // Can change

  constructor(id, name, email) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
  }

  get id() { return this.#id; }
  get name() { return this.#name; }

  // Two customers are equal if they have the same ID
  equals(other) {
    return other instanceof Customer && this.#id === other.id;
  }
}
```

### Value Objects

Objects defined by their **attributes**, not identity. They are **immutable**:

```cpp
#include <string>
#include <stdexcept>

class Money {
    double amount_;
    std::string currency_;
public:
    Money(double amount, std::string currency)
        : amount_(amount), currency_(std::move(currency)) {}

    double amount() const { return amount_; }
    const std::string& currency() const { return currency_; }

    Money add(const Money& other) const {
        if (currency_ != other.currency_)
            throw std::invalid_argument("Currency mismatch");
        return Money(amount_ + other.amount_, currency_);
    }

    bool operator==(const Money& other) const {
        return amount_ == other.amount_ && currency_ == other.currency_;
    }
};

struct Address {
    std::string street;
    std::string city;
    std::string country;

    bool operator==(const Address& other) const {
        return street == other.street && city == other.city
            && country == other.country;
    }
};
```

```csharp
// Value Object — immutable, defined by attributes
public record Money(double Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new ArgumentException("Currency mismatch");
        return new Money(Amount + other.Amount, Currency);
    }
}

public record Address(string Street, string City, string Country);

// Two Money objects with same amount and currency ARE equal
var a = new Money(100, "USD");
var b = new Money(100, "USD");
Console.WriteLine(a == b);  // True (records compare by value)
```

```java
record Money(double amount, String currency) {
    Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Currency mismatch");
        return new Money(amount + other.amount, currency);
    }
}

record Address(String street, String city, String country) { }

// Two Money objects with same amount and currency ARE equal
Money a = new Money(100, "USD");
Money b = new Money(100, "USD");
System.out.println(a.equals(b));  // true
```

```python
from dataclasses import dataclass

# Value Object (immutable)
@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

    def add(self, other):
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

@dataclass(frozen=True)
class Address:
    street: str
    city: str
    country: str

# Two Money objects with same amount and currency ARE equal
a = Money(100, "USD")
b = Money(100, "USD")
print(a == b)  # True
```

```javascript
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
    Object.freeze(this);
  }

  add(other) {
    if (this.currency !== other.currency)
      throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

class Address {
  constructor(street, city, country) {
    this.street = street;
    this.city = city;
    this.country = country;
    Object.freeze(this);
  }
}

// Two Money objects with same amount and currency ARE equal
const a = new Money(100, "USD");
const b = new Money(100, "USD");
console.log(a.equals(b)); // true
```

### Aggregates

A cluster of related objects treated as a single unit. One object is the **aggregate root** that controls access:

```cpp
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>

class OrderLine {
    std::string productId_;
    std::string productName_;
    int quantity_;
    double unitPrice_;
public:
    OrderLine(std::string id, std::string name, int qty, double price)
        : productId_(std::move(id)), productName_(std::move(name)),
          quantity_(qty), unitPrice_(price) {}

    const std::string& getProductId() const { return productId_; }
    double getSubtotal() const { return unitPrice_ * quantity_; }
};

class Order {  // Aggregate root
    std::string id_;
    std::vector<OrderLine> lines_;
    double total_ = 0;

    void recalculateTotal() {
        total_ = std::accumulate(lines_.begin(), lines_.end(), 0.0,
            [](double sum, const OrderLine& l) { return sum + l.getSubtotal(); });
    }
public:
    Order(std::string id) : id_(std::move(id)) {}

    void addItem(std::string productId, std::string name, int qty, double price) {
        lines_.emplace_back(std::move(productId), std::move(name), qty, price);
        recalculateTotal();
    }

    void removeItem(const std::string& productId) {
        lines_.erase(std::remove_if(lines_.begin(), lines_.end(),
            [&](const OrderLine& l) { return l.getProductId() == productId; }),
            lines_.end());
        recalculateTotal();
    }

    double getTotal() const { return total_; }
};
```

```csharp
using System.Collections.Generic;
using System.Linq;

public class OrderLine
{
    public string ProductId { get; }
    public string ProductName { get; }
    public int Quantity { get; }
    public double UnitPrice { get; }

    public OrderLine(string productId, string productName, int qty, double price)
    {
        ProductId = productId; ProductName = productName;
        Quantity = qty; UnitPrice = price;
    }

    public double Subtotal => UnitPrice * Quantity;
}

public class Order  // Aggregate root
{
    private readonly List<OrderLine> _lines = new();
    public string Id { get; }

    public Order(string id) => Id = id;

    public void AddItem(string productId, string name, int qty, double price)
        => _lines.Add(new OrderLine(productId, name, qty, price));

    public void RemoveItem(string productId)
        => _lines.RemoveAll(l => l.ProductId == productId);

    public double Total => _lines.Sum(l => l.Subtotal);
}
```

```java
class Order {  // Aggregate root
    private String id;
    private List<OrderLine> lines = new ArrayList<>();
    private Money total = new Money(0, "USD");

    void addItem(Product product, int quantity) {
        // All access goes through the aggregate root
        lines.add(new OrderLine(product, quantity));
        recalculateTotal();
    }

    void removeItem(String productId) {
        lines.removeIf(l -> l.getProductId().equals(productId));
        recalculateTotal();
    }

    private void recalculateTotal() {
        total = lines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(new Money(0, "USD"), Money::add);
    }
}

class OrderLine {  // Internal to Order aggregate
    private String productId;
    private String productName;
    private int quantity;
    private Money unitPrice;

    Money getSubtotal() {
        return new Money(unitPrice.amount() * quantity,
                         unitPrice.currency());
    }
}
```

```python
class OrderLine:
    def __init__(self, product_id, product_name, quantity, unit_price):
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

class Order:  # Aggregate root
    def __init__(self, order_id, customer):
        self.id = order_id
        self.customer = customer
        self._lines = []

    def add_item(self, product_id, name, price, qty):
        self._lines.append(OrderLine(product_id, name, qty, price))

    def remove_item(self, product_id):
        self._lines = [l for l in self._lines if l.product_id != product_id]

    @property
    def total(self):
        return sum(l.subtotal for l in self._lines)
```

```javascript
class OrderLine {
  constructor(productId, productName, quantity, unitPrice) {
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  get subtotal() {
    return this.unitPrice * this.quantity;
  }
}

class Order { // Aggregate root
  #id;
  #lines = [];
  #customer;

  constructor(id, customer) {
    this.#id = id;
    this.#customer = customer;
  }

  addItem(productId, name, quantity, unitPrice) {
    this.#lines.push(new OrderLine(productId, name, quantity, unitPrice));
  }

  removeItem(productId) {
    this.#lines = this.#lines.filter((l) => l.productId !== productId);
  }

  get total() {
    return this.#lines.reduce((sum, l) => sum + l.subtotal, 0);
  }
}
```

### Repositories

Handle persistence for aggregates:

```cpp
#include <vector>
#include <string>
#include <memory>

// Repository interface
class OrderRepository {
public:
    virtual ~OrderRepository() = default;
    virtual std::unique_ptr<Order> findById(const std::string& id) = 0;
    virtual void save(const Order& order) = 0;
    virtual std::vector<Order> findByCustomer(const std::string& customerId) = 0;
};

// Implementation details hidden behind the interface
class DatabaseOrderRepository : public OrderRepository {
public:
    std::unique_ptr<Order> findById(const std::string& id) override {
        // SQL query, ORM call, etc.
        return nullptr;
    }

    void save(const Order& order) override {
        // Persist to database
    }

    std::vector<Order> findByCustomer(const std::string& customerId) override {
        // Query by customer
        return {};
    }
};
```

```csharp
using System.Collections.Generic;

public interface IOrderRepository
{
    Order? FindById(string id);
    void Save(Order order);
    IReadOnlyList<Order> FindByCustomer(string customerId);
}

// Implementation details hidden behind the interface
public class DatabaseOrderRepository : IOrderRepository
{
    public Order? FindById(string id)
    {
        // SQL query, ORM call, etc.
        return null;
    }

    public void Save(Order order)
    {
        // Persist to database
    }

    public IReadOnlyList<Order> FindByCustomer(string customerId)
    {
        // Query by customer
        return new List<Order>();
    }
}
```

```java
interface OrderRepository {
    Order findById(String id);
    void save(Order order);
    List<Order> findByCustomer(String customerId);
}

// Implementation details hidden behind the interface
class DatabaseOrderRepository implements OrderRepository {
    @Override
    public Order findById(String id) {
        // SQL query, ORM call, etc.
        return null;
    }

    @Override
    public void save(Order order) {
        // Persist to database
    }

    @Override
    public List<Order> findByCustomer(String customerId) {
        // Query by customer
        return new ArrayList<>();
    }
}
```

```python
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    def find_by_id(self, order_id: str):
        pass

    @abstractmethod
    def save(self, order):
        pass

    @abstractmethod
    def find_by_customer(self, customer_id: str):
        pass

# Implementation details hidden behind the interface
class DatabaseOrderRepository(OrderRepository):
    def find_by_id(self, order_id: str):
        # SQL query, ORM call, etc.
        return None

    def save(self, order):
        # Persist to database
        pass

    def find_by_customer(self, customer_id: str):
        # Query by customer
        return []
```

```javascript
// Repository interface (using JSDoc for contract documentation)
class OrderRepository {
  findById(id) { throw new Error("Not implemented"); }
  save(order) { throw new Error("Not implemented"); }
  findByCustomer(customerId) { throw new Error("Not implemented"); }
}

// Implementation details hidden behind the interface
class DatabaseOrderRepository extends OrderRepository {
  findById(id) {
    // SQL query, ORM call, etc.
    return null;
  }

  save(order) {
    // Persist to database
  }

  findByCustomer(customerId) {
    // Query by customer
    return [];
  }
}
```

### Domain Services

Logic that doesn't belong to any single entity:

```cpp
class PricingService {
public:
    double calculateDiscount(const Order& order, const Customer& customer) {
        if (customer.isVIP()) {
            return order.getTotal() * 0.1;  // 10% VIP discount
        }
        if (order.getTotal() > 1000) {
            return order.getTotal() * 0.05; // 5% bulk discount
        }
        return 0.0;
    }
};
```

```csharp
public class PricingService
{
    public decimal CalculateDiscount(Order order, Customer customer)
    {
        if (customer.IsVip)
            return (decimal)order.Total * 0.1m;  // 10% VIP discount
        if (order.Total > 1000)
            return (decimal)order.Total * 0.05m; // 5% bulk discount
        return 0m;
    }
}
```

```java
class PricingService {
    Money calculateDiscount(Order order, Customer customer) {
        if (customer.isVIP()) {
            return order.getTotal().multiply(0.1);  // 10% VIP discount
        }
        if (order.getTotal().amount() > 1000) {
            return order.getTotal().multiply(0.05); // 5% bulk discount
        }
        return new Money(0, "USD");
    }
}
```

```python
class PricingService:
    def calculate_discount(self, order, customer):
        if customer.is_vip:
            return order.total * 0.1   # 10% VIP discount
        if order.total > 1000:
            return order.total * 0.05  # 5% bulk discount
        return 0.0
```

```javascript
class PricingService {
  calculateDiscount(order, customer) {
    if (customer.isVIP) {
      return order.total * 0.1;  // 10% VIP discount
    }
    if (order.total > 1000) {
      return order.total * 0.05; // 5% bulk discount
    }
    return 0;
  }
}
```

---

## DDD Building Blocks Summary

| Concept | Description | Example |
|---------|-------------|---------|
| **Entity** | Has unique identity | Customer, Order |
| **Value Object** | Defined by attributes, immutable | Money, Address |
| **Aggregate** | Cluster with a root entity | Order + OrderLines |
| **Repository** | Persistence abstraction | OrderRepository |
| **Service** | Domain logic not owned by an entity | PricingService |
| **Factory** | Complex object creation | OrderFactory |

---

## Key Takeaways

- DDD models software around the **business domain**
- Use **ubiquitous language** — code reads like business rules
- **Entities** have identity; **Value Objects** are defined by attributes
- **Aggregates** enforce consistency boundaries
- **Repositories** abstract persistence
- DDD works naturally with OOP — classes represent domain concepts

Next: **Advanced OOP Techniques** — mixins, protocols, and meta-programming patterns.
