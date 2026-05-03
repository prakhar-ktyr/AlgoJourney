---
title: Introduction to GANs
---

# Introduction to GANs

A **Generative Adversarial Network (GAN)** is a framework where two neural networks compete against each other to generate realistic data. Introduced by Ian Goodfellow in 2014, GANs have revolutionized generative AI.

---

## What is a GAN?

A GAN consists of two networks:

| Network | Role | Goal |
|---------|------|------|
| **Generator (G)** | Creates fake data | Fool the discriminator |
| **Discriminator (D)** | Classifies real vs fake | Correctly identify fakes |

Think of it like a counterfeiter (G) trying to make fake money, and a detective (D) trying to catch the fakes.

---

## How GANs Work

The training process alternates between two steps:

1. **Train the Discriminator**: Show it real data (label=1) and fake data from G (label=0)
2. **Train the Generator**: Generate fake data and try to fool D into outputting 1

```
Noise (z) → [Generator] → Fake Data → [Discriminator] → Real or Fake?
                                              ↑
                              Real Data ──────┘
```

---

## The Minimax Game

GANs are formulated as a minimax optimization problem:

$$\min_G \max_D V(D, G) = \mathbb{E}_{x \sim p_{data}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]$$

Breaking this down:

- $D(x)$: probability that $x$ is real (output of discriminator)
- $G(z)$: fake data generated from noise $z$
- $D(G(z))$: probability that fake data is classified as real
- D wants to **maximize**: correctly classify real ($\log D(x)$ high) and fake ($\log(1-D(G(z)))$ high)
- G wants to **minimize**: make $D(G(z))$ close to 1 (fool D)

---

## Training Steps in Detail

### Step 1: Train Discriminator

For a batch of training:

1. Sample real data $x$ from the dataset
2. Sample noise $z$ from a prior (usually Gaussian)
3. Generate fake data: $\hat{x} = G(z)$
4. Compute D loss: $-[\log D(x) + \log(1 - D(\hat{x}))]$
5. Update D parameters

### Step 2: Train Generator

1. Sample noise $z$
2. Generate fake data: $\hat{x} = G(z)$
3. Compute G loss: $-\log D(\hat{x})$
4. Update G parameters (D is frozen)

> **Note:** In practice, we maximize $\log D(G(z))$ instead of minimizing $\log(1 - D(G(z)))$ for better gradients early in training.

---

## Nash Equilibrium

The ideal outcome of GAN training is a **Nash equilibrium**:

- The generator produces data indistinguishable from real data
- The discriminator outputs 0.5 for everything (can't tell the difference)
- $p_G = p_{data}$ (generated distribution matches real distribution)

In practice, reaching true equilibrium is difficult.

---

## Mode Collapse

**Mode collapse** is a common GAN failure where the generator only produces a few types of outputs instead of capturing the full diversity of the data.

**Example:** Training a GAN on MNIST, but it only generates the digit "7" because that fools the discriminator.

| Problem | Description |
|---------|-------------|
| Full collapse | G produces only one output |
| Partial collapse | G produces limited variety |
| Oscillation | G cycles between modes |

---

## GAN Architecture Basics

A simple GAN architecture:

```
Generator:
  Input: Random noise vector z (e.g., 100 dimensions)
  Hidden layers: Linear → ReLU
  Output: Data-shaped output (e.g., 784 for MNIST)

Discriminator:
  Input: Data (real or fake)
  Hidden layers: Linear → LeakyReLU
  Output: Single probability (sigmoid)
```

---

## Code: Simple GAN for MNIST

Let's build a GAN that generates handwritten digits:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Hyperparameters
latent_dim = 100
hidden_dim = 256
image_dim = 28 * 28  # MNIST images flattened
batch_size = 64
lr = 0.0002
epochs = 100

# Dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])  # Scale to [-1, 1]
])

dataset = datasets.MNIST(
    root="./data", train=True,
    download=True, transform=transform
)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
```

### Generator Network

```python
class Generator(nn.Module):
    def __init__(self, latent_dim, hidden_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, output_dim),
            nn.Tanh()  # Output in [-1, 1]
        )

    def forward(self, z):
        return self.net(z)
