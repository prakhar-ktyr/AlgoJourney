---
title: Image Gradients & Edge Detection
---

# Image Gradients & Edge Detection

Image gradients measure the **rate of intensity change** in an image. They form the foundation of edge detection — one of the most important tasks in computer vision.

---

## What Are Image Gradients?

A gradient tells you **how quickly** pixel intensity changes and **in which direction**. Edges in images are locations where intensity changes sharply (e.g., the boundary between a dark object and a bright background).

Think of it like a hill: the gradient points in the steepest uphill direction, and its magnitude tells you how steep it is.

---

## Why Detect Edges?

Edges carry the most important structural information:
- **Object boundaries** — where one object ends and another begins
- **Shape recognition** — identify geometric forms
- **Feature detection** — corner points, lines, curves
- **Segmentation** — separate foreground from background
- **Reduce data** — edges contain essential info with far fewer pixels

---

## First-Order Derivatives

The gradient of an image $f$ at point $(x, y)$ has two components:

$$G_x = \frac{\partial f}{\partial x} \quad \text{(horizontal change)}$$

$$G_y = \frac{\partial f}{\partial y} \quad \text{(vertical change)}$$

### Gradient Magnitude

The overall edge strength at each pixel:

$$G = \sqrt{G_x^2 + G_y^2}$$

In practice, an approximation is often used for speed:

$$G \approx |G_x| + |G_y|$$

### Gradient Direction

The angle of the edge:

$$\theta = \arctan\left(\frac{G_y}{G_x}\right)$$

This tells you the orientation of the edge (horizontal, vertical, diagonal).

---

## Sobel Operator

The Sobel operator computes the gradient using two 3×3 kernels — one for horizontal edges ($G_x$) and one for vertical edges ($G_y$).

### Sobel Kernels

**X-direction (detects vertical edges):**

$$S_x = \begin{bmatrix}-1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1\end{bmatrix}$$

**Y-direction (detects horizontal edges):**

$$S_y = \begin{bmatrix}-1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1\end{bmatrix}$$

The center row/column has weight 2, giving more importance to the nearest pixels.

### Syntax

```python
dst = cv2.Sobel(src, ddepth, dx, dy, ksize=3)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `src` | Input image (grayscale) |
| `ddepth` | Output image depth (`cv2.CV_64F` recommended) |
| `dx` | Order of X derivative (0 or 1) |
| `dy` | Order of Y derivative (0 or 1) |
| `ksize` | Kernel size (1, 3, 5, or 7) |

### Example: Sobel Edge Detection

```python
import cv2
import numpy as np

img = cv2.imread("building.jpg", cv2.IMREAD_GRAYSCALE)

# Compute gradients (use CV_64F to capture negative values)
sobel_x = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)

# Convert to absolute values for display
abs_sobel_x = cv2.convertScaleAbs(sobel_x)
abs_sobel_y = cv2.convertScaleAbs(sobel_y)

# Combine both gradients
sobel_combined = cv2.addWeighted(abs_sobel_x, 0.5, abs_sobel_y, 0.5, 0)

cv2.imshow("Original", img)
cv2.imshow("Sobel X (Vertical Edges)", abs_sobel_x)
cv2.imshow("Sobel Y (Horizontal Edges)", abs_sobel_y)
cv2.imshow("Sobel Combined", sobel_combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

> **Important:** Use `cv2.CV_64F` as the depth! If you use `cv2.CV_8U`, negative gradients (black→white transitions) are lost because uint8 can't store negative values.

### Computing Magnitude and Direction

```python
import cv2
import numpy as np

img = cv2.imread("building.jpg", cv2.IMREAD_GRAYSCALE)

# Float gradients
sobel_x = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)

# Magnitude
magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
magnitude = np.clip(magnitude, 0, 255).astype(np.uint8)

# Direction (in degrees)
direction = np.arctan2(sobel_y, sobel_x) * 180 / np.pi

print(f"Magnitude range: {magnitude.min()} to {magnitude.max()}")
print(f"Direction range: {direction.min():.1f}° to {direction.max():.1f}°")

cv2.imshow("Gradient Magnitude", magnitude)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Scharr Operator

The Scharr operator is a more accurate alternative to Sobel for 3×3 kernels. It provides better rotational symmetry.

### Scharr Kernels

$$\text{Scharr}_x = \begin{bmatrix}-3 & 0 & 3 \\ -10 & 0 & 10 \\ -3 & 0 & 3\end{bmatrix} \qquad \text{Scharr}_y = \begin{bmatrix}-3 & -10 & -3 \\ 0 & 0 & 0 \\ 3 & 10 & 3\end{bmatrix}$$

### Syntax

```python
# Method 1: Use ksize=cv2.FILTER_SCHARR with Sobel
scharr_x = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=cv2.FILTER_SCHARR)

