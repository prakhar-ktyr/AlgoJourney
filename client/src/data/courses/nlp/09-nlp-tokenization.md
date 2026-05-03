---
title: Tokenization
---

# Tokenization

**Tokenization** is the process of breaking text into smaller units called **tokens**. It's the first and most fundamental step in almost every NLP pipeline. Getting tokenization right (or wrong) affects everything downstream.

---

## What Is Tokenization?

Tokenization splits a string of text into meaningful pieces:

```
Input:  "Hello, world! How's it going?"
Output: ["Hello", ",", "world", "!", "How", "'s", "it", "going", "?"]
```

### Why Is It Important?

- Models work with **tokens**, not raw strings
- How you tokenize determines your vocabulary
- Bad tokenization = lost information = worse model performance
- Different languages need different tokenization strategies

### Types of Tokens

| Token Type | Example | Granularity |
|-----------|---------|-------------|
| Character | "H", "e", "l", "l", "o" | Finest |
| Subword | "un", "##happy" | Medium |
| Word | "unhappy" | Standard |
| Sentence | "I love NLP." | Coarsest |

---

## Word Tokenization

The most common form: split text into individual words.

### Method 1: Split by Whitespace

The simplest approach — just split on spaces:

```python
text = "I love natural language processing"
tokens = text.split()
print(tokens)
# Output: ['I', 'love', 'natural', 'language', 'processing']
```

**Problem:** This fails for punctuation, contractions, and many edge cases:

```python
text = "Hello, world! How's it going?"
tokens = text.split()
print(tokens)
# Output: ['Hello,', 'world!', "How's", 'it', 'going?']
# "Hello," includes the comma — not ideal!
```

### Method 2: Split by Punctuation

Split on whitespace AND punctuation boundaries:

```python
import re

text = "Hello, world! How's it going?"
tokens = re.findall(r"\w+|[^\w\s]", text)
print(tokens)
# Output: ['Hello', ',', 'world', '!', 'How', "'", 's', 'it', 'going', '?']
```

Better! But now "How's" is split into "How", "'", "s" — losing the contraction meaning.

### Method 3: Rule-Based Tokenization

Use linguistic rules to handle special cases:

```python
import re


def rule_based_tokenize(text):
    """Tokenize with rules for common English patterns."""
    # Handle contractions
    text = re.sub(r"n't", " n't", text)
    text = re.sub(r"'re", " 're", text)
    text = re.sub(r"'ve", " 've", text)
    text = re.sub(r"'ll", " 'll", text)
    text = re.sub(r"'d", " 'd", text)
    text = re.sub(r"'s", " 's", text)
    text = re.sub(r"'m", " 'm", text)

    # Separate punctuation
    text = re.sub(r"([.,!?;:\"()\[\]{}])", r" \1 ", text)

    # Split and remove empty tokens
    tokens = text.split()
    return tokens


text = "I can't believe it's already 3 o'clock! We're running late."
tokens = rule_based_tokenize(text)
print(tokens)
# Output: ['I', 'ca', "n't", 'believe', 'it', "'s", 'already', '3',
#          "o'clock", '!', 'We', "'re", 'running', 'late', '.']
```

---

## Sentence Tokenization

Splitting text into individual sentences.

### The Challenge

You might think: "Just split on periods!" But consider:

- "Dr. Smith went to Washington. He arrived at 3 p.m."
- "The U.S.A. is a country. It's large."
- "He earned $3.5 million... wow!"
- "She said 'Hello.' Then she left."

Simple period-splitting would produce wrong results in all of these cases.

### Rule-Based Sentence Splitting

```python
import re


def simple_sent_tokenize(text):
    """Simple sentence tokenizer using regex rules."""
    # Don't split after common abbreviations
    abbreviations = r"(?<!\bMr)(?<!\bMrs)(?<!\bDr)(?<!\bSt)(?<!\bvs)"
    abbreviations += r"(?<!\bU\.S)(?<!\bU\.K)(?<!\be\.g)(?<!\bi\.e)"

    # Split on sentence-ending punctuation followed by space + capital
    pattern = abbreviations + r'(?<=[.!?])\s+(?=[A-Z"])'

    sentences = re.split(pattern, text)
    return [s.strip() for s in sentences if s.strip()]


text = """Dr. Smith went to Washington. He arrived at 3 p.m. on Monday. 
The meeting was productive! Everyone agreed on the plan."""

sentences = simple_sent_tokenize(text)
for i, sent in enumerate(sentences, 1):
    print(f"  {i}. {sent}")
```

