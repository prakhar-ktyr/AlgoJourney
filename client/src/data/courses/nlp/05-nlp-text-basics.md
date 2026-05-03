---
title: Working with Text in Python
---

# Working with Text in Python

Before using any NLP library, you should master Python's built-in text processing capabilities. This lesson covers string operations, regular expressions, file handling, and Unicode — the essential toolkit for working with text data.

---

## Python String Operations for NLP

Python strings are your first tool for text processing. Let's explore the methods most useful for NLP:

### Case Conversion

```python
text = "Natural Language Processing is AMAZING!"

# Convert to lowercase (most common NLP preprocessing step)
print(text.lower())
# Output: natural language processing is amazing!

# Convert to uppercase
print(text.upper())
# Output: NATURAL LANGUAGE PROCESSING IS AMAZING!

# Title case (capitalize first letter of each word)
print(text.title())
# Output: Natural Language Processing Is Amazing!

# Swap case
print(text.swapcase())
# Output: nATURAL lANGUAGE pROCESSING IS amazing!
```

### Why Lowercase Matters in NLP

In most NLP tasks, "The", "the", and "THE" should be treated as the same word:

```python
words = ["The", "the", "THE", "cat", "Cat"]

# Without normalization: 5 unique tokens
print(f"Without lowercase: {len(set(words))} unique")

# With normalization: 2 unique tokens
normalized = [w.lower() for w in words]
print(f"With lowercase: {len(set(normalized))} unique")
```

**Output:**
```
Without lowercase: 5 unique
With lowercase: 2 unique
```

---

### Whitespace Handling

```python
# Messy text (common in real data)
messy = "   Hello,   World!   \n\t  "

# strip() - remove leading/trailing whitespace
print(f"'{messy.strip()}'")
# Output: 'Hello,   World!'

# lstrip() - remove leading whitespace only
print(f"'{messy.lstrip()}'")
# Output: 'Hello,   World!   \n\t  '

# rstrip() - remove trailing whitespace only
print(f"'{messy.rstrip()}'")
# Output: '   Hello,   World!'

# Normalize internal whitespace
import re
clean = re.sub(r'\s+', ' ', messy).strip()
print(f"'{clean}'")
# Output: 'Hello, World!'
```

---

### Splitting Text

```python
text = "Natural Language Processing is fun"

# split() - split on whitespace (default)
words = text.split()
print(words)
# Output: ['Natural', 'Language', 'Processing', 'is', 'fun']

# split(delimiter) - split on specific character
csv_line = "word1,word2,word3,word4"
items = csv_line.split(',')
print(items)
# Output: ['word1', 'word2', 'word3', 'word4']

# splitlines() - split on newlines
paragraph = "First sentence.\nSecond sentence.\nThird sentence."
lines = paragraph.splitlines()
print(lines)
# Output: ['First sentence.', 'Second sentence.', 'Third sentence.']

# maxsplit - limit number of splits
text = "one two three four five"
print(text.split(' ', 2))
# Output: ['one', 'two', 'three four five']
```

---

### Finding and Counting

```python
text = "NLP is great. NLP is powerful. NLP is everywhere."

# count() - count occurrences
print(f"'NLP' appears: {text.count('NLP')} times")
# Output: 'NLP' appears: 3 times

print(f"'is' appears: {text.count('is')} times")
# Output: 'is' appears: 3 times

# find() - find first occurrence (returns index, -1 if not found)
print(f"First 'NLP' at index: {text.find('NLP')}")
# Output: First 'NLP' at index: 0

print(f"First 'powerful' at index: {text.find('powerful')}")
# Output: First 'powerful' at index: 31

# rfind() - find last occurrence
print(f"Last 'NLP' at index: {text.rfind('NLP')}")
# Output: Last 'NLP' at index: 35

# in operator - check if substring exists
print(f"Contains 'great': {'great' in text}")
# Output: Contains 'great': True
```

---

### Replacing Text

