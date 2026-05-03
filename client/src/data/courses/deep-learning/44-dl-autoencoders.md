---
title: Autoencoders
---

# Autoencoders

An **autoencoder** is a neural network that learns to compress data into a compact representation and then reconstruct the original input from that compressed form. It's one of the simplest and most intuitive generative architectures.

---

## What Is an Autoencoder?

An autoencoder has two parts:

1. **Encoder**: compresses input $x$ into a latent representation $z$
2. **Decoder**: reconstructs the input from $z$

```
Input (x) → [Encoder] → Latent Code (z) → [Decoder] → Reconstruction (x̂)
```

The network is trained to minimize the difference between input and output:

$$\mathcal{L} = ||x - \hat{x}||^2$$

> **Key insight**: By forcing data through a bottleneck, the network must learn the most important features — it can't just memorize!

---

## Why Use Autoencoders?

- **Dimensionality reduction**: like PCA but nonlinear
- **Feature learning**: latent code captures meaningful structure
- **Denoising**: learn to remove noise from corrupted inputs
- **Anomaly detection**: high reconstruction error = unusual input
- **Generation**: sample from latent space to create new data

---

## Architecture

### The Bottleneck

The latent space $z$ must be **smaller** than the input — this forces compression:

```
Input: 784 dims (28×28 MNIST)
    ↓
Encoder: 784 → 512 → 256 → 128
    ↓
Latent: 32 dims (bottleneck!)
    ↓
Decoder: 32 → 128 → 256 → 512
    ↓
Output: 784 dims (reconstruction)
```

If the bottleneck is too large, the network can trivially copy the input (no useful compression). If too small, reconstruction will be poor.

---

## Reconstruction Loss

The most common loss is **Mean Squared Error (MSE)**:

$$\mathcal{L}_{\text{MSE}} = \frac{1}{n} \sum_{i=1}^{n} (x_i - \hat{x}_i)^2$$

For binary data (like binarized MNIST), **Binary Cross-Entropy** works better:

$$\mathcal{L}_{\text{BCE}} = -\frac{1}{n} \sum_{i=1}^{n} [x_i \log(\hat{x}_i) + (1-x_i) \log(1-\hat{x}_i)]$$

---

## Basic Autoencoder Implementation

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# --- Define the Autoencoder ---
class Autoencoder(nn.Module):
    """Simple fully-connected autoencoder for MNIST."""

    def __init__(self, input_dim=784, latent_dim=32):
        super().__init__()

        # Encoder: compress input to latent space
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, latent_dim),
        )

        # Decoder: reconstruct input from latent space
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Linear(512, input_dim),
            nn.Sigmoid(),  # Output in [0, 1] for pixel values
        )

    def encode(self, x):
        return self.encoder(x)

    def decode(self, z):
        return self.decoder(z)

    def forward(self, x):
        z = self.encode(x)
        x_hat = self.decode(z)
        return x_hat


# --- Data Loading ---
transform = transforms.Compose([
    transforms.ToTensor(),
])

train_dataset = datasets.MNIST(root="./data", train=True, download=True, transform=transform)
test_dataset = datasets.MNIST(root="./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=128, shuffle=False)

# --- Training ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = Autoencoder(input_dim=784, latent_dim=32).to(device)
optimizer = optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.MSELoss()

num_epochs = 20

for epoch in range(num_epochs):
    model.train()
    total_loss = 0

    for images, _ in train_loader:
        # Flatten images: (batch, 1, 28, 28) → (batch, 784)
        images = images.view(images.size(0), -1).to(device)

        # Forward pass
        reconstructed = model(images)
        loss = criterion(reconstructed, images)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    if (epoch + 1) % 5 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.6f}")

# --- Evaluate ---
model.eval()
with torch.no_grad():
    test_images, _ = next(iter(test_loader))
    test_images = test_images.view(test_images.size(0), -1).to(device)
    reconstructed = model(test_images)
    test_loss = criterion(reconstructed, test_images)
    print(f"\nTest reconstruction loss: {test_loss.item():.6f}")
