---
title: Type Systems
---

# Type Systems

A **type system** is a set of rules that assigns a type to every expression in a program. Types classify values and determine what operations are valid on them. The type system is the compiler's way of catching bugs before your program runs.

---

## What Are Types?

A **type** defines:
1. A set of possible values
2. A set of operations allowed on those values

| Type | Values | Operations |
|------|--------|------------|
| `int` | ..., -2, -1, 0, 1, 2, ... | +, -, *, /, %, comparisons |
| `float` | 3.14, -0.5, 1.0e10, ... | +, -, *, /, comparisons |
| `bool` | true, false | &&, \|\|, ! |
| `char` | 'a', 'b', '0', '\n', ... | comparisons, conversion |
| `string` | "hello", "", ... | concat, length, index |

---

## Why Do We Need Types?

Without types, this code would be meaningless:

```c
int x = 5;
char *s = "hello";
int result = x + s;  // What does this mean?
```

Types help the compiler:
- **Detect errors** at compile time (adding int + string)
- **Determine memory layout** (int = 4 bytes, double = 8 bytes)
- **Generate correct machine code** (integer add vs floating-point add)
- **Optimize code** (knowing size enables better register allocation)

---

## Static vs Dynamic Typing

### Static Typing

Types are checked at **compile time**. Every variable has a fixed type.

```c
// C: statically typed
int x = 5;
x = "hello";  // COMPILE ERROR: incompatible types
```

**Languages:** C, C++, Java, Rust, Go, TypeScript

**Advantages:**
- Errors caught early (before running)
- Better performance (no runtime checks)
- Better tooling (autocomplete, refactoring)

### Dynamic Typing

Types are checked at **runtime**. Variables can hold any type.

```python
# Python: dynamically typed
x = 5
x = "hello"  # Perfectly valid!
print(x + 1)  # RUNTIME ERROR: cannot add str and int
```

**Languages:** Python, JavaScript, Ruby, PHP

**Advantages:**
- More flexible code
- Faster prototyping
- Simpler syntax

### Comparison

| Feature | Static | Dynamic |
|---------|--------|---------|
| Error detection | Compile time | Runtime |
| Performance | Faster (no runtime checks) | Slower (runtime checks) |
| Flexibility | Less flexible | More flexible |
| Type annotations | Required (usually) | Optional |
| Compiler complexity | More complex | Simpler |

---

## Strong vs Weak Typing

This is about how **strictly** type rules are enforced.

### Strong Typing

No implicit conversions between unrelated types. You must explicitly convert.

```python
# Python: strongly typed
x = "5"
y = x + 1  # TypeError! Must do: int(x) + 1
```

### Weak Typing

Implicit conversions happen automatically (sometimes surprisingly).

```c
// C: weakly typed
int x = 5;
float y = x + 2.5;  // int automatically converted to float
char c = 65;         // integer treated as character ('A')
```

```python
# JavaScript: weakly typed
"5" + 1    // "51"  (number coerced to string)
"5" - 1    // 4     (string coerced to number)
```

### The Type System Spectrum

```
Strong ←──────────────────────────→ Weak

Haskell  Python  Java  C#  C  JavaScript  Assembly
```

---

## Type Rules

Type rules define what operations are valid for given types.

### Expression Type Rules

For arithmetic expressions:

$$\frac{\Gamma \vdash e_1 : \text{int} \quad \Gamma \vdash e_2 : \text{int}}{\Gamma \vdash e_1 + e_2 : \text{int}}$$

This reads: "If $e_1$ has type int and $e_2$ has type int, then $e_1 + e_2$ has type int."

Common rules:

| Expression | Type Rule | Result Type |
|-----------|-----------|-------------|
| `int + int` | Both operands int | `int` |
| `float + float` | Both operands float | `float` |
| `int + float` | Widening conversion | `float` |
| `int < int` | Comparison | `bool` |
| `bool && bool` | Logical and | `bool` |
| `!bool` | Logical not | `bool` |

### Assignment Type Rules

$$\frac{\Gamma \vdash x : T \quad \Gamma \vdash e : T}{\Gamma \vdash x = e : T}$$

