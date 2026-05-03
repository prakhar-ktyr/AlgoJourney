---
title: Object Tracking
---

# Object Tracking

**Object tracking** follows a specific object across video frames after it's been identified in the first frame. Unlike detection (finding objects in a single frame), tracking maintains the object's **identity and trajectory** over time.

---

## Tracking vs Detection

| Aspect          | Detection                           | Tracking                              |
|-----------------|-------------------------------------|---------------------------------------|
| **Goal**        | Find objects in a single frame      | Follow objects across frames          |
| **Speed**       | Slow (runs full model per frame)    | Fast (uses motion/appearance model)   |
| **Identity**    | No — re-detects each frame          | Yes — maintains object ID             |
| **Occlusion**   | Cannot handle                       | Can predict through short occlusions  |
| **Trajectory**  | None                                | Full path over time                   |

### Why Track Instead of Detect Every Frame?

1. **Speed** — Tracking is much faster than running detection on every frame
2. **Identity** — Know that "person A" in frame 1 is the same as in frame 100
3. **Occlusion handling** — Predict position when the object is temporarily hidden
4. **Trajectory analysis** — Compute speed, direction, and path of objects

---

## Mean Shift Tracking

**Mean Shift** is a color histogram-based tracker. It finds the densest region of a color distribution — the center of the object.

### How It Works

1. Define the initial object region (bounding box)
2. Compute the **color histogram** (back-projection) of the object
3. In each new frame, compute the back-projection
4. Use Mean Shift to find the **mode (peak)** of the distribution — that's where the object is

### Code: Mean Shift Tracker

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("video.mp4")

# Read the first frame
ret, frame = cap.read()

# Define initial tracking window (x, y, width, height)
# You can use cv2.selectROI() for interactive selection
x, y, w, h = 300, 200, 100, 150
track_window = (x, y, w, h)

# Extract the region of interest
roi = frame[y:y + h, x:x + w]
hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

# Compute the histogram of the ROI (Hue channel)
roi_hist = cv2.calcHist(
    [hsv_roi], [0], None,
    [180], [0, 180]
)
cv2.normalize(roi_hist, roi_hist, 0, 255, cv2.NORM_MINMAX)

# Termination criteria: 10 iterations or move by 1 pixel
term_criteria = (
    cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT,
    10, 1
)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert to HSV and compute back-projection
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    back_proj = cv2.calcBackProject(
        [hsv], [0], roi_hist, [0, 180], 1
    )

    # Apply Mean Shift to find new location
    ret_val, track_window = cv2.meanShift(
        back_proj, track_window, term_criteria
    )

    # Draw the tracking result
    x, y, w, h = track_window
    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(
        frame, "Mean Shift", (x, y - 10),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
    )

    cv2.imshow("Mean Shift Tracking", frame)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

### Limitation: Fixed Window Size

Mean Shift keeps the **same window size** throughout tracking. If the object grows (moves closer) or shrinks (moves away), the window won't adapt.

---

## CamShift: Continuously Adaptive Mean Shift

**CamShift** extends Mean Shift by automatically **adjusting the window size and rotation** to match the object.

