---
title: Language Models
---

# Language Models

A **language model** assigns probabilities to sequences of words. It answers the question: "How likely is this sentence?" Language models are the foundation of modern NLP — powering everything from autocomplete to ChatGPT.

---

## What is a Language Model?

A language model computes the probability of a sequence of words:

$$P(w_1, w_2, \ldots, w_n) = \prod_{i=1}^{n} P(w_i \mid w_1, w_2, \ldots, w_{i-1})$$

This is the **chain rule of probability** applied to text.

### Example

For the sentence "The cat sat on the mat":

$$P(\text{The cat sat on the mat}) = P(\text{The}) \times P(\text{cat} \mid \text{The}) \times P(\text{sat} \mid \text{The cat}) \times \ldots$$

### Why Does This Matter?

A good language model assigns:
- **High probability** to grammatical, meaningful sentences
- **Low probability** to nonsensical word sequences

```python
# Conceptual example: comparing sentence probabilities
sentences = {
    "The cat sat on the mat": 0.001,      # Natural
    "Mat the on sat cat the": 0.0000001,  # Ungrammatical
    "The dog chased the ball": 0.0008,    # Natural
    "Purple ideas sleep furiously": 0.00000001,  # Nonsensical
}

print(f"{'Sentence':<35} {'Probability':<15} {'Natural?'}")
print("-" * 65)
for sent, prob in sentences.items():
    natural = "Yes" if prob > 0.0001 else "No"
    print(f"{sent:<35} {prob:<15.10f} {natural}")
```

---

## Why Language Models Matter

Language models are the **foundation** of modern NLP. Nearly every NLP task benefits from understanding language probabilities:

| Application | How LM Helps |
|---|---|
| Autocomplete | Predict the most likely next word |
| Machine Translation | Choose the most fluent translation |
| Speech Recognition | Disambiguate similar-sounding words |
| Spelling Correction | "their" vs "there" vs "they're" |
| Text Generation | Generate coherent continuations |
| Summarization | Produce natural-sounding summaries |

```python
# Simple next-word prediction
def predict_next_word(context, word_probs):
    """Predict the most likely next word given context."""
    if context in word_probs:
        candidates = word_probs[context]
        best_word = max(candidates, key=candidates.get)
        return best_word, candidates[best_word]
    return None, 0

# Simplified conditional probabilities
word_probs = {
    "the": {"cat": 0.15, "dog": 0.12, "man": 0.08, "house": 0.06},
    "the cat": {"sat": 0.25, "ran": 0.15, "slept": 0.10, "ate": 0.08},
    "the cat sat": {"on": 0.60, "down": 0.20, "quietly": 0.10},
    "i want to": {"go": 0.20, "eat": 0.15, "learn": 0.12, "sleep": 0.10},
    "machine": {"learning": 0.65, "gun": 0.05, "room": 0.03},
}

contexts = ["the", "the cat", "the cat sat", "i want to", "machine"]
print("Next Word Predictions:")
print(f"{'Context':<20} {'Prediction':<12} {'Probability'}")
print("-" * 50)
for ctx in contexts:
    word, prob = predict_next_word(ctx, word_probs)
    print(f"{ctx:<20} {word:<12} {prob:.2f}")
```

---

## Perplexity: Evaluating Language Models

**Perplexity** measures how well a language model predicts text. Lower perplexity = better model.

$$PP(W) = P(w_1, w_2, \ldots, w_n)^{-1/n}$$

This can be rewritten as:

$$PP(W) = \exp\left(-\frac{1}{n} \sum_{i=1}^{n} \log P(w_i \mid w_1, \ldots, w_{i-1})\right)$$

### Intuition

- Perplexity represents the **average number of choices** the model is uncertain about at each step
- A perplexity of 10 means the model is as confused as if it had to choose uniformly among 10 words
- Perfect model: perplexity = 1 (always knows the next word)

