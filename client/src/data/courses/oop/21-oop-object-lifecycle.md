---
title: Object Lifecycle
---

# Object Lifecycle

Every object goes through a lifecycle: **creation**, **usage**, and **destruction**. Understanding this lifecycle helps you manage resources and avoid memory-related bugs.

---

## The Three Phases

```
  Creation          Usage            Destruction
  ─────────────  ─────────────────  ──────────────
  new Dog()   →  dog.bark()     →  (garbage collected)
  Constructor     Methods run       Memory freed
  Memory          State changes
  allocated
```

---

## Phase 1: Object Creation

When you create an object:

1. **Memory is allocated** on the heap
2. **Fields are initialized** to defaults (0, null, false)
3. **Constructor runs** to set initial state

```cpp
#include <iostream>
#include <string>

class Dog {
public:
    std::string name;
    int age;

    Dog(std::string name, int age) : name(name), age(age) {
        std::cout << "Dog created: " << name << std::endl;
    }
};

int main() {
    Dog rex("Rex", 3);  // Stack allocation
    Dog* bella = new Dog("Bella", 2);  // Heap allocation
    delete bella;
}
```

```csharp
using System;

class Dog {
    public string Name;
    public int Age;

    public Dog(string name, int age) {
        Name = name;
        Age = age;
    }
}

Dog rex = new Dog("Rex", 3);  // Heap allocation (always in C#)
```

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

Dog rex = new Dog("Rex", 3);
```

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

rex = Dog("Rex", 3)
```

```javascript
class Dog {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

const rex = new Dog("Rex", 3);
```

Behind the scenes:
1. Memory is allocated for a `Dog` object on the heap
2. `name` is set to default, `age` to `0`
3. Constructor runs: `name = "Rex"`, `age = 3`
4. A reference on the stack points to the object

```
Stack:                  Heap:
┌─────────────┐        ┌──────────────────┐
│ rex  ────────┼──────→ │ Dog object       │
└─────────────┘        │ name: "Rex"      │
                       │ age: 3           │
                       └──────────────────┘
```

---

## Phase 2: Object Usage

During usage, you:
- Read and modify attributes
- Call methods
- Pass the object to other methods
- Store references in collections

```cpp
rex.bark();              // Call method
rex.age = 4;             // Modify attribute
kennel.addDog(rex);      // Pass to another object
dogs.push_back(rex);     // Store in collection
```

```csharp
rex.Bark();           // Call method
rex.Age = 4;          // Modify attribute
kennel.AddDog(rex);   // Pass to another object
dogs.Add(rex);        // Store in collection
```

```java
rex.bark();           // Call method
rex.age = 4;          // Modify attribute
kennel.addDog(rex);   // Pass to another object
dogs.add(rex);        // Store in collection
```

```python
rex.bark()            # Call method
rex.age = 4           # Modify attribute
kennel.add_dog(rex)   # Pass to another object
dogs.append(rex)      # Store in collection
```

```javascript
rex.bark();           // Call method
rex.age = 4;          // Modify attribute
kennel.addDog(rex);   // Pass to another object
dogs.push(rex);       // Store in collection
```

### Multiple References

Multiple variables can reference the **same object**:

```cpp
#include <iostream>
#include <memory>

auto rex = std::make_shared<Dog>("Rex", 3);
auto myDog = rex;         // Both point to the same object!

myDog->age = 5;
std::cout << rex->age << std::endl;  // 5 (same object)
```

```csharp
Dog rex = new Dog("Rex", 3);
Dog myDog = rex;         // Both point to the same object!

myDog.Age = 5;
Console.WriteLine(rex.Age);  // 5 (same object)
```

```java
Dog rex = new Dog("Rex", 3);
Dog myDog = rex;         // Both point to the same object!

myDog.age = 5;
System.out.println(rex.age);  // 5 (same object)
```

```python
rex = Dog("Rex", 3)
my_dog = rex          # Both point to the same object!

my_dog.age = 5
print(rex.age)        # 5 (same object)
```

```javascript
const rex = new Dog("Rex", 3);
const myDog = rex;    // Both point to the same object!

myDog.age = 5;
console.log(rex.age); // 5 (same object)
```

```
Stack:                  Heap:
┌─────────────┐        ┌──────────────────┐
│ rex  ────────┼──────→ │ Dog object       │
├─────────────┤    ┌──→ │ name: "Rex"      │
│ myDog ───────┼────┘   │ age: 5           │
└─────────────┘        └──────────────────┘
```

---

## Phase 3: Object Destruction

When no references point to an object, it becomes eligible for **garbage collection** (GC). The GC automatically frees the memory.

