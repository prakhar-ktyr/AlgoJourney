---
title: Advanced OOP Techniques
---

# Advanced OOP Techniques

This lesson covers advanced techniques that experienced developers use to write more flexible, maintainable, and powerful OOP code.

---

## 1. Protocols and Structural Typing

Define behaviour through **protocols** — a form of structural typing where classes match by having the right methods, not by explicit inheritance:

```cpp
#include <iostream>
#include <concepts>

// C++20 concepts: structural typing for templates
template<typename T>
concept Drawable = requires(T t) {
    { t.draw() } -> std::same_as<void>;
};

class Circle {
public:
    void draw() const {
        std::cout << "Drawing circle" << std::endl;
    }
};

class Square {
public:
    void draw() const {
        std::cout << "Drawing square" << std::endl;
    }
};

// No inheritance needed — structural typing via concepts!
template<Drawable T>
void render(const T& shape) {
    shape.draw();
}

int main() {
    render(Circle());  // ✅ Has draw() method
    render(Square());  // ✅ Has draw() method
}
```

```csharp
using System;

// C# uses interfaces — explicit contract
public interface IDrawable
{
    void Draw();
}

public class Circle : IDrawable
{
    public void Draw() => Console.WriteLine("Drawing circle");
}

public class Square : IDrawable
{
    public void Draw() => Console.WriteLine("Drawing square");
}

// Must explicitly implement the interface
void Render(IDrawable shape) => shape.Draw();

Render(new Circle());  // ✅
Render(new Square());  // ✅
```

```java
// Java uses interfaces — explicit structural contract
interface Drawable {
    void draw();
}

class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}

class Square implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing square");
    }
}

// Must explicitly implement the interface
void render(Drawable shape) {
    shape.draw();
}

render(new Circle());  // ✅
render(new Square());  // ✅
```

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print("Drawing circle")

class Square:
    def draw(self) -> None:
        print("Drawing square")

# No "implements" keyword needed — structural typing!
def render(shape: Drawable) -> None:
    shape.draw()

render(Circle())   # ✅ Has draw() method
render(Square())   # ✅ Has draw() method
```

```javascript
// JavaScript uses duck typing — no explicit interface needed
class Circle {
  draw() {
    console.log("Drawing circle");
  }
}

class Square {
  draw() {
    console.log("Drawing square");
  }
}

// Duck typing: if it has draw(), it works
function render(shape) {
  shape.draw();
}

render(new Circle()); // ✅ Has draw() method
render(new Square()); // ✅ Has draw() method
```

Unlike interfaces, protocols don't require explicit inheritance — if the class has the right methods, it matches.

---

## 2. Abstract Base Classes with Template Method

Combine abstract classes with the Template Method pattern for powerful frameworks:

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

class DataPipeline {
public:
    // Template method — defines the algorithm skeleton
    void run() {
        auto data = extract();
        auto cleaned = transform(data);
        load(cleaned);
        notify();
    }

    virtual ~DataPipeline() = default;

protected:
    virtual std::vector<std::string> extract() = 0;
    virtual std::vector<std::string> transform(std::vector<std::string> data) = 0;
    virtual void load(const std::vector<std::string>& data) = 0;

    // Optional hook — override if needed
    virtual void notify() {
        std::cout << "Pipeline complete" << std::endl;
    }
};

class CSVToDatabase : public DataPipeline {
protected:
    std::vector<std::string> extract() override {
        std::cout << "Reading CSV file" << std::endl;
        return {"Alice", "Bob"};
    }

    std::vector<std::string> transform(std::vector<std::string> data) override {
        std::cout << "Cleaning data" << std::endl;
        data.erase(std::remove(data.begin(), data.end(), ""), data.end());
        return data;
    }

    void load(const std::vector<std::string>& data) override {
        std::cout << "Inserting " << data.size() << " records into DB" << std::endl;
    }
};

int main() {
    CSVToDatabase pipeline;
    pipeline.run();
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public abstract class DataPipeline
{
    // Template method — defines the algorithm skeleton
    public void Run()
    {
        var data = Extract();
        var cleaned = Transform(data);
        Load(cleaned);
        Notify();
    }

    protected abstract List<Dictionary<string, string>> Extract();
    protected abstract List<Dictionary<string, string>> Transform(
        List<Dictionary<string, string>> data);
    protected abstract void Load(List<Dictionary<string, string>> data);

    // Optional hook — override if needed
    protected virtual void Notify() => Console.WriteLine("Pipeline complete");
}

public class CSVToDatabase : DataPipeline
{
    protected override List<Dictionary<string, string>> Extract()
    {
        Console.WriteLine("Reading CSV file");
        return new() { new() { ["name"] = "Alice" }, new() { ["name"] = "Bob" } };
    }

    protected override List<Dictionary<string, string>> Transform(
        List<Dictionary<string, string>> data)
    {
        Console.WriteLine("Cleaning data");
        return data.Where(d => !string.IsNullOrEmpty(d["name"])).ToList();
    }

    protected override void Load(List<Dictionary<string, string>> data)
    {
        Console.WriteLine($"Inserting {data.Count} records into DB");
    }
}

new CSVToDatabase().Run();
```

