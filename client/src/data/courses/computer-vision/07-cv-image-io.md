---
title: Reading & Writing Images
---

# Reading & Writing Images

Before you can process an image, you need to **load** it into memory. After processing, you'll want to **display** or **save** the result. OpenCV provides simple functions for all of these operations.

---

## Reading Images with cv2.imread()

The `cv2.imread()` function loads an image from a file into a NumPy array.

```python
import cv2

# Basic usage
img = cv2.imread("photo.jpg")

# Check the result
print(type(img))    # <class 'numpy.ndarray'>
print(img.shape)    # (height, width, channels)
print(img.dtype)    # uint8
```

### Read Flags

The second argument controls how the image is loaded:

| Flag | Value | Description |
|------|-------|-------------|
| `cv2.IMREAD_COLOR` | 1 | Load as 3-channel BGR (default) |
| `cv2.IMREAD_GRAYSCALE` | 0 | Load as single-channel grayscale |
| `cv2.IMREAD_UNCHANGED` | -1 | Load with alpha channel if present |

```python
import cv2

# Load as color (default)
color_img = cv2.imread("photo.jpg", cv2.IMREAD_COLOR)

# Load as grayscale
gray_img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Load with alpha channel (useful for PNGs with transparency)
alpha_img = cv2.imread("logo.png", cv2.IMREAD_UNCHANGED)

print(f"Color shape: {color_img.shape}")    # (h, w, 3)
print(f"Gray shape: {gray_img.shape}")      # (h, w)
print(f"Alpha shape: {alpha_img.shape}")    # (h, w, 4)
```

### Critical: Always Check for None!

`cv2.imread()` returns `None` if it cannot find or read the file. **It does NOT raise an error!** This is one of the most common bugs for beginners.

```python
import cv2
import sys

img = cv2.imread("nonexistent.jpg")

# BAD: This will crash with a confusing error later
# gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # AttributeError!

# GOOD: Always check first
if img is None:
    print("Error: Could not read image file!")
    sys.exit(1)

print(f"Image loaded successfully: {img.shape}")
```

### Supported File Formats

OpenCV can read many formats: JPEG, PNG, BMP, TIFF, WebP, and more. The format is detected automatically from the file content (not just the extension).

---

## Displaying Images

### Using cv2.imshow()

The simplest way to display an image in a window:

```python
import cv2

img = cv2.imread("photo.jpg")
if img is None:
    raise FileNotFoundError("Image not found!")

# Display the image
cv2.imshow("My Image", img)

# Wait for a key press (0 = wait indefinitely)
cv2.waitKey(0)

# Close all OpenCV windows
cv2.destroyAllWindows()
```

### Understanding cv2.waitKey()

| Argument | Behavior |
|----------|----------|
| `cv2.waitKey(0)` | Wait forever until any key is pressed |
| `cv2.waitKey(1000)` | Wait 1000ms (1 second), then continue |
| `cv2.waitKey(1)` | Wait 1ms — used in video loops |

The function returns the ASCII code of the pressed key, or `-1` if no key was pressed within the timeout.

```python
import cv2

img = cv2.imread("photo.jpg")
cv2.imshow("Press Q to quit", img)

# Wait for 'q' key
while True:
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

cv2.destroyAllWindows()
```

### Using Matplotlib (Better for Jupyter Notebooks)

`cv2.imshow()` doesn't work well in Jupyter notebooks. Use Matplotlib instead:

```python
import cv2
import matplotlib.pyplot as plt

img = cv2.imread("photo.jpg")

# IMPORTANT: Convert BGR to RGB for correct colors!
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

plt.figure(figsize=(10, 6))
plt.imshow(img_rgb)
plt.title("My Photo")
plt.axis("off")
plt.show()
```

### Display Multiple Images Side by Side

```python
import cv2
import matplotlib.pyplot as plt

img = cv2.imread("photo.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].imshow(rgb)
axes[0].set_title("Color")
axes[0].axis("off")

axes[1].imshow(gray, cmap="gray")
axes[1].set_title("Grayscale")
axes[1].axis("off")

plt.tight_layout()
plt.show()
```

---

## Writing Images with cv2.imwrite()

Save processed images to disk:

```python
import cv2

img = cv2.imread("photo.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Save grayscale image
success = cv2.imwrite("photo_gray.jpg", gray)
print(f"Save successful: {success}")  # True or False
```

### JPEG Quality

JPEG uses lossy compression. Control quality with the third argument:

```python
import cv2

img = cv2.imread("photo.jpg")

# High quality (larger file)
cv2.imwrite("high_quality.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 95])

# Low quality (smaller file)
cv2.imwrite("low_quality.jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 20])

# Default is 95
cv2.imwrite("default.jpg", img)
```

| Quality | File Size | Visual Quality |
|---------|-----------|----------------|
| 95–100 | Large | Excellent |
| 75–90 | Medium | Good |
| 30–50 | Small | Acceptable |
| 1–20 | Tiny | Poor (blocky artifacts) |

### PNG Compression

PNG is lossless — compression level only affects file size and save speed, not quality:

```python
import cv2

img = cv2.imread("photo.png")

# Compression 0 = no compression (fast save, large file)
# Compression 9 = maximum compression (slow save, smaller file)
cv2.imwrite("compressed.png", img, [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite("uncompressed.png", img, [cv2.IMWRITE_PNG_COMPRESSION, 0])
```

---

## Working with Video

### Reading Video Files

