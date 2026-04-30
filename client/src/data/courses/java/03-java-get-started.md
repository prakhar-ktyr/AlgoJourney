---
title: Java Get Started
---

# Java Get Started

In this lesson we'll install a JDK, write our first Java file, compile it, and run it.

## Step 1 — Install the JDK

You need the **Java Development Kit (JDK)** version **17 or newer** (an LTS release). Any of these distributions works:

- [Eclipse Temurin](https://adoptium.net/) — recommended, free, open source.
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
- [Amazon Corretto](https://aws.amazon.com/corretto/)

### macOS (Homebrew)

```bash
brew install --cask temurin
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install openjdk-21-jdk
```

### Windows

Download the installer from Adoptium and run it. Make sure "Add to PATH" and "Set `JAVA_HOME`" are checked.

### Verify the installation

Open a new terminal and run:

```bash
java --version
javac --version
```

Both should print a version number (e.g. `21.0.2`). If `javac` is missing you installed only a JRE — install the **JDK**.

## Step 2 — Write your first program

Create a file named exactly **`Hello.java`** (the file name must match the public class name) with this content:

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## Step 3 — Compile

In the terminal, `cd` to the folder containing `Hello.java` and run:

```bash
javac Hello.java
```

If everything is correct, the compiler produces `Hello.class` (the bytecode) and prints nothing.

## Step 4 — Run

```bash
java Hello
```

Note: there is **no `.class` extension** in the `java` command — you pass the **class name**, not the file name.

You should see:

```
Hello, World!
```

Congratulations — you just wrote, compiled, and ran a Java program.

## Modern shortcut: `java Hello.java`

Since Java 11, you can compile-and-run a single-file program in one step:

```bash
java Hello.java
```

This is great for quick experiments. For multi-file projects you still need `javac`.

## Even quicker: `jshell`

The JDK ships with **JShell**, an interactive Read-Eval-Print Loop (REPL):

```bash
jshell
```

```text
jshell> int x = 40 + 2
x ==> 42

jshell> System.out.println("hi")
hi

jshell> /exit
```

JShell is perfect for trying snippets without creating a class.

## Editors and IDEs

You can write Java in any text editor, but a real IDE saves a lot of typing:

- **IntelliJ IDEA Community** (free) — most popular for Java.
- **VS Code** with the _Extension Pack for Java_.
- **Eclipse**.

For this course, any editor + a terminal is enough.

In the next lesson we'll dissect the `Hello` program line by line.
