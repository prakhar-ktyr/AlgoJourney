---
title: Debugging Deep Learning Models
---

# Debugging Deep Learning Models

Debugging deep learning is uniquely hard — there are no compiler errors, the model just quietly gives bad results. This lesson teaches you a systematic approach to finding and fixing problems.

---

## Why DL Debugging Is Hard

Unlike traditional software:

| Traditional Code | Deep Learning |
|-----------------|---------------|
| Crash = obvious bug | No crash, just bad accuracy |
| Clear error messages | Loss goes down but model is wrong |
| Deterministic | Stochastic (random init, data order) |
| Unit testable | Hard to isolate components |
| Fix one thing at a time | Everything interacts |

A model can train without errors yet be completely wrong. Silent failures are the norm.

---

## Common Bugs and Symptoms

### Loss Doesn't Decrease

| Possible Cause | How to Check |
|---------------|--------------|
| Learning rate too low | Try 10× larger LR |
| Learning rate too high | Loss oscillates wildly |
| Bug in model (no gradient flow) | Check `param.grad` is not None/zero |
| Wrong loss function | Verify loss matches task |
| Data not reaching model | Print model input stats |
| Labels are wrong | Visualize (input, label) pairs |

### Loss is NaN or Inf

| Possible Cause | How to Check |
|---------------|--------------|
| Exploding gradients | Monitor gradient norms |
| Division by zero | Check for zero denominators |
| Log of zero/negative | Add epsilon: `log(x + 1e-8)` |
| Bad input data | Check for NaN/Inf in data |
| Learning rate too high | Reduce LR by 10× |

### Loss Decreases Then Plateaus

| Possible Cause | How to Check |
|---------------|--------------|
| Model too small | Try larger model |
| Need learning rate decay | Add scheduler |
| Bad optimizer choice | Try Adam instead of SGD |
| Feature preprocessing issue | Normalize inputs |

### Immediate Overfitting

| Possible Cause | How to Check |
|---------------|--------------|
| Data leakage | Check train/val split has no overlap |
| Model too large for data | Reduce model size or add regularization |
| Augmentation missing | Add data augmentation |
| Bug causing same batch repeated | Verify DataLoader randomness |

---

## The Debugging Checklist

Follow this order when something isn't working:

### Step 1: Overfit a Single Batch

The most important debugging step. If the model can't memorize one batch, something fundamental is broken.

```python
def overfit_single_batch(model, train_loader, optimizer, criterion, device, steps=1000):
    """
    Try to overfit a single batch.
    If loss doesn't go to ~0, there's a fundamental bug.
    """
    model.train()
    # Get one batch
    data, target = next(iter(train_loader))
    data, target = data.to(device), target.to(device)

    print(f"Batch shape: {data.shape}, Target shape: {target.shape}")
    print(f"Target distribution: {torch.bincount(target)}")

    for step in range(steps):
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()

        if step % 100 == 0:
            acc = (output.argmax(1) == target).float().mean()
            print(f"Step {step}: Loss={loss.item():.4f}, Acc={acc.item():.4f}")

    # Should reach ~100% accuracy and ~0 loss
    final_acc = (model(data).argmax(1) == target).float().mean()
    print(f"\nFinal accuracy: {final_acc.item():.4f}")
    if final_acc < 0.99:
        print("WARNING: Cannot overfit single batch! Fundamental bug exists.")
    else:
        print("SUCCESS: Model can overfit. Bug is likely in data/regularization/scale.")
```

### Step 2: Verify Data Loading

```python
def verify_data(loader, num_samples=5):
    """Visualize samples to check data pipeline correctness."""
    import matplotlib.pyplot as plt

    data, targets = next(iter(loader))
    print(f"Data shape: {data.shape}")
    print(f"Data range: [{data.min():.3f}, {data.max():.3f}]")
    print(f"Data mean: {data.mean():.3f}, std: {data.std():.3f}")
    print(f"Target values: {targets[:10]}")

    # Check for NaN/Inf
    assert not torch.isnan(data).any(), "NaN in data!"
    assert not torch.isinf(data).any(), "Inf in data!"

    # Visualize
    fig, axes = plt.subplots(1, num_samples, figsize=(15, 3))
    for i in range(num_samples):
        img = data[i].permute(1, 2, 0).numpy()
        # Undo normalization for visualization
        img = img * 0.5 + 0.5  # Adjust based on your normalization
        axes[i].imshow(img.clip(0, 1))
        axes[i].set_title(f"Label: {targets[i].item()}")
        axes[i].axis("off")
    plt.tight_layout()
    plt.savefig("data_check.png")
    print("Saved data_check.png")
```

### Step 3: Check Shapes at Each Layer

