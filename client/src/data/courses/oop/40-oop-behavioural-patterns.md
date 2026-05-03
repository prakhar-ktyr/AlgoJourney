---
title: Behavioural Patterns
---

# Behavioural Patterns

Behavioural patterns are concerned with how objects **communicate** and **distribute responsibility**. They define the interaction patterns between objects.

---

## 1. Observer Pattern

**Purpose**: Define a one-to-many dependency so that when one object changes state, all its dependents are notified automatically.

**Analogy**: A YouTube channel (subject) notifies all subscribers (observers) when a new video is published.

### Implementation

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

// Observer interface
class Subscriber {
public:
    virtual void update(const std::string& event, const std::string& data) = 0;
    virtual ~Subscriber() = default;
};

// Subject (Observable)
class EventManager {
    std::vector<Subscriber*> subscribers_;

public:
    void subscribe(Subscriber* s) {
        subscribers_.push_back(s);
    }

    void unsubscribe(Subscriber* s) {
        subscribers_.erase(
            std::remove(subscribers_.begin(), subscribers_.end(), s),
            subscribers_.end());
    }

    void notify(const std::string& event, const std::string& data) {
        for (auto* s : subscribers_) {
            s->update(event, data);
        }
    }
};

// Concrete Subject
class Store {
public:
    EventManager events;

    void addProduct(const std::string& product) {
        events.notify("new_product", product);
    }
};

// Concrete Observers
class EmailAlert : public Subscriber {
    std::string email_;
public:
    EmailAlert(const std::string& email) : email_(email) { }

    void update(const std::string& event, const std::string& data) override {
        std::cout << "Email to " << email_ << ": New " << event << " — " << data << std::endl;
    }
};

class MobileAlert : public Subscriber {
    std::string phone_;
public:
    MobileAlert(const std::string& phone) : phone_(phone) { }

    void update(const std::string& event, const std::string& data) override {
        std::cout << "SMS to " << phone_ << ": New " << event << " — " << data << std::endl;
    }
};

// Usage
Store store;
EmailAlert emailAlert("alice@example.com");
MobileAlert mobileAlert("+1234567890");

store.events.subscribe(&emailAlert);
store.events.subscribe(&mobileAlert);

store.addProduct("iPhone 16");
// Email to alice@example.com: New new_product — iPhone 16
// SMS to +1234567890: New new_product — iPhone 16
```

```csharp
using System;
using System.Collections.Generic;

// Observer interface
interface ISubscriber {
    void Update(string eventType, string data);
}

// Subject (Observable)
class EventManager {
    private readonly List<ISubscriber> _subscribers = new();

    public void Subscribe(ISubscriber s) => _subscribers.Add(s);
    public void Unsubscribe(ISubscriber s) => _subscribers.Remove(s);

    public void Notify(string eventType, string data) {
        foreach (var s in _subscribers)
            s.Update(eventType, data);
    }
}

// Concrete Subject
class Store {
    public EventManager Events { get; } = new();

    public void AddProduct(string product) =>
        Events.Notify("new_product", product);
}

// Concrete Observers
class EmailAlert : ISubscriber {
    private readonly string _email;
    public EmailAlert(string email) { _email = email; }

    public void Update(string eventType, string data) =>
        Console.WriteLine($"Email to {_email}: New {eventType} — {data}");
}

class MobileAlert : ISubscriber {
    private readonly string _phone;
    public MobileAlert(string phone) { _phone = phone; }

    public void Update(string eventType, string data) =>
        Console.WriteLine($"SMS to {_phone}: New {eventType} — {data}");
}

// Usage
var store = new Store();
store.Events.Subscribe(new EmailAlert("alice@example.com"));
store.Events.Subscribe(new MobileAlert("+1234567890"));

store.AddProduct("iPhone 16");
// Email to alice@example.com: New new_product — iPhone 16
// SMS to +1234567890: New new_product — iPhone 16
```

```java
import java.util.ArrayList;
import java.util.List;