---

## Tokenization Challenges

Real-world text is messy. Here are common challenges:

### Contractions

| Input | Possible Tokenizations |
|-------|----------------------|
| "don't" | ["do", "n't"] or ["don't"] or ["don", "'", "t"] |
| "I'm" | ["I", "'m"] or ["I'm"] |
| "we'll" | ["we", "'ll"] or ["we'll"] |
| "it's" | ["it", "'s"] (it is) or ["it", "'s"] (possession — ambiguous!) |

### Hyphenated Words

| Input | Keep Together? | Reasoning |
|-------|---------------|-----------|
| "well-known" | Maybe | Compound adjective |
| "state-of-the-art" | Yes | Single concept |
| "New York-based" | Split? | Proper noun + suffix |
| "re-enter" | Maybe | Prefix + word |

### Special Cases

| Input | Challenge |
|-------|-----------|
| `"$45.99"` | Number with currency — one token or three? |
| `"john@email.com"` | Email address — should stay together |
| `"https://example.com/path"` | URL — one token |
| `"C++"` | Programming language name |
| `"3.14"` | Decimal number vs. sentence-ending period |
| `"#NLP"` | Hashtag — keep the # or not? |
| `":-)"` | Emoticon — meaningful unit |
| `"don't"` vs `"don't"` | Different apostrophe characters! |

### Multi-Word Expressions

Some phrases should be treated as single units:

- "New York" (city name)
- "ice cream" (compound noun)
- "in spite of" (multi-word preposition)
- "machine learning" (domain term)

---

## NLTK Tokenizers

The Natural Language Toolkit (NLTK) provides several tokenization tools.

### word_tokenize

The recommended general-purpose word tokenizer. Uses the Penn Treebank conventions.

```python
import nltk
# nltk.download('punkt_tab')  # Run once to download data

from nltk.tokenize import word_tokenize

text = "I can't believe it's 3 o'clock! We're running late."
tokens = word_tokenize(text)
print(tokens)
# Output: ['I', 'ca', "n't", 'believe', 'it', "'s", '3', "o'clock",
#          '!', 'We', "'re", 'running', 'late', '.']
```

**Key behaviors:**
- Splits contractions: "can't" → "ca" + "n't"
- Keeps punctuation as separate tokens
- Handles abbreviations reasonably well

### sent_tokenize

Splits text into sentences using a pre-trained model (Punkt tokenizer).

```python
from nltk.tokenize import sent_tokenize

text = """Dr. Smith went to Washington D.C. He arrived at 3 p.m. 
The meeting was great! Everyone agreed."""

sentences = sent_tokenize(text)
for i, sent in enumerate(sentences, 1):
    print(f"  {i}. {sent.strip()}")
```

### RegexpTokenizer

Use regular expressions to define your own tokenization rules:

```python
from nltk.tokenize import RegexpTokenizer

# Only keep words (no punctuation)
word_only = RegexpTokenizer(r"\w+")
text = "Hello, world! How's it going? #NLP is great."
print(word_only.tokenize(text))
# Output: ['Hello', 'world', 'How', 's', 'it', 'going', 'NLP', 'is', 'great']

# Keep words and hashtags
hashtag_tokenizer = RegexpTokenizer(r"#?\w+")
print(hashtag_tokenizer.tokenize(text))
# Output: ['Hello', 'world', 'How', 's', 'it', 'going', '#NLP', 'is', 'great']

# Split by sentence-ending punctuation
sentence_splitter = RegexpTokenizer(r"[^.!?]+[.!?]?")
text = "First sentence. Second one! Third?"
print(sentence_splitter.tokenize(text))
# Output: ['First sentence.', ' Second one!', ' Third?']
```

### TreebankWordTokenizer

Follows Penn Treebank conventions specifically:

```python
from nltk.tokenize import TreebankWordTokenizer

tokenizer = TreebankWordTokenizer()

text = "They'll save and invest more."
print(tokenizer.tokenize(text))
# Output: ['They', "'ll", 'save', 'and', 'invest', 'more', '.']
```

---

## spaCy Tokenizer

