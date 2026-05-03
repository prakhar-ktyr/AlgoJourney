---
title: Color Spaces
---

# Color Spaces

A **color space** is a way to represent colors numerically. Different color spaces organize color information differently, making some better suited for specific tasks than others.

Think of it like languages — the same color can be "described" in RGB, HSV, LAB, or other systems, each with its own strengths.

---

## Why Color Spaces Matter

| Use Case | Best Color Space |
|----------|-----------------|
| Display on screen | RGB (BGR in OpenCV) |
| Color-based detection | HSV |
| Perceptual uniformity | LAB |
| Video compression | YCrCb |
| Simple processing | Grayscale |

---

## RGB (Red, Green, Blue)

RGB is an **additive color model** — it works by adding light. Your monitor uses RGB to display every color you see.

### How It Works

- Each channel ranges from **0 to 255**
- Three channels combine to form a color
- (0, 0, 0) = Black (no light)
- (255, 255, 255) = White (all light)

### Common RGB Values

| Color | R | G | B |
|-------|---|---|---|
| Red | 255 | 0 | 0 |
| Green | 0 | 255 | 0 |
| Blue | 0 | 0 | 255 |
| Yellow | 255 | 255 | 0 |
| Cyan | 0 | 255 | 255 |
| White | 255 | 255 | 255 |

### Important: OpenCV Uses BGR!

OpenCV stores images in **BGR** order by default, not RGB. This is a historical convention that catches many beginners off guard.

```python
import cv2
import numpy as np

# Create a "red" image in OpenCV (BGR format)
# BGR: Blue=0, Green=0, Red=255
red_image = np.zeros((200, 200, 3), dtype=np.uint8)
red_image[:, :, 2] = 255  # Red channel is index 2 in BGR

# If you set index 0 to 255, you get BLUE (not red!)
blue_image = np.zeros((200, 200, 3), dtype=np.uint8)
blue_image[:, :, 0] = 255  # Blue channel is index 0 in BGR

print("BGR format: [Blue, Green, Red]")
print(f"Red pixel in BGR: {red_image[0, 0]}")   # [0, 0, 255]
print(f"Blue pixel in BGR: {blue_image[0, 0]}")  # [255, 0, 0]
```

---

## HSV (Hue, Saturation, Value)

HSV separates **color information** (hue) from **intensity** (value), making it ideal for color-based detection and segmentation.

### Components

| Component | Range (OpenCV) | Meaning |
|-----------|---------------|---------|
| **H** (Hue) | 0–179 | The color type (red, green, blue, etc.) |
| **S** (Saturation) | 0–255 | Color intensity (0 = gray, 255 = vivid) |
| **V** (Value) | 0–255 | Brightness (0 = dark, 255 = bright) |

> **Note:** OpenCV uses H: 0–179 (not 0–360) to fit in a single byte. Multiply by 2 to get standard degrees.

### Why HSV is Great for Color Detection

In RGB, detecting "red" is hard because lighting changes affect all three channels. In HSV, you can isolate hue (the actual color) regardless of brightness.

```python
import cv2
import numpy as np

# Load an image
img = cv2.imread("fruits.jpg")

# Convert BGR to HSV
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Access HSV values of a pixel
h, s, v = hsv[100, 100]
print(f"Hue: {h}, Saturation: {s}, Value: {v}")

# Common hue ranges in OpenCV:
# Red:    0-10 and 170-179
# Orange: 10-25
# Yellow: 25-35
# Green:  35-85
# Blue:   85-130
# Purple: 130-170
```

---

## HSL (Hue, Saturation, Lightness)

HSL is similar to HSV but uses **Lightness** instead of Value.

| Component | Meaning |
|-----------|---------|
| **H** (Hue) | Same as HSV — the color type |
| **S** (Saturation) | Color intensity |
| **L** (Lightness) | 0 = black, 0.5 = pure color, 1 = white |

The key difference: in HSV, maximum V with maximum S gives a vivid color. In HSL, maximum L always gives white.

```python
import cv2

# Convert BGR to HLS (OpenCV calls it HLS, not HSL)
img = cv2.imread("photo.jpg")
hls = cv2.cvtColor(img, cv2.COLOR_BGR2HLS)

# Note: OpenCV channel order is H, L, S (not H, S, L)
h, l, s = hls[100, 100]
print(f"Hue: {h}, Lightness: {l}, Saturation: {s}")
```

---

## LAB (CIELAB)

LAB is designed to be **perceptually uniform** — meaning the mathematical distance between two colors roughly matches how different they *look* to humans.

### Components

| Component | Range | Meaning |
|-----------|-------|---------|
| **L** | 0–100 | Lightness (black to white) |
| **a** | -128 to +127 | Green (−) to Red (+) |
| **b** | -128 to +127 | Blue (−) to Yellow (+) |

### Perceptual Uniformity

