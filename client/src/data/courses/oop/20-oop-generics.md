---
title: Generics and Templates
---

# Generics and Templates

**Generics** (Java) and **templates** (C++) let you write classes and methods that work with **any data type** while maintaining type safety. They are one of the most powerful features in modern OOP.

---

## The Problem Without Generics

Imagine a Box class that can hold any item:

```cpp
// Without templates — uses void* (loses type safety)
class Box {
    void* item;
public:
    void put(void* item) { this->item = item; }
    void* get() { return item; }
};

int main() {
    int x = 42;
    Box box;
    box.put(&x);
    int* val = static_cast<int*>(box.get());  // Must cast — ugly and risky!
}
```

```csharp
// Without generics — uses object (loses type safety)
class Box {
    private object item;

    public void Put(object item) {
        this.item = item;
    }

    public object Get() {
        return item;
    }
}

Box box = new Box();
box.Put("Hello");
string s = (string)box.Get();  // Must cast — ugly and risky!

box.Put(42);
string s2 = (string)box.Get();  // ❌ Runtime error: InvalidCastException!
```

```java
// Without generics — uses Object (loses type safety)
class Box {
    private Object item;

    void put(Object item) {
        this.item = item;
    }

    Object get() {
        return item;
    }
}

Box box = new Box();
box.put("Hello");
String s = (String) box.get();  // Must cast — ugly and risky!

box.put(42);
String s2 = (String) box.get();  // ❌ Runtime error: ClassCastException!
```

```python
# Python is dynamically typed — no generics needed at runtime
# But without type hints, you lose IDE support and documentation
class Box:
    def __init__(self):
        self.item = None

    def put(self, item):
        self.item = item

    def get(self):
        return self.item

box = Box()
box.put("Hello")
box.put(42)  # No type checking — anything goes
```

```javascript
// JavaScript is dynamically typed — no generics at runtime
class Box {
    #item;

    put(item) {
        this.#item = item;
    }

    get() {
        return this.#item;
    }
}

const box = new Box();
box.put("Hello");
box.put(42);  // No type checking — anything goes
```

Problems:
- You need to **cast** every time you get an item (C++/Java)
- The compiler can't catch type errors — they crash at runtime
- No way to enforce that a box only holds strings

---

## Generics/Templates to the Rescue

```cpp
// With templates — type-safe!
template <typename T>
class Box {
    T item;
public:
    void put(T item) { this->item = item; }
    T get() { return item; }
};

int main() {
    Box<std::string> stringBox;
    stringBox.put("Hello");
    std::string s = stringBox.get();  // ✅ No cast needed!
    // stringBox.put(42);             // ❌ Compile error — type safety!

    Box<int> intBox;
    intBox.put(42);
    int n = intBox.get();             // ✅ No cast needed!
}
```

```csharp
// With generics — type-safe!
class Box<T> {
    private T item;

    public void Put(T item) {
        this.item = item;
    }

    public T Get() {
        return item;
    }
}

Box<string> stringBox = new Box<string>();
stringBox.Put("Hello");
string s = stringBox.Get();    // ✅ No cast needed!
// stringBox.Put(42);          // ❌ Compile error — type safety!

Box<int> intBox = new Box<int>();
intBox.Put(42);
int n = intBox.Get();          // ✅ No cast needed!
```

```java
// With generics — type-safe!
class Box<T> {
    private T item;

    void put(T item) {
        this.item = item;
    }

    T get() {
        return item;
    }
}

Box<String> stringBox = new Box<>();
stringBox.put("Hello");
String s = stringBox.get();    // ✅ No cast needed!
// stringBox.put(42);          // ❌ Compile error — type safety!

Box<Integer> intBox = new Box<>();
intBox.put(42);
int n = intBox.get();          // ✅ No cast needed!
```

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Box(Generic[T]):
    def __init__(self):
        self._item: T | None = None

    def put(self, item: T) -> None:
        self._item = item

    def get(self) -> T:
        return self._item

