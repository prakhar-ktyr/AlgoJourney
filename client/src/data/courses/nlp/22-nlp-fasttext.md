---
title: FastText
---

# FastText: Subword Embeddings

**FastText** is a word embedding and text classification library developed by Facebook AI Research (now Meta AI) in 2016. Its key innovation is representing words as bags of **character n-grams**, enabling it to handle out-of-vocabulary words and morphologically rich languages.

---

## The Key Innovation: Character N-grams

While Word2Vec and GloVe treat each word as an atomic unit, FastText breaks words into smaller pieces called **character n-grams** (also called subwords).

### How It Works

For the word **"where"** with n-gram range [3, 6]:

1. Add special boundary markers: `<where>`
2. Extract character n-grams:
   - 3-grams: `<wh`, `whe`, `her`, `ere`, `re>`
   - 4-grams: `<whe`, `wher`, `here`, `ere>`
   - 5-grams: `<wher`, `where`, `here>`
   - 6-grams: `<where`, `where>`
3. Also include the full word: `<where>`

The word vector is the **sum** of all its n-gram vectors:

$$\vec{w}_{\text{where}} = \sum_{g \in G(w)} \vec{z}_g$$

Where $G(w)$ is the set of n-grams for word $w$ and $\vec{z}_g$ is the vector for n-gram $g$.

```python
def extract_ngrams(word, min_n=3, max_n=6):
    """Extract character n-grams from a word (FastText style)."""
    # Add boundary markers
    word_with_markers = f"<{word}>"
    ngrams = []

    # Extract n-grams of different sizes
    for n in range(min_n, max_n + 1):
        for i in range(len(word_with_markers) - n + 1):
            ngram = word_with_markers[i:i + n]
            ngrams.append(ngram)

    # Also include the full word token
    ngrams.append(f"<{word}>")

    return ngrams

# Example
word = "where"
ngrams = extract_ngrams(word)
print(f"N-grams for '{word}':")
for ng in ngrams:
    print(f"  {ng}")
print(f"\nTotal n-grams: {len(ngrams)}")
```

---

## Why Subwords Matter

### 1. Handling Out-of-Vocabulary (OOV) Words

Word2Vec and GloVe cannot produce vectors for words not seen during training. FastText can!

```python
# Word2Vec / GloVe approach:
# "unfriendliness" → NOT IN VOCABULARY → no vector!

# FastText approach:
# "unfriendliness" → <un, unf, nfr, fri, rie, ien, end, ndl, dli, lin, ...
# Many of these n-grams were seen in other words!
# "unfair" shares: <un, unf
# "friendly" shares: fri, rie, ien, end, ndl, dly
# So we CAN compute a vector for "unfriendliness"
```

### 2. Morphologically Rich Languages

Languages like Finnish, Turkish, and German have complex word forms:

```python
# German compound words
german_words = [
    "Krankenhaus",          # hospital (sick + house)
    "Krankenwagen",         # ambulance (sick + wagon)
    "Krankenschwester",     # nurse (sick + sister)
]

# All share the n-grams: Kra, ran, ank, nke, ken
# FastText captures this morphological relationship!

# Turkish verb forms
turkish_words = [
    "gelmek",      # to come
    "geliyorum",   # I am coming
    "gelmişti",    # had come
    "gelemez",     # cannot come
]

# All share: gel, <ge, <gel — FastText links them!
```

### 3. Handling Typos and Rare Words

```python
# Typos share n-grams with correct spelling
correct = "algorithm"
typo = "algoritm"  # missing 'h'

ngrams_correct = set(extract_ngrams(correct))
ngrams_typo = set(extract_ngrams(typo))

overlap = ngrams_correct & ngrams_typo
print(f"Shared n-grams: {len(overlap)} / {len(ngrams_correct)}")
print(f"Overlap ratio: {len(overlap) / len(ngrams_correct):.2%}")
# High overlap means similar vectors!
```

---

## FastText Architecture

FastText extends the Skip-gram model from Word2Vec. Instead of predicting context words from a single word vector, it predicts from the **sum of the word's n-gram vectors**.

### Skip-gram with Subword Information

The scoring function becomes:

$$s(w, c) = \sum_{g \in G(w)} \vec{z}_g^T \vec{v}_c$$

Where:
- $G(w)$ — set of n-grams for word $w$
- $\vec{z}_g$ — vector for n-gram $g$
- $\vec{v}_c$ — vector for context word $c$

The loss function (negative sampling):

$$\ell = -\left[\log \sigma(s(w, c)) + \sum_{n \in N} \log \sigma(-s(w, n))\right]$$

Where $N$ is the set of negative samples and $\sigma$ is the sigmoid function.

---

## FastText vs Word2Vec vs GloVe

