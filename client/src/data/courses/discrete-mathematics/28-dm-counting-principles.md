---
title: Basic Counting Principles
---

# Basic Counting Principles

Counting is at the heart of combinatorics—the branch of mathematics that deals with determining how many ways something can happen. In this lesson, we explore the fundamental rules that form the building blocks of all counting arguments.

## Why Counting Matters

From computing the number of possible passwords to analyzing algorithm complexity, counting principles appear everywhere in computer science and mathematics. Mastering these rules gives you a systematic approach to answer "how many?" questions.

---

## The Sum Rule (Rule of OR)

The **sum rule** applies when a task can be accomplished in one of several **mutually exclusive** ways.

> **Sum Rule:** If a task can be done in $n_1$ ways OR in $n_2$ ways (and these ways do not overlap), then the total number of ways to do the task is $n_1 + n_2$.

More generally, if there are $k$ mutually exclusive options with $n_1, n_2, \ldots, n_k$ ways respectively:

$$
\text{Total ways} = n_1 + n_2 + \cdots + n_k = \sum_{i=1}^{k} n_i
$$

### Example: Choosing a Course

A student must choose one elective. There are 4 math courses, 3 science courses, and 5 humanities courses. How many choices does the student have?

$$
4 + 3 + 5 = 12 \text{ choices}
$$

### Example: Travel Options

You can travel from City A to City B by bus (3 routes), train (2 routes), or plane (1 route). The total number of ways to travel is:

$$
3 + 2 + 1 = 6 \text{ ways}
$$

### Example: Choosing a Beverage

A café offers 5 types of coffee, 4 types of tea, and 3 types of juice. If you order exactly one drink:

$$
5 + 4 + 3 = 12 \text{ options}
$$

---

## The Product Rule (Rule of AND)

The **product rule** applies when a task is broken into **sequential steps** that are all required.

> **Product Rule:** If a task requires step 1 (done in $n_1$ ways) AND step 2 (done in $n_2$ ways), and the choices are independent, then the total number of ways is $n_1 \times n_2$.

For $k$ sequential steps:

$$
\text{Total ways} = n_1 \times n_2 \times \cdots \times n_k = \prod_{i=1}^{k} n_i
$$

### Example: Outfit Selection

You have 4 shirts AND 3 pants. The number of possible outfits:

$$
4 \times 3 = 12 \text{ outfits}
$$

### Example: License Plates

A license plate has 3 letters (A–Z) followed by 4 digits (0–9). How many plates are possible?

$$
26 \times 26 \times 26 \times 10 \times 10 \times 10 \times 10 = 26^3 \times 10^4 = 17{,}576 \times 10{,}000 = 175{,}760{,}000
$$

### Example: Menu Choices

A restaurant offers 3 appetizers, 5 main courses, and 4 desserts. If a customer orders one of each:

$$
3 \times 5 \times 4 = 60 \text{ possible meals}
$$

### Example: Binary Strings

How many binary strings of length $n$ exist? Each position has 2 choices (0 or 1):

$$
\underbrace{2 \times 2 \times \cdots \times 2}_{n \text{ times}} = 2^n
$$

For $n = 8$: $2^8 = 256$ possible bytes.

---

## Combining Sum and Product Rules

Many real-world problems require **both** rules together.

### Example: Passwords (Letters or Digits)

A password is either:
- 4 letters (uppercase only): $26^4 = 456{,}976$ options, OR
- 6 digits: $10^6 = 1{,}000{,}000$ options

Total passwords (sum rule):

$$
26^4 + 10^6 = 456{,}976 + 1{,}000{,}000 = 1{,}456{,}976
$$

### Example: Paths in a Grid

To travel from corner $(0,0)$ to $(3,2)$ in a grid, moving only right (R) or up (U), you need exactly 3 R's and 2 U's. The number of paths is the number of ways to arrange these 5 steps:

$$
\binom{5}{2} = \frac{5!}{2! \cdot 3!} = 10
$$

