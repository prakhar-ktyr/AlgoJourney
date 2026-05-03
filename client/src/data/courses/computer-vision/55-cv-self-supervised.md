---
title: Self-Supervised Learning for CV
---

# Self-Supervised Learning for CV

In this lesson, you will learn how self-supervised learning (SSL) enables models to learn powerful visual representations from unlabeled images — dramatically reducing the need for expensive manual annotations.

---

## The Labeling Bottleneck

Manual annotation is the biggest bottleneck in computer vision:

| Task | Cost per Image | Time per Image |
|------|---------------|---------------|
| Classification label | $0.01–0.05 | 2–3 sec |
| Bounding boxes (5 objects) | $0.10–0.50 | 30–60 sec |
| Instance segmentation | $1.00–5.00 | 5–30 min |

For ImageNet-scale (1.2M images), labeling costs $50K–$100K. For billion-scale datasets, manual labeling is impossible.

> **Self-supervised learning** creates supervision signals from the data itself — no human labels needed.

---

## How Self-Supervised Learning Works

The general framework:

1. Design a **pretext task** that requires understanding visual content
2. Train on **unlabeled images** using the pretext task
3. The learned representations **transfer** to downstream tasks
4. **Fine-tune** or **linear probe** on small labeled datasets

---

## Pretext Tasks (Early SSL)

Early self-supervised methods designed hand-crafted pretext tasks:

### Jigsaw Puzzles

- Split image into a 3×3 grid (9 patches)
- Shuffle the patches randomly
- Train network to predict the correct permutation
- **Intuition:** Must understand object structure to solve puzzles

### Rotation Prediction

- Rotate image by 0°, 90°, 180°, or 270°
- Train network to predict the rotation angle
- **Intuition:** Must understand object orientation and scene layout

### Colorization

- Convert image to grayscale (input)
- Predict the original colors (output)
- **Intuition:** Must understand semantics (sky is blue, grass is green)

### Inpainting

- Mask out a random region of the image
- Train network to predict the missing pixels
- **Intuition:** Must understand context and object completion

> **Limitation:** These pretext tasks sometimes learn shortcuts rather than useful representations. Modern methods (contrastive learning, masked modeling) are far more effective.

---

## Contrastive Learning

The breakthrough paradigm: learn representations by comparing views of the same image.

### SimCLR (Simple Contrastive Learning of Visual Representations)

Chen et al., 2020 — the foundational contrastive method:

**Algorithm:**
1. Take an image $x$
2. Apply two random augmentations → $\tilde{x}_i$ and $\tilde{x}_j$ (positive pair)
3. Encode both with backbone $f$ → $h_i$, $h_j$
4. Project with MLP $g$ → $z_i$, $z_j$
5. Push positive pair together, push all other pairs apart

**NT-Xent Loss (Normalized Temperature-scaled Cross-Entropy):**

$$\ell_{i,j} = -\log\frac{\exp(\text{sim}(z_i, z_j) / \tau)}{\sum_{k \neq i}\exp(\text{sim}(z_i, z_k) / \tau)}$$

where:
- $\text{sim}(z_i, z_j) = \frac{z_i \cdot z_j}{\|z_i\| \|z_j\|}$ (cosine similarity)
- $\tau$ is the temperature parameter (controls sharpness, typically 0.07–0.5)
- Denominator sums over all $2N - 1$ other samples in the batch

**Key ingredients:**
- Large batch size (4096–8192)
- Strong augmentations (random crop, color jitter, Gaussian blur)
- Projection head (MLP) — discard after training, use backbone features

### Code: SimCLR-Style Training

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import os


