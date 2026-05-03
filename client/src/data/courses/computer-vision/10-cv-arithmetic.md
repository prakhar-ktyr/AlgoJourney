---
title: Image Arithmetic & Blending
---

# Image Arithmetic & Blending

Image arithmetic lets you combine images, adjust brightness and contrast, and create effects like masks and overlays. Understanding the difference between OpenCV's saturated arithmetic and NumPy's modular arithmetic is critical.

---

## Image Addition

### cv2.add() — Saturated Addition

`cv2.add()` clips values at 255 (saturation). This is almost always what you want:

```python
import cv2
import numpy as np

# Create two simple arrays to demonstrate
a = np.array([[200, 100, 50]], dtype=np.uint8)
b = np.array([[100, 200, 10]], dtype=np.uint8)

# cv2.add clips at 255
result = cv2.add(a, b)
print(f"cv2.add: {result}")  # [[255, 255, 60]]
# 200+100=300 → clipped to 255
# 100+200=300 → clipped to 255
# 50+10=60   → stays 60
```

### NumPy Addition — Modular (Wraps Around)

NumPy uses modular arithmetic — values wrap around past 255:

```python
import numpy as np

a = np.array([[200, 100, 50]], dtype=np.uint8)
b = np.array([[100, 200, 10]], dtype=np.uint8)

# NumPy wraps around (modulo 256)
result = a + b
print(f"numpy add: {result}")  # [[44, 44, 60]]
# 200+100=300 → 300 % 256 = 44  ← WRONG for images!
# 100+200=300 → 300 % 256 = 44  ← WRONG for images!
# 50+10=60    → stays 60
```

### Visual Comparison

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
if img is None:
    img = np.random.randint(100, 200, (300, 400, 3), dtype=np.uint8)

# Add brightness using cv2.add (correct)
bright_cv2 = cv2.add(img, np.full_like(img, 80))

# Add brightness using numpy (incorrect — wraps around)
bright_numpy = img + np.full_like(img, 80)

# The numpy version will have dark spots where values wrapped!
cv2.imshow("Original", img)
cv2.imshow("cv2.add (correct)", bright_cv2)
cv2.imshow("numpy + (wrong)", bright_numpy)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

> **Rule of thumb:** Always use `cv2.add()` for image addition. NumPy `+` gives unexpected dark pixels.

---

## Image Subtraction

### cv2.subtract() — Saturated Subtraction

`cv2.subtract()` clips values at 0 (no negative values):

```python
import cv2
import numpy as np

a = np.array([[50, 200, 100]], dtype=np.uint8)
b = np.array([[100, 50, 100]], dtype=np.uint8)

# cv2.subtract clips at 0
result = cv2.subtract(a, b)
print(f"cv2.subtract: {result}")  # [[0, 150, 0]]
# 50-100=-50 → clipped to 0
# 200-50=150 → stays 150
# 100-100=0  → stays 0
```

### Use Case: Change Detection

Subtraction reveals differences between two frames:

```python
import cv2
import numpy as np

# Simulate two frames (in practice, read from video)
frame1 = cv2.imread("frame1.jpg", cv2.IMREAD_GRAYSCALE)
frame2 = cv2.imread("frame2.jpg", cv2.IMREAD_GRAYSCALE)

if frame1 is not None and frame2 is not None:
    # Absolute difference catches changes in both directions
    diff = cv2.absdiff(frame1, frame2)

    # Threshold to get binary change mask
    _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

    # Count changed pixels
    changed_pixels = cv2.countNonZero(thresh)
    total_pixels = thresh.size
    change_pct = (changed_pixels / total_pixels) * 100

    print(f"Changed pixels: {changed_pixels} ({change_pct:.1f}%)")

    cv2.imshow("Difference", diff)
    cv2.imshow("Thresholded", thresh)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

---

## Scalar Operations: Brightness & Contrast

### Brightness Adjustment

Brightness is simply adding a constant value to all pixels:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Increase brightness by 50
brighter = cv2.add(img, np.full_like(img, 50))

# Decrease brightness by 50
darker = cv2.subtract(img, np.full_like(img, 50))

cv2.imshow("Original", img)
cv2.imshow("Brighter (+50)", brighter)
cv2.imshow("Darker (-50)", darker)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Contrast Adjustment

Contrast is multiplication — stretching the range of pixel values:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Increase contrast (multiply by > 1)
high_contrast = cv2.multiply(img, np.array([1.5]))

# Decrease contrast (multiply by < 1)
low_contrast = cv2.multiply(img, np.array([0.5]))

cv2.imshow("Original", img)
cv2.imshow("High Contrast (1.5x)", high_contrast.astype(np.uint8))
cv2.imshow("Low Contrast (0.5x)", low_contrast.astype(np.uint8))
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### The Brightness/Contrast Formula

The standard formula for simultaneous brightness and contrast adjustment:

$$g(x) = \alpha \cdot f(x) + \beta$$

Where:
- $f(x)$ = input pixel value
- $g(x)$ = output pixel value
- $\alpha$ = contrast (gain). Values > 1 increase contrast, < 1 decrease
- $\beta$ = brightness (bias). Positive = brighter, negative = darker

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# cv2.convertScaleAbs handles the formula + clipping in one call
# result = saturate(alpha * img + beta)
alpha = 1.5  # Contrast
beta = 30    # Brightness

adjusted = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

cv2.imshow("Original", img)
cv2.imshow(f"alpha={alpha}, beta={beta}", adjusted)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Interactive Brightness/Contrast

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
if img is None:
    img = np.random.randint(50, 200, (400, 600, 3), dtype=np.uint8)

def update(val):
    """Callback for trackbar changes."""
    alpha = cv2.getTrackbarPos("Contrast", "Adjust") / 100.0
    beta = cv2.getTrackbarPos("Brightness", "Adjust") - 100

    result = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    cv2.imshow("Adjust", result)

cv2.namedWindow("Adjust")
cv2.createTrackbar("Contrast", "Adjust", 100, 300, update)
cv2.createTrackbar("Brightness", "Adjust", 100, 200, update)

update(0)  # Initial display
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Bitwise Operations

Bitwise operations work on individual bits of pixel values. They're essential for creating and applying **masks**.

### The Four Bitwise Operations

```python
import cv2
import numpy as np

