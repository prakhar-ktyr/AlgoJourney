---
title: Pixel Manipulation & ROI
---

# Pixel Manipulation & ROI

Images in OpenCV are NumPy arrays. This means you can access and modify individual pixels, extract regions, split channels, and transform images using all the power of NumPy's array operations.

---

## Accessing Individual Pixels

Every pixel in an image can be accessed using array indexing. Remember: the order is **(row, column)**, which means **(y, x)** — not (x, y)!

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
if img is None:
    exit("Image not found!")

# Access a single pixel at row=100, col=200
# Returns [Blue, Green, Red] for a color image
pixel = img[100, 200]
print(f"Pixel at (100, 200): {pixel}")  # e.g., [142, 180, 215]

# Access individual channels
blue = img[100, 200, 0]
green = img[100, 200, 1]
red = img[100, 200, 2]
print(f"B={blue}, G={green}, R={red}")

# For grayscale images, just one value
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
intensity = gray[100, 200]
print(f"Gray intensity: {intensity}")
```

### Coordinate System

```
(0,0) ──── x (columns) ────►
  │
  │   img[y, x] or img[row, col]
  │
  y (rows)
  │
  ▼
```

> **Common mistake:** Writing `img[x, y]` instead of `img[y, x]`. NumPy uses (row, col) order!

---

## Modifying Pixels

You can set pixel values directly:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Set a single pixel to blue (BGR)
img[100, 200] = [255, 0, 0]

# Set a single pixel to white
img[50, 50] = [255, 255, 255]

# Draw a small red square (10x10 pixels) manually
for y in range(100, 110):
    for x in range(100, 110):
        img[y, x] = [0, 0, 255]

cv2.imshow("Modified", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Warning: Pixel-by-Pixel is SLOW in Python!

Python loops over pixels are extremely slow. Always use **NumPy vectorized operations** instead:

```python
import cv2
import numpy as np
import time

img = cv2.imread("photo.jpg")

# SLOW: Python loop (DON'T DO THIS)
start = time.time()
for y in range(100):
    for x in range(100):
        img[y, x] = [0, 0, 255]
slow_time = time.time() - start

# FAST: NumPy slicing (DO THIS)
start = time.time()
img[200:300, 0:100] = [0, 0, 255]
fast_time = time.time() - start

print(f"Loop: {slow_time * 1000:.2f} ms")
print(f"NumPy: {fast_time * 1000:.4f} ms")
print(f"NumPy is ~{slow_time / fast_time:.0f}x faster!")
```

---

## Region of Interest (ROI)

An ROI is a rectangular sub-region of an image. In NumPy, it's just array slicing:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Extract ROI: img[y1:y2, x1:x2]
# This gets rows 100-299 and columns 200-399
roi = img[100:300, 200:400]

print(f"Original shape: {img.shape}")  # e.g., (480, 640, 3)
print(f"ROI shape: {roi.shape}")       # (200, 200, 3)

# Display the ROI
cv2.imshow("ROI", roi)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Important: Views vs Copies

By default, NumPy slicing creates a **view** (not a copy). Modifying the ROI modifies the original!

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# This is a VIEW — changes affect the original
roi_view = img[100:200, 100:200]
roi_view[:] = [0, 255, 0]  # This turns that region GREEN in img!

# This is a COPY — changes do NOT affect the original
roi_copy = img[300:400, 300:400].copy()
roi_copy[:] = [255, 0, 0]  # Only roi_copy changes, img is unaffected

cv2.imshow("Modified Original", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Copy and Paste ROI

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Copy a region
face_roi = img[50:200, 100:250].copy()

# Paste it elsewhere (must be same size!)
img[50:200, 300:450] = face_roi

# Paste multiple times
img[250:400, 100:250] = face_roi
img[250:400, 300:450] = face_roi

cv2.imshow("Copied ROI", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Channel Manipulation

### Splitting Channels

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Method 1: cv2.split() — returns list of single-channel images
b, g, r = cv2.split(img)
print(f"Blue channel shape: {b.shape}")   # (height, width)
print(f"Green channel shape: {g.shape}")  # (height, width)
print(f"Red channel shape: {r.shape}")    # (height, width)

# Method 2: NumPy indexing (FASTER!)
b_fast = img[:, :, 0]  # Blue channel
g_fast = img[:, :, 1]  # Green channel
r_fast = img[:, :, 2]  # Red channel
```

