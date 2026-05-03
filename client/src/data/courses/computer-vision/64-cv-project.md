---
title: End-to-End CV Project
---

# End-to-End Computer Vision Project

Let's build a **complete image classification project** from scratch — from data to deployment. This lesson puts together everything you've learned.

---

## Project Structure

```
cv_project/
├── data/               # raw/, processed/, splits/
├── configs/            # experiment.yaml
├── models/             # classifier.py
├── utils/              # dataset.py, transforms.py, metrics.py
├── train.py            # Training script
├── evaluate.py         # Evaluation script
├── export.py           # ONNX export
├── serve.py            # FastAPI server
├── Dockerfile
└── requirements.txt
```

---

## Step 1: Problem Definition & Dataset

### Define the Problem

We'll build a **flower classifier** (5 classes): daisy, dandelion, roses, sunflowers, tulips.

### Dataset Analysis

```python
from pathlib import Path
from collections import Counter
import numpy as np
from PIL import Image


def analyze_dataset(data_dir):
    """Analyze dataset: class distribution, image statistics."""
    data_path = Path(data_dir)
    class_counts = Counter()

    for class_dir in sorted(data_path.iterdir()):
        if not class_dir.is_dir():
            continue
        images = list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.png"))
        class_counts[class_dir.name] = len(images)

    print(f"Total: {sum(class_counts.values())} images, {len(class_counts)} classes")
    for cls, count in sorted(class_counts.items()):
        print(f"  {cls:15s}: {count:5d}")
    return class_counts

# analyze_dataset("data/raw/flowers")
```

---

## Step 2: Data Pipeline

### Custom Dataset with Augmentations

```python
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from pathlib import Path
import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np
from PIL import Image


class FlowerDataset(Dataset):
    """Custom dataset for flower classification."""

    def __init__(self, root_dir, transform=None):
        self.transform = transform
        self.samples = []
        self.class_to_idx = {}

        root = Path(root_dir)
        classes = sorted(d.name for d in root.iterdir() if d.is_dir())
        self.class_to_idx = {cls: i for i, cls in enumerate(classes)}

        for cls in classes:
            for img_path in (root / cls).glob("*"):
                if img_path.suffix.lower() in (".jpg", ".jpeg", ".png"):
                    self.samples.append((str(img_path), self.class_to_idx[cls]))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = np.array(Image.open(img_path).convert("RGB"))
        if self.transform:
            image = self.transform(image=image)["image"]
        return image, label


# Augmentations
train_transform = A.Compose([
    A.RandomResizedCrop(height=224, width=224, scale=(0.8, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.5),
    A.CoarseDropout(max_holes=8, max_height=20, max_width=20, p=0.3),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

val_transform = A.Compose([
    A.Resize(256, 256),
    A.CenterCrop(224, 224),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])


def create_dataloaders(data_dir, batch_size=32, num_workers=4):
    """Create train/val/test dataloaders with 70/15/15 split."""
    full_dataset = FlowerDataset(data_dir, transform=train_transform)
    total = len(full_dataset)
    train_size = int(0.7 * total)
    val_size = int(0.15 * total)
    test_size = total - train_size - val_size

    train_set, val_set, test_set = random_split(
        full_dataset, [train_size, val_size, test_size],
        generator=torch.Generator().manual_seed(42),
    )
    val_set.dataset.transform = val_transform

    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_set, batch_size=batch_size, num_workers=num_workers)
    test_loader = DataLoader(test_set, batch_size=batch_size, num_workers=num_workers)
    return train_loader, val_loader, test_loader
```

---

## Step 3: Model Selection

### Transfer Learning with ResNet-50

```python
import torch
import torch.nn as nn
from torchvision import models


class FlowerClassifier(nn.Module):
    """ResNet-50 based flower classifier with transfer learning."""

    def __init__(self, num_classes=5, pretrained=True):
        super().__init__()
        weights = models.ResNet50_Weights.DEFAULT if pretrained else None
        self.backbone = models.resnet50(weights=weights)

        # Freeze early layers
        for param in list(self.backbone.parameters())[:-20]:
            param.requires_grad = False

        # Replace classifier head
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        return self.backbone(x)


model = FlowerClassifier(num_classes=5, pretrained=True)
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"Trainable: {trainable:,} / {total:,} parameters")
```

