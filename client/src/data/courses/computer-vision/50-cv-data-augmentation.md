---
title: Data Augmentation for CV
---

# Data Augmentation for CV

**Data augmentation** artificially increases your training dataset by applying random transformations to existing images. More diverse data means better generalization and less overfitting — especially when you have limited training samples.

---

## Why Augment?

| Problem | How Augmentation Helps |
|---------|----------------------|
| Small dataset | Creates more training examples |
| Overfitting | Forces model to learn general features |
| Class imbalance | Generate more minority class samples |
| Domain shift | Simulate real-world variations |
| Robustness | Model handles varied inputs at test time |

> **Rule of thumb:** Data augmentation is the single most effective regularization technique for computer vision.

---

## Geometric Augmentations

These change the spatial arrangement of pixels:

```python
import torch
import torchvision.transforms.v2 as T
from PIL import Image

# Load an example image
image = Image.open("cat.jpg")

# --- Geometric Transforms ---

# Random horizontal flip (50% chance)
flip_h = T.RandomHorizontalFlip(p=0.5)

# Random vertical flip (less common, useful for satellite/medical)
flip_v = T.RandomVerticalFlip(p=0.5)

# Random rotation (up to ±30 degrees)
rotate = T.RandomRotation(degrees=30)

# Random resized crop: crop random area, resize to target
crop = T.RandomResizedCrop(size=(224, 224), scale=(0.7, 1.0))

# Random affine: rotation + translation + scale + shear
affine = T.RandomAffine(
    degrees=15,          # Rotation range
    translate=(0.1, 0.1),  # Horizontal/vertical shift (fraction)
    scale=(0.9, 1.1),     # Scale range
    shear=10              # Shear angle
)

# Random perspective distortion
perspective = T.RandomPerspective(distortion_scale=0.3, p=0.5)

# Apply transforms
augmented = flip_h(image)
print(f"Original size: {image.size}")
print(f"Augmented size: {augmented.size}")
```

### When to Use Each

| Transform | Good For | Avoid When |
|-----------|----------|-----------|
| Horizontal flip | Most natural images | Text, directional objects |
| Vertical flip | Satellite, microscopy | Faces, scenes with gravity |
| Rotation | Objects at any angle | Architecture, text |
| Crop | All tasks | Very small objects |
| Perspective | Street scenes, documents | Already normalized images |

---

## Color Augmentations

These change pixel values without moving them:

```python
# --- Color/Photometric Transforms ---

# Color jitter: randomly change brightness, contrast, saturation, hue
color_jitter = T.ColorJitter(
    brightness=0.3,    # ±30% brightness
    contrast=0.3,      # ±30% contrast
    saturation=0.3,    # ±30% saturation
    hue=0.1            # ±10% hue shift
)

# Random grayscale conversion (10% chance)
grayscale = T.RandomGrayscale(p=0.1)

# Gaussian blur
blur = T.GaussianBlur(kernel_size=5, sigma=(0.1, 2.0))

# Random posterize (reduce color bits)
posterize = T.RandomPosterize(bits=4, p=0.3)

# Random solarize (invert pixels above threshold)
solarize = T.RandomSolarize(threshold=128, p=0.3)

# Random adjust sharpness
sharpness = T.RandomAdjustSharpness(sharpness_factor=2, p=0.3)

# Apply
jittered = color_jitter(image)
```

### Adding Noise

```python
import numpy as np

class GaussianNoise:
    """Add random Gaussian noise to an image tensor."""

    def __init__(self, mean=0.0, std=0.05):
        self.mean = mean
        self.std = std

    def __call__(self, tensor):
        noise = torch.randn_like(tensor) * self.std + self.mean
        return torch.clamp(tensor + noise, 0.0, 1.0)


# Usage in a transform pipeline
noise_transform = GaussianNoise(std=0.03)
```

---

## Building a Transform Pipeline

```python
# Standard training pipeline for ImageNet-style classification
train_transforms = T.Compose([
    T.RandomResizedCrop(224, scale=(0.6, 1.0)),
    T.RandomHorizontalFlip(p=0.5),
    T.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.1),
    T.RandomGrayscale(p=0.1),
    T.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])

# Validation: no augmentation, just resize and normalize
val_transforms = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])

# Apply to dataset
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader

train_dataset = ImageFolder("data/train", transform=train_transforms)
val_dataset = ImageFolder("data/val", transform=val_transforms)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
```

