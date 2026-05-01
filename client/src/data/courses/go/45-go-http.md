---
title: Go HTTP
---

# Go HTTP

Go's `net/http` package provides a production-ready HTTP server and client — no frameworks needed.

---

## Simple HTTP Server

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, World!")
    })

    http.HandleFunc("/greet", func(w http.ResponseWriter, r *http.Request) {
        name := r.URL.Query().Get("name")
        if name == "" {
            name = "stranger"
        }
        fmt.Fprintf(w, "Hello, %s!", name)
    })

    fmt.Println("Server running on :8080")
    http.ListenAndServe(":8080", nil)
}
```

Visit `http://localhost:8080/greet?name=Alice`

---

## Handling JSON

```go
type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func handleUsers(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case "GET":
        users := []User{{Name: "Alice", Email: "alice@example.com"}}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)

    case "POST":
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(user)

    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}
```

---

## `http.ServeMux` (Go 1.22+ Enhanced Routing)

```go
mux := http.NewServeMux()

mux.HandleFunc("GET /api/users", getUsers)
mux.HandleFunc("POST /api/users", createUser)
mux.HandleFunc("GET /api/users/{id}", getUser)
mux.HandleFunc("DELETE /api/users/{id}", deleteUser)

http.ListenAndServe(":8080", mux)
```

Access path parameters:

```go
func getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    fmt.Fprintf(w, "User ID: %s", id)
}
```

> [!NOTE]
> Method-based and parameterized routing was added in Go 1.22. Older versions need third-party routers for this functionality.

---

## Middleware

Middleware wraps handlers to add cross-cutting concerns:

```go
func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func cors(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        next.ServeHTTP(w, r)
    })
}

// Chain middleware
handler := logging(cors(mux))
http.ListenAndServe(":8080", handler)
```

---

## HTTP Client

### Simple GET

```go
resp, err := http.Get("https://api.example.com/data")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

body, _ := io.ReadAll(resp.Body)
fmt.Println(string(body))
```

### POST with JSON

```go
user := User{Name: "Alice", Email: "alice@example.com"}
data, _ := json.Marshal(user)

resp, err := http.Post(
    "https://api.example.com/users",
    "application/json",
    bytes.NewReader(data),
)
defer resp.Body.Close()
```

### Custom Client with Timeout

```go
client := &http.Client{
    Timeout: 10 * time.Second,
}

req, _ := http.NewRequest("GET", "https://api.example.com/data", nil)
req.Header.Set("Authorization", "Bearer token123")

resp, err := client.Do(req)
```

> [!TIP]
> Always set a timeout on HTTP clients. The default client has no timeout and can hang forever.

---

## Serving Static Files

```go
fs := http.FileServer(http.Dir("./static"))
mux.Handle("/static/", http.StripPrefix("/static/", fs))
```

---

## Complete Example

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

type Todo struct {
    ID    int    `json:"id"`
    Title string `json:"title"`
    Done  bool   `json:"done"`
}

var (
    todos  = []Todo{}
    mu     sync.Mutex
    nextID = 1
)

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/todos", func(w http.ResponseWriter, r *http.Request) {
        mu.Lock()
        defer mu.Unlock()
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(todos)
    })

    mux.HandleFunc("POST /api/todos", func(w http.ResponseWriter, r *http.Request) {
        var t Todo
        if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
            http.Error(w, err.Error(), 400)
            return
        }
        mu.Lock()
        t.ID = nextID
        nextID++
        todos = append(todos, t)
        mu.Unlock()

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(t)
    })

    // Logging middleware
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        mux.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })

    fmt.Println("Todo API running on :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

---

Next: the `context` package for cancellation and deadlines.
