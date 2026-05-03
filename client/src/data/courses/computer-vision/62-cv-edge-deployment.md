---
title: Edge Deployment for CV
---

# Edge Deployment for Computer Vision

Deploying CV models on **edge devices** means running inference directly on hardware close to the data source — no cloud needed.

---

## Why Edge Deployment?

| Benefit | Explanation |
|---------|-------------|
| **Real-time** | No network round-trip delay |
| **Privacy** | Data stays on device (cameras in homes, hospitals) |
| **No internet** | Works offline (drones, remote areas) |
| **Low latency** | < 10ms response for robotics, AR |
| **Cost** | No cloud GPU bills at scale |

Use cases: security cameras, drones, phones, AR glasses, factory inspection, autonomous vehicles.

---

## Edge Devices

| Device | Compute | Power | Use Case |
|--------|---------|-------|----------|
| Raspberry Pi 4 | CPU (4-core ARM) | 5W | Prototyping, simple models |
| NVIDIA Jetson Nano | 128-core GPU | 10W | Real-time detection |
| NVIDIA Jetson Orin | 2048-core GPU | 15-60W | Autonomous robots |
| Google Coral | Edge TPU | 2W | Classification, detection |
| Phones (modern) | NPU + GPU | ~3W | Mobile apps |
| Microcontrollers | MCU | < 1W | TinyML, wake words |

---

## Model Optimization for Edge

Large models don't fit on edge devices. We need to make them smaller and faster.

### 1. Quantization

Reduce numerical precision of weights and activations:

$$\text{FP32} \rightarrow \text{INT8}: \quad 4\times \text{ smaller}, \quad 2\text{–}4\times \text{ faster}$$

**How quantization works:**

Map floating-point values to integers:

$$q = \text{round}\left(\frac{x}{s}\right) + z$$

Where $s$ is the scale factor and $z$ is the zero-point.

#### Post-Training Quantization (PTQ)

Quantize a pretrained model without retraining — fast and easy:

```python
import torch
import torch.quantization as quant
import torchvision.models as models


# Load a pretrained model
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
model.eval()

# --- Post-Training Static Quantization ---

# Step 1: Specify quantization config
model.qconfig = quant.get_default_qconfig("x86")

# Step 2: Prepare model (inserts observers)
model_prepared = quant.prepare(model)

# Step 3: Calibrate with representative data
# Run a few batches through the model to collect statistics
calibration_data = torch.randn(100, 3, 224, 224)
with torch.no_grad():
    for i in range(0, 100, 10):
        batch = calibration_data[i:i+10]
        model_prepared(batch)

# Step 4: Convert to quantized model
model_quantized = quant.convert(model_prepared)

# Compare sizes
import os
import tempfile

with tempfile.NamedTemporaryFile(suffix=".pt") as f:
    torch.save(model.state_dict(), f.name)
    fp32_size = os.path.getsize(f.name)

with tempfile.NamedTemporaryFile(suffix=".pt") as f:
    torch.save(model_quantized.state_dict(), f.name)
    int8_size = os.path.getsize(f.name)

print(f"FP32 model size: {fp32_size / 1e6:.1f} MB")
print(f"INT8 model size: {int8_size / 1e6:.1f} MB")
print(f"Compression ratio: {fp32_size / int8_size:.1f}x")
```

#### Quantization-Aware Training (QAT)

Simulate quantization during training for better accuracy:

```python
import torch
import torch.nn as nn
import torch.quantization as quant


class SimpleClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.quant = quant.QuantStub()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(64, num_classes)
        self.dequant = quant.DeQuantStub()

    def forward(self, x):
        x = self.quant(x)
        x = self.features(x)
        x = x.flatten(1)
        x = self.classifier(x)
        x = self.dequant(x)
        return x


# QAT workflow
model = SimpleClassifier(num_classes=10)
model.train()

# Set QAT config
model.qconfig = quant.get_default_qat_qconfig("x86")

# Prepare for QAT (inserts fake quantize modules)
model_qat = quant.prepare_qat(model)

# Train normally — fake quantization simulates INT8 during forward pass
optimizer = torch.optim.Adam(model_qat.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# Training loop (simplified)
for epoch in range(5):
    dummy_input = torch.randn(16, 3, 32, 32)
    dummy_target = torch.randint(0, 10, (16,))

    output = model_qat(dummy_input)
    loss = criterion(output, dummy_target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

# Convert to quantized model
model_qat.eval()
model_quantized = quant.convert(model_qat)
print("QAT model ready for deployment!")
```

### 2. Pruning

Remove unnecessary weights or entire channels:

```python
import torch
import torch.nn.utils.prune as prune
import torchvision.models as models


model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

# Prune 30% of weights in conv layers (unstructured)
for name, module in model.named_modules():
    if isinstance(module, torch.nn.Conv2d):
        prune.l1_unstructured(module, name="weight", amount=0.3)

# Check sparsity
total_zeros = 0
total_params = 0
for name, module in model.named_modules():
    if isinstance(module, torch.nn.Conv2d):
        zeros = (module.weight == 0).sum().item()
        total = module.weight.numel()
        total_zeros += zeros
        total_params += total

print(f"Overall sparsity: {total_zeros / total_params * 100:.1f}%")

# Make pruning permanent (remove the mask)
for name, module in model.named_modules():
    if isinstance(module, torch.nn.Conv2d):
        prune.remove(module, "weight")
```

### 3. Knowledge Distillation

Train a small "student" model to mimic a large "teacher":

$$\mathcal{L} = \alpha \cdot \mathcal{L}_{CE}(y, \hat{y}_{student}) + (1 - \alpha) \cdot \mathcal{L}_{KD}(\hat{y}_{teacher}, \hat{y}_{student})$$

Where $\mathcal{L}_{KD}$ is the KL divergence between soft outputs at temperature $T$.

### 4. Neural Architecture Search (NAS)

Automatically find efficient architectures optimized for target hardware (latency, FLOPs, memory).

Examples: MobileNetV3, EfficientNet, Once-for-All networks.

---

## Efficient Architectures

### MobileNet (Depthwise Separable Convolutions)

Standard conv: $D_K \times D_K \times C_{in} \times C_{out}$ parameters

Depthwise separable: $D_K \times D_K \times C_{in} + C_{in} \times C_{out}$ parameters

**Reduction factor**: $\frac{1}{C_{out}} + \frac{1}{D_K^2} \approx 8\text{–}9\times$ fewer FLOPs

| Architecture | Top-1 (ImageNet) | FLOPs | Params |
|-------------|-------------------|-------|--------|
| MobileNetV2 | 72.0% | 300M | 3.4M |
| MobileNetV3-Small | 67.4% | 56M | 2.5M |
| EfficientNet-Lite0 | 75.1% | 390M | 4.7M |
| ShuffleNetV2-0.5x | 60.3% | 41M | 1.4M |
| YOLOv8-nano | 37.3 mAP | 3.2G | 3.2M |
| NanoDet-Plus | 30.4 mAP | 0.9G | 1.2M |

---

## Inference Runtimes

| Runtime | Vendor | Target Hardware | Strengths |
|---------|--------|----------------|-----------|
| ONNX Runtime | Microsoft | Cross-platform | Universal format |
| TensorRT | NVIDIA | NVIDIA GPUs/Jetson | Maximum GPU performance |
| OpenVINO | Intel | Intel CPU/GPU/VPU | Intel hardware optimization |
| CoreML | Apple | iPhone/iPad/Mac | Apple ecosystem |
| TFLite | Google | Android/embedded | Mobile-first |
| ncnn | Tencent | ARM/mobile | Lightweight, no dependencies |

---

## Export Pipeline: PyTorch → ONNX → Target Runtime

### Step 1: Export to ONNX

```python
import torch
import torchvision.models as models


# Load model
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 224, 224)

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "mobilenet_v2.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "output": {0: "batch_size"},
    },
    opset_version=17,
)
print("Exported to mobilenet_v2.onnx")
```

### Step 2: Run with ONNX Runtime

```python
import numpy as np
import onnxruntime as ort
import time


# Create inference session
session = ort.InferenceSession(
    "mobilenet_v2.onnx",
    providers=["CPUExecutionProvider"],
)

# Prepare input
input_data = np.random.randn(1, 3, 224, 224).astype(np.float32)

# Warm-up
for _ in range(10):
    session.run(None, {"input": input_data})

# Benchmark
num_runs = 100
start = time.time()
for _ in range(num_runs):
    output = session.run(None, {"input": input_data})
elapsed = time.time() - start

print(f"Average inference time: {elapsed / num_runs * 1000:.1f} ms")
print(f"FPS: {num_runs / elapsed:.1f}")
print(f"Output shape: {output[0].shape}")
```

### Step 3: Optimize with Quantization in ONNX Runtime

```python
from onnxruntime.quantization import quantize_dynamic, QuantType
import os

# Dynamic quantization (no calibration data needed)
quantize_dynamic(
    model_input="mobilenet_v2.onnx",
    model_output="mobilenet_v2_int8.onnx",
    weight_type=QuantType.QInt8,
)

original_size = os.path.getsize("mobilenet_v2.onnx") / 1e6
quantized_size = os.path.getsize("mobilenet_v2_int8.onnx") / 1e6
print(f"Original: {original_size:.1f} MB → Quantized: {quantized_size:.1f} MB")
print(f"Reduction: {(1 - quantized_size/original_size) * 100:.0f}%")
```