```python
def check_shapes(model, sample_input):
    """Print shapes at each layer to find dimension bugs."""
    print(f"Input: {sample_input.shape}")

    x = sample_input
    for name, layer in model.named_children():
        try:
            x = layer(x)
            print(f"  → {name}: {x.shape}")
        except RuntimeError as e:
            print(f"  → {name}: ERROR - {e}")
            break

# Usage
sample = torch.randn(1, 3, 32, 32).to(device)
check_shapes(model, sample)
```

### Step 4: Monitor Gradient Norms

```python
def monitor_gradients(model):
    """Check gradient health after backward pass."""
    total_norm = 0
    for name, param in model.named_parameters():
        if param.grad is not None:
            param_norm = param.grad.data.norm(2).item()
            total_norm += param_norm ** 2

            # Flag problems
            if param_norm == 0:
                print(f"  ZERO gradient: {name}")
            elif param_norm > 100:
                print(f"  LARGE gradient: {name} = {param_norm:.4f}")
            elif torch.isnan(param.grad).any():
                print(f"  NaN gradient: {name}")

    total_norm = total_norm ** 0.5
    print(f"Total gradient norm: {total_norm:.4f}")
    return total_norm
```

### Step 5: Start with Known-Good Hyperparameters

Don't innovate when debugging. Use settings that are known to work:

```python
# Safe starting hyperparameters
safe_config = {
    "optimizer": "Adam",
    "lr": 3e-4,           # The "universal" starting LR for Adam
    "batch_size": 32,     # Small enough to debug easily
    "weight_decay": 0,    # Add later
    "epochs": 10,         # Just enough to see if training works
    "model": "small",     # Start small, scale up
}
```

### Step 6: Add One Thing at a Time

```
Working baseline
  → Add augmentation → Still works? ✓
    → Add regularization → Still works? ✓
      → Increase model size → Still works? ✓
        → Add learning rate schedule → Still works? ✓
```

If something breaks, you know exactly what caused it.

---

## Debugging Tools

### torch.autograd.detect_anomaly()

Finds the exact operation that produces NaN or Inf:

```python
# Enable anomaly detection (slow, use only for debugging)
with torch.autograd.detect_anomaly():
    output = model(data)
    loss = criterion(output, target)
    loss.backward()
    # If NaN is produced, you'll get a traceback showing WHERE
```

**Warning:** Very slow! Only use when hunting NaN bugs.

### Inspecting Model Parameters

```python
def inspect_model(model):
    """Check model weights for common issues."""
    print(f"{'Layer':<40} {'Shape':<20} {'Mean':<10} {'Std':<10} {'Min':<10} {'Max':<10}")
    print("-" * 100)

    for name, param in model.named_parameters():
        data = param.data
        print(
            f"{name:<40} {str(list(data.shape)):<20} "
            f"{data.mean():<10.4f} {data.std():<10.4f} "
            f"{data.min():<10.4f} {data.max():<10.4f}"
        )

        # Check for problems
        if data.std() < 1e-6:
            print(f"  ⚠️  Nearly constant weights in {name}")
        if torch.isnan(data).any():
            print(f"  ❌ NaN weights in {name}")
```

### Gradient Histograms with TensorBoard

```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter("runs/debug")

def log_gradients(model, step):
    """Log gradient histograms to TensorBoard."""
    for name, param in model.named_parameters():
        if param.grad is not None:
            writer.add_histogram(f"gradients/{name}", param.grad, step)
            writer.add_histogram(f"weights/{name}", param.data, step)
            writer.add_scalar(f"grad_norm/{name}", param.grad.norm(), step)

# In training loop
for step, (data, target) in enumerate(train_loader):
    loss = train_step(model, data, target, optimizer, criterion)
    if step % 100 == 0:
        log_gradients(model, step)
```

---

## Debugging Utilities

### Complete Debugging Toolkit

