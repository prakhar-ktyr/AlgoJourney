---
title: LSTM & GRU
---

# LSTM & GRU

In this lesson, you will learn about **Long Short-Term Memory (LSTM)** and **Gated Recurrent Unit (GRU)** — two powerful recurrent architectures that solve the vanishing gradient problem and enable learning long-range dependencies in sequences.

---

## The Vanishing Gradient Problem

Standard (vanilla) RNNs struggle with long sequences. During backpropagation through time (BPTT), gradients are multiplied at each time step. If the gradient is less than 1, it **shrinks exponentially** — this is the **vanishing gradient problem**.

### Why It Matters

| Sequence Length | Gradient Factor (0.9^n) | Effect |
|---|---|---|
| 10 steps | 0.35 | Some learning |
| 50 steps | 0.005 | Almost no learning |
| 100 steps | 0.00003 | Effectively zero |

When gradients vanish, the network **cannot learn** relationships between distant tokens:

```
"The cat, which sat on the mat near the window overlooking the garden, ... was hungry."
```

A vanilla RNN struggles to connect "cat" with "was hungry" across many intervening words.

---

## LSTM: Long Short-Term Memory

LSTM was introduced by **Hochreiter & Schmidhuber (1997)** to solve the vanishing gradient problem. The key idea: add a **cell state** that acts as a highway for information to flow unchanged across many time steps.

### LSTM Architecture

An LSTM cell has **three gates** and a **cell state**:

```
        ┌─────────────────────────────────┐
        │           LSTM Cell             │
        │                                 │
x_t ──► │  [Forget] [Input] [Output]     │ ──► h_t
        │      │       │        │         │
h_{t-1}►│      ▼       ▼        ▼         │
        │   f_t·C    i_t·C̃    o_t·tanh(C)│
        │      └───►C_t◄───┘    │         │
        └─────────────────────────────────┘
```

### The Cell State

The cell state $C_t$ is the "memory highway." It runs through the entire chain with only minor linear interactions, making it easy for information to flow unchanged.

---

## LSTM Gates

### 1. Forget Gate

The forget gate decides **what information to throw away** from the cell state.

$$f_t = \sigma(W_f[h_{t-1}, x_t] + b_f)$$

- Output: values between 0 and 1
- **1** = "keep this completely"
- **0** = "forget this completely"

### 2. Input Gate

The input gate decides **what new information to store** in the cell state.

$$i_t = \sigma(W_i[h_{t-1}, x_t] + b_i)$$

A candidate cell state is also computed:

$$\tilde{C}_t = \tanh(W_C[h_{t-1}, x_t] + b_C)$$

### 3. Cell State Update

The old cell state is updated by:

$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$

- First term: keep selected parts of old memory
- Second term: add selected parts of new candidate

### 4. Output Gate

The output gate decides **what to output** based on the cell state.

$$o_t = \sigma(W_o[h_{t-1}, x_t] + b_o)$$

The hidden state (output) is:

$$h_t = o_t \odot \tanh(C_t)$$

---

## Why LSTM Solves Vanishing Gradients

The cell state update equation:

$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$

When $f_t = 1$ and $i_t = 0$, the cell state passes through **unchanged**. The gradient flows through without shrinking — this is the "constant error carousel."

---

## GRU: Gated Recurrent Unit

GRU was introduced by **Cho et al. (2014)** as a **simplified alternative** to LSTM. It combines the forget and input gates into a single **update gate** and merges the cell state with the hidden state.

### GRU Architecture

GRU has only **two gates**: an update gate and a reset gate.

### Update Gate

The update gate $z_t$ decides how much of the past information to keep:

$$z_t = \sigma(W_z[h_{t-1}, x_t] + b_z)$$

### Reset Gate

The reset gate $r_t$ decides how much of the past information to forget:

$$r_t = \sigma(W_r[h_{t-1}, x_t] + b_r)$$

