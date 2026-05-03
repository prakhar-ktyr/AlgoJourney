---
title: Panoptic Segmentation
---

# Panoptic Segmentation

In this lesson, you will learn about **panoptic segmentation** — the task that gives a complete understanding of every pixel in a scene.

---

## What Is Panoptic Segmentation?

Panoptic segmentation is the **unified** segmentation task:

- Every pixel gets a **class label** (what is it?)
- Every pixel gets an **instance ID** (which one is it?)

It combines semantic segmentation and instance segmentation into one coherent output.

```
Input: Photo of a street scene

Output (per pixel):
  - Pixel at (100, 200): class=car, instance=3
  - Pixel at (300, 100): class=sky, instance=N/A (stuff)
  - Pixel at (250, 350): class=person, instance=7
```

---

## "Things" vs "Stuff"

Panoptic segmentation divides the world into two categories:

### Things (Countable Objects)

Objects you can count and separate:

- Person, car, dog, bicycle, chair
- Each instance gets a unique ID
- Handled like **instance segmentation**

### Stuff (Uncountable Regions)

Amorphous regions you cannot count:

- Sky, road, grass, water, wall
- No instance IDs (just class label)
- Handled like **semantic segmentation**

### The Unified View

```
┌─────────────────────────────────────────────┐
│           Panoptic Segmentation             │
│                                             │
│  ┌───────────────┐   ┌───────────────────┐ │
│  │   Things      │   │      Stuff        │ │
│  │  (instances)  │   │   (regions)       │ │
│  │               │   │                   │ │
│  │  person #1    │   │  sky              │ │
│  │  person #2    │   │  road             │ │
│  │  car #1       │   │  grass            │ │
│  │  car #2       │   │  building         │ │
│  └───────────────┘   └───────────────────┘ │
│                                             │
│  Every pixel assigned to exactly one        │
│  segment (no overlaps, no gaps)             │
└─────────────────────────────────────────────┘
```

---

## Panoptic Quality (PQ) Metric

PQ is the standard metric for evaluating panoptic segmentation.

### Definition

$$PQ = \frac{\sum_{(p,g) \in TP} IoU(p,g)}{|TP| + \frac{1}{2}|FP| + \frac{1}{2}|FN|}$$

Where:
- $TP$ = matched segments (IoU > 0.5 between predicted $p$ and ground truth $g$)
- $FP$ = predicted segments with no match
- $FN$ = ground truth segments with no match

### Decomposition: PQ = SQ × RQ

PQ can be decomposed into two interpretable factors:

$$PQ = \underbrace{\frac{\sum_{(p,g) \in TP} IoU(p,g)}{|TP|}}_{SQ} \times \underbrace{\frac{|TP|}{|TP| + \frac{1}{2}|FP| + \frac{1}{2}|FN|}}_{RQ}$$

- **SQ (Segmentation Quality):** Average IoU of matched segments (how good are the masks?)
- **RQ (Recognition Quality):** F1 score of segment matching (how well are segments detected?)

### Computing PQ in Code

```python
import numpy as np


def compute_pq(pred_segments, gt_segments, pred_labels, gt_labels):
    """
    Compute Panoptic Quality.

    Args:
        pred_segments: [H, W] array of predicted segment IDs
        gt_segments: [H, W] array of ground truth segment IDs
        pred_labels: dict mapping segment_id → class_label
        gt_labels: dict mapping segment_id → class_label
    """
    tp = 0
    fp = 0
    fn = 0
    iou_sum = 0.0

    # Find unique segments
    pred_ids = set(np.unique(pred_segments)) - {0}  # 0 = void
    gt_ids = set(np.unique(gt_segments)) - {0}

    matched_pred = set()
    matched_gt = set()

    # Match predicted to ground truth
    for gt_id in gt_ids:
        gt_mask = (gt_segments == gt_id)
        gt_class = gt_labels[gt_id]

        best_iou = 0
        best_pred = None

        for pred_id in pred_ids:
            if pred_id in matched_pred:
                continue
            if pred_labels[pred_id] != gt_class:
                continue

            pred_mask = (pred_segments == pred_id)
            intersection = np.logical_and(gt_mask, pred_mask).sum()
            union = np.logical_or(gt_mask, pred_mask).sum()
            iou = intersection / union if union > 0 else 0

            if iou > best_iou:
                best_iou = iou
                best_pred = pred_id

        if best_iou > 0.5:
            tp += 1
            iou_sum += best_iou
            matched_pred.add(best_pred)
            matched_gt.add(gt_id)

    fp = len(pred_ids - matched_pred)
    fn = len(gt_ids - matched_gt)

    sq = iou_sum / tp if tp > 0 else 0
    rq = tp / (tp + 0.5 * fp + 0.5 * fn) if (tp + fp + fn) > 0 else 0
    pq = sq * rq

    return {"PQ": pq, "SQ": sq, "RQ": rq, "TP": tp, "FP": fp, "FN": fn}


# Example usage
result = compute_pq(pred_segs, gt_segs, pred_labels, gt_labels)
print(f"PQ: {result['PQ']:.3f}, SQ: {result['SQ']:.3f}, RQ: {result['RQ']:.3f}")
```