```

### Discriminator Network

```python
class Discriminator(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim * 2),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)
```

### Training Loop

```python
# Initialize
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

G = Generator(latent_dim, hidden_dim, image_dim).to(device)
D = Discriminator(image_dim, hidden_dim).to(device)

optimizer_G = optim.Adam(G.parameters(), lr=lr, betas=(0.5, 0.999))
optimizer_D = optim.Adam(D.parameters(), lr=lr, betas=(0.5, 0.999))

criterion = nn.BCELoss()

# Training
for epoch in range(epochs):
    for batch_idx, (real_images, _) in enumerate(dataloader):
        real_images = real_images.view(-1, image_dim).to(device)
        batch_size_curr = real_images.size(0)

        # Labels
        real_labels = torch.ones(batch_size_curr, 1).to(device)
        fake_labels = torch.zeros(batch_size_curr, 1).to(device)

        # ---------------------
        # Train Discriminator
        # ---------------------
        # Real images
        outputs = D(real_images)
        d_loss_real = criterion(outputs, real_labels)

        # Fake images
        z = torch.randn(batch_size_curr, latent_dim).to(device)
        fake_images = G(z)
        outputs = D(fake_images.detach())  # detach: don't update G
        d_loss_fake = criterion(outputs, fake_labels)

        # Combined D loss
        d_loss = d_loss_real + d_loss_fake
        optimizer_D.zero_grad()
        d_loss.backward()
        optimizer_D.step()

        # ---------------------
        # Train Generator
        # ---------------------
        z = torch.randn(batch_size_curr, latent_dim).to(device)
        fake_images = G(z)
        outputs = D(fake_images)
        g_loss = criterion(outputs, real_labels)  # Fool D

        optimizer_G.zero_grad()
        g_loss.backward()
        optimizer_G.step()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] "
              f"D Loss: {d_loss.item():.4f} "
              f"G Loss: {g_loss.item():.4f}")
```

### Generate Samples

```python
# Generate new images
G.eval()
with torch.no_grad():
    z = torch.randn(16, latent_dim).to(device)
    generated = G(z).view(-1, 1, 28, 28)
    # Scale back to [0, 1] for visualization
    generated = (generated + 1) / 2

# Plot (using matplotlib)
import matplotlib.pyplot as plt

fig, axes = plt.subplots(4, 4, figsize=(8, 8))
for i, ax in enumerate(axes.flat):
    ax.imshow(generated[i, 0].cpu(), cmap="gray")
    ax.axis("off")
plt.suptitle("Generated MNIST Digits")
plt.tight_layout()
plt.show()
```

---

## Understanding the Loss Curves

Monitoring losses during training helps diagnose problems:

### Healthy Training

```
D Loss: fluctuates around 0.5 - 1.0
G Loss: gradually decreases
D(real): close to 1.0
D(fake): starts near 0, approaches 0.5
```

### Signs of Mode Collapse

```
D Loss: drops to near 0 (D always wins)
G Loss: stays high or oscillates
Generated samples: all look the same
```

### Signs of Generator Dominance

```
D Loss: increases to large values
G Loss: drops to near 0
D(fake): always close to 1.0 (D is fooled too easily)
```

```python
# Track metrics during training
import matplotlib.pyplot as plt

d_losses, g_losses = [], []
d_real_scores, d_fake_scores = [], []

# Inside training loop, after computing losses:
# d_losses.append(d_loss.item())
# g_losses.append(g_loss.item())
# d_real_scores.append(D(real_images).mean().item())
# d_fake_scores.append(D(fake_images).mean().item())

# Plot after training
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

ax1.plot(d_losses, label="D Loss", alpha=0.7)
ax1.plot(g_losses, label="G Loss", alpha=0.7)
ax1.set_xlabel("Iteration")
ax1.set_ylabel("Loss")
ax1.legend()
ax1.set_title("GAN Training Losses")

