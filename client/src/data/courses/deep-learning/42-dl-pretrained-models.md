---
title: Pre-trained Models & Fine-Tuning
---

# Pre-trained Models & Fine-Tuning

Training deep neural networks from scratch requires massive datasets and compute. **Pre-trained models** let you leverage knowledge learned on huge datasets and adapt it to your specific task — often with just hundreds of examples.

---

## The Pre-training Revolution

### Why Pre-training Works

Deep networks learn hierarchical features:
- **Early layers**: edges, textures, colors (generic)
- **Middle layers**: patterns, shapes, parts (semi-generic)
- **Later layers**: object-specific features (task-specific)

Early features are **transferable** across tasks. A model trained on ImageNet already knows what edges, textures, and shapes look like — you just need to teach it your specific classes.

### Key Pre-training Datasets

| Dataset | Size | Use |
|---------|------|-----|
| ImageNet-1k | 1.2M images, 1000 classes | Standard vision pre-training |
| ImageNet-21k | 14M images, 21k classes | Larger-scale pre-training |
| COCO | 330k images | Detection & segmentation |
| BookCorpus + Wikipedia | 3.3B words | BERT pre-training |
| WebText | 40GB text | GPT pre-training |

---

## torchvision.models: Built-in Pre-trained Models

PyTorch provides pre-trained models through `torchvision.models`:

```python
import torch
import torchvision.models as models
from torchvision.models import ResNet50_Weights, EfficientNet_B0_Weights

# Load pre-trained ResNet-50
resnet50 = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)

# Load pre-trained EfficientNet-B0
efficientnet = models.efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)

# Load pre-trained ViT-B/16
from torchvision.models import vit_b_16, ViT_B_16_Weights
vit = vit_b_16(weights=ViT_B_16_Weights.IMAGENET1K_V1)

# Check model architecture
print(resnet50)
```

### Available Model Families

```python
# List all available models
from torchvision.models import list_models
all_models = list_models()
print(f"Available models: {len(all_models)}")

# Filter by module
classification_models = list_models(module=torchvision.models)
```

| Family | Models | Best For |
|--------|--------|----------|
| ResNet | resnet18/34/50/101/152 | General baseline |
| EfficientNet | efficientnet_b0 to b7 | Efficiency |
| ViT | vit_b_16, vit_l_16 | Large-scale, accuracy |
| ConvNeXt | convnext_tiny/small/base | Modern CNN |
| MobileNet | mobilenet_v2/v3 | Mobile/edge |

---

## Hugging Face timm: Comprehensive Model Zoo

The `timm` library (PyTorch Image Models) provides **1000+** pre-trained models:

```python
import timm

# List available models
all_models = timm.list_models()
print(f"Total models: {len(all_models)}")

# Search for specific architectures
efficientnet_models = timm.list_models("efficientnet*")
vit_models = timm.list_models("vit_*")
swin_models = timm.list_models("swin_*")

# Load a pre-trained model
model = timm.create_model("efficientnet_b3", pretrained=True, num_classes=10)

# Load with custom input size
model = timm.create_model(
    "vit_base_patch16_224",
    pretrained=True,
    num_classes=100,
    img_size=384,  # Higher resolution
)

# Get model info
data_config = timm.data.resolve_model_data_config(model)
print(data_config)  # input_size, mean, std, interpolation
```

### Why timm?

- Uniform API across all architectures
- Pre-trained weights from multiple sources
- Easy to change number of classes
- Built-in data augmentation configs
- Supports custom input sizes

---

## Feature Extraction vs Fine-Tuning

Two main strategies for using pre-trained models:

### Feature Extraction (Frozen Backbone)

Use the pre-trained model as a **fixed feature extractor**. Only train a new classification head.

```python
import torch.nn as nn
import torchvision.models as models
from torchvision.models import ResNet50_Weights

# Load pre-trained model
model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)

# Freeze ALL parameters
for param in model.parameters():
    param.requires_grad = False

# Replace the classification head (only this trains)
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Linear(num_features, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, 10),  # 10 classes
)

# Only new head parameters will be updated
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"Trainable: {trainable:,} / {total:,} ({100*trainable/total:.1f}%)")
```

