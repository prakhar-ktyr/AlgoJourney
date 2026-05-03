---
title: 3D Deep Learning
---

# 3D Deep Learning

Most computer vision operates on 2D images, but the real world is 3D. **3D deep learning** processes three-dimensional data — point clouds, meshes, depth maps, and volumetric representations — enabling applications from robotics to AR/VR.

---

## Beyond 2D: Why 3D Matters

| Application | Why 3D is Needed |
|-------------|------------------|
| Self-driving cars | Understand distances to objects |
| Robotics | Grasp objects, navigate spaces |
| AR/VR | Reconstruct and render 3D scenes |
| Architecture | Model buildings from photos |
| Medical imaging | 3D organ segmentation from CT/MRI |

---

## 3D Representations

Different ways to represent 3D data, each with trade-offs:

### Point Clouds

An **unordered set** of 3D points, each with $(x, y, z)$ coordinates. Often from LiDAR sensors or depth cameras.

```
Properties:
- Simple and flexible
- No connectivity info (just scattered points)
- Variable size (100 to millions of points)
- Can include per-point features (color, normal)
```

### Meshes

**Vertices** connected by **faces** (usually triangles). Standard in graphics and 3D modeling.

```
Properties:
- Explicit surface representation
- Efficient rendering
- Complex topology handling
- Standard format: OBJ, PLY, STL
```

### Voxels

A **3D grid** where each cell (voxel) has a value — the 3D equivalent of pixels. Regular structure makes 3D CNNs easy, but memory is $O(N^3)$.

### Implicit Functions

Represent surfaces as the **zero level-set** of a continuous function:

- **SDF** (Signed Distance Function): distance to nearest surface
- **NeRF**: density + color as function of position + direction
- **Occupancy Networks**: probability of being inside the surface

---

## Point Cloud Processing: PointNet

**PointNet** (2017) was the breakthrough for directly processing raw point clouds with deep learning.

### The Challenge

Point clouds are **unordered sets** — the same set of points in any order should give the same result. Standard CNNs can't handle this.

### PointNet's Solution

Use a **symmetric function** (max pooling) to achieve permutation invariance:

```
Per-point MLP → Max Pool → Global feature → Classification/Segmentation
```