```python
import numpy as np

def calculate_perplexity(probabilities):
    """
    Calculate perplexity given a list of probabilities
    for each word in a sequence.
    """
    n = len(probabilities)
    log_prob_sum = sum(np.log2(p) for p in probabilities)
    perplexity = 2 ** (-log_prob_sum / n)
    return perplexity

# Example: Model assigns these probabilities to words in a sentence
# "The cat sat on the mat"
good_model_probs = [0.10, 0.15, 0.25, 0.60, 0.10, 0.30]
bad_model_probs = [0.02, 0.03, 0.05, 0.10, 0.02, 0.04]

pp_good = calculate_perplexity(good_model_probs)
pp_bad = calculate_perplexity(bad_model_probs)

print("Perplexity Comparison:")
print(f"  Good model: {pp_good:.2f}")
print(f"  Bad model:  {pp_bad:.2f}")
print(f"\nThe good model is {pp_bad/pp_good:.1f}x less perplexed")

# Comparing models on multiple sentences
print("\n--- Model Comparison ---")
test_sentences = [
    ("Natural sentence", [0.12, 0.20, 0.30, 0.15, 0.25]),
    ("Rare sentence", [0.02, 0.05, 0.08, 0.03, 0.06]),
    ("Very predictable", [0.50, 0.60, 0.70, 0.55, 0.65]),
]

print(f"{'Sentence Type':<25} {'Perplexity':<12} {'Quality'}")
print("-" * 50)
for name, probs in test_sentences:
    pp = calculate_perplexity(probs)
    quality = "Excellent" if pp < 5 else "Good" if pp < 20 else "Poor"
    print(f"{name:<25} {pp:<12.2f} {quality}")
```

---

## Types of Language Models

### 1. Statistical Language Models (N-gram)

Use fixed-size context windows:

$$P(w_n \mid w_1, \ldots, w_{n-1}) \approx P(w_n \mid w_{n-k}, \ldots, w_{n-1})$$

```python
from collections import defaultdict, Counter

class BigramLanguageModel:
    """Simple bigram (2-gram) language model."""

    def __init__(self):
        self.bigram_counts = defaultdict(Counter)
        self.unigram_counts = Counter()

    def train(self, corpus):
        """Train on a list of sentences (each a list of words)."""
        for sentence in corpus:
            tokens = ["<START>"] + sentence + ["<END>"]
            for i in range(len(tokens) - 1):
                self.bigram_counts[tokens[i]][tokens[i + 1]] += 1
                self.unigram_counts[tokens[i]] += 1

    def probability(self, word, context):
        """P(word | context) with Laplace smoothing."""
        count_bigram = self.bigram_counts[context][word]
        count_context = self.unigram_counts[context]
        vocab_size = len(self.unigram_counts)
        # Laplace smoothing
        return (count_bigram + 1) / (count_context + vocab_size)

    def generate(self, max_length=20):
        """Generate a sentence."""
        words = []
        context = "<START>"
        for _ in range(max_length):
            candidates = self.bigram_counts[context]
            if not candidates:
                break
            # Weighted random choice
            total = sum(candidates.values())
            probs = {w: c / total for w, c in candidates.items()}
            word = max(probs, key=probs.get)  # Greedy for simplicity
            if word == "<END>":
                break
            words.append(word)
            context = word
        return " ".join(words)

# Training data
corpus = [
    ["the", "cat", "sat", "on", "the", "mat"],
    ["the", "dog", "ran", "in", "the", "park"],
    ["the", "cat", "chased", "the", "mouse"],
    ["a", "dog", "sat", "on", "the", "rug"],
    ["the", "bird", "flew", "over", "the", "house"],
]

model = BigramLanguageModel()
model.train(corpus)

# Test probabilities
print("Bigram Probabilities:")
test_pairs = [("cat", "the"), ("sat", "cat"), ("ran", "dog")]
for word, context in test_pairs:
    prob = model.probability(word, context)
    print(f"  P({word} | {context}) = {prob:.4f}")

print(f"\nGenerated: {model.generate()}")
```

### 2. Neural Language Models (RNN-based)

Use learned representations with theoretically unlimited context:

- Hidden state encodes all previous context
- Better generalization through word embeddings
- Can capture long-range dependencies

### 3. Transformer Language Models

Use self-attention to process all positions simultaneously:

- **BERT**: Bidirectional, great for understanding
- **GPT**: Left-to-right, great for generation
- **T5**: Encoder-decoder, versatile

```python
# Using a pretrained language model (Hugging Face)
# pip install transformers torch

from transformers import pipeline

def demo_language_model():
    """Demonstrate a pretrained language model."""
    # Fill-mask model (BERT-style)
    fill_mask = pipeline("fill-mask", model="distilbert-base-uncased")

    sentences = [
        "The capital of France is [MASK].",
        "Machine learning is a branch of [MASK] intelligence.",
        "Python is a popular [MASK] language.",
    ]

    print("Fill-in-the-blank predictions:")
    for sent in sentences:
        results = fill_mask(sent)
        top = results[0]
        print(f"\n  Input:  {sent}")
        print(f"  Output: {top['sequence']} (score: {top['score']:.4f})")

# Uncomment to run (requires transformers library)
# demo_language_model()
```

---

## Language Model Applications

### 1. Autocomplete / Text Prediction

