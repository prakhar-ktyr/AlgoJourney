---
title: Generating IR for Functions
---

# Generating IR for Functions

Functions are a fundamental building block of programs. Translating function definitions and calls into intermediate representation (IR) requires handling parameters, local variables, return values, and control transfer.

---

## Function Definitions in IR

When we encounter a function definition, we generate:

1. **A label** marking the function entry point
2. **Parameter receiving** instructions
3. **Body** translated to TAC
4. **Return** instruction with optional value

### TAC for a Simple Function

```c
int square(int x) {
    return x * x;
}
```

Generated TAC:

```
func_begin square
    param x
    t1 = x * x
    return t1
func_end square
```

The `func_begin` and `func_end` markers define the function boundary. The `param` instruction declares a formal parameter.

---

## Function Calls in IR

A function call involves:

1. **Evaluate arguments** (left to right or right to left, depending on convention)
2. **Pass arguments** to the callee
3. **Transfer control** to the function
4. **Receive return value**

### TAC for a Function Call

```c
int result = square(5);
```

Generated TAC:

```
arg 5
t1 = call square, 1
result = t1
```

Here:
- `arg 5` pushes argument onto the argument list
- `call square, 1` calls `square` with 1 argument
- The return value is stored in `t1`

---

## Multiple Arguments

```c
int add(int a, int b) {
    return a + b;
}

int main() {
    int x = add(3, 4);
}
```

Generated TAC:

```
func_begin add
    param a
    param b
    t1 = a + b
    return t1
func_end add

func_begin main
    arg 3
    arg 4
    t2 = call add, 2
    x = t2
func_end main
```

---

## Argument Evaluation Order

Arguments may contain expressions that need evaluation before the call:

```c
int r = add(2 + 3, square(4));
```

TAC:

```
t1 = 2 + 3
arg 4
t2 = call square, 1
arg t1
arg t2
t3 = call add, 2
r = t3
```

Notice that all arguments are fully evaluated before being passed.

---

## Parameter Passing Mechanisms

### Pass by Value

The callee receives a **copy** of the argument. Modifications inside the function do not affect the caller's variable.

```c
void increment(int x) {
    x = x + 1;  // Only local copy changes
}
```

TAC:

```
func_begin increment
    param x
    t1 = x + 1
    x = t1
func_end increment
```

The caller's original value remains unchanged.

### Pass by Reference

The callee receives the **address** of the argument. Modifications affect the original variable.

```c
void increment(int *px) {
    *px = *px + 1;
}

void caller() {
    int a = 5;
    increment(&a);  // a becomes 6
}
```

TAC:

```
func_begin increment
    param px
    t1 = *px
    t2 = t1 + 1
    *px = t2
func_end increment

func_begin caller
    a = 5
    t3 = &a
    arg t3
    call increment, 1
func_end caller
```

The `&` operator takes an address, and `*` dereferences it.

---

## Nested Function Calls

```c
int f(int x) { return x + 1; }
int g(int x) { return x * 2; }

int main() {
    int r = f(g(3));
}
```

TAC:

```
func_begin main
    arg 3
    t1 = call g, 1
    arg t1
    t2 = call f, 1
    r = t2
func_end main
```

Inner calls are evaluated first, and their results become arguments to outer calls.

---

## Recursive Functions

```c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

TAC:

```
func_begin factorial
    param n
    if n <= 1 goto L1
    goto L2
L1: return 1
L2: t1 = n - 1
    arg t1
    t2 = call factorial, 1
    t3 = n * t2
    return t3
func_end factorial
```

Each recursive call creates a new activation record on the stack (covered in detail in a later lesson).

---

## Activation Records Preview

Every function call creates an **activation record** (stack frame) containing:

| Component | Purpose |
|-----------|---------|
| Return address | Where to resume after call |
| Parameters | Passed argument values |
| Local variables | Function's own variables |
| Temporaries | Compiler-generated temps |
| Saved registers | Caller/callee saved registers |
| Return value | Space for result |

The stack grows with each call and shrinks on return:

```
┌─────────────────┐  ← Stack top
│ factorial(1)    │
├─────────────────┤
│ factorial(2)    │
├─────────────────┤
│ factorial(3)    │
├─────────────────┤
│ main()          │
└─────────────────┘  ← Stack bottom
```

We will explore activation records and runtime environments in detail in a later lesson.

---

## Void Functions

Functions that don't return a value:

```c
void printSum(int a, int b) {
    int s = a + b;
    printf("%d\n", s);
}
```

TAC:

```
func_begin printSum
    param a
    param b
    t1 = a + b
    s = t1
    arg s
    call printf, 1
func_end printSum
```

A void function has no `return <value>` — it may have a bare `return` or just falls through to `func_end`.

---

## Functions Returning Structures

When a function returns a large structure, the caller typically passes a hidden pointer:

```c
struct Point makePoint(int x, int y) {
    struct Point p;
    p.x = x;
    p.y = y;
    return p;
}
```

Compiler may transform this to:

```
func_begin makePoint
    param _ret_ptr    // hidden pointer to caller's space
    param x
    param y
    _ret_ptr.x = x
    _ret_ptr.y = y
func_end makePoint
```

---

## Complete Example

```c
int max(int a, int b) {
    if (a > b) return a;
    else return b;
}

int main() {
    int x = 10, y = 20;
    int m = max(x, y);
    return m;
}
```

Full TAC:

```
func_begin max
    param a
    param b
    if a > b goto L1
    goto L2
L1: return a
L2: return b
func_end max

func_begin main
    x = 10
    y = 20
    arg x
    arg y
    t1 = call max, 2
    m = t1
    return m
func_end main
```

---

## Summary

| Concept | TAC Construct |
|---------|---------------|
| Function start | `func_begin name` |
| Function end | `func_end name` |
| Declare parameter | `param x` |
| Push argument | `arg expr` |
| Call function | `t = call func, n` |
| Return value | `return expr` |
| Return void | `return` (or fall through) |

---

## Exercises

1. **Translate to TAC:**
   ```c
   int multiply(int a, int b) {
       return a * b;
   }
   int main() {
       int r = multiply(6, 7);
   }
   ```

2. **Translate to TAC** (nested calls):
   ```c
   int double(int x) { return x * 2; }
   int add(int a, int b) { return a + b; }
   int main() {
       int r = add(double(3), double(5));
   }
   ```

3. **Write TAC** for a recursive Fibonacci function:
   ```c
   int fib(int n) {
       if (n <= 1) return n;
       return fib(n-1) + fib(n-2);
   }
   ```

4. **Pass by reference**: Write TAC for a `swap` function that exchanges two integers via pointers.

5. **Draw the call stack** (activation records) for `factorial(4)` at the moment `factorial(1)` is executing.

6. **Explain** why the compiler must evaluate all arguments before making the `call` instruction. What could go wrong if arguments were evaluated interleaved with the call?
