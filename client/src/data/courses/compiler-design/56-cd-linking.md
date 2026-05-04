---
title: Linking and Loading
---

# Linking and Loading

After the compiler finishes its work, you don't yet have a runnable program. The **linker** combines object files into an executable, and the **loader** places it into memory for execution.

---

## What Happens After Compilation

The compilation pipeline has several stages:

```
source.c → preprocessor → compiler → assembler → object file (.o)
                                                        ↓
                                            linker → executable
                                                        ↓
                                              loader → process in memory
```

Each source file compiles independently into an **object file**. The linker's job is to combine these pieces into a single working program.

---

## Object File Formats

Different operating systems use different object file formats:

| OS | Format | Extension |
|----|--------|-----------|
| Linux | ELF (Executable and Linkable Format) | `.o`, `.so`, no ext |
| macOS | Mach-O (Mach Object) | `.o`, `.dylib` |
| Windows | PE (Portable Executable) | `.obj`, `.dll`, `.exe` |

All formats share the same basic idea: structured containers holding code, data, and metadata.

---

## ELF File Structure

ELF is the most common format on Unix systems. Let's examine its structure:

```
+------------------+
| ELF Header       |  ← magic number, architecture, entry point
+------------------+
| Program Headers  |  ← how to load into memory (segments)
+------------------+
| .text            |  ← machine code
+------------------+
| .rodata          |  ← read-only data (string literals, constants)
+------------------+
| .data            |  ← initialized global/static variables
+------------------+
| .bss             |  ← uninitialized globals (zero-filled at load)
+------------------+
| .symtab          |  ← symbol table
+------------------+
| .strtab          |  ← string table for symbol names
+------------------+
| .rel.text        |  ← relocations for .text
+------------------+
| .rel.data        |  ← relocations for .data
+------------------+
| Section Headers  |  ← describes each section
+------------------+
```

---

## Key Sections

### .text — Code

Contains the compiled machine instructions:

```c
// This function's compiled code goes in .text
int add(int a, int b) {
    return a + b;
}
```

### .data — Initialized Data

Global and static variables with initial values:

```c
int counter = 42;          // goes in .data
static float pi = 3.14f;  // goes in .data
```

### .bss — Uninitialized Data

Variables declared but not initialized (filled with zeros at load time):

```c
int buffer[1024];     // goes in .bss (saves space in object file)
static int count;     // goes in .bss
```

> **Note:** `.bss` stands for "Block Started by Symbol." It takes no space in the file — only a size is recorded.

### .rodata — Read-Only Data

Constants and string literals:

```c
const char *msg = "Hello";  // "Hello" goes in .rodata
const int MAX = 100;        // goes in .rodata
```

### .symtab — Symbol Table

Maps names to addresses. Each entry contains:

| Field | Description |
|-------|-------------|
| name | Symbol name (index into .strtab) |
| value | Address or offset |
| size | Size of the symbol |
| type | Function, object, section, etc. |
| binding | Local, global, or weak |
| section | Which section it belongs to |

### .rel — Relocation Entries

Instructions for the linker on how to patch addresses.

---

## Symbol Resolution

When one file calls a function defined in another file, the assembler leaves a placeholder:

```c
// file1.c
extern int helper(int x);  // defined elsewhere

int main() {
    return helper(5);       // assembler can't fill in address yet
}
```

```c
// file2.c
int helper(int x) {        // definition is here
    return x * 2;
}
```

The linker's **symbol resolution** step:

1. Collect all symbol definitions from all object files
2. For each undefined reference, find its definition
3. Report errors for symbols with no definition (linker error!)
4. Handle duplicate definitions according to rules (strong vs. weak symbols)

**Strong symbols**: functions and initialized globals.
**Weak symbols**: uninitialized globals.

Rules:
- Multiple strong symbols with same name → error
- One strong + one or more weak → choose strong
- Multiple weak → choose any one (size matters)

---

## Relocation

After resolving symbols, the linker knows where everything will go. Now it patches the code:

```
Before relocation (in file1.o):
  call 0x00000000    ← placeholder for helper()

After relocation (in executable):
  call 0x00401030    ← actual address of helper()
```

The relocation process:

1. Assign final addresses to all sections from all files
2. For each relocation entry, compute the final address
3. Patch the instruction or data with the correct value

Common relocation types on x86-64:

| Type | Meaning |
|------|---------|
| R_X86_64_PC32 | 32-bit PC-relative reference |
| R_X86_64_32 | Absolute 32-bit address |
| R_X86_64_PLT32 | Call through PLT (for shared libs) |

---

## Static Linking

Static linking combines all object files and libraries into one executable **at compile time**:

```bash
# Compile to object files
gcc -c main.c -o main.o
gcc -c helper.c -o helper.o

# Static link
gcc main.o helper.o -o program
```

With a static library (`.a` archive):

```bash
# Create static library
ar rcs libmath.a add.o multiply.o divide.o

# Link against it
gcc main.o -L. -lmath -o program
```

**Advantages:**
- Self-contained executable (no external dependencies)
- Slightly faster startup (no runtime linking)
- Predictable behavior

