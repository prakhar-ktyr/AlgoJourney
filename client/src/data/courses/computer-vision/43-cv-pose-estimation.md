---
title: Pose Estimation
---

# Pose Estimation

In this lesson, you will learn how to detect human body **keypoints** (joints) in images and video using pose estimation models.

---

## What Is Pose Estimation?

Pose estimation locates anatomical keypoints on a human body:

```
        ● Nose
       / \
  L Eye   R Eye
     |     |
  L Ear   R Ear
       \ /
    ● ● Shoulders
    |   |
    ● ● Elbows
    |   |
    ● ● Wrists
       |
    ● ● Hips
    |   |
    ● ● Knees
    |   |
    ● ● Ankles
```

The output is a set of $(x, y)$ coordinates (and optionally confidence scores) for each joint.

---

## Applications

| Application | How Pose Estimation Helps |
|------------|--------------------------|
| Sports Analysis | Track athlete movements, measure form |
| Fitness Apps | Count reps, check exercise posture |
| Gesture Recognition | Interpret sign language, hand signals |
| AR/VR | Drive virtual avatars from body motion |
| Animation | Motion capture for games and film |
| Healthcare | Physical therapy progress tracking |
| Surveillance | Activity recognition, fall detection |

---

## Types of Pose Estimation

### Single-Person Pose Estimation

- Assumes one person in the image (or a cropped person)
- Simpler problem: just predict keypoint locations
- Used after a person detector crops each individual

### Multi-Person Pose Estimation

- Multiple people in one image
- Must detect all keypoints AND assign them to correct people
- Two main approaches: top-down and bottom-up

---

## Top-Down Approach

```
Step 1: Detect all people (object detection)
         ┌─────┐  ┌─────┐  ┌─────┐
         │ P1  │  │ P2  │  │ P3  │
         └─────┘  └─────┘  └─────┘

Step 2: Crop each person

Step 3: Run single-person pose estimation on each crop
         ● ●      ● ●      ● ●
         │ │      │ │      │ │
         ...      ...      ...
```

**Pros:** More accurate (each person processed individually)
**Cons:** Slower (runtime scales with number of people)

---

## Bottom-Up Approach

```
Step 1: Detect ALL keypoints in the image at once
         ●  ●  ●  ●  ●  ●  (all noses)
         ●  ●  ●  ●  ●  ●  (all elbows)
         ...

Step 2: Group keypoints into people
         Person 1: {nose_1, elbow_3, wrist_5, ...}
         Person 2: {nose_2, elbow_1, wrist_3, ...}
```

**Pros:** Faster (constant time regardless of people count), handles crowds
**Cons:** Grouping step can be error-prone

---

## Key Architectures

### OpenPose (2017) — Bottom-Up

OpenPose introduced **Part Affinity Fields (PAFs)** for grouping:

```
Image → VGG backbone → Two branches:
  Branch 1: Confidence maps (where are keypoints?)
  Branch 2: PAFs (which keypoints belong together?)

PAFs encode direction vectors between connected joints.
If a PAF between shoulder and elbow points from A to B,
then shoulder A and elbow B likely belong to same person.
```

### HRNet (2019) — High-Resolution Network

HRNet maintains **high-resolution representations** throughout:

```
Traditional: High-res → downsample → downsample → upsample → output
             (loses spatial detail)

HRNet: High-res ──────────────────────────────── → output
       Mid-res  ─────────────────── ↗
       Low-res  ────── ↗
       (parallel streams with cross-connections)
```

**Key insight:** Never lose the high-resolution features. Exchange information across resolutions via fusion modules.

### Simple Baseline (2018)

Surprisingly effective simple architecture:

```
ResNet backbone → 3 deconvolution layers → keypoint heatmaps
```

Shows that a strong backbone + simple head can match complex architectures.

### ViTPose (2022)

Applies Vision Transformers to pose estimation:

- Plain ViT backbone (no hierarchical design needed)
- Simple decoder head
- State-of-the-art with large models (ViT-H)
- Benefits from MAE pre-training

---

## Keypoint Representation

### COCO Keypoint Format

COCO defines **17 keypoints** for a person:

```python
COCO_KEYPOINTS = [
    "nose",           # 0
    "left_eye",       # 1
    "right_eye",      # 2
    "left_ear",       # 3
    "right_ear",      # 4
    "left_shoulder",  # 5
    "right_shoulder", # 6
    "left_elbow",     # 7
    "right_elbow",    # 8
    "left_wrist",     # 9
    "right_wrist",    # 10
    "left_hip",       # 11
    "right_hip",      # 12
    "left_knee",      # 13
    "right_knee",     # 14
    "left_ankle",     # 15
    "right_ankle",    # 16
]

# Skeleton connections (pairs of keypoint indices)
SKELETON = [
    (0, 1), (0, 2), (1, 3), (2, 4),       # head
    (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),  # arms
    (5, 11), (6, 12), (11, 12),            # torso
    (11, 13), (13, 15), (12, 14), (14, 16) # legs
]
```

