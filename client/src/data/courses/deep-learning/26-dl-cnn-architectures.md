---
title: Classic CNN Architectures
---

# Classic CNN Architectures

In the previous lessons, you learned how CNNs work. Now let's explore the **groundbreaking architectures** that shaped modern computer vision.

These networks competed in the **ImageNet Large Scale Visual Recognition Challenge (ILSVRC)** — a competition that pushed the boundaries of image classification.

---

## Why Study Classic Architectures?

Understanding classic CNNs teaches you:

- How architectural ideas evolved over time
- Why certain design choices work better than others
- The foundation for modern architectures

> **Think of it like this:** Classic architectures are the "greatest hits" of deep learning — each one introduced a key idea still used today.

---

## LeNet-5 (1998) — The Pioneer

**LeNet-5** was designed by Yann LeCun for **handwritten digit recognition** (MNIST dataset).

### Architecture

| Layer | Type | Output Size |
|-------|------|-------------|
| Input | Grayscale image | $32 \times 32 \times 1$ |
| C1 | Conv (6 filters, 5×5) | $28 \times 28 \times 6$ |
| S2 | Avg Pool (2×2) | $14 \times 14 \times 6$ |
| C3 | Conv (16 filters, 5×5) | $10 \times 10 \times 16$ |
| S4 | Avg Pool (2×2) | $5 \times 5 \times 16$ |
| C5 | Conv (120 filters, 5×5) | $1 \times 1 \times 120$ |
| F6 | Fully Connected | 84 |
| Output | Fully Connected | 10 |

### Key Features

