---
title: Python & Framework Setup
---

# Python & Framework Setup

Before we build neural networks, we need to set up our development environment. This lesson walks you through installing Python, PyTorch, and all the tools you'll need — plus a quick verification that everything works.

---

## What You'll Install

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.9+ | Programming language |
| **PyTorch** | 2.x | Deep learning framework |
| **torchvision** | Latest | Image datasets, models, transforms |
| **torchaudio** | Latest | Audio processing |
| **NumPy** | Latest | Numerical computing |
| **Matplotlib** | Latest | Plotting and visualization |
| **tqdm** | Latest | Progress bars for training loops |
| **Jupyter** | Latest (optional) | Interactive notebooks |

---

## Step 1: Install Python 3.9+

### Check if Python is Already Installed

```python
# Run in your terminal (not Python!)
# python3 --version
# Expected output: Python 3.9.x or higher
```

### Installing Python

**macOS:**
```python
# Using Homebrew (recommended)
# brew install python3

# Or download from python.org
# https://www.python.org/downloads/
```

**Windows:**
```python
# Download installer from python.org
# https://www.python.org/downloads/
# IMPORTANT: Check "Add Python to PATH" during installation
```

**Linux (Ubuntu/Debian):**
```python
# sudo apt update
# sudo apt install python3 python3-pip python3-venv
```

### Verify Installation

```python
# In your terminal:
# python3 --version
# pip3 --version

# You should see Python 3.9+ and pip 21+
```

---

## Step 2: Create a Virtual Environment

**Always** use a virtual environment to keep your deep learning packages isolated from other projects.

```python
# Create a new directory for this course
# mkdir deep-learning-course
# cd deep-learning-course

# Create a virtual environment
# python3 -m venv dl-env

# Activate the virtual environment
# macOS/Linux:
# source dl-env/bin/activate

# Windows:
# dl-env\Scripts\activate

# You should see (dl-env) at the start of your terminal prompt
```

> **Why virtual environments?** Different projects may need different package versions. A virtual environment keeps each project's dependencies separate, preventing conflicts.

### Using Conda (Alternative)

If you prefer Conda (popular in data science):

```python
# Install Miniconda from:
# https://docs.conda.io/en/latest/miniconda.html

# Create and activate environment
# conda create -n dl-env python=3.11
# conda activate dl-env
```

---

## Step 3: Install PyTorch

PyTorch is our primary deep learning framework. The installation command depends on your hardware.

### CPU Only (No GPU)

```python
# pip install torch torchvision torchaudio
```

### NVIDIA GPU (CUDA)

First, check which CUDA version your GPU supports:

```python
# In terminal: nvidia-smi
# Look for "CUDA Version" in the top right
```

Then install the matching PyTorch:

```python
# For CUDA 11.8:
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1:
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# For CUDA 12.4:
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

### Apple Silicon (M1/M2/M3 Mac)

PyTorch supports Apple's Metal Performance Shaders (MPS) out of the box:

```python
# pip install torch torchvision torchaudio
# MPS acceleration is automatically available on Apple Silicon
```

> **Tip:** Visit [pytorch.org/get-started](https://pytorch.org/get-started/locally/) for the exact command for your system. The website has a selector tool that generates the right command.

---

## Step 4: Install Additional Libraries

```python
# Core scientific computing
# pip install numpy matplotlib

# Progress bars for training loops
# pip install tqdm

# Interactive notebooks (optional but recommended)
# pip install jupyter

# All at once:
# pip install numpy matplotlib tqdm jupyter
```

---

## Step 5: Check GPU Availability

One of the first things you'll do in any deep learning project is check if a GPU is available.

```python
import torch

# Check PyTorch version
print(f"PyTorch version: {torch.__version__}")

# Check CUDA (NVIDIA GPU) availability
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

# Check MPS (Apple Silicon) availability
print(f"MPS available: {torch.backends.mps.is_available()}")

# Determine the best available device
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

print(f"\nUsing device: {device}")
```

### Understanding Devices

| Device | Hardware | When to Use |
|--------|----------|-------------|
| `cpu` | CPU | Small models, debugging, no GPU available |
| `cuda` | NVIDIA GPU | Training and inference (fastest for most models) |
| `mps` | Apple M1/M2/M3 | Training on Mac (good performance) |

> **No GPU? No problem!** All code in this course works on CPU. Training will be slower, but you'll still learn everything. For larger models, use Google Colab (free GPU).

---

## Step 6: Google Colab (Free GPU Alternative)

If you don't have a GPU, **Google Colab** gives you free access to NVIDIA GPUs (T4, V100, A100).

### Getting Started with Colab

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Click "New Notebook"
3. Go to **Runtime → Change runtime type → GPU**
4. PyTorch comes **pre-installed**!

### Verify Colab GPU

```python
# Run this cell in Colab
import torch

