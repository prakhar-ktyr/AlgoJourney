---
title: Regular Expressions for NLP
---

# Regular Expressions for NLP

Regular expressions (regex) are powerful pattern-matching tools that every NLP practitioner needs in their toolkit. They let you find, extract, and transform text using concise pattern descriptions.

---

## Why Regex in NLP?

Before reaching for machine learning, many NLP tasks can be solved with well-crafted regex patterns:

- **Information extraction** — emails, URLs, phone numbers, dates, prices
- **Text cleaning** — removing HTML tags, special characters, extra whitespace
- **Tokenization** — splitting text into words or sentences
- **Validation** — checking input format before processing

---

## Regex Quick Review

Here are the essential regex building blocks:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `.` | Any character (except newline) | `h.t` matches "hat", "hit" |
| `\d` | Any digit [0-9] | `\d+` matches "123" |
| `\w` | Word character [a-zA-Z0-9_] | `\w+` matches "hello" |
| `\s` | Whitespace (space, tab, newline) | `\s+` matches spaces |
| `*` | Zero or more | `ab*` matches "a", "ab", "abb" |
| `+` | One or more | `ab+` matches "ab", "abb" |
| `?` | Zero or one | `colou?r` matches "color", "colour" |
| `{n,m}` | Between n and m times | `\d{2,4}` matches "12", "1234" |
| `[]` | Character class | `[aeiou]` matches vowels |
| `^` | Start of string | `^Hello` matches "Hello world" |
| `$` | End of string | `world$` matches "Hello world" |
| `\b` | Word boundary | `\bcat\b` matches "cat" not "category" |

---

## Python's re Module

Python's `re` module provides all the regex functions you need:

```python
import re

text = "Contact us at support@example.com or sales@company.org"

# re.findall — find all matches
emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
print(emails)
# ['support@example.com', 'sales@company.org']

# re.search — find first match
match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
if match:
    print(match.group())  # 'support@example.com'
    print(match.span())   # (14, 33)

# re.sub — replace matches
cleaned = re.sub(r'[\w.+-]+@[\w-]+\.[\w.-]+', '[EMAIL]', text)
print(cleaned)
# 'Contact us at [EMAIL] or [EMAIL]'

# re.split — split by pattern
parts = re.split(r'\s+at\s+|\s+or\s+', text)
print(parts)
# ['Contact us', 'support@example.com', 'sales@company.org']
```

---

## Common NLP Extraction Patterns

### Extracting Emails

```python
import re

text = """
Please reach out to john.doe@gmail.com for inquiries.
Technical support: tech-support@company.co.uk
Sales team: sales+info@startup.io
"""

email_pattern = r'[\w.+-]+@[\w-]+\.[\w.-]+'
emails = re.findall(email_pattern, text)
print(emails)
# ['john.doe@gmail.com', 'tech-support@company.co.uk', 'sales+info@startup.io']
```

### Extracting URLs

```python
text = """
Visit https://www.example.com for more info.
Documentation at http://docs.api.org/v2/guide
Also check ftp://files.server.net/data
"""

url_pattern = r'https?://[\w./\-?=&#%]+'
urls = re.findall(url_pattern, text)
print(urls)
# ['https://www.example.com', 'http://docs.api.org/v2/guide']
```

### Extracting Phone Numbers

```python
text = """
Call us: (555) 123-4567
International: +1-800-555-0199
Mobile: 555.867.5309
Simple: 5551234567
"""

phone_pattern = r'[\+]?[\d\-\.\(\)\s]{7,15}\d'
phones = re.findall(phone_pattern, text)
print([p.strip() for p in phones])
# ['(555) 123-4567', '+1-800-555-0199', '555.867.5309', '5551234567']
```

### Extracting Dates

```python
text = """
Meeting on 2024-03-15.
Deadline: 03/15/2024
Published January 5, 2024.
Due: 15-Mar-2024
"""

# ISO format: YYYY-MM-DD
iso_dates = re.findall(r'\d{4}-\d{2}-\d{2}', text)
print(iso_dates)  # ['2024-03-15']

# US format: MM/DD/YYYY
us_dates = re.findall(r'\d{2}/\d{2}/\d{4}', text)
print(us_dates)  # ['03/15/2024']

# Written format: Month DD, YYYY
written_dates = re.findall(r'[A-Z][a-z]+ \d{1,2}, \d{4}', text)
print(written_dates)  # ['January 5, 2024']
```

### Extracting Prices

```python
text = """
The product costs $19.99.
Premium version: $149.00
Budget option at $5 or EUR 4.50
Sale price: £29.95
"""

price_pattern = r'[$€£]\s?\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s?(?:USD|EUR|GBP)'
prices = re.findall(price_pattern, text)
print(prices)
# ['$19.99', '$149.00', '$5', '£29.95']
```

---

## Token Patterns for NLP

### Word Tokenization

