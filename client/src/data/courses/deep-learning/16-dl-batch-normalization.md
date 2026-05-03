---
title: Batch Normalization
---

# Batch Normalization

Training deep neural networks is hard. As the network gets deeper, small changes in early layers **amplify** through the network, making training slow and unstable. **Batch Normalization** (BatchNorm) fixes this by normalizing the inputs to each layer — and it's one of the most important techniques in modern deep learning.

In this lesson, you'll learn why batch normalization works, the math behind it, where to place it, and how to implement it in PyTorch.

---

## The Internal Covariate Shift Problem

During training, the weights of each layer change. This means the **distribution of inputs** to the next layer is constantly shifting:

```
Epoch 1:   Layer 1 outputs → mean=0.5, std=1.2 → Layer 2 tries to learn
Epoch 10:  Layer 1 outputs → mean=2.3, std=0.4 → Layer 2 must re-adapt!
Epoch 50:  Layer 1 outputs → mean=-1.1, std=3.7 → Layer 2 re-adapts again!
```

This is called **internal covariate shift** — each layer constantly adapts to a moving target.

### Why It Hurts Training

```
Without BatchNorm:
┌──────────┐     shifting      ┌──────────┐     shifting      ┌──────────┐
│  Layer 1  │ ──distribution──▶ │  Layer 2  │ ──distribution──▶ │  Layer 3  │
└──────────┘                   └──────────┘                   └──────────┘
     ↓                              ↓                              ↓
  updates                    must re-adapt                   must re-adapt
  weights                    to new inputs                   to new inputs

With BatchNorm:
┌──────────┐     stable        ┌──────────┐     stable        ┌──────────┐
│  Layer 1  │ ──distribution──▶ │  Layer 2  │ ──distribution──▶ │  Layer 3  │
└──────────┘   (normalized)    └──────────┘   (normalized)    └──────────┘
     ↓                              ↓                              ↓
  updates                     learns faster                  learns faster
  weights                    (stable input)                 (stable input)
```

| Problem | Effect |
|---------|--------|
| Shifting input distributions | Layers chase a moving target |
| Exploding/vanishing gradients | Deeper layers get bad gradient signals |
| Sensitive to initialization | Bad initial weights → training failure |
| Requires small learning rates | Slows training to keep it stable |

---

## Batch Normalization: The Idea

**Batch normalization** normalizes the inputs to each layer across the current **mini-batch**. The idea is simple: before each layer processes its input, force the input to have **zero mean** and **unit variance**.

### Step-by-Step

Given a mini-batch $B = \{x_1, x_2, \ldots, x_m\}$:

**Step 1: Compute batch mean**

$$\mu_B = \frac{1}{m}\sum_{i=1}^{m} x_i$$

**Step 2: Compute batch variance**

$$\sigma_B^2 = \frac{1}{m}\sum_{i=1}^{m}(x_i - \mu_B)^2$$

**Step 3: Normalize**

$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$$

Where $\epsilon$ is a small constant (e.g., $10^{-5}$) to prevent division by zero.

**Step 4: Scale and shift**

$$y_i = \gamma \hat{x}_i + \beta$$

Where $\gamma$ (scale) and $\beta$ (shift) are **learnable parameters**.

### Why Scale and Shift?

If we only normalized, we'd **limit** what the layer can represent. For example, a sigmoid activation works best with inputs spread around 0 — but what if the optimal input distribution has a different mean and variance?

The learnable $\gamma$ and $\beta$ give the network the ability to **undo** the normalization if it's not helpful:

| If the network learns... | Then... |
|--------------------------|---------|
| $\gamma = \sigma_B$, $\beta = \mu_B$ | BatchNorm is the identity (undone!) |
| $\gamma = 1$, $\beta = 0$ | Pure normalization (zero mean, unit var) |
| Other values | Optimal distribution for this layer |

```
Before BatchNorm:     After Normalize:      After Scale & Shift:
  Input values:         Normalized:            Final output:
  [5.2, 3.1, 8.7]  →  [-0.39, -1.13, 1.52] → γ * normalized + β
  (any distribution)   (mean≈0, std≈1)        (learned distribution)
```

---

## Where to Place Batch Normalization

There are two common placements, and practitioners disagree about which is better:

### Option A: Before Activation (Original Paper)

