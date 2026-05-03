---
title: Frequency Domain & Fourier Transform
---

# Frequency Domain & Fourier Transform

In this lesson you will learn how to analyze and filter images in the **frequency domain** using the Fourier Transform. This powerful mathematical tool decomposes an image into its constituent frequencies — revealing patterns invisible in the spatial domain.

---

## Spatial vs Frequency Domain

| Domain | Representation | Describes |
|--------|---------------|-----------|
| Spatial | Pixel values at $(x, y)$ positions | What the image looks like |
| Frequency | Amplitude and phase of sinusoidal components | How fast pixel values change |

- **Low frequencies** → smooth, slowly-varying regions (sky, walls)
- **High frequencies** → rapid changes (edges, textures, noise)

Think of it like music: the spatial domain is the sound wave, and the frequency domain is the spectrum showing which notes (frequencies) are present.

---

## The Fourier Transform

The 2D Discrete Fourier Transform (DFT) decomposes an image $f(x,y)$ into complex sinusoids:

$$F(u,v) = \sum_{x=0}^{M-1}\sum_{y=0}^{N-1} f(x,y) \cdot e^{-j2\pi(ux/M + vy/N)}$$

Where:
- $f(x,y)$ = pixel value at position $(x,y)$
- $F(u,v)$ = complex frequency component at frequency $(u,v)$
- $M, N$ = image dimensions
- $j = \sqrt{-1}$ (imaginary unit)

Each $F(u,v)$ is a complex number with:
- **Magnitude** $|F(u,v)|$ = strength of that frequency
- **Phase** $\angle F(u,v)$ = position/shift of that frequency pattern

---

## DFT with NumPy

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

# Load grayscale image
img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
print(f"Image size: {img.shape}")

# Compute 2D DFT
dft = np.fft.fft2(img)
print(f"DFT shape: {dft.shape}")
print(f"DFT dtype: {dft.dtype}")  # complex128

# Shift zero-frequency to center
dft_shift = np.fft.fftshift(dft)

# Compute magnitude spectrum (log scale for visibility)
magnitude = 20 * np.log(np.abs(dft_shift) + 1)

# Compute phase spectrum
phase = np.angle(dft_shift)

# Display
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Original Image")
axes[1].imshow(magnitude, cmap="gray")
axes[1].set_title("Magnitude Spectrum")
axes[2].imshow(phase, cmap="gray")
axes[2].set_title("Phase Spectrum")
plt.tight_layout()
plt.show()
```

### Understanding the Spectrum

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)
magnitude = 20 * np.log(np.abs(dft_shift) + 1)

h, w = magnitude.shape
center = (w // 2, h // 2)

print("Reading the magnitude spectrum:")
print(f"  Center pixel (DC component): {magnitude[center[1], center[0]]:.1f}")
print(f"  = average brightness of the image")
print(f"  Points near center = low frequencies (smooth areas)")
print(f"  Points far from center = high frequencies (edges/detail)")
```

---

## DFT with OpenCV

OpenCV's DFT is optimized for speed — especially for images with dimensions that are powers of 2:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Optimal DFT size (pad to power of 2 for speed)
rows, cols = img.shape
optimal_rows = cv2.getOptimalDFTSize(rows)
optimal_cols = cv2.getOptimalDFTSize(cols)

# Pad image to optimal size
padded = np.zeros((optimal_rows, optimal_cols), dtype=np.float32)
padded[:rows, :cols] = img
print(f"Original: {rows}x{cols} → Padded: {optimal_rows}x{optimal_cols}")

# Compute DFT (OpenCV needs float32 input)
dft = cv2.dft(padded, flags=cv2.DFT_COMPLEX_OUTPUT)
print(f"DFT shape: {dft.shape}")  # (rows, cols, 2) — real and imaginary

# Shift and compute magnitude
dft_shift = np.fft.fftshift(dft, axes=(0, 1))
magnitude = cv2.magnitude(dft_shift[:, :, 0], dft_shift[:, :, 1])
magnitude_log = 20 * np.log(magnitude + 1)

# Normalize for display
cv2.normalize(magnitude_log, magnitude_log, 0, 255, cv2.NORM_MINMAX)
magnitude_display = magnitude_log.astype(np.uint8)

