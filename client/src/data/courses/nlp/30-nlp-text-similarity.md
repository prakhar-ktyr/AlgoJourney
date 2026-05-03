---
title: Text Similarity & Distance
---

# Text Similarity & Distance

Measuring how similar two pieces of text are is fundamental to many NLP applications — from search engines to plagiarism detection to recommendation systems.

---

## Why Measure Text Similarity?

| Application | What You Compare |
|-------------|-----------------|
| **Search engines** | Query vs documents |
| **Duplicate detection** | Document vs document |
| **Plagiarism detection** | Student work vs sources |
| **FAQ matching** | User question vs FAQ database |
| **Recommendation** | User preferences vs item descriptions |
| **Paraphrase detection** | Sentence vs sentence |

---

## Types of Similarity

1. **String-based** — character-level operations (edit distance, Jaccard)
2. **Token-based** — word overlap and frequency (cosine on TF-IDF)
3. **Semantic** — meaning-based (embeddings, sentence transformers)

Each captures a different aspect of similarity:

```
"The cat sat on the mat" vs "A cat was sitting on a mat"
├── String similarity: moderate (different characters)
├── Token similarity: high (shared words)
└── Semantic similarity: very high (same meaning)
```

---

## String-Based: Edit Distance (Levenshtein)

**Edit distance** counts the minimum number of single-character operations (insert, delete, replace) to transform one string into another.

$$\text{Levenshtein}(\text{"kitten"}, \text{"sitting"}) = 3$$

Operations: **k**itten → **s**itten → sitt**e**n → sittin**g**

```python
def levenshtein_distance(s1, s2):
    """Calculate Levenshtein distance using dynamic programming."""
    m, n = len(s1), len(s2)

    # Create distance matrix
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Base cases
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Fill matrix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]  # No operation needed
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # Deletion
                    dp[i][j - 1],      # Insertion
                    dp[i - 1][j - 1],  # Replacement
                )

    return dp[m][n]


def normalized_levenshtein(s1, s2):
    """Normalize edit distance to 0-1 similarity."""
    dist = levenshtein_distance(s1, s2)
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    return 1 - (dist / max_len)


# Examples
pairs = [
    ("kitten", "sitting"),
    ("python", "python"),
    ("hello", "hallo"),
    ("machine learning", "machine leaning"),
    ("natural language", "naturel langage"),
]

print(f"{'String 1':<20} {'String 2':<20} {'Distance':>8} {'Similarity':>10}")
print("-" * 62)
for s1, s2 in pairs:
    dist = levenshtein_distance(s1, s2)
    sim = normalized_levenshtein(s1, s2)
    print(f"{s1:<20} {s2:<20} {dist:>8} {sim:>10.3f}")
```

### Using the `python-Levenshtein` Library

```python
# Install: pip install python-Levenshtein
# Much faster C implementation
import Levenshtein

s1 = "natural language processing"
s2 = "natural languag procesing"

distance = Levenshtein.distance(s1, s2)
ratio = Levenshtein.ratio(s1, s2)  # Normalized similarity

print(f"Distance: {distance}")
print(f"Similarity ratio: {ratio:.3f}")
```

---

## String-Based: Jaccard Similarity

**Jaccard similarity** measures the overlap between two sets:

$$\text{Jaccard}(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

For text, the sets can be words, n-grams, or characters:

```python
def jaccard_similarity(text1, text2, level="word"):
    """Calculate Jaccard similarity at word or character n-gram level."""
    if level == "word":
        set1 = set(text1.lower().split())
        set2 = set(text2.lower().split())
    elif level == "char_ngram":
        n = 3  # trigrams
        set1 = set(text1.lower()[i:i+n] for i in range(len(text1) - n + 1))
        set2 = set(text2.lower()[i:i+n] for i in range(len(text2) - n + 1))
    else:
        set1 = set(text1.lower())
        set2 = set(text2.lower())

    intersection = set1 & set2
    union = set1 | set2

    if not union:
        return 0.0

    return len(intersection) / len(union)


# Examples
pairs = [
    ("the cat sat on the mat", "the cat is on the mat"),
    ("machine learning is fun", "deep learning is fascinating"),
    ("hello world", "goodbye world"),
    ("python programming", "programming in python"),
]

print("Jaccard Similarity (word-level):")
print("=" * 65)
for t1, t2 in pairs:
    sim = jaccard_similarity(t1, t2, level="word")
    print(f"\n  '{t1}'")
    print(f"  '{t2}'")
    print(f"  Similarity: {sim:.3f}")

    # Show the sets
    s1 = set(t1.lower().split())
    s2 = set(t2.lower().split())
    print(f"  Intersection: {s1 & s2}")
```

---

## Vector-Based: Cosine Similarity

**Cosine similarity** measures the angle between two vectors, regardless of magnitude:

$$\cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{|\vec{A}| \cdot |\vec{B}|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}$$

- Result: 0 (orthogonal/unrelated) to 1 (identical direction)
- Most popular similarity metric for text vectors

```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def cosine_sim_manual(vec1, vec2):
    """Calculate cosine similarity manually."""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)


# Using TF-IDF vectors
documents = [
    "Python is a great programming language for data science",
    "Python programming is widely used in machine learning",
    "Java is a popular language for enterprise applications",
    "The weather today is sunny and warm outside",
    "I enjoy cooking Italian food on weekends",
]

# Vectorize
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(documents)

# Calculate pairwise cosine similarity
similarity_matrix = cosine_similarity(tfidf_matrix)

print("Cosine Similarity Matrix (TF-IDF):")
print("=" * 60)
print(f"{'':>4}", end="")
for i in range(len(documents)):
    print(f"  Doc{i}", end="")
print()

for i in range(len(documents)):
    print(f"Doc{i}", end="")
    for j in range(len(documents)):
        sim = similarity_matrix[i][j]
        print(f"  {sim:.2f}", end="")
    print(f"  | {documents[i][:35]}...")
print()

# Find most similar pair
max_sim = 0
max_pair = (0, 0)
for i in range(len(documents)):
    for j in range(i + 1, len(documents)):
        if similarity_matrix[i][j] > max_sim:
            max_sim = similarity_matrix[i][j]
            max_pair = (i, j)

print(f"\nMost similar pair (score: {max_sim:.3f}):")
print(f"  Doc{max_pair[0]}: {documents[max_pair[0]]}")
print(f"  Doc{max_pair[1]}: {documents[max_pair[1]]}")
```

---

## Comparing Similarity Metrics

```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances


def compare_metrics(text1, text2):
    """Compare multiple similarity metrics for two texts."""
    # Jaccard (word-level)
    s1 = set(text1.lower().split())
    s2 = set(text2.lower().split())
    jaccard = len(s1 & s2) / len(s1 | s2) if s1 | s2 else 0

    # Cosine similarity (TF-IDF)
    vec = TfidfVectorizer(stop_words="english")
    tfidf = vec.fit_transform([text1, text2])
    cosine = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]

    # Euclidean distance (normalized to similarity)
    euclidean = euclidean_distances(tfidf[0:1], tfidf[1:2])[0][0]
    euclidean_sim = 1 / (1 + euclidean)

    # Overlap coefficient
    overlap = len(s1 & s2) / min(len(s1), len(s2)) if min(len(s1), len(s2)) > 0 else 0

    return {
        "jaccard": jaccard,
        "cosine": cosine,
        "euclidean_sim": euclidean_sim,
        "overlap": overlap,
    }


# Test cases
test_pairs = [
    ("machine learning is the future of AI",
     "artificial intelligence uses machine learning algorithms"),
    ("the quick brown fox jumps over the lazy dog",
     "the quick brown fox leaped over the lazy dog"),
    ("I love programming in Python",
     "Python programming is my passion"),
    ("the stock market crashed today",
     "I went grocery shopping this morning"),
]

print("Similarity Metrics Comparison:")
print("=" * 70)

for t1, t2 in test_pairs:
    metrics = compare_metrics(t1, t2)
    print(f"\n  Text 1: '{t1}'")
    print(f"  Text 2: '{t2}'")
    print(f"  {'Jaccard:':<15} {metrics['jaccard']:.3f}")
    print(f"  {'Cosine:':<15} {metrics['cosine']:.3f}")
    print(f"  {'Euclidean sim:':<15} {metrics['euclidean_sim']:.3f}")
    print(f"  {'Overlap:':<15} {metrics['overlap']:.3f}")
```

---

## Semantic Similarity with Sentence Embeddings

Token-based methods miss semantic similarity. **Sentence embeddings** capture meaning:

```python
# Install: pip install sentence-transformers
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load pre-trained model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Sentences with different wording but similar meaning
sentences = [
    "The cat is sitting on the mat",           # 0
    "A feline rests upon the rug",             # 1 - paraphrase of 0
    "The dog is playing in the park",          # 2
    "A canine is having fun outdoors",         # 3 - paraphrase of 2
    "The stock market crashed yesterday",      # 4
    "Financial markets experienced a downturn", # 5 - paraphrase of 4
]

# Generate embeddings
embeddings = model.encode(sentences)
print(f"Embedding shape: {embeddings.shape}")  # (6, 384)

# Calculate semantic similarity
sim_matrix = cosine_similarity(embeddings)

print("\nSemantic Similarity Matrix:")
print("-" * 50)
for i in range(len(sentences)):
    for j in range(i + 1, len(sentences)):
        sim = sim_matrix[i][j]
        if sim > 0.5:
            marker = "✓ Similar"
        else:
            marker = "✗ Different"
        print(f"  [{i}] vs [{j}]: {sim:.3f}  {marker}")
        if sim > 0.5:
            print(f"       '{sentences[i]}'")
            print(f"       '{sentences[j]}'")

# Compare semantic vs lexical similarity
print("\n\nSemantic vs Lexical Comparison:")
print("=" * 60)

pair = ("The automobile is fast", "The car has great speed")
s1, s2 = pair

# Lexical (Jaccard)
words1 = set(s1.lower().split())
words2 = set(s2.lower().split())
jaccard = len(words1 & words2) / len(words1 | words2)

# Semantic
emb = model.encode([s1, s2])
semantic = cosine_similarity([emb[0]], [emb[1]])[0][0]

print(f"  '{s1}'")
print(f"  '{s2}'")
print(f"  Jaccard (lexical): {jaccard:.3f}")
print(f"  Cosine (semantic): {semantic:.3f}")
print(f"  → Semantically similar but lexically different!")
```

---

## Word Mover's Distance (WMD)

**WMD** uses word embeddings to measure the minimum distance words in one document need to "travel" to match words in another:

```python
import numpy as np
from gensim.models import KeyedVectors

# Load word vectors (download from gensim-data or use pre-trained)
# For demonstration, we'll use a simple approach
# In production: model = KeyedVectors.load_word2vec_format("GoogleNews-vectors.bin", binary=True)

# Simplified WMD with sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def word_centroid_distance(text1, text2, model):
    """Approximate WMD using word centroids."""
    # Encode individual words
    words1 = text1.lower().split()
    words2 = text2.lower().split()

    if not words1 or not words2:
        return float("inf")

    # Get word embeddings
    emb1 = model.encode(words1)
    emb2 = model.encode(words2)

    # Centroid of each text
    centroid1 = emb1.mean(axis=0)
    centroid2 = emb2.mean(axis=0)

    # Euclidean distance between centroids
    distance = np.linalg.norm(centroid1 - centroid2)
    # Convert to similarity
    similarity = 1 / (1 + distance)

    return similarity


# Example
pairs = [
    ("The president addressed the nation", "The leader spoke to the country"),
    ("The cat chased the mouse", "The dog ran after the ball"),
    ("Stock prices rose sharply", "The weather is beautiful today"),
]

print("Semantic Distance (Word Centroid):")
print("=" * 55)
for t1, t2 in pairs:
    sim = word_centroid_distance(t1, t2, model)
    print(f"\n  '{t1}'")
    print(f"  '{t2}'")
    print(f"  Similarity: {sim:.3f}")
```

---

## Building a Simple Search Engine

Combine similarity metrics to build a search engine:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class SimpleSearchEngine:
    """A simple TF-IDF based search engine."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=10000,
        )
        self.documents = []
        self.tfidf_matrix = None

    def index(self, documents):
        """Index a collection of documents."""
        self.documents = documents
        self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        print(f"Indexed {len(documents)} documents")
        print(f"Vocabulary size: {len(self.vectorizer.vocabulary_)}")

    def search(self, query, top_k=5):
        """Search for documents matching a query."""
        query_vector = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]

        # Get top-k results
        top_indices = similarities.argsort()[-top_k:][::-1]
        results = []

        for idx in top_indices:
            score = similarities[idx]
            if score > 0:  # Only return relevant results
                results.append({
                    "rank": len(results) + 1,
                    "score": float(score),
                    "document": self.documents[idx],
                    "index": int(idx),
                })

        return results

    def find_similar(self, doc_index, top_k=3):
        """Find documents similar to a given document."""
        doc_vector = self.tfidf_matrix[doc_index:doc_index + 1]
        similarities = cosine_similarity(doc_vector, self.tfidf_matrix)[0]

        # Exclude the document itself
        similarities[doc_index] = -1
        top_indices = similarities.argsort()[-top_k:][::-1]

        results = []
        for idx in top_indices:
            if similarities[idx] > 0:
                results.append({
                    "score": float(similarities[idx]),
                    "document": self.documents[idx],
                })
        return results


# Create and populate search engine
engine = SimpleSearchEngine()

corpus = [
    "Introduction to machine learning with Python and scikit-learn",
    "Deep learning neural networks for image classification",
    "Natural language processing with transformers and BERT",
    "Building web applications with Django and Flask frameworks",
    "Data visualization using matplotlib and seaborn libraries",
    "Statistical analysis and hypothesis testing with scipy",
    "Database design and SQL queries for data management",
    "Cloud computing with AWS Lambda and serverless architecture",
    "Computer vision techniques for object detection and tracking",
    "Reinforcement learning algorithms for game playing agents",
    "Time series forecasting with ARIMA and Prophet models",
    "Recommendation systems using collaborative filtering",
    "API development with FastAPI and RESTful design patterns",
    "Text mining and information extraction from documents",
    "Microservices architecture with Docker and Kubernetes",
]

engine.index(corpus)

# Search examples
queries = [
    "how to build AI models",
    "web development framework",
    "working with text data",
    "deploying applications to cloud",
]

for query in queries:
    print(f"\n🔍 Query: '{query}'")
    print("-" * 50)
    results = engine.search(query, top_k=3)
    for r in results:
        print(f"  [{r['rank']}] (score: {r['score']:.3f}) {r['document']}")

# Find similar documents
print("\n\n📄 Documents similar to: 'Introduction to machine learning...'")
print("-" * 50)
similar = engine.find_similar(0, top_k=3)
for doc in similar:
    print(f"  (score: {doc['score']:.3f}) {doc['document']}")
```

---

## Semantic Search with Sentence Embeddings

For better results, use sentence embeddings instead of TF-IDF:

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class SemanticSearchEngine:
    """Semantic search using sentence embeddings."""

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.documents = []
        self.embeddings = None

    def index(self, documents):
        """Encode and index documents."""
        self.documents = documents
        self.embeddings = self.model.encode(documents, show_progress_bar=True)
        print(f"Indexed {len(documents)} documents (dim: {self.embeddings.shape[1]})")

    def search(self, query, top_k=5):
        """Semantic search — finds meaning, not just keywords."""
        query_embedding = self.model.encode([query])
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]

        top_indices = similarities.argsort()[-top_k:][::-1]
        results = []

        for idx in top_indices:
            results.append({
                "rank": len(results) + 1,
                "score": float(similarities[idx]),
                "document": self.documents[idx],
            })

        return results


# Semantic search handles paraphrases and synonyms
semantic_engine = SemanticSearchEngine()
semantic_engine.index(corpus)

# These queries use different words than the documents
semantic_queries = [
    "how to predict outcomes using data",       # → machine learning
    "creating websites and web apps",           # → web development
    "understanding written language with AI",   # → NLP
    "putting software on remote servers",       # → cloud computing
]

print("Semantic Search Results:")
print("=" * 60)
for query in semantic_queries:
    print(f"\n🔍 '{query}'")
    results = semantic_engine.search(query, top_k=2)
    for r in results:
        print(f"   [{r['rank']}] ({r['score']:.3f}) {r['document']}")
```

---

## Duplicate Detection

Use similarity thresholds to find near-duplicate documents:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def find_duplicates(documents, threshold=0.8):
    """Find near-duplicate documents using cosine similarity."""
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(documents)
    sim_matrix = cosine_similarity(tfidf)

    duplicates = []
    for i in range(len(documents)):
        for j in range(i + 1, len(documents)):
            if sim_matrix[i][j] >= threshold:
                duplicates.append({
                    "doc1_idx": i,
                    "doc2_idx": j,
                    "similarity": sim_matrix[i][j],
                    "doc1": documents[i],
                    "doc2": documents[j],
                })

    return sorted(duplicates, key=lambda x: -x["similarity"])


# Test with near-duplicates
docs = [
    "Machine learning is a subset of artificial intelligence",
    "ML is a branch of AI that learns from data",
    "The weather forecast predicts rain tomorrow",
    "Tomorrow's weather prediction shows rainfall",
    "Python is great for data science projects",
    "I went to the grocery store yesterday",
    "Machine learning, a subset of AI, enables computers to learn",
]

print("Duplicate Detection (threshold: 0.5):")
print("=" * 60)
dupes = find_duplicates(docs, threshold=0.5)

if dupes:
    for d in dupes:
        print(f"\n  Similarity: {d['similarity']:.3f}")
        print(f"  Doc {d['doc1_idx']}: '{d['doc1']}'")
        print(f"  Doc {d['doc2_idx']}: '{d['doc2']}'")
else:
    print("  No duplicates found at this threshold.")
```

---

## Summary of Similarity Metrics

| Metric | Type | Range | Best For |
|--------|------|-------|----------|
| **Levenshtein** | String | 0 to ∞ (distance) | Typo detection, fuzzy matching |
| **Jaccard** | Set-based | 0 to 1 | Word overlap, short texts |
| **Cosine (TF-IDF)** | Vector | 0 to 1 | Document similarity |
| **Cosine (embeddings)** | Semantic | -1 to 1 | Meaning similarity |
| **WMD** | Semantic | 0 to ∞ (distance) | Short text comparison |
| **Euclidean** | Vector | 0 to ∞ (distance) | Dense feature spaces |

---

## Choosing the Right Metric

| Scenario | Recommended |
|----------|-------------|
| Spell checking / typo correction | Levenshtein |
| Keyword overlap | Jaccard |
| Document retrieval / search | Cosine + TF-IDF |
| Semantic similarity (paraphrases) | Cosine + embeddings |
| FAQ matching | Sentence embeddings |
| Plagiarism detection | Cosine + n-grams |

---

## Summary

- **Edit distance** measures character-level changes between strings
- **Jaccard similarity** = $\frac{|A \cap B|}{|A \cup B|}$ — measures set overlap
- **Cosine similarity** = $\frac{\vec{A} \cdot \vec{B}}{|\vec{A}||\vec{B}|}$ — measures vector angle
- **TF-IDF + cosine** is the standard for document-level similarity
- **Sentence embeddings** capture semantic meaning beyond word overlap
- Different metrics suit different use cases — choose based on your needs
- Combine metrics for robust applications (search, deduplication)

---

## What You've Learned

In this section, you've mastered key NLP classification and analysis techniques:
- **Naive Bayes** for text classification
- **Sentiment Analysis** to detect opinions and emotions
- **Topic Modeling** to discover hidden themes
- **Text Clustering** to group similar documents
- **Text Similarity** to measure and compare text

These form the foundation for building real-world NLP applications like search engines, recommendation systems, and content analysis tools.
