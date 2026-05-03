---
title: History of Computer Vision
---

# History of Computer Vision

Computer vision has evolved over six decades — from simple edge detectors to foundation models that understand and generate images. Understanding this history helps you appreciate why modern approaches work and what problems they solve.

---

## The Beginning: 1960s

### Lawrence Roberts — "Blocks World" (1963)

The birth of computer vision is often traced to Lawrence Roberts' PhD thesis at MIT. He demonstrated that a computer could extract 3D geometric information from 2D photographs of simple block shapes.

**Key Idea:** Detect edges in images → infer 3D structure from 2D lines.

```python
import numpy as np
import cv2
import matplotlib.pyplot as plt

# Simulating Roberts' approach: simple edge detection on geometric shapes
# Create a simple "blocks world" image
image = np.ones((300, 400), dtype=np.uint8) * 200

# Draw a cube-like shape (2D projection)
pts = np.array([[100, 200], [200, 250], [300, 200], [200, 150]], np.int32)
cv2.fillPoly(image, [pts], 150)

# Top face
pts_top = np.array([[100, 200], [150, 130], [250, 130], [200, 150]], np.int32)
cv2.fillPoly(image, [pts_top], 180)

# Side face
pts_side = np.array([[200, 150], [250, 130], [350, 180], [300, 200]], np.int32)
cv2.fillPoly(image, [pts_side], 120)

# Roberts Cross edge detection (one of the earliest edge detectors)
kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)

edges_x = cv2.filter2D(image.astype(np.float32), -1, kernel_x)
edges_y = cv2.filter2D(image.astype(np.float32), -1, kernel_y)
edges = np.sqrt(edges_x**2 + edges_y**2).astype(np.uint8)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].imshow(image, cmap="gray")
axes[0].set_title("Blocks World (1963)")
axes[1].imshow(edges, cmap="gray")
axes[1].set_title("Roberts Cross Edges")
for ax in axes:
    ax.axis("off")
plt.tight_layout()
plt.show()
```

### The "Summer Vision Project" (1966)

Seymour Papert at MIT proposed that computer vision could be solved in one summer by undergraduate students. The project aimed to build a system that could identify objects in images.

> **Spoiler:** It took 60+ years and we're still working on it! This shows how deeply complex "seeing" actually is.

---

## Computational Theory: 1970s

### David Marr's Framework (1970s–1982)

David Marr proposed the most influential theoretical framework for understanding vision. His book *"Vision"* (1982) laid out three levels of visual processing:

| Level | Name | Description |
|-------|------|-------------|
| 1 | **Primal Sketch** | Raw edges, blobs, textures from intensity changes |
| 2 | **2.5D Sketch** | Surface orientation, depth, discontinuities (viewer-centered) |
| 3 | **3D Model** | Full 3D object representation (object-centered) |

**Marr's key insight:** Vision is an information-processing task that can be studied at computational, algorithmic, and implementation levels.

```
Input Image → Primal Sketch → 2.5D Sketch → 3D Model
   (pixels)    (edges/blobs)   (surfaces)    (objects)
```

---

## Edge Detection Era: 1970s–1980s

Edge detection was the first major practical achievement in computer vision.

### Sobel Operator (1968)

Irwin Sobel developed gradient-based edge detection using two 3×3 kernels:

$$G_x = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix}, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1 \end{bmatrix}$$

The gradient magnitude:

$$G = \sqrt{G_x^2 + G_y^2}$$

### Marr-Hildreth Edge Detector (1980)

Used Laplacian of Gaussian (LoG) — smooth first, then find zero crossings:

$$\nabla^2 G(x, y) * I(x, y)$$

### Canny Edge Detector (1986)

John Canny developed what is still considered the "optimal" edge detector:

1. Gaussian smoothing (reduce noise)
2. Gradient computation (find edge strength and direction)
3. Non-maximum suppression (thin edges)
4. Double thresholding + hysteresis (connect edges)

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Demonstrate the evolution of edge detection
image = np.zeros((300, 300), dtype=np.uint8)
cv2.rectangle(image, (50, 50), (150, 150), 200, -1)
cv2.circle(image, (220, 200), 60, 180, -1)

# Add some noise to make it realistic
noise = np.random.normal(0, 10, image.shape).astype(np.uint8)
noisy_image = cv2.add(image, noise)

# 1. Roberts Cross (1963)
roberts_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
roberts_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
rx = cv2.filter2D(noisy_image.astype(np.float32), -1, roberts_x)
ry = cv2.filter2D(noisy_image.astype(np.float32), -1, roberts_y)
roberts_edges = np.sqrt(rx**2 + ry**2).astype(np.uint8)

# 2. Sobel (1968)
sobel_x = cv2.Sobel(noisy_image, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(noisy_image, cv2.CV_64F, 0, 1, ksize=3)
sobel_edges = np.sqrt(sobel_x**2 + sobel_y**2)
sobel_edges = (sobel_edges / sobel_edges.max() * 255).astype(np.uint8)

# 3. Canny (1986)
canny_edges = cv2.Canny(noisy_image, 50, 150)

fig, axes = plt.subplots(1, 4, figsize=(14, 3))
axes[0].imshow(noisy_image, cmap="gray")
axes[0].set_title("Original (with noise)")
axes[1].imshow(roberts_edges, cmap="gray")
axes[1].set_title("Roberts Cross (1963)")
axes[2].imshow(sobel_edges, cmap="gray")
axes[2].set_title("Sobel (1968)")
axes[3].imshow(canny_edges, cmap="gray")
axes[3].set_title("Canny (1986)")
for ax in axes:
    ax.axis("off")
plt.tight_layout()
plt.show()
```

---

## Motion & Flow: 1980s

### Optical Flow

Two foundational algorithms for estimating motion between frames:

- **Horn-Schunck (1981):** Global method — assumes smooth flow everywhere
- **Lucas-Kanade (1981):** Local method — assumes constant flow in small patches

The **optical flow constraint equation:**

$$I_x u + I_y v + I_t = 0$$

Where $I_x$, $I_y$ are spatial gradients, $I_t$ is the temporal gradient, and $(u, v)$ is the flow vector.

---

## Recognition Era: 1990s

### Eigenfaces (1991)

Turk & Pentland applied PCA (Principal Component Analysis) to face recognition:
- Represent faces as linear combinations of "eigenfaces"
- Reduce dimensionality while preserving identity information

### Active Contours / Snakes (1988)

Kass, Witkin, and Terzopoulos introduced deformable models that "snap" to object boundaries by minimizing an energy function:

$$E_{snake} = E_{internal} + E_{external}$$

### Viola-Jones Face Detector (2001)

The first real-time face detection algorithm, using:
- **Haar-like features** — rectangular patterns
- **Integral image** — fast feature computation
- **AdaBoost cascade** — efficient rejection of non-faces

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Viola-Jones is still available in OpenCV!
# Load the pre-trained cascade classifier
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Create a synthetic face-like image for demonstration
image = np.ones((300, 300, 3), dtype=np.uint8) * 200

# Draw a simple face
cv2.ellipse(image, (150, 150), (80, 100), 0, 0, 360, (180, 150, 120), -1)
cv2.circle(image, (120, 130), 15, (255, 255, 255), -1)  # Left eye
cv2.circle(image, (180, 130), 15, (255, 255, 255), -1)  # Right eye
cv2.circle(image, (120, 130), 7, (50, 50, 50), -1)      # Left pupil
cv2.circle(image, (180, 130), 7, (50, 50, 50), -1)      # Right pupil
cv2.ellipse(image, (150, 180), (30, 15), 0, 0, 180, (150, 100, 100), 2)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.1, 4)

print(f"Viola-Jones detector found {len(faces)} face(s)")
print("This 2001 algorithm ran in REAL-TIME — revolutionary for its era!")
```

---

## Feature Engineering Era: 1999–2012

### SIFT — Scale-Invariant Feature Transform (1999)

David Lowe's SIFT was groundbreaking — features that are invariant to:
- **Scale** — works at any zoom level
- **Rotation** — works at any orientation
- **Illumination** — robust to lighting changes

### HOG — Histogram of Oriented Gradients (2005)

Dalal & Triggs used HOG features for pedestrian detection:
- Divide image into cells
- Compute gradient histograms per cell
- Concatenate into a descriptor
- Train a linear SVM classifier

### Bag of Visual Words (2003–2006)

Inspired by NLP: treat image features like words in a document.
1. Extract local features (SIFT) from all training images
2. Cluster into a "visual vocabulary" (k-means)
3. Represent each image as a histogram of visual words
4. Classify using SVM

### Deformable Parts Model (2008–2010)

Felzenszwalb et al. — model objects as collections of deformable parts:
- Root filter captures overall shape
- Part filters capture local appearance
- Spatial model allows deformation

---

## The ImageNet Moment: 2009–2012

### ImageNet (2009)

Fei-Fei Li led the creation of **ImageNet** — a dataset of 14+ million labeled images across 20,000+ categories. The annual ImageNet Large Scale Visual Recognition Challenge (ILSVRC) benchmarked progress.

### AlexNet (2012) — The Deep Learning Revolution

Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton won ILSVRC 2012 with a **CNN** that crushed all competitors:

| Year | Winner | Top-5 Error |
|------|--------|-------------|
| 2011 | Hand-crafted features | 25.8% |
| **2012** | **AlexNet (CNN)** | **16.4%** |
| 2013 | ZFNet | 11.7% |
| 2014 | GoogLeNet / VGG | 6.7% |
| 2015 | ResNet | 3.6% |

> **This single result changed the entire field.** Within 2 years, nearly all CV research shifted to deep learning.

---

## Deep Learning Era: 2014–2020

### Key Architectures

| Year | Model | Innovation |
|------|-------|-----------|
| 2014 | **VGGNet** | Deeper networks (16–19 layers) with small 3×3 filters |
| 2014 | **GoogLeNet** | Inception modules — parallel convolutions at multiple scales |
| 2015 | **ResNet** | Skip connections — enabled 152+ layer networks |
| 2015 | **YOLO** | Real-time object detection (single forward pass) |
| 2017 | **Mask R-CNN** | Instance segmentation (detect + segment each object) |
| 2018 | **EfficientNet** | Compound scaling — balance depth, width, resolution |

### The Detection Revolution

Object detection went from slow (R-CNN: 47 seconds/image) to real-time (YOLO: 45 FPS):

```
R-CNN (2014) → Fast R-CNN (2015) → Faster R-CNN (2015) → YOLO (2015)
  47 sec          2.3 sec            0.2 sec             0.02 sec
```

---

## Transformer Era: 2020–Present

### Vision Transformer — ViT (2020)

Dosovitskiy et al. showed that **pure transformers** (no convolutions!) can match or beat CNNs on image classification:
- Split image into 16×16 patches
- Treat patches as "tokens" (like words in NLP)
- Apply standard transformer architecture

### Foundation Models (2021+)

| Year | Model | Achievement |
|------|-------|-------------|
| 2021 | **CLIP** | Connect images and text in shared embedding space |
| 2021 | **DALL-E** | Generate images from text descriptions |
| 2022 | **Stable Diffusion** | Open-source text-to-image generation |
| 2023 | **SAM** | Segment anything with zero-shot prompting |
| 2023 | **DINOv2** | Self-supervised visual features (no labels needed) |
| 2024 | **GPT-4V** | Multimodal understanding (text + images) |

---

## Complete Timeline

```
1963  Roberts "Blocks World"
1966  MIT Summer Vision Project
1970s David Marr's computational theory
1980  Marr-Hildreth edge detector
1981  Optical Flow (Horn-Schunck, Lucas-Kanade)
1986  Canny edge detector
1988  Active Contours (Snakes)
1991  Eigenfaces
1999  SIFT
2001  Viola-Jones face detection
2005  HOG + SVM pedestrian detection
2009  ImageNet dataset
2012  AlexNet → Deep Learning revolution
2014  VGGNet, GoogLeNet, R-CNN
2015  ResNet, YOLO, Faster R-CNN
2017  Mask R-CNN
2020  Vision Transformer (ViT)
2021  CLIP, DALL-E
2022  Stable Diffusion
2023  SAM, DINOv2
2024  GPT-4V, multimodal foundation models
```

---

## The Key Insight

The most important transition in CV history:

| Before 2012 | After 2012 |
|------------|-----------|
| **Hand-crafted features** | **Learned features** |
| Humans design feature extractors | Networks learn what features matter |
| SIFT, HOG, Haar wavelets | Convolutional filters, attention |
| Domain expertise required | Data + compute required |
| Task-specific pipelines | End-to-end training |

---

## Code: Evolution in Action

Let's see the contrast between classical and modern approaches:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Create a test image with shapes
image = np.ones((300, 400, 3), dtype=np.uint8) * 240
cv2.rectangle(image, (30, 30), (130, 130), (0, 0, 200), -1)
cv2.circle(image, (250, 80), 50, (0, 180, 0), -1)
cv2.fillPoly(image, [np.array([[320, 180], [380, 280], [260, 280]])], (200, 0, 0))

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Classical approach (1980s-2000s): Manual feature pipeline
# Step 1: Edge detection
edges = cv2.Canny(gray, 50, 150)
# Step 2: Find contours
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# Step 3: Hand-crafted shape classification
result_classical = image.copy()
for cnt in contours:
    area = cv2.contourArea(cnt)
    if area < 100:
        continue
    perimeter = cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, 0.04 * perimeter, True)
    x, y, w, h = cv2.boundingRect(cnt)

    # Hand-crafted rules!
    if len(approx) == 3:
        label = "Triangle"
    elif len(approx) == 4:
        label = "Rectangle"
    elif len(approx) > 6:
        label = "Circle"
    else:
        label = "Unknown"

    cv2.drawContours(result_classical, [cnt], -1, (0, 255, 0), 2)
    cv2.putText(result_classical, label, (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

# Display results
fig, axes = plt.subplots(1, 3, figsize=(12, 4))
axes[0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
axes[0].set_title("Input Image")
axes[1].imshow(edges, cmap="gray")
axes[1].set_title("Edge Detection (Classical)")
axes[2].imshow(cv2.cvtColor(result_classical, cv2.COLOR_BGR2RGB))
axes[2].set_title("Shape Classification\n(Hand-crafted Rules)")
for ax in axes:
    ax.axis("off")
plt.tight_layout()
plt.show()

print("Classical approach: Edges → Contours → Hand-crafted rules")
print("Modern approach: Raw pixels → CNN → Learned classification")
print("\nThe modern approach learns WHAT features matter from data!")
```

---

## Key Takeaways

1. CV started with simple geometric reasoning in the **1960s**
2. **Edge detection** was the first practical success (Sobel, Canny)
3. The **1990s–2000s** focused on hand-crafted features (SIFT, HOG)
4. **2012 AlexNet** triggered the deep learning revolution
5. We've gone from hand-crafted features to **learned features**
6. The current era uses **foundation models** that generalize across tasks
7. Each breakthrough solved limitations of the previous approach

---

## Next Lesson

Now that you know where CV came from, let's set up your development environment! In the next lesson, we'll install Python, OpenCV, and all the tools you need to start coding.
