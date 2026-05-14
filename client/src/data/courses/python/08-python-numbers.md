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

## `int` — integers with no fixed size

This is one of Python's superpowers: integers have **no fixed size**. They grow as large as you need. You may also hear this called **arbitrary precision**, which just means Python keeps expanding the number instead of overflowing at a fixed limit.

```python
>>> 2 ** 100
1267650600228229401496703205376
>>> import math
>>> math.factorial(50)
30414093201713378043612608166064768844377641568960512000000000000
```

In C, `2**100` would overflow a 64-bit integer instantly. In Python it just works. The trade-off is that big-int math is slower than fixed-size math — fine for most code, occasionally relevant in tight loops.

### Integer literals in different bases

By default, Python reads integer literals in **base 10** (the normal counting system most people use every day). You can also write integers in other bases by adding a prefix.

| Prefix      | Base | Example  | Value |
| ----------- | ---- | -------- | ----- |
| (none)      | 10   | `255`    | 255   |
| `0b` / `0B` | 2    | `0b1010` | 10    |
| `0o` / `0O` | 8    | `0o17`   | 15    |
| `0x` / `0X` | 16   | `0xff`   | 255   |

These are just different ways to write the **same kind of integer**. Python stores the value as a normal number either way.

:::details How do these values become 10, 15, and 255?
**Base** means how many digits a number system uses before moving to the next place value.

- Base 10 uses `0` to `9`.
- Base 2 uses only `0` and `1`.
- Base 8 uses `0` to `7`.
- Base 16 uses `0` to `9` and `a` to `f`, where `a = 10`, `b = 11`, ..., `f = 15`.

Each digit's position is worth a power of the base:

```text
0b1010 = 1×2^3 + 0×2^2 + 1×2^1 + 0×2^0 = 8 + 0 + 2 + 0 = 10
0o17   = 1×8^1 + 7×8^0                     = 8 + 7         = 15
0xff   = 15×16^1 + 15×16^0                 = 240 + 15      = 255
```

So these lines all create the same value:

```python
a = 10
b = 0b1010

print(a == b)   # True
```
:::

Underscores improve readability (Python ignores them):

```python
billion = 1_000_000_000
mac_addr = 0x_AA_BB_CC_DD_EE_FF
```

## `float` — decimal numbers (double precision)

Python stores floats in a standard 64-bit format called **double precision** (the same basic idea as `double` in C). In practice, think of them as numbers that handle decimal-style values well most of the time, with about 15–17 reliable digits.

```python
x = 3.14
y = 2.5e3        # 2500.0  (scientific)
z = 1.5e-4       # 0.00015
inf = float("inf")
nan = float("nan")
```

`2.5e3` is scientific notation and means $2.5 \times 10^3 = 2500.0$. `1.5e-4` means $1.5 \times 10^{-4} = 0.00015$.

`inf` means **infinity** — a value larger than any normal finite float. `nan` means **not a number** — a special value used when a numeric result is undefined or invalid.

:::details When would you see `inf` or `nan`?
You will not use these every day, but it is useful to recognize them when they appear.

- `inf` is often used as a starting value or sentinel when you want "bigger than everything else."
- `nan` can appear when a calculation has no meaningful numeric answer.

```python
float("inf") > 10**100      # True
float("nan") == float("nan")   # False
```

That second line is surprising the first time you see it: `nan` does not compare equal to anything, including itself.
:::

### The classic floating-point trap

```python
>>> 0.1 + 0.2
0.30000000000000004
```

This is **not a Python bug** — it's how binary floating-point works. Computers store normal floats in **base 2** (binary), not base 10. That means many everyday decimal numbers such as `0.1`, `0.2`, and `0.3` cannot be stored exactly; Python stores the **closest available float** instead.

That is similar to how decimal cannot store `1/3` exactly. In decimal, you write `0.333333...`; in binary, numbers like `0.1` end up as a long repeating fraction too.

:::details The stored values behind these comparisons
Two different things are happening:

1. Python stores a nearby binary approximation, not the exact real-number value.
2. The REPL prints a short decimal form that round-trips back to that same stored float.

If you ask for more digits, you can see the stored approximations more clearly:

```python
format(0.3, ".17f")          # '0.29999999999999999'
format(0.1 + 0.2, ".17f")    # '0.30000000000000004'

format(0.4, ".17f")          # '0.40000000000000002'
format(0.1 + 0.3, ".17f")    # '0.40000000000000002'

format(0.5, ".17f")          # '0.50000000000000000'
format(0.1 + 0.4, ".17f")    # '0.50000000000000000'
```

So:

- `0.1 + 0.2 == 0.3` is `False` because they land on **different nearby floats**.
- `0.1 + 0.3 == 0.4` is `True` because both sides land on the **same nearby float**.
- `0.1 + 0.4 == 0.5` is also `True`, and `0.5` is especially nice because $0.5 = 1/2$, which binary can store exactly.

The lesson: some float results only **look** exact when printed. For computed decimal-style values, compare with `math.isclose()` instead of `==`.
:::

Never compare computed floats with `==` when you mean "numerically close"; use `math.isclose`:

```python
import math
math.isclose(0.1 + 0.2, 0.3)   # True
```

For exact decimal arithmetic — money, prices, taxes — use `decimal.Decimal`. Always pass the number as a **string**; if you pass a float, the precision is already lost before `Decimal` even sees it:

```python
from decimal import Decimal

total = Decimal("0.1") + Decimal("0.2")
print(total)                   # 0.3   ← exact, not 0.30000000000000004

price = Decimal("9.99")
tax   = Decimal("0.08")
print(price + price * tax)     # 10.7892

# String vs float — the difference:
print(Decimal("0.1"))          # 0.1   ← exact
print(Decimal(0.1))            # 0.1000000000000000055511...  ← float imprecision
```

`print` shows just the number — no `Decimal(...)` wrapper around it.

For exact fractions, use `fractions.Fraction`. `print` shows the result as a fraction, not a float:

```python
from fractions import Fraction

result = Fraction(1, 3) + Fraction(1, 6)
print(result)                              # 1/2

# Compare float vs Fraction on a sum that cannot be exact:
print(1/3 + 1/7)                           # 0.4761904761904762  ← approximate
print(Fraction(1, 3) + Fraction(1, 7))     # 10/21  ← exact
```

You rarely need `Fraction` in everyday code. It is most useful when exact ratios matter more than speed.

## `complex` — real + imaginary

Mostly used for engineering and signal processing.

```python
z = 2 + 3j
z.real        # 2.0
z.imag        # 3.0
abs(z)        # 3.605551... (magnitude)
```

`abs(z)` gives the **magnitude** — the straight-line distance from zero to the point `(real, imag)` on a 2D plane. It is calculated as $\sqrt{a^2 + b^2}$, so for `2 + 3j` that is $\sqrt{2^2 + 3^2} = \sqrt{13} \approx 3.605551$.

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

Modulo (`%`) gives the remainder, and the result always has the **same sign as the divisor** (the number on the right):

```python
7 % 2          # 1
-7 % 2         # 1    (divisor is positive, so remainder is positive)
7 % -2         # -1   (divisor is negative, so remainder is negative)
```

This trips up people coming from C or Java, where `-7 % 2` would be `-1`. Python’s rule is consistent with its floor division: `-7 = (-4 × 2) + 1`, so the remainder is `1`.

## Useful built-ins

```python
abs(-5)          # 5
round(3.7)       # 4
round(2.675, 2)  # 2.67  (floating-point can't store 2.675 exactly — use decimal for precise rounding)
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
int("0x1f", 16) # 31  (second arg is the base — reads "1f" as hexadecimal)
float(2)        # 2.0
float("inf")    # inf
complex(3, 4)   # (3+4j)
```

A non-numeric string raises `ValueError`:

```python
int("abc")      # ValueError: invalid literal for int() with base 10
```

The casting lesson covers conversions for all types — strings, booleans, collections — in full.

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
