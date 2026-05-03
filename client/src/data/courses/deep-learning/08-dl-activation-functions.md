---
title: Activation Functions
---

# Activation Functions

Activation functions are the **secret ingredient** that give neural networks their power. Without them, a network with 100 layers would be no more powerful than a single layer. In this lesson, you'll understand why activation functions matter, learn the most important ones, and implement them all in PyTorch.

---

## Why Do We Need Activation Functions?

### The Problem: Without Activation Functions

Consider two linear layers applied in sequence:

$$z^{[1]} = W^{[1]} x + b^{[1]}$$

$$z^{[2]} = W^{[2]} z^{[1]} + b^{[2]}$$

Substituting the first into the second:

$$z^{[2]} = W^{[2]}(W^{[1]} x + b^{[1]}) + b^{[2]} = \underbrace{W^{[2]} W^{[1]}}_{\text{single matrix } W'} x + \underbrace{W^{[2]} b^{[1]} + b^{[2]}}_{\text{single bias } b'}$$

$$z^{[2]} = W' x + b'$$

**The entire network collapses to a single linear transformation!** No matter how many layers you stack, without non-linear activation functions, the result is always just a linear function. All those extra layers are completely wasted.

> **Key insight:** Activation functions introduce **non-linearity**, which allows networks to learn complex, curved decision boundaries instead of just straight lines.

### What Activation Functions Do

| Without Activation | With Activation |
|-------------------|----------------|
| Network is just matrix multiplication | Network can learn any function |
| Only linear decision boundaries | Complex, curved boundaries |
| Depth is useless | Each layer adds representational power |
| Can only solve linearly separable problems | Can solve XOR, image recognition, etc. |

---

## Sigmoid

The **sigmoid** function squashes any input into the range $(0, 1)$:

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

### Properties

| Property | Value |
|----------|-------|
| **Range** | $(0, 1)$ |
| **Shape** | S-shaped curve |
| **Output at $x=0$** | $0.5$ |
| **Derivative** | $\sigma'(x) = \sigma(x)(1 - \sigma(x))$ |
| **Max derivative** | $0.25$ (at $x = 0$) |

### When to Use Sigmoid

- **Output layer for binary classification** (probability of class 1)
- Historically used in hidden layers, but **rarely used there today**

### The Vanishing Gradient Problem

The maximum derivative of sigmoid is only $0.25$. During backpropagation, gradients are **multiplied** through layers:

$$\frac{\partial L}{\partial w^{[1]}} = \frac{\partial L}{\partial a^{[n]}} \cdot \underbrace{\sigma' \cdot \sigma' \cdot \sigma' \cdots}_{\text{n layers}}$$

With $n$ layers, the gradient shrinks by a factor of at least $0.25^n$:

| Layers | Max Gradient Factor | Effect |
|--------|-------------------|--------|
| 2 | $0.25^2 = 0.0625$ | Small but workable |
| 5 | $0.25^5 \approx 0.001$ | Very small |
| 10 | $0.25^{10} \approx 10^{-6}$ | Effectively zero |

Gradients become so tiny that early layers **stop learning** — this is the **vanishing gradient problem**.

```python
import torch

# Sigmoid function
def sigmoid(x):
    return 1 / (1 + torch.exp(-x))

# Sigmoid derivative
def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

# Demonstrate vanishing gradient
x = torch.linspace(-6, 6, 13)
print(f"{'x':>5s} │ {'σ(x)':>6s} │ {'σ′(x)':>6s}")
print("─" * 24)
for val in x:
    s = sigmoid(val).item()
    d = sigmoid_derivative(val).item()
    print(f"{val.item():>5.1f} │ {s:>6.4f} │ {d:>6.4f}")
```

---

## Tanh

The **tanh** (hyperbolic tangent) function is a scaled and shifted version of sigmoid:

$$\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}} = 2\sigma(2x) - 1$$

### Properties

| Property | Value |
|----------|-------|
| **Range** | $(-1, 1)$ |
| **Shape** | S-shaped, centered at 0 |
| **Output at $x=0$** | $0$ |
| **Derivative** | $\tanh'(x) = 1 - \tanh^2(x)$ |
| **Max derivative** | $1.0$ (at $x = 0$) |

### Sigmoid vs. Tanh

