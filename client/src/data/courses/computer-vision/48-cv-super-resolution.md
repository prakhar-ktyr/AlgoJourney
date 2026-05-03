---
title: Image Super-Resolution
---

# Image Super-Resolution

**Super-resolution (SR)** is the task of enhancing a low-resolution image to produce a high-resolution version. Think of it as "zooming in" without losing quality — recovering details that aren't in the original pixels.

---

## Why Super-Resolution?

| Application | Use Case |
|-------------|----------|
| Medical imaging | Enhance MRI/CT scans for better diagnosis |
| Satellite imagery | See finer ground details |
| Old photo restoration | Sharpen vintage photographs |
| Video streaming | Upscale low-bandwidth video |
| Security cameras | Enhance faces from low-res footage |

---

## Classical Upscaling Methods

### Nearest Neighbor

Simply repeats pixels — fast but produces blocky artifacts:

```python
import torch.nn.functional as F

# Upscale 2x using nearest neighbor
lr_image = torch.randn(1, 3, 64, 64)
hr_nearest = F.interpolate(lr_image, scale_factor=2, mode="nearest")
print(f"Nearest: {lr_image.shape} → {hr_nearest.shape}")
# Output: Nearest: torch.Size([1, 3, 64, 64]) → torch.Size([1, 3, 128, 128])
```

### Bilinear Interpolation

Averages 4 neighboring pixels — smoother but blurry:

```python
hr_bilinear = F.interpolate(lr_image, scale_factor=2, mode="bilinear",
                             align_corners=False)
```

### Bicubic Interpolation

Uses 16 neighboring pixels — better quality, still blurs fine details:

```python
hr_bicubic = F.interpolate(lr_image, scale_factor=2, mode="bicubic",
                            align_corners=False)
```

### Comparison

| Method | Quality | Speed | Artifacts |
|--------|---------|-------|-----------|
| Nearest | Poor | Fastest | Blocky/pixelated |
| Bilinear | Fair | Fast | Blurry |
| Bicubic | Good | Fast | Slightly blurry |
| Lanczos | Better | Moderate | Minimal blur, some ringing |

---

## Deep Learning for Super-Resolution

### SRCNN (2014) — The Pioneer

The first deep learning approach to SR. Simple but effective:

```python
import torch
import torch.nn as nn

class SRCNN(nn.Module):
    """Super-Resolution CNN (Dong et al., 2014).

    Three stages:
    1. Patch extraction: extract features from LR image
    2. Non-linear mapping: map to HR feature space
    3. Reconstruction: generate HR image
    """

    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Patch extraction and representation
            nn.Conv2d(3, 64, kernel_size=9, padding=4),
            nn.ReLU(inplace=True),
            # Non-linear mapping
            nn.Conv2d(64, 32, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            # Reconstruction
            nn.Conv2d(32, 3, kernel_size=5, padding=2),
        )

    def forward(self, x):
        # Input: bicubic-upscaled LR image
        return self.net(x)


# Usage: first upscale with bicubic, then refine with SRCNN
model = SRCNN()
lr_upscaled = F.interpolate(lr_image, scale_factor=4, mode="bicubic",
                             align_corners=False)
sr_image = model(lr_upscaled)
print(f"SRCNN output: {sr_image.shape}")
```

> **Note:** SRCNN takes a pre-upscaled image as input. Later methods learn to upscale directly.

---

### ESPCN — Efficient Sub-Pixel Convolution

Instead of upscaling first (expensive), ESPCN processes at low resolution and uses **pixel shuffle** to upscale at the end:

```python
class ESPCN(nn.Module):
    """Efficient Sub-Pixel CNN (Shi et al., 2016).

    Key idea: process at low resolution, use PixelShuffle
    to rearrange channels into spatial dimensions.
    """

    def __init__(self, upscale_factor=4, num_channels=3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(num_channels, 64, 5, padding=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 32, 3, padding=1),
            nn.ReLU(inplace=True),
            # Output channels = num_channels * upscale_factor^2
            nn.Conv2d(32, num_channels * upscale_factor ** 2, 3, padding=1),
            # Rearrange channels into spatial pixels
            nn.PixelShuffle(upscale_factor),
        )

    def forward(self, x):
        return self.net(x)


# ESPCN works directly on LR images (much faster!)
model = ESPCN(upscale_factor=4)
lr_image = torch.randn(1, 3, 64, 64)
sr_image = model(lr_image)
print(f"ESPCN: {lr_image.shape} → {sr_image.shape}")
# Output: ESPCN: torch.Size([1, 3, 64, 64]) → torch.Size([1, 3, 256, 256])
```

### How PixelShuffle Works

`nn.PixelShuffle(r)` rearranges a tensor of shape $(B, C \cdot r^2, H, W)$ into $(B, C, H \cdot r, W \cdot r)$:

