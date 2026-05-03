---
title: Word2Vec
---

# Word2Vec

**Word2Vec** is a neural network-based method for learning word embeddings from large text corpora. Introduced by Mikolov et al. at Google in 2013, it revolutionized NLP by showing that simple neural networks could learn rich semantic representations.

---

## The Big Idea

Word2Vec learns word vectors by training a shallow neural network on a simple task: **predicting words from their context** (or context from a word).

The word vectors aren't the network's output — they're the **weights** the network learns along the way. These weights turn out to capture remarkable semantic properties.

---

## Two Architectures

Word2Vec comes in two flavors:

### 1. CBOW (Continuous Bag of Words)

**Predict the center word from surrounding context words.**

```
Context: ["The", "cat", "___", "on", "the"]  →  Predict: "sat"
```

```
Input (context words)        Hidden Layer        Output (target word)
[the]    ─┐
[cat]    ─┼──→  Average  ──→  [softmax]  ──→  "sat"
[on]     ─┤
[the]    ─┘
```

### 2. Skip-gram

**Predict surrounding context words from the center word.**

```
Input: "sat"  →  Predict: ["The", "cat", "on", "the"]
```

```
Input (center word)          Hidden Layer        Output (context words)
                                                  ──→ "The"
"sat"  ──────────→  [weights]  ──→  [softmax]    ──→ "cat"
                                                  ──→ "on"
                                                  ──→ "the"
```

### Comparison

| Feature | CBOW | Skip-gram |
|---------|------|-----------|
| Input | Context words | Center word |
| Output | Center word | Context words |
| Speed | Faster (one prediction) | Slower (multiple predictions) |
| Rare words | Less accurate | Better for rare words |
| Best for | Large datasets | Small datasets |

---

## Training: The Sliding Window

Word2Vec processes text using a **sliding window**:

```python
text = "the quick brown fox jumps over the lazy dog"
window_size = 2  # 2 words on each side

# Sliding window examples:
# Center: "brown"  Context: ["the", "quick", "fox", "jumps"]
# Center: "fox"    Context: ["quick", "brown", "jumps", "over"]
# Center: "jumps"  Context: ["brown", "fox", "over", "the"]
```

```python
def generate_training_pairs(text, window_size=2):
    """Generate (center, context) pairs for Skip-gram training."""
    words = text.lower().split()
    pairs = []

    for i, center_word in enumerate(words):
        # Define window boundaries
        start = max(0, i - window_size)
        end = min(len(words), i + window_size + 1)

        # Generate pairs
        for j in range(start, end):
            if j != i:  # Skip the center word itself
                pairs.append((center_word, words[j]))

    return pairs

text = "the quick brown fox jumps over the lazy dog"
pairs = generate_training_pairs(text, window_size=2)

print("Training pairs (center → context):")
for center, context in pairs[:10]:
    print(f"  {center:<8} → {context}")
```

Output:

```
Training pairs (center → context):
  the      → quick
  quick    → the
  quick    → brown
  brown    → the
  brown    → quick
  brown    → fox
  fox      → quick
  fox      → brown
  fox      → jumps
  jumps    → brown
```

---

## Neural Network Architecture

The Skip-gram architecture:

```
Input Layer       Embedding Layer      Output Layer
(one-hot)         (word vector)        (softmax over vocab)

V dimensions      N dimensions         V dimensions
[0]               [0.23]               [0.001]   ← "the"
[0]               [-0.41]              [0.002]   ← "cat"
[1] ← "fox"  →   [0.78]          →    [0.850]   ← "brown" ✓
[0]               [0.12]               [0.003]   ← "dog"
[0]               [-0.55]              [0.001]   ← "house"
...               ...                  ...
```

Where:
- $V$ = vocabulary size (e.g., 50,000)
- $N$ = embedding dimension (e.g., 300)
- **Input** = one-hot vector of center word
- **Embedding layer** = $V \times N$ weight matrix (this IS the word embeddings!)
- **Output** = probability distribution over vocabulary

---

## Negative Sampling

Computing softmax over the entire vocabulary (50,000+ words) is expensive. **Negative sampling** makes training practical:

Instead of updating ALL output weights, only update:
1. The **correct** context word (positive sample)
2. A few random **wrong** words (negative samples, typically 5–20)

```python
# Conceptual negative sampling
# Training pair: ("fox", "brown")  — brown is in fox's context

# Positive sample: P("brown" | "fox") should be HIGH
# Negative samples (random words): 
#   P("banana" | "fox") should be LOW
#   P("computer" | "fox") should be LOW
#   P("running" | "fox") should be LOW
```

The loss function with negative sampling:

