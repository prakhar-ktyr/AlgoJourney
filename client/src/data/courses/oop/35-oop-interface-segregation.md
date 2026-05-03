---
title: Interface Segregation Principle
---

# Interface Segregation Principle (ISP)

> "Clients should not be forced to depend on methods they do not use."
> — Robert C. Martin

The **Interface Segregation Principle** says: keep your interfaces **small** and **focused**. Don't create one big interface that forces implementors to provide methods they don't need.

---

## The Problem: Fat Interfaces

```cpp
// ❌ BAD — One giant interface
#include <iostream>
#include <stdexcept>

class Worker {
public:
    virtual void work() = 0;
    virtual void eat() = 0;
    virtual void sleep() = 0;
    virtual void attendMeeting() = 0;
    virtual void writeReport() = 0;
    virtual ~Worker() = default;
};

class HumanWorker : public Worker {
public:
    void work() override { std::cout << "Working" << std::endl; }
    void eat() override { std::cout << "Eating lunch" << std::endl; }
    void sleep() override { std::cout << "Sleeping" << std::endl; }
    void attendMeeting() override { std::cout << "In meeting" << std::endl; }
    void writeReport() override { std::cout << "Writing report" << std::endl; }
};

class Robot : public Worker {
public:
    void work() override { std::cout << "Working 24/7" << std::endl; }

    void eat() override {
        // ❌ Robots don't eat! Forced to provide exception
        throw std::runtime_error("Robots don't eat");
    }

    void sleep() override {
        throw std::runtime_error("Robots don't sleep");
    }

    void attendMeeting() override {
        throw std::runtime_error("Robots don't attend meetings");
    }

    void writeReport() override { std::cout << "Generating report" << std::endl; }
};
```

```csharp
// ❌ BAD — One giant interface
interface IWorker {
    void Work();
    void Eat();
    void Sleep();
    void AttendMeeting();
    void WriteReport();
}

class HumanWorker : IWorker {
    public void Work() => Console.WriteLine("Working");
    public void Eat() => Console.WriteLine("Eating lunch");
    public void Sleep() => Console.WriteLine("Sleeping");
    public void AttendMeeting() => Console.WriteLine("In meeting");
    public void WriteReport() => Console.WriteLine("Writing report");
}

class Robot : IWorker {
    public void Work() => Console.WriteLine("Working 24/7");

    public void Eat() {
        // ❌ Robots don't eat! Forced to provide exception
        throw new NotSupportedException("Robots don't eat");
    }

    public void Sleep() => throw new NotSupportedException("Robots don't sleep");
    public void AttendMeeting() => throw new NotSupportedException("Robots don't attend meetings");
    public void WriteReport() => Console.WriteLine("Generating report");
}
```

```java
// ❌ BAD — One giant interface
interface Worker {
    void work();
    void eat();
    void sleep();
    void attendMeeting();
    void writeReport();
}

class HumanWorker implements Worker {
    @Override public void work() { System.out.println("Working"); }
    @Override public void eat() { System.out.println("Eating lunch"); }
    @Override public void sleep() { System.out.println("Sleeping"); }
    @Override public void attendMeeting() { System.out.println("In meeting"); }
    @Override public void writeReport() { System.out.println("Writing report"); }
}

class Robot implements Worker {
    @Override public void work() { System.out.println("Working 24/7"); }

    @Override public void eat() {
        // ❌ Robots don't eat! Forced to provide empty/exception method
        throw new UnsupportedOperationException("Robots don't eat");
    }

    @Override public void sleep() {
        throw new UnsupportedOperationException("Robots don't sleep");
    }

    @Override public void attendMeeting() {
        throw new UnsupportedOperationException();
    }

    @Override public void writeReport() {
        System.out.println("Generating report");
    }
}
```

