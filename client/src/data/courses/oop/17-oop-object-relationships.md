---
title: Object Relationships
---

# Object Relationships

Objects in OOP don't exist in isolation — they relate to each other. Understanding these relationships is crucial for designing good class structures.

---

## Types of Relationships

| Relationship | Strength | Lifetime Coupling | Example |
|-------------|----------|-------------------|---------|
| **Dependency** | Weakest | Temporary | A method receives an object as a parameter |
| **Association** | Weak | Independent | A Teacher knows a Student |
| **Aggregation** | Medium | Independent (shared) | A Department has Employees |
| **Composition** | Strong | Dependent (owned) | A House has Rooms |

---

## Dependency ("Uses")

The weakest relationship. One class **uses** another temporarily, typically as a method parameter.

```cpp
#include <iostream>
#include <string>
using namespace std;

class Document {
public:
    string getContent() { return "Hello World"; }
};

class Printer {
public:
    // Printer USES Document — only during this method call
    void print(Document& doc) {
        cout << "Printing: " << doc.getContent() << endl;
    }
};
```

```csharp
using System;

class Document {
    public string GetContent() { return "Hello World"; }
}

class Printer {
    // Printer USES Document — only during this method call
    public void Print(Document doc) {
        Console.WriteLine($"Printing: {doc.GetContent()}");
    }
}
```

```java
class Printer {
    // Printer USES Document — only during this method call
    void print(Document doc) {
        System.out.println("Printing: " + doc.getContent());
    }
}
```

```python
class Printer:
    # Printer USES Document — only during this method call
    def print(self, doc):
        print(f"Printing: {doc.get_content()}")
```

```javascript
class Printer {
    // Printer USES Document — only during this method call
    print(doc) {
        console.log(`Printing: ${doc.getContent()}`);
    }
}
```

The `Printer` doesn't store the `Document` — it only uses it briefly during `print()`.

---

## Association ("Knows")

Two classes are **aware of each other** but are independent. Neither owns the other.

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Student;  // Forward declaration

class Teacher {
public:
    string name;
    vector<Student*> students;

    Teacher(string name) : name(name) {}
    void addStudent(Student* s) { students.push_back(s); }
};

class Student {
public:
    string name;
    Teacher* advisor = nullptr;

    Student(string name) : name(name) {}
    void setAdvisor(Teacher* t) { advisor = t; }
};

int main() {
    Teacher prof("Dr. Smith");
    Student alice("Alice");

    prof.addStudent(&alice);
    alice.setAdvisor(&prof);
    // If alice is removed, prof still exists (and vice versa)
}
```

```csharp
using System;
using System.Collections.Generic;

class Teacher {
    public string Name;
    public List<Student> Students = new();

    public Teacher(string name) {
        Name = name;
    }

    public void AddStudent(Student s) {
        Students.Add(s);
    }
}

class Student {
    public string Name;
    public Teacher? Advisor;

    public Student(string name) {
        Name = name;
    }

    public void SetAdvisor(Teacher t) {
        Advisor = t;
    }
}

// Both exist independently
Teacher prof = new Teacher("Dr. Smith");
Student alice = new Student("Alice");

prof.AddStudent(alice);
alice.SetAdvisor(prof);

// If alice is removed, prof still exists (and vice versa)
```

```java
class Teacher {
    String name;
    List<Student> students;

    Teacher(String name) {
        this.name = name;
        this.students = new ArrayList<>();
    }

    void addStudent(Student s) {
        students.add(s);
    }
}

class Student {
    String name;
    Teacher advisor;

    Student(String name) {
        this.name = name;
    }

    void setAdvisor(Teacher t) {
        this.advisor = t;
    }
}

// Both exist independently
Teacher prof = new Teacher("Dr. Smith");
Student alice = new Student("Alice");

prof.addStudent(alice);
alice.setAdvisor(prof);

// If alice is removed, prof still exists (and vice versa)
```

```python
class Teacher:
    def __init__(self, name):
        self.name = name
        self.students = []

    def add_student(self, student):
        self.students.append(student)

