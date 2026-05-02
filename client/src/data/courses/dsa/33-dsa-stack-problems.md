---
title: "Stack Problems"
---

# Stack Problems

Let's apply stacks to solve classic coding interview problems. Each problem demonstrates a different stack technique.

---

## Problem 1: Valid Parentheses

**Given** a string containing only `()[]{}`, determine if the input string is valid.

**Rules:**
- Every open bracket must be closed by the same type.
- Open brackets must be closed in the correct order.
- Every close bracket must have a corresponding open bracket.

```
Input: "()[]{}"  → true
Input: "(]"      → false
Input: "([)]"    → false
Input: "{[]}"    → true
```

### Approach

1. Iterate through the string.
2. If the character is an opening bracket, push it onto the stack.
3. If it's a closing bracket, check if the stack top has the matching opener.
4. At the end, the stack must be empty.

**Time:** O(n) | **Space:** O(n)

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(const string& s) {
    stack<char> st;

    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '[') st.push(']');
        else if (c == '{') st.push('}');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }

    return st.empty();
}

int main() {
    cout << isValid("()[]{}") << endl; // 1
    cout << isValid("(]") << endl;     // 0
    cout << isValid("{[]}") << endl;   // 1
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class ValidParentheses {
    public static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else {
                if (stack.isEmpty() || stack.pop() != c) return false;
            }
        }

        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}")); // true
        System.out.println(isValid("(]"));     // false
        System.out.println(isValid("{[]}"));   // true
    }
}
```

```python
def is_valid(s):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}

    for c in s:
        if c in mapping:
            # Closing bracket
            if not stack or stack[-1] != mapping[c]:
                return False
            stack.pop()
        else:
            # Opening bracket
            stack.append(c)

    return len(stack) == 0


print(is_valid("()[]{}"))  # True
print(is_valid("(]"))      # False
print(is_valid("{[]}"))    # True
```

```javascript
function isValid(s) {
  const stack = [];
  const map = { ")": "(", "]": "[", "}": "{" };

  for (const c of s) {
    if (c in map) {
      if (stack.length === 0 || stack[stack.length - 1] !== map[c]) {
        return false;
      }
      stack.pop();
    } else {
      stack.push(c);
    }
  }

  return stack.length === 0;
}

console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false
console.log(isValid("{[]}"));   // true
```

---

## Problem 2: Evaluate Reverse Polish Notation

**Given** an array of tokens representing an expression in Reverse Polish Notation (postfix), evaluate it.

**Valid operators:** `+`, `-`, `*`, `/` (integer division truncates toward zero).

```
Input: ["2","1","+","3","*"]
Explanation: ((2 + 1) * 3) = 9
Output: 9

Input: ["4","13","5","/","+"]
Explanation: (4 + (13 / 5)) = 4 + 2 = 6
Output: 6
```

### Approach

1. Iterate through tokens.
2. If it's a number, push onto the stack.
3. If it's an operator, pop two operands, apply the operator, push the result.
4. The final value on the stack is the answer.

```
Tokens: ["2", "1", "+", "3", "*"]

Token "2" → push → stack: [2]
Token "1" → push → stack: [2, 1]
Token "+" → pop 1,2 → 2+1=3 → push → stack: [3]
Token "3" → push → stack: [3, 3]
Token "*" → pop 3,3 → 3*3=9 → push → stack: [9]

Result: 9
```

**Time:** O(n) | **Space:** O(n)

```cpp
#include <iostream>
#include <vector>
#include <stack>
#include <string>
using namespace std;

int evalRPN(vector<string>& tokens) {
    stack<int> st;

    for (const string& token : tokens) {
        if (token == "+" || token == "-" || token == "*" || token == "/") {
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();

            if (token == "+") st.push(a + b);
            else if (token == "-") st.push(a - b);
            else if (token == "*") st.push(a * b);
            else st.push(a / b);  // Truncates toward zero in C++
        } else {
            st.push(stoi(token));
        }
    }

    return st.top();
}