$$J = -\log \sigma(\vec{w}_O \cdot \vec{w}_I) - \sum_{k=1}^{K} \log \sigma(-\vec{w}_{neg_k} \cdot \vec{w}_I)$$

Where:
- $\vec{w}_I$ = input word vector
- $\vec{w}_O$ = positive (true) output word vector
- $\vec{w}_{neg_k}$ = negative (random) sample vectors
- $K$ = number of negative samples
- $\sigma$ = sigmoid function

---

## Hyperparameters

| Parameter | Typical Value | Effect |
|-----------|--------------|--------|
| `vector_size` | 100–300 | Embedding dimensions |
| `window` | 5 | Context window size |
| `min_count` | 5 | Ignore words appearing less than this |
| `sg` | 0=CBOW, 1=Skip-gram | Architecture choice |
| `negative` | 5–20 | Number of negative samples |
| `epochs` | 5–15 | Training iterations |
| `alpha` | 0.025 | Initial learning rate |

### Effect of Window Size

| Window | Captures |
|--------|----------|
| Small (2-3) | Syntactic relationships (verb forms, plurals) |
| Large (5-10) | Semantic/topical relationships (synonyms, related concepts) |

---

## Training Word2Vec with Gensim

### On a Custom Corpus

```python
from gensim.models import Word2Vec

# Prepare corpus: list of tokenized sentences
corpus = [
    ["machine", "learning", "is", "a", "subset", "of", "artificial", "intelligence"],
    ["deep", "learning", "uses", "neural", "networks", "with", "many", "layers"],
    ["natural", "language", "processing", "helps", "computers", "understand", "text"],
    ["word", "embeddings", "represent", "words", "as", "dense", "vectors"],
    ["neural", "networks", "learn", "patterns", "from", "data"],
    ["machine", "learning", "algorithms", "improve", "with", "more", "data"],
    ["artificial", "intelligence", "is", "transforming", "many", "industries"],
    ["deep", "learning", "models", "need", "large", "amounts", "of", "data"],
    ["text", "classification", "is", "a", "common", "nlp", "task"],
    ["word", "vectors", "capture", "semantic", "relationships", "between", "words"],
]

# Train Word2Vec model
model = Word2Vec(
    sentences=corpus,
    vector_size=100,     # Embedding dimension
    window=5,            # Context window size
    min_count=1,         # Include all words (small corpus)
    sg=1,                # Skip-gram (1) vs CBOW (0)
    negative=5,          # Negative sampling
    epochs=100,          # More epochs for small corpus
    seed=42,             # Reproducibility
)

# Access word vectors
print("Vector for 'learning':")
print(f"  Shape: {model.wv['learning'].shape}")
print(f"  First 5 values: {model.wv['learning'][:5]}")

# Find similar words
print("\nMost similar to 'learning':")
similar = model.wv.most_similar('learning', topn=5)
for word, score in similar:
    print(f"  {word}: {score:.4f}")
```

### Training on Larger Text

```python
from gensim.models import Word2Vec
import re

# Simulate a larger corpus (in practice, use millions of sentences)
raw_text = """
Machine learning is a branch of artificial intelligence that enables
computers to learn from data without being explicitly programmed.
Deep learning is a subset of machine learning that uses artificial
neural networks with multiple layers. Natural language processing
is the field of computer science that deals with understanding and
generating human language. Word embeddings are dense vector
representations that capture the meaning of words based on their
context in large text corpora.
"""

# Tokenize into sentences and words
def preprocess(text):
    """Simple preprocessing for Word2Vec training."""
    sentences = text.strip().split('.')
    tokenized = []
    for sent in sentences:
        words = re.findall(r'\b[a-z]+\b', sent.lower())
        if words:
            tokenized.append(words)
    return tokenized

corpus = preprocess(raw_text)
print(f"Number of sentences: {len(corpus)}")
print(f"First sentence: {corpus[0]}")

# Train model
model = Word2Vec(
    sentences=corpus,
    vector_size=50,
    window=3,
    min_count=1,
    sg=1,
    epochs=200,
)

# Explore the model
print(f"\nVocabulary size: {len(model.wv)}")
print(f"Words: {list(model.wv.key_to_index.keys())[:15]}...")
```

---

## Using Pre-trained Word2Vec Models

Google released a Word2Vec model trained on 100 billion words from Google News:

```python
import gensim.downloader as api

# Download Google News Word2Vec (1.7GB — may take a while)
# Contains 3 million words, 300-dimensional vectors
model = api.load('word2vec-google-news-300')

# Explore vocabulary
print(f"Vocabulary size: {len(model)}")
print(f"Vector dimensions: {model.vector_size}")

# Word similarity
print("\nSimilarity scores:")
print(f"  king vs queen: {model.similarity('king', 'queen'):.4f}")
print(f"  king vs car: {model.similarity('king', 'car'):.4f}")
print(f"  Python vs Java: {model.similarity('Python', 'Java'):.4f}")
```

