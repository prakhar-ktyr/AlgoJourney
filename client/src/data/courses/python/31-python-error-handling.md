---
title: Python Error Handling
---

# Python Error Handling

When something goes wrong, Python raises an **exception**. By default, an unhandled exception prints a traceback and exits the program. With `try`/`except`, you can catch and recover.

```python
try:
    n = int(input("Enter a number: "))
    print(10 / n)
except ValueError:
    print("That wasn't a number.")
except ZeroDivisionError:
    print("Can't divide by zero.")
```

## The full `try` form

```python
try:
    risky_operation()
except SpecificError as e:
    handle(e)              # one or more of these
except (ErrorA, ErrorB):
    handle_either()
else:
    success_path()         # runs only if no exception
finally:
    cleanup()              # always runs
```

- `try` — code that might fail.
- `except` — handler. You can have several. Order matters: more specific first.
- `as e` — bind the exception object to `e` so you can read its message or attributes.
- `else` — runs if no exception was raised. Useful when you want the success path _outside_ the `try` so you don't accidentally catch its exceptions.
- `finally` — runs whether or not an exception happened. Use it for cleanup that must happen (closing files, releasing locks).

## Catch specifically, not broadly

The biggest beginner mistake is `except:` or `except Exception:` — it hides bugs.

```python
# BAD — swallows every error, including typos
try:
    do_something()
except:
    pass

# GOOD — only the error you actually expect
try:
    n = int(s)
except ValueError:
    n = 0
```

`except Exception` is occasionally OK at the top of a program (logging + re-raise), but never inside library code.

## The exception hierarchy

All exceptions inherit from `BaseException`. The "you should usually catch these" subclass is `Exception`.

```
BaseException
 ├── SystemExit            ← from sys.exit()
 ├── KeyboardInterrupt     ← Ctrl+C
 └── Exception
      ├── ArithmeticError
      │    ├── ZeroDivisionError
      │    └── OverflowError
      ├── LookupError
      │    ├── KeyError
      │    └── IndexError
      ├── ValueError
      ├── TypeError
      ├── AttributeError
      ├── FileNotFoundError
      ├── OSError
      ├── ImportError
      └── ... many more
```

Catch the highest level you can meaningfully handle. `except OSError` catches every filesystem/network error; `except FileNotFoundError` is the precise version.

## Raising exceptions

Use `raise` to signal an error from your own code:

```python
def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must be non-negative")
    if amount > balance:
        raise ValueError(f"can't withdraw {amount} from {balance}")
    return balance - amount
```

Pick a built-in exception when one fits. The most-used:

| Exception             | When                                          |
| --------------------- | --------------------------------------------- |
| `ValueError`          | argument has the right type but a wrong value |
| `TypeError`           | argument has the wrong type                   |
| `KeyError`            | dict missing a key                            |
| `IndexError`          | sequence index out of range                   |
| `FileNotFoundError`   | file doesn't exist                            |
| `RuntimeError`        | generic "something went wrong"                |
| `NotImplementedError` | abstract method placeholder                   |

## Custom exceptions

Subclass `Exception` for domain-specific errors:

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, requested):
        super().__init__(f"need {requested}, have {balance}")
        self.balance = balance
        self.requested = requested

try:
    raise InsufficientFundsError(50, 200)
except InsufficientFundsError as e:
    print(e)              # need 200, have 50
    print(e.balance)      # 50
```

Custom exceptions make `try`/`except` blocks self-documenting and let callers handle each kind separately.

## Re-raising and chaining

```python
try:
    parse(data)
except ValueError as e:
    raise RuntimeError("config file is corrupt") from e
```

`raise NewError(...) from original` preserves the original traceback as the _cause_. The user sees both:

```
ValueError: invalid syntax
The above exception was the direct cause of the following exception:
RuntimeError: config file is corrupt
```

To re-raise _the same_ exception unchanged: bare `raise`.

```python
try:
    work()
except Exception:
    log_it()
    raise           # re-raise the same exception
```

## `finally` and resource cleanup

```python
f = open("data.txt")
try:
    process(f)
finally:
    f.close()
```

But the **`with` statement** (context manager) is the modern, less-error-prone equivalent:

```python
with open("data.txt") as f:
    process(f)
# f is closed automatically, even on exception
```

We'll use `with` constantly in the file-handling lesson.

## `assert` — sanity checks, not error handling

```python
def split_users(users):
    assert isinstance(users, list), "users must be a list"
    ...
```

`assert` raises `AssertionError` if the condition is false. **Important:** `python -O` disables all asserts. Use them for "this should never happen" debugging checks, **not** for validating user input.

## Exception groups (Python 3.11+)

When concurrent code (e.g. `asyncio.gather`) raises multiple errors at once, they come bundled in an `ExceptionGroup`:

```python
try:
    raise ExceptionGroup("multi", [ValueError("a"), TypeError("b")])
except* ValueError as eg:
    print("caught value errors:", eg.exceptions)
except* TypeError as eg:
    print("caught type errors:", eg.exceptions)
```

You'll mainly see this in async / parallel code.

## Try it

```python
def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return None
    except TypeError:
        raise ValueError(f"both args must be numbers: {a!r}, {b!r}")
    else:
        return result

print(safe_divide(10, 2))     # 5.0
print(safe_divide(10, 0))     # None
try:
    safe_divide(10, "x")
except ValueError as e:
    print("caught:", e)
```