class Student:
    def __init__(self, name):
        self.name = name
        self.advisor = None

    def set_advisor(self, teacher):
        self.advisor = teacher

# Both exist independently
prof = Teacher("Dr. Smith")
alice = Student("Alice")

prof.add_student(alice)
alice.set_advisor(prof)

# If alice is removed, prof still exists (and vice versa)
```

```javascript
class Teacher {
    constructor(name) {
        this.name = name;
        this.students = [];
    }

    addStudent(student) {
        this.students.push(student);
    }
}

class Student {
    constructor(name) {
        this.name = name;
        this.advisor = null;
    }

    setAdvisor(teacher) {
        this.advisor = teacher;
    }
}

// Both exist independently
const prof = new Teacher("Dr. Smith");
const alice = new Student("Alice");

prof.addStudent(alice);
alice.setAdvisor(prof);

// If alice is removed, prof still exists (and vice versa)
```

Key characteristics:
- Both objects can exist independently
- Either side can hold a reference to the other
- Deleting one doesn't affect the other

---

## Aggregation ("Has — Shared")

A special form of association where one class **contains** others, but the contained objects can exist independently.

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Employee {
public:
    string name;
    Employee(string name) : name(name) {}
};

class Department {
    string name;
    vector<Employee*> employees;  // Department HAS employees (not owned)

public:
    Department(string name) : name(name) {}
    void addEmployee(Employee* e) { employees.push_back(e); }
};

int main() {
    // Employees exist independently of the Department
    Employee alice("Alice");
    Employee bob("Bob");

    Department engineering("Engineering");
    engineering.addEmployee(&alice);
    engineering.addEmployee(&bob);

    // If the department is dissolved, employees still exist
}
```

```csharp
using System;
using System.Collections.Generic;

class Employee {
    public string Name;
    public Employee(string name) { Name = name; }
}

class Department {
    public string Name;
    private List<Employee> employees = new();  // Department HAS employees (not owned)

    public Department(string name) { Name = name; }
    public void AddEmployee(Employee e) { employees.Add(e); }
}

// Employees exist independently of the Department
Employee alice = new Employee("Alice");
Employee bob = new Employee("Bob");

Department engineering = new Department("Engineering");
engineering.AddEmployee(alice);
engineering.AddEmployee(bob);

// If the department is dissolved, employees still exist
```

```java
class Employee {
    String name;

    Employee(String name) {
        this.name = name;
    }
}

class Department {
    String name;
    List<Employee> employees;  // Department HAS employees

    Department(String name) {
        this.name = name;
        this.employees = new ArrayList<>();
    }

    void addEmployee(Employee e) {
        employees.add(e);
    }
}

// Employees exist independently of the Department
Employee alice = new Employee("Alice");
Employee bob = new Employee("Bob");

Department engineering = new Department("Engineering");
engineering.addEmployee(alice);
engineering.addEmployee(bob);

// If the department is dissolved, employees still exist
// An employee can belong to multiple departments
```

```python
class Employee:
    def __init__(self, name):
        self.name = name

class Department:
    def __init__(self, name):
        self.name = name
        self.employees = []  # Department HAS employees (not owned)

    def add_employee(self, employee):
        self.employees.append(employee)

# Employees exist independently of the Department
alice = Employee("Alice")
bob = Employee("Bob")

engineering = Department("Engineering")
engineering.add_employee(alice)
engineering.add_employee(bob)

# If the department is dissolved, employees still exist
```

```javascript
class Employee {
    constructor(name) {
        this.name = name;
    }
}

class Department {
    constructor(name) {
        this.name = name;
        this.employees = [];  // Department HAS employees (not owned)
    }

    addEmployee(employee) {
        this.employees.push(employee);
    }
}

// Employees exist independently of the Department
const alice = new Employee("Alice");
const bob = new Employee("Bob");

const engineering = new Department("Engineering");
engineering.addEmployee(alice);
engineering.addEmployee(bob);

// If the department is dissolved, employees still exist
```

Think of it as a **"has, but doesn't own"** relationship.

---

## Composition ("Has — Owned")

