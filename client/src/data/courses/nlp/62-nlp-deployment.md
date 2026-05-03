---
title: Deploying NLP Models
---

# Deploying NLP Models

Training a model is only half the job. Getting it into **production** — where real users can send requests and receive predictions — requires a different set of skills. In this lesson you will learn how to serve an NLP model behind a REST API, containerize it with Docker, optimize it for speed and size, and monitor it once it is live.

---

## The Deployment Pipeline

```
Train → Export → Optimize → Containerize → Serve → Monitor
```

| Stage | Tools |
|---|---|
| Train | PyTorch, Transformers, scikit-learn |
| Export | `model.save_pretrained()`, `joblib.dump()` |
| Optimize | ONNX, quantization, distillation |
| Containerize | Docker |
| Serve | FastAPI, TorchServe, Triton |
| Monitor | MLflow, Weights & Biases, Prometheus |

---

## Serving with FastAPI

**FastAPI** is the most popular choice for serving ML models in Python because it is fast, async-ready, and generates OpenAPI docs automatically.

### Minimal Sentiment Analysis API

```python
# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline

app = FastAPI(
    title="NLP Sentiment API",
    version="1.0.0",
)

# Load model once at startup
classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
)


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, examples=["I love this!"])


class SentimentResponse(BaseModel):
    label: str
    score: float


@app.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(req: TextRequest):
    """Predict the sentiment of a text string."""
    result = classifier(req.text, truncation=True)[0]
    return SentimentResponse(label=result["label"], score=round(result["score"], 4))


@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Running the API

```bash
pip install fastapi uvicorn transformers torch
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Testing with `curl`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "This movie was absolutely wonderful!"}'

# {"label":"POSITIVE","score":0.9999}
```

### Testing with Python

```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "This movie was absolutely wonderful!"},
    timeout=10,
)
print(response.json())
# {'label': 'POSITIVE', 'score': 0.9999}
```

---

## Batch Prediction Endpoint

For higher throughput, accept a **list** of texts in one request:

```python
from typing import List


class BatchRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=64)


class BatchResponse(BaseModel):
    results: List[SentimentResponse]


@app.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(req: BatchRequest):
    """Predict sentiment for a batch of texts."""
    if len(req.texts) > 64:
        raise HTTPException(status_code=400, detail="Max 64 texts per batch")

    results = classifier(req.texts, truncation=True, batch_size=16)
    return BatchResponse(
        results=[
            SentimentResponse(label=r["label"], score=round(r["score"], 4))
            for r in results
        ]
    )
```

```python
response = requests.post(
    "http://localhost:8000/predict/batch",
    json={"texts": [
        "Great product!",
        "Terrible experience.",
        "It was okay, nothing special.",
    ]},
    timeout=30,
)
for r in response.json()["results"]:
    print(f"  {r['label']:>8}  {r['score']:.4f}")
```

---

## Batch vs Real-Time Inference

| Aspect | Real-Time | Batch |
|---|---|---|
| Latency | Low (< 100 ms) | High (minutes–hours) |
| Throughput | One request at a time | Thousands at once |
| Use case | Chatbots, autocomplete | Nightly report, bulk tagging |
| Infrastructure | Always-on server | Scheduled job / queue |

### When to Choose Which

- **Real-time**: user-facing features that need instant responses.
- **Batch**: offline analytics, labeling large corpora, pre-computing embeddings.

```python
# Example: batch inference on a CSV file
import pandas as pd

df = pd.read_csv("reviews.csv")

# Process in chunks to avoid memory issues
chunk_size = 32
all_preds = []

for start in range(0, len(df), chunk_size):
    chunk = df["text"].iloc[start:start + chunk_size].tolist()
    preds = classifier(chunk, truncation=True, batch_size=chunk_size)
    all_preds.extend(preds)

df["predicted_label"] = [p["label"] for p in all_preds]
df["confidence"] = [round(p["score"], 4) for p in all_preds]
df.to_csv("reviews_predicted.csv", index=False)
print(f"Predicted {len(df)} reviews")
```

---

## Docker for NLP Models

Docker packages your app, model, and dependencies into a single **image** that runs anywhere.

### Dockerfile

```dockerfile
# Use a slim Python base image
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Download the model at build time (baked into image)
RUN python -c "from transformers import pipeline; \
    pipeline('sentiment-analysis', \
    model='distilbert-base-uncased-finetuned-sst-2-english')"

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### requirements.txt

