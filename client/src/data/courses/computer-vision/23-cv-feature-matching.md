---
title: Feature Matching & Homography
---

# Feature Matching & Homography

In this lesson, you will learn how to match features between images and compute geometric transformations — enabling object detection, image alignment, and panorama stitching.

---

## What Is Feature Matching?

**Feature matching** finds corresponding points between two images by comparing their descriptors.

**Pipeline:**
1. Detect keypoints in both images
2. Compute descriptors for each keypoint
3. Match descriptors (find closest pairs)
4. Filter bad matches
5. Use good matches for geometric estimation

---

## Brute-Force Matcher

The **Brute-Force Matcher** compares every descriptor in image 1 with every descriptor in image 2 — guaranteed to find the best match.

### Creating a Brute-Force Matcher

```python
import cv2

# For SIFT/SURF (float descriptors) → L2 norm
bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=True)

# For ORB/BRIEF (binary descriptors) → Hamming distance
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
```

### Norm Types

| Norm | Use With | Description |
|---|---|---|
| `cv2.NORM_L2` | SIFT, SURF | Euclidean distance |
| `cv2.NORM_L1` | SIFT, SURF | Manhattan distance |
| `cv2.NORM_HAMMING` | ORB, BRIEF, AKAZE | XOR + bit count |
| `cv2.NORM_HAMMING2` | ORB with WTA_K=3,4 | Modified Hamming |

### Cross-Check

When `crossCheck=True`:
- Match A→B AND B→A
- Keep only mutual best matches
- Reduces false matches significantly

### Basic Matching

```python
import cv2
import numpy as np

# Load images
img1 = cv2.imread("book_cover.jpg")
img2 = cv2.imread("book_in_scene.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Detect and compute with ORB
orb = cv2.ORB_create(1000)
kp1, desc1 = orb.detectAndCompute(gray1, None)
kp2, desc2 = orb.detectAndCompute(gray2, None)

# Brute-force matching with cross-check
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
matches = bf.match(desc1, desc2)

# Sort by distance (best matches first)
matches = sorted(matches, key=lambda x: x.distance)

print(f"Keypoints in image 1: {len(kp1)}")
print(f"Keypoints in image 2: {len(kp2)}")
print(f"Matches found: {len(matches)}")
print(f"Best match distance: {matches[0].distance}")
print(f"Worst match distance: {matches[-1].distance}")

# Draw top 30 matches
img_matches = cv2.drawMatches(
    img1, kp1, img2, kp2,
    matches[:30], None,
    matchColor=(0, 255, 0),
    singlePointColor=(255, 0, 0),
    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
)

cv2.imshow("Brute-Force Matches", img_matches)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## KNN Matching

Instead of finding just the best match, find the **k nearest** matches:

```python
import cv2
import numpy as np

