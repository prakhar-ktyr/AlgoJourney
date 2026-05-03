---
title: Pooling Layers
---

# Pooling Layers

After a convolutional layer extracts features, we often want to **reduce the spatial dimensions** — make the feature maps smaller. This is the job of **pooling layers**. They shrink the width and height while keeping the most important information, reducing computation and making the network more robust to small translations.

In this lesson, you'll learn about max pooling, average pooling, global average pooling, and when to use each. You'll also see how modern architectures sometimes replace pooling with strided convolutions.

---

## Why Pool?

Pooling serves three critical purposes:

### 1. Reduce Spatial Dimensions

```
Without pooling:
  Input:  224×224×64
  Conv:   224×224×64      ← still huge!
  Conv:   224×224×128     ← 224 × 224 × 128 = 6.4M values per layer
  Conv:   224×224×256     ← memory and compute explode

With pooling:
  Input:  224×224×64
  Conv:   224×224×64
  Pool:   112×112×64      ← halved!
  Conv:   112×112×128
  Pool:   56×56×128       ← halved again!
  Conv:   56×56×256       ← manageable
```

### 2. Reduce Parameters in Later Layers

The fully connected layer at the end connects to every spatial position. Smaller feature maps mean fewer connections:

```
Without pooling:
  Final feature map: 56×56×256 = 802,816 values
  FC layer (1000 outputs): 802,816 × 1000 = 802M parameters!

With pooling (or global average pooling):
  Final feature map: 7×7×256 = 12,544 values
  FC layer (1000 outputs): 12,544 × 1000 = 12.5M parameters

With global average pooling:
  Final feature map: 1×1×256 = 256 values
  FC layer (1000 outputs): 256 × 1000 = 256K parameters!
```

### 3. Increase Receptive Field

Each neuron in a deeper layer "sees" a larger region of the input image:

```
Before pooling:                After 2×2 max pool:
Each neuron sees 3×3           Each neuron sees 6×6 of original
of the previous layer          input (because the previous layer
                               was downsampled)

Pool stacks up:
  After Pool 1: each unit covers ~6×6 of input
  After Pool 2: each unit covers ~14×14 of input
  After Pool 3: each unit covers ~30×30 of input

→ Deeper layers have a "wider view" of the image
```

### 4. Translation Robustness

Pooling makes the representation slightly invariant to small shifts:

```
Input shifted by 1 pixel:

Original:            Shifted:              Max Pool (2×2):
┌───┬───┬───┬───┐   ┌───┬───┬───┬───┐
│ 0 │ 5 │ 0 │ 0 │   │ 0 │ 0 │ 5 │ 0 │    Original: [5, 0]  → [5, 0]
├───┼───┼───┼───┤   ├───┼───┼───┼───┤    Shifted:  [5, 5]  → [5, 5]
│ 0 │ 3 │ 0 │ 0 │   │ 0 │ 0 │ 3 │ 0 │
└───┴───┴───┴───┘   └───┴───┴───┴───┘    Close! (exact match
                                           for the max values)
```

---

## Max Pooling

The most common pooling operation. In each window, **take the maximum value**.

### How It Works

```
Input (4×4):                    Max Pool 2×2, stride 2:

┌────┬────┬────┬────┐          ┌────┬────┐
│  1 │  3 │  2 │  4 │          │  6 │  8 │   max(1,3,5,6)=6
├────┼────┼────┼────┤    →     ├────┼────┤   max(2,4,7,8)=8
│  5 │  6 │  7 │  8 │          │  4 │  3 │   max(2,1,4,3)=4
├────┼────┼────┼────┤          └────┴────┘   max(1,0,2,3)=3
│  2 │  1 │  1 │  0 │
├────┼────┼────┼────┤
│  4 │  3 │  2 │  3 │
└────┴────┴────┴────┘

Each 2×2 block → one max value
4×4 → 2×2 (halved in each dimension)
```

### Detailed Example

