---
title: JavaScript Regex
---

# JavaScript Regular Expressions

A **regular expression** (regex) is a pattern for matching text. JavaScript has them built in — they're useful for validation, search-and-replace, and parsing simple structures. Use sparingly; for anything complex, a real parser is safer.

## Two ways to write a regex

```javascript
const re1 = /hello/i;                  // literal — preferred
const re2 = new RegExp("hello", "i");  // constructor — when the pattern is dynamic
```

Use the literal form unless you need to build the pattern from a variable.

## Flags

Single letters at the end of the pattern (or as the second argument):

| Flag | Meaning                                           |
| ---- | ------------------------------------------------- |
| `g`  | **g**lobal — find all matches, not just the first |
| `i`  | **i**gnore case                                   |
| `m`  | **m**ultiline — `^` and `$` match line boundaries |
| `s`  | **s**ingle-line — `.` matches newlines too        |
| `u`  | **u**nicode — proper handling of code points      |
| `y`  | stick**y** — match only at `lastIndex`            |
| `d`  | indices — captures provide start/end positions    |

Pretty much always pass at least `u`:

```javascript
/[😀-😏]/u.test("😀"); // true
/[😀-😏]/.test("😀");  // SyntaxError without `u`
```

## Testing and finding

```javascript
const re = /\d+/;

re.test("abc123");          // true
re.test("abc");             // false

"abc 123 def 456".match(re);   // ["123", index: 4, ...]
"abc 123 def 456".match(/\d+/g); // ["123", "456"]
```

For all matches with extra info (groups, indices), use `matchAll`:

```javascript
const text = "Ada is 36, Grace is 85";
for (const m of text.matchAll(/(\w+) is (\d+)/g)) {
  console.log(m[1], "=>", m[2]); // Ada => 36, Grace => 85
}
```

## Searching strings

```javascript
"abc 123".search(/\d+/);   // 4   — index of first match (or -1)
"abc 123".replace(/\d+/, "###"); // "abc ###"
"a-b-c".split(/-/);        // ["a", "b", "c"]
```

## Replacing

```javascript
"hello world".replace(/o/g, "0");           // "hell0 w0rld"
"hello world".replaceAll("o", "0");         // same — no regex needed

"john doe".replace(/(\w+) (\w+)/, "$2 $1"); // "doe john"
```

The replacement can be a function for dynamic logic:

```javascript
"abc 123 def 456".replace(/\d+/g, (n) => Number(n) * 2);
// "abc 246 def 912"
```

## Common building blocks

### Character classes

```text
.      any character (except newline unless `s` flag)
\d     digit                ([0-9])
\D     non-digit
\w     word character       ([A-Za-z0-9_])
\W     non-word
\s     whitespace
\S     non-whitespace
[abc]  any one of a, b, c
[^abc] anything except a, b, c
[a-z]  range
```

### Anchors

```text
^      start of input (or line with `m` flag)
$      end of input (or line)
\b     word boundary
\B     non-word boundary
```

### Quantifiers

```text
*      0 or more   (greedy)
+      1 or more
?      0 or 1
{n}    exactly n
{n,}   n or more
{n,m}  between n and m
*?  +?  ??  {n,m}?  the lazy (non-greedy) versions
```

### Groups

```text
(abc)        capturing group
(?:abc)      non-capturing group (no number)
(?<name>abc) named capture
\1, \2       back-reference to a previous group
```

### Alternation and lookarounds

```text
a|b              a or b
(?=abc)          lookahead — followed by abc
(?!abc)          negative lookahead
(?<=abc)         lookbehind — preceded by abc
(?<!abc)         negative lookbehind
```

## Capture groups

```javascript
const re = /(\d{4})-(\d{2})-(\d{2})/;
const m = "Today is 2025-01-15".match(re);
m[0]; // "2025-01-15"  (whole match)
m[1]; // "2025"
m[2]; // "01"
m[3]; // "15"
```

Named groups are clearer:

```javascript
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { groups } = "2025-01-15".match(re);
groups.year;  // "2025"
groups.month; // "01"
groups.day;   // "15"
```

## Greedy vs lazy

```javascript
"<a><b>".match(/<.+>/);   // ["<a><b>"]   — greedy: as much as possible
"<a><b>".match(/<.+?>/);  // ["<a>"]      — lazy: as little as possible
```

## Real-world recipes

```javascript
// Simple email check (NOT for validation, just a hint)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
EMAIL.test("ada@example.com"); // true

// Trim non-printable whitespace including unicode
"  hello  ".replace(/^\s+|\s+$/gu, ""); // "hello"  (or just .trim())

// Remove HTML tags (NOT a parser — fine for plain text)
"<b>hi</b>".replace(/<[^>]+>/g, "");   // "hi"

// Split CSV (only when fields don't contain commas/quotes)
"a,b,c".split(/\s*,\s*/);

// camelCase ↔ kebab-case
"helloWorld".replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()); // "hello-world"
"hello-world".replace(/-([a-z])/g, (_, c) => c.toUpperCase()); // "helloWorld"

// Strip ANSI color codes from a terminal string
text.replace(/\x1B\[[0-9;]*m/g, "");
```

## Stateful `g` regexes

A regex with the `g` flag has a `lastIndex` that advances across calls. That makes a single regex object stateful — surprising in shared modules:

```javascript
const re = /a/g;
re.test("aaa"); // true; lastIndex now 1
re.test("aaa"); // true; lastIndex now 2
re.test("aaa"); // true; lastIndex now 3
re.test("aaa"); // false; resets
```

Easy fix: create a fresh regex per use, or call `.matchAll()` (which is stateless from the caller's perspective).

## Performance and safety

Regex is fast in normal use, but pathological patterns can cause **catastrophic backtracking** — minutes or hours of CPU on small inputs:

```javascript
/(a+)+b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaa!"); // can hang
```

Tips:

- Avoid nested quantifiers like `(a+)+`.
- Anchor with `^`/`$` when possible.
- Use lazy `*?`/`+?` when you mean "as little as possible".
- For untrusted input, consider a regex with a timeout (Node 20+ supports `RegExp.timeout` via `regexp.exec` flags in some runtimes), or use a non-backtracking engine.

## When NOT to use regex

- Parsing HTML, JSON, CSV, or any nested structure → use a real parser.
- Email validation → use a real validator + actual delivery.
- URL parsing → `new URL(string)`.
- Date parsing → `new Date()` or a date library.

## Next step

Text patterns done. Time to handle moments in time: dates.
