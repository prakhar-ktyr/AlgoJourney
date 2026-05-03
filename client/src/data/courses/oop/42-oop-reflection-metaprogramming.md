---
title: Reflection and Metaprogramming
---

# Reflection and Metaprogramming

**Reflection** is the ability of a program to examine and modify its own structure and behaviour at runtime. **Metaprogramming** goes further — writing code that writes or modifies code.

---

## What is Reflection?

Normally, you know at compile time what classes, methods, and fields exist. Reflection lets you discover and use them at **runtime**:

```
Compile time:  Dog dog = new Dog();     ← you KNOW it's a Dog
Runtime:       Object obj = ???;         ← what is it? Reflection tells you!
```

---

## Inspecting a Class

```cpp
#include <iostream>
#include <typeinfo>

class Person {
public:
    std::string name;
    int age;

    Person(std::string name, int age) : name(std::move(name)), age(age) {}

    std::string getName() { return name; }
};

int main() {
    Person p("Alice", 25);

    // C++ has limited reflection via RTTI (Run-Time Type Information)
    std::cout << "Type: " << typeid(p).name() << "\n";  // Implementation-defined

    // dynamic_cast for runtime type checking (requires polymorphism)
    // typeid for type names
    // No built-in field/method enumeration — C++ reflection is very limited
    // compared to Java/Python/JS

    // Use compile-time techniques (templates) for most "reflection" in C++
    return 0;
}
```

```csharp
using System;
using System.Reflection;

class Person {
    private string name;
    private int age;

    public Person(string name, int age) {
        this.name = name;
        this.age = age;
    }

    public string GetName() => name;
    private void Secret() => Console.WriteLine("Secret!");
}

// Get the Type object
Type type = typeof(Person);
// Or: person.GetType();
// Or: Type.GetType("Person");

// Inspect class name
Console.WriteLine($"Class: {type.Name}");  // Person

// Inspect fields
foreach (var f in type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance)) {
    Console.WriteLine($"Field: {f.Name} ({f.FieldType.Name})");
}
// Field: name (String)
// Field: age (Int32)

// Inspect methods
foreach (var m in type.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly)) {
    Console.WriteLine($"Method: {m.Name} → {m.ReturnType.Name}");
}
// Method: GetName → String
// Method: Secret → Void

// Inspect constructors
foreach (var c in type.GetConstructors()) {
    Console.WriteLine($"Constructor: {c.GetParameters().Length} params");
}
```

```java
import java.lang.reflect.*;

class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    private void secret() { System.out.println("Secret!"); }
}

// Get the Class object
Class<?> clazz = Person.class;
// Or: Class.forName("Person");
// Or: person.getClass();

// Inspect class name
System.out.println("Class: " + clazz.getName());  // Person

// Inspect fields
for (Field f : clazz.getDeclaredFields()) {
    System.out.println("Field: " + f.getName()
        + " (" + f.getType().getSimpleName() + ")");
}
// Field: name (String)
// Field: age (int)

// Inspect methods
for (Method m : clazz.getDeclaredMethods()) {
    System.out.println("Method: " + m.getName()
        + " → " + m.getReturnType().getSimpleName());
}
// Method: getName → String
// Method: secret → void

// Inspect constructors
for (Constructor<?> c : clazz.getDeclaredConstructors()) {
    System.out.println("Constructor: " + c.getParameterCount() + " params");
}
```

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hi, I'm {self.name}")

    def _private_method(self):
        print("Private!")

p = Person("Alice", 25)

# Inspect type
print(type(p))                  # <class 'Person'>
print(type(p).__name__)         # Person
print(isinstance(p, Person))    # True

# Inspect attributes
print(dir(p))                   # List all attributes and methods
print(vars(p))                  # {'name': 'Alice', 'age': 25}

# Dynamic attribute access
print(getattr(p, 'name'))       # Alice
setattr(p, 'name', 'Bob')
print(p.name)                   # Bob
print(hasattr(p, 'email'))      # False

# Dynamic method calling
method = getattr(p, 'greet')
method()                        # Hi, I'm Bob

# Check if callable
print(callable(getattr(p, 'greet')))  # True
print(callable(getattr(p, 'name')))   # False
```

```javascript
class Person {
  #secret = "hidden";

  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getName() { return this.name; }
  greet() { console.log(`Hi, I'm ${this.name}`); }
}

