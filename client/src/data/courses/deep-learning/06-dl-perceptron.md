---
title: The Perceptron
---

# The Perceptron

The **perceptron** is the simplest possible neural network — a single artificial neuron that can learn to make decisions. It was invented in 1958 by Frank Rosenblatt, and it's where the entire field of deep learning begins.

In this lesson, you'll understand how a perceptron works, train one from scratch, and discover its famous limitation — the **XOR problem**.

---

## Biological Neuron Inspiration

The perceptron is inspired by how **biological neurons** work in your brain.

### How a Real Neuron Works

```
     Dendrites (inputs)
         │  │  │
         ▼  ▼  ▼
    ┌──────────────┐
    │   Cell Body   │ ← Sums up all incoming signals
    │   (Soma)      │
    └──────┬───────┘
           │
       Axon (output)
           │
           ▼
     Axon Terminals ──→ Next neuron
```

| Biological Part | What It Does | Artificial Equivalent |
|----------------|--------------|----------------------|
| **Dendrites** | Receive signals from other neurons | **Inputs** $x_1, x_2, \ldots, x_n$ |
| **Synapses** | Control signal strength (stronger = more important) | **Weights** $w_1, w_2, \ldots, w_n$ |
| **Cell body** | Sums up all incoming signals | **Weighted sum** $\sum w_i x_i + b$ |
| **Axon hillock** | Fires if sum exceeds a threshold | **Activation function** $f(z)$ |
| **Axon** | Transmits the output signal | **Output** $y$ |

> **Key insight:** A neuron either fires or doesn't — it's a binary decision. The perceptron mimics this with a **step function** that outputs 0 or 1.

---

## The Perceptron Model

A perceptron takes multiple inputs, multiplies each by a weight, adds a bias, and passes the result through an activation function:

$$y = f\left(\sum_{i=1}^{n} w_i x_i + b\right)$$

### Breaking It Down

**Step 1: Weighted Sum**

$$z = w_1 x_1 + w_2 x_2 + \cdots + w_n x_n + b = \mathbf{w} \cdot \mathbf{x} + b$$

Each input $x_i$ is multiplied by its weight $w_i$, which controls **how much that input matters**. The bias $b$ shifts the decision boundary.

**Step 2: Activation**

$$y = f(z)$$

The activation function converts the weighted sum into an output.

### Visual Representation

```
  x₁ ──w₁──┐
            │
  x₂ ──w₂──┤──→ [Σ + b] ──→ [f(z)] ──→ y
            │
  x₃ ──w₃──┘
```

---

## Weights, Bias, and Activation

### Weights ($w_i$)

Weights determine the **importance** of each input:
- **Large positive weight** → input strongly pushes output toward 1
- **Large negative weight** → input strongly pushes output toward 0
- **Zero weight** → input is ignored

### Bias ($b$)

The bias shifts the **decision boundary**. Think of it as the neuron's **default tendency**:
- **Positive bias** → neuron is more likely to fire (output 1)
- **Negative bias** → neuron is more likely to stay silent (output 0)

Without bias, the decision boundary must pass through the origin — bias gives the model more flexibility.

### Example with Numbers

Suppose we have a perceptron with 2 inputs:
- Inputs: $x_1 = 1$, $x_2 = 0$
- Weights: $w_1 = 0.5$, $w_2 = -0.3$
- Bias: $b = 0.1$

$$z = (0.5)(1) + (-0.3)(0) + 0.1 = 0.5 + 0 + 0.1 = 0.6$$

If using a step function with threshold 0: $f(0.6) = 1$ (fires!)

---

## Step Function as Activation

The original perceptron uses the **Heaviside step function**:

$$f(z) = \begin{cases} 1 & \text{if } z \geq 0 \\ 0 & \text{if } z < 0 \end{cases}$$

This produces a **binary output**: the neuron either fires (1) or doesn't (0).

```python
import torch

def step_function(z):
    """Heaviside step function."""
    return (z >= 0).float()

# Test it
z = torch.tensor([-2.0, -0.5, 0.0, 0.5, 2.0])
print(f"Input:  {z.tolist()}")
print(f"Output: {step_function(z).tolist()}")
# Input:  [-2.0, -0.5, 0.0, 0.5, 2.0]
# Output: [1.0, 1.0, 1.0, 1.0, 1.0]  → 0 for negatives, 1 otherwise
```

