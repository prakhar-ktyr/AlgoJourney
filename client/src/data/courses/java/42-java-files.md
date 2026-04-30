---
title: Java Files
---

# Java Files

Java's modern file API lives in **`java.nio.file`** — `Path`, `Paths`, and `Files`. It is concise, type-safe, and replaces the older `java.io.File` for almost every use case.

## Paths

A `Path` represents a filesystem location. It does **not** require the file to exist.

```java
import java.nio.file.Path;

Path p1 = Path.of("notes.txt");
Path p2 = Path.of("/Users/ada/projects", "java", "Hello.java");
Path p3 = p1.toAbsolutePath();

System.out.println(p2.getFileName());   // Hello.java
System.out.println(p2.getParent());     // /Users/ada/projects/java
```

## Reading a file

### Whole file as a string (small files):

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

public class ReadAll {
    public static void main(String[] args) throws IOException {
        String text = Files.readString(Path.of("notes.txt"));
        System.out.println(text);
    }
}
```

### As a list of lines:

```java
List<String> lines = Files.readAllLines(Path.of("notes.txt"));
for (String line : lines) System.out.println(line);
```

### Streaming (for large files):

```java
try (var stream = Files.lines(Path.of("big.txt"))) {
    stream.filter(l -> l.contains("ERROR"))
          .forEach(System.out::println);
}
```

`Files.lines` returns a `Stream<String>` — wrap it in try-with-resources so the underlying file is closed.

## Writing a file

### Whole string:

```java
Files.writeString(Path.of("hello.txt"), "Hello, world!\n");
```

### A list of lines:

```java
Files.write(Path.of("days.txt"), List.of("Mon", "Tue", "Wed"));
```

### Append instead of overwrite:

```java
import static java.nio.file.StandardOpenOption.*;

Files.writeString(
    Path.of("log.txt"),
    "another line\n",
    CREATE, APPEND
);
```

## Buffered reading and writing (line by line)

```java
try (var reader = Files.newBufferedReader(Path.of("big.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}

try (var writer = Files.newBufferedWriter(Path.of("out.txt"))) {
    writer.write("Hello");
    writer.newLine();
    writer.write("World");
}
```

## Checking and querying

```java
Files.exists(p);          // true / false
Files.isRegularFile(p);
Files.isDirectory(p);
Files.size(p);             // bytes
Files.getLastModifiedTime(p);
```

## Creating, copying, moving, deleting

```java
Files.createFile(Path.of("new.txt"));
Files.createDirectories(Path.of("a/b/c"));     // makes parents too

Files.copy(Path.of("a.txt"), Path.of("b.txt"));
Files.move(Path.of("b.txt"), Path.of("c.txt"));

Files.delete(Path.of("c.txt"));
Files.deleteIfExists(Path.of("missing.txt"));
```

## Listing a directory

For a single level:

```java
try (var entries = Files.list(Path.of("."))) {
    entries.forEach(System.out::println);
}
```

Recursively:

```java
try (var walk = Files.walk(Path.of("src"))) {
    walk.filter(Files::isRegularFile)
        .filter(p -> p.toString().endsWith(".java"))
        .forEach(System.out::println);
}
```

## Binary files

```java
byte[] data = Files.readAllBytes(Path.of("image.png"));
Files.write(Path.of("copy.png"), data);
```

For huge files use `InputStream` / `OutputStream` to stream byte by byte:

```java
try (var in  = Files.newInputStream(Path.of("video.mp4"));
     var out = Files.newOutputStream(Path.of("copy.mp4"))) {
    in.transferTo(out);
}
```

## Working with the classpath

To read a file packaged with your application (e.g. inside a `.jar`), use the class loader, **not** `Files`:

```java
try (var in = MyApp.class.getResourceAsStream("/config.properties")) {
    // ...
}
```

`Files` only works on real filesystem paths.

## A complete example: word-frequency counter

```java
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.io.IOException;

public class WordCount {
    public static void main(String[] args) throws IOException {
        try (var lines = Files.lines(Path.of("essay.txt"))) {
            Map<String, Long> counts = lines
                .flatMap(l -> Arrays.stream(l.toLowerCase().split("\\W+")))
                .filter(w -> !w.isBlank())
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

            counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .forEach(e -> System.out.printf("%-15s %d%n", e.getKey(), e.getValue()));
        }
    }
}
```

This uses concepts from later lessons (streams, collectors, lambdas) — come back to it when you've covered those.

Next: the **Java Collections Framework**.
