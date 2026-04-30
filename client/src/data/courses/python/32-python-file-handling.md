---
title: Python File Handling
---

# Python File Handling

Reading and writing files in Python is straightforward — `open()` is the only function you need. Always pair it with `with` so the file is closed automatically.

## Opening a file

```python
with open("notes.txt", "r", encoding="utf-8") as f:
    contents = f.read()
print(contents)
```

`open(path, mode, encoding=...)` returns a **file object**. The `with` block calls `f.close()` when it exits, even if an exception is raised.

### Modes

| Mode   | Meaning                                             |
| ------ | --------------------------------------------------- |
| `"r"`  | read (default) — file must exist                    |
| `"w"`  | write — truncates the file or creates it            |
| `"x"`  | exclusive create — fails if the file already exists |
| `"a"`  | append — writes at the end, creates if missing      |
| `"r+"` | read & write                                        |
| `"b"`  | binary mode (combine: `"rb"`, `"wb"`, …)            |
| `"t"`  | text mode, the default (combine: `"rt"`, `"wt"`, …) |

> **Always pass `encoding="utf-8"` for text files.** The default encoding varies by platform and locale — explicit is safer.

## Reading

Three common patterns:

```python
# Whole file as one string
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()

# Whole file as a list of lines (each ending with \n)
with open("notes.txt", encoding="utf-8") as f:
    lines = f.readlines()

# Line by line, without loading all into memory
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip())   # strip the trailing newline
```

Iterating the file object is the most memory-efficient — works equally well on a 10-line file or a 10 GB log.

## Writing

```python
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Line 1\n")
    f.write("Line 2\n")
    f.writelines(["Line 3\n", "Line 4\n"])
```

`write()` does _not_ add a newline — you have to. `writelines(seq)` writes a list of strings _without_ adding newlines either; pre-format them.

`print` can also write to a file:

```python
with open("output.txt", "w", encoding="utf-8") as f:
    print("Line 1", file=f)
    print("Line 2", file=f)
```

## Append mode

```python
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("New entry\n")
```

## Binary files

For images, PDFs, executables — anything that isn't text — use binary mode. No encoding argument; `read()` returns `bytes`.

```python
with open("photo.jpg", "rb") as f:
    data = f.read()
print(len(data), "bytes")

with open("copy.jpg", "wb") as g:
    g.write(data)
```

## Seeking

File objects have a _position_. You can move it.

```python
with open("data.bin", "rb") as f:
    f.read(10)          # advances 10 bytes
    f.tell()            # 10
    f.seek(0)           # back to start
    f.seek(0, 2)        # 0 bytes from end (= EOF)
```

## `pathlib` — modern paths

`pathlib.Path` is the preferred way to manipulate filesystem paths. It's cross-platform, object-oriented, and chainable.

```python
from pathlib import Path

p = Path("data") / "users" / "ada.txt"
p.parent              # PosixPath('data/users')
p.name                # 'ada.txt'
p.stem                # 'ada'
p.suffix              # '.txt'
p.exists()
p.is_file()
p.is_dir()

# Read & write directly
text = p.read_text(encoding="utf-8")
p.write_text("hello\n", encoding="utf-8")

# Iterate a directory
for child in Path("data").iterdir():
    print(child)

# Glob patterns
for log in Path("logs").glob("*.log"):
    print(log)

# Recursive glob
for py in Path("src").rglob("*.py"):
    print(py)

# Create directories
Path("output/2025").mkdir(parents=True, exist_ok=True)
```

Use `pathlib` for new code; `os.path` is the older string-based equivalent you'll see in legacy code.

## CSV files — `csv` module

```python
import csv

with open("users.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age"])
    writer.writerow(["Ada", 36])
    writer.writerow(["Linus", 54])

with open("users.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["age"])
```

Note `newline=""` when opening CSV files for writing — without it, you may get blank lines on Windows.

## Encoding errors

Real-world text isn't always clean. Choose an `errors` policy:

```python
open("messy.txt", encoding="utf-8", errors="replace")   # bad bytes → ?
open("messy.txt", encoding="utf-8", errors="ignore")    # silently drop
open("messy.txt", encoding="utf-8", errors="strict")    # default — raise
```

## Try it — count lines, words, bytes (Python `wc`)

```python
from pathlib import Path

def wc(path):
    text = Path(path).read_text(encoding="utf-8")
    lines = text.count("\n")
    words = len(text.split())
    bytes_ = len(text.encode("utf-8"))
    return lines, words, bytes_

print(wc("README.md"))
```
