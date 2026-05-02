---
title: "Stacks"
---

# Stacks

A **stack** is a linear data structure that follows the **LIFO** (Last In, First Out) principle — the last element added is the first one removed.

---

## Real-World Analogies

```
Stack of Plates:        Browser Back Button:     Undo in Text Editor:
┌─────────┐            ┌─────────────┐          ┌──────────────┐
│ Plate 5  │ ← top     │ Current Page │ ← top    │ Last Action   │ ← top
│ Plate 4  │            │ Page 3       │          │ Action 4      │
│ Plate 3  │            │ Page 2       │          │ Action 3      │
│ Plate 2  │            │ Page 1       │          │ Action 2      │
│ Plate 1  │            │ Home         │          │ Action 1      │
└─────────┘            └─────────────┘          └──────────────┘

You can only add/remove     Press "Back" to pop      Press Ctrl+Z to undo
from the TOP.               the top page.            the most recent action.
```

---

## Stack Operations

| Operation | Description | Time Complexity |
|-----------|-------------|-----------------|
| `push(x)` | Add element `x` to the top | O(1) |
| `pop()` | Remove and return the top element | O(1) |
| `peek()` / `top()` | Return the top element without removing | O(1) |
| `isEmpty()` | Check if the stack is empty | O(1) |
| `size()` | Return the number of elements | O(1) |

```
push(10)    push(20)    push(30)    pop()       peek()
                                    returns 30  returns 20
┌────┐      ┌────┐      ┌────┐     ┌────┐      ┌────┐
│    │      │    │      │ 30 │←top │    │      │    │
│    │      │ 20 │←top  │ 20 │     │ 20 │←top  │ 20 │←top
│ 10 │←top  │ 10 │      │ 10 │     │ 10 │      │ 10 │
└────┘      └────┘      └────┘     └────┘      └────┘
```

---

## Implementation Using an Array

We use an array and a variable `top` that tracks the index of the topmost element.

```cpp
#include <iostream>
#include <stdexcept>
using namespace std;

class Stack {
private:
    int* arr;
    int topIndex;
    int capacity;

public:
    Stack(int cap = 1000) : capacity(cap), topIndex(-1) {
        arr = new int[capacity];
    }

    ~Stack() { delete[] arr; }

    void push(int val) {
        if (topIndex == capacity - 1) {
            throw overflow_error("Stack overflow");
        }
        arr[++topIndex] = val;
    }

    int pop() {
        if (isEmpty()) {
            throw underflow_error("Stack underflow");
        }
        return arr[topIndex--];
    }

    int peek() const {
        if (isEmpty()) {
            throw underflow_error("Stack is empty");
        }
        return arr[topIndex];
    }

    bool isEmpty() const { return topIndex == -1; }
    int size() const { return topIndex + 1; }
};

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);

    cout << s.peek() << endl;   // 30
    cout << s.pop() << endl;    // 30
    cout << s.pop() << endl;    // 20
    cout << s.isEmpty() << endl; // 0 (false)
    cout << s.size() << endl;   // 1
    return 0;
}
```

```java
public class Stack {
    private int[] arr;
    private int topIndex;
    private int capacity;

    public Stack(int capacity) {
        this.capacity = capacity;
        this.arr = new int[capacity];
        this.topIndex = -1;
    }

    public Stack() { this(1000); }

    public void push(int val) {
        if (topIndex == capacity - 1) {
            throw new RuntimeException("Stack overflow");
        }
        arr[++topIndex] = val;
    }

    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack underflow");
        }
        return arr[topIndex--];
    }

    public int peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return arr[topIndex];
    }

    public boolean isEmpty() { return topIndex == -1; }
    public int size() { return topIndex + 1; }

    public static void main(String[] args) {
        Stack s = new Stack();
        s.push(10);
        s.push(20);
        s.push(30);

        System.out.println(s.peek());    // 30
        System.out.println(s.pop());     // 30
        System.out.println(s.pop());     // 20
        System.out.println(s.isEmpty()); // false
        System.out.println(s.size());    // 1
    }
}
```

```python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack underflow")
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)


s = Stack()
s.push(10)
s.push(20)
s.push(30)

print(s.peek())      # 30
print(s.pop())       # 30
print(s.pop())       # 20
print(s.is_empty())  # False
print(s.size())      # 1
```

```javascript
class Stack {
  constructor() {
    this.items = [];
  }

  push(val) {
    this.items.push(val);
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack underflow");
    }
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

const s = new Stack();
s.push(10);
s.push(20);
s.push(30);

console.log(s.peek());    // 30
console.log(s.pop());     // 30
console.log(s.pop());     // 20
console.log(s.isEmpty()); // false
console.log(s.size());    // 1
```

---

## Built-in Stack Classes

Most languages provide a built-in stack or a data structure that can be used as one:

```cpp
#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);

    cout << s.top() << endl;  // 30
    s.pop();                  // removes 30
    cout << s.size() << endl; // 2
    cout << s.empty() << endl; // 0 (false)
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class BuiltInStack {
    public static void main(String[] args) {
        // Prefer ArrayDeque over legacy Stack class
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);

        System.out.println(stack.peek()); // 30
        stack.pop();                      // removes 30
        System.out.println(stack.size()); // 2
        System.out.println(stack.isEmpty()); // false
    }
}
```

```python
# Python lists work perfectly as stacks
stack = []
stack.append(10)  # push
stack.append(20)
stack.append(30)

print(stack[-1])  # peek → 30
stack.pop()       # removes and returns 30
print(len(stack)) # 2
print(not stack)  # False (not empty)

# For thread-safe stacks, use queue.LifoQueue
from queue import LifoQueue
safe_stack = LifoQueue()
safe_stack.put(10)
print(safe_stack.get())  # 10
```

```javascript
// JavaScript arrays are natural stacks
const stack = [];
stack.push(10);  // push
stack.push(20);
stack.push(30);

console.log(stack[stack.length - 1]); // peek → 30
stack.pop();                           // removes 30
console.log(stack.length);             // 2
```

---

## Example: Balanced Parentheses

A classic stack problem — check if every opening bracket has a matching closing bracket in the correct order.

```
Input: "{[()]}"  → true
Input: "{[(])}"  → false (mismatched order)
Input: "((("     → false (unclosed)

How it works:
  char: {   [   (   )       ]       }
stack: {   {[  {[(  {[      {       (empty)
                    pop (   pop [   pop {
                    matches matches matches → true!
```

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(const string& s) {
    stack<char> st;

    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;

            char top = st.top();
            if ((c == ')' && top == '(') ||
                (c == ']' && top == '[') ||
                (c == '}' && top == '{')) {
                st.pop();
            } else {
                return false;
            }
        }
    }

    return st.empty();
}

int main() {
    cout << isBalanced("{[()]}") << endl;  // 1 (true)
    cout << isBalanced("{[(])}") << endl;  // 0 (false)
    cout << isBalanced("(((") << endl;     // 0 (false)
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class BalancedParentheses {
    public static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;

                char top = stack.pop();
                if ((c == ')' && top != '(') ||
                    (c == ']' && top != '[') ||
                    (c == '}' && top != '{')) {
                    return false;
                }
            }
        }

        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("{[()]}")); // true
        System.out.println(isBalanced("{[(])}")); // false
        System.out.println(isBalanced("((("));    // false
    }
}
```

```python
def is_balanced(s):
    stack = []
    matching = {')': '(', ']': '[', '}': '{'}

    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in ')]}':
            if not stack or stack[-1] != matching[c]:
                return False
            stack.pop()

    return len(stack) == 0


print(is_balanced("{[()]}"))  # True
print(is_balanced("{[(])}"))  # False
print(is_balanced("((("))     # False
```

```javascript
function isBalanced(s) {
  const stack = [];
  const matching = { ")": "(", "]": "[", "}": "{" };

  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else if (c === ")" || c === "]" || c === "}") {
      if (stack.length === 0 || stack[stack.length - 1] !== matching[c]) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.length === 0;
}

console.log(isBalanced("{[()]}")); // true
console.log(isBalanced("{[(])}")); // false
console.log(isBalanced("((("));    // false
```

---

## Applications of Stacks

| Application | How the Stack is Used |
|-------------|----------------------|
| **Undo/Redo** | Each action is pushed; undo pops the last action |
| **Function Call Stack** | Each function call is pushed; return pops it |
| **Expression Evaluation** | Operators and operands are managed with stacks |
| **Backtracking** | DFS, maze solving — push choices, pop to backtrack |
| **Browser History** | Back button pops from history stack |
| **Syntax Parsing** | Compilers use stacks to match brackets and tokens |

### The Function Call Stack

When your program calls a function, the system uses a stack internally:

```
main() calls foo()
  foo() calls bar()
    bar() calls baz()

Call Stack:
┌────────┐
│  baz() │ ← currently executing
│  bar() │
│  foo() │
│  main()│
└────────┘

When baz() returns → popped off
When bar() returns → popped off
... and so on back to main()
```

This is why infinite recursion causes a **stack overflow** — the call stack runs out of space!

---

## Time & Space Complexity

| Operation | Array-based | Linked-list-based |
|-----------|-------------|-------------------|
| push | O(1) amortized | O(1) |
| pop | O(1) | O(1) |
| peek | O(1) | O(1) |
| isEmpty | O(1) | O(1) |
| **Space** | O(n) | O(n) |

---

## Key Takeaways

- A stack is **LIFO** — last in, first out.
- Core operations: `push`, `pop`, `peek`, `isEmpty` — all O(1).
- Arrays (or dynamic arrays/lists) are the simplest way to implement a stack.
- Stacks are foundational — they power function calls, expression parsing, undo systems, and countless algorithms.

---

Next: **Stack Problems →**
