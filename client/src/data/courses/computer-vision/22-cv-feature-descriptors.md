---
title: Feature Descriptors
---

# Feature Descriptors

In this lesson, you will learn how to describe detected features with numerical vectors, enabling matching between different images of the same scene.

---

## Detection vs Description

Feature processing has two distinct stages:

| Stage | Question | Output |
|---|---|---|
| **Detection** | WHERE are interesting points? | Keypoint locations (x, y) |
| **Description** | WHAT does each point look like? | Descriptor vectors |

**Detection** finds keypoints. **Description** characterizes the local neighborhood around each keypoint so it can be recognized in another image.

---

## What Is a Feature Descriptor?

A **feature descriptor** is a numerical vector that summarizes the appearance of a small image patch around a keypoint.

**Good descriptors are:**
- **Distinctive:** Different features produce different descriptors
- **Invariant:** Same feature produces similar descriptors under transformations
- **Compact:** Small enough for fast matching
- **Fast to compute:** Practical for real-time use

**Analogy:** If keypoints are landmarks on a map, descriptors are detailed descriptions ("red brick building with a clock tower") that let you recognize the same landmark from a different viewpoint.

---

## SIFT (Scale-Invariant Feature Transform)

**SIFT** (1999, David Lowe) is the gold standard for feature description — highly distinctive and invariant to scale and rotation.

### How SIFT Works

SIFT has four main stages:

#### 1. Scale Space Construction

Build a **Difference of Gaussians (DoG)** pyramid:

$$D(x, y, \sigma) = L(x, y, k\sigma) - L(x, y, \sigma)$$

Where $L(x, y, \sigma) = G(x, y, \sigma) * I(x, y)$ is the image convolved with Gaussian at scale $\sigma$.

- Multiple octaves (image halved each time)
- Multiple scales per octave
- DoG approximates Laplacian of Gaussian (blob detector)

#### 2. Keypoint Localization

- Find local extrema in DoG across space AND scale
- Sub-pixel refinement using Taylor expansion
- Reject low-contrast points and edge responses

#### 3. Orientation Assignment

- Compute gradient magnitude and orientation in keypoint neighborhood
- Build 36-bin orientation histogram
- Dominant orientation → keypoint orientation
- Makes descriptor rotation invariant

#### 4. Descriptor Generation

- 16×16 pixel region around keypoint
- Divided into 4×4 sub-regions
- 8-bin orientation histogram per sub-region
- Result: $4 \times 4 \times 8 = 128$-dimensional descriptor
- Normalized to unit length for illumination invariance

### SIFT in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Create SIFT detector/descriptor
sift = cv2.SIFT_create(
    nfeatures=0,          # Max features (0 = no limit)
    nOctaveLayers=3,      # Layers per octave
    contrastThreshold=0.04,  # Filter low-contrast
    edgeThreshold=10,     # Filter edge responses
    sigma=1.6             # Initial Gaussian sigma
)

# Detect keypoints and compute descriptors
keypoints, descriptors = sift.detectAndCompute(gray, None)

# Print info
print(f"Number of keypoints: {len(keypoints)}")
print(f"Descriptor shape: {descriptors.shape}")
print(f"Descriptor dtype: {descriptors.dtype}")
print(f"Each descriptor: {descriptors.shape[1]} dimensions")

# Examine a single keypoint
kp = keypoints[0]
print(f"\nFirst keypoint:")
print(f"  Position: ({kp.pt[0]:.1f}, {kp.pt[1]:.1f})")
print(f"  Size (scale): {kp.size:.1f}")
print(f"  Angle: {kp.angle:.1f}°")
print(f"  Response: {kp.response:.4f}")
print(f"  Octave: {kp.octave}")

# Draw keypoints with size and orientation
img_sift = cv2.drawKeypoints(
    img, keypoints, None,
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
)

cv2.imshow("SIFT Keypoints", img_sift)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### SIFT Properties

| Property | Value |
|---|---|
| Descriptor size | 128 floats (512 bytes) |
| Scale invariant | Yes |
| Rotation invariant | Yes |
| Matching method | L2 (Euclidean) distance |
| Speed | Slow |
| Patent | Expired (2020) — now free |

---

## SURF (Speeded Up Robust Features)

**SURF** (2006) was designed to be faster than SIFT while maintaining similar quality.

### Key Ideas

- **Hessian-based detector:** Uses determinant of Hessian matrix for keypoints
- **Integral images:** Fast box filter approximations for speed
- **Haar wavelet responses:** For orientation and descriptor
- **64-dimensional descriptor** (or 128 for extended version)

### SURF vs SIFT

| Property | SIFT | SURF |
|---|---|---|
| Descriptor size | 128 | 64 (or 128 extended) |
| Speed | Slow | ~3× faster |
| Accuracy | Excellent | Very good |
| Scale invariant | Yes | Yes |
| Rotation invariant | Yes | Yes |

