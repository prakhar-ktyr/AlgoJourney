---
title: Semantic Segmentation
---

# Semantic Segmentation

Semantic segmentation is the task of classifying **every single pixel** in an image. Instead of one label per image (classification) or boxes around objects (detection), you get a complete pixel-level map.

---

## What Is Semantic Segmentation?

```
Input:  [Street scene image — 640×480 pixels]
Output: [640×480 label map where each pixel = a class]
        sky=0, building=1, road=2, car=3, person=4, tree=5, ...
```

Every pixel gets assigned to exactly one class. Different instances of the same class (e.g., two cars) get the **same label** — that's what makes it "semantic" segmentation (vs instance segmentation which separates individual objects).

---

## Applications

| Domain | Application |
|--------|------------|
| Autonomous driving | Road, lane, obstacle segmentation |
| Medical imaging | Tumor boundaries, organ segmentation |
| Satellite imagery | Land use, crop mapping, urban planning |
| Photography | Background removal, portrait mode |
| Robotics | Scene understanding, navigation |

---

## Key Architectures

### FCN — Fully Convolutional Networks (2015)

The first deep learning approach to segmentation.

**Key ideas:**
1. Replace all fully-connected layers with **1×1 convolutions** (now works on any input size)
2. **Upsample** the feature map back to original resolution using transposed convolutions
3. **Skip connections** for multi-scale detail

```
Image (H×W×3) → Encoder (VGG/ResNet) → Feature Map (H/32 × W/32 × C)
                                              ↓
                              Transposed Conv (upsample 32×)
                                              ↓
                              Prediction Map (H×W×num_classes)
```

The 32× upsampling loses spatial detail. FCN-8s uses skip connections from earlier layers for better results.

---

### U-Net (2015)

Originally designed for **medical image segmentation** where training data is scarce. Now the most widely used segmentation architecture.

**Architecture: Symmetric Encoder-Decoder**

```
Encoder (downsampling)          Decoder (upsampling)
────────────────────           ────────────────────
64  channels, H×W      ──────────────→  64 channels, H×W    → Output
    ↓ MaxPool                                ↑ UpConv
128 channels, H/2×W/2  ──────────────→  128 channels, H/2×W/2
    ↓ MaxPool                                ↑ UpConv
256 channels, H/4×W/4  ──────────────→  256 channels, H/4×W/4
    ↓ MaxPool                                ↑ UpConv
512 channels, H/8×W/8  ──────────────→  512 channels, H/8×W/8
    ↓ MaxPool                                ↑ UpConv
        1024 channels, H/16×W/16 (bottleneck)
```

The **skip connections** (horizontal arrows) concatenate encoder features with decoder features. This gives the decoder both:
- **High-level semantic** information (from the decoder path)
- **Fine spatial detail** (from the encoder path)

### U-Net Implementation

```python
import torch
import torch.nn as nn


class DoubleConv(nn.Module):
    """Two consecutive 3×3 conv + BN + ReLU blocks."""

    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.double_conv(x)


class UNet(nn.Module):
    """U-Net for semantic segmentation."""

    def __init__(self, in_channels=3, num_classes=21):
        super().__init__()

        # Encoder (downsampling path)
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)

        self.pool = nn.MaxPool2d(2)

        # Bottleneck
        self.bottleneck = DoubleConv(512, 1024)

        # Decoder (upsampling path)
        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = DoubleConv(1024, 512)  # 512 (up) + 512 (skip) = 1024

        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = DoubleConv(512, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = DoubleConv(256, 128)

        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = DoubleConv(128, 64)

        # Final 1×1 convolution
        self.final_conv = nn.Conv2d(64, num_classes, 1)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)           # [B, 64, H, W]
        e2 = self.enc2(self.pool(e1))  # [B, 128, H/2, W/2]
        e3 = self.enc3(self.pool(e2))  # [B, 256, H/4, W/4]
        e4 = self.enc4(self.pool(e3))  # [B, 512, H/8, W/8]

        # Bottleneck
        b = self.bottleneck(self.pool(e4))  # [B, 1024, H/16, W/16]

        # Decoder with skip connections
        d4 = self.up4(b)                    # [B, 512, H/8, W/8]
        d4 = torch.cat([d4, e4], dim=1)     # [B, 1024, H/8, W/8]
        d4 = self.dec4(d4)                  # [B, 512, H/8, W/8]

        d3 = self.up3(d4)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)

        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)

        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)

        # Output
        return self.final_conv(d1)  # [B, num_classes, H, W]


# Test
model = UNet(in_channels=3, num_classes=21)
x = torch.randn(1, 3, 256, 256)
output = model(x)
print(f"Input: {x.shape}")
print(f"Output: {output.shape}")
# Input: torch.Size([1, 3, 256, 256])
# Output: torch.Size([1, 21, 256, 256])
```

---

### DeepLab (v1-v3+)

### Key Innovation: Atrous (Dilated) Convolutions