# Type hints for documentation and IDE support
box: Box[str] = Box()
box.put("Hello")
value: str = box.get()
# Type checkers (mypy) will flag: box.put(42) as an error
```

```javascript
// JavaScript has no native generics — use JSDoc for type documentation
/**
 * @template T
 */
class Box {
    /** @type {T|undefined} */
    #item;

    /** @param {T} item */
    put(item) {
        this.#item = item;
    }

    /** @returns {T} */
    get() {
        return this.#item;
    }
}

/** @type {Box<string>} */
const stringBox = new Box();
stringBox.put("Hello");
const s = stringBox.get();
```

`T` is a **type parameter** — a placeholder for the actual type, which is specified when creating the object.

---

## Type Parameter Naming Conventions

| Parameter | Convention |
|-----------|-----------|
| `T` | Type (general purpose) |
| `E` | Element (collections) |
| `K` | Key (maps) |
| `V` | Value (maps) |
| `N` | Number |
| `S`, `U` | Additional types |

---

## Generic Classes

### A Generic Pair

```cpp
#include <iostream>
#include <string>
using namespace std;

template <typename A, typename B>
class Pair {
    A first;
    B second;
public:
    Pair(A first, B second) : first(first), second(second) {}

    A getFirst() { return first; }
    B getSecond() { return second; }

    friend ostream& operator<<(ostream& os, const Pair& p) {
        return os << "(" << p.first << ", " << p.second << ")";
    }
};

int main() {
    Pair<string, int> nameAge("Alice", 25);
    cout << nameAge.getFirst() << endl;   // Alice
    cout << nameAge.getSecond() << endl;  // 25

    Pair<double, double> point(3.5, 7.2);
    cout << point << endl;  // (3.5, 7.2)
}
```

```csharp
using System;

class Pair<A, B> {
    public A First { get; }
    public B Second { get; }

    public Pair(A first, B second) {
        First = first;
        Second = second;
    }

    public override string ToString() {
        return $"({First}, {Second})";
    }
}

Pair<string, int> nameAge = new Pair<string, int>("Alice", 25);
Console.WriteLine(nameAge.First);   // Alice
Console.WriteLine(nameAge.Second);  // 25

Pair<double, double> point = new Pair<double, double>(3.5, 7.2);
Console.WriteLine(point);  // (3.5, 7.2)
```

```java
class Pair<A, B> {
    private A first;
    private B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    A getFirst() { return first; }
    B getSecond() { return second; }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}

Pair<String, Integer> nameAge = new Pair<>("Alice", 25);
System.out.println(nameAge.getFirst());   // Alice
System.out.println(nameAge.getSecond());  // 25

Pair<Double, Double> point = new Pair<>(3.5, 7.2);
System.out.println(point);  // (3.5, 7.2)
```

```python
from typing import TypeVar, Generic

A = TypeVar('A')
B = TypeVar('B')

class Pair(Generic[A, B]):
    def __init__(self, first: A, second: B):
        self.first = first
        self.second = second

    def get_first(self) -> A:
        return self.first

    def get_second(self) -> B:
        return self.second

    def __repr__(self):
        return f"({self.first}, {self.second})"

name_age: Pair[str, int] = Pair("Alice", 25)
print(name_age.get_first())   # Alice
print(name_age.get_second())  # 25

point: Pair[float, float] = Pair(3.5, 7.2)
print(point)  # (3.5, 7.2)
```

```javascript
/**
 * @template A, B
 */
class Pair {
    /**
     * @param {A} first
     * @param {B} second
     */
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }

    /** @returns {A} */
    getFirst() { return this.first; }

    /** @returns {B} */
    getSecond() { return this.second; }

    toString() {
        return `(${this.first}, ${this.second})`;
    }
}

const nameAge = new Pair("Alice", 25);
console.log(nameAge.getFirst());   // Alice
console.log(nameAge.getSecond());  // 25