```java
abstract class DataPipeline {
    // Template method — defines the algorithm skeleton
    public final void run() {
        var data = extract();
        var cleaned = transform(data);
        load(cleaned);
        notify();
    }

    protected abstract List<Map<String, String>> extract();
    protected abstract List<Map<String, String>> transform(List<Map<String, String>> data);
    protected abstract void load(List<Map<String, String>> data);

    // Optional hook — override if needed
    protected void notify() {
        System.out.println("Pipeline complete");
    }
}

class CSVToDatabase extends DataPipeline {
    @Override
    protected List<Map<String, String>> extract() {
        System.out.println("Reading CSV file");
        return List.of(Map.of("name", "Alice"), Map.of("name", "Bob"));
    }

    @Override
    protected List<Map<String, String>> transform(List<Map<String, String>> data) {
        System.out.println("Cleaning data");
        return data.stream()
            .filter(d -> !d.get("name").isEmpty())
            .collect(Collectors.toList());
    }

    @Override
    protected void load(List<Map<String, String>> data) {
        System.out.println("Inserting " + data.size() + " records into DB");
    }
}

new CSVToDatabase().run();
```

```python
from abc import ABC, abstractmethod

class DataPipeline(ABC):
    def run(self):
        """Template method — defines the algorithm skeleton."""
        data = self.extract()
        cleaned = self.transform(data)
        self.load(cleaned)
        self.notify()

    @abstractmethod
    def extract(self):
        """Override to extract data from source."""
        pass

    @abstractmethod
    def transform(self, data):
        """Override to transform the data."""
        pass

    @abstractmethod
    def load(self, data):
        """Override to load data to destination."""
        pass

    def notify(self):
        """Optional hook — override if needed."""
        print("Pipeline complete")

class CSVToDatabase(DataPipeline):
    def extract(self):
        print("Reading CSV file")
        return [{"name": "Alice"}, {"name": "Bob"}]

    def transform(self, data):
        print("Cleaning data")
        return [d for d in data if d["name"]]

    def load(self, data):
        print(f"Inserting {len(data)} records into DB")

class APIToWarehouse(DataPipeline):
    def extract(self):
        print("Fetching from API")
        return [{"metric": 42}]

    def transform(self, data):
        print("Aggregating metrics")
        return data

    def load(self, data):
        print("Writing to data warehouse")

    def notify(self):
        print("Sending Slack notification")

CSVToDatabase().run()
APIToWarehouse().run()
```

```javascript
class DataPipeline {
  // Template method — defines the algorithm skeleton
  run() {
    const data = this.extract();
    const cleaned = this.transform(data);
    this.load(cleaned);
    this.notify();
  }

  extract() { throw new Error("Must implement extract()"); }
  transform(data) { throw new Error("Must implement transform()"); }
  load(data) { throw new Error("Must implement load()"); }

  // Optional hook — override if needed
  notify() {
    console.log("Pipeline complete");
  }
}

class CSVToDatabase extends DataPipeline {
  extract() {
    console.log("Reading CSV file");
    return [{ name: "Alice" }, { name: "Bob" }];
  }

  transform(data) {
    console.log("Cleaning data");
    return data.filter((d) => d.name);
  }

  load(data) {
    console.log(`Inserting ${data.length} records into DB`);
  }
}

class APIToWarehouse extends DataPipeline {
  extract() {
    console.log("Fetching from API");
    return [{ metric: 42 }];
  }

  transform(data) {
    console.log("Aggregating metrics");
    return data;
  }

  load(data) {
    console.log("Writing to data warehouse");
  }

  notify() {
    console.log("Sending Slack notification");
  }
}

new CSVToDatabase().run();
new APIToWarehouse().run();
```

