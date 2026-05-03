---
title: Loss Functions
---

# Loss Functions

A **loss function** (also called a cost function or objective function) measures how **wrong** the network's predictions are. It's the number that training tries to minimize — the lower the loss, the better the model.

In this lesson, you'll learn the most important loss functions for regression and classification, understand when to use each one, and implement them all in PyTorch.

---

## What Is a Loss Function?

After forward propagation produces a prediction $\hat{y}$, we need a way to compare it to the true answer $y$. The loss function $L(y, \hat{y})$ quantifies this **prediction error** as a single number.

```
                Forward Pass                    Loss Computation
  x ──→ [Neural Network] ──→ ŷ ──→ L(y, ŷ) ──→ single number
                                 ↑
                                 y (true label)
```

### Key Properties of a Good Loss Function

| Property | Why It Matters |
|----------|---------------|
| **Differentiable** | We need gradients for backpropagation |
| **Minimum at correct prediction** | $L = 0$ when $\hat{y} = y$ |
| **Larger when more wrong** | Bigger errors → bigger loss |
| **Matches the task** | Regression needs different loss than classification |

### Loss vs. Cost

- **Loss** $L(y_i, \hat{y}_i)$: error for a **single** sample
- **Cost** $J = \frac{1}{n}\sum_{i=1}^{n} L(y_i, \hat{y}_i)$: **average** loss over the entire dataset

In practice, people often use "loss" and "cost" interchangeably.

---

## Regression Losses

Regression tasks predict a **continuous value** (e.g., house price, temperature, stock price). The output layer has no activation function (or a linear one).

### Mean Squared Error (MSE)

The most common regression loss:

$$L_{\text{MSE}} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

| Property | Detail |
|----------|--------|
| **Range** | $[0, \infty)$ |
| **Penalty** | Quadratic — large errors are penalized heavily |
| **Gradient** | $\frac{\partial L}{\partial \hat{y}_i} = -\frac{2}{n}(y_i - \hat{y}_i)$ |
| **Sensitive to outliers?** | Yes — squaring amplifies large errors |
| **Use when** | Errors are roughly Gaussian distributed |

### Example: MSE by Hand

Suppose we have 4 predictions:

| $y$ (true) | $\hat{y}$ (predicted) | Error $(y - \hat{y})$ | Squared Error |
|------------|----------------------|----------------------|---------------|
| 3.0 | 2.5 | 0.5 | 0.25 |
| 5.0 | 4.8 | 0.2 | 0.04 |
| 2.0 | 3.0 | -1.0 | 1.00 |
| 7.0 | 6.5 | 0.5 | 0.25 |

$$L_{\text{MSE}} = \frac{0.25 + 0.04 + 1.00 + 0.25}{4} = \frac{1.54}{4} = 0.385$$

```python
import torch

# MSE by hand
y = torch.tensor([3.0, 5.0, 2.0, 7.0])
y_hat = torch.tensor([2.5, 4.8, 3.0, 6.5])

# Manual computation
errors = y - y_hat
squared_errors = errors ** 2
mse_manual = squared_errors.mean()

print("=== Mean Squared Error ===")
print(f"True:     {y.tolist()}")
print(f"Predicted: {y_hat.tolist()}")
print(f"Errors:   {errors.tolist()}")
print(f"Squared:  {squared_errors.tolist()}")
print(f"MSE:      {mse_manual.item():.4f}")

# PyTorch MSE
loss_fn = torch.nn.MSELoss()
mse_pytorch = loss_fn(y_hat, y)
print(f"PyTorch:  {mse_pytorch.item():.4f}")
```

---

### Mean Absolute Error (MAE)

Also called **L1 Loss**:

$$L_{\text{MAE}} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

| Property | Detail |
|----------|--------|
| **Range** | $[0, \infty)$ |
| **Penalty** | Linear — all errors penalized equally |
| **Gradient** | $\frac{\partial L}{\partial \hat{y}_i} = -\frac{1}{n}\text{sign}(y_i - \hat{y}_i)$ |
| **Sensitive to outliers?** | No — robust to large errors |
| **Use when** | Data has outliers you want to ignore |

### MSE vs. MAE

| Property | MSE | MAE |
|----------|-----|-----|
| **Outlier sensitivity** | High (squares large errors) | Low (linear penalty) |
| **Gradient near zero** | Smooth (approaches 0) | Not smooth (gradient is ±1) |
| **Optimization** | Easier (smooth) | Harder (non-smooth at 0) |
| **Common name** | L2 Loss | L1 Loss |

