---
title: GloVe
---

# GloVe: Global Vectors for Word Representation

**GloVe** (Global Vectors for Word Representation) is a word embedding model developed by Pennington, Socher, and Manning at Stanford in 2014. It combines the advantages of global matrix factorization methods and local context window methods.

---

## How GloVe Works

Unlike Word2Vec, which learns embeddings by predicting context words, GloVe learns embeddings by factorizing a **co-occurrence matrix** — a matrix that captures how often words appear together in a corpus.

### The Two Approaches to Word Embeddings

| Approach | Method | Example |
|----------|--------|---------|
| **Count-based** | Build a co-occurrence matrix, then reduce dimensions | LSA, GloVe |
| **Prediction-based** | Train a neural network to predict context | Word2Vec, FastText |

GloVe bridges both: it uses global co-occurrence statistics but optimizes them with a prediction-style objective function.

---

## Co-occurrence Matrix

The co-occurrence matrix $X$ is a $V \times V$ matrix where $V$ is the vocabulary size. Each entry $X_{ij}$ counts how many times word $j$ appears in the context of word $i$.

### Example

Consider the corpus: "the cat sat on the mat"

With a context window of 1:

|       | the | cat | sat | on | mat |
|-------|-----|-----|-----|----|-----|
| **the** | 0   | 1   | 0   | 1  | 1   |
| **cat** | 1   | 0   | 1   | 0  | 0   |
| **sat** | 0   | 1   | 0   | 1  | 0   |
| **on**  | 1   | 0   | 1   | 0  | 1   |
| **mat** | 1   | 0   | 0   | 1  | 0   |

### Building the Co-occurrence Matrix in Python

```python
import numpy as np
from collections import defaultdict

def build_cooccurrence_matrix(corpus, window_size=2):
    """Build a co-occurrence matrix from a corpus."""
    # Tokenize and build vocabulary
    words = corpus.lower().split()
    vocab = sorted(set(words))
    word_to_idx = {word: i for i, word in enumerate(vocab)}
    vocab_size = len(vocab)

    # Initialize co-occurrence matrix
    cooccurrence = np.zeros((vocab_size, vocab_size))

    # Count co-occurrences within the window
    for i, word in enumerate(words):
        word_idx = word_to_idx[word]
        # Look at context words within the window
        start = max(0, i - window_size)
        end = min(len(words), i + window_size + 1)

        for j in range(start, end):
            if i != j:
                context_idx = word_to_idx[words[j]]
                cooccurrence[word_idx][context_idx] += 1

    return cooccurrence, vocab, word_to_idx

# Example usage
corpus = "the cat sat on the mat the cat played with the ball"
matrix, vocab, word_to_idx = build_cooccurrence_matrix(corpus)

print("Vocabulary:", vocab)
print("\nCo-occurrence matrix:")
print(matrix)
```

---

## The GloVe Objective Function

GloVe's key insight is that the **ratio** of co-occurrence probabilities encodes meaning. For example:

- $P(\text{ice} | \text{solid})$ is high
- $P(\text{ice} | \text{gas})$ is low
- The ratio $\frac{P(\text{ice} | \text{solid})}{P(\text{ice} | \text{gas})}$ is large

The GloVe objective function is:

$$J = \sum_{i,j=1}^{V} f(X_{ij})\left(w_i^T \tilde{w}_j + b_i + \tilde{b}_j - \log X_{ij}\right)^2$$

Where:
- $w_i$ — word vector for word $i$
- $\tilde{w}_j$ — context word vector for word $j$
- $b_i, \tilde{b}_j$ — bias terms
- $X_{ij}$ — co-occurrence count
- $f(X_{ij})$ — weighting function

### The Weighting Function

The weighting function prevents frequent co-occurrences from dominating:

$$f(x) = \begin{cases} (x / x_{\max})^\alpha & \text{if } x < x_{\max} \\ 1 & \text{otherwise} \end{cases}$$

Typically $x_{\max} = 100$ and $\alpha = 0.75$.

```python
def glove_weighting(x, x_max=100, alpha=0.75):
    """GloVe weighting function f(x)."""
    if x < x_max:
        return (x / x_max) ** alpha
    return 1.0

# Visualize the weighting function
import matplotlib.pyplot as plt

x_values = range(1, 200)
weights = [glove_weighting(x) for x in x_values]

plt.figure(figsize=(8, 4))
plt.plot(x_values, weights)
plt.xlabel("Co-occurrence count (x)")
plt.ylabel("Weight f(x)")
plt.title("GloVe Weighting Function")
plt.axvline(x=100, color="r", linestyle="--", label="x_max = 100")
plt.legend()
plt.grid(True)
plt.show()
```

