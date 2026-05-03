---
title: Evaluation Metrics for CV
---

# Evaluation Metrics for CV

In this lesson, you will learn how to properly evaluate computer vision models using the right metrics for each task — classification, detection, segmentation, and generation.

---

## Why Proper Evaluation Matters

Using the wrong metric can give misleading results:

| Scenario | Bad Metric | Problem |
|----------|-----------|---------|
| Imbalanced classes (1% positive) | Accuracy | 99% by always predicting negative |
| Small objects | AP@0.5 | Too lenient, misses localization errors |
| Medical imaging | Precision only | Misses dangerous false negatives |
| Generative models | Pixel MSE | Blurry outputs score well |

> **Rule:** Always choose metrics that reflect what matters for your application.

---

## Classification Metrics

### Confusion Matrix

The foundation of classification evaluation:

|  | Predicted Positive | Predicted Negative |
|--|-------------------|-------------------|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

### Accuracy

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

- **Use when:** Classes are balanced
- **Avoid when:** Class imbalance exists (e.g., 99% negative)

### Precision

$$\text{Precision} = \frac{TP}{TP + FP}$$

"Of all predicted positives, how many are actually positive?"

- **High precision matters when:** False positives are costly (spam filtering, autonomous driving alerts)

### Recall (Sensitivity)

$$\text{Recall} = \frac{TP}{TP + FN}$$

"Of all actual positives, how many did we find?"

- **High recall matters when:** False negatives are dangerous (cancer detection, security threats)

### F1 Score

$$F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

Harmonic mean of precision and recall — balanced tradeoff.

### Top-K Accuracy

For multi-class problems, check if the correct class is in the top K predictions:

$$\text{Top-K Accuracy} = \frac{1}{N}\sum_{i=1}^{N} \mathbb{1}[y_i \in \text{top-K}(p_i)]$$

- ImageNet typically reports Top-1 and Top-5 accuracy
- Top-5 error of 3.6% means the correct class is in top 5 predictions 96.4% of the time

### Code: Classification Metrics

```python
import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)
import matplotlib.pyplot as plt
import seaborn as sns


def compute_classification_metrics(y_true, y_pred, class_names=None):
    """Compute and display classification metrics."""
    # Basic metrics
    acc = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average="macro")
    recall = recall_score(y_true, y_pred, average="macro")
    f1 = f1_score(y_true, y_pred, average="macro")

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {precision:.4f} (macro)")
    print(f"Recall:    {recall:.4f} (macro)")
    print(f"F1 Score:  {f1:.4f} (macro)")
    print()

    # Per-class report
    if class_names:
        report = classification_report(y_true, y_pred, target_names=class_names)
        print(report)

    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1}


def plot_confusion_matrix(y_true, y_pred, class_names):
    """Visualize confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)
    cm_normalized = cm.astype("float") / cm.sum(axis=1, keepdims=True)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Raw counts
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[0])
    axes[0].set_title("Confusion Matrix (Counts)")
    axes[0].set_xlabel("Predicted")
    axes[0].set_ylabel("Actual")

    # Normalized
    sns.heatmap(cm_normalized, annot=True, fmt=".2f", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[1])
    axes[1].set_title("Confusion Matrix (Normalized)")
    axes[1].set_xlabel("Predicted")
    axes[1].set_ylabel("Actual")

    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150)
    plt.show()


def top_k_accuracy(output, target, k=5):
    """Compute top-k accuracy from model outputs."""
    with torch.no_grad():
        # Get top-k predictions
        _, pred = output.topk(k, dim=1)
        # Check if target is in top-k
        correct = pred.eq(target.view(-1, 1).expand_as(pred))
        top_k_acc = correct.any(dim=1).float().mean().item()
    return top_k_acc


# Example usage
np.random.seed(42)
y_true = np.random.randint(0, 5, size=500)
y_pred = y_true.copy()
# Add some errors
noise_idx = np.random.choice(500, size=75, replace=False)
y_pred[noise_idx] = np.random.randint(0, 5, size=75)

class_names = ["cat", "dog", "bird", "car", "plane"]
metrics = compute_classification_metrics(y_true, y_pred, class_names)
plot_confusion_matrix(y_true, y_pred, class_names)
```

---

## Detection Metrics

### IoU (Intersection over Union)

The foundation of detection evaluation:

$$\text{IoU} = \frac{|A \cap B|}{|A \cup B|}$$

where $A$ is the predicted box and $B$ is the ground truth box.

- **IoU = 1.0:** Perfect overlap
- **IoU = 0.5:** Commonly used threshold for "correct" detection
- **IoU = 0.0:** No overlap at all

