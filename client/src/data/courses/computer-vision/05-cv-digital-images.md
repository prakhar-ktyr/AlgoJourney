---
title: Digital Images & Pixels
---

# Digital Images & Pixels

Every computer vision algorithm starts with understanding what a digital image actually *is*. In this lesson, we'll explore how images are represented as numbers and how to manipulate them at the pixel level.

---

## What Is a Digital Image?

A digital image is a **two-dimensional grid of pixels** (picture elements). Each pixel stores a numerical value representing color or intensity.

Think of it like a spreadsheet — each cell is a pixel containing a number (or set of numbers for color).

```python
import numpy as np
import matplotlib.pyplot as plt

# A tiny 5x5 grayscale image — just a 2D array of numbers!
tiny_image = np.array([
    [0,   0,   0,   0,   0  ],
    [0,   255, 255, 255, 0  ],
    [0,   255, 0,   255, 0  ],
    [0,   255, 255, 255, 0  ],
    [0,   0,   0,   0,   0  ],
], dtype=np.uint8)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
# Show as numbers
axes[0].imshow(np.ones_like(tiny_image) * 255, cmap="gray")
for i in range(5):
    for j in range(5):
        axes[0].text(j, i, str(tiny_image[i, j]),
                    ha="center", va="center", fontsize=14)
axes[0].set_title("Pixel Values (Numbers)")

# Show as rendered image
axes[1].imshow(tiny_image, cmap="gray", vmin=0, vmax=255)
axes[1].set_title("Rendered Image")
axes[1].axis("off")
plt.tight_layout()
plt.show()
```

---

## Pixels: The Building Blocks

A **pixel** (picture element) is the smallest addressable unit in a digital image.

| Property | Description |
|----------|-------------|
| **Position** | Location in the grid: $(x, y)$ |
| **Value** | Intensity or color at that location |
| **Depth** | Number of bits per value (e.g., 8-bit = 256 levels) |

### Accessing a Single Pixel

```python
import numpy as np
import cv2

# Create a simple gradient image
image = np.zeros((200, 300), dtype=np.uint8)
for i in range(200):
    image[i, :] = int(i * 255 / 200)

# Access pixel at position (row=50, col=100)
pixel_value = image[50, 100]
print(f"Pixel at (50, 100) = {pixel_value}")

# Access pixel at (0, 0) — top-left corner
print(f"Top-left pixel: {image[0, 0]}")

# Access pixel at (199, 299) — bottom-right corner
print(f"Bottom-right pixel: {image[199, 299]}")
```

---

## Image as a Matrix

A grayscale image is stored as a matrix (2D NumPy array):

$$I = \begin{bmatrix} I(0,0) & I(0,1) & \cdots & I(0,W-1) \\ I(1,0) & I(1,1) & \cdots & I(1,W-1) \\ \vdots & \vdots & \ddots & \vdots \\ I(H-1,0) & I(H-1,1) & \cdots & I(H-1,W-1) \end{bmatrix}$$

Where $H$ = height (rows) and $W$ = width (columns).

---

## Grayscale Images

A **grayscale** image has a single channel. Each pixel is one value representing light intensity.

- **0** = black (no light)
- **255** = white (maximum light)
- Values in between = shades of gray

```python
import numpy as np
import matplotlib.pyplot as plt

# Create a grayscale image with different intensities
gray_image = np.zeros((200, 400), dtype=np.uint8)
gray_image[:, 0:80] = 0        # Black
gray_image[:, 80:160] = 64     # Dark gray
gray_image[:, 160:240] = 128   # Medium gray
gray_image[:, 240:320] = 192   # Light gray
gray_image[:, 320:400] = 255   # White

print(f"Shape: {gray_image.shape}")  # (200, 400) — no 3rd dimension
print(f"Dtype: {gray_image.dtype}")  # uint8
print(f"Range: [{gray_image.min()}, {gray_image.max()}]")

plt.imshow(gray_image, cmap="gray", vmin=0, vmax=255)
plt.title("Grayscale Bands: 0, 64, 128, 192, 255")
plt.colorbar(label="Intensity")
plt.show()
```

### The Grayscale Formula

