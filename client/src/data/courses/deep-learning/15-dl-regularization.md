---
title: Regularization
---

# Regularization

A model that memorizes the training data instead of learning general patterns is **overfitting**. **Regularization** is a collection of techniques that prevent this — they constrain the model so it generalizes to unseen data.

In this lesson, you'll learn the most important regularization methods: L1, L2, dropout, and early stopping — and implement them all in PyTorch.

---

## The Overfitting Problem

```
                      Underfitting         Good Fit            Overfitting
                    (high bias)          (balanced)          (high variance)

Training Loss:         High               Low                 Very Low
Validation Loss:       High               Low                 HIGH ← problem!

                      ·   ·              ·   ·               ·   ·
Model:               ─────────          ───╲──╱──           ╱╲╱╲╱╲╱╲╱
                     (too simple)       (just right)        (too complex)
```

### How to Detect Overfitting

```
Loss
 ▲
 │ ····                            validation loss
 │     ····
 │         ····
 │             ····
 │                 ····  ← starts diverging!
 │                     ·····
 │                          ·······
 │ ··                                        ← gap = overfitting
 │   ···
 │      ····
 │          ·····
 │               ·········
 │                        ···············  training loss
 └──────────────────────────────────────→ Epoch
                ↑
          overfitting starts here
```

| Signal | Meaning |
|--------|---------|
| Training loss ↓, validation loss ↓ | Learning — keep going |
| Training loss ↓, validation loss → | Starting to overfit |
| Training loss ↓, validation loss ↑ | Overfitting — stop or regularize |
| Training loss →, validation loss → | Converged |

---

## L2 Regularization (Weight Decay)

**Idea:** Add a penalty for large weights to the loss function. This encourages the model to use **smaller weights**, leading to simpler (smoother) functions.

### Math

$$L_{\text{total}} = L_{\text{data}} + \lambda \sum_{i} w_i^2$$

Where:
- $L_{\text{data}}$ = original loss (e.g., MSE, cross-entropy)
- $\lambda$ = regularization strength (hyperparameter)
- $\sum w_i^2$ = sum of squared weights

### Effect on the Gradient

The gradient of the regularization term is:

$$\frac{\partial}{\partial w_i}\left(\lambda w_i^2\right) = 2\lambda w_i$$

So the update becomes:

$$w_i \leftarrow w_i - \alpha\left(\frac{\partial L_{\text{data}}}{\partial w_i} + 2\lambda w_i\right) = (1 - 2\alpha\lambda)w_i - \alpha\frac{\partial L_{\text{data}}}{\partial w_i}$$

The factor $(1 - 2\alpha\lambda)$ **shrinks** the weight at each step — that's why it's called **weight decay**.

### Choosing $\lambda$

| $\lambda$ | Effect |
|-----------|--------|
| 0 | No regularization |
| 0.0001 | Mild (common for Adam) |
| 0.001 | Moderate |
| 0.01 | Strong (common for SGD) |
| 0.1 | Very strong (may underfit) |

### PyTorch: Weight Decay

```python
# L2 regularization via weight_decay parameter
optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

# Or with SGD
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, weight_decay=0.001)
```

> **Note:** Use `AdamW` instead of `Adam` for proper weight decay behavior (see Optimizers lesson).

---

## L1 Regularization (Lasso)

**Idea:** Penalize the **absolute values** of weights instead of their squares.

### Math

$$L_{\text{total}} = L_{\text{data}} + \lambda \sum_{i} |w_i|$$

### L1 vs. L2

| Property | L1 ($\sum\|w_i\|$) | L2 ($\sum w_i^2$) |
|----------|-----|-----|
| **Gradient** | $\lambda \cdot \text{sign}(w_i)$ | $2\lambda w_i$ |
| **Effect on small weights** | Pushes to exactly 0 | Shrinks but rarely 0 |
| **Sparsity** | Yes — many weights become 0 | No — weights stay small |
| **Feature selection** | Built-in | No |
| **Common use** | Sparse models, feature selection | General regularization |

