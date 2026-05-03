---
title: Variational Autoencoders
---

# Variational Autoencoders (VAE)

A **Variational Autoencoder** extends the standard autoencoder by learning a *probabilistic* latent space. Instead of encoding inputs to fixed points, a VAE encodes them as distributions — enabling smooth interpolation and meaningful generation.

---

## From Autoencoder to VAE

### The Problem with Standard Autoencoders

Standard autoencoders map each input to a **single point** in latent space:

$$z = \text{Encoder}(x)$$

This leads to:
- **Gaps** in latent space (no guarantee nearby points decode to similar outputs)
- **No sampling** — you can't generate new data by picking random $z$ values
- Points between training examples may decode to garbage

### The VAE Solution

Instead of encoding to a point, encode to a **distribution**:

$$q(z|x) = \mathcal{N}(\mu, \sigma^2)$$

The encoder outputs **mean** ($\mu$) and **variance** ($\sigma^2$) of a Gaussian distribution. We then **sample** from this distribution to get $z$.

```
Standard AE:   x → Encoder → z (point) → Decoder → x̂
VAE:           x → Encoder → μ, σ → Sample z ~ N(μ,σ²) → Decoder → x̂
```

This forces the latent space to be **smooth** and **continuous** — nearby points decode to similar outputs.

---

## The Encoder: Outputting $\mu$ and $\sigma$

The encoder predicts parameters of a Gaussian distribution for each input:

$$\text{Encoder}(x) \rightarrow (\mu, \log\sigma^2)$$

> **Why $\log\sigma^2$?** The network outputs log-variance because variance must be positive. Using log-variance allows the network to output any real number, and we exponentiate to get positive variance.

```python
import torch
import torch.nn as nn


class VAEEncoder(nn.Module):
    """Encode input to mean and log-variance of latent distribution."""

    def __init__(self, input_dim=784, hidden_dim=512, latent_dim=20):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 256),
            nn.ReLU(),
        )
        # Two separate heads: one for mean, one for log-variance
        self.fc_mu = nn.Linear(256, latent_dim)
        self.fc_logvar = nn.Linear(256, latent_dim)

    def forward(self, x):
        h = self.shared(x)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar
```

---

## The Reparameterization Trick

We need to **sample** $z$ from $\mathcal{N}(\mu, \sigma^2)$, but sampling is not differentiable — we can't backpropagate through a random operation!

### The Trick

Instead of sampling directly, we reparameterize:

$$z = \mu + \sigma \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)$$

Where:
- $\mu$ and $\sigma$ are deterministic outputs of the encoder (differentiable)
- $\epsilon$ is random noise sampled from a standard normal (treated as constant)
- $\odot$ is element-wise multiplication

This way, gradients flow through $\mu$ and $\sigma$, but $z$ is still stochastic!

```python
def reparameterize(mu, logvar):
    """
    Reparameterization trick: z = mu + sigma * epsilon
    During training, sample epsilon ~ N(0, 1)
    """
    std = torch.exp(0.5 * logvar)  # sigma = exp(0.5 * log(sigma^2))
    epsilon = torch.randn_like(std)  # Sample from N(0, I)
    z = mu + std * epsilon
    return z
```

### Why This Works

| Without trick | With trick |
|---------------|-----------|
| $z \sim \mathcal{N}(\mu, \sigma^2)$ | $z = \mu + \sigma \cdot \epsilon$ |
| Not differentiable w.r.t. $\mu, \sigma$ | Differentiable w.r.t. $\mu, \sigma$ |
| Can't train with backprop | Backprop works! |

---

## The VAE Loss Function

The VAE loss has two components:

$$\mathcal{L} = \mathcal{L}_{\text{recon}} + \beta \cdot D_{KL}\big(q(z|x) \| p(z)\big)$$

### 1. Reconstruction Loss

Same as standard autoencoder — measures how well we reconstruct the input:

$$\mathcal{L}_{\text{recon}} = -\mathbb{E}_{z \sim q(z|x)}[\log p(x|z)]$$

In practice, use **MSE** or **BCE**:

```python
# MSE reconstruction loss
recon_loss = nn.functional.mse_loss(x_hat, x, reduction="sum")

# BCE reconstruction loss (for binary data)
recon_loss = nn.functional.binary_cross_entropy(x_hat, x, reduction="sum")
```

### 2. KL Divergence

Regularizes the latent space by pushing $q(z|x)$ close to the prior $p(z) = \mathcal{N}(0, I)$:

$$D_{KL}\big(q(z|x) \| p(z)\big) = -\frac{1}{2} \sum_{j=1}^{d} \left(1 + \log\sigma_j^2 - \mu_j^2 - \sigma_j^2\right)$$

This ensures:
- Latent distributions are close to standard normal
- Latent space is smooth and continuous
- Different inputs share overlapping latent regions

```python
def kl_divergence(mu, logvar):
    """
    KL divergence between q(z|x) = N(mu, sigma^2) and p(z) = N(0, I)
    = -0.5 * sum(1 + log(sigma^2) - mu^2 - sigma^2)
    """
    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return kl
```

### The $\beta$ Parameter

The $\beta$ coefficient balances reconstruction quality vs latent space regularity:

| $\beta$ | Effect |
|---------|--------|
| $\beta < 1$ | Better reconstruction, less regular latent space |
| $\beta = 1$ | Standard VAE (ELBO objective) |
| $\beta > 1$ | More disentangled latent space, blurrier outputs |

$\beta$-VAE uses $\beta > 1$ to encourage disentangled representations.

---

## Complete VAE Implementation

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader


class VAE(nn.Module):
    """Variational Autoencoder for MNIST."""

    def __init__(self, input_dim=784, hidden_dim=512, latent_dim=20):
        super().__init__()
        self.latent_dim = latent_dim

        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 256),
            nn.ReLU(),
        )
        self.fc_mu = nn.Linear(256, latent_dim)
        self.fc_logvar = nn.Linear(256, latent_dim)

        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Linear(256, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim),
            nn.Sigmoid(),
        )

    def encode(self, x):
        """Encode input to distribution parameters."""
        h = self.encoder(x)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar

    def reparameterize(self, mu, logvar):
        """Sample z using the reparameterization trick."""
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + std * eps

    def decode(self, z):
        """Decode latent vector to reconstruction."""
        return self.decoder(z)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        x_hat = self.decode(z)
        return x_hat, mu, logvar


def vae_loss(x_hat, x, mu, logvar, beta=1.0):
    """VAE loss = Reconstruction + beta * KL divergence."""
    # Reconstruction loss (sum over features, mean over batch)
    recon_loss = nn.functional.binary_cross_entropy(x_hat, x, reduction="sum")

    # KL divergence
    kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())

    return (recon_loss + beta * kl_loss) / x.size(0)


# --- Data ---
transform = transforms.ToTensor()
train_dataset = datasets.MNIST("./data", train=True, download=True, transform=transform)
test_dataset = datasets.MNIST("./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=128, shuffle=False)

# --- Training ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = VAE(input_dim=784, hidden_dim=512, latent_dim=20).to(device)
optimizer = optim.Adam(model.parameters(), lr=1e-3)

num_epochs = 30

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    total_recon = 0
    total_kl = 0

    for images, _ in train_loader:
        images = images.view(-1, 784).to(device)

        # Forward pass
        x_hat, mu, logvar = model(images)

        # Compute loss
        recon = nn.functional.binary_cross_entropy(x_hat, images, reduction="sum")
        kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        loss = (recon + kl) / images.size(0)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        total_recon += recon.item()
        total_kl += kl.item()

    n = len(train_loader.dataset)
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}: Loss={total_loss/n:.2f}, "
              f"Recon={total_recon/n:.2f}, KL={total_kl/n:.2f}")
```

---

## Generating New Images

The key advantage of VAEs: **sample from the latent space** to generate new data!

```python
def generate_samples(model, num_samples=16, device="cpu"):
    """Generate new images by sampling from the prior p(z) = N(0, I)."""
    model.eval()
    with torch.no_grad():
        # Sample from standard normal prior
        z = torch.randn(num_samples, model.latent_dim).to(device)
        # Decode to image space
        generated = model.decode(z)
        # Reshape to images
        generated = generated.view(-1, 1, 28, 28)
    return generated

