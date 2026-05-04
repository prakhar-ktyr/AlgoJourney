---
title: Time Complexity
---

# Time Complexity

Time complexity measures **how many operations** an algorithm performs as the input size grows. It tells you whether your solution can handle the expected input within a time limit. In the previous lesson we learned the notation — now we learn how to actually derive it for real code.

## Counting operations, not seconds

We never measure time complexity in seconds because hardware varies. Instead, we count the number of **elementary operations** — comparisons, assignments, arithmetic, and memory accesses — as a function of input size $n$.

```cpp
// How many operations?
int sum = 0;           // 1 assignment
for (int i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

```java
// How many operations?
int sum = 0;           // 1 assignment
for (int i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

```python
# How many operations?
total = 0              # 1 assignment
for x in arr:          # n iterations
    total += x         # 1 addition per iteration
# Total: 1 + n operations → O(n)
```

```javascript
// How many operations?
let sum = 0;           // 1 assignment
for (let i = 0; i < n; i++) {  // n iterations
    sum += arr[i];     // 1 addition + 1 array access per iteration
}
// Total: 1 + 2n operations → O(n)
```

### From exact count to Big O

The exact operation count above was $1 + 2n$. How did we get $O(n)$?

1. **Drop constants**: $2n$ becomes $n$ because multiplying by a constant does not change the *growth rate*.
2. **Drop lower-order terms**: $1$ is negligible compared to $n$ when $n$ is large.

So $1 + 2n \in O(n)$. This process is the same for every derivation we will do in this lesson.

## Best, worst, and average case

Most algorithms behave differently depending on the input:

### Example: Linear search

```cpp
// Find target in an unsorted array
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

```java
int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

```python
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i
    return -1
```

```javascript
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}
```

| Case | When | Operations | Big O |
|---|---|---|---|
| Best | Target is the first element | 1 | O(1) |
| Worst | Target is last or not present | n | O(n) |
| Average | Target is somewhere in the middle | n/2 | O(n) |

When we say "time complexity" without qualification, we mean **worst case**.

## Analyzing common patterns

### Pattern 1: Constant — O(1)

The number of operations does not depend on input size.

```cpp
int getFirst(int arr[], int n) {
    return arr[0];  // always one operation
}
```

```java
int getFirst(int[] arr) {
    return arr[0];  // always one operation
}
```

```python
def get_first(arr):
    return arr[0]  # always one operation
```

```javascript
function getFirst(arr) {
    return arr[0];  // always one operation
}
```

Other O(1) examples: accessing an element by index, pushing/popping from the end of an array, looking up a key in a hash map, or swapping two variables. No matter how big the input is, these operations take the same amount of work.

---

### Pattern 2: Logarithmic — O(log n)

Each step eliminates a constant fraction (usually half) of the remaining input.

#### Derivation: why is halving O(log n)?

Imagine you start with $n$ items and cut in half each step. The question is: **how many times can you halve $n$ before you reach 1?**

$$n \to \frac{n}{2} \to \frac{n}{4} \to \frac{n}{8} \to \cdots \to 1$$

After $k$ steps, the remaining size is:

$$\frac{n}{2^k}$$

We stop when this reaches 1:

$$\frac{n}{2^k} = 1 \implies 2^k = n \implies k = \log_2 n$$

So the loop runs exactly $\log_2 n$ times. Since Big O drops constant factors (and the base of the logarithm is a constant factor: $\log_2 n = \frac{\ln n}{\ln 2}$), we write $O(\log n)$.

#### Concrete numbers

| n | $\log_2 n$ (steps) |
|---|---|
| 8 | 3 |
| 1,024 | 10 |
| 1,000,000 | ~20 |
| 1,000,000,000 | ~30 |

Even for a **billion** elements, we only need about 30 steps. That is the power of logarithmic time.

#### Example 1: Binary search

We will study binary search in depth later, but here is the key idea — start with a sorted array and repeatedly eliminate half:

```cpp
int binarySearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {                     // runs log₂(n) times
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;  // discard left half
        else hi = mid - 1;                         // discard right half
    }
    return -1;
}
```

```java
int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {                     // runs log₂(n) times
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;  // discard left half
        else hi = mid - 1;                         // discard right half
    }
    return -1;
}
```

```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:                        # runs log₂(n) times
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1                   # discard left half
        else:
            hi = mid - 1                   # discard right half
    return -1
```

```javascript
function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {                     // runs log₂(n) times
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) lo = mid + 1;  // discard left half
        else hi = mid - 1;                         // discard right half
    }
    return -1;
}
```

The search space (`hi - lo + 1`) halves each iteration. By our derivation above, this gives $O(\log n)$.

#### Example 2: Multiplying loop variable

Halving is not the only way to get $O(\log n)$. Any loop that **multiplies** or **divides** by a constant each step is logarithmic:

```cpp
// How many times does this loop run?
int i = 1;
while (i < n) {
    // do constant work
    i *= 2;  // i doubles each step: 1, 2, 4, 8, 16, ...
}
```

```java
int i = 1;
while (i < n) {
    // do constant work
    i *= 2;  // i doubles each step: 1, 2, 4, 8, 16, ...
}
```

```python
i = 1
while i < n:
    # do constant work
    i *= 2   # i doubles each step: 1, 2, 4, 8, 16, ...
```

```javascript
let i = 1;
while (i < n) {
    // do constant work
    i *= 2;  // i doubles each step: 1, 2, 4, 8, 16, ...
}
```

After $k$ iterations, $i = 2^k$. The loop stops when $2^k \ge n$, so $k = \lceil \log_2 n \rceil$. That is $O(\log n)$.

Similarly, a loop that divides `i` by 3 each step (`i /= 3`) runs $\log_3 n$ times, which is also $O(\log n)$ since $\log_3 n = \frac{\log_2 n}{\log_2 3}$ — just a constant factor difference.

---

### Pattern 3: Linear — O(n)

One pass through the data. The loop counter increments (or decrements) by a constant each step, so it runs exactly $n$ times.

```cpp
int findMax(int arr[], int n) {
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

```java
int findMax(int[] arr) {
    int maxVal = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

```python
def find_max(arr):
    max_val = arr[0]
    for x in arr[1:]:
        if x > max_val:
            max_val = x
    return max_val
```

```javascript
function findMax(arr) {
    let maxVal = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}
```

#### Derivation

The loop runs for $i = 1, 2, \ldots, n-1$, which is exactly $n - 1$ iterations. Each iteration does $O(1)$ work (one comparison, possibly one assignment). Total work:

$$(n - 1) \times O(1) = O(n - 1) = O(n)$$

#### Example 2: Two sequential loops are still O(n)

```cpp
// First loop: count positives
int pos = 0;
for (int i = 0; i < n; i++) {
    if (arr[i] > 0) pos++;
}
// Second loop: count negatives
int neg = 0;
for (int i = 0; i < n; i++) {
    if (arr[i] < 0) neg++;
}
// Total: n + n = 2n → O(n)
```

```java
int pos = 0;
for (int i = 0; i < n; i++) {
    if (arr[i] > 0) pos++;
}
int neg = 0;
for (int i = 0; i < n; i++) {
    if (arr[i] < 0) neg++;
}
// Total: n + n = 2n → O(n)
```

```python
pos = sum(1 for x in arr if x > 0)   # O(n)
neg = sum(1 for x in arr if x < 0)   # O(n)
# Total: n + n = 2n → O(n)
```

```javascript
let pos = 0;
for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) pos++;
}
let neg = 0;
for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) neg++;
}
// Total: n + n = 2n → O(n)
```

Two sequential $O(n)$ loops give $O(n) + O(n) = O(2n) = O(n)$. Remember: constants are dropped.

---

### Pattern 4: O(n log n) — Linearithmic

This is the "sweet spot" for efficient algorithms. It typically arises from **divide-and-conquer**: split the problem in half, solve each half, and combine.

#### Derivation: Merge Sort

Merge sort works as follows:
1. **Divide** the array into two halves.
2. **Recurse** on each half.
3. **Merge** the two sorted halves — this takes $O(n)$ since we scan through both halves once.

Let $T(n)$ be the total work for an array of size $n$. The recurrence is:

$$T(n) = 2 \cdot T\!\left(\frac{n}{2}\right) + O(n)$$

We can visualize this as a tree of recursive calls:

```
Level 0:  [        n        ]               → O(n) merge work
Level 1:  [   n/2   ] [   n/2   ]           → O(n) total merge work
Level 2:  [n/4][n/4]   [n/4][n/4]           → O(n) total merge work
  ...
Level k:  [1][1][1]...[1][1][1]             → O(n) total merge work
```

At each level, the subproblems are smaller but there are more of them. The total merge work at **every level** sums to $O(n)$:
- Level 0: 1 problem of size $n$ → $n$ work
- Level 1: 2 problems of size $n/2$ → $2 \times n/2 = n$ work
- Level 2: 4 problems of size $n/4$ → $4 \times n/4 = n$ work
- Level $k$: $2^k$ problems of size $n/2^k$ → $2^k \times n/2^k = n$ work

How many levels are there? We keep halving until the subproblem size reaches 1:

$$\frac{n}{2^k} = 1 \implies k = \log_2 n$$

Each of the $\log_2 n$ levels does $O(n)$ work, so the total is:

$$T(n) = O(n) \times O(\log n) = O(n \log n)$$

#### Why O(n log n) matters

$O(n \log n)$ is the theoretical lower bound for comparison-based sorting. No sorting algorithm that works by comparing elements can do better in the worst case. This is why merge sort, heap sort, and average-case quick sort all land at exactly $O(n \log n)$.

---

### Pattern 5: Quadratic — O(n²)

Two nested loops, each running up to $n$ times.

```cpp
// Check if array has duplicates (brute force)
bool hasDuplicates(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
```

```java
boolean hasDuplicates(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
```

```python
def has_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False
```

```javascript
function hasDuplicates(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) return true;
        }
    }
    return false;
}
```

#### Derivation

The inner loop starts at $j = i + 1$, so its iteration count depends on $i$:

| Outer $i$ | Inner loop runs |
|---|---|
| 0 | $n - 1$ times |
| 1 | $n - 2$ times |
| 2 | $n - 3$ times |
| ... | ... |
| $n - 2$ | 1 time |
| $n - 1$ | 0 times |

The total number of iterations is:

$$(n-1) + (n-2) + (n-3) + \cdots + 1 + 0$$

This is the classic sum of integers from $1$ to $n-1$:

$$\sum_{k=1}^{n-1} k = \frac{(n-1) \cdot n}{2} = \frac{n^2 - n}{2}$$

Dropping the constant $\frac{1}{2}$ and the lower-order term $n$:

$$\frac{n^2 - n}{2} \in O(n^2)$$

So even though the inner loop doesn't always run $n$ times, the total is still quadratic.

#### Example 2: Bubble Sort

```cpp
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
```

```java
void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
```

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
```

```javascript
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
}
```

The inner loop runs $(n-1) + (n-2) + \cdots + 1 = \frac{n(n-1)}{2}$ times — the same derivation as above. $O(n^2)$.

---

### Pattern 6: Exponential — O(2ⁿ)

Each function call branches into **two** recursive calls, creating a tree that doubles at every level.

#### Example: Naive recursive Fibonacci

```cpp
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

```java
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

```javascript
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

#### Derivation

Let $T(n)$ be the number of calls to compute `fib(n)`. Each call makes two more calls:

$$T(n) = T(n-1) + T(n-2) + 1$$

This grows like the Fibonacci sequence itself, which is approximately:

$$T(n) \approx \phi^n \quad \text{where } \phi = \frac{1 + \sqrt{5}}{2} \approx 1.618$$

Since $\phi^n$ grows exponentially, we simplify to $O(2^n)$ (since $\phi < 2$ and we use it as an upper bound).

**How bad is this?**

| n | Approximate calls |
|---|---|
| 10 | ~177 |
| 20 | ~21,891 |
| 30 | ~2,692,537 |
| 40 | ~331,160,281 |
| 50 | ~40,730,022,147 |

At $n = 50$ we are already past $4 \times 10^{10}$ operations — far too slow. This is why dynamic programming exists: it brings Fibonacci down to $O(n)$ by storing already-computed values.

---

### Pattern 7: O(√n) — Square Root

Less common but important. The idea: instead of checking all $n$ values, you only need to check up to $\sqrt{n}$.

#### Example: Primality test

To check if $n$ is prime, you might try dividing by every number from 2 to $n-1$. But you only need to go up to $\sqrt{n}$.

```cpp
bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {  // i goes up to √n
        if (n % i == 0) return false;
    }
    return true;
}
```

```java
boolean isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {  // i goes up to √n
        if (n % i == 0) return false;
    }
    return true;
}
```

```python
def is_prime(n):
    if n < 2:
        return False
    i = 2
    while i * i <= n:       # i goes up to √n
        if n % i == 0:
            return False
        i += 1
    return True
```

```javascript
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {  // i goes up to √n
        if (n % i === 0) return false;
    }
    return true;
}
```

#### Derivation

**Why does stopping at $\sqrt{n}$ work?** If $n = a \times b$ and both $a > \sqrt{n}$ and $b > \sqrt{n}$, then $a \times b > n$ — a contradiction. So at least one factor must be $\le \sqrt{n}$.

The loop runs from 2 to $\sqrt{n}$, which is $\sqrt{n} - 1$ iterations. That is $O(\sqrt{n})$.

For $n = 10^9$, the naive $O(n)$ approach checks ~$10^9$ numbers. The $O(\sqrt{n})$ approach checks ~$31{,}623$ — roughly **31,000× faster**.

## Tricky loop analysis: worked examples

Here are patterns students often find confusing, with full derivations.

### Example A: Nested loop with logarithmic inner

```cpp
for (int i = 0; i < n; i++) {         // runs n times
    for (int j = 1; j < n; j *= 2) {  // runs log₂(n) times
        // O(1) work
    }
}
```

```java
for (int i = 0; i < n; i++) {         // runs n times
    for (int j = 1; j < n; j *= 2) {  // runs log₂(n) times
        // O(1) work
    }
}
```

```python
for i in range(n):          # runs n times
    j = 1
    while j < n:            # runs log₂(n) times
        # O(1) work
        j *= 2
```

```javascript
for (let i = 0; i < n; i++) {         // runs n times
    for (let j = 1; j < n; j *= 2) {  // runs log₂(n) times
        // O(1) work
    }
}
```

**Derivation**: The outer loop runs $n$ times. For each iteration, the inner loop runs $\log_2 n$ times (because $j$ doubles). Total iterations: $n \times \log_2 n = O(n \log n)$.

### Example B: Inner loop depends on outer variable

```cpp
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) {
        // O(1) work
    }
}
```

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) {
        // O(1) work
    }
}
```

```python
for i in range(n):
    for j in range(i):
        pass  # O(1) work
