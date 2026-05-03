---
title: Introduction to Deep Learning for CV
---

# Introduction to Deep Learning for CV

In this lesson, you will learn why deep learning revolutionized computer vision, understand the core building blocks, and get hands-on with PyTorch for image classification using a pretrained model.

---

## Why Deep Learning Changed Everything

### Before Deep Learning (Traditional Pipeline)

```
Image → Hand-crafted Features (SIFT, HOG, LBP) → Classifier (SVM, Random Forest) → Prediction
```

Problems:
- Features designed by humans — limited by human creativity
- Different features needed for different tasks
- Hard to scale to complex problems

### After Deep Learning

```
Image → Neural Network (learns features automatically) → Prediction
```

Advantages:
- **End-to-end learning**: from raw pixels to final prediction
- **Feature learning**: network discovers optimal features
- **Scalable**: more data + bigger model = better performance
- **Transfer**: features learned on one task help with others

---

## The ImageNet Moment (2012)

In 2012, **AlexNet** won the ImageNet Large Scale Visual Recognition Challenge by a massive margin:

| Year | Winner | Top-5 Error |
|------|--------|-------------|
| 2011 | Traditional (SIFT + SVM) | 25.8% |
| 2012 | **AlexNet** (CNN) | **16.4%** |
| 2014 | VGGNet | 7.3% |
| 2015 | ResNet | 3.6% |
| Human | — | ~5.1% |

This was the moment that convinced the CV community: deep learning works.

---

## Neural Network Basics Recap

### Neurons

A single neuron computes:

$$
y = \sigma(w_1 x_1 + w_2 x_2 + \ldots + w_n x_n + b) = \sigma(\mathbf{w}^T \mathbf{x} + b)
$$

Where $\sigma$ is an **activation function**.

### Common Activation Functions

| Function | Formula | Used For |
|----------|---------|----------|
| ReLU | $\max(0, x)$ | Hidden layers (most common) |
| Sigmoid | $\frac{1}{1 + e^{-x}}$ | Binary output |
| Softmax | $\frac{e^{x_i}}{\sum e^{x_j}}$ | Multi-class output |

### Layers

Neural networks stack layers of neurons:
- **Input layer**: raw data (pixels)
- **Hidden layers**: learned transformations
- **Output layer**: predictions (class probabilities)

### Training Loop

1. **Forward pass**: compute prediction from input
2. **Loss function**: measure how wrong the prediction is
3. **Backpropagation**: compute gradients (how to adjust weights)
4. **Gradient descent**: update weights to reduce loss

$$
w \leftarrow w - \eta \frac{\partial L}{\partial w}
$$

Where $\eta$ is the learning rate.

---

## Why CNNs for Images?

Regular neural networks (fully connected) don't scale to images:
- A 224×224×3 image = 150,528 inputs
- First hidden layer of 1000 neurons = 150 million parameters!

**Convolutional Neural Networks** solve this with:

### 1. Local Connectivity

Each neuron connects to only a small **local region** of the input (e.g., 3×3 patch), not the entire image.

### 2. Weight Sharing

The same filter (set of weights) is applied at every spatial position. This dramatically reduces parameters.

### 3. Translation Invariance

A cat in the top-left is detected by the same filter as a cat in the bottom-right.

---

## PyTorch for Computer Vision

### Why PyTorch?

- Dynamic computation graphs (easy debugging)
- Pythonic API
- Strong ecosystem: `torchvision`, `timm`, `detectron2`
- Used by most CV research papers

### Tensors: The Building Block

Images in PyTorch are tensors with shape: **(batch, channels, height, width)**

```python
import torch
import torchvision
from torchvision import transforms
from PIL import Image

# Load an image
img = Image.open("cat.jpg")
print(f"PIL Image size: {img.size}")  # (width, height)

# Convert to tensor
to_tensor = transforms.ToTensor()
tensor = to_tensor(img)
print(f"Tensor shape: {tensor.shape}")  # (3, H, W) — channels first!
print(f"Value range: [{tensor.min():.2f}, {tensor.max():.2f}]")  # [0, 1]

# Add batch dimension
batch = tensor.unsqueeze(0)  # (1, 3, H, W)
print(f"Batch shape: {batch.shape}")
```

### Key `torch.nn` Layers for CV

```python
import torch.nn as nn

# Convolution: extracts features
conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, padding=1)

# Batch Normalization: stabilizes training
bn = nn.BatchNorm2d(64)

# Activation: introduces non-linearity
relu = nn.ReLU(inplace=True)

# Pooling: reduces spatial size
pool = nn.MaxPool2d(kernel_size=2, stride=2)

# Fully Connected: final classification
fc = nn.Linear(in_features=512, out_features=10)
```

---

## Data Pipeline with torchvision

### Transforms

```python
from torchvision import transforms

# Training transforms (with augmentation)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),       # random crop and resize
    transforms.RandomHorizontalFlip(),       # flip left-right
    transforms.ColorJitter(0.2, 0.2, 0.2),  # color variation
    transforms.ToTensor(),                   # PIL → tensor, scale to [0,1]
    transforms.Normalize(                    # ImageNet stats
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Validation/test transforms (no augmentation)
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])
```

### Datasets

