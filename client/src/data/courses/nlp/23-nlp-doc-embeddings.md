---
title: Document Embeddings
---

# Document Embeddings

So far, we have learned how to represent individual **words** as vectors. But what if we need to represent an entire **document**, **paragraph**, or **sentence** as a single vector? This is where **document embeddings** come in.

---

## From Word Vectors to Document Vectors

A document is a sequence of words. To get a single vector representing the whole document, we need a strategy to combine word vectors.

### The Challenge

- Word vectors have a **fixed dimension** (e.g., 100d, 300d)
- Documents have **variable length** (5 words to 5000 words)
- We need a **fixed-size** representation for any document length

---

## Simple Approaches

### 1. Average Word Embeddings

The simplest approach: compute the **mean** of all word vectors in the document.

$$\vec{d} = \frac{1}{n} \sum_{i=1}^{n} \vec{w}_i$$

Where $n$ is the number of words and $\vec{w}_i$ is the word vector for word $i$.

```python
import numpy as np

def average_word_embeddings(document, word_vectors, dimension=100):
    """Compute document vector as average of word vectors."""
    words = document.lower().split()
    vectors = []

    for word in words:
        if word in word_vectors:
            vectors.append(word_vectors[word])

    if not vectors:
        return np.zeros(dimension)

    return np.mean(vectors, axis=0)

# Example with pre-loaded GloVe vectors
# (Assuming 'glove' is a dict of word -> numpy array)
doc1 = "machine learning is a subset of artificial intelligence"
doc2 = "deep neural networks can learn complex patterns"
doc3 = "the cat sat on the mat in the sun"

vec1 = average_word_embeddings(doc1, glove)
vec2 = average_word_embeddings(doc2, glove)
vec3 = average_word_embeddings(doc3, glove)

# Compare document similarity
from numpy.linalg import norm

def cosine_sim(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))

print(f"doc1 vs doc2 (both ML): {cosine_sim(vec1, vec2):.4f}")
print(f"doc1 vs doc3 (ML vs cat): {cosine_sim(vec1, vec3):.4f}")
print(f"doc2 vs doc3 (DL vs cat): {cosine_sim(vec2, vec3):.4f}")
```

**Pros:** Simple, fast, no training needed  
**Cons:** Loses word order, frequent words dominate

---

### 2. Weighted Average (TF-IDF Weights)

Weight each word by its **importance** before averaging. TF-IDF gives higher weight to distinctive words and lower weight to common words.

$$\vec{d} = \frac{\sum_{i=1}^{n} \text{tfidf}(w_i) \cdot \vec{w}_i}{\sum_{i=1}^{n} \text{tfidf}(w_i)}$$

```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def tfidf_weighted_embeddings(documents, word_vectors, dimension=100):
    """Compute document vectors using TF-IDF weighted word embeddings."""
    # Fit TF-IDF on the corpus
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(documents)
    feature_names = tfidf.get_feature_names_out()

    # Create word -> tfidf weight mapping for each document
    doc_vectors = []

    for doc_idx in range(len(documents)):
        weighted_sum = np.zeros(dimension)
        weight_total = 0.0

        # Get TF-IDF weights for this document
        tfidf_scores = tfidf_matrix[doc_idx].toarray().flatten()

        for word_idx, word in enumerate(feature_names):
            if word in word_vectors and tfidf_scores[word_idx] > 0:
                weight = tfidf_scores[word_idx]
                weighted_sum += weight * word_vectors[word]
                weight_total += weight

        if weight_total > 0:
            doc_vectors.append(weighted_sum / weight_total)
        else:
            doc_vectors.append(np.zeros(dimension))

    return np.array(doc_vectors)

# Example
documents = [
    "machine learning algorithms learn from data",
    "deep learning uses neural networks",
    "the cat sat on the mat",
    "natural language processing with python",
    "supervised learning requires labeled data",
]

doc_vecs = tfidf_weighted_embeddings(documents, glove)

print("Document similarity matrix:")
for i in range(len(documents)):
    for j in range(len(documents)):
        sim = cosine_sim(doc_vecs[i], doc_vecs[j])
        print(f"{sim:.2f}", end="  ")
    print()
```

**Pros:** Downweights common words ("the", "is"), highlights distinctive terms  
**Cons:** Still loses word order, requires corpus for TF-IDF computation

---

### 3. Max Pooling

