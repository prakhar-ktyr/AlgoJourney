---
title: Text Normalization
---

# Text Normalization

**Text normalization** is the process of transforming text into a consistent, standardized form. It reduces variation so that words which mean the same thing are treated identically by your NLP system.

---

## What Is Normalization?

Raw text is messy and inconsistent:

```
"HELLO World!"     →  "hello world"
"I can't do it"    →  "i cannot do it"
"café"             →  "cafe"
"Visit http://x.y" →  "visit"
"   too   many   spaces   " → "too many spaces"
```

**Normalization** makes text uniform so that variations don't confuse your model.

> **Key Principle:** The goal is to reduce unnecessary variation while preserving meaning relevant to your task.

---

## Why Normalize?

Without normalization, your model sees these as completely different:

- "Hello", "hello", "HELLO", "hElLo" → 4 different tokens
- "don't", "do not", "dont" → 3 different representations
- "café", "cafe" → 2 different words

This wastes vocabulary space and makes it harder to learn patterns.

**With normalization:**

- All case variants → one token
- All contraction variants → one form
- Accented and non-accented → one form

---

## Lowercasing

The simplest normalization: convert all text to lowercase.

### When to Lowercase

```python
text = "Apple released the new iPhone in New York"
lowered = text.lower()
print(lowered)
# Output: "apple released the new iphone in new york"
```

**Good for:**
- Sentiment analysis ("AMAZING" and "amazing" = same sentiment)
- Topic classification
- Search engines
- Most general NLP tasks

### When NOT to Lowercase

| Task | Why Keep Case |
|------|---------------|
| Named Entity Recognition | "Apple" (company) vs "apple" (fruit) |
| Machine Translation | German nouns are capitalized |
| Acronym detection | "US" (country) vs "us" (pronoun) |
| Proper noun extraction | "May" (name/month) vs "may" (might) |

```python
# Case-sensitive matters for NER:
text1 = "Apple stock rose today"      # Company
text2 = "I ate an apple today"        # Fruit

# After lowercasing, both become:
# "apple stock rose today"
# "i ate an apple today"
# The model loses the ability to distinguish them by case!
```

### Smart Casing

A compromise — lowercase most text but keep known entities:

```python
def smart_lower(text, preserve_entities=None):
    """Lowercase text but preserve specified entities."""
    if preserve_entities is None:
        preserve_entities = set()

    words = text.split()
    result = []
    for word in words:
        if word in preserve_entities:
            result.append(word)
        else:
            result.append(word.lower())
    return " ".join(result)


entities = {"Apple", "iPhone", "New York", "NASA"}
text = "Apple released the new iPhone near NASA"
print(smart_lower(text, entities))
# Output: "Apple released the new iPhone near NASA"
```

---

## Removing Punctuation

Strip punctuation marks that don't add meaning for your task.

```python
import re
import string


def remove_punctuation(text):
    """Remove all punctuation from text."""
    return text.translate(str.maketrans("", "", string.punctuation))


text = "Hello, world! How's it going? Great... I think."
cleaned = remove_punctuation(text)
print(cleaned)
# Output: "Hello world Hows it going Great I think"
```

### Selective Punctuation Removal

Sometimes you want to keep certain punctuation:

```python
def remove_punctuation_selective(text, keep=None):
    """Remove punctuation except specified characters."""
    if keep is None:
        keep = set()

    punct_to_remove = set(string.punctuation) - set(keep)
    translator = str.maketrans("", "", "".join(punct_to_remove))
    return text.translate(translator)


text = "The price is $45.99! Email: user@site.com"

# Keep $ and @ (useful for financial or email data)
print(remove_punctuation_selective(text, keep={"$", "@", "."}))
# Output: "The price is $45.99 Email user@site.com"
```

### When to Keep Punctuation