For each pixel: $I(x, y) \in [0, 255]$ where 0 = black, 255 = white.

---

## Color Images (RGB)

A **color image** has three channels — Red, Green, and Blue. Each pixel is a triplet of values.

```python
import numpy as np
import matplotlib.pyplot as plt

# Create a color image with 3 channels
color_image = np.zeros((200, 300, 3), dtype=np.uint8)
color_image[:, 0:100] = [255, 0, 0]      # Red
color_image[:, 100:200] = [0, 255, 0]    # Green
color_image[:, 200:300] = [0, 0, 255]    # Blue

print(f"Shape: {color_image.shape}")         # (200, 300, 3)
print(f"Channels: {color_image.shape[2]}")   # 3

pixel = color_image[100, 50]  # In the red band
print(f"Pixel at (100, 50): R={pixel[0]}, G={pixel[1]}, B={pixel[2]}")

plt.figure(figsize=(8, 4))
plt.imshow(color_image)
plt.title("RGB Color Image: Red | Green | Blue")
plt.axis("off")
plt.show()
```

### RGB Color Model

Each pixel: $P(x, y) = (R, G, B)$ where each channel $\in [0, 255]$.

| Color | R | G | B |
|-------|---|---|---|
| Black | 0 | 0 | 0 |
| White | 255 | 255 | 255 |
| Red | 255 | 0 | 0 |
| Green | 0 | 255 | 0 |
| Blue | 0 | 0 | 255 |
| Yellow | 255 | 255 | 0 |
| Cyan | 0 | 255 | 255 |
| Magenta | 255 | 0 | 255 |
| Gray | 128 | 128 | 128 |

### OpenCV Stores BGR, Not RGB!

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# OpenCV uses BGR (Blue, Green, Red) — historical reasons
# Matplotlib expects RGB — you MUST convert!

# Create "red" in OpenCV (BGR format)
opencv_red = np.zeros((100, 100, 3), dtype=np.uint8)
opencv_red[:, :, 2] = 255  # Channel 2 = Red in BGR

# WRONG: displaying BGR directly with matplotlib
# CORRECT: convert first
rgb_image = cv2.cvtColor(opencv_red, cv2.COLOR_BGR2RGB)

fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].imshow(opencv_red)
axes[0].set_title("BGR shown as RGB (wrong!)")
axes[1].imshow(rgb_image)
axes[1].set_title("Properly converted (correct!)")
for ax in axes:
    ax.axis("off")
plt.show()
```

---

## Bit Depth

**Bit depth** determines how many distinct values each pixel can have.

| Bit Depth | Values per Pixel | Range | Use Case |
|-----------|-----------------|-------|----------|
| 1-bit | 2 | 0–1 | Binary (black & white) |
| 8-bit | 256 | 0–255 | Standard photos |
| 16-bit | 65,536 | 0–65535 | Medical, scientific |
| 32-bit float | Continuous | 0.0–1.0 | HDR, computation |

```python
import numpy as np

# Different bit depths
image_1bit = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]], dtype=np.uint8) * 255
image_8bit = np.linspace(0, 255, 9).reshape(3, 3).astype(np.uint8)
image_float = np.linspace(0, 1, 9).reshape(3, 3).astype(np.float32)

print("1-bit (binary):", image_1bit.flatten())
print("8-bit (uint8):", image_8bit.flatten())
print("32-bit float:", image_float.flatten())
```

---

## Image Properties

Every image has measurable properties:

```python
import numpy as np
from math import gcd

# Simulate a Full HD image
image = np.random.randint(0, 256, (1080, 1920, 3), dtype=np.uint8)

height, width, channels = image.shape
print(f"Resolution: {width} × {height}")  # 1920 × 1080

g = gcd(width, height)
print(f"Aspect ratio: {width // g}:{height // g}")  # 16:9
print(f"Total size: {image.nbytes:,} bytes ({image.nbytes / 1024 / 1024:.1f} MB)")
```

### File Size Formula

For an uncompressed image:

$$\text{Size (bytes)} = W \times H \times C \times B$$

Where $W$ = width, $H$ = height, $C$ = channels, $B$ = bytes per channel.

**Example:** A 1920×1080 RGB uint8 image:
$$1920 \times 1080 \times 3 \times 1 = 6{,}220{,}800 \text{ bytes} \approx 5.93 \text{ MB}$$

---

## Image Types

### Binary Images

Only two values: 0 (black) or 255 (white).

```python
import numpy as np
import cv2