```
Window 1 (top-left):         Window 2 (top-right):
┌────┬────┐                  ┌────┬────┐
│  1 │  3 │                  │  2 │  4 │
├────┼────┤                  ├────┼────┤
│  5 │  6 │                  │  7 │  8 │
└────┴────┘                  └────┴────┘
max = 6                      max = 8

Window 3 (bottom-left):      Window 4 (bottom-right):
┌────┬────┐                  ┌────┬────┐
│  2 │  1 │                  │  1 │  0 │
├────┼────┤                  ├────┼────┤
│  4 │  3 │                  │  2 │  3 │
└────┴────┘                  └────┴────┘
max = 4                      max = 3
```

### Properties of Max Pooling

| Property | Description |
|----------|-------------|
| **Keeps strongest activations** | If a feature is detected anywhere in the window, it's preserved |
| **Discards location** | We know the feature exists but lose exactly where |
| **No learnable parameters** | Zero parameters — it's a fixed operation |
| **Reduces size** | 2×2 pool with stride 2 halves width and height |

### In PyTorch

```python
import torch
import torch.nn as nn

# Standard 2×2 max pooling (stride defaults to kernel_size)
pool = nn.MaxPool2d(kernel_size=2)

x = torch.randn(1, 64, 28, 28)
out = pool(x)
print(f"Input:  {x.shape}")   # [1, 64, 28, 28]
print(f"Output: {out.shape}")  # [1, 64, 14, 14]

# 3×3 max pooling with stride 2
pool3 = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
out3 = pool3(x)
print(f"3×3 pool: {out3.shape}")  # [1, 64, 14, 14]
```

---

## Average Pooling

Instead of taking the maximum, **take the average** of all values in the window.

### How It Works

```
Input (4×4):                    Avg Pool 2×2, stride 2:

┌────┬────┬────┬────┐          ┌──────┬──────┐
│  1 │  3 │  2 │  4 │          │ 3.75 │ 5.25 │  avg(1,3,5,6)=3.75
├────┼────┼────┼────┤    →     ├──────┼──────┤  avg(2,4,7,8)=5.25
│  5 │  6 │  7 │  8 │          │ 2.50 │ 1.50 │  avg(2,1,4,3)=2.50
├────┼────┼────┼────┤          └──────┴──────┘  avg(1,0,2,3)=1.50
│  2 │  1 │  1 │  0 │
├────┼────┼────┼────┤
│  4 │  3 │  2 │  3 │
└────┴────┴────┴────┘
```

### Max Pooling vs Average Pooling

| | Max Pooling | Average Pooling |
|---|-----------|-----------------|
| **Operation** | Take maximum | Take mean |
| **Keeps** | Strongest activation | All information (smoothed) |
| **Effect** | Sharp, high-contrast features | Smooth, averaged features |
| **Use case** | Most CNNs (default choice) | Some architectures, texture |
| **Gradient flow** | Only through max element | Through all elements |

```python
import torch
import torch.nn as nn

x = torch.tensor([[[[1., 3., 2., 4.],
                    [5., 6., 7., 8.],
                    [2., 1., 1., 0.],
                    [4., 3., 2., 3.]]]])

max_pool = nn.MaxPool2d(2)
avg_pool = nn.AvgPool2d(2)

print("Max Pool:")
print(max_pool(x))
# tensor([[[[6., 8.],
#           [4., 3.]]]])

print("\nAvg Pool:")
print(avg_pool(x))
# tensor([[[[3.7500, 5.2500],
#           [2.5000, 1.5000]]]])
```

---

## Global Average Pooling

**Global Average Pooling (GAP)** reduces each feature map to a single number by averaging all spatial positions. It's the standard way to go from conv layers to the classifier in modern architectures.

### How It Works