```python
import cv2
import numpy as np

cap = cv2.VideoCapture("video.mp4")

ret, frame = cap.read()
x, y, w, h = 300, 200, 100, 150
track_window = (x, y, w, h)

# Setup ROI histogram (same as Mean Shift)
roi = frame[y:y + h, x:x + w]
hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
roi_hist = cv2.calcHist([hsv_roi], [0], None, [180], [0, 180])
cv2.normalize(roi_hist, roi_hist, 0, 255, cv2.NORM_MINMAX)

term_criteria = (
    cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT,
    10, 1
)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    back_proj = cv2.calcBackProject(
        [hsv], [0], roi_hist, [0, 180], 1
    )

    # CamShift — returns a rotated rectangle
    ret_val, track_window = cv2.CamShift(
        back_proj, track_window, term_criteria
    )

    # Draw rotated rectangle
    pts = cv2.boxPoints(ret_val)
    pts = np.intp(pts)
    cv2.polylines(frame, [pts], True, (0, 255, 0), 2)

    cv2.imshow("CamShift Tracking", frame)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

### Mean Shift vs CamShift

| Feature        | Mean Shift              | CamShift                    |
|----------------|-------------------------|-----------------------------|
| Window size    | Fixed                   | Adapts to object size       |
| Rotation       | None                    | Returns rotated rectangle   |
| Speed          | Faster                  | Slightly slower             |
| Use case       | Fixed-size objects      | Objects that change size    |

---

## OpenCV Tracker API

OpenCV provides a unified API for several modern tracking algorithms. Each has different strengths.

### Available Trackers

| Tracker   | Speed    | Accuracy | Occlusion | Best For                        |
|-----------|----------|----------|-----------|----------------------------------|
| **MOSSE** | Fastest  | Low      | Poor      | Real-time, many objects          |
| **KCF**   | Fast     | Medium   | Medium    | General purpose                  |
| **CSRT**  | Slow     | Highest  | Good      | Precise tracking, changing scale |

### CSRT Single-Object Tracking

```python
import cv2

cap = cv2.VideoCapture("video.mp4")
ret, frame = cap.read()

# Select the object to track interactively
bbox = cv2.selectROI(
    "Select Object", frame, fromCenter=False, showCrosshair=True
)
cv2.destroyWindow("Select Object")

