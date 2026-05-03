---
title: MLOps for Computer Vision
---

# MLOps for Computer Vision

**MLOps** (Machine Learning Operations) is the practice of deploying, monitoring, and maintaining ML models in production reliably and efficiently.

---

## Why MLOps for CV?

CV models have unique operational challenges:

| Challenge | Why It's Hard |
|-----------|--------------|
| Large datasets | Terabytes of images/videos |
| GPU requirements | Training needs expensive hardware |
| Model versioning | Weights are large binary files |
| Data labeling | Continuous annotation pipeline |
| Inference speed | Real-time requirements |
| Data privacy | Images may contain sensitive content |

Without MLOps, you get:
- "It works on my machine" problems
- No way to reproduce experiments
- Models degrade silently in production
- No audit trail of what was deployed

---

## Data Management

### Data Version Control (DVC)

Track large datasets alongside code with Git:

```python
# === DVC Setup (run in terminal) ===
# pip install dvc dvc-s3
# dvc init
# dvc remote add -d myremote s3://my-bucket/dvc-storage

# Track a dataset
# dvc add data/training_images/
# git add data/training_images.dvc data/.gitignore
# git commit -m "Add training dataset v1"
# dvc push
```

```python
# dvc.yaml — Define a reproducible ML pipeline

# Example pipeline definition (create as dvc.yaml):
pipeline_config = """
stages:
  preprocess:
    cmd: python preprocess.py
    deps:
      - data/raw_images/
      - preprocess.py
    outs:
      - data/processed/

  train:
    cmd: python train.py --config configs/experiment.yaml
    deps:
      - data/processed/
      - train.py
      - configs/experiment.yaml
    outs:
      - models/best_model.pth
    metrics:
      - metrics.json:
          cache: false
    plots:
      - plots/training_curves.csv:
          cache: false

  evaluate:
    cmd: python evaluate.py
    deps:
      - models/best_model.pth
      - evaluate.py
      - data/test/
    metrics:
      - evaluation_metrics.json:
          cache: false
"""
print(pipeline_config)

# Run the pipeline:
# dvc repro
# Compare experiments:
# dvc metrics diff
# dvc plots diff
```

### Image Storage

For production CV systems:
- **Object storage** (S3, GCS, Azure Blob): scalable, cheap for large datasets
- **Organize by split**: `train/`, `val/`, `test/`
- **Metadata database**: store labels, annotations, file paths in PostgreSQL or MongoDB
- **Content-addressable**: hash images to detect duplicates

### Dataset Registries

- **Hugging Face Datasets**: versioned, community datasets
- **Roboflow**: annotation + versioning + augmentation
- **Label Studio** → export → version with DVC

---

## Experiment Tracking

### Weights & Biases (W&B)

Log everything about your training runs:

```python
import torch
import torch.nn as nn
import wandb
from torchvision import models, transforms
from torch.utils.data import DataLoader, TensorDataset


def train_with_wandb():
    # Initialize W&B run
    wandb.init(
        project="cv-object-detection",
        config={
            "model": "resnet50",
            "learning_rate": 1e-3,
            "batch_size": 32,
            "epochs": 50,
            "optimizer": "adamw",
            "augmentation": "strong",
            "dataset_version": "v2.3",
            "image_size": 224,
        },
    )
    config = wandb.config

    # Create model
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    model.fc = nn.Linear(2048, 10)

    optimizer = torch.optim.AdamW(
        model.parameters(), lr=config.learning_rate
    )
    criterion = nn.CrossEntropyLoss()

    # Training loop
    model.train()
    for epoch in range(config.epochs):
        # Simulated training step
        dummy_input = torch.randn(config.batch_size, 3, 224, 224)
        dummy_target = torch.randint(0, 10, (config.batch_size,))

        output = model(dummy_input)
        loss = criterion(output, dummy_target)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        # Calculate accuracy
        preds = output.argmax(dim=1)
        accuracy = (preds == dummy_target).float().mean()

        # Log metrics
        wandb.log({
            "epoch": epoch,
            "train/loss": loss.item(),
            "train/accuracy": accuracy.item(),
            "learning_rate": optimizer.param_groups[0]["lr"],
        })

        # Log sample predictions every 10 epochs
        if epoch % 10 == 0:
            # Log images with predictions
            images = wandb.Image(
                dummy_input[:4],
                caption=[f"Pred: {p}" for p in preds[:4].tolist()],
            )
            wandb.log({"predictions": images})

    # Save model artifact
    artifact = wandb.Artifact("trained-model", type="model")
    torch.save(model.state_dict(), "model.pth")
    artifact.add_file("model.pth")
    wandb.log_artifact(artifact)

    wandb.finish()


# Run: train_with_wandb()
```

