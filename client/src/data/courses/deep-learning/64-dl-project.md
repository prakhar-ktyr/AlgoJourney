---
title: End-to-End Deep Learning Project
---

# End-to-End Deep Learning Project

Let's put everything together! In this lesson, we build a complete image classification project from scratch — following professional best practices.

---

## Project Structure

A well-organized DL project looks like this:

```
cifar10-classifier/
├── config.yaml          # Hyperparameters and settings
├── train.py             # Training script
├── evaluate.py          # Evaluation and metrics
├── predict.py           # Single-image prediction
├── serve.py             # FastAPI deployment
├── requirements.txt     # Dependencies
├── data/
│   └── (auto-downloaded)
├── models/
│   └── best_model.pth
├── utils/
│   ├── __init__.py
│   ├── dataset.py       # Data loading and augmentation
│   ├── model.py         # Model architecture
│   └── training.py      # Training utilities
└── logs/
    └── tensorboard/
```

---

## Step 1: Configuration

Keep hyperparameters in one place for easy experimentation:

```python
# config.py
from dataclasses import dataclass

@dataclass
class Config:
    # Data
    dataset: str = "cifar10"
    image_size: int = 32
    num_classes: int = 10
    batch_size: int = 128
    num_workers: int = 4

    # Model
    model_name: str = "resnet18"
    pretrained: bool = True
    freeze_backbone: bool = False

    # Training
    epochs: int = 50
    learning_rate: float = 0.001
    weight_decay: float = 1e-4
    scheduler: str = "cosine"  # "cosine" or "step"
    warmup_epochs: int = 5

    # Mixed precision
    use_amp: bool = True

    # Early stopping
    patience: int = 10

    # Paths
    checkpoint_dir: str = "models/"
    log_dir: str = "logs/tensorboard/"

    # Reproducibility
    seed: int = 42
```

---

## Step 2: Data Loading and Augmentation

```python
# utils/dataset.py
import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms

def get_transforms(train=True, image_size=32):
    """Get data augmentation transforms."""
    if train:
        return transforms.Compose([
            transforms.RandomCrop(image_size, padding=4),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(brightness=0.2, contrast=0.2,
                                   saturation=0.2),
            transforms.RandomRotation(15),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.4914, 0.4822, 0.4465],
                std=[0.2470, 0.2435, 0.2616]
            ),
            transforms.RandomErasing(p=0.1),
        ])
    else:
        return transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.4914, 0.4822, 0.4465],
                std=[0.2470, 0.2435, 0.2616]
            ),
        ])

def get_dataloaders(config):
    """Create train, validation, and test data loaders."""
    train_transform = get_transforms(train=True, image_size=config.image_size)
    test_transform = get_transforms(train=False, image_size=config.image_size)

    # Download CIFAR-10
    full_train = datasets.CIFAR10(
        root="data/", train=True, download=True, transform=train_transform
    )
    test_set = datasets.CIFAR10(
        root="data/", train=False, download=True, transform=test_transform
    )

    # Split train into train + validation (90/10)
    train_size = int(0.9 * len(full_train))
    val_size = len(full_train) - train_size
    train_set, val_set = random_split(
        full_train, [train_size, val_size],
        generator=torch.Generator().manual_seed(config.seed)
    )

    # Override transform for validation set (no augmentation)
    val_set.dataset.transform = test_transform

    train_loader = DataLoader(
        train_set, batch_size=config.batch_size,
        shuffle=True, num_workers=config.num_workers,
        pin_memory=True, drop_last=True
    )
    val_loader = DataLoader(
        val_set, batch_size=config.batch_size,
        shuffle=False, num_workers=config.num_workers,
        pin_memory=True
    )
    test_loader = DataLoader(
        test_set, batch_size=config.batch_size,
        shuffle=False, num_workers=config.num_workers,
        pin_memory=True
    )

    return train_loader, val_loader, test_loader
```

---

## Step 3: Model Architecture

Using transfer learning with a pretrained ResNet-18:

```python
# utils/model.py
import torch
import torch.nn as nn
from torchvision import models

def build_model(config):
    """Build model with transfer learning."""
    if config.model_name == "resnet18":
        # Load pretrained ResNet-18
        weights = models.ResNet18_Weights.DEFAULT if config.pretrained else None
        model = models.resnet18(weights=weights)

        # Optionally freeze backbone
        if config.freeze_backbone:
            for param in model.parameters():
                param.requires_grad = False

        # Replace final classifier for our number of classes
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, config.num_classes)
        )

    elif config.model_name == "custom_cnn":
        model = CustomCNN(config.num_classes)

    else:
        raise ValueError(f"Unknown model: {config.model_name}")

    return model

class CustomCNN(nn.Module):
    """Custom CNN for CIFAR-10 (if not using transfer learning)."""
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1: 32x32 -> 16x16
            nn.Conv2d(3, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.1),

            # Block 2: 16x16 -> 8x8
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.2),

            # Block 3: 8x8 -> 4x4
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.3),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)
```

---

## Step 4: Training Pipeline

