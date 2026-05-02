---
title: Strings Introduction
---

# Strings Introduction

A **string** is a sequence of characters. Under the hood, strings are closely related to arrays — but each language treats them differently. Understanding those differences is critical for DSA.

## Strings in each language

### Strings in C++

C++ has two kinds of strings:

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    // C-style string (char array) — avoid in modern C++
    char cstr[] = "hello";

    // std::string — preferred
    string s = "hello";

    // Strings are MUTABLE in C++
    s[0] = 'H';       // "Hello"
    s += " world";     // "Hello world"
    s.push_back('!');  // "Hello world!"

    cout << s << endl;
    cout << s.length() << endl;  // 12
    cout << s[0] << endl;        // 'H'

    return 0;
}
```

### Strings in Java

```java
public class StringDemo {
    public static void main(String[] args) {
        // Strings are IMMUTABLE in Java
        String s = "hello";
        // s[0] = 'H'; ← compile error!

        // Every "modification" creates a new string
        String s2 = s.substring(0, 1).toUpperCase() + s.substring(1);
        // s is still "hello", s2 is "Hello"

        System.out.println(s.length());   // 5
        System.out.println(s.charAt(0));  // 'h'

        // Use StringBuilder for efficient modifications
        StringBuilder sb = new StringBuilder("hello");
        sb.setCharAt(0, 'H');
        sb.append(" world!");
        System.out.println(sb.toString()); // "Hello world!"
    }
}
```

### Strings in Python

```python
# Strings are IMMUTABLE in Python
s = "hello"
# s[0] = 'H'  ← TypeError!

# Every "modification" creates a new string
s2 = "H" + s[1:]  # "Hello"

print(len(s))   # 5
print(s[0])     # 'h'
print(s[-1])    # 'o' (negative indexing!)

# For efficient building, use a list and join
parts = list("hello")
parts[0] = "H"
result = "".join(parts)  # "Hello"
```

### Strings in JavaScript

```javascript
// Strings are IMMUTABLE in JavaScript
let s = "hello";
// s[0] = 'H'; ← silently fails (no error, but no change)

// Every "modification" creates a new string
const s2 = "H" + s.slice(1); // "Hello"

console.log(s.length);  // 5
console.log(s[0]);       // 'h'
console.log(s.charAt(0)); // 'h'

// For efficient building, use an array and join
const parts = s.split("");
parts[0] = "H";
const result = parts.join(""); // "Hello"
```

## Why immutability matters for DSA

In languages where strings are immutable (Java, Python, JavaScript), concatenating in a loop is **O(n²)** because each concatenation creates a new string:

```python
# BAD — O(n²) because each += creates a new string
s = ""
for i in range(n):
    s += str(i)  # copies entire string each time

# GOOD — O(n) using a list
parts = []
for i in range(n):
    parts.append(str(i))
result = "".join(parts)
```

In C++, `std::string` is mutable, so `+=` appends in-place (amortized O(1) per character).

## String length

```cpp
string s = "hello";
cout << s.length() << endl; // 5
// or s.size() — same thing
```

```java
String s = "hello";
System.out.println(s.length()); // 5
```

```python
s = "hello"
print(len(s))  # 5
```

```javascript
const s = "hello";
console.log(s.length); // 5 — it's a property, not a method
```

## Accessing characters

```cpp
string s = "hello";
char ch = s[2];     // 'l'
char last = s[s.length() - 1]; // 'o'
```

```java
String s = "hello";
char ch = s.charAt(2);     // 'l'
char last = s.charAt(s.length() - 1); // 'o'
```

```python
s = "hello"
ch = s[2]     # 'l'
last = s[-1]  # 'o'
```

```javascript
const s = "hello";
const ch = s[2];     // 'l'
const last = s[s.length - 1]; // 'o'
// or s.at(-1) → 'o'
```

## String comparison

```cpp
string a = "apple", b = "banana";
if (a == b) cout << "equal";
if (a < b)  cout << "a comes first"; // lexicographic
// compare() returns 0 (equal), negative (a < b), or positive (a > b)
```

```java
String a = "apple", b = "banana";
if (a.equals(b)) System.out.println("equal");
// NEVER use == for string content in Java (compares references)
if (a.compareTo(b) < 0) System.out.println("a comes first");
```

```python
a, b = "apple", "banana"
if a == b:
    print("equal")
if a < b:
    print("a comes first")  # lexicographic comparison built-in
```

```javascript
const a = "apple", b = "banana";
if (a === b) console.log("equal");
if (a < b) console.log("a comes first"); // lexicographic
```

## String concatenation

```cpp
string a = "hello";
string b = " world";
string c = a + b;  // "hello world"
a += "!";          // "hello!" — modifies in place
```

```java
String a = "hello";
String b = " world";
String c = a + b;  // "hello world" — new string created

// Efficient concatenation
StringBuilder sb = new StringBuilder();
sb.append("hello");
sb.append(" world");
String result = sb.toString();
```

```python
a = "hello"
b = " world"
c = a + b  # "hello world" — new string created
# For many concatenations, use "".join()
```

```javascript
const a = "hello";
const b = " world";
const c = a + b;  // "hello world"
// Or template literals: `${a}${b}`
```

## Converting between strings and character arrays

This is a very common operation in DSA — many problems require modifying characters, which is easiest with an array.

```cpp
string s = "hello";
// String to char vector
vector<char> chars(s.begin(), s.end());
chars[0] = 'H';
// Back to string
string result(chars.begin(), chars.end()); // "Hello"
```

```java
String s = "hello";
char[] chars = s.toCharArray();
chars[0] = 'H';
String result = new String(chars); // "Hello"
```

```python
s = "hello"
chars = list(s)
chars[0] = "H"
result = "".join(chars)  # "Hello"
```

```javascript
const s = "hello";
const chars = s.split("");
chars[0] = "H";
const result = chars.join(""); // "Hello"
```

## ASCII values

Characters have numeric ASCII values. This is useful for many string problems:

| Character | ASCII |
|---|---|
| '0'–'9' | 48–57 |
| 'A'–'Z' | 65–90 |
| 'a'–'z' | 97–122 |

```cpp
char ch = 'A';
int ascii = (int)ch;     // 65
char back = (char)(ascii + 1); // 'B'
```

```java
char ch = 'A';
int ascii = (int) ch;     // 65
char back = (char)(ascii + 1); // 'B'
```

```python
ch = 'A'
ascii = ord(ch)     # 65
back = chr(ascii + 1)  # 'B'
```

```javascript
const ch = "A";
const ascii = ch.charCodeAt(0); // 65
const back = String.fromCharCode(ascii + 1); // 'B'
```

## Summary

| Feature | C++ | Java | Python | JavaScript |
|---|---|---|---|---|
| Mutable? | Yes | No | No | No |
| Type | `std::string` | `String` | `str` | `string` |
| Efficient builder | `+=` works | `StringBuilder` | `list` + `join` | `array` + `join` |
| Length | `.length()` | `.length()` | `len()` | `.length` |
| Access char | `s[i]` | `.charAt(i)` | `s[i]` | `s[i]` |
| Compare | `==` | `.equals()` | `==` | `===` |

Next: **String Operations →**
