---
title: Vision Transformers
---

# Vision Transformers (ViT)

Transformers revolutionized NLP. **Vision Transformers (ViT)** bring the same architecture to computer vision — treating images as sequences of patches instead of using convolutions.

---

## The Idea: Images as Sequences

CNNs process images with local receptive fields (kernels). Transformers process **sequences** with global self-attention.

**Key insight**: split an image into fixed-size patches, treat each patch as a "token," and feed the sequence into a standard transformer encoder.

$$\text{Image} \rightarrow \text{Patches} \rightarrow \text{Linear Projection} \rightarrow \text{Transformer Encoder} \rightarrow \text{Classification}$$

---

## Patch Embedding

The first step is converting a 2D image into a 1D sequence of patch embeddings.

### How It Works

1. **Split** the image into non-overlapping patches of size $P \times P$
2. **Flatten** each patch into a vector of length $P^2 \times C$ (where $C$ = channels)
3. **Project** each flattened patch into a $D$-dimensional embedding

For a $224 \times 224$ image with patch size $P = 16$:

$$N = \frac{H \times W}{P^2} = \frac{224 \times 224}{16 \times 16} = 196 \text{ patches}$$

Each patch becomes a vector of length $16 \times 16 \times 3 = 768$ (for RGB), then projected to embedding dimension $D$.

```python
import torch
import torch.nn as nn

class PatchEmbedding(nn.Module):
    """Split image into patches and project to embedding dimension."""

    def __init__(self, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
        super().__init__()
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) ** 2

        # Conv2d with kernel_size=stride=patch_size acts as patch extraction + projection
        self.projection = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size, stride=patch_size
        )

    def forward(self, x):
        # x: (batch, channels, height, width)
        x = self.projection(x)       # (batch, embed_dim, H/P, W/P)
        x = x.flatten(2)             # (batch, embed_dim, num_patches)
        x = x.transpose(1, 2)        # (batch, num_patches, embed_dim)
        return x

# Example
patch_embed = PatchEmbedding()
img = torch.randn(1, 3, 224, 224)
patches = patch_embed(img)
print(patches.shape)  # torch.Size([1, 196, 768])
```

> **Note:** Using `nn.Conv2d` with `kernel_size=patch_size` and `stride=patch_size` is equivalent to extracting patches and applying a linear projection — but more efficient!

---

## [CLS] Token for Classification

Like BERT, ViT prepends a special **[CLS] token** to the patch sequence. After passing through the transformer, this token's output is used for classification.

$$\text{Input} = [\texttt{CLS}, \; p_1, \; p_2, \; \ldots, \; p_N]$$

The [CLS] token is a learnable embedding that aggregates information from all patches via self-attention.

```python
class CLSToken(nn.Module):
    """Prepend a learnable [CLS] token to the patch sequence."""

    def __init__(self, embed_dim=768):
        super().__init__()
        self.cls_token = nn.Parameter(torch.randn(1, 1, embed_dim))

    def forward(self, x):
        # x: (batch, num_patches, embed_dim)
        batch_size = x.shape[0]
        cls_tokens = self.cls_token.expand(batch_size, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)  # (batch, 1 + num_patches, embed_dim)
        return x
```

After the transformer, we take position 0 (the [CLS] token) for classification:

```python
# After transformer encoder
output = transformer(x)        # (batch, 1 + num_patches, embed_dim)
cls_output = output[:, 0, :]   # (batch, embed_dim) — the CLS token
logits = classifier(cls_output)
```

---

## Position Embeddings

Self-attention is **permutation invariant** — it doesn't know the order of tokens. We must add **positional information** so the model knows where each patch is located.

ViT uses **learnable 1D position embeddings** added to the patch embeddings:

$$z_0 = [x_{\text{cls}} ; \; x_1 E ; \; x_2 E ; \; \ldots ; \; x_N E] + E_{\text{pos}}$$

Where:
- $E$ is the patch projection matrix
- $E_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}$ are learnable position embeddings

```python
class PositionEmbedding(nn.Module):
    """Add learnable position embeddings to patch sequence."""

    def __init__(self, num_patches, embed_dim=768):
        super().__init__()
        # +1 for [CLS] token
        self.pos_embed = nn.Parameter(
            torch.randn(1, num_patches + 1, embed_dim) * 0.02
        )

    def forward(self, x):
        # x: (batch, num_patches + 1, embed_dim)
        return x + self.pos_embed
```

