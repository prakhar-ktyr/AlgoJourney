---
title: Object Detection — YOLO & SSD
---

# Object Detection — YOLO & SSD

Object detection answers two questions at once: **What** objects are in the image, and **Where** are they? The output is a set of bounding boxes, each with a class label and confidence score.

---

## What Is Object Detection?

```
Input:  [Photo of a street scene]
Output: [
    {"class": "car",    "bbox": [100, 200, 300, 350], "confidence": 0.95},
    {"class": "person", "bbox": [400, 150, 480, 400], "confidence": 0.88},
    {"class": "dog",    "bbox": [250, 300, 320, 380], "confidence": 0.72}
]
```

A bounding box is defined as: $[x_{min}, y_{min}, x_{max}, y_{max}]$ or $[x_{center}, y_{center}, width, height]$

---

## Two Paradigms

| Paradigm | How It Works | Speed | Accuracy |
|----------|-------------|-------|----------|
| **One-stage** | Predict boxes directly from features | Fast (real-time) | Good |
| **Two-stage** | First propose regions, then classify | Slower | Better for small objects |

This lesson covers **one-stage** detectors. Next lesson covers two-stage.

---

## YOLO: You Only Look Once

### Core Idea

YOLO treats detection as a **single regression problem**:

1. Divide image into an $S \times S$ grid
2. Each grid cell predicts $B$ bounding boxes
3. Each box: $(x, y, w, h, \text{confidence})$
4. Each cell also predicts class probabilities

One forward pass = all detections. That's why it's fast!

### YOLO Evolution

| Version | Year | Key Innovation |
|---------|------|---------------|
| YOLOv1 | 2016 | Single-pass detection concept |
| YOLOv2 | 2017 | Batch norm, anchor boxes, multi-scale |
| YOLOv3 | 2018 | Feature Pyramid, 3 detection scales |
| YOLOv5 | 2020 | PyTorch, great engineering, easy to use |
| YOLOv8 | 2023 | Anchor-free, decoupled head |
| YOLOv11 | 2024 | Improved backbone, better accuracy |

### Anchor Boxes

Instead of predicting absolute box dimensions, YOLO predicts **offsets from predefined anchor boxes**:

```
Anchor boxes (predefined):  [10×13], [16×30], [33×23], ...
Prediction:                 offsets (dx, dy, dw, dh) from nearest anchor
Final box:                  anchor + offsets
```

Anchors are determined by clustering the ground truth boxes in your dataset (k-means on width/height).

### Non-Maximum Suppression (NMS)

Multiple grid cells may detect the same object. NMS removes duplicates:

```
1. Sort all detections by confidence (highest first)
2. Take the highest confidence box → keep it
3. Remove all other boxes that overlap with it above IoU threshold
4. Repeat until no boxes remain
```

```python
import torchvision.ops as ops

# boxes: tensor of shape [N, 4] (x1, y1, x2, y2)
# scores: tensor of shape [N]
keep_indices = ops.nms(boxes, scores, iou_threshold=0.5)
final_boxes = boxes[keep_indices]
```

---

## SSD: Single Shot MultiBox Detector

SSD detects objects at **multiple scales** using feature maps of different sizes:

```
Feature Map 38×38  →  detects small objects
Feature Map 19×19  →  detects medium objects
Feature Map 10×10  →  detects large objects
Feature Map 5×5    →  detects very large objects
```

At each location on each feature map, SSD places **default boxes** (similar to anchors) of various aspect ratios and predicts offsets + classes.

---

## RetinaNet & Focal Loss

One-stage detectors have a problem: **class imbalance**. Most grid cells contain background (no object). The easy negatives overwhelm the loss.

**Focal Loss** down-weights easy examples:

$$FL(p_t) = -(1-p_t)^\gamma \log(p_t)$$

where:
- $p_t$ = model's predicted probability for the true class
- $\gamma$ = focusing parameter (typically 2)
- When $p_t$ is high (easy example): $(1-p_t)^\gamma$ is small → low loss
- When $p_t$ is low (hard example): $(1-p_t)^\gamma$ is large → high loss

```python
import torch
import torch.nn.functional as F


def focal_loss(inputs, targets, alpha=0.25, gamma=2.0):
    """Focal loss for object detection."""
    bce_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction="none")
    p_t = torch.exp(-bce_loss)  # p_t = probability of correct class
    focal_weight = (1 - p_t) ** gamma
    loss = alpha * focal_weight * bce_loss
    return loss.mean()
```

---

## Using YOLOv8 (Ultralytics)

The easiest way to use YOLO in practice:

### Installation

```python
# pip install ultralytics
from ultralytics import YOLO
```

### Inference with Pretrained Model

```python
from ultralytics import YOLO
from PIL import Image

# Load pretrained YOLOv8 (trained on COCO - 80 classes)
model = YOLO("yolov8n.pt")  # nano version (fastest)
# Other options: yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt

# Run inference
results = model("street_scene.jpg")

# Process results
for result in results:
    boxes = result.boxes

    for box in boxes:
        # Bounding box coordinates
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        # Confidence and class
        confidence = box.conf[0].item()
        class_id = int(box.cls[0].item())
        class_name = model.names[class_id]

        print(f"{class_name}: {confidence:.2f} at [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")

# Save annotated image
results[0].save("output.jpg")
```

### YOLOv8 Model Sizes

| Model | Params | mAP@0.5 | Speed (ms) |
|-------|--------|---------|------------|
| YOLOv8n | 3.2M | 37.3 | 1.2 |
| YOLOv8s | 11.2M | 44.9 | 2.1 |
| YOLOv8m | 25.9M | 50.2 | 4.7 |
| YOLOv8l | 43.7M | 52.9 | 7.8 |
| YOLOv8x | 68.2M | 53.9 | 12.3 |