### Merging Channels

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
b, g, r = cv2.split(img)

# Merge back into a BGR image
merged = cv2.merge([b, g, r])

# Swap channels (create RGB from BGR)
rgb = cv2.merge([r, g, b])

# Create image with only one channel active
blue_only = cv2.merge([b, np.zeros_like(g), np.zeros_like(r)])
green_only = cv2.merge([np.zeros_like(b), g, np.zeros_like(r)])
red_only = cv2.merge([np.zeros_like(b), np.zeros_like(g), r])

cv2.imshow("Blue Only", blue_only)
cv2.imshow("Green Only", green_only)
cv2.imshow("Red Only", red_only)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Modify Individual Channels

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Boost the red channel
img[:, :, 2] = cv2.add(img[:, :, 2], 50)

# Zero out the blue channel
img[:, :, 0] = 0

# Invert the green channel
img[:, :, 1] = 255 - img[:, :, 1]

cv2.imshow("Modified Channels", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Resizing Images

### Basic Resizing

```python
import cv2

img = cv2.imread("photo.jpg")
print(f"Original: {img.shape[1]}x{img.shape[0]}")  # width x height

# Resize to specific dimensions
resized = cv2.resize(img, (640, 480))  # (width, height)
print(f"Resized: {resized.shape[1]}x{resized.shape[0]}")

# Resize by scale factor
half = cv2.resize(img, None, fx=0.5, fy=0.5)
double = cv2.resize(img, None, fx=2.0, fy=2.0)

print(f"Half: {half.shape[1]}x{half.shape[0]}")
print(f"Double: {double.shape[1]}x{double.shape[0]}")
```

### Interpolation Methods

The interpolation method affects quality when resizing:

| Method | Constant | Best For |
|--------|----------|----------|
| Nearest neighbor | `cv2.INTER_NEAREST` | Speed, pixel art (no blending) |
| Bilinear | `cv2.INTER_LINEAR` | General upscaling (default) |
| Area-based | `cv2.INTER_AREA` | **Downscaling** (best quality) |
| Bicubic | `cv2.INTER_CUBIC` | High-quality upscaling |
| Lanczos | `cv2.INTER_LANCZOS4` | Highest quality upscaling |

```python
import cv2

img = cv2.imread("photo.jpg")

# Downscaling — use INTER_AREA
small = cv2.resize(img, (320, 240), interpolation=cv2.INTER_AREA)

# Upscaling — use INTER_CUBIC or INTER_LANCZOS4
large = cv2.resize(img, (1920, 1080), interpolation=cv2.INTER_CUBIC)

# Pixel art style — use INTER_NEAREST
pixelated = cv2.resize(
    cv2.resize(img, (32, 24), interpolation=cv2.INTER_AREA),
    (640, 480),
    interpolation=cv2.INTER_NEAREST
)

cv2.imshow("Pixelated", pixelated)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Resize While Keeping Aspect Ratio

```python
import cv2

def resize_keep_aspect(img, target_width=None, target_height=None):
    """Resize image while maintaining aspect ratio."""
    h, w = img.shape[:2]

    if target_width is not None:
        ratio = target_width / w
        new_size = (target_width, int(h * ratio))
    elif target_height is not None:
        ratio = target_height / h
        new_size = (int(w * ratio), target_height)
    else:
        return img

    return cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)

img = cv2.imread("photo.jpg")
resized = resize_keep_aspect(img, target_width=400)
print(f"Original: {img.shape[1]}x{img.shape[0]}")
print(f"Resized: {resized.shape[1]}x{resized.shape[0]}")
```

---

## Cropping

Cropping is simply ROI extraction — no special function needed:

```python
import cv2

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Crop center region
crop_size = 200
cx, cy = w // 2, h // 2
cropped = img[cy - crop_size:cy + crop_size,
              cx - crop_size:cx + crop_size]

