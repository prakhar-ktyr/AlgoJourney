---
title: Complexity & Asymptotic Analysis
---

# Complexity & Asymptotic Analysis

Understanding how algorithms scale is one of the most important skills in computer science. Complexity analysis gives us a mathematical framework to predict an algorithm's performance without running it on every possible input.

## Why Algorithm Efficiency Matters

Two algorithms can solve the same problem but behave vastly differently as input grows:

- A search algorithm that takes 1 second for 1,000 items might take 1,000 seconds for 1,000,000 items (linear) — or just 2 seconds (logarithmic).
- Choosing the wrong algorithm can make the difference between a program finishing in milliseconds vs. running for centuries.

**Real-world consequences:**
- Web searches must respond in fractions of a second across billions of pages.
- Route planning (GPS) must handle millions of road segments in real time.
- Sorting a database of millions of records must not freeze the system.

## Measuring Efficiency

We measure efficiency in terms of **input size** $n$ and count the number of **basic operations** (comparisons, assignments, arithmetic) as a function of $n$.

We care about:
- **Time complexity**: how many operations?
- **Space complexity**: how much memory?

We typically analyze the **worst case** — the maximum operations for any input of size $n$.

## Big-O Notation

Big-O gives an **upper bound** on growth rate.

### Formal Definition

$$f(n) = O(g(n)) \iff \exists\, c > 0,\; n_0 > 0 \text{ such that } f(n) \leq c \cdot g(n) \;\forall\, n \geq n_0$$

In plain English: $f(n)$ is $O(g(n))$ if, for sufficiently large $n$, $f(n)$ grows no faster than a constant multiple of $g(n)$.

### Examples

- $3n + 5 = O(n)$ — choose $c = 4, n_0 = 5$
- $2n^2 + 10n + 7 = O(n^2)$ — the $n^2$ term dominates
- $\log_2 n = O(\log n)$ — base doesn't matter (differs by a constant factor)

### Rules for Big-O

1. **Drop constants**: $O(5n) = O(n)$
2. **Drop lower-order terms**: $O(n^2 + n) = O(n^2)$
3. **Multiplication rule**: if $f = O(a)$ and $g = O(b)$, then $f \cdot g = O(a \cdot b)$
4. **Addition rule**: $O(a) + O(b) = O(\max(a, b))$

## Big-Ω (Omega) Notation

Big-Ω gives a **lower bound** on growth rate.

$$f(n) = \Omega(g(n)) \iff \exists\, c > 0,\; n_0 > 0 \text{ such that } f(n) \geq c \cdot g(n) \;\forall\, n \geq n_0$$

This means $f(n)$ grows **at least as fast** as $g(n)$.

**Example:** Any comparison-based sorting algorithm is $\Omega(n \log n)$ in the worst case — you cannot do better.

## Big-Θ (Theta) Notation

Big-Θ gives a **tight bound** — both upper and lower.

$$f(n) = \Theta(g(n)) \iff f(n) = O(g(n)) \text{ and } f(n) = \Omega(g(n))$$

Equivalently:

$$\exists\, c_1, c_2 > 0,\; n_0 > 0 \text{ such that } c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \;\forall\, n \geq n_0$$

**Example:** Merge sort is $\Theta(n \log n)$ — it always takes roughly $n \log n$ operations regardless of input.

## Common Complexity Classes

