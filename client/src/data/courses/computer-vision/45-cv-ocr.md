---
title: OCR & Text Detection
---

# OCR & Text Detection

In this lesson, you will learn how to **detect** and **recognize** text in images — from scanned documents to street signs — using Optical Character Recognition (OCR).

---

## What Is OCR?

**OCR (Optical Character Recognition)** converts images of text into machine-readable text.

```
Input:  Image of a document / sign / receipt
Output: "Hello, World!" (plain text string)
```

### Two Sub-Tasks

| Task | Question | Output |
|------|----------|--------|
| Text Detection | "Where is text in the image?" | Bounding boxes around text regions |
| Text Recognition | "What does the text say?" | Character string |

**End-to-end OCR** = detection + recognition together.

---

## Scene Text vs Document Text

| | Document Text | Scene Text |
|--|---------------|------------|
| Background | Clean, white | Complex, varied |
| Font | Standard, uniform | Varied, artistic |
| Layout | Structured (lines, paragraphs) | Random positions, orientations |
| Distortion | Minimal | Perspective, curved, occluded |
| Examples | Scanned papers, PDFs | Street signs, product labels |

Scene text is much harder due to varied backgrounds, fonts, and orientations.

---

## Classical Approaches

### MSER (Maximally Stable Extremal Regions)

Detects regions of consistent intensity — often correspond to text characters:

```python
import cv2
import numpy as np


def detect_text_mser(image_path):
    """Detect text regions using MSER."""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Create MSER detector
    mser = cv2.MSER_create(
        _delta=5,
        _min_area=60,
        _max_area=14400,
        _max_variation=0.25
    )

    # Detect regions
    regions, _ = mser.detectRegions(gray)

    # Draw detected regions
    hulls = [cv2.convexHull(p.reshape(-1, 1, 2)) for p in regions]
    cv2.polylines(image, hulls, True, (0, 255, 0), 1)

    print(f"Detected {len(regions)} text candidate regions")
    cv2.imwrite("mser_result.jpg", image)
    return regions
```

### SWT (Stroke Width Transform)

Identifies text by finding regions with consistent stroke width. Characters have uniform stroke width, unlike most background textures.

---

## Deep Learning Text Detection

### EAST (Efficient and Accurate Scene Text Detector)

EAST directly predicts text boxes without complex post-processing:

```python
import cv2
import numpy as np


def detect_text_east(image_path, model_path="frozen_east_text_detection.pb",
                     confidence_threshold=0.5):
    """Detect text using EAST model with OpenCV DNN."""
    net = cv2.dnn.readNet(model_path)

    image = cv2.imread(image_path)
    orig_h, orig_w = image.shape[:2]

    # EAST requires dimensions multiple of 32
    new_w, new_h = 640, 640
    image_resized = cv2.resize(image, (new_w, new_h))
    blob = cv2.dnn.blobFromImage(
        image_resized, 1.0, (new_w, new_h),
        (123.68, 116.78, 103.94), swapRB=True, crop=False
    )

    # Run EAST — outputs confidence scores + geometry (distances + angle)
    net.setInput(blob)
    output_layers = ["feature_fusion/Conv_7/Sigmoid", "feature_fusion/concat_3"]
    scores, geometry = net.forward(output_layers)

    # Decode: for each high-confidence position, compute rotated bounding box
    # from the 4 distance values (top, right, bottom, left) + rotation angle
    # Then apply NMS to filter overlapping detections
    boxes, confidences = decode_east_predictions(scores, geometry, confidence_threshold)
    indices = cv2.dnn.NMSBoxesRotated(boxes, confidences, confidence_threshold, 0.4)

    print(f"Detected {len(indices)} text regions")
    return boxes, indices
```

### CRAFT (Character Region Awareness for Text Detection)

Detects individual characters and links them into words:

- Predicts **character regions** (where each character is)
- Predicts **affinity regions** (which characters belong together)
- Groups characters into words using affinity scores

### DBNet (Differentiable Binarization)

Uses a learnable threshold for binarizing text regions:

- Predicts probability map (where text is)
- Predicts threshold map (adaptive binarization)
- Differentiable binarization allows end-to-end training
- Fast and accurate

---

## Deep Learning Text Recognition

### CRNN (CNN + RNN + CTC)

The standard architecture for text recognition:

```
Image of text → CNN (feature extraction)
                 → RNN (sequence modeling)
                   → CTC (decode to text)
```