```python
import torch


def compute_iou(box1, box2):
    """
    Compute IoU between two boxes.
    Boxes in format [x1, y1, x2, y2].
    """
    # Intersection coordinates
    x1 = torch.max(box1[0], box2[0])
    y1 = torch.max(box1[1], box2[1])
    x2 = torch.min(box1[2], box2[2])
    y2 = torch.min(box1[3], box2[3])

    # Intersection area
    intersection = torch.clamp(x2 - x1, min=0) * torch.clamp(y2 - y1, min=0)

    # Union area
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    return intersection / (union + 1e-6)


def compute_iou_matrix(boxes1, boxes2):
    """Compute IoU between all pairs of boxes."""
    N = boxes1.shape[0]
    M = boxes2.shape[0]

    # Expand for broadcasting
    b1 = boxes1.unsqueeze(1).expand(N, M, 4)
    b2 = boxes2.unsqueeze(0).expand(N, M, 4)

    # Intersection
    x1 = torch.max(b1[..., 0], b2[..., 0])
    y1 = torch.max(b1[..., 1], b2[..., 1])
    x2 = torch.min(b1[..., 2], b2[..., 2])
    y2 = torch.min(b1[..., 3], b2[..., 3])

    intersection = torch.clamp(x2 - x1, min=0) * torch.clamp(y2 - y1, min=0)

    area1 = (b1[..., 2] - b1[..., 0]) * (b1[..., 3] - b1[..., 1])
    area2 = (b2[..., 2] - b2[..., 0]) * (b2[..., 3] - b2[..., 1])
    union = area1 + area2 - intersection

    return intersection / (union + 1e-6)


# Example
pred_box = torch.tensor([100.0, 50.0, 300.0, 400.0])
gt_box = torch.tensor([120.0, 60.0, 310.0, 380.0])
iou = compute_iou(pred_box, gt_box)
print(f"IoU: {iou:.4f}")
```

### Precision-Recall Curve and AP

Average Precision (AP) is the area under the precision-recall curve:

$$\text{AP} = \int_0^1 p(r) \, dr$$

In practice, computed using the 101-point interpolation (COCO) or all-point interpolation.

### mAP (Mean Average Precision)

$$\text{mAP} = \frac{1}{C}\sum_{c=1}^{C} \text{AP}_c$$

Average AP across all classes.

### COCO Evaluation Metrics

| Metric | IoU Threshold | Description |
|--------|--------------|-------------|
| AP | 0.50:0.95 | Primary COCO metric (averaged over 10 IoU thresholds) |
| AP@0.50 | 0.50 | PASCAL VOC metric (lenient) |
| AP@0.75 | 0.75 | Strict localization |
| AP_small | 0.50:0.95 | Objects < 32×32 pixels |
| AP_medium | 0.50:0.95 | Objects 32×32 to 96×96 |
| AP_large | 0.50:0.95 | Objects > 96×96 pixels |

### Code: Compute mAP

