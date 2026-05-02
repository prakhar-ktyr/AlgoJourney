---
title: Hash Maps & Hash Sets
---

# Hash Maps & Hash Sets

Now that you understand how hash tables work internally, let's explore the **built-in hash-based containers** that every major language provides. These are production-ready, optimized, and the ones you'll use daily.

---

## Hash Map vs Hash Set

| Feature | Hash Map | Hash Set |
|---------|----------|----------|
| Stores | Key-value pairs | Keys only (unique values) |
| Purpose | Associate data with keys | Track membership / uniqueness |
| Duplicates | Duplicate keys not allowed (values can repeat) | No duplicates allowed |
| Lookup | "What value is associated with this key?" | "Is this element in the set?" |

Both provide **O(1) average** time for insert, lookup, and delete.

---

## Built-in Hash Maps by Language

| Language | Hash Map | Ordered Alternative |
|----------|----------|-------------------|
| C++ | `unordered_map` | `map` (red-black tree) |
| Java | `HashMap` | `TreeMap` |
| Python | `dict` | — (insertion-ordered since 3.7) |
| JavaScript | `Map` (also plain `{}`) | — |

---

## Hash Map Operations

### C++ — `unordered_map`

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    unordered_map<string, int> scores;

    // INSERT
    scores["Alice"] = 95;
    scores["Bob"] = 87;
    scores.insert({"Charlie", 92});
    scores.emplace("Diana", 88);

    // LOOKUP
    cout << "Alice's score: " << scores["Alice"] << endl;  // 95

    // Check if key exists
    if (scores.find("Bob") != scores.end()) {
        cout << "Bob found with score: " << scores["Bob"] << endl;
    }

    // count() returns 0 or 1
    if (scores.count("Eve") == 0) {
        cout << "Eve not found" << endl;
    }

    // UPDATE
    scores["Alice"] = 98;  // Overwrite existing value

    // DELETE
    scores.erase("Charlie");

    // ITERATE
    cout << "\nAll scores:" << endl;
    for (const auto& [name, score] : scores) {
        cout << name << ": " << score << endl;
    }

    // SIZE
    cout << "\nTotal entries: " << scores.size() << endl;

    // CLEAR
    scores.clear();
    cout << "After clear, size: " << scores.size() << endl;

    return 0;
}
```

### Java — `HashMap`

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapDemo {
    public static void main(String[] args) {
        HashMap<String, Integer> scores = new HashMap<>();

        // INSERT
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);
        scores.put("Diana", 88);

        // LOOKUP
        System.out.println("Alice's score: " + scores.get("Alice"));  // 95

        // Check if key exists
        if (scores.containsKey("Bob")) {
            System.out.println("Bob found with score: " + scores.get("Bob"));
        }

        // getOrDefault — safe lookup with fallback
        int eveScore = scores.getOrDefault("Eve", -1);
        System.out.println("Eve's score: " + eveScore);  // -1

        // UPDATE
        scores.put("Alice", 98);  // Overwrite

        // DELETE
        scores.remove("Charlie");

        // ITERATE
        System.out.println("\nAll scores:");
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // Iterate keys only
        for (String name : scores.keySet()) {
            System.out.println("Key: " + name);
        }

        // Iterate values only
        for (int score : scores.values()) {
            System.out.println("Value: " + score);
        }

        // SIZE
        System.out.println("\nTotal entries: " + scores.size());

        // CLEAR
        scores.clear();
        System.out.println("After clear, size: " + scores.size());
    }
}
```

### Python — `dict`

