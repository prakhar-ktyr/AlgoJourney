---
title: LSTM Networks
---

# LSTM Networks

Long Short-Term Memory (LSTM) networks solve the biggest weakness of vanilla RNNs — the inability to learn **long-term dependencies**. They're the workhorse of sequence modeling.

---

## The Problem: Why Vanilla RNNs Fail

Remember the vanishing gradient problem? In a vanilla RNN, information from early time steps gets "washed out" as it passes through many layers of $\tanh$ and matrix multiplications.

**Example:**

> "I was born in **Japan**. I went to school there. I studied hard. ... I speak fluent ___"

A vanilla RNN would struggle to connect "Japan" to "Japanese" across many time steps. The gradient signal becomes too weak.

**We need a network that can:**
- Remember information for long periods
- Selectively forget irrelevant information
- Decide what new information to store
- Control what information to output

---

## LSTM Architecture: The Big Picture

An LSTM replaces the simple hidden state with a more complex structure that includes a **cell state** — think of it as a conveyor belt that carries information across time steps.

```
                    Cell State (C)
    ═══════════════════════════════════════►
         ↑ forget    ↑ add new      ↓ output
         │           │              │
    ┌────┴───┐  ┌────┴───┐    ┌────┴───┐
    │ Forget │  │ Input  │    │ Output │
    │  Gate  │  │  Gate  │    │  Gate  │
    └────────┘  └────────┘    └────────┘
         ↑           ↑              ↑
    ─────┴───────────┴──────────────┴─────
              [h_{t-1}, x_t]
```

The LSTM has **three gates** that control information flow:
1. **Forget gate** — what to throw away from cell state
2. **Input gate** — what new information to store
3. **Output gate** — what to output from cell state

---

## The Cell State: Information Highway

The cell state $C_t$ runs along the top of the diagram. It's the "memory" of the LSTM.

Information can flow along it unchanged (if gates allow). This is why LSTMs can maintain information over long sequences — the gradient flows through the cell state with minimal degradation.

Think of it like a **highway**: cars (information) travel along it freely, with on-ramps and off-ramps (gates) controlling what enters and exits.

---

## Gate 1: The Forget Gate

The forget gate decides **what information to discard** from the cell state.

$$f_t = \sigma(W_f[h_{t-1}, x_t] + b_f)$$

Where:
- $\sigma$ is the sigmoid function (outputs values between 0 and 1)
- $[h_{t-1}, x_t]$ is the concatenation of previous hidden state and current input
- $f_t$ has values between 0 (completely forget) and 1 (completely keep)

**Example:** When processing text and encountering a new subject, the forget gate might discard the old subject's gender information.

```python
# Conceptual pseudocode
combined = torch.cat([h_prev, x_t], dim=1)
f_t = torch.sigmoid(self.W_f(combined))  # Values in [0, 1]
# f_t ≈ 0 → forget this part of cell state
# f_t ≈ 1 → keep this part of cell state
```

---

## Gate 2: The Input Gate

The input gate decides **what new information to store** in the cell state. This is a two-part process:

**Part A — What to update:**

$$i_t = \sigma(W_i[h_{t-1}, x_t] + b_i)$$

**Part B — Candidate values to add:**

$$\tilde{C}_t = \tanh(W_C[h_{t-1}, x_t] + b_C)$$

The input gate $i_t$ (values 0–1) controls how much of the candidate $\tilde{C}_t$ (values −1 to +1) gets added.

```python
# Conceptual pseudocode
i_t = torch.sigmoid(self.W_i(combined))      # What to update
C_candidate = torch.tanh(self.W_C(combined))  # New candidate values
```

---

## Updating the Cell State

Now we combine the forget gate and input gate to update the cell state:

$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$

Where $\odot$ means element-wise multiplication.

**In plain English:**
1. Take the old cell state $C_{t-1}$
2. Multiply by $f_t$ (forget some things)
3. Add $i_t \odot \tilde{C}_t$ (add new things)

```python
# Conceptual pseudocode
C_t = f_t * C_prev + i_t * C_candidate
```

This is the key equation! The cell state gets a **linear update** — no activation function squashing it. This allows gradients to flow backward through time without vanishing.

---

## Gate 3: The Output Gate

The output gate decides **what parts of the cell state to output** as the hidden state:

$$o_t = \sigma(W_o[h_{t-1}, x_t] + b_o)$$

$$h_t = o_t \odot \tanh(C_t)$$

The cell state is passed through $\tanh$ (to get values between −1 and +1) and then filtered by the output gate.

```python
# Conceptual pseudocode
o_t = torch.sigmoid(self.W_o(combined))
h_t = o_t * torch.tanh(C_t)
```

The hidden state $h_t$ is what gets passed to the next time step AND used for predictions.

---

## Why Gates Solve Vanishing Gradients

