---
title: Computer Vision Home
---

# Computer Vision

Welcome to the **Computer Vision** course! Computer Vision (CV) is one of the most exciting fields in artificial intelligence — teaching machines to see, interpret, and understand visual information from the world around us.

From self-driving cars to medical imaging, from augmented reality to quality inspection in factories, computer vision is transforming industries and creating new possibilities every day.

---

## What You Will Learn

In this comprehensive course, you will master:

- **Image Processing** — manipulate, filter, and transform images
- **Feature Detection** — find keypoints, edges, and patterns
- **Object Detection** — locate and classify objects in images
- **Image Segmentation** — pixel-level scene understanding
- **Deep Learning for CV** — CNNs, transformers, and modern architectures
- **Video Analysis** — motion estimation, tracking, and temporal understanding
- **3D Vision** — depth, stereo, and camera geometry
- **Generative Models** — GANs, style transfer, and image synthesis

---

## Course Roadmap

This course is divided into logical sections that build upon each other:

### Section 1: Foundations (Lessons 1–10)

| Lesson | Topic |
|--------|-------|
| 1 | Course Home & Overview |
| 2 | What is Computer Vision? |
| 3 | History of Computer Vision |
| 4 | Python & OpenCV Setup |
| 5 | Digital Images & Pixels |
| 6 | Color Spaces (RGB, HSV, LAB) |
| 7 | Image I/O: Reading, Writing, Displaying |
| 8 | Drawing on Images |
| 9 | Region of Interest (ROI) & Cropping |
| 10 | Image Arithmetic & Blending |

### Section 2: Image Processing (Lessons 11–20)

| Lesson | Topic |
|--------|-------|
| 11 | Image Filtering & Convolution |
| 12 | Blurring & Smoothing |
| 13 | Edge Detection (Sobel, Canny) |
| 14 | Thresholding Techniques |
| 15 | Morphological Operations |
| 16 | Contour Detection & Analysis |
| 17 | Image Gradients |
| 18 | Histogram & Equalization |
| 19 | Geometric Transformations |
| 20 | Image Pyramids & Scaling |

### Section 3: Features & Matching (Lessons 21–26)

| Lesson | Topic |
|--------|-------|
| 21 | Corner Detection (Harris, Shi-Tomasi) |
| 22 | SIFT & SURF Features |
| 23 | ORB & Binary Descriptors |
| 24 | Feature Matching & Homography |
| 25 | Image Stitching & Panoramas |
| 26 | Hough Transform (Lines & Circles) |

### Section 4: Video Analysis (Lessons 27–30)

| Lesson | Topic |
|--------|-------|
| 27 | Video Capture & Processing |
| 28 | Background Subtraction |
| 29 | Optical Flow |
| 30 | Object Tracking |

### Section 5: 3D Vision (Lessons 31–33)

| Lesson | Topic |
|--------|-------|
| 31 | Camera Model & Calibration |
| 32 | Stereo Vision & Depth Maps |
| 33 | Epipolar Geometry |

### Section 6: Deep Learning for CV (Lessons 34–45)

| Lesson | Topic |
|--------|-------|
| 34 | Introduction to CNNs |
| 35 | CNN Architectures (LeNet, AlexNet, VGG) |
| 36 | Modern Architectures (ResNet, Inception) |
| 37 | Transfer Learning |
| 38 | Object Detection: R-CNN Family |
| 39 | Object Detection: YOLO & SSD |
| 40 | Semantic Segmentation |
| 41 | Instance Segmentation (Mask R-CNN) |
| 42 | Face Detection & Recognition |
| 43 | Pose Estimation |
| 44 | Optical Character Recognition (OCR) |
| 45 | Image Captioning |

### Section 7: Generative CV (Lessons 46–49)

| Lesson | Topic |
|--------|-------|
| 46 | Generative Adversarial Networks (GANs) |
| 47 | Style Transfer |
| 48 | Super-Resolution |
| 49 | Diffusion Models |

### Section 8: Practical & Advanced (Lessons 50–65)

