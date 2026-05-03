---
title: Optimizers
---

# Optimizers

Plain SGD works, but it's slow and struggles with complex loss landscapes. **Optimizers** are smarter update rules that adapt learning rates, add momentum, and converge faster.

In this lesson, you'll learn the most important optimizers — from SGD with momentum to Adam — understand their math, and compare them in PyTorch.

---

## Why Do We Need Better Optimizers?

Vanilla SGD has several problems:

```
Problem 1: RAVINES                    Problem 2: SADDLE POINTS
(loss changes fast in one             (gradient ≈ 0, stuck!)
direction, slow in another)

Loss surface (top view):              Loss surface:
  ──────────────────→ fast dir             │
  │ · · · · · · · ·                        ↓
  │  · · · · · · ·                    ──── ● ────
  ↓   · · ● · · ·  ← oscillates!          ↑
slow    · · · · ·                          │
dir      · · · ·
          · · ·
           ●  ← minimum
```

| Problem | What Happens | Solution |
|---------|-------------|----------|
| Ravines/valleys | SGD oscillates across the valley | Momentum |
| Same LR for all params | Some need big steps, others small | Adaptive LR |
| Saddle points | Gradient ≈ 0, progress stalls | Momentum carries through |
| Noisy gradients | Updates jump around | Averaging (momentum) |

---

## SGD with Momentum

**Idea:** Accumulate a running average of past gradients (like a ball rolling downhill with inertia).

### Update Rule

$$v_t = \beta v_{t-1} + \nabla_\theta L$$
$$\theta = \theta - \alpha v_t$$

Where:
- $v_t$ = velocity (accumulated gradient)
- $\beta$ = momentum coefficient (typically 0.9)
- $\alpha$ = learning rate

### Intuition

```
Without momentum:              With momentum (β = 0.9):
  ↗ ↙ ↗ ↙ ↗ → ●              ──→ ──→ ──→ → ●
  (oscillates)                   (smooth, fast convergence)
```

The velocity accumulates in the **consistent** direction and cancels out oscillations:
- Consistent direction: gradients add up → faster
- Oscillating direction: gradients cancel → damped

### Why β = 0.9?

The velocity $v_t$ is approximately the average of the last $\frac{1}{1-\beta}$ gradients:
- $\beta = 0.9$: average of last ~10 gradients
- $\beta = 0.99$: average of last ~100 gradients
- $\beta = 0.5$: average of last ~2 gradients

---

## Nesterov Momentum

**Idea:** Look ahead! Compute the gradient at the position where momentum would take us, then correct.

### Update Rule

$$v_t = \beta v_{t-1} + \nabla_\theta L(\theta - \alpha \beta v_{t-1})$$
$$\theta = \theta - \alpha v_t$$

### Intuition

```
Standard momentum:                Nesterov momentum:
  ← current position              ← current position
     compute gradient here           │
                                     ↓ (momentum step first)
                                  ← lookahead position
                                     compute gradient here
                                     ↓ (correct)
                                  ← actual step (smarter!)
```

Nesterov "looks ahead" to where the momentum is taking us, then adjusts. This gives a more accurate gradient direction and often converges slightly faster.

---

## AdaGrad (Adaptive Gradient)

**Idea:** Give each parameter its own learning rate — parameters that have received large gradients in the past get smaller learning rates.

### Update Rule

$$G_t = G_{t-1} + (\nabla_\theta L)^2$$
$$\theta = \theta - \frac{\alpha}{\sqrt{G_t} + \epsilon} \nabla_\theta L$$

Where:
- $G_t$ = sum of squared gradients (per parameter)
- $\epsilon$ = small constant to avoid division by zero ($10^{-8}$)

### Properties

| Property | Detail |
|----------|--------|
| **Adaptive** | Frequent features → smaller LR; rare features → larger LR |
| **Good for** | Sparse data (NLP, recommendations) |
| **Problem** | $G_t$ only grows → LR monotonically decreases → eventually stops learning! |

---

## RMSProp (Root Mean Square Propagation)

**Idea:** Fix AdaGrad's ever-shrinking learning rate by using an exponential moving average of squared gradients instead of the sum.

### Update Rule