> **Why not 2D?** The original ViT paper found that 1D positional embeddings work just as well as 2D embeddings. The model learns spatial relationships from data.

---

## ViT Architecture

The full ViT architecture:

```
Input Image (224×224×3)
    │
    ▼
Patch Embedding (196 patches × 768)
    │
    ▼
Prepend [CLS] Token (197 × 768)
    │
    ▼
Add Position Embeddings (197 × 768)
    │
    ▼
Transformer Encoder (L layers)
  ├── Layer Norm
  ├── Multi-Head Self-Attention
  ├── Residual Connection
  ├── Layer Norm
  ├── MLP (Feed-Forward)
  └── Residual Connection
    │
    ▼
Take [CLS] output (768)
    │
    ▼
Classification Head → Logits
```

### Complete ViT Implementation

```python
import torch
import torch.nn as nn

class TransformerBlock(nn.Module):
    """Single transformer encoder block."""

    def __init__(self, embed_dim=768, num_heads=12, mlp_ratio=4.0, dropout=0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = nn.MultiheadAttention(
            embed_dim, num_heads, dropout=dropout, batch_first=True
        )
        self.norm2 = nn.LayerNorm(embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, int(embed_dim * mlp_ratio)),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(int(embed_dim * mlp_ratio), embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        # Self-attention with residual
        x_norm = self.norm1(x)
        attn_out, _ = self.attn(x_norm, x_norm, x_norm)
        x = x + attn_out

        # MLP with residual
        x = x + self.mlp(self.norm2(x))
        return x


class VisionTransformer(nn.Module):
    """Vision Transformer (ViT) for image classification."""

    def __init__(
        self,
        img_size=224,
        patch_size=16,
        in_channels=3,
        num_classes=1000,
        embed_dim=768,
        depth=12,
        num_heads=12,
        mlp_ratio=4.0,
        dropout=0.1,
    ):
        super().__init__()
        self.num_patches = (img_size // patch_size) ** 2

        # Patch embedding
        self.patch_embed = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size, stride=patch_size
        )

        # [CLS] token and position embeddings
        self.cls_token = nn.Parameter(torch.randn(1, 1, embed_dim) * 0.02)
        self.pos_embed = nn.Parameter(
            torch.randn(1, self.num_patches + 1, embed_dim) * 0.02
        )
        self.pos_drop = nn.Dropout(dropout)

        # Transformer encoder blocks
        self.blocks = nn.Sequential(*[
            TransformerBlock(embed_dim, num_heads, mlp_ratio, dropout)
            for _ in range(depth)
        ])

        # Classification head
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)

    def forward(self, x):
        batch_size = x.shape[0]

        # Patch embedding
        x = self.patch_embed(x)           # (B, embed_dim, H/P, W/P)
        x = x.flatten(2).transpose(1, 2)  # (B, num_patches, embed_dim)

        # Prepend [CLS] token
        cls_tokens = self.cls_token.expand(batch_size, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)  # (B, num_patches+1, embed_dim)

        # Add position embeddings
        x = self.pos_drop(x + self.pos_embed)

        # Transformer encoder
        x = self.blocks(x)

        # Classification from [CLS] token
        x = self.norm(x[:, 0])
        x = self.head(x)
        return x


# Create ViT-Base model
model = VisionTransformer(
    img_size=224,
    patch_size=16,
    num_classes=10,
    embed_dim=768,
    depth=12,
    num_heads=12,
)

# Test forward pass
img = torch.randn(2, 3, 224, 224)
logits = model(img)
print(f"Output shape: {logits.shape}")  # torch.Size([2, 10])

# Count parameters
params = sum(p.numel() for p in model.parameters())
print(f"Parameters: {params / 1e6:.1f}M")  # ~86M for ViT-Base
```

---

## ViT vs CNN Comparison

| Aspect | CNN (e.g., ResNet) | ViT |
|--------|-------------------|-----|
| **Inductive bias** | Local (convolutions) | Global (self-attention) |
| **Small data** | Better (locality helps) | Worse (needs more data) |
| **Large data** | Plateaus | Scales better |
| **Computation** | $O(n)$ per layer | $O(n^2)$ self-attention |
| **Receptive field** | Grows with depth | Global from layer 1 |
| **Translation equivariance** | Built-in | Must be learned |

