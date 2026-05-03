---
title: N-grams
---

# N-grams

An **n-gram** is a contiguous sequence of $n$ items (words, characters, or tokens) from a text. N-grams are fundamental building blocks in NLP — used for language modeling, feature engineering, and text analysis.

---

## What is an N-gram?

Given a sentence, we can extract subsequences of different lengths:

```
Sentence: "I love natural language processing"

Unigrams (n=1): ["I", "love", "natural", "language", "processing"]
Bigrams  (n=2): ["I love", "love natural", "natural language", "language processing"]
Trigrams (n=3): ["I love natural", "love natural language", "natural language processing"]
4-grams  (n=4): ["I love natural language", "love natural language processing"]
```

### Naming Convention

| n | Name | Example |
|---|---|---|
| 1 | Unigram | "machine" |
| 2 | Bigram | "machine learning" |
| 3 | Trigram | "natural language processing" |
| 4 | 4-gram (or four-gram) | "the cat sat on" |
| 5 | 5-gram | "I want to go home" |

```python
def extract_ngrams(text, n):
    """Extract n-grams from text."""
    words = text.lower().split()
    ngrams = []
    for i in range(len(words) - n + 1):
        ngram = " ".join(words[i:i + n])
        ngrams.append(ngram)
    return ngrams

text = "the cat sat on the mat near the door"

print("Text:", text)
print()
for n in range(1, 5):
    ngrams = extract_ngrams(text, n)
    name = ["", "Unigrams", "Bigrams", "Trigrams", "4-grams"][n]
    print(f"{name} (n={n}): {ngrams}")
```

**Output:**

```
Text: the cat sat on the mat near the door

Unigrams (n=1): ['the', 'cat', 'sat', 'on', 'the', 'mat', 'near', 'the', 'door']
Bigrams  (n=2): ['the cat', 'cat sat', 'sat on', 'on the', 'the mat', 'mat near', 'near the', 'the door']
Trigrams (n=3): ['the cat sat', 'cat sat on', 'sat on the', 'on the mat', 'the mat near', 'mat near the', 'near the door']
4-grams  (n=4): ['the cat sat on', 'cat sat on the', 'sat on the mat', 'on the mat near', 'the mat near the', 'mat near the door']
```

---

## N-gram Language Model

An n-gram language model estimates the probability of the next word using only the previous $n-1$ words (**Markov assumption**):

$$P(w_n \mid w_1, w_2, \ldots, w_{n-1}) \approx P(w_n \mid w_{n-k}, \ldots, w_{n-1})$$

### Bigram Model

$$P(w_i \mid w_{i-1}) = \frac{C(w_{i-1}, w_i)}{C(w_{i-1})}$$

### Trigram Model

$$P(w_i \mid w_{i-2}, w_{i-1}) = \frac{C(w_{i-2}, w_{i-1}, w_i)}{C(w_{i-2}, w_{i-1})}$$

Where $C(\cdot)$ denotes the count of the n-gram in the training corpus.

```python
from collections import defaultdict, Counter

class NgramModel:
    """N-gram language model with configurable n."""

    def __init__(self, n=2):
        self.n = n
        self.ngram_counts = defaultdict(Counter)
        self.context_totals = Counter()
        self.vocab = set()

    def train(self, texts):
        """Train the model on a list of sentences."""
        for text in texts:
            words = text.lower().split()
            self.vocab.update(words)
            self.vocab.add("<END>")

            # Pad with start tokens
            padded = ["<START>"] * (self.n - 1) + words + ["<END>"]

            for i in range(self.n - 1, len(padded)):
                context = tuple(padded[i - self.n + 1:i])
                word = padded[i]
                self.ngram_counts[context][word] += 1
                self.context_totals[context] += 1

    def probability(self, word, context):
        """P(word | context) using MLE."""
        context = tuple(context)
        if self.context_totals[context] == 0:
            return 1 / len(self.vocab)  # Uniform for unseen
        return (
            self.ngram_counts[context][word] /
            self.context_totals[context]
        )

    def top_predictions(self, context, top_k=5):
        """Get top-k most likely next words."""
        context = tuple(context)
        if context not in self.ngram_counts:
            return []
        candidates = self.ngram_counts[context]
        total = self.context_totals[context]
        sorted_words = candidates.most_common(top_k)
        return [(w, c / total) for w, c in sorted_words]

# Training corpus
corpus = [
    "I want to eat Chinese food",
    "I want to eat Italian food",
    "I want to go home",
    "I want to learn Python",
    "I love to eat pizza",
    "I love to read books",
    "she wants to eat sushi",
    "he wants to go home",
    "they want to learn programming",
    "we want to eat dinner",
]

# Train bigram model
bigram = NgramModel(n=2)
bigram.train(corpus)

# Train trigram model
trigram = NgramModel(n=3)
trigram.train(corpus)

print("=== Bigram Predictions ===")
contexts_bi = [["i"], ["to"], ["want"], ["eat"]]
for ctx in contexts_bi:
    preds = bigram.top_predictions(ctx, top_k=3)
    print(f"\n  After '{ctx[-1]}':")
    for word, prob in preds:
        print(f"    {word:<12} P = {prob:.3f}")

print("\n=== Trigram Predictions ===")
contexts_tri = [["i", "want"], ["want", "to"], ["to", "eat"]]
for ctx in contexts_tri:
    preds = trigram.top_predictions(ctx, top_k=3)
    print(f"\n  After '{' '.join(ctx)}':")
    for word, prob in preds:
        print(f"    {word:<12} P = {prob:.3f}")
```

