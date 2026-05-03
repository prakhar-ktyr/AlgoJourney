---
title: Stemming
---

# Stemming

**Stemming** is the process of reducing words to their base or root form by removing suffixes. It's a fast, rule-based approach to text normalization used heavily in search engines and information retrieval.

---

## What Is Stemming?

Stemming chops off word endings to produce a **stem** — a rough approximation of the root word. The stem doesn't need to be a real dictionary word.

**Examples:**

| Word | Stem |
|------|------|
| running | run |
| runner | runner |
| runs | run |
| studies | studi |
| studying | studi |
| better | better |
| fishing | fish |
| fished | fish |
| fisher | fisher |
| connection | connect |
| connected | connect |
| connecting | connect |

Notice that "studies" becomes "studi" — not a real word! Stemming prioritizes **speed** over **accuracy**.

---

## Why Use Stemming?

The core idea: different forms of a word often carry the same meaning.

$$\text{connect} \approx \text{connected} \approx \text{connecting} \approx \text{connection}$$

By reducing all variants to a common stem, we:

1. **Reduce vocabulary size** — fewer unique tokens to process
2. **Improve recall** in search — searching "fishing" also finds "fish" and "fished"
3. **Speed up processing** — smaller feature space for ML models

---

## Porter Stemmer

The **Porter Stemmer** (1980) is the most widely used stemmer. It applies a series of 5 phases of suffix-removal rules.

### How It Works

The algorithm uses the concept of **measure** — the number of vowel-consonant sequences in a word:

$$m = \text{number of VC patterns}$$

Rules are applied in sequence based on the measure:

- Step 1: Plurals and past participles (`-sses`, `-ies`, `-ed`, `-ing`)
- Step 2: Double suffixes (`-ational` → `-ate`, `-izer` → `-ize`)
- Step 3: More suffixes (`-icate` → `-ic`, `-ful` → ε)
- Step 4: Longer suffixes (`-ement`, `-ment`, `-ent`)
- Step 5: Clean up (`-e`, double letters)

### Code Example

```python
from nltk.stem import PorterStemmer

stemmer = PorterStemmer()

words = [
    "running", "runs", "runner", "ran",
    "fishing", "fished", "fisher", "fishy",
    "studies", "studying", "studied", "student",
    "connection", "connected", "connecting", "connective",
    "happily", "happiness", "happy", "happier",
    "caresses", "ponies", "cats", "dogs"
]

print("Word".ljust(15), "Stem")
print("-" * 30)
for word in words:
    stem = stemmer.stem(word)
    print(f"{word.ljust(15)} {stem}")
```

**Output:**

```
Word            Stem
------------------------------
running         run
runs            run
runner          runner
ran             ran
fishing         fish
fished          fish
fisher          fisher
fishy           fishi
studies         studi
studying        studi
studied         studi
student         student
connection      connect
connected       connect
connecting      connect
connective      connect
happily         happili
happiness       happi
happy           happi
happier         happier
caresses        caress
ponies          poni
cats            cat
dogs            dog
```

---

## Lancaster Stemmer

The **Lancaster Stemmer** (1990) is more aggressive than Porter. It uses over 100 rules and iterates until no more rules apply.

### Characteristics

- **More aggressive** — removes more characters
- **Faster** — fewer passes needed
- **Less readable** — stems are often very short
- **Over-stems** frequently

### Code Example

```python
from nltk.stem import LancasterStemmer

stemmer = LancasterStemmer()

words = ["running", "runs", "runner", "fishing", "fished",
         "studies", "studying", "connection", "connected",
         "maximum", "presumably", "multiply", "provision"]

print("Word".ljust(15), "Stem")
print("-" * 30)
for word in words:
    stem = stemmer.stem(word)
    print(f"{word.ljust(15)} {stem}")
```

**Output:**

```
Word            Stem
------------------------------
running         run
runs            run
runner          run
fishing         fish
fished          fish
studies         study
studying        study
connection      connect
connected       connect
maximum         maxim
presumably      presum
multiply        multiply
provision       provid
```

Notice how Lancaster stems "runner" to "run" while Porter keeps it as "runner".

---

## Snowball Stemmer

The **Snowball Stemmer** (2001) is an improved version of Porter, created by the same author (Martin Porter). Also called **Porter2**.

### Improvements Over Porter

- Slightly more aggressive (better normalization)
- Supports multiple languages
- Fixes some known Porter errors
- Generally considered the best choice today

### Code Example