> **Important:** Never augment validation/test data! Only augment training data.

---

## Advanced Augmentations

### Cutout (Random Erasing)

Randomly mask out a rectangular region of the image:

```python
# Cutout / Random Erasing
# Forces the model to not rely on any single region
random_erase = T.RandomErasing(
    p=0.5,             # 50% chance
    scale=(0.02, 0.33),  # Erase 2-33% of image area
    ratio=(0.3, 3.3),    # Aspect ratio of erased region
    value=0              # Fill with black (or 'random')
)

# Apply after ToTensor()
train_transforms_cutout = T.Compose([
    T.RandomResizedCrop(224),
    T.RandomHorizontalFlip(),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    random_erase,  # Applied to tensor
])
```

### CutMix

Replace a random region with a patch from another image, and **mix the labels** proportionally:

```python
def cutmix(images, labels, alpha=1.0):
    """Apply CutMix augmentation to a batch.

    Replaces a random region of one image with a patch from another,
    and mixes the labels proportionally to the area.
    """
    batch_size = images.size(0)
    indices = torch.randperm(batch_size)

    # Sample lambda from Beta distribution
    lam = np.random.beta(alpha, alpha)

    # Get random bounding box
    _, _, h, w = images.shape
    cut_ratio = np.sqrt(1.0 - lam)
    cut_h = int(h * cut_ratio)
    cut_w = int(w * cut_ratio)

    # Random center
    cy = np.random.randint(h)
    cx = np.random.randint(w)

    # Bounding box (clipped to image)
    y1 = np.clip(cy - cut_h // 2, 0, h)
    y2 = np.clip(cy + cut_h // 2, 0, h)
    x1 = np.clip(cx - cut_w // 2, 0, w)
    x2 = np.clip(cx + cut_w // 2, 0, w)

    # Apply CutMix
    mixed_images = images.clone()
    mixed_images[:, :, y1:y2, x1:x2] = images[indices, :, y1:y2, x1:x2]

    # Adjust lambda based on actual area
    lam = 1 - (y2 - y1) * (x2 - x1) / (h * w)

    # Mix labels
    mixed_labels = lam * labels + (1 - lam) * labels[indices]
    return mixed_images, mixed_labels
```

### MixUp

Blend two images and their labels with a random ratio:

$$\tilde{x} = \lambda x_1 + (1-\lambda) x_2$$
$$\tilde{y} = \lambda y_1 + (1-\lambda) y_2$$

Where $\lambda \sim \text{Beta}(\alpha, \alpha)$, typically $\alpha = 0.2$.

```python
def mixup(images, labels, alpha=0.2):
    """Apply MixUp augmentation to a batch.

    Blends pairs of images and labels linearly.
    """
    batch_size = images.size(0)
    indices = torch.randperm(batch_size)

    # Sample mixing coefficient
    lam = np.random.beta(alpha, alpha)

    # Linear interpolation
    mixed_images = lam * images + (1 - lam) * images[indices]
    mixed_labels = lam * labels + (1 - lam) * labels[indices]

    return mixed_images, mixed_labels


# Usage in training loop
for images, labels in train_loader:
    # Convert labels to one-hot for mixing
    labels_onehot = torch.zeros(len(labels), num_classes)
    labels_onehot.scatter_(1, labels.unsqueeze(1), 1)

    # Apply MixUp
    mixed_images, mixed_labels = mixup(images, labels_onehot, alpha=0.2)

    outputs = model(mixed_images)
    loss = F.cross_entropy(outputs, mixed_labels)
    # ... backprop
```

### Mosaic (YOLO-style)

Combine 4 images into one, creating a rich training sample with multiple objects at different scales:

```python
def mosaic_augmentation(images, labels, target_size=640):
    """Combine 4 images into a mosaic (used in YOLOv4/v5)."""
    s = target_size
    # Random center point for the mosaic
    yc = int(np.random.uniform(s * 0.3, s * 0.7))
    xc = int(np.random.uniform(s * 0.3, s * 0.7))

    mosaic = np.zeros((s, s, 3), dtype=np.uint8)

    # Place 4 images in quadrants around (xc, yc)
    placements = [
        (0, 0, xc, yc),        # Top-left
        (xc, 0, s, yc),        # Top-right
        (0, yc, xc, s),        # Bottom-left
        (xc, yc, s, s),        # Bottom-right
    ]

    all_labels = []
    for i, (x1, y1, x2, y2) in enumerate(placements):
        img = images[i]
        h, w = y2 - y1, x2 - x1
        resized = cv2.resize(img, (w, h))
        mosaic[y1:y2, x1:x2] = resized

        # Transform labels (bounding boxes) to mosaic coordinates
        # ... adjust bbox coordinates based on placement

    return mosaic, all_labels
```

---

## Auto-Augmentation

Let algorithms find the best augmentation policy:

### AutoAugment

Uses reinforcement learning to search for the best augmentation policy on a proxy task. Found policies like:

```python
# AutoAugment for ImageNet (predefined policy)
auto_augment = T.AutoAugment(policy=T.AutoAugmentPolicy.IMAGENET)

# For CIFAR-10
auto_augment_cifar = T.AutoAugment(policy=T.AutoAugmentPolicy.CIFAR10)
```

### RandAugment

Simpler approach: apply N random operations at magnitude M:

```python
# RandAugment: N operations, magnitude M (0-30)
rand_augment = T.RandAugment(
    num_ops=2,       # Apply 2 random transforms
    magnitude=9      # Strength (0-30, 9 is a good default)
)

# Much simpler to tune than AutoAugment!
# Just two hyperparameters: N and M
train_transforms_ra = T.Compose([
    T.RandomResizedCrop(224),
    T.RandomHorizontalFlip(),
    rand_augment,
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
```

### TrivialAugment

Even simpler — apply one random operation per image with random magnitude:

```python
# TrivialAugment: one random operation, random magnitude
trivial_augment = T.TrivialAugmentWide()

# No hyperparameters to tune!
# Often performs as well as RandAugment
```

---

## Albumentations Library

**Albumentations** is a fast augmentation library that properly handles bounding boxes, masks, and keypoints:

```python
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

# Basic classification pipeline
train_transform = A.Compose([
    A.RandomResizedCrop(height=224, width=224, scale=(0.7, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(
        brightness_limit=0.3,
        contrast_limit=0.3,
        p=0.5
    ),
    A.HueSaturationValue(
        hue_shift_limit=20,
        sat_shift_limit=30,
        val_shift_limit=20,
        p=0.5
    ),
    A.GaussNoise(var_limit=(10, 50), p=0.3),
    A.GaussianBlur(blur_limit=(3, 7), p=0.3),
    A.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

# Apply
image = cv2.imread("image.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
augmented = train_transform(image=image)
tensor_image = augmented["image"]
print(f"Augmented tensor shape: {tensor_image.shape}")
```

### Albumentations with Bounding Boxes

```python
# Object detection: transforms must apply to bboxes too!
detection_transform = A.Compose([
    A.RandomResizedCrop(height=416, width=416, scale=(0.5, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.4),
    A.HueSaturationValue(p=0.4),
    A.Blur(blur_limit=3, p=0.2),
    A.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
], bbox_params=A.BboxParams(
    format="pascal_voc",     # [x_min, y_min, x_max, y_max]
    min_visibility=0.3,       # Drop boxes that are mostly cropped
    label_fields=["class_labels"]
))

# Apply with bounding boxes
image = cv2.imread("detection_image.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

bboxes = [[50, 30, 200, 180], [300, 100, 450, 350]]  # Pascal VOC format
class_labels = [0, 1]  # Cat, Dog

augmented = detection_transform(
    image=image,
    bboxes=bboxes,
    class_labels=class_labels
)

aug_image = augmented["image"]
aug_bboxes = augmented["bboxes"]       # Transformed bounding boxes!
aug_labels = augmented["class_labels"]

print(f"Original boxes: {len(bboxes)}")
print(f"Augmented boxes: {len(aug_bboxes)}")
```

