---
title: Forward Propagation
---

# Forward Propagation

**Forward propagation** is the process of passing input data through the network, layer by layer, to produce a prediction. It's the first half of how neural networks work — the second half (backpropagation) is how they learn.

In this lesson, you'll trace forward propagation step by step, compute it by hand with actual numbers, and implement it in PyTorch.

---

## What Is Forward Propagation?

Forward propagation is simply: **input → layer 1 → layer 2 → ... → output**.

At each layer, two things happen:

1. **Linear transformation:** $z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$
2. **Activation:** $a^{[l]} = g(z^{[l]})$

Where:
- $a^{[0]} = x$ (the input is the "activation" of layer 0)
- $W^{[l]}$ = weight matrix of layer $l$
- $b^{[l]}$ = bias vector of layer $l$
- $g$ = activation function
- $a^{[l]}$ = output (activation) of layer $l$

```
Forward Propagation Flow:

  x ──→ [Linear₁] ──→ [Activation₁] ──→ [Linear₂] ──→ [Activation₂] ──→ ŷ
  a⁰        z¹              a¹              z²              a²
```

> **Key insight:** Forward propagation is pure computation — no learning happens here. We're just computing what the network predicts given the current weights.

---

## Step by Step: The Math

For a network with $L$ layers, forward propagation computes:

### Layer 1 (input → first hidden)

$$z^{[1]} = W^{[1]} a^{[0]} + b^{[1]}$$

$$a^{[1]} = g(z^{[1]})$$

### Layer 2 (first hidden → second hidden)

$$z^{[2]} = W^{[2]} a^{[1]} + b^{[2]}$$

$$a^{[2]} = g(z^{[2]})$$

### General Layer $l$

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$

$$a^{[l]} = g^{[l]}(z^{[l]})$$

### Output Layer $L$

$$z^{[L]} = W^{[L]} a^{[L-1]} + b^{[L]}$$

$$\hat{y} = a^{[L]} = g^{[L]}(z^{[L]})$$

### Complete Chain

For a 3-layer network:

$$\hat{y} = g^{[3]}\Big(W^{[3]} \cdot g^{[2]}\Big(W^{[2]} \cdot g^{[1]}\Big(W^{[1]} x + b^{[1]}\Big) + b^{[2]}\Big) + b^{[3]}\Big)$$

It's just **nested function composition** — each layer's output is the next layer's input.

---

## Example: Forward Pass with Numbers

Let's trace a complete forward pass through a **2-layer network** with concrete numbers.

### Network Setup

```
Architecture: 2 inputs → 2 hidden neurons → 1 output
Activation: ReLU (hidden), Sigmoid (output)

  x₁ ─┐   ┌─ h₁ ─┐
       ├───┤       ├──→ out → ŷ
  x₂ ─┘   └─ h₂ ─┘
```

### Given Weights

**Layer 1** (input → hidden):

$$W^{[1]} = \begin{bmatrix} 0.3 & -0.1 \\ 0.5 & 0.2 \end{bmatrix}, \quad b^{[1]} = \begin{bmatrix} 0.1 \\ -0.1 \end{bmatrix}$$

**Layer 2** (hidden → output):

$$W^{[2]} = \begin{bmatrix} 0.4 & -0.3 \end{bmatrix}, \quad b^{[2]} = \begin{bmatrix} 0.2 \end{bmatrix}$$

### Input

$$x = a^{[0]} = \begin{bmatrix} 1.0 \\ 2.0 \end{bmatrix}$$

### Step 1: Layer 1 Linear

$$z^{[1]} = W^{[1]} a^{[0]} + b^{[1]}$$

$$z^{[1]} = \begin{bmatrix} 0.3 & -0.1 \\ 0.5 & 0.2 \end{bmatrix} \begin{bmatrix} 1.0 \\ 2.0 \end{bmatrix} + \begin{bmatrix} 0.1 \\ -0.1 \end{bmatrix}$$

