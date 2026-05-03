---
title: Learning Rate & Scheduling
---

# Learning Rate & Scheduling

The **learning rate** is the single most important hyperparameter in deep learning. It affects whether training converges, how fast it converges, and even how well the model generalizes. In this lesson, you'll learn how to find a good learning rate and how to **schedule** it during training for optimal results.

---

## Why Learning Rate Matters So Much

Every optimizer uses a learning rate $\alpha$ somewhere in its update:

$$\theta \leftarrow \theta - \alpha \cdot (\text{update direction})$$

Even with Adam's adaptive per-parameter scaling, the **base learning rate** still controls the overall scale of updates.

### The Learning Rate Landscape

| Learning Rate | Training Behavior | Final Result |
|---------------|-------------------|--------------|
| Way too high ($1.0$) | Loss explodes (NaN) | Model broken |
| Too high ($0.1$) | Loss oscillates | Suboptimal |
| Good ($0.001$) | Smooth decrease | Good model |
| Too low ($0.000001$) | Barely moves | Undertrained (wasted compute) |
| Perfect (scheduled) | Fast then fine-tuning | Best model |

---

## Finding a Good Learning Rate

### Learning Rate Range Test

The **LR range test** (Smith, 2017) is a practical method to find a good starting learning rate:

1. Start with a very small LR (e.g., $10^{-7}$)
2. Increase it exponentially each mini-batch
3. Plot loss vs. learning rate
4. Pick the LR where loss decreases **fastest** (steepest downward slope)

```
Loss
 ▲
 │ ····················
 │                     ···
 │                        ··
 │                          ··
 │                            ·  ← steepest descent
 │                             ·     pick LR here!
 │                              ··
 │                                ··
 │                                  ····
 │                                      ··········
 └───────────────────────────────────────────────→ log(LR)
   10⁻⁷  10⁻⁶  10⁻⁵  10⁻⁴  10⁻³  10⁻²  10⁻¹
                              ↑
                         good range
```

### PyTorch Implementation

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt
import math

# --- Create data ---
torch.manual_seed(42)
X = torch.randn(2000, 10)
y = (X[:, :3].sum(dim=1) + torch.sin(X[:, 3]) * 2).unsqueeze(1)
dataset = TensorDataset(X, y)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# --- Model ---
model = nn.Sequential(
    nn.Linear(10, 64), nn.ReLU(),
    nn.Linear(64, 32), nn.ReLU(),
    nn.Linear(32, 1),
)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=1e-7)

# --- LR Range Test ---
lr_min, lr_max = 1e-7, 10
num_steps = 200
gamma = (lr_max / lr_min) ** (1 / num_steps)  # multiplicative factor

lrs = []
losses = []
best_loss = float("inf")
smoothed_loss = 0

for step in range(num_steps):
    # Get a batch
    X_batch, y_batch = next(iter(dataloader))

    # Forward
    y_pred = model(X_batch)
    loss = criterion(y_pred, y_batch)

    # Smooth the loss
    smoothed_loss = 0.9 * smoothed_loss + 0.1 * loss.item() if step > 0 else loss.item()

    # Stop if loss is exploding
    if step > 10 and smoothed_loss > 4 * best_loss:
        break
    if smoothed_loss < best_loss:
        best_loss = smoothed_loss

    # Record
    current_lr = optimizer.param_groups[0]["lr"]
    lrs.append(current_lr)
    losses.append(smoothed_loss)

    # Backward + update
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # Increase LR
    for param_group in optimizer.param_groups:
        param_group["lr"] *= gamma

# --- Plot ---
plt.figure(figsize=(8, 5))
plt.plot(lrs, losses, linewidth=2)
plt.xscale("log")
plt.xlabel("Learning Rate (log scale)")
plt.ylabel("Loss (smoothed)")
plt.title("Learning Rate Range Test")
plt.grid(True, alpha=0.3)
plt.axvline(x=1e-3, color="red", linestyle="--", label="Suggested LR")
plt.legend()
plt.tight_layout()
plt.savefig("lr_range_test.png", dpi=100)
plt.show()
```

---

## Learning Rate Schedules

Instead of keeping the learning rate fixed, we **change it during training**. The general strategy:

> **Start with a larger LR** (fast progress early) → **decay to a smaller LR** (fine-tune later)

This is called a **learning rate schedule** or **learning rate policy**.

---

## Step Decay

The simplest schedule: reduce LR by a factor every N epochs.

$$\alpha_t = \alpha_0 \cdot \gamma^{\lfloor t / S \rfloor}$$

Where:
- $\alpha_0$ = initial learning rate
- $\gamma$ = decay factor (e.g., 0.1)
- $S$ = step size (epochs between drops)

```
LR
 ▲
 │ ●●●●●●●●●●
 │             ●●●●●●●●●●
 │                         ●●●●●●●●●●
 │                                     ●●●●●●●●●●
 └──────────────────────────────────────────────────→ Epoch
     0    10    20    30    40    50    60    70
