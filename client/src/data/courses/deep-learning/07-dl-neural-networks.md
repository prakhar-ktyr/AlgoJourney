---
title: Neural Networks
---

# Neural Networks

In the previous lesson, you learned that a single perceptron can't solve XOR — but stacking perceptrons into **layers** can. That's exactly what a neural network is: layers of interconnected neurons that work together to learn complex patterns.

In this lesson, you'll understand neural network architecture from the ground up and build your first network in PyTorch.

---

## From Perceptron to Neural Network

A single perceptron can only learn **linear** decision boundaries. But when we connect many perceptrons into layers, something magical happens — the network can learn **any** function.

```
Single Perceptron:              Neural Network:

   x₁ ─w₁─┐                    x₁ ──→ [h₁] ──→
            ├─→ [f] → y              ╲ ╱    ╲ ╱
   x₂ ─w₂─┘                         ╳      ╳    [out] → y
                                     ╱ ╲    ╱ ╲
  Can learn: lines              x₂ ──→ [h₂] ──→
  Can't learn: XOR
                                Can learn: anything!
```

The key insight: **each layer transforms the data** into a new representation where the next layer's job is easier.

---

## Architecture: Input → Hidden → Output

Every neural network has three types of layers:

### 1. Input Layer

The input layer receives the raw data. It doesn't compute anything — it just passes data to the next layer.

| Property | Detail |
|----------|--------|
| **Number of neurons** | Equals the number of input features |
| **Computation** | None — just passes values through |
| **Example** | 784 neurons for a 28×28 grayscale image |

### 2. Hidden Layers

Hidden layers are where the **learning happens**. Each neuron computes a weighted sum of its inputs, adds a bias, and applies an activation function.

| Property | Detail |
|----------|--------|
| **Number of layers** | You choose — more layers = deeper network |
| **Neurons per layer** | You choose — more neurons = wider network |
| **Computation** | $a^{[l]} = g(W^{[l]} a^{[l-1]} + b^{[l]})$ |
| **Why "hidden"?** | We don't directly observe their values |

### 3. Output Layer

The output layer produces the final prediction. Its shape depends on the task.

| Task | Output Neurons | Activation | Example |
|------|---------------|------------|---------|
| Binary classification | 1 | Sigmoid | Spam or not spam |
| Multi-class (10 classes) | 10 | Softmax | Digit recognition (0–9) |
| Regression | 1 | None (linear) | Predict house price |
| Multi-output regression | $k$ | None | Predict $(x, y)$ coordinates |

### Putting It Together

```
 Input Layer      Hidden Layer 1    Hidden Layer 2    Output Layer
 (3 features)     (4 neurons)       (4 neurons)       (1 neuron)

   x₁ ─────────→ [h₁₁] ─────────→ [h₂₁] ─────────→
   │            ╱ [h₁₂] ─────────→ [h₂₂]           ╲
   x₂ ────────╳  [h₁₃] ─────────→ [h₂₃] ───────────→ [out] → ŷ
   │            ╲ [h₁₄] ─────────→ [h₂₄]           ╱
   x₃ ─────────→                                 ──→

   3 inputs        4 neurons          4 neurons        1 output
```

---

## Fully Connected (Dense) Layers

In a **fully connected** (or **dense**) layer, every neuron in one layer is connected to every neuron in the next layer.

### What "Fully Connected" Means

If layer $l-1$ has $n$ neurons and layer $l$ has $m$ neurons:
- There are $n \times m$ **weight connections**
- Plus $m$ **bias terms** (one per neuron in layer $l$)
- Total parameters: $n \times m + m$

### Example: Counting Parameters

| Layer | Neurons In | Neurons Out | Weights | Biases | Total Params |
|-------|-----------|-------------|---------|--------|-------------|
| Input → Hidden 1 | 3 | 4 | $3 \times 4 = 12$ | 4 | **16** |
| Hidden 1 → Hidden 2 | 4 | 4 | $4 \times 4 = 16$ | 4 | **20** |
| Hidden 2 → Output | 4 | 1 | $4 \times 1 = 4$ | 1 | **5** |
| **Total** | | | **32** | **9** | **41** |

A tiny network with just 3 inputs and 2 hidden layers already has 41 learnable parameters. Real networks have **millions** or even **billions**.

---

## How a Network Transforms Data

