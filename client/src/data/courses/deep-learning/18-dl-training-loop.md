---
title: The Training Loop
---

# The Training Loop

Everything in deep learning comes together in the **training loop**. It's the engine that takes your model from random weights to a trained predictor. Every deep learning project — image classifiers, language models, recommender systems — runs the same core loop.

In this lesson, you'll build a complete training pipeline from scratch, including validation, metric tracking, checkpointing, and progress bars.

---

## The Seven Steps

Every training loop repeats these seven steps for each batch:

```
┌─────────────────────────────────────────────────────┐
│                   FOR EACH EPOCH                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              FOR EACH BATCH                    │  │
│  │                                                │  │
│  │  1. model.train()          ← set train mode    │  │
│  │  2. output = model(X)      ← forward pass      │  │
│  │  3. loss = criterion(output, y)  ← compute loss│  │
│  │  4. optimizer.zero_grad()  ← clear old grads   │  │
│  │  5. loss.backward()        ← backward pass      │  │
│  │  6. optimizer.step()       ← update weights     │  │
│  │                                                │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Validate → log metrics → save checkpoint            │
└─────────────────────────────────────────────────────┘
```

### Why This Order?

| Step | What Happens | Why |
|------|-------------|-----|
| `model.train()` | Enables dropout, batch norm training mode | Some layers behave differently during training |
| Forward pass | Input flows through the network | Computes predictions |
| Compute loss | Compares predictions to targets | Gives us a number to minimize |
| `zero_grad()` | Clears gradients from previous step | PyTorch **accumulates** gradients by default |
| `backward()` | Computes gradients via backpropagation | Tells each weight how to change |
| `optimizer.step()` | Updates weights using gradients | Actually improves the model |

> **Common mistake:** Forgetting `zero_grad()`. Without it, gradients accumulate across batches and your model won't train properly!

---

## A Minimal Training Loop

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Simple dataset
X = torch.randn(1000, 10)
y = (X.sum(dim=1) > 0).long()  # binary classification

dataset = TensorDataset(X, y)
loader = DataLoader(dataset, batch_size=32, shuffle=True)

# Model
model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 2),
)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
model.train()
for epoch in range(10):
    total_loss = 0
    for X_batch, y_batch in loader:
        # Forward pass
        output = model(X_batch)
        loss = criterion(output, y_batch)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(loader)
    print(f"Epoch {epoch+1:2d} | Loss: {avg_loss:.4f}")
```

---

## The Validation Loop

After each training epoch, evaluate on the validation set to check for overfitting. The key difference: **no gradient computation**.

```python
model.eval()  # set evaluation mode (disables dropout, uses running BN stats)

val_loss = 0
correct = 0
total = 0

with torch.no_grad():  # disable gradient tracking → saves memory + speed
    for X_batch, y_batch in val_loader:
        output = model(X_batch)
        loss = criterion(output, y_batch)
        val_loss += loss.item()

        preds = output.argmax(dim=1)
        correct += (preds == y_batch).sum().item()
        total += y_batch.size(0)

avg_val_loss = val_loss / len(val_loader)
val_accuracy = correct / total
```

### train() vs. eval()

| Method | Dropout | BatchNorm | Gradient |
|--------|---------|-----------|----------|
| `model.train()` | Active (random zeroing) | Uses batch statistics | Computed |
| `model.eval()` | Disabled (all neurons active) | Uses running statistics | Computed (unless `torch.no_grad()`) |

> **Note:** `model.eval()` does NOT disable gradients. You need `torch.no_grad()` for that.

### torch.no_grad() Benefits

```
With gradients (training):          Without gradients (validation):
┌──────────────┐                   ┌──────────────┐
│ Forward pass  │                   │ Forward pass  │
│ + save tensors│  ← for backward  │ (no saving)   │  ← less memory
│ + track graph │                   │ (no graph)    │  ← faster
└──────────────┘                   └──────────────┘
Memory: ~2× model size              Memory: ~1× model size
```

---

## Tracking Metrics

Store loss and accuracy per epoch to visualize training progress:

```python
history = {
    "train_loss": [],
    "val_loss": [],
    "train_acc": [],
    "val_acc": [],
}

for epoch in range(num_epochs):
    # ── Training ──
    model.train()
    train_loss = 0
    train_correct = 0
    train_total = 0

    for X_batch, y_batch in train_loader:
        output = model(X_batch)
        loss = criterion(output, y_batch)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        train_correct += (output.argmax(1) == y_batch).sum().item()
        train_total += y_batch.size(0)

    # ── Validation ──
    model.eval()
    val_loss = 0
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for X_batch, y_batch in val_loader:
            output = model(X_batch)
            loss = criterion(output, y_batch)

            val_loss += loss.item()
            val_correct += (output.argmax(1) == y_batch).sum().item()
            val_total += y_batch.size(0)

    # ── Record metrics ──
    history["train_loss"].append(train_loss / len(train_loader))
    history["val_loss"].append(val_loss / len(val_loader))
    history["train_acc"].append(train_correct / train_total)
    history["val_acc"].append(val_correct / val_total)

    print(
        f"Epoch {epoch+1:3d} | "
        f"Train Loss: {history['train_loss'][-1]:.4f} | "
        f"Val Loss: {history['val_loss'][-1]:.4f} | "
        f"Val Acc: {history['val_acc'][-1]:.4f}"
    )