const p = new Person("Alice", 25);

// Inspect type
console.log(p.constructor.name);         // Person
console.log(p instanceof Person);        // true

// Inspect properties
console.log(Object.keys(p));             // ['name', 'age']
console.log(Object.getOwnPropertyNames(p)); // ['name', 'age']

// Inspect methods (on prototype)
console.log(Object.getOwnPropertyNames(Person.prototype));
// ['constructor', 'getName', 'greet']

// Dynamic property access
console.log(p["name"]);                  // Alice
p["name"] = "Bob";
console.log(p.name);                     // Bob
console.log("email" in p);              // false

// Dynamic method calling
const method = p["greet"];
method.call(p);                          // Hi, I'm Bob

// Check if callable
console.log(typeof p.greet === "function"); // true
console.log(typeof p.name === "function");  // false
```

---

## Creating Objects Dynamically

```cpp
#include <iostream>
#include <map>
#include <functional>
#include <memory>

// C++ doesn't have built-in dynamic instantiation, so we use a factory registry
class Animal {
public:
    virtual void speak() = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() override { std::cout << "Woof!\n"; }
};

class Cat : public Animal {
public:
    void speak() override { std::cout << "Meow!\n"; }
};

// Registry for dynamic creation
std::map<std::string, std::function<std::unique_ptr<Animal>()>> registry;

void registerClass(const std::string& name, std::function<std::unique_ptr<Animal>()> factory) {
    registry[name] = factory;
}

int main() {
    registerClass("Dog", []() { return std::make_unique<Dog>(); });
    registerClass("Cat", []() { return std::make_unique<Cat>(); });

    // "Dynamic" creation via registry
    auto animal = registry["Dog"]();
    animal->speak();  // Woof!
    return 0;
}
```

```csharp
using System;
using System.Reflection;

// Create instance via reflection
var constructor = type.GetConstructor(new[] { typeof(string), typeof(int) });
object person = constructor.Invoke(new object[] { "Alice", 25 });

// Call method via reflection
var getName = type.GetMethod("GetName");
string name = (string)getName.Invoke(person, null);
Console.WriteLine(name);  // Alice

// Access private field
var nameField = type.GetField("name", BindingFlags.NonPublic | BindingFlags.Instance);
nameField.SetValue(person, "Bob");  // Bypass private!
Console.WriteLine(getName.Invoke(person, null));  // Bob

// Call private method
var secretMethod = type.GetMethod("Secret", BindingFlags.NonPublic | BindingFlags.Instance);
secretMethod.Invoke(person, null);  // Secret!
```

```java
// Create instance via reflection
Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
Object person = constructor.newInstance("Alice", 25);

// Call method via reflection
Method getName = clazz.getMethod("getName");
String name = (String) getName.invoke(person);
System.out.println(name);  // Alice

// Access private field
Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true);  // Bypass private!
nameField.set(person, "Bob");
System.out.println(getName.invoke(person));  // Bob

// Call private method
Method secretMethod = clazz.getDeclaredMethod("secret");
secretMethod.setAccessible(true);
secretMethod.invoke(person);  // Secret!
```

```python
import inspect

class Calculator:
    """A simple calculator."""

    def add(self, a: int, b: int) -> int:
        """Add two numbers."""
        return a + b

    def multiply(self, a: int, b: int) -> int:
        return a * b

# Get all methods
methods = inspect.getmembers(Calculator, predicate=inspect.isfunction)
for name, method in methods:
    print(f"Method: {name}")
    sig = inspect.signature(method)
    print(f"  Signature: {sig}")

# Get docstring
print(Calculator.__doc__)       # A simple calculator.
print(Calculator.add.__doc__)   # Add two numbers.

# Get source code
print(inspect.getsource(Calculator.add))

# Dynamic object creation
class_name = "Calculator"
cls = globals()[class_name]  # Look up class by name
obj = cls()                  # Create instance dynamically
result = getattr(obj, "add")(2, 3)  # Call method dynamically
print(result)  # 5
```

```javascript
class Calculator {
  add(a, b) { return a + b; }
  multiply(a, b) { return a * b; }
}

// Get all methods
const methods = Object.getOwnPropertyNames(Calculator.prototype)
  .filter(m => m !== "constructor");
console.log(methods);  // ['add', 'multiply']

// Dynamic object creation
const classes = { Calculator };
const className = "Calculator";
const obj = new classes[className]();

