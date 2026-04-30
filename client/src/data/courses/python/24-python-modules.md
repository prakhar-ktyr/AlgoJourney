---
title: Python Modules
---

# Python Modules

A **module** is just a `.py` file. Its top-level definitions (functions, classes, variables) become an importable namespace. A **package** is a folder of modules with an `__init__.py` (which can be empty).

## Importing the standard library

```python
import math
print(math.pi)             # 3.141592653589793
print(math.sqrt(16))       # 4.0
```

Or import specific names:

```python
from math import pi, sqrt
print(pi, sqrt(16))
```

Or rename on import:

```python
import numpy as np         # the famous alias
from math import sqrt as square_root
```

Avoid `from module import *` in real code — it pollutes your namespace and makes it unclear where names came from.

## Writing your own module

Create `mymath.py`:

```python
"""mymath.py — tiny math helpers."""

PI = 3.14159

def area(radius):
    return PI * radius * radius

def perimeter(radius):
    return 2 * PI * radius
```

In another file in the same folder:

```python
# main.py
import mymath

print(mymath.area(5))
print(mymath.PI)
```

Run `python3 main.py`. Python finds `mymath.py` because it's in the same directory.

## The `__name__ == "__main__"` idiom

When a module is imported, its top-level code runs. Sometimes you want code that only runs when the file is executed directly:

```python
# mymath.py

def area(radius):
    return 3.14159 * radius * radius

if __name__ == "__main__":
    # Quick smoke-test
    print(area(5))
```

- `python3 mymath.py` → runs the demo.
- `import mymath` from another file → demo is skipped.

This is a Python convention you'll see everywhere.

## Packages — directories of modules

```
mypackage/
    __init__.py
    geometry.py
    statistics.py
```

```python
import mypackage.geometry
from mypackage import statistics
from mypackage.geometry import area
```

`__init__.py` runs when the package is first imported. It can be empty, or it can re-export commonly used names:

```python
# mypackage/__init__.py
from .geometry import area, perimeter
from .statistics import mean, median
```

Now users can write `from mypackage import area` directly.

## Where Python looks for modules — `sys.path`

When you `import foo`, Python searches the directories in `sys.path`, in order:

1. The folder of the script you ran (or `""` for the REPL — current directory).
2. Directories in the `PYTHONPATH` environment variable.
3. Standard library locations.
4. Site-packages directories (where `pip` installs things).

```python
import sys
print(sys.path)
```

If a module isn't found, you get `ModuleNotFoundError`.

## Relative vs absolute imports (inside packages)

Inside a package, you can write **absolute** imports:

```python
from mypackage.geometry import area
```

…or **relative** imports using dots:

```python
from .geometry import area      # same package
from ..utils import helper      # one level up
```

Relative imports only work inside packages, not at the top of a script you run directly.

## Inspecting a module

```python
import math

dir(math)            # list of names defined in math
help(math.sqrt)      # docstring + signature
math.__file__        # path to the source file
math.__name__        # 'math'
```

## Common standard library modules

You'll meet most of these later, but here's the lay of the land:

| Module                                                          | What it does                         |
| --------------------------------------------------------------- | ------------------------------------ |
| `os`, `sys`, `pathlib`                                          | OS, interpreter, file paths          |
| `math`, `random`, `statistics`, `decimal`, `fractions`          | Numerics                             |
| `datetime`, `time`, `calendar`, `zoneinfo`                      | Dates & times                        |
| `json`, `csv`, `xml`, `pickle`                                  | Data formats                         |
| `re`                                                            | Regular expressions                  |
| `collections`, `itertools`, `functools`                         | Data structures & functional helpers |
| `subprocess`, `shutil`, `glob`                                  | Shell-style operations               |
| `urllib`, `http`, `socket`                                      | Networking                           |
| `threading`, `multiprocessing`, `asyncio`, `concurrent.futures` | Concurrency                          |
| `unittest`, `doctest`                                           | Testing                              |
| `logging`                                                       | Logging                              |
| `argparse`                                                      | Command-line interfaces              |
| `typing`, `dataclasses`, `enum`                                 | Typing & data classes                |

## Try it

Create two files in the same folder:

```python
# greet.py
def hello(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(hello("module"))
```

```python
# main.py
from greet import hello
print(hello("import"))
```

Run:

```bash
$ python3 greet.py
Hello, module!
$ python3 main.py
Hello, import!
```

Same code, two ways to invoke it.
