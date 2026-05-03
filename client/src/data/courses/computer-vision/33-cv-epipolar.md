---
title: Epipolar Geometry
---

# Epipolar Geometry

In this lesson, you will learn the mathematical framework that describes the geometric relationship between two camera views. Epipolar geometry is the foundation for stereo matching, 3D reconstruction, and visual SLAM.

---

## What is Epipolar Geometry?

When the same 3D scene is photographed from two different viewpoints, there is a precise geometric relationship between the two images. **Epipolar geometry** describes this relationship.

Key question: Given a point in one image, where can its corresponding point be in the other image?

Answer: Not just anywhere — it must lie on a specific line called the **epipolar line**.

---

## Key Concepts

### Setup: Two Views of a Scene

Imagine two cameras looking at a 3D point $\mathbf{P}$:
- Camera 1 (center $O_1$) sees $\mathbf{P}$ at pixel $\mathbf{x}$
- Camera 2 (center $O_2$) sees $\mathbf{P}$ at pixel $\mathbf{x'}$

### Epipole

The **epipole** is the image of one camera's center in the other camera's image.

- $e$ = projection of $O_2$ onto image 1
- $e'$ = projection of $O_1$ onto image 2

The line connecting both camera centers is called the **baseline**.

### Epipolar Plane

The **epipolar plane** is defined by:
- The 3D point $\mathbf{P}$
- Camera center $O_1$
- Camera center $O_2$

Any triangle formed by a 3D point and the two camera centers defines an epipolar plane.

### Epipolar Line

The **epipolar line** is where the epipolar plane intersects the image plane:
- $l$ = epipolar line in image 1 (passes through $e$)
- $l'$ = epipolar line in image 2 (passes through $e'$)

---

## The Epipolar Constraint

