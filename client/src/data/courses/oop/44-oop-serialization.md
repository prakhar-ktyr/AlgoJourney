---
title: Serialization and Persistence
---

# Serialization and Persistence

**Serialization** converts an object into a format that can be stored or transmitted (bytes, JSON, XML). **Deserialization** reconstructs the object from that format.

---

## Why Serialization?

Objects live in memory. When the program ends, they're gone. Serialization lets you:

- **Save** objects to disk (persistence)
- **Send** objects over a network (APIs, RPCs)
- **Cache** objects in databases or files
- **Clone** objects (serialize → deserialize)

---

## JSON Serialization

The most common format for web applications.

```cpp
#include <iostream>
#include <string>
// Using nlohmann/json library (most popular C++ JSON library)
#include <nlohmann/json.hpp>

using json = nlohmann::json;

class User {
public:
    std::string name;
    int age;
    std::string email;

    User() = default;
    User(std::string name, int age, std::string email)
        : name(std::move(name)), age(age), email(std::move(email)) {}
};

// Serialization functions
void to_json(json& j, const User& u) {
    j = json{{"name", u.name}, {"age", u.age}, {"email", u.email}};
}

void from_json(const json& j, User& u) {
    j.at("name").get_to(u.name);
    j.at("age").get_to(u.age);
    j.at("email").get_to(u.email);
}

int main() {
    // Serialize (object → JSON)
    User user("Alice", 25, "alice@example.com");
    json j = user;
    std::string jsonStr = j.dump();
    std::cout << jsonStr << "\n";
    // {"age":25,"email":"alice@example.com","name":"Alice"}

    // Deserialize (JSON → object)
    User restored = json::parse(jsonStr).get<User>();
    std::cout << restored.name << "\n";  // Alice
    return 0;
}
```

```csharp
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

class User {
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("age")]
    public int Age { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }

    public User() { }
    public User(string name, int age, string email) {
        Name = name;
        Age = age;
        Email = email;
    }
}

// Serialize (object → JSON)
var user = new User("Alice", 25, "alice@example.com");
string json = JsonSerializer.Serialize(user);
Console.WriteLine(json);
// {"name":"Alice","age":25,"email":"alice@example.com"}

// Deserialize (JSON → object)
User restored = JsonSerializer.Deserialize<User>(json);
Console.WriteLine(restored.Name);  // Alice
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;

class User {
    private String name;
    private int age;
    private String email;

    // Constructor, getters, setters needed for Jackson
    User() {}

    User(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }

    String getName() { return name; }
    int getAge() { return age; }
    String getEmail() { return email; }
}

ObjectMapper mapper = new ObjectMapper();

// Serialize (object → JSON)
User user = new User("Alice", 25, "alice@example.com");
String json = mapper.writeValueAsString(user);
System.out.println(json);
// {"name":"Alice","age":25,"email":"alice@example.com"}

// Deserialize (JSON → object)
User restored = mapper.readValue(json, User.class);
System.out.println(restored.getName());  // Alice
```

```python
import json

class User:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

    def to_dict(self):
        return {
            "name": self.name,
            "age": self.age,
            "email": self.email,
        }

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["age"], data["email"])

# Serialize
user = User("Alice", 25, "alice@example.com")
json_str = json.dumps(user.to_dict())
print(json_str)
# {"name": "Alice", "age": 25, "email": "alice@example.com"}

# Deserialize
data = json.loads(json_str)
restored = User.from_dict(data)
print(restored.name)  # Alice
```

```javascript
class User {
  constructor(name, age, email) {
    this.name = name;
    this.age = age;
    this.email = email;
  }

  toJSON() {
    return { name: this.name, age: this.age, email: this.email };
  }

  static fromJSON(data) {
    return new User(data.name, data.age, data.email);
  }
}

// Serialize (object → JSON string)
const user = new User("Alice", 25, "alice@example.com");
const json = JSON.stringify(user);
console.log(json);
// {"name":"Alice","age":25,"email":"alice@example.com"}

// Deserialize (JSON string → object)
const data = JSON.parse(json);
const restored = User.fromJSON(data);
console.log(restored.name);  // Alice
```

---

## Binary / Built-in Serialization

Languages often provide binary serialization for more complex persistence:

```cpp
#include <fstream>
#include <string>

// C++ manual binary serialization (no built-in mechanism)
class Employee {
public:
    std::string name;
    double salary;

    void saveToBinary(const std::string& filename) {
        std::ofstream out(filename, std::ios::binary);
        size_t nameLen = name.size();
        out.write(reinterpret_cast<char*>(&nameLen), sizeof(nameLen));
        out.write(name.data(), nameLen);
        out.write(reinterpret_cast<char*>(&salary), sizeof(salary));
    }

    static Employee loadFromBinary(const std::string& filename) {
        Employee emp;
        std::ifstream in(filename, std::ios::binary);
        size_t nameLen;
        in.read(reinterpret_cast<char*>(&nameLen), sizeof(nameLen));
        emp.name.resize(nameLen);
        in.read(emp.name.data(), nameLen);
        in.read(reinterpret_cast<char*>(&emp.salary), sizeof(emp.salary));
        return emp;
    }
};

int main() {
    Employee emp{"Alice", 75000};
    emp.saveToBinary("employee.bin");

    Employee restored = Employee::loadFromBinary("employee.bin");
    // restored.name == "Alice", restored.salary == 75000
    return 0;
}
```

