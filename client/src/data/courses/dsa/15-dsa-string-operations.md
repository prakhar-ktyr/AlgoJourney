---
title: String Operations
---

# String Operations

Master these string operations — they appear in nearly every string problem.

## Substring / Slicing

Extract a portion of a string:

```cpp
string s = "hello world";
string sub = s.substr(6, 5);  // "world" — (start, length)
string first3 = s.substr(0, 3); // "hel"
```

```java
String s = "hello world";
String sub = s.substring(6, 11);  // "world" — (start, endExclusive)
String first3 = s.substring(0, 3); // "hel"
```

```python
s = "hello world"
sub = s[6:11]   # "world" — [start:end)
first3 = s[:3]  # "hel"
last5 = s[-5:]  # "world"
```

```javascript
const s = "hello world";
const sub = s.slice(6, 11);   // "world"
const first3 = s.slice(0, 3); // "hel"
const last5 = s.slice(-5);    // "world"
```

## Searching within strings

### Find the first occurrence

```cpp
string s = "hello world";
size_t pos = s.find("world"); // 6
if (pos != string::npos) {
    cout << "Found at index " << pos << endl;
}
// find returns string::npos (-1) if not found
```

```java
String s = "hello world";
int pos = s.indexOf("world"); // 6
// returns -1 if not found
```

```python
s = "hello world"
pos = s.find("world")  # 6
# returns -1 if not found
# or use s.index("world") — raises ValueError if not found
```

```javascript
const s = "hello world";
const pos = s.indexOf("world"); // 6
// returns -1 if not found
// also: s.includes("world") → true
```

### Check if a substring exists

```cpp
bool found = s.find("world") != string::npos;
```

```java
boolean found = s.contains("world");
```

```python
found = "world" in s
```

```javascript
const found = s.includes("world");
```

## Replacing characters

```cpp
string s = "hello world";
// Replace first occurrence of "world" with "there"
size_t pos = s.find("world");
if (pos != string::npos) {
    s.replace(pos, 5, "there"); // "hello there"
}
```

```java
String s = "hello world";
String result = s.replace("world", "there"); // "hello there"
// replaceAll uses regex; replace does literal replacement
```

```python
s = "hello world"
result = s.replace("world", "there")  # "hello there"
```

```javascript
const s = "hello world";
const result = s.replace("world", "there"); // "hello there"
// replaceAll for all occurrences (or use regex with /g flag)
```

## Converting case

```cpp
#include <algorithm>
#include <cctype>
string s = "Hello World";
transform(s.begin(), s.end(), s.begin(), ::tolower); // "hello world"
transform(s.begin(), s.end(), s.begin(), ::toupper); // "HELLO WORLD"
```

```java
String s = "Hello World";
String lower = s.toLowerCase(); // "hello world"
String upper = s.toUpperCase(); // "HELLO WORLD"
```

```python
s = "Hello World"
lower = s.lower()  # "hello world"
upper = s.upper()  # "HELLO WORLD"
```

```javascript
const s = "Hello World";
const lower = s.toLowerCase(); // "hello world"
const upper = s.toUpperCase(); // "HELLO WORLD"
```

## Splitting and joining

### Split a string into parts

```cpp
#include <sstream>
#include <vector>
string s = "one,two,three";
vector<string> parts;
stringstream ss(s);
string token;
while (getline(ss, token, ',')) {
    parts.push_back(token);
}
// parts = {"one", "two", "three"}
```

```java
String s = "one,two,three";
String[] parts = s.split(",");
// parts = ["one", "two", "three"]
```

```python
s = "one,two,three"
parts = s.split(",")
# parts = ["one", "two", "three"]
```

```javascript
const s = "one,two,three";
const parts = s.split(",");
// parts = ["one", "two", "three"]
```

### Join parts into a string

```cpp
vector<string> parts = {"one", "two", "three"};
string result;
for (int i = 0; i < parts.size(); i++) {
    if (i > 0) result += ",";
    result += parts[i];
}
// result = "one,two,three"
```

```java
String[] parts = {"one", "two", "three"};
String result = String.join(",", parts);
// result = "one,two,three"
```

```python
parts = ["one", "two", "three"]
result = ",".join(parts)
# result = "one,two,three"
```

```javascript
const parts = ["one", "two", "three"];
const result = parts.join(",");
// result = "one,two,three"
```

## Reversing a string

```cpp
string s = "hello";
reverse(s.begin(), s.end()); // "olleh" — in-place
```

```java
String s = "hello";
String reversed = new StringBuilder(s).reverse().toString(); // "olleh"
```

```python
s = "hello"
reversed_s = s[::-1]  # "olleh"
```

```javascript
const s = "hello";
const reversed = s.split("").reverse().join(""); // "olleh"
```

## Checking palindromes

A **palindrome** reads the same forward and backward: "racecar", "madam", "level".

```cpp
bool isPalindrome(const string& s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++;
        right--;
    }
    return true;
}
```

```java
boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}
```

```python
def is_palindrome(s):
    return s == s[::-1]

# Or with two pointers:
def is_palindrome_manual(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
```

```javascript
function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}
```

Time: O(n). Space: O(1) with two pointers.

## Trimming whitespace

```cpp
#include <algorithm>
string s = "  hello  ";
// C++ has no built-in trim; manual approach:
s.erase(0, s.find_first_not_of(' '));
s.erase(s.find_last_not_of(' ') + 1);
// s = "hello"
```

```java
String s = "  hello  ";
String trimmed = s.trim(); // "hello"
// or s.strip() in Java 11+ (handles Unicode whitespace)
```

```python
s = "  hello  "
trimmed = s.strip()   # "hello"
left = s.lstrip()     # "hello  "
right = s.rstrip()    # "  hello"
```

```javascript
const s = "  hello  ";
const trimmed = s.trim(); // "hello"
const left = s.trimStart(); // "hello  "
const right = s.trimEnd();  // "  hello"
```

## Checking character types

Useful for parsing and validation problems:

```cpp
#include <cctype>
isalpha('A');  // true — letter
isdigit('5');  // true — digit
isalnum('A');  // true — letter or digit
isspace(' ');  // true — whitespace
isupper('A');  // true — uppercase
islower('a');  // true — lowercase
```

```java
Character.isLetter('A');     // true
Character.isDigit('5');      // true
Character.isLetterOrDigit('A'); // true
Character.isWhitespace(' '); // true
Character.isUpperCase('A');  // true
Character.isLowerCase('a');  // true
```

```python
'A'.isalpha()  # True
'5'.isdigit()  # True
'A'.isalnum()  # True
' '.isspace()  # True
'A'.isupper()  # True
'a'.islower()  # True
```

```javascript
// JavaScript has no built-in char type checks; use regex
/^[a-zA-Z]$/.test("A");  // true — letter
/^\d$/.test("5");          // true — digit
/^\s$/.test(" ");          // true — whitespace
```

## Summary

| Operation | Time |
|---|---|
| Access character by index | O(1) |
| Substring / slice | O(k) where k is the length |
| Search (find/indexOf) | O(n × m) worst case |
| Concatenation (single) | O(n) for immutable, O(1) amortized for mutable |
| Reverse | O(n) |
| Split / Join | O(n) |

Next: **Common String Problems →**
