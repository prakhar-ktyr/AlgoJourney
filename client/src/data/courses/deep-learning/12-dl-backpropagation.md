---
title: Backpropagation
---

# Backpropagation

**Backpropagation** (short for "backward propagation of errors") is the algorithm that computes gradients for every parameter in the network. Without it, gradient descent would be impossible for networks deeper than one layer.

In this lesson, you'll learn the chain rule, trace gradients through layers manually, understand computational graphs, and see how PyTorch's autograd does all of this automatically.

---

## The Learning Process

Neural network training has four steps that repeat in a loop:

```
┌─────────────────────────────────────────────────────┐
│  1. FORWARD PASS: x → ŷ (compute prediction)       │
│  2. COMPUTE LOSS: L(y, ŷ) (how wrong are we?)      │
│  3. BACKWARD PASS: compute ∂L/∂θ for all θ         │  ← This lesson!
│  4. UPDATE: θ = θ - α * ∂L/∂θ (gradient descent)   │
└─────────────────────────────────────────────────────┘
```

Steps 1–2 are forward propagation (previous lessons). Step 3 — computing all those gradients — is **backpropagation**. Step 4 is the update rule from gradient descent.

---

## The Chain Rule

Backpropagation is just the **chain rule** from calculus applied systematically. If $y = f(g(x))$, then:

$$\frac{dy}{dx} = \frac{dy}{dg} \cdot \frac{dg}{dx}$$

### Extended Chain Rule

For a composition of many functions $y = f_1(f_2(f_3(...f_n(x)...)))$:

$$\frac{dy}{dx} = \frac{\partial f_1}{\partial f_2} \cdot \frac{\partial f_2}{\partial f_3} \cdot \ldots \cdot \frac{\partial f_{n-1}}{\partial f_n} \cdot \frac{\partial f_n}{\partial x}$$

### Example

If $L = (y - \sigma(wx + b))^2$:

$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z} \cdot \frac{\partial z}{\partial w}$$

Where:
- $z = wx + b$ (linear step)
- $\hat{y} = \sigma(z)$ (activation)
- $L = (y - \hat{y})^2$ (loss)

Computing each piece:
- $\frac{\partial L}{\partial \hat{y}} = -2(y - \hat{y})$
- $\frac{\partial \hat{y}}{\partial z} = \sigma(z)(1 - \sigma(z))$
- $\frac{\partial z}{\partial w} = x$

Multiply them: $\frac{\partial L}{\partial w} = -2(y - \hat{y}) \cdot \sigma(z)(1-\sigma(z)) \cdot x$

---

## Computational Graphs

A **computational graph** represents the math of a network as a directed graph where:
- **Nodes** = operations (addition, multiplication, activation)
- **Edges** = data flow (tensors)

### Example: $L = (y - \sigma(Wx + b))^2$

```
        Forward pass →

  x ──→ [×W] ──→ [+b] ──→ [σ] ──→ [-y] ──→ [²] ──→ L
  W ──────┘        b───┘          y────┘

        ← Backward pass (gradients flow back)
```

During the backward pass, gradients flow **backward** through the graph. At each node, we multiply by the **local gradient** of that operation.

### Local Gradients

| Operation | Forward: $\text{out} = f(\text{in})$ | Local gradient: $\frac{\partial \text{out}}{\partial \text{in}}$ |
|-----------|---------|----------------|
| Addition: $a + b$ | $c = a + b$ | $\frac{\partial c}{\partial a} = 1$, $\frac{\partial c}{\partial b} = 1$ |
| Multiplication: $a \times b$ | $c = ab$ | $\frac{\partial c}{\partial a} = b$, $\frac{\partial c}{\partial b} = a$ |
| Sigmoid: $\sigma(x)$ | $\sigma = \frac{1}{1+e^{-x}}$ | $\sigma(1-\sigma)$ |
| ReLU: $\max(0,x)$ | $y = \max(0,x)$ | $1$ if $x>0$, else $0$ |
| Square: $x^2$ | $y = x^2$ | $2x$ |

---

## Backprop Through a Network Layer

For a single layer with:
- Input: $a^{[l-1]}$ (activations from previous layer)
- Weights: $W^{[l]}$, Bias: $b^{[l]}$
- Linear output: $z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$
- Activation: $a^{[l]} = g(z^{[l]})$

Given $\frac{\partial L}{\partial a^{[l]}}$ from the layer above, we compute:

### Step 1: Gradient through activation

$$\frac{\partial L}{\partial z^{[l]}} = \frac{\partial L}{\partial a^{[l]}} \odot g'(z^{[l]})$$

Where $\odot$ is element-wise multiplication and $g'$ is the derivative of the activation.