# Create a binary image (e.g., from thresholding)
binary = np.zeros((200, 200), dtype=np.uint8)
cv2.circle(binary, (100, 100), 60, 255, -1)
print(f"Unique values: {np.unique(binary)}")  # [0, 255]
```

### Grayscale, Color, and RGBA

```python
import numpy as np

# Grayscale: 1 channel — shape (H, W)
grayscale = np.random.randint(0, 256, (100, 100), dtype=np.uint8)

# Color (RGB/BGR): 3 channels — shape (H, W, 3)
color = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)

# RGBA: 4 channels — includes alpha (transparency)
rgba = np.random.randint(0, 256, (100, 100, 4), dtype=np.uint8)
rgba[:, :, 3] = 128  # 50% transparent

print(f"Grayscale: {grayscale.shape}")  # (100, 100)
print(f"Color:     {color.shape}")       # (100, 100, 3)
print(f"RGBA:      {rgba.shape}")        # (100, 100, 4)
# Alpha: 0 = fully transparent, 255 = fully opaque
```

---

## Image File Formats

| Format | Compression | Transparency | Best For |
|--------|-------------|-------------|----------|
| **JPEG** | Lossy | No | Photos, web images |
| **PNG** | Lossless | Yes (alpha) | Screenshots, logos |
| **BMP** | None | No | Uncompressed storage |
| **TIFF** | Optional | Yes | Scientific imaging |

```python
import cv2
import numpy as np
import os

