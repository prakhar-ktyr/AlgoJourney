---
title: Lemmatization
---

# Lemmatization

**Lemmatization** reduces words to their dictionary form (called the **lemma**) using vocabulary and morphological analysis. Unlike stemming, the result is always a valid word.

---

## What Is Lemmatization?

A **lemma** is the base or dictionary form of a word — the form you'd look up in a dictionary.

**Examples:**

| Word | Lemma | Explanation |
|------|-------|-------------|
| running | run | verb → base form |
| better | good | adjective → base form |
| mice | mouse | noun → singular |
| went | go | verb → infinitive |
| are | be | verb → infinitive |
| studies | study | verb → base form |
| geese | goose | noun → singular |
| happier | happy | adjective → base form |
| was | be | verb → infinitive |
| children | child | noun → singular |

Compare with stemming:

$$\text{Stemming: better} \rightarrow \text{better (unchanged)}$$
$$\text{Lemmatization: better} \rightarrow \text{good (correct base form)}$$

---

## How Lemmatization Works

Lemmatization uses two key resources:

### 1. A Dictionary/Lexicon

Maps word forms to their base form:

```
running → run
ran     → run
runs    → run
```

### 2. Part-of-Speech (POS) Information

The same word has different lemmas depending on its POS:

```python
# "better" as adjective → "good"
# "better" as verb → "better" (to better oneself)

# "meeting" as noun → "meeting"
# "meeting" as verb → "meet"

# "saw" as noun → "saw" (the tool)
# "saw" as verb → "see"
```

This is why POS tagging is often required before lemmatization.

---

## Why POS Matters

Without POS, the lemmatizer often defaults to treating words as nouns:

```python
from nltk.stem import WordNetLemmatizer
import nltk
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()

# Default (noun) — often wrong for verbs!
print(lemmatizer.lemmatize("running"))   # running (wrong!)
print(lemmatizer.lemmatize("better"))    # better (wrong!)
print(lemmatizer.lemmatize("studies"))   # study (correct — also a noun)

# With correct POS
print(lemmatizer.lemmatize("running", pos='v'))  # run ✓
print(lemmatizer.lemmatize("better", pos='a'))   # good ✓
print(lemmatizer.lemmatize("studies", pos='v'))   # study ✓
```

The POS parameter uses WordNet codes:

| Code | Part of Speech | Examples |
|------|---------------|----------|
| `'n'` | Noun | dog, city, idea |
| `'v'` | Verb | run, think, be |
| `'a'` | Adjective | big, old, good |
| `'r'` | Adverb | quickly, very |

---

## WordNet Lemmatizer (NLTK)

The WordNet Lemmatizer uses the WordNet database to find lemmas.

### Basic Usage

```python
import nltk
from nltk.stem import WordNetLemmatizer

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

lemmatizer = WordNetLemmatizer()

# Nouns
nouns = ["cats", "mice", "geese", "children", "cacti", "analyses", "phenomena"]
print("Nouns:")
for word in nouns:
    print(f"  {word} → {lemmatizer.lemmatize(word, pos='n')}")

# Verbs
verbs = ["running", "went", "gone", "studies", "ate", "swimming", "written"]
print("\nVerbs:")
for word in verbs:
    print(f"  {word} → {lemmatizer.lemmatize(word, pos='v')}")

# Adjectives
adjectives = ["better", "worst", "happier", "largest", "simpler"]
print("\nAdjectives:")
for word in adjectives:
    print(f"  {word} → {lemmatizer.lemmatize(word, pos='a')}")
```

**Output:**

```
Nouns:
  cats → cat
  mice → mouse
  geese → goose
  children → child
  cacti → cactus
  analyses → analysis
  phenomena → phenomenon

Verbs:
  running → run
  went → go
  gone → go
  studies → study
  ate → eat
  swimming → swim
  written → write

Adjectives:
  better → good
  worst → bad
  happier → happy
  largest → large
  simpler → simple
```

