---
title: GAN Training Techniques
---

# GAN Training Techniques

Training GANs is notoriously difficult. In this lesson, we'll explore why GANs are hard to train and learn proven techniques to stabilize training, including the Wasserstein GAN.

---

## Why Are GANs Hard to Train?

| Problem | Description |
|---------|-------------|
| **Mode collapse** | Generator produces limited variety |
| **Training instability** | Loss oscillates wildly, never converges |
| **Vanishing gradients** | Discriminator too strong → G gets no useful gradient |
| **Non-convergence** | Networks oscillate rather than reaching equilibrium |
| **Sensitivity** | Small hyperparameter changes cause failure |

The fundamental issue: two networks are optimized simultaneously with competing objectives — there's no guarantee of convergence.

---

## Basic Training Tips

### 1. Label Convention

Use soft labels instead of hard 0/1:

```python
# Hard labels
real_label = 1.0
fake_label = 0.0

# Label smoothing (helps prevent D from becoming too confident)
real_label = 0.9  # Instead of 1.0
fake_label = 0.1  # Instead of 0.0 (optional, one-sided is common)
```

**Why it works:** Prevents the discriminator from becoming overconfident, which causes vanishing gradients for the generator.

---

### 2. Separate Batches for Real and Fake

Always process real and fake data in separate mini-batches:

```python
# GOOD: Separate batches
d_loss_real = criterion(D(real_images), real_labels)
d_loss_fake = criterion(D(fake_images.detach()), fake_labels)
d_loss = d_loss_real + d_loss_fake

# BAD: Mixed batch (can cause issues with batch normalization)
# mixed = torch.cat([real_images, fake_images])
# mixed_labels = torch.cat([real_labels, fake_labels])
# d_loss = criterion(D(mixed), mixed_labels)
```

---

### 3. Learning Rate and Optimizer

The standard settings from DCGAN paper:

```python
# Recommended optimizer settings
lr = 0.0002
beta1 = 0.5   # Lower momentum (default 0.9 causes instability)
beta2 = 0.999

optimizer_G = optim.Adam(G.parameters(), lr=lr, betas=(beta1, beta2))
optimizer_D = optim.Adam(D.parameters(), lr=lr, betas=(beta1, beta2))
```

**Key insight:** $\beta_1 = 0.5$ (instead of default 0.9) reduces momentum, which helps prevent oscillation in the adversarial game.

---

### 4. Balance D and G Training

Common strategies:

```python
# Strategy 1: Train D more often (k steps of D per 1 step of G)
k = 5  # D trains 5 times for every G update

for real_batch in dataloader:
    # Train D for k steps
    for _ in range(k):
        z = torch.randn(batch_size, latent_dim).to(device)
        fake = G(z).detach()
        d_loss = -torch.mean(D(real_batch)) + torch.mean(D(fake))
        optimizer_D.zero_grad()
        d_loss.backward()
        optimizer_D.step()

    # Train G for 1 step
    z = torch.randn(batch_size, latent_dim).to(device)
    fake = G(z)
    g_loss = -torch.mean(D(fake))
    optimizer_G.zero_grad()
    g_loss.backward()
    optimizer_G.step()
```

---

### 5. Use LeakyReLU in Discriminator

```python
# Discriminator should use LeakyReLU, not ReLU
nn.LeakyReLU(0.2)  # Allows gradient flow for negative values

# Generator can use ReLU
nn.ReLU()
```

---

### 6. Batch Normalization

```python
# Use BatchNorm in both G and D (but NOT in D's input or G's output layer)
class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(100, 256),
            nn.BatchNorm1d(256),  # Stabilizes training
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Linear(512, 784),  # No BatchNorm on output
            nn.Tanh()
        )
```

---

## Wasserstein GAN (WGAN)

The standard GAN loss uses the **Jensen-Shannon divergence**, which can have vanishing gradients. WGAN uses the **Earth Mover's (Wasserstein-1) distance** instead.

### Earth Mover's Distance

Intuitively: the minimum "cost" of transforming one distribution into another.

$$W(p_r, p_g) = \inf_{\gamma \in \Pi(p_r, p_g)} \mathbb{E}_{(x,y) \sim \gamma}[\|x - y\|]$$

### WGAN Objective

Using the Kantorovich-Rubinstein duality:

$$W(p_r, p_g) = \sup_{\|f\|_L \leq 1} \mathbb{E}_{x \sim p_r}[f(x)] - \mathbb{E}_{x \sim p_g}[f(x)]$$