# Generate 16 new digit images
new_images = generate_samples(model, num_samples=16, device=device)
print(f"Generated {new_images.shape[0]} images of shape {new_images.shape[1:]}")
```

Because the KL loss pushes the latent space toward $\mathcal{N}(0, I)$, random samples from this distribution produce valid images!

---

## Latent Space Interpolation

Another powerful property: **smoothly interpolate** between two images by interpolating their latent codes.

```python
def interpolate(model, x1, x2, steps=10, device="cpu"):
    """Interpolate between two images in latent space."""
    model.eval()
    with torch.no_grad():
        # Encode both images
        mu1, _ = model.encode(x1.view(1, -1).to(device))
        mu2, _ = model.encode(x2.view(1, -1).to(device))

        # Linear interpolation in latent space
        interpolations = []
        for alpha in torch.linspace(0, 1, steps):
            z = (1 - alpha) * mu1 + alpha * mu2
            img = model.decode(z)
            interpolations.append(img.view(28, 28))

    return torch.stack(interpolations)


# Interpolate between a "3" and a "7"
test_images, test_labels = next(iter(test_loader))
idx_3 = (test_labels == 3).nonzero()[0].item()
idx_7 = (test_labels == 7).nonzero()[0].item()

interp = interpolate(model, test_images[idx_3], test_images[idx_7], steps=10, device=device)
print(f"Interpolation: {interp.shape[0]} steps between digit 3 and 7")
# You'll see smooth morphing from 3 → 7!
```

---

## Latent Space Visualization

With a 2D latent space, we can visualize how the VAE organizes digits:

```python
class VAE2D(VAE):
    """VAE with 2D latent space for visualization."""

    def __init__(self):
        super().__init__(input_dim=784, hidden_dim=512, latent_dim=2)


# Train VAE with 2D latent space
model_2d = VAE2D().to(device)
optimizer = optim.Adam(model_2d.parameters(), lr=1e-3)

for epoch in range(50):
    model_2d.train()
    for images, _ in train_loader:
        images = images.view(-1, 784).to(device)
        x_hat, mu, logvar = model_2d(images)
        loss = vae_loss(x_hat, images, mu, logvar)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

# Encode test set to 2D
model_2d.eval()
all_mu = []
all_labels = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.view(-1, 784).to(device)
        mu, _ = model_2d.encode(images)
        all_mu.append(mu.cpu())
        all_labels.append(labels)

all_mu = torch.cat(all_mu).numpy()
all_labels = torch.cat(all_labels).numpy()

# Print cluster centers
print("Digit cluster centers in 2D latent space:")
for digit in range(10):
    mask = all_labels == digit
    center = all_mu[mask].mean(axis=0)
    print(f"  Digit {digit}: ({center[0]:.2f}, {center[1]:.2f})")
```

### Generating from a Grid

Sample a grid of points in 2D latent space and decode each:

```python
def generate_grid(model, n=20, digit_size=28, device="cpu"):
    """Generate images from a grid of latent space points."""
    model.eval()

    # Grid of points from -3 to 3 (covers most of N(0,1))
    grid_x = torch.linspace(-3, 3, n)
    grid_y = torch.linspace(-3, 3, n)

    all_images = []
    with torch.no_grad():
        for yi in grid_y:
            for xi in grid_x:
                z = torch.tensor([[xi, yi]]).float().to(device)
                img = model.decode(z).view(digit_size, digit_size)
                all_images.append(img.cpu())

    return all_images

