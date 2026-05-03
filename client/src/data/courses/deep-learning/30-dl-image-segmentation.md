---
title: Image Segmentation
---

# Image Segmentation

Object detection draws **boxes** around objects. But boxes are crude — they include background and overlap with other objects. **Image segmentation** classifies every single pixel.

---

## Types of Segmentation

| Type | What It Does | Output |
|------|-------------|--------|
| Semantic | Label every pixel with a class | All cats → same color |
| Instance | Distinguish individual objects | Cat 1 → blue, Cat 2 → red |
| Panoptic | Combine both | Individual objects + background classes |

### Visual Comparison

```
Original Image:     [cat1] [cat2] [dog] [grass background]

Semantic:           [cat]  [cat]  [dog] [grass]
                    (both cats same label)

Instance:           [cat1] [cat2] [dog] [background]
                    (each object unique ID)

Panoptic:           [cat1] [cat2] [dog] [grass]
                    (unique IDs + stuff classes)
```

---

## Semantic Segmentation

The most common type. Every pixel gets a class label.

### The Challenge

- **Input:** image of size $H \times W \times 3$
- **Output:** label map of size $H \times W$ (each pixel = class index)

Or as a probability map: $H \times W \times C$ where $C$ = number of classes.

### Why Not Just Use a CNN?

Standard CNNs **reduce spatial dimensions** through pooling:

```
224×224 → 112×112 → 56×56 → 28×28 → 14×14 → 7×7 → 1×1
```

But segmentation needs **pixel-level output** at the original resolution!

> **Solution:** Use architectures that recover spatial information.

---

## FCN (Fully Convolutional Networks)

**FCN** (2015) was the first end-to-end segmentation network. The key insight: **replace fully connected layers with convolutions**.

### FC Layer as Convolution

A FC layer taking a $7 \times 7 \times 512$ feature map to 4096 outputs is equivalent to a **$7 \times 7$ convolution** with 4096 filters.

This allows the network to:
- Accept any input size (not just 224×224)
- Produce a spatial output (not just a single vector)

### Upsampling Strategies

To go from low-resolution features back to full resolution:

| Method | How It Works |
|--------|-------------|
| Bilinear interpolation | Fixed mathematical upsampling |
| Transposed convolution | Learnable upsampling (also called "deconvolution") |
| Unpooling | Reverse max pooling using stored indices |

### Transposed Convolution

```python
import torch
import torch.nn as nn

# Regular convolution: reduces spatial size
conv = nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1)
x = torch.randn(1, 64, 32, 32)
print(f"Conv: {x.shape} → {conv(x).shape}")
# Conv: [1, 64, 32, 32] → [1, 128, 16, 16]

# Transposed convolution: increases spatial size
deconv = nn.ConvTranspose2d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=1)
y = torch.randn(1, 128, 16, 16)
print(f"Deconv: {y.shape} → {deconv(y).shape}")
# Deconv: [1, 128, 16, 16] → [1, 64, 32, 32]
```

---

## U-Net: The Segmentation Workhorse

**U-Net** (2015) is the most influential segmentation architecture. Originally designed for biomedical image segmentation, it's now used everywhere.

### Architecture: The "U" Shape

```
Encoder (Downsampling)          Decoder (Upsampling)
                    
[Input 572×572]                 [Output 388×388]
      │                               ▲
      ▼                               │
[Conv Block] ──── skip connection ──→ [Conv Block]
      │         (concatenate)          ▲
      ▼                               │
[MaxPool]                        [Up-Conv]
      │                               ▲
      ▼                               │
[Conv Block] ──── skip connection ──→ [Conv Block]
      │                               ▲
      ▼                               │
[MaxPool]                        [Up-Conv]
      │                               ▲
      ▼                               │
[Conv Block] ──── skip connection ──→ [Conv Block]
      │                               ▲
      ▼                               │
[MaxPool]                        [Up-Conv]
      │                               ▲
      ▼                               │
         [Bottleneck Conv Block]
```