```python
# Example: PixelShuffle visualization
x = torch.randn(1, 48, 8, 8)  # 48 = 3 * 4^2
ps = nn.PixelShuffle(upscale_factor=4)
y = ps(x)
print(f"PixelShuffle: {x.shape} → {y.shape}")
# Output: PixelShuffle: torch.Size([1, 48, 8, 8]) → torch.Size([1, 3, 32, 32])
```

---

### SRGAN — Perceptual Quality

SRGAN adds a **discriminator** and **perceptual loss** for more visually pleasing results (less blurry, more details):

```python
class SRResidualBlock(nn.Module):
    def __init__(self, channels=64):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
            nn.PReLU(),
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
        )

    def forward(self, x):
        return x + self.block(x)


class SRGenerator(nn.Module):
    """SRGAN Generator (4x upscaling)."""

    def __init__(self, num_residual_blocks=16):
        super().__init__()
        # Initial feature extraction
        self.initial = nn.Sequential(
            nn.Conv2d(3, 64, 9, padding=4),
            nn.PReLU()
        )

        # Residual blocks
        self.residuals = nn.Sequential(
            *[SRResidualBlock(64) for _ in range(num_residual_blocks)]
        )

        self.post_residual = nn.Sequential(
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64)
        )

        # Upsampling (2x twice = 4x total)
        self.upsample = nn.Sequential(
            nn.Conv2d(64, 256, 3, padding=1),
            nn.PixelShuffle(2),
            nn.PReLU(),
            nn.Conv2d(64, 256, 3, padding=1),
            nn.PixelShuffle(2),
            nn.PReLU(),
        )

        # Final output
        self.final = nn.Conv2d(64, 3, 9, padding=4)

    def forward(self, x):
        initial = self.initial(x)
        residuals = self.post_residual(self.residuals(initial))
        features = initial + residuals
        upscaled = self.upsample(features)
        return torch.tanh(self.final(upscaled))


# Generator produces 4x upscaled images
gen = SRGenerator()
lr = torch.randn(1, 3, 64, 64)
sr = gen(lr)
print(f"SRGAN: {lr.shape} → {sr.shape}")
# Output: SRGAN: torch.Size([1, 3, 64, 64]) → torch.Size([1, 3, 256, 256])
```

---

## Loss Functions for Super-Resolution

### Pixel Loss (L1)

Simple but produces blurry results (averages possible solutions):

$$L_{pixel} = ||I^{SR} - I^{HR}||_1 = \sum_{i,j} |I^{SR}_{i,j} - I^{HR}_{i,j}|$$

### Perceptual Loss (VGG Feature Loss)

Compares high-level features instead of pixels — preserves structure:

```python
class PerceptualLoss(nn.Module):
    """VGG-based perceptual loss."""

    def __init__(self):
        super().__init__()
        vgg = models.vgg19(weights=models.VGG19_Weights.DEFAULT).features[:36]
        self.feature_extractor = vgg.eval()
        for param in self.feature_extractor.parameters():
            param.requires_grad = False

    def forward(self, sr, hr):
        sr_features = self.feature_extractor(sr)
        hr_features = self.feature_extractor(hr)
        return F.l1_loss(sr_features, hr_features)
```

### Combined Loss

$$L_{total} = \lambda_1 L_{pixel} + \lambda_2 L_{perceptual} + \lambda_3 L_{adversarial}$$

Typical weights: $\lambda_1 = 1$, $\lambda_2 = 0.006$, $\lambda_3 = 0.001$

| Loss | Effect |
|------|--------|
| Pixel only | Sharp edges but blurry textures |
| + Perceptual | Better textures, more realistic |
| + Adversarial | Sharpest, but may hallucinate details |

---

## Modern SR Models

### ESRGAN (Enhanced SRGAN)

- Uses **RRDB blocks** (Residual-in-Residual Dense Blocks)
- Removes BatchNorm for better quality
- Relativistic discriminator

### SwinIR (Transformer-based)

- Uses Swin Transformer blocks
- Long-range dependencies via self-attention
- State-of-the-art on benchmarks

### Real-ESRGAN

- Handles **real-world degradation** (not just bicubic downscaling)
- Trained with complex degradation pipeline (blur, noise, JPEG, resize)
- Works well on photos, anime, and general images

---

## Using Real-ESRGAN for Inference

```python
# Using Real-ESRGAN via basicsr library
from basicsr.archs.rrdbnet_arch import RRDBNet
import torch

# Define the model architecture
model = RRDBNet(
    num_in_ch=3,
    num_out_ch=3,
    num_feat=64,
    num_block=23,
    num_grow_ch=32,
    scale=4
)

# Load pretrained weights
weights = torch.load("RealESRGAN_x4plus.pth", map_location="cpu")
model.load_state_dict(weights["params_ema"])
model.eval()

# Inference
with torch.no_grad():
    lr_input = torch.randn(1, 3, 128, 128)  # Low-res input
    sr_output = model(lr_input)
    print(f"Real-ESRGAN: {lr_input.shape} → {sr_output.shape}")
    # Output: Real-ESRGAN: torch.Size([1, 3, 128, 128]) → torch.Size([1, 3, 512, 512])
```

