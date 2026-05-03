---
title: Vision Transformers
---

# Vision Transformers

In this lesson, you will learn how the Transformer architecture — originally designed for NLP — was adapted for computer vision, achieving state-of-the-art results on image classification, detection, and segmentation.

---

## From NLP to Vision

The Transformer architecture (Vaswani et al., 2017) revolutionized NLP with self-attention. The key insight for vision:

| NLP | Vision (ViT) |
|-----|-------------|
| Sentence | Image |
| Word token | Image patch |
| Word embedding | Patch embedding |
| Positional encoding | Position embedding |
| [CLS] token | [CLS] token for classification |

> **Key idea:** Treat an image as a sequence of patches, just like a sentence is a sequence of words.

---

## ViT (Vision Transformer, 2020)

The original Vision Transformer by Dosovitskiy et al.

### Architecture Overview

1. Split image into fixed-size patches (e.g., 16×16 pixels)
2. Flatten each patch and project to embedding dimension
3. Add learnable position embeddings
4. Prepend a learnable [CLS] token
5. Feed through standard Transformer encoder
6. Use [CLS] output for classification via MLP head

### Patch Embedding

For an image of size $H \times W$ with patch size $P$:

- Number of patches: $N = \frac{H \times W}{P^2}$
- For 224×224 image with 16×16 patches: $N = \frac{224 \times 224}{16 \times 16} = 196$ patches

Each patch is flattened to a vector of size $P^2 \times C$ (where $C$ = channels), then linearly projected:

$$z_0 = [x_{\text{class}};\; x_1^p E;\; x_2^p E;\; \ldots;\; x_N^p E] + E_{\text{pos}}$$

where:
- $x_{\text{class}}$ is the learnable [CLS] token
- $E \in \mathbb{R}^{(P^2 \cdot C) \times D}$ is the patch projection matrix
- $E_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}$ are position embeddings

### ViT Variants

| Model | Layers | Hidden Dim | Heads | Params |
|-------|--------|-----------|-------|--------|
| ViT-Base/16 | 12 | 768 | 12 | 86M |
| ViT-Large/16 | 24 | 1024 | 16 | 307M |
| ViT-Huge/14 | 32 | 1280 | 16 | 632M |

### Key Findings

- ViT needs **large-scale pre-training** (ImageNet-21K or JFT-300M)
- With enough data, ViT outperforms CNNs
- With limited data (ImageNet-1K only), CNNs still win due to inductive biases
- Position embeddings learn a 2D structure despite being 1D

### Code: Simplified ViT from Scratch

```python
import torch
import torch.nn as nn


class PatchEmbedding(nn.Module):
    """Split image into patches and project to embedding dimension."""

    def __init__(self, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
        super().__init__()
        self.img_size = img_size
        self.patch_size = patch_size
        self.n_patches = (img_size // patch_size) ** 2

        # Conv2d is equivalent to patch extraction + linear projection
        self.projection = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size, stride=patch_size
        )

    def forward(self, x):
        # x: (B, C, H, W)
        x = self.projection(x)  # (B, embed_dim, H/P, W/P)
        x = x.flatten(2)        # (B, embed_dim, n_patches)
        x = x.transpose(1, 2)   # (B, n_patches, embed_dim)
        return x


class MultiHeadAttention(nn.Module):
    """Multi-head self-attention."""

    def __init__(self, embed_dim=768, n_heads=12, dropout=0.0):
        super().__init__()
        self.n_heads = n_heads
        self.head_dim = embed_dim // n_heads
        self.scale = self.head_dim ** -0.5

        self.qkv = nn.Linear(embed_dim, embed_dim * 3)
        self.proj = nn.Linear(embed_dim, embed_dim)
        self.attn_dropout = nn.Dropout(dropout)
        self.proj_dropout = nn.Dropout(dropout)

    def forward(self, x):
        B, N, D = x.shape

        # Compute Q, K, V
        qkv = self.qkv(x).reshape(B, N, 3, self.n_heads, self.head_dim)
        qkv = qkv.permute(2, 0, 3, 1, 4)  # (3, B, heads, N, head_dim)
        q, k, v = qkv.unbind(0)

        # Scaled dot-product attention
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        attn = self.attn_dropout(attn)

        # Apply attention to values
        x = (attn @ v).transpose(1, 2).reshape(B, N, D)
        x = self.proj(x)
        x = self.proj_dropout(x)
        return x


class TransformerBlock(nn.Module):
    """Transformer encoder block."""

    def __init__(self, embed_dim=768, n_heads=12, mlp_ratio=4.0, dropout=0.0):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = MultiHeadAttention(embed_dim, n_heads, dropout)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, int(embed_dim * mlp_ratio)),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(int(embed_dim * mlp_ratio), embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        x = x + self.attn(self.norm1(x))
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
        n_heads=12,
        mlp_ratio=4.0,
        dropout=0.1,
    ):
        super().__init__()

        # Patch embedding
        self.patch_embed = PatchEmbedding(
            img_size, patch_size, in_channels, embed_dim
        )
        n_patches = self.patch_embed.n_patches

        # Learnable [CLS] token and position embeddings
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, n_patches + 1, embed_dim))
        self.pos_dropout = nn.Dropout(dropout)

        # Transformer encoder blocks
        self.blocks = nn.Sequential(*[
            TransformerBlock(embed_dim, n_heads, mlp_ratio, dropout)
            for _ in range(depth)
        ])

        # Classification head
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)

        # Initialize weights
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        nn.init.trunc_normal_(self.cls_token, std=0.02)

    def forward(self, x):
        B = x.shape[0]

        # Patch embedding
        x = self.patch_embed(x)  # (B, n_patches, embed_dim)

        # Prepend [CLS] token
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)  # (B, n_patches + 1, embed_dim)

        # Add position embeddings
        x = x + self.pos_embed
        x = self.pos_dropout(x)

        # Transformer encoder
        x = self.blocks(x)

        # Classification: use [CLS] token output
        x = self.norm(x)
        cls_output = x[:, 0]  # (B, embed_dim)
        logits = self.head(cls_output)  # (B, num_classes)

        return logits


# Create ViT-Base/16
model = VisionTransformer(
    img_size=224,
    patch_size=16,
    num_classes=1000,
    embed_dim=768,
    depth=12,
    n_heads=12,
)

# Test forward pass
dummy_input = torch.randn(2, 3, 224, 224)
output = model(dummy_input)
print(f"Input shape:  {dummy_input.shape}")
print(f"Output shape: {output.shape}")
print(f"Parameters:   {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")
```

