---
title: Hyperparameter Tuning
---

# Hyperparameter Tuning

You've built a neural network, but the accuracy is stuck at 75%. Is the architecture wrong? Is the data bad? Often, the answer is simpler: **your hyperparameters need tuning**. The difference between a mediocre model and a great one frequently comes down to picking the right learning rate, batch size, and layer sizes.

In this lesson, you'll learn what hyperparameters are, how to search for good values systematically, and how to use tools like Optuna to automate the process.

---

## Parameters vs Hyperparameters

This distinction trips up many beginners, so let's be crystal clear:

| | Parameters | Hyperparameters |
|---|-----------|-----------------|
| **What** | Weights and biases in the network | Settings that control the training process |
| **Who sets them** | The optimizer (gradient descent) | **You** (the developer) |
| **When** | Updated every training step | Fixed before training starts |
| **Examples** | Weight matrices, bias vectors | Learning rate, batch size, number of layers |
| **How many** | Millions (in large models) | Dozens at most |

```
┌─────────────────────────────────────────────────────────┐
│                    Your Choices                          │
│   (Hyperparameters)                                     │
│                                                         │
│   learning_rate = 0.001                                 │
│   batch_size = 32                                       │
│   hidden_size = 128                                     │
│   num_layers = 3                                        │
│   dropout = 0.2                                         │
│                                                         │
│         ┌──────────────────────────┐                    │
│         │     Training Process     │                    │
│         │                          │                    │
│         │   W₁, b₁  ← learned     │                    │
│         │   W₂, b₂  ← learned     │                    │
│         │   W₃, b₃  ← learned     │                    │
│         │                          │                    │
│         │   (Parameters)           │                    │
│         └──────────────────────────┘                    │
│                                                         │
│   Result: accuracy = 92%                                │
└─────────────────────────────────────────────────────────┘
```

> **Think of it this way:** parameters are what the model learns, hyperparameters are what **you** decide before the model starts learning.

---

## Key Hyperparameters

Here are the most important hyperparameters you'll tune in deep learning:

### 1. Learning Rate

The **single most important** hyperparameter. It controls how big each weight update step is.

$$w_{\text{new}} = w_{\text{old}} - \eta \cdot \nabla L$$

| Value | Effect |
|-------|--------|
| Too high (e.g., 0.1) | Training diverges, loss explodes |
| Too low (e.g., 0.000001) | Training is painfully slow, may get stuck |
| Just right (e.g., 0.001) | Smooth convergence to good solution |

```
Loss
  ▲
  │ ╲                          ← too high (diverges)
  │  ╲  ╱╲  ╱╲  ╱╲
  │   ╲╱  ╲╱  ╲╱
  │
  │ ╲
  │  ╲
  │   ╲                        ← just right
  │    ╲___________
  │
  │ ╲
  │  ╲
  │   ╲
  │    ╲
  │     ╲
  │      ╲                     ← too low (very slow)
  │       ╲
  │        ╲_______________
  └──────────────────────────→ Epochs
```

**Typical range:** $10^{-5}$ to $10^{-1}$, usually starting at $10^{-3}$.

### 2. Batch Size

How many samples the model sees before updating weights.

| Batch Size | Pros | Cons |
|-----------|------|------|
| Small (8-32) | Good generalization, less memory | Noisy gradients, slower per epoch |
| Medium (64-256) | Good balance | — |
| Large (512+) | Stable gradients, fast per epoch | May generalize worse, needs more memory |

**Common choices:** 32, 64, 128, 256.

### 3. Hidden Layer Size

The number of neurons in each hidden layer.

```python
# Small: may underfit
nn.Linear(784, 32)

# Medium: good starting point
nn.Linear(784, 128)

# Large: more capacity, but may overfit
nn.Linear(784, 512)
```

**Rule of thumb:** Start between your input and output size, then adjust.

### 4. Number of Layers (Depth)

How many hidden layers the network has.