---

## 3. Validated Properties (Descriptor-like Patterns)

Control how attributes are accessed and validated at the class level:

```cpp
#include <iostream>
#include <string>
#include <stdexcept>

class Product {
    std::string name_;
    double price_;
    int quantity_;

    void validatePrice(double value) {
        if (value < 0)
            throw std::invalid_argument("price must be >= 0, got " + std::to_string(value));
    }

    void validateQuantity(int value) {
        if (value < 0 || value > 10000)
            throw std::invalid_argument("quantity must be 0–10000, got " + std::to_string(value));
    }

public:
    Product(std::string name, double price, int quantity) : name_(std::move(name)) {
        validatePrice(price);
        validateQuantity(quantity);
        price_ = price;
        quantity_ = quantity;
    }

    void setPrice(double value) { validatePrice(value); price_ = value; }
    void setQuantity(int value) { validateQuantity(value); quantity_ = value; }
    double getPrice() const { return price_; }
    int getQuantity() const { return quantity_; }
};

int main() {
    Product p("Widget", 9.99, 100);
    // p.setPrice(-5);       // throws: price must be >= 0
    // p.setQuantity(50000); // throws: quantity must be 0–10000
}
```

```csharp
using System;

public class Product
{
    private double _price;
    private int _quantity;

    public string Name { get; }

    public double Price
    {
        get => _price;
        set
        {
            if (value < 0)
                throw new ArgumentOutOfRangeException(nameof(Price),
                    $"Price must be >= 0, got {value}");
            _price = value;
        }
    }

    public int Quantity
    {
        get => _quantity;
        set
        {
            if (value < 0 || value > 10000)
                throw new ArgumentOutOfRangeException(nameof(Quantity),
                    $"Quantity must be 0–10000, got {value}");
            _quantity = value;
        }
    }

    public Product(string name, double price, int quantity)
    {
        Name = name;
        Price = price;       // Uses setter validation
        Quantity = quantity; // Uses setter validation
    }
}

var p = new Product("Widget", 9.99, 100);
// p.Price = -5;       // ArgumentOutOfRangeException
// p.Quantity = 50000; // ArgumentOutOfRangeException
```

```java
class Product {
    private String name;
    private double price;
    private int quantity;

    Product(String name, double price, int quantity) {
        this.name = name;
        setPrice(price);
        setQuantity(quantity);
    }

    void setPrice(double value) {
        if (value < 0)
            throw new IllegalArgumentException("price must be >= 0, got " + value);
        this.price = value;
    }

    void setQuantity(int value) {
        if (value < 0 || value > 10000)
            throw new IllegalArgumentException("quantity must be 0–10000, got " + value);
        this.quantity = value;
    }

    double getPrice() { return price; }
    int getQuantity() { return quantity; }
}

Product p = new Product("Widget", 9.99, 100);
// p.setPrice(-5);       // IllegalArgumentException
// p.setQuantity(50000); // IllegalArgumentException
```

```python
class Validated:
    """Descriptor that validates attribute values."""
    def __init__(self, min_value=None, max_value=None):
        self.min_value = min_value
        self.max_value = max_value

    def __set_name__(self, owner, name):
        self.name = name

    def __set__(self, obj, value):
        if self.min_value is not None and value < self.min_value:
            raise ValueError(
                f"{self.name} must be >= {self.min_value}, got {value}")
        if self.max_value is not None and value > self.max_value:
            raise ValueError(
                f"{self.name} must be <= {self.max_value}, got {value}")
        obj.__dict__[self.name] = value

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

class Product:
    price = Validated(min_value=0)
    quantity = Validated(min_value=0, max_value=10000)

    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.quantity = quantity

p = Product("Widget", 9.99, 100)
# p.price = -5    # ValueError: price must be >= 0
# p.quantity = 50000  # ValueError: quantity must be <= 10000
```