| Punctuation | Keep When |
|-------------|-----------|
| `!` `?` | Sentiment analysis (emphasis) |
| `$` `€` `£` | Financial text |
| `@` | Social media (mentions) |
| `#` | Social media (hashtags) |
| `.` | Abbreviations, decimal numbers |
| `-` | Hyphenated words, negative numbers |
| `'` | Contractions |

---

## Removing Numbers

Numbers may or may not be relevant depending on your task.

```python
def remove_numbers(text):
    """Remove all standalone numbers."""
    return re.sub(r"\b\d+\b", "", text)


def replace_numbers(text, replacement="<NUM>"):
    """Replace numbers with a placeholder token."""
    return re.sub(r"\b\d+\.?\d*\b", replacement, text)


def normalize_numbers(text):
    """Normalize numbers: replace with generic placeholders."""
    # Replace currency amounts
    text = re.sub(r"\$\d+\.?\d*", "<MONEY>", text)
    # Replace percentages
    text = re.sub(r"\d+\.?\d*%", "<PERCENT>", text)
    # Replace dates (simple patterns)
    text = re.sub(r"\d{1,2}/\d{1,2}/\d{2,4}", "<DATE>", text)
    # Replace remaining numbers
    text = re.sub(r"\b\d+\.?\d*\b", "<NUM>", text)
    return text


text = "The stock rose 5% to $142.50 on 3/15/2024 with 1000 trades"

print(f"Original:   {text}")
print(f"Removed:    {remove_numbers(text)}")
print(f"Replaced:   {replace_numbers(text)}")
print(f"Normalized: {normalize_numbers(text)}")
```

**Output:**

```
Original:   The stock rose 5% to $142.50 on 3/15/2024 with 1000 trades
Removed:    The stock rose % to $. on // with  trades
Replaced:   The stock rose <NUM>% to $<NUM> on <NUM>/<NUM>/<NUM> with <NUM> trades
Normalized: The stock rose <PERCENT> to <MONEY> on <DATE> with <NUM> trades
```

---

## Removing Special Characters

Remove characters that aren't letters, numbers, or whitespace.

```python
def remove_special_characters(text, keep_spaces=True):
    """Remove special characters, optionally keeping spaces."""
    if keep_spaces:
        return re.sub(r"[^a-zA-Z0-9\s]", "", text)
    else:
        return re.sub(r"[^a-zA-Z0-9]", "", text)


text = "Hello!!! @user #NLP is great 🎉 — right?"
print(remove_special_characters(text))
# Output: "Hello user NLP is great  right"
```

### Handling Emoji

Emoji can carry meaning (especially in social media):

```python
def remove_emoji(text):
    """Remove emoji characters from text."""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # Emoticons
        "\U0001F300-\U0001F5FF"  # Symbols & pictographs
        "\U0001F680-\U0001F6FF"  # Transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # Flags
        "\U00002702-\U000027B0"  # Dingbats
        "\U000024C2-\U0001F251"  # Enclosed characters
        "]+",
        flags=re.UNICODE,
    )
    return emoji_pattern.sub("", text)


def replace_emoji(text, replacement=" <EMOJI> "):
    """Replace emoji with a placeholder."""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE,
    )
    return emoji_pattern.sub(replacement, text)


text = "This is amazing! 🎉🔥 Love it ❤️"
print(f"Remove emoji: {remove_emoji(text)}")
print(f"Replace emoji: {replace_emoji(text)}")
```

---

## Expanding Contractions

Convert contractions to their full forms for consistency.