# Create two simple binary images
img1 = np.zeros((300, 300), dtype=np.uint8)
img2 = np.zeros((300, 300), dtype=np.uint8)

# White rectangle on img1
cv2.rectangle(img1, (50, 50), (200, 200), 255, -1)

# White circle on img2
cv2.circle(img2, (175, 175), 100, 255, -1)

# Bitwise operations
bit_and = cv2.bitwise_and(img1, img2)  # Intersection
bit_or = cv2.bitwise_or(img1, img2)    # Union
bit_xor = cv2.bitwise_xor(img1, img2)  # Exclusive OR
bit_not = cv2.bitwise_not(img1)        # Invert

cv2.imshow("img1 (rectangle)", img1)
cv2.imshow("img2 (circle)", img2)
cv2.imshow("AND (intersection)", bit_and)
cv2.imshow("OR (union)", bit_or)
cv2.imshow("XOR (exclusive)", bit_xor)
cv2.imshow("NOT img1", bit_not)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Bitwise Truth Table

For each pixel (treating 0 as False, non-zero as True):

| A | B | AND | OR | XOR | NOT A |
|---|---|-----|----|----|-------|
| 0 | 0 | 0 | 0 | 0 | 255 |
| 0 | 255 | 0 | 255 | 255 | 255 |
| 255 | 0 | 0 | 255 | 255 | 0 |
| 255 | 255 | 255 | 255 | 0 | 0 |

### Using Masks with Bitwise Operations

A **mask** is a binary image that defines which pixels to keep:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
if img is None:
    img = np.random.randint(0, 256, (400, 400, 3), dtype=np.uint8)

h, w = img.shape[:2]