```javascript
class Product {
  #name;
  #price;
  #quantity;

  constructor(name, price, quantity) {
    this.#name = name;
    this.price = price;       // Uses setter
    this.quantity = quantity;  // Uses setter
  }

  get price() { return this.#price; }
  set price(value) {
    if (value < 0)
      throw new RangeError(`price must be >= 0, got ${value}`);
    this.#price = value;
  }

  get quantity() { return this.#quantity; }
  set quantity(value) {
    if (value < 0 || value > 10000)
      throw new RangeError(`quantity must be 0–10000, got ${value}`);
    this.#quantity = value;
  }
}

const p = new Product("Widget", 9.99, 100);
// p.price = -5;       // RangeError: price must be >= 0
// p.quantity = 50000; // RangeError: quantity must be 0–10000
```

---

## 4. Proxy Pattern with Lazy Loading

Advanced use of the Proxy pattern for performance:

```cpp
#include <iostream>
#include <string>
#include <memory>

class Image {
public:
    virtual void display() = 0;
    virtual ~Image() = default;
};

// Real object — expensive to create
class HighResImage : public Image {
    std::string filename_;
public:
    HighResImage(std::string filename) : filename_(std::move(filename)) {
        loadFromDisk();
    }

    void loadFromDisk() {
        std::cout << "Loading " << filename_ << " from disk (slow)..." << std::endl;
    }

    void display() override {
        std::cout << "Displaying " << filename_ << std::endl;
    }
};

// Proxy — delays loading until actually needed
class ImageProxy : public Image {
    std::string filename_;
    std::unique_ptr<HighResImage> realImage_;
public:
    ImageProxy(std::string filename) : filename_(std::move(filename)) {}

    void display() override {
        if (!realImage_) {
            realImage_ = std::make_unique<HighResImage>(filename_);
        }
        realImage_->display();
    }
};

int main() {
    ImageProxy img("photo.jpg");  // Fast — no loading
    // ... later ...
    img.display();  // NOW it loads and displays
    img.display();  // Already loaded — just displays
}
```

```csharp
using System;

public interface IImage
{
    void Display();
}

// Real object — expensive to create
public class HighResImage : IImage
{
    private readonly string _filename;

    public HighResImage(string filename)
    {
        _filename = filename;
        LoadFromDisk();
    }

    private void LoadFromDisk()
        => Console.WriteLine($"Loading {_filename} from disk (slow)...");

    public void Display()
        => Console.WriteLine($"Displaying {_filename}");
}

// Proxy — delays loading until actually needed
public class ImageProxy : IImage
{
    private readonly string _filename;
    private HighResImage? _realImage;

    public ImageProxy(string filename) => _filename = filename;

    public void Display()
    {
        _realImage ??= new HighResImage(_filename);  // Load on first use
        _realImage.Display();
    }
}

// Usage
IImage img = new ImageProxy("photo.jpg");  // Fast — no loading
// ... later ...
img.Display();  // NOW it loads and displays
img.Display();  // Already loaded — just displays
```

```java
interface Image {
    void display();
}

// Real object — expensive to create
class HighResImage implements Image {
    private String filename;

    HighResImage(String filename) {
        this.filename = filename;
        loadFromDisk();
    }

    private void loadFromDisk() {
        System.out.println("Loading " + filename + " from disk (slow)...");
    }

    @Override
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

// Proxy — delays loading until actually needed
class ImageProxy implements Image {
    private String filename;
    private HighResImage realImage;

    ImageProxy(String filename) {
        this.filename = filename;
        // Does NOT load the image yet!
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new HighResImage(filename);  // Load on first use
        }
        realImage.display();
    }
}

// Usage
Image img = new ImageProxy("photo.jpg");  // Fast — no loading
// ... later ...
img.display();  // NOW it loads and displays
img.display();  // Already loaded — just displays
```

