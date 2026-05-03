---
title: Model Deployment
---

# Model Deployment

Taking a trained model from your notebook to production is one of the biggest challenges in deep learning. This lesson covers the full deployment pipeline.

---

## The Deployment Gap

Training a model is only **half the battle**. The deployment gap includes:

| Challenge | Description |
|-----------|-------------|
| Environment differences | Training on GPU, serving on CPU |
| Dependency management | Package versions, OS compatibility |
| Latency requirements | Real-time vs batch predictions |
| Scalability | Handling thousands of requests/sec |
| Monitoring | Detecting when models go stale |

---

## Model Serialization

### Method 1: State Dict (Recommended)

The preferred way to save PyTorch models:

```python
import torch
import torch.nn as nn

class SimpleModel(nn.Module):
    def __init__(self, input_size, num_classes):
        super().__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

model = SimpleModel(784, 10)

# Save only the learned parameters
torch.save(model.state_dict(), "model_weights.pth")

# Load (requires model class definition)
loaded_model = SimpleModel(784, 10)
loaded_model.load_state_dict(torch.load("model_weights.pth"))
loaded_model.eval()  # Always set to eval mode for inference!
```

> **Why state_dict?** It's smaller, more portable, and doesn't depend on the exact file structure where the model class was defined.

---

### Method 2: TorchScript

TorchScript creates a serialized, optimizable representation that can run **without Python**:

```python
import torch

# Method A: Tracing (follows one execution path)
example_input = torch.randn(1, 784)
traced_model = torch.jit.trace(model, example_input)
traced_model.save("model_traced.pt")

# Method B: Scripting (handles control flow)
scripted_model = torch.jit.script(model)
scripted_model.save("model_scripted.pt")

# Load without needing the original class
loaded = torch.jit.load("model_traced.pt")
output = loaded(example_input)
```

| Method | Best For | Limitation |
|--------|----------|------------|
| `trace` | Models with fixed control flow | Misses data-dependent branches |
| `script` | Models with if/for statements | Supports subset of Python |

---

### Method 3: ONNX Export

ONNX (Open Neural Network Exchange) is a universal format supported by many runtimes:

```python
import torch

dummy_input = torch.randn(1, 784)

torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "output": {0: "batch_size"}
    }
)

# Verify the exported model
import onnx
onnx_model = onnx.load("model.onnx")
onnx.checker.check_model(onnx_model)
print("ONNX model is valid!")
```

---

## Serving Options Overview

| Option | Best For | Complexity |
|--------|----------|------------|
| Flask/FastAPI | Prototypes, small scale | Low |
| TorchServe | PyTorch production | Medium |
| Triton | Multi-framework, high throughput | High |
| TF Serving | TensorFlow models | Medium |

---

## Deploy with FastAPI

Here's a complete deployment example:

```python
# serve.py
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import numpy as np
from typing import List

# Define model (same architecture as training)
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

# Load model at startup
device = torch.device("cpu")  # Use CPU for serving
model = SimpleModel()
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.eval()

# Create FastAPI app
app = FastAPI(title="MNIST Classifier API")

# Input validation with Pydantic
class PredictionRequest(BaseModel):
    features: List[float]

    @validator("features")
    def check_length(cls, v):
        if len(v) != 784:
            raise ValueError("Expected 784 features (28x28 image)")
        return v

class PredictionResponse(BaseModel):
    predicted_class: int
    confidence: float
    probabilities: List[float]

class BatchRequest(BaseModel):
    instances: List[PredictionRequest]

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        # Convert to tensor
        input_tensor = torch.tensor(request.features, dtype=torch.float32)
        input_tensor = input_tensor.unsqueeze(0)  # Add batch dimension

        # Inference (no gradient needed)
        with torch.no_grad():
            logits = model(input_tensor)
            probs = torch.softmax(logits, dim=1)

        predicted_class = probs.argmax(dim=1).item()
        confidence = probs.max().item()

        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=confidence,
            probabilities=probs.squeeze().tolist()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
def predict_batch(request: BatchRequest):
    """Handle multiple predictions efficiently."""
    features = [inst.features for inst in request.instances]
    input_tensor = torch.tensor(features, dtype=torch.float32)

    with torch.no_grad():
        logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1)

    results = []
    for i in range(len(request.instances)):
        results.append({
            "predicted_class": probs[i].argmax().item(),
            "confidence": probs[i].max().item()
        })
    return {"predictions": results}
```

Run with:

```bash
uvicorn serve:app --host 0.0.0.0 --port 8000
```

---

## Docker Containerization

Package your model and dependencies into a reproducible container:

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and code
COPY model_weights.pth .
COPY serve.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the server
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

```text
# requirements.txt
torch==2.2.0
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.0
numpy==1.26.0
```

Build and run:

```bash
docker build -t ml-model:v1 .
docker run -p 8000:8000 ml-model:v1
```

---

## Cloud Deployment

### Overview of Cloud ML Platforms

| Platform | Service | Key Feature |
|----------|---------|-------------|
| AWS | SageMaker | End-to-end ML pipeline |
| Google | Vertex AI | AutoML + custom models |
| Azure | Azure ML | Enterprise integration |