- Used **tanh** activation (ReLU wasn't popular yet)
- **Average pooling** instead of max pooling
- Only **~60,000 parameters** — tiny by today's standards
- Trained on **CPU** (GPUs weren't used for deep learning yet)

### LeNet-5 in PyTorch

```python
import torch
import torch.nn as nn

class LeNet5(nn.Module):
    def __init__(self):
        super(LeNet5, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 6, kernel_size=5, padding=2),
            nn.Tanh(),
            nn.AvgPool2d(kernel_size=2, stride=2),
            nn.Conv2d(6, 16, kernel_size=5),
            nn.Tanh(),
            nn.AvgPool2d(kernel_size=2, stride=2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(16 * 5 * 5, 120),
            nn.Tanh(),
            nn.Linear(120, 84),
            nn.Tanh(),
            nn.Linear(84, 10),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)  # Flatten
        x = self.classifier(x)
        return x

# Create model
model = LeNet5()
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
# Parameters: 61,706
```

---

## AlexNet (2012) — The ImageNet Breakthrough

**AlexNet** won the 2012 ImageNet challenge by a huge margin, reducing the top-5 error from 26% to 15.3%. This was the moment deep learning became mainstream.

### What Made AlexNet Special?

1. **ReLU activation** — much faster than tanh/sigmoid
2. **Dropout** — prevented overfitting (0.5 dropout in FC layers)
3. **GPU training** — split across two GTX 580 GPUs
4. **Data augmentation** — image translations, reflections, PCA color augmentation
5. **Local Response Normalization** (LRN) — later replaced by batch norm

### Architecture

| Layer | Type | Output Size | Parameters |
|-------|------|-------------|------------|
| Input | RGB image | $227 \times 227 \times 3$ | — |
| Conv1 | Conv (96, 11×11, stride 4) | $55 \times 55 \times 96$ | 34,944 |
| Pool1 | Max Pool (3×3, stride 2) | $27 \times 27 \times 96$ | — |
| Conv2 | Conv (256, 5×5, pad 2) | $27 \times 27 \times 256$ | 614,656 |
| Pool2 | Max Pool (3×3, stride 2) | $13 \times 13 \times 256$ | — |
| Conv3 | Conv (384, 3×3, pad 1) | $13 \times 13 \times 384$ | 885,120 |
| Conv4 | Conv (384, 3×3, pad 1) | $13 \times 13 \times 384$ | 1,327,488 |
| Conv5 | Conv (256, 3×3, pad 1) | $13 \times 13 \times 256$ | 884,992 |
| Pool5 | Max Pool (3×3, stride 2) | $6 \times 6 \times 256$ | — |
| FC6 | Fully Connected | 4096 | 37,752,832 |
| FC7 | Fully Connected | 4096 | 16,781,312 |
| FC8 | Fully Connected | 1000 | 4,097,000 |

> **Total: ~62 million parameters** — most in the FC layers!

### AlexNet in PyTorch

```python
import torch
import torch.nn as nn

class AlexNet(nn.Module):
    def __init__(self, num_classes=1000):
        super(AlexNet, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 96, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(96, 256, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(256, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), 256 * 6 * 6)
        x = self.classifier(x)
        return x

model = AlexNet()
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
# Parameters: 62,378,344
```

---

## VGGNet (2014) — Simplicity and Depth

**VGGNet** from Oxford's Visual Geometry Group showed that using **small 3×3 filters** stacked deeply achieves better results than large filters.

### The Key Insight

Two stacked 3×3 convolutions have the same **receptive field** as one 5×5 convolution, but with:

- **Fewer parameters**: $2 \times (3^2 \times C^2) = 18C^2$ vs $5^2 \times C^2 = 25C^2$
- **More non-linearity**: two ReLU activations instead of one
- **Better gradient flow**: shorter path from loss to early layers

Three stacked 3×3 convolutions equal one 7×7 convolution:

$$\text{Receptive field of } n \text{ stacked } 3\times3 = (2n + 1) \times (2n + 1)$$

### VGG-16 Architecture

The "16" refers to 16 layers with learnable weights (13 conv + 3 FC):

| Block | Layers | Output Size |
|-------|--------|-------------|
| Input | — | $224 \times 224 \times 3$ |
| Block 1 | 2 × Conv(64, 3×3) + MaxPool | $112 \times 112 \times 64$ |
| Block 2 | 2 × Conv(128, 3×3) + MaxPool | $56 \times 56 \times 128$ |
| Block 3 | 3 × Conv(256, 3×3) + MaxPool | $28 \times 28 \times 256$ |
| Block 4 | 3 × Conv(512, 3×3) + MaxPool | $14 \times 14 \times 512$ |
| Block 5 | 3 × Conv(512, 3×3) + MaxPool | $7 \times 7 \times 512$ |
| FC | 4096 → 4096 → 1000 | 1000 |

> **Total: ~138 million parameters** — very heavy!

### VGG-16 vs VGG-19

| Variant | Conv Layers | FC Layers | Total Parameters |
|---------|-------------|-----------|-----------------|
| VGG-16 | 13 | 3 | ~138M |
| VGG-19 | 16 | 3 | ~144M |

VGG-19 adds one extra conv layer to blocks 3, 4, and 5.

### VGG-like Network in PyTorch

```python
import torch
import torch.nn as nn

def make_vgg_block(in_channels, out_channels, num_convs):
    """Create a VGG-style block with multiple conv layers."""
    layers = []
    for _ in range(num_convs):
        layers.append(nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1))
        layers.append(nn.BatchNorm2d(out_channels))  # Modern addition
        layers.append(nn.ReLU(inplace=True))
        in_channels = out_channels
    layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
    return nn.Sequential(*layers)

class VGG16(nn.Module):
    def __init__(self, num_classes=1000):
        super(VGG16, self).__init__()
        self.features = nn.Sequential(
            make_vgg_block(3, 64, 2),     # Block 1
            make_vgg_block(64, 128, 2),   # Block 2
            make_vgg_block(128, 256, 3),  # Block 3
            make_vgg_block(256, 512, 3),  # Block 4
            make_vgg_block(512, 512, 3),  # Block 5
        )
        self.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

model = VGG16()
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")

# Test with a sample input
x = torch.randn(1, 3, 224, 224)
output = model(x)
print(f"Input: {x.shape} → Output: {output.shape}")
```

---

## Comparison Table

| Architecture | Year | Depth | Parameters | Top-5 Error | Key Innovation |
|-------------|------|-------|------------|-------------|----------------|
| LeNet-5 | 1998 | 7 | 60K | — (MNIST) | First successful CNN |
| AlexNet | 2012 | 8 | 62M | 15.3% | ReLU, dropout, GPU |
| VGG-16 | 2014 | 16 | 138M | 7.3% | Small 3×3 filters, depth |
| VGG-19 | 2014 | 19 | 144M | 7.3% | Even deeper |

### Error Rate Progression on ImageNet

```
Year  | Winner      | Top-5 Error
------+-------------+------------
2010  | Traditional | 28.2%
2011  | Traditional | 25.8%
2012  | AlexNet     | 15.3%  ← Deep learning era begins
2013  | ZFNet       | 11.7%
2014  | GoogLeNet   |  6.7%
2014  | VGGNet      |  7.3%
2015  | ResNet      |  3.6%  ← Surpasses human (~5%)
```

---

## Key Insights from Classic CNNs

### 1. Depth Matters

Going deeper consistently improved accuracy:

$$\text{Accuracy} \propto \text{Depth (up to a point)}$$

### 2. Small Filters Are Better

- 3×3 filters with more layers beat large filters
- More non-linearity, fewer parameters

### 3. The FC Layer Problem

Most parameters in AlexNet and VGG are in fully connected layers:

| Network | Conv Parameters | FC Parameters | FC % |
|---------|----------------|---------------|------|
| AlexNet | 3.7M | 58.6M | 94% |
| VGG-16 | 14.7M | 123.6M | 89% |

> Modern networks replace FC layers with **Global Average Pooling** to reduce parameters dramatically.

### 4. Regularization is Essential

- **Dropout** (AlexNet, VGG): randomly zero out neurons during training
- **Data augmentation**: create more training variety
- **Weight decay**: L2 regularization on parameters

---

## Challenges of Classic Architectures

### Vanishing Gradients

As networks get deeper, gradients can become very small:

$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial a_n} \cdot \frac{\partial a_n}{\partial a_{n-1}} \cdots \frac{\partial a_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial w_1}$$

If each term $\frac{\partial a_i}{\partial a_{i-1}} < 1$, the product shrinks exponentially.

> **This limited VGG to ~19 layers.** Going deeper actually hurt performance!

### Computational Cost

| Network | FLOPs (forward pass) | Memory |
|---------|---------------------|--------|
| AlexNet | 0.7 billion | ~233 MB |
| VGG-16 | 15.5 billion | ~528 MB |
| VGG-19 | 19.6 billion | ~548 MB |

VGG is 20× more expensive than AlexNet!

### The Degradation Problem

When researchers tried networks deeper than VGG:

```
Depth  | Training Error | Test Error
-------+----------------+-----------
20     | 4.5%          | 7.2%
56     | 6.0%          | 8.5%  ← Worse!
```

This isn't overfitting — even **training error** increased. The network couldn't even learn an identity mapping.

> **ResNet solved this** (next lesson) with skip connections!

---

## Using Pre-trained Models

In practice, you rarely train these from scratch. Use PyTorch's pre-trained models:

```python
import torchvision.models as models

# Load pre-trained VGG-16
vgg16 = models.vgg16(weights="IMAGENET1K_V1")
print(vgg16)

# Modify for your task (e.g., 10 classes)
vgg16.classifier[6] = nn.Linear(4096, 10)

# Freeze feature layers (transfer learning)
for param in vgg16.features.parameters():
    param.requires_grad = False

# Only train the classifier
optimizer = torch.optim.Adam(vgg16.classifier.parameters(), lr=0.001)
```

---

## Quick Exercise

Try building a **mini-VGG** for CIFAR-10 (32×32 images, 10 classes):

```python
class MiniVGG(nn.Module):
    def __init__(self):
        super(MiniVGG, self).__init__()
        self.features = nn.Sequential(
            # Block 1: 32x32 → 16x16
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout(0.25),
            # Block 2: 16x16 → 8x8
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout(0.25),
            # Block 3: 8x8 → 4x4
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout(0.25),
        )
        self.classifier = nn.Sequential(
            nn.Linear(128 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 10),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

model = MiniVGG()
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
# Parameters: ~1.2M — much more manageable!
```

---

## Summary

| What You Learned | Details |
|-----------------|---------|
| LeNet-5 | First CNN, digit recognition, 60K params |
| AlexNet | ImageNet breakthrough, ReLU + dropout |
| VGGNet | 3×3 filters, depth = accuracy |
| Key insight | Deeper networks learn better features |
| Challenge | Vanishing gradients limit depth |
| Solution | Skip connections (next lesson!) |

---

## Next Lesson

In the next lesson, we'll explore **Modern CNN Architectures** — GoogLeNet, ResNet, DenseNet, MobileNet, and EfficientNet — that solved the depth problem and made CNNs practical for real-world deployment.
