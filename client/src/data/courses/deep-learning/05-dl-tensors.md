---
title: Tensors & Operations
---

# Tensors & Operations

Tensors are the **fundamental data structure** in deep learning. Every piece of data — images, text, audio — is converted into tensors before being processed by a neural network. In this lesson, you'll master tensor creation, manipulation, and computation in PyTorch.

---

## What Is a Tensor?

A **tensor** is a generalization of scalars, vectors, and matrices to any number of dimensions.

| Rank | Math Name | Shape Example | Real-World Example |
|------|-----------|---------------|-------------------|
| 0 | Scalar | `()` | Temperature: $72.5$ |
| 1 | Vector | `(3,)` | RGB color: $[255, 128, 0]$ |
| 2 | Matrix | `(28, 28)` | Grayscale image (28×28 pixels) |
| 3 | 3D Tensor | `(3, 32, 32)` | Color image (3 channels, 32×32) |
| 4 | 4D Tensor | `(64, 3, 224, 224)` | Batch of 64 color images |
| 5 | 5D Tensor | `(8, 16, 3, 224, 224)` | 8 video clips, 16 frames each |

> **Key insight:** In PyTorch, `torch.Tensor` is the equivalent of NumPy's `ndarray`, but with GPU support and automatic differentiation built in.

---

## Creating Tensors

### From Python Data

```python
import torch

# From a list
x = torch.tensor([1, 2, 3, 4])
print(f"1D: {x}")
print(f"Shape: {x.shape}")  # torch.Size([4])

# From a nested list (matrix)
m = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])
print(f"\n2D:\n{m}")
print(f"Shape: {m.shape}")  # torch.Size([2, 3])

# From a float list
f = torch.tensor([1.0, 2.0, 3.0])
print(f"\nFloat tensor: {f}")
print(f"dtype: {f.dtype}")  # torch.float32

# 3D tensor
t3d = torch.tensor([[[1, 2], [3, 4]],
                      [[5, 6], [7, 8]]])
print(f"\n3D tensor:\n{t3d}")
print(f"Shape: {t3d.shape}")  # torch.Size([2, 2, 2])
```

### Zeros, Ones, and Constants

```python
import torch

# All zeros
zeros = torch.zeros(3, 4)
print(f"Zeros (3x4):\n{zeros}")

# All ones
ones = torch.ones(2, 3)
print(f"\nOnes (2x3):\n{ones}")

# Filled with a specific value
fives = torch.full((2, 3), 5.0)
print(f"\nFull (2x3, value=5):\n{fives}")

# Empty (uninitialized — values are garbage, but fast)
empty = torch.empty(2, 2)
print(f"\nEmpty (2x2):\n{empty}")
```

### Random Tensors

Random tensors are crucial for **weight initialization** — every neural network starts with random weights.

```python
import torch

# Uniform random [0, 1)
uniform = torch.rand(3, 3)
print(f"Uniform [0,1):\n{uniform}")

# Normal distribution (mean=0, std=1)
normal = torch.randn(3, 3)
print(f"\nNormal (μ=0, σ=1):\n{normal}")

# Random integers
ints = torch.randint(low=0, high=10, size=(3, 3))
print(f"\nRandom ints [0,10):\n{ints}")

# Set seed for reproducibility
torch.manual_seed(42)
a = torch.randn(2, 2)
torch.manual_seed(42)
b = torch.randn(2, 2)
print(f"\nSame seed, same tensor: {torch.equal(a, b)}")  # True
```

### Ranges and Sequences

```python
import torch

# Range (like Python's range)
r = torch.arange(0, 10, 2)
print(f"arange(0, 10, 2): {r}")  # [0, 2, 4, 6, 8]

# Linearly spaced
lin = torch.linspace(0, 1, 5)
print(f"linspace(0, 1, 5): {lin}")  # [0.0, 0.25, 0.5, 0.75, 1.0]

# Log-spaced (useful for learning rate schedules)
log = torch.logspace(-3, 0, 4)
print(f"logspace(-3, 0, 4): {log}")  # [0.001, 0.01, 0.1, 1.0]
```

### From NumPy (and Back)

PyTorch and NumPy share memory — converting between them is **free** (no data copy):

