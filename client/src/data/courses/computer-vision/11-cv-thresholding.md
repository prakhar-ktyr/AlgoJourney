---
title: Thresholding Techniques
---

# Thresholding Techniques

Thresholding is one of the simplest and most effective ways to segment an image. It converts a grayscale image into a binary image — pixels are either **white** (foreground) or **black** (background).

---

## What Is Thresholding?

Thresholding compares each pixel's intensity to a threshold value $T$. If the pixel is above the threshold, it becomes white; otherwise, it becomes black.

$$g(x,y) = \begin{cases} 255 & \text{if } f(x,y) > T \\ 0 & \text{otherwise} \end{cases}$$

Where:
- $f(x,y)$ is the original grayscale pixel value
- $T$ is the threshold
- $g(x,y)$ is the output binary pixel

**Use cases:**
- Document scanning (text vs background)
- Object detection (foreground vs background)
- Medical imaging (isolating structures)
- Quality inspection (defect detection)

---

## Simple (Global) Thresholding

A single threshold value is applied to the entire image.

### Syntax

```python
ret, dst = cv2.threshold(src, thresh, maxval, type)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `src` | Input grayscale image |
| `thresh` | Threshold value (0–255) |
| `maxval` | Value assigned to pixels exceeding threshold |
| `type` | Thresholding type |

**Returns:**
- `ret` — The threshold value used
- `dst` — The output binary image

---

## Threshold Types

OpenCV provides 5 simple thresholding types:

### THRESH_BINARY

$$g(x,y) = \begin{cases} \text{maxval} & \text{if } f(x,y) > T \\ 0 & \text{otherwise} \end{cases}$$

### THRESH_BINARY_INV

$$g(x,y) = \begin{cases} 0 & \text{if } f(x,y) > T \\ \text{maxval} & \text{otherwise} \end{cases}$$

### THRESH_TRUNC

$$g(x,y) = \begin{cases} T & \text{if } f(x,y) > T \\ f(x,y) & \text{otherwise} \end{cases}$$

### THRESH_TOZERO

$$g(x,y) = \begin{cases} f(x,y) & \text{if } f(x,y) > T \\ 0 & \text{otherwise} \end{cases}$$

### THRESH_TOZERO_INV

$$g(x,y) = \begin{cases} 0 & \text{if } f(x,y) > T \\ f(x,y) & \text{otherwise} \end{cases}$$

---

## Example: All Threshold Types

```python
import cv2
import numpy as np

# Load image in grayscale
img = cv2.imread("gradient.png", cv2.IMREAD_GRAYSCALE)

# Apply all threshold types
thresh_val = 127

ret1, binary = cv2.threshold(img, thresh_val, 255, cv2.THRESH_BINARY)
ret2, binary_inv = cv2.threshold(img, thresh_val, 255, cv2.THRESH_BINARY_INV)
ret3, trunc = cv2.threshold(img, thresh_val, 255, cv2.THRESH_TRUNC)
ret4, tozero = cv2.threshold(img, thresh_val, 255, cv2.THRESH_TOZERO)
ret5, tozero_inv = cv2.threshold(img, thresh_val, 255, cv2.THRESH_TOZERO_INV)

# Display results
titles = ["Original", "BINARY", "BINARY_INV", "TRUNC", "TOZERO", "TOZERO_INV"]
images = [img, binary, binary_inv, trunc, tozero, tozero_inv]

for i, (title, image) in enumerate(zip(titles, images)):
    cv2.imshow(title, image)

cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Otsu's Method

Choosing the right threshold manually is tedious. **Otsu's method** finds the optimal threshold automatically by analyzing the image histogram.

### How It Works

Otsu's algorithm:
1. Computes the histogram of the image
2. Tests every possible threshold (0–255)
3. For each threshold, calculates the **intra-class variance** (variance within foreground and background)
4. Selects the threshold that **minimizes** intra-class variance

$$\sigma_w^2(T) = w_0(T)\sigma_0^2(T) + w_1(T)\sigma_1^2(T)$$

Where:
- $w_0, w_1$ are the probabilities of the two classes (background/foreground)
- $\sigma_0^2, \sigma_1^2$ are the variances of the two classes

