---
title: Autonomous Driving Vision
---

# Autonomous Driving Vision

Computer vision is the **eyes** of self-driving cars. It enables vehicles to understand their surroundings, detect obstacles, and navigate safely through complex environments.

---

## CV for Self-Driving: Seeing the Road

An autonomous vehicle must continuously answer:

- **Where am I?** (localization)
- **What's around me?** (perception)
- **Where is everything going?** (prediction)
- **What should I do?** (planning)

Computer vision handles the **perception** step — turning raw sensor data into a structured understanding of the driving scene.

---

## The Perception Stack

Self-driving cars use multiple sensors working together:

### Camera

- Provides **dense visual information** (color, texture, lane markings)
- Captures 2D images at high resolution
- **Limitation**: no direct depth information
- Cheap and widely available
- Works best in good lighting conditions

### LiDAR (Light Detection and Ranging)

- Emits laser pulses and measures return time
- Produces **3D point clouds** with accurate depth
- Range: up to 200+ meters
- **Limitation**: expensive ($1,000–$75,000), sparse data
- Struggles with rain, fog, dust

### Radar

- Uses radio waves to detect objects
- Measures **velocity** directly (Doppler effect)
- Works in **all weather conditions** (rain, fog, snow)
- **Limitation**: low resolution, poor at shape recognition
- Cheap and reliable

### Sensor Fusion

Combining all sensors gives the best understanding:

| Sensor | Depth | Velocity | Resolution | Weather | Cost |
|--------|-------|----------|------------|---------|------|
| Camera | ✗ | ✗ | High | Poor | Low |
| LiDAR | ✓ | ✗ | Medium | Fair | High |
| Radar | ✓ | ✓ | Low | Excellent | Low |

Fusion methods:
- **Early fusion**: combine raw data before processing
- **Late fusion**: process each sensor independently, merge results
- **Mid fusion**: combine intermediate features

---

## Key Tasks in Autonomous Driving Vision

### 1. Lane Detection

Find the boundaries of the driving lane to keep the car centered.

**Approaches:**

- **LaneNet**: instance segmentation of lane lines
- **Ultra-Fast Lane Detection**: row-wise classification (very fast!)
- **CLRNet**: anchor-based lane detection with cross-layer refinement

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class SimpleLaneDetector(nn.Module):
    """
    Simplified lane detection model.
    Predicts lane positions at each row of the image.
    """

    def __init__(self, num_lanes=4, num_rows=56, num_cols=100):
        super().__init__()
        self.num_lanes = num_lanes
        self.num_rows = num_rows
        self.num_cols = num_cols  # grid columns + 1 (no lane)

        # Feature extractor (simplified backbone)
        self.backbone = nn.Sequential(
            nn.Conv2d(3, 32, 3, stride=2, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((num_rows, 25)),
        )

        # Lane classifier: for each row, predict column position
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * num_rows * 25, 2048),
            nn.ReLU(),
            nn.Linear(2048, num_lanes * num_rows * (num_cols + 1)),
        )

    def forward(self, x):
        features = self.backbone(x)
        out = self.classifier(features)
        # Reshape: (batch, num_lanes, num_rows, num_cols+1)
        out = out.view(-1, self.num_lanes, self.num_rows, self.num_cols + 1)
        return out


# Usage
model = SimpleLaneDetector(num_lanes=4, num_rows=56, num_cols=100)
dummy_input = torch.randn(1, 3, 288, 800)  # Typical lane detection input size
output = model(dummy_input)
print(f"Output shape: {output.shape}")
# Output shape: torch.Size([1, 4, 56, 101])
# 4 lanes, 56 row anchors, 101 possible positions (100 + no lane)

# Get lane positions
predictions = torch.argmax(output, dim=-1)  # (1, 4, 56)
print(f"Lane positions shape: {predictions.shape}")
```

### 2. Traffic Sign Recognition

Classify traffic signs into categories (stop, yield, speed limit, etc.).

- **Dataset**: German Traffic Sign Recognition Benchmark (GTSRB) — 43 classes
- Standard CNN classification task
- Must handle varying lighting, occlusion, fading

### 3. Pedestrian Detection

Critical for safety — missing a pedestrian can be fatal.

- High recall is essential (better false positives than missed detections)
- Must work at various distances, occlusions, and poses
- Night-time detection with infrared cameras

### 4. 3D Object Detection from Camera

Predict 3D bounding boxes (position, size, orientation) from 2D images:

```python
import torch
import torch.nn as nn