Normal convolution has a limited receptive field. Atrous convolution inserts **holes** (zeros) between filter elements, increasing the receptive field **without** increasing parameters or reducing resolution:

```
Standard 3×3 conv (rate=1):     Atrous 3×3 conv (rate=2):
[x x x]                        [x . x . x]
[x x x]                        [. . . . .]
[x x x]                        [x . x . x]
Receptive field: 3×3            [. . . . .]
                                [x . x . x]
                                Receptive field: 5×5
```

### ASPP: Atrous Spatial Pyramid Pooling

Captures context at **multiple scales** using parallel atrous convolutions with different dilation rates:

```python
class ASPP(nn.Module):
    """Atrous Spatial Pyramid Pooling — captures multi-scale context."""

    def __init__(self, in_channels, out_channels=256):
        super().__init__()
        rates = [6, 12, 18]

        self.convs = nn.ModuleList([
            # 1×1 convolution
            nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, bias=False),
                nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True))
        ] + [
            # Atrous convolutions at different rates
            nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 3, padding=r, dilation=r, bias=False),
                nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True))
            for r in rates
        ])

        # Global average pooling branch
        self.global_pool = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(in_channels, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True)
        )

        # Combine all branches (5 total → project back)
        self.project = nn.Sequential(
            nn.Conv2d(out_channels * 5, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True), nn.Dropout(0.5)
        )

    def forward(self, x):
        size = x.shape[2:]
        branch_outputs = [conv(x) for conv in self.convs]
        pool_out = nn.functional.interpolate(
            self.global_pool(x), size=size, mode="bilinear", align_corners=False
        )
        branch_outputs.append(pool_out)
        return self.project(torch.cat(branch_outputs, dim=1))
```

### DeepLab Versions

| Version | Key Feature |
|---------|------------|
| DeepLab v1 | Atrous convolutions + CRF post-processing |
| DeepLab v2 | ASPP (multi-scale atrous) |
| DeepLab v3 | Improved ASPP + batch norm |
| DeepLab v3+ | Encoder-decoder + ASPP (best) |

---

### PSPNet: Pyramid Pooling Module

Pools the feature map at multiple scales (1×1, 2×2, 3×3, 6×6), then upsamples and concatenates. Captures both local and global context.

---

## Loss Functions for Segmentation

### Cross-Entropy Loss (Per Pixel)

Standard choice — treats each pixel independently:

```python
import torch.nn as nn

# output: [B, num_classes, H, W] — raw logits
# target: [B, H, W] — class indices per pixel
criterion = nn.CrossEntropyLoss(ignore_index=255)  # 255 = unlabeled

loss = criterion(output, target)
```

### Dice Loss

Better for **imbalanced classes** (e.g., small tumor in large image):

$$L_{Dice} = 1 - \frac{2|A \cap B|}{|A| + |B|}$$

```python
def dice_loss(pred, target, smooth=1.0):
    """
    Dice loss for binary or per-class segmentation.
    pred: [B, C, H, W] after softmax
    target: [B, C, H, W] one-hot encoded
    """
    pred_flat = pred.view(pred.size(0), pred.size(1), -1)
    target_flat = target.view(target.size(0), target.size(1), -1)

    intersection = (pred_flat * target_flat).sum(dim=2)
    union = pred_flat.sum(dim=2) + target_flat.sum(dim=2)

    dice = (2.0 * intersection + smooth) / (union + smooth)
    return 1.0 - dice.mean()
```

### Combined Loss

Often the best results come from combining losses:

```python
def combined_loss(pred, target, alpha=0.5):
    """Combine cross-entropy and dice loss."""
    ce = nn.CrossEntropyLoss()(pred, target)

    # Convert to probabilities for dice
    pred_soft = torch.softmax(pred, dim=1)
    target_onehot = nn.functional.one_hot(target, num_classes=pred.size(1))
    target_onehot = target_onehot.permute(0, 3, 1, 2).float()

    dice = dice_loss(pred_soft, target_onehot)
    return alpha * ce + (1 - alpha) * dice
```

---

## Evaluation Metrics

### mIoU (Mean Intersection over Union)

The standard metric for segmentation. Computed per class, then averaged:

$$\text{IoU}_c = \frac{TP_c}{TP_c + FP_c + FN_c}$$

$$\text{mIoU} = \frac{1}{C}\sum_{c=1}^{C} \text{IoU}_c$$

```python
import numpy as np


def compute_miou(pred, target, num_classes):
    """
    Compute mean IoU.
    pred: [H, W] predicted class labels
    target: [H, W] ground truth class labels
    """
    ious = []

    for cls in range(num_classes):
        pred_mask = (pred == cls)
        target_mask = (target == cls)

        intersection = (pred_mask & target_mask).sum().item()
        union = (pred_mask | target_mask).sum().item()

        if union == 0:
            continue  # Skip classes not present
        ious.append(intersection / union)

    return np.mean(ious)
```