Where $f$ must be 1-Lipschitz (gradient bounded by 1).

### Key Changes from Standard GAN

| Standard GAN | WGAN |
|-------------|------|
| Sigmoid output in D | No sigmoid (linear output) |
| BCE loss | Wasserstein loss |
| D is a classifier | D is a "critic" (scores realness) |
| Weight clipping: No | Weight clipping: Yes |

```python
# WGAN Critic (no sigmoid!)
class Critic(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, 1)  # No sigmoid!
        )

    def forward(self, x):
        return self.net(x)

# WGAN losses
# Critic loss: maximize E[C(real)] - E[C(fake)]
c_loss = -(torch.mean(C(real)) - torch.mean(C(fake)))

# Generator loss: maximize E[C(fake)]
g_loss = -torch.mean(C(fake))
```

### Weight Clipping (Original WGAN)

To enforce the Lipschitz constraint:

```python
# After each critic update, clip weights
clip_value = 0.01
for p in C.parameters():
    p.data.clamp_(-clip_value, clip_value)
```

**Problem:** Weight clipping can lead to capacity underuse and exploding/vanishing gradients.

---

## Gradient Penalty (WGAN-GP)

WGAN-GP replaces weight clipping with a **gradient penalty**, providing a better way to enforce the Lipschitz constraint.

### The Gradient Penalty

For interpolated samples between real and fake:

$$L_{GP} = \lambda \mathbb{E}_{\hat{x}}[(\|\nabla_{\hat{x}} D(\hat{x})\|_2 - 1)^2]$$

Where $\hat{x} = \epsilon x_{real} + (1 - \epsilon) x_{fake}$, $\epsilon \sim U(0, 1)$

### Full WGAN-GP Implementation

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Hyperparameters
latent_dim = 100
hidden_dim = 256
image_dim = 28 * 28
batch_size = 64
lr = 0.0001  # WGAN-GP uses lower lr
n_critic = 5  # Train critic 5x per generator step
lambda_gp = 10  # Gradient penalty coefficient
epochs = 100

# Dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
dataset = datasets.MNIST(root="./data", train=True,
                         download=True, transform=transform)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# Generator
class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.BatchNorm1d(hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, image_dim),
            nn.Tanh()
        )

    def forward(self, z):
        return self.net(z)

# Critic (no batch norm with gradient penalty!)
class Critic(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(image_dim, hidden_dim * 2),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, x):
        return self.net(x)

# Gradient penalty function
def gradient_penalty(critic, real, fake, device):
    batch_size = real.size(0)
    epsilon = torch.rand(batch_size, 1).to(device)

    # Interpolated samples
    interpolated = (epsilon * real + (1 - epsilon) * fake).requires_grad_(True)

    # Critic scores for interpolated
    scores = critic(interpolated)

    # Compute gradients
    gradients = torch.autograd.grad(
        outputs=scores,
        inputs=interpolated,
        grad_outputs=torch.ones_like(scores),
        create_graph=True,
        retain_graph=True
    )[0]

    # Gradient penalty
    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)
    penalty = ((gradient_norm - 1) ** 2).mean()
    return penalty

# Initialize
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
G = Generator().to(device)
C = Critic().to(device)

optimizer_G = optim.Adam(G.parameters(), lr=lr, betas=(0.0, 0.9))
optimizer_C = optim.Adam(C.parameters(), lr=lr, betas=(0.0, 0.9))

# Training loop
for epoch in range(epochs):
    for batch_idx, (real_images, _) in enumerate(dataloader):
        real_images = real_images.view(-1, image_dim).to(device)
        curr_batch_size = real_images.size(0)

        # ---------------------
        # Train Critic (n_critic steps)
        # ---------------------
        for _ in range(n_critic):
            z = torch.randn(curr_batch_size, latent_dim).to(device)
            fake_images = G(z).detach()

            # Wasserstein loss
            c_real = C(real_images).mean()
            c_fake = C(fake_images).mean()

            # Gradient penalty
            gp = gradient_penalty(C, real_images, fake_images, device)

            # Critic loss: minimize -E[C(real)] + E[C(fake)] + λ * GP
            c_loss = -c_real + c_fake + lambda_gp * gp

            optimizer_C.zero_grad()
            c_loss.backward()
            optimizer_C.step()

        # ---------------------
        # Train Generator
        # ---------------------
        z = torch.randn(curr_batch_size, latent_dim).to(device)
        fake_images = G(z)
        g_loss = -C(fake_images).mean()

        optimizer_G.zero_grad()
        g_loss.backward()
        optimizer_G.step()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] "
              f"C Loss: {c_loss.item():.4f} "
              f"G Loss: {g_loss.item():.4f} "
              f"W-dist: {(c_real - c_fake).item():.4f}")
