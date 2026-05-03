---
title: TF-IDF
---

# TF-IDF

**TF-IDF** (Term Frequency–Inverse Document Frequency) is a numerical statistic that reflects how important a word is to a document within a collection. It's one of the most widely used text representations in information retrieval and NLP.

---

## The Problem with Raw Word Counts

In Bag of Words, common words like "the", "is", "and" get high counts in every document. But these words don't help distinguish one document from another.

**TF-IDF solves this** by downweighting words that appear everywhere and upweighting words that are distinctive to specific documents.

---

## Term Frequency (TF)

**Term Frequency** measures how often a word appears in a single document:

$$TF(t,d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

Where:
- $f_{t,d}$ = number of times term $t$ appears in document $d$
- $\sum_{t' \in d} f_{t',d}$ = total number of terms in document $d$

### Example

```python
document = "the cat sat on the mat the cat"
words = document.split()
total_words = len(words)  # 8

# Count each word
from collections import Counter
word_counts = Counter(words)
print(word_counts)
# Counter({'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1})

# Calculate TF for each word
tf_scores = {word: count / total_words for word, count in word_counts.items()}
print("TF scores:")
for word, tf in tf_scores.items():
    print(f"  TF('{word}') = {count}/{total_words} = {tf:.4f}")
# TF('the') = 3/8 = 0.3750
# TF('cat') = 2/8 = 0.2500
# TF('sat') = 1/8 = 0.1250
# TF('on')  = 1/8 = 0.1250
# TF('mat') = 1/8 = 0.1250
```

---

## Inverse Document Frequency (IDF)

**IDF** measures how rare or common a word is across all documents:

$$IDF(t,D) = \log\frac{|D|}{|\{d \in D : t \in d\}|}$$

Where:
- $|D|$ = total number of documents
- $|\{d \in D : t \in d\}|$ = number of documents containing term $t$

### Intuition

| Word | Appears in... | IDF | Meaning |
|------|---------------|-----|---------|
| "the" | All 1000 docs | $\log(1000/1000) = 0$ | Zero importance |
| "Python" | 50 docs | $\log(1000/50) = 3.0$ | Somewhat distinctive |
| "backpropagation" | 3 docs | $\log(1000/3) = 5.8$ | Very distinctive |

### Example

```python
import math

documents = [
    "the cat sat on the mat",
    "the dog played in the park",
    "the cat and the dog are friends",
    "machine learning is fun",
]

N = len(documents)  # 4 documents

# Count document frequency for each word
doc_freq = {}
for doc in documents:
    unique_words = set(doc.split())
    for word in unique_words:
        doc_freq[word] = doc_freq.get(word, 0) + 1

# Calculate IDF
idf_scores = {}
for word, df in doc_freq.items():
    idf_scores[word] = math.log(N / df)

print("IDF scores (selected):")
print(f"  IDF('the')      = log(4/4) = {idf_scores['the']:.4f}")   # appears in all 4
print(f"  IDF('cat')      = log(4/2) = {idf_scores['cat']:.4f}")   # appears in 2
print(f"  IDF('machine')  = log(4/1) = {idf_scores['machine']:.4f}")  # appears in 1
```

Output:

```
IDF scores (selected):
  IDF('the')      = log(4/4) = 0.0000   ← common word, zero weight
  IDF('cat')      = log(4/2) = 0.6931   ← moderately distinctive
  IDF('machine')  = log(4/1) = 1.3863   ← very distinctive
```

---

## Combining: TF-IDF Score

The final TF-IDF score multiplies TF by IDF:

$$TFIDF(t,d,D) = TF(t,d) \times IDF(t,D)$$

This gives high scores to words that are:
- **Frequent in the current document** (high TF)
- **Rare across other documents** (high IDF)

And low scores to words that are:
- Rare in the current document (low TF), OR
- Common across all documents (low IDF)

### Manual Calculation

```python
import math
from collections import Counter

documents = [
    "machine learning is great for data science",
    "data science uses statistical methods",
    "machine learning and deep learning are popular",
    "statistical methods include regression analysis",
]

N = len(documents)

# Step 1: Calculate document frequencies
doc_freq = {}
for doc in documents:
    for word in set(doc.split()):
        doc_freq[word] = doc_freq.get(word, 0) + 1

# Step 2: Calculate IDF for all words
idf = {word: math.log(N / df) for word, df in doc_freq.items()}

# Step 3: Calculate TF-IDF for Document 0
doc = documents[0]
words = doc.split()
word_counts = Counter(words)
total = len(words)

print(f"Document: '{doc}'")
print(f"\n{'Word':<12} {'TF':<8} {'IDF':<8} {'TF-IDF':<8}")
print("-" * 36)

tfidf_scores = {}
for word in sorted(set(words)):
    tf = word_counts[word] / total
    tfidf = tf * idf[word]
    tfidf_scores[word] = tfidf
    print(f"{word:<12} {tf:<8.4f} {idf[word]:<8.4f} {tfidf:<8.4f}")

# Top words by TF-IDF
print("\nMost important words in this document:")
sorted_words = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)
for word, score in sorted_words[:3]:
    print(f"  {word}: {score:.4f}")
```

---

## scikit-learn TfidfVectorizer

In practice, use scikit-learn's `TfidfVectorizer` which handles everything automatically:

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "machine learning is great for data science",
    "data science uses statistical methods",
    "machine learning and deep learning are popular",
    "statistical methods include regression analysis",
]

