---
title: Introduction to Generative Models
---

# Introduction to Generative Models

So far we've focused on **discriminative** models that classify or predict. **Generative models** go further — they learn to *create* new data that looks like the training data.

---

## Discriminative vs Generative Models

| Aspect | Discriminative | Generative |
|--------|---------------|------------|
| **Goal** | Learn $P(Y|X)$ | Learn $P(X)$ or $P(X|Z)$ |
| **Task** | Classify / predict | Create / generate |
| **Output** | Label or value | New data samples |
| **Example** | "This is a cat" | "Here's a new cat image" |

### Discriminative Models

Learn the **decision boundary** between classes:

$$P(Y|X) = \text{probability of label } Y \text{ given input } X$$

Examples: ResNet, BERT (classification), logistic regression.

### Generative Models

Learn the **data distribution** to generate new samples:

$$P(X) = \text{probability of data } X$$

Or learn to map from a latent space:

$$P(X|Z) = \text{probability of data } X \text{ given latent code } Z$$

Examples: GANs, VAEs, Diffusion models, GPT.

---

## Why Generative Models Matter

Generative models aren't just for making pretty pictures. They:

1. **Understand data structure** — learning to generate requires deep understanding
2. **Enable data augmentation** — create synthetic training data
3. **Fill missing data** — inpainting, super-resolution
4. **Explore creative spaces** — art, music, design
5. **Enable conditional generation** — text-to-image, translation

---

## Types of Generative Models

### 1. Autoencoders & Variational Autoencoders (VAEs)

**Idea**: Compress data into a latent space, then reconstruct it. VAEs add probabilistic sampling for generation.

```
Input → Encoder → Latent Space (z) → Decoder → Reconstruction
```

$$\text{Loss} = \text{Reconstruction} + \text{KL Divergence}$$

- **Strengths**: Stable training, meaningful latent space, good interpolation
- **Weaknesses**: Blurry outputs, limited sample quality
- **Use cases**: Data compression, anomaly detection, latent exploration

### 2. Generative Adversarial Networks (GANs)

**Idea**: Two networks compete — a Generator creates fakes, a Discriminator detects them.

```
Noise (z) → Generator → Fake Image
                              ↓
Real Image → Discriminator → Real or Fake?
```

$$\min_G \max_D \; \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$$

- **Strengths**: Sharp, high-quality outputs
- **Weaknesses**: Unstable training, mode collapse
- **Use cases**: Image generation, style transfer, super-resolution

### 3. Diffusion Models

**Idea**: Gradually add noise to data (forward), then learn to reverse the noise (backward).

```
Clean Image → Add Noise (T steps) → Pure Noise
Pure Noise → Denoise (T steps) → Generated Image
```

$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t} x_{t-1}, \beta_t I)$$

- **Strengths**: Best image quality, stable training, flexible
- **Weaknesses**: Slow generation (many denoising steps)
- **Use cases**: DALL-E 2, Stable Diffusion, Midjourney

### 4. Autoregressive Models

**Idea**: Generate data one element at a time, conditioned on previous elements.

$$P(x) = \prod_{i=1}^{n} P(x_i | x_1, x_2, \ldots, x_{i-1})$$

```
[Start] → predict token 1 → predict token 2 → ... → [End]
```

- **Strengths**: Exact likelihood, powerful for sequences
- **Weaknesses**: Slow generation (sequential), can't generate in parallel
- **Use cases**: GPT (text), PixelCNN (images), WaveNet (audio)

### 5. Flow-Based Models

**Idea**: Learn an **invertible** transformation between data and a simple distribution (e.g., Gaussian).

$$x = f(z), \quad z = f^{-1}(x), \quad z \sim \mathcal{N}(0, I)$$

Uses change of variables formula for exact likelihood:

$$\log P(x) = \log P(z) + \log \left| \det \frac{\partial f^{-1}}{\partial x} \right|$$

- **Strengths**: Exact likelihood, invertible, fast sampling
- **Weaknesses**: Architectural constraints (invertibility), less flexible
- **Use cases**: Density estimation, Glow (faces)

---

## Comparison Table