const point = new Pair(3.5, 7.2);
console.log(point.toString());  // (3.5, 7.2)
```

### A Generic Stack

```cpp
#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

template <typename T>
class Stack {
    vector<T> items;
public:
    void push(T item) {
        items.push_back(item);
    }

    T pop() {
        if (items.empty()) throw runtime_error("Stack is empty");
        T top = items.back();
        items.pop_back();
        return top;
    }

    T peek() {
        if (items.empty()) throw runtime_error("Stack is empty");
        return items.back();
    }

    bool isEmpty() { return items.empty(); }
    int size() { return items.size(); }
};

int main() {
    Stack<string> names;
    names.push("Alice");
    names.push("Bob");
    cout << names.pop() << endl;   // Bob
    cout << names.peek() << endl;  // Alice

    Stack<int> numbers;
    numbers.push(10);
    numbers.push(20);
    cout << numbers.pop() << endl;  // 20
}
```

```csharp
using System;
using System.Collections.Generic;

class Stack<T> {
    private List<T> items = new();

    public void Push(T item) {
        items.Add(item);
    }

    public T Pop() {
        if (items.Count == 0)
            throw new InvalidOperationException("Stack is empty");
        T top = items[^1];
        items.RemoveAt(items.Count - 1);
        return top;
    }

    public T Peek() {
        if (items.Count == 0)
            throw new InvalidOperationException("Stack is empty");
        return items[^1];
    }

    public bool IsEmpty => items.Count == 0;
    public int Count => items.Count;
}

Stack<string> names = new();
names.Push("Alice");
names.Push("Bob");
Console.WriteLine(names.Pop());   // Bob
Console.WriteLine(names.Peek());  // Alice

Stack<int> numbers = new();
numbers.Push(10);
numbers.Push(20);
Console.WriteLine(numbers.Pop()); // 20
```

```java
class Stack<T> {
    private List<T> items = new ArrayList<>();

    void push(T item) {
        items.add(item);
    }

    T pop() {
        if (items.isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return items.remove(items.size() - 1);
    }

    T peek() {
        if (items.isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return items.get(items.size() - 1);
    }

    boolean isEmpty() {
        return items.isEmpty();
    }

    int size() {
        return items.size();
    }
}

Stack<String> names = new Stack<>();
names.push("Alice");
names.push("Bob");
System.out.println(names.pop());  // Bob
System.out.println(names.peek()); // Alice

Stack<Integer> numbers = new Stack<>();
numbers.push(10);
numbers.push(20);
```

```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self):
        self._items: List[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise RuntimeError("Stack is empty")
        return self._items.pop()

    def peek(self) -> T:
        if not self._items:
            raise RuntimeError("Stack is empty")
        return self._items[-1]

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def size(self) -> int:
        return len(self._items)

names: Stack[str] = Stack()
names.push("Alice")
names.push("Bob")
print(names.pop())   # Bob
print(names.peek())  # Alice
```

```javascript
class Stack {
    #items = [];

    push(item) {
        this.#items.push(item);
    }

    pop() {
        if (this.#items.length === 0) {
            throw new Error("Stack is empty");
        }
        return this.#items.pop();
    }

    peek() {
        if (this.#items.length === 0) {
            throw new Error("Stack is empty");
        }
        return this.#items[this.#items.length - 1];
    }

    isEmpty() {
        return this.#items.length === 0;
    }

    size() {
        return this.#items.length;
    }
}

const names = new Stack();
names.push("Alice");
names.push("Bob");
console.log(names.pop());   // Bob
console.log(names.peek());  // Alice
```

---

## Generic Methods

You can write generic methods even in non-generic classes:

```cpp
#include <iostream>
#include <string>
using namespace std;

class ArrayUtils {
public:
    template <typename T>
    static void printArray(T arr[], int size) {
        for (int i = 0; i < size; i++) {
            cout << arr[i] << " ";
        }
        cout << endl;
    }

    template <typename T>
    static T getFirst(T arr[], int size) {
        if (size == 0) throw runtime_error("Empty array");
        return arr[0];
    }

    template <typename T>
    static bool contains(T arr[], int size, T target) {
        for (int i = 0; i < size; i++) {
            if (arr[i] == target) return true;
        }
        return false;
    }
};

int main() {
    string names[] = {"Alice", "Bob", "Charlie"};
    int numbers[] = {1, 2, 3, 4, 5};

    ArrayUtils::printArray(names, 3);    // Alice Bob Charlie
    ArrayUtils::printArray(numbers, 5);  // 1 2 3 4 5

    cout << ArrayUtils::getFirst(names, 3) << endl;       // Alice
    cout << ArrayUtils::contains(numbers, 5, 3) << endl;  // 1 (true)
}
```

```csharp
using System;
using System.Linq;

class ArrayUtils {
    public static void PrintArray<T>(T[] array) {
        Console.WriteLine(string.Join(" ", array));
    }

    public static T GetFirst<T>(T[] array) {
        if (array.Length == 0) return default!;
        return array[0];
    }

    public static bool Contains<T>(T[] array, T target) {
        return array.Contains(target);
    }
}

string[] names = { "Alice", "Bob", "Charlie" };
int[] numbers = { 1, 2, 3, 4, 5 };

ArrayUtils.PrintArray(names);    // Alice Bob Charlie
ArrayUtils.PrintArray(numbers);  // 1 2 3 4 5

Console.WriteLine(ArrayUtils.GetFirst(names));       // Alice
Console.WriteLine(ArrayUtils.Contains(numbers, 3)); // True
```

```java
class ArrayUtils {
    // Generic method — <T> before return type
    static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.print(item + " ");
        }
        System.out.println();
    }