int main() {
    vector<string> tokens1 = {"2", "1", "+", "3", "*"};
    vector<string> tokens2 = {"4", "13", "5", "/", "+"};

    cout << evalRPN(tokens1) << endl;  // 9
    cout << evalRPN(tokens2) << endl;  // 6
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class EvalRPN {
    public static int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();

        for (String token : tokens) {
            switch (token) {
                case "+": case "-": case "*": case "/":
                    int b = stack.pop();
                    int a = stack.pop();
                    switch (token) {
                        case "+": stack.push(a + b); break;
                        case "-": stack.push(a - b); break;
                        case "*": stack.push(a * b); break;
                        case "/": stack.push(a / b); break;
                    }
                    break;
                default:
                    stack.push(Integer.parseInt(token));
            }
        }

        return stack.pop();
    }

    public static void main(String[] args) {
        System.out.println(evalRPN(new String[]{"2","1","+","3","*"}));   // 9
        System.out.println(evalRPN(new String[]{"4","13","5","/","+"})); // 6
    }
}
```

```python
def eval_rpn(tokens):
    stack = []

    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()

            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                # int() truncates toward zero (like C++)
                stack.append(int(a / b))
        else:
            stack.append(int(token))

    return stack[0]


print(eval_rpn(["2", "1", "+", "3", "*"]))    # 9
print(eval_rpn(["4", "13", "5", "/", "+"]))   # 6
```

```javascript
function evalRPN(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (["+", "-", "*", "/"].includes(token)) {
      const b = stack.pop();
      const a = stack.pop();

      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(parseInt(token, 10));
    }
  }

  return stack[0];
}

console.log(evalRPN(["2", "1", "+", "3", "*"]));   // 9
console.log(evalRPN(["4", "13", "5", "/", "+"]));  // 6
```

---

## Problem 3: Next Greater Element (Monotonic Stack)

**Given** an array, find the next greater element for each element. The next greater element of an element `x` is the first element to its **right** that is greater than `x`. If none exists, output `-1`.

```
Input:  [4, 5, 2, 25]
Output: [5, 25, 25, -1]

Input:  [13, 7, 6, 12]
Output: [-1, 12, 12, -1]
```

### Approach — Monotonic Stack

We traverse from **right to left**, maintaining a stack of elements in decreasing order:

1. For each element, pop all stack elements that are ≤ current element (they can't be the "next greater" for anything further left).
2. The stack top (if exists) is the next greater element.
3. Push the current element onto the stack.

```
Array: [4, 5, 2, 25]   (process right to left)

i=3: val=25, stack=[]       → NGE=-1, push 25 → stack=[25]
i=2: val=2,  stack=[25]     → NGE=25, push 2  → stack=[25,2]
i=1: val=5,  stack=[25,2]   → pop 2 (2≤5), NGE=25, push 5 → stack=[25,5]
i=0: val=4,  stack=[25,5]   → NGE=5, push 4 → stack=[25,5,4]

Result: [5, 25, 25, -1]
```

**Time:** O(n) — each element is pushed and popped at most once.
**Space:** O(n)

```cpp
#include <iostream>
#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreaterElement(const vector<int>& arr) {
    int n = arr.size();
    vector<int> result(n, -1);
    stack<int> st;  // Stores values (decreasing order)

    for (int i = n - 1; i >= 0; i--) {
        // Pop elements that are not greater than arr[i]
        while (!st.empty() && st.top() <= arr[i]) {
            st.pop();
        }

        if (!st.empty()) {
            result[i] = st.top();
        }

        st.push(arr[i]);
    }

    return result;
}

int main() {
    vector<int> arr = {4, 5, 2, 25};
    vector<int> res = nextGreaterElement(arr);

    for (int x : res) cout << x << " ";  // 5 25 25 -1
    cout << endl;
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class NextGreaterElement {
    public static int[] nextGreaterElement(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() <= arr[i]) {
                stack.pop();
            }

            if (!stack.isEmpty()) {
                result[i] = stack.peek();
            }

            stack.push(arr[i]);
        }

        return result;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 2, 25};
        int[] res = nextGreaterElement(arr);
        System.out.println(Arrays.toString(res)); // [5, 25, 25, -1]
    }
}
```

```python
def next_greater_element(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # Decreasing order (values)

    for i in range(n - 1, -1, -1):
        # Pop elements not greater than arr[i]
        while stack and stack[-1] <= arr[i]:
            stack.pop()

        if stack:
            result[i] = stack[-1]

        stack.append(arr[i])

    return result


print(next_greater_element([4, 5, 2, 25]))   # [5, 25, 25, -1]
print(next_greater_element([13, 7, 6, 12]))  # [-1, 12, 12, -1]
```

```javascript
function nextGreaterElement(arr) {
  const n = arr.length;
  const result = new Array(n).fill(-1);
  const stack = [];

  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && stack[stack.length - 1] <= arr[i]) {
      stack.pop();
    }

    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
    }

    stack.push(arr[i]);
  }

  return result;
}

