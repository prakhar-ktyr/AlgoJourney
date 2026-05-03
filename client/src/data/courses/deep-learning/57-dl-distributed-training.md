---
title: Distributed Training
---

# Distributed Training

When models are too large or data is too big, a single GPU isn't enough. **Distributed training** splits the work across multiple GPUs or machines to train faster.

---

## Why Distributed Training?

| Problem | Solution |
|---------|----------|
| Training takes too long (days/weeks) | Spread across GPUs → linear speedup |
| Model doesn't fit in one GPU memory | Split model across GPUs |
| Dataset too large for one machine | Each GPU processes a subset |
| Need to experiment faster | More compute = faster iteration |

Modern large language models (GPT, LLaMA) require **thousands** of GPUs training for weeks.

---

## Parallelism Strategies

There are three main approaches:

```
┌─────────────────────────────────────────┐
│           Parallelism Types             │
├──────────────┬──────────────┬───────────┤
│    Data      │    Model     │  Pipeline │
│  Parallelism │  Parallelism │Parallelism│
├──────────────┼──────────────┼───────────┤
│ Same model   │ Model split  │ Layers    │
│ on each GPU  │ across GPUs  │ across    │
│ Different    │ Same data    │ GPUs      │
│ data batches │ flows thru   │ Mini-batch│
│              │ all GPUs     │ pipelining│
└──────────────┴──────────────┴───────────┘
```

---

## Data Parallelism

The most common approach. Each GPU has a **complete copy** of the model but processes different data.

### How It Works

1. Replicate model on each GPU
2. Split the mini-batch across GPUs
3. Each GPU computes forward + backward pass independently
4. **Synchronize gradients** across all GPUs (AllReduce)
5. Each GPU updates its model copy with the averaged gradients

$$g_{avg} = \frac{1}{N} \sum_{i=1}^{N} g_i$$

Where $g_i$ is the gradient computed on GPU $i$ and $N$ is the number of GPUs.

### Effective Batch Size

With data parallelism, the effective batch size scales with the number of GPUs:

$$\text{effective batch size} = \text{per-GPU batch size} \times \text{num GPUs}$$

Example: 4 GPUs with batch size 32 each → effective batch size of 128.

### Linear Scaling Rule

When you increase batch size, you should scale the learning rate proportionally:

$$lr_{new} = lr_{base} \times \frac{\text{effective batch size}}{\text{base batch size}}$$

Use a **warmup period** (gradual LR increase) to stabilize training with large batches.

---

## DataParallel vs DistributedDataParallel

PyTorch offers two APIs:

### DataParallel (DP) — Simple but Slow

```python
import torch.nn as nn

model = MyModel()
# Wrap model — that's it!
model = nn.DataParallel(model)
model = model.to("cuda")
```

**Problems with DataParallel:**
- Uses one process, multiple threads → GIL bottleneck
- GPU 0 does extra work (gathering outputs, computing loss)
- Imbalanced memory usage
- Slower than DDP

### DistributedDataParallel (DDP) — Recommended

```python
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# Each process runs this code
def setup(rank, world_size):
    """Initialize the distributed environment."""
    dist.init_process_group(
        backend="nccl",        # NCCL for GPU communication
        init_method="env://",  # Use environment variables
        rank=rank,             # This process's rank (0, 1, 2, ...)
        world_size=world_size  # Total number of processes
    )
    torch.cuda.set_device(rank)

def cleanup():
    dist.destroy_process_group()
```

**Advantages of DDP:**
- One process per GPU — no GIL bottleneck
- Overlaps gradient computation with communication
- Even memory distribution
- True linear scaling

---

## Complete DDP Training Script