### Why Skip Connections?

The encoder captures **what** (semantic information) but loses **where** (spatial details). Skip connections pass high-resolution features from encoder to decoder:

- **Encoder features:** precise boundaries, low-level details
- **Decoder features:** semantic understanding, high-level context
- **Combined:** accurate segmentation with precise boundaries

### U-Net Implementation

```python
import torch
import torch.nn as nn

class DoubleConv(nn.Module):
    """Two consecutive Conv → BN → ReLU blocks."""
    def __init__(self, in_channels, out_channels):
        super(DoubleConv, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    def __init__(self, in_channels=3, num_classes=21):
        super(UNet, self).__init__()

        # Encoder (downsampling path)
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)

        # Bottleneck
        self.bottleneck = DoubleConv(512, 1024)

        # Decoder (upsampling path)
        self.up4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.dec4 = DoubleConv(1024, 512)  # 512 + 512 from skip

        self.up3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = DoubleConv(512, 256)   # 256 + 256 from skip

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = DoubleConv(256, 128)   # 128 + 128 from skip

        self.up1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = DoubleConv(128, 64)    # 64 + 64 from skip

        # Final classification layer
        self.final_conv = nn.Conv2d(64, num_classes, kernel_size=1)

        # Pooling
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)       # [B, 64, H, W]
        e2 = self.enc2(self.pool(e1))   # [B, 128, H/2, W/2]
        e3 = self.enc3(self.pool(e2))   # [B, 256, H/4, W/4]
        e4 = self.enc4(self.pool(e3))   # [B, 512, H/8, W/8]

        # Bottleneck
        b = self.bottleneck(self.pool(e4))  # [B, 1024, H/16, W/16]

        # Decoder with skip connections
        d4 = self.up4(b)                    # [B, 512, H/8, W/8]
        d4 = torch.cat([d4, e4], dim=1)     # [B, 1024, H/8, W/8]
        d4 = self.dec4(d4)                  # [B, 512, H/8, W/8]

        d3 = self.up3(d4)                   # [B, 256, H/4, W/4]
        d3 = torch.cat([d3, e3], dim=1)     # [B, 512, H/4, W/4]
        d3 = self.dec3(d3)                  # [B, 256, H/4, W/4]

        d2 = self.up2(d3)                   # [B, 128, H/2, W/2]
        d2 = torch.cat([d2, e2], dim=1)     # [B, 256, H/2, W/2]
        d2 = self.dec2(d2)                  # [B, 128, H/2, W/2]

        d1 = self.up1(d2)                   # [B, 64, H, W]
        d1 = torch.cat([d1, e1], dim=1)     # [B, 128, H, W]
        d1 = self.dec1(d1)                  # [B, 64, H, W]

        # Final classification
        out = self.final_conv(d1)           # [B, num_classes, H, W]
        return out

# Test the model
model = UNet(in_channels=3, num_classes=21)
x = torch.randn(1, 3, 256, 256)
output = model(x)
print(f"Input: {x.shape}")
print(f"Output: {output.shape}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
# Input: [1, 3, 256, 256]
# Output: [1, 21, 256, 256]
# Parameters: ~31M
```

### Understanding the Output

The output has shape `[batch, num_classes, H, W]`. To get the predicted segmentation:

```python
# Get class prediction for each pixel
predictions = output.argmax(dim=1)  # [B, H, W]
print(f"Prediction map: {predictions.shape}")
# Each pixel value is a class index (0 to num_classes-1)
```

---

## DeepLab: Atrous (Dilated) Convolutions

**DeepLab** uses **atrous convolutions** (also called dilated convolutions) to capture multi-scale context without reducing resolution.

### What Are Dilated Convolutions?

A dilated convolution inserts "holes" (zeros) between filter values:

| Dilation Rate | Effective Kernel Size | Receptive Field |
|--------------|----------------------|-----------------|
| 1 (standard) | 3×3 | 3×3 |
| 2 | 3×3 with gaps | 5×5 |
| 4 | 3×3 with gaps | 9×9 |
| 8 | 3×3 with gaps | 17×17 |

