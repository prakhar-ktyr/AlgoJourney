---
title: Java Strings
---

# Java Strings

A `String` in Java is a sequence of characters and is one of the most-used types in the language. Strings are **objects**, but you create them with simple double-quoted literals:

```java
String greeting = "Hello, World!";
```

Strings are **immutable**: every method that "modifies" a string actually returns a _new_ string.

## Length and characters

```java
String s = "Hello";
System.out.println(s.length());    // 5
System.out.println(s.charAt(0));   // 'H'
System.out.println(s.charAt(4));   // 'o'
```

Indices are zero-based; `charAt(s.length())` throws `StringIndexOutOfBoundsException`.

## Common methods

```java
String s = "  Hello, World!  ";

s.toUpperCase();            // "  HELLO, WORLD!  "
s.toLowerCase();            // "  hello, world!  "
s.trim();                    // "Hello, World!"
s.strip();                   // "Hello, World!" (Unicode-aware, Java 11+)
s.replace("World", "Java"); // "  Hello, Java!  "
s.contains("World");        // true
s.startsWith("  Hello");     // true
s.endsWith("!  ");           // true
s.indexOf("o");              // 5
s.lastIndexOf("o");          // 8
s.substring(2, 7);           // "Hello"
s.isEmpty();                  // false
s.isBlank();                  // false (Java 11+)
```

## Splitting and joining

```java
String csv = "a,b,c,d";
String[] parts = csv.split(",");          // ["a","b","c","d"]

String joined = String.join("-", parts);  // "a-b-c-d"
```

## Comparing strings — use `.equals()`

```java
String a = "hi";
String b = new String("hi");

a == b;             // false (different objects)
a.equals(b);        // true  (same characters)
a.equalsIgnoreCase("HI");  // true
"banana".compareTo("apple"); // > 0 (lexicographic order)
```

> The `==` operator compares object references. **Always** compare string contents with `.equals(...)`.

A null-safe trick:

```java
"expected".equals(s)   // safe even if s is null
```

## Concatenation

```java
String a = "Hello, ";
String b = "World!";
String c = a + b;
String d = a.concat(b);
```

For many concatenations, use **`StringBuilder`** to avoid creating throwaway strings:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100; i++) {
    sb.append("x");
}
String huge = sb.toString();
```

## Formatting

```java
String msg = String.format("Hi %s, you are %d", "Ada", 30);
```

Same specifiers as `printf` (covered in the **Output** lesson).

## Text blocks (Java 15+)

```java
String json = """
        {
          "name": "Ada",
          "age": 30
        }
        """;
```

## Special characters

| Escape   | Meaning                 |
| -------- | ----------------------- |
| `\n`     | Newline                 |
| `\t`     | Tab                     |
| `\\`     | Backslash               |
| `\"`     | Double quote            |
| `\u00E9` | Unicode character (`é`) |

## The string pool

String **literals** with the same characters share the same object in memory:

```java
String a = "hi";
String b = "hi";
System.out.println(a == b);   // true (same pool entry)
```

But `new String("hi")` always creates a fresh object. Don't rely on `==` for content comparison — ever.

## A complete example

```java
public class StringDemo {
    public static void main(String[] args) {
        String name = "Ada Lovelace";

        System.out.println("Length: " + name.length());
        System.out.println("Upper:  " + name.toUpperCase());

        String[] words = name.split(" ");
        for (String w : words) {
            System.out.println("- " + w);
        }
    }
}
```

In the next lesson we'll cover the **Math** class.