**When to use**: Small dataset, limited compute, classes similar to ImageNet.

### Fine-Tuning (Unfrozen Backbone)

Unfreeze some or all layers and train the entire model with a small learning rate.

```python
# Load pre-trained model
model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)

# Replace head for new task
model.fc = nn.Linear(model.fc.in_features, 10)

# All parameters trainable (use small LR for pre-trained layers)
optimizer = torch.optim.Adam([
    {"params": model.fc.parameters(), "lr": 1e-3},       # New head: higher LR
    {"params": model.layer4.parameters(), "lr": 1e-4},   # Late layers: medium LR
    {"params": model.layer3.parameters(), "lr": 1e-5},   # Earlier layers: low LR
])
```

**When to use**: Moderate dataset, task differs from pre-training, need higher accuracy.

---

## Fine-Tuning Strategies

### Strategy 1: Freeze All, Train Head

```python
# Simplest approach — fast, works with very little data
for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Linear(2048, num_classes)
```

### Strategy 2: Gradual Unfreezing

Start with frozen backbone, then unfreeze layers one by one:

```python
def unfreeze_layer(model, layer_name):
    """Unfreeze a specific layer for training."""
    for name, param in model.named_parameters():
        if layer_name in name:
            param.requires_grad = True

# Epoch 1-5: Train only head
# Epoch 6-10: Unfreeze layer4
unfreeze_layer(model, "layer4")
# Epoch 11-15: Unfreeze layer3
unfreeze_layer(model, "layer3")
```

### Strategy 3: Discriminative Learning Rates

Different learning rates for different depths — lower rates for early layers that shouldn't change much:

```python
def get_parameter_groups(model, base_lr=1e-4, lr_mult=0.1):
    """Assign decreasing LR to earlier layers."""
    param_groups = []

    # Backbone layers (low LR)
    backbone_params = []
    for name, param in model.named_parameters():
        if "fc" not in name and param.requires_grad:
            backbone_params.append(param)

    # Classification head (high LR)
    head_params = list(model.fc.parameters())

    param_groups = [
        {"params": backbone_params, "lr": base_lr * lr_mult},
        {"params": head_params, "lr": base_lr},
    ]
    return param_groups

optimizer = torch.optim.AdamW(get_parameter_groups(model))
```

### Strategy 4: Linear Probing → Fine-Tuning

Two-phase training:

```python
# Phase 1: Linear probing (1-5 epochs)
for param in model.parameters():
    param.requires_grad = False
model.fc = nn.Linear(2048, num_classes)
# Train for a few epochs...

# Phase 2: Full fine-tuning (10-20 epochs, small LR)
for param in model.parameters():
    param.requires_grad = True
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-5)
# Continue training...
```

---

## Saving and Loading Models

### Save Entire Model

```python
# Save
torch.save(model, "model_complete.pth")

# Load
model = torch.load("model_complete.pth")
model.eval()
```

### Save Only State Dict (Recommended)

```python
# Save state dict (architecture-independent)
torch.save(model.state_dict(), "model_weights.pth")

# Load state dict
model = models.resnet50(num_classes=10)  # Create architecture
model.load_state_dict(torch.load("model_weights.pth"))
model.eval()
```

### Save Checkpoint (For Resuming Training)

```python
# Save checkpoint
checkpoint = {
    "epoch": epoch,
    "model_state_dict": model.state_dict(),
    "optimizer_state_dict": optimizer.state_dict(),
    "loss": loss,
    "best_acc": best_acc,
}
torch.save(checkpoint, "checkpoint.pth")

# Load checkpoint
checkpoint = torch.load("checkpoint.pth")
model.load_state_dict(checkpoint["model_state_dict"])
optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
start_epoch = checkpoint["epoch"] + 1
```

---

