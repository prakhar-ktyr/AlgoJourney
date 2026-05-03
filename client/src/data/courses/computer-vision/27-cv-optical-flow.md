---
title: Optical Flow & Motion
---

# Optical Flow & Motion

**Optical flow** is the pattern of apparent motion of objects between consecutive video frames. It tells you which direction and how fast each pixel (or point) is moving — the foundation of motion analysis in computer vision.

---

## What Is Optical Flow?

When a camera records a scene, objects move between frames. Optical flow computes the **velocity field** — for each point, it estimates a displacement vector $(u, v)$ that describes where that point moved.

| Concept        | Description                                         |
|----------------|-----------------------------------------------------|
| **Flow vector** | $(u, v)$ — horizontal and vertical displacement     |
| **Sparse flow** | Computed for selected points only (fast)            |
| **Dense flow**  | Computed for every pixel (complete but slow)        |

**Applications:**
- Object tracking and trajectory analysis
- Action recognition in sports/surveillance
- Video stabilization
- Autonomous vehicle navigation
- Video compression (motion estimation)

---

## The Brightness Constancy Assumption

Optical flow relies on a key assumption: a pixel's brightness doesn't change as it moves between frames.

$$I(x, y, t) = I(x + dx, y + dy, t + dt)$$

Where $I$ is the intensity (brightness) at position $(x, y)$ at time $t$.

Using a Taylor expansion and simplifying:

$$I_x u + I_y v + I_t = 0$$

This is the **optical flow constraint equation**, where:
- $I_x, I_y$ = spatial intensity gradients
- $I_t$ = temporal intensity gradient
- $u, v$ = flow velocities we want to find

> **Problem:** One equation, two unknowns ($u$ and $v$). We need additional constraints — that's where Lucas-Kanade and Farnebäck come in.

---

## Sparse Optical Flow: Lucas-Kanade

The Lucas-Kanade method solves the optical flow equation for **specific points** by assuming all pixels in a small neighborhood have the **same flow**.

### How It Works

For a window of $n$ pixels around a point, we get $n$ equations:

$$\begin{bmatrix} I_{x_1} & I_{y_1} \\ I_{x_2} & I_{y_2} \\ \vdots & \vdots \\ I_{x_n} & I_{y_n} \end{bmatrix} \begin{bmatrix} u \\ v \end{bmatrix} = -\begin{bmatrix} I_{t_1} \\ I_{t_2} \\ \vdots \\ I_{t_n} \end{bmatrix}$$

This overdetermined system is solved using least squares:

$$\begin{bmatrix} u \\ v \end{bmatrix} = (A^T A)^{-1} A^T b$$

### Pyramidal Lucas-Kanade

Large motions can't be captured by a small window. The **pyramid** approach processes the image at multiple scales — coarse to fine — so large displacements are found at low resolution and refined at high resolution.

### Code: Tracking Points

```python
import cv2
import numpy as np

# Open video
cap = cv2.VideoCapture("traffic.mp4")

# Read the first frame
ret, old_frame = cap.read()
old_gray = cv2.cvtColor(old_frame, cv2.COLOR_BGR2GRAY)

# Detect good features to track (corners)
feature_params = dict(
    maxCorners=100,
    qualityLevel=0.3,
    minDistance=7,
    blockSize=7
)
p0 = cv2.goodFeaturesToTrack(old_gray, mask=None, **feature_params)

# Lucas-Kanade parameters
lk_params = dict(
    winSize=(15, 15),
    maxLevel=2,  # Pyramid levels
    criteria=(
        cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT,
        10, 0.03
    )
)

# Create a mask for drawing trails
trail_mask = np.zeros_like(old_frame)

# Random colors for each tracked point
colors = np.random.randint(0, 255, (100, 3))

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Calculate optical flow
    p1, status, error = cv2.calcOpticalFlowPyrLK(
        old_gray, frame_gray, p0, None, **lk_params
    )

    # Select good points (status == 1 means tracked successfully)
    if p1 is not None:
        good_new = p1[status == 1]
        good_old = p0[status == 1]

    # Draw tracks
    for i, (new, old) in enumerate(zip(good_new, good_old)):
        a, b = new.ravel().astype(int)
        c, d = old.ravel().astype(int)

        # Draw trail line
        trail_mask = cv2.line(
            trail_mask, (a, b), (c, d),
            colors[i].tolist(), 2
        )
        # Draw current position
        frame = cv2.circle(frame, (a, b), 5, colors[i].tolist(), -1)

    output = cv2.add(frame, trail_mask)
    cv2.imshow("Sparse Optical Flow", output)

    if cv2.waitKey(30) & 0xFF == 27:  # ESC to quit
        break

    # Update for next iteration
    old_gray = frame_gray.copy()
    p0 = good_new.reshape(-1, 1, 2)

cap.release()
cv2.destroyAllWindows()
```

