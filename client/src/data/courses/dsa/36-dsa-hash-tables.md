---
title: Hash Tables
---

# Hash Tables

A **hash table** is one of the most powerful data structures in computer science. It allows you to store key-value pairs and retrieve values in **O(1) average time** — constant time regardless of how much data you have.

---

## What Is Hashing?

Hashing is the process of converting a key (like a string or number) into a fixed-size integer called a **hash code**. This hash code is used as an index into an array where the value is stored.

```
Key "apple" → Hash Function → 42 → Store at index 42
Key "banana" → Hash Function → 17 → Store at index 17
```

Think of it like a library where every book has a specific shelf location computed from its title — you don't search shelf by shelf; you compute exactly where it belongs.

---

## Hash Functions

A **hash function** takes a key and returns an integer index within the bounds of the underlying array.

### Properties of a Good Hash Function

1. **Deterministic** — same input always produces same output
2. **Uniform distribution** — spreads keys evenly across the array
3. **Fast to compute** — O(1) time
4. **Minimizes collisions** — different keys rarely map to the same index

### Simple Hash Function Example

For a string key with a table of size `m`:

```
hash("cat") = ('c' + 'a' + 't') % m
            = (99 + 97 + 116) % 10
            = 312 % 10
            = 2
```

A better approach multiplies by a prime to spread values:

```
hash = 0
for each character c in key:
    hash = hash * 31 + ascii(c)
return hash % table_size
```

---

## Collisions

A **collision** occurs when two different keys produce the same hash index:

```
hash("cat") = 2
hash("act") = 2   ← collision!
```

No matter how good your hash function, collisions are inevitable (pigeonhole principle). We need strategies to handle them.

---

## Collision Handling: Chaining

**Chaining** stores multiple key-value pairs at the same index using a linked list (or another collection).

```
Index 0: → empty
Index 1: → ("dog", 5)
Index 2: → ("cat", 3) → ("act", 7)    ← two items chained
Index 3: → empty
Index 4: → ("bird", 2)
```

**Pros:** Simple, works well with high load factors
**Cons:** Extra memory for pointers, cache-unfriendly

---

## Collision Handling: Open Addressing

**Open addressing** stores all entries directly in the array. When a collision occurs, we probe for the next available slot.

### Linear Probing

If index `i` is occupied, try `i+1`, then `i+2`, etc.

```
Insert "cat" at index 2 → slot 2 is empty → place here
Insert "act" at index 2 → slot 2 is full → try 3 → empty → place here
```

### Quadratic Probing

Try `i+1²`, `i+2²`, `i+3²`, etc. Reduces clustering.

### Double Hashing

Use a second hash function to determine the probe step size.

**Pros:** Better cache performance, no extra memory
**Cons:** Clustering issues, deletion is trickier (need tombstones)

---

## Load Factor

The **load factor** (α) measures how full the hash table is:

```
α = number_of_entries / table_size
```

- **α = 0.5** → table is 50% full (good for open addressing)
- **α = 0.75** → common threshold to trigger resizing
- **α > 1.0** → possible with chaining (multiple items per slot)

When the load factor exceeds a threshold, we **resize** (typically double the array) and **rehash** all existing entries.

---

## Complexity Analysis

| Operation | Average Case | Worst Case |
|-----------|-------------|------------|
| Insert    | O(1)        | O(n)       |
| Search    | O(1)        | O(n)       |
| Delete    | O(1)        | O(n)       |

The worst case O(n) happens when all keys hash to the same index (everything in one chain). With a good hash function and proper load factor management, this is extremely rare in practice.

---

## Implementing a Hash Table from Scratch

### C++

