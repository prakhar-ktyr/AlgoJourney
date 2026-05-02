---
title: Setting Up
---

# Setting Up Your Environment

Before we write any DSA code, let's make sure you have a working development environment. Choose the tab that matches the language you selected above.

## Setting Up (C++)

### Install a C++ compiler

**macOS:**

```cpp
// Install Xcode Command Line Tools (includes g++)
// Open Terminal and run:
// xcode-select --install
```

**Linux (Ubuntu/Debian):**

```cpp
// sudo apt update && sudo apt install g++
```

**Windows:**

Download and install [MinGW-w64](https://www.mingw-w64.org/) or use WSL (Windows Subsystem for Linux).

### Compile and run

Save your code in a file called `main.cpp`, then:

```cpp
// Compile:   g++ -std=c++17 -o main main.cpp
// Run:       ./main

#include <iostream>
using namespace std;

int main() {
    cout << "DSA in C++ — ready!" << endl;
    return 0;
}
```

### Recommended editor

Use **VS Code** with the C/C++ extension, or any IDE like CLion or Code::Blocks.

## Setting Up (Java)

### Install the JDK

Download and install the latest **JDK** (Java Development Kit) from [adoptium.net](https://adoptium.net/) or use your package manager:

```java
// macOS (Homebrew):  brew install openjdk
// Ubuntu:            sudo apt install default-jdk
// Windows:           download the installer from adoptium.net
```

### Compile and run

Save your code in `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("DSA in Java — ready!");
    }
}

// Compile:  javac Main.java
// Run:      java Main
```

### Recommended editor

Use **VS Code** with the Java Extension Pack, or **IntelliJ IDEA** (Community Edition is free).

## Setting Up (Python)

### Install Python

Python 3.8+ is recommended. Check if it is already installed:

```python
# In your terminal:
# python3 --version

# If not installed:
# macOS (Homebrew):  brew install python
# Ubuntu:            sudo apt install python3
# Windows:           download from python.org
```

### Run your code

Save your code in `main.py`:

```python
print("DSA in Python — ready!")

# Run:  python3 main.py
```

Python does not require a compilation step — it is interpreted.

### Recommended editor

Use **VS Code** with the Python extension, or **PyCharm** (Community Edition is free).

## Setting Up (JavaScript)

### Install Node.js

You need **Node.js** to run JavaScript outside the browser. Download it from [nodejs.org](https://nodejs.org/) or use a package manager:

```javascript
// macOS (Homebrew):  brew install node
// Ubuntu:            sudo apt install nodejs npm
// Windows:           download the installer from nodejs.org
```

### Run your code

Save your code in `main.js`:

```javascript
console.log("DSA in JavaScript — ready!");

// Run:  node main.js
```

### Recommended editor

Use **VS Code** — it has built-in JavaScript support and an integrated terminal.

---

## Your first DSA program

Let's verify everything works by writing a simple program that swaps two variables — a micro-problem you will encounter inside larger algorithms throughout this course.

```cpp
#include <iostream>
using namespace std;

int main() {
    int a = 5, b = 10;
    cout << "Before: a=" << a << " b=" << b << endl;
    int temp = a;
    a = b;
    b = temp;
    cout << "After:  a=" << a << " b=" << b << endl;
    return 0;
}
```

```java
public class Swap {
    public static void main(String[] args) {
        int a = 5, b = 10;
        System.out.println("Before: a=" + a + " b=" + b);
        int temp = a;
        a = b;
        b = temp;
        System.out.println("After:  a=" + a + " b=" + b);
    }
}
```

```python
a, b = 5, 10
print(f"Before: a={a} b={b}")
a, b = b, a
print(f"After:  a={a} b={b}")
```

```javascript
let a = 5, b = 10;
console.log(`Before: a=${a} b=${b}`);
[a, b] = [b, a];
console.log(`After:  a=${a} b=${b}`);
```

If you see the swapped values printed, your environment is ready!

Next up: the single most important concept in DSA — **Big O Notation →**
