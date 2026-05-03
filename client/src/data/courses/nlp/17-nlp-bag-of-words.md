---
title: Bag of Words
---

# Bag of Words

The **Bag of Words (BoW)** model is one of the simplest and most widely used methods for converting text into numbers that machine learning algorithms can understand.

---

## What Is Bag of Words?

Imagine you have a bag. You take a document, throw all its words into the bag, shake it up, and count how many of each word you have. You've lost all word order — but you know exactly which words appear and how often.

**Key idea:** Represent each document as a vector of word frequencies.

```
Document: "The cat sat on the mat"
Bag: {the: 2, cat: 1, sat: 1, on: 1, mat: 1}
```

The "bag" metaphor means we **ignore word order** — only counts matter.

---

## Why Use Bag of Words?

| Advantage | Description |
|-----------|-------------|
| Simple | Easy to understand and implement |
| Fast | Efficient computation |
| Effective | Works well for many classification tasks |
| Flexible | Works with any language |

Despite its simplicity, BoW powers many real-world systems: spam filters, sentiment analysis, document classification, and search engines.

---

## Step-by-Step: Building a BoW Representation

### Step 1: Collect Documents

```python
documents = [
    "I love machine learning",
    "I love natural language processing",
    "machine learning is fun",
]
```

### Step 2: Build the Vocabulary

The **vocabulary** is the set of all unique words across all documents:

```python
# Tokenize and build vocabulary
all_words = set()
for doc in documents:
    words = doc.lower().split()
    all_words.update(words)

vocabulary = sorted(all_words)
print(vocabulary)
# ['fun', 'i', 'is', 'language', 'learning', 'love', 'machine', 'natural', 'processing']
```

### Step 3: Create BoW Vectors

For each document, count how many times each vocabulary word appears:

```python
def create_bow_vector(document, vocabulary):
    """Convert a document to a BoW vector."""
    words = document.lower().split()
    vector = []
    for vocab_word in vocabulary:
        count = words.count(vocab_word)
        vector.append(count)
    return vector

# Create vectors for all documents
for doc in documents:
    vector = create_bow_vector(doc, vocabulary)
    print(f"{doc}")
    print(f"  Vector: {vector}")
    print()
```

Output:

```
I love machine learning
  Vector: [0, 1, 0, 0, 1, 1, 1, 0, 0]

I love natural language processing
  Vector: [0, 1, 0, 1, 0, 1, 0, 1, 1]

machine learning is fun
  Vector: [1, 0, 1, 0, 1, 0, 1, 0, 0]
```

---

## The Document-Term Matrix

When you stack all BoW vectors together, you get a **document-term matrix**:

```
              fun  i  is  language  learning  love  machine  natural  processing
Doc 1:      [  0, 1,  0,    0,       1,       1,     1,       0,        0     ]
Doc 2:      [  0, 1,  0,    1,       0,       1,     0,       1,        1     ]
Doc 3:      [  1, 0,  1,    0,       1,       0,     1,       0,        0     ]
```

Each **row** = one document. Each **column** = one word from the vocabulary.

This matrix is the input to machine learning algorithms!

---

## Using scikit-learn's CountVectorizer

In practice, you don't build BoW manually. scikit-learn's `CountVectorizer` does it all:

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "I love machine learning",
    "I love natural language processing",
    "machine learning is fun",
]

# Create the vectorizer
vectorizer = CountVectorizer()

# Fit and transform documents
bow_matrix = vectorizer.fit_transform(documents)

# View vocabulary
print("Vocabulary:", vectorizer.get_feature_names_out())
# ['fun', 'is', 'language', 'learning', 'love', 'machine', 'natural', 'processing']

# View the document-term matrix
print("\nDocument-Term Matrix:")
print(bow_matrix.toarray())
# [[0 0 0 1 1 1 0 0]
#  [0 0 1 0 1 0 1 1]
#  [1 1 0 1 0 1 0 0]]
```

> **Note:** CountVectorizer automatically lowercases text and removes single-character words (like "I") by default.

---

## Configuring CountVectorizer

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "The cat sat on the mat.",
    "The dog sat on the log.",
    "Cats and dogs are friends.",
]

# Common configuration options
vectorizer = CountVectorizer(
    lowercase=True,         # Convert to lowercase (default)
    stop_words='english',   # Remove common English words
    max_features=100,       # Keep only top 100 words
    min_df=1,               # Minimum document frequency
    max_df=0.9,             # Maximum document frequency (as fraction)
    token_pattern=r'\b\w+\b'  # What counts as a "word"
)

bow_matrix = vectorizer.fit_transform(documents)
print("Vocabulary:", vectorizer.get_feature_names_out())
print("Matrix shape:", bow_matrix.shape)
print(bow_matrix.toarray())
```

---

## Binary BoW vs Count BoW

### Count BoW (default)

Records how many times each word appears:

```python
doc = "the cat sat on the mat the cat"
# the=3, cat=2, sat=1, on=1, mat=1
```

### Binary BoW

Records only whether a word appears (1) or not (0):

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "the cat sat on the mat the cat",
    "the dog played in the park",
]

# Binary mode — only presence/absence
binary_vectorizer = CountVectorizer(binary=True)
binary_matrix = binary_vectorizer.fit_transform(documents)