```
Linear → BatchNorm → ReLU
```

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.BatchNorm1d(256),    # normalize before activation
    nn.ReLU(),
    nn.Linear(256, 128),
    nn.BatchNorm1d(128),
    nn.ReLU(),
    nn.Linear(128, 10),
)
```

### Option B: After Activation

```
Linear → ReLU → BatchNorm
```

```python
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.BatchNorm1d(256),    # normalize after activation
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.BatchNorm1d(128),
    nn.Linear(128, 10),
)
```

### Which One to Use?

| Placement | Pros | Cons |
|-----------|------|------|
| **Before activation** (original) | Matches the paper; most common | Normalizes values that ReLU may zero out |
| **After activation** | Normalizes the actual input to next layer | Less conventional |

> **Practical tip:** Both work well. "Before activation" is more common. Try both and pick whichever gives better validation loss on your task.

---

## Benefits of Batch Normalization

### 1. Faster Training

BatchNorm stabilizes the input distribution, so the network converges in fewer epochs:

```
Without BatchNorm:    ████████████████████████████████  (100 epochs)
With BatchNorm:       ████████████████                  (50 epochs)
```

### 2. Higher Learning Rates

Without BatchNorm, large learning rates cause training to diverge. With BatchNorm, the normalized inputs keep gradients in a healthy range:

| Learning Rate | Without BatchNorm | With BatchNorm |
|---------------|-------------------|----------------|
| 0.001 | Trains slowly | Trains normally |
| 0.01 | Trains normally | Trains fast |
| 0.1 | Diverges! | Often still works |

### 3. Reduces Sensitivity to Initialization

Random weight initialization matters less because BatchNorm re-normalizes activations at each layer:

```
Bad initialization → large/small activations → BatchNorm fixes → stable training
```

### 4. Provides Some Regularization

Because each mini-batch has slightly different statistics ($\mu_B$, $\sigma_B^2$), it adds **noise** to the normalization — similar to dropout. This reduces overfitting slightly.

> **Note:** BatchNorm's regularization effect is a **bonus**, not a replacement for dropout or weight decay.

---

## Batch Norm During Inference

Here's a critical detail: during training, BatchNorm uses the **current mini-batch** statistics. But during inference (testing), you might pass a **single sample** — a batch of size 1 has no meaningful mean/variance!

### Solution: Running Statistics

During training, BatchNorm keeps a **running average** of the mean and variance across all batches:

$$\mu_{\text{running}} = (1 - \alpha) \cdot \mu_{\text{running}} + \alpha \cdot \mu_B$$

$$\sigma^2_{\text{running}} = (1 - \alpha) \cdot \sigma^2_{\text{running}} + \alpha \cdot \sigma^2_B$$

Where $\alpha$ is the **momentum** (default 0.1 in PyTorch).

During inference, these running statistics are used instead of batch statistics:

```
Training Mode:                    Inference Mode:
┌─────────────┐                  ┌─────────────┐
│ Mini-batch   │                  │ Single input │
│ [x1,x2,...xm]│                  │     [x]      │
└──────┬──────┘                  └──────┬──────┘
       ↓                                ↓
  μ_B, σ²_B                      μ_running, σ²_running
  (batch stats)                   (saved from training)
       ↓                                ↓
  normalize + γ,β                 normalize + γ,β
```

### PyTorch Handles This Automatically

```python
# Training: uses batch statistics, updates running stats
model.train()
output = model(train_batch)

# Inference: uses running statistics (frozen)
model.eval()
output = model(test_input)
```

> **Warning:** Always call `model.eval()` before inference! Forgetting this is a common bug that leads to inconsistent predictions.

---

## Other Normalization Techniques

Batch normalization has limitations — especially with small batch sizes or sequence data. Several alternatives exist:

### Layer Normalization

Normalizes across **all features** for each sample (instead of across the batch). Used extensively in Transformers and NLP.

$$\text{LayerNorm: normalize across features for each sample}$$

```
Batch Norm:  normalize down columns (across batch)
Layer Norm:  normalize across rows (across features)

        Feature 1   Feature 2   Feature 3
Sample 1  [  0.5       1.2       -0.3  ]  ← LayerNorm normalizes this row
Sample 2  [  0.8       0.1        0.9  ]  ← and this row independently
Sample 3  [ -0.2       0.7        1.5  ]
             ↑                      ↑
       BatchNorm normalizes     BatchNorm normalizes
       this column              this column
```

### Instance Normalization

Normalizes each **channel** of each **sample** independently. Popular in style transfer and image generation.

```
Input shape: [Batch, Channels, Height, Width]
Instance Norm: normalize over (Height, Width) for each (Batch, Channel) pair
```

### Group Normalization

Splits channels into **groups** and normalizes within each group. Works well with small batch sizes (e.g., object detection).

```
Channels: [c1, c2, c3, c4, c5, c6, c7, c8]
Group Norm (2 groups): [c1, c2, c3, c4] | [c5, c6, c7, c8]
                        normalize these    normalize these
```

### Comparison Table

| Method | Normalizes Over | Best For | Batch Size Dependent? |
|--------|-----------------|----------|-----------------------|
| **BatchNorm** | Batch dimension | CNNs, standard feedforward | Yes |
| **LayerNorm** | Feature dimension | Transformers, RNNs | No |
| **InstanceNorm** | Spatial dimensions (H, W) | Style transfer, GANs | No |
| **GroupNorm** | Channel groups | Small-batch CNNs | No |

### PyTorch Classes

```python
import torch.nn as nn

