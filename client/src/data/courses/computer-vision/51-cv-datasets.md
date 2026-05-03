---
title: CV Datasets & Benchmarks
---

# CV Datasets & Benchmarks

In this lesson, you will learn about the most important datasets and benchmarks that drive progress in computer vision research and applications.

---

## Why Datasets Matter

Datasets are the foundation of modern computer vision:

| Purpose | Description |
|---------|-------------|
| **Training** | Models learn patterns from labeled examples |
| **Evaluation** | Fair comparison between different methods |
| **Benchmarking** | Track progress over time on standardized tasks |
| **Reproducibility** | Same data ensures comparable results |

> **Note:** The quality and diversity of your training data matters more than model architecture in many practical applications.

---

## Image Classification Datasets

### MNIST

The "Hello World" of computer vision:

- **Size:** 70,000 images (60K train, 10K test)
- **Resolution:** 28×28 grayscale
- **Classes:** 10 (digits 0–9)
- **Use:** Prototyping, sanity checking pipelines

### CIFAR-10 / CIFAR-100

Tiny natural images for quick experiments:

- **CIFAR-10:** 60,000 images, 32×32 RGB, 10 classes (airplane, car, bird, cat, deer, dog, frog, horse, ship, truck)
- **CIFAR-100:** Same size, 100 fine-grained classes grouped into 20 superclasses
- **Use:** Algorithm development, architecture search

### ImageNet (ILSVRC)

The benchmark that launched the deep learning revolution:

- **Size:** 1.2 million training images, 50K validation, 100K test
- **Resolution:** Variable (typically resized to 224×224)
- **Classes:** 1,000 object categories
- **Impact:** AlexNet (2012) won ILSVRC and sparked the CNN era

Top-1 accuracy progression on ImageNet:

| Year | Model | Top-1 Accuracy |
|------|-------|---------------|
| 2012 | AlexNet | 63.3% |
| 2014 | VGGNet | 74.4% |
| 2015 | ResNet | 76.3% |
| 2019 | EfficientNet | 84.4% |
| 2021 | ViT-G | 90.5% |

### Places365

- **Task:** Scene recognition (kitchen, bedroom, forest, etc.)
- **Size:** 1.8M images, 365 scene categories
- **Use:** Understanding environments and contexts

### iNaturalist

- **Task:** Fine-grained species classification
- **Size:** 675K images, 5,000+ species
- **Challenge:** Long-tailed distribution (some species have very few examples)

---

## Object Detection Datasets

### PASCAL VOC

The pioneering detection benchmark:

- **Size:** ~11,500 images (VOC2007 + VOC2012)
- **Classes:** 20 (person, car, dog, chair, etc.)
- **Annotations:** Bounding boxes + segmentation masks
- **Metric:** mAP@0.5

### COCO (Common Objects in Context)

The current standard for detection and segmentation:

- **Size:** 330,000 images (118K train, 5K val, 40K test)
- **Classes:** 80 object categories
- **Annotations:** Bounding boxes + instance masks + keypoints + captions
- **Metric:** AP@[0.5:0.95] (stricter than VOC)

### Open Images

Massive-scale detection:

- **Size:** 9 million images
- **Classes:** 600 object classes
- **Annotations:** 16M bounding boxes (machine-verified)
- **Unique:** Visual relationships between objects

### LVIS (Large Vocabulary Instance Segmentation)

- **Size:** 164K images
- **Classes:** 1,200+ categories
- **Challenge:** Long-tail distribution — some classes have <10 examples
- **Use:** Testing robustness on rare categories

---

## Segmentation Datasets

### Cityscapes

Urban scene understanding for autonomous driving:

- **Size:** 5,000 fine + 20,000 coarse annotations
- **Resolution:** 2048×1024
- **Classes:** 30 (road, car, pedestrian, building, etc.)
- **Use:** Self-driving, urban planning

### ADE20K

Dense scene parsing:

- **Size:** 25,210 images
- **Classes:** 150 semantic categories
- **Coverage:** Both stuff (sky, road) and things (car, person)
- **Use:** Scene understanding benchmarks (used by Swin, SegFormer)

### COCO-Stuff

COCO extended with "stuff" annotations:

- **Original COCO:** 80 "thing" classes (countable objects)
- **COCO-Stuff:** Adds 91 "stuff" classes (sky, grass, wall, floor)
- **Total:** 171 classes covering every pixel

---

## Specialized Datasets

### KITTI

Autonomous driving benchmark suite:

- **Modalities:** Stereo images, LiDAR, GPS/IMU
- **Tasks:** Depth estimation, optical flow, 3D detection, tracking
- **Size:** 7,481 training images with LiDAR point clouds

### CelebA

Face analysis:

- **Size:** 202,599 celebrity face images
- **Annotations:** 40 binary attributes (smiling, glasses, male, etc.)
- **Use:** Face generation, attribute prediction, face editing

### LFW (Labeled Faces in the Wild)

- **Task:** Face verification (same person or different?)
- **Size:** 13,233 images of 5,749 people
- **Benchmark:** 99.8%+ accuracy achieved by modern methods

### SUN RGB-D

- **Task:** Indoor scene understanding with depth
- **Size:** 10,335 RGB-D images
- **Annotations:** 3D bounding boxes, room layout, semantic labels

---

## Dataset Formats

Different datasets use different annotation formats:

### COCO JSON

```json
{
  "images": [
    {"id": 1, "file_name": "img001.jpg", "width": 640, "height": 480}
  ],
  "annotations": [
    {"id": 1, "image_id": 1, "category_id": 3,
     "bbox": [100, 50, 200, 300], "area": 60000, "iscrowd": 0}
  ],
  "categories": [
    {"id": 3, "name": "car", "supercategory": "vehicle"}
  ]
}
```

### PASCAL VOC XML

```xml
<annotation>
  <filename>img001.jpg</filename>
  <size><width>640</width><height>480</height></size>
  <object>
    <name>car</name>
    <bndbox>
      <xmin>100</xmin><ymin>50</ymin>
      <xmax>300</xmax><ymax>350</ymax>
    </bndbox>
  </object>
</annotation>
```

### YOLO TXT

```
# class_id  center_x  center_y  width  height (all normalized 0-1)
3 0.3125 0.3333 0.3125 0.625
```

---

## Loading Datasets in PyTorch

### Standard Datasets with torchvision

```python
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Define transforms
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Load CIFAR-10
train_dataset = datasets.CIFAR10(
    root="./data",
    train=True,
    download=True,
    transform=transform
)

test_dataset = datasets.CIFAR10(
    root="./data",
    train=False,
    download=True,
    transform=transform
)

# Create DataLoaders
train_loader = DataLoader(
    train_dataset,
    batch_size=64,
    shuffle=True,
    num_workers=4,
    pin_memory=True
)

test_loader = DataLoader(
    test_dataset,
    batch_size=64,
    shuffle=False,
    num_workers=4
)

# Iterate
for images, labels in train_loader:
    print(f"Batch shape: {images.shape}")  # [64, 3, 224, 224]
    print(f"Labels shape: {labels.shape}")  # [64]
    break
```

### Loading COCO Detection

```python
from torchvision.datasets import CocoDetection
import torchvision.transforms.v2 as T

# COCO detection dataset
coco_train = CocoDetection(
    root="./coco/train2017",
    annFile="./coco/annotations/instances_train2017.json",
    transforms=T.Compose([
        T.ToImage(),
        T.ToDtype(torch.float32, scale=True),
    ])
)

# Access one sample
image, target = coco_train[0]
print(f"Image shape: {image.shape}")
print(f"Number of objects: {len(target)}")
print(f"First object category: {target[0]['category_id']}")
print(f"First object bbox: {target[0]['bbox']}")
```

