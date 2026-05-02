---
title: Hashing Problems
---

# Hashing Problems

Let's apply hashing to solve classic coding interview problems. Each problem demonstrates a common pattern where hash maps or hash sets transform a brute-force O(n²) solution into an elegant O(n) one.

---

## Problem 1: Two Sum (Hash Map Approach)

**Given:** An array of integers and a target sum.
**Find:** Indices of the two numbers that add up to the target.
**Guarantee:** Exactly one solution exists.

### Approach

Instead of checking every pair (O(n²)), we use a hash map:

1. For each number `num`, compute `complement = target - num`
2. Check if `complement` is already in our hash map
3. If yes → we found the pair!
4. If no → store `num` and its index in the map

```
Array: [2, 7, 11, 15], Target: 9

Step 1: num=2, complement=7, map={} → not found → map={2:0}
Step 2: num=7, complement=2, map={2:0} → FOUND! Return [0, 1]
```

### C++

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen; // value → index

    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {}; // No solution (shouldn't reach here per guarantee)
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl; // [0, 1]

    nums = {3, 2, 4};
    target = 6;
    result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl; // [1, 2]

    return 0;
}
```

### Java

```java
import java.util.HashMap;
import java.util.Arrays;

public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>(); // value → index

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{}; // No solution
    }

    public static void main(String[] args) {
        int[] result = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(result)); // [0, 1]

        result = twoSum(new int[]{3, 2, 4}, 6);
        System.out.println(Arrays.toString(result)); // [1, 2]
    }
}
```

### Python

```python
def two_sum(nums, target):
    seen = {}  # value → index

    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i

    return []  # No solution


print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))       # [1, 2]
print(two_sum([3, 3], 6))          # [0, 1]
```

### JavaScript

```javascript
function twoSum(nums, target) {
  const seen = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return []; // No solution
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));      // [1, 2]
console.log(twoSum([3, 3], 6));         // [0, 1]
```

**Complexity:** Time O(n), Space O(n)

---

## Problem 2: First Non-Repeating Character

**Given:** A string.
**Find:** The index of the first character that appears only once. Return -1 if none exists.

### Approach

1. Count the frequency of each character using a hash map
2. Iterate the string again — return the first character with count 1

```
String: "leetcode"
Frequencies: l:1, e:3, t:1, c:1, o:1, d:1
First scan: l has count 1 → return index 0

String: "aabb"
Frequencies: a:2, b:2
No character has count 1 → return -1
```

### C++

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

int firstUniqChar(string s) {
    unordered_map<char, int> freq;

    // Count frequencies
    for (char c : s) {
        freq[c]++;
    }

    // Find first with count 1
    for (int i = 0; i < s.size(); i++) {
        if (freq[s[i]] == 1) {
            return i;
        }
    }
    return -1;
}

int main() {
    cout << firstUniqChar("leetcode") << endl;     // 0 ('l')
    cout << firstUniqChar("loveleetcode") << endl; // 2 ('v')
    cout << firstUniqChar("aabb") << endl;         // -1
    return 0;
}
```

### Java

```java
import java.util.HashMap;

public class FirstUniqueChar {
    public static int firstUniqChar(String s) {
        HashMap<Character, Integer> freq = new HashMap<>();

        // Count frequencies
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }

        // Find first with count 1
        for (int i = 0; i < s.length(); i++) {
            if (freq.get(s.charAt(i)) == 1) {
                return i;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqChar("leetcode"));     // 0
        System.out.println(firstUniqChar("loveleetcode")); // 2
        System.out.println(firstUniqChar("aabb"));         // -1
    }
}
```

### Python

```python
def first_uniq_char(s):
    freq = {}

    # Count frequencies
    for c in s:
        freq[c] = freq.get(c, 0) + 1

    # Find first with count 1
    for i, c in enumerate(s):
        if freq[c] == 1:
            return i

    return -1


print(first_uniq_char("leetcode"))      # 0 ('l')
print(first_uniq_char("loveleetcode"))  # 2 ('v')
print(first_uniq_char("aabb"))          # -1
```

### JavaScript

```javascript
function firstUniqChar(s) {
  const freq = {};

  // Count frequencies
  for (const c of s) {
    freq[c] = (freq[c] || 0) + 1;
  }

  // Find first with count 1
  for (let i = 0; i < s.length; i++) {
    if (freq[s[i]] === 1) {
      return i;
    }
  }
  return -1;
}

console.log(firstUniqChar("leetcode"));     // 0
console.log(firstUniqChar("loveleetcode")); // 2
console.log(firstUniqChar("aabb"));         // -1
```

**Complexity:** Time O(n), Space O(1) — at most 26 lowercase letters in the map

---

## Problem 3: Subarray Sum Equals K

**Given:** An integer array `nums` and an integer `k`.
**Find:** The total number of contiguous subarrays whose sum equals `k`.