### Understanding the Parameters

| Parameter     | What It Controls                              |
|---------------|-----------------------------------------------|
| `winSize`     | Search window size — larger = handles bigger motion |
| `maxLevel`    | Pyramid levels — 0 = no pyramid, 2–3 typical |
| `criteria`    | When to stop iterating (count + epsilon)      |
| `status`      | 1 = point tracked, 0 = lost                  |
| `error`       | Tracking error for each point                 |

---

## Dense Optical Flow: Farnebäck

Unlike Lucas-Kanade (sparse), Farnebäck computes flow for **every pixel** using polynomial expansion to approximate the neighborhood of each pixel.

### How It Works

1. Approximate each pixel neighborhood with a quadratic polynomial
2. Compute displacement from polynomial coefficients between frames
3. Iterate to refine the flow field

The result: a 2-channel image where each pixel stores $(u, v)$ — the flow vector.

### Code: Dense Flow Visualization

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("traffic.mp4")

ret, old_frame = cap.read()
old_gray = cv2.cvtColor(old_frame, cv2.COLOR_BGR2GRAY)

# HSV image for flow visualization
hsv = np.zeros_like(old_frame)
hsv[..., 1] = 255  # Full saturation

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Compute dense optical flow
    flow = cv2.calcOpticalFlowFarneback(
        old_gray, frame_gray,
        flow=None,
        pyr_scale=0.5,   # Pyramid scale
        levels=3,         # Pyramid levels
        winsize=15,       # Averaging window size
        iterations=3,     # Iterations per level
        poly_n=5,         # Polynomial neighborhood size
        poly_sigma=1.2,   # Gaussian for polynomial
        flags=0
    )

    # Convert flow to polar coordinates
    magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])

    # Map angle to hue (color = direction)
    hsv[..., 0] = angle * 180 / np.pi / 2

    # Map magnitude to value (brightness = speed)
    hsv[..., 2] = cv2.normalize(
        magnitude, None, 0, 255, cv2.NORM_MINMAX
    )

    # Convert HSV to BGR for display
    flow_rgb = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    cv2.imshow("Dense Optical Flow", flow_rgb)

    if cv2.waitKey(30) & 0xFF == 27:
        break

    old_gray = frame_gray.copy()

cap.release()
cv2.destroyAllWindows()
```

### Reading the Flow Colors

| Color   | Direction of Motion |
|---------|---------------------|
| Red     | Right               |
| Green   | Down                |
| Blue    | Left                |
| Yellow  | Up                  |

Brighter colors = faster motion. Dark areas = little or no motion.

### Farnebäck Parameters

| Parameter     | Purpose                                       | Typical Value |
|---------------|-----------------------------------------------|---------------|
| `pyr_scale`   | Image scale between pyramid levels            | 0.5           |
| `levels`      | Number of pyramid levels                      | 3             |
| `winsize`     | Averaging window — larger = smoother flow     | 15            |
| `iterations`  | Refinement iterations per level               | 3             |
| `poly_n`      | Pixel neighborhood for polynomial expansion   | 5 or 7        |
| `poly_sigma`  | Gaussian sigma for polynomial smoothing       | 1.1–1.5       |

---

## Motion Detection from Optical Flow

Use the magnitude of the flow field to detect moving regions.

```python
import cv2
import numpy as np