```python
# ❌ BAD — One giant interface
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self): pass
    @abstractmethod
    def eat(self): pass
    @abstractmethod
    def sleep(self): pass
    @abstractmethod
    def attend_meeting(self): pass
    @abstractmethod
    def write_report(self): pass

class HumanWorker(Worker):
    def work(self): print("Working")
    def eat(self): print("Eating lunch")
    def sleep(self): print("Sleeping")
    def attend_meeting(self): print("In meeting")
    def write_report(self): print("Writing report")

class Robot(Worker):
    def work(self): print("Working 24/7")

    def eat(self):
        # ❌ Robots don't eat! Forced to provide exception
        raise NotImplementedError("Robots don't eat")

    def sleep(self):
        raise NotImplementedError("Robots don't sleep")

    def attend_meeting(self):
        raise NotImplementedError("Robots don't attend meetings")

    def write_report(self): print("Generating report")
```

```javascript
// ❌ BAD — One giant interface
class Worker {
  work() { throw new Error("Not implemented"); }
  eat() { throw new Error("Not implemented"); }
  sleep() { throw new Error("Not implemented"); }
  attendMeeting() { throw new Error("Not implemented"); }
  writeReport() { throw new Error("Not implemented"); }
}

class HumanWorker extends Worker {
  work() { console.log("Working"); }
  eat() { console.log("Eating lunch"); }
  sleep() { console.log("Sleeping"); }
  attendMeeting() { console.log("In meeting"); }
  writeReport() { console.log("Writing report"); }
}

class Robot extends Worker {
  work() { console.log("Working 24/7"); }

  eat() {
    // ❌ Robots don't eat! Forced to provide exception
    throw new Error("Robots don't eat");
  }

  sleep() { throw new Error("Robots don't sleep"); }
  attendMeeting() { throw new Error("Robots don't attend meetings"); }
  writeReport() { console.log("Generating report"); }
}
```

`Robot` is forced to implement `eat()`, `sleep()`, and `attendMeeting()` even though they don't apply.

---

## ISP-Compliant Version

Split the fat interface into smaller, focused ones:

```cpp
// ✅ GOOD — Small, focused interfaces
#include <iostream>

class Workable {
public:
    virtual void work() = 0;
    virtual ~Workable() = default;
};

class Feedable {
public:
    virtual void eat() = 0;
    virtual ~Feedable() = default;
};

class Sleepable {
public:
    virtual void sleep() = 0;
    virtual ~Sleepable() = default;
};

class Meetable {
public:
    virtual void attendMeeting() = 0;
    virtual ~Meetable() = default;
};

class Reportable {
public:
    virtual void writeReport() = 0;
    virtual ~Reportable() = default;
};

class HumanWorker : public Workable, public Feedable, public Sleepable,
                    public Meetable, public Reportable {
public:
    void work() override { std::cout << "Working" << std::endl; }
    void eat() override { std::cout << "Eating lunch" << std::endl; }
    void sleep() override { std::cout << "Sleeping" << std::endl; }
    void attendMeeting() override { std::cout << "In meeting" << std::endl; }
    void writeReport() override { std::cout << "Writing report" << std::endl; }
};

class Robot : public Workable, public Reportable {
public:
    void work() override { std::cout << "Working 24/7" << std::endl; }
    void writeReport() override { std::cout << "Generating report" << std::endl; }
    // No eat(), sleep(), or attendMeeting() — Robot doesn't implement those!
};
```

```csharp
// ✅ GOOD — Small, focused interfaces
interface IWorkable { void Work(); }
interface IFeedable { void Eat(); }
interface ISleepable { void Sleep(); }
interface IMeetable { void AttendMeeting(); }
interface IReportable { void WriteReport(); }

class HumanWorker : IWorkable, IFeedable, ISleepable, IMeetable, IReportable {
    public void Work() => Console.WriteLine("Working");
    public void Eat() => Console.WriteLine("Eating lunch");
    public void Sleep() => Console.WriteLine("Sleeping");
    public void AttendMeeting() => Console.WriteLine("In meeting");
    public void WriteReport() => Console.WriteLine("Writing report");
}

class Robot : IWorkable, IReportable {
    public void Work() => Console.WriteLine("Working 24/7");
    public void WriteReport() => Console.WriteLine("Generating report");
    // No Eat(), Sleep(), or AttendMeeting() — Robot doesn't implement those!
}
```

