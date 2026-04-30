---
title: Python Decorators
---

# Python Decorators

A **decorator** is a function (or class) that takes another function and returns a new one. They let you add behavior — logging, timing, caching, authentication — without modifying the original code.

You've already used decorators in this course: `@property`, `@staticmethod`, `@dataclass`, `@abstractmethod`.

## The simplest decorator

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@shout
def greet(name):
    return f"hello, {name}"

print(greet("ada"))      # HELLO, ADA
```

The line `@shout` is syntactic sugar for:

```python
def greet(name):
    return f"hello, {name}"
greet = shout(greet)
```

## What's happening, step by step

1. Python compiles `def greet(name): ...` — `greet` is a function.
2. Python sees `@shout` above it and immediately calls `shout(greet)`.
3. `shout` returns `wrapper`, which Python rebinds to the name `greet`.
4. Calling `greet("ada")` actually calls `wrapper("ada")`, which calls the original function and uppercases the result.

## Preserving metadata with `functools.wraps`

A naive wrapper hides the original function's name and docstring. Always use `@functools.wraps`:

```python
from functools import wraps

def shout(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

@shout
def greet(name):
    """Say hello."""
    return f"hello, {name}"

print(greet.__name__)     # 'greet' (not 'wrapper')
print(greet.__doc__)      # 'Say hello.'
```

## Decorators with arguments

When you want `@retry(times=3)`, you need a decorator _factory_ — a function that returns a decorator.

```python
from functools import wraps
import time

def retry(times=3, delay=0.1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=5, delay=0.5)
def fetch():
    ...
```

Three layers of nesting. Read it inside-out:

- `wrapper` is the new function call site.
- `decorator` takes the function and returns `wrapper`.
- `retry` takes the parameters and returns `decorator`.

## A timing decorator (a useful one to keep)

```python
import time
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed*1000:.2f} ms")
        return result
    return wrapper

@timed
def compute():
    return sum(i*i for i in range(1_000_000))

compute()
```

## Caching with `functools.lru_cache`

A built-in decorator that memoizes results. Brilliant for recursive or expensive pure functions:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

fib(100)        # near-instant
```

Without `lru_cache`, `fib(100)` is exponentially slow (≈ 10²⁰ calls).

## Stacking decorators

Decorators apply bottom-up:

```python
@timed
@retry(times=3)
def fetch(): ...
```

is equivalent to:

```python
fetch = timed(retry(times=3)(fetch))
```

So `retry` wraps the original function first, then `timed` wraps the retried version. Order matters.

## Class decorators

A decorator can be a class — its `__call__` runs in place of the original function:

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@CountCalls
def hi():
    print("hi")

hi(); hi(); hi()
print(hi.count)        # 3
```

You can also decorate **classes**:

```python
def add_repr(cls):
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class User:
    def __init__(self, name):
        self.name = name

print(User("Ada"))       # User(name='Ada')
```

`@dataclass` is a class decorator that does this and much more.

## When _not_ to use decorators

- When you only want the behaviour for one call. Just call the helper directly.
- When the wrapper has subtly different signature/return type — confusing for callers.
- When the side effect is hard to discover. A line of `@cache` can change runtime semantics dramatically.

Decorators are powerful — use them where they make recurring patterns vanish.

## Try it — a permission decorator

```python
from functools import wraps

current_user = {"name": "Ada", "is_admin": False}

def admin_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.get("is_admin"):
            raise PermissionError("admin only")
        return func(*args, **kwargs)
    return wrapper

@admin_only
def delete_database():
    print("boom")

try:
    delete_database()
except PermissionError as e:
    print("blocked:", e)
```

Output:

```
blocked: admin only
```
