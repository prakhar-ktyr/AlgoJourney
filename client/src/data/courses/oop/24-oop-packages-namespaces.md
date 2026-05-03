---
title: Packages and Namespaces
---

# Packages and Namespaces

As projects grow, you need a way to **organize** classes and **avoid naming conflicts**. Packages (Java), namespaces (C++), modules (Python, JavaScript) solve this.

---

## The Problem

Without organization, a large project might have:

```
User.java           ← which User? Customer? Admin?
Database.java       ← which database module?
Helper.java         ← too generic!
```

Two developers might both create a `User` class, causing a conflict.

---

## Namespaces (C++)

C++ uses `namespace` to organize code and avoid naming conflicts:

```cpp
#include <iostream>

namespace geometry {
    class Circle {
    public:
        double radius;
        Circle(double r) : radius(r) {}
        double area() { return 3.14159 * radius * radius; }
    };

    class Rectangle {
    public:
        double width, height;
        Rectangle(double w, double h) : width(w), height(h) {}
        double area() { return width * height; }
    };
}

namespace physics {
    class Circle {
    public:
        double radius;
        Circle(double r) : radius(r) {}
        double circumference() { return 2 * 3.14159 * radius; }
    };
}

// Usage with fully qualified names
geometry::Circle gc(5);
std::cout << gc.area() << std::endl;

physics::Circle pc(5);
std::cout << pc.circumference() << std::endl;

// Using directive (imports entire namespace)
using namespace geometry;
Circle c(3);  // Uses geometry::Circle

// Using declaration (imports one name)
using physics::Circle;  // Now Circle refers to physics::Circle
```

```csharp
using System;

namespace Geometry
{
    class Circle
    {
        public double Radius { get; }
        public Circle(double r) => Radius = r;
        public double Area() => Math.PI * Radius * Radius;
    }

    class Rectangle
    {
        public double Width { get; }
        public double Height { get; }
        public Rectangle(double w, double h) { Width = w; Height = h; }
        public double Area() => Width * Height;
    }
}

namespace Physics
{
    class Circle
    {
        public double Radius { get; }
        public Circle(double r) => Radius = r;
        public double Circumference() => 2 * Math.PI * Radius;
    }
}

// Usage with fully qualified names
var gc = new Geometry.Circle(5);
Console.WriteLine(gc.Area());

var pc = new Physics.Circle(5);
Console.WriteLine(pc.Circumference());

// Using directive (imports namespace)
using Geometry;
Circle c = new Circle(3);  // Uses Geometry.Circle
```

```java
// File: com/example/models/User.java
package com.example.models;

public class User {
    String name;
    String email;
}
```

```python
# File: myproject/models/user.py
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
```

```javascript
// File: models/user.js (ES Modules)
export class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}
```

---

## Packages (Java)

A **package** is a directory that groups related classes. It also creates a unique namespace.

### Package Declaration and Imports

```cpp
// C++ uses namespaces and #include for organization
// File: models/user.h
#pragma once
#include <string>

namespace com::example::models {
    class User {
    public:
        std::string name;
        std::string email;
    };
}

// File: services/user_service.h
#pragma once
#include "models/user.h"

namespace com::example::services {
    class UserService {
    public:
        com::example::models::User findUser(int id);
    };
}
```

```csharp
// File: Models/User.cs
namespace Com.Example.Models;

public class User
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}

// File: Services/UserService.cs
using Com.Example.Models;

namespace Com.Example.Services;

public class UserService
{
    public User FindUser(int id)
    {
        // ...
        return new User();
    }
}
```

```java
// File: com/example/models/User.java
package com.example.models;

public class User {
    String name;
    String email;
}

// File: com/example/services/UserService.java
package com.example.services;

import com.example.models.User;

public class UserService {
    public User findUser(int id) {
        // ...
        return new User();
    }
}
```

```python
# File: myproject/models/user.py
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

# File: myproject/services/user_service.py
from myproject.models.user import User

class UserService:
    def find_user(self, user_id):
        # ...
        return User("", "")
```

