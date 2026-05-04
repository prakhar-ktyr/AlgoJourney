---
title: Scope and Binding
---

# Scope and Binding

**Scope** determines where in a program a name (variable, function, type) is visible and accessible. **Binding** is the association between a name and the entity it refers to. Understanding scope and binding is essential for both language design and compiler implementation.

---

## What Is Scope?

The **scope** of a declaration is the region of the program where that declaration is visible.

```c
int x = 10;          // x is visible from here...

void foo() {
    int y = 20;      // y is visible only inside foo
    printf("%d", x); // x is visible here too
}                    // ...to here for y

// y is NOT visible here
// x is still visible here
```

---

## Types of Scope

### 1. Global Scope

Variables declared outside all functions. Visible everywhere.

```c
int globalVar = 100;  // Global scope

void foo() {
    printf("%d", globalVar);  // Accessible
}

void bar() {
    printf("%d", globalVar);  // Also accessible
}
```

### 2. Function Scope

Variables declared inside a function. Visible only within that function.

```c
void foo() {
    int localVar = 42;       // Function scope
    printf("%d", localVar);  // OK
}

void bar() {
    printf("%d", localVar);  // ERROR: not visible here
}
```

### 3. Block Scope

Variables declared inside a block (`{}`). Visible only within that block.

```c
void foo() {
    int a = 1;

    if (a > 0) {
        int b = 2;       // Block scope: only visible in this if-block
        printf("%d", b); // OK
    }

    printf("%d", b);     // ERROR: b is out of scope
}
```

### 4. File Scope (C-specific)

Using `static` at file level limits visibility to that translation unit:

```c
// file1.c
static int secret = 42;  // Only visible in file1.c

// file2.c
extern int secret;        // ERROR: cannot access static from file1.c
```

---

## Lexical (Static) Scope

In **lexical scoping**, the scope of a variable is determined by its position in the source code. You can tell where a variable is visible just by reading the code.

```python
x = 10          # Global

def outer():
    y = 20      # Enclosed in outer

    def inner():
        z = 30  # Local to inner
        print(x)  # Looks up: inner → outer → global (finds x=10)
        print(y)  # Looks up: inner → outer (finds y=20)
        print(z)  # Looks up: inner (finds z=30)

    inner()

outer()
```

**Lookup rule:** Search from the innermost enclosing scope outward.

```
inner scope  →  outer scope  →  global scope
     z=30          y=20            x=10
```

**Most languages use lexical scoping:** C, C++, Java, Python, JavaScript, Rust, Go.

---

## Dynamic Scope

In **dynamic scoping**, the scope of a variable depends on the **call stack** at runtime, not the source code structure.

```python
# Hypothetical dynamic scoping (not real Python)
x = 10

def foo():
    print(x)  # Looks up the call stack for 'x'

def bar():
    x = 20    # This x might be found by foo!
    foo()

bar()   # Would print 20 with dynamic scope
        # Prints 10 with lexical scope (Python uses lexical)
```

### Comparison

```c
int x = 1;

void foo() {
    printf("%d\n", x);
}

void bar() {
    int x = 2;
    foo();
}

int main() {
    bar();
    return 0;
}
```

