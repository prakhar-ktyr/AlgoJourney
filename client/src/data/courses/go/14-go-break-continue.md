---
title: Go Break and Continue
---

# Go Break and Continue

`break` and `continue` control loop flow. Go also supports **labels** that let you break or continue outer loops.

---

## Break

`break` exits the innermost loop immediately:

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break
    }
    fmt.Println(i)
}
// Output: 0, 1, 2, 3, 4
```

---

## Continue

`continue` skips the rest of the current iteration and moves to the next:

```go
for i := 0; i < 10; i++ {
    if i%2 == 0 {
        continue  // skip even numbers
    }
    fmt.Println(i)
}
// Output: 1, 3, 5, 7, 9
```

---

## Labels

Labels let you target a specific outer loop with `break` or `continue`:

### Breaking an Outer Loop

```go
outer:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if i == 1 && j == 1 {
                break outer  // exits BOTH loops
            }
            fmt.Printf("(%d,%d) ", i, j)
        }
    }
fmt.Println("\nDone")
```

Output:

```
(0,0) (0,1) (0,2) (1,0) 
Done
```

Without the label, `break` would only exit the inner loop.

### Continuing an Outer Loop

```go
outer:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if j == 1 {
                continue outer  // skip to next i
            }
            fmt.Printf("(%d,%d) ", i, j)
        }
    }
```

Output:

```
(0,0) (1,0) (2,0) 
```

---

## Break in Switch Inside a Loop

When `switch` is inside a loop, `break` inside the switch only exits the switch — not the loop. Use a label to break the loop:

```go
loop:
    for i := 0; i < 10; i++ {
        switch i {
        case 5:
            fmt.Println("Breaking the loop at 5")
            break loop  // without label, only breaks the switch
        }
        fmt.Println(i)
    }
```

---

## Complete Example

```go
package main

import "fmt"

func main() {
    // Find first number divisible by both 3 and 7
    for i := 1; i <= 100; i++ {
        if i%3 != 0 {
            continue
        }
        if i%7 != 0 {
            continue
        }
        fmt.Printf("First number divisible by 3 and 7: %d\n", i)
        break
    }

    // Search in a 2D grid
    grid := [][]int{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9},
    }
    target := 5

search:
    for row, cols := range grid {
        for col, val := range cols {
            if val == target {
                fmt.Printf("Found %d at row %d, col %d\n", target, row, col)
                break search
            }
        }
    }

    // Skip multiples of 3
    fmt.Print("Non-multiples of 3 (1-15): ")
    for i := 1; i <= 15; i++ {
        if i%3 == 0 {
            continue
        }
        fmt.Printf("%d ", i)
    }
    fmt.Println()
}
```

Output:

```
First number divisible by 3 and 7: 21
Found 5 at row 1, col 1
Non-multiples of 3 (1-15): 1 2 4 5 7 8 10 11 13 14 
```

---

Next: `defer`, `goto`, and labeled statements.
