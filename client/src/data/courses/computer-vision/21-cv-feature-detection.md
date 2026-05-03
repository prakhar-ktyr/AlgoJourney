---
title: Feature Detection
---

# Feature Detection

In this lesson, you will learn how to detect distinctive points and patterns in images — the foundation for image matching, tracking, and 3D reconstruction.

---

## What Are Features?

A **feature** is a distinctive, informative piece of an image that stands out from its surroundings.

Think of features as landmarks — points you could recognize again if you saw the same scene from a different angle or at a different time.

**Examples of features:**
- Corners of buildings
- Intersection of lines
- Distinctive texture patterns
- Isolated dots or marks

**Not good features:**
- Flat, uniform regions (sky, wall)
- Straight edges (hard to localize along the edge)

---

## Why Detect Features?

Feature detection is the first step in many computer vision tasks:

| Application | How Features Help |
|---|---|
| Image Matching | Find same points in two images |
| Object Tracking | Follow features across video frames |
| 3D Reconstruction | Triangulate 3D points from multiple views |
| Panorama Stitching | Align overlapping images |
| Visual Odometry | Estimate camera motion |
| Object Recognition | Match features to known objects |

---

## What Makes a Good Feature?

Not all image points are useful as features. Good features should be:

| Property | Meaning |
|---|---|
| **Unique** | Looks different from its neighbors |
| **Repeatable** | Found again under different conditions |
| **Local** | Defined by a small neighborhood |
| **Well-defined** | Can be precisely located |
| **Invariant** | Robust to transformations (rotation, scale) |

**Key insight:** Corners are excellent features because they are unique in both x and y directions!

---

## Corner Detection — Why Corners?

Consider sliding a small window over an image:

- **Flat region:** No change in any direction → bad feature
- **Edge:** Change in one direction only → hard to localize along edge
- **Corner:** Change in ALL directions → easy to pinpoint!

This is why most feature detectors focus on finding corners.

---

## Harris Corner Detector

The **Harris corner detector** (1988) is one of the most fundamental feature detection algorithms.

### The Idea

For each pixel, consider how the image intensity changes when you shift a small window in any direction.

### Structure Tensor (Second Moment Matrix)

For each pixel, compute the **structure tensor**:

$$M = \sum_{(x,y) \in W} w(x,y) \begin{bmatrix} I_x^2 & I_xI_y \\ I_xI_y & I_y^2 \end{bmatrix}$$

Where:
- $I_x, I_y$ = image gradients in x and y directions
- $w(x,y)$ = window function (usually Gaussian)
- The sum is over all pixels in window $W$

### Corner Response Function

$$R = \det(M) - k \cdot (\text{trace}(M))^2$$

Where:
- $\det(M) = \lambda_1 \cdot \lambda_2$
- $\text{trace}(M) = \lambda_1 + \lambda_2$
- $k$ = sensitivity parameter (typically 0.04–0.06)
- $\lambda_1, \lambda_2$ = eigenvalues of $M$

### Interpreting R

| Condition | Region Type |
|---|---|
| $R > 0$ (large positive) | **Corner** |
| $R \approx 0$ | **Flat region** |
| $R < 0$ (large negative) | **Edge** |

### Harris Corner Detection in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = np.float32(gray)

# Harris corner detection
# Parameters: image, blockSize, ksize (Sobel), k
harris = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)

# Dilate to mark corners (makes them visible)
harris = cv2.dilate(harris, None)

# Threshold: mark corners on original image
# Corners where response > 1% of max response
threshold = 0.01 * harris.max()
img[harris > threshold] = [0, 0, 255]  # Red corners

