---
title: Object Detection
---

# Object Detection

Image classification answers **"What is in this image?"** — but object detection answers **"What objects are here and where are they?"**

Object detection finds **multiple objects** in an image and draws **bounding boxes** around each one.

---

## Classification vs Detection

| Task | Output | Example |
|------|--------|---------|
| Classification | Single label | "cat" |
| Detection | Labels + bounding boxes | "cat at (10,20,100,80), dog at (150,30,90,70)" |
| Segmentation | Pixel-level masks | Every pixel labeled |

> **Detection = Classification + Localization** for multiple objects.

---

## Bounding Boxes

A bounding box is a rectangle that encloses an object. There are two common formats:

### Format 1: (x, y, width, height)

- $(x, y)$ = top-left corner
- $(w, h)$ = width and height

### Format 2: (x_min, y_min, x_max, y_max)

- $(x_{min}, y_{min})$ = top-left corner
- $(x_{max}, y_{max})$ = bottom-right corner

### Converting Between Formats

```python
def xywh_to_xyxy(box):
    """Convert (x, y, w, h) to (x_min, y_min, x_max, y_max)."""
    x, y, w, h = box
    return [x, y, x + w, y + h]

def xyxy_to_xywh(box):
    """Convert (x_min, y_min, x_max, y_max) to (x, y, w, h)."""
    x_min, y_min, x_max, y_max = box
    return [x_min, y_min, x_max - x_min, y_max - y_min]

# Example
box_xywh = [50, 30, 100, 80]  # top-left at (50,30), size 100x80
box_xyxy = xywh_to_xyxy(box_xywh)
print(f"XYWH: {box_xywh} → XYXY: {box_xyxy}")
# XYWH: [50, 30, 100, 80] → XYXY: [50, 30, 150, 110]
```

---

## IoU (Intersection over Union)

**IoU** measures how much two boxes overlap. It's the key metric for object detection:

$$IoU = \frac{\text{Area of Overlap}}{\text{Area of Union}}$$

### IoU Values

| IoU | Interpretation |
|-----|----------------|
| 0.0 | No overlap |
| 0.5 | Decent match (common threshold) |
| 0.75 | Good match (strict threshold) |
| 1.0 | Perfect overlap |

### Computing IoU

```python
def compute_iou(box1, box2):
    """
    Compute IoU between two boxes in (x_min, y_min, x_max, y_max) format.
    """
    # Find intersection rectangle
    x_min = max(box1[0], box2[0])
    y_min = max(box1[1], box2[1])
    x_max = min(box1[2], box2[2])
    y_max = min(box1[3], box2[3])

    # Compute intersection area
    intersection = max(0, x_max - x_min) * max(0, y_max - y_min)

    # Compute union area
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    # Avoid division by zero
    if union == 0:
        return 0.0

    return intersection / union

# Example
gt_box = [50, 50, 150, 150]   # Ground truth
pred_box = [60, 55, 155, 145]  # Prediction

iou = compute_iou(gt_box, pred_box)
print(f"IoU: {iou:.4f}")  # IoU: 0.7364
```

### Batch IoU with PyTorch

```python
import torch

def batch_iou(boxes1, boxes2):
    """
    Compute IoU between all pairs of boxes.
    boxes1: (N, 4), boxes2: (M, 4) in xyxy format.
    Returns: (N, M) IoU matrix.
    """
    area1 = (boxes1[:, 2] - boxes1[:, 0]) * (boxes1[:, 3] - boxes1[:, 1])
    area2 = (boxes2[:, 2] - boxes2[:, 0]) * (boxes2[:, 3] - boxes2[:, 1])

    # Intersection
    inter_x_min = torch.max(boxes1[:, None, 0], boxes2[None, :, 0])
    inter_y_min = torch.max(boxes1[:, None, 1], boxes2[None, :, 1])
    inter_x_max = torch.min(boxes1[:, None, 2], boxes2[None, :, 2])
    inter_y_max = torch.min(boxes1[:, None, 3], boxes2[None, :, 3])

    inter_area = (
        torch.clamp(inter_x_max - inter_x_min, min=0) *
        torch.clamp(inter_y_max - inter_y_min, min=0)
    )

    # Union
    union_area = area1[:, None] + area2[None, :] - inter_area

    return inter_area / union_area

# Example
boxes1 = torch.tensor([[50, 50, 150, 150], [200, 200, 300, 300]], dtype=torch.float)
boxes2 = torch.tensor([[60, 55, 155, 145], [210, 210, 310, 310]], dtype=torch.float)
print(batch_iou(boxes1, boxes2))
```

---

## Detection Approaches

### Two-Stage Detectors

Two-stage detectors first **propose regions**, then **classify** them:

```
Image → Region Proposal → Feature Extraction → Classification + Refinement
```

#### Evolution of Two-Stage Detectors

| Method | Year | Speed | Key Idea |
|--------|------|-------|----------|
| R-CNN | 2014 | ~47s/image | Selective search + CNN per region |
| Fast R-CNN | 2015 | ~2s/image | Share CNN features across regions |
| Faster R-CNN | 2015 | ~0.2s/image | Learn region proposals with RPN |

