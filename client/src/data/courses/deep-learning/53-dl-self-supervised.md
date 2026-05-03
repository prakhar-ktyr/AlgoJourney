---
title: Self-Supervised Learning
---

# Self-Supervised Learning

**Self-Supervised Learning (SSL)** is a paradigm where models learn representations from **unlabeled data** by creating supervision signals from the data itself.

It bridges the gap between supervised learning (needs labels) and unsupervised learning (no clear objective).

---

## The Labeling Bottleneck

Supervised learning requires large amounts of **labeled data**:

| Dataset | Labels | Cost |
|---------|--------|------|
| ImageNet | 14M images, manually labeled | Years of human effort |
| Medical imaging | Expert radiologist annotations | $50–$500 per image |
| Speech | Transcribed audio | $1–$5 per minute |
| NLP | Sentiment, NER, QA pairs | Crowdsourcing at scale |

Meanwhile, **unlabeled data is abundant**: billions of images on the web, trillions of text tokens, millions of hours of video.

Self-supervised learning asks: *Can we learn useful representations without any labels?*

---

## How Self-Supervised Learning Works

The core idea:

1. **Create a pretext task** from unlabeled data (pseudo-labels from data structure)
2. **Train the model** on this pretext task
3. **Transfer** the learned representations to **downstream tasks** (with few labels)

```
┌──────────────────────────────────────────────────────┐
│ Pretext Task (self-supervised, no labels needed)     │
│ "Learn general representations"                       │
└──────────────────────┬───────────────────────────────┘
                       │ Transfer / Fine-tune
                       ▼
┌──────────────────────────────────────────────────────┐
│ Downstream Task (small labeled dataset)              │
│ "Solve the actual problem"                           │
└──────────────────────────────────────────────────────┘
```

---

## Pretext Tasks vs. Downstream Tasks

| Pretext Task (SSL) | Domain | What It Learns |
|--------------------|--------|----------------|
| Predict rotation (0°, 90°, 180°, 270°) | Vision | Object orientation |
| Solve jigsaw puzzle | Vision | Spatial relationships |
| Colorize grayscale images | Vision | Semantic understanding |
| Predict next word | NLP | Language structure |
| Mask and predict tokens | NLP | Contextual meaning |
| Predict future frames | Video | Temporal dynamics |

The pretext task is a **means**, not the end goal. The learned features transfer to real tasks.

---

## Contrastive Learning

**Contrastive learning** learns by **pulling similar things together** and **pushing dissimilar things apart** in embedding space.

### SimCLR (Simple Contrastive Learning of Representations)

Chen et al., 2020 — one of the most influential SSL methods.

**How it works:**

1. Take an image $x$
2. Apply two **random augmentations** → $x_i$ and $x_j$ (positive pair)
3. Encode both through a shared encoder → $h_i$, $h_j$
4. Project through a small MLP → $z_i$, $z_j$
5. Pull $z_i$ and $z_j$ together, push all other images apart

```
Image x ──┬── Aug1 ──► Encoder ──► Projector ──► z_i
           │                                        ↕ maximize similarity
           └── Aug2 ──► Encoder ──► Projector ──► z_j
```

### NT-Xent Loss (Normalized Temperature-scaled Cross-Entropy)

For a positive pair $(i, j)$ in a batch of $N$ images ($2N$ augmented views):

$$\ell_{i,j} = -\log \frac{\exp(\text{sim}(z_i, z_j) / \tau)}{\sum_{k \neq i} \exp(\text{sim}(z_i, z_k) / \tau)}$$

Where:
- $\text{sim}(u, v) = \frac{u^T v}{\|u\| \|v\|}$ is cosine similarity
- $\tau$ is a temperature parameter (typically 0.07–0.5)
- The denominator sums over all $2N - 1$ other views (negatives)

### Data Augmentations in SimCLR

```python
from torchvision import transforms

simclr_augmentation = transforms.Compose([
    transforms.RandomResizedCrop(32, scale=(0.2, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomApply([
        transforms.ColorJitter(0.4, 0.4, 0.4, 0.1)
    ], p=0.8),
    transforms.RandomGrayscale(p=0.2),
    transforms.GaussianBlur(kernel_size=3),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2023, 0.1994, 0.2010)),
])
```

---

## BYOL: Bootstrap Your Own Latent

**BYOL** (Grill et al., 2020) showed you don't even need **negative pairs**!

Architecture:
- **Online network**: encoder + projector + predictor
- **Target network**: encoder + projector (exponential moving average of online)

The online network predicts the target network's output:

$$L = \| \bar{q}_\theta(z_i) - \bar{z}'_j \|_2^2$$