### Automatic POS Detection

To use the WordNet lemmatizer effectively, combine it with POS tagging:

```python
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from nltk import pos_tag, word_tokenize

nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()

def get_wordnet_pos(treebank_tag):
    """Convert Penn Treebank POS tag to WordNet POS tag."""
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN  # default to noun

def lemmatize_sentence(sentence):
    """Lemmatize a sentence with automatic POS detection."""
    tokens = word_tokenize(sentence)
    tagged = pos_tag(tokens)

    lemmas = []
    for word, tag in tagged:
        wn_tag = get_wordnet_pos(tag)
        lemma = lemmatizer.lemmatize(word, pos=wn_tag)
        lemmas.append(lemma)

    return lemmas

# Test
sentence = "The striped bats are hanging on their feet for best results"
result = lemmatize_sentence(sentence)
print(f"Original: {sentence}")
print(f"Lemmas:   {' '.join(result)}")

# Output:
# Original: The striped bats are hanging on their feet for best results
# Lemmas:   The strip bat be hang on their foot for good result
```

---

## spaCy Lemmatizer

spaCy performs lemmatization automatically as part of its processing pipeline.

### Basic Usage

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "The mice were running faster than the geese that were swimming"
doc = nlp(text)

print(f"{'Token':<12} {'Lemma':<12} {'POS':<8}")
print("-" * 32)
for token in doc:
    print(f"{token.text:<12} {token.lemma_:<12} {token.pos_:<8}")
```

**Output:**

```
Token        Lemma        POS
--------------------------------
The          the          DET
mice         mouse        NOUN
were         be           AUX
running      run          VERB
faster       fast         ADV
than         than         SCONJ
the          the          DET
geese        goose        NOUN
that         that         PRON
were         be           AUX
swimming     swim         VERB
```

### Advantages of spaCy

- POS is detected automatically — no manual tagging needed
- Handles context better than WordNet alone
- Faster for processing entire documents
- Works out of the box

### Processing Multiple Sentences

```python
import spacy

nlp = spacy.load("en_core_web_sm")

sentences = [
    "She was running faster than her competitors.",
    "The children played happily in the gardens.",
    "He has been studying the worst cases carefully.",
    "The geese flew south for better weather."
]

for sent in sentences:
    doc = nlp(sent)
    lemmas = [token.lemma_ for token in doc if token.is_alpha]
    print(f"Original: {sent}")
    print(f"Lemmas:   {' '.join(lemmas)}\n")
```

**Output:**

```
Original: She was running faster than her competitors.
Lemmas:   she be run fast than her competitor

Original: The children played happily in the gardens.
Lemmas:   the child play happily in the garden

Original: He has been studying the worst cases carefully.
Lemmas:   he have be study the bad case carefully

Original: The geese flew south for better weather.
Lemmas:   the goose fly south for well weather
```

---

## Lemmatization vs Stemming: Detailed Comparison

### Side-by-Side Results

```python
import nltk
import spacy
from nltk.stem import PorterStemmer, WordNetLemmatizer

nltk.download('wordnet')

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
nlp = spacy.load("en_core_web_sm")

test_words = [
    ("running", "v"), ("better", "a"), ("mice", "n"),
    ("went", "v"), ("studies", "v"), ("happier", "a"),
    ("geese", "n"), ("was", "v"), ("worst", "a"),
    ("children", "n"), ("ate", "v"), ("flying", "v")
]

print(f"{'Word':<12} {'Stem':<12} {'NLTK Lemma':<12} {'spaCy Lemma':<12}")
print("-" * 48)

for word, pos in test_words:
    stem = stemmer.stem(word)
    nltk_lemma = lemmatizer.lemmatize(word, pos=pos)

    # spaCy lemma
    doc = nlp(word)
    spacy_lemma = doc[0].lemma_

    print(f"{word:<12} {stem:<12} {nltk_lemma:<12} {spacy_lemma:<12}")