```java
// ✅ GOOD — Small, focused interfaces
interface Workable {
    void work();
}

interface Feedable {
    void eat();
}

interface Sleepable {
    void sleep();
}

interface Meetable {
    void attendMeeting();
}

interface Reportable {
    void writeReport();
}

class HumanWorker implements Workable, Feedable, Sleepable,
                              Meetable, Reportable {
    @Override public void work() { System.out.println("Working"); }
    @Override public void eat() { System.out.println("Eating lunch"); }
    @Override public void sleep() { System.out.println("Sleeping"); }
    @Override public void attendMeeting() { System.out.println("In meeting"); }
    @Override public void writeReport() { System.out.println("Writing report"); }
}

class Robot implements Workable, Reportable {
    @Override public void work() { System.out.println("Working 24/7"); }
    @Override public void writeReport() { System.out.println("Generating report"); }
    // No eat(), sleep(), or attendMeeting() — Robot doesn't implement those!
}
```

```python
# ✅ GOOD — Small, focused interfaces
from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self): pass

class Feedable(ABC):
    @abstractmethod
    def eat(self): pass

class Sleepable(ABC):
    @abstractmethod
    def sleep(self): pass

class Meetable(ABC):
    @abstractmethod
    def attend_meeting(self): pass

class Reportable(ABC):
    @abstractmethod
    def write_report(self): pass

class HumanWorker(Workable, Feedable, Sleepable, Meetable, Reportable):
    def work(self): print("Working")
    def eat(self): print("Eating lunch")
    def sleep(self): print("Sleeping")
    def attend_meeting(self): print("In meeting")
    def write_report(self): print("Writing report")

class Robot(Workable, Reportable):
    def work(self): print("Working 24/7")
    def write_report(self): print("Generating report")
    # No eat(), sleep(), or attend_meeting() — Robot doesn't implement those!
```

```javascript
// ✅ GOOD — Small, focused "interfaces" via composition

class HumanWorker {
  work() { console.log("Working"); }
  eat() { console.log("Eating lunch"); }
  sleep() { console.log("Sleeping"); }
  attendMeeting() { console.log("In meeting"); }
  writeReport() { console.log("Writing report"); }
}

class Robot {
  work() { console.log("Working 24/7"); }
  writeReport() { console.log("Generating report"); }
  // No eat(), sleep(), or attendMeeting() — Robot doesn't implement those!
}

// Functions accept only what they need (duck typing = natural ISP)
function doWork(worker) { worker.work(); }
function feedWorker(feedable) { feedable.eat(); }
```

Now `Robot` only implements what it actually does.

---

## Another Example — Printer

### Before ISP

```cpp
// ❌ BAD — Not all printers can do everything
class MultiFunctionDevice {
public:
    virtual void print(const std::string& doc) = 0;
    virtual void scan(const std::string& doc) = 0;
    virtual void fax(const std::string& doc) = 0;
    virtual void staple(const std::string& doc) = 0;
    virtual ~MultiFunctionDevice() = default;
};

class BasicPrinter : public MultiFunctionDevice {
public:
    void print(const std::string& doc) override { /* prints */ }

    void scan(const std::string& doc) override {
        throw std::runtime_error("Can't scan");
    }

    void fax(const std::string& doc) override {
        throw std::runtime_error("Can't fax");
    }

    void staple(const std::string& doc) override {
        throw std::runtime_error("Can't staple");
    }
};
```

```csharp
// ❌ BAD — Not all printers can do everything
interface IMultiFunctionDevice {
    void Print(string doc);
    void Scan(string doc);
    void Fax(string doc);
    void Staple(string doc);
}

class BasicPrinter : IMultiFunctionDevice {
    public void Print(string doc) { /* prints */ }

    public void Scan(string doc) =>
        throw new NotSupportedException("Can't scan");

    public void Fax(string doc) =>
        throw new NotSupportedException("Can't fax");

    public void Staple(string doc) =>
        throw new NotSupportedException("Can't staple");
}
```

