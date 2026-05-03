---
title: Drawing on Images
---

# Drawing on Images

Drawing on images is essential for **annotations**, **visualizations**, and **overlays**. Whether you're marking detected objects with bounding boxes or building an interactive paint app, OpenCV's drawing functions make it straightforward.

---

## Why Draw on Images?

- **Annotate** detected objects with bounding boxes and labels
- **Visualize** algorithm results (contours, keypoints, flow)
- **Create** diagrams, charts, and graphics programmatically
- **Debug** by marking regions of interest
- **Build** interactive tools (paint apps, annotation tools)

---

## Creating a Blank Canvas

Before drawing, you often need a blank image to work with:

```python
import numpy as np
import cv2

# Black canvas (all zeros)
canvas = np.zeros((500, 700, 3), dtype=np.uint8)
print(f"Canvas shape: {canvas.shape}")  # (500, 700, 3)

# White canvas (all 255)
white_canvas = np.ones((500, 700, 3), dtype=np.uint8) * 255

# Colored canvas (e.g., light gray)
gray_canvas = np.full((500, 700, 3), 200, dtype=np.uint8)

# Single channel (grayscale) canvas
gray_single = np.zeros((500, 700), dtype=np.uint8)
```

---

## Drawing Lines

```python
import cv2
import numpy as np

canvas = np.zeros((400, 600, 3), dtype=np.uint8)

# cv2.line(image, start_point, end_point, color, thickness)
# Points are (x, y) tuples
# Color is BGR tuple

# Red line
cv2.line(canvas, (50, 50), (550, 50), (0, 0, 255), 2)

# Green thick line
cv2.line(canvas, (50, 100), (550, 100), (0, 255, 0), 5)

# Blue dashed-style line (draw segments)
for i in range(50, 550, 20):
    cv2.line(canvas, (i, 150), (i + 10, 150), (255, 0, 0), 2)

# Diagonal line
cv2.line(canvas, (50, 200), (550, 350), (255, 255, 0), 3)

# Anti-aliased line (smoother)
cv2.line(canvas, (50, 380), (550, 250), (255, 255, 255), 2, cv2.LINE_AA)

cv2.imshow("Lines", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Line Types

| Type | Constant | Description |
|------|----------|-------------|
| 4-connected | `cv2.LINE_4` | Faster, slightly jagged |
| 8-connected | `cv2.LINE_8` | Default, good quality |
| Anti-aliased | `cv2.LINE_AA` | Smooth edges, best quality |

---

## Drawing Rectangles

```python
import cv2
import numpy as np

canvas = np.zeros((400, 600, 3), dtype=np.uint8)

# cv2.rectangle(image, top_left, bottom_right, color, thickness)

# Simple rectangle (outline)
cv2.rectangle(canvas, (50, 50), (200, 150), (0, 255, 0), 2)

# Filled rectangle (thickness = -1)
cv2.rectangle(canvas, (250, 50), (400, 150), (0, 0, 255), -1)

# Thick border rectangle
cv2.rectangle(canvas, (450, 50), (580, 150), (255, 255, 0), 4)

# Square
cv2.rectangle(canvas, (50, 200), (150, 300), (255, 0, 255), 2)

