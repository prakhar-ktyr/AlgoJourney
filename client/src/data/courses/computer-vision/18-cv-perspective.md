---
title: Perspective & Affine Transforms
---

# Perspective & Affine Transforms

In this lesson you will learn about **perspective transformations** (homographies) — the most powerful 2D geometric transformation. Unlike affine transforms, perspective transforms can map any quadrilateral to any other quadrilateral, making them essential for document scanning, augmented reality, and view correction.

---

## Perspective Transformation (Homography)

A perspective transformation is defined by a $3 \times 3$ matrix $H$ that maps points from one plane to another:

$$\begin{bmatrix} x' \\ y' \\ w' \end{bmatrix} = H \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$

The actual pixel coordinates are obtained by dividing by $w'$:

$$x_{out} = \frac{x'}{w'}, \quad y_{out} = \frac{y'}{w'}$$

This division by $w'$ is what makes perspective transforms **non-linear** — unlike affine transforms, straight lines remain straight but parallel lines can converge.

### Key Properties

| Property | Affine | Perspective |
|----------|--------|-------------|
| Point correspondences needed | 3 | 4 |
| Preserves parallel lines | Yes | No |
| Preserves straight lines | Yes | Yes |
| Matrix size | 2×3 | 3×3 |
| Degrees of freedom | 6 | 8 |

---

## Basic Perspective Transform

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

# Define 4 source points (corners of a region in the image)
src_pts = np.float32([
    [100, 50],    # Top-left
    [400, 80],    # Top-right
    [380, 400],   # Bottom-right
    [80, 380]     # Bottom-left
])

# Define 4 destination points (where they should map to)
dst_pts = np.float32([
    [0, 0],       # Top-left
    [400, 0],     # Top-right
    [400, 400],   # Bottom-right
    [0, 400]      # Bottom-left
])

# Compute the perspective transformation matrix
M = cv2.getPerspectiveTransform(src_pts, dst_pts)
print(f"Homography matrix:\n{M}")

# Apply the transformation
warped = cv2.warpPerspective(img, M, (400, 400))

cv2.imwrite("perspective_result.jpg", warped)
print("Perspective transform applied successfully")
```

---

## Document Scanner

One of the most common applications — extract a document from a photo and warp it to a flat rectangle.

### Full Pipeline

```python
import cv2
import numpy as np