---

## Key Architectures

### Panoptic FPN (2019)

Adds a **semantic segmentation branch** to Mask R-CNN:

```
Image → ResNet + FPN backbone
         │
         ├──→ Instance branch (Mask R-CNN) → things
         │
         └──→ Semantic branch (lightweight) → stuff
         
         Merge results → panoptic output
```

- Simple extension of existing detection framework
- Good baseline, but two separate branches can conflict

### Panoptic-DeepLab (2020)

A **bottom-up** approach (no detection step):

- Predicts semantic segmentation for all pixels
- Predicts instance centers and offsets
- Groups pixels into instances using center predictions

**Advantage:** Single-shot, faster inference.

### MaskFormer (2021)

A **query-based** transformer approach that unifies all segmentation tasks:

```python
# MaskFormer concept
# Uses learnable queries (like DETR) to predict masks

# Architecture:
# Pixel decoder: extracts per-pixel features
# Transformer decoder: N learnable queries attend to pixel features
# Each query predicts:
#   - A class label (including "no object")
#   - A binary mask

# Key insight: both "things" and "stuff" are just mask predictions!
```

### Mask2Former (2022)

Improves MaskFormer with **masked attention**:

- Each query only attends to its predicted mask region
- Multi-scale features with deformable attention
- State-of-the-art on all three segmentation tasks

### OneFormer (2023)

One model, one forward pass, all three tasks:

- Uses a **task token** (semantic / instance / panoptic) to condition the model
- Single architecture trained on all three tasks jointly
- Achieves top results without separate models

---

## Using Detectron2 (Meta's Library)

Detectron2 is Meta's research platform for detection and segmentation.

### Setup

```python
# Install detectron2 (follow official instructions for your CUDA version)
# pip install detectron2 -f https://dl.fbaipublicfiles.com/detectron2/wheels/...

import detectron2
from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog
import cv2
import matplotlib.pyplot as plt
```

### Panoptic Inference

```python
def run_panoptic_segmentation(image_path):
    """Run panoptic segmentation with Detectron2."""
    # Configure model
    cfg = get_cfg()
    cfg.merge_from_file(
        model_zoo.get_config_file(
            "COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml"
        )
    )
    cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url(
        "COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml"
    )
    cfg.MODEL.DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    # Create predictor
    predictor = DefaultPredictor(cfg)

    # Load image
    image = cv2.imread(image_path)

    # Run panoptic segmentation
    panoptic_seg, segments_info = predictor(image)["panoptic_seg"]

    # panoptic_seg: [H, W] tensor with segment IDs
    # segments_info: list of dicts with category_id, isthing, etc.

    print(f"Found {len(segments_info)} segments:")
    for seg in segments_info:
        cat = MetadataCatalog.get(cfg.DATASETS.TRAIN[0]).thing_classes[seg["category_id"]]
        kind = "thing" if seg["isthing"] else "stuff"
        print(f"  Segment {seg['id']}: {cat} ({kind})")

    return panoptic_seg, segments_info, image


panoptic_seg, segments_info, image = run_panoptic_segmentation("street.jpg")
```

### Visualizing Results

```python
def visualize_panoptic(image, panoptic_seg, segments_info, cfg):
    """Visualize panoptic segmentation results."""
    metadata = MetadataCatalog.get(cfg.DATASETS.TRAIN[0])

    visualizer = Visualizer(
        image[:, :, ::-1],  # BGR to RGB
        metadata=metadata,
        scale=1.0
    )
    vis_output = visualizer.draw_panoptic_seg_predictions(
        panoptic_seg.to("cpu"), segments_info
    )

    plt.figure(figsize=(14, 8))
    plt.imshow(vis_output.get_image())
    plt.axis("off")
    plt.title("Panoptic Segmentation")
    plt.savefig("panoptic_result.png", dpi=150, bbox_inches="tight")
    plt.show()
```

