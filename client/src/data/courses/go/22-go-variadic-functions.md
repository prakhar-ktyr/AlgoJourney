---
title: Go Variadic Functions
---

# Go Variadic Functions

A variadic function accepts a **variable number** of arguments. The built-in `fmt.Println` is a variadic function.

---

## Defining Variadic Functions

Use `...` before the type of the last parameter:

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

func main() {
    fmt.Println(sum(1, 2, 3))       // 6
    fmt.Println(sum(10, 20))        // 30
    fmt.Println(sum())              // 0
}
```

Inside the function, `nums` is a `[]int` (a slice).

---

## Mixing Regular and Variadic Parameters

Variadic parameters must be **last**:

```go
func greetAll(greeting string, names ...string) {
    for _, name := range names {
        fmt.Printf("%s, %s!\n", greeting, name)
    }
}

greetAll("Hello", "Alice", "Bob", "Carol")
// Hello, Alice!
// Hello, Bob!
// Hello, Carol!
```

---

## Passing a Slice to a Variadic Function

Use `...` to spread a slice:

```go
numbers := []int{1, 2, 3, 4, 5}
total := sum(numbers...)
fmt.Println(total)  // 15
```

---

## Real-World Example: Logger

```go
func logMessage(level string, parts ...interface{}) {
    fmt.Printf("[%s] ", level)
    fmt.Println(parts...)
}

logMessage("INFO", "Server started on port", 8080)
logMessage("ERROR", "Failed to connect:", "timeout")
```

Output:

```
[INFO] Server started on port 8080
[ERROR] Failed to connect: timeout
```

---

## Complete Example

```go
package main

import "fmt"

func max(nums ...int) int {
    if len(nums) == 0 {
        panic("max: no arguments")
    }
    m := nums[0]
    for _, n := range nums[1:] {
        if n > m {
            m = n
        }
    }
    return m
}

func joinWith(sep string, parts ...string) string {
    result := ""
    for i, p := range parts {
        if i > 0 {
            result += sep
        }
        result += p
    }
    return result
}

func main() {
    fmt.Println(max(3, 1, 4, 1, 5, 9))  // 9

    scores := []int{88, 95, 72, 91}
    fmt.Println(max(scores...))  // 95

    path := joinWith("/", "api", "v2", "users")
    fmt.Println(path)  // api/v2/users
}
```

---

Next: closures and anonymous functions.