```python
import torch
import numpy as np

# NumPy → PyTorch
np_array = np.array([1.0, 2.0, 3.0])
tensor = torch.from_numpy(np_array)
print(f"From NumPy: {tensor}")

# PyTorch → NumPy
back_to_numpy = tensor.numpy()
print(f"To NumPy: {back_to_numpy}")

# WARNING: They share memory!
np_array[0] = 999
print(f"After modifying NumPy: {tensor}")  # tensor also changed!

# To make an independent copy:
tensor_copy = torch.tensor(np_array)  # This copies the data
```

### Like-Tensors (Matching Shape/Type)

```python
import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])

# Create tensors with the same shape and dtype
z = torch.zeros_like(x)
o = torch.ones_like(x)
r = torch.randn_like(x)

print(f"Original: {x.shape}, dtype={x.dtype}")
print(f"zeros_like:\n{z}")
print(f"ones_like:\n{o}")
print(f"randn_like:\n{r}")
```

---

## Tensor Shapes

Understanding shapes is **critical** — most bugs in deep learning come from shape mismatches.

### Shape Properties

```python
import torch

t = torch.randn(2, 3, 4)

print(f"Shape: {t.shape}")       # torch.Size([2, 3, 4])
print(f"Size: {t.size()}")       # Same as .shape
print(f"Dimensions: {t.ndim}")   # 3
print(f"Total elements: {t.numel()}")  # 2*3*4 = 24

# Access individual dimensions
print(f"Dim 0: {t.shape[0]}")   # 2
print(f"Dim 1: {t.size(1)}")    # 3
print(f"Dim 2: {t.shape[2]}")   # 4
```

### Reshaping with `view()` and `reshape()`

Reshaping changes the **interpretation** of the data without changing the data itself.

```python
import torch

x = torch.arange(12)
print(f"Original: {x}")        # [0, 1, 2, ..., 11]
print(f"Shape: {x.shape}")     # (12,)

# Reshape to 3x4
a = x.view(3, 4)
print(f"\nview(3, 4):\n{a}")

# Reshape to 2x6
b = x.view(2, 6)
print(f"\nview(2, 6):\n{b}")

# Reshape to 2x2x3
c = x.view(2, 2, 3)
print(f"\nview(2, 2, 3):\n{c}")

# Use -1 to auto-calculate one dimension
d = x.view(3, -1)  # 12/3 = 4 columns
print(f"\nview(3, -1):\n{d}")
print(f"Shape: {d.shape}")  # (3, 4)

e = x.view(-1, 2)  # 12/2 = 6 rows
print(f"\nview(-1, 2):\n{e}")
print(f"Shape: {e.shape}")  # (6, 2)
```

> **`view()` vs `reshape()`:** `view()` requires the tensor to be contiguous in memory (usually it is). `reshape()` works always but may copy data. Use `view()` when possible for efficiency.

### Flatten

```python
import torch

# Simulate a batch of 2 images (3 channels, 4x4 pixels)
images = torch.randn(2, 3, 4, 4)
print(f"Images shape: {images.shape}")  # (2, 3, 4, 4)

# Flatten each image to a 1D vector (keep batch dimension)
flat = images.view(2, -1)
print(f"Flattened: {flat.shape}")  # (2, 48)  — 3*4*4 = 48

# Using torch.flatten
flat2 = torch.flatten(images, start_dim=1)
print(f"flatten(start_dim=1): {flat2.shape}")  # (2, 48)

# Flatten everything
flat_all = images.flatten()
print(f"flatten(): {flat_all.shape}")  # (96,)  — 2*3*4*4
```

### Squeeze and Unsqueeze

```python
import torch

# squeeze: Remove dimensions of size 1
x = torch.randn(1, 3, 1, 4)
print(f"Before squeeze: {x.shape}")   # (1, 3, 1, 4)

y = x.squeeze()
print(f"After squeeze: {y.shape}")    # (3, 4)

# Squeeze specific dimension
z = x.squeeze(0)
print(f"squeeze(0): {z.shape}")       # (3, 1, 4)

# unsqueeze: Add a dimension of size 1
a = torch.randn(3, 4)
print(f"\nBefore unsqueeze: {a.shape}")  # (3, 4)

b = a.unsqueeze(0)
print(f"unsqueeze(0): {b.shape}")     # (1, 3, 4) — add batch dim

c = a.unsqueeze(-1)
print(f"unsqueeze(-1): {c.shape}")    # (3, 4, 1)
```

