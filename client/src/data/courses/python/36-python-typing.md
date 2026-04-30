---
title: Python Type Hints
---

# Python Type Hints

Python is dynamically typed, but since 3.5 you can **annotate** the types you intend. The interpreter ignores them at runtime; tools like **mypy**, **pyright**, **pylint**, and your IDE use them to catch bugs and provide better completions.

Type hints are optional and gradual — annotate the parts of your code where they pay off.

## Basics

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

age: int = 36
pi: float = 3.14
is_admin: bool = False
nothing: None = None
```

The form is `name: TYPE` for variables and parameters, and `-> TYPE` for return values.

## Built-in generics (Python 3.9+)

For containers, you parameterize the type:

```python
names: list[str] = ["Ada", "Bo"]
ages:  dict[str, int] = {"Ada": 36}
point: tuple[float, float] = (3.0, 4.0)
unique: set[int] = {1, 2, 3}
```

In Python 3.8 and older you needed `from typing import List, Dict, Tuple, Set` — those still exist as aliases but the lowercase built-ins are now standard.

## Optional and union types

A value that may be `None`:

```python
def find_user(id: int) -> str | None:    # Python 3.10+
    ...

# Older equivalent
from typing import Optional
def find_user(id: int) -> Optional[str]:
    ...
```

Unions of multiple types:

```python
def parse(x: str | int) -> float:
    return float(x)
```

`X | None` is also called _Optional_. They mean the same thing; `| None` is the modern style.

## `Any` — opt out

```python
from typing import Any

def deserialize(data: bytes) -> Any:
    ...
```

`Any` disables checks. Use it when you genuinely don't know or don't care — but don't sprinkle it everywhere.

## Callable, Iterable, Iterator

```python
from collections.abc import Callable, Iterable, Iterator

def apply_to_all(items: Iterable[int], fn: Callable[[int], int]) -> list[int]:
    return [fn(x) for x in items]

def naturals() -> Iterator[int]:
    n = 1
    while True:
        yield n
        n += 1
```

`Callable[[ArgTypes], ReturnType]` describes a function signature.

## Type aliases

For complex types, give them a name:

```python
from typing import TypeAlias

UserId: TypeAlias = int
JsonDict: TypeAlias = dict[str, "Json"]
Json: TypeAlias = str | int | float | bool | None | list["Json"] | JsonDict

def get_user(uid: UserId) -> JsonDict: ...
```

In Python 3.12+, the `type` statement is even cleaner:

```python
type UserId = int
type JsonDict = dict[str, Json]
```

## Generic classes & functions

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

first([1, 2, 3])         # int
first(["a", "b"])        # str
```

Python 3.12+ has nicer syntax:

```python
def first[T](items: list[T]) -> T:
    return items[0]

class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()
```

## TypedDict — typed dicts for API payloads

When working with JSON-shaped dicts:

```python
from typing import TypedDict

class User(TypedDict):
    id: int
    name: str
    email: str

def send_email(u: User) -> None:
    print(f"To: {u['email']}")
```

Type checkers will warn if you pass the wrong shape.

## Protocol — structural typing

"Anything with a `.read()` method that returns `str`":

```python
from typing import Protocol

class SupportsRead(Protocol):
    def read(self) -> str: ...

def parse(source: SupportsRead) -> dict:
    return json.loads(source.read())
```

You don't need to inherit `SupportsRead` — any class with a matching `read` method satisfies it. Like Go interfaces.

## `Final` and `Literal`

```python
from typing import Final, Literal

MAX_RETRIES: Final = 5             # type checker warns if reassigned

Mode = Literal["r", "w", "a"]
def open_file(path: str, mode: Mode) -> None: ...
open_file("x.txt", "z")            # mypy error: invalid mode
```

## Running a type checker

```bash
pip install mypy
mypy src/
```

Or `pyright` (faster, used by VS Code's Python extension by default).

mypy will report things like:

```
src/main.py:7: error: Argument 1 to "greet" has incompatible type "int"; expected "str"
```

## Hints don't change runtime behavior

```python
def add(a: int, b: int) -> int:
    return a + b

add("hi", "world")     # works fine — returns 'hiworld'
```

Python won't enforce types unless you opt in with libraries like **`pydantic`** (popular for API validation):

```python
# pip install pydantic
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str

User(id="42", name="Ada")     # id is coerced to int — succeeds
User(id="oops", name="Ada")   # ValidationError
```

## When to add types

- **Always** on public APIs of a library — your users will thank you.
- **In function signatures** for any code that survives more than a week.
- **On complex local variables** the type checker can't infer.
- **Skip** trivial helpers and exploratory scripts.

Modern Python frameworks (FastAPI, SQLModel, Typer, Pydantic) use type hints not just for documentation but at runtime to validate, generate, and dispatch — knowing how to write them is a real skill.

## Try it

```python
def safe_divide(a: float, b: float) -> float | None:
    """Return a / b, or None if b is zero."""
    if b == 0:
        return None
    return a / b

result = safe_divide(10, 2)      # type checker knows this is float | None
if result is not None:
    print(result + 1)            # OK — result is now float here
```