```python
def autocomplete(prefix, model_probs, top_k=5):
    """Simulate autocomplete using language model probabilities."""
    last_word = prefix.split()[-1] if prefix.split() else ""

    if last_word in model_probs:
        candidates = model_probs[last_word]
        sorted_candidates = sorted(
            candidates.items(), key=lambda x: x[1], reverse=True
        )
        return sorted_candidates[:top_k]
    return []

# Simulated language model probabilities
model_probs = {
    "machine": {
        "learning": 0.65, "vision": 0.10, "translation": 0.08,
        "intelligence": 0.05, "code": 0.03,
    },
    "deep": {
        "learning": 0.70, "dive": 0.08, "neural": 0.07,
        "sea": 0.05, "understanding": 0.04,
    },
    "natural": {
        "language": 0.55, "selection": 0.15, "disaster": 0.10,
        "beauty": 0.05, "resources": 0.04,
    },
}

prefixes = ["machine", "deep", "natural"]
print("Autocomplete Suggestions:")
for prefix in prefixes:
    suggestions = autocomplete(prefix, model_probs, top_k=3)
    print(f"\n  '{prefix} ...'")
    for word, prob in suggestions:
        bar = "█" * int(prob * 30)
        print(f"    {word:<15} {bar} ({prob:.0%})")
```

### 2. Text Generation

```python
import random

def generate_text(model, seed_word, length=15, temperature=1.0):
    """
    Generate text using a simple language model with temperature.
    Temperature controls randomness:
      - Low (0.1): very predictable, repetitive
      - Medium (1.0): balanced
      - High (2.0): creative but possibly incoherent
    """
    words = [seed_word]
    current = seed_word

    for _ in range(length):
        if current not in model:
            break

        candidates = model[current]
        words_list = list(candidates.keys())
        probs = list(candidates.values())

        # Apply temperature
        probs = np.array(probs)
        probs = probs ** (1.0 / temperature)
        probs = probs / probs.sum()

        next_word = np.random.choice(words_list, p=probs)
        words.append(next_word)
        current = next_word

    return " ".join(words)

# Simple bigram model
simple_model = {
    "the": {"cat": 0.2, "dog": 0.15, "world": 0.1, "sun": 0.08, "old": 0.07},
    "cat": {"sat": 0.3, "ran": 0.2, "slept": 0.15, "chased": 0.1, "ate": 0.08},
    "dog": {"barked": 0.25, "ran": 0.2, "played": 0.15, "sat": 0.1, "ate": 0.08},
    "sat": {"on": 0.4, "down": 0.2, "quietly": 0.15, "still": 0.1, "there": 0.05},
    "on": {"the": 0.5, "a": 0.2, "top": 0.1, "his": 0.08, "her": 0.05},
    "ran": {"fast": 0.2, "away": 0.25, "home": 0.15, "to": 0.1, "through": 0.08},
}

print("Text Generation with Different Temperatures:")
for temp in [0.3, 1.0, 2.0]:
    text = generate_text(simple_model, "the", length=8, temperature=temp)
    print(f"  Temperature {temp}: {text}")
```

### 3. Spelling Correction

```python
def spelling_correction(sentence, language_model_probs):
    """
    Use language model probabilities to choose
    between confusable words.
    """
    confusables = {
        "their": ["their", "there", "they're"],
        "there": ["their", "there", "they're"],
        "they're": ["their", "there", "they're"],
        "your": ["your", "you're"],
        "you're": ["your", "you're"],
        "its": ["its", "it's"],
        "it's": ["its", "it's"],
    }

    words = sentence.lower().split()
    corrections = []

    for i, word in enumerate(words):
        if word in confusables:
            context = words[i - 1] if i > 0 else "<START>"
            best_word = word
            best_prob = 0

            for candidate in confusables[word]:
                key = f"{context}_{candidate}"
                prob = language_model_probs.get(key, 0.01)
                if prob > best_prob:
                    best_prob = prob
                    best_word = candidate

            corrections.append(best_word)
        else:
            corrections.append(word)

    return " ".join(corrections)

# Simulated contextual probabilities
lm_probs = {
    "is_their": 0.05,
    "is_there": 0.70,
    "is_they're": 0.02,
    "over_their": 0.10,
    "over_there": 0.75,
    "lost_their": 0.80,
    "lost_there": 0.05,
}

test = "is their anyone over their who lost there keys"
corrected = spelling_correction(test, lm_probs)
print(f"Original:  {test}")
print(f"Corrected: {corrected}")
```

---

## The Evolution of Language Models