In a vanilla RNN, the gradient at time $t$ must pass through $t$ matrix multiplications. Each multiplication can shrink the gradient.

In an LSTM, the cell state update is:

$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$

The gradient of $C_t$ with respect to $C_{t-1}$ is simply $f_t$ — a diagonal matrix with values between 0 and 1. This means:

- If $f_t \approx 1$: gradient flows through **unchanged**
- The network **learns** what to remember (sets $f_t$ close to 1 for important info)
- No repeated matrix multiplications that cause vanishing

> **The forget gate bias trick:** Initialize forget gate biases to positive values (e.g., 1.0) so the network starts by remembering everything and learns what to forget.

---

## Complete LSTM Equations Summary

At each time step $t$:

$$f_t = \sigma(W_f[h_{t-1}, x_t] + b_f) \quad \text{(forget gate)}$$

$$i_t = \sigma(W_i[h_{t-1}, x_t] + b_i) \quad \text{(input gate)}$$

$$\tilde{C}_t = \tanh(W_C[h_{t-1}, x_t] + b_C) \quad \text{(candidate)}$$

$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t \quad \text{(cell update)}$$

$$o_t = \sigma(W_o[h_{t-1}, x_t] + b_o) \quad \text{(output gate)}$$

$$h_t = o_t \odot \tanh(C_t) \quad \text{(hidden state)}$$

---

## Bidirectional LSTM

A standard LSTM only sees past context. A **Bidirectional LSTM** processes the sequence in both directions:

```
Forward:   x₁ → x₂ → x₃ → x₄  (left to right)
Backward:  x₁ ← x₂ ← x₃ ← x₄  (right to left)
```

The outputs from both directions are concatenated:

$$h_t = [\overrightarrow{h_t}; \overleftarrow{h_t}]$$

**When to use:**
- You have the **complete sequence** available (not streaming)
- Tasks like text classification, named entity recognition
- NOT suitable for real-time prediction or language generation

```python
# Bidirectional LSTM in PyTorch
lstm = nn.LSTM(input_size=10, hidden_size=20, bidirectional=True, batch_first=True)
# Output hidden size will be 20 * 2 = 40
```

---

## Stacked LSTM (Multiple Layers)

Stacking multiple LSTM layers allows the network to learn hierarchical representations:

```
Layer 2:  h₁² → h₂² → h₃² → h₄²  (higher-level features)
           ↑      ↑      ↑      ↑
Layer 1:  h₁¹ → h₂¹ → h₃¹ → h₄¹  (lower-level features)
           ↑      ↑      ↑      ↑
Input:    x₁    x₂    x₃    x₄
```

The hidden state output of layer $l$ becomes the input to layer $l+1$.

```python
# 3-layer stacked LSTM
lstm = nn.LSTM(input_size=10, hidden_size=20, num_layers=3, batch_first=True)
# Add dropout between layers to prevent overfitting
lstm = nn.LSTM(input_size=10, hidden_size=20, num_layers=3,
               batch_first=True, dropout=0.2)
```

**Rule of thumb:** 2–3 layers is usually sufficient. More layers need more data and training time.

---

## LSTM in PyTorch

```python
import torch
import torch.nn as nn

# Create LSTM layer
lstm = nn.LSTM(
    input_size=10,    # Features per time step
    hidden_size=20,   # Hidden state dimension
    num_layers=2,     # Stacked layers
    batch_first=True, # Input: (batch, seq, features)
    dropout=0.1,      # Dropout between layers
    bidirectional=False
)

# Input
x = torch.randn(3, 5, 10)  # (batch=3, seq_len=5, features=10)

# Initial states (optional — defaults to zeros)
h0 = torch.zeros(2, 3, 20)  # (num_layers, batch, hidden_size)
c0 = torch.zeros(2, 3, 20)  # (num_layers, batch, hidden_size)

# Forward pass
output, (h_n, c_n) = lstm(x, (h0, c0))

print(f"Output: {output.shape}")  # (3, 5, 20) — hidden states at all time steps
print(f"h_n: {h_n.shape}")       # (2, 3, 20) — final hidden state per layer
print(f"c_n: {c_n.shape}")       # (2, 3, 20) — final cell state per layer
```

**Difference from nn.RNN:** LSTM returns **two** hidden states — $h_n$ (hidden state) and $c_n$ (cell state).

---

## Code Example: LSTM for Sentiment Classification

Let's build an LSTM that classifies movie reviews as positive or negative.

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from torch.nn.utils.rnn import pad_sequence

# ============================================================
# Step 1: Simulate Text Data
# ============================================================
# In practice, you'd use a real dataset like IMDB
# Here we simulate tokenized sequences

vocab_size = 5000    # Vocabulary size
embed_dim = 64       # Embedding dimension
hidden_size = 128    # LSTM hidden size
num_classes = 2      # Positive / Negative
max_len = 50         # Maximum sequence length

