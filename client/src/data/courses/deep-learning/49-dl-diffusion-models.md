---
title: Diffusion Models
---

# Diffusion Models

**Diffusion models** are a class of generative models that learn to generate data by reversing a gradual noising process. They have surpassed GANs in image quality and now power systems like DALL-E, Stable Diffusion, and Midjourney.

---

## The Core Idea

Diffusion models work in two phases:

1. **Forward process (diffusion):** Gradually add noise to data until it becomes pure Gaussian noise
2. **Reverse process (denoising):** Learn to remove noise step by step, recovering the original data

```
Forward (fixed):
  Clean Image → Slightly Noisy → More Noisy → ... → Pure Noise

Reverse (learned):
  Pure Noise → Less Noisy → Less Noisy → ... → Clean Image
```

Think of it like dissolving a sugar cube in water (forward) and then learning to un-dissolve it (reverse).

---

## Forward Process (Adding Noise)

The forward process adds Gaussian noise over $T$ timesteps:

$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t} \cdot x_{t-1}, \beta_t \mathbf{I})$$

Where:
- $x_0$ is the original clean data
- $x_t$ is the noisy version at step $t$
- $\beta_t$ is the noise schedule (small values, e.g., 0.0001 to 0.02)
- $T$ is typically 1000 steps

### Direct Sampling at Any Timestep

We can jump directly to any timestep $t$ without iterating:

$$q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} \cdot x_0, (1 - \bar{\alpha}_t) \mathbf{I})$$

Where:
- $\alpha_t = 1 - \beta_t$
- $\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$ (cumulative product)

This means: $x_t = \sqrt{\bar{\alpha}_t} \cdot x_0 + \sqrt{1 - \bar{\alpha}_t} \cdot \epsilon$, where $\epsilon \sim \mathcal{N}(0, \mathbf{I})$

---

## Noise Schedule

The noise schedule $\{\beta_1, \beta_2, ..., \beta_T\}$ controls how quickly noise is added:

| Schedule Type | Description |
|--------------|-------------|
| Linear | $\beta$ increases linearly from $\beta_1$ to $\beta_T$ |
| Cosine | Smoother noise addition, better for small images |
| Learned | Optimized during training |

```python
import torch
import numpy as np

def linear_schedule(timesteps, beta_start=1e-4, beta_end=0.02):
    """Linear noise schedule."""
    return torch.linspace(beta_start, beta_end, timesteps)

def cosine_schedule(timesteps, s=0.008):
    """Cosine noise schedule (improved DDPM)."""
    steps = timesteps + 1
    x = torch.linspace(0, timesteps, steps)
    alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * np.pi * 0.5) ** 2
    alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
    betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
    return torch.clamp(betas, 0.0001, 0.9999)
```

---

## Reverse Process (Denoising)

The reverse process learns to denoise — go from $x_t$ back to $x_{t-1}$:

$$p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \sigma_t^2 \mathbf{I})$$

A neural network (typically a U-Net) predicts the parameters of this distribution.

### What Does the Network Predict?

Three equivalent formulations:

| Predict | Description |
|---------|-------------|
| $\mu_\theta(x_t, t)$ | Directly predict the mean |
| $\epsilon_\theta(x_t, t)$ | Predict the noise (most common) |
| $x_0$ | Predict the clean image |

The noise prediction approach is most popular because it simplifies the loss function.

---

## Training Objective

The training loss is surprisingly simple — just predict the noise:

$$L = \mathbb{E}_{t, x_0, \epsilon}\left[\|\epsilon - \epsilon_\theta(x_t, t)\|^2\right]$$

### Training Algorithm

```
1. Sample a clean image x_0 from the dataset
2. Sample a random timestep t ~ Uniform(1, T)
3. Sample noise ε ~ N(0, I)
4. Create noisy image: x_t = √(ᾱ_t) * x_0 + √(1-ᾱ_t) * ε
5. Predict noise: ε̂ = model(x_t, t)
6. Compute loss: L = MSE(ε, ε̂)
7. Update model parameters
```

---

## DDPM: Denoising Diffusion Probabilistic Models

DDPM (Ho et al., 2020) is the foundational diffusion model paper.

### Sampling (Generation)

```
1. Start with pure noise: x_T ~ N(0, I)
2. For t = T, T-1, ..., 1:
   a. Predict noise: ε̂ = model(x_t, t)
   b. Compute mean: μ = (1/√α_t) * (x_t - (β_t/√(1-ᾱ_t)) * ε̂)
   c. Sample: x_{t-1} = μ + σ_t * z,  where z ~ N(0, I)
3. Return x_0
```

---

## Code: Simple DDPM for MNIST

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import math

