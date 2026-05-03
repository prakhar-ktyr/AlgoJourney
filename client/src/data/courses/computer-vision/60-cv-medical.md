---
title: Medical Image Analysis
---

# Medical Image Analysis

Computer vision in healthcare assists doctors with **diagnosis, screening, and treatment planning**. From detecting lung nodules in X-rays to segmenting tumors in MRI scans, AI is transforming medical imaging — but with unique challenges around accuracy, safety, and trust.

---

## Medical Imaging Modalities

Different imaging techniques capture different aspects of the body:

| Modality | What It Shows | Common Uses |
|----------|--------------|-------------|
| X-ray | Bones, lungs, chest | Fractures, pneumonia, COVID |
| CT scan | 3D cross-sections | Cancer screening, trauma |
| MRI | Soft tissue detail | Brain, spine, joints |
| Ultrasound | Real-time soft tissue | Pregnancy, cardiac |
| Fundus photography | Retina | Diabetic retinopathy |
| Pathology (H&E) | Tissue at cellular level | Cancer diagnosis |
| Mammography | Breast tissue | Breast cancer screening |
| PET scan | Metabolic activity | Cancer staging |

### Key Differences from Natural Images

```
Natural images:            Medical images:
- 3 channels (RGB)        - 1 channel (grayscale) or 3D volumes
- 224×224 typical         - 512×512 to 2048×2048 (high-res)
- Objects at center       - Pathology can be anywhere
- Clear visual features   - Subtle differences matter
- Millions available      - Often <1000 labeled samples
```

---

## Challenges Unique to Medical CV

### 1. Limited Data

Medical data is **scarce and expensive**:
- Privacy regulations (HIPAA, GDPR) restrict sharing
- Expert annotation requires radiologists ($300+/hour)
- Rare diseases have very few cases

### 2. Class Imbalance

Most scans are normal; diseases are rare:

```
Example — Lung nodule detection:
  Normal scans: 95%
  Scans with nodules: 5%
  → Standard accuracy is misleading!
```

### 3. High Stakes

| Error Type | Consequence |
|-----------|-------------|
| False Negative | Missed cancer → delayed treatment → potential death |
| False Positive | Unnecessary biopsy → patient anxiety + cost |

### 4. Regulatory Requirements

- FDA 510(k) clearance (USA)
- CE marking (Europe)
- Clinical trials required before deployment
- Must demonstrate safety and efficacy

### 5. 3D Data

CT and MRI produce **volumetric** data (stacks of 2D slices), requiring specialized architectures.

---

## Key Tasks in Medical CV

### Classification

**Is this scan normal or abnormal?**

```python
import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import os

class ChestXrayDataset(Dataset):
    """Chest X-ray dataset for binary classification."""

    def __init__(self, image_dir, labels, transform=None):
        self.image_dir = image_dir
        self.labels = labels  # dict: filename → 0/1
        self.filenames = list(labels.keys())
        self.transform = transform or transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.Grayscale(num_output_channels=3),
            transforms.ToTensor(),
            transforms.Normalize([0.485], [0.229])
        ])

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        fname = self.filenames[idx]
        image = Image.open(
            os.path.join(self.image_dir, fname)
        ).convert("L")
        image = self.transform(image)
        label = self.labels[fname]
        return image, label


class ChestXrayClassifier(nn.Module):
    """Binary classifier for chest X-ray pathology detection."""

    def __init__(self, num_classes=2, pretrained=True):
        super().__init__()
        # Transfer learning from ImageNet
        self.backbone = models.densenet121(pretrained=pretrained)
        num_features = self.backbone.classifier.in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)


# Training with class imbalance handling
def train_medical_classifier(model, train_loader, val_loader,
                             epochs=30, device="cuda"):
    # Weighted loss for imbalanced classes
    class_weights = torch.tensor([1.0, 19.0]).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, patience=5, factor=0.5
    )
    model.to(device)

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        val_loss = validate(model, val_loader, criterion, device)
        scheduler.step(val_loss)
        print(f"Epoch {epoch+1}: train={running_loss/len(train_loader):.4f} "
              f"val={val_loss:.4f}")
```

### Segmentation

**Delineate organs, tumors, or structures pixel by pixel.**

This is where U-Net shines — the most important architecture in medical imaging.

### Detection

**Find and locate lesions, nodules, or abnormalities.**

Similar to object detection but with:
- Very small targets (tiny nodules)
- Low contrast with surrounding tissue
- Multiple scales of pathology

---

## U-Net: The Gold Standard for Medical Segmentation

**U-Net** (2015) was specifically designed for biomedical image segmentation and remains the dominant architecture.

### Why U-Net Works for Medical Imaging

1. **Works with small datasets** (as few as 30 annotated images)
2. **Skip connections** preserve fine spatial details
3. **Symmetric encoder-decoder** gives precise localization
4. **Easy to extend** to 3D, attention, and other variants

### Architecture

