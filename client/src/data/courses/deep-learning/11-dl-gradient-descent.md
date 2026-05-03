---
title: Gradient Descent
---

# Gradient Descent

**Gradient descent** is the algorithm that makes neural networks learn. It's how we find the parameters (weights and biases) that minimize the loss function — turning a randomly-initialized network into one that makes accurate predictions.

In this lesson, you'll understand the intuition behind gradient descent, learn its variants, and implement it from scratch in Python.

---

## The Optimization Problem

After computing the loss, we need to **adjust** the network's parameters to make the loss smaller. But a neural network can have millions of parameters — how do we know which direction to move each one?

```
The Goal:  Find θ* = argmin L(θ)
                        θ

Where:
  θ = all parameters (weights + biases)
  L = loss function
  θ* = optimal parameters (lowest loss)
```

Think of it like being blindfolded on a hilly landscape, trying to find the lowest valley. You can't see the terrain, but you **can feel the slope** under your feet.

---

## The Gradient

The **gradient** $\nabla_\theta L$ is a vector of partial derivatives — one for each parameter:

$$\nabla_\theta L = \begin{bmatrix} \frac{\partial L}{\partial \theta_1} \\ \frac{\partial L}{\partial \theta_2} \\ \vdots \\ \frac{\partial L}{\partial \theta_n} \end{bmatrix}$$

### What Does the Gradient Tell Us?

| Property | Meaning |
|----------|---------|
| **Direction** | Points toward the steepest **ascent** (uphill) |
| **Magnitude** | How steep the slope is |
| **Negative gradient** | Points toward steepest **descent** (downhill) |

> **Key insight:** To minimize loss, we move in the **opposite** direction of the gradient.

### Intuition: The Ball on a Hill

```
Loss
 ▲
 │    ·  ← start here (random init)
 │   · ·
 │  ·   ·       gradient points ↗ (uphill)
 │ ·     ·      we go ↙ (downhill)
 │·       ·
 │         ·  ← we want to reach here (minimum)
 │          ·
 └──────────────→ θ (parameter)
```

---

## The Update Rule

The core of gradient descent is one simple equation:

$$\theta \leftarrow \theta - \alpha \nabla_\theta L$$

Breaking it down:

| Symbol | Meaning | Role |
|--------|---------|------|
| $\theta$ | Parameters | What we're updating |
| $\alpha$ | Learning rate | How big a step we take |
| $\nabla_\theta L$ | Gradient of loss | Direction of steepest ascent |
| $-\alpha \nabla_\theta L$ | Update | Step in the descent direction |

### One Update Step

```python
# Pseudocode for one gradient descent step
for each parameter θ:
    gradient = compute_gradient(loss, θ)
    θ = θ - learning_rate * gradient
```

---

## Learning Rate $\alpha$

The learning rate is the **single most important hyperparameter** in deep learning. It controls how big each step is.

### Too Small vs. Too Large

```
Learning Rate Too Small:          Learning Rate Too Large:
Loss                              Loss
 ▲  · · · · · · · · · ·           ▲  ·         ·
 │                      ·         │    ·     ·     ·
 │                       ·        │      · ·         ·  ← diverges!
 │                        ·       │
 │                         ·      │
 └──────────────────────→ steps   └──────────────────────→ steps
 (converges... eventually)         (never converges)


Good Learning Rate:
Loss
 ▲  ·
 │    ·
 │      ·
 │        · · ·
 │              · · · · · ← converged!
 └──────────────────────→ steps
```

| Learning Rate | Behavior |
|---------------|----------|
| **Too small** ($\alpha = 0.00001$) | Very slow convergence, might get stuck |
| **Too large** ($\alpha = 10$) | Overshoots minimum, loss explodes |
| **Just right** ($\alpha = 0.01$) | Smooth, steady decrease in loss |

> **Typical starting values:** 0.1, 0.01, 0.001, or 0.0001 — depends on the problem and optimizer.

---

## Batch Gradient Descent

The "vanilla" version: compute the gradient using **all** training samples.

$$\nabla_\theta L = \frac{1}{N}\sum_{i=1}^{N} \nabla_\theta L_i$$

### Algorithm

```
repeat until convergence:
    gradient = (1/N) * sum of gradients over ALL N samples
    θ = θ - α * gradient
```

### Pros and Cons