---

## DeiT (Data-efficient Image Transformer)

DeiT (Touvron et al., 2021) makes ViT practical without massive datasets:

### Key Innovations

- **Knowledge distillation** from a CNN teacher (RegNet)
- **Distillation token** alongside [CLS] token
- Strong data augmentation (RandAugment, Mixup, CutMix)
- Works with **ImageNet-1K alone** (no JFT-300M needed)

### Results

| Model | Pre-training Data | Top-1 Acc |
|-------|------------------|-----------|
| ViT-B/16 | ImageNet-1K | 77.9% |
| DeiT-B/16 | ImageNet-1K | 81.8% |
| DeiT-B/16 ⚗ | ImageNet-1K + distill | 83.4% |

---

## Swin Transformer

The Swin Transformer (Liu et al., 2021) introduces **hierarchy** and **locality** to vision transformers:

### Key Ideas

1. **Hierarchical feature maps** (like CNNs): progressively reduce spatial resolution
2. **Window attention**: compute attention only within local windows (e.g., 7×7 patches)
3. **Shifted windows**: alternate between regular and shifted window partitions for cross-window connection

### Complexity Comparison

- **ViT:** Global attention has quadratic complexity: $O(N^2)$ where $N = (H/P)^2$
- **Swin:** Window attention has linear complexity: $O(N \cdot M^2)$ where $M$ = window size

For a 224×224 image with 4×4 patches:
- ViT: attention over 3,136 tokens (global)
- Swin: attention over 49 tokens per window (local)

### Architecture Stages

| Stage | Resolution | Channels | Description |
|-------|-----------|----------|-------------|
| 1 | H/4 × W/4 | C | Patch partition + linear embed |
| 2 | H/8 × W/8 | 2C | Patch merging + Swin blocks |
| 3 | H/16 × W/16 | 4C | Patch merging + Swin blocks |
| 4 | H/32 × W/32 | 8C | Patch merging + Swin blocks |

### Why Swin Excels at Dense Tasks

- Hierarchical features enable FPN-style detection/segmentation
- Swin-L achieves 58.7 box AP on COCO (state-of-the-art)
- 53.5 mIoU on ADE20K segmentation

---

## Other Vision Transformers

### PVT (Pyramid Vision Transformer)

- Hierarchical transformer with spatial reduction attention
- Reduces key/value spatial dimensions to save computation
- Good backbone for detection frameworks

### CvT (Convolutional Vision Transformer)

- Adds convolutions inside the transformer
- Convolutional token embedding + convolutional projection in attention
- No position embedding needed (conv provides position info)

### BEiT (BERT Pre-training for Vision)

- Masked image modeling (like BERT for NLP)
- Tokenize image patches into discrete visual tokens (using dVAE)
- Mask some patches, predict their tokens
- Strong self-supervised pre-training

### MAE (Masked Autoencoder)

- Mask 75% of image patches randomly
- Encoder processes only visible (25%) patches — very efficient
- Lightweight decoder reconstructs pixel values
- State-of-the-art self-supervised method for ViT

---

## CNN vs Transformer Comparison