# Crop top half
top_half = img[:h // 2, :]

# Crop right third
right_third = img[:, 2 * w // 3:]

cv2.imshow("Center Crop", cropped)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Padding / Borders

Add borders around an image using `cv2.copyMakeBorder()`:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# cv2.copyMakeBorder(img, top, bottom, left, right, borderType)

# Constant color border (black padding)
padded = cv2.copyMakeBorder(img, 50, 50, 50, 50,
                            cv2.BORDER_CONSTANT,
                            value=[0, 0, 0])

# Reflect border (mirror the edge pixels)
reflected = cv2.copyMakeBorder(img, 50, 50, 50, 50,
                               cv2.BORDER_REFLECT)

# Replicate border (repeat edge pixels)
replicated = cv2.copyMakeBorder(img, 50, 50, 50, 50,
                                cv2.BORDER_REPLICATE)

print(f"Original: {img.shape}")
print(f"Padded: {padded.shape}")
```

### Border Types

| Type | Constant | Behavior |
|------|----------|----------|
| Constant | `cv2.BORDER_CONSTANT` | Solid color fill |
| Reflect | `cv2.BORDER_REFLECT` | Mirror: abcba |
| Reflect 101 | `cv2.BORDER_REFLECT_101` | Mirror without edge: abcb |
| Replicate | `cv2.BORDER_REPLICATE` | Repeat edge: aaaa |
| Wrap | `cv2.BORDER_WRAP` | Tile: abcabc |

---

## Flipping Images

```python
import cv2

img = cv2.imread("photo.jpg")

# cv2.flip(img, flipCode)
# flipCode = 0: vertical flip (upside down)
# flipCode = 1: horizontal flip (mirror)
# flipCode = -1: both (180° rotation)

vertical = cv2.flip(img, 0)
horizontal = cv2.flip(img, 1)
both = cv2.flip(img, -1)

cv2.imshow("Original", img)
cv2.imshow("Vertical Flip", vertical)
cv2.imshow("Horizontal Flip", horizontal)
cv2.imshow("Both", both)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Rotation

### Simple 90° Rotations

```python
import cv2

img = cv2.imread("photo.jpg")

# Rotate 90° clockwise
rotated_90 = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# Rotate 90° counter-clockwise
rotated_270 = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

# Rotate 180°
rotated_180 = cv2.rotate(img, cv2.ROTATE_180)

print(f"Original: {img.shape}")
print(f"Rotated 90°: {rotated_90.shape}")  # width and height swap
```

### Arbitrary Angle Rotation

For angles other than 90°, use a rotation matrix:

```python
import cv2

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Get rotation matrix
# cv2.getRotationMatrix2D(center, angle, scale)
center = (w // 2, h // 2)
angle = 30  # degrees (counter-clockwise)
scale = 1.0

rotation_matrix = cv2.getRotationMatrix2D(center, angle, scale)

# Apply the rotation
rotated = cv2.warpAffine(img, rotation_matrix, (w, h))

cv2.imshow("Rotated 30°", rotated)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Quick Reference

| Operation | Code |
|-----------|------|
| Access pixel | `img[y, x]` |
| Set pixel | `img[y, x] = [B, G, R]` |
| Extract ROI | `roi = img[y1:y2, x1:x2]` |
| Copy ROI | `roi = img[y1:y2, x1:x2].copy()` |
| Paste ROI | `img[y1:y2, x1:x2] = roi` |
| Split channels | `b, g, r = cv2.split(img)` |
| Merge channels | `img = cv2.merge([b, g, r])` |
| Resize | `cv2.resize(img, (w, h))` |
| Flip | `cv2.flip(img, code)` |
| Rotate 90° | `cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)` |
| Add border | `cv2.copyMakeBorder(img, t, b, l, r, type)` |

---

## Key Takeaways

1. **Pixels are accessed as `img[y, x]`** — row first, then column
2. **Never use Python loops** for pixel operations — use NumPy
3. **ROI slicing creates a view** — use `.copy()` if you need independence
4. **`img[:, :, 0]`** is faster than `cv2.split()` for single channels
5. **Use `cv2.INTER_AREA`** for downscaling, `cv2.INTER_CUBIC` for upscaling
6. **Flip codes**: 0 = vertical, 1 = horizontal, -1 = both

---

## Exercises

1. Extract the four quadrants of an image and rearrange them (swap diagonals)
2. Create a "red-eye removal" tool that replaces red pixels in an ROI with dark gray
3. Build an image mosaic: resize 4 images and place them in a 2×2 grid
4. Implement a zoom tool that magnifies a 50×50 pixel area to 200×200
5. Benchmark `cv2.split()` vs NumPy indexing for extracting a single channel
