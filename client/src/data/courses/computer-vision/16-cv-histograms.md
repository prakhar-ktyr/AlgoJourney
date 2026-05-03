---
title: Histograms & Equalization
---

# Histograms & Equalization

In this lesson you will learn how to analyze and improve image contrast using **histograms**. A histogram tells you the distribution of pixel intensities in an image — one of the most fundamental tools in computer vision.

---

## What Is a Histogram?

A histogram is a graph showing how many pixels exist for each intensity value (0–255 for an 8-bit image).

| Property | Description |
|----------|-------------|
| X-axis | Pixel intensity (0 = black, 255 = white) |
| Y-axis | Number of pixels with that intensity |
| Dark image | Histogram concentrated on the left |
| Bright image | Histogram concentrated on the right |
| Low contrast | Narrow, tall peak |
| High contrast | Spread across the full range |

---

## Computing Histograms with OpenCV

The primary function is `cv2.calcHist()`:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

# Load image in grayscale
img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Calculate histogram
# Parameters: [image], [channel], mask, [bins], [range]
hist = cv2.calcHist([img], [0], None, [256], [0, 256])

print(f"Histogram shape: {hist.shape}")  # (256, 1)
print(f"Total pixels: {hist.sum()}")     # width * height
```

### Parameter Breakdown

| Parameter | Meaning | Example |
|-----------|---------|---------|
| `[img]` | Source image (wrapped in list) | `[gray_img]` |
| `[0]` | Channel index | `[0]` for grayscale, `[1]` for green |
| `mask` | Region of interest (or `None`) | Binary mask image |
| `[256]` | Number of bins | `[256]` for full detail |
| `[0, 256]` | Pixel value range | `[0, 256]` for 8-bit |

---

## Computing Histograms with NumPy

NumPy provides a simpler alternative:

```python
import numpy as np
import cv2

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# NumPy histogram (returns bin edges too)
hist_values, bin_edges = np.histogram(img.flatten(), bins=256, range=[0, 256])

print(f"Hist values shape: {hist_values.shape}")  # (256,)
print(f"Bin edges shape: {bin_edges.shape}")       # (257,)

# Even faster: np.bincount (only for integer arrays)
hist_fast = np.bincount(img.flatten(), minlength=256)
```

> **Tip:** `np.bincount()` is significantly faster than both `cv2.calcHist()` and `np.histogram()` for integer pixel values.

---

## Plotting Histograms with Matplotlib

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Method 1: Using cv2.calcHist
hist = cv2.calcHist([img], [0], None, [256], [0, 256])

plt.figure(figsize=(10, 4))
plt.title("Grayscale Histogram")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.plot(hist, color="black")
plt.xlim([0, 256])
plt.grid(True, alpha=0.3)
plt.show()

# Method 2: Direct Matplotlib histogram
plt.figure(figsize=(10, 4))
plt.hist(img.flatten(), bins=256, range=[0, 256], color="gray", edgecolor="none")
plt.title("Grayscale Histogram (plt.hist)")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.show()
```

---

## Color Histograms

For color images, compute a separate histogram for each channel:

```python
import cv2
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg")  # BGR format

# Define colors for each channel
colors = ("b", "g", "r")
channel_names = ("Blue", "Green", "Red")

plt.figure(figsize=(10, 5))
plt.title("Color Histogram (BGR)")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")

for i, (color, name) in enumerate(zip(colors, channel_names)):
    hist = cv2.calcHist([img], [i], None, [256], [0, 256])
    plt.plot(hist, color=color, label=name)

plt.xlim([0, 256])
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### Masked Histogram

Compute a histogram for only a region of interest:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Create a circular mask
mask = np.zeros(img.shape[:2], dtype=np.uint8)
center = (img.shape[1] // 2, img.shape[0] // 2)
radius = min(img.shape[:2]) // 3
cv2.circle(mask, center, radius, 255, -1)

# Histogram of masked region only
hist_masked = cv2.calcHist([img], [0], mask, [256], [0, 256])
hist_full = cv2.calcHist([img], [0], None, [256], [0, 256])

plt.figure(figsize=(10, 4))
plt.plot(hist_full, label="Full Image", color="gray")
plt.plot(hist_masked, label="Masked Region", color="blue")
plt.legend()
plt.title("Masked vs Full Histogram")
plt.show()
```

---

## Histogram Equalization

Histogram equalization **spreads** pixel intensities evenly across the full range (0–255), improving contrast in low-contrast images.

### How It Works

The transformation uses the **Cumulative Distribution Function (CDF)**:

$$T(k) = \text{round}\left(\frac{(L-1)}{M \times N} \sum_{j=0}^{k} h(j)\right)$$

Where:
- $L$ = number of intensity levels (256)
- $M \times N$ = total pixels
- $h(j)$ = histogram value at intensity $j$
- $T(k)$ = new intensity for pixels with original intensity $k$

### OpenCV Implementation

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

# Load low-contrast grayscale image
img = cv2.imread("low_contrast.jpg", cv2.IMREAD_GRAYSCALE)

# Apply histogram equalization
equalized = cv2.equalizeHist(img)

# Compare results
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

axes[0, 0].imshow(img, cmap="gray")
axes[0, 0].set_title("Original")

axes[0, 1].imshow(equalized, cmap="gray")
axes[0, 1].set_title("Equalized")

axes[1, 0].hist(img.flatten(), bins=256, range=[0, 256], color="gray")
axes[1, 0].set_title("Original Histogram")

axes[1, 1].hist(equalized.flatten(), bins=256, range=[0, 256], color="gray")
axes[1, 1].set_title("Equalized Histogram")

plt.tight_layout()
plt.show()
```

### Manual Equalization (Understanding the CDF)

```python
import cv2
import numpy as np

img = cv2.imread("low_contrast.jpg", cv2.IMREAD_GRAYSCALE)

# Step 1: Compute histogram
hist = cv2.calcHist([img], [0], None, [256], [0, 256]).flatten()

# Step 2: Compute CDF
cdf = hist.cumsum()

# Step 3: Normalize CDF to [0, 255]
cdf_normalized = (cdf - cdf.min()) * 255 / (cdf.max() - cdf.min())
cdf_normalized = cdf_normalized.astype(np.uint8)

# Step 4: Map original intensities to new values
equalized_manual = cdf_normalized[img]

# Verify it matches OpenCV
equalized_cv = cv2.equalizeHist(img)
print(f"Results match: {np.array_equal(equalized_manual, equalized_cv)}")
```

---

## CLAHE (Contrast Limited Adaptive Histogram Equalization)

Global equalization can **over-amplify noise** and produce unnatural results. CLAHE applies equalization **locally** in small tiles and limits contrast amplification.

### Why CLAHE Is Better

| Feature | Global Equalization | CLAHE |
|---------|-------------------|-------|
| Scope | Entire image | Small tiles |
| Noise | Can amplify noise | Limits noise amplification |
| Contrast | Uniform everywhere | Adaptive to local content |
| Use case | Simple enhancement | Medical imaging, photographs |

### Implementation

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Global equalization
global_eq = cv2.equalizeHist(img)

# CLAHE
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_result = clahe.apply(img)

# Compare all three
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Original")
axes[1].imshow(global_eq, cmap="gray")
axes[1].set_title("Global Equalization")
axes[2].imshow(clahe_result, cmap="gray")
axes[2].set_title("CLAHE")
plt.tight_layout()
plt.show()
```

### CLAHE Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `clipLimit` | 40.0 | Maximum contrast amplification. Lower = less noise. 2.0–3.0 is typical |
| `tileGridSize` | (8, 8) | Size of tiles. Smaller = more local adaptation |

### CLAHE for Color Images

```python
import cv2

img = cv2.imread("photo.jpg")

# Convert to LAB color space (L = lightness)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l_channel, a_channel, b_channel = cv2.split(lab)

# Apply CLAHE to the L channel only
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
l_equalized = clahe.apply(l_channel)

# Merge back and convert to BGR
lab_equalized = cv2.merge([l_equalized, a_channel, b_channel])
result = cv2.cvtColor(lab_equalized, cv2.COLOR_LAB2BGR)

cv2.imwrite("clahe_color_result.jpg", result)
```

---

## Histogram Comparison

Compare two histograms to measure image similarity:

```python
import cv2
import numpy as np

img1 = cv2.imread("scene1.jpg")
img2 = cv2.imread("scene2.jpg")

# Convert to HSV (better for color comparison)
hsv1 = cv2.cvtColor(img1, cv2.COLOR_BGR2HSV)
hsv2 = cv2.cvtColor(img2, cv2.COLOR_BGR2HSV)

# Compute histograms (H and S channels)
hist1 = cv2.calcHist([hsv1], [0, 1], None, [50, 60], [0, 180, 0, 256])
hist2 = cv2.calcHist([hsv2], [0, 1], None, [50, 60], [0, 180, 0, 256])

# Normalize histograms
cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)

# Compare using different methods
methods = {
    "Correlation": cv2.HISTCMP_CORREL,
    "Chi-Square": cv2.HISTCMP_CHISQR,
    "Intersection": cv2.HISTCMP_INTERSECT,
    "Bhattacharyya": cv2.HISTCMP_BHATTACHARYYA,
}

print("Histogram Comparison Results:")
print("-" * 40)
for name, method in methods.items():
    score = cv2.compareHist(hist1, hist2, method)
    print(f"{name:15s}: {score:.4f}")
```