```

---

## Spectral Normalization

Another way to enforce Lipschitz continuity — normalize each layer's weight matrix by its spectral norm (largest singular value):

$$\bar{W} = \frac{W}{\sigma(W)}$$

```python
# PyTorch provides spectral normalization built-in
from torch.nn.utils import spectral_norm

class SNDiscriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            spectral_norm(nn.Linear(784, 512)),
            nn.LeakyReLU(0.2),
            spectral_norm(nn.Linear(512, 256)),
            nn.LeakyReLU(0.2),
            spectral_norm(nn.Linear(256, 1)),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)
```

**Advantages:** No extra hyperparameters, computationally cheap, compatible with standard GAN loss.

---

## Progressive Training

Train GANs starting from low resolution and progressively adding layers:

```
Phase 1: 4×4 images → train until stable
Phase 2: 8×8 images → add layers, train
Phase 3: 16×16 → ...
Phase 4: 32×32 → ...
...
Phase N: 1024×1024 (ProGAN, StyleGAN)
```

This allows the networks to learn coarse structure first, then fine details.

---

## Evaluation Metrics

### Fréchet Inception Distance (FID)

Measures how similar generated images are to real images using feature statistics:

$$FID = \|\mu_r - \mu_g\|^2 + \text{Tr}(\Sigma_r + \Sigma_g - 2(\Sigma_r \Sigma_g)^{1/2})$$

- Lower FID = better quality
- Compares mean and covariance of Inception network features
- Standard benchmark: FID on 50K generated images

### Inception Score (IS)

$$IS = \exp(\mathbb{E}_x [D_{KL}(p(y|x) \| p(y))])$$

- Higher IS = better quality and diversity
- Measures: (1) each image looks like one class, (2) variety across classes

```python
# Using pytorch-fid library
# pip install pytorch-fid

# From command line:
# python -m pytorch_fid path/to/real_images path/to/generated_images

# Programmatic FID calculation (simplified)
from scipy.linalg import sqrtm
import numpy as np

def calculate_fid(mu1, sigma1, mu2, sigma2):
    """Calculate FID between two distributions."""
    diff = mu1 - mu2
    covmean = sqrtm(sigma1 @ sigma2)

    # Numerical stability
    if np.iscomplexobj(covmean):
        covmean = covmean.real

    fid = diff @ diff + np.trace(sigma1 + sigma2 - 2 * covmean)
    return fid
```

---

## Training Monitoring Tips

| Metric | Healthy Training | Unhealthy Training |
|--------|-----------------|-------------------|
| D loss | Hovers around 0.5-0.7 | Drops to 0 (D too strong) |
| G loss | Gradually decreases | Explodes or stays flat |
| Wasserstein distance | Decreases, then stabilizes | Oscillates wildly |
| Generated samples | Improve over time | All look the same (collapse) |

---

## Summary of Techniques

| Technique | Benefit |
|-----------|---------|
| Label smoothing | Prevents overconfident D |
| Separate batches | Correct batch norm statistics |
| Adam β1=0.5 | Less oscillation |
| WGAN | Meaningful loss metric |
| Gradient penalty | Better Lipschitz enforcement |
| Spectral norm | Simple, effective constraint |
| Progressive training | Stable high-res generation |
| FID/IS | Objective quality measurement |

---

## Try It Yourself

1. Compare standard GAN vs WGAN-GP training curves — which is more stable?
2. Try different `lambda_gp` values (1, 10, 100) — what happens?
3. Implement label smoothing in the standard GAN from lesson 46
4. Monitor the Wasserstein distance — does it correlate with sample quality?

---

## Summary

- GAN training is unstable due to the adversarial objective
- Key tips: label smoothing, Adam β1=0.5, separate batches, balanced training
- WGAN uses Earth Mover's distance for more meaningful gradients
- WGAN-GP adds a gradient penalty to enforce Lipschitz continuity
- Spectral normalization is a simple alternative constraint
- FID and IS are standard metrics for evaluating generated image quality

Next, we'll explore different GAN architectures and their applications.
