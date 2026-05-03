---
title: Hough Transform
---

# Hough Transform

The **Hough Transform** is a powerful technique for detecting geometric shapes — lines, circles, and ellipses — in images. Instead of looking at pixels directly, it maps edge points into a **parameter space** where shapes become easy to find.

---

## What Is the Hough Transform?

Imagine you have an edge-detected image full of white pixels. Some of those pixels form straight lines, circles, or other shapes. The Hough Transform finds those shapes by letting each edge pixel **vote** for all the shapes it could belong to.

**Key idea:** Transform the problem from image space to parameter space, where detecting shapes becomes finding peaks.

| Shape   | Parameter Space       | Parameters              |
|---------|-----------------------|-------------------------|
| Line    | (ρ, θ) space          | Distance and angle      |
| Circle  | (x, y, r) space      | Center and radius       |
| Ellipse | (x, y, a, b, θ)      | Center, axes, rotation  |

---

## Line Detection: Hough Line Transform

### The Parametric Form

A line in an image can be described using the **normal form**:

$$\rho = x\cos\theta + y\sin\theta$$

Where:
- $\rho$ = perpendicular distance from origin to the line
- $\theta$ = angle of the perpendicular with the x-axis
- $(x, y)$ = coordinates of a point on the line

> **Why not y = mx + b?** The slope-intercept form can't represent vertical lines (infinite slope). The (ρ, θ) form handles **all** orientations.

### How Voting Works

1. Create a 2D **accumulator array** for (ρ, θ) values
2. For each edge pixel $(x_i, y_i)$:
   - Compute $\rho$ for every possible $\theta$ (0° to 180°)
   - Increment the accumulator cell at each $(\rho, \theta)$
3. Find **peaks** in the accumulator — these correspond to detected lines

Each edge pixel traces a **sinusoidal curve** in (ρ, θ) space. Where curves intersect, many pixels agree on the same line.

### Standard Hough Lines

```python
import cv2
import numpy as np

# Load image and detect edges
img = cv2.imread("road.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)

# Standard Hough Line Transform
# Parameters:
#   edges     - binary edge image
#   rho       - distance resolution (1 pixel)
#   theta     - angle resolution (1 degree in radians)
#   threshold - minimum votes to count as a line
lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)

# Draw detected lines
if lines is not None:
    for line in lines:
        rho, theta = line[0]

        # Convert (rho, theta) to two points for drawing
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho

        # Extend the line across the image
        x1 = int(x0 + 1000 * (-b))
        y1 = int(y0 + 1000 * (a))
        x2 = int(x0 - 1000 * (-b))
        y2 = int(y0 - 1000 * (a))

        cv2.line(img, (x1, y1), (x2, y2), (0, 0, 255), 2)

cv2.imshow("Hough Lines", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Understanding the Parameters

| Parameter   | What It Does                        | Typical Value        |
|-------------|-------------------------------------|----------------------|
| `rho`       | Distance resolution in pixels       | 1                    |
| `theta`     | Angle resolution in radians         | `np.pi / 180` (1°)  |
| `threshold` | Minimum votes to detect a line      | 100–200              |

- **Higher threshold** → fewer but stronger lines
- **Lower threshold** → more lines detected (including noise)

---

## Probabilistic Hough Transform

The standard Hough Transform returns **infinite lines** (extending edge to edge). In practice, you usually want **line segments** with start and end points. That's what the Probabilistic Hough Transform gives you.

### Why Probabilistic?

- Only examines a **random subset** of edge points (faster!)
- Returns actual **line segments** with endpoints $(x_1, y_1, x_2, y_2)$
- More practical for real-world applications

### Using HoughLinesP

```python
import cv2
import numpy as np

