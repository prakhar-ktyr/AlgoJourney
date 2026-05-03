---
title: Introduction to CNNs
---

# Introduction to CNNs

So far, we've used **fully connected** (dense) layers for everything. They work fine for tabular data, but for images? They're a disaster. A single 224×224 color image has **150,528 pixels** — and a fully connected layer would need a separate weight for every single one. That's millions of parameters for just the first layer!

**Convolutional Neural Networks (CNNs)** solve this with a brilliant idea: instead of connecting every neuron to every input, use small **filters** that slide across the image, detecting patterns like edges, textures, and shapes. This lesson introduces the key ideas behind CNNs and builds your first one in PyTorch.

---

## Why Not Fully Connected?

Let's do the math on why dense layers fail for images:

### The Parameter Explosion

```
Input image: 224 × 224 × 3 (RGB) = 150,528 values

Fully Connected Layer (1000 neurons):
  Parameters = 150,528 × 1000 = 150,528,000 weights + 1000 biases
             = ~150 MILLION parameters (just for one layer!)

CNN Convolutional Layer (64 filters, 3×3):
  Parameters = 3 × 3 × 3 × 64 = 1,728 weights + 64 biases
             = 1,792 parameters (same layer!)
```

**That's 84,000× fewer parameters!**

### No Spatial Awareness

A fully connected layer treats the input as a flat vector. It has no concept of "nearby pixels" or "spatial structure":

```
Original image:           Flattened for FC layer:

┌───┬───┬───┐
│ A │ B │ C │            [A, B, C, D, E, F, G, H, I]
├───┼───┼───┤
│ D │ E │ F │     →     Pixel A is "next to" pixel B
├───┼───┼───┤            but the network doesn't know that!
│ G │ H │ I │
└───┴───┴───┘

The network can't tell that B is above E, or that
A, B, D, E form a 2×2 patch in the top-left corner.
```

### No Translation Invariance

A cat in the top-left corner and a cat in the bottom-right corner look **completely different** to a fully connected network (different input positions = different neurons). It would need to learn "what a cat looks like" at every possible position independently.

---

## Key Ideas Behind CNNs

CNNs solve all three problems with three key ideas:

### 1. Local Connectivity

Each neuron only looks at a **small local region** (receptive field) instead of the entire image:

```
Fully Connected:              Convolutional:

Every neuron sees            Each neuron sees only
ALL pixels                   a small 3×3 patch

┌─────────────────┐          ┌─────────────────┐
│ ● ● ● ● ● ● ● │          │ ● ● ●           │
│ ● ● ● ● ● ● ● │          │ ● ● ●           │
│ ● ● ● ● ● ● ● │          │ ● ● ●           │
│ ● ● ● ● ● ● ● │          │                  │
│ ● ● ● ● ● ● ● │          │                  │
└─────────────────┘          └─────────────────┘
     ↓                             ↓
 One neuron                    One neuron
 (150K weights)                (9 weights!)
```

### 2. Weight Sharing

The **same filter** (same weights) is applied at every position in the image:

```
Same 3×3 filter slides across the entire image:

Position 1:     Position 2:     Position 3:
┌───────────┐   ┌───────────┐   ┌───────────┐
│[■ ■ ■]    │   │ [■ ■ ■]   │   │  [■ ■ ■]  │
│[■ ■ ■]    │   │ [■ ■ ■]   │   │  [■ ■ ■]  │
│[■ ■ ■]    │   │ [■ ■ ■]   │   │  [■ ■ ■]  │
│            │   │            │   │            │
└───────────┘   └───────────┘   └───────────┘

Same weights at every position!
→ Learns "what" a pattern looks like, regardless of "where" it is
→ Dramatically fewer parameters
```

### 3. Translation Invariance

Because the same filter scans everywhere, a pattern detected in one location triggers the same filter regardless of position:

```
Cat in top-left:              Cat in bottom-right:

┌──────────────┐              ┌──────────────┐
│ 🐱            │              │              │
│              │              │              │
│              │              │            🐱 │
└──────────────┘              └──────────────┘

Same "cat-detecting" filter fires in both cases!
The CNN recognizes the cat regardless of position.
```

---

## CNN Building Blocks

A CNN is made of three types of layers stacked together:

```
Input Image
    │
    ▼
┌──────────────┐
│  CONV Layer  │  ← Detect features (edges, textures, shapes)
│  + ReLU      │
└──────────────┘
    │
    ▼
┌──────────────┐
│  POOL Layer  │  ← Reduce spatial size (downsample)
└──────────────┘
    │
    ▼
┌──────────────┐
│  CONV Layer  │  ← Detect higher-level features
│  + ReLU      │
└──────────────┘
    │
    ▼
┌──────────────┐
│  POOL Layer  │  ← Further reduce size
└──────────────┘
    │
    ▼
┌──────────────┐
│   Flatten    │  ← Convert 2D feature maps to 1D vector
└──────────────┘
    │
    ▼
┌──────────────┐
│  FC Layer    │  ← Classify based on extracted features
│  + Softmax   │
└──────────────┘
    │
    ▼
  Output (class scores)
```

### 1. Convolutional Layer

Applies learnable filters to detect patterns:
- **Input:** A 2D feature map (or the original image)
- **Operation:** Slide a small filter (kernel) over the input, compute dot products
- **Output:** A new feature map highlighting where the pattern was found

### 2. Pooling Layer

Reduces the spatial dimensions (width and height):
- **Max pooling:** Take the maximum value in each small window
- **Effect:** Makes the representation smaller and more robust to small translations

### 3. Fully Connected Layer

After the convolutional layers extract features, FC layers do the final classification:
- Takes the flattened feature maps as input
- Outputs class scores (one per class)

---

## Feature Maps: What CNNs Learn

CNNs learn a **hierarchy of features**, from simple to complex:

```
Layer 1          Layer 2          Layer 3          Layer 4
(edges)          (textures)       (parts)          (objects)

  ─             ╱╲╱╲╱╲           ┌──┐            🐱
  │             ╲╱╲╱╲╱           │👁 │
  ╲             ║║║║║║           └──┘
  ╱             ═══════           ┌──┐
  ●●●           ●●●●●●           │👃 │
                                  └──┘

Horizontal     Brick            Eye              Full face
edges          patterns         Nose             Cat
Vertical       Fur              Ear              Dog
edges          Stripes          Wheel            Car
Curves         Grids            Window           House
```

This hierarchical learning is why CNNs are so powerful — and why transfer learning works! Early layers learn universal features (edges, textures) that are useful for any vision task.

### Visualizing Feature Maps

```
Input Image         After Conv Layer 1      After Conv Layer 3

┌────────────┐      ┌─────┐ ┌─────┐       ┌───┐ ┌───┐
│            │      │ ──  │ │ │   │       │   │ │   │
│   🐱       │  →   │ ──  │ │ │   │  →    │ 👁 │ │ 👃 │
│            │      │ ──  │ │ │   │       │   │ │   │
└────────────┘      └─────┘ └─────┘       └───┘ └───┘
                    edges    edges         parts  parts
                    (horiz)  (vert)
```

---

## The Convolution Operation (Intuition)

At its core, convolution is a **dot product** between a small filter and a patch of the input:

```
Input (5×5):              Filter (3×3):         Output (one value):

┌───┬───┬───┬───┬───┐    ┌───┬───┬───┐
│ 1 │ 0 │ 1 │ 0 │ 0 │    │ 1 │ 0 │ 1 │
├───┼───┼───┼───┼───┤    ├───┼───┼───┤
│ 0 │ 1 │ 0 │ 1 │ 0 │    │ 0 │ 1 │ 0 │        1×1 + 0×0 + 1×1 +
├───┼───┼───┼───┼───┤    ├───┼───┼───┤        0×0 + 1×1 + 0×0 +
│ 1 │ 0 │ 1 │ 0 │ 1 │    │ 1 │ 0 │ 1 │        1×1 + 0×0 + 1×1
├───┼───┼───┼───┼───┤    └───┴───┴───┘
│ 0 │ 0 │ 1 │ 1 │ 0 │                          = 5
├───┼───┼───┼───┼───┤
│ 0 │ 1 │ 0 │ 0 │ 1 │
└───┴───┴───┴───┴───┘

The filter slides across the input, computing this at every position.
```

### Edge Detection Example

Different filters detect different patterns:

```
Vertical edge filter:    Horizontal edge filter:    Corner filter:

┌────┬────┬────┐        ┌────┬────┬────┐         ┌────┬────┬────┐
│ -1 │  0 │  1 │        │ -1 │ -1 │ -1 │         │ -1 │ -1 │  0 │
├────┼────┼────┤        ├────┼────┼────┤         ├────┼────┼────┤
│ -1 │  0 │  1 │        │  0 │  0 │  0 │         │ -1 │  4 │  0 │
├────┼────┼────┤        ├────┼────┼────┤         ├────┼────┼────┤
│ -1 │  0 │  1 │        │  1 │  1 │  1 │         │  0 │  0 │  0 │
└────┴────┴────┘        └────┴────┴────┘         └────┴────┴────┘

High response where       High response where       High response at
there's a vertical        there's a horizontal      corners
brightness change         brightness change
```

