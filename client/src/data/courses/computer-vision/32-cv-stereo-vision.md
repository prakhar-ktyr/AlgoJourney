---
title: Stereo Vision & Depth
---

# Stereo Vision & Depth

In this lesson, you will learn how two cameras can estimate depth — just like human eyes do. We'll cover stereo geometry, disparity maps, and build a complete stereo depth estimation pipeline.

---

## How Humans See Depth

Your two eyes see the world from slightly different positions. Your brain compares these two views and estimates how far away things are.

- **Close objects**: appear shifted a lot between left and right eye
- **Far objects**: appear almost the same in both eyes

This difference is called **binocular disparity**, and it's exactly what stereo vision computes.

---

## Stereo Camera Setup

A stereo camera system uses two cameras separated by a known distance.

### Key Terms

| Term | Definition |
|------|-----------|
| **Baseline** ($B$) | Distance between the two camera centers |
| **Left image** | Image from the left camera |
| **Right image** | Image from the right camera |
| **Rectification** | Aligning both images so corresponding points lie on the same row |

### Why Rectification?

Without rectification, searching for matching points requires scanning the entire image. After rectification, you only search along the **same horizontal line** — much faster!

---

## Disparity and Depth

### Disparity

**Disparity** is the horizontal pixel difference between the same point in the left and right images:

$$
d = x_L - x_R
$$

Where:
- $x_L$ = x-coordinate of the point in the left image
- $x_R$ = x-coordinate of the same point in the right image

### Depth from Disparity

The depth $Z$ of a point is inversely proportional to its disparity:

$$
Z = \frac{f \cdot B}{d}
$$

Where:
- $f$ = focal length (in pixels)
- $B$ = baseline (distance between cameras)
- $d$ = disparity (in pixels)

**Key insight**: Large disparity → close object. Small disparity → far object.

### Example Calculation

If $f = 700$ pixels, $B = 0.1$ m, and $d = 50$ pixels:

$$
Z = \frac{700 \times 0.1}{50} = 1.4 \text{ meters}
$$

---

## Stereo Matching with OpenCV

### Block Matching (BM)

The simplest stereo matching algorithm: compare small blocks of pixels between left and right images.

```python
import numpy as np
import cv2

# Load rectified stereo pair
left = cv2.imread("left.png", cv2.IMREAD_GRAYSCALE)
right = cv2.imread("right.png", cv2.IMREAD_GRAYSCALE)

# Create stereo block matcher
# numDisparities: max disparity - min disparity (must be divisible by 16)
# blockSize: size of the matching block (odd number, 5-21)
stereo_bm = cv2.StereoBM_create(
    numDisparities=128,  # range of disparity search
    blockSize=15         # block size for matching
)

# Compute disparity map
disparity = stereo_bm.compute(left, right)

# Normalize for display (disparity is in fixed-point: divide by 16)
disparity_display = cv2.normalize(
    disparity, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U
)

cv2.imshow("Disparity (BM)", disparity_display)
cv2.waitKey(0)
```

### Semi-Global Block Matching (SGBM)

SGBM produces smoother, more accurate disparity maps by considering multiple directions:

```python
# Create SGBM matcher (better quality than BM)
stereo_sgbm = cv2.StereoSGBM_create(
    minDisparity=0,
    numDisparities=128,       # must be divisible by 16
    blockSize=5,              # odd number, 3-11
    P1=8 * 3 * 5 ** 2,       # penalty on disparity change (small)
    P2=32 * 3 * 5 ** 2,      # penalty on disparity change (large)
    disp12MaxDiff=1,          # left-right consistency check
    uniquenessRatio=10,       # margin of winner vs second-best match
    speckleWindowSize=100,    # filter out noise speckles
    speckleRange=32,          # max difference within speckle
    preFilterCap=63,
    mode=cv2.STEREO_SGBM_MODE_SGBM_3WAY
)

disparity_sgbm = stereo_sgbm.compute(left, right).astype(np.float32) / 16.0

# Display
disparity_display = cv2.normalize(
    disparity_sgbm, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U
)
cv2.imshow("Disparity (SGBM)", disparity_display)
cv2.waitKey(0)
```

### BM vs SGBM Comparison

| Feature | StereoBM | StereoSGBM |
|---------|----------|------------|
| Speed | Fast | Slower |
| Quality | Good for textured scenes | Better overall |
| Handles low texture | Poor | Better |
| Smoothness | Noisy | Smooth |
| Use case | Real-time | Accuracy-critical |

---

## Stereo Calibration

Before computing depth, you must calibrate both cameras together.

### Step 1: Individual Camera Calibration