| Class | Name | Example |
|-------|------|---------|
| $O(1)$ | Constant | Array index access |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Linear search |
| $O(n \log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(n^3)$ | Cubic | Naive matrix multiplication |
| $O(2^n)$ | Exponential | Subset enumeration |
| $O(n!)$ | Factorial | Permutation enumeration |

### Growth Rate Comparison

For $n = 100$:

| $f(n)$ | Value |
|---------|-------|
| $1$ | $1$ |
| $\log_2 n$ | $\approx 7$ |
| $n$ | $100$ |
| $n \log_2 n$ | $\approx 664$ |
| $n^2$ | $10{,}000$ |
| $2^n$ | $\approx 1.27 \times 10^{30}$ |
| $n!$ | $\approx 9.33 \times 10^{157}$ |

The jump from polynomial to exponential is staggering — exponential algorithms become infeasible very quickly.

## Analyzing Loops

### Simple Loop — $O(n)$

```cpp
int sum = 0;
for (int i = 0; i < n; i++) {
    sum += i;  // executes n times
}
```

```python
total = 0
for i in range(n):
    total += i  # executes n times
```

### Nested Loops — $O(n^2)$

```java
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        count++;  // executes n * n times
    }
}
```

```javascript
let count = 0;
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        count++;  // executes n * n times
    }
}
```

### Loop with Halving — $O(\log n)$

```csharp
int count = 0;
int i = n;
while (i > 1) {
    i = i / 2;
    count++;
}
// count ≈ log₂(n)
```

### Dependent Inner Loop — $O(n^2)$

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) {
        count++;  // total: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
    }
}
```

### Loop with Doubling — $O(\log n)$

```python
i = 1
count = 0
while i < n:
    i *= 2
    count += 1
# count ≈ log₂(n)
```

## Analyzing Recursive Algorithms

### Linear Recursion — $O(n)$

```java
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // T(n) = T(n-1) + O(1)
}
```

Recurrence: $T(n) = T(n-1) + c$, solution: $T(n) = O(n)$.

### Binary Recursion — $O(n)$

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
    # T(n) = T(n-1) + T(n-2) + O(1) → O(2^n) without memoization!
```

This naive Fibonacci is $O(2^n)$ — exponential! With memoization it becomes $O(n)$.

### Divide and Conquer — Master Theorem

For recurrences of the form:

$$T(n) = a \cdot T\!\left(\frac{n}{b}\right) + O(n^d)$$

The Master Theorem gives:

$$T(n) = \begin{cases} O(n^d) & \text{if } d > \log_b a \\ O(n^d \log n) & \text{if } d = \log_b a \\ O(n^{\log_b a}) & \text{if } d < \log_b a \end{cases}$$

**Examples:**
- Merge sort: $T(n) = 2T(n/2) + O(n)$ → $a=2, b=2, d=1$, so $d = \log_2 2 = 1$ → $O(n \log n)$
- Binary search: $T(n) = T(n/2) + O(1)$ → $a=1, b=2, d=0$, so $d = \log_2 1 = 0$ → $O(\log n)$

## Space Complexity

Space complexity counts the **extra memory** used (beyond the input).

| Algorithm | Time | Space |
|-----------|------|-------|
| Bubble sort | $O(n^2)$ | $O(1)$ (in-place) |
| Merge sort | $O(n \log n)$ | $O(n)$ (auxiliary array) |
| Quick sort | $O(n \log n)$ avg | $O(\log n)$ (stack) |
| DFS on graph | $O(V + E)$ | $O(V)$ (visited + stack) |

### Recursion Stack Space

Every recursive call uses stack space:

```javascript
function sumArray(arr, i = 0) {
    if (i >= arr.length) return 0;
    return arr[i] + sumArray(arr, i + 1);
}
// Time: O(n), Space: O(n) due to recursion depth
```

An iterative version uses $O(1)$ space:

```javascript
function sumArray(arr) {
    let total = 0;
    for (const x of arr) total += x;
    return total;
}
// Time: O(n), Space: O(1)
```

## Amortized Analysis

Sometimes a single operation is expensive, but over many operations the **average cost** per operation is low.

### Example: Dynamic Array (ArrayList / vector)

When a dynamic array is full, it doubles in size — costing $O(n)$ to copy. But this happens rarely:

- Insert 1: cost 1
- Insert 2: cost 1 + 2 (resize from 1→2, copy 1 element)
- Insert 3: cost 1 + 4 (resize from 2→4, copy 2 elements)
- Insert 4: cost 1
- Insert 5: cost 1 + 8 (resize from 4→8, copy 4 elements)
- ...

