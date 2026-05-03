---
title: Image Classification
---

# Image Classification

Image classification is the task of assigning a **label** to an image from a predefined set of categories. It's the most fundamental computer vision task — and the one that launched the deep learning revolution.

In this lesson, you'll build a **complete image classification pipeline** from scratch.

---

## The Pipeline

Every image classification project follows these steps:

```
1. Load Dataset
2. Preprocess & Augment
3. Define Model
4. Train
5. Evaluate
6. Deploy
```

Let's build each step using **CIFAR-10** — a classic benchmark dataset.

---

## Dataset: CIFAR-10

CIFAR-10 contains **60,000** color images (32×32 pixels) in 10 classes:

| Class | Examples |
|-------|----------|
| 0 - Airplane | Jets, propeller planes |
| 1 - Automobile | Sedans, trucks |
| 2 - Bird | Various bird species |
| 3 - Cat | Domestic cats |
| 4 - Deer | Wild deer |
| 5 - Dog | Various dog breeds |
| 6 - Frog | Frogs, toads |
| 7 - Horse | Horses |
| 8 - Ship | Boats, ships |
| 9 - Truck | Large trucks |

- **Training set:** 50,000 images (5,000 per class)
- **Test set:** 10,000 images (1,000 per class)

### Loading CIFAR-10

```python
import torch
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader

# Basic transforms (we'll add augmentation later)
transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                        (0.2470, 0.2435, 0.2616)),
])

# Load dataset
trainset = torchvision.datasets.CIFAR10(
    root="./data", train=True, download=True, transform=transform_test
)
testset = torchvision.datasets.CIFAR10(
    root="./data", train=False, download=True, transform=transform_test
)

print(f"Training samples: {len(trainset)}")
print(f"Test samples: {len(testset)}")
print(f"Image shape: {trainset[0][0].shape}")  # [3, 32, 32]
print(f"Classes: {trainset.classes}")
```

---

## Data Augmentation

Data augmentation creates **variations** of training images to:
- Prevent overfitting
- Make the model robust to transformations
- Effectively increase dataset size

### Common Augmentations for CIFAR-10

```python
transform_train = transforms.Compose([
    # Randomly crop 32×32 from padded 40×40 image
    transforms.RandomCrop(32, padding=4),
    # Flip horizontally with 50% probability
    transforms.RandomHorizontalFlip(p=0.5),
    # Randomly adjust brightness, contrast, saturation
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
    ),
    # Random rotation up to 15 degrees
    transforms.RandomRotation(15),
    # Convert to tensor
    transforms.ToTensor(),
    # Normalize with CIFAR-10 mean and std
    transforms.Normalize(
        mean=(0.4914, 0.4822, 0.4465),
        std=(0.2470, 0.2435, 0.2616),
    ),
    # Randomly erase a rectangle (cutout-style)
    transforms.RandomErasing(p=0.5, scale=(0.02, 0.33)),
])
```

### Why These Specific Values?

| Transform | Purpose |
|-----------|---------|
| RandomCrop(32, padding=4) | Simulates slight position changes |
| RandomHorizontalFlip | Cars/planes look same flipped |
| ColorJitter | Handles lighting variations |
| Normalize(mean, std) | Computed from training set statistics |
| RandomErasing | Forces model to use all parts of image |

> **Important:** Only augment the **training** set. Test set uses only ToTensor + Normalize.

### Create DataLoaders

```python
# Reload training set with augmentation
trainset = torchvision.datasets.CIFAR10(
    root="./data", train=True, download=True, transform=transform_train
)

# Create data loaders
train_loader = DataLoader(
    trainset, batch_size=128, shuffle=True,
    num_workers=2, pin_memory=True
)
test_loader = DataLoader(
    testset, batch_size=256, shuffle=False,
    num_workers=2, pin_memory=True
)

print(f"Training batches: {len(train_loader)}")
print(f"Test batches: {len(test_loader)}")
```

---

## Model Architecture

We'll build a custom CNN and also show how to use a pre-trained ResNet.

### Option 1: Custom CNN

```python
import torch.nn as nn

class CIFAR10Net(nn.Module):
    def __init__(self, num_classes=10):
        super(CIFAR10Net, self).__init__()

        self.features = nn.Sequential(
            # Block 1: 32×32 → 16×16
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.2),

            # Block 2: 16×16 → 8×8
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.3),

            # Block 3: 8×8 → 4×4
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.4),
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 4 * 4, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

model = CIFAR10Net()
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
```

### Option 2: Pre-trained ResNet (Transfer Learning)

```python
import torchvision.models as models

# Load pre-trained ResNet-18
model = models.resnet18(weights="IMAGENET1K_V1")

# Modify first conv for 32×32 images (original expects 224×224)
model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
model.maxpool = nn.Identity()  # Remove maxpool (too aggressive for 32×32)

# Modify final layer for 10 classes
model.fc = nn.Linear(model.fc.in_features, 10)

print(f"Modified ResNet-18 parameters: {sum(p.numel() for p in model.parameters()):,}")
```

---

## Training

### Setup

```python
import torch.optim as optim

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CIFAR10Net().to(device)

# Loss function
criterion = nn.CrossEntropyLoss()

# Optimizer
optimizer = optim.SGD(
    model.parameters(),
    lr=0.1,
    momentum=0.9,
    weight_decay=5e-4,
)

# Learning rate scheduler
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=200)
```

### Why Cosine Annealing?

The learning rate follows a cosine curve:

$$\eta_t = \eta_{min} + \frac{1}{2}(\eta_{max} - \eta_{min})\left(1 + \cos\left(\frac{t}{T_{max}} \pi\right)\right)$$

This gives:
- **High LR** early → fast exploration
- **Low LR** late → fine-tuning near optimum
- **Smooth decay** → no abrupt changes