```

```javascript
for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
        // O(1) work
    }
}
```

**Derivation**: When $i = 0$, inner runs 0 times. When $i = 1$, inner runs 1 time. When $i = k$, inner runs $k$ times.

$$\text{Total} = 0 + 1 + 2 + \cdots + (n-1) = \frac{n(n-1)}{2} = O(n^2)$$

### Example C: Loop incrementing by √n

```cpp
for (int i = 0; i < n; i += sqrt(n)) {
    // O(1) work
}
```

```java
for (int i = 0; i < n; i += (int) Math.sqrt(n)) {
    // O(1) work
}
```

```python
import math
i = 0
step = int(math.sqrt(n))
while i < n:
    # O(1) work
    i += step
```

```javascript
const step = Math.floor(Math.sqrt(n));
for (let i = 0; i < n; i += step) {
    // O(1) work
}
```

**Derivation**: The loop counter jumps by $\sqrt{n}$ each step, so it runs $\frac{n}{\sqrt{n}} = \sqrt{n}$ times. $O(\sqrt{n})$.

### Example D: Two nested logarithmic loops

```cpp
for (int i = 1; i < n; i *= 2) {       // log₂(n) iterations
    for (int j = 1; j < n; j *= 3) {   // log₃(n) iterations
        // O(1) work
    }
}
```

```java
for (int i = 1; i < n; i *= 2) {       // log₂(n) iterations
    for (int j = 1; j < n; j *= 3) {   // log₃(n) iterations
        // O(1) work
    }
}
```

```python
i = 1
while i < n:            # log₂(n) iterations
    j = 1
    while j < n:        # log₃(n) iterations
        # O(1) work
        j *= 3
    i *= 2