```python
CONTRACTIONS = {
    "ain't": "am not",
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "he'd": "he would",
    "he'll": "he will",
    "he's": "he is",
    "i'd": "i would",
    "i'll": "i will",
    "i'm": "i am",
    "i've": "i have",
    "isn't": "is not",
    "it's": "it is",
    "it'll": "it will",
    "let's": "let us",
    "might've": "might have",
    "mustn't": "must not",
    "needn't": "need not",
    "shan't": "shall not",
    "she'd": "she would",
    "she'll": "she will",
    "she's": "she is",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they'd": "they would",
    "they'll": "they will",
    "they're": "they are",
    "they've": "they have",
    "wasn't": "was not",
    "we'd": "we would",
    "we'll": "we will",
    "we're": "we are",
    "we've": "we have",
    "weren't": "were not",
    "what's": "what is",
    "who'd": "who would",
    "who'll": "who will",
    "who's": "who is",
    "won't": "will not",
    "wouldn't": "would not",
    "you'd": "you would",
    "you'll": "you will",
    "you're": "you are",
    "you've": "you have",
}


def expand_contractions(text):
    """Expand contractions in text."""
    words = text.split()
    expanded = []
    for word in words:
        lower_word = word.lower()
        if lower_word in CONTRACTIONS:
            expanded.append(CONTRACTIONS[lower_word])
        else:
            expanded.append(word)
    return " ".join(expanded)


text = "I can't believe they're not coming. She won't be happy."
print(f"Original: {text}")
print(f"Expanded: {expand_contractions(text)}")
# Output: "I cannot believe they are not coming. She will not be happy."
```

### Handling Edge Cases

```python
def expand_contractions_regex(text):
    """Expand contractions using regex for better matching."""
    for contraction, expansion in sorted(CONTRACTIONS.items(), key=lambda x: -len(x[0])):
        # Case-insensitive replacement
        pattern = re.compile(re.escape(contraction), re.IGNORECASE)
        text = pattern.sub(expansion, text)
    return text


# Handle the tricky "it's" (it is vs. possessive)
text = "It's raining. The dog wagged it's tail."  # Second is grammatically wrong but common
print(expand_contractions_regex(text))
# Note: "it's" always expands to "it is" — context-aware expansion would need NLP
```

---

## Removing HTML Tags

When scraping web content, you'll encounter HTML:

```python
import re


def remove_html_tags(text):
    """Remove HTML tags from text."""
    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)
    # Remove HTML entities
    clean = re.sub(r"&nbsp;", " ", clean)
    clean = re.sub(r"&amp;", "&", clean)
    clean = re.sub(r"&lt;", "<", clean)
    clean = re.sub(r"&gt;", ">", clean)
    clean = re.sub(r"&quot;", '"', clean)
    clean = re.sub(r"&#\d+;", "", clean)
    # Remove extra whitespace
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


html_text = """
<div class="article">
    <h1>Breaking News!</h1>
    <p>The <b>quick</b> brown fox &amp; the lazy dog.</p>
    <a href="https://example.com">Click here</a> for more.
    <script>alert('xss')</script>
</div>
"""

print(remove_html_tags(html_text))
# Output: "Breaking News! The quick brown fox & the lazy dog. Click here for more. alert('xss')"
```

> **Better approach:** Use a dedicated HTML parsing library like `BeautifulSoup` for complex HTML, as regex can miss edge cases.

```python
# Using BeautifulSoup (recommended for production)
# from bs4 import BeautifulSoup
# def clean_html(html):
#     soup = BeautifulSoup(html, "html.parser")
#     # Remove script and style elements
#     for script in soup(["script", "style"]):
#         script.decompose()
#     return soup.get_text(separator=" ", strip=True)
```

---

## Removing URLs and Emails

```python
def remove_urls(text):
    """Remove URLs from text."""
    # Match http/https URLs
    text = re.sub(r"https?://\S+", "", text)
    # Match www URLs
    text = re.sub(r"www\.\S+", "", text)
    return text.strip()


def remove_emails(text):
    """Remove email addresses from text."""
    return re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "", text)


def replace_urls_emails(text):
    """Replace URLs and emails with placeholders."""
    text = re.sub(r"https?://\S+|www\.\S+", "<URL>", text)
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "<EMAIL>", text)
    return text


text = "Visit https://example.com or email support@company.org for help"

print(f"Original: {text}")
print(f"Removed:  {remove_urls(remove_emails(text))}")
print(f"Replaced: {replace_urls_emails(text)}")
```