spaCy's tokenizer is rule-based but highly optimized. It uses a combination of:

1. **Prefix rules** (split at start: `(`, `"`, `$`)
2. **Suffix rules** (split at end: `)`, `!`, `'s`)
3. **Infix rules** (split in middle: `-`, `...`)
4. **Exception rules** (keep together: "don't" → "do" + "n't")

### Basic Usage

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "I can't believe it's 3 o'clock! We're running late."
doc = nlp(text)

tokens = [token.text for token in doc]
print(tokens)
# Output: ['I', 'ca', "n't", 'believe', 'it', "'s", '3', "o'clock", '!',
#          'We', "'re", 'running', 'late', '.']
```

### Token Attributes

spaCy tokens carry rich metadata:

```python
text = "Apple is looking at buying U.K. startup for $1 billion"
doc = nlp(text)

print(f"{'Token':<12} {'Lemma':<12} {'POS':<8} {'IsStop':<8} {'IsAlpha'}")
print("=" * 55)

for token in doc:
    print(f"{token.text:<12} {token.lemma_:<12} {token.pos_:<8} "
          f"{str(token.is_stop):<8} {token.is_alpha}")
```

### Tokenizer Pipeline

spaCy processes text in this order:

```
Text → Tokenizer → Tagger → Parser → NER → ...
         ↓
    Splits into tokens using rules:
    1. Split on whitespace
    2. Check exception rules (e.g., "don't")
    3. Apply prefix rules (e.g., split "(")
    4. Apply suffix rules (e.g., split ")")
    5. Apply infix rules (e.g., split on "-")
    6. Check if remaining text is in exceptions
```

### Custom Rules

```python
from spacy.tokenizer import Tokenizer
from spacy.util import compile_prefix_regex, compile_suffix_regex, compile_infix_regex

# Add custom token to prevent splitting
nlp = spacy.load("en_core_web_sm")

# Add special case: keep "e-mail" as one token
from spacy.lang.en import English

nlp_custom = English()
nlp_custom.tokenizer.add_special_case("e-mail", [{"ORTH": "e-mail"}])

doc = nlp_custom("Send me an e-mail please")
print([token.text for token in doc])
# Output: ['Send', 'me', 'an', 'e-mail', 'please']
```

---

## Subword Tokenization (Preview)

Modern NLP models don't tokenize at the word level. They use **subword tokenization** — splitting words into smaller pieces.

### Why Subwords?

| Problem | Word-Level | Subword |
|---------|-----------|---------|
| OOV words | "transformerize" → `<UNK>` | "transform" + "er" + "ize" |
| Vocabulary size | 100,000+ entries | 30,000–50,000 entries |
| Morphology | Can't generalize | Shares knowledge across related words |
| New words | Completely unknown | Composed from known parts |

### Byte-Pair Encoding (BPE)

BPE starts with characters and iteratively merges the most frequent pairs:

```
Initial: ["l", "o", "w", " ", "l", "o", "w", "e", "r", " ", "n", "e", "w"]

Step 1: Most frequent pair ("l", "o") → merge → "lo"
Step 2: Most frequent pair ("lo", "w") → merge → "low"
Step 3: Most frequent pair ("e", "r") → merge → "er"
...

Final vocabulary: ["low", "er", "new", "low", "er", ...]
```

### WordPiece (used by BERT)

Similar to BPE but uses likelihood-based merging:

```
Input:  "unhappiness"
Output: ["un", "##happy", "##ness"]

Input:  "transformers"
Output: ["transform", "##ers"]
```

The `##` prefix indicates "continuation of previous token."

### Comparison

| Algorithm | Used By | Key Idea |
|-----------|---------|----------|
| BPE | GPT-2, GPT-3, RoBERTa | Merge most frequent pairs |
| WordPiece | BERT, DistilBERT | Merge pairs that maximize likelihood |
| Unigram | T5, ALBERT, XLNet | Remove tokens that least affect likelihood |
| SentencePiece | Many models | Language-agnostic, works on raw text |

> **We'll cover subword tokenization in detail in a later lesson.** For now, know that it exists and is the standard for modern transformers.

---

## Comparing Tokenizers

Let's see how different tokenizers handle the same text:

```python
import re
import nltk
import spacy

# nltk.download('punkt_tab')
from nltk.tokenize import word_tokenize as nltk_tokenize
from nltk.tokenize import RegexpTokenizer

nlp = spacy.load("en_core_web_sm")


def whitespace_tokenize(text):
    """Simple whitespace split."""
    return text.split()


def regex_tokenize(text):
    """Regex-based: words and punctuation."""
    return re.findall(r"\w+|[^\w\s]", text)


def spacy_tokenize(text):
    """spaCy tokenizer."""
    doc = nlp(text)
    return [token.text for token in doc]


# Test sentences with various challenges
test_sentences = [
    "I can't believe you've done this!",
    "The U.S.A. won 3-2 in overtime.",
    "Email me at john@example.com ASAP.",
    "The state-of-the-art model costs $1.5M.",
    "She said 'Hello, world!' and left.",
]

print("Tokenizer Comparison")
print("=" * 70)

for sent in test_sentences:
    print(f"\nInput: \"{sent}\"")
    print(f"  Whitespace: {whitespace_tokenize(sent)}")
    print(f"  Regex:      {regex_tokenize(sent)}")
    print(f"  NLTK:       {nltk_tokenize(sent)}")
    print(f"  spaCy:      {spacy_tokenize(sent)}")
```

### Key Differences

| Feature | Whitespace | Regex | NLTK | spaCy |
|---------|-----------|-------|------|-------|
| Handles contractions | No | Partially | Yes | Yes |
| Separates punctuation | No | Yes | Yes | Yes |
| Handles abbreviations | No | No | Somewhat | Yes |
| Speed | Fastest | Fast | Medium | Fast |
| Accuracy | Low | Medium | High | Highest |

---

## Code: Custom Tokenizer

Let's build a more sophisticated tokenizer that handles common English patterns:

```python
import re
from typing import List


class EnglishTokenizer:
    """A custom English tokenizer with configurable options."""

    # Common abbreviations that shouldn't be split
    ABBREVIATIONS = {
        "mr.", "mrs.", "dr.", "ms.", "prof.", "sr.", "jr.",
        "st.", "ave.", "blvd.", "dept.", "est.", "fig.",
        "u.s.", "u.k.", "u.s.a.", "e.g.", "i.e.", "etc.",
        "vs.", "a.m.", "p.m.", "b.c.", "a.d.",
    }

    # Contraction patterns
    CONTRACTIONS = [
        (r"(\w+)n't", r"\1 n't"),
        (r"(\w+)'re", r"\1 're"),
        (r"(\w+)'ve", r"\1 've"),
        (r"(\w+)'ll", r"\1 'll"),
        (r"(\w+)'d", r"\1 'd"),
        (r"(\w+)'m", r"\1 'm"),
        (r"(\w+)'s", r"\1 's"),
    ]

    def __init__(self, lowercase=False, keep_urls=True, keep_emails=True,
                 keep_numbers=True, keep_punctuation=True):
        self.lowercase = lowercase
        self.keep_urls = keep_urls
        self.keep_emails = keep_emails
        self.keep_numbers = keep_numbers
        self.keep_punctuation = keep_punctuation

    def tokenize(self, text: str) -> List[str]:
        """Tokenize a text string into a list of tokens."""
        if self.lowercase:
            text = text.lower()

        # Protect URLs and emails
        protected = {}
        counter = 0

        if self.keep_urls:
            for match in re.finditer(r"https?://\S+|www\.\S+", text):
                placeholder = f"__URL{counter}__"
                protected[placeholder] = match.group()
                text = text.replace(match.group(), placeholder, 1)
                counter += 1

        if self.keep_emails:
            for match in re.finditer(r"\S+@\S+\.\S+", text):
                placeholder = f"__EMAIL{counter}__"
                protected[placeholder] = match.group()
                text = text.replace(match.group(), placeholder, 1)
                counter += 1

        # Handle contractions
        for pattern, replacement in self.CONTRACTIONS:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # Separate punctuation (but not within abbreviations or numbers)
        text = re.sub(r"([,;:@#$%^&*(){}[\]|\\<>/~`])", r" \1 ", text)

        # Handle sentence-ending punctuation
        text = re.sub(r"([.!?])\s*$", r" \1", text)
        text = re.sub(r"([.!?])\s+", r" \1 ", text)

        # Handle quotes
        text = re.sub(r'(["\'])', r" \1 ", text)

        # Split on whitespace
        tokens = text.split()

        # Restore protected tokens
        tokens = [protected.get(t, t) for t in tokens]

        # Post-processing
        if not self.keep_punctuation:
            tokens = [t for t in tokens if re.search(r"\w", t)]

        if not self.keep_numbers:
            tokens = [t for t in tokens if not re.match(r"^\d+\.?\d*$", t)]

        return tokens

    def tokenize_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        # Protect abbreviations
        protected_text = text
        for abbr in self.ABBREVIATIONS:
            if abbr in protected_text.lower():
                placeholder = abbr.replace(".", "##DOT##")
                protected_text = re.sub(
                    re.escape(abbr), placeholder, protected_text, flags=re.IGNORECASE
                )

        # Split on sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z"\(])', protected_text)

        # Restore dots
        sentences = [s.replace("##DOT##", ".") for s in sentences]

        return [s.strip() for s in sentences if s.strip()]


