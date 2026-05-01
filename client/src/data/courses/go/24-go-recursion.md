---
title: Go Recursion
---

# Go Recursion

Recursion is when a function calls itself. It's a natural fit for problems that can be broken into smaller subproblems.

---

## Basic Recursion

```go
func factorial(n int) int {
    if n <= 1 {
        return 1  // base case
    }
    return n * factorial(n-1)  // recursive case
}

func main() {
    fmt.Println(factorial(5))  // 120
    fmt.Println(factorial(0))  // 1
}
```

Every recursive function needs:
1. **Base case** — when to stop
2. **Recursive case** — the function calls itself with a "smaller" problem

---

## How Recursion Works

`factorial(4)` unfolds like this:

```
factorial(4)
  → 4 * factorial(3)
    → 3 * factorial(2)
      → 2 * factorial(1)
        → 1  (base case)
      → 2 * 1 = 2
    → 3 * 2 = 6
  → 4 * 6 = 24
```

---

## Fibonacci

```go
func fib(n int) int {
    if n <= 1 {
        return n
    }
    return fib(n-1) + fib(n-2)
}

for i := 0; i < 10; i++ {
    fmt.Printf("%d ", fib(i))
}
// 0 1 1 2 3 5 8 13 21 34
```

> [!WARNING]
> Naive Fibonacci is O(2ⁿ). For larger values, use iteration or memoization.

---

## Recursion vs Iteration

Most recursive solutions can be rewritten iteratively:

```go
// Recursive
func sumRecursive(n int) int {
    if n <= 0 {
        return 0
    }
    return n + sumRecursive(n-1)
}

// Iterative (more efficient)
func sumIterative(n int) int {
    total := 0
    for i := 1; i <= n; i++ {
        total += i
    }
    return total
}
```

> [!NOTE]
> Go does **not** optimize tail recursion. Deep recursion can cause a stack overflow. Use iteration for performance-critical or deeply nested cases.

---

## Stack Overflow

Go goroutines start with a small stack (a few KB) that grows dynamically, but very deep recursion can still exhaust memory:

```go
func infinite(n int) {
    infinite(n + 1)  // will eventually crash
}
```

---

## Recursive Data Structures

Recursion is natural for tree-like structures:

```go
type TreeNode struct {
    Value int
    Left  *TreeNode
    Right *TreeNode
}

func sum(node *TreeNode) int {
    if node == nil {
        return 0
    }
    return node.Value + sum(node.Left) + sum(node.Right)
}
```

---

## Complete Example

```go
package main

import "fmt"

// Greatest Common Divisor (Euclid's algorithm)
func gcd(a, b int) int {
    if b == 0 {
        return a
    }
    return gcd(b, a%b)
}

// Power: base^exp
func power(base, exp int) int {
    if exp == 0 {
        return 1
    }
    return base * power(base, exp-1)
}

// Reverse a string
func reverse(s string) string {
    if len(s) <= 1 {
        return s
    }
    return reverse(s[1:]) + string(s[0])
}

func main() {
    fmt.Println("GCD(48, 18):", gcd(48, 18))    // 6
    fmt.Println("2^10:", power(2, 10))            // 1024
    fmt.Println("Reverse:", reverse("GoLang"))    // gnaLoG
}
```

---

Next: methods — functions attached to types.
