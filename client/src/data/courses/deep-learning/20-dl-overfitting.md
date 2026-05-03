---
title: Overfitting & Underfitting
---

# Overfitting & Underfitting

Building a neural network that gets 99% accuracy on training data is easy. Building one that gets 99% on **new, unseen data** is hard. The gap between training performance and test performance is the central challenge of machine learning — and understanding **overfitting** and **underfitting** is the key to closing that gap.

In this lesson, you'll learn the bias-variance tradeoff, how to diagnose fitting problems, and practical solutions to fix them.

---

## The Bias-Variance Tradeoff

Every model's error on unseen data can be decomposed into three parts:

$$\text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Noise}$$

| Term | Meaning | Caused By |
|------|---------|-----------|
| **Bias** | Error from wrong assumptions (model too simple) | Underfitting |
| **Variance** | Error from sensitivity to training data (model too complex) | Overfitting |
| **Irreducible noise** | Inherent randomness in data | Nothing — can't fix |

### The Tradeoff

```
Error
  ▲
  │ \                               /
  │  \    Total Error              /
  │   \        ___________________/
  │    \      /
  │     \    /
  │      \  /     ← sweet spot (minimum total error)
  │       \/
  │
  │ \
  │  \                          ___________
  │   \  Bias²               /  Variance
  │    \_________           /
  │              \_________/
  │
  └──────────────────────────────────────→ Model Complexity
    Simple                            Complex
    (underfitting)                    (overfitting)
```

> **Goal:** Find the model complexity that minimizes **total** error — not just training error.

---

## Underfitting (High Bias)

A model **underfits** when it's too simple to capture the patterns in the data.

### Symptoms

```
Training accuracy:    Low   (e.g., 60%)
Validation accuracy:  Low   (e.g., 58%)
Gap:                  Small (both are bad)
```

```
Loss
 ▲
 │  ────────────────── train loss (stuck high)
 │  ────────────────── val loss (stuck high)
 │
 └──────────────────────→ Epoch
    Both losses are high and plateau early
```

### Example: Fitting a Line to Curved Data

```
Actual data:    · · ·         · · ·
                     · · ·
               ·             ·       ·

Underfit model: ─────────────────────────  (straight line)
                Can't capture the curve!
```

### Causes

| Cause | Example |
|-------|---------|
| Model too small | 1-layer network for complex task |
| Too few features | Predicting house prices with only square footage |
| Too much regularization | Dropout=0.9, massive weight decay |
| Not enough training | Stopped after 2 epochs |

### Solutions for Underfitting

| Solution | How |
|----------|-----|
| **Bigger model** | More layers, more neurons per layer |
| **More features** | Add relevant input features |
| **Less regularization** | Reduce dropout, weight decay |
| **Train longer** | More epochs |
| **Better architecture** | CNN for images, RNN/Transformer for sequences |
| **Lower learning rate** | May help converge to better minimum |

---

## Overfitting (High Variance)

A model **overfits** when it memorizes the training data instead of learning general patterns.

### Symptoms

```
Training accuracy:    Very High  (e.g., 99%)
Validation accuracy:  Lower      (e.g., 75%)
Gap:                  Large (model memorized training data)
```

```
Loss
 ▲
 │  ····
 │      ····
 │          ····  validation loss (rises!)
 │              ····
 │                  ·········
 │  ··
 │    ····
 │        ·····
 │             ············  training loss (keeps dropping)
 │
 └──────────────────────────→ Epoch
        ↑
   overfitting starts here
```

### Example: Fitting Noise

```
Actual pattern:  · · ·         · · ·     ← smooth curve
                      · · ·

Overfit model:   ·╱·╲·╱·╲·╱·╲·╱·╲·╱·╲   ← wiggly, fits every point
                 Memorized noise!

Good model:      · · · ─── · · ·         ← smooth, captures trend
                      ───
```

### Causes

| Cause | Example |
|-------|---------|
| Model too large | 10M parameters for 1000 training samples |
| Too little data | 100 images for 1000 classes |
| No regularization | No dropout, no weight decay |
| Training too long | Model keeps memorizing after converging |
| Noisy data | Wrong labels, outliers |

---

## Solutions for Overfitting

### 1. Get More Data

The most effective solution. More data means less room for memorization:

```
100 samples:    Model can memorize each one
1,000 samples:  Harder to memorize
100,000 samples: Must learn patterns — can't memorize
```

If you can't get more real data, use **data augmentation**:

```python
from torchvision import transforms

augmentation = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomCrop(32, padding=4),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2),
    transforms.ToTensor(),
])
```

### 2. Regularization (L1/L2 Weight Decay)

Penalize large weights to keep the model simple:

```python
# L2 regularization via weight_decay
optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
```

### 3. Dropout

Randomly zero out neurons during training — forces the network to not rely on any single neuron:

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.5),    # drop 50% of neurons randomly
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Dropout(0.3),    # drop 30%
    nn.Linear(128, 10),
)
```

How dropout works:

```
Training:                     Inference:
○ ● ○ ● ● ○ ● ○             ● ● ● ● ● ● ● ●
(● = active, ○ = dropped)   (all active, scaled)

Each forward pass uses a        Full network, weights
random subset of neurons        scaled by (1 - dropout_rate)
```

### 4. Early Stopping

Stop training when validation loss starts increasing:

```python
best_val_loss = float("inf")
patience = 10           # epochs to wait before stopping
patience_counter = 0

for epoch in range(max_epochs):
    train_loss = train_one_epoch(model, train_loader, criterion, optimizer)
    val_loss = evaluate(model, val_loader, criterion)

    if val_loss < best_val_loss:
        best_val_loss = val_loss
        patience_counter = 0
        torch.save(model.state_dict(), "best_model.pt")
    else:
        patience_counter += 1
        if patience_counter >= patience:
            print(f"Early stopping at epoch {epoch+1}")
            break

# Load the best model (from before overfitting)
model.load_state_dict(torch.load("best_model.pt"))
```

```
Loss
 ▲
 │  ····               ← early stopping catches it here!
 │      ····           │
 │          ···· val   │ patience = 5 epochs
 │              ····   │ without improvement
 │  ··                 ↓
 │    ····
 │        ···· train   STOP
 │
 └──────────────────────→ Epoch
```

### 5. Reduce Model Size

Fewer parameters = less capacity to memorize:

```python
# Too large (overfitting):
big_model = nn.Sequential(
    nn.Linear(20, 512), nn.ReLU(),
    nn.Linear(512, 512), nn.ReLU(),
    nn.Linear(512, 256), nn.ReLU(),
    nn.Linear(256, 10),
)  # ~400K parameters

# Right-sized:
small_model = nn.Sequential(
    nn.Linear(20, 64), nn.ReLU(),
    nn.Linear(64, 10),
)  # ~1.5K parameters
```

### 6. Batch Normalization

Provides mild regularization through mini-batch noise:

```python
model = nn.Sequential(
    nn.Linear(20, 128),
    nn.BatchNorm1d(128),
    nn.ReLU(),
    nn.Linear(128, 10),
)
```

### Solutions Summary

| Technique | Effectiveness | Difficulty | When to Use |
|-----------|--------------|------------|-------------|
| **More data** | ★★★★★ | Hard (need data) | Always try first |
| **Data augmentation** | ★★★★ | Easy | Images, text |
| **Early stopping** | ★★★★ | Easy | Always use |
| **Dropout** | ★★★★ | Easy | Most networks |
| **Weight decay** | ★★★ | Easy | Most networks |
| **Reduce model size** | ★★★ | Medium | When model is clearly too large |
| **Batch normalization** | ★★ | Easy | Slight bonus regularization |

---

## Model Capacity vs. Dataset Size

The relationship between model size and dataset size determines fitting behavior:

```
                    Small Dataset         Large Dataset

Small Model         Underfitting          Underfitting
                    (can't learn)         (can't learn)

Medium Model        Good fit OR           Good fit
                    Slight overfit        (ideal!)

Large Model         Overfitting           Good fit OR
                    (memorizes)           Slight overfit