```
fastapi==0.115.0
uvicorn==0.30.0
transformers==4.44.0
torch==2.4.0
```

### Build and Run

```bash
# Build the image
docker build -t nlp-api .

# Run the container
docker run -p 8000:8000 nlp-api

# Test
curl http://localhost:8000/health
# {"status":"ok"}
```

> **Tip:** For production, use multi-stage builds to keep the image small, and consider `--cpus` and `--memory` flags to limit resource usage.

### Docker Compose (with GPU)

```yaml
# docker-compose.yml
version: "3.8"
services:
  nlp-api:
    build: .
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    environment:
      - MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
```

---

## Model Optimization

Large transformer models are slow and memory-hungry. Optimization makes them practical for production.

### 1. Quantization

**Quantization** reduces the precision of model weights from 32-bit floats to 8-bit integers, cutting size by ~4× and speeding up inference.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

model_name = "distilbert-base-uncased-finetuned-sst-2-english"
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Dynamic quantization (CPU only, no retraining needed)
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},  # quantize all linear layers
    dtype=torch.qint8,
)

# Compare sizes
import os, tempfile

def model_size_mb(m):
    tmp = os.path.join(tempfile.gettempdir(), "tmp_model.pt")
    torch.save(m.state_dict(), tmp)
    size = os.path.getsize(tmp) / (1024 * 1024)
    os.remove(tmp)
    return size

print(f"Original:   {model_size_mb(model):.1f} MB")
print(f"Quantized:  {model_size_mb(quantized_model):.1f} MB")
# Original:   255.4 MB
# Quantized:   64.2 MB
```

### 2. ONNX Export

**ONNX** (Open Neural Network Exchange) is a universal model format. ONNX Runtime provides optimized inference on CPU and GPU.

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from optimum.onnxruntime import ORTModelForSequenceClassification

model_name = "distilbert-base-uncased-finetuned-sst-2-english"

# Export to ONNX and load with ONNX Runtime
ort_model = ORTModelForSequenceClassification.from_pretrained(
    model_name,
    export=True,
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Inference with ONNX Runtime
inputs = tokenizer("I love this product!", return_tensors="np")
outputs = ort_model(**inputs)
print("Logits:", outputs.logits)
```

```python
# Benchmark: PyTorch vs ONNX Runtime
import time

text = "The quick brown fox jumps over the lazy dog."
inputs_pt = tokenizer(text, return_tensors="pt")
inputs_np = tokenizer(text, return_tensors="np")

# PyTorch
start = time.perf_counter()
for _ in range(100):
    model(**inputs_pt)
pt_time = (time.perf_counter() - start) / 100

# ONNX Runtime
start = time.perf_counter()
for _ in range(100):
    ort_model(**inputs_np)
ort_time = (time.perf_counter() - start) / 100

print(f"PyTorch:      {pt_time*1000:.1f} ms/inference")
print(f"ONNX Runtime: {ort_time*1000:.1f} ms/inference")
print(f"Speedup:      {pt_time/ort_time:.1f}x")
```

### 3. Knowledge Distillation

Train a **smaller student** model to mimic a **larger teacher**:

$$\mathcal{L} = \alpha \cdot \mathcal{L}_{\text{CE}}(y, \hat{y}_s) + (1 - \alpha) \cdot \mathcal{L}_{\text{KD}}(\hat{y}_t, \hat{y}_s)$$

Where:

- $\mathcal{L}_{\text{CE}}$ = cross-entropy with true labels
- $\mathcal{L}_{\text{KD}}$ = KL divergence between teacher and student logits
- $\alpha$ = balancing factor (typically 0.5)
- $\hat{y}_t$ = teacher predictions, $\hat{y}_s$ = student predictions

```python
import torch
import torch.nn.functional as F


def distillation_loss(student_logits, teacher_logits, labels,
                      temperature=4.0, alpha=0.5):
    """Combined distillation + classification loss."""
    # Soft targets from teacher
    soft_teacher = F.softmax(teacher_logits / temperature, dim=-1)
    soft_student = F.log_softmax(student_logits / temperature, dim=-1)

    # KL divergence (scaled by T^2 as in the original paper)
    kd_loss = F.kl_div(soft_student, soft_teacher, reduction="batchmean")
    kd_loss *= temperature ** 2

    # Hard label loss
    ce_loss = F.cross_entropy(student_logits, labels)

    return alpha * ce_loss + (1 - alpha) * kd_loss
```