| Pros | Cons |
|------|------|
| Stable gradient estimate | Very slow for large datasets |
| Smooth convergence | Must fit entire dataset in memory |
| Guaranteed descent direction | Redundant computation on similar samples |

### When to Use

- Small datasets (< 10,000 samples)
- When you need the most stable updates
- Convex problems

---

## Stochastic Gradient Descent (SGD)

Compute the gradient using **one** random sample at a time:

$$\nabla_\theta L \approx \nabla_\theta L_i \quad \text{(single sample } i \text{)}$$

### Algorithm

```
repeat until convergence:
    shuffle the training data
    for each sample (x_i, y_i):
        gradient = compute_gradient(loss(x_i, y_i), θ)
        θ = θ - α * gradient
```

### Pros and Cons

| Pros | Cons |
|------|------|
| Very fast updates | Noisy gradient — high variance |
| Can escape local minima (noise helps!) | Doesn't converge smoothly |
| Low memory requirement | Can't leverage vectorized operations |

### SGD Noise is Actually Helpful!

The randomness in SGD acts like a form of exploration:

```
Loss Surface:

Batch GD:     ──────→ gets stuck in local minimum
                 ↘
              ·····●·····      ·····●·····
              (local min)      (global min)

SGD:          ─→ ←─ →→→ ──→ bounces past local min!
                              ↘
              ·········      ·····●·····
              (escaped!)     (found global min)
```

---

## Mini-Batch Gradient Descent

The **best of both worlds**: compute the gradient using a **small batch** of $B$ samples.

$$\nabla_\theta L \approx \frac{1}{B}\sum_{i=1}^{B} \nabla_\theta L_i$$

### Algorithm

```
repeat until convergence:
    shuffle the training data
    split data into mini-batches of size B
    for each mini-batch:
        gradient = average gradient over B samples
        θ = θ - α * gradient
```

### Choosing Batch Size

| Batch Size | Behavior |
|------------|----------|
| **1** | Pure SGD — maximum noise |
| **32** | Common default — good balance |
| **64, 128, 256** | Also popular — more stable |
| **N (all data)** | Batch GD — no noise |

> **Rule of thumb:** Start with batch size 32 or 64. Use powers of 2 for GPU efficiency.

### Why Mini-Batch Wins

| Property | Batch GD | SGD | Mini-Batch |
|----------|----------|-----|------------|
| **Speed** | Slow | Fast updates | Fast |
| **Stability** | Very stable | Very noisy | Moderate |
| **GPU utilization** | Good | Poor | Excellent |
| **Memory** | High | Low | Moderate |
| **Generalization** | Can overfit | Good | Good |

---

## Epochs, Iterations, and Batch Size

These terms are often confused — let's clarify:

$$\text{iterations per epoch} = \frac{N}{B} = \frac{\text{dataset size}}{\text{batch size}}$$

### Example

- Dataset: 10,000 samples
- Batch size: 100

Then:
- **1 iteration** = process 1 batch (100 samples), update parameters once
- **1 epoch** = process ALL batches (100 iterations), see every sample once
- **10 epochs** = go through entire dataset 10 times (1,000 total updates)

---

## Convergence Visualization

A typical training loss curve:

```
Loss
 ▲
 │·
 │ ··
 │   ···
 │      ····
 │          ·····
 │               ··········
 │                         ·············── converged
 │
 └─────────────────────────────────────→ Epochs
   1    5    10   15   20   25   30
```

### Reading Loss Curves

| Pattern | Diagnosis |
|---------|-----------|
| Loss decreases smoothly | Good learning rate |
| Loss decreases then plateaus | May need LR reduction |
| Loss oscillates wildly | Learning rate too high |
| Loss barely decreases | Learning rate too low |
| Loss increases | Learning rate way too high, or bug |

---

## Local Minima and Saddle Points

Real loss surfaces aren't simple bowls — they have complex geometry.

### Local Minima

A point where loss is lower than all nearby points, but **not** the global minimum:

$$\nabla L = 0 \quad \text{and} \quad \frac{\partial^2 L}{\partial \theta^2} > 0 \quad \text{(all directions curve up)}$$

```
Loss
 ▲
 │  ·       ·
 │   ·     · ·
 │    ·   ·   ·       ·
 │     ·●·     ·     · ·
 │   local      ·   ·   ·
 │   minimum     ·●·     ·
 │             global     ·
 │             minimum
 └──────────────────────────→ θ
```