```python
import torch
import torch.nn as nn


class CRNN(nn.Module):
    """CNN + RNN + CTC for text recognition."""

    def __init__(self, num_classes, hidden_size=256):
        super().__init__()

        # CNN: extract visual features
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2, 2),
            nn.Conv2d(128, 256, 3, 1, 1), nn.ReLU(),
            nn.Conv2d(256, 256, 3, 1, 1), nn.ReLU(), nn.MaxPool2d((2, 1)),
            nn.Conv2d(256, 512, 3, 1, 1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.Conv2d(512, 512, 3, 1, 1), nn.BatchNorm2d(512), nn.ReLU(),
            nn.MaxPool2d((2, 1)),
            nn.Conv2d(512, 512, 2, 1, 0), nn.ReLU(),  # [B, 512, 1, W]
        )

        # RNN: model character sequence
        self.rnn = nn.LSTM(
            512, hidden_size, num_layers=2,
            bidirectional=True, batch_first=True
        )

        # Output: one character prediction per time step
        self.fc = nn.Linear(hidden_size * 2, num_classes)

    def forward(self, x):
        # x: [batch, 1, H, W] (grayscale text image)
        features = self.cnn(x)              # [B, 512, 1, W']
        features = features.squeeze(2)       # [B, 512, W']
        features = features.permute(0, 2, 1) # [B, W', 512]

        rnn_out, _ = self.rnn(features)      # [B, W', hidden*2]
        output = self.fc(rnn_out)            # [B, W', num_classes]

        return output  # Fed into CTC loss


# CTC loss handles alignment automatically
ctc_loss = nn.CTCLoss(blank=0, zero_infinity=True)
```

### CTC (Connectionist Temporal Classification)

CTC solves the alignment problem — you don't need to know which character corresponds to which position:

```
Input image:  "Hello"
CNN+RNN output: [H, H, e, -, l, l, l, -, l, o, o]
                (- = blank token)

CTC decoding:
  1. Collapse repeated characters: [H, e, -, l, -, l, o]
  2. Remove blanks: [H, e, l, l, o]
  3. Result: "Hello"
```

**Key advantage:** No character-level position labels needed during training!

### Attention-Based Recognition

Encoder-decoder with attention (like machine translation):

```
Image → CNN Encoder → Feature sequence
                          ↓
         Decoder: predict one character at a time
                  using attention over encoder features
                          ↓
         Output: "H", "e", "l", "l", "o"
```

More powerful than CTC for irregular text (curved, distorted).

### TrOCR (Transformer OCR)

Microsoft's fully transformer-based OCR — ViT encoder + text Transformer decoder. State-of-the-art on handwritten and printed text.

---

## Tesseract OCR

Tesseract is the most popular open-source OCR engine.

### Basic Usage

```python
import pytesseract
from PIL import Image
import cv2


def ocr_basic(image_path):
    """Basic OCR with Tesseract."""
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text


text = ocr_basic("document.png")
```

### Tesseract Configuration

```python
def ocr_configured(image_path):
    """Tesseract with custom configuration."""
    image = Image.open(image_path)

    # PSM (Page Segmentation Mode) options:
    # 0  - Orientation and script detection only
    # 1  - Automatic page segmentation with OSD
    # 3  - Fully automatic page segmentation (default)
    # 6  - Assume a single uniform block of text
    # 7  - Treat the image as a single text line
    # 8  - Treat the image as a single word
    # 11 - Sparse text. Find as much text as possible
    # 13 - Raw line. Treat as a single text line (no Tesseract hacks)

    # For a single line of text:
    config = "--psm 7 --oem 3"
    text = pytesseract.image_to_string(image, config=config)

    # For specific language:
    text_de = pytesseract.image_to_string(image, lang="deu", config="--psm 3")

    # Digits only:
    config_digits = "--psm 7 -c tessedit_char_whitelist=0123456789"
    digits = pytesseract.image_to_string(image, config=config_digits)

    return text
```

### Preprocessing for Better OCR

```python
def preprocess_for_ocr(image_path):
    """Preprocess image for better Tesseract accuracy."""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 1. Binarization (Otsu's method)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 2. Noise removal
    denoised = cv2.medianBlur(binary, 3)

    # 3. Deskewing
    coords = np.column_stack(np.where(denoised > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    h, w = denoised.shape
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    deskewed = cv2.warpAffine(denoised, M, (w, h),
                               flags=cv2.INTER_CUBIC,
                               borderMode=cv2.BORDER_REPLICATE)

    # 4. Border padding (helps Tesseract)
    padded = cv2.copyMakeBorder(deskewed, 10, 10, 10, 10,
                                 cv2.BORDER_CONSTANT, value=255)

    text = pytesseract.image_to_string(padded, config="--psm 6")
    return text
```

