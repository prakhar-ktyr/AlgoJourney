---
title: Image Annotation & Labeling
---

# Image Annotation & Labeling

In this lesson, you will learn about the different types of image annotations, formats, tools, and best practices for creating high-quality labeled datasets for computer vision.

---

## Why Annotation?

Supervised learning — the dominant paradigm in CV — requires labeled data:

| Challenge | Impact |
|-----------|--------|
| **Quality** | Bad labels → bad models (garbage in, garbage out) |
| **Cost** | Manual labeling is expensive ($0.01–$5 per image) |
| **Scale** | Large models need millions of labeled examples |
| **Consistency** | Different annotators may label differently |

> **Note:** Annotation is often the most time-consuming and expensive part of a CV project — sometimes 80% of the total effort.

---

## Types of Annotations

### Image-Level Labels (Classification)

The simplest annotation — one label per image:

```
img_001.jpg → "cat"
img_002.jpg → "dog"
img_003.jpg → "car"
```

- **Use:** Image classification
- **Effort:** ~1–2 seconds per image
- **Example tasks:** Is this a spam image? What breed is this dog?

### Bounding Boxes (Detection)

Rectangle around each object:

```
# Format 1: (x, y, width, height) — COCO style
bbox = [120, 50, 200, 300]

# Format 2: (x1, y1, x2, y2) — Pascal VOC style
bbox = [120, 50, 320, 350]
```

- **Use:** Object detection (YOLO, Faster R-CNN)
- **Effort:** ~5–10 seconds per box
- **Limitation:** Poor for irregular shapes (L-shaped objects, crowds)

### Polygons (Instance Segmentation)

Precise object boundaries as polygon vertices:

```python
# List of (x, y) points forming the polygon
polygon = [
    [120, 50], [150, 30], [300, 45],
    [320, 200], [310, 350], [130, 340]
]
```

- **Use:** Instance segmentation (Mask R-CNN)
- **Effort:** ~30–60 seconds per object
- **Benefit:** Much more precise than bounding boxes

### Keypoints (Pose Estimation)

Named points on objects with visibility:

```python
# Human pose: 17 keypoints (COCO format)
# Each keypoint: [x, y, visibility]
# visibility: 0=not labeled, 1=labeled but occluded, 2=visible
keypoints = [
    [230, 50, 2],   # nose
    [235, 45, 2],   # left_eye
    [225, 45, 2],   # right_eye
    [245, 55, 2],   # left_ear
    [215, 55, 0],   # right_ear (not visible)
    # ... 12 more body keypoints
]
```

- **Use:** Pose estimation, action recognition
- **Effort:** ~20–40 seconds per person

### Semantic Masks (Pixel-Level)

Every pixel gets a class label:

```python
# Mask is same size as image
# Each pixel value = class ID
mask = [
    [0, 0, 0, 1, 1, 1, 2, 2],  # 0=sky, 1=building, 2=tree
    [0, 0, 1, 1, 1, 2, 2, 2],
    [3, 3, 3, 1, 1, 2, 2, 2],  # 3=road
    # ...
]
```

- **Use:** Semantic segmentation (DeepLab, SegFormer)
- **Effort:** ~5–30 minutes per image
- **Challenge:** Most expensive annotation type

### Captions (Text Descriptions)

Natural language descriptions of image content:

```
"A brown dog running through a green field with a red frisbee in its mouth"
```

- **Use:** Image captioning, CLIP training, VQA
- **Effort:** ~10–20 seconds per caption

---

## Annotation Formats

### COCO JSON Format

The most widely used format for detection and segmentation:

```python
import json

coco_annotation = {
    "info": {
        "description": "My Custom Dataset",
        "version": "1.0",
        "year": 2024
    },
    "images": [
        {
            "id": 1,
            "file_name": "image_001.jpg",
            "width": 1920,
            "height": 1080
        },
        {
            "id": 2,
            "file_name": "image_002.jpg",
            "width": 1280,
            "height": 720
        }
    ],
    "annotations": [
        {
            "id": 1,
            "image_id": 1,
            "category_id": 1,
            "bbox": [100, 200, 150, 300],  # x, y, w, h
            "area": 45000,
            "segmentation": [[100, 200, 250, 200, 250, 500, 100, 500]],
            "iscrowd": 0
        },
        {
            "id": 2,
            "image_id": 1,
            "category_id": 2,
            "bbox": [400, 100, 200, 250],
            "area": 50000,
            "segmentation": [],
            "iscrowd": 0
        }
    ],
    "categories": [
        {"id": 1, "name": "person", "supercategory": "human"},
        {"id": 2, "name": "car", "supercategory": "vehicle"},
        {"id": 3, "name": "dog", "supercategory": "animal"}
    ]
}

# Save
with open("annotations.json", "w") as f:
    json.dump(coco_annotation, f, indent=2)
```

### PASCAL VOC XML Format

One XML file per image:

```xml
<annotation>
    <folder>images</folder>
    <filename>image_001.jpg</filename>
    <size>
        <width>1920</width>
        <height>1080</height>
        <depth>3</depth>
    </size>
    <object>
        <name>person</name>
        <pose>Unspecified</pose>
        <truncated>0</truncated>
        <difficult>0</difficult>
        <bndbox>
            <xmin>100</xmin>
            <ymin>200</ymin>
            <xmax>250</xmax>
            <ymax>500</ymax>
        </bndbox>
    </object>
    <object>
        <name>car</name>
        <bndbox>
            <xmin>400</xmin>
            <ymin>100</ymin>
            <xmax>600</xmax>
            <ymax>350</ymax>
        </bndbox>
    </object>
</annotation>
```

### YOLO TXT Format

One text file per image (simplest format):

```
# class_id  center_x  center_y  width  height  (all normalized 0-1)
0 0.1823 0.3241 0.0781 0.2778
1 0.3125 0.1736 0.1042 0.2315
```

### Labelme JSON Format

Per-image JSON with polygon support:

```json
{
  "version": "5.0.1",
  "flags": {},
  "shapes": [
    {
      "label": "person",
      "points": [[100, 200], [250, 200], [250, 500], [100, 500]],
      "shape_type": "polygon"
    },
    {
      "label": "car",
      "points": [[400, 100], [600, 350]],
      "shape_type": "rectangle"
    }
  ],
  "imagePath": "image_001.jpg",
  "imageWidth": 1920,
  "imageHeight": 1080
}
```

---

## Converting Between Formats