---

## NVIDIA Jetson Deployment

### TensorRT Optimization

```python
# On Jetson device (conceptual — requires TensorRT installed)
import tensorrt as trt


def build_engine(onnx_path, engine_path, fp16=True):
    """Convert ONNX model to TensorRT engine."""
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    network = builder.create_network(
        1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)
    )
    parser = trt.OnnxParser(network, logger)

    with open(onnx_path, "rb") as f:
        parser.parse(f.read())

    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)
    if fp16:
        config.set_flag(trt.BuilderFlag.FP16)

    engine = builder.build_serialized_network(network, config)
    with open(engine_path, "wb") as f:
        f.write(engine)

    print(f"TensorRT engine saved to {engine_path}")
    return engine


# Usage:
# build_engine("mobilenet_v2.onnx", "mobilenet_v2.engine", fp16=True)
```

### DeepStream for Video Pipeline

NVIDIA DeepStream handles full video processing pipelines on Jetson:
- Decode video → Batch frames → Run inference → Track objects → Output

---

## FPS Benchmarks

| Model | Raspberry Pi 4 | Jetson Nano | Jetson Orin | Phone (NPU) |
|-------|----------------|-------------|-------------|--------------|
| MobileNetV2 (classification) | 8 FPS | 45 FPS | 300+ FPS | 60 FPS |
| YOLOv8-nano (detection) | 2 FPS | 25 FPS | 200+ FPS | 30 FPS |
| MoveNet (pose) | 5 FPS | 30 FPS | 250+ FPS | 40 FPS |
| DeepLabV3-MobileNet (seg) | 1 FPS | 15 FPS | 150+ FPS | 20 FPS |

> **Note**: FPS varies with input resolution, batch size, and optimizations applied.

---

## Latency vs. Accuracy Tradeoff

| Model | Accuracy (Top-1) | Latency (Jetson Nano) | Size |
|-------|-------------------|-----------------------|------|
| ResNet-50 | 76.1% | 45 ms | 98 MB |
| MobileNetV2 | 72.0% | 22 ms | 14 MB |
| MobileNetV2 (INT8) | 71.2% | 11 ms | 3.5 MB |
| MobileNetV3-Small | 67.4% | 8 ms | 10 MB |
| EfficientNet-Lite0 | 75.1% | 30 ms | 19 MB |

**Rule of thumb**: quantization gives $2\text{–}4\times$ speedup with $< 2\%$ accuracy loss.

---

## Complete Edge Deployment Pipeline

```python
import torch
import torchvision.models as models
import numpy as np
import onnxruntime as ort
from PIL import Image
from torchvision import transforms


# === Step 1: Prepare model ===
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
model.eval()

# === Step 2: Export to ONNX ===
dummy = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, dummy, "mobilenet_v3_small.onnx",
                  input_names=["image"], output_names=["predictions"], opset_version=17)

# === Step 3: Create optimized inference pipeline ===
class EdgeClassifier:
    def __init__(self, model_path):
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        self.transform = transforms.Compose([
            transforms.Resize(256), transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def predict(self, image_path):
        img = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(img).unsqueeze(0).numpy()
        outputs = self.session.run(None, {self.input_name: input_tensor})
        probs = np.exp(outputs[0][0]) / np.exp(outputs[0][0]).sum()
        top5_idx = np.argsort(probs)[-5:][::-1]
        return [(idx, probs[idx]) for idx in top5_idx]


classifier = EdgeClassifier("mobilenet_v3_small.onnx")
# results = classifier.predict("test_image.jpg")
```

---

## Best Practices

1. **Start with the smallest model** that meets accuracy requirements
2. **Profile first**: identify bottlenecks (preprocessing? inference? postprocessing?)
3. **Batch when possible**: process multiple frames together
4. **Use hardware-specific runtimes**: TensorRT for Jetson, CoreML for iOS
5. **Quantize INT8** as the first optimization (biggest gain, least effort)
6. **Test on target device** early — desktop performance doesn't predict edge performance

---

## Summary

| Concept | Description |
|---------|-------------|
| Quantization | Reduce precision (FP32 → INT8) for 2-4× speedup |
| Pruning | Remove unnecessary weights for smaller models |
| Distillation | Train small model from large model's knowledge |
| ONNX | Universal model exchange format |
| TensorRT | NVIDIA's optimized inference runtime |
| Efficient Architectures | MobileNet, ShuffleNet, EfficientNet-Lite |

---

## Next Lesson

Next, we'll cover **MLOps for Computer Vision** — how to manage CV models in production! ➡️
