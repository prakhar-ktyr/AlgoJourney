---
title: Runtime Type Information
---

# Runtime Type Information

**Runtime Type Information (RTTI)** provides type information about objects during program execution. This enables virtual method calls, type checking, and reflection — all features that require knowing an object's actual type at runtime, not just its declared type.

---

## Why RTTI?

Consider this C++ code:

```c
class Shape {
public:
    virtual double area() = 0;
};

class Circle : public Shape {
public:
    double radius;
    double area() override { return 3.14159 * radius * radius; }
};

class Rectangle : public Shape {
public:
    double width, height;
    double area() override { return width * height; }
};

void print_area(Shape* s) {
    // Which area() gets called? Depends on ACTUAL type of s at runtime!
    printf("Area: %f\n", s->area());
}
```

The compiler doesn't know at compile time whether `s` points to a `Circle` or `Rectangle`. RTTI mechanisms make this work.

---

## Virtual Method Tables (Vtables)

The **vtable** is the most common mechanism for implementing dynamic dispatch in object-oriented languages.

### Single Inheritance Layout

Each class with virtual methods has a **vtable** — an array of function pointers:

```
class Animal:
  vtable → [ &Animal::speak, &Animal::move, &Animal::eat ]

class Dog extends Animal:
  vtable → [ &Dog::speak, &Animal::move, &Dog::eat ]
                 ↑ overridden                ↑ overridden
```

Each object contains a hidden pointer to its class's vtable:

```
Dog object in memory:
+------------------+
| vptr             | → Dog's vtable
+------------------+
| name (field)     |
+------------------+
| age (field)      |
+------------------+
```

### How a Virtual Call Works

```c
animal->speak();

// Compiled to (pseudocode):
// 1. Load vtable pointer from object
vptr = animal->__vptr;
// 2. Index into vtable for speak() (index 0)
func = vptr[0];
// 3. Call through function pointer
func(animal);
```

In assembly (x86-64):

```
mov rax, [rdi]          ; load vptr from object (rdi = this)
call [rax + 0]          ; call first entry in vtable (speak)
```

This is an **indirect call** — the target isn't known until runtime.

### Vtable Construction Example

```c
class Base {
public:
    virtual void foo() { }   // vtable[0]
    virtual void bar() { }   // vtable[1]
    virtual void baz() { }   // vtable[2]
    int x;
};

class Derived : public Base {
public:
    void bar() override { }  // replaces vtable[1]
    virtual void qux() { }   // vtable[3] (new slot)
    int y;
};
```

```
Base vtable:    [ &Base::foo, &Base::bar, &Base::baz ]
Derived vtable: [ &Base::foo, &Derived::bar, &Base::baz, &Derived::qux ]
                                  ↑ overridden               ↑ new

Base object layout:       Derived object layout:
+--------+                +--------+
| vptr   | → Base vtable  | vptr   | → Derived vtable
+--------+                +--------+
| x      |               | x      |  (inherited)
+--------+                +--------+
                          | y      |  (new field)
                          +--------+
```

### Multiple Inheritance

With multiple base classes, an object may need **multiple vtable pointers**:

```c
class A {
public:
    virtual void foo() { }
    int a;
};

class B {
public:
    virtual void bar() { }
    int b;
};

class C : public A, public B {
public:
    void foo() override { }
    void bar() override { }
    int c;
};
```

```
C object layout:
+----------+
| vptr_A   | → C's vtable for A interface
+----------+
| a        |
+----------+
| vptr_B   | → C's vtable for B interface
+----------+
| b        |
+----------+
| c        |
+----------+
```

When calling through a `B*` pointer to a `C` object, the compiler adjusts `this`:

```c
B* bp = new C();    // bp points to the B sub-object (offset within C)
bp->bar();          // uses vptr_B, adjusts this pointer back to C's start
```

This adjustment is called a **thunk**.

---

## Dynamic Dispatch Cost

A virtual method call has overhead compared to a direct (non-virtual) call:

| Call type | Cost |
|-----------|------|
| Direct call | Single instruction, branch predictor friendly |
| Virtual call | Load vptr + indirect call (2 memory accesses) |

The indirect call also makes **inlining** impossible (the compiler doesn't know which function will be called).

---

## Type Checking at Runtime

### C++: dynamic_cast and typeid

```c
Shape* s = get_shape();

// Safe downcast — returns nullptr if wrong type
Circle* c = dynamic_cast<Circle*>(s);
if (c != nullptr) {
    printf("Radius: %f\n", c->radius);
}

// Type identification
if (typeid(*s) == typeid(Circle)) {
    printf("It's a circle!\n");
}
```

Implementation: the vtable typically contains a pointer to a **type_info** structure:

```
Circle vtable:
+------------------+
| &type_info       | → { name: "Circle", base: &Shape_type_info }
+------------------+
| &Circle::area    |
+------------------+
| ...              |
```

### Java: instanceof

```java
Object obj = getObject();

if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}
```

Java stores a class pointer in every object header, linking to full class metadata.

---

## Type Tags for Tagged Unions

In languages without inheritance, type information can be stored as a **tag**:

```c
// C tagged union (discriminated union)
typedef enum { INT_VAL, FLOAT_VAL, STRING_VAL } ValueType;

typedef struct {
    ValueType tag;      // runtime type tag
    union {
        int i;
        float f;
        char *s;
    } data;
} Value;

void print_value(Value *v) {
    switch (v->tag) {
        case INT_VAL:    printf("%d", v->data.i); break;
        case FLOAT_VAL:  printf("%f", v->data.f); break;
        case STRING_VAL: printf("%s", v->data.s); break;
    }
}
```

Rust's enums are tagged unions with compile-time exhaustiveness checking:

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
    }
}
```

---

## Reflection

**Reflection** allows a program to examine and modify its own structure at runtime:

### Java Reflection

```java
Class<?> cls = obj.getClass();
System.out.println("Class: " + cls.getName());