In LAB, the Euclidean distance between two colors approximates perceived difference:

$$\Delta E = \sqrt{(L_1 - L_2)^2 + (a_1 - a_2)^2 + (b_1 - b_2)^2}$$

A $\Delta E$ of about 2.3 is the **just noticeable difference** (JND) for humans.

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Convert BGR to LAB
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

# OpenCV LAB ranges: L(0-255), a(0-255), b(0-255)
# (shifted from standard ranges for uint8 storage)
l, a, b = lab[100, 100]
print(f"L: {l}, a: {a}, b: {b}")

# Calculate color difference between two pixels
pixel1 = lab[50, 50].astype(np.float32)
pixel2 = lab[100, 100].astype(np.float32)
delta_e = np.sqrt(np.sum((pixel1 - pixel2) ** 2))
print(f"Color difference (Delta E): {delta_e:.2f}")
```

---

## YCrCb

YCrCb separates **luminance** (brightness) from **chrominance** (color), which is how video compression (JPEG, MPEG) works.

### Components

| Component | Meaning |
|-----------|---------|
| **Y** | Luma (brightness) |
| **Cr** | Red difference chroma |
| **Cb** | Blue difference chroma |

```python
import cv2

img = cv2.imread("photo.jpg")

# Convert to YCrCb
ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)

y, cr, cb = ycrcb[100, 100]
print(f"Y (luma): {y}, Cr: {cr}, Cb: {cb}")

# YCrCb is useful for skin detection
# Skin typically falls in: Cr: 133-173, Cb: 77-127
```

---

## Grayscale Conversion

Grayscale reduces a 3-channel image to a single channel representing brightness.

### The Formula

The standard grayscale conversion weights channels by human perception:

$$Y = 0.299R + 0.587G + 0.114B$$

Green gets the highest weight because human eyes are most sensitive to green light.

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg")

# Method 1: Using cvtColor (recommended)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Method 2: Manual calculation
b, g, r = cv2.split(img)
gray_manual = (0.299 * r + 0.587 * g + 0.114 * b).astype(np.uint8)

# Method 3: Read as grayscale directly
gray_direct = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

print(f"Color shape: {img.shape}")       # (height, width, 3)
print(f"Grayscale shape: {gray.shape}")   # (height, width)
```

---

## Color Space Conversions with cv2.cvtColor()

`cv2.cvtColor()` is your one-stop function for all conversions.

```python
import cv2

img = cv2.imread("photo.jpg")

# BGR to various color spaces
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
hls = cv2.cvtColor(img, cv2.COLOR_BGR2HLS)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Convert back
bgr_from_hsv = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
bgr_from_lab = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

# For Matplotlib display (expects RGB)
import matplotlib.pyplot as plt
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.title("Image in RGB for Matplotlib")
plt.axis("off")
plt.show()
```

### Common Conversion Codes

| From → To | Code |
|-----------|------|
| BGR → Gray | `cv2.COLOR_BGR2GRAY` |
| BGR → HSV | `cv2.COLOR_BGR2HSV` |
| BGR → LAB | `cv2.COLOR_BGR2LAB` |
| BGR → RGB | `cv2.COLOR_BGR2RGB` |
| BGR → YCrCb | `cv2.COLOR_BGR2YCrCb` |
| HSV → BGR | `cv2.COLOR_HSV2BGR` |
| Gray → BGR | `cv2.COLOR_GRAY2BGR` |

---

## Visualizing Individual Channels

Splitting and viewing channels helps understand what each color space captures:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

img = cv2.imread("colorful.jpg")
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Split RGB channels
r, g, b = cv2.split(rgb)

# Split HSV channels
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
h, s, v = cv2.split(hsv)

# Split LAB channels
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l, a, b_ch = cv2.split(lab)

# Display all channels
fig, axes = plt.subplots(3, 3, figsize=(12, 12))

# RGB channels
axes[0, 0].imshow(r, cmap="Reds")
axes[0, 0].set_title("Red Channel")
axes[0, 1].imshow(g, cmap="Greens")
axes[0, 1].set_title("Green Channel")
axes[0, 2].imshow(b, cmap="Blues")
axes[0, 2].set_title("Blue Channel")

# HSV channels
axes[1, 0].imshow(h, cmap="hsv")
axes[1, 0].set_title("Hue")
axes[1, 1].imshow(s, cmap="gray")
axes[1, 1].set_title("Saturation")
axes[1, 2].imshow(v, cmap="gray")
axes[1, 2].set_title("Value")

# LAB channels
axes[2, 0].imshow(l, cmap="gray")
axes[2, 0].set_title("Lightness (L)")
axes[2, 1].imshow(a, cmap="RdYlGn_r")
axes[2, 1].set_title("a (Green-Red)")
axes[2, 2].imshow(b_ch, cmap="YlGnBu_r")
axes[2, 2].set_title("b (Blue-Yellow)")