### Visual Intuition

```
L2 Regularization:                L1 Regularization:
  Weight values:                    Weight values:
  [0.3, -0.1, 0.05, -0.2]         [0.3, 0.0, 0.0, -0.2]
  (all shrunk, none zero)          (some exactly zero! → sparse)
```

### PyTorch: L1 Regularization (Manual)

PyTorch doesn't have a built-in L1 option, so we add it manually:

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(10, 64), nn.ReLU(),
    nn.Linear(64, 1),
)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.MSELoss()
l1_lambda = 0.001

for X_batch, y_batch in dataloader:
    y_pred = model(X_batch)
    loss = criterion(y_pred, y_batch)

    # Add L1 penalty manually
    l1_penalty = sum(param.abs().sum() for param in model.parameters())
    total_loss = loss + l1_lambda * l1_penalty

    optimizer.zero_grad()
    total_loss.backward()
    optimizer.step()
```

---

## Dropout

**Dropout** (Srivastava et al., 2014) randomly **sets neurons to zero** during training. This forces the network to be redundant — no single neuron can be relied upon.

### How It Works

During training, each neuron is "dropped" (set to 0) with probability $p$:

```
Without Dropout:                With Dropout (p=0.5):
  Input Layer    Hidden          Input Layer    Hidden
     ●──────────●                   ●──────────●
     ●──────────●                   ●──────────✗ (dropped)
     ●──────────●                   ●──────────●
     ●──────────●                   ●──────────✗ (dropped)
     ●──────────●                   ●──────────●

  All neurons active            Random subset active
  (can co-adapt)                (must be independent)
```

### Inverted Dropout

During training, surviving neurons are scaled by $\frac{1}{1-p}$ to keep the expected value the same:

$$a_{\text{train}} = \frac{\text{mask} \odot a}{1 - p}$$

Where mask is a binary tensor (0 with probability $p$, 1 with probability $1-p$).

**Why scale?** Without scaling:
- Training: on average, $1-p$ fraction of neurons active → total activation is $(1-p) \cdot a$
- Testing: all neurons active → total activation is $a$
- Mismatch! Scaling during training fixes this.

### During Testing

**Dropout is turned OFF during testing** — all neurons are active. Since we used inverted dropout, no additional scaling is needed.

### Choosing Dropout Rate $p$

| Layer Type | Typical $p$ |
|------------|-------------|
| After hidden layers | 0.5 (original paper) |
| After large layers | 0.3–0.5 |
| After small layers | 0.1–0.2 |
| After input layer | 0.0–0.2 (don't drop too many inputs) |
| After convolutional layers | Usually 0 (use batch norm instead) |

### PyTorch: Dropout

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(p=0.5),      # 50% dropout after first hidden layer
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Dropout(p=0.3),      # 30% dropout after second hidden layer
    nn.Linear(128, 10),     # No dropout before output!
)

# IMPORTANT: Switch between train/eval mode
model.train()  # Dropout ON (training)
model.eval()   # Dropout OFF (inference/testing)
```

### Why Does Dropout Work?

| Perspective | Explanation |
|-------------|-------------|
| **Ensemble** | Each training step uses a different random sub-network. Prediction averages over all possible sub-networks (like an ensemble of $2^n$ networks!) |
| **Redundancy** | No neuron can "rely" on another → features become more robust |
| **Noise injection** | Adds noise to hidden representations → acts like data augmentation on features |
| **Weight sharing** | Similar effect to training many smaller networks that share parameters |

---

## Early Stopping

**Idea:** Monitor validation loss during training. When it stops improving, **stop training**.

### Algorithm

```
best_val_loss = infinity
patience_counter = 0
patience = 10  (how many epochs to wait)

for each epoch:
    train one epoch
    compute validation loss

    if val_loss < best_val_loss:
        best_val_loss = val_loss
        patience_counter = 0
        save model  ← checkpoint
    else:
        patience_counter += 1

    if patience_counter >= patience:
        stop training
        load best model from checkpoint
```

### Visualization

