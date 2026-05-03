---
title: GRU Networks
---

# GRU Networks

The Gated Recurrent Unit (GRU) is a simplified version of the LSTM. It achieves similar performance with fewer parameters and faster training. If LSTM is a luxury sedan, GRU is a sports car — lighter but just as fast.

---

## GRU Motivation

LSTMs work great, but they have:
- **3 gates** (forget, input, output)
- **2 states** (hidden state $h_t$ and cell state $C_t$)
- Many parameters to train

In 2014, Cho et al. asked: *Can we get the same benefits with a simpler design?*

The answer was the GRU — combining the forget and input gates into a single **update gate**, and merging the cell state into the hidden state.

---

## GRU Architecture

A GRU has only **2 gates**:

```
         ┌──────────┐     ┌──────────┐
         │  Update  │     │  Reset   │
         │   Gate   │     │   Gate   │
         │   (z_t)  │     │   (r_t)  │
         └────┬─────┘     └────┬─────┘
              │                 │
              ▼                 ▼
    h_{t-1} ──── blend ──── candidate ──── h_t
```

**Key simplification:** No separate cell state! The hidden state does everything.

---

## GRU Equations

### Update Gate

The update gate $z_t$ decides how much of the **previous hidden state** to keep vs. how much of the **new candidate** to use:

$$z_t = \sigma(W_z[h_{t-1}, x_t] + b_z)$$

- $z_t \approx 1$: keep the old hidden state (remember)
- $z_t \approx 0$: use the new candidate (update)

> Think of $z_t$ as combining LSTM's forget and input gates into one. If you keep old info ($z_t = 1$), you automatically don't add new info.

### Reset Gate

The reset gate $r_t$ decides how much of the **previous hidden state** to use when computing the new candidate:

$$r_t = \sigma(W_r[h_{t-1}, x_t] + b_r)$$

- $r_t \approx 1$: use the full previous hidden state
- $r_t \approx 0$: ignore the previous hidden state (fresh start)

### Candidate Hidden State

A new candidate hidden state is computed using the reset gate:

$$\tilde{h}_t = \tanh(W_h[r_t \odot h_{t-1}, x_t] + b_h)$$

The reset gate $r_t$ controls how much history goes into computing the candidate. When $r_t \approx 0$, the candidate is computed mainly from the current input — useful for "forgetting" irrelevant past.

### Final Hidden State

The update gate blends the old and new:

$$h_t = (1 - z_t) \odot h_{t-1} + z_t \odot \tilde{h}_t$$

**In plain English:**
- Keep $(1 - z_t)$ fraction of the old hidden state
- Add $z_t$ fraction of the new candidate

This is elegant: one gate controls both what to forget AND what to add.

---

## GRU Step by Step

Let's trace through one time step:

```python
# Given: h_prev (previous hidden state), x_t (current input)

# Step 1: Compute gates
z_t = sigmoid(W_z @ concat(h_prev, x_t))  # Update gate
r_t = sigmoid(W_r @ concat(h_prev, x_t))  # Reset gate

# Step 2: Compute candidate
h_candidate = tanh(W_h @ concat(r_t * h_prev, x_t))

# Step 3: Blend old and new
h_t = (1 - z_t) * h_prev + z_t * h_candidate
```

---

## Visual Comparison: LSTM vs GRU

```
LSTM:                              GRU:
┌─────────────────────────┐       ┌─────────────────────┐
│  Cell state C_t          │       │  (no cell state)     │
│  ═══════════════════     │       │                      │
│  ↑forget  ↑input  ↓out  │       │  h_{t-1} ──blend──→ h_t │
│  3 gates: f, i, o       │       │  2 gates: z, r      │
│  2 states: h_t, C_t     │       │  1 state: h_t       │
└─────────────────────────┘       └─────────────────────┘
```

---

## LSTM vs GRU: Detailed Comparison

| Feature | LSTM | GRU |
|---------|------|-----|
| Gates | 3 (forget, input, output) | 2 (update, reset) |
| States | 2 (hidden + cell) | 1 (hidden only) |
| Parameters | More (~33% more) | Fewer |
| Training speed | Slower | Faster |
| Long sequences | Slightly better | Comparable |
| Small datasets | May overfit more | Better generalization |
| Interpretability | Harder (more components) | Easier |

### Parameter Count Comparison

For input size $n$ and hidden size $h$:

- **LSTM:** $4 \times (n + h) \times h + 4h = 4(n+h+1)h$
- **GRU:** $3 \times (n + h) \times h + 3h = 3(n+h+1)h$

GRU has about **75% of LSTM's parameters**.

**Example** (input=64, hidden=128):
- LSTM: $4 \times (64 + 128) \times 128 + 4 \times 128 = 98,816$
- GRU: $3 \times (64 + 128) \times 128 + 3 \times 128 = 74,112$

---

## When to Use GRU vs LSTM

### Choose GRU when:

- You have **limited data** (fewer parameters = less overfitting)
- You need **faster training** (fewer computations per step)
- Sequence lengths are **moderate** (< 100–200 steps)
- You're doing a **quick experiment** or prototype
- Memory/compute is constrained (embedded devices, mobile)

### Choose LSTM when:

- You have **lots of data** (more parameters can learn more)
- Sequences are **very long** (> 200+ steps)
- The task requires very **precise memory control**
- You need the separate cell state for **interpretability**
- State-of-the-art performance is critical

### In Practice

Many researchers find that **the difference is small** on most tasks. The best advice:

1. Start with GRU (faster to iterate)
2. If performance is insufficient, try LSTM
3. If LSTM doesn't help much, the bottleneck is elsewhere

---

## GRU in PyTorch

PyTorch's `nn.GRU` has the same interface as `nn.LSTM`:

```python
import torch
import torch.nn as nn

# Create GRU layer
gru = nn.GRU(
    input_size=10,     # Features per time step
    hidden_size=20,    # Hidden state dimension
    num_layers=2,      # Stacked layers
    batch_first=True,  # Input: (batch, seq, features)
    dropout=0.1,       # Dropout between layers
    bidirectional=False
)

# Input
x = torch.randn(3, 5, 10)  # (batch=3, seq_len=5, features=10)

# Initial hidden state (optional)
h0 = torch.zeros(2, 3, 20)  # (num_layers, batch, hidden_size)

# Forward pass — NOTE: only h_n, no c_n (no cell state!)
output, h_n = gru(x, h0)

print(f"Output: {output.shape}")  # (3, 5, 20)
print(f"h_n: {h_n.shape}")       # (2, 3, 20)
```

**Key difference from LSTM:** GRU returns `(output, h_n)` while LSTM returns `(output, (h_n, c_n))`.

---

## Code Example: GRU for Time Series Prediction

Let's build a GRU model that predicts future values in a time series. We'll generate a synthetic sine wave with noise.

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from torch.utils.data import DataLoader, TensorDataset

# ============================================================
# Step 1: Generate Synthetic Time Series Data
# ============================================================

def create_sine_data(num_points=2000, seq_len=30, pred_len=1):
    """
    Generate sine wave data with noise.
    Returns input sequences and their next values.
    """
    # Generate sine wave with noise
    t = np.linspace(0, 100, num_points)
    signal = np.sin(t) + 0.1 * np.random.randn(num_points)
    signal = signal.astype(np.float32)

    # Create sequences
    X, y = [], []
    for i in range(len(signal) - seq_len - pred_len + 1):
        X.append(signal[i:i + seq_len])
        y.append(signal[i + seq_len:i + seq_len + pred_len])

    X = torch.tensor(np.array(X)).unsqueeze(-1)  # (samples, seq_len, 1)
    y = torch.tensor(np.array(y))                 # (samples, pred_len)
    return X, y

# Create dataset
seq_len = 30
X, y = create_sine_data(num_points=2000, seq_len=seq_len)

# Train/test split (80/20)
split = int(0.8 * len(X))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

print(f"Training sequences: {X_train.shape}")  # (1568, 30, 1)
print(f"Test sequences: {X_test.shape}")       # (392, 30, 1)

# ============================================================
# Step 2: Define the GRU Model
# ============================================================

class GRUPredictor(nn.Module):
    """GRU model for time series prediction."""

    def __init__(self, input_size, hidden_size, num_layers, output_size,
                 dropout=0.2):
        super().__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # GRU layers
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )

        # Output layer
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size)
        )

    def forward(self, x):
        # x: (batch, seq_len, input_size)

        # GRU forward pass
        gru_out, h_n = self.gru(x)
        # gru_out: (batch, seq_len, hidden_size)

        # Use the last time step's output
        last_output = gru_out[:, -1, :]  # (batch, hidden_size)

        # Predict
        prediction = self.fc(last_output)  # (batch, output_size)
        return prediction