| Depth | Use Case |
|-------|----------|
| 1-2 layers | Simple problems (tabular data) |
| 3-5 layers | Medium complexity (small images) |
| 10-50 layers | Complex problems (large images, NLP) |
| 100+ layers | State-of-the-art (ResNet, Transformers) |

> **More layers ≠ always better.** Deeper networks are harder to train and more prone to overfitting on small datasets.

### 5. Dropout Rate

The probability of randomly zeroing neurons during training.

| Rate | Effect |
|------|--------|
| 0.0 | No regularization |
| 0.1-0.3 | Light regularization |
| 0.5 | Standard (original paper recommendation) |
| 0.8+ | Too aggressive — network can't learn |

**Typical range:** 0.1 to 0.5.

### 6. Other Hyperparameters

| Hyperparameter | Typical Range | Notes |
|---------------|---------------|-------|
| Weight decay | $10^{-5}$ to $10^{-2}$ | L2 regularization strength |
| Momentum | 0.9 to 0.99 | For SGD with momentum |
| Number of epochs | 10 to 1000 | Use early stopping |
| Optimizer choice | Adam, SGD, AdamW | Adam is a safe default |

---

## Grid Search

The simplest approach: **try every combination**.

### How It Works

```
                Learning Rate
                0.001   0.01   0.1
              ┌───────┬───────┬───────┐
Batch    32   │ 85.2% │ 87.1% │ 62.3% │
Size     64   │ 84.8% │ 88.4% │ 58.1% │  ← try ALL cells
        128   │ 83.9% │ 86.7% │ 55.0% │
              └───────┴───────┴───────┘

Best: lr=0.01, batch_size=64 → 88.4%
```

### Code

```python
import torch
import torch.nn as nn
from itertools import product

# Define the search space
param_grid = {
    "lr": [0.001, 0.01, 0.1],
    "batch_size": [32, 64, 128],
    "hidden_size": [64, 128, 256],
}

# Generate all combinations
keys = param_grid.keys()
values = param_grid.values()
combinations = [dict(zip(keys, v)) for v in product(*values)]

print(f"Total combinations: {len(combinations)}")
# Total combinations: 27

best_acc = 0
best_params = None

for params in combinations:
    # Build model with these hyperparameters
    model = nn.Sequential(
        nn.Linear(784, params["hidden_size"]),
        nn.ReLU(),
        nn.Linear(params["hidden_size"], 10),
    )

    optimizer = torch.optim.Adam(model.parameters(), lr=params["lr"])

    # Train and evaluate (simplified)
    acc = train_and_evaluate(model, optimizer, params["batch_size"])

    if acc > best_acc:
        best_acc = acc
        best_params = params

print(f"Best params: {best_params}")
print(f"Best accuracy: {best_acc:.2f}%")
```

### Pros and Cons

| Pros | Cons |
|------|------|
| Simple to implement | Exponentially expensive |
| Guaranteed to find best in grid | Wastes time on unimportant combos |
| Easy to parallelize | 3 params × 5 values = 125 trials! |

> **The curse of dimensionality:** With $k$ hyperparameters and $n$ values each, grid search needs $n^k$ trials. 5 hyperparameters × 5 values = **3,125 trials!**

---

## Random Search

Instead of trying every combination, **sample randomly** from the search space.

### Why Random Is Better Than Grid

This is counterintuitive, but random search is often more efficient:

```
Grid Search (9 trials):          Random Search (9 trials):

  ●     ●     ●                    ●        ●
                                        ●
  ●     ●     ●                  ●          ●
                                     ●
  ●     ●     ●                       ●    ●
                                              ●

With grid, if param A doesn't           With random, each trial
matter, you only test 3 unique          explores a unique value
values of param B.                      of BOTH parameters.
```

The key insight from Bergstra & Bengio (2012):

> If some hyperparameters matter more than others (which is almost always true), random search explores more values of the important ones.

### Code

