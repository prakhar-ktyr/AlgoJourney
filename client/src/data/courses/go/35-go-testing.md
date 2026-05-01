---
title: Go Testing
---

# Go Testing

Go has a built-in testing framework — no third-party libraries needed. Write tests, benchmarks, and examples all with the standard `testing` package.

---

## Your First Test

For a function in `math.go`:

```go
package mathutil

func Add(a, b int) int {
    return a + b
}
```

Create `math_test.go` (must end in `_test.go`):

```go
package mathutil

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
```

Run:

```bash
go test ./...
```

---

## Test Naming Rules

- File: `*_test.go`
- Function: `TestXxx(t *testing.T)` — must start with `Test` + uppercase letter
- Package: same package for white-box testing, `_test` suffix for black-box

---

## Test Methods

| Method | Behavior |
|--------|----------|
| `t.Error(args...)` | Log + mark failed, continue |
| `t.Errorf(format, args...)` | Formatted error, continue |
| `t.Fatal(args...)` | Log + mark failed, stop test |
| `t.Fatalf(format, args...)` | Formatted fatal, stop test |
| `t.Log(args...)` | Log message (shown with -v) |
| `t.Skip(args...)` | Skip this test |

---

## Table-Driven Tests

The idiomatic Go testing pattern:

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"zero", 0, 0, 0},
        {"mixed", -5, 10, 5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d",
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

> [!TIP]
> Table-driven tests are the Go standard. They're easy to extend — just add a row.

---

## Running Tests

```bash
go test                     # current package
go test ./...               # all packages
go test -v                  # verbose output
go test -run TestAdd        # run specific test
go test -run TestAdd/zero   # run specific subtest
go test -count=1            # disable caching
go test -cover              # show coverage percentage
go test -coverprofile=c.out # generate coverage file
go tool cover -html=c.out   # view coverage in browser
```

---

## Test Setup and Teardown

### Per-Test

```go
func TestSomething(t *testing.T) {
    // setup
    db := setupTestDB()
    defer db.Close()  // teardown

    // test logic
}
```

### Per-Package with `TestMain`

```go
func TestMain(m *testing.M) {
    // Global setup
    setup()

    code := m.Run()  // run all tests

    // Global teardown
    teardown()

    os.Exit(code)
}
```

---

## Benchmarks

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(100, 200)
    }
}
```

```bash
go test -bench=. -benchmem
```

Output:

```
BenchmarkAdd-8    1000000000    0.3 ns/op    0 B/op    0 allocs/op
```

---

## Example Tests

Example tests serve as documentation **and** tests:

```go
func ExampleAdd() {
    fmt.Println(Add(2, 3))
    // Output: 5
}
```

The `// Output:` comment is verified by `go test`.

---

## Test Helpers

Use `t.Helper()` to mark helper functions so errors report the caller's line:

```go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()
    if got != want {
        t.Errorf("got %d; want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // error points here, not inside assertEqual
}
```

---

## Complete Example

```go
package stringutil

import (
    "fmt"
    "testing"
)

func Reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

func TestReverse(t *testing.T) {
    tests := []struct {
        input, want string
    }{
        {"hello", "olleh"},
        {"", ""},
        {"a", "a"},
        {"Go 🚀", "🚀 oG"},
    }

    for _, tt := range tests {
        t.Run(tt.input, func(t *testing.T) {
            got := Reverse(tt.input)
            if got != tt.want {
                t.Errorf("Reverse(%q) = %q; want %q", tt.input, got, tt.want)
            }
        })
    }
}

func ExampleReverse() {
    fmt.Println(Reverse("Hello"))
    // Output: olleH
}

func BenchmarkReverse(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Reverse("Hello, World!")
    }
}
```

---

Next: goroutines — Go's lightweight concurrency model.
