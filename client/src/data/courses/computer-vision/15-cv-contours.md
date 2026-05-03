---
title: Contours & Shape Analysis
---

# Contours & Shape Analysis

Contours are curves that join all continuous points along a boundary with the same intensity. They are the primary tool for **shape detection, object counting, and geometric analysis** in computer vision.

---

## What Are Contours?

A contour is simply a list of points that form the outline of an object in a binary image. Think of it as tracing the boundary of a shape with your pen.

**Prerequisites for finding contours:**
1. Convert to grayscale
2. Apply thresholding or edge detection to get a binary image
3. Find contours on the binary image

---

## Finding Contours

### Syntax

```python
contours, hierarchy = cv2.findContours(image, mode, method)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `image` | Input binary image (white objects on black background) |
| `mode` | Contour retrieval mode |
| `method` | Contour approximation method |

**Returns:**
- `contours` — A list of contours; each contour is a NumPy array of (x, y) points
- `hierarchy` — Information about contour relationships (parent/child)

### Retrieval Modes

| Mode | Description |
|------|-------------|
| `cv2.RETR_EXTERNAL` | Only outermost contours (ignores holes/children) |
| `cv2.RETR_LIST` | All contours, no hierarchy |
| `cv2.RETR_TREE` | Full hierarchy (parent, child, sibling) |
| `cv2.RETR_CCOMP` | Two-level hierarchy (outer + holes) |

### Approximation Methods

| Method | Description |
|--------|-------------|
| `cv2.CHAIN_APPROX_NONE` | Store all boundary points |
| `cv2.CHAIN_APPROX_SIMPLE` | Compress horizontal/vertical/diagonal segments |

> **Tip:** `CHAIN_APPROX_SIMPLE` saves memory — a rectangle needs only 4 corner points instead of hundreds.

### Basic Example

```python
import cv2
import numpy as np

