---
title: Stop Words
---

# Stop Words

**Stop words** are the most common words in a language that carry little meaningful information. Removing them can help NLP models focus on the words that actually matter.

---

## What Are Stop Words?

Stop words are high-frequency, low-information words that appear in almost every sentence. They serve grammatical purposes but rarely contribute to the meaning we want to extract.

**Common English stop words:**

| Category | Examples |
|----------|----------|
| Articles | the, a, an |
| Prepositions | in, on, at, to, for, with |
| Conjunctions | and, but, or, nor |
| Pronouns | he, she, it, they, we |
| Auxiliary verbs | is, am, are, was, were, be |
| Others | which, that, this, there |

A typical English text has **25–30%** stop words. Removing them significantly reduces the data your model needs to process.

---

## Why Remove Stop Words?

### 1. Reduce Noise

Stop words don't help distinguish one document from another:

```python
# With stop words
text = "The cat is sitting on the mat"

# Without stop words
text_clean = "cat sitting mat"
```

The meaning is preserved, but the data is much smaller.

### 2. Improve Model Performance

- **Smaller vocabulary** → faster training
- **Less noise** → better feature extraction
- **Lower dimensionality** → reduced memory usage

### 3. Better Search Results

In information retrieval, stop words make every document look similar:

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\frac{N}{\text{DF}(t)}$$

Words like "the" appear in nearly every document, so their IDF (Inverse Document Frequency) approaches zero. Removing them beforehand saves computation.

---

## When NOT to Remove Stop Words

Removing stop words is **not always** a good idea. Here are cases where you should keep them:

### Sentiment Analysis

The word **"not"** is typically a stop word, but it completely changes meaning:

```python
# "not" is critical here
"This movie is not good"    # negative
"This movie is good"        # positive

# Removing "not" destroys the sentiment
```

### Named Entities and Phrases

Some stop words are part of important phrases:

```python
# Don't remove stop words from these!
"United States of America"   # → "United States America" (wrong)
"The Lord of the Rings"      # → "Lord Rings" (wrong)
"Tower of London"            # → "Tower London" (wrong)
```

### Question Answering

Words like "who", "what", "where" are stop words but essential for understanding questions:

```python
"Who is the president?"      # "who" tells us the question type
"Where is the library?"      # "where" indicates location query
```

### Short Texts (Tweets, Titles)

In very short texts, every word matters:

```python
"I am not okay"             # removing stop words → "okay" (opposite meaning!)
```

---

## NLTK Stop Words

NLTK provides stop word lists for multiple languages.

### Setup

```python
import nltk
nltk.download('stopwords')

from nltk.corpus import stopwords

# Get English stop words
stop_words = set(stopwords.words('english'))

print(f"Number of NLTK English stop words: {len(stop_words)}")
# Output: Number of NLTK English stop words: 179
```

### Available Languages

```python
# See all available languages
print(stopwords.fileids())
# ['arabic', 'azerbaijani', 'basque', 'bengali', 'catalan',
#  'chinese', 'danish', 'dutch', 'english', 'finnish', 'french',
#  'german', 'greek', 'hebrew', 'hinglish', 'hungarian',
#  'indonesian', 'italian', 'kazakh', 'nepali', 'norwegian',
#  'portuguese', 'romanian', 'russian', 'slovene', 'spanish',
#  'swedish', 'tajik', 'turkish']
```

### View Stop Words

```python
# Print first 20 English stop words (sorted)
english_stops = sorted(stopwords.words('english'))
print(english_stops[:20])
# ['a', 'about', 'above', 'after', 'again', 'against', 'ain',
#  'all', 'am', 'an', 'and', 'any', 'are', 'aren', "aren't"]
```

---

## spaCy Stop Words

spaCy includes a built-in stop word list that's slightly different from NLTK's.

### Setup