# Batch Normalization
bn1d = nn.BatchNorm1d(num_features=64)    # for fully-connected layers
bn2d = nn.BatchNorm2d(num_features=32)    # for convolutional layers

# Layer Normalization
ln = nn.LayerNorm(normalized_shape=64)     # normalizes last dimension

# Instance Normalization
instn = nn.InstanceNorm2d(num_features=32) # for conv layers

# Group Normalization
gn = nn.GroupNorm(num_groups=8, num_channels=32)  # 32 channels, 8 groups
```

---

## Code: Training With and Without Batch Normalization

Let's see the difference BatchNorm makes on a real classification task:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ── Generate synthetic data ─────────────────────────
torch.manual_seed(42)
n_samples = 2000
n_features = 50
n_classes = 5

X = torch.randn(n_samples, n_features)
# Create non-linear decision boundary
W_true = torch.randn(n_features, n_classes)
y = (X @ W_true + 0.5 * torch.randn(n_samples, n_classes)).argmax(dim=1)

# Train/test split
X_train, X_test = X[:1600], X[1600:]
y_train, y_test = y[:1600], y[1600:]

train_loader = DataLoader(
    TensorDataset(X_train, y_train), batch_size=64, shuffle=True
)
test_loader = DataLoader(
    TensorDataset(X_test, y_test), batch_size=64
)


# ── Model WITHOUT Batch Normalization ────────────────
class ModelNoBN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(50, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 5),
        )

    def forward(self, x):
        return self.net(x)


# ── Model WITH Batch Normalization ───────────────────
class ModelWithBN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(50, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Linear(64, 5),
        )

    def forward(self, x):
        return self.net(x)


# ── Training function ───────────────────────────────
def train_model(model, train_loader, test_loader, epochs=30, lr=0.01):
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()
    history = {"train_loss": [], "test_acc": []}

    for epoch in range(epochs):
        # Training
        model.train()
        total_loss = 0
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            output = model(X_batch)
            loss = criterion(output, y_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        history["train_loss"].append(avg_loss)

        # Evaluation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for X_batch, y_batch in test_loader:
                preds = model(X_batch).argmax(dim=1)
                correct += (preds == y_batch).sum().item()
                total += y_batch.size(0)

        acc = correct / total
        history["test_acc"].append(acc)

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1:3d} | Loss: {avg_loss:.4f} | Acc: {acc:.4f}")

    return history


# ── Compare ──────────────────────────────────────────
print("=== Without Batch Normalization ===")
model_no_bn = ModelNoBN()
hist_no_bn = train_model(model_no_bn, train_loader, test_loader)

print("\n=== With Batch Normalization ===")
model_bn = ModelWithBN()
hist_bn = train_model(model_bn, train_loader, test_loader)

print("\n=== Final Results ===")
print(f"Without BN → Loss: {hist_no_bn['train_loss'][-1]:.4f}, "
      f"Acc: {hist_no_bn['test_acc'][-1]:.4f}")
print(f"With BN    → Loss: {hist_bn['train_loss'][-1]:.4f}, "
      f"Acc: {hist_bn['test_acc'][-1]:.4f}")
```

### Expected Output

```
=== Without Batch Normalization ===
  Epoch  10 | Loss: 0.8734 | Acc: 0.6850
  Epoch  20 | Loss: 0.4521 | Acc: 0.7600
  Epoch  30 | Loss: 0.2187 | Acc: 0.7925

=== With Batch Normalization ===
  Epoch  10 | Loss: 0.3412 | Acc: 0.7800
  Epoch  20 | Loss: 0.0894 | Acc: 0.8125
  Epoch  30 | Loss: 0.0312 | Acc: 0.8250

=== Final Results ===
Without BN → Loss: 0.2187, Acc: 0.7925
With BN    → Loss: 0.0312, Acc: 0.8250
```

> **Key takeaway:** The model with BatchNorm converges faster (lower loss at every checkpoint) and achieves higher test accuracy.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Internal covariate shift** | Layer inputs shift as earlier layers update |
| **BatchNorm formula** | $\hat{x} = \frac{x - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$, then $y = \gamma\hat{x} + \beta$ |
| **Learnable parameters** | $\gamma$ (scale) and $\beta$ (shift) let the network adjust |
| **Placement** | Before activation (most common) or after |
| **Benefits** | Faster training, higher LR, less sensitivity to init |
| **Inference** | Uses running mean/variance (call `model.eval()`!) |
| **LayerNorm** | Normalizes across features; used in Transformers |
| **GroupNorm** | Normalizes within channel groups; works with small batches |
| **InstanceNorm** | Normalizes per-channel per-sample; used in style transfer |

In the next lesson, you'll learn how to **load and preprocess data** efficiently with PyTorch's Dataset and DataLoader.