### Comparison Methods

| Method | Perfect Match | Range | Meaning |
|--------|--------------|-------|---------|
| CORREL | 1.0 | [-1, 1] | Higher = more similar |
| CHISQR | 0.0 | [0, ∞) | Lower = more similar |
| INTERSECT | High value | [0, ∞) | Higher = more similar |
| BHATTACHARYYA | 0.0 | [0, 1] | Lower = more similar |

---

## Histogram Backprojection

Backprojection finds image regions that match a given color histogram — useful for **object tracking by color**.

```python
import cv2
import numpy as np

# Target: a region of interest (e.g., a skin patch)
target = cv2.imread("skin_patch.jpg")
hsv_target = cv2.cvtColor(target, cv2.COLOR_BGR2HSV)

# Scene to search in
scene = cv2.imread("full_scene.jpg")
hsv_scene = cv2.cvtColor(scene, cv2.COLOR_BGR2HSV)

# Compute histogram of the target region
target_hist = cv2.calcHist([hsv_target], [0, 1], None,
                           [180, 256], [0, 180, 0, 256])
cv2.normalize(target_hist, target_hist, 0, 255, cv2.NORM_MINMAX)

# Backproject: find matching regions in scene
backproj = cv2.calcBackProject([hsv_scene], [0, 1], target_hist,
                                [0, 180, 0, 256], 1)

# Apply a disk-shaped morphological filter to clean up
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
cv2.filter2D(backproj, -1, kernel, backproj)

# Threshold the backprojection
_, mask = cv2.threshold(backproj, 50, 255, cv2.THRESH_BINARY)

# Apply mask to original scene
mask_3ch = cv2.merge([mask, mask, mask])
result = cv2.bitwise_and(scene, mask_3ch)

cv2.imwrite("backprojection_result.jpg", result)
print("Backprojection complete — matching regions highlighted")
```

---

## Full Example: Equalization Comparison Dashboard

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

def create_histogram_dashboard(image_path):
    """Create a full comparison of histogram techniques."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("Error: Could not load image")
        return

    # Apply techniques
    global_eq = cv2.equalizeHist(img)

    clahe_low = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(8, 8))
    result_low = clahe_low.apply(img)

    clahe_high = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
    result_high = clahe_high.apply(img)

    # Create dashboard
    images = [img, global_eq, result_low, result_high]
    titles = ["Original", "Global EQ", "CLAHE (clip=1.0)", "CLAHE (clip=4.0)"]

    fig, axes = plt.subplots(2, 4, figsize=(16, 8))

    for i, (image, title) in enumerate(zip(images, titles)):
        # Show image
        axes[0, i].imshow(image, cmap="gray")
        axes[0, i].set_title(title)
        axes[0, i].axis("off")

        # Show histogram
        hist = cv2.calcHist([image], [0], None, [256], [0, 256])
        axes[1, i].plot(hist, color="black")
        axes[1, i].set_xlim([0, 256])
        axes[1, i].set_title(f"{title} Histogram")

    plt.tight_layout()
    plt.savefig("histogram_dashboard.png", dpi=150)
    plt.show()
    print("Dashboard saved to histogram_dashboard.png")

# Run the dashboard
create_histogram_dashboard("low_contrast_photo.jpg")
```

---

## Summary

| Technique | Use Case | Function |
|-----------|----------|----------|
| Histogram computation | Analyze intensity distribution | `cv2.calcHist()` |
| Equalization | Improve global contrast | `cv2.equalizeHist()` |
| CLAHE | Local contrast enhancement | `cv2.createCLAHE()` |
| Comparison | Measure image similarity | `cv2.compareHist()` |
| Backprojection | Find color-matched regions | `cv2.calcBackProject()` |

**Key takeaways:**
- Histograms reveal the intensity distribution — dark, bright, low/high contrast
- Global equalization is simple but can over-amplify noise
- CLAHE is almost always preferred for real-world enhancement
- Histogram comparison enables content-based image retrieval
- Backprojection is a fast way to locate objects by color

---

## Exercises

1. Load a dark photo and apply both global equalization and CLAHE. Compare the results visually and with histograms.
2. Compute color histograms for two images. Use all four comparison methods to rank similarity.
3. Use backprojection to track a colored object across multiple frames of a video.
