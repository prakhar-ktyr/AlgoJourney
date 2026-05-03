---
title: Recurrent Neural Networks for NLP
---

# Recurrent Neural Networks for NLP

**Recurrent Neural Networks (RNNs)** are neural networks designed to process sequences. Unlike traditional networks, RNNs have a "memory" — they maintain a hidden state that captures information from previous inputs.

---

## Neural Networks Refresher

A standard neural network consists of layers of connected neurons:

### Key Concepts

| Component | Description |
|---|---|
| **Input layer** | Receives the data |
| **Hidden layers** | Process and transform data |
| **Output layer** | Produces the prediction |
| **Weights** | Learnable parameters connecting neurons |
| **Bias** | Additional learnable parameter per neuron |
| **Activation function** | Introduces non-linearity (ReLU, sigmoid, tanh) |

### Forward Pass

For a single hidden layer:

$$\mathbf{h} = \sigma(\mathbf{W}_x \mathbf{x} + \mathbf{b})$$

$$\mathbf{y} = \text{softmax}(\mathbf{W}_h \mathbf{h} + \mathbf{b}_o)$$

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()

# Simple feedforward network
def feedforward(x, W1, b1, W2, b2):
    """One hidden layer network."""
    h = relu(W1 @ x + b1)       # Hidden layer
    y = softmax(W2 @ h + b2)    # Output layer
    return y

# Example: classify a 4-dimensional input into 3 classes
np.random.seed(42)
x = np.array([0.5, -0.3, 0.8, 0.1])
W1 = np.random.randn(6, 4) * 0.1   # 4 inputs → 6 hidden
b1 = np.zeros(6)
W2 = np.random.randn(3, 6) * 0.1   # 6 hidden → 3 outputs
b2 = np.zeros(3)

output = feedforward(x, W1, b1, W2, b2)
print(f"Input: {x}")
print(f"Output probabilities: {output}")
print(f"Predicted class: {np.argmax(output)}")
```

---

## Why Regular Neural Networks Fail for Sequences

Standard feedforward networks have fundamental limitations for text:

### Problem 1: Variable Length Input

Text comes in different lengths. A feedforward network needs a fixed-size input.

```
"Hello"           → 1 word
"I love NLP"      → 3 words
"The quick brown fox jumps over the lazy dog" → 9 words
```

### Problem 2: No Memory / No Order

A feedforward network treats inputs independently — it has no concept of "what came before":

```python
# Feedforward: each word processed independently
# "dog bites man" and "man bites dog" would have same bag-of-words!

from collections import Counter

sent1 = "dog bites man"
sent2 = "man bites dog"

bow1 = Counter(sent1.split())
bow2 = Counter(sent2.split())

print(f"'{sent1}' → {dict(bow1)}")
print(f"'{sent2}' → {dict(bow2)}")
print(f"Same representation? {bow1 == bow2}")  # True!
print("\n→ Feedforward networks lose word ORDER information!")
```

### Problem 3: No Parameter Sharing Across Positions

If we trained a different weight for each position, we would:
- Need enormous numbers of parameters
- Not generalize across positions
- Not handle unseen lengths

---

## RNN: Hidden State as Memory

An RNN processes sequences one element at a time, maintaining a **hidden state** that summarizes all previous inputs:

$$h_t = f(W_h h_{t-1} + W_x x_t + b)$$

Where:
- $h_t$ = hidden state at time step $t$
- $h_{t-1}$ = previous hidden state (memory)
- $x_t$ = input at time step $t$
- $W_h$ = hidden-to-hidden weight matrix
- $W_x$ = input-to-hidden weight matrix
- $b$ = bias vector
- $f$ = activation function (usually tanh)

```python
import numpy as np