```java
// ❌ BAD — Not all printers can do everything
interface MultiFunctionDevice {
    void print(Document d);
    void scan(Document d);
    void fax(Document d);
    void staple(Document d);
}

class BasicPrinter implements MultiFunctionDevice {
    @Override public void print(Document d) { /* prints */ }

    @Override public void scan(Document d) {
        throw new UnsupportedOperationException("Can't scan");
    }

    @Override public void fax(Document d) {
        throw new UnsupportedOperationException("Can't fax");
    }

    @Override public void staple(Document d) {
        throw new UnsupportedOperationException("Can't staple");
    }
}
```

```python
# ❌ BAD — Not all printers can do everything
from abc import ABC, abstractmethod

class MultiFunctionDevice(ABC):
    @abstractmethod
    def print_doc(self, doc): pass
    @abstractmethod
    def scan(self, doc): pass
    @abstractmethod
    def fax(self, doc): pass
    @abstractmethod
    def staple(self, doc): pass

class BasicPrinter(MultiFunctionDevice):
    def print_doc(self, doc): pass  # prints

    def scan(self, doc):
        raise NotImplementedError("Can't scan")

    def fax(self, doc):
        raise NotImplementedError("Can't fax")

    def staple(self, doc):
        raise NotImplementedError("Can't staple")
```

```javascript
// ❌ BAD — Not all printers can do everything
class MultiFunctionDevice {
  print(doc) { throw new Error("Not implemented"); }
  scan(doc) { throw new Error("Not implemented"); }
  fax(doc) { throw new Error("Not implemented"); }
  staple(doc) { throw new Error("Not implemented"); }
}

class BasicPrinter extends MultiFunctionDevice {
  print(doc) { /* prints */ }

  scan(doc) { throw new Error("Can't scan"); }
  fax(doc) { throw new Error("Can't fax"); }
  staple(doc) { throw new Error("Can't staple"); }
}
```

### After ISP

```cpp
// ✅ GOOD — Segregated interfaces
#include <iostream>
#include <string>

class Printer {
public:
    virtual void print(const std::string& doc) = 0;
    virtual ~Printer() = default;
};

class Scanner {
public:
    virtual void scan(const std::string& doc) = 0;
    virtual ~Scanner() = default;
};

class FaxMachine {
public:
    virtual void fax(const std::string& doc) = 0;
    virtual ~FaxMachine() = default;
};

class Stapler {
public:
    virtual void staple(const std::string& doc) = 0;
    virtual ~Stapler() = default;
};

class BasicPrinter : public Printer {
public:
    void print(const std::string& doc) override {
        std::cout << "Printing..." << std::endl;
    }
};

class AllInOnePrinter : public Printer, public Scanner,
                        public FaxMachine, public Stapler {
public:
    void print(const std::string& doc) override { /* ... */ }
    void scan(const std::string& doc) override { /* ... */ }
    void fax(const std::string& doc) override { /* ... */ }
    void staple(const std::string& doc) override { /* ... */ }
};
```

```csharp
// ✅ GOOD — Segregated interfaces
interface IPrinter { void Print(string doc); }
interface IScanner { void Scan(string doc); }
interface IFaxMachine { void Fax(string doc); }
interface IStapler { void Staple(string doc); }

class BasicPrinter : IPrinter {
    public void Print(string doc) {
        Console.WriteLine("Printing...");
    }
}

class AllInOnePrinter : IPrinter, IScanner, IFaxMachine, IStapler {
    public void Print(string doc) { /* ... */ }
    public void Scan(string doc) { /* ... */ }
    public void Fax(string doc) { /* ... */ }
    public void Staple(string doc) { /* ... */ }
}
```

```java
// ✅ GOOD — Segregated interfaces
interface Printer {
    void print(Document d);
}

interface Scanner {
    void scan(Document d);
}

interface FaxMachine {
    void fax(Document d);
}

interface Stapler {
    void staple(Document d);
}

class BasicPrinter implements Printer {
    @Override
    public void print(Document d) {
        System.out.println("Printing...");
    }
}

class AllInOnePrinter implements Printer, Scanner, FaxMachine, Stapler {
    @Override public void print(Document d) { /* ... */ }
    @Override public void scan(Document d) { /* ... */ }
    @Override public void fax(Document d) { /* ... */ }
    @Override public void staple(Document d) { /* ... */ }
}
```

