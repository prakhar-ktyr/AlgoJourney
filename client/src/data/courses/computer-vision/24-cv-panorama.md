---
title: Image Stitching & Panoramas
---

# Image Stitching & Panoramas

In this lesson, you will learn how to combine multiple overlapping images into a single wide-angle panoramic image — one of the most impressive applications of feature matching and homography.

---

## What Is Panorama Stitching?

**Panorama stitching** combines multiple overlapping photographs into one seamless wide-angle image.

**Real-world uses:**
- Phone panorama mode
- Google Street View
- Virtual tours
- Satellite imagery mosaics
- Medical image mosaics

---

## The Stitching Pipeline

```
Image 1  ──┐
            ├── Feature Detection ── Feature Matching ── Homography ── Warping ── Blending ── Panorama
Image 2  ──┘
```

**Five main steps:**

| Step | Purpose |
|---|---|
| 1. Feature Detection | Find keypoints in each image (SIFT/ORB) |
| 2. Feature Matching | Find corresponding points between overlapping images |
| 3. Homography Estimation | Compute geometric transformation (RANSAC) |
| 4. Image Warping | Transform images into a common coordinate frame |
| 5. Seam Blending | Smooth transitions between images |

---

## OpenCV Stitcher Class

OpenCV provides a high-level `Stitcher` class that handles the entire pipeline:

```python
import cv2
import numpy as np
import glob

# Load multiple images
image_paths = sorted(glob.glob("panorama_images/*.jpg"))
images = [cv2.imread(path) for path in image_paths]

print(f"Loaded {len(images)} images")
for i, img in enumerate(images):
    print(f"  Image {i+1}: {img.shape[1]}x{img.shape[0]}")

# Create stitcher
# Modes: cv2.Stitcher_PANORAMA (default) or cv2.Stitcher_SCANS
stitcher = cv2.Stitcher_create(mode=cv2.Stitcher_PANORAMA)

# Stitch!
status, panorama = stitcher.stitch(images)

# Check result
if status == cv2.Stitcher_OK:
    print(f"Success! Panorama size: {panorama.shape[1]}x{panorama.shape[0]}")
    cv2.imwrite("panorama_result.jpg", panorama)
    cv2.imshow("Panorama", panorama)
    cv2.waitKey(0)
elif status == cv2.Stitcher_ERR_NEED_MORE_IMGS:
    print("Error: Need more images (not enough overlap)")
elif status == cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL:
    print("Error: Homography estimation failed")
elif status == cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL:
    print("Error: Camera parameter adjustment failed")

cv2.destroyAllWindows()
```

### Stitcher Modes

| Mode | Use Case |
|---|---|
| `PANORAMA` | Photos taken by rotating camera (perspective model) |
| `SCANS` | Document scans or flat images (affine model) |

---

## Manual Stitching: Step by Step

For full control and understanding, let's build a panorama from scratch.

### Step 1: Feature Detection

```python
import cv2
import numpy as np

# Load two overlapping images
img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Detect features with SIFT
sift = cv2.SIFT_create(nfeatures=2000)
kp1, desc1 = sift.detectAndCompute(gray1, None)
kp2, desc2 = sift.detectAndCompute(gray2, None)

print(f"Image 1 keypoints: {len(kp1)}")
print(f"Image 2 keypoints: {len(kp2)}")
```

### Step 2: Feature Matching + Ratio Test

```python
# Match features
bf = cv2.BFMatcher(cv2.NORM_L2)
matches = bf.knnMatch(desc1, desc2, k=2)

# Apply ratio test
good_matches = []
for m, n in matches:
    if m.distance < 0.75 * n.distance:
        good_matches.append(m)

print(f"Good matches: {len(good_matches)}")

# Visualize matches
img_matches = cv2.drawMatches(
    img1, kp1, img2, kp2,
    good_matches[:50], None,
    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
)
cv2.imshow("Matches", img_matches)
cv2.waitKey(0)
```

### Step 3: Homography Estimation

```python
# Extract matched point coordinates
src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

# Compute homography (img1 → img2 coordinate system)
H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

inliers = mask.ravel().sum()
print(f"RANSAC inliers: {inliers}/{len(good_matches)} ({inliers/len(good_matches)*100:.1f}%)")
print(f"Homography:\n{np.round(H, 4)}")
```

### Step 4: Warping into Common Frame