ax2.plot(d_real_scores, label="D(real)", alpha=0.7)
ax2.plot(d_fake_scores, label="D(fake)", alpha=0.7)
ax2.set_xlabel("Iteration")
ax2.set_ylabel("Score")
ax2.legend()
ax2.set_title("Discriminator Scores")

plt.tight_layout()
plt.show()
```

---

## Latent Space Interpolation

One fascinating property of GANs is smooth interpolation in latent space:

```python
def interpolate(G, z1, z2, steps=10):
    """Generate images by interpolating between two noise vectors."""
    G.eval()
    images = []
    with torch.no_grad():
        for alpha in torch.linspace(0, 1, steps):
            z = (1 - alpha) * z1 + alpha * z2
            img = G(z).view(28, 28)
            images.append((img + 1) / 2)  # Scale to [0, 1]
    return images

# Interpolate between two random points
z1 = torch.randn(1, latent_dim).to(device)
z2 = torch.randn(1, latent_dim).to(device)
interp_images = interpolate(G, z1, z2, steps=10)

# Plot interpolation
fig, axes = plt.subplots(1, 10, figsize=(15, 2))
for i, (ax, img) in enumerate(zip(axes, interp_images)):
    ax.imshow(img.cpu(), cmap="gray")
    ax.axis("off")
plt.suptitle("Latent Space Interpolation")
plt.tight_layout()
plt.show()
```

Smooth transitions between generated images indicate the generator has learned a meaningful latent representation.

---

## The GAN Training Algorithm (Pseudocode)

```
Initialize Generator G with random weights θ_G
Initialize Discriminator D with random weights θ_D

For each epoch:
    For each mini-batch of real data x:

        # === Update Discriminator ===
        Sample noise z ~ N(0, I)
        Generate fake data: x_fake = G(z)
        Compute D loss:
            L_D = -[log D(x) + log(1 - D(x_fake))]
        Update θ_D to minimize L_D

        # === Update Generator ===
        Sample new noise z ~ N(0, I)
        Generate fake data: x_fake = G(z)
        Compute G loss:
            L_G = -log D(x_fake)
        Update θ_G to minimize L_G
```

---

## Historical Context

| Year | Milestone |
|------|-----------|
| 2014 | Original GAN paper (Goodfellow et al.) |
| 2015 | DCGAN: convolutional GANs |
| 2016 | Improved training techniques |
| 2017 | Wasserstein GAN, Progressive GAN |
| 2018 | BigGAN, StyleGAN |
| 2019 | StyleGAN2 |
| 2020 | Diffusion models begin surpassing GANs |
| 2021 | StyleGAN3, GANs still strong for video |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| GAN | Two networks (G and D) competing |
| Generator | Creates fake data from noise |
| Discriminator | Classifies real vs fake |
| Training | Alternating optimization |
| Equilibrium | D outputs 0.5 everywhere |
| Mode collapse | G only produces limited outputs |
| Latent space | Smooth interpolation possible |

---

## Common GAN Applications

- Image generation (faces, art, landscapes)
- Image super-resolution
- Data augmentation
- Style transfer
- Text-to-image synthesis
- Video generation
- Drug discovery
- Image inpainting (fill missing regions)
- Anomaly detection
- 3D object generation

---

## Try It Yourself

1. Change the noise dimension from 100 to 64 — does quality change?
2. Add more layers to G and D — does training improve?
3. Try generating only one digit class by filtering the dataset
4. Plot the discriminator's accuracy over training — what happens?
5. Implement latent space interpolation and observe the transitions
6. Try using a different activation (Tanh vs Sigmoid) in the generator output

---

## Summary

- GANs use two competing networks: a Generator and a Discriminator
- The minimax game objective drives both networks to improve
- Training alternates between updating D and G
- Mode collapse is the main challenge
- The ideal result is $p_G = p_{data}$
- Monitoring D and G losses helps diagnose training issues
- Smooth latent interpolation indicates good representation learning

In the next lesson, we'll explore techniques to make GAN training more stable.