### Training Loop

```python
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (inputs, targets) in enumerate(loader):
        inputs, targets = inputs.to(device), targets.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

    accuracy = 100.0 * correct / total
    avg_loss = running_loss / len(loader)
    return avg_loss, accuracy


def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for inputs, targets in loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, targets)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

    accuracy = 100.0 * correct / total
    avg_loss = running_loss / len(loader)
    return avg_loss, accuracy
```

### Run Training

```python
num_epochs = 200
best_acc = 0.0

for epoch in range(num_epochs):
    train_loss, train_acc = train_epoch(
        model, train_loader, criterion, optimizer, device
    )
    test_loss, test_acc = evaluate(model, test_loader, criterion, device)
    scheduler.step()

    # Print progress every 10 epochs
    if (epoch + 1) % 10 == 0:
        lr = optimizer.param_groups[0]["lr"]
        print(f"Epoch {epoch+1:3d} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.2f}% | "
              f"Test Loss: {test_loss:.4f} Acc: {test_acc:.2f}% | "
              f"LR: {lr:.6f}")

    # Save best model
    if test_acc > best_acc:
        best_acc = test_acc
        torch.save(model.state_dict(), "best_model.pth")

print(f"\nBest Test Accuracy: {best_acc:.2f}%")
```

Expected results after 200 epochs:

```
Epoch  10 | Train Acc: 72.34% | Test Acc: 73.12%
Epoch  50 | Train Acc: 89.67% | Test Acc: 87.45%
Epoch 100 | Train Acc: 94.21% | Test Acc: 91.34%
Epoch 150 | Train Acc: 97.45% | Test Acc: 93.12%
Epoch 200 | Train Acc: 99.12% | Test Acc: 93.78%

Best Test Accuracy: 93.78%
```

---

## Evaluation

### Per-Class Metrics

```python
from collections import defaultdict

def per_class_accuracy(model, loader, device, classes):
    model.eval()
    class_correct = defaultdict(int)
    class_total = defaultdict(int)

    with torch.no_grad():
        for inputs, targets in loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            _, predicted = outputs.max(1)

            for label, pred in zip(targets, predicted):
                class_total[label.item()] += 1
                if label == pred:
                    class_correct[label.item()] += 1

    print("\nPer-Class Accuracy:")
    print("-" * 35)
    for i, cls_name in enumerate(classes):
        acc = 100.0 * class_correct[i] / class_total[i]
        print(f"  {cls_name:<12s}: {acc:.1f}% "
              f"({class_correct[i]}/{class_total[i]})")

per_class_accuracy(model, test_loader, device, trainset.classes)
```

### Confusion Matrix

```python
import numpy as np

def get_confusion_matrix(model, loader, device, num_classes=10):
    model.eval()
    matrix = np.zeros((num_classes, num_classes), dtype=int)

    with torch.no_grad():
        for inputs, targets in loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            _, predicted = outputs.max(1)

            for t, p in zip(targets, predicted):
                matrix[t.item()][p.item()] += 1

    return matrix

matrix = get_confusion_matrix(model, test_loader, device)
print(f"Confusion matrix shape: {matrix.shape}")  # (10, 10)
```

> **Common confusion:** Cats vs Dogs, Birds vs Airplanes (both have similar shapes at 32×32)

---

## Common Mistakes and Debugging Tips

### 1. Not Normalizing Data

```python
# BAD: raw pixel values [0, 255]
transform = transforms.ToTensor()  # Only scales to [0, 1]

# GOOD: normalize with dataset statistics
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean, std),
])
```

### 2. Wrong Learning Rate

| Symptom | Problem | Fix |
|---------|---------|-----|
| Loss doesn't decrease | LR too low | Increase 10× |
| Loss explodes (NaN) | LR too high | Decrease 10× |
| Loss oscillates wildly | LR too high | Decrease 3-5× |
| Stuck at high loss | Local minimum | Use scheduler or restart |

### 3. Overfitting

Signs: Train acc 99%, Test acc 85% → 14% gap! Solutions (in order): more augmentation, add dropout, add weight decay, reduce model size, early stopping.

### 4. Forgetting model.eval()

```python
model.eval()   # Evaluation: disables dropout, uses running BN stats
model.train()  # Training: enables dropout, computes batch stats
```

### 5. Not Using GPU

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
# In training loop: inputs, targets = inputs.to(device), targets.to(device)
```

---

## Improving Your Results

| Technique | Expected Gain | Difficulty |
|-----------|--------------|------------|
| Data augmentation | +2-5% | Easy |
| Learning rate scheduling | +1-3% | Easy |
| Better architecture (ResNet) | +2-5% | Easy |
| Mixup/CutMix | +1-2% | Medium |
| Label smoothing | +0.5-1% | Easy |
| Test-time augmentation | +0.5-1% | Easy |

### Label Smoothing

Instead of hard labels (0 or 1), use soft labels:

$$y_{smooth} = (1 - \epsilon) \cdot y_{hard} + \frac{\epsilon}{K}$$

where $\epsilon = 0.1$ and $K$ = number of classes.

```python
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
```

---

## Summary

| Step | What You Learned |
|------|-----------------|
| Dataset | CIFAR-10: 60K images, 10 classes, 32×32 |
| Augmentation | RandomCrop, Flip, ColorJitter, Normalize |
| Model | Custom CNN or pre-trained ResNet |
| Training | SGD + cosine annealing + weight decay |
| Evaluation | Per-class accuracy, confusion matrix |
| Debugging | Common mistakes and fixes |

---

## Next Lesson

Classification tells you **what** is in an image. But what if you need to know **where** objects are? In the next lesson, we'll tackle **Object Detection** — finding and localizing multiple objects in a single image.