---

## SAM (Segment Anything Model)

SAM is Meta's **foundation model** for segmentation, released in 2023.

### Key Features

- Trained on 11 million images, 1 billion masks
- **Prompt-based:** provide a point, box, or text → get a mask
- **Zero-shot:** works on objects it has never seen
- No class labels — just segments anything you point to

### Architecture

```
Image Encoder (ViT-H) → Image Embeddings
                              │
Prompt Encoder ───────────────┤
  (point/box/text)            │
                              ▼
                        Mask Decoder
                              │
                              ▼
                     Predicted Masks (3 options)
```

### Using SAM

```python
from segment_anything import sam_model_registry, SamPredictor
import cv2
import numpy as np
import matplotlib.pyplot as plt


def setup_sam(checkpoint_path, model_type="vit_h"):
    """Initialize SAM model."""
    sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
    sam.to("cuda" if torch.cuda.is_available() else "cpu")
    predictor = SamPredictor(sam)
    return predictor


def segment_with_point(predictor, image_path, point_x, point_y):
    """Segment object at a given point."""
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Set the image (computes image embedding once)
    predictor.set_image(image_rgb)

    # Provide a point prompt
    input_point = np.array([[point_x, point_y]])
    input_label = np.array([1])  # 1 = foreground

    # Predict masks
    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True  # Returns 3 mask options
    )

    # Select best mask
    best_idx = np.argmax(scores)
    best_mask = masks[best_idx]
    print(f"Best mask score: {scores[best_idx]:.3f}")

    return best_mask, image_rgb


def segment_with_box(predictor, image_path, box):
    """Segment object within a bounding box."""
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    predictor.set_image(image_rgb)

    # Box prompt: [x1, y1, x2, y2]
    input_box = np.array(box)

    masks, scores, logits = predictor.predict(
        box=input_box,
        multimask_output=False
    )

    return masks[0], image_rgb


# Example usage
predictor = setup_sam("sam_vit_h_4b8939.pth")
mask, image = segment_with_point(predictor, "photo.jpg", 300, 200)

# Visualize
plt.figure(figsize=(10, 8))
plt.imshow(image)
plt.imshow(mask, alpha=0.4, cmap="jet")
plt.title("SAM Segmentation (Point Prompt)")
plt.axis("off")
plt.show()
```

### SAM for Automatic Segmentation

```python
from segment_anything import SamAutomaticMaskGenerator


def segment_everything(sam_model, image_path):
    """Automatically segment all objects in an image."""
    mask_generator = SamAutomaticMaskGenerator(
        model=sam_model,
        points_per_side=32,        # Grid density
        pred_iou_thresh=0.88,      # Confidence threshold
        stability_score_thresh=0.95,
        min_mask_region_area=100   # Filter tiny masks
    )

    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    masks = mask_generator.generate(image_rgb)

    print(f"Generated {len(masks)} masks")
    # Each mask dict has: segmentation, area, bbox, predicted_iou, stability_score

    # Sort by area (largest first)
    masks = sorted(masks, key=lambda x: x["area"], reverse=True)

    return masks, image_rgb
```

---

## Scene Understanding Pipeline

Panoptic segmentation enables full scene understanding:

```
Raw Image
    │
    ▼
Panoptic Segmentation
    │
    ├──→ Things: car #1, car #2, person #1, ...
    ├──→ Stuff: road, sky, building, tree, ...
    │
    ▼
Scene Graph / Understanding
    │
    ├──→ Spatial relationships: "person #1 is on the road"
    ├──→ Counting: "3 cars, 2 people"
    ├──→ Layout: "road at bottom, sky at top"
    └──→ Context: "urban street scene"
```

---

## Summary

- Panoptic segmentation classifies **every pixel** with class + instance
- Divides world into **things** (countable) and **stuff** (uncountable)
- Evaluated with **Panoptic Quality (PQ)** = SQ × RQ
- Key models: Panoptic FPN → MaskFormer → Mask2Former → OneFormer
- **SAM** enables zero-shot segmentation via prompts
- Detectron2 provides ready-to-use panoptic models

---

## Exercise

Try this:

1. Use SAM to segment three different objects in an image using point prompts
2. Compare the masks from `multimask_output=True` (3 options) — when do they differ?
3. Use the automatic mask generator and count how many segments SAM finds in a complex scene
4. Think about which segments are "things" vs "stuff" — could you combine SAM with a classifier?

---
