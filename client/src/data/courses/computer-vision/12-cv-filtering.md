---
title: Image Filtering & Smoothing
---

# Image Filtering & Smoothing

Image filtering is a fundamental technique used to modify or enhance images. Filters can remove noise, smooth images, sharpen details, or detect features like edges.

---

## Why Filter Images?

| Goal | Filter Type |
|------|-------------|
| Remove noise | Gaussian, Median, Bilateral |
| Smooth/blur | Box, Gaussian |
| Sharpen | Unsharp mask, Laplacian |
| Detect edges | Sobel, Laplacian (covered in next lesson) |
| Custom effects | User-defined kernels |

---

## The Convolution Operation

Filtering works by **convolving** an image with a small matrix called a **kernel** (or filter). The kernel slides across the image, computing a weighted sum at each position.

$$( f * g)(x,y) = \sum_{i}\sum_{j} f(x-i, y-j) \cdot g(i,j)$$

Where:
- $f$ is the image
- $g$ is the kernel
- The output pixel is the sum of element-wise products

### How It Works

1. Place the kernel center on a pixel
2. Multiply each kernel value by the corresponding image pixel underneath
3. Sum all products → this is the new pixel value
4. Slide to the next pixel, repeat

### Border Handling

When the kernel is near image edges, some kernel positions fall "outside" the image. OpenCV offers several border padding modes:

| Mode | Description |
|------|-------------|
| `cv2.BORDER_REFLECT` | Mirror pixels at the border |
| `cv2.BORDER_REPLICATE` | Repeat the edge pixel |
| `cv2.BORDER_CONSTANT` | Pad with a constant (default 0) |
| `cv2.BORDER_WRAP` | Wrap around to the opposite side |

---

## Box Filter (Averaging)

The simplest filter — replaces each pixel with the **average** of its neighbors. All kernel values are equal.

$$K = \frac{1}{k^2}\begin{bmatrix}1 & 1 & 1 \\ 1 & 1 & 1 \\ 1 & 1 & 1\end{bmatrix}$$

For a $k \times k$ kernel, each element is $\frac{1}{k^2}$.

### Syntax

```python
# Normalized box filter (averaging)
dst = cv2.blur(img, (ksize, ksize))

# Box filter with optional normalization
dst = cv2.boxFilter(img, ddepth, (ksize, ksize), normalize=True)
```

### Example

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Apply box filters of different sizes
blur_3 = cv2.blur(img, (3, 3))
blur_7 = cv2.blur(img, (7, 7))
blur_15 = cv2.blur(img, (15, 15))

cv2.imshow("Original", img)
cv2.imshow("Box 3x3", blur_3)
cv2.imshow("Box 7x7", blur_7)
cv2.imshow("Box 15x15", blur_15)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

> **Note:** Larger kernel = more blur, but also more loss of detail.

---

## Gaussian Blur

The most commonly used blur filter. Pixels closer to the center have more influence than distant ones, following a Gaussian (bell curve) distribution.

$$G(x,y) = \frac{1}{2\pi\sigma^2}e^{-\frac{x^2+y^2}{2\sigma^2}}$$

Where $\sigma$ (sigma) controls the spread — larger sigma means more blur.

### Syntax

```python
dst = cv2.GaussianBlur(img, (ksize, ksize), sigmaX)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `img` | Input image |
| `(ksize, ksize)` | Kernel size (must be odd: 3, 5, 7…) |
| `sigmaX` | Standard deviation in X direction (0 = auto from ksize) |

### Example

```python
import cv2
import numpy as np

img = cv2.imread("noisy_photo.jpg")

# Different sigma values
gauss_small = cv2.GaussianBlur(img, (5, 5), 1)
gauss_medium = cv2.GaussianBlur(img, (5, 5), 3)
gauss_large = cv2.GaussianBlur(img, (15, 15), 5)

cv2.imshow("Original", img)
cv2.imshow("Gaussian sigma=1", gauss_small)
cv2.imshow("Gaussian sigma=3", gauss_medium)
cv2.imshow("Gaussian sigma=5", gauss_large)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Why Gaussian Over Box?

- Gaussian produces more natural-looking blur
- No sharp transitions at kernel boundary
- Better for noise reduction while preserving structure
- Standard in many CV pipelines (pre-processing for edge detection, etc.)

---

## Median Filter

Instead of averaging, the median filter replaces each pixel with the **median** value of its neighborhood. This is a **non-linear** filter.

### Syntax

```python
dst = cv2.medianBlur(img, ksize)
```