plt.figure(figsize=(10, 5))
plt.subplot(121), plt.imshow(img, cmap="gray"), plt.title("Original")
plt.subplot(122), plt.imshow(magnitude_display, cmap="gray"), plt.title("Magnitude (OpenCV DFT)")
plt.show()
```

---

## Frequency Domain Filtering

The key insight: **multiplication in frequency domain = convolution in spatial domain**. This means we can filter by:

1. Transform to frequency domain (DFT)
2. Multiply by a filter mask
3. Transform back (Inverse DFT)

### Low-Pass Filter (Blur)

Removes high frequencies — keeps only smooth, slowly-varying content:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
rows, cols = img.shape

# Compute DFT
dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)

# Create circular low-pass filter mask
center_row, center_col = rows // 2, cols // 2
radius = 30  # Cutoff frequency (pixels from center)

# Create meshgrid for distance calculation
Y, X = np.ogrid[:rows, :cols]
distance = np.sqrt((X - center_col) ** 2 + (Y - center_row) ** 2)

# Binary mask: 1 inside radius, 0 outside
mask_lp = (distance <= radius).astype(np.float64)

# Apply filter
filtered = dft_shift * mask_lp

# Inverse DFT
f_ishift = np.fft.ifftshift(filtered)
img_filtered = np.fft.ifft2(f_ishift)
img_filtered = np.abs(img_filtered).astype(np.uint8)

# Display
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Original")
axes[1].imshow(mask_lp, cmap="gray")
axes[1].set_title(f"Low-Pass Mask (r={radius})")
axes[2].imshow(img_filtered, cmap="gray")
axes[2].set_title("Low-Pass Filtered (Blurred)")
plt.tight_layout()
plt.show()
```

### High-Pass Filter (Edge Enhancement)

Removes low frequencies — keeps only edges and fine details:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
rows, cols = img.shape

# Compute DFT
dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)

# Create high-pass filter (inverse of low-pass)
center_row, center_col = rows // 2, cols // 2
radius = 30

Y, X = np.ogrid[:rows, :cols]
distance = np.sqrt((X - center_col) ** 2 + (Y - center_row) ** 2)
mask_hp = (distance > radius).astype(np.float64)

# Apply filter
filtered = dft_shift * mask_hp

# Inverse DFT
f_ishift = np.fft.ifftshift(filtered)
img_filtered = np.fft.ifft2(f_ishift)
img_filtered = np.abs(img_filtered)

# Normalize for display
img_filtered = cv2.normalize(img_filtered, None, 0, 255,
                              cv2.NORM_MINMAX).astype(np.uint8)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Original")
axes[1].imshow(mask_hp, cmap="gray")
axes[1].set_title(f"High-Pass Mask (r={radius})")
axes[2].imshow(img_filtered, cmap="gray")
axes[2].set_title("High-Pass Filtered (Edges)")
plt.tight_layout()
plt.show()
```

### Gaussian Filters (Smooth Cutoff)

Binary masks cause ringing artifacts. Gaussian masks provide a smooth transition:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
rows, cols = img.shape

# Compute DFT
dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)

# Gaussian low-pass filter
center_row, center_col = rows // 2, cols // 2
sigma = 30  # Controls cutoff smoothness

Y, X = np.ogrid[:rows, :cols]
distance_sq = (X - center_col) ** 2 + (Y - center_row) ** 2
gaussian_lp = np.exp(-distance_sq / (2 * sigma ** 2))

# Gaussian high-pass = 1 - Gaussian low-pass
gaussian_hp = 1 - gaussian_lp

# Apply both filters
lp_result = np.abs(np.fft.ifft2(np.fft.ifftshift(dft_shift * gaussian_lp)))
hp_result = np.abs(np.fft.ifft2(np.fft.ifftshift(dft_shift * gaussian_hp)))

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes[0, 0].imshow(img, cmap="gray")
axes[0, 0].set_title("Original")
axes[0, 1].imshow(gaussian_lp, cmap="gray")
axes[0, 1].set_title(f"Gaussian LP (σ={sigma})")
axes[0, 2].imshow(lp_result, cmap="gray")
axes[0, 2].set_title("LP Result (Smooth)")

axes[1, 0].imshow(img, cmap="gray")
axes[1, 0].set_title("Original")
axes[1, 1].imshow(gaussian_hp, cmap="gray")
axes[1, 1].set_title(f"Gaussian HP (σ={sigma})")
axes[1, 2].imshow(hp_result, cmap="gray")
axes[1, 2].set_title("HP Result (Edges)")
plt.tight_layout()
plt.show()
```

---

## Band-Pass Filter

Keep only a range of frequencies:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
rows, cols = img.shape

dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)

# Band-pass: keep frequencies between r_inner and r_outer
center_row, center_col = rows // 2, cols // 2
r_inner = 20
r_outer = 60