```
Encoder (contracting):     Decoder (expanding):
Input → [Conv-Conv-Pool]   [UpConv-Concat-Conv-Conv] → Output
        [Conv-Conv-Pool]   [UpConv-Concat-Conv-Conv]
        [Conv-Conv-Pool]   [UpConv-Concat-Conv-Conv]
        [Conv-Conv-Pool]   [UpConv-Concat-Conv-Conv]
              ↓                      ↑
        [Bottleneck] ────────────────┘

Skip connections: copy encoder features → concatenate with decoder
```

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleConv(nn.Module):
    """Two consecutive convolution blocks."""

    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    """U-Net for medical image segmentation."""

    def __init__(self, in_channels=1, num_classes=2):
        super().__init__()

        # Encoder (downsampling)
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)
        self.pool = nn.MaxPool2d(2)

        # Bottleneck
        self.bottleneck = DoubleConv(512, 1024)

        # Decoder (upsampling)
        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = DoubleConv(1024, 512)  # 512 + 512 skip
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = DoubleConv(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = DoubleConv(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = DoubleConv(128, 64)

        # Output
        self.out_conv = nn.Conv2d(64, num_classes, 1)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)                    # (B, 64, H, W)
        e2 = self.enc2(self.pool(e1))        # (B, 128, H/2, W/2)
        e3 = self.enc3(self.pool(e2))        # (B, 256, H/4, W/4)
        e4 = self.enc4(self.pool(e3))        # (B, 512, H/8, W/8)

        # Bottleneck
        b = self.bottleneck(self.pool(e4))   # (B, 1024, H/16, W/16)

        # Decoder with skip connections
        d4 = self.up4(b)                     # (B, 512, H/8, W/8)
        d4 = torch.cat([d4, e4], dim=1)     # (B, 1024, H/8, W/8)
        d4 = self.dec4(d4)                   # (B, 512, H/8, W/8)

        d3 = self.up3(d4)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)

        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)

        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)

        return self.out_conv(d1)             # (B, num_classes, H, W)


# Example: segment lung fields from chest X-ray
model = UNet(in_channels=1, num_classes=3)  # bg, left lung, right lung
x = torch.randn(2, 1, 256, 256)
output = model(x)
print(f"Output shape: {output.shape}")  # (2, 3, 256, 256)
```

---

## U-Net Variants for Medical Imaging

| Variant | Innovation | Use Case |
|---------|-----------|----------|
| 3D U-Net | 3D convolutions | CT/MRI volumes |
| Attention U-Net | Attention gates on skip connections | Focus on relevant regions |
| nnU-Net | Self-configuring (auto-selects everything) | Any medical segmentation |
| V-Net | Volumetric + Dice loss | 3D organ segmentation |
| TransUNet | Transformer encoder | Long-range dependencies |

**Attention U-Net** adds attention gates to skip connections — learns which spatial regions are important, suppressing irrelevant features before concatenation.

---

## Evaluation Metrics for Medical CV

Standard accuracy is **not enough** for medical tasks:

### Dice Score (Segmentation)

$$\text{Dice} = \frac{2|A \cap B|}{|A| + |B|}$$

Ranges from 0 (no overlap) to 1 (perfect overlap). Preferred over IoU for imbalanced segmentation.

```python
def dice_score(pred, target, smooth=1e-5):
    """Compute Dice score for binary segmentation."""
    pred_flat = pred.view(-1).float()
    target_flat = target.view(-1).float()

    intersection = (pred_flat * target_flat).sum()
    return (2.0 * intersection + smooth) / (
        pred_flat.sum() + target_flat.sum() + smooth
    )


class DiceLoss(nn.Module):
    """Dice loss for segmentation training."""

    def __init__(self, smooth=1e-5):
        super().__init__()
        self.smooth = smooth

    def forward(self, pred, target):
        pred = torch.sigmoid(pred)
        return 1.0 - dice_score(pred, target, self.smooth)


class CombinedLoss(nn.Module):
    """Dice + BCE loss (common in medical segmentation)."""

    def __init__(self, dice_weight=0.5):
        super().__init__()
        self.dice_loss = DiceLoss()
        self.bce_loss = nn.BCEWithLogitsLoss()
        self.dice_weight = dice_weight

    def forward(self, pred, target):
        dice = self.dice_loss(pred, target)
        bce = self.bce_loss(pred, target.float())
        return self.dice_weight * dice + (1 - self.dice_weight) * bce
```

### Classification Metrics

| Metric | Formula | Importance |
|--------|---------|------------|
| Sensitivity (Recall) | $\frac{TP}{TP + FN}$ | Don't miss disease! |
| Specificity | $\frac{TN}{TN + FP}$ | Avoid false alarms |
| AUC-ROC | Area under ROC curve | Overall discriminative power |
| PPV (Precision) | $\frac{TP}{TP + FP}$ | Positive predictive value |
| NPV | $\frac{TN}{TN + FN}$ | Negative predictive value |

**In medical AI, sensitivity is often prioritized** — missing a disease (false negative) is usually worse than a false alarm.

---

## Data Augmentation for Medical Images

Medical-specific augmentations that make sense anatomically:

```python
import torchvision.transforms as T
import torchvision.transforms.functional as TF
import random