The fundamental insight: if $\mathbf{x}$ is a point in image 1, its correspondence $\mathbf{x'}$ in image 2 must lie on the epipolar line $l'$.

This reduces the search from **2D** (entire image) to **1D** (a single line).

Mathematically, the epipolar constraint is:

$$
\mathbf{x'}^T F \mathbf{x} = 0
$$

Where $F$ is the **Fundamental matrix**.

---

## The Fundamental Matrix (F)

### Properties

| Property | Value |
|----------|-------|
| Size | 3×3 |
| Rank | 2 (singular) |
| Degrees of freedom | 7 (9 entries - 1 scale - 1 rank constraint) |
| Maps | Point → Epipolar line |

### What F Does

- $l' = F\mathbf{x}$ — epipolar line in image 2 for point $\mathbf{x}$ in image 1
- $l = F^T\mathbf{x'}$ — epipolar line in image 1 for point $\mathbf{x'}$ in image 2
- $Fe = 0$ and $F^T e' = 0$ — epipoles are null spaces of $F$

### Computing F with OpenCV

```python
import numpy as np
import cv2

# Load two images of the same scene
img1 = cv2.imread("view1.jpg")
img2 = cv2.imread("view2.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Detect keypoints and compute descriptors
sift = cv2.SIFT_create()
kp1, des1 = sift.detectAndCompute(gray1, None)
kp2, des2 = sift.detectAndCompute(gray2, None)

# Match features
bf = cv2.BFMatcher()
matches = bf.knnMatch(des1, des2, k=2)

# Apply ratio test (Lowe's)
good_matches = []
for m, n in matches:
    if m.distance < 0.7 * n.distance:
        good_matches.append(m)

print(f"Good matches: {len(good_matches)}")

# Extract matched point coordinates
pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches])
pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches])

# Compute Fundamental matrix using RANSAC
F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_RANSAC, 1.0, 0.99)

# Filter inlier points
inlier_mask = mask.ravel() == 1
pts1_inliers = pts1[inlier_mask]
pts2_inliers = pts2[inlier_mask]

print(f"Inliers: {inlier_mask.sum()} / {len(good_matches)}")
print(f"Fundamental Matrix:\n{F}")
```

### Verifying the Epipolar Constraint

```python
# For each inlier pair, x'^T F x should be close to 0
errors = []
for p1, p2 in zip(pts1_inliers, pts2_inliers):
    x1 = np.array([p1[0], p1[1], 1.0])
    x2 = np.array([p2[0], p2[1], 1.0])
    error = abs(x2 @ F @ x1)
    errors.append(error)

print(f"Mean epipolar error: {np.mean(errors):.6f}")
print(f"Max epipolar error: {np.max(errors):.6f}")
# Should be very close to 0 for good matches
```

---

## The Essential Matrix (E)

For **calibrated** cameras (known intrinsics $K$), we use the Essential matrix:

$$
E = K'^T F K
$$

### Properties

| Property | Value |
|----------|-------|
| Size | 3×3 |
| Rank | 2 |
| Degrees of freedom | 5 |
| Constraint | Two equal singular values, third is 0 |
| Contains | Rotation $R$ and translation $t$ (up to scale) |

### Decomposition

The Essential matrix encodes the relative pose between cameras:

$$
E = [t]_\times R
$$

Where $[t]_\times$ is the skew-symmetric matrix of $t$.

### Computing E and Recovering Pose

```python
# Camera intrinsic matrix (from calibration)
K = np.array([
    [718.856, 0, 607.193],
    [0, 718.856, 185.216],
    [0, 0, 1]
])

# Compute Essential matrix
E, mask_e = cv2.findEssentialMat(
    pts1_inliers, pts2_inliers, K,
    method=cv2.RANSAC, prob=0.999, threshold=1.0
)

print(f"Essential Matrix:\n{E}")

# Recover rotation and translation from E
_, R, t, mask_pose = cv2.recoverPose(E, pts1_inliers, pts2_inliers, K)

print(f"\nRotation Matrix:\n{R}")
print(f"\nTranslation (unit vector):\n{t.ravel()}")
print(f"Points in front of both cameras: {mask_pose.sum()}")
```

**Note**: Translation $t$ is recovered only up to **scale** — you cannot determine the absolute distance between cameras without additional information.

---

## Computing and Drawing Epipolar Lines

```python
def draw_epipolar_lines(img1, img2, lines, pts1, pts2):
    """
    Draw epipolar lines on img1 for points in img2.
    """
    h, w = img1.shape[:2]
    img1_color = cv2.cvtColor(img1, cv2.COLOR_GRAY2BGR) if len(img1.shape) == 2 else img1.copy()
    img2_color = cv2.cvtColor(img2, cv2.COLOR_GRAY2BGR) if len(img2.shape) == 2 else img2.copy()

    for line, pt1, pt2 in zip(lines, pts1, pts2):
        # Line equation: ax + by + c = 0
        a, b, c = line[0]

        # Find two points on the line within the image
        x0, y0 = 0, int(-c / b) if b != 0 else 0
        x1, y1 = w, int(-(c + a * w) / b) if b != 0 else 0

        # Random color for this correspondence
        color = tuple(np.random.randint(0, 255, 3).tolist())

        # Draw line on img1
        cv2.line(img1_color, (x0, y0), (x1, y1), color, 1)
        # Draw point on img1
        cv2.circle(img1_color, tuple(pt1.astype(int)), 5, color, -1)
        # Draw corresponding point on img2
        cv2.circle(img2_color, tuple(pt2.astype(int)), 5, color, -1)

    return img1_color, img2_color


# Compute epipolar lines in image 2 for points in image 1
lines2 = cv2.computeCorrespondEpilines(pts1_inliers.reshape(-1, 1, 2), 1, F)
lines2 = lines2.reshape(-1, 3)

# Compute epipolar lines in image 1 for points in image 2
lines1 = cv2.computeCorrespondEpilines(pts2_inliers.reshape(-1, 1, 2), 2, F)
lines1 = lines1.reshape(-1, 3)

# Draw first 20 epipolar lines
n = min(20, len(pts1_inliers))

# Lines in image 1 (from points in image 2)
img1_lines, _ = draw_epipolar_lines(
    gray1, gray2, lines1[:n], pts1_inliers[:n], pts2_inliers[:n]
)

# Lines in image 2 (from points in image 1)
_, img2_lines = draw_epipolar_lines(
    gray1, gray2, lines2[:n], pts1_inliers[:n], pts2_inliers[:n]
)

# Display
combined = np.hstack([img1_lines, img2_lines])
cv2.imshow("Epipolar Lines", combined)
cv2.waitKey(0)
```

---

## The 8-Point Algorithm (Brief)

The classic algorithm to compute $F$ from point correspondences:

### Steps

1. **Collect** at least 8 point pairs $(\mathbf{x}_i, \mathbf{x'}_i)$
2. **Normalize** points (zero mean, unit standard deviation) for numerical stability
3. **Build** the constraint matrix $A$ where each row comes from $\mathbf{x'}^T F \mathbf{x} = 0$
4. **Solve** $A\mathbf{f} = 0$ using SVD (last column of $V$)
5. **Enforce rank-2** constraint: decompose $F$ with SVD, set smallest singular value to 0
6. **Denormalize** to get the final $F$

```python
def eight_point_algorithm(pts1, pts2):
    """
    Compute Fundamental matrix using normalized 8-point algorithm.
    pts1, pts2: Nx2 arrays of corresponding points
    """
    # Step 1: Normalize points
    def normalize_points(pts):
        mean = pts.mean(axis=0)
        std = pts.std()
        T = np.array([
            [1/std, 0, -mean[0]/std],
            [0, 1/std, -mean[1]/std],
            [0, 0, 1]
        ])
        pts_h = np.column_stack([pts, np.ones(len(pts))])
        pts_norm = (T @ pts_h.T).T
        return pts_norm[:, :2], T

    pts1_norm, T1 = normalize_points(pts1)
    pts2_norm, T2 = normalize_points(pts2)

    # Step 2: Build matrix A
    n = len(pts1)
    A = np.zeros((n, 9))
    for i in range(n):
        x1, y1 = pts1_norm[i]
        x2, y2 = pts2_norm[i]
        A[i] = [x2*x1, x2*y1, x2, y2*x1, y2*y1, y2, x1, y1, 1]

    # Step 3: Solve using SVD
    _, _, Vt = np.linalg.svd(A)
    F = Vt[-1].reshape(3, 3)

    # Step 4: Enforce rank 2
    U, S, Vt = np.linalg.svd(F)
    S[2] = 0
    F = U @ np.diag(S) @ Vt

    # Step 5: Denormalize
    F = T2.T @ F @ T1

    return F / F[2, 2]  # normalize
```

---

## Structure from Motion (SfM) Overview

Epipolar geometry is the building block for **Structure from Motion** — reconstructing 3D structure from multiple 2D images.

### SfM Pipeline

```
Images → Feature Detection → Feature Matching → Estimate F/E
    → Recover R, t → Triangulate 3D Points → Bundle Adjustment
        → Dense Reconstruction → Mesh/Texture
```

### Key Steps

1. **Feature detection & matching** (SIFT, ORB across many image pairs)
2. **Estimate pairwise geometry** (F or E between each pair)
3. **Recover camera poses** (R, t for each camera)
4. **Triangulation**: intersect rays to find 3D point positions
5. **Bundle adjustment**: jointly optimize all cameras and points
6. **Dense reconstruction**: fill in dense depth maps

### Triangulation

Given camera poses and matching points, find the 3D point:

```python
# Triangulate points from two views
# P1, P2 are 3x4 projection matrices
P1 = K @ np.hstack([np.eye(3), np.zeros((3, 1))])  # First camera at origin
P2 = K @ np.hstack([R, t])                          # Second camera

# Triangulate
points_4d = cv2.triangulatePoints(P1, P2, pts1_inliers.T, pts2_inliers.T)

# Convert from homogeneous coordinates
points_3d = points_4d[:3] / points_4d[3]
points_3d = points_3d.T  # Nx3

print(f"Reconstructed {len(points_3d)} 3D points")
print(f"Depth range: {points_3d[:, 2].min():.2f} to {points_3d[:, 2].max():.2f}")
```

---

## Complete Example: Epipolar Geometry Pipeline

```python
import numpy as np
import cv2

def epipolar_geometry_pipeline(img1_path, img2_path, K=None):
    """
    Complete epipolar geometry pipeline:
    1. Detect and match features
    2. Compute Fundamental matrix
    3. (If K given) Compute Essential matrix and recover pose
    4. Draw epipolar lines
    5. Triangulate 3D points

    Parameters:
        img1_path, img2_path: Paths to two images
        K: Camera intrinsic matrix (optional)

    Returns:
        F, E, R, t, points_3d
    """
    # Load images
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Detect features (SIFT)
    sift = cv2.SIFT_create(nfeatures=5000)
    kp1, des1 = sift.detectAndCompute(gray1, None)
    kp2, des2 = sift.detectAndCompute(gray2, None)

    # Match with ratio test
    bf = cv2.BFMatcher()
    matches = bf.knnMatch(des1, des2, k=2)
    good = [m for m, n in matches if m.distance < 0.7 * n.distance]

    pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
    pts2 = np.float32([kp2[m.trainIdx].pt for m in good])

    print(f"Matches after ratio test: {len(good)}")

    # Compute Fundamental matrix
    F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_RANSAC, 1.0, 0.99)
    inliers = mask.ravel() == 1
    pts1_in = pts1[inliers]
    pts2_in = pts2[inliers]
    print(f"Inliers: {inliers.sum()}")

    E, R, t, points_3d = None, None, None, None

    if K is not None:
        # Compute Essential matrix
        E, mask_e = cv2.findEssentialMat(pts1_in, pts2_in, K, cv2.RANSAC, 0.999, 1.0)

        # Recover pose
        _, R, t, mask_p = cv2.recoverPose(E, pts1_in, pts2_in, K)
        print(f"Rotation angle: {np.degrees(np.arccos((np.trace(R) - 1) / 2)):.2f}°")

        # Triangulate
        P1 = K @ np.hstack([np.eye(3), np.zeros((3, 1))])
        P2 = K @ np.hstack([R, t])
        pts_4d = cv2.triangulatePoints(P1, P2, pts1_in.T, pts2_in.T)
        points_3d = (pts_4d[:3] / pts_4d[3]).T

    # Draw epipolar lines
    lines = cv2.computeCorrespondEpilines(pts2_in[:15].reshape(-1, 1, 2), 2, F)
    img_lines = img1.copy()
    h, w = img_lines.shape[:2]
    for line in lines.reshape(-1, 3):
        a, b, c = line
        x0, y0 = 0, int(-c / b) if abs(b) > 1e-6 else 0
        x1, y1 = w, int(-(c + a * w) / b) if abs(b) > 1e-6 else 0
        color = tuple(np.random.randint(0, 255, 3).tolist())
        cv2.line(img_lines, (x0, y0), (x1, y1), color, 2)

    cv2.imshow("Epipolar Lines", img_lines)
    cv2.waitKey(0)

    return F, E, R, t, points_3d


# Usage
K = np.array([[718.856, 0, 607.193], [0, 718.856, 185.216], [0, 0, 1]])
F, E, R, t, pts3d = epipolar_geometry_pipeline("view1.jpg", "view2.jpg", K)
```

---

## Applications

| Application | Uses Epipolar Geometry For |
|-------------|---------------------------|
| **Visual SLAM** | Estimate camera motion frame-by-frame |
| **3D Reconstruction** | Build 3D models from photos |
| **Visual Odometry** | Track vehicle movement from cameras |
| **Image Stitching** | Align overlapping images |
| **Augmented Reality** | Place virtual objects consistently |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Epipole | Projection of other camera center |
| Epipolar line | Constraint — search along a line, not the whole image |
| Fundamental matrix $F$ | Uncalibrated: $\mathbf{x'}^T F \mathbf{x} = 0$ |
| Essential matrix $E$ | Calibrated: $E = K'^T F K$, contains R and t |
| `recoverPose` | Extract rotation and translation from E |
| Triangulation | Two views + correspondences → 3D points |
| SfM | Multiple views → full 3D reconstruction |

---

## Exercise

1. Take two photos of the same scene from different viewpoints
2. Compute the Fundamental matrix and draw epipolar lines
3. Verify that corresponding points satisfy $\mathbf{x'}^T F \mathbf{x} \approx 0$
4. If you have camera calibration, recover the relative pose (R, t)

---

**Next Lesson**: [Introduction to Deep Learning for CV →](34-cv-intro-dl.md)