| Model | Quality | Speed | Training | Likelihood |
|-------|---------|-------|----------|------------|
| VAE | Medium | Fast | Stable | Approximate |
| GAN | High | Fast | Unstable | None |
| Diffusion | Best | Slow | Stable | Approximate |
| Autoregressive | High | Slow | Stable | Exact |
| Flow | Medium | Fast | Stable | Exact |

---

## Applications of Generative Models

### Image Generation

```
Text Prompt → "A cat astronaut on Mars" → Stable Diffusion → Image
```

- **Unconditional**: Generate random realistic images
- **Conditional**: Text-to-image, class-conditional, style-guided

### Text Generation

- ChatGPT, Claude — autoregressive language models
- Summarization, translation, code generation

### Music & Audio

- WaveNet, Jukebox — generate music
- Text-to-speech synthesis

### Drug Discovery

- Generate novel molecular structures
- Optimize for desired properties (binding affinity, solubility)

### Video Generation

- Sora (OpenAI) — text-to-video
- Frame interpolation, video prediction

### Data Augmentation

- Generate synthetic training data for rare classes
- Privacy-preserving synthetic datasets

---

## Evaluating Generative Models

How do we know if generated samples are good?

### Fréchet Inception Distance (FID)

Measures **distance** between real and generated image distributions:

$$\text{FID} = ||\mu_r - \mu_g||^2 + \text{Tr}(\Sigma_r + \Sigma_g - 2(\Sigma_r \Sigma_g)^{1/2})$$

Where $\mu_r, \Sigma_r$ are mean/covariance of real image features (from Inception network), and $\mu_g, \Sigma_g$ are for generated images.

- **Lower FID = better** (0 = identical distributions)
- Standard benchmark metric for image generation

### Inception Score (IS)

Measures **quality** and **diversity** of generated images:

$$\text{IS} = \exp\left(\mathbb{E}_x \left[ D_{KL}(p(y|x) || p(y)) \right]\right)$$

- **Higher IS = better**
- Quality: classifier should be confident about each image
- Diversity: overall class distribution should be uniform

### Other Metrics

| Metric | Measures | Used For |
|--------|----------|----------|
| FID | Distribution similarity | Images |
| IS | Quality + Diversity | Images |
| LPIPS | Perceptual similarity | Image pairs |
| BLEU/ROUGE | Text similarity | Text generation |
| Perplexity | Likelihood | Language models |

---

## Code Example: Simple Data Generation

Let's build intuition with a simple example — generating 2D data points from a learned distribution:

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# --- Generate Training Data: Two Moons ---
from sklearn.datasets import make_moons

X_train, _ = make_moons(n_samples=2000, noise=0.1)
X_train = torch.FloatTensor(X_train)
print(f"Training data shape: {X_train.shape}")  # (2000, 2)


# --- Simple Generator Network ---
class SimpleGenerator(nn.Module):
    """Map random noise to 2D data points."""

    def __init__(self, noise_dim=16, hidden_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(noise_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 2),  # Output: 2D points
        )

    def forward(self, z):
        return self.net(z)


