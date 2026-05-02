---
title: Linked List Problems
---

# Linked List Problems

Now that you understand singly and doubly linked lists, let's tackle classic problems that frequently appear in coding interviews. Each problem uses clever pointer manipulation to achieve efficient solutions.

---

## Problem 1: Detect a Cycle (Floyd's Algorithm)

**Problem:** Given a linked list, determine if it contains a cycle (a node's `next` pointer points to a previously visited node).

```
Normal list:    1 → 2 → 3 → 4 → NULL  (no cycle)

List with cycle: 1 → 2 → 3 → 4
                      ▲           │
                      └───────────┘   (cycle!)
```

### Approach: Floyd's Tortoise and Hare

Use two pointers:
- **Slow** moves 1 step at a time
- **Fast** moves 2 steps at a time

If there's a cycle, fast will eventually "lap" slow and they'll meet. If there's no cycle, fast will reach `NULL`.

**Why does this work?**
Think of it like two runners on a circular track. The faster runner will always catch up to the slower one. Once both are inside the cycle, the gap between them decreases by 1 each step.

```
Step 0: slow=1, fast=1
Step 1: slow=2, fast=3
Step 2: slow=3, fast=2 (fast looped back)
Step 3: slow=4, fast=4 ← THEY MEET! Cycle detected.
```

### Code

```cpp
bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;

    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;

        if (slow == fast) {
            return true;  // cycle detected
        }
    }
    return false;  // no cycle
}
```

```java
boolean hasCycle(Node head) {
    Node slow = head;
    Node fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow == fast) {
            return true;  // cycle detected
        }
    }
    return false;  // no cycle
}
```

```python
def has_cycle(head):
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:
            return True  # cycle detected

    return False  # no cycle
```

```javascript
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true; // cycle detected
    }
  }
  return false; // no cycle
}
```

### Finding the Start of the Cycle

Once slow and fast meet, reset one pointer to `head`. Move both one step at a time — they'll meet at the cycle's starting node.

```cpp
Node* detectCycleStart(Node* head) {
    Node* slow = head;
    Node* fast = head;

    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;

        if (slow == fast) {
            // Reset slow to head
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;  // start of cycle
        }
    }
    return nullptr;  // no cycle
}
```

```java
Node detectCycleStart(Node head) {
    Node slow = head;
    Node fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;  // start of cycle
        }
    }
    return null;  // no cycle
}
```

```python
def detect_cycle_start(head):
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:
            slow = head
            while slow != fast:
                slow = slow.next
                fast = fast.next
            return slow  # start of cycle

    return None  # no cycle
```

```javascript
function detectCycleStart(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      slow = head;
      while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
      }
      return slow; // start of cycle
    }
  }
  return null; // no cycle
}
```

**Complexity:** Time O(n), Space O(1)

---

## Problem 2: Merge Two Sorted Linked Lists

**Problem:** Given two sorted linked lists, merge them into one sorted list.

```
List 1: 1 → 3 → 5 → NULL
List 2: 2 → 4 → 6 → NULL
Result: 1 → 2 → 3 → 4 → 5 → 6 → NULL
```

### Approach

Use a **dummy node** as the starting point. Compare the heads of both lists, attach the smaller one to the result, and advance that list's pointer.

```
Dummy → ?

Compare 1 vs 2 → pick 1:  Dummy → 1
Compare 3 vs 2 → pick 2:  Dummy → 1 → 2
Compare 3 vs 4 → pick 3:  Dummy → 1 → 2 → 3
Compare 5 vs 4 → pick 4:  Dummy → 1 → 2 → 3 → 4
Compare 5 vs 6 → pick 5:  Dummy → 1 → 2 → 3 → 4 → 5
List 1 empty → attach 6:  Dummy → 1 → 2 → 3 → 4 → 5 → 6
```

### Code

```cpp
Node* mergeTwoLists(Node* l1, Node* l2) {
    Node dummy(0);
    Node* tail = &dummy;

    while (l1 != nullptr && l2 != nullptr) {
        if (l1->data <= l2->data) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }

    // Attach remaining nodes
    tail->next = (l1 != nullptr) ? l1 : l2;

    return dummy.next;
}
```

```java
Node mergeTwoLists(Node l1, Node l2) {
    Node dummy = new Node(0);
    Node tail = dummy;

    while (l1 != null && l2 != null) {
        if (l1.data <= l2.data) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }

    // Attach remaining nodes
    tail.next = (l1 != null) ? l1 : l2;

    return dummy.next;
}
```

```python
def merge_two_lists(l1, l2):
    dummy = Node(0)
    tail = dummy

    while l1 and l2:
        if l1.data <= l2.data:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next

    # Attach remaining nodes
    tail.next = l1 if l1 else l2

    return dummy.next
```

```javascript
function mergeTwoLists(l1, l2) {
  const dummy = new Node(0);
  let tail = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.data <= l2.data) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }

  // Attach remaining nodes
  tail.next = l1 !== null ? l1 : l2;

  return dummy.next;
}
```

**Complexity:** Time O(n + m), Space O(1)

---

## Problem 3: Remove Nth Node from End

**Problem:** Given a linked list, remove the nth node from the **end** and return the head.

```
List: 1 → 2 → 3 → 4 → 5, n = 2
Remove 2nd from end (node 4):
Result: 1 → 2 → 3 → 5
```

### Approach: Two Pointers with Gap

1. Move `fast` pointer **n** steps ahead
2. Move both `fast` and `slow` together until `fast` reaches the end
3. `slow` is now just before the node to remove

```
n = 2
Step 1: Move fast 2 steps ahead
        slow = 1, fast = 3

Step 2: Move both until fast.next = NULL
        slow = 1, fast = 3
        slow = 2, fast = 4
        slow = 3, fast = 5  ← fast.next is NULL, stop

Step 3: slow.next = slow.next.next (skip node 4)
        Result: 1 → 2 → 3 → 5
```

### Code

```cpp
Node* removeNthFromEnd(Node* head, int n) {
    Node dummy(0);
    dummy.next = head;
    Node* fast = &dummy;
    Node* slow = &dummy;

    // Move fast n+1 steps ahead
    for (int i = 0; i <= n; i++) {
        fast = fast->next;
    }

    // Move both until fast reaches end
    while (fast != nullptr) {
        fast = fast->next;
        slow = slow->next;
    }

    // Remove the nth node from end
    Node* toDelete = slow->next;
    slow->next = slow->next->next;
    delete toDelete;

    return dummy.next;
}
```

```java
Node removeNthFromEnd(Node head, int n) {
    Node dummy = new Node(0);
    dummy.next = head;
    Node fast = dummy;
    Node slow = dummy;

    // Move fast n+1 steps ahead
    for (int i = 0; i <= n; i++) {
        fast = fast.next;
    }

    // Move both until fast reaches end
    while (fast != null) {
        fast = fast.next;
        slow = slow.next;
    }

    // Remove the nth node from end
    slow.next = slow.next.next;

    return dummy.next;
}
```

```python
def remove_nth_from_end(head, n):
    dummy = Node(0)
    dummy.next = head
    fast = dummy
    slow = dummy

    # Move fast n+1 steps ahead
    for _ in range(n + 1):
        fast = fast.next

    # Move both until fast reaches end
    while fast:
        fast = fast.next
        slow = slow.next

    # Remove the nth node from end
    slow.next = slow.next.next

    return dummy.next
```

```javascript
function removeNthFromEnd(head, n) {
  const dummy = new Node(0);
  dummy.next = head;
  let fast = dummy;
  let slow = dummy;

  // Move fast n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }

  // Move both until fast reaches end
  while (fast !== null) {
    fast = fast.next;
    slow = slow.next;
  }

  // Remove the nth node from end
  slow.next = slow.next.next;

  return dummy.next;
}
```

**Why use a dummy node?** It handles the edge case where we need to remove the head itself (n equals the length of the list).

**Complexity:** Time O(n), Space O(1)

---

## Problem 4: Check If a Linked List Is a Palindrome

**Problem:** Determine whether a singly linked list reads the same forwards and backwards.

```
1 → 2 → 3 → 2 → 1  → palindrome ✓
1 → 2 → 3 → 4 → 5  → not palindrome ✗
```

### Approach

1. Find the **middle** of the list (fast/slow pointers)
2. **Reverse** the second half
3. **Compare** the first half with the reversed second half
4. (Optional) Restore the list by reversing the second half again

```
Original:   1 → 2 → 3 → 2 → 1

Step 1: Find middle → node 3
        First half:  1 → 2 → 3
        Second half: 2 → 1

Step 2: Reverse second half → 1 → 2

Step 3: Compare:
        1 == 1 ✓
        2 == 2 ✓
        → It's a palindrome!
```

### Code

```cpp
bool isPalindrome(Node* head) {
    if (head == nullptr || head->next == nullptr) return true;

    // Step 1: Find middle
    Node* slow = head;
    Node* fast = head;
    while (fast->next != nullptr && fast->next->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }

    // Step 2: Reverse second half
    Node* prev = nullptr;
    Node* current = slow->next;
    while (current != nullptr) {
        Node* next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }

    // Step 3: Compare both halves
    Node* firstHalf = head;
    Node* secondHalf = prev;
    while (secondHalf != nullptr) {
        if (firstHalf->data != secondHalf->data) {
            return false;
        }
        firstHalf = firstHalf->next;
        secondHalf = secondHalf->next;
    }

    return true;
}
```

```java
boolean isPalindrome(Node head) {
    if (head == null || head.next == null) return true;

    // Step 1: Find middle
    Node slow = head;
    Node fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Step 2: Reverse second half
    Node prev = null;
    Node current = slow.next;
    while (current != null) {
        Node next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }

    // Step 3: Compare both halves
    Node firstHalf = head;
    Node secondHalf = prev;
    while (secondHalf != null) {
        if (firstHalf.data != secondHalf.data) {
            return false;
        }
        firstHalf = firstHalf.next;
        secondHalf = secondHalf.next;
    }

    return true;
}
```

```python
def is_palindrome(head):
    if head is None or head.next is None:
        return True

    # Step 1: Find middle
    slow = head
    fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: Reverse second half
    prev = None
    current = slow.next
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node

    # Step 3: Compare both halves
    first_half = head
    second_half = prev
    while second_half:
        if first_half.data != second_half.data:
            return False
        first_half = first_half.next
        second_half = second_half.next

    return True
```

```javascript
function isPalindrome(head) {
  if (head === null || head.next === null) return true;

  // Step 1: Find middle
  let slow = head;
  let fast = head;
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // Step 2: Reverse second half
  let prev = null;
  let current = slow.next;
  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  // Step 3: Compare both halves
  let firstHalf = head;
  let secondHalf = prev;
  while (secondHalf !== null) {
    if (firstHalf.data !== secondHalf.data) {
      return false;
    }
    firstHalf = firstHalf.next;
    secondHalf = secondHalf.next;
  }

  return true;
}
```

**Complexity:** Time O(n), Space O(1)

---

## Complexity Summary

| Problem | Time | Space | Key Technique |
|---------|------|-------|---------------|
| Detect cycle | O(n) | O(1) | Floyd's fast/slow |
| Find cycle start | O(n) | O(1) | Floyd's + reset |
| Merge two sorted | O(n+m) | O(1) | Dummy node + compare |
| Remove nth from end | O(n) | O(1) | Two pointers with gap |
| Check palindrome | O(n) | O(1) | Middle + reverse + compare |

---

## Key Takeaways

- **Floyd's algorithm** (tortoise and hare) is the go-to for cycle detection — memorize it
- **Dummy nodes** simplify edge cases (empty list, removing the head)
- **Two-pointer with gap** converts "from the end" problems into single-pass solutions
- **Reverse half** + compare is the O(1) space approach for palindrome checks
- Most linked list problems can be solved with combinations of: finding the middle, reversing, and two-pointer techniques

Next: **Stacks →**