### Transpose and Permute

```python
import torch

# Transpose (swap two dimensions)
m = torch.randn(2, 3)
print(f"Original: {m.shape}")     # (2, 3)
print(f"Transpose: {m.T.shape}")  # (3, 2)

# For higher-rank tensors, use .transpose()
t = torch.randn(2, 3, 4)
print(f"\n3D tensor: {t.shape}")                # (2, 3, 4)
print(f"transpose(0,2): {t.transpose(0, 2).shape}")  # (4, 3, 2)

# Permute: reorder all dimensions at once
# Common use: convert image from (H, W, C) to (C, H, W)
img_hwc = torch.randn(224, 224, 3)  # Height, Width, Channels
img_chw = img_hwc.permute(2, 0, 1)   # Channels, Height, Width
print(f"\nHWC: {img_hwc.shape}")      # (224, 224, 3)
print(f"CHW: {img_chw.shape}")        # (3, 224, 224)
```

---

## Data Types

Choosing the right data type affects **memory usage** and **computation speed**.

```python
import torch

# Default float type
x = torch.tensor([1.0, 2.0, 3.0])
print(f"Default: {x.dtype}")    # torch.float32

# Specify dtype
f64 = torch.tensor([1.0, 2.0], dtype=torch.float64)
f16 = torch.tensor([1.0, 2.0], dtype=torch.float16)
i32 = torch.tensor([1, 2, 3], dtype=torch.int32)
i64 = torch.tensor([1, 2, 3], dtype=torch.int64)
b = torch.tensor([True, False], dtype=torch.bool)

print(f"float64: {f64.dtype}")
print(f"float16: {f16.dtype}")
print(f"int32: {i32.dtype}")
print(f"int64: {i64.dtype}")
print(f"bool: {b.dtype}")

# Common types in deep learning:
# float32 — default for weights and computations
# float16 — mixed precision training (faster on modern GPUs)
# int64   — labels, indices
# bool    — masks
```

### Type Casting

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0])  # float32

# Cast to different types
x_int = x.to(torch.int64)
x_half = x.to(torch.float16)
x_double = x.double()    # Shorthand for float64
x_long = x.long()        # Shorthand for int64
x_float = x_int.float()  # Back to float32

print(f"float32 → int64: {x_int}")
print(f"float32 → float16: {x_half}")
print(f"float32 → float64: {x_double}")
```

### Memory Comparison

| dtype | Bits | Bytes per Element | Typical Use |
|-------|------|-------------------|-------------|
| `float16` | 16 | 2 | Mixed precision training |
| `bfloat16` | 16 | 2 | Training (better range than float16) |
| `float32` | 32 | 4 | Standard training & inference |
| `float64` | 64 | 8 | Rarely used (too slow, too much memory) |
| `int8` | 8 | 1 | Quantized models (inference) |
| `int64` | 64 | 8 | Labels, indices |

```python
import torch

# Memory usage comparison
n = 1_000_000

f32 = torch.randn(n, dtype=torch.float32)
f16 = torch.randn(n, dtype=torch.float16)

print(f"float32: {f32.element_size() * f32.numel() / 1e6:.1f} MB")
print(f"float16: {f16.element_size() * f16.numel() / 1e6:.1f} MB")
# float16 uses exactly half the memory!
```

---

## Tensor Operations

### Element-wise Arithmetic

```python
import torch

a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])

# Basic arithmetic (element-wise)
print(f"a + b = {a + b}")         # [5, 7, 9]
print(f"a - b = {a - b}")         # [-3, -3, -3]
print(f"a * b = {a * b}")         # [4, 10, 18]
print(f"a / b = {a / b}")         # [0.25, 0.4, 0.5]
print(f"a ** 2 = {a ** 2}")       # [1, 4, 9]

# In-place operations (modify tensor directly, use _ suffix)
c = torch.tensor([1.0, 2.0, 3.0])
c.add_(10)
print(f"\nIn-place add: {c}")     # [11, 12, 13]

c.mul_(2)
print(f"In-place mul: {c}")       # [22, 24, 26]
```

### Matrix Operations

```python
import torch

A = torch.tensor([[1.0, 2.0],
                   [3.0, 4.0]])

