---
title: Python Testing
---

# Python Testing

Tests turn "I think it works" into "I know it works, and so will you in six months." Python ships with `unittest`, but the de-facto industry standard is **`pytest`** — it's shorter, friendlier, and works with `unittest`-style tests too.

## Setup

```bash
python3 -m pip install pytest
```

By convention, tests live in files named `test_*.py` next to your code or in a `tests/` directory.

## Your first test

```python
# math_utils.py
def add(a, b):
    return a + b
```

```python
# test_math_utils.py
from math_utils import add

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negatives():
    assert add(-1, -2) == -3
```

Run:

```bash
$ pytest
============== test session starts ==============
collected 2 items

test_math_utils.py ..                      [100%]

============== 2 passed in 0.01s ================
```

That's it. No imports, no special classes — pytest auto-discovers `test_*` functions.

## Useful flags

| Flag                               | Effect                               |
| ---------------------------------- | ------------------------------------ |
| `pytest -v`                        | verbose: show each test name         |
| `pytest -k name`                   | only tests whose name matches `name` |
| `pytest path/to/test.py::test_one` | a single test                        |
| `pytest -x`                        | stop at first failure                |
| `pytest --lf`                      | only re-run last-failed tests        |
| `pytest -q`                        | quiet output                         |
| `pytest --pdb`                     | drop into the debugger on failure    |

## Assertions

Plain `assert` is enough — pytest rewrites failing assertions to print the values involved:

```
>       assert add(2, 3) == 6
E       assert 5 == 6
E        +  where 5 = add(2, 3)
```

For floats use `pytest.approx`:

```python
import pytest

def test_pi():
    assert 22 / 7 == pytest.approx(3.14, rel=0.01)
```

## Testing exceptions

```python
import pytest

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        1 / 0

def test_message():
    with pytest.raises(ValueError, match="must be non-negative"):
        sqrt(-1)
```

## Parameterized tests

DRY out repetitive cases:

```python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (10, -3, 7),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

Each tuple becomes a separate test — you'll see four results in the output.

## Fixtures

A **fixture** is a reusable piece of test setup, declared with `@pytest.fixture`:

```python
import pytest

@pytest.fixture
def user():
    return {"name": "Ada", "age": 36}

def test_name(user):
    assert user["name"] == "Ada"

def test_age(user):
    assert user["age"] >= 18
```

Pytest sees the parameter name `user`, finds the fixture, calls it, and passes the result.

### Setup + teardown with `yield`

```python
@pytest.fixture
def temp_file(tmp_path):
    file = tmp_path / "data.txt"
    file.write_text("hello")
    yield file                # ← test runs here
    # any cleanup after yield runs after the test

def test_read(temp_file):
    assert temp_file.read_text() == "hello"
```

`tmp_path` is a built-in fixture that gives you a fresh temp directory.

### Built-in fixtures worth knowing

| Fixture            | What it gives you                             |
| ------------------ | --------------------------------------------- |
| `tmp_path`         | a `Path` to a fresh temp directory            |
| `tmp_path_factory` | session-wide temp dir factory                 |
| `monkeypatch`      | safely set / unset env vars, attributes, etc. |
| `capsys`, `capfd`  | capture `print`/stdout/stderr                 |
| `caplog`           | capture log records                           |

```python
def test_capture(capsys):
    print("hi")
    captured = capsys.readouterr()
    assert captured.out == "hi\n"

def test_env(monkeypatch):
    monkeypatch.setenv("FOO", "bar")
    assert os.environ["FOO"] == "bar"
    # FOO is automatically removed after the test
```

## Mocking

For replacing a function or method during a test:

```python
from unittest.mock import patch

def test_fetch_calls_api():
    with patch("mymodule.requests.get") as mock_get:
        mock_get.return_value.json.return_value = {"ok": True}
        result = mymodule.fetch()
        assert result == {"ok": True}
        mock_get.assert_called_once_with("https://api.example.com/data")
```

A common trap: `patch("mymodule.requests.get")` patches the _imported_ name in `mymodule`, not the original `requests` module. Mock where the function is _used_.

## Coverage

```bash
pip install coverage
coverage run -m pytest
coverage report
coverage html        # nice browsable report
```

Aim for high coverage on critical paths, not 100% on everything.

## Structuring a project

```
myproject/
    pyproject.toml
    src/
        myproject/
            __init__.py
            math_utils.py
    tests/
        test_math_utils.py
```

Run from the project root: `pytest`. Configure pytest in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q"
```

## Property-based testing — `hypothesis`

Beyond example-based tests, `hypothesis` generates many random inputs to find edge cases:

```python
# pip install hypothesis
from hypothesis import given, strategies as st

@given(st.integers(), st.integers())
def test_addition_is_commutative(a, b):
    assert a + b == b + a
```

`hypothesis` will try thousands of integer pairs and shrink any failures down to a minimal reproducer. Eye-opening for math-heavy code.

## A test-writing checklist

1. **One assertion per concept.** A test is a documented expectation.
2. **Descriptive names.** `test_add_returns_sum_for_two_positives` beats `test_1`.
3. **Arrange / Act / Assert.** Set up state, call the thing, check the result.
4. **Test the public interface, not internals.** Refactoring shouldn't break tests.
5. **Make tests independent.** Order should not matter.
6. **Run tests fast.** Mock the network, the filesystem, and time.

## Try it

```python
# fizzbuzz.py
def fizzbuzz(n):
    if n % 15 == 0: return "FizzBuzz"
    if n % 3  == 0: return "Fizz"
    if n % 5  == 0: return "Buzz"
    return str(n)
```

```python
# test_fizzbuzz.py
import pytest
from fizzbuzz import fizzbuzz

@pytest.mark.parametrize("n, expected", [
    (1, "1"),
    (2, "2"),
    (3, "Fizz"),
    (5, "Buzz"),
    (15, "FizzBuzz"),
    (30, "FizzBuzz"),
])
def test_fizzbuzz(n, expected):
    assert fizzbuzz(n) == expected
```

```bash
$ pytest -v
test_fizzbuzz.py::test_fizzbuzz[1-1] PASSED
test_fizzbuzz.py::test_fizzbuzz[2-2] PASSED
test_fizzbuzz.py::test_fizzbuzz[3-Fizz] PASSED
test_fizzbuzz.py::test_fizzbuzz[5-Buzz] PASSED
test_fizzbuzz.py::test_fizzbuzz[15-FizzBuzz] PASSED
test_fizzbuzz.py::test_fizzbuzz[30-FizzBuzz] PASSED
```

## You did it

That's the end of the course. From `print("Hello, World!")` to async HTTP and parameterized tests — you now know enough Python to read most code in the wild and contribute your own.

What next?

- Build something. A scraper, a Discord bot, a tiny FastAPI service, a Django blog. Real projects teach what tutorials can't.
- Read other people's code. The CPython standard library is famously well-written.
- Pick one library deeply (NumPy, FastAPI, pytest, SQLAlchemy) and learn it inside out.
- Keep your tools sharp: `ruff` for linting, `black` for formatting, `mypy`/`pyright` for typing.

Happy hacking 🐍