```
Input: 7×7×512                   Global Avg Pool:               Output: 1×1×512

┌─────────┐ ┌─────────┐         ┌───┐ ┌───┐
│ 7×7     │ │ 7×7     │  ...    │avg│ │avg│  ...    → [v₁, v₂, ..., v₅₁₂]
│ feature │ │ feature │         └───┘ └───┘
│ map 1   │ │ map 2   │
└─────────┘ └─────────┘

Each 7×7 map → one average value
512 maps → 512-dimensional vector
```

### Why Global Average Pooling?

Before GAP (old approach):
```
7×7×512 → Flatten → 25,088 → FC(25088, 4096) → FC(4096, 1000)
                              ↑
                         102M parameters! (just this one layer)
```

After GAP (modern approach):
```
7×7×512 → GAP → 512 → FC(512, 1000)
                       ↑
                  512K parameters (200× fewer!)
```

**Benefits of GAP:**
1. **Drastically fewer parameters** — no massive FC layers
2. **No overfitting** — less prone to memorizing training data
3. **Any input size** — works regardless of spatial dimensions
4. **Spatial averaging** — considers the entire feature map

### In PyTorch

```python
import torch
import torch.nn as nn

# Global Average Pooling
gap = nn.AdaptiveAvgPool2d(output_size=1)

# Works with ANY input size!
x1 = torch.randn(1, 512, 7, 7)
x2 = torch.randn(1, 512, 14, 14)
x3 = torch.randn(1, 512, 32, 32)

print(f"7×7   → {gap(x1).shape}")   # [1, 512, 1, 1]
print(f"14×14 → {gap(x2).shape}")   # [1, 512, 1, 1]
print(f"32×32 → {gap(x3).shape}")   # [1, 512, 1, 1]

# Squeeze to get a vector
vector = gap(x1).squeeze(-1).squeeze(-1)  # or .view(batch, -1)
print(f"Vector: {vector.shape}")  # [1, 512]
```

### AdaptiveAvgPool2d vs AvgPool2d

```python
# AvgPool2d: you specify the KERNEL size
# Output size depends on input size
avg = nn.AvgPool2d(kernel_size=2)  # halves dimensions

# AdaptiveAvgPool2d: you specify the OUTPUT size
# Works with any input size!
gap = nn.AdaptiveAvgPool2d(1)   # always outputs 1×1
adapt = nn.AdaptiveAvgPool2d(4)  # always outputs 4×4
```

---

## Pooling vs Strided Convolutions

Modern architectures increasingly use **strided convolutions** instead of pooling:

### Traditional Approach (Pool)

```
Conv(3×3, stride=1) → ReLU → MaxPool(2×2)

Input:  28×28×64
Conv:   28×28×64   (same size, same padding)
Pool:   14×14×64   (halved)

Total params: conv only (pooling has no params)
```

### Modern Approach (Strided Conv)

```
Conv(3×3, stride=2)

Input:  28×28×64
Conv:   14×14×128  (halved by stride, channels increased)

Total params: slightly more (the conv does both jobs)
```

### Comparison

| | Max Pool | Strided Conv |
|---|---------|-------------|
| **Parameters** | 0 (fixed operation) | Learnable weights |
| **Information loss** | Fixed (always takes max) | Learns what to keep |
| **Flexibility** | None — always max/avg | Can learn anything |
| **Used in** | VGG, classic CNNs | ResNet, modern CNNs |
| **Gradient flow** | Only through max/avg | Through all elements |

```python
import torch
import torch.nn as nn

# Traditional: Conv + Pool
traditional = nn.Sequential(
    nn.Conv2d(64, 64, kernel_size=3, padding=1),   # 28×28→28×28
    nn.ReLU(),
    nn.MaxPool2d(2),                                # 28×28→14×14
)

# Modern: Strided Conv
modern = nn.Sequential(
    nn.Conv2d(64, 64, kernel_size=3, padding=1, stride=2),  # 28×28→14×14
    nn.ReLU(),
)

x = torch.randn(1, 64, 28, 28)
print(f"Traditional: {traditional(x).shape}")  # [1, 64, 14, 14]
print(f"Modern:      {modern(x).shape}")       # [1, 64, 14, 14]
```

