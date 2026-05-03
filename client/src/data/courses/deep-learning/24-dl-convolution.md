---
title: Convolution Operations
---

# Convolution Operations

In the previous lesson, you learned *what* CNNs are and *why* they work. Now let's go deeper into the **convolution operation** itself — the mathematical engine that powers every CNN. You'll understand exactly how filters slide over inputs, how padding and stride control output dimensions, and how multiple channels work together.

By the end of this lesson, you'll be able to predict the output size of any convolutional layer and confidently use `nn.Conv2d` in PyTorch.

---

## The Convolution Operation

Convolution is essentially a **sliding dot product**. A small matrix called a **kernel** (or **filter**) slides over the input, computing element-wise multiplication and summing the results at each position.

### Step by Step

```
Input (5×5):                    Kernel (3×3):

┌───┬───┬───┬───┬───┐          ┌────┬────┬────┐
│ 1 │ 2 │ 3 │ 0 │ 1 │          │  1 │  0 │ -1 │
├───┼───┼───┼───┼───┤          ├────┼────┼────┤
│ 0 │ 1 │ 2 │ 3 │ 0 │          │  1 │  0 │ -1 │
├───┼───┼───┼───┼───┤          ├────┼────┼────┤
│ 1 │ 0 │ 1 │ 2 │ 1 │          │  1 │  0 │ -1 │
├───┼───┼───┼───┼───┤          └────┴────┴────┘
│ 2 │ 1 │ 0 │ 1 │ 0 │
├───┼───┼───┼───┼───┤
│ 0 │ 1 │ 2 │ 0 │ 1 │
└───┴───┴───┴───┴───┘
```

**Position (0,0):** overlay kernel on top-left 3×3 patch:

```
Patch:          Kernel:         Element-wise multiply:
1  2  3         1   0  -1       1×1   2×0   3×(-1)  =  1  0  -3
0  1  2    ×    1   0  -1   →   0×1   1×0   2×(-1)  =  0  0  -2
1  0  1         1   0  -1       1×1   0×0   1×(-1)  =  1  0  -1

Sum = 1 + 0 + (-3) + 0 + 0 + (-2) + 1 + 0 + (-1) = -4
```

**Position (0,1):** slide kernel one step right:

```
Patch:          Kernel:         
2  3  0         1   0  -1       2 + 0 + 0 + 1 + 0 - 3 + 0 + 0 - 2 = -2
1  2  3    ×    1   0  -1
0  1  2         1   0  -1
```

Continue sliding to fill the entire output:

```
Output (3×3):

┌────┬────┬────┐
│ -4 │ -2 │  0 │
├────┼────┼────┤
│ -2 │  0 │  2 │
├────┼────┼────┤
│  2 │  0 │ -2 │
└────┴────┴────┘
```

---

## Kernel (Filter)

A **kernel** is a small matrix of learnable weights. In a trained CNN, the network has learned kernel values that detect useful patterns.

### Common Kernel Sizes