### Important Note on SURF

> **SURF is patented** and not included in the main OpenCV package. Use **ORB** as a free, fast alternative. SURF is available only in `opencv-contrib-python` with non-free modules enabled.

---

## ORB (Oriented FAST and Rotated BRIEF)

**ORB** (2011, by OpenCV developers) is a free, fast alternative to SIFT and SURF.

### How ORB Works

ORB combines two algorithms:

1. **FAST detector** (for keypoints) + orientation via intensity centroid
2. **BRIEF descriptor** (binary) + rotation compensation (rBRIEF)

#### Orientation (the "Oriented" part)

Uses **intensity centroid** to compute keypoint orientation:

$$\theta = \text{atan2}(m_{01}, m_{10})$$

Where $m_{pq} = \sum_{x,y} x^p y^q I(x,y)$ are image moments.

#### Descriptor (the "Rotated BRIEF" part)

- Select pairs of pixels in a pattern around keypoint
- Compare intensities: result is 0 or 1 per pair
- 256 binary comparisons → 256-bit descriptor
- Rotate the pattern by keypoint orientation → rotation invariant

### ORB in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Create ORB detector/descriptor
orb = cv2.ORB_create(
    nfeatures=1000,       # Max features
    scaleFactor=1.2,      # Pyramid scale factor
    nlevels=8,            # Number of pyramid levels
    edgeThreshold=31,     # Border where features are not detected
    patchSize=31,         # Patch size for BRIEF
    scoreType=cv2.ORB_HARRIS_SCORE  # or ORB_FAST_SCORE
)

# Detect and compute
keypoints, descriptors = orb.detectAndCompute(gray, None)

# Print info
print(f"Number of keypoints: {len(keypoints)}")
print(f"Descriptor shape: {descriptors.shape}")
print(f"Descriptor dtype: {descriptors.dtype}")  # uint8!
print(f"Each descriptor: {descriptors.shape[1]} bytes = {descriptors.shape[1] * 8} bits")

# Draw keypoints
img_orb = cv2.drawKeypoints(
    img, keypoints, None,
    color=(0, 255, 0),
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
)

cv2.imshow("ORB Keypoints", img_orb)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### ORB Properties

| Property | Value |
|---|---|
| Descriptor size | 256 bits (32 bytes) |
| Scale invariant | Yes (pyramid) |
| Rotation invariant | Yes (oriented BRIEF) |
| Matching method | Hamming distance |
| Speed | Very fast |
| Patent | Free (BSD license) |

---

## BRIEF (Binary Robust Independent Elementary Features)

**BRIEF** is a pure descriptor (no detector) that produces binary strings.

### How BRIEF Works

1. Smooth the image patch (reduce noise)
2. Select $n$ pairs of pixels $(p_i, q_i)$ in the patch
3. For each pair, compare intensities:

$$b_i = \begin{cases} 1 & \text{if } I(p_i) < I(q_i) \\ 0 & \text{otherwise} \end{cases}$$

4. Concatenate bits → binary descriptor

### BRIEF Advantages

- **Extremely fast** to compute (just intensity comparisons)
- **Very fast matching** (Hamming distance = XOR + bit count)
- **Memory efficient** (256 bits = 32 bytes vs 512 bytes for SIFT)

### BRIEF Limitation

- **Not rotation invariant** (ORB fixes this!)

---

## AKAZE (Accelerated KAZE)

**AKAZE** works in non-linear scale spaces (unlike SIFT/SURF which use linear Gaussian).

### Key Features

- Non-linear diffusion for scale space → preserves edges better
- Modified Local Difference Binary (M-LDB) descriptor
- Good balance of speed and accuracy

### AKAZE in OpenCV

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Create AKAZE
akaze = cv2.AKAZE_create(
    descriptor_type=cv2.AKAZE_DESCRIPTOR_MLDB,  # Binary descriptor
    descriptor_size=0,    # Full size
    descriptor_channels=3,
    threshold=0.001
)

# Detect and compute
keypoints, descriptors = akaze.detectAndCompute(gray, None)

print(f"AKAZE keypoints: {len(keypoints)}")
print(f"Descriptor shape: {descriptors.shape}")
print(f"Descriptor type: {descriptors.dtype}")

