---
title: Go Build and Tools
---

# Go Build & Tools

Go ships with a comprehensive toolchain. This lesson covers building, testing, linting, cross-compilation, and the essential tools every Go developer should know.

---

## Building

### Basic Build

```bash
go build                    # build current package
go build -o myapp           # specify output name
go build ./cmd/server       # build a specific package
```

### Install (build + move to GOPATH/bin)

```bash
go install                           # install current package
go install github.com/user/tool@latest  # install a remote tool
```

---

## Cross-Compilation

Build for any platform with `GOOS` and `GOARCH`:

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o myapp-linux

# Windows
GOOS=windows GOARCH=amd64 go build -o myapp.exe

# macOS ARM
GOOS=darwin GOARCH=arm64 go build -o myapp-mac

# List all supported platforms
go tool dist list
```

> [!TIP]
> Go cross-compiles with zero setup — no toolchains to install. Just set two environment variables.

---

## Build Tags

Conditionally include files at compile time:

```go
//go:build linux
// +build linux

package mypackage
// This file is only compiled on Linux
```

Custom tags:

```bash
go build -tags "debug,integration"
```

---

## `go vet` — Static Analysis

Finds common mistakes:

```bash
go vet ./...
```

Catches: printf format errors, unreachable code, mutex copy, and more.

---

## `golangci-lint` — Comprehensive Linting

```bash
# Install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run
golangci-lint run
```

Runs 50+ linters including `vet`, `staticcheck`, `errcheck`, `gosimple`, and more.

---

## Code Generation

### `go generate`

```go
//go:generate stringer -type=Color
type Color int

const (
    Red Color = iota
    Green
    Blue
)
```

```bash
go generate ./...
```

### `go:embed`

Embed files into the binary:

```go
import "embed"

//go:embed templates/*
var templates embed.FS

//go:embed version.txt
var version string
```

---

## Essential Tools

| Tool | Purpose | Install |
|------|---------|---------|
| `gofmt` | Code formatter | Built-in |
| `go vet` | Static analyzer | Built-in |
| `gopls` | Language server (LSP) | `go install golang.org/x/tools/gopls@latest` |
| `golangci-lint` | Meta-linter | `go install github.com/golangci/...` |
| `dlv` | Debugger | `go install github.com/go-delve/delve/cmd/dlv@latest` |
| `pprof` | Profiler | Built-in (`net/http/pprof`) |

---

## Profiling

### CPU Profile

```go
import "runtime/pprof"

f, _ := os.Create("cpu.prof")
pprof.StartCPUProfile(f)
defer pprof.StopCPUProfile()
```

### HTTP Profiler

```go
import _ "net/http/pprof"

go http.ListenAndServe(":6060", nil)
```

```bash
go tool pprof http://localhost:6060/debug/pprof/heap
```

---

## Build Optimization

```bash
# Strip debug info (smaller binary)
go build -ldflags="-s -w" -o myapp

# Inject version at build time
go build -ldflags="-X main.version=1.2.3" -o myapp
```

```go
var version = "dev"

func main() {
    fmt.Println("Version:", version)
}
```

---

## Complete Example: Makefile

```makefile
APP_NAME := myapp
VERSION  := $(shell git describe --tags --always)

.PHONY: build test lint clean

build:
	go build -ldflags="-X main.version=$(VERSION)" -o $(APP_NAME) .

test:
	go test -v -race -cover ./...

lint:
	go vet ./...
	golangci-lint run

clean:
	rm -f $(APP_NAME)

cross:
	GOOS=linux GOARCH=amd64 go build -o $(APP_NAME)-linux .
	GOOS=darwin GOARCH=arm64 go build -o $(APP_NAME)-mac .
	GOOS=windows GOARCH=amd64 go build -o $(APP_NAME).exe .
```

---

Next: Go best practices and idiomatic patterns.