### What to Log

| Category | Examples |
|----------|----------|
| Hyperparameters | LR, batch size, architecture, augmentation |
| Metrics | Loss, accuracy, mAP, IoU per epoch |
| Predictions | Sample images with bounding boxes/masks |
| System | GPU usage, memory, training time |
| Artifacts | Model weights, config files |
| Dataset | Version, split sizes, class distribution |

---

## Training Infrastructure

### Docker for Reproducibility

Use Docker to ensure your training environment is reproducible:
- Base image: `pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime`
- Install system deps (libgl1 for OpenCV)
- Pin all Python packages in `requirements.txt`
- Default CMD: `python train.py --config configs/default.yaml`

### Cloud GPU Options

| Provider | GPU | Cost (approx/hr) | Best For |
|----------|-----|-------------------|----------|
| AWS (p4d) | A100 ×8 | $32 | Large-scale training |
| GCP (a2) | A100 ×1 | $4 | Single GPU experiments |
| Lambda Cloud | A100 ×1 | $1.10 | Budget training |
| Spot instances | Various | 60-90% off | Fault-tolerant jobs |

**Tip**: Use spot/preemptible instances with checkpointing to save 60-90% on GPU costs.

---

## CI/CD for Computer Vision

### Automated Testing Pipeline

Key tests for CV models in CI/CD:

- **Model loads correctly**: file exists, correct architecture
- **Input/output shape**: model produces expected tensor shapes
- **Accuracy threshold**: model must meet minimum accuracy on test set
- **Inference latency**: must be fast enough for production SLA
- **No data leakage**: train/test sets have no overlapping images

```python
# tests/test_model.py — CI tests for CV models
import torch
import json


def test_accuracy_threshold():
    """Model meets minimum accuracy on test set."""
    with open("evaluation_metrics.json") as f:
        metrics = json.load(f)
    # Model must maintain at least 90% accuracy
    assert metrics["accuracy"] >= 0.90, (
        f"Accuracy {metrics['accuracy']:.3f} below threshold 0.90"
    )


def test_inference_latency():
    """Model inference is fast enough for production."""
    import time
    from models.classifier import ImageClassifier

    model = ImageClassifier(num_classes=10)
    model.eval()
    dummy = torch.randn(1, 3, 224, 224)

    # Warm up
    for _ in range(10):
        model(dummy)

    # Measure
    start = time.time()
    for _ in range(100):
        with torch.no_grad():
            model(dummy)
    avg_ms = (time.time() - start) / 100 * 1000

    assert avg_ms < 50, f"Latency {avg_ms:.1f}ms exceeds 50ms limit"
```

---

## Model Serving

### FastAPI REST Endpoint

```python
import io
import torch
import torch.nn as nn
from fastapi import FastAPI, UploadFile, File
from PIL import Image
from torchvision import transforms, models


app = FastAPI(title="CV Model Server")

# Load model at startup
model = models.resnet50(weights=None)
model.fc = nn.Linear(2048, 10)
model.load_state_dict(torch.load("model.pth", map_location="cpu"))
model.eval()

# Preprocessing
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

CLASS_NAMES = [
    "cat", "dog", "bird", "car", "plane",
    "ship", "truck", "horse", "deer", "frog",
]


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Classify an uploaded image."""
    # Read and preprocess image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = preprocess(image).unsqueeze(0)

    # Inference
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.softmax(output, dim=1)[0]

    # Top-3 predictions
    top3 = torch.topk(probabilities, 3)
    predictions = [
        {
            "class": CLASS_NAMES[idx],
            "confidence": float(prob),
        }
        for prob, idx in zip(top3.values, top3.indices)
    ]

    return {"predictions": predictions, "model_version": "v2.3"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": True}
```

