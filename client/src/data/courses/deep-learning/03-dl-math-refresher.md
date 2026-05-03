---
title: Math for Deep Learning
---

# Math for Deep Learning

Don't let the math scare you! In this lesson, we'll cover the **essential math** you need for deep learning — with **code examples** for every concept. You don't need to be a mathematician — you just need to understand the intuition and know how to compute things with NumPy.

---

## Why Math Matters in Deep Learning

Every operation in a neural network is a **math operation**:

| Neural Network Operation | Math Concept |
|-------------------------|--------------|
| Combining inputs with weights | Matrix multiplication |
| Computing gradients | Derivatives & chain rule |
| Updating weights | Gradient descent (calculus) |
| Loss functions | Probability & statistics |
| Data preprocessing | Linear algebra |

Let's review each area with examples.

---

## Part 1: Linear Algebra

Linear algebra is the **language** of deep learning. Neural networks are essentially sequences of matrix operations.

### Scalars

A **scalar** is a single number.

$$x = 5$$

In deep learning, scalars appear as learning rates, loss values, and individual predictions.

```python
import numpy as np

# Scalars
learning_rate = 0.001
loss = 2.45
temperature = 0.7

print(f"Learning rate: {learning_rate}")
print(f"Loss: {loss}")
```

### Vectors

A **vector** is an ordered list of numbers — a 1D array.