### Heatmap-Based Prediction

Most models predict keypoints as **heatmaps** — one heatmap per keypoint:

$$H_k(x,y) = \exp\left(-\frac{(x-x_k)^2 + (y-y_k)^2}{2\sigma^2}\right)$$

Where $(x_k, y_k)$ is the ground-truth keypoint location and $\sigma$ controls the Gaussian spread.

```python
import numpy as np


def generate_heatmap(keypoint_x, keypoint_y, height, width, sigma=2):
    """Generate a Gaussian heatmap for a single keypoint."""
    x = np.arange(0, width, 1)
    y = np.arange(0, height, 1)
    xx, yy = np.meshgrid(x, y)

    heatmap = np.exp(
        -((xx - keypoint_x) ** 2 + (yy - keypoint_y) ** 2) / (2 * sigma ** 2)
    )
    return heatmap


def decode_heatmap(heatmap):
    """Get keypoint location from heatmap (argmax)."""
    flat_idx = np.argmax(heatmap)
    y, x = np.unravel_index(flat_idx, heatmap.shape)
    confidence = heatmap[y, x]
    return x, y, confidence


# Example: generate heatmap for keypoint at (50, 30) in 64x64 map
hmap = generate_heatmap(50, 30, 64, 64, sigma=2)
x, y, conf = decode_heatmap(hmap)
print(f"Decoded keypoint: ({x}, {y}), confidence: {conf:.3f}")
```

---

## Using Torchvision KeypointRCNN

Torchvision provides a pre-trained Keypoint R-CNN (top-down approach).

### Loading the Model

```python
import torch
import torchvision
from torchvision.models.detection import keypointrcnn_resnet50_fpn
from torchvision.models.detection import KeypointRCNN_ResNet50_FPN_Weights
from torchvision.transforms import functional as F
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np


# Load pre-trained model
weights = KeypointRCNN_ResNet50_FPN_Weights.DEFAULT
model = keypointrcnn_resnet50_fpn(weights=weights)
model.eval()

print("Model loaded! Predicts 17 COCO keypoints per person.")
```

### Running Pose Estimation

```python
def estimate_poses(image_path, score_threshold=0.7):
    """Detect people and estimate their poses."""
    # Load image
    image = Image.open(image_path).convert("RGB")
    image_tensor = F.to_tensor(image).unsqueeze(0)

    # Run inference
    with torch.no_grad():
        predictions = model(image_tensor)

    pred = predictions[0]

    # Filter by confidence
    keep = pred["scores"] > score_threshold

    boxes = pred["boxes"][keep]           # [N, 4]
    scores = pred["scores"][keep]         # [N]
    keypoints = pred["keypoints"][keep]   # [N, 17, 3] (x, y, confidence)

    print(f"Detected {len(boxes)} people")
    return boxes, scores, keypoints, image


boxes, scores, keypoints, image = estimate_poses("people.jpg")
```

### Drawing the Skeleton

```python
def draw_skeleton(image, keypoints, skeleton, threshold=0.5):
    """Draw pose skeletons on an image."""
    fig, ax = plt.subplots(1, figsize=(12, 8))
    ax.imshow(image)

    colors = plt.cm.rainbow(np.linspace(0, 1, len(keypoints)))

    for person_idx, (kpts, color) in enumerate(zip(keypoints, colors)):
        kpts = kpts.numpy()  # [17, 3]

        # Draw keypoints
        for kpt_idx in range(17):
            x, y, conf = kpts[kpt_idx]
            if conf > threshold:
                ax.plot(x, y, "o", color=color, markersize=6)

        # Draw skeleton connections
        for (start, end) in skeleton:
            x1, y1, c1 = kpts[start]
            x2, y2, c2 = kpts[end]
            if c1 > threshold and c2 > threshold:
                ax.plot([x1, x2], [y1, y2], "-", color=color, linewidth=2)

    ax.axis("off")
    plt.title(f"Detected {len(keypoints)} people")
    plt.tight_layout()
    plt.savefig("pose_result.png", dpi=150)
    plt.show()


SKELETON = [
    (0, 1), (0, 2), (1, 3), (2, 4),
    (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),
    (5, 11), (6, 12), (11, 12),
    (11, 13), (13, 15), (12, 14), (14, 16)
]

draw_skeleton(image, keypoints, SKELETON)
```