```python
class HighResImage:
    """Real object — expensive to create."""
    def __init__(self, filename):
        self.filename = filename
        self._load_from_disk()

    def _load_from_disk(self):
        print(f"Loading {self.filename} from disk (slow)...")

    def display(self):
        print(f"Displaying {self.filename}")

class ImageProxy:
    """Proxy — delays loading until actually needed."""
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None

    def display(self):
        if self._real_image is None:
            self._real_image = HighResImage(self.filename)
        self._real_image.display()

# Usage
img = ImageProxy("photo.jpg")  # Fast — no loading
# ... later ...
img.display()  # NOW it loads and displays
img.display()  # Already loaded — just displays
```

```javascript
class HighResImage {
  constructor(filename) {
    this.filename = filename;
    this.#loadFromDisk();
  }

  #loadFromDisk() {
    console.log(`Loading ${this.filename} from disk (slow)...`);
  }

  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ImageProxy {
  #filename;
  #realImage = null;

  constructor(filename) {
    this.#filename = filename;
    // Does NOT load the image yet!
  }

  display() {
    if (!this.#realImage) {
      this.#realImage = new HighResImage(this.#filename);
    }
    this.#realImage.display();
  }
}

// Usage
const img = new ImageProxy("photo.jpg"); // Fast — no loading
// ... later ...
img.display(); // NOW it loads and displays
img.display(); // Already loaded — just displays
```

---

## 5. Event-Driven Architecture

Decouple components using events:

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <functional>
#include <unordered_map>

class EventBus {
    std::unordered_map<std::string,
        std::vector<std::function<void(const std::string&, const std::string&)>>> handlers_;
public:
    void on(const std::string& event,
            std::function<void(const std::string&, const std::string&)> handler) {
        handlers_[event].push_back(std::move(handler));
    }

    void emit(const std::string& event,
              const std::string& item, const std::string& email) {
        for (auto& handler : handlers_[event]) {
            handler(item, email);
        }
    }
};

class OrderService {
    EventBus& bus_;
public:
    OrderService(EventBus& bus) : bus_(bus) {}

    void placeOrder(const std::string& item, const std::string& email) {
        std::cout << "Order placed: " << item << std::endl;
        bus_.emit("order_placed", item, email);
    }
};

int main() {
    EventBus bus;

    // Self-registering services
    bus.on("order_placed", [](const std::string& item, const std::string& email) {
        std::cout << "Email to " << email << ": Your " << item << " order is confirmed" << std::endl;
    });
    bus.on("order_placed", [](const std::string& item, const std::string&) {
        std::cout << "Inventory: Reducing stock for " << item << std::endl;
    });

    OrderService orders(bus);
    orders.placeOrder("Laptop", "alice@example.com");
}
```

```csharp
using System;
using System.Collections.Generic;

public class EventBus
{
    private readonly Dictionary<string, List<Action<Dictionary<string, string>>>> _handlers = new();

    public void On(string eventName, Action<Dictionary<string, string>> handler)
    {
        if (!_handlers.ContainsKey(eventName))
            _handlers[eventName] = new();
        _handlers[eventName].Add(handler);
    }

    public void Emit(string eventName, Dictionary<string, string> data)
    {
        if (_handlers.TryGetValue(eventName, out var handlers))
            handlers.ForEach(h => h(data));
    }
}

public class OrderService
{
    private readonly EventBus _bus;
    public OrderService(EventBus bus) => _bus = bus;

    public void PlaceOrder(string item, string email)
    {
        Console.WriteLine($"Order placed: {item}");
        _bus.Emit("order_placed", new() { ["item"] = item, ["email"] = email });
    }
}

// Wire up
var bus = new EventBus();
bus.On("order_placed", data =>
    Console.WriteLine($"Email to {data["email"]}: Your {data["item"]} order is confirmed"));
bus.On("order_placed", data =>
    Console.WriteLine($"Inventory: Reducing stock for {data["item"]}"));

var orders = new OrderService(bus);
orders.PlaceOrder("Laptop", "alice@example.com");
```

```java
import java.util.*;
import java.util.function.Consumer;

class EventBus {
    private Map<String, List<Consumer<Map<String, String>>>> handlers = new HashMap<>();