```python
# ✅ GOOD — Segregated interfaces
from abc import ABC, abstractmethod

class Printer(ABC):
    @abstractmethod
    def print_doc(self, doc): pass

class Scanner(ABC):
    @abstractmethod
    def scan(self, doc): pass

class FaxMachine(ABC):
    @abstractmethod
    def fax(self, doc): pass

class Stapler(ABC):
    @abstractmethod
    def staple(self, doc): pass

class BasicPrinter(Printer):
    def print_doc(self, doc):
        print("Printing...")

class AllInOnePrinter(Printer, Scanner, FaxMachine, Stapler):
    def print_doc(self, doc): pass
    def scan(self, doc): pass
    def fax(self, doc): pass
    def staple(self, doc): pass
```

```javascript
// ✅ GOOD — Segregated interfaces (duck typing)

class BasicPrinter {
  print(doc) {
    console.log("Printing...");
  }
}

class AllInOnePrinter {
  print(doc) { /* ... */ }
  scan(doc) { /* ... */ }
  fax(doc) { /* ... */ }
  staple(doc) { /* ... */ }
}

// Functions accept only what they need
function printDocument(printer, doc) { printer.print(doc); }
function scanDocument(scanner, doc) { scanner.scan(doc); }
```

---

## Animal Example

```cpp
// ❌ BAD — Fat interface
class Animal {
public:
    virtual void walk() = 0;
    virtual void swim() = 0;
    virtual void fly() = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void walk() override { std::cout << "Walking" << std::endl; }
    void swim() override { std::cout << "Swimming" << std::endl; }
    void fly() override {
        throw std::runtime_error("Dogs can't fly!");  // Forced!
    }
};

// ✅ GOOD — Segregated
class Walkable {
public:
    virtual void walk() = 0;
    virtual ~Walkable() = default;
};

class Swimmable {
public:
    virtual void swim() = 0;
    virtual ~Swimmable() = default;
};

class Flyable {
public:
    virtual void fly() = 0;
    virtual ~Flyable() = default;
};

class Dog : public Walkable, public Swimmable {
public:
    void walk() override { std::cout << "Walking" << std::endl; }
    void swim() override { std::cout << "Swimming" << std::endl; }
    // No fly() needed!
};

class Eagle : public Walkable, public Flyable {
public:
    void walk() override { std::cout << "Walking" << std::endl; }
    void fly() override { std::cout << "Flying" << std::endl; }
};

class Duck : public Walkable, public Swimmable, public Flyable {
public:
    void walk() override { std::cout << "Walking" << std::endl; }
    void swim() override { std::cout << "Swimming" << std::endl; }
    void fly() override { std::cout << "Flying" << std::endl; }
};
```

```csharp
// ❌ BAD — Fat interface
interface IAnimal {
    void Walk();
    void Swim();
    void Fly();
}

class Dog : IAnimal {
    public void Walk() => Console.WriteLine("Walking");
    public void Swim() => Console.WriteLine("Swimming");
    public void Fly() =>
        throw new NotSupportedException("Dogs can't fly!");  // Forced!
}

// ✅ GOOD — Segregated
interface IWalkable { void Walk(); }
interface ISwimmable { void Swim(); }
interface IFlyable { void Fly(); }

class Dog : IWalkable, ISwimmable {
    public void Walk() => Console.WriteLine("Walking");
    public void Swim() => Console.WriteLine("Swimming");
    // No Fly() needed!
}

class Eagle : IWalkable, IFlyable {
    public void Walk() => Console.WriteLine("Walking");
    public void Fly() => Console.WriteLine("Flying");
}

class Duck : IWalkable, ISwimmable, IFlyable {
    public void Walk() => Console.WriteLine("Walking");
    public void Swim() => Console.WriteLine("Swimming");
    public void Fly() => Console.WriteLine("Flying");
}
```