    static <T> T getFirst(T[] array) {
        if (array.length == 0) return null;
        return array[0];
    }

    static <T> boolean contains(T[] array, T target) {
        for (T item : array) {
            if (item.equals(target)) return true;
        }
        return false;
    }
}

String[] names = {"Alice", "Bob", "Charlie"};
Integer[] numbers = {1, 2, 3, 4, 5};

ArrayUtils.printArray(names);    // Alice Bob Charlie
ArrayUtils.printArray(numbers);  // 1 2 3 4 5

String first = ArrayUtils.getFirst(names);      // Alice
boolean has3 = ArrayUtils.contains(numbers, 3); // true
```

```python
from typing import TypeVar, List, Optional

T = TypeVar('T')

class ArrayUtils:
    @staticmethod
    def print_array(array: List[T]) -> None:
        print(" ".join(str(item) for item in array))

    @staticmethod
    def get_first(array: List[T]) -> Optional[T]:
        if not array:
            return None
        return array[0]

    @staticmethod
    def contains(array: List[T], target: T) -> bool:
        return target in array

names = ["Alice", "Bob", "Charlie"]
numbers = [1, 2, 3, 4, 5]

ArrayUtils.print_array(names)    # Alice Bob Charlie
ArrayUtils.print_array(numbers)  # 1 2 3 4 5

print(ArrayUtils.get_first(names))       # Alice
print(ArrayUtils.contains(numbers, 3))   # True
```

```javascript
class ArrayUtils {
    static printArray(array) {
        console.log(array.join(" "));
    }

    static getFirst(array) {
        if (array.length === 0) return null;
        return array[0];
    }

    static contains(array, target) {
        return array.includes(target);
    }
}

const names = ["Alice", "Bob", "Charlie"];
const numbers = [1, 2, 3, 4, 5];

ArrayUtils.printArray(names);    // Alice Bob Charlie
ArrayUtils.printArray(numbers);  // 1 2 3 4 5