# Method 2: Use cv2.Scharr directly
scharr_x = cv2.Scharr(img, cv2.CV_64F, 1, 0)
scharr_y = cv2.Scharr(img, cv2.CV_64F, 0, 1)
```

### When to Use Scharr

- When you need a 3×3 kernel with better accuracy
- When diagonal edges appear thicker than expected with Sobel
- For applications requiring precise gradient direction

---

## Laplacian Operator

The Laplacian is a **second-order derivative** — it detects regions of rapid intensity change in all directions simultaneously.

$$\nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2}$$

### Laplacian Kernel (3×3 approximation)

$$L = \begin{bmatrix}0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0\end{bmatrix}$$

Or with diagonals:

$$L = \begin{bmatrix}1 & 1 & 1 \\ 1 & -8 & 1 \\ 1 & 1 & 1\end{bmatrix}$$

### Syntax

```python
dst = cv2.Laplacian(src, ddepth, ksize=1)
```

### Example

```python
import cv2
import numpy as np

img = cv2.imread("building.jpg", cv2.IMREAD_GRAYSCALE)

# Apply Gaussian blur first (Laplacian is sensitive to noise)
blurred = cv2.GaussianBlur(img, (3, 3), 0)

# Compute Laplacian
laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
laplacian_abs = cv2.convertScaleAbs(laplacian)

cv2.imshow("Original", img)
cv2.imshow("Laplacian Edges", laplacian_abs)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Laplacian Characteristics

- Detects edges in **all directions** simultaneously
- More sensitive to noise than Sobel (always blur first!)
- Good for detecting blobs and fine detail
- Zero-crossings in the Laplacian correspond to edges

---

## Canny Edge Detection

The **Canny edge detector** is considered the gold standard for edge detection. It produces thin, clean, connected edges.

### The 5-Step Algorithm

**Step 1: Gaussian Blur**
- Smooth the image to reduce noise
- Typically 5×5 Gaussian kernel

**Step 2: Gradient Computation**
- Compute $G_x$ and $G_y$ using Sobel
- Calculate magnitude and direction

**Step 3: Non-Maximum Suppression**
- Thin edges to 1 pixel wide
- For each pixel, check if it's the local maximum along the gradient direction
- If not → suppress (set to 0)

**Step 4: Double Thresholding**
- Classify edge pixels as:
  - **Strong** (above high threshold) — definitely an edge
  - **Weak** (between low and high) — maybe an edge
  - **Non-edge** (below low threshold) — discard

**Step 5: Hysteresis (Edge Tracking)**
- Keep all strong edges
- Keep weak edges only if they connect to a strong edge
- Discard isolated weak edges

### Syntax

```python
edges = cv2.Canny(image, threshold1, threshold2, apertureSize=3, L2gradient=False)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `image` | Input image (grayscale or color) |
| `threshold1` | Lower threshold for hysteresis |
| `threshold2` | Upper threshold for hysteresis |
| `apertureSize` | Sobel kernel size (3, 5, or 7) |
| `L2gradient` | Use $\sqrt{G_x^2+G_y^2}$ if True, $|G_x|+|G_y|$ if False |

> **Rule of thumb:** Set `threshold2` = 2× to 3× `threshold1`.

### Example: Canny Edge Detection

```python
import cv2
import numpy as np

img = cv2.imread("building.jpg", cv2.IMREAD_GRAYSCALE)

# Apply Canny with different thresholds
edges_low = cv2.Canny(img, 50, 100)    # More edges (more noise)
edges_mid = cv2.Canny(img, 100, 200)   # Balanced
edges_high = cv2.Canny(img, 200, 400)  # Fewer edges (misses some)

cv2.imshow("Original", img)
cv2.imshow("Canny Low (50, 100)", edges_low)
cv2.imshow("Canny Mid (100, 200)", edges_mid)
cv2.imshow("Canny High (200, 400)", edges_high)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Auto Canny

Choosing thresholds manually is tedious. The **auto Canny** method computes optimal thresholds from the image's median intensity.

```python
import cv2
import numpy as np

def auto_canny(image, sigma=0.33):
    """Automatically determine Canny thresholds from median."""
    # Compute the median of the pixel intensities
    median = np.median(image)

    # Compute lower and upper thresholds
    lower = int(max(0, (1.0 - sigma) * median))
    upper = int(min(255, (1.0 + sigma) * median))

    # Apply Canny
    edges = cv2.Canny(image, lower, upper)
    return edges


img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Blur to reduce noise
blurred = cv2.GaussianBlur(img, (3, 3), 0)

# Auto Canny
edges = auto_canny(blurred)

# Compare with manual
manual_edges = cv2.Canny(blurred, 100, 200)

cv2.imshow("Auto Canny", edges)
cv2.imshow("Manual Canny (100, 200)", manual_edges)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

The `sigma` parameter controls sensitivity:
- Higher sigma (0.5) → wider threshold range → fewer edges
- Lower sigma (0.2) → narrower range → more edges

---

## Complete Comparison

```python
import cv2
import numpy as np