```python
import torch
import torch.nn as nn

y = torch.tensor([3.0, 5.0, 2.0, 7.0])
y_hat = torch.tensor([2.5, 4.8, 3.0, 6.5])

# Manual MAE
mae_manual = (y - y_hat).abs().mean()

# PyTorch MAE
mae_fn = nn.L1Loss()
mae_pytorch = mae_fn(y_hat, y)

print("=== Mean Absolute Error ===")
print(f"Absolute errors: {(y - y_hat).abs().tolist()}")
print(f"MAE (manual):    {mae_manual.item():.4f}")
print(f"MAE (PyTorch):   {mae_pytorch.item():.4f}")
```

---

### Huber Loss (Smooth L1 Loss)

**Huber loss** combines the best of MSE and MAE — quadratic for small errors, linear for large errors:

$$L_{\delta}(y, \hat{y}) = \begin{cases} \frac{1}{2}(y - \hat{y})^2 & \text{if } |y - \hat{y}| \leq \delta \\ \delta |y - \hat{y}| - \frac{1}{2}\delta^2 & \text{otherwise} \end{cases}$$

Where $\delta$ is the threshold (default 1.0).

| Property | Detail |
|----------|--------|
| **Small errors** ($|e| \leq \delta$) | Behaves like MSE (smooth) |
| **Large errors** ($|e| > \delta$) | Behaves like MAE (robust) |
| **Differentiable** | Yes, everywhere |
| **Use when** | You want MSE's smoothness but MAE's robustness |

```python
import torch
import torch.nn as nn

y = torch.tensor([3.0, 5.0, 2.0, 7.0])
y_hat = torch.tensor([2.5, 4.8, 3.0, 6.5])

# Compare all three regression losses
mse_fn = nn.MSELoss()
mae_fn = nn.L1Loss()
huber_fn = nn.HuberLoss(delta=1.0)

print("=== Regression Loss Comparison ===")
print(f"MSE:   {mse_fn(y_hat, y).item():.4f}")
print(f"MAE:   {mae_fn(y_hat, y).item():.4f}")
print(f"Huber: {huber_fn(y_hat, y).item():.4f}")

# Show behavior with an outlier
print("\n=== With Outlier ===")
y_outlier = torch.tensor([3.0, 5.0, 2.0, 100.0])
y_hat_outlier = torch.tensor([2.5, 4.8, 3.0, 6.5])

print(f"MSE:   {mse_fn(y_hat_outlier, y_outlier).item():.2f}")
print(f"MAE:   {mae_fn(y_hat_outlier, y_outlier).item():.2f}")
print(f"Huber: {huber_fn(y_hat_outlier, y_outlier).item():.2f}")
# MSE explodes, MAE and Huber stay reasonable
```

---

## Classification Losses

Classification tasks predict a **category** (e.g., cat vs. dog, digit 0–9). The output layer uses sigmoid (binary) or softmax (multi-class).

### Binary Cross-Entropy (BCE)

For binary classification (2 classes):

$$L_{\text{BCE}} = -\frac{1}{n}\sum_{i=1}^{n}\left[y_i \log(\hat{y}_i) + (1 - y_i)\log(1 - \hat{y}_i)\right]$$

Where $y_i \in \{0, 1\}$ and $\hat{y}_i \in (0, 1)$ is the predicted probability.

### How BCE Works

When the true label is $y = 1$:

$$L = -\log(\hat{y})$$

- If $\hat{y} = 0.99$: $L = -\log(0.99) = 0.01$ (very low loss — correct and confident)
- If $\hat{y} = 0.5$: $L = -\log(0.5) = 0.69$ (moderate loss — uncertain)
- If $\hat{y} = 0.01$: $L = -\log(0.01) = 4.61$ (very high loss — confidently wrong!)

When the true label is $y = 0$:

$$L = -\log(1 - \hat{y})$$

- If $\hat{y} = 0.01$: $L = -\log(0.99) = 0.01$ (low loss)
- If $\hat{y} = 0.99$: $L = -\log(0.01) = 4.61$ (high loss)

> **Key insight:** BCE penalizes **confident wrong predictions** extremely heavily. Being 99% sure of the wrong class costs much more than being 60% sure.