```python
import cv2

# Open a video file
cap = cv2.VideoCapture("video.mp4")

# Check if opened successfully
if not cap.isOpened():
    print("Error: Cannot open video!")
    exit()

# Get video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

print(f"Resolution: {width}x{height}")
print(f"FPS: {fps}")
print(f"Total frames: {frame_count}")
print(f"Duration: {frame_count / fps:.1f} seconds")

# Read frames one by one
while True:
    ret, frame = cap.read()

    # ret is False when video ends
    if not ret:
        print("End of video")
        break

    # Process each frame here
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    cv2.imshow("Video", gray_frame)

    # Press 'q' to quit early
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Always release the capture
cap.release()
cv2.destroyAllWindows()
```

### Webcam Capture

Use `0` for the default camera, `1` for a second camera, etc.:

```python
import cv2

# Open default webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot access webcam!")
    exit()

# Optional: Set resolution
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

print("Press 'q' to quit, 's' to save a screenshot")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Cannot read frame!")
        break

    # Display the frame
    cv2.imshow("Webcam", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    elif key == ord("s"):
        cv2.imwrite("screenshot.png", frame)
        print("Screenshot saved!")

cap.release()
cv2.destroyAllWindows()
```

### Saving Video with VideoWriter

```python
import cv2

# Open input video
cap = cv2.VideoCapture("input.mp4")
if not cap.isOpened():
    print("Error opening video")
    exit()

# Get properties from input
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

# Define the codec and create VideoWriter
# Common codecs: 'MJPG', 'XVID', 'mp4v', 'H264'
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter("output.mp4", fourcc, fps, (width, height))

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Process frame (example: flip horizontally)
    processed = cv2.flip(frame, 1)

    # Write the processed frame
    out.write(processed)

# Release everything
cap.release()
out.release()
print("Video saved successfully!")
```

### Common Video Codecs

| FourCC Code | Format | Notes |
|-------------|--------|-------|
| `'MJPG'` | Motion JPEG | Large files, widely supported |
| `'XVID'` | MPEG-4 | Good compression, .avi |
| `'mp4v'` | MPEG-4 | Works with .mp4 |
| `'H264'` | H.264 | Best compression (may need extra libs) |

---

## Loading Images from URLs

```python
import cv2
import numpy as np
import urllib.request

def load_image_from_url(url):
    """Download an image from a URL and return as OpenCV array."""
    resp = urllib.request.urlopen(url)
    img_array = np.asarray(bytearray(resp.read()), dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return img

# Usage
url = "https://example.com/sample.jpg"
img = load_image_from_url(url)
if img is not None:
    print(f"Downloaded image: {img.shape}")
```

---

## PIL/Pillow Interoperability

```python
import cv2
import numpy as np
from PIL import Image

# OpenCV to PIL
cv_img = cv2.imread("photo.jpg")
pil_img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))

# PIL to OpenCV
pil_img = Image.open("photo.jpg")
cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
```

---

## Image Metadata

Every image loaded by OpenCV is a NumPy array with useful properties:

```python
import cv2

img = cv2.imread("photo.jpg")
if img is None:
    exit("Image not found!")

# Shape: (height, width, channels)
print(f"Shape: {img.shape}")
print(f"Height: {img.shape[0]} pixels")
print(f"Width: {img.shape[1]} pixels")
print(f"Channels: {img.shape[2]}")

# Data type
print(f"Dtype: {img.dtype}")  # uint8 (0-255)

# Total pixels
print(f"Total pixels: {img.size}")  # height * width * channels

# Memory size
print(f"Memory: {img.nbytes / 1024:.1f} KB")

# For grayscale images
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
print(f"\nGrayscale shape: {gray.shape}")  # (height, width) - no channel dim
print(f"Grayscale memory: {gray.nbytes / 1024:.1f} KB")
```

---

## Complete Read/Display/Save Pipeline

```python
import cv2
import sys

def process_image(input_path, output_path):
    """Complete pipeline: read, process, display, save."""

    # Step 1: Read
    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: Cannot read '{input_path}'")
        sys.exit(1)

    print(f"Loaded: {input_path}")
    print(f"  Size: {img.shape[1]}x{img.shape[0]}")
    print(f"  Channels: {img.shape[2]}")

    # Step 2: Process (example: convert to grayscale + resize)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (640, 480))

    # Step 3: Display
    cv2.imshow("Original", img)
    cv2.imshow("Processed", resized)
    print("\nPress any key to save and exit...")
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Step 4: Save
    success = cv2.imwrite(output_path, resized)
    if success:
        print(f"Saved: {output_path}")
    else:
        print(f"Error: Could not save to '{output_path}'")

# Run the pipeline
process_image("input.jpg", "output.jpg")
```

---

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| BGR vs RGB | Colors look wrong in Matplotlib | Use `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)` |
| No None check | Crash with `NoneType` error | Always check `if img is None` |
| Missing waitKey | Window appears blank/frozen | Add `cv2.waitKey(0)` after `imshow` |
| Wrong path | `imread` returns None silently | Use absolute paths or verify with `os.path.exists()` |
| Video not releasing | File locked, resources wasted | Always call `cap.release()` in a finally block |
| Large video files | Codec choice matters | Use 'XVID' or 'mp4v' for better compression |

---

## Key Takeaways

1. **`cv2.imread()`** returns None on failure — always check!
2. **`cv2.imshow()`** needs `cv2.waitKey()` to actually display
3. **Convert BGR → RGB** when using Matplotlib
4. **JPEG quality** trades file size for visual quality
5. **`cv2.VideoCapture()`** works with files and webcams
6. **Always release** captures and writers when done
7. **Use `cv2.IMREAD_UNCHANGED`** to preserve alpha channels

---

## Exercises

1. Write a program that loads an image, displays it, and saves it as both JPEG (quality 50) and PNG
2. Create a webcam app that saves a frame every 5 seconds
3. Build a video player with pause/resume functionality using waitKey
4. Load an image from a URL and display it alongside its grayscale version
5. Write a function that compares file sizes of the same image saved at different JPEG quality levels
