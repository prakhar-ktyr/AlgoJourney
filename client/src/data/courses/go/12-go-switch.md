---
title: Go Switch
---

# Go Switch

Go's `switch` is more powerful and flexible than in most languages. Cases don't fall through by default, and you can switch on any type — not just integers.

---

## Basic Switch

```go
day := "Tuesday"

switch day {
case "Monday":
    fmt.Println("Start of the week")
case "Tuesday":
    fmt.Println("Second day")
case "Friday":
    fmt.Println("Almost weekend!")
default:
    fmt.Println("Some other day")
}
```

- **No `break` needed** — Go only runs the matched case, then stops.
- `default` runs when no case matches (optional).

---

## Multiple Values Per Case

```go
day := "Saturday"

switch day {
case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
    fmt.Println("Weekday")
case "Saturday", "Sunday":
    fmt.Println("Weekend!")
}
```

---

## Switch with Init Statement

Like `if`, `switch` supports an init statement:

```go
switch os := runtime.GOOS; os {
case "darwin":
    fmt.Println("macOS")
case "linux":
    fmt.Println("Linux")
case "windows":
    fmt.Println("Windows")
default:
    fmt.Printf("Unknown: %s\n", os)
}
```

---

## Tagless Switch (Conditional Switch)

Omit the expression to write cleaner `if/else if` chains:

```go
score := 85

switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
case score >= 70:
    fmt.Println("C")
default:
    fmt.Println("F")
}
```

> [!TIP]
> Tagless `switch` is idiomatic Go when you have multiple conditions. It reads better than long `if/else if` chains.

---

## `fallthrough`

By default, Go exits the switch after the first matched case. Use `fallthrough` to continue to the next case **unconditionally**:

```go
x := 1

switch x {
case 1:
    fmt.Println("one")
    fallthrough
case 2:
    fmt.Println("two")
    fallthrough
case 3:
    fmt.Println("three")
}
```

Output:

```
one
two
three
```

> [!WARNING]
> `fallthrough` is rarely used. It executes the next case **without checking its condition**. In most cases, use multiple values per case instead.

---

## Switch on Types

Go can switch on the **type** of an interface value (covered in depth in the interfaces lesson):

```go
func describe(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("Integer: %d\n", v)
    case string:
        fmt.Printf("String: %q\n", v)
    case bool:
        fmt.Printf("Boolean: %t\n", v)
    default:
        fmt.Printf("Unknown type: %T\n", v)
    }
}

describe(42)       // Integer: 42
describe("hello")  // String: "hello"
describe(true)     // Boolean: true
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
    // Day of week
    switch today := time.Now().Weekday(); today {
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend!")
    default:
        fmt.Printf("It's %s — a weekday.\n", today)
    }

    // HTTP status code classifier
    status := 404

    switch {
    case status >= 200 && status < 300:
        fmt.Println("Success")
    case status >= 300 && status < 400:
        fmt.Println("Redirect")
    case status >= 400 && status < 500:
        fmt.Println("Client Error")
    case status >= 500:
        fmt.Println("Server Error")
    }

    // Month to season
    month := time.Now().Month()
    switch month {
    case time.December, time.January, time.February:
        fmt.Println("Winter")
    case time.March, time.April, time.May:
        fmt.Println("Spring")
    case time.June, time.July, time.August:
        fmt.Println("Summer")
    case time.September, time.October, time.November:
        fmt.Println("Autumn")
    }
}
```

---

Next: Go's `for` loop — the only loop construct in the language.