(We'll explore this in depth in the combinations lesson.)

---

## The Subtraction Rule (Inclusion–Exclusion for Two Sets)

When the choices are **not** mutually exclusive, the sum rule overcounts. The subtraction rule corrects this.

> **Subtraction Rule:** If a task can be done in $n_1$ ways or $n_2$ ways (not necessarily exclusive), then the total is:
>
> $$|A \cup B| = |A| + |B| - |A \cap B|$$

### Example: Strings Starting with A or Ending with Z

How many 3-letter strings (A–Z) start with 'A' OR end with 'Z'?

- Start with 'A': $1 \times 26 \times 26 = 676$
- End with 'Z': $26 \times 26 \times 1 = 676$
- Start with 'A' AND end with 'Z': $1 \times 26 \times 1 = 26$

By the subtraction rule:

$$
676 + 676 - 26 = 1{,}326
$$

### Example: Divisibility

How many integers from 1 to 100 are divisible by 3 OR 5?

- Divisible by 3: $\lfloor 100/3 \rfloor = 33$
- Divisible by 5: $\lfloor 100/5 \rfloor = 20$
- Divisible by both (i.e., by 15): $\lfloor 100/15 \rfloor = 6$

$$
33 + 20 - 6 = 47
$$

---

## The Division Rule

The **division rule** handles overcounting due to equivalent outcomes.

> **Division Rule:** If a procedure counts every outcome exactly $d$ times, then the actual number of distinct outcomes is:
>
> $$\frac{\text{Total counted}}{d}$$

### Example: Seating at a Round Table

How many ways can 4 people sit around a circular table? If we count linear arrangements, we get $4! = 24$. But each circular arrangement is counted 4 times (once for each rotation). So:

$$
\frac{4!}{4} = \frac{24}{4} = 6
$$

### Example: Handshakes

In a room of $n$ people, each pair shakes hands once. If we count "person A shakes with person B" and "person B shakes with person A" separately, we overcount by a factor of 2:

$$
\text{Handshakes} = \frac{n(n-1)}{2}
$$

For 10 people: $\frac{10 \times 9}{2} = 45$ handshakes.

---

## Tree Diagrams for Counting

A **tree diagram** visually represents all possible outcomes of a sequence of decisions. Each branch represents a choice, and each path from root to leaf represents one complete outcome.

### Example: Coin Flips

Flipping a coin 3 times:

```
            Start
           /     \
          H       T
         / \     / \
        H   T   H   T
       /\ /\  /\  /\
      H T H T H T H T
```

Outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT → $2^3 = 8$ total.

### Example: Ice Cream

Choose one cone (waffle, sugar) and one flavor (vanilla, chocolate, strawberry):

```
        Start
       /     \
    Waffle   Sugar
    / | \    / | \
   V  C  S  V  C  S
```

Total: $2 \times 3 = 6$ combinations.

Tree diagrams are especially useful when the number of choices at each step depends on previous choices.

---

## More Counting Examples

### Example: Phone Numbers

A 10-digit phone number where the first digit cannot be 0 or 1:

$$
8 \times 10^9 = 8{,}000{,}000{,}000
$$

### Example: PIN Codes

A 4-digit PIN (0000–9999) with no repeated digits:

$$
10 \times 9 \times 8 \times 7 = 5{,}040
$$

### Example: Committee Formation

From 10 men and 8 women, form a committee of 2 men AND 3 women:

$$
\binom{10}{2} \times \binom{8}{3} = 45 \times 56 = 2{,}520
$$

### Example: Bit Strings with Constraints

How many 8-bit strings have exactly three 1's?

$$
\binom{8}{3} = \frac{8!}{3! \cdot 5!} = 56
$$

---

## Code: Counting Password Possibilities

Let's write code to count the number of valid passwords under various rules.

**Problem:** A password must be 8 characters long. It can contain uppercase letters (A–Z), lowercase letters (a–z), and digits (0–9). Count: (a) total passwords, (b) passwords with at least one digit, (c) passwords with no repeated characters.

```cpp
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    int upper = 26, lower = 26, digits = 10;
    int total_chars = upper + lower + digits; // 62
    int length = 8;

    // (a) Total passwords: 62^8
    long long total = 1;
    for (int i = 0; i < length; i++) {
        total *= total_chars;
    }
    cout << "Total passwords: " << total << endl;

    // (b) At least one digit = Total - (no digits)
    // No digits: 52^8
    long long no_digits = 1;
    for (int i = 0; i < length; i++) {
        no_digits *= (upper + lower); // 52
    }
    long long at_least_one_digit = total - no_digits;
    cout << "With at least one digit: " << at_least_one_digit << endl;

    // (c) No repeated characters: 62 * 61 * 60 * ... * 55
    long long no_repeats = 1;
    for (int i = 0; i < length; i++) {
        no_repeats *= (total_chars - i);
    }
    cout << "No repeated characters: " << no_repeats << endl;

    return 0;
}
```

```csharp
using System;

class CountingPasswords
{
    static void Main()
    {
        int upper = 26, lower = 26, digits = 10;
        int totalChars = upper + lower + digits; // 62
        int length = 8;

        // (a) Total passwords: 62^8
        long total = 1;
        for (int i = 0; i < length; i++)
        {
            total *= totalChars;
        }
        Console.WriteLine($"Total passwords: {total}");

        // (b) At least one digit = Total - (no digits)
        long noDigits = 1;
        for (int i = 0; i < length; i++)
        {
            noDigits *= (upper + lower); // 52
        }
        long atLeastOneDigit = total - noDigits;
        Console.WriteLine($"With at least one digit: {atLeastOneDigit}");

        // (c) No repeated characters
        long noRepeats = 1;
        for (int i = 0; i < length; i++)
        {
            noRepeats *= (totalChars - i);
        }
        Console.WriteLine($"No repeated characters: {noRepeats}");
    }
}
```

```java
public class CountingPasswords {
    public static void main(String[] args) {
        int upper = 26, lower = 26, digits = 10;
        int totalChars = upper + lower + digits; // 62
        int length = 8;

        // (a) Total passwords: 62^8
        long total = 1;
        for (int i = 0; i < length; i++) {
            total *= totalChars;
        }
        System.out.println("Total passwords: " + total);

        // (b) At least one digit = Total - (no digits)
        long noDigits = 1;
        for (int i = 0; i < length; i++) {
            noDigits *= (upper + lower); // 52
        }
        long atLeastOneDigit = total - noDigits;
        System.out.println("With at least one digit: " + atLeastOneDigit);

        // (c) No repeated characters
        long noRepeats = 1;
        for (int i = 0; i < length; i++) {
            noRepeats *= (totalChars - i);
        }
        System.out.println("No repeated characters: " + noRepeats);
    }
}
```

```python
def count_passwords():
    upper = 26
    lower = 26
    digits = 10
    total_chars = upper + lower + digits  # 62
    length = 8

    # (a) Total passwords: 62^8
    total = total_chars ** length
    print(f"Total passwords: {total}")

    # (b) At least one digit = Total - (no digits)
    no_digits = (upper + lower) ** length  # 52^8
    at_least_one_digit = total - no_digits
    print(f"With at least one digit: {at_least_one_digit}")

    # (c) No repeated characters: 62 * 61 * 60 * ... * 55
    no_repeats = 1
    for i in range(length):
        no_repeats *= (total_chars - i)
    print(f"No repeated characters: {no_repeats}")

count_passwords()
```

```javascript
function countPasswords() {
  const upper = 26;
  const lower = 26;
  const digits = 10;
  const totalChars = upper + lower + digits; // 62
  const length = 8;

  // (a) Total passwords: 62^8
  let total = BigInt(1);
  for (let i = 0; i < length; i++) {
    total *= BigInt(totalChars);
  }
  console.log(`Total passwords: ${total}`);

  // (b) At least one digit = Total - (no digits)
  let noDigits = BigInt(1);
  for (let i = 0; i < length; i++) {
    noDigits *= BigInt(upper + lower); // 52
  }
  const atLeastOneDigit = total - noDigits;
  console.log(`With at least one digit: ${atLeastOneDigit}`);

  // (c) No repeated characters
  let noRepeats = BigInt(1);
  for (let i = 0; i < length; i++) {
    noRepeats *= BigInt(totalChars - i);
  }
  console.log(`No repeated characters: ${noRepeats}`);
}

countPasswords();
```

### Output

```
Total passwords: 218340105584896
With at least one digit: 165367055302656
No repeated characters: 136325893334400
```

---

## Practice Problems

1. A test has 10 true/false questions. How many ways can a student answer the test?
2. How many 3-digit numbers have no repeated digits?
3. A committee of 5 is chosen from 8 men and 6 women with at least 2 women. How many ways?
4. How many integers from 1 to 1000 are divisible by 3 or 7 but not both?
5. How many 4-character strings (A–Z, 0–9) start with a letter and end with a digit?

<details>
<summary><strong>Solutions</strong></summary>

1. $2^{10} = 1024$
2. First digit: 9 choices (1–9), second: 9 (0–9 minus first), third: 8 → $9 \times 9 \times 8 = 648$
3. $\binom{6}{2}\binom{8}{3} + \binom{6}{3}\binom{8}{2} + \binom{6}{4}\binom{8}{1} + \binom{6}{5}\binom{8}{0} = 840 + 560 + 120 + 6 = 1{,}526$
4. Div by 3: 333, Div by 7: 142, Div by 21: 47. By 3 or 7: $333 + 142 - 47 = 428$. By both: 47. Answer: $428 - 47 = 381$
5. First: 26 letters, middle two: 36 each, last: 10 digits → $26 \times 36 \times 36 \times 10 = 336{,}960$

</details>

---

## Key Takeaways

- **Sum Rule (OR):** Add counts when choices are mutually exclusive alternatives.
- **Product Rule (AND):** Multiply counts when a task requires multiple independent sequential steps.
- **Subtraction Rule:** Correct overcounting: $|A \cup B| = |A| + |B| - |A \cap B|$.
- **Division Rule:** Divide by the number of times each outcome is counted when equivalent configurations exist.
- **Tree Diagrams:** Visualize sequential decisions; the number of leaves equals the total outcomes.
- **Strategy:** Break complex counting problems into simpler sub-problems using these rules, then combine results.
- These four principles are the foundation for permutations, combinations, and all advanced combinatorics.