```python
import spacy

nlp = spacy.load("en_core_web_sm")

# Get spaCy stop words
stop_words = nlp.Defaults.stop_words

print(f"Number of spaCy English stop words: {len(stop_words)}")
# Output: Number of spaCy English stop words: 326
```

### Check If a Word Is a Stop Word

```python
# Check individual words
doc = nlp("The quick brown fox jumps over the lazy dog")

for token in doc:
    if token.is_stop:
        print(f"'{token.text}' is a stop word")

# Output:
# 'The' is a stop word
# 'over' is a stop word
# 'the' is a stop word
```

### Compare NLTK vs spaCy

```python
from nltk.corpus import stopwords
import spacy

nlp = spacy.load("en_core_web_sm")

nltk_stops = set(stopwords.words('english'))
spacy_stops = nlp.Defaults.stop_words

print(f"NLTK stop words: {len(nltk_stops)}")
print(f"spaCy stop words: {len(spacy_stops)}")
print(f"Common to both: {len(nltk_stops & spacy_stops)}")
print(f"Only in NLTK: {len(nltk_stops - spacy_stops)}")
print(f"Only in spaCy: {len(spacy_stops - nltk_stops)}")

# NLTK stop words: 179
# spaCy stop words: 326
# Common to both: 155
# Only in NLTK: 24
# Only in spaCy: 171
```

---

## Custom Stop Word Lists

Different domains have their own "meaningless" high-frequency words:

### Domain-Specific Examples

```python
# Medical domain - common words that don't help classification
medical_stops = {"patient", "doctor", "hospital", "treatment", "diagnosis"}

# Legal domain
legal_stops = {"court", "plaintiff", "defendant", "hereby", "whereas"}

# Email domain
email_stops = {"hi", "hello", "thanks", "regards", "dear", "sincerely"}
```

### Adding Custom Stop Words

```python
from nltk.corpus import stopwords

# Start with standard stop words
stop_words = set(stopwords.words('english'))

# Add domain-specific words
custom_stops = {"said", "also", "would", "could", "may", "might"}
stop_words = stop_words.union(custom_stops)

print(f"Extended stop words: {len(stop_words)}")
```

### Adding/Removing in spaCy

```python
import spacy

nlp = spacy.load("en_core_web_sm")

# Add a custom stop word
nlp.Defaults.stop_words.add("btw")
nlp.vocab["btw"].is_stop = True

# Remove a stop word (keep "not" for sentiment)
nlp.Defaults.stop_words.discard("not")
nlp.vocab["not"].is_stop = False
```

---

## Removing Stop Words from Text

### Method 1: NLTK

```python
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

nltk.download('stopwords')
nltk.download('punkt')

text = "The quick brown fox jumps over the lazy dog near the river bank"

# Tokenize
tokens = word_tokenize(text.lower())
print(f"Original tokens ({len(tokens)}): {tokens}")

# Remove stop words
stop_words = set(stopwords.words('english'))
filtered = [word for word in tokens if word not in stop_words]
print(f"Filtered tokens ({len(filtered)}): {filtered}")

# Output:
# Original tokens (12): ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog', 'near', 'the', 'river', 'bank']
# Filtered tokens (7): ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'river', 'bank']
```

### Method 2: spaCy

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "The quick brown fox jumps over the lazy dog near the river bank"
doc = nlp(text)

# Filter out stop words and punctuation
filtered = [token.text for token in doc if not token.is_stop and not token.is_punct]
print(f"Filtered: {filtered}")

# Output:
# Filtered: ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'near', 'river', 'bank']
```

### Method 3: Simple Python (No Libraries)

```python
# A minimal stop word list
STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
    'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
    'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as',
    'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
}

def remove_stop_words(text):
    words = text.lower().split()
    return ' '.join(w for w in words if w not in STOP_WORDS)