### Step 2: Gradient for weights

$$\frac{\partial L}{\partial W^{[l]}} = \frac{\partial L}{\partial z^{[l]}} \cdot a^{[l-1]T}$$

### Step 3: Gradient for bias

$$\frac{\partial L}{\partial b^{[l]}} = \frac{\partial L}{\partial z^{[l]}}$$

### Step 4: Gradient to pass backward

$$\frac{\partial L}{\partial a^{[l-1]}} = W^{[l]T} \cdot \frac{\partial L}{\partial z^{[l]}}$$

This last equation is crucial — it provides the input gradient for the layer below, continuing the chain.

---

## Full Backpropagation: Worked Example

Let's trace through a tiny 2-layer network with actual numbers.

### Setup

```
Network: 1 input → 2 hidden (ReLU) → 1 output (no activation)
Loss: MSE

Input:   x = 1.0
Target:  y = 0.5

Weights:
  W1 = [[0.3], [0.7]]    b1 = [[0.1], [0.2]]
  W2 = [[0.5, 0.4]]      b2 = [[0.1]]
```

### Forward Pass

```
Layer 1:
  z1 = W1 * x + b1 = [[0.3*1+0.1], [0.7*1+0.2]] = [[0.4], [0.9]]
  a1 = ReLU(z1) = [[0.4], [0.9]]   (both positive, unchanged)

Layer 2:
  z2 = W2 * a1 + b2 = 0.5*0.4 + 0.4*0.9 + 0.1 = 0.66
  ŷ = z2 = 0.66  (no activation on output)

Loss:
  L = (y - ŷ)² = (0.5 - 0.66)² = 0.0256
```

### Backward Pass

```
∂L/∂ŷ = -2(y - ŷ) = -2(0.5 - 0.66) = 0.32

Layer 2 (no activation):
  ∂L/∂z2 = 0.32
  ∂L/∂W2 = ∂L/∂z2 * a1ᵀ = 0.32 * [0.4, 0.9] = [0.128, 0.288]
  ∂L/∂b2 = 0.32
  ∂L/∂a1 = W2ᵀ * ∂L/∂z2 = [[0.5], [0.4]] * 0.32 = [[0.16], [0.128]]

Layer 1 (ReLU activation):
  ∂L/∂z1 = ∂L/∂a1 ⊙ ReLU'(z1) = [[0.16], [0.128]] ⊙ [[1], [1]] = [[0.16], [0.128]]
  ∂L/∂W1 = ∂L/∂z1 * xᵀ = [[0.16], [0.128]] * 1.0 = [[0.16], [0.128]]
  ∂L/∂b1 = [[0.16], [0.128]]
```

### Update (lr = 0.1)

```
W2 = [0.5, 0.4] - 0.1 * [0.128, 0.288] = [0.4872, 0.3712]
b2 = 0.1 - 0.1 * 0.32 = 0.068
W1 = [[0.3], [0.7]] - 0.1 * [[0.16], [0.128]] = [[0.284], [0.6872]]
b1 = [[0.1], [0.2]] - 0.1 * [[0.16], [0.128]] = [[0.084], [0.1872]]
```

---

## Vanishing and Exploding Gradients

As gradients propagate backward through many layers, they are **multiplied** at each step. This can cause problems:

### Vanishing Gradients

When gradients get smaller and smaller as they flow backward:

$$\frac{\partial L}{\partial W^{[1]}} = \underbrace{\frac{\partial L}{\partial a^{[n]}} \cdot \frac{\partial a^{[n]}}{\partial z^{[n]}} \cdot W^{[n]} \cdot \ldots \cdot W^{[2]}}_{\text{many multiplications}} \cdot \frac{\partial z^{[1]}}{\partial W^{[1]}}$$

If each factor is < 1, the product shrinks exponentially:

$$0.5^{10} = 0.001 \quad \text{(10 layers with factor 0.5 each)}$$

**Symptoms:** Early layers barely learn; loss plateaus; training takes forever.

**Caused by:** Sigmoid/tanh activations (derivatives always < 1), poor weight initialization.

### Exploding Gradients

When gradients grow exponentially:

$$2.0^{10} = 1024 \quad \text{(10 layers with factor 2 each)}$$

**Symptoms:** Loss becomes NaN; weights become huge; training crashes.

**Caused by:** Large weight values, deep networks without proper initialization.

### Solutions

| Problem | Solutions |
|---------|-----------|
| **Vanishing** | ReLU activation, residual connections, proper init (He/Xavier), LSTM/GRU for sequences |
| **Exploding** | Gradient clipping, proper init, batch normalization |

---

## PyTorch Autograd

PyTorch's `autograd` system builds a computational graph **automatically** during the forward pass, then computes all gradients with a single `loss.backward()` call.

