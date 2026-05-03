---
title: GAN Variants
---

# GAN Variants

Since the original GAN, researchers have developed many specialized architectures for different tasks. In this lesson, we explore the most important GAN variants and their applications.

---

## DCGAN: Deep Convolutional GAN

**DCGAN** (Radford et al., 2015) established architectural guidelines for stable convolutional GANs.

### Architecture Rules

| Guideline | Reason |
|-----------|--------|
| Replace pooling with strided convolutions | Lets the network learn its own downsampling |
| Use batch normalization in both G and D | Stabilizes training |
| Remove fully connected layers | Better for image generation |
| Use ReLU in G (except output: Tanh) | Helps gradient flow |
| Use LeakyReLU in D | Prevents dead neurons |

### DCGAN Generator Architecture

```python
import torch
import torch.nn as nn

class DCGANGenerator(nn.Module):
    """Generates 64x64 images from a latent vector."""

    def __init__(self, latent_dim=100, channels=1):
        super().__init__()
        self.net = nn.Sequential(
            # Input: latent_dim x 1 x 1
            nn.ConvTranspose2d(latent_dim, 512, 4, 1, 0, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(True),
            # State: 512 x 4 x 4

            nn.ConvTranspose2d(512, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            # State: 256 x 8 x 8

            nn.ConvTranspose2d(256, 128, 4, 2, 1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            # State: 128 x 16 x 16

            nn.ConvTranspose2d(128, 64, 4, 2, 1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            # State: 64 x 32 x 32

            nn.ConvTranspose2d(64, channels, 4, 2, 1, bias=False),
            nn.Tanh()
            # Output: channels x 64 x 64
        )

    def forward(self, z):
        return self.net(z.view(-1, z.size(1), 1, 1))


class DCGANDiscriminator(nn.Module):
    """Classifies 64x64 images as real or fake."""

    def __init__(self, channels=1):
        super().__init__()
        self.net = nn.Sequential(
            # Input: channels x 64 x 64
            nn.Conv2d(channels, 64, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # State: 64 x 32 x 32

            nn.Conv2d(64, 128, 4, 2, 1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            # State: 128 x 16 x 16

            nn.Conv2d(128, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            # State: 256 x 8 x 8

            nn.Conv2d(256, 512, 4, 2, 1, bias=False),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            # State: 512 x 4 x 4

            nn.Conv2d(512, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
            # Output: 1 x 1 x 1
        )

    def forward(self, x):
        return self.net(x).view(-1, 1)
```

---

## Conditional GAN (cGAN)

A **Conditional GAN** generates data conditioned on additional information (e.g., class labels).

### How It Works

Both G and D receive the condition (label) as extra input:

- $G(z, y)$: generates data for class $y$
- $D(x, y)$: determines if $x$ is real for class $y$

### Objective

$$\min_G \max_D V(D, G) = \mathbb{E}_{x \sim p_{data}}[\log D(x|y)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z|y)))]$$

### Architecture

```
Generator:
  Input: noise z + class label y (one-hot or embedding)
  Output: image of class y

Discriminator:
  Input: image x + class label y
  Output: probability (real image of class y?)
```

---

## Pix2Pix: Image-to-Image Translation

**Pix2Pix** (Isola et al., 2017) translates images from one domain to another using paired training data.

### Applications

| Input | Output |
|-------|--------|
| Sketch | Photo |
| Satellite image | Map |
| Black & white | Color |
| Day | Night |
| Edges | Objects |

### Key Components

1. **U-Net Generator**: Encoder-decoder with skip connections
2. **PatchGAN Discriminator**: Classifies patches (not whole image)
3. **L1 Loss**: Added to encourage similarity to ground truth

$$L_{Pix2Pix} = L_{cGAN}(G, D) + \lambda \cdot L_{L1}(G)$$

Where $L_{L1} = \mathbb{E}[\|y - G(x)\|_1]$ and $\lambda = 100$ typically.

---

## CycleGAN: Unpaired Image Translation

**CycleGAN** (Zhu et al., 2017) performs image translation **without paired examples**.

### The Idea