```

### PyTorch: StepLR

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)

for epoch in range(90):
    train_one_epoch()
    scheduler.step()  # Call AFTER optimizer.step()
    # LR: 0.1 → 0.01 (epoch 30) → 0.001 (epoch 60)
```

---

## Exponential Decay

Smooth, continuous decay every epoch:

$$\alpha_t = \alpha_0 \cdot \gamma^t$$

Where $\gamma$ is slightly less than 1 (e.g., 0.95).

```
LR
 ▲
 │·
 │ ··
 │   ···
 │      ····
 │          ·····
 │               ·········
 │                        ···············
 └──────────────────────────────────────────────────→ Epoch
```

### PyTorch: ExponentialLR

```python
scheduler = torch.optim.lr_scheduler.ExponentialLR(optimizer, gamma=0.95)
```

---

## Cosine Annealing

A smooth cosine curve that gradually reduces the learning rate to a minimum value:

$$\eta_t = \eta_{\min} + \frac{1}{2}(\eta_{\max} - \eta_{\min})\left(1 + \cos\left(\frac{t\pi}{T}\right)\right)$$

Where:
- $\eta_{\max}$ = initial (maximum) learning rate
- $\eta_{\min}$ = minimum learning rate (often 0)
- $T$ = total number of epochs
- $t$ = current epoch

```
LR
 ▲
 │●
 │ ●●
 │   ●●
 │     ●●●
 │        ●●●
 │           ●●●●
 │               ●●●●●
 │                    ●●●●●●●●
 │                             ●●●●●●●●●●●●●●●
 └──────────────────────────────────────────────→ Epoch
```

### Why Cosine?

- Starts fast (high LR) — explores the loss landscape broadly
- Slows smoothly — settles into a good minimum
- Spends more time at low LRs — fine-tuning
- No "jumps" — smoother than step decay

### PyTorch: CosineAnnealingLR

```python
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer,
    T_max=100,   # Total epochs
    eta_min=1e-6 # Minimum LR
)
```

---

## Warm-Up

**Problem:** At the start of training, the model weights are random and gradients can be very large. A high learning rate combined with large gradients can cause instability.

**Solution:** Start with a very small LR and **gradually increase** it over the first few epochs.

$$\alpha_t = \alpha_{\max} \cdot \frac{t}{T_{\text{warmup}}} \quad \text{for } t < T_{\text{warmup}}$$

```
LR
 ▲            ●●●●●●●●●●●●●●
 │          ●●
 │        ●●
 │      ●●
 │    ●●                        (decay phase)
 │  ●●                         ●●●●●
 │●●                                 ●●●●●●●●●●
 └──────────────────────────────────────────────→ Epoch
   ↑ warmup ↑
```

### When to Use Warm-Up

| Scenario | Warm-Up Needed? |
|----------|-----------------|
| Large batch training | Yes — gradients are more accurate but larger |
| Transformers (BERT, GPT) | Yes — always used |
| Adam optimizer | Sometimes — helps stability |
| Small models, small batches | Usually not needed |

### PyTorch: LinearLR (for warm-up)

```python
# Linear warm-up over first 5 epochs
warmup_scheduler = torch.optim.lr_scheduler.LinearLR(
    optimizer,
    start_factor=0.1,   # Start at 0.1 * base_lr
    end_factor=1.0,     # End at 1.0 * base_lr
    total_iters=5       # Over 5 epochs
)
```

---

## One-Cycle Policy

The **one-cycle policy** (Smith & Topin, 2018) is one of the best schedules for fast training:

1. **Warm-up phase:** LR increases from low to high
2. **Annealing phase:** LR decreases from high to very low

Additionally, momentum does the **opposite** — high when LR is low, low when LR is high.

$$\text{LR: low} \xrightarrow{\text{warm-up}} \text{high} \xrightarrow{\text{cosine anneal}} \text{very low}$$

```
LR
 ▲
 │        ●●●●
 │      ●●    ●●
 │    ●●        ●●
 │  ●●            ●●●
 │●●                  ●●●●
 │                         ●●●●●●●●●●●●●
 └──────────────────────────────────────────→ Epoch
  ↑  warm-up  ↑        annealing         ↑

Momentum (opposite pattern):
 ▲●●                  ●●●●●●●●●●●●●●●●●●●
 │  ●●             ●●●
 │    ●●        ●●●
 │      ●●    ●●
 │        ●●●●
 └──────────────────────────────────────────→ Epoch
```