| Scoping | `foo()` prints | Why |
|---------|---------------|-----|
| Lexical | 1 | `foo` sees the `x` from its enclosing scope (global) |
| Dynamic | 2 | `foo` sees the most recent `x` on the call stack (`bar`'s `x`) |

**Languages with dynamic scope:** Bash, Emacs Lisp, some older Lisps, TeX.

---

## Nested Scopes and Scope Resolution

When scopes are nested, the compiler must resolve names through a **scope chain**:

```c
int x = 1;                    // Scope 0 (global)

void outer() {                // Scope 1
    int x = 2;

    void middle() {           // Scope 2
        int y = 3;

        void inner() {        // Scope 3
            printf("%d", x);  // Which x? → Scope 2's x (nearest)
            printf("%d", y);  // Which y? → Scope 2's y
        }
    }
}
```

### Scope Resolution Algorithm

```python
def resolve_name(name, current_scope):
    """Find the declaration that a name refers to."""
    scope = current_scope

    while scope is not None:
        if name in scope.declarations:
            return scope.declarations[name]
        scope = scope.parent  # Move to enclosing scope

    raise NameError(f"Undefined name: '{name}'")
```

### Visualization

```
┌────────────────────────────────┐
│ Global Scope                   │
│   x = 1                       │
│ ┌────────────────────────────┐ │
│ │ outer() Scope              │ │
│ │   x = 2                   │ │
│ │ ┌────────────────────────┐ │ │
│ │ │ middle() Scope         │ │ │
│ │ │   y = 3                │ │ │
│ │ │ ┌──────────────────┐   │ │ │
│ │ │ │ inner() Scope    │   │ │ │
│ │ │ │   → x resolves   │   │ │ │
│ │ │ │     to outer's x │   │ │ │
│ │ │ └──────────────────┘   │ │ │
│ │ └────────────────────────┘ │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

---

## Name Binding

**Binding** is the association between a name and an entity. Key binding times:

| Binding Time | What's Decided | Example |
|-------------|----------------|---------|
| Language design | Operator meanings | `+` means addition |
| Compile time | Variable types | `int x` binds x to int |
| Link time | Global addresses | `extern void foo()` |
| Load time | Static locations | Static variable addresses |
| Runtime | Dynamic values | `x = readInput()` |

### Static Binding

The association is fixed at compile time:

```c
int x = 5;       // x is bound to type 'int' at compile time
void foo();      // foo is bound to a function at link time
```

### Dynamic Binding

The association is determined at runtime:

```python
x = 5           # x bound to int value
x = "hello"     # x rebound to string value (dynamic)
```

---

## Shadowing

When an inner scope declares a name that already exists in an outer scope:

```c
int x = 10;          // Global x

void foo() {
    int x = 20;      // Shadows global x
    printf("%d", x); // Prints 20 (inner x)
}

// Global x is unaffected
printf("%d", x);     // Prints 10
```

### Shadowing Rules in the Compiler

```python
class ScopeManager:
    def __init__(self):
        self.scopes = [{}]  # Start with global scope

    def enter_scope(self):
        self.scopes.append({})

    def exit_scope(self):
        self.scopes.pop()

    def declare(self, name, info):
        current = self.scopes[-1]
        if name in current:
            raise Exception(f"Redeclaration of '{name}' in same scope")
        current[name] = info
        # Note: does NOT check outer scopes — shadowing is allowed

    def lookup(self, name):
        # Search innermost first
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        return None


# Example
sm = ScopeManager()
sm.declare("x", {"type": "int", "value": 10})

sm.enter_scope()
sm.declare("x", {"type": "float", "value": 3.14})  # Shadows outer x

print(sm.lookup("x"))  # {'type': 'float', 'value': 3.14}
sm.exit_scope()

print(sm.lookup("x"))  # {'type': 'int', 'value': 10}
```

---

## Closures and Their Implementation

A **closure** is a function that captures variables from its enclosing scope, even after that scope has exited.

```python
def make_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
print(counter())  # 3
# 'count' survives because the closure captures it
```

### Why Closures Are Tricky for Compilers

Normally, local variables live on the stack and are destroyed when the function returns. But closures need those variables to **outlive** the function!

### Implementation: Heap Allocation

Move captured variables from the stack to the heap:

```c
// Compiler transforms this:
//   function make_adder(x):
//       return function(y): return x + y

struct Closure {
    int (*func_ptr)(struct Closure*, int);
    int captured_x;  // Captured variable stored in struct
};

int adder_impl(struct Closure *self, int y) {
    return self->captured_x + y;
}

struct Closure* make_adder(int x) {
    struct Closure *c = malloc(sizeof(struct Closure));
    c->func_ptr = adder_impl;
    c->captured_x = x;  // Copy x to heap
    return c;
}
```

---

## Scope-Related Errors

| Error | Cause | Example |
|-------|-------|---------|
| Undeclared variable | Used before any declaration | `y = x + 1` (x never declared) |
| Redeclaration | Same name in same scope | `int x; int x;` |
| Use before declaration | Used on earlier line | `y = x; int x = 5;` |
| Out of scope access | Accessing expired variable | Accessing loop var after loop |
| Shadowing warning | Inner hides outer | `int x; { int x; }` |

---

## Exercises

**Exercise 1:** For each `print(x)`, state what value is printed and which declaration it refers to:

```c
int x = 1;

void foo() {
    int x = 2;
    printf("%d\n", x);   // (a)
    {
        int x = 3;
        printf("%d\n", x); // (b)
    }
    printf("%d\n", x);   // (c)
}

int main() {
    printf("%d\n", x);   // (d)
    foo();
    printf("%d\n", x);   // (e)
}
```

**Exercise 2:** Would this code behave differently under lexical vs dynamic scoping?

```c
int x = 10;
void print_x() { printf("%d", x); }
void change() { int x = 99; print_x(); }
int main() { change(); }
```

**Exercise 3:** Implement a `free_variables(function_node)` function that returns the set of variables used by a function but declared in an outer scope (i.e., variables the closure must capture).

**Exercise 4:** Draw the scope tree for this program and show how each name resolves:

```python
a = 1
def f(b):
    c = a + b
    def g(d):
        return c + d
    return g
h = f(2)
print(h(3))
```

**Exercise 5:** Identify all scope errors in this code:

```c
int main() {
    printf("%d", y);    // Line 2
    int x = 5;
    int x = 10;        // Line 4
    {
        int z = x;
    }
    printf("%d", z);    // Line 8
    return 0;
}
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Lexical scope | Determined by source code position |
| Dynamic scope | Determined by call stack at runtime |
| Block scope | Variables in `{}` blocks |
| Shadowing | Inner declaration hides outer |
| Name binding | Association of name with entity |
| Closures | Functions capturing enclosing variables |
| Resolution | Search innermost → outermost scope |
| LEGB (Python) | Local → Enclosing → Global → Built-in |

---

## Next Steps

In the next lesson, we'll explore **Syntax-Directed Translation** — how to attach semantic actions (like type checking and code generation) directly to grammar rules.