for ax in axes.flat:
    ax.axis("off")

plt.tight_layout()
plt.show()
```

---

## Practical Example: Detect Blue Objects Using HSV

This is the classic use case for HSV — isolating objects by color:

```python
import cv2
import numpy as np

# Load image
img = cv2.imread("objects.jpg")
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Define range for blue color in HSV
# Blue hue is roughly 100-130 in OpenCV
lower_blue = np.array([100, 50, 50])
upper_blue = np.array([130, 255, 255])

# Create a mask where blue pixels are white
mask = cv2.inRange(hsv, lower_blue, upper_blue)

# Apply mask to original image
blue_objects = cv2.bitwise_and(img, img, mask=mask)

# Display results
cv2.imshow("Original", img)
cv2.imshow("Blue Mask", mask)
cv2.imshow("Blue Objects Only", blue_objects)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Detecting Multiple Colors

```python
import cv2
import numpy as np

img = cv2.imread("traffic.jpg")
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Color ranges dictionary
color_ranges = {
    "red_low": ([0, 50, 50], [10, 255, 255]),
    "red_high": ([170, 50, 50], [179, 255, 255]),
    "green": ([35, 50, 50], [85, 255, 255]),
    "yellow": ([25, 50, 50], [35, 255, 255]),
}

# Detect red (wraps around hue 0)
mask_red1 = cv2.inRange(hsv, np.array(color_ranges["red_low"][0]),
                        np.array(color_ranges["red_low"][1]))
mask_red2 = cv2.inRange(hsv, np.array(color_ranges["red_high"][0]),
                        np.array(color_ranges["red_high"][1]))
mask_red = cv2.bitwise_or(mask_red1, mask_red2)

# Detect green
mask_green = cv2.inRange(hsv, np.array(color_ranges["green"][0]),
                         np.array(color_ranges["green"][1]))

# Count pixels of each color
red_pixels = cv2.countNonZero(mask_red)
green_pixels = cv2.countNonZero(mask_green)

print(f"Red pixels: {red_pixels}")
print(f"Green pixels: {green_pixels}")

if red_pixels > green_pixels:
    print("Traffic light: RED — STOP!")
else:
    print("Traffic light: GREEN — GO!")
```

---

## Color Space Comparison Table

| Color Space | Channels | Best For | Notes |
|-------------|----------|----------|-------|
| **RGB/BGR** | R, G, B | Display, storage | Default in OpenCV (BGR) |
| **HSV** | H, S, V | Color detection | Separates color from brightness |
| **HSL** | H, S, L | Web design, CSS | Similar to HSV |
| **LAB** | L, a, b | Color difference, editing | Perceptually uniform |
| **YCrCb** | Y, Cr, Cb | Video, skin detection | Luma/chroma separation |
| **Grayscale** | Intensity | Edge detection, thresholding | Single channel, fast |

---

## Try It Yourself

```python
import cv2
import numpy as np

# Create a colorful test image
img = np.zeros((300, 300, 3), dtype=np.uint8)
img[0:100, :] = [0, 0, 255]     # Red (BGR)
img[100:200, :] = [0, 255, 0]   # Green (BGR)
img[200:300, :] = [255, 0, 0]   # Blue (BGR)

# Convert and explore
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Check values for the red stripe
print("Red stripe in different color spaces:")
print(f"  BGR:  {img[50, 150]}")
print(f"  HSV:  {hsv[50, 150]}")
print(f"  LAB:  {lab[50, 150]}")
print(f"  Gray: {gray[50, 150]}")

print("\nGreen stripe in different color spaces:")
print(f"  BGR:  {img[150, 150]}")
print(f"  HSV:  {hsv[150, 150]}")
print(f"  LAB:  {lab[150, 150]}")
print(f"  Gray: {gray[150, 150]}")

print("\nBlue stripe in different color spaces:")
print(f"  BGR:  {img[250, 150]}")
print(f"  HSV:  {hsv[250, 150]}")
print(f"  LAB:  {lab[250, 150]}")
print(f"  Gray: {gray[250, 150]}")
```

---

## Key Takeaways

1. **BGR is OpenCV's default** — always remember the channel order
2. **Use HSV for color detection** — it separates hue from brightness
3. **LAB for perceptual tasks** — color difference and editing
4. **`cv2.cvtColor()`** handles all conversions between color spaces
5. **Always convert BGR → RGB** before displaying with Matplotlib
6. **Grayscale** uses a weighted sum: $Y = 0.299R + 0.587G + 0.114B$

---

## Exercises

1. Load a photo and display each HSV channel separately
2. Create a program that detects all red objects in an image
3. Convert an image to LAB and increase the L channel by 50 (brightening)
4. Build a trackbar-based color picker that shows HSV values in real-time
5. Compare grayscale conversion using equal weights vs. the standard formula