// Observer interface
interface Subscriber {
    void update(String event, String data);
}

// Subject (Observable)
class EventManager {
    private List<Subscriber> subscribers = new ArrayList<>();

    void subscribe(Subscriber s) {
        subscribers.add(s);
    }

    void unsubscribe(Subscriber s) {
        subscribers.remove(s);
    }

    void notify(String event, String data) {
        for (Subscriber s : subscribers) {
            s.update(event, data);
        }
    }
}

// Concrete Subject
class Store {
    EventManager events = new EventManager();

    void addProduct(String product) {
        events.notify("new_product", product);
    }
}

// Concrete Observers
class EmailAlert implements Subscriber {
    private String email;

    EmailAlert(String email) { this.email = email; }

    @Override
    public void update(String event, String data) {
        System.out.println("Email to " + email + ": New " + event + " — " + data);
    }
}

class MobileAlert implements Subscriber {
    private String phone;

    MobileAlert(String phone) { this.phone = phone; }

    @Override
    public void update(String event, String data) {
        System.out.println("SMS to " + phone + ": New " + event + " — " + data);
    }
}

// Usage
Store store = new Store();
store.events.subscribe(new EmailAlert("alice@example.com"));
store.events.subscribe(new MobileAlert("+1234567890"));

store.addProduct("iPhone 16");
// Email to alice@example.com: New new_product — iPhone 16
// SMS to +1234567890: New new_product — iPhone 16
```

```python
class EventManager:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, subscriber):
        self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber):
        self._subscribers.remove(subscriber)

    def notify(self, event, data):
        for sub in self._subscribers:
            sub.update(event, data)

class Store:
    def __init__(self):
        self.events = EventManager()

    def add_product(self, product):
        self.events.notify("new_product", product)

class EmailAlert:
    def __init__(self, email):
        self.email = email

    def update(self, event, data):
        print(f"Email to {self.email}: New {event} — {data}")

class MobileAlert:
    def __init__(self, phone):
        self.phone = phone

    def update(self, event, data):
        print(f"SMS to {self.phone}: New {event} — {data}")

# Usage
store = Store()
store.events.subscribe(EmailAlert("alice@example.com"))
store.events.subscribe(MobileAlert("+1234567890"))

store.add_product("iPhone 16")
# Email to alice@example.com: New new_product — iPhone 16
# SMS to +1234567890: New new_product — iPhone 16
```

```javascript
class EventManager {
  constructor() {
    this._subscribers = [];
  }

  subscribe(subscriber) {
    this._subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    this._subscribers = this._subscribers.filter(s => s !== subscriber);
  }

  notify(event, data) {
    for (const sub of this._subscribers) {
      sub.update(event, data);
    }
  }
}

class Store {
  constructor() {
    this.events = new EventManager();
  }

  addProduct(product) {
    this.events.notify("new_product", product);
  }
}

class EmailAlert {
  constructor(email) { this.email = email; }

  update(event, data) {
    console.log(`Email to ${this.email}: New ${event} — ${data}`);
  }
}

class MobileAlert {
  constructor(phone) { this.phone = phone; }

  update(event, data) {
    console.log(`SMS to ${this.phone}: New ${event} — ${data}`);
  }
}

// Usage
const store = new Store();
store.events.subscribe(new EmailAlert("alice@example.com"));
store.events.subscribe(new MobileAlert("+1234567890"));

store.addProduct("iPhone 16");
// Email to alice@example.com: New new_product — iPhone 16
// SMS to +1234567890: New new_product — iPhone 16
```

---

## 2. Strategy Pattern

**Purpose**: Define a family of algorithms, encapsulate each one, and make them **interchangeable** at runtime.

**Analogy**: A GPS app that can calculate routes using "fastest," "shortest," or "scenic" strategies.

### Implementation

```cpp
#include <iostream>
#include <string>
#include <vector>

