---
title: Model Compression & Optimization
---

# Model Compression & Optimization

Large deep learning models achieve impressive accuracy but are often **too big and slow** for real-world deployment. Model compression techniques make models smaller and faster while preserving most of their performance.

---

## Why Compress Models?

| Challenge | Why It Matters |
|-----------|----------------|
| Mobile deployment | Phones have limited memory and compute |
| Latency | Real-time applications need fast inference |
| Cost | GPU inference at scale is expensive |
| Energy | Large models have huge carbon footprints |
| Edge devices | IoT, drones, embedded systems |

Consider the numbers:

| Model | Parameters | Size | Inference Time |
|-------|-----------|------|----------------|
| ResNet-50 | 25M | 98 MB | 4.1 ms (GPU) |
| BERT-base | 110M | 440 MB | 12 ms (GPU) |
| GPT-3 | 175B | 700 GB | — |
| LLaMA-70B | 70B | 140 GB | — |

We need techniques to make these models **deployable**.

---

## Knowledge Distillation

**Knowledge Distillation** (Hinton et al., 2015) trains a small "student" network to mimic a large "teacher" network.

### The Key Insight: Soft Labels

A teacher's output probabilities contain **more information** than hard labels:

```
Hard label:      [0, 0, 1, 0, 0]  ← "It's a cat"
Teacher output:  [0.01, 0.02, 0.85, 0.08, 0.04]
                  ↑ dog is somewhat similar to cat!
```

The soft probabilities encode **relationships between classes** — the "dark knowledge."

### Temperature Scaling

To make soft labels more informative, we use **temperature** $T$:

$$p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

Where $z_i$ are the logits. Higher $T$ → softer probability distribution.

| Temperature | Effect |
|-------------|--------|
| $T = 1$ | Standard softmax |
| $T = 5$ | Softer, reveals more structure |
| $T = 20$ | Very soft, almost uniform |

### Distillation Loss

$$L = \alpha \cdot L_{CE}(y, p_{\text{student}}) + (1 - \alpha) \cdot T^2 \cdot KL(p_{\text{teacher}}^T \| p_{\text{student}}^T)$$

Where:
- $L_{CE}$: cross-entropy with true labels (hard targets)
- $KL$: KL divergence between teacher and student soft outputs
- $T^2$: scaling factor (gradients scale as $1/T^2$, so we compensate)
- $\alpha$: balance between hard and soft targets (typically 0.1–0.5)

### Code: Knowledge Distillation

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader


class TeacherModel(nn.Module):
    """Large model (e.g., ResNet-50)."""

    def __init__(self, num_classes=10):
        super().__init__()
        self.model = models.resnet50(pretrained=True)
        self.model.fc = nn.Linear(2048, num_classes)

    def forward(self, x):
        return self.model(x)


class StudentModel(nn.Module):
    """Small model to train via distillation."""

    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)


def distillation_loss(student_logits, teacher_logits, labels,
                      temperature=4.0, alpha=0.3):
    """Combined distillation + classification loss."""
    # Soft targets from teacher
    soft_teacher = F.softmax(teacher_logits / temperature, dim=1)
    soft_student = F.log_softmax(student_logits / temperature, dim=1)

    # KL divergence (soft targets)
    kl_loss = F.kl_div(soft_student, soft_teacher, reduction='batchmean')
    kl_loss = kl_loss * (temperature ** 2)  # Scale correction

    # Hard target loss
    ce_loss = F.cross_entropy(student_logits, labels)

    # Combined
    return alpha * ce_loss + (1 - alpha) * kl_loss


def train_with_distillation(teacher, student, train_loader, epochs=10):
    teacher.eval()  # Teacher is frozen
    optimizer = torch.optim.Adam(student.parameters(), lr=1e-3)

    for epoch in range(epochs):
        student.train()
        total_loss = 0

        for images, labels in train_loader:
            # Get teacher predictions (no gradient)
            with torch.no_grad():
                teacher_logits = teacher(images)

            # Student forward pass
            student_logits = student(images)

            # Distillation loss
            loss = distillation_loss(
                student_logits, teacher_logits, labels,
                temperature=4.0, alpha=0.3,
            )

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")


