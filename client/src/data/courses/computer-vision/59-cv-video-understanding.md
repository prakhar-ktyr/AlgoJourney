---
title: Video Understanding & Action Recognition
---

# Video Understanding & Action Recognition

Video adds a **temporal dimension** to images. Understanding video means recognizing not just what objects are present, but **what is happening over time** — actions, events, and temporal relationships.

---

## Video Understanding Tasks

| Task | Input | Output | Example |
|------|-------|--------|---------|
| Action recognition | Video clip | Action class | "playing basketball" |
| Temporal detection | Full video | Action + time | "dunk at 0:23–0:25" |
| Video captioning | Video | Text description | "A man dunks a basketball" |
| Video object segmentation | Video | Per-frame masks | Track the ball |
| Activity recognition | Long video | Activity | "cooking a meal" |
| Moment retrieval | Video + text | Timestamp | "when does the dog jump?" |

---

## Why Video Is Harder Than Images

```
Single image: 224×224×3 = 150K values
Video clip (16 frames): 16×224×224×3 = 2.4M values (16× more data!)

Challenges:
- Temporal reasoning: order matters
- Motion understanding: optical flow, speed
- Computational cost: 10-100× more than images
- Redundancy: consecutive frames are very similar
- Long-range dependencies: context across seconds/minutes
```

---

## Approaches to Video Understanding

### 1. 2D CNN + Temporal Aggregation

Process each frame independently, then combine features over time:

```python
import torch
import torch.nn as nn
from torchvision.models import resnet50

class FrameAggregation(nn.Module):
    """Extract per-frame features, then aggregate temporally."""

    def __init__(self, num_classes=400):
        super().__init__()
        resnet = resnet50(pretrained=True)
        self.backbone = nn.Sequential(
            *list(resnet.children())[:-1]  # Remove FC
        )
        self.temporal_pool = nn.AdaptiveAvgPool1d(1)
        self.classifier = nn.Linear(2048, num_classes)

    def forward(self, video):
        """
        Args:
            video: (B, T, C, H, W) - batch of video clips
        """
        B, T, C, H, W = video.shape

        # Process each frame
        frames = video.view(B * T, C, H, W)
        features = self.backbone(frames)    # (B*T, 2048, 1, 1)
        features = features.view(B, T, -1)  # (B, T, 2048)

        # Temporal aggregation (average pooling over time)
        features = features.transpose(1, 2)  # (B, 2048, T)
        pooled = self.temporal_pool(features).squeeze(-1)  # (B, 2048)

        logits = self.classifier(pooled)
        return logits
```

**Pros**: Simple, reuses image pretrained models
**Cons**: No temporal modeling between frames

### 2. 3D CNNs: Spatiotemporal Convolutions

Apply convolutions in both space AND time simultaneously:

```python
class Conv3DBlock(nn.Module):
    """3D convolution block for video."""

    def __init__(self, in_channels, out_channels,
                 kernel_size=(3, 3, 3)):
        super().__init__()
        padding = tuple(k // 2 for k in kernel_size)
        self.conv = nn.Conv3d(
            in_channels, out_channels,
            kernel_size=kernel_size,
            padding=padding
        )
        self.bn = nn.BatchNorm3d(out_channels)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool3d(kernel_size=(1, 2, 2))

    def forward(self, x):
        """x: (B, C, T, H, W)"""
        return self.pool(self.relu(self.bn(self.conv(x))))


class C3D(nn.Module):
    """C3D-style network for video classification."""

    def __init__(self, num_classes=101):
        super().__init__()
        self.features = nn.Sequential(
            Conv3DBlock(3, 64, (3, 3, 3)),
            Conv3DBlock(64, 128, (3, 3, 3)),
            Conv3DBlock(128, 256, (3, 3, 3)),
            Conv3DBlock(256, 512, (3, 3, 3)),
            nn.AdaptiveAvgPool3d((1, 1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        """x: (B, C, T, H, W) video tensor."""
        feat = self.features(x)
        return self.classifier(feat)


# Input: 16 frames, 112×112 resolution
video = torch.randn(4, 3, 16, 112, 112)  # Batch of 4 clips
model = C3D(num_classes=101)
output = model(video)
print(f"Output: {output.shape}")  # (4, 101)
```

### 3. I3D: Inflated 3D ConvNets

**Key insight**: take a 2D CNN pretrained on ImageNet and "inflate" its kernels to 3D by repeating weights along the temporal dimension.

```
2D conv kernel: (C_out, C_in, 3, 3)
Inflate to 3D:  (C_out, C_in, 3, 3, 3) → divide by temporal_size
```

This gives 3D models the benefit of **ImageNet pretraining**!

### 4. SlowFast Networks

Process video at **two speeds** simultaneously:

```
Slow pathway: low frame rate (e.g., 4 FPS)
  → Captures spatial/appearance information
  → More channels, heavier computation

Fast pathway: high frame rate (e.g., 32 FPS)
  → Captures motion/temporal information
  → Fewer channels, lightweight

Lateral connections fuse both pathways
```