```
Loss
 ▲
 │ ·                              validation
 │  ··
 │    ··
 │      ··
 │        ··
 │          ·· ← best model (save here!)
 │            ··
 │              ···
 │                 ····
 │                     ·····        ← validation rises
 │                          ·····
 │ ·                                training
 │  ·
 │   ··
 │     ···
 │        ····
 │            ·····
 │                 ·········
 │                          ···········
 └──────────────────────────────────────→ Epoch
               ↑
          stop here (patience exhausted)
          restore best checkpoint
```

### PyTorch: Early Stopping

```python
import torch
import copy

class EarlyStopping:
    def __init__(self, patience=10, min_delta=0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float("inf")
        self.best_model = None
        self.should_stop = False

    def step(self, val_loss, model):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            self.best_model = copy.deepcopy(model.state_dict())
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True

    def restore_best(self, model):
        model.load_state_dict(self.best_model)

# Usage
early_stopping = EarlyStopping(patience=10, min_delta=0.001)

for epoch in range(200):
    train_loss = train_one_epoch(model, train_loader)
    val_loss = evaluate(model, val_loader)

    early_stopping.step(val_loss, model)

    if early_stopping.should_stop:
        print(f"Early stopping at epoch {epoch}")
        early_stopping.restore_best(model)
        break
```

---

## Data Augmentation (Preview)

**Data augmentation** artificially increases training data by applying random transformations. It's one of the most effective regularization techniques for images.

### Common Image Augmentations

| Augmentation | What It Does |
|-------------|-------------|
| **Random flip** | Horizontally mirror the image |
| **Random crop** | Crop a random sub-region |
| **Color jitter** | Randomly change brightness, contrast, saturation |
| **Random rotation** | Rotate by a random angle |
| **Gaussian noise** | Add random noise to pixels |

### PyTorch: torchvision.transforms

```python
from torchvision import transforms

train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomCrop(32, padding=4),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,)),
])

# Only augment training data — NOT validation/test!
test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,)),
])
```

> We'll cover data augmentation in detail in a future lesson on image classification.

---

## Combining Regularization Techniques

In practice, you combine multiple techniques:

| Technique | How to Apply |
|-----------|-------------|
| L2 / Weight decay | `weight_decay` in optimizer |
| Dropout | `nn.Dropout()` in model |
| Early stopping | Monitor validation loss |
| Data augmentation | Transform training data |
| Batch normalization | `nn.BatchNorm1d()` in model (future lesson) |

### Typical Recipe

```python
# Model with dropout
model = nn.Sequential(
    nn.Linear(784, 512),
    nn.ReLU(),
    nn.Dropout(0.3),           # Dropout
    nn.Linear(512, 256),
    nn.ReLU(),
    nn.Dropout(0.2),           # Dropout
    nn.Linear(256, 10),
)

# Optimizer with weight decay (L2)
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01,         # L2 regularization
)

# Training with early stopping
early_stopping = EarlyStopping(patience=10)
```

---

## Code: Full Regularization Comparison

Let's see how each technique helps on a problem designed to overfit:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt
import copy

# --- Create a small dataset (easy to overfit) ---
torch.manual_seed(42)
n_train, n_val = 100, 500  # Small train, large val
X_all = torch.randn(n_train + n_val, 20)
y_all = (torch.sin(X_all[:, :3].sum(dim=1)) * 2 +
         X_all[:, 3] ** 2 - X_all[:, 4]).unsqueeze(1)
y_all += 0.5 * torch.randn_like(y_all)

X_train, X_val = X_all[:n_train], X_all[n_train:]
y_train, y_val = y_all[:n_train], y_all[n_train:]

train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)

# --- Model factory (deliberately large for overfitting) ---
def create_model(dropout_rate=0.0):
    layers = [
        nn.Linear(20, 256), nn.ReLU(),
    ]
    if dropout_rate > 0:
        layers.append(nn.Dropout(dropout_rate))
    layers += [nn.Linear(256, 128), nn.ReLU()]
    if dropout_rate > 0:
        layers.append(nn.Dropout(dropout_rate))
    layers += [nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 1)]
    return nn.Sequential(*layers)