---

## Building N-gram Frequency Tables

Frequency tables show how often each n-gram appears, which is essential for computing probabilities:

```python
from collections import Counter

def build_frequency_table(texts, n=2):
    """Build an n-gram frequency table from text."""
    all_ngrams = []

    for text in texts:
        words = text.lower().split()
        for i in range(len(words) - n + 1):
            ngram = tuple(words[i:i + n])
            all_ngrams.append(ngram)

    freq_table = Counter(all_ngrams)
    return freq_table

corpus = [
    "the cat sat on the mat",
    "the cat ate the fish",
    "the dog sat on the rug",
    "a cat sat on a chair",
    "the mat was on the floor",
]

# Bigram frequencies
bigram_freq = build_frequency_table(corpus, n=2)

print("Top 15 Bigrams:")
print(f"{'Bigram':<20} {'Count':<8} {'Frequency'}")
print("-" * 40)
total = sum(bigram_freq.values())
for ngram, count in bigram_freq.most_common(15):
    freq = count / total
    print(f"{' '.join(ngram):<20} {count:<8} {freq:.3f}")

# Trigram frequencies
print("\n\nTop 10 Trigrams:")
trigram_freq = build_frequency_table(corpus, n=3)
print(f"{'Trigram':<25} {'Count'}")
print("-" * 35)
for ngram, count in trigram_freq.most_common(10):
    print(f"{' '.join(ngram):<25} {count}")
```

---

## Smoothing Techniques

Raw n-gram counts assign **zero probability** to unseen n-grams. Smoothing redistributes probability mass to handle this:

### Laplace (Add-1) Smoothing

$$P_{\text{Laplace}}(w_i \mid w_{i-1}) = \frac{C(w_{i-1}, w_i) + 1}{C(w_{i-1}) + V}$$

Where $V$ is the vocabulary size.

### Add-k Smoothing

$$P_{\text{add-k}}(w_i \mid w_{i-1}) = \frac{C(w_{i-1}, w_i) + k}{C(w_{i-1}) + kV}$$

```python
class SmoothedBigramModel:
    """Bigram model with different smoothing methods."""

    def __init__(self):
        self.bigram_counts = defaultdict(Counter)
        self.unigram_counts = Counter()
        self.vocab = set()

    def train(self, texts):
        for text in texts:
            words = ["<START>"] + text.lower().split() + ["<END>"]
            self.vocab.update(words)
            for i in range(len(words) - 1):
                self.bigram_counts[words[i]][words[i + 1]] += 1
                self.unigram_counts[words[i]] += 1

    def prob_mle(self, word, context):
        """Maximum Likelihood Estimation (no smoothing)."""
        if self.unigram_counts[context] == 0:
            return 0
        return (
            self.bigram_counts[context][word] /
            self.unigram_counts[context]
        )

    def prob_laplace(self, word, context):
        """Laplace (add-1) smoothing."""
        V = len(self.vocab)
        return (
            (self.bigram_counts[context][word] + 1) /
            (self.unigram_counts[context] + V)
        )

    def prob_add_k(self, word, context, k=0.5):
        """Add-k smoothing."""
        V = len(self.vocab)
        return (
            (self.bigram_counts[context][word] + k) /
            (self.unigram_counts[context] + k * V)
        )

corpus = [
    "the cat sat on the mat",
    "the dog chased the cat",
    "a bird flew over the house",
    "the cat chased the bird",
]

model = SmoothedBigramModel()
model.train(corpus)

# Compare smoothing methods
test_pairs = [
    ("cat", "the"),      # Seen bigram
    ("sat", "cat"),      # Seen bigram
    ("elephant", "the"), # Unseen bigram
    ("flew", "cat"),     # Unseen bigram
]

print(f"{'Bigram':<20} {'MLE':<8} {'Laplace':<10} {'Add-0.5'}")
print("-" * 50)
for word, context in test_pairs:
    mle = model.prob_mle(word, context)
    lap = model.prob_laplace(word, context)
    add_k = model.prob_add_k(word, context, k=0.5)
    print(f"P({word}|{context}){'':<5} {mle:<8.4f} {lap:<10.4f} {add_k:.4f}")
```

