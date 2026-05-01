---
title: JavaScript Strings
---

# JavaScript Strings

A **string** is a sequence of characters used to represent text. JavaScript strings are immutable — every "modification" returns a brand-new string.

## Three ways to write a string

```javascript
'single quotes';
"double quotes";
`backticks (a "template literal")`;
```

Single and double quotes are interchangeable — pick one and stay consistent (most teams use double quotes; Prettier's default is double). Backticks are special: they enable string interpolation and multi-line strings, covered in the next lesson.

## Escape sequences

Use `\` to insert characters that would otherwise be hard to type:

```javascript
"line one\nline two";   // \n  newline
"a\tb";                 // \t  tab
'It\'s nice';           // \'  literal apostrophe
"She said \"hi\"";      // \"  literal quote
"a backslash: \\";      // \\  literal backslash
"\u00e9";               // 'é'  Unicode code point
"\u{1F600}";            // '😀' Unicode > U+FFFF
```

## String length

```javascript
"hello".length;  // 5
"".length;       // 0
"😀".length;     // 2  (!)
```

`length` counts **UTF-16 code units**, not user-visible characters. Most emoji and many CJK characters take two code units. To count *Unicode characters*:

```javascript
[..."😀hi"].length;            // 3
Array.from("😀hi").length;     // 3
```

## Indexing and slicing

```javascript
const s = "JavaScript";
s[0];               // "J"
s[s.length - 1];    // "t"
s.at(-1);           // "t"   (negative indexes — modern, preferred)

s.slice(0, 4);      // "Java"
s.slice(4);         // "Script"
s.slice(-6);        // "Script"

s.substring(0, 4);  // "Java"  (older; doesn't support negatives)
```

Strings cannot be mutated by index:

```javascript
const s = "abc";
s[0] = "Z";    // silently does nothing in strict mode this throws
console.log(s); // "abc"
```

## Concatenation

```javascript
"foo" + "bar";        // "foobar"
let s = "hi";
s += " there";        // "hi there"

["a", "b", "c"].join("-"); // "a-b-c"
```

For building strings from many pieces, prefer **template literals** (next lesson) or `Array.join` over long `+` chains — both are clearer and faster.

## Searching

```javascript
const s = "the quick brown fox";

s.includes("quick");    // true
s.startsWith("the");    // true
s.endsWith("fox");      // true

s.indexOf("o");         // 12   (-1 if not found)
s.lastIndexOf("o");     // 17

s.indexOf("cat");       // -1
```

## Case and trimming

```javascript
"Hello".toUpperCase();   // "HELLO"
"Hello".toLowerCase();   // "hello"

"  hi  ".trim();         // "hi"
"  hi  ".trimStart();    // "hi  "
"  hi  ".trimEnd();      // "  hi"
```

For locale-aware comparisons (German ß, Turkish dotted i, etc.) use `localeCompare`:

```javascript
"a".localeCompare("b"); // -1
"b".localeCompare("a"); //  1
"a".localeCompare("a"); //  0
```

## Replacing

```javascript
"a-b-c".replace("-", "_");        // "a_b-c"  — only the first match
"a-b-c".replaceAll("-", "_");     // "a_b_c"  — all matches
"abc".replace(/[abc]/g, "*");     // "***"    — regex with `g` flag
```

`replace` accepts a function for dynamic replacement:

```javascript
"hello world".replace(/\w+/g, (w) => w.toUpperCase()); // "HELLO WORLD"
```

## Splitting and joining

```javascript
"a,b,c".split(",");        // ["a", "b", "c"]
"a, b ,c".split(/\s*,\s*/); // ["a", "b", "c"]
"hello".split("");         // ["h", "e", "l", "l", "o"]   (broken for emoji)
[..."hello"];              // ["h", "e", "l", "l", "o"]

["one", "two", "three"].join(" - "); // "one - two - three"
```

## Repeating and padding

```javascript
"-".repeat(10);              // "----------"

"7".padStart(3, "0");        // "007"
"42".padEnd(5, ".");         // "42..."
```

## Comparing strings

```javascript
"abc" === "abc"; // true   — value equality
"abc" === "ABC"; // false  — case-sensitive
"a" < "b";       // true   — lexicographic, by code unit
"10" < "9";      // true   — strings, not numbers!
```

For natural ("human") sorting:

```javascript
["10", "1", "2"].sort((a, b) => Number(a) - Number(b)); // ["1", "2", "10"]
["b1", "a10", "a2"].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
// ["a2", "a10", "b1"]
```

## Converting to a string

```javascript
String(42);          // "42"
String(true);        // "true"
String(null);        // "null"
String(undefined);   // "undefined"
String([1, 2]);      // "1,2"
String({ a: 1 });    // "[object Object]"

(42).toString();     // "42"
(255).toString(16);  // "ff"
JSON.stringify({ a: 1 }); // '{"a":1}'
```

## Iterating

```javascript
for (const ch of "hi") {
  console.log(ch); // "h", "i"
}
```

`for…of` correctly handles surrogate pairs (multi-code-unit characters) — `for` with an index does not.

## Next step

The most useful way to build strings — template literals — gets a whole lesson next.
