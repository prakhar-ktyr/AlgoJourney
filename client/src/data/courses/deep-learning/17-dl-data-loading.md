---
title: Data Loading & Preprocessing
---

# Data Loading & Preprocessing

Real deep learning projects spend more time on **data** than on models. You need to load images, text, or tabular data; split it into train/val/test sets; apply transforms; and feed it efficiently to the GPU in batches. PyTorch makes this easy with `Dataset` and `DataLoader`.

In this lesson, you'll learn the complete data pipeline — from raw files to training-ready batches.

---

## The PyTorch Data Pipeline

```
Raw Data                  Dataset                DataLoader             Training Loop
(files, CSV,    →    (__len__, __getitem__)  →  (batching, shuffling,  →  for batch in loader:
 images, etc.)        + transforms               num_workers)              model(batch)
```

Every PyTorch data pipeline has two core components:

| Component | Role |
|-----------|------|
| **Dataset** | Defines how to access individual samples |
| **DataLoader** | Wraps a Dataset and provides batching, shuffling, and parallel loading |

---

## PyTorch Dataset Class

A `Dataset` is any Python object that implements two methods:

```python
from torch.utils.data import Dataset

class MyDataset(Dataset):
    def __len__(self):
        """Return the total number of samples."""
        return self.num_samples

    def __getitem__(self, idx):
        """Return one sample (features, label) by index."""
        return self.features[idx], self.labels[idx]
```

### How It Works

```
Dataset:  [sample_0, sample_1, sample_2, ..., sample_N]
              ↑
         dataset[0] calls __getitem__(0)
         len(dataset) calls __len__()
```

### Simple Example

```python
import torch
from torch.utils.data import Dataset

class NumberDataset(Dataset):
    """Dataset of numbers and their squares."""
    def __init__(self, n):
        self.numbers = torch.arange(1, n + 1, dtype=torch.float32)

    def __len__(self):
        return len(self.numbers)

    def __getitem__(self, idx):
        x = self.numbers[idx]
        y = x ** 2  # label = square of the number
        return x, y

dataset = NumberDataset(100)
print(f"Dataset size: {len(dataset)}")   # 100
print(f"Sample 0: {dataset[0]}")         # (tensor(1.), tensor(1.))
print(f"Sample 4: {dataset[4]}")         # (tensor(5.), tensor(25.))
```

---

## DataLoader: Batching, Shuffling, and More

The `DataLoader` wraps a `Dataset` and handles:

```python
from torch.utils.data import DataLoader

loader = DataLoader(
    dataset,            # your Dataset object
    batch_size=32,      # samples per batch
    shuffle=True,       # randomize order each epoch
    num_workers=4,      # parallel data loading processes
    drop_last=False,    # drop incomplete last batch?
    pin_memory=True,    # speed up CPU→GPU transfer
)
```

### Key Parameters

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `batch_size` | 1 | Number of samples per batch |
| `shuffle` | False | Randomize order each epoch (use True for training) |
| `num_workers` | 0 | Parallel loading processes (0 = main process only) |
| `drop_last` | False | Drop last batch if smaller than batch_size |
| `pin_memory` | False | Use pinned memory for faster GPU transfer |
| `collate_fn` | default | Custom function to merge samples into a batch |

### Iterating Over a DataLoader

```python
for batch_idx, (X_batch, y_batch) in enumerate(loader):
    print(f"Batch {batch_idx}: X shape = {X_batch.shape}, y shape = {y_batch.shape}")
    # Batch 0: X shape = torch.Size([32]), y shape = torch.Size([32])
    break
```

### How Batching Works

```
Dataset: [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9]    (10 samples)
                     ↓ batch_size=3, shuffle=True
Epoch 1:  [s7, s2, s0] → [s5, s9, s3] → [s1, s8, s4] → [s6]
Epoch 2:  [s3, s0, s8] → [s6, s1, s7] → [s9, s4, s2] → [s5]
                                                           ↑
                                              last batch (size 1, not dropped)
```

### Choosing num_workers

```
num_workers=0:  Main process loads data → GPU idle while loading
num_workers=4:  4 workers pre-load batches → GPU always has data ready

Timeline (num_workers=0):
  [Load]──[Train]──[Load]──[Train]──[Load]──[Train]

Timeline (num_workers=4):
  [Load]──[Train]──[Train]──[Train]──[Train]
  [Load]──────────┘    ↑       ↑       ↑
  [Load]───────────────┘       │       │
  [Load]───────────────────────┘       │
  [Load]───────────────────────────────┘
```

