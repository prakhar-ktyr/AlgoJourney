---
title: Introduction to Word Embeddings
---

# Introduction to Word Embeddings

Word embeddings are dense vector representations of words that capture semantic meaning. Unlike Bag of Words or TF-IDF, embeddings place similar words close together in a continuous vector space.

---

## The Problem with One-Hot Encoding

In traditional representations, each word gets a unique one-hot vector:

```python
vocabulary = ["cat", "dog", "king", "queen", "computer"]

# One-hot vectors
cat      = [1, 0, 0, 0, 0]
dog      = [0, 1, 0, 0, 0]
king     = [0, 0, 1, 0, 0]
queen    = [0, 0, 0, 1, 0]
computer = [0, 0, 0, 0, 1]
```

### Problems:

| Issue | Explanation |
|-------|-------------|
| **Sparse** | Vectors are mostly zeros (waste of memory) |
| **High-dimensional** | Vector size = vocabulary size (50,000+) |
| **No similarity** | "cat" and "dog" are as different as "cat" and "computer" |
| **No relationships** | Cannot capture that king:queen :: man:woman |

```python
import numpy as np

# One-hot vectors have zero similarity between ANY pair of words
cat = np.array([1, 0, 0, 0, 0])
dog = np.array([0, 1, 0, 0, 0])

# Dot product = 0 (orthogonal — no relationship captured!)
similarity = np.dot(cat, dog)
print(f"cat · dog = {similarity}")  # 0
```

---

## The Distributional Hypothesis

> **"You shall know a word by the company it keeps."** — J.R. Firth, 1957

Words that appear in similar contexts tend to have similar meanings:

```
The ___ sat on the mat.       → cat, dog, child
The ___ chased a mouse.       → cat, dog, kitten
I took my ___ to the vet.     → cat, dog, hamster
```

"Cat" and "dog" appear in similar contexts, so they should have similar vector representations.

---

## Dense Vector Representations

Instead of sparse one-hot vectors, **word embeddings** represent each word as a dense vector with 100–300 dimensions:

```python
# Dense embedding vectors (simplified, normally 100-300 dimensions)
# Each dimension captures some aspect of meaning
cat   = [0.23, -0.41, 0.78, 0.12, -0.55, 0.33, ...]   # 300 values
dog   = [0.25, -0.38, 0.72, 0.15, -0.51, 0.29, ...]   # similar to cat!
king  = [0.82, 0.61, -0.23, 0.45, 0.11, -0.67, ...]   # different direction
queen = [0.79, 0.58, -0.19, 0.41, 0.38, -0.63, ...]   # similar to king!
```

### Properties of Dense Embeddings

| Feature | One-Hot | Embeddings |
|---------|---------|-----------|
| Dimensions | 50,000+ | 100–300 |
| Values | 0 or 1 | Real numbers |
| Sparsity | >99.99% zeros | Dense (all values used) |
| Similarity | Always 0 | Meaningful distances |
| Learned | No | Yes (from data) |

---

## Word Arithmetic

The most famous property of word embeddings: **vector arithmetic captures relationships**!

$$\vec{king} - \vec{man} + \vec{woman} \approx \vec{queen}$$

This works because:
- $\vec{king} - \vec{man}$ = the "royalty" direction
- Adding $\vec{woman}$ to the "royalty" direction = $\vec{queen}$

### More Examples:

| Analogy | Vector Operation |
|---------|-----------------|
| Paris is to France as Tokyo is to ? | Paris - France + Japan ≈ Tokyo |
| Walking is to walked as swimming is to ? | walking - walked + swimming ≈ swam |
| Big is to bigger as small is to ? | big - bigger + small ≈ smaller |

```python
import numpy as np

# Simplified example with 4D vectors
king  = np.array([0.8, 0.6, 0.1, 0.9])
man   = np.array([0.5, 0.4, 0.1, 0.2])
woman = np.array([0.5, 0.4, 0.8, 0.2])
queen = np.array([0.8, 0.6, 0.8, 0.9])

# king - man + woman should ≈ queen
result = king - man + woman
print(f"king - man + woman = {result}")
print(f"queen              = {queen}")
print(f"Match: {np.allclose(result, queen, atol=0.1)}")
```

---

## Cosine Similarity

To measure how similar two word vectors are, we use **cosine similarity**:

$$\cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{|\vec{A}||\vec{B}|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \cdot \sqrt{\sum_{i=1}^n B_i^2}}$$

- **1.0** = identical direction (same meaning)
- **0.0** = perpendicular (unrelated)
- **-1.0** = opposite direction (opposite meaning)

