---
title: Common String Problems
---

# Common String Problems

## 1. Valid Anagram

**Problem:** Given two strings, determine if one is an anagram of the other (same characters, same frequencies, different order).

**Approach:** Count character frequencies. If the counts match, it is an anagram.

```cpp
#include <string>
#include <unordered_map>
using namespace std;

bool isAnagram(string s, string t) {
    if (s.length() != t.length()) return false;
    unordered_map<char, int> count;
    for (char c : s) count[c]++;
    for (char c : t) {
        count[c]--;
        if (count[c] < 0) return false;
    }
    return true;
}
// "listen", "silent" → true
```

```java
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26]; // assuming lowercase a-z
    for (char c : s.toCharArray()) count[c - 'a']++;
    for (char c : t.toCharArray()) {
        count[c - 'a']--;
        if (count[c - 'a'] < 0) return false;
    }
    return true;
}
```

```python
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True

# Python shortcut: from collections import Counter
# return Counter(s) == Counter(t)
```

```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const count = {};
    for (const c of s) count[c] = (count[c] || 0) + 1;
    for (const c of t) {
        count[c] = (count[c] || 0) - 1;
        if (count[c] < 0) return false;
    }
    return true;
}
```

Time: O(n). Space: O(1) — at most 26 characters for lowercase English letters.

## 2. Longest Common Prefix

**Problem:** Find the longest common prefix among an array of strings.

**Approach:** Compare characters column by column. Stop when characters differ or a string ends.

```cpp
string longestCommonPrefix(vector<string>& strs) {
    if (strs.empty()) return "";
    for (int i = 0; i < strs[0].length(); i++) {
        char ch = strs[0][i];
        for (int j = 1; j < strs.size(); j++) {
            if (i >= strs[j].length() || strs[j][i] != ch) {
                return strs[0].substr(0, i);
            }
        }
    }
    return strs[0];
}
// ["flower", "flow", "flight"] → "fl"
```

```java
String longestCommonPrefix(String[] strs) {
    if (strs.length == 0) return "";
    for (int i = 0; i < strs[0].length(); i++) {
        char ch = strs[0].charAt(i);
        for (int j = 1; j < strs.length; j++) {
            if (i >= strs[j].length() || strs[j].charAt(i) != ch) {
                return strs[0].substring(0, i);
            }
        }
    }
    return strs[0];
}
```

```python
def longest_common_prefix(strs):
    if not strs:
        return ""
    for i, ch in enumerate(strs[0]):
        for s in strs[1:]:
            if i >= len(s) or s[i] != ch:
                return strs[0][:i]
    return strs[0]
```

```javascript
function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";
    for (let i = 0; i < strs[0].length; i++) {
        const ch = strs[0][i];
        for (let j = 1; j < strs.length; j++) {
            if (i >= strs[j].length || strs[j][i] !== ch) {
                return strs[0].slice(0, i);
            }
        }
    }
    return strs[0];
}
```

Time: O(S) where S is the total number of characters across all strings. Space: O(1).

## 3. String to Integer (atoi)

**Problem:** Convert a string to a 32-bit signed integer. Handle leading whitespace, optional sign, and overflow.

```cpp
int myAtoi(string s) {
    int i = 0, n = s.length();
    // Skip whitespace
    while (i < n && s[i] == ' ') i++;
    // Handle sign
    int sign = 1;
    if (i < n && (s[i] == '+' || s[i] == '-')) {
        sign = (s[i] == '-') ? -1 : 1;
        i++;
    }
    // Build number
    long result = 0;
    while (i < n && isdigit(s[i])) {
        result = result * 10 + (s[i] - '0');
        if (result * sign > INT_MAX) return INT_MAX;
        if (result * sign < INT_MIN) return INT_MIN;
        i++;
    }
    return (int)(result * sign);
}
```

```java
int myAtoi(String s) {
    int i = 0, n = s.length();
    while (i < n && s.charAt(i) == ' ') i++;
    int sign = 1;
    if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
        sign = (s.charAt(i) == '-') ? -1 : 1;
        i++;
    }
    long result = 0;
    while (i < n && Character.isDigit(s.charAt(i))) {
        result = result * 10 + (s.charAt(i) - '0');
        if (result * sign > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (result * sign < Integer.MIN_VALUE) return Integer.MIN_VALUE;
        i++;
    }
    return (int)(result * sign);
}
```