```

### Performance Comparison

| Metric | Stemming | Lemmatization |
|--------|----------|---------------|
| **Speed** | ~1M words/sec | ~100K words/sec |
| **Memory** | Minimal | Needs dictionary |
| **Accuracy** | ~70% | ~95% |
| **Output validity** | Often not a word | Always a word |
| **Handles irregulars** | No | Yes |
| **Needs POS** | No | Yes (for best results) |
| **Setup** | Import and use | Download models/data |

### When to Choose Which

```python
# STEMMING is better when:
# 1. Speed is critical (real-time search)
# 2. Exact word form doesn't matter
# 3. You're building an inverted index
# 4. Processing millions of documents

# LEMMATIZATION is better when:
# 1. You need valid words (chatbots, text generation)
# 2. Accuracy matters more than speed
# 3. You need to handle irregular forms
# 4. The output will be shown to users
```

---

## When to Use Lemmatization

### Text Classification

```python
import spacy

nlp = spacy.load("en_core_web_sm")

def lemmatize_for_classification(text):
    """Preprocess text for classification using lemmatization."""
    doc = nlp(text.lower())
    # Keep only meaningful lemmas
    lemmas = [
        token.lemma_ for token in doc
        if token.is_alpha and not token.is_stop and len(token) > 2
    ]
    return ' '.join(lemmas)

# Example: product reviews
reviews = [
    "The batteries lasted longer than expected",
    "Battery life was terrible and kept dying",
    "I loved how the battery performed amazingly",
    "Worst batteries I've ever purchased, completely useless"
]

for review in reviews:
    processed = lemmatize_for_classification(review)
    print(f"Original:  {review}")
    print(f"Processed: {processed}\n")
```

### Chatbot Preprocessing

```python
import spacy

nlp = spacy.load("en_core_web_sm")

def normalize_query(user_input):
    """Normalize user queries for intent matching."""
    doc = nlp(user_input)
    # Extract lemmatized content words
    keywords = [token.lemma_.lower() for token in doc
                if not token.is_stop and not token.is_punct]
    return keywords

# Different ways users might ask the same thing
queries = [
    "What are your opening hours?",
    "When are you opened?",
    "What time do you open?",
    "Are you guys opening today?",
    "Tell me the hours you're opened"
]

print("Normalized queries:")
for q in queries:
    print(f"  {q}")
    print(f"  → {normalize_query(q)}\n")

# All should produce similar keyword sets with "open" and "hour"/"time"
```

---

## Complete Pipeline: Lemmatization in Practice

```python
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

def full_preprocessing(text):
    """
    Complete text preprocessing pipeline with lemmatization.

    Steps:
    1. Parse with spaCy (tokenize, POS tag, lemmatize)
    2. Remove stop words
    3. Remove punctuation and numbers
    4. Keep only meaningful lemmas
    """
    doc = nlp(text.lower())

    lemmas = []
    for token in doc:
        # Skip stop words, punctuation, spaces, and short words
        if (token.is_stop or token.is_punct or
            token.is_space or len(token.text) < 3):
            continue
        # Skip numbers
        if token.like_num:
            continue
        # Add the lemma
        lemmas.append(token.lemma_)

    return lemmas

# Process a document
document = """
Natural Language Processing (NLP) has been revolutionizing how computers
understand human languages. Researchers have been developing better
algorithms that can process texts more efficiently. These improvements
have led to chatbots that communicate more naturally, search engines
that find relevant results faster, and translation systems that produce
more accurate translations than ever before.
"""

lemmas = full_preprocessing(document)
print(f"Lemmas: {lemmas}")
print(f"\nToken count: Original={len(document.split())}, Lemmatized={len(lemmas)}")

# Word frequency after lemmatization
freq = Counter(lemmas)
print(f"\nTop 10 lemmas:")
for word, count in freq.most_common(10):
    print(f"  {word}: {count}")
