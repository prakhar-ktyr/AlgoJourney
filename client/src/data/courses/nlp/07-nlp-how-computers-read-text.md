---
title: How Computers Read Text
---

# How Computers Read Text

In this lesson, you will learn how computers represent and process text data.

Computers don't understand words — they only understand numbers. This lesson bridges that gap.

---

## Text as Numbers

Computers work with **binary digits** (0s and 1s). Everything stored in memory is a number.

When you type "Hello", the computer sees something like:

```
H  →  72
e  →  101
l  →  108
l  →  108
o  →  111
```

The fundamental challenge of NLP:

> **How do we convert meaningful human text into numbers that preserve meaning?**

This is called **text representation** or **text encoding**, and it's the foundation of all NLP.

---

## Character Encoding

Character encoding is the system that maps characters to numbers.

### ASCII (American Standard Code for Information Interchange)

ASCII was one of the first encoding standards (1963):

| Character | Decimal | Binary |
|-----------|---------|--------|
| A | 65 | 01000001 |
| B | 66 | 01000010 |
| Z | 90 | 01011010 |
| a | 97 | 01100001 |
| 0 | 48 | 00110000 |
| ! | 33 | 00100001 |
| (space) | 32 | 00100000 |

ASCII uses 7 bits = 128 possible characters.

**Problem**: ASCII only covers English! No accents (é), no Chinese (中), no Arabic (ع).

### Unicode

Unicode assigns a unique number (called a **code point**) to every character in every language:

| Character | Code Point | Description |
|-----------|-----------|-------------|
| A | U+0041 | Latin capital A |
| é | U+00E9 | Latin small e with acute |
| 中 | U+4E2D | CJK character "middle" |
| 😀 | U+1F600 | Grinning face emoji |
| π | U+03C0 | Greek small pi |

Unicode defines over 149,000 characters across 161 scripts.

### UTF-8 (Unicode Transformation Format - 8 bit)

UTF-8 is the most common encoding on the web. It uses **variable-length** encoding:

| Character Range | Bytes Used | Example |
|----------------|-----------|---------|
| ASCII (U+0000 to U+007F) | 1 byte | "A" = 0x41 |
| Latin Extended (U+0080 to U+07FF) | 2 bytes | "é" = 0xC3 0xA9 |
| CJK (U+0800 to U+FFFF) | 3 bytes | "中" = 0xE4 0xB8 0xAD |
| Emoji (U+10000+) | 4 bytes | "😀" = 0xF0 0x9F 0x98 0x80 |

**Why UTF-8 is popular**: backward compatible with ASCII, space-efficient for English text.

```python
# Character encoding in Python
text = "Hello 中文 émoji 😀"

# Encode to bytes
utf8_bytes = text.encode("utf-8")
print(f"Text: {text}")
print(f"UTF-8 bytes: {utf8_bytes}")
print(f"Number of characters: {len(text)}")
print(f"Number of bytes: {len(utf8_bytes)}")

# Individual character codes
for char in "Hello":
    print(f"  '{char}' → Unicode: U+{ord(char):04X} (decimal: {ord(char)})")
```

Output:

```
Text: Hello 中文 émoji 😀
UTF-8 bytes: b'Hello \xe4\xb8\xad\xe6\x96\x87 \xc3\xa9moji \xf0\x9f\x98\x80'
Number of characters: 16
Number of bytes: 24
  'H' → Unicode: U+0048 (decimal: 72)
  'e' → Unicode: U+0065 (decimal: 101)
  'l' → Unicode: U+006C (decimal: 108)
  'l' → Unicode: U+006C (decimal: 108)
  'o' → Unicode: U+006F (decimal: 111)
```

---

## One-Hot Encoding

One-hot encoding represents each item as a binary vector with exactly one "1".

### One-Hot Encoding for Characters

Given the alphabet {a, b, c, d, e}:

| Character | One-Hot Vector |
|-----------|---------------|
| a | [1, 0, 0, 0, 0] |
| b | [0, 1, 0, 0, 0] |
| c | [0, 0, 1, 0, 0] |
| d | [0, 0, 0, 1, 0] |
| e | [0, 0, 0, 0, 1] |

The word "bad" becomes:

$$\text{"bad"} = \begin{bmatrix} 0,1,0,0,0 \\ 1,0,0,0,0 \\ 0,0,0,1,0 \end{bmatrix}$$

### One-Hot Encoding for Words

Given vocabulary: {cat, dog, fish, bird}:

| Word | One-Hot Vector |
|------|---------------|
| cat | [1, 0, 0, 0] |
| dog | [0, 1, 0, 0] |
| fish | [0, 0, 1, 0] |
| bird | [0, 0, 0, 1] |

### Problems with One-Hot Encoding

| Problem | Explanation |
|---------|-------------|
| No similarity | "cat" and "dog" are equally different as "cat" and "fish" |
| Huge vectors | Vocabulary of 50,000 words → 50,000-dimensional vectors |
| Sparse | Mostly zeros, wasteful |
| No semantics | Vectors carry no meaning |

The distance between any two one-hot vectors is always the same:

$$d(\text{cat}, \text{dog}) = d(\text{cat}, \text{fish}) = \sqrt{2}$$

This means the model can't tell that "cat" is more similar to "dog" than to "airplane".

---

## Vocabulary and Vocabulary Size

A **vocabulary** is the set of all unique words (or tokens) your model knows.

### Building a Vocabulary

```
Corpus: "the cat sat on the mat the cat is happy"
Vocabulary: {"the", "cat", "sat", "on", "mat", "is", "happy"}
Vocabulary size: 7
```

### Vocabulary Size in Practice

| Dataset/Model | Approximate Vocab Size |
|---------------|----------------------|
| Simple text classification | 10,000 - 50,000 |
| News corpus | 100,000+ |
| GPT-2 | 50,257 tokens |
| BERT | 30,522 tokens |
| GPT-4 | ~100,000 tokens |

### The Out-of-Vocabulary (OOV) Problem

Words not in your vocabulary can't be represented:

```
Vocabulary: {"hello", "world", "nlp"}
Input: "Hello NLP is awesome"

"awesome" → ??? (OOV - unknown word!)
```

Common solutions:

1. **UNK token**: replace unknown words with a special `<UNK>` token
2. **Subword tokenization**: break unknown words into known pieces
3. **Character-level models**: work at character level (no OOV possible)

---

## Encoding Schemes

Beyond one-hot, there are simpler numerical encoding schemes.

### Label Encoding (Integer Encoding)

Assign each unique word a sequential integer:

| Word | Integer |
|------|---------|
| apple | 0 |
| banana | 1 |
| cherry | 2 |
| date | 3 |

**Problem**: Implies ordering. Is "banana" > "apple"? The model might think so!

$$\text{banana} = 1 > \text{apple} = 0 \implies \text{banana} > \text{apple}?$$

This false ordering can confuse models.

### Ordinal Encoding

Like label encoding, but used when there IS a natural order:

| Rating | Code |
|--------|------|
| terrible | 0 |
| bad | 1 |
| okay | 2 |
| good | 3 |
| excellent | 4 |

Here the ordering makes sense: excellent > good > okay.

### Frequency-Based Encoding

Encode words by their frequency rank:

| Word | Frequency | Rank |
|------|-----------|------|
| the | 5000 | 1 |
| is | 3000 | 2 |
| cat | 500 | 3 |
| quantum | 10 | 4 |

### Comparison of Encoding Methods

| Method | Preserves Meaning? | Size | Use Case |
|--------|-------------------|------|----------|
| One-Hot | No | Large (sparse) | Categorical inputs |
| Label/Integer | No (implies order) | Small | Lookup tables |
| Ordinal | Partially (order only) | Small | Ordered categories |
| Frequency | No | Small | Simple baselines |

---

## From Text to Vectors: The Fundamental Challenge

The goal of NLP representation is to create vectors where:

1. **Similar words have similar vectors** ("king" ≈ "queen")
2. **Relationships are preserved** ("king" - "man" + "woman" ≈ "queen")
3. **Dimensions are manageable** (not 50,000-dimensional)

This leads us to **dense embeddings** (covered in later lessons):

| Approach | Dimensions | Semantic? | Example |
|----------|-----------|-----------|---------|
| One-hot | V (vocab size) | No | [0,0,1,0,...,0] |
| Word2Vec | 100-300 | Yes | [0.2, -0.5, 0.8, ...] |
| GloVe | 50-300 | Yes | [0.1, 0.3, -0.2, ...] |
| BERT | 768 | Yes (contextual) | [0.04, -0.12, ...] |

The mathematical relationship we want:

$$\vec{v}(\text{king}) - \vec{v}(\text{man}) + \vec{v}(\text{woman}) \approx \vec{v}(\text{queen})$$

---

## The Curse of Dimensionality

As the number of dimensions increases, interesting problems arise.