```python
text = "I love cats. Cats are amazing. CATS rule!"

# replace() - replace all occurrences (case-sensitive)
print(text.replace("cats", "dogs"))
# Output: I love dogs. Cats are amazing. CATS rule!

# Case-insensitive replace (use re module)
import re
result = re.sub(r'cats', 'dogs', text, flags=re.IGNORECASE)
print(result)
# Output: I love dogs. dogs are amazing. dogs rule!

# Replace multiple patterns
contractions = {
    "don't": "do not",
    "can't": "cannot",
    "won't": "will not",
    "I'm": "I am",
    "it's": "it is",
}

sentence = "I'm sure it's true and I can't deny it"
for short, full in contractions.items():
    sentence = sentence.replace(short, full)
print(sentence)
# Output: I am sure it is true and I cannot deny it
```

---

### String Testing Methods

```python
# These are very useful for filtering tokens

words = ["Hello", "123", "hello123", "HELLO", "   ", "hello!"]

for word in words:
    print(f"'{word}':  alpha={word.isalpha():<6} "
          f"digit={word.isdigit():<6} "
          f"alnum={word.isalnum():<6} "
          f"space={word.isspace():<6}")
```

**Output:**
```
'Hello':  alpha=True   digit=False  alnum=True   space=False
'123':  alpha=False  digit=True   alnum=True   space=False
'hello123':  alpha=False  digit=False  alnum=True   space=False
'HELLO':  alpha=True   digit=False  alnum=True   space=False
'   ':  alpha=False  digit=False  alnum=False  space=True
'hello!':  alpha=False  digit=False  alnum=False  space=False
```

```python
# Practical use: filter tokens to keep only alphabetic words
tokens = ["Hello", "world", "!", "123", "NLP", "is", "#cool"]
clean_tokens = [t for t in tokens if t.isalpha()]
print(f"Clean tokens: {clean_tokens}")
# Output: Clean tokens: ['Hello', 'world', 'NLP', 'is']
```

---

### String Formatting for NLP Output

```python
# f-strings for formatted output
word = "processing"
freq = 42
total = 1000

# Percentage calculation
pct = (freq / total) * 100
print(f"'{word}' appears {freq} times ({pct:.1f}%)")
# Output: 'processing' appears 42 times (4.2%)

# Aligned output (great for tables)
data = [("the", 156), ("is", 98), ("NLP", 45), ("language", 32)]

print(f"{'Word':<15} {'Count':>6} {'Bar'}")
print("-" * 35)
for word, count in data:
    bar = "█" * (count // 10)
    print(f"{word:<15} {count:>6} {bar}")
```

**Output:**
```
Word              Count Bar
-----------------------------------
the                 156 ███████████████
is                   98 █████████
NLP                  45 ████
language             32 ███
```

---

## Regular Expressions for NLP

Regular expressions (regex) are **essential** for text processing. The `re` module is your Swiss Army knife for pattern matching.

### Basic Pattern Matching

```python
import re

text = "Contact us at support@example.com or sales@company.org"

# re.findall() - find all matches
emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
print(f"Emails found: {emails}")
# Output: Emails found: ['support@example.com', 'sales@company.org']

# re.search() - find first match
match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
if match:
    print(f"First email: {match.group()}")
    print(f"Position: {match.start()}-{match.end()}")
# Output: First email: support@example.com
#         Position: 14-34
```

### Common NLP Patterns

```python
import re

text = """
Visit https://www.example.com or http://nlp-course.org for more info.
Call 555-123-4567 or (555) 987-6543.
Prices: $19.99, $100, and $5.50.
Date: 2024-01-15 or 01/15/2024.
Email: user@domain.com
Hashtags: #NLP #MachineLearning #AI
"""

# URLs
urls = re.findall(r'https?://[\w\-./]+', text)
print(f"URLs: {urls}")

# Phone numbers
phones = re.findall(r'[\(]?\d{3}[\)]?[-.\s]?\d{3}[-.\s]?\d{4}', text)
print(f"Phones: {phones}")

# Dollar amounts
prices = re.findall(r'\$\d+\.?\d*', text)
print(f"Prices: {prices}")

# Dates (YYYY-MM-DD format)
dates = re.findall(r'\d{4}-\d{2}-\d{2}', text)
print(f"Dates: {dates}")

# Hashtags
hashtags = re.findall(r'#\w+', text)
print(f"Hashtags: {hashtags}")

# Words only (no punctuation or numbers)
words = re.findall(r'\b[a-zA-Z]+\b', text)
print(f"Words (first 10): {words[:10]}")
```

