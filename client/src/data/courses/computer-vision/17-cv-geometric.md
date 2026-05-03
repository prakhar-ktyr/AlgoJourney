---
title: Geometric Transformations
---

# Geometric Transformations

In this lesson you will learn how to apply **geometric transformations** to images — operations that change the spatial arrangement of pixels without altering their values. These include translation, scaling, rotation, flipping, and shearing.

---

## What Are Geometric Transforms?

A geometric transformation maps each pixel from its original position $(x, y)$ to a new position $(x', y')$ using a transformation matrix.

| Transform | What It Does | Preserves |
|-----------|-------------|-----------|
| Translation | Shifts position | Shape, size, angles |
| Scaling | Resizes | Shape, angles |
| Rotation | Rotates around a point | Shape, size |
| Reflection | Flips across an axis | Shape, size |
| Shearing | Slants along an axis | Parallel lines |
| Affine | Combination of above | Parallel lines |

All 2D affine transforms can be represented as a $2 \times 3$ matrix applied via `cv2.warpAffine()`.

---

## Translation

Translation shifts every pixel by $(t_x, t_y)$:

$$M = \begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \end{bmatrix}$$

- $t_x > 0$: shift right
- $t_y > 0$: shift down

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Shift 100 pixels right and 50 pixels down
tx, ty = 100, 50
M = np.float32([
    [1, 0, tx],
    [0, 1, ty]
])

translated = cv2.warpAffine(img, M, (w, h))

cv2.imwrite("translated.jpg", translated)
print(f"Translated image by ({tx}, {ty}) pixels")
```

### Translate Without Losing Content

By default, pixels shifted outside the frame are lost. Expand the canvas:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

tx, ty = 100, 50

# Expand output size to fit the shifted image
M = np.float32([[1, 0, tx], [0, 1, ty]])
translated = cv2.warpAffine(img, M, (w + tx, h + ty))

print(f"Original size: {w}x{h}")
print(f"Translated size: {w + tx}x{h + ty}")
cv2.imwrite("translated_expanded.jpg", translated)
```

---

## Scaling (Resizing)

Scaling changes the size of an image:

```python
import cv2

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]
print(f"Original size: {w}x{h}")

# Method 1: Resize to specific dimensions
resized = cv2.resize(img, (800, 600))

# Method 2: Resize by scale factor
scaled_up = cv2.resize(img, None, fx=2.0, fy=2.0)
scaled_down = cv2.resize(img, None, fx=0.5, fy=0.5)

print(f"Scaled up: {scaled_up.shape[1]}x{scaled_up.shape[0]}")
print(f"Scaled down: {scaled_down.shape[1]}x{scaled_down.shape[0]}")
```

### Interpolation Methods

When resizing, OpenCV must estimate pixel values between original pixels:

```python
import cv2
import time

img = cv2.imread("photo.jpg")

interpolations = {
    "NEAREST": cv2.INTER_NEAREST,
    "LINEAR": cv2.INTER_LINEAR,
    "CUBIC": cv2.INTER_CUBIC,
    "AREA": cv2.INTER_AREA,
    "LANCZOS4": cv2.INTER_LANCZOS4,
}

print("Interpolation Method Comparison (3x upscale):")
print("-" * 45)

for name, method in interpolations.items():
    start = time.time()
    result = cv2.resize(img, None, fx=3, fy=3, interpolation=method)
    elapsed = (time.time() - start) * 1000
    print(f"{name:10s} | Size: {result.shape[1]}x{result.shape[0]} | Time: {elapsed:.1f}ms")
```

| Method | Best For | Quality | Speed |
|--------|----------|---------|-------|
| NEAREST | Pixel art, masks | Lowest | Fastest |
| LINEAR | General upscale (default) | Good | Fast |
| CUBIC | High-quality upscale | Better | Medium |
| AREA | Downscaling | Best for shrinking | Medium |
| LANCZOS4 | Highest quality upscale | Best | Slowest |

> **Rule of thumb:** Use `INTER_AREA` for downscaling and `INTER_CUBIC` or `INTER_LANCZOS4` for upscaling.

---

## Rotation

Rotate an image around a center point:

$$R = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$$