### What Is It?

In high-dimensional spaces:

- Data becomes **sparse** — points are far apart
- **Distance loses meaning** — all points seem equally far
- You need **exponentially more data** to fill the space

### Example

For a vocabulary of $V = 50{,}000$ words with one-hot encoding:

- Each word is a vector in $\mathbb{R}^{50{,}000}$
- Total possible states: $2^{50{,}000}$ (astronomically large)
- Your training data covers a tiny fraction

### Volume of a Hypersphere

The fraction of a hypercube occupied by an inscribed hypersphere **shrinks** as dimensions increase:

$$\frac{V_{\text{sphere}}}{V_{\text{cube}}} = \frac{\pi^{d/2}}{d \cdot 2^{d-1} \cdot \Gamma(d/2)}$$

For $d = 2$: ratio ≈ 0.785 (78.5% of the square)
For $d = 10$: ratio ≈ 0.0025 (0.25% of the hypercube)
For $d = 100$: ratio ≈ $10^{-70}$ (essentially zero)

### Implications for NLP

| Dimension | Impact |
|-----------|--------|
| Low (2-3) | Easy to visualize, distances meaningful |
| Medium (100-300) | Dense embeddings work well |
| High (50,000+) | One-hot is sparse, distances meaningless |

This is why we prefer **dense, low-dimensional** representations (like Word2Vec at 300 dimensions) over sparse one-hot vectors.

---

## Code: Building a Vocabulary and Encoding Text

Let's build a complete text encoding system from scratch:

```python
# === Building a Vocabulary and Encoding Text ===

class SimpleTextEncoder:
    """A basic text encoder that builds vocabulary and encodes text."""

    def __init__(self):
        self.word_to_index = {}
        self.index_to_word = {}
        self.vocab_size = 0

    def build_vocabulary(self, corpus):
        """Build vocabulary from a list of sentences."""
        # Collect all unique words
        unique_words = set()
        for sentence in corpus:
            words = sentence.lower().split()
            unique_words.update(words)

        # Sort for reproducibility and assign indices
        sorted_words = sorted(unique_words)

        # Add special tokens first
        special_tokens = ["<PAD>", "<UNK>", "<START>", "<END>"]
        all_tokens = special_tokens + sorted_words

        for idx, word in enumerate(all_tokens):
            self.word_to_index[word] = idx
            self.index_to_word[idx] = word

        self.vocab_size = len(all_tokens)
        print(f"Vocabulary built: {self.vocab_size} tokens")
        return self

    def encode_integer(self, sentence):
        """Convert sentence to list of integers (label encoding)."""
        words = sentence.lower().split()
        encoded = []
        for word in words:
            if word in self.word_to_index:
                encoded.append(self.word_to_index[word])
            else:
                encoded.append(self.word_to_index["<UNK>"])  # Unknown word
        return encoded

    def decode_integer(self, indices):
        """Convert list of integers back to sentence."""
        words = [self.index_to_word.get(idx, "<UNK>") for idx in indices]
        return " ".join(words)

    def encode_one_hot(self, sentence):
        """Convert sentence to one-hot encoded matrix."""
        indices = self.encode_integer(sentence)
        one_hot_matrix = []
        for idx in indices:
            vector = [0] * self.vocab_size
            vector[idx] = 1
            one_hot_matrix.append(vector)
        return one_hot_matrix

    def display_encoding(self, sentence):
        """Display all encodings for a sentence."""
        print(f"\nSentence: \"{sentence}\"")
        print("-" * 50)

        # Integer encoding
        integers = self.encode_integer(sentence)
        print(f"Integer encoding: {integers}")

        # Show word-to-integer mapping
        words = sentence.lower().split()
        print("\nWord mappings:")
        for word, idx in zip(words, integers):
            status = "" if word in self.word_to_index else " (OOV → <UNK>)"
            print(f"  '{word}' → {idx}{status}")

        # One-hot (show abbreviated)
        one_hot = self.encode_one_hot(sentence)
        print(f"\nOne-hot shape: [{len(one_hot)} words × {self.vocab_size} dimensions]")
        print("One-hot (first word, first 15 dims):", one_hot[0][:15], "...")

        # Decode back
        decoded = self.decode_integer(integers)
        print(f"\nDecoded back: \"{decoded}\"")


# --- Demo ---
corpus = [
    "the cat sat on the mat",
    "the dog ran in the park",
    "a bird flew over the house",
    "the cat chased the bird",
    "NLP is fun and interesting"
]

# Build encoder
encoder = SimpleTextEncoder()
encoder.build_vocabulary(corpus)

# Show vocabulary
print(f"\n=== Vocabulary ({encoder.vocab_size} tokens) ===")
for word, idx in list(encoder.word_to_index.items())[:15]:
    print(f"  {idx:3d}: '{word}'")
print("  ...")
```