| Property | CNN | Vision Transformer |
|----------|-----|-------------------|
| **Inductive bias** | Strong (locality, translation invariance) | Weak (learns from data) |
| **Data efficiency** | Better with small datasets | Needs large datasets |
| **Scalability** | Saturates at extreme scale | Scales well with data + compute |
| **Receptive field** | Grows gradually with depth | Global from layer 1 |
| **Computation** | Fixed per layer | Quadratic in sequence length |
| **Feature hierarchy** | Natural (pool → reduce resolution) | Flat (ViT) or designed (Swin) |
| **Position sensitivity** | Built-in (conv is translation equivariant) | Requires position embeddings |

### ConvNeXt: CNN Matching Transformers

ConvNeXt (Liu et al., 2022) modernizes ResNet with transformer-era techniques:

- Larger kernels (7×7), fewer blocks, LayerNorm, GELU
- Matches Swin Transformer accuracy while being a pure CNN
- Shows CNNs are not inherently inferior — training recipes matter

---

## Using Pretrained Vision Transformers

### With timm Library

```python
import timm
import torch

# List available ViT models
vit_models = timm.list_models("vit_*", pretrained=True)
print(f"Available ViT models: {len(vit_models)}")

# Load pretrained ViT-Base/16
model = timm.create_model("vit_base_patch16_224", pretrained=True)
model.eval()

# Get model info
data_config = timm.data.resolve_model_data_config(model)
print(f"Input size: {data_config['input_size']}")
print(f"Mean: {data_config['mean']}")
print(f"Std: {data_config['std']}")

# Create transform
transform = timm.data.create_transform(**data_config, is_training=False)

# Inference
from PIL import Image
image = Image.open("cat.jpg").convert("RGB")
input_tensor = transform(image).unsqueeze(0)

with torch.no_grad():
    output = model(input_tensor)
    probabilities = torch.softmax(output, dim=1)
    top5_prob, top5_idx = probabilities.topk(5)

print("Top-5 predictions:")
for prob, idx in zip(top5_prob[0], top5_idx[0]):
    print(f"  Class {idx.item()}: {prob.item():.4f}")
```

### Fine-tuning ViT

```python
import timm
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


def create_vit_classifier(num_classes, model_name="vit_base_patch16_224"):
    """Create a ViT model fine-tuned for custom classification."""
    # Load pretrained model
    model = timm.create_model(model_name, pretrained=True)

    # Replace classification head
    in_features = model.head.in_features
    model.head = nn.Linear(in_features, num_classes)

    # Optionally freeze backbone (for linear probing)
    # for param in model.parameters():
    #     param.requires_grad = False
    # for param in model.head.parameters():
    #     param.requires_grad = True

    return model


def train_vit(model, train_loader, val_loader, epochs=10, lr=1e-4):
    """Fine-tune ViT on custom dataset."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    # Use lower learning rate for pretrained layers
    optimizer = torch.optim.AdamW([
        {"params": model.head.parameters(), "lr": lr},
        {"params": [p for n, p in model.named_parameters()
                    if "head" not in n], "lr": lr * 0.1},
    ], weight_decay=0.05)

    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, epochs)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

        scheduler.step()
        train_acc = 100.0 * correct / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()

        val_acc = 100.0 * val_correct / val_total
        print(f"Epoch {epoch+1}/{epochs} | "
              f"Loss: {total_loss/len(train_loader):.4f} | "
              f"Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")


# Usage
model = create_vit_classifier(num_classes=10)
print(f"Total parameters: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")
print(f"Trainable: {sum(p.numel() for p in model.parameters() if p.requires_grad) / 1e6:.1f}M")
```

### With Hugging Face Transformers

```python
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch

# Load model and processor
processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTForImageClassification.from_pretrained("google/vit-base-patch16-224")
model.eval()

# Prepare image
image = Image.open("cat.jpg").convert("RGB")
inputs = processor(images=image, return_tensors="pt")

# Inference
with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
    predicted_class = logits.argmax(-1).item()

print(f"Predicted class: {model.config.id2label[predicted_class]}")
```

---

## Architecture Comparison Table

| Model | Year | Params | ImageNet Top-1 | Key Innovation |
|-------|------|--------|---------------|----------------|
| ViT-B/16 | 2020 | 86M | 77.9% (1K) / 84.2% (21K) | Patches as tokens |
| DeiT-B | 2021 | 86M | 81.8% / 83.4% (distill) | Knowledge distillation |
| Swin-B | 2021 | 88M | 83.5% | Shifted window attention |
| BEiT | 2021 | 86M | 83.2% | Masked token prediction |
| MAE | 2022 | 86M | 83.6% | Masked pixel reconstruction |
| ViT-G/14 | 2022 | 1.8B | 90.5% | Scale (JFT-3B data) |
| ConvNeXt-B | 2022 | 89M | 83.8% | Modernized CNN |

---

## Summary

- **ViT** proved transformers work for vision but needs large data
- **DeiT** made ViT practical on ImageNet-1K via distillation
- **Swin** added hierarchy and locality for dense prediction tasks
- **MAE/BEiT** enabled powerful self-supervised pre-training
- CNNs and Transformers are converging — both can achieve similar results with modern training
- Use `timm` or Hugging Face for easy access to pretrained models

---