```python
class SlowFastBlock(nn.Module):
    """Simplified SlowFast dual-pathway concept."""

    def __init__(self, slow_channels, fast_channels):
        super().__init__()
        # Slow pathway: more channels, fewer frames
        self.slow_conv = nn.Sequential(
            nn.Conv3d(slow_channels, slow_channels, (1, 3, 3),
                      padding=(0, 1, 1)),
            nn.BatchNorm3d(slow_channels),
            nn.ReLU()
        )

        # Fast pathway: fewer channels, more frames
        self.fast_conv = nn.Sequential(
            nn.Conv3d(fast_channels, fast_channels, (3, 3, 3),
                      padding=(1, 1, 1)),
            nn.BatchNorm3d(fast_channels),
            nn.ReLU()
        )

        # Lateral connection: fast → slow
        self.lateral = nn.Conv3d(
            fast_channels, slow_channels,
            kernel_size=(5, 1, 1), stride=(4, 1, 1),
            padding=(2, 0, 0)
        )

    def forward(self, slow_input, fast_input):
        slow_out = self.slow_conv(slow_input)
        fast_out = self.fast_conv(fast_input)

        # Fuse fast into slow via lateral connection
        lateral_out = self.lateral(fast_out)
        slow_out = slow_out + lateral_out

        return slow_out, fast_out
```

---

## Two-Stream Architecture

Separates **appearance** (what) from **motion** (how):

```
Spatial stream:  RGB frames → CNN → appearance features
                                          ↓
Temporal stream: Optical flow → CNN → motion features  → Fuse → Prediction
```

### Optical Flow

Optical flow represents **pixel movement** between consecutive frames:

```python
import cv2
import numpy as np

def compute_optical_flow(frame1, frame2):
    """Compute dense optical flow between two frames."""
    gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    flow = cv2.calcOpticalFlowFarneback(
        gray1, gray2, flow=None, pyr_scale=0.5,
        levels=3, winsize=15, iterations=3,
        poly_n=5, poly_sigma=1.2, flags=0
    )
    return flow  # (H, W, 2) - horizontal and vertical displacement


def flow_to_rgb(flow):
    """Visualize optical flow as color image."""
    magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])
    hsv = np.zeros((*flow.shape[:2], 3), dtype=np.uint8)
    hsv[..., 0] = angle * 180 / np.pi / 2
    hsv[..., 1] = 255
    hsv[..., 2] = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
```

---

## Video Transformers

Transformers bring **self-attention** to video — capturing long-range temporal dependencies.

### TimeSformer: Divided Space-Time Attention

Instead of full spatiotemporal attention (too expensive), divide into:

1. **Temporal attention**: each patch attends to same spatial position across frames
2. **Spatial attention**: each patch attends to all patches within same frame

```python
class DividedSpaceTimeAttention(nn.Module):
    """Simplified divided space-time attention (TimeSformer)."""

    def __init__(self, dim, num_heads=8, num_frames=8,
                 num_patches=196):
        super().__init__()
        self.num_frames = num_frames
        self.num_patches = num_patches

        # Temporal attention
        self.temporal_attn = nn.MultiheadAttention(
            dim, num_heads, batch_first=True
        )
        self.temporal_norm = nn.LayerNorm(dim)

        # Spatial attention
        self.spatial_attn = nn.MultiheadAttention(
            dim, num_heads, batch_first=True
        )
        self.spatial_norm = nn.LayerNorm(dim)

    def forward(self, x):
        """
        x: (B, T*P, D) where T=frames, P=patches per frame
        """
        B, N, D = x.shape
        T, P = self.num_frames, self.num_patches

        # --- Temporal attention ---
        # Reshape: (B*P, T, D) - group by spatial position
        xt = x.view(B, T, P, D).permute(0, 2, 1, 3)
        xt = xt.reshape(B * P, T, D)
        xt = self.temporal_norm(xt)
        temporal_out, _ = self.temporal_attn(xt, xt, xt)
        temporal_out = temporal_out.view(B, P, T, D)
        temporal_out = temporal_out.permute(0, 2, 1, 3).reshape(B, N, D)
        x = x + temporal_out

        # --- Spatial attention ---
        # Reshape: (B*T, P, D) - group by frame
        xs = x.view(B, T, P, D).reshape(B * T, P, D)
        xs = self.spatial_norm(xs)
        spatial_out, _ = self.spatial_attn(xs, xs, xs)
        spatial_out = spatial_out.view(B, T, P, D).reshape(B, N, D)
        x = x + spatial_out

        return x
```

### VideoMAE: Masked Video Pre-training

Pre-train video transformers by masking **90%** of video patches and reconstructing them — exploits temporal redundancy.

---

## Video Datasets

| Dataset | Classes | Clips | Task | Notable |
|---------|---------|-------|------|---------|
| Kinetics-400 | 400 | 300K | Classification | Standard benchmark |
| Kinetics-700 | 700 | 650K | Classification | Largest |
| UCF101 | 101 | 13K | Classification | Classic |
| ActivityNet | 200 | 20K | Temporal detection | Untrimmed videos |
| Something-Something v2 | 174 | 220K | Classification | Temporal reasoning |
| HMDB51 | 51 | 7K | Classification | Smaller benchmark |