// Strategy interface
class PaymentStrategy {
public:
    virtual bool pay(double amount) = 0;
    virtual ~PaymentStrategy() = default;
};

// Concrete strategies
class CreditCardPayment : public PaymentStrategy {
    std::string cardNumber_;
public:
    CreditCardPayment(const std::string& card) : cardNumber_(card) { }

    bool pay(double amount) override {
        std::cout << "Paid $" << amount << " with card ending "
            << cardNumber_.substr(cardNumber_.size() - 4) << std::endl;
        return true;
    }
};

class PayPalPayment : public PaymentStrategy {
    std::string email_;
public:
    PayPalPayment(const std::string& email) : email_(email) { }

    bool pay(double amount) override {
        std::cout << "Paid $" << amount << " via PayPal (" << email_ << ")" << std::endl;
        return true;
    }
};

class CryptoPayment : public PaymentStrategy {
    std::string wallet_;
public:
    CryptoPayment(const std::string& wallet) : wallet_(wallet) { }

    bool pay(double amount) override {
        std::cout << "Paid $" << amount << " in crypto to " << wallet_ << std::endl;
        return true;
    }
};

// Context — uses a strategy
class ShoppingCart {
    std::vector<std::string> items_;
    double total_ = 0;

public:
    void addItem(const std::string& item, double price) {
        items_.push_back(item);
        total_ += price;
    }

    void checkout(PaymentStrategy& strategy) {
        std::cout << "Total: $" << total_ << std::endl;
        strategy.pay(total_);
    }
};

// Usage — swap payment strategies at runtime
ShoppingCart cart;
cart.addItem("Laptop", 999.99);
cart.addItem("Mouse", 29.99);

CreditCardPayment card("4111111111111234");
cart.checkout(card);
// or
PayPalPayment paypal("user@example.com");
cart.checkout(paypal);
// or
CryptoPayment crypto("0xABC123");
cart.checkout(crypto);
```

```csharp
using System;
using System.Collections.Generic;

// Strategy interface
interface IPaymentStrategy {
    bool Pay(double amount);
}

// Concrete strategies
class CreditCardPayment : IPaymentStrategy {
    private readonly string _cardNumber;
    public CreditCardPayment(string card) { _cardNumber = card; }

    public bool Pay(double amount) {
        Console.WriteLine($"Paid ${amount} with card ending {_cardNumber[^4..]}");
        return true;
    }
}

class PayPalPayment : IPaymentStrategy {
    private readonly string _email;
    public PayPalPayment(string email) { _email = email; }

    public bool Pay(double amount) {
        Console.WriteLine($"Paid ${amount} via PayPal ({_email})");
        return true;
    }
}

class CryptoPayment : IPaymentStrategy {
    private readonly string _wallet;
    public CryptoPayment(string wallet) { _wallet = wallet; }

    public bool Pay(double amount) {
        Console.WriteLine($"Paid ${amount} in crypto to {_wallet}");
        return true;
    }
}

// Context — uses a strategy
class ShoppingCart {
    private readonly List<string> _items = new();
    private double _total;

    public void AddItem(string item, double price) {
        _items.Add(item);
        _total += price;
    }

    public void Checkout(IPaymentStrategy strategy) {
        Console.WriteLine($"Total: ${_total}");
        strategy.Pay(_total);
    }
}

// Usage — swap payment strategies at runtime
var cart = new ShoppingCart();
cart.AddItem("Laptop", 999.99);
cart.AddItem("Mouse", 29.99);

cart.Checkout(new CreditCardPayment("4111111111111234"));
// or
cart.Checkout(new PayPalPayment("user@example.com"));
// or
cart.Checkout(new CryptoPayment("0xABC123"));
```

```java
import java.util.ArrayList;
import java.util.List;

// Strategy interface
interface PaymentStrategy {
    boolean pay(double amount);
}

