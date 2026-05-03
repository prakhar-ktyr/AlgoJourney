---
title: Open/Closed Principle
---

# Open/Closed Principle (OCP)

> "Software entities should be open for extension, but closed for modification."
> — Bertrand Meyer

The **Open/Closed Principle** means you should be able to **add new behaviour** without **changing existing code**.

---

## The Core Idea

- **Open for extension**: You can add new functionality
- **Closed for modification**: You don't change existing, tested, working code

This is achieved through **abstraction** and **polymorphism**.

---

## Violation Example

```cpp
// ❌ BAD — Must modify this method for every new shape
class AreaCalculator {
public:
    double calculateArea(void* shape, const std::string& type) {
        if (type == "circle") {
            Circle* c = static_cast<Circle*>(shape);
            return 3.14159 * c->radius * c->radius;
        } else if (type == "rectangle") {
            Rectangle* r = static_cast<Rectangle*>(shape);
            return r->width * r->height;
        } else if (type == "triangle") {
            Triangle* t = static_cast<Triangle*>(shape);
            return 0.5 * t->base * t->height;
        }
        // Add new shape? Must modify this method!
        return 0;
    }
};
```

```csharp
// ❌ BAD — Must modify this method for every new shape
class AreaCalculator
{
    public double CalculateArea(object shape)
    {
        if (shape is Circle c)
            return Math.PI * c.Radius * c.Radius;
        else if (shape is Rectangle r)
            return r.Width * r.Height;
        else if (shape is Triangle t)
            return 0.5 * t.Base * t.Height;
        // Add new shape? Must modify this method!
        return 0;
    }
}
```

```java
// ❌ BAD — Must modify this method for every new shape
class AreaCalculator {
    double calculateArea(Object shape) {
        if (shape instanceof Circle) {
            Circle c = (Circle) shape;
            return Math.PI * c.radius * c.radius;
        } else if (shape instanceof Rectangle) {
            Rectangle r = (Rectangle) shape;
            return r.width * r.height;
        } else if (shape instanceof Triangle) {
            Triangle t = (Triangle) shape;
            return 0.5 * t.base * t.height;
        }
        // Add new shape? Must modify this method!
        // What if we forget? Bug!
        return 0;
    }
}
```

```python
# ❌ BAD — Must modify this function for every new shape
import math

class AreaCalculator:
    def calculate_area(self, shape):
        if isinstance(shape, Circle):
            return math.pi * shape.radius ** 2
        elif isinstance(shape, Rectangle):
            return shape.width * shape.height
        elif isinstance(shape, Triangle):
            return 0.5 * shape.base * shape.height
        # Add new shape? Must modify this method!
        return 0
```

```javascript
// ❌ BAD — Must modify this function for every new shape
class AreaCalculator {
  calculateArea(shape) {
    if (shape.type === "circle") {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === "rectangle") {
      return shape.width * shape.height;
    } else if (shape.type === "triangle") {
      return 0.5 * shape.base * shape.height;
    }
    // Add new shape? Must modify this method!
    return 0;
  }
}
```

Every new shape requires modifying `calculateArea()`. This is **fragile** and **error-prone**.

---

## OCP-Compliant Version

```cpp
// ✅ GOOD — New shapes extend the hierarchy without modifying existing code
#include <iostream>
#include <cmath>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius_;
public:
    Circle(double radius) : radius_(radius) { }

    double area() const override {
        return M_PI * radius_ * radius_;
    }
};

class Rectangle : public Shape {
    double width_, height_;
public:
    Rectangle(double w, double h) : width_(w), height_(h) { }

    double area() const override {
        return width_ * height_;
    }
};

// AreaCalculator NEVER needs to change
class AreaCalculator {
public:
    double totalArea(const std::vector<Shape*>& shapes) {
        double total = 0;
        for (const auto* s : shapes) {
            total += s->area();  // Polymorphism handles it
        }
        return total;
    }
};

// Adding a new shape — ZERO changes to existing code!
class Pentagon : public Shape {
    double side_;
public:
    Pentagon(double side) : side_(side) { }

    double area() const override {
        return 0.25 * std::sqrt(5 * (5 + 2 * std::sqrt(5))) * side_ * side_;
    }
};
```

