---
title: Go If/Else
---

# Go If/Else

Go's `if` statement controls conditional execution. It looks similar to other languages but has some unique features.

---

## Basic If

```go
x := 10

if x > 5 {
    fmt.Println("x is greater than 5")
}
```

- Parentheses around the condition are **not needed** (and discouraged).
- Curly braces are **always required**, even for single statements.

---

## If/Else

```go
temperature := 35

if temperature > 30 {
    fmt.Println("It's hot!")
} else {
    fmt.Println("It's comfortable.")
}
```

The `else` keyword must be on the **same line** as the closing brace:

```go
// ✅ Correct
if x > 0 {
    // ...
} else {
    // ...
}

// ❌ Compile error
if x > 0 {
    // ...
}
else {
    // ...
}
```

---

## Else If

```go
score := 85

if score >= 90 {
    fmt.Println("Grade: A")
} else if score >= 80 {
    fmt.Println("Grade: B")
} else if score >= 70 {
    fmt.Println("Grade: C")
} else {
    fmt.Println("Grade: F")
}
```

---

## If with Init Statement

Go's `if` can include a **short statement** before the condition, separated by a semicolon. The variable is scoped to the `if`/`else` block:

```go
if length := len("hello"); length > 3 {
    fmt.Printf("Long string (%d chars)\n", length)
} else {
    fmt.Printf("Short string (%d chars)\n", length)
}

// fmt.Println(length)  // ❌ length is not accessible here
```

This pattern is extremely common with error handling:

```go
if err := doSomething(); err != nil {
    fmt.Println("Error:", err)
    return
}
```

> [!TIP]
> The init statement is idiomatic Go. It keeps variables tightly scoped to where they're used.

---

## No Ternary Operator

Go deliberately has **no ternary operator** (`? :`). Use an `if` statement instead:

```go
// ❌ This does NOT exist in Go
// result := condition ? "yes" : "no"

// ✅ Use if/else
var result string
if condition {
    result = "yes"
} else {
    result = "no"
}
```

---

## Nested If

```go
age := 25
hasLicense := true

if age >= 18 {
    if hasLicense {
        fmt.Println("You can drive")
    } else {
        fmt.Println("Get a license first")
    }
} else {
    fmt.Println("Too young to drive")
}
```

Prefer combining conditions over deep nesting:

```go
if age >= 18 && hasLicense {
    fmt.Println("You can drive")
}
```

---

## Complete Example

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    if hour := time.Now().Hour(); hour < 12 {
        fmt.Println("Good morning!")
    } else if hour < 17 {
        fmt.Println("Good afternoon!")
    } else if hour < 21 {
        fmt.Println("Good evening!")
    } else {
        fmt.Println("Good night!")
    }

    // Number classifier
    num := -7
    if num > 0 {
        fmt.Printf("%d is positive\n", num)
    } else if num < 0 {
        fmt.Printf("%d is negative\n", num)
    } else {
        fmt.Println("Zero!")
    }

    // Even/Odd
    if num%2 == 0 {
        fmt.Printf("%d is even\n", num)
    } else {
        fmt.Printf("%d is odd\n", num)
    }
}
```

---

Next: Go's powerful `switch` statement.