Total cost for $n$ insertions: $n + 1 + 2 + 4 + 8 + \ldots + n \leq n + 2n = 3n$

**Amortized cost per insertion:** $O(3n)/n = O(1)$

```csharp
// Amortized O(1) append
List<int> list = new List<int>();
for (int i = 0; i < 1000000; i++) {
    list.Add(i);  // occasional O(n) resize, but O(1) amortized
}
```

### Techniques for Amortized Analysis

1. **Aggregate method**: total cost / number of operations
2. **Accounting method**: assign "credits" to cheap operations to pay for expensive ones
3. **Potential method**: define a potential function $\Phi$ on the data structure state

## Code: Timing Algorithms to Observe Growth Rates

```cpp
#include <iostream>
#include <vector>
#include <chrono>
#include <algorithm>
using namespace std;

// O(1) - constant
int constantOp(const vector<int>& arr) {
    return arr[0];
}

// O(n) - linear
int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < (int)arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

// O(n^2) - quadratic
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j] > arr[j + 1])
                swap(arr[j], arr[j + 1]);
}

int main() {
    vector<int> sizes = {1000, 2000, 4000, 8000, 16000};

    cout << "n\tLinear(ms)\tQuadratic(ms)\tRatio" << endl;
    double prevQuad = 0;

    for (int n : sizes) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) arr[i] = n - i;

        // Time linear search (worst case)
        auto start = chrono::high_resolution_clock::now();
        linearSearch(arr, -1);
        auto end = chrono::high_resolution_clock::now();
        double linearTime = chrono::duration<double, milli>(end - start).count();

        // Time bubble sort
        vector<int> copy = arr;
        start = chrono::high_resolution_clock::now();
        bubbleSort(copy);
        end = chrono::high_resolution_clock::now();
        double quadTime = chrono::duration<double, milli>(end - start).count();

        double ratio = (prevQuad > 0) ? quadTime / prevQuad : 0;
        cout << n << "\t" << linearTime << "\t\t" << quadTime << "\t\t" << ratio << endl;
        prevQuad = quadTime;
    }
    return 0;
}
```

```java
import java.util.Arrays;
import java.util.Random;

public class ComplexityDemo {
    // O(log n) - binary search
    static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    // O(n) - linear search
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] sizes = {100000, 1000000, 10000000, 100000000};

        System.out.println("n\t\tLinear(ms)\tBinary(ms)");
        for (int n : sizes) {
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = i;
            int target = n + 1; // worst case: not found

            long start = System.nanoTime();
            linearSearch(arr, target);
            double linearTime = (System.nanoTime() - start) / 1e6;

            start = System.nanoTime();
            binarySearch(arr, target);
            double binaryTime = (System.nanoTime() - start) / 1e6;

            System.out.printf("%d\t\t%.3f\t\t%.6f%n", n, linearTime, binaryTime);
        }
    }
}
```

```python
import time
import random

def linear_search(arr, target):
    """O(n) search"""
    for i, x in enumerate(arr):
        if x == target:
            return i
    return -1

def binary_search(arr, target):
    """O(log n) search - requires sorted array"""
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def bubble_sort(arr):
    """O(n^2) sort"""
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

def time_function(func, *args):
    start = time.perf_counter()
    result = func(*args)
    elapsed = time.perf_counter() - start
    return elapsed, result

print(f"{'n':<10}{'Linear(s)':<15}{'Binary(s)':<15}{'Bubble(s)':<15}")
print("-" * 55)

for n in [1000, 2000, 4000, 8000]:
    arr = list(range(n))
    target = n + 1  # worst case

    t_linear, _ = time_function(linear_search, arr, target)
    t_binary, _ = time_function(binary_search, arr, target)

    arr_copy = list(range(n, 0, -1))  # reverse sorted
    t_bubble, _ = time_function(bubble_sort, arr_copy)

    print(f"{n:<10}{t_linear:<15.6f}{t_binary:<15.6f}{t_bubble:<15.6f}")
```

