---
title: Go Error Handling
---

# Go Error Handling

Go handles errors explicitly through return values — no exceptions, no try/catch. This makes error paths visible and forces you to deal with them.

---

## The `error` Type

`error` is a built-in interface:

```go
type error interface {
    Error() string
}
```

Functions that can fail return an `error` as the last value:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

---

## Checking Errors

The standard pattern:

```go
result, err := divide(10, 0)
if err != nil {
    fmt.Println("Error:", err)
    return
}
fmt.Println("Result:", result)
```

> [!IMPORTANT]
> **Always** check errors. Ignoring them is the most common source of bugs in Go.

---

## Creating Errors

### `errors.New`

```go
import "errors"

err := errors.New("something went wrong")
```

### `fmt.Errorf`

```go
name := "config.json"
err := fmt.Errorf("file not found: %s", name)
```

---

## Custom Error Types

Create your own error types with additional context:

```go
type NotFoundError struct {
    Resource string
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s with ID %d not found", e.Resource, e.ID)
}

func findUser(id int) (*User, error) {
    // ... lookup fails
    return nil, &NotFoundError{Resource: "User", ID: id}
}
```

---

## Error Wrapping (`%w`)

Wrap errors to add context while preserving the original:

```go
func readConfig(path string) error {
    data, err := os.ReadFile(path)
    if err != nil {
        return fmt.Errorf("readConfig: %w", err)
    }
    // ... parse data
    return nil
}
```

---

## Unwrapping Errors

### `errors.Is` — check for a specific error value

```go
if errors.Is(err, os.ErrNotExist) {
    fmt.Println("File does not exist")
}
```

### `errors.As` — check for a specific error type

```go
var notFound *NotFoundError
if errors.As(err, &notFound) {
    fmt.Printf("Missing: %s #%d\n", notFound.Resource, notFound.ID)
}
```

---

## Sentinel Errors

Pre-defined error values for known conditions:

```go
var (
    ErrNotFound   = errors.New("not found")
    ErrForbidden  = errors.New("forbidden")
    ErrBadRequest = errors.New("bad request")
)

func getItem(id int) (string, error) {
    if id <= 0 {
        return "", ErrBadRequest
    }
    if id > 100 {
        return "", ErrNotFound
    }
    return "item", nil
}
```

---

## Error Handling Patterns

### Early Return (Guard Clause)

```go
func process(data []byte) error {
    if len(data) == 0 {
        return errors.New("empty data")
    }
    if data[0] != '{' {
        return errors.New("invalid format")
    }
    // ... main logic
    return nil
}
```

### Collecting Multiple Errors

```go
func validate(user User) error {
    var errs []string
    if user.Name == "" {
        errs = append(errs, "name is required")
    }
    if user.Age < 0 {
        errs = append(errs, "age must be positive")
    }
    if len(errs) > 0 {
        return fmt.Errorf("validation: %s", strings.Join(errs, "; "))
    }
    return nil
}
```

---

## Complete Example

```go
package main

import (
    "errors"
    "fmt"
    "strconv"
)

var ErrNegative = errors.New("negative number not allowed")

func parsePositive(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("parsePositive(%q): %w", s, err)
    }
    if n < 0 {
        return 0, fmt.Errorf("parsePositive(%q): %w", s, ErrNegative)
    }
    return n, nil
}

func main() {
    inputs := []string{"42", "-5", "abc", "100"}

    for _, input := range inputs {
        n, err := parsePositive(input)
        if err != nil {
            if errors.Is(err, ErrNegative) {
                fmt.Printf("  %q → rejected (negative)\n", input)
            } else {
                fmt.Printf("  %q → error: %v\n", input, err)
            }
            continue
        }
        fmt.Printf("  %q → %d ✓\n", input, n)
    }
}
```

Output:

```
  "42" → 42 ✓
  "-5" → rejected (negative)
  "abc" → error: parsePositive("abc"): strconv.Atoi: parsing "abc": invalid syntax
  "100" → 100 ✓
```

---

Next: `panic` and `recover` — for truly exceptional situations.