```javascript
// File: models/User.js
export class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// File: services/UserService.js
import { User } from "../models/User.js";

export class UserService {
  findUser(id) {
    // ...
    return new User("", "");
  }
}
```

### Directory Structure

```
src/
└── com/
    └── example/
        ├── models/
        │   ├── User.java
        │   ├── Product.java
        │   └── Order.java
        ├── services/
        │   ├── UserService.java
        │   └── OrderService.java
        ├── controllers/
        │   └── UserController.java
        └── utils/
            └── StringHelper.java
```

### Import Statements

```cpp
// C++ uses #include and using declarations
#include "models/user.h"
#include "models/product.h"

using com::example::models::User;
// or import everything:
using namespace com::example::models;
```

```csharp
// C# uses 'using' directives
using Com.Example.Models;

// Import everything from a namespace (already done with 'using')
// All public types in Com.Example.Models are accessible

// Fully qualified name (no using needed)
Com.Example.Models.User user = new Com.Example.Models.User();

// Alias a namespace
using Models = Com.Example.Models;
var u = new Models.User();
```

```java
// Import a specific class
import com.example.models.User;

// Import all classes from a package
import com.example.models.*;

// Fully qualified name (no import needed)
com.example.models.User user = new com.example.models.User();
```

```python
# Import a module
from myproject.models.user import User

# Import everything from a module
from myproject.models import *

# Import with alias
from myproject.services.user_service import UserService as US

# Relative imports (within the same package)
from .user import User            # Same directory
from ..utils.string_helper import capitalize  # Parent's sibling
```

```javascript
// Import specific exports
import { User } from "./models/User.js";

// Import everything as namespace
import * as models from "./models/index.js";
const user = new models.User("Alice", "a@b.com");

// Import with alias
import { UserService as US } from "./services/UserService.js";

// Default import
import User from "./models/User.js";  // If exported as default
```

---

## Common Package Conventions

| Package Pattern | Purpose |
|----------------|---------|
| `com.company.project` | Base package (Java) |
| `*.models` / `*.entities` | Data classes |
| `*.services` | Business logic |
| `*.controllers` | Request handling |
| `*.repositories` / `*.dao` | Database access |
| `*.utils` / `*.helpers` | Utility functions |
| `*.exceptions` | Custom exceptions |
| `*.config` | Configuration classes |

---

## Modules (Python)

In Python, each `.py` file is a **module**, and a directory with `__init__.py` is a **package**.

### The `__init__.py` File

```cpp
// C++ equivalent: a header that re-exports symbols
// File: models/models.h
#pragma once
#include "user.h"
#include "product.h"
// Now including "models/models.h" gives access to both
```

```csharp
// C# equivalent: re-export via a common namespace or global using
// File: Models/User.cs
namespace MyProject.Models;
public class User { /* ... */ }

// File: Models/Product.cs
namespace MyProject.Models;
public class Product { /* ... */ }

// File: GlobalUsings.cs (C# 10+)
global using MyProject.Models;
// Now User and Product are available everywhere
```

```java
// Java doesn't have an exact equivalent.
// Packages are implicit from directory structure.
// Use a "barrel" class if needed:
package com.example.models;
// Each class is individually importable
```

```python
# myproject/models/__init__.py
# Re-export for convenient access
from .user import User
from .product import Product

# Now users can do:
# from myproject.models import User, Product
```

```javascript
// models/index.js — barrel file
export { User } from "./User.js";
export { Product } from "./Product.js";

// Now users can do:
// import { User, Product } from "./models/index.js";
```

---

## Access Control with Packages (Java)

Package-private (default access) restricts visibility to the same package:

```cpp
// C++ uses unnamed namespaces or 'internal' patterns for file-local visibility
namespace {
    // Everything here is only visible in this translation unit
    class InternalHelper {
    public:
        static void doWork() { /* ... */ }
    };
}

// Public API
namespace com::example::models {
    class User {
    public:
        void init() {
            InternalHelper::doWork();  // ✅ Same file
        }
    };
}
```