// Concrete strategies
class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;

    CreditCardPayment(String card) { this.cardNumber = card; }

    @Override
    public boolean pay(double amount) {
        System.out.println("Paid $" + amount + " with card ending "
            + cardNumber.substring(cardNumber.length() - 4));
        return true;
    }
}

class PayPalPayment implements PaymentStrategy {
    private String email;

    PayPalPayment(String email) { this.email = email; }

    @Override
    public boolean pay(double amount) {
        System.out.println("Paid $" + amount + " via PayPal (" + email + ")");
        return true;
    }
}

class CryptoPayment implements PaymentStrategy {
    private String wallet;

    CryptoPayment(String wallet) { this.wallet = wallet; }

    @Override
    public boolean pay(double amount) {
        System.out.println("Paid $" + amount + " in crypto to " + wallet);
        return true;
    }
}

// Context — uses a strategy
class ShoppingCart {
    private List<String> items = new ArrayList<>();
    private double total = 0;

    void addItem(String item, double price) {
        items.add(item);
        total += price;
    }

    void checkout(PaymentStrategy strategy) {
        System.out.println("Total: $" + total);
        strategy.pay(total);
    }
}

// Usage — swap payment strategies at runtime
ShoppingCart cart = new ShoppingCart();
cart.addItem("Laptop", 999.99);
cart.addItem("Mouse", 29.99);

cart.checkout(new CreditCardPayment("4111111111111234"));
// or
cart.checkout(new PayPalPayment("user@example.com"));
// or
cart.checkout(new CryptoPayment("0xABC123"));
```

```python
# Strategy interface (duck typing)
class CreditCardPayment:
    def __init__(self, card_number):
        self.card_number = card_number

    def pay(self, amount):
        print(f"Paid ${amount} with card ending {self.card_number[-4:]}")
        return True

class PayPalPayment:
    def __init__(self, email):
        self.email = email

    def pay(self, amount):
        print(f"Paid ${amount} via PayPal ({self.email})")
        return True

class CryptoPayment:
    def __init__(self, wallet):
        self.wallet = wallet

    def pay(self, amount):
        print(f"Paid ${amount} in crypto to {self.wallet}")
        return True

# Context — uses a strategy
class ShoppingCart:
    def __init__(self):
        self.items = []
        self.total = 0

    def add_item(self, item, price):
        self.items.append(item)
        self.total += price

    def checkout(self, strategy):
        print(f"Total: ${self.total}")
        strategy.pay(self.total)

# Usage — swap payment strategies at runtime
cart = ShoppingCart()
cart.add_item("Laptop", 999.99)
cart.add_item("Mouse", 29.99)

cart.checkout(CreditCardPayment("4111111111111234"))
# or
cart.checkout(PayPalPayment("user@example.com"))
# or
cart.checkout(CryptoPayment("0xABC123"))
```

```javascript
// Concrete strategies
class CreditCardPayment {
  constructor(cardNumber) { this.cardNumber = cardNumber; }

  pay(amount) {
    console.log(`Paid $${amount} with card ending ${this.cardNumber.slice(-4)}`);
    return true;
  }
}

class PayPalPayment {
  constructor(email) { this.email = email; }

  pay(amount) {
    console.log(`Paid $${amount} via PayPal (${this.email})`);
    return true;
  }
}

class CryptoPayment {
  constructor(wallet) { this.wallet = wallet; }

  pay(amount) {
    console.log(`Paid $${amount} in crypto to ${this.wallet}`);
    return true;
  }
}

// Context — uses a strategy
class ShoppingCart {
  constructor() {
    this.items = [];
    this.total = 0;
  }

  addItem(item, price) {
    this.items.push(item);
    this.total += price;
  }

  checkout(strategy) {
    console.log(`Total: $${this.total}`);
    strategy.pay(this.total);
  }
}

// Usage — swap payment strategies at runtime
const cart = new ShoppingCart();
cart.addItem("Laptop", 999.99);
cart.addItem("Mouse", 29.99);