class MedicalAugmentation:
    """Augmentations suitable for medical images."""

    def __init__(self, p=0.5):
        self.p = p

    def __call__(self, image, mask):
        if random.random() < self.p:
            angle = random.uniform(-15, 15)
            image = TF.rotate(image, angle)
            mask = TF.rotate(mask, angle)

        if random.random() < self.p:
            image = TF.hflip(image)
            mask = TF.hflip(mask)

        if random.random() < self.p:
            factor = random.uniform(0.8, 1.2)
            image = image * factor

        if random.random() < self.p:
            noise = torch.randn_like(image) * 0.02
            image = image + noise

        return image, mask
```

---

## Explainability: Building Clinical Trust

Doctors won't trust a black box. **Explainability** shows which image regions influenced the prediction.

### Grad-CAM for Medical Images

```python
import torch
import torch.nn.functional as F

class GradCAM:
    """Gradient-weighted Class Activation Mapping."""

    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(self._forward_hook)
        target_layer.register_backward_hook(self._backward_hook)

    def _forward_hook(self, module, input, output):
        self.activations = output

    def _backward_hook(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate(self, input_image, target_class=None):
        """Generate Grad-CAM heatmap."""
        self.model.eval()
        output = self.model(input_image)
        if target_class is None:
            target_class = output.argmax(dim=1)

        self.model.zero_grad()
        one_hot = torch.zeros_like(output)
        one_hot[0, target_class] = 1
        output.backward(gradient=one_hot)

        weights = self.gradients.mean(dim=[2, 3], keepdim=True)
        cam = F.relu((weights * self.activations).sum(dim=1, keepdim=True))
        cam = cam / (cam.max() + 1e-8)
        cam = F.interpolate(
            cam, size=input_image.shape[2:],
            mode="bilinear", align_corners=False
        )
        return cam.squeeze().detach().numpy()


# Usage: explain chest X-ray prediction
model = ChestXrayClassifier(num_classes=2)
target_layer = model.backbone.features[-1]
grad_cam = GradCAM(model, target_layer)
heatmap = grad_cam.generate(torch.randn(1, 3, 224, 224), target_class=1)
```

---

## Transfer Learning for Medical Imaging

ImageNet pretraining helps even though natural images look nothing like X-rays:

```python
def build_medical_model(num_classes, pretrained=True):
    """Build medical classifier with ImageNet transfer learning."""
    model = models.resnet50(pretrained=pretrained)
    # Modify first conv for single-channel input (grayscale)
    old_conv = model.conv1
    model.conv1 = nn.Conv2d(
        1, 64, kernel_size=7, stride=2, padding=3, bias=False
    )
    with torch.no_grad():
        model.conv1.weight = nn.Parameter(
            old_conv.weight.mean(dim=1, keepdim=True)
        )
    model.fc = nn.Sequential(
        nn.Dropout(0.5), nn.Linear(2048, num_classes)
    )
    return model
```

---

## Ethical Considerations

| Issue | Description | Mitigation |
|-------|-------------|-----------|
| Bias | Models trained on one demographic may fail on others | Diverse training data, subgroup analysis |
| Equity | Not all hospitals have AI infrastructure | Cloud deployment, edge devices |
| Over-reliance | Doctors may trust AI too much | Always present as decision support |
| Consent | Patients may not know their data trains AI | Transparent data use policies |
| Liability | Who is responsible for AI errors? | Clear regulatory frameworks |

**AI should augment, not replace, clinical expertise.**

---

## Summary

| Task | Architecture | Key Metric |
|------|-------------|------------|
| Classification | DenseNet/ResNet + transfer learning | AUC-ROC, Sensitivity |
| Segmentation | U-Net (and variants) | Dice score |
| Detection | RetinaNet / YOLO adapted | Sensitivity at low FP rate |
| 3D Analysis | 3D U-Net / nnU-Net | Volumetric Dice |

---

## Try It Yourself

1. Train a chest X-ray classifier on the CheXpert or NIH dataset
2. Build a U-Net to segment lung fields from X-rays
3. Apply Grad-CAM to visualize what the model focuses on
4. Handle class imbalance using weighted loss and oversampling

---

## Key Takeaways

- Medical CV faces unique challenges: small datasets, class imbalance, and high stakes
- U-Net is the go-to architecture for medical segmentation — simple, effective, and extensible
- Transfer learning from ImageNet works surprisingly well for medical images
- Dice score and sensitivity are more informative than accuracy for medical tasks
- Explainability (Grad-CAM) is essential for clinical adoption and trust
- Medical AI must be developed with regulatory compliance, fairness, and safety in mind