### Calculating Joint Angles

```python
def calculate_angle(a, b, c):
    """
    Calculate angle at joint b formed by segments a-b and b-c.

    Args:
        a, b, c: (x, y) coordinates of three keypoints
    Returns:
        Angle in degrees
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

    return angle


# Example: calculate elbow angle
# shoulder (idx 5), elbow (idx 7), wrist (idx 9)
person_kpts = keypoints[0].numpy()
shoulder = person_kpts[5][:2]
elbow = person_kpts[7][:2]
wrist = person_kpts[9][:2]

elbow_angle = calculate_angle(shoulder, elbow, wrist)
print(f"Left elbow angle: {elbow_angle:.1f}°")
```

---

## MediaPipe Pose (Google)

MediaPipe offers a lightweight, real-time pose estimation solution.

```python
import mediapipe as mp
import cv2
import numpy as np


def mediapipe_pose_estimation(image_path):
    """Run MediaPipe pose estimation."""
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    # Initialize pose model
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,       # 0, 1, or 2 (higher = more accurate)
        min_detection_confidence=0.5
    ) as pose:

        # Read image
        image = cv2.imread(image_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Process
        results = pose.process(image_rgb)

        if results.pose_landmarks:
            print("33 landmarks detected!")

            # Draw landmarks on image
            annotated = image.copy()
            mp_drawing.draw_landmarks(
                annotated,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS
            )

            # Access specific landmarks
            landmarks = results.pose_landmarks.landmark
            nose = landmarks[mp_pose.PoseLandmark.NOSE]
            print(f"Nose: x={nose.x:.3f}, y={nose.y:.3f}, z={nose.z:.3f}")
            # x, y are normalized [0,1]; z is depth relative to hips

            cv2.imwrite("mediapipe_pose.jpg", annotated)
            return results.pose_landmarks
        else:
            print("No pose detected")
            return None


landmarks = mediapipe_pose_estimation("person.jpg")
```

### Real-Time Pose (Webcam)

For real-time pose estimation, use `static_image_mode=False` and process each video frame in a loop. MediaPipe tracks landmarks across frames efficiently using `min_tracking_confidence`.

---

## 3D Pose Estimation

Extending from 2D to 3D: estimate $(x, y, z)$ for each joint.

**Approaches:**
1. **Lifting 2D to 3D:** Detect 2D keypoints, then predict depth with a fully-connected network
2. **Direct 3D prediction:** Predict 3D coordinates from the image directly
3. **Multi-view:** Use multiple camera views for triangulation

MediaPipe already provides approximate 3D coordinates (the `z` value relative to hips).

---

## Evaluation Metrics

### PCK (Percentage of Correct Keypoints)

A keypoint is "correct" if it falls within a threshold distance:

$$PCK@\alpha = \frac{\text{# keypoints within } \alpha \cdot d}{N_{total}}$$

Where $d$ is a reference distance (e.g., head size or torso length).

### OKS (Object Keypoint Similarity)

COCO's metric, analogous to IoU for detection:

$$OKS = \frac{\sum_i \exp(-d_i^2 / 2s^2 k_i^2) \cdot \delta(v_i > 0)}{\sum_i \delta(v_i > 0)}$$

Where:
- $d_i$ = Euclidean distance between predicted and GT keypoint $i$
- $s$ = object scale (square root of segment area)
- $k_i$ = per-keypoint constant (accounts for annotation noise)
- $v_i$ = visibility flag

AP is then computed at OKS thresholds (like IoU thresholds in detection).

---

## Summary

- Pose estimation detects body **keypoints** (joints) in images
- **Top-down:** detect people first, then estimate pose per person (more accurate)
- **Bottom-up:** detect all keypoints, then group into people (faster)
- Key models: OpenPose, HRNet, ViTPose, Keypoint R-CNN
- Heatmap prediction: $H_k(x,y) = \exp(-\frac{(x-x_k)^2+(y-y_k)^2}{2\sigma^2})$
- **Torchvision** provides Keypoint R-CNN for easy use
- **MediaPipe** gives lightweight real-time pose (33 keypoints)
- Metrics: PCK and OKS (COCO AP)

---

## Exercise

Try this:

1. Use torchvision's Keypoint R-CNN to detect poses in a group photo
2. Draw skeletons with different colors for each person
3. Calculate the knee angle for a person in a squat position
4. Use MediaPipe to track poses in a short video and count arm raises

---