```python
import torch
import torch.nn as nn

# BCE by hand
y = torch.tensor([1.0, 0.0, 1.0, 0.0])
y_hat = torch.tensor([0.9, 0.1, 0.4, 0.8])

# Manual computation
bce_manual = -(y * torch.log(y_hat) +
               (1 - y) * torch.log(1 - y_hat)).mean()

# PyTorch BCE
bce_fn = nn.BCELoss()
bce_pytorch = bce_fn(y_hat, y)

print("=== Binary Cross-Entropy ===")
print(f"True:       {y.tolist()}")
print(f"Predicted:  {y_hat.tolist()}")
print(f"BCE (manual):  {bce_manual.item():.4f}")
print(f"BCE (PyTorch): {bce_pytorch.item():.4f}")

# Per-sample losses
print("\nPer-sample losses:")
per_sample = -(y * torch.log(y_hat) +
               (1 - y) * torch.log(1 - y_hat))
for i, (true, pred, loss) in enumerate(zip(y, y_hat, per_sample)):
    status = "✓" if (pred > 0.5) == (true == 1) else "✗"
    print(f"  Sample {i}: true={int(true)}, "
          f"pred={pred.item():.2f}, loss={loss.item():.4f} {status}")
```

---

### BCE with Logits

In practice, use `nn.BCEWithLogitsLoss` which combines sigmoid + BCE in one step. It's **numerically more stable** than applying sigmoid first:

```python
import torch
import torch.nn as nn

# Raw logits (before sigmoid)
logits = torch.tensor([2.0, -1.5, 0.5, -0.3])
y = torch.tensor([1.0, 0.0, 1.0, 0.0])

# Method 1: Sigmoid + BCELoss (less stable)
bce_fn = nn.BCELoss()
probs = torch.sigmoid(logits)
loss1 = bce_fn(probs, y)

# Method 2: BCEWithLogitsLoss (more stable — preferred)
bce_logits_fn = nn.BCEWithLogitsLoss()
loss2 = bce_logits_fn(logits, y)

print("=== BCE with Logits ===")
print(f"Logits:       {logits.tolist()}")
print(f"Probabilities: {[f'{p:.3f}' for p in probs.tolist()]}")
print(f"Sigmoid + BCE:      {loss1.item():.4f}")
print(f"BCEWithLogitsLoss:  {loss2.item():.4f}")
print(f"Match: {torch.isclose(loss1, loss2).item()}")
```

---

### Categorical Cross-Entropy / NLL Loss

For multi-class classification ($K$ classes):

$$L_{\text{CE}} = -\sum_{i=1}^{K} y_i \log(\hat{y}_i)$$

When $y$ is a one-hot vector, this simplifies to:

$$L_{\text{CE}} = -\log(\hat{y}_c)$$

Where $c$ is the index of the true class.

### How It Works

Suppose we have 3 classes and the true class is 2 (zero-indexed):

| Prediction $\hat{y}$ | $\hat{y}_2$ (true class prob) | Loss $-\log(\hat{y}_2)$ |
|----------------------|------------------------------|------------------------|
| $[0.1, 0.1, 0.8]$ | $0.8$ | $0.22$ |
| $[0.3, 0.3, 0.4]$ | $0.4$ | $0.92$ |
| $[0.5, 0.4, 0.1]$ | $0.1$ | $2.30$ |

The loss only looks at the probability assigned to the **correct class**.

### PyTorch: nn.CrossEntropyLoss

PyTorch's `nn.CrossEntropyLoss` combines **log-softmax + NLL loss** in one step. It takes **raw logits** (not probabilities):

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# ─── 3-class example ──────────────────────────────────
logits = torch.tensor([[2.0, 1.0, 0.1],    # Sample 0
                        [0.5, 2.5, 0.3],    # Sample 1
                        [0.3, 0.2, 2.8]])   # Sample 2

# True labels (class indices, not one-hot)
targets = torch.tensor([0, 1, 2])

# CrossEntropyLoss (takes raw logits)
ce_fn = nn.CrossEntropyLoss()
loss = ce_fn(logits, targets)

print("=== Cross-Entropy Loss ===")
print(f"Logits:\n{logits}")
print(f"Targets: {targets.tolist()}")
print(f"Loss: {loss.item():.4f}")

# What it's doing internally:
print("\n=== Step by Step ===")
probs = F.softmax(logits, dim=1)
print(f"Softmax probabilities:\n{probs}")

for i in range(3):
    true_class = targets[i].item()
    true_prob = probs[i, true_class].item()
    sample_loss = -torch.log(torch.tensor(true_prob)).item()
    print(f"Sample {i}: true class={true_class}, "
          f"P(true)={true_prob:.3f}, "
          f"loss=-log({true_prob:.3f})={sample_loss:.4f}")

avg_loss = sum(-torch.log(probs[i, targets[i]]).item()
               for i in range(3)) / 3