```cpp
#include <iostream>
#include <memory>

// C++ uses RAII — deterministic destruction
{
    Dog rex("Rex", 3);  // Created on stack
}  // rex destroyed here (scope ends, destructor called)

// Heap: manual or smart pointer
auto rex = std::make_unique<Dog>("Rex", 3);
rex.reset();  // Explicitly destroy, or auto-destroyed when out of scope
```

```csharp
Dog rex = new Dog("Rex", 3);
rex = null;  // No more references → eligible for GC

// Or:
Dog rex2 = new Dog("Rex", 3);
rex2 = new Dog("Bella", 2);  // Old object (Rex) has no references → GC
```

```java
Dog rex = new Dog("Rex", 3);
rex = null;  // No more references → eligible for GC

// Or:
Dog rex2 = new Dog("Rex", 3);
rex2 = new Dog("Bella", 2);  // Old object (Rex) has no references → GC
```

```python
import sys

rex = Dog("Rex", 3)
print(sys.getrefcount(rex))  # 2 (rex + getrefcount's own reference)

del rex  # Reference count drops to 0 → immediately freed
```

```javascript
let rex = new Dog("Rex", 3);
rex = null;  // No more references → eligible for GC

// Or:
let rex2 = new Dog("Rex", 3);
rex2 = new Dog("Bella", 2);  // Old object has no references → GC
```

### C++ Deterministic Destruction (RAII)

C++ has **deterministic** destruction. Objects are destroyed when they go out of scope (stack) or when `delete` is called (heap). Smart pointers automate heap management.

### Java Garbage Collection

- **Automatic** — you don't free memory manually
- **Non-deterministic** — you can't predict exactly when GC runs
- `System.gc()` is a **suggestion**, not a command
- `finalize()` method (deprecated) was called before GC — don't use it

### Reference Counting (Python)

Python uses **reference counting** plus a **cycle detector**:

```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # 2 (a + getrefcount's own reference)

b = a            # refcount = 3
del b            # refcount = 2
del a            # refcount drops to 0 → immediately freed
```

### JavaScript Garbage Collection (JavaScript)

- Uses **mark-and-sweep** algorithm
- **Automatic** — no manual memory management
- Objects unreachable from the root are collected

---

## The Destructor / Finalizer

A method called when an object is about to be destroyed:

```cpp
#include <iostream>
#include <string>

class Resource {
public:
    std::string name;

    Resource(std::string name) : name(name) {
        std::cout << name << " created" << std::endl;
    }

    ~Resource() {  // Destructor — deterministic, always called
        std::cout << name << " destroyed" << std::endl;
    }
};

{
    Resource r("FileHandler");  // FileHandler created
}  // FileHandler destroyed (immediately when scope ends)
```

```csharp
using System;

class Resource {
    public string Name;

    public Resource(string name) {
        Name = name;
        Console.WriteLine($"{name} created");
    }

    // Finalizer (destructor syntax) — non-deterministic, called by GC
    ~Resource() {
        Console.WriteLine($"{Name} finalized");
    }
}

Resource r = new Resource("FileHandler");  // FileHandler created
r = null;  // May eventually be finalized by GC
```

```java
class Resource {
    String name;

    Resource(String name) {
        this.name = name;
        System.out.println(name + " created");
    }

    // Deprecated — don't use. Use try-with-resources instead.
    @Override
    protected void finalize() throws Throwable {
        System.out.println(name + " being garbage collected");
        super.finalize();
    }
}
```

```python
class Resource:
    def __init__(self, name):
        self.name = name
        print(f"{name} created")

    def __del__(self):
        print(f"{self.name} destroyed")

r = Resource("FileHandler")   # FileHandler created
del r                          # FileHandler destroyed
```

```javascript
// JavaScript has no destructors or finalizers in the traditional sense.
// Use FinalizationRegistry (ES2021) for cleanup callbacks (not guaranteed).
class Resource {
  constructor(name) {
    this.name = name;
    console.log(`${name} created`);
  }
}

const registry = new FinalizationRegistry((name) => {
  console.log(`${name} cleaned up`);
});

let r = new Resource("FileHandler");
registry.register(r, r.name);
r = null;  // May eventually trigger the callback
```

**Warning**: Don't rely on finalizers for important cleanup — use deterministic patterns instead.

---

## Resource Management

For resources like files, database connections, or network sockets, you need **deterministic cleanup** (not relying on GC).

```cpp
#include <iostream>
#include <fstream>
#include <memory>

// RAII — resource released when object goes out of scope
{
    std::ifstream file("data.txt");
    // use file...
}  // file.close() called automatically by destructor

// Custom RAII class
class DatabaseConnection {
public:
    DatabaseConnection() { std::cout << "Connected" << std::endl; }
    ~DatabaseConnection() { std::cout << "Disconnected" << std::endl; }
};

{
    DatabaseConnection db;
    // use db...
}  // Disconnected (automatic)
```

