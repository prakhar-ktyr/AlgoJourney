---
title: Hardware for Deep Learning
---

# Hardware for Deep Learning

Deep learning workloads are dominated by **matrix multiplications**. The hardware you choose can mean the difference between training in hours vs weeks.

---

## Why Hardware Matters

A single forward pass through a neural network involves millions of multiply-add operations:

$$\text{FLOPs for one linear layer} = 2 \times \text{input\_size} \times \text{output\_size}$$

For a model like GPT-3 with 175B parameters, one forward pass requires ~$3.5 \times 10^{11}$ FLOPs. Training requires thousands of such passes over millions of examples.

---

## CPU vs GPU vs TPU

| Feature | CPU | GPU | TPU |
|---------|-----|-----|-----|
| Cores | 8-64 (powerful) | 1000s (simple) | Systolic array |
| Parallelism | Limited | Massive | Massive |
| Memory | 64-512 GB RAM | 8-80 GB VRAM | 16-128 GB HBM |
| Best for | Data preprocessing, inference | Training + inference | Large-scale training |
| Programming | Any language | CUDA/OpenCL | XLA (via JAX/TF) |

### CPU: General Purpose

- Great for **data loading**, **preprocessing**, and **small model inference**
- Modern CPUs have vector extensions (AVX-512) for SIMD operations
- Intel MKL and oneDNN optimize CPU-based neural network operations

### GPU: The Deep Learning Workhorse

- Designed for **parallel computation** — thousands of simple cores
- CUDA (NVIDIA) enables general-purpose GPU programming
- Tensor Cores accelerate mixed-precision matrix multiplication

### TPU: Google's Custom Chip

- **Tensor Processing Unit** — custom ASIC designed specifically for neural networks
- Uses a systolic array architecture for matrix multiplication
- Available through Google Cloud (TPU v4, v5)
- Best with JAX or TensorFlow; limited PyTorch support via PyTorch/XLA

---

## GPU Architecture Deep Dive

### CUDA Cores vs Tensor Cores

```
CUDA Core: One multiply-add per clock cycle
  a × b + c = result

Tensor Core: 4×4 matrix multiply-add per clock cycle
  D = A × B + C  (where A, B, C, D are 4×4 matrices)
```

Tensor Cores provide **8-16x speedup** for matrix operations when using mixed precision (FP16/BF16 inputs, FP32 accumulate).

### GPU Memory (VRAM): The Bottleneck

During training, GPU memory stores:

| Component | Approximate Size |
|-----------|-----------------|
| Model parameters | $4N$ bytes (FP32) |
| Gradients | $4N$ bytes (FP32) |
| Optimizer states (Adam) | $8N$ bytes (momentum + variance) |
| Activations | Depends on batch size |

For a 1B parameter model:

$$\text{Minimum memory} \approx 4(1B) + 4(1B) + 8(1B) = 16 \text{ GB}$$

That's just for parameters — activations add significantly more!

### Memory Bandwidth

- **HBM2e** (A100): 2 TB/s bandwidth
- **HBM3** (H100): 3.35 TB/s bandwidth
- Many operations are **memory-bound**, not compute-bound

---

## NVIDIA GPU Generations

### Consumer GPUs

| GPU | VRAM | FP32 TFLOPS | FP16 TFLOPS | Price (approx) |
|-----|------|-------------|-------------|-----------------|
| RTX 3090 | 24 GB | 35.6 | 71.2 | $1,500 |
| RTX 4090 | 24 GB | 82.6 | 165.2 | $1,600 |
| RTX 4080 | 16 GB | 48.7 | 97.5 | $1,000 |
| RTX 3080 | 10 GB | 29.8 | 59.6 | $700 |

### Data Center GPUs

| GPU | VRAM | FP32 TFLOPS | FP16 TFLOPS | Tensor TFLOPS | Price (approx) |
|-----|------|-------------|-------------|---------------|-----------------|
| V100 | 32 GB | 15.7 | 125 | 125 | $5,000 |
| A100 | 80 GB | 19.5 | 312 | 624 | $15,000 |
| H100 | 80 GB | 67 | 990 | 1,979 | $30,000 |
| H200 | 141 GB | 67 | 990 | 1,979 | $35,000+ |

> **Key insight:** The jump from A100 to H100 is massive — roughly 3x in tensor performance. The H200 doubles memory capacity.

---

## Memory Management Techniques

### Gradient Checkpointing

Trade **compute for memory** by recomputing activations during backward pass instead of storing them:

```python
import torch
from torch.utils.checkpoint import checkpoint

class MemoryEfficientModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.block1 = self._make_block(784, 512)
        self.block2 = self._make_block(512, 256)
        self.block3 = self._make_block(256, 128)
        self.classifier = torch.nn.Linear(128, 10)

    def _make_block(self, in_f, out_f):
        return torch.nn.Sequential(
            torch.nn.Linear(in_f, out_f),
            torch.nn.BatchNorm1d(out_f),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.1)
        )

    def forward(self, x):
        # Checkpoint each block — activations recomputed in backward
        x = checkpoint(self.block1, x, use_reentrant=False)
        x = checkpoint(self.block2, x, use_reentrant=False)
        x = checkpoint(self.block3, x, use_reentrant=False)
        return self.classifier(x)

# Memory savings: ~60-70% for deep models
# Cost: ~30% more compute time
```

### CPU Offloading

Move tensors to CPU when not actively needed:

```python
import torch

class OffloadedLayer(torch.nn.Module):
    """Keeps weights on CPU, moves to GPU only during forward."""
    def __init__(self, layer):
        super().__init__()
        self.layer = layer.cpu()
        self.device = torch.device("cuda")

    def forward(self, x):
        # Move layer to GPU for computation
        self.layer.to(self.device)
        output = self.layer(x)
        # Move back to CPU to free VRAM
        self.layer.cpu()
        torch.cuda.empty_cache()
        return output
```

### Flash Attention

Memory-efficient attention that avoids materializing the full $N \times N$ attention matrix:

```python
import torch
import torch.nn.functional as F

# Standard attention: O(N²) memory
def standard_attention(Q, K, V):
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (Q.size(-1) ** 0.5)
    attn = torch.softmax(scores, dim=-1)  # N×N matrix stored in memory!
    return torch.matmul(attn, V)

# Flash Attention: O(N) memory (built into PyTorch 2.0+)
def efficient_attention(Q, K, V):
    return F.scaled_dot_product_attention(Q, K, V)
    # Automatically uses Flash Attention when available
```

Flash Attention provides:
- **2-4x speedup** over standard attention
- **5-20x memory reduction** for long sequences
- Exact (not approximate) computation

---

## Cloud GPU Options

| Provider | Instance | GPU | VRAM | $/hour (approx) |
|----------|----------|-----|------|------------------|
| AWS | p4d.24xlarge | 8× A100 | 320 GB | $32 |
| AWS | g5.xlarge | 1× A10G | 24 GB | $1 |
| GCP | a2-highgpu-1g | 1× A100 | 40 GB | $4 |
| GCP | TPU v4 (8 chips) | TPU v4 | 256 GB | $12 |
| Azure | ND A100 v4 | 8× A100 | 640 GB | $27 |
| Lambda Labs | 1× A100 | A100 | 80 GB | $1.10 |
| RunPod | 1× A100 | A100 | 80 GB | $1.64 |

> **Budget tip:** Lambda Labs and RunPod offer the best price/performance for individual researchers.

---

## Setting Up CUDA in PyTorch

```python
import torch

# Check CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA version: {torch.version.cuda}")
print(f"GPU count: {torch.cuda.device_count()}")

if torch.cuda.is_available():
    print(f"GPU name: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

# The standard device pattern
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Move model and data to GPU
model = model.to(device)
inputs = inputs.to(device)
labels = labels.to(device)

# Check current memory usage
print(f"Allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
print(f"Cached: {torch.cuda.memory_reserved() / 1e9:.2f} GB")
```

---

## GPU Memory Profiling

```python
import torch
from torch.profiler import profile, record_function, ProfilerActivity

model = MyModel().cuda()
inputs = torch.randn(32, 3, 224, 224).cuda()

# Profile memory usage
with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    profile_memory=True,
    record_shapes=True
) as prof:
    with record_function("forward"):
        output = model(inputs)
    with record_function("backward"):
        output.sum().backward()

# Print memory summary
print(prof.key_averages().table(
    sort_by="cuda_memory_usage", row_limit=10
))

# Detailed CUDA memory summary
print(torch.cuda.memory_summary(abbreviated=True))
```

### Finding Memory Leaks

```python
import torch
import gc

def find_memory_leaks():
    """Track GPU tensors to find leaks."""
    gc.collect()
    torch.cuda.empty_cache()

    before = torch.cuda.memory_allocated()

    # ... your code here ...

    after = torch.cuda.memory_allocated()
    leaked = after - before
    print(f"Memory leaked: {leaked / 1e6:.2f} MB")

# Common leak: storing tensors in lists without detaching
losses = []
for batch in dataloader:
    loss = model(batch).loss
    losses.append(loss.item())  # .item() detaches — good!
    # losses.append(loss)  # BAD — keeps entire computation graph!
```

---

## Multi-GPU Strategy Decision Guide

| Scenario | Strategy | Example |
|----------|----------|---------|
| Model fits in 1 GPU | Single GPU | ResNet-50 on RTX 3090 |
| Model fits, want faster training | Data Parallel (DDP) | ResNet-50 on 4× A100 |
| Model too large for 1 GPU | Model Parallel / FSDP | GPT-3 on 64× A100 |
| Model too large for 1 node | Pipeline + Tensor Parallel | LLaMA 70B on 8 nodes |