---

## Removing Extra Whitespace

Messy text often has inconsistent spacing:

```python
def normalize_whitespace(text):
    """Normalize all whitespace: tabs, newlines, multiple spaces."""
    # Replace tabs and newlines with spaces
    text = re.sub(r"[\t\n\r]+", " ", text)
    # Collapse multiple spaces into one
    text = re.sub(r" +", " ", text)
    # Remove leading/trailing whitespace
    return text.strip()


text = "  Hello    world!  \t\n  How   are   you?  \n\n  "
print(f"Original: '{text}'")
print(f"Cleaned:  '{normalize_whitespace(text)}'")
# Output: "Hello world! How are you?"
```

---

## Unicode Normalization

Unicode characters can be represented in multiple ways:

- "é" can be: U+00E9 (single code point) OR U+0065 + U+0301 (e + combining accent)
- These look identical but are different byte sequences!

### Normalization Forms

| Form | Description | Use Case |
|------|-------------|----------|
| NFC | Composed (combine into single chars) | Storage, comparison |
| NFD | Decomposed (separate base + combining) | Searching, accent removal |
| NFKC | Compatibility composed | Lossy normalization |
| NFKD | Compatibility decomposed | Maximum normalization |

```python
import unicodedata


def unicode_normalize(text, form="NFKD"):
    """Normalize Unicode text to specified form."""
    return unicodedata.normalize(form, text)


def remove_accents(text):
    """Remove accent marks from text (e.g., café → cafe)."""
    # Decompose characters into base + combining marks
    nfkd = unicodedata.normalize("NFKD", text)
    # Remove combining marks (category 'Mn' = Mark, Nonspacing)
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn")


def normalize_unicode_chars(text):
    """Normalize common Unicode variations to ASCII equivalents."""
    replacements = {
        "\u2018": "'",   # Left single quote → apostrophe
        "\u2019": "'",   # Right single quote → apostrophe
        "\u201c": '"',   # Left double quote
        "\u201d": '"',   # Right double quote
        "\u2013": "-",   # En dash
        "\u2014": "-",   # Em dash
        "\u2026": "...", # Ellipsis
        "\u00a0": " ",   # Non-breaking space
        "\u200b": "",    # Zero-width space
        "\ufeff": "",    # BOM
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


# Examples
text = "café résumé naïve"
print(f"Original:       {text}")
print(f"Remove accents: {remove_accents(text)}")

text2 = "\u201cHello\u201d \u2014 she said\u2026"
print(f"\nUnicode fancy: {text2}")
print(f"Normalized:    {normalize_unicode_chars(text2)}")
```

**Output:**

```
Original:       café résumé naïve
Remove accents: cafe resume naive

Unicode fancy: "Hello" — she said…
Normalized:    "Hello" - she said...
```

---

## Building a Text Normalization Pipeline

Now let's combine everything into a configurable pipeline:

```python
import re
import string
import unicodedata
from typing import List, Optional


class TextNormalizer:
    """A configurable text normalization pipeline."""

    def __init__(
        self,
        lowercase: bool = True,
        remove_html: bool = True,
        remove_urls: bool = True,
        remove_emails: bool = True,
        expand_contractions: bool = True,
        remove_accents: bool = False,
        remove_punctuation: bool = False,
        remove_numbers: bool = False,
        remove_extra_whitespace: bool = True,
        remove_special_chars: bool = False,
        normalize_unicode: bool = True,
        min_word_length: int = 0,
    ):
        self.lowercase = lowercase
        self.remove_html = remove_html
        self.remove_urls = remove_urls
        self.remove_emails = remove_emails
        self.expand_contractions = expand_contractions
        self.remove_accents_flag = remove_accents
        self.remove_punctuation = remove_punctuation
        self.remove_numbers = remove_numbers
        self.remove_extra_whitespace = remove_extra_whitespace
        self.remove_special_chars = remove_special_chars
        self.normalize_unicode = normalize_unicode
        self.min_word_length = min_word_length

        # Contractions dictionary
        self._contractions = {
            "ain't": "am not", "aren't": "are not", "can't": "cannot",
            "couldn't": "could not", "didn't": "did not", "doesn't": "does not",
            "don't": "do not", "hadn't": "had not", "hasn't": "has not",
            "haven't": "have not", "he'd": "he would", "he'll": "he will",
            "he's": "he is", "i'd": "i would", "i'll": "i will",
            "i'm": "i am", "i've": "i have", "isn't": "is not",
            "it's": "it is", "let's": "let us", "mustn't": "must not",
            "shan't": "shall not", "she'd": "she would", "she'll": "she will",
            "she's": "she is", "shouldn't": "should not", "that's": "that is",
            "there's": "there is", "they'd": "they would", "they'll": "they will",
            "they're": "they are", "they've": "they have", "wasn't": "was not",
            "we'd": "we would", "we'll": "we will", "we're": "we are",
            "we've": "we have", "weren't": "were not", "won't": "will not",
            "wouldn't": "would not", "you'd": "you would", "you'll": "you will",
            "you're": "you are", "you've": "you have",
        }

    def _remove_html_tags(self, text: str) -> str:
        """Remove HTML tags and entities."""
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"&nbsp;", " ", text)
        text = re.sub(r"&amp;", "&", text)
        text = re.sub(r"&lt;", "<", text)
        text = re.sub(r"&gt;", ">", text)
        text = re.sub(r"&quot;", '"', text)
        text = re.sub(r"&#?\w+;", "", text)
        return text

    def _remove_urls_fn(self, text: str) -> str:
        """Remove URLs."""
        return re.sub(r"https?://\S+|www\.\S+", "", text)

    def _remove_emails_fn(self, text: str) -> str:
        """Remove email addresses."""
        return re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "", text)

    def _expand_contractions_fn(self, text: str) -> str:
        """Expand contractions."""
        words = text.split()
        expanded = []
        for word in words:
            lower = word.lower()
            if lower in self._contractions:
                expanded.append(self._contractions[lower])
            else:
                expanded.append(word)
        return " ".join(expanded)

    def _remove_accents_fn(self, text: str) -> str:
        """Remove accent marks."""
        nfkd = unicodedata.normalize("NFKD", text)
        return "".join(c for c in nfkd if unicodedata.category(c) != "Mn")

    def _normalize_unicode_fn(self, text: str) -> str:
        """Normalize Unicode characters."""
        replacements = {
            "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
            "\u2013": "-", "\u2014": "-", "\u2026": "...", "\u00a0": " ",
            "\u200b": "", "\ufeff": "",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

    def normalize(self, text: str) -> str:
        """Apply the full normalization pipeline."""
        if not text:
            return ""

        # Step 1: Unicode normalization
        if self.normalize_unicode:
            text = self._normalize_unicode_fn(text)

        # Step 2: Remove HTML
        if self.remove_html:
            text = self._remove_html_tags(text)

        # Step 3: Remove URLs
        if self.remove_urls:
            text = self._remove_urls_fn(text)

        # Step 4: Remove emails
        if self.remove_emails:
            text = self._remove_emails_fn(text)

        # Step 5: Lowercase
        if self.lowercase:
            text = text.lower()

        # Step 6: Expand contractions
        if self.expand_contractions:
            text = self._expand_contractions_fn(text)

        # Step 7: Remove accents
        if self.remove_accents_flag:
            text = self._remove_accents_fn(text)

        # Step 8: Remove special characters
        if self.remove_special_chars:
            text = re.sub(r"[^a-zA-Z0-9\s]", "", text)

        # Step 9: Remove punctuation
        if self.remove_punctuation:
            text = text.translate(str.maketrans("", "", string.punctuation))

        # Step 10: Remove numbers
        if self.remove_numbers:
            text = re.sub(r"\b\d+\.?\d*\b", "", text)

        # Step 11: Remove extra whitespace (always last)
        if self.remove_extra_whitespace:
            text = re.sub(r"\s+", " ", text).strip()

        # Step 12: Filter short words
        if self.min_word_length > 0:
            words = text.split()
            words = [w for w in words if len(w) >= self.min_word_length]
            text = " ".join(words)

        return text

    def normalize_batch(self, texts: List[str]) -> List[str]:
        """Normalize a batch of texts."""
        return [self.normalize(text) for text in texts]


# ===========================
# Example Usage
# ===========================

# Create normalizer with default settings (good for most tasks)
normalizer = TextNormalizer()

test_texts = [
    "<p>Hello, World!</p> Visit https://example.com",
    "I can't believe they're not coming!!!",
    "The café résumé costs $45.99 — really?",
    "  Extra   spaces   and \t tabs \n newlines  ",
    "Email john.doe@company.com for info",
    "\u201cSmart quotes\u201d and em\u2014dashes",
]

print("Default Normalization (lowercase, expand contractions, clean)")
print("=" * 65)

for text in test_texts:
    normalized = normalizer.normalize(text)
    print(f"\n  Input:  \"{text.strip()}\"")
    print(f"  Output: \"{normalized}\"")


# Create aggressive normalizer (for bag-of-words models)
aggressive = TextNormalizer(
    lowercase=True,
    remove_punctuation=True,
    remove_numbers=True,
    remove_special_chars=True,
    remove_accents=True,
    expand_contractions=True,
    min_word_length=2,
)

print("\n\nAggressive Normalization (for BoW/TF-IDF)")
print("=" * 65)

for text in test_texts:
    normalized = aggressive.normalize(text)
    print(f"\n  Input:  \"{text.strip()}\"")
    print(f"  Output: \"{normalized}\"")
```