```python
from torchvision import datasets
from torch.utils.data import DataLoader

# Built-in datasets
train_dataset = datasets.CIFAR10(
    root="./data", train=True, download=True, transform=train_transform
)

val_dataset = datasets.CIFAR10(
    root="./data", train=False, download=True, transform=val_transform
)

print(f"Training samples: {len(train_dataset)}")
print(f"Validation samples: {len(val_dataset)}")
print(f"Classes: {train_dataset.classes}")
```

### DataLoader

```python
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=4,
    pin_memory=True
)

# Iterate
for images, labels in train_loader:
    print(f"Batch shape: {images.shape}")  # (32, 3, 224, 224)
    print(f"Labels shape: {labels.shape}")  # (32,)
    break
```

---

## Transfer Learning

Training a CNN from scratch requires millions of images. **Transfer learning** uses a model pretrained on ImageNet (1.2M images, 1000 classes) and adapts it to your task.

### Why It Works

- Early layers learn generic features (edges, textures) — useful everywhere
- Later layers learn task-specific features
- You only need to retrain the last few layers

---

## Code: Classify an Image with Pretrained ResNet

```python
import torch
import torchvision
from torchvision import transforms, models
from PIL import Image
import json
import urllib.request

# Load pretrained ResNet-50
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
model.eval()  # Set to evaluation mode

# Define preprocessing (must match training)
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Load and preprocess image
img = Image.open("cat.jpg").convert("RGB")
input_tensor = preprocess(img).unsqueeze(0)  # Add batch dimension

# Classify
with torch.no_grad():
    output = model(input_tensor)

# Get top-5 predictions
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5_prob, top5_idx = torch.topk(probabilities, 5)

# Load ImageNet class labels
url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
urllib.request.urlretrieve(url, "imagenet_classes.txt")
with open("imagenet_classes.txt") as f:
    categories = [line.strip() for line in f.readlines()]

# Print results
print("Top-5 Predictions:")
print("-" * 40)
for i in range(5):
    print(f"  {categories[top5_idx[i]]:<30} {top5_prob[i]:.4f}")
```

### Example Output

```
Top-5 Predictions:
----------------------------------------
  tabby cat                      0.6234
  tiger cat                      0.2156
  Egyptian cat                   0.0891
  lynx                           0.0234
  Persian cat                    0.0112
```

---

## Visualizing What the Model Sees

```python
import matplotlib.pyplot as plt
import numpy as np

def show_prediction(img_path, model, preprocess, categories):
    """Classify and display an image with predictions."""
    img = Image.open(img_path).convert("RGB")
    input_tensor = preprocess(img).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)

    probs = torch.nn.functional.softmax(output[0], dim=0)
    top5_prob, top5_idx = torch.topk(probs, 5)

    # Display
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    ax1.imshow(img)
    ax1.axis("off")
    ax1.set_title("Input Image")

    labels = [categories[idx] for idx in top5_idx]
    bars = ax2.barh(range(5), top5_prob.numpy(), color="steelblue")
    ax2.set_yticks(range(5))
    ax2.set_yticklabels(labels)
    ax2.set_xlabel("Probability")
    ax2.set_title("Top-5 Predictions")
    ax2.set_xlim(0, 1)

    plt.tight_layout()
    plt.savefig("prediction.png", dpi=100)
    plt.show()


show_prediction("cat.jpg", model, preprocess, categories)
```

---

## Classical CV vs Deep Learning: Decision Guide

| Factor | Classical CV | Deep Learning |
|--------|-------------|---------------|
| **Training data** | Works with few/no images | Needs thousands+ |
| **Compute** | CPU is fine | GPU recommended |
| **Interpretability** | Easy to understand | Black box |
| **Speed** | Often faster | Can be slow without GPU |
| **Accuracy (complex)** | Limited | State-of-the-art |
| **Custom hardware** | Runs anywhere | Needs accelerator |
| **Domain expertise** | Required (feature design) | Less needed |

### Use Classical CV When:

- You have very few labeled images
- You need to run on embedded/edge devices
- The problem is well-defined (e.g., measure a specific shape)
- You need explainability
- Real-time is critical with no GPU

### Use Deep Learning When:

- You have lots of labeled data (or can use pretrained models)
- The task is complex (recognition, detection, segmentation)
- Accuracy matters more than speed
- You have GPU access
- The problem doesn't have a clean analytical solution

---

## Setting Up Your DL Environment

```python
# Check GPU availability
import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Move model to GPU
model = model.to(device)
# Move input to GPU
input_tensor = input_tensor.to(device)
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| DL revolution | End-to-end learning beats hand-crafted features |
| ImageNet (2012) | AlexNet proved CNNs work at scale |
| CNN advantage | Local connectivity + weight sharing |
| PyTorch tensors | (batch, channels, H, W) format |
| torchvision | Datasets, transforms, pretrained models |
| Transfer learning | Reuse pretrained features for new tasks |
| Classical vs DL | Choose based on data, compute, complexity |

---

## Exercise

1. Install PyTorch: `pip install torch torchvision`
2. Load a pretrained ResNet-50 and classify 3 different images
3. Try different models (`models.mobilenet_v3_small`, `models.efficientnet_b0`) — compare speed and accuracy
4. Explore `torchvision.datasets.CIFAR10` — load and visualize a batch of images

---

**Next Lesson**: [CNNs for Computer Vision →](35-cv-cnns.md)