```csharp
// C# uses 'internal' access modifier for assembly-level visibility
namespace Com.Example.Models;

internal class InternalHelper  // Only visible within the same assembly
{
    public static void DoWork() { /* ... */ }
}

public class User
{
    public void Init()
    {
        InternalHelper.DoWork();  // ✅ Same assembly
    }
}

// In another assembly:
// InternalHelper.DoWork();  // ❌ Not visible!
```

```java
package com.example.models;

class InternalHelper {       // package-private — not visible outside this package
    static void doWork() { }
}

public class User {          // public — visible everywhere
    void init() {
        InternalHelper.doWork();  // ✅ Same package
    }
}

// In another package:
// import com.example.models.InternalHelper;  // ❌ Not visible!
```

```python
# Python convention: prefix with underscore for "private" modules/functions
# File: myproject/models/_internal.py
def _do_work():
    pass

# File: myproject/models/user.py
from ._internal import _do_work

class User:
    def init(self):
        _do_work()  # ✅ Works (convention-based privacy)
```

```javascript
// JavaScript uses file scope — unexported symbols are private
// File: models/internal.js
function doWork() {
  // Not exported — private to this module
}

export class User {
  init() {
    doWork();  // ✅ Accessible within the same module
  }
}

// From another file:
// import { doWork } from "./models/internal.js";  // ❌ Not exported!
```

---

## File-Scoped Namespaces (C#)

C# 10 introduced **file-scoped namespaces** that reduce nesting and boilerplate:

```csharp
// Traditional namespace (pre-C# 10)
namespace MyApp.Models
{
    public class User
    {
        public string Name { get; set; } = "";
    }
}

// File-scoped namespace (C# 10+) — applies to entire file
namespace MyApp.Models;

public class User
{
    public string Name { get; set; } = "";
}
```

C# also supports **global using directives** (C# 10+) in a single file to apply `using` statements project-wide:

```csharp
// File: GlobalUsings.cs
global using System;
global using System.Collections.Generic;
global using System.Linq;
// These usings are now available in every file in the project
```

---

## Practical Project Structure

### Java Spring-style Application

```
src/main/java/com/example/bookstore/
├── BookstoreApplication.java
├── model/
│   ├── Book.java
│   ├── Author.java
│   └── Category.java
├── repository/
│   ├── BookRepository.java
│   └── AuthorRepository.java
├── service/
│   ├── BookService.java
│   └── AuthorService.java
├── controller/
│   ├── BookController.java
│   └── AuthorController.java
├── exception/
│   ├── BookNotFoundException.java
│   └── ValidationException.java
└── config/
    └── AppConfig.java
```

### Python Django-style Application

```
bookstore/
├── manage.py
├── bookstore/
│   ├── __init__.py
│   ├── settings.py
│   └── urls.py
└── books/
    ├── __init__.py
    ├── models.py
    ├── views.py
    ├── serializers.py
    ├── urls.py
    └── tests.py
```

### Node.js / JavaScript Application

```
bookstore/
├── package.json
├── src/
│   ├── index.js
│   ├── models/
│   │   ├── Book.js
│   │   └── Author.js
│   ├── services/
│   │   └── BookService.js
│   ├── controllers/
│   │   └── BookController.js
│   └── utils/
│       └── helpers.js
└── tests/
    └── book.test.js
```

---

## Key Takeaways

- **Namespaces** (C++), **packages** (Java), **modules** (Python, JS) organize code into logical groups
- They prevent **naming conflicts** by creating separate namespaces
- Follow **standard conventions** for package/module naming
- Use access control to hide implementation details: unnamed namespaces (C++), package-private (Java), underscore prefix (Python), unexported symbols (JS)
- Structure projects by **feature** or **layer** (models, services, controllers)
- Well-organized code is easier to **navigate**, **maintain**, and **scale**

Next: **Operator Overloading** — making operators work with your custom objects.