$$E[g^2]_t = \beta E[g^2]_{t-1} + (1-\beta)(\nabla_\theta L)^2$$
$$\theta = \theta - \frac{\alpha}{\sqrt{E[g^2]_t} + \epsilon} \nabla_\theta L$$

Where:
- $E[g^2]_t$ = exponential moving average of squared gradients
- $\beta = 0.9$ (decay rate, typically)

### Why It's Better Than AdaGrad

```
AdaGrad:                          RMSProp:
  G_t always increases            E[g²]_t is a moving average
  ↓                               ↓
  LR → 0 (dies!)                  LR adapts but stays alive
```

RMSProp "forgets" old gradients, so the effective learning rate doesn't shrink to zero.

---

## Adam (Adaptive Moment Estimation)

**Adam** combines **momentum** (first moment) with **RMSProp** (second moment). It's the most popular optimizer in deep learning.

### Update Rule

$$m_t = \beta_1 m_{t-1} + (1 - \beta_1) \nabla_\theta L \quad \text{(first moment: mean of gradients)}$$
$$v_t = \beta_2 v_{t-1} + (1 - \beta_2) (\nabla_\theta L)^2 \quad \text{(second moment: variance of gradients)}$$

**Bias correction** (important at start when $m$ and $v$ are near zero):

$$\hat{m}_t = \frac{m_t}{1 - \beta_1^t}$$
$$\hat{v}_t = \frac{v_t}{1 - \beta_2^t}$$

**Update:**

$$\theta = \theta - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$

### Default Hyperparameters

| Hyperparameter | Default Value | Meaning |
|----------------|---------------|---------|
| $\alpha$ | 0.001 | Learning rate |
| $\beta_1$ | 0.9 | Momentum decay (first moment) |
| $\beta_2$ | 0.999 | RMSProp decay (second moment) |
| $\epsilon$ | $10^{-8}$ | Numerical stability |

> **Adam's defaults work well for most problems.** This is a big reason why it's so popular — less tuning needed.

### Why Bias Correction?

At $t=1$ with $\beta_1 = 0.9$:
- $m_1 = 0.9 \cdot 0 + 0.1 \cdot g_1 = 0.1 \cdot g_1$ (biased toward 0!)
- $\hat{m}_1 = \frac{0.1 \cdot g_1}{1 - 0.9^1} = \frac{0.1 \cdot g_1}{0.1} = g_1$ (corrected!)

Without correction, early updates would be much too small.

---

## AdamW (Adam with Decoupled Weight Decay)

**Problem with Adam + L2 regularization:** In Adam, L2 regularization gets scaled by the adaptive learning rate, reducing its effect on parameters with large gradients.

**AdamW** separates weight decay from the gradient-based update:

### Update Rule

$$\theta = \theta - \alpha \left( \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} + \lambda \theta \right)$$

Where $\lambda$ is the weight decay coefficient.

### Adam vs. AdamW

| Aspect | Adam + L2 | AdamW |
|--------|-----------|-------|
| Weight decay | Scaled by adaptive LR | Applied uniformly |
| Regularization effect | Inconsistent | Consistent |
| Performance | Good | Often slightly better |
| Default in modern models | No | Yes (PyTorch default since v1.12) |

> **Use AdamW instead of Adam** for most applications.

---

## Optimizer Comparison Table

| Optimizer | Momentum | Adaptive LR | Key Advantage | When to Use |
|-----------|----------|-------------|---------------|-------------|
| **SGD** | No | No | Simple, good generalization | Well-tuned large-scale training |
| **SGD + Momentum** | Yes | No | Smooth convergence | ConvNets with LR scheduling |
| **Nesterov** | Yes (lookahead) | No | Slightly better than momentum | Same as momentum |
| **AdaGrad** | No | Yes | Good for sparse data | NLP with sparse features |
| **RMSProp** | No | Yes | Fixes AdaGrad decay | RNNs, non-stationary objectives |
| **Adam** | Yes | Yes | Works out of the box | Default choice for most tasks |
| **AdamW** | Yes | Yes | Proper weight decay | Modern default, especially transformers |

### Quick Decision Guide