---

## Step 4: Training

### Full Training Script

```python
import torch
import torch.nn as nn
from torch.cuda.amp import GradScaler, autocast


class Trainer:
    """Complete training pipeline with best practices."""

    def __init__(self, model, train_loader, val_loader, config):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

        self.criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
        self.optimizer = torch.optim.AdamW(
            model.parameters(), lr=config["learning_rate"],
            weight_decay=config["weight_decay"],
        )
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer, T_max=config["epochs"]
        )
        self.scaler = GradScaler()
        self.best_val_acc = 0.0
        self.patience_counter = 0

    def train_epoch(self):
        self.model.train()
        total_loss, correct, total = 0.0, 0, 0
        for images, labels in self.train_loader:
            images, labels = images.to(self.device), labels.to(self.device)
            with autocast():
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
            self.optimizer.zero_grad()
            self.scaler.scale(loss).backward()
            self.scaler.step(self.optimizer)
            self.scaler.update()
            total_loss += loss.item() * images.size(0)
            correct += outputs.argmax(1).eq(labels).sum().item()
            total += labels.size(0)
        return total_loss / total, correct / total

    @torch.no_grad()
    def validate(self):
        self.model.eval()
        total_loss, correct, total = 0.0, 0, 0
        for images, labels in self.val_loader:
            images, labels = images.to(self.device), labels.to(self.device)
            outputs = self.model(images)
            loss = self.criterion(outputs, labels)
            total_loss += loss.item() * images.size(0)
            correct += outputs.argmax(1).eq(labels).sum().item()
            total += labels.size(0)
        return total_loss / total, correct / total

    def train(self):
        for epoch in range(self.config["epochs"]):
            train_loss, train_acc = self.train_epoch()
            val_loss, val_acc = self.validate()
            self.scheduler.step()

            print(f"Epoch {epoch+1:3d} | "
                  f"Train: {train_loss:.4f}/{train_acc:.4f} | "
                  f"Val: {val_loss:.4f}/{val_acc:.4f}")

            if val_acc > self.best_val_acc:
                self.best_val_acc = val_acc
                self.patience_counter = 0
                torch.save(self.model.state_dict(), "models/best_model.pth")
                print(f"  ✓ Saved best (val_acc={val_acc:.4f})")
            else:
                self.patience_counter += 1

            if self.patience_counter >= self.config["patience"]:
                print(f"\nEarly stopping at epoch {epoch+1}")
                break
        return self.best_val_acc


config = {
    "learning_rate": 1e-3,
    "weight_decay": 1e-4,
    "epochs": 50,
    "batch_size": 32,
    "patience": 10,
}
# trainer = Trainer(model, train_loader, val_loader, config)
# best_acc = trainer.train()
```

---

## Step 5: Evaluation

### Comprehensive Model Evaluation

```python
import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix


@torch.no_grad()
def evaluate_model(model, test_loader, class_names, device="cpu"):
    """Full evaluation with classification report and confusion matrix."""
    model.eval()
    model.to(device)
    all_preds, all_labels = [], []

    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        all_preds.extend(outputs.argmax(1).cpu().numpy())
        all_labels.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    # Classification report
    print(classification_report(all_labels, all_preds,
                                target_names=class_names, digits=4))

    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    accuracy = (all_preds == all_labels).mean()
    print(f"Overall Accuracy: {accuracy:.4f}")
    return {"accuracy": accuracy, "confusion_matrix": cm}

# class_names = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]
# evaluate_model(model, test_loader, class_names)
```

### Grad-CAM Visualization