### Kneser-Ney Smoothing (Brief)

Kneser-Ney is a more sophisticated method that uses **absolute discounting** and considers word **versatility**:

$$P_{KN}(w_i \mid w_{i-1}) = \frac{\max(C(w_{i-1}, w_i) - d, 0)}{C(w_{i-1})} + \lambda(w_{i-1}) \cdot P_{\text{continuation}}(w_i)$$

Where $P_{\text{continuation}}(w_i)$ measures how many different contexts $w_i$ appears in (its versatility).

> **Note:** Kneser-Ney is considered the gold standard for n-gram smoothing but is complex to implement. In practice, use libraries like KenLM.

---

## Text Generation with N-grams: Markov Chain Approach

N-gram text generation is essentially a **Markov chain** — the next word depends only on the previous $n-1$ words:

```python
import random
import numpy as np

class MarkovTextGenerator:
    """Generate text using n-gram Markov chains."""

    def __init__(self, n=2):
        self.n = n
        self.transitions = defaultdict(Counter)

    def train(self, texts):
        """Learn transition probabilities from texts."""
        for text in texts:
            words = text.lower().split()
            padded = ["<START>"] * (self.n - 1) + words + ["<END>"]

            for i in range(self.n - 1, len(padded)):
                context = tuple(padded[i - self.n + 1:i])
                word = padded[i]
                self.transitions[context][word] += 1

    def generate(self, max_words=30, temperature=1.0):
        """Generate text with temperature control."""
        context = tuple(["<START>"] * (self.n - 1))
        generated = []

        for _ in range(max_words):
            if context not in self.transitions:
                break

            candidates = self.transitions[context]
            words = list(candidates.keys())
            counts = np.array(list(candidates.values()), dtype=float)

            # Apply temperature
            probs = counts ** (1.0 / temperature)
            probs /= probs.sum()

            next_word = np.random.choice(words, p=probs)

            if next_word == "<END>":
                break

            generated.append(next_word)
            context = tuple(list(context[1:]) + [next_word])

        return " ".join(generated)

# A larger training corpus
corpus = [
    "the quick brown fox jumps over the lazy dog",
    "the lazy dog slept all day in the sun",
    "a brown cat chased the quick mouse around the house",
    "the sun rose over the green hills in the morning",
    "in the morning the brown fox hunted in the hills",
    "the quick cat ran over the green grass",
    "all day the lazy cat slept in the sun",
    "the dog chased the fox over the hills",
    "a quick brown dog jumped over the lazy cat",
    "the morning sun shone over the brown hills",
    "in the house the cat chased the mouse all day",
    "the green hills were beautiful in the morning sun",
]

# Train different n-gram models
print("=== Text Generation with Markov Chains ===\n")

for n in [2, 3, 4]:
    gen = MarkovTextGenerator(n=n)
    gen.train(corpus)

    print(f"--- {n}-gram model ---")
    for i in range(3):
        text = gen.generate(max_words=12, temperature=0.8)
        print(f"  {text}")
    print()
```

---

## N-grams for Feature Engineering

N-grams are powerful features for machine learning:

### Character N-grams

Useful for language detection, authorship attribution, and handling misspellings:

```python
def char_ngrams(text, n=3):
    """Extract character n-grams."""
    text = text.lower().replace(" ", "_")
    ngrams = []
    for i in range(len(text) - n + 1):
        ngrams.append(text[i:i + n])
    return ngrams

# Language detection via character trigrams
english_text = "the quick brown fox"
french_text = "le renard brun rapide"
german_text = "der schnelle braune fuchs"

print("Character Trigrams:")
for label, text in [("English", english_text),
                     ("French", french_text),
                     ("German", german_text)]:
    trigrams = char_ngrams(text, n=3)
    print(f"\n  {label}: {trigrams[:10]}...")
```

### Word N-grams for Classification

