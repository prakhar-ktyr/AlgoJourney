---
title: Camera Model & Calibration
---

# Camera Model & Calibration

In this lesson, you will learn how cameras project the 3D world onto a 2D image, what parameters define that projection, and how to calibrate a camera to obtain accurate measurements.

---

## Why Camera Calibration Matters

Every camera introduces distortion and has unique internal parameters. If you want to:

- Measure real-world distances from images
- Stitch panoramas accurately
- Perform 3D reconstruction
- Build augmented reality apps

...you **must** know your camera's parameters.

---

## The Pinhole Camera Model

The simplest camera model is the **pinhole camera**: light passes through a tiny hole and projects an inverted image on the opposite side.

### 3D to 2D Projection

A 3D point $\mathbf{P} = (X, Y, Z)$ in world coordinates is projected to a 2D pixel $(u, v)$ by:

$$
s\begin{bmatrix}u\\v\\1\end{bmatrix} = K[R|t]\begin{bmatrix}X\\Y\\Z\\1\end{bmatrix}
$$

Where:
- $s$ is a scale factor
- $K$ is the **intrinsic** (camera) matrix
- $[R|t]$ contains **extrinsic** parameters (rotation and translation)
- $(X, Y, Z, 1)^T$ is the 3D point in homogeneous coordinates

---

## Intrinsic Parameters (Camera Matrix K)

The camera matrix $K$ encodes the internal properties of the camera:

$$
K = \begin{bmatrix}f_x & 0 & c_x\\0 & f_y & c_y\\0 & 0 & 1\end{bmatrix}
$$

| Parameter | Meaning |
|-----------|---------|
| $f_x, f_y$ | Focal length in pixels (horizontal, vertical) |
| $c_x, c_y$ | Principal point — where optical axis meets the image plane |

### What Each Parameter Controls

- **Focal length** ($f_x$, $f_y$): How "zoomed in" the image appears. Larger values = narrower field of view.
- **Principal point** ($c_x$, $c_y$): Ideally the image center, but manufacturing imperfections shift it slightly.

---

## Extrinsic Parameters (R and t)

Extrinsic parameters describe the **camera's pose** in the world:

- **Rotation matrix** $R$ (3×3): Orientation of the camera
- **Translation vector** $t$ (3×1): Position of the camera

Together, $[R|t]$ transforms a world point into the camera's coordinate system.

$$
\mathbf{P}_{cam} = R \cdot \mathbf{P}_{world} + t
$$

---

## Lens Distortion

Real lenses are not perfect pinholes. They introduce **distortion**.

### Radial Distortion

Straight lines appear curved:

| Type | Effect | Cause |
|------|--------|-------|
| **Barrel** | Lines bow outward | Short focal length (wide-angle) |
| **Pincushion** | Lines bow inward | Long focal length (telephoto) |

The radial distortion model:

$$
x_{distorted} = x(1 + k_1 r^2 + k_2 r^4 + k_3 r^6)
$$
$$
y_{distorted} = y(1 + k_1 r^2 + k_2 r^4 + k_3 r^6)
$$

Where $r^2 = x^2 + y^2$.

### Tangential Distortion

Caused by lens elements not being perfectly parallel to the image plane:

$$
x_{distorted} = x + [2p_1 xy + p_2(r^2 + 2x^2)]
$$
$$
y_{distorted} = y + [p_1(r^2 + 2y^2) + 2p_2 xy]
$$

### Distortion Coefficients

OpenCV uses 5 coefficients (or more):

$$
(k_1, k_2, p_1, p_2, k_3)
$$

- $k_1, k_2, k_3$ — radial distortion
- $p_1, p_2$ — tangential distortion

---

## Camera Calibration with OpenCV

Calibration finds $K$ and distortion coefficients from images of a known pattern.

### Step 1: Prepare the Checkerboard

```python
import numpy as np
import cv2
import glob

# Define the checkerboard dimensions
# (number of INNER corners per row, per column)
CHECKERBOARD = (9, 6)

# Termination criteria for corner sub-pixel refinement
criteria = (
    cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
    30,   # max iterations
    0.001 # epsilon (accuracy)
)
```