print(f"\nAverage loss: {avg_loss:.4f}")
```

### CrossEntropyLoss vs. NLLLoss

| Function | Input | Internal Steps |
|----------|-------|---------------|
| `nn.CrossEntropyLoss` | Raw logits | log_softmax + nll_loss |
| `nn.NLLLoss` | Log-probabilities | nll_loss only |

> **Best practice:** Use `nn.CrossEntropyLoss` with raw logits — it's numerically stable and handles the softmax internally. Do **not** apply softmax before `CrossEntropyLoss`.

---

## Choosing the Right Loss Function

### Decision Guide

```
What type of task?

├── REGRESSION (predict a number)
│   ├── Normal errors, no outliers → MSE (nn.MSELoss)
│   ├── Has outliers → MAE (nn.L1Loss)
│   └── Best of both → Huber (nn.HuberLoss)
│
└── CLASSIFICATION (predict a category)
    ├── 2 classes (binary)
    │   ├── Output is probability → nn.BCELoss
    │   └── Output is raw logit → nn.BCEWithLogitsLoss ✓ (preferred)
    │
    └── K classes (multi-class)
        └── Output is raw logits → nn.CrossEntropyLoss ✓ (preferred)
```

### Quick Reference

| Task | Loss Function | Output Activation | PyTorch |
|------|--------------|-------------------|---------|
| Regression | MSE | None (linear) | `nn.MSELoss()` |
| Regression (robust) | Huber | None (linear) | `nn.HuberLoss()` |
| Binary classification | BCE | Sigmoid | `nn.BCEWithLogitsLoss()` |
| Multi-class | Cross-entropy | None (softmax inside loss) | `nn.CrossEntropyLoss()` |

---

## Code: Compute and Compare Loss Functions

Let's put all loss functions side by side and see how they behave:

```python
import torch
import torch.nn as nn

# ─── Regression losses comparison ──────────────────────
print("=" * 55)
print("REGRESSION LOSSES")
print("=" * 55)

y_true = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])

# Different levels of error
predictions = {
    "Perfect":     torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0]),
    "Small error": torch.tensor([1.1, 2.2, 2.8, 4.1, 4.9]),
    "Large error": torch.tensor([2.0, 3.5, 1.0, 6.0, 3.0]),
    "Outlier":     torch.tensor([1.1, 2.1, 3.1, 4.1, 50.0]),
}

mse_fn = nn.MSELoss()
mae_fn = nn.L1Loss()
huber_fn = nn.HuberLoss(delta=1.0)

print(f"\n{'Scenario':<14s} │ {'MSE':>8s} │ {'MAE':>8s} │ {'Huber':>8s}")
print("─" * 44)
for name, y_pred in predictions.items():
    mse = mse_fn(y_pred, y_true).item()
    mae = mae_fn(y_pred, y_true).item()
    huber = huber_fn(y_pred, y_true).item()
    print(f"{name:<14s} │ {mse:>8.3f} │ {mae:>8.3f} │ {huber:>8.3f}")


# ─── Classification losses comparison ─────────────────
print(f"\n{'=' * 55}")
print("CLASSIFICATION LOSSES")
print("=" * 55)

# Binary classification scenarios
bce_fn = nn.BCELoss()
print(f"\n{'Scenario':<25s} │ {'BCE':>8s}")
print("─" * 38)

scenarios = [
    ("Correct & confident",   1.0, 0.95),
    ("Correct & uncertain",   1.0, 0.60),
    ("Wrong & uncertain",     1.0, 0.40),
    ("Wrong & confident",     1.0, 0.05),
]

for name, true, pred in scenarios:
    y = torch.tensor([true])
    y_hat = torch.tensor([pred])
    loss = bce_fn(y_hat, y).item()
    print(f"{name:<25s} │ {loss:>8.4f}")


# ─── Multi-class cross-entropy ─────────────────────────
ce_fn = nn.CrossEntropyLoss()
print(f"\n{'Scenario':<25s} │ {'CE':>8s}")
print("─" * 38)

mc_scenarios = [
    ("Correct & confident",   torch.tensor([[5.0, 0.1, 0.1]]), torch.tensor([0])),
    ("Correct & uncertain",   torch.tensor([[1.5, 1.0, 0.8]]), torch.tensor([0])),
    ("Wrong & uncertain",     torch.tensor([[0.8, 1.5, 1.0]]), torch.tensor([0])),
    ("Wrong & confident",     torch.tensor([[0.1, 0.1, 5.0]]), torch.tensor([0])),
]

for name, logits, target in mc_scenarios:
    loss = ce_fn(logits, target).item()
    print(f"{name:<25s} │ {loss:>8.4f}")
```

---

## Code: Complete Training Pipeline

Let's use loss functions in a real training pipeline:

```python
import torch
import torch.nn as nn