image = np.random.randint(0, 256, (500, 500, 3), dtype=np.uint8)
cv2.imwrite("test.bmp", image)
cv2.imwrite("test.png", image)
cv2.imwrite("test.jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 90])

for f in ["test.bmp", "test.png", "test.jpg"]:
    size = os.path.getsize(f)
    print(f"{f:10s}: {size:>10,} bytes ({size/1024:.1f} KB)")
    os.remove(f)
```

> **Rule of thumb:** Use JPEG for photos, PNG for anything needing exact pixels or transparency.

---

## Working with Pixels: Code Examples

### Create an Image from Scratch

```python
import numpy as np
import matplotlib.pyplot as plt

# Create a 300×400 color image (all black)
image = np.zeros((300, 400, 3), dtype=np.uint8)
image[0:150, :] = [255, 0, 0]       # Top half: red
image[150:300, :] = [0, 0, 255]     # Bottom half: blue
image[100:200, 150:250] = [0, 255, 0]  # Green square in center

plt.imshow(image)
plt.title("Created from Scratch")
plt.axis("off")
plt.show()
```

### Access and Modify Individual Pixels

```python
import numpy as np
import cv2

# Create a gradient image
image = np.zeros((256, 256, 3), dtype=np.uint8)
for y in range(256):
    for x in range(256):
        image[y, x] = [x, y, 128]

# Access a specific pixel (row, col) = (y, x)
pixel = image[100, 200]
print(f"Pixel at (100, 200): {pixel}")  # [200, 100, 128]

# Modify a single pixel
image[50, 50] = [255, 255, 255]  # White

# Modify a region (much faster than looping!)
image[0:20, 0:20] = [255, 0, 0]  # Top-left → red

# Modify a single channel
image[230:256, :, 0] = 255  # Blue channel max in bottom strip
```

### Image Properties Inspection

```python
import numpy as np

image = np.random.randint(0, 256, (720, 1280, 3), dtype=np.uint8)

print(f"Shape: {image.shape}")        # (720, 1280, 3)
print(f"Dtype: {image.dtype}")        # uint8
print(f"Size: {image.nbytes} bytes")  # 2764800
print(f"Range: [{image.min()}, {image.max()}]")
print(f"Mean: {image.mean():.1f}")
```

### Convert Between Grayscale and Color

```python
import numpy as np
import cv2

# Create a color image
color = np.zeros((200, 200, 3), dtype=np.uint8)
color[50:150, 50:150] = [0, 128, 255]  # Orange rectangle (BGR)

# Convert to grayscale
gray = cv2.cvtColor(color, cv2.COLOR_BGR2GRAY)
print(f"Color shape: {color.shape}")  # (200, 200, 3)
print(f"Gray shape:  {gray.shape}")   # (200, 200)

# Convert grayscale back to "color" (3 channels, but still gray)
gray_3ch = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
print(f"Gray→Color shape: {gray_3ch.shape}")  # (200, 200, 3)
# Note: you can't recover original colors from grayscale!
```

### Grayscale Conversion Formula

The standard formula (ITU-R BT.601):

$$\text{Gray} = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

The weights are not equal because human vision is most sensitive to green, then red, then blue.

---

## Coordinate System

OpenCV and NumPy use this coordinate system:

```
(0,0) ───────────────────── x (columns) ───▶
  │
  │    Image pixels arranged in a grid
  │
  │    image[y, x] or image[row, col]
  │
  y (rows)
  │
  ▼
```

**Key points:**
- Origin $(0, 0)$ is at the **top-left** corner
- **x-axis** goes right (columns)
- **y-axis** goes down (rows)
- Access: `image[y, x]` or `image[row, col]`

```python
import numpy as np
import matplotlib.pyplot as plt

# Demonstrate coordinate system
image = np.ones((300, 400, 3), dtype=np.uint8) * 200

# Mark corners and center
image[0:10, 0:10] = [255, 0, 0]        # Origin (0,0) — top-left
image[0:10, 390:400] = [0, 255, 0]     # Top-right
image[290:300, 0:10] = [0, 0, 255]     # Bottom-left
image[145:155, 195:205] = [255, 255, 0] # Center

plt.figure(figsize=(8, 5))
plt.imshow(image)
plt.title("Coordinate System: (0,0) at top-left")
plt.xlabel("x (columns) →")
plt.ylabel("y (rows) ↓")
plt.show()
```

---

## Slicing: Working with Regions

NumPy slicing is the fastest way to work with image regions:

```python
import numpy as np
import cv2

# Create a test image
image = np.zeros((300, 400, 3), dtype=np.uint8)
for y in range(300):
    for x in range(400):
        image[y, x] = [int(x * 0.6), int(y * 0.8), 128]

# Slice syntax: image[y_start:y_end, x_start:x_end]
roi = image[50:150, 100:250]  # Extract a 100×150 region
print(f"ROI shape: {roi.shape}")

# Copy a region to another location
image[200:250, 300:375] = image[50:100, 100:175]

# Set a region to a solid color
image[10:40, 10:40] = [255, 255, 255]  # White square

# Access a single channel
blue_channel = image[:, :, 0]
print(f"Single channel shape: {blue_channel.shape}")  # (300, 400)
```

---

## Summary Table

| Concept | Description |
|---------|-------------|
| Pixel | Smallest unit; holds intensity/color values |
| Grayscale | 1 channel, shape `(H, W)`, values 0–255 |
| Color (RGB) | 3 channels, shape `(H, W, 3)` |
| BGR | OpenCV's default channel order |
| uint8 | 8-bit unsigned integer (0–255) |
| float32 | Floating point (0.0–1.0 normalized) |
| Origin | Top-left corner at (0, 0) |
| Access | `image[row, col]` = `image[y, x]` |

---

## Key Takeaways

1. Digital images are **2D grids of numbers** (NumPy arrays)
2. Grayscale = 1 channel; color = 3 channels (RGB or BGR)
3. Pixels range from **0 (black) to 255 (white)** in 8-bit images
4. Image shape is **(height, width, channels)** — height comes first!
5. OpenCV uses **BGR** order; always convert for Matplotlib
6. The coordinate origin is at the **top-left**, with y increasing downward
7. Use **NumPy slicing** for fast region operations

---

## Next Lesson

Now that you understand how images are stored as numbers, we'll explore **color spaces** — different ways to represent color (RGB, HSV, LAB) and why switching between them is essential for many CV tasks.