```python
from nltk.stem import SnowballStemmer

stemmer = SnowballStemmer("english")

# Available languages
print("Supported languages:")
print(SnowballStemmer.languages)
# ('arabic', 'basque', 'catalan', 'danish', 'dutch', 'english',
#  'finnish', 'french', 'german', 'hungarian', 'italian',
#  'norwegian', 'portuguese', 'romanian', 'russian', 'spanish',
#  'swedish')

words = ["running", "runs", "runner", "fishing", "fished",
         "studies", "studying", "connection", "connected",
         "generously", "generous", "generosity"]

print("\nWord".ljust(16), "Stem")
print("-" * 30)
for word in words:
    stem = stemmer.stem(word)
    print(f"{word.ljust(15)} {stem}")
```

### Multi-Language Stemming

```python
from nltk.stem import SnowballStemmer

# French stemming
french_stemmer = SnowballStemmer("french")
french_words = ["manger", "mangeons", "mangé", "mangeant"]
print("French stemming:")
for word in french_words:
    print(f"  {word} → {french_stemmer.stem(word)}")

# Spanish stemming
spanish_stemmer = SnowballStemmer("spanish")
spanish_words = ["correr", "corriendo", "corrió", "corredores"]
print("\nSpanish stemming:")
for word in spanish_words:
    print(f"  {word} → {spanish_stemmer.stem(word)}")
```

---

## Comparing All Three Stemmers

```python
from nltk.stem import PorterStemmer, LancasterStemmer, SnowballStemmer

porter = PorterStemmer()
lancaster = LancasterStemmer()
snowball = SnowballStemmer("english")

test_words = [
    "running", "easily", "fairly", "sportingly",
    "connection", "provision", "maximum",
    "presumably", "university", "historical",
    "troubleshooting", "intelligence", "beautiful",
    "generalization", "communication", "responsibility"
]

print(f"{'Word':<20} {'Porter':<15} {'Lancaster':<15} {'Snowball':<15}")
print("-" * 65)

for word in test_words:
    p = porter.stem(word)
    l = lancaster.stem(word)
    s = snowball.stem(word)
    print(f"{word:<20} {p:<15} {l:<15} {s:<15}")
```

**Output:**

```
Word                 Porter          Lancaster       Snowball
-----------------------------------------------------------------
running              run             run             run
easily               easili          easy            easili
fairly               fairli          fair            fair
sportingly           sportingli      sport           sport
connection           connect         connect         connect
provision            provis          provid          provis
maximum              maximum         maxim           maximum
presumably           presum          presum          presum
university           univers         univers         univers
historical           histor          hist            histor
troubleshooting      troubleshoot    troubleshoot    troubleshoot
intelligence         intellig        intellig        intellig
beautiful            beauti          beauty          beauti
generalization       gener           gen             general
communication        commun          commun          commun
responsibility       respons         respons         respons
```

---

## Over-Stemming and Under-Stemming

### Over-Stemming (False Positives)

When different words are reduced to the same stem incorrectly:

```python
from nltk.stem import PorterStemmer
stemmer = PorterStemmer()

# These have different meanings but get the same stem
print(stemmer.stem("university"))  # univers
print(stemmer.stem("universe"))    # univers
print(stemmer.stem("universal"))   # univers

# "organ" problems
print(stemmer.stem("organization"))  # organ
print(stemmer.stem("organ"))         # organ
print(stemmer.stem("organic"))       # organ
```

Over-stemming conflates unrelated words, reducing **precision** in search.

### Under-Stemming (False Negatives)

When related words produce different stems:

```python
from nltk.stem import PorterStemmer
stemmer = PorterStemmer()

# These are related but get different stems
print(stemmer.stem("absorb"))      # absorb
print(stemmer.stem("absorption"))  # absorpt

print(stemmer.stem("run"))         # run
print(stemmer.stem("ran"))         # ran  (irregular verb!)

print(stemmer.stem("good"))        # good
print(stemmer.stem("better"))      # better
print(stemmer.stem("best"))        # best
```

Under-stemming misses connections between related words, reducing **recall** in search.

---

## Stemming vs Lemmatization

| Feature | Stemming | Lemmatization |
|---------|----------|---------------|
| **Method** | Rule-based suffix removal | Dictionary + morphological analysis |
| **Speed** | Very fast | Slower |
| **Output** | May not be a real word | Always a real word |
| **Accuracy** | Lower | Higher |
| **Handles irregulars** | No ("better" stays "better") | Yes ("better" → "good") |
| **Requires POS** | No | Often yes |
| **Best for** | Search engines, IR | Text classification, chatbots |

