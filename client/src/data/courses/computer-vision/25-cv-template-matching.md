---
title: Template Matching
---

# Template Matching

In this lesson, you will learn how to find a small image (template) inside a larger image — a simple but powerful technique for object detection without machine learning.

---

## What Is Template Matching?

**Template matching** finds the location of a template image within a larger search image by sliding the template over the image and computing a similarity score at every position.

**Think of it like:** Sliding a puzzle piece over a picture to find where it fits.

**Use cases:**
- Finding icons/buttons in screenshots
- Detecting known objects in controlled environments
- Quality control in manufacturing
- Game automation (finding UI elements)
- Document processing (finding stamps, signatures)

---

## How It Works

1. Take a small **template** image (what you're looking for)
2. Slide it over the larger **source** image, pixel by pixel
3. At each position, compute a **similarity score**
4. Find the position with the best score

The result is a **score map** — a grayscale image where bright (or dark) pixels indicate good matches.

---

## The matchTemplate Function

```python
import cv2
import numpy as np

# Load images
img = cv2.imread("screenshot.jpg")
template = cv2.imread("icon.jpg")

# Convert to grayscale (faster, usually sufficient)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

# Template matching
result = cv2.matchTemplate(gray, template_gray, cv2.TM_CCOEFF_NORMED)

# Result shape
h, w = template_gray.shape
print(f"Source image: {gray.shape[1]}x{gray.shape[0]}")
print(f"Template: {w}x{h}")
print(f"Result map: {result.shape[1]}x{result.shape[0]}")
# Result size = (W - w + 1) x (H - h + 1)
```

---

## Matching Methods

OpenCV provides six methods for computing similarity:

### TM_SQDIFF (Sum of Squared Differences)

$$R(x,y) = \sum_{x',y'} \left[ T(x',y') - I(x+x', y+y') \right]^2$$

- **Best match:** MINIMUM value (0 = perfect match)
- Lower is better

### TM_SQDIFF_NORMED (Normalized)

$$R(x,y) = \frac{\sum_{x',y'} [T(x',y') - I(x+x', y+y')]^2}{\sqrt{\sum_{x',y'} T(x',y')^2 \cdot \sum_{x',y'} I(x+x', y+y')^2}}$$

- Range: [0, 1] where 0 = perfect match
- Better for comparing across different images

### TM_CCORR (Cross-Correlation)

$$R(x,y) = \sum_{x',y'} T(x',y') \cdot I(x+x', y+y')$$

- **Best match:** MAXIMUM value
- Can give false positives in bright regions

### TM_CCORR_NORMED (Normalized Cross-Correlation)

$$R(x,y) = \frac{\sum_{x',y'} T(x',y') \cdot I(x+x', y+y')}{\sqrt{\sum_{x',y'} T(x',y')^2 \cdot \sum_{x',y'} I(x+x', y+y')^2}}$$

- Range: [0, 1] where 1 = perfect match
- More robust to brightness changes

### TM_CCOEFF (Correlation Coefficient)

$$R(x,y) = \sum_{x',y'} T'(x',y') \cdot I'(x+x', y+y')$$

Where $T' = T - \bar{T}$ and $I' = I - \bar{I}$ (mean-subtracted).

- Removes mean intensity → robust to uniform brightness shift
- **Best match:** MAXIMUM value

### TM_CCOEFF_NORMED (Best General Purpose)

$$R(x,y) = \frac{\sum_{x',y'} T'(x',y') \cdot I'(x+x', y+y')}{\sqrt{\sum_{x',y'} T'(x',y')^2 \cdot \sum_{x',y'} I'(x+x', y+y')^2}}$$

- Range: [-1, 1] where 1 = perfect match
- **Most commonly used** — robust to brightness and contrast changes
- **Recommended** for most applications

### Method Summary

| Method | Best Match | Range | Brightness Robust |
|---|---|---|---|
| `TM_SQDIFF` | Minimum | [0, ∞) | No |
| `TM_SQDIFF_NORMED` | Minimum | [0, 1] | Partial |
| `TM_CCORR` | Maximum | [0, ∞) | No |
| `TM_CCORR_NORMED` | Maximum | [0, 1] | Partial |
| `TM_CCOEFF` | Maximum | [-∞, ∞) | Yes |
| `TM_CCOEFF_NORMED` | Maximum | [-1, 1] | Yes |

---

## Finding the Best Match

```python
import cv2
import numpy as np

# Load images
img = cv2.imread("desktop.jpg")
template = cv2.imread("button.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

h, w = template_gray.shape

# Match using normalized correlation coefficient
result = cv2.matchTemplate(gray, template_gray, cv2.TM_CCOEFF_NORMED)

# Find best match location
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

# For TM_CCOEFF_NORMED: max_loc is best
# For TM_SQDIFF variants: min_loc is best
method = cv2.TM_CCOEFF_NORMED
if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
    top_left = min_loc
    score = min_val
else:
    top_left = max_loc
    score = max_val

bottom_right = (top_left[0] + w, top_left[1] + h)

print(f"Best match at: {top_left}")
print(f"Match score: {score:.4f}")
print(f"Confidence: {score*100:.1f}%")

# Draw rectangle around match
img_result = img.copy()
cv2.rectangle(img_result, top_left, bottom_right, (0, 255, 0), 2)
cv2.putText(img_result, f"{score:.3f}", (top_left[0], top_left[1] - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

cv2.imshow("Match Found", img_result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Comparing All Methods

```python
import cv2
import numpy as np

# Load images
img = cv2.imread("scene.jpg")
template = cv2.imread("target.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
h, w = template_gray.shape

# All methods
methods = [
    ("TM_SQDIFF", cv2.TM_SQDIFF),
    ("TM_SQDIFF_NORMED", cv2.TM_SQDIFF_NORMED),
    ("TM_CCORR", cv2.TM_CCORR),
    ("TM_CCORR_NORMED", cv2.TM_CCORR_NORMED),
    ("TM_CCOEFF", cv2.TM_CCOEFF),
    ("TM_CCOEFF_NORMED", cv2.TM_CCOEFF_NORMED),
]

print(f"{'Method':<22} {'Score':<12} {'Location'}")
print("-" * 55)

for name, method in methods:
    result = cv2.matchTemplate(gray, template_gray, method)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    # Choose min or max based on method
    if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
        score = min_val
        loc = min_loc
    else:
        score = max_val
        loc = max_loc
    
    print(f"{name:<22} {score:<12.4f} {loc}")
    
    # Draw on copy
    img_copy = img.copy()
    cv2.rectangle(img_copy, loc, (loc[0]+w, loc[1]+h), (0, 255, 0), 2)
    cv2.imshow(name, img_copy)

cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Multi-Object Detection

When the template appears **multiple times** in the image:

```python
import cv2
import numpy as np

# Load images
img = cv2.imread("coins.jpg")
template = cv2.imread("single_coin.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
h, w = template_gray.shape

# Template matching
result = cv2.matchTemplate(gray, template_gray, cv2.TM_CCOEFF_NORMED)

# Threshold to find all good matches
threshold = 0.8
locations = np.where(result >= threshold)

# locations is (rows, cols) = (y_coords, x_coords)
match_count = len(locations[0])
print(f"Matches above threshold ({threshold}): {match_count}")

# Draw all matches
img_result = img.copy()
for pt_y, pt_x in zip(*locations):
    top_left = (pt_x, pt_y)
    bottom_right = (pt_x + w, pt_y + h)
    cv2.rectangle(img_result, top_left, bottom_right, (0, 255, 0), 2)

cv2.imshow(f"Found {match_count} matches", img_result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

### Non-Maximum Suppression (NMS)

Multiple detections often overlap. Use NMS to keep only the best:

```python
import cv2
import numpy as np

def non_max_suppression(boxes, scores, overlap_thresh=0.3):
    """Remove overlapping detections, keeping highest scores."""
    if len(boxes) == 0:
        return []
    
    boxes = np.array(boxes, dtype=np.float32)
    scores = np.array(scores)
    
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    
    areas = (x2 - x1 + 1) * (y2 - y1 + 1)
    order = scores.argsort()[::-1]  # Sort by score descending
    
    keep = []
    
    while len(order) > 0:
        i = order[0]
        keep.append(i)
        
        # Compute IoU with remaining boxes
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        
        w_inter = np.maximum(0, xx2 - xx1 + 1)
        h_inter = np.maximum(0, yy2 - yy1 + 1)
        intersection = w_inter * h_inter
        
        iou = intersection / (areas[i] + areas[order[1:]] - intersection)
        
        # Keep boxes with low IoU (no significant overlap)
        remaining = np.where(iou <= overlap_thresh)[0]
        order = order[remaining + 1]
    
    return keep


# Usage with template matching
img = cv2.imread("coins.jpg")
template = cv2.imread("single_coin.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
h, w = template_gray.shape

result = cv2.matchTemplate(gray, template_gray, cv2.TM_CCOEFF_NORMED)

threshold = 0.7
locations = np.where(result >= threshold)

# Build boxes and scores
boxes = []
scores = []
for pt_y, pt_x in zip(*locations):
    boxes.append([pt_x, pt_y, pt_x + w, pt_y + h])
    scores.append(result[pt_y, pt_x])

print(f"Before NMS: {len(boxes)} detections")

# Apply NMS
keep = non_max_suppression(boxes, scores, overlap_thresh=0.3)
print(f"After NMS: {len(keep)} detections")

# Draw final detections
img_result = img.copy()
for idx in keep:
    x1, y1, x2, y2 = [int(v) for v in boxes[idx]]
    score = scores[idx]
    cv2.rectangle(img_result, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(img_result, f"{score:.2f}", (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

cv2.imshow(f"NMS Result: {len(keep)} objects", img_result)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

---

## Limitations of Template Matching

| Limitation | Problem |
|---|---|
| **Not rotation invariant** | Rotated objects won't match |
| **Not scale invariant** | Different-sized objects won't match |
| **Sensitive to lighting** | Works best under consistent illumination |
| **Slow for large images** | Slides over every pixel |
| **Single viewpoint** | 3D objects from different angles won't match |
| **Occlusion** | Partially hidden objects may not match |

**When to use template matching:**
- Object appearance is consistent (icons, logos, text)
- Scale and rotation don't change
- Controlled environments

**When NOT to use:**
- Objects can rotate or resize
- Variable lighting
- Real-world object detection → use deep learning instead

---

## Multi-Scale Template Matching

Handle scale variation by matching at multiple template sizes:

```python
import cv2
import numpy as np

def multi_scale_match(img, template, method=cv2.TM_CCOEFF_NORMED,
                      scale_range=(0.5, 2.0), num_scales=20):
    """Find template at multiple scales."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY) if len(template.shape) == 3 else template
    
    th, tw = template_gray.shape[:2]
    best_score = -1 if method not in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED] else float('inf')
    best_loc = None
    best_scale = 1.0
    
    scales = np.linspace(scale_range[0], scale_range[1], num_scales)
    
    for scale in scales:
        # Resize template
        new_w = int(tw * scale)
        new_h = int(th * scale)
        
        # Skip if template is larger than image
        if new_w >= gray.shape[1] or new_h >= gray.shape[0]:
            continue
        if new_w < 10 or new_h < 10:  # Too small
            continue
        
        resized = cv2.resize(template_gray, (new_w, new_h))
        
        # Match
        result = cv2.matchTemplate(gray, resized, method)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
        
        # Check if this scale is better
        if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
            if min_val < best_score:
                best_score = min_val
                best_loc = min_loc
                best_scale = scale
        else:
            if max_val > best_score:
                best_score = max_val
                best_loc = max_loc
                best_scale = scale
    
    return best_loc, best_score, best_scale


# Usage
img = cv2.imread("photo.jpg")
template = cv2.imread("object.jpg")

loc, score, scale = multi_scale_match(img, template)

if loc is not None:
    th, tw = template.shape[:2]
    w = int(tw * scale)
    h = int(th * scale)
    
    print(f"Found at: {loc}")
    print(f"Score: {score:.4f}")
    print(f"Scale: {scale:.2f}x")
    
    # Draw detection
    img_result = img.copy()
    cv2.rectangle(img_result, loc, (loc[0] + w, loc[1] + h), (0, 255, 0), 2)
    cv2.putText(img_result, f"Scale: {scale:.2f}x Score: {score:.3f}",
                (loc[0], loc[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    cv2.imshow("Multi-Scale Match", img_result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

---

## Template Matching vs Feature Matching

| Aspect | Template Matching | Feature Matching |
|---|---|---|
| **Approach** | Pixel-by-pixel comparison | Keypoint descriptors |
| **Rotation** | Not invariant | Invariant (SIFT/ORB) |
| **Scale** | Not invariant (needs multi-scale) | Invariant |
| **Speed** | Fast for small templates | Slower (detection + matching) |
| **Accuracy** | Pixel-precise | Good (sub-pixel with refinement) |
| **Best for** | Fixed appearance objects | Varying viewpoints |
| **Implementation** | Simple | More complex |

---

## Tips for Better Template Matching

1. **Use grayscale** unless color is distinctive
2. **Normalize images** (histogram equalization) for lighting robustness
3. **Use TM_CCOEFF_NORMED** as your default method
4. **Apply Gaussian blur** to reduce noise sensitivity
5. **Use multi-scale** if object size varies
6. **Set threshold carefully:** too low = false positives, too high = missed detections
7. **Apply NMS** when detecting multiple instances
8. **Consider edge templates** (Canny edges) for more robust matching

---

## Summary

| Concept | Key Takeaway |
|---|---|
| Template matching | Slide template over image, find best similarity |
| `TM_CCOEFF_NORMED` | Best general method, range [-1, 1] |
| `minMaxLoc` | Find best match location in result map |
| Multi-object | Threshold result + NMS for multiple detections |
| Multi-scale | Resize template at multiple scales |
| Limitations | No rotation/scale invariance — use features instead |

Template matching is simple, fast, and effective for controlled scenarios. For more complex detection tasks with varying scale, rotation, and viewpoint, use feature matching (previous lessons) or deep learning approaches!

---