# Create TF-IDF vectorizer
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

# View vocabulary
feature_names = tfidf_vectorizer.get_feature_names_out()
print("Vocabulary:", feature_names)

# View TF-IDF matrix
print("\nTF-IDF Matrix (rounded):")
import numpy as np
dense = np.round(tfidf_matrix.toarray(), 3)
for i, row in enumerate(dense):
    print(f"Doc {i}: {row}")
```

> **Note:** scikit-learn uses a slightly modified formula with smoothing: $IDF(t) = \log\frac{1 + N}{1 + df(t)} + 1$ and then applies L2 normalization.

---

## Configuring TfidfVectorizer

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "The quick brown fox jumps over the lazy dog",
    "A fast brown fox leaps over a sleepy dog",
    "The dog chased the fox around the yard",
]

# Common configuration options
tfidf = TfidfVectorizer(
    lowercase=True,            # Convert to lowercase
    stop_words='english',      # Remove stop words
    max_features=1000,         # Limit vocabulary size
    ngram_range=(1, 2),        # Unigrams and bigrams
    min_df=1,                  # Minimum document frequency
    max_df=0.95,               # Maximum document frequency
    sublinear_tf=True,         # Apply log normalization to TF: 1 + log(tf)
    norm='l2',                 # L2 normalization (default)
)

tfidf_matrix = tfidf.fit_transform(documents)
print("Features:", tfidf.get_feature_names_out())
print("Matrix shape:", tfidf_matrix.shape)
```

---

## TF-IDF vs Bag of Words

```python
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
import numpy as np

documents = [
    "the movie was great and the acting was great",
    "the movie was terrible and the plot was boring",
    "great acting and wonderful story in this film",
]

# Bag of Words
count_vec = CountVectorizer()
bow_matrix = count_vec.fit_transform(documents)

# TF-IDF
tfidf_vec = TfidfVectorizer()
tfidf_matrix = tfidf_vec.fit_transform(documents)

# Compare "the" and "great" in Document 0
bow_features = count_vec.get_feature_names_out()
tfidf_features = tfidf_vec.get_feature_names_out()

bow_dense = bow_matrix.toarray()
tfidf_dense = tfidf_matrix.toarray()

# In BoW, "the" has a high count
the_idx_bow = list(bow_features).index("the")
great_idx_bow = list(bow_features).index("great")
print("Bag of Words - Document 0:")
print(f"  'the' count: {bow_dense[0][the_idx_bow]}")    # High count
print(f"  'great' count: {bow_dense[0][great_idx_bow]}")

# In TF-IDF, "the" is downweighted
the_idx_tfidf = list(tfidf_features).index("the")
great_idx_tfidf = list(tfidf_features).index("great")
print("\nTF-IDF - Document 0:")
print(f"  'the' score: {tfidf_dense[0][the_idx_tfidf]:.4f}")   # Low score
print(f"  'great' score: {tfidf_dense[0][great_idx_tfidf]:.4f}")  # Higher score
```

### Key Difference

| Aspect | Bag of Words | TF-IDF |
|--------|-------------|--------|
| "the" in every doc | High count | Near zero |
| Rare distinctive word | Same as any word | High weight |
| Normalization | None (raw counts) | L2 normalized |
| Information | How much? | How important? |

---

## Applications of TF-IDF

### 1. Keyword Extraction

Find the most important words in each document:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

documents = [
    "Python programming language is used for web development and data science",
    "JavaScript is the language of the web browsers and frontend development",
    "Machine learning algorithms process data to make predictions",
    "Database systems store and retrieve structured data efficiently",
]

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(documents)
feature_names = tfidf.get_feature_names_out()

# Extract top keywords per document
print("Top 3 keywords per document:")
print("=" * 50)
for i, doc in enumerate(documents):
    # Get TF-IDF scores for this document
    scores = tfidf_matrix[i].toarray().flatten()
    # Get top 3 indices
    top_indices = scores.argsort()[-3:][::-1]
    keywords = [(feature_names[idx], scores[idx]) for idx in top_indices]
    print(f"\nDoc {i+1}: {doc[:50]}...")
    for word, score in keywords:
        print(f"  {word}: {score:.4f}")
```

### 2. Document Similarity

```python
from sklearn.metrics.pairwise import cosine_similarity

# Using TF-IDF matrix from above
similarity_matrix = cosine_similarity(tfidf_matrix)

print("Document Similarity Matrix:")
print("=" * 40)
for i in range(len(documents)):
    for j in range(len(documents)):
        print(f"{similarity_matrix[i][j]:.3f}", end="  ")
    print()