$$z^{[1]} = \begin{bmatrix} (0.3)(1.0) + (-0.1)(2.0) \\ (0.5)(1.0) + (0.2)(2.0) \end{bmatrix} + \begin{bmatrix} 0.1 \\ -0.1 \end{bmatrix} = \begin{bmatrix} 0.1 \\ 0.9 \end{bmatrix} + \begin{bmatrix} 0.1 \\ -0.1 \end{bmatrix} = \begin{bmatrix} 0.2 \\ 0.8 \end{bmatrix}$$

### Step 2: Layer 1 Activation (ReLU)

$$a^{[1]} = \text{ReLU}(z^{[1]}) = \begin{bmatrix} \max(0, 0.2) \\ \max(0, 0.8) \end{bmatrix} = \begin{bmatrix} 0.2 \\ 0.8 \end{bmatrix}$$

Both values are positive, so ReLU passes them through unchanged.

### Step 3: Layer 2 Linear

$$z^{[2]} = W^{[2]} a^{[1]} + b^{[2]}$$

$$z^{[2]} = \begin{bmatrix} 0.4 & -0.3 \end{bmatrix} \begin{bmatrix} 0.2 \\ 0.8 \end{bmatrix} + 0.2$$

$$z^{[2]} = (0.4)(0.2) + (-0.3)(0.8) + 0.2 = 0.08 - 0.24 + 0.2 = 0.04$$

### Step 4: Layer 2 Activation (Sigmoid)

$$\hat{y} = a^{[2]} = \sigma(0.04) = \frac{1}{1 + e^{-0.04}} \approx 0.510$$

### Final Result

The network predicts $\hat{y} \approx 0.510$ — slightly above 0.5, so for binary classification this would be class 1 (barely).

### Summary Table

| Step | Computation | Result |
|------|------------|--------|
| Input | $a^{[0]} = x$ | $[1.0, 2.0]$ |
| Layer 1 linear | $z^{[1]} = W^{[1]}x + b^{[1]}$ | $[0.2, 0.8]$ |
| Layer 1 activation | $a^{[1]} = \text{ReLU}(z^{[1]})$ | $[0.2, 0.8]$ |
| Layer 2 linear | $z^{[2]} = W^{[2]}a^{[1]} + b^{[2]}$ | $0.04$ |
| Layer 2 activation | $\hat{y} = \sigma(z^{[2]})$ | $0.510$ |

---

## Code: Manual Forward Pass

Let's verify our hand computation with PyTorch:

```python
import torch

# ─── Network parameters (same as hand calculation) ────
W1 = torch.tensor([[0.3, -0.1],
                    [0.5,  0.2]])
b1 = torch.tensor([0.1, -0.1])

W2 = torch.tensor([[0.4, -0.3]])
b2 = torch.tensor([0.2])

# Input
x = torch.tensor([1.0, 2.0])

# ─── Forward pass step by step ────────────────────────
print("=== Manual Forward Propagation ===\n")

# Layer 1: Linear
z1 = W1 @ x + b1
print(f"Layer 1 linear (z¹):     {z1.tolist()}")

# Layer 1: ReLU activation
a1 = torch.relu(z1)
print(f"Layer 1 activation (a¹): {a1.tolist()}")

# Layer 2: Linear
z2 = W2 @ a1 + b2
print(f"Layer 2 linear (z²):     {z2.tolist()}")

# Layer 2: Sigmoid activation
y_hat = torch.sigmoid(z2)
print(f"Layer 2 activation (ŷ):  {y_hat.tolist()}")

print(f"\nPrediction: {y_hat.item():.4f}")
print(f"Classification: class {int(y_hat.item() > 0.5)}")
```

---

## Computing Predictions

The output of forward propagation is the network's **prediction**. How you interpret it depends on the task:

### Binary Classification (Sigmoid Output)

$$\hat{y} = \sigma(z^{[L]}) \in (0, 1)$$

Interpretation: probability of belonging to class 1.

