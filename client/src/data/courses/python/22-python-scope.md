---
title: Python Scope
---

# Python Scope

**Scope** is the region of a program where a name is visible. Python has four scopes, summarized by the acronym **LEGB** — the order Python searches when it sees a name.

| Letter | Scope         | Example                                |
| ------ | ------------- | -------------------------------------- |
| **L**  | **Local**     | inside the current function            |
| **E**  | **Enclosing** | enclosing function, for nested defs    |
| **G**  | **Global**    | top level of the current module        |
| **B**  | **Built-in**  | the always-available `len`, `print`, … |

## Local vs global

A name created inside a function is **local** to that function — it disappears when the function returns.

```python
x = "global"

def f():
    x = "local"
    print(x)         # 'local'

f()
print(x)             # 'global' — unchanged
```

The function's `x` is a separate, local variable.

## Reading a global is fine

```python
greeting = "Hello"

def greet(name):
    return f"{greeting}, {name}!"

greet("Ada")      # 'Hello, Ada!'
```

Python looks up `greeting` locally, doesn't find it, walks out to the module level, and finds it there.

## Writing a global needs `global`

The moment you assign to a name inside a function, Python treats it as local for the entire function. To assign to a module-level name from inside a function, declare it `global`:

```python
counter = 0

def bump():
    global counter
    counter += 1

bump(); bump()
print(counter)        # 2
```

Without `global`, the `counter += 1` line is `counter = counter + 1`, which reads a not-yet-defined local — `UnboundLocalError`.

> Heavy use of `global` is a code smell. Pass values in and return values out.

## Enclosing scope and `nonlocal`

Functions can be nested. Inner functions see (read) variables of their enclosing function — that's the **enclosing** scope:

```python
def outer():
    msg = "hi"

    def inner():
        print(msg)     # reads `msg` from outer

    inner()

outer()                 # hi
```

To **assign** to an enclosing variable (not the global), use `nonlocal`:

```python
def make_counter():
    count = 0

    def bump():
        nonlocal count
        count += 1
        return count

    return bump

c = make_counter()
c(); c(); c()           # → 3
```

`make_counter` returns a function that _closes over_ `count` — a **closure**.

## Built-in scope

Names like `print`, `len`, `range`, `dict`, `Exception` live in the built-in module and are always available. Don't shadow them:

```python
list = [1, 2, 3]
list("abc")        # TypeError — you shadowed the type!
```

## A nested example

```python
x = "global"

def outer():
    x = "outer"

    def inner():
        x = "inner"
        print("inner sees:", x)

    inner()
    print("outer sees:", x)

outer()
print("module sees:", x)
```

Output:

```
inner sees: inner
outer sees: outer
module sees: global
```

## Comprehensions have their own scope

The loop variable in a `[x for x in ...]` does **not** leak out:

```python
squares = [x * x for x in range(5)]
print(x)            # NameError
```

In Python 2 it did leak — Python 3 fixed this.

## Modules are scopes too

Each `.py` file is its own namespace. To see another module's globals, you `import` it.

```python
# config.py
HOST = "localhost"

# main.py
import config
print(config.HOST)
```

We have a full lesson on modules next.

## Best practices

- Prefer passing values in and returning them out over `global`.
- If you need shared mutable state, wrap it in a class, not a global.
- Don't shadow built-ins (`list`, `dict`, `id`, `type`, `sum`, `input`, `open`).
- Use `nonlocal` only for genuine closures (counters, accumulators, decorators).

## Try it

```python
def bank_account(balance=0):
    def deposit(amount):
        nonlocal balance
        balance += amount
        return balance

    def withdraw(amount):
        nonlocal balance
        if amount > balance:
            raise ValueError("insufficient funds")
        balance -= amount
        return balance

    return deposit, withdraw

dep, wd = bank_account(100)
print(dep(50))      # 150
print(wd(30))       # 120
```