```python
text = "Dr. Smith's analysis (2024) shows NLP isn't hard—it's fun!"

# Simple split misses a lot
print(text.split())
# ["Dr.", "Smith's", "analysis", "(2024)", "shows", "NLP", "isn't", "hard—it's", "fun!"]

# Better: regex tokenization
tokens = re.findall(r"\b\w+(?:'\w+)?\b", text)
print(tokens)
# ['Dr', "Smith's", 'analysis', '2024', 'shows', 'NLP', "isn't", 'hard', "it's", 'fun']
```

### Sentence Segmentation

```python
text = "Dr. Smith went to Washington. He arrived at 3 p.m. It was sunny."

# Naive split on '.' fails with abbreviations
# Better approach: split on period + space + capital letter
sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
print(sentences)
# ['Dr. Smith went to Washington.', 'He arrived at 3 p.m.', 'It was sunny.']
```

### Handling Abbreviations

```python
text = "The U.S.A. and U.K. signed the agreement on Jan. 5th."

# Match abbreviations (letters separated by periods)
abbreviations = re.findall(r'\b(?:[A-Z]\.){2,}', text)
print(abbreviations)  # ['U.S.A.', 'U.K.']
```

---

## Text Cleaning with Regex

### Removing HTML Tags

```python
html_text = "<p>Hello <b>world</b>! Visit <a href='url'>here</a>.</p>"

clean = re.sub(r'<[^>]+>', '', html_text)
print(clean)  # 'Hello world! Visit here.'
```

### Normalizing Whitespace

```python
messy = "  Too   many    spaces\t\tand\ttabs\n\nnewlines  "

# Replace multiple whitespace with single space
clean = re.sub(r'\s+', ' ', messy).strip()
print(clean)  # 'Too many spaces and tabs newlines'
```

### Removing Special Characters

```python
text = "Hello!!! How are you??? I'm fine... #blessed @world"

# Keep only letters, numbers, spaces, and basic punctuation
clean = re.sub(r'[^a-zA-Z0-9\s.,!?\'-]', '', text)
print(clean)  # "Hello!!! How are you??? I'm fine... blessed world"

# Remove repeated punctuation
clean = re.sub(r'([!?.])\1+', r'\1', clean)
print(clean)  # "Hello! How are you? I'm fine. blessed world"
```

### Removing URLs and Emails from Text

```python
tweet = "Check out https://t.co/abc123 and email me@example.com #NLP"

# Remove URLs
no_urls = re.sub(r'https?://\S+', '', tweet)
# Remove emails
no_emails = re.sub(r'\S+@\S+\.\S+', '', no_urls)
# Remove hashtags
no_hashtags = re.sub(r'#\w+', '', no_emails)
# Clean up whitespace
clean = re.sub(r'\s+', ' ', no_hashtags).strip()
print(clean)  # 'Check out and email me'
```

---

## Named Groups for Structured Extraction

Named groups `(?P<name>...)` let you extract structured data from text:

```python
text = """
Order #12345 placed on 2024-03-15 for $99.99
Order #67890 placed on 2024-04-01 for $149.50
"""

pattern = r'Order #(?P<order_id>\d+) placed on (?P<date>\d{4}-\d{2}-\d{2}) for \$(?P<amount>[\d.]+)'

for match in re.finditer(pattern, text):
    print(f"Order: {match.group('order_id')}")
    print(f"Date: {match.group('date')}")
    print(f"Amount: ${match.group('amount')}")
    print("---")
# Order: 12345
# Date: 2024-03-15
# Amount: $99.99
# ---
# Order: 67890
# Date: 2024-04-01
# Amount: $149.50
# ---
```

### Extracting Structured Entities

```python
text = """
John Smith (Age: 34, City: New York)
Jane Doe (Age: 28, City: San Francisco)
"""

pattern = r'(?P<name>[A-Z][a-z]+ [A-Z][a-z]+) \(Age: (?P<age>\d+), City: (?P<city>[^)]+)\)'

people = [match.groupdict() for match in re.finditer(pattern, text)]
print(people)
# [{'name': 'John Smith', 'age': '34', 'city': 'New York'},
#  {'name': 'Jane Doe', 'age': '28', 'city': 'San Francisco'}]
```

---

## spaCy Rule-Based Matching

For more complex patterns, spaCy's `Matcher` and `PhraseMatcher` go beyond pure regex:

### Token Matcher

```python
import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Pattern: adjective + noun (e.g., "big house", "fast car")
pattern = [{"POS": "ADJ"}, {"POS": "NOUN"}]
matcher.add("ADJ_NOUN", [pattern])

doc = nlp("The quick brown fox jumped over the lazy dog.")
matches = matcher(doc)

for match_id, start, end in matches:
    span = doc[start:end]
    print(f"Found: {span.text}")
# Found: quick brown
# Found: lazy dog
```