# Usage
teacher = TeacherModel(num_classes=10)
student = StudentModel(num_classes=10)
# teacher would be pre-trained; student learns from teacher
# train_with_distillation(teacher, student, train_loader)
```

---

## Pruning

**Pruning** removes unnecessary weights or structures from a model.

### Types of Pruning

| Type | What's Removed | Structure Preserved? | Speedup |
|------|----------------|---------------------|---------|
| Unstructured | Individual weights | No (sparse) | Needs special hardware |
| Structured | Entire filters/neurons | Yes | Real speedup on any hardware |

### Magnitude-Based Pruning

Simple idea: weights with **small magnitude** contribute less → remove them.

```python
import torch
import torch.nn.utils.prune as prune


# Create a simple model
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)

# Count parameters before pruning
total_params = sum(p.numel() for p in model.parameters())
print(f"Parameters before: {total_params:,}")

# Apply L1 unstructured pruning (remove 50% of weights)
for name, module in model.named_modules():
    if isinstance(module, nn.Linear):
        prune.l1_unstructured(module, name='weight', amount=0.5)

# Check sparsity
def get_sparsity(model):
    zeros = 0
    total = 0
    for name, param in model.named_parameters():
        if 'weight' in name:
            zeros += (param == 0).sum().item()
            total += param.numel()
    return zeros / total

print(f"Sparsity: {get_sparsity(model):.1%}")
```

### Structured Pruning (Remove Entire Filters)

```python
# Remove 30% of output channels from a Conv2d layer
conv = nn.Conv2d(64, 128, 3, padding=1)

# Structured pruning: remove entire output filters
prune.ln_structured(conv, name='weight', amount=0.3, n=2, dim=0)

# This removes entire filters → actual size/speed reduction
print(f"Weight shape: {conv.weight.shape}")
# Some filters are now all zeros
```

### Iterative Pruning

Best results come from **gradual pruning**:

1. Train the model to convergence
2. Prune a small percentage (e.g., 20%)
3. Fine-tune the pruned model
4. Repeat steps 2–3

---

## Quantization

**Quantization** reduces the **precision** of model weights and activations.

### Precision Levels

| Format | Bits | Range | Model Size |
|--------|------|-------|------------|
| FP32 | 32 | ±3.4×10³⁸ | Baseline |
| FP16 | 16 | ±65,504 | 2× smaller |
| INT8 | 8 | -128 to 127 | 4× smaller |
| INT4 | 4 | -8 to 7 | 8× smaller |

### Post-Training Quantization (PTQ)

Quantize a trained model **without retraining**:

```python
import torch.quantization

# Define a model
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)

# Post-training dynamic quantization
# Quantizes weights to INT8, activations computed dynamically
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {nn.Linear},         # Layers to quantize
    dtype=torch.qint8,   # Target precision
)

# Compare sizes
def model_size_mb(model):
    param_size = sum(p.nelement() * p.element_size() for p in model.parameters())
    buffer_size = sum(b.nelement() * b.element_size() for b in model.buffers())
    return (param_size + buffer_size) / (1024 ** 2)

print(f"Original size: {model_size_mb(model):.2f} MB")
print(f"Quantized size: {model_size_mb(quantized_model):.2f} MB")
```

### Quantization-Aware Training (QAT)

Simulate quantization **during training** for better accuracy:

```python
import torch.quantization

# Model with quantization stubs
class QuantizedModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.quant = torch.quantization.QuantStub()
        self.linear1 = nn.Linear(784, 256)
        self.relu = nn.ReLU()
        self.linear2 = nn.Linear(256, 10)
        self.dequant = torch.quantization.DeQuantStub()

    def forward(self, x):
        x = self.quant(x)          # Quantize input
        x = self.relu(self.linear1(x))
        x = self.linear2(x)
        x = self.dequant(x)        # Dequantize output
        return x


model = QuantizedModel()

# Specify quantization config
model.qconfig = torch.quantization.get_default_qat_qconfig('fbgemm')

# Prepare for QAT (inserts fake quantization modules)
model_prepared = torch.quantization.prepare_qat(model, inplace=False)

# Train normally (fake quantization simulates INT8 during training)
# ... training loop ...