```python
import torch
import torch.nn as nn

class DebugTrainer:
    """Training wrapper with built-in debugging."""

    def __init__(self, model, optimizer, criterion, device):
        self.model = model
        self.optimizer = optimizer
        self.criterion = criterion
        self.device = device
        self.loss_history = []
        self.grad_norms = []

    def train_step(self, data, target):
        self.model.train()
        data, target = data.to(self.device), target.to(self.device)
        self.optimizer.zero_grad()
        output = self.model(data)
        loss = self.criterion(output, target)
        loss.backward()

        # Record gradient norm
        total_norm = sum(p.grad.norm(2).item() ** 2 for p in self.model.parameters() if p.grad is not None) ** 0.5
        self.grad_norms.append(total_norm)

        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        self.optimizer.step()
        self.loss_history.append(loss.item())
        return loss.item()

    def diagnose(self):
        """Print diagnostic information."""
        if len(self.loss_history) > 20:
            recent = sum(self.loss_history[-10:]) / 10
            earlier = sum(self.loss_history[-20:-10]) / 10
            print(f"Loss trend: {recent - earlier:+.4f} ({'⚠️ increasing' if recent > earlier else '✓ decreasing'})")

        if self.grad_norms:
            avg = sum(self.grad_norms[-10:]) / min(10, len(self.grad_norms))
            if avg < 1e-7:
                print("⚠️  Vanishing gradients")
            elif avg > 100:
                print("⚠️  Exploding gradients")
            else:
                print(f"✓ Gradient norm: {avg:.4f}")

    def find_learning_rate(self, loader, start_lr=1e-7, end_lr=10, num_steps=100):
        """LR finder — sweep LR exponentially, find where loss is minimal."""
        import copy
        saved_state = copy.deepcopy(self.model.state_dict())
        lrs, losses = [], []
        lr_mult = (end_lr / start_lr) ** (1 / num_steps)
        lr = start_lr

        for param_group in self.optimizer.param_groups:
            param_group["lr"] = lr

        data_iter = iter(loader)
        for step in range(num_steps):
            try:
                data, target = next(data_iter)
            except StopIteration:
                data_iter = iter(loader)
                data, target = next(data_iter)

            loss = self.train_step(data, target)
            lrs.append(lr)
            losses.append(loss)
            if step > 10 and loss > 4 * min(losses):
                break
            lr *= lr_mult
            for pg in self.optimizer.param_groups:
                pg["lr"] = lr

        self.model.load_state_dict(saved_state)
        best_idx = losses.index(min(losses))
        print(f"Suggested LR: {lrs[max(0, best_idx - 10)]:.2e}")
        return lrs, losses
```

---

## Data Sanity Checks

```python
def data_sanity_check(dataset, num_classes):
    """Comprehensive data validation."""
    from collections import Counter

    # Check class balance
    if hasattr(dataset, "targets"):
        labels = dataset.targets
    else:
        labels = [y for _, y in dataset]

    counter = Counter(labels)
    print("Class distribution:")
    for cls in sorted(counter.keys()):
        count = counter[cls]
        pct = 100 * count / len(labels)
        bar = "█" * int(pct / 2)
        print(f"  Class {cls}: {count:>6} ({pct:.1f}%) {bar}")

    # Check for imbalance
    max_count = max(counter.values())
    min_count = min(counter.values())
    ratio = max_count / min_count
    if ratio > 10:
        print(f"\n  ⚠️  Severe class imbalance (ratio {ratio:.1f}:1)")
        print("  Consider: weighted loss, oversampling, or SMOTE")

    # Verify num_classes
    actual_classes = len(counter)
    if actual_classes != num_classes:
        print(f"\n  ❌ Expected {num_classes} classes, found {actual_classes}!")

    # Check for duplicate samples
    print(f"\nTotal samples: {len(labels)}")

```

---

## Ablation Studies

Remove components systematically to understand their contribution:

```python
ablation_configs = {
    "full_model": {"augmentation": True, "dropout": 0.5, "scheduler": True},
    "no_augmentation": {"augmentation": False, "dropout": 0.5, "scheduler": True},
    "no_dropout": {"augmentation": True, "dropout": 0.0, "scheduler": True},
    "no_scheduler": {"augmentation": True, "dropout": 0.5, "scheduler": False},
}

for name, config in ablation_configs.items():
    model = train_with_config(config)
    metric = evaluate(model)
    print(f"{name:<25} → Accuracy: {metric:.4f}")
```

If accuracy drops significantly when you remove a component, that component is important.

---

## Quick Debugging Checklist

```
□ Can you overfit one batch? (Loss → 0, Acc → 100%)
□ Is data loading correct? (Visualize samples + labels)
□ Are input shapes correct at every layer?
□ Are gradients flowing? (No zero/NaN gradients)
□ Is the learning rate reasonable? (Try LR finder)
□ Is the loss function correct for your task?
□ Is data normalized? (mean≈0, std≈1)
□ Are train/val splits correct? (No leakage)
□ Is the model architecture right? (Output size = num_classes)
□ Are you using the right evaluation metric?
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| Overfit one batch | First debugging step — if it fails, fundamental bug |
| Gradient monitoring | Detect vanishing/exploding gradients early |
| LR finder | Systematically find good learning rate range |
| detect_anomaly | Locates exact operation producing NaN |
| Add one thing at a time | Isolate the cause of failures |
| Data verification | Many bugs come from bad data pipelines |

---

## Try It Yourself

1. Intentionally introduce a bug (wrong loss, bad LR) and use the checklist to find it
2. Run the LR finder on a new model and dataset
3. Create a model that produces NaN and use `detect_anomaly` to find it
4. Run an ablation study on augmentation techniques
5. Build a dashboard that monitors training health in real-time

---

## Further Reading

- Andrej Karpathy, "A Recipe for Training Neural Networks" (blog post)
- "Troubleshooting Deep Neural Networks" (Josh Tobin's guide)
- PyTorch Debugging Tutorial (official docs)
- Full Stack Deep Learning: Debugging & Testing lecture