```python
# Python's dict is a hash map (insertion-ordered since 3.7)

scores = {}

# INSERT
scores["Alice"] = 95
scores["Bob"] = 87
scores["Charlie"] = 92
scores["Diana"] = 88

# LOOKUP
print(f"Alice's score: {scores['Alice']}")  # 95

# Check if key exists
if "Bob" in scores:
    print(f"Bob found with score: {scores['Bob']}")

# get() — safe lookup with default
eve_score = scores.get("Eve", -1)
print(f"Eve's score: {eve_score}")  # -1

# UPDATE
scores["Alice"] = 98  # Overwrite

# DELETE
del scores["Charlie"]
# Or use pop() which returns the value
removed = scores.pop("Diana", None)  # Returns 88

# ITERATE
print("\nAll scores:")
for name, score in scores.items():
    print(f"{name}: {score}")

# Iterate keys only
for name in scores:
    print(f"Key: {name}")

# Iterate values only
for score in scores.values():
    print(f"Value: {score}")

# SIZE
print(f"\nTotal entries: {len(scores)}")

# CLEAR
scores.clear()
print(f"After clear, size: {len(scores)}")

# Dict comprehension — create from iterable
squares = {x: x**2 for x in range(6)}
print(squares)  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
```

### JavaScript — `Map`

```javascript
const scores = new Map();

// INSERT
scores.set("Alice", 95);
scores.set("Bob", 87);
scores.set("Charlie", 92);
scores.set("Diana", 88);

// LOOKUP
console.log("Alice's score:", scores.get("Alice")); // 95

// Check if key exists
if (scores.has("Bob")) {
  console.log("Bob found with score:", scores.get("Bob"));
}

// get() returns undefined if not found
console.log("Eve's score:", scores.get("Eve")); // undefined

// UPDATE
scores.set("Alice", 98); // Overwrite

// DELETE
scores.delete("Charlie");

// ITERATE (Map preserves insertion order)
console.log("\nAll scores:");
for (const [name, score] of scores) {
  console.log(`${name}: ${score}`);
}

// Iterate keys only
for (const name of scores.keys()) {
  console.log("Key:", name);
}

// Iterate values only
for (const score of scores.values()) {
  console.log("Value:", score);
}

// forEach
scores.forEach((value, key) => {
  console.log(`${key} => ${value}`);
});

// SIZE
console.log("\nTotal entries:", scores.size);

// CLEAR
scores.clear();
console.log("After clear, size:", scores.size);
```

---

## Built-in Hash Sets by Language

| Language | Hash Set | Ordered Alternative |
|----------|----------|-------------------|
| C++ | `unordered_set` | `set` (red-black tree) |
| Java | `HashSet` | `TreeSet` |
| Python | `set` | — |
| JavaScript | `Set` | — |

---

## Hash Set Operations

### C++ — `unordered_set`

```cpp
#include <iostream>
#include <unordered_set>
#include <string>
using namespace std;

int main() {
    unordered_set<string> fruits;

    // INSERT
    fruits.insert("apple");
    fruits.insert("banana");
    fruits.insert("cherry");
    fruits.insert("apple");  // Duplicate — ignored

    // LOOKUP (membership check)
    if (fruits.count("banana")) {
        cout << "banana is in the set" << endl;
    }

    if (fruits.find("grape") == fruits.end()) {
        cout << "grape is NOT in the set" << endl;
    }

    // DELETE
    fruits.erase("cherry");

    // ITERATE
    cout << "\nFruits in set:" << endl;
    for (const auto& fruit : fruits) {
        cout << fruit << endl;
    }

    // SIZE
    cout << "Size: " << fruits.size() << endl;

    // Initialize from list
    unordered_set<int> numbers = {1, 2, 3, 4, 5, 5, 5};
    cout << "Numbers size: " << numbers.size() << endl;  // 5 (no duplicates)

    return 0;
}
```

### Java — `HashSet`