```python
import numpy as np

def cosine_similarity(vec_a, vec_b):
    """Calculate cosine similarity between two vectors."""
    dot_product = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    return dot_product / (norm_a * norm_b)

# Example vectors (simplified)
cat = np.array([0.23, -0.41, 0.78, 0.12, -0.55])
dog = np.array([0.25, -0.38, 0.72, 0.15, -0.51])
car = np.array([0.67, 0.45, -0.33, 0.89, 0.21])

print(f"cat vs dog: {cosine_similarity(cat, dog):.4f}")   # High (similar)
print(f"cat vs car: {cosine_similarity(cat, car):.4f}")   # Low (different)
print(f"dog vs car: {cosine_similarity(dog, car):.4f}")   # Low (different)
```

### Why Cosine Over Euclidean?

Cosine similarity measures the **angle** between vectors, ignoring magnitude. This is important because:
- A document about "cats" repeated 10 times shouldn't be "more cat-like"
- We care about **direction** (meaning) not **length** (frequency)

---

## Types of Word Embeddings

### Static Embeddings

Each word gets **one fixed vector** regardless of context:

| Model | Year | Key Idea |
|-------|------|----------|
| Word2Vec | 2013 | Neural network on word contexts |
| GloVe | 2014 | Global word co-occurrence statistics |
| FastText | 2017 | Character n-grams (handles rare words) |

"Bank" has the same vector whether it means "river bank" or "financial bank."

### Contextual Embeddings

Each word gets a **different vector** depending on its context:

| Model | Year | Key Idea |
|-------|------|----------|
| ELMo | 2018 | Bidirectional LSTM |
| BERT | 2019 | Transformer encoder |
| GPT | 2018+ | Transformer decoder |

"Bank" gets different vectors in "river bank" vs "bank account."

---

## Loading Pre-trained Embeddings

You don't need to train embeddings from scratch! Pre-trained models are available:

### Using Gensim

```python
import gensim.downloader as api

# Download pre-trained GloVe vectors (this may take a few minutes)
# Options: 'glove-wiki-gigaword-100', 'glove-wiki-gigaword-300', 'word2vec-google-news-300'
model = api.load('glove-wiki-gigaword-100')  # 100-dimensional GloVe

# Get the vector for a word
cat_vector = model['cat']
print(f"Vector for 'cat': shape={cat_vector.shape}")
print(f"First 10 values: {cat_vector[:10]}")

# Find most similar words
similar = model.most_similar('cat', topn=5)
print("\nMost similar to 'cat':")
for word, score in similar:
    print(f"  {word}: {score:.4f}")
# dog: 0.8798
# cats: 0.8567
# pet: 0.7944
# ...
```

### Computing Similarity

```python
# Similarity between word pairs
pairs = [
    ('cat', 'dog'),
    ('cat', 'kitten'),
    ('cat', 'car'),
    ('king', 'queen'),
    ('king', 'banana'),
]

print("Word Similarity Scores:")
print("=" * 40)
for word1, word2 in pairs:
    sim = model.similarity(word1, word2)
    print(f"  {word1:<8} vs {word2:<8}: {sim:.4f}")
```

### Word Analogies

```python
# king - man + woman = ?
result = model.most_similar(positive=['king', 'woman'], negative=['man'], topn=3)
print("king - man + woman =")
for word, score in result:
    print(f"  {word}: {score:.4f}")
# queen: 0.7699

# More analogies
analogies = [
    (['paris', 'germany'], ['france'], "Paris:France :: ?:Germany"),
    (['bigger', 'small'], ['big'], "bigger:big :: ?:small"),
    (['walking', 'swam'], ['walked'], "walking:walked :: ?:swam"),
]

for positive, negative, description in analogies:
    result = model.most_similar(positive=positive, negative=negative, topn=1)
    print(f"  {description} → {result[0][0]} ({result[0][1]:.4f})")
```

---

## Visualizing Word Embeddings

High-dimensional vectors can be reduced to 2D or 3D for visualization:

### Using t-SNE

```python
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Select words to visualize
words = [
    'king', 'queen', 'prince', 'princess',  # royalty
    'man', 'woman', 'boy', 'girl',           # gender
    'cat', 'dog', 'fish', 'bird',            # animals
    'car', 'bus', 'train', 'plane',          # vehicles
]

# Get vectors for selected words
word_vectors = np.array([model[word] for word in words])

# Reduce to 2D with t-SNE
tsne = TSNE(n_components=2, random_state=42, perplexity=5)
vectors_2d = tsne.fit_transform(word_vectors)

# Plot
plt.figure(figsize=(12, 8))

# Color by category
colors = ['red']*4 + ['blue']*4 + ['green']*4 + ['purple']*4
categories = ['Royalty']*4 + ['Gender']*4 + ['Animals']*4 + ['Vehicles']*4

for i, word in enumerate(words):
    plt.scatter(vectors_2d[i, 0], vectors_2d[i, 1], c=colors[i], s=100)
    plt.annotate(word, (vectors_2d[i, 0]+1, vectors_2d[i, 1]+1), fontsize=12)

# Legend
import matplotlib.patches as mpatches
legend_patches = [
    mpatches.Patch(color='red', label='Royalty'),
    mpatches.Patch(color='blue', label='Gender'),
    mpatches.Patch(color='green', label='Animals'),
    mpatches.Patch(color='purple', label='Vehicles'),
]
plt.legend(handles=legend_patches)
plt.title("Word Embeddings Visualized with t-SNE")
plt.xlabel("Dimension 1")
plt.ylabel("Dimension 2")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("word_embeddings_tsne.png", dpi=100)
plt.show()
```