class SimCLRAugmentation:
    """Generate two augmented views of one image."""

    def __init__(self, img_size=224):
        self.transform = transforms.Compose([
            transforms.RandomResizedCrop(img_size, scale=(0.2, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomApply([
                transforms.ColorJitter(0.4, 0.4, 0.4, 0.1)
            ], p=0.8),
            transforms.RandomGrayscale(p=0.2),
            transforms.RandomApply([
                transforms.GaussianBlur(kernel_size=23, sigma=(0.1, 2.0))
            ], p=0.5),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
        ])

    def __call__(self, image):
        view1 = self.transform(image)
        view2 = self.transform(image)
        return view1, view2


class SimCLRDataset(Dataset):
    """Dataset that returns two augmented views of each image."""

    def __init__(self, image_dir, transform):
        self.image_paths = [
            os.path.join(image_dir, f)
            for f in os.listdir(image_dir)
            if f.endswith((".jpg", ".png", ".jpeg"))
        ]
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert("RGB")
        view1, view2 = self.transform(image)
        return view1, view2


class ProjectionHead(nn.Module):
    """MLP projection head for contrastive learning."""

    def __init__(self, input_dim=2048, hidden_dim=2048, output_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(inplace=True),
            nn.Linear(hidden_dim, output_dim),
        )

    def forward(self, x):
        return self.net(x)


class SimCLR(nn.Module):
    """SimCLR model with ResNet backbone."""

    def __init__(self, backbone="resnet50", projection_dim=128):
        super().__init__()
        # Backbone encoder
        resnet = models.resnet50(weights=None)
        self.encoder = nn.Sequential(*list(resnet.children())[:-1])
        self.feature_dim = resnet.fc.in_features

        # Projection head
        self.projector = ProjectionHead(
            input_dim=self.feature_dim,
            hidden_dim=2048,
            output_dim=projection_dim
        )

    def forward(self, x):
        h = self.encoder(x).flatten(1)  # Representations
        z = self.projector(h)            # Projections
        return h, z


def nt_xent_loss(z1, z2, temperature=0.5):
    """Compute NT-Xent (SimCLR) loss."""
    batch_size = z1.shape[0]

    # Normalize projections
    z1 = F.normalize(z1, dim=1)
    z2 = F.normalize(z2, dim=1)

    # Concatenate: [z1_0, z1_1, ..., z2_0, z2_1, ...]
    z = torch.cat([z1, z2], dim=0)  # (2B, D)

    # Compute similarity matrix
    sim_matrix = torch.mm(z, z.t()) / temperature  # (2B, 2B)

    # Mask out self-similarity (diagonal)
    mask = torch.eye(2 * batch_size, device=z.device).bool()
    sim_matrix.masked_fill_(mask, -float("inf"))

    # Positive pairs: (i, i+B) and (i+B, i)
    pos_sim = torch.cat([
        torch.diagonal(sim_matrix, offset=batch_size),
        torch.diagonal(sim_matrix, offset=-batch_size)
    ])  # (2B,)

    # Loss: -log(exp(pos) / sum(exp(all)))
    loss = -pos_sim + torch.logsumexp(sim_matrix, dim=1)
    return loss.mean()


def train_simclr(model, dataloader, epochs=100, lr=3e-4, temperature=0.5):
    """Train SimCLR model."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, epochs)

    for epoch in range(epochs):
        model.train()
        total_loss = 0

        for view1, view2 in dataloader:
            view1, view2 = view1.to(device), view2.to(device)

            # Forward pass
            _, z1 = model(view1)
            _, z2 = model(view2)

            # Compute loss
            loss = nt_xent_loss(z1, z2, temperature)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        scheduler.step()
        avg_loss = total_loss / len(dataloader)

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} | Loss: {avg_loss:.4f}")


# Usage
augmentation = SimCLRAugmentation(img_size=224)
dataset = SimCLRDataset("./unlabeled_images", augmentation)
dataloader = DataLoader(dataset, batch_size=256, shuffle=True,
                        num_workers=4, drop_last=True)

model = SimCLR(projection_dim=128)
train_simclr(model, dataloader, epochs=100, temperature=0.5)
```

### MoCo (Momentum Contrast)

He et al., 2020 — memory-efficient contrastive learning:

- **Problem with SimCLR:** Needs huge batch sizes (4096+) for enough negatives
- **Solution:** Maintain a **queue** of negative keys from past batches
- **Momentum encoder:** Slowly updated copy of the encoder provides stable keys

$$\theta_k \leftarrow m \cdot \theta_k + (1 - m) \cdot \theta_q$$

where $m = 0.999$ (momentum coefficient).

Key advantages:
- Works with normal batch sizes (256)
- Queue stores 65,536 negatives
- Decouples batch size from number of negatives

### BYOL (Bootstrap Your Own Latent)

Grill et al., 2020 — no negative pairs needed:

- **Online network:** encoder + projector + predictor
- **Target network:** encoder + projector (momentum updated)
- Loss: predict target network output from online network
- **Key insight:** Asymmetry (predictor only on online) prevents collapse

Why doesn't it collapse to trivial solution?
- Momentum update provides a slowly-moving target
- Batch normalization prevents all outputs from being identical
- The predictor creates an information bottleneck

### SwAV (Swapping Assignments between Views)

- Cluster-based contrastive learning
- Assigns views to prototypes (cluster centers)
- Swapped prediction: predict cluster of view2 from features of view1
- More efficient than pairwise comparisons

---

## Masked Image Modeling

Inspired by BERT's masked language modeling — mask parts of the input, predict them.

### MAE (Masked Autoencoder)

He et al., 2022 — simple and powerful:

**Algorithm:**
1. Split image into patches (e.g., 16×16)
2. Randomly mask 75% of patches
3. Encoder processes only **visible patches** (25%) — very efficient!
4. Lightweight decoder reconstructs **pixel values** of masked patches
5. Loss: MSE on masked patches only

**Key design choices:**
- High masking ratio (75%) forces learning global structure
- Asymmetric encoder-decoder: heavy encoder, light decoder
- Encoder sees only 25% of tokens → 3× faster than processing all

```python
import torch
import torch.nn as nn
import timm


class MAEEncoder(nn.Module):
    """Simplified MAE encoder concept."""

    def __init__(self, img_size=224, patch_size=16, embed_dim=768,
                 depth=12, n_heads=12, mask_ratio=0.75):
        super().__init__()
        self.patch_size = patch_size
        self.n_patches = (img_size // patch_size) ** 2
        self.mask_ratio = mask_ratio
        self.embed_dim = embed_dim

        # Patch embedding
        self.patch_embed = nn.Conv2d(
            3, embed_dim, kernel_size=patch_size, stride=patch_size
        )
        self.pos_embed = nn.Parameter(
            torch.zeros(1, self.n_patches, embed_dim)
        )

        # Transformer encoder
        self.blocks = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=embed_dim, nhead=n_heads,
                dim_feedforward=embed_dim * 4,
                activation="gelu", batch_first=True
            )
            for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(embed_dim)

    def random_masking(self, x):
        """Randomly mask patches, return visible patches and mask."""
        B, N, D = x.shape
        n_keep = int(N * (1 - self.mask_ratio))

        # Random shuffle
        noise = torch.rand(B, N, device=x.device)
        ids_shuffle = torch.argsort(noise, dim=1)
        ids_restore = torch.argsort(ids_shuffle, dim=1)

        # Keep first n_keep patches
        ids_keep = ids_shuffle[:, :n_keep]
        x_visible = torch.gather(
            x, dim=1,
            index=ids_keep.unsqueeze(-1).expand(-1, -1, D)
        )

        # Generate binary mask: 0=keep, 1=masked
        mask = torch.ones(B, N, device=x.device)
        mask[:, :n_keep] = 0
        mask = torch.gather(mask, dim=1, index=ids_restore)

        return x_visible, mask, ids_restore

    def forward(self, x):
        # Patch embedding
        x = self.patch_embed(x)  # (B, D, H/P, W/P)
        x = x.flatten(2).transpose(1, 2)  # (B, N, D)

        # Add position embeddings
        x = x + self.pos_embed

        # Random masking — only encode visible patches
        x_visible, mask, ids_restore = self.random_masking(x)

        # Encode visible patches only (efficient!)
        for block in self.blocks:
            x_visible = block(x_visible)
        x_visible = self.norm(x_visible)

        return x_visible, mask, ids_restore


class MAEDecoder(nn.Module):
    """Simplified MAE decoder."""

    def __init__(self, n_patches, encoder_dim=768, decoder_dim=512,
                 depth=4, n_heads=8, patch_size=16):
        super().__init__()
        self.patch_size = patch_size
        self.decoder_embed = nn.Linear(encoder_dim, decoder_dim)
        self.mask_token = nn.Parameter(torch.zeros(1, 1, decoder_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, n_patches, decoder_dim))

        self.blocks = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=decoder_dim, nhead=n_heads,
                dim_feedforward=decoder_dim * 4,
                activation="gelu", batch_first=True
            )
            for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(decoder_dim)

        # Predict pixel values
        self.pred = nn.Linear(decoder_dim, patch_size * patch_size * 3)

    def forward(self, x_visible, ids_restore):
        B = x_visible.shape[0]

        # Project to decoder dimension
        x = self.decoder_embed(x_visible)

        # Append mask tokens
        n_masked = ids_restore.shape[1] - x.shape[1]
        mask_tokens = self.mask_token.expand(B, n_masked, -1)
        x = torch.cat([x, mask_tokens], dim=1)

        # Unshuffle to original order
        x = torch.gather(
            x, dim=1,
            index=ids_restore.unsqueeze(-1).expand(-1, -1, x.shape[2])
        )

        # Add position embeddings and decode
        x = x + self.pos_embed
        for block in self.blocks:
            x = block(x)
        x = self.norm(x)

        # Predict pixels
        x = self.pred(x)  # (B, N, patch_size^2 * 3)
        return x


# Example usage
encoder = MAEEncoder(img_size=224, patch_size=16, mask_ratio=0.75)
decoder = MAEDecoder(n_patches=196, encoder_dim=768, decoder_dim=512)

dummy_img = torch.randn(2, 3, 224, 224)
x_visible, mask, ids_restore = encoder(dummy_img)
print(f"Input patches: 196")
print(f"Visible patches: {x_visible.shape[1]} (25%)")
print(f"Masked patches: {int(mask.sum().item() / 2)} (75%)")

reconstructed = decoder(x_visible, ids_restore)
print(f"Reconstructed shape: {reconstructed.shape}")
```

### BEiT (BERT Pre-training for Vision)

- Uses a discrete VAE (dVAE) to create visual tokens
- Masked patches → predict token IDs (not pixels)
- More semantic than pixel prediction

### iBOT

- Online tokenizer (no separate dVAE needed)
- Self-distillation with masked image modeling
- Strong results on both classification and dense tasks

---

## DINO / DINOv2

### DINO (Self-Distillation with No Labels)

Caron et al., 2021 — self-distillation framework:

- **Student network:** processes augmented crops (local + global)
- **Teacher network:** processes only global crops, momentum-updated
- **Loss:** Cross-entropy between student and teacher outputs (sharpened)
- **Key finding:** Attention maps of DINO ViT discover objects without labels!

### DINOv2

Oquab et al., 2023 — industrial-scale self-supervised features:

- Trained on 142M curated images (LVD-142M)
- Combines DINO self-distillation + iBOT masked modeling
- Produces features that rival task-specific models
- Works across tasks without fine-tuning (just a linear head)

DINOv2 performance (linear probing):

| Task | Dataset | DINOv2-g | Supervised |
|------|---------|----------|-----------|
| Classification | ImageNet-1K | 86.5% | 88.5% |
| Segmentation | ADE20K | 49.0 mIoU | 47.7 mIoU |
| Depth | NYUv2 | 0.279 RMSE | 0.287 RMSE |

---

## Foundation Models Built on SSL

| Model | Company | Method | Capability |
|-------|---------|--------|-----------|
| **CLIP** | OpenAI | Contrastive (image-text) | Zero-shot classification |
| **SAM** | Meta | Masked modeling + prompts | Zero-shot segmentation |
| **Florence** | Microsoft | Multi-task contrastive | Multi-modal understanding |
| **DINOv2** | Meta | Self-distillation + MIM | General-purpose features |

---

## Linear Probing vs Fine-tuning

Two ways to evaluate SSL representations:

### Linear Probing

- Freeze the pretrained backbone
- Train only a linear classifier on top
- Tests the quality of frozen features
- Lower performance but shows true representation quality

### Fine-tuning

- Initialize with pretrained weights
- Update all parameters on downstream task
- Higher performance
- Tests if pretraining provides good initialization

```python
import torch
import torch.nn as nn
from torchvision import datasets, transforms


def linear_probe(backbone, num_classes, train_loader, val_loader, epochs=50):
    """Evaluate SSL representations via linear probing."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Freeze backbone
    backbone = backbone.to(device)
    backbone.eval()
    for param in backbone.parameters():
        param.requires_grad = False

    # Determine feature dimension
    with torch.no_grad():
        dummy = torch.randn(1, 3, 224, 224).to(device)
        features = backbone(dummy)
        if isinstance(features, tuple):
            features = features[0]
        feat_dim = features.shape[-1]

    # Linear classifier
    classifier = nn.Linear(feat_dim, num_classes).to(device)
    optimizer = torch.optim.SGD(classifier.parameters(), lr=0.1,
                                momentum=0.9, weight_decay=0)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, epochs)
    criterion = nn.CrossEntropyLoss()

    best_acc = 0.0

    for epoch in range(epochs):
        # Train
        classifier.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            with torch.no_grad():
                features = backbone(images)
                if isinstance(features, tuple):
                    features = features[0]
                if features.dim() > 2:
                    features = features.mean(dim=[2, 3])

            logits = classifier(features)
            loss = criterion(logits, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        scheduler.step()

        # Evaluate
        classifier.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                features = backbone(images)
                if isinstance(features, tuple):
                    features = features[0]
                if features.dim() > 2:
                    features = features.mean(dim=[2, 3])
                logits = classifier(features)
                _, predicted = logits.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()

        acc = 100.0 * correct / total
        best_acc = max(best_acc, acc)

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} | Val Acc: {acc:.2f}%")

    print(f"\nBest linear probe accuracy: {best_acc:.2f}%")
    return best_acc
```

---

## SSL Methods Comparison Table

| Method | Year | Approach | Key Idea | ImageNet Linear |
|--------|------|----------|----------|----------------|
| SimCLR | 2020 | Contrastive | Large batch, strong augment | 76.5% |
| MoCo v2 | 2020 | Contrastive | Momentum encoder + queue | 77.1% |
| BYOL | 2020 | Self-distillation | No negatives needed | 78.6% |
| SwAV | 2020 | Clustering | Online cluster assignments | 75.3% |
| BEiT | 2021 | Masked modeling | Predict visual tokens | 82.9% (ft) |
| DINO | 2021 | Self-distillation | ViT + self-distillation | 78.2% |
| MAE | 2022 | Masked modeling | Mask 75%, predict pixels | 83.6% (ft) |
| DINOv2 | 2023 | Hybrid | Distillation + MIM | 86.5% |

---

## Summary

- **Self-supervised learning** eliminates the annotation bottleneck
- **Contrastive learning** (SimCLR, MoCo, BYOL) learns by comparing augmented views
- **Masked image modeling** (MAE, BEiT) learns by reconstructing masked patches
- **Self-distillation** (DINO, DINOv2) creates teacher-student frameworks
- Modern SSL approaches match or exceed supervised pre-training
- **Foundation models** (CLIP, SAM, DINOv2) are SSL-trained and generalize across tasks
- The field is converging: combine contrastive + masked modeling for best results

---