def compare_edge_detectors(image_path):
    """Compare Sobel, Laplacian, and Canny side by side."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    blurred = cv2.GaussianBlur(img, (3, 3), 0)

    # Sobel
    sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.sqrt(sobel_x**2 + sobel_y**2)
    sobel_mag = np.clip(sobel_mag, 0, 255).astype(np.uint8)

    # Scharr
    scharr_x = cv2.Scharr(blurred, cv2.CV_64F, 1, 0)
    scharr_y = cv2.Scharr(blurred, cv2.CV_64F, 0, 1)
    scharr_mag = np.sqrt(scharr_x**2 + scharr_y**2)
    scharr_mag = np.clip(scharr_mag, 0, 255).astype(np.uint8)

    # Laplacian
    laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
    laplacian_abs = cv2.convertScaleAbs(laplacian)

    # Canny
    canny = cv2.Canny(blurred, 100, 200)

    # Auto Canny
    median = np.median(blurred)
    lower = int(max(0, 0.67 * median))
    upper = int(min(255, 1.33 * median))
    auto_canny_result = cv2.Canny(blurred, lower, upper)

    results = {
        "Original": img,
        "Sobel Magnitude": sobel_mag,
        "Scharr Magnitude": scharr_mag,
        "Laplacian": laplacian_abs,
        "Canny (100, 200)": canny,
        f"Auto Canny ({lower}, {upper})": auto_canny_result,
    }

    for name, result in results.items():
        cv2.imshow(name, result)

    cv2.waitKey(0)
    cv2.destroyAllWindows()


compare_edge_detectors("building.jpg")
```

---

## Edge Detection with Pre-Processing

```python
import cv2
import numpy as np

def robust_edge_detection(image_path):
    """Production-quality edge detection pipeline."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Step 1: Denoise with bilateral filter (preserve edges)
    denoised = cv2.bilateralFilter(img, 9, 75, 75)

    # Step 2: Enhance contrast with CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # Step 3: Gaussian blur
    blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)

    # Step 4: Auto Canny
    median = np.median(blurred)
    lower = int(max(0, 0.67 * median))
    upper = int(min(255, 1.33 * median))
    edges = cv2.Canny(blurred, lower, upper)

    # Step 5: Optional — dilate to connect broken edges
    kernel = np.ones((2, 2), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)

    return edges


edges = robust_edge_detection("complex_scene.jpg")
cv2.imshow("Robust Edges", edges)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Edge Detection Comparison Table

| Detector | Type | Thin Edges? | Noise Sensitive? | Speed | Best For |
|----------|------|-------------|------------------|-------|----------|
| **Sobel** | 1st derivative | No | Moderate | Fast | Directional gradients |
| **Scharr** | 1st derivative | No | Moderate | Fast | Accurate 3×3 gradients |
| **Laplacian** | 2nd derivative | No | High | Fast | Blob detection, fine detail |
| **Canny** | Multi-step | Yes | Low | Moderate | General edge detection |

### When to Use Which

- **Sobel** — When you need gradient direction (for Hough lines, feature descriptors)
- **Scharr** — Same as Sobel but need more accuracy with 3×3
- **Laplacian** — When detecting regions of rapid change (blobs, textures)
- **Canny** — When you need clean, thin, connected edges (most common choice)

---

## Tips & Best Practices

- **Always blur first** — edge detectors amplify noise
- Use `cv2.CV_64F` for Sobel/Laplacian to avoid losing negative gradients
- For Canny, start with `threshold2 = 2 * threshold1` and adjust
- **Auto Canny** works well for most images — start there
- Combine Canny edges with dilation to connect broken edges
- For color images, compute edges on each channel and combine, or convert to grayscale

---

## Try It Yourself

1. Load an image and compute Sobel X and Y separately — observe which edges each detects
2. Implement auto Canny and test on 5 different images
3. Compare Sobel vs Scharr on an image with diagonal lines
4. Apply Laplacian without blur, then with blur — see the difference
5. Build a trackbar to adjust Canny thresholds in real time

---

## Summary

- **Image gradients** measure intensity change (direction and magnitude)
- **Sobel** computes first derivatives in X and Y using weighted kernels
- **Scharr** is more accurate than Sobel for 3×3 kernels
- **Laplacian** computes second derivatives (sensitive to noise, always blur first)
- **Canny** is the gold standard: blur → gradient → thin → threshold → connect
- Use **auto Canny** (median-based thresholds) for robust automatic edge detection