> **Best practice:** Both approaches work well. ResNet uses strided convolutions for downsampling. Many architectures use a mix.

---

## nn.MaxPool2d, nn.AvgPool2d, nn.AdaptiveAvgPool2d

### Complete API Reference

```python
import torch.nn as nn

# ─── MaxPool2d ─────────────────────────────────────────────
nn.MaxPool2d(
    kernel_size,       # Size of the pooling window (int or tuple)
    stride=None,       # Defaults to kernel_size if None
    padding=0,         # Zero-padding before pooling
    return_indices=False,  # For use with nn.MaxUnpool2d
)

# ─── AvgPool2d ─────────────────────────────────────────────
nn.AvgPool2d(
    kernel_size,       # Size of the pooling window
    stride=None,       # Defaults to kernel_size
    padding=0,
    count_include_pad=True,  # Include padding in average calculation
)

# ─── AdaptiveAvgPool2d ─────────────────────────────────────
nn.AdaptiveAvgPool2d(
    output_size,       # Desired output size (int or tuple)
                       # Use 1 for global average pooling
)

# ─── AdaptiveMaxPool2d ─────────────────────────────────────
nn.AdaptiveMaxPool2d(
    output_size,       # Desired output size
)
```

### Usage Examples

```python
import torch
import torch.nn as nn

x = torch.randn(1, 64, 28, 28)

# Standard 2×2 max pool (most common)
pool1 = nn.MaxPool2d(2)
print(f"MaxPool(2):     {pool1(x).shape}")     # [1, 64, 14, 14]

# 3×3 max pool with stride 2
pool2 = nn.MaxPool2d(3, stride=2, padding=1)
print(f"MaxPool(3,s=2): {pool2(x).shape}")     # [1, 64, 14, 14]

# Average pool
pool3 = nn.AvgPool2d(2)
print(f"AvgPool(2):     {pool3(x).shape}")     # [1, 64, 14, 14]

# Global average pool (output size = 1×1)
gap = nn.AdaptiveAvgPool2d(1)
print(f"GAP:            {gap(x).shape}")       # [1, 64, 1, 1]

# Adaptive to specific size
adapt = nn.AdaptiveAvgPool2d((7, 7))
print(f"Adaptive(7):    {adapt(x).shape}")     # [1, 64, 7, 7]
```

---

## Feature Map Sizes Through a Network

Let's trace the dimensions through a complete CNN:

```python
import torch
import torch.nn as nn


class TrackedCNN(nn.Module):
    """CNN that prints shapes at each layer."""

    def __init__(self, num_classes=10):
        super().__init__()

        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 64, 3, padding=1),     # same size
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1),    # same size
            nn.ReLU(),
            nn.MaxPool2d(2),                     # halve

            # Block 2
            nn.Conv2d(64, 128, 3, padding=1),   # same size
            nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1),  # same size
            nn.ReLU(),
            nn.MaxPool2d(2),                     # halve

            # Block 3
            nn.Conv2d(128, 256, 3, padding=1),  # same size
            nn.ReLU(),
            nn.Conv2d(256, 256, 3, padding=1),  # same size
            nn.ReLU(),
            nn.MaxPool2d(2),                     # halve
        )

        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),             # global pool
            nn.Flatten(),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# Create model and trace shapes
model = TrackedCNN(num_classes=10)
x = torch.randn(1, 3, 32, 32)  # CIFAR-10 sized input

print("Layer-by-layer shape trace:")
print(f"{'Layer':<30} {'Output Shape':<20} {'Parameters'}")
print("-" * 70)

# Manually trace through features
current = x
print(f"{'Input':<30} {str(list(current.shape)):<20}")

for i, layer in enumerate(model.features):
    current = layer(current)
    params = sum(p.numel() for p in layer.parameters())
    name = f"{layer.__class__.__name__}"
    if hasattr(layer, "kernel_size"):
        if isinstance(layer, nn.Conv2d):
            name += f"({layer.in_channels}→{layer.out_channels}, {layer.kernel_size[0]}×{layer.kernel_size[0]})"
        else:
            name += f"({layer.kernel_size})"
    print(f"  {name:<28} {str(list(current.shape)):<20} {params:,}" if params else
          f"  {name:<28} {str(list(current.shape)):<20}")

# Through classifier
for layer in model.classifier:
    current = layer(current)
    params = sum(p.numel() for p in layer.parameters()) if hasattr(layer, "parameters") else 0
    name = layer.__class__.__name__
    print(f"  {name:<28} {str(list(current.shape)):<20} {params:,}" if params else
          f"  {name:<28} {str(list(current.shape)):<20}")

total_params = sum(p.numel() for p in model.parameters())
print(f"\n{'Total Parameters:':<30} {total_params:,}")
```