class SimpleRNN:
    """A basic RNN implementation from scratch."""

    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights with small random values
        self.hidden_size = hidden_size
        self.Wx = np.random.randn(hidden_size, input_size) * 0.01
        self.Wh = np.random.randn(hidden_size, hidden_size) * 0.01
        self.Wy = np.random.randn(output_size, hidden_size) * 0.01
        self.bh = np.zeros(hidden_size)
        self.by = np.zeros(output_size)

    def forward(self, inputs):
        """
        Process a sequence of inputs.
        inputs: list of input vectors (one per time step)
        Returns: final output and all hidden states
        """
        h = np.zeros(self.hidden_size)  # Initial hidden state
        hidden_states = []

        for x in inputs:
            # RNN equation: h_t = tanh(W_x * x_t + W_h * h_{t-1} + b)
            h = np.tanh(self.Wx @ x + self.Wh @ h + self.bh)
            hidden_states.append(h.copy())

        # Output from final hidden state
        y = self.Wy @ h + self.by
        return y, hidden_states

# Demo: process a 3-word sentence
# Each word is represented as a 4-dimensional vector
rnn = SimpleRNN(input_size=4, hidden_size=8, output_size=3)

# Simulate word embeddings for "I love NLP"
word_embeddings = [
    np.array([0.2, -0.1, 0.5, 0.3]),   # "I"
    np.array([0.8, 0.6, -0.2, 0.1]),    # "love"
    np.array([-0.1, 0.4, 0.7, -0.3]),   # "NLP"
]

output, states = rnn.forward(word_embeddings)

print("Processing: 'I love NLP'")
print(f"\nHidden states at each step:")
for i, (word, state) in enumerate(zip(["I", "love", "NLP"], states)):
    print(f"  Step {i} ('{word}'): h = [{state[0]:.3f}, {state[1]:.3f}, ...]")
print(f"\nFinal output: {output[:3]}")
print("→ The hidden state accumulates information from ALL previous words")
```

### Unrolling the RNN

When we "unroll" an RNN through time, we see it processes each word sequentially:

```
x₁ ("I")    → [RNN Cell] → h₁
                  ↓
x₂ ("love") → [RNN Cell] → h₂
                  ↓
x₃ ("NLP")  → [RNN Cell] → h₃ → Output
```

Each cell shares the **same weights** — this is what makes RNNs efficient.

---

## Processing Text: Word Embeddings → RNN → Output

The full pipeline for text processing with RNNs:

```python
import numpy as np

class TextRNNClassifier:
    """
    Complete text classification pipeline:
    Text → Tokenize → Embed → RNN → Classify
    """

    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim

        # Word embedding matrix (randomly initialized)
        self.embeddings = np.random.randn(vocab_size, embed_dim) * 0.1

        # RNN weights
        self.Wx = np.random.randn(hidden_dim, embed_dim) * 0.1
        self.Wh = np.random.randn(hidden_dim, hidden_dim) * 0.1
        self.bh = np.zeros(hidden_dim)

        # Output layer
        self.Wo = np.random.randn(num_classes, hidden_dim) * 0.1
        self.bo = np.zeros(num_classes)

    def embed(self, word_indices):
        """Look up embeddings for word indices."""
        return [self.embeddings[idx] for idx in word_indices]

    def rnn_forward(self, embedded_words):
        """Run RNN over embedded sequence."""
        h = np.zeros(self.hidden_dim)
        for x in embedded_words:
            h = np.tanh(self.Wx @ x + self.Wh @ h + self.bh)
        return h

    def classify(self, word_indices):
        """Full forward pass: embed → RNN → classify."""
        embedded = self.embed(word_indices)
        h_final = self.rnn_forward(embedded)
        logits = self.Wo @ h_final + self.bo
        probs = softmax(logits)
        return probs

# Build vocabulary
vocab = {"<PAD>": 0, "i": 1, "love": 2, "hate": 3, "this": 4,
         "movie": 5, "film": 6, "great": 7, "terrible": 8,
         "amazing": 9, "awful": 10, "the": 11, "is": 12}

# Create classifier
model = TextRNNClassifier(
    vocab_size=len(vocab),
    embed_dim=8,
    hidden_dim=16,
    num_classes=2,  # positive / negative
)

# Test sentences
sentences = [
    ("i love this amazing movie", [1, 2, 4, 9, 5]),
    ("this film is terrible", [4, 6, 12, 8]),
    ("i hate this awful film", [1, 3, 4, 10, 6]),
]