`ksize` must be an odd integer (3, 5, 7…).

### Why Median?

- **Excellent for salt-and-pepper noise** (random black/white pixels)
- Preserves edges better than averaging
- Does not create new pixel values (output is always an actual pixel value from the neighborhood)

### Example

```python
import cv2
import numpy as np

# Create salt-and-pepper noise
img = cv2.imread("clean_photo.jpg", cv2.IMREAD_GRAYSCALE)
noisy = img.copy()

# Add salt (white) noise
salt = np.random.random(img.shape) > 0.97
noisy[salt] = 255

# Add pepper (black) noise
pepper = np.random.random(img.shape) > 0.97
noisy[pepper] = 0

# Compare filters
gaussian_result = cv2.GaussianBlur(noisy, (5, 5), 0)
median_result = cv2.medianBlur(noisy, 5)

cv2.imshow("Noisy (Salt & Pepper)", noisy)
cv2.imshow("Gaussian Blur", gaussian_result)
cv2.imshow("Median Filter", median_result)  # Much better!
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Bilateral Filter

The bilateral filter is **edge-preserving** — it smooths flat areas while keeping sharp edges intact. It considers both:
- **Spatial distance** (how far away a pixel is)
- **Intensity difference** (how similar the pixel values are)

### Syntax

```python
dst = cv2.bilateralFilter(img, d, sigmaColor, sigmaSpace)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `d` | Diameter of the pixel neighborhood (use -1 for auto) |
| `sigmaColor` | Pixels with intensity difference > this are not mixed |
| `sigmaSpace` | Spatial extent of the filter (like Gaussian sigma) |

### Example

```python
import cv2
import numpy as np

img = cv2.imread("portrait.jpg")

# Gaussian smooths everything (including edges)
gaussian = cv2.GaussianBlur(img, (9, 9), 0)

# Bilateral preserves edges
bilateral = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)

cv2.imshow("Original", img)
cv2.imshow("Gaussian (edges blurred)", gaussian)
cv2.imshow("Bilateral (edges preserved)", bilateral)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

> **Tip:** Bilateral filter is popular for skin smoothing in portrait photography — it reduces blemishes while keeping facial features sharp.

---

## Sharpening

Sharpening enhances edges and fine details. Two common approaches:

### Unsharp Masking

The idea: subtract a blurred version from the original to get the "detail" layer, then add it back with a scaling factor.

$$\text{sharpened} = \text{original} + k \cdot (\text{original} - \text{blurred})$$

Where $k$ controls the sharpening strength.

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Create blurred version
blurred = cv2.GaussianBlur(img, (0, 0), 3)

# Unsharp mask: original + k * (original - blurred)
k = 1.5
sharpened = cv2.addWeighted(img, 1 + k, blurred, -k, 0)

cv2.imshow("Original", img)
cv2.imshow("Sharpened (Unsharp Mask)", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Laplacian Sharpening Kernel

A sharpening kernel directly enhances edges:

$$K = \begin{bmatrix} 0 & -1 & 0 \\ -1 & 5 & -1 \\ 0 & -1 & 0 \end{bmatrix}$$

The center value (5) keeps the original pixel, while negative values subtract neighbors — emphasizing differences.

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Sharpening kernel
kernel = np.array([
    [0, -1,  0],
    [-1,  5, -1],
    [0, -1,  0]
], dtype=np.float32)

sharpened = cv2.filter2D(img, -1, kernel)

cv2.imshow("Original", img)
cv2.imshow("Sharpened (Kernel)", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Custom Kernels with filter2D

You can apply any custom kernel using `cv2.filter2D()`:

```python
dst = cv2.filter2D(img, ddepth, kernel)
```

- `ddepth`: Output image depth (-1 = same as input)
- `kernel`: A NumPy array defining the filter

### Example: Custom Kernels

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Emboss kernel
emboss_kernel = np.array([
    [-2, -1, 0],
    [-1,  1, 1],
    [ 0,  1, 2]
], dtype=np.float32)

# Edge enhance kernel
edge_kernel = np.array([
    [-1, -1, -1],
    [-1,  9, -1],
    [-1, -1, -1]
], dtype=np.float32)

# Ridge/outline kernel
ridge_kernel = np.array([
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
], dtype=np.float32)

embossed = cv2.filter2D(img, -1, emboss_kernel)
edge_enhanced = cv2.filter2D(img, -1, edge_kernel)
ridges = cv2.filter2D(img, -1, ridge_kernel)

cv2.imshow("Emboss", embossed)
cv2.imshow("Edge Enhance", edge_enhanced)
cv2.imshow("Ridge Detection", ridges)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Complete Noise Reduction Comparison

```python
import cv2
import numpy as np