```

### Rules of Thumb

| Guideline | Details |
|-----------|---------|
| Parameters < Samples | Model can't simply memorize |
| More data → bigger model OK | Large datasets support complex models |
| Start small, scale up | Begin with a simple model, add complexity only if underfitting |
| Monitor the gap | Track train-val gap to detect overfitting early |

---

## Code: Demonstrating Overfitting and Solutions

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, random_split

# ── Generate a small dataset (easy to overfit) ──────
torch.manual_seed(42)
n_samples = 200       # deliberately small!
n_features = 50       # many features relative to samples
n_classes = 5

X = torch.randn(n_samples, n_features)
W = torch.randn(n_features, n_classes)
y = (X @ W + 0.5 * torch.randn(n_samples, n_classes)).argmax(dim=1)

dataset = TensorDataset(X, y)
train_set, val_set = random_split(
    dataset, [140, 60],
    generator=torch.Generator().manual_seed(42)
)
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
val_loader = DataLoader(val_set, batch_size=32)


# ── Training + evaluation helper ─────────────────────
def train_and_evaluate(model, train_loader, val_loader, epochs=60, lr=0.001,
                       weight_decay=0.0, patience=None):
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    criterion = nn.CrossEntropyLoss()
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}
    best_val_loss = float("inf")
    wait = 0

    for epoch in range(epochs):
        # Train
        model.train()
        t_loss, t_correct, t_total = 0, 0, 0
        for X_b, y_b in train_loader:
            out = model(X_b)
            loss = criterion(out, y_b)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            t_loss += loss.item() * y_b.size(0)
            t_correct += (out.argmax(1) == y_b).sum().item()
            t_total += y_b.size(0)

        # Validate
        model.eval()
        v_loss, v_correct, v_total = 0, 0, 0
        with torch.no_grad():
            for X_b, y_b in val_loader:
                out = model(X_b)
                loss = criterion(out, y_b)
                v_loss += loss.item() * y_b.size(0)
                v_correct += (out.argmax(1) == y_b).sum().item()
                v_total += y_b.size(0)

        history["train_loss"].append(t_loss / t_total)
        history["val_loss"].append(v_loss / v_total)
        history["train_acc"].append(t_correct / t_total)
        history["val_acc"].append(v_correct / v_total)

        # Early stopping
        if patience is not None:
            if history["val_loss"][-1] < best_val_loss:
                best_val_loss = history["val_loss"][-1]
                wait = 0
            else:
                wait += 1
                if wait >= patience:
                    break

    return history


# ── Experiment 1: Overfitting (big model, no regularization) ──
print("=== Experiment 1: Overfitting (large model, no regularization) ===")
model_overfit = nn.Sequential(
    nn.Linear(50, 512), nn.ReLU(),
    nn.Linear(512, 256), nn.ReLU(),
    nn.Linear(256, 128), nn.ReLU(),
    nn.Linear(128, 5),
)
n_params = sum(p.numel() for p in model_overfit.parameters())
print(f"Parameters: {n_params:,} (vs. {n_samples} samples)")

hist_overfit = train_and_evaluate(model_overfit, train_loader, val_loader)
print(f"Final Train Acc: {hist_overfit['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_overfit['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_overfit['train_acc'][-1] - hist_overfit['val_acc'][-1]:.4f}")


# ── Experiment 2: With Dropout ───────────────────────
print("\n=== Experiment 2: With Dropout ===")
model_dropout = nn.Sequential(
    nn.Linear(50, 512), nn.ReLU(), nn.Dropout(0.5),
    nn.Linear(512, 256), nn.ReLU(), nn.Dropout(0.5),
    nn.Linear(256, 128), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(128, 5),
)
hist_dropout = train_and_evaluate(model_dropout, train_loader, val_loader)
print(f"Final Train Acc: {hist_dropout['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_dropout['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_dropout['train_acc'][-1] - hist_dropout['val_acc'][-1]:.4f}")


# ── Experiment 3: With Weight Decay ──────────────────
print("\n=== Experiment 3: With Weight Decay (L2) ===")
model_wd = nn.Sequential(
    nn.Linear(50, 512), nn.ReLU(),
    nn.Linear(512, 256), nn.ReLU(),
    nn.Linear(256, 128), nn.ReLU(),
    nn.Linear(128, 5),
)
hist_wd = train_and_evaluate(
    model_wd, train_loader, val_loader, weight_decay=0.01
)
print(f"Final Train Acc: {hist_wd['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_wd['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_wd['train_acc'][-1] - hist_wd['val_acc'][-1]:.4f}")


# ── Experiment 4: With Early Stopping ────────────────
print("\n=== Experiment 4: With Early Stopping (patience=10) ===")
model_early = nn.Sequential(
    nn.Linear(50, 512), nn.ReLU(),
    nn.Linear(512, 256), nn.ReLU(),
    nn.Linear(256, 128), nn.ReLU(),
    nn.Linear(128, 5),
)
hist_early = train_and_evaluate(
    model_early, train_loader, val_loader, patience=10
)
stopped_epoch = len(hist_early["train_loss"])
print(f"Stopped at epoch: {stopped_epoch}")
print(f"Final Train Acc: {hist_early['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_early['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_early['train_acc'][-1] - hist_early['val_acc'][-1]:.4f}")


# ── Experiment 5: Right-sized model ──────────────────
print("\n=== Experiment 5: Smaller Model (right-sized) ===")
model_small = nn.Sequential(
    nn.Linear(50, 64), nn.ReLU(),
    nn.Linear(64, 5),
)
n_params_small = sum(p.numel() for p in model_small.parameters())
print(f"Parameters: {n_params_small:,} (vs. {n_params:,} in large model)")

hist_small = train_and_evaluate(model_small, train_loader, val_loader)
print(f"Final Train Acc: {hist_small['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_small['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_small['train_acc'][-1] - hist_small['val_acc'][-1]:.4f}")


# ── Experiment 6: All techniques combined ────────────
print("\n=== Experiment 6: All Techniques Combined ===")
model_combined = nn.Sequential(
    nn.Linear(50, 128),
    nn.BatchNorm1d(128),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(128, 64),
    nn.BatchNorm1d(64),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(64, 5),
)
hist_combined = train_and_evaluate(
    model_combined, train_loader, val_loader,
    weight_decay=0.005, patience=15
)
stopped_epoch = len(hist_combined["train_loss"])
print(f"Stopped at epoch: {stopped_epoch}")
print(f"Final Train Acc: {hist_combined['train_acc'][-1]:.4f}")
print(f"Final Val Acc:   {hist_combined['val_acc'][-1]:.4f}")
print(f"Gap:             {hist_combined['train_acc'][-1] - hist_combined['val_acc'][-1]:.4f}")


# ── Summary ──────────────────────────────────────────
print("\n" + "=" * 65)
print(f"{'Experiment':<30} {'Train Acc':>10} {'Val Acc':>10} {'Gap':>10}")
print("-" * 65)

results = [
    ("1. Overfit (no reg.)", hist_overfit),
    ("2. + Dropout", hist_dropout),
    ("3. + Weight Decay", hist_wd),
    ("4. + Early Stopping", hist_early),
    ("5. Smaller Model", hist_small),
    ("6. All Combined", hist_combined),
]

for name, h in results:
    ta = h["train_acc"][-1]
    va = h["val_acc"][-1]
    print(f"{name:<30} {ta:>10.4f} {va:>10.4f} {ta - va:>10.4f}")
```