```python
import json
import os
import xml.etree.ElementTree as ET


def voc_to_coco(voc_dir, image_dir):
    """Convert PASCAL VOC XML annotations to COCO JSON format."""
    coco = {
        "images": [],
        "annotations": [],
        "categories": []
    }

    categories = {}
    ann_id = 1

    xml_files = sorted([f for f in os.listdir(voc_dir) if f.endswith(".xml")])

    for img_id, xml_file in enumerate(xml_files, start=1):
        tree = ET.parse(os.path.join(voc_dir, xml_file))
        root = tree.getroot()

        # Image info
        filename = root.find("filename").text
        size = root.find("size")
        width = int(size.find("width").text)
        height = int(size.find("height").text)

        coco["images"].append({
            "id": img_id,
            "file_name": filename,
            "width": width,
            "height": height
        })

        # Objects
        for obj in root.findall("object"):
            name = obj.find("name").text

            # Add category if new
            if name not in categories:
                cat_id = len(categories) + 1
                categories[name] = cat_id
                coco["categories"].append({
                    "id": cat_id,
                    "name": name
                })

            bbox = obj.find("bndbox")
            xmin = float(bbox.find("xmin").text)
            ymin = float(bbox.find("ymin").text)
            xmax = float(bbox.find("xmax").text)
            ymax = float(bbox.find("ymax").text)

            # COCO uses [x, y, width, height]
            w = xmax - xmin
            h = ymax - ymin

            coco["annotations"].append({
                "id": ann_id,
                "image_id": img_id,
                "category_id": categories[name],
                "bbox": [xmin, ymin, w, h],
                "area": w * h,
                "iscrowd": 0
            })
            ann_id += 1

    return coco


def coco_to_yolo(coco_json_path, output_dir):
    """Convert COCO JSON annotations to YOLO TXT format."""
    with open(coco_json_path, "r") as f:
        coco = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    # Map image_id to image info
    images = {img["id"]: img for img in coco["images"]}

    # Group annotations by image
    img_anns = {}
    for ann in coco["annotations"]:
        img_id = ann["image_id"]
        if img_id not in img_anns:
            img_anns[img_id] = []
        img_anns[img_id].append(ann)

    # Write YOLO files
    for img_id, img_info in images.items():
        w_img = img_info["width"]
        h_img = img_info["height"]
        txt_name = os.path.splitext(img_info["file_name"])[0] + ".txt"
        txt_path = os.path.join(output_dir, txt_name)

        lines = []
        for ann in img_anns.get(img_id, []):
            x, y, w, h = ann["bbox"]
            # Convert to YOLO format (normalized center_x, center_y, w, h)
            cx = (x + w / 2) / w_img
            cy = (y + h / 2) / h_img
            nw = w / w_img
            nh = h / h_img
            # Category IDs in YOLO start from 0
            class_id = ann["category_id"] - 1
            lines.append(f"{class_id} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")

        with open(txt_path, "w") as f:
            f.write("\n".join(lines))


# Usage
coco_data = voc_to_coco("./annotations_voc/", "./images/")
with open("coco_converted.json", "w") as f:
    json.dump(coco_data, f, indent=2)

coco_to_yolo("coco_converted.json", "./labels_yolo/")
```

---

## Annotation Tools

| Tool | Type | Best For | Cost |
|------|------|----------|------|
| **LabelImg** | Desktop | Bounding boxes, quick local work | Free |
| **CVAT** | Web | All annotation types, team projects | Free (self-hosted) |
| **Labelme** | Desktop | Polygons and keypoints | Free |
| **Label Studio** | Web | Multi-task, ML-assisted | Free (community) |
| **Roboflow** | Cloud | Annotation + preprocessing + deploy | Freemium |
| **V7 (Darwin)** | Cloud | AI-assisted, video annotation | Paid |

### Choosing the Right Tool

- **Solo project, boxes only** → LabelImg
- **Team project, multiple annotation types** → CVAT or Label Studio
- **Need AI assistance** → V7 or Roboflow
- **Full pipeline (annotate → train → deploy)** → Roboflow

---

## Annotation Best Practices

### 1. Clear Annotation Guidelines

Write detailed instructions before starting:

```markdown
## Object: "Car"
- Include: sedans, SUVs, trucks, vans, buses
- Exclude: motorcycles, bicycles, toy cars
- Bounding box: tight fit, include mirrors and bumpers
- Occluded vehicles: annotate visible portion if >30% visible
- Parked cars in background: annotate if clearly recognizable
```

### 2. Quality Control

Measure **inter-annotator agreement** (IAA):

$$\text{IoU Agreement} = \frac{1}{N}\sum_{i=1}^{N} \text{IoU}(box_A^i, box_B^i)$$

- Target IoU agreement > 0.85 for boxes
- Have 10–20% of images labeled by multiple annotators
- Review disagreements to refine guidelines

### 3. Annotation Consistency

- Use reference examples for ambiguous cases
- Regular calibration sessions with the team
- Version control your annotation guidelines

### 4. Edge Cases Documentation

Document decisions on tricky scenarios:

- Heavily occluded objects: annotate or skip?
- Reflections in mirrors or water
- Objects on screens (TV showing a car)
- Truncated objects at image edges

---