# --- Training function ---
def train_model(name, model, weight_decay=0.0, use_early_stopping=False,
                num_epochs=200):
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001,
                                  weight_decay=weight_decay)
    criterion = nn.MSELoss()
    train_losses, val_losses = [], []
    best_val = float("inf")
    best_state = None
    patience, counter = 15, 0

    for epoch in range(num_epochs):
        # Train
        model.train()
        for X_b, y_b in train_loader:
            pred = model(X_b)
            loss = criterion(pred, y_b)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Evaluate
        model.eval()
        with torch.no_grad():
            t_loss = criterion(model(X_train), y_train).item()
            v_loss = criterion(model(X_val), y_val).item()
        train_losses.append(t_loss)
        val_losses.append(v_loss)

        # Early stopping
        if use_early_stopping:
            if v_loss < best_val - 0.001:
                best_val = v_loss
                best_state = copy.deepcopy(model.state_dict())
                counter = 0
            else:
                counter += 1
                if counter >= patience:
                    model.load_state_dict(best_state)
                    print(f"  {name}: early stopped at epoch {epoch}")
                    break

    return train_losses, val_losses

# --- Run experiments ---
experiments = {
    "No Regularization": {"model": create_model(0.0), "wd": 0.0, "es": False},
    "L2 (wd=0.01)": {"model": create_model(0.0), "wd": 0.01, "es": False},
    "Dropout (0.3)": {"model": create_model(0.3), "wd": 0.0, "es": False},
    "Early Stopping": {"model": create_model(0.0), "wd": 0.0, "es": True},
    "All Combined": {"model": create_model(0.3), "wd": 0.01, "es": True},
}

results = {}
for name, cfg in experiments.items():
    print(f"Training: {name}")
    t_loss, v_loss = train_model(
        name, cfg["model"], weight_decay=cfg["wd"], use_early_stopping=cfg["es"]
    )
    results[name] = {"train": t_loss, "val": v_loss}
    print(f"  Final train: {t_loss[-1]:.4f}, val: {v_loss[-1]:.4f}")

# --- Plot ---
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
axes = axes.flatten()
colors = {"train": "blue", "val": "red"}

for ax, (name, data) in zip(axes, results.items()):
    ax.plot(data["train"], label="Train", color="blue", linewidth=1.5)
    ax.plot(data["val"], label="Validation", color="red", linewidth=1.5)
    ax.set_title(name, fontsize=12)
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, max(data["val"][:20]) * 1.5)

# Summary bar chart
final_vals = {name: data["val"][-1] for name, data in results.items()}
axes[5].barh(list(final_vals.keys()), list(final_vals.values()), color="steelblue")
axes[5].set_xlabel("Final Validation Loss")
axes[5].set_title("Comparison: Final Val Loss")
axes[5].grid(True, alpha=0.3, axis="x")

plt.tight_layout()
plt.savefig("regularization_comparison.png", dpi=100)
plt.show()
```

---

## Code: Dropout Under the Hood

See exactly what dropout does to activations:

```python
import torch
import torch.nn as nn

# --- Manual dropout implementation ---
def manual_dropout(x, p, training):
    if not training or p == 0:
        return x

    # Create binary mask: 1 with prob (1-p), 0 with prob p
    mask = (torch.rand_like(x) > p).float()

    # Apply mask and scale (inverted dropout)
    return x * mask / (1 - p)

# --- Demo ---
torch.manual_seed(0)
x = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
p = 0.5

print("Original activations:")
print(f"  {x}")
print(f"  Mean: {x.mean():.2f}")

print(f"\nDropout (p={p}) during TRAINING (5 different masks):")
for i in range(5):
    torch.manual_seed(i)
    dropped = manual_dropout(x, p, training=True)
    print(f"  Run {i+1}: {dropped}  mean={dropped.mean():.2f}")