> **Advantage:** Large receptive field without more parameters or reduced resolution!

### Dilated Convolution in PyTorch

```python
import torch
import torch.nn as nn

# Standard convolution: 3×3, receptive field = 3×3
conv_standard = nn.Conv2d(64, 64, kernel_size=3, padding=1, dilation=1)

# Dilated convolution: 3×3 with dilation=2, receptive field = 5×5
conv_dilated2 = nn.Conv2d(64, 64, kernel_size=3, padding=2, dilation=2)

# Dilated convolution: 3×3 with dilation=4, receptive field = 9×9
conv_dilated4 = nn.Conv2d(64, 64, kernel_size=3, padding=4, dilation=4)

# All produce same output size!
x = torch.randn(1, 64, 32, 32)
print(f"Standard:  {conv_standard(x).shape}")   # [1, 64, 32, 32]
print(f"Dilated 2: {conv_dilated2(x).shape}")   # [1, 64, 32, 32]
print(f"Dilated 4: {conv_dilated4(x).shape}")   # [1, 64, 32, 32]

# Same number of parameters!
print(f"Standard params:  {sum(p.numel() for p in conv_standard.parameters())}")
print(f"Dilated params:   {sum(p.numel() for p in conv_dilated2.parameters())}")
# Both: 36,928 parameters
```

### Atrous Spatial Pyramid Pooling (ASPP)

DeepLab's ASPP applies multiple dilated convolutions in parallel at different rates:

```python
class ASPP(nn.Module):
    """Atrous Spatial Pyramid Pooling module."""
    def __init__(self, in_channels, out_channels=256):
        super(ASPP, self).__init__()

        # 1×1 convolution
        self.conv1x1 = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

        # Atrous convolutions at different rates
        self.conv_d6 = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=6, dilation=6),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )
        self.conv_d12 = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=12, dilation=12),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )
        self.conv_d18 = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=18, dilation=18),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

        # Global average pooling branch
        self.global_pool = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(in_channels, out_channels, kernel_size=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

        # Combine all branches
        self.project = nn.Sequential(
            nn.Conv2d(out_channels * 5, out_channels, kernel_size=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
        )

    def forward(self, x):
        size = x.shape[2:]

        # Apply each branch
        out1 = self.conv1x1(x)
        out2 = self.conv_d6(x)
        out3 = self.conv_d12(x)
        out4 = self.conv_d18(x)

        # Global pooling branch (upsample back to spatial size)
        out5 = self.global_pool(x)
        out5 = nn.functional.interpolate(out5, size=size, mode="bilinear",
                                         align_corners=False)

        # Concatenate and project
        out = torch.cat([out1, out2, out3, out4, out5], dim=1)
        out = self.project(out)
        return out

# Test ASPP
aspp = ASPP(in_channels=2048, out_channels=256)
x = torch.randn(1, 2048, 32, 32)
print(f"ASPP: {x.shape} → {aspp(x).shape}")
# ASPP: [1, 2048, 32, 32] → [1, 256, 32, 32]
```

---

## Evaluation Metrics

### IoU (Intersection over Union) per Class

Also called **Jaccard Index**:

$$IoU_c = \frac{TP_c}{TP_c + FP_c + FN_c}$$

where:
- $TP_c$ = pixels correctly predicted as class $c$
- $FP_c$ = pixels incorrectly predicted as class $c$
- $FN_c$ = pixels of class $c$ missed by prediction

### Mean IoU (mIoU)

$$mIoU = \frac{1}{C} \sum_{c=1}^{C} IoU_c$$

### Dice Coefficient

$$Dice = \frac{2 \times |A \cap B|}{|A| + |B|} = \frac{2 \times TP}{2 \times TP + FP + FN}$$

> **Relationship:** $Dice = \frac{2 \times IoU}{1 + IoU}$