### Why It Works

- **High LR in the middle** acts as regularization (can escape sharp minima)
- **Very low LR at the end** fine-tunes into a flat minimum (better generalization)
- Typically converges in **fewer epochs** than constant LR

### PyTorch: OneCycleLR

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)  # max_lr

scheduler = torch.optim.lr_scheduler.OneCycleLR(
    optimizer,
    max_lr=0.01,
    epochs=30,
    steps_per_epoch=len(dataloader),  # per-batch scheduling
    pct_start=0.3,    # 30% of training for warm-up
    anneal_strategy="cos",
    div_factor=25,     # initial_lr = max_lr / 25
    final_div_factor=1000,  # final_lr = initial_lr / 1000
)

# Important: step() is called per BATCH, not per epoch!
for epoch in range(30):
    for X_batch, y_batch in dataloader:
        y_pred = model(X_batch)
        loss = criterion(y_pred, y_batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        scheduler.step()  # After every batch!
```

---

## Combining Warm-Up with Other Schedules

A common pattern: warm up first, then apply cosine annealing.

### PyTorch: SequentialLR

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)

# Phase 1: Linear warm-up (epochs 0-4)
warmup = torch.optim.lr_scheduler.LinearLR(
    optimizer, start_factor=0.01, total_iters=5
)

# Phase 2: Cosine annealing (epochs 5-99)
cosine = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=95, eta_min=1e-6
)

# Combine them
scheduler = torch.optim.lr_scheduler.SequentialLR(
    optimizer,
    schedulers=[warmup, cosine],
    milestones=[5],  # Switch from warmup to cosine at epoch 5
)
```

---

## Code: Visualize All Schedules

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# --- Dummy model and optimizer factory ---
def make_optimizer(lr=0.1):
    model = nn.Linear(10, 1)
    return torch.optim.SGD(model.parameters(), lr=lr)

num_epochs = 100

# --- Collect LRs for each schedule ---
schedules = {}

# 1. Step Decay
opt = make_optimizer(0.1)
sched = torch.optim.lr_scheduler.StepLR(opt, step_size=30, gamma=0.1)
lrs = []
for _ in range(num_epochs):
    lrs.append(opt.param_groups[0]["lr"])
    sched.step()
schedules["Step Decay"] = lrs

# 2. Exponential Decay
opt = make_optimizer(0.1)
sched = torch.optim.lr_scheduler.ExponentialLR(opt, gamma=0.95)
lrs = []
for _ in range(num_epochs):
    lrs.append(opt.param_groups[0]["lr"])
    sched.step()
schedules["Exponential"] = lrs

# 3. Cosine Annealing
opt = make_optimizer(0.1)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=num_epochs, eta_min=1e-5)
lrs = []
for _ in range(num_epochs):
    lrs.append(opt.param_groups[0]["lr"])
    sched.step()
schedules["Cosine Annealing"] = lrs

# 4. Warm-up + Cosine
opt = make_optimizer(0.1)
warmup = torch.optim.lr_scheduler.LinearLR(opt, start_factor=0.01, total_iters=10)
cosine = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=90, eta_min=1e-5)
sched = torch.optim.lr_scheduler.SequentialLR(opt, [warmup, cosine], milestones=[10])
lrs = []
for _ in range(num_epochs):
    lrs.append(opt.param_groups[0]["lr"])
    sched.step()
schedules["Warm-up + Cosine"] = lrs

# 5. One-Cycle (simplified — using per-epoch steps)
opt = make_optimizer(0.01)
sched = torch.optim.lr_scheduler.OneCycleLR(
    opt, max_lr=0.1, total_steps=num_epochs, pct_start=0.3,
    anneal_strategy="cos", div_factor=10, final_div_factor=100,
)
lrs = []
for _ in range(num_epochs):
    lrs.append(opt.param_groups[0]["lr"])
    sched.step()
schedules["One-Cycle"] = lrs

# --- Plot ---
fig, axes = plt.subplots(2, 3, figsize=(15, 9))
axes = axes.flatten()
colors = ["blue", "orange", "green", "red", "purple"]

for ax, (name, lrs), color in zip(axes, schedules.items(), colors):
    ax.plot(lrs, linewidth=2, color=color)
    ax.set_title(name, fontsize=13)
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Learning Rate")
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, num_epochs)

# All on one plot
for (name, lrs), color in zip(schedules.items(), colors):
    axes[5].plot(lrs, label=name, linewidth=2, color=color)