```python
import numpy as np
import cv2
import glob

CHECKERBOARD = (9, 6)
criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)

# Prepare object points
objp = np.zeros((CHECKERBOARD[0] * CHECKERBOARD[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:CHECKERBOARD[0], 0:CHECKERBOARD[1]].T.reshape(-1, 2)
objp *= 0.025  # 25mm squares

objpoints = []
imgpoints_left = []
imgpoints_right = []

# Load stereo image pairs
left_images = sorted(glob.glob("stereo_calibration/left_*.jpg"))
right_images = sorted(glob.glob("stereo_calibration/right_*.jpg"))

for left_path, right_path in zip(left_images, right_images):
    img_l = cv2.imread(left_path, cv2.IMREAD_GRAYSCALE)
    img_r = cv2.imread(right_path, cv2.IMREAD_GRAYSCALE)

    ret_l, corners_l = cv2.findChessboardCorners(img_l, CHECKERBOARD, None)
    ret_r, corners_r = cv2.findChessboardCorners(img_r, CHECKERBOARD, None)

    if ret_l and ret_r:
        objpoints.append(objp)
        corners_l = cv2.cornerSubPix(img_l, corners_l, (11, 11), (-1, -1), criteria)
        corners_r = cv2.cornerSubPix(img_r, corners_r, (11, 11), (-1, -1), criteria)
        imgpoints_left.append(corners_l)
        imgpoints_right.append(corners_r)

image_size = img_l.shape[::-1]
print(f"Found {len(objpoints)} valid stereo pairs")
```

### Step 2: Stereo Calibration

```python
# Calibrate each camera individually first
ret_l, K_l, dist_l, _, _ = cv2.calibrateCamera(
    objpoints, imgpoints_left, image_size, None, None
)
ret_r, K_r, dist_r, _, _ = cv2.calibrateCamera(
    objpoints, imgpoints_right, image_size, None, None
)

# Stereo calibration: find R, T between cameras
flags = cv2.CALIB_FIX_INTRINSIC  # keep intrinsics fixed

ret, K_l, dist_l, K_r, dist_r, R, T, E, F = cv2.stereoCalibrate(
    objpoints, imgpoints_left, imgpoints_right,
    K_l, dist_l, K_r, dist_r,
    image_size, criteria=criteria, flags=flags
)

print(f"Stereo calibration RMS error: {ret:.4f}")
print(f"Baseline: {np.linalg.norm(T):.4f} meters")
print(f"Rotation:\n{R}")
print(f"Translation:\n{T.ravel()}")
```

### Step 3: Stereo Rectification

```python
# Compute rectification transforms
R1, R2, P1, P2, Q, roi1, roi2 = cv2.stereoRectify(
    K_l, dist_l, K_r, dist_r,
    image_size, R, T,
    alpha=0  # 0 = crop invalid pixels, 1 = keep all pixels
)

# Compute undistortion + rectification maps
map_l1, map_l2 = cv2.initUndistortRectifyMap(
    K_l, dist_l, R1, P1, image_size, cv2.CV_32FC1
)
map_r1, map_r2 = cv2.initUndistortRectifyMap(
    K_r, dist_r, R2, P2, image_size, cv2.CV_32FC1
)
```

### Step 4: Rectify Images

```python
# Apply rectification to a stereo pair
left_img = cv2.imread("stereo_calibration/left_01.jpg")
right_img = cv2.imread("stereo_calibration/right_01.jpg")

left_rectified = cv2.remap(left_img, map_l1, map_l2, cv2.INTER_LINEAR)
right_rectified = cv2.remap(right_img, map_r1, map_r2, cv2.INTER_LINEAR)

# Verify: draw horizontal lines — matching points should be on same line
combined = np.hstack([left_rectified, right_rectified])
for y in range(0, combined.shape[0], 30):
    cv2.line(combined, (0, y), (combined.shape[1], y), (0, 255, 0), 1)

cv2.imshow("Rectified Pair", combined)
cv2.waitKey(0)
```

---

## Computing Depth from Disparity