**Output:**
```
URLs: ['https://www.example.com', 'http://nlp-course.org']
Phones: ['555-123-4567', '(555) 987-6543']
Prices: ['$19.99', '$100', '$5.50']
Dates: ['2024-01-15']
Hashtags: ['#NLP', '#MachineLearning', '#AI']
Words (first 10): ['Visit', 'www', 'example', 'com', 'or', 'http', 'nlp', 'course', 'org', 'for']
```

### re.sub() — Search and Replace

```python
import re

text = "Call me at 555-123-4567 or email john.doe@email.com"

# Redact personal information
redacted = re.sub(r'\d{3}[-.]?\d{3}[-.]?\d{4}', '[PHONE]', text)
redacted = re.sub(r'[\w.+-]+@[\w-]+\.[\w.-]+', '[EMAIL]', redacted)
print(redacted)
# Output: Call me at [PHONE] or email [EMAIL]

# Remove extra whitespace
messy = "Too    many     spaces    here"
clean = re.sub(r'\s+', ' ', messy)
print(clean)
# Output: Too many spaces here

# Remove HTML tags
html = "<p>Hello <b>World</b></p>"
plain = re.sub(r'<[^>]+>', '', html)
print(plain)
# Output: Hello World

# Remove punctuation
sentence = "Hello, World! How's it going?"
no_punct = re.sub(r'[^\w\s]', '', sentence)
print(no_punct)
# Output: Hello World Hows it going
```

### Regex Quick Reference

| Pattern | Matches | Example |
|---------|---------|---------|
| `\d` | Any digit | `\d+` matches "123" |
| `\w` | Word character (letter, digit, _) | `\w+` matches "hello_2" |
| `\s` | Whitespace | `\s+` matches spaces, tabs |
| `\b` | Word boundary | `\bcat\b` matches "cat" not "cats" |
| `.` | Any character (except newline) | `a.b` matches "acb" |
| `*` | Zero or more | `ab*` matches "a", "ab", "abb" |
| `+` | One or more | `ab+` matches "ab", "abb" |
| `?` | Zero or one | `colou?r` matches "color", "colour" |
| `{n,m}` | Between n and m times | `\d{2,4}` matches "12", "1234" |
| `[abc]` | Character class | `[aeiou]` matches vowels |
| `[^abc]` | Negated class | `[^0-9]` matches non-digits |
| `(...)` | Capture group | `(\w+)@(\w+)` captures parts |
| `|` | Alternation (OR) | `cat|dog` matches either |

---

## Reading Text Files

NLP often starts with reading text from files:

### Basic File Reading

```python
# Reading an entire file
with open('sample.txt', 'r', encoding='utf-8') as f:
    content = f.read()
print(f"File length: {len(content)} characters")

# Reading line by line (memory efficient for large files)
with open('sample.txt', 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        print(f"Line {line_num}: {line.strip()}")

# Reading all lines into a list
with open('sample.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f"Total lines: {len(lines)}")
```

### Processing Large Text Files

```python
def process_large_file(filepath, chunk_size=1024*1024):
    """Process a large text file in chunks (1MB at a time)."""
    word_count = 0
    char_count = 0
    line_count = 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line_count += 1
            char_count += len(line)
            word_count += len(line.split())
    
    return {
        'lines': line_count,
        'words': word_count,
        'characters': char_count
    }

# Example usage:
# stats = process_large_file('large_corpus.txt')
# print(f"Lines: {stats['lines']:,}")
# print(f"Words: {stats['words']:,}")
# print(f"Characters: {stats['characters']:,}")
```

### Reading Multiple Files

