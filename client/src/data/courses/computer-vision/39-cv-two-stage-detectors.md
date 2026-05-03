---
title: Two-Stage Detectors — R-CNN Family
---

# Two-Stage Detectors — R-CNN Family

Two-stage detectors first **propose regions** that might contain objects, then **classify** each region. They're generally more accurate than one-stage detectors, especially for small or overlapping objects.

---

## The Two-Stage Approach

```
Stage 1: "Where might objects be?"  →  Region proposals (candidate boxes)
Stage 2: "What is in each region?"  →  Classification + box refinement
```

This "look then decide" approach mirrors how humans perceive scenes — first notice something is there, then identify what it is.

---

## R-CNN (2014) — The Original

### How It Works

```
Image → Selective Search (2000 proposals) → CNN per proposal → SVM classifier → Bounding box regression
```

1. **Selective Search** generates ~2000 region proposals
2. Each region is warped to 227×227 and passed through a CNN (AlexNet)
3. CNN features → SVM for classification
4. Separate regressor refines bounding box coordinates

### The Problem

The CNN runs **separately on each of the 2000 proposals**. For one image:
- 2000 forward passes through the CNN
- Takes ~47 seconds per image
- Way too slow for practical use

```python
# Pseudo-code (DO NOT actually use R-CNN this way)
proposals = selective_search(image)  # ~2000 boxes

for proposal in proposals:           # 2000 iterations!
    cropped = crop_and_resize(image, proposal)
    features = cnn(cropped)          # Full CNN forward pass each time
    class_label = svm(features)
    refined_box = regressor(features)
```

---

## Fast R-CNN (2015) — Share Computation

### Key Insight

Why run the CNN 2000 times? Run it **once** on the entire image, then extract features for each proposal from the shared feature map.

```
Image → CNN (once!) → Feature map → RoI Pooling per proposal → Classifier + Regressor
```

### RoI Pooling

Extracts a **fixed-size feature** from any region of the feature map:

1. Map the proposal from image coordinates to feature map coordinates
2. Divide the region into a fixed grid (e.g., 7×7)
3. Max-pool within each grid cell

```python
import torchvision.ops as ops

# feature_map: [1, C, H, W] — output of backbone CNN
# boxes: [N, 5] — (batch_index, x1, y1, x2, y2) in feature map coords
# output_size: fixed size (e.g., 7×7)

pooled_features = ops.roi_pool(feature_map, boxes, output_size=(7, 7))
# Result: [N, C, 7, 7] — fixed size regardless of proposal size
```

### Improvements Over R-CNN

| Aspect | R-CNN | Fast R-CNN |
|--------|-------|-----------|
| CNN forward passes | 2000 per image | 1 per image |
| Training | Multi-stage (CNN → SVM → regressor) | End-to-end (except proposals) |
| Speed | ~47 sec/image | ~2 sec/image |
| Feature storage | Disk (huge) | In memory |

---

## Faster R-CNN (2015) — Learn the Proposals

### The Bottleneck

Fast R-CNN is fast... except for **Selective Search**, which still takes ~2 seconds per image on CPU. Can we learn to propose regions?

### Region Proposal Network (RPN)

The RPN is a small network that slides over the feature map and predicts:
- **Objectness score**: is there an object here? (yes/no)
- **Box regression**: refine the anchor box to better fit the object

```
Feature Map → 3×3 conv → Two heads:
                           ├── cls: object / not-object (2k scores)
                           └── reg: box offsets (4k coordinates)
```

### Anchor Boxes

At each position on the feature map, the RPN considers **k anchor boxes** of different:
- Scales: {128², 256², 512²}
- Aspect ratios: {1:1, 1:2, 2:1}

That's $k = 3 \times 3 = 9$ anchors per position.

For a feature map of size 40×60, that's $40 \times 60 \times 9 = 21,600$ candidate anchors.

### Architecture

```
                    ┌─────────────────────────────────┐
                    │         Faster R-CNN             │
                    │                                  │
Image ──→ Backbone CNN ──→ Feature Map ──┬──→ RPN ──→ Proposals
                                         │              │
                                         └──→ RoI Pool ←┘
                                                │
                                         Classification + 
                                         Box Regression
                    └─────────────────────────────────┘
```

### Loss Function

Faster R-CNN combines classification and regression losses:

$$L = L_{cls} + \lambda L_{reg}$$

where:
- $L_{cls}$: binary cross-entropy (object vs background for RPN) or multi-class CE (detection head)
- $L_{reg}$: Smooth L1 loss for box coordinates
- $\lambda$: balancing weight (typically 1.0)

$$\text{Smooth}_{L_1}(x) = \begin{cases} 0.5x^2 & \text{if } |x| < 1 \\ |x| - 0.5 & \text{otherwise} \end{cases}$$

---

## Feature Pyramid Network (FPN)

### The Problem with Single-Scale Features

Deep CNN feature maps have large receptive fields — great for big objects, bad for small ones. Small objects may be just 1-2 pixels on the final feature map.

### FPN Solution: Multi-Scale Features

Build a **top-down pathway** with lateral connections:

```
Bottom-up (backbone):       Top-down (FPN):
C5 (smallest, most semantic)  →  P5 (predict large objects)
 ↓                                ↑ (upsample + lateral)
C4                            →  P4 (predict medium-large objects)
 ↓                                ↑
C3                            →  P3 (predict medium objects)
 ↓                                ↑
C2 (largest, least semantic)  →  P2 (predict small objects)
```

Each level detects objects at a different scale. Lateral connections bring in the spatial detail from the bottom-up pathway.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class SimpleFPN(nn.Module):
    """Simplified Feature Pyramid Network."""

    def __init__(self, in_channels_list, out_channels=256):
        super().__init__()
        # Lateral 1x1 convolutions
        self.lateral_convs = nn.ModuleList([
            nn.Conv2d(in_ch, out_channels, 1)
            for in_ch in in_channels_list
        ])
        # 3x3 convolutions to reduce aliasing after upsampling
        self.output_convs = nn.ModuleList([
            nn.Conv2d(out_channels, out_channels, 3, padding=1)
            for _ in in_channels_list
        ])

    def forward(self, features):
        # features = [C2, C3, C4, C5] from backbone
        laterals = [
            conv(feat) for conv, feat in zip(self.lateral_convs, features)
        ]

        # Top-down pathway
        for i in range(len(laterals) - 2, -1, -1):
            upsampled = F.interpolate(
                laterals[i + 1], size=laterals[i].shape[2:], mode="nearest"
            )
            laterals[i] = laterals[i] + upsampled

        # Output convolutions
        outputs = [conv(lat) for conv, lat in zip(self.output_convs, laterals)]
        return outputs  # [P2, P3, P4, P5]
```

---

## Using torchvision Faster R-CNN

### Pretrained Inference

```python
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2
from torchvision.models.detection import FasterRCNN_ResNet50_FPN_V2_Weights
from torchvision import transforms
from PIL import Image

# Load pretrained model (COCO - 91 classes)
weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
model = fasterrcnn_resnet50_fpn_v2(weights=weights)
model.eval()

# Preprocess image
image = Image.open("street.jpg").convert("RGB")
preprocess = weights.transforms()
input_tensor = preprocess(image)

# Run inference
with torch.no_grad():
    predictions = model([input_tensor])

# Process results
pred = predictions[0]
for i in range(len(pred["boxes"])):
    box = pred["boxes"][i].tolist()
    score = pred["scores"][i].item()
    label = pred["labels"][i].item()

    if score > 0.7:  # Confidence threshold
        class_name = weights.meta["categories"][label]
        print(f"{class_name}: {score:.2f} at {[f'{v:.0f}' for v in box]}")
```

### Fine-Tuning on Custom Dataset

```python
import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torch.utils.data import DataLoader


def get_custom_faster_rcnn(num_classes):
    """Create Faster R-CNN with custom number of classes."""
    # Load pretrained Faster R-CNN
    model = fasterrcnn_resnet50_fpn(weights="DEFAULT")

    # Replace the classifier head
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    return model


# Create model (background + your classes)
num_classes = 4  # 1 background + 3 object classes
model = get_custom_faster_rcnn(num_classes)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Optimizer
params = [p for p in model.parameters() if p.requires_grad]
optimizer = torch.optim.SGD(params, lr=0.005, momentum=0.9, weight_decay=0.0005)
lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)
```

### Custom Dataset for Detection

```python
import torch
from torch.utils.data import Dataset
from PIL import Image
import os
import json