### Step 2: Prepare Object Points

Object points are the known 3D coordinates of the checkerboard corners (Z=0 since it's flat):

```python
# Prepare object points: (0,0,0), (1,0,0), (2,0,0), ..., (8,5,0)
objp = np.zeros((CHECKERBOARD[0] * CHECKERBOARD[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:CHECKERBOARD[0], 0:CHECKERBOARD[1]].T.reshape(-1, 2)

# If your squares are 25mm, multiply by 0.025 for real-world units:
# objp *= 0.025

# Arrays to store object points and image points
objpoints = []  # 3D points in world coordinate
imgpoints = []  # 2D points in image plane
```

### Step 3: Find Checkerboard Corners

```python
images = glob.glob("calibration_images/*.jpg")

for fname in images:
    img = cv2.imread(fname)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Find the chessboard corners
    ret, corners = cv2.findChessboardCorners(gray, CHECKERBOARD, None)

    if ret:
        objpoints.append(objp)

        # Refine corner locations to sub-pixel accuracy
        corners_refined = cv2.cornerSubPix(
            gray, corners, (11, 11), (-1, -1), criteria
        )
        imgpoints.append(corners_refined)

        # Draw and display corners (optional)
        cv2.drawChessboardCorners(img, CHECKERBOARD, corners_refined, ret)
        cv2.imshow("Corners", img)
        cv2.waitKey(500)

cv2.destroyAllWindows()
print(f"Found corners in {len(objpoints)} images")
```

### Step 4: Calibrate the Camera

```python
# Perform camera calibration
ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
    objpoints, imgpoints, gray.shape[::-1], None, None
)

print("Camera Matrix (K):")
print(camera_matrix)
print("\nDistortion Coefficients:")
print(dist_coeffs)
print(f"\nCalibration RMS error: {ret:.4f}")
```

### Step 5: Undistort Images

```python
# Load a distorted image
img = cv2.imread("calibration_images/test.jpg")
h, w = img.shape[:2]

# Method 1: Simple undistort
undistorted = cv2.undistort(img, camera_matrix, dist_coeffs)

# Method 2: With optimal new camera matrix (keeps all pixels)
new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(
    camera_matrix, dist_coeffs, (w, h), 1, (w, h)
)
undistorted = cv2.undistort(img, camera_matrix, dist_coeffs, None, new_camera_matrix)

# Crop to the valid region
x, y, w_roi, h_roi = roi
undistorted = undistorted[y:y+h_roi, x:x+w_roi]

cv2.imwrite("undistorted.jpg", undistorted)
```

---

## Reprojection Error

The **reprojection error** measures calibration quality. It computes how far the projected 3D points are from the detected 2D corners:

```python
total_error = 0

for i in range(len(objpoints)):
    # Project 3D points back to 2D
    imgpoints_projected, _ = cv2.projectPoints(
        objpoints[i], rvecs[i], tvecs[i], camera_matrix, dist_coeffs
    )

    # Compute error for this image
    error = cv2.norm(imgpoints[i], imgpoints_projected, cv2.NORM_L2)
    error /= len(imgpoints_projected)
    total_error += error

mean_error = total_error / len(objpoints)
print(f"Mean reprojection error: {mean_error:.4f} pixels")
```

| Error (pixels) | Quality |
|----------------|---------|
| < 0.5 | Excellent |
| 0.5 – 1.0 | Good |
| 1.0 – 2.0 | Acceptable |
| > 2.0 | Poor — recalibrate |

---

## Complete Calibration Pipeline

```python
import numpy as np
import cv2
import glob
import os

def calibrate_camera(image_dir, checkerboard_size=(9, 6), square_size=0.025):
    """
    Full camera calibration pipeline.

    Parameters:
        image_dir: Directory containing calibration images
        checkerboard_size: (cols, rows) of inner corners
        square_size: Size of one square in meters

    Returns:
        camera_matrix, dist_coeffs, rvecs, tvecs, error
    """
    criteria = (
        cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001
    )

    # Prepare object points
    objp = np.zeros((checkerboard_size[0] * checkerboard_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[
        0:checkerboard_size[0], 0:checkerboard_size[1]
    ].T.reshape(-1, 2)
    objp *= square_size

    objpoints = []
    imgpoints = []
    image_size = None

    # Process all calibration images
    images = glob.glob(os.path.join(image_dir, "*.jpg"))
    images += glob.glob(os.path.join(image_dir, "*.png"))

    print(f"Processing {len(images)} images...")

    for fname in images:
        img = cv2.imread(fname)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        image_size = gray.shape[::-1]

        ret, corners = cv2.findChessboardCorners(
            gray, checkerboard_size,
            cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
        )

        if ret:
            objpoints.append(objp)
            corners_refined = cv2.cornerSubPix(
                gray, corners, (11, 11), (-1, -1), criteria
            )
            imgpoints.append(corners_refined)

    print(f"Successfully found corners in {len(objpoints)}/{len(images)} images")

    if len(objpoints) < 10:
        print("Warning: Use at least 10-15 images for reliable calibration")

    # Calibrate
    ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        objpoints, imgpoints, image_size, None, None
    )

    # Compute reprojection error
    total_error = 0
    for i in range(len(objpoints)):
        projected, _ = cv2.projectPoints(
            objpoints[i], rvecs[i], tvecs[i], camera_matrix, dist_coeffs
        )
        error = cv2.norm(imgpoints[i], projected, cv2.NORM_L2) / len(projected)
        total_error += error

    mean_error = total_error / len(objpoints)

    print(f"\n--- Calibration Results ---")
    print(f"RMS error: {ret:.4f}")
    print(f"Mean reprojection error: {mean_error:.4f} pixels")
    print(f"\nCamera Matrix:\n{camera_matrix}")
    print(f"\nDistortion Coefficients:\n{dist_coeffs.ravel()}")

    return camera_matrix, dist_coeffs, rvecs, tvecs, mean_error


# Run calibration
K, dist, rvecs, tvecs, error = calibrate_camera(
    "calibration_images/", checkerboard_size=(9, 6), square_size=0.025
)

# Save calibration data for later use
np.savez(
    "camera_calibration.npz",
    camera_matrix=K,
    dist_coeffs=dist,
    rvecs=rvecs,
    tvecs=tvecs
)
print("\nCalibration saved to camera_calibration.npz")
```

---

## Practical Tips for Good Calibration

### Capturing Calibration Images

| Tip | Why |
|-----|-----|
| Use 15–25 images | More images = more reliable results |
| Cover the entire frame | Helps estimate distortion at edges |
| Vary the angle (tilt board) | Constrains focal length estimation |
| Vary the distance | Helps estimate all parameters |
| Keep the board flat | Bent boards give wrong results |
| Use good lighting | Avoid reflections on the board |
| Keep images in focus | Blurry corners reduce accuracy |

### Common Mistakes

1. **Too few images**: Use at least 10 (ideally 15-25)
2. **All images from same angle**: Vary the board orientation
3. **Board only in center**: Move it to all corners and edges
4. **Wrong checkerboard size**: Count **inner** corners, not squares
5. **Blurry images**: Use a tripod or good lighting

---

## Loading Saved Calibration

```python
# Load calibration from file
data = np.load("camera_calibration.npz")
camera_matrix = data["camera_matrix"]
dist_coeffs = data["dist_coeffs"]

# Undistort a new image
img = cv2.imread("photo.jpg")
undistorted = cv2.undistort(img, camera_matrix, dist_coeffs)
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Pinhole model | Simplest projection: 3D → 2D |
| Intrinsic matrix $K$ | Focal length + principal point |
| Extrinsic $[R|t]$ | Camera pose in world |
| Radial distortion | Barrel / pincushion |
| Tangential distortion | Lens misalignment |
| Calibration | Checkerboard → find $K$ + distortion |
| Reprojection error | Quality metric (< 0.5 px = excellent) |

---

## Exercise

1. Print a checkerboard pattern (9×6 inner corners)
2. Take 15+ photos from different angles and distances
3. Run the calibration pipeline
4. Undistort a test image and compare before/after
5. Report your reprojection error

---

**Next Lesson**: [Stereo Vision & Depth →](32-cv-stereo-vision.md)
