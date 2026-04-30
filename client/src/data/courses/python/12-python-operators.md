---
title: Python Operators
---

# Python Operators

We've already used most of these. This lesson is the consolidated reference.

## Arithmetic operators

| Op   | Meaning             | Example  | Result |
| ---- | ------------------- | -------- | ------ |
| `+`  | add                 | `5 + 2`  | `7`    |
| `-`  | subtract            | `5 - 2`  | `3`    |
| `*`  | multiply            | `5 * 2`  | `10`   |
| `/`  | true divide (float) | `5 / 2`  | `2.5`  |
| `//` | floor divide        | `5 // 2` | `2`    |
| `%`  | modulo              | `5 % 2`  | `1`    |
| `**` | power               | `5 ** 2` | `25`   |

`+`, `*` are also overloaded for sequences:

```python
[1, 2] + [3, 4]      # [1, 2, 3, 4]
"ab" * 3             # 'ababab'
```

## Assignment operators

```python
x = 5
x += 3       # x = x + 3
x -= 2
x *= 4
x /= 2
x //= 3
x %= 7
x **= 2
```

Same idea for `&=`, `|=`, `^=`, `<<=`, `>>=`.

### The walrus `:=` (Python 3.8+)

Assigns _and_ returns a value in a single expression — useful in `while` and comprehensions.

```python
while (line := input("> ")) != "quit":
    print(f"You said: {line}")

# Filter and reuse computed value
nums = [1, 2, 3, 4, 5]
result = [y for n in nums if (y := n * n) > 5]
print(result)        # [9, 16, 25]
```

## Comparison operators

| Op                   | Meaning   |
| -------------------- | --------- |
| `==`                 | equal     |
| `!=`                 | not equal |
| `>`, `<`, `>=`, `<=` | ordering  |

These return `bool`. Chained comparisons work as expected: `1 < x < 10`.

## Logical operators

| Op    | Meaning       |
| ----- | ------------- |
| `and` | both truthy   |
| `or`  | either truthy |
| `not` | invert        |

Short-circuit — see the booleans lesson.

## Identity operators

| Op       | Meaning          |
| -------- | ---------------- |
| `is`     | same object      |
| `is not` | different object |

```python
a = [1, 2]
b = a
c = [1, 2]
a is b      # True   (same list)
a is c      # False  (different lists, equal values)
a == c      # True
```

Compare to `None`, `True`, `False` with `is` — never `==`.

## Membership operators

| Op       | Meaning             |
| -------- | ------------------- |
| `in`     | is contained in     |
| `not in` | is not contained in |

Works for any **iterable**: strings, lists, tuples, sets, dict keys.

```python
"py" in "python"             # True
3 in [1, 2, 3]               # True
"name" in {"name": "Ada"}    # True   (checks keys)
```

## Bitwise operators

Operate on the binary representation of integers.

| Op   | Meaning                | `0b1100 op 0b1010`              |
| ---- | ---------------------- | ------------------------------- | ------------- |
| `&`  | AND                    | `0b1000` (8)                    |
| `    | `                      | OR                              | `0b1110` (14) |
| `^`  | XOR                    | `0b0110` (6)                    |
| `~`  | NOT (one's complement) | `~0b1100` → `-13`               |
| `<<` | left shift             | `0b1100 << 2` → `0b110000` (48) |
| `>>` | right shift            | `0b1100 >> 2` → `0b11` (3)      |

`|` and `&` also work on `set` (union, intersection) and on `dict` (Python 3.9+ merge).

```python
{"a": 1} | {"b": 2}       # {'a': 1, 'b': 2}
```

## Operator precedence

Highest to lowest. Use parentheses whenever in doubt.

1. `**`
2. `+x`, `-x`, `~x` (unary)
3. `*`, `/`, `//`, `%`
4. `+`, `-` (binary)
5. `<<`, `>>`
6. `&`
7. `^`
8. `|`
9. comparisons (`==`, `<`, …, `in`, `is`)
10. `not`
11. `and`
12. `or`
13. ternary `x if cond else y`
14. assignment `=`, `+=`, …
15. walrus `:=`

## The conditional expression (ternary)

```python
status = "adult" if age >= 18 else "minor"
```

Read it left-to-right: _value if condition else other_value_.

## Unpacking operators

`*` and `**` are operators in argument and target positions, not just declarations.

```python
nums = [1, 2, 3]
print(*nums)              # equivalent to print(1, 2, 3)

a, *rest = [1, 2, 3, 4]   # a=1, rest=[2,3,4]

opts = {"sep": "-", "end": "!\n"}
print("a", "b", "c", **opts)    # a-b-c!
```

We'll see more of these in the functions lesson.

## Try it

```python
# Compute the parity (even/odd count) of a list using bitwise AND
nums = [3, 8, 7, 4, 12, 1]
evens = sum(1 for n in nums if n & 1 == 0)
odds  = len(nums) - evens
print(f"{evens} even, {odds} odd")
```

Output:

```
3 even, 3 odd
```