```csharp
// ✅ GOOD — New shapes extend the hierarchy without modifying existing code
using System;
using System.Collections.Generic;

abstract class Shape
{
    public abstract double Area();
}

class Circle : Shape
{
    private double radius;
    public Circle(double radius) => this.radius = radius;
    public override double Area() => Math.PI * radius * radius;
}

class Rectangle : Shape
{
    private double width, height;
    public Rectangle(double w, double h) { width = w; height = h; }
    public override double Area() => width * height;
}

// AreaCalculator NEVER needs to change
class AreaCalculator
{
    public double TotalArea(IEnumerable<Shape> shapes)
    {
        double total = 0;
        foreach (var s in shapes)
            total += s.Area();  // Polymorphism handles it
        return total;
    }
}

// Adding a new shape — ZERO changes to existing code!
class Pentagon : Shape
{
    private double side;
    public Pentagon(double side) => this.side = side;
    public override double Area()
        => 0.25 * Math.Sqrt(5 * (5 + 2 * Math.Sqrt(5))) * side * side;
}
```

```java
// ✅ GOOD — New shapes extend the hierarchy without modifying existing code

abstract class Shape {
    abstract double area();
}

class Circle extends Shape {
    double radius;

    Circle(double radius) {
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

class Rectangle extends Shape {
    double width, height;

    Rectangle(double w, double h) {
        this.width = w;
        this.height = h;
    }

    @Override
    double area() {
        return width * height;
    }
}

// AreaCalculator NEVER needs to change
class AreaCalculator {
    double totalArea(Shape[] shapes) {
        double total = 0;
        for (Shape s : shapes) {
            total += s.area();  // Polymorphism handles it
        }
        return total;
    }
}

// Adding a new shape — ZERO changes to existing code!
class Pentagon extends Shape {
    double side;

    Pentagon(double side) {
        this.side = side;
    }

    @Override
    double area() {
        return 0.25 * Math.sqrt(5 * (5 + 2 * Math.sqrt(5))) * side * side;
    }
}
```

```python
# ✅ GOOD — New shapes extend the hierarchy without modifying existing code
import math
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

# AreaCalculator NEVER needs to change
class AreaCalculator:
    def total_area(self, shapes):
        return sum(s.area() for s in shapes)

# Adding a new shape — ZERO changes to existing code!
class Pentagon(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return 0.25 * math.sqrt(5 * (5 + 2 * math.sqrt(5))) * self.side ** 2
```

```javascript
// ✅ GOOD — New shapes extend the hierarchy without modifying existing code

class Shape {
  area() { throw new Error("Must implement area()"); }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

// AreaCalculator NEVER needs to change
class AreaCalculator {
  totalArea(shapes) {
    return shapes.reduce((sum, s) => sum + s.area(), 0);
  }
}

// Adding a new shape — ZERO changes to existing code!
class Pentagon extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  area() {
    return 0.25 * Math.sqrt(5 * (5 + 2 * Math.sqrt(5))) * this.side ** 2;
  }
}
```

---

## OCP with Interfaces

```cpp
#include <iostream>
#include <algorithm>

class Discount {
public:
    virtual double apply(double price) const = 0;
    virtual ~Discount() = default;
};

class NoDiscount : public Discount {
public:
    double apply(double price) const override { return price; }
};

class PercentageDiscount : public Discount {
    double percent_;
public:
    PercentageDiscount(double percent) : percent_(percent) { }

    double apply(double price) const override {
        return price * (1 - percent_ / 100);
    }
};

class FlatDiscount : public Discount {
    double amount_;
public:
    FlatDiscount(double amount) : amount_(amount) { }

    double apply(double price) const override {
        return std::max(0.0, price - amount_);
    }
};

// Checkout NEVER changes — it's closed for modification
class Checkout {
public:
    double calculateTotal(double price, const Discount& discount) {
        return discount.apply(price);
    }
};

// Adding new discount type — no changes to Checkout!
class BuyOneGetOneFree : public Discount {
public:
    double apply(double price) const override {
        return price / 2;
    }
};
```

```csharp
using System;

interface IDiscount
{
    double Apply(double price);
}

class NoDiscount : IDiscount
{
    public double Apply(double price) => price;
}

class PercentageDiscount : IDiscount
{
    private double percent;
    public PercentageDiscount(double percent) => this.percent = percent;
    public double Apply(double price) => price * (1 - percent / 100);
}

class FlatDiscount : IDiscount
{
    private double amount;
    public FlatDiscount(double amount) => this.amount = amount;
    public double Apply(double price) => Math.Max(0, price - amount);
}

// Checkout NEVER changes — it's closed for modification
class Checkout
{
    public double CalculateTotal(double price, IDiscount discount)
        => discount.Apply(price);
}

// Adding new discount type — no changes to Checkout!
class BuyOneGetOneFree : IDiscount
{
    public double Apply(double price) => price / 2;
}
```

