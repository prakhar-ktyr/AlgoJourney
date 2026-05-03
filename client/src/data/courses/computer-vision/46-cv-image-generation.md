---
title: Image Generation
---

# Image Generation

Generative models can **create entirely new images** that never existed before. From generating realistic faces to creating art from text descriptions, image generation is one of the most exciting areas in computer vision.

---

## What Are Generative Models?

Unlike discriminative models (which classify images), generative models learn the **distribution of data** and can sample new examples from it.

| Model Type | Task | Example |
|------------|------|---------|
| Discriminative | P(y\|x) — classify | "This is a cat" |
| Generative | P(x) — generate | Create a new cat image |

---

## GANs (Generative Adversarial Networks)

GANs use two networks that compete against each other:

### Generator and Discriminator

```python
import torch
import torch.nn as nn

# Generator: takes random noise, produces an image
class Generator(nn.Module):
    def __init__(self, latent_dim=100, img_channels=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, 1024),
            nn.LeakyReLU(0.2),
            nn.Linear(1024, 28 * 28 * img_channels),
            nn.Tanh()  # Output in [-1, 1]
        )

    def forward(self, z):
        img = self.net(z)
        return img.view(-1, 1, 28, 28)

# Discriminator: classifies images as real or fake
class Discriminator(nn.Module):
    def __init__(self, img_channels=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28 * img_channels, 512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 1),
            nn.Sigmoid()  # Probability: real or fake
        )

    def forward(self, img):
        return self.net(img)
```

**How it works:**
- The Generator tries to create realistic images from random noise
- The Discriminator tries to tell real images from fake ones
- They improve together through adversarial training

---

## DCGAN (Deep Convolutional GAN)

DCGAN uses **transposed convolutions** (deconvolutions) in the generator to produce images with spatial structure.

```python
class DCGANGenerator(nn.Module):
    """DCGAN Generator for 28x28 MNIST images."""

    def __init__(self, latent_dim=100, ngf=64):
        super().__init__()
        self.net = nn.Sequential(
            # Input: latent_dim x 1 x 1
            nn.ConvTranspose2d(latent_dim, ngf * 4, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            # State: (ngf*4) x 4 x 4

            nn.ConvTranspose2d(ngf * 4, ngf * 2, 3, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            # State: (ngf*2) x 7 x 7

            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            # State: ngf x 14 x 14

            nn.ConvTranspose2d(ngf, 1, 4, 2, 1, bias=False),
            nn.Tanh()
            # Output: 1 x 28 x 28
        )

    def forward(self, z):
        z = z.view(-1, z.size(1), 1, 1)
        return self.net(z)


class DCGANDiscriminator(nn.Module):
    """DCGAN Discriminator for 28x28 images."""

    def __init__(self, ndf=64):
        super().__init__()
        self.net = nn.Sequential(
            # Input: 1 x 28 x 28
            nn.Conv2d(1, ndf, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # State: ndf x 14 x 14

            nn.Conv2d(ndf, ndf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 2),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (ndf*2) x 7 x 7

            nn.Conv2d(ndf * 2, ndf * 4, 3, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 4),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (ndf*4) x 4 x 4

            nn.Conv2d(ndf * 4, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )

    def forward(self, img):
        return self.net(img).view(-1, 1)
```

---

## Training a DCGAN

```python
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Setup
latent_dim = 100
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

generator = DCGANGenerator(latent_dim).to(device)
discriminator = DCGANDiscriminator().to(device)

criterion = nn.BCELoss()
opt_g = optim.Adam(generator.parameters(), lr=0.0002, betas=(0.5, 0.999))
opt_d = optim.Adam(discriminator.parameters(), lr=0.0002, betas=(0.5, 0.999))

# Load MNIST
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
dataset = datasets.MNIST(root="./data", train=True, transform=transform, download=True)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# Training loop
num_epochs = 50
for epoch in range(num_epochs):
    for real_imgs, _ in dataloader:
        batch_size = real_imgs.size(0)
        real_imgs = real_imgs.to(device)

        # Labels
        real_labels = torch.ones(batch_size, 1, device=device)
        fake_labels = torch.zeros(batch_size, 1, device=device)

        # --- Train Discriminator ---
        z = torch.randn(batch_size, latent_dim, device=device)
        fake_imgs = generator(z).detach()

        loss_real = criterion(discriminator(real_imgs), real_labels)
        loss_fake = criterion(discriminator(fake_imgs), fake_labels)
        loss_d = (loss_real + loss_fake) / 2

        opt_d.zero_grad()
        loss_d.backward()
        opt_d.step()

        # --- Train Generator ---
        z = torch.randn(batch_size, latent_dim, device=device)
        fake_imgs = generator(z)
        loss_g = criterion(discriminator(fake_imgs), real_labels)

        opt_g.zero_grad()
        loss_g.backward()
        opt_g.step()

    print(f"Epoch [{epoch+1}/{num_epochs}] | D Loss: {loss_d:.4f} | G Loss: {loss_g:.4f}")
```

---

## StyleGAN and Progressive Growing

### StyleGAN

StyleGAN introduced a **style-based generator** that produces incredibly realistic faces:

- **Mapping network**: transforms latent code z → intermediate space w
- **Style injection**: controls features at each resolution level
- **Adaptive Instance Normalization (AdaIN)**: applies style at each layer
- **Stochastic variation**: adds noise for fine details (freckles, hair)

### Progressive Growing

Start generating at low resolution (4×4) and progressively add layers for higher resolutions (8×8 → 16×16 → ... → 1024×1024). This stabilizes training for high-resolution images.

---

## Diffusion Models

Diffusion models have overtaken GANs as the state-of-the-art for image generation.

### Forward Process (Add Noise)

Gradually add Gaussian noise over T timesteps until the image becomes pure noise:

$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t}\, x_{t-1},\, \beta_t I)$$

### Reverse Process (Denoise)

Learn to reverse the noise process step by step:

$$p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t),\, \sigma_t^2 I)$$

### Key Variants

| Model | Key Idea |
|-------|----------|
| DDPM | Original denoising diffusion (1000 steps) |
| DDIM | Faster sampling (fewer steps, deterministic) |
| Latent Diffusion | Work in compressed VAE latent space |

---

## Stable Diffusion

Stable Diffusion is a **latent diffusion model** with three components:

1. **Text Encoder (CLIP)**: converts text prompt → embedding
2. **U-Net Denoiser**: removes noise from latent representation
3. **VAE Decoder**: converts denoised latent → final image

### Classifier-Free Guidance

Controls how strongly the model follows the text prompt:

$$\epsilon = \epsilon_u + s(\epsilon_c - \epsilon_u)$$

Where:
- $\epsilon_u$ = unconditional noise prediction
- $\epsilon_c$ = conditional noise prediction (with text)
- $s$ = guidance scale (typically 7–15; higher = follows prompt more)

---

## Using the Diffusers Library

```python
from diffusers import StableDiffusionPipeline
import torch

# Load pre-trained Stable Diffusion
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

# Text-to-image generation
prompt = "A serene mountain landscape at sunset, oil painting style"
image = pipe(
    prompt,
    num_inference_steps=50,
    guidance_scale=7.5
).images[0]

image.save("generated_landscape.png")
print(f"Generated image size: {image.size}")
```

### Image-to-Image

```python
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
).to("cuda")

# Load an initial image
init_image = Image.open("sketch.png").resize((512, 512))

# Transform the image based on a prompt
result = pipe(
    prompt="A detailed watercolor painting of a cat",
    image=init_image,
    strength=0.75,  # How much to change (0=no change, 1=full generation)
    guidance_scale=7.5
).images[0]

result.save("watercolor_cat.png")
```

> **Note:** `strength` controls how much the output differs from the input. Lower values preserve more of the original image.

---

## Other Notable Models

| Model | Creator | Key Feature |
|-------|---------|-------------|
| DALL-E 2/3 | OpenAI | Text-to-image with CLIP guidance |
| Midjourney | Midjourney | Artistic, aesthetic focus |
| Imagen | Google | Large language model for text understanding |
| Muse | Google | Masked token prediction (fast) |

---

## Evaluation Metrics

How do we measure image generation quality?

### FID (Fréchet Inception Distance)

Compares the distribution of generated images to real images:

$$\text{FID} = ||\mu_r - \mu_g||^2 + \text{Tr}(\Sigma_r + \Sigma_g - 2(\Sigma_r \Sigma_g)^{1/2})$$

**Lower FID = better quality.** Typical values: <10 is excellent, 10–50 is good.

### Inception Score (IS)

Measures quality and diversity:

$$\text{IS} = \exp(\mathbb{E}[D_{KL}(p(y|x) \| p(y))])$$

**Higher IS = better.** Good models score 50+ on ImageNet.

### CLIP Score

Measures how well the image matches the text prompt. Higher = better alignment.

---

## Ethical Considerations

Image generation raises important ethical questions:

| Concern | Description |
|---------|-------------|
| Deepfakes | Generating fake images/videos of real people |
| Copyright | Training on copyrighted art without permission |
| Bias | Models may amplify stereotypes from training data |
| Misinformation | Fake images used to spread false information |

**Best practices:**
- Add watermarks to AI-generated content
- Use content filters to prevent harmful generation
- Disclose when content is AI-generated
- Respect artists' intellectual property

---

## Try It Yourself

Generate MNIST digits with the DCGAN code above, then experiment with:

1. Change the `latent_dim` — how does it affect variety?
2. Train for more epochs — when does quality plateau?
3. Try generating specific digits by conditioning on labels (cGAN)

---

## Summary

| Approach | Speed | Quality | Control |
|----------|-------|---------|---------|
| GAN | Fast (one pass) | Good | Limited |
| Diffusion | Slow (many steps) | Excellent | High (text guidance) |
| VAE | Fast | Moderate | Moderate |

- **GANs** are fast but can be unstable to train
- **Diffusion models** produce the best quality but are slower
- **Stable Diffusion** combines diffusion with latent space for efficiency
- Always consider **ethical implications** of generated content

In the next lesson, we will explore **style transfer** — combining the content of one image with the artistic style of another!