```python
from sklearn.feature_extraction.text import CountVectorizer
from collections import Counter

def ngram_features(texts, labels, ngram_range=(1, 2)):
    """Extract n-gram features for text classification."""
    vectorizer = CountVectorizer(
        ngram_range=ngram_range,
        stop_words="english",
        max_features=20,
    )
    X = vectorizer.fit_transform(texts)
    feature_names = vectorizer.get_feature_names_out()

    print(f"N-gram range: {ngram_range}")
    print(f"Features: {len(feature_names)}")
    print(f"\nTop features:")
    for name in feature_names[:15]:
        print(f"  {name}")

    return X, feature_names

# Sentiment analysis example
positive = [
    "I love this amazing product",
    "great quality and fast delivery",
    "absolutely wonderful experience",
    "best purchase I have ever made",
]
negative = [
    "terrible product waste of money",
    "horrible quality never buying again",
    "worst experience of my life",
    "completely disappointed with this purchase",
]

texts = positive + negative
labels = ["positive"] * 4 + ["negative"] * 4

X, features = ngram_features(texts, labels, ngram_range=(1, 2))
```

### Extracting Collocations

Collocations are word pairs that occur together more often than chance:

```python
from collections import Counter
import math

def find_collocations(text, top_n=10):
    """
    Find collocations using Pointwise Mutual Information (PMI).
    PMI(x, y) = log2(P(x,y) / (P(x) * P(y)))
    """
    words = text.lower().split()
    word_count = Counter(words)
    bigram_count = Counter()

    for i in range(len(words) - 1):
        bigram_count[(words[i], words[i + 1])] += 1

    total_words = len(words)
    total_bigrams = len(words) - 1

    # Calculate PMI for each bigram
    pmi_scores = {}
    for bigram, count in bigram_count.items():
        if count < 2:  # Minimum frequency filter
            continue

        w1, w2 = bigram
        p_bigram = count / total_bigrams
        p_w1 = word_count[w1] / total_words
        p_w2 = word_count[w2] / total_words

        pmi = math.log2(p_bigram / (p_w1 * p_w2))
        pmi_scores[bigram] = pmi

    # Sort by PMI
    sorted_collocations = sorted(
        pmi_scores.items(), key=lambda x: x[1], reverse=True
    )

    return sorted_collocations[:top_n]

text = """
machine learning is a branch of artificial intelligence.
machine learning algorithms learn from data.
natural language processing is part of artificial intelligence.
deep learning is a subset of machine learning.
natural language processing uses machine learning techniques.
artificial intelligence will transform the world.
deep learning uses neural networks with many layers.
neural networks are inspired by the human brain.
"""

collocations = find_collocations(text, top_n=10)
print("Top Collocations (by PMI):")
print(f"{'Bigram':<30} {'PMI'}")
print("-" * 40)
for (w1, w2), pmi in collocations:
    print(f"{w1 + ' ' + w2:<30} {pmi:.3f}")
```

---

## Limitations of N-grams

| Limitation | Explanation |
|---|---|
| **Fixed context** | Can only look at $n-1$ previous words |
| **Sparsity** | Many valid n-grams never appear in training |
| **Storage** | Number of possible n-grams grows as $V^n$ |
| **No generalization** | "cat sat" and "kitten sat" are unrelated |
| **Long-range dependencies** | Cannot capture "The cat that I saw yesterday ... sat" |

```python
# Demonstrating the sparsity problem
def demonstrate_sparsity(vocab_size, n):
    """Show how quickly n-gram space grows."""
    possible_ngrams = vocab_size ** n
    return possible_ngrams

vocab_sizes = [1000, 10000, 50000]
print("Possible N-grams (grows exponentially):")
print(f"{'Vocab Size':<12} {'Bigrams':<15} {'Trigrams':<15} {'4-grams'}")
print("-" * 55)
for V in vocab_sizes:
    bi = demonstrate_sparsity(V, 2)
    tri = demonstrate_sparsity(V, 3)
    four = demonstrate_sparsity(V, 4)
    print(f"{V:<12} {bi:<15,} {tri:<15,} {four:,}")

print("\n→ Most of these n-grams will NEVER appear in any corpus!")
print("→ This is why smoothing and neural models are needed.")
```

**Output:**

```
Possible N-grams (grows exponentially):
Vocab Size   Bigrams         Trigrams        4-grams
-------------------------------------------------------
1000         1,000,000       1,000,000,000   1,000,000,000,000
10000        100,000,000     1,000,000,000,000 ...
50000        2,500,000,000   125,000,000,000,000 ...

→ Most of these n-grams will NEVER appear in any corpus!
→ This is why smoothing and neural models are needed.
```

---

## Code: Complete N-gram Pipeline