# Draw
img_akaze = cv2.drawKeypoints(img, keypoints, None,
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv2.imshow("AKAZE", img_akaze)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Drawing Keypoints

OpenCV provides `cv2.drawKeypoints()` with different visualization options:

```python
import cv2

img = cv2.imread("scene.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect with ORB
orb = cv2.ORB_create(500)
keypoints, descriptors = orb.detectAndCompute(gray, None)

# Simple: just circles at keypoint locations
img1 = cv2.drawKeypoints(img, keypoints, None, color=(0, 255, 0))

# Rich: circles sized by scale, lines showing orientation
img2 = cv2.drawKeypoints(
    img, keypoints, None,
    color=(0, 255, 0),
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
)

# Custom color for each keypoint (random)
img3 = cv2.drawKeypoints(
    img, keypoints, None,
    flags=cv2.DRAW_MATCHES_FLAGS_NOT_DRAW_SINGLE_POINTS
)

combined = np.hstack([img1, img2])
cv2.imshow("Simple | Rich Keypoints", combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Complete Example: SIFT vs ORB Comparison

```python
import cv2
import numpy as np
import time

# Load image
img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

print("=" * 60)
print("Feature Descriptor Comparison")
print("=" * 60)

# --- SIFT ---
sift = cv2.SIFT_create()
start = time.time()
kp_sift, desc_sift = sift.detectAndCompute(gray, None)
sift_time = time.time() - start

print(f"\nSIFT:")
print(f"  Keypoints: {len(kp_sift)}")
print(f"  Descriptor: {desc_sift.shape[1]}D float32")
print(f"  Memory per descriptor: {desc_sift[0].nbytes} bytes")
print(f"  Total memory: {desc_sift.nbytes / 1024:.1f} KB")
print(f"  Time: {sift_time*1000:.1f} ms")

# --- ORB ---
orb = cv2.ORB_create(nfeatures=len(kp_sift))  # Same number for fair comparison
start = time.time()
kp_orb, desc_orb = orb.detectAndCompute(gray, None)
orb_time = time.time() - start

print(f"\nORB:")
print(f"  Keypoints: {len(kp_orb)}")
print(f"  Descriptor: {desc_orb.shape[1] * 8} bits binary")
print(f"  Memory per descriptor: {desc_orb[0].nbytes} bytes")
print(f"  Total memory: {desc_orb.nbytes / 1024:.1f} KB")
print(f"  Time: {orb_time*1000:.1f} ms")

# --- AKAZE ---
akaze = cv2.AKAZE_create()
start = time.time()
kp_akaze, desc_akaze = akaze.detectAndCompute(gray, None)
akaze_time = time.time() - start

print(f"\nAKAZE:")
print(f"  Keypoints: {len(kp_akaze)}")
print(f"  Descriptor: {desc_akaze.shape[1] * 8} bits binary")
print(f"  Memory per descriptor: {desc_akaze[0].nbytes} bytes")
print(f"  Total memory: {desc_akaze.nbytes / 1024:.1f} KB")
print(f"  Time: {akaze_time*1000:.1f} ms")

# --- Speed comparison ---
print(f"\nSpeed ratio (SIFT=1x):")
print(f"  SIFT:  1.0x")
print(f"  ORB:   {sift_time/orb_time:.1f}x faster")
print(f"  AKAZE: {sift_time/akaze_time:.1f}x faster")

# --- Visualize ---
img_sift = cv2.drawKeypoints(img, kp_sift, None, (0, 0, 255),
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
img_orb = cv2.drawKeypoints(img, kp_orb, None, (0, 255, 0),
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
img_akaze = cv2.drawKeypoints(img, kp_akaze, None, (255, 0, 0),
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

combined = np.hstack([img_sift, img_orb, img_akaze])
cv2.imshow("SIFT (red) | ORB (green) | AKAZE (blue)", combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Descriptor Comparison Table

| Descriptor | Dimensions | Type | Size (bytes) | Matching | Speed | Quality |
|---|---|---|---|---|---|---|
| **SIFT** | 128 | float32 | 512 | L2 distance | Slow | Excellent |
| **SURF** | 64/128 | float32 | 256/512 | L2 distance | Medium | Very Good |
| **ORB** | 256 bits | binary | 32 | Hamming | Very Fast | Good |
| **BRIEF** | 256 bits | binary | 32 | Hamming | Very Fast | Moderate |
| **AKAZE** | 486 bits | binary | 61 | Hamming | Fast | Very Good |

---

## When to Use Which Descriptor?

| Scenario | Recommended | Why |
|---|---|---|
| Highest accuracy needed | SIFT | Best distinctiveness |
| Real-time application | ORB | Very fast, good quality |
| Mobile/embedded | ORB or BRIEF | Low memory, fast matching |
| Non-planar surfaces | AKAZE | Better with edges |
| General purpose | SIFT or ORB | Depends on speed needs |
| Patent-free required | ORB or AKAZE | Both free |

---

## Summary

| Concept | Key Takeaway |
|---|---|
| Descriptor | Numerical vector describing keypoint neighborhood |
| SIFT | 128D float, scale+rotation invariant, gold standard |
| ORB | 256-bit binary, fast, free alternative to SIFT |
| BRIEF | Binary descriptor, fastest computation |
| AKAZE | Non-linear scale space, good edge preservation |
| Matching | Float → L2 distance; Binary → Hamming distance |

In the next lesson, you will learn how to **match** descriptors between images and compute geometric transformations!

---