```python
import torch
import torch.nn.functional as F


class GradCAM:
    """Grad-CAM: visualize what the model looks at."""

    def __init__(self, model, target_layer):
        self.model = model
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(
            lambda m, i, o: setattr(self, "activations", o.detach()))
        target_layer.register_full_backward_hook(
            lambda m, gi, go: setattr(self, "gradients", go[0].detach()))

    def generate(self, input_tensor, target_class=None):
        """Generate Grad-CAM heatmap."""
        self.model.eval()
        output = self.model(input_tensor)
        if target_class is None:
            target_class = output.argmax(dim=1).item()

        self.model.zero_grad()
        output[0, target_class].backward()

        weights = self.gradients.mean(dim=[2, 3], keepdim=True)
        cam = F.relu((weights * self.activations).sum(dim=1, keepdim=True))
        cam = cam / (cam.max() + 1e-8)
        cam = F.interpolate(cam, size=input_tensor.shape[2:], mode="bilinear")
        return cam.squeeze().numpy()

# grad_cam = GradCAM(model, model.backbone.layer4[-1])
# heatmap = grad_cam.generate(input_tensor)
```

---

## Step 6: Model Optimization & Export

### Export to ONNX

```python
import torch
import numpy as np


def export_to_onnx(model, output_path="models/flower_classifier.onnx"):
    """Export trained model to ONNX format."""
    model.eval()
    model.cpu()
    dummy_input = torch.randn(1, 3, 224, 224)

    torch.onnx.export(
        model, dummy_input, output_path,
        input_names=["image"], output_names=["predictions"],
        dynamic_axes={"image": {0: "batch_size"}, "predictions": {0: "batch_size"}},
        opset_version=17,
    )
    print(f"Model exported to {output_path}")

    # Verify
    import onnxruntime as ort
    session = ort.InferenceSession(output_path)
    onnx_out = session.run(None, {"image": dummy_input.numpy()})[0]
    with torch.no_grad():
        torch_out = model(dummy_input).numpy()
    max_diff = np.abs(torch_out - onnx_out).max()
    print(f"Max diff (PyTorch vs ONNX): {max_diff:.6f} ✓")

# export_to_onnx(model)
```

---

## Step 7: Deployment

### FastAPI Server

```python
import io
import time
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from torchvision import transforms

app = FastAPI(title="Flower Classifier API", version="1.0.0")
session = ort.InferenceSession("models/flower_classifier.onnx")
CLASS_NAMES = ["daisy", "dandelion", "roses", "sunflowers", "tulips"]

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Classify a flower image."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    start = time.time()
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = preprocess(image).unsqueeze(0).numpy()

    output = session.run(None, {"image": input_tensor})[0]
    probs = np.exp(output) / np.exp(output).sum()

    top_idx = probs[0].argsort()[-3:][::-1]
    predictions = [
        {"class": CLASS_NAMES[i], "confidence": round(float(probs[0][i]), 4)}
        for i in top_idx
    ]
    return {"predictions": predictions, "latency_ms": round((time.time() - start) * 1000, 1)}


@app.get("/health")
async def health():
    return {"status": "ok", "model": "flower_classifier_v1"}
```

Deploy with Docker: use `python:3.11-slim` base, install ONNX Runtime, copy model and `serve.py`, expose port 8000, run with `uvicorn`.

---

## Step 8: Monitoring

Log predictions in production and alert on low confidence or data drift. Track accuracy, latency (p95), error rate, and confidence distribution over time.

---

## Best Practices Checklist

- ☐ Analyzed class distribution, no data leakage
- ☐ Applied augmentations (Albumentations)
- ☐ Started with pretrained model (transfer learning)
- ☐ Used LR scheduler + early stopping + best checkpoint
- ☐ Checked per-class metrics + Grad-CAM
- ☐ Exported to ONNX, verified outputs match
- ☐ API has input validation + health endpoint
- ☐ Logging predictions, alerting on low confidence

---

## Summary

| Step | Key Action |
|------|-----------|
| 1. Problem | Define task, collect/analyze data |
| 2. Data | Custom Dataset + augmentations |
| 3. Model | Transfer learning (pretrained backbone) |
| 4. Train | AdamW + CosineAnnealing + AMP + early stopping |
| 5. Evaluate | Per-class metrics + Grad-CAM |
| 6. Export | PyTorch → ONNX + quantization |
| 7. Deploy | FastAPI + Docker |
| 8. Monitor | Log predictions, detect drift |

---

## Next Lesson

Next up: the **Course Summary** — a recap of everything you've learned and what to do next! ➡️
