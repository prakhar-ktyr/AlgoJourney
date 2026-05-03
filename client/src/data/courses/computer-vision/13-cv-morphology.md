---
title: Morphological Operations
---

# Morphological Operations

Morphological operations process images based on **shapes**. They are primarily applied to binary images (black & white) and are used to remove noise, fill holes, separate objects, and extract structural features.

---

## What Are Morphological Operations?

Morphology in computer vision means analyzing and processing geometric structures in images. These operations use a small shape (called a **structuring element**) that slides over the image — similar to convolution, but using set operations (min/max) instead of sums.

**Common uses:**
- Removing small noise spots
- Filling small holes in objects
- Separating touching objects
- Finding object boundaries
- Extracting skeletons

---

## Structuring Element (Kernel)

The structuring element defines the neighborhood shape used in morphological operations.

### Creating a Structuring Element

```python
kernel = cv2.getStructuringElement(shape, (width, height))
```

### Available Shapes

| Shape | Constant | Description |
|-------|----------|-------------|
| Rectangle | `cv2.MORPH_RECT` | All 1s in a rectangular grid |
| Ellipse | `cv2.MORPH_ELLIPSE` | Filled ellipse inscribed in the rectangle |
| Cross | `cv2.MORPH_CROSS` | Plus sign shape |

### Example

```python
import cv2
import numpy as np

# Create different structuring elements (5x5)
rect = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
ellipse = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
cross = cv2.getStructuringElement(cv2.MORPH_CROSS, (5, 5))

print("Rectangle:\n", rect)
print("\nEllipse:\n", ellipse)
print("\nCross:\n", cross)
```

Output:
```
Rectangle:
 [[1 1 1 1 1]
  [1 1 1 1 1]
  [1 1 1 1 1]
  [1 1 1 1 1]
  [1 1 1 1 1]]

Ellipse:
 [[0 0 1 0 0]
  [1 1 1 1 1]
  [1 1 1 1 1]
  [1 1 1 1 1]
  [0 0 1 0 0]]

Cross:
 [[0 0 1 0 0]
  [0 0 1 0 0]
  [1 1 1 1 1]
  [0 0 1 0 0]
  [0 0 1 0 0]]
```

> **Tip:** Use **ellipse** for general-purpose operations, **rectangle** when working with rectangular features, and **cross** for thin line structures.

---

## Erosion

Erosion **shrinks** white (foreground) regions. A pixel is kept white only if **all** pixels in its neighborhood (defined by the kernel) are white.

$$\text{output}(x,y) = \min_{(i,j) \in \text{kernel}} \text{input}(x+i, y+j)$$

### Syntax

```python
dst = cv2.erode(img, kernel, iterations=1)
```

### Effects

- Shrinks white regions
- Removes small white noise spots
- Disconnects weakly connected objects
- Makes objects thinner

### Example

```python
import cv2
import numpy as np

img = cv2.imread("text_binary.png", cv2.IMREAD_GRAYSCALE)
_, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))

# Apply erosion with different iterations
erode_1 = cv2.erode(binary, kernel, iterations=1)
erode_2 = cv2.erode(binary, kernel, iterations=2)
erode_3 = cv2.erode(binary, kernel, iterations=3)

cv2.imshow("Original", binary)
cv2.imshow("Eroded 1x", erode_1)
cv2.imshow("Eroded 2x", erode_2)
cv2.imshow("Eroded 3x", erode_3)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Dilation

Dilation **expands** white regions. A pixel becomes white if **any** pixel in its neighborhood is white.

$$\text{output}(x,y) = \max_{(i,j) \in \text{kernel}} \text{input}(x+i, y+j)$$

### Syntax

```python
dst = cv2.dilate(img, kernel, iterations=1)
```

### Effects

- Expands white regions
- Fills small holes inside objects
- Connects nearby objects
- Makes objects thicker

### Example

```python
import cv2
import numpy as np

img = cv2.imread("text_binary.png", cv2.IMREAD_GRAYSCALE)
_, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))