# Load and detect (using SIFT for better quality)
img1 = cv2.imread("object.jpg")
img2 = cv2.imread("scene.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

sift = cv2.SIFT_create()
kp1, desc1 = sift.detectAndCompute(gray1, None)
kp2, desc2 = sift.detectAndCompute(gray2, None)

# KNN matching (k=2: find 2 nearest neighbors)
bf = cv2.BFMatcher(cv2.NORM_L2)  # No crossCheck with knnMatch
matches = bf.knnMatch(desc1, desc2, k=2)

print(f"KNN match pairs: {len(matches)}")
print(f"Each pair has {len(matches[0])} matches")
print(f"Best distance: {matches[0][0].distance:.2f}")
print(f"Second best: {matches[0][1].distance:.2f}")
```

---

## Lowe's Ratio Test

**The most important filtering technique** for feature matching!

David Lowe (SIFT inventor) proposed: a match is good only if the best match is **significantly better** than the second-best match.

$$\frac{d_1}{d_2} < \text{ratio\_threshold}$$

Where:
- $d_1$ = distance to best match
- $d_2$ = distance to second-best match
- Typical threshold: 0.75

**Intuition:** If a feature has two equally good matches, it's ambiguous and should be rejected.

```python
import cv2
import numpy as np

# Load and detect
img1 = cv2.imread("object.jpg")
img2 = cv2.imread("scene.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

sift = cv2.SIFT_create()
kp1, desc1 = sift.detectAndCompute(gray1, None)
kp2, desc2 = sift.detectAndCompute(gray2, None)

# KNN match
bf = cv2.BFMatcher(cv2.NORM_L2)
matches = bf.knnMatch(desc1, desc2, k=2)

# Apply Lowe's ratio test
ratio_threshold = 0.75
good_matches = []

for m, n in matches:
    if m.distance < ratio_threshold * n.distance:
        good_matches.append(m)

print(f"Total matches: {len(matches)}")
print(f"Good matches (ratio < {ratio_threshold}): {len(good_matches)}")
print(f"Rejected: {len(matches) - len(good_matches)}")
print(f"Keep rate: {len(good_matches)/len(matches)*100:.1f}%")

# Draw good matches
img_matches = cv2.drawMatches(
    img1, kp1, img2, kp2,
    good_matches[:50], None,
    matchColor=(0, 255, 0),
    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
)

cv2.imshow("Ratio Test Matches", img_matches)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Effect of Ratio Threshold

| Threshold | Behavior |
|---|---|
| 0.5 | Very strict — few but very reliable matches |
| 0.7 | Good balance (Lowe's recommendation) |
| 0.75 | Slightly relaxed — common default |
| 0.8 | More matches but more false positives |
| 1.0 | No filtering — keep everything |

---

## FLANN Matcher

**FLANN** (Fast Library for Approximate Nearest Neighbors) is faster than brute-force for large descriptor sets.

```python
import cv2
import numpy as np

# Load and detect
img1 = cv2.imread("object.jpg")
img2 = cv2.imread("scene.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

sift = cv2.SIFT_create()
kp1, desc1 = sift.detectAndCompute(gray1, None)
kp2, desc2 = sift.detectAndCompute(gray2, None)

# FLANN parameters for SIFT (float descriptors)
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)  # Higher = more accurate, slower

flann = cv2.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(desc1, desc2, k=2)

# Ratio test
good_matches = []
for m, n in matches:
    if m.distance < 0.75 * n.distance:
        good_matches.append(m)

print(f"FLANN good matches: {len(good_matches)}")

# For ORB/binary descriptors, use LSH index:
# FLANN_INDEX_LSH = 6
# index_params = dict(
#     algorithm=FLANN_INDEX_LSH,
#     table_number=6,
#     key_size=12,
#     multi_probe_level=1
# )
```

### BF vs FLANN

| Property | Brute-Force | FLANN |
|---|---|---|
| Accuracy | Exact (100%) | Approximate (~95%) |
| Speed (small sets) | Fast | Slower (index overhead) |
| Speed (large sets) | Slow | Much faster |
| When to use | < 1000 descriptors | > 1000 descriptors |

---

## Drawing Matches

```python
import cv2
import numpy as np

# After matching...

# Draw single matches (from bf.match)
img_out = cv2.drawMatches(
    img1, kp1, img2, kp2,
    matches[:20], None,
    matchColor=(0, 255, 0),      # Line color
    singlePointColor=(255, 0, 0), # Unmatched keypoint color
    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
)

# Draw KNN matches (show both best and second-best)
img_knn = cv2.drawMatchesKnn(
    img1, kp1, img2, kp2,
    matches[:20], None,
    matchColor=(0, 255, 0),
    matchesMask=None,  # Can filter which to draw
    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
)
```

---

## Homography Estimation

A **homography** is a 3×3 transformation matrix that maps points from one plane to another.

$$\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} \sim H \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$

### What Can a Homography Do?

- Translation, rotation, scaling
- Affine transformations
- Perspective transformations (viewing a plane from different angles)

### Computing Homography with RANSAC

```python
import cv2
import numpy as np

# After feature detection and matching...
# Extract matched point coordinates
src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

# Compute homography using RANSAC
H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

# mask: 1 = inlier, 0 = outlier
matches_mask = mask.ravel().tolist()
inliers = sum(matches_mask)
print(f"Homography inliers: {inliers}/{len(good_matches)}")
print(f"Inlier ratio: {inliers/len(good_matches)*100:.1f}%")
print(f"Homography matrix:\n{H}")
```

### RANSAC (Random Sample Consensus)

RANSAC robustly estimates homography by:
1. Randomly select 4 point pairs (minimum for homography)
2. Compute homography from these 4 pairs
3. Count how many other matches agree (inliers)
4. Repeat many times, keep best model
5. Recompute homography using all inliers

The `5.0` parameter is the **reprojection threshold** — maximum allowed reprojection error (pixels) for a match to be considered an inlier.

---

## Object Detection with Homography

Find a known object in a scene using features + homography:

```python
import cv2
import numpy as np

# Load images
img_object = cv2.imread("book_cover.jpg")  # Known object
img_scene = cv2.imread("desk_scene.jpg")   # Scene to search
gray_obj = cv2.cvtColor(img_object, cv2.COLOR_BGR2GRAY)
gray_scene = cv2.cvtColor(img_scene, cv2.COLOR_BGR2GRAY)

# Detect and compute features
sift = cv2.SIFT_create()
kp1, desc1 = sift.detectAndCompute(gray_obj, None)
kp2, desc2 = sift.detectAndCompute(gray_scene, None)

# Match with FLANN + ratio test
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params, search_params)

matches = flann.knnMatch(desc1, desc2, k=2)

good_matches = []
for m, n in matches:
    if m.distance < 0.7 * n.distance:
        good_matches.append(m)

print(f"Good matches: {len(good_matches)}")

# Need minimum matches for homography
MIN_MATCH_COUNT = 10

if len(good_matches) >= MIN_MATCH_COUNT:
    # Extract points
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # Find homography
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

    # Get object corners
    h, w = gray_obj.shape
    obj_corners = np.float32([
        [0, 0],
        [w, 0],
        [w, h],
        [0, h]
    ]).reshape(-1, 1, 2)

    # Transform corners to scene coordinates
    scene_corners = cv2.perspectiveTransform(obj_corners, H)

    # Draw bounding polygon on scene
    img_result = img_scene.copy()
    scene_corners_int = np.int32(scene_corners)
    cv2.polylines(img_result, [scene_corners_int], True, (0, 255, 0), 3)

    # Add label
    center = scene_corners_int.mean(axis=0).astype(int)[0]
    cv2.putText(img_result, "DETECTED!", (center[0]-50, center[1]),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    print("Object FOUND!")
    cv2.imshow("Detection Result", img_result)
else:
    print(f"Not enough matches ({len(good_matches)}/{MIN_MATCH_COUNT})")

cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Full Pipeline: Detect → Describe → Match → Homography → Warp

```python
import cv2
import numpy as np

# Load images
img1 = cv2.imread("photo1.jpg")
img2 = cv2.imread("photo2.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Step 1: Detect features
sift = cv2.SIFT_create()
kp1, desc1 = sift.detectAndCompute(gray1, None)
kp2, desc2 = sift.detectAndCompute(gray2, None)
print(f"Step 1 - Keypoints: img1={len(kp1)}, img2={len(kp2)}")

# Step 2: Match descriptors
bf = cv2.BFMatcher(cv2.NORM_L2)
matches = bf.knnMatch(desc1, desc2, k=2)
print(f"Step 2 - Raw matches: {len(matches)}")

# Step 3: Filter with ratio test
good = [m for m, n in matches if m.distance < 0.75 * n.distance]
print(f"Step 3 - Good matches: {len(good)}")

# Step 4: Compute homography
src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
inliers = mask.ravel().sum()
print(f"Step 4 - Homography inliers: {inliers}/{len(good)}")

# Step 5: Warp image 1 to align with image 2
h, w = img2.shape[:2]
img1_warped = cv2.warpPerspective(img1, H, (w, h))

# Show results
print(f"\nHomography matrix:\n{np.round(H, 4)}")

# Side by side: original img1, warped img1, img2
combined = np.hstack([
    cv2.resize(img1, (w, h)),
    img1_warped,
    img2
])
cv2.imshow("Original | Warped | Target", combined)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Tips for Better Matching

1. **Use enough features:** 1000+ keypoints per image
2. **Always apply ratio test:** Dramatically reduces false matches
3. **Use RANSAC:** Handles remaining outliers gracefully
4. **Check inlier ratio:** Below 30% usually means bad match
5. **Need 4+ inliers** for homography (more is better)
6. **SIFT for accuracy**, ORB for speed
7. **Pre-process:** Equalize histogram for varying exposure

---

## Summary

| Concept | Key Takeaway |
|---|---|
| BF Matcher | Compare all pairs — exact but slower |
| FLANN | Approximate nearest neighbors — faster for large sets |
| Ratio test | $d_1/d_2 < 0.75$ rejects ambiguous matches |
| Homography | 3×3 matrix mapping planar points between views |
| RANSAC | Robust estimation ignoring outlier matches |
| Object detection | Features + homography = find object in scene |

In the next lesson, you will use these techniques to build panoramas by stitching multiple images together!

---