| $\hat{y}$ | Predicted Class | Confidence |
|------------|----------------|------------|
| $0.95$ | 1 | Very confident |
| $0.51$ | 1 | Barely (almost uncertain) |
| $0.50$ | Undecided | Random guess |
| $0.20$ | 0 | Fairly confident |
| $0.02$ | 0 | Very confident |

### Multi-class Classification (Softmax Output)

$$\hat{y} = \text{softmax}(z^{[L]}) \in \mathbb{R}^K, \quad \sum_i \hat{y}_i = 1$$

The predicted class is $\arg\max_i \hat{y}_i$.

### Regression (Linear Output)

$$\hat{y} = z^{[L]} \in \mathbb{R}$$

The output directly is the predicted value (no activation).

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# ─── Binary classification ─────────────────────────────
print("=== Binary Classification ===")
logit = torch.tensor([0.8])
prob = torch.sigmoid(logit)
print(f"Logit: {logit.item():.2f}")
print(f"Probability: {prob.item():.3f}")
print(f"Predicted class: {int(prob.item() > 0.5)}")

# ─── Multi-class classification ────────────────────────
print("\n=== Multi-class Classification (3 classes) ===")
logits = torch.tensor([2.0, 1.0, 0.5])
probs = F.softmax(logits, dim=0)
print(f"Logits: {logits.tolist()}")
print(f"Probabilities: {[f'{p:.3f}' for p in probs.tolist()]}")
print(f"Predicted class: {probs.argmax().item()}")

# ─── Regression ────────────────────────────────────────
print("\n=== Regression ===")
output = torch.tensor([23.5])
print(f"Raw output: {output.item():.1f}")
print(f"Prediction: {output.item():.1f} (no activation needed)")
```

---

## Matrix Form: Batch Processing

In practice, we don't process one sample at a time — we process entire **batches**.

### Single Sample vs. Batch

**Single sample** ($x$ is a vector of shape $(n,)$):

$$z = Wx + b$$

**Batch of $m$ samples** ($X$ is a matrix of shape $(m, n)$):

$$Z = XW^T + b$$

where $b$ is broadcast across all $m$ samples.

### Why Batches?

| Benefit | Explanation |
|---------|------------|
| **Speed** | GPUs are designed for parallel matrix operations |
| **Stable gradients** | Averaging over many samples reduces noise |
| **Memory efficiency** | One matrix multiply vs. $m$ vector multiplies |

### Batch Forward Pass

For a batch of $m$ samples with a 2-layer network:

$$Z^{[1]} = X W^{[1]T} + b^{[1]} \quad \text{(shape: } m \times h_1\text{)}$$

$$A^{[1]} = g(Z^{[1]}) \quad \text{(shape: } m \times h_1\text{)}$$

$$Z^{[2]} = A^{[1]} W^{[2]T} + b^{[2]} \quad \text{(shape: } m \times h_2\text{)}$$

$$\hat{Y} = g(Z^{[2]}) \quad \text{(shape: } m \times h_2\text{)}$$

```python
import torch
import torch.nn as nn

# ─── Batch forward pass ───────────────────────────────
torch.manual_seed(42)

# Network
layer1 = nn.Linear(3, 4)  # 3 inputs → 4 hidden
layer2 = nn.Linear(4, 2)  # 4 hidden → 2 outputs

# Single sample
x_single = torch.tensor([1.0, 2.0, 3.0])
z1_single = layer1(x_single)
a1_single = torch.relu(z1_single)
z2_single = layer2(a1_single)
print("=== Single Sample ===")
print(f"Input shape:  {x_single.shape}")     # (3,)
print(f"Hidden shape: {a1_single.shape}")     # (4,)
print(f"Output shape: {z2_single.shape}")     # (2,)

# Batch of 5 samples
X_batch = torch.randn(5, 3)
Z1_batch = layer1(X_batch)
A1_batch = torch.relu(Z1_batch)
Z2_batch = layer2(A1_batch)
print("\n=== Batch (5 samples) ===")
print(f"Input shape:  {X_batch.shape}")       # (5, 3)
print(f"Hidden shape: {A1_batch.shape}")      # (5, 4)
print(f"Output shape: {Z2_batch.shape}")      # (5, 2)