---

## Frame Sampling Strategies

You can't process every frame — too expensive. Common strategies:

```python
import numpy as np

def uniform_sample(total_frames, num_clips=16):
    """Sample frames uniformly across the video."""
    indices = np.linspace(0, total_frames - 1, num_clips)
    return indices.astype(int)


def random_sample(total_frames, clip_length=16):
    """Sample a random contiguous clip."""
    start = np.random.randint(0, total_frames - clip_length)
    return np.arange(start, start + clip_length)


def multi_scale_sample(total_frames, num_clips=16):
    """Sample at multiple temporal scales."""
    # Dense (fast events) + sparse (slow events)
    dense = np.linspace(0, total_frames // 2, num_clips // 2)
    sparse = np.linspace(0, total_frames - 1, num_clips // 2)
    return np.concatenate([dense, sparse]).astype(int)
```

---

## Action Recognition with Pretrained Models

```python
import torch
from torchvision.models.video import r3d_18, R3D_18_Weights

# Load pretrained R3D-18 (3D ResNet)
weights = R3D_18_Weights.DEFAULT
model = r3d_18(weights=weights)
model.eval()

# Preprocessing
preprocess = weights.transforms()

# Prepare video clip: (C, T, H, W) = (3, 16, 112, 112)
# In practice, load frames from a video file
video_clip = torch.randn(3, 16, 112, 112)
batch = preprocess(video_clip).unsqueeze(0)

# Predict action
with torch.no_grad():
    output = model(batch)
    probs = output.softmax(dim=1)

# Get top-5 predictions
top5_probs, top5_indices = probs.topk(5)
categories = weights.meta["categories"]

print("Top-5 predictions:")
for i in range(5):
    idx = top5_indices[0][i].item()
    prob = top5_probs[0][i].item()
    print(f"  {categories[idx]}: {prob:.1%}")
```

---

## Video Processing Utilities

```python
import cv2
import torch
import numpy as np

class VideoLoader:
    """Load and preprocess video for action recognition."""

    def __init__(self, clip_length=16, resize=(224, 224)):
        self.clip_length = clip_length
        self.resize = resize

    def load_video(self, video_path):
        """Load video file and return frames."""
        cap = cv2.VideoCapture(video_path)
        frames = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, self.resize)
            frames.append(frame)
        cap.release()
        return np.array(frames)

    def sample_clip(self, frames):
        """Sample a fixed-length clip using uniform sampling."""
        total = len(frames)
        if total >= self.clip_length:
            indices = np.linspace(
                0, total - 1, self.clip_length
            ).astype(int)
        else:
            indices = list(range(total))
            indices += [total - 1] * (self.clip_length - total)
        return frames[indices]

    def preprocess(self, clip):
        """Convert clip to (C, T, H, W) tensor."""
        clip = clip.astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        clip = (clip - mean) / std
        return torch.from_numpy(clip).permute(3, 0, 1, 2).float()


# Usage
loader = VideoLoader(clip_length=16)
frames = loader.load_video("action_clip.mp4")
tensor = loader.preprocess(loader.sample_clip(frames))
print(f"Input shape: {tensor.shape}")  # (3, 16, 224, 224)
```

---

## Temporal Augmentation

Data augmentation specific to video:

```python
import random

def temporal_augmentations(frames):
    """Apply temporal augmentations to video frames."""
    augmented = frames.copy()

    # 1. Random temporal crop (already done in sampling)

    # 2. Random playback speed
    if random.random() > 0.5:
        # Speed up (skip frames)
        step = random.choice([2, 3])
        augmented = augmented[::step]

    # 3. Reverse playback
    if random.random() > 0.5:
        augmented = augmented[::-1]

    # 4. Temporal jittering (small random offsets)
    # Handled during frame sampling

    return augmented
```

---

## Summary

| Approach | Temporal Modeling | Pretrained? | Speed |
|----------|------------------|-------------|-------|
| 2D CNN + Pool | None (just average) | ImageNet | Fast |
| Two-Stream | Optical flow | ImageNet | Medium |
| C3D / R3D | 3D convolutions | From scratch or Kinetics | Medium |
| I3D | Inflated 3D conv | ImageNet → 3D | Medium |
| SlowFast | Dual-rate pathways | Kinetics | Medium |
| TimeSformer | Divided attention | ImageNet-21K | Slow |
| VideoMAE | Full attention | Self-supervised | Slow |

---

## Try It Yourself

1. Classify video clips using a pretrained R3D-18 model
2. Compute and visualize optical flow between consecutive frames
3. Compare uniform vs random frame sampling on classification accuracy
4. Build a simple two-stream model combining RGB and flow features

---

## Key Takeaways

- Video adds temporal complexity — models must understand both appearance and motion
- 3D CNNs extend spatial convolutions to the time dimension
- SlowFast processes video at two speeds for complementary information
- Video transformers capture long-range temporal dependencies via attention
- Frame sampling strategy significantly impacts both speed and accuracy
- Pretrained video models (Kinetics) are essential starting points