# --- Simple Discriminator Network ---
class SimpleDiscriminator(nn.Module):
    """Classify points as real or fake."""

    def __init__(self, hidden_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(2, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        return self.net(x)


# --- Training (GAN-style) ---
noise_dim = 16
generator = SimpleGenerator(noise_dim=noise_dim)
discriminator = SimpleDiscriminator()

g_optimizer = optim.Adam(generator.parameters(), lr=2e-4, betas=(0.5, 0.999))
d_optimizer = optim.Adam(discriminator.parameters(), lr=2e-4, betas=(0.5, 0.999))
criterion = nn.BCELoss()

num_epochs = 2000
batch_size = 256

for epoch in range(num_epochs):
    # Sample real data
    idx = torch.randint(0, len(X_train), (batch_size,))
    real_data = X_train[idx]

    # --- Train Discriminator ---
    noise = torch.randn(batch_size, noise_dim)
    fake_data = generator(noise).detach()

    real_pred = discriminator(real_data)
    fake_pred = discriminator(fake_data)

    d_loss = criterion(real_pred, torch.ones_like(real_pred)) + \
             criterion(fake_pred, torch.zeros_like(fake_pred))

    d_optimizer.zero_grad()
    d_loss.backward()
    d_optimizer.step()

    # --- Train Generator ---
    noise = torch.randn(batch_size, noise_dim)
    fake_data = generator(noise)
    fake_pred = discriminator(fake_data)

    g_loss = criterion(fake_pred, torch.ones_like(fake_pred))

    g_optimizer.zero_grad()
    g_loss.backward()
    g_optimizer.step()

    if (epoch + 1) % 500 == 0:
        print(f"Epoch {epoch+1}: D_loss={d_loss.item():.4f}, G_loss={g_loss.item():.4f}")

# --- Generate New Samples ---
generator.eval()
with torch.no_grad():
    noise = torch.randn(500, noise_dim)
    generated_points = generator(noise).numpy()

print(f"Generated {len(generated_points)} new data points!")
print(f"Real data range: x=[{X_train[:,0].min():.2f}, {X_train[:,0].max():.2f}]")
print(f"Generated range:  x=[{generated_points[:,0].min():.2f}, {generated_points[:,0].max():.2f}]")
```

---

## The Generative AI Landscape (2024+)

| Domain | Model | Company |
|--------|-------|---------|
| Text | GPT-4, Claude | OpenAI, Anthropic |
| Images | DALL-E 3, Midjourney, Stable Diffusion | OpenAI, Midjourney, Stability AI |
| Video | Sora, Runway | OpenAI, Runway |
| Audio | MusicLM, Suno | Google, Suno |
| Code | Copilot, CodeLlama | GitHub, Meta |
| 3D | Point-E, DreamFusion | OpenAI, Google |
| Protein | AlphaFold, ESMFold | DeepMind, Meta |

---

## Conditional Generation

Most practical generative models are **conditional** — they generate data given some input:

$$P(X | C) \quad \text{where } C \text{ is a condition}$$

| Type | Condition | Example |
|------|-----------|---------|
| Class-conditional | Class label | "Generate a cat" |
| Text-to-image | Text prompt | "A sunset over mountains" |
| Image-to-image | Input image | Style transfer, colorization |
| Inpainting | Masked image | Fill in missing regions |
| Super-resolution | Low-res image | Enhance to high resolution |

```python
# Conditional generation: provide class label as input
class ConditionalGenerator(nn.Module):
    """Generator conditioned on class label."""

    def __init__(self, noise_dim=100, num_classes=10, hidden_dim=256, output_dim=784):
        super().__init__()
        self.label_embed = nn.Embedding(num_classes, 50)
        self.net = nn.Sequential(
            nn.Linear(noise_dim + 50, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),
            nn.Sigmoid(),
        )

    def forward(self, noise, labels):
        label_emb = self.label_embed(labels)
        x = torch.cat([noise, label_emb], dim=1)
        return self.net(x)

# Generate a specific digit
generator = ConditionalGenerator()
noise = torch.randn(1, 100)
label = torch.tensor([7])  # Generate a "7"
fake_image = generator(noise, label)
```

---

## Latent Space: The Core Concept

All generative models work with a **latent space** — a lower-dimensional space that captures the essential variation in data.

$$Z \text{ (latent space)} \xrightarrow{\text{Decoder/Generator}} X \text{ (data space)}$$

Properties of a good latent space:
- **Smooth**: nearby points decode to similar outputs
- **Complete**: every point decodes to a realistic output
- **Disentangled**: each dimension controls one factor of variation

```
Latent space example (faces):
  z[0] → controls hair color
  z[1] → controls pose angle
  z[2] → controls smile intensity
  z[3] → controls lighting
```

---

## What's Next?

In the following lessons, we'll deep-dive into the most important generative architectures:

1. **Autoencoders** — understanding compression and reconstruction
2. **VAEs** — adding probabilistic generation
3. **GANs** — adversarial training for sharp outputs
4. **Diffusion Models** — the current state-of-the-art

---

## Summary

- **Generative models** learn data distributions to create new samples
- **Discriminative**: $P(Y|X)$ (classify) vs **Generative**: $P(X)$ (create)
- Five main families: VAE, GAN, Diffusion, Autoregressive, Flow
- **FID** (lower = better) and **IS** (higher = better) evaluate generation quality
- Applications span images, text, audio, video, science, and more
- Each model family has trade-offs in quality, speed, and training stability
