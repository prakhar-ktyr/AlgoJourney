---
title: Video Processing Pipeline
---

# Video Processing Pipeline

A **video processing pipeline** reads video frames, applies transformations, and outputs the result — either to screen or a file. This lesson covers everything from reading/writing video to building a complete real-time processing application.

---

## Video Fundamentals

A video is a **sequence of images (frames)** displayed rapidly to create the illusion of motion.

| Concept     | Description                                         |
|-------------|-----------------------------------------------------|
| **Frame**   | A single image in the sequence                      |
| **FPS**     | Frames Per Second — typically 24, 30, or 60         |
| **Codec**   | Algorithm to compress/decompress video (H.264, XVID)|
| **FourCC**  | 4-character code identifying the codec              |
| **Resolution** | Width × Height in pixels (1920×1080, 1280×720)  |

Frame interval = $\frac{1000}{\text{FPS}}$ milliseconds. At 30 FPS, each frame has ~33ms of processing time.

---

## Reading Video

Use `cv2.VideoCapture` to read from a file or camera.

```python
import cv2

# From a file
cap = cv2.VideoCapture("video.mp4")

# From webcam (device index 0)
# cap = cv2.VideoCapture(0)

# Check if opened successfully
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Get video properties
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps if fps > 0 else 0

print(f"Resolution: {width}x{height}")
print(f"FPS: {fps}")
print(f"Total frames: {total_frames}")
print(f"Duration: {duration:.1f} seconds")

# Read frames in a loop
while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Video", frame)

    # Wait for key press (delay = 1000/fps for real-time playback)
    if cv2.waitKey(int(1000 / fps)) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
```

### Useful VideoCapture Properties

| Property                          | What It Returns                  |
|-----------------------------------|----------------------------------|
| `CAP_PROP_FPS`                    | Frames per second                |
| `CAP_PROP_FRAME_WIDTH`           | Frame width in pixels            |
| `CAP_PROP_FRAME_HEIGHT`          | Frame height in pixels           |
| `CAP_PROP_FRAME_COUNT`           | Total number of frames           |
| `CAP_PROP_POS_FRAMES`            | Current frame position           |
| `CAP_PROP_POS_MSEC`              | Current position in milliseconds |

```python
# Seek to a specific frame
cap.set(cv2.CAP_PROP_POS_FRAMES, 100)  # Jump to frame 100

# Seek to a specific time
cap.set(cv2.CAP_PROP_POS_MSEC, 5000)   # Jump to 5 seconds
```

---

## Writing Video

Save processed frames to a video file.

```python
import cv2

cap = cv2.VideoCapture("input.mp4")

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter
fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # or 'XVID', 'MJPG'
out = cv2.VideoWriter("output.mp4", fourcc, fps, (width, height))

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Process the frame (example: convert to grayscale)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # VideoWriter expects BGR, so convert back
    gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    # Write processed frame
    out.write(gray_bgr)

# Release everything
cap.release()
out.release()
print("Video saved to output.mp4")
```

### Common Codecs

| FourCC   | Format | File Extension | Notes                          |
|----------|--------|----------------|--------------------------------|
| `mp4v`   | MPEG-4 | .mp4           | Good compatibility             |
| `XVID`   | MPEG-4 | .avi           | Open source, good quality      |
| `MJPG`   | MJPEG  | .avi           | Large files, fast encoding     |
| `H264`   | H.264  | .mp4           | Best compression (needs codec) |

> **Tip:** If a codec doesn't work, try `MJPG` first — it's the most universally supported.

---

## Frame-by-Frame Processing Pipeline

The standard pattern for any video processing application:

```python
import cv2
import time


def process_video(input_path, output_path=None):
    """Generic video processing pipeline."""
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        print("Error: Cannot open video.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Optional: setup video writer
    out = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ---- YOUR PROCESSING HERE ----
        processed = frame  # Replace with actual processing
        # ---- END PROCESSING ----

        frame_count += 1

        # Calculate real-time FPS
        elapsed = time.time() - start_time
        real_fps = frame_count / elapsed if elapsed > 0 else 0

        # Display FPS on frame
        cv2.putText(
            processed, f"FPS: {real_fps:.1f}", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2
        )

        # Save if writer is set up
        if out:
            out.write(processed)

        cv2.imshow("Processing", processed)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Print summary
    total_time = time.time() - start_time
    print(f"Processed {frame_count} frames in {total_time:.1f}s")
    print(f"Average FPS: {frame_count / total_time:.1f}")

    cap.release()
    if out:
        out.release()
    cv2.destroyAllWindows()


process_video("input.mp4", "output.mp4")
```

---

## Common Video Operations

### Frame Extraction at Intervals

Save one frame per second (or any interval).

```python
import cv2
import os


def extract_frames(video_path, output_dir, interval_sec=1.0):
    """Extract frames from video at regular intervals."""
    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * interval_sec)

    frame_num = 0
    saved = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_num % frame_interval == 0:
            filename = os.path.join(output_dir, f"frame_{saved:04d}.jpg")
            cv2.imwrite(filename, frame)
            saved += 1

        frame_num += 1

    cap.release()
    print(f"Saved {saved} frames to {output_dir}")


extract_frames("video.mp4", "frames/", interval_sec=2.0)
```

### Time-Lapse and Slow Motion

```python
import cv2


def create_timelapse(input_path, output_path, speed_factor=4):
    """Create a time-lapse by skipping frames."""
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Keep same output FPS, but skip frames
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_num = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Only write every Nth frame
        if frame_num % speed_factor == 0:
            out.write(frame)

        frame_num += 1

    cap.release()
    out.release()
    print(f"Time-lapse saved ({speed_factor}x speed)")


create_timelapse("input.mp4", "timelapse.mp4", speed_factor=8)
```

---

## Real-Time Processing Considerations

For real-time video (webcam, live feed), your processing must be faster than the frame interval.

| FPS | Max Processing Time per Frame |
|-----|-------------------------------|
| 30  | 33 ms                         |
| 60  | 16 ms                         |
| 24  | 41 ms                         |

### Tips for Speed

1. **Reduce resolution** — Process at half size, display at full size
2. **Skip frames** — Process every 2nd or 3rd frame
3. **Use ROI** — Only process the region of interest
4. **Simpler algorithms** — Use Canny instead of deep learning edge detection
5. **GPU acceleration** — Use `cv2.cuda` functions if available

---

## Complete Video Processing App

A webcam application with multiple real-time effects, keyboard controls, and video saving.