The right-hand side must be compatible with the left-hand variable's type.

```c
int x;
x = 5;       // OK: int = int
x = 3.14;    // Warning: float → int (truncation)
x = "hello"; // ERROR: incompatible types
```

### Function Call Type Rules

$$\frac{\Gamma \vdash f : (T_1, T_2, \ldots, T_n) \to T_r \quad \Gamma \vdash a_i : T_i}{\Gamma \vdash f(a_1, a_2, \ldots, a_n) : T_r}$$

Each argument must match the corresponding parameter type, and the result has the return type.

```c
int add(int a, int b) { return a + b; }

int result = add(3, 4);      // OK
int bad = add(3, "hello");   // ERROR: arg 2 type mismatch
float f = add(1, 2);         // Warning: int → float
```

---

## Type Equivalence

When are two types "the same"? There are two approaches:

### Structural Equivalence

Two types are equivalent if they have the **same structure**.

```c
// These are structurally equivalent:
struct Point1 { int x; int y; };
struct Point2 { int x; int y; };

// Both have: {int, int} structure
```

**Rule:** Types $T_1$ and $T_2$ are structurally equivalent if:
- They are the same basic type, OR
- They are both arrays of structurally equivalent types with the same size, OR
- They are both structs with the same fields (in order) of equivalent types, OR
- They are both functions with equivalent parameter and return types

### Nominal Equivalence

Two types are equivalent only if they have the **same name**.

```c
// In nominal equivalence, these are DIFFERENT:
struct Point1 { int x; int y; };
struct Point2 { int x; int y; };

// Point1 ≠ Point2 (different names)
```

### Comparison

| Feature | Structural | Nominal |
|---------|-----------|---------|
| Equality based on | Internal structure | Type name |
| Flexibility | More flexible | More restrictive |
| Safety | Can accidentally equate unrelated types | Prevents accidental mixing |
| Languages | ML, TypeScript | C, Java, C# |

### Example: Why It Matters

```c
typedef int Celsius;
typedef int Fahrenheit;

Celsius temp1 = 100;
Fahrenheit temp2 = temp1;  // Structural: OK (both are int)
                           // Nominal: ERROR (different types)
```

With nominal typing, you catch the bug of mixing temperatures!

---

## Type Coercion and Casting

### Implicit Coercion (Widening)

The compiler automatically converts a "smaller" type to a "larger" one:

```c
int i = 42;
float f = i;    // Implicit: int → float (no data loss)
double d = f;   // Implicit: float → double (no data loss)
```

**Type promotion hierarchy:**

$$\text{char} \to \text{short} \to \text{int} \to \text{long} \to \text{float} \to \text{double}$$

### Explicit Casting (Narrowing)

The programmer forces a conversion (may lose data):

```c
double d = 3.99;
int i = (int)d;       // Explicit cast: i = 3 (truncated!)
float f = (float)d;   // Explicit cast: possible precision loss
```

### Coercion Rules

| From | To | Type | Safe? |
|------|----|------|-------|
| int | float | Widening (implicit) | Yes |
| float | int | Narrowing (explicit) | No (truncation) |
| int | double | Widening (implicit) | Yes |
| double | int | Narrowing (explicit) | No |
| char | int | Widening (implicit) | Yes |
| int | char | Narrowing (explicit) | No (overflow) |

### Implementing Coercion in a Compiler

```python
def coerce(expr_type, target_type):
    """Determine if expr_type can be coerced to target_type."""
    # Type hierarchy (higher index = wider type)
    hierarchy = ['char', 'short', 'int', 'long', 'float', 'double']

    if expr_type == target_type:
        return 'none'  # No coercion needed

    expr_rank = hierarchy.index(expr_type)
    target_rank = hierarchy.index(target_type)

    if expr_rank < target_rank:
        return 'widen'   # Safe implicit conversion
    else:
        return 'narrow'  # Requires explicit cast (warning)


# Examples
print(coerce('int', 'float'))    # 'widen'
print(coerce('double', 'int'))   # 'narrow'
print(coerce('int', 'int'))      # 'none'
```

---

## Type Constructors