Y, X = np.ogrid[:rows, :cols]
distance = np.sqrt((X - center_col) ** 2 + (Y - center_row) ** 2)
mask_bp = ((distance >= r_inner) & (distance <= r_outer)).astype(np.float64)

# Apply
filtered = dft_shift * mask_bp
result = np.abs(np.fft.ifft2(np.fft.ifftshift(filtered)))
result = cv2.normalize(result, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap="gray")
axes[0].set_title("Original")
axes[1].imshow(mask_bp, cmap="gray")
axes[1].set_title(f"Band-Pass ({r_inner}-{r_outer})")
axes[2].imshow(result, cmap="gray")
axes[2].set_title("Band-Pass Result")
plt.tight_layout()
plt.show()
```

---

## Inverse DFT

Convert frequency domain representation back to a spatial image:

```python
import cv2
import numpy as np

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)

# Forward DFT
dft = np.fft.fft2(img)

# Inverse DFT (should recover original)
recovered = np.fft.ifft2(dft)
recovered = np.abs(recovered).astype(np.uint8)

# Verify recovery
diff = np.abs(img.astype(np.float64) - recovered.astype(np.float64))
print(f"Max difference after DFT → IDFT: {diff.max()}")
print(f"Mean difference: {diff.mean():.6f}")
print(f"Perfect recovery: {np.allclose(img, recovered, atol=1)}")
```

---

## Practical: Remove Periodic Noise (Notch Filter)

Images with periodic noise show distinct peaks in the frequency spectrum. We can remove them with a notch filter:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

def add_periodic_noise(img, frequency=40, amplitude=50):
    """Add sinusoidal noise to an image for demonstration."""
    rows, cols = img.shape
    x = np.arange(cols)
    y = np.arange(rows)
    X, Y = np.meshgrid(x, y)

    noise = amplitude * np.sin(2 * np.pi * frequency * Y / rows)
    noisy = np.clip(img.astype(np.float64) + noise, 0, 255).astype(np.uint8)
    return noisy


def remove_periodic_noise(img, notch_radius=10):
    """Remove periodic noise using a notch filter in frequency domain."""
    rows, cols = img.shape

    # DFT
    dft = np.fft.fft2(img.astype(np.float64))
    dft_shift = np.fft.fftshift(dft)
    magnitude = 20 * np.log(np.abs(dft_shift) + 1)

    # Find peaks (excluding DC component)
    center_row, center_col = rows // 2, cols // 2
    mag_copy = magnitude.copy()
    # Zero out center region to ignore DC
    cv2.circle(mag_copy, (center_col, center_row), 20, 0, -1)

    # Find the brightest peak (noise frequency)
    _, max_val, _, max_loc = cv2.minMaxLoc(mag_copy.astype(np.float32))
    peak_col, peak_row = max_loc
    print(f"Noise peak at: ({peak_col}, {peak_row}), magnitude: {max_val:.1f}")

    # Create notch filter (remove the noise peaks)
    mask = np.ones((rows, cols), dtype=np.float64)

    # Remove the peak and its symmetric counterpart
    Y, X = np.ogrid[:rows, :cols]
    d1 = np.sqrt((X - peak_col) ** 2 + (Y - peak_row) ** 2)
    d2 = np.sqrt((X - (cols - peak_col)) ** 2 + (Y - (rows - peak_row)) ** 2)
    mask[(d1 <= notch_radius) | (d2 <= notch_radius)] = 0

    # Apply notch filter
    filtered = dft_shift * mask
    result = np.abs(np.fft.ifft2(np.fft.ifftshift(filtered)))
    result = np.clip(result, 0, 255).astype(np.uint8)

    return result, mask, magnitude


# Demo
img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
noisy = add_periodic_noise(img, frequency=40, amplitude=50)
cleaned, notch_mask, spectrum = remove_periodic_noise(noisy)

fig, axes = plt.subplots(2, 2, figsize=(12, 12))
axes[0, 0].imshow(img, cmap="gray")
axes[0, 0].set_title("Original")
axes[0, 1].imshow(noisy, cmap="gray")
axes[0, 1].set_title("With Periodic Noise")
axes[1, 0].imshow(notch_mask, cmap="gray")
axes[1, 0].set_title("Notch Filter Mask")
axes[1, 1].imshow(cleaned, cmap="gray")
axes[1, 1].set_title("Noise Removed")
plt.tight_layout()
plt.show()
```

---

## Image Compression Preview

Discarding high-frequency components reduces data while keeping the visual structure:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
rows, cols = img.shape

dft = np.fft.fft2(img)
dft_shift = np.fft.fftshift(dft)