Take the **maximum value** across each dimension from all word vectors:

$$d_j = \max_{i=1}^{n} w_{i,j} \quad \text{for each dimension } j$$

```python
def max_pooling_embeddings(document, word_vectors, dimension=100):
    """Compute document vector using max pooling over word vectors."""
    words = document.lower().split()
    vectors = []

    for word in words:
        if word in word_vectors:
            vectors.append(word_vectors[word])

    if not vectors:
        return np.zeros(dimension)

    # Take maximum value across each dimension
    return np.max(vectors, axis=0)

# Compare approaches
doc = "natural language processing enables computers to understand human language"

avg_vec = average_word_embeddings(doc, glove)
max_vec = max_pooling_embeddings(doc, glove)

print(f"Average embedding (first 5): {avg_vec[:5]}")
print(f"Max pooling (first 5): {max_vec[:5]}")
print(f"Average norm: {norm(avg_vec):.4f}")
print(f"Max pooling norm: {norm(max_vec):.4f}")
```

**Pros:** Captures the strongest signal in each dimension  
**Cons:** Sensitive to outlier vectors, loses averaging effect

---

## Doc2Vec (Paragraph Vectors)

**Doc2Vec** (Le & Mikolov, 2014) extends Word2Vec to learn fixed-length vectors for documents directly. It introduces a **paragraph ID** that acts as a memory for the document's topic.

### Two Variants

#### PV-DM (Distributed Memory)

Similar to Word2Vec CBOW — predicts a target word from context words **plus** a document vector:

$$P(w_t | w_{t-k}, \ldots, w_{t-1}, d) = \text{softmax}(\text{avg}(\vec{w}_{t-k}, \ldots, \vec{w}_{t-1}, \vec{d}))$$

The document vector $\vec{d}$ is shared across all context windows in the same document, acting as a "memory" of the document's topic.

#### PV-DBOW (Distributed Bag of Words)

Similar to Word2Vec Skip-gram — predicts random words from the document using only the document vector:

$$P(w_i | d) = \text{softmax}(W \cdot \vec{d})$$

Simpler and faster, but sometimes less accurate.

### Training Doc2Vec with Gensim

```python
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.utils import simple_preprocess

# Prepare tagged documents
documents = [
    "Machine learning is a subset of artificial intelligence that focuses on data",
    "Deep learning uses neural networks with multiple layers to learn representations",
    "Natural language processing enables computers to understand human language",
    "Computer vision allows machines to interpret visual information from images",
    "Reinforcement learning trains agents through reward and punishment signals",
    "The stock market experienced significant volatility during the pandemic",
    "Climate change is causing rising sea levels and extreme weather events",
    "The new restaurant downtown serves excellent Italian cuisine",
    "Basketball players need agility speed and good hand-eye coordination",
    "Quantum computing uses qubits that can exist in superposition states",
]

# Tag each document with a unique ID
tagged_docs = [
    TaggedDocument(simple_preprocess(doc), [i])
    for i, doc in enumerate(documents)
]

print("Example tagged document:")
print(tagged_docs[0])
```

```python
# Train Doc2Vec model (PV-DM)
model_dm = Doc2Vec(
    documents=tagged_docs,
    vector_size=100,      # Document vector dimension
    window=5,             # Context window size
    min_count=1,          # Minimum word frequency
    epochs=100,           # Training iterations
    dm=1,                 # 1 = PV-DM, 0 = PV-DBOW
    workers=4,            # Parallel threads
)

# Train Doc2Vec model (PV-DBOW)
model_dbow = Doc2Vec(
    documents=tagged_docs,
    vector_size=100,
    window=5,
    min_count=1,
    epochs=100,
    dm=0,                 # PV-DBOW
    workers=4,
)

# Get document vectors
print("Document 0 vector (PV-DM, first 5 dims):")
print(model_dm.dv[0][:5])

print("\nDocument 0 vector (PV-DBOW, first 5 dims):")
print(model_dbow.dv[0][:5])
```

### Inferring Vectors for New Documents

```python
# Infer vector for a new, unseen document
new_doc = "artificial intelligence and machine learning are transforming technology"
new_vector = model_dm.infer_vector(simple_preprocess(new_doc), epochs=50)

print(f"New document vector shape: {new_vector.shape}")
print(f"First 5 dimensions: {new_vector[:5]}")

# Find most similar training documents
similar_docs = model_dm.dv.most_similar([new_vector], topn=3)
print("\nMost similar documents:")
for doc_id, similarity in similar_docs:
    print(f"  Doc {doc_id} (sim={similarity:.4f}): {documents[doc_id][:60]}...")
```

