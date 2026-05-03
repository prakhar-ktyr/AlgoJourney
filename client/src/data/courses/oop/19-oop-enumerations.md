---
title: Enumerations
---

# Enumerations

An **enumeration** (enum) is a special type that represents a **fixed set of named constants**. Use enums when a variable can only be one of a predefined set of values.

---

## Why Enums?

Without enums, you might use raw strings or integers:

```
// ❌ BAD — error-prone
status = "active"     // Typo: "actve" won't be caught
direction = 1         // What does 1 mean? North? Up?
```

With enums:

```
// ✅ GOOD — type-safe
status = Status.ACTIVE       // Can't misspell — compiler/runtime checks
direction = Direction.NORTH  // Self-documenting
```

---

## Defining Enums

```cpp
#include <iostream>
using namespace std;

// C++ uses 'enum class' (scoped enums, C++11)
enum class Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
};

enum class Status {
    ACTIVE, INACTIVE, SUSPENDED, DELETED
};

enum class Direction {
    NORTH, SOUTH, EAST, WEST
};
```

```csharp
enum Day {
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
}

enum Status {
    Active, Inactive, Suspended, Deleted
}

enum Direction {
    North, South, East, West
}
```

```java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

enum Status {
    ACTIVE, INACTIVE, SUSPENDED, DELETED
}

enum Direction {
    NORTH, SOUTH, EAST, WEST
}
```

```python
from enum import Enum

class Day(Enum):
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7

class Status(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"
```

```javascript
// JavaScript has no native enum — use frozen objects
const Day = Object.freeze({
    MONDAY: "MONDAY",
    TUESDAY: "TUESDAY",
    WEDNESDAY: "WEDNESDAY",
    THURSDAY: "THURSDAY",
    FRIDAY: "FRIDAY",
    SATURDAY: "SATURDAY",
    SUNDAY: "SUNDAY",
});

const Status = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    DELETED: "deleted",
});
```

---

## Using Enums

```cpp
#include <iostream>
using namespace std;

int main() {
    Day today = Day::WEDNESDAY;

    if (today == Day::SATURDAY || today == Day::SUNDAY) {
        cout << "Weekend!" << endl;
    } else {
        cout << "Weekday" << endl;
    }

    // Switch statement
    switch (today) {
        case Day::MONDAY:
            cout << "Start of the work week" << endl;
            break;
        case Day::FRIDAY:
            cout << "Almost weekend!" << endl;
            break;
        case Day::SATURDAY:
        case Day::SUNDAY:
            cout << "Weekend!" << endl;
            break;
        default:
            cout << "Midweek" << endl;
    }
}
```

```csharp
Day today = Day.Wednesday;

if (today == Day.Saturday || today == Day.Sunday) {
    Console.WriteLine("Weekend!");
} else {
    Console.WriteLine("Weekday");
}

// Switch statement
switch (today) {
    case Day.Monday:
        Console.WriteLine("Start of the work week");
        break;
    case Day.Friday:
        Console.WriteLine("Almost weekend!");
        break;
    case Day.Saturday:
    case Day.Sunday:
        Console.WriteLine("Weekend!");
        break;
    default:
        Console.WriteLine("Midweek");
        break;
}
```

```java
Day today = Day.WEDNESDAY;

// In if statements
if (today == Day.SATURDAY || today == Day.SUNDAY) {
    System.out.println("Weekend!");
} else {
    System.out.println("Weekday");
}

// In switch statements
switch (today) {
    case MONDAY:
        System.out.println("Start of the work week");
        break;
    case FRIDAY:
        System.out.println("Almost weekend!");
        break;
    case SATURDAY:
    case SUNDAY:
        System.out.println("Weekend!");
        break;
    default:
        System.out.println("Midweek");
}
```

```python
today = Day.WEDNESDAY

if today in (Day.SATURDAY, Day.SUNDAY):
    print("Weekend!")
else:
    print("Weekday")

# Accessing value
print(today.value)  # 3
print(today.name)   # WEDNESDAY
```

```javascript
const today = Day.WEDNESDAY;

if (today === Day.SATURDAY || today === Day.SUNDAY) {
    console.log("Weekend!");
} else {
    console.log("Weekday");
}

// Switch statement
switch (today) {
    case Day.MONDAY:
        console.log("Start of the work week");
        break;
    case Day.FRIDAY:
        console.log("Almost weekend!");
        break;
    case Day.SATURDAY:
    case Day.SUNDAY:
        console.log("Weekend!");
        break;
    default:
        console.log("Midweek");
}
```