print("Vocabulary:", binary_vectorizer.get_feature_names_out())
print("Binary Matrix:")
print(binary_matrix.toarray())
# [[1 1 0 1 0 1 0 1]    ← "the" appears 3 times but still shows as 1
#  [1 0 1 0 1 0 1 1]]
```

**When to use binary?**
- When word presence matters more than frequency
- For short texts (tweets, headlines) where counts rarely exceed 1
- When you want to reduce the effect of repeated words

---

## N-gram Bag of Words

A limitation of basic BoW is that it loses all word order. **N-grams** capture some order by considering sequences of N consecutive words:

- **Unigram (1-gram):** single words → "machine", "learning"
- **Bigram (2-gram):** word pairs → "machine learning"
- **Trigram (3-gram):** word triples → "natural language processing"

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "machine learning is great",
    "deep learning is also great",
    "machine learning and deep learning",
]

# Unigrams only (default)
uni_vec = CountVectorizer(ngram_range=(1, 1))
uni_matrix = uni_vec.fit_transform(documents)
print("Unigrams:", uni_vec.get_feature_names_out())

# Bigrams only
bi_vec = CountVectorizer(ngram_range=(2, 2))
bi_matrix = bi_vec.fit_transform(documents)
print("\nBigrams:", bi_vec.get_feature_names_out())

# Both unigrams and bigrams
uni_bi_vec = CountVectorizer(ngram_range=(1, 2))
uni_bi_matrix = uni_bi_vec.fit_transform(documents)
print("\nUni+Bigrams:", uni_bi_vec.get_feature_names_out())
```

Output:

```
Unigrams: ['also' 'and' 'deep' 'great' 'is' 'learning' 'machine']

Bigrams: ['also great' 'and deep' 'deep learning' 'is also' 'is great'
           'learning and' 'learning is' 'machine learning']

Uni+Bigrams: ['also' 'also great' 'and' 'and deep' 'deep' 'deep learning'
              'great' 'is' 'is also' 'is great' 'learning' 'learning and'
              'learning is' 'machine' 'machine learning']
```

---

## Limitations of Bag of Words

### 1. No Word Order

```python
# These have IDENTICAL BoW representations:
doc1 = "the dog bit the man"
doc2 = "the man bit the dog"

vectorizer = CountVectorizer()
matrix = vectorizer.fit_transform([doc1, doc2])
print(matrix.toarray())
# [[1 1 1 1 2]
#  [1 1 1 1 2]]  ← Same vectors!
```

### 2. No Semantic Understanding

"Good" and "excellent" are treated as completely different, unrelated words.

### 3. Sparse, High-Dimensional Vectors

With a vocabulary of 50,000 words, each document vector has 50,000 dimensions — and most values are 0.

### 4. Common Words Dominate

Words like "the", "is", "and" appear in every document and add noise.

---

## Visualizing the Document-Term Matrix

```python
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "Python is great for machine learning",
    "Java is popular for web development",
    "Python and Java are programming languages",
    "Machine learning uses Python libraries",
    "Web development frameworks include React",
]

vectorizer = CountVectorizer(stop_words='english')
bow_matrix = vectorizer.fit_transform(documents)

feature_names = vectorizer.get_feature_names_out()
dense_matrix = bow_matrix.toarray()

# Print formatted document-term matrix
print(f"{'Document':<8}", end="")
for name in feature_names:
    print(f"{name:<14}", end="")
print()
print("-" * (8 + 14 * len(feature_names)))

for i, row in enumerate(dense_matrix):
    print(f"Doc {i+1:<4}", end="")
    for val in row:
        print(f"{val:<14}", end="")
    print()

# Document similarity using dot product
print("\nDocument Similarity (dot product):")
similarity = np.dot(dense_matrix, dense_matrix.T)
for i in range(len(documents)):
    for j in range(len(documents)):
        print(f"{similarity[i][j]:4}", end=" ")
    print()
```

---

## Practical Example: Text Classification with BoW

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split

# Sample dataset: movie reviews
reviews = [
    "This movie is great and fun",
    "Excellent film with amazing acting",
    "Wonderful story and beautiful cinematography",
    "I loved every moment of this film",
    "Terrible movie waste of time",
    "Awful acting and boring plot",
    "Worst film I have ever seen",
    "Dull and uninteresting story",
]
labels = [1, 1, 1, 1, 0, 0, 0, 0]  # 1=positive, 0=negative

# Create BoW features
vectorizer = CountVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(reviews)

# Train a classifier
clf = MultinomialNB()
clf.fit(X, labels)

# Predict on new reviews
new_reviews = [
    "This is a great film",
    "Terrible and boring movie",
]
X_new = vectorizer.transform(new_reviews)
predictions = clf.predict(X_new)

for review, pred in zip(new_reviews, predictions):
    sentiment = "Positive" if pred == 1 else "Negative"
    print(f"'{review}' → {sentiment}")
# 'This is a great film' → Positive
# 'Terrible and boring movie' → Negative
```

---

## BoW Pipeline Summary

```
Raw Text → Tokenization → Vocabulary Building → Vectorization → ML Model
    ↓           ↓                ↓                    ↓             ↓
"I love     ["i","love",    {fun:0, i:1,        [0,1,0,1,       Classifier
 NLP"        "nlp"]          love:2, nlp:3}      1,0,1,0]       (e.g. Naive Bayes)
```

---

## Try It Yourself

1. Create a BoW representation of 5 sentences about different topics
2. Experiment with `stop_words`, `max_features`, and `ngram_range`
3. Compare binary BoW vs count BoW for a simple classification task
4. Visualize how vocabulary size grows with more documents

---

## Summary

- **Bag of Words** represents documents as word frequency vectors
- **Vocabulary** = all unique words across your corpus
- **Document-term matrix** = rows are documents, columns are words
- **CountVectorizer** automates BoW construction in scikit-learn
- **Binary BoW** only records presence/absence (not counts)
- **N-grams** partially capture word order (bigrams, trigrams)
- **Limitations:** no word order, no semantics, sparse high-dimensional vectors

Next, we'll learn about TF-IDF — a smarter way to weight words!
