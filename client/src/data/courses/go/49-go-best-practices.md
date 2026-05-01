---
title: Go Best Practices
---

# Go Best Practices

This lesson distills the most important patterns and conventions that experienced Go developers follow. Writing idiomatic Go makes your code readable, maintainable, and consistent with the ecosystem.

---

## Error Handling

### Always Handle Errors

```go
// ❌ Never ignore errors
data, _ := os.ReadFile("config.json")

// ✅ Handle them
data, err := os.ReadFile("config.json")
if err != nil {
    return fmt.Errorf("loading config: %w", err)
}
```

### Wrap Errors with Context

```go
// ❌ Loses context
return err

// ✅ Adds context
return fmt.Errorf("connecting to %s: %w", host, err)
```

### Use Sentinel Errors and Custom Types

```go
var ErrNotFound = errors.New("not found")

// Check with errors.Is
if errors.Is(err, ErrNotFound) { ... }
```

---

## Naming

### Keep Names Short

```go
// ✅ Go style
func (s *Server) handleConn(c net.Conn) error
for i, v := range items { ... }

// ❌ Verbose
func (server *Server) handleConnection(connection net.Conn) error
for index, value := range itemSlice { ... }
```

### Acronyms Stay Uppercase

```go
type HTTPClient struct{}   // not HttpClient
type UserID int            // not UserId
func ParseURL(s string)    // not ParseUrl
```

### Interface Names

Single-method interfaces use method name + "er":

```go
type Reader interface { Read([]byte) (int, error) }
type Stringer interface { String() string }
type Handler interface { Handle() }
```

---

## Project Layout

```
myproject/
├── cmd/
│   └── server/
│       └── main.go        # entry point
├── internal/
│   ├── handler/           # HTTP handlers
│   ├── service/           # business logic
│   └── repository/        # data access
├── pkg/                   # public libraries
├── go.mod
├── go.sum
└── README.md
```

- `cmd/` — one subdirectory per executable
- `internal/` — private packages
- `pkg/` — public reusable packages

---

## Accept Interfaces, Return Structs

```go
// ✅ Accept interface — flexible for callers
func Process(r io.Reader) error { ... }

// ✅ Return concrete type — gives callers full access
func NewServer(cfg Config) *Server { ... }
```

---

## Table-Driven Tests

```go
func TestParse(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int
        wantErr bool
    }{
        {"valid", "42", 42, false},
        {"negative", "-1", -1, false},
        {"invalid", "abc", 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Parse(tt.input)
            if (err != nil) != tt.wantErr {
                t.Fatalf("err = %v, wantErr = %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("got %d, want %d", got, tt.want)
            }
        })
    }
}
```

---

## Defer for Cleanup

```go
f, err := os.Open(path)
if err != nil {
    return err
}
defer f.Close()  // right after successful open
```

---

## Use Context for Cancellation

```go
func fetchData(ctx context.Context, url string) ([]byte, error) {
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }
    // ...
}
```

---

## Concurrency Guidelines

1. **Don't start goroutines without knowing how they'll stop.**
2. **Use `sync.WaitGroup` to wait for goroutines.**
3. **Use `context.Context` for cancellation.**
4. **Avoid shared mutable state** — prefer channels.
5. **Run tests with `-race`** to detect data races.

```bash
go test -race ./...
```

---

## Common Anti-Patterns

| Anti-Pattern | Better Alternative |
|-------------|-------------------|
| `panic` for normal errors | Return `error` |
| `interface{}` everywhere | Use generics or specific interfaces |
| Global mutable state | Dependency injection |
| `init()` for complex setup | Explicit initialization functions |
| Ignoring `context.Context` | Pass context through all I/O functions |

---

## Go Proverbs

A few wisdoms from Rob Pike:

- Don't communicate by sharing memory; share memory by communicating.
- A little copying is better than a little dependency.
- Clear is better than clever.
- The bigger the interface, the weaker the abstraction.
- Make the zero value useful.
- `interface{}` says nothing.
- Errors are values.

---

Next: what to learn after this course.