> **Tip:** Start with `num_workers=2` or `4`. Too many workers can cause overhead. On Windows, `num_workers=0` is sometimes needed due to multiprocessing issues.

---

## Built-in Datasets: torchvision.datasets

PyTorch provides popular datasets out of the box. They download automatically on first use:

```python
import torchvision
import torchvision.transforms as transforms

# MNIST: 60,000 handwritten digits (28×28 grayscale)
mnist_train = torchvision.datasets.MNIST(
    root="./data",         # download location
    train=True,            # training set
    download=True,         # download if not found
    transform=transforms.ToTensor(),
)

# CIFAR-10: 60,000 color images in 10 classes (32×32 RGB)
cifar_train = torchvision.datasets.CIFAR10(
    root="./data",
    train=True,
    download=True,
    transform=transforms.ToTensor(),
)

print(f"MNIST:   {len(mnist_train)} samples, shape: {mnist_train[0][0].shape}")
# MNIST:   60000 samples, shape: torch.Size([1, 28, 28])

print(f"CIFAR-10: {len(cifar_train)} samples, shape: {cifar_train[0][0].shape}")
# CIFAR-10: 50000 samples, shape: torch.Size([3, 32, 32])
```

### Common Datasets

| Dataset | Size | Image Shape | Classes | Use Case |
|---------|------|-------------|---------|----------|
| **MNIST** | 70K | 1×28×28 (gray) | 10 digits | Beginner classification |
| **FashionMNIST** | 70K | 1×28×28 (gray) | 10 clothing | Slightly harder MNIST |
| **CIFAR-10** | 60K | 3×32×32 (RGB) | 10 objects | Small image classification |
| **CIFAR-100** | 60K | 3×32×32 (RGB) | 100 objects | Fine-grained classification |
| **ImageNet** | 1.2M | 3×224×224 (RGB) | 1000 objects | Large-scale benchmark |

---

## Transforms: torchvision.transforms

Transforms preprocess images before they enter the model. You **compose** them into a pipeline:

```python
from torchvision import transforms

transform = transforms.Compose([
    transforms.Resize(32),                    # resize shortest edge to 32
    transforms.CenterCrop(32),                # crop center 32×32
    transforms.ToTensor(),                    # PIL Image → tensor, scale to [0, 1]
    transforms.Normalize((0.5,), (0.5,)),     # normalize to [-1, 1]
])
```

### Common Transforms

| Transform | What It Does |
|-----------|--------------|
| `ToTensor()` | Converts PIL Image or NumPy array to tensor; scales [0, 255] → [0, 1] |
| `Normalize(mean, std)` | Normalizes: `(pixel - mean) / std` |
| `Resize(size)` | Resize to given size |
| `CenterCrop(size)` | Crop the center of the image |
| `RandomHorizontalFlip(p)` | Flip horizontally with probability p |
| `RandomVerticalFlip(p)` | Flip vertically with probability p |
| `RandomCrop(size, padding)` | Randomly crop after optional padding |
| `RandomRotation(degrees)` | Rotate by random angle within range |
| `ColorJitter(brightness, contrast, saturation, hue)` | Randomly change brightness/contrast/etc. |

### Normalize: Choosing Mean and Std

For standard datasets, use these well-known values:

```python
# MNIST (grayscale, 1 channel)
transforms.Normalize((0.1307,), (0.3081,))

# CIFAR-10 (RGB, 3 channels)
transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616))

# ImageNet (RGB, 3 channels) — used for all pretrained models
transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
```

---

## Data Augmentation

Data augmentation creates **modified copies** of training images to make the model more robust. It artificially increases the size and diversity of the training set:

```
Original Image:       Augmented Versions:
  ┌──────┐           ┌──────┐  ┌──────┐  ┌──────┐
  │  🐱  │     →     │  🐱  │  │ 🐱   │  │  🐱  │
  │      │           │flipped│  │rotated│  │cropped│
  └──────┘           └──────┘  └──────┘  └──────┘
```

### Training vs. Validation Transforms

Augmentation is **only** applied to training data. Validation/test data gets minimal, deterministic transforms:

```python
# Training: with augmentation
train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomCrop(32, padding=4),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])

# Validation/Test: no augmentation
test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])
```

> **Why only training?** Augmentation adds random variation to help the model generalize. At test time, you want consistent, reproducible results.

---

## Custom Datasets

### From a CSV File

```python
import pandas as pd
import torch
from torch.utils.data import Dataset

class CSVDataset(Dataset):
    def __init__(self, csv_file):
        self.data = pd.read_csv(csv_file)
        # Assume last column is the label
        self.features = torch.tensor(
            self.data.iloc[:, :-1].values, dtype=torch.float32
        )
        self.labels = torch.tensor(
            self.data.iloc[:, -1].values, dtype=torch.long
        )

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

# Usage
dataset = CSVDataset("data/my_data.csv")
loader = DataLoader(dataset, batch_size=32, shuffle=True)
```

### From an Image Folder

If your images are organized as:

```
data/
  train/
    cats/
      cat_001.jpg
      cat_002.jpg
    dogs/
      dog_001.jpg
      dog_002.jpg
```

Use `ImageFolder` — it assigns labels automatically from folder names:

```python
from torchvision.datasets import ImageFolder
from torchvision import transforms

transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
])

dataset = ImageFolder(root="data/train", transform=transform)
print(f"Classes: {dataset.classes}")         # ['cats', 'dogs']
print(f"Class→Index: {dataset.class_to_idx}")  # {'cats': 0, 'dogs': 1}
print(f"Total images: {len(dataset)}")

loader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=2)
```

### Custom Text Dataset

```python
import torch
from torch.utils.data import Dataset

class TextDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_len=100):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        # Tokenize: split into words, convert to indices
        tokens = self.texts[idx].lower().split()
        indices = [self.vocab.get(t, 0) for t in tokens]  # 0 = unknown

        # Pad or truncate to max_len
        if len(indices) < self.max_len:
            indices += [0] * (self.max_len - len(indices))  # pad with 0
        else:
            indices = indices[:self.max_len]  # truncate

        return torch.tensor(indices, dtype=torch.long), self.labels[idx]
```

---

## Train/Validation/Test Splits

Always split your data into three sets:

```
Full Dataset (100%)
├── Training Set   (70-80%)  → model learns from this
├── Validation Set (10-15%)  → tune hyperparameters, monitor overfitting
└── Test Set       (10-15%)  → final evaluation (touch ONCE)
```

### Using random_split

```python
from torch.utils.data import random_split

dataset = torchvision.datasets.MNIST(
    root="./data", train=True, download=True,
    transform=transforms.ToTensor()
)

# Split: 50000 train, 10000 validation
train_set, val_set = random_split(dataset, [50000, 10000])

print(f"Training:   {len(train_set)}")    # 50000
print(f"Validation: {len(val_set)}")      # 10000

train_loader = DataLoader(train_set, batch_size=64, shuffle=True)
val_loader = DataLoader(val_set, batch_size=64, shuffle=False)
```

### Using Proportions (PyTorch 2.0+)

```python
# Split by fractions (must sum to 1.0)
train_set, val_set, test_set = random_split(dataset, [0.7, 0.15, 0.15])
```

### Reproducible Splits

```python
# Use a generator for reproducible splits
generator = torch.Generator().manual_seed(42)
train_set, val_set = random_split(dataset, [50000, 10000], generator=generator)
```

---

## Code: Complete Data Pipeline

Let's put it all together with MNIST and CIFAR-10:

```python
import torch
from torch.utils.data import DataLoader, random_split
import torchvision
import torchvision.transforms as transforms

# ── MNIST Pipeline ──────────────────────────────────
print("=== MNIST ===")
mnist_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,)),
])

mnist_full = torchvision.datasets.MNIST(
    root="./data", train=True, download=True, transform=mnist_transform
)
mnist_test = torchvision.datasets.MNIST(
    root="./data", train=False, download=True, transform=mnist_transform
)

# Split training into train + validation
mnist_train, mnist_val = random_split(
    mnist_full, [50000, 10000],
    generator=torch.Generator().manual_seed(42)
)

mnist_train_loader = DataLoader(mnist_train, batch_size=64, shuffle=True)
mnist_val_loader = DataLoader(mnist_val, batch_size=64)
mnist_test_loader = DataLoader(mnist_test, batch_size=64)

print(f"Train: {len(mnist_train)}, Val: {len(mnist_val)}, Test: {len(mnist_test)}")

# Check one batch
images, labels = next(iter(mnist_train_loader))
print(f"Batch shape: {images.shape}")     # [64, 1, 28, 28]
print(f"Labels shape: {labels.shape}")    # [64]
print(f"Pixel range: [{images.min():.2f}, {images.max():.2f}]")


# ── CIFAR-10 Pipeline (with augmentation) ───────────
print("\n=== CIFAR-10 ===")
cifar_train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomCrop(32, padding=4),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])

cifar_test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])

cifar_train_full = torchvision.datasets.CIFAR10(
    root="./data", train=True, download=True, transform=cifar_train_transform
)
cifar_test = torchvision.datasets.CIFAR10(
    root="./data", train=False, download=True, transform=cifar_test_transform
)

cifar_train, cifar_val = random_split(
    cifar_train_full, [40000, 10000],
    generator=torch.Generator().manual_seed(42)
)

cifar_train_loader = DataLoader(
    cifar_train, batch_size=128, shuffle=True, num_workers=2
)
cifar_val_loader = DataLoader(cifar_val, batch_size=128)
cifar_test_loader = DataLoader(cifar_test, batch_size=128)

print(f"Train: {len(cifar_train)}, Val: {len(cifar_val)}, Test: {len(cifar_test)}")

images, labels = next(iter(cifar_train_loader))
print(f"Batch shape: {images.shape}")     # [128, 3, 32, 32]
print(f"Labels shape: {labels.shape}")    # [128]
print(f"Classes: {cifar_train_full.classes}")


# ── Custom Dataset Example ──────────────────────────
print("\n=== Custom Dataset ===")
from torch.utils.data import Dataset

class SyntheticDataset(Dataset):
    """Generate (x, sin(x)) pairs."""
    def __init__(self, n_samples=1000):
        self.x = torch.linspace(0, 4 * 3.14159, n_samples).unsqueeze(1)
        self.y = torch.sin(self.x)

    def __len__(self):
        return len(self.x)

    def __getitem__(self, idx):
        return self.x[idx], self.y[idx]

synth = SyntheticDataset(500)
synth_train, synth_val = random_split(synth, [400, 100])

synth_train_loader = DataLoader(synth_train, batch_size=32, shuffle=True)
synth_val_loader = DataLoader(synth_val, batch_size=32)

print(f"Synthetic dataset: {len(synth)} samples")
print(f"Train: {len(synth_train)}, Val: {len(synth_val)}")

x_batch, y_batch = next(iter(synth_train_loader))
print(f"X batch shape: {x_batch.shape}")  # [32, 1]
print(f"Y batch shape: {y_batch.shape}")  # [32, 1]
```

### Expected Output

```
=== MNIST ===
Train: 50000, Val: 10000, Test: 10000
Batch shape: torch.Size([64, 1, 28, 28])
Labels shape: torch.Size([64])
Pixel range: [-0.42, 2.82]

=== CIFAR-10 ===
Train: 40000, Val: 10000, Test: 10000
Batch shape: torch.Size([128, 3, 32, 32])
Labels shape: torch.Size([128])
Classes: ['airplane', 'automobile', 'bird', 'cat', 'deer',
          'dog', 'frog', 'horse', 'ship', 'truck']

=== Custom Dataset ===
Synthetic dataset: 500 samples
Train: 400, Val: 100
X batch shape: torch.Size([32, 1])
Y batch shape: torch.Size([32, 1])
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Dataset** | Implements `__len__()` and `__getitem__()` |
| **DataLoader** | Handles batching, shuffling, parallel loading |
| **batch_size** | 32–256 is typical; larger = faster but more memory |
| **num_workers** | 2–4 for parallel loading; 0 on Windows if issues |
| **ToTensor()** | Converts images to tensors, scales to [0, 1] |
| **Normalize()** | Standardizes pixel values (use dataset-specific stats) |
| **Data augmentation** | Apply only to training data (RandomFlip, RandomCrop, etc.) |
| **ImageFolder** | Auto-loads images from class-named subdirectories |
| **random_split** | Split a dataset into train/val/test subsets |

In the next lesson, you'll learn how to build the **complete training loop** — the engine that drives all deep learning.