```csharp
using System;
using System.IO;

// using statement — automatically calls Dispose() when done
using (StreamReader reader = new StreamReader("data.txt")) {
    // use reader...
}  // reader.Dispose() called automatically

// Custom IDisposable class
class DatabaseConnection : IDisposable {
    public DatabaseConnection() {
        Console.WriteLine("Connected");
    }

    public void Dispose() {
        Console.WriteLine("Disconnected");
    }
}

using (DatabaseConnection db = new DatabaseConnection()) {
    // use db...
}  // db.Dispose() called automatically

// C# 8+ using declaration (no braces needed)
using var db2 = new DatabaseConnection();
// db2.Dispose() called at end of scope
```

```java
// Automatically closes the resource when done
try (FileReader reader = new FileReader("data.txt")) {
    // use reader...
}  // reader.close() called automatically

// Works with any class implementing AutoCloseable
class DatabaseConnection implements AutoCloseable {
    DatabaseConnection() {
        System.out.println("Connected");
    }

    @Override
    public void close() {
        System.out.println("Disconnected");
    }
}

try (DatabaseConnection db = new DatabaseConnection()) {
    // use db...
}  // db.close() called automatically
```

```python
# Automatically closes the file when done
with open("data.txt") as f:
    content = f.read()
# f.close() called automatically

# Custom context manager
class DatabaseConnection:
    def __enter__(self):
        print("Connected")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Disconnected")

with DatabaseConnection() as db:
    pass  # use db...
# Disconnected (automatic cleanup)
```

```javascript
// JavaScript doesn't have built-in RAII or context managers.
// Use try/finally for deterministic cleanup.
class DatabaseConnection {
  connect() {
    console.log("Connected");
  }
  disconnect() {
    console.log("Disconnected");
  }
}

const db = new DatabaseConnection();
db.connect();
try {
  // use db...
} finally {
  db.disconnect();  // Always runs
}

// Symbol.dispose (TC39 proposal / newer runtimes)
// class Resource { [Symbol.dispose]() { cleanup(); } }
// using resource = new Resource();
```

---

## Object Cloning

Creating a copy of an object:

### Shallow Copy vs Deep Copy

```cpp
#include <iostream>
#include <string>
#include <memory>

struct Address {
    std::string city;
};

struct Person {
    std::string name;
    std::shared_ptr<Address> address;
};

// Shallow copy — nested objects are SHARED
Person p1{"Alice", std::make_shared<Address>(Address{"New York"})};
Person p2 = p1;  // Shallow copy by default (shared_ptr shared)
p2.name = "Bob";
p2.address->city = "Boston";
std::cout << p1.address->city << std::endl;  // Boston! (shared)

// Deep copy — everything is independent
Person p3;
p3.name = p1.name;
p3.address = std::make_shared<Address>(*p1.address);  // Copy the address
p3.address->city = "Chicago";
std::cout << p1.address->city << std::endl;  // Boston (unchanged)
```

```csharp
using System;

class Address {
    public string City;
    public Address(string city) { City = city; }
}

class Person : ICloneable {
    public string Name;
    public Address Address;

    public Person(string name, Address address) {
        Name = name;
        Address = address;
    }

    // Shallow clone
    public object Clone() {
        return MemberwiseClone();
    }

    // Deep clone
    public Person DeepClone() {
        return new Person(Name, new Address(Address.City));
    }
}

Address addr = new Address("New York");
Person p1 = new Person("Alice", addr);

Person p2 = (Person)p1.Clone();  // Shallow
p2.Address.City = "Boston";
Console.WriteLine(p1.Address.City);  // Boston! (shared)

Person p3 = p1.DeepClone();  // Deep
p3.Address.City = "Chicago";
Console.WriteLine(p1.Address.City);  // Boston (unchanged)
```

```java
class Address implements Cloneable {
    String city;
    Address(String city) { this.city = city; }

    @Override
    protected Address clone() {
        return new Address(this.city);
    }
}

class Person implements Cloneable {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Shallow clone
    @Override
    protected Person clone() {
        try {
            return (Person) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    // Deep clone
    Person deepClone() {
        return new Person(this.name, this.address.clone());
    }
}

Address addr = new Address("New York");
Person p1 = new Person("Alice", addr);

Person p2 = p1.clone();  // Shallow
p2.address.city = "Boston";
System.out.println(p1.address.city);  // Boston! (shared)

Person p3 = p1.deepClone();  // Deep
p3.address.city = "Chicago";
System.out.println(p1.address.city);  // Boston (unchanged)
```