#### Faster R-CNN Architecture

```
Image
  │
  ▼
Backbone CNN (ResNet/VGG)
  │
  ├── Feature Map
  │     │
  │     ▼
  │   Region Proposal Network (RPN)
  │     │
  │     ▼
  │   Proposed Regions (~300)
  │     │
  ▼     ▼
RoI Pooling (crop + resize features)
  │
  ▼
Classification Head → class + box refinement
```

### One-Stage Detectors

One-stage detectors predict boxes and classes **in a single pass**:

```
Image → CNN → Predictions (class + box) directly
```

| Method | Year | Speed | Key Idea |
|--------|------|-------|----------|
| YOLO v1 | 2016 | 45 FPS | Grid-based prediction |
| SSD | 2016 | 59 FPS | Multi-scale feature maps |
| YOLO v3 | 2018 | 30 FPS | Better backbone + FPN |
| YOLO v5 | 2020 | 140 FPS | PyTorch-native, easy to use |
| YOLO v8 | 2023 | 160 FPS | State-of-the-art |

> **One-stage is faster** but traditionally less accurate. Modern one-stage detectors (YOLOv8) have closed the gap.

---

## YOLO: You Only Look Once

YOLO divides the image into an $S \times S$ grid and predicts boxes directly.

### How YOLO Works

1. **Divide** image into $S \times S$ grid (e.g., $7 \times 7$)
2. Each cell predicts $B$ bounding boxes (e.g., $B = 2$)
3. Each box has 5 values: $(x, y, w, h, \text{confidence})$
4. Each cell predicts $C$ class probabilities

**Total output:** $S \times S \times (B \times 5 + C)$

For YOLO v1: $7 \times 7 \times (2 \times 5 + 20) = 7 \times 7 \times 30 = 1470$ values

### YOLO Confidence Score

$$\text{Confidence} = P(\text{Object}) \times IoU_{\text{pred}}^{\text{truth}}$$

- If no object in cell: confidence should be 0
- If object present: confidence should equal IoU with ground truth

### YOLO Loss Function

The YOLO loss has multiple components:

$$\mathcal{L} = \lambda_{coord} \mathcal{L}_{box} + \mathcal{L}_{conf} + \lambda_{noobj} \mathcal{L}_{noobj} + \mathcal{L}_{class}$$

Where:
- $\mathcal{L}_{box}$ — localization error (MSE on x, y, √w, √h)
- $\mathcal{L}_{conf}$ — confidence error for cells with objects
- $\mathcal{L}_{noobj}$ — confidence error for empty cells (weighted less)
- $\mathcal{L}_{class}$ — classification error

> **Why √w and √h?** Small deviations in large boxes matter less than in small boxes. Square root penalizes small-box errors more.

---

## Non-Maximum Suppression (NMS)

Detectors often predict **multiple overlapping boxes** for the same object. NMS removes duplicates:

### Algorithm

1. Sort all boxes by confidence score
2. Take the box with highest confidence
3. Remove all other boxes with IoU > threshold (e.g., 0.5)
4. Repeat from step 2 with remaining boxes

### NMS in PyTorch

```python
import torch
from torchvision.ops import nms

def apply_nms(boxes, scores, iou_threshold=0.5):
    """
    Apply Non-Maximum Suppression.
    boxes: (N, 4) in xyxy format
    scores: (N,) confidence scores
    Returns: indices of kept boxes
    """
    keep = nms(boxes, scores, iou_threshold)
    return keep

# Example: 5 overlapping detections
boxes = torch.tensor([
    [100, 100, 210, 210],  # Box 0
    [105, 108, 215, 215],  # Box 1 (overlaps with 0)
    [102, 103, 208, 212],  # Box 2 (overlaps with 0)
    [300, 300, 400, 400],  # Box 3 (different object)
    [305, 305, 405, 405],  # Box 4 (overlaps with 3)
], dtype=torch.float)

scores = torch.tensor([0.95, 0.80, 0.70, 0.90, 0.75])

keep = apply_nms(boxes, scores, iou_threshold=0.5)
print(f"Kept boxes: {keep.tolist()}")  # [0, 3] — one per object
print(f"Before NMS: {len(boxes)} boxes → After NMS: {len(keep)} boxes")
```

### NMS from Scratch

```python
def nms_manual(boxes, scores, iou_threshold=0.5):
    """Manual NMS implementation for understanding."""
    # Sort by score (descending)
    order = scores.argsort(descending=True)
    keep = []

    while len(order) > 0:
        # Keep the highest-scoring box
        idx = order[0].item()
        keep.append(idx)

        if len(order) == 1:
            break

        # Compute IoU with remaining boxes
        remaining = order[1:]
        ious = torch.tensor([
            compute_iou(boxes[idx].tolist(), boxes[r].tolist())
            for r in remaining
        ])

        # Keep boxes with IoU below threshold
        mask = ious <= iou_threshold
        order = remaining[mask]

    return keep

keep = nms_manual(boxes, scores, iou_threshold=0.5)
print(f"Kept boxes: {keep}")  # [0, 3]
```

