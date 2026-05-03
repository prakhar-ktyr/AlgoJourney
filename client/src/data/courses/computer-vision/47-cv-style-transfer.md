---
title: Style Transfer & Image Manipulation
---

# Style Transfer & Image Manipulation

**Neural style transfer** lets you combine the **content** of one image with the **artistic style** of another. Imagine turning your vacation photo into a Van Gogh painting!

---

## How Style Transfer Works

The key insight: deep CNN layers capture different information:
- **Early layers**: textures, colors, patterns (style)
- **Deep layers**: objects, structure, arrangement (content)

We can separate and recombine these aspects.

---

## Gatys et al. (2015) — Optimization-Based

The original neural style transfer approach optimizes the output image directly.

### Overview

1. Take a **content image** (your photo)
2. Take a **style image** (a painting)
3. Start with random noise (or the content image)
4. Optimize the output to minimize both content and style loss

### Content Loss

Measures how similar the content is between the output and content image at a high-level feature layer:

$$L_{content} = \frac{1}{2}\sum_{i,j}(F_{ij}^l - P_{ij}^l)^2$$

Where:
- $F^l$ = feature map of the generated image at layer $l$
- $P^l$ = feature map of the content image at layer $l$
- We typically use `conv4_2` from VGG-19

### Style Loss (Gram Matrix)

Style is captured by the **correlations between features** (Gram matrix):

$$G_{ij}^l = \sum_k F_{ik}^l F_{jk}^l$$

The Gram matrix tells us which features tend to activate together — this encodes texture and style information.

Style loss compares Gram matrices across multiple layers:

$$L_{style} = \sum_l w_l \frac{1}{4N_l^2 M_l^2} \sum_{i,j}(G_{ij}^l - A_{ij}^l)^2$$

Where:
- $N_l$ = number of feature maps in layer $l$
- $M_l$ = spatial size (height × width) of feature maps
- $A^l$ = Gram matrix of the style image
- $w_l$ = weight for layer $l$

### Total Loss

$$L_{total} = \alpha \cdot L_{content} + \beta \cdot L_{style}$$

- $\alpha$ controls content preservation (higher = more like original photo)
- $\beta$ controls style strength (higher = more artistic)
- Typical ratio: $\beta / \alpha = 1000$ to $10000$

---

## Code: Neural Style Transfer with VGG-19

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Image preprocessing
def load_image(path, max_size=512):
    image = Image.open(path).convert("RGB")
    # Resize to max_size while keeping aspect ratio
    ratio = max_size / max(image.size)
    new_size = tuple(int(dim * ratio) for dim in image.size)
    image = image.resize(new_size, Image.LANCZOS)

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0).to(device)


def gram_matrix(features):
    """Compute the Gram matrix for style representation."""
    b, c, h, w = features.size()
    features = features.view(b, c, h * w)
    gram = torch.bmm(features, features.transpose(1, 2))
    return gram / (c * h * w)


class StyleTransferModel(nn.Module):
    """Extract features from VGG-19 at specific layers."""

    def __init__(self):
        super().__init__()
        vgg = models.vgg19(weights=models.VGG19_Weights.DEFAULT).features.eval()

        # Layers for style and content extraction
        self.content_layers = [21]        # conv4_2
        self.style_layers = [0, 5, 10, 19, 28]  # conv1_1 to conv5_1

        self.slices = nn.ModuleList()
        prev = 0
        all_layers = sorted(set(self.content_layers + self.style_layers))
        for layer_idx in all_layers:
            self.slices.append(vgg[prev:layer_idx + 1])
            prev = layer_idx + 1

        # Freeze VGG parameters
        for param in self.parameters():
            param.requires_grad = False

    def forward(self, x):
        features = []
        for slice_net in self.slices:
            x = slice_net(x)
            features.append(x)
        return features


def style_transfer(content_path, style_path, num_steps=300,
                   alpha=1, beta=1e6):
    """Perform neural style transfer."""
    # Load images
    content_img = load_image(content_path)
    style_img = load_image(style_path)

    # Initialize output with content image
    output_img = content_img.clone().requires_grad_(True)

    # Feature extractor
    model = StyleTransferModel().to(device)

    # Get target features
    content_features = model(content_img)
    style_features = model(style_img)

    # Compute target Gram matrices for style
    style_grams = [gram_matrix(f) for f in style_features]

    # Optimizer (optimize the image pixels!)
    optimizer = optim.Adam([output_img], lr=0.01)

    for step in range(num_steps):
        optimizer.zero_grad()

        output_features = model(output_img)

        # Content loss (from the content layer)
        content_loss = nn.functional.mse_loss(
            output_features[3], content_features[3]  # conv4_2
        )

        # Style loss (from multiple style layers)
        style_loss = 0
        for i, layer_idx in enumerate([0, 1, 2, 3, 4]):
            output_gram = gram_matrix(output_features[layer_idx])
            style_loss += nn.functional.mse_loss(
                output_gram, style_grams[i]
            )
        style_loss /= 5

        # Total loss
        total_loss = alpha * content_loss + beta * style_loss
        total_loss.backward()
        optimizer.step()

        if (step + 1) % 50 == 0:
            print(f"Step [{step+1}/{num_steps}] | "
                  f"Content: {content_loss:.4f} | "
                  f"Style: {style_loss:.4f} | "
                  f"Total: {total_loss:.4f}")

    return output_img