### Using PCA

```python
from sklearn.decomposition import PCA

# PCA is faster and more reproducible than t-SNE
pca = PCA(n_components=2)
vectors_2d_pca = pca.fit_transform(word_vectors)

print(f"Explained variance: {pca.explained_variance_ratio_.sum():.2%}")

# Plot same as above but with PCA coordinates
plt.figure(figsize=(12, 8))
for i, word in enumerate(words):
    plt.scatter(vectors_2d_pca[i, 0], vectors_2d_pca[i, 1], c=colors[i], s=100)
    plt.annotate(word, (vectors_2d_pca[i, 0]+0.02, vectors_2d_pca[i, 1]+0.02), fontsize=12)

plt.title("Word Embeddings Visualized with PCA")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

---

## Embedding Dimensions

How many dimensions should word embeddings have?

| Dimensions | Pros | Cons |
|-----------|------|------|
| 50 | Fast, small memory | May miss nuances |
| 100 | Good balance | Standard for small tasks |
| 200 | More detail | Larger model |
| 300 | Most common | Good for general NLP |
| 768+ | BERT-scale | Requires more compute |

---

## Document Embeddings from Word Embeddings

A simple way to get a document vector: **average the word vectors**:

```python
import numpy as np

def document_embedding(text, model):
    """Create document vector by averaging word vectors."""
    words = text.lower().split()
    word_vectors = []
    for word in words:
        if word in model:
            word_vectors.append(model[word])
    if word_vectors:
        return np.mean(word_vectors, axis=0)
    return np.zeros(model.vector_size)

# Example
doc1 = "The cat sat on the mat"
doc2 = "A dog rested on the rug"
doc3 = "Stock market prices fell sharply"

vec1 = document_embedding(doc1, model)
vec2 = document_embedding(doc2, model)
vec3 = document_embedding(doc3, model)

# Compare documents
from numpy.linalg import norm
cos_sim = lambda a, b: np.dot(a, b) / (norm(a) * norm(b))

print(f"cat-doc vs dog-doc: {cos_sim(vec1, vec2):.4f}")    # High
print(f"cat-doc vs stock-doc: {cos_sim(vec1, vec3):.4f}")  # Low
```

---

## Out-of-Vocabulary (OOV) Words

A limitation of static embeddings: words not seen during training have no vector.

**Solutions:**

| Strategy | How it works |
|----------|-------------|
| Skip OOV words | Simple but loses information |
| Random vector | Assigns random embedding |
| Subword (FastText) | Builds from character n-grams |
| Zero vector | Neutral representation |

```python
# FastText handles OOV words using character n-grams
from gensim.models import FastText

# Even misspelled or rare words get vectors:
# "caat" → uses n-grams "ca", "aa", "at", "caa", "aat", "caat"
```

---

## Embedding Bias

Word embeddings learn biases present in training data:

```python
# WARNING: Embeddings may encode societal biases
# Example: "man is to computer programmer as woman is to homemaker"
# This reflects historical data, NOT how it should be

# Always be aware of and mitigate bias in embeddings
# Techniques: debiasing algorithms, careful evaluation, diverse training data
```

---

## Try It Yourself

1. Load GloVe vectors and find the 10 most similar words to "python"
2. Test word analogies: country:capital pairs, verb tenses, comparatives
3. Visualize 20 words from 4 different categories using t-SNE
4. Compare document similarity using averaged word vectors vs TF-IDF

---

## Summary

- **One-hot encoding** is sparse and captures no word relationships
- **Word embeddings** are dense vectors (100–300 dims) that capture meaning
- **Distributional hypothesis**: similar contexts → similar vectors
- **Word arithmetic**: $\vec{king} - \vec{man} + \vec{woman} \approx \vec{queen}$
- **Cosine similarity**: $\cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{|\vec{A}||\vec{B}|}$ measures semantic closeness
- **Static embeddings** (Word2Vec, GloVe): one vector per word
- **Contextual embeddings** (BERT, GPT): different vector per context
- **Visualization**: t-SNE and PCA reduce high-dimensional vectors to 2D

Next, we'll dive deep into Word2Vec — the neural network that revolutionized word embeddings!