The strongest "has-a" relationship. The contained object **cannot exist without** the container. When the container is destroyed, its parts are destroyed too.

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Room {
public:
    string name;
    double area;

    Room(string name, double area) : name(name), area(area) {}
};

class House {
    string address;
    vector<Room> rooms;  // House OWNS its rooms

public:
    House(string address) : address(address) {
        // Rooms are created BY the house — they can't exist without it
        rooms.push_back(Room("Living Room", 30));
        rooms.push_back(Room("Kitchen", 15));
        rooms.push_back(Room("Bedroom", 20));
    }
};

int main() {
    House h("123 Main St");
    // If h goes out of scope, its rooms are destroyed too
}
```

```csharp
using System;
using System.Collections.Generic;

class Room {
    public string Name;
    public double Area;

    public Room(string name, double area) {
        Name = name;
        Area = area;
    }
}

class House {
    private string address;
    private List<Room> rooms;  // House OWNS its rooms

    public House(string address) {
        this.address = address;
        // Rooms are created BY the house — they can't exist without it
        rooms = new List<Room> {
            new Room("Living Room", 30),
            new Room("Kitchen", 15),
            new Room("Bedroom", 20)
        };
    }
}

House h = new House("123 Main St");
// If h is garbage collected, its rooms go with it
```

```java
class Room {
    String name;
    double area;

    Room(String name, double area) {
        this.name = name;
        this.area = area;
    }
}

class House {
    String address;
    List<Room> rooms;  // House OWNS its rooms

    House(String address) {
        this.address = address;
        this.rooms = new ArrayList<>();
        // Rooms are created BY the house — they can't exist without it
        rooms.add(new Room("Living Room", 30));
        rooms.add(new Room("Kitchen", 15));
        rooms.add(new Room("Bedroom", 20));
    }
}

// Rooms are created inside the House
// If the House is demolished, the Rooms are destroyed too
House h = new House("123 Main St");
```

```python
class Room:
    def __init__(self, name, area):
        self.name = name
        self.area = area

class House:
    def __init__(self, address):
        self.address = address
        # Rooms are created and owned by the House
        self.rooms = [
            Room("Living Room", 30),
            Room("Kitchen", 15),
            Room("Bedroom", 20),
        ]

h = House("123 Main St")
# If h is deleted, its rooms are also deleted
```

```javascript
class Room {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}

class House {
    constructor(address) {
        this.address = address;
        // Rooms are created and owned by the House
        this.rooms = [
            new Room("Living Room", 30),
            new Room("Kitchen", 15),
            new Room("Bedroom", 20),
        ];
    }
}

const h = new House("123 Main St");
// If h is garbage collected, its rooms go with it
```

---

## Aggregation vs Composition

| Feature | Aggregation | Composition |
|---------|------------|-------------|
| Ownership | No — shared | Yes — exclusive |
| Lifetime | Independent | Dependent on container |
| Can exist alone? | Yes | No |
| Created by | External code | The container itself |
| Example | Team → Players | Body → Heart |

```
Aggregation:  Department ◇── Employee   (hollow diamond — not owned)
Composition:  House      ◆── Room       (filled diamond — owned)
```

---

## Practical Example — Computer System

```cpp
#include <iostream>
#include <string>
using namespace std;

// Composition — created and owned by Computer
class CPU {
public:
    string model;
    double speed;

    CPU(string model, double speed) : model(model), speed(speed) {}
    string describe() { return model + " @ " + to_string(speed) + " GHz"; }
};

class RAM {
public:
    int sizeGB;
    RAM(int sizeGB) : sizeGB(sizeGB) {}
};

// Aggregation — Monitor exists independently
class Monitor {
public:
    string brand;
    int sizeInches;

    Monitor(string brand, int size) : brand(brand), sizeInches(size) {}
};

class Computer {
    CPU cpu;            // Composition — owned
    RAM ram;            // Composition — owned
    Monitor* monitor;   // Aggregation — not owned

public:
    Computer(string cpuModel, double cpuSpeed, int ramGB)
        : cpu(cpuModel, cpuSpeed), ram(ramGB), monitor(nullptr) {}