# Run style transfer
# result = style_transfer("photo.jpg", "starry_night.jpg")
```

---

## Fast Style Transfer

The Gatys method is **slow** because it optimizes per image. Fast style transfer trains a **feed-forward network** once per style, enabling real-time inference.

### Johnson et al. Architecture

```python
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.InstanceNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.InstanceNorm2d(channels),
        )

    def forward(self, x):
        return x + self.block(x)


class FastStyleNet(nn.Module):
    """Feed-forward style transfer network."""

    def __init__(self):
        super().__init__()
        # Downsampling
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 9, padding=4),
            nn.InstanceNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, 3, stride=2, padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(inplace=True),
        )

        # Residual blocks
        self.residuals = nn.Sequential(*[ResidualBlock(128) for _ in range(5)])

        # Upsampling
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 3, 9, padding=4),
            nn.Tanh()
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.residuals(x)
        x = self.decoder(x)
        return x
```

**Key advantage:** Once trained for a specific style, inference takes a single forward pass (~15ms per image).

---

## AdaIN (Adaptive Instance Normalization)

AdaIN enables **arbitrary style transfer** — use any style image without retraining!

### The Formula

$$\text{AdaIN}(x, y) = \sigma(y) \cdot \frac{x - \mu(x)}{\sigma(x)} + \mu(y)$$

Where:
- $x$ = content features
- $y$ = style features
- $\mu$, $\sigma$ = channel-wise mean and standard deviation

### How It Works

```python
class AdaIN(nn.Module):
    """Adaptive Instance Normalization for arbitrary style transfer."""

    def forward(self, content_feat, style_feat):
        # Compute statistics per channel
        c_mean = content_feat.mean(dim=[2, 3], keepdim=True)
        c_std = content_feat.std(dim=[2, 3], keepdim=True) + 1e-5

        s_mean = style_feat.mean(dim=[2, 3], keepdim=True)
        s_std = style_feat.std(dim=[2, 3], keepdim=True) + 1e-5

        # Normalize content, then apply style statistics
        normalized = (content_feat - c_mean) / c_std
        stylized = normalized * s_std + s_mean
        return stylized


class ArbitraryStyleTransfer(nn.Module):
    """Arbitrary style transfer using AdaIN."""

    def __init__(self):
        super().__init__()
        # Use VGG encoder (up to relu4_1)
        vgg = models.vgg19(weights=models.VGG19_Weights.DEFAULT).features[:21]
        self.encoder = vgg
        for param in self.encoder.parameters():
            param.requires_grad = False

        self.adain = AdaIN()

        # Decoder (mirror of encoder)
        self.decoder = nn.Sequential(
            nn.Conv2d(512, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Upsample(scale_factor=2),
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 128, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Upsample(scale_factor=2),
            nn.Conv2d(128, 64, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Upsample(scale_factor=2),
            nn.Conv2d(64, 3, 3, padding=1),
        )

    def forward(self, content, style, alpha=1.0):
        content_feat = self.encoder(content)
        style_feat = self.encoder(style)
        stylized_feat = self.adain(content_feat, style_feat)

        # Blend with content features for control
        blended = alpha * stylized_feat + (1 - alpha) * content_feat
        return self.decoder(blended)
```

> **Tip:** The `alpha` parameter controls style strength. Use `alpha=0.5` for a subtle effect.

---

## Image Manipulation Techniques

### Colorization (Grayscale → Color)

```python
# Concept: predict a/b channels from L channel (LAB color space)
class ColorizationNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 64, 3, padding=1),   # L channel input
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 256, 3, stride=2, padding=1),
            nn.ReLU(inplace=True),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 2, 3, padding=1),  # Predict a, b channels
            nn.Tanh()
        )

    def forward(self, lightness):
        features = self.encoder(lightness)
        ab_channels = self.decoder(features)
        return ab_channels
```

### Image Harmonization

When you paste an object from one image into another, the colors often look wrong. Image harmonization **adjusts the composited region** to match the background lighting and color.

### Deepfakes (Awareness)

Face-swapping technology uses autoencoders or GANs to replace faces in videos. Understanding this technology helps detect and prevent misuse.

---

## Style Transfer Comparison

| Method | Speed | Flexibility | Quality |
|--------|-------|-------------|---------|
| Gatys (optimization) | Slow (~minutes) | Any style | High |
| Johnson (fast) | Real-time | One style per model | Good |
| AdaIN | Real-time | Any style | Good |
| Diffusion-based | Slow (~seconds) | Text-guided | Excellent |

---

## Practical Tips

1. **Content-style balance**: Start with $\alpha=1$, $\beta=1e5$ and adjust
2. **Higher resolution**: Process in tiles for large images
3. **Style layer weights**: Give more weight to early layers for texture, later layers for structure
4. **Preprocessing**: Both images should be similar in scale for best results
5. **InstanceNorm > BatchNorm**: For style transfer networks, instance normalization works better

---

## Try It Yourself

1. Run the Gatys-style transfer code with different $\alpha/\beta$ ratios
2. Try different VGG layers for content — what changes?
3. Use AdaIN with `alpha=0.3` vs `alpha=1.0` — compare results
4. Apply style transfer to a video (frame by frame)

---

## Summary

- **Neural style transfer** separates content and style using CNN feature representations
- **Gram matrices** capture style as feature correlations
- **Fast style transfer** uses a trained feed-forward network for real-time results
- **AdaIN** enables arbitrary style transfer without retraining
- **Image manipulation** includes colorization, harmonization, and face editing
- Always consider ethical implications of image manipulation technology

Next, we will explore **image super-resolution** — making low-resolution images look sharp and detailed!
