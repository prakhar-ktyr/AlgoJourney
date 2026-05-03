---
title: Instance Segmentation
---

# Instance Segmentation

In this lesson, you will learn how to detect **and** segment individual objects in an image using instance segmentation.

---

## What Is Instance Segmentation?

Instance segmentation combines **object detection** (bounding boxes) with **pixel-level segmentation** (masks). Each detected object gets its own unique mask.

Think of it this way:

| Task | What It Does |
|------|-------------|
| Object Detection | Draws a box around each object |
| Semantic Segmentation | Labels every pixel with a class |
| Instance Segmentation | Labels every pixel AND separates individual objects |

---

## Semantic vs Instance vs Panoptic

```
Image with 3 cats and a background of grass:

Semantic Segmentation:
  - All cat pixels → "cat" (no distinction between cats)
  - All grass pixels → "grass"

Instance Segmentation:
  - Cat #1 pixels → mask 1
  - Cat #2 pixels → mask 2
  - Cat #3 pixels → mask 3
  - Background → ignored

Panoptic Segmentation:
  - Cat #1, Cat #2, Cat #3 → separate instances
  - Grass → labeled as "stuff"
  - Every pixel classified
```

**Key difference:** Semantic segmentation treats all cats as one blob. Instance segmentation gives each cat its own mask.

---

## Mask R-CNN (2017)

Mask R-CNN is the foundational model for instance segmentation. It extends Faster R-CNN by adding a **mask prediction branch**.

### Architecture Overview

```
Input Image
    │
    ▼
Backbone (ResNet + FPN)
    │
    ▼
Region Proposal Network (RPN)
    │
    ▼
RoI Align
    │
    ├──→ Classification Head → class label
    ├──→ Box Regression Head → bounding box
    └──→ Mask Head → binary mask per class
```

### Step 1: Backbone (ResNet + FPN)

The backbone extracts features at multiple scales:

- **ResNet** (e.g., ResNet-50 or ResNet-101) extracts hierarchical features
- **FPN** (Feature Pyramid Network) creates multi-scale feature maps

```python
# Conceptual backbone structure
# ResNet extracts features at 4 scales: C2, C3, C4, C5
# FPN combines them into P2, P3, P4, P5 (top-down + lateral connections)
```

### Step 2: Region Proposal Network (RPN)

The RPN proposes regions that likely contain objects:

- Slides anchors over feature maps
- Predicts objectness score + bounding box refinement
- Outputs ~1000 region proposals

### Step 3: RoI Align (Not RoI Pool!)

This is a key innovation of Mask R-CNN.

**Problem with RoI Pool:** Quantization (rounding) loses spatial precision.

```
RoI Pool (old, lossy):
  Region 7.3 × 5.7 → rounds to 7 × 5 → misaligned features

RoI Align (Mask R-CNN, precise):
  Region 7.3 × 5.7 → bilinear interpolation → exact features
```

RoI Align uses **bilinear interpolation** to sample features at exact floating-point positions. No rounding, no quantization. This preserves pixel-level spatial accuracy needed for masks.

### Step 4: Three Parallel Heads

After RoI Align, three heads run in parallel:

1. **Classification Head:** Predicts object class (FC layers → softmax)
2. **Box Regression Head:** Refines bounding box (FC layers → 4 offsets)
3. **Mask Head:** Predicts a binary mask (small FCN → 28×28 mask per class)

### Mask Head Details

The mask head is a small **Fully Convolutional Network (FCN)**:

```
RoI features (14×14×256)
    → Conv 3×3, 256 (×4 layers)
    → Deconv 2×2, 256
    → Conv 1×1, num_classes
    → Output: 28×28×num_classes (one mask per class)
```

**Important:** The mask head predicts a **binary mask per class** (not a single multi-class mask). This decouples mask prediction from classification.

### Multi-Task Loss

The total loss combines all three heads:

$$L = L_{cls} + L_{box} + L_{mask}$$

Where:
- $L_{cls}$: Cross-entropy loss for classification
- $L_{box}$: Smooth L1 loss for box regression
- $L_{mask}$: Binary cross-entropy loss for mask prediction (only on the ground-truth class)

---

## Using Torchvision Mask R-CNN

Torchvision provides a pre-trained Mask R-CNN ready for inference.

### Installation

```python
import torch
import torchvision
from torchvision.models.detection import maskrcnn_resnet50_fpn, MaskRCNN_ResNet50_FPN_Weights
from torchvision.transforms import functional as F
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
```

### Loading the Model