Complex types are built from simple types using **type constructors**:

### Array Types

$$\text{array}(T, n) = T[n]$$

```c
int arr[10];       // array(int, 10)
float matrix[3][3]; // array(array(float, 3), 3)
```

### Pointer Types

$$\text{pointer}(T) = T*$$

```c
int *p;            // pointer(int)
char **argv;       // pointer(pointer(char))
```

### Function Types

$$\text{function}(T_1, T_2, \ldots, T_n) \to T_r$$

```c
int add(int, int);  // function(int, int) → int
void print(char*);  // function(pointer(char)) → void
```

### Record (Struct) Types

$$\text{record}(f_1: T_1, f_2: T_2, \ldots)$$

```c
struct Point { int x; int y; };  // record(x: int, y: int)
```

---

## Type System Implementation

A simple type representation in Python:

```python
class Type:
    pass

class IntType(Type):
    def __repr__(self):
        return "int"

class FloatType(Type):
    def __repr__(self):
        return "float"

class BoolType(Type):
    def __repr__(self):
        return "bool"

class ArrayType(Type):
    def __init__(self, elem_type, size):
        self.elem_type = elem_type
        self.size = size

    def __repr__(self):
        return f"array({self.elem_type}, {self.size})"

class FuncType(Type):
    def __init__(self, param_types, return_type):
        self.param_types = param_types
        self.return_type = return_type

    def __repr__(self):
        params = ", ".join(str(p) for p in self.param_types)
        return f"({params}) -> {self.return_type}"

class PointerType(Type):
    def __init__(self, base_type):
        self.base_type = base_type

    def __repr__(self):
        return f"pointer({self.base_type})"


# Examples
t1 = ArrayType(IntType(), 10)
print(t1)  # array(int, 10)

t2 = FuncType([IntType(), IntType()], IntType())
print(t2)  # (int, int) -> int

t3 = PointerType(FloatType())
print(t3)  # pointer(float)
```

---

## Common Type System Errors

| Error | Example | Message |
|-------|---------|---------|
| Type mismatch | `int x = "hi"` | Cannot assign string to int |
| Undeclared type | `Foo x;` | Type 'Foo' not defined |
| Wrong arg count | `add(1,2,3)` | Expected 2 args, got 3 |
| Wrong arg type | `add(1,"x")` | Arg 2: expected int, got string |
| Invalid operation | `"a" * "b"` | No * operator for string |
| Incompatible return | `int f() { return "x"; }` | Cannot return string from int function |

---

## Exercises

**Exercise 1:** Classify these languages as static/dynamic and strong/weak:
- Haskell
- JavaScript
- C
- Python
- TypeScript
- Ruby

**Exercise 2:** For each expression, determine the result type (assuming C rules):

```c
3 + 4.0          // ?
'A' + 1          // ?
5 / 2            // ?
5.0 / 2          // ?
(3 > 2) && (1)   // ?
```

**Exercise 3:** Are these types structurally equivalent?

```c
struct A { int x; float y; };
struct B { int a; float b; };
struct C { float x; int y; };
```

**Exercise 4:** Write a function `can_assign(lhs_type, rhs_type)` that returns:
- `True` if assignment is valid without coercion
- `"coerce"` if valid with implicit widening
- `False` if invalid

**Exercise 5:** Given this type hierarchy, determine which implicit conversions are valid:

$$\text{byte} \to \text{short} \to \text{int} \to \text{long} \to \text{float} \to \text{double}$$

Which of these are valid? Which require explicit casts?
- `long → double`
- `double → int`
- `byte → float`
- `float → long`

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Type | Set of values + allowed operations |
| Static typing | Checked at compile time |
| Dynamic typing | Checked at runtime |
| Strong typing | No implicit conversions between unrelated types |
| Weak typing | Implicit conversions allowed |
| Structural equivalence | Same structure = same type |
| Nominal equivalence | Same name = same type |
| Widening | Safe implicit conversion (int → float) |
| Narrowing | Unsafe explicit cast (float → int) |

---

## Next Steps

In the next lesson, we'll implement a **Type Checker** — the compiler pass that traverses the AST and enforces all these type rules.