```java
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;

public class HashSetDemo {
    public static void main(String[] args) {
        HashSet<String> fruits = new HashSet<>();

        // INSERT
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("cherry");
        boolean added = fruits.add("apple");  // Returns false — duplicate
        System.out.println("Apple added again? " + added);  // false

        // LOOKUP
        if (fruits.contains("banana")) {
            System.out.println("banana is in the set");
        }

        // DELETE
        fruits.remove("cherry");

        // ITERATE
        System.out.println("\nFruits in set:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }

        // SIZE
        System.out.println("Size: " + fruits.size());

        // Initialize from collection
        Set<Integer> numbers = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5, 5, 5));
        System.out.println("Numbers size: " + numbers.size());  // 5

        // Set operations
        Set<Integer> setA = new HashSet<>(Arrays.asList(1, 2, 3, 4));
        Set<Integer> setB = new HashSet<>(Arrays.asList(3, 4, 5, 6));

        // Union
        Set<Integer> union = new HashSet<>(setA);
        union.addAll(setB);
        System.out.println("Union: " + union);  // [1, 2, 3, 4, 5, 6]

        // Intersection
        Set<Integer> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);
        System.out.println("Intersection: " + intersection);  // [3, 4]

        // Difference
        Set<Integer> difference = new HashSet<>(setA);
        difference.removeAll(setB);
        System.out.println("Difference: " + difference);  // [1, 2]
    }
}
```

### Python — `set`

```python
fruits = set()

# INSERT
fruits.add("apple")
fruits.add("banana")
fruits.add("cherry")
fruits.add("apple")  # Duplicate — ignored

# LOOKUP
if "banana" in fruits:
    print("banana is in the set")

if "grape" not in fruits:
    print("grape is NOT in the set")

# DELETE
fruits.remove("cherry")     # Raises KeyError if not found
fruits.discard("grape")     # Safe — no error if not found

# ITERATE
print("\nFruits in set:")
for fruit in fruits:
    print(fruit)

# SIZE
print(f"Size: {len(fruits)}")

# Initialize from list (removes duplicates)
numbers = {1, 2, 3, 4, 5, 5, 5}
print(f"Numbers size: {len(numbers)}")  # 5

# Set operations
set_a = {1, 2, 3, 4}
set_b = {3, 4, 5, 6}

print(f"Union: {set_a | set_b}")              # {1, 2, 3, 4, 5, 6}
print(f"Intersection: {set_a & set_b}")       # {3, 4}
print(f"Difference: {set_a - set_b}")         # {1, 2}
print(f"Symmetric diff: {set_a ^ set_b}")     # {1, 2, 5, 6}

# Set comprehension
evens = {x for x in range(10) if x % 2 == 0}
print(f"Evens: {evens}")  # {0, 2, 4, 6, 8}

# Subset / superset
print({1, 2}.issubset({1, 2, 3}))    # True
print({1, 2, 3}.issuperset({1, 2}))  # True
```

### JavaScript — `Set`

```javascript
const fruits = new Set();

// INSERT
fruits.add("apple");
fruits.add("banana");
fruits.add("cherry");
fruits.add("apple"); // Duplicate — ignored

// LOOKUP
if (fruits.has("banana")) {
  console.log("banana is in the set");
}

// DELETE
fruits.delete("cherry");

// ITERATE (preserves insertion order)
console.log("\nFruits in set:");
for (const fruit of fruits) {
  console.log(fruit);
}

// SIZE
console.log("Size:", fruits.size);

// Initialize from array (removes duplicates)
const numbers = new Set([1, 2, 3, 4, 5, 5, 5]);
console.log("Numbers size:", numbers.size); // 5

// Convert Set to Array
const arr = [...numbers];
console.log("As array:", arr);

// Remove duplicates from array (common pattern)
const withDups = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(withDups)];
console.log("Unique:", unique); // [1, 2, 3, 4]

// Set operations (manual in JS)
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...setA, ...setB]);
console.log("Union:", [...union]); // [1, 2, 3, 4, 5, 6]

// Intersection
const intersection = new Set([...setA].filter((x) => setB.has(x)));
console.log("Intersection:", [...intersection]); // [3, 4]

// Difference
const difference = new Set([...setA].filter((x) => !setB.has(x)));
console.log("Difference:", [...difference]); // [1, 2]
```

---

## When to Use Map vs Set

### Use a Hash Map when:

- You need to associate values with keys (dictionary, lookup table)
- Counting frequencies of elements
- Caching computed results (memoization)
- Mapping IDs to objects