    void connectMonitor(Monitor* m) { monitor = m; }

    void describe() {
        cout << "CPU: " << cpu.describe() << endl;
        cout << "RAM: " << ram.sizeGB << " GB" << endl;
        if (monitor) {
            cout << "Monitor: " << monitor->brand
                 << " " << monitor->sizeInches << "\"" << endl;
        }
    }
};

int main() {
    Monitor dellMonitor("Dell", 27);
    Computer pc("Intel i7", 3.6, 16);
    pc.connectMonitor(&dellMonitor);
    pc.describe();
}
```

```csharp
using System;

// Composition — created and owned by Computer
class CPU {
    public string Model;
    public double Speed;

    public CPU(string model, double speed) {
        Model = model;
        Speed = speed;
    }

    public string Describe() => $"{Model} @ {Speed} GHz";
}

class RAM {
    public int SizeGB;
    public RAM(int sizeGB) { SizeGB = sizeGB; }
}

// Aggregation — Monitor exists independently
class Monitor {
    public string Brand;
    public int SizeInches;

    public Monitor(string brand, int size) {
        Brand = brand;
        SizeInches = size;
    }
}

class Computer {
    private CPU cpu;          // Composition — owned
    private RAM ram;          // Composition — owned
    private Monitor? monitor; // Aggregation — not owned

    public Computer(string cpuModel, double cpuSpeed, int ramGB) {
        cpu = new CPU(cpuModel, cpuSpeed);
        ram = new RAM(ramGB);
    }

    public void ConnectMonitor(Monitor m) { monitor = m; }

    public void Describe() {
        Console.WriteLine($"CPU: {cpu.Describe()}");
        Console.WriteLine($"RAM: {ram.SizeGB} GB");
        if (monitor != null) {
            Console.WriteLine($"Monitor: {monitor.Brand} {monitor.SizeInches}\"");
        }
    }
}

Monitor dellMonitor = new Monitor("Dell", 27);
Computer pc = new Computer("Intel i7", 3.6, 16);
pc.ConnectMonitor(dellMonitor);
pc.Describe();
```

```java
// Composition — created and owned by Computer
class CPU {
    String model;
    double speed;

    CPU(String model, double speed) {
        this.model = model;
        this.speed = speed;
    }

    String describe() {
        return model + " @ " + speed + " GHz";
    }
}

class RAM {
    int sizeGB;
    RAM(int sizeGB) { this.sizeGB = sizeGB; }
}

// Aggregation — Monitor exists independently
class Monitor {
    String brand;
    int sizeInches;

    Monitor(String brand, int size) {
        this.brand = brand;
        this.sizeInches = size;
    }
}

class Computer {
    private CPU cpu;          // Composition — owned
    private RAM ram;          // Composition — owned
    private Monitor monitor;  // Aggregation — not owned

    Computer(String cpuModel, double cpuSpeed, int ramGB) {
        this.cpu = new CPU(cpuModel, cpuSpeed);
        this.ram = new RAM(ramGB);
    }

    void connectMonitor(Monitor m) { this.monitor = m; }

    void describe() {
        System.out.println("CPU: " + cpu.describe());
        System.out.println("RAM: " + ram.sizeGB + " GB");
        if (monitor != null) {
            System.out.println("Monitor: " + monitor.brand
                + " " + monitor.sizeInches + "\"");
        }
    }
}

Monitor dellMonitor = new Monitor("Dell", 27);
Computer pc = new Computer("Intel i7", 3.6, 16);
pc.connectMonitor(dellMonitor);
pc.describe();
```

```python
class CPU:
    def __init__(self, model, speed):
        self.model = model
        self.speed = speed

    def describe(self):
        return f"{self.model} @ {self.speed} GHz"

class RAM:
    def __init__(self, size_gb):
        self.size_gb = size_gb

class Monitor:
    def __init__(self, brand, size_inches):
        self.brand = brand
        self.size_inches = size_inches