    void on(String event, Consumer<Map<String, String>> handler) {
        handlers.computeIfAbsent(event, k -> new ArrayList<>()).add(handler);
    }

    void emit(String event, Map<String, String> data) {
        List<Consumer<Map<String, String>>> list = handlers.get(event);
        if (list != null) {
            list.forEach(h -> h.accept(data));
        }
    }
}

class OrderService {
    private EventBus bus;

    OrderService(EventBus bus) { this.bus = bus; }

    void placeOrder(String item, String email) {
        System.out.println("Order placed: " + item);
        bus.emit("order_placed", Map.of("item", item, "email", email));
    }
}

// Wire up
EventBus bus = new EventBus();
bus.on("order_placed", data ->
    System.out.println("Email to " + data.get("email") + ": Your " + data.get("item") + " order is confirmed"));
bus.on("order_placed", data ->
    System.out.println("Inventory: Reducing stock for " + data.get("item")));

OrderService orders = new OrderService(bus);
orders.placeOrder("Laptop", "alice@example.com");
```

```python
from collections import defaultdict

class EventBus:
    def __init__(self):
        self._handlers = defaultdict(list)

    def on(self, event_name, handler):
        self._handlers[event_name].append(handler)

    def emit(self, event_name, **kwargs):
        for handler in self._handlers[event_name]:
            handler(**kwargs)

# Components are completely decoupled
class OrderService:
    def __init__(self, bus):
        self.bus = bus

    def place_order(self, item, email):
        print(f"Order placed: {item}")
        self.bus.emit("order_placed", item=item, email=email)

class EmailService:
    def __init__(self, bus):
        bus.on("order_placed", self.send_confirmation)

    def send_confirmation(self, item, email):
        print(f"Email to {email}: Your {item} order is confirmed")

class InventoryService:
    def __init__(self, bus):
        bus.on("order_placed", self.update_stock)

    def update_stock(self, item, **kwargs):
        print(f"Inventory: Reducing stock for {item}")

class AnalyticsService:
    def __init__(self, bus):
        bus.on("order_placed", self.track)

    def track(self, item, **kwargs):
        print(f"Analytics: Tracked purchase of {item}")

# Wire up
bus = EventBus()
orders = OrderService(bus)
EmailService(bus)       # Self-registers
InventoryService(bus)   # Self-registers
AnalyticsService(bus)   # Self-registers

orders.place_order("Laptop", "alice@example.com")
# Order placed: Laptop
# Email to alice@example.com: Your Laptop order is confirmed
# Inventory: Reducing stock for Laptop
# Analytics: Tracked purchase of Laptop
```

```javascript
class EventBus {
  #handlers = {};