| Feature | Word2Vec | GloVe | FastText |
|---------|----------|-------|----------|
| **Unit** | Whole word | Whole word | Character n-grams |
| **OOV handling** | No | No | Yes |
| **Morphology** | Poor | Poor | Excellent |
| **Training speed** | Medium | Fast | Slower (more params) |
| **Vector quality** | Good | Good | Good (better for rare words) |
| **Memory** | Low | Medium | Higher (n-gram table) |
| **Approach** | Predictive | Count + predictive | Predictive + subwords |
| **Best for** | Large vocab, common words | Analogy tasks | Morphological languages, OOV |

---

## Training FastText with Gensim

```python
from gensim.models import FastText
from gensim.utils import simple_preprocess

# Prepare training corpus
sentences = [
    "natural language processing is a subfield of artificial intelligence",
    "machine learning algorithms can learn from data",
    "deep learning uses neural networks with many layers",
    "word embeddings represent words as dense vectors",
    "fasttext uses subword information for better representations",
    "character n-grams help handle out of vocabulary words",
    "morphologically rich languages benefit from subword models",
    "text classification can be done with fasttext",
    "sentiment analysis determines the emotional tone of text",
    "named entity recognition identifies proper nouns in text",
]

# Tokenize
tokenized_sentences = [simple_preprocess(sent) for sent in sentences]

# Train FastText model
model = FastText(
    sentences=tokenized_sentences,
    vector_size=100,      # Embedding dimension
    window=5,             # Context window size
    min_count=1,          # Minimum word frequency
    min_n=3,              # Minimum n-gram length
    max_n=6,              # Maximum n-gram length
    epochs=50,            # Training epochs
    sg=1,                 # 1 = Skip-gram, 0 = CBOW
    workers=4,            # Parallel threads
)

# Save and load
model.save("fasttext_model.bin")
loaded_model = FastText.load("fasttext_model.bin")

print("Vocabulary size:", len(model.wv))
print("Vector for 'language':", model.wv["language"][:5])
```

---

## Handling OOV Words

This is FastText's superpower — generating vectors for words never seen during training:

```python
from gensim.models import FastText
from gensim.utils import simple_preprocess

# Train on a small corpus
training_data = [
    simple_preprocess("the cat sat on the mat"),
    simple_preprocess("the dog played in the park"),
    simple_preprocess("cats and dogs are popular pets"),
    simple_preprocess("the kitten chased the butterfly"),
    simple_preprocess("puppies love to play fetch"),
]

model = FastText(
    sentences=training_data,
    vector_size=50,
    window=3,
    min_count=1,
    min_n=3,
    max_n=6,
    epochs=100,
)

# These words were in training data
print("'cat' vector (first 5 dims):", model.wv["cat"][:5])
print("'dog' vector (first 5 dims):", model.wv["dog"][:5])

# These words were NOT in training data — but FastText still works!
print("\n--- Out-of-Vocabulary Words ---")
print("'cats' in vocab:", "cats" in model.wv)

# FastText can still generate vectors for OOV words
oov_words = ["catlike", "doggy", "kittenish", "puppyhood"]
for word in oov_words:
    vector = model.wv[word]  # This works with FastText!
    print(f"'{word}' vector (first 5): {vector[:5]}")

# Compare OOV words to known words
from numpy import dot
from numpy.linalg import norm

def cosine_sim(a, b):
    return dot(a, b) / (norm(a) * norm(b))

print("\nSimilarity scores:")
print(f"  cat vs catlike: {cosine_sim(model.wv['cat'], model.wv['catlike']):.4f}")
print(f"  dog vs doggy: {cosine_sim(model.wv['dog'], model.wv['doggy']):.4f}")
```

---

## Pre-trained FastText Models

Meta provides pre-trained FastText models for **157 languages**:

| Resource | Description | Dimensions |
|----------|-------------|------------|
| Wiki word vectors | Trained on Wikipedia | 300 |
| Common Crawl vectors | Trained on Common Crawl + Wiki | 300 |
| Aligned vectors | Cross-lingual aligned vectors | 300 |

### Loading Pre-trained FastText

```python
import fasttext
import fasttext.util

# Download English model (this may take a while)
fasttext.util.download_model("en", if_exists="ignore")

# Load the model
ft_model = fasttext.load_model("cc.en.300.bin")

# Get word vector
vector = ft_model.get_word_vector("hello")
print(f"Dimension: {len(vector)}")

# Reduce dimensions if needed
fasttext.util.reduce_model(ft_model, 100)  # Reduce to 100d
vector_reduced = ft_model.get_word_vector("hello")
print(f"Reduced dimension: {len(vector_reduced)}")

# Get nearest neighbors
neighbors = ft_model.get_nearest_neighbors("python")
for score, word in neighbors[:5]:
    print(f"  {word}: {score:.4f}")
```

### Using Gensim with Pre-trained FastText