> **Important:** In traditional image processing, these filters are hand-designed. In CNNs, the **network learns** the filter values through backpropagation!

---

## A Simple CNN Architecture

The classic pattern: **Conv → ReLU → Pool → Conv → ReLU → Pool → Flatten → FC**

```
Input: 28×28×1 (grayscale MNIST digit)

Layer 1: Conv(1→32, 3×3) + ReLU    → 26×26×32
Layer 2: MaxPool(2×2)               → 13×13×32
Layer 3: Conv(32→64, 3×3) + ReLU   → 11×11×64
Layer 4: MaxPool(2×2)               → 5×5×64
Layer 5: Flatten                     → 1600
Layer 6: FC(1600→128) + ReLU       → 128
Layer 7: FC(128→10)                 → 10 (digit classes)
```

```
28×28×1    26×26×32    13×13×32    11×11×64    5×5×64    1600    128    10
┌──────┐   ┌────┐      ┌──┐       ┌────┐      ┌──┐      │       │      │
│      │   │    │      │  │       │    │      │  │      │       │      │
│      │ → │    │  →   │  │  →    │    │  →   │  │  →   │   →   │  →   │
│      │   │    │      │  │       │    │      │  │      │       │      │
│      │   │    │      └──┘       └────┘      └──┘      │       │      │
└──────┘   └────┘                                        │       │      │
 Input      Conv1       Pool1      Conv2       Pool2    Flat     FC1    FC2
```

---

## Code: First CNN for MNIST

Let's build and train a CNN that classifies handwritten digits:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader


# ─── 1. Define the CNN ─────────────────────────────────────
class SimpleCNN(nn.Module):
    """A simple CNN for MNIST digit classification."""

    def __init__(self):
        super().__init__()

        # Convolutional layers (feature extraction)
        self.features = nn.Sequential(
            # Conv Layer 1: 1 input channel → 32 filters, 3×3 kernel
            nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),  # 28→26→13

            # Conv Layer 2: 32 → 64 filters
            nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),  # 13→11→5
        )

        # Fully connected layers (classification)
        self.classifier = nn.Sequential(
            nn.Flatten(),                   # 5×5×64 = 1600
            nn.Linear(64 * 5 * 5, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 10),             # 10 digit classes
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# ─── 2. Prepare Data ──────────────────────────────────────
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,)),  # MNIST mean and std
])

train_dataset = datasets.MNIST(
    root="./data", train=True, download=True, transform=transform
)
test_dataset = datasets.MNIST(
    root="./data", train=False, download=True, transform=transform
)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=1000)


# ─── 3. Create Model ──────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleCNN().to(device)

# Print model summary
print(model)
print(f"\nTotal parameters: {sum(p.numel() for p in model.parameters()):,}")


# ─── 4. Training Setup ────────────────────────────────────
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()


# ─── 5. Training Loop ─────────────────────────────────────
def train_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for batch_idx, (data, target) in enumerate(loader):
        data, target = data.to(device), target.to(device)

        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        pred = output.argmax(dim=1)
        correct += (pred == target).sum().item()
        total += target.size(0)

    return total_loss / len(loader), correct / total


def evaluate(model, loader, device):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for data, target in loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            pred = output.argmax(dim=1)
            correct += (pred == target).sum().item()
            total += target.size(0)

    return correct / total


# ─── 6. Train the Model ───────────────────────────────────
print("\nTraining...")
print("-" * 50)

for epoch in range(1, 11):
    train_loss, train_acc = train_epoch(
        model, train_loader, optimizer, criterion, device
    )
    test_acc = evaluate(model, test_loader, device)

    print(f"Epoch {epoch:2d}  "
          f"Loss: {train_loss:.4f}  "
          f"Train Acc: {train_acc:.4f}  "
          f"Test Acc: {test_acc:.4f}")

print("-" * 50)
print(f"Final Test Accuracy: {test_acc:.4f}")
```

**Expected output:**

```
SimpleCNN(
  (features): Sequential(
    (0): Conv2d(1, 32, kernel_size=(3, 3))
    (1): ReLU()
    (2): MaxPool2d(kernel_size=2)
    (3): Conv2d(32, 64, kernel_size=(3, 3))
    (4): ReLU()
    (5): MaxPool2d(kernel_size=2)
  )
  (classifier): Sequential(
    (0): Flatten()
    (1): Linear(in_features=1600, out_features=128)
    (2): ReLU()
    (3): Dropout(p=0.5)
    (4): Linear(in_features=128, out_features=10)
  )
)

Total parameters: 222,346