```
Start here: Adam (lr=0.001) or AdamW (lr=0.001, wd=0.01)
              │
              ├── Works well? → Done!
              │
              ├── Want better generalization?
              │     → Switch to SGD + momentum + LR scheduling
              │
              └── Training unstable?
                    → Lower learning rate, try gradient clipping
```

---

## PyTorch Optimizers

### Creating Optimizers

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 1),
)

# SGD with momentum
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)

# SGD with Nesterov momentum
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9, nesterov=True)

# Adam
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# AdamW (recommended)
optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

# RMSProp
optimizer = torch.optim.RMSprop(model.parameters(), lr=0.001, alpha=0.9)
```

### Using Optimizers in Training

```python
for epoch in range(num_epochs):
    for X_batch, y_batch in dataloader:
        # Forward
        y_pred = model(X_batch)
        loss = criterion(y_pred, y_batch)

        # Backward + Update
        optimizer.zero_grad()   # MUST clear old gradients
        loss.backward()         # Compute gradients
        optimizer.step()        # Update parameters using optimizer rule
```

### Per-Parameter Options

Different learning rates for different layers:

```python
optimizer = torch.optim.Adam([
    {"params": model[0].parameters(), "lr": 0.001},   # first layer
    {"params": model[2].parameters(), "lr": 0.0001},  # last layer (slower)
])
```

---

## Code: Compare Optimizers on the Same Problem

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

# --- Create a challenging dataset ---
torch.manual_seed(42)
X = torch.randn(2000, 10)
# Non-linear target function
y = (torch.sin(X[:, 0]) * 3 + X[:, 1]**2 - X[:, 2] * X[:, 3] +
     torch.cos(X[:, 4]) * 2).unsqueeze(1)
y += 0.1 * torch.randn_like(y)

dataset = TensorDataset(X, y)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# --- Define model architecture ---
def create_model():
    torch.manual_seed(42)  # Same init for fair comparison
    return nn.Sequential(
        nn.Linear(10, 64),
        nn.ReLU(),
        nn.Linear(64, 32),
        nn.ReLU(),
        nn.Linear(32, 1),
    )

# --- Optimizers to compare ---
optimizers_config = {
    "SGD (lr=0.01)": lambda m: torch.optim.SGD(m.parameters(), lr=0.01),
    "SGD + Momentum": lambda m: torch.optim.SGD(m.parameters(), lr=0.01, momentum=0.9),
    "RMSProp": lambda m: torch.optim.RMSprop(m.parameters(), lr=0.001),
    "Adam": lambda m: torch.optim.Adam(m.parameters(), lr=0.001),
    "AdamW": lambda m: torch.optim.AdamW(m.parameters(), lr=0.001, weight_decay=0.01),
}

# --- Train each optimizer ---
results = {}
num_epochs = 40

for name, opt_fn in optimizers_config.items():
    model = create_model()
    optimizer = opt_fn(model)
    criterion = nn.MSELoss()
    losses = []

    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for X_batch, y_batch in dataloader:
            y_pred = model(X_batch)
            loss = criterion(y_pred, y_batch)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        avg_loss = epoch_loss / len(dataloader)
        losses.append(avg_loss)

    results[name] = losses
    print(f"{name:20s}: final loss = {losses[-1]:.4f}")

# --- Plot comparison ---
plt.figure(figsize=(10, 6))
colors = ["red", "orange", "purple", "blue", "green"]

for (name, losses), color in zip(results.items(), colors):
    plt.plot(losses, label=name, linewidth=2, color=color)

plt.xlabel("Epoch", fontsize=12)
plt.ylabel("Loss (MSE)", fontsize=12)
plt.title("Optimizer Comparison on Non-Linear Regression", fontsize=14)
plt.legend(fontsize=11)
plt.grid(True, alpha=0.3)
plt.yscale("log")
plt.tight_layout()
plt.savefig("optimizer_comparison.png", dpi=100)
plt.show()
```

---

## Code: Implementing Optimizers from Scratch

Understanding the math by building them yourself:

```python
import torch

# --- Simple quadratic: f(x) = x1² + 10*x2² ---
# This is a "ravine" — steep in x2, shallow in x1
def loss_fn(params):
    return params[0]**2 + 10 * params[1]**2

def gradient_fn(params):
    return torch.tensor([2 * params[0], 20 * params[1]])

# --- SGD with Momentum (from scratch) ---
def sgd_momentum(start, lr, beta, num_steps):
    params = start.clone()
    velocity = torch.zeros_like(params)
    history = [params.clone()]

    for _ in range(num_steps):
        grad = gradient_fn(params)
        velocity = beta * velocity + grad
        params = params - lr * velocity
        history.append(params.clone())

    return history

# --- Adam (from scratch) ---
def adam(start, lr, beta1, beta2, eps, num_steps):
    params = start.clone()
    m = torch.zeros_like(params)  # first moment
    v = torch.zeros_like(params)  # second moment
    history = [params.clone()]

    for t in range(1, num_steps + 1):
        grad = gradient_fn(params)

        # Update moments
        m = beta1 * m + (1 - beta1) * grad
        v = beta2 * v + (1 - beta2) * grad**2

        # Bias correction
        m_hat = m / (1 - beta1**t)
        v_hat = v / (1 - beta2**t)

        # Update params
        params = params - lr * m_hat / (torch.sqrt(v_hat) + eps)
        history.append(params.clone())

    return history

# --- Run and compare paths ---
start = torch.tensor([5.0, 5.0])
steps = 50

sgd_path = sgd_momentum(start, lr=0.02, beta=0.9, num_steps=steps)
adam_path = adam(start, lr=0.5, beta1=0.9, beta2=0.999, eps=1e-8, num_steps=steps)

# --- Visualize on contour plot ---
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(8, 6))

# Contour plot
x1 = np.linspace(-6, 6, 100)
x2 = np.linspace(-6, 6, 100)
X1, X2 = np.meshgrid(x1, x2)
Z = X1**2 + 10 * X2**2

ax.contour(X1, X2, Z, levels=20, cmap="Blues", alpha=0.6)
ax.contourf(X1, X2, Z, levels=20, cmap="Blues", alpha=0.2)

# Plot paths
sgd_arr = torch.stack(sgd_path).numpy()
adam_arr = torch.stack(adam_path).numpy()

ax.plot(sgd_arr[:, 0], sgd_arr[:, 1], "ro-", markersize=3, linewidth=1.5,
        label="SGD + Momentum", alpha=0.8)
ax.plot(adam_arr[:, 0], adam_arr[:, 1], "g^-", markersize=3, linewidth=1.5,
        label="Adam", alpha=0.8)

ax.plot(0, 0, "k*", markersize=15, label="Minimum")
ax.set_xlabel("x₁")
ax.set_ylabel("x₂")
ax.set_title("Optimizer Paths on Ravine Loss Surface")
ax.legend(fontsize=11)
ax.set_xlim(-6, 6)
ax.set_ylim(-6, 6)
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("optimizer_paths.png", dpi=100)
plt.show()

# --- Print final losses ---
print(f"SGD + Momentum final loss: {loss_fn(sgd_path[-1]):.6f}")
print(f"Adam final loss:           {loss_fn(adam_path[-1]):.6f}")
```

---

## Summary

| Optimizer | Update Rule | Key Idea |
|-----------|------------|----------|
| **SGD** | $\theta - \alpha g$ | Plain gradient step |
| **Momentum** | $v = \beta v + g$; $\theta - \alpha v$ | Accumulate velocity |
| **Nesterov** | Lookahead gradient | Correct before stepping |
| **AdaGrad** | $\theta - \frac{\alpha}{\sqrt{G}} g$ | Per-param LR (shrinks) |
| **RMSProp** | $\theta - \frac{\alpha}{\sqrt{E[g^2]}} g$ | Moving avg fixes AdaGrad |
| **Adam** | Momentum + RMSProp + bias correction | Best of all worlds |
| **AdamW** | Adam + decoupled weight decay | Modern standard |

### Practical Recommendations

1. **Default:** Start with AdamW (lr=0.001, weight_decay=0.01)
2. **Computer vision:** SGD + momentum (lr=0.1) with cosine LR schedule often generalizes better
3. **NLP/Transformers:** AdamW with warm-up
4. **If Adam doesn't converge:** Lower the learning rate

### What's Next?

Adam picks a good learning rate automatically, but you can do even better by **scheduling** the learning rate over training. That's the topic of the next lesson.