```

---

## Comparing Libraries: A Benchmark

```python
import time
import nltk
import spacy
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, word_tokenize

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

nlp = spacy.load("en_core_web_sm")
lemmatizer = WordNetLemmatizer()

text = """The quick brown foxes jumped over the lazy dogs while
the mice were running away from the children who were happily
playing in the gardens near the flowing rivers."""

# Repeat for timing
texts = [text] * 100

# spaCy timing
start = time.time()
for t in texts:
    doc = nlp(t)
    result = [token.lemma_ for token in doc]
spacy_time = time.time() - start

# NLTK timing
from nltk.corpus import wordnet

def get_wn_pos(tag):
    if tag.startswith('J'): return wordnet.ADJ
    elif tag.startswith('V'): return wordnet.VERB
    elif tag.startswith('R'): return wordnet.ADV
    return wordnet.NOUN

start = time.time()
for t in texts:
    tokens = word_tokenize(t)
    tagged = pos_tag(tokens)
    result = [lemmatizer.lemmatize(w, get_wn_pos(tag)) for w, tag in tagged]
nltk_time = time.time() - start

print(f"spaCy:  {spacy_time:.3f}s for {len(texts)} iterations")
print(f"NLTK:   {nltk_time:.3f}s for {len(texts)} iterations")
print(f"Ratio:  NLTK is {nltk_time/spacy_time:.1f}x {'slower' if nltk_time > spacy_time else 'faster'}")
```

---

## Common Pitfalls

### 1. Forgetting POS (NLTK)

```python
from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()

# Without POS — many words unchanged!
print(lemmatizer.lemmatize("running"))   # running (wrong)
print(lemmatizer.lemmatize("better"))    # better (wrong)
print(lemmatizer.lemmatize("went"))      # went (wrong)

# Always provide POS for verbs and adjectives!
print(lemmatizer.lemmatize("running", 'v'))  # run ✓
print(lemmatizer.lemmatize("better", 'a'))   # good ✓
print(lemmatizer.lemmatize("went", 'v'))     # go ✓
```

### 2. Case Sensitivity

```python
from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()

# WordNet is case-sensitive
print(lemmatizer.lemmatize("Running", 'v'))  # Running (wrong!)
print(lemmatizer.lemmatize("running", 'v'))  # run ✓

# Always lowercase first
word = "Running"
print(lemmatizer.lemmatize(word.lower(), 'v'))  # run ✓
```

### 3. Not All Words Need Lemmatization

```python
import spacy

nlp = spacy.load("en_core_web_sm")

# Proper nouns should often stay as-is
doc = nlp("Apple announced new iPhones at their headquarters")
for token in doc:
    if token.pos_ == "PROPN":
        print(f"Keep as-is: {token.text} (proper noun)")
    else:
        print(f"Lemmatize: {token.text} → {token.lemma_}")
```

---

## Summary

| Feature | Details |
|---------|---------|
| **What** | Reduce words to their dictionary form (lemma) |
| **Output** | Always a valid word |
| **Handles irregulars** | Yes (went→go, mice→mouse) |
| **Requires** | Dictionary + POS information |
| **NLTK** | `WordNetLemmatizer` + manual POS |
| **spaCy** | Automatic POS + lemmatization |
| **Best for** | Classification, chatbots, any user-facing output |
| **Trade-off** | More accurate but slower than stemming |

**Key takeaway:** Use lemmatization when you need valid words and correct handling of irregular forms. Use spaCy for convenience (automatic POS), NLTK for fine-grained control.

---

## Exercises

1. Lemmatize a news article and compute word frequencies — compare with stemming.
2. Build a function that falls back to stemming when lemmatization is too slow.
3. Test how lemmatization vs stemming affects text classification accuracy.
4. Find 10 words where NLTK and spaCy produce different lemmas and explain why.
5. Create a pipeline that keeps proper nouns intact while lemmatizing everything else.