# Create CSRT tracker (most accurate)
tracker = cv2.TrackerCSRT_create()
tracker.init(frame, bbox)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Update tracker
    success, bbox = tracker.update(frame)

    if success:
        # Draw bounding box
        x, y, w, h = [int(v) for v in bbox]
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(
            frame, "Tracking", (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )
    else:
        cv2.putText(
            frame, "Lost!", (50, 80),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3
        )

    cv2.imshow("CSRT Tracker", frame)

    if cv2.waitKey(30) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
```

### Tracker API Summary

```python
# Create a tracker
tracker = cv2.TrackerCSRT_create()   # Most accurate
# tracker = cv2.TrackerKCF_create()  # Good balance
# tracker = cv2.TrackerMOSSE_create() # Fastest

# Initialize with first frame and bounding box
tracker.init(frame, (x, y, w, h))

# Update on each new frame
success, bbox = tracker.update(frame)
# success: True if tracking, False if lost
# bbox: (x, y, w, h) of tracked object
```

---

## Multi-Object Tracking

Track several objects simultaneously using OpenCV's legacy MultiTracker or a manual approach.

```python
import cv2


def multi_object_tracking(video_path):
    """Track multiple objects selected by the user."""
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()

    # Select multiple objects
    bboxes = []
    colors = []

    print("Select objects to track. Press ENTER after each.")
    print("Press ESC when done selecting.")

    while True:
        bbox = cv2.selectROI(
            "Select Objects", frame, fromCenter=False
        )
        if bbox == (0, 0, 0, 0):
            break
        bboxes.append(bbox)
        # Random color for each object
        color = tuple(int(c) for c in list(
            __import__("numpy").random.randint(0, 255, 3)
        ))
        colors.append(color)

    cv2.destroyWindow("Select Objects")

    if not bboxes:
        print("No objects selected.")
        return

    # Create a tracker for each object
    trackers = []
    for bbox in bboxes:
        tracker = cv2.TrackerCSRT_create()
        tracker.init(frame, bbox)
        trackers.append(tracker)

    print(f"Tracking {len(trackers)} objects...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Update all trackers
        for i, tracker in enumerate(trackers):
            success, bbox = tracker.update(frame)

            if success:
                x, y, w, h = [int(v) for v in bbox]
                cv2.rectangle(
                    frame, (x, y), (x + w, y + h), colors[i], 2
                )
                cv2.putText(
                    frame, f"Object {i + 1}", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[i], 2
                )
            else:
                cv2.putText(
                    frame, f"Object {i + 1} LOST", (10, 30 + i * 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2
                )

        cv2.imshow("Multi-Object Tracking", frame)

        if cv2.waitKey(30) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


multi_object_tracking("traffic.mp4")
```

---

## SORT and DeepSORT (Brief Overview)

For production-level multi-object tracking, classical OpenCV trackers are often replaced by SORT and DeepSORT.

### SORT: Simple Online and Realtime Tracking

1. Run a **detector** (YOLO, SSD) on each frame
2. Use a **Kalman filter** to predict each tracked object's next position
3. Match detections to tracks using the **Hungarian algorithm** (IoU-based)
4. Create new tracks for unmatched detections, delete old unmatched tracks

### DeepSORT: Deep SORT

Adds a **deep appearance feature** (CNN embedding) to SORT:

1. Extract appearance features from detected bounding boxes
2. Use **cosine distance** on features + **Mahalanobis distance** on motion
3. Much better at handling **re-identification** after occlusion

| Feature           | SORT                          | DeepSORT                       |
|-------------------|-------------------------------|--------------------------------|
| **Motion model**  | Kalman filter                 | Kalman filter                  |
| **Appearance**    | None                          | CNN features                   |
| **Re-ID**         | Poor (ID switches)            | Good                           |
| **Speed**         | Very fast                     | Slower (CNN inference)         |
| **Matching**      | IoU only                      | IoU + appearance distance      |

---

## Tracking Metrics

How do you evaluate a tracker's performance?

| Metric    | Full Name                                  | What It Measures                  |
|-----------|--------------------------------------------|-----------------------------------|
| **MOTA**  | Multiple Object Tracking Accuracy          | Overall accuracy (misses + FP + switches) |
| **MOTP**  | Multiple Object Tracking Precision         | Average overlap with ground truth |
| **IDF1**  | ID F1 Score                                | How well identities are preserved |
| **FPS**   | Frames Per Second                          | Processing speed                  |

$$\text{MOTA} = 1 - \frac{\text{FN} + \text{FP} + \text{ID Switches}}{\text{Ground Truth Objects}}$$

- **MOTA** close to 1.0 = excellent tracking
- **IDF1** is often preferred for applications where identity matters (surveillance)

---

## Tracker Comparison Table

| Tracker    | Speed (FPS) | Scale Change | Rotation | Occlusion | Complexity |
|------------|-------------|--------------|----------|-----------|------------|
| Mean Shift | 200+        | No           | No       | Poor      | Very Low   |
| CamShift   | 200+        | Yes          | Yes      | Poor      | Low        |
| MOSSE      | 700+        | No           | No       | Poor      | Very Low   |
| KCF        | 150+        | No           | No       | Medium    | Low        |
| CSRT       | 25-40       | Yes          | Yes      | Good      | Medium     |
| SORT       | 60+         | Via detector | No       | Poor      | Medium     |
| DeepSORT   | 20-40       | Via detector | No       | Good      | High       |

---

## Practical Tips

1. **Start with CSRT** — Best accuracy for single-object tracking out of the box
2. **Use MOSSE for speed** — When tracking many objects or on low-power hardware
3. **Combine detection + tracking** — Detect every N frames, track in between
4. **Handle lost tracks** — Set a timeout and fall back to detection
5. **Track in ROI** — If you know the general area, crop the frame to speed things up
6. **Color-based trackers** — Mean Shift/CamShift work best for distinctly colored objects

---

## Try It Yourself

1. Track a moving object in a webcam feed using the CSRT tracker
2. Track multiple objects simultaneously (e.g., cars in traffic)
3. Build a tracker that re-initializes when the object is lost (use 'r' key to re-select)
4. Compare MOSSE, KCF, and CSRT on the same video — note the speed/accuracy trade-off

---

## Summary

- **Tracking** follows objects across frames — faster than per-frame detection
- **Mean Shift** and **CamShift** use color histograms; CamShift adapts window size
- **CSRT** is the most accurate OpenCV tracker; **MOSSE** is the fastest
- The tracker API: `create()` → `init(frame, bbox)` → `update(frame)` loop
- **SORT** uses Kalman filter + Hungarian algorithm for multi-object tracking
- **DeepSORT** adds CNN appearance features for better re-identification
- Metrics: **MOTA** measures accuracy, **IDF1** measures identity preservation

Next, we'll explore **Video Processing Pipeline** — building complete video applications from capture to output.