```python
import random

# Define search ranges
search_space = {
    "lr": (1e-5, 1e-1, "log"),       # log-uniform
    "batch_size": [16, 32, 64, 128],  # categorical
    "hidden_size": (32, 512, "int"),  # uniform integer
    "dropout": (0.0, 0.5, "float"),   # uniform float
}

def sample_params(space):
    """Sample one random configuration."""
    params = {}
    for name, config in space.items():
        if isinstance(config, list):
            params[name] = random.choice(config)
        elif config[2] == "log":
            import math
            log_low = math.log10(config[0])
            log_high = math.log10(config[1])
            params[name] = 10 ** random.uniform(log_low, log_high)
        elif config[2] == "int":
            params[name] = random.randint(config[0], config[1])
        elif config[2] == "float":
            params[name] = random.uniform(config[0], config[1])
    return params

# Run random search
n_trials = 20  # much fewer than grid search!
best_acc = 0
best_params = None

for i in range(n_trials):
    params = sample_params(search_space)
    print(f"Trial {i+1}: {params}")

    model = build_model(params)
    acc = train_and_evaluate(model, params)

    if acc > best_acc:
        best_acc = acc
        best_params = params

print(f"\nBest after {n_trials} trials:")
print(f"  Params: {best_params}")
print(f"  Accuracy: {best_acc:.2f}%")
```

### Log-Uniform Sampling

For learning rates, **always use log-uniform** sampling:

```
Linear uniform:   [0.001 ──────────────────────── 0.1]
                   Most samples clustered near 0.1
                   Barely any near 0.001

Log-uniform:      [0.001 ── 0.003 ── 0.01 ── 0.03 ── 0.1]
                   Equal density at every scale
                   This is what you want!
```

$$\text{lr} = 10^{\text{Uniform}(\log_{10}(10^{-5}),\; \log_{10}(10^{-1}))}$$

---

## Bayesian Optimization

Grid and random search are "blind" — each trial ignores the results of previous trials. **Bayesian optimization** is smarter: it uses past results to decide where to search next.

### The Idea

```
Step 1: Try a few random points
        ●         ●              ●

Step 2: Build a model of "accuracy as a function of hyperparameters"
        ●─────────●──────────────●
        (surrogate model)

Step 3: Pick next point where the model predicts improvement
        ●─────────●──────●───────●
                         ↑
                    (try here next — high uncertainty, potentially good)

Step 4: Repeat from Step 2 with the new result
```

### Key Concepts

| Concept | Meaning |
|---------|---------|
| **Surrogate model** | Approximation of the true objective function |
| **Acquisition function** | Decides which point to try next |
| **Exploration** | Try uncertain regions (might find something great) |
| **Exploitation** | Try near known good regions (refine the best) |

### Optuna

**Optuna** is the most popular Bayesian optimization library for deep learning:

```python
import optuna
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

def objective(trial):
    """Optuna calls this function for each trial."""

    # Suggest hyperparameters
    lr = trial.suggest_float("lr", 1e-5, 1e-1, log=True)
    batch_size = trial.suggest_categorical("batch_size", [32, 64, 128])
    hidden_size = trial.suggest_int("hidden_size", 32, 512)
    n_layers = trial.suggest_int("n_layers", 1, 4)
    dropout = trial.suggest_float("dropout", 0.0, 0.5)

    # Build model dynamically
    layers = []
    in_size = 784
    for i in range(n_layers):
        layers.append(nn.Linear(in_size, hidden_size))
        layers.append(nn.ReLU())
        layers.append(nn.Dropout(dropout))
        in_size = hidden_size
    layers.append(nn.Linear(hidden_size, 10))
    model = nn.Sequential(*layers)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()

    # Create data loader
    loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # Train for a few epochs
    model.train()
    for epoch in range(10):
        for X_batch, y_batch in loader:
            optimizer.zero_grad()
            loss = criterion(model(X_batch), y_batch)
            loss.backward()
            optimizer.step()

        # Report intermediate value for pruning
        val_acc = evaluate(model, val_dataset)
        trial.report(val_acc, epoch)

        # Prune unpromising trials early
        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()

    return val_acc

# Create study and optimize
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)

# Results
print(f"Best trial:")
print(f"  Value (accuracy): {study.best_trial.value:.4f}")
print(f"  Params: {study.best_trial.params}")
```