# Load and prepare image
img = cv2.imread("shapes.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

# Find contours
contours, hierarchy = cv2.findContours(
    binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)

print(f"Found {len(contours)} contours")
```

---

## Drawing Contours

### Syntax

```python
cv2.drawContours(image, contours, contourIdx, color, thickness)
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `image` | Image to draw on (modified in place) |
| `contours` | List of contours |
| `contourIdx` | Index of contour to draw (-1 = all) |
| `color` | Color as (B, G, R) tuple |
| `thickness` | Line thickness (-1 = fill) |

### Example

```python
import cv2
import numpy as np

img = cv2.imread("shapes.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Draw all contours in green
output = img.copy()
cv2.drawContours(output, contours, -1, (0, 255, 0), 2)

# Draw individual contours in different colors
colored = img.copy()
colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
for i, cnt in enumerate(contours):
    cv2.drawContours(colored, [cnt], 0, colors[i % len(colors)], 2)

cv2.imshow("All Contours (Green)", output)
cv2.imshow("Individual Colors", colored)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Contour Properties

### Area

```python
area = cv2.contourArea(cnt)
```

Returns the number of pixels enclosed by the contour.

### Perimeter (Arc Length)

```python
perimeter = cv2.arcLength(cnt, closed=True)
```

Set `closed=True` for closed contours.

### Bounding Rectangle (Upright)

```python
x, y, w, h = cv2.boundingRect(cnt)
cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
```

The smallest upright (non-rotated) rectangle enclosing the contour.

### Rotated (Minimum Area) Rectangle

```python
rect = cv2.minAreaRect(cnt)  # Returns ((cx, cy), (w, h), angle)
box = cv2.boxPoints(rect)    # Get 4 corner points
box = np.int32(box)
cv2.drawContours(img, [box], 0, (0, 0, 255), 2)
```

The smallest rectangle (any rotation) enclosing the contour.

### Minimum Enclosing Circle

```python
(x, y), radius = cv2.minEnclosingCircle(cnt)
center = (int(x), int(y))
radius = int(radius)
cv2.circle(img, center, radius, (255, 0, 0), 2)
```

### Centroid (Center of Mass)

Using image moments:

```python
M = cv2.moments(cnt)
if M["m00"] != 0:
    cx = int(M["m10"] / M["m00"])
    cy = int(M["m01"] / M["m00"])
```

$$c_x = \frac{M_{10}}{M_{00}}, \quad c_y = \frac{M_{01}}{M_{00}}$$

### Complete Properties Example

```python
import cv2
import numpy as np

img = cv2.imread("shapes.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

output = img.copy()
for i, cnt in enumerate(contours):
    # Basic properties
    area = cv2.contourArea(cnt)
    perimeter = cv2.arcLength(cnt, True)

    # Bounding rectangle
    x, y, w, h = cv2.boundingRect(cnt)
    cv2.rectangle(output, (x, y), (x + w, y + h), (0, 255, 0), 1)

    # Centroid
    M = cv2.moments(cnt)
    if M["m00"] != 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        cv2.circle(output, (cx, cy), 4, (0, 0, 255), -1)
        cv2.putText(output, f"#{i}", (cx - 10, cy - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

    print(f"Contour #{i}: area={area:.0f}, perimeter={perimeter:.1f}, "
          f"bounds=({x},{y},{w},{h})")

cv2.imshow("Properties", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Shape Descriptors

Shape descriptors are dimensionless ratios that help classify contours.

### Aspect Ratio

$$\text{Aspect Ratio} = \frac{w}{h}$$

```python
x, y, w, h = cv2.boundingRect(cnt)
aspect_ratio = float(w) / h
```

### Extent

Ratio of contour area to bounding rectangle area:

$$\text{Extent} = \frac{\text{contour area}}{\text{bounding rect area}}$$

```python
area = cv2.contourArea(cnt)
x, y, w, h = cv2.boundingRect(cnt)
extent = float(area) / (w * h)
```

### Solidity

Ratio of contour area to its convex hull area:

$$\text{Solidity} = \frac{\text{contour area}}{\text{convex hull area}}$$

```python
area = cv2.contourArea(cnt)
hull = cv2.convexHull(cnt)
hull_area = cv2.contourArea(hull)
solidity = float(area) / hull_area
```

### Circularity

How circular a shape is (1.0 = perfect circle):

$$\text{Circularity} = \frac{4\pi \cdot \text{area}}{\text{perimeter}^2}$$

```python
area = cv2.contourArea(cnt)
perimeter = cv2.arcLength(cnt, True)
circularity = 4 * np.pi * area / (perimeter * perimeter)
```

---

## Contour Approximation

The **Douglas-Peucker algorithm** simplifies a contour by reducing the number of points while preserving its shape.

### Syntax

```python
approx = cv2.approxPolyDP(cnt, epsilon, closed)
```

- `epsilon` — Maximum distance between the original and approximated curve. Smaller = more accurate, larger = more simplified.
- Common choice: `epsilon = 0.02 * perimeter`

### Shape Detection by Vertex Count

```python
import cv2
import numpy as np

def detect_shape(cnt):
    """Identify shape based on number of vertices."""
    perimeter = cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, 0.04 * perimeter, True)
    vertices = len(approx)

    if vertices == 3:
        return "Triangle"
    elif vertices == 4:
        # Check if square or rectangle
        x, y, w, h = cv2.boundingRect(approx)
        aspect_ratio = float(w) / h
        if 0.9 <= aspect_ratio <= 1.1:
            return "Square"
        else:
            return "Rectangle"
    elif vertices == 5:
        return "Pentagon"
    elif vertices == 6:
        return "Hexagon"
    elif vertices > 8:
        return "Circle"
    else:
        return f"Polygon ({vertices} sides)"

    return "Unknown"
```

### Complete Shape Detection Example

```python
import cv2
import numpy as np

def detect_shapes(image_path):
    """Detect and label all shapes in an image."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)

    contours, _ = cv2.findContours(
        binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    output = img.copy()
    for cnt in contours:
        # Skip small contours (noise)
        if cv2.contourArea(cnt) < 500:
            continue

        # Detect shape
        shape_name = detect_shape(cnt)

        # Find centroid for label placement
        M = cv2.moments(cnt)
        if M["m00"] == 0:
            continue
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])

        # Draw contour and label
        cv2.drawContours(output, [cnt], 0, (0, 255, 0), 2)
        cv2.putText(output, shape_name, (cx - 30, cy),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    cv2.imshow("Shape Detection", output)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


detect_shapes("mixed_shapes.png")
```

---

## Convex Hull

A convex hull is the smallest convex polygon enclosing a contour — imagine stretching a rubber band around the shape.

```python
hull = cv2.convexHull(cnt)
cv2.drawContours(img, [hull], 0, (0, 255, 255), 2)
```

### Convexity Defects

Points where the contour deviates from the convex hull:

```python
hull = cv2.convexHull(cnt, returnPoints=False)
defects = cv2.convexityDefects(cnt, hull)

if defects is not None:
    for i in range(defects.shape[0]):
        s, e, f, d = defects[i, 0]
        start = tuple(cnt[s][0])
        end = tuple(cnt[e][0])
        far = tuple(cnt[f][0])
        depth = d / 256.0  # Convert to pixels

        if depth > 10:  # Only significant defects
            cv2.circle(img, far, 5, (0, 0, 255), -1)
```

---

## Contour Hierarchy

When using `cv2.RETR_TREE`, the hierarchy array tells you about parent-child relationships between contours.

Each contour has: `[Next, Previous, FirstChild, Parent]`
- `-1` means no relationship

```python
import cv2
import numpy as np

img = cv2.imread("nested_shapes.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

contours, hierarchy = cv2.findContours(
    binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
)

# Print hierarchy info
print("Hierarchy: [Next, Previous, FirstChild, Parent]")
for i, h in enumerate(hierarchy[0]):
    parent = "None" if h[3] == -1 else f"Contour #{h[3]}"
    children = "None" if h[2] == -1 else f"First child: #{h[2]}"
    print(f"Contour #{i}: parent={parent}, {children}")

# Draw only outer contours (no parent)
output = img.copy()
for i, cnt in enumerate(contours):
    if hierarchy[0][i][3] == -1:  # No parent = outermost
        cv2.drawContours(output, [cnt], 0, (0, 255, 0), 2)

cv2.imshow("Outer Contours Only", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Practical Application: Coin Counting

```python
import cv2
import numpy as np

def count_coins(image_path):
    """Count circular objects (coins) in an image."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)

    # Threshold
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological closing to fill small gaps
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(
        closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    output = img.copy()
    coin_count = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 1000:  # Skip small noise
            continue

        # Check circularity
        perimeter = cv2.arcLength(cnt, True)
        circularity = 4 * np.pi * area / (perimeter * perimeter)

        if circularity > 0.7:  # Reasonably circular
            coin_count += 1

            # Draw enclosing circle
            (x, y), radius = cv2.minEnclosingCircle(cnt)
            center = (int(x), int(y))
            cv2.circle(output, center, int(radius), (0, 255, 0), 2)
            cv2.putText(output, str(coin_count), (center[0] - 10, center[1]),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    print(f"Total coins found: {coin_count}")
    cv2.imshow("Coins Detected", output)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


count_coins("coins.jpg")
```

---

## Sorting Contours

### By Area (Largest First)

```python
sorted_contours = sorted(contours, key=cv2.contourArea, reverse=True)
```

### By Position (Left to Right)

```python
def sort_contours_left_to_right(contours):
    """Sort contours from left to right by x-coordinate."""
    bounding_boxes = [cv2.boundingRect(cnt) for cnt in contours]
    sorted_pairs = sorted(zip(contours, bounding_boxes), key=lambda p: p[1][0])
    sorted_contours = [pair[0] for pair in sorted_pairs]
    return sorted_contours
```

### By Position (Top to Bottom)

```python
def sort_contours_top_to_bottom(contours):
    """Sort contours from top to bottom by y-coordinate."""
    bounding_boxes = [cv2.boundingRect(cnt) for cnt in contours]
    sorted_pairs = sorted(zip(contours, bounding_boxes), key=lambda p: p[1][1])
    sorted_contours = [pair[0] for pair in sorted_pairs]
    return sorted_contours
```

### Example: Sorting and Labeling

```python
import cv2
import numpy as np

img = cv2.imread("objects_row.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter small contours
contours = [c for c in contours if cv2.contourArea(c) > 500]

# Sort left to right
bounding_boxes = [cv2.boundingRect(c) for c in contours]
sorted_pairs = sorted(zip(contours, bounding_boxes), key=lambda p: p[1][0])

output = img.copy()
for i, (cnt, (x, y, w, h)) in enumerate(sorted_pairs):
    cv2.drawContours(output, [cnt], 0, (0, 255, 0), 2)
    cv2.putText(output, f"#{i+1}", (x, y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

cv2.imshow("Sorted Left to Right", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Shape Descriptor Summary Table

| Descriptor | Formula | Range | Meaning |
|------------|---------|-------|---------|
| **Aspect Ratio** | $w / h$ | 0 → ∞ | Width-to-height ratio |
| **Extent** | area / rect_area | 0 → 1 | How much of bounding box is filled |
| **Solidity** | area / hull_area | 0 → 1 | How convex the shape is |
| **Circularity** | $4\pi \cdot A / P^2$ | 0 → 1 | 1 = perfect circle |

---

## Tips & Best Practices

- **Always threshold/binarize** before finding contours
- Use `RETR_EXTERNAL` to ignore internal holes
- Use `CHAIN_APPROX_SIMPLE` to save memory
- **Filter by area** to remove noise contours
- Set `epsilon = 0.02 * perimeter` for shape detection (adjust as needed)
- For robust detection, blur the image before thresholding
- Contours expect **white objects on black background**

---

## Try It Yourself

1. Draw shapes (triangle, square, circle) on paper, photograph them, and detect each shape
2. Count the number of objects in a cluttered image
3. Measure the area in pixels of each detected object
4. Sort detected objects by size and label them 1 to N
5. Use convexity defects to count fingers in a hand image

---

## Summary

- **Contours** are boundaries of objects in binary images
- `cv2.findContours()` extracts contours; `cv2.drawContours()` visualizes them
- Key properties: **area, perimeter, bounding rect, centroid, moments**
- **Shape descriptors** (aspect ratio, extent, solidity, circularity) classify shapes
- `cv2.approxPolyDP()` simplifies contours — vertex count identifies shape type
- **Hierarchy** describes parent-child nesting of contours
- Contours are the foundation for object counting, measurement, and shape recognition