Each layer applies a **linear transformation** followed by a **non-linear activation**. Let's trace how data flows through a network.

### Layer-by-Layer Transformation

**Layer 1 — Linear:**

$$z^{[1]} = W^{[1]} x + b^{[1]}$$

This rotates, scales, and shifts the input space.

**Layer 1 — Activation:**

$$a^{[1]} = g(z^{[1]})$$

This bends and warps the space non-linearly.

**Layer 2 — Linear:**

$$z^{[2]} = W^{[2]} a^{[1]} + b^{[2]}$$

Another rotation, scale, and shift — but now in the **transformed** space.

**Layer 2 — Activation:**

$$a^{[2]} = g(z^{[2]})$$

Another non-linear warp.

### The Big Picture

```
Input Space         After Layer 1        After Layer 2
  (raw data)        (features)           (prediction)

   ● ○ ○              ●  ○                  ●
  ○ ● ○ ●      →      ○  ●         →        ○
   ● ○ ●              ●  ○
  ○ ● ○                   ○                Line!

 Not separable      Stretched &          Linearly
  by a line         warped              separable!
```

> **Key insight:** Each layer **untangles** the data a little more, until the final layer can separate it with a simple linear boundary.

---

## Width vs. Depth

Two fundamental choices when designing a neural network:

### Width: Neurons Per Layer

**Wider** networks (more neurons per layer) can represent more complex functions within a single layer.

```
Narrow (2 neurons):        Wide (8 neurons):
  x → [h₁] → y             x → [h₁][h₂][h₃][h₄] → y
      [h₂]                      [h₅][h₆][h₇][h₈]
```

### Depth: Number of Layers

**Deeper** networks (more layers) can learn **hierarchical features** — building complex concepts from simple ones.

```
Shallow (1 hidden):        Deep (4 hidden):
  x → [H₁] → y             x → [H₁] → [H₂] → [H₃] → [H₄] → y
```

### Width vs. Depth Trade-offs

| Property | Wide Network | Deep Network |
|----------|-------------|--------------|
| **Features** | Many features per layer | Hierarchical features |
| **Parameters** | Grows quadratically with width | Grows linearly with depth |
| **Training** | Easier to optimize | Harder (vanishing gradients) |
| **Representation** | Can memorize | Generalizes better |
| **Typical use** | Tabular data | Images, text, audio |

> **Rule of thumb:** In practice, deeper networks with moderate width outperform shallow-wide networks for most complex tasks. Modern networks are often both deep **and** wide.

---

## Universal Approximation Theorem

One of the most important results in neural network theory:

> **Universal Approximation Theorem:** A neural network with a single hidden layer containing a finite number of neurons can approximate any continuous function on a compact subset of $\mathbb{R}^n$, to any desired accuracy.

### What This Means

- A 1-hidden-layer network can theoretically learn **any** function
- But it might need an **enormous** number of neurons
- In practice, deeper networks are far more **efficient** — they need fewer total parameters

### Analogy

Think of it like building with LEGO:
- **Wide network** = using every possible shape of brick (1 layer, many pieces)
- **Deep network** = building step by step — small bricks → walls → rooms → building (many layers, fewer pieces total)

Both can build anything, but the layered approach is far more practical.

---

## PyTorch nn.Module

In PyTorch, every neural network is built by subclassing `nn.Module`. This is the base class for all neural network components.

### The nn.Module Pattern

```python
import torch
import torch.nn as nn

class MyNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        # Define layers here
        self.layer1 = nn.Linear(3, 4)
        self.layer2 = nn.Linear(4, 1)

    def forward(self, x):
        # Define how data flows through layers
        x = self.layer1(x)
        x = torch.relu(x)
        x = self.layer2(x)
        return x

# Create the network
model = MyNetwork()
print(model)
```

### Key Rules

| Rule | Detail |
|------|--------|
| **Inherit from `nn.Module`** | Always call `super().__init__()` first |
| **Define layers in `__init__`** | So PyTorch can track parameters |
| **Define `forward()`** | Specifies how data flows through the network |
| **Never call `forward()` directly** | Use `model(x)` which calls `forward()` plus hooks |

### Inspecting Your Model