# Convert to actual quantized model
model_quantized = torch.quantization.convert(model_prepared, inplace=False)
```

---

## Architecture Efficiency

Some architectures are **designed** to be efficient:

### MobileNet (Depthwise Separable Convolutions)

Standard conv: $D_K \times D_K \times M \times N$ parameters

Depthwise separable: $D_K \times D_K \times M + M \times N$ parameters

**Savings**: up to 8–9× fewer parameters!

```python
# Standard convolution
standard_conv = nn.Conv2d(64, 128, kernel_size=3, padding=1)
# Parameters: 3 * 3 * 64 * 128 = 73,728

# Depthwise separable convolution
depthwise = nn.Conv2d(64, 64, kernel_size=3, padding=1, groups=64)
pointwise = nn.Conv2d(64, 128, kernel_size=1)
# Parameters: 3*3*64 + 64*128 = 576 + 8,192 = 8,768
# That's 8.4× fewer parameters!
```

### EfficientNet (Compound Scaling)

Instead of scaling one dimension, scale **width, depth, and resolution** together:

$$\text{depth}: d = \alpha^\phi, \quad \text{width}: w = \beta^\phi, \quad \text{resolution}: r = \gamma^\phi$$

Subject to: $\alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$ (computation budget doubles with $\phi$).

---

## ONNX Export for Deployment

**ONNX** (Open Neural Network Exchange) enables cross-framework deployment:

```python
import torch
import torch.onnx

# Export PyTorch model to ONNX
model = StudentModel(num_classes=10)
model.eval()

# Create dummy input matching expected shape
dummy_input = torch.randn(1, 3, 32, 32)

# Export
torch.onnx.export(
    model,
    dummy_input,
    "student_model.onnx",
    input_names=['image'],
    output_names=['logits'],
    dynamic_axes={
        'image': {0: 'batch_size'},
        'logits': {0: 'batch_size'},
    },
    opset_version=13,
)

print("Model exported to ONNX format!")

# Run with ONNX Runtime (much faster inference)
# pip install onnxruntime
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("student_model.onnx")
input_data = np.random.randn(1, 3, 32, 32).astype(np.float32)
outputs = session.run(None, {'image': input_data})
print(f"Output shape: {outputs[0].shape}")
```

---

## Comparison of Compression Techniques

| Technique | Compression Ratio | Accuracy Drop | Speedup | Complexity |
|-----------|------------------|---------------|---------|------------|
| Knowledge Distillation | 5–50× (params) | 1–3% | Model-dependent | Medium |
| Unstructured Pruning (90%) | ~10× (sparse) | 0.5–2% | Needs sparse hardware | Low |
| Structured Pruning (50%) | ~2× | 1–3% | Real speedup | Medium |
| INT8 Quantization | 4× (size) | 0.1–1% | 2–4× | Low |
| INT4 Quantization | 8× (size) | 1–5% | 3–6× | Medium |
| Combined (prune + quantize) | 10–50× | 2–5% | 4–10× | High |

---

## Practical Compression Pipeline

A typical deployment pipeline:

```
1. Train full-precision model (FP32)
       ↓
2. Knowledge distillation (optional: if student arch is different)
       ↓
3. Structured pruning (remove redundant filters)
       ↓
4. Fine-tune pruned model (recover accuracy)
       ↓
5. Quantization-aware training (INT8)
       ↓
6. Export to ONNX / TensorRT / CoreML
       ↓
7. Deploy on target device
```

---

## Key Takeaways

| Technique | How It Works | Best For |
|-----------|-------------|----------|
| Distillation | Small model mimics large model's soft outputs | Different architecture |
| Pruning | Remove small/unimportant weights or filters | Same architecture, fewer params |
| Quantization | Reduce numerical precision (FP32 → INT8) | Same architecture, faster math |
| Efficient architectures | Design small models from scratch | Mobile/edge from the start |
| ONNX export | Framework-agnostic deployment format | Cross-platform inference |

---

## Try It Yourself

1. Distill a ResNet-18 into a 3-layer CNN on CIFAR-10
2. Prune 90% of weights in a trained model — how much accuracy drops?
3. Compare inference speed: FP32 vs. dynamic INT8 quantization
4. Export a model to ONNX and benchmark with `onnxruntime`
5. Try `torch.compile()` (PyTorch 2.0+) for automatic optimization

Model compression is essential for bringing deep learning from the lab to the **real world** — making AI accessible on every device!