---

## Enums with Fields and Methods

Java enums are full-featured classes. They can have fields, constructors, and methods. Other languages achieve similar results differently:

```cpp
#include <iostream>
#include <string>
using namespace std;

// C++ enums can't have methods — use a class with static constants
class Planet {
    double mass;
    double radius;

    Planet(double mass, double radius) : mass(mass), radius(radius) {}

public:
    static const Planet MERCURY;
    static const Planet VENUS;
    static const Planet EARTH;
    static const Planet MARS;

    double surfaceGravity() const {
        const double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }

    double surfaceWeight(double otherMass) const {
        return otherMass * surfaceGravity();
    }
};

const Planet Planet::MERCURY(3.303e+23, 2.4397e6);
const Planet Planet::VENUS(4.869e+24, 6.0518e6);
const Planet Planet::EARTH(5.976e+24, 6.37814e6);
const Planet Planet::MARS(6.421e+23, 3.3972e6);
```

```csharp
using System;

// C# enums are simple value types — use a class for rich enums
class Planet {
    public string Name { get; }
    private double mass;
    private double radius;

    private Planet(string name, double mass, double radius) {
        Name = name;
        this.mass = mass;
        this.radius = radius;
    }

    public static readonly Planet Mercury = new("Mercury", 3.303e+23, 2.4397e6);
    public static readonly Planet Venus   = new("Venus", 4.869e+24, 6.0518e6);
    public static readonly Planet Earth   = new("Earth", 5.976e+24, 6.37814e6);
    public static readonly Planet Mars    = new("Mars", 6.421e+23, 3.3972e6);

    public double SurfaceGravity() {
        const double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }

    public double SurfaceWeight(double otherMass) {
        return otherMass * SurfaceGravity();
    }

    public static Planet[] Values() => new[] { Mercury, Venus, Earth, Mars };
}

double earthWeight = 75;
foreach (Planet p in Planet.Values()) {
    Console.WriteLine($"Your weight on {p.Name}: {p.SurfaceWeight(earthWeight):F2} N");
}
```

```java
enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6),
    MARS(6.421e+23, 3.3972e6);

    private final double mass;    // in kg
    private final double radius;  // in meters

    // Constructor (always private for enums)
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }

    double surfaceWeight(double otherMass) {
        return otherMass * surfaceGravity();
    }
}

double earthWeight = 75;  // kg
for (Planet p : Planet.values()) {
    System.out.printf("Your weight on %s: %.2f N%n",
        p, p.surfaceWeight(earthWeight));
}
```

```python
from enum import Enum

class Planet(Enum):
    MERCURY = (3.303e+23, 2.4397e6)
    VENUS   = (4.869e+24, 6.0518e6)
    EARTH   = (5.976e+24, 6.37814e6)
    MARS    = (6.421e+23, 3.3972e6)

    def __init__(self, mass, radius):
        self.mass = mass
        self.radius = radius

    def surface_gravity(self):
        G = 6.67300E-11
        return G * self.mass / (self.radius ** 2)

    def surface_weight(self, other_mass):
        return other_mass * self.surface_gravity()

earth_weight = 75
for planet in Planet:
    print(f"Your weight on {planet.name}: {planet.surface_weight(earth_weight):.2f} N")
```

```javascript
// JavaScript — use a class with static instances
class Planet {
    constructor(name, mass, radius) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
    }

    surfaceGravity() {
        const G = 6.67300E-11;
        return G * this.mass / (this.radius ** 2);
    }

    surfaceWeight(otherMass) {
        return otherMass * this.surfaceGravity();
    }

    static MERCURY = new Planet("MERCURY", 3.303e+23, 2.4397e6);
    static VENUS   = new Planet("VENUS", 4.869e+24, 6.0518e6);
    static EARTH   = new Planet("EARTH", 5.976e+24, 6.37814e6);
    static MARS    = new Planet("MARS", 6.421e+23, 3.3972e6);

    static values() {
        return [Planet.MERCURY, Planet.VENUS, Planet.EARTH, Planet.MARS];
    }
}

const earthWeight = 75;
for (const p of Planet.values()) {
    console.log(`Your weight on ${p.name}: ${p.surfaceWeight(earthWeight).toFixed(2)} N`);
}
```