```python
import os

def read_corpus(directory):
    """Read all .txt files from a directory into a list."""
    documents = []
    
    for filename in sorted(os.listdir(directory)):
        if filename.endswith('.txt'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
                documents.append({
                    'filename': filename,
                    'text': text,
                    'word_count': len(text.split())
                })
    
    return documents

# Example:
# corpus = read_corpus('data/raw/')
# print(f"Loaded {len(corpus)} documents")
# for doc in corpus[:3]:
#     print(f"  {doc['filename']}: {doc['word_count']} words")
```

---

## Unicode and Encoding

Text encoding is critical for NLP — especially when working with multiple languages.

### Understanding UTF-8

```python
# UTF-8 can represent any character in any language
text_examples = {
    'English': 'Hello, World!',
    'Spanish': '¡Hola, Mundo!',
    'Chinese': '你好世界',
    'Arabic': 'مرحبا بالعالم',
    'Japanese': 'こんにちは世界',
    'Korean': '안녕하세요 세계',
    'Emoji': '🌍🤖📚✨',
}

for lang, text in text_examples.items():
    byte_len = len(text.encode('utf-8'))
    print(f"{lang:<10}: {text:<20} (chars: {len(text)}, bytes: {byte_len})")
```

**Output:**
```
English   : Hello, World!        (chars: 13, bytes: 13)
Spanish   : ¡Hola, Mundo!        (chars: 13, bytes: 14)
Chinese   : 你好世界               (chars: 4, bytes: 12)
Arabic    : مرحبا بالعالم          (chars: 12, bytes: 22)
Japanese  : こんにちは世界           (chars: 7, bytes: 21)
Korean    : 안녕하세요 세계          (chars: 8, bytes: 22)
Emoji     : 🌍🤖📚✨              (chars: 4, bytes: 16)
```

### Handling Encoding Errors

```python
# Common encoding issues and solutions

# Problem: reading a file with wrong encoding
# Solution: specify the correct encoding
with open('file.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# If encoding is unknown, try to detect it:
# pip install chardet
# import chardet
# with open('mystery.txt', 'rb') as f:
#     result = chardet.detect(f.read())
#     print(result)  # {'encoding': 'utf-8', 'confidence': 0.99}

# Handle errors gracefully
text_with_errors = b'Hello \xff World'

# Option 1: Replace bad characters
decoded = text_with_errors.decode('utf-8', errors='replace')
print(f"Replace: {decoded}")
# Output: Hello � World

# Option 2: Ignore bad characters
decoded = text_with_errors.decode('utf-8', errors='ignore')
print(f"Ignore: {decoded}")
# Output: Hello  World
```

### Normalizing Unicode

```python
import unicodedata

# Different representations of the same character
# "é" can be stored as one character or two (e + combining accent)
word1 = "café"           # Single character é
word2 = "cafe\u0301"     # e + combining acute accent

print(f"word1: {word1} (len={len(word1)})")
print(f"word2: {word2} (len={len(word2)})")
print(f"Equal? {word1 == word2}")

# Normalize to canonical form
norm1 = unicodedata.normalize('NFC', word1)
norm2 = unicodedata.normalize('NFC', word2)
print(f"After NFC normalization equal? {norm1 == norm2}")
```

**Output:**
```
word1: café (len=4)
word2: café (len=5)
Equal? False
After NFC normalization equal? True
```

### Removing Accents/Diacritics

```python
import unicodedata

def remove_accents(text):
    """Remove accents/diacritics from text."""
    # Decompose characters into base + combining marks
    nfkd = unicodedata.normalize('NFKD', text)
    # Keep only non-combining characters
    return ''.join(c for c in nfkd if not unicodedata.combining(c))

examples = ["café", "naïve", "résumé", "über", "señor"]
for word in examples:
    print(f"{word:<10} → {remove_accents(word)}")
```

**Output:**
```
café       → cafe
naïve      → naive
résumé     → resume
über       → uber
señor      → senor
```

---

## Building a Text Cleaning Pipeline

Let's put it all together into a reusable text cleaning pipeline:

```python
import re
import string
import unicodedata


def clean_text(text, lowercase=True, remove_urls=True, 
               remove_emails=True, remove_numbers=False,
               remove_punctuation=True, remove_extra_spaces=True,
               remove_accents=False):
    """
    Clean text for NLP processing.
    
    Parameters:
        text (str): Input text to clean
        lowercase (bool): Convert to lowercase
        remove_urls (bool): Remove URLs
        remove_emails (bool): Remove email addresses
        remove_numbers (bool): Remove all numbers
        remove_punctuation (bool): Remove punctuation
        remove_extra_spaces (bool): Collapse multiple spaces
        remove_accents (bool): Remove diacritical marks
    
    Returns:
        str: Cleaned text
    """
    # Remove URLs
    if remove_urls:
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove emails
    if remove_emails:
        text = re.sub(r'[\w.+-]+@[\w-]+\.[\w.-]+', '', text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Handle Unicode normalization
    text = unicodedata.normalize('NFC', text)
    
    # Remove accents if requested
    if remove_accents:
        nfkd = unicodedata.normalize('NFKD', text)
        text = ''.join(c for c in nfkd if not unicodedata.combining(c))
    
    # Lowercase
    if lowercase:
        text = text.lower()
    
    # Remove numbers
    if remove_numbers:
        text = re.sub(r'\d+', '', text)
    
    # Remove punctuation
    if remove_punctuation:
        text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove extra whitespace
    if remove_extra_spaces:
        text = re.sub(r'\s+', ' ', text).strip()
    
    return text


# --- Demo: Clean messy real-world text ---
messy_text = """
    Check out https://www.nlp-course.com for more info!!!
    Contact: admin@nlp-course.com    
    
    <p>NLP is AMAZING — it powers Google's search,
    Apple's Siri, and   OpenAI's ChatGPT.</p>
    
    Price: $99.99 (50% off!!!)
    
    #NLP #AI #MachineLearning @nlp_guru
"""

print("=== Original Text ===")
print(messy_text)

print("=== Cleaned Text ===")
cleaned = clean_text(messy_text)
print(cleaned)

print("\n=== Cleaned (keep numbers) ===")
cleaned2 = clean_text(messy_text, remove_numbers=False)
print(cleaned2)
```

**Output:**
```
=== Original Text ===

    Check out https://www.nlp-course.com for more info!!!
    Contact: admin@nlp-course.com    
    ...

=== Cleaned Text ===
check out for more info contact nlp is amazing  it powers googles search apples siri and openais chatgpt price off nlp ai machinelearning nlpguru

=== Cleaned (keep numbers) ===
check out for more info contact nlp is amazing  it powers googles search apples siri and openais chatgpt price 9999 50 off nlp ai machinelearning nlpguru
```

### Complete Pipeline: From Raw Text to Tokens

```python
def text_to_tokens(text, min_length=2, stop_words=None):
    """
    Complete pipeline: raw text → clean tokens.
    
    Parameters:
        text (str): Raw input text
        min_length (int): Minimum token length to keep
        stop_words (set): Words to remove (optional)
    
    Returns:
        list: Clean tokens ready for NLP
    """
    if stop_words is None:
        stop_words = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does',
            'did', 'will', 'would', 'could', 'should', 'may',
            'might', 'shall', 'can', 'need', 'dare', 'ought',
            'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
            'by', 'from', 'as', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between',
            'and', 'but', 'or', 'nor', 'not', 'so', 'yet',
            'both', 'either', 'neither', 'each', 'every',
            'this', 'that', 'these', 'those', 'it', 'its',
            'i', 'me', 'my', 'we', 'our', 'you', 'your',
            'he', 'him', 'his', 'she', 'her', 'they', 'them',
        }
    
    # Step 1: Clean the text
    cleaned = clean_text(text)
    
    # Step 2: Tokenize (split into words)
    tokens = cleaned.split()
    
    # Step 3: Filter tokens
    filtered = [
        token for token in tokens
        if len(token) >= min_length       # Remove very short words
        and token not in stop_words       # Remove stop words
        and token.isalpha()               # Keep only alphabetic tokens
    ]
    
    return filtered


# --- Demo ---
sample = """
Natural Language Processing (NLP) is a subfield of artificial 
intelligence that focuses on the interaction between computers 
and humans through natural language. The ultimate goal of NLP 
is to enable computers to understand, interpret, and generate 
human language in a way that is both meaningful and useful.
"""

tokens = text_to_tokens(sample)
print(f"Raw text length: {len(sample)} chars")
print(f"Clean tokens: {len(tokens)}")
print(f"Tokens: {tokens}")
```