```java
interface Discount {
    double apply(double price);
}

class NoDiscount implements Discount {
    @Override
    public double apply(double price) { return price; }
}

class PercentageDiscount implements Discount {
    private double percent;

    PercentageDiscount(double percent) { this.percent = percent; }

    @Override
    public double apply(double price) {
        return price * (1 - percent / 100);
    }
}

class FlatDiscount implements Discount {
    private double amount;

    FlatDiscount(double amount) { this.amount = amount; }

    @Override
    public double apply(double price) {
        return Math.max(0, price - amount);
    }
}

// Checkout NEVER changes — it's closed for modification
class Checkout {
    double calculateTotal(double price, Discount discount) {
        return discount.apply(price);
    }
}

// Adding new discount type — no changes to Checkout!
class BuyOneGetOneFree implements Discount {
    @Override
    public double apply(double price) {
        return price / 2;
    }
}
```

```python
from abc import ABC, abstractmethod

class Discount(ABC):
    @abstractmethod
    def apply(self, price):
        pass

class NoDiscount(Discount):
    def apply(self, price):
        return price

class PercentageDiscount(Discount):
    def __init__(self, percent):
        self.percent = percent

    def apply(self, price):
        return price * (1 - self.percent / 100)

class FlatDiscount(Discount):
    def __init__(self, amount):
        self.amount = amount

    def apply(self, price):
        return max(0, price - self.amount)

# Checkout NEVER changes — it's closed for modification
class Checkout:
    def calculate_total(self, price, discount):
        return discount.apply(price)

# Adding new discount type — no changes to Checkout!
class BuyOneGetOneFree(Discount):
    def apply(self, price):
        return price / 2
```

```javascript
class Discount {
  apply(price) { throw new Error("Must implement apply()"); }
}

class NoDiscount extends Discount {
  apply(price) { return price; }
}

class PercentageDiscount extends Discount {
  constructor(percent) {
    super();
    this.percent = percent;
  }

  apply(price) {
    return price * (1 - this.percent / 100);
  }
}

class FlatDiscount extends Discount {
  constructor(amount) {
    super();
    this.amount = amount;
  }

  apply(price) {
    return Math.max(0, price - this.amount);
  }
}

// Checkout NEVER changes — it's closed for modification
class Checkout {
  calculateTotal(price, discount) {
    return discount.apply(price);
  }
}

// Adding new discount type — no changes to Checkout!
class BuyOneGetOneFree extends Discount {
  apply(price) {
    return price / 2;
  }
}
```

---

## Strategy Pattern (OCP in Action)

The **Strategy pattern** is a common way to implement OCP:

```cpp
#include <iostream>
#include <vector>

class SortStrategy {
public:
    virtual void sort(std::vector<int>& array) = 0;
    virtual ~SortStrategy() = default;
};

class BubbleSort : public SortStrategy {
public:
    void sort(std::vector<int>& array) override {
        std::cout << "Sorting with Bubble Sort" << std::endl;
        // bubble sort implementation
    }
};

class QuickSort : public SortStrategy {
public:
    void sort(std::vector<int>& array) override {
        std::cout << "Sorting with Quick Sort" << std::endl;
        // quick sort implementation
    }
};

class MergeSort : public SortStrategy {
public:
    void sort(std::vector<int>& array) override {
        std::cout << "Sorting with Merge Sort" << std::endl;
        // merge sort implementation
    }
};

// Sorter is CLOSED for modification, OPEN for extension
class Sorter {
    SortStrategy* strategy_;
public:
    Sorter(SortStrategy* strategy) : strategy_(strategy) { }

    void sort(std::vector<int>& data) {
        strategy_->sort(data);
    }
};

// Usage
int main() {
    std::vector<int> data = {5, 3, 1, 4, 2};
    QuickSort qs;
    Sorter sorter(&qs);
    sorter.sort(data);

    // Switch strategy without changing Sorter
    MergeSort ms;
    Sorter sorter2(&ms);
    sorter2.sort(data);
}
```