```python
# train.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torch.utils.tensorboard import SummaryWriter
import time
import os

from config import Config
from utils.dataset import get_dataloaders
from utils.model import build_model

def set_seed(seed):
    """Set all random seeds for reproducibility."""
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

def get_optimizer(model, config):
    """Create optimizer with different LR for backbone vs head."""
    if config.freeze_backbone:
        params = model.fc.parameters()
    else:
        # Higher LR for new head, lower for pretrained backbone
        params = [
            {"params": model.fc.parameters(), "lr": config.learning_rate},
            {"params": [p for n, p in model.named_parameters()
                       if "fc" not in n and p.requires_grad],
             "lr": config.learning_rate * 0.1},
        ]
    return optim.AdamW(params, lr=config.learning_rate,
                       weight_decay=config.weight_decay)

def get_scheduler(optimizer, config, steps_per_epoch):
    """Create learning rate scheduler."""
    if config.scheduler == "cosine":
        return optim.lr_scheduler.CosineAnnealingLR(
            optimizer, T_max=config.epochs * steps_per_epoch
        )
    elif config.scheduler == "step":
        return optim.lr_scheduler.StepLR(optimizer, step_size=15, gamma=0.1)

def train_one_epoch(model, loader, criterion, optimizer, scheduler,
                    scaler, device, epoch):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (inputs, targets) in enumerate(loader):
        inputs, targets = inputs.to(device), targets.to(device)

        optimizer.zero_grad()

        # Mixed precision forward pass
        with autocast():
            outputs = model(inputs)
            loss = criterion(outputs, targets)

        # Scaled backward pass
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        if scheduler is not None:
            scheduler.step()

        # Track metrics
        running_loss += loss.item() * inputs.size(0)
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc

@torch.no_grad()
def validate(model, loader, criterion, device):
    """Evaluate model on validation set."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for inputs, targets in loader:
        inputs, targets = inputs.to(device), targets.to(device)

        with autocast():
            outputs = model(inputs)
            loss = criterion(outputs, targets)

        running_loss += loss.item() * inputs.size(0)
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

    return running_loss / total, correct / total

def main():
    config = Config()
    set_seed(config.seed)

    # Setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data
    train_loader, val_loader, test_loader = get_dataloaders(config)
    print(f"Train: {len(train_loader.dataset)}, Val: {len(val_loader.dataset)}, "
          f"Test: {len(test_loader.dataset)}")

    # Model
    model = build_model(config).to(device)
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Trainable parameters: {total_params:,}")

    # Training components
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = get_optimizer(model, config)
    scheduler = get_scheduler(optimizer, config, len(train_loader))
    scaler = GradScaler() if config.use_amp else None

    # Logging
    writer = SummaryWriter(config.log_dir)
    os.makedirs(config.checkpoint_dir, exist_ok=True)

    # Training loop with early stopping
    best_val_acc = 0.0
    patience_counter = 0

    for epoch in range(config.epochs):
        start = time.time()

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, scheduler,
            scaler, device, epoch
        )
        val_loss, val_acc = validate(model, val_loader, criterion, device)

        elapsed = time.time() - start

        # Logging
        print(f"Epoch {epoch+1}/{config.epochs} ({elapsed:.1f}s) | "
              f"Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}")

        writer.add_scalars("Loss", {"train": train_loss, "val": val_loss}, epoch)
        writer.add_scalars("Accuracy", {"train": train_acc, "val": val_acc}, epoch)
        writer.add_scalar("LR", optimizer.param_groups[0]["lr"], epoch)

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "config": config,
            }, f"{config.checkpoint_dir}/best_model.pth")
            print(f"  → Saved best model (val_acc: {val_acc:.4f})")
        else:
            patience_counter += 1

        # Early stopping
        if patience_counter >= config.patience:
            print(f"Early stopping at epoch {epoch+1}")
            break

    writer.close()

    # Final evaluation on test set
    checkpoint = torch.load(f"{config.checkpoint_dir}/best_model.pth")
    model.load_state_dict(checkpoint["model_state_dict"])
    test_loss, test_acc = validate(model, test_loader, criterion, device)
    print(f"\nTest Accuracy: {test_acc:.4f}")

if __name__ == "__main__":
    main()
```

---

## Step 5: Evaluation