### Saddle Points

A point where the gradient is zero but it's a minimum in some directions and a maximum in others:

$$\nabla L = 0 \quad \text{but some} \quad \frac{\partial^2 L}{\partial \theta_i^2} > 0 \quad \text{and some} < 0$$

```
        dim 2: goes DOWN
             ↓
    ·  ·  ·  ·  ·  ·  ·
     · · ·   ·   · · ·
      ···    ●    ···     ← saddle point
     · · ·   ·   · · ·        (flat spot — gradient ≈ 0)
    ·  ·  ·  ·  ·  ·  ·
             ↑
        dim 1: goes UP
```

> **In high dimensions:** Saddle points are far more common than local minima. Modern deep learning mostly deals with saddle points, not true local minima.

### Why It's Not As Bad As It Sounds

In a network with millions of parameters:
- For a true local minimum, ALL dimensions must curve up
- The probability of this decreases exponentially with dimension count
- Most "flat" regions are saddle points — SGD noise helps escape them

---

## Code: Gradient Descent from Scratch

Let's implement all three variants and visualize their behavior:

```python
import torch
import matplotlib.pyplot as plt

# --- Define a simple loss landscape ---
# f(x) = x^4 - 3x^3 + 2 (has a local min and global min)
def loss_fn(x):
    return x**4 - 3*x**3 + 2

def gradient_fn(x):
    return 4*x**3 - 9*x**2

# --- Batch Gradient Descent ---
def batch_gd(start, lr, num_steps):
    x = start
    history = [x]
    for _ in range(num_steps):
        grad = gradient_fn(x)
        x = x - lr * grad
        history.append(x)
    return history

# --- SGD (simulated with noise) ---
def sgd(start, lr, num_steps, noise_std=0.5):
    x = start
    history = [x]
    for _ in range(num_steps):
        # True gradient + noise (simulates single-sample variance)
        grad = gradient_fn(x) + torch.randn(1).item() * noise_std
        x = x - lr * grad
        history.append(x)
    return history

# --- Mini-Batch GD (moderate noise) ---
def mini_batch_gd(start, lr, num_steps, noise_std=0.2):
    x = start
    history = [x]
    for _ in range(num_steps):
        grad = gradient_fn(x) + torch.randn(1).item() * noise_std
        x = x - lr * grad
        history.append(x)
    return history

# --- Run all three ---
start = -0.5
lr = 0.01
steps = 100

batch_hist = batch_gd(start, lr, steps)
sgd_hist = sgd(start, lr, steps)
mini_hist = mini_batch_gd(start, lr, steps)

# --- Plot loss over steps ---
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Left: Loss over steps
for hist, label, color in [
    (batch_hist, "Batch GD", "blue"),
    (sgd_hist, "SGD", "red"),
    (mini_hist, "Mini-Batch GD", "green"),
]:
    losses = [loss_fn(x) for x in hist]
    axes[0].plot(losses, label=label, color=color, alpha=0.8)

axes[0].set_xlabel("Steps")
axes[0].set_ylabel("Loss")
axes[0].set_title("Loss Curves: GD Variants")
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Right: Path on loss landscape
x_range = torch.linspace(-1, 3.5, 200)
y_range = [loss_fn(x.item()) for x in x_range]
axes[1].plot(x_range, y_range, "k-", linewidth=2, label="Loss surface")

for hist, label, color in [
    (batch_hist, "Batch GD", "blue"),
    (sgd_hist, "SGD", "red"),
    (mini_hist, "Mini-Batch GD", "green"),
]:
    x_vals = hist[::5]  # plot every 5th point
    y_vals = [loss_fn(x) for x in x_vals]
    axes[1].scatter(x_vals, y_vals, color=color, s=20, alpha=0.6, label=label)

axes[1].set_xlabel("θ (parameter)")
axes[1].set_ylabel("Loss")
axes[1].set_title("Path on Loss Landscape")
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("gradient_descent_comparison.png", dpi=100)
plt.show()

print(f"Batch GD final loss:      {loss_fn(batch_hist[-1]):.4f}")
print(f"SGD final loss:           {loss_fn(sgd_hist[-1]):.4f}")
print(f"Mini-Batch GD final loss: {loss_fn(mini_hist[-1]):.4f}")
```

---

## Code: Learning Rate Comparison