### Hidden State Computation

First, compute the candidate hidden state:

$$\tilde{h}_t = \tanh(W_h[r_t \odot h_{t-1}, x_t] + b_h)$$

Then, the final hidden state is a linear interpolation:

$$h_t = (1 - z_t) \odot h_{t-1} + z_t \odot \tilde{h}_t$$

- When $z_t = 0$: keep old hidden state (memory preserved)
- When $z_t = 1$: use new candidate (memory updated)

---

## LSTM vs GRU vs Vanilla RNN

| Feature | Vanilla RNN | LSTM | GRU |
|---|---|---|---|
| Gates | 0 | 3 (forget, input, output) | 2 (update, reset) |
| Cell state | No | Yes (separate) | No (merged with hidden) |
| Parameters | Fewest | Most | Medium |
| Long-range deps | Poor | Excellent | Very good |
| Training speed | Fastest | Slowest | Medium |
| Vanishing gradient | Severe | Solved | Solved |
| Best for | Short sequences | Long sequences, complex | Medium sequences |

### When to Use Which?

- **LSTM**: default choice for most sequence tasks, especially long sequences
- **GRU**: when you need faster training with similar performance
- **Vanilla RNN**: only for very short sequences or as a learning exercise

---

## Bidirectional LSTM

A **Bidirectional LSTM (BiLSTM)** processes the sequence in **both directions**:

```
Forward:  x_1 → x_2 → x_3 → x_4 → x_5
Backward: x_1 ← x_2 ← x_3 ← x_4 ← x_5
```

The outputs from both directions are concatenated:

$$h_t = [\overrightarrow{h_t}; \overleftarrow{h_t}]$$

### Why Bidirectional?

Consider: "The bank by the **river** was steep."

- Forward pass: at "bank," we don't yet know it means riverbank
- Backward pass: "river" informs that "bank" means riverbank

BiLSTM captures **context from both sides**, making it especially useful for tasks like named entity recognition and sentiment analysis.

---

## Stacked (Deep) RNNs

You can stack multiple LSTM/GRU layers to create **deeper** networks:

```
Layer 3:  LSTM ──► LSTM ──► LSTM ──► output
             ▲        ▲        ▲
Layer 2:  LSTM ──► LSTM ──► LSTM
             ▲        ▲        ▲
Layer 1:  LSTM ──► LSTM ──► LSTM
             ▲        ▲        ▲
           x_1      x_2      x_3
```

- **Layer 1** learns low-level features (character patterns, word shapes)
- **Layer 2** learns mid-level features (phrases, local syntax)
- **Layer 3** learns high-level features (semantics, long-range structure)

Typically, 2–4 layers work best. More layers need more data and regularization (dropout between layers).

---

## Code: LSTM Sentiment Classifier with PyTorch

Let's build a complete **LSTM-based sentiment classifier**:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from collections import Counter


# --- Dataset ---
class TextDataset(Dataset):
    """Simple text dataset for sentiment analysis."""

    def __init__(self, texts, labels, vocab, max_len=50):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        tokens = self.texts[idx].lower().split()
        # Convert tokens to indices
        indices = [self.vocab.get(t, self.vocab["<UNK>"]) for t in tokens]
        # Pad or truncate
        if len(indices) < self.max_len:
            indices += [self.vocab["<PAD>"]] * (self.max_len - len(indices))
        else:
            indices = indices[:self.max_len]
        return torch.tensor(indices), torch.tensor(self.labels[idx])


# --- Build Vocabulary ---
def build_vocab(texts, min_freq=1):
    """Build vocabulary from texts."""
    counter = Counter()
    for text in texts:
        counter.update(text.lower().split())

    vocab = {"<PAD>": 0, "<UNK>": 1}
    for word, count in counter.items():
        if count >= min_freq:
            vocab[word] = len(vocab)
    return vocab