cart.checkout(new CreditCardPayment("4111111111111234"));
// or
cart.checkout(new PayPalPayment("user@example.com"));
// or
cart.checkout(new CryptoPayment("0xABC123"));
```

---

## 3. Command Pattern

**Purpose**: Encapsulate a request as an object, allowing you to parameterize operations, queue them, and support **undo/redo**.

**Analogy**: A restaurant order slip — it captures the request, can be queued, and can be cancelled.

### Implementation

```cpp
#include <iostream>
#include <string>
#include <vector>

// Command interface
class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual ~Command() = default;
};

// Receiver
class TextEditor {
    std::string text_;
public:
    void insert(const std::string& str) {
        text_ += str;
    }

    void deleteLast(int count) {
        if (count <= (int)text_.size()) {
            text_.erase(text_.size() - count);
        }
    }

    const std::string& getText() const { return text_; }
};

// Concrete commands
class InsertCommand : public Command {
    TextEditor& editor_;
    std::string text_;
public:
    InsertCommand(TextEditor& editor, const std::string& text)
        : editor_(editor), text_(text) { }

    void execute() override { editor_.insert(text_); }
    void undo() override { editor_.deleteLast(text_.size()); }
};

// Command history for undo
class CommandHistory {
    std::vector<Command*> history_;
public:
    void execute(Command* cmd) {
        cmd->execute();
        history_.push_back(cmd);
    }

    void undo() {
        if (!history_.empty()) {
            Command* last = history_.back();
            history_.pop_back();
            last->undo();
        }
    }
};

// Usage
TextEditor editor;
CommandHistory history;

InsertCommand cmd1(editor, "Hello");
InsertCommand cmd2(editor, " World");

history.execute(&cmd1);
history.execute(&cmd2);
std::cout << editor.getText() << std::endl;  // Hello World

history.undo();
std::cout << editor.getText() << std::endl;  // Hello

history.undo();
std::cout << editor.getText() << std::endl;  // (empty)
```

```csharp
using System;
using System.Collections.Generic;

// Command interface
interface ICommand {
    void Execute();
    void Undo();
}

// Receiver
class TextEditor {
    private string _text = "";

    public void Insert(string str) => _text += str;
    public void DeleteLast(int count) =>
        _text = _text[..Math.Max(0, _text.Length - count)];
    public string GetText() => _text;
}

// Concrete commands
class InsertCommand : ICommand {
    private readonly TextEditor _editor;
    private readonly string _text;

    public InsertCommand(TextEditor editor, string text) {
        _editor = editor;
        _text = text;
    }

    public void Execute() => _editor.Insert(_text);
    public void Undo() => _editor.DeleteLast(_text.Length);
}

// Command history for undo
class CommandHistory {
    private readonly Stack<ICommand> _history = new();

    public void Execute(ICommand cmd) {
        cmd.Execute();
        _history.Push(cmd);
    }

    public void Undo() {
        if (_history.Count > 0)
            _history.Pop().Undo();
    }
}

// Usage
var editor = new TextEditor();
var history = new CommandHistory();

history.Execute(new InsertCommand(editor, "Hello"));
history.Execute(new InsertCommand(editor, " World"));
Console.WriteLine(editor.GetText());  // Hello World

history.Undo();
Console.WriteLine(editor.GetText());  // Hello

history.Undo();
Console.WriteLine(editor.GetText());  // (empty)
```

```java
import java.util.ArrayList;
import java.util.List;

// Command interface
interface Command {
    void execute();
    void undo();
}

// Receiver
class TextEditor {
    private StringBuilder text = new StringBuilder();

    void insert(String str) {
        text.append(str);
    }

    void delete(int count) {
        int start = Math.max(0, text.length() - count);
        text.delete(start, text.length());
    }

    String getText() {
        return text.toString();
    }
}

// Concrete commands
class InsertCommand implements Command {
    private TextEditor editor;
    private String text;

    InsertCommand(TextEditor editor, String text) {
        this.editor = editor;
        this.text = text;
    }