```csharp
using System;
using System.IO;
using System.Text.Json;

class Employee {
    public string Name { get; set; }
    public double Salary { get; set; }

    [JsonIgnore]  // NOT serialized (sensitive data)
    public string Password { get; set; }

    public Employee() { }
    public Employee(string name, double salary, string password) {
        Name = name;
        Salary = salary;
        Password = password;
    }

    public void SaveToFile(string path) =>
        File.WriteAllText(path, JsonSerializer.Serialize(this));

    public static Employee LoadFromFile(string path) =>
        JsonSerializer.Deserialize<Employee>(File.ReadAllText(path));
}

// Serialize to file
var emp = new Employee("Alice", 75000, "secret123");
emp.SaveToFile("employee.json");

// Deserialize from file
var restored = Employee.LoadFromFile("employee.json");
Console.WriteLine(restored.Name);      // Alice
Console.WriteLine(restored.Salary);    // 75000
Console.WriteLine(restored.Password);  // null (JsonIgnore)
```

```java
import java.io.*;

class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    String name;
    double salary;
    transient String password;  // NOT serialized (sensitive data)

    Employee(String name, double salary, String password) {
        this.name = name;
        this.salary = salary;
        this.password = password;
    }
}

// Serialize to file
Employee emp = new Employee("Alice", 75000, "secret123");
try (ObjectOutputStream out = new ObjectOutputStream(
        new FileOutputStream("employee.ser"))) {
    out.writeObject(emp);
}

// Deserialize from file
try (ObjectInputStream in = new ObjectInputStream(
        new FileInputStream("employee.ser"))) {
    Employee restored = (Employee) in.readObject();
    System.out.println(restored.name);      // Alice
    System.out.println(restored.salary);    // 75000.0
    System.out.println(restored.password);  // null (transient)
}
```

```python
import pickle

class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

emp = Employee("Alice", 75000)

# Serialize
with open("employee.pkl", "wb") as f:
    pickle.dump(emp, f)

# Deserialize
with open("employee.pkl", "rb") as f:
    restored = pickle.load(f)
    print(restored.name)    # Alice
    print(restored.salary)  # 75000

# WARNING: Never unpickle data from untrusted sources — it can execute arbitrary code
```

```javascript
// JavaScript has no built-in binary serialization for objects
// Use JSON for persistence, or structured clone for deep copy

class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }

  // Save to localStorage (browser) or file (Node.js)
  save(key) {
    const data = JSON.stringify(this);
    localStorage.setItem(key, data);
  }

  static load(key) {
    const data = JSON.parse(localStorage.getItem(key));
    return new Employee(data.name, data.salary);
  }
}

// Node.js file persistence
const fs = require("fs");
const emp = new Employee("Alice", 75000);
fs.writeFileSync("employee.json", JSON.stringify(emp));

const raw = JSON.parse(fs.readFileSync("employee.json", "utf-8"));
const restored = new Employee(raw.name, raw.salary);
```

---

## Handling Nested Objects

```cpp
#include <nlohmann/json.hpp>
using json = nlohmann::json;

class Address {
public:
    std::string street, city, country;
};

class Person {
public:
    std::string name;
    Address address;
};

void to_json(json& j, const Address& a) {
    j = json{{"street", a.street}, {"city", a.city}, {"country", a.country}};
}
void from_json(const json& j, Address& a) {
    j.at("street").get_to(a.street);
    j.at("city").get_to(a.city);
    j.at("country").get_to(a.country);
}
void to_json(json& j, const Person& p) {
    j = json{{"name", p.name}, {"address", p.address}};
}
void from_json(const json& j, Person& p) {
    j.at("name").get_to(p.name);
    j.at("address").get_to(p.address);
}

// Nested serialization works automatically
Person person{"Alice", {"123 Main St", "NYC", "USA"}};
std::string jsonStr = json(person).dump(2);
Person restored = json::parse(jsonStr).get<Person>();
```

```csharp
using System;
using System.Text.Json;

class Address {
    public string Street { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
}

class Person {
    public string Name { get; set; }
    public Address Address { get; set; }
}

// Nested serialization works automatically with System.Text.Json
var person = new Person {
    Name = "Alice",
    Address = new Address { Street = "123 Main St", City = "NYC", Country = "USA" }
};

var options = new JsonSerializerOptions { WriteIndented = true };
string jsonStr = JsonSerializer.Serialize(person, options);
Console.WriteLine(jsonStr);
// {
//   "Name": "Alice",
//   "Address": { "Street": "123 Main St", "City": "NYC", "Country": "USA" }
// }

Person restored = JsonSerializer.Deserialize<Person>(jsonStr);
Console.WriteLine(restored.Address.City);  // NYC
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;

class Address {
    String street, city, country;
    Address() {}
    Address(String street, String city, String country) {
        this.street = street; this.city = city; this.country = country;
    }
}

class Person {
    String name;
    Address address;
    Person() {}
    Person(String name, Address address) {
        this.name = name; this.address = address;
    }
}

ObjectMapper mapper = new ObjectMapper();
Person person = new Person("Alice", new Address("123 Main St", "NYC", "USA"));
String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(person);
// {"name":"Alice","address":{"street":"123 Main St","city":"NYC","country":"USA"}}

Person restored = mapper.readValue(json, Person.class);
System.out.println(restored.address.city);  // NYC
```

