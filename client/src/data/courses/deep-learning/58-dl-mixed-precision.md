---
title: Mixed Precision Training
---

# Mixed Precision Training

**Mixed precision training** uses lower-precision floating point numbers (FP16 or BF16) alongside FP32 to train models faster while using less memory — with almost no loss in accuracy.

---

## Floating Point Formats

Computers represent decimal numbers using floating point. Different formats trade off precision for range and memory.

### Format Comparison

| Format | Bits | Sign | Exponent | Mantissa | Range | Precision |
|--------|------|------|----------|----------|-------|-----------|
| FP32 | 32 | 1 | 8 | 23 | ±3.4×10³⁸ | ~7 digits |
| FP16 | 16 | 1 | 5 | 10 | ±65,504 | ~3 digits |
| BF16 | 16 | 1 | 8 | 7 | ±3.4×10³⁸ | ~2 digits |

### Visual Layout

```
FP32 (32 bits):
┌───┬──────────┬───────────────────────────────────┐
│ S │ Exponent │           Mantissa                 │
│ 1 │    8     │             23                     │
└───┴──────────┴───────────────────────────────────┘

FP16 (16 bits):
┌───┬───────┬──────────────┐
│ S │  Exp  │   Mantissa   │
│ 1 │   5   │     10       │
└───┴───────┴──────────────┘

BF16 (16 bits):
┌───┬──────────┬─────────┐
│ S │ Exponent │Mantissa │
│ 1 │    8     │    7    │
└───┴──────────┴─────────┘
```

### Key Differences

- **FP16**: Small range (max 65,504) but decent precision. Can overflow/underflow easily.
- **BF16**: Same range as FP32 but less precision. Better for deep learning because gradients can be very small or large.
- **FP32**: Full precision, but uses 2× memory and is slower on modern GPUs.

```python
import torch

# Check floating point info
print(torch.finfo(torch.float32))
# finfo(resolution=1e-06, min=-3.4028e+38, max=3.4028e+38, ...)

print(torch.finfo(torch.float16))
# finfo(resolution=0.001, min=-65504, max=65504, ...)

print(torch.finfo(torch.bfloat16))
# finfo(resolution=0.01, min=-3.3895e+38, max=3.3895e+38, ...)
```

---

## Why Mixed Precision?

### Memory Savings

FP16 uses half the memory of FP32:

| Component | FP32 Size | FP16 Size | Savings |
|-----------|-----------|-----------|---------|
| Model (100M params) | 400 MB | 200 MB | 2× |
| Activations | Variable | Half | 2× |
| Batch size | Limited | Can double | 2× throughput |

### Speed Improvement

Modern NVIDIA GPUs have **Tensor Cores** optimized for FP16/BF16 operations:

| GPU | FP32 TFLOPS | FP16 TFLOPS | Speedup |
|-----|-------------|-------------|---------|
| V100 | 15.7 | 125 | ~8× |
| A100 | 19.5 | 312 | ~16× |
| H100 | 67 | 989 | ~15× |

---

## The Problem: FP16 Underflow

Small gradient values in FP16 become **zero** (underflow). The smallest positive FP16 number is approximately $6 \times 10^{-8}$.

```python
# Gradient that's fine in FP32 but underflows in FP16
grad_fp32 = torch.tensor(1e-8, dtype=torch.float32)
grad_fp16 = grad_fp32.half()

print(f"FP32: {grad_fp32}")   # 1e-08
print(f"FP16: {grad_fp16}")   # 0.0  ← Lost!
```

If gradients become zero, the model stops learning. This is why we need **loss scaling**.

---

## Loss Scaling

The solution: **multiply the loss by a large number** before the backward pass, then **divide the gradients** by the same number after.

$$\text{scaled\_loss} = \text{loss} \times S$$
$$\text{true\_gradient} = \frac{\text{scaled\_gradient}}{S}$$

This shifts small gradient values into FP16's representable range.

### Dynamic Loss Scaling

Instead of a fixed scale factor, **dynamic loss scaling** automatically adjusts:

1. Start with a large scale (e.g., $2^{16}$)
2. If gradients overflow (Inf/NaN) → halve the scale, skip the step
3. If no overflow for N steps → double the scale

```
Scale = 65536
  → No overflow for 2000 steps → Scale = 131072
  → Overflow detected! → Scale = 65536, skip update
  → No overflow for 2000 steps → Scale = 131072
  ...
```