Where $\bar{\cdot}$ denotes L2-normalized vectors.

The target network is updated as:

$$\xi \leftarrow m \cdot \xi + (1 - m) \cdot \theta$$

With momentum $m = 0.996$ (slow-moving average prevents collapse).

---

## MoCo: Momentum Contrast

**MoCo** (He et al., 2020) maintains a **queue of negatives** instead of requiring huge batch sizes.

Key ideas:
- **Momentum encoder**: slowly-updated copy of the encoder
- **Queue**: stores encoded representations from recent batches as negatives
- Allows large effective "batch size" for contrastive learning without GPU memory cost

```python
# MoCo pseudocode
# f_q: query encoder (trained)
# f_k: key encoder (momentum-updated)
# queue: stores recent keys

for x in dataloader:
    x_q, x_k = augment(x), augment(x)  # Two views

    q = f_q(x_q)           # Queries: [B, D]
    k = f_k(x_k).detach()  # Keys: [B, D] (no gradient)

    # Positive logits: [B, 1]
    pos = (q * k).sum(dim=1, keepdim=True)

    # Negative logits: [B, K] (K = queue size)
    neg = q @ queue.T

    # Contrastive loss
    logits = torch.cat([pos, neg], dim=1) / temperature
    labels = torch.zeros(B, dtype=torch.long)  # Positive is index 0
    loss = F.cross_entropy(logits, labels)

    # Update queue
    queue = torch.cat([k, queue[:queue_size - B]])

    # Momentum update
    for p_k, p_q in zip(f_k.parameters(), f_q.parameters()):
        p_k.data = 0.999 * p_k.data + 0.001 * p_q.data
```

---

## Masked Prediction

Another family of SSL methods: **mask part of the input, predict what's missing**.

### BERT-Style (NLP)

- Mask 15% of input tokens randomly
- Train the model to predict the masked tokens
- The encoder learns deep contextual representations

```
Input:  "The cat [MASK] on the [MASK]"
Target: "The cat sat on the mat"
```

### MAE: Masked Autoencoders (Vision)

He et al., 2022 — mask **75%** of image patches, reconstruct them:

```python
# MAE concept
# 1. Split image into patches (e.g., 16x16 patches for 224x224 image)
# 2. Randomly mask 75% of patches
# 3. Encode only visible patches with a ViT encoder
# 4. Add mask tokens, decode all patches
# 5. Loss: MSE on reconstructed pixels (only masked patches)

# Why mask so much?
# - Images have high redundancy (unlike text)
# - Forces the model to learn semantics, not just interpolate
```

---

## DINO: Self-Distillation with No Labels

**DINO** (Caron et al., 2021) — a Vision Transformer trained with self-distillation discovers object segmentation **without any labels**!

- Student network: sees local crops
- Teacher network: sees global crops (EMA of student)
- Student learns to match teacher's output distribution

The attention maps of DINO naturally segment objects:

```python
# DINO learns to focus on objects without supervision
# The [CLS] token attention heads produce segmentation-like maps
# This emergent property is remarkable — no pixel labels needed!
```

---

## Foundation Models

Self-supervised pretraining at scale produces **foundation models**:

| Model | Domain | Pretext Task | Parameters |
|-------|--------|--------------|------------|
| GPT-4 | Text | Next-token prediction | ~1.8T |
| BERT | Text | Masked language modeling | 340M |
| CLIP | Vision + Text | Contrastive image-text | 400M |
| DINO v2 | Vision | Self-distillation | 1.1B |
| MAE | Vision | Masked reconstruction | 632M |
| Whisper | Audio | Transcription | 1.5B |

The recipe: **pretrain on massive unlabeled data** → **fine-tune on small labeled data**.

---

## Code: SimCLR-Style Contrastive Learning

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import datasets, transforms
from torch.utils.data import DataLoader


class SimCLRAugmentation:
    """Generate two augmented views of the same image."""

    def __init__(self):
        self.transform = transforms.Compose([
            transforms.RandomResizedCrop(32, scale=(0.2, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomApply([
                transforms.ColorJitter(0.4, 0.4, 0.4, 0.1)
            ], p=0.8),
            transforms.RandomGrayscale(p=0.2),
            transforms.ToTensor(),
            transforms.Normalize((0.4914, 0.4822, 0.4465),
                                 (0.2023, 0.1994, 0.2010)),
        ])

    def __call__(self, x):
        return self.transform(x), self.transform(x)


class SimCLREncoder(nn.Module):
    """Simple encoder + projection head."""

    def __init__(self, feature_dim=128):
        super().__init__()
        # Simple CNN encoder (use ResNet for real experiments)
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
        )

        # Projection head (used only during pretraining)
        self.projector = nn.Sequential(
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, feature_dim),
        )

    def forward(self, x):
        h = self.encoder(x)      # Representations
        z = self.projector(h)    # Projections
        return h, z