$$\mathbf{v} = \begin{bmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{bmatrix}$$

In deep learning, vectors represent: input features, neuron outputs, biases, and gradients.

```python
# Vectors
v = np.array([1.0, 2.0, 3.0, 4.0])
print(f"Vector: {v}")
print(f"Shape: {v.shape}")    # (4,)
print(f"Dimension: {v.ndim}") # 1

# Vector operations
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Element-wise operations
print(f"a + b = {a + b}")     # [5, 7, 9]
print(f"a * b = {a * b}")     # [4, 10, 18]
print(f"2 * a = {2 * a}")     # [2, 4, 6]
```

### Dot Product

The **dot product** of two vectors is the sum of their element-wise products:

$$\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i = a_1 b_1 + a_2 b_2 + \cdots + a_n b_n$$

This is the **most fundamental operation** in neural networks — it's how a neuron combines its inputs.

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Dot product — three equivalent ways
dot1 = np.dot(a, b)        # 1*4 + 2*5 + 3*6 = 32
dot2 = a @ b               # Same thing — the @ operator
dot3 = np.sum(a * b)       # Manual: element-wise multiply, then sum

print(f"np.dot(a, b) = {dot1}")
print(f"a @ b = {dot2}")
print(f"sum(a * b) = {dot3}")

# Neuron example: output = dot(weights, inputs) + bias
weights = np.array([0.5, -0.3, 0.8])
inputs = np.array([1.0, 2.0, 3.0])
bias = 0.1

output = np.dot(weights, inputs) + bias
print(f"\nNeuron output: {output}")  # 0.5 - 0.6 + 2.4 + 0.1 = 2.4
```

### Matrices

A **matrix** is a 2D array of numbers with $m$ rows and $n$ columns.

$$\mathbf{A} = \begin{bmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \end{bmatrix}$$

This matrix $\mathbf{A}$ has shape $2 \times 3$ (2 rows, 3 columns).

In deep learning, matrices represent: weight matrices, batches of data, and image channels.

```python
# Creating matrices
A = np.array([[1, 2, 3],
              [4, 5, 6]])
print(f"Matrix A:\n{A}")
print(f"Shape: {A.shape}")  # (2, 3)

# Accessing elements
print(f"A[0, 1] = {A[0, 1]}")  # Row 0, Col 1 = 2
print(f"A[1, :] = {A[1, :]}")  # Row 1 = [4, 5, 6]
print(f"A[:, 2] = {A[:, 2]}")  # Col 2 = [3, 6]

# Special matrices
zeros = np.zeros((3, 3))      # All zeros
ones = np.ones((2, 4))        # All ones
eye = np.eye(3)               # Identity matrix
rand = np.random.randn(3, 3)  # Random (normal distribution)
```

### Matrix Multiplication

Matrix multiplication is the **core computation** of neural networks.

For matrices $\mathbf{A}$ ($m \times k$) and $\mathbf{B}$ ($k \times n$), the product $\mathbf{C} = \mathbf{A}\mathbf{B}$ has shape $m \times n$, where:

$$C_{ij} = \sum_{p=1}^{k} A_{ip} B_{pj}$$

**Rule:** The number of **columns** in $\mathbf{A}$ must equal the number of **rows** in $\mathbf{B}$.

```python
# Matrix multiplication
A = np.array([[1, 2],
              [3, 4],
              [5, 6]])  # Shape: (3, 2)

B = np.array([[7, 8, 9],
              [10, 11, 12]])  # Shape: (2, 3)

C = A @ B  # Shape: (3, 3)
print(f"A @ B =\n{C}")
# [[ 27  30  33]
#  [ 61  68  75]
#  [ 95 106 117]]

# Verify: C[0,0] = 1*7 + 2*10 = 27 ✓

# In a neural network: output = input @ weights + bias
batch_size = 4
input_features = 3
output_features = 2

X = np.random.randn(batch_size, input_features)    # (4, 3)
W = np.random.randn(input_features, output_features)  # (3, 2)
b = np.random.randn(output_features)                # (2,)

output = X @ W + b  # (4, 2) — each row is one sample's output
print(f"\nInput shape: {X.shape}")
print(f"Weight shape: {W.shape}")
print(f"Output shape: {output.shape}")
```

### Transpose

The **transpose** of a matrix flips it along its diagonal — rows become columns and columns become rows.

$$(\mathbf{A}^T)_{ij} = A_{ji}$$

If $\mathbf{A}$ has shape $m \times n$, then $\mathbf{A}^T$ has shape $n \times m$.

```python
A = np.array([[1, 2, 3],
              [4, 5, 6]])  # Shape: (2, 3)

print(f"A:\n{A}")
print(f"A.T:\n{A.T}")      # Shape: (3, 2)
# [[1, 4],
#  [2, 5],
#  [3, 6]]

# Useful property: (AB)^T = B^T A^T
B = np.random.randn(3, 4)
print(f"\n(A @ B)^T shape: {(A @ B).T.shape}")    # (4, 2)
print(f"B^T @ A^T shape: {(B.T @ A.T).shape}")    # (4, 2)
```

### Vector Norms

The **norm** of a vector measures its **magnitude** (length). The most common norm is the $L_2$ (Euclidean) norm:

$$\|\mathbf{v}\|_2 = \sqrt{\sum_{i=1}^{n} v_i^2}$$

Other norms used in deep learning:
- $L_1$ norm: $\|\mathbf{v}\|_1 = \sum_{i} |v_i|$ (used in Lasso regularization)
- $L_2$ norm: $\|\mathbf{v}\|_2 = \sqrt{\sum_{i} v_i^2}$ (used in Ridge regularization, weight decay)

```python
v = np.array([3.0, 4.0])

# L2 norm (Euclidean distance)
l2 = np.linalg.norm(v)            # sqrt(9 + 16) = 5.0
print(f"L2 norm: {l2}")

# L1 norm (Manhattan distance)
l1 = np.linalg.norm(v, ord=1)     # |3| + |4| = 7.0
print(f"L1 norm: {l1}")

# Normalizing a vector (make it unit length)
v_normalized = v / np.linalg.norm(v)
print(f"Normalized: {v_normalized}")         # [0.6, 0.8]
print(f"Norm of normalized: {np.linalg.norm(v_normalized)}")  # 1.0
```

### Tensors

A **tensor** is the generalization of scalars, vectors, and matrices to any number of dimensions:

| Rank | Name | Shape Example | Deep Learning Use |
|------|------|---------------|-------------------|
| 0 | Scalar | `()` | Loss value, learning rate |
| 1 | Vector | `(n,)` | Bias, 1D signal |
| 2 | Matrix | `(m, n)` | Weight matrix, grayscale image |
| 3 | 3D Tensor | `(c, h, w)` | Color image (channels, height, width) |
| 4 | 4D Tensor | `(b, c, h, w)` | Batch of color images |
| 5 | 5D Tensor | `(b, t, c, h, w)` | Batch of video clips |

```python
# Different tensor ranks
scalar = np.array(3.14)               # Rank 0
vector = np.array([1, 2, 3])           # Rank 1
matrix = np.array([[1, 2], [3, 4]])    # Rank 2
tensor3d = np.random.randn(3, 32, 32)  # Rank 3 (e.g., RGB image)
tensor4d = np.random.randn(16, 3, 32, 32)  # Rank 4 (batch of images)

for name, t in [("Scalar", scalar), ("Vector", vector),
                ("Matrix", matrix), ("3D", tensor3d), ("4D", tensor4d)]:
    print(f"{name}: ndim={t.ndim}, shape={t.shape}")
```

### Eigenvalues (Brief)

A square matrix $\mathbf{A}$ has **eigenvalues** $\lambda$ and **eigenvectors** $\mathbf{v}$ satisfying:

$$\mathbf{A}\mathbf{v} = \lambda \mathbf{v}$$

The eigenvector $\mathbf{v}$ is a direction that $\mathbf{A}$ only **scales** (by $\lambda$), not rotates.

In deep learning, eigenvalues appear in:
- **PCA** (dimensionality reduction)
- Understanding **weight matrix conditioning** (affects training stability)
- **Spectral normalization** (regularization for GANs)

```python
A = np.array([[4, 1],
              [2, 3]])

eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")    # [5. 2.]
print(f"Eigenvectors:\n{eigenvectors}")

# Verify: A @ v = lambda * v
v = eigenvectors[:, 0]
lam = eigenvalues[0]
print(f"\nA @ v = {A @ v}")
print(f"λ * v = {lam * v}")  # Should match
```

---

## Part 2: Calculus

Calculus is how neural networks **learn**. Specifically, we use derivatives to figure out how to adjust weights to reduce the loss.

### Derivatives

The **derivative** of a function $f(x)$ measures how fast $f$ changes when $x$ changes:

$$f'(x) = \frac{df}{dx} = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$

**Intuition:** The derivative is the **slope** of the function at a point.

Common derivatives used in deep learning:

| Function $f(x)$ | Derivative $f'(x)$ | Used In |
|-----------------|-------------------|---------|
| $x^n$ | $nx^{n-1}$ | Polynomial features |
| $e^x$ | $e^x$ | Softmax, probability |
| $\ln(x)$ | $1/x$ | Cross-entropy loss |
| $\sigma(x) = \frac{1}{1+e^{-x}}$ | $\sigma(x)(1-\sigma(x))$ | Sigmoid activation |
| $\tanh(x)$ | $1 - \tanh^2(x)$ | Tanh activation |
| $\max(0, x)$ | $\begin{cases} 1 & x > 0 \\ 0 & x \leq 0 \end{cases}$ | ReLU activation |

```python
# Numerical derivative approximation
def numerical_derivative(f, x, h=1e-7):
    return (f(x + h) - f(x - h)) / (2 * h)

# Example: derivative of x^2 is 2x
f = lambda x: x ** 2
x = 3.0
print(f"f(x) = x², f'(3) ≈ {numerical_derivative(f, x):.4f}")  # ~6.0

# Sigmoid and its derivative
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

x = np.linspace(-5, 5, 100)
print(f"sigmoid(0) = {sigmoid(0):.4f}")             # 0.5
print(f"sigmoid'(0) = {sigmoid_derivative(0):.4f}")  # 0.25

# ReLU and its derivative
def relu(x):
    return np.maximum(0, x)

def relu_derivative(x):
    return (x > 0).astype(float)

print(f"\nReLU(-2) = {relu(-2)}")       # 0
print(f"ReLU(3) = {relu(3)}")           # 3
print(f"ReLU'(-2) = {relu_derivative(-2)}")  # 0
print(f"ReLU'(3) = {relu_derivative(3)}")    # 1
```

### The Chain Rule

The **chain rule** is the **most important calculus concept** for deep learning. It's how backpropagation works.

If $y = f(g(x))$, then:

$$\frac{dy}{dx} = \frac{df}{dg} \cdot \frac{dg}{dx}$$

**Intuition:** To find how $x$ affects $y$, multiply the sensitivities along the chain.

```python
# Chain rule example: y = (3x + 2)^2
# Let g(x) = 3x + 2, f(g) = g^2
# dy/dx = df/dg * dg/dx = 2g * 3 = 6(3x + 2)

def y(x):
    return (3 * x + 2) ** 2

x = 1.0
# Analytical: dy/dx = 6(3*1 + 2) = 6*5 = 30
analytical = 6 * (3 * x + 2)
numerical = numerical_derivative(y, x)

print(f"Analytical derivative: {analytical}")
print(f"Numerical derivative: {numerical:.6f}")

# Neural network chain rule example:
# loss = (y_pred - y_true)^2
# y_pred = sigmoid(w*x + b)
# How does loss change when we change w?
# d(loss)/dw = d(loss)/d(y_pred) * d(y_pred)/d(z) * d(z)/dw
# where z = w*x + b
```

### Deeper Chain Rule — Backpropagation Preview

In a network with multiple layers, the chain rule **chains** through all layers:

$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial a_3} \cdot \frac{\partial a_3}{\partial a_2} \cdot \frac{\partial a_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial w_1}$$

Where $a_i$ is the activation of layer $i$ and $L$ is the loss.

This is exactly what **backpropagation** computes — it applies the chain rule backward through the network.

```python
# A simple 2-layer network forward + backward pass

# Forward pass
x = 2.0       # input
w1 = 0.5      # weight 1
w2 = -0.3     # weight 2
y_true = 1.0  # target

z1 = w1 * x        # layer 1 pre-activation: 1.0
a1 = max(0, z1)    # ReLU: 1.0
z2 = w2 * a1       # layer 2 pre-activation: -0.3
y_pred = z2         # prediction: -0.3
loss = (y_pred - y_true) ** 2  # MSE loss: 1.69

print(f"Forward pass:")
print(f"  z1={z1}, a1={a1}, z2={z2}, y_pred={y_pred}, loss={loss}")

# Backward pass (chain rule)
dL_dy = 2 * (y_pred - y_true)      # d(loss)/d(y_pred) = -2.6
dy_dz2 = 1                          # d(y_pred)/d(z2) = 1
dz2_da1 = w2                        # d(z2)/d(a1) = w2 = -0.3
da1_dz1 = 1.0 if z1 > 0 else 0.0   # ReLU derivative = 1
dz1_dw1 = x                         # d(z1)/d(w1) = x = 2

# Chain it all together
dL_dw1 = dL_dy * dy_dz2 * dz2_da1 * da1_dz1 * dz1_dw1
dL_dw2 = dL_dy * dy_dz2 * 1 * a1  # d(z2)/d(w2) = a1

print(f"\nBackward pass:")
print(f"  dL/dw1 = {dL_dw1}")
print(f"  dL/dw2 = {dL_dw2}")
```

### Partial Derivatives

When a function has **multiple inputs**, we take the **partial derivative** with respect to each input separately (treating others as constants):

$$f(x, y) = x^2 + 3xy + y^2$$

$$\frac{\partial f}{\partial x} = 2x + 3y \qquad \frac{\partial f}{\partial y} = 3x + 2y$$

In neural networks, the loss depends on **millions of weights** — we need the partial derivative with respect to each one.

```python
# Partial derivatives example
def f(x, y):
    return x**2 + 3*x*y + y**2

# Partial derivative with respect to x (hold y constant)
def df_dx(x, y, h=1e-7):
    return (f(x + h, y) - f(x - h, y)) / (2 * h)

# Partial derivative with respect to y (hold x constant)
def df_dy(x, y, h=1e-7):
    return (f(x, y + h) - f(x, y - h)) / (2 * h)

x, y = 2.0, 3.0
print(f"f({x}, {y}) = {f(x, y)}")
print(f"∂f/∂x = {df_dx(x, y):.4f}")  # Analytical: 2(2) + 3(3) = 13
print(f"∂f/∂y = {df_dy(x, y):.4f}")  # Analytical: 3(2) + 2(3) = 12
```

### Gradients

The **gradient** is a vector of all partial derivatives:

$$\nabla f = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_n} \end{bmatrix}$$

The gradient points in the direction of **steepest increase** of $f$.

To **minimize** the loss (what we want in training), we move in the **opposite** direction of the gradient:

$$\mathbf{w}_{\text{new}} = \mathbf{w}_{\text{old}} - \eta \nabla L(\mathbf{w})$$

This is **gradient descent** — the foundation of neural network training.

```python
# Gradient descent on f(x, y) = x^2 + y^2
# Minimum is at (0, 0)

def f(params):
    x, y = params
    return x**2 + y**2

def gradient(params):
    x, y = params
    return np.array([2*x, 2*y])

# Start far from the minimum
params = np.array([5.0, 3.0])
learning_rate = 0.1

print("Gradient Descent:")
for step in range(15):
    loss = f(params)
    grad = gradient(params)
    params = params - learning_rate * grad
    if step % 3 == 0:
        print(f"  Step {step:2d}: x={params[0]:7.4f}, "
              f"y={params[1]:7.4f}, loss={loss:.6f}")

print(f"  Final:  x={params[0]:7.4f}, y={params[1]:7.4f}, "
      f"loss={f(params):.6f}")
```

---

## Part 3: Probability & Statistics

Probability appears everywhere in deep learning — from loss functions to generative models.

### Probability Basics

A **probability** $P(A)$ is a number between 0 and 1 representing how likely event $A$ is:

- $P(A) = 0$: impossible
- $P(A) = 1$: certain
- $P(A) = 0.5$: equally likely as not

**Key rules:**

$$P(\text{not } A) = 1 - P(A)$$

$$P(A \text{ or } B) = P(A) + P(B) - P(A \text{ and } B)$$

$$P(A \text{ and } B) = P(A) \cdot P(B|A)$$

### Probability Distributions

A **probability distribution** describes all possible outcomes and their probabilities.

```python
# Discrete distribution: rolling a die
outcomes = [1, 2, 3, 4, 5, 6]
probabilities = [1/6] * 6  # Uniform distribution

print("Fair die:")
for o, p in zip(outcomes, probabilities):
    print(f"  P(X={o}) = {p:.4f}")

# Continuous distribution: Normal (Gaussian)
# Most important distribution in deep learning!
# f(x) = (1/√(2πσ²)) * exp(-(x-μ)²/(2σ²))

mu, sigma = 0, 1  # Standard normal
samples = np.random.normal(mu, sigma, 10000)
print(f"\nNormal distribution (μ={mu}, σ={sigma}):")
print(f"  Sample mean: {np.mean(samples):.4f}")
print(f"  Sample std:  {np.std(samples):.4f}")

# Why normal distributions matter:
# - Weight initialization (random normal)
# - Batch normalization (normalizes to ~N(0,1))
# - VAEs (latent space is normal)
# - Noise injection (data augmentation)
```

### Softmax — From Scores to Probabilities

The **softmax** function converts raw scores (logits) into probabilities:

$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

Properties:
- All outputs are between 0 and 1
- All outputs sum to 1
- Larger inputs get larger probabilities

```python
def softmax(z):
    # Subtract max for numerical stability
    exp_z = np.exp(z - np.max(z))
    return exp_z / exp_z.sum()

# Raw model outputs (logits) for 3 classes
logits = np.array([2.0, 1.0, 0.1])
probs = softmax(logits)

print("Softmax conversion:")
print(f"  Logits: {logits}")
print(f"  Probabilities: {probs}")
print(f"  Sum: {probs.sum():.4f}")  # 1.0
print(f"  Predicted class: {np.argmax(probs)}")  # 0
```

### Cross-Entropy Loss

The **cross-entropy loss** measures how different two probability distributions are — it's the standard loss function for classification:

$$L = -\sum_{i=1}^{K} y_i \log(\hat{y}_i)$$

Where $y_i$ is the true label (one-hot) and $\hat{y}_i$ is the predicted probability.

For binary classification, this simplifies to:

$$L = -[y \log(\hat{y}) + (1-y) \log(1-\hat{y})]$$

```python
def cross_entropy(y_true, y_pred):
    # Clip to avoid log(0)
    y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
    return -np.sum(y_true * np.log(y_pred))

# True label: class 0 (one-hot encoded)
y_true = np.array([1, 0, 0])

# Good prediction (high confidence on correct class)
y_good = np.array([0.9, 0.05, 0.05])
loss_good = cross_entropy(y_true, y_good)

# Bad prediction (low confidence on correct class)
y_bad = np.array([0.1, 0.6, 0.3])
loss_bad = cross_entropy(y_true, y_bad)

print(f"Good prediction loss: {loss_good:.4f}")  # Low loss
print(f"Bad prediction loss:  {loss_bad:.4f}")    # High loss
```

### Bayes' Theorem

**Bayes' theorem** lets us update beliefs with new evidence:

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

While you won't use Bayes' theorem directly in most deep learning code, it's the theoretical foundation for:
- **Bayesian neural networks** — modeling uncertainty in predictions
- **Variational autoencoders (VAEs)** — generative models
- **Naive Bayes classifiers** — simple but effective text classifiers

```python
# Example: Medical test
# P(Disease) = 0.01 (1% of population has it)
# P(Positive | Disease) = 0.99 (99% sensitivity)
# P(Positive | No Disease) = 0.05 (5% false positive rate)
# What is P(Disease | Positive)?

p_disease = 0.01
p_pos_given_disease = 0.99
p_pos_given_no_disease = 0.05

# P(Positive) = P(Pos|Disease)*P(Disease) + P(Pos|No Disease)*P(No Disease)
p_positive = (p_pos_given_disease * p_disease +
              p_pos_given_no_disease * (1 - p_disease))

# Bayes' theorem
p_disease_given_pos = (p_pos_given_disease * p_disease) / p_positive

print(f"P(Disease | Positive Test) = {p_disease_given_pos:.4f}")
# ~0.1667 — only 17% chance! Even with 99% test accuracy.
# This is why understanding probability matters!
```

---

## Summary

Here's a cheat sheet of the math you'll use throughout this course:

| Concept | Formula | Deep Learning Use |
|---------|---------|-------------------|
| Dot product | $\mathbf{a} \cdot \mathbf{b} = \sum a_i b_i$ | Neuron computation |
| Matrix multiply | $C_{ij} = \sum_k A_{ik}B_{kj}$ | Layer forward pass |
| Transpose | $(A^T)_{ij} = A_{ji}$ | Weight matrix operations |
| Derivative | $f'(x) = \lim_{h \to 0} \frac{f(x+h)-f(x)}{h}$ | Rate of change |
| Chain rule | $\frac{df}{dx} = \frac{df}{dg} \cdot \frac{dg}{dx}$ | Backpropagation |
| Gradient | $\nabla f = [\frac{\partial f}{\partial x_1}, \ldots, \frac{\partial f}{\partial x_n}]$ | Direction of steepest ascent |
| Gradient descent | $w \leftarrow w - \eta \nabla L$ | Weight updates |
| Softmax | $\frac{e^{z_i}}{\sum e^{z_j}}$ | Output probabilities |
| Cross-entropy | $-\sum y_i \log \hat{y}_i$ | Classification loss |

> **Remember:** You don't need to derive these from scratch — you need to understand the **intuition** and know that PyTorch computes all gradients **automatically** via autograd. The math helps you debug, tune, and innovate.

---

## What's Next?

Now that we have the math foundations, let's set up our **Python environment** with PyTorch in the next lesson. We'll install everything you need to start building neural networks!