torch.manual_seed(42)

# ─── Task 1: Regression ───────────────────────────────
print("=== Regression with MSE Loss ===\n")

# Generate data: y = 2x₁ - 3x₂ + 1 + noise
n = 200
X_reg = torch.randn(n, 2)
y_reg = (2 * X_reg[:, 0] - 3 * X_reg[:, 1] + 1 +
         0.1 * torch.randn(n)).unsqueeze(1)

# Simple regression model
reg_model = nn.Sequential(
    nn.Linear(2, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
)

reg_loss_fn = nn.MSELoss()
reg_optimizer = torch.optim.Adam(reg_model.parameters(), lr=0.01)

for epoch in range(200):
    y_hat = reg_model(X_reg)
    loss = reg_loss_fn(y_hat, y_reg)
    reg_optimizer.zero_grad()
    loss.backward()
    reg_optimizer.step()

    if (epoch + 1) % 50 == 0:
        print(f"  Epoch {epoch+1:>3}: MSE = {loss.item():.4f}")


# ─── Task 2: Binary Classification ────────────────────
print("\n=== Binary Classification with BCE Loss ===\n")

# Generate data: 2 clusters
X_bin = torch.randn(200, 2)
y_bin = ((X_bin[:, 0] + X_bin[:, 1]) > 0).float().unsqueeze(1)

bin_model = nn.Sequential(
    nn.Linear(2, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
)

bin_loss_fn = nn.BCEWithLogitsLoss()
bin_optimizer = torch.optim.Adam(bin_model.parameters(), lr=0.01)

for epoch in range(200):
    logits = bin_model(X_bin)
    loss = bin_loss_fn(logits, y_bin)
    bin_optimizer.zero_grad()
    loss.backward()
    bin_optimizer.step()

    if (epoch + 1) % 50 == 0:
        preds = (torch.sigmoid(logits) > 0.5).float()
        acc = (preds == y_bin).float().mean()
        print(f"  Epoch {epoch+1:>3}: BCE = {loss.item():.4f}, "
              f"Accuracy = {acc.item():.1%}")


# ─── Task 3: Multi-class Classification ───────────────
print("\n=== Multi-class Classification with CE Loss ===\n")

# Generate 3-class data
X_mc = torch.randn(300, 2)
boundaries = X_mc[:, 0] + X_mc[:, 1]
y_mc = torch.zeros(300, dtype=torch.long)
y_mc[boundaries > 0.5] = 1
y_mc[boundaries > 1.5] = 2

mc_model = nn.Sequential(
    nn.Linear(2, 32),
    nn.ReLU(),
    nn.Linear(32, 3),  # 3 classes → 3 output logits
)

mc_loss_fn = nn.CrossEntropyLoss()
mc_optimizer = torch.optim.Adam(mc_model.parameters(), lr=0.01)

for epoch in range(200):
    logits = mc_model(X_mc)
    loss = mc_loss_fn(logits, y_mc)
    mc_optimizer.zero_grad()
    loss.backward()
    mc_optimizer.step()

    if (epoch + 1) % 50 == 0:
        preds = logits.argmax(dim=1)
        acc = (preds == y_mc).float().mean()
        print(f"  Epoch {epoch+1:>3}: CE = {loss.item():.4f}, "
              f"Accuracy = {acc.item():.1%}")
```

---

## Summary

| Loss Function | Formula | Task | PyTorch |
|--------------|---------|------|---------|
| **MSE** | $\frac{1}{n}\sum(y - \hat{y})^2$ | Regression | `nn.MSELoss()` |
| **MAE** | $\frac{1}{n}\sum\|y - \hat{y}\|$ | Regression (robust) | `nn.L1Loss()` |
| **Huber** | MSE for small errors, MAE for large | Regression (balanced) | `nn.HuberLoss()` |
| **BCE** | $-[y\log\hat{y} + (1-y)\log(1-\hat{y})]$ | Binary classification | `nn.BCEWithLogitsLoss()` |
| **Cross-Entropy** | $-\log(\hat{y}_c)$ | Multi-class classification | `nn.CrossEntropyLoss()` |

**Rules of thumb:**
- Regression → start with MSE; use Huber if outliers exist
- Binary classification → use `BCEWithLogitsLoss` (numerically stable)
- Multi-class → use `CrossEntropyLoss` with raw logits (handles softmax internally)

---

## What's Next?

Now you know how to measure error with loss functions. But how does the network **reduce** that error? In the next lesson, we'll learn **backpropagation** — the algorithm that computes gradients and lets the network learn from its mistakes.
