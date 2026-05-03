---
title: Image Classification
---

# Image Classification

Image classification is the **foundational task** in computer vision: given an image, assign it a label. It's the building block for more complex tasks like detection and segmentation.

---

## What Is Image Classification?

The goal is simple: **an entire image → one label** (or multiple labels).

```
Input: [Photo of a golden retriever]
Output: "golden_retriever" (confidence: 0.94)
```

### Single-Label vs Multi-Label

| Type | Description | Example |
|------|-------------|---------|
| Single-label | Exactly one class per image | "cat" or "dog" |
| Multi-label | Multiple classes per image | "beach", "sunset", "people" |

Single-label uses **softmax** (probabilities sum to 1).
Multi-label uses **sigmoid** per class (independent probabilities).

---

## Modern Architectures

### ResNet Family (2015)

Residual connections that skip layers, solving the vanishing gradient problem:

$$y = F(x) + x$$

| Variant | Parameters | Top-1 Acc (ImageNet) |
|---------|-----------|---------------------|
| ResNet-18 | 11.7M | 69.8% |
| ResNet-34 | 21.8M | 73.3% |
| ResNet-50 | 25.6M | 76.1% |
| ResNet-101 | 44.5M | 77.4% |
| ResNet-152 | 60.2M | 78.3% |

### EfficientNet (2019)

Scales **depth**, **width**, and **resolution** together using compound scaling:

$$\text{depth}: d = \alpha^\phi, \quad \text{width}: w = \beta^\phi, \quad \text{resolution}: r = \gamma^\phi$$

Subject to: $\alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$

Much better accuracy per parameter than ResNet.

### MobileNet (2017-2019)

Uses **depthwise separable convolutions** — splits a standard convolution into:
1. Depthwise: one filter per input channel
2. Pointwise: 1×1 convolution to combine

Reduces computation by ~8-9× while maintaining accuracy. Perfect for mobile apps.

### RegNet (2020)

Designed by **neural architecture search**. Simple, regular structure with predictable scaling behavior.

---

## Loading Pretrained Models

```python
from torchvision import models
from torchvision.models import (
    ResNet50_Weights,
    EfficientNet_B0_Weights,
    MobileNet_V3_Large_Weights
)

# ResNet-50
resnet = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)

# EfficientNet-B0
efficientnet = models.efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)

# MobileNet-V3
mobilenet = models.mobilenet_v3_large(weights=MobileNet_V3_Large_Weights.IMAGENET1K_V2)
```

---

## Training Pipeline

### Data Augmentation

```python
from torchvision import transforms

train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(
        brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1
    ),
    transforms.RandomRotation(15),
    transforms.RandAugment(num_ops=2, magnitude=9),  # AutoAugment alternative
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    transforms.RandomErasing(p=0.2),  # Cutout-style
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
```

### Loss Function

```python
import torch.nn as nn

# Single-label: CrossEntropyLoss (includes softmax internally)
criterion = nn.CrossEntropyLoss()

# With class weights for imbalanced data
class_weights = torch.tensor([1.0, 2.5, 1.0, 3.0, 1.5])
criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))

# Multi-label: BCEWithLogitsLoss (includes sigmoid internally)
criterion_multilabel = nn.BCEWithLogitsLoss()
```

### Optimizer Choice

```python
import torch.optim as optim

# AdamW: good default, handles weight decay correctly
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)

# SGD with momentum: can achieve better final accuracy
optimizer = optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=1e-4)
```

### Learning Rate Schedulers

```python
# Cosine annealing: smooth decay to near zero
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)

# OneCycleLR: warmup + cosine decay (often best results)
scheduler = optim.lr_scheduler.OneCycleLR(
    optimizer,
    max_lr=0.01,
    epochs=num_epochs,
    steps_per_epoch=len(train_loader)
)
```

### Mixed Precision Training

Speeds up training 2-3× on modern GPUs with minimal accuracy loss:

```python
from torch.cuda.amp import GradScaler, autocast

scaler = GradScaler()

for images, labels in train_loader:
    images, labels = images.to(device), labels.to(device)

    optimizer.zero_grad()

    # Forward pass in float16
    with autocast():
        outputs = model(images)
        loss = criterion(outputs, labels)

    # Backward pass with gradient scaling
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

---

## Evaluation Metrics

### Accuracy

```python
def compute_accuracy(model, loader, device):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return 100.0 * correct / total
```

### Top-5 Accuracy

```python
def top_k_accuracy(output, target, k=5):
    """Check if true label is in the top-k predictions."""
    _, pred = output.topk(k, dim=1)
    correct = pred.eq(target.view(-1, 1).expand_as(pred))
    return correct.any(dim=1).float().mean().item() * 100
```

### Per-Class Metrics

```python
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

all_preds = []
all_labels = []

model.eval()
with torch.no_grad():
    for images, labels in val_loader:
        outputs = model(images.to(device))
        _, predicted = outputs.max(1)
        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.numpy())

# Precision, Recall, F1 per class
print(classification_report(all_labels, all_preds, target_names=class_names))