# --- LSTM Model ---
class LSTMClassifier(nn.Module):
    """Bidirectional LSTM for text classification."""

    def __init__(self, vocab_size, embed_dim, hidden_dim,
                 output_dim, num_layers=2, dropout=0.3,
                 bidirectional=True):
        super().__init__()

        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=bidirectional
        )
        self.dropout = nn.Dropout(dropout)

        # If bidirectional, hidden_dim is doubled
        lstm_output_dim = hidden_dim * 2 if bidirectional else hidden_dim
        self.fc = nn.Linear(lstm_output_dim, output_dim)

    def forward(self, x):
        # x shape: (batch_size, seq_len)
        embedded = self.embedding(x)  # (batch, seq_len, embed_dim)
        embedded = self.dropout(embedded)

        # LSTM output
        lstm_out, (hidden, cell) = self.lstm(embedded)
        # lstm_out: (batch, seq_len, hidden_dim * num_directions)

        # Use the last hidden state (concatenate forward and backward)
        if self.lstm.bidirectional:
            # Concatenate the final forward and backward hidden states
            hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        else:
            hidden = hidden[-1]

        # Classification
        output = self.dropout(hidden)
        output = self.fc(output)
        return output


# --- Training ---
def train_model():
    """Train the LSTM sentiment classifier."""

    # Sample data (replace with real dataset)
    texts = [
        "this movie is great and wonderful",
        "terrible film I hated it so much",
        "amazing performance by the actors",
        "worst movie I have ever seen boring",
        "loved every minute of this film",
        "awful acting and horrible script",
        "brilliant story with great characters",
        "waste of time do not watch this",
    ]
    labels = [1, 0, 1, 0, 1, 0, 1, 0]  # 1=positive, 0=negative

    # Build vocab and dataset
    vocab = build_vocab(texts)
    dataset = TextDataset(texts, labels, vocab, max_len=20)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)

    # Model configuration
    model = LSTMClassifier(
        vocab_size=len(vocab),
        embed_dim=64,
        hidden_dim=128,
        output_dim=2,
        num_layers=2,
        dropout=0.3,
        bidirectional=True
    )

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    model.train()
    for epoch in range(50):
        total_loss = 0
        correct = 0
        total = 0

        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            predictions = output.argmax(dim=1)
            correct += (predictions == batch_y).sum().item()
            total += batch_y.size(0)

        if (epoch + 1) % 10 == 0:
            accuracy = correct / total * 100
            print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}, "
                  f"Accuracy: {accuracy:.1f}%")

    return model, vocab


# --- GRU Variant ---
class GRUClassifier(nn.Module):
    """GRU variant — fewer parameters, often similar performance."""

    def __init__(self, vocab_size, embed_dim, hidden_dim,
                 output_dim, num_layers=2, dropout=0.3):
        super().__init__()

        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.gru = nn.GRU(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=True
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)

    def forward(self, x):
        embedded = self.dropout(self.embedding(x))
        gru_out, hidden = self.gru(embedded)
        # Concatenate final forward and backward hidden states
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        output = self.dropout(hidden)
        return self.fc(output)


if __name__ == "__main__":
    model, vocab = train_model()
    print(f"\nModel parameters: {sum(p.numel() for p in model.parameters()):,}")
    print(f"Vocabulary size: {len(vocab)}")
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| Vanishing gradient | Gradients shrink exponentially in long sequences |
| LSTM | Uses cell state + 3 gates to preserve long-range info |
| Forget gate | Decides what to remove from cell state |
| Input gate | Decides what new info to add |
| Output gate | Decides what to output from cell state |
| GRU | Simplified LSTM with 2 gates (update + reset) |
| Bidirectional | Processes sequence forward and backward |
| Stacked layers | Multiple layers learn different abstraction levels |

---

## Next Steps

In the next lesson, you will learn about **Sequence-to-Sequence Models** — architectures that map one sequence to another, enabling machine translation, summarization, and more.