```python
import numpy as np
from collections import defaultdict, Counter

class CompleteNgramPipeline:
    """
    Full n-gram pipeline: training, evaluation, and generation.
    """

    def __init__(self, n=3):
        self.n = n
        self.ngram_counts = defaultdict(Counter)
        self.context_counts = Counter()
        self.vocab = set()
        self.vocab_size = 0

    def preprocess(self, text):
        """Tokenize and pad text."""
        words = text.lower().split()
        return ["<s>"] * (self.n - 1) + words + ["</s>"]

    def train(self, corpus):
        """Train on a corpus of sentences."""
        for sentence in corpus:
            tokens = self.preprocess(sentence)
            self.vocab.update(tokens)

            for i in range(self.n - 1, len(tokens)):
                context = tuple(tokens[i - self.n + 1:i])
                word = tokens[i]
                self.ngram_counts[context][word] += 1
                self.context_counts[context] += 1

        self.vocab_size = len(self.vocab)
        print(f"Trained {self.n}-gram model:")
        print(f"  Vocabulary: {self.vocab_size} words")
        print(f"  Unique contexts: {len(self.context_counts)}")
        print(f"  Total n-grams: {sum(self.context_counts.values())}")

    def prob(self, word, context, smoothing="laplace"):
        """Get probability with smoothing."""
        context = tuple(context)
        count = self.ngram_counts[context][word]
        total = self.context_counts[context]

        if smoothing == "laplace":
            return (count + 1) / (total + self.vocab_size)
        elif smoothing == "none":
            return count / total if total > 0 else 0
        else:
            return (count + 0.5) / (total + 0.5 * self.vocab_size)

    def sentence_probability(self, sentence):
        """Calculate log probability of a sentence."""
        tokens = self.preprocess(sentence)
        log_prob = 0

        for i in range(self.n - 1, len(tokens)):
            context = tuple(tokens[i - self.n + 1:i])
            word = tokens[i]
            p = self.prob(word, context)
            log_prob += np.log2(p) if p > 0 else -100

        return log_prob

    def perplexity(self, sentence):
        """Calculate perplexity of a sentence."""
        tokens = self.preprocess(sentence)
        n_predictions = len(tokens) - (self.n - 1)
        log_prob = self.sentence_probability(sentence)
        return 2 ** (-log_prob / n_predictions)

    def generate(self, seed=None, max_words=20, temperature=1.0):
        """Generate text."""
        if seed:
            context = list(self.preprocess(seed)[-self.n + 1:])
            generated = seed.split()
        else:
            context = ["<s>"] * (self.n - 1)
            generated = []

        for _ in range(max_words):
            ctx = tuple(context[-(self.n - 1):])
            candidates = self.ngram_counts[ctx]

            if not candidates:
                break

            words = list(candidates.keys())
            counts = np.array(list(candidates.values()), dtype=float)
            probs = counts ** (1.0 / temperature)
            probs /= probs.sum()

            next_word = np.random.choice(words, p=probs)
            if next_word == "</s>":
                break

            generated.append(next_word)
            context.append(next_word)

        return " ".join(generated)

# Use the pipeline
corpus = [
    "the cat sat on the mat and watched the birds",
    "a dog played in the park with the children",
    "the birds flew over the park in the morning",
    "in the morning the cat chased the birds in the garden",
    "the children played with the dog in the garden",
    "a bird sat on the fence and sang a song",
    "the dog ran in the park and chased the cat",
    "in the garden the birds sang in the morning",
]

pipeline = CompleteNgramPipeline(n=3)
pipeline.train(corpus)

# Evaluate
print("\n--- Sentence Perplexity ---")
test = [
    "the cat sat on the mat",
    "the dog played in the park",
    "the elephant flew to mars",
]
for sent in test:
    pp = pipeline.perplexity(sent)
    print(f"  '{sent}' → PP = {pp:.1f}")

# Generate
print("\n--- Generated Text ---")
for i in range(5):
    text = pipeline.generate(max_words=10, temperature=0.9)
    print(f"  {i + 1}. {text}")
```

---

## Summary

| Concept | Description |
|---|---|
| N-gram | Contiguous sequence of $n$ words |
| N-gram LM | $P(w_n \mid w_{n-k}...w_{n-1})$ via counting |
| Smoothing | Handles zero-count n-grams (Laplace, Kneser-Ney) |
| Markov Chain | Next state depends only on current state |
| PMI | Measures how associated two words are |
| Sparsity | Main weakness — exponential growth of possible n-grams |

**Key Takeaway:** N-grams are simple yet effective. They form the basis of statistical NLP and remain useful for feature engineering, even as neural models have surpassed them for language modeling. Understanding n-grams is essential for understanding why more complex models were developed.

---