print(f"\nDropout during TESTING (no dropout):")
dropped = manual_dropout(x, p, training=False)
print(f"  {dropped}  mean={dropped.mean():.2f}")

# --- Verify PyTorch nn.Dropout matches ---
print("\n--- Verify against PyTorch ---")
dropout_layer = nn.Dropout(p=0.5)

dropout_layer.train()
torch.manual_seed(42)
out_train = dropout_layer(x)
print(f"Train mode: {out_train}")

dropout_layer.eval()
out_eval = dropout_layer(x)
print(f"Eval mode:  {out_eval}")
```

---

## Code: Weight Distribution With/Without L2

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

# --- Data ---
torch.manual_seed(42)
X = torch.randn(500, 10)
y = X[:, :3].sum(dim=1, keepdim=True) + 0.1 * torch.randn(500, 1)
dataloader = DataLoader(TensorDataset(X, y), batch_size=32, shuffle=True)

# --- Train two models ---
def train_and_get_weights(weight_decay, num_epochs=100):
    torch.manual_seed(42)
    model = nn.Sequential(
        nn.Linear(10, 128), nn.ReLU(),
        nn.Linear(128, 64), nn.ReLU(),
        nn.Linear(64, 1),
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001,
                                  weight_decay=weight_decay)
    criterion = nn.MSELoss()

    for epoch in range(num_epochs):
        for X_b, y_b in dataloader:
            pred = model(X_b)
            loss = criterion(pred, y_b)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    # Collect all weights
    all_weights = []
    for param in model.parameters():
        all_weights.append(param.detach().flatten())
    return torch.cat(all_weights).numpy()

weights_no_reg = train_and_get_weights(weight_decay=0.0)
weights_l2 = train_and_get_weights(weight_decay=0.01)

# --- Plot weight distributions ---
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), sharey=True)

ax1.hist(weights_no_reg, bins=50, color="coral", alpha=0.7, edgecolor="black")
ax1.set_title("No Regularization", fontsize=13)
ax1.set_xlabel("Weight Value")
ax1.set_ylabel("Count")
ax1.axvline(x=0, color="black", linestyle="--", alpha=0.5)
ax1.grid(True, alpha=0.3)

ax2.hist(weights_l2, bins=50, color="steelblue", alpha=0.7, edgecolor="black")
ax2.set_title("L2 Regularization (wd=0.01)", fontsize=13)
ax2.set_xlabel("Weight Value")
ax2.axvline(x=0, color="black", linestyle="--", alpha=0.5)
ax2.grid(True, alpha=0.3)

plt.suptitle("Effect of L2 Regularization on Weight Distribution", fontsize=14, y=1.02)
plt.tight_layout()
plt.savefig("weight_distribution.png", dpi=100)
plt.show()

print(f"No regularization — weight std: {weights_no_reg.std():.4f}")
print(f"L2 regularization — weight std: {weights_l2.std():.4f}")
```

---

## Summary

| Technique | How It Works | Key Effect |
|-----------|-------------|------------|
| **L2 (weight decay)** | $L + \lambda\sum w_i^2$ | Shrinks all weights |
| **L1** | $L + \lambda\sum\|w_i\|$ | Drives weights to zero (sparsity) |
| **Dropout** | Randomly zero neurons ($p$ prob) | Forces redundancy |
| **Early stopping** | Stop when val loss rises | Prevents memorization |
| **Data augmentation** | Random transforms on inputs | More training variety |

### Quick Reference: When to Use What

| Situation | Recommended |
|-----------|-------------|
| Default setup | Weight decay (0.01) + dropout (0.1–0.3) |
| Small dataset | Early stopping + dropout + data augmentation |
| Large model, enough data | Weight decay alone may suffice |
| Image tasks | Data augmentation (most effective!) |
| Feature selection needed | L1 regularization |
| Transformer models | Dropout + weight decay |

### What's Next?

You now have all the core tools for training neural networks: forward propagation, loss functions, backpropagation, optimizers, learning rate schedules, and regularization. In upcoming lessons, we'll apply these skills to real-world architectures like CNNs and RNNs.