```python
import numpy as np
from collections import defaultdict


def compute_ap(recalls, precisions):
    """Compute AP using 101-point interpolation (COCO style)."""
    # Add sentinel values
    recalls = np.concatenate(([0.0], recalls, [1.0]))
    precisions = np.concatenate(([1.0], precisions, [0.0]))

    # Make precision monotonically decreasing
    for i in range(len(precisions) - 2, -1, -1):
        precisions[i] = max(precisions[i], precisions[i + 1])

    # 101-point interpolation
    recall_points = np.linspace(0, 1, 101)
    ap = 0.0
    for r in recall_points:
        # Find precision at this recall level
        idx = np.where(recalls >= r)[0]
        if len(idx) > 0:
            ap += precisions[idx[0]]

    return ap / 101


def compute_map(predictions, ground_truths, iou_threshold=0.5):
    """
    Compute mAP for object detection.

    predictions: list of dicts with keys: boxes, scores, labels
    ground_truths: list of dicts with keys: boxes, labels
    """
    # Group by class
    all_predictions = defaultdict(list)
    all_ground_truths = defaultdict(list)

    for img_idx, (pred, gt) in enumerate(zip(predictions, ground_truths)):
        for box, score, label in zip(pred["boxes"], pred["scores"], pred["labels"]):
            all_predictions[label].append({
                "box": box, "score": score, "img_idx": img_idx
            })
        for box, label in zip(gt["boxes"], gt["labels"]):
            all_ground_truths[label].append({
                "box": box, "img_idx": img_idx, "matched": False
            })

    # Compute AP per class
    aps = []
    for class_id in all_ground_truths.keys():
        preds = all_predictions[class_id]
        gts = all_ground_truths[class_id]
        n_gt = len(gts)

        if n_gt == 0:
            continue

        # Sort predictions by confidence (descending)
        preds.sort(key=lambda x: x["score"], reverse=True)

        tp = np.zeros(len(preds))
        fp = np.zeros(len(preds))

        for pred_idx, pred in enumerate(preds):
            best_iou = 0.0
            best_gt_idx = -1

            for gt_idx, gt in enumerate(gts):
                if gt["img_idx"] != pred["img_idx"]:
                    continue
                if gt["matched"]:
                    continue

                iou = compute_iou(
                    torch.tensor(pred["box"]),
                    torch.tensor(gt["box"])
                ).item()

                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = gt_idx

            if best_iou >= iou_threshold and best_gt_idx >= 0:
                tp[pred_idx] = 1
                gts[best_gt_idx]["matched"] = True
            else:
                fp[pred_idx] = 1

        # Compute precision and recall
        tp_cumsum = np.cumsum(tp)
        fp_cumsum = np.cumsum(fp)
        recalls = tp_cumsum / n_gt
        precisions = tp_cumsum / (tp_cumsum + fp_cumsum)

        ap = compute_ap(recalls, precisions)
        aps.append(ap)

    mAP = np.mean(aps) if aps else 0.0
    return mAP


# Example usage
predictions = [
    {"boxes": [[100, 50, 300, 400], [400, 200, 600, 500]],
     "scores": [0.9, 0.7],
     "labels": [1, 2]},
]
ground_truths = [
    {"boxes": [[110, 55, 290, 390], [410, 210, 590, 480]],
     "labels": [1, 2]},
]

mAP = compute_map(predictions, ground_truths, iou_threshold=0.5)
print(f"mAP@0.5: {mAP:.4f}")
```

---

## Segmentation Metrics

### Pixel Accuracy

$$\text{Pixel Accuracy} = \frac{\text{correctly classified pixels}}{\text{total pixels}}$$

Simple but misleading when class sizes differ greatly (e.g., road covers 70% of driving images).

### Mean IoU (mIoU)

The standard segmentation metric:

$$\text{mIoU} = \frac{1}{C}\sum_{c=1}^{C} \frac{TP_c}{TP_c + FP_c + FN_c}$$

Each class contributes equally regardless of its pixel count.

### Dice Coefficient

$$\text{Dice} = \frac{2|A \cap B|}{|A| + |B|} = \frac{2 \cdot TP}{2 \cdot TP + FP + FN}$$

- Equivalent to F1 score at the pixel level
- Popular in medical imaging
- Related to IoU: $\text{Dice} = \frac{2 \cdot \text{IoU}}{1 + \text{IoU}}$

### Boundary F1 Score

Evaluates segmentation quality at object boundaries — where precision matters most.

### Code: Segmentation Metrics