### Pixel Accuracy

Simple but can be misleading with imbalanced classes:

$$\text{Pixel Accuracy} = \frac{\text{correctly classified pixels}}{\text{total pixels}}$$

---

## Using torchvision DeepLab

### Pretrained Inference

```python
import torch
from torchvision.models.segmentation import deeplabv3_resnet50
from torchvision.models.segmentation import DeepLabV3_ResNet50_Weights
from torchvision import transforms
from PIL import Image
import numpy as np

# Load pretrained model (Pascal VOC - 21 classes)
weights = DeepLabV3_ResNet50_Weights.DEFAULT
model = deeplabv3_resnet50(weights=weights)
model.eval()

# Preprocess
image = Image.open("street.jpg").convert("RGB")
preprocess = weights.transforms()
input_tensor = preprocess(image).unsqueeze(0)

# Inference
with torch.no_grad():
    output = model(input_tensor)["out"]  # [1, 21, H, W]

# Get predicted class per pixel
pred_mask = output.argmax(dim=1).squeeze().cpu().numpy()  # [H, W]

print(f"Prediction shape: {pred_mask.shape}")
print(f"Classes found: {np.unique(pred_mask)}")
```

### Visualization

```python
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image


def colorize_mask(mask, num_classes=21):
    """Convert class index mask to RGB color image."""
    # Generate distinct colors
    palette = np.zeros((num_classes, 3), dtype=np.uint8)
    for i in range(num_classes):
        palette[i] = [(i * 47) % 256, (i * 97) % 256, (i * 157) % 256]
    palette[0] = [0, 0, 0]  # background = black
    color_mask = palette[mask]
    return Image.fromarray(color_mask)


# Visualize
colored_mask = colorize_mask(pred_mask)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(image)
axes[0].set_title("Original")
axes[1].imshow(colored_mask)
axes[1].set_title("Segmentation")
axes[2].imshow(image)
axes[2].imshow(colored_mask, alpha=0.5)
axes[2].set_title("Overlay")
plt.tight_layout()
plt.show()
```

---

## Training U-Net on Pascal VOC

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np

# ─── Configuration ─────────────────────────────────────────
NUM_CLASSES = 21  # Pascal VOC classes
BATCH_SIZE = 4
NUM_EPOCHS = 50
LEARNING_RATE = 1e-4
IMAGE_SIZE = 256
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ─── Transforms ────────────────────────────────────────────
image_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

target_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE), interpolation=transforms.InterpolationMode.NEAREST),
    transforms.PILToTensor(),
])

# ─── Dataset ───────────────────────────────────────────────
train_dataset = datasets.VOCSegmentation(
    root="./data",
    year="2012",
    image_set="train",
    download=True,
    transform=image_transform,
    target_transform=target_transform
)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)

# ─── Model ─────────────────────────────────────────────────
model = UNet(in_channels=3, num_classes=NUM_CLASSES).to(DEVICE)

# ─── Loss & Optimizer ─────────────────────────────────────
criterion = nn.CrossEntropyLoss(ignore_index=255)  # VOC uses 255 for boundary
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS)

# ─── Training Loop ────────────────────────────────────────
for epoch in range(NUM_EPOCHS):
    model.train()
    epoch_loss = 0.0

    for images, targets in train_loader:
        images = images.to(DEVICE)
        targets = targets.squeeze(1).long().to(DEVICE)

        outputs = model(images)  # [B, 21, H, W]
        loss = criterion(outputs, targets)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        epoch_loss += loss.item()

    scheduler.step()
    avg_loss = epoch_loss / len(train_loader)
    print(f"Epoch {epoch+1}/{NUM_EPOCHS} | Loss: {avg_loss:.4f}")

# Save model
torch.save(model.state_dict(), "unet_voc.pth")
```

---

## Architecture Comparison

| Model | Year | mIoU (VOC) | Key Feature |
|-------|------|-----------|-------------|
| FCN-8s | 2015 | 62.2 | First end-to-end segmentation |
| U-Net | 2015 | — | Encoder-decoder + skip connections |
| PSPNet | 2017 | 85.4 | Pyramid pooling |
| DeepLab v3+ | 2018 | 89.0 | Atrous convolutions + ASPP |
| HRNet | 2019 | 85.0 | Maintain high-resolution throughout |
| SegFormer | 2021 | 84.0 | Transformer-based, efficient |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Semantic segmentation | Classify every pixel in the image |
| FCN | First deep segmentation (replace FC with conv) |
| U-Net | Encoder-decoder + skip connections (most popular) |
| DeepLab | Atrous convolutions for large receptive field |
| ASPP | Multi-scale context capture |
| Dice loss | Better for imbalanced classes |
| mIoU | Standard segmentation metric |
| Skip connections | Preserve spatial detail during decoding |

Semantic segmentation is essential for any application that needs **precise pixel-level understanding** — from self-driving cars seeing the road to doctors finding tumor boundaries.