**Expected output:**

```
Layer-by-layer shape trace:
Layer                          Output Shape         Parameters
----------------------------------------------------------------------
Input                          [1, 3, 32, 32]
  Conv2d(3→64, 3×3)           [1, 64, 32, 32]     1,792
  ReLU                         [1, 64, 32, 32]
  Conv2d(64→64, 3×3)          [1, 64, 32, 32]     36,928
  ReLU                         [1, 64, 32, 32]
  MaxPool2d(2)                 [1, 64, 16, 16]
  Conv2d(64→128, 3×3)         [1, 128, 16, 16]    73,856
  ReLU                         [1, 128, 16, 16]
  Conv2d(128→128, 3×3)        [1, 128, 16, 16]    147,584
  ReLU                         [1, 128, 16, 16]
  MaxPool2d(2)                 [1, 128, 8, 8]
  Conv2d(128→256, 3×3)        [1, 256, 8, 8]      295,168
  ReLU                         [1, 256, 8, 8]
  Conv2d(256→256, 3×3)        [1, 256, 8, 8]      590,080
  ReLU                         [1, 256, 8, 8]
  MaxPool2d(2)                 [1, 256, 4, 4]
  AdaptiveAvgPool2d            [1, 256, 1, 1]
  Flatten                      [1, 256]
  Linear                       [1, 10]             2,570

Total Parameters:              1,147,978
```

### Size Progression Visualization

```
Input:  3×32×32     = 3,072 values
                      │
Block 1: 64×32×32   = 65,536 values
         64×16×16   = 16,384 values (after pool)
                      │
Block 2: 128×16×16  = 32,768 values
         128×8×8    = 8,192 values (after pool)
                      │
Block 3: 256×8×8    = 16,384 values
         256×4×4    = 4,096 values (after pool)
                      │
GAP:     256×1×1    = 256 values
                      │
Output:  10          = 10 class scores

Pattern: Spatial dimensions DECREASE (32→16→8→4→1)
         Channel dimensions INCREASE (3→64→128→256)
```

---

## Code: Compare Pooling Strategies and Visualize Feature Maps

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt
import numpy as np


# ─── 1. Load CIFAR-10 ─────────────────────────────────────
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
])
dataset = datasets.CIFAR10(root="./data", train=True, download=True,
                           transform=transform)
loader = DataLoader(dataset, batch_size=64, shuffle=True)


# ─── 2. Define Three CNN Variants ─────────────────────────
class CNN_MaxPool(nn.Module):
    """CNN using max pooling for downsampling."""
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(128, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))   # 32→16
        x = self.pool(F.relu(self.conv2(x)))   # 16→8
        x = self.pool(F.relu(self.conv3(x)))   # 8→4
        x = self.gap(x).flatten(1)
        return self.fc(x)