**Output:**
```
Raw text length: 328 chars
Clean tokens: 17
Tokens: ['natural', 'language', 'processing', 'nlp', 'subfield', 'artificial', 'intelligence', 'focuses', 'interaction', 'computers', 'humans', 'natural', 'language', 'ultimate', 'goal', 'nlp', 'enable']
```

---

## String Operations at Scale

When processing millions of documents, efficiency matters:

```python
import time

# Technique 1: Join is faster than concatenation
words = ["hello"] * 100000

# Slow: string concatenation
start = time.time()
result = ""
for w in words:
    result += w + " "
slow_time = time.time() - start

# Fast: join
start = time.time()
result = " ".join(words)
fast_time = time.time() - start

print(f"Concatenation: {slow_time:.4f}s")
print(f"Join:          {fast_time:.4f}s")
print(f"Speedup:       {slow_time/fast_time:.1f}x")
```

```python
# Technique 2: Compile regex patterns for reuse
import re

# If using the same pattern many times, compile it first
email_pattern = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')
url_pattern = re.compile(r'https?://\S+')

documents = [
    "Email me at test@example.com",
    "Visit https://nlp.org for more",
    "Contact support@help.io today",
] * 10000

# Using compiled pattern (faster for repeated use)
start = time.time()
for doc in documents:
    emails = email_pattern.findall(doc)
compiled_time = time.time() - start

# Using re.findall directly (recompiles each time)
start = time.time()
for doc in documents:
    emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', doc)
direct_time = time.time() - start

print(f"Compiled regex: {compiled_time:.4f}s")
print(f"Direct regex:   {direct_time:.4f}s")
```

```python
# Technique 3: Use str.translate for fast character removal
import string

text = "Hello, World! This is a test... #NLP @AI $100"

# Method 1: re.sub (slower)
clean1 = re.sub(r'[^\w\s]', '', text)

# Method 2: str.translate (faster)
translator = str.maketrans('', '', string.punctuation)
clean2 = text.translate(translator)

print(f"re.sub result:     '{clean1}'")
print(f"translate result:  '{clean2}'")
# Both produce: 'Hello World This is a test NLP AI 100'
```

---

## Summary

In this lesson, you mastered:

| Topic | Key Methods |
|-------|-------------|
| Case conversion | `lower()`, `upper()`, `title()` |
| Whitespace | `strip()`, `split()`, `splitlines()` |
| Search | `find()`, `count()`, `in` operator |
| Replace | `replace()`, `re.sub()` |
| Testing | `isalpha()`, `isdigit()`, `isalnum()` |
| Regex | `re.findall()`, `re.sub()`, `re.search()` |
| File I/O | `open()`, `read()`, encoding parameter |
| Unicode | `unicodedata.normalize()`, UTF-8 |
| Pipeline | Combined cleaning → tokenization → filtering |

---

## Key Takeaways

1. **Always lowercase** text before comparison in NLP
2. **Use regex** for pattern-based extraction (emails, URLs, etc.)
3. **Always specify encoding** (`encoding='utf-8'`) when reading files
4. **Build reusable pipelines** — you'll clean text in every NLP project
5. **Compile regex patterns** when using them repeatedly
6. **Use `str.translate()`** for fastest character removal

---

## Practice Exercises

1. Write a function that extracts all hashtags from a tweet
2. Build a word frequency counter that ignores stop words
3. Create a function that redacts all personal information (names, emails, phones) from text
4. Write a pipeline that converts HTML to plain text

---

*← Previous: Python Setup for NLP | Next: Tokenization →*