```python
from gensim.models.fasttext import load_facebook_model

# Load the .bin file from Facebook/Meta
model = load_facebook_model("cc.en.300.bin")

# Use like any gensim model
similar = model.wv.most_similar("computer", topn=5)
print("Most similar to 'computer':")
for word, score in similar:
    print(f"  {word}: {score:.4f}")

# OOV words still work
print("\nOOV word 'transformerize':")
print(model.wv["transformerize"][:5])
```

---

## FastText for Text Classification

FastText also includes a fast text classifier:

```python
import fasttext

# Training data format: __label__<label> <text>
# Save to a file:
training_text = """__label__positive I love this movie it was amazing
__label__positive great product highly recommend
__label__positive wonderful experience will come again
__label__negative terrible service never going back
__label__negative worst purchase I ever made
__label__negative horrible quality do not buy
__label__neutral the product is okay nothing special
__label__neutral average experience not good not bad
"""

with open("train_classification.txt", "w") as f:
    f.write(training_text)

# Train classifier
classifier = fasttext.train_supervised(
    input="train_classification.txt",
    epoch=25,
    lr=0.5,
    wordNgrams=2,
    dim=50,
)

# Predict
predictions = classifier.predict("I absolutely loved it")
print(f"Prediction: {predictions[0][0]}, Confidence: {predictions[1][0]:.4f}")

predictions = classifier.predict("It was terrible and disappointing")
print(f"Prediction: {predictions[0][0]}, Confidence: {predictions[1][0]:.4f}")
```

---

## Comparing Word2Vec and FastText

```python
from gensim.models import Word2Vec, FastText
from gensim.utils import simple_preprocess

# Same training corpus
corpus = [
    "the quick brown fox jumps over the lazy dog",
    "machine learning and deep learning are subfields of AI",
    "natural language processing deals with text data",
    "word embeddings capture semantic meaning of words",
    "neural networks can learn complex patterns from data",
    "transformers revolutionized natural language processing",
    "attention mechanisms allow models to focus on relevant parts",
    "pre-trained models can be fine-tuned for specific tasks",
]

tokenized = [simple_preprocess(sent) for sent in corpus]

# Train both models with same parameters
w2v_model = Word2Vec(
    sentences=tokenized, vector_size=100, window=5,
    min_count=1, epochs=100, sg=1,
)

ft_model = FastText(
    sentences=tokenized, vector_size=100, window=5,
    min_count=1, epochs=100, sg=1, min_n=3, max_n=6,
)

# Compare on known words
print("=== Known Words ===")
known_word = "learning"
w2v_similar = w2v_model.wv.most_similar(known_word, topn=3)
ft_similar = ft_model.wv.most_similar(known_word, topn=3)

print(f"\nWord2Vec - similar to '{known_word}':")
for word, score in w2v_similar:
    print(f"  {word}: {score:.4f}")

print(f"\nFastText - similar to '{known_word}':")
for word, score in ft_similar:
    print(f"  {word}: {score:.4f}")

# Compare on OOV words
print("\n=== Out-of-Vocabulary Words ===")
oov_words = ["learnable", "pretraining", "embedder"]

for word in oov_words:
    try:
        w2v_vec = w2v_model.wv[word]
        print(f"Word2Vec '{word}': OK")
    except KeyError:
        print(f"Word2Vec '{word}': KeyError (cannot handle OOV)")

    # FastText always works
    ft_vec = ft_model.wv[word]
    print(f"FastText '{word}': OK (vector norm = {sum(ft_vec**2)**0.5:.4f})")
```

---

## When to Use FastText

### Use FastText when:

- Your text has many **rare or misspelled words**
- Working with **morphologically rich languages** (Finnish, Turkish, German)
- You need to handle **OOV words** at inference time
- Building a **text classifier** (FastText's supervised mode is very fast)
- Working with **social media text** (abbreviations, slang, typos)

### Use Word2Vec/GloVe when:

- Your vocabulary is well-defined and **mostly closed**
- Memory is constrained (FastText models are larger)
- You only need embeddings for **common words**
- Speed of lookup is critical (no n-gram computation needed)

---

## Summary

| Concept | Description |
|---------|-------------|
| **Subword embeddings** | Represent words as sum of character n-gram vectors |
| **Character n-grams** | Fragments like "whe", "her", "ere" from "where" |
| **OOV handling** | Compute vectors for unseen words from shared n-grams |
| **Morphology** | Captures word structure (un-friend-li-ness) |
| **Pre-trained models** | Available for 157 languages |
| **Text classification** | Built-in fast supervised classifier |

---

## Try It Yourself

1. Train a FastText model on a small corpus
2. Test OOV word generation — try misspellings and morphological variants
3. Compare similarity scores between FastText and Word2Vec
4. Try FastText's text classification on a sentiment dataset
5. Load pre-trained multilingual FastText vectors
