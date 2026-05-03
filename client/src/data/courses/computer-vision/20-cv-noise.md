---
title: Noise & Denoising
---

# Noise & Denoising

**Image noise** is unwanted random variation in pixel values that corrupts the true signal. Every real camera produces some noise — understanding noise types and removal techniques is essential for practical computer vision.

---

## What Is Image Noise?

Noise is the difference between what the camera captured and the actual scene:

$$\text{observed image} = \text{true image} + \text{noise}$$

Noise comes from:
- Camera sensor electronics (thermal noise)
- Low-light conditions (photon counting uncertainty)
- Data transmission errors
- Environmental interference

---

## Types of Noise

### 1. Gaussian Noise

The most common type. Each pixel gets a random value added from a normal distribution:

$$n(x,y) \sim \mathcal{N}(\mu, \sigma^2)$$

- **Cause**: sensor electronics, amplifier circuits
- **Appearance**: grainy texture uniformly across the image
- **Parameters**: mean $\mu$ (usually 0) and standard deviation $\sigma$

```python
import cv2
import numpy as np

def add_gaussian_noise(img, mean=0, sigma=25):
    """Add Gaussian noise to an image."""
    noise = np.random.normal(mean, sigma, img.shape).astype(np.float64)
    noisy = img.astype(np.float64) + noise
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return noisy

img = cv2.imread("photo.jpg")
noisy = add_gaussian_noise(img, mean=0, sigma=30)
cv2.imwrite("gaussian_noise.jpg", noisy)
```

### 2. Salt-and-Pepper Noise

Random pixels become either pure white (255) or pure black (0):

- **Cause**: transmission errors, dead pixels, bit errors
- **Appearance**: scattered white and black dots

```python
import cv2
import numpy as np

def add_salt_pepper_noise(img, amount=0.05):
    """Add salt-and-pepper noise to an image."""
    noisy = img.copy()
    h, w = img.shape[:2]
    num_pixels = int(amount * h * w)

    # Salt (white pixels)
    salt_coords = (
        np.random.randint(0, h, num_pixels),
        np.random.randint(0, w, num_pixels)
    )
    noisy[salt_coords] = 255

    # Pepper (black pixels)
    pepper_coords = (
        np.random.randint(0, h, num_pixels),
        np.random.randint(0, w, num_pixels)
    )
    noisy[pepper_coords] = 0

    return noisy

img = cv2.imread("photo.jpg")
noisy = add_salt_pepper_noise(img, amount=0.03)
cv2.imwrite("salt_pepper_noise.jpg", noisy)
```

### 3. Poisson (Shot) Noise

Caused by the random nature of photon arrival at the sensor:

$$n(x,y) \sim \text{Poisson}(\lambda = f(x,y))$$

- **Cause**: photon counting statistics (quantum physics)
- **Appearance**: more noise in brighter areas
- **Special**: signal-dependent (not additive)

```python
import cv2
import numpy as np

def add_poisson_noise(img):
    """Add Poisson noise to an image."""
    # Scale to make noise visible
    img_float = img.astype(np.float64)
    # Poisson expects positive values representing counts
    noisy = np.random.poisson(img_float).astype(np.float64)
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return noisy

img = cv2.imread("photo.jpg")
noisy = add_poisson_noise(img)
cv2.imwrite("poisson_noise.jpg", noisy)
```

### 4. Speckle Noise

**Multiplicative** noise — the noise intensity depends on the pixel value:

$$g(x,y) = f(x,y) + f(x,y) \cdot n(x,y)$$

- **Cause**: coherent imaging (radar, ultrasound, laser)
- **Appearance**: granular texture that's worse in brighter areas

```python
import cv2
import numpy as np

def add_speckle_noise(img, sigma=0.2):
    """Add speckle (multiplicative) noise to an image."""
    img_float = img.astype(np.float64) / 255.0
    noise = np.random.randn(*img.shape) * sigma
    noisy = img_float + img_float * noise
    noisy = np.clip(noisy * 255, 0, 255).astype(np.uint8)
    return noisy

img = cv2.imread("photo.jpg")
noisy = add_speckle_noise(img, sigma=0.3)
cv2.imwrite("speckle_noise.jpg", noisy)
```