B = torch.tensor([[5.0, 6.0],
                   [7.0, 8.0]])

# Matrix multiplication — three ways
C1 = A @ B
C2 = torch.matmul(A, B)
C3 = torch.mm(A, B)  # Only for 2D matrices
print(f"A @ B:\n{C1}")
# [[19, 22],
#  [43, 50]]

# Element-wise multiplication (Hadamard product)
H = A * B
print(f"\nA * B (element-wise):\n{H}")
# [[ 5, 12],
#  [21, 32]]

# Dot product (for 1D tensors)
v1 = torch.tensor([1.0, 2.0, 3.0])
v2 = torch.tensor([4.0, 5.0, 6.0])
dot = torch.dot(v1, v2)
print(f"\nDot product: {dot}")  # 32

# Batch matrix multiplication
# Useful when processing multiple samples
batch_A = torch.randn(8, 3, 4)  # 8 matrices of shape 3x4
batch_B = torch.randn(8, 4, 2)  # 8 matrices of shape 4x2
batch_C = torch.bmm(batch_A, batch_B)  # 8 matrices of shape 3x2
print(f"\nBatch matmul: {batch_A.shape} @ {batch_B.shape} = {batch_C.shape}")
```

### Reduction Operations

```python
import torch

x = torch.tensor([[1.0, 2.0, 3.0],
                   [4.0, 5.0, 6.0]])

# Global reductions
print(f"Sum: {x.sum()}")          # 21
print(f"Mean: {x.mean()}")        # 3.5
print(f"Max: {x.max()}")          # 6
print(f"Min: {x.min()}")          # 1
print(f"Std: {x.std():.4f}")      # 1.8708

# Reduction along a specific dimension
print(f"\nSum along dim=0 (columns): {x.sum(dim=0)}")  # [5, 7, 9]
print(f"Sum along dim=1 (rows): {x.sum(dim=1)}")       # [6, 15]
print(f"Mean along dim=0: {x.mean(dim=0)}")             # [2.5, 3.5, 4.5]

# argmax — index of the maximum value
logits = torch.tensor([0.2, 0.7, 0.1])
pred = torch.argmax(logits)
print(f"\nLogits: {logits}")
print(f"Predicted class: {pred}")  # 1
```

---

## Broadcasting

Broadcasting allows operations between tensors of **different shapes** by automatically expanding dimensions.

### Rules

1. Dimensions are compared **right to left**
2. Dimensions must be **equal**, or one of them must be **1**
3. A dimension of size 1 is **stretched** to match the other

```python
import torch

# Scalar + tensor: scalar is broadcast to every element
a = torch.tensor([1, 2, 3])
print(f"a + 10 = {a + 10}")   # [11, 12, 13]

# Vector + matrix: vector is broadcast across rows
m = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])   # (2, 3)
v = torch.tensor([10, 20, 30])   # (3,) → broadcast to (2, 3)
print(f"\nMatrix + vector:\n{m + v}")
# [[11, 22, 33],
#  [14, 25, 36]]

# Column vector + row vector
col = torch.tensor([[1], [2], [3]])   # (3, 1)
row = torch.tensor([[10, 20, 30]])     # (1, 3)
result = col + row
print(f"\nColumn (3,1) + Row (1,3) = (3,3):\n{result}")
# [[11, 21, 31],
#  [12, 22, 32],
#  [13, 23, 33]]

# Practical example: normalize each feature (column) in a batch
batch = torch.randn(32, 10)  # 32 samples, 10 features
mean = batch.mean(dim=0)      # (10,) — mean of each feature
std = batch.std(dim=0)        # (10,) — std of each feature
normalized = (batch - mean) / std  # Broadcasting! (32,10) - (10,)
print(f"\nBatch: {batch.shape}")
print(f"Mean: {mean.shape}")
print(f"Normalized: {normalized.shape}")  # (32, 10) — same shape
```

---

## Indexing and Slicing

```python
import torch

# 1D indexing
x = torch.tensor([10, 20, 30, 40, 50])
print(f"x[0] = {x[0]}")        # 10
print(f"x[-1] = {x[-1]}")      # 50
print(f"x[1:4] = {x[1:4]}")    # [20, 30, 40]
print(f"x[::2] = {x[::2]}")    # [10, 30, 50] (every other)