```python
def my_atoi(s):
    s = s.lstrip()
    if not s:
        return 0
    sign = 1
    i = 0
    if s[0] in ('+', '-'):
        sign = -1 if s[0] == '-' else 1
        i = 1
    result = 0
    INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1
    result *= sign
    return max(INT_MIN, min(INT_MAX, result))
```

```javascript
function myAtoi(s) {
    let i = 0;
    while (i < s.length && s[i] === " ") i++;
    let sign = 1;
    if (i < s.length && (s[i] === "+" || s[i] === "-")) {
        sign = s[i] === "-" ? -1 : 1;
        i++;
    }
    let result = 0;
    const INT_MAX = 2 ** 31 - 1, INT_MIN = -(2 ** 31);
    while (i < s.length && s[i] >= "0" && s[i] <= "9") {
        result = result * 10 + Number(s[i]);
        i++;
    }
    result *= sign;
    return Math.max(INT_MIN, Math.min(INT_MAX, result));
}
```

Time: O(n). Space: O(1).

## 4. Longest Palindromic Substring

**Problem:** Find the longest palindromic substring in a string.

**Approach — Expand Around Center:** For each position (and each gap between positions), try to expand outward while the characters match.

```cpp
string longestPalindrome(string s) {
    int start = 0, maxLen = 1;

    auto expand = [&](int left, int right) {
        while (left >= 0 && right < s.length() && s[left] == s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
    };

    for (int i = 0; i < s.length(); i++) {
        expand(i, i);     // odd-length palindromes
        expand(i, i + 1); // even-length palindromes
    }
    return s.substr(start, maxLen);
}
// "babad" → "bab" or "aba"
```

```java
String longestPalindrome(String s) {
    int start = 0, maxLen = 1;

    for (int i = 0; i < s.length(); i++) {
        // Odd-length
        int left = i, right = i;
        while (left >= 0 && right < s.length()
               && s.charAt(left) == s.charAt(right)) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
        // Even-length
        left = i;
        right = i + 1;
        while (left >= 0 && right < s.length()
               && s.charAt(left) == s.charAt(right)) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
    }
    return s.substring(start, start + maxLen);
}
```

```python
def longest_palindrome(s):
    start, max_len = 0, 1

    def expand(left, right):
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1

    for i in range(len(s)):
        expand(i, i)       # odd
        expand(i, i + 1)   # even

    return s[start:start + max_len]
```

```javascript
function longestPalindrome(s) {
    let start = 0, maxLen = 1;

    function expand(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
    }

    for (let i = 0; i < s.length; i++) {
        expand(i, i);       // odd
        expand(i, i + 1);   // even
    }
    return s.slice(start, start + maxLen);
}
```

Time: O(n²). Space: O(1). There is a O(n) algorithm (Manacher's) but this approach is interview-standard.

## 5. Group Anagrams

**Problem:** Given an array of strings, group the anagrams together.

**Approach:** Sort each string — all anagrams produce the same sorted string. Use it as a hash map key.

```cpp
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> groups;
    for (const string& s : strs) {
        string key = s;
        sort(key.begin(), key.end());
        groups[key].push_back(s);
    }
    vector<vector<string>> result;
    for (auto& [key, group] : groups) {
        result.push_back(group);
    }
    return result;
}
```

```java
import java.util.*;

List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}
```

```python
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())

# ["eat","tea","tan","ate","nat","bat"]
# → [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

```javascript
function groupAnagrams(strs) {
    const groups = new Map();
    for (const s of strs) {
        const key = s.split("").sort().join("");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
    }
    return [...groups.values()];
}
```

Time: O(n × k log k) where n is the number of strings and k is the maximum string length. Space: O(n × k).

## Key takeaways

- **Character counting** with a hash map or fixed-size array is the go-to for anagram and frequency problems.
- **Two-pointer expansion** solves palindrome problems efficiently.
- **Sorting as a key** groups anagrams elegantly.
- Handle edge cases: empty strings, single characters, overflow.

Next: **Introduction to Sorting →**