### Key Takeaways

- **ViTs need more data**: Without large-scale pre-training (ImageNet-21k, JFT-300M), ViTs underperform CNNs on smaller datasets.
- **ViTs scale better**: Given enough data, ViTs outperform CNNs and haven't saturated.
- **Hybrid approaches** work well: Use CNN stem for early features + transformer for later layers.

---

## Notable ViT Variants

### DeiT (Data-efficient Image Transformer)

DeiT trains ViT on ImageNet-1k alone (no external data) using:
- **Strong data augmentation** (RandAugment, Mixup, CutMix)
- **Knowledge distillation** from a CNN teacher
- A special **distillation token** alongside [CLS]

### Swin Transformer

Swin introduces **hierarchical representation** and **shifted windows**:

- Processes images at multiple scales (like feature pyramids)
- Computes self-attention within local windows (reduces $O(n^2)$ cost)
- Shifts windows between layers for cross-window connections
- Works well for detection and segmentation (not just classification)

```
Swin: Hierarchical + Local Attention
┌─────────────────────────┐
│ Stage 1: 56×56, dim=96  │  ← Patch merge (4×4)
├─────────────────────────┤
│ Stage 2: 28×28, dim=192 │  ← Patch merge (2×2)
├─────────────────────────┤
│ Stage 3: 14×14, dim=384 │  ← Patch merge (2×2)
├─────────────────────────┤
│ Stage 4: 7×7, dim=768   │  ← Patch merge (2×2)
└─────────────────────────┘
```

---

## When to Use ViT

| Scenario | Recommendation |
|----------|---------------|
| Small dataset (<10k images) | CNN or fine-tune pre-trained ViT |
| Large dataset (>1M images) | ViT (train from scratch) |
| Transfer learning | Pre-trained ViT (excellent) |
| Object detection | Swin Transformer |
| Mobile/edge deployment | EfficientNet or MobileViT |

---

## Using Pre-trained ViT

In practice, you'll use pre-trained ViT models rather than training from scratch:

```python
import timm

# Load pre-trained ViT-Base with 16×16 patches
model = timm.create_model("vit_base_patch16_224", pretrained=True, num_classes=10)

# Check model configuration
print(f"Patch size: 16")
print(f"Embed dim: {model.embed_dim}")
print(f"Depth: {len(model.blocks)}")
print(f"Num heads: {model.blocks[0].attn.num_heads}")

# Inference
model.eval()
img = torch.randn(1, 3, 224, 224)
with torch.no_grad():
    pred = model(img)
    print(f"Prediction shape: {pred.shape}")
    print(f"Top class: {pred.argmax(dim=1).item()}")
```

### ViT Model Variants

| Model | Layers | Heads | Embed Dim | Params | ImageNet Acc |
|-------|--------|-------|-----------|--------|-------------|
| ViT-Tiny | 12 | 3 | 192 | 5.7M | 72.2% |
| ViT-Small | 12 | 6 | 384 | 22M | 79.9% |
| ViT-Base | 12 | 12 | 768 | 86M | 84.5% |
| ViT-Large | 24 | 16 | 1024 | 307M | 87.1% |
| ViT-Huge | 32 | 16 | 1280 | 632M | 88.6% |

---

## Try It Yourself

1. Modify the `VisionTransformer` class to accept different image sizes
2. Experiment with smaller ViT configs: `embed_dim=256, depth=6, num_heads=8`
3. Add 2D position embeddings instead of 1D
4. Try a hybrid model: replace `patch_embed` with a small CNN

---

## Summary

- **Vision Transformers** treat images as sequences of patches
- **Patch embedding** splits and projects image patches to token embeddings
- **[CLS] token** aggregates global information for classification
- **Position embeddings** provide spatial awareness
- ViTs need large data but scale excellently
- **DeiT** makes ViT practical on smaller datasets
- **Swin Transformer** adds hierarchy and efficiency for dense tasks

---

## Key Equations

| Concept | Formula |
|---------|---------|
| Number of patches | $N = \frac{H \times W}{P^2}$ |
| Patch dimension | $d_{\text{patch}} = P^2 \times C$ |
| Self-attention | $\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$ |
| Input sequence | $z_0 = [x_{\text{cls}}; x_1 E; \ldots; x_N E] + E_{\text{pos}}$ |
