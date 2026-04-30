---
title: Java Switch
---

# Java Switch

`switch` selects one of many branches based on a single value. It's clearer than a long chain of `else if` when each branch tests the same expression.

## Classic `switch` statement

```java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    case 4:
        System.out.println("Thursday");
        break;
    case 5:
        System.out.println("Friday");
        break;
    default:
        System.out.println("Weekend");
}
```

Output: `Wednesday`.

### Why `break`?

Without `break`, execution **falls through** into the next `case`:

```java
switch (day) {
    case 1:
        System.out.println("Monday");
        // no break!
    case 2:
        System.out.println("Tuesday");
        break;
    default:
        System.out.println("Other");
}
```

If `day == 1`, this prints both `Monday` _and_ `Tuesday`. Fall-through is useful for grouping cases:

```java
case 6:
case 7:
    System.out.println("Weekend");
    break;
```

But forgetting `break` is a famous bug. The modern arrow form (below) makes fall-through impossible.

## Allowed `switch` types

A traditional switch supports: `byte`, `short`, `int`, `char`, the wrapper classes (`Byte`, `Short`, `Integer`, `Character`), enums, and `String`.

```java
String role = "admin";
switch (role) {
    case "admin":  giveAllAccess(); break;
    case "editor": giveEditAccess(); break;
    default:       giveReadOnly();
}
```

## Modern arrow `switch` (Java 14+)

The new syntax uses `->`, runs only the matching branch, and can be used as an **expression** that returns a value.

```java
int day = 3;
String name = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    case 4 -> "Thursday";
    case 5 -> "Friday";
    case 6, 7 -> "Weekend";
    default -> "Unknown";
};

System.out.println(name);
```

Notes:

- No `break` needed.
- Multiple labels use a comma list: `case 6, 7 ->`.
- A `switch` _expression_ must be **exhaustive** — cover every possible value (often via `default`).

### Multi-statement arrow case

Use a block and `yield` to return a value:

```java
String result = switch (day) {
    case 1 -> "Mon";
    case 2 -> {
        log("Tuesday selected");
        yield "Tue";
    }
    default -> "Other";
};
```

## Pattern matching for `switch` (Java 21+)

Recent Java lets you match on type:

```java
Object o = 42;
String desc = switch (o) {
    case Integer i -> "int: " + i;
    case String s  -> "string: " + s;
    case null      -> "null!";
    default        -> "other";
};
```

This is a powerful feature for working with hierarchies of types — covered later in the **OOP** sections.

## When to use `switch` vs `if`

- **Same expression checked against many constants** → `switch` is cleaner.
- **Different conditions on different variables** → use `if/else if`.
- **Range checks** (`x > 0 && x < 10`) → use `if`. (Pattern-matching switch supports ranges in newer versions, but `if` is still clearer.)

## A complete example

```java
public class HttpStatus {
    public static void main(String[] args) {
        int status = 404;

        String category = switch (status / 100) {
            case 1 -> "Informational";
            case 2 -> "Success";
            case 3 -> "Redirect";
            case 4 -> "Client error";
            case 5 -> "Server error";
            default -> "Unknown";
        };

        System.out.printf("HTTP %d → %s%n", status, category);
    }
}
```

Next: the **`while`** loop.