| Size | Use Case | Parameters (per filter) |
|------|----------|------------------------|
| 1×1 | Channel mixing, dimensionality reduction | 1 |
| 3×3 | Most common — good balance of receptive field and efficiency | 9 |
| 5×5 | Larger receptive field (less common now) | 25 |
| 7×7 | First layer only (large images, e.g., ResNet's first conv) | 49 |

> **Modern best practice:** Stack multiple 3×3 convolutions instead of using larger kernels. Two 3×3 convolutions have the same receptive field as one 5×5, but with fewer parameters (18 vs 25) and an extra non-linearity.

```
Two 3×3 convolutions:           One 5×5 convolution:

┌───┐   ┌───┐                   ┌─────┐
│3×3│ → │3×3│                   │ 5×5 │
└───┘   └───┘                   └─────┘

Receptive field: 5×5             Receptive field: 5×5
Parameters: 9 + 9 = 18          Parameters: 25
Non-linearities: 2              Non-linearities: 1
Winner: two 3×3!
```

---

## Output Size Formula

The output spatial dimensions depend on four things:

$$O = \left\lfloor \frac{W - K + 2P}{S} \right\rfloor + 1$$

Where:
- $W$ = input width (or height)
- $K$ = kernel size
- $P$ = padding (zeros added around the border)
- $S$ = stride (step size of the kernel)

### Examples

```
W=7, K=3, P=0, S=1:   O = (7 - 3 + 0) / 1 + 1 = 5
W=7, K=3, P=1, S=1:   O = (7 - 3 + 2) / 1 + 1 = 7  ← same size!
W=7, K=3, P=0, S=2:   O = (7 - 3 + 0) / 2 + 1 = 3
W=28, K=5, P=2, S=1:  O = (28 - 5 + 4) / 1 + 1 = 28
W=224, K=7, P=3, S=2: O = (224 - 7 + 6) / 2 + 1 = 112
```

---

## Padding

Padding adds zeros around the border of the input before convolution:

### No Padding (Valid)

```
Input (5×5) + Kernel (3×3) → Output (3×3)

┌─────────────┐           ┌─────────┐
│ × × × × ×  │           │ × × ×   │
│ × × × × ×  │    →      │ × × ×   │
│ × × × × ×  │           │ × × ×   │
│ × × × × ×  │           └─────────┘
│ × × × × ×  │           Output shrinks!
└─────────────┘
```

### Same Padding (Padding = 1 for 3×3 kernel)

```
Input (5×5) + Padding(1) + Kernel (3×3) → Output (5×5)

┌─────────────────┐       ┌─────────────┐
│ 0 0 0 0 0 0 0   │       │ × × × × ×  │
│ 0 × × × × × 0  │       │ × × × × ×  │
│ 0 × × × × × 0  │  →    │ × × × × ×  │
│ 0 × × × × × 0  │       │ × × × × ×  │
│ 0 × × × × × 0  │       │ × × × × ×  │
│ 0 × × × × × 0  │       └─────────────┘
│ 0 0 0 0 0 0 0   │       Same size!
└─────────────────┘
```

### Formula for "Same" Padding

To keep the output size equal to the input size (with stride=1):

$$P = \frac{K - 1}{2}$$

| Kernel Size | Padding for Same |
|------------|-----------------|
| 3×3 | P = 1 |
| 5×5 | P = 2 |
| 7×7 | P = 3 |

### In PyTorch

```python
import torch.nn as nn

# Valid (no padding) — output shrinks
conv_valid = nn.Conv2d(1, 16, kernel_size=3, padding=0)
# Input 28×28 → Output 26×26

# Same padding — output same size
conv_same = nn.Conv2d(1, 16, kernel_size=3, padding=1)
# Input 28×28 → Output 28×28

# You can also use padding='same' (PyTorch 1.9+)
conv_same2 = nn.Conv2d(1, 16, kernel_size=3, padding="same")
# Input 28×28 → Output 28×28
```

---

## Stride

**Stride** is the step size — how many pixels the kernel moves each time.

### Stride = 1 (Default)

The kernel moves one pixel at a time:

```
Step 1:         Step 2:         Step 3:
[■ ■ ■] . .    . [■ ■ ■] .    . . [■ ■ ■]
[■ ■ ■] . .    . [■ ■ ■] .    . . [■ ■ ■]
[■ ■ ■] . .    . [■ ■ ■] .    . . [■ ■ ■]
. . . . .      . . . . .      . . . . .
. . . . .      . . . . .      . . . . .
```

### Stride = 2

The kernel moves two pixels at a time (skips every other position):

```
Step 1:             Step 2:
[■ ■ ■] . .        . . [■ ■ ■]
[■ ■ ■] . .        . . [■ ■ ■]
[■ ■ ■] . .        . . [■ ■ ■]
. . . . .          . . . . .
. . . . .          . . . . .

Step 3:             Step 4:
. . . . .          . . . . .
. . . . .          . . . . .
[■ ■ ■] . .        . . [■ ■ ■]
[■ ■ ■] . .        . . [■ ■ ■]
[■ ■ ■] . .        . . [■ ■ ■]

Output: 2×2 (instead of 3×3 with stride=1)
```

**Stride > 1 reduces the output size** — this is often used as an alternative to pooling:

```python
# Stride 1: preserves spatial size (with same padding)
conv_s1 = nn.Conv2d(32, 64, kernel_size=3, padding=1, stride=1)
# Input 14×14 → Output 14×14

# Stride 2: halves spatial size
conv_s2 = nn.Conv2d(32, 64, kernel_size=3, padding=1, stride=2)
# Input 14×14 → Output 7×7
```

---

## Multiple Channels

Real images have multiple channels (RGB = 3 channels). Convolutional layers handle this naturally.

### Input Channels

A single filter actually has depth equal to the number of input channels:

```
Input: 6×6×3 (RGB image)        One filter: 3×3×3

┌──────┐ ┌──────┐ ┌──────┐     ┌───┐ ┌───┐ ┌───┐
│      │ │      │ │      │     │   │ │   │ │   │
│  R   │ │  G   │ │  B   │  *  │ R │ │ G │ │ B │  = one output value
│      │ │      │ │      │     │   │ │   │ │   │
└──────┘ └──────┘ └──────┘     └───┘ └───┘ └───┘

The filter has 3×3×3 = 27 weights.
It produces ONE output channel (one feature map).
```

### Output Channels (Multiple Filters)

To detect multiple features, we use **multiple filters**. Each filter produces one output channel:

```
Input: H×W×C_in              N filters (each: K×K×C_in)         Output: H'×W'×N

                              Filter 1 ─────→ Channel 1
┌──────────┐                  Filter 2 ─────→ Channel 2
│ H×W×C_in │  ──────────→    Filter 3 ─────→ Channel 3     =   H'×W'×N
└──────────┘                  ...
                              Filter N ─────→ Channel N
```

### Parameter Count

For `nn.Conv2d(C_in, C_out, K)`:

$$\text{Parameters} = C_{\text{out}} \times (C_{\text{in}} \times K \times K + 1)$$

The "+1" is for the bias term per filter.

```python
import torch.nn as nn

conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3)
params = sum(p.numel() for p in conv.parameters())
print(f"Parameters: {params}")
# Parameters: 3 × 3 × 3 × 64 + 64 = 1,792

conv2 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3)
params2 = sum(p.numel() for p in conv2.parameters())
print(f"Parameters: {params2}")
# Parameters: 64 × 3 × 3 × 128 + 128 = 73,856
```

---

## 1×1 Convolutions

A 1×1 kernel might seem useless — it doesn't look at spatial neighborhoods! But it's actually very powerful for **channel mixing**:

```
Input: H×W×256                 1×1 Conv (256→64)              Output: H×W×64

┌─────────────┐                                              ┌─────────────┐
│             │                                              │             │
│  256 channels│  ──── 1×1 conv ────→                        │  64 channels│
│             │  (mixes channels                             │             │
└─────────────┘   at each pixel)                             └─────────────┘

Parameters: 256 × 1 × 1 × 64 + 64 = 16,448
Compare: 3×3 conv → 256 × 3 × 3 × 64 + 64 = 147,520
```

**Use cases for 1×1 convolutions:**
- Reduce number of channels (dimensionality reduction)
- Add non-linearity (1×1 conv + ReLU) without changing spatial size
- Mix information across channels
- Used heavily in Inception, ResNet bottleneck, and MobileNet

```python
# Channel reduction: 256 → 64
reduce = nn.Conv2d(256, 64, kernel_size=1)

# Channel expansion: 64 → 256
expand = nn.Conv2d(64, 256, kernel_size=1)
```

---

## Depthwise Separable Convolutions

A standard conv is expensive: $C_{\text{in}} \times K^2 \times C_{\text{out}}$ parameters. **Depthwise separable convolutions** factorize this into two cheaper operations:

### Standard Convolution

```
Input: H×W×C_in    ──── K×K conv ────→    Output: H×W×C_out
Parameters: C_in × K × K × C_out
```

### Depthwise Separable (Two Steps)

```
Step 1: Depthwise (one filter PER input channel)
Input: H×W×C_in    ──── K×K, groups=C_in ────→    H×W×C_in
Parameters: C_in × K × K

Step 2: Pointwise (1×1 conv to mix channels)
H×W×C_in    ──── 1×1 conv ────→    H×W×C_out
Parameters: C_in × C_out
```

**Cost comparison** (C_in=64, C_out=128, K=3):

| | Standard | Depthwise Separable |
|---|---------|---------------------|
| Parameters | 64 × 9 × 128 = 73,728 | (64 × 9) + (64 × 128) = 8,768 |
| Ratio | 1.0× | **0.12×** (8.4× cheaper!) |

```python
# Standard convolution
standard = nn.Conv2d(64, 128, kernel_size=3, padding=1)

# Depthwise separable convolution
depthwise = nn.Conv2d(64, 64, kernel_size=3, padding=1, groups=64)
pointwise = nn.Conv2d(64, 128, kernel_size=1)

# Usage
class DepthwiseSeparable(nn.Module):
    def __init__(self, in_ch, out_ch, kernel_size=3, padding=1):
        super().__init__()
        self.depthwise = nn.Conv2d(
            in_ch, in_ch, kernel_size, padding=padding, groups=in_ch
        )
        self.pointwise = nn.Conv2d(in_ch, out_ch, kernel_size=1)

    def forward(self, x):
        x = self.depthwise(x)
        x = self.pointwise(x)
        return x
```

---

## nn.Conv2d in PyTorch

Here's the complete API:

```python
nn.Conv2d(
    in_channels,   # Number of input channels (e.g., 3 for RGB)
    out_channels,  # Number of filters (output channels)
    kernel_size,   # Size of the filter (int or tuple)
    stride=1,      # Step size
    padding=0,     # Zero-padding
    dilation=1,    # Spacing between kernel elements
    groups=1,      # For depthwise convolution
    bias=True,     # Whether to include bias
)
```

### Common Configurations

```python
import torch
import torch.nn as nn

# First layer: RGB input, 3×3 kernel, same padding
conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)

# Deeper layer: 64→128, stride 2 (downsamples)
conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1, stride=2)

# Bottleneck: reduce channels with 1×1
conv_reduce = nn.Conv2d(256, 64, kernel_size=1)

# Large initial conv (like ResNet)
conv_init = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3)

# Verify shapes
x = torch.randn(1, 3, 224, 224)
print(f"Input:       {x.shape}")              # [1, 3, 224, 224]
print(f"After conv1: {conv1(x).shape}")       # [1, 64, 224, 224]

x2 = torch.randn(1, 64, 56, 56)
print(f"After conv2: {conv2(x2).shape}")      # [1, 128, 28, 28]

x3 = torch.randn(1, 256, 14, 14)
print(f"After reduce:{conv_reduce(x3).shape}")# [1, 64, 14, 14]

print(f"After init:  {conv_init(x).shape}")   # [1, 64, 112, 112]
```

---

## Code: Visualize Convolution

Let's build an interactive example that shows how convolution works and what different kernels detect:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
import numpy as np


# ─── 1. Load a Sample Image ───────────────────────────────
transform = transforms.Compose([
    transforms.ToTensor(),
])
dataset = datasets.MNIST(root="./data", train=True, download=True,
                         transform=transform)
image, label = dataset[3]  # shape: [1, 28, 28]
print(f"Image shape: {image.shape}, Label: {label}")


# ─── 2. Define Hand-crafted Kernels ───────────────────────
kernels = {
    "Vertical Edge": torch.tensor([[-1., 0., 1.],
                                    [-1., 0., 1.],
                                    [-1., 0., 1.]]),

    "Horizontal Edge": torch.tensor([[-1., -1., -1.],
                                      [ 0.,  0.,  0.],
                                      [ 1.,  1.,  1.]]),

    "Sharpen": torch.tensor([[ 0., -1.,  0.],
                              [-1.,  5., -1.],
                              [ 0., -1.,  0.]]),

    "Blur (Box)": torch.tensor([[1., 1., 1.],
                                 [1., 1., 1.],
                                 [1., 1., 1.]]) / 9.0,

    "Emboss": torch.tensor([[-2., -1., 0.],
                             [-1.,  1., 1.],
                             [ 0.,  1., 2.]]),

    "Diagonal Edge": torch.tensor([[ 0.,  1.,  1.],
                                    [-1.,  0.,  1.],
                                    [-1., -1.,  0.]]),
}


# ─── 3. Apply Each Kernel ─────────────────────────────────
def apply_kernel(image, kernel):
    """Apply a 3×3 kernel to a single-channel image."""
    # Reshape for F.conv2d: [batch, channels, H, W]
    img = image.unsqueeze(0)  # [1, 1, 28, 28]
    # Kernel shape: [out_channels, in_channels, H, W]
    k = kernel.unsqueeze(0).unsqueeze(0)  # [1, 1, 3, 3]
    # Apply convolution with same padding
    output = F.conv2d(img, k, padding=1)
    return output.squeeze()  # [28, 28]


# ─── 4. Visualize ─────────────────────────────────────────
fig, axes = plt.subplots(2, 4, figsize=(14, 7))

# Original image
axes[0, 0].imshow(image.squeeze(), cmap="gray")
axes[0, 0].set_title(f"Original (digit {label})")
axes[0, 0].axis("off")

# Apply and show each kernel
for idx, (name, kernel) in enumerate(kernels.items()):
    row = (idx + 1) // 4
    col = (idx + 1) % 4
    result = apply_kernel(image, kernel)
    axes[row, col].imshow(result.numpy(), cmap="gray")
    axes[row, col].set_title(name)
    axes[row, col].axis("off")

# Hide unused subplot
axes[1, 3].axis("off")
plt.tight_layout()
plt.savefig("convolution_kernels.png", dpi=100)
plt.show()
print("Saved: convolution_kernels.png")


# ─── 5. Experiment with Kernel Sizes ──────────────────────
print("\n" + "=" * 50)
print("Effect of Kernel Size on Output")
print("=" * 50)

image_batch = image.unsqueeze(0)  # [1, 1, 28, 28]

for k_size in [1, 3, 5, 7]:
    conv = nn.Conv2d(1, 16, kernel_size=k_size, padding=0)
    output = conv(image_batch)
    params = sum(p.numel() for p in conv.parameters())
    print(f"Kernel {k_size}×{k_size}: Input 28×28 → Output {output.shape[2]}×{output.shape[3]}"
          f"  (params: {params:,})")

# Output:
# Kernel 1×1: Input 28×28 → Output 28×28  (params: 32)
# Kernel 3×3: Input 28×28 → Output 26×26  (params: 160)
# Kernel 5×5: Input 28×28 → Output 24×24  (params: 416)
# Kernel 7×7: Input 28×28 → Output 22×22  (params: 800)


# ─── 6. Padding Comparison ────────────────────────────────
print("\n" + "=" * 50)
print("Effect of Padding")
print("=" * 50)

for padding in [0, 1, 2]:
    conv = nn.Conv2d(1, 16, kernel_size=3, padding=padding)
    output = conv(image_batch)
    print(f"Padding={padding}: Input 28×28 → Output {output.shape[2]}×{output.shape[3]}")

# Padding=0: Input 28×28 → Output 26×26
# Padding=1: Input 28×28 → Output 28×28  ← "same" padding
# Padding=2: Input 28×28 → Output 30×30


# ─── 7. Stride Comparison ─────────────────────────────────
print("\n" + "=" * 50)
print("Effect of Stride")
print("=" * 50)

for stride in [1, 2, 3]:
    conv = nn.Conv2d(1, 16, kernel_size=3, padding=1, stride=stride)
    output = conv(image_batch)
    print(f"Stride={stride}: Input 28×28 → Output {output.shape[2]}×{output.shape[3]}")

# Stride=1: Input 28×28 → Output 28×28
# Stride=2: Input 28×28 → Output 14×14  ← halves the size
# Stride=3: Input 28×28 → Output 10×10


# ─── 8. Learned Filters from a Trained CNN ────────────────
print("\n" + "=" * 50)
print("What Learned Filters Look Like")
print("=" * 50)

# Train a quick CNN
model = nn.Sequential(
    nn.Conv2d(1, 16, 3, padding=1),
    nn.ReLU(),
    nn.Conv2d(16, 32, 3, padding=1),
    nn.ReLU(),
    nn.AdaptiveAvgPool2d(1),
    nn.Flatten(),
    nn.Linear(32, 10),
)

# Quick training (just enough to learn meaningful filters)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = nn.CrossEntropyLoss()
loader = torch.utils.data.DataLoader(dataset, batch_size=128, shuffle=True)

model.train()
for batch_idx, (data, target) in enumerate(loader):
    if batch_idx >= 50:  # 50 batches is enough to learn basic edges
        break
    optimizer.zero_grad()
    loss = criterion(model(data), target)
    loss.backward()
    optimizer.step()

# Visualize learned filters from first conv layer
first_conv_weights = model[0].weight.data  # [16, 1, 3, 3]
fig, axes = plt.subplots(2, 8, figsize=(12, 3))
for i in range(16):
    ax = axes[i // 8, i % 8]
    ax.imshow(first_conv_weights[i, 0].numpy(), cmap="gray")
    ax.axis("off")
    ax.set_title(f"F{i+1}", fontsize=8)

plt.suptitle("Learned 3×3 Filters (First Conv Layer)")
plt.tight_layout()
plt.savefig("learned_filters.png", dpi=100)
plt.show()
print("Saved: learned_filters.png")
print("\nNotice: the network learned edge detectors automatically!")
```

---

## Common Output Size Calculations

Here's a cheat sheet for common configurations:

```
┌─────────────────────────────────────────────────────────────────┐
│  Input     Conv Config              Output    Use Case           │
├─────────────────────────────────────────────────────────────────┤
│  224×224   K=3, P=1, S=1          224×224   Same size           │
│  224×224   K=3, P=1, S=2          112×112   Downsample 2×       │
│  224×224   K=7, P=3, S=2          112×112   ResNet first conv   │
│  56×56     K=3, P=1, S=1           56×56    Same size           │
│  56×56     K=3, P=1, S=2           28×28    Downsample 2×       │
│  28×28     K=3, P=0, S=1           26×26    Shrink by 2         │
│  28×28     K=5, P=2, S=1           28×28    Same size           │
│  14×14     K=3, P=1, S=1           14×14    Same size           │
│  7×7       K=1, P=0, S=1            7×7     Channel mixing      │
└─────────────────────────────────────────────────────────────────┘
```

### Rule of Thumb

```
Want same size?   →  padding = (kernel_size - 1) / 2, stride = 1
Want half size?   →  padding = 1, stride = 2 (for 3×3 kernel)
Want channel mix? →  kernel_size = 1
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Convolution** | Sliding dot product between kernel and input patches |
| **Kernel (filter)** | Small matrix of learnable weights (typically 3×3) |
| **Output size** | $O = \lfloor(W - K + 2P) / S\rfloor + 1$ |
| **Padding** | Adds zeros around input; `P=(K-1)/2` for "same" size |
| **Stride** | Step size; stride=2 halves output dimensions |
| **Multiple channels** | Each filter spans all input channels; N filters → N output channels |
| **1×1 convolutions** | Mix channels, reduce/expand dimensionality |
| **Depthwise separable** | Factorize into depthwise + pointwise for efficiency |

### Quick Reference

```
┌───────────────────────────────────────────────────────┐
│            nn.Conv2d Cheat Sheet                      │
│                                                       │
│  nn.Conv2d(C_in, C_out, K, stride=S, padding=P)      │
│                                                       │
│  Parameters: C_out × (C_in × K × K + 1)              │
│  Output: (W - K + 2P) / S + 1                        │
│                                                       │
│  Common patterns:                                     │
│    Same size:  K=3, P=1, S=1                          │
│    Downsample: K=3, P=1, S=2                          │
│    Channel mix: K=1, P=0, S=1                         │
└───────────────────────────────────────────────────────┘
```

In the next lesson, you'll learn about **pooling layers** — how they reduce spatial dimensions, increase the receptive field, and why global average pooling has replaced large FC layers in modern architectures.