```

### 3. Search Engine (Document Ranking)

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Document corpus
corpus = [
    "Python is a popular programming language for data science",
    "JavaScript frameworks like React are used for web development",
    "Machine learning models can classify text and images",
    "SQL databases store structured data in tables",
    "Natural language processing analyzes human language text",
]

# Fit TF-IDF on corpus
tfidf = TfidfVectorizer(stop_words='english')
corpus_tfidf = tfidf.fit_transform(corpus)

# Search query
query = "text classification with machine learning"
query_tfidf = tfidf.transform([query])

# Rank documents by similarity to query
similarities = cosine_similarity(query_tfidf, corpus_tfidf).flatten()

# Sort by relevance
ranked_indices = similarities.argsort()[::-1]
print(f"Query: '{query}'")
print("\nSearch Results (ranked by relevance):")
for rank, idx in enumerate(ranked_indices, 1):
    if similarities[idx] > 0:
        print(f"  {rank}. [{similarities[idx]:.4f}] {corpus[idx]}")
```

---

## Sublinear TF Scaling

For very long documents, raw TF can be dominated by frequently repeated words. **Sublinear TF** applies logarithmic scaling:

$$TF_{sublinear}(t,d) = 1 + \log(f_{t,d}) \text{ if } f_{t,d} > 0, \text{ else } 0$$

```python
import math

# Compare raw TF vs sublinear TF
word_count = 10
total_words = 100

raw_tf = word_count / total_words
sublinear_tf = 1 + math.log(word_count) if word_count > 0 else 0

print(f"Word appears {word_count} times in {total_words}-word document")
print(f"  Raw TF: {raw_tf:.4f}")
print(f"  Sublinear TF: {sublinear_tf:.4f}")

# In scikit-learn:
# TfidfVectorizer(sublinear_tf=True)
```

---

## Complete Example: Finding Important Words

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# News articles (simplified)
articles = [
    "The stock market reached new highs today as technology stocks led the rally. "
    "Investors are optimistic about quarterly earnings reports from major tech companies.",

    "Scientists discovered a new species of deep-sea fish in the Pacific Ocean. "
    "The creature lives at depths of over 3000 meters and has bioluminescent features.",

    "The local football team won the championship game in overtime. "
    "The quarterback threw the winning touchdown with just seconds remaining on the clock.",

    "New research shows that regular exercise can improve memory and cognitive function. "
    "Scientists recommend at least 30 minutes of moderate exercise five days per week.",
]

categories = ["Finance", "Science", "Sports", "Health"]

# Create TF-IDF representation
tfidf = TfidfVectorizer(
    stop_words='english',
    max_features=50,
    ngram_range=(1, 2),
)
tfidf_matrix = tfidf.fit_transform(articles)
feature_names = tfidf.get_feature_names_out()

# Show top 5 keywords for each article
print("Top 5 Keywords by TF-IDF Score")
print("=" * 60)

for i, (article, category) in enumerate(zip(articles, categories)):
    scores = tfidf_matrix[i].toarray().flatten()
    top_indices = scores.argsort()[-5:][::-1]

    print(f"\n[{category}] Article {i+1}:")
    for idx in top_indices:
        if scores[idx] > 0:
            print(f"  • {feature_names[idx]:<20} (score: {scores[idx]:.4f})")

# Find most similar articles
from sklearn.metrics.pairwise import cosine_similarity
sim_matrix = cosine_similarity(tfidf_matrix)
print("\n\nArticle Similarity:")
for i in range(len(articles)):
    for j in range(i+1, len(articles)):
        print(f"  {categories[i]} vs {categories[j]}: {sim_matrix[i][j]:.4f}")
```

---

## TF-IDF Variants

| Variant | Formula | Use Case |
|---------|---------|----------|
| Standard | $TF \times IDF$ | General purpose |
| Sublinear TF | $(1 + \log TF) \times IDF$ | Long documents |
| Smoothed IDF | $\log\frac{N+1}{df+1} + 1$ | Avoid division by zero |
| BM25 | Modified TF-IDF with length normalization | Search engines |

---

## Try It Yourself

1. Compare the top keywords from TF-IDF vs raw BoW — which gives more meaningful results?
2. Build a simple search engine that ranks documents by TF-IDF cosine similarity
3. Experiment with `sublinear_tf=True` — how does it change the results?
4. Use TF-IDF + a classifier to build a spam detector

---

## Summary

- **TF** measures how often a word appears in a document: $TF(t,d) = \frac{f_{t,d}}{\sum f}$
- **IDF** measures how rare a word is across documents: $IDF(t,D) = \log\frac{|D|}{df(t)}$
- **TF-IDF** = $TF \times IDF$ — high for distinctive words, low for common words
- **TfidfVectorizer** in scikit-learn automates the computation
- TF-IDF **downweights** stopwords and **upweights** topic-specific terms
- Applications: **keyword extraction**, **document similarity**, **search ranking**

Next, we'll explore word embeddings — dense vector representations that capture semantic meaning!