```python
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(3, 4)
        self.layer2 = nn.Linear(4, 1)

    def forward(self, x):
        x = torch.relu(self.layer1(x))
        x = self.layer2(x)
        return x

model = SimpleNet()

# See all parameters
print("Parameters:")
for name, param in model.named_parameters():
    print(f"  {name:20s} shape={list(param.shape):>12s}  "
          f"params={param.numel()}")

total = sum(p.numel() for p in model.parameters())
print(f"\nTotal parameters: {total}")
```

---

## nn.Linear: The Dense Layer

`nn.Linear(in_features, out_features)` is PyTorch's fully connected layer. It computes:

$$y = xW^T + b$$

Where $W$ has shape `(out_features, in_features)` and $b$ has shape `(out_features,)`.

```python
import torch
import torch.nn as nn

# A linear layer: 3 inputs → 4 outputs
layer = nn.Linear(3, 4)

# Check the weight and bias
print(f"Weight shape: {layer.weight.shape}")  # (4, 3)
print(f"Bias shape:   {layer.bias.shape}")    # (4,)
print(f"Weight:\n{layer.weight.data}")
print(f"Bias: {layer.bias.data}")

# Forward pass: single sample
x = torch.tensor([1.0, 2.0, 3.0])
y = layer(x)
print(f"\nInput:  {x}")
print(f"Output: {y}")
print(f"Output shape: {y.shape}")  # (4,)

# Forward pass: batch of 5 samples
batch = torch.randn(5, 3)
out = layer(batch)
print(f"\nBatch input shape:  {batch.shape}")   # (5, 3)
print(f"Batch output shape: {out.shape}")       # (5, 4)
```

> **Note:** `nn.Linear` initializes weights using **Kaiming uniform** initialization by default — a smart initialization scheme we'll cover later.

---

## nn.Sequential: Quick Network Building

For simple networks where data flows straight through each layer (no branching), `nn.Sequential` is a shortcut:

```python
import torch
import torch.nn as nn

# Build the same network with nn.Sequential
model = nn.Sequential(
    nn.Linear(3, 4),     # Input (3) → Hidden (4)
    nn.ReLU(),            # Activation
    nn.Linear(4, 4),     # Hidden (4) → Hidden (4)
    nn.ReLU(),            # Activation
    nn.Linear(4, 1)      # Hidden (4) → Output (1)
)

print(model)
# Sequential(
#   (0): Linear(in_features=3, out_features=4, bias=True)
#   (1): ReLU()
#   (2): Linear(in_features=4, out_features=4, bias=True)
#   (3): ReLU()
#   (4): Linear(in_features=4, out_features=1, bias=True)
# )

# Test with random input
x = torch.randn(10, 3)  # Batch of 10 samples, 3 features each
y = model(x)
print(f"\nInput shape:  {x.shape}")   # (10, 3)
print(f"Output shape: {y.shape}")     # (10, 1)

# Count parameters
total = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total}")
# 3*4+4 + 4*4+4 + 4*1+1 = 16 + 20 + 5 = 41
```

### nn.Module vs nn.Sequential

| Feature | `nn.Module` subclass | `nn.Sequential` |
|---------|---------------------|-----------------|
| **Flexibility** | Full control over forward pass | Linear (sequential) flow only |
| **Skip connections** | Yes (ResNet-style) | No |
| **Multiple inputs/outputs** | Yes | No |
| **Conditional logic** | Yes | No |
| **Best for** | Complex architectures | Simple, linear stacks |

---

## Code: Build a 2-Layer Neural Network

Let's build and test a complete neural network both ways — with `nn.Module` and `nn.Sequential`:

```python
import torch
import torch.nn as nn

# ─── Method 1: nn.Module ──────────────────────────────
class TwoLayerNet(nn.Module):
    """A neural network with 2 hidden layers."""

    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.layer2 = nn.Linear(hidden_size, hidden_size)
        self.output = nn.Linear(hidden_size, output_size)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.layer1(x))    # Input → Hidden 1
        x = self.relu(self.layer2(x))    # Hidden 1 → Hidden 2
        x = self.output(x)               # Hidden 2 → Output
        return x


# ─── Method 2: nn.Sequential ──────────────────────────
def make_two_layer_net(input_size, hidden_size, output_size):
    return nn.Sequential(
        nn.Linear(input_size, hidden_size),
        nn.ReLU(),
        nn.Linear(hidden_size, hidden_size),
        nn.ReLU(),
        nn.Linear(hidden_size, output_size),
    )


# ─── Create and compare both ──────────────────────────
input_size = 10
hidden_size = 32
output_size = 3

model1 = TwoLayerNet(input_size, hidden_size, output_size)
model2 = make_two_layer_net(input_size, hidden_size, output_size)

# Generate random input batch
batch_size = 8
x = torch.randn(batch_size, input_size)

# Forward pass through both
y1 = model1(x)
y2 = model2(x)

print("=== Two-Layer Neural Network ===\n")
print("Model 1 (nn.Module):")
print(model1)
print(f"Output shape: {y1.shape}")  # (8, 3)

print(f"\nModel 2 (nn.Sequential):")
print(model2)
print(f"Output shape: {y2.shape}")  # (8, 3)

# Parameter counts
params1 = sum(p.numel() for p in model1.parameters())
params2 = sum(p.numel() for p in model2.parameters())
print(f"\nModel 1 parameters: {params1}")
print(f"Model 2 parameters: {params2}")
# Both: 10*32+32 + 32*32+32 + 32*3+3 = 352 + 1056 + 99 = 1507
```

---

## Code: Training a Neural Network on Synthetic Data

Let's put everything together — build a network, generate data, and train it:

```python
import torch
import torch.nn as nn

# ─── Generate synthetic data ──────────────────────────
torch.manual_seed(42)

# Create a non-linear classification problem
n_samples = 500
X = torch.randn(n_samples, 2)

# Class 1: points inside a circle of radius 1
# Class 0: points outside
distances = X.norm(dim=1)
y = (distances < 1.0).float().unsqueeze(1)

print(f"Dataset: {n_samples} samples, {int(y.sum())} positive, "
      f"{int(n_samples - y.sum())} negative")

# ─── Define the network ───────────────────────────────
model = nn.Sequential(
    nn.Linear(2, 16),
    nn.ReLU(),
    nn.Linear(16, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
    nn.Sigmoid()
)

loss_fn = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# ─── Training loop ────────────────────────────────────
print("\n=== Training ===")
for epoch in range(200):
    # Forward pass
    y_hat = model(X)
    loss = loss_fn(y_hat, y)

    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # Log every 40 epochs
    if (epoch + 1) % 40 == 0:
        with torch.no_grad():
            preds = (y_hat > 0.5).float()
            accuracy = (preds == y).float().mean()
        print(f"Epoch {epoch+1:>3}: loss={loss.item():.4f}, "
              f"accuracy={accuracy.item():.1%}")

# ─── Final evaluation ─────────────────────────────────
print("\n=== Final Results ===")
with torch.no_grad():
    y_hat = model(X)
    preds = (y_hat > 0.5).float()
    accuracy = (preds == y).float().mean()
    print(f"Final accuracy: {accuracy.item():.1%}")

    # Test with specific points
    test_points = torch.tensor([
        [0.0, 0.0],    # Inside circle → 1
        [0.5, 0.5],    # Inside circle → 1
        [2.0, 2.0],    # Outside circle → 0
        [0.0, 1.5],    # Outside circle → 0
    ])
    test_preds = model(test_points)
    print("\nTest predictions:")
    for point, pred in zip(test_points, test_preds):
        print(f"  ({point[0]:.1f}, {point[1]:.1f}) → "
              f"{pred.item():.3f} → class {int(pred.item() > 0.5)}")
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Neural network** | Layers of interconnected neurons that learn complex patterns |
| **Input layer** | Receives raw data; size = number of features |
| **Hidden layers** | Learn intermediate representations; you choose size and count |
| **Output layer** | Produces final prediction; shape depends on task |
| **Fully connected** | Every neuron connects to every neuron in the next layer |
| **Width** | Neurons per layer — wider = more features per layer |
| **Depth** | Number of layers — deeper = hierarchical features |
| **Universal approximation** | One hidden layer can approximate any function (in theory) |
| **`nn.Module`** | Base class for all PyTorch networks; define `__init__` + `forward` |
| **`nn.Linear(in, out)`** | Fully connected layer: $y = xW^T + b$ |
| **`nn.Sequential`** | Shortcut for simple sequential architectures |

---

## What's Next?

You've built your first neural network — but it's using `nn.ReLU()` without understanding why. In the next lesson, we'll dive deep into **activation functions** — what they are, why they're essential, and how to choose the right one.
