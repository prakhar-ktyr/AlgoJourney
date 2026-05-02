---
title: Recursion Examples
---

# Recursion Examples

Let's build your recursion muscles with progressively harder problems. For each, we identify the base case, recursive case, and trace the execution.

## 1. Power function — xⁿ

Calculate x raised to the power n.

**Naive approach — O(n):**

```cpp
double power(double x, int n) {
    if (n == 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    return x * power(x, n - 1);
}
```

```java
double power(double x, int n) {
    if (n == 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    return x * power(x, n - 1);
}
```

```python
def power(x, n):
    if n == 0:
        return 1
    if n < 0:
        return 1.0 / power(x, -n)
    return x * power(x, n - 1)
```

```javascript
function power(x, n) {
    if (n === 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    return x * power(x, n - 1);
}
```

**Efficient approach — O(log n):**

Use the fact that x^n = (x^(n/2))² when n is even:

```cpp
double power(double x, int n) {
    if (n == 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    double half = power(x, n / 2);
    if (n % 2 == 0) return half * half;
    return x * half * half;
}
```

```java
double power(double x, int n) {
    if (n == 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    double half = power(x, n / 2);
    if (n % 2 == 0) return half * half;
    return x * half * half;
}
```

```python
def power(x, n):
    if n == 0:
        return 1
    if n < 0:
        return 1.0 / power(x, -n)
    half = power(x, n // 2)
    if n % 2 == 0:
        return half * half
    return x * half * half
```

```javascript
function power(x, n) {
    if (n === 0) return 1;
    if (n < 0) return 1.0 / power(x, -n);
    const half = power(x, Math.floor(n / 2));
    if (n % 2 === 0) return half * half;
    return x * half * half;
}
```

This cuts the problem in half each time → O(log n) time, O(log n) space.

## 2. Reverse a string

```cpp
#include <string>
using namespace std;

string reverseStr(const string& s) {
    if (s.length() <= 1) return s;  // base case
    return reverseStr(s.substr(1)) + s[0];
}
// "hello" → reverseStr("ello") + 'h'
//         → reverseStr("llo") + 'e' + 'h'
//         → ... → "olleh"
```

```java
String reverseStr(String s) {
    if (s.length() <= 1) return s;
    return reverseStr(s.substring(1)) + s.charAt(0);
}
```

```python
def reverse_str(s):
    if len(s) <= 1:
        return s
    return reverse_str(s[1:]) + s[0]
```

```javascript
function reverseStr(s) {
    if (s.length <= 1) return s;
    return reverseStr(s.slice(1)) + s[0];
}
```

Time: O(n²) because string concatenation creates a new string each time. An in-place iterative approach with two pointers is O(n) — recursion is not always the best tool.

## 3. Check if a string is a palindrome

```cpp
bool isPalindrome(const string& s, int left, int right) {
    if (left >= right) return true;   // base case
    if (s[left] != s[right]) return false;
    return isPalindrome(s, left + 1, right - 1);
}
// Usage: isPalindrome("racecar", 0, 6) → true
```

```java
boolean isPalindrome(String s, int left, int right) {
    if (left >= right) return true;
    if (s.charAt(left) != s.charAt(right)) return false;
    return isPalindrome(s, left + 1, right - 1);
}
```

```python
def is_palindrome(s, left, right):
    if left >= right:
        return True
    if s[left] != s[right]:
        return False
    return is_palindrome(s, left + 1, right - 1)
```

```javascript
function isPalindrome(s, left, right) {
    if (left >= right) return true;
    if (s[left] !== s[right]) return false;
    return isPalindrome(s, left + 1, right - 1);
}
```

Time: O(n), Space: O(n) call stack.

## 4. Count digits of a number

```cpp
int countDigits(int n) {
    if (n == 0) return 0;
    return 1 + countDigits(n / 10);
}
// 1234 → 1 + countDigits(123)
//      → 1 + 1 + countDigits(12)
//      → 1 + 1 + 1 + countDigits(1)
//      → 1 + 1 + 1 + 1 + countDigits(0)
//      → 4
```

```java
int countDigits(int n) {
    if (n == 0) return 0;
    return 1 + countDigits(n / 10);
}
```

```python
def count_digits(n):
    if n == 0:
        return 0
    return 1 + count_digits(n // 10)
```

```javascript
function countDigits(n) {
    if (n === 0) return 0;
    return 1 + countDigits(Math.floor(n / 10));
}
```

## 5. Print all subsequences of a string

This is a classic **backtracking** problem (we will cover backtracking in depth later). For each character, we have two choices: include it or skip it.

```cpp
#include <iostream>
#include <string>
using namespace std;

void subsequences(const string& s, int i, string current) {
    if (i == s.length()) {
        cout << "\"" << current << "\"" << endl;
        return;
    }
    // Choice 1: skip s[i]
    subsequences(s, i + 1, current);
    // Choice 2: include s[i]
    subsequences(s, i + 1, current + s[i]);
}
// subsequences("abc", 0, "") prints:
// "", "c", "b", "bc", "a", "ac", "ab", "abc"
```

```java
void subsequences(String s, int i, String current) {
    if (i == s.length()) {
        System.out.println("\"" + current + "\"");
        return;
    }
    subsequences(s, i + 1, current);              // skip
    subsequences(s, i + 1, current + s.charAt(i)); // include
}
```

```python
def subsequences(s, i, current):
    if i == len(s):
        print(f'"{current}"')
        return
    subsequences(s, i + 1, current)         # skip
    subsequences(s, i + 1, current + s[i])  # include
```

```javascript
function subsequences(s, i, current) {
    if (i === s.length) {
        console.log(`"${current}"`);
        return;
    }
    subsequences(s, i + 1, current);          // skip
    subsequences(s, i + 1, current + s[i]);   // include
}
```

Time: O(2ⁿ) — every character has two choices. Space: O(n) for the recursion depth.

## 6. Tower of Hanoi

Move n disks from peg A to peg C using peg B as auxiliary, following the rules:
1. Move only one disk at a time.
2. Never place a larger disk on top of a smaller one.

```cpp
void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);   // move n-1 disks to auxiliary
    cout << "Move disk " << n << " from " << from << " to " << to << endl;
    hanoi(n - 1, aux, to, from);   // move n-1 disks from auxiliary to target
}
// hanoi(3, 'A', 'C', 'B')
```

```java
void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, aux, to, from);
}
```

```python
def hanoi(n, from_peg, to_peg, aux_peg):
    if n == 0:
        return
    hanoi(n - 1, from_peg, aux_peg, to_peg)
    print(f"Move disk {n} from {from_peg} to {to_peg}")
    hanoi(n - 1, aux_peg, to_peg, from_peg)
```

```javascript
function hanoi(n, from, to, aux) {
    if (n === 0) return;
    hanoi(n - 1, from, aux, to);
    console.log(`Move disk ${n} from ${from} to ${to}`);
    hanoi(n - 1, aux, to, from);
}
```

Time: O(2ⁿ) — the minimum number of moves is 2ⁿ - 1.

## Key takeaways

1. **Identify the subproblem**: how does solving a smaller version help solve the original?
2. **Define the base case**: what is the simplest input that can be answered directly?
3. **Trust the recursion**: assume the recursive call works correctly, and build the answer from it.
4. **Watch for redundant work**: if the same subproblem is solved multiple times (like Fibonacci), use memoization.

Next: **Memoization →**