```cpp
#include <iostream>
#include <list>
#include <vector>
#include <string>
using namespace std;

class HashTable {
private:
    int size;
    vector<list<pair<string, int>>> table;

    int hashFunction(const string& key) {
        unsigned long hash = 0;
        for (char c : key) {
            hash = hash * 31 + c;
        }
        return hash % size;
    }

public:
    HashTable(int s = 10) : size(s), table(s) {}

    void insert(const string& key, int value) {
        int index = hashFunction(key);
        // Update if key exists
        for (auto& pair : table[index]) {
            if (pair.first == key) {
                pair.second = value;
                return;
            }
        }
        // Otherwise add new entry
        table[index].push_back({key, value});
    }

    int search(const string& key) {
        int index = hashFunction(key);
        for (auto& pair : table[index]) {
            if (pair.first == key) {
                return pair.second;
            }
        }
        return -1; // Not found
    }

    void remove(const string& key) {
        int index = hashFunction(key);
        table[index].remove_if([&key](const pair<string, int>& p) {
            return p.first == key;
        });
    }

    void display() {
        for (int i = 0; i < size; i++) {
            cout << "Index " << i << ": ";
            for (auto& pair : table[i]) {
                cout << "(" << pair.first << ", " << pair.second << ") ";
            }
            cout << endl;
        }
    }
};

int main() {
    HashTable ht(7);

    ht.insert("apple", 5);
    ht.insert("banana", 8);
    ht.insert("cherry", 3);
    ht.insert("date", 12);
    ht.insert("apple", 10); // Update existing key

    cout << "Search 'apple': " << ht.search("apple") << endl;   // 10
    cout << "Search 'banana': " << ht.search("banana") << endl; // 8
    cout << "Search 'fig': " << ht.search("fig") << endl;       // -1

    ht.remove("banana");
    cout << "After removing 'banana': " << ht.search("banana") << endl; // -1

    cout << "\nHash Table Contents:" << endl;
    ht.display();

    return 0;
}
```

### Java

```java
import java.util.LinkedList;

public class HashTable {
    private int size;
    private LinkedList<Entry>[] table;

    private static class Entry {
        String key;
        int value;

        Entry(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    @SuppressWarnings("unchecked")
    public HashTable(int size) {
        this.size = size;
        this.table = new LinkedList[size];
        for (int i = 0; i < size; i++) {
            table[i] = new LinkedList<>();
        }
    }

    private int hashFunction(String key) {
        long hash = 0;
        for (char c : key.toCharArray()) {
            hash = hash * 31 + c;
        }
        return (int) (Math.abs(hash) % size);
    }

    public void insert(String key, int value) {
        int index = hashFunction(key);
        for (Entry entry : table[index]) {
            if (entry.key.equals(key)) {
                entry.value = value; // Update existing
                return;
            }
        }
        table[index].add(new Entry(key, value));
    }

    public int search(String key) {
        int index = hashFunction(key);
        for (Entry entry : table[index]) {
            if (entry.key.equals(key)) {
                return entry.value;
            }
        }
        return -1; // Not found
    }

    public void remove(String key) {
        int index = hashFunction(key);
        table[index].removeIf(entry -> entry.key.equals(key));
    }

    public void display() {
        for (int i = 0; i < size; i++) {
            System.out.print("Index " + i + ": ");
            for (Entry entry : table[i]) {
                System.out.print("(" + entry.key + ", " + entry.value + ") ");
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        HashTable ht = new HashTable(7);

        ht.insert("apple", 5);
        ht.insert("banana", 8);
        ht.insert("cherry", 3);
        ht.insert("date", 12);
        ht.insert("apple", 10); // Update

        System.out.println("Search 'apple': " + ht.search("apple"));   // 10
        System.out.println("Search 'banana': " + ht.search("banana")); // 8
        System.out.println("Search 'fig': " + ht.search("fig"));       // -1

        ht.remove("banana");
        System.out.println("After removing 'banana': " + ht.search("banana")); // -1

        System.out.println("\nHash Table Contents:");
        ht.display();
    }
}
```

### Python

