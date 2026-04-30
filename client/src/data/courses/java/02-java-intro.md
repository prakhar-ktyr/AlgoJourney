---
title: Java Introduction
---

# Java Introduction

## What is Java?

Java is a **general-purpose, object-oriented, statically-typed** programming language created by James Gosling at Sun Microsystems in **1995**. It is now stewarded by Oracle and developed in the open as **OpenJDK**.

A Java program is written in `.java` source files, compiled by `javac` into platform-independent **bytecode** (`.class` files), and then executed by the **Java Virtual Machine (JVM)**. The same bytecode runs unmodified on any operating system that has a JVM — this is the famous "**Write Once, Run Anywhere**" promise.

```
hello.java  ──javac──►  Hello.class  ──java──►  output
 (source)               (bytecode)              (runtime on JVM)
```

## Why use Java?

- **Cross-platform.** The JVM hides operating-system differences from your code.
- **Statically typed.** Type errors are caught at compile time, not at runtime.
- **Object-oriented.** Everything outside of primitives is an object, and the language is built around classes, interfaces, and inheritance.
- **Memory-managed.** A built-in **garbage collector** frees memory you no longer use.
- **Massive ecosystem.** Maven Central hosts hundreds of thousands of libraries; the standard library is huge by itself.
- **Mature tooling.** World-class IDEs (IntelliJ IDEA, Eclipse, VS Code), profilers, and debuggers.
- **Performance.** Modern JVMs use **just-in-time (JIT) compilation** to produce highly-optimized native code at runtime.

## Where Java is used

- **Android apps** (the Android SDK is built on a Java-compatible language and the same syntax you'll learn here).
- **Enterprise back-ends** with Spring Boot, Jakarta EE, Micronaut, Quarkus.
- **Big data**: Hadoop, Spark, Kafka, Flink are all written in JVM languages.
- **Build tools**: Maven, Gradle, Ant.
- **Scientific computing, simulation, finance, and embedded systems.**

## JDK vs JRE vs JVM

These three acronyms confuse beginners — here is the simple version.

| Term    | What it is                                                             | When you need it                                                                     |
| ------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **JVM** | The virtual machine that _executes_ bytecode.                          | Always — it's what runs your program.                                                |
| **JRE** | JVM + standard library, enough to **run** Java.                        | Historically, when you only ran Java apps. (Modern distributions ship the JDK only.) |
| **JDK** | JRE + the **compiler** (`javac`), debugger, `jshell`, and other tools. | Always, for development. **Install this.**                                           |

## A taste of Java

The smallest useful Java program:

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

We'll explain every word of this in the next two lessons. For now, just notice:

- Code lives **inside a class** (`public class Hello`).
- Execution starts at a method called `main`.
- `System.out.println(...)` prints a line of text.

In the next lesson we'll install the JDK and run this program.
