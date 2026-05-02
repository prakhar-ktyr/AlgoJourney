---
title: "Tries"
---

# Tries (Prefix Trees)

A **trie** (pronounced "try") is a tree-like data structure used for efficient retrieval of keys in a dataset of strings. Unlike a binary search tree, no node in the trie stores the complete key — instead, its position in the tree defines the key it is associated with.

## Why Tries?

| Operation | Hash Map | Trie |
|-----------|----------|------|
| Search | O(L) avg | O(L) worst |
| Prefix search | O(N) | O(L + K) |
| Autocomplete | O(N) | O(L + K) |
| Sorted traversal | O(N log N) | O(N) |

*L = length of key, K = number of results, N = total keys*

Tries excel when you need **prefix-based** lookups — autocomplete, spell checkers, IP routing tables, and phone directories.

## TrieNode Structure

Each node contains:

1. An array (or hash map) of children — one slot per possible character.
2. A boolean flag indicating whether this node marks the end of a valid word.

```
       (root)
      /   |   \
     a    b    c
    / \        |
   p   n      a
   |   |      |
   p   d      t   ← "cat" ends here
   |
   l
   |
   e   ← "apple" ends here
```

## Core Operations

### Insert

Walk down the trie character by character. If a child for the current character doesn't exist, create it. After processing the last character, mark the node as end-of-word.

### Search

Walk down the trie character by character. If at any point a child is missing, the word doesn't exist. If you reach the end, check the end-of-word flag.

### StartsWith (Prefix Search)

Identical to search, but you don't need to check the end-of-word flag — just reaching the end of the prefix means at least one word with that prefix exists.

### Delete

Recursively walk to the end of the word. On the way back up, remove nodes that are no longer needed (no other children and not end-of-word for another word).

---

## Full Implementation

### C++

```cpp
#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool isEnd = false;
};

class Trie {
private:
    TrieNode* root;

    bool deleteHelper(TrieNode* node, const string& word, int depth) {
        if (!node) return false;

        if (depth == (int)word.size()) {
            if (!node->isEnd) return false;
            node->isEnd = false;
            return node->children.empty();
        }

        char ch = word[depth];
        if (node->children.find(ch) == node->children.end()) return false;

        bool shouldDelete = deleteHelper(node->children[ch], word, depth + 1);

        if (shouldDelete) {
            delete node->children[ch];
            node->children.erase(ch);
            return node->children.empty() && !node->isEnd;
        }
        return false;
    }

public:
    Trie() { root = new TrieNode(); }

    void insert(const string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            if (curr->children.find(ch) == curr->children.end()) {
                curr->children[ch] = new TrieNode();
            }
            curr = curr->children[ch];
        }
        curr->isEnd = true;
    }

    bool search(const string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            if (curr->children.find(ch) == curr->children.end()) return false;
            curr = curr->children[ch];
        }
        return curr->isEnd;
    }

    bool startsWith(const string& prefix) {
        TrieNode* curr = root;
        for (char ch : prefix) {
            if (curr->children.find(ch) == curr->children.end()) return false;
            curr = curr->children[ch];
        }
        return true;
    }

    void remove(const string& word) {
        deleteHelper(root, word, 0);
    }
};

int main() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    trie.insert("application");

    cout << trie.search("apple") << endl;       // 1 (true)
    cout << trie.search("app") << endl;         // 1 (true)
    cout << trie.search("appl") << endl;        // 0 (false)
    cout << trie.startsWith("app") << endl;     // 1 (true)

    trie.remove("apple");
    cout << trie.search("apple") << endl;       // 0 (false)
    cout << trie.search("app") << endl;         // 1 (true)

    return 0;
}
```

### Java