cv2.imshow("Rectangles", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Drawing Circles

```python
import cv2
import numpy as np

canvas = np.zeros((400, 600, 3), dtype=np.uint8)

# cv2.circle(image, center, radius, color, thickness)

# Simple circle (outline)
cv2.circle(canvas, (150, 200), 80, (0, 255, 0), 2)

# Filled circle
cv2.circle(canvas, (350, 200), 80, (0, 0, 255), -1)

# Concentric circles
for r in range(20, 120, 20):
    cv2.circle(canvas, (530, 200), r, (255, 255, 255), 1)

# Anti-aliased circle
cv2.circle(canvas, (150, 350), 30, (255, 255, 0), 2, cv2.LINE_AA)

cv2.imshow("Circles", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Drawing Ellipses

Ellipses are more complex — you can control axes, angle, and arc:

```python
import cv2
import numpy as np

canvas = np.zeros((400, 600, 3), dtype=np.uint8)

# cv2.ellipse(image, center, axes, angle, startAngle, endAngle, color, thickness)
# axes = (major_axis_half, minor_axis_half)
# angle = rotation of the ellipse (degrees)
# startAngle, endAngle = arc portion (0-360 for full ellipse)

# Full ellipse
cv2.ellipse(canvas, (150, 200), (100, 50), 0, 0, 360, (0, 255, 0), 2)

# Rotated ellipse (45 degrees)
cv2.ellipse(canvas, (350, 200), (100, 50), 45, 0, 360, (0, 0, 255), 2)

# Half ellipse (arc)
cv2.ellipse(canvas, (530, 200), (60, 40), 0, 0, 180, (255, 255, 0), 3)

# Filled ellipse
cv2.ellipse(canvas, (150, 350), (70, 40), 30, 0, 360, (255, 0, 255), -1)

cv2.imshow("Ellipses", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Drawing Polygons

```python
import cv2
import numpy as np

canvas = np.zeros((400, 600, 3), dtype=np.uint8)

# Define polygon vertices as numpy array
# Must be int32 and reshaped to (-1, 1, 2)
triangle = np.array([[100, 50], [50, 150], [150, 150]], dtype=np.int32)
pentagon = np.array([[300, 80], [350, 120], [330, 180],
                     [270, 180], [250, 120]], dtype=np.int32)
star = np.array([[500, 50], [520, 120], [580, 120],
                 [530, 160], [550, 230], [500, 180],
                 [450, 230], [470, 160], [420, 120],
                 [480, 120]], dtype=np.int32)

# Draw polygon outlines
# cv2.polylines(image, [points], isClosed, color, thickness)
cv2.polylines(canvas, [triangle], True, (0, 255, 0), 2)
cv2.polylines(canvas, [pentagon], True, (0, 0, 255), 2)

# Draw filled polygon
# cv2.fillPoly(image, [points], color)
cv2.fillPoly(canvas, [star], (0, 255, 255))

# Draw multiple polygons at once
shapes = [triangle + np.array([0, 200]), pentagon + np.array([0, 200])]
cv2.polylines(canvas, shapes, True, (255, 255, 255), 1)

cv2.imshow("Polygons", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Adding Text

```python
import cv2
import numpy as np

canvas = np.zeros((500, 700, 3), dtype=np.uint8)

# cv2.putText(image, text, origin, font, scale, color, thickness)
# origin = bottom-left corner of the text

# Basic text
cv2.putText(canvas, "Hello OpenCV!", (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

# Different fonts
fonts = [
    (cv2.FONT_HERSHEY_SIMPLEX, "SIMPLEX"),
    (cv2.FONT_HERSHEY_PLAIN, "PLAIN"),
    (cv2.FONT_HERSHEY_DUPLEX, "DUPLEX"),
    (cv2.FONT_HERSHEY_COMPLEX, "COMPLEX"),
    (cv2.FONT_HERSHEY_TRIPLEX, "TRIPLEX"),
    (cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, "SCRIPT_SIMPLEX"),
    (cv2.FONT_HERSHEY_SCRIPT_COMPLEX, "SCRIPT_COMPLEX"),
]

y = 100
for font, name in fonts:
    cv2.putText(canvas, f"{name}: Hello!", (50, y), font, 0.8, (0, 255, 0), 1)
    y += 50

# Italic text (add FONT_ITALIC flag)
cv2.putText(canvas, "Italic Text", (50, y),
            cv2.FONT_HERSHEY_SIMPLEX | cv2.FONT_ITALIC, 1, (0, 255, 255), 2)

cv2.imshow("Text", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Getting Text Size

Use `cv2.getTextSize()` to calculate text dimensions for proper positioning:

```python
import cv2
import numpy as np

canvas = np.zeros((300, 500, 3), dtype=np.uint8)

text = "Centered Text"
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 1.5
thickness = 2

# Get text size
(text_width, text_height), baseline = cv2.getTextSize(
    text, font, font_scale, thickness
)

# Calculate center position
img_h, img_w = canvas.shape[:2]
x = (img_w - text_width) // 2
y = (img_h + text_height) // 2

# Draw centered text
cv2.putText(canvas, text, (x, y), font, font_scale, (255, 255, 255), thickness)

# Draw bounding box around text
cv2.rectangle(canvas, (x, y - text_height), (x + text_width, y + baseline),
              (0, 255, 0), 1)

cv2.imshow("Centered", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Color and Thickness Reference

### Color Format (BGR)

```python
# Common colors in BGR format
RED = (0, 0, 255)
GREEN = (0, 255, 0)
BLUE = (255, 0, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
YELLOW = (0, 255, 255)
CYAN = (255, 255, 0)
MAGENTA = (255, 0, 255)
ORANGE = (0, 165, 255)
```

### Thickness

| Value | Effect |
|-------|--------|
| 1 | Thin outline |
| 2–3 | Normal outline |
| 4+ | Thick outline |
| -1 | Filled shape |

---

## Drawing on a Copy

Drawing functions modify the image **in-place**. To preserve the original:

```python
import cv2

img = cv2.imread("photo.jpg")
if img is None:
    exit("Image not found!")

# Create a copy to draw on
annotated = img.copy()

# Draw on the copy — original is untouched
cv2.rectangle(annotated, (100, 100), (300, 300), (0, 255, 0), 2)
cv2.putText(annotated, "Object", (100, 90),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

# Verify original is unchanged
print(f"Original pixel: {img[100, 100]}")
print(f"Annotated pixel: {annotated[100, 100]}")
```

---

## Transparency with cv2.addWeighted()

Create semi-transparent overlays:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")
if img is None:
    exit("Image not found!")

# Create an overlay (copy of the image)
overlay = img.copy()

# Draw a filled semi-transparent rectangle
cv2.rectangle(overlay, (50, 50), (300, 200), (0, 0, 255), -1)

# Blend the overlay with the original
alpha = 0.4  # Transparency factor (0=invisible, 1=opaque)
result = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)

# Add text on top (fully opaque)
cv2.putText(result, "Semi-transparent box", (60, 130),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

cv2.imshow("Transparent Overlay", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Practical: Annotate with Bounding Boxes and Labels

```python
import cv2
import numpy as np

img = cv2.imread("street.jpg")
if img is None:
    # Create a demo image if no file available
    img = np.full((480, 640, 3), 180, dtype=np.uint8)

# Simulated detections: (label, confidence, x1, y1, x2, y2)
detections = [
    ("car", 0.95, 100, 200, 300, 350),
    ("person", 0.87, 350, 100, 450, 400),
    ("dog", 0.72, 500, 300, 600, 420),
]

# Colors for different classes
colors = {
    "car": (0, 255, 0),
    "person": (255, 0, 0),
    "dog": (0, 165, 255),
}

for label, conf, x1, y1, x2, y2 in detections:
    color = colors.get(label, (255, 255, 255))

    # Draw bounding box
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

    # Create label text
    text = f"{label}: {conf:.0%}"

    # Get text size for background rectangle
    (tw, th), baseline = cv2.getTextSize(
        text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1
    )

    # Draw filled background for text
    cv2.rectangle(img, (x1, y1 - th - 10), (x1 + tw + 5, y1), color, -1)

    # Draw text
    cv2.putText(img, text, (x1 + 2, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

cv2.imshow("Detections", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Interactive Drawing with Mouse Events

Build a simple drawing app using mouse callbacks:

```python
import cv2
import numpy as np

drawing = False
start_x, start_y = -1, -1
canvas = np.zeros((500, 700, 3), dtype=np.uint8)


def mouse_callback(event, x, y, flags, param):
    global drawing, start_x, start_y, canvas

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        start_x, start_y = x, y
    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        cv2.rectangle(canvas, (start_x, start_y), (x, y), (0, 255, 0), 2)


cv2.namedWindow("Drawing App")
cv2.setMouseCallback("Drawing App", mouse_callback)

while True:
    cv2.imshow("Drawing App", canvas)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    elif key == ord("x"):
        canvas = np.zeros((500, 700, 3), dtype=np.uint8)

cv2.destroyAllWindows()
```

### Mouse Event Types

| Event | Constant | Description |
|-------|----------|-------------|
| Left button down | `cv2.EVENT_LBUTTONDOWN` | Left click pressed |
| Left button up | `cv2.EVENT_LBUTTONUP` | Left click released |
| Mouse move | `cv2.EVENT_MOUSEMOVE` | Mouse moved |
| Right button down | `cv2.EVENT_RBUTTONDOWN` | Right click pressed |
| Double click | `cv2.EVENT_LBUTTONDBLCLK` | Left double-click |
| Mouse wheel | `cv2.EVENT_MOUSEWHEEL` | Scroll wheel |

---

## Key Takeaways

1. **All drawing functions modify the image in-place** — use `.copy()` to preserve originals
2. **Points are (x, y)** tuples — not (row, col)!
3. **Color is BGR** — (255, 0, 0) is blue, not red
4. **Thickness = -1** means filled
5. **`cv2.LINE_AA`** gives smooth, anti-aliased lines
6. **`cv2.getTextSize()`** helps position text precisely
7. **`cv2.addWeighted()`** creates transparency effects
8. **`cv2.setMouseCallback()`** enables interactive drawing

---

## Exercises

1. Draw a target (concentric circles with a crosshair)
2. Create a color palette grid showing 16 different colors with labels
3. Build a freehand drawing app that draws wherever the mouse moves
4. Annotate a photo with labeled bounding boxes for 3 objects
5. Create an analog clock that draws hour, minute, and second hands