| Lesson | Topic |
|--------|-------|
| 50 | Data Augmentation |
| 51 | Vision Transformers (ViT) |
| 52 | Multimodal Models (CLIP) |
| 53 | Segment Anything (SAM) |
| 54 | Model Optimization & Quantization |
| 55 | Edge Deployment (ONNX, TensorRT) |
| 56 | Building a CV Pipeline |
| 57 | Image Search & Retrieval |
| 58 | Video Understanding |
| 59 | Medical Image Analysis |
| 60 | Autonomous Driving CV |
| 61 | Document Analysis |
| 62 | Satellite & Aerial Imagery |
| 63 | Ethics in Computer Vision |
| 64 | CV Interview Preparation |
| 65 | Capstone Project |

---

## Prerequisites

Before starting this course, you should have:

- **Basic Python** — variables, functions, loops, classes
- **Basic Math** — linear algebra concepts (matrices, vectors), basic calculus (derivatives)
- **Command Line** — navigating directories, running scripts

> **Note:** No prior computer vision experience is needed! We start from the very basics.

---

## Tools & Libraries

Throughout this course, we will use:

| Tool | Purpose |
|------|---------|
| **Python 3.9+** | Programming language |
| **OpenCV** | Core computer vision library |
| **NumPy** | Numerical array operations |
| **Matplotlib** | Visualization & plotting |
| **PyTorch** | Deep learning framework |
| **torchvision** | CV datasets & pretrained models |
| **Pillow (PIL)** | Image I/O utilities |
| **scikit-image** | Additional image processing |

---

## How to Use This Course

1. **Read each lesson sequentially** — concepts build on previous ones
2. **Run every code example** — type it out, don't just copy-paste
3. **Experiment** — modify parameters, try different images
4. **Complete exercises** — practice solidifies understanding
5. **Build projects** — apply what you learn to real problems

> **Tip:** Keep a notebook of key functions and their parameters. OpenCV has hundreds of functions — you'll want a quick reference!

---

## Quick Example: Load and Display an Image

Let's get a taste of what you'll be doing throughout this course. Here's how to load and display an image with OpenCV:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Load an image from file
image = cv2.imread("cat.jpg")

# Check if image loaded successfully
if image is None:
    print("Error: Could not load image!")
else:
    # Print image properties
    print(f"Image shape: {image.shape}")
    print(f"Image dtype: {image.dtype}")
    print(f"Image size: {image.size} pixels")

    # OpenCV loads images in BGR format
    # Convert to RGB for matplotlib display
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Display the image
    plt.figure(figsize=(8, 6))
    plt.imshow(image_rgb)
    plt.title("My First CV Image")
    plt.axis("off")
    plt.show()
```

**What's happening here:**

1. `cv2.imread()` reads the image file into a NumPy array
2. The image shape tells us (height, width, channels)
3. `cv2.cvtColor()` converts from BGR (OpenCV default) to RGB (Matplotlib)
4. `plt.imshow()` displays the image

---

## Create an Image from Scratch

You can also create images programmatically:

```python
import numpy as np
import matplotlib.pyplot as plt

# Create a 300x400 black image with 3 color channels
image = np.zeros((300, 400, 3), dtype=np.uint8)

# Draw a red rectangle (remember: BGR in OpenCV, RGB in NumPy here)
image[50:150, 100:300] = [255, 0, 0]  # Red

# Draw a green circle area
for y in range(300):
    for x in range(400):
        if (x - 200)**2 + (y - 200)**2 < 50**2:
            image[y, x] = [0, 255, 0]  # Green