```python
import os
import torch
import torch.nn as nn
import torch.optim as optim
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader
from torch.utils.data.distributed import DistributedSampler
from torchvision import datasets, transforms

def setup(rank, world_size):
    """Initialize distributed process group."""
    os.environ["MASTER_ADDR"] = "localhost"
    os.environ["MASTER_PORT"] = "12355"
    dist.init_process_group("nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

def cleanup():
    dist.destroy_process_group()

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.layers = nn.Sequential(
            nn.Linear(28 * 28, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 10),
        )

    def forward(self, x):
        x = self.flatten(x)
        return self.layers(x)

def train(rank, world_size, epochs=5):
    """Training function — runs on each GPU."""
    setup(rank, world_size)

    # Create model and move to GPU
    model = SimpleNet().to(rank)
    ddp_model = DDP(model, device_ids=[rank])

    # Optimizer
    optimizer = optim.Adam(ddp_model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    # Dataset with DistributedSampler
    transform = transforms.Compose([transforms.ToTensor()])
    dataset = datasets.MNIST("./data", train=True, download=True, transform=transform)

    # DistributedSampler ensures each GPU gets different data
    sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank, shuffle=True)
    loader = DataLoader(dataset, batch_size=64, sampler=sampler, num_workers=2, pin_memory=True)

    # Training loop
    for epoch in range(epochs):
        sampler.set_epoch(epoch)  # Important! Ensures different shuffling each epoch
        ddp_model.train()
        total_loss = 0

        for batch_idx, (data, target) in enumerate(loader):
            data, target = data.to(rank), target.to(rank)

            optimizer.zero_grad()
            output = ddp_model(data)
            loss = criterion(output, target)
            loss.backward()  # Gradients are automatically synchronized!
            optimizer.step()

            total_loss += loss.item()

        # Only print from rank 0 to avoid duplicate output
        if rank == 0:
            avg_loss = total_loss / len(loader)
            print(f"Epoch {epoch+1}/{epochs} | Loss: {avg_loss:.4f}")

    # Save model (only from rank 0)
    if rank == 0:
        torch.save(ddp_model.module.state_dict(), "model.pth")

    cleanup()

def main():
    world_size = torch.cuda.device_count()
    print(f"Training on {world_size} GPUs")

    # Spawn one process per GPU
    torch.multiprocessing.spawn(
        train,
        args=(world_size,),
        nprocs=world_size,
        join=True
    )

if __name__ == "__main__":
    main()
```

### Launching with torchrun

Instead of `torch.multiprocessing.spawn`, use `torchrun` (recommended):

```bash
# Single node, 4 GPUs
torchrun --nproc_per_node=4 train.py

# Multi-node (2 nodes, 4 GPUs each)
# On node 0:
torchrun --nproc_per_node=4 --nnodes=2 --node_rank=0 \
    --master_addr="192.168.1.1" --master_port=12355 train.py

# On node 1:
torchrun --nproc_per_node=4 --nnodes=2 --node_rank=1 \
    --master_addr="192.168.1.1" --master_port=12355 train.py
```

With `torchrun`, you don't need `torch.multiprocessing.spawn`. Just use environment variables:

```python
def setup_torchrun():
    """Setup for torchrun launcher."""
    dist.init_process_group(backend="nccl")
    rank = int(os.environ["LOCAL_RANK"])
    torch.cuda.set_device(rank)
    return rank
```

---

## Model Parallelism

When a model is too large for a single GPU, split it across GPUs.

### Pipeline Parallelism

Different **layers** on different GPUs. Data flows sequentially through GPUs.

```python
class PipelineModel(nn.Module):
    def __init__(self):
        super().__init__()
        # First half on GPU 0
        self.layer1 = nn.Linear(1024, 2048).to("cuda:0")
        self.layer2 = nn.Linear(2048, 2048).to("cuda:0")
        # Second half on GPU 1
        self.layer3 = nn.Linear(2048, 2048).to("cuda:1")
        self.layer4 = nn.Linear(2048, 10).to("cuda:1")

    def forward(self, x):
        x = x.to("cuda:0")
        x = torch.relu(self.layer1(x))
        x = torch.relu(self.layer2(x))
        # Transfer between GPUs
        x = x.to("cuda:1")
        x = torch.relu(self.layer3(x))
        x = self.layer4(x)
        return x
```

**Problem:** GPUs sit idle waiting for data — the "bubble" problem.

**Solution:** Micro-batching — split the mini-batch into smaller chunks and pipeline them.

### Tensor Parallelism

Split **individual layers** across GPUs. For example, a large matrix multiplication:

$$Y = XW$$

Split $W$ column-wise across 2 GPUs:

$$Y = [XW_1 \;|\; XW_2]$$

Each GPU computes half the output, then results are concatenated.

---

## Combining Strategies

Large-scale training often combines all approaches:

```
┌─────────────────────────────────────────────────┐
│              Hybrid Parallelism                  │
│                                                 │
│  Data Parallel Group 1    Data Parallel Group 2 │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │ GPU 0 │ GPU 1   │    │ GPU 4 │ GPU 5   │    │
│  │ Layer │ Layer   │    │ Layer │ Layer   │    │
│  │ 1-12  │ 13-24   │    │ 1-12  │ 13-24   │    │
│  │(pipe) │(pipe)   │    │(pipe) │(pipe)   │    │
│  ├───────┼─────────┤    ├───────┼─────────┤    │
│  │ GPU 2 │ GPU 3   │    │ GPU 6 │ GPU 7   │    │
│  │ Layer │ Layer   │    │ Layer │ Layer   │    │
│  │ 1-12  │ 13-24   │    │ 1-12  │ 13-24   │    │
│  └───────┴─────────┘    └───────┴─────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Gradient Accumulation

An alternative to multi-GPU when you only have **one GPU** but need a large effective batch size:

```python
accumulation_steps = 4  # Simulate 4× larger batch
optimizer.zero_grad()

