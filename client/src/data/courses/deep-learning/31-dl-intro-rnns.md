---
title: Introduction to RNNs
---

# Introduction to Recurrent Neural Networks (RNNs)

Regular neural networks treat each input independently. But what if the **order** of your data matters? That's where Recurrent Neural Networks come in.

---

## Why Sequences Need Special Architectures

Think about reading a sentence. You understand each word based on the words that came before it. A standard feedforward network can't do this — it has no memory of previous inputs.

**Sequences are special because:**

| Challenge | Example |
|-----------|---------|
| Variable length | Sentences have different word counts |
| Order matters | "dog bites man" ≠ "man bites dog" |
| Context depends on history | "bank" means different things in different contexts |
| Patterns repeat at different positions | A name can appear anywhere in a sentence |

**Examples of sequential data:**

- Text (words in a sentence)
- Time series (stock prices over days)
- Audio (sound samples over time)
- Video (frames over time)
- DNA sequences (nucleotides in order)

---

## The RNN Idea: Hidden State as Memory

An RNN processes sequences **one element at a time**, maintaining a **hidden state** that acts as memory.

```
Input:    x₁ → x₂ → x₃ → x₄
           ↓      ↓      ↓      ↓
Hidden:   h₁ → h₂ → h₃ → h₄
           ↓      ↓      ↓      ↓
Output:   y₁    y₂    y₃    y₄
```

At each time step $t$, the RNN:

1. Takes the current input $x_t$
2. Combines it with the previous hidden state $h_{t-1}$
3. Produces a new hidden state $h_t$
4. Optionally produces an output $y_t$

---

## RNN Equations

The core RNN equations are surprisingly simple:

**Hidden state update:**

$$h_t = \tanh(W_{hh}h_{t-1} + W_{xh}x_t + b_h)$$

**Output:**

$$y_t = W_{hy}h_t + b_y$$

Where:
- $h_t$ — hidden state at time $t$
- $x_t$ — input at time $t$
- $W_{hh}$ — hidden-to-hidden weight matrix
- $W_{xh}$ — input-to-hidden weight matrix
- $W_{hy}$ — hidden-to-output weight matrix
- $b_h, b_y$ — bias terms
- $\tanh$ — activation function (squashes values to $[-1, 1]$)

> **Key insight:** The same weights ($W_{hh}$, $W_{xh}$, $W_{hy}$) are shared across all time steps. This is called **weight sharing** and allows the RNN to handle sequences of any length.

---

## Unrolling Through Time

When we "unroll" an RNN, we draw it as a chain of repeated copies:

```
     W_xh      W_xh      W_xh      W_xh
x₁ ──→ [h₁] ──→ [h₂] ──→ [h₃] ──→ [h₄]
         ↑  W_hh  ↑  W_hh  ↑  W_hh
         h₀       h₁       h₂       h₃
```

Each copy shares the same parameters. This unrolled view helps us understand:

- How gradients flow backward through time
- Why long sequences can cause problems (vanishing gradients)
- How the network builds up its "memory" step by step

---

## Types of RNN Architectures

RNNs are flexible. Depending on your task, you choose a different input-output pattern:

### One-to-Many

One input, sequence output.

```
Input:  x₁
         ↓
Hidden: h₁ → h₂ → h₃ → h₄
         ↓     ↓     ↓     ↓
Output: y₁   y₂   y₃   y₄
```

**Use case:** Image captioning (one image → sequence of words)

### Many-to-One

Sequence input, one output.

```
Input:  x₁   x₂   x₃   x₄
         ↓     ↓     ↓     ↓
Hidden: h₁ → h₂ → h₃ → h₄
                           ↓
Output:                   y
```

**Use case:** Sentiment analysis (sequence of words → positive/negative)

### Many-to-Many (Same Length)

Sequence input, sequence output of same length.

```
Input:  x₁   x₂   x₃   x₄
         ↓     ↓     ↓     ↓
Hidden: h₁ → h₂ → h₃ → h₄
         ↓     ↓     ↓     ↓
Output: y₁   y₂   y₃   y₄
```

**Use case:** POS tagging (each word → a tag)

### Many-to-Many (Different Length)

Sequence input, sequence output of different length (encoder-decoder).

**Use case:** Machine translation (English sentence → French sentence)

---

## Applications of RNNs

| Domain | Task | Type |
|--------|------|------|
| NLP | Sentiment analysis | Many-to-one |
| NLP | Machine translation | Many-to-many |
| Speech | Speech recognition | Many-to-many |
| Music | Music generation | One-to-many |
| Finance | Stock prediction | Many-to-one |
| Video | Action recognition | Many-to-one |

---

## The Vanishing Gradient Problem

When training RNNs on long sequences, gradients must flow back through many time steps. At each step, gradients are multiplied by $W_{hh}$.

- If $\|W_{hh}\| < 1$: gradients **shrink** exponentially → **vanishing gradients**
- If $\|W_{hh}\| > 1$: gradients **explode** exponentially → **exploding gradients**

**Vanishing gradients** mean the network can't learn long-term dependencies. For example, in the sentence:

> "I grew up in France ... I speak fluent ___"

The RNN needs to remember "France" from many steps back to predict "French." With vanishing gradients, this connection is lost.

### Why It Happens Mathematically

The gradient of the loss at time $T$ with respect to hidden state at time $t$ involves:

$$\frac{\partial h_T}{\partial h_t} = \prod_{k=t+1}^{T} \frac{\partial h_k}{\partial h_{k-1}} = \prod_{k=t+1}^{T} W_{hh}^T \cdot \text{diag}(\tanh'(z_k))$$

Since $|\tanh'(x)| \leq 1$, this product shrinks exponentially as $T - t$ grows. After just 10–20 steps, the gradient effectively becomes zero.

**Solutions:**
- Gradient clipping (for exploding gradients)
- LSTM and GRU architectures (for vanishing gradients — next lesson!)
- Shorter sequences / truncated backpropagation
- Skip connections / residual connections

---

## RNN in PyTorch

PyTorch provides `nn.RNN` for building recurrent networks:

```python
import torch
import torch.nn as nn

# Create an RNN layer
# input_size: dimension of each input element
# hidden_size: dimension of the hidden state
# num_layers: number of stacked RNN layers
rnn = nn.RNN(input_size=10, hidden_size=20, num_layers=1, batch_first=True)

# Input shape: (batch_size, sequence_length, input_size)
x = torch.randn(3, 5, 10)  # batch=3, seq_len=5, features=10

# Initial hidden state: (num_layers, batch_size, hidden_size)
h0 = torch.zeros(1, 3, 20)

# Forward pass
output, h_n = rnn(x, h0)

print(f"Output shape: {output.shape}")   # (3, 5, 20) — all hidden states
print(f"Final hidden: {h_n.shape}")      # (1, 3, 20) — last hidden state
```

**Key parameters:**

| Parameter | Description |
|-----------|-------------|
| `input_size` | Number of features in each input element |
| `hidden_size` | Number of features in the hidden state |
| `num_layers` | Number of stacked RNN layers |
| `batch_first` | If True, input shape is (batch, seq, features) |
| `nonlinearity` | `'tanh'` or `'relu'` |
| `bidirectional` | If True, processes sequence in both directions |

---

## Code Example: RNN for Sequence Classification

Let's build a complete RNN model that classifies sequences. We'll generate synthetic data where the class depends on the sequence pattern.

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ============================================================
# Step 1: Generate Synthetic Data
# ============================================================
# Class 0: sequences with increasing trend
# Class 1: sequences with decreasing trend

def generate_data(num_samples=1000, seq_len=20):
    """Generate synthetic sequential data for classification."""
    X = []
    y = []

    for _ in range(num_samples // 2):
        # Class 0: increasing trend + noise
        seq = torch.linspace(0, 1, seq_len) + torch.randn(seq_len) * 0.1
        X.append(seq.unsqueeze(1))  # Add feature dimension
        y.append(0)

        # Class 1: decreasing trend + noise
        seq = torch.linspace(1, 0, seq_len) + torch.randn(seq_len) * 0.1
        X.append(seq.unsqueeze(1))
        y.append(1)

    X = torch.stack(X)  # (num_samples, seq_len, 1)
    y = torch.tensor(y, dtype=torch.long)
    return X, y

X_train, y_train = generate_data(800)
X_test, y_test = generate_data(200)

print(f"Training data: {X_train.shape}")  # (800, 20, 1)
print(f"Training labels: {y_train.shape}")  # (800,)

# ============================================================
# Step 2: Define the RNN Model
# ============================================================

class SimpleRNN(nn.Module):
    """RNN for binary sequence classification."""

    def __init__(self, input_size, hidden_size, num_classes):
        super().__init__()
        self.hidden_size = hidden_size

        # RNN layer
        self.rnn = nn.RNN(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=1,
            batch_first=True
        )

        # Classification head
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # x shape: (batch, seq_len, input_size)

        # Initialize hidden state with zeros
        h0 = torch.zeros(1, x.size(0), self.hidden_size, device=x.device)

        # Forward through RNN
        # output: all hidden states (batch, seq_len, hidden_size)
        # h_n: final hidden state (1, batch, hidden_size)
        output, h_n = self.rnn(x, h0)

        # Use the final hidden state for classification
        # h_n shape: (1, batch, hidden_size) → (batch, hidden_size)
        final_hidden = h_n.squeeze(0)

        # Classify
        logits = self.fc(final_hidden)
        return logits

# ============================================================
# Step 3: Train the Model
# ============================================================

# Hyperparameters
input_size = 1
hidden_size = 32
num_classes = 2
learning_rate = 0.001
num_epochs = 20
batch_size = 32

# Create model, loss, optimizer
model = SimpleRNN(input_size, hidden_size, num_classes)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate)

# Data loaders
train_dataset = TensorDataset(X_train, y_train)
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

# Training loop
for epoch in range(num_epochs):
    model.train()
    total_loss = 0

    for batch_X, batch_y in train_loader:
        # Forward pass
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    if (epoch + 1) % 5 == 0:
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}")

# ============================================================
# Step 4: Evaluate
# ============================================================

model.eval()
with torch.no_grad():
    outputs = model(X_test)
    _, predicted = torch.max(outputs, 1)
    accuracy = (predicted == y_test).float().mean()
    print(f"\nTest Accuracy: {accuracy:.4f}")
```

---

## Try It Yourself

1. Change `hidden_size` to 64 — does accuracy improve?
2. Add `num_layers=2` to the RNN — what happens?
3. Replace `nn.RNN` with `nn.GRU` — compare performance
4. Increase `seq_len` to 50 — does the RNN still learn well?

---

## Summary

| Concept | Key Point |
|---------|-----------|
| RNN | Neural network with memory via hidden state |
| Hidden state | $h_t = \tanh(W_{hh}h_{t-1} + W_{xh}x_t + b_h)$ |
| Weight sharing | Same weights used at every time step |
| Types | One-to-many, many-to-one, many-to-many |
| Limitation | Vanishing gradients on long sequences |
| PyTorch | `nn.RNN(input_size, hidden_size, num_layers)` |

---

## What's Next?

In the next lesson, you'll learn about **LSTM Networks** — the architecture that solves the vanishing gradient problem and enables learning from long sequences.