# Apply dilation
dilate_1 = cv2.dilate(binary, kernel, iterations=1)
dilate_2 = cv2.dilate(binary, kernel, iterations=2)
dilate_3 = cv2.dilate(binary, kernel, iterations=3)

cv2.imshow("Original", binary)
cv2.imshow("Dilated 1x", dilate_1)
cv2.imshow("Dilated 2x", dilate_2)
cv2.imshow("Dilated 3x", dilate_3)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Opening (Erosion → Dilation)

Opening removes small white noise while preserving the shape and size of larger objects.

$$\text{Opening} = \text{Dilate}(\text{Erode}(\text{image}))$$

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
```

### Use Case

- Remove small noise spots from binary images
- Clean up thresholded images before further processing

### Example

```python
import cv2
import numpy as np

# Create noisy binary image
img = np.zeros((300, 300), dtype=np.uint8)
cv2.rectangle(img, (80, 80), (220, 220), 255, -1)

# Add small white noise
noise = np.random.random((300, 300)) > 0.98
img[noise] = 255

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
opened = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)

cv2.imshow("Noisy", img)
cv2.imshow("After Opening", opened)  # Noise removed, square preserved
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Closing (Dilation → Erosion)

Closing fills small holes and gaps inside objects while preserving overall shape and size.

$$\text{Closing} = \text{Erode}(\text{Dilate}(\text{image}))$$

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
```

### Use Case

- Fill small black holes inside white objects
- Connect nearby broken parts of an object

### Example

```python
import cv2
import numpy as np

# Create binary image with holes
img = np.zeros((300, 300), dtype=np.uint8)
cv2.rectangle(img, (80, 80), (220, 220), 255, -1)

# Add small black holes
holes = np.random.random((300, 300)) > 0.98
img[holes & (img == 255)] = 0

kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
closed = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)

cv2.imshow("With Holes", img)
cv2.imshow("After Closing", closed)  # Holes filled, shape preserved
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Morphological Gradient

The gradient highlights the **edges/outlines** of objects. It is the difference between dilation and erosion.

$$\text{Gradient} = \text{Dilate}(\text{image}) - \text{Erode}(\text{image})$$

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, kernel)
```

### Example

```python
import cv2
import numpy as np

img = cv2.imread("shapes.png", cv2.IMREAD_GRAYSCALE)
_, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
gradient = cv2.morphologyEx(binary, cv2.MORPH_GRADIENT, kernel)

cv2.imshow("Original", binary)
cv2.imshow("Morphological Gradient (Outline)", gradient)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Top Hat

Top hat extracts **bright spots on a dark background** — the difference between the original and the opening.

$$\text{Top Hat} = \text{image} - \text{Open}(\text{image})$$

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)
```

### Use Case

- Detecting small bright features on uneven backgrounds
- Text extraction from documents with varying illumination

---

## Black Hat

Black hat extracts **dark spots on a bright background** — the difference between the closing and the original.

$$\text{Black Hat} = \text{Close}(\text{image}) - \text{image}$$

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)
```

### Example: Top Hat & Black Hat

```python
import cv2
import numpy as np

img = cv2.imread("uneven_text.png", cv2.IMREAD_GRAYSCALE)

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))

tophat = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)
blackhat = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)

cv2.imshow("Original", img)
cv2.imshow("Top Hat (bright features)", tophat)
cv2.imshow("Black Hat (dark features)", blackhat)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Hit-or-Miss Transform

The hit-or-miss transform is a pattern-matching operation for binary images. It finds pixels where the neighborhood exactly matches a specified pattern.

### Syntax

```python
dst = cv2.morphologyEx(img, cv2.MORPH_HITMISS, kernel)
```

The kernel uses three values:
- `1` — pixel must be foreground (white)
- `-1` — pixel must be background (black)
- `0` — don't care

### Example: Finding Corners

```python
import cv2
import numpy as np

# Create a simple binary image
img = np.array([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 255, 255, 255, 0, 0, 0, 0],
    [0, 255, 255, 255, 0, 0, 0, 0],
    [0, 255, 255, 255, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 255, 255, 0, 0],
    [0, 0, 0, 0, 255, 255, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
], dtype=np.uint8)