### Ray Tune (Brief)

For **distributed** hyperparameter tuning across multiple GPUs/machines:

```python
from ray import tune
from ray.tune.schedulers import ASHAScheduler

config = {
    "lr": tune.loguniform(1e-5, 1e-1),
    "batch_size": tune.choice([32, 64, 128]),
    "hidden_size": tune.randint(32, 512),
}

# ASHA scheduler: early stopping for bad trials
scheduler = ASHAScheduler(max_t=100, grace_period=10)

result = tune.run(
    train_fn,
    config=config,
    num_samples=50,
    scheduler=scheduler,
    resources_per_trial={"cpu": 2, "gpu": 0.5},
)
```

---

## Learning Rate Finder

Before running a full search, you can **quickly find a good learning rate range** with the LR finder technique (Smith, 2017):

### How It Works

1. Start with a very small learning rate ($10^{-7}$)
2. Gradually increase it each batch (exponentially)
3. Record the loss at each step
4. Plot loss vs learning rate
5. Pick the LR where loss decreases fastest

```
Loss
  ▲
  │ ────────╲
  │          ╲
  │           ╲
  │            ╲        ← steepest descent: good LR range
  │             ╲
  │              ╲╱
  │               ╱
  │              ╱      ← loss starts increasing: too high
  │             ╱
  │            ╱
  └──────────────────────────→ Learning Rate (log scale)
   10⁻⁷      10⁻⁴   10⁻² 10⁻¹
              ↑         ↑
          good start   upper bound
```

### Code

```python
import torch
import torch.nn as nn
import math

def find_lr(model, train_loader, optimizer, criterion,
            start_lr=1e-7, end_lr=1e-1, num_steps=100):
    """Find optimal learning rate using the LR range test."""

    # Save initial state
    initial_state = model.state_dict()
    initial_opt_state = optimizer.state_dict()

    # Set starting LR
    for param_group in optimizer.param_groups:
        param_group["lr"] = start_lr

    # Compute multiplication factor
    factor = (end_lr / start_lr) ** (1 / num_steps)

    lrs = []
    losses = []
    best_loss = float("inf")

    model.train()
    data_iter = iter(train_loader)

    for step in range(num_steps):
        # Get batch (cycle through data if needed)
        try:
            X_batch, y_batch = next(data_iter)
        except StopIteration:
            data_iter = iter(train_loader)
            X_batch, y_batch = next(data_iter)

        # Forward pass
        optimizer.zero_grad()
        output = model(X_batch)
        loss = criterion(output, y_batch)

        # Record
        current_lr = optimizer.param_groups[0]["lr"]
        lrs.append(current_lr)
        losses.append(loss.item())

        # Stop if loss exploded
        if loss.item() > best_loss * 10:
            break
        best_loss = min(best_loss, loss.item())

        # Backward pass
        loss.backward()
        optimizer.step()

        # Increase learning rate
        for param_group in optimizer.param_groups:
            param_group["lr"] *= factor

    # Restore initial state
    model.load_state_dict(initial_state)
    optimizer.load_state_dict(initial_opt_state)

    return lrs, losses

# Usage
model = nn.Sequential(
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)
optimizer = torch.optim.SGD(model.parameters(), lr=1e-7)
criterion = nn.CrossEntropyLoss()

lrs, losses = find_lr(model, train_loader, optimizer, criterion)

# Find the LR with steepest loss decrease
# A good rule: pick the LR about 10x smaller than the minimum loss point
import numpy as np
min_loss_idx = np.argmin(losses)
suggested_lr = lrs[min_loss_idx] / 10
print(f"Suggested learning rate: {suggested_lr:.6f}")
```

---