### Optimization Comparison

| Technique | Size Reduction | Speed Gain | Accuracy Loss |
|---|---|---|---|
| Dynamic Quantization | ~4× smaller | 1.5–2× faster | < 1% |
| ONNX Runtime | Same size | 1.5–3× faster | None |
| Knowledge Distillation | 2–10× smaller | 2–5× faster | 1–3% |
| Pruning | 2–5× smaller | 1.5–3× faster | 1–2% |

---

## Monitoring in Production

Once your model is live, things can go wrong silently. **Monitoring** catches problems before users notice.

### What to Monitor

| Metric | What It Detects |
|---|---|
| **Latency** (p50, p95, p99) | Slow responses, resource contention |
| **Throughput** (requests/sec) | Capacity limits |
| **Error rate** | Bugs, OOM errors |
| **Data drift** | Input distribution shifts |
| **Prediction drift** | Model confidence changes |

### Data Drift Detection

Data drift occurs when the distribution of incoming data changes compared to the training data.

```python
import numpy as np
from scipy.stats import ks_2samp

def detect_data_drift(reference_lengths, production_lengths, threshold=0.05):
    """Detect drift using the Kolmogorov-Smirnov test."""
    statistic, p_value = ks_2samp(reference_lengths, production_lengths)
    drift_detected = p_value < threshold
    return {
        "statistic": round(statistic, 4),
        "p_value": round(p_value, 4),
        "drift_detected": drift_detected,
    }

# Simulate: training data had shorter texts, production has longer ones
np.random.seed(42)
train_lengths = np.random.normal(loc=50, scale=15, size=1000)
prod_lengths = np.random.normal(loc=70, scale=20, size=500)

result = detect_data_drift(train_lengths, prod_lengths)
print(result)
# {'statistic': 0.328, 'p_value': 0.0, 'drift_detected': True}
```

### Prediction Drift Monitoring

```python
from collections import deque

class PredictionMonitor:
    """Track prediction distribution over a sliding window."""

    def __init__(self, window_size=1000):
        self.window = deque(maxlen=window_size)
        self.baseline_positive_rate = None

    def set_baseline(self, positive_rate: float):
        self.baseline_positive_rate = positive_rate

    def record(self, label: str):
        self.window.append(1 if label == "POSITIVE" else 0)

    def check_drift(self, threshold=0.1):
        if len(self.window) < 100 or self.baseline_positive_rate is None:
            return {"status": "insufficient_data"}

        current_rate = sum(self.window) / len(self.window)
        drift = abs(current_rate - self.baseline_positive_rate)

        return {
            "baseline_rate": self.baseline_positive_rate,
            "current_rate": round(current_rate, 4),
            "drift": round(drift, 4),
            "alert": drift > threshold,
        }

# Usage
monitor = PredictionMonitor(window_size=500)
monitor.set_baseline(positive_rate=0.52)

# Simulate predictions
import random
for _ in range(300):
    monitor.record(random.choice(["POSITIVE", "NEGATIVE"]))

print(monitor.check_drift())
```

### Adding Monitoring to FastAPI

```python
import time
from collections import defaultdict

# Simple in-memory metrics (use Prometheus in production)
metrics = defaultdict(list)


@app.middleware("http")
async def track_metrics(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    latency = time.perf_counter() - start

    metrics["latencies"].append(latency)
    metrics["status_codes"].append(response.status_code)

    return response


@app.get("/metrics")
async def get_metrics():
    latencies = metrics["latencies"][-1000:]  # last 1000 requests
    if not latencies:
        return {"message": "No data yet"}

    return {
        "total_requests": len(metrics["latencies"]),
        "p50_latency_ms": round(sorted(latencies)[len(latencies)//2] * 1000, 1),
        "p95_latency_ms": round(sorted(latencies)[int(len(latencies)*0.95)] * 1000, 1),
        "error_rate": sum(
            1 for s in metrics["status_codes"][-1000:] if s >= 400
        ) / max(len(latencies), 1),
    }
```

---

## MLOps Basics

**MLOps** brings DevOps practices to machine learning: version control for models, reproducible experiments, and automated pipelines.

### MLflow — Experiment Tracking