# Kernel to find top-left corners
kernel = np.array([
    [-1, -1, -1],
    [-1,  1,  1],
    [-1,  1,  0]
], dtype=np.int8)

result = cv2.morphologyEx(img, cv2.MORPH_HITMISS, kernel)
print("Top-left corners found at:")
print(np.argwhere(result == 255))
```

---

## Practical Application: Noise Removal Pipeline

```python
import cv2
import numpy as np

def clean_binary_image(img_path):
    """Complete noise removal pipeline for binary images."""
    # Load and threshold
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Step 1: Opening removes small white noise
    kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_small)

    # Step 2: Closing fills small holes
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel_small)

    # Step 3: Optional — dilate slightly to strengthen features
    cleaned = cv2.dilate(cleaned, kernel_small, iterations=1)

    return binary, cleaned


original, result = clean_binary_image("scanned_doc.png")
cv2.imshow("Before Cleanup", original)
cv2.imshow("After Cleanup", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Practical Application: Text Preprocessing

```python
import cv2
import numpy as np

def preprocess_text_image(img_path):
    """Prepare scanned text for OCR."""
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

    # Adaptive threshold for uneven lighting
    binary = cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 11, 2
    )

    # Remove small noise with opening
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

    # Thicken characters slightly for better OCR
    kernel_dilate = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thickened = cv2.dilate(cleaned, kernel_dilate, iterations=1)

    return thickened


result = preprocess_text_image("receipt.png")
cv2.imshow("OCR-Ready Text", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Separating Touching Objects

```python
import cv2
import numpy as np

# Load image of touching coins/objects
img = cv2.imread("touching_coins.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

# Erosion separates touching objects
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
eroded = cv2.erode(binary, kernel, iterations=3)

# Now find contours on separated objects
contours, _ = cv2.findContours(eroded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Draw on original
output = img.copy()
cv2.drawContours(output, contours, -1, (0, 255, 0), 2)
print(f"Found {len(contours)} separate objects")

cv2.imshow("Original", img)
cv2.imshow("Separated", eroded)
cv2.imshow("Detected Objects", output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Operations Summary Table

| Operation | Formula | Effect | Use Case |
|-----------|---------|--------|----------|
| **Erosion** | min of neighborhood | Shrinks white | Remove small noise |
| **Dilation** | max of neighborhood | Expands white | Fill small holes |
| **Opening** | Erode → Dilate | Remove white spots | Clean noise |
| **Closing** | Dilate → Erode | Fill black holes | Seal gaps |
| **Gradient** | Dilate − Erode | Edge outline | Object boundaries |
| **Top Hat** | Original − Opening | Bright spots | Uneven illumination |
| **Black Hat** | Closing − Original | Dark spots | Dark defects |
| **Hit-or-Miss** | Pattern match | Find pattern | Template matching |

---

## Tips & Best Practices

- **Kernel size matters:** Larger kernels = stronger effect. Start small (3×3 or 5×5)
- **Iterations vs kernel size:** Multiple iterations of a small kernel ≈ one pass of a larger kernel
- **Order matters:** Opening ≠ Closing. Think about what you want to remove
- **Always threshold first:** Morphology works best on clean binary images
- **Combine operations:** Real pipelines often chain 2–3 morphological steps

---

## Try It Yourself

1. Create a noisy binary image and apply opening to clean it
2. Write text with gaps and use closing to connect the letters
3. Use morphological gradient to extract object outlines
4. Apply top hat to an image with uneven lighting to enhance text
5. Use erosion to separate two touching circles

---

## Summary

- **Morphological operations** process shapes in binary images
- **Erosion** shrinks, **dilation** expands white regions
- **Opening** (erode→dilate) removes noise; **closing** (dilate→erode) fills holes
- **Gradient** gives outlines; **top/black hat** highlight features on uneven backgrounds
- The **structuring element** shape and size control the operation's behavior
- These operations are essential preprocessing steps before contour detection and OCR