print("Text Classification (random weights - not trained):")
print(f"{'Sentence':<30} {'P(pos)':<8} {'P(neg)':<8} {'Prediction'}")
print("-" * 55)
for text, indices in sentences:
    probs = model.classify(indices)
    pred = "Positive" if probs[0] > probs[1] else "Negative"
    print(f"{text:<30} {probs[0]:<8.3f} {probs[1]:<8.3f} {pred}")

print("\n(Note: With random weights, predictions are meaningless)")
print("(Training with backpropagation would make predictions accurate)")
```

---

## The Vanishing Gradient Problem

RNNs struggle with long sequences because gradients shrink exponentially during backpropagation through time:

$$\frac{\partial h_t}{\partial h_1} = \prod_{k=2}^{t} \frac{\partial h_k}{\partial h_{k-1}}$$

If each factor is less than 1, the product vanishes exponentially:

$$|\frac{\partial h_t}{\partial h_1}| \leq \lambda^{t-1} \quad \text{where } \lambda < 1$$

```python
def demonstrate_vanishing_gradient():
    """Show how gradients vanish over long sequences."""
    print("Vanishing Gradient Demonstration")
    print("=" * 50)

    # Simulate gradient flow through time steps
    gradient_factors = [0.7, 0.8, 0.9, 0.95, 0.99]

    print(f"\n{'Factor':<10} {'Steps=5':<12} {'Steps=20':<12} "
          f"{'Steps=50':<12} {'Steps=100'}")
    print("-" * 60)

    for factor in gradient_factors:
        grads = []
        for steps in [5, 20, 50, 100]:
            gradient = factor ** steps
            grads.append(gradient)
        print(f"{factor:<10} {grads[0]:<12.6f} {grads[1]:<12.6f} "
              f"{grads[2]:<12.8f} {grads[3]:.2e}")

    print("\n→ Even with factor=0.95, gradient after 100 steps ≈ 0.006")
    print("→ The RNN 'forgets' information from early in the sequence")

demonstrate_vanishing_gradient()
```

**Output:**

```
Vanishing Gradient Demonstration
==================================================

Factor     Steps=5      Steps=20     Steps=50     Steps=100
------------------------------------------------------------
0.7        0.168070     0.000798     0.00000002   1.80e-16
0.8        0.327680     0.011529     0.00000143   2.04e-10
0.9        0.590490     0.121577     0.00515378   5.15e-05
0.95       0.773781     0.358486     0.07694498   5.92e-03
0.99       0.950990     0.817907     0.60500607   3.66e-01