### Albumentations with Segmentation Masks

```python
# Segmentation: geometric transforms must apply to mask too
segmentation_transform = A.Compose([
    A.RandomResizedCrop(height=256, width=256, scale=(0.5, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ElasticTransform(alpha=120, sigma=6, p=0.3),
    A.GridDistortion(p=0.3),
    A.RandomBrightnessContrast(p=0.4),  # Only applies to image!
    A.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

image = cv2.imread("medical_image.png")
mask = cv2.imread("segmentation_mask.png", cv2.IMREAD_GRAYSCALE)

augmented = segmentation_transform(image=image, mask=mask)
aug_image = augmented["image"]  # Transformed image
aug_mask = augmented["mask"]    # Same transform applied to mask!

print(f"Image shape: {aug_image.shape}")
print(f"Mask shape: {aug_mask.shape}")
```

---

## Task-Specific Considerations

| Task | What Must Transform Together |
|------|------------------------------|
| Classification | Image only |
| Detection | Image + bounding boxes |
| Segmentation | Image + pixel masks |
| Keypoint detection | Image + point coordinates |
| Instance seg. | Image + masks + boxes |

---

## Augmentation Strategy Tips

### Do's

1. **Start simple**: flip + crop + color jitter covers most cases
2. **Match test conditions**: if test images might be blurry, add blur augmentation
3. **Use RandAugment**: easy to tune (N=2, M=9 is a great starting point)
4. **Increase augmentation for small datasets**: more augmentation compensates for less data
5. **Validate with original images**: always evaluate on clean, unaugmented data

### Don'ts

1. **Don't over-augment**: too aggressive transforms make learning impossible
2. **Don't augment validation**: evaluation should reflect real performance
3. **Don't use inappropriate transforms**: vertical flip for faces, rotation for text
4. **Don't forget label transforms**: bboxes and masks must transform with images
5. **Don't mix augmentation with preprocessing**: keep them separate and clear

---

## Quick Reference: Common Pipelines

```python
# Classification (standard)
T.Compose([T.RandomResizedCrop(224), T.RandomHorizontalFlip(),
           T.RandAugment(2, 9), T.ToTensor(), T.Normalize(...)])

# Detection (with Albumentations)
A.Compose([A.RandomResizedCrop(416, 416), A.HorizontalFlip(),
           A.RandomBrightnessContrast(), A.Normalize(), ToTensorV2()],
          bbox_params=A.BboxParams(format="pascal_voc"))

# Medical imaging (careful augmentation)
A.Compose([A.RandomCrop(256, 256), A.HorizontalFlip(),
           A.ElasticTransform(alpha=50), A.GaussNoise(),
           A.Normalize(), ToTensorV2()])

# Self-supervised (aggressive augmentation)
T.Compose([T.RandomResizedCrop(224, scale=(0.2, 1.0)),
           T.RandomHorizontalFlip(), T.ColorJitter(0.8, 0.8, 0.8, 0.2),
           T.RandomGrayscale(p=0.2), T.GaussianBlur(23),
           T.ToTensor(), T.Normalize(...)])
```

---

## Try It Yourself

1. Apply different augmentations to one image and visualize results side-by-side
2. Train a classifier with and without augmentation — compare accuracy
3. Try CutMix vs MixUp — which works better on your dataset?
4. Use Albumentations with bounding boxes for a detection task
5. Experiment with RandAugment magnitudes (5, 9, 15) — find the sweet spot

---

## Summary

- **Data augmentation** is essential for training robust CV models
- **Geometric transforms** (flip, rotate, crop) simulate viewpoint changes
- **Color transforms** (jitter, grayscale, noise) simulate lighting/camera changes
- **Advanced methods** (CutMix, MixUp, Mosaic) create novel training samples
- **Auto-augmentation** (RandAugment, TrivialAugment) removes manual tuning
- **Albumentations** properly handles bounding boxes, masks, and keypoints
- Always transform annotations (boxes, masks) along with images
- Never augment validation/test data

Congratulations on completing this section! You now have a solid foundation in image generation, manipulation, super-resolution, restoration, and augmentation techniques.