### Use a Hash Set when:

- You only need to check if something exists
- You need to remove duplicates
- You need fast membership testing
- Tracking visited nodes in graph traversal

---

## Frequency Counting Pattern

One of the most common hash map patterns — counting occurrences:

### C++

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    string text = "hello world hello cpp hello";
    unordered_map<string, int> freq;

    // Split and count (simplified)
    string word;
    for (char c : text + ' ') {
        if (c == ' ') {
            if (!word.empty()) {
                freq[word]++;
                word.clear();
            }
        } else {
            word += c;
        }
    }

    for (const auto& [w, count] : freq) {
        cout << w << ": " << count << endl;
    }
    // hello: 3, world: 1, cpp: 1
    return 0;
}
```

### Java

```java
import java.util.HashMap;

public class FrequencyCount {
    public static void main(String[] args) {
        String text = "hello world hello java hello";
        HashMap<String, Integer> freq = new HashMap<>();

        for (String word : text.split(" ")) {
            freq.put(word, freq.getOrDefault(word, 0) + 1);
        }

        freq.forEach((word, count) ->
            System.out.println(word + ": " + count)
        );
        // hello: 3, world: 1, java: 1
    }
}
```

### Python

```python
from collections import Counter

text = "hello world hello python hello"

# Method 1: Manual counting
freq = {}
for word in text.split():
    freq[word] = freq.get(word, 0) + 1

print(freq)  # {'hello': 3, 'world': 1, 'python': 1}

# Method 2: Counter (built-in, preferred)
freq = Counter(text.split())
print(freq)  # Counter({'hello': 3, 'world': 1, 'python': 1})
print(freq.most_common(2))  # [('hello', 3), ('world', 1)]
```

### JavaScript

```javascript
const text = "hello world hello javascript hello";

const freq = {};
for (const word of text.split(" ")) {
  freq[word] = (freq[word] || 0) + 1;
}

console.log(freq); // { hello: 3, world: 1, javascript: 1 }

// Using Map
const freqMap = new Map();
for (const word of text.split(" ")) {
  freqMap.set(word, (freqMap.get(word) || 0) + 1);
}

for (const [word, count] of freqMap) {
  console.log(`${word}: ${count}`);
}
```

---

## Checking Membership Pattern

Quickly determine if elements from one collection exist in another:

### Python (example — applicable pattern in all langs)

```python
# Are all characters in 'word' contained in 'allowed'?
allowed = set("abcdefghij")
word = "badge"

if set(word).issubset(allowed):
    print(f"'{word}' uses only allowed characters")

# Find common elements between two lists
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]

common = set(list1) & set(list2)
print(f"Common elements: {common}")  # {4, 5}

# Check for duplicates in a list
items = [1, 2, 3, 2, 4]
has_duplicates = len(items) != len(set(items))
print(f"Has duplicates: {has_duplicates}")  # True
```

---

## Map vs Object in JavaScript

JavaScript has both plain objects `{}` and `Map`. When should you use which?

| Feature | Plain Object `{}` | `Map` |
|---------|-------------------|-------|
| Key types | Strings/Symbols only | Any type (objects, functions, etc.) |
| Order | Insertion order (mostly) | Guaranteed insertion order |
| Size | `Object.keys(obj).length` | `map.size` |
| Performance | Good for small, static | Better for frequent add/delete |
| Prototype | Has prototype chain | No prototype pollution |
| Serialization | JSON-friendly | Not directly JSON-serializable |

**Rule of thumb:** Use `Map` when keys are dynamic or non-string; use `{}` for fixed-shape configuration objects.

---

## Key Takeaways

- Every language has optimized hash map and hash set implementations — use them!
- Hash maps store key-value pairs; hash sets store unique elements
- Both provide O(1) average for insert, lookup, and delete
- Frequency counting and membership testing are the two most common patterns
- Choose map when you need associations, set when you need uniqueness
- Python's `Counter` and JavaScript's spread-into-Set are powerful idioms

---

Next: **Hashing Problems →**
