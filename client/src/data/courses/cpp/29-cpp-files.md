---
title: C++ Files
---

# C++ Files

The `<fstream>` header provides three file-stream classes:

- `std::ofstream` — write to a file.
- `std::ifstream` — read from a file.
- `std::fstream` — read **and** write.

They behave like `std::cin` / `std::cout`, so the operators you already know (`>>`, `<<`, `getline`) work the same way.

## Writing to a file

```cpp
#include <fstream>

std::ofstream out("greeting.txt");
if (!out) {
    std::cerr << "cannot open greeting.txt\n";
    return 1;
}
out << "Hello, file!\n";
out << 42 << ' ' << 3.14 << '\n';
// 'out' closes automatically when it goes out of scope (RAII)
```

## Reading from a file

```cpp
#include <fstream>
#include <string>

std::ifstream in("greeting.txt");
std::string line;
while (std::getline(in, line)) {
    std::cout << line << '\n';
}
```

To read words / numbers token-by-token use `>>`:

```cpp
int n; double d;
in >> n >> d;
```

## Open modes

You can pass a second argument to control how the file is opened:

```cpp
std::ofstream log("log.txt", std::ios::app);   // append, don't truncate
std::fstream  bin("data.bin", std::ios::in | std::ios::out | std::ios::binary);
```

| Flag               | Meaning                                 |
| ------------------ | --------------------------------------- |
| `std::ios::in`     | Open for reading                        |
| `std::ios::out`    | Open for writing (truncates by default) |
| `std::ios::app`    | Always append at the end                |
| `std::ios::ate`    | Open at end (but can seek anywhere)     |
| `std::ios::trunc`  | Truncate to zero on open                |
| `std::ios::binary` | Binary mode (don't translate newlines)  |

## Checking for errors

After every potentially failing operation, check the stream:

```cpp
if (!in.is_open()) { /* never opened */ }
if (in.fail())     { /* last read failed (e.g. wrong format) */ }
if (in.eof())      { /* hit end of file */ }
```

`if (in)` is shorthand for "stream still good".

## Binary I/O

For raw bytes use `read` / `write`:

```cpp
struct Header { int magic; int version; };

Header h{0xCAFE, 1};
std::ofstream out("file.bin", std::ios::binary);
out.write(reinterpret_cast<const char*>(&h), sizeof h);
```

Binary formats are not portable across architectures unless you control endianness yourself.

## `std::filesystem` (C++17)

For path manipulation, listing directories, and metadata, prefer `<filesystem>`:

```cpp
#include <filesystem>
namespace fs = std::filesystem;

if (fs::exists("data.txt")) {
    std::cout << fs::file_size("data.txt") << " bytes\n";
}

for (const auto& entry : fs::directory_iterator(".")) {
    std::cout << entry.path() << '\n';
}
```

## Putting it together

```cpp
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

int main() {
    // 1. Write a few lines.
    {
        std::ofstream out("notes.txt");
        out << "buy milk\n";
        out << "finish C++ course\n";
        out << "go for a run\n";
    }

    // 2. Read them back, with line numbers.
    std::ifstream in("notes.txt");
    std::string line;
    int n = 1;
    while (std::getline(in, line)) {
        std::cout << n++ << ": " << line << '\n';
    }
}
```
