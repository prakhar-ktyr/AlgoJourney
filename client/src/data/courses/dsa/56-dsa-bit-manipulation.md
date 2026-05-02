---
title: Bit Manipulation
---

# Bit Manipulation

Bit manipulation operates directly on the binary representation of integers. It enables O(1) tricks for tasks that would otherwise require loops, and it's a staple of competitive programming and systems-level code.

---

## Binary Number Basics

Every integer is stored as a sequence of bits (0s and 1s). For example, the decimal number **13** in binary is `1101`:

```
Position:  3  2  1  0
Bits:      1  1  0  1
Value:     8+ 4+ 0+ 1 = 13
```

---

## Bitwise Operators

| Operator | Symbol (C/Java/JS) | Python | Description |
|----------|---------------------|--------|-------------|
| AND | `&` | `&` | 1 only if both bits are 1 |
| OR | `\|` | `\|` | 1 if at least one bit is 1 |
| XOR | `^` | `^` | 1 if bits differ |
| NOT | `~` | `~` | Flips all bits |
| Left Shift | `<<` | `<<` | Shifts bits left (×2) |
| Right Shift | `>>` | `>>` | Shifts bits right (÷2) |

### Truth Table

```
A  B | A&B | A|B | A^B
0  0 |  0  |  0  |  0
0  1 |  0  |  1  |  1
1  0 |  0  |  1  |  1
1  1 |  1  |  1  |  0
```

---

## Common Tricks

### 1. Check if a Number is a Power of 2

A power of 2 has exactly one bit set: `n & (n - 1) == 0`.

```
  n   = 1000  (8)
  n-1 = 0111  (7)
  n & (n-1) = 0000 → power of 2!
```

### 2. Count Set Bits (Hamming Weight / popcount)

Repeatedly clear the lowest set bit: `n = n & (n - 1)`.

### 3. Single Number (XOR trick)

If every element appears twice except one, XOR all elements — duplicates cancel out and the unique one remains.

```
a ^ a = 0
a ^ 0 = a
```

---

## Problem 1: Check Power of 2

```cpp
#include <iostream>
using namespace std;

bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

int main() {
    cout << isPowerOfTwo(16) << endl; // 1 (true)
    cout << isPowerOfTwo(18) << endl; // 0 (false)
    return 0;
}
```

```java
public class BitManipulation {
    public static boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    public static void main(String[] args) {
        System.out.println(isPowerOfTwo(16)); // true
        System.out.println(isPowerOfTwo(18)); // false
    }
}
```

```python
def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

print(is_power_of_two(16))  # True
print(is_power_of_two(18))  # False
```

```javascript
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(18)); // false
```

---

## Problem 2: Count Set Bits (Brian Kernighan's Algorithm)

Count how many 1-bits an integer has.

**Idea:** `n & (n - 1)` drops the lowest set bit. Count how many times you can do this before n becomes 0.

**Time:** O(number of set bits)

```cpp
#include <iostream>
using namespace std;

int countBits(int n) {
    int count = 0;
    while (n) {
        n &= (n - 1); // clear lowest set bit
        count++;
    }
    return count;
}

int main() {
    cout << countBits(13) << endl; // 3 (binary 1101)
    cout << countBits(255) << endl; // 8 (binary 11111111)
    return 0;
}
```

```java
public class CountBits {
    public static int countBits(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countBits(13));  // 3
        System.out.println(countBits(255)); // 8
    }
}
```

```python
def count_bits(n):
    count = 0
    while n:
        n &= (n - 1)
        count += 1
    return count

print(count_bits(13))   # 3
print(count_bits(255))  # 8
```

```javascript
function countBits(n) {
  let count = 0;
  while (n) {
    n &= (n - 1);
    count++;
  }
  return count;
}

console.log(countBits(13));  // 3
console.log(countBits(255)); // 8
```

---

## Problem 3: Single Number (XOR)

Given an array where every element appears **twice** except one, find the unique element.

**Time:** O(n), **Space:** O(1)

```cpp
#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}

int main() {
    vector<int> nums = {4, 1, 2, 1, 2};
    cout << singleNumber(nums) << endl; // 4
    return 0;
}
```

```java
public class SingleNumber {
    public static int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {4, 1, 2, 1, 2};
        System.out.println(singleNumber(nums)); // 4
    }
}
```

```python
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

print(single_number([4, 1, 2, 1, 2]))  # 4
```

```javascript
function singleNumber(nums) {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4
```

---

## Useful Bit Manipulation Cheat Sheet

| Operation | Expression | Example |
|-----------|-----------|---------|
| Get i-th bit | `(n >> i) & 1` | bit 2 of 13 (1101) → 1 |
| Set i-th bit | `n \| (1 << i)` | set bit 1 of 13 → 1111 = 15 |
| Clear i-th bit | `n & ~(1 << i)` | clear bit 2 of 13 → 1001 = 9 |
| Toggle i-th bit | `n ^ (1 << i)` | toggle bit 0 of 13 → 1100 = 12 |
| Lowest set bit | `n & (-n)` | lowest bit of 12 (1100) → 0100 = 4 |
| Clear lowest set bit | `n & (n - 1)` | 12 → 1000 = 8 |
| Check if power of 2 | `n & (n - 1) == 0` | 16 → true |

---

## Key Takeaways

1. **XOR** is your best friend — it cancels duplicates and is its own inverse.
2. `n & (n - 1)` clears the lowest set bit — the basis for counting bits and power-of-2 checks.
3. Bit manipulation gives O(1) solutions for many problems that would otherwise need extra data structures.
4. Always be mindful of **signed vs. unsigned** integers and language-specific behavior (Python has arbitrary-precision ints; C/Java/JS have fixed widths).

---

Next: **Greedy Algorithms →**