## Semi-Automatic Annotation

### Using SAM (Segment Anything)

```python
import torch
import numpy as np
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image

# Load SAM model
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h.pth")
sam.to(device="cuda")
predictor = SamPredictor(sam)

# Load image
image = np.array(Image.open("photo.jpg"))
predictor.set_image(image)

# Provide a point prompt (click on object)
input_point = np.array([[500, 375]])  # x, y coordinate
input_label = np.array([1])           # 1 = foreground

# Get mask prediction
masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=True
)

# Use best mask
best_mask = masks[np.argmax(scores)]
print(f"Mask shape: {best_mask.shape}")
print(f"Confidence: {scores.max():.3f}")
```

### Pre-annotate + Correct Workflow

```python
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2
from torchvision.transforms import functional as F
from PIL import Image

# Load pretrained detector
model = fasterrcnn_resnet50_fpn_v2(pretrained=True)
model.eval()

# Run inference
image = Image.open("unlabeled_image.jpg")
image_tensor = F.to_tensor(image).unsqueeze(0)

with torch.no_grad():
    predictions = model(image_tensor)[0]

# Filter high-confidence predictions
confidence_threshold = 0.7
keep = predictions["scores"] > confidence_threshold

pre_annotations = {
    "boxes": predictions["boxes"][keep].tolist(),
    "labels": predictions["labels"][keep].tolist(),
    "scores": predictions["scores"][keep].tolist()
}

print(f"Pre-annotated {len(pre_annotations['boxes'])} objects")
print("Send to annotators for review and correction")
```

### Active Learning: Smart Sample Selection

```python
import torch
import numpy as np
from torch.utils.data import DataLoader


def select_uncertain_samples(model, unlabeled_loader, n_samples=100):
    """Select samples where model is most uncertain."""
    model.eval()
    uncertainties = []

    with torch.no_grad():
        for idx, (images, _) in enumerate(unlabeled_loader):
            outputs = model(images.cuda())

            # Entropy-based uncertainty
            probs = torch.softmax(outputs, dim=1)
            entropy = -(probs * torch.log(probs + 1e-8)).sum(dim=1)
            uncertainties.extend(
                [(idx * len(images) + i, ent.item())
                 for i, ent in enumerate(entropy)]
            )

    # Sort by uncertainty (highest first)
    uncertainties.sort(key=lambda x: x[1], reverse=True)

    # Return indices of most uncertain samples
    selected_indices = [idx for idx, _ in uncertainties[:n_samples]]
    return selected_indices


# Usage
uncertain_samples = select_uncertain_samples(model, unlabeled_loader, n_samples=200)
print(f"Selected {len(uncertain_samples)} samples for annotation")
print("These are the samples where the model is least confident")
```

---

## Annotation Speed Comparison

| Annotation Type | Time per Image | Images per Hour | Cost per 1K Images |
|----------------|---------------|-----------------|-------------------|
| Image label | 2–3 sec | 1,200–1,800 | $5–10 |
| Bounding box (5 objects) | 30–60 sec | 60–120 | $50–100 |
| Polygon (5 objects) | 3–5 min | 12–20 | $200–400 |
| Keypoints (1 person) | 20–40 sec | 90–180 | $30–60 |
| Semantic mask | 10–30 min | 2–6 | $500–1,500 |
| Caption | 10–20 sec | 180–360 | $20–40 |

> **Tip:** Use semi-automatic methods to reduce annotation time by 50–80%. Pre-annotate with a model, then have humans correct mistakes.

---

## Summary

- Annotation is the bridge between raw images and trained models
- Choose the annotation type that matches your task (boxes for detection, masks for segmentation)
- Use standardized formats (COCO JSON for flexibility, YOLO for simplicity)
- Invest in clear guidelines and quality control
- Leverage semi-automatic tools (SAM, pre-annotation, active learning) to reduce cost
- Always measure inter-annotator agreement to ensure label quality

---