---

## Enum Methods

```cpp
#include <iostream>
using namespace std;

enum class Color { RED, GREEN, BLUE };

// C++ enum class doesn't have built-in methods
// Iterate manually or use an array
const Color allColors[] = { Color::RED, Color::GREEN, Color::BLUE };
const char* colorNames[] = { "RED", "GREEN", "BLUE" };

int main() {
    for (int i = 0; i < 3; i++) {
        cout << colorNames[i] << endl;
    }
}
```

```csharp
enum Color { Red, Green, Blue }

// Get all values
Color[] all = Enum.GetValues<Color>();  // [Red, Green, Blue]

// Convert string to enum
Color c = Enum.Parse<Color>("Red");  // Color.Red

// Get name and underlying value
Console.WriteLine(c.ToString());        // "Red"
Console.WriteLine((int)c);              // 0

// Iterate
foreach (Color color in Enum.GetValues<Color>()) {
    Console.WriteLine(color);
}
```

```java
enum Color {
    RED, GREEN, BLUE
}

// Get all values
Color[] all = Color.values();  // [RED, GREEN, BLUE]

// Convert string to enum
Color c = Color.valueOf("RED");  // Color.RED

// Get name and ordinal (position)
System.out.println(c.name());     // "RED"
System.out.println(c.ordinal());  // 0
```

```python
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

# Iterate
for color in Color:
    print(color)  # Color.RED, Color.GREEN, Color.BLUE

# Access by name or value
print(Color["RED"])    # Color.RED (by name)
print(Color(1))        # Color.RED (by value)

# List all
print(list(Color))     # [Color.RED, Color.GREEN, Color.BLUE]
```

```javascript
const Color = Object.freeze({
    RED: "RED",
    GREEN: "GREEN",
    BLUE: "BLUE",
});

// Get all values
const allColors = Object.values(Color);  // ["RED", "GREEN", "BLUE"]

// Get all keys
const allKeys = Object.keys(Color);  // ["RED", "GREEN", "BLUE"]

// Check if a value is valid
console.log(Object.values(Color).includes("RED"));  // true
```

---

## Practical Example — State Machine

Enums are great for representing states:

```cpp
#include <iostream>
#include <string>
using namespace std;

enum class OrderStatus {
    PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
};

bool canTransitionTo(OrderStatus current, OrderStatus next) {
    switch (current) {
        case OrderStatus::PLACED:
            return next == OrderStatus::CONFIRMED || next == OrderStatus::CANCELLED;
        case OrderStatus::CONFIRMED:
            return next == OrderStatus::SHIPPED || next == OrderStatus::CANCELLED;
        case OrderStatus::SHIPPED:
            return next == OrderStatus::DELIVERED;
        default:
            return false;
    }
}

int main() {
    OrderStatus current = OrderStatus::PLACED;
    cout << boolalpha;
    cout << canTransitionTo(current, OrderStatus::CONFIRMED) << endl;  // true
    cout << canTransitionTo(current, OrderStatus::DELIVERED) << endl;  // false
}
```

```csharp
using System;
using System.Collections.Generic;

enum OrderStatus {
    Placed, Confirmed, Shipped, Delivered, Cancelled
}

static class OrderStatusExtensions {
    private static readonly Dictionary<OrderStatus, HashSet<OrderStatus>> transitions = new() {
        [OrderStatus.Placed] = new() { OrderStatus.Confirmed, OrderStatus.Cancelled },
        [OrderStatus.Confirmed] = new() { OrderStatus.Shipped, OrderStatus.Cancelled },
        [OrderStatus.Shipped] = new() { OrderStatus.Delivered },
        [OrderStatus.Delivered] = new(),
        [OrderStatus.Cancelled] = new()
    };

    public static bool CanTransitionTo(this OrderStatus current, OrderStatus next) {
        return transitions[current].Contains(next);
    }
}

OrderStatus current = OrderStatus.Placed;
Console.WriteLine(current.CanTransitionTo(OrderStatus.Confirmed));  // True
Console.WriteLine(current.CanTransitionTo(OrderStatus.Delivered));  // False
```