### Approach: Prefix Sum + Hash Map

Key insight: if `prefixSum[j] - prefixSum[i] = k`, then the subarray from index `i+1` to `j` sums to `k`.

Rearranging: `prefixSum[j] - k = prefixSum[i]`

So for each index `j`, we need to count how many earlier prefix sums equal `currentSum - k`.

```
Array: [1, 1, 1], k = 2

Index 0: sum=1, need sum-k=-1, count of -1 in map=0, map={0:1, 1:1}
Index 1: sum=2, need sum-k=0,  count of 0 in map=1 ✓, map={0:1, 1:1, 2:1}
Index 2: sum=3, need sum-k=1,  count of 1 in map=1 ✓, map={0:1, 1:1, 2:1, 3:1}

Total subarrays = 2 → [1,1] and [1,1]
```

### C++

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> prefixCount; // prefix_sum → count
    prefixCount[0] = 1; // Empty prefix has sum 0

    int currentSum = 0;
    int result = 0;

    for (int num : nums) {
        currentSum += num;
        // How many earlier prefixes have sum = currentSum - k?
        if (prefixCount.count(currentSum - k)) {
            result += prefixCount[currentSum - k];
        }
        prefixCount[currentSum]++;
    }

    return result;
}

int main() {
    vector<int> nums1 = {1, 1, 1};
    cout << subarraySum(nums1, 2) << endl; // 2

    vector<int> nums2 = {1, 2, 3};
    cout << subarraySum(nums2, 3) << endl; // 2 → [1,2] and [3]

    vector<int> nums3 = {1, -1, 0};
    cout << subarraySum(nums3, 0) << endl; // 3 → [1,-1], [-1,0], [1,-1,0]

    return 0;
}
```

### Java

```java
import java.util.HashMap;

public class SubarraySum {
    public static int subarraySum(int[] nums, int k) {
        HashMap<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1); // Empty prefix has sum 0

        int currentSum = 0;
        int result = 0;

        for (int num : nums) {
            currentSum += num;
            // How many earlier prefixes have sum = currentSum - k?
            if (prefixCount.containsKey(currentSum - k)) {
                result += prefixCount.get(currentSum - k);
            }
            prefixCount.put(currentSum,
                prefixCount.getOrDefault(currentSum, 0) + 1);
        }

        return result;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[]{1, 1, 1}, 2)); // 2
        System.out.println(subarraySum(new int[]{1, 2, 3}, 3)); // 2
        System.out.println(subarraySum(new int[]{1, -1, 0}, 0)); // 3
    }
}
```

### Python

```python
def subarray_sum(nums, k):
    prefix_count = {0: 1}  # Empty prefix has sum 0
    current_sum = 0
    result = 0

    for num in nums:
        current_sum += num
        # How many earlier prefixes have sum = current_sum - k?
        if current_sum - k in prefix_count:
            result += prefix_count[current_sum - k]
        prefix_count[current_sum] = prefix_count.get(current_sum, 0) + 1

    return result


print(subarray_sum([1, 1, 1], 2))   # 2
print(subarray_sum([1, 2, 3], 3))   # 2 → [1,2] and [3]
print(subarray_sum([1, -1, 0], 0))  # 3 → [1,-1], [-1,0], [1,-1,0]
```

### JavaScript

```javascript
function subarraySum(nums, k) {
  const prefixCount = new Map();
  prefixCount.set(0, 1); // Empty prefix has sum 0

  let currentSum = 0;
  let result = 0;

  for (const num of nums) {
    currentSum += num;
    // How many earlier prefixes have sum = currentSum - k?
    if (prefixCount.has(currentSum - k)) {
      result += prefixCount.get(currentSum - k);
    }
    prefixCount.set(currentSum, (prefixCount.get(currentSum) || 0) + 1);
  }

  return result;
}

console.log(subarraySum([1, 1, 1], 2));  // 2
console.log(subarraySum([1, 2, 3], 3));  // 2
console.log(subarraySum([1, -1, 0], 0)); // 3
```

**Complexity:** Time O(n), Space O(n)

### Why This Works — Visual Walkthrough

```
Array: [1, 2, 3], k = 3

Prefix sums: [0, 1, 3, 6]
              ↑  ↑  ↑  ↑
          empty  1  1+2  1+2+3

At index 2 (sum=6): 6 - 3 = 3, and prefix sum 3 exists (at index 1)
  → Subarray from index 2 to 2: [3] ✓

At index 1 (sum=3): 3 - 3 = 0, and prefix sum 0 exists (empty prefix)
  → Subarray from index 0 to 1: [1, 2] ✓