---

## Noise Type Comparison

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

img = cv2.imread("photo.jpg")
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Generate all noise types
gaussian = add_gaussian_noise(img, sigma=30)
salt_pepper = add_salt_pepper_noise(img, amount=0.05)
poisson = add_poisson_noise(img)
speckle = add_speckle_noise(img, sigma=0.3)

fig, axes = plt.subplots(1, 5, figsize=(20, 4))
titles = ["Original", "Gaussian", "Salt & Pepper", "Poisson", "Speckle"]
images = [img_rgb,
          cv2.cvtColor(gaussian, cv2.COLOR_BGR2RGB),
          cv2.cvtColor(salt_pepper, cv2.COLOR_BGR2RGB),
          cv2.cvtColor(poisson, cv2.COLOR_BGR2RGB),
          cv2.cvtColor(speckle, cv2.COLOR_BGR2RGB)]

for ax, title, image in zip(axes, titles, images):
    ax.imshow(image)
    ax.set_title(title)
    ax.axis("off")

plt.tight_layout()
plt.show()
```

---

## Signal-to-Noise Ratio (SNR)

Measures how much signal we have relative to noise:

$$\text{SNR} = 10 \log_{10}\left(\frac{P_{\text{signal}}}{P_{\text{noise}}}\right) \text{ dB}$$

Higher SNR = cleaner image. Typical values:
- 40+ dB: excellent quality
- 30–40 dB: good quality
- 20–30 dB: noticeable noise
- <20 dB: very noisy

---

## PSNR (Peak Signal-to-Noise Ratio)

The most common metric for comparing a denoised image to the original:

$$\text{PSNR} = 10 \log_{10}\left(\frac{MAX^2}{MSE}\right)$$

Where $MSE = \frac{1}{MN}\sum_{x,y}(I(x,y) - K(x,y))^2$ and $MAX = 255$ for 8-bit images.

```python
import cv2
import numpy as np

def compute_psnr(original, processed):
    """Compute PSNR between two images."""
    mse = np.mean((original.astype(float) - processed.astype(float)) ** 2)
    if mse == 0:
        return float("inf")  # identical images
    max_pixel = 255.0
    psnr = 10 * np.log10((max_pixel ** 2) / mse)
    return psnr

# OpenCV also provides this:
# psnr = cv2.PSNR(original, processed)

img = cv2.imread("photo.jpg")
noisy = add_gaussian_noise(img, sigma=25)

psnr = compute_psnr(img, noisy)
print(f"PSNR of noisy image: {psnr:.2f} dB")
```

| PSNR (dB) | Quality |
|-----------|---------|
| > 40 | Excellent (almost imperceptible difference) |
| 30–40 | Good |
| 20–30 | Acceptable |
| < 20 | Poor |

---

## SSIM (Structural Similarity Index)

PSNR only measures pixel-level error. **SSIM** evaluates structural similarity — closer to human perception:

$$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + C_1)(2\sigma_{xy} + C_2)}{(\mu_x^2 + \mu_y^2 + C_1)(\sigma_x^2 + \sigma_y^2 + C_2)}$$

Where:
- $\mu_x, \mu_y$ = mean pixel values
- $\sigma_x, \sigma_y$ = standard deviations
- $\sigma_{xy}$ = covariance
- $C_1, C_2$ = stability constants

```python
import cv2
import numpy as np