# Hyperparameters
image_size = 28
channels = 1
timesteps = 1000
batch_size = 64
lr = 2e-4
epochs = 50

# Noise schedule
betas = torch.linspace(1e-4, 0.02, timesteps)
alphas = 1.0 - betas
alphas_cumprod = torch.cumprod(alphas, dim=0)
sqrt_alphas_cumprod = torch.sqrt(alphas_cumprod)
sqrt_one_minus_alphas_cumprod = torch.sqrt(1.0 - alphas_cumprod)

# Dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])  # Scale to [-1, 1]
])
dataset = datasets.MNIST(root="./data", train=True,
                         download=True, transform=transform)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
```

### Sinusoidal Time Embedding

The model needs to know which timestep it's denoising:

```python
class SinusoidalPositionEmbedding(nn.Module):
    """Encode timestep as a vector using sinusoidal functions."""

    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, t):
        device = t.device
        half_dim = self.dim // 2
        emb = math.log(10000) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=device) * -emb)
        emb = t[:, None] * emb[None, :]
        emb = torch.cat([emb.sin(), emb.cos()], dim=-1)
        return emb
```

### Simple U-Net for Denoising

```python
class SimpleUNet(nn.Module):
    """Simplified U-Net for MNIST denoising."""

    def __init__(self, image_channels=1, time_dim=256):
        super().__init__()
        self.time_mlp = nn.Sequential(
            SinusoidalPositionEmbedding(time_dim),
            nn.Linear(time_dim, time_dim),
            nn.GELU(),
            nn.Linear(time_dim, time_dim)
        )

        # Encoder (downsampling)
        self.enc1 = self._block(image_channels, 64)
        self.enc2 = self._block(64, 128)
        self.pool = nn.MaxPool2d(2)

        # Bottleneck
        self.bottleneck = self._block(128, 256)

        # Time projection
        self.time_proj = nn.Linear(time_dim, 256)

        # Decoder (upsampling)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = self._block(256, 128)  # 128 + 128 skip
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = self._block(128, 64)   # 64 + 64 skip

        # Output
        self.out = nn.Conv2d(64, image_channels, 1)

    def _block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.GroupNorm(8, out_ch),
            nn.GELU(),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.GroupNorm(8, out_ch),
            nn.GELU()
        )

    def forward(self, x, t):
        # Time embedding
        t_emb = self.time_mlp(t)

        # Encoder
        e1 = self.enc1(x)           # 64 x 28 x 28
        e2 = self.enc2(self.pool(e1))  # 128 x 14 x 14

        # Bottleneck + time conditioning
        b = self.bottleneck(self.pool(e2))  # 256 x 7 x 7
        t_proj = self.time_proj(t_emb)[:, :, None, None]
        b = b + t_proj  # Add time information

        # Decoder
        d2 = self.up2(b)             # 128 x 14 x 14
        d2 = self.dec2(torch.cat([d2, e2], dim=1))
        d1 = self.up1(d2)            # 64 x 28 x 28
        d1 = self.dec1(torch.cat([d1, e1], dim=1))

        return self.out(d1)
```

### Forward Diffusion (Adding Noise)

```python
def add_noise(x_0, t, noise=None):
    """Add noise to clean images at timestep t."""
    if noise is None:
        noise = torch.randn_like(x_0)

    sqrt_alpha_cumprod_t = sqrt_alphas_cumprod[t][:, None, None, None]
    sqrt_one_minus_t = sqrt_one_minus_alphas_cumprod[t][:, None, None, None]

    # x_t = √(ᾱ_t) * x_0 + √(1-ᾱ_t) * ε
    x_t = sqrt_alpha_cumprod_t * x_0 + sqrt_one_minus_t * noise
    return x_t
```

### Training Loop

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleUNet().to(device)
optimizer = optim.Adam(model.parameters(), lr=lr)

# Move schedule to device
sqrt_alphas_cumprod = sqrt_alphas_cumprod.to(device)
sqrt_one_minus_alphas_cumprod = sqrt_one_minus_alphas_cumprod.to(device)

for epoch in range(epochs):
    total_loss = 0
    for images, _ in dataloader:
        images = images.to(device)

        # Sample random timesteps
        t = torch.randint(0, timesteps, (images.size(0),)).to(device)

        # Sample noise
        noise = torch.randn_like(images)

        # Create noisy images
        x_t = add_noise(images, t, noise)

        # Predict noise
        predicted_noise = model(x_t, t.float())

        # MSE loss
        loss = nn.functional.mse_loss(predicted_noise, noise)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(dataloader)
    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] Loss: {avg_loss:.4f}")
```

### Sampling (Generation)