> **Note:** Otsu's method works best on images with **bimodal histograms** (two clear peaks).

### Syntax

```python
# Pass 0 as thresh — Otsu computes it automatically
ret, dst = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```

The returned `ret` value is the threshold Otsu selected.

---

## Example: Otsu's Thresholding

```python
import cv2
import numpy as np

# Load grayscale image
img = cv2.imread("coins.png", cv2.IMREAD_GRAYSCALE)

# Manual threshold
ret1, thresh1 = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

# Otsu's threshold
ret2, thresh2 = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

print(f"Manual threshold: 127")
print(f"Otsu's threshold: {ret2}")

# Otsu after Gaussian blur (recommended for noisy images)
blur = cv2.GaussianBlur(img, (5, 5), 0)
ret3, thresh3 = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

print(f"Otsu's threshold (after blur): {ret3}")

cv2.imshow("Original", img)
cv2.imshow("Manual (127)", thresh1)
cv2.imshow("Otsu", thresh2)
cv2.imshow("Otsu + Blur", thresh3)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Adaptive Thresholding

Global thresholding fails when lighting is uneven across the image. **Adaptive thresholding** computes a different threshold for each small region.

### Syntax

```python
dst = cv2.adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `src` | Input grayscale image (8-bit) |
| `maxValue` | Value for pixels that pass the threshold |
| `adaptiveMethod` | How the local threshold is calculated |
| `thresholdType` | `THRESH_BINARY` or `THRESH_BINARY_INV` |
| `blockSize` | Size of the neighborhood (odd number: 3, 5, 7…) |
| `C` | Constant subtracted from the computed mean/weighted mean |

### Adaptive Methods

**ADAPTIVE_THRESH_MEAN_C:**
- Threshold = mean of the neighborhood minus $C$

$$T(x,y) = \text{mean}(blockSize \times blockSize\ \text{region}) - C$$

**ADAPTIVE_THRESH_GAUSSIAN_C:**
- Threshold = Gaussian-weighted sum of neighborhood minus $C$
- Gives more weight to nearby pixels

---

## Example: Adaptive Thresholding

```python
import cv2
import numpy as np

# Load image with uneven lighting
img = cv2.imread("page_scan.png", cv2.IMREAD_GRAYSCALE)

# Global threshold (fails with uneven lighting)
ret, global_thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

# Adaptive Mean
adaptive_mean = cv2.adaptiveThreshold(
    img, 255,
    cv2.ADAPTIVE_THRESH_MEAN_C,
    cv2.THRESH_BINARY,
    blockSize=11,
    C=2
)

# Adaptive Gaussian
adaptive_gaussian = cv2.adaptiveThreshold(
    img, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY,
    blockSize=11,
    C=2
)

cv2.imshow("Original", img)
cv2.imshow("Global Threshold", global_thresh)
cv2.imshow("Adaptive Mean", adaptive_mean)
cv2.imshow("Adaptive Gaussian", adaptive_gaussian)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Multi-Level Thresholding

Sometimes you need more than two classes. Multi-level thresholding uses multiple thresholds to segment an image into several regions.

```python
import cv2
import numpy as np

# Load grayscale image
img = cv2.imread("terrain.png", cv2.IMREAD_GRAYSCALE)

# Define multiple thresholds
t1, t2 = 85, 170

# Create multi-level output
output = np.zeros_like(img)
output[img <= t1] = 0          # Dark regions
output[(img > t1) & (img <= t2)] = 128  # Medium regions
output[img > t2] = 255         # Bright regions