→ Even with factor=0.95, gradient after 100 steps ≈ 0.006
→ The RNN "forgets" information from early in the sequence
```

### Solutions to Vanishing Gradients

| Solution | How It Helps |
|---|---|
| **LSTM** | Gate mechanisms control information flow |
| **GRU** | Simplified gating (update + reset gates) |
| **Gradient clipping** | Prevents exploding gradients |
| **Residual connections** | Skip connections for gradient flow |
| **Transformer** | Direct connections via attention (no recurrence) |

---

## Applications of RNNs in NLP

### 1. Text Classification

Classify entire documents (sentiment, topic, spam):

```
Input: "This movie was absolutely wonderful!" → RNN → Positive (0.95)
```

### 2. Language Modeling

Predict the next word in a sequence:

```
Input: "The cat sat on the" → RNN → "mat" (0.25), "floor" (0.18), ...
```

### 3. Sequence Labeling (NER, POS Tagging)

Assign a label to each word:

```
Input:  ["John", "lives", "in", "New", "York"]
Output: [PER,    O,       O,    LOC,   LOC]
```

### 4. Machine Translation

Encode source → Decode target:

```
Input:  "Je suis étudiant" → Encoder RNN → Context → Decoder RNN → "I am a student"
```

---

## PyTorch RNN for Text Classification

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

class TextClassificationRNN(nn.Module):
    """RNN-based text classifier in PyTorch."""

    def __init__(self, vocab_size, embed_dim, hidden_dim,
                 output_dim, num_layers=1, dropout=0.3):
        super().__init__()

        self.embedding = nn.Embedding(vocab_size, embed_dim,
                                       padding_idx=0)
        self.rnn = nn.RNN(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, text, text_lengths):
        """
        text: (batch_size, seq_len) tensor of word indices
        text_lengths: (batch_size,) tensor of actual lengths
        """
        # Embed: (batch, seq_len) → (batch, seq_len, embed_dim)
        embedded = self.dropout(self.embedding(text))

        # Pack padded sequence for efficient RNN processing
        packed = nn.utils.rnn.pack_padded_sequence(
            embedded, text_lengths.cpu(),
            batch_first=True, enforce_sorted=False
        )

        # RNN: process sequence
        packed_output, hidden = self.rnn(packed)

        # Use final hidden state for classification
        # hidden: (num_layers, batch, hidden_dim)
        hidden = self.dropout(hidden[-1])

        # Classify
        output = self.fc(hidden)
        return output


class SentimentDataset(Dataset):
    """Simple sentiment dataset."""

    def __init__(self, texts, labels, vocab, max_len=50):
        self.labels = labels
        self.max_len = max_len
        self.vocab = vocab

        # Tokenize and convert to indices
        self.encoded = []
        self.lengths = []
        for text in texts:
            words = text.lower().split()[:max_len]
            indices = [vocab.get(w, vocab.get("<UNK>", 1))
                       for w in words]
            self.lengths.append(len(indices))
            # Pad to max_len
            indices += [0] * (max_len - len(indices))
            self.encoded.append(indices)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.encoded[idx], dtype=torch.long),
            torch.tensor(self.lengths[idx], dtype=torch.long),
            torch.tensor(self.labels[idx], dtype=torch.long),
        )


def train_sentiment_model():
    """Train a simple RNN sentiment classifier."""

    # Training data
    positive_texts = [
        "i love this movie it is amazing",
        "great film wonderful acting",
        "this is the best movie ever made",
        "absolutely fantastic performance",
        "i really enjoyed this film a lot",
        "brilliant story and great characters",
        "an outstanding piece of cinema",
        "loved every minute of it",
    ]
    negative_texts = [
        "this movie is terrible and boring",
        "worst film i have ever seen",
        "horrible acting awful plot",
        "complete waste of time and money",
        "i hated this movie so much",
        "terrible script and bad direction",
        "an absolutely dreadful experience",
        "could not finish this awful movie",
    ]

    texts = positive_texts + negative_texts
    labels = [1] * len(positive_texts) + [0] * len(negative_texts)

    # Build vocabulary
    all_words = set()
    for text in texts:
        all_words.update(text.lower().split())

    vocab = {"<PAD>": 0, "<UNK>": 1}
    for word in sorted(all_words):
        vocab[word] = len(vocab)

    # Create dataset and dataloader
    dataset = SentimentDataset(texts, labels, vocab, max_len=15)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)

    # Initialize model
    model = TextClassificationRNN(
        vocab_size=len(vocab),
        embed_dim=32,
        hidden_dim=64,
        output_dim=2,
        num_layers=1,
        dropout=0.2,
    )

    # Training setup
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    # Training loop
    print("Training RNN Sentiment Classifier")
    print("=" * 40)

    for epoch in range(20):
        total_loss = 0
        correct = 0
        total = 0

        model.train()
        for batch_text, batch_lengths, batch_labels in dataloader:
            optimizer.zero_grad()
            predictions = model(batch_text, batch_lengths)
            loss = criterion(predictions, batch_labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            predicted = predictions.argmax(dim=1)
            correct += (predicted == batch_labels).sum().item()
            total += batch_labels.size(0)

        if (epoch + 1) % 5 == 0:
            accuracy = correct / total
            print(f"  Epoch {epoch + 1:2d}: "
                  f"Loss = {total_loss:.4f}, "
                  f"Accuracy = {accuracy:.2%}")

    # Test on new sentences
    print("\n--- Predictions ---")
    test_sentences = [
        "this movie is great and fun",
        "terrible boring waste of time",
        "i loved the acting in this film",
        "horrible and disappointing movie",
    ]

    model.eval()
    with torch.no_grad():
        for sent in test_sentences:
            words = sent.lower().split()[:15]
            indices = [vocab.get(w, 1) for w in words]
            length = len(indices)
            indices += [0] * (15 - len(indices))

            text_tensor = torch.tensor([indices], dtype=torch.long)
            length_tensor = torch.tensor([length], dtype=torch.long)

            output = model(text_tensor, length_tensor)
            probs = torch.softmax(output, dim=1)
            pred = "Positive" if output.argmax().item() == 1 else "Negative"

            print(f"  '{sent}'")
            print(f"    → {pred} (confidence: {probs.max().item():.2%})")

# Run training
train_sentiment_model()
```

