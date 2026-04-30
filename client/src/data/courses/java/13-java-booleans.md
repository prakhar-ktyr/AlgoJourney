---
title: Java Booleans
---

# Java Booleans

A `boolean` holds one of exactly two values: **`true`** or **`false`**. Booleans are how programs make decisions.

```java
boolean isOn = true;
boolean isOff = false;
```

## Boolean expressions

Comparisons produce booleans:

```java
int x = 10;
System.out.println(x > 5);     // true
System.out.println(x == 7);    // false
System.out.println(x != 7);    // true
```

You combine them with the logical operators we met earlier:

```java
boolean canVote = age >= 18 && citizen;
boolean weekend = (day == 6 || day == 7);
boolean rainy = !sunny;
```

## Truth table

| `a`   | `b`   | `a && b` | `a    |       | b`  | `!a` |
| ----- | ----- | -------- | ----- | ----- | --- | ---- |
| true  | true  | true     | true  | false |
| true  | false | false    | true  | false |
| false | true  | false    | true  | true  |
| false | false | false    | false | true  |

## Short-circuit evaluation

`&&` and `||` stop evaluating as soon as the result is determined.

```java
String s = null;
if (s != null && s.length() > 0) {     // safe — second part skipped if null
    System.out.println(s);
}
```

The bitwise `&` and `|` always evaluate both sides — usually you want `&&` and `||`.

## Booleans drive control flow

```java
if (loggedIn) {
    showDashboard();
} else {
    showLoginPage();
}

while (running) {
    tick();
}
```

## Storing the result of a comparison

A boolean variable can hold the result directly:

```java
int score = 73;
boolean passed = (score >= 60);
System.out.println(passed);     // true
```

## Boolean wrappers

The class `Boolean` is the object form of `boolean`. It allows `null` and is needed inside collections:

```java
Boolean maybe = null;
List<Boolean> flags = List.of(true, false, true);
```

> Avoid comparing wrappers with `==` — use `.equals(...)` or unbox first.

## A complete example

```java
public class BooleansDemo {
    public static void main(String[] args) {
        int hour = 14;
        boolean lunchTime = (hour >= 12 && hour <= 14);
        boolean working   = (hour >= 9  && hour < 17);

        if (lunchTime) {
            System.out.println("Time to eat!");
        } else if (working) {
            System.out.println("Back to work.");
        } else {
            System.out.println("Off the clock.");
        }
    }
}
```

In the next lesson we'll formalise decision-making with **`if` / `else`**.