---

## Training YOLOv8 on Custom Data

### Data Format

YOLO expects one `.txt` file per image with the same name:

```
# image: train/images/photo001.jpg
# label: train/labels/photo001.txt

# Format per line: class_id x_center y_center width height (all normalized 0-1)
0 0.45 0.62 0.30 0.48
1 0.72 0.35 0.15 0.22
```

### Dataset Configuration (data.yaml)

```yaml
# data.yaml
path: /path/to/dataset
train: train/images
val: val/images

names:
  0: cat
  1: dog
  2: bird
```

### Training

```python
from ultralytics import YOLO

# Start from a pretrained model
model = YOLO("yolov8n.pt")

# Train on custom dataset
results = model.train(
    data="data.yaml",
    epochs=100,
    imgsz=640,
    batch=16,
    lr0=0.01,
    patience=20,        # Early stopping
    augment=True,       # Built-in augmentation (mosaic, mixup, etc.)
    device=0,           # GPU index
    project="runs/detect",
    name="custom_model"
)

# Validate
metrics = model.val()
print(f"mAP@0.5: {metrics.box.map50:.4f}")
print(f"mAP@0.5:0.95: {metrics.box.map:.4f}")
```

### Export for Deployment

```python
# Export to different formats
model.export(format="onnx")       # ONNX (cross-platform)
model.export(format="torchscript") # TorchScript
model.export(format="tflite")     # TensorFlow Lite (mobile)
```

---

## Evaluation Metrics

### IoU (Intersection over Union)

Measures how well a predicted box matches the ground truth:

$$\text{IoU} = \frac{\text{Area of Overlap}}{\text{Area of Union}}$$

```python
def compute_iou(box1, box2):
    """Compute IoU between two boxes [x1, y1, x2, y2]."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    return intersection / (union + 1e-6)
```

### Interpreting IoU

| IoU Value | Quality |
|-----------|---------|
| < 0.5 | Poor (not a detection) |
| 0.5 - 0.75 | Decent |
| 0.75 - 0.9 | Good |
| > 0.9 | Excellent |

### mAP (Mean Average Precision)

1. For each class, compute **AP** (area under precision-recall curve)
2. Average AP across all classes = **mAP**

Common metrics:
- **AP@0.5**: Average Precision at IoU threshold 0.5
- **AP@0.5:0.95**: Average over IoU thresholds 0.5, 0.55, ..., 0.95 (COCO standard)

---

## Complete Inference Pipeline

```python
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import numpy as np


def detect_and_visualize(image_path, model_path="yolov8n.pt", conf_threshold=0.5):
    """Run object detection and draw results."""
    # Load model
    model = YOLO(model_path)

    # Run detection
    results = model(image_path, conf=conf_threshold)

    # Draw boxes on image
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)

    # Color map for different classes
    colors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan"]

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            cls_id = int(box.cls[0].item())
            cls_name = model.names[cls_id]
            color = colors[cls_id % len(colors)]

            # Draw bounding box
            draw.rectangle([x1, y1, x2, y2], outline=color, width=3)

            # Draw label
            label = f"{cls_name} {conf:.2f}"
            draw.text((x1, y1 - 15), label, fill=color)

    return image


# Run detection
output_image = detect_and_visualize("street.jpg", conf_threshold=0.4)
output_image.save("detections.jpg")
```

---

## Speed vs Accuracy Comparison

| Model | mAP@0.5 | FPS (GPU) | Use Case |
|-------|---------|-----------|----------|
| YOLOv8n | 37.3 | 800+ | Real-time edge devices |
| YOLOv8s | 44.9 | 500+ | Real-time applications |
| YOLOv8m | 50.2 | 200+ | Balanced performance |
| YOLOv8l | 52.9 | 120+ | High accuracy needed |
| SSD-300 | 41.2 | 150+ | Legacy systems |
| RetinaNet | 40.4 | 80+ | Research baseline |
| Faster R-CNN | 42.0 | 30+ | Maximum accuracy |

---

## Tips for Custom Detection Projects

| Tip | Details |
|-----|---------|
| Start with YOLOv8 | Best ease-of-use for custom projects |
| Minimum 100 images/class | More is always better |
| Use augmentation | Mosaic, random scale, color jitter |
| Label carefully | Bad labels = bad model |
| Check small objects | May need higher resolution input |
| Monitor mAP during training | Not just loss |
| Use validation set | Never evaluate on training data |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Object detection | Find objects + their locations (bounding boxes) |
| YOLO | One-pass detection, very fast, real-time capable |
| SSD | Multi-scale detection with default boxes |
| Focal Loss | Handles class imbalance in one-stage detectors |
| NMS | Removes duplicate detections |
| IoU | Measures box overlap quality |
| mAP | Standard detection accuracy metric |
| YOLOv8 | Current best for practical detection tasks |

One-stage detectors like YOLO are the **go-to choice** for most real-world applications due to their speed and simplicity. For the highest accuracy on difficult datasets, two-stage detectors (next lesson) may still have an edge.

---

## Try It Yourself

1. Install Ultralytics: `pip install ultralytics`
2. Run detection on any image with 3 lines of code
3. Try different model sizes (nano → extra-large) and compare speed/accuracy
4. Collect 50+ images of a custom object, annotate with [Roboflow](https://roboflow.com), train YOLOv8
5. Export to ONNX and measure inference latency on CPU vs GPU