## Model Selection: Accuracy vs Speed vs Size

| Model | Params | Top-1 Acc | Inference (ms) | Use Case |
|-------|--------|-----------|----------------|----------|
| MobileNetV3-S | 2.5M | 67.7% | 2.5 | Mobile apps |
| EfficientNet-B0 | 5.3M | 77.7% | 4.5 | Edge devices |
| ResNet-50 | 25.6M | 80.9% | 8.0 | General baseline |
| EfficientNet-B4 | 19M | 83.4% | 15.0 | Good balance |
| ConvNeXt-Base | 89M | 85.8% | 20.0 | High accuracy |
| ViT-L/16 | 304M | 88.1% | 50.0 | Maximum accuracy |

### Decision Guide

```
Need real-time on mobile?  → MobileNetV3 or EfficientNet-B0
Need good accuracy, moderate compute?  → ResNet-50 or EfficientNet-B3
Need best accuracy, have GPU?  → ViT-L or ConvNeXt-Large
Few training samples?  → Larger pre-trained model + feature extraction
```

---

## Complete Example: Fine-Tune for Custom Classification

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import EfficientNet_B0_Weights

# --- Data Preparation ---
weights = EfficientNet_B0_Weights.IMAGENET1K_V1
preprocess = weights.transforms()  # Use model's recommended transforms

train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load dataset (example: Flowers102, CIFAR-10, or custom ImageFolder)
train_dataset = datasets.FakeData(size=1000, image_size=(3, 224, 224), transform=train_transform)
val_dataset = datasets.FakeData(size=200, image_size=(3, 224, 224), transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=4)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=4)

# --- Model Setup ---
NUM_CLASSES = 10

model = models.efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)

# Freeze backbone initially
for param in model.parameters():
    param.requires_grad = False

# Replace classifier
model.classifier = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(model.classifier[1].in_features, NUM_CLASSES),
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# --- Phase 1: Train Head Only ---
optimizer = torch.optim.Adam(model.classifier.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=5)


def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss, correct, total = 0, 0, 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += images.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)

        total_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += images.size(0)

    return total_loss / total, correct / total


# Phase 1: Head only (5 epochs)
print("Phase 1: Training classification head...")
for epoch in range(5):
    train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion, device)
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()
    print(f"Epoch {epoch+1}: train_acc={train_acc:.3f}, val_acc={val_acc:.3f}")

# --- Phase 2: Fine-tune All Layers ---
print("\nPhase 2: Fine-tuning all layers...")
for param in model.parameters():
    param.requires_grad = True

optimizer = torch.optim.AdamW([
    {"params": model.features.parameters(), "lr": 1e-5},
    {"params": model.classifier.parameters(), "lr": 1e-4},
], weight_decay=0.01)

scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

best_acc = 0
for epoch in range(10):
    train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion, device)
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), "best_model.pth")

    print(f"Epoch {epoch+1}: train_acc={train_acc:.3f}, val_acc={val_acc:.3f}")

print(f"\nBest validation accuracy: {best_acc:.3f}")
```

---

## Tips for Successful Fine-Tuning

1. **Always start with feature extraction** — verify the head trains before unfreezing
2. **Use the model's recommended preprocessing** (normalization stats from pre-training)
3. **Lower learning rates for pre-trained layers** (10x–100x smaller than head)
4. **Use weight decay** (0.01–0.1) to prevent overfitting
5. **Data augmentation is critical** with small datasets
6. **Early stopping** — monitor validation loss, stop when it increases
7. **Larger pre-trained models generalize better** even with few samples

---

## Summary

- **Pre-trained models** save time, compute, and data by reusing learned features
- **torchvision** provides standard models; **timm** has 1000+ architectures
- **Feature extraction**: freeze backbone, train head only (fastest, least data needed)
- **Fine-tuning**: unfreeze and train with small LR (better accuracy)
- **Discriminative LRs** and **gradual unfreezing** improve fine-tuning stability
- Always save checkpoints and use the model's recommended transforms