def add_gaussian_noise(img, mean=0, sigma=25):
    """Add Gaussian noise to an image."""
    noise = np.random.normal(mean, sigma, img.shape).astype(np.float32)
    noisy = np.clip(img.astype(np.float32) + noise, 0, 255)
    return noisy.astype(np.uint8)

def add_salt_pepper_noise(img, amount=0.05):
    """Add salt-and-pepper noise to an image."""
    noisy = img.copy()
    # Salt
    salt = np.random.random(img.shape[:2]) < amount / 2
    noisy[salt] = 255
    # Pepper
    pepper = np.random.random(img.shape[:2]) < amount / 2
    noisy[pepper] = 0
    return noisy

# Load image
img = cv2.imread("landscape.jpg")

# Test with Gaussian noise
gaussian_noisy = add_gaussian_noise(img, sigma=30)

box_result = cv2.blur(gaussian_noisy, (5, 5))
gauss_result = cv2.GaussianBlur(gaussian_noisy, (5, 5), 0)
median_result = cv2.medianBlur(gaussian_noisy, 5)
bilateral_result = cv2.bilateralFilter(gaussian_noisy, 9, 75, 75)

print("=== Gaussian Noise Reduction ===")
print("Box filter: fast, moderate quality")
print("Gaussian: good balance of speed and quality")
print("Median: less effective for Gaussian noise")
print("Bilateral: best quality, slowest")

# Test with salt-and-pepper noise
sp_noisy = add_salt_pepper_noise(img, amount=0.05)

box_sp = cv2.blur(sp_noisy, (5, 5))
gauss_sp = cv2.GaussianBlur(sp_noisy, (5, 5), 0)
median_sp = cv2.medianBlur(sp_noisy, 5)

print("\n=== Salt & Pepper Noise Reduction ===")
print("Box filter: spreads noise (bad)")
print("Gaussian: spreads noise (bad)")
print("Median: eliminates noise completely (best)")

cv2.imshow("Gaussian Noise", gaussian_noisy)
cv2.imshow("Best for Gaussian: Bilateral", bilateral_result)
cv2.imshow("S&P Noise", sp_noisy)
cv2.imshow("Best for S&P: Median", median_sp)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Filter Comparison Table

| Filter | Speed | Edge Preservation | Best Noise Type | Linear? |
|--------|-------|-------------------|-----------------|---------|
| **Box** | Fastest | Poor | Light uniform | Yes |
| **Gaussian** | Fast | Poor | Gaussian | Yes |
| **Median** | Moderate | Good | Salt & pepper | No |
| **Bilateral** | Slow | Excellent | Gaussian | No |
| **Unsharp mask** | Fast | N/A (sharpens) | N/A | Yes |

### Choosing the Right Filter

1. **General noise reduction?** → Gaussian blur
2. **Salt-and-pepper noise?** → Median filter
3. **Need to preserve edges?** → Bilateral filter
4. **Fast, don't care about edges?** → Box filter
5. **Want to sharpen?** → Unsharp mask or Laplacian kernel

---

## Kernel Size Guidelines

| Kernel Size | Effect | Use Case |
|-------------|--------|----------|
| 3×3 | Slight smoothing | Minimal noise, keep detail |
| 5×5 | Moderate smoothing | Standard noise reduction |
| 7×7 | Strong smoothing | Significant noise |
| 11×11+ | Heavy smoothing | Background blur, extreme noise |

> **Rule of thumb:** Start with 5×5, increase if noise persists, decrease if losing too much detail.

---

## Try It Yourself

1. Load a photo and add Gaussian noise with different sigma values
2. Apply each filter type and compare visually
3. Create a custom emboss kernel and apply it with `filter2D`
4. Experiment: can you sharpen an already blurry image to recover detail?
5. Try bilateral filter on a portrait — notice how skin smooths but eyes stay sharp

---

## Summary

- **Convolution** slides a kernel over the image computing weighted sums
- **Box filter** averages all neighbors equally (simple but blurs edges)
- **Gaussian blur** weights center pixels more (natural, widely used)
- **Median filter** replaces with the median value (best for salt-and-pepper noise)
- **Bilateral filter** smooths while preserving edges (best quality, slowest)
- **Sharpening** enhances edges by subtracting a blurred version or using edge-emphasizing kernels
- Use `cv2.filter2D()` for any custom kernel operation
