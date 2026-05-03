---
title: Transfer Learning
---

# Transfer Learning

Training a deep neural network from scratch requires millions of images and days of GPU time. But what if you only have 500 images of your specific problem? **Transfer learning** lets you take a model trained on millions of images (like ImageNet) and adapt it to your task — often achieving excellent results with minimal data and training time.

In this lesson, you'll learn when and how to use transfer learning, the difference between feature extraction and fine-tuning, and how to implement both in PyTorch.

---

## Why Transfer Learning?

### The Problem

Training from scratch requires:
- **Large datasets** (ImageNet has 1.2M images, 1000 classes)
- **Expensive hardware** (days on multiple GPUs)
- **Expertise** to design architectures

Most real-world problems have:
- **Small datasets** (100-10,000 images)
- **Limited compute** (one GPU, a few hours)
- **No time** to experiment with architecture design

### The Solution

```
┌─────────────────────────────────────────────────────────┐
│  Pre-trained Model (e.g., ResNet-50)                    │
│  Trained on ImageNet: 1.2M images, 1000 classes         │
│  Training time: ~1 week on 8 GPUs                       │
│                                                         │
│  What it learned:                                       │
│   Layer 1-2:  edges, colors, textures                   │
│   Layer 3-5:  patterns, shapes                          │
│   Layer 6-10: parts (eyes, wheels, leaves)              │
│   Layer 11+:  objects (faces, cars, animals)            │
└──────────────────────────┬──────────────────────────────┘
                           │
                    Transfer these!
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Your Task: Classify 5 types of flowers                 │
│  Dataset: 500 images total                              │
│  Training time: ~5 minutes on 1 GPU                     │
│                                                         │
│  Result: 95%+ accuracy (vs ~60% from scratch)           │
└─────────────────────────────────────────────────────────┘
```

> **Key insight:** Early layers learn **universal features** (edges, textures) that transfer well to any vision task. Only the final layers are task-specific.

---

## Pre-trained Models

A **pre-trained model** is a model that was already trained on a large dataset. The model's weights encode useful knowledge about the world.

### What ImageNet Models Learn

```
Layer Depth →
                                                              
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Edges   │   │ Textures │   │  Parts   │   │ Objects  │
   │  Colors  │   │ Patterns │   │  Shapes  │   │  Scenes  │
   │  Simple  │   │ Repeated │   │ Complex  │   │ Specific │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   
   Layer 1-2       Layer 3-5      Layer 6-10     Layer 11+
   (universal)     (general)      (domain)       (task-specific)
      ↑                                              ↑
   Transfers       ←─────────────────────→       Replace this
   to ANY task     (keep or fine-tune)           with your head
```

### Popular Pre-trained Models

| Model | Year | Top-1 Accuracy | Parameters | Speed |
|-------|------|----------------|-----------|-------|
| ResNet-18 | 2015 | 69.8% | 11.7M | Fast |
| ResNet-50 | 2015 | 76.1% | 25.6M | Medium |
| VGG-16 | 2014 | 71.6% | 138M | Slow |
| EfficientNet-B0 | 2019 | 77.1% | 5.3M | Fast |
| EfficientNet-B4 | 2019 | 82.9% | 19M | Medium |
| ViT-B/16 | 2020 | 81.8% | 86M | Medium |

> **Rule of thumb:** Start with ResNet-50 or EfficientNet-B0. They offer the best balance of accuracy and speed.

---

## Two Approaches

There are two main ways to use a pre-trained model:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Approach 1: FEATURE EXTRACTION                           │
│                                                            │
│  ┌────────────────────┐    ┌──────────────┐               │
│  │   Pre-trained       │    │  New Head    │               │
│  │   Backbone          │    │  (trainable) │               │
│  │   (FROZEN ❄️)       │ →  │              │ → predictions │
│  │                     │    │  FC → 5      │               │
│  └────────────────────┘    └──────────────┘               │
│                                                            │
│  Only train the new head. Fast, works with small data.     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Approach 2: FINE-TUNING                                  │
│                                                            │
│  ┌────────────────────┐    ┌──────────────┐               │
│  │   Pre-trained       │    │  New Head    │               │
│  │   Backbone          │    │  (trainable) │               │
│  │   (TRAINABLE 🔥)    │ →  │              │ → predictions │
│  │   (low LR)         │    │  FC → 5      │               │
│  └────────────────────┘    └──────────────┘               │
│                                                            │
│  Train everything with a low LR. Better accuracy.          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Feature Extraction

**Idea:** Use the pre-trained model as a fixed feature extractor. Freeze all its layers and only train a new classification head.

### Why It Works

The pre-trained model converts images into meaningful **feature vectors**:

```
224×224×3 image → [Pre-trained ResNet, frozen] → 2048-dim feature vector
                                                         ↓
                                          [New FC layer, trainable]
                                                         ↓
                                                    5 class scores
```

### Code: Feature Extraction

```python
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms, datasets
from torch.utils.data import DataLoader

# ─── 1. Load Pre-trained Model ─────────────────────────────
# Load ResNet-50 with ImageNet weights
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# ─── 2. Freeze ALL Parameters ──────────────────────────────
for param in model.parameters():
    param.requires_grad = False

# ─── 3. Replace the Classification Head ────────────────────
# ResNet-50's final layer: nn.Linear(2048, 1000)  ← ImageNet classes
# Replace with our own: nn.Linear(2048, 5)  ← our 5 classes
num_classes = 5
model.fc = nn.Sequential(
    nn.Linear(2048, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, num_classes),
)
# New layers are trainable by default (requires_grad=True)

# ─── 4. Check Trainable Parameters ─────────────────────────
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total parameters:     {total_params:,}")
print(f"Trainable parameters: {trainable_params:,}")
print(f"Frozen parameters:    {total_params - trainable_params:,}")
# Total parameters:     24,067,589
# Trainable parameters: 526,597    ← only 2% of all params!
# Frozen parameters:    23,540,992
```

### Data Preparation

Pre-trained models expect specific input normalization:

```python
# ImageNet normalization (REQUIRED for pre-trained models)
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]

# Training transforms (with augmentation)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=imagenet_mean, std=imagenet_std),
])

# Validation transforms (no augmentation)
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=imagenet_mean, std=imagenet_std),
])

# Load dataset (expects folder structure: root/class_name/images)
train_dataset = datasets.ImageFolder("data/train", transform=train_transform)
val_dataset = datasets.ImageFolder("data/val", transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32)

print(f"Classes: {train_dataset.classes}")
print(f"Training samples: {len(train_dataset)}")
```

### Training (Feature Extraction)

```python
# Only optimize the new head parameters
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Training loop
for epoch in range(10):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        correct += (outputs.argmax(1) == labels).sum().item()
        total += labels.size(0)

    train_acc = correct / total

    # Validation
    model.eval()
    val_correct = 0
    val_total = 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            val_correct += (outputs.argmax(1) == labels).sum().item()
            val_total += labels.size(0)

    val_acc = val_correct / val_total
    print(f"Epoch {epoch+1}/10  Loss: {running_loss/len(train_loader):.4f}  "
          f"Train Acc: {train_acc:.4f}  Val Acc: {val_acc:.4f}")
```

---

## Fine-Tuning

**Idea:** After training the head, **unfreeze** some or all pre-trained layers and train the entire model with a very low learning rate.

### Why Fine-Tuning Works Better

Feature extraction treats pre-trained features as fixed. But those features were optimized for ImageNet (dogs, cars, etc.) — your task might need slightly different features. Fine-tuning **adapts** the pre-trained features to your specific domain.

```
Feature Extraction:  pre-trained features (fixed) → new head (learned)
                     "Good enough" features

Fine-Tuning:         pre-trained features (adapted) → new head (learned)
                     "Perfect" features for YOUR task
```

### When to Fine-Tune vs Feature Extract

| Scenario | Approach | Why |
|----------|----------|-----|
| Very small dataset (< 1000) | Feature extraction | Fine-tuning would overfit |
| Small dataset (1K-10K), similar domain | Fine-tune top layers | Adapt high-level features |
| Medium dataset (10K-100K) | Fine-tune most layers | Enough data to adapt |
| Large dataset (100K+) | Fine-tune everything (or train from scratch) | Plenty of data |
| Very different domain (e.g., medical) | Fine-tune more aggressively | Features need more adaptation |

### Gradual Unfreezing

The **safest** fine-tuning strategy: unfreeze layers one group at a time, from top to bottom.

```
Step 1: Train only the new head (feature extraction)
        Frozen: [layer1, layer2, layer3, layer4]
        Training: [fc]

Step 2: Unfreeze the last block
        Frozen: [layer1, layer2, layer3]
        Training: [layer4, fc]

Step 3: Unfreeze more
        Frozen: [layer1, layer2]
        Training: [layer3, layer4, fc]

Step 4: (Optional) Unfreeze everything
        Training: [layer1, layer2, layer3, layer4, fc]
```

### Code: Fine-Tuning

