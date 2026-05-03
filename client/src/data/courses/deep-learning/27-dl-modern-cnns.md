---
title: Modern CNN Architectures
---

# Modern CNN Architectures

Classic CNNs (LeNet, AlexNet, VGG) showed that **depth improves accuracy** — but they hit a wall. Beyond ~20 layers, networks actually got worse.

Modern architectures solved this problem with clever design patterns that enable **hundreds or even thousands** of layers.

---

## The Problem with Going Deeper

Remember from the last lesson:

```
Depth  | Training Error | Test Error
-------+----------------+-----------
20     | 4.5%          | 7.2%
56     | 6.0%          | 8.5%  ← Worse!
```

This **degradation problem** isn't overfitting — it's an optimization problem. Deep networks struggle to learn even an identity mapping.

> **Key question:** Can we design architectures that make deeper always better?

---

## GoogLeNet / Inception (2014)

**GoogLeNet** (also called Inception v1) won ILSVRC 2014 with only **6.7% top-5 error** — using just **5 million parameters** (compared to VGG's 138M).

### The Core Idea: Inception Module

Instead of choosing one filter size, **use them all** and let the network decide:

```
Input
  ├── 1×1 Conv ─────────────────────┐
  ├── 1×1 Conv → 3×3 Conv ──────────┤
  ├── 1×1 Conv → 5×5 Conv ──────────┤  → Concatenate
  └── 3×3 MaxPool → 1×1 Conv ───────┘
```

### Why 1×1 Convolutions?

A 1×1 convolution acts as a **channel-wise dimensionality reducer**:

- Input: $H \times W \times 256$ channels
- 1×1 Conv with 64 filters: $H \times W \times 64$ channels
- Then apply expensive 3×3 or 5×5 conv on fewer channels

**Parameter savings:**

Without 1×1 reduction:
$$5 \times 5 \times 256 \times 32 = 204{,}800 \text{ parameters}$$

With 1×1 reduction (256 → 16 → 32):
$$1 \times 1 \times 256 \times 16 + 5 \times 5 \times 16 \times 32 = 4{,}096 + 12{,}800 = 16{,}896$$

> **That's 12× fewer parameters!**

### Inception Module in PyTorch

```python
import torch
import torch.nn as nn

class InceptionModule(nn.Module):
    def __init__(self, in_channels, ch1x1, ch3x3_reduce, ch3x3,
                 ch5x5_reduce, ch5x5, pool_proj):
        super(InceptionModule, self).__init__()

        # Branch 1: 1×1 conv
        self.branch1 = nn.Sequential(
            nn.Conv2d(in_channels, ch1x1, kernel_size=1),
            nn.BatchNorm2d(ch1x1),
            nn.ReLU(inplace=True),
        )

        # Branch 2: 1×1 → 3×3
        self.branch2 = nn.Sequential(
            nn.Conv2d(in_channels, ch3x3_reduce, kernel_size=1),
            nn.BatchNorm2d(ch3x3_reduce),
            nn.ReLU(inplace=True),
            nn.Conv2d(ch3x3_reduce, ch3x3, kernel_size=3, padding=1),
            nn.BatchNorm2d(ch3x3),
            nn.ReLU(inplace=True),
        )

        # Branch 3: 1×1 → 5×5
        self.branch3 = nn.Sequential(
            nn.Conv2d(in_channels, ch5x5_reduce, kernel_size=1),
            nn.BatchNorm2d(ch5x5_reduce),
            nn.ReLU(inplace=True),
            nn.Conv2d(ch5x5_reduce, ch5x5, kernel_size=5, padding=2),
            nn.BatchNorm2d(ch5x5),
            nn.ReLU(inplace=True),
        )

        # Branch 4: MaxPool → 1×1
        self.branch4 = nn.Sequential(
            nn.MaxPool2d(kernel_size=3, stride=1, padding=1),
            nn.Conv2d(in_channels, pool_proj, kernel_size=1),
            nn.BatchNorm2d(pool_proj),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        b1 = self.branch1(x)
        b2 = self.branch2(x)
        b3 = self.branch3(x)
        b4 = self.branch4(x)
        return torch.cat([b1, b2, b3, b4], dim=1)

# Example: input 192 channels → output 64+128+32+32 = 256 channels
inception = InceptionModule(192, ch1x1=64, ch3x3_reduce=96, ch3x3=128,
                           ch5x5_reduce=16, ch5x5=32, pool_proj=32)
x = torch.randn(1, 192, 28, 28)
print(f"Input: {x.shape} → Output: {inception(x).shape}")
# Input: [1, 192, 28, 28] → Output: [1, 256, 28, 28]
```

### GoogLeNet Key Features

- **22 layers deep** but only **5M parameters** (vs VGG's 138M)
- **No FC layers** — uses Global Average Pooling
- **Auxiliary classifiers** during training to fight vanishing gradients
- Won ILSVRC 2014 with 6.7% top-5 error

---

## ResNet (2015) — The Game Changer

**ResNet** (Residual Network) by Microsoft Research solved the degradation problem and won ILSVRC 2015 with just **3.57% top-5 error** — surpassing human performance (~5%).

### The Residual Block

Instead of learning the desired mapping $H(x)$ directly, learn the **residual**:

$$F(x) = H(x) - x$$

Then the output is:

$$y = F(x) + x$$

This is called a **skip connection** (or shortcut connection).

> **Why does this work?** If the optimal mapping is close to identity, it's easier to learn $F(x) = 0$ (push residual to zero) than to learn $H(x) = x$ directly.

### Visualizing the Residual Block

```
Input (x)
  │
  ├──────────────────────────┐
  │                          │ (skip connection)
  ▼                          │
Conv → BN → ReLU             │
  │                          │
  ▼                          │
Conv → BN                    │
  │                          │
  ▼                          │
  + ◄────────────────────────┘
  │
  ▼
ReLU
  │
Output: F(x) + x
```

### Residual Block in PyTorch

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """Basic residual block with two 3×3 convolutions."""
    def __init__(self, in_channels, out_channels, stride=1):
        super(ResidualBlock, self).__init__()

        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3,
                               stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3,
                               stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # Shortcut connection (identity or projection)
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1,
                         stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        identity = self.shortcut(x)

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        out += identity  # Skip connection!
        out = self.relu(out)
        return out

# Test the block
block = ResidualBlock(64, 128, stride=2)
x = torch.randn(1, 64, 32, 32)
print(f"Input: {x.shape} → Output: {block(x).shape}")
# Input: [1, 64, 32, 32] → Output: [1, 128, 16, 16]
```

### Complete ResNet

```python
class ResNet(nn.Module):
    def __init__(self, block, num_blocks, num_classes=10):
        super(ResNet, self).__init__()
        self.in_channels = 64

        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
        )

        self.layer1 = self._make_layer(block, 64, num_blocks[0], stride=1)
        self.layer2 = self._make_layer(block, 128, num_blocks[1], stride=2)
        self.layer3 = self._make_layer(block, 256, num_blocks[2], stride=2)
        self.layer4 = self._make_layer(block, 512, num_blocks[3], stride=2)

        self.avg_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(512, num_classes)

    def _make_layer(self, block, out_channels, num_blocks, stride):
        strides = [stride] + [1] * (num_blocks - 1)
        layers = []
        for s in strides:
            layers.append(block(self.in_channels, out_channels, s))
            self.in_channels = out_channels
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.conv1(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avg_pool(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x

def ResNet18():
    return ResNet(ResidualBlock, [2, 2, 2, 2])

def ResNet34():
    return ResNet(ResidualBlock, [3, 4, 6, 3])

model = ResNet18()
print(f"ResNet-18 parameters: {sum(p.numel() for p in model.parameters()):,}")
# ResNet-18 parameters: ~11.2M
```

### ResNet Variants

| Variant | Layers | Parameters | Top-5 Error |
|---------|--------|------------|-------------|
| ResNet-18 | 18 | 11.7M | 10.9% |
| ResNet-34 | 34 | 21.8M | 7.4% |
| ResNet-50 | 50 | 25.6M | 6.7% |
| ResNet-101 | 101 | 44.5M | 6.0% |
| ResNet-152 | 152 | 60.2M | 5.7% |

---

## DenseNet (2017) — Dense Connections

**DenseNet** takes skip connections to the extreme: **every layer connects to every other layer**.

### The Dense Block

In a dense block with $L$ layers, there are $\frac{L(L+1)}{2}$ connections:

```
Layer 1 → Layer 2, 3, 4, 5
Layer 2 → Layer 3, 4, 5
Layer 3 → Layer 4, 5
Layer 4 → Layer 5
```

Each layer receives **all preceding feature maps** as input:

$$x_l = H_l([x_0, x_1, \ldots, x_{l-1}])$$

where $[\cdot]$ denotes concatenation.

### Growth Rate

Each layer produces $k$ feature maps (the **growth rate**). After $l$ layers:

$$\text{channels} = k_0 + k \times l$$

Typical growth rates: $k = 12, 24, 32$

### DenseNet Advantages

- **Parameter efficient** — features are reused, not relearned
- **Strong gradient flow** — direct connections to all layers
- **Feature reuse** — earlier features help later layers

---

## MobileNet (2017) — Efficient CNNs for Mobile

**MobileNet** by Google is designed for mobile and embedded devices using **depthwise separable convolutions**.

### Standard vs Depthwise Separable Convolution

**Standard convolution** (e.g., 3×3, 64→128):

$$\text{Cost} = H \times W \times D_K^2 \times M \times N$$

where $D_K$ = kernel size, $M$ = input channels, $N$ = output channels.

**Depthwise separable** splits into two steps:

1. **Depthwise**: one 3×3 filter per input channel
2. **Pointwise**: 1×1 conv to combine channels

$$\text{Cost} = H \times W \times (D_K^2 \times M + M \times N)$$

**Savings ratio:**

$$\frac{D_K^2 \times M \times N}{D_K^2 \times M + M \times N} = \frac{1}{N} + \frac{1}{D_K^2} \approx \frac{1}{D_K^2} = \frac{1}{9}$$

> **~8-9× fewer computations!**

### Depthwise Separable Conv in PyTorch

```python
import torch
import torch.nn as nn

class DepthwiseSeparableConv(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(DepthwiseSeparableConv, self).__init__()
        # Depthwise: one filter per channel (groups=in_channels)
        self.depthwise = nn.Conv2d(in_channels, in_channels, kernel_size=3,
                                   stride=stride, padding=1,
                                   groups=in_channels, bias=False)
        self.bn1 = nn.BatchNorm2d(in_channels)
        # Pointwise: 1×1 conv to mix channels
        self.pointwise = nn.Conv2d(in_channels, out_channels, kernel_size=1,
                                   bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.relu(self.bn1(self.depthwise(x)))
        x = self.relu(self.bn2(self.pointwise(x)))
        return x

# Compare parameters
standard = nn.Conv2d(64, 128, kernel_size=3, padding=1)
separable = DepthwiseSeparableConv(64, 128)

print(f"Standard conv:  {sum(p.numel() for p in standard.parameters()):,} params")
print(f"Depthwise sep:  {sum(p.numel() for p in separable.parameters()):,} params")
# Standard conv:  73,856 params
# Depthwise sep:  9,024 params (~8× less!)
```

---

## EfficientNet (2019) — Scaling Done Right

**EfficientNet** by Google showed that scaling a network's **width, depth, and resolution** together gives the best results.

### Compound Scaling

Previous approaches scaled only one dimension:

| Scaling | What it does | Example |
|---------|-------------|---------|
| Width | More channels | 64 → 128 → 256 |
| Depth | More layers | ResNet-18 → ResNet-152 |
| Resolution | Bigger images | 224 → 331 → 600 |

EfficientNet scales **all three together** with a compound coefficient $\phi$:

$$\text{depth: } d = \alpha^\phi$$
$$\text{width: } w = \beta^\phi$$
$$\text{resolution: } r = \gamma^\phi$$

Subject to: $\alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$ (doubles computation when $\phi$ increases by 1)

### EfficientNet Family

| Model | Resolution | Parameters | Top-1 Acc | FLOPs |
|-------|-----------|------------|-----------|-------|
| B0 | 224 | 5.3M | 77.1% | 0.39B |
| B1 | 240 | 7.8M | 79.1% | 0.70B |
| B2 | 260 | 9.2M | 80.1% | 1.0B |
| B3 | 300 | 12M | 81.6% | 1.8B |
| B4 | 380 | 19M | 82.9% | 4.2B |
| B5 | 456 | 30M | 83.6% | 9.9B |
| B7 | 600 | 66M | 84.3% | 37B |

> EfficientNet-B0 matches ResNet-152 accuracy with **8× fewer parameters**!

### Using Pre-trained EfficientNet

```python
import torch
import torch.nn as nn
import torchvision.models as models

# Load pre-trained EfficientNet-B0
model = models.efficientnet_b0(weights="IMAGENET1K_V1")

# Check the architecture
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")

# Modify for custom task (e.g., 10 classes)
num_features = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(0.2),
    nn.Linear(num_features, 10),
)

# Fine-tune: freeze early layers, train classifier
for param in model.features[:5].parameters():
    param.requires_grad = False

# Training setup
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.001
)

# Test
x = torch.randn(1, 3, 224, 224)
output = model(x)
print(f"Output shape: {output.shape}")  # [1, 10]
```

---

## Architecture Comparison

| Architecture | Year | Params | Top-5 Error | Key Idea |
|-------------|------|--------|-------------|----------|
| GoogLeNet | 2014 | 5M | 6.7% | Inception modules |
| ResNet-50 | 2015 | 25.6M | 6.7% | Skip connections |
| DenseNet-121 | 2017 | 8M | 7.7% | Dense connections |
| MobileNet v2 | 2018 | 3.4M | 8.0% | Depthwise separable |
| EfficientNet-B0 | 2019 | 5.3M | 6.4% | Compound scaling |

### When to Use Which?

| Scenario | Recommended | Why |
|----------|-------------|-----|
| General purpose | ResNet-50 | Good balance, well-tested |
| Mobile/Edge | MobileNet v2 | Tiny, fast |
| Best accuracy | EfficientNet-B4+ | State-of-the-art |
| Transfer learning | ResNet or EfficientNet | Great pre-trained features |
| Limited data | Any pre-trained | Fine-tune, don't train from scratch |

---

## Summary

| Architecture | Innovation | Impact |
|-------------|-----------|--------|
| GoogLeNet | Inception modules, 1×1 convs | Efficient multi-scale features |
| ResNet | Skip connections: $y = F(x) + x$ | Enabled 100+ layer networks |
| DenseNet | Dense connections | Maximum feature reuse |
| MobileNet | Depthwise separable convs | 8× faster, mobile-friendly |
| EfficientNet | Compound scaling | Best accuracy/efficiency ratio |

---

## Next Lesson

Now that you know the architectures, let's put them to work! In the next lesson, we'll build a complete **Image Classification** pipeline from scratch using CIFAR-10.