Translate between domains A and B (e.g., horses ↔ zebras) using:
- Generator $G_{A \to B}$: converts A-style to B-style
- Generator $G_{B \to A}$: converts B-style to A-style
- Discriminator $D_A$: is this a real A image?
- Discriminator $D_B$: is this a real B image?

### Cycle Consistency Loss

The key innovation — if you translate A→B→A, you should get back the original:

$$L_{cycle} = \mathbb{E}_{x \sim A}[\|G_{B \to A}(G_{A \to B}(x)) - x\|_1] + \mathbb{E}_{y \sim B}[\|G_{A \to B}(G_{B \to A}(y)) - y\|_1]$$

### Full Objective

$$L = L_{GAN}(G_{A \to B}, D_B) + L_{GAN}(G_{B \to A}, D_A) + \lambda L_{cycle}$$

### Applications

- Horse ↔ Zebra
- Summer ↔ Winter
- Photo ↔ Monet painting
- Apple ↔ Orange

---

## StyleGAN

**StyleGAN** (Karras et al., 2019) generates photorealistic faces with unprecedented quality and control.

### Key Innovations

1. **Mapping Network**: Transforms $z$ to intermediate latent $w$ via 8 FC layers
2. **Adaptive Instance Normalization (AdaIN)**: Injects style at each resolution
3. **Progressive growing**: Starts at 4×4, grows to 1024×1024
4. **Style mixing**: Apply different $w$ at different layers

### Style Levels

| Layer Level | Controls |
|-------------|----------|
| Coarse (4×4 – 8×8) | Pose, face shape, glasses |
| Medium (16×16 – 32×32) | Facial features, hair style |
| Fine (64×64 – 1024×1024) | Color scheme, micro-features |

### StyleGAN Versions

- **StyleGAN** (2019): Initial breakthrough
- **StyleGAN2** (2020): Removed artifacts, better quality
- **StyleGAN3** (2021): Alias-free generation

---

## SRGAN: Super-Resolution GAN

**SRGAN** (Ledig et al., 2017) upscales low-resolution images to high-resolution with realistic details.

### Architecture

- **Generator**: Deep residual network (SRResNet)
- **Discriminator**: Standard CNN classifier
- **Perceptual loss**: VGG feature matching (not just pixel MSE)

### Loss Function

$$L_{SRGAN} = L_{content}^{VGG} + 10^{-3} \cdot L_{adversarial}$$

The perceptual (content) loss uses VGG features rather than pixel-wise MSE, producing sharper results.

---

## GAN Applications Table

| GAN Variant | Year | Key Application | Input | Output |
|-------------|------|----------------|-------|--------|
| DCGAN | 2015 | Image generation | Noise | Images |
| cGAN | 2014 | Class-specific generation | Noise + label | Labeled images |
| Pix2Pix | 2017 | Paired translation | Image A | Image B |
| CycleGAN | 2017 | Unpaired translation | Image A | Image B |
| StyleGAN | 2019 | Face generation | Noise | HD faces |
| SRGAN | 2017 | Super resolution | Low-res | High-res |
| StarGAN | 2018 | Multi-domain transfer | Image + domain | Transformed |
| GauGAN | 2019 | Semantic → photo | Label map | Photo |
| BigGAN | 2018 | Large-scale generation | Noise + class | HD images |

---

## Code: Conditional GAN for MNIST

Generate specific digits by conditioning on the class label:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Hyperparameters
latent_dim = 100
num_classes = 10
image_dim = 28 * 28
hidden_dim = 256
batch_size = 64
lr = 0.0002
epochs = 100

# Dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
dataset = datasets.MNIST(root="./data", train=True,
                         download=True, transform=transform)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)