# Confusion matrix
cm = confusion_matrix(all_labels, all_preds)
print(cm)
```

---

## Inference Pipeline

### Single Image Prediction

```python
from PIL import Image
import torch

def predict_image(model, image_path, transform, class_names, device):
    """Predict class for a single image."""
    model.eval()

    # Load and preprocess
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)  # Add batch dim

    # Predict
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.softmax(output, dim=1)
        confidence, predicted_idx = probabilities.max(1)

    predicted_class = class_names[predicted_idx.item()]
    confidence_pct = confidence.item() * 100

    return predicted_class, confidence_pct

# Usage
label, conf = predict_image(model, "cat.jpg", val_transform, class_names, device)
print(f"Prediction: {label} ({conf:.1f}%)")
```

### Batch Inference

```python
def predict_batch(model, image_paths, transform, class_names, device):
    """Predict classes for multiple images efficiently."""
    model.eval()

    # Stack all images into a batch
    batch = torch.stack([
        transform(Image.open(p).convert("RGB"))
        for p in image_paths
    ]).to(device)

    with torch.no_grad():
        outputs = model(batch)
        probs = torch.softmax(outputs, dim=1)
        confidences, indices = probs.max(1)

    results = [
        (class_names[idx.item()], conf.item() * 100)
        for idx, conf in zip(indices, confidences)
    ]
    return results
```

---

## Grad-CAM: Visualize What the Model Sees

Grad-CAM highlights which regions influenced the model's decision.

$$L_{Grad-CAM}^c = \text{ReLU}\left(\sum_k \alpha_k^c \cdot A^k\right)$$

where $\alpha_k^c = \frac{1}{Z}\sum_i\sum_j \frac{\partial y^c}{\partial A^k_{ij}}$

```python
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt


class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Register hooks
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, target_class=None):
        self.model.eval()
        output = self.model(input_tensor)

        if target_class is None:
            target_class = output.argmax(dim=1).item()

        # Backward pass for the target class
        self.model.zero_grad()
        output[0, target_class].backward()

        # Compute weights: global average pool of gradients
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)

        # Weighted combination of activation maps
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)  # Only positive contributions

        # Normalize to [0, 1]
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)

        # Resize to input size
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)
        return cam.squeeze().cpu().numpy()


# Usage
grad_cam = GradCAM(model, model.layer4[-1])  # Last conv block

image = Image.open("test_image.jpg").convert("RGB")
input_tensor = val_transform(image).unsqueeze(0).to(device)

heatmap = grad_cam.generate(input_tensor)

# Overlay on image
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.imshow(image)
plt.title("Original")
plt.subplot(1, 2, 2)
plt.imshow(image)
plt.imshow(heatmap, alpha=0.5, cmap="jet")
plt.title("Grad-CAM")
plt.show()
```

---

## Handling Class Imbalance

When some classes have far fewer samples:

```python
# Option 1: Weighted loss
from collections import Counter

class_counts = Counter(train_dataset.targets)
total = sum(class_counts.values())
weights = torch.tensor([total / class_counts[i] for i in range(NUM_CLASSES)])
weights = weights / weights.sum() * NUM_CLASSES  # Normalize
criterion = nn.CrossEntropyLoss(weight=weights.to(device))

# Option 2: Weighted random sampler (oversample minority classes)
from torch.utils.data import WeightedRandomSampler

sample_weights = [1.0 / class_counts[label] for label in train_dataset.targets]
sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights))
train_loader = DataLoader(train_dataset, batch_size=32, sampler=sampler)
```

---

## Test-Time Augmentation (TTA)

Run inference multiple times with different augmentations and average predictions:

```python
def predict_with_tta(model, image, transform, device, num_augments=5):
    """Average predictions over multiple augmented versions."""
    model.eval()
    predictions = []

    for _ in range(num_augments):
        input_tensor = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            output = model(input_tensor)
            probs = torch.softmax(output, dim=1)
            predictions.append(probs)

    # Average all predictions
    avg_probs = torch.stack(predictions).mean(dim=0)
    confidence, predicted = avg_probs.max(1)
    return predicted.item(), confidence.item()
```

---

## Best Practices Checklist

| Practice | Details |
|----------|---------|
| Start with transfer learning | Don't train from scratch unless you have millions of images |
| Use strong augmentation | RandAugment, CutMix, MixUp |
| Warm up learning rate | Avoid large initial updates |
| Use mixed precision | Free speed boost on modern GPUs |
| Monitor overfitting | Track val loss, use early stopping |
| Label smoothing | `CrossEntropyLoss(label_smoothing=0.1)` |
| Ensemble for production | Average 3-5 models for best accuracy |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Classification | Assign label(s) to entire image |
| ResNet | Skip connections, most popular backbone |
| EfficientNet | Best accuracy/efficiency ratio |
| MobileNet | Designed for mobile devices |
| Grad-CAM | Visualize model attention |
| TTA | Boost accuracy at inference time |
| Class imbalance | Use weighted loss or oversampling |

Image classification is where most CV projects start. Master it, and detection/segmentation become natural extensions.