```java
import java.util.HashMap;
import java.util.Map;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEnd = false;
}

public class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode curr = root;
        for (char ch : word.toCharArray()) {
            curr.children.putIfAbsent(ch, new TrieNode());
            curr = curr.children.get(ch);
        }
        curr.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode curr = root;
        for (char ch : word.toCharArray()) {
            if (!curr.children.containsKey(ch)) return false;
            curr = curr.children.get(ch);
        }
        return curr.isEnd;
    }

    public boolean startsWith(String prefix) {
        TrieNode curr = root;
        for (char ch : prefix.toCharArray()) {
            if (!curr.children.containsKey(ch)) return false;
            curr = curr.children.get(ch);
        }
        return true;
    }

    public void delete(String word) {
        deleteHelper(root, word, 0);
    }

    private boolean deleteHelper(TrieNode node, String word, int depth) {
        if (node == null) return false;

        if (depth == word.length()) {
            if (!node.isEnd) return false;
            node.isEnd = false;
            return node.children.isEmpty();
        }

        char ch = word.charAt(depth);
        if (!node.children.containsKey(ch)) return false;

        boolean shouldDelete = deleteHelper(node.children.get(ch), word, depth + 1);

        if (shouldDelete) {
            node.children.remove(ch);
            return node.children.isEmpty() && !node.isEnd;
        }
        return false;
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("apple");
        trie.insert("app");
        trie.insert("application");

        System.out.println(trie.search("apple"));       // true
        System.out.println(trie.search("app"));         // true
        System.out.println(trie.search("appl"));        // false
        System.out.println(trie.startsWith("app"));     // true

        trie.delete("apple");
        System.out.println(trie.search("apple"));       // false
        System.out.println(trie.search("app"));         // true
    }
}
```

### Python

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True

    def search(self, word: str) -> bool:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return curr.is_end

    def starts_with(self, prefix: str) -> bool:
        curr = self.root
        for ch in prefix:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return True

    def delete(self, word: str) -> None:
        self._delete_helper(self.root, word, 0)

    def _delete_helper(self, node: TrieNode, word: str, depth: int) -> bool:
        if node is None:
            return False

        if depth == len(word):
            if not node.is_end:
                return False
            node.is_end = False
            return len(node.children) == 0

        ch = word[depth]
        if ch not in node.children:
            return False

        should_delete = self._delete_helper(node.children[ch], word, depth + 1)

        if should_delete:
            del node.children[ch]
            return len(node.children) == 0 and not node.is_end
        return False


# Usage
trie = Trie()
trie.insert("apple")
trie.insert("app")
trie.insert("application")

print(trie.search("apple"))       # True
print(trie.search("app"))         # True
print(trie.search("appl"))        # False
print(trie.starts_with("app"))    # True

trie.delete("apple")
print(trie.search("apple"))       # False
print(trie.search("app"))         # True
```

### JavaScript

```javascript
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let curr = this.root;
    for (const ch of word) {
      if (!curr.children.has(ch)) {
        curr.children.set(ch, new TrieNode());
      }
      curr = curr.children.get(ch);
    }
    curr.isEnd = true;
  }

  search(word) {
    let curr = this.root;
    for (const ch of word) {
      if (!curr.children.has(ch)) return false;
      curr = curr.children.get(ch);
    }
    return curr.isEnd;
  }

  startsWith(prefix) {
    let curr = this.root;
    for (const ch of prefix) {
      if (!curr.children.has(ch)) return false;
      curr = curr.children.get(ch);
    }
    return true;
  }

  delete(word) {
    this._deleteHelper(this.root, word, 0);
  }

  _deleteHelper(node, word, depth) {
    if (!node) return false;

    if (depth === word.length) {
      if (!node.isEnd) return false;
      node.isEnd = false;
      return node.children.size === 0;
    }

    const ch = word[depth];
    if (!node.children.has(ch)) return false;

    const shouldDelete = this._deleteHelper(node.children.get(ch), word, depth + 1);

    if (shouldDelete) {
      node.children.delete(ch);
      return node.children.size === 0 && !node.isEnd;
    }
    return false;
  }
}

// Usage
const trie = new Trie();
trie.insert("apple");
trie.insert("app");
trie.insert("application");

console.log(trie.search("apple"));       // true
console.log(trie.search("app"));         // true
console.log(trie.search("appl"));        // false
console.log(trie.startsWith("app"));     // true

trie.delete("apple");
console.log(trie.search("apple"));       // false
console.log(trie.search("app"));         // true
```

---

## Time & Space Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Insert | O(L) | O(L) per word |
| Search | O(L) | O(1) |
| StartsWith | O(L) | O(1) |
| Delete | O(L) | O(1) |

*L = length of the word*

Total space for the trie: O(N × L × A) in the worst case, where N = number of words, L = average length, A = alphabet size. In practice, shared prefixes reduce this significantly.

## Applications

1. **Autocomplete** — traverse to the prefix node, then DFS to collect all words below it.
2. **Spell checker** — search with edit-distance tolerance (fuzzy matching).
3. **IP routing** — longest prefix matching in network routers.
4. **Word games** — Boggle solvers, Scrabble dictionaries.
5. **DNA sequence matching** — alphabet of {A, C, G, T}.
6. **Phone directories** — T9 predictive text input.

---

Next: **Union-Find →**
