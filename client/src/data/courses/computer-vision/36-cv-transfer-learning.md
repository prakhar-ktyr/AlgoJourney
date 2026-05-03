---
title: Transfer Learning for CV
---

# Transfer Learning for CV

Transfer learning is the **most important practical technique** in modern computer vision. Instead of training from scratch, you reuse a model that already learned from millions of images.

---

## What Is Transfer Learning?

Transfer learning means taking a model trained on a **large dataset** (like ImageNet with 1.2 million images) and adapting it to your **specific task** (maybe classifying 10 types of flowers with only 500 images).

Think of it like this: a person who learned to draw can pick up painting faster than someone starting from zero.

```
Traditional ML:       Task A data → Train Model A → Use on Task A
Transfer Learning:    Task A data → Train Model A → Adapt to Task B (less data needed!)
```

---

## Why Does Transfer Learning Work?

Neural networks learn features in a **hierarchy**:

| Layer Depth | What It Learns | Universal? |
|-------------|---------------|------------|
| Early layers | Edges, corners, colors | Yes — same everywhere |
| Middle layers | Textures, patterns, shapes | Mostly yes |
| Later layers | Object parts, faces, wheels | Task-specific |
| Final layer | Class predictions | Completely task-specific |

Since **low-level features are universal**, we don't need to relearn them. We keep the knowledge from the pretrained model and only adjust the task-specific parts.

---

## Two Approaches

### 1. Feature Extraction

Freeze the entire pretrained network. Only train a **new classifier head** on top.

```
[Pretrained Backbone — FROZEN] → [New Classifier Head — TRAINABLE]
```

**When to use:** Small dataset + similar domain to ImageNet.

### 2. Fine-Tuning

Unfreeze some or all layers and train the entire network with a **smaller learning rate**.

```
[Earlier Layers — small LR] → [Later Layers — medium LR] → [New Head — larger LR]
```

**When to use:** Larger dataset or very different domain.

---

## Decision Guide

| Scenario | Dataset Size | Domain Similarity | Strategy |
|----------|-------------|-------------------|----------|
| Medical X-rays | Small (500) | Different from ImageNet | Fine-tune carefully |
| Dog breeds | Small (1000) | Similar to ImageNet | Feature extraction |
| Satellite imagery | Large (50k) | Very different | Fine-tune all layers |
| Product photos | Large (100k) | Similar | Fine-tune or train from scratch |

---

## Pretrained Models in torchvision

PyTorch provides many pretrained models through `torchvision.models`:

```python
import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import ResNet50_Weights

# Load a pretrained ResNet-50
model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)

# Check the final layer
print(model.fc)
# Output: Linear(in_features=2048, out_features=1000, bias=True)
```

The model outputs 1000 classes (ImageNet categories). We need to change this.

---

## Feature Extraction: Step by Step

### Step 1: Load Pretrained Model

```python
import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import ResNet18_Weights

# Load pretrained ResNet-18
model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
```

### Step 2: Freeze All Parameters

```python
# Freeze all layers — no gradients will be computed
for param in model.parameters():
    param.requires_grad = False
```

### Step 3: Replace the Classifier Head

```python
# ResNet-18 final layer: Linear(512, 1000)
# Replace with our own for 5 classes
num_classes = 5
model.fc = nn.Linear(512, num_classes)

# The new layer is trainable by default
print(model.fc.weight.requires_grad)  # True
```

### Step 4: Only Optimize the New Head

```python
# Only pass parameters that require gradients
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
```

---

## Fine-Tuning: Step by Step

### Step 1: Load and Modify Model

```python
model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
num_classes = 5
model.fc = nn.Linear(512, num_classes)
```

### Step 2: Unfreeze Specific Layers

```python
# Freeze everything first
for param in model.parameters():
    param.requires_grad = False

# Unfreeze layer4 (last residual block) and fc
for param in model.layer4.parameters():
    param.requires_grad = True
for param in model.fc.parameters():
    param.requires_grad = True
```

### Step 3: Use Discriminative Learning Rates

Different learning rates for different layers — earlier layers get **smaller** rates:

```python
# Group parameters by layer
param_groups = [
    {"params": model.layer3.parameters(), "lr": 1e-5},
    {"params": model.layer4.parameters(), "lr": 1e-4},
    {"params": model.fc.parameters(), "lr": 1e-3},
]

optimizer = torch.optim.Adam(param_groups)
```

This makes sense because:
- Earlier layers already have good features → small updates
- Later layers need more adaptation → larger updates
- New head starts random → needs the largest learning rate

---

## ImageNet Preprocessing

All torchvision pretrained models expect the **same normalization**:

```python
from torchvision import transforms

# ImageNet normalization values
imagenet_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
```

> **Important:** If you skip this normalization, the pretrained features will be meaningless! The model was trained with these exact values.

For training, add data augmentation:

```python
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
```

---

## Complete Transfer Learning Pipeline

Here's a full working example: classifying flowers using a pretrained ResNet-18.

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import ResNet18_Weights

# ─── Configuration ─────────────────────────────────────────
DATA_DIR = "./flower_photos"
NUM_CLASSES = 5
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ─── Data Transforms ───────────────────────────────────────
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ─── Datasets & Loaders ───────────────────────────────────
train_dataset = datasets.ImageFolder(f"{DATA_DIR}/train", transform=train_transform)
val_dataset = datasets.ImageFolder(f"{DATA_DIR}/val", transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

print(f"Classes: {train_dataset.classes}")
print(f"Training samples: {len(train_dataset)}")
print(f"Validation samples: {len(val_dataset)}")

# ─── Model Setup ──────────────────────────────────────────
model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)

# Freeze backbone
for param in model.parameters():
    param.requires_grad = False

# Replace classifier
model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(512, NUM_CLASSES)
)

model = model.to(DEVICE)

# ─── Loss & Optimizer ─────────────────────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

# ─── Training Loop ────────────────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc


def evaluate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc


# ─── Run Training ─────────────────────────────────────────
best_acc = 0.0

for epoch in range(NUM_EPOCHS):
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer)
    val_loss, val_acc = evaluate(model, val_loader, criterion)
    scheduler.step()

    print(f"Epoch {epoch+1}/{NUM_EPOCHS}")
    print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
    print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), "best_model.pth")
        print(f"  ✓ Saved best model (acc: {best_acc:.2f}%)")

print(f"\nBest validation accuracy: {best_acc:.2f}%")
```

---

## Gradual Unfreezing Strategy

Start with feature extraction, then gradually unfreeze:

```python
# Phase 1: Train only the head (5 epochs)
for param in model.parameters():
    param.requires_grad = False
model.fc = nn.Linear(512, NUM_CLASSES)
# ... train for 5 epochs ...

# Phase 2: Unfreeze layer4 (5 more epochs)
for param in model.layer4.parameters():
    param.requires_grad = True
# ... train with smaller LR ...

# Phase 3: Unfreeze layer3 (5 more epochs)
for param in model.layer3.parameters():
    param.requires_grad = True
# ... train with even smaller LR ...
```

This approach is **safer** than unfreezing everything at once — it avoids destroying the pretrained features.

---

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| Forgetting ImageNet normalization | Features become garbage | Always normalize with mean/std |
| Learning rate too high when fine-tuning | Destroys pretrained weights | Start with 1e-4 or lower |
| Not using `model.eval()` at inference | BatchNorm/Dropout behave differently | Always call before prediction |
| Training on tiny data without augmentation | Overfits immediately | Add strong augmentation |
| Freezing BatchNorm incorrectly | Running stats get corrupted | Set `model.eval()` for frozen BN layers |

---

## Quick Reference: Model Input Sizes

| Model | Input Size | Final Feature Dim |
|-------|-----------|-------------------|
| ResNet-18/34 | 224×224 | 512 |
| ResNet-50/101/152 | 224×224 | 2048 |
| EfficientNet-B0 | 224×224 | 1280 |
| MobileNet-V3 | 224×224 | 960 |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Transfer learning | Reuse pretrained model on new task |
| Feature extraction | Freeze backbone, train head only |
| Fine-tuning | Unfreeze layers, use small LR |
| Discriminative LR | Earlier layers = smaller LR |
| ImageNet normalization | mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225] |
| Gradual unfreezing | Safest fine-tuning strategy |

Transfer learning lets you achieve **great results with limited data** — it should be your **default starting point** for any CV task.