text = "The cat is sitting on the mat and it is very happy"
print(remove_stop_words(text))
# Output: "cat sitting mat very happy"
```

---

## Impact on Bag of Words and TF-IDF

### Bag of Words Without Stop Words

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "The cat sat on the mat",
    "The dog sat on the log",
    "The cat chased the dog"
]

# Without removing stop words
vectorizer_all = CountVectorizer()
bow_all = vectorizer_all.fit_transform(documents)
print(f"Vocabulary (all): {vectorizer_all.get_feature_names_out()}")
print(f"Matrix shape: {bow_all.shape}")

# With stop words removed
vectorizer_clean = CountVectorizer(stop_words='english')
bow_clean = vectorizer_clean.fit_transform(documents)
print(f"\nVocabulary (no stops): {vectorizer_clean.get_feature_names_out()}")
print(f"Matrix shape: {bow_clean.shape}")

# Output:
# Vocabulary (all): ['cat' 'chased' 'dog' 'log' 'mat' 'on' 'sat' 'the']
# Matrix shape: (3, 8)
#
# Vocabulary (no stops): ['cat' 'chased' 'dog' 'log' 'mat' 'sat']
# Matrix shape: (3, 6)
```

### TF-IDF With Stop Words

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning is a subset of machine learning",
    "Natural language processing uses machine learning techniques"
]

# TF-IDF without stop word removal
tfidf_all = TfidfVectorizer()
matrix_all = tfidf_all.fit_transform(documents)

# TF-IDF with stop word removal
tfidf_clean = TfidfVectorizer(stop_words='english')
matrix_clean = tfidf_clean.fit_transform(documents)

print(f"Features (all words): {matrix_all.shape[1]}")
print(f"Features (no stops): {matrix_clean.shape[1]}")

# Output:
# Features (all words): 13
# Features (no stops): 9
```

---

## Complete Example: Stop Word Removal Pipeline

```python
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string

nltk.download('stopwords')
nltk.download('punkt')

def clean_text(text, extra_stops=None, keep_words=None):
    """
    Remove stop words from text with customization options.

    Parameters:
        text (str): Input text
        extra_stops (set): Additional stop words to remove
        keep_words (set): Words to keep even if they are stop words
    """
    # Get base stop words
    stop_words = set(stopwords.words('english'))

    # Add extra stop words
    if extra_stops:
        stop_words = stop_words.union(extra_stops)

    # Keep certain stop words
    if keep_words:
        stop_words = stop_words - keep_words

    # Tokenize and lowercase
    tokens = word_tokenize(text.lower())

    # Remove punctuation and stop words
    cleaned = [
        word for word in tokens
        if word not in stop_words and word not in string.punctuation
    ]

    return cleaned


# Example usage
text = """Natural Language Processing (NLP) is a field of artificial
intelligence that gives machines the ability to read, understand,
and derive meaning from human languages."""

# Basic cleaning
result = clean_text(text)
print(f"Basic: {result}")

# Keep negation words for sentiment
result_sentiment = clean_text(
    "This is not a good movie and I am not happy",
    keep_words={"not", "no", "nor", "neither"}
)
print(f"Sentiment-safe: {result_sentiment}")

# Add domain-specific stop words
result_domain = clean_text(
    text,
    extra_stops={"field", "ability", "gives"}
)
print(f"Domain-filtered: {result_domain}")
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **What** | Common words with little information value |
| **Why remove** | Reduce noise, improve performance, smaller features |
| **When to keep** | Sentiment, named entities, QA, short texts |
| **NLTK list** | 179 words, `stopwords.words('english')` |
| **spaCy list** | 326 words, `nlp.Defaults.stop_words` |
| **sklearn** | `stop_words='english'` in vectorizers |

**Key takeaway:** Always consider your task before removing stop words. For information retrieval and topic modeling, remove them. For sentiment analysis and machine translation, keep them.

---

## Exercises

1. Compare NLTK and spaCy stop word lists — which words are unique to each?
2. Build a custom stop word list for a domain you're interested in (e.g., sports, cooking).
3. Measure the vocabulary reduction after stop word removal on a real dataset.
4. Test how removing stop words affects sentiment classification accuracy.