def order_points(pts):
    """Order points as: top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype=np.float32)

    # Top-left has the smallest sum, bottom-right has the largest
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    # Top-right has the smallest difference, bottom-left has the largest
    d = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(d)]
    rect[3] = pts[np.argmax(d)]

    return rect


def detect_document(img):
    """Detect the document contour in an image."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Edge detection
    edges = cv2.Canny(blurred, 50, 150)

    # Dilate to close gaps in edges
    kernel = np.ones((3, 3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,
                                    cv2.CHAIN_APPROX_SIMPLE)

    # Sort by area (largest first)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours[:5]:
        # Approximate the contour
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        # If the approximation has 4 points, it's likely a document
        if len(approx) == 4:
            return approx.reshape(4, 2)

    return None


def warp_document(img, pts):
    """Warp detected document to a flat rectangle."""
    rect = order_points(pts)
    tl, tr, br, bl = rect

    # Compute output width
    width_top = np.linalg.norm(tr - tl)
    width_bottom = np.linalg.norm(br - bl)
    max_width = int(max(width_top, width_bottom))

    # Compute output height
    height_left = np.linalg.norm(bl - tl)
    height_right = np.linalg.norm(br - tr)
    max_height = int(max(height_left, height_right))

    # Destination points
    dst = np.float32([
        [0, 0],
        [max_width - 1, 0],
        [max_width - 1, max_height - 1],
        [0, max_height - 1]
    ])

    # Compute and apply perspective transform
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(img, M, (max_width, max_height))

    return warped


def scan_document(image_path):
    """Complete document scanning pipeline."""
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not load image")
        return None

    print(f"Image size: {img.shape[1]}x{img.shape[0]}")

    # Step 1: Detect document corners
    corners = detect_document(img)
    if corners is None:
        print("Error: Could not detect document")
        return None

    print(f"Detected corners:\n{corners}")

    # Step 2: Draw detected corners on original
    img_debug = img.copy()
    for i, pt in enumerate(corners):
        cv2.circle(img_debug, tuple(pt.astype(int)), 10, (0, 255, 0), -1)
        cv2.putText(img_debug, str(i), tuple(pt.astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.imwrite("document_corners.jpg", img_debug)

    # Step 3: Warp to rectangle
    scanned = warp_document(img, corners)
    cv2.imwrite("scanned_document.jpg", scanned)
    print(f"Scanned document size: {scanned.shape[1]}x{scanned.shape[0]}")

    return scanned

# Run the scanner
result = scan_document("photo_of_document.jpg")
```

---

## Bird's Eye View (Top-Down Transform)

Convert a perspective view (e.g., road camera) to a top-down view:

```python
import cv2
import numpy as np

def birds_eye_view(img, src_points, output_size=(600, 800)):
    """Transform a perspective view to a bird's eye (top-down) view."""
    w, h = output_size

    # Source: 4 points forming a trapezoid in the perspective image
    src = np.float32(src_points)

    # Destination: rectangle (top-down view)
    dst = np.float32([
        [0, 0],
        [w, 0],
        [w, h],
        [0, h]
    ])

    # Compute homography
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(img, M, (w, h))

    return warped, M


# Example: road view to bird's eye
img = cv2.imread("road_view.jpg")
h, w = img.shape[:2]

# Define the road region (trapezoid) — adjust for your image
src_points = [
    [w * 0.4, h * 0.65],   # Top-left of road
    [w * 0.6, h * 0.65],   # Top-right of road
    [w * 0.9, h * 0.95],   # Bottom-right of road
    [w * 0.1, h * 0.95]    # Bottom-left of road
]

bev, M = birds_eye_view(img, src_points)
cv2.imwrite("birds_eye_view.jpg", bev)
print("Bird's eye view generated")

# Draw source region on original
img_marked = img.copy()
pts = np.array(src_points, dtype=np.int32)
cv2.polylines(img_marked, [pts], True, (0, 255, 0), 3)
cv2.imwrite("road_region_marked.jpg", img_marked)
```

---

## Inverse Perspective Mapping

Map points from the warped image back to the original:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

src_pts = np.float32([[100, 100], [400, 80], [420, 350], [60, 370]])
dst_pts = np.float32([[0, 0], [300, 0], [300, 400], [0, 400]])

# Forward transform
M_forward = cv2.getPerspectiveTransform(src_pts, dst_pts)
warped = cv2.warpPerspective(img, M_forward, (300, 400))

# Inverse transform (warp back)
M_inverse = cv2.getPerspectiveTransform(dst_pts, src_pts)
restored = cv2.warpPerspective(warped, M_inverse, (w, h))

# Alternative: use the WARP_INVERSE_MAP flag
restored_flag = cv2.warpPerspective(warped, M_forward, (w, h),
                                     flags=cv2.WARP_INVERSE_MAP)

cv2.imwrite("warped_forward.jpg", warped)
cv2.imwrite("warped_inverse.jpg", restored)
print("Forward and inverse transforms applied")
```

---

## Affine vs Perspective: Visual Comparison

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("grid.jpg")
h, w = img.shape[:2]

# === Affine Transform (3 points) ===
src_affine = np.float32([[50, 50], [w - 50, 50], [50, h - 50]])
dst_affine = np.float32([[80, 100], [w - 30, 60], [100, h - 60]])

M_affine = cv2.getAffineTransform(src_affine, dst_affine)
result_affine = cv2.warpAffine(img, M_affine, (w, h))

# === Perspective Transform (4 points) ===
src_persp = np.float32([[50, 50], [w - 50, 50], [w - 50, h - 50], [50, h - 50]])
dst_persp = np.float32([[100, 80], [w - 30, 120], [w - 80, h - 30], [80, h - 80]])

M_persp = cv2.getPerspectiveTransform(src_persp, dst_persp)
result_persp = cv2.warpPerspective(img, M_persp, (w, h))

# Display comparison
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
axes[0].set_title("Original")
axes[1].imshow(cv2.cvtColor(result_affine, cv2.COLOR_BGR2RGB))
axes[1].set_title("Affine (3 points)")
axes[2].imshow(cv2.cvtColor(result_persp, cv2.COLOR_BGR2RGB))
axes[2].set_title("Perspective (4 points)")
plt.tight_layout()
plt.savefig("affine_vs_perspective.png")
plt.show()
```

### Comparison Table

| Property | Affine | Perspective |
|----------|--------|-------------|
| Points needed | 3 | 4 |
| Matrix size | 2×3 (6 params) | 3×3 (8 params) |
| Parallel lines | Preserved | NOT preserved |
| Straight lines | Preserved | Preserved |
| Function | `getAffineTransform` | `getPerspectiveTransform` |
| Warp function | `warpAffine` | `warpPerspective` |
| Use case | Rotation, scale, shear | Camera perspective, document scan |

---

## RANSAC for Robust Homography

When point correspondences contain outliers (wrong matches), use RANSAC to find a robust homography:

```python
import cv2
import numpy as np

def find_robust_homography(src_points, dst_points, threshold=5.0):
    """
    Find homography using RANSAC — robust to outliers.

    Parameters:
        src_points: Nx2 array of source points
        dst_points: Nx2 array of destination points
        threshold: Maximum reprojection error to consider a point an inlier

    Returns:
        H: 3x3 homography matrix
        mask: Boolean mask of inlier points
    """
    src = np.float32(src_points).reshape(-1, 1, 2)
    dst = np.float32(dst_points).reshape(-1, 1, 2)

    # Find homography with RANSAC
    H, mask = cv2.findHomography(src, dst, cv2.RANSAC, threshold)

    # Count inliers
    inliers = mask.ravel().sum()
    total = len(mask)
    print(f"Inliers: {inliers}/{total} ({100 * inliers / total:.1f}%)")

    return H, mask.ravel().astype(bool)


# Example with noisy correspondences
np.random.seed(42)

# True correspondences (simulate a known transform)
n_points = 50
src_pts = np.random.rand(n_points, 2) * 400

# True homography
H_true = np.array([
    [1.2, 0.1, 30],
    [-0.05, 1.1, 20],
    [0.0002, 0.0001, 1]
], dtype=np.float64)

# Compute true destinations
src_hom = np.hstack([src_pts, np.ones((n_points, 1))])
dst_hom = (H_true @ src_hom.T).T
dst_pts = dst_hom[:, :2] / dst_hom[:, 2:3]

# Add outliers (20% wrong matches)
n_outliers = 10
outlier_idx = np.random.choice(n_points, n_outliers, replace=False)
dst_pts[outlier_idx] = np.random.rand(n_outliers, 2) * 400

# Find robust homography
H_estimated, inlier_mask = find_robust_homography(src_pts, dst_pts)

print(f"\nTrue homography:\n{H_true}")
print(f"\nEstimated homography:\n{H_estimated}")
print(f"\nOutliers correctly identified: "
      f"{(~inlier_mask[outlier_idx]).sum()}/{n_outliers}")
```

### RANSAC Methods

```python
import cv2
import numpy as np

src = np.random.rand(100, 1, 2).astype(np.float32) * 400
dst = np.random.rand(100, 1, 2).astype(np.float32) * 400

# Different estimation methods
methods = {
    "Standard (all points)": 0,
    "RANSAC": cv2.RANSAC,
    "LMEDS (Least Median)": cv2.LMEDS,
    "RHO (PROSAC-based)": cv2.RHO,
}

for name, method in methods.items():
    if method == 0:
        H, _ = cv2.findHomography(src, dst, 0)
    else:
        H, mask = cv2.findHomography(src, dst, method, 5.0)
        if mask is not None:
            inliers = mask.ravel().sum()
            print(f"{name}: {inliers} inliers")
```

| Method | Description | Best For |
|--------|-------------|----------|
| `0` | Use all points (least-squares) | No outliers |
| `cv2.RANSAC` | Random sample consensus | General use, many outliers |
| `cv2.LMEDS` | Least-median of squares | Up to 50% outliers |
| `cv2.RHO` | PROSAC-based | Sorted by quality |

---

## License Plate Rectification

```python
import cv2
import numpy as np

def rectify_plate(img, plate_corners):
    """
    Rectify a license plate from a perspective view.

    Parameters:
        img: Input image
        plate_corners: 4 corners of the detected plate [TL, TR, BR, BL]
    """
    # Standard license plate aspect ratio (approx 4.5:1)
    plate_width = 450
    plate_height = 100

    src = np.float32(plate_corners)
    dst = np.float32([
        [0, 0],
        [plate_width, 0],
        [plate_width, plate_height],
        [0, plate_height]
    ])

    M = cv2.getPerspectiveTransform(src, dst)
    rectified = cv2.warpPerspective(img, M, (plate_width, plate_height))

    return rectified


# Example usage
img = cv2.imread("car_photo.jpg")

# Assume we detected plate corners (from contour detection)
plate_corners = [
    [220, 340],  # Top-left
    [410, 355],  # Top-right
    [415, 395],  # Bottom-right
    [215, 380]   # Bottom-left
]

rectified = rectify_plate(img, plate_corners)
cv2.imwrite("plate_rectified.jpg", rectified)
print(f"Rectified plate size: {rectified.shape[1]}x{rectified.shape[0]}")
```

---

## Finding Corners Automatically

Combine edge detection + contour approximation to find quadrilateral corners:

```python
import cv2
import numpy as np

def find_quadrilateral(img, min_area_ratio=0.1):
    """
    Automatically find the largest quadrilateral in an image.

    Parameters:
        img: Input BGR image
        min_area_ratio: Minimum area as fraction of image area

    Returns:
        corners: 4x2 array of corner points, or None
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    min_area = h * w * min_area_ratio

    # Preprocessing
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100)

    # Close gaps
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,
                                    cv2.CHAIN_APPROX_SIMPLE)

    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        area = cv2.contourArea(contour)
        if area < min_area:
            break

        # Approximate polygon
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        if len(approx) == 4:
            return approx.reshape(4, 2)

    return None


# Usage
img = cv2.imread("document_photo.jpg")
corners = find_quadrilateral(img)

if corners is not None:
    print(f"Found quadrilateral corners:\n{corners}")

    # Draw corners
    for pt in corners:
        cv2.circle(img, tuple(pt), 8, (0, 255, 0), -1)
    cv2.imwrite("detected_quad.jpg", img)
else:
    print("No quadrilateral found")
```

---

## Warp Flags and Border Handling

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
h, w = img.shape[:2]

src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[50, 50], [w - 30, 80], [w - 50, h - 30], [30, h - 50]])
M = cv2.getPerspectiveTransform(src, dst)

# Interpolation flags
result_nn = cv2.warpPerspective(img, M, (w, h),
                                 flags=cv2.INTER_NEAREST)
result_cubic = cv2.warpPerspective(img, M, (w, h),
                                    flags=cv2.INTER_CUBIC)
result_lanczos = cv2.warpPerspective(img, M, (w, h),
                                      flags=cv2.INTER_LANCZOS4)

# Border handling
result_border = cv2.warpPerspective(img, M, (w, h),
                                     borderMode=cv2.BORDER_REFLECT,
                                     borderValue=(255, 255, 255))

print("Warp with different interpolation and border modes complete")
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Homography | 3×3 matrix mapping between two planes |
| 4-point transform | `cv2.getPerspectiveTransform()` |
| Warp | `cv2.warpPerspective()` |
| RANSAC homography | `cv2.findHomography(src, dst, cv2.RANSAC)` |
| Document scanner | Detect corners → order → warp to rectangle |
| Bird's eye view | Trapezoid → rectangle mapping |
| Inverse mapping | Swap src/dst or use `WARP_INVERSE_MAP` |

**Key takeaways:**
- Perspective transforms handle foreshortening and vanishing points
- 4 point correspondences define a unique homography
- RANSAC is essential when matches contain outliers
- The document scanner pipeline (detect → order → warp) is a widely-used pattern
- Affine = subset of perspective (when the last row is `[0, 0, 1]`)

---

## Exercises

1. Build a document scanner that takes a photo from your webcam and outputs a flat scan.
2. Create a bird's eye view from a dashcam video (process each frame).
3. Use RANSAC to stitch two overlapping images together (panorama preview).
4. Implement a virtual billboard: warp an advertisement image onto a blank billboard in a photo.