### How It Works

```python
import torch

# Create tensors that track gradients
x = torch.tensor(2.0, requires_grad=True)
w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)

# Forward pass — PyTorch builds the graph
z = w * x + b        # z = 3*2 + 1 = 7
y_hat = torch.sigmoid(z)  # sigmoid(7) ≈ 0.999
loss = (1.0 - y_hat) ** 2  # MSE with target=1

# Backward pass — compute ALL gradients at once
loss.backward()

# Access gradients
print(f"∂L/∂w = {w.grad:.6f}")   # gradient w.r.t. weight
print(f"∂L/∂b = {b.grad:.6f}")   # gradient w.r.t. bias
print(f"∂L/∂x = {x.grad:.6f}")   # gradient w.r.t. input
```

### Key Autograd Concepts

| Concept | Explanation |
|---------|-------------|
| `requires_grad=True` | Tells PyTorch to track operations on this tensor |
| `.backward()` | Computes gradients for all tensors with `requires_grad=True` |
| `.grad` | Stores the computed gradient (accumulated!) |
| `.grad_fn` | Reference to the operation that created this tensor |
| `torch.no_grad()` | Context manager to disable gradient tracking (inference) |
| `.detach()` | Creates a new tensor detached from the computation graph |

### Important: Gradients Accumulate!

```python
# Gradients ADD UP by default!
x = torch.tensor(2.0, requires_grad=True)

for i in range(3):
    y = x ** 2
    y.backward()
    print(f"After backward {i+1}: x.grad = {x.grad}")
    # 4.0, 8.0, 12.0 — accumulating!

# Fix: zero gradients before each backward pass
x.grad.zero_()  # or optimizer.zero_grad() in training loops
```

---

## Code: Manual Backprop vs. PyTorch Autograd

Let's verify that manual computation matches PyTorch's autograd:

```python
import torch
import torch.nn as nn

# --- Setup ---
torch.manual_seed(42)

# Simple 2-layer network: 3 inputs → 4 hidden → 1 output
x = torch.randn(1, 3)       # 1 sample, 3 features
y_true = torch.tensor([[1.0]])

# Initialize weights (same for both approaches)
W1 = torch.randn(3, 4, requires_grad=True)
b1 = torch.zeros(1, 4, requires_grad=True)
W2 = torch.randn(4, 1, requires_grad=True)
b2 = torch.zeros(1, 1, requires_grad=True)

# --- Manual Forward + Backward ---
# Forward
z1 = x @ W1 + b1           # (1, 4)
a1 = torch.relu(z1)        # (1, 4)
z2 = a1 @ W2 + b2          # (1, 1)
y_hat = z2                  # linear output
loss = ((y_true - y_hat) ** 2).mean()

# Manual backward
dL_dy_hat = -2 * (y_true - y_hat)   # ∂L/∂ŷ
dL_dz2 = dL_dy_hat                    # no activation on output

# Layer 2 gradients
dL_dW2_manual = a1.T @ dL_dz2         # (4, 1)
dL_db2_manual = dL_dz2.sum(dim=0)     # (1,)
dL_da1 = dL_dz2 @ W2.T               # (1, 4)

# Layer 1 gradients
relu_grad = (z1 > 0).float()          # ReLU derivative
dL_dz1 = dL_da1 * relu_grad           # (1, 4)
dL_dW1_manual = x.T @ dL_dz1          # (3, 4)
dL_db1_manual = dL_dz1.sum(dim=0)     # (4,)

# --- PyTorch Autograd ---
loss.backward()

# --- Compare ---
print("=== Gradient Comparison ===")
print(f"\n∂L/∂W2:")
print(f"  Manual:  {dL_dW2_manual.detach().flatten()[:4]}")
print(f"  Autograd:{W2.grad.flatten()[:4]}")
print(f"  Match: {torch.allclose(dL_dW2_manual.detach(), W2.grad, atol=1e-6)}")

print(f"\n∂L/∂W1:")
print(f"  Manual:  {dL_dW1_manual.detach().flatten()[:4]}")
print(f"  Autograd:{W1.grad.flatten()[:4]}")
print(f"  Match: {torch.allclose(dL_dW1_manual.detach(), W1.grad, atol=1e-6)}")

print(f"\n∂L/∂b2:")
print(f"  Manual:  {dL_db2_manual.detach()}")
print(f"  Autograd:{b2.grad}")
print(f"  Match: {torch.allclose(dL_db2_manual.detach(), b2.grad, atol=1e-6)}")

print(f"\n∂L/∂b1:")
print(f"  Manual:  {dL_db1_manual.detach()}")
print(f"  Autograd:{b1.grad}")
print(f"  Match: {torch.allclose(dL_db1_manual.detach(), b1.grad, atol=1e-6)}")
```