```python
import mlflow

mlflow.set_experiment("sentiment-analysis")

with mlflow.start_run(run_name="distilbert-v1"):
    # Log parameters
    mlflow.log_param("model_name", "distilbert-base-uncased")
    mlflow.log_param("learning_rate", 2e-5)
    mlflow.log_param("epochs", 3)
    mlflow.log_param("batch_size", 16)

    # Log metrics
    mlflow.log_metric("accuracy", 0.923)
    mlflow.log_metric("f1_score", 0.918)
    mlflow.log_metric("latency_ms", 12.5)

    # Log the model
    mlflow.transformers.log_model(
        transformers_model={
            "model": model,
            "tokenizer": tokenizer,
        },
        artifact_path="model",
    )

print("Run logged to MLflow!")
```

### Weights & Biases (W&B) — Experiment Dashboard

```python
import wandb

wandb.init(project="nlp-sentiment", name="distilbert-v1")

# Log config
wandb.config.update({
    "model": "distilbert-base-uncased",
    "learning_rate": 2e-5,
    "epochs": 3,
})

# Log metrics during training
for epoch in range(3):
    train_loss = 0.5 - epoch * 0.15  # simulated
    val_acc = 0.85 + epoch * 0.03     # simulated
    wandb.log({
        "epoch": epoch + 1,
        "train_loss": train_loss,
        "val_accuracy": val_acc,
    })

wandb.finish()
```

### MLOps Maturity Levels

| Level | Description | Tools |
|---|---|---|
| 0 — Manual | Train locally, copy model files | Scripts, notebooks |
| 1 — Tracked | Log experiments, version models | MLflow, W&B |
| 2 — Automated | CI/CD for model training | GitHub Actions, DVC |
| 3 — Full MLOps | Auto-retrain on drift, A/B tests | Kubeflow, SageMaker |

---

## Complete Deployment Example

Here is a **production-ready** FastAPI app that ties together everything from this lesson:

```python
# production_app.py
import time
import logging
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
model = None
pred_monitor = deque(maxlen=5000)
request_metrics = defaultdict(list)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, clean up on shutdown."""
    global model
    logger.info("Loading model...")
    model = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
    )
    logger.info("Model loaded!")
    yield
    logger.info("Shutting down...")


app = FastAPI(title="Production NLP API", lifespan=lifespan)


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class BatchRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=64)


class PredictionResult(BaseModel):
    label: str
    score: float


@app.post("/predict", response_model=PredictionResult)
async def predict(req: TextRequest):
    start = time.perf_counter()
    result = model(req.text, truncation=True)[0]
    latency = time.perf_counter() - start

    pred = PredictionResult(
        label=result["label"],
        score=round(result["score"], 4),
    )
    pred_monitor.append(pred.label)
    request_metrics["latencies"].append(latency)

    return pred


@app.post("/predict/batch", response_model=List[PredictionResult])
async def predict_batch(req: BatchRequest):
    if len(req.texts) > 64:
        raise HTTPException(400, "Maximum 64 texts per batch")

    results = model(req.texts, truncation=True, batch_size=16)
    preds = [
        PredictionResult(label=r["label"], score=round(r["score"], 4))
        for r in results
    ]
    for p in preds:
        pred_monitor.append(p.label)

    return preds


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.get("/metrics")
async def metrics():
    lats = request_metrics["latencies"][-1000:]
    if not lats:
        return {"message": "No requests yet"}

    sorted_lats = sorted(lats)
    positive_count = sum(1 for l in pred_monitor if l == "POSITIVE")
    total_preds = len(pred_monitor)

    return {
        "total_requests": len(request_metrics["latencies"]),
        "p50_ms": round(sorted_lats[len(sorted_lats)//2] * 1000, 1),
        "p95_ms": round(sorted_lats[int(len(sorted_lats)*0.95)] * 1000, 1),
        "positive_rate": round(positive_count / total_preds, 4) if total_preds else None,
    }
```

```bash
uvicorn production_app:app --host 0.0.0.0 --port 8000 --workers 2
```

---

## Summary

In this lesson you learned:

- **FastAPI** is the go-to framework for serving NLP models as REST APIs.
- **Batch endpoints** increase throughput for bulk workloads.
- **Docker** packages your model + code + dependencies into a portable container.
- **Quantization** shrinks models ~4× with minimal accuracy loss.
- **ONNX Runtime** provides 1.5–3× inference speedup.
- **Knowledge distillation** trains a small student to mimic a large teacher.
- **Monitoring** latency, data drift, and prediction drift catches silent failures.
- **MLflow** and **W&B** track experiments and version models for reproducibility.

Next, we will take a **deep dive into spaCy** — its pipeline architecture, custom components, and advanced matching.