# Both give the same result for matching inputs
x_first = X_batch[0]
z1_first = layer1(x_first)
a1_first = torch.relu(z1_first)
z2_first = layer2(a1_first)
print(f"\nBatch[0] output:  {Z2_batch[0].tolist()}")
print(f"Single output:    {z2_first.tolist()}")
print(f"Match: {torch.allclose(Z2_batch[0], z2_first)}")
```

---

## Shape Tracking Through Layers

One of the most common bugs in deep learning is **shape mismatches**. Always track tensor shapes through your network:

### Shape Rules

For `nn.Linear(in_features, out_features)`:

$$\text{Input: } (m, \text{in\_features}) \longrightarrow \text{Output: } (m, \text{out\_features})$$

### Example: 3-Layer Network

```
Input:   (batch=32, features=784)     ← 784 pixels in a 28×28 image
           │
    Linear(784, 256)
           │
         (32, 256)
           │
    ReLU()
           │
         (32, 256)                     ← shape doesn't change
           │
    Linear(256, 128)
           │
         (32, 128)
           │
    ReLU()
           │
         (32, 128)
           │
    Linear(128, 10)
           │
         (32, 10)                      ← 10 class scores
           │
    Softmax(dim=1)
           │
         (32, 10)                      ← 10 probabilities
```

```python
import torch
import torch.nn as nn

# Trace shapes through a network
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)

# Register hooks to print shapes
def shape_hook(name):
    def hook(module, input, output):
        in_shape = input[0].shape
        out_shape = output.shape
        print(f"  {name:<20s}: {str(list(in_shape)):>14s} → "
              f"{str(list(out_shape)):<14s}")
    return hook

for name, layer in model.named_children():
    layer.register_forward_hook(shape_hook(f"Layer {name}"))

# Forward pass
x = torch.randn(32, 784)
print("=== Shape Trace ===")
y = model(x)
print(f"\n  Final output shape: {list(y.shape)}")
```

---

## Implementation in PyTorch: forward() Method

The `forward()` method is where you define your network's forward propagation. PyTorch calls it automatically when you use `model(x)`.

### Basic Pattern

```python
import torch
import torch.nn as nn

class BinaryClassifier(nn.Module):
    """Network for binary classification."""

    def __init__(self, input_size):
        super().__init__()
        self.layer1 = nn.Linear(input_size, 64)
        self.layer2 = nn.Linear(64, 32)
        self.output = nn.Linear(32, 1)

    def forward(self, x):
        # Layer 1: linear + ReLU
        z1 = self.layer1(x)
        a1 = torch.relu(z1)

        # Layer 2: linear + ReLU
        z2 = self.layer2(a1)
        a2 = torch.relu(z2)

        # Output: linear + sigmoid
        z3 = self.output(a2)
        y_hat = torch.sigmoid(z3)

        return y_hat


# Create and test
model = BinaryClassifier(input_size=10)
x = torch.randn(5, 10)  # 5 samples, 10 features

# This calls forward() internally
y_hat = model(x)

print(f"Input shape:  {x.shape}")
print(f"Output shape: {y_hat.shape}")
print(f"Predictions:  {y_hat.squeeze().tolist()}")
print(f"Classes:      {(y_hat.squeeze() > 0.5).int().tolist()}")
```

### Why Use `model(x)` Not `model.forward(x)`?

Calling `model(x)` does more than just `forward()`:

1. Calls any registered **forward hooks**
2. Handles **gradient tracking** properly
3. Manages **train/eval mode** differences (dropout, batch norm)

> **Rule:** Always use `model(x)`, never `model.forward(x)` directly.

---

## Code: Complete Forward Propagation Pipeline

Let's combine everything — manual forward pass + PyTorch forward pass — and verify they produce the same results:

```python
import torch
import torch.nn as nn

torch.manual_seed(42)

# ─── Define network with nn.Module ────────────────────
class TwoLayerNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(3, 4)
        self.layer2 = nn.Linear(4, 2)

    def forward(self, x):
        x = torch.relu(self.layer1(x))
        x = self.layer2(x)
        return x