console.log(ArrayUtils.getFirst(names));       // Alice
console.log(ArrayUtils.contains(numbers, 3));  // true
```

---

## Bounded Type Parameters

You can restrict what types are allowed:

```cpp
#include <iostream>
#include <type_traits>
using namespace std;

// C++ uses concepts (C++20) or SFINAE to constrain templates
template <typename T>
    requires std::is_arithmetic_v<T>
class NumberBox {
    T value;
public:
    NumberBox(T value) : value(value) {}

    double doubleValue() {
        return static_cast<double>(value);
    }
};

int main() {
    NumberBox<int> intBox(42);
    NumberBox<double> dblBox(3.14);
    // NumberBox<string> strBox("hi");  // ❌ Compile error!
}
```

```csharp
using System;

// C# uses where constraints to restrict type parameters
class NumberBox<T> where T : struct, IComparable<T> {
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    public double DoubleValue() {
        return Convert.ToDouble(value);
    }
}

NumberBox<int> intBox = new NumberBox<int>(42);
NumberBox<double> dblBox = new NumberBox<double>(3.14);
// NumberBox<string> strBox = new("hi");  // ❌ Compile error — string is not a struct!
```

```java
// T must be a Number or its subclass (Integer, Double, etc.)
class NumberBox<T extends Number> {
    private T value;

    NumberBox(T value) {
        this.value = value;
    }

    double doubleValue() {
        return value.doubleValue();  // Can call Number methods
    }
}

NumberBox<Integer> intBox = new NumberBox<>(42);
NumberBox<Double> dblBox = new NumberBox<>(3.14);
// NumberBox<String> strBox = new NumberBox<>("hi");  // ❌ Compile error!
```

```python
from typing import TypeVar

# Python uses TypeVar with bound parameter
from numbers import Number

N = TypeVar('N', int, float)  # Restrict to int or float

class NumberBox:
    def __init__(self, value: N):
        self.value = value

    def double_value(self) -> float:
        return float(self.value)

int_box = NumberBox(42)
dbl_box = NumberBox(3.14)
# Type checkers will flag: NumberBox("hi")
```

```javascript
// JavaScript is dynamically typed — enforce at runtime
class NumberBox {
    #value;

    constructor(value) {
        if (typeof value !== "number") {
            throw new TypeError("NumberBox only accepts numbers");
        }
        this.#value = value;
    }

    doubleValue() {
        return Number(this.#value);
    }
}

const intBox = new NumberBox(42);
const dblBox = new NumberBox(3.14);
// new NumberBox("hi");  // ❌ TypeError at runtime!
```

---

## Wildcards (Java)

Wildcards (`?`) provide flexibility when using generic types:

```cpp
// C++ doesn't have wildcards — use templates with constraints
#include <vector>
#include <iostream>
using namespace std;

// Upper-bounded equivalent: accepts any numeric vector
template <typename T>
    requires std::is_arithmetic_v<T>
double sum(const vector<T>& list) {
    double total = 0;
    for (const T& n : list) {
        total += static_cast<double>(n);
    }
    return total;
}

int main() {
    vector<int> ints = {1, 2, 3};
    vector<double> doubles = {1.5, 2.5, 3.5};

    cout << sum(ints) << endl;     // 6
    cout << sum(doubles) << endl;  // 7.5
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

// C# generic constraints with where clause
double Sum<T>(IEnumerable<T> list) where T : IConvertible {
    double total = 0;
    foreach (T n in list) {
        total += n.ToDouble(null);
    }
    return total;
}

List<int> ints = new() { 1, 2, 3 };
List<double> doubles = new() { 1.5, 2.5, 3.5 };

Console.WriteLine(Sum(ints));     // 6
Console.WriteLine(Sum(doubles));  // 7.5
```

```java
// Unbounded wildcard — accepts any type
void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

// Upper-bounded wildcard — Number or subclass
double sum(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) {
        total += n.doubleValue();
    }
    return total;
}

// Lower-bounded wildcard — Integer or superclass
void addIntegers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}