---

## Word Analogies

The famous "king - man + woman = queen" demonstration:

```python
# Analogy: A is to B as C is to ?
def analogy(model, a, b, c):
    """Solve: a is to b as c is to ?"""
    result = model.most_similar(positive=[b, c], negative=[a], topn=1)
    return result[0]

# Gender analogies
print("Word Analogies:")
print("=" * 50)

analogies = [
    ("man", "king", "woman"),         # → queen
    ("man", "brother", "woman"),      # → sister
    ("france", "paris", "germany"),   # → berlin
    ("slow", "slower", "fast"),       # → faster
    ("do", "did", "go"),              # → went
    ("japan", "sushi", "italy"),      # → pizza
]

for a, b, c in analogies:
    word, score = analogy(model, a, b, c)
    print(f"  {a}:{b} :: {c}:{word} (confidence: {score:.4f})")
```

### Testing Analogy Accuracy

```python
# Word2Vec models can be evaluated on standard analogy datasets
def test_analogies(model, test_cases):
    """Test analogy accuracy."""
    correct = 0
    total = 0
    for a, b, c, expected in test_cases:
        try:
            result = model.most_similar(positive=[b, c], negative=[a], topn=1)
            predicted = result[0][0]
            is_correct = predicted.lower() == expected.lower()
            correct += int(is_correct)
            total += 1
            status = "✓" if is_correct else "✗"
            print(f"  {status} {a}:{b} :: {c}:? → {predicted} (expected: {expected})")
        except KeyError as e:
            print(f"  - Skipped (word not in vocab): {e}")

    print(f"\nAccuracy: {correct}/{total} = {correct/total:.1%}")

test_cases = [
    ("man", "king", "woman", "queen"),
    ("france", "paris", "italy", "rome"),
    ("big", "bigger", "small", "smaller"),
    ("walk", "walked", "run", "ran"),
]

test_analogies(model, test_cases)
```

---

## Exploring Word Relationships

```python
# Find words that don't belong
odd_one = model.doesnt_match(["cat", "dog", "fish", "computer"])
print(f"Odd one out: {odd_one}")  # computer

# Find the relationship between word pairs
def find_relationship(model, pairs):
    """Visualize the vector difference between word pairs."""
    print("Word Pair Relationships:")
    for w1, w2 in pairs:
        sim = model.similarity(w1, w2)
        print(f"  {w1:<10} ↔ {w2:<10}: similarity = {sim:.4f}")

find_relationship(model, [
    ("king", "queen"),
    ("man", "woman"),
    ("boy", "girl"),
    ("father", "mother"),
])
```

---

## Saving and Loading Models

```python
from gensim.models import Word2Vec

# Save the full model (can continue training later)
model.save("word2vec_model.bin")

# Load full model
loaded_model = Word2Vec.load("word2vec_model.bin")

# Save only word vectors (smaller file, read-only)
model.wv.save("word_vectors.kv")

# Load word vectors only
from gensim.models import KeyedVectors
word_vectors = KeyedVectors.load("word_vectors.kv")
```

---

## Practical Tips

### 1. Corpus Size Matters

| Corpus Size | Quality | Use Case |
|------------|---------|----------|
| < 1M words | Poor | Use pre-trained instead |
| 1-10M words | Acceptable | Domain-specific tasks |
| 10-100M words | Good | General purpose |
| 1B+ words | Excellent | Production systems |

### 2. Preprocessing for Word2Vec

```python
import re

def preprocess_for_word2vec(text):
    """Prepare text for Word2Vec training."""
    # Lowercase
    text = text.lower()
    # Remove special characters (keep apostrophes for contractions)
    text = re.sub(r"[^a-z0-9\s']", ' ', text)
    # Handle common contractions
    text = re.sub(r"n't", " not", text)
    text = re.sub(r"'re", " are", text)
    text = re.sub(r"'s", " is", text)
    text = re.sub(r"'ll", " will", text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Split into words
    return text.split()

sample = "I can't believe it's not butter! NLP is GREAT."
tokens = preprocess_for_word2vec(sample)
print(tokens)
# ['i', 'can', 'not', 'believe', 'it', 'is', 'not', 'butter', 'nlp', 'is', 'great']
```

### 3. Choosing Architecture

```python
# CBOW: faster, better for frequent words, use for large corpora
model_cbow = Word2Vec(sentences=corpus, sg=0, vector_size=100)

# Skip-gram: slower, better for rare words, use for small corpora
model_sg = Word2Vec(sentences=corpus, sg=1, vector_size=100)
```