```

```javascript
for (let i = 1; i < n; i *= 2) {       // log₂(n) iterations
    for (let j = 1; j < n; j *= 3) {   // log₃(n) iterations
        // O(1) work
    }
}
```

**Derivation**: Outer runs $\log_2 n$ times, inner runs $\log_3 n$ times per outer iteration. Total: $\log_2 n \times \log_3 n = O(\log^2 n)$. This is sometimes written $O((\log n)^2)$ — very fast.

## Practical time limits

In competitive programming and coding interviews, a rough rule of thumb:

| Operations | Time (≈) |
|---|---|
| $10^6$ | < 0.1 seconds |
| $10^7$ | ~0.5 seconds |
| $10^8$ | ~1 second (safe limit) |
| $10^9$ | ~10 seconds (too slow) |

### Choosing the right complexity for a given constraint

Given the input size $n$, you can work backwards to figure out the **maximum acceptable time complexity**:

| Constraint ($n$) | Maximum complexity | Examples |
|---|---|---|
| $n \le 10$ | $O(n!)$ or $O(2^n)$ | Brute-force permutations |
| $n \le 20$ | $O(2^n)$ | Bitmask DP |
| $n \le 500$ | $O(n^3)$ | Floyd–Warshall |
| $n \le 5{,}000$ | $O(n^2)$ | Bubble sort, brute-force pairs |
| $n \le 10^5$ | $O(n \log n)$ | Merge sort, binary search + loop |
| $n \le 10^6$ | $O(n)$ or $O(n \log n)$ | Two pointers, hash map |
| $n \le 10^9$ | $O(\log n)$ or $O(\sqrt{n})$ | Binary search, math formulas |

This table is incredibly useful during contests: look at the constraint, pick the complexity, and that tells you which algorithm family to use.

## Amortized time complexity

Some operations are expensive occasionally but cheap on average over a sequence of operations.

### Example: Dynamic array resizing

A dynamic array (like `std::vector`, `ArrayList`, or Python `list`) doubles its capacity when full. Let's trace what happens when we insert $n$ elements into an initially empty array:

| Insert # | Array size | Copy cost (if resize) |
|---|---|---|
| 1 | 1 → 2 | 1 |
| 2 | 2 → 4 | 2 |
| 3–4 | (no resize) | 0 |
| 5 | 4 → 8 | 4 |
| 6–8 | (no resize) | 0 |
| 9 | 8 → 16 | 8 |
| ... | ... | ... |

The resizing copies happen at insertions 1, 2, 4, 8, 16, ..., $2^k$. The total copy cost over $n$ insertions is:

$$1 + 2 + 4 + 8 + \cdots + 2^{\lfloor \log_2 n \rfloor} = 2^{\lfloor \log_2 n \rfloor + 1} - 1 < 2n$$

So the total cost of $n$ insertions is less than $3n$ (each insertion costs 1 for the write, plus at most $2n$ total for all copies). Dividing by $n$ insertions, each insertion costs $\frac{3n}{n} = 3 = O(1)$ **amortized**.

Think of it like this: you pay a little extra on cheap operations to "pre-pay" for the expensive ones.

## Common mistakes

1. **Hidden loops in library calls**: calling `.includes()`, `.indexOf()`, or `in` (for lists) inside a loop makes it $O(n^2)$, not $O(n)$ — the library call itself is $O(n)$.

2. **String concatenation in a loop**: in Java and Python, `s += char` inside a loop creates a new string each time. Over $n$ iterations, this is $O(n^2)$ total because each concatenation copies the growing string. Use `StringBuilder` (Java) or `''.join(list)` (Python) instead.

3. **Confusing O(1) with "fast"**: $O(1)$ means the time doesn't grow with input size, but that constant could be large. A hash map lookup is $O(1)$ but involves hashing — it could be slower than a simple $O(\log n)$ binary search for very small $n$.

4. **Forgetting the base case cost in recursion**: when analysing recursive algorithms, always check how much work each call does *besides* the recursive calls.

## Summary

- Count operations as a function of $n$, drop constants and lower-order terms.
- Always assume worst case unless stated otherwise.
- **Derive, don't memorize**: trace how the loop variable changes to find the iteration count mathematically.
- Common patterns and their derivations:
  - **O(1)**: no dependence on $n$.
  - **O(log n)**: input halves (or multiplies) each step → solve $2^k = n$.
  - **O(√n)**: loop runs up to $\sqrt{n}$ (e.g., primality check).
  - **O(n)**: single pass, counter increments by a constant.
  - **O(n log n)**: divide-and-conquer with $O(n)$ work per level and $\log n$ levels.
  - **O(n²)**: nested loops → sum $1 + 2 + \cdots + n = \frac{n(n+1)}{2}$.
  - **O(2ⁿ)**: two recursive branches per call.
- Use the constraint-to-complexity table to choose the right algorithm in interviews and contests.

Next: **Space Complexity →**
