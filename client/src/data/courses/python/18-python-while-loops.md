---
title: Python While Loops
---

# Python While Loops

A `while` loop runs as long as a condition is true.

```python
i = 0
while i < 5:
    print(i)
    i += 1
```

Output:

```
0
1
2
3
4
```

The condition is tested **before** each iteration. If it's false the first time, the body never runs.

## `break` — exit the loop early

```python
while True:
    line = input("> ")
    if line == "quit":
        break
    print(f"echo: {line}")
```

`while True:` is the standard Python idiom for "loop until I tell you to stop".

## `continue` — skip to the next iteration

```python
i = 0
while i < 10:
    i += 1
    if i % 2 == 0:
        continue          # skip evens
    print(i)
```

## `else` on a loop — yes, really

A `while` (or `for`) loop can have an `else` clause that runs **only if the loop finished without `break`**.

```python
n = 17
i = 2
while i * i <= n:
    if n % i == 0:
        print("not prime")
        break
    i += 1
else:
    print("prime")
```

This is a niche but useful pattern for "search loops" — it removes the need for a `found = False` flag.

## Beware of infinite loops

If your condition never becomes false (and there's no `break`), the loop runs forever.

```python
i = 0
while i < 5:
    print(i)
    # forgot i += 1  → infinite loop
```

Press `Ctrl+C` in the terminal to stop a runaway program.

## The walrus + while pattern (Python 3.8+)

A common shape — read-and-test in one expression:

```python
while (chunk := file.read(1024)):
    process(chunk)
```

Without the walrus you'd need to read once before the loop and once at the end of the body — easy to forget.

## When to use `while` vs `for`

- **Use `for`** when iterating over a known collection or `range`.
- **Use `while`** when the number of iterations isn't known up front: waiting for input, polling, retry-with-backoff, search.

## Try it — guess the number

```python
import random

target = random.randint(1, 100)
guesses = 0

while True:
    guess = int(input("Your guess (1-100): "))
    guesses += 1

    if guess < target:
        print("higher")
    elif guess > target:
        print("lower")
    else:
        print(f"got it in {guesses} guesses!")
        break
```