print(f"PyTorch: {torch.__version__}")
print(f"CUDA: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    # Typically: Tesla T4 (free tier) or A100 (Colab Pro)
```

### Colab Tips

| Tip | Details |
|-----|---------|
| **Save your work** | Notebooks auto-save to Google Drive |
| **Upload files** | Drag-and-drop into the file browser (left panel) |
| **Install packages** | `!pip install package_name` in a cell |
| **Runtime limits** | Free tier disconnects after ~90 min idle |
| **Mount Drive** | `from google.colab import drive; drive.mount('/content/drive')` |

---

## Step 7: Verify Everything Works

Let's run a comprehensive check that all packages are installed and working:

```python
import sys

# Python version
print(f"Python: {sys.version}")

# PyTorch
import torch
print(f"PyTorch: {torch.__version__}")

# NumPy
import numpy as np
print(f"NumPy: {np.__version__}")

# Matplotlib
import matplotlib
print(f"Matplotlib: {matplotlib.__version__}")

# torchvision
import torchvision
print(f"torchvision: {torchvision.__version__}")

# tqdm
from tqdm import tqdm
print(f"tqdm: imported successfully")

print("\n✅ All packages installed correctly!")
```

---

## Step 8: Your First PyTorch Operations

Let's make sure PyTorch is working with some basic operations.

### Creating Tensors

```python
import torch

# Create tensors (the basic data structure in PyTorch)
x = torch.tensor([1.0, 2.0, 3.0])
print(f"Tensor: {x}")
print(f"Type: {x.dtype}")    # torch.float32
print(f"Shape: {x.shape}")   # torch.Size([3])

# Create a 2D tensor (matrix)
m = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])
print(f"\nMatrix:\n{m}")
print(f"Shape: {m.shape}")   # torch.Size([2, 3])

# Random tensor
r = torch.randn(3, 4)  # 3x4 matrix of random numbers (normal distribution)
print(f"\nRandom tensor:\n{r}")
```

### Basic Operations

```python
import torch

a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])

# Arithmetic
print(f"a + b = {a + b}")       # [5, 7, 9]
print(f"a * b = {a * b}")       # [4, 10, 18]
print(f"a @ b = {a @ b}")       # dot product: 32

# Matrix operations
A = torch.randn(3, 4)
B = torch.randn(4, 2)
C = A @ B  # Matrix multiplication
print(f"\nA shape: {A.shape}")
print(f"B shape: {B.shape}")
print(f"C = A @ B shape: {C.shape}")  # (3, 2)
```

### GPU Operations (If Available)

```python
import torch

device = torch.device("cuda" if torch.cuda.is_available()
                      else "mps" if torch.backends.mps.is_available()
                      else "cpu")

# Create tensor on GPU
x = torch.randn(1000, 1000, device=device)
y = torch.randn(1000, 1000, device=device)

# Matrix multiply on GPU
z = x @ y
print(f"Computed on: {device}")
print(f"Result shape: {z.shape}")
print(f"Result device: {z.device}")

# Move between devices
x_cpu = z.cpu()           # Move to CPU
print(f"Moved to: {x_cpu.device}")
```

### Automatic Differentiation (Preview)

This is what makes PyTorch special — it can compute gradients **automatically**:

```python
import torch

# Tell PyTorch to track gradients for x
x = torch.tensor(3.0, requires_grad=True)

# Compute a function: y = x^2 + 2x + 1
y = x**2 + 2*x + 1

# Compute the gradient: dy/dx = 2x + 2
y.backward()

print(f"x = {x.item()}")
print(f"y = x² + 2x + 1 = {y.item()}")
print(f"dy/dx = 2x + 2 = {x.grad.item()}")  # 2(3) + 2 = 8
```

This is the foundation of how neural networks learn — PyTorch computes all the gradients for you during backpropagation!

### A Simple Linear Regression

Let's put it all together with a mini training loop:

```python
import torch