---

## Pre-trained GloVe Vectors

Stanford provides several pre-trained GloVe models:

| Model | Training Data | Vocab Size | Dimensions |
|-------|---------------|------------|------------|
| glove.6B | Wikipedia 2014 + Gigaword 5 | 400K | 50, 100, 200, 300 |
| glove.42B | Common Crawl | 1.9M | 300 |
| glove.840B | Common Crawl | 2.2M | 300 |
| glove.twitter.27B | Twitter | 1.2M | 25, 50, 100, 200 |

Download from: https://nlp.stanford.edu/projects/glove/

---

## Loading GloVe Vectors in Python

### Method 1: Manual Loading

```python
import numpy as np

def load_glove_vectors(filepath, dimension=100):
    """Load GloVe vectors from a text file."""
    embeddings = {}

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            values = line.strip().split()
            word = values[0]
            vector = np.array(values[1:], dtype=np.float32)

            if len(vector) == dimension:
                embeddings[word] = vector

    print(f"Loaded {len(embeddings)} word vectors.")
    return embeddings

# Load GloVe 100d vectors
glove = load_glove_vectors("glove.6B.100d.txt", dimension=100)

# Check a word vector
print("Vector for 'king':", glove["king"][:10])  # First 10 dimensions
print("Shape:", glove["king"].shape)
```

### Method 2: Using Gensim

```python
from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec

# Step 1: Convert GloVe format to Word2Vec format
glove_input = "glove.6B.100d.txt"
word2vec_output = "glove.6B.100d.word2vec.txt"
glove2word2vec(glove_input, word2vec_output)

# Step 2: Load with gensim
model = KeyedVectors.load_word2vec_format(word2vec_output, binary=False)

# Now use it like Word2Vec
print(model.most_similar("king", topn=5))
```

---

## Finding Similar Words

```python
import numpy as np

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two vectors."""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2)

def find_similar_words(target_word, embeddings, top_n=10):
    """Find the most similar words to a target word."""
    if target_word not in embeddings:
        print(f"'{target_word}' not in vocabulary.")
        return []

    target_vector = embeddings[target_word]
    similarities = []

    for word, vector in embeddings.items():
        if word != target_word:
            sim = cosine_similarity(target_vector, vector)
            similarities.append((word, sim))

    # Sort by similarity (highest first)
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]

# Example: find words similar to "python"
similar = find_similar_words("python", glove)
print("Words most similar to 'python':")
for word, score in similar:
    print(f"  {word}: {score:.4f}")
```

---

## Word Analogies with GloVe

The famous analogy: **king - man + woman = queen**

This works because GloVe captures linear relationships:

$$\vec{king} - \vec{man} + \vec{woman} \approx \vec{queen}$$

```python
def word_analogy(word_a, word_b, word_c, embeddings, top_n=5):
    """
    Solve: word_a is to word_b as word_c is to ???
    Formula: result = word_b - word_a + word_c
    """
    if word_a not in embeddings or word_b not in embeddings or word_c not in embeddings:
        print("One or more words not in vocabulary.")
        return []

    # Compute the analogy vector
    analogy_vector = (
        embeddings[word_b] - embeddings[word_a] + embeddings[word_c]
    )

    # Find the closest words to this vector
    exclude = {word_a, word_b, word_c}
    similarities = []

    for word, vector in embeddings.items():
        if word not in exclude:
            sim = cosine_similarity(analogy_vector, vector)
            similarities.append((word, sim))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]

# Classic analogies
print("king - man + woman = ?")
results = word_analogy("man", "king", "woman", glove)
for word, score in results:
    print(f"  {word}: {score:.4f}")

print("\nParis - France + Germany = ?")
results = word_analogy("france", "paris", "germany", glove)
for word, score in results:
    print(f"  {word}: {score:.4f}")

print("\nwalking - walk + swim = ?")
results = word_analogy("walk", "walking", "swim", glove)
for word, score in results:
    print(f"  {word}: {score:.4f}")
```

---

## GloVe vs Word2Vec