// Dynamic method invocation
const methodName = "add";
const result = obj[methodName](2, 3);
console.log(result);  // 5

// Reflect API (modern JavaScript)
const handler = {
  get(target, prop) {
    console.log(`Accessing: ${prop}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`Setting: ${prop} = ${value}`);
    return Reflect.set(target, prop, value);
  }
};

const proxy = new Proxy(obj, handler);
proxy.add(1, 2);  // Accessing: add
```

---

## Metaprogramming

Code that generates or modifies other code at runtime:

```cpp
// C++ metaprogramming is done at COMPILE TIME via templates
// This is fundamentally different from runtime metaprogramming in other languages

// Compile-time computation
template <int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static constexpr int value = 1;
};

// Usage — computed at compile time, not runtime
static_assert(Factorial<5>::value == 120);

// CRTP for "static polymorphism" (compile-time metaprogramming)
template <typename Derived>
class Printable {
public:
    void print() {
        static_cast<Derived*>(this)->printImpl();
    }
};

class MyClass : public Printable<MyClass> {
public:
    void printImpl() { std::cout << "MyClass\n"; }
};
```

```csharp
using System;
using System.Diagnostics;
using System.Reflection;

// C# uses Attributes for metaprogramming — metadata that frameworks process
[AttributeUsage(AttributeTargets.Method)]
class LogExecutionTimeAttribute : Attribute { }

class MyService {
    [LogExecutionTime]
    public void ProcessData() {
        // ... work ...
    }
}

// Processing attributes via reflection
foreach (var m in typeof(MyService).GetMethods()) {
    if (m.GetCustomAttribute<LogExecutionTimeAttribute>() != null) {
        Console.WriteLine($"Method {m.Name} is time-tracked");
    }
}

// Source Generators (compile-time metaprogramming in C#)
// C# can also use source generators for compile-time code generation,
// similar to C++ templates but at the Roslyn compiler level.
```

```java
// Java uses annotations for metaprogramming — metadata that frameworks process
import java.lang.annotation.*;
import java.lang.reflect.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface LogExecutionTime {}

class MyService {
    @LogExecutionTime
    void processData() {
        // ... work ...
    }
}

// Processing annotations via reflection
for (Method m : MyService.class.getDeclaredMethods()) {
    if (m.isAnnotationPresent(LogExecutionTime.class)) {
        System.out.println("Method " + m.getName() + " is time-tracked");
    }
}
```

```python
import time

# Decorators — code that modifies functions
def timer(func):
    """Decorator that measures execution time."""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "Done"

slow_function()  # slow_function took 1.0012s

# Class Decorators
def add_repr(cls):
    """Add a __repr__ method to any class."""
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

print(Point(3, 4))  # Point(x=3, y=4)

# Metaclasses — a "class of a class"
class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        print("Database connected")

db1 = Database()  # Database connected
db2 = Database()  # (no output — returns same instance)
print(db1 is db2)  # True
```

```javascript
// Decorators (Stage 3 proposal) and Proxy-based metaprogramming

// Method decorator pattern (manual)
function logExecutionTime(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args) {
    const start = performance.now();
    const result = original.apply(this, args);
    const elapsed = performance.now() - start;
    console.log(`${name} took ${elapsed.toFixed(4)}ms`);
    return result;
  };
  return descriptor;
}

// Proxy-based metaprogramming (built into JS)
class Database {
  constructor() {
    console.log("Database connected");
  }
}

// Singleton via Proxy
const SingletonFactory = (ClassRef) => {
  let instance = null;
  return new Proxy(ClassRef, {
    construct(target, args) {
      if (!instance) {
        instance = new target(...args);
      }
      return instance;
    }
  });
};

const SingletonDB = SingletonFactory(Database);
const db1 = new SingletonDB();  // Database connected
const db2 = new SingletonDB();  // (no output — same instance)
console.log(db1 === db2);       // true
```

---

## When to Use Reflection

| Use Case | Example |
|----------|---------|
| Frameworks | Spring's dependency injection, JUnit test discovery |
| Serialization | JSON/XML converters that map fields automatically |
| Plugin systems | Load classes dynamically from configuration |
| ORM | Map database columns to object fields |
| Testing | Access private methods for testing |

### When NOT to Use

- Performance-critical code (reflection is slow)
- When regular polymorphism works fine
- To bypass access control in production code

---

## Reflection and Attributes (C#)

C# has a rich `System.Reflection` namespace and attribute system:

```csharp
using System;
using System.Linq;
using System.Reflection;

// Custom attributes for metadata
[AttributeUsage(AttributeTargets.Property)]
class RequiredAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
class MaxLengthAttribute : Attribute {
    public int Length { get; }
    public MaxLengthAttribute(int length) { Length = length; }
}

class UserModel {
    [Required]
    [MaxLength(50)]
    public string Name { get; set; }

    [Required]
    public string Email { get; set; }

    public int? Age { get; set; }
}

// Validation via reflection
static bool Validate(object obj) {
    var type = obj.GetType();
    foreach (var prop in type.GetProperties()) {
        if (prop.GetCustomAttribute<RequiredAttribute>() != null) {
            var value = prop.GetValue(obj);
            if (value == null || (value is string s && string.IsNullOrEmpty(s))) {
                Console.WriteLine($"{prop.Name} is required!");
                return false;
            }
        }
    }
    return true;
}

var user = new UserModel { Name = "Alice", Email = "" };
Validate(user);  // "Email is required!"
```

---

## Proxy and Reflect (JavaScript)

JavaScript's `Proxy` object intercepts fundamental operations (get, set, delete, etc.) on an object. `Reflect` provides matching static methods for default behaviour.

```javascript
// Validation proxy — enforce type constraints at runtime
function createValidated(target, schema) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (schema[prop] && typeof value !== schema[prop]) {
        throw new TypeError(`${prop} must be a ${schema[prop]}, got ${typeof value}`);
      }
      return Reflect.set(obj, prop, value);
    },
    get(obj, prop) {
      if (!(prop in obj)) {
        throw new ReferenceError(`Property "${prop}" does not exist`);
      }
      return Reflect.get(obj, prop);
    }
  });
}

const user = createValidated(
  { name: "Alice", age: 25 },
  { name: "string", age: "number" }
);

user.name = "Bob";   // ✅ OK
user.age = "old";    // ❌ TypeError: age must be a number, got string
user.email;          // ❌ ReferenceError: Property "email" does not exist
```

`Proxy` + `Reflect` power many frameworks (Vue 3 reactivity, MobX observables, API mocking libraries).

---

## Metaclasses (Python)

In Python, classes are objects too — and they are created by **metaclasses**. The default metaclass is `type`.

```python
# Every class is an instance of `type`
class Dog:
    pass

print(type(Dog))        # <class 'type'>
print(type(type))       # <class 'type'> — type is its own metaclass

# Creating a class dynamically with type(name, bases, namespace)
Cat = type("Cat", (), {"speak": lambda self: "Meow!"})
print(Cat().speak())    # Meow!

# Custom metaclass — validates that subclasses define required methods
class InterfaceMeta(type):
    def __init_subclass__(cls, required_methods=(), **kwargs):
        super().__init_subclass__(**kwargs)
        for method in required_methods:
            if not callable(getattr(cls, method, None)):
                raise TypeError(f"{cls.__name__} must implement {method}()")

# Alternative: override __new__ for full control
class ValidatedMeta(type):
    def __new__(mcs, name, bases, namespace):
        # Ensure all public methods have docstrings
        for key, value in namespace.items():
            if callable(value) and not key.startswith("_"):
                if not value.__doc__:
                    raise TypeError(f"{name}.{key}() must have a docstring")
        return super().__new__(mcs, name, bases, namespace)

class MyService(metaclass=ValidatedMeta):
    def process(self):
        """Process data."""
        pass
```

---

## Key Takeaways

- **Reflection** lets you inspect and modify classes at runtime
- C++: Limited to RTTI (`typeid`, `dynamic_cast`); uses compile-time templates instead
- C#: `System.Reflection` namespace, attributes (`[Attribute]`), source generators
- Java: `Class`, `Field`, `Method`, `Constructor` in `java.lang.reflect`
- Python: `type()`, `dir()`, `getattr()`, `setattr()`, `inspect` module
- JavaScript: `Object.keys()`, `Reflect` API, `Proxy` for interception
- **Metaprogramming**: code that generates or modifies code (decorators, metaclasses, annotations, templates)
- Use reflection for frameworks, serialization, and plugins — not for everyday code
- Reflection bypasses compile-time safety — use with caution

Next: **Concurrency in OOP** — thread safety and synchronization.