class CNN_AvgPool(nn.Module):
    """CNN using average pooling for downsampling."""
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.pool = nn.AvgPool2d(2)
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(128, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = self.gap(x).flatten(1)
        return self.fc(x)


class CNN_StridedConv(nn.Module):
    """CNN using strided convolutions for downsampling."""
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1, stride=2)    # 32→16
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1, stride=2)   # 16→8
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1, stride=2)  # 8→4
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(128, 10)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = self.gap(x).flatten(1)
        return self.fc(x)


# ─── 3. Train and Compare ─────────────────────────────────
def train_model(model, loader, epochs=5, lr=0.001):
    """Train a model and return loss history."""
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()
    losses = []

    model.train()
    for epoch in range(epochs):
        epoch_loss = 0
        correct = 0
        total = 0

        for images, labels in loader:
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()
            total += labels.size(0)

        avg_loss = epoch_loss / len(loader)
        accuracy = correct / total
        losses.append(avg_loss)
        print(f"  Epoch {epoch+1}/{epochs}  Loss: {avg_loss:.4f}  "
              f"Acc: {accuracy:.4f}")

    return losses


print("=" * 60)
print("COMPARING POOLING STRATEGIES ON CIFAR-10")
print("=" * 60)

models_dict = {
    "Max Pooling": CNN_MaxPool(),
    "Avg Pooling": CNN_AvgPool(),
    "Strided Conv": CNN_StridedConv(),
}

all_losses = {}
for name, model in models_dict.items():
    params = sum(p.numel() for p in model.parameters())
    print(f"\n{name} ({params:,} parameters):")
    all_losses[name] = train_model(model, loader, epochs=5)


# ─── 4. Plot Training Curves ──────────────────────────────
plt.figure(figsize=(10, 5))
for name, losses in all_losses.items():
    plt.plot(losses, label=name, linewidth=2)
plt.xlabel("Epoch")
plt.ylabel("Training Loss")
plt.title("Pooling Strategy Comparison")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("pooling_comparison.png", dpi=100)
plt.show()


# ─── 5. Visualize Feature Maps ────────────────────────────
print("\n" + "=" * 60)
print("VISUALIZING FEATURE MAPS")
print("=" * 60)

# Use the trained max pool model
model = models_dict["Max Pooling"]
model.eval()

# Get a sample image
sample_image, sample_label = dataset[0]
class_names = dataset.classes
print(f"\nSample image: {class_names[sample_label]}")

# Hook to capture intermediate activations
activations = {}

def get_activation(name):
    def hook(module, input, output):
        activations[name] = output.detach()
    return hook

# Register hooks
model.conv1.register_forward_hook(get_activation("conv1"))
model.conv2.register_forward_hook(get_activation("conv2"))
model.conv3.register_forward_hook(get_activation("conv3"))

# Forward pass
with torch.no_grad():
    _ = model(sample_image.unsqueeze(0))

# Plot feature maps from each layer
fig, axes = plt.subplots(3, 8, figsize=(14, 6))

for row, (name, feat_maps) in enumerate(activations.items()):
    for col in range(8):
        ax = axes[row, col]
        ax.imshow(feat_maps[0, col].numpy(), cmap="viridis")
        ax.axis("off")
        if col == 0:
            ax.set_ylabel(name, fontsize=12)

plt.suptitle("Feature Maps at Different Depths", fontsize=14)
plt.tight_layout()
plt.savefig("feature_maps.png", dpi=100)
plt.show()
print("Saved: feature_maps.png")
print("\nNotice how deeper layers capture more abstract features!")


# ─── 6. Effect of Pool Size ───────────────────────────────
print("\n" + "=" * 60)
print("EFFECT OF DIFFERENT POOL SIZES")
print("=" * 60)

x = torch.randn(1, 64, 32, 32)