# 2D indexing
m = torch.tensor([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

print(f"\nm[0, 1] = {m[0, 1]}")        # 2
print(f"m[1, :] = {m[1, :]}")          # [4, 5, 6] (row 1)
print(f"m[:, 2] = {m[:, 2]}")          # [3, 6, 9] (column 2)
print(f"m[0:2, 1:3] =\n{m[0:2, 1:3]}")  # [[2,3], [5,6]]

# Boolean indexing (masking)
x = torch.tensor([1, -2, 3, -4, 5])
mask = x > 0
print(f"\nx > 0: {mask}")           # [True, False, True, False, True]
print(f"Positive values: {x[mask]}")  # [1, 3, 5]

# Fancy indexing
indices = torch.tensor([0, 2, 4])
print(f"\nx[indices] = {x[indices]}")  # [1, 3, 5]
```

### Advanced Indexing for Batch Operations

```python
import torch

# Select specific elements from a batch of predictions
# This is very common in classification tasks
batch_size = 4
num_classes = 5

logits = torch.randn(batch_size, num_classes)
labels = torch.tensor([2, 0, 4, 1])  # True class for each sample

# Get the logit for the correct class in each sample
correct_logits = logits[torch.arange(batch_size), labels]
print(f"Logits shape: {logits.shape}")
print(f"Labels: {labels}")
print(f"Correct class logits: {correct_logits}")
```

---

## GPU Tensors

Moving tensors to GPU is essential for fast deep learning.

```python
import torch

# Check device availability
device = torch.device("cuda" if torch.cuda.is_available()
                      else "mps" if torch.backends.mps.is_available()
                      else "cpu")
print(f"Device: {device}")

# Create tensor on GPU directly
x_gpu = torch.randn(3, 3, device=device)
print(f"Tensor device: {x_gpu.device}")

# Move existing tensor to GPU
x_cpu = torch.randn(3, 3)
x_gpu = x_cpu.to(device)
print(f"Moved to: {x_gpu.device}")

# Move back to CPU (needed for NumPy, plotting, etc.)
x_back = x_gpu.cpu()
print(f"Back on: {x_back.device}")

# IMPORTANT: Both tensors must be on the same device for operations!
a = torch.randn(3, device=device)
b = torch.randn(3, device=device)
c = a + b  # ✅ Works — both on same device

# a_cpu = torch.randn(3)
# d = a + a_cpu  # ❌ Error! Can't mix devices
```

### GPU Speed Comparison

```python
import torch
import time

if torch.cuda.is_available():
    sizes = [1000, 5000, 10000]
    for n in sizes:
        # CPU
        a_cpu = torch.randn(n, n)
        b_cpu = torch.randn(n, n)
        start = time.time()
        c_cpu = a_cpu @ b_cpu
        cpu_time = time.time() - start

        # GPU
        a_gpu = a_cpu.cuda()
        b_gpu = b_cpu.cuda()
        torch.cuda.synchronize()  # Ensure GPU is ready
        start = time.time()
        c_gpu = a_gpu @ b_gpu
        torch.cuda.synchronize()  # Wait for GPU to finish
        gpu_time = time.time() - start

        speedup = cpu_time / gpu_time if gpu_time > 0 else float("inf")
        print(f"Matrix {n}x{n}: CPU={cpu_time:.4f}s, "
              f"GPU={gpu_time:.4f}s, Speedup={speedup:.1f}x")
else:
    print("No CUDA GPU available — skipping speed comparison")
    print("Try this on Google Colab for GPU access!")
```

---

## Automatic Differentiation Preview

PyTorch's **autograd** system automatically computes gradients — this is the engine behind backpropagation.

```python
import torch

# requires_grad=True tells PyTorch to track operations for gradient computation
x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)

# Forward pass: compute z = x^2 * y + y^3
z = x**2 * y + y**3

print(f"x = {x.item()}")
print(f"y = {y.item()}")
print(f"z = x²y + y³ = {z.item()}")

# Backward pass: compute gradients
z.backward()

# dz/dx = 2xy = 2(2)(3) = 12
print(f"\n∂z/∂x = 2xy = {x.grad.item()}")  # 12.0

# dz/dy = x² + 3y² = 4 + 27 = 31
print(f"∂z/∂y = x² + 3y² = {y.grad.item()}")  # 31.0
```

### Gradient of a Vector Function

```python
import torch

# Simulate a simple neural network computation
x = torch.randn(5, requires_grad=True)
w = torch.randn(5, requires_grad=True)

# Forward: weighted sum → ReLU → loss
z = torch.dot(x, w)
a = torch.relu(z)
loss = (a - 1.0) ** 2

# Backward: compute all gradients at once
loss.backward()

print(f"x.grad: {x.grad}")
print(f"w.grad: {w.grad}")
print(f"Gradient shapes: x={x.grad.shape}, w={w.grad.shape}")
```

### Detaching from the Computation Graph

```python
import torch

x = torch.tensor(3.0, requires_grad=True)
y = x ** 2

# .detach() creates a tensor that doesn't track gradients
y_detached = y.detach()
print(f"y requires_grad: {y.requires_grad}")           # True
print(f"y_detached requires_grad: {y_detached.requires_grad}")  # False

# Common pattern: using model output as input to another computation
# without propagating gradients
with torch.no_grad():
    # Everything inside this block doesn't track gradients
    z = x * 2
    print(f"Inside no_grad — z requires_grad: {z.requires_grad}")  # False
```

---

## Putting It All Together

Here's a comprehensive exercise that uses everything from this lesson:

```python
import torch

# 1. Create data: 100 samples, 5 features
torch.manual_seed(42)
X = torch.randn(100, 5)
print(f"Data shape: {X.shape}")

# 2. Create random weights and bias
W = torch.randn(5, 3, requires_grad=True)   # 5 inputs → 3 outputs
b = torch.zeros(3, requires_grad=True)

# 3. Forward pass with broadcasting
Z = X @ W + b  # (100, 5) @ (5, 3) + (3,) → (100, 3)
print(f"Output shape: {Z.shape}")

# 4. Apply ReLU activation
A = torch.relu(Z)
print(f"After ReLU: min={A.min():.4f}, max={A.max():.4f}")

# 5. Compute a dummy loss (sum of all activations)
loss = A.sum()
print(f"Loss: {loss.item():.4f}")

# 6. Backward pass
loss.backward()
print(f"\nW gradient shape: {W.grad.shape}")  # (5, 3)
print(f"b gradient shape: {b.grad.shape}")    # (3,)
print(f"W gradient:\n{W.grad}")

# 7. Check shapes throughout the pipeline
print("\n=== Shape Summary ===")
print(f"Input X:     {X.shape}")       # (100, 5)
print(f"Weights W:   {W.shape}")       # (5, 3)
print(f"Bias b:      {b.shape}")       # (3,)
print(f"Pre-act Z:   {Z.shape}")       # (100, 3)
print(f"Activation A: {A.shape}")      # (100, 3)
print(f"Loss:         scalar")
print(f"W.grad:      {W.grad.shape}")  # (5, 3)
print(f"b.grad:      {b.grad.shape}")  # (3,)
```

---

## Summary

| Concept | Key Functions |
|---------|--------------|
| **Create tensors** | `torch.tensor()`, `torch.zeros()`, `torch.ones()`, `torch.rand()`, `torch.randn()` |
| **Shapes** | `.shape`, `.size()`, `.view()`, `.reshape()`, `.squeeze()`, `.unsqueeze()` |
| **Data types** | `.dtype`, `.to(torch.float32)`, `.float()`, `.long()` |
| **Arithmetic** | `+`, `-`, `*`, `/`, `**`, `@` (matmul) |
| **Matrix ops** | `torch.matmul()`, `torch.mm()`, `torch.bmm()`, `torch.dot()` |
| **Reductions** | `.sum()`, `.mean()`, `.max()`, `.min()`, `.argmax()` |
| **Broadcasting** | Automatic shape matching (right-to-left, size 1 expands) |
| **Indexing** | `t[i]`, `t[i:j]`, `t[mask]`, `t[indices]` |
| **GPU** | `.to(device)`, `.cuda()`, `.cpu()`, `device=` |
| **Autograd** | `requires_grad=True`, `.backward()`, `.grad`, `torch.no_grad()` |

---

## What's Next?

You now have a solid foundation in tensors — the building blocks of deep learning. In the next lesson, we'll use tensors to build our first **neuron** and understand the **perceptron** — the simplest neural network unit.