```python
import cv2
import numpy as np
import time


class VideoProcessor:
    """Real-time video processing app with multiple effects."""

    def __init__(self, source=0):
        self.cap = cv2.VideoCapture(source)
        self.effects = {
            "none": lambda f: f,
            "gray": self._gray,
            "edges": self._edges,
            "blur": lambda f: cv2.GaussianBlur(f, (21, 21), 0),
            "negative": lambda f: cv2.bitwise_not(f),
            "cartoon": self._cartoon,
        }
        self.effect_names = list(self.effects.keys())
        self.effect_index = 0
        self.recording = False
        self.writer = None

    def _gray(self, frame):
        return cv2.cvtColor(
            cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR
        )

    def _edges(self, frame):
        edges = cv2.Canny(
            cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), 50, 150
        )
        return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    def _cartoon(self, frame):
        gray = cv2.medianBlur(
            cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), 7
        )
        edges = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY, 9, 9
        )
        color = cv2.bilateralFilter(frame, 9, 250, 250)
        return cv2.bitwise_and(color, color, mask=edges)

    def start_recording(self, filename="recording.avi"):
        fps = self.cap.get(cv2.CAP_PROP_FPS) or 30
        w = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*"XVID")
        self.writer = cv2.VideoWriter(filename, fourcc, fps, (w, h))
        self.recording = True

    def stop_recording(self):
        if self.writer:
            self.writer.release()
            self.writer = None
        self.recording = False

    def run(self):
        """Main processing loop."""
        if not self.cap.isOpened():
            print("Error: Cannot open video source.")
            return

        print("Controls: SPACE=next effect, r=record, s=screenshot, q=quit")

        frame_count = 0
        start_time = time.time()

        while True:
            ret, frame = self.cap.read()
            if not ret:
                break

            name = self.effect_names[self.effect_index]
            processed = self.effects[name](frame)

            frame_count += 1
            elapsed = time.time() - start_time
            fps = frame_count / elapsed if elapsed > 0 else 0

            # HUD overlay
            cv2.putText(
                processed, f"{name} | FPS: {fps:.1f}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2
            )
            if self.recording:
                cv2.circle(processed, (processed.shape[1] - 20, 20), 8, (0, 0, 255), -1)
                self.writer.write(processed)

            cv2.imshow("Video Processor", processed)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == 27:
                break
            elif key == ord(" "):
                self.effect_index = (self.effect_index + 1) % len(self.effect_names)
            elif key == ord("r"):
                self.stop_recording() if self.recording else self.start_recording()
            elif key == ord("s"):
                cv2.imwrite(f"screenshot_{int(time.time())}.jpg", processed)

        # Cleanup
        self.stop_recording()
        self.cap.release()
        cv2.destroyAllWindows()


# Run the app
if __name__ == "__main__":
    app = VideoProcessor(source=0)  # 0 = webcam
    app.run()
```

---

## Performance Optimization Tips

| Technique               | Speedup | Trade-off                    |
|-------------------------|---------|------------------------------|
| Reduce resolution       | 2–4×    | Lower detail                 |
| Skip frames             | 2–3×    | Less smooth output           |
| Use threading            | 1.5–2×  | Added complexity             |
| Process in grayscale    | 1.3×    | No color information         |
| Use ROI                 | 2–5×    | Only part of frame processed |
| OpenCV CUDA (GPU)       | 5–20×   | Requires NVIDIA GPU          |

### Threading (Brief)

For smoother performance, separate capture and processing into different threads using Python's `threading` module and a `queue.Queue`. The capture thread reads frames continuously; the main thread processes and displays them. This prevents heavy processing from causing frame drops.

---

## Practical Tips

1. **Always check `cap.isOpened()`** — Handle missing files/cameras gracefully
2. **Use `waitKey(1)`** for real-time processing — Higher values slow down the loop
3. **Release resources** — Always call `cap.release()` and `out.release()` in a `finally` block
4. **Match codec to container** — `mp4v` for `.mp4`, `XVID` for `.avi`
5. **Profile before optimizing** — Measure actual processing time per frame
6. **Use threading** — Separate I/O from computation for smoother performance

---

## Try It Yourself

1. Build a webcam app that applies real-time edge detection with FPS display
2. Create a time-lapse from a long video (8× speed)
3. Extract one frame per second from a video and save as JPEG
4. Build the complete video processor app with at least 4 different effects
5. Add threading to your video processor and compare FPS with and without it

---

## Summary

- **VideoCapture** reads from files or cameras; **VideoWriter** saves to files
- The standard pipeline: read → process → display/save, in a frame loop
- Use **FourCC** codes to specify codecs: `mp4v`, `XVID`, `MJPG`
- Real-time constraint: processing time must be less than $\frac{1000}{\text{FPS}}$ ms
- **Threading** separates capture from processing to prevent frame drops
- Optimize with: resolution reduction, frame skipping, ROI processing, grayscale
- A complete app combines effects, keyboard controls, recording, and HUD display

This wraps up our video processing section. You now have the tools to build complete computer vision applications — from reading frames to real-time processing pipelines!