pool_configs = [
    ("MaxPool2d(2)", nn.MaxPool2d(2)),
    ("MaxPool2d(3, stride=2, pad=1)", nn.MaxPool2d(3, stride=2, padding=1)),
    ("MaxPool2d(4)", nn.MaxPool2d(4)),
    ("AvgPool2d(2)", nn.AvgPool2d(2)),
    ("AdaptiveAvgPool2d(8)", nn.AdaptiveAvgPool2d(8)),
    ("AdaptiveAvgPool2d(1)", nn.AdaptiveAvgPool2d(1)),
]

print(f"\nInput shape: {list(x.shape)}")
print(f"{'Pool Layer':<35} {'Output Shape':<20} {'Reduction'}")
print("-" * 70)

for name, pool_layer in pool_configs:
    out = pool_layer(x)
    spatial_in = 32 * 32
    spatial_out = out.shape[2] * out.shape[3]
    reduction = spatial_in / spatial_out
    print(f"{name:<35} {str(list(out.shape)):<20} {reduction:.1f}×")
```

**Expected output:**

```
Input shape: [1, 64, 32, 32]
Pool Layer                          Output Shape         Reduction
----------------------------------------------------------------------
MaxPool2d(2)                        [1, 64, 16, 16]     4.0×
MaxPool2d(3, stride=2, pad=1)       [1, 64, 16, 16]     4.0×
MaxPool2d(4)                        [1, 64, 8, 8]       16.0×
AvgPool2d(2)                        [1, 64, 16, 16]     4.0×
AdaptiveAvgPool2d(8)                [1, 64, 8, 8]       16.0×
AdaptiveAvgPool2d(1)                [1, 64, 1, 1]       1024.0×
```

---

## Pooling in Famous Architectures

| Architecture | Pooling Strategy |
|-------------|-----------------|
| **VGG-16** | MaxPool2d(2) after every 2-3 conv blocks |
| **ResNet** | MaxPool2d(3, stride=2) after first conv; strided conv for downsampling; GAP before FC |
| **GoogLeNet** | MaxPool + AvgPool in inception modules; GAP at the end |
| **EfficientNet** | No explicit pooling; uses strided conv; GAP at the end |
| **ViT** | No pooling at all (patch embedding + attention) |

### ResNet Downsampling Pattern

```python
# ResNet uses this pattern for downsampling:
# Strided 1×1 conv (not pooling!)
class ResNetDownsample(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        # Main path: strided 3×3 conv
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3,
                               stride=2, padding=1)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # Shortcut: strided 1×1 conv to match dimensions
        self.shortcut = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 1, stride=2),
            nn.BatchNorm2d(out_channels),
        )

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # residual connection
        return F.relu(out)
```

---

## Summary

| Pooling Type | Operation | Output Size | Use Case |
|-------------|-----------|-------------|----------|
| **MaxPool2d(2)** | Max in 2×2 window | H/2 × W/2 | Default downsampling |
| **AvgPool2d(2)** | Mean in 2×2 window | H/2 × W/2 | Smoother features |
| **AdaptiveAvgPool2d(1)** | Global average | 1×1 | Before classifier (GAP) |
| **Strided Conv** | Learned downsampling | H/2 × W/2 | Modern architectures |

### Quick Reference

```
┌───────────────────────────────────────────────────────┐
│              Pooling Cheat Sheet                       │
│                                                       │
│  Max Pool:  keeps strongest signal, discards location │
│  Avg Pool:  keeps average signal, smoother            │
│  GAP:       entire map → one value (before FC)        │
│  Strided Conv: learnable downsampling (modern)        │
│                                                       │
│  Size: pool_out = input_size / pool_size              │
│                                                       │
│  Best practices:                                      │
│   • Use MaxPool2d(2) for standard downsampling        │
│   • Use AdaptiveAvgPool2d(1) before classifier        │
│   • Consider strided conv for modern architectures    │
│   • Spatial dims ↓, channel dims ↑ as you go deeper   │
└───────────────────────────────────────────────────────┘
```

In the next lesson, you'll learn about **CNN architectures** — how to combine conv, pool, and FC layers into powerful networks like VGG, ResNet, and EfficientNet.