---

## Evaluation Metrics

### PSNR (Peak Signal-to-Noise Ratio)

$$\text{PSNR} = 10 \cdot \log_{10}\left(\frac{MAX^2}{MSE}\right)$$

Higher = better. Typical: 25–35 dB. Simple but doesn't always match visual quality.

### SSIM (Structural Similarity Index)

$$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + c_1)(2\sigma_{xy} + c_2)}{(\mu_x^2 + \mu_y^2 + c_1)(\sigma_x^2 + \sigma_y^2 + c_2)}$$

Measures structural similarity. Range: 0 to 1 (1 = identical). Better than PSNR for perceptual quality.

### LPIPS (Learned Perceptual Image Patch Similarity)

Uses deep features to measure perceptual distance. **Lower = better.** Most aligned with human perception.

```python
# Computing PSNR and SSIM
def compute_psnr(sr, hr, max_val=1.0):
    mse = torch.mean((sr - hr) ** 2)
    if mse == 0:
        return float("inf")
    return 10 * torch.log10(max_val ** 2 / mse)

def compute_ssim(sr, hr):
    """Simplified SSIM computation."""
    c1 = 0.01 ** 2
    c2 = 0.03 ** 2

    mu_sr = F.avg_pool2d(sr, 11, 1, 5)
    mu_hr = F.avg_pool2d(hr, 11, 1, 5)

    sigma_sr = F.avg_pool2d(sr ** 2, 11, 1, 5) - mu_sr ** 2
    sigma_hr = F.avg_pool2d(hr ** 2, 11, 1, 5) - mu_hr ** 2
    sigma_sr_hr = F.avg_pool2d(sr * hr, 11, 1, 5) - mu_sr * mu_hr

    ssim = ((2 * mu_sr * mu_hr + c1) * (2 * sigma_sr_hr + c2)) / \
           ((mu_sr ** 2 + mu_hr ** 2 + c1) * (sigma_sr + sigma_hr + c2))
    return ssim.mean()

# Example
sr = torch.randn(1, 3, 256, 256)
hr = torch.randn(1, 3, 256, 256)
print(f"PSNR: {compute_psnr(sr, hr):.2f} dB")
```

---

## Training an ESPCN

```python
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import torchvision.models as models

class SRDataset(Dataset):
    """Dataset that creates LR-HR pairs from HR images."""

    def __init__(self, hr_images, scale_factor=4, patch_size=96):
        self.hr_images = hr_images
        self.scale = scale_factor
        self.patch_size = patch_size
        self.lr_size = patch_size // scale_factor

    def __len__(self):
        return len(self.hr_images)

    def __getitem__(self, idx):
        hr = self.hr_images[idx]  # High-resolution patch
        # Create LR by downscaling
        lr = F.interpolate(
            hr.unsqueeze(0),
            size=(self.lr_size, self.lr_size),
            mode="bicubic",
            align_corners=False
        ).squeeze(0)
        return lr, hr


# Training loop
def train_espcn(model, dataloader, num_epochs=100):
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.5)

    for epoch in range(num_epochs):
        total_loss = 0
        for lr_batch, hr_batch in dataloader:
            lr_batch = lr_batch.to(device)
            hr_batch = hr_batch.to(device)

            sr_batch = model(lr_batch)
            loss = F.l1_loss(sr_batch, hr_batch)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        scheduler.step()
        avg_loss = total_loss / len(dataloader)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{num_epochs}] | Loss: {avg_loss:.6f}")
```

---

## Applications

| Domain | Application | Scale Factor |
|--------|-------------|-------------|
| Medical | Enhance MRI/CT scans | 2x–4x |
| Satellite | Ground detail from space | 4x–8x |
| Photography | Upscale old/low-res photos | 2x–4x |
| Gaming | Real-time upscaling (DLSS) | 2x–4x |
| Forensics | Enhance security footage | 2x–8x |

---

## Try It Yourself

1. Implement ESPCN and train on a small dataset (e.g., DIV2K)
2. Compare pixel loss vs perceptual loss — which looks better?
3. Try different upscale factors (2x, 4x, 8x) — when does quality drop?
4. Apply Real-ESRGAN to old family photos

---

## Summary

- **Super-resolution** recovers high-resolution details from low-resolution input
- **Classical methods** (bilinear, bicubic) are fast but produce blurry results
- **ESPCN** uses PixelShuffle for efficient learned upscaling
- **SRGAN/ESRGAN** add perceptual and adversarial losses for realistic details
- **Real-ESRGAN** handles real-world degradation beyond simple downscaling
- Use **PSNR/SSIM** for pixel accuracy, **LPIPS** for perceptual quality

Next lesson: **Image Inpainting & Restoration** — filling in missing or damaged regions of an image!