---

## PyTorch AMP (Automatic Mixed Precision)

PyTorch provides two tools for mixed precision:

1. **`torch.cuda.amp.autocast()`** — automatically chooses FP16 or FP32 per operation
2. **`torch.cuda.amp.GradScaler()`** — handles loss scaling

### Basic Usage

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler

model = MyModel().cuda()
optimizer = optim.Adam(model.parameters(), lr=0.001)
scaler = GradScaler()  # Handles loss scaling

for data, target in train_loader:
    data, target = data.cuda(), target.cuda()
    optimizer.zero_grad()

    # Forward pass in mixed precision
    with autocast():
        output = model(data)
        loss = nn.CrossEntropyLoss()(output, target)

    # Backward pass with scaled loss
    scaler.scale(loss).backward()

    # Unscale gradients and step
    scaler.step(optimizer)

    # Update scale factor
    scaler.update()
```

---

## Which Operations Run in FP16 vs FP32?

`autocast()` automatically picks the right precision for each operation:

### FP16 (Fast — Tensor Cores)

These operations benefit from FP16 with negligible accuracy loss:

- Matrix multiplications (`nn.Linear`, `nn.Conv2d`)
- Batch matrix multiplications (`torch.bmm`)
- Convolutions
- GRU/LSTM cells

### FP32 (Precise — Numerically Sensitive)

These operations need full precision to remain stable:

- Loss functions (`CrossEntropyLoss`, `MSELoss`)
- Softmax
- Layer normalization (`nn.LayerNorm`)
- Batch normalization (`nn.BatchNorm`)
- Exponentials and logarithms
- Small reductions (sum over few elements)

```python
with autocast():
    # These automatically run in FP16:
    hidden = model.linear1(input)      # FP16 matmul
    hidden = model.conv(hidden)        # FP16 conv

    # These automatically stay in FP32:
    output = torch.softmax(hidden, -1) # FP32 softmax
    loss = criterion(output, target)   # FP32 loss
```

---

## Complete Training Loop with AMP

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Model
class ResBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU()

    def forward(self, x):
        residual = x
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.bn2(self.conv2(x))
        x = x + residual
        return self.relu(x)

class SimpleResNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
        )
        self.blocks = nn.Sequential(
            ResBlock(64),
            ResBlock(64),
            ResBlock(64),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(64, 10)

    def forward(self, x):
        x = self.stem(x)
        x = self.blocks(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        return self.fc(x)

# Setup
device = torch.device("cuda")
model = SimpleResNet().to(device)
optimizer = optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)
criterion = nn.CrossEntropyLoss()
scaler = GradScaler()

# Data
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomCrop(32, padding=4),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616)),
])
train_dataset = datasets.CIFAR10("./data", train=True, download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True, num_workers=4, pin_memory=True)

# Training
def train_one_epoch(model, loader, optimizer, criterion, scaler, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for data, target in loader:
        data, target = data.to(device, non_blocking=True), target.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)  # Slightly faster than zero_grad()

        # Mixed precision forward pass
        with autocast():
            output = model(data)
            loss = criterion(output, target)

        # Scaled backward pass
        scaler.scale(loss).backward()

        # Unscale, clip gradients, then step
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()

        # Track metrics
        total_loss += loss.item() * data.size(0)
        pred = output.argmax(dim=1)
        correct += (pred == target).sum().item()
        total += target.size(0)

    avg_loss = total_loss / total
    accuracy = 100 * correct / total
    return avg_loss, accuracy

# Run training
for epoch in range(100):
    loss, acc = train_one_epoch(model, train_loader, optimizer, criterion, scaler, device)
    scheduler.step()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}: Loss={loss:.4f}, Acc={acc:.1f}%")
        print(f"  GradScaler scale: {scaler.get_scale():.0f}")
```

---

## Memory Savings: Practical Example

```python
import torch

def measure_memory(dtype, batch_size=64):
    """Compare memory usage between FP32 and FP16."""
    torch.cuda.empty_cache()
    torch.cuda.reset_peak_memory_stats()

    model = SimpleResNet().cuda()
    if dtype == torch.float16:
        model = model.half()

    data = torch.randn(batch_size, 3, 32, 32, dtype=dtype, device="cuda")

    # Forward pass
    output = model(data)
    loss = output.sum()
    loss.backward()

    peak_memory = torch.cuda.max_memory_allocated() / (1024 ** 2)
    return peak_memory

# Compare
fp32_mem = measure_memory(torch.float32)
fp16_mem = measure_memory(torch.float16)
print(f"FP32 peak memory: {fp32_mem:.1f} MB")
print(f"FP16 peak memory: {fp16_mem:.1f} MB")
print(f"Savings: {(1 - fp16_mem/fp32_mem)*100:.1f}%")
```