```csharp
using System;

interface ISortStrategy
{
    void Sort(int[] array);
}

class BubbleSort : ISortStrategy
{
    public void Sort(int[] array)
    {
        Console.WriteLine("Sorting with Bubble Sort");
        // bubble sort implementation
    }
}

class QuickSort : ISortStrategy
{
    public void Sort(int[] array)
    {
        Console.WriteLine("Sorting with Quick Sort");
        // quick sort implementation
    }
}

class MergeSort : ISortStrategy
{
    public void Sort(int[] array)
    {
        Console.WriteLine("Sorting with Merge Sort");
        // merge sort implementation
    }
}

// Sorter is CLOSED for modification, OPEN for extension
class Sorter
{
    private readonly ISortStrategy strategy;
    public Sorter(ISortStrategy strategy) => this.strategy = strategy;
    public void Sort(int[] data) => strategy.Sort(data);
}

// Usage
var sorter = new Sorter(new QuickSort());
sorter.Sort(new[] {5, 3, 1, 4, 2});

// Switch strategy without changing Sorter
var sorter2 = new Sorter(new MergeSort());
sorter2.Sort(new[] {5, 3, 1, 4, 2});
```

```java
interface SortStrategy {
    void sort(int[] array);
}

class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Bubble Sort");
        // bubble sort implementation
    }
}

class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Quick Sort");
        // quick sort implementation
    }
}

class MergeSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Merge Sort");
        // merge sort implementation
    }
}

// Sorter is CLOSED for modification, OPEN for extension
class Sorter {
    private SortStrategy strategy;

    Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    void sort(int[] data) {
        strategy.sort(data);
    }
}

// Usage
Sorter sorter = new Sorter(new QuickSort());
sorter.sort(new int[]{5, 3, 1, 4, 2});

// Switch strategy without changing Sorter
sorter = new Sorter(new MergeSort());
sorter.sort(new int[]{5, 3, 1, 4, 2});
```

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, array):
        pass

class BubbleSort(SortStrategy):
    def sort(self, array):
        print("Sorting with Bubble Sort")
        # bubble sort implementation

class QuickSort(SortStrategy):
    def sort(self, array):
        print("Sorting with Quick Sort")
        # quick sort implementation

class MergeSort(SortStrategy):
    def sort(self, array):
        print("Sorting with Merge Sort")
        # merge sort implementation

# Sorter is CLOSED for modification, OPEN for extension
class Sorter:
    def __init__(self, strategy):
        self.strategy = strategy

    def sort(self, data):
        self.strategy.sort(data)

# Usage
sorter = Sorter(QuickSort())
sorter.sort([5, 3, 1, 4, 2])

# Switch strategy without changing Sorter
sorter = Sorter(MergeSort())
sorter.sort([5, 3, 1, 4, 2])
```

```javascript
class SortStrategy {
  sort(array) { throw new Error("Must implement sort()"); }
}

class BubbleSort extends SortStrategy {
  sort(array) {
    console.log("Sorting with Bubble Sort");
    // bubble sort implementation
  }
}

class QuickSort extends SortStrategy {
  sort(array) {
    console.log("Sorting with Quick Sort");
    // quick sort implementation
  }
}

class MergeSort extends SortStrategy {
  sort(array) {
    console.log("Sorting with Merge Sort");
    // merge sort implementation
  }
}

// Sorter is CLOSED for modification, OPEN for extension
class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }

  sort(data) {
    this.strategy.sort(data);
  }
}

// Usage
let sorter = new Sorter(new QuickSort());
sorter.sort([5, 3, 1, 4, 2]);

// Switch strategy without changing Sorter
sorter = new Sorter(new MergeSort());
sorter.sort([5, 3, 1, 4, 2]);
```

---

## OCP with Notifications

```cpp
#include <iostream>
#include <string>

class NotificationSender {
public:
    virtual void send(const std::string& message, const std::string& recipient) = 0;
    virtual ~NotificationSender() = default;
};

class EmailSender : public NotificationSender {
public:
    void send(const std::string& message, const std::string& recipient) override {
        std::cout << "Email to " << recipient << ": " << message << std::endl;
    }
};

class SMSSender : public NotificationSender {
public:
    void send(const std::string& message, const std::string& recipient) override {
        std::cout << "SMS to " << recipient << ": " << message << std::endl;
    }
};

class SlackSender : public NotificationSender {
public:
    void send(const std::string& message, const std::string& recipient) override {
        std::cout << "Slack to " << recipient << ": " << message << std::endl;
    }
};

// OrderService never changes — open/closed
class OrderService {
    NotificationSender* notifier_;
public:
    OrderService(NotificationSender* notifier) : notifier_(notifier) { }