List<Integer> ints = Arrays.asList(1, 2, 3);
List<Double> doubles = Arrays.asList(1.5, 2.5, 3.5);

System.out.println(sum(ints));     // 6.0
System.out.println(sum(doubles));  // 7.5
```

```python
from typing import TypeVar, List
from numbers import Number

# Python uses TypeVar with bound or Union types
T = TypeVar('T', int, float)

def sum_list(items: List[T]) -> float:
    return sum(float(x) for x in items)

ints = [1, 2, 3]
doubles = [1.5, 2.5, 3.5]

print(sum_list(ints))     # 6.0
print(sum_list(doubles))  # 7.5
```

```javascript
// JavaScript — just use regular functions; no type constraints at runtime
function sumList(list) {
    return list.reduce((total, n) => total + n, 0);
}

const ints = [1, 2, 3];
const doubles = [1.5, 2.5, 3.5];

console.log(sumList(ints));     // 6
console.log(sumList(doubles));  // 7.5
```

---

## Practical Example — Generic Repository

```cpp
#include <iostream>
#include <map>
#include <vector>
#include <string>
using namespace std;

template <typename T>
class Repository {
    map<int, T> store;
    int nextId = 1;

public:
    void save(T entity) {
        store[nextId++] = entity;
    }

    T findById(int id) {
        return store[id];
    }

    vector<T> findAll() {
        vector<T> result;
        for (auto& [key, val] : store) {
            result.push_back(val);
        }
        return result;
    }

    void remove(int id) {
        store.erase(id);
    }
};