OpenCV provides a combined rotation + scale matrix:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Rotation parameters
center = (w // 2, h // 2)  # Rotate around image center
angle = 45                   # Degrees (counter-clockwise)
scale = 1.0                  # No scaling

# Get the rotation matrix
M = cv2.getRotationMatrix2D(center, angle, scale)

# Apply rotation
rotated = cv2.warpAffine(img, M, (w, h))

cv2.imwrite("rotated_45.jpg", rotated)
print(f"Rotated {angle} degrees around center {center}")
```

### Rotate Without Cropping

Rotation can clip corners. Calculate the new bounding box:

```python
import cv2
import numpy as np

def rotate_full(img, angle):
    """Rotate image without cropping corners."""
    h, w = img.shape[:2]
    center = (w // 2, h // 2)

    # Get rotation matrix
    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    # Compute new bounding box size
    cos_val = abs(M[0, 0])
    sin_val = abs(M[0, 1])
    new_w = int(h * sin_val + w * cos_val)
    new_h = int(h * cos_val + w * sin_val)

    # Adjust the translation in the rotation matrix
    M[0, 2] += (new_w - w) / 2
    M[1, 2] += (new_h - h) / 2

    rotated = cv2.warpAffine(img, M, (new_w, new_h))
    return rotated

img = cv2.imread("photo.jpg")
result = rotate_full(img, 30)
print(f"Original: {img.shape[1]}x{img.shape[0]}")
print(f"Rotated (no crop): {result.shape[1]}x{result.shape[0]}")
cv2.imwrite("rotated_no_crop.jpg", result)
```

---

## Reflection (Flipping)

Flip an image across axes:

```python
import cv2

img = cv2.imread("photo.jpg")

# flipCode = 1: horizontal (left-right)
# flipCode = 0: vertical (top-bottom)
# flipCode = -1: both axes (180° rotation)

flipped_h = cv2.flip(img, 1)
flipped_v = cv2.flip(img, 0)
flipped_both = cv2.flip(img, -1)

cv2.imwrite("flip_horizontal.jpg", flipped_h)
cv2.imwrite("flip_vertical.jpg", flipped_v)
cv2.imwrite("flip_both.jpg", flipped_both)

print("Flip code 1: Horizontal mirror")
print("Flip code 0: Vertical mirror")
print("Flip code -1: Both (180° rotation)")
```

---

## Shearing

Shearing slants an image along one axis:

### Horizontal Shear

$$M = \begin{bmatrix} 1 & sh_x & 0 \\ 0 & 1 & 0 \end{bmatrix}$$

### Vertical Shear

$$M = \begin{bmatrix} 1 & 0 & 0 \\ sh_y & 1 & 0 \end{bmatrix}$$

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Horizontal shear
shx = 0.3  # Shear factor
M_horizontal = np.float32([
    [1, shx, 0],
    [0, 1, 0]
])
# Expand width to fit sheared content
new_w = int(w + abs(shx) * h)
sheared_h = cv2.warpAffine(img, M_horizontal, (new_w, h))

# Vertical shear
shy = 0.2
M_vertical = np.float32([
    [1, 0, 0],
    [shy, 1, 0]
])
new_h = int(h + abs(shy) * w)
sheared_v = cv2.warpAffine(img, M_vertical, (w, new_h))

cv2.imwrite("sheared_horizontal.jpg", sheared_h)
cv2.imwrite("sheared_vertical.jpg", sheared_v)
print(f"Horizontal shear (factor={shx}): {new_w}x{h}")
print(f"Vertical shear (factor={shy}): {w}x{new_h}")
```

---

## Affine Transformation

An affine transformation is defined by **3 point correspondences** — three pairs of (source, destination) points.

Properties:
- Preserves **parallel lines**
- Preserves **ratios of distances** along lines
- Combines translation, rotation, scaling, and shearing

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Define 3 source points (triangle in original image)
src_pts = np.float32([
    [50, 50],
    [200, 50],
    [50, 200]
])

# Define 3 destination points (where they should map to)
dst_pts = np.float32([
    [10, 100],
    [200, 50],
    [100, 250]
])

# Compute the affine transformation matrix
M = cv2.getAffineTransform(src_pts, dst_pts)
print(f"Affine matrix:\n{M}")

# Apply the transformation
warped = cv2.warpAffine(img, M, (w, h))

cv2.imwrite("affine_transformed.jpg", warped)
```

### Visualize the Point Mapping

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

src_pts = np.float32([[50, 50], [200, 50], [50, 200]])
dst_pts = np.float32([[10, 100], [200, 50], [100, 250]])

M = cv2.getAffineTransform(src_pts, dst_pts)
warped = cv2.warpAffine(img, M, (w, h))

# Draw source points on original
img_marked = img.copy()
for pt in src_pts:
    cv2.circle(img_marked, tuple(pt.astype(int)), 10, (0, 0, 255), -1)

# Draw destination points on warped
warped_marked = warped.copy()
for pt in dst_pts:
    cv2.circle(warped_marked, tuple(pt.astype(int)), 10, (0, 255, 0), -1)

cv2.imwrite("affine_src_points.jpg", img_marked)
cv2.imwrite("affine_dst_points.jpg", warped_marked)
```

---

## Combining Transformations

Multiple transformations can be combined via **matrix multiplication**:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Step 1: Translate to origin
T1 = np.float32([
    [1, 0, -w / 2],
    [0, 1, -h / 2],
    [0, 0, 1]
])

# Step 2: Rotate 30 degrees
angle = np.radians(30)
R = np.float32([
    [np.cos(angle), -np.sin(angle), 0],
    [np.sin(angle),  np.cos(angle), 0],
    [0, 0, 1]
])

# Step 3: Scale by 0.8
S = np.float32([
    [0.8, 0, 0],
    [0, 0.8, 0],
    [0, 0, 1]
])

# Step 4: Translate back
T2 = np.float32([
    [1, 0, w / 2],
    [0, 1, h / 2],
    [0, 0, 1]
])

# Combined transformation: T2 @ S @ R @ T1
combined = T2 @ S @ R @ T1

# Extract 2x3 matrix for warpAffine
M = combined[:2, :]

result = cv2.warpAffine(img, M, (w, h))
cv2.imwrite("combined_transform.jpg", result)
print("Applied: translate-to-origin → rotate 30° → scale 0.8 → translate-back")
```

---

## Practical: Straighten a Rotated Document

```python
import cv2
import numpy as np

def straighten_document(image_path):
    """Detect rotation angle and straighten a document image."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Threshold to get text regions
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Find coordinates of all white (text) pixels
    coords = np.column_stack(np.where(binary > 0))

    # Fit a minimum area rectangle
    # Returns: center, (width, height), angle
    rect = cv2.minAreaRect(coords)
    angle = rect[2]

    # Adjust angle (minAreaRect returns angles in [-90, 0))
    if angle < -45:
        angle = 90 + angle

    print(f"Detected rotation angle: {angle:.2f} degrees")

    # Rotate to straighten
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    straightened = cv2.warpAffine(img, M, (w, h),
                                   flags=cv2.INTER_CUBIC,
                                   borderMode=cv2.BORDER_REPLICATE)

    cv2.imwrite("straightened_document.jpg", straightened)
    return straightened

# Usage
result = straighten_document("tilted_document.jpg")
```

---

## Border Modes

When transforming, pixels outside the original image need a fill strategy:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

M = cv2.getRotationMatrix2D((w // 2, h // 2), 30, 1.0)

# Different border modes
modes = {
    "CONSTANT": cv2.BORDER_CONSTANT,
    "REPLICATE": cv2.BORDER_REPLICATE,
    "REFLECT": cv2.BORDER_REFLECT,
    "WRAP": cv2.BORDER_WRAP,
}

for name, mode in modes.items():
    result = cv2.warpAffine(img, M, (w, h),
                             borderMode=mode,
                             borderValue=(128, 128, 128))
    cv2.imwrite(f"border_{name.lower()}.jpg", result)
    print(f"{name}: fills empty areas with {name.lower()} strategy")
```

| Mode | Description |
|------|-------------|
| CONSTANT | Fill with a constant color (default: black) |
| REPLICATE | Repeat edge pixels |
| REFLECT | Mirror at boundary |
| WRAP | Tile/wrap around |

---

## Summary

| Transform | Matrix | Function |
|-----------|--------|----------|
| Translation | $\begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \end{bmatrix}$ | `cv2.warpAffine()` |
| Scaling | — | `cv2.resize()` |
| Rotation | Via `getRotationMatrix2D` | `cv2.warpAffine()` |
| Flip | — | `cv2.flip()` |
| Shear | Custom 2×3 matrix | `cv2.warpAffine()` |
| Affine | 3-point correspondence | `cv2.getAffineTransform()` |

**Key takeaways:**
- All 2D transforms that preserve parallel lines are **affine**
- `cv2.warpAffine()` is the workhorse for applying 2×3 transformation matrices
- Combine transforms by multiplying matrices (right-to-left order)
- Always consider output canvas size and border handling
- Use appropriate interpolation: AREA for downscale, CUBIC for upscale

---

## Exercises

1. Write a function that translates an image so a given point ends up at the center.
2. Rotate an image by 15° increments from 0° to 345° and save all 24 versions.
3. Combine shear + rotation + scale into a single matrix and apply it in one `warpAffine` call.
4. Build a document straightener that works on photos of printed text taken at an angle.