---

## Document Similarity

Once we have document vectors, we can measure how similar documents are:

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def compute_document_similarity(doc_vectors):
    """Compute pairwise similarity between all documents."""
    return cosine_similarity(doc_vectors)

# Using Doc2Vec vectors
all_vectors = np.array([model_dm.dv[i] for i in range(len(documents))])
sim_matrix = compute_document_similarity(all_vectors)

# Display similarity matrix
print("Document Similarity Matrix:")
print("=" * 60)
for i in range(len(documents)):
    for j in range(len(documents)):
        print(f"{sim_matrix[i][j]:.2f}", end=" ")
    print()

# Find the most similar pair
np.fill_diagonal(sim_matrix, -1)  # Ignore self-similarity
max_idx = np.unravel_index(sim_matrix.argmax(), sim_matrix.shape)
print(f"\nMost similar pair: Doc {max_idx[0]} and Doc {max_idx[1]}")
print(f"  Doc {max_idx[0]}: {documents[max_idx[0]][:50]}...")
print(f"  Doc {max_idx[1]}: {documents[max_idx[1]][:50]}...")
```

---

## Applications of Document Embeddings

### 1. Document Clustering

```python
from sklearn.cluster import KMeans
import numpy as np

# Get document vectors
doc_vectors = np.array([model_dm.dv[i] for i in range(len(documents))])

# Cluster documents
n_clusters = 3
kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
clusters = kmeans.fit_predict(doc_vectors)

# Display clusters
print("Document Clusters:")
print("=" * 60)
for cluster_id in range(n_clusters):
    print(f"\nCluster {cluster_id}:")
    for doc_id, doc in enumerate(documents):
        if clusters[doc_id] == cluster_id:
            print(f"  [{doc_id}] {doc[:60]}...")
```

### 2. Semantic Search

```python
def semantic_search(query, documents, model, top_k=3):
    """Search documents by semantic similarity to a query."""
    # Infer vector for the query
    query_vector = model.infer_vector(simple_preprocess(query), epochs=50)

    # Compute similarity with all documents
    similarities = []
    for doc_id in range(len(documents)):
        doc_vector = model.dv[doc_id]
        sim = np.dot(query_vector, doc_vector) / (
            np.linalg.norm(query_vector) * np.linalg.norm(doc_vector)
        )
        similarities.append((doc_id, sim))

    # Sort by similarity
    similarities.sort(key=lambda x: x[1], reverse=True)

    return similarities[:top_k]

# Example searches
queries = [
    "how do neural networks learn?",
    "what is happening with the weather?",
    "investment and trading strategies",
]

for query in queries:
    print(f"\nQuery: '{query}'")
    results = semantic_search(query, documents, model_dm)
    for doc_id, score in results:
        print(f"  [{score:.4f}] {documents[doc_id][:60]}...")
```

### 3. Recommendation System

```python
def recommend_similar_documents(doc_id, documents, model, top_k=3):
    """Recommend documents similar to a given document."""
    target_vector = model.dv[doc_id]

    similarities = []
    for i in range(len(documents)):
        if i != doc_id:
            vec = model.dv[i]
            sim = np.dot(target_vector, vec) / (
                np.linalg.norm(target_vector) * np.linalg.norm(vec)
            )
            similarities.append((i, sim))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]

# Recommend documents similar to document 0
print(f"If you liked: '{documents[0][:50]}...'")
print("\nYou might also like:")
recs = recommend_similar_documents(0, documents, model_dm)
for doc_id, score in recs:
    print(f"  [{score:.4f}] {documents[doc_id][:60]}...")
```

---

## Sentence-BERT (Preview)

While Doc2Vec works well, modern approaches use **transformer-based** models like Sentence-BERT (SBERT) for superior document embeddings:

```python
from sentence_transformers import SentenceTransformer

# Load a pre-trained Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Encode documents
sentences = [
    "Machine learning is transforming healthcare",
    "Deep learning models can diagnose diseases from images",
    "The weather forecast predicts rain tomorrow",
]

embeddings = model.encode(sentences)
print(f"Embedding shape: {embeddings.shape}")  # (3, 384)