axes[5].set_title("All Schedules", fontsize=13)
axes[5].set_xlabel("Epoch")
axes[5].set_ylabel("Learning Rate")
axes[5].legend(fontsize=9)
axes[5].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("lr_schedules.png", dpi=100)
plt.show()
```

---

## Code: Training with Different Schedules

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

# --- Data ---
torch.manual_seed(42)
X = torch.randn(3000, 10)
y = (X[:, :4].sum(dim=1) ** 2 + torch.sin(X[:, 5]) * 3).unsqueeze(1)
dataset = TensorDataset(X, y)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# --- Model factory ---
def create_model():
    torch.manual_seed(42)
    return nn.Sequential(
        nn.Linear(10, 128), nn.ReLU(),
        nn.Linear(128, 64), nn.ReLU(),
        nn.Linear(64, 1),
    )

# --- Train with a given schedule ---
def train_with_schedule(schedule_name, num_epochs=60):
    model = create_model()
    criterion = nn.MSELoss()

    if schedule_name == "Constant":
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
        scheduler = None
    elif schedule_name == "Step Decay":
        optimizer = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9)
        scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=20, gamma=0.1)
    elif schedule_name == "Cosine":
        optimizer = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            optimizer, T_max=num_epochs, eta_min=1e-5
        )
    elif schedule_name == "One-Cycle":
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
        scheduler = torch.optim.lr_scheduler.OneCycleLR(
            optimizer, max_lr=0.1, epochs=num_epochs,
            steps_per_epoch=len(dataloader), pct_start=0.3,
        )

    losses = []
    lrs = []

    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for X_batch, y_batch in dataloader:
            y_pred = model(X_batch)
            loss = criterion(y_pred, y_batch)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            if schedule_name == "One-Cycle":
                scheduler.step()  # Per batch for OneCycleLR

        if scheduler and schedule_name != "One-Cycle":
            scheduler.step()  # Per epoch for others

        # Record
        epoch_loss = criterion(model(X), y).item()
        losses.append(epoch_loss)
        lrs.append(optimizer.param_groups[0]["lr"])

    return losses, lrs

# --- Compare ---
results = {}
for name in ["Constant", "Step Decay", "Cosine", "One-Cycle"]:
    losses, lrs = train_with_schedule(name)
    results[name] = {"losses": losses, "lrs": lrs}
    print(f"{name:12s}: final loss = {losses[-1]:.4f}")

# --- Plot ---
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

for name, data in results.items():
    ax1.plot(data["losses"], label=name, linewidth=2)
    ax2.plot(data["lrs"], label=name, linewidth=2)

ax1.set_xlabel("Epoch")
ax1.set_ylabel("Loss")
ax1.set_title("Training Loss with Different LR Schedules")
ax1.legend()
ax1.grid(True, alpha=0.3)
ax1.set_yscale("log")

ax2.set_xlabel("Epoch")
ax2.set_ylabel("Learning Rate")
ax2.set_title("Learning Rate over Training")
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("lr_schedule_training.png", dpi=100)
plt.show()
```

---

## Practical Tips

### Which Schedule to Use?

| Situation | Recommended Schedule |
|-----------|---------------------|
| Quick experiment | Constant LR with Adam |
| Training a ConvNet to best accuracy | Cosine annealing + warm-up |
| Fast training, fewer epochs | One-cycle policy |
| Fine-tuning pretrained model | Low constant LR or cosine from small value |
| Transformers (BERT, GPT) | Linear warm-up + cosine/linear decay |
| Not sure | Cosine annealing (rarely bad) |

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Calling `scheduler.step()` before `optimizer.step()` | Warning in PyTorch | Always optimizer first |
| Using per-batch scheduler with per-epoch call | LR barely changes | Match step frequency |
| Not using warm-up with large batches | Training instability | Add 5–10 epoch warm-up |
| Too aggressive decay | Underfitting late in training | Use higher `eta_min` |

---

## Summary

| Schedule | Formula | Best For |
|----------|---------|----------|
| **Step Decay** | $\alpha \cdot \gamma^{\lfloor t/S \rfloor}$ | Simple, predictable drops |
| **Exponential** | $\alpha \cdot \gamma^t$ | Smooth continuous decay |
| **Cosine Annealing** | $\frac{1}{2}(\eta_{\max}-\eta_{\min})(1+\cos(\frac{t\pi}{T})) + \eta_{\min}$ | Most situations |
| **Warm-up** | Linear increase first | Large batches, transformers |
| **One-Cycle** | Warm-up → high → anneal | Fast convergence |

### What's Next?

Now you know how to optimize learning. But a model that learns the training data too well performs poorly on new data — that's **overfitting**. Next, we'll learn **regularization** techniques to prevent it.