class CustomDetectionDataset(Dataset):
    """Detection dataset in COCO-like format."""

    def __init__(self, root, annotation_file, transforms=None):
        self.root = root
        self.transforms = transforms

        with open(annotation_file) as f:
            self.annotations = json.load(f)

        self.images = self.annotations["images"]
        # Group annotations by image_id
        self.img_to_anns = {}
        for ann in self.annotations["annotations"]:
            img_id = ann["image_id"]
            self.img_to_anns.setdefault(img_id, []).append(ann)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_info = self.images[idx]
        img_path = os.path.join(self.root, img_info["file_name"])
        image = Image.open(img_path).convert("RGB")

        anns = self.img_to_anns.get(img_info["id"], [])

        boxes = []
        labels = []
        for ann in anns:
            x, y, w, h = ann["bbox"]
            boxes.append([x, y, x + w, y + h])
            labels.append(ann["category_id"])

        target = {
            "boxes": torch.as_tensor(boxes, dtype=torch.float32),
            "labels": torch.as_tensor(labels, dtype=torch.int64),
            "image_id": torch.tensor([img_info["id"]]),
        }

        if self.transforms:
            image = self.transforms(image)

        return image, target
```

### Training Loop

```python
def train_one_epoch(model, data_loader, optimizer, device):
    """Train Faster R-CNN for one epoch."""
    model.train()
    total_loss = 0

    for images, targets in data_loader:
        images = [img.to(device) for img in images]
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        # Faster R-CNN returns losses during training
        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())

        optimizer.zero_grad()
        losses.backward()
        optimizer.step()

        total_loss += losses.item()

    return total_loss / len(data_loader)


# Training
num_epochs = 10
for epoch in range(num_epochs):
    loss = train_one_epoch(model, train_loader, optimizer, device)
    lr_scheduler.step()
    print(f"Epoch {epoch+1}/{num_epochs}, Loss: {loss:.4f}")
```

---

## One-Stage vs Two-Stage Comparison

| Feature | One-Stage (YOLO) | Two-Stage (Faster R-CNN) |
|---------|-------------------|--------------------------|
| Speed | 30-800+ FPS | 5-30 FPS |
| Architecture | Single network | RPN + detection head |
| Small objects | Decent | Better (with FPN) |
| Overlapping objects | Can struggle | Better separation |
| Training | Simpler | More complex |
| Deployment | Easier | Heavier model |
| Use case | Real-time, edge | High accuracy, research |

### When to Choose Two-Stage

- You need the **highest possible accuracy**
- Dataset has many **small objects**
- Objects frequently **overlap**
- Speed is not the primary constraint
- Medical/satellite imagery where every detection matters

### When to Choose One-Stage

- Need **real-time** detection (video, robotics)
- Deploying on **edge devices** (mobile, IoT)
- Objects are **medium to large**
- Need **simple deployment** pipeline

---

## Detection Architecture Timeline

```
2014: R-CNN        — CNN per region (slow but proved the concept)
2015: Fast R-CNN   — Shared features + RoI pooling (20× faster)
2015: Faster R-CNN — Learned proposals with RPN (end-to-end)
2016: YOLOv1       — Single pass detection (real-time!)
2016: SSD          — Multi-scale one-stage
2017: FPN          — Multi-scale features for two-stage
2017: RetinaNet    — Focal loss (one-stage matches two-stage)
2018: YOLOv3       — Multi-scale YOLO
2020: DETR         — Transformer-based detection (no anchors, no NMS)
2023: YOLOv8       — Anchor-free, state-of-the-art speed
2024: RT-DETR      — Real-time transformer detection
```

---

## Key Takeaways

| Concept | Key Point |
|---------|-----------|
| Two-stage approach | Propose regions first, then classify |
| R-CNN | CNN per proposal — too slow |
| Fast R-CNN | Shared features + RoI pooling |
| Faster R-CNN | Learnable proposals with RPN |
| FPN | Multi-scale detection for small objects |
| Anchor boxes | Predefined reference shapes at each position |
| Smooth L1 | Robust loss for bounding box regression |
| Choice | One-stage for speed, two-stage for accuracy |

Two-stage detectors established the foundational concepts of modern detection. Even though one-stage detectors now dominate in practice, understanding the R-CNN family helps you grasp **why** modern architectures work the way they do.
