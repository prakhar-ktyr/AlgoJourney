---
title: CNNs for Computer Vision
---

# CNNs for Computer Vision

In this lesson, you will dive deep into Convolutional Neural Networks — the workhorse of modern computer vision. You'll understand each layer type, study the classic architectures that shaped the field, and build and train a CNN from scratch on CIFAR-10.

---

## Convolution Layer

The convolution layer is the core building block of a CNN. It slides a small filter (kernel) over the input and computes dot products.

### How It Works

1. A filter (e.g., 3×3) slides over the input feature map
2. At each position, compute element-wise multiplication and sum
3. The result is one value in the **output feature map**

### Output Size Formula

$$
\text{output\_size} = \frac{n + 2p - k}{s} + 1
$$

Where:
- $n$ = input size
- $k$ = kernel size
- $p$ = padding
- $s$ = stride

### Examples

| Input | Kernel | Padding | Stride | Output |
|-------|--------|---------|--------|--------|
| 32 | 3 | 1 | 1 | 32 (same) |
| 32 | 3 | 0 | 1 | 30 |
| 32 | 5 | 2 | 1 | 32 (same) |
| 32 | 3 | 1 | 2 | 16 (halved) |

### Parameters

| Parameter | Effect |
|-----------|--------|
| `kernel_size` | Receptive field size (3×3, 5×5, 7×7) |
| `stride` | Step size — stride 2 halves spatial dimensions |
| `padding` | Add zeros around border — keeps size unchanged |
| `dilation` | Spacing between kernel elements — larger receptive field |
| `in_channels` | Number of input feature maps |
| `out_channels` | Number of filters = number of output feature maps |

### In PyTorch

```python
import torch
import torch.nn as nn

# 3 input channels (RGB), 64 output channels, 3x3 kernel
conv = nn.Conv2d(
    in_channels=3,
    out_channels=64,
    kernel_size=3,
    stride=1,
    padding=1  # same padding
)

# Input: batch of 8 RGB images, 32x32
x = torch.randn(8, 3, 32, 32)
out = conv(x)
print(f"Input:  {x.shape}")   # (8, 3, 32, 32)
print(f"Output: {out.shape}")  # (8, 64, 32, 32)

# Number of parameters
params = sum(p.numel() for p in conv.parameters())
print(f"Parameters: {params}")  # 64 * (3*3*3 + 1) = 1,792
```

---

## Pooling Layers

Pooling reduces the spatial dimensions, making the network:
- More efficient (fewer parameters downstream)
- More robust to small translations

### MaxPool

Takes the **maximum** value in each window:

```python
pool = nn.MaxPool2d(kernel_size=2, stride=2)

x = torch.randn(8, 64, 32, 32)
out = pool(x)
print(f"After MaxPool: {out.shape}")  # (8, 64, 16, 16) — halved!
```

### AvgPool

Takes the **average** value in each window:

```python
avg_pool = nn.AvgPool2d(kernel_size=2, stride=2)
out = avg_pool(x)
print(f"After AvgPool: {out.shape}")  # (8, 64, 16, 16)
```

### Global Average Pooling

Reduces each feature map to a single value (used in modern architectures):

```python
gap = nn.AdaptiveAvgPool2d(1)
x = torch.randn(8, 512, 7, 7)
out = gap(x)
print(f"After GAP: {out.shape}")  # (8, 512, 1, 1)
```

---

## The CNN Architecture Pattern

Most CNNs follow this pattern:

```
Input → [Conv → BN → ReLU → Pool] × N → Global Pool → FC → Output
```

As you go deeper:
- **Spatial size decreases**: 224 → 112 → 56 → 28 → 14 → 7 → 1
- **Channels increase**: 3 → 64 → 128 → 256 → 512

This creates a "pyramid" that compresses spatial information into rich feature vectors.

---

## Classic CNN Architectures

### LeNet-5 (1998) — The Pioneer

The first successful CNN, designed by Yann LeCun for handwritten digit recognition.

```python
class LeNet5(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 6, kernel_size=5),     # 28→24
            nn.Tanh(),
            nn.AvgPool2d(2, 2),                 # 24→12
            nn.Conv2d(6, 16, kernel_size=5),    # 12→8
            nn.Tanh(),
            nn.AvgPool2d(2, 2),                 # 8→4
        )
        self.classifier = nn.Sequential(
            nn.Linear(16 * 4 * 4, 120),
            nn.Tanh(),
            nn.Linear(120, 84),
            nn.Tanh(),
            nn.Linear(84, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)  # flatten
        x = self.classifier(x)
        return x
```

### AlexNet (2012) — The Breakthrough

Key innovations: ReLU activation, dropout, data augmentation, GPU training.

### VGGNet (2014) — Simplicity and Depth

Philosophy: Use only 3×3 convolutions, go deeper.

- Two 3×3 convs = same receptive field as one 5×5, but fewer parameters
- VGG-16: 16 weight layers, 138M parameters

### GoogLeNet / Inception (2014) — Efficient Modules

Key idea: Use multiple filter sizes (1×1, 3×3, 5×5) in parallel, let the network choose.

The **1×1 convolution** reduces channels (dimensionality reduction):

```python
# 1x1 conv: reduces 256 channels to 64
bottleneck = nn.Conv2d(256, 64, kernel_size=1)
```

### ResNet (2015) — Skip Connections

The most important architecture innovation. Solved the **degradation problem**: very deep networks performed worse than shallower ones.

**Residual learning**: instead of learning $H(x)$, learn the residual $F(x) = H(x) - x$:

$$
y = F(x) + x
$$

The skip (shortcut) connection adds the input directly to the output:

```python
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        identity = x                     # skip connection
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = out + identity             # add skip
        out = self.relu(out)
        return out
```

### DenseNet (2017) — Dense Connections

Each layer connects to **every** previous layer (not just the one before it). Encourages feature reuse.

### EfficientNet (2019) — Compound Scaling

Systematically scales width, depth, and resolution together using a compound coefficient.

### ConvNeXt (2022) — Modernized CNN

Takes design ideas from Vision Transformers and applies them to a pure CNN. Competes with transformers while being simpler.

---

## Architecture Comparison

| Architecture | Year | Layers | Params | Top-5 Error | Key Innovation |
|-------------|------|--------|--------|-------------|----------------|
| LeNet-5 | 1998 | 5 | 60K | — | First CNN |
| AlexNet | 2012 | 8 | 61M | 16.4% | ReLU, dropout, GPU |
| VGG-16 | 2014 | 16 | 138M | 7.3% | 3×3 only, depth |
| GoogLeNet | 2014 | 22 | 6.8M | 6.7% | Inception modules |
| ResNet-50 | 2015 | 50 | 25.6M | 3.9% | Skip connections |
| DenseNet-121 | 2017 | 121 | 8.0M | 5.3% | Dense connections |
| EfficientNet-B0 | 2019 | — | 5.3M | 2.3% | Compound scaling |
| ConvNeXt-T | 2022 | — | 28.6M | 1.8% | Modernized CNN |

---

## Building a CNN in PyTorch

Here's a complete CNN for CIFAR-10 (10 classes, 32×32 images):

```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    """
    A simple CNN for CIFAR-10 classification.
    Architecture: 3 conv blocks + global avg pool + classifier
    """
    def __init__(self, num_classes=10):
        super().__init__()

        # Block 1: 3 → 32 channels, 32x32 → 16x16
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.25),
        )

        # Block 2: 32 → 64 channels, 16x16 → 8x8
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.25),
        )

        # Block 3: 64 → 128 channels, 8x8 → 4x4
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.25),
        )

        # Global Average Pooling + Classifier
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),       # 4x4 → 1x1
            nn.Flatten(),                   # (batch, 128, 1, 1) → (batch, 128)
            nn.Linear(128, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.classifier(x)
        return x


# Create model and check
model = SimpleCNN(num_classes=10)
x = torch.randn(4, 3, 32, 32)
out = model(x)
print(f"Input:  {x.shape}")
print(f"Output: {out.shape}")  # (4, 10)

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total parameters: {total_params:,}")
print(f"Trainable parameters: {trainable_params:,}")
```

---

## Training the CNN on CIFAR-10

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Hyperparameters
BATCH_SIZE = 128
LEARNING_RATE = 0.001
EPOCHS = 20
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Data transforms
train_transform = transforms.Compose([
    transforms.RandomCrop(32, padding=4),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])

test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])

# Datasets and loaders
train_dataset = datasets.CIFAR10("./data", train=True, download=True, transform=train_transform)
test_dataset = datasets.CIFAR10("./data", train=False, download=True, transform=test_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

# Model, loss, optimizer
model = SimpleCNN(num_classes=10).to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

print(f"Training on: {DEVICE}")
print(f"CIFAR-10 classes: {train_dataset.classes}")
```

### Training Loop

```python
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Track metrics
        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc


def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc


# Training loop
best_acc = 0.0

for epoch in range(EPOCHS):
    train_loss, train_acc = train_one_epoch(
        model, train_loader, criterion, optimizer, DEVICE
    )
    test_loss, test_acc = evaluate(model, test_loader, criterion, DEVICE)
    scheduler.step()

    print(
        f"Epoch [{epoch+1}/{EPOCHS}] "
        f"Train Loss: {train_loss:.4f} Acc: {train_acc:.2f}% | "
        f"Test Loss: {test_loss:.4f} Acc: {test_acc:.2f}%"
    )

    # Save best model
    if test_acc > best_acc:
        best_acc = test_acc
        torch.save(model.state_dict(), "best_cifar10_cnn.pth")

print(f"\nBest Test Accuracy: {best_acc:.2f}%")
```

### Expected Results

| Epoch | Train Acc | Test Acc |
|-------|-----------|----------|
| 1 | ~45% | ~50% |
| 5 | ~72% | ~73% |
| 10 | ~82% | ~82% |
| 20 | ~90% | ~87% |

---

## Using Pretrained Architectures

```python
from torchvision import models

# Load pretrained ResNet-50 and modify for 10 classes
resnet50 = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
resnet50.fc = nn.Linear(resnet50.fc.in_features, 10)

# Freeze all layers except the last (fine-tuning)
for param in resnet50.parameters():
    param.requires_grad = False
resnet50.fc.requires_grad_(True)
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Convolution | Filter slides over input → feature map |
| Output size | $(n + 2p - k) / s + 1$ |
| Pooling | Reduce spatial dimensions (MaxPool, AvgPool) |
| CNN pattern | Conv→BN→ReLU→Pool, channels ↑, spatial ↓ |
| ResNet | Skip connections: $y = F(x) + x$ |
| Training | CrossEntropy loss + Adam optimizer |
| Best practice | Data augmentation + BatchNorm + Dropout |

---

## Exercise

1. Build and train the `SimpleCNN` on CIFAR-10 — aim for >85% test accuracy
2. Experiment: What happens if you remove BatchNorm? Dropout? Data augmentation?
3. Replace `SimpleCNN` with a pretrained ResNet-18 — compare training speed and accuracy
4. Visualize the learned filters of your trained model

---

**Next Lesson**: [Object Detection →](36-cv-object-detection.md)