  on(event, handler) {
    if (!this.#handlers[event]) this.#handlers[event] = [];
    this.#handlers[event].push(handler);
  }

  emit(event, data) {
    (this.#handlers[event] || []).forEach((h) => h(data));
  }
}

class OrderService {
  #bus;
  constructor(bus) { this.#bus = bus; }

  placeOrder(item, email) {
    console.log(`Order placed: ${item}`);
    this.#bus.emit("order_placed", { item, email });
  }
}

class EmailService {
  constructor(bus) {
    bus.on("order_placed", ({ item, email }) => {
      console.log(`Email to ${email}: Your ${item} order is confirmed`);
    });
  }
}

class InventoryService {
  constructor(bus) {
    bus.on("order_placed", ({ item }) => {
      console.log(`Inventory: Reducing stock for ${item}`);
    });
  }
}

// Wire up
const bus = new EventBus();
const orders = new OrderService(bus);
new EmailService(bus);     // Self-registers
new InventoryService(bus); // Self-registers

orders.placeOrder("Laptop", "alice@example.com");
// Order placed: Laptop
// Email to alice@example.com: Your Laptop order is confirmed
// Inventory: Reducing stock for Laptop
```

---

## 6. Fluent Interfaces

Design APIs that read like natural language:

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

class QueryBuilder {
    std::string table_;
    std::vector<std::string> conditions_;
    std::string orderBy_;
    int limit_ = -1;
public:
    QueryBuilder& from(const std::string& table) {
        table_ = table;
        return *this;
    }

    QueryBuilder& where(const std::string& condition) {
        conditions_.push_back(condition);
        return *this;
    }

    QueryBuilder& orderBy(const std::string& column) {
        orderBy_ = column;
        return *this;
    }

    QueryBuilder& limit(int n) {
        limit_ = n;
        return *this;
    }

    std::string build() {
        std::ostringstream sql;
        sql << "SELECT * FROM " << table_;
        if (!conditions_.empty()) {
            sql << " WHERE ";
            for (size_t i = 0; i < conditions_.size(); ++i) {
                if (i > 0) sql << " AND ";
                sql << conditions_[i];
            }
        }
        if (!orderBy_.empty()) sql << " ORDER BY " << orderBy_;
        if (limit_ > 0) sql << " LIMIT " << limit_;
        return sql.str();
    }
};

int main() {
    std::string query = QueryBuilder()
        .from("users")
        .where("age > 18")
        .where("active = true")
        .orderBy("name")
        .limit(10)
        .build();
    std::cout << query << std::endl;
    // SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
}
```

```csharp
using System.Collections.Generic;
using System.Linq;

public class QueryBuilder
{
    private string _table = "";
    private readonly List<string> _conditions = new();
    private string? _orderBy;
    private int _limit = -1;

    public QueryBuilder From(string table) { _table = table; return this; }
    public QueryBuilder Where(string condition) { _conditions.Add(condition); return this; }
    public QueryBuilder OrderBy(string column) { _orderBy = column; return this; }
    public QueryBuilder Limit(int n) { _limit = n; return this; }

    public string Build()
    {
        var sql = $"SELECT * FROM {_table}";
        if (_conditions.Any())
            sql += $" WHERE {string.Join(" AND ", _conditions)}";
        if (_orderBy != null) sql += $" ORDER BY {_orderBy}";
        if (_limit > 0) sql += $" LIMIT {_limit}";
        return sql;
    }
}

// Reads like English
var query = new QueryBuilder()
    .From("users")
    .Where("age > 18")
    .Where("active = true")
    .OrderBy("name")
    .Limit(10)
    .Build();
// SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
```

```java
class QueryBuilder {
    private String table;
    private List<String> conditions = new ArrayList<>();
    private String orderBy;
    private int limit = -1;

    QueryBuilder from(String table) {
        this.table = table;
        return this;
    }

    QueryBuilder where(String condition) {
        conditions.add(condition);
        return this;
    }

    QueryBuilder orderBy(String column) {
        this.orderBy = column;
        return this;
    }

    QueryBuilder limit(int n) {
        this.limit = n;
        return this;
    }

    String build() {
        StringBuilder sql = new StringBuilder("SELECT * FROM " + table);
        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }
        if (orderBy != null) sql.append(" ORDER BY ").append(orderBy);
        if (limit > 0) sql.append(" LIMIT ").append(limit);
        return sql.toString();
    }
}

// Reads like English
String query = new QueryBuilder()
    .from("users")
    .where("age > 18")
    .where("active = true")
    .orderBy("name")
    .limit(10)
    .build();
// SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
```

```python
class QueryBuilder:
    def __init__(self):
        self._table = ""
        self._conditions = []
        self._order_by = ""
        self._limit = -1

    def from_table(self, table):
        self._table = table
        return self

    def where(self, condition):
        self._conditions.append(condition)
        return self

    def order_by(self, column):
        self._order_by = column
        return self

    def limit(self, n):
        self._limit = n
        return self

    def build(self):
        sql = f"SELECT * FROM {self._table}"
        if self._conditions:
            sql += " WHERE " + " AND ".join(self._conditions)
        if self._order_by:
            sql += f" ORDER BY {self._order_by}"
        if self._limit > 0:
            sql += f" LIMIT {self._limit}"
        return sql

# Reads like English
query = (QueryBuilder()
    .from_table("users")
    .where("age > 18")
    .where("active = true")
    .order_by("name")
    .limit(10)
    .build())
# SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
```

```javascript
class QueryBuilder {
  #table = "";
  #conditions = [];
  #orderBy = "";
  #limit = -1;

  from(table) {
    this.#table = table;
    return this;
  }

  where(condition) {
    this.#conditions.push(condition);
    return this;
  }

  orderBy(column) {
    this.#orderBy = column;
    return this;
  }

  limit(n) {
    this.#limit = n;
    return this;
  }

  build() {
    let sql = `SELECT * FROM ${this.#table}`;
    if (this.#conditions.length) {
      sql += ` WHERE ${this.#conditions.join(" AND ")}`;
    }
    if (this.#orderBy) sql += ` ORDER BY ${this.#orderBy}`;
    if (this.#limit > 0) sql += ` LIMIT ${this.#limit}`;
    return sql;
  }
}

// Reads like English
const query = new QueryBuilder()
  .from("users")
  .where("age > 18")
  .where("active = true")
  .orderBy("name")
  .limit(10)
  .build();
// SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
```

---

## Extension Methods and Partial Classes (C#)

C# offers unique OOP features not found in other languages:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

// Extension methods — add methods to existing types without modifying them
public static class StringExtensions
{
    public static string Reverse(this string s)
        => new(s.ToCharArray().Reverse().ToArray());

    public static bool IsPalindrome(this string s)
        => s.Equals(s.Reverse(), StringComparison.OrdinalIgnoreCase);
}

// Usage — looks like a native method!
Console.WriteLine("hello".Reverse());        // olleh
Console.WriteLine("racecar".IsPalindrome()); // True

// Partial classes — split a class across multiple files
// File: Order.cs
public partial class Order
{
    public string Id { get; set; }
    public decimal Total { get; set; }
}

// File: Order.Validation.cs (auto-generated or separate concern)
public partial class Order
{
    public bool IsValid() => Total > 0 && !string.IsNullOrEmpty(Id);
}

// Both parts combine into a single class at compile time
var order = new Order { Id = "ORD-001", Total = 99.99m };
Console.WriteLine(order.IsValid()); // True
```

---

## Decorators and Context Managers (Python)

Python's decorators and context managers are powerful OOP tools for modifying class/function behaviour and managing resources:

```python
from dataclasses import dataclass
from contextlib import contextmanager

# --- Class Decorators ---
# @dataclass auto-generates __init__, __repr__, __eq__, etc.
@dataclass
class Point:
    x: float
    y: float

p = Point(3, 4)
print(p)           # Point(x=3, y=4)
print(p == Point(3, 4))  # True

# Custom class decorator — add a method to any class
def add_logging(cls):
    original_init = cls.__init__
    def new_init(self, *args, **kwargs):
        print(f"Creating {cls.__name__}")
        original_init(self, *args, **kwargs)
    cls.__init__ = new_init
    return cls

@add_logging
class Widget:
    def __init__(self, name):
        self.name = name

Widget("btn")  # Creating Widget

# --- Context Managers ---
class DatabaseConnection:
    def __enter__(self):
        print("Opening connection")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing connection")
        return False  # Don't suppress exceptions

    def query(self, sql):
        return f"Result of: {sql}"

with DatabaseConnection() as db:
    print(db.query("SELECT 1"))
# Opening connection → Result of: SELECT 1 → Closing connection
```

---

## Annotations and Reflection (Java)

Java annotations attach metadata to code. Combined with reflection, they enable frameworks like Spring and JUnit:

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

// Define a custom annotation
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Route {
    String path();
    String method() default "GET";
}

// Use the annotation
class UserController {
    @Route(path = "/users", method = "GET")
    public String listUsers() { return "[alice, bob]"; }

    @Route(path = "/users", method = "POST")
    public String createUser() { return "created"; }
}

// Read annotations via reflection
for (Method m : UserController.class.getDeclaredMethods()) {
    Route route = m.getAnnotation(Route.class);
    if (route != null) {
        System.out.println(route.method() + " " + route.path() + " → " + m.getName());
    }
}
// GET /users → listUsers
// POST /users → createUser
```

---

## Key Takeaways
- **Template Method**: define algorithm skeletons in base classes
- **Validated properties**: control attribute access at the class level
- **Lazy loading proxy**: defer expensive operations until needed
- **Event-driven architecture**: decouple components via events
- **Fluent interfaces**: make APIs read like natural language

Next: **OOP Best Practices Summary** — your checklist for professional code.