cv2.imshow("Harris Corners", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Harris Parameters Explained

| Parameter | Description | Typical Value |
|---|---|---|
| `blockSize` | Neighborhood size for structure tensor | 2–5 |
| `ksize` | Sobel kernel size for gradients | 3 |
| `k` | Harris free parameter | 0.04–0.06 |

---

## Shi-Tomasi Corner Detector

**Shi-Tomasi** (1994) proposed a simpler and often better corner quality measure.

### The Difference from Harris

Instead of the Harris response function, Shi-Tomasi uses:

$$R = \min(\lambda_1, \lambda_2)$$

A point is a corner if the **minimum eigenvalue** exceeds a threshold.

**Why is this better?**
- More intuitive: a corner must have strong variation in ALL directions
- More stable in practice
- Directly gives "corner quality" as a single number

### Shi-Tomasi in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Shi-Tomasi corner detection
# Parameters: image, maxCorners, qualityLevel, minDistance
corners = cv2.goodFeaturesToTrack(
    gray,
    maxCorners=100,       # Maximum number of corners to return
    qualityLevel=0.01,    # Minimum quality (fraction of best corner)
    minDistance=10         # Minimum distance between corners (pixels)
)

# Draw corners
corners = np.intp(corners)  # Convert to integer

for corner in corners:
    x, y = corner.ravel()
    cv2.circle(img, (x, y), 5, (0, 255, 0), -1)

print(f"Detected {len(corners)} corners")

cv2.imshow("Shi-Tomasi Corners", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Parameters Explained

| Parameter | Description |
|---|---|
| `maxCorners` | Return at most this many corners (0 = no limit) |
| `qualityLevel` | Reject corners with quality < qualityLevel × bestQuality |
| `minDistance` | Minimum Euclidean distance between returned corners |

---

## FAST (Features from Accelerated Segment Test)

**FAST** (2006) is designed for real-time applications where speed matters more than everything else.

### How FAST Works

1. Consider a pixel $p$ with intensity $I_p$
2. Look at 16 pixels on a circle of radius 3 around $p$
3. $p$ is a corner if there are $N$ **contiguous** pixels that are ALL:
   - Brighter than $I_p + t$ (threshold), OR
   - Darker than $I_p - t$
4. Typically $N = 12$ (FAST-12) or $N = 9$ (FAST-9)

### Why FAST is Fast

- Simple intensity comparisons (no gradients!)
- High-speed test: check pixels 1, 5, 9, 13 first (at least 3 must pass)
- Can reject most non-corners with just 4 comparisons

### FAST in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Create FAST detector
fast = cv2.FastFeatureDetector_create(
    threshold=25,              # Intensity threshold
    nonmaxSuppression=True     # Remove adjacent corners
)

# Detect keypoints
keypoints = fast.detect(gray, None)

# Draw keypoints
img_fast = cv2.drawKeypoints(img, keypoints, None, color=(255, 0, 0))

print(f"FAST detected {len(keypoints)} keypoints")
print(f"Threshold: {fast.getThreshold()}")
print(f"NonmaxSuppression: {fast.getNonmaxSuppression()}")
print(f"Type: {fast.getType()}")  # 0=FAST_9_16, 1=FAST_7_12, 2=FAST_5_8

cv2.imshow("FAST Corners", img_fast)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### FAST Pros and Cons

| Pros | Cons |
|---|---|
| Extremely fast | Not scale invariant |
| Good for real-time | No orientation info |
| High repeatability | Sensitive to noise at low threshold |
| Simple implementation | Many features in textured regions |

---

## Sub-Pixel Accuracy

For precise applications, you can refine corner locations to **sub-pixel** accuracy:

```python
import cv2
import numpy as np

# Load and detect corners with Shi-Tomasi
img = cv2.imread("chessboard.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

corners = cv2.goodFeaturesToTrack(gray, 50, 0.01, 10)

# Refine to sub-pixel accuracy
criteria = (
    cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
    100,   # Max iterations
    0.001  # Desired accuracy (epsilon)
)

corners_subpix = cv2.cornerSubPix(
    gray,
    corners,
    winSize=(5, 5),      # Half of search window
    zeroZone=(-1, -1),   # No dead zone
    criteria=criteria
)

# Compare original vs refined
for i in range(min(5, len(corners))):
    orig = corners[i].ravel()
    refined = corners_subpix[i].ravel()
    print(f"Corner {i}: ({orig[0]:.1f}, {orig[1]:.1f}) -> ({refined[0]:.3f}, {refined[1]:.3f})")
```

Sub-pixel refinement is essential for:
- Camera calibration
- 3D reconstruction
- Precise measurements

---

## Complete Comparison: Harris vs Shi-Tomasi vs FAST

```python
import cv2
import numpy as np
import time

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# --- Harris Corner Detection ---
start = time.time()
gray_float = np.float32(gray)
harris = cv2.cornerHarris(gray_float, blockSize=2, ksize=3, k=0.04)
harris_time = time.time() - start

# Count Harris corners
threshold = 0.01 * harris.max()
harris_corners = np.where(harris > threshold)
harris_count = len(harris_corners[0])

# Draw Harris
img_harris = img.copy()
img_harris[harris > threshold] = [0, 0, 255]

# --- Shi-Tomasi Corner Detection ---
start = time.time()
shi_tomasi = cv2.goodFeaturesToTrack(gray, 500, 0.01, 10)
shi_tomasi_time = time.time() - start

shi_tomasi_count = len(shi_tomasi) if shi_tomasi is not None else 0

# Draw Shi-Tomasi
img_shi = img.copy()
if shi_tomasi is not None:
    for corner in np.intp(shi_tomasi):
        x, y = corner.ravel()
        cv2.circle(img_shi, (x, y), 4, (0, 255, 0), -1)

# --- FAST Detection ---
start = time.time()
fast = cv2.FastFeatureDetector_create(threshold=25)
keypoints_fast = fast.detect(gray, None)
fast_time = time.time() - start

fast_count = len(keypoints_fast)

# Draw FAST
img_fast = cv2.drawKeypoints(img, keypoints_fast, None, color=(255, 0, 0))

# --- Results ---
print("=" * 50)
print("Feature Detection Comparison")
print("=" * 50)
print(f"{'Method':<15} {'Corners':<10} {'Time (ms)':<12}")
print("-" * 50)
print(f"{'Harris':<15} {harris_count:<10} {harris_time*1000:.2f}")
print(f"{'Shi-Tomasi':<15} {shi_tomasi_count:<10} {shi_tomasi_time*1000:.2f}")
print(f"{'FAST':<15} {fast_count:<10} {fast_time*1000:.2f}")
print("=" * 50)

# Display all results
combined = np.hstack([img_harris, img_shi, img_fast])
cv2.imshow("Harris | Shi-Tomasi | FAST", combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Feature Detection Comparison Table

| Property | Harris | Shi-Tomasi | FAST |
|---|---|---|---|
| **Speed** | Moderate | Moderate | Very Fast |
| **Accuracy** | Good | Very Good | Good |
| **Repeatability** | High | High | Moderate |
| **Scale Invariant** | No | No | No |
| **Rotation Invariant** | Yes | Yes | No |
| **Sub-pixel** | With refinement | With refinement | No |
| **Best For** | General corners | Tracking (KLT) | Real-time apps |

---

## Practical Tips

1. **Choose the right detector** for your application:
   - Tracking → Shi-Tomasi (used by KLT tracker)
   - Real-time → FAST
   - General purpose → Harris or Shi-Tomasi

2. **Tune thresholds** based on your image:
   - Too low → too many features (noise)
   - Too high → miss important features

3. **Non-maximum suppression** prevents clusters of detections

4. **Use sub-pixel refinement** when precision matters

5. **Pre-process** with Gaussian blur to reduce noise before detection

---

## Summary

| Concept | Key Takeaway |
|---|---|
| Features | Distinctive image points (corners, blobs) |
| Harris | Structure tensor + corner response $R$ |
| Shi-Tomasi | $\min(\lambda_1, \lambda_2)$ — simpler, often better |
| FAST | Circle test — extremely fast, real-time ready |
| Sub-pixel | `cornerSubPix()` for precise localization |

In the next lesson, you will learn how to **describe** detected features with numerical vectors — enabling matching between images!

---
