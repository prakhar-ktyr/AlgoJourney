---
title: Java Packages and Import
---

# Java Packages and Import

A **package** is a namespace that groups related classes. Packages prevent name clashes (you can have your own `List` even though `java.util.List` exists), provide an extra level of access control, and reflect the directory structure of your source code.

## Declaring a package

The first non-comment line of a `.java` file declares its package:

```java
package com.example.shop;

public class Product {
    // ...
}
```

The file `Product.java` must live in a folder structure matching the package: `com/example/shop/Product.java`.

A class without a `package` declaration is in the **default package** (don't ship code there — it's only OK for tiny experiments).

## Naming convention

Use the **reverse of a domain you control**, all lowercase, dotted:

```
com.example.shop
io.github.octocat.app
org.acme.billing.invoice
```

This guarantees unique names worldwide.

## Importing

To use a class from another package, either:

1. Refer to it by its **fully-qualified name** every time:

   ```java
   public class Demo {
       public static void main(String[] args) {
           java.util.List<String> xs = new java.util.ArrayList<>();
       }
   }
   ```

2. **`import`** it once at the top of the file:

   ```java
   package com.example.app;

   import java.util.List;
   import java.util.ArrayList;

   public class Demo {
       public static void main(String[] args) {
           List<String> xs = new ArrayList<>();
       }
   }
   ```

### Wildcard imports

You can import every public type in a package with `*`:

```java
import java.util.*;
```

This is convenient but makes it harder to see where each class comes from. Most teams prefer explicit imports — modern IDEs handle them automatically.

### `import static`

Import individual static members so you can use them without the class prefix:

```java
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;

public class Demo {
    public static void main(String[] args) {
        System.out.println(sqrt(PI));
    }
}
```

Use sparingly — overuse hurts readability.

## What's already imported

The package **`java.lang`** is imported automatically into every file. That's why you can write `String`, `Integer`, `System`, `Math`, `Object`, `Throwable`, … without an `import`.

## Resolving name clashes

If two imported types have the same simple name, the compiler can't pick. Use the fully-qualified name for one:

```java
import java.util.Date;

public class Demo {
    public static void main(String[] args) {
        Date u = new Date();
        java.sql.Date s = new java.sql.Date(System.currentTimeMillis());
    }
}
```

## Package-private access

A class, field, or method without an access modifier is visible only **within its own package**. This is the perfect default for helper classes that aren't part of the package's public API.

```java
package com.example.shop;

class Internal {           // package-private — invisible to com.example.web
    void helper() { ... }
}
```

## Layout in real projects

A typical Maven / Gradle project looks like:

```
src/main/java/
    com/example/shop/
        Product.java
        Cart.java
        pricing/
            DiscountEngine.java
            TaxCalculator.java
```

The directory structure mirrors `com.example.shop` and `com.example.shop.pricing`.

## Compiling packaged code by hand

```bash
# from the source root
javac com/example/shop/*.java
java com.example.shop.Product       # full class name, with dots
```

In real projects you'll use **Maven** or **Gradle** to handle compilation, dependencies, and packaging into a `.jar`.

## A quick split-file example

```java
// File: com/example/shop/Money.java
package com.example.shop;

public class Money {
    public final long cents;
    public Money(long cents) { this.cents = cents; }
    @Override public String toString() { return "$" + (cents / 100.0); }
}
```

```java
// File: com/example/shop/Product.java
package com.example.shop;

public class Product {
    private final String name;
    private final Money price;

    public Product(String name, Money price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() { return name + " @ " + price; }
}
```

```java
// File: com/example/app/Main.java
package com.example.app;

import com.example.shop.Money;
import com.example.shop.Product;

public class Main {
    public static void main(String[] args) {
        Product p = new Product("Apple", new Money(199));
        System.out.println(p);   // Apple @ $1.99
    }
}
```

Compile from the source root:

```bash
javac com/example/shop/*.java com/example/app/Main.java
java com.example.app.Main
```

Next: **inheritance**.