model = TwoLayerNet()

# ─── Extract weights for manual computation ───────────
W1 = model.layer1.weight.data   # (4, 3)
b1 = model.layer1.bias.data     # (4,)
W2 = model.layer2.weight.data   # (2, 4)
b2 = model.layer2.bias.data     # (2,)

# ─── Input ────────────────────────────────────────────
x = torch.tensor([1.0, -0.5, 2.0])

# ─── Manual forward pass ──────────────────────────────
print("=== Manual Forward Propagation ===\n")

z1_manual = W1 @ x + b1
print(f"z¹ = W¹x + b¹ = {z1_manual.tolist()}")

a1_manual = torch.relu(z1_manual)
print(f"a¹ = ReLU(z¹) = {a1_manual.tolist()}")

z2_manual = W2 @ a1_manual + b2
print(f"z² = W²a¹ + b² = {z2_manual.tolist()}")

# ─── PyTorch forward pass ─────────────────────────────
print("\n=== PyTorch Forward Propagation ===\n")
y_pytorch = model(x)
print(f"model(x) = {y_pytorch.tolist()}")

# ─── Verify they match ────────────────────────────────
print(f"\n=== Verification ===")
print(f"Manual:  {z2_manual.tolist()}")
print(f"PyTorch: {y_pytorch.tolist()}")
match = torch.allclose(z2_manual, y_pytorch)
print(f"Match:   {match}")

# ─── Batch forward pass ───────────────────────────────
print("\n=== Batch Forward Pass ===\n")
X = torch.randn(8, 3)
Y = model(X)
print(f"Input batch shape:  {X.shape}")
print(f"Output batch shape: {Y.shape}")
print(f"First 3 predictions:")
for i in range(3):
    print(f"  Sample {i}: {Y[i].tolist()}")
```

---

## Saving Intermediate Values

During training, we need to **save intermediate values** ($z^{[l]}$ and $a^{[l]}$) for backpropagation. Here's how to capture them:

```python
import torch
import torch.nn as nn

class DebugNet(nn.Module):
    """Network that saves intermediate activations."""

    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(3, 4)
        self.layer2 = nn.Linear(4, 2)
        # Storage for intermediate values
        self.intermediates = {}

    def forward(self, x):
        self.intermediates["a0"] = x.detach()

        z1 = self.layer1(x)
        self.intermediates["z1"] = z1.detach()
        a1 = torch.relu(z1)
        self.intermediates["a1"] = a1.detach()

        z2 = self.layer2(a1)
        self.intermediates["z2"] = z2.detach()

        return z2


# Use it
model = DebugNet()
x = torch.randn(4, 3)
y = model(x)

print("=== Intermediate Values ===\n")
for name, tensor in model.intermediates.items():
    print(f"{name}: shape={list(tensor.shape)}, "
          f"min={tensor.min().item():.3f}, "
          f"max={tensor.max().item():.3f}, "
          f"mean={tensor.mean().item():.3f}")
```

---

## Summary

| Concept | Formula / Detail |
|---------|-----------------|
| **Forward propagation** | Input → through each layer → prediction |
| **Layer computation** | $z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$, then $a^{[l]} = g(z^{[l]})$ |
| **Linear step** | Weighted sum + bias (matrix multiplication) |
| **Activation step** | Non-linear transformation (ReLU, sigmoid, etc.) |
| **Batch processing** | Process $m$ samples at once: $(m, n_{in}) \to (m, n_{out})$ |
| **Shape tracking** | Always verify shapes match between layers |
| **`forward()` method** | Define the computation graph in PyTorch |
| **Use `model(x)`** | Never call `model.forward(x)` directly |
| **Intermediate values** | Saved during forward pass, needed for backpropagation |

---

## What's Next?

Forward propagation tells us what the network predicts — but how do we know if the prediction is any good? In the next lesson, we'll learn about **loss functions** — the mathematical way to measure how wrong a prediction is.