grid_images = generate_grid(model_2d, n=20, device=device)
print(f"Generated {len(grid_images)} images from latent grid")
# Shows smooth transitions between digit types across the grid!
```

---

## Convolutional VAE

For better image quality, use convolutional layers:

```python
class ConvVAE(nn.Module):
    """Convolutional VAE for MNIST."""

    def __init__(self, latent_dim=20):
        super().__init__()
        self.latent_dim = latent_dim

        # Encoder
        self.encoder_conv = nn.Sequential(
            nn.Conv2d(1, 32, 3, stride=2, padding=1),   # 28→14
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1),  # 14→7
            nn.ReLU(),
            nn.Flatten(),
        )
        self.fc_mu = nn.Linear(64 * 7 * 7, latent_dim)
        self.fc_logvar = nn.Linear(64 * 7 * 7, latent_dim)

        # Decoder
        self.decoder_fc = nn.Linear(latent_dim, 64 * 7 * 7)
        self.decoder_conv = nn.Sequential(
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1),  # 7→14
            nn.ReLU(),
            nn.ConvTranspose2d(32, 1, 3, stride=2, padding=1, output_padding=1),   # 14→28
            nn.Sigmoid(),
        )

    def encode(self, x):
        h = self.encoder_conv(x)
        return self.fc_mu(h), self.fc_logvar(h)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + std * eps

    def decode(self, z):
        h = self.decoder_fc(z)
        h = h.view(-1, 64, 7, 7)
        return self.decoder_conv(h)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        x_hat = self.decode(z)
        return x_hat, mu, logvar


# Training
conv_vae = ConvVAE(latent_dim=20).to(device)
optimizer = optim.Adam(conv_vae.parameters(), lr=1e-3)

for epoch in range(30):
    conv_vae.train()
    total_loss = 0
    for images, _ in train_loader:
        images = images.to(device)  # Keep as (B, 1, 28, 28)
        x_hat, mu, logvar = conv_vae(images)

        recon = nn.functional.binary_cross_entropy(x_hat, images, reduction="sum")
        kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        loss = (recon + kl) / images.size(0)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}: Loss = {total_loss/len(train_loader):.2f}")
```

---

## VAE vs Standard Autoencoder

| Property | Autoencoder | VAE |
|----------|-------------|-----|
| Latent space | Deterministic point | Probability distribution |
| Generation | Not reliable | Sample from $\mathcal{N}(0, I)$ |
| Interpolation | May have gaps | Smooth and meaningful |
| Loss | Reconstruction only | Reconstruction + KL |
| Latent structure | Unstructured | Regularized, continuous |

---

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **KL collapse** | KL → 0, decoder ignores $z$ | KL annealing: start $\beta=0$, increase slowly |
| **Blurry outputs** | MSE averages over modes | Use perceptual loss or adversarial training |
| **Poor generation** | Latent space not well-organized | Increase $\beta$, more training, larger model |

### KL Annealing

```python
# Gradually increase KL weight during training
def get_beta(epoch, warmup_epochs=10):
    """Linear KL annealing schedule."""
    return min(1.0, epoch / warmup_epochs)

# In training loop:
beta = get_beta(epoch, warmup_epochs=10)
loss = recon_loss + beta * kl_loss
```

---

## Summary

- **VAEs** encode inputs as distributions ($\mu$, $\sigma$), not fixed points
- **Reparameterization trick**: $z = \mu + \sigma \odot \epsilon$ enables backprop through sampling
- **Loss** = Reconstruction + $\beta \cdot$ KL Divergence
- KL divergence regularizes latent space toward $\mathcal{N}(0, I)$
- **Generation**: sample $z \sim \mathcal{N}(0, I)$, decode to get new data
- **Interpolation**: linearly interpolate in latent space for smooth transitions
- Convolutional VAEs produce better image quality

---

## Key Equations

| Concept | Formula |
|---------|---------|
| Reparameterization | $z = \mu + \sigma \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)$ |
| VAE Loss | $\mathcal{L} = \mathcal{L}_{\text{recon}} + \beta \cdot D_{KL}(q(z|x) \| p(z))$ |
| KL Divergence | $D_{KL} = -\frac{1}{2}\sum_j(1 + \log\sigma_j^2 - \mu_j^2 - \sigma_j^2)$ |
| Generation | $z \sim \mathcal{N}(0, I) \rightarrow \text{Decoder}(z) \rightarrow x_{\text{new}}$ |
| Interpolation | $z_{\alpha} = (1-\alpha)\mu_1 + \alpha\mu_2$ |
