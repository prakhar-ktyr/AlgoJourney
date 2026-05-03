---
title: Information Retrieval & Search
---

# Information Retrieval & Search

**Information Retrieval (IR)** is the science of finding relevant documents from a large collection based on a user's query. Every search engine — from Google to your email search — uses IR techniques.

In this lesson, you will learn how search engines work and build one from scratch.

---

## What is Information Retrieval?

Given:
- A **collection** of documents (corpus)
- A **query** from the user

The goal is to return the **most relevant documents** ranked by relevance.

### Key Terminology

| Term | Meaning |
|------|---------|
| **Document** | A text unit (web page, article, email) |
| **Corpus** | The full collection of documents |
| **Query** | What the user is searching for |
| **Relevance** | How well a document satisfies the query |
| **Index** | Data structure for fast retrieval |

---

## Boolean Retrieval

The simplest IR model uses **Boolean logic**:

- **AND**: Both terms must appear → `python AND machine learning`
- **OR**: Either term can appear → `python OR java`
- **NOT**: Term must not appear → `python NOT snake`

```python
class BooleanSearch:
    """Simple Boolean retrieval system."""

    def __init__(self, documents):
        self.documents = documents
        self.index = self._build_index()

    def _build_index(self):
        """Build an inverted index."""
        index = {}
        for doc_id, doc in enumerate(self.documents):
            words = set(doc.lower().split())
            for word in words:
                if word not in index:
                    index[word] = set()
                index[word].add(doc_id)
        return index

    def search(self, query):
        """Perform Boolean AND search."""
        terms = query.lower().split()
        if not terms:
            return []

        # Start with docs containing the first term
        result = self.index.get(terms[0], set()).copy()

        # Intersect with docs containing remaining terms
        for term in terms[1:]:
            result &= self.index.get(term, set())

        return [self.documents[i] for i in sorted(result)]


# Example
documents = [
    "Python is a programming language",
    "Machine learning uses Python extensively",
    "Java is another popular programming language",
    "Deep learning is a subset of machine learning",
    "Python and Java are both used in data science",
]

search = BooleanSearch(documents)

print("Query: 'python programming'")
results = search.search("python programming")
for r in results:
    print(f"  → {r}")

print("\nQuery: 'machine learning'")
results = search.search("machine learning")
for r in results:
    print(f"  → {r}")
```

**Output:**
```
Query: 'python programming'
  → Python is a programming language

Query: 'machine learning'
  → Machine learning uses Python extensively
  → Deep learning is a subset of machine learning
```

---

## Inverted Index

An **inverted index** maps each term to the list of documents containing it. It's the backbone of all search engines.

```python
from collections import defaultdict
import re

class InvertedIndex:
    """Production-style inverted index with term frequencies."""

    def __init__(self):
        self.index = defaultdict(list)  # term → [(doc_id, frequency)]
        self.documents = {}
        self.doc_count = 0

    def tokenize(self, text):
        """Simple tokenization: lowercase and split on non-alphanumeric."""
        return re.findall(r"\w+", text.lower())

    def add_document(self, doc_id, text):
        """Add a document to the index."""
        self.documents[doc_id] = text
        self.doc_count += 1

        # Count term frequencies
        tokens = self.tokenize(text)
        term_freq = defaultdict(int)
        for token in tokens:
            term_freq[token] += 1

        # Add to inverted index
        for term, freq in term_freq.items():
            self.index[term].append((doc_id, freq))

    def search(self, query):
        """Find documents containing all query terms."""
        terms = self.tokenize(query)
        if not terms:
            return []

        # Get posting lists for each term
        posting_lists = []
        for term in terms:
            if term in self.index:
                doc_ids = {doc_id for doc_id, _ in self.index[term]}
                posting_lists.append(doc_ids)
            else:
                return []  # Term not found → no results

        # Intersect all posting lists
        result = posting_lists[0]
        for pl in posting_lists[1:]:
            result &= pl

        return sorted(result)

    def stats(self):
        """Print index statistics."""
        print(f"Documents: {self.doc_count}")
        print(f"Unique terms: {len(self.index)}")
        total_postings = sum(len(v) for v in self.index.values())
        print(f"Total postings: {total_postings}")


# Build an index
idx = InvertedIndex()
docs = [
    "Introduction to natural language processing",
    "Deep learning for NLP tasks",
    "Information retrieval and search engines",
    "Natural language understanding with transformers",
    "Building search engines with Python",
    "NLP applications in information extraction",
]

for i, doc in enumerate(docs):
    idx.add_document(i, doc)

idx.stats()
print()

# Search
queries = ["natural language", "search engines", "NLP"]
for q in queries:
    results = idx.search(q)
    print(f"Query: '{q}' → Documents: {results}")
```