### PhraseMatcher for Exact Phrases

```python
from spacy.matcher import PhraseMatcher

nlp = spacy.load("en_core_web_sm")
phrase_matcher = PhraseMatcher(nlp.vocab)

# Add technical terms to match
terms = ["machine learning", "natural language processing", "deep learning"]
patterns = [nlp.make_doc(term) for term in terms]
phrase_matcher.add("TECH_TERMS", patterns)

doc = nlp("We use machine learning and natural language processing in our project.")
matches = phrase_matcher(doc)

for match_id, start, end in matches:
    print(f"Found: {doc[start:end].text}")
# Found: machine learning
# Found: natural language processing
```

---

## When Regex Beats ML (and Vice Versa)

### Use Regex When:

| Scenario | Example |
|----------|---------|
| Pattern is well-defined | Email addresses, phone numbers |
| Rules are strict | Date formats, ZIP codes |
| Speed is critical | Real-time filtering |
| Training data is unavailable | Quick prototyping |
| 100% precision needed | Input validation |

### Use ML When:

| Scenario | Example |
|----------|---------|
| Patterns are fuzzy | Sentiment, intent detection |
| Context matters | Word sense disambiguation |
| Language varies | Informal text, typos |
| Rules would be too complex | Named entity recognition |
| Generalization is needed | New/unseen patterns |

---

## Comprehensive NLP Regex Toolkit

```python
import re
from collections import Counter

class NLPRegexToolkit:
    """A collection of regex-based NLP utilities."""

    # Compiled patterns for performance
    EMAIL_PATTERN = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')
    URL_PATTERN = re.compile(r'https?://[\w./\-?=&#%]+')
    PHONE_PATTERN = re.compile(r'[\+]?[(]?\d{1,4}[)]?[-\s./]?\d{1,4}[-\s./]?\d{1,9}')
    DATE_ISO = re.compile(r'\d{4}-\d{2}-\d{2}')
    PRICE_PATTERN = re.compile(r'[$€£]\s?\d+(?:[.,]\d{2})?')
    HASHTAG_PATTERN = re.compile(r'#\w+')
    MENTION_PATTERN = re.compile(r'@\w+')

    @staticmethod
    def extract_emails(text):
        """Extract all email addresses from text."""
        return NLPRegexToolkit.EMAIL_PATTERN.findall(text)

    @staticmethod
    def extract_urls(text):
        """Extract all URLs from text."""
        return NLPRegexToolkit.URL_PATTERN.findall(text)

    @staticmethod
    def extract_prices(text):
        """Extract all prices from text."""
        return NLPRegexToolkit.PRICE_PATTERN.findall(text)

    @staticmethod
    def extract_hashtags(text):
        """Extract all hashtags from text."""
        return NLPRegexToolkit.HASHTAG_PATTERN.findall(text)

    @staticmethod
    def clean_text(text, lowercase=True, remove_urls=True,
                   remove_emails=True, remove_special=True):
        """Clean text for NLP processing."""
        if remove_urls:
            text = NLPRegexToolkit.URL_PATTERN.sub('', text)
        if remove_emails:
            text = NLPRegexToolkit.EMAIL_PATTERN.sub('', text)
        if remove_special:
            text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        if lowercase:
            text = text.lower()
        return text

    @staticmethod
    def tokenize(text):
        """Simple regex-based word tokenization."""
        return re.findall(r"\b\w+(?:'\w+)?\b", text.lower())

    @staticmethod
    def sentence_split(text):
        """Split text into sentences."""
        return re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)


# Usage example
text = """
Check out https://nlp-course.com for lessons!
Email: student@university.edu
Price: $49.99 #NLPcourse @instructor
Meeting on 2024-03-15.
"""

toolkit = NLPRegexToolkit()
print("Emails:", toolkit.extract_emails(text))
print("URLs:", toolkit.extract_urls(text))
print("Prices:", toolkit.extract_prices(text))
print("Hashtags:", toolkit.extract_hashtags(text))
print("Cleaned:", toolkit.clean_text(text))
print("Tokens:", toolkit.tokenize(text))
```

---

## Try It Yourself

1. Write a regex to extract all capitalized words (potential proper nouns) from a paragraph
2. Create a pattern that matches ISO dates AND US-format dates
3. Build a text cleaner that preserves sentence structure but removes all noise
4. Use named groups to parse structured log entries

---

## Summary

- **Regex** is essential for rule-based text processing in NLP
- **`re.findall`** extracts all matches; **`re.sub`** replaces; **`re.split`** divides
- **Named groups** enable structured extraction from text
- **Compile patterns** with `re.compile()` for better performance
- **spaCy Matcher** extends regex with linguistic patterns (POS, lemma, shape)
- Use regex for **well-defined patterns**; use ML for **fuzzy/contextual** tasks

Next, we'll explore Bag of Words — turning text into numerical vectors!