---

## BFloat16 on Modern GPUs

BFloat16 (BF16) has the same exponent range as FP32, making it more robust:

```python
# BF16 — no GradScaler needed!
with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
    output = model(data)
    loss = criterion(output, target)

# No scaler needed — BF16 doesn't underflow like FP16
loss.backward()
optimizer.step()
```

| Feature | FP16 + GradScaler | BF16 |
|---------|-------------------|------|
| Needs loss scaling | Yes | No |
| Risk of overflow | Medium | Very low |
| Precision | Higher | Lower |
| GPU support | V100+ | A100+ |
| Speed | Fast | Fast |

**Recommendation:** Use BF16 if your GPU supports it (Ampere or newer). Use FP16 + GradScaler for older GPUs.

---

## Common Pitfalls

### 1. NaN Losses

```python
# Problem: Loss becomes NaN during training
# Cause: FP16 overflow in intermediate computations

# Solution 1: GradScaler detects and skips
# (happens automatically — just watch for frequent skips)

# Solution 2: Check for NaN and reduce scale manually
if torch.isnan(loss):
    print("NaN detected! Check your model/data")
```

### 2. Inf Gradients

```python
# After unscaling, check gradient health
scaler.unscale_(optimizer)
total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
if torch.isinf(total_norm):
    print(f"Infinite gradient detected, skipping step")
    scaler.update()
    optimizer.zero_grad()
    continue
scaler.step(optimizer)
scaler.update()
```

### 3. Operations That Break in FP16

```python
# These can cause issues in FP16:
# - Large reductions (sum of many values)
# - Very small learning rates
# - Long sequences in attention

# Solution: Force FP32 for specific operations
with autocast():
    features = model.backbone(data)  # FP16

with autocast(enabled=False):
    # Force FP32 for sensitive computation
    features_fp32 = features.float()
    output = sensitive_head(features_fp32)
```

---

## Speedup Benchmarks

Typical speedups with mixed precision on NVIDIA A100:

| Model | FP32 Time | AMP Time | Speedup | Memory Savings |
|-------|-----------|----------|---------|----------------|
| ResNet-50 | 1.0× | 0.45× | 2.2× | 45% |
| BERT-Large | 1.0× | 0.52× | 1.9× | 40% |
| GPT-2 | 1.0× | 0.48× | 2.1× | 48% |
| U-Net (segmentation) | 1.0× | 0.55× | 1.8× | 38% |
| Vision Transformer | 1.0× | 0.42× | 2.4× | 50% |

**Note:** Actual speedup depends on model architecture, batch size, and GPU. Models dominated by matrix operations see the biggest gains.

---

## Integration with DDP

Mixed precision works seamlessly with distributed training:

```python
from torch.cuda.amp import autocast, GradScaler
from torch.nn.parallel import DistributedDataParallel as DDP

model = DDP(model, device_ids=[rank])
scaler = GradScaler()

for data, target in loader:
    optimizer.zero_grad()

    with autocast():
        output = model(data)
        loss = criterion(output, target)

    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| FP16 | Half precision — 2× memory savings, faster on Tensor Cores |
| BF16 | Same range as FP32, less precision — no scaling needed |
| Loss scaling | Prevents gradient underflow in FP16 |
| GradScaler | Dynamic loss scaling in PyTorch |
| autocast | Automatically picks FP16 or FP32 per operation |
| Typical speedup | 1.5–2.5× faster with ~40–50% memory savings |

---

## Try It Yourself

1. Add AMP to an existing training script and measure speedup
2. Compare FP16 vs BF16 training accuracy on CIFAR-10
3. Monitor GradScaler scale factor during training
4. Double your batch size with AMP and compare training time
5. Profile with `torch.profiler` to see Tensor Core utilization

---

## Further Reading

- NVIDIA Mixed Precision Training documentation
- "Mixed Precision Training" paper (Micikevicius et al., 2018)
- PyTorch AMP documentation
- NVIDIA Tensor Core architecture guide