def nt_xent_loss(z_i, z_j, temperature=0.5):
    """Normalized Temperature-scaled Cross-Entropy Loss."""
    batch_size = z_i.shape[0]

    # Normalize
    z_i = F.normalize(z_i, dim=1)
    z_j = F.normalize(z_j, dim=1)

    # Concatenate: [2B, D]
    z = torch.cat([z_i, z_j], dim=0)

    # Similarity matrix: [2B, 2B]
    sim = torch.mm(z, z.T) / temperature

    # Mask out self-similarity
    mask = torch.eye(2 * batch_size, device=z.device).bool()
    sim.masked_fill_(mask, -float('inf'))

    # Positive pairs: (i, i+B) and (i+B, i)
    pos_i = torch.arange(batch_size, 2 * batch_size, device=z.device)
    pos_j = torch.arange(0, batch_size, device=z.device)
    positives = torch.cat([pos_i, pos_j])

    # Cross-entropy loss
    loss = F.cross_entropy(sim, positives)
    return loss


def train_simclr():
    # Dataset with double augmentation
    train_dataset = datasets.CIFAR10(
        root='./data', train=True, download=True,
        transform=SimCLRAugmentation(),
    )
    train_loader = DataLoader(train_dataset, batch_size=256,
                              shuffle=True, num_workers=2)

    model = SimCLREncoder(feature_dim=128)
    optimizer = torch.optim.Adam(model.parameters(), lr=3e-4)

    model.train()
    for epoch in range(10):
        total_loss = 0
        for (x_i, x_j), _ in train_loader:
            # Forward pass for both views
            _, z_i = model(x_i)
            _, z_j = model(x_j)

            # Compute contrastive loss
            loss = nt_xent_loss(z_i, z_j, temperature=0.5)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/10, Loss: {avg_loss:.4f}")

    return model


# Train
model = train_simclr()

# After pretraining: freeze encoder, train a linear classifier
# This evaluates representation quality
```

---

## Linear Evaluation Protocol

After SSL pretraining, we evaluate representation quality:

1. **Freeze** the encoder (no gradient updates)
2. Train a **linear classifier** on top of frozen features
3. High accuracy = good representations

```python
class LinearClassifier(nn.Module):
    def __init__(self, encoder, num_classes=10):
        super().__init__()
        self.encoder = encoder
        # Freeze encoder
        for param in self.encoder.parameters():
            param.requires_grad = False
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x):
        with torch.no_grad():
            h, _ = self.encoder(x)
        return self.classifier(h)
```

---

## SSL vs. Supervised vs. Unsupervised

| Aspect | Supervised | Unsupervised | Self-Supervised |
|--------|-----------|--------------|-----------------|
| Labels needed | Yes (expensive) | No | No |
| Objective | Predict labels | Find structure | Pretext task |
| Signal source | Human annotations | Data statistics | Data itself |
| Examples | Classification, detection | Clustering, PCA | SimCLR, BERT, MAE |
| Representations | Task-specific | General | General + transferable |
| Scale | Limited by labels | Limited by utility | Scales with data |

---

## Timeline of Self-Supervised Learning

| Year | Method | Key Idea |
|------|--------|----------|
| 2018 | BERT | Masked language modeling |
| 2019 | MoCo v1 | Momentum contrast + queue |
| 2020 | SimCLR | Simple contrastive + strong augmentations |
| 2020 | BYOL | No negatives needed |
| 2021 | DINO | Self-distillation for ViT |
| 2022 | MAE | 75% masking for vision |
| 2023 | DINOv2 | Universal visual features |
| 2024+ | Foundation models | SSL at trillion-token scale |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| SSL motivation | Labels are expensive, data is abundant |
| Contrastive | Pull positives together, push negatives apart |
| SimCLR | Augment → encode → project → NT-Xent loss |
| BYOL/MoCo | Avoid large batches: momentum or queue |
| Masked prediction | Hide part of input, predict it |
| Foundation models | Pretrain with SSL, fine-tune with few labels |
| Evaluation | Linear probe on frozen features |

---

## Try It Yourself

1. Experiment with different augmentations — which matter most for SimCLR?
2. Increase the batch size and observe the effect on loss
3. Try masked autoencoder on MNIST (mask patches of digits)
4. Compare linear probe accuracy: random init vs. SSL-pretrained encoder

Self-supervised learning is the engine behind modern foundation models — it turns **unlimited unlabeled data** into powerful, transferable representations!