    void placeOrder(const std::string& item) {
        std::cout << "Order placed: " << item << std::endl;
        notifier_->send("Your order for " + item + " is confirmed", "user");
    }
};

// Add new notification channels without modifying OrderService
int main() {
    SlackSender slack;
    OrderService service(&slack);
    service.placeOrder("Laptop");
}
```

```csharp
using System;

interface INotificationSender
{
    void Send(string message, string recipient);
}

class EmailSender : INotificationSender
{
    public void Send(string message, string recipient)
        => Console.WriteLine($"Email to {recipient}: {message}");
}

class SmsSender : INotificationSender
{
    public void Send(string message, string recipient)
        => Console.WriteLine($"SMS to {recipient}: {message}");
}

class SlackSender : INotificationSender
{
    public void Send(string message, string recipient)
        => Console.WriteLine($"Slack to {recipient}: {message}");
}

// OrderService never changes — open/closed
class OrderService
{
    private readonly INotificationSender notifier;
    public OrderService(INotificationSender notifier) => this.notifier = notifier;

    public void PlaceOrder(string item)
    {
        Console.WriteLine($"Order placed: {item}");
        notifier.Send($"Your order for {item} is confirmed", "user");
    }
}

// Add new notification channels without modifying OrderService
var service = new OrderService(new SlackSender());
service.PlaceOrder("Laptop");
```

```java
interface NotificationSender {
    void send(String message, String recipient);
}

class EmailSender implements NotificationSender {
    @Override
    public void send(String message, String recipient) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

class SMSSender implements NotificationSender {
    @Override
    public void send(String message, String recipient) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

class SlackSender implements NotificationSender {
    @Override
    public void send(String message, String recipient) {
        System.out.println("Slack to " + recipient + ": " + message);
    }
}

// OrderService never changes — open/closed
class OrderService {
    private NotificationSender notifier;

    OrderService(NotificationSender notifier) {
        this.notifier = notifier;
    }

    void placeOrder(String item) {
        System.out.println("Order placed: " + item);
        notifier.send("Your order for " + item + " is confirmed", "user");
    }
}

// Add new notification channels without modifying OrderService
OrderService service = new OrderService(new SlackSender());
service.placeOrder("Laptop");
```

```python
from abc import ABC, abstractmethod

class NotificationSender(ABC):
    @abstractmethod
    def send(self, message, recipient):
        pass

class EmailSender(NotificationSender):
    def send(self, message, recipient):
        print(f"Email to {recipient}: {message}")

class SMSSender(NotificationSender):
    def send(self, message, recipient):
        print(f"SMS to {recipient}: {message}")

class SlackSender(NotificationSender):
    def send(self, message, recipient):
        print(f"Slack to {recipient}: {message}")

# OrderService never changes — open/closed
class OrderService:
    def __init__(self, notifier):
        self.notifier = notifier

    def place_order(self, item):
        print(f"Order placed: {item}")
        self.notifier.send(f"Your order for {item} is confirmed", "user")

# Add new notification channels without modifying OrderService
service = OrderService(SlackSender())
service.place_order("Laptop")
```

```javascript
class NotificationSender {
  send(message, recipient) { throw new Error("Must implement send()"); }
}

class EmailSender extends NotificationSender {
  send(message, recipient) {
    console.log(`Email to ${recipient}: ${message}`);
  }
}

class SMSSender extends NotificationSender {
  send(message, recipient) {
    console.log(`SMS to ${recipient}: ${message}`);
  }
}

class SlackSender extends NotificationSender {
  send(message, recipient) {
    console.log(`Slack to ${recipient}: ${message}`);
  }
}

// OrderService never changes — open/closed
class OrderService {
  constructor(notifier) {
    this.notifier = notifier;
  }

  placeOrder(item) {
    console.log(`Order placed: ${item}`);
    this.notifier.send(`Your order for ${item} is confirmed`, "user");
  }
}

// Add new notification channels without modifying OrderService
const service = new OrderService(new SlackSender());
service.placeOrder("Laptop");
```

---

## Key Takeaways

- OCP: **extend** behaviour without **modifying** existing code
- Use **abstraction** (abstract classes, interfaces) as the extension point
- New functionality = new class, not modified existing class
- The **Strategy pattern** is a classic implementation of OCP
- Benefits: fewer bugs, less retesting, safer deployments

Next: **Liskov Substitution Principle** — using subtypes correctly.
