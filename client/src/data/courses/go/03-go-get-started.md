---
title: Go Get Started
---

# Go Get Started

In this lesson you'll install Go, set up your workspace, and run your first program.

---

## Step 1: Install Go

### macOS

The easiest way is with Homebrew:

```bash
brew install go
```

Or download the `.pkg` installer from [go.dev/dl](https://go.dev/dl/).

### Windows

Download the `.msi` installer from [go.dev/dl](https://go.dev/dl/) and run it. It adds Go to your `PATH` automatically.

### Linux

```bash
# Download (replace version as needed)
wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz

# Extract to /usr/local
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz

# Add to PATH (add this line to ~/.bashrc or ~/.zshrc)
export PATH=$PATH:/usr/local/go/bin
```

### Verify Installation

Open a terminal and run:

```bash
go version
```

You should see something like:

```
go version go1.22.4 darwin/arm64
```

> [!TIP]
> If `go version` doesn't work, make sure the Go `bin` directory is in your `PATH` and restart your terminal.

---

## Step 2: Understand the Go Workspace

Modern Go uses **modules** to manage code. You don't need to set `GOPATH` — just create a folder anywhere and initialize a module.

```bash
mkdir hello-go
cd hello-go
go mod init hello-go
```

This creates a `go.mod` file that tracks your module name and dependencies:

```
module hello-go

go 1.22.4
```

> [!NOTE]
> For real projects, the module name typically matches your repository URL:
> `go mod init github.com/username/project-name`

---

## Step 3: Write Your First Program

Create a file called `main.go`:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

Let's break this down line by line:

| Line | Meaning |
|------|---------|
| `package main` | Declares this file belongs to the `main` package — the entry point for executable programs |
| `import "fmt"` | Imports the `fmt` (format) package from the standard library |
| `func main()` | The `main` function — where program execution begins |
| `fmt.Println(...)` | Prints text followed by a newline |

---

## Step 4: Run Your Program

You have two options:

### Option A: `go run` (compile and run in one step)

```bash
go run main.go
```

Output:

```
Hello, World!
```

`go run` compiles the program to a temporary location and immediately executes it. Great for development.

### Option B: `go build` (compile to a binary)

```bash
go build -o hello
./hello
```

Output:

```
Hello, World!
```

`go build` creates a standalone executable. You can copy this file to any machine with the same OS/architecture and run it — no Go installation needed.

> [!NOTE]
> On Windows, the binary will be `hello.exe`. On macOS/Linux, it's just `hello`.

---

## Go Tools You Should Know

Go ships with a powerful set of built-in tools:

| Command | What It Does |
|---------|-------------|
| `go run file.go` | Compile and run in one step |
| `go build` | Compile into an executable binary |
| `go fmt` | Format your code (same as `gofmt`) |
| `go vet` | Report likely mistakes in code |
| `go test` | Run tests |
| `go mod init` | Initialize a new module |
| `go mod tidy` | Add missing / remove unused dependencies |
| `go get pkg` | Download and install a dependency |
| `go doc pkg` | View documentation for a package |

> [!TIP]
> Always run `go fmt` before committing code. Most editors can be configured to run it automatically on save. In VS Code, install the official **Go extension** and it formats on save by default.

---

## Recommended Editor Setup

Any text editor works, but these have excellent Go support:

- **VS Code** + [Go extension](https://marketplace.visualstudio.com/items?itemName=golang.Go) — most popular, free, excellent debugging
- **GoLand** (JetBrains) — full IDE, paid but very powerful
- **Vim/Neovim** + `gopls` — lightweight, fast, terminal-based

The Go language server (`gopls`) powers autocomplete, go-to-definition, and error highlighting in all of these editors.

---

## A Slightly Bigger Example

Let's make the program a bit more interesting:

```go
package main

import (
    "fmt"
    "runtime"
)

func main() {
    fmt.Println("Hello from Go!")
    fmt.Printf("Go version: %s\n", runtime.Version())
    fmt.Printf("OS: %s, Architecture: %s\n", runtime.GOOS, runtime.GOARCH)
}
```

Output (varies by machine):

```
Hello from Go!
Go version: go1.22.4
OS: darwin, Architecture: arm64
```

Notice the `import (...)` syntax with parentheses — this is how you import multiple packages. We'll cover this in detail in the next lesson.

---

You're all set up! In the next lesson, we'll explore Go's syntax rules in detail.
