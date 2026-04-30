---
title: C++ Get Started
---

# C++ Get Started

To run a C++ program you need two things:

1. A **compiler** that turns `.cpp` source files into an executable.
2. A **terminal** to invoke the compiler and run the result.

## Install a compiler

### Linux

Most distributions ship with `g++`, the C++ frontend for the GNU Compiler Collection (GCC):

```bash
sudo apt update
sudo apt install build-essential   # Debian/Ubuntu
# or
sudo dnf install gcc-c++           # Fedora
```

### macOS

Install the Xcode Command Line Tools:

```bash
xcode-select --install
```

That gives you `clang++` (and the `g++` alias).

### Windows

Two easy options:

- **MSYS2 + MinGW-w64**: provides `g++` from a Bash-like shell.
- **Visual Studio (Community)**: install the "Desktop development with C++" workload to get `cl.exe` (MSVC) and an IDE.

## Verify your install

Open a terminal and run:

```bash
g++ --version
```

You should see something like:

```
g++ (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0
```

## Your first program

Create a file called `hello.cpp`:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

## Compile

```bash
g++ hello.cpp -o hello
```

Breakdown:

- `g++` — the compiler.
- `hello.cpp` — your source file.
- `-o hello` — output file name. Without `-o`, the compiler produces `a.out`.

Useful flags to add early:

| Flag            | Purpose                              |
| --------------- | ------------------------------------ |
| `-std=c++17`    | Use the C++17 standard.              |
| `-Wall -Wextra` | Enable common and extra warnings.    |
| `-O2`           | Optimize for release builds.         |
| `-g`            | Include debug info for `gdb`/`lldb`. |

A solid default during learning:

```bash
g++ -std=c++17 -Wall -Wextra -g hello.cpp -o hello
```

## Run

```bash
./hello       # Linux/macOS
hello.exe     # Windows
```

Output:

```
Hello, World!
```

## What just happened?

1. The **preprocessor** pulled in `<iostream>` so `std::cout` is known.
2. The **compiler** translated your code into object code.
3. The **linker** combined it with the standard library into an executable.
4. The **OS** loaded the executable and ran `main`.

## Putting it together

```cpp
#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    std::cout << "Two plus two equals " << (2 + 2) << "." << std::endl;
    return 0;
}
```