cv2.imshow("Original", img)
cv2.imshow("Multi-Level (3 classes)", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

For automatic multi-level thresholding, you can extend Otsu's method or use libraries like `scikit-image`:

```python
from skimage.filters import threshold_multiotsu
import cv2
import numpy as np

img = cv2.imread("terrain.png", cv2.IMREAD_GRAYSCALE)

# Compute 2 thresholds (3 classes)
thresholds = threshold_multiotsu(img, classes=3)
print(f"Thresholds: {thresholds}")

# Digitize the image
regions = np.digitize(img, bins=thresholds)

# Scale to visible range
output = (regions * 127).astype(np.uint8)

cv2.imshow("Multi-Otsu", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Complete Comparison Example

```python
import cv2
import numpy as np

def compare_thresholding_methods(image_path):
    """Compare all thresholding methods side by side."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # 1. Simple thresholding at various levels
    _, simple_low = cv2.threshold(img, 80, 255, cv2.THRESH_BINARY)
    _, simple_mid = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)
    _, simple_high = cv2.threshold(img, 200, 255, cv2.THRESH_BINARY)

    # 2. Otsu's method
    ret_otsu, otsu = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    print(f"Otsu selected threshold: {ret_otsu}")

    # 3. Otsu with Gaussian blur
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    ret_otsu_blur, otsu_blur = cv2.threshold(
        blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # 4. Adaptive Mean
    adapt_mean = cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # 5. Adaptive Gaussian
    adapt_gauss = cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Display all
    results = {
        "Original": img,
        "Simple (T=80)": simple_low,
        "Simple (T=127)": simple_mid,
        "Simple (T=200)": simple_high,
        f"Otsu (T={ret_otsu:.0f})": otsu,
        "Otsu + Blur": otsu_blur,
        "Adaptive Mean": adapt_mean,
        "Adaptive Gaussian": adapt_gauss,
    }

    for name, result in results.items():
        cv2.imshow(name, result)

    cv2.waitKey(0)
    cv2.destroyAllWindows()


# Run the comparison
compare_thresholding_methods("document.png")
```

---

## Otsu on Bimodal Histogram

```python
import cv2
import numpy as np

# Create a synthetic bimodal image
dark_region = np.random.normal(60, 15, (200, 300)).astype(np.uint8)
bright_region = np.random.normal(190, 15, (200, 300)).astype(np.uint8)
bimodal_img = np.vstack([dark_region, bright_region])

# Apply Otsu's method
ret, otsu_result = cv2.threshold(
    bimodal_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
)
print(f"Optimal threshold for bimodal image: {ret}")
# Expected: ~125 (midpoint between the two peaks)

cv2.imshow("Bimodal Image", bimodal_img)
cv2.imshow(f"Otsu Result (T={ret:.0f})", otsu_result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## When to Use Which Method

| Method | Best For | Limitations |
|--------|----------|-------------|
| **Simple (manual)** | Known, consistent lighting; quick prototyping | Must guess threshold; fails with uneven light |
| **Otsu's** | Bimodal histograms; automatic threshold | Fails on non-bimodal images; global only |
| **Adaptive Mean** | Uneven lighting; documents; large images | May produce noise in uniform regions |
| **Adaptive Gaussian** | Uneven lighting (smoother results) | Slightly slower than mean; tuning blockSize |
| **Multi-level** | Multiple distinct regions/classes | More complex; need to know number of classes |

### Decision Guide

1. **Is lighting uniform?**
   - Yes → Try Otsu's first, fall back to manual
   - No → Use adaptive thresholding

2. **Is the histogram bimodal?**
   - Yes → Otsu's will work perfectly
   - No → Consider adaptive or multi-level

3. **Do you need more than 2 classes?**
   - Yes → Use multi-level thresholding
   - No → Standard binary thresholding

---

## Tips & Best Practices

- **Pre-process with blur** before thresholding to reduce noise
- **blockSize** in adaptive thresholding should be larger than the objects of interest
- The constant **C** acts as a fine-tuning knob — increase it to capture less detail
- For **Otsu's**, always check the histogram first to verify bimodality
- Combine thresholding with morphological operations (erosion/dilation) for cleaner results

---

## Try It Yourself

1. Load a photo of a printed page with shadows
2. Apply global thresholding — observe the failures
3. Apply adaptive Gaussian thresholding — see the improvement
4. Experiment with different `blockSize` values (11, 21, 51)
5. Try adding a Gaussian blur before Otsu's method

---

## Summary

- **Thresholding** converts grayscale images to binary (or multi-level) images
- **Global thresholding** uses one threshold for the entire image
- **Otsu's method** automatically finds the best threshold for bimodal images
- **Adaptive thresholding** handles uneven lighting by computing local thresholds
- Choose the method based on your image's lighting conditions and histogram shape