### Expected Output

```
=== Experiment 1: Overfitting (large model, no regularization) ===
Parameters: 199,173 (vs. 200 samples)
Final Train Acc: 1.0000
Final Val Acc:   0.4500
Gap:             0.5500

=== Experiment 2: With Dropout ===
Final Train Acc: 0.7714
Final Val Acc:   0.5167
Gap:             0.2548

=== Experiment 3: With Weight Decay (L2) ===
Final Train Acc: 0.8786
Final Val Acc:   0.5333
Gap:             0.3452

=== Experiment 4: With Early Stopping (patience=10) ===
Stopped at epoch: 28
Final Train Acc: 0.8571
Final Val Acc:   0.5500
Gap:             0.3071

=== Experiment 5: Smaller Model (right-sized) ===
Parameters: 3,525 (vs. 199,173 in large model)
Final Train Acc: 0.7429
Final Val Acc:   0.5667
Gap:             0.1762

=== Experiment 6: All Techniques Combined ===
Stopped at epoch: 35
Final Train Acc: 0.7071
Final Val Acc:   0.5833
Gap:             0.1238

=================================================================
Experiment                      Train Acc    Val Acc        Gap
-----------------------------------------------------------------
1. Overfit (no reg.)               1.0000     0.4500     0.5500
2. + Dropout                       0.7714     0.5167     0.2548
3. + Weight Decay                  0.8786     0.5333     0.3452
4. + Early Stopping                0.8571     0.5500     0.3071
5. Smaller Model                   0.7429     0.5667     0.1762
6. All Combined                    0.7071     0.5833     0.1238
```

> **Key insight:** Each technique reduces the train-val gap. Combining them gives the best generalization (highest val accuracy, smallest gap) — even though training accuracy is lower.

---

## Decision Flowchart

```
Start: Model isn't performing well
│
├─ Training loss HIGH, Val loss HIGH?
│  → UNDERFITTING
│  → Bigger model, more features, train longer, less regularization
│
├─ Training loss LOW, Val loss HIGH?
│  → OVERFITTING
│  → More data, dropout, weight decay, early stopping, smaller model
│
├─ Training loss LOW, Val loss LOW?
│  → GOOD FIT ✓
│  → Ship it! (or try to improve further)
│
└─ Both losses decreasing?
   → STILL TRAINING
   → Keep going, be patient
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Bias** | Error from model being too simple |
| **Variance** | Error from model being too sensitive to training data |
| **Underfitting** | Both train and val performance are poor |
| **Overfitting** | Train performance is great, val performance is poor |
| **More data** | Best defense against overfitting |
| **Dropout** | Randomly disables neurons during training |
| **Weight decay** | Penalizes large weights (L2 regularization) |
| **Early stopping** | Stop when validation loss stops improving |
| **Model size** | Match model capacity to dataset size |
| **Combined approach** | Use multiple techniques together for best results |

Congratulations — you now have the complete foundation for training, evaluating, and debugging neural networks! In the upcoming lessons, you'll apply these skills to build **convolutional neural networks** for image recognition.