def compute_ssim(img1, img2):
    """Compute SSIM between two grayscale images."""
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2

    img1 = img1.astype(np.float64)
    img2 = img2.astype(np.float64)

    mu1 = cv2.GaussianBlur(img1, (11, 11), 1.5)
    mu2 = cv2.GaussianBlur(img2, (11, 11), 1.5)

    mu1_sq = mu1 ** 2
    mu2_sq = mu2 ** 2
    mu1_mu2 = mu1 * mu2

    sigma1_sq = cv2.GaussianBlur(img1 ** 2, (11, 11), 1.5) - mu1_sq
    sigma2_sq = cv2.GaussianBlur(img2 ** 2, (11, 11), 1.5) - mu2_sq
    sigma12 = cv2.GaussianBlur(img1 * img2, (11, 11), 1.5) - mu1_mu2

    num = (2 * mu1_mu2 + C1) * (2 * sigma12 + C2)
    den = (mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2)

    ssim_map = num / den
    return ssim_map.mean()

# Usage
gray = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
noisy = add_gaussian_noise(gray, sigma=25)
ssim = compute_ssim(gray, noisy)
print(f"SSIM: {ssim:.4f}")  # 1.0 = identical, 0 = completely different
```

---

## Denoising Methods

### 1. Gaussian Blur

Simple averaging of neighbors. Reduces noise but also blurs edges:

```python
import cv2

img = cv2.imread("noisy.jpg")

# Larger kernel = more smoothing but more blur
denoised_3 = cv2.GaussianBlur(img, (3, 3), 0)
denoised_7 = cv2.GaussianBlur(img, (7, 7), 0)
denoised_15 = cv2.GaussianBlur(img, (15, 15), 0)
```

**Best for**: mild Gaussian noise when some blur is acceptable.

### 2. Median Filter

Replaces each pixel with the **median** of its neighborhood. Excellent for salt-and-pepper noise:

```python
import cv2

img = cv2.imread("salt_pepper_noisy.jpg")

# Median filter — preserves edges much better than Gaussian
denoised_3 = cv2.medianBlur(img, 3)
denoised_5 = cv2.medianBlur(img, 5)
denoised_7 = cv2.medianBlur(img, 7)
```

**Best for**: salt-and-pepper noise. The median is unaffected by extreme outliers.

### 3. Bilateral Filter

Smooths while preserving edges by considering both **spatial** and **intensity** differences:

```python
import cv2

img = cv2.imread("noisy.jpg")

# Parameters: src, d (diameter), sigmaColor, sigmaSpace
denoised = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
```

| Parameter | Effect |
|-----------|--------|
| `d` | Neighborhood diameter (use -1 for auto) |
| `sigmaColor` | Larger = more colors mixed (less edge preservation) |
| `sigmaSpace` | Larger = more distant pixels influence |

**Best for**: Gaussian noise when you need to keep edges sharp.

### 4. Non-Local Means (NLM)

The most effective traditional denoising method. Compares **patches** (not individual pixels) across the image:

```python
import cv2

# Grayscale denoising
gray = cv2.imread("noisy.jpg", cv2.IMREAD_GRAYSCALE)
denoised_gray = cv2.fastNlMeansDenoising(
    gray,
    None,
    h=10,               # Filter strength (higher = more denoising)
    templateWindowSize=7,  # Patch size
    searchWindowSize=21    # Search area
)

# Color denoising
color = cv2.imread("noisy.jpg")
denoised_color = cv2.fastNlMeansDenoisingColored(
    color,
    None,
    h=10,               # Luminance filter strength
    hForColorComponents=10,  # Color filter strength
    templateWindowSize=7,
    searchWindowSize=21
)

cv2.imwrite("nlm_denoised.jpg", denoised_color)
```

**How NLM works:**
1. For each pixel, look at its surrounding patch (e.g., 7×7)
2. Search the neighborhood (e.g., 21×21) for similar patches
3. Average pixels from similar patches (weighted by similarity)
4. Result: noise is averaged out, but repeated structures are preserved

**Best for**: general denoising with best quality/detail trade-off.

### 5. Video Denoising (Temporal)

For video, use temporal information (multiple frames) for better results:

```python
import cv2

cap = cv2.VideoCapture("noisy_video.mp4")

# Read multiple frames
frames = []
for _ in range(5):
    ret, frame = cap.read()
    if ret:
        frames.append(frame)