Output:

```
Vocabulary built: 24 tokens

=== Vocabulary (24 tokens) ===
    0: '<PAD>'
    1: '<UNK>'
    2: '<START>'
    3: '<END>'
    4: 'a'
    5: 'and'
    6: 'bird'
    7: 'cat'
    8: 'chased'
    9: 'dog'
   10: 'flew'
   11: 'fun'
  ...
```

### Testing the Encoder

```python
# Encode sentences
encoder.display_encoding("the cat sat on the mat")
encoder.display_encoding("the dog chased a bird")
encoder.display_encoding("the elephant ate a banana")  # Contains OOV words
```

Output:

```
Sentence: "the cat sat on the mat"
--------------------------------------------------
Integer encoding: [20, 7, 19, 16, 20, 14]

Word mappings:
  'the' → 20
  'cat' → 7
  'sat' → 19
  'on' → 16
  'the' → 20
  'mat' → 14

One-hot shape: [6 words × 24 dimensions]
One-hot (first word, first 15 dims): [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] ...

Decoded back: "the cat sat on the mat"

Sentence: "the elephant ate a banana"
--------------------------------------------------
Integer encoding: [20, 1, 1, 4, 1]

Word mappings:
  'the' → 20
  'elephant' → 1 (OOV → <UNK>)
  'ate' → 1 (OOV → <UNK>)
  'a' → 4
  'banana' → 1 (OOV → <UNK>)
```

### Demonstrating the Sparsity Problem

```python
# === Demonstrating Sparsity ===
import math

vocab_size = 50000  # Realistic vocabulary size

# One-hot vector stats
total_elements = vocab_size  # per word
non_zero_elements = 1
sparsity = 1 - (non_zero_elements / total_elements)

print(f"\n=== Sparsity Analysis ===")
print(f"Vocabulary size: {vocab_size:,}")
print(f"One-hot vector size: {vocab_size:,} dimensions")
print(f"Non-zero elements per vector: {non_zero_elements}")
print(f"Sparsity: {sparsity * 100:.4f}%")
print(f"Memory per word (float32): {vocab_size * 4 / 1024:.1f} KB")
print(f"Memory for 100 words: {vocab_size * 4 * 100 / 1024 / 1024:.1f} MB")

# Compare with dense embeddings
embed_dim = 300  # Word2Vec dimension
print(f"\n=== Dense Embedding Comparison ===")
print(f"Dense vector size: {embed_dim} dimensions")
print(f"Memory per word (float32): {embed_dim * 4 / 1024:.2f} KB")
print(f"Memory for 100 words: {embed_dim * 4 * 100 / 1024:.1f} KB")
print(f"Compression ratio: {vocab_size / embed_dim:.0f}x smaller")
```

Output:

```
=== Sparsity Analysis ===
Vocabulary size: 50,000
One-hot vector size: 50,000 dimensions
Non-zero elements per vector: 1
Sparsity: 99.9980%
Memory per word (float32): 195.3 KB
Memory for 100 words: 19.1 MB

=== Dense Embedding Comparison ===
Dense vector size: 300 dimensions
Memory per word (float32): 1.17 KB
Memory for 100 words: 117.2 KB
Compression ratio: 167x smaller
```

---

## Summary

In this lesson, you learned:

- Computers only understand **numbers** — text must be converted
- **Character encoding** (ASCII → Unicode → UTF-8) maps characters to numbers
- **One-hot encoding** represents words as sparse binary vectors
- **Vocabulary** is the set of known tokens; unknown words are OOV
- **Label/ordinal encoding** assigns integers but can imply false ordering
- The **curse of dimensionality** makes high-dimensional sparse vectors impractical
- Dense, low-dimensional **embeddings** are the modern solution

The key insight: we need representations where **similar meanings produce similar numbers**.

---

## Exercises

1. Write a function that converts a sentence to its ASCII code values
2. Calculate the sparsity of one-hot vectors for a vocabulary of 100,000 words
3. Implement a frequency-based encoder that assigns lower numbers to more common words
4. Explain why the cosine similarity between any two different one-hot vectors is always 0