---

## Code: Watching Gradients Flow in a Deep Network

Let's visualize how gradients change magnitude across layers:

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# --- Build a deep network ---
class DeepNet(nn.Module):
    def __init__(self, depth, width, activation="relu"):
        super().__init__()
        layers = []
        layers.append(nn.Linear(10, width))
        for _ in range(depth - 2):
            layers.append(nn.Linear(width, width))
        layers.append(nn.Linear(width, 1))
        self.layers = nn.ModuleList(layers)
        self.activation = activation

    def forward(self, x):
        for i, layer in enumerate(self.layers[:-1]):
            x = layer(x)
            if self.activation == "relu":
                x = torch.relu(x)
            elif self.activation == "sigmoid":
                x = torch.sigmoid(x)
            elif self.activation == "tanh":
                x = torch.tanh(x)
        x = self.layers[-1](x)
        return x

# --- Train one step and record gradient magnitudes ---
def get_gradient_magnitudes(model, x, y_true):
    y_hat = model(x)
    loss = nn.MSELoss()(y_hat, y_true)
    loss.backward()

    grad_magnitudes = []
    for i, layer in enumerate(model.layers):
        if layer.weight.grad is not None:
            grad_magnitudes.append(layer.weight.grad.abs().mean().item())
    return grad_magnitudes

# --- Compare activations ---
torch.manual_seed(42)
x = torch.randn(32, 10)
y = torch.randn(32, 1)
depth = 15

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

for ax, act_name in zip(axes, ["sigmoid", "tanh", "relu"]):
    model = DeepNet(depth, 64, activation=act_name)
    grads = get_gradient_magnitudes(model, x, y)

    ax.bar(range(len(grads)), grads, color="steelblue")
    ax.set_xlabel("Layer")
    ax.set_ylabel("Mean |gradient|")
    ax.set_title(f"{act_name.upper()} — Gradient Magnitudes")
    ax.set_yscale("log")
    ax.grid(True, alpha=0.3, axis="y")

plt.suptitle(f"Gradient Flow in {depth}-Layer Network", fontsize=14, y=1.02)
plt.tight_layout()
plt.savefig("gradient_flow.png", dpi=100)
plt.show()
```

---

## Code: Complete Training Loop with Backprop

Putting it all together — a full training example showing forward pass, backward pass, and updates:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# --- Create data ---
torch.manual_seed(42)
X = torch.randn(500, 3)
y = (X[:, 0] * 2 - X[:, 1] + X[:, 2] * 0.5 + 0.3).unsqueeze(1)
y += 0.1 * torch.randn_like(y)  # add noise

dataset = TensorDataset(X, y)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

# --- Define model ---
model = nn.Sequential(
    nn.Linear(3, 16),
    nn.ReLU(),
    nn.Linear(16, 8),
    nn.ReLU(),
    nn.Linear(8, 1),
)

criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# --- Training loop ---
losses = []
for epoch in range(50):
    epoch_loss = 0.0
    for X_batch, y_batch in dataloader:
        # Step 1: Forward pass
        y_pred = model(X_batch)

        # Step 2: Compute loss
        loss = criterion(y_pred, y_batch)

        # Step 3: Backward pass (backpropagation!)
        optimizer.zero_grad()  # Clear old gradients
        loss.backward()        # Compute new gradients

        # Step 4: Update parameters
        optimizer.step()       # θ = θ - lr * ∂L/∂θ

        epoch_loss += loss.item()

    avg_loss = epoch_loss / len(dataloader)
    losses.append(avg_loss)

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:>3}/50 | Loss: {avg_loss:.4f}")

print(f"\nFinal loss: {losses[-1]:.4f}")
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Backpropagation** | Applies chain rule backward through the network |
| **Chain rule** | $\frac{\partial L}{\partial w} = \frac{\partial L}{\partial z} \cdot \frac{\partial z}{\partial w}$ |
| **Computational graph** | Tracks all operations for automatic differentiation |
| **Layer gradient** | $\frac{\partial L}{\partial W^{[l]}} = \frac{\partial L}{\partial z^{[l]}} \cdot a^{[l-1]T}$ |
| **PyTorch autograd** | `loss.backward()` computes all gradients automatically |
| **Vanishing gradients** | Gradients shrink in early layers → use ReLU, skip connections |
| **Exploding gradients** | Gradients blow up → gradient clipping, proper init |

### What's Next?

Vanilla SGD has some problems: it can be slow, oscillate, or get stuck. **Optimizers** like Adam fix these issues by adapting the learning rate and adding momentum — that's the next lesson.
