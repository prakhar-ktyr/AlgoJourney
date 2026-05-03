---
title: Face Detection & Recognition
---

# Face Detection & Recognition

In this lesson, you will learn how to **detect faces** in images and **recognize** whose face it is — from classical approaches to modern deep learning methods.

---

## Face Detection vs Recognition

| Task | Question | Output |
|------|----------|--------|
| Face Detection | "Where are the faces?" | Bounding boxes |
| Face Recognition | "Whose face is it?" | Identity label |

Face detection finds faces. Face recognition identifies them. Recognition always requires detection first.

---

## Classical Face Detection

### Viola-Jones (Haar Cascades)

The first real-time face detector (2001). Uses hand-crafted Haar-like features and a cascade of classifiers.

```python
import cv2
import matplotlib.pyplot as plt


def detect_faces_haar(image_path):
    """Detect faces using Haar cascade classifier."""
    # Load pre-trained cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    # Read image
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    print(f"Found {len(faces)} faces")

    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

    return faces


faces = detect_faces_haar("group_photo.jpg")
```

**Limitations:** Struggles with rotated faces, occlusion, and varying lighting.

### HOG + SVM (dlib)

HOG features + SVM classifier — more robust than Haar cascades:

```python
import dlib

def detect_faces_hog(image_path):
    """Detect faces using dlib's HOG + SVM detector."""
    detector = dlib.get_frontal_face_detector()
    image = cv2.imread(image_path)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    faces = detector(rgb, 1)  # 1 = upsample count
    print(f"Found {len(faces)} faces")
    return faces


faces = detect_faces_hog("group_photo.jpg")
```

---

## Deep Learning Face Detection

### MTCNN (Multi-task Cascaded CNN)

Three-stage cascade: P-Net → R-Net → O-Net.

```python
from facenet_pytorch import MTCNN
from PIL import Image


def detect_faces_mtcnn(image_path):
    """Detect faces and landmarks using MTCNN."""
    mtcnn = MTCNN(
        keep_all=True,
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    image = Image.open(image_path).convert("RGB")
    boxes, probs, landmarks = mtcnn.detect(image, landmarks=True)

    if boxes is not None:
        print(f"Detected {len(boxes)} faces")
        for i, (box, prob) in enumerate(zip(boxes, probs)):
            print(f"  Face {i}: confidence={prob:.3f}, box={box.astype(int)}")

    return boxes, probs, landmarks


boxes, probs, landmarks = detect_faces_mtcnn("group_photo.jpg")
```

### RetinaFace

High-accuracy face detection with landmark prediction:

- Single-stage detector (anchor-based)
- Predicts 5 facial landmarks
- Works well on small faces and challenging poses

### BlazeFace (MediaPipe)

Mobile-optimized face detection:

```python
import mediapipe as mp
import cv2


def detect_faces_mediapipe(image_path):
    """Detect faces using MediaPipe."""
    mp_face_detection = mp.solutions.face_detection

    with mp_face_detection.FaceDetection(
        model_selection=1, min_detection_confidence=0.5
    ) as face_detection:
        image = cv2.imread(image_path)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_detection.process(rgb)

        if results.detections:
            print(f"Detected {len(results.detections)} faces")
        return results.detections


detections = detect_faces_mediapipe("group_photo.jpg")
```

### OpenCV DNN Face Detector

```python
def detect_faces_dnn(image_path, confidence_threshold=0.5):
    """Detect faces using OpenCV's DNN module (SSD-based)."""
    model_file = "res10_300x300_ssd_iter_140000.caffemodel"
    config_file = "deploy.prototxt"
    net = cv2.dnn.readNetFromCaffe(config_file, model_file)

    image = cv2.imread(image_path)
    h, w = image.shape[:2]

    blob = cv2.dnn.blobFromImage(
        image, 1.0, (300, 300), (104.0, 177.0, 123.0)
    )
    net.setInput(blob)
    detections = net.forward()

    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            x1, y1, x2, y2 = box.astype(int)
            faces.append((x1, y1, x2, y2, confidence))

    print(f"Detected {len(faces)} faces")
    return faces
```

---

## Face Landmarks

Face landmarks are specific points on the face (eyes, nose, mouth, jawline).

### 68-Point Landmarks (dlib)