# ============================================================
# Step 3: Train the Model
# ============================================================

# Hyperparameters
input_size = 1
hidden_size = 64
num_layers = 2
output_size = 1
learning_rate = 0.001
num_epochs = 50
batch_size = 64

# Create model
model = GRUPredictor(input_size, hidden_size, num_layers, output_size)
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate)

# Learning rate scheduler
scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5
)

# Data loader
train_loader = DataLoader(
    TensorDataset(X_train, y_train),
    batch_size=batch_size, shuffle=True
)

# Training loop
best_loss = float('inf')

for epoch in range(num_epochs):
    model.train()
    total_loss = 0

    for batch_X, batch_y in train_loader:
        predictions = model(batch_X)
        loss = criterion(predictions, batch_y)

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    scheduler.step(avg_loss)

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}] Loss: {avg_loss:.6f}")

    if avg_loss < best_loss:
        best_loss = avg_loss

# ============================================================
# Step 4: Evaluate
# ============================================================

model.eval()
with torch.no_grad():
    predictions = model(X_test)
    test_loss = criterion(predictions, y_test)

    # Calculate metrics
    mae = torch.mean(torch.abs(predictions - y_test)).item()
    rmse = torch.sqrt(test_loss).item()

    print(f"\nTest Results:")
    print(f"  MSE:  {test_loss.item():.6f}")
    print(f"  RMSE: {rmse:.6f}")
    print(f"  MAE:  {mae:.6f}")

# Show some predictions
print(f"\nSample predictions vs actual:")
for i in range(5):
    print(f"  Predicted: {predictions[i].item():.4f} | "
          f"Actual: {y_test[i].item():.4f}")

# Model size
total_params = sum(p.numel() for p in model.parameters())
print(f"\nTotal parameters: {total_params:,}")
```

---

## Multi-Step Prediction with GRU

For predicting multiple future values, you can use **recursive prediction**:

```python
def predict_multi_step(model, initial_sequence, num_steps):
    """
    Predict multiple steps by feeding predictions back as input.
    """
    model.eval()
    predictions = []
    current_seq = initial_sequence.clone()  # (1, seq_len, 1)

    with torch.no_grad():
        for _ in range(num_steps):
            # Predict next value
            pred = model(current_seq)  # (1, 1)
            predictions.append(pred.item())

            # Shift sequence: remove first, append prediction
            new_input = pred.unsqueeze(-1)  # (1, 1, 1)
            current_seq = torch.cat([current_seq[:, 1:, :], new_input], dim=1)

    return predictions

# Predict next 10 steps
sample_input = X_test[0:1]  # (1, 30, 1)
future_preds = predict_multi_step(model, sample_input, num_steps=10)
print(f"Future predictions: {[f'{p:.3f}' for p in future_preds]}")
```

---

## GRU Variants and Tips

### Minimal GRU

A further simplification uses only the update gate (no reset gate):

$$h_t = (1 - z_t) \odot h_{t-1} + z_t \odot \tanh(W_h x_t + b_h)$$

This has even fewer parameters but may underperform on complex tasks.

### Practical Tips

| Tip | Details |
|-----|---------|
| Start small | hidden_size=32–64 for prototyping |
| Scale up carefully | Double hidden_size and check if loss improves |
| Use gradient clipping | `clip_grad_norm_(params, 1.0)` always |
| Normalize inputs | Standardize time series to mean=0, std=1 |
| Use learning rate scheduler | ReduceLROnPlateau works well |
| Monitor both train and val loss | GRUs can overfit on small data |
| Try bidirectional | If you have the full sequence available |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| GRU | Simplified LSTM with 2 gates |
| Update gate $z_t$ | Controls how much to keep vs. update |
| Reset gate $r_t$ | Controls how much history affects candidate |
| Hidden state | $h_t = (1-z_t) \odot h_{t-1} + z_t \odot \tilde{h}_t$ |
| vs LSTM | 25% fewer params, often similar performance |
| Best for | Moderate sequences, limited data, fast prototyping |
| PyTorch | `nn.GRU(input_size, hidden_size, num_layers)` |

---

## What's Next?

In the next lesson, you'll learn about **Sequence Modeling** — how to build encoder-decoder architectures for tasks like translation and summarization, with a first look at the attention mechanism.