    @Override
    public void execute() {
        editor.insert(text);
    }

    @Override
    public void undo() {
        editor.delete(text.length());
    }
}

// Command history for undo
class CommandHistory {
    private List<Command> history = new ArrayList<>();

    void execute(Command cmd) {
        cmd.execute();
        history.add(cmd);
    }

    void undo() {
        if (!history.isEmpty()) {
            Command last = history.remove(history.size() - 1);
            last.undo();
        }
    }
}

// Usage
TextEditor editor = new TextEditor();
CommandHistory history = new CommandHistory();

history.execute(new InsertCommand(editor, "Hello"));
history.execute(new InsertCommand(editor, " World"));
System.out.println(editor.getText());  // Hello World

history.undo();
System.out.println(editor.getText());  // Hello

history.undo();
System.out.println(editor.getText());  // (empty)
```

```python
# Command interface (duck typing)

# Receiver
class TextEditor:
    def __init__(self):
        self.text = ""

    def insert(self, string):
        self.text += string

    def delete_last(self, count):
        self.text = self.text[:-count] if count else self.text

    def get_text(self):
        return self.text

# Concrete commands
class InsertCommand:
    def __init__(self, editor, text):
        self.editor = editor
        self.text = text

    def execute(self):
        self.editor.insert(self.text)

    def undo(self):
        self.editor.delete_last(len(self.text))

# Command history for undo
class CommandHistory:
    def __init__(self):
        self.history = []

    def execute(self, cmd):
        cmd.execute()
        self.history.append(cmd)

    def undo(self):
        if self.history:
            last = self.history.pop()
            last.undo()

# Usage
editor = TextEditor()
history = CommandHistory()

history.execute(InsertCommand(editor, "Hello"))
history.execute(InsertCommand(editor, " World"))
print(editor.get_text())  # Hello World

history.undo()
print(editor.get_text())  # Hello

history.undo()
print(editor.get_text())  # (empty)
```

```javascript
// Receiver
class TextEditor {
  constructor() {
    this.text = "";
  }

  insert(str) {
    this.text += str;
  }

  deleteLast(count) {
    this.text = this.text.slice(0, -count || undefined);
  }

  getText() {
    return this.text;
  }
}

// Concrete commands
class InsertCommand {
  constructor(editor, text) {
    this.editor = editor;
    this.text = text;
  }

  execute() { this.editor.insert(this.text); }
  undo() { this.editor.deleteLast(this.text.length); }
}

// Command history for undo
class CommandHistory {
  constructor() {
    this.history = [];
  }

  execute(cmd) {
    cmd.execute();
    this.history.push(cmd);
  }

  undo() {
    if (this.history.length > 0) {
      const last = this.history.pop();
      last.undo();
    }
  }
}

// Usage
const editor = new TextEditor();
const history = new CommandHistory();

history.execute(new InsertCommand(editor, "Hello"));
history.execute(new InsertCommand(editor, " World"));
console.log(editor.getText());  // Hello World

history.undo();
console.log(editor.getText());  // Hello

history.undo();
console.log(editor.getText());  // (empty)
```

---

## Pattern Comparison

| Pattern | Problem | Mechanism |
|---------|---------|-----------|
| **Observer** | "Something changed — who needs to know?" | Subject notifies subscribers |
| **Strategy** | "Which algorithm should I use?" | Swap implementations via interface |
| **Command** | "Encapsulate actions for undo/queue" | Wrap actions in objects |

---

## Key Takeaways

- **Observer**: one-to-many notification — subject notifies all subscribers on state change
- **Strategy**: swap algorithms at runtime — encapsulate each behind an interface
- **Command**: encapsulate actions as objects — enables undo, redo, and queuing
- All three patterns use **interfaces** and **composition** for flexibility
- These are among the most commonly used design patterns in production code

Next: **Mixins and Traits** — reusable behaviour without inheritance.