| Property | Sigmoid | Tanh |
|----------|---------|------|
| **Range** | $(0, 1)$ | $(-1, 1)$ |
| **Centered?** | No (always positive) | Yes (zero-centered) |
| **Max gradient** | $0.25$ | $1.0$ |
| **Vanishing gradients?** | Severe | Less severe, but still present |

> **Why zero-centered matters:** When outputs are always positive (sigmoid), gradients on weights are either all positive or all negative — this causes **zig-zag updates** during optimization. Tanh's zero-centered output avoids this.

```python
import torch

# Tanh vs Sigmoid
x = torch.linspace(-4, 4, 9)
print(f"{'x':>5s} │ {'sigmoid':>8s} │ {'tanh':>8s}")
print("─" * 28)
for val in x:
    s = torch.sigmoid(val).item()
    t = torch.tanh(val).item()
    print(f"{val.item():>5.1f} │ {s:>8.4f} │ {t:>8.4f}")
```

---

## ReLU

**ReLU** (Rectified Linear Unit) is the most popular activation function in deep learning:

$$f(x) = \max(0, x)$$

It's beautifully simple: pass positive values through, set negative values to zero.

### Properties

| Property | Value |
|----------|-------|
| **Range** | $[0, \infty)$ |
| **Shape** | Linear for $x > 0$, zero for $x \leq 0$ |
| **Derivative** | $1$ if $x > 0$, $0$ if $x < 0$ |
| **Computation** | Extremely fast (just a comparison) |

### Why ReLU Dominates

| Advantage | Explanation |
|-----------|------------|
| **No vanishing gradient** | Gradient is either 0 or 1 — never shrinks |
| **Sparse activation** | ~50% of neurons output zero → efficient |
| **Fast computation** | Just `max(0, x)` — no exponentials |
| **Empirically works** | Trains faster and better than sigmoid/tanh |

### The Dying ReLU Problem

When a neuron's input is always negative, its output is always 0. Since the gradient is also 0, the weights **never update** — the neuron is "dead."

```
Dying ReLU:
  If weights push z < 0 for all inputs:
    output = max(0, negative) = 0   (always)
    gradient = 0                     (always)
    weight update = 0                (always)
    → Neuron is permanently dead!
```

This can happen when:
- The learning rate is too large (weights jump to bad values)
- A large negative bias develops
- The data distribution shifts

> **How common?** In practice, 10–40% of neurons in a ReLU network can die during training. This is usually acceptable, but can be problematic in very deep networks.

```python
import torch
import torch.nn.functional as F

# ReLU in action
x = torch.tensor([-3.0, -1.0, -0.5, 0.0, 0.5, 1.0, 3.0])

print("ReLU values:")
print(f"  Input:  {x.tolist()}")
print(f"  Output: {F.relu(x).tolist()}")

# Gradient of ReLU
x_grad = x.clone().requires_grad_(True)
y = F.relu(x_grad).sum()
y.backward()
print(f"\nReLU gradients:")
print(f"  Input:    {x.tolist()}")
print(f"  Gradient: {x_grad.grad.tolist()}")
# Negative inputs → gradient 0 (dead zone)
# Positive inputs → gradient 1
```

---

## Leaky ReLU

**Leaky ReLU** fixes the dying ReLU problem by allowing a small gradient for negative inputs:

$$f(x) = \max(\alpha x, x) = \begin{cases} x & \text{if } x > 0 \\ \alpha x & \text{if } x \leq 0 \end{cases}$$

Where $\alpha$ is a small constant, typically $0.01$.

### Properties

| Property | Value |
|----------|-------|
| **Range** | $(-\infty, \infty)$ |
| **Negative slope** | $\alpha$ (default $0.01$) |
| **Derivative** | $1$ if $x > 0$, $\alpha$ if $x \leq 0$ |
| **Dead neurons?** | No — gradient is never exactly zero |

### ReLU vs. Leaky ReLU

```
  ReLU:                    Leaky ReLU (α=0.1):
  y                        y
  │      /                 │      /
  │     /                  │     /
  │    /                   │    /
  │   /                    │   /
  ──────────── x          ──/──────── x
  │                        /
  │                       /  (small slope α)
```