# Denoise using temporal information
denoised = cv2.fastNlMeansDenoisingColoredMulti(
    frames,
    imgToDenoiseIndex=2,  # Which frame to denoise (middle)
    temporalWindowSize=5,  # Number of frames to use
    h=10,
    hForColorComponents=10,
    templateWindowSize=7,
    searchWindowSize=21
)

cap.release()
```

---

## Comparing Denoising Methods

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Load clean image and add noise
clean = cv2.imread("photo.jpg")
noisy = add_gaussian_noise(clean, sigma=25)

# Apply different denoising methods
gaussian = cv2.GaussianBlur(noisy, (5, 5), 0)
median = cv2.medianBlur(noisy, 5)
bilateral = cv2.bilateralFilter(noisy, 9, 75, 75)
nlm = cv2.fastNlMeansDenoisingColored(noisy, None, 10, 10, 7, 21)

# Compute PSNR for each
methods = {
    "Noisy": noisy,
    "Gaussian": gaussian,
    "Median": median,
    "Bilateral": bilateral,
    "NLM": nlm,
}

print("Denoising Results (PSNR):")
print("-" * 35)
for name, result in methods.items():
    psnr = cv2.PSNR(clean, result)
    print(f"{name:12s}: {psnr:.2f} dB")

# Visualize
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes_flat = axes.flatten()

images = [clean, noisy, gaussian, median, bilateral, nlm]
titles = ["Clean", "Noisy", "Gaussian Blur", "Median", "Bilateral", "NLM"]

for ax, img, title in zip(axes_flat, images, titles):
    ax.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    ax.set_title(title)
    ax.axis("off")

plt.tight_layout()
plt.show()
```

---

## Best Denoising Method per Noise Type

| Noise Type | Best Method | Why |
|-----------|-------------|-----|
| Gaussian | Non-Local Means | Patch comparison averages out random noise |
| Salt & Pepper | Median Filter | Median ignores extreme outlier values |
| Poisson | NLM or Bilateral | Need patch-based for signal-dependent noise |
| Speckle | Bilateral + Log transform | Log converts multiplicative to additive |
| Mixed | NLM (strongest) | Most robust to various noise types |

---

## Denoising with Total Variation

Total Variation denoising minimizes noise while preserving edges by penalizing total gradient:

```python
import cv2
import numpy as np

def tv_denoise_simple(img, weight=0.1, iterations=50):
    """
    Simple Total Variation denoising (ROF model).
    Minimizes: ||u - f||^2 + weight * TV(u)
    """
    u = img.astype(np.float64).copy()

    for _ in range(iterations):
        # Compute gradients
        grad_x = np.roll(u, -1, axis=1) - u
        grad_y = np.roll(u, -1, axis=0) - u

        # Gradient magnitude
        grad_mag = np.sqrt(grad_x**2 + grad_y**2 + 1e-8)

        # Normalized gradients
        nx = grad_x / grad_mag
        ny = grad_y / grad_mag

        # Divergence
        div = (nx - np.roll(nx, 1, axis=1)) + (ny - np.roll(ny, 1, axis=0))

        # Update
        u = u + weight * div
        # Data fidelity
        u = u + 0.1 * (img.astype(np.float64) - u)

    return np.clip(u, 0, 255).astype(np.uint8)

gray = cv2.imread("noisy.jpg", cv2.IMREAD_GRAYSCALE)
denoised = tv_denoise_simple(gray, weight=0.12, iterations=100)
```

---

## Deep Learning Denoising (Brief Overview)

Modern approaches use neural networks trained on millions of image pairs:

| Method | Approach | Key Idea |
|--------|----------|----------|
| DnCNN | Residual learning | Predict noise, subtract from image |
| Noise2Noise | Unsupervised | Train on noisy pairs only (no clean ground truth) |
| FFDNet | Flexible | Takes noise level as input parameter |
| NAFNet | SOTA | Non-linear activation free network |