```python
class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        hash_value = 0
        for char in str(key):
            hash_value = hash_value * 31 + ord(char)
        return hash_value % self.size

    def insert(self, key, value):
        index = self._hash(key)
        # Update if key exists
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                self.table[index][i] = (key, value)
                return
        # Otherwise add new entry
        self.table[index].append((key, value))

    def search(self, key):
        index = self._hash(key)
        for k, v in self.table[index]:
            if k == key:
                return v
        return None  # Not found

    def remove(self, key):
        index = self._hash(key)
        self.table[index] = [(k, v) for k, v in self.table[index] if k != key]

    def display(self):
        for i, bucket in enumerate(self.table):
            print(f"Index {i}: {bucket}")


# Usage
ht = HashTable(7)

ht.insert("apple", 5)
ht.insert("banana", 8)
ht.insert("cherry", 3)
ht.insert("date", 12)
ht.insert("apple", 10)  # Update existing key

print(f"Search 'apple': {ht.search('apple')}")    # 10
print(f"Search 'banana': {ht.search('banana')}")  # 8
print(f"Search 'fig': {ht.search('fig')}")        # None

ht.remove("banana")
print(f"After removing 'banana': {ht.search('banana')}")  # None

print("\nHash Table Contents:")
ht.display()
```

### JavaScript

```javascript
class HashTable {
  constructor(size = 10) {
    this.size = size;
    this.table = Array.from({ length: size }, () => []);
  }

  _hash(key) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = hash * 31 + str.charCodeAt(i);
    }
    return Math.abs(hash) % this.size;
  }

  insert(key, value) {
    const index = this._hash(key);
    const bucket = this.table[index];
    // Update if key exists
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value;
        return;
      }
    }
    // Otherwise add new entry
    bucket.push([key, value]);
  }

  search(key) {
    const index = this._hash(key);
    const bucket = this.table[index];
    for (const [k, v] of bucket) {
      if (k === key) return v;
    }
    return undefined; // Not found
  }

  remove(key) {
    const index = this._hash(key);
    this.table[index] = this.table[index].filter(([k]) => k !== key);
  }

  display() {
    for (let i = 0; i < this.size; i++) {
      console.log(`Index ${i}:`, this.table[i]);
    }
  }
}

// Usage
const ht = new HashTable(7);

ht.insert("apple", 5);
ht.insert("banana", 8);
ht.insert("cherry", 3);
ht.insert("date", 12);
ht.insert("apple", 10); // Update existing key

console.log("Search 'apple':", ht.search("apple"));   // 10
console.log("Search 'banana':", ht.search("banana")); // 8
console.log("Search 'fig':", ht.search("fig"));       // undefined

ht.remove("banana");
console.log("After removing 'banana':", ht.search("banana")); // undefined

console.log("\nHash Table Contents:");
ht.display();
```

---

## How Resizing Works

When the load factor exceeds the threshold (commonly 0.75):

1. Create a new array of double the size
2. Recompute hash for every existing key (using new size)
3. Insert each key-value pair into the new array

```
Before resize (size=4, 3 items, α=0.75):
[0]: ("cat", 3)
[1]: empty
[2]: ("dog", 5) → ("bird", 2)
[3]: empty

After resize (size=8, same 3 items, rehashed):
[0]: empty
[1]: ("bird", 2)
[2]: empty
[3]: ("cat", 3)
[4]: empty
[5]: empty
[6]: ("dog", 5)
[7]: empty
```

Resizing is O(n) but happens infrequently — the amortized cost per insert remains O(1).

---

## Key Takeaways

- Hash tables map keys to array indices via a hash function
- Collisions are handled by chaining (linked lists) or open addressing (probing)
- Average-case O(1) for insert, search, and delete
- Load factor determines when to resize
- The underlying array + hash function combo gives us fast lookups
- Hash tables are the foundation for dictionaries, sets, caches, and more

---

Next: **Hash Maps & Hash Sets →**