Key components:
1. **Shared MLP**: apply same network to each point independently
2. **Max pooling**: aggregate across all points (order-invariant)
3. **T-Net**: learn spatial alignment transformations

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TNet(nn.Module):
    """Spatial Transformer Network for point alignment."""

    def __init__(self, k=3):
        super().__init__()
        self.k = k
        self.mlp = nn.Sequential(
            nn.Conv1d(k, 64, 1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Conv1d(64, 128, 1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Conv1d(128, 1024, 1),
            nn.BatchNorm1d(1024),
            nn.ReLU()
        )
        self.fc = nn.Sequential(
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Linear(256, k * k)
        )

    def forward(self, x):
        """Predict k×k transformation matrix."""
        B = x.size(0)
        feat = self.mlp(x)                    # (B, 1024, N)
        feat = feat.max(dim=2)[0]             # (B, 1024)
        transform = self.fc(feat)             # (B, k*k)
        # Initialize as identity
        identity = torch.eye(self.k, device=x.device)
        identity = identity.flatten().unsqueeze(0).expand(B, -1)
        transform = transform + identity
        transform = transform.view(B, self.k, self.k)
        return transform


class PointNet(nn.Module):
    """PointNet for 3D point cloud classification."""

    def __init__(self, num_classes=40, num_points=1024):
        super().__init__()
        self.num_points = num_points

        # Input transform (3x3)
        self.input_transform = TNet(k=3)

        # Shared MLP layers (per-point)
        self.mlp1 = nn.Sequential(
            nn.Conv1d(3, 64, 1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Conv1d(64, 64, 1),
            nn.BatchNorm1d(64),
            nn.ReLU()
        )

        # Feature transform (64x64)
        self.feature_transform = TNet(k=64)

        self.mlp2 = nn.Sequential(
            nn.Conv1d(64, 128, 1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Conv1d(128, 1024, 1),
            nn.BatchNorm1d(1024),
            nn.ReLU()
        )

        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        """
        Args:
            x: (B, N, 3) point cloud
        Returns:
            logits: (B, num_classes)
        """
        B, N, _ = x.shape
        x = x.transpose(1, 2)  # (B, 3, N)

        # Input alignment
        t1 = self.input_transform(x)         # (B, 3, 3)
        x = torch.bmm(t1, x)                 # (B, 3, N)

        # Per-point features
        x = self.mlp1(x)                     # (B, 64, N)

        # Feature alignment
        t2 = self.feature_transform(x)       # (B, 64, 64)
        x = torch.bmm(t2, x)                 # (B, 64, N)

        # Higher-level features
        x = self.mlp2(x)                     # (B, 1024, N)

        # Symmetric function: max pooling (permutation invariant!)
        x = x.max(dim=2)[0]                  # (B, 1024)

        # Classify
        logits = self.classifier(x)          # (B, num_classes)
        return logits


# Usage: classify 3D objects (ModelNet40)
model = PointNet(num_classes=40, num_points=1024)
points = torch.randn(8, 1024, 3)  # Batch of 8, 1024 points each
output = model(points)
print(f"Output shape: {output.shape}")  # (8, 40)
```

### PointNet++ (Hierarchical)

PointNet lacks local structure. **PointNet++** adds hierarchy:

1. **Sampling**: select subset of points (farthest point sampling)
2. **Grouping**: find neighbors around each selected point
3. **PointNet**: apply PointNet to each local group
4. **Repeat**: progressively abstract larger regions

---

## Depth Estimation

Predict **depth** (distance to camera) from a single 2D image.

### Monocular Depth Estimation

The task: given one RGB image, output a dense depth map where each pixel has an estimated depth value.

**Loss function** (L1 depth):

$$L = \frac{1}{n}\sum_{i=1}^{n}|d_i - d_i^*|$$

Where $d_i$ is predicted depth and $d_i^*$ is ground truth depth.

### MiDaS: Robust Depth Estimation

**MiDaS** (Intel) predicts high-quality **relative** depth from any image:

```python
import torch
import cv2
import numpy as np

# Load MiDaS model
model_type = "DPT_Large"  # Best quality
midas = torch.hub.load("intel-isl/MiDaS", model_type)
midas.eval()

# Load transforms
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
transform = midas_transforms.dpt_transform

# Predict depth
img = cv2.imread("scene.jpg")
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
input_batch = transform(img_rgb).unsqueeze(0)

with torch.no_grad():
    depth = midas(input_batch)

# Resize to original
depth = torch.nn.functional.interpolate(
    depth.unsqueeze(1),
    size=img_rgb.shape[:2],
    mode="bicubic",
    align_corners=False
).squeeze()

depth_map = depth.numpy()
print(f"Depth range: {depth_map.min():.2f} to {depth_map.max():.2f}")

# Visualize: normalize to 0-255
depth_vis = cv2.normalize(
    depth_map, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U
)
depth_colored = cv2.applyColorMap(depth_vis, cv2.COLORMAP_INFERNO)
cv2.imwrite("depth_output.png", depth_colored)
```

### Relative vs Metric Depth

| Type | Output | Models |
|------|--------|--------|
| Relative | Ordering (closer/farther) | MiDaS |
| Metric | Actual distances (meters) | ZoeDepth |

---

## NeRF: Neural Radiance Fields

**NeRF** (2020) represents a 3D scene as a **continuous function** learned by a neural network, enabling photorealistic novel view synthesis.

### Core Idea

A neural network maps 3D position + viewing direction to color + density:

$$F_\theta: (x, y, z, \theta, \phi) \rightarrow (r, g, b, \sigma)$$

Where:
- $(x, y, z)$ = 3D position
- $(\theta, \phi)$ = viewing direction
- $(r, g, b)$ = color at that point from that direction
- $\sigma$ = volume density (opacity)

### Volume Rendering

To render a pixel, cast a ray and accumulate colors:

$$C(\mathbf{r}) = \int_{t_n}^{t_f} T(t) \cdot \sigma(\mathbf{r}(t)) \cdot \mathbf{c}(\mathbf{r}(t), \mathbf{d}) \, dt$$

Where $T(t) = \exp\left(-\int_{t_n}^{t} \sigma(\mathbf{r}(s)) ds\right)$ is accumulated transmittance.

```python
import torch
import torch.nn as nn

class NeRF(nn.Module):
    """Simplified NeRF: MLP mapping position + direction to color."""

    def __init__(self, pos_dim=63, dir_dim=27, hidden=256):
        super().__init__()
        # Position encoding branch
        self.pos_mlp = nn.Sequential(
            nn.Linear(pos_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU()
        )

        # Density output
        self.density_head = nn.Linear(hidden, 1)

        # Color branch (depends on direction too)
        self.color_mlp = nn.Sequential(
            nn.Linear(hidden + dir_dim, hidden // 2),
            nn.ReLU(),
            nn.Linear(hidden // 2, 3),
            nn.Sigmoid()  # RGB in [0, 1]
        )

    def forward(self, pos_encoded, dir_encoded):
        """
        Args:
            pos_encoded: positional encoding of (x,y,z)
            dir_encoded: directional encoding of (θ,φ)
        Returns:
            rgb: (B, 3) color
            sigma: (B, 1) density
        """
        h = self.pos_mlp(pos_encoded)
        sigma = F.relu(self.density_head(h))  # Density ≥ 0

        color_input = torch.cat([h, dir_encoded], dim=-1)
        rgb = self.color_mlp(color_input)

        return rgb, sigma


def positional_encoding(x, num_frequencies=10):
    """Map coordinates to higher dimensions using sin/cos."""
    encodings = [x]
    for freq in range(num_frequencies):
        encodings.append(torch.sin(2**freq * torch.pi * x))
        encodings.append(torch.cos(2**freq * torch.pi * x))
    return torch.cat(encodings, dim=-1)
```

### NeRF Variants

| Variant | Improvement |
|---------|-------------|
| Instant-NGP | Real-time (hash encoding) |
| Mip-NeRF | Anti-aliasing |
| NeRF in the Wild | Handle varying lighting |
| Block-NeRF | City-scale scenes |

---

## 3D Gaussian Splatting

A **fast alternative to NeRF** (2023) that represents scenes as millions of 3D Gaussian ellipsoids.

### Key Differences from NeRF

| Aspect | NeRF | 3D Gaussian Splatting |
|--------|------|----------------------|
| Representation | Implicit (MLP) | Explicit (Gaussians) |
| Rendering | Ray marching (slow) | Rasterization (fast) |
| Speed | Seconds per frame | **Real-time** (100+ FPS) |
| Training | Hours | 10–30 minutes |
| Editing | Difficult | Easier (explicit) |

### How It Works

Each Gaussian has:
- Position (mean): $\mu \in \mathbb{R}^3$
- Covariance: $\Sigma \in \mathbb{R}^{3\times3}$ (shape/orientation)
- Color: spherical harmonics coefficients
- Opacity: $\alpha \in [0, 1]$

Rendering: project Gaussians to 2D, alpha-blend front-to-back.

---

## 3D Object Detection

Predict **3D bounding boxes** (position, size, orientation) in 3D space.

### Applications

- Autonomous driving: detect cars, pedestrians in 3D
- Robotics: locate objects for manipulation
- Indoor navigation: understand room layout

### Input Modalities

```
LiDAR point cloud → 3D detector → 3D bounding boxes
Camera images     → Monocular 3D → 3D bounding boxes (less accurate)
Both (fusion)     → Multi-modal → Best accuracy
```

---

## Applications of 3D Deep Learning

| Domain | Application | Key Methods |
|--------|-------------|-------------|
| Autonomous driving | 3D detection, mapping | PointPillars, BEVFusion |
| AR/VR | Scene reconstruction | NeRF, Gaussian Splatting |
| Robotics | Grasp planning, navigation | PointNet++, depth estimation |
| Architecture | Building modeling | Multi-view stereo |
| Gaming | 3D asset generation | NeRF → mesh extraction |
| Medical | Organ segmentation | 3D U-Net on CT volumes |

---

## Code: Depth Estimation Pipeline

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models

class DepthEstimator(nn.Module):
    """Encoder-decoder for monocular depth estimation."""

    def __init__(self):
        super().__init__()
        resnet = models.resnet34(pretrained=True)
        self.encoder = nn.Sequential(*list(resnet.children())[:-2])
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(32, 1, 4, stride=2, padding=1),
            nn.ReLU()  # Depth is positive
        )

    def forward(self, x):
        features = self.encoder(x)      # (B, 512, H/32, W/32)
        depth = self.decoder(features)  # (B, 1, H, W)
        return depth


# Training
def train_depth(model, dataloader, epochs=20, lr=1e-4):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    for epoch in range(epochs):
        total_loss = 0
        for images, gt_depth in dataloader:
            pred_depth = model(images)
            pred_depth = F.interpolate(
                pred_depth, size=gt_depth.shape[2:],
                mode="bilinear", align_corners=False
            )
            loss = F.l1_loss(pred_depth, gt_depth)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch+1}: Loss = {total_loss/len(dataloader):.4f}")
```

---

## Summary

| Method | Input | Output | Key Innovation |
|--------|-------|--------|----------------|
| PointNet | Point cloud | Class/segments | Max-pool for set invariance |
| MiDaS | Single RGB | Depth map | Robust multi-dataset training |
| NeRF | Sparse views | Novel views | Neural implicit + volume rendering |
| 3D Gaussians | Sparse views | Novel views | Real-time explicit rendering |
| 3D Detection | Points/images | 3D boxes | Spatial reasoning |

---

## Try It Yourself

1. Run MiDaS on your photos and visualize depth maps
2. Implement a simple PointNet classifier on ModelNet10
3. Explore instant-ngp for fast NeRF training on your own scene
4. Compare depth estimation quality: MiDaS vs ZoeDepth

---

## Key Takeaways

- 3D deep learning handles point clouds, depth maps, meshes, and implicit representations
- PointNet achieves permutation invariance via max pooling — the key insight for set processing
- Monocular depth estimation predicts 3D structure from a single 2D image
- NeRF learns continuous 3D scene representations for photorealistic rendering
- 3D Gaussian Splatting offers real-time performance as an alternative to NeRF
- These techniques power autonomous driving, AR/VR, robotics, and 3D content creation