## Best Practices

### 1. Start Simple, Then Tune

```
Step 1: Use defaults                    Adam, lr=0.001, batch_size=32
        ↓
Step 2: Get a baseline                  "My model gets 80%"
        ↓
Step 3: Tune the most important HP      Learning rate → 85%
        ↓
Step 4: Tune the next most important    Architecture → 88%
        ↓
Step 5: Fine-tune remaining HPs         Dropout, weight decay → 90%
```

### 2. Priority Order

Tune hyperparameters in this order (most to least impactful):

```
┌──────────────────────────────────────────────┐
│  1. Learning rate           ★★★★★           │
│  2. Architecture (layers/hidden size)  ★★★★  │
│  3. Batch size              ★★★              │
│  4. Regularization          ★★★              │
│  5. Optimizer choice        ★★               │
│  6. Weight decay            ★★               │
│  7. Learning rate schedule  ★                │
└──────────────────────────────────────────────┘
```

### 3. Tune One at a Time (When Starting)

```python
# Start with a reasonable baseline
baseline = {
    "lr": 0.001,
    "hidden_size": 128,
    "batch_size": 64,
    "dropout": 0.2,
}

# Tune learning rate first (keep everything else fixed)
for lr in [0.0001, 0.0003, 0.001, 0.003, 0.01]:
    params = {**baseline, "lr": lr}
    result = train_and_evaluate(params)
    print(f"lr={lr}: {result:.2f}%")
# Pick best LR, update baseline

# Then tune hidden size (keep best LR, fix everything else)
# Then tune batch size...
# ...and so on
```

### 4. Use Appropriate Scales

```python
# WRONG: linear scale for learning rate
lr = random.uniform(0.0001, 0.1)
# → 99% of samples will be between 0.01 and 0.1

# RIGHT: log scale for learning rate
lr = 10 ** random.uniform(-4, -1)
# → equal density across 0.0001, 0.001, 0.01, 0.1
```

| Hyperparameter | Scale |
|---------------|-------|
| Learning rate | Log |
| Weight decay | Log |
| Batch size | Powers of 2 (or categorical) |
| Hidden size | Powers of 2 (or uniform int) |
| Dropout | Linear (0 to 0.5) |
| Number of layers | Small integers (1 to 5) |

### 5. Use Early Stopping

Don't train every configuration for the full number of epochs:

```python
# With Optuna pruning
def objective(trial):
    # ... build model ...

    for epoch in range(100):
        train_one_epoch(model, optimizer, train_loader)
        val_acc = evaluate(model, val_loader)

        # Report and check if we should stop
        trial.report(val_acc, epoch)
        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()
            # This trial is clearly bad → skip remaining epochs

    return val_acc
```

---

## Full Example: Hyperparameter Search with Optuna

Let's put it all together with a complete, runnable example:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split
import optuna
from optuna.trial import TrialState

# ─── 1. Prepare Data ──────────────────────────────────────────
# Simulate a dataset (replace with your real data)
torch.manual_seed(42)
X = torch.randn(5000, 20)  # 5000 samples, 20 features
y = (X[:, 0] + X[:, 1] * 2 - X[:, 2] > 0).long()  # binary label

dataset = TensorDataset(X, y)
train_set, val_set = random_split(dataset, [4000, 1000])