```python
from nltk.stem import PorterStemmer, WordNetLemmatizer
import nltk
nltk.download('wordnet')

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

words = ["running", "better", "studies", "mice", "geese", "went", "happily"]

print(f"{'Word':<12} {'Stem':<12} {'Lemma':<12}")
print("-" * 36)
for word in words:
    s = stemmer.stem(word)
    l = lemmatizer.lemmatize(word)
    print(f"{word:<12} {s:<12} {l:<12}")
```

---

## When to Use Stemming

### Good Use Cases

1. **Search engines** — match "running" when user searches "run"
2. **Information retrieval** — improve recall
3. **Document clustering** — reduce feature dimensionality
4. **Spam detection** — "fr33" tricks don't matter when stemming
5. **Quick prototyping** — fast text normalization

### Bad Use Cases

1. **Chatbots** — need proper words for responses
2. **Text generation** — "studi" isn't a valid output
3. **Machine translation** — need morphological accuracy
4. **Sentiment analysis** — stems lose nuance

---

## Practical Application: Search Engine

```python
from nltk.stem import SnowballStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk

nltk.download('stopwords')
nltk.download('punkt')

stemmer = SnowballStemmer("english")
stop_words = set(stopwords.words('english'))

def preprocess(text):
    """Tokenize, remove stop words, and stem."""
    tokens = word_tokenize(text.lower())
    return [stemmer.stem(t) for t in tokens
            if t.isalpha() and t not in stop_words]

# Build a simple inverted index
documents = [
    "Machine learning algorithms learn from data",
    "Deep learning uses neural networks for learning",
    "Natural language processing handles text data",
    "Computer vision processes images and videos",
    "Reinforcement learning trains agents through rewards"
]

# Create inverted index
index = {}
for doc_id, doc in enumerate(documents):
    for term in preprocess(doc):
        if term not in index:
            index[term] = set()
        index[term].add(doc_id)

# Search function
def search(query):
    """Find documents matching all query terms."""
    query_terms = preprocess(query)
    if not query_terms:
        return []

    # Intersect result sets
    result = index.get(query_terms[0], set())
    for term in query_terms[1:]:
        result = result & index.get(term, set())

    return [documents[i] for i in result]

# Test searches
print("Search: 'learning algorithms'")
for doc in search("learning algorithms"):
    print(f"  → {doc}")

print("\nSearch: 'learned'")  # Stems to "learn" → matches!
for doc in search("learned"):
    print(f"  → {doc}")

print("\nSearch: 'processing text'")
for doc in search("processing text"):
    print(f"  → {doc}")
```

---

## Choosing the Right Stemmer

```python
from nltk.stem import PorterStemmer, LancasterStemmer, SnowballStemmer
import time

# Performance comparison
porter = PorterStemmer()
lancaster = LancasterStemmer()
snowball = SnowballStemmer("english")

# Generate a large word list for timing
words = ["running", "connection", "university", "happiness",
         "studying", "beautiful", "intelligence", "communication"] * 10000

stemmers = {
    "Porter": porter,
    "Lancaster": lancaster,
    "Snowball": snowball
}

for name, stemmer in stemmers.items():
    start = time.time()
    results = [stemmer.stem(w) for w in words]
    elapsed = time.time() - start
    print(f"{name}: {elapsed:.3f}s for {len(words)} words")
```

### Recommendation

| Scenario | Recommended Stemmer |
|----------|-------------------|
| English text, general purpose | **Snowball** |
| Multi-language support | **Snowball** |
| Maximum speed needed | **Porter** |
| Most aggressive reduction | **Lancaster** |
| Academic/research work | **Porter** (most cited) |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Stemming** | Reduces words to root form via suffix removal |
| **Porter** | Most popular, moderate aggression |
| **Lancaster** | Most aggressive, shortest stems |
| **Snowball** | Best balance, multilingual |
| **Over-stemming** | Unrelated words get same stem |
| **Under-stemming** | Related words get different stems |
| **Best for** | Search, IR, fast prototyping |
| **Not ideal for** | Generation, translation, chatbots |

**Key takeaway:** Stemming is fast and good enough for many tasks. When you need real dictionary words or handle irregular forms, use lemmatization instead (next lesson).

---

## Exercises

1. Stem a paragraph of text with all three stemmers and compare results.
2. Find 5 examples of over-stemming and 5 of under-stemming using Porter.
3. Build a simple search engine that uses stemming for query expansion.
4. Compare stemming performance on a text classification task vs. no stemming.
5. Try the Snowball stemmer on text in another language you know.