```python
import copy

class Address:
    def __init__(self, city):
        self.city = city

class Person:
    def __init__(self, name, address):
        self.name = name
        self.address = address

addr = Address("New York")
p1 = Person("Alice", addr)

# Shallow copy — nested objects are SHARED
p2 = copy.copy(p1)
p2.name = "Bob"
p2.address.city = "Boston"
print(p1.address.city)  # Boston! (shared address changed)

# Deep copy — everything is independent
p3 = copy.deepcopy(p1)
p3.address.city = "Chicago"
print(p1.address.city)  # Boston (unchanged — independent copy)
```

```javascript
class Address {
  constructor(city) {
    this.city = city;
  }
}

class Person {
  constructor(name, address) {
    this.name = name;
    this.address = address;
  }
}

const addr = new Address("New York");
const p1 = new Person("Alice", addr);

// Shallow copy — nested objects are SHARED
const p2 = Object.assign(new Person("", null), p1);
p2.name = "Bob";
p2.address.city = "Boston";
console.log(p1.address.city);  // Boston! (shared)

// Deep copy — everything is independent
const p3 = structuredClone(p1);  // ES2022+
p3.address.city = "Chicago";
console.log(p1.address.city);   // Boston (unchanged)
```

```
Shallow Copy:
p1.address ──→ ┌──────────┐ ←── p2.address
               │ city:    │     (SAME object)
               │ "Boston" │
               └──────────┘

Deep Copy:
p1.address ──→ ┌──────────┐
               │ city:    │
               │ "Boston" │
               └──────────┘
p3.address ──→ ┌──────────┐
               │ city:    │     (DIFFERENT object)
               │ "Chicago"│
               └──────────┘
```

---

## RAII — Resource Acquisition Is Initialization (C++)

**RAII** is a fundamental C++ pattern where the **lifetime of a resource** is tied to the **lifetime of an object**. The constructor acquires the resource; the destructor releases it.

This guarantees cleanup even when exceptions are thrown — no `finally` blocks needed.

```cpp
#include <iostream>
#include <fstream>
#include <mutex>
#include <memory>
using namespace std;

// RAII wrapper for a file handle
class FileHandle {
    ofstream file;
public:
    FileHandle(const string& path) : file(path) {
        if (!file.is_open()) throw runtime_error("Cannot open file");
        cout << "File opened: " << path << endl;
    }

    void write(const string& text) { file << text; }

    ~FileHandle() {
        file.close();
        cout << "File closed" << endl;
    }
};

void writeReport() {
    FileHandle f("report.txt");  // Acquired
    f.write("Hello, RAII!");
}  // f destroyed here — file closed automatically
```

**Smart pointers** are the standard RAII tools for heap memory:

- `std::unique_ptr<T>` — sole ownership, zero overhead
- `std::shared_ptr<T>` — reference-counted shared ownership

```cpp
void example() {
    auto ptr = make_unique<int[]>(100);  // Allocates 100 ints
    ptr[0] = 42;
}  // Memory freed automatically — no delete needed
```

Rather than remembering to call `delete`, `close()`, or `unlock()`, RAII ties every resource to a scope-bound object.

---

## Key Takeaways

- Objects go through **creation** → **usage** → **destruction**
- Objects live on the **heap**; references live on the **stack**
- Multiple references can point to the **same object**
- **Garbage collection** automatically frees unreferenced objects (Java, C#, Python, JS)
- C++ uses **RAII** — deterministic destruction via destructors
- Use **try-with-resources** (Java), **using statement / IDisposable** (C#), **context managers** (Python), **RAII** (C++), or **try/finally** (JS) for deterministic cleanup
- **Shallow copy** shares nested objects; **deep copy** creates independent copies

## IDisposable and the `using` Statement (C#)

C# uses `IDisposable` for deterministic resource cleanup. The `using` statement ensures `Dispose()` is called even if an exception occurs:

```csharp
using System;

class TempFile : IDisposable {
    public string Path { get; }
    private bool disposed = false;

    public TempFile() {
        Path = System.IO.Path.GetTempFileName();
        Console.WriteLine($"Temp file created: {Path}");
    }

    public void Dispose() {
        if (!disposed) {
            System.IO.File.Delete(Path);
            Console.WriteLine($"Temp file deleted: {Path}");
            disposed = true;
        }
    }
}

// using declaration (C# 8+) — Dispose called at end of enclosing scope
using var temp = new TempFile();
// work with temp.Path...
// Automatically deleted when scope ends
```

Next: **Exception Handling in OOP** — handling errors gracefully.