### Loading PASCAL VOC

```python
from torchvision.datasets import VOCDetection

voc_train = VOCDetection(
    root="./VOCdevkit",
    year="2012",
    image_set="train",
    download=True
)

image, target = voc_train[0]
objects = target["annotation"]["object"]
for obj in objects:
    name = obj["name"]
    bbox = obj["bndbox"]
    print(f"{name}: ({bbox['xmin']}, {bbox['ymin']}) -> ({bbox['xmax']}, {bbox['ymax']})")
```

### Custom Dataset Class

```python
import os
import json
from PIL import Image
from torch.utils.data import Dataset


class CustomDetectionDataset(Dataset):
    """Custom dataset for object detection in COCO format."""

    def __init__(self, images_dir, annotations_file, transforms=None):
        self.images_dir = images_dir
        self.transforms = transforms

        # Load COCO-format annotations
        with open(annotations_file, "r") as f:
            coco_data = json.load(f)

        self.images = coco_data["images"]
        self.annotations = coco_data["annotations"]
        self.categories = {
            cat["id"]: cat["name"]
            for cat in coco_data["categories"]
        }

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
        # Load image
        img_info = self.images[idx]
        img_path = os.path.join(self.images_dir, img_info["file_name"])
        image = Image.open(img_path).convert("RGB")

        # Get annotations for this image
        img_id = img_info["id"]
        anns = self.img_to_anns.get(img_id, [])

        # Convert to tensors
        boxes = []
        labels = []
        for ann in anns:
            x, y, w, h = ann["bbox"]
            boxes.append([x, y, x + w, y + h])  # Convert to xyxy
            labels.append(ann["category_id"])

        target = {
            "boxes": torch.tensor(boxes, dtype=torch.float32),
            "labels": torch.tensor(labels, dtype=torch.int64),
            "image_id": torch.tensor([img_id]),
        }

        if self.transforms:
            image = self.transforms(image)

        return image, target


# Usage
dataset = CustomDetectionDataset(
    images_dir="./my_dataset/images",
    annotations_file="./my_dataset/annotations.json",
    transforms=transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
)

loader = DataLoader(dataset, batch_size=4, shuffle=True,
                    collate_fn=lambda batch: tuple(zip(*batch)))
```

---

## Benchmarks and Leaderboards

Track state-of-the-art results:

| Platform | URL | Coverage |
|----------|-----|----------|
| Papers With Code | paperswithcode.com | All tasks, all datasets |
| COCO Leaderboard | cocodataset.org | Detection, segmentation |
| ImageNet Results | image-net.org | Classification |

---

## Dataset Size vs Model Performance

The relationship between data and performance follows a power law:

$$\text{Error} \propto \frac{1}{N^{\alpha}}$$

where $N$ is the dataset size and $\alpha$ depends on the task (typically 0.1–0.5).

Key insights:

- **10x more data** typically reduces error by 20–40%
- **Diminishing returns** set in — going from 1M to 10M helps less than 100K to 1M
- **Data quality > quantity** — clean labels matter more than sheer volume
- **Pre-training data** can be noisy (ImageNet-21K, JFT-300M) if fine-tuning data is clean

---

## Summary

| Dataset | Task | Size | Classes |
|---------|------|------|---------|
| MNIST | Classification | 70K | 10 |
| CIFAR-10 | Classification | 60K | 10 |
| ImageNet | Classification | 1.2M | 1,000 |
| PASCAL VOC | Detection | 11K | 20 |
| COCO | Detection + Seg | 330K | 80 |
| Open Images | Detection | 9M | 600 |
| Cityscapes | Segmentation | 5K fine | 30 |
| ADE20K | Segmentation | 25K | 150 |
| KITTI | Autonomous driving | 7.5K | Multiple |
| CelebA | Face attributes | 202K | 40 attrs |

Choose your dataset based on: task type, required scale, annotation quality, and domain relevance.

---