```python
# Timeline of language model development
evolution = [
    ("1948", "Shannon", "Information theory, entropy of English"),
    ("1980s", "N-gram models", "Statistical approach, Markov assumption"),
    ("2003", "Neural LM (Bengio)", "First neural language model"),
    ("2013", "Word2Vec", "Efficient word embeddings"),
    ("2015", "Attention mechanism", "Focus on relevant parts"),
    ("2017", "Transformer", "Self-attention, parallelizable"),
    ("2018", "BERT", "Bidirectional pretraining"),
    ("2018", "GPT", "Generative pretraining"),
    ("2020", "GPT-3", "175B parameters, few-shot learning"),
    ("2022", "ChatGPT", "RLHF, conversational AI"),
    ("2023", "GPT-4", "Multimodal, stronger reasoning"),
]

print("Evolution of Language Models")
print("=" * 65)
print(f"{'Year':<8} {'Model/Concept':<22} {'Key Innovation'}")
print("-" * 65)
for year, model, innovation in evolution:
    print(f"{year:<8} {model:<22} {innovation}")
```

### Key Paradigm Shifts

| Era | Approach | Context Window | Parameters |
|---|---|---|---|
| Classical | N-gram + smoothing | 2-5 words | Millions of counts |
| Neural (RNN) | Recurrent networks | ~100 words | Millions |
| Transformer | Self-attention | 512-2048 tokens | Millions–Billions |
| Large LMs | Scaled transformers | 4K–128K tokens | Billions–Trillions |

---

## Code: Simple Language Model Demo

```python
import numpy as np
from collections import defaultdict, Counter

class SimpleLanguageModel:
    """
    A complete n-gram language model with smoothing,
    perplexity calculation, and text generation.
    """

    def __init__(self, n=3):
        self.n = n
        self.ngram_counts = defaultdict(Counter)
        self.context_counts = Counter()
        self.vocab = set()

    def train(self, texts):
        """Train on a list of text strings."""
        for text in texts:
            words = text.lower().split()
            self.vocab.update(words)

            # Add start/end tokens
            padded = ["<s>"] * (self.n - 1) + words + ["</s>"]

            for i in range(len(padded) - self.n + 1):
                context = tuple(padded[i:i + self.n - 1])
                word = padded[i + self.n - 1]
                self.ngram_counts[context][word] += 1
                self.context_counts[context] += 1

    def probability(self, word, context):
        """Calculate P(word | context) with Laplace smoothing."""
        context = tuple(context)
        count = self.ngram_counts[context][word]
        total = self.context_counts[context]
        V = len(self.vocab) + 1  # +1 for </s>
        return (count + 1) / (total + V)

    def perplexity(self, text):
        """Calculate perplexity of a text."""
        words = text.lower().split()
        padded = ["<s>"] * (self.n - 1) + words + ["</s>"]

        log_prob = 0
        n_tokens = 0

        for i in range(self.n - 1, len(padded)):
            context = tuple(padded[i - self.n + 1:i])
            word = padded[i]
            prob = self.probability(word, context)
            log_prob += np.log2(prob)
            n_tokens += 1

        return 2 ** (-log_prob / n_tokens)

    def generate(self, max_words=20, temperature=1.0):
        """Generate text using the model."""
        context = list(["<s>"] * (self.n - 1))
        generated = []

        for _ in range(max_words):
            ctx_tuple = tuple(context[-(self.n - 1):])
            candidates = self.ngram_counts[ctx_tuple]

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

# Training corpus
corpus = [
    "the quick brown fox jumps over the lazy dog",
    "the cat sat on the mat in the morning",
    "a dog and a cat played in the garden",
    "the brown dog chased the quick cat",
    "in the morning the fox ran through the garden",
    "the lazy cat slept on the mat all day",
    "a quick fox and a brown dog ran together",
    "the garden was full of flowers in the morning",
]

# Train trigram model
lm = SimpleLanguageModel(n=3)
lm.train(corpus)

# Calculate perplexity
test_sentences = [
    "the cat sat on the mat",
    "the dog ran in the garden",
    "purple elephants fly backwards daily",
]

print("Perplexity (lower = model knows this text better):")
for sent in test_sentences:
    pp = lm.perplexity(sent)
    print(f"  '{sent}' → PP = {pp:.2f}")

# Generate text
print("\nGenerated sentences:")
for i in range(5):
    text = lm.generate(max_words=10, temperature=0.8)
    print(f"  {i + 1}. {text}")
```

---

## Summary

| Concept | Description |
|---|---|
| Language Model | Assigns probabilities to word sequences |
| Chain Rule | $P(w_1...w_n) = \prod P(w_i \mid w_1...w_{i-1})$ |
| Perplexity | Evaluation metric (lower = better) |
| N-gram LM | Fixed context, sparse, fast |
| Neural LM | Learned representations, better generalization |
| Transformer LM | Self-attention, state-of-the-art |

**Key Takeaway:** Language models are the backbone of NLP. From simple n-grams to GPT-4, the core idea remains the same — predict the next word given context — but the methods have become dramatically more powerful.

---