Total: 2 subarrays
```

---

## Problem 4: Longest Consecutive Sequence

**Given:** An unsorted array of integers.
**Find:** The length of the longest consecutive elements sequence.
**Requirement:** O(n) time complexity.

### Approach

1. Put all numbers in a hash set
2. For each number, check if it's the **start** of a sequence (`num - 1` not in set)
3. If it is a start, count how long the sequence extends (`num+1`, `num+2`, ...)
4. Track the maximum length

```
Array: [100, 4, 200, 1, 3, 2]
Set: {100, 4, 200, 1, 3, 2}

Check 100: 99 not in set → start! 100,101? No → length 1
Check 4:   3 in set → not a start, skip
Check 200: 199 not in set → start! 200,201? No → length 1
Check 1:   0 not in set → start! 1,2,3,4 ✓ → length 4
Check 3:   2 in set → not a start, skip
Check 2:   1 in set → not a start, skip

Answer: 4 (sequence [1, 2, 3, 4])
```

### C++

```cpp
#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int longestConsecutive(vector<int>& nums) {
    unordered_set<int> numSet(nums.begin(), nums.end());
    int longest = 0;

    for (int num : numSet) {
        // Only start counting from the beginning of a sequence
        if (numSet.count(num - 1) == 0) {
            int currentNum = num;
            int currentStreak = 1;

            while (numSet.count(currentNum + 1)) {
                currentNum++;
                currentStreak++;
            }

            longest = max(longest, currentStreak);
        }
    }

    return longest;
}

int main() {
    vector<int> nums1 = {100, 4, 200, 1, 3, 2};
    cout << longestConsecutive(nums1) << endl; // 4

    vector<int> nums2 = {0, 3, 7, 2, 5, 8, 4, 6, 0, 1};
    cout << longestConsecutive(nums2) << endl; // 9

    vector<int> nums3 = {};
    cout << longestConsecutive(nums3) << endl; // 0

    return 0;
}
```

### Java

```java
import java.util.HashSet;

public class LongestConsecutive {
    public static int longestConsecutive(int[] nums) {
        HashSet<Integer> numSet = new HashSet<>();
        for (int num : nums) {
            numSet.add(num);
        }

        int longest = 0;

        for (int num : numSet) {
            // Only start counting from the beginning of a sequence
            if (!numSet.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;

                while (numSet.contains(currentNum + 1)) {
                    currentNum++;
                    currentStreak++;
                }

                longest = Math.max(longest, currentStreak);
            }
        }

        return longest;
    }

    public static void main(String[] args) {
        System.out.println(longestConsecutive(
            new int[]{100, 4, 200, 1, 3, 2}));  // 4
        System.out.println(longestConsecutive(
            new int[]{0, 3, 7, 2, 5, 8, 4, 6, 0, 1}));  // 9
        System.out.println(longestConsecutive(new int[]{}));  // 0
    }
}
```

### Python

```python
def longest_consecutive(nums):
    num_set = set(nums)
    longest = 0

    for num in num_set:
        # Only start counting from the beginning of a sequence
        if num - 1 not in num_set:
            current_num = num
            current_streak = 1

            while current_num + 1 in num_set:
                current_num += 1
                current_streak += 1

            longest = max(longest, current_streak)

    return longest


print(longest_consecutive([100, 4, 200, 1, 3, 2]))         # 4
print(longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])) # 9
print(longest_consecutive([]))                               # 0
```

### JavaScript

```javascript
function longestConsecutive(nums) {
  const numSet = new Set(nums);
  let longest = 0;

  for (const num of numSet) {
    // Only start counting from the beginning of a sequence
    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentStreak = 1;

      while (numSet.has(currentNum + 1)) {
        currentNum++;
        currentStreak++;
      }

      longest = Math.max(longest, currentStreak);
    }
  }

  return longest;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));         // 4
console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])); // 9
console.log(longestConsecutive([]));                               // 0
```

**Complexity:** Time O(n), Space O(n)

### Why O(n) and Not O(n²)?

It looks like nested loops, but the inner `while` loop only runs for elements that are **starts** of sequences. Each element is visited at most twice total (once in the outer loop, once in an inner while extension). Total work across all iterations = O(n).

---

## Summary of Patterns

| Problem | Pattern | Key Insight |
|---------|---------|-------------|
| Two Sum | Complement lookup | Store seen values, check for `target - num` |
| First Unique Char | Frequency count | Two passes: count then scan |
| Subarray Sum = K | Prefix sum + map | Count prefix sums that equal `currentSum - k` |
| Longest Consecutive | Set + sequence start | Only extend from numbers that begin a chain |

---

## Tips for Hashing Problems

1. **Think complement** — can you rephrase "find X" as "have I seen Y = target - X"?
2. **Think frequency** — would counting occurrences simplify the problem?
3. **Think prefix sum** — for subarray problems, prefix sums + hash map is a powerful combo
4. **Think membership** — would a set let you skip unnecessary work?
5. **Watch for edge cases** — empty input, single element, all duplicates, negative numbers

---

Next: **Trees Introduction →**