class FCOS3DHead(nn.Module):
    """
    Simplified FCOS3D detection head.
    Predicts 3D bounding box parameters from image features.
    """

    def __init__(self, in_channels=256, num_classes=10):
        super().__init__()
        # Classification branch
        self.cls_head = nn.Sequential(
            nn.Conv2d(in_channels, 256, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(256, num_classes, 1),
        )

        # 3D regression branch
        # Predict: offset_x, offset_y, depth, width, height, length, rotation
        self.reg_head = nn.Sequential(
            nn.Conv2d(in_channels, 256, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(256, 7, 1),  # 7 parameters for 3D box
        )

    def forward(self, features):
        cls_score = self.cls_head(features)
        bbox_3d = self.reg_head(features)
        return cls_score, bbox_3d


# 3D box parameters explained:
# - offset_x, offset_y: 2D center offset
# - depth: distance from camera (meters)
# - width, height, length: 3D box dimensions
# - rotation: yaw angle (heading direction)

head = FCOS3DHead(in_channels=256, num_classes=10)
feature_map = torch.randn(1, 256, 32, 32)
cls, bbox = head(feature_map)
print(f"Class scores: {cls.shape}")   # (1, 10, 32, 32)
print(f"3D bbox params: {bbox.shape}")  # (1, 7, 32, 32)
```

### 5. Semantic Segmentation of Road Scenes

Classify every pixel in the driving scene:

**Cityscapes classes** (19 classes):
- Road, sidewalk, building, wall, fence
- Pole, traffic light, traffic sign
- Vegetation, terrain, sky
- Person, rider, car, truck, bus, train, motorcycle, bicycle

```python
import torch
import torchvision.models.segmentation as seg_models


# Load pretrained DeepLabV3+ for road scene segmentation
model = seg_models.deeplabv3_resnet101(
    weights=seg_models.DeepLabV3_ResNet101_Weights.DEFAULT
)
model.eval()

# Cityscapes-style input (1024x2048 typical, using smaller for demo)
dummy_input = torch.randn(1, 3, 512, 1024)

with torch.no_grad():
    output = model(dummy_input)
    predictions = output["out"]  # (1, 21, 512, 1024)
    seg_map = torch.argmax(predictions, dim=1)  # (1, 512, 1024)

print(f"Segmentation map shape: {seg_map.shape}")
print(f"Unique classes predicted: {torch.unique(seg_map).tolist()}")
```

### 6. Free Space Detection

Determine where the car can safely drive (drivable area):

- Binary segmentation: drivable vs. non-drivable
- Must account for road boundaries, obstacles, curbs
- Real-time requirement: > 30 FPS

### 7. Depth Estimation

Estimate depth from a single camera (monocular) or stereo pair:

$$d = \frac{f \cdot B}{x_L - x_R}$$

Where $f$ is focal length, $B$ is baseline (stereo distance), and $x_L - x_R$ is disparity.

Monocular depth estimation uses deep learning to predict depth from a single image (e.g., MiDaS, DPT).

---

## BEV (Bird's Eye View) Perception

### Why BEV?

Cameras see in **perspective view** — objects farther away appear smaller. For planning, we need a **top-down view** where distances are preserved.

### BEV Transformation

Transform 2D camera features into a 3D top-down representation:

```python
import torch
import torch.nn as nn


class SimpleBEVTransform(nn.Module):
    """
    Simplified BEV transformation.
    Lifts 2D image features to 3D using depth prediction,
    then projects to bird's eye view.
    """

    def __init__(self, feat_channels=64, bev_h=200, bev_w=200, depth_bins=50):
        super().__init__()
        self.bev_h = bev_h
        self.bev_w = bev_w
        self.depth_bins = depth_bins

        # Depth prediction network
        self.depth_net = nn.Sequential(
            nn.Conv2d(feat_channels, feat_channels, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(feat_channels, depth_bins, 1),
        )

        # BEV feature compression
        self.bev_encoder = nn.Sequential(
            nn.Conv2d(feat_channels, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, padding=1),
        )

    def forward(self, cam_features):
        """
        cam_features: (B, C, H, W) - image features from backbone
        Returns: (B, C_bev, bev_h, bev_w) - BEV features
        """
        # Predict depth distribution
        depth = self.depth_net(cam_features)  # (B, D, H, W)
        depth_probs = torch.softmax(depth, dim=1)

        # In full implementation:
        # 1. Create frustum points for each pixel at each depth
        # 2. Use camera intrinsics/extrinsics to project to 3D
        # 3. Splat features onto BEV grid
        # Simplified: pool to BEV size
        bev_features = torch.nn.functional.adaptive_avg_pool2d(
            cam_features, (self.bev_h, self.bev_w)
        )

        bev_out = self.bev_encoder(bev_features)
        return bev_out


bev_transform = SimpleBEVTransform(feat_channels=64)
cam_feat = torch.randn(1, 64, 32, 64)
bev_feat = bev_transform(cam_feat)
print(f"BEV features: {bev_feat.shape}")  # (1, 64, 200, 200)
```

### Key BEV Methods

| Method | Approach | Key Idea |
|--------|----------|----------|
| BEVFormer | Transformer | Spatial cross-attention with BEV queries |
| BEVDet | Lift-Splat | Explicit depth + voxel pooling |
| BEVFusion | Multi-modal | Fuse camera + LiDAR in BEV space |

---

## Multi-Camera Systems

Modern self-driving cars use **6+ cameras** for 360° coverage:

- Front narrow (long range)
- Front wide (intersections)
- Front-left, front-right
- Rear
- Side-left, side-right

Challenge: unify features from all cameras into a single BEV representation.

---

## Occupancy Networks

A newer approach: predict **3D voxel occupancy** of the entire scene.

- Divide 3D space into voxels (e.g., 0.5m × 0.5m × 0.5m)
- For each voxel, predict: occupied or free + semantic class
- Handles arbitrary shapes (not limited to bounding boxes)
- Tesla's approach: "Occupancy Network"

---

## Datasets

| Dataset | Year | Sensors | Scenes | Location |
|---------|------|---------|--------|----------|
| KITTI | 2012 | Camera + LiDAR | 22 sequences | Germany |
| nuScenes | 2019 | 6 cam + LiDAR + radar | 1000 scenes | Boston, Singapore |
| Waymo Open | 2019 | 5 cam + 5 LiDAR | 1150 scenes | USA |
| Argoverse 2 | 2021 | 7 cam + 2 LiDAR | 1000 scenes | USA |

---

## End-to-End Driving

Instead of separate modules, learn directly:

$$\text{Sensor Input} \rightarrow \text{Neural Network} \rightarrow \text{Driving Commands}$$

### Approaches

- **UniAD** (Unified Autonomous Driving): single model for perception + prediction + planning
- **Tesla FSD**: occupancy networks + transformer planner
- **Transfuser**: fuse camera + LiDAR with transformers

Advantages:
- No error accumulation between modules
- Can optimize for final driving objective

Challenges:
- Harder to interpret and debug
- Safety certification is difficult

---

## Safety and Edge Cases

Self-driving must handle **rare but critical** scenarios:

| Edge Case | Challenge |
|-----------|-----------|
| Night driving | Low light, glare from headlights |
| Heavy rain | Sensor noise, reduced visibility |
| Sun glare | Camera saturation |
| Construction zones | Unusual traffic patterns |
| Emergency vehicles | Must yield, detect sirens |
| Animals on road | Unpredictable movement |

### Handling Edge Cases

- **Simulation**: generate millions of scenarios in virtual worlds (CARLA, NVIDIA DRIVE Sim)
- **Adversarial testing**: find inputs that confuse the model
- **Redundancy**: multiple sensors, multiple models
- **Graceful degradation**: hand control to human when uncertain

---

## Challenges in Autonomous Driving CV

1. **Corner cases**: infinite variety of real-world situations
2. **Real-time constraints**: must process at 10-30+ FPS
3. **Safety requirements**: cannot tolerate false negatives for pedestrians
4. **Weather robustness**: must work in all conditions
5. **Validation**: how to prove safety? Millions of miles of testing needed
6. **Regulatory**: different rules in different regions

---

## Summary

| Concept | Description |
|---------|-------------|
| Sensor Fusion | Combine camera + LiDAR + radar for robust perception |
| Lane Detection | Find drivable lane boundaries |
| 3D Detection | Predict 3D bounding boxes from cameras |
| BEV Perception | Top-down scene representation for planning |
| Occupancy Networks | Voxel-level 3D scene understanding |
| End-to-End | Direct sensor-to-control learning |
| Edge Cases | Rare scenarios requiring special handling |

---

## Next Lesson

Next, we'll learn about deploying CV models on **edge devices** — making models run fast on limited hardware! ➡️