```python
# Get dimensions
h1, w1 = img1.shape[:2]
h2, w2 = img2.shape[:2]

# Find corners of img1 after warping
corners_img1 = np.float32([
    [0, 0], [w1, 0], [w1, h1], [0, h1]
]).reshape(-1, 1, 2)

corners_img1_warped = cv2.perspectiveTransform(corners_img1, H)

# Corners of img2 (stays in place)
corners_img2 = np.float32([
    [0, 0], [w2, 0], [w2, h2], [0, h2]
]).reshape(-1, 1, 2)

# Find bounding box of both images combined
all_corners = np.concatenate([corners_img1_warped, corners_img2])
x_min = int(np.floor(all_corners[:, 0, 0].min()))
y_min = int(np.floor(all_corners[:, 0, 1].min()))
x_max = int(np.ceil(all_corners[:, 0, 0].max()))
y_max = int(np.ceil(all_corners[:, 0, 1].max()))

# Translation to handle negative coordinates
translation = np.array([
    [1, 0, -x_min],
    [0, 1, -y_min],
    [0, 0, 1]
], dtype=np.float64)

# Canvas size
canvas_w = x_max - x_min
canvas_h = y_max - y_min
print(f"Canvas size: {canvas_w}x{canvas_h}")

# Warp img1 onto canvas
H_translated = translation @ H
img1_warped = cv2.warpPerspective(img1, H_translated, (canvas_w, canvas_h))

# Place img2 onto canvas (just translate)
img2_translated = cv2.warpPerspective(img2, translation, (canvas_w, canvas_h))
```

### Step 5: Blending

```python
# Simple approach: place img2 where img1_warped is black
# Create mask of where img1_warped has content
mask1 = (img1_warped.sum(axis=2) > 0).astype(np.uint8)
mask2 = (img2_translated.sum(axis=2) > 0).astype(np.uint8)

# Combine: img2 on top of img1 (or blend overlap)
panorama = img1_warped.copy()

# Where img2 has content, use img2
panorama[mask2 == 1] = img2_translated[mask2 == 1]

cv2.imshow("Panorama (simple)", panorama)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Complete 2-Image Panorama Function

```python
import cv2
import numpy as np