Training...
--------------------------------------------------
Epoch  1  Loss: 0.1842  Train Acc: 0.9432  Test Acc: 0.9823
Epoch  2  Loss: 0.0612  Train Acc: 0.9812  Test Acc: 0.9879
Epoch  3  Loss: 0.0441  Train Acc: 0.9861  Test Acc: 0.9901
...
Epoch 10  Loss: 0.0198  Train Acc: 0.9938  Test Acc: 0.9923
--------------------------------------------------
Final Test Accuracy: 0.9923
```

> **99.2% accuracy** with just 222K parameters! A fully connected network with similar accuracy would need millions of parameters.

---

## CNN vs Fully Connected: Comparison

Let's compare them directly on MNIST:

| | Fully Connected | CNN |
|---|----------------|-----|
| **Parameters** | ~600,000 | ~222,000 |
| **Test Accuracy** | ~97.5% | ~99.2% |
| **Training Time** | Similar | Similar |
| **Handles larger images?** | No (too many params) | Yes! |
| **Translation invariant?** | No | Yes |
| **Spatial awareness?** | No | Yes |

```python
# FC network for comparison (same MNIST task)
class FullyConnectedNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, 512),   # 401,920 params just here!
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 10),
        )
        # Total: ~600K parameters

    def forward(self, x):
        return self.net(x)

# The CNN achieves better accuracy with fewer parameters!
```

---

## Understanding the Shape Changes

One of the trickiest parts of CNNs is tracking how tensor shapes change through the network. Here's a detailed walkthrough:

```python
import torch
import torch.nn as nn

# Input: batch of 4 grayscale 28×28 images
x = torch.randn(4, 1, 28, 28)
print(f"Input:       {x.shape}")      # [4, 1, 28, 28]

# Conv2d(1, 32, 3): 1 channel in, 32 channels out, 3×3 kernel
conv1 = nn.Conv2d(1, 32, 3)
x = conv1(x)
print(f"After Conv1: {x.shape}")      # [4, 32, 26, 26]
# Why 26? → (28 - 3) / 1 + 1 = 26

# ReLU (shape unchanged)
x = torch.relu(x)
print(f"After ReLU:  {x.shape}")      # [4, 32, 26, 26]

# MaxPool2d(2): take max in each 2×2 window
pool1 = nn.MaxPool2d(2)
x = pool1(x)
print(f"After Pool1: {x.shape}")      # [4, 32, 13, 13]
# Why 13? → 26 / 2 = 13

# Conv2d(32, 64, 3): 32 channels in, 64 channels out
conv2 = nn.Conv2d(32, 64, 3)
x = conv2(x)
print(f"After Conv2: {x.shape}")      # [4, 64, 11, 11]
# Why 11? → (13 - 3) / 1 + 1 = 11

# Pool again
x = pool1(x)
print(f"After Pool2: {x.shape}")      # [4, 64, 5, 5]
# Why 5? → 11 / 2 = 5 (floor division)

# Flatten for the FC layer
x = x.view(x.size(0), -1)
print(f"After Flat:  {x.shape}")      # [4, 1600]
# Why 1600? → 64 × 5 × 5 = 1600

# Fully connected
fc = nn.Linear(1600, 10)
x = fc(x)
print(f"Output:      {x.shape}")      # [4, 10]
```

### Output Size Formula

For a convolutional or pooling layer:

$$O = \left\lfloor \frac{W - K + 2P}{S} \right\rfloor + 1$$

Where:
- $W$ = input width (or height)
- $K$ = kernel size
- $P$ = padding
- $S$ = stride

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Problem with FC** | Too many parameters, no spatial awareness, no translation invariance |
| **Local connectivity** | Each neuron sees only a small patch |
| **Weight sharing** | Same filter applied at all positions |
| **Translation invariance** | Pattern detected anywhere in the image |
| **Feature hierarchy** | Layers learn edges → textures → parts → objects |
| **CNN architecture** | Conv → ReLU → Pool → ... → Flatten → FC |

### Quick Reference

```
┌───────────────────────────────────────────────────┐
│              CNN Key Facts                         │
│                                                   │
│  • Conv layers: detect features (learnable)       │
│  • Pooling: reduce spatial size                   │
│  • FC layers: classify at the end                 │
│  • Few parameters → fast, efficient               │
│  • Translation invariant → robust                 │
│  • Hierarchical features → powerful               │
│                                                   │
│  Output size: O = (W - K + 2P) / S + 1           │
└───────────────────────────────────────────────────┘
```

In the next lesson, you'll dive deeper into the **convolution operation** — understanding kernels, padding, stride, and how to control output dimensions precisely.