# Display
plt.figure(figsize=(8, 6))
plt.imshow(image)
plt.title("Image Created from Scratch")
plt.axis("off")
plt.show()
```

---

## What Makes This Course Different

- **Hands-on from day one** — every concept comes with runnable code
- **Visual explanations** — we show results at every step
- **Math when needed** — formulas explained intuitively with $$KaTeX$$
- **Real-world focus** — practical applications, not just theory
- **Progressive difficulty** — from loading images to deploying models

---

## Ready to Start?

In the next lesson, we'll explore what computer vision actually is, how it differs from human vision, and the different types of tasks that CV systems can perform.

Let's teach machines to see! 👁️

---

## Basic Image Operations Preview

Here's a sneak peek at some operations you'll master:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Create a sample image with a gradient
height, width = 300, 400
image = np.zeros((height, width, 3), dtype=np.uint8)

# Fill with a blue-to-green gradient
for y in range(height):
    for x in range(width):
        image[y, x] = [
            int(255 * (1 - x / width)),    # Blue decreases left to right
            int(255 * (x / width)),         # Green increases left to right
            int(128 * (y / height))         # Red increases top to bottom
        ]

# Draw some shapes on the image
cv2.rectangle(image, (50, 50), (150, 150), (255, 255, 255), 2)
cv2.circle(image, (300, 150), 60, (0, 0, 255), -1)
cv2.line(image, (200, 250), (380, 280), (255, 255, 0), 3)

# Convert and display
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
plt.figure(figsize=(8, 5))
plt.imshow(image_rgb)
plt.title("Preview: Drawing & Color Operations")
plt.axis("off")
plt.show()
```

---

## Edge Detection Preview

One of the most fundamental CV operations — finding boundaries:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Create an image with sharp edges
image = np.zeros((300, 300), dtype=np.uint8)
cv2.rectangle(image, (50, 50), (250, 250), 200, -1)
cv2.circle(image, (150, 150), 60, 100, -1)

# Apply Canny edge detection
edges = cv2.Canny(image, 50, 150)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].imshow(image, cmap="gray")
axes[0].set_title("Original")
axes[1].imshow(edges, cmap="gray")
axes[1].set_title("Edges Detected")
for ax in axes:
    ax.axis("off")
plt.tight_layout()
plt.show()
```

---

## Feature Detection Preview

Finding interesting points in images for matching:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Create an image with corners and textures
image = np.ones((300, 400), dtype=np.uint8) * 180

# Add some geometric shapes (good for corner detection)
cv2.rectangle(image, (30, 30), (120, 120), 80, -1)
cv2.rectangle(image, (160, 50), (280, 180), 50, -1)
cv2.fillPoly(image, [np.array([[320, 30], [380, 130], [260, 130]])], 100)

# Detect corners using Shi-Tomasi
corners = cv2.goodFeaturesToTrack(image, maxCorners=20, qualityLevel=0.01,
                                  minDistance=20)

# Draw corners
display = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
if corners is not None:
    for corner in corners:
        x, y = corner.ravel().astype(int)
        cv2.circle(display, (x, y), 5, (0, 0, 255), -1)

plt.figure(figsize=(8, 5))
plt.imshow(cv2.cvtColor(display, cv2.COLOR_BGR2RGB))
plt.title(f"Shi-Tomasi Corner Detection ({len(corners)} corners found)")
plt.axis("off")
plt.show()
```

---

## Quick Reference

```python
# Essential imports you'll use throughout this course
import cv2                          # OpenCV
import numpy as np                  # NumPy
import matplotlib.pyplot as plt     # Matplotlib

# Check versions
print(f"OpenCV version: {cv2.__version__}")
print(f"NumPy version: {np.__version__}")

# Read an image
image = cv2.imread("photo.jpg")

# Convert color spaces
rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Resize
resized = cv2.resize(image, (width, height))

# Save
cv2.imwrite("output.jpg", image)
```

---

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|-----------------|
| Displaying BGR with Matplotlib | Colors appear swapped | Convert with `cv2.cvtColor()` |
| Modifying image without `.copy()` | Changes affect original | Use `region = image[y1:y2, x1:x2].copy()` |
| Mixing up (x, y) and (row, col) | Wrong pixel accessed | Remember: `image[y, x]` = `image[row, col]` |
| Forgetting uint8 overflow | 200 + 100 = 44 (wraps!) | Use `cv2.add()` for safe math |
| Using `cv2.imshow()` in notebook | Crashes or freezes | Use `plt.imshow()` instead |

---

## Course Resources

- [OpenCV Documentation](https://docs.opencv.org/)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [Papers With Code — CV](https://paperswithcode.com/area/computer-vision)
- [OpenCV Tutorials](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [CS231n: CNNs for Visual Recognition](http://cs231n.stanford.edu/)

> **Remember:** The best way to learn computer vision is by doing. Load images, write code, break things, and fix them. That's how you become a CV engineer!