def stitch_two_images(img1, img2, ratio=0.75, reproj_thresh=5.0):
    """Stitch two overlapping images into a panorama.
    
    Args:
        img1: Left image
        img2: Right image
        ratio: Lowe's ratio test threshold
        reproj_thresh: RANSAC reprojection threshold
    
    Returns:
        Stitched panorama image, or None if stitching fails
    """
    # Convert to grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    
    # Detect and compute features
    sift = cv2.SIFT_create(nfeatures=3000)
    kp1, desc1 = sift.detectAndCompute(gray1, None)
    kp2, desc2 = sift.detectAndCompute(gray2, None)
    
    if desc1 is None or desc2 is None:
        print("No descriptors found")
        return None
    
    # Match features
    bf = cv2.BFMatcher(cv2.NORM_L2)
    matches = bf.knnMatch(desc1, desc2, k=2)
    
    # Ratio test
    good = [m for m, n in matches if m.distance < ratio * n.distance]
    
    print(f"Features: {len(kp1)}, {len(kp2)} | Matches: {len(good)}")
    
    if len(good) < 10:
        print("Not enough matches")
        return None
    
    # Compute homography (warp img2 to img1's frame)
    src_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, reproj_thresh)
    
    if H is None:
        print("Homography estimation failed")
        return None
    
    inliers = mask.ravel().sum()
    print(f"Inliers: {inliers}/{len(good)} ({inliers/len(good)*100:.1f}%)")
    
    # Determine output canvas size
    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]
    
    # Corners of img2 after warping
    corners = np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2)
    warped_corners = cv2.perspectiveTransform(corners, H)
    
    # Combined bounding box
    all_pts = np.concatenate([
        np.float32([[0, 0], [w1, 0], [w1, h1], [0, h1]]).reshape(-1, 1, 2),
        warped_corners
    ])
    
    x_min, y_min = np.int32(all_pts.min(axis=0).ravel()) - 1
    x_max, y_max = np.int32(all_pts.max(axis=0).ravel()) + 1
    
    # Translation matrix
    T = np.array([[1, 0, -x_min], [0, 1, -y_min], [0, 0, 1]], dtype=np.float64)
    
    canvas_size = (x_max - x_min, y_max - y_min)
    
    # Warp img2 to img1's coordinate system (with translation)
    warped2 = cv2.warpPerspective(img2, T @ H, canvas_size)
    
    # Place img1 on canvas
    warped2[-y_min:-y_min + h1, -x_min:-x_min + w1] = img1
    
    # Crop black borders (optional)
    gray = cv2.cvtColor(warped2, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        x, y, w, h = cv2.boundingRect(max(contours, key=cv2.contourArea))
        warped2 = warped2[y:y+h, x:x+w]
    
    return warped2


# Usage
img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")

panorama = stitch_two_images(img1, img2)

if panorama is not None:
    print(f"Panorama size: {panorama.shape[1]}x{panorama.shape[0]}")
    cv2.imwrite("my_panorama.jpg", panorama)
    cv2.imshow("My Panorama", panorama)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

---

## Blending Techniques

Simple overwriting creates visible seams. Better blending smooths the transition.

- **Simple averaging:** Average pixels in overlap — fast but ghosting
- **Feathering:** Linear blend weighted by distance to edge — good quality
- **Multi-band blending:** Laplacian pyramid blending — best quality, handles exposure differences

```python
def blend_feathering(img1_warped, img2_warped):
    """Distance-weighted blend for smooth seams."""
    mask1 = (img1_warped.sum(axis=2) > 0).astype(np.uint8)
    mask2 = (img2_warped.sum(axis=2) > 0).astype(np.uint8)
    
    # Weight by distance to mask edge
    dist1 = cv2.distanceTransform(mask1, cv2.DIST_L2, 5)
    dist2 = cv2.distanceTransform(mask2, cv2.DIST_L2, 5)
    
    total = dist1 + dist2 + 1e-6
    weight1 = dist1 / total
    weight2 = dist2 / total
    
    result = (
        img1_warped.astype(np.float32) * weight1[:, :, np.newaxis] +
        img2_warped.astype(np.float32) * weight2[:, :, np.newaxis]
    )
    return result.astype(np.uint8)
```

### Blending Comparison

| Method | Quality | Speed | Ghosting |
|---|---|---|---|
| Overwrite | Poor (visible seam) | Very Fast | Yes |
| Average | Fair | Fast | Moderate |
| Feathering | Good | Fast | Low |
| Multi-band | Excellent | Slow | Very Low |

---

## Handling Multiple Images

For 3+ images, chain homographies:

```python
def stitch_multiple(images):
    """Stitch multiple images left to right."""
    if len(images) < 2:
        return images[0] if images else None
    
    # Start with the middle image as reference
    mid = len(images) // 2
    result = images[mid]
    
    # Stitch right images
    for i in range(mid + 1, len(images)):
        result = stitch_two_images(result, images[i])
        if result is None:
            print(f"Failed at image {i}")
            return None
    
    # Stitch left images (reverse order)
    for i in range(mid - 1, -1, -1):
        result = stitch_two_images(images[i], result)
        if result is None:
            print(f"Failed at image {i}")
            return None
    
    return result
```

---

## Cylindrical Projection for 360° Panoramas

For wide-angle panoramas (>180°), perspective projection distorts edges. Use **cylindrical projection**:

```python
def cylindrical_warp(img, focal_length):
    """Warp image to cylindrical coordinates."""
    h, w = img.shape[:2]
    cx, cy = w // 2, h // 2
    
    # Create coordinate maps
    y_coords, x_coords = np.mgrid[0:h, 0:w]
    
    # Cylindrical coordinates
    theta = (x_coords - cx) / focal_length
    h_cyl = (y_coords - cy) / focal_length
    
    # Back-project to image plane
    x_map = (focal_length * np.tan(theta) + cx).astype(np.float32)
    y_map = (focal_length * h_cyl / np.cos(theta) + cy).astype(np.float32)
    
    # Warp
    result = cv2.remap(img, x_map, y_map, cv2.INTER_LINEAR,
                       borderMode=cv2.BORDER_CONSTANT)
    
    return result

# Estimate focal length from image width and field of view
# focal_length ≈ width / (2 * tan(FOV/2))
# For a typical 60° FOV lens:
focal_length = img.shape[1] / (2 * np.tan(np.radians(30)))
warped = cylindrical_warp(img, focal_length)
```

---

## Common Issues and Solutions

| Issue | Cause | Solution |
|---|---|---|
| **Ghosting** | Moving objects in overlap | Use masks, take photos quickly |
| **Exposure differences** | Auto-exposure changes | Gain compensation, histogram matching |
| **Visible seams** | Poor blending | Multi-band blending |
| **Distortion at edges** | Perspective projection | Cylindrical/spherical projection |
| **Drift** | Accumulated homography error | Bundle adjustment |
| **Not enough overlap** | Photos too far apart | Ensure 30-50% overlap |

---

## Tips for Taking Good Panorama Photos

1. **Overlap:** 30-50% between adjacent photos
2. **Lock exposure:** Use manual or AE lock
3. **Rotate around lens nodal point:** Reduce parallax
4. **Keep level:** Use a tripod if possible
5. **Avoid moving objects** in overlap regions
6. **Use consistent focal length:** No zooming
7. **Shoot in portrait orientation:** More vertical coverage

---

## Summary

| Concept | Key Takeaway |
|---|---|
| Pipeline | Detect → Match → Homography → Warp → Blend |
| `cv2.Stitcher` | High-level API, handles everything |
| Manual stitching | Full control over each step |
| Blending | Multi-band gives best quality |
| Multiple images | Chain homographies or use bundle adjustment |
| Cylindrical | Use for wide-angle (>180°) panoramas |

In the next lesson, you will learn about **template matching** — a simpler but effective method for finding objects in images!

---
