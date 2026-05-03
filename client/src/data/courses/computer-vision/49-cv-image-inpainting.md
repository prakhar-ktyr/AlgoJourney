---
title: Image Inpainting & Restoration
---

# Image Inpainting & Restoration

**Image inpainting** is the task of filling in missing or damaged regions of an image. Think of it as a smart "content-aware fill" — the algorithm generates plausible content for the masked area based on surrounding context.

---

## Applications

| Use Case | Description |
|----------|-------------|
| Object removal | Erase unwanted objects from photos |
| Photo restoration | Fix scratches, tears, fading in old photos |
| Watermark removal | Remove overlaid text/logos |
| Uncropping | Extend image beyond original boundaries |
| Occlusion removal | Fill in regions hidden by other objects |

---

## Classical Methods with OpenCV

OpenCV provides two built-in inpainting methods:

```python
import cv2
import numpy as np

# Load image and create a mask
image = cv2.imread("damaged_photo.jpg")
# Mask: white (255) = region to fill, black (0) = known region
mask = cv2.imread("mask.png", cv2.IMREAD_GRAYSCALE)

# Method 1: Navier-Stokes based
# Good for small, thin regions (scratches, text)
result_ns = cv2.inpaint(image, mask, inpaintRadius=3,
                         flags=cv2.INPAINT_NS)

# Method 2: Telea (Fast Marching Method)
# Slightly faster, good for small regions
result_telea = cv2.inpaint(image, mask, inpaintRadius=3,
                            flags=cv2.INPAINT_TELEA)

print(f"Input shape: {image.shape}")
print(f"Mask shape: {mask.shape}")
print(f"Result shape: {result_ns.shape}")
```

### How Classical Methods Work

**Navier-Stokes:**
- Treats image intensity as a fluid
- Propagates information from boundaries inward
- Follows isophote (same-intensity) lines

**Telea (Fast Marching):**
- Fills from the boundary inward
- Each pixel is a weighted average of known neighbors
- Weights based on distance and direction

### Limitations

```python
# Classical methods work well for thin scratches
thin_mask = np.zeros((256, 256), dtype=np.uint8)
thin_mask[120:130, 50:200] = 255  # Thin horizontal scratch
# ✓ Good result

# But fail for large missing regions
large_mask = np.zeros((256, 256), dtype=np.uint8)
large_mask[50:200, 50:200] = 255  # Large square hole
# ✗ Blurry, lacks structure
```

---

## Patch-Based Methods

### PatchMatch Algorithm

PatchMatch finds the **most similar patch** in the known region and copies it to fill the hole:

1. For each patch in the hole, find the best matching patch in the known region
2. Copy the best match into the hole
3. Repeat iteratively, growing from the boundary inward

```python
# PatchMatch concept (simplified)
def find_best_patch(image, mask, target_pos, patch_size=7):
    """Find the most similar patch in the known region."""
    half = patch_size // 2
    ty, tx = target_pos
    target_patch = image[ty-half:ty+half+1, tx-half:tx+half+1]

    best_match = None
    best_distance = float("inf")

    # Search known regions
    h, w = image.shape[:2]
    for y in range(half, h - half):
        for x in range(half, w - half):
            # Skip if patch overlaps with mask
            patch_mask = mask[y-half:y+half+1, x-half:x+half+1]
            if patch_mask.any():
                continue

            candidate = image[y-half:y+half+1, x-half:x+half+1]
            distance = np.sum((target_patch.astype(float) -
                              candidate.astype(float)) ** 2)

            if distance < best_distance:
                best_distance = distance
                best_match = (y, x)

    return best_match
```

> **Note:** Real PatchMatch uses randomized search for efficiency — much faster than brute-force.

---

## Deep Learning Inpainting

### Partial Convolutions

Standard convolutions treat all pixels equally. **Partial convolutions** only use valid (non-masked) pixels:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class PartialConv2d(nn.Module):
    """Convolution that handles masked regions properly."""

    def __init__(self, in_channels, out_channels, kernel_size,
                 stride=1, padding=0):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size,
                              stride=stride, padding=padding, bias=False)
        self.bias = nn.Parameter(torch.zeros(out_channels))

        # Weight for mask convolution (all ones)
        self.mask_conv = nn.Conv2d(1, 1, kernel_size, stride=stride,
                                    padding=padding, bias=False)
        nn.init.ones_(self.mask_conv.weight)
        self.mask_conv.weight.requires_grad = False

    def forward(self, x, mask):
        """
        x: input features (B, C, H, W)
        mask: binary mask, 1 = valid, 0 = hole (B, 1, H, W)
        """
        # Apply mask to input
        x_masked = x * mask

        # Standard convolution on masked input
        output = self.conv(x_masked)

        # Count valid pixels in each receptive field
        with torch.no_grad():
            valid_count = self.mask_conv(mask)
            # Normalization factor
            kernel_size = self.conv.kernel_size[0] * self.conv.kernel_size[1]
            scale = kernel_size / (valid_count + 1e-8)
            scale = scale * (valid_count > 0).float()

        # Scale output and add bias
        output = output * scale + self.bias.view(1, -1, 1, 1)

        # Update mask: any position with at least one valid input is now valid
        new_mask = (valid_count > 0).float()

        return output, new_mask