```java
enum OrderStatus {
    PLACED("Order has been placed"),
    CONFIRMED("Order confirmed by seller"),
    SHIPPED("Order is on the way"),
    DELIVERED("Order delivered"),
    CANCELLED("Order was cancelled");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    boolean canTransitionTo(OrderStatus next) {
        switch (this) {
            case PLACED:    return next == CONFIRMED || next == CANCELLED;
            case CONFIRMED: return next == SHIPPED || next == CANCELLED;
            case SHIPPED:   return next == DELIVERED;
            case DELIVERED:
            case CANCELLED: return false;
            default:        return false;
        }
    }

    String getDescription() {
        return description;
    }
}

OrderStatus current = OrderStatus.PLACED;
System.out.println(current.canTransitionTo(OrderStatus.CONFIRMED));  // true
System.out.println(current.canTransitionTo(OrderStatus.DELIVERED));  // false
```

```python
from enum import Enum

class OrderStatus(Enum):
    PLACED = "Order has been placed"
    CONFIRMED = "Order confirmed by seller"
    SHIPPED = "Order is on the way"
    DELIVERED = "Order delivered"
    CANCELLED = "Order was cancelled"

    def can_transition_to(self, next_status):
        transitions = {
            OrderStatus.PLACED: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
            OrderStatus.CONFIRMED: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
            OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
            OrderStatus.DELIVERED: set(),
            OrderStatus.CANCELLED: set(),
        }
        return next_status in transitions.get(self, set())

current = OrderStatus.PLACED
print(current.can_transition_to(OrderStatus.CONFIRMED))  # True
print(current.can_transition_to(OrderStatus.DELIVERED))  # False
```

```javascript
class OrderStatus {
    static PLACED = new OrderStatus("PLACED", "Order has been placed");
    static CONFIRMED = new OrderStatus("CONFIRMED", "Order confirmed by seller");
    static SHIPPED = new OrderStatus("SHIPPED", "Order is on the way");
    static DELIVERED = new OrderStatus("DELIVERED", "Order delivered");
    static CANCELLED = new OrderStatus("CANCELLED", "Order was cancelled");

    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    canTransitionTo(next) {
        const transitions = {
            PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            SHIPPED: [OrderStatus.DELIVERED],
            DELIVERED: [],
            CANCELLED: [],
        };
        return (transitions[this.name] || []).includes(next);
    }
}

const current = OrderStatus.PLACED;
console.log(current.canTransitionTo(OrderStatus.CONFIRMED));  // true
console.log(current.canTransitionTo(OrderStatus.DELIVERED));  // false
```

---

## When to Use Enums

| Scenario | Example |
|----------|---------|
| Fixed set of options | Days of week, months, seasons |
| Status/state values | Order status, connection state |
| Configuration options | Log levels (DEBUG, INFO, ERROR) |
| Type classification | User roles (ADMIN, USER, GUEST) |
| Direction/orientation | NORTH, SOUTH, EAST, WEST |

---

## Key Takeaways

- Enums represent a **fixed set of named constants**
- They are **type-safe** — the compiler/runtime prevents invalid values
- Java enums can have **fields, methods, and constructors**
- C++ uses `enum class` for scoped, type-safe enumerations
- C# enums are value types; use `[Flags]` for bitwise combinations
- Python enums use the `Enum` class from the `enum` module
- JavaScript uses `Object.freeze()` or class-based patterns to simulate enums
- Enums are ideal for **states**, **categories**, **options**, and **configurations**
- Enums make code more **readable** and **self-documenting**

## Flags Enums (C#)

C# has the `[Flags]` attribute for enums that represent combinable bit flags:

```csharp
using System;

[Flags]
enum FilePermission {
    None    = 0,
    Read    = 1,
    Write   = 2,
    Execute = 4
}

// Combine permissions with bitwise OR
FilePermission userPerms = FilePermission.Read | FilePermission.Write;
Console.WriteLine(userPerms);  // Read, Write

// Check if a permission is set
bool canWrite = userPerms.HasFlag(FilePermission.Write);  // true
bool canExec = userPerms.HasFlag(FilePermission.Execute); // false

// Add/remove permissions
userPerms |= FilePermission.Execute;   // Add Execute
userPerms &= ~FilePermission.Write;    // Remove Write
Console.WriteLine(userPerms);          // Read, Execute
```

Next: **Generics and Templates** — writing type-safe code that works with any type.