```python
import torch
import torch.nn.functional as F

x = torch.tensor([-3.0, -1.0, 0.0, 1.0, 3.0])

relu = F.relu(x)
leaky = F.leaky_relu(x, negative_slope=0.01)

print(f"{'x':>5s} │ {'ReLU':>6s} │ {'Leaky':>6s}")
print("─" * 22)
for i in range(len(x)):
    print(f"{x[i].item():>5.1f} │ {relu[i].item():>6.2f} │ "
          f"{leaky[i].item():>6.2f}")
```

---

## ELU, SELU, GELU

Several ReLU variants have been proposed, each with specific advantages:

### ELU (Exponential Linear Unit)

$$f(x) = \begin{cases} x & \text{if } x > 0 \\ \alpha(e^x - 1) & \text{if } x \leq 0 \end{cases}$$

- Smooth curve for negatives (unlike ReLU's sharp corner)
- Mean activations closer to zero → faster learning
- Computationally more expensive than ReLU (uses `exp`)

### SELU (Scaled ELU)

$$f(x) = \lambda \begin{cases} x & \text{if } x > 0 \\ \alpha(e^x - 1) & \text{if } x \leq 0 \end{cases}$$

With specific constants $\lambda \approx 1.0507$ and $\alpha \approx 1.6733$:
- **Self-normalizing**: activations automatically converge to mean 0, variance 1
- Works best with specific architectures (fully connected, no skip connections)

### GELU (Gaussian Error Linear Unit)

$$f(x) = x \cdot \Phi(x) \approx x \cdot \sigma(1.702x)$$

Where $\Phi(x)$ is the standard normal CDF.
- Used in **Transformers** (BERT, GPT)
- Smooth approximation of ReLU
- Allows small negative values (not hard zero)

```python
import torch
import torch.nn.functional as F

x = torch.tensor([-2.0, -1.0, -0.5, 0.0, 0.5, 1.0, 2.0])

print(f"{'x':>5s} │ {'ReLU':>6s} │ {'ELU':>6s} │ {'SELU':>6s} │ {'GELU':>6s}")
print("─" * 42)
for val in x:
    r = F.relu(val).item()
    e = F.elu(val).item()
    s = F.selu(val).item()
    g = F.gelu(val).item()
    print(f"{val.item():>5.1f} │ {r:>6.3f} │ {e:>6.3f} │ {s:>6.3f} │ {g:>6.3f}")
```

---

## Softmax

**Softmax** converts a vector of raw scores (logits) into a **probability distribution**:

$$\sigma(z)_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

### Properties

| Property | Value |
|----------|-------|
| **Input** | Vector of $K$ raw scores (logits) |
| **Output** | Vector of $K$ probabilities |
| **Each output** | In range $(0, 1)$ |
| **Sum of outputs** | Exactly $1.0$ |
| **Use case** | Multi-class classification output layer |

### Example

Suppose a network outputs logits $[2.0, 1.0, 0.5]$ for 3 classes:

$$\sigma([2.0, 1.0, 0.5]) = \frac{[e^{2.0}, e^{1.0}, e^{0.5}]}{e^{2.0} + e^{1.0} + e^{0.5}} = \frac{[7.389, 2.718, 1.649]}{11.756} = [0.629, 0.231, 0.140]$$

The network is 62.9% confident it's class 0, 23.1% class 1, and 14.0% class 2.

```python
import torch
import torch.nn.functional as F

# Softmax example
logits = torch.tensor([2.0, 1.0, 0.5])

# Manual computation
exp_logits = torch.exp(logits)
manual_softmax = exp_logits / exp_logits.sum()

# PyTorch softmax
pytorch_softmax = F.softmax(logits, dim=0)

print("Logits:          ", logits.tolist())
print("Manual softmax:  ", [f"{v:.3f}" for v in manual_softmax.tolist()])
print("PyTorch softmax: ", [f"{v:.3f}" for v in pytorch_softmax.tolist()])
print("Sum:             ", pytorch_softmax.sum().item())

# Softmax with temperature
print("\nSoftmax with temperature scaling:")
for temp in [0.5, 1.0, 2.0, 5.0]:
    probs = F.softmax(logits / temp, dim=0)
    print(f"  T={temp:<3}: {[f'{v:.3f}' for v in probs.tolist()]}")
# Lower temp → more confident (sharper)
# Higher temp → more uniform (softer)
```

### Softmax Temperature

The **temperature** parameter $T$ controls how "sharp" or "soft" the distribution is:

$$\sigma(z)_i = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}$$