---

## Normalization Recipes by Task

Different NLP tasks need different normalization strategies:

| Task | Recommended Settings |
|------|---------------------|
| Sentiment Analysis | Lowercase, expand contractions, keep punctuation (!?), keep emoji |
| Document Classification | Lowercase, remove punctuation, remove numbers, expand contractions |
| Named Entity Recognition | Keep case, keep punctuation, minimal normalization |
| Search / IR | Lowercase, remove punctuation, remove accents, expand contractions |
| Machine Translation | Minimal: normalize unicode, fix whitespace |
| Spam Detection | Lowercase, remove URLs/emails, keep special patterns ($$, !!!) |
| Social Media Analysis | Keep emoji, keep hashtags/@mentions, normalize URLs |

---

## Common Pitfalls

| Pitfall | Example | Solution |
|---------|---------|----------|
| Over-normalizing | Removing "not" → flips meaning | Don't remove stop words blindly |
| Losing case for NER | "Apple" → "apple" (no longer a proper noun) | Skip lowercasing for NER |
| Breaking numbers | "$3.50" → "$ 3 50" or removed | Use domain-aware number handling |
| Destroying meaning | "don't" → "do" after removing punctuation | Expand contractions first |
| Inconsistent order | Lowercase after contraction expansion | Order matters in your pipeline |

---

## Key Takeaways

1. **Normalization reduces variation** so models can focus on meaning
2. **There's no universal recipe** — always choose based on your task
3. **Order matters** — expand contractions before removing punctuation
4. **Less is more** — start with minimal normalization and add steps if needed
5. **Preserve what's meaningful** — emoji for sentiment, case for NER, numbers for finance
6. **Unicode normalization** catches invisible differences that break string matching
7. **Build a configurable pipeline** — you'll reuse it across projects with different settings
8. **Test your normalizer** — bad normalization silently destroys information

---

## Next Steps

In the next lessons, we'll explore **Stop Words** and **Stemming & Lemmatization** — further preprocessing steps that build on the normalized text we've created here.