```python
# ─── Phase 1: Feature Extraction (5 epochs) ───────────────
# Start with everything frozen, train only the head
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Sequential(
    nn.Linear(2048, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, num_classes),
)
model = model.to(device)

optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)
train_model(model, optimizer, train_loader, val_loader, epochs=5)
print("Phase 1 complete: head trained")


# ─── Phase 2: Unfreeze Layer 4 (5 epochs) ─────────────────
for param in model.layer4.parameters():
    param.requires_grad = True

# Use LOWER learning rate for pre-trained layers
optimizer = torch.optim.Adam([
    {"params": model.layer4.parameters(), "lr": 1e-4},  # low LR
    {"params": model.fc.parameters(), "lr": 1e-3},      # higher LR
])
train_model(model, optimizer, train_loader, val_loader, epochs=5)
print("Phase 2 complete: layer4 + head trained")


# ─── Phase 3: Unfreeze Layers 3-4 (5 epochs) ──────────────
for param in model.layer3.parameters():
    param.requires_grad = True

optimizer = torch.optim.Adam([
    {"params": model.layer3.parameters(), "lr": 1e-5},  # very low
    {"params": model.layer4.parameters(), "lr": 1e-4},  # low
    {"params": model.fc.parameters(), "lr": 1e-3},      # normal
])
train_model(model, optimizer, train_loader, val_loader, epochs=5)
print("Phase 3 complete: layer3 + layer4 + head trained")
```

### Discriminative Learning Rates

Different layers should have different learning rates:

$$\text{lr}_{\text{layer } i} = \text{lr}_{\text{base}} \times \text{decay}^{(N - i)}$$

```
Layer:      layer1    layer2    layer3    layer4    fc
LR:         1e-6      1e-5      1e-4      1e-3     1e-2

            ← lower (change less)     higher (change more) →
            (universal features)      (task-specific features)
```

```python
# Discriminative learning rates
base_lr = 1e-3
decay = 0.1

param_groups = [
    {"params": model.layer1.parameters(), "lr": base_lr * decay**4},  # 1e-7
    {"params": model.layer2.parameters(), "lr": base_lr * decay**3},  # 1e-6
    {"params": model.layer3.parameters(), "lr": base_lr * decay**2},  # 1e-5
    {"params": model.layer4.parameters(), "lr": base_lr * decay**1},  # 1e-4
    {"params": model.fc.parameters(), "lr": base_lr},                  # 1e-3
]
optimizer = torch.optim.Adam(param_groups)
```

---

## Loading Pre-trained Models in PyTorch

### torchvision.models

```python
import torchvision.models as models

# ─── ResNet variants ────────────────────────────
resnet18 = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
resnet50 = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# ─── EfficientNet ───────────────────────────────
efficientnet = models.efficientnet_b0(
    weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
)

# ─── VGG ────────────────────────────────────────
vgg16 = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1)

# ─── Without pre-trained weights ────────────────
model_random = models.resnet50(weights=None)  # random initialization
```

### Replacing the Head for Different Architectures

Each architecture has a different final layer name:

```python
# ResNet: .fc
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
num_features = model.fc.in_features  # 2048
model.fc = nn.Linear(num_features, num_classes)

# VGG: .classifier[-1]
model = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1)
num_features = model.classifier[6].in_features  # 4096
model.classifier[6] = nn.Linear(num_features, num_classes)

# EfficientNet: .classifier[-1]
model = models.efficientnet_b0(
    weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
)
num_features = model.classifier[1].in_features  # 1280
model.classifier[1] = nn.Linear(num_features, num_classes)
```

---

## Complete Example: Transfer Learning with ResNet

Here's a full, production-ready transfer learning pipeline:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import copy

# ─── Configuration ─────────────────────────────────────────
NUM_CLASSES = 5
BATCH_SIZE = 32
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATA_DIR = "data/flowers"  # folder with train/ and val/ subfolders


# ─── 1. Data Transforms ───────────────────────────────────
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]

data_transforms = {
    "train": transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(imagenet_mean, imagenet_std),
    ]),
    "val": transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(imagenet_mean, imagenet_std),
    ]),
}


# ─── 2. Load Data ─────────────────────────────────────────
image_datasets = {
    split: datasets.ImageFolder(f"{DATA_DIR}/{split}", data_transforms[split])
    for split in ["train", "val"]
}
dataloaders = {
    split: DataLoader(image_datasets[split], batch_size=BATCH_SIZE,
                      shuffle=(split == "train"), num_workers=4)
    for split in ["train", "val"]
}

print(f"Classes: {image_datasets['train'].classes}")
print(f"Train: {len(image_datasets['train'])} | Val: {len(image_datasets['val'])}")


# ─── 3. Build Model ───────────────────────────────────────
def create_transfer_model(num_classes, freeze_backbone=True):
    """Create a ResNet-50 model for transfer learning."""
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

    # Freeze backbone
    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # Replace head
    model.fc = nn.Sequential(
        nn.Linear(2048, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, num_classes),
    )
    return model.to(DEVICE)