See what happens with different learning rates:

```python
import torch
import matplotlib.pyplot as plt

def loss_fn(x):
    return x**2 + 0.5 * torch.sin(5 * x)

def gradient_fn(x):
    return 2*x + 0.5 * 5 * torch.cos(5 * x)

# Try different learning rates
learning_rates = [0.001, 0.01, 0.1, 0.5]
start = torch.tensor(3.0)
num_steps = 50

plt.figure(figsize=(12, 5))

for i, lr in enumerate(learning_rates):
    x = start.clone()
    losses = []

    for step in range(num_steps):
        loss = loss_fn(x)
        losses.append(loss.item())
        grad = gradient_fn(x)
        x = x - lr * grad

    plt.subplot(1, 2, 1)
    plt.plot(losses, label=f"lr={lr}")

plt.subplot(1, 2, 1)
plt.xlabel("Steps")
plt.ylabel("Loss")
plt.title("Effect of Learning Rate")
plt.legend()
plt.grid(True, alpha=0.3)
plt.yscale("log")

# Show the update paths
plt.subplot(1, 2, 2)
x_range = torch.linspace(-4, 4, 200)
y_range = loss_fn(x_range)
plt.plot(x_range, y_range, "k-", linewidth=2, alpha=0.5)

for lr, color in zip([0.01, 0.1], ["blue", "orange"]):
    x = start.clone()
    path_x, path_y = [x.item()], [loss_fn(x).item()]
    for _ in range(20):
        grad = gradient_fn(x)
        x = x - lr * grad
        path_x.append(x.item())
        path_y.append(loss_fn(x).item())
    plt.plot(path_x, path_y, "o-", markersize=4, label=f"lr={lr}", color=color)

plt.xlabel("θ")
plt.ylabel("Loss")
plt.title("Paths on Loss Surface")
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("learning_rate_effect.png", dpi=100)
plt.show()
```

---

## Code: Mini-Batch GD on Real Data (PyTorch)

Now let's see gradient descent in action with a real PyTorch training loop:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# --- Create synthetic regression data ---
torch.manual_seed(42)
X = torch.randn(1000, 5)  # 1000 samples, 5 features
true_weights = torch.tensor([2.0, -1.0, 0.5, 3.0, -2.0])
y = X @ true_weights + 0.1 * torch.randn(1000)  # add noise

dataset = TensorDataset(X, y)

# --- Simple linear model ---
model = nn.Linear(5, 1, bias=False)

# --- Training with different batch sizes ---
batch_sizes = [1, 32, 128, 1000]
results = {}

for batch_size in batch_sizes:
    # Reset model
    model = nn.Linear(5, 1, bias=False)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    criterion = nn.MSELoss()
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    losses = []
    for epoch in range(20):
        epoch_loss = 0.0
        for X_batch, y_batch in dataloader:
            pred = model(X_batch).squeeze()
            loss = criterion(pred, y_batch)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        avg_loss = epoch_loss / len(dataloader)
        losses.append(avg_loss)

    results[batch_size] = losses
    print(f"Batch size {batch_size:>4}: final loss = {losses[-1]:.4f}")

# --- Plot ---
import matplotlib.pyplot as plt

plt.figure(figsize=(8, 5))
for bs, losses in results.items():
    label = {1: "SGD (bs=1)", 1000: "Batch GD (bs=1000)"}.get(bs, f"Mini-batch (bs={bs})")
    plt.plot(losses, label=label, linewidth=2)

plt.xlabel("Epoch")
plt.ylabel("Loss (MSE)")
plt.title("Mini-Batch Gradient Descent: Effect of Batch Size")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("batch_size_comparison.png", dpi=100)
plt.show()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Gradient** | Direction of steepest ascent |
| **Update rule** | $\theta \leftarrow \theta - \alpha \nabla_\theta L$ |
| **Learning rate** | Controls step size — too small is slow, too large diverges |
| **Batch GD** | Uses all data — stable but slow |
| **SGD** | Uses 1 sample — fast but noisy |
| **Mini-batch GD** | Uses B samples — best of both worlds |
| **Local minima** | Rare in high dimensions |
| **Saddle points** | Common — SGD noise helps escape them |

### What's Next?

Now you know **how** we update parameters, but **how do we compute the gradients** for each layer? That's the job of **backpropagation** — the topic of the next lesson.