# Simulate tokenized reviews (random integers representing word indices)
torch.manual_seed(42)
num_train = 1000
num_test = 200

# Random sequences of different lengths (padded to max_len)
X_train = torch.randint(1, vocab_size, (num_train, max_len))
X_test = torch.randint(1, vocab_size, (num_test, max_len))

# Simulated labels (in practice, these come from your dataset)
y_train = torch.randint(0, 2, (num_train,))
y_test = torch.randint(0, 2, (num_test,))

# ============================================================
# Step 2: Define the LSTM Model
# ============================================================

class SentimentLSTM(nn.Module):
    """LSTM model for sentiment classification."""

    def __init__(self, vocab_size, embed_dim, hidden_size, num_classes,
                 num_layers=2, dropout=0.3):
        super().__init__()

        # Embedding layer: converts word indices to dense vectors
        self.embedding = nn.Embedding(
            num_embeddings=vocab_size,
            embedding_dim=embed_dim,
            padding_idx=0  # Index 0 is padding
        )

        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
            bidirectional=True  # Use both directions
        )

        # Dropout for regularization
        self.dropout = nn.Dropout(dropout)

        # Classification head
        # bidirectional → hidden_size * 2
        self.fc = nn.Linear(hidden_size * 2, num_classes)

    def forward(self, x):
        # x shape: (batch, seq_len) — token indices

        # Embed tokens
        embedded = self.embedding(x)  # (batch, seq_len, embed_dim)
        embedded = self.dropout(embedded)

        # LSTM forward pass
        lstm_out, (h_n, c_n) = self.lstm(embedded)
        # lstm_out: (batch, seq_len, hidden_size * 2)
        # h_n: (num_layers * 2, batch, hidden_size) for bidirectional

        # Concatenate final forward and backward hidden states
        # Forward: h_n[-2] (second to last = final forward layer)
        # Backward: h_n[-1] (last = final backward layer)
        forward_hidden = h_n[-2]   # (batch, hidden_size)
        backward_hidden = h_n[-1]  # (batch, hidden_size)
        combined = torch.cat([forward_hidden, backward_hidden], dim=1)

        # Classify
        combined = self.dropout(combined)
        logits = self.fc(combined)  # (batch, num_classes)
        return logits

# ============================================================
# Step 3: Train the Model
# ============================================================

model = SentimentLSTM(vocab_size, embed_dim, hidden_size, num_classes)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Data loaders
train_loader = DataLoader(
    TensorDataset(X_train, y_train),
    batch_size=32, shuffle=True
)

# Training loop
num_epochs = 10

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for batch_X, batch_y in train_loader:
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)

        optimizer.zero_grad()
        loss.backward()

        # Gradient clipping to prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()

        total_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == batch_y).sum().item()
        total += batch_y.size(0)

    if (epoch + 1) % 2 == 0:
        acc = correct / total
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch [{epoch+1}/{num_epochs}] Loss: {avg_loss:.4f} Acc: {acc:.4f}")

# ============================================================
# Step 4: Evaluate
# ============================================================

model.eval()
with torch.no_grad():
    outputs = model(X_test)
    _, predicted = torch.max(outputs, 1)
    accuracy = (predicted == y_test).float().mean()
    print(f"\nTest Accuracy: {accuracy:.4f}")

# Print model parameters
total_params = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total_params:,}")
```

---

## LSTM Parameter Count

For a single LSTM layer with input size $n$ and hidden size $h$:

$$\text{Parameters} = 4 \times ((n + h) \times h + h)$$

The factor of 4 comes from the four sets of weights (forget, input, candidate, output gates).

**Example:** input_size=64, hidden_size=128:
$$4 \times ((64 + 128) \times 128 + 128) = 4 \times 24,704 = 98,816$$

---

## Tips for Using LSTMs

| Tip | Why |
|-----|-----|
| Initialize forget gate bias to 1.0 | Helps learn long-term dependencies early |
| Use gradient clipping (max_norm=1.0) | Prevents exploding gradients |
| Add dropout between layers | Prevents overfitting |
| Start with 1–2 layers | More layers need more data |
| Use bidirectional for classification | Gets context from both directions |
| Normalize input sequences | Helps training stability |

---

## Summary

| Component | Purpose |
|-----------|---------|
| Cell state $C_t$ | Long-term memory highway |
| Forget gate $f_t$ | Decides what to discard |
| Input gate $i_t$ | Decides what to store |
| Output gate $o_t$ | Decides what to output |
| Bidirectional | Sees past AND future context |
| Stacked layers | Learns hierarchical features |

---

## What's Next?

In the next lesson, you'll learn about **GRU Networks** — a simplified version of LSTM that's faster to train and often performs just as well.