```java
// ❌ BAD — Fat interface
interface Animal {
    void walk();
    void swim();
    void fly();
}

class Dog implements Animal {
    @Override public void walk() { System.out.println("Walking"); }
    @Override public void swim() { System.out.println("Swimming"); }
    @Override public void fly() {
        throw new UnsupportedOperationException("Dogs can't fly!");  // Forced!
    }
}

// ✅ GOOD — Segregated
interface Walkable { void walk(); }
interface Swimmable { void swim(); }
interface Flyable { void fly(); }

class Dog implements Walkable, Swimmable {
    @Override public void walk() { System.out.println("Walking"); }
    @Override public void swim() { System.out.println("Swimming"); }
    // No fly() needed!
}

class Eagle implements Walkable, Flyable {
    @Override public void walk() { System.out.println("Walking"); }
    @Override public void fly() { System.out.println("Flying"); }
}

class Duck implements Walkable, Swimmable, Flyable {
    @Override public void walk() { System.out.println("Walking"); }
    @Override public void swim() { System.out.println("Swimming"); }
    @Override public void fly() { System.out.println("Flying"); }
}
```

```python
from abc import ABC, abstractmethod

# ❌ BAD — Fat interface
class Animal(ABC):
    @abstractmethod
    def walk(self): pass
    @abstractmethod
    def swim(self): pass
    @abstractmethod
    def fly(self): pass

class Dog(Animal):
    def walk(self): print("Walking")
    def swim(self): print("Swimming")
    def fly(self):
        raise NotImplementedError("Dogs can't fly!")  # Forced!

# ✅ GOOD — Segregated
class Walkable(ABC):
    @abstractmethod
    def walk(self): pass

class Swimmable(ABC):
    @abstractmethod
    def swim(self): pass

class Flyable(ABC):
    @abstractmethod
    def fly(self): pass

class Dog(Walkable, Swimmable):
    def walk(self): print("Walking")
    def swim(self): print("Swimming")
    # No fly() needed!

class Eagle(Walkable, Flyable):
    def walk(self): print("Walking")
    def fly(self): print("Flying")

class Duck(Walkable, Swimmable, Flyable):
    def walk(self): print("Walking")
    def swim(self): print("Swimming")
    def fly(self): print("Flying")
```

```javascript
// ❌ BAD — Fat interface
class Animal {
  walk() { throw new Error("Not implemented"); }
  swim() { throw new Error("Not implemented"); }
  fly() { throw new Error("Not implemented"); }
}

class Dog extends Animal {
  walk() { console.log("Walking"); }
  swim() { console.log("Swimming"); }
  fly() { throw new Error("Dogs can't fly!"); }  // Forced!
}

// ✅ GOOD — Segregated (use composition / duck typing)
class Dog {
  walk() { console.log("Walking"); }
  swim() { console.log("Swimming"); }
  // No fly() needed!
}

class Eagle {
  walk() { console.log("Walking"); }
  fly() { console.log("Flying"); }
}

class Duck {
  walk() { console.log("Walking"); }
  swim() { console.log("Swimming"); }
  fly() { console.log("Flying"); }
}
```

---

## Signs of ISP Violations

| Sign | Meaning |
|------|---------|
| Methods that throw `UnsupportedOperationException` | Class is forced to implement irrelevant methods |
| Empty method implementations | Interface is too broad |
| Many methods in one interface | Could likely be split |
| Clients using only a few methods of an interface | Interface serves multiple audiences |

---

## Benefits of ISP

| Benefit | Explanation |
|---------|-------------|
| **No forced implementations** | Classes only implement what they need |
| **Easier to understand** | Small interfaces are clearer |
| **More flexible** | Mix and match interfaces |
| **Easier to test** | Mock only the methods you care about |
| **Better decoupling** | Clients depend only on what they use |

---

## Key Takeaways

- ISP: don't force classes to implement **methods they don't need**
- Split **fat interfaces** into **small, focused** ones
- Classes can implement **multiple** small interfaces
- Signs of violation: `UnsupportedOperationException`, empty implementations
- ISP leads to more **flexible** and **maintainable** code

Next: **Dependency Inversion Principle** — depend on abstractions, not concretions.