| Property | Value |
|----------|-------|
| **Range** | $\{0, 1\}$ |
| **Differentiable?** | No (discontinuous at 0) |
| **Use case** | Original perceptron only |
| **Why not used today?** | Can't compute gradients for backpropagation |

---

## The Perceptron Learning Rule

How does a perceptron **learn** the right weights? It uses a simple update rule:

$$w_i \leftarrow w_i + \alpha (y - \hat{y}) x_i$$

$$b \leftarrow b + \alpha (y - \hat{y})$$

Where:
- $\alpha$ = **learning rate** (how big each update step is)
- $y$ = **true label** (what the answer should be)
- $\hat{y}$ = **predicted label** (what the perceptron output)
- $x_i$ = **input value** for the $i$-th feature

### How It Works

| Scenario | $y - \hat{y}$ | What Happens |
|----------|---------------|--------------|
| Correct prediction | $0$ | No update — weights stay the same |
| Should be 1, predicted 0 | $+1$ | Increase weights for active inputs |
| Should be 0, predicted 1 | $-1$ | Decrease weights for active inputs |

> **Key insight:** The learning rule only updates when the perceptron makes a **mistake**. If the prediction is correct, nothing changes.

### Learning Rate ($\alpha$)

The learning rate controls the **step size** of each update:
- **Too large** → weights oscillate wildly, never converge
- **Too small** → learning is painfully slow
- **Just right** → smooth convergence to a solution

A typical starting value is $\alpha = 0.1$.

---

## Training a Perceptron for AND / OR Gates

Logic gates are the classic test for perceptrons. Let's see if a single perceptron can learn them.

### AND Gate Truth Table

| $x_1$ | $x_2$ | AND ($y$) |
|--------|--------|-----------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

### OR Gate Truth Table

| $x_1$ | $x_2$ | OR ($y$) |
|--------|--------|----------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

### Why These Work

Both AND and OR are **linearly separable** — you can draw a single straight line that separates the 0s from the 1s.

```
AND Gate:                    OR Gate:
  x₂                          x₂
  1 │  0    1                  1 │  1    1
    │     /                      │  /
    │   /                        │/
  0 │ 0  / 0                  0 │ 0    1
    └──────── x₁                 └──────── x₁
       0    1                       0    1

  Line separates 1 from 0     Line separates 1 from 0
```

---

## Code: Perceptron from Scratch

Let's implement a perceptron class and train it on AND and OR gates:

```python
import torch

class Perceptron:
    """A single perceptron (artificial neuron) with step activation."""

    def __init__(self, n_inputs, learning_rate=0.1):
        # Initialize weights to small random values
        self.weights = torch.zeros(n_inputs)
        self.bias = torch.tensor(0.0)
        self.lr = learning_rate

    def forward(self, x):
        """Compute perceptron output: step(w·x + b)."""
        z = torch.dot(self.weights, x) + self.bias
        return (z >= 0).float()  # Step function

    def train_step(self, x, y):
        """Update weights using the perceptron learning rule."""
        y_hat = self.forward(x)
        error = y - y_hat

        # Update rule: w_i ← w_i + α(y - ŷ)x_i
        self.weights += self.lr * error * x
        self.bias += self.lr * error
        return error.item()

    def fit(self, X, y, epochs=20):
        """Train on a dataset for multiple epochs."""
        for epoch in range(epochs):
            total_errors = 0
            for xi, yi in zip(X, y):
                error = self.train_step(xi, yi)
                if error != 0:
                    total_errors += 1

            if total_errors == 0:
                print(f"Converged at epoch {epoch + 1}!")
                return
        print(f"Finished {epochs} epochs (errors may remain)")

    def predict(self, X):
        """Predict outputs for a batch of inputs."""
        return torch.tensor([self.forward(x).item() for x in X])


# ─── AND Gate ───────────────────────────────────────────
print("=== AND Gate ===")
X = torch.tensor([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=torch.float32)
y_and = torch.tensor([0, 0, 0, 1], dtype=torch.float32)

p_and = Perceptron(n_inputs=2, learning_rate=0.1)
p_and.fit(X, y_and)

print("Predictions:")
for xi, yi in zip(X, y_and):
    pred = p_and.forward(xi)
    print(f"  {xi.tolist()} → {int(pred.item())}  (expected {int(yi.item())})")

print(f"Learned weights: {p_and.weights.tolist()}")
print(f"Learned bias:    {p_and.bias.item():.2f}")

# ─── OR Gate ────────────────────────────────────────────
print("\n=== OR Gate ===")
y_or = torch.tensor([0, 1, 1, 1], dtype=torch.float32)

p_or = Perceptron(n_inputs=2, learning_rate=0.1)
p_or.fit(X, y_or)

print("Predictions:")
for xi, yi in zip(X, y_or):
    pred = p_or.forward(xi)
    print(f"  {xi.tolist()} → {int(pred.item())}  (expected {int(yi.item())})")

print(f"Learned weights: {p_or.weights.tolist()}")
print(f"Learned bias:    {p_or.bias.item():.2f}")
```