# Demo: Using the custom tokenizer
tokenizer = EnglishTokenizer(lowercase=False, keep_punctuation=True)

test_cases = [
    "I can't believe you've done this!",
    "Visit https://example.com for more info.",
    "Dr. Smith earned $3.5M last year.",
    "Email john@test.com or call 555-0123.",
    "The state-of-the-art model is amazing!",
]

print("Custom Tokenizer Output")
print("=" * 60)

for text in test_cases:
    tokens = tokenizer.tokenize(text)
    print(f"\nInput:  \"{text}\"")
    print(f"Tokens: {tokens}")
    print(f"Count:  {len(tokens)} tokens")

# Sentence tokenization
print("\n\nSentence Tokenization")
print("=" * 60)

paragraph = """Dr. Smith visited the U.S. last week. He met with Prof. 
Johnson at 3 p.m. on Tuesday. They discussed the new findings! 
The results were surprising. "I couldn't believe it," he said."""

sentences = tokenizer.tokenize_sentences(paragraph)
for i, sent in enumerate(sentences, 1):
    print(f"  {i}. {sent}")
```

### Tokenizer Statistics

```python
def tokenizer_stats(text, tokenizer):
    """Compute statistics about tokenization."""
    tokens = tokenizer.tokenize(text)
    sentences = tokenizer.tokenize_sentences(text)

    unique_tokens = set(t.lower() for t in tokens)
    avg_token_len = sum(len(t) for t in tokens) / len(tokens) if tokens else 0

    stats = {
        "total_tokens": len(tokens),
        "unique_tokens": len(unique_tokens),
        "sentences": len(sentences),
        "avg_token_length": round(avg_token_len, 2),
        "vocab_coverage": round(len(unique_tokens) / len(tokens) * 100, 1),
    }
    return stats


sample_text = """Natural language processing (NLP) is a subfield of linguistics, 
computer science, and artificial intelligence. It's concerned with the interactions 
between computers and human language. NLP isn't easy — it's one of the hardest 
problems in AI! Dr. Smith's research on NLP has been groundbreaking."""

stats = tokenizer_stats(sample_text, tokenizer)

print("Tokenization Statistics")
print("=" * 40)
for key, value in stats.items():
    print(f"  {key}: {value}")
```

---

## Best Practices

1. **Choose the right granularity** for your task (word, subword, or character)
2. **Be consistent** — use the same tokenizer for training and inference
3. **Handle edge cases** that matter for your domain (code? medical terms? URLs?)
4. **Consider your language** — Chinese/Japanese need character-aware tokenizers
5. **Test with real data** — edge cases always appear in production
6. **Use established libraries** (spaCy, NLTK, Hugging Face) when possible
7. **Document your choices** — tokenization decisions affect reproducibility

---

## Key Takeaways

1. **Tokenization is the foundation** of every NLP pipeline — get it right
2. **Simple whitespace splitting** fails for real-world text
3. **Contractions, abbreviations, and special tokens** are the main challenges
4. **NLTK and spaCy** provide battle-tested tokenizers for English
5. **Subword tokenization** (BPE, WordPiece) is the modern standard for deep learning
6. **No tokenizer is perfect** — the best choice depends on your task and domain
7. **Always compare** multiple tokenization strategies for your specific use case

---

## Next Steps

In the next lesson, we'll explore **Text Normalization** — making text consistent by handling case, punctuation, contractions, and more.