```

### Gated Convolutions

Instead of hard binary masks, **gated convolutions** learn a soft attention mask:

```python
class GatedConv2d(nn.Module):
    """Gated convolution for free-form inpainting."""

    def __init__(self, in_channels, out_channels, kernel_size,
                 stride=1, padding=0):
        super().__init__()
        # Feature convolution
        self.conv_feature = nn.Conv2d(in_channels, out_channels,
                                       kernel_size, stride, padding)
        # Gating convolution
        self.conv_gate = nn.Conv2d(in_channels, out_channels,
                                    kernel_size, stride, padding)

    def forward(self, x):
        features = self.conv_feature(x)
        gates = torch.sigmoid(self.conv_gate(x))
        return features * gates  # Soft gating
```

---

### GAN-Based Inpainting

```python
class InpaintingGenerator(nn.Module):
    """Encoder-decoder generator for image inpainting."""

    def __init__(self):
        super().__init__()
        # Encoder (downsampling)
        self.encoder = nn.Sequential(
            GatedConv2d(4, 64, 5, stride=1, padding=2),  # 4 = RGB + mask
            nn.LeakyReLU(0.2, inplace=True),
            GatedConv2d(64, 128, 3, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            GatedConv2d(128, 256, 3, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            GatedConv2d(256, 512, 3, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
        )

        # Bottleneck with dilated convolutions
        self.bottleneck = nn.Sequential(
            nn.Conv2d(512, 512, 3, padding=2, dilation=2),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 512, 3, padding=4, dilation=4),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 512, 3, padding=8, dilation=8),
            nn.LeakyReLU(0.2, inplace=True),
        )

        # Decoder (upsampling)
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(64, 3, 3, padding=1),
            nn.Tanh()
        )

    def forward(self, image, mask):
        # Concatenate masked image and mask as input
        masked_image = image * (1 - mask)
        x = torch.cat([masked_image, mask], dim=1)
        encoded = self.encoder(x)
        bottleneck = self.bottleneck(encoded)
        output = self.decoder(bottleneck)
        # Composite: keep known pixels, fill the hole
        result = image * (1 - mask) + output * mask
        return result
```

### LaMa (Large Mask Inpainting)

LaMa uses **Fourier convolutions** to capture global structure, making it excellent for filling large holes:

- Fast Fourier Convolution captures repeating patterns
- Works well for regular textures (buildings, floors, fences)
- Handles very large masks (>50% of image)

---

## Stable Diffusion Inpainting

The most powerful inpainting approach today uses diffusion models with text guidance:

```python
from diffusers import StableDiffusionInpaintPipeline
from PIL import Image
import torch

# Load the inpainting pipeline
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16
).to("cuda")

# Load image and mask
image = Image.open("photo.png").resize((512, 512))
mask = Image.open("mask.png").resize((512, 512))
# mask: white = region to fill, black = keep

# Text-guided inpainting
prompt = "a fluffy golden retriever sitting on the grass"
result = pipe(
    prompt=prompt,
    image=image,
    mask_image=mask,
    num_inference_steps=50,
    guidance_scale=7.5
).images[0]

result.save("inpainted_result.png")
print("Inpainting complete!")
```

### Why Diffusion Inpainting Is Powerful

| Feature | Classical | GAN-Based | Diffusion |
|---------|-----------|-----------|-----------|
| Small holes | ✓ Good | ✓ Good | ✓ Good |
| Large holes | ✗ Blurry | ~ Decent | ✓ Excellent |
| Semantic understanding | ✗ None | ~ Limited | ✓ Strong |
| Text guidance | ✗ No | ✗ No | ✓ Yes |
| Quality | Fair | Good | Excellent |

---

## Image Restoration

Beyond inpainting, restoration covers various degradation types:

### Deblurring

Remove motion blur or defocus blur:

```python
class SimpleDeblurNet(nn.Module):
    """Basic U-Net style deblurring network."""

    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 64, 4, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 3, 3, padding=1),
        )

    def forward(self, blurry):
        # Learn the residual (sharp - blurry)
        features = self.encoder(blurry)
        residual = self.decoder(features)
        return blurry + residual  # Add residual to blurry input