def detect_motion(video_path, threshold=2.0, min_area=500):
    """Detect motion in a video using dense optical flow."""
    cap = cv2.VideoCapture(video_path)
    ret, old_frame = cap.read()
    old_gray = cv2.cvtColor(old_frame, cv2.COLOR_BGR2GRAY)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Compute dense optical flow
        flow = cv2.calcOpticalFlowFarneback(
            old_gray, gray, None,
            0.5, 3, 15, 3, 5, 1.2, 0
        )

        # Get flow magnitude
        magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])

        # Threshold to find moving regions
        motion_mask = (magnitude > threshold).astype(np.uint8) * 255

        # Clean up with morphology
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        motion_mask = cv2.morphologyEx(motion_mask, cv2.MORPH_CLOSE, kernel)
        motion_mask = cv2.morphologyEx(motion_mask, cv2.MORPH_OPEN, kernel)

        # Find contours of moving regions
        contours, _ = cv2.findContours(
            motion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        for cnt in contours:
            if cv2.contourArea(cnt) > min_area:
                x, y, w, h = cv2.boundingRect(cnt)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(
                    frame, "Motion", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
                )

        cv2.imshow("Motion Detection", frame)
        cv2.imshow("Motion Mask", motion_mask)

        if cv2.waitKey(30) & 0xFF == 27:
            break

        old_gray = gray.copy()

    cap.release()
    cv2.destroyAllWindows()


detect_motion("surveillance.mp4")
```

---

## Visualizing Flow with Arrows

A helpful way to understand dense flow is to draw **arrow vectors** on the frame.

```python
import cv2
import numpy as np


def draw_flow_arrows(frame, flow, step=16, scale=3):
    """Draw optical flow as arrows on the frame."""
    h, w = frame.shape[:2]
    output = frame.copy()

    # Sample points on a grid
    y_coords, x_coords = np.mgrid[
        step // 2:h:step, step // 2:w:step
    ]

    # Get flow vectors at grid points
    fx = flow[y_coords, x_coords, 0]
    fy = flow[y_coords, x_coords, 1]

    # Draw arrows
    for i in range(y_coords.shape[0]):
        for j in range(y_coords.shape[1]):
            x = x_coords[i, j]
            y = y_coords[i, j]
            dx = int(fx[i, j] * scale)
            dy = int(fy[i, j] * scale)

            cv2.arrowedLine(
                output, (x, y), (x + dx, y + dy),
                (0, 255, 0), 1, tipLength=0.3
            )

    return output
```

---

## Sparse vs Dense: When to Use Which?

| Feature             | Sparse (Lucas-Kanade)       | Dense (Farnebäck)            |
|---------------------|-----------------------------|-----------------------------|
| **Speed**           | Fast                        | Slow                        |
| **Coverage**        | Selected points only        | Every pixel                 |
| **Best for**        | Object tracking, features   | Motion segmentation, flow viz|
| **Accuracy**        | High for tracked points     | Moderate overall             |
| **Memory**          | Low                         | High                        |
| **Occlusion**       | Detects via status flag     | No built-in handling        |

---

## Deep Learning Optical Flow (Brief)

Traditional methods have limitations. Modern deep learning approaches learn optical flow from data:

| Method     | Year | Key Idea                                  |
|------------|------|-------------------------------------------|
| **FlowNet**| 2015 | First CNN for optical flow                |
| **FlowNet2**| 2017| Stacked networks for refinement          |
| **PWC-Net**| 2018 | Pyramid, warping, cost volume             |
| **RAFT**   | 2020 | Recurrent All-Pairs Field Transforms      |

**RAFT** is the current gold standard — it builds a 4D correlation volume and iteratively updates flow using a GRU (recurrent unit). It's more accurate than classical methods but requires GPU.

---

## Practical Tips

1. **Convert to grayscale** — Optical flow works on single-channel intensity images
2. **Good features matter** — For sparse flow, use `goodFeaturesToTrack` to pick trackable corners
3. **Re-detect periodically** — Points drift or get lost; re-detect features every N frames
4. **Filter by status** — Always check the `status` array from Lucas-Kanade to discard lost points
5. **Threshold magnitude** — For motion detection, ignore small magnitudes (noise/camera vibration)
6. **Smooth flow fields** — Apply Gaussian blur to dense flow for cleaner results

---

## Try It Yourself

1. Track your hand moving in a webcam feed using Lucas-Kanade sparse optical flow
2. Visualize dense optical flow from a traffic camera video
3. Build a motion detection system that alerts when movement exceeds a threshold
4. Compare sparse and dense flow on the same video — note the speed difference

---

## Summary

- Optical flow estimates the **motion field** between consecutive video frames
- The **brightness constancy assumption** gives us: $I_x u + I_y v + I_t = 0$
- **Lucas-Kanade** (sparse): tracks selected points, fast, uses pyramids for large motion
- **Farnebäck** (dense): computes flow for every pixel, good for motion visualization
- Use flow **magnitude** for motion detection and **direction** for motion analysis
- Deep methods like **RAFT** achieve state-of-the-art accuracy but need GPU

Next, we'll explore **Background Subtraction** — a complementary approach to separating moving objects from the scene.