---

## The XOR Problem

Now let's try the **XOR** (exclusive OR) gate:

| $x_1$ | $x_2$ | XOR ($y$) |
|--------|--------|-----------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

### Why a Single Perceptron Fails

XOR is **not linearly separable** — you cannot draw a single straight line to separate the 1s from the 0s:

```
  XOR Gate:
  x₂
  1 │  1    0
    │
    │
  0 │  0    1
    └──────── x₁
       0    1

  The 1s are on opposite corners!
  No single line can separate them.
```

A single perceptron computes $y = f(w_1 x_1 + w_2 x_2 + b)$, which defines a **single linear boundary**. XOR requires at least **two** lines — one perceptron isn't enough.

### Proving It Fails

```python
import torch

# XOR dataset
X = torch.tensor([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=torch.float32)
y_xor = torch.tensor([0, 1, 1, 0], dtype=torch.float32)

# Try to learn XOR with a single perceptron
print("=== XOR Gate (Single Perceptron) ===")
p_xor = Perceptron(n_inputs=2, learning_rate=0.1)
p_xor.fit(X, y_xor, epochs=100)

print("Predictions:")
for xi, yi in zip(X, y_xor):
    pred = p_xor.forward(xi)
    status = "✓" if pred.item() == yi.item() else "✗"
    print(f"  {xi.tolist()} → {int(pred.item())}  (expected {int(yi.item())}) {status}")
```

The perceptron **never converges** on XOR — it keeps oscillating and making mistakes. This is a fundamental limitation, not a training problem.

> **Historical note:** In 1969, Minsky and Papert published *Perceptrons*, proving that single-layer perceptrons cannot solve XOR. This led to the first "AI winter" — years of reduced funding and interest in neural networks.

---

## Multi-Layer Perceptrons (MLP) as the Solution

The solution to XOR is simple: **use more than one layer**!

A **multi-layer perceptron (MLP)** stacks perceptrons into layers:

```
  Input Layer      Hidden Layer     Output Layer
  (2 neurons)      (2 neurons)      (1 neuron)

    x₁ ─────────→ [h₁] ─────────→
                  ╲     ╱            [out] ──→ y
                   ╳   ╳
                  ╱     ╲
    x₂ ─────────→ [h₂] ─────────→
```

### How MLP Solves XOR

The hidden layer transforms the input into a **new representation** where XOR becomes linearly separable:

| $x_1$ | $x_2$ | $h_1$ (OR) | $h_2$ (NAND) | Output (AND of $h_1, h_2$) |
|--------|--------|-------------|---------------|---------------------------|
| 0 | 0 | 0 | 1 | 0 |
| 0 | 1 | 1 | 1 | 1 |
| 1 | 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 0 | 0 |

XOR = AND(OR($x_1, x_2$), NAND($x_1, x_2$))

> **Key insight:** Hidden layers learn **intermediate representations** that make the final decision easier. This is the core idea behind all deep learning!

---

## Code: MLP Solving XOR

Let's solve XOR by combining multiple perceptrons:

```python
import torch

class MLP_XOR:
    """
    A 2-layer perceptron network that solves XOR.
    Hidden layer: 2 neurons (OR + NAND)
    Output layer: 1 neuron (AND)
    """

    def __init__(self):
        # Hidden neuron 1: OR gate
        self.w1 = torch.tensor([1.0, 1.0])
        self.b1 = torch.tensor(-0.5)

        # Hidden neuron 2: NAND gate
        self.w2 = torch.tensor([-1.0, -1.0])
        self.b2 = torch.tensor(1.5)

        # Output neuron: AND gate
        self.w_out = torch.tensor([1.0, 1.0])
        self.b_out = torch.tensor(-1.5)

    def step(self, z):
        return (z >= 0).float()

    def forward(self, x):
        # Hidden layer
        h1 = self.step(torch.dot(self.w1, x) + self.b1)
        h2 = self.step(torch.dot(self.w2, x) + self.b2)
        h = torch.tensor([h1, h2])

        # Output layer
        out = self.step(torch.dot(self.w_out, h) + self.b_out)
        return out, h


# Test the MLP on XOR
print("=== MLP Solving XOR ===")
mlp = MLP_XOR()

X = torch.tensor([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=torch.float32)
y_xor = torch.tensor([0, 1, 1, 0], dtype=torch.float32)

print(f"{'x1':>3} {'x2':>3} │ {'h1(OR)':>6} {'h2(NAND)':>8} │ {'pred':>4} {'expected':>8}")
print("─" * 48)

for xi, yi in zip(X, y_xor):
    pred, hidden = mlp.forward(xi)
    status = "✓" if pred.item() == yi.item() else "✗"
    print(f"{int(xi[0]):>3} {int(xi[1]):>3} │ "
          f"{int(hidden[0]):>6} {int(hidden[1]):>8} │ "
          f"{int(pred):>4} {int(yi):>8} {status}")
```

---

## Code: Learning XOR with PyTorch

Now let's train an MLP to **learn** XOR automatically using gradient descent (preview of upcoming lessons):

```python
import torch
import torch.nn as nn

# XOR dataset
X = torch.tensor([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=torch.float32)
y = torch.tensor([[0], [1], [1], [0]], dtype=torch.float32)

# Define a 2-layer network
model = nn.Sequential(
    nn.Linear(2, 4),    # Hidden layer: 2 inputs → 4 neurons
    nn.ReLU(),           # Non-linear activation
    nn.Linear(4, 1),    # Output layer: 4 inputs → 1 output
    nn.Sigmoid()         # Squash to [0, 1]
)

# Training setup
loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.5)

# Train
print("=== Training MLP on XOR ===")
for epoch in range(1000):
    # Forward pass
    y_hat = model(X)
    loss = loss_fn(y_hat, y)

    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 200 == 0:
        preds = (y_hat > 0.5).float()
        accuracy = (preds == y).float().mean()
        print(f"Epoch {epoch+1:>4}: loss={loss.item():.4f}, "
              f"accuracy={accuracy.item():.0%}")

# Final predictions
print("\nFinal Predictions:")
with torch.no_grad():
    y_hat = model(X)
    for xi, yi, pred in zip(X, y, y_hat):
        label = int(yi.item())
        output = pred.item()
        print(f"  {xi.tolist()} → {output:.3f} "
              f"(rounded: {int(output > 0.5)}, expected: {label})")
```

---

## The Perceptron Convergence Theorem

There's a beautiful mathematical guarantee about perceptrons:

> **Theorem:** If the training data is **linearly separable**, the perceptron learning algorithm will converge to a correct solution in a **finite number of steps**.

This means:
- AND, OR, NAND, NOR → guaranteed to converge
- XOR → guaranteed to **not** converge (not linearly separable)

The number of steps depends on:
- The **margin** $\gamma$ — how far apart the classes are
- The **norm** of the data $R = \max \|\mathbf{x}_i\|$

The upper bound on mistakes is:

$$\text{mistakes} \leq \left(\frac{R}{\gamma}\right)^2$$

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Biological inspiration** | Perceptrons mimic neurons: receive inputs, weight them, threshold to fire |
| **Perceptron model** | $y = f(\mathbf{w} \cdot \mathbf{x} + b)$ with step activation |
| **Weights** | Control input importance; learned during training |
| **Bias** | Shifts decision boundary; gives model flexibility |
| **Learning rule** | $w_i \leftarrow w_i + \alpha(y - \hat{y})x_i$ — update only on errors |
| **AND / OR** | Linearly separable → single perceptron works |
| **XOR** | Not linearly separable → single perceptron fails |
| **MLP** | Multiple layers solve XOR by learning intermediate representations |
| **Convergence theorem** | Perceptron converges if data is linearly separable |

---

## What's Next?

The perceptron is just the beginning. In the next lesson, we'll scale up from a single neuron to full **neural networks** — layers of interconnected neurons that can learn incredibly complex patterns. You'll build your first neural network in PyTorch!
