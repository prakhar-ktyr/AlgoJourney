---
title: Python & OpenCV Setup
---

# Python & OpenCV Setup

Before we start processing images, let's set up our development environment. This lesson covers everything you need to install and configure.

---

## Installing Python

We recommend **Python 3.9 or higher** for this course.

### Check If Python Is Already Installed

```python
# Run in your terminal/command prompt:
# python --version
# or
# python3 --version
```

### Install Python

| Platform | Method |
|----------|--------|
| **Windows** | Download from [python.org](https://python.org) — check "Add to PATH" |
| **macOS** | `brew install python` (via Homebrew) or download from python.org |
| **Linux** | `sudo apt install python3 python3-pip` (Debian/Ubuntu) |

> **Important:** On macOS/Linux, you may need to use `python3` and `pip3` instead of `python` and `pip`.

---

## Creating a Virtual Environment

Always use a virtual environment to keep project dependencies isolated:

```python
# Create a virtual environment
# python -m venv cv-env

# Activate it:
# Windows:   cv-env\Scripts\activate
# macOS/Linux: source cv-env/bin/activate
```

---

## Installing OpenCV

OpenCV has two pip packages:

```python
# Standard OpenCV (most users need this)
# pip install opencv-python

# OpenCV with extra/contrib modules (SIFT, SURF, etc.)
# pip install opencv-contrib-python

# We recommend the contrib version for this course:
# pip install opencv-contrib-python
```

> **Note:** Install only ONE of these — they conflict if both are installed.

---

## Installing Other Essential Packages

```python
# Install all dependencies at once:
# pip install opencv-contrib-python numpy matplotlib pillow scikit-image

# For later deep learning lessons:
# pip install torch torchvision torchaudio

# Complete requirements for this course:
# pip install opencv-contrib-python numpy matplotlib pillow scikit-image scipy
```

### Package Overview

| Package | Purpose | Import As |
|---------|---------|-----------|
| `opencv-contrib-python` | Core CV library | `import cv2` |
| `numpy` | Array operations | `import numpy as np` |
| `matplotlib` | Visualization | `import matplotlib.pyplot as plt` |
| `pillow` | Image I/O | `from PIL import Image` |
| `scikit-image` | Extra algorithms | `import skimage` |
| `scipy` | Scientific computing | `import scipy` |
| `torch` | Deep learning | `import torch` |
| `torchvision` | CV models & datasets | `import torchvision` |

---

## Verify Installation

Run this quick check to confirm everything works:

```python
import sys
import cv2
import numpy as np
import matplotlib

print(f"Python: {sys.version}")
print(f"OpenCV: {cv2.__version__}")
print(f"NumPy: {np.__version__}")
print(f"Matplotlib: {matplotlib.__version__}")

# Quick functional test
img = np.zeros((100, 100, 3), dtype=np.uint8)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)
print("✓ All basic operations working!")
```

---

## OpenCV Basics

### Importing OpenCV

```python
import cv2

# Check version
print(cv2.__version__)  # e.g., "4.9.0"

# OpenCV uses the name "cv2" for historical reasons
# (cv was the old C API, cv2 is the C++ / Python API)
```

### Key OpenCV Modules

OpenCV is organized into modules. Here are the ones we'll use most:

| Module | Purpose | Example Functions |
|--------|---------|-------------------|
| **core** | Basic structures, math | `cv2.add()`, `cv2.subtract()` |
| **imgproc** | Image processing | `cv2.blur()`, `cv2.Canny()` |
| **imgcodecs** | Image I/O | `cv2.imread()`, `cv2.imwrite()` |
| **highgui** | GUI/display | `cv2.imshow()`, `cv2.waitKey()` |
| **video** | Video analysis | `cv2.VideoCapture()` |
| **calib3d** | Camera calibration | `cv2.calibrateCamera()` |
| **features2d** | Feature detection | `cv2.SIFT_create()` |
| **dnn** | Deep neural networks | `cv2.dnn.readNet()` |
| **objdetect** | Object detection | `cv2.CascadeClassifier()` |

```python
import cv2

# Explore available functions in a module
# print(dir(cv2))  # Lists everything in OpenCV

# Common constants
print("BGR2RGB:", cv2.COLOR_BGR2RGB)
print("BGR2GRAY:", cv2.COLOR_BGR2GRAY)
print("Canny threshold type:", cv2.THRESH_BINARY)
```

---

## NumPy for Images

In OpenCV, **images are NumPy arrays**. Understanding NumPy is essential.

### Images as Arrays

```python
import numpy as np
import cv2

# Create a black image (all zeros)
black_image = np.zeros((480, 640, 3), dtype=np.uint8)
print(f"Shape: {black_image.shape}")
# Output: Shape: (480, 640, 3) → (height, width, channels)

# Create a white image (all 255)
white_image = np.ones((480, 640, 3), dtype=np.uint8) * 255

# Create a red image (BGR format in OpenCV!)
red_image = np.zeros((480, 640, 3), dtype=np.uint8)
red_image[:, :, 2] = 255  # Channel 2 = Red in BGR

# Create a grayscale gradient
gradient = np.zeros((256, 256), dtype=np.uint8)
for i in range(256):
    gradient[:, i] = i  # Each column gets increasing brightness

print(f"Gradient shape: {gradient.shape}")
print(f"Gradient dtype: {gradient.dtype}")
print(f"Min value: {gradient.min()}, Max value: {gradient.max()}")
```

### Shape Convention

```python
import numpy as np

# OpenCV shape: (height, width, channels)
# This is DIFFERENT from some other libraries!

image = np.zeros((480, 640, 3), dtype=np.uint8)

height = image.shape[0]  # 480 (rows)
width = image.shape[1]   # 640 (columns)
channels = image.shape[2]  # 3 (BGR)

print(f"Height: {height}")
print(f"Width: {width}")
print(f"Channels: {channels}")
print(f"Total pixels: {height * width}")
print(f"Total values: {image.size}")  # height * width * channels
```

### Data Types

| dtype | Range | Use Case |
|-------|-------|----------|
| `np.uint8` | 0–255 | Standard images |
| `np.uint16` | 0–65535 | Medical/scientific images |
| `np.float32` | 0.0–1.0 | Normalized for math operations |
| `np.float64` | 0.0–1.0 | High-precision calculations |

```python
import numpy as np

# uint8: standard 8-bit images
img_uint8 = np.array([[0, 128, 255]], dtype=np.uint8)
print(f"uint8: {img_uint8}, dtype: {img_uint8.dtype}")

# float32: normalized images (common for deep learning)
img_float = img_uint8.astype(np.float32) / 255.0
print(f"float32: {img_float}, dtype: {img_float.dtype}")

# Convert back
img_back = (img_float * 255).astype(np.uint8)
print(f"Back to uint8: {img_back}")

# CAUTION: overflow with uint8!
a = np.uint8(200)
b = np.uint8(100)
print(f"200 + 100 with uint8 = {a + b}")  # Wraps around! = 44
# Use cv2.add() for safe addition:
print(f"200 + 100 with cv2.add = {cv2.add(np.array([[200]], dtype=np.uint8), np.array([[100]], dtype=np.uint8))[0][0]}")  # Clips at 255
```

---

## Matplotlib for Display

Matplotlib is our primary tool for displaying images in this course (works in scripts, Jupyter, and Colab).

### The BGR vs RGB Problem

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# OpenCV reads images in BGR format
# Matplotlib expects images in RGB format
# This is the #1 source of confusion for beginners!

# Create a test image: should be RED
image_bgr = np.zeros((100, 100, 3), dtype=np.uint8)
image_bgr[:, :, 2] = 255  # Red channel in BGR

# Convert BGR → RGB for correct display
image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

fig, axes = plt.subplots(1, 2, figsize=(8, 3))
axes[0].imshow(image_bgr)
axes[0].set_title("BGR (wrong colors!)")
axes[1].imshow(image_rgb)
axes[1].set_title("RGB (correct!)")
for ax in axes:
    ax.axis("off")
plt.tight_layout()
plt.show()
```

### Display Helper Function

Use this throughout the course for easy visualization:

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

def show_image(image, title="Image", cmap=None):
    """Display an image with proper color conversion."""
    plt.figure(figsize=(8, 6))
    if len(image.shape) == 3:
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        plt.imshow(image, cmap=cmap or "gray")
    plt.title(title)
    plt.axis("off")
    plt.show()

# Usage:
test_img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
show_image(test_img, "Random Noise Image")
```

---

## Jupyter Notebook vs Python Script

```python
# In Jupyter/Colab — images display inline automatically:
import matplotlib.pyplot as plt
plt.imshow(image_rgb)
plt.show()

# In Python scripts — use Matplotlib or OpenCV windows:
plt.savefig("output.png")  # Save to file
# Or:
cv2.imshow("Window", image_bgr)  # Opens GUI window
cv2.waitKey(0)
cv2.destroyAllWindows()
```

> **Tip:** We'll use Matplotlib for display since it works universally (scripts, notebooks, Colab).

---

## Google Colab Setup (Alternative)

If you prefer not to install anything locally, use [Google Colab](https://colab.research.google.com):

```python
# Colab already has OpenCV, NumPy, and Matplotlib installed!
import cv2
import numpy as np
import matplotlib.pyplot as plt

print(f"OpenCV version in Colab: {cv2.__version__}")

# For displaying images in Colab use:
from google.colab.patches import cv2_imshow

# Upload images from your computer:
from google.colab import files
# uploaded = files.upload()

# Or mount Google Drive for dataset access:
# from google.colab import drive
# drive.mount("/content/drive")
```

| Feature | Google Colab | Local Setup |
|---------|-------------|-------------|
| Setup time | None | 10–30 min |
| GPU access | Free (limited) | Need own GPU |
| Persistence | Session-based | Permanent |
| Internet | Required | Offline OK |

---

## Complete Setup Verification Script

Save this as `verify_setup.py` and run it to confirm your environment:

```python
"""
Computer Vision Course - Environment Verification Script
"""
import sys
import importlib

print("=" * 60)
print("  COMPUTER VISION COURSE - SETUP VERIFICATION")
print("=" * 60)

required = {
    "cv2": "opencv-contrib-python",
    "numpy": "numpy",
    "matplotlib": "matplotlib",
    "PIL": "pillow",
}

optional = {
    "torch": "torch",
    "torchvision": "torchvision",
    "skimage": "scikit-image",
}

print(f"\nPython: {sys.version}")
print("-" * 60)

print("\n📦 REQUIRED PACKAGES:")
all_good = True
for module_name, package_name in required.items():
    try:
        mod = importlib.import_module(module_name)
        version = getattr(mod, "__version__", "unknown")
        print(f"  ✓ {package_name:30s} v{version}")
    except ImportError:
        print(f"  ✗ {package_name:30s} NOT INSTALLED")
        all_good = False

print("\n📦 OPTIONAL PACKAGES (for deep learning lessons):")
for module_name, package_name in optional.items():
    try:
        mod = importlib.import_module(module_name)
        version = getattr(mod, "__version__", "unknown")
        print(f"  ✓ {package_name:30s} v{version}")
    except ImportError:
        print(f"  ○ {package_name:30s} not installed (install later)")

print("\n🧪 FUNCTIONAL TESTS:")
try:
    import cv2
    import numpy as np
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    print("  ✓ Create image, color convert, Canny, blur — all working")
    try:
        sift = cv2.SIFT_create()
        print("  ✓ SIFT available (contrib modules)")
    except AttributeError:
        print("  ○ SIFT not available (need opencv-contrib-python)")
except Exception as e:
    print(f"  ✗ Error: {e}")
    all_good = False

print("\n" + "=" * 60)
if all_good:
    print("  ✅ ALL CHECKS PASSED — Ready for the course!")
else:
    print("  ⚠️  Some packages missing — install them above")
print("=" * 60)
```

---

## Common Installation Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'cv2'` | `pip install opencv-contrib-python` |
| Both opencv-python and opencv-contrib installed | `pip uninstall opencv-python opencv-contrib-python` then reinstall only contrib |
| `ImportError: libGL.so.1` (Linux) | `sudo apt install libgl1-mesa-glx` |
| `pip` not found | Use `python -m pip install ...` |
| Wrong Python version | Check `python --version`, use `python3` if needed |
| Permission denied | Use `pip install --user ...` or activate your venv |
| Slow pip install | Use `pip install --upgrade pip` first |
| `cv2.imshow()` crashes in Docker/SSH | Use Matplotlib instead (no GUI needed) |
| M1/M2 Mac issues | Use `pip install --no-cache-dir opencv-contrib-python` |
| Conflicting versions | Delete venv and recreate: `rm -rf cv-env && python -m venv cv-env` |

---

## Recommended Project Structure

```
computer-vision-course/
├── cv-env/              # Virtual environment (don't commit)
├── images/              # Sample images for practice
├── notebooks/           # Jupyter notebooks
├── scripts/             # Python scripts
├── outputs/             # Saved results
├── requirements.txt     # Package list
└── README.md
```

**requirements.txt:**

```
opencv-contrib-python>=4.8
numpy>=1.24
matplotlib>=3.7
pillow>=10.0
scikit-image>=0.21
```

---

## Key Takeaways

1. Use **Python 3.9+** with a **virtual environment**
2. Install **opencv-contrib-python** (not just opencv-python)
3. Images are **NumPy arrays** — understand shape and dtype
4. OpenCV uses **BGR** format; Matplotlib uses **RGB** — always convert
5. Use the **verification script** to confirm your setup
6. When in doubt, use **Google Colab** for zero-setup access

---

## Next Lesson

Your environment is ready! In the next lesson, we'll dive deep into **digital images and pixels** — understanding exactly how images are represented as numbers, and how to manipulate individual pixels.