---

## Evaluating Word2Vec Quality

```python
def evaluate_embeddings(model):
    """Quick evaluation of embedding quality."""
    print("Embedding Quality Check")
    print("=" * 50)

    # 1. Similarity sanity check
    print("\n1. Similarity (should be high):")
    high_sim_pairs = [("good", "great"), ("bad", "terrible"), ("cat", "kitten")]
    for w1, w2 in high_sim_pairs:
        try:
            sim = model.similarity(w1, w2)
            print(f"   {w1} vs {w2}: {sim:.4f}")
        except KeyError:
            pass

    print("\n   Similarity (should be low):")
    low_sim_pairs = [("cat", "economics"), ("happy", "algebra")]
    for w1, w2 in low_sim_pairs:
        try:
            sim = model.similarity(w1, w2)
            print(f"   {w1} vs {w2}: {sim:.4f}")
        except KeyError:
            pass

    # 2. Analogy test
    print("\n2. Analogies:")
    analogies = [
        ("man", "king", "woman", "queen"),
        ("france", "paris", "japan", "tokyo"),
    ]
    for a, b, c, expected in analogies:
        try:
            result = model.most_similar(positive=[b, c], negative=[a], topn=1)
            print(f"   {a}:{b} :: {c}:? → {result[0][0]} (expected: {expected})")
        except KeyError:
            pass

    # 3. Odd-one-out
    print("\n3. Odd one out:")
    groups = [
        ["cat", "dog", "fish", "table"],
        ["red", "blue", "green", "running"],
    ]
    for group in groups:
        try:
            odd = model.doesnt_match(group)
            print(f"   {group} → {odd}")
        except KeyError:
            pass

# evaluate_embeddings(model)
```

---

## Word2Vec vs Other Embeddings

| Feature | Word2Vec | GloVe | FastText |
|---------|----------|-------|----------|
| Method | Neural network | Matrix factorization | Neural + subwords |
| Training | Local context window | Global co-occurrence | Context + char n-grams |
| OOV words | Cannot handle | Cannot handle | Handles via subwords |
| Speed | Fast | Fast (once matrix built) | Slower (more parameters) |
| Best for | General use | When global stats matter | Morphologically rich languages |

---

## Complete Example: Train and Explore

```python
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
import numpy as np

# Sample corpus (in practice, use much larger data)
sentences = [
    "the king rules the kingdom with wisdom",
    "the queen rules alongside the king",
    "the prince will become king one day",
    "the princess is the daughter of the king and queen",
    "a man works in the field every day",
    "a woman teaches at the local school",
    "the boy plays with his dog in the park",
    "the girl reads books at the library",
    "cats and dogs are popular pets",
    "fish swim in the ocean and rivers",
    "birds fly high in the sky",
    "machine learning transforms data into insights",
    "deep learning requires large datasets",
    "neural networks have multiple layers",
    "python is popular for data science",
]

# Tokenize
tokenized = [simple_preprocess(sent) for sent in sentences]

# Train Word2Vec
model = Word2Vec(
    sentences=tokenized,
    vector_size=50,
    window=3,
    min_count=1,
    sg=1,
    negative=5,
    epochs=300,
    seed=42,
)

# Explore results
print("Vocabulary:", list(model.wv.key_to_index.keys())[:20])
print(f"\nTotal words: {len(model.wv)}")

# Similar words
for word in ["king", "learning", "dog"]:
    if word in model.wv:
        similar = model.wv.most_similar(word, topn=3)
        print(f"\nSimilar to '{word}':")
        for w, s in similar:
            print(f"  {w}: {s:.4f}")
```

---

## Try It Yourself

1. Train Word2Vec on a larger corpus (e.g., Wikipedia dump or book text)
2. Compare CBOW vs Skip-gram on the same data — which gives better analogies?
3. Experiment with different `vector_size` and `window` values
4. Use your trained embeddings as features for a text classification task
5. Visualize 30+ word vectors with t-SNE and look for clusters

---

## Summary

- **Word2Vec** learns word embeddings using a shallow neural network (Mikolov et al., 2013)
- **CBOW** predicts the center word from context (fast, good for frequent words)
- **Skip-gram** predicts context from center word (better for rare words)
- **Sliding window** generates training pairs from running text
- **Negative sampling** makes training efficient by sampling a few "wrong" words
- Key hyperparameters: **vector_size**, **window**, **min_count**, **sg**, **negative**
- **Gensim** provides easy-to-use Word2Vec training and pre-trained model loading
- Pre-trained models (Google News 300d) are available for immediate use
- Word vectors enable **analogies**, **similarity**, and **clustering**

Next lesson, we'll explore GloVe and FastText — alternative approaches to learning word embeddings!