```

### Reading the Training Curves

```
Loss                                    Accuracy
 ▲                                       ▲
 │ ···                                   │                    ·········
 │    ···                                │               ····
 │       ··· val_loss                    │          ····  val_acc
 │          ········                     │     ····
 │ ···                                   │ ····
 │    ···                                │
 │       ···                             │                    ·········
 │          ··· train_loss               │               ····  train_acc
 │             ···········               │          ····
 └──────────────────────→ Epoch          └──────────────────────→ Epoch
   Healthy: both going down ✓             Healthy: both going up ✓
```

---

## Saving and Loading Checkpoints

Don't lose hours of training to a crash! Save checkpoints regularly.

### Save a Checkpoint

```python
# Save everything needed to resume training
checkpoint = {
    "epoch": epoch,
    "model_state_dict": model.state_dict(),
    "optimizer_state_dict": optimizer.state_dict(),
    "train_loss": history["train_loss"],
    "val_loss": history["val_loss"],
}
torch.save(checkpoint, "checkpoint.pt")
print(f"Checkpoint saved at epoch {epoch+1}")
```

### Load a Checkpoint

```python
checkpoint = torch.load("checkpoint.pt")

model.load_state_dict(checkpoint["model_state_dict"])
optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
start_epoch = checkpoint["epoch"] + 1

print(f"Resumed from epoch {start_epoch}")
```

### Save Only the Best Model

```python
best_val_loss = float("inf")

for epoch in range(num_epochs):
    # ... training and validation ...

    val_loss = history["val_loss"][-1]
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), "best_model.pt")
        print(f"  ✓ New best model saved (val_loss={val_loss:.4f})")
```

### What to Save

| Save This | When |
|-----------|------|
| `model.state_dict()` | For inference only (smallest file) |
| model + optimizer state dicts | To resume training |
| Full checkpoint (above) | To resume training + reproduce results |

---

## Progress Bars with tqdm

The `tqdm` library adds progress bars to your training loop:

```python
from tqdm import tqdm

for epoch in range(num_epochs):
    model.train()
    total_loss = 0

    # Wrap the DataLoader with tqdm
    pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}")

    for X_batch, y_batch in pbar:
        output = model(X_batch)
        loss = criterion(output, y_batch)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        # Update progress bar with current loss
        pbar.set_postfix({"loss": f"{loss.item():.4f}"})
```

### What It Looks Like

```
Epoch 1/30: 100%|██████████| 250/250 [00:12<00:00, 20.1 batch/s, loss=0.3421]
Epoch 2/30:  45%|████▌     | 112/250 [00:05<00:07, 19.8 batch/s, loss=0.2156]
```

---

## GPU Training

Move your model and data to the GPU for massive speedups:

```python
# Check for GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Move model to GPU
model = model.to(device)

# In the training loop, move each batch to GPU
for X_batch, y_batch in train_loader:
    X_batch = X_batch.to(device)
    y_batch = y_batch.to(device)

    output = model(X_batch)
    loss = criterion(output, y_batch)
    # ... rest of loop