for i, (data, target) in enumerate(loader):
    output = model(data)
    loss = criterion(output, target)
    loss = loss / accumulation_steps  # Normalize loss
    loss.backward()  # Accumulate gradients

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()  # Update only every N steps
        optimizer.zero_grad()
```

This gives you the same effective batch size without needing more GPUs.

---

## Communication Backends

| Backend | Best For | Protocol |
|---------|----------|----------|
| **NCCL** | GPU-to-GPU | NVIDIA optimized, fastest for GPUs |
| **Gloo** | CPU training | Facebook, works on any hardware |
| **MPI** | HPC clusters | Standard HPC communication |

Always use NCCL for GPU training:

```python
dist.init_process_group(backend="nccl")  # GPU
dist.init_process_group(backend="gloo")  # CPU
```

---

## Common Issues and Solutions

### 1. Out of Memory (OOM)

```python
# Solution: Reduce per-GPU batch size
# Effective batch = per_gpu_batch × num_gpus
# Keep effective batch same, reduce per-GPU batch
per_gpu_batch = total_batch_size // world_size
```

### 2. Gradient Synchronization Bugs

```python
# Bug: Not all processes enter backward pass
# This causes deadlock because AllReduce waits for all processes
if rank == 0:  # BUG: only rank 0 computes loss
    loss.backward()

# Fix: All ranks must call backward
loss.backward()  # All ranks
```

### 3. Deadlocks

```python
# Bug: Conditional operations that differ between ranks
if rank == 0:
    dist.send(tensor, dst=1)  # Rank 0 sends
# If rank 1 never calls recv, deadlock!

# Fix: Ensure symmetric communication
if rank == 0:
    dist.send(tensor, dst=1)
elif rank == 1:
    dist.recv(tensor, src=0)
```

### 4. Forgetting set_epoch

```python
# Bug: Same data order every epoch
for epoch in range(epochs):
    # sampler.set_epoch(epoch)  # MISSING!
    for data in loader:
        ...

# Fix: Always set epoch for proper shuffling
for epoch in range(epochs):
    sampler.set_epoch(epoch)  # Correct!
    for data in loader:
        ...
```

---

## Performance Tips

1. **Use `pin_memory=True`** in DataLoader for faster CPU→GPU transfer
2. **Set `num_workers > 0`** for parallel data loading
3. **Overlap communication and computation** (DDP does this automatically)
4. **Use gradient compression** for slow networks
5. **Profile with `torch.profiler`** to find bottlenecks

```python
loader = DataLoader(
    dataset,
    batch_size=64,
    sampler=sampler,
    num_workers=4,       # Parallel data loading
    pin_memory=True,     # Faster GPU transfer
    prefetch_factor=2,   # Prefetch batches
    persistent_workers=True,  # Keep workers alive
)
```

---

## Scaling Efficiency

Ideal scaling is linear: 4 GPUs → 4× faster. Reality is less due to communication overhead.

| GPUs | Ideal Speedup | Typical Speedup | Efficiency |
|------|---------------|-----------------|------------|
| 1 | 1× | 1× | 100% |
| 2 | 2× | 1.9× | 95% |
| 4 | 4× | 3.6× | 90% |
| 8 | 8× | 6.8× | 85% |
| 32 | 32× | 24× | 75% |

Communication overhead grows with more GPUs. Use larger batch sizes to amortize communication cost.

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| Data Parallelism | Same model on each GPU, different data |
| DDP | Recommended PyTorch distributed training |
| Model Parallelism | Split model across GPUs (for huge models) |
| DistributedSampler | Ensures each GPU gets unique data |
| torchrun | Standard launcher for DDP scripts |
| Gradient Accumulation | Simulate large batches on one GPU |
| NCCL | Best communication backend for GPUs |

---

## Try It Yourself

1. Convert a single-GPU training script to DDP
2. Measure speedup with 2 vs 4 GPUs
3. Implement gradient accumulation and compare
4. Profile communication overhead with `torch.profiler`
5. Experiment with different batch sizes and learning rate scaling

---

## Further Reading

- PyTorch Distributed Training Tutorial (official docs)
- "Accurate, Large Minibatch SGD" (linear scaling rule paper)
- DeepSpeed library for advanced distributed training
- FSDP (Fully Sharded Data Parallelism) for memory-efficient training