# Create a circular mask
mask = np.zeros((h, w), dtype=np.uint8)
cv2.circle(mask, (w // 2, h // 2), min(h, w) // 3, 255, -1)

# Apply mask — only circular region is kept
masked = cv2.bitwise_and(img, img, mask=mask)

cv2.imshow("Original", img)
cv2.imshow("Mask", mask)
cv2.imshow("Masked Result", masked)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Image Blending (Alpha Blending)

Blending combines two images with adjustable transparency using the formula:

$$g(x) = \alpha \cdot f_1(x) + (1 - \alpha) \cdot f_2(x) + \gamma$$

Where:
- $\alpha$ = weight of first image (0.0 to 1.0)
- $(1 - \alpha)$ = weight of second image
- $\gamma$ = scalar added to the result (usually 0)

```python
import cv2
import numpy as np

img1 = cv2.imread("image1.jpg")
img2 = cv2.imread("image2.jpg")

# Images must be the same size!
# Resize img2 to match img1 if needed
if img1 is not None and img2 is not None:
    img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

    # Blend with different alpha values
    blend_25 = cv2.addWeighted(img1, 0.25, img2, 0.75, 0)
    blend_50 = cv2.addWeighted(img1, 0.50, img2, 0.50, 0)
    blend_75 = cv2.addWeighted(img1, 0.75, img2, 0.25, 0)

    cv2.imshow("25% img1 + 75% img2", blend_25)
    cv2.imshow("50% img1 + 50% img2", blend_50)
    cv2.imshow("75% img1 + 25% img2", blend_75)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

### Interactive Blending Slider

```python
import cv2
import numpy as np

img1 = cv2.imread("sunset.jpg")
img2 = cv2.imread("city.jpg")

if img1 is None or img2 is None:
    # Create demo images
    img1 = np.full((400, 600, 3), [255, 100, 0], dtype=np.uint8)
    img2 = np.full((400, 600, 3), [0, 100, 255], dtype=np.uint8)

# Ensure same size
img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

def on_trackbar(val):
    """Update blend on slider change."""
    alpha = val / 100.0
    blended = cv2.addWeighted(img1, alpha, img2, 1.0 - alpha, 0)
    cv2.imshow("Blending", blended)

cv2.namedWindow("Blending")
cv2.createTrackbar("Alpha %", "Blending", 50, 100, on_trackbar)

on_trackbar(50)  # Initial display
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Practical: Logo Overlay

Place a logo on an image using bitwise operations and masking:

```python
import cv2
import numpy as np

# Load the main image and logo
img = cv2.imread("background.jpg")
logo = cv2.imread("logo.png")

if img is None:
    img = np.full((500, 700, 3), [180, 160, 140], dtype=np.uint8)
if logo is None:
    # Create a simple demo logo
    logo = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.circle(logo, (50, 50), 40, (0, 255, 0), -1)
    cv2.putText(logo, "CV", (20, 60), cv2.FONT_HERSHEY_SIMPLEX,
                1, (255, 255, 255), 2)

# Resize logo if needed
logo = cv2.resize(logo, (100, 100))

# Get dimensions
logo_h, logo_w = logo.shape[:2]

# Position: top-right corner
y_offset, x_offset = 10, img.shape[1] - logo_w - 10

# Step 1: Create a grayscale version of the logo
logo_gray = cv2.cvtColor(logo, cv2.COLOR_BGR2GRAY)

# Step 2: Create binary mask (logo pixels = white, background = black)
_, mask = cv2.threshold(logo_gray, 10, 255, cv2.THRESH_BINARY)

# Step 3: Invert the mask
mask_inv = cv2.bitwise_not(mask)

# Step 4: Extract the ROI from the background where logo will go
roi = img[y_offset:y_offset + logo_h, x_offset:x_offset + logo_w]

# Step 5: Black out the logo area in the ROI
bg = cv2.bitwise_and(roi, roi, mask=mask_inv)

# Step 6: Extract only the logo pixels
fg = cv2.bitwise_and(logo, logo, mask=mask)

# Step 7: Combine background and foreground
combined = cv2.add(bg, fg)

# Step 8: Place back into the original image
img[y_offset:y_offset + logo_h, x_offset:x_offset + logo_w] = combined

cv2.imshow("Logo Overlay", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Comparison Table: cv2 vs NumPy Arithmetic

| Operation | cv2 Function | NumPy Equivalent | Difference |
|-----------|-------------|------------------|------------|
| Addition | `cv2.add(a, b)` | `a + b` | cv2 saturates at 255; NumPy wraps |
| Subtraction | `cv2.subtract(a, b)` | `a - b` | cv2 clips at 0; NumPy wraps |
| Abs difference | `cv2.absdiff(a, b)` | `np.abs(a-b)` | cv2 handles uint8 correctly |
| Multiply | `cv2.multiply(a, b)` | `a * b` | cv2 saturates; NumPy wraps |
| Weighted sum | `cv2.addWeighted(...)` | `a*α + b*β + γ` | cv2 handles clipping |

> **Best practice:** Use `cv2` functions for arithmetic on images. Use NumPy for creating arrays and boolean indexing.

---

## Summary of Arithmetic Operations

| Task | Function | Example |
|------|----------|---------|
| Brighten | `cv2.add(img, scalar)` | Add 50 to all pixels |
| Darken | `cv2.subtract(img, scalar)` | Subtract 50 from all pixels |
| Contrast | `cv2.convertScaleAbs(img, alpha, beta)` | $\alpha \cdot img + \beta$ |
| Blend | `cv2.addWeighted(img1, α, img2, 1-α, γ)` | Fade between images |
| Mask | `cv2.bitwise_and(img, img, mask=m)` | Keep only masked region |
| Invert | `cv2.bitwise_not(img)` | Flip all bits (negative) |
| Difference | `cv2.absdiff(img1, img2)` | Detect changes |

---

## Key Takeaways

1. **Always use `cv2.add()`** over `+` for images — saturation vs wrapping
2. **`cv2.addWeighted()`** is the standard way to blend two images
3. **Bitwise operations + masks** let you selectively modify image regions
4. **$g(x) = \alpha \cdot f(x) + \beta$** controls contrast ($\alpha$) and brightness ($\beta$)
5. **`cv2.absdiff()`** is perfect for detecting changes between frames
6. **Logo overlay** uses masks + bitwise_and to composite images cleanly
7. **NumPy arithmetic wraps** around 256 — this creates visual artifacts in images

---

## Exercises

1. Create a program that adjusts brightness and contrast with keyboard controls (+/- keys)
2. Implement a simple green-screen (chroma key) effect using HSV masking and blending
3. Build a "spot the difference" tool that highlights changes between two similar images
4. Create a watermark tool that places semi-transparent text across an image
5. Implement a fade transition between two images (animate alpha from 0 to 1)