```

> **Tip:** Use `pin_memory=True` in the DataLoader for faster CPU → GPU transfers when using CUDA.

---

## Code: Complete Training Pipeline

Here's a production-ready training pipeline that brings everything together:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, random_split

# ── Configuration ────────────────────────────────────
BATCH_SIZE = 64
LEARNING_RATE = 0.001
NUM_EPOCHS = 30
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Generate synthetic data ─────────────────────────
torch.manual_seed(42)
n_samples = 3000
n_features = 20
n_classes = 4

X = torch.randn(n_samples, n_features)
W = torch.randn(n_features, n_classes)
y = (X @ W + 0.3 * torch.randn(n_samples, n_classes)).argmax(dim=1)

# Split: 70% train, 15% val, 15% test
dataset = TensorDataset(X, y)
train_set, val_set, test_set = random_split(
    dataset, [2100, 450, 450],
    generator=torch.Generator().manual_seed(42)
)

train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_set, batch_size=BATCH_SIZE)
test_loader = DataLoader(test_set, batch_size=BATCH_SIZE)

print(f"Train: {len(train_set)}, Val: {len(val_set)}, Test: {len(test_set)}")
print(f"Device: {DEVICE}")


# ── Model ────────────────────────────────────────────
class Classifier(nn.Module):
    def __init__(self, in_features, hidden, num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.BatchNorm1d(hidden),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden, hidden // 2),
            nn.BatchNorm1d(hidden // 2),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden // 2, num_classes),
        )

    def forward(self, x):
        return self.net(x)


model = Classifier(n_features, 128, n_classes).to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)


# ── Training function ───────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for X_batch, y_batch in loader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)

        # Forward
        output = model(X_batch)
        loss = criterion(output, y_batch)

        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Track metrics
        total_loss += loss.item() * y_batch.size(0)
        correct += (output.argmax(1) == y_batch).sum().item()
        total += y_batch.size(0)

    return total_loss / total, correct / total


# ── Validation function ─────────────────────────────
@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    correct = 0
    total = 0

    for X_batch, y_batch in loader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)

        output = model(X_batch)
        loss = criterion(output, y_batch)

        total_loss += loss.item() * y_batch.size(0)
        correct += (output.argmax(1) == y_batch).sum().item()
        total += y_batch.size(0)

    return total_loss / total, correct / total


# ── Training loop ────────────────────────────────────
history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}
best_val_loss = float("inf")

print(f"\n{'Epoch':>5} | {'Train Loss':>10} | {'Val Loss':>10} | "
      f"{'Train Acc':>10} | {'Val Acc':>10}")
print("-" * 60)

for epoch in range(NUM_EPOCHS):
    train_loss, train_acc = train_one_epoch(
        model, train_loader, criterion, optimizer, DEVICE
    )
    val_loss, val_acc = evaluate(model, val_loader, criterion, DEVICE)

    history["train_loss"].append(train_loss)
    history["val_loss"].append(val_loss)
    history["train_acc"].append(train_acc)
    history["val_acc"].append(val_acc)

    # Save best model
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), "best_model.pt")
        marker = " ← best"
    else:
        marker = ""

    if (epoch + 1) % 5 == 0 or epoch == 0:
        print(
            f"{epoch+1:5d} | {train_loss:10.4f} | {val_loss:10.4f} | "
            f"{train_acc:10.4f} | {val_acc:10.4f}{marker}"
        )


# ── Final test evaluation ───────────────────────────
print("\n=== Final Test Evaluation ===")

# Load best model
model.load_state_dict(torch.load("best_model.pt"))
test_loss, test_acc = evaluate(model, test_loader, criterion, DEVICE)
print(f"Test Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# Class-wise accuracy
model.eval()
class_correct = [0] * n_classes
class_total = [0] * n_classes

with torch.no_grad():
    for X_batch, y_batch in test_loader:
        X_batch, y_batch = X_batch.to(DEVICE), y_batch.to(DEVICE)
        preds = model(X_batch).argmax(1)
        for pred, label in zip(preds, y_batch):
            class_total[label] += 1
            if pred == label:
                class_correct[label] += 1

print("\nPer-class accuracy:")
for i in range(n_classes):
    if class_total[i] > 0:
        acc = class_correct[i] / class_total[i]
        print(f"  Class {i}: {acc:.4f} ({class_correct[i]}/{class_total[i]})")
```

### Expected Output

```
Train: 2100, Val: 450, Test: 450
Device: cpu

Epoch | Train Loss |   Val Loss |  Train Acc |    Val Acc
------------------------------------------------------------
    1 |     1.3245 |     1.1832 |     0.3810 |     0.4667
    5 |     0.7521 |     0.7103 |     0.6762 |     0.6889 ← best
   10 |     0.4836 |     0.5421 |     0.7971 |     0.7689
   15 |     0.3142 |     0.4890 |     0.8710 |     0.7911 ← best
   20 |     0.2156 |     0.4812 |     0.9181 |     0.8044
   25 |     0.1534 |     0.5023 |     0.9452 |     0.8022
   30 |     0.1087 |     0.5198 |     0.9619 |     0.7978

=== Final Test Evaluation ===
Test Loss: 0.4756
Test Accuracy: 0.8089

Per-class accuracy:
  Class 0: 0.8182 (90/110)
  Class 1: 0.7857 (88/112)
  Class 2: 0.8261 (95/115)
  Class 3: 0.8053 (91/113)
```

---

## Common Mistakes Checklist

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgot `model.train()` | Dropout/BN in eval mode | Add `model.train()` before training loop |
| Forgot `model.eval()` | Inconsistent predictions | Add `model.eval()` before validation |
| Forgot `zero_grad()` | Loss doesn't decrease properly | Call `optimizer.zero_grad()` each batch |
| Forgot `torch.no_grad()` | Validation uses too much memory | Wrap validation in `with torch.no_grad()` |
| Wrong order of backward/step | Weights don't update | Order: zero_grad → backward → step |
| Not moving data to GPU | RuntimeError: tensors on different devices | Move batches with `.to(device)` |
| Evaluating on training data | Falsely high accuracy | Always evaluate on a separate val/test set |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **Training loop** | Forward → loss → zero_grad → backward → step |
| **Validation loop** | `model.eval()` + `torch.no_grad()` |
| **Metrics tracking** | Store loss and accuracy per epoch in a dict |
| **Checkpoints** | `torch.save()` / `torch.load()` for model + optimizer |
| **Best model** | Save when validation loss improves |
| **tqdm** | Progress bars for visual feedback |
| **GPU** | `.to(device)` for model and each batch |

In the next lesson, you'll learn how to properly **evaluate** your model with classification and regression metrics.