### Dockerfile for Serving

```python
serve_dockerfile = """
FROM python:3.11-slim
WORKDIR /app
COPY requirements-serve.txt .
RUN pip install --no-cache-dir -r requirements-serve.txt
COPY model.pth .
COPY serve.py .
EXPOSE 8000
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]
"""
print(serve_dockerfile)
```

### Triton Inference Server

For high-throughput production serving:
- **Dynamic batching**: accumulate requests and batch them
- **Model ensemble**: chain preprocessing → model → postprocessing
- **Multi-model**: serve multiple models simultaneously
- **GPU sharing**: multiple models on one GPU

---

## Monitoring in Production

### Data Drift Detection

```python
import numpy as np
from scipy import stats


class DriftDetector:
    """Detect distribution shift in input images."""

    def __init__(self, reference_stats):
        self.reference = reference_stats
        self.alert_threshold = 0.05

    def check_drift(self, current_stats):
        """Check if current data differs from training distribution."""
        alerts = []
        for ch, name in enumerate(["R", "G", "B"]):
            ref_mean = self.reference["mean"][ch]
            cur_mean = current_stats["mean"][ch]
            if abs(cur_mean - ref_mean) > 2 * self.reference["std"][ch]:
                alerts.append(f"Channel {name} shifted: {ref_mean:.1f} → {cur_mean:.1f}")

        # KS test on brightness
        _, p_value = stats.ks_2samp(
            self.reference["brightness_hist"], current_stats["brightness"]
        )
        if p_value < self.alert_threshold:
            alerts.append(f"Brightness drift (p={p_value:.4f})")

        return {"drift_detected": len(alerts) > 0, "alerts": alerts}

# detector = DriftDetector(reference_stats=training_stats)
# result = detector.check_drift(current_batch_stats)
```

### Performance Monitoring

Track these metrics continuously:

| Metric | Description | Alert When |
|--------|-------------|------------|
| Accuracy | Model correctness (if labels available) | Drops > 5% |
| Confidence | Average prediction confidence | Mean < 0.7 |
| Latency (p95) | 95th percentile response time | > SLA |
| Throughput | Requests per second | Below capacity |
| Error rate | Failed predictions | > 1% |
| Data drift | Distribution shift in inputs | Significant shift |

---

## MLOps Maturity Levels

| Level | Description | Characteristics |
|-------|-------------|-----------------|
| 0 | Manual | Jupyter notebooks, manual deployment |
| 1 | ML Pipeline | Automated training, basic serving |
| 2 | CI/CD | Automated testing, continuous training |
| 3 | Full MLOps | Monitoring, auto-retraining, A/B testing |

### Level 0 → Level 1 (First Steps)

1. Version your data (DVC)
2. Track experiments (W&B or MLflow)
3. Containerize training (Docker)
4. Simple model serving (FastAPI)

### Level 1 → Level 2

5. Automated tests in CI
6. Model validation gates
7. Automated retraining on schedule

### Level 2 → Level 3

8. Production monitoring and alerts
9. Data drift detection
10. Shadow deployment and canary releases
11. Feedback loop: production data → retraining

---

## Feedback Loop

The most important pattern in production ML:

```
Production → Collect New Data → Label → Retrain → Validate → Deploy → Repeat
```

The key cycle: collect hard examples, label them, retrain, validate, deploy, repeat!

---

## Summary

| Concept | Description |
|---------|-------------|
| DVC | Version control for large datasets |
| W&B / MLflow | Experiment tracking and model registry |
| Docker | Reproducible training environments |
| CI/CD | Automated testing and deployment |
| FastAPI / Triton | Model serving at scale |
| Drift Detection | Monitor for distribution shifts |
| Feedback Loop | Continuously improve with new data |

---

## Next Lesson

Next, we'll build a **complete end-to-end CV project** from scratch — putting all the pieces together! ➡️