```python
import torch
import numpy as np


def compute_miou(pred_mask, gt_mask, num_classes):
    """
    Compute mean IoU for semantic segmentation.

    pred_mask: (H, W) tensor with class predictions
    gt_mask: (H, W) tensor with ground truth classes
    """
    ious = []

    for cls in range(num_classes):
        pred_cls = (pred_mask == cls)
        gt_cls = (gt_mask == cls)

        intersection = (pred_cls & gt_cls).sum().float()
        union = (pred_cls | gt_cls).sum().float()

        if union == 0:
            # Class not present in either prediction or ground truth
            continue

        iou = intersection / union
        ious.append(iou.item())

    return np.mean(ious) if ious else 0.0


def compute_dice(pred_mask, gt_mask, num_classes):
    """Compute mean Dice coefficient."""
    dices = []

    for cls in range(num_classes):
        pred_cls = (pred_mask == cls).float()
        gt_cls = (gt_mask == cls).float()

        intersection = (pred_cls * gt_cls).sum()
        total = pred_cls.sum() + gt_cls.sum()

        if total == 0:
            continue

        dice = (2.0 * intersection) / total
        dices.append(dice.item())

    return np.mean(dices) if dices else 0.0


def compute_pixel_accuracy(pred_mask, gt_mask):
    """Compute overall pixel accuracy."""
    correct = (pred_mask == gt_mask).sum().float()
    total = gt_mask.numel()
    return (correct / total).item()


def segmentation_evaluation(model, dataloader, num_classes, device="cuda"):
    """Full segmentation evaluation on a dataset."""
    model.eval()
    total_iou = []
    total_dice = []
    total_acc = []

    with torch.no_grad():
        for images, masks in dataloader:
            images = images.to(device)
            masks = masks.to(device)

            # Model prediction
            outputs = model(images)
            preds = outputs.argmax(dim=1)  # (B, H, W)

            for pred, mask in zip(preds, masks):
                total_iou.append(compute_miou(pred, mask, num_classes))
                total_dice.append(compute_dice(pred, mask, num_classes))
                total_acc.append(compute_pixel_accuracy(pred, mask))

    results = {
        "mIoU": np.mean(total_iou),
        "mean_Dice": np.mean(total_dice),
        "pixel_accuracy": np.mean(total_acc),
    }

    print(f"mIoU:           {results['mIoU']:.4f}")
    print(f"Mean Dice:      {results['mean_Dice']:.4f}")
    print(f"Pixel Accuracy: {results['pixel_accuracy']:.4f}")

    return results


# Quick example
pred = torch.tensor([
    [0, 0, 1, 1, 2],
    [0, 0, 1, 1, 2],
    [0, 1, 1, 2, 2],
    [3, 3, 1, 2, 2],
    [3, 3, 3, 2, 2],
])

gt = torch.tensor([
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 2],
    [0, 0, 1, 2, 2],
    [3, 3, 3, 2, 2],
    [3, 3, 3, 2, 2],
])

miou = compute_miou(pred, gt, num_classes=4)
dice = compute_dice(pred, gt, num_classes=4)
acc = compute_pixel_accuracy(pred, gt)
print(f"mIoU: {miou:.4f}, Dice: {dice:.4f}, Pixel Acc: {acc:.4f}")
```

---

## Perceptual Metrics (Generation)

For generative models (GANs, diffusion models), pixel-level metrics fail to capture visual quality.

### FID (Fréchet Inception Distance)

Measures distance between real and generated image distributions:

$$\text{FID} = \|\mu_r - \mu_g\|^2 + \text{Tr}\left(\Sigma_r + \Sigma_g - 2(\Sigma_r \Sigma_g)^{1/2}\right)$$

- **Lower is better** (0 = identical distributions)
- Computed using Inception-v3 features
- Standard metric for GANs and diffusion models

### IS (Inception Score)

$$\text{IS} = \exp\left(\mathbb{E}_x \left[ D_{KL}(p(y|x) \| p(y)) \right]\right)$$

- **Higher is better**
- Measures quality (sharp predictions) and diversity (uniform marginal)
- Limitation: doesn't compare to real data

### LPIPS (Learned Perceptual Image Patch Similarity)

- Computes distance in deep feature space (AlexNet, VGG)
- **Lower is better** (more perceptually similar)
- Better correlates with human judgment than PSNR/SSIM

### SSIM and PSNR

Low-level image quality metrics:

$$\text{PSNR} = 10 \cdot \log_{10}\left(\frac{MAX^2}{MSE}\right) \text{ dB}$$

$$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + c_1)(2\sigma_{xy} + c_2)}{(\mu_x^2 + \mu_y^2 + c_1)(\sigma_x^2 + \sigma_y^2 + c_2)}$$

- PSNR > 30 dB is generally good quality
- SSIM ranges from -1 to 1 (1 = identical)

---

## Metric Selection Guide

| Task | Primary Metric | Secondary Metrics |
|------|---------------|-------------------|
| Image Classification | Top-1 Accuracy | Top-5, F1 (if imbalanced) |
| Object Detection | mAP@[0.5:0.95] | AP@0.5, AP_small/medium/large |
| Instance Segmentation | Mask mAP | Box mAP, mask quality |
| Semantic Segmentation | mIoU | Pixel Acc, Dice, Boundary F1 |
| Panoptic Segmentation | PQ (Panoptic Quality) | SQ, RQ per class |
| Image Generation | FID | IS, LPIPS |
| Super-Resolution | PSNR, SSIM | LPIPS, FID |
| Depth Estimation | Abs Rel, RMSE | δ < 1.25 threshold |
| Pose Estimation | AP (OKS-based) | PCKh@0.5 |
| Face Verification | TAR@FAR | AUC, EER |

---

## Summary

- **Classification:** Use F1 for imbalanced data, accuracy for balanced
- **Detection:** mAP with appropriate IoU thresholds (COCO-style is stricter)
- **Segmentation:** mIoU is the standard; Dice for medical imaging
- **Generation:** FID captures distribution quality; LPIPS for perceptual similarity
- Always report multiple metrics to give a complete picture
- Compare against established baselines on standard benchmarks

---
