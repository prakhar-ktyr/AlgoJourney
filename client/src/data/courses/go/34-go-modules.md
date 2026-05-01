---
title: Go Modules
---

# Go Modules

Go modules are the official dependency management system. They track your project's dependencies, versions, and checksums.

---

## Initializing a Module

```bash
mkdir myproject
cd myproject
go mod init github.com/username/myproject
```

This creates `go.mod`:

```
module github.com/username/myproject

go 1.22
```

For local projects, any name works:

```bash
go mod init myproject
```

---

## The `go.mod` File

```
module github.com/username/myproject

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
    golang.org/x/sync v0.6.0
)
```

- `module` — your module's import path
- `go` — minimum Go version
- `require` — dependencies and their versions

---

## Adding Dependencies

### Automatically

Just import a package and run your code — Go downloads it:

```go
import "github.com/fatih/color"
```

```bash
go mod tidy    # adds missing, removes unused
```

### Explicitly

```bash
go get github.com/gin-gonic/gin@latest
go get github.com/gin-gonic/gin@v1.9.1   # specific version
```

---

## The `go.sum` File

`go.sum` contains cryptographic checksums of all dependencies:

```
github.com/gin-gonic/gin v1.9.1 h1:4+fr/el88TOO3...
github.com/gin-gonic/gin v1.9.1/go.mod h1:RjS210...
```

> [!NOTE]
> Always commit both `go.mod` and `go.sum` to version control. They ensure reproducible builds.

---

## Common `go mod` Commands

| Command | What It Does |
|---------|-------------|
| `go mod init <name>` | Initialize a new module |
| `go mod tidy` | Add missing / remove unused dependencies |
| `go mod download` | Download all dependencies to cache |
| `go mod vendor` | Copy dependencies into `vendor/` |
| `go mod graph` | Print dependency graph |
| `go mod verify` | Verify checksums |

---

## Semantic Versioning

Go modules use semver: `vMAJOR.MINOR.PATCH`

| Part | Meaning | Example |
|------|---------|---------|
| MAJOR | Breaking changes | v1 → v2 |
| MINOR | New features, backward-compatible | v1.1 → v1.2 |
| PATCH | Bug fixes | v1.2.0 → v1.2.1 |

Versions v2+ must include the major version in the import path:

```go
import "github.com/example/pkg/v2"
```

---

## Updating Dependencies

```bash
# Update a specific package
go get github.com/gin-gonic/gin@latest

# Update all dependencies
go get -u ./...

# Update patch versions only
go get -u=patch ./...
```

---

## Local Modules with `replace`

For development, point to a local copy:

```
module myproject

go 1.22

require github.com/myorg/mylib v1.0.0

replace github.com/myorg/mylib => ../mylib
```

> [!WARNING]
> Remove `replace` directives before publishing. They're for local development only.

---

## Multi-Module Workspaces

Go 1.18+ supports workspaces for working with multiple local modules:

```bash
go work init ./frontend ./backend
```

Creates `go.work`:

```
go 1.22

use (
    ./frontend
    ./backend
)
```

---

## Complete Example

```bash
# Create a new project
mkdir weather-cli && cd weather-cli
go mod init weather-cli

# Create main.go
cat > main.go << 'EOF'
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
)

type Weather struct {
    Main struct {
        Temp float64 `json:"temp"`
    } `json:"main"`
    Weather []struct {
        Description string `json:"description"`
    } `json:"weather"`
}

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: weather-cli <city>")
        os.Exit(1)
    }

    city := os.Args[1]
    url := fmt.Sprintf("https://api.example.com/weather?q=%s", city)

    resp, err := http.Get(url)
    if err != nil {
        fmt.Println("Error:", err)
        os.Exit(1)
    }
    defer resp.Body.Close()

    var w Weather
    json.NewDecoder(resp.Body).Decode(&w)
    fmt.Printf("Temperature: %.1f°C\n", w.Main.Temp)
}
EOF

# Clean up dependencies
go mod tidy
```

---

Next: testing Go code with the built-in `testing` package.