console.log(nextGreaterElement([4, 5, 2, 25]));  // [5, 25, 25, -1]
console.log(nextGreaterElement([13, 7, 6, 12])); // [-1, 12, 12, -1]
```

---

## Problem 4: Min Stack

**Design** a stack that supports `push`, `pop`, `top`, and retrieving the **minimum element** — all in O(1) time.

### Approach

Maintain **two stacks**:
- `mainStack`: stores all elements normally.
- `minStack`: stores the minimum at each level. When pushing, push the smaller of the new value and the current min.

```
Operations:           mainStack    minStack
push(5)               [5]          [5]
push(3)               [5,3]        [5,3]       ← 3 < 5, push 3
push(7)               [5,3,7]      [5,3,3]     ← 7 > 3, push 3 again
getMin() → 3
pop() → 7            [5,3]        [5,3]
getMin() → 3
pop() → 3            [5]          [5]
getMin() → 5
```

**Time:** O(1) for all operations | **Space:** O(n)

```cpp
#include <iostream>
#include <stack>
using namespace std;

class MinStack {
private:
    stack<int> mainStack;
    stack<int> minStack;

public:
    void push(int val) {
        mainStack.push(val);
        if (minStack.empty() || val <= minStack.top()) {
            minStack.push(val);
        } else {
            minStack.push(minStack.top());
        }
    }

    void pop() {
        mainStack.pop();
        minStack.pop();
    }

    int top() {
        return mainStack.top();
    }

    int getMin() {
        return minStack.top();
    }
};

int main() {
    MinStack ms;
    ms.push(5);
    ms.push(3);
    ms.push(7);

    cout << ms.getMin() << endl;  // 3
    ms.pop();
    cout << ms.getMin() << endl;  // 3
    ms.pop();
    cout << ms.getMin() << endl;  // 5
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class MinStack {
    private Deque<Integer> mainStack = new ArrayDeque<>();
    private Deque<Integer> minStack = new ArrayDeque<>();

    public void push(int val) {
        mainStack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        } else {
            minStack.push(minStack.peek());
        }
    }

    public void pop() {
        mainStack.pop();
        minStack.pop();
    }

    public int top() {
        return mainStack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }

    public static void main(String[] args) {
        MinStack ms = new MinStack();
        ms.push(5);
        ms.push(3);
        ms.push(7);

        System.out.println(ms.getMin()); // 3
        ms.pop();
        System.out.println(ms.getMin()); // 3
        ms.pop();
        System.out.println(ms.getMin()); // 5
    }
}
```

```python
class MinStack:
    def __init__(self):
        self.main_stack = []
        self.min_stack = []

    def push(self, val):
        self.main_stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self):
        self.main_stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.main_stack[-1]

    def get_min(self):
        return self.min_stack[-1]


ms = MinStack()
ms.push(5)
ms.push(3)
ms.push(7)

print(ms.get_min())  # 3
ms.pop()
print(ms.get_min())  # 3
ms.pop()
print(ms.get_min())  # 5
```

```javascript
class MinStack {
  constructor() {
    this.mainStack = [];
    this.minStack = [];
  }

  push(val) {
    this.mainStack.push(val);
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(val);
    } else {
      this.minStack.push(this.minStack[this.minStack.length - 1]);
    }
  }

  pop() {
    this.mainStack.pop();
    this.minStack.pop();
  }

  top() {
    return this.mainStack[this.mainStack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

const ms = new MinStack();
ms.push(5);
ms.push(3);
ms.push(7);

console.log(ms.getMin()); // 3
ms.pop();
console.log(ms.getMin()); // 3
ms.pop();
console.log(ms.getMin()); // 5
```

---

## Summary

| Problem | Key Technique | Time | Space |
|---------|---------------|------|-------|
| Valid Parentheses | Match openers with closers via stack | O(n) | O(n) |
| Evaluate RPN | Operands on stack, apply operators | O(n) | O(n) |
| Next Greater Element | Monotonic decreasing stack | O(n) | O(n) |
| Min Stack | Parallel min-tracking stack | O(1) per op | O(n) |

---

Next: **Queues →**