### Serverless Deployment (AWS Lambda + ONNX)

For lightweight models with sporadic traffic:

```python
# lambda_handler.py
import onnxruntime as ort
import numpy as np
import json

# Load model once (stays warm between invocations)
session = ort.InferenceSession("model.onnx")

def handler(event, context):
    body = json.loads(event["body"])
    features = np.array(body["features"], dtype=np.float32).reshape(1, -1)

    outputs = session.run(None, {"input": features})
    probs = outputs[0]

    return {
        "statusCode": 200,
        "body": json.dumps({
            "predicted_class": int(np.argmax(probs)),
            "confidence": float(np.max(probs))
        })
    }
```

> **Tip:** ONNX Runtime is much lighter than full PyTorch (~50MB vs ~800MB), making it ideal for serverless.

---

## Edge Deployment

Deploy models on devices with limited resources:

| Runtime | Target | Model Format |
|---------|--------|--------------|
| ONNX Runtime | Cross-platform | .onnx |
| TensorRT | NVIDIA GPUs | Optimized engine |
| CoreML | Apple devices | .mlmodel |
| PyTorch Mobile | iOS/Android | .ptl |
| TFLite | Mobile/embedded | .tflite |

```python
# Convert for mobile deployment
import torch

model.eval()
example = torch.randn(1, 784)

# For PyTorch Mobile
mobile_model = torch.jit.trace(model, example)
optimized = torch.utils.mobile_optimizer.optimize_for_mobile(mobile_model)
optimized._save_for_lite_interpreter("model_mobile.ptl")
```

---

## Model Versioning & A/B Testing

```python
# Simple A/B testing with FastAPI
import random

models = {
    "v1": load_model("model_v1.pth"),
    "v2": load_model("model_v2.pth"),
}

@app.post("/predict")
def predict_ab(request: PredictionRequest):
    # Route 20% traffic to new model
    version = "v2" if random.random() < 0.2 else "v1"
    model = models[version]

    result = run_inference(model, request)
    result["model_version"] = version

    # Log for analysis
    log_prediction(version, request, result)
    return result
```

---

## Monitoring in Production

### Data Drift Detection

Monitor if incoming data differs from training data:

```python
import numpy as np
from scipy import stats

class DriftDetector:
    def __init__(self, reference_data):
        self.reference_mean = np.mean(reference_data, axis=0)
        self.reference_std = np.std(reference_data, axis=0)

    def check_drift(self, new_batch, threshold=0.05):
        """KS test for distribution shift."""
        for feature_idx in range(new_batch.shape[1]):
            stat, p_value = stats.ks_2samp(
                self.reference_data[:, feature_idx],
                new_batch[:, feature_idx]
            )
            if p_value < threshold:
                return True, f"Drift detected in feature {feature_idx}"
        return False, "No drift detected"
```

### Key Metrics to Monitor

- **Latency**: p50, p95, p99 response times
- **Throughput**: requests per second
- **Error rate**: failed predictions
- **Model metrics**: accuracy on labeled samples
- **Data drift**: feature distribution changes

---

## CI/CD for ML (MLOps)

A typical MLOps pipeline:

1. **Data versioning** (DVC) → Track datasets
2. **Training** → Automated retraining on new data
3. **Evaluation** → Compare against baseline
4. **Registry** → Store versioned models (MLflow)
5. **Deploy** → Automated deployment if metrics pass
6. **Monitor** → Track performance, trigger retraining

---

## Latency vs Throughput Optimization

| Goal | Strategy |
|------|----------|
| Lower latency | Smaller model, quantization, TensorRT |
| Higher throughput | Batching, multiple workers, GPU |
| Both | Model distillation + hardware scaling |

```python
# Dynamic batching example
import asyncio
from collections import deque

class BatchProcessor:
    def __init__(self, model, max_batch=32, max_wait_ms=50):
        self.model = model
        self.max_batch = max_batch
        self.max_wait = max_wait_ms / 1000
        self.queue = deque()

    async def predict(self, features):
        future = asyncio.Future()
        self.queue.append((features, future))

        if len(self.queue) >= self.max_batch:
            await self._process_batch()
        else:
            await asyncio.sleep(self.max_wait)
            if not future.done():
                await self._process_batch()

        return await future

    async def _process_batch(self):
        batch_items = []
        while self.queue and len(batch_items) < self.max_batch:
            batch_items.append(self.queue.popleft())

        inputs = torch.stack([item[0] for item in batch_items])
        with torch.no_grad():
            outputs = self.model(inputs)

        for i, (_, future) in enumerate(batch_items):
            future.set_result(outputs[i])
```

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Serialization | Use state_dict for flexibility, TorchScript/ONNX for production |
| Serving | FastAPI for prototypes, TorchServe/Triton for scale |
| Containers | Docker ensures reproducibility |
| Cloud | Choose based on existing infrastructure |
| Edge | ONNX Runtime is the most portable |
| Monitoring | Always monitor for drift and degradation |

---

## Next Lesson

Next, we'll explore **Hardware for Deep Learning** — understanding GPUs, TPUs, and how to optimize your hardware usage.