---

## Vector Space Model: TF-IDF

The **vector space model** represents documents and queries as vectors. **TF-IDF** weights terms by importance:

### Term Frequency (TF)

How often a term appears in a document:

$$TF(t, d) = \frac{\text{count of } t \text{ in } d}{\text{total terms in } d}$$

### Inverse Document Frequency (IDF)

How rare a term is across all documents:

$$IDF(t) = \log\frac{N}{df(t)}$$

where $N$ is total documents and $df(t)$ is how many documents contain $t$.

### TF-IDF Score

$$TF\text{-}IDF(t, d) = TF(t, d) \times IDF(t)$$

### Cosine Similarity

To rank documents, compute the cosine between query and document vectors:

$$\cos(\theta) = \frac{\vec{q} \cdot \vec{d}}{|\vec{q}| \cdot |\vec{d}|}$$

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Document corpus
corpus = [
    "Machine learning algorithms for classification",
    "Deep learning neural networks and backpropagation",
    "Natural language processing with transformers",
    "Computer vision and image recognition",
    "Reinforcement learning and game playing",
    "Data preprocessing and feature engineering",
    "Statistical methods for data analysis",
    "Transfer learning in deep neural networks",
]

# Build TF-IDF matrix
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(corpus)

print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"  → {tfidf_matrix.shape[0]} documents, {tfidf_matrix.shape[1]} terms")
print()

def tfidf_search(query, top_k=3):
    """Search documents using TF-IDF cosine similarity."""
    query_vector = vectorizer.transform([query])
    scores = cosine_similarity(query_vector, tfidf_matrix)[0]

    # Rank by score
    ranked_indices = np.argsort(scores)[::-1][:top_k]

    print(f"Query: '{query}'")
    print(f"Top {top_k} results:")
    for rank, idx in enumerate(ranked_indices, 1):
        if scores[idx] > 0:
            print(f"  {rank}. [{scores[idx]:.3f}] {corpus[idx]}")
    print()

tfidf_search("neural networks deep learning")
tfidf_search("text processing language")
tfidf_search("data analysis statistics")
```

---

## BM25: The Classic Ranking Function

**BM25** (Best Matching 25) is the industry-standard ranking function used by Elasticsearch, Lucene, and many search engines. It improves on TF-IDF with better term frequency saturation and document length normalization.

### The Formula

$$BM25(d, q) = \sum_{t \in q} IDF(t) \cdot \frac{TF(t,d) \cdot (k_1 + 1)}{TF(t,d) + k_1 \cdot \left(1 - b + b \cdot \frac{|d|}{avgdl}\right)}$$

Where:
- $TF(t, d)$ = term frequency of $t$ in document $d$
- $IDF(t) = \log\frac{N - df(t) + 0.5}{df(t) + 0.5}$
- $|d|$ = document length
- $avgdl$ = average document length
- $k_1$ = term frequency saturation parameter (typically 1.2–2.0)
- $b$ = length normalization parameter (typically 0.75)

### Key Insights

- **TF saturation**: Unlike raw TF, BM25 has diminishing returns — the 10th occurrence of a word adds less than the 2nd
- **Length normalization**: Longer documents don't get unfair advantage
- **IDF weighting**: Rare terms contribute more to relevance

```python
import numpy as np
from collections import Counter
import re

