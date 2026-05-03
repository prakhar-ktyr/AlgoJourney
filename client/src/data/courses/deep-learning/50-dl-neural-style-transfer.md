---
title: Neural Style Transfer
---

# Neural Style Transfer

**Neural Style Transfer** combines the content of one image with the artistic style of another. First introduced by Gatys et al. (2015), it uses deep CNN features to separate and recombine content and style.

---

## What is Style Transfer?

Given two images:
- **Content image**: the photo you want to transform (e.g., a city skyline)
- **Style image**: the artwork whose style you want to apply (e.g., Van Gogh's Starry Night)

The goal is to produce an output that shows the content of the first image rendered in the style of the second.

```
Content Image (photo)  +  Style Image (painting)  →  Stylized Output
```

---

## How It Works: The Optimization Approach

Instead of training a neural network, Gatys' method **optimizes the output image directly**:

1. Start with a random noise image (or copy of content image)
2. Pass it through a pretrained CNN (VGG-19)
3. Compute content loss (match content features)
4. Compute style loss (match style statistics)
5. Backpropagate to update the image pixels
6. Repeat until convergence

The network weights are **frozen** — only the image pixels are updated.

---

## Feature Extraction with VGG-19

VGG-19 extracts hierarchical features:

| Layer | Captures |
|-------|----------|
| Early (conv1, conv2) | Edges, textures, colors |
| Middle (conv3, conv4) | Patterns, shapes |
| Deep (conv5) | Objects, high-level structure |

**Content** is captured by deeper layers (semantic structure).
**Style** is captured by correlations across all layers (textures, patterns).

---

## Content Loss

The content loss ensures the output has the same high-level structure as the content image.

We compare feature maps at a chosen layer $l$ (typically `conv4_2`):

$$L_{content} = \frac{1}{2} \sum_{i,j} (F_{ij}^l - P_{ij}^l)^2$$

Where:
- $F^l$: feature map of the generated image at layer $l$
- $P^l$: feature map of the content image at layer $l$
- $i$: filter index, $j$: spatial position

**Intuition:** If two images produce similar feature maps in a deep layer, they have similar content.

---

## Style Loss: Gram Matrix

Style is captured by the **Gram matrix** — correlations between feature maps.

### Gram Matrix

For feature maps $F^l$ at layer $l$ with $N_l$ filters and $M_l$ spatial positions:

$$G_{ij}^l = \sum_{k} F_{ik}^l \cdot F_{jk}^l$$

The Gram matrix $G^l$ is an $N_l \times N_l$ matrix where entry $(i,j)$ measures how correlated filters $i$ and $j$ are.

**Intuition:** If two images have similar Gram matrices, they have similar textures and patterns regardless of spatial arrangement.

### Style Loss Formula

$$L_{style} = \sum_{l} w_l \cdot \frac{1}{4 N_l^2 M_l^2} \sum_{i,j} (G_{ij}^l - A_{ij}^l)^2$$

Where:
- $G^l$: Gram matrix of generated image at layer $l$
- $A^l$: Gram matrix of style image at layer $l$
- $w_l$: weight for layer $l$ (often equal for all layers)
- $N_l$: number of filters at layer $l$
- $M_l$: spatial size (height × width) at layer $l$

---

## Total Loss

The total loss combines content and style:

$$L_{total} = \alpha \cdot L_{content} + \beta \cdot L_{style}$$

Where:
- $\alpha$: content weight (e.g., 1)
- $\beta$: style weight (e.g., $10^4$ to $10^6$)
- Higher $\beta/\alpha$ ratio → more stylized, less recognizable content

---

## VGG-19 Layers Used

| Purpose | Layers |
|---------|--------|
| Style | `conv1_1`, `conv2_1`, `conv3_1`, `conv4_1`, `conv5_1` |
| Content | `conv4_2` |

Using multiple layers for style captures both fine textures (early layers) and larger patterns (later layers).

---

## Code: Neural Style Transfer with PyTorch

### Setup and Image Loading

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Image preprocessing
image_size = 512 if torch.cuda.is_available() else 256

transform = transforms.Compose([
    transforms.Resize((image_size, image_size)),
    transforms.ToTensor(),
    # VGG normalization
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def load_image(path):
    """Load and preprocess an image."""
    image = Image.open(path).convert("RGB")
    image = transform(image).unsqueeze(0)  # Add batch dimension
    return image.to(device)

def denormalize(tensor):
    """Reverse VGG normalization for display."""
    mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
    std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)
    tensor = tensor * std + mean
    return tensor.clamp(0, 1)

# Load images
content_img = load_image("content.jpg")
style_img = load_image("style.jpg")
```

### Feature Extractor from VGG-19

```python
class VGGFeatures(nn.Module):
    """Extract features from specific VGG-19 layers."""

    def __init__(self):
        super().__init__()
        vgg = models.vgg19(weights=models.VGG19_Weights.IMAGENET1K_V1).features
        vgg = vgg.to(device).eval()

        # Freeze all parameters
        for param in vgg.parameters():
            param.requires_grad_(False)

        # Split VGG into blocks at relevant layers
        # VGG-19 structure: conv, relu, conv, relu, pool, ...
        self.slices = nn.ModuleList()
        # Layer indices for: conv1_1, conv2_1, conv3_1, conv4_1, conv4_2, conv5_1
        slice_points = [0, 5, 10, 19, 21, 28]

        for i in range(len(slice_points) - 1):
            self.slices.append(
                nn.Sequential(*list(vgg.children())[slice_points[i]:slice_points[i+1]])
            )

    def forward(self, x):
        features = []
        for slice_module in self.slices:
            x = slice_module(x)
            features.append(x)
        return features

vgg_features = VGGFeatures().to(device)
```

### Gram Matrix Computation

```python
def gram_matrix(features):
    """
    Compute Gram matrix for style representation.

    Args:
        features: tensor of shape (batch, channels, height, width)

    Returns:
        Gram matrix of shape (batch, channels, channels)
    """
    batch, channels, height, width = features.size()
    # Reshape to (batch, channels, height*width)
    F = features.view(batch, channels, height * width)
    # Gram matrix: F * F^T
    G = torch.bmm(F, F.transpose(1, 2))
    # Normalize by number of elements
    G = G / (channels * height * width)
    return G
```

### Loss Functions

```python
def content_loss(generated_features, content_features):
    """
    Compute content loss using conv4_2 features.
    Index 3 corresponds to conv4_2 in our feature extractor.
    """
    return nn.functional.mse_loss(generated_features[3], content_features[3])


def style_loss(generated_features, style_features):
    """
    Compute style loss across multiple layers.
    Uses conv1_1, conv2_1, conv3_1, conv4_1, conv5_1.
    """
    style_layers = [0, 1, 2, 3, 4]  # All extracted layers
    layer_weights = [1.0 / len(style_layers)] * len(style_layers)

    loss = 0
    for i, weight in zip(style_layers, layer_weights):
        G_gen = gram_matrix(generated_features[i])
        G_style = gram_matrix(style_features[i])
        loss += weight * nn.functional.mse_loss(G_gen, G_style)

    return loss
```

### Optimization Loop

```python
# Extract target features (compute once)
with torch.no_grad():
    content_features = vgg_features(content_img)
    style_features = vgg_features(style_img)

# Initialize generated image (start from content image)
generated = content_img.clone().requires_grad_(True)

# Hyperparameters
alpha = 1          # Content weight
beta = 1e6         # Style weight
num_steps = 300
learning_rate = 0.01

# Optimizer updates the image pixels
optimizer = optim.Adam([generated], lr=learning_rate)

# Optimization loop
print("Running style transfer...")
for step in range(num_steps):
    optimizer.zero_grad()

    # Extract features from generated image
    gen_features = vgg_features(generated)

    # Compute losses
    c_loss = content_loss(gen_features, content_features)
    s_loss = style_loss(gen_features, style_features)
    total_loss = alpha * c_loss + beta * s_loss

    # Backprop to image pixels
    total_loss.backward()
    optimizer.step()

    if (step + 1) % 50 == 0:
        print(f"Step [{step+1}/{num_steps}] "
              f"Content Loss: {c_loss.item():.4f} "
              f"Style Loss: {s_loss.item():.6f} "
              f"Total Loss: {total_loss.item():.4f}")

print("Style transfer complete!")
```

### Display Results

```python
def show_images(content, style, generated):
    """Display content, style, and result side by side."""
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    images = [content, style, generated]
    titles = ["Content", "Style", "Generated"]

    for ax, img, title in zip(axes, images, titles):
        img = denormalize(img).squeeze(0)
        img = img.permute(1, 2, 0).cpu().detach().numpy()
        ax.imshow(img)
        ax.set_title(title, fontsize=14)
        ax.axis("off")

    plt.tight_layout()
    plt.show()

show_images(content_img, style_img, generated)
```

---

## Using L-BFGS Optimizer

The original paper uses L-BFGS, which often produces better results:

```python
# L-BFGS requires a closure function
generated = content_img.clone().requires_grad_(True)
optimizer = optim.LBFGS([generated], max_iter=20)

num_steps = 100
step_count = [0]

def closure():
    optimizer.zero_grad()
    gen_features = vgg_features(generated)
    c_loss = content_loss(gen_features, content_features)
    s_loss = style_loss(gen_features, style_features)
    total = alpha * c_loss + beta * s_loss
    total.backward()

    step_count[0] += 1
    if step_count[0] % 20 == 0:
        print(f"Step {step_count[0]}: Loss = {total.item():.4f}")
    return total

for _ in range(num_steps):
    optimizer.step(closure)
    # Clamp pixel values
    with torch.no_grad():
        generated.clamp_(-2.5, 2.5)  # Approximate valid range after normalization
```

---

## Controlling the Result

### Adjusting Content vs Style Balance

| $\alpha / \beta$ Ratio | Effect |
|------------------------|--------|
| High α, Low β | More photorealistic, subtle style |
| Low α, High β | Abstract, heavily stylized |
| Equal | Balanced blend |

```python
# More content-preserving
alpha, beta = 10, 1e4

# More stylized
alpha, beta = 1, 1e7

# Balanced
alpha, beta = 1, 1e5
```

### Layer Choice Effects

```python
# Using early layer for content → preserves textures
# Using deep layer for content → preserves structure only

# Using only early layers for style → fine textures
# Using all layers for style → both texture and large patterns
```

---

## Total Variation Loss (Optional)

Adding total variation loss reduces noise and produces smoother results:

$$L_{TV} = \sum_{i,j} \left[(x_{i+1,j} - x_{i,j})^2 + (x_{i,j+1} - x_{i,j})^2\right]$$

```python
def total_variation_loss(image):
    """Encourage spatial smoothness."""
    diff_h = torch.sum(torch.abs(image[:, :, 1:, :] - image[:, :, :-1, :]))
    diff_w = torch.sum(torch.abs(image[:, :, :, 1:] - image[:, :, :, :-1]))
    return diff_h + diff_w

# Add to total loss
gamma = 1e-5  # TV weight
total_loss = alpha * c_loss + beta * s_loss + gamma * total_variation_loss(generated)
```

---

## Fast Neural Style Transfer

The optimization approach is slow (minutes per image). **Fast style transfer** (Johnson et al., 2016) trains a feedforward network for a single style:

### How It Works

1. Train a style-transfer network on many content images with one fixed style
2. At inference: single forward pass → styled image (real-time)

### Architecture

```
Input Image → [Style Transfer Network] → Styled Image
                      ↑
        Trained with perceptual loss
        (content + style from VGG)
```

| Aspect | Optimization-based | Fast Style Transfer |
|--------|-------------------|-------------------|
| Speed | Minutes per image | Milliseconds |
| Styles | Any style, no training | One network per style |
| Quality | Higher | Slightly lower |
| Flexibility | Maximum | Fixed to trained style |

### Fast Style Transfer Network (Simplified)

```python
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.InstanceNorm2d(channels),
            nn.ReLU(),
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.InstanceNorm2d(channels)
        )

    def forward(self, x):
        return x + self.block(x)


class StyleTransferNet(nn.Module):
    """Fast style transfer network (one style)."""

    def __init__(self):
        super().__init__()
        # Downsampling
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 9, padding=4),
            nn.InstanceNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU()
        )

        # Residual blocks
        self.residuals = nn.Sequential(
            *[ResidualBlock(128) for _ in range(5)]
        )

        # Upsampling
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1,
                               output_padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1,
                               output_padding=1),
            nn.InstanceNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 3, 9, padding=4),
            nn.Tanh()
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.residuals(x)
        x = self.decoder(x)
        return x
```

---

## Style Transfer Tips

| Tip | Explanation |
|-----|-------------|
| Start from content image | Converges faster than random noise |
| Use image size 256-512 | Larger = better detail but slower |
| Run 300-500 steps | Usually sufficient for convergence |
| Experiment with β | Style weight has the biggest impact |
| Try different style layers | Changes which textures are transferred |
| Use total variation loss | Smoother, less noisy output |

---

## Try It Yourself

1. Try different content/style weight ratios — find the sweet spot
2. Use only early VGG layers for style — how does the texture change?
3. Start from random noise instead of the content image — what happens?
4. Try total variation loss with different γ values
5. Use multiple style images (average their Gram matrices)

---

## Summary

- Neural style transfer separates content and style using CNN features
- Content is captured by deep layer activations (what objects are present)
- Style is captured by Gram matrices (how textures are distributed)
- Total loss: $L = \alpha L_{content} + \beta L_{style}$
- VGG-19 features are used without retraining — only the image is optimized
- Fast style transfer trains a network for real-time single-style application
- The $\beta/\alpha$ ratio controls how much style dominates over content

This completes our exploration of generative deep learning! From GANs to diffusion models to style transfer, these techniques enable machines to create new visual content.