```

---

## Convolutional Autoencoder

For images, **convolutional** autoencoders are more effective than fully-connected ones:

```python
class ConvAutoencoder(nn.Module):
    """Convolutional autoencoder for MNIST (28×28)."""

    def __init__(self, latent_dim=64):
        super().__init__()

        # Encoder: Conv layers reduce spatial dimensions
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=2, padding=1),   # 28→14
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),  # 14→7
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1), # 7→4
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, latent_dim),
        )

        # Decoder: Transpose conv layers increase spatial dimensions
        self.decoder_fc = nn.Linear(latent_dim, 128 * 4 * 4)
        self.decoder_conv = nn.Sequential(
            nn.ConvTranspose2d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=0),  # 4→7
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, kernel_size=3, stride=2, padding=1, output_padding=1),   # 7→14
            nn.ReLU(),
            nn.ConvTranspose2d(32, 1, kernel_size=3, stride=2, padding=1, output_padding=1),    # 14→28
            nn.Sigmoid(),
        )

    def encode(self, x):
        return self.encoder(x)

    def decode(self, z):
        x = self.decoder_fc(z)
        x = x.view(-1, 128, 4, 4)
        x = self.decoder_conv(x)
        return x

    def forward(self, x):
        z = self.encode(x)
        x_hat = self.decode(z)
        return x_hat


# Training (images stay as 2D)
conv_model = ConvAutoencoder(latent_dim=64).to(device)
optimizer = optim.Adam(conv_model.parameters(), lr=1e-3)

for epoch in range(20):
    conv_model.train()
    total_loss = 0
    for images, _ in train_loader:
        images = images.to(device)  # Keep as (batch, 1, 28, 28)
        reconstructed = conv_model(images)
        loss = criterion(reconstructed, images)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}: Loss = {total_loss/len(train_loader):.6f}")
```

---

## Undercomplete Autoencoders

An **undercomplete** autoencoder has a latent dimension smaller than the input. This forces the network to learn a compressed representation.

$$\text{dim}(z) < \text{dim}(x)$$

| Latent Dim | Effect |
|-----------|--------|
| Too small (2-5) | Lossy, misses detail, but great for visualization |
| Right size (32-128) | Good compression, retains important features |
| Too large (≥ input) | No compression, can memorize — useless |

### Visualizing with 2D Latent Space

```python
# Autoencoder with 2D latent space for visualization
model_2d = Autoencoder(input_dim=784, latent_dim=2).to(device)
# ... train as before ...

# Encode test data to 2D
model_2d.eval()
latent_points = []
labels_list = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.view(images.size(0), -1).to(device)
        z = model_2d.encode(images)
        latent_points.append(z.cpu())
        labels_list.append(labels)

latent_points = torch.cat(latent_points).numpy()
labels_all = torch.cat(labels_list).numpy()

# Each digit class clusters in a different region!
print(f"Latent space shape: {latent_points.shape}")  # (10000, 2)
for digit in range(10):
    mask = labels_all == digit
    mean = latent_points[mask].mean(axis=0)
    print(f"Digit {digit}: center at ({mean[0]:.2f}, {mean[1]:.2f})")
```

---

## Denoising Autoencoders

A **denoising autoencoder** receives corrupted input and learns to output the clean version. This forces the model to learn robust features rather than memorizing.

### How It Works

1. Take clean input $x$
2. Add noise: $\tilde{x} = x + \epsilon$, where $\epsilon \sim \mathcal{N}(0, \sigma^2)$
3. Train to reconstruct the clean $x$ from noisy $\tilde{x}$

$$\mathcal{L} = ||x - f(\tilde{x})||^2$$

```python
class DenoisingAutoencoder(nn.Module):
    """Autoencoder trained to remove noise from inputs."""

    def __init__(self, input_dim=784, latent_dim=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, latent_dim),
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Linear(512, input_dim),
            nn.Sigmoid(),
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


def add_noise(images, noise_factor=0.3):
    """Add Gaussian noise to images."""
    noisy = images + noise_factor * torch.randn_like(images)
    return torch.clamp(noisy, 0.0, 1.0)


# --- Training the Denoising Autoencoder ---
dae = DenoisingAutoencoder(input_dim=784, latent_dim=64).to(device)
optimizer = optim.Adam(dae.parameters(), lr=1e-3)
criterion = nn.MSELoss()

noise_factor = 0.3

for epoch in range(20):
    dae.train()
    total_loss = 0

    for images, _ in train_loader:
        images = images.view(images.size(0), -1).to(device)

        # Add noise to input
        noisy_images = add_noise(images, noise_factor)

        # Reconstruct clean image from noisy input
        reconstructed = dae(noisy_images)
        loss = criterion(reconstructed, images)  # Compare to CLEAN images!

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}: Loss = {total_loss/len(train_loader):.6f}")