---

## Limitations of RNNs

| Limitation | Description | Alternative |
|---|---|---|
| Short memory | Vanishing gradients limit context | LSTM/GRU |
| Slow training | Sequential processing, can't parallelize | Transformer |
| Fixed representation | Single hidden state bottleneck | Attention mechanism |
| Difficulty with long texts | Performance degrades with length | Transformer + positional encoding |

### RNN vs. LSTM vs. Transformer

```python
# Comparison of architectures
comparison = {
    "Architecture": ["Simple RNN", "LSTM", "GRU", "Transformer"],
    "Memory Length": ["~10 words", "~100 words", "~100 words", "Full context"],
    "Training Speed": ["Slow", "Slow", "Medium", "Fast (parallel)"],
    "Parameters": ["Fewest", "4x RNN", "3x RNN", "Most"],
    "Year": ["1986", "1997", "2014", "2017"],
    "Best For": [
        "Short sequences",
        "Medium sequences",
        "Medium sequences",
        "Any length",
    ],
}

print(f"{'Metric':<15}", end="")
for arch in comparison["Architecture"]:
    print(f"{arch:<18}", end="")
print()
print("-" * 85)

for key in list(comparison.keys())[1:]:
    print(f"{key:<15}", end="")
    for val in comparison[key]:
        print(f"{val:<18}", end="")
    print()
```

---

## Code: Simple RNN Text Classifier with PyTorch

Here is a complete, runnable example:

```python
import torch
import torch.nn as nn
import numpy as np

class MinimalRNN(nn.Module):
    """Minimal RNN for understanding the concept."""

    def __init__(self, vocab_size, embed_dim=16, hidden_dim=32,
                 num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.RNN(embed_dim, hidden_dim, batch_first=True)
        self.classifier = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        # x: (batch, seq_len)
        embedded = self.embedding(x)          # (batch, seq, embed)
        output, hidden = self.rnn(embedded)   # hidden: (1, batch, hidden)
        hidden = hidden.squeeze(0)            # (batch, hidden)
        logits = self.classifier(hidden)      # (batch, classes)
        return logits

# Quick demo
vocab_size = 100
model = MinimalRNN(vocab_size, embed_dim=16, hidden_dim=32, num_classes=2)

# Fake input: batch of 2 sentences, each 5 words
fake_input = torch.randint(0, vocab_size, (2, 5))
output = model(fake_input)

print("Model Architecture:")
print(model)
print(f"\nInput shape:  {fake_input.shape}")
print(f"Output shape: {output.shape}")
print(f"Output (logits): {output.detach().numpy()}")
print(f"Predictions: {output.argmax(dim=1).tolist()}")
```

**Output:**

```
Model Architecture:
MinimalRNN(
  (embedding): Embedding(100, 16)
  (rnn): RNN(16, 32, batch_first=True)
  (classifier): Linear(in_features=32, out_features=2, bias=True)
)

Input shape:  torch.Size([2, 5])
Output shape: torch.Size([2, 2])
Output (logits): [[-0.023  0.105] [ 0.041 -0.087]]
Predictions: [1, 0]
```

---

## Summary

| Concept | Description |
|---|---|
| RNN | Neural network with hidden state memory |
| Hidden State | $h_t = \tanh(W_h h_{t-1} + W_x x_t + b)$ |
| Vanishing Gradient | Gradients shrink exponentially over time |
| LSTM/GRU | Gated variants that solve vanishing gradients |
| Text Classification | Embed → RNN → Final hidden → Dense → Class |
| Transformer | Modern replacement using self-attention |

**Key Takeaway:** RNNs introduced the idea of neural sequence processing with memory. While largely replaced by Transformers for most tasks, understanding RNNs is essential — they illustrate fundamental concepts like hidden states, sequential processing, and the challenges that motivated attention mechanisms and Transformers.

---