```python
import json

class Address:
    def __init__(self, street, city, country):
        self.street = street
        self.city = city
        self.country = country

    def to_dict(self):
        return {"street": self.street, "city": self.city,
                "country": self.country}

    @classmethod
    def from_dict(cls, data):
        return cls(data["street"], data["city"], data["country"])

class Person:
    def __init__(self, name, address):
        self.name = name
        self.address = address

    def to_dict(self):
        return {
            "name": self.name,
            "address": self.address.to_dict(),  # Nested serialization
        }

    @classmethod
    def from_dict(cls, data):
        address = Address.from_dict(data["address"])
        return cls(data["name"], address)

person = Person("Alice", Address("123 Main St", "NYC", "USA"))
json_str = json.dumps(person.to_dict(), indent=2)
print(json_str)
# {
#   "name": "Alice",
#   "address": {
#     "street": "123 Main St",
#     "city": "NYC",
#     "country": "USA"
#   }
# }

restored = Person.from_dict(json.loads(json_str))
print(restored.address.city)  # NYC
```

```javascript
class Address {
  constructor(street, city, country) {
    this.street = street;
    this.city = city;
    this.country = country;
  }
}

class Person {
  constructor(name, address) {
    this.name = name;
    this.address = address;
  }

  toJSON() {
    return {
      name: this.name,
      address: { ...this.address }, // Nested serialization
    };
  }

  static fromJSON(data) {
    const address = new Address(data.address.street, data.address.city, data.address.country);
    return new Person(data.name, address);
  }
}

const person = new Person("Alice", new Address("123 Main St", "NYC", "USA"));
const jsonStr = JSON.stringify(person, null, 2);
console.log(jsonStr);
// {
//   "name": "Alice",
//   "address": { "street": "123 Main St", "city": "NYC", "country": "USA" }
// }

const restored = Person.fromJSON(JSON.parse(jsonStr));
console.log(restored.address.city);  // NYC
```

---

## Serialization (C#)

C# has `System.Text.Json` (built-in) with powerful attributes and customization:

```csharp
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

class Product {
    [JsonPropertyName("product_name")]
    public string Name { get; set; }

    [JsonPropertyName("price_usd")]
    public decimal Price { get; set; }

    [JsonIgnore]
    public string InternalCode { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Category Category { get; set; }
}

enum Category { Electronics, Books, Clothing }

// Custom serialization options
var options = new JsonSerializerOptions {
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
};

var product = new Product {
    Name = "Laptop",
    Price = 999.99m,
    InternalCode = "LP-001",
    Category = Category.Electronics
};

string json = JsonSerializer.Serialize(product, options);
Console.WriteLine(json);
// {
//   "product_name": "Laptop",
//   "price_usd": 999.99,
//   "category": "Electronics"
// }
// Note: InternalCode is excluded via [JsonIgnore]
```

---

## Serializable Interface (Java)

Java's built-in serialization uses the `Serializable` marker interface, `serialVersionUID` for version control, and `transient` to exclude fields:

```java
import java.io.*;

class UserSession implements Serializable {
    private static final long serialVersionUID = 2L; // version control

    private String username;
    private long loginTime;
    transient private String authToken; // excluded from serialization

    UserSession(String username, String authToken) {
        this.username = username;
        this.loginTime = System.currentTimeMillis();
        this.authToken = authToken;
    }

    @Override
    public String toString() {
        return username + " (token=" + authToken + ")";
    }
}

// Serialize
UserSession session = new UserSession("alice", "secret-jwt-token");
try (ObjectOutputStream out = new ObjectOutputStream(
        new FileOutputStream("session.ser"))) {
    out.writeObject(session);
}

// Deserialize
try (ObjectInputStream in = new ObjectInputStream(
        new FileInputStream("session.ser"))) {
    UserSession restored = (UserSession) in.readObject();
    System.out.println(restored); // alice (token=null) — transient field lost
}
```

---

## Key Takeaways

- **Serialization** converts objects to a storable/transmittable format
- **JSON** is the standard for web APIs
- C++: Use libraries like `nlohmann/json`; manual binary serialization for performance
- C#: `System.Text.Json` with `[JsonPropertyName]`, `[JsonIgnore]`, `JsonSerializer`
- Java: `Serializable` interface, `transient` for skipping fields, Jackson for JSON
- Python: `json` for text, `pickle` for binary (never unpickle untrusted data)
- JavaScript: `JSON.stringify()`/`JSON.parse()` built-in
- Handle **nested objects** by recursively serializing
- **ORMs** automate object-to-database serialization

Next: **Testing OOP Code** — unit testing classes and mocking dependencies.