**Disadvantages:**
- Larger executable size
- No sharing of code between processes
- Must recompile to update library code

---

## Dynamic Linking

Dynamic linking defers some linking to **load time** or **runtime**:

```bash
# Create shared library
gcc -shared -fPIC helper.c -o libhelper.so

# Link dynamically
gcc main.c -L. -lhelper -o program
```

The executable only records which shared libraries it needs. The dynamic linker (`ld-linux.so` on Linux) resolves symbols when the program starts.

**Advantages:**
- Smaller executables
- Multiple programs share one copy of library in memory
- Update library without recompiling programs

**Disadvantages:**
- Slightly slower startup
- "DLL hell" — version conflicts
- Dependencies must be present at runtime

---

## Shared Libraries

| OS | Extension | Example |
|----|-----------|---------|
| Linux | `.so` | `libpthread.so.0` |
| macOS | `.dylib` | `libSystem.B.dylib` |
| Windows | `.dll` | `kernel32.dll` |

Inspect shared library dependencies:

```bash
# Linux
ldd ./program

# macOS
otool -L ./program
```

---

## Position-Independent Code (PIC)

Shared libraries can be loaded at **any** address. Code must work regardless of where it's placed:

```c
// Without PIC: absolute address (won't work if loaded elsewhere)
mov eax, [0x00601000]

// With PIC: relative to current position (works anywhere)
mov eax, [rip + offset_to_data]
```

PIC uses two key mechanisms:

### Global Offset Table (GOT)

A table of pointers to global data, filled in by the dynamic linker:

```
Code:     mov rax, [GOT + offset]    // load address from GOT
          mov rbx, [rax]             // access the actual data

GOT:
  [0] → address of global_var (filled by dynamic linker)
  [1] → address of another_var
```

### Procedure Linkage Table (PLT)

Enables **lazy binding** — resolve function addresses on first call:

```
First call to printf:
  1. Jump to PLT entry for printf
  2. PLT jumps to GOT entry (initially points back to PLT)
  3. PLT calls dynamic linker to resolve printf
  4. Dynamic linker updates GOT with real address
  5. Jump to printf

Second call to printf:
  1. Jump to PLT entry
  2. PLT jumps to GOT entry (now has real address)
  3. Jump directly to printf
```

Compile with PIC:

```bash
gcc -fPIC -shared -o libfoo.so foo.c
```

---

## The Loader

The loader is the OS component that starts a program:

1. **Read ELF header** — verify magic number, get entry point
2. **Map segments** — use `mmap()` to load code and data into memory
3. **Set permissions** — `.text` gets execute, `.data` gets read/write
4. **Dynamic linking** — if needed, invoke the dynamic linker
5. **Initialize** — run constructors, set up TLS
6. **Transfer control** — jump to `_start` → `__libc_start_main` → `main()`

Memory layout after loading:

```
High addresses
+------------------+
| Stack            |  ← grows downward
+------------------+
|                  |
| (unmapped)       |
|                  |
+------------------+
| Heap             |  ← grows upward (brk/mmap)
+------------------+
| .bss             |
+------------------+
| .data            |
+------------------+
| .rodata          |
+------------------+
| .text            |
+------------------+
Low addresses
```

---

## Putting It All Together

```c
// main.c
#include <stdio.h>

extern int compute(int x);  // defined in compute.c

int global = 10;            // .data

int main() {
    int result = compute(global);  // call requires relocation
    printf("%d\n", result);        // dynamically linked (libc)
    return 0;
}
```

```bash
# Full build pipeline
gcc -c main.c -o main.o       # compile
gcc -c compute.c -o compute.o # compile
gcc main.o compute.o -o prog   # link (static for compute, dynamic for libc)
./prog                         # load and execute
```

---

## Exercises

1. **Inspect an object file**: Compile a C file with `gcc -c` and use `objdump -h` to list sections. Identify `.text`, `.data`, `.bss`, and `.rodata`.

2. **Symbol table**: Use `nm program.o` to view the symbol table. Identify which symbols are defined (T, D, B) and which are undefined (U).

3. **Linker error**: Create two files that both define `int count = 5;` (strong symbol). Try linking them. What error do you get?

4. **Shared library**: Create a shared library with one function. Write a program that uses it. Use `ldd` to verify the dynamic dependency.

5. **Relocation**: Compile with `gcc -c -o file.o file.c`, then use `objdump -r file.o` to see relocation entries. Match each entry to a function call or global variable access in the source.

6. **Static vs dynamic size**: Compile the same program with static linking (`-static`) and dynamic linking. Compare file sizes with `ls -la`.

---

## Summary

| Stage | Tool | Input → Output |
|-------|------|----------------|
| Compilation | gcc -c | `.c` → `.o` |
| Static linking | ld / gcc | `.o` + `.a` → executable |
| Dynamic linking | ld-linux.so | executable + `.so` → process |
| Loading | OS loader | executable → memory image |

The linker bridges the gap between independently compiled files and a running program. Understanding linking helps debug mysterious "undefined reference" errors and manage library dependencies.
