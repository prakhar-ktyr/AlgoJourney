---
title: Java Lambdas and Streams
---

# Java Lambdas and Streams

Java 8 introduced two of the most-loved modern features: **lambda expressions** for writing tiny anonymous functions, and the **Stream API** for declaring pipelines of operations on collections.

## Lambda expressions

A lambda is a compact way to implement a **functional interface** (one with a single abstract method).

```java
Runnable r = () -> System.out.println("Hi");
r.run();
```

Compare with the pre-Java-8 form:

```java
Runnable r = new Runnable() {
    @Override public void run() { System.out.println("Hi"); }
};
```

### Forms

```java
() -> doSomething()                      // no args
x  -> x * x                              // one arg, type inferred, single expression
(int x) -> x * x                         // explicit type
(x, y) -> x + y                          // two args
(x, y) -> {                              // multi-statement body — needs braces and 'return'
    int sum = x + y;
    return sum;
}
```

## Standard functional interfaces

Defined in `java.util.function`:

| Interface           | Method signature    | Use                   |
| ------------------- | ------------------- | --------------------- |
| `Function<T, R>`    | `R apply(T t)`      | Transform T into R.   |
| `Predicate<T>`      | `boolean test(T t)` | Test a condition.     |
| `Consumer<T>`       | `void accept(T t)`  | Side effect on T.     |
| `Supplier<T>`       | `T get()`           | Provide a T.          |
| `BiFunction<T,U,R>` | `R apply(T t, U u)` | Transform two inputs. |
| `UnaryOperator<T>`  | `T apply(T t)`      | T → T.                |
| `BinaryOperator<T>` | `T apply(T t, T u)` | (T, T) → T.           |

```java
Function<String, Integer> len   = s -> s.length();
Predicate<Integer> isEven       = n -> n % 2 == 0;
Consumer<String>  printer       = s -> System.out.println(s);
Supplier<Double>  random        = Math::random;

len.apply("hello");          // 5
isEven.test(4);              // true
printer.accept("hi");        // hi
random.get();                // 0.42... etc
```

## Method references

When a lambda just calls an existing method, replace it with a **method reference** `::`:

```java
list.forEach(s -> System.out.println(s));   // lambda
list.forEach(System.out::println);           // method reference

list.sort((a, b) -> a.compareTo(b));
list.sort(String::compareTo);

list.stream().map(s -> s.toUpperCase()).toList();
list.stream().map(String::toUpperCase).toList();
```

Four forms:

| Reference                   | Equivalent lambda                        |
| --------------------------- | ---------------------------------------- |
| `ClassName::staticMethod`   | `(args) -> ClassName.staticMethod(args)` |
| `instance::method`          | `(args) -> instance.method(args)`        |
| `ClassName::instanceMethod` | `(o, args) -> o.instanceMethod(args)`    |
| `ClassName::new`            | `(args) -> new ClassName(args)`          |

## The Stream API

A `Stream` is a pipeline of operations on a sequence of values. Streams **don't** store data — they describe a computation that runs once you call a _terminal_ operation.

```java
import java.util.List;
import java.util.stream.Collectors;

List<String> names = List.of("Ada", "Linus", "Grace", "Bjarne");

List<String> longUpper = names.stream()
    .filter(n -> n.length() > 3)        // intermediate
    .map(String::toUpperCase)            // intermediate
    .sorted()                             // intermediate
    .toList();                            // terminal

System.out.println(longUpper);            // [BJARNE, GRACE, LINUS]
```

### Common intermediate operations

| Op                         | What it does                               |
| -------------------------- | ------------------------------------------ |
| `filter(Predicate)`        | Keep elements that match.                  |
| `map(Function)`            | Transform each element.                    |
| `flatMap(Function)`        | Like map, but flatten a stream of streams. |
| `distinct()`               | Drop duplicates.                           |
| `sorted()` / `sorted(cmp)` | Sort elements.                             |
| `limit(n)`                 | Take the first n.                          |
| `skip(n)`                  | Drop the first n.                          |
| `peek(Consumer)`           | Side-effect for debugging.                 |

### Common terminal operations

| Op                                    | Result                           |
| ------------------------------------- | -------------------------------- |
| `toList()`                            | Immutable `List`.                |
| `collect(Collectors.toSet())`         | A `Set`.                         |
| `collect(Collectors.toMap(...))`      | A `Map`.                         |
| `count()`                             | How many elements.               |
| `anyMatch` / `allMatch` / `noneMatch` | `boolean`.                       |
| `findFirst` / `findAny`               | `Optional<T>`.                   |
| `reduce(...)`                         | Combine elements into one value. |
| `forEach(Consumer)`                   | Side effect per element.         |

### Numeric streams

`mapToInt`, `mapToLong`, `mapToDouble` produce specialised streams with extras:

```java
int total = nums.stream().mapToInt(Integer::intValue).sum();
double avg = nums.stream().mapToInt(Integer::intValue).average().orElse(0);
int  max  = nums.stream().mapToInt(Integer::intValue).max().orElseThrow();
```

### Grouping with collectors

```java
Map<Integer, List<String>> byLen = names.stream()
    .collect(Collectors.groupingBy(String::length));
```

```java
Map<Integer, Long> countsByLen = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));
```

### Creating streams

```java
Stream.of("a", "b", "c");
Arrays.stream(new int[]{1, 2, 3});
IntStream.range(0, 10);                       // 0..9
IntStream.rangeClosed(1, 10);                 // 1..10
Stream.iterate(1, n -> n * 2).limit(5);       // 1, 2, 4, 8, 16
Files.lines(Path.of("data.txt"));             // a stream of lines
```

### Parallel streams

Add `.parallel()` (or call `.parallelStream()`) to use multiple cores:

```java
long count = bigList.parallelStream()
                    .filter(this::isMatch)
                    .count();
```

Use parallel streams **only** when the per-element work is substantial and the operations are stateless and side-effect-free.

## Why prefer streams?

- **Declarative**: you say _what_ you want, not _how_.
- **Composable**: stages plug together cleanly.
- **Lazy**: intermediate ops do nothing until a terminal op runs.
- **Parallelisable**: a thread pool can do the work for free.

## A complete example

```java
import java.util.*;
import java.util.stream.*;

public class Demo {
    record Order(String customer, double total) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("Ada",   120.50),
            new Order("Linus",  80.00),
            new Order("Ada",    35.75),
            new Order("Grace", 220.00),
            new Order("Linus", 199.99)
        );

        Map<String, Double> totals = orders.stream()
            .collect(Collectors.groupingBy(
                Order::customer,
                Collectors.summingDouble(Order::total)
            ));

        totals.entrySet().stream()
              .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
              .forEach(e -> System.out.printf("%-7s $%.2f%n", e.getKey(), e.getValue()));
    }
}
```

```
Grace   $220.00
Linus   $279.99
Ada     $156.25
```

Next: the final wrap-up — **threads, concurrency, and the JVM**.