```javascript
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
}

const sizes = [1000, 2000, 4000, 8000];
console.log("n\tLinear(ms)\tBinary(ms)\tBubble(ms)");

for (const n of sizes) {
    const arr = Array.from({ length: n }, (_, i) => i);
    const target = n + 1;

    let start = performance.now();
    linearSearch(arr, target);
    const tLinear = performance.now() - start;

    start = performance.now();
    binarySearch(arr, target);
    const tBinary = performance.now() - start;

    const rev = Array.from({ length: n }, (_, i) => n - i);
    start = performance.now();
    bubbleSort(rev);
    const tBubble = performance.now() - start;

    console.log(`${n}\t${tLinear.toFixed(3)}\t\t${tBinary.toFixed(6)}\t\t${tBubble.toFixed(3)}`);
}
```

```csharp
using System;
using System.Diagnostics;

class ComplexityAnalysis {
    static int LinearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.Length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    static int BinarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.Length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    static void BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++)
            for (int j = 0; j < n - i - 1; j++)
                if (arr[j] > arr[j + 1])
                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
    }

    static void Main() {
        int[] sizes = { 1000, 2000, 4000, 8000 };
        Console.WriteLine($"{"n",-10}{"Linear(ms)",-15}{"Binary(ms)",-15}{"Bubble(ms)",-15}");

        foreach (int n in sizes) {
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = i;
            int target = n + 1;

            var sw = Stopwatch.StartNew();
            LinearSearch(arr, target);
            sw.Stop();
            double tLinear = sw.Elapsed.TotalMilliseconds;

            sw.Restart();
            BinarySearch(arr, target);
            sw.Stop();
            double tBinary = sw.Elapsed.TotalMilliseconds;

            int[] rev = new int[n];
            for (int i = 0; i < n; i++) rev[i] = n - i;
            sw.Restart();
            BubbleSort(rev);
            sw.Stop();
            double tBubble = sw.Elapsed.TotalMilliseconds;

            Console.WriteLine($"{n,-10}{tLinear,-15:F3}{tBinary,-15:F6}{tBubble,-15:F3}");
        }
    }
}
```

## Best, Average, and Worst Case

For many algorithms, performance depends on the specific input:

| Algorithm | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| Linear search | $O(1)$ | $O(n)$ | $O(n)$ |
| Quick sort | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ |
| Insertion sort | $O(n)$ | $O(n^2)$ | $O(n^2)$ |
| Hash table lookup | $O(1)$ | $O(1)$ | $O(n)$ |

Big-O typically refers to worst-case unless stated otherwise.

## Practical Tips for Complexity Analysis

1. **Identify the input size** — what is $n$?
2. **Find the dominant operation** — the innermost loop or recursive call.
3. **Count iterations** — how many times does the dominant operation execute?
4. **Simplify** — drop constants and lower-order terms.
5. **Verify** by doubling $n$ — does runtime roughly double (linear), quadruple (quadratic), etc.?

## Key Takeaways

- **Big-O** ($O$) gives an upper bound, **Big-Ω** ($\Omega$) a lower bound, and **Big-Θ** ($\Theta$) a tight bound on algorithm growth rates.
- Common classes from fastest to slowest: $O(1) < O(\log n) < O(n) < O(n \log n) < O(n^2) < O(2^n) < O(n!)$.
- **Nested loops** multiply complexities; **sequential code** adds them.
- The **Master Theorem** handles divide-and-conquer recurrences: $T(n) = aT(n/b) + O(n^d)$.
- **Space complexity** counts extra memory; recursion depth contributes to stack space.
- **Amortized analysis** averages cost over a sequence of operations — dynamic arrays achieve $O(1)$ amortized append.
- Always measure and compare: theory predicts trends, but constants and hardware cache effects matter in practice.