# Compute similarity
from sklearn.metrics.pairwise import cosine_similarity
sim_matrix = cosine_similarity(embeddings)
print("\nSimilarity matrix:")
print(sim_matrix)
```

> We will cover transformer-based embeddings in detail in later lessons.

---

## Comparison of Document Embedding Methods

| Method | Quality | Speed | Training Required | Order Preserved |
|--------|---------|-------|-------------------|-----------------|
| Average embeddings | Low | Fast | No | No |
| TF-IDF weighted | Medium | Fast | Corpus TF-IDF | No |
| Max pooling | Low-Medium | Fast | No | No |
| Doc2Vec (PV-DM) | Medium-High | Medium | Yes | Partially |
| Doc2Vec (PV-DBOW) | Medium | Fast | Yes | No |
| Sentence-BERT | High | Slow | Pre-trained | Yes |

---

## Complete Example: Document Embedding Pipeline

```python
import numpy as np
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.utils import simple_preprocess
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

class DocumentEmbedder:
    """A complete document embedding pipeline."""

    def __init__(self, method="doc2vec", vector_size=100):
        self.method = method
        self.vector_size = vector_size
        self.model = None
        self.documents = None

    def fit(self, documents, epochs=100):
        """Train on a list of documents."""
        self.documents = documents

        if self.method == "doc2vec":
            tagged = [
                TaggedDocument(simple_preprocess(doc), [i])
                for i, doc in enumerate(documents)
            ]
            self.model = Doc2Vec(
                documents=tagged,
                vector_size=self.vector_size,
                window=5,
                min_count=1,
                epochs=epochs,
                dm=1,
                workers=4,
            )

    def transform(self, documents=None):
        """Get vectors for documents."""
        if documents is None:
            # Return vectors for training documents
            return np.array([
                self.model.dv[i] for i in range(len(self.documents))
            ])
        else:
            # Infer vectors for new documents
            return np.array([
                self.model.infer_vector(simple_preprocess(doc), epochs=50)
                for doc in documents
            ])

    def find_similar(self, query, top_k=5):
        """Find documents most similar to a query."""
        query_vec = self.model.infer_vector(
            simple_preprocess(query), epochs=50
        )
        all_vecs = self.transform()
        sims = cosine_similarity([query_vec], all_vecs)[0]

        top_indices = sims.argsort()[-top_k:][::-1]
        return [(idx, sims[idx], self.documents[idx]) for idx in top_indices]

    def cluster(self, n_clusters=3):
        """Cluster the training documents."""
        vectors = self.transform()
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(vectors)
        return labels

# Usage
corpus = [
    "Python is a popular programming language for data science",
    "JavaScript is used for building interactive web applications",
    "Machine learning models can predict outcomes from data",
    "HTML and CSS are essential for web page design",
    "Neural networks are inspired by the human brain structure",
    "React is a JavaScript library for building user interfaces",
    "Data preprocessing is crucial before training ML models",
    "Node.js allows running JavaScript on the server side",
]

embedder = DocumentEmbedder(method="doc2vec", vector_size=100)
embedder.fit(corpus, epochs=200)

# Search
print("Search: 'deep learning and AI'")
results = embedder.find_similar("deep learning and AI", top_k=3)
for idx, score, doc in results:
    print(f"  [{score:.4f}] {doc}")

# Cluster
print("\nDocument Clusters:")
labels = embedder.cluster(n_clusters=3)
for i, (doc, label) in enumerate(zip(corpus, labels)):
    print(f"  Cluster {label}: {doc[:50]}...")
```

---

## Key Takeaways

1. **Average embeddings** are simple but effective for many tasks
2. **TF-IDF weighting** improves over plain averaging by reducing noise from common words
3. **Doc2Vec** learns document vectors jointly with word vectors during training
4. **PV-DM** preserves some word order; **PV-DBOW** is simpler and faster
5. Document embeddings enable **similarity search**, **clustering**, and **recommendations**
6. Modern transformer-based methods (SBERT) generally outperform Doc2Vec

---

## Try It Yourself

1. Implement average word embeddings using pre-trained GloVe vectors
2. Compare TF-IDF weighted averaging vs plain averaging on a set of documents
3. Train a Doc2Vec model and use it for semantic search
4. Cluster a collection of news articles by topic
5. Compare Doc2Vec with Sentence-BERT on a similarity benchmark