```python
@torch.no_grad()
def sample(model, n_samples=16):
    """Generate images by denoising from pure noise."""
    model.eval()
    # Start from pure noise
    x = torch.randn(n_samples, channels, image_size, image_size).to(device)

    for t in reversed(range(timesteps)):
        t_batch = torch.full((n_samples,), t, dtype=torch.float).to(device)

        # Predict noise
        predicted_noise = model(x, t_batch)

        # Compute denoising step
        alpha_t = alphas[t]
        alpha_cumprod_t = alphas_cumprod[t]
        beta_t = betas[t]

        # Mean of p(x_{t-1} | x_t)
        mean = (1 / torch.sqrt(alpha_t)) * (
            x - (beta_t / torch.sqrt(1 - alpha_cumprod_t)) * predicted_noise
        )

        # Add noise (except at t=0)
        if t > 0:
            noise = torch.randn_like(x)
            sigma = torch.sqrt(beta_t)
            x = mean + sigma * noise
        else:
            x = mean

    # Scale to [0, 1]
    x = (x + 1) / 2
    x = x.clamp(0, 1)
    return x

# Generate samples
samples = sample(model, n_samples=16)
```

---

## Stable Diffusion Architecture

Stable Diffusion operates in a compressed **latent space** for efficiency:

```
Text Prompt → [Text Encoder (CLIP)] → Text Embeddings
                                            ↓
Noise → [U-Net (in latent space)] → Denoised Latent
                                            ↓
         [VAE Decoder] → Final Image
```

### Components

| Component | Role | Details |
|-----------|------|---------|
| Text Encoder | Encode prompt | CLIP ViT-L/14 (77 tokens) |
| VAE | Compress/decompress images | 8× spatial compression |
| U-Net | Denoise in latent space | Cross-attention with text |
| Scheduler | Controls denoising steps | DDPM, DDIM, etc. |

### Why Latent Space?

- 512×512 image → 64×64×4 latent (48× fewer values)
- Much faster training and inference
- Same quality when decoded

---

## Classifier-Free Guidance

**Classifier-free guidance** controls how closely generation follows the text prompt:

$$\hat{\epsilon} = \epsilon_{uncond} + s \cdot (\epsilon_{cond} - \epsilon_{uncond})$$

Where:
- $\epsilon_{cond}$: noise prediction with text conditioning
- $\epsilon_{uncond}$: noise prediction without conditioning
- $s$: guidance scale (typically 7-12)

Higher $s$ = more adherence to prompt, less diversity.

```python
# During training: randomly drop conditioning (e.g., 10% of the time)
# During inference: compute both conditional and unconditional predictions

guidance_scale = 7.5

# Predict noise with and without text
noise_cond = model(x_t, t, text_embedding)
noise_uncond = model(x_t, t, null_embedding)

# Guided prediction
noise_pred = noise_uncond + guidance_scale * (noise_cond - noise_uncond)
```

---

## Diffusion vs GANs

| Aspect | Diffusion Models | GANs |
|--------|-----------------|------|
| Training stability | Very stable | Unstable |
| Mode coverage | Excellent | Mode collapse risk |
| Sample quality | State-of-the-art | Very good |
| Sampling speed | Slow (many steps) | Fast (single pass) |
| Controllability | Easy (guidance) | Harder |
| Diversity | High | Can be limited |
| Architecture | U-Net based | Varies |

---

## DDIM: Faster Sampling

**DDIM** (Denoising Diffusion Implicit Models) allows fewer sampling steps:

- DDPM: 1000 steps to generate
- DDIM: 50-100 steps with similar quality
- Makes diffusion models practical for real-time use

```python
# DDIM uses a subset of timesteps
# Instead of [999, 998, 997, ..., 0]
# Use [999, 979, 959, ..., 0] (50 steps)
ddim_steps = 50
step_size = timesteps // ddim_steps
timestep_seq = list(range(0, timesteps, step_size))[::-1]
```

---

## Try It Yourself

1. Change the number of timesteps from 1000 to 500 — how does it affect quality?
2. Compare linear vs cosine noise schedules
3. Try generating images with fewer sampling steps (skip every 10th step)
4. Add class conditioning to generate specific digits

---

## Summary

- Diffusion models learn to reverse a gradual noising process
- Forward process adds noise: $x_t = \sqrt{\bar{\alpha}_t} x_0 + \sqrt{1-\bar{\alpha}_t} \epsilon$
- The network learns to predict the noise $\epsilon_\theta(x_t, t)$
- Training loss is simple MSE between predicted and actual noise
- Stable Diffusion operates in latent space for efficiency
- Classifier-free guidance controls prompt adherence
- Diffusion models are more stable than GANs but slower to sample

Next, we'll explore neural style transfer — combining content and style from different images.