class ConditionalGenerator(nn.Module):
    """Generator conditioned on class label."""

    def __init__(self):
        super().__init__()
        # Embed label into a vector
        self.label_embedding = nn.Embedding(num_classes, num_classes)

        self.net = nn.Sequential(
            nn.Linear(latent_dim + num_classes, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.BatchNorm1d(hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, image_dim),
            nn.Tanh()
        )

    def forward(self, z, labels):
        # Concatenate noise and label embedding
        label_emb = self.label_embedding(labels)
        x = torch.cat([z, label_emb], dim=1)
        return self.net(x)


class ConditionalDiscriminator(nn.Module):
    """Discriminator conditioned on class label."""

    def __init__(self):
        super().__init__()
        self.label_embedding = nn.Embedding(num_classes, num_classes)

        self.net = nn.Sequential(
            nn.Linear(image_dim + num_classes, hidden_dim * 2),
            nn.LeakyReLU(0.2),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid()
        )

    def forward(self, x, labels):
        label_emb = self.label_embedding(labels)
        x = torch.cat([x, label_emb], dim=1)
        return self.net(x)


# Initialize
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
G = ConditionalGenerator().to(device)
D = ConditionalDiscriminator().to(device)

optimizer_G = optim.Adam(G.parameters(), lr=lr, betas=(0.5, 0.999))
optimizer_D = optim.Adam(D.parameters(), lr=lr, betas=(0.5, 0.999))
criterion = nn.BCELoss()

# Training loop
for epoch in range(epochs):
    for real_images, labels in dataloader:
        real_images = real_images.view(-1, image_dim).to(device)
        labels = labels.to(device)
        curr_batch = real_images.size(0)

        real_targets = torch.ones(curr_batch, 1).to(device)
        fake_targets = torch.zeros(curr_batch, 1).to(device)

        # Train Discriminator
        z = torch.randn(curr_batch, latent_dim).to(device)
        fake_images = G(z, labels).detach()

        d_real = D(real_images, labels)
        d_fake = D(fake_images, labels)
        d_loss = criterion(d_real, real_targets) + criterion(d_fake, fake_targets)

        optimizer_D.zero_grad()
        d_loss.backward()
        optimizer_D.step()

        # Train Generator
        z = torch.randn(curr_batch, latent_dim).to(device)
        fake_images = G(z, labels)
        d_fake = D(fake_images, labels)
        g_loss = criterion(d_fake, real_targets)

        optimizer_G.zero_grad()
        g_loss.backward()
        optimizer_G.step()

    if (epoch + 1) % 20 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] "
              f"D Loss: {d_loss.item():.4f} "
              f"G Loss: {g_loss.item():.4f}")
```

### Generate Specific Digits

```python
import matplotlib.pyplot as plt

G.eval()
with torch.no_grad():
    # Generate each digit 0-9
    fig, axes = plt.subplots(2, 5, figsize=(12, 5))
    for digit in range(10):
        z = torch.randn(1, latent_dim).to(device)
        label = torch.tensor([digit]).to(device)
        generated = G(z, label).view(28, 28)
        generated = (generated + 1) / 2  # Scale to [0, 1]

        row, col = digit // 5, digit % 5
        axes[row, col].imshow(generated.cpu(), cmap="gray")
        axes[row, col].set_title(f"Digit: {digit}")
        axes[row, col].axis("off")

    plt.suptitle("Conditional GAN: Generated Digits")
    plt.tight_layout()
    plt.show()
```

---

## Choosing the Right GAN

| Task | Recommended GAN |
|------|----------------|
| General image generation | DCGAN, StyleGAN |
| Class-specific generation | Conditional GAN |
| Paired image translation | Pix2Pix |
| Unpaired style transfer | CycleGAN |
| Super resolution | SRGAN, ESRGAN |
| Face generation/editing | StyleGAN |
| Text-to-image | AttnGAN, StackGAN |

---

## Try It Yourself

1. Modify the cGAN to generate only even digits (0, 2, 4, 6, 8)
2. Try using a deeper generator — does image quality improve?
3. Implement interpolation between two digits in latent space
4. Add dropout to the generator — how does it affect diversity?

---

## Summary

- **DCGAN** established CNN architecture guidelines for GANs
- **Conditional GAN** adds class labels for controlled generation
- **Pix2Pix** handles paired image-to-image translation
- **CycleGAN** enables unpaired translation with cycle consistency loss
- **StyleGAN** produces photorealistic faces with style control
- **SRGAN** enhances image resolution with perceptual loss

Next, we'll explore diffusion models — the new paradigm that's surpassing GANs in many tasks.