```python
import dlib
import cv2
import numpy as np


def detect_landmarks_68(image_path):
    """Detect 68 facial landmarks using dlib."""
    # Download shape_predictor_68_face_landmarks.dat from dlib website
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
    detector = dlib.get_frontal_face_detector()

    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = detector(gray)

    for face in faces:
        # Get landmarks
        landmarks = predictor(gray, face)

        # Draw landmarks
        for i in range(68):
            x = landmarks.part(i).x
            y = landmarks.part(i).y
            cv2.circle(image, (x, y), 2, (0, 255, 0), -1)
            cv2.putText(image, str(i), (x - 5, y - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 0, 0), 1)

    cv2.imwrite("landmarks_68.jpg", image)
    return landmarks


landmarks = detect_landmarks_68("face.jpg")
```

### Landmark Groups

```python
# 68 landmarks are organized in groups:
LANDMARK_GROUPS = {
    "jaw":        list(range(0, 17)),    # 0-16
    "right_brow": list(range(17, 22)),   # 17-21
    "left_brow":  list(range(22, 27)),   # 22-26
    "nose":       list(range(27, 36)),   # 27-35
    "right_eye":  list(range(36, 42)),   # 36-41
    "left_eye":   list(range(42, 48)),   # 42-47
    "mouth":      list(range(48, 68)),   # 48-67
}
```

### MediaPipe Face Mesh (468 landmarks)

MediaPipe Face Mesh detects 468 facial landmarks in real-time, including iris tracking. Use `mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)` for the most detailed output.

---

## Face Alignment

Normalize face orientation before recognition for better accuracy:

```python
import numpy as np
import cv2


def align_face(image, left_eye_center, right_eye_center, face_width=256):
    """
    Align face using eye positions.
    Rotates and scales so eyes are at consistent positions.
    """
    desired_left_eye = (0.35, 0.35)
    desired_right_eye_x = 1.0 - desired_left_eye[0]

    # Compute angle between eyes
    dy = right_eye_center[1] - left_eye_center[1]
    dx = right_eye_center[0] - left_eye_center[0]
    angle = np.degrees(np.arctan2(dy, dx))

    # Compute scale
    dist = np.sqrt(dx ** 2 + dy ** 2)
    desired_dist = (desired_right_eye_x - desired_left_eye[0]) * face_width
    scale = desired_dist / dist

    # Rotation matrix centered between eyes
    eyes_center = (
        (left_eye_center[0] + right_eye_center[0]) / 2,
        (left_eye_center[1] + right_eye_center[1]) / 2
    )
    M = cv2.getRotationMatrix2D(eyes_center, angle, scale)
    M[0, 2] += (face_width * 0.5 - eyes_center[0])
    M[1, 2] += (face_width * desired_left_eye[1] - eyes_center[1])

    aligned = cv2.warpAffine(image, M, (face_width, face_width),
                              flags=cv2.INTER_CUBIC)
    return aligned
```

---

## Face Recognition Pipeline

```
1. Detect Face        → bounding box
2. Align Face         → normalized face crop
3. Extract Embedding  → 128/512-dim feature vector
4. Compare Embeddings → cosine similarity or L2 distance
```

### Face Embeddings

A face embedding is a compact vector that represents a face's identity.

**FaceNet** (Google, 2015) uses **triplet loss**:

$$L = \sum \max(||f(a) - f(p)||^2 - ||f(a) - f(n)||^2 + \alpha, 0)$$

Where:
- $f(a)$ = embedding of anchor face
- $f(p)$ = embedding of positive (same person)
- $f(n)$ = embedding of negative (different person)
- $\alpha$ = margin (e.g., 0.2)

The loss pushes same-person embeddings closer and different-person embeddings apart.

**ArcFace** (2019) uses **additive angular margin loss** for even better separation:

$$L = -\log \frac{e^{s \cos(\theta_{y_i} + m)}}{e^{s \cos(\theta_{y_i} + m)} + \sum_{j \neq y_i} e^{s \cos \theta_j}}$$

Where $m$ is the angular margin and $s$ is a scale factor.

---

## Using face_recognition Library

The `face_recognition` library wraps dlib's face recognition model.