# ─── 4. Training Function ─────────────────────────────────
def train_model(model, optimizer, scheduler, num_epochs=10):
    """Train with early stopping based on validation accuracy."""
    criterion = nn.CrossEntropyLoss()
    best_acc = 0.0
    best_model_weights = copy.deepcopy(model.state_dict())

    for epoch in range(num_epochs):
        for phase in ["train", "val"]:
            if phase == "train":
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_correct = 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)

                optimizer.zero_grad()
                with torch.set_grad_enabled(phase == "train"):
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                    preds = outputs.argmax(dim=1)

                    if phase == "train":
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_correct += (preds == labels).sum().item()

            epoch_loss = running_loss / len(image_datasets[phase])
            epoch_acc = running_correct / len(image_datasets[phase])

            if phase == "val":
                scheduler.step(epoch_acc)
                if epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_weights = copy.deepcopy(model.state_dict())

        print(f"Epoch {epoch+1}/{num_epochs}  "
              f"Train Loss: {epoch_loss:.4f}  Val Acc: {epoch_acc:.4f}")

    print(f"\nBest Val Accuracy: {best_acc:.4f}")
    model.load_state_dict(best_model_weights)
    return model


# ─── 5. Phase 1: Feature Extraction ───────────────────────
print("=" * 50)
print("Phase 1: Feature Extraction")
print("=" * 50)

model = create_transfer_model(NUM_CLASSES, freeze_backbone=True)
optimizer = optim.Adam(model.fc.parameters(), lr=1e-3)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)

model = train_model(model, optimizer, scheduler, num_epochs=10)


# ─── 6. Phase 2: Fine-Tuning ──────────────────────────────
print("\n" + "=" * 50)
print("Phase 2: Fine-Tuning (unfreezing layer4)")
print("=" * 50)

# Unfreeze layer4
for param in model.layer4.parameters():
    param.requires_grad = True

# Lower learning rate for fine-tuning
optimizer = optim.Adam([
    {"params": model.layer4.parameters(), "lr": 1e-5},
    {"params": model.fc.parameters(), "lr": 1e-4},
])
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)

model = train_model(model, optimizer, scheduler, num_epochs=10)


# ─── 7. Save the Model ────────────────────────────────────
torch.save({
    "model_state_dict": model.state_dict(),
    "classes": image_datasets["train"].classes,
    "num_classes": NUM_CLASSES,
}, "flower_classifier.pth")
print("\nModel saved to flower_classifier.pth")
```

---

## When to Use Transfer Learning

### Decision Flowchart

```
                   Do you have a lot of data?
                         /          \
                       No            Yes
                      /                \
            Is your domain        Is your domain
            similar to ImageNet?  similar to ImageNet?
              /        \            /        \
            Yes        No         Yes        No
             |          |          |          |
        Feature     Fine-tune   Fine-tune   Train from
        extraction  aggressively everything  scratch
        (freeze     (lower      (moderate   (or fine-tune
         all)       layers too)  LR)         with high LR)
```

### Domain Similarity Examples

| Your Task | Similar to ImageNet? | Recommendation |
|-----------|---------------------|----------------|
| Dog breed classification | Very similar | Feature extraction |
| Flower species | Similar | Feature extraction or fine-tune |
| Satellite imagery | Somewhat different | Fine-tune more layers |
| Medical X-rays | Very different | Fine-tune aggressively |
| Microscopy images | Very different | Fine-tune all layers |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Pre-trained models** | Trained on large datasets, encode useful features |
| **Feature extraction** | Freeze backbone, train new head only. Fast, works with tiny data |
| **Fine-tuning** | Unfreeze some/all layers, train with low LR. Better accuracy |
| **Gradual unfreezing** | Safest strategy: unfreeze top → bottom, one group at a time |
| **Discriminative LRs** | Lower LR for earlier layers, higher for later layers |
| **When to use** | Small dataset + similar domain = feature extraction; more data = fine-tune |

### Quick Reference

```
┌──────────────────────────────────────────────────────┐
│          Transfer Learning Checklist                  │
│                                                      │
│  1. Pick a pre-trained model (ResNet-50 is safe)      │
│  2. Replace the classification head                   │
│  3. Freeze everything, train head only (Phase 1)      │
│  4. Unfreeze top layers, use low LR (Phase 2)         │
│  5. Use ImageNet normalization for inputs             │
│  6. Add data augmentation for small datasets          │
│  7. Monitor val accuracy — stop when it plateaus      │
└──────────────────────────────────────────────────────┘
```

In the next lesson, you'll learn about **Convolutional Neural Networks (CNNs)** — the architecture that makes transfer learning on images so powerful.