class Computer:
    def __init__(self, cpu_model, cpu_speed, ram_gb):
        self.cpu = CPU(cpu_model, cpu_speed)    # Composition — owned
        self.ram = RAM(ram_gb)                   # Composition — owned
        self.monitor = None                      # Aggregation — not owned

    def connect_monitor(self, monitor):
        self.monitor = monitor

    def describe(self):
        print(f"CPU: {self.cpu.describe()}")
        print(f"RAM: {self.ram.size_gb} GB")
        if self.monitor:
            print(f"Monitor: {self.monitor.brand} {self.monitor.size_inches}\"")

dell_monitor = Monitor("Dell", 27)
pc = Computer("Intel i7", 3.6, 16)
pc.connect_monitor(dell_monitor)
pc.describe()
```

```javascript
class CPU {
    constructor(model, speed) {
        this.model = model;
        this.speed = speed;
    }

    describe() {
        return `${this.model} @ ${this.speed} GHz`;
    }
}

class RAM {
    constructor(sizeGB) {
        this.sizeGB = sizeGB;
    }
}

class Monitor {
    constructor(brand, sizeInches) {
        this.brand = brand;
        this.sizeInches = sizeInches;
    }
}

class Computer {
    constructor(cpuModel, cpuSpeed, ramGB) {
        this.cpu = new CPU(cpuModel, cpuSpeed);  // Composition — owned
        this.ram = new RAM(ramGB);                // Composition — owned
        this.monitor = null;                      // Aggregation — not owned
    }

    connectMonitor(monitor) {
        this.monitor = monitor;
    }

    describe() {
        console.log(`CPU: ${this.cpu.describe()}`);
        console.log(`RAM: ${this.ram.sizeGB} GB`);
        if (this.monitor) {
            console.log(`Monitor: ${this.monitor.brand} ${this.monitor.sizeInches}"`);
        }
    }
}

const dellMonitor = new Monitor("Dell", 27);
const pc = new Computer("Intel i7", 3.6, 16);
pc.connectMonitor(dellMonitor);
pc.describe();
```

---

## Summary Table

| Relationship | Arrow | Strength | Lifetime | Example |
|-------------|-------|----------|----------|---------|
| Dependency | `- - →` | Weakest | Moment | Printer uses Document |
| Association | `───→` | Weak | Independent | Teacher ↔ Student |
| Aggregation | `◇───→` | Medium | Independent | Department ◇── Employee |
| Composition | `◆───→` | Strong | Dependent | House ◆── Room |
| Inheritance | `───▷` | Strong | Permanent | Dog ───▷ Animal |

---

## Friend Classes and Functions (C++)

The `friend` keyword in C++ grants a function or class access to another class's **private** and **protected** members. Use sparingly — it breaks encapsulation by design.

```cpp
#include <iostream>
using namespace std;

class Wallet {
    double balance = 0;

    // Grant access to a specific function
    friend void audit(const Wallet& w);

    // Grant access to an entire class
    friend class Bank;

public:
    Wallet(double b) : balance(b) {}
};

// Friend function — can access Wallet's private members
void audit(const Wallet& w) {
    cout << "Balance: $" << w.balance << endl;
}

// Friend class — all its methods can access Wallet's privates
class Bank {
public:
    void deposit(Wallet& w, double amount) {
        w.balance += amount;  // Direct access to private member
    }
};

int main() {
    Wallet w(100);
    audit(w);             // Balance: $100

    Bank bank;
    bank.deposit(w, 50);
    audit(w);             // Balance: $150
}
```

**Guidelines**: prefer public interfaces over `friend`. Use `friend` only when two classes are tightly coupled by design (e.g., iterators accessing container internals, or operator overloads that need private access).

---

## Key Takeaways

- **Dependency**: temporary usage (method parameter)
- **Association**: two classes know each other (bidirectional or unidirectional)
- **Aggregation**: "has" but doesn't own — parts can exist alone
- **Composition**: "has and owns" — parts can't exist without the whole
- Choose the **weakest relationship** that still meets your needs
- Understanding relationships helps you draw UML diagrams and design clean systems

Next: **Static Members** — class-level attributes and methods.