# Generate synthetic data: y = 3x + 1 (with noise)
torch.manual_seed(42)
X = torch.randn(100, 1)
y_true = 3 * X + 1 + 0.3 * torch.randn(100, 1)

# Initialize parameters (learnable)
w = torch.randn(1, requires_grad=True)
b = torch.zeros(1, requires_grad=True)

learning_rate = 0.1

# Training loop
for epoch in range(50):
    # Forward pass: y_pred = w * X + b
    y_pred = X * w + b

    # Compute loss (Mean Squared Error)
    loss = ((y_pred - y_true) ** 2).mean()

    # Backward pass (compute gradients)
    loss.backward()

    # Update parameters (gradient descent)
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad

    # Zero gradients for next iteration
    w.grad.zero_()
    b.grad.zero_()

    if epoch % 10 == 0:
        print(f"Epoch {epoch:2d}: loss={loss.item():.4f}, "
              f"w={w.item():.4f}, b={b.item():.4f}")

print(f"\nLearned: y = {w.item():.2f}x + {b.item():.2f}")
print(f"True:    y = 3.00x + 1.00")
```

---

## Project Structure Recommendation

For this course, we recommend organizing your files like this:

```
deep-learning-course/
├── dl-env/              # Virtual environment (don't edit)
├── notebooks/           # Jupyter notebooks for experiments
│   ├── 01_tensors.ipynb
│   ├── 02_neural_net.ipynb
│   └── ...
├── scripts/             # Python scripts
│   ├── train.py
│   ├── evaluate.py
│   └── utils.py
├── data/                # Datasets (downloaded automatically)
├── models/              # Saved model checkpoints
└── requirements.txt     # Package list
```

### Create requirements.txt

```python
# Save this as requirements.txt:
# torch>=2.0
# torchvision
# torchaudio
# numpy
# matplotlib
# tqdm
# jupyter

# Install from requirements.txt:
# pip install -r requirements.txt
```

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'torch'` | Make sure your virtual environment is activated and run `pip install torch` |
| `CUDA out of memory` | Reduce batch size, use smaller model, or use `torch.cuda.empty_cache()` |
| `torch.cuda.is_available()` returns `False` | Check NVIDIA drivers, CUDA installation, and PyTorch CUDA version match |
| Slow training on CPU | Use Google Colab for free GPU access |
| `ImportError` for torchvision | Reinstall: `pip install --force-reinstall torchvision` |
| Python version too old | Deep learning libraries require Python 3.9+; upgrade your Python |

### Checking Your Setup

```python
import torch

print("=== Deep Learning Environment Check ===\n")

# Python
import sys
py_ok = sys.version_info >= (3, 9)
print(f"Python {sys.version_info.major}.{sys.version_info.minor}: "
      f"{'✅' if py_ok else '❌ Need 3.9+'}")

# PyTorch
try:
    pt_ok = tuple(int(x) for x in torch.__version__.split('.')[:2]) >= (2, 0)
    print(f"PyTorch {torch.__version__}: "
          f"{'✅' if pt_ok else '⚠️ 2.0+ recommended'}")
except Exception:
    print(f"PyTorch {torch.__version__}: ✅")

# GPU
if torch.cuda.is_available():
    print(f"GPU: ✅ {torch.cuda.get_device_name(0)}")
elif torch.backends.mps.is_available():
    print(f"GPU: ✅ Apple MPS")
else:
    print(f"GPU: ⚠️ CPU only (OK for learning, use Colab for big models)")

# Other packages
for pkg_name in ["numpy", "matplotlib", "torchvision", "tqdm"]:
    try:
        pkg = __import__(pkg_name)
        ver = getattr(pkg, "__version__", "OK")
        print(f"{pkg_name}: ✅ {ver}")
    except ImportError:
        print(f"{pkg_name}: ❌ pip install {pkg_name}")

print("\n=== Check Complete ===")
```

---

## Summary

| Step | What You Did |
|------|-------------|
| 1 | Installed Python 3.9+ |
| 2 | Created a virtual environment |
| 3 | Installed PyTorch (CPU or GPU) |
| 4 | Installed NumPy, Matplotlib, tqdm |
| 5 | Verified GPU availability |
| 6 | Set up Google Colab (optional) |
| 7 | Verified all installations |
| 8 | Ran first PyTorch operations |

---

## What's Next?

Your environment is ready! In the next lesson, we'll dive deep into **tensors** — the fundamental data structure of deep learning. You'll learn how to create, manipulate, and compute with tensors in PyTorch.