```

### Dehazing

Remove haze/fog from outdoor images:

```python
# Atmospheric scattering model:
# I(x) = J(x) * t(x) + A * (1 - t(x))
# where:
#   I = hazy image
#   J = clean image (what we want)
#   t = transmission map (how much light passes through)
#   A = atmospheric light (global illumination)

class DehazeNet(nn.Module):
    """Estimate transmission map for dehazing."""

    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(3, 16, 5, padding=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 16, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 16, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 1, 3, padding=1),
            nn.Sigmoid()  # Transmission in [0, 1]
        )

    def forward(self, hazy):
        transmission = self.net(hazy)
        return transmission
```

### Old Photo Restoration

Combines multiple restoration tasks:

1. **Scratch removal** → inpainting
2. **Color fading** → color correction
3. **Noise reduction** → denoising
4. **Colorization** → grayscale to color (if B&W)
5. **Face enhancement** → super-resolution on faces

```python
def restore_old_photo(image):
    """Pipeline for old photo restoration."""
    # Step 1: Detect and remove scratches
    scratch_mask = detect_scratches(image)
    cleaned = inpaint(image, scratch_mask)

    # Step 2: Denoise
    denoised = denoise_model(cleaned)

    # Step 3: Color correction
    color_corrected = adjust_levels(denoised)

    # Step 4: Enhance faces (if present)
    faces = detect_faces(color_corrected)
    for face_region in faces:
        enhanced_face = face_sr_model(face_region)
        color_corrected = paste_face(color_corrected, enhanced_face)

    # Step 5: Sharpen
    final = sharpen(color_corrected)
    return final
```

---

## Creating Masks for Inpainting

```python
import numpy as np
import cv2

def create_brush_mask(height, width, num_strokes=5):
    """Create a random brush-stroke mask for training."""
    mask = np.zeros((height, width), dtype=np.uint8)

    for _ in range(num_strokes):
        # Random starting point
        start = (np.random.randint(0, height), np.random.randint(0, width))
        # Random brush size
        thickness = np.random.randint(5, 30)
        # Random number of segments
        num_segments = np.random.randint(3, 10)

        points = [start]
        for _ in range(num_segments):
            # Random direction and length
            angle = np.random.uniform(0, 2 * np.pi)
            length = np.random.randint(20, 80)
            new_point = (
                int(points[-1][0] + length * np.sin(angle)),
                int(points[-1][1] + length * np.cos(angle))
            )
            new_point = (
                np.clip(new_point[0], 0, height - 1),
                np.clip(new_point[1], 0, width - 1)
            )
            points.append(new_point)

        # Draw the stroke
        for i in range(len(points) - 1):
            cv2.line(mask, (points[i][1], points[i][0]),
                     (points[i+1][1], points[i+1][0]),
                     color=255, thickness=thickness)

    return mask


# Generate a training mask
mask = create_brush_mask(256, 256, num_strokes=8)
print(f"Mask coverage: {mask.sum() / (255 * mask.size) * 100:.1f}%")
```

---

## Evaluation

| Metric | Measures | Best For |
|--------|----------|----------|
| PSNR | Pixel accuracy | Structural correctness |
| SSIM | Structural similarity | Overall quality |
| FID | Distribution match | Generated region realism |
| LPIPS | Perceptual distance | Visual quality |
| User study | Human preference | Final judgment |

> **Important:** For inpainting, metrics should be computed only on the **masked region**, not the entire image.

---

## Try It Yourself

1. Use OpenCV inpainting to remove text from an image
2. Create different mask shapes — how does size affect quality?
3. Try Stable Diffusion inpainting with different prompts for the same mask
4. Compare classical vs. DL inpainting on large holes

---

## Summary

- **Classical inpainting** (OpenCV) works well for small scratches and thin regions
- **Patch-based methods** copy similar patches from known areas
- **Partial/gated convolutions** handle masks properly in neural networks
- **GAN-based methods** generate realistic content for medium holes
- **Stable Diffusion inpainting** provides state-of-the-art quality with text guidance
- **Image restoration** combines deblurring, dehazing, denoising, and enhancement

Next: **Data Augmentation for CV** — techniques to increase training data diversity!