img = cv2.imread("building.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)

# Probabilistic Hough Transform
# Additional parameters:
#   minLineLength - minimum length of a line segment
#   maxLineGap    - maximum gap between segments to join
lines = cv2.HoughLinesP(
    edges,
    rho=1,
    theta=np.pi / 180,
    threshold=50,
    minLineLength=50,
    maxLineGap=10
)

# Draw line segments
if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        cv2.line(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        # Draw endpoints
        cv2.circle(img, (x1, y1), 5, (255, 0, 0), -1)
        cv2.circle(img, (x2, y2), 5, (255, 0, 0), -1)

    print(f"Detected {len(lines)} line segments")

cv2.imshow("Probabilistic Hough", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Tuning minLineLength and maxLineGap

| Parameter        | Effect of Increasing                  |
|------------------|---------------------------------------|
| `minLineLength`  | Removes short/noisy segments          |
| `maxLineGap`     | Joins nearby segments into one line   |

---

## Lane Detection Example

A classic application: detecting road lanes for autonomous driving.

```python
import cv2
import numpy as np


def region_of_interest(edges, vertices):
    """Mask edges outside the region of interest."""
    mask = np.zeros_like(edges)
    cv2.fillPoly(mask, vertices, 255)
    return cv2.bitwise_and(edges, mask)


def detect_lanes(frame):
    """Detect lane lines in a road image."""
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Blur to reduce noise
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Edge detection
    edges = cv2.Canny(blur, 50, 150)

    # Define region of interest (trapezoidal)
    h, w = edges.shape
    vertices = np.array([[
        (int(w * 0.1), h),
        (int(w * 0.45), int(h * 0.6)),
        (int(w * 0.55), int(h * 0.6)),
        (int(w * 0.9), h)
    ]])
    roi = region_of_interest(edges, vertices)

    # Detect line segments
    lines = cv2.HoughLinesP(
        roi,
        rho=2,
        theta=np.pi / 180,
        threshold=40,
        minLineLength=40,
        maxLineGap=100
    )

    # Separate left and right lanes by slope
    left_lines = []
    right_lines = []

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if x2 == x1:
                continue
            slope = (y2 - y1) / (x2 - x1)

            if slope < -0.5:  # Left lane (negative slope)
                left_lines.append(line[0])
            elif slope > 0.5:  # Right lane (positive slope)
                right_lines.append(line[0])

    # Draw lanes
    overlay = frame.copy()
    for line in left_lines:
        x1, y1, x2, y2 = line
        cv2.line(overlay, (x1, y1), (x2, y2), (255, 0, 0), 3)

    for line in right_lines:
        x1, y1, x2, y2 = line
        cv2.line(overlay, (x1, y1), (x2, y2), (0, 0, 255), 3)

    return overlay


# Process a road image
frame = cv2.imread("road.jpg")
result = detect_lanes(frame)

cv2.imshow("Lane Detection", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Circle Detection: Hough Circle Transform

The Hough Circle Transform finds circles by searching in $(x, y, r)$ parameter space.

A circle with center $(a, b)$ and radius $r$ satisfies:

$$(x - a)^2 + (y - b)^2 = r^2$$

### Detecting Circles

```python
import cv2
import numpy as np

img = cv2.imread("coins.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Blur to reduce noise (important for circle detection!)
blur = cv2.medianBlur(gray, 5)

# Detect circles
circles = cv2.HoughCircles(
    blur,
    method=cv2.HOUGH_GRADIENT,
    dp=1.2,
    minDist=50,
    param1=100,
    param2=40,
    minRadius=20,
    maxRadius=100
)

# Draw detected circles
if circles is not None:
    circles = np.uint16(np.around(circles))

    for circle in circles[0, :]:
        cx, cy, r = circle

        # Draw outer circle
        cv2.circle(img, (cx, cy), r, (0, 255, 0), 2)
        # Draw center
        cv2.circle(img, (cx, cy), 2, (0, 0, 255), 3)

    print(f"Found {len(circles[0])} circles")

cv2.imshow("Detected Circles", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Parameter Reference

| Parameter  | What It Controls                                          | Tips                              |
|------------|-----------------------------------------------------------|-----------------------------------|
| `method`   | Detection method                                          | Use `HOUGH_GRADIENT`              |
| `dp`       | Inverse ratio of accumulator resolution                   | 1.0–2.0; higher = coarser        |
| `minDist`  | Minimum distance between circle centers                   | Prevents duplicate detections     |
| `param1`   | Upper Canny threshold (lower = `param1 / 2`)              | 50–200                            |
| `param2`   | Accumulator threshold for circle detection                | Lower = more circles (more noise) |
| `minRadius`| Minimum circle radius to detect                           | Set based on expected object size |
| `maxRadius`| Maximum circle radius to detect                           | 0 = no maximum limit              |

### Coin Counting Example

```python
import cv2
import numpy as np


def count_coins(image_path):
    """Detect and count coins in an image."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.medianBlur(gray, 7)

    circles = cv2.HoughCircles(
        blur,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=60,
        param1=100,
        param2=35,
        minRadius=25,
        maxRadius=80
    )

    if circles is not None:
        circles = np.uint16(np.around(circles))
        count = len(circles[0])

        for i, (cx, cy, r) in enumerate(circles[0]):
            cv2.circle(img, (cx, cy), r, (0, 255, 0), 2)
            cv2.circle(img, (cx, cy), 2, (0, 0, 255), 3)
            cv2.putText(
                img, str(i + 1), (cx - 10, cy + 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
            )

        cv2.putText(
            img, f"Coins: {count}", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
        )
    else:
        count = 0

    return img, count


result, total = count_coins("coins.jpg")
print(f"Total coins detected: {total}")

cv2.imshow("Coin Counter", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Hough vs Contour-Based Detection

| Feature               | Hough Transform               | Contour Detection            |
|-----------------------|-------------------------------|------------------------------|
| **Detects**           | Parametric shapes             | Any closed boundary          |
| **Partial shapes**    | Yes — works with gaps         | No — needs connected edges   |
| **Speed**             | Slower (accumulator voting)   | Faster                       |
| **Noise tolerance**   | High                          | Medium                       |
| **Best for**          | Lines, circles, known shapes  | Irregular shapes, counting   |
| **Occlusion**         | Handles well                  | Struggles                    |

> **Rule of thumb:** Use Hough when you know the shape you're looking for (lines, circles). Use contours when you need to find arbitrary shapes or measure area/perimeter.

---

## Practical Tips

1. **Always preprocess** — Apply Gaussian blur before edge detection and Hough Transform
2. **Tune Canny first** — Good edges = good Hough results
3. **Start with high thresholds** — Then lower gradually until you get the shapes you need
4. **Use Probabilistic** for lines — `HoughLinesP` is almost always more practical than `HoughLines`
5. **Median blur for circles** — Reduces salt-and-pepper noise that creates false circles
6. **Set radius range** — Narrow the search space for `HoughCircles` when you know object sizes

---

## Try It Yourself

1. Load an image of a building and detect all straight edges using `HoughLinesP`
2. Detect coins in an image and count them using `HoughCircles`
3. Build a lane detector that works on a dashcam video (process frame-by-frame)
4. Compare results: detect the same circles using both Hough Transform and contour-based methods

---

## Summary

- The Hough Transform detects shapes by mapping edge pixels to **parameter space** and finding peaks
- **Hough Lines** uses the parametric form $\rho = x\cos\theta + y\sin\theta$
- **HoughLinesP** is the practical choice — returns line segments with endpoints
- **HoughCircles** detects circles using the gradient-based method
- Always preprocess with blur + Canny edges before applying Hough transforms
- Hough handles **partial and occluded shapes** — a key advantage over contour methods

Next, we'll explore **Optical Flow & Motion** — tracking how pixels move between video frames.