| Feature | GloVe | Word2Vec |
|---------|-------|----------|
| **Approach** | Count-based + prediction | Prediction-based |
| **Training data** | Global co-occurrence matrix | Local context windows |
| **Training speed** | Faster (matrix factorization) | Slower (iterative SGD) |
| **Performance** | Better on word analogy tasks | Better on word similarity tasks |
| **Memory** | Needs full co-occurrence matrix | Streams through corpus |
| **Interpretability** | More interpretable (ratios) | Less interpretable |

---

## Complete Example: GloVe Word Explorer

```python
import numpy as np

class GloVeExplorer:
    """A class to explore GloVe word embeddings."""

    def __init__(self, filepath, dimension=100):
        self.dimension = dimension
        self.embeddings = self._load(filepath)
        self.vocab = list(self.embeddings.keys())

    def _load(self, filepath):
        """Load GloVe vectors from file."""
        embeddings = {}
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                values = line.strip().split()
                word = values[0]
                vector = np.array(values[1:], dtype=np.float32)
                if len(vector) == self.dimension:
                    embeddings[word] = vector
        print(f"Loaded {len(embeddings)} vectors ({self.dimension}d)")
        return embeddings

    def similarity(self, word1, word2):
        """Compute similarity between two words."""
        if word1 not in self.embeddings or word2 not in self.embeddings:
            return None
        v1 = self.embeddings[word1]
        v2 = self.embeddings[word2]
        return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

    def most_similar(self, word, top_n=10):
        """Find most similar words."""
        if word not in self.embeddings:
            return []
        target = self.embeddings[word]
        scores = []
        for w, vec in self.embeddings.items():
            if w != word:
                sim = np.dot(target, vec) / (
                    np.linalg.norm(target) * np.linalg.norm(vec)
                )
                scores.append((w, sim))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_n]

    def analogy(self, a, b, c, top_n=5):
        """Solve: a is to b as c is to ???"""
        if not all(w in self.embeddings for w in [a, b, c]):
            return []
        vec = self.embeddings[b] - self.embeddings[a] + self.embeddings[c]
        exclude = {a, b, c}
        scores = []
        for w, v in self.embeddings.items():
            if w not in exclude:
                sim = np.dot(vec, v) / (np.linalg.norm(vec) * np.linalg.norm(v))
                scores.append((w, sim))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_n]

    def visualize_words(self, words, method="tsne"):
        """Visualize word embeddings in 2D."""
        from sklearn.manifold import TSNE
        import matplotlib.pyplot as plt

        vectors = []
        valid_words = []
        for w in words:
            if w in self.embeddings:
                vectors.append(self.embeddings[w])
                valid_words.append(w)

        vectors = np.array(vectors)
        tsne = TSNE(n_components=2, random_state=42, perplexity=min(5, len(words) - 1))
        reduced = tsne.fit_transform(vectors)

        plt.figure(figsize=(10, 8))
        plt.scatter(reduced[:, 0], reduced[:, 1], c="blue", alpha=0.6)
        for i, word in enumerate(valid_words):
            plt.annotate(word, (reduced[i, 0], reduced[i, 1]), fontsize=12)
        plt.title("GloVe Word Embeddings (t-SNE)")
        plt.grid(True)
        plt.show()

# Usage
explorer = GloVeExplorer("glove.6B.100d.txt", dimension=100)

# Find similar words
print("Similar to 'computer':")
for word, score in explorer.most_similar("computer", top_n=5):
    print(f"  {word}: {score:.4f}")

# Word analogy
print("\nking - man + woman = ?")
for word, score in explorer.analogy("man", "king", "woman"):
    print(f"  {word}: {score:.4f}")

# Similarity between two words
sim = explorer.similarity("cat", "dog")
print(f"\nSimilarity(cat, dog) = {sim:.4f}")

# Visualize related words
words = ["king", "queen", "man", "woman", "prince", "princess", "boy", "girl"]
explorer.visualize_words(words)
```

---

## Key Takeaways

1. **GloVe** learns word vectors from global co-occurrence statistics
2. The **co-occurrence matrix** captures how often words appear together
3. The objective function uses a **weighted least squares** approach
4. GloVe captures **linear relationships** — enabling word analogies
5. Pre-trained GloVe vectors are available in multiple dimensions (50d to 300d)
6. GloVe is **complementary** to Word2Vec — neither is universally better

---

## Try It Yourself

1. Download `glove.6B.100d.txt` from the Stanford NLP website
2. Load the vectors and find words similar to your name
3. Test different analogies: countries–capitals, verbs–tenses
4. Compare similarity scores for related vs unrelated word pairs
5. Visualize word clusters using t-SNE