```python
# Example concept (requires trained model):
import cv2
import numpy as np

# DnCNN-style approach (pseudo-code structure):
# 1. Train a CNN to predict the noise component
# 2. Subtract predicted noise from noisy image

# Using OpenCV's DNN module with a pre-trained model:
# net = cv2.dnn.readNet("dncnn_model.onnx")
# blob = cv2.dnn.blobFromImage(noisy_img, 1.0/255.0)
# net.setInput(blob)
# predicted_noise = net.forward()
# denoised = noisy_img - predicted_noise
```

---

## Practical: Complete Denoising Pipeline

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

def denoise_pipeline(img, noise_type="gaussian"):
    """
    Apply appropriate denoising based on noise type.

    Args:
        img: Noisy image (BGR)
        noise_type: "gaussian", "salt_pepper", "poisson", or "speckle"

    Returns:
        Denoised image
    """
    if noise_type == "salt_pepper":
        # Median filter is best for impulse noise
        denoised = cv2.medianBlur(img, 5)

    elif noise_type == "gaussian":
        # NLM for best quality
        denoised = cv2.fastNlMeansDenoisingColored(
            img, None, h=12, hForColorComponents=12,
            templateWindowSize=7, searchWindowSize=21
        )

    elif noise_type == "poisson":
        # Bilateral preserves edges well for signal-dependent noise
        denoised = cv2.bilateralFilter(img, 9, 75, 75)
        # Follow up with mild NLM
        denoised = cv2.fastNlMeansDenoisingColored(
            denoised, None, h=6, hForColorComponents=6,
            templateWindowSize=7, searchWindowSize=21
        )

    elif noise_type == "speckle":
        # Log transform → denoise → exp (converts multiplicative to additive)
        img_float = img.astype(np.float64) + 1  # avoid log(0)
        log_img = np.log(img_float)
        # Normalize to 0-255 for denoising
        log_norm = cv2.normalize(log_img, None, 0, 255, cv2.NORM_MINMAX)
        log_uint8 = log_norm.astype(np.uint8)
        # Denoise in log domain
        denoised_log = cv2.fastNlMeansDenoisingColored(
            log_uint8, None, h=10, hForColorComponents=10
        )
        # Convert back
        denoised_float = denoised_log.astype(np.float64) / 255.0
        denoised_float = denoised_float * (log_img.max() - log_img.min()) + log_img.min()
        denoised = np.clip(np.exp(denoised_float) - 1, 0, 255).astype(np.uint8)

    else:
        # Default: NLM
        denoised = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    return denoised


# Usage
clean = cv2.imread("photo.jpg")
noisy = add_gaussian_noise(clean, sigma=30)

denoised = denoise_pipeline(noisy, "gaussian")

psnr_noisy = cv2.PSNR(clean, noisy)
psnr_denoised = cv2.PSNR(clean, denoised)

print(f"PSNR (noisy):    {psnr_noisy:.2f} dB")
print(f"PSNR (denoised): {psnr_denoised:.2f} dB")
print(f"Improvement:     {psnr_denoised - psnr_noisy:.2f} dB")
```

---

## Summary

| Topic | Key Concept |
|-------|-------------|
| Gaussian noise | Additive, from electronics: $n \sim \mathcal{N}(0, \sigma^2)$ |
| Salt & pepper | Impulse noise: random black/white pixels |
| Poisson | Signal-dependent, from photon counting |
| Speckle | Multiplicative, from coherent imaging |
| PSNR | Quality metric: higher = better |
| SSIM | Structural similarity: closer to human perception |
| Median filter | Best for salt & pepper noise |
| Bilateral | Edge-preserving smoothing |
| NLM | Best overall traditional denoising |

---

## Exercises

1. Add Gaussian noise with different $\sigma$ values (10, 25, 50) and measure PSNR for each
2. Compare median filter vs Gaussian blur on salt-and-pepper noise — which preserves edges better?
3. Use Non-Local Means with different `h` values and plot PSNR vs filter strength
4. Implement the complete denoising pipeline and test on all noise types
5. Compute both PSNR and SSIM for your denoised results — do they always agree on which is better?