# --- Test Denoising ---
dae.eval()
with torch.no_grad():
    test_images, _ = next(iter(test_loader))
    test_images = test_images.view(test_images.size(0), -1).to(device)

    noisy_test = add_noise(test_images, noise_factor)
    denoised = dae(noisy_test)

    noisy_loss = criterion(noisy_test, test_images)
    denoised_loss = criterion(denoised, test_images)
    print(f"\nNoisy MSE:    {noisy_loss.item():.6f}")
    print(f"Denoised MSE: {denoised_loss.item():.6f}")
    print(f"Improvement:  {(1 - denoised_loss/noisy_loss)*100:.1f}%")
```

---

## Sparse Autoencoders

A **sparse autoencoder** adds a sparsity constraint to the latent representation. Most latent units should be inactive (close to 0) for any given input.

$$\mathcal{L} = ||x - \hat{x}||^2 + \lambda \sum_j |z_j|$$

The L1 penalty encourages sparse activations — each input activates only a few latent features, leading to more interpretable representations.

```python
class SparseAutoencoder(nn.Module):
    """Autoencoder with L1 sparsity penalty on latent code."""

    def __init__(self, input_dim=784, latent_dim=256):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Linear(512, latent_dim),
            nn.ReLU(),  # ReLU naturally encourages sparsity
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 512),
            nn.ReLU(),
            nn.Linear(512, input_dim),
            nn.Sigmoid(),
        )

    def forward(self, x):
        z = self.encoder(x)
        x_hat = self.decoder(z)
        return x_hat, z


# Training with sparsity loss
sparse_ae = SparseAutoencoder(input_dim=784, latent_dim=256).to(device)
optimizer = optim.Adam(sparse_ae.parameters(), lr=1e-3)
sparsity_weight = 1e-3  # λ

for epoch in range(20):
    sparse_ae.train()
    for images, _ in train_loader:
        images = images.view(images.size(0), -1).to(device)

        x_hat, z = sparse_ae(images)
        recon_loss = nn.functional.mse_loss(x_hat, images)
        sparsity_loss = torch.mean(torch.abs(z))  # L1 penalty
        loss = recon_loss + sparsity_weight * sparsity_loss

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

---

## Applications

### 1. Dimensionality Reduction

Like PCA, but captures nonlinear structure:

```python
# Compress 784-dim data to 32-dim representation
model.eval()
with torch.no_grad():
    images = test_images.view(test_images.size(0), -1).to(device)
    compressed = model.encode(images)  # 784 → 32
    print(f"Compression ratio: {784/32:.1f}x")
```

### 2. Anomaly Detection

Normal data reconstructs well; anomalies don't:

```python
def detect_anomalies(model, data, threshold):
    """Flag samples with high reconstruction error as anomalies."""
    model.eval()
    with torch.no_grad():
        reconstructed = model(data)
        errors = torch.mean((data - reconstructed) ** 2, dim=1)
        anomalies = errors > threshold
    return anomalies, errors

# Train on normal data only, then test on mixed data
# High reconstruction error → anomaly!
```

### 3. Image Compression

```python
# Original: 28 × 28 = 784 values (float32 = 3136 bytes)
# Latent:   32 values (float32 = 128 bytes)
# Compression: ~24.5x
compression_ratio = 784 / 32
print(f"Compression: {compression_ratio:.1f}x")
```

---

## Autoencoder Limitations

| Limitation | Explanation |
|-----------|-------------|
| **Not truly generative** | Random latent vectors may decode to nonsense |
| **Discontinuous latent space** | Nearby points in latent space may decode very differently |
| **No probabilistic framework** | Can't compute $P(x)$ or sample meaningfully |
| **Blurry reconstructions** | MSE loss averages over modes |

> **Solution**: Variational Autoencoders (VAEs) address these by making the latent space continuous and probabilistic — coming in the next lesson!

---

## Summary

- **Autoencoders** learn to compress (encode) and reconstruct (decode) data
- The **bottleneck** forces learning of meaningful features
- **Reconstruction loss** (MSE or BCE) drives training
- **Convolutional** autoencoders work better for images
- **Denoising** autoencoders learn robust features by removing noise
- **Sparse** autoencoders encourage interpretable, disentangled representations
- Applications: compression, denoising, anomaly detection, feature learning
- Limitation: standard autoencoders have unstructured latent spaces

---

## Key Formulas

| Concept | Formula |
|---------|---------|
| MSE Loss | $\mathcal{L} = \frac{1}{n}\sum_i(x_i - \hat{x}_i)^2$ |
| Denoising objective | $\mathcal{L} = \|x - f(x + \epsilon)\|^2$ |
| Sparse penalty | $\mathcal{L} = \text{MSE} + \lambda \sum_j |z_j|$ |
| Compression ratio | $\frac{\text{dim}(x)}{\text{dim}(z)}$ |