int main() {
    Repository<string> nameRepo;
    nameRepo.save("Alice");
    nameRepo.save("Bob");

    Repository<int> numberRepo;
    numberRepo.save(42);
    numberRepo.save(100);
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

interface IRepository<T> {
    void Save(T entity);
    T FindById(int id);
    List<T> FindAll();
    void Delete(int id);
}

class InMemoryRepository<T> : IRepository<T> {
    private Dictionary<int, T> store = new();
    private int nextId = 1;

    public void Save(T entity) {
        store[nextId++] = entity;
    }

    public T FindById(int id) {
        return store[id];
    }

    public List<T> FindAll() {
        return store.Values.ToList();
    }

    public void Delete(int id) {
        store.Remove(id);
    }
}

// Same repository works for ANY type
IRepository<string> nameRepo = new InMemoryRepository<string>();
nameRepo.Save("Alice");
nameRepo.Save("Bob");

IRepository<int> numberRepo = new InMemoryRepository<int>();
numberRepo.Save(42);
numberRepo.Save(100);
```

```java
interface Repository<T> {
    void save(T entity);
    T findById(int id);
    List<T> findAll();
    void delete(int id);
}

class InMemoryRepository<T> implements Repository<T> {
    private Map<Integer, T> store = new HashMap<>();
    private int nextId = 1;

    @Override
    public void save(T entity) {
        store.put(nextId++, entity);
    }

    @Override
    public T findById(int id) {
        return store.get(id);
    }

    @Override
    public List<T> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void delete(int id) {
        store.remove(id);
    }
}

// Same repository works for ANY type
Repository<String> nameRepo = new InMemoryRepository<>();
nameRepo.save("Alice");
nameRepo.save("Bob");

Repository<Integer> numberRepo = new InMemoryRepository<>();
numberRepo.save(42);
numberRepo.save(100);
```

```python
from typing import TypeVar, Generic, Dict, List, Optional

T = TypeVar('T')

class Repository(Generic[T]):
    def __init__(self):
        self._store: Dict[int, T] = {}
        self._next_id = 1

    def save(self, entity: T) -> None:
        self._store[self._next_id] = entity
        self._next_id += 1

    def find_by_id(self, id: int) -> Optional[T]:
        return self._store.get(id)

    def find_all(self) -> List[T]:
        return list(self._store.values())

    def delete(self, id: int) -> None:
        self._store.pop(id, None)

# Same repository works for ANY type
name_repo: Repository[str] = Repository()
name_repo.save("Alice")
name_repo.save("Bob")

number_repo: Repository[int] = Repository()
number_repo.save(42)
number_repo.save(100)
```

```javascript
class Repository {
    #store = new Map();
    #nextId = 1;

    save(entity) {
        this.#store.set(this.#nextId++, entity);
    }

    findById(id) {
        return this.#store.get(id);
    }

    findAll() {
        return [...this.#store.values()];
    }

    delete(id) {
        this.#store.delete(id);
    }
}

// Same repository works for any type (dynamically typed)
const nameRepo = new Repository();
nameRepo.save("Alice");
nameRepo.save("Bob");

const numberRepo = new Repository();
numberRepo.save(42);
numberRepo.save(100);
```

---

## Templates (C++)

C++ uses **templates** rather than generics. Unlike Java's type erasure, C++ templates are resolved at **compile time** — the compiler generates a separate copy of the code for each type used (monomorphization). This means zero runtime overhead.

### Function Template

```cpp
#include <iostream>
using namespace std;

template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    cout << maxOf(3, 7) << endl;        // 7 (int version generated)
    cout << maxOf(3.14, 2.71) << endl;  // 3.14 (double version generated)
    cout << maxOf('a', 'z') << endl;    // z (char version generated)
}
```

### Class Template

```cpp
template <typename T, int Capacity>
class FixedStack {
    T data[Capacity];
    int top = -1;
public:
    void push(T item) {
        if (top < Capacity - 1) data[++top] = item;
    }
    T pop() { return data[top--]; }
    bool isEmpty() { return top == -1; }
};

FixedStack<int, 10> intStack;      // Stack of 10 ints
FixedStack<string, 5> strStack;    // Stack of 5 strings
```

### Template Specialization

You can provide a custom implementation for a specific type:

```cpp
template <typename T>
void print(T val) { cout << val << endl; }

// Specialization for bool
template <>
void print<bool>(bool val) { cout << (val ? "true" : "false") << endl; }
```

Because templates are compiled per-type, errors appear at instantiation and can produce verbose compiler messages — but you get full type safety with zero runtime cost.

---

## Key Takeaways

- Generics/templates let you write **type-safe**, **reusable** code
- **C++** uses `template <typename T>` — resolved at compile time (monomorphization)
- **Java** uses `<T>` — type erasure at runtime, checked at compile time
- **C#** uses `<T>` — reified generics (type info preserved at runtime)
- **Python** uses `TypeVar` + `Generic` — advisory type hints, not enforced at runtime
- **JavaScript** has no native generics — use JSDoc `@template` or TypeScript for type safety
- **Bounded types**: restrict allowed types (`T extends Number` in Java, `where T : class` in C#, concepts in C++)
- Generics are checked at **compile time** — errors caught before runtime (C++/Java/C#)
- Common patterns: generic collections, repositories, factories, and utility methods

## Generic Constraints (C#)

C# offers rich generic constraints via the `where` clause:

```csharp
// Reference type constraint
class Cache<T> where T : class { }

// Value type constraint
class Wrapper<T> where T : struct { }

// Constructor constraint — T must have a parameterless constructor
class Factory<T> where T : new() {
    public T Create() => new T();
}

// Interface/base class constraint
class Repository<T> where T : IEntity {
    public void Save(T entity) { /* ... */ }
}

// Multiple constraints combined
class Service<T> where T : class, IComparable<T>, new() { }

// Generic math (C# 11+ / .NET 7+)
T Add<T>(T a, T b) where T : INumber<T> {
    return a + b;
}

Console.WriteLine(Add(3, 5));       // 8
Console.WriteLine(Add(2.5, 3.7));   // 6.2
```

Next: **Object Lifecycle** — creation, usage, and destruction of objects.