```python
def compute_depth_map(left_rect, right_rect, Q, num_disparities=128, block_size=5):
    """
    Compute depth map from rectified stereo pair.

    Parameters:
        left_rect: Rectified left image (grayscale)
        right_rect: Rectified right image (grayscale)
        Q: Disparity-to-depth mapping matrix (from stereoRectify)
        num_disparities: Range of disparity search
        block_size: Block size for SGBM

    Returns:
        depth_map: Depth in same units as calibration (e.g., meters)
        disparity: Raw disparity map
    """
    stereo = cv2.StereoSGBM_create(
        minDisparity=0,
        numDisparities=num_disparities,
        blockSize=block_size,
        P1=8 * 3 * block_size ** 2,
        P2=32 * 3 * block_size ** 2,
        disp12MaxDiff=1,
        uniquenessRatio=10,
        speckleWindowSize=100,
        speckleRange=32,
        preFilterCap=63,
        mode=cv2.STEREO_SGBM_MODE_SGBM_3WAY
    )

    # Compute disparity
    disparity = stereo.compute(left_rect, right_rect).astype(np.float32) / 16.0

    # Convert disparity to 3D points (depth map)
    points_3d = cv2.reprojectImageTo3D(disparity, Q)
    depth_map = points_3d[:, :, 2]  # Z-coordinate is depth

    # Mask invalid disparities
    mask = disparity > 0
    depth_map[~mask] = 0

    return depth_map, disparity


# Convert to grayscale for matching
left_gray = cv2.cvtColor(left_rectified, cv2.COLOR_BGR2GRAY)
right_gray = cv2.cvtColor(right_rectified, cv2.COLOR_BGR2GRAY)

# Compute depth
depth_map, disparity = compute_depth_map(left_gray, right_gray, Q)

# Display depth map
depth_display = cv2.normalize(depth_map, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U)
depth_colormap = cv2.applyColorMap(depth_display, cv2.COLORMAP_JET)
cv2.imshow("Depth Map", depth_colormap)
cv2.waitKey(0)

# Query depth at a specific pixel
y, x = 240, 320
print(f"Depth at ({x}, {y}): {depth_map[y, x]:.2f} meters")
```

---

## Point Cloud Generation (Brief)

A disparity map can be converted to a 3D point cloud:

```python
# Reproject disparity to 3D
points_3d = cv2.reprojectImageTo3D(disparity, Q)

# Get colors from left image
colors = cv2.cvtColor(left_rectified, cv2.COLOR_BGR2RGB)

# Mask valid points
mask = disparity > 0
points = points_3d[mask]
colors_valid = colors[mask]

# Save as PLY file (viewable in MeshLab, CloudCompare, etc.)
def save_ply(filename, points, colors):
    header = f"""ply
format ascii 1.0
element vertex {len(points)}
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
"""
    with open(filename, "w") as f:
        f.write(header)
        for pt, col in zip(points, colors):
            f.write(f"{pt[0]:.4f} {pt[1]:.4f} {pt[2]:.4f} {col[0]} {col[1]} {col[2]}\n")

save_ply("scene.ply", points, colors_valid)
print(f"Saved {len(points)} 3D points to scene.ply")
```

---

## Applications of Stereo Vision

| Application | How Stereo is Used |
|-------------|-------------------|
| **Autonomous driving** | Estimate distance to obstacles, pedestrians |
| **3D scanning** | Reconstruct object geometry |
| **Augmented reality** | Place virtual objects at correct depth |
| **Robotics** | Navigate and avoid obstacles |
| **Medical imaging** | Endoscopic 3D reconstruction |

---

## Limitations of Stereo Vision

| Challenge | Description |
|-----------|-------------|
| **Texture-less regions** | Flat walls, sky — no features to match |
| **Occlusions** | Objects visible in one camera but not the other |
| **Repetitive patterns** | Tiles, fences — ambiguous matches |
| **Calibration drift** | Cameras must stay rigidly mounted |
| **Baseline trade-off** | Wide baseline = better depth resolution but more occlusion |

---

## Complete Pipeline Summary

```python
# 1. Calibrate stereo cameras (offline, once)
# 2. Rectify new stereo pairs (using precomputed maps)
left_rect = cv2.remap(left_img, map_l1, map_l2, cv2.INTER_LINEAR)
right_rect = cv2.remap(right_img, map_r1, map_r2, cv2.INTER_LINEAR)

# 3. Convert to grayscale
left_gray = cv2.cvtColor(left_rect, cv2.COLOR_BGR2GRAY)
right_gray = cv2.cvtColor(right_rect, cv2.COLOR_BGR2GRAY)

# 4. Compute disparity
stereo = cv2.StereoSGBM_create(numDisparities=128, blockSize=5, ...)
disparity = stereo.compute(left_gray, right_gray).astype(np.float32) / 16.0

# 5. Convert disparity to depth
depth = (focal_length * baseline) / (disparity + 1e-6)  # avoid divide by zero

# Or using Q matrix:
# points_3d = cv2.reprojectImageTo3D(disparity, Q)
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Disparity | $d = x_L - x_R$ (pixel shift between views) |
| Depth | $Z = f \cdot B / d$ (inversely proportional to disparity) |
| StereoBM | Fast, works for textured scenes |
| StereoSGBM | More accurate, handles more cases |
| Rectification | Aligns images so search is 1D |
| Point cloud | 3D reconstruction from disparity |

---

## Exercise

1. Download a stereo image pair (e.g., Middlebury stereo dataset)
2. Compute disparity using both BM and SGBM — compare results
3. Tune `numDisparities` and `blockSize` to minimize artifacts
4. If you have two cameras, calibrate them and compute real-world depth

---

**Next Lesson**: [Epipolar Geometry →](33-cv-epipolar.md)
