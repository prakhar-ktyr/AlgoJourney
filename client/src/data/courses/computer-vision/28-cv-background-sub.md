---
title: Background Subtraction
---

# Background Subtraction

**Background subtraction** separates the foreground (moving objects) from the background (static scene) in video. It's one of the most common techniques in surveillance, traffic monitoring, and any application where you need to detect "what's moving."

---

## What Is Background Subtraction?

The idea is simple: if you know what the background looks like, anything that's different is foreground.

| Term            | Meaning                                        |
|-----------------|-------------------------------------------------|
| **Background**  | The static (or slowly changing) part of a scene |
| **Foreground**  | Moving objects — people, cars, animals           |
| **Mask**        | Binary image: white = foreground, black = background |

**Challenge:** Backgrounds change — lighting shifts, trees sway, water ripples. A good background model must **adapt over time**.

---

## Simple Approach: Frame Differencing

The simplest motion detection: compare two consecutive frames.

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("surveillance.mp4")

ret, prev_frame = cap.read()
prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Absolute difference between frames
    diff = cv2.absdiff(prev_gray, gray)

    # Threshold to get binary mask
    _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

    # Clean up noise
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.dilate(thresh, kernel, iterations=2)
    thresh = cv2.erode(thresh, kernel, iterations=1)

    cv2.imshow("Frame", frame)
    cv2.imshow("Difference", diff)
    cv2.imshow("Motion Mask", thresh)

    if cv2.waitKey(30) & 0xFF == 27:
        break

    prev_gray = gray.copy()

cap.release()
cv2.destroyAllWindows()
```

### Limitations of Frame Differencing

| Problem                      | Why It Happens                              |
|------------------------------|---------------------------------------------|
| Ghosting (double edges)      | Detects both old and new positions          |
| Misses slow objects          | Small changes fall below threshold          |
| No background model          | Can't handle stationary-then-moving objects |
| Sensitive to camera shake    | Entire frame appears as "motion"            |

---

## Running Average Background

A step up: maintain a **running average** of the background that slowly adapts.

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("surveillance.mp4")

ret, frame = cap.read()
# Initialize background as float for accumulation
avg_bg = np.float32(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))

alpha = 0.02  # Learning rate (0-1, lower = slower adaptation)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Update running average
    # avg_bg = (1 - alpha) * avg_bg + alpha * gray
    cv2.accumulateWeighted(gray, avg_bg, alpha)

    # Compute foreground mask
    bg_uint8 = cv2.convertScaleAbs(avg_bg)
    diff = cv2.absdiff(gray, bg_uint8)
    _, mask = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)

    # Clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    cv2.imshow("Frame", frame)
    cv2.imshow("Background Model", bg_uint8)
    cv2.imshow("Foreground Mask", mask)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

### The Learning Rate ($\alpha$)

$$\text{background}_{t+1} = (1 - \alpha) \cdot \text{background}_t + \alpha \cdot \text{frame}_t$$

| $\alpha$ Value | Behavior                                     |
|----------------|----------------------------------------------|
| 0.01           | Very slow adaptation — stable background     |
| 0.05           | Moderate — adapts to lighting changes         |
| 0.1+           | Fast adaptation — foreground absorbed quickly |

> **Trade-off:** Low $\alpha$ gives clean foreground but can't handle lighting changes. High $\alpha$ adapts fast but may absorb slow-moving objects into the background.

---

## MOG2: Mixture of Gaussians

The **MOG2** algorithm models each pixel's history as a **mixture of Gaussian distributions**. This handles complex backgrounds like waving trees, rippling water, and flickering lights.

### Why Mixture of Gaussians?

A single pixel might show:
- Blue sky most of the time (Gaussian 1)
- Green leaves when the tree sways (Gaussian 2)
- Dark shadow occasionally (Gaussian 3)

MOG2 models all of these and classifies a new pixel value as background if it matches **any** of the Gaussians.

### Using MOG2

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("surveillance.mp4")

# Create MOG2 background subtractor
bg_subtractor = cv2.createBackgroundSubtractorMOG2(
    history=500,        # Number of frames for background model
    varThreshold=16,    # Threshold for foreground classification
    detectShadows=True  # Enable shadow detection
)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Apply background subtraction
    fg_mask = bg_subtractor.apply(frame)

    # fg_mask values:
    #   255 = definite foreground
    #   127 = shadow (if detectShadows=True)
    #   0   = background

    # Remove shadows (keep only definite foreground)
    _, clean_mask = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)

    # Clean up with morphology
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel)
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_OPEN, kernel)

    # Apply mask to original frame
    foreground = cv2.bitwise_and(frame, frame, mask=clean_mask)

    cv2.imshow("Original", frame)
    cv2.imshow("Raw Mask", fg_mask)
    cv2.imshow("Clean Mask", clean_mask)
    cv2.imshow("Foreground Only", foreground)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

### MOG2 Parameters

| Parameter        | Default | What It Does                                           |
|------------------|---------|--------------------------------------------------------|
| `history`        | 500     | Frames used to build the model — more = slower adapt   |
| `varThreshold`   | 16      | Mahalanobis distance threshold for foreground           |
| `detectShadows`  | True    | Marks shadows as gray (127) in the mask                |

---

## KNN: K-Nearest Neighbors Background Subtractor

The **KNN** method is a non-parametric alternative to MOG2. It stores recent pixel values and classifies new values based on distance to the K nearest stored samples.

```python
import cv2