# Keep different percentages of frequencies
keep_percentages = [5, 10, 25, 50, 75, 100]
center_row, center_col = rows // 2, cols // 2
max_radius = np.sqrt(center_row ** 2 + center_col ** 2)

fig, axes = plt.subplots(2, 3, figsize=(15, 10))

for idx, pct in enumerate(keep_percentages):
    radius = int(max_radius * pct / 100)

    # Create circular mask
    Y, X = np.ogrid[:rows, :cols]
    distance = np.sqrt((X - center_col) ** 2 + (Y - center_row) ** 2)
    mask = (distance <= radius).astype(np.float64)

    # Filter and reconstruct
    filtered = dft_shift * mask
    result = np.abs(np.fft.ifft2(np.fft.ifftshift(filtered)))
    result = np.clip(result, 0, 255).astype(np.uint8)

    # Compute compression ratio
    total_coeffs = rows * cols
    kept_coeffs = mask.sum()
    ratio = total_coeffs / max(kept_coeffs, 1)

    row, col = idx // 3, idx % 3
    axes[row, col].imshow(result, cmap="gray")
    axes[row, col].set_title(f"{pct}% freq (ratio: {ratio:.1f}:1)")
    axes[row, col].axis("off")

plt.suptitle("Frequency-Based Compression", fontsize=14)
plt.tight_layout()
plt.show()
```

---

## Phase vs Magnitude Importance

A fascinating experiment — phase carries more structural information than magnitude:

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img1 = cv2.imread("photo1.jpg", cv2.IMREAD_GRAYSCALE).astype(np.float64)
img2 = cv2.imread("photo2.jpg", cv2.IMREAD_GRAYSCALE).astype(np.float64)

# Resize to same dimensions
h = min(img1.shape[0], img2.shape[0])
w = min(img1.shape[1], img2.shape[1])
img1 = cv2.resize(img1, (w, h))
img2 = cv2.resize(img2, (w, h))

# Compute DFTs
dft1 = np.fft.fft2(img1)
dft2 = np.fft.fft2(img2)

# Swap magnitude and phase
magnitude1 = np.abs(dft1)
phase1 = np.angle(dft1)
magnitude2 = np.abs(dft2)
phase2 = np.angle(dft2)

# Combine: magnitude of img1 + phase of img2
combined_1 = magnitude1 * np.exp(1j * phase2)
result_1 = np.abs(np.fft.ifft2(combined_1))

# Combine: magnitude of img2 + phase of img1
combined_2 = magnitude2 * np.exp(1j * phase1)
result_2 = np.abs(np.fft.ifft2(combined_2))

fig, axes = plt.subplots(2, 2, figsize=(12, 12))
axes[0, 0].imshow(img1, cmap="gray")
axes[0, 0].set_title("Image 1")
axes[0, 1].imshow(img2, cmap="gray")
axes[0, 1].set_title("Image 2")
axes[1, 0].imshow(result_1, cmap="gray")
axes[1, 0].set_title("Mag(1) + Phase(2)\n→ Looks like Image 2!")
axes[1, 1].imshow(result_2, cmap="gray")
axes[1, 1].set_title("Mag(2) + Phase(1)\n→ Looks like Image 1!")
plt.suptitle("Phase carries more structural information", fontsize=14)
plt.tight_layout()
plt.show()
```

---

## Summary

| Concept | Description |
|---------|-------------|
| DFT | Decomposes image into frequency components |
| Magnitude spectrum | Strength of each frequency |
| Phase spectrum | Position/structure information |
| Low-pass filter | Blur (remove high freq) |
| High-pass filter | Edge detection (remove low freq) |
| Band-pass filter | Keep specific frequency range |
| Notch filter | Remove specific frequencies (periodic noise) |
| Inverse DFT | Convert back to spatial domain |

**Key takeaways:**
- The Fourier Transform reveals the frequency content of images
- Low frequencies = smooth areas, high frequencies = edges and detail
- Filtering in frequency domain = multiplication (fast for large kernels)
- Phase carries more structural info than magnitude
- Notch filters can surgically remove periodic noise
- Frequency analysis is the foundation of image compression (JPEG)

---

## Exercises

1. Compute and display the magnitude spectrum of different images (text, face, landscape). Compare the patterns.
2. Implement a Butterworth low-pass filter (smoother than ideal, less ringing than binary).
3. Add periodic noise at two different frequencies and design a notch filter to remove both.
4. Experiment: keep only the phase (set all magnitudes to 1) and reconstruct. What do you see?