```python
# evaluate.py
import torch
import numpy as np
from sklearn.metrics import (
    classification_report, confusion_matrix, f1_score
)
import matplotlib.pyplot as plt
import seaborn as sns

CIFAR10_CLASSES = [
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck"
]

@torch.no_grad()
def get_predictions(model, loader, device):
    """Get all predictions and true labels."""
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []

    for inputs, labels in loader:
        inputs = inputs.to(device)
        outputs = model(inputs)
        probs = torch.softmax(outputs, dim=1)

        all_preds.append(outputs.argmax(dim=1).cpu())
        all_labels.append(labels)
        all_probs.append(probs.cpu())

    return (torch.cat(all_preds).numpy(),
            torch.cat(all_labels).numpy(),
            torch.cat(all_probs).numpy())

def evaluate_model(model, test_loader, device):
    """Complete model evaluation."""
    preds, labels, probs = get_predictions(model, test_loader, device)

    # Classification report
    print("\n" + "=" * 60)
    print("CLASSIFICATION REPORT")
    print("=" * 60)
    print(classification_report(labels, preds, target_names=CIFAR10_CLASSES))

    # Overall metrics
    f1 = f1_score(labels, preds, average="weighted")
    accuracy = (preds == labels).mean()
    print(f"Overall Accuracy: {accuracy:.4f}")
    print(f"Weighted F1 Score: {f1:.4f}")

    # Confusion matrix
    cm = confusion_matrix(labels, preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=CIFAR10_CLASSES,
                yticklabels=CIFAR10_CLASSES)
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150)
    print("Saved confusion_matrix.png")

    # Per-class accuracy
    print("\nPer-Class Accuracy:")
    for i, class_name in enumerate(CIFAR10_CLASSES):
        mask = labels == i
        class_acc = (preds[mask] == labels[mask]).mean()
        print(f"  {class_name:>12}: {class_acc:.4f} ({mask.sum()} samples)")

    return accuracy, f1
```

---

## Step 6: TensorBoard Integration

```python
# Already integrated in train.py — launch with:
# tensorboard --logdir logs/tensorboard/

# Additional logging you can add:
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter("logs/tensorboard/")

# Log model graph
dummy_input = torch.randn(1, 3, 32, 32).to(device)
writer.add_graph(model, dummy_input)

# Log sample predictions
def log_predictions(writer, model, loader, device, epoch):
    model.eval()
    images, labels = next(iter(loader))
    images = images[:16].to(device)
    preds = model(images).argmax(dim=1)

    # Create image grid with predictions
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    for i, ax in enumerate(axes.flat):
        img = images[i].cpu().permute(1, 2, 0).numpy()
        img = img * np.array([0.247, 0.243, 0.261]) + np.array([0.491, 0.482, 0.446])
        ax.imshow(img.clip(0, 1))
        color = "green" if preds[i] == labels[i] else "red"
        ax.set_title(f"{CIFAR10_CLASSES[preds[i]]}", color=color)
        ax.axis("off")

    writer.add_figure("predictions", fig, epoch)
```

---

## Step 7: Model Optimization for Deployment

```python
# Quantization for faster inference
import torch.quantization

def quantize_model(model):
    """Apply dynamic quantization for CPU deployment."""
    quantized = torch.quantization.quantize_dynamic(
        model.cpu(),
        {torch.nn.Linear},  # Layers to quantize
        dtype=torch.qint8
    )

    # Compare sizes
    original_size = sum(p.numel() * p.element_size() for p in model.parameters())
    quantized_size = sum(p.numel() * p.element_size() for p in quantized.parameters())
    print(f"Original: {original_size / 1e6:.1f} MB")
    print(f"Quantized: {quantized_size / 1e6:.1f} MB")
    print(f"Reduction: {(1 - quantized_size / original_size) * 100:.1f}%")

    return quantized
```

---

## Step 8: Deployment

```python
# serve.py — FastAPI endpoint for production
import torch
from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
from torchvision import transforms

app = FastAPI(title="CIFAR-10 Classifier")

# Load model once at startup
device = torch.device("cpu")
checkpoint = torch.load("models/best_model.pth", map_location=device)
model = build_model(checkpoint["config"])
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

transform = transforms.Compose([
    transforms.Resize((32, 32)),
    transforms.ToTensor(),
    transforms.Normalize([0.4914, 0.4822, 0.4465], [0.2470, 0.2435, 0.2616])
])

CLASSES = ["airplane", "automobile", "bird", "cat", "deer",
           "dog", "frog", "horse", "ship", "truck"]

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)

    top5 = torch.topk(probs, 5)
    results = [
        {"class": CLASSES[idx], "confidence": f"{conf:.4f}"}
        for conf, idx in zip(top5.values[0], top5.indices[0])
    ]
    return {"predictions": results}
```

---

## Best Practices Checklist

| Category | Practice | Done? |
|----------|----------|-------|
| Data | Use proper train/val/test split | ☐ |
| Data | Apply augmentation to training only | ☐ |
| Model | Start with pretrained model | ☐ |
| Training | Use learning rate scheduler | ☐ |
| Training | Enable mixed precision (AMP) | ☐ |
| Training | Implement early stopping | ☐ |
| Evaluation | Report multiple metrics | ☐ |
| Evaluation | Check per-class performance | ☐ |
| Deployment | Quantize for production | ☐ |
| Deployment | Add health checks | ☐ |
| Code | Set random seeds | ☐ |
| Code | Log experiments (TensorBoard) | ☐ |

---

## Common Mistakes to Avoid

1. **Forgetting `model.eval()`** — BatchNorm and Dropout behave differently
2. **Data leakage** — Augmenting validation/test data
3. **Not normalizing** — Always match training normalization at inference
4. **Ignoring class imbalance** — Use weighted loss or oversampling
5. **Training too long** — Early stopping prevents overfitting
6. **Not saving checkpoints** — Always save the best model during training

---

## Next Lesson

In our final lesson, we'll provide a **Course Summary & Next Steps** — reviewing everything and charting your path forward in deep learning.