```python
import face_recognition
import cv2
import numpy as np


def build_face_database(known_images):
    """
    Build a database of known face embeddings.

    Args:
        known_images: dict of {name: image_path}
    Returns:
        dict of {name: embedding}
    """
    database = {}

    for name, image_path in known_images.items():
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)

        if encodings:
            database[name] = encodings[0]  # 128-dim vector
            print(f"Enrolled: {name}")
        else:
            print(f"No face found in {image_path}")

    return database


def recognize_faces(image_path, database, tolerance=0.6):
    """
    Recognize faces in an image against a known database.

    Args:
        image_path: path to image with unknown faces
        database: dict of {name: embedding}
        tolerance: distance threshold (lower = stricter)
    """
    image = face_recognition.load_image_file(image_path)

    # Detect and encode faces
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)

    results = []
    known_names = list(database.keys())
    known_encodings = list(database.values())

    for face_encoding, face_location in zip(face_encodings, face_locations):
        # Compare against all known faces
        distances = face_recognition.face_distance(known_encodings, face_encoding)
        best_match_idx = np.argmin(distances)

        if distances[best_match_idx] < tolerance:
            name = known_names[best_match_idx]
            confidence = 1 - distances[best_match_idx]
        else:
            name = "Unknown"
            confidence = 0.0

        results.append({
            "name": name,
            "confidence": confidence,
            "location": face_location  # (top, right, bottom, left)
        })

    return results


# Example usage
known = {
    "Alice": "alice.jpg",
    "Bob": "bob.jpg",
    "Charlie": "charlie.jpg",
}

database = build_face_database(known)
results = recognize_faces("group_photo.jpg", database)

for r in results:
    print(f"{r['name']} (confidence: {r['confidence']:.2f})")
```

### Visualizing Recognition Results

```python
def visualize_recognition(image_path, results):
    """Draw recognition results on image."""
    image = cv2.imread(image_path)

    for r in results:
        top, right, bottom, left = r["location"]
        name = r["name"]
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(image, (left, top), (right, bottom), color, 2)
        cv2.putText(image, name, (left + 6, bottom - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

    cv2.imwrite("recognition_result.jpg", image)
```

---

## Ethics of Face Recognition

Face recognition raises serious ethical concerns:

| Concern | Details |
|---------|---------|
| **Bias** | Models trained mostly on certain demographics perform worse on others |
| **Privacy** | Mass surveillance without consent |
| **Consent** | People may not want their face in a database |
| **Regulations** | GDPR, BIPA, and other laws restrict use |
| **Misidentification** | False positives can have severe consequences |

**Best practices:**
- Always obtain consent before enrolling faces
- Test for demographic bias
- Implement access controls on face databases
- Follow local regulations (some regions ban facial recognition)
- Provide opt-out mechanisms

---

## Liveness Detection (Anti-Spoofing)

Prevent attacks using photos or videos of a face:

```python
# Common liveness detection approaches:

# 1. Blink detection (simple)
# Track eye aspect ratio over frames

def eye_aspect_ratio(eye_landmarks):
    """Compute EAR to detect blinks."""
    # Vertical distances
    A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
    B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
    # Horizontal distance
    C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
    ear = (A + B) / (2.0 * C)
    return ear

# EAR drops below ~0.2 during a blink

# 2. Texture analysis (detect flat printouts)
# 3. Depth estimation (detect 2D photos)
# 4. Challenge-response (ask user to turn head, smile, etc.)
```

---

## Summary

- **Face detection:** find faces (Haar cascades, MTCNN, RetinaFace, MediaPipe)
- **Landmarks:** localize facial features (5-point, 68-point, 468 Face Mesh)
- **Alignment:** normalize face orientation using eye positions
- **Recognition pipeline:** detect → align → embed → compare
- **FaceNet** triplet loss: $L = \max(||f(a)-f(p)||^2 - ||f(a)-f(n)||^2 + \alpha, 0)$
- **face_recognition** library makes it easy in Python
- Always consider **ethics**: bias, privacy, consent

---

## Exercise

Try this:

1. Use Haar cascades to detect faces in a group photo — note any missed faces
2. Compare detection accuracy: Haar cascade vs MediaPipe on the same image
3. Build a small face database (3-5 people) and test recognition with `face_recognition`
4. Implement eye aspect ratio (EAR) calculation for blink detection

---
