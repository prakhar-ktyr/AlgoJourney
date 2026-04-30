---
title: Python Numbers
---

# Python Numbers

Python has three numeric types: `int`, `float`, and `complex`.

```python
n = 42        # int      — whole number
x = 3.14      # float    — real number
z = 2 + 3j    # complex  — real + imaginary part (note `j`, not `i`)
```

## `int` — arbitrary precision integers

This is one of Python's superpowers: integers have **no fixed size**. They grow as large as you need.

```python
>>> 2 ** 100
1267650600228229401496703205376
>>> import math
>>> math.factorial(50)
30414093201713378043612608166064768844377641568960512000000000000
```

In C, `2**100` would overflow a 64-bit integer instantly. In Python it just works. The trade-off is that big-int math is slower than fixed-size math — fine for most code, occasionally relevant in tight loops.

### Integer literals in different bases

| Prefix      | Base | Example  | Value |
| ----------- | ---- | -------- | ----- |
| (none)      | 10   | `255`    | 255   |
| `0b` / `0B` | 2    | `0b1010` | 10    |
| `0o` / `0O` | 8    | `0o17`   | 15    |
| `0x` / `0X` | 16   | `0xff`   | 255   |

Underscores improve readability (Python ignores them):

```python
billion = 1_000_000_000
mac_addr = 0x_AA_BB_CC_DD_EE_FF
```

## `float` — IEEE 754 double precision

Floats are 64-bit doubles, the same as `double` in C. About 15–17 significant decimal digits.

```python
x = 3.14
y = 2.5e3        # 2500.0  (scientific)
z = 1.5e-4       # 0.00015
inf = float("inf")
nan = float("nan")
```

### The classic floating-point trap

```python
>>> 0.1 + 0.2
0.30000000000000004
```

This is **not a Python bug** — it's how binary floating-point works. `0.1` cannot be represented exactly in binary, just like `1/3` cannot in decimal. Never compare floats with `==`; use `math.isclose`:

```python
import math
math.isclose(0.1 + 0.2, 0.3)   # True
```

For exact decimal arithmetic (money!), use `decimal.Decimal`:

```python
from decimal import Decimal
Decimal("0.1") + Decimal("0.2")     # Decimal('0.3')
```

For exact ratios, use `fractions.Fraction`:

```python
from fractions import Fraction
Fraction(1, 3) + Fraction(1, 6)     # Fraction(1, 2)
```

## `complex` — real + imaginary

Mostly used for engineering and signal processing.

```python
z = 2 + 3j
z.real        # 2.0
z.imag        # 3.0
abs(z)        # 3.605551... (magnitude)
```

You'll rarely need `complex` unless you're doing scientific work.

## Arithmetic operators

| Op   | Meaning            | `7 op 2` |
| ---- | ------------------ | -------- |
| `+`  | add                | `9`      |
| `-`  | subtract           | `5`      |
| `*`  | multiply           | `14`     |
| `/`  | true divide        | `3.5`    |
| `//` | floor divide       | `3`      |
| `%`  | modulo (remainder) | `1`      |
| `**` | power              | `49`     |

`/` always returns a `float`, even when the operands are ints. Use `//` when you want integer division.

```python
7 / 2          # 3.5
7 // 2         # 3
-7 // 2        # -4   (floors *toward negative infinity*)
```

## Useful built-ins

```python
abs(-5)          # 5
round(3.7)       # 4
round(2.675, 2)  # 2.67  (banker's rounding — see math.fsum, decimal for exact)
min(3, 1, 4)     # 1
max(3, 1, 4)     # 4
sum([1, 2, 3])   # 6
pow(2, 10)       # 1024  (same as 2 ** 10; pow(b,e,m) does modular exponentiation)
divmod(17, 5)    # (3, 2)  — quotient and remainder in one call
```

## The `math` module

For anything beyond basic arithmetic, import `math`:

```python
import math

math.pi              # 3.141592653589793
math.e               # 2.718281828459045
math.sqrt(16)        # 4.0
math.log(100, 10)    # 2.0
math.sin(math.pi/2)  # 1.0
math.factorial(6)    # 720
math.gcd(12, 18)     # 6
math.floor(3.7)      # 3
math.ceil(3.2)       # 4
```

For random numbers, `import random`. For statistics, `import statistics`. We'll cover the standard library more broadly later.

## Type conversion

```python
int(3.9)        # 3   (truncates toward zero)
int("42")       # 42
int("0x1f", 16) # 31
float(2)        # 2.0
float("inf")    # inf
complex(3, 4)   # (3+4j)
```

A non-numeric string raises `ValueError`:

```python
int("abc")      # ValueError: invalid literal for int() with base 10
```

## Try it

```python
import math

radius = 5
area = math.pi * radius ** 2
print(f"Area of a circle with radius {radius} is {area:.2f}")
```

Output:

```
Area of a circle with radius 5 is 78.54
```

The `:.2f` inside the f-string formats the float to two decimal places — we'll meet many more format specifiers in the strings lesson.