cap = cv2.VideoCapture("surveillance.mp4")

# Create KNN background subtractor
bg_subtractor = cv2.createBackgroundSubtractorKNN(
    history=500,
    dist2Threshold=400.0,  # Squared distance threshold
    detectShadows=True
)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    fg_mask = bg_subtractor.apply(frame)

    # Remove shadows
    _, clean_mask = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)

    # Clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel)

    cv2.imshow("Frame", frame)
    cv2.imshow("KNN Foreground", clean_mask)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

---

## MOG2 vs KNN Comparison

| Feature             | MOG2                           | KNN                            |
|---------------------|--------------------------------|--------------------------------|
| **Model type**      | Parametric (Gaussians)         | Non-parametric (samples)       |
| **Speed**           | Fast                           | Slightly slower                |
| **Multi-modal BG**  | Yes (mixture)                  | Yes (sample-based)             |
| **Shadow detection**| Yes                            | Yes                            |
| **Memory**          | Low (stores parameters)        | Higher (stores samples)        |
| **Best for**        | General purpose, real-time     | Complex/changing backgrounds   |

---

## Post-Processing the Mask

The raw foreground mask is often noisy. Here's a complete cleanup pipeline:

```python
import cv2
import numpy as np


def clean_foreground_mask(mask):
    """Clean up a raw foreground mask."""
    # Step 1: Remove shadows (keep only white pixels)
    _, binary = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY)

    # Step 2: Remove small noise (opening = erode + dilate)
    kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_small)

    # Step 3: Fill holes (closing = dilate + erode)
    kernel_large = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel_large)

    # Step 4: Optional — fill remaining internal holes
    contours, _ = cv2.findContours(
        binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    filled = np.zeros_like(binary)
    cv2.drawContours(filled, contours, -1, 255, -1)

    return filled
```

---

## People Counting Pipeline

A complete example: count people crossing a line using background subtraction.

```python
import cv2
import numpy as np


def people_counter(video_path):
    """Count people crossing a horizontal line."""
    cap = cv2.VideoCapture(video_path)

    # Get video dimensions
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Counting line position (horizontal, middle of frame)
    line_y = height // 2
    count = 0

    # Background subtractor
    bg_sub = cv2.createBackgroundSubtractorMOG2(
        history=500, varThreshold=50, detectShadows=True
    )

    # Track centroids from previous frame
    prev_centroids = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Apply background subtraction
        mask = bg_sub.apply(frame)

        # Clean up mask
        _, mask = cv2.threshold(mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        # Find contours
        contours, _ = cv2.findContours(
            mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        current_centroids = []

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 1000:  # Skip small objects
                continue

            # Get bounding box and centroid
            x, y, w, h = cv2.boundingRect(cnt)
            cx = x + w // 2
            cy = y + h // 2
            current_centroids.append((cx, cy))

            # Draw bounding box
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

        # Check if any centroid crossed the line
        for (cx, cy) in current_centroids:
            for (px, py) in prev_centroids:
                # Same object if close enough
                dist = np.sqrt((cx - px) ** 2 + (cy - py) ** 2)
                if dist < 50:
                    # Check if it crossed the line
                    if py < line_y <= cy or cy < line_y <= py:
                        count += 1
                    break

        prev_centroids = current_centroids

        # Draw counting line
        cv2.line(frame, (0, line_y), (width, line_y), (0, 0, 255), 2)

        # Display count
        cv2.putText(
            frame, f"Count: {count}", (10, 40),
            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3
        )

        cv2.imshow("People Counter", frame)
        cv2.imshow("Foreground Mask", mask)

        if cv2.waitKey(30) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
    return count


total = people_counter("pedestrians.mp4")
print(f"Total crossings: {total}")
```

---

## Method Comparison Summary

| Method              | Complexity  | Adapts? | Multi-modal? | Shadow? |
|---------------------|-------------|---------|--------------|---------|
| Frame differencing  | Very simple | No      | No           | No      |
| Running average     | Simple      | Yes     | No           | No      |
| MOG2                | Medium      | Yes     | Yes          | Yes     |
| KNN                 | Medium      | Yes     | Yes          | Yes     |

---

## Practical Tips

1. **Let the model learn** — Feed 30–100 frames before expecting good results
2. **Tune the threshold** — Higher `varThreshold` (MOG2) = less sensitive to small changes
3. **Always post-process** — Use morphological operations to clean the mask
4. **Reduce resolution** — Process at half resolution for 4× speed improvement
5. **Low learning rate for virtual BG** — Use `learningRate=0.001` so people don't fade into background
6. **Shadow removal** — Threshold at 200+ to exclude shadow pixels (gray value 127)

---

## Try It Yourself

1. Use MOG2 on a webcam feed to detect yourself moving
2. Build a traffic monitoring system that counts cars
3. Create a virtual background app using your webcam and a custom image
4. Compare MOG2 and KNN side-by-side on the same video — which gives cleaner masks?

---

## Summary

- Background subtraction separates **foreground (moving)** from **background (static)**
- **Frame differencing** is simple but limited — no background model
- **Running average** adapts slowly with a learning rate $\alpha$
- **MOG2** models pixels as a mixture of Gaussians — handles complex backgrounds and shadows
- **KNN** is non-parametric — stores samples instead of fitting distributions
- Always **post-process masks** with morphological operations for cleaner results
- Applications: surveillance, people counting, traffic monitoring, virtual backgrounds

Next, we'll explore **Object Tracking** — following detected objects across video frames.