```python
# Load pre-trained Mask R-CNN
weights = MaskRCNN_ResNet50_FPN_Weights.DEFAULT
model = maskrcnn_resnet50_fpn(weights=weights)
model.eval()

# Get class names from weights metadata
categories = weights.meta["categories"]
print(f"Number of classes: {len(categories)}")
# Output: Number of classes: 91 (COCO classes)
```

### Running Inference

```python
def run_instance_segmentation(image_path, score_threshold=0.5):
    """Run Mask R-CNN on an image."""
    # Load and prepare image
    image = Image.open(image_path).convert("RGB")
    image_tensor = F.to_tensor(image).unsqueeze(0)

    # Run inference
    with torch.no_grad():
        predictions = model(image_tensor)

    # predictions is a list of dicts (one per image)
    pred = predictions[0]

    # Filter by confidence score
    keep = pred["scores"] > score_threshold

    boxes = pred["boxes"][keep]       # shape: [N, 4]
    labels = pred["labels"][keep]     # shape: [N]
    scores = pred["scores"][keep]     # shape: [N]
    masks = pred["masks"][keep]       # shape: [N, 1, H, W]

    print(f"Detected {len(boxes)} objects")
    for i in range(len(boxes)):
        class_name = categories[labels[i]]
        print(f"  {class_name}: {scores[i]:.2f}")

    return boxes, labels, scores, masks, image

boxes, labels, scores, masks, image = run_instance_segmentation("street.jpg")
```

### Visualizing Instance Masks

```python
def visualize_instances(image, boxes, labels, scores, masks, categories):
    """Draw instance masks with different colors."""
    fig, ax = plt.subplots(1, figsize=(12, 8))
    ax.imshow(image)

    # Generate random colors for each instance
    np.random.seed(42)
    colors = np.random.rand(len(boxes), 3)

    for i in range(len(boxes)):
        # Get binary mask (threshold at 0.5)
        mask = masks[i, 0].numpy() > 0.5
        color = colors[i]

        # Create colored mask overlay
        colored_mask = np.zeros((*mask.shape, 4))
        colored_mask[mask] = [*color, 0.5]  # RGBA with alpha=0.5
        ax.imshow(colored_mask)

        # Draw bounding box
        x1, y1, x2, y2 = boxes[i].numpy()
        rect = plt.Rectangle(
            (x1, y1), x2 - x1, y2 - y1,
            linewidth=2, edgecolor=color, facecolor="none"
        )
        ax.add_patch(rect)

        # Add label
        class_name = categories[labels[i]]
        ax.text(
            x1, y1 - 5,
            f"{class_name}: {scores[i]:.2f}",
            color="white", fontsize=10,
            bbox=dict(boxstyle="round", facecolor=color, alpha=0.8)
        )

    ax.axis("off")
    plt.tight_layout()
    plt.savefig("instance_segmentation_result.png", dpi=150)
    plt.show()

visualize_instances(image, boxes, labels, scores, masks, categories)
```

---

## Fine-Tuning Mask R-CNN on Custom Data

### COCO Format Annotations

Instance segmentation datasets typically use polygon annotations:

```json
{
  "images": [{"id": 1, "file_name": "img001.jpg", "width": 640, "height": 480}],
  "annotations": [
    {
      "id": 1,
      "image_id": 1,
      "category_id": 1,
      "segmentation": [[x1, y1, x2, y2, ..., xn, yn]],
      "bbox": [x, y, width, height],
      "area": 1234.5
    }
  ],
  "categories": [{"id": 1, "name": "custom_object"}]
}
```

### Custom Dataset Class

```python
import os
import json
import torch
from torch.utils.data import Dataset
from PIL import Image
import numpy as np
from pycocotools import mask as mask_utils


class CustomInstanceDataset(Dataset):
    """Dataset for instance segmentation with COCO-style annotations."""

    def __init__(self, root, annotation_file, transforms=None):
        self.root = root
        self.transforms = transforms

        with open(annotation_file, "r") as f:
            coco_data = json.load(f)

        self.images = coco_data["images"]
        self.annotations = coco_data["annotations"]

        # Group annotations by image_id
        self.img_to_anns = {}
        for ann in self.annotations:
            img_id = ann["image_id"]
            if img_id not in self.img_to_anns:
                self.img_to_anns[img_id] = []
            self.img_to_anns[img_id].append(ann)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_info = self.images[idx]
        img_path = os.path.join(self.root, img_info["file_name"])
        image = Image.open(img_path).convert("RGB")

        img_id = img_info["id"]
        anns = self.img_to_anns.get(img_id, [])

        boxes = []
        labels = []
        masks = []

        for ann in anns:
            # Bounding box: [x, y, w, h] → [x1, y1, x2, y2]
            x, y, w, h = ann["bbox"]
            boxes.append([x, y, x + w, y + h])
            labels.append(ann["category_id"])

            # Convert polygon to binary mask
            seg = ann["segmentation"]
            rle = mask_utils.frPyObjects(seg, img_info["height"], img_info["width"])
            binary_mask = mask_utils.decode(mask_utils.merge(rle))
            masks.append(binary_mask)

        target = {
            "boxes": torch.as_tensor(boxes, dtype=torch.float32),
            "labels": torch.as_tensor(labels, dtype=torch.int64),
            "masks": torch.as_tensor(np.array(masks), dtype=torch.uint8),
            "image_id": torch.tensor([img_id]),
        }

        image = F.to_tensor(image)
        if self.transforms:
            image, target = self.transforms(image, target)

        return image, target
```

