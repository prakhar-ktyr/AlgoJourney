---
title: Array Operations
---

# Array Operations

Now that you know what arrays are, let's master the operations you will use in every DSA problem.

## Insertion

### Insert at the end — O(1) amortized

```cpp
#include <vector>
using namespace std;

vector<int> arr = {1, 2, 3};
arr.push_back(4); // {1, 2, 3, 4}
```

```java
import java.util.ArrayList;

ArrayList<Integer> arr = new ArrayList<>();
arr.add(1); arr.add(2); arr.add(3);
arr.add(4); // [1, 2, 3, 4]
```

```python
arr = [1, 2, 3]
arr.append(4)  # [1, 2, 3, 4]
```

```javascript
const arr = [1, 2, 3];
arr.push(4); // [1, 2, 3, 4]
```

### Insert at the beginning — O(n)

Every element must shift right by one position.

```cpp
vector<int> arr = {2, 3, 4};
arr.insert(arr.begin(), 1); // {1, 2, 3, 4}
```

```java
ArrayList<Integer> arr = new ArrayList<>(List.of(2, 3, 4));
arr.add(0, 1); // [1, 2, 3, 4]
```

```python
arr = [2, 3, 4]
arr.insert(0, 1)  # [1, 2, 3, 4]
```

```javascript
const arr = [2, 3, 4];
arr.unshift(1); // [1, 2, 3, 4]
```

### Insert at index i — O(n)

```cpp
vector<int> arr = {1, 2, 4, 5};
arr.insert(arr.begin() + 2, 3); // {1, 2, 3, 4, 5}
```

```java
ArrayList<Integer> arr = new ArrayList<>(List.of(1, 2, 4, 5));
arr.add(2, 3); // [1, 2, 3, 4, 5]
```

```python
arr = [1, 2, 4, 5]
arr.insert(2, 3)  # [1, 2, 3, 4, 5]
```

```javascript
const arr = [1, 2, 4, 5];
arr.splice(2, 0, 3); // [1, 2, 3, 4, 5]
```

## Deletion

### Delete from the end — O(1)

```cpp
vector<int> arr = {1, 2, 3, 4};
arr.pop_back(); // {1, 2, 3}
```

```java
ArrayList<Integer> arr = new ArrayList<>(List.of(1, 2, 3, 4));
arr.remove(arr.size() - 1); // [1, 2, 3]
```

```python
arr = [1, 2, 3, 4]
arr.pop()  # [1, 2, 3]
```

```javascript
const arr = [1, 2, 3, 4];
arr.pop(); // [1, 2, 3]
```

### Delete from the beginning — O(n)

```cpp
vector<int> arr = {1, 2, 3, 4};
arr.erase(arr.begin()); // {2, 3, 4}
```

```java
ArrayList<Integer> arr = new ArrayList<>(List.of(1, 2, 3, 4));
arr.remove(0); // [2, 3, 4]
```

```python
arr = [1, 2, 3, 4]
arr.pop(0)  # [2, 3, 4]
```

```javascript
const arr = [1, 2, 3, 4];
arr.shift(); // [2, 3, 4]
```

### Delete at index i — O(n)

```cpp
vector<int> arr = {1, 2, 3, 4, 5};
arr.erase(arr.begin() + 2); // {1, 2, 4, 5}
```

```java
ArrayList<Integer> arr = new ArrayList<>(List.of(1, 2, 3, 4, 5));
arr.remove(2); // [1, 2, 4, 5]
```

```python
arr = [1, 2, 3, 4, 5]
del arr[2]  # [1, 2, 4, 5]
```

```javascript
const arr = [1, 2, 3, 4, 5];
arr.splice(2, 1); // [1, 2, 4, 5]
```

## Updating an element — O(1)

Direct assignment by index:

```cpp
vector<int> arr = {1, 2, 3};
arr[1] = 20; // {1, 20, 3}
```

```java
int[] arr = {1, 2, 3};
arr[1] = 20; // {1, 20, 3}
```

```python
arr = [1, 2, 3]
arr[1] = 20  # [1, 20, 3]
```

```javascript
const arr = [1, 2, 3];
arr[1] = 20; // [1, 20, 3]
```

## Reversing an array — O(n)

Use two pointers from both ends, swap inward:

```cpp
void reverseArray(vector<int>& arr) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}
```

```java
void reverseArray(int[] arr) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}
```

```python
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1

# Python shortcut: arr.reverse() or arr[::-1]
```

```javascript
function reverseArray(arr) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
}
// JS shortcut: arr.reverse()
```

## Rotating an array

### Left rotate by k positions

Move the first k elements to the end.

```
Before: [1, 2, 3, 4, 5], k = 2
After:  [3, 4, 5, 1, 2]
```

**Efficient approach — reverse three times (O(n) time, O(1) space):**

1. Reverse the first k elements.
2. Reverse the remaining n-k elements.
3. Reverse the entire array.

```cpp
void leftRotate(vector<int>& arr, int k) {
    int n = arr.size();
    k = k % n; // handle k > n
    reverse(arr.begin(), arr.begin() + k);
    reverse(arr.begin() + k, arr.end());
    reverse(arr.begin(), arr.end());
}
```

```java
void leftRotate(int[] arr, int k) {
    int n = arr.length;
    k = k % n;
    reverse(arr, 0, k - 1);
    reverse(arr, k, n - 1);
    reverse(arr, 0, n - 1);
}

void reverse(int[] arr, int left, int right) {
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}
```

```python
def left_rotate(arr, k):
    n = len(arr)
    k = k % n
    arr[:k] = arr[:k][::-1]
    arr[k:] = arr[k:][::-1]
    arr.reverse()
    # Or simply: arr[:] = arr[k:] + arr[:k]
```

```javascript
function leftRotate(arr, k) {
    const n = arr.length;
    k = k % n;
    reverse(arr, 0, k - 1);
    reverse(arr, k, n - 1);
    reverse(arr, 0, n - 1);
}

function reverse(arr, left, right) {
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
}
```

## Finding minimum and maximum — O(n)

```cpp
#include <algorithm>
vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};
int minVal = *min_element(arr.begin(), arr.end()); // 1
int maxVal = *max_element(arr.begin(), arr.end()); // 9
```

```java
int minVal = arr[0], maxVal = arr[0];
for (int x : arr) {
    if (x < minVal) minVal = x;
    if (x > maxVal) maxVal = x;
}
```

```python
arr = [3, 1, 4, 1, 5, 9, 2, 6]
min_val = min(arr)  # 1
max_val = max(arr)  # 9
```

```javascript
const arr = [3, 1, 4, 1, 5, 9, 2, 6];
const minVal = Math.min(...arr); // 1
const maxVal = Math.max(...arr); // 9
```

## Summing elements — O(n)

```cpp
int sum = 0;
for (int x : arr) sum += x;
// Or: #include <numeric>
// int sum = accumulate(arr.begin(), arr.end(), 0);
```

```java
int sum = 0;
for (int x : arr) sum += x;
// Or: int sum = Arrays.stream(arr).sum();
```

```python
total = sum(arr)
```

```javascript
const total = arr.reduce((sum, x) => sum + x, 0);
```

## Operations summary

| Operation | Time | Space |
|---|---|---|
| Access by index | O(1) | O(1) |
| Insert/delete at end | O(1) amortized | O(1) |
| Insert/delete at start/middle | O(n) | O(1) |
| Reverse | O(n) | O(1) |
| Rotate by k | O(n) | O(1) |
| Find min/max | O(n) | O(1) |
| Sum | O(n) | O(1) |

Next: **Multi-dimensional Arrays →**