// List all methods
for (Method m : cls.getDeclaredMethods()) {
    System.out.println("  Method: " + m.getName());
}

// Call a method by name
Method m = cls.getMethod("toString");
String result = (String) m.invoke(obj);
```

### Python Reflection

```python
class Dog:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "Woof!"

d = Dog("Rex")
print(type(d))                    # <class 'Dog'>
print(dir(d))                     # list all attributes/methods
print(hasattr(d, 'speak'))        # True
print(getattr(d, 'name'))         # "Rex"

# Call method dynamically
method = getattr(d, 'speak')
print(method())                   # "Woof!"
```

### C# Reflection

```c
Type t = obj.GetType();
PropertyInfo[] props = t.GetProperties();
foreach (var p in props) {
    Console.WriteLine($"{p.Name}: {p.GetValue(obj)}");
}
```

### Implementation Cost

Reflection requires the runtime to retain extensive metadata:

| Data retained | Purpose |
|---------------|---------|
| Class names | `getClass().getName()` |
| Method signatures | Method lookup and invocation |
| Field names and types | Field access |
| Annotations/attributes | Framework features (DI, ORM) |
| Generic type info | Type parameters at runtime |

This metadata increases binary size and memory usage.

---

## RTTI Overhead and Optimization

### Costs of RTTI

1. **Memory**: vtables, type_info objects, reflection metadata
2. **Performance**: indirect calls prevent optimization
3. **Binary size**: metadata tables

### Devirtualization

The compiler can sometimes determine the actual type statically and replace virtual calls with direct calls:

```c
void use_circle() {
    Circle c;
    c.area();  // compiler KNOWS c is a Circle
               // can call Circle::area() directly (no vtable lookup)
}
```

**Techniques:**

| Technique | Description |
|-----------|-------------|
| Concrete type analysis | If variable's type is known exactly |
| Sealed/final classes | Can't be overridden → safe to devirtualize |
| Profile-guided optimization | Inline most common target |
| Speculative devirtualization | Inline expected target + runtime check |

```c
// Speculative devirtualization (pseudocode)
if (obj->vptr == &Circle_vtable) {
    // fast path: inline Circle::area()
    result = 3.14159 * obj->radius * obj->radius;
} else {
    // slow path: virtual call
    result = obj->area();
}
```

### Disabling RTTI

In C++, you can compile with `-fno-rtti` to remove type_info data:
- Reduces binary size
- `dynamic_cast` and `typeid` become unavailable
- Vtables and virtual dispatch still work

---

## Object Layout in Practice

A typical C++ object with inheritance:

```c
class Base {
    virtual void f();
    int x;        // offset 8 (after vptr)
};

class Derived : public Base {
    void f() override;
    int y;        // offset 12
};
```

Memory layout (64-bit system):

```
Offset  Size  Field
0       8     vptr (pointer to Derived's vtable)
8       4     x (inherited from Base)
12      4     y (Derived's own field)
---
Total: 16 bytes
```

The vtable itself (stored once per class, not per object):

```
Derived's vtable:
Offset  Content
-8      &type_info for Derived  (for RTTI)
0       &Derived::f             (virtual method)
```

---

## Exercises

1. **Vtable construction**: Given these classes, draw the vtable for each:
   ```c
   class Vehicle { virtual void start(); virtual void stop(); };
   class Car : public Vehicle { void start() override; virtual void honk(); };
   class ElectricCar : public Car { void start() override; };
   ```

2. **Virtual call**: For `Vehicle* v = new ElectricCar(); v->start();`, trace the steps: how does the CPU find and call `ElectricCar::start()`?

3. **Object size**: Calculate the size of objects of each class (assume 64-bit, 8-byte alignment):
   ```c
   class A { virtual void f(); int x; };
   class B : public A { int y; double z; };
   ```

4. **Multiple inheritance**: Draw the object layout for class `D` that inherits from both `B` and `C`, each with one virtual method and one int field.

5. **Devirtualization**: In the following code, can the compiler devirtualize the call? Why or why not?
   ```c
   void process(Shape* s) {
       s->area();
   }
   void test() {
       Circle c(5.0);
       process(&c);
   }
   ```

6. **Tagged union vs vtable**: Compare the implementation of a "Shape" type using:
   (a) Inheritance with virtual methods
   (b) A tagged union with a switch statement
   Discuss trade-offs in extensibility, performance, and safety.

---

## Summary

| Concept | Purpose |
|---------|---------|
| Vtable | Array of function pointers for dynamic dispatch |
| Vptr | Per-object pointer to class's vtable |
| dynamic_cast | Safe runtime type checking (downcast) |
| Type tags | Discriminant for tagged unions |
| Reflection | Full type introspection at runtime |
| Devirtualization | Optimization: replace indirect with direct call |

RTTI bridges the gap between static typing (known at compile time) and dynamic behavior (determined at runtime). Understanding its implementation helps you reason about performance and design trade-offs in object-oriented programs.