---

## EasyOCR Library

EasyOCR provides a simple API with support for 80+ languages.

```python
import easyocr

def ocr_easyocr(image_path, languages=None):
    """Run OCR using EasyOCR."""
    if languages is None:
        languages = ["en"]

    reader = easyocr.Reader(languages, gpu=True)
    results = reader.readtext(image_path)

    # results is a list of (bbox, text, confidence)
    for bbox, text, conf in results:
        print(f"  '{text}' (confidence: {conf:.2f})")

    return results


# Supports multi-language: ["en", "ch_sim", "ja", "ko", "fr", "de", ...]
results = ocr_easyocr("sign.jpg", languages=["en", "ch_sim"])
```

---

## PaddleOCR

PaddleOCR (by Baidu) offers high accuracy and multi-language support:

```python
from paddleocr import PaddleOCR

def ocr_paddleocr(image_path, lang="en"):
    """Run OCR using PaddleOCR."""
    ocr = PaddleOCR(use_angle_cls=True, lang=lang)
    results = ocr.ocr(image_path, cls=True)

    for line in results[0]:
        text = line[1][0]
        conf = line[1][1]
        print(f"'{text}' (confidence: {conf:.3f})")

    return results
```

---

## Document Understanding

Beyond basic OCR — understanding document structure:

- **Layout Analysis:** Detect text blocks, tables, figures, lists
- **LayoutLM / LayoutLMv3** (Microsoft): transformer for document understanding
- **PaddleOCR's PP-Structure:** layout + table + OCR combined

```python
def extract_table_ocr(image_path):
    """Extract table content from image using PaddleOCR."""
    from paddleocr import PPStructure

    table_engine = PPStructure(show_log=False)
    image = cv2.imread(image_path)
    results = table_engine(image)

    for item in results:
        if item["type"] == "table":
            print("Table found!")
            print(item["res"]["html"])
        elif item["type"] == "text":
            print(f"Text block: {item['res']['text']}")

    return results
```

---

## Complete OCR Pipeline

```python
import cv2
import numpy as np
import pytesseract


class OCRPipeline:
    """Complete OCR pipeline with preprocessing."""

    def __init__(self, lang="eng"):
        self.lang = lang

    def preprocess(self, image):
        """Grayscale, resize, denoise, binarize."""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        h, w = gray.shape
        if h < 100:
            scale = 300.0 / h
            gray = cv2.resize(gray, None, fx=scale, fy=scale,
                              interpolation=cv2.INTER_CUBIC)

        gray = cv2.fastNlMeansDenoising(gray, h=10)
        gray = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return gray

    def run(self, image_path):
        """Run full OCR pipeline."""
        image = cv2.imread(image_path)
        preprocessed = self.preprocess(image)
        config = f"--psm 6 --oem 3 -l {self.lang}"
        text = pytesseract.image_to_string(preprocessed, config=config)
        return text.strip()


# Usage
pipeline = OCRPipeline(lang="eng")
text = pipeline.run("document.png")
print(text)
```

---

## Preprocessing Tips for Better Accuracy

| Issue | Solution |
|-------|----------|
| Low resolution | Upscale to 300+ DPI |
| Noise / speckles | Median blur or morphological opening |
| Skewed text | Deskew using Hough lines or `minAreaRect` |
| Low contrast | CLAHE (adaptive histogram equalization) |
| Shadows | Adaptive thresholding instead of global |
| Colored background | Convert to binary (black text on white) |
| Borders / lines | Remove with morphological operations |

---

## Summary

- **OCR** = detect text + recognize text in images
- **Scene text** is harder than document text (varied backgrounds, fonts)
- Detection models: EAST, CRAFT, DBNet
- Recognition: CRNN + CTC (handles variable-length output without alignment)
- **Tesseract:** open-source, configure PSM modes, preprocess for best results
- **EasyOCR:** simple API, 80+ languages, good accuracy
- **PaddleOCR:** high accuracy, table extraction, layout analysis
- Always **preprocess** (binarize, denoise, deskew) before OCR

---

## Exercise

Try this:

1. Use Tesseract to OCR a screenshot of this page — compare raw vs preprocessed accuracy
2. Try EasyOCR on an image with text in two languages
3. Apply the preprocessing pipeline (binarize + deskew + denoise) to a photo of a receipt
4. Compare Tesseract, EasyOCR, and PaddleOCR on the same image — which is most accurate?

---