# ─── 2. Define the Objective ──────────────────────────────────
def objective(trial):
    """Objective function for Optuna."""

    # --- Suggest hyperparameters ---
    lr = trial.suggest_float("lr", 1e-5, 1e-1, log=True)
    batch_size = trial.suggest_categorical("batch_size", [32, 64, 128, 256])
    n_layers = trial.suggest_int("n_layers", 1, 4)
    hidden_size = trial.suggest_int("hidden_size", 16, 256, step=16)
    dropout = trial.suggest_float("dropout", 0.0, 0.5, step=0.1)
    weight_decay = trial.suggest_float("weight_decay", 1e-6, 1e-2, log=True)

    # --- Build model ---
    layers = []
    in_features = 20
    for i in range(n_layers):
        layers.append(nn.Linear(in_features, hidden_size))
        layers.append(nn.ReLU())
        layers.append(nn.Dropout(dropout))
        in_features = hidden_size
    layers.append(nn.Linear(hidden_size, 2))
    model = nn.Sequential(*layers)

    # --- Optimizer ---
    optimizer = torch.optim.Adam(
        model.parameters(), lr=lr, weight_decay=weight_decay
    )
    criterion = nn.CrossEntropyLoss()

    # --- Data loaders ---
    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=256)

    # --- Training loop ---
    n_epochs = 30
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            output = model(X_batch)
            loss = criterion(output, y_batch)
            loss.backward()
            optimizer.step()

        # --- Validation ---
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for X_batch, y_batch in val_loader:
                preds = model(X_batch).argmax(dim=1)
                correct += (preds == y_batch).sum().item()
                total += y_batch.size(0)

        val_acc = correct / total

        # Report for pruning
        trial.report(val_acc, epoch)
        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()

    return val_acc


# ─── 3. Run the Study ─────────────────────────────────────────
study = optuna.create_study(
    direction="maximize",
    pruner=optuna.pruners.MedianPruner(n_warmup_steps=5),
)
study.optimize(objective, n_trials=50, show_progress_bar=True)


# ─── 4. Print Results ─────────────────────────────────────────
print("\n" + "=" * 50)
print("HYPERPARAMETER TUNING RESULTS")
print("=" * 50)

# Summary
pruned = len([t for t in study.trials if t.state == TrialState.PRUNED])
complete = len([t for t in study.trials if t.state == TrialState.COMPLETE])
print(f"Trials completed: {complete}")
print(f"Trials pruned:    {pruned}")

# Best trial
best = study.best_trial
print(f"\nBest accuracy: {best.value:.4f}")
print("Best hyperparameters:")
for key, value in best.params.items():
    print(f"  {key}: {value}")


# ─── 5. Visualize (optional) ──────────────────────────────────
# Optuna has built-in visualization
# import optuna.visualization as vis
# vis.plot_optimization_history(study)
# vis.plot_param_importances(study)
# vis.plot_slice(study)
```

**Sample output:**

```
[I 2024-01-15 10:23:45] Trial 0 finished with value: 0.8920
[I 2024-01-15 10:23:48] Trial 1 pruned.
[I 2024-01-15 10:23:52] Trial 2 finished with value: 0.9130
...
[I 2024-01-15 10:28:15] Trial 49 finished with value: 0.9340

==================================================
HYPERPARAMETER TUNING RESULTS
==================================================
Trials completed: 38
Trials pruned:    12

Best accuracy: 0.9520
Best hyperparameters:
  lr: 0.003421
  batch_size: 64
  n_layers: 2
  hidden_size: 128
  dropout: 0.1
  weight_decay: 0.000142
```

---

## Summary

| Method | Trials Needed | Smart? | Best For |
|--------|--------------|--------|----------|
| **Grid search** | $n^k$ (exponential) | No | Few hyperparameters (≤ 2-3) |
| **Random search** | 20-100 | No | Quick exploration |
| **Bayesian (Optuna)** | 20-50 | Yes | Best results with fewer trials |

### Quick Reference

```
┌─────────────────────────────────────────────────┐
│           Hyperparameter Tuning Checklist        │
│                                                  │
│  1. Start with defaults (Adam, lr=0.001)         │
│  2. Run LR finder to pick a range                │
│  3. Tune LR first (most important)               │
│  4. Tune architecture next                       │
│  5. Use Optuna for automated search              │
│  6. Enable pruning to save time                  │
│  7. Always use a validation set (not test!)       │
│  8. Log everything — you'll thank yourself       │
└─────────────────────────────────────────────────┘
```

In the next lesson, you'll learn **transfer learning** — how to reuse models trained on large datasets to solve your own problems with much less data.