### Training Loop

```python
from torchvision.models.detection import maskrcnn_resnet50_fpn, MaskRCNN_ResNet50_FPN_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor


def get_custom_maskrcnn(num_classes):
    """Create Mask R-CNN fine-tuned for custom classes."""
    # Load pre-trained model
    model = maskrcnn_resnet50_fpn(weights=MaskRCNN_ResNet50_FPN_Weights.DEFAULT)

    # Replace classification head
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    # Replace mask head
    in_features_mask = model.roi_heads.mask_predictor.conv5_mask.in_channels
    hidden_layer = 256
    model.roi_heads.mask_predictor = MaskRCNNPredictor(
        in_features_mask, hidden_layer, num_classes
    )

    return model


def train_one_epoch(model, data_loader, optimizer, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0

    for images, targets in data_loader:
        images = [img.to(device) for img in images]
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())

        optimizer.zero_grad()
        losses.backward()
        optimizer.step()

        total_loss += losses.item()

    return total_loss / len(data_loader)


# Setup training
num_classes = 3  # background + 2 custom classes
model = get_custom_maskrcnn(num_classes)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

optimizer = torch.optim.SGD(
    model.parameters(), lr=0.005, momentum=0.9, weight_decay=0.0005
)

# Training loop
num_epochs = 10
for epoch in range(num_epochs):
    loss = train_one_epoch(model, train_loader, optimizer, device)
    print(f"Epoch {epoch+1}/{num_epochs}, Loss: {loss:.4f}")
```

---

## Other Approaches

### YOLACT (Real-Time Instance Segmentation)

YOLACT generates prototype masks and combines them with per-instance coefficients:

```
Image → Backbone → Protonet → k prototype masks
                 → Detection head → coefficients per instance
Final mask = linear combination of prototypes
```

**Advantage:** Real-time speed (~30 FPS).

### SOLOv2 (Segment by Location)

SOLOv2 directly predicts instance masks by location:

- Divides image into grid
- Each grid cell predicts a mask for the object whose center falls in that cell
- No anchors, no boxes needed

### Cascade Mask R-CNN

Applies multiple detection + mask stages with increasing IoU thresholds for iterative refinement. More accurate but slower.

---

## Evaluation: Mask AP

Instance segmentation uses **mask AP** (Average Precision):

- Like detection AP, but IoU is computed between predicted and ground-truth **masks** (not boxes)
- COCO reports: AP@0.5, AP@0.75, AP (averaged over 0.5:0.95)

```python
# Mask IoU calculation
def mask_iou(mask1, mask2):
    """Compute IoU between two binary masks."""
    intersection = np.logical_and(mask1, mask2).sum()
    union = np.logical_or(mask1, mask2).sum()
    if union == 0:
        return 0.0
    return intersection / union
```

---

## Applications

| Application | Use Case |
|-------------|----------|
| Robotics | Grasp individual objects |
| Autonomous Driving | Segment each car, pedestrian, cyclist |
| Image Editing | Select and modify individual objects |
| Medical Imaging | Segment individual cells or lesions |
| Agriculture | Count and measure individual fruits |

---

## Summary

- Instance segmentation = detection + per-object masks
- **Mask R-CNN** is the standard: backbone + RPN + RoI Align + 3 heads
- **RoI Align** (bilinear interpolation) is crucial for mask accuracy
- Multi-task loss: $L = L_{cls} + L_{box} + L_{mask}$
- Use `torchvision.models.detection.maskrcnn_resnet50_fpn()` for quick inference
- Fine-tune by replacing the classification and mask heads

---

## Exercise

Try this:

1. Run Mask R-CNN on an image from the internet
2. Filter predictions to show only "person" instances
3. Count the number of people and color each one differently
4. Compute the pixel area of the largest detected person

---