| Temperature | Effect | Use Case |
|-------------|--------|----------|
| $T \to 0$ | One-hot (100% on max) | Greedy selection |
| $T = 1$ | Standard softmax | Normal inference |
| $T > 1$ | More uniform | Knowledge distillation, sampling diversity |

---

## How to Choose an Activation Function

### Decision Guide

```
Choosing an Activation Function:

Is this the OUTPUT layer?
  ├── Binary classification → Sigmoid
  ├── Multi-class classification → Softmax
  └── Regression → None (linear)

Is this a HIDDEN layer?
  ├── Default choice → ReLU
  ├── Dying neurons? → Leaky ReLU or ELU
  ├── Transformer model? → GELU
  └── Self-normalizing network? → SELU
```

### Quick Reference

| Layer Type | Recommended | Why |
|-----------|-------------|-----|
| **Hidden (default)** | ReLU | Fast, effective, well-studied |
| **Hidden (alternative)** | Leaky ReLU | No dead neurons |
| **Hidden (Transformers)** | GELU | Best for attention models |
| **Output (binary)** | Sigmoid | Outputs probability in $(0,1)$ |
| **Output (multi-class)** | Softmax | Outputs probability distribution |
| **Output (regression)** | None/Linear | Unbounded continuous output |

> **Practical rule:** Start with ReLU. If you see dead neurons or training stalls, try Leaky ReLU. For Transformer architectures, use GELU. Match the output activation to your loss function.

---

## Code: Implement and Visualize All Activation Functions

Let's implement every activation function and see their shapes and derivatives:

```python
import torch
import torch.nn.functional as F

# ─── Define activation functions ───────────────────────
x = torch.linspace(-5, 5, 200)

activations = {
    "Sigmoid": torch.sigmoid(x),
    "Tanh": torch.tanh(x),
    "ReLU": F.relu(x),
    "Leaky ReLU": F.leaky_relu(x, negative_slope=0.1),
    "ELU": F.elu(x),
    "SELU": F.selu(x),
    "GELU": F.gelu(x),
}

# Print key values for each
print(f"{'Function':<12s} │ {'f(-2)':>7s} │ {'f(-1)':>7s} │ "
      f"{'f(0)':>7s} │ {'f(1)':>7s} │ {'f(2)':>7s}")
print("─" * 60)

sample_x = torch.tensor([-2.0, -1.0, 0.0, 1.0, 2.0])
for name, _ in activations.items():
    if name == "Sigmoid":
        vals = torch.sigmoid(sample_x)
    elif name == "Tanh":
        vals = torch.tanh(sample_x)
    elif name == "ReLU":
        vals = F.relu(sample_x)
    elif name == "Leaky ReLU":
        vals = F.leaky_relu(sample_x, negative_slope=0.1)
    elif name == "ELU":
        vals = F.elu(sample_x)
    elif name == "SELU":
        vals = F.selu(sample_x)
    elif name == "GELU":
        vals = F.gelu(sample_x)

    print(f"{name:<12s} │ {vals[0].item():>7.3f} │ {vals[1].item():>7.3f} │ "
          f"{vals[2].item():>7.3f} │ {vals[3].item():>7.3f} │ "
          f"{vals[4].item():>7.3f}")
```

---

## Code: Comparing Activations in a Real Network

Let's train identical networks with different activation functions and compare:

```python
import torch
import torch.nn as nn

# ─── Generate spiral dataset (non-linear) ─────────────
torch.manual_seed(42)
n_samples = 300
noise = 0.2

# Class 0: inner spiral
t0 = torch.linspace(0, 3, n_samples // 2)
x0 = torch.stack([t0 * torch.cos(t0 * 2),
                   t0 * torch.sin(t0 * 2)], dim=1)
x0 += torch.randn_like(x0) * noise

# Class 1: outer spiral
t1 = torch.linspace(0, 3, n_samples // 2)
x1 = torch.stack([(t1 + 1) * torch.cos(t1 * 2 + 3.14),
                   (t1 + 1) * torch.sin(t1 * 2 + 3.14)], dim=1)
x1 += torch.randn_like(x1) * noise

X = torch.cat([x0, x1], dim=0)
y = torch.cat([torch.zeros(n_samples // 2),
               torch.ones(n_samples // 2)]).unsqueeze(1)

print(f"Dataset: {X.shape[0]} samples, 2 features")


# ─── Train with different activations ─────────────────
def make_model(activation):
    """Create a network with the given activation."""
    return nn.Sequential(
        nn.Linear(2, 32),
        activation,
        nn.Linear(32, 32),
        activation,
        nn.Linear(32, 1),
        nn.Sigmoid()
    )


def train_model(model, X, y, epochs=300, lr=0.01):
    """Train and return final loss and accuracy."""
    loss_fn = nn.BCELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    for epoch in range(epochs):
        y_hat = model(X)
        loss = loss_fn(y_hat, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        y_hat = model(X)
        preds = (y_hat > 0.5).float()
        accuracy = (preds == y).float().mean().item()
        final_loss = loss_fn(y_hat, y).item()
    return final_loss, accuracy


# Compare activations
activation_configs = {
    "Sigmoid": nn.Sigmoid(),
    "Tanh": nn.Tanh(),
    "ReLU": nn.ReLU(),
    "LeakyReLU": nn.LeakyReLU(0.1),
    "ELU": nn.ELU(),
    "GELU": nn.GELU(),
}

print(f"\n{'Activation':<12s} │ {'Loss':>8s} │ {'Accuracy':>8s}")
print("─" * 34)

torch.manual_seed(42)  # Same init for fair comparison
for name, act in activation_configs.items():
    torch.manual_seed(42)
    model = make_model(act)
    loss, acc = train_model(model, X, y)
    print(f"{name:<12s} │ {loss:>8.4f} │ {acc:>7.1%}")
```

---

## Code: PyTorch Activation Modules

Here's a quick reference for using activations in PyTorch:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

x = torch.randn(4, 3)

# ─── As nn.Module (for use in nn.Sequential) ──────────
print("=== nn.Module activations ===")
activations = [
    ("ReLU",       nn.ReLU()),
    ("LeakyReLU",  nn.LeakyReLU(0.01)),
    ("ELU",        nn.ELU(alpha=1.0)),
    ("SELU",       nn.SELU()),
    ("GELU",       nn.GELU()),
    ("Sigmoid",    nn.Sigmoid()),
    ("Tanh",       nn.Tanh()),
    ("Softmax",    nn.Softmax(dim=1)),
]

for name, act in activations:
    out = act(x)
    print(f"  {name:<12s}: output shape {list(out.shape)}, "
          f"range [{out.min().item():.3f}, {out.max().item():.3f}]")

# ─── As functional (for use in forward()) ──────────────
print("\n=== Functional activations ===")
print(f"  F.relu:       {F.relu(x[0]).tolist()}")
print(f"  F.leaky_relu: {F.leaky_relu(x[0], 0.01).tolist()}")
print(f"  F.elu:        {F.elu(x[0]).tolist()}")
print(f"  F.gelu:       {F.gelu(x[0]).tolist()}")
print(f"  F.sigmoid:    {torch.sigmoid(x[0]).tolist()}")
print(f"  F.softmax:    {F.softmax(x[0], dim=0).tolist()}")
```

---

## Summary

| Activation | Formula | Range | Best For |
|-----------|---------|-------|----------|
| **Sigmoid** | $\frac{1}{1+e^{-x}}$ | $(0,1)$ | Binary output |
| **Tanh** | $\frac{e^x - e^{-x}}{e^x + e^{-x}}$ | $(-1,1)$ | Zero-centered needs |
| **ReLU** | $\max(0,x)$ | $[0,\infty)$ | Hidden layers (default) |
| **Leaky ReLU** | $\max(\alpha x, x)$ | $(-\infty,\infty)$ | Avoiding dead neurons |
| **ELU** | $x$ or $\alpha(e^x-1)$ | $(-\alpha,\infty)$ | Smoother negatives |
| **SELU** | $\lambda \cdot \text{ELU}$ | Self-normalizing | FC-only networks |
| **GELU** | $x \cdot \Phi(x)$ | $\approx(-0.17,\infty)$ | Transformers |
| **Softmax** | $\frac{e^{z_i}}{\sum e^{z_j}}$ | $(0,1)$, sums to 1 | Multi-class output |

**Rule of thumb:** ReLU for hidden layers, sigmoid/softmax for output layers. Switch to Leaky ReLU or GELU if needed.

---

## What's Next?

Now you know what happens inside each neuron. In the next lesson, we'll zoom out and trace how data flows through an **entire network** — the process called **forward propagation**.