class BM25:
    """BM25 ranking algorithm implementation."""

    def __init__(self, documents, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.documents = documents
        self.doc_count = len(documents)

        # Tokenize all documents
        self.doc_tokens = [self._tokenize(doc) for doc in documents]
        self.doc_lengths = [len(tokens) for tokens in self.doc_tokens]
        self.avgdl = np.mean(self.doc_lengths)

        # Build term frequencies and document frequencies
        self.tf = []  # term frequency per document
        self.df = Counter()  # document frequency

        for tokens in self.doc_tokens:
            tf = Counter(tokens)
            self.tf.append(tf)
            for term in set(tokens):
                self.df[term] += 1

    def _tokenize(self, text):
        """Tokenize text into lowercase words."""
        return re.findall(r"\w+", text.lower())

    def _idf(self, term):
        """Calculate IDF for a term."""
        df = self.df.get(term, 0)
        return np.log((self.doc_count - df + 0.5) / (df + 0.5) + 1)

    def score(self, query):
        """Score all documents for a query."""
        query_terms = self._tokenize(query)
        scores = np.zeros(self.doc_count)

        for term in query_terms:
            idf = self._idf(term)

            for doc_idx in range(self.doc_count):
                tf = self.tf[doc_idx].get(term, 0)
                doc_len = self.doc_lengths[doc_idx]

                # BM25 formula
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                scores[doc_idx] += idf * numerator / denominator

        return scores

    def search(self, query, top_k=5):
        """Search and return top-k ranked documents."""
        scores = self.score(query)
        ranked = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in ranked:
            if scores[idx] > 0:
                results.append((idx, scores[idx], self.documents[idx]))
        return results


# Create a corpus
corpus = [
    "Python programming language tutorial for beginners",
    "Advanced Python data structures and algorithms",
    "Machine learning with Python scikit-learn library",
    "Deep learning frameworks PyTorch and TensorFlow",
    "Natural language processing with spaCy and NLTK",
    "Web development with Python Django framework",
    "Data analysis and visualization with pandas",
    "Python automation scripts for everyday tasks",
    "Building REST APIs with Python Flask",
    "Computer vision with OpenCV and Python",
]

# Build BM25 index
bm25 = BM25(corpus)

# Search
queries = ["Python machine learning", "web development framework", "data analysis"]
for query in queries:
    print(f"Query: '{query}'")
    results = bm25.search(query, top_k=3)
    for rank, (idx, score, doc) in enumerate(results, 1):
        print(f"  {rank}. [{score:.3f}] {doc}")
    print()
```

---

## Semantic Search with Embeddings

Traditional search matches keywords. **Semantic search** understands meaning using dense vector embeddings.

```python
from sentence_transformers import SentenceTransformer
import numpy as np

# Load a sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Document corpus
documents = [
    "How to train a neural network from scratch",
    "Best restaurants in downtown Manhattan",
    "Introduction to quantum computing basics",
    "Tips for improving your public speaking skills",
    "Understanding the stock market for beginners",
    "Guide to Mediterranean diet and healthy eating",
    "Machine learning model deployment strategies",
    "History of ancient Roman civilization",
]

# Encode all documents into dense vectors
doc_embeddings = model.encode(documents)
print(f"Embedding shape: {doc_embeddings.shape}")
print(f"  → {doc_embeddings.shape[0]} documents, {doc_embeddings.shape[1]} dimensions")

def semantic_search(query, top_k=3):
    """Search using semantic similarity."""
    query_embedding = model.encode([query])

    # Compute cosine similarities
    similarities = np.dot(doc_embeddings, query_embedding.T).flatten()
    similarities /= (
        np.linalg.norm(doc_embeddings, axis=1) * np.linalg.norm(query_embedding)
    )

    # Rank results
    ranked = np.argsort(similarities)[::-1][:top_k]

    print(f"\nQuery: '{query}'")
    for rank, idx in enumerate(ranked, 1):
        print(f"  {rank}. [{similarities[idx]:.3f}] {documents[idx]}")

# Semantic search understands meaning, not just keywords
semantic_search("deep learning tutorial")
semantic_search("good places to eat")
semantic_search("financial markets investment")
```

Notice how semantic search finds relevant results even when the exact keywords don't match!

---

## Re-Ranking with Cross-Encoders

A common pattern is:
1. **First stage**: Fast retrieval (BM25 or bi-encoder) → get top 100 candidates
2. **Second stage**: Slow but accurate re-ranking (cross-encoder) → re-rank top 100

```python
from sentence_transformers import CrossEncoder
import numpy as np

# Cross-encoder scores (query, document) pairs directly
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

query = "How to learn programming"
candidates = [
    "Best programming courses for beginners",
    "History of programming languages",
    "Top 10 recipes for quick dinner",
    "Free online coding tutorials and exercises",
    "Programming interview preparation guide",
]

# Score each (query, candidate) pair
pairs = [(query, doc) for doc in candidates]
scores = reranker.predict(pairs)

# Rank by score
ranked = np.argsort(scores)[::-1]
print(f"Query: '{query}'")
print("\nRe-ranked results:")
for rank, idx in enumerate(ranked, 1):
    print(f"  {rank}. [{scores[idx]:.3f}] {candidates[idx]}")
```

---

## Evaluation Metrics

How do we measure search quality?

### Precision@K

Of the top $K$ results, how many are relevant?

$$Precision@K = \frac{\text{relevant documents in top } K}{K}$$

### Recall@K

Of all relevant documents, how many appear in top $K$?

$$Recall@K = \frac{\text{relevant documents in top } K}{\text{total relevant documents}}$$

### Mean Average Precision (MAP)

Average precision across all queries:

$$AP = \frac{1}{|R|} \sum_{k=1}^{n} Precision@k \cdot rel(k)$$

### NDCG (Normalized Discounted Cumulative Gain)

Measures ranking quality with graded relevance:

$$DCG@K = \sum_{i=1}^{K} \frac{2^{rel_i} - 1}{\log_2(i + 1)}$$

$$NDCG@K = \frac{DCG@K}{IDCG@K}$$

```python
import numpy as np

def precision_at_k(relevant, retrieved, k):
    """Calculate Precision@K."""
    retrieved_k = retrieved[:k]
    relevant_count = sum(1 for doc in retrieved_k if doc in relevant)
    return relevant_count / k

def recall_at_k(relevant, retrieved, k):
    """Calculate Recall@K."""
    retrieved_k = retrieved[:k]
    relevant_count = sum(1 for doc in retrieved_k if doc in relevant)
    return relevant_count / len(relevant) if relevant else 0

def average_precision(relevant, retrieved):
    """Calculate Average Precision."""
    hits = 0
    sum_precision = 0

    for i, doc in enumerate(retrieved, 1):
        if doc in relevant:
            hits += 1
            sum_precision += hits / i

    return sum_precision / len(relevant) if relevant else 0

def ndcg_at_k(relevance_scores, k):
    """Calculate NDCG@K given relevance scores for ranked results."""
    dcg = sum(
        (2 ** rel - 1) / np.log2(i + 2)
        for i, rel in enumerate(relevance_scores[:k])
    )

    # Ideal DCG (sort by relevance)
    ideal = sorted(relevance_scores, reverse=True)[:k]
    idcg = sum(
        (2 ** rel - 1) / np.log2(i + 2)
        for i, rel in enumerate(ideal)
    )

    return dcg / idcg if idcg > 0 else 0

# Example evaluation
relevant_docs = {"doc1", "doc3", "doc5", "doc7"}
retrieved_docs = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7", "doc8"]

print("Evaluation Metrics:")
for k in [3, 5, 8]:
    p = precision_at_k(relevant_docs, retrieved_docs, k)
    r = recall_at_k(relevant_docs, retrieved_docs, k)
    print(f"  P@{k} = {p:.3f}, R@{k} = {r:.3f}")

ap = average_precision(relevant_docs, retrieved_docs)
print(f"  AP = {ap:.3f}")

# NDCG with graded relevance (3=highly relevant, 2=relevant, 1=marginally, 0=not)
relevance = [3, 0, 2, 0, 1, 0, 3, 0]
for k in [3, 5, 8]:
    score = ndcg_at_k(relevance, k)
    print(f"  NDCG@{k} = {score:.3f}")
```

---

## Complete Search Engine

Let's build a complete search engine combining BM25 and semantic search:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from collections import Counter
import re

class HybridSearchEngine:
    """Search engine combining BM25 and semantic similarity."""

    def __init__(self, documents, alpha=0.5):
        """
        Args:
            documents: list of document strings
            alpha: weight for BM25 (1-alpha for semantic)
        """
        self.documents = documents
        self.alpha = alpha
        self._build_bm25_index()
        self._build_semantic_index()

    def _build_bm25_index(self):
        """Build BM25 scoring components."""
        self.k1 = 1.5
        self.b = 0.75
        self.doc_tokens = [re.findall(r"\w+", d.lower()) for d in self.documents]
        self.doc_lengths = [len(t) for t in self.doc_tokens]
        self.avgdl = np.mean(self.doc_lengths)
        self.n_docs = len(self.documents)

        self.tf_docs = []
        self.df = Counter()
        for tokens in self.doc_tokens:
            tf = Counter(tokens)
            self.tf_docs.append(tf)
            for term in set(tokens):
                self.df[term] += 1

    def _build_semantic_index(self):
        """Build TF-IDF vectors for semantic matching."""
        self.tfidf = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = self.tfidf.fit_transform(self.documents)

    def _bm25_score(self, query):
        """Calculate BM25 scores."""
        terms = re.findall(r"\w+", query.lower())
        scores = np.zeros(self.n_docs)

        for term in terms:
            df = self.df.get(term, 0)
            idf = np.log((self.n_docs - df + 0.5) / (df + 0.5) + 1)

            for i in range(self.n_docs):
                tf = self.tf_docs[i].get(term, 0)
                dl = self.doc_lengths[i]
                num = tf * (self.k1 + 1)
                den = tf + self.k1 * (1 - self.b + self.b * dl / self.avgdl)
                scores[i] += idf * num / den

        return scores

    def _semantic_score(self, query):
        """Calculate semantic similarity scores."""
        query_vec = self.tfidf.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix)[0]
        return scores

    def search(self, query, top_k=5):
        """Hybrid search combining BM25 and semantic scores."""
        bm25_scores = self._bm25_score(query)
        semantic_scores = self._semantic_score(query)

        # Normalize scores to [0, 1]
        if bm25_scores.max() > 0:
            bm25_scores /= bm25_scores.max()
        if semantic_scores.max() > 0:
            semantic_scores /= semantic_scores.max()

        # Combine scores
        combined = self.alpha * bm25_scores + (1 - self.alpha) * semantic_scores

        # Rank and return
        ranked = np.argsort(combined)[::-1][:top_k]
        results = []
        for idx in ranked:
            if combined[idx] > 0:
                results.append({
                    "rank": len(results) + 1,
                    "document": self.documents[idx],
                    "score": combined[idx],
                    "bm25": bm25_scores[idx],
                    "semantic": semantic_scores[idx],
                })
        return results


# Build the search engine
corpus = [
    "Python is a versatile programming language for web and data science",
    "JavaScript powers interactive websites and modern web applications",
    "Machine learning algorithms can predict outcomes from data",
    "Cloud computing provides scalable infrastructure on demand",
    "Database design and SQL queries for data management",
    "Docker containers simplify application deployment",
    "React is a popular library for building user interfaces",
    "Deep neural networks achieve state-of-the-art results in AI",
    "Git version control for collaborative software development",
    "REST API design principles and best practices",
]

engine = HybridSearchEngine(corpus, alpha=0.6)

# Search
queries = ["web development frontend", "artificial intelligence", "deploy applications"]
for query in queries:
    results = engine.search(query, top_k=3)
    print(f"Query: '{query}'")
    for r in results:
        print(f"  {r['rank']}. [{r['score']:.3f}] {r['document']}")
        print(f"       BM25={r['bm25']:.3f} | Semantic={r['semantic']:.3f}")
    print()
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Boolean Retrieval | AND/OR/NOT operations on term sets |
| Inverted Index | Maps terms to document lists for fast lookup |
| TF-IDF | Weights terms by frequency and rarity |
| BM25 | Industry-standard ranking with TF saturation |
| Semantic Search | Dense embeddings capture meaning |
| Re-ranking | Cross-encoder for precise relevance scoring |
| Precision@K | Fraction of relevant results in top K |
| NDCG | Ranking quality with graded relevance |

---

## Exercises

1. Add phrase search (exact multi-word matching) to the Boolean search system
2. Implement BM25 with query term weighting (BM25F)
3. Build a search engine for your own collection of text files
4. Compare BM25 vs semantic search on the same queries — when does each win?
5. Implement a spelling correction module that suggests "did you mean...?"
