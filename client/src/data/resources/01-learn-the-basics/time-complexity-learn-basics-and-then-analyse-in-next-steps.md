---
tutorials:
  - dsa/dsa-big-o-notation
  - dsa/dsa-time-complexity
---

## Overview

Time complexity is a way of measuring **how fast** an algorithm runs as the input size grows. Instead of timing code in seconds (which varies by machine), we count the number of elementary operations as a function of the input size $n$ and express it using **Big O notation**.

Understanding time complexity is essential for choosing the right approach in coding interviews and competitive programming. A brute-force $O(n^2)$ solution might pass for $n = 1{,}000$ but will be far too slow when $n = 10^5$.

Before diving into problem-specific analysis, make sure you are comfortable with:

- **Big O Notation** — how to express and simplify growth rates (dropping constants, keeping dominant terms).
- **Time Complexity** — how to derive the complexity of loops, nested loops, recursive calls, and divide-and-conquer algorithms.

Use the **Related Tutorials** links below to study both lessons. They cover derivations, worked examples, and the constraint-to-complexity table that tells you which algorithm family to reach for given the input size.