```python
# Quick DDP setup
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def setup_ddp(rank, world_size):
    dist.init_process_group("nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

def train(rank, world_size):
    setup_ddp(rank, world_size)
    model = MyModel().to(rank)
    model = DDP(model, device_ids=[rank])
    # Training loop as normal...
```

---

## Benchmarking Your Setup

Always benchmark before committing to a hardware configuration:

```python
import torch
import time

def benchmark_matmul(size=4096, dtype=torch.float32, device="cuda", n_runs=100):
    """Benchmark matrix multiplication throughput."""
    A = torch.randn(size, size, dtype=dtype, device=device)
    B = torch.randn(size, size, dtype=dtype, device=device)

    # Warmup
    for _ in range(10):
        C = torch.matmul(A, B)
    torch.cuda.synchronize()

    # Timed runs
    start = time.time()
    for _ in range(n_runs):
        C = torch.matmul(A, B)
    torch.cuda.synchronize()
    elapsed = time.time() - start

    # Calculate TFLOPS
    flops = 2 * size ** 3 * n_runs  # multiply-add = 2 ops
    tflops = flops / elapsed / 1e12
    print(f"Matrix size: {size}x{size}, dtype: {dtype}")
    print(f"Time per matmul: {elapsed / n_runs * 1000:.2f} ms")
    print(f"Throughput: {tflops:.2f} TFLOPS")
    return tflops

# Compare FP32 vs FP16 (Tensor Cores kick in for FP16)
print("=== FP32 ===")
benchmark_matmul(dtype=torch.float32)
print("\n=== FP16 ===")
benchmark_matmul(dtype=torch.float16)
```

### Practical GPU Memory Estimation

Use this formula to estimate if your model fits in memory:

$$\text{Total Memory} \approx \text{Params} \times (4 + 4 + 8) + \text{Activations} + \text{Batch overhead}$$

Where:
- $4$ bytes per parameter (FP32 weights)
- $4$ bytes per gradient
- $8$ bytes for Adam optimizer states (momentum + variance)

```python
def estimate_memory(model, batch_size, input_shape, dtype_bytes=4):
    """Estimate GPU memory needed for training."""
    # Parameter memory
    param_mem = sum(p.numel() for p in model.parameters()) * dtype_bytes
    grad_mem = param_mem  # Same size as parameters
    optimizer_mem = param_mem * 2  # Adam has 2 states per param

    # Activation memory (rough estimate via forward pass)
    input_tensor = torch.randn(batch_size, *input_shape)
    torch.cuda.reset_peak_memory_stats()
    model.cuda()
    input_tensor = input_tensor.cuda()
    with torch.no_grad():
        _ = model(input_tensor)
    activation_mem = torch.cuda.max_memory_allocated()

    total = param_mem + grad_mem + optimizer_mem + activation_mem
    print(f"Parameters:  {param_mem / 1e9:.2f} GB")
    print(f"Gradients:   {grad_mem / 1e9:.2f} GB")
    print(f"Optimizer:   {optimizer_mem / 1e9:.2f} GB")
    print(f"Activations: {activation_mem / 1e9:.2f} GB")
    print(f"Total:       {total / 1e9:.2f} GB")
    return total
```

---

## When to Use What

| Budget / Scale | Recommendation |
|----------------|----------------|
| Learning / small experiments | Free tier: Google Colab (T4 GPU) |
| Serious prototyping | 1× RTX 4090 or cloud A100 |
| Research training | 4-8× A100 (cloud or lab) |
| Large model training | 64+ GPUs, multi-node |
| Inference (low latency) | RTX 4090 or T4 with TensorRT |
| Inference (high throughput) | Multiple cheaper GPUs |

---

## The Future of DL Hardware

| Technology | Status | Promise |
|------------|--------|---------|
| Neural Processing Units (NPUs) | Shipping (Apple, Intel, Qualcomm) | Efficient on-device AI |
| Photonic computing | Research | Speed-of-light matrix multiply |
| Neuromorphic chips | Research | Brain-inspired, ultra-low power |
| Quantum ML | Early research | Exponential speedup for certain ops |
| Wafer-scale (Cerebras) | Available | Entire model on one chip |

---

## Summary

| Topic | Key Takeaway |
|-------|--------------|
| GPU vs CPU | GPU provides 10-100x speedup for training |
| VRAM | The primary bottleneck — determines max model/batch size |
| Tensor Cores | Use mixed precision (AMP) to leverage them |
| Memory tricks | Checkpointing, Flash Attention, offloading |
| Cloud GPUs | Lambda Labs / RunPod for budget, AWS/GCP for enterprise |
| Future | NPUs bringing AI to every device |

---

## Next Lesson

Next, we'll compare **Deep Learning Frameworks** — PyTorch vs TensorFlow vs JAX — to understand the ecosystem landscape.