### Computing Metrics in PyTorch

```python
import torch

def compute_iou_per_class(pred, target, num_classes):
    """
    Compute IoU for each class.
    pred: (B, H, W) predicted class indices
    target: (B, H, W) ground truth class indices
    """
    ious = []
    for cls in range(num_classes):
        pred_mask = (pred == cls)
        target_mask = (target == cls)

        intersection = (pred_mask & target_mask).sum().float()
        union = (pred_mask | target_mask).sum().float()

        if union == 0:
            ious.append(float("nan"))
        else:
            ious.append((intersection / union).item())

    return ious

# Example evaluation
pred = torch.randint(0, 5, (2, 256, 256))
target = torch.randint(0, 5, (2, 256, 256))

ious = compute_iou_per_class(pred, target, num_classes=5)
mean_iou = torch.tensor([x for x in ious if not torch.isnan(torch.tensor(x))]).mean()
print(f"Mean IoU: {mean_iou:.4f}")
```

---

## Loss Functions for Segmentation

### Cross-Entropy Loss

```python
# Standard pixel-wise cross-entropy
criterion = nn.CrossEntropyLoss()

# For imbalanced classes, use weights
class_weights = torch.tensor([0.5, 2.0, 1.5, 3.0, 1.0])
criterion = nn.CrossEntropyLoss(weight=class_weights)
```

### Dice Loss

Better for imbalanced segmentation (small objects):

```python
class DiceLoss(nn.Module):
    def __init__(self, smooth=1.0):
        super(DiceLoss, self).__init__()
        self.smooth = smooth

    def forward(self, pred, target):
        num_classes = pred.shape[1]
        pred_soft = torch.softmax(pred, dim=1)

        # One-hot encode target
        target_one_hot = torch.zeros_like(pred_soft)
        target_one_hot.scatter_(1, target.unsqueeze(1), 1)

        # Compute Dice for each class
        intersection = (pred_soft * target_one_hot).sum(dim=(2, 3))
        cardinality = pred_soft.sum(dim=(2, 3)) + target_one_hot.sum(dim=(2, 3))

        dice = (2.0 * intersection + self.smooth) / (cardinality + self.smooth)
        return 1.0 - dice.mean()
```

> **Best practice:** Combine both — `0.5 * CE + 0.5 * Dice` gives the best results.

---

## Architecture Comparison

| Architecture | Year | Key Feature | mIoU (VOC 2012) |
|-------------|------|-------------|-----------------|
| FCN-8s | 2015 | FC → Conv + skip | 62.2% |
| U-Net | 2015 | Encoder-decoder + skip | — (medical) |
| DeepLab v2 | 2016 | Dilated conv + CRF | 79.7% |
| DeepLab v3+ | 2018 | ASPP + decoder | 89.0% |
| HRNet | 2019 | Multi-resolution parallel | 81.6% |

---

## Summary

| Concept | Key Points |
|---------|-----------|
| Semantic segmentation | Classify every pixel |
| Instance segmentation | Distinguish individual objects |
| FCN | Replace FC with conv, enable spatial output |
| U-Net | Encoder-decoder with skip connections |
| DeepLab | Dilated convolutions for multi-scale context |
| Metrics | IoU, mIoU, Dice coefficient |
| Loss | Cross-entropy + Dice for best results |

---

## Key Takeaways

1. **U-Net** is the go-to architecture — simple, effective, well-understood
2. **Skip connections** preserve spatial details lost during downsampling
3. **Dilated convolutions** increase receptive field without losing resolution
4. **Dice loss** handles class imbalance better than cross-entropy alone
5. **mIoU** is the standard metric — always report per-class IoU too

---

## Next Steps

You've now covered the major computer vision tasks with deep learning:
- Classification (Lesson 28)
- Detection (Lesson 29)
- Segmentation (this lesson)

In upcoming lessons, we'll explore **sequence models** (RNNs, Transformers) for text and time-series data!