---

## Evaluation: mAP (mean Average Precision)

**mAP** is the standard metric for object detection.

### Step-by-Step Calculation

1. **For each class**, sort detections by confidence
2. **Match** each detection to a ground truth box (IoU > threshold)
3. Compute **Precision** and **Recall** at each detection:

$$\text{Precision} = \frac{TP}{TP + FP} \quad \text{Recall} = \frac{TP}{TP + FN}$$

4. Plot the **Precision-Recall curve**
5. Compute **AP** = area under the PR curve
6. **mAP** = mean of AP across all classes

### mAP Variants

| Metric | IoU Threshold | Used In |
|--------|--------------|---------|
| mAP@0.5 | 0.5 | PASCAL VOC |
| mAP@0.75 | 0.75 | Strict evaluation |
| mAP@[0.5:0.95] | Average over 0.5 to 0.95 | COCO (primary) |

```python
def compute_ap(precisions, recalls):
    """Compute Average Precision using 11-point interpolation."""
    ap = 0.0
    for t in torch.linspace(0, 1, 11):
        # Max precision at recall >= t
        mask = recalls >= t
        if mask.any():
            ap += precisions[mask].max().item()
    return ap / 11

# Example precision-recall values
precisions = torch.tensor([1.0, 1.0, 0.67, 0.75, 0.60, 0.67])
recalls = torch.tensor([0.1, 0.2, 0.2, 0.3, 0.3, 0.4])
ap = compute_ap(precisions, recalls)
print(f"Average Precision: {ap:.4f}")
```

---

## Using Pre-trained Detection Models

### Torchvision Faster R-CNN

```python
import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2
from torchvision.transforms import functional as F
from PIL import Image

# Load pre-trained Faster R-CNN
model = fasterrcnn_resnet50_fpn_v2(weights="DEFAULT")
model.eval()

# COCO class names (91 classes)
COCO_CLASSES = [
    "__background__", "person", "bicycle", "car", "motorcycle",
    "airplane", "bus", "train", "truck", "boat", "traffic light",
    "fire hydrant", "N/A", "stop sign", "parking meter", "bench",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant",
    "bear", "zebra", "giraffe", # ... and more
]

# Run detection on an image
def detect_objects(image_path, confidence_threshold=0.5):
    # Load and preprocess image
    image = Image.open(image_path).convert("RGB")
    image_tensor = F.to_tensor(image).unsqueeze(0)

    # Run inference
    with torch.no_grad():
        predictions = model(image_tensor)[0]

    # Filter by confidence
    mask = predictions["scores"] > confidence_threshold
    boxes = predictions["boxes"][mask]
    labels = predictions["labels"][mask]
    scores = predictions["scores"][mask]

    # Print results
    print(f"Found {len(boxes)} objects:")
    for box, label, score in zip(boxes, labels, scores):
        class_name = COCO_CLASSES[label.item()]
        x1, y1, x2, y2 = box.tolist()
        print(f"  {class_name}: {score:.2f} at "
              f"({x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f})")

    return boxes, labels, scores

# Example usage
# detect_objects("street_scene.jpg")
```

### Drawing Detections

```python
from torchvision.utils import draw_bounding_boxes
from torchvision.transforms import functional as F

def visualize_detections(image_path, boxes, labels, scores, classes):
    """Draw bounding boxes on image."""
    image = Image.open(image_path).convert("RGB")
    image_uint8 = (F.to_tensor(image) * 255).byte()

    label_texts = [f"{classes[l.item()]}: {s:.2f}" for l, s in zip(labels, scores)]

    result = draw_bounding_boxes(image_uint8, boxes, labels=label_texts,
                                 colors="red", width=2)
    return F.to_pil_image(result)
```

---

## Fine-tuning for Custom Objects

```python
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

def get_detection_model(num_classes):
    """Load pre-trained Faster R-CNN and modify for custom classes."""
    model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)
    return model

# Example: detect 3 custom classes + background
model = get_detection_model(num_classes=4)

optimizer = torch.optim.SGD(
    model.parameters(), lr=0.005, momentum=0.9, weight_decay=0.0005
)

model.train()
for epoch in range(10):
    for images, targets in train_loader:
        # targets: list of dicts with "boxes" and "labels"
        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())

        optimizer.zero_grad()
        losses.backward()
        optimizer.step()

    print(f"Epoch {epoch+1}, Loss: {losses.item():.4f}")
```

---

## Summary

| Concept | Key Points |
|---------|-----------|
| Bounding boxes | (x, y, w, h) or (x_min, y_min, x_max, y_max) |
| IoU | Overlap / Union, threshold typically 0.5 |
| Two-stage | R-CNN family: propose then classify |
| One-stage | YOLO/SSD: predict directly, faster |
| NMS | Remove duplicate detections |
| mAP | Mean AP across classes at IoU threshold |

---

## Next Lesson

Detection draws boxes around objects. But what if you need to know the **exact shape** of each object? In the next lesson, we'll explore **Image Segmentation** — classifying every single pixel in an image.
