---
title: Experiment Tracking
---

# Experiment Tracking

Training a model once is easy. Training it 100 times with different hyperparameters and remembering what worked? That's where **experiment tracking** comes in.

---

## Why Track Experiments?

Without tracking, you'll face:

| Problem | What Happens |
|---------|--------------|
| "Which run was the best?" | Can't remember which hyperparameters gave the best result |
| "What did I change?" | Lost track of what was different between runs |
| "Can I reproduce this?" | Can't recreate a result from 2 weeks ago |
| "How does it compare?" | No easy way to compare 50 experiments |
| "What should I try next?" | No organized view of what's been tried |

Experiment tracking solves all of these by logging everything automatically.

---

## What to Track

| Category | Examples |
|----------|----------|
| **Hyperparameters** | LR, batch size, optimizer, architecture |
| **Metrics** | Loss, accuracy, F1, per-epoch and final |
| **Code version** | Git commit hash, branch |
| **Data version** | Dataset name, split, preprocessing |
| **Environment** | GPU type, PyTorch version, CUDA version |
| **Model artifacts** | Checkpoints, ONNX exports |
| **Training curves** | Loss/metric plots over time |
| **Samples** | Predictions, confusion matrices |

---

## TensorBoard

The most common tool for visualizing training. Built into PyTorch.

### Setup

```python
from torch.utils.tensorboard import SummaryWriter

# Create a writer — logs go to the specified directory
writer = SummaryWriter("runs/experiment_001")

# Log a scalar value
writer.add_scalar("Loss/train", loss_value, global_step)
writer.add_scalar("Loss/val", val_loss, global_step)
writer.add_scalar("Accuracy/train", train_acc, global_step)
writer.add_scalar("Accuracy/val", val_acc, global_step)

# Don't forget to close
writer.close()
```

### Launch TensorBoard

```bash
tensorboard --logdir=runs/
# Open http://localhost:6006 in your browser
```

### Complete TensorBoard Example

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from torchvision import datasets, transforms
from datetime import datetime

# Create unique run name
run_name = f"resnet_lr0.001_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
writer = SummaryWriter(f"runs/{run_name}")

# Setup model, data, etc.
model = SimpleResNet().cuda()
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
train_loader = DataLoader(datasets.MNIST("./data", train=True, download=True, transform=transform), batch_size=64, shuffle=True)
val_loader = DataLoader(datasets.MNIST("./data", train=False, transform=transform), batch_size=256)

# Log model graph
writer.add_graph(model, torch.randn(1, 1, 28, 28).cuda())

# Training loop
for epoch in range(20):
    # Train
    model.train()
    train_loss, correct, total = 0, 0, 0
    for data, target in train_loader:
        data, target = data.cuda(), target.cuda()
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()
        correct += (output.argmax(1) == target).sum().item()
        total += target.size(0)

    # Validate
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for data, target in val_loader:
            data, target = data.cuda(), target.cuda()
            output = model(data)
            val_correct += (output.argmax(1) == target).sum().item()
            val_total += target.size(0)

    # Log everything
    writer.add_scalar("Loss/train", train_loss / len(train_loader), epoch)
    writer.add_scalar("Accuracy/train", 100 * correct / total, epoch)
    writer.add_scalar("Accuracy/val", 100 * val_correct / val_total, epoch)
    writer.add_scalar("LR", optimizer.param_groups[0]["lr"], epoch)

    # Log weight histograms every 5 epochs
    if epoch % 5 == 0:
        for name, param in model.named_parameters():
            writer.add_histogram(f"weights/{name}", param.data, epoch)

writer.close()
```

### Logging Images

```python
# Log sample predictions as image grid
import torchvision.utils as vutils

def log_predictions(model, loader, writer, epoch, num_images=16):
    model.eval()
    data, target = next(iter(loader))
    data = data[:num_images].cuda()
    with torch.no_grad():
        pred = model(data).argmax(1)
    grid = vutils.make_grid(data.cpu(), nrow=4, normalize=True)
    writer.add_image("predictions", grid, epoch)
```

---

## Weights & Biases (W&B)

A more powerful cloud-based tracking tool with automatic dashboards.

### Setup

```bash
pip install wandb
wandb login  # One-time authentication
```

### Complete W&B Integration

```python
import wandb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

def train_with_wandb():
    run = wandb.init(
        project="deep-learning-course",
        config={
            "learning_rate": 0.001,
            "batch_size": 64,
            "epochs": 20,
            "model": "SimpleResNet",
            "optimizer": "Adam",
        }
    )
    config = wandb.config

    model = SimpleResNet().cuda()
    optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)
    criterion = nn.CrossEntropyLoss()

    # Watch model — automatically logs gradients and weights
    wandb.watch(model, criterion, log="all", log_freq=100)

    transform = transforms.Compose([transforms.ToTensor()])
    train_dataset = datasets.MNIST("./data", train=True, download=True, transform=transform)
    val_dataset = datasets.MNIST("./data", train=False, transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=256)

    # Training loop
    best_val_acc = 0
    for epoch in range(config.epochs):
        model.train()
        train_loss, train_correct, train_total = 0, 0, 0
        for data, target in train_loader:
            data, target = data.cuda(), target.cuda()
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            train_correct += (output.argmax(1) == target).sum().item()
            train_total += target.size(0)

        # Validate
        model.eval()
        val_correct, val_total = 0, 0
        with torch.no_grad():
            for data, target in val_loader:
                data, target = data.cuda(), target.cuda()
                output = model(data)
                val_correct += (output.argmax(1) == target).sum().item()
                val_total += target.size(0)

        train_acc = 100 * train_correct / train_total
        val_acc = 100 * val_correct / val_total

        # Log metrics — appears in W&B dashboard automatically
        wandb.log({
            "epoch": epoch,
            "train/loss": train_loss / len(train_loader),
            "train/accuracy": train_acc,
            "val/accuracy": val_acc,
        })

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "best_model.pth")
            artifact = wandb.Artifact("best-model", type="model")
            artifact.add_file("best_model.pth")
            run.log_artifact(artifact)

    wandb.summary["best_val_accuracy"] = best_val_acc
    wandb.finish()

train_with_wandb()
```

### W&B Sweeps (Hyperparameter Search)

```python
sweep_config = {
    "method": "bayes",  # bayesian optimization
    "metric": {"name": "val/accuracy", "goal": "maximize"},
    "parameters": {
        "learning_rate": {"min": 1e-5, "max": 1e-2, "distribution": "log_uniform_values"},
        "batch_size": {"values": [32, 64, 128, 256]},
        "optimizer": {"values": ["Adam", "SGD", "AdamW"]},
        "dropout": {"min": 0.0, "max": 0.5},
    },
}

sweep_id = wandb.sweep(sweep_config, project="mnist-sweep")

def sweep_train():
    wandb.init()
    config = wandb.config
    model = build_model(dropout=config.dropout)
    optimizer = get_optimizer(config.optimizer, model, config.learning_rate)
    # Train and log...
    train_with_wandb()

# Run sweep agent
wandb.agent(sweep_id, function=sweep_train, count=50)  # Run 50 trials
```

---

## MLflow

Open-source platform for the complete ML lifecycle.

### Basic Usage

```python
import mlflow
import mlflow.pytorch

# Set experiment name
mlflow.set_experiment("mnist-classification")

# Start a run
with mlflow.start_run(run_name="resnet-baseline"):
    # Log parameters
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("batch_size", 64)
    mlflow.log_param("model", "SimpleResNet")
    mlflow.log_param("optimizer", "Adam")
    mlflow.log_param("epochs", 20)

    # Training loop
    for epoch in range(20):
        train_loss, train_acc = train_epoch(...)
        val_loss, val_acc = validate(...)

        # Log metrics
        mlflow.log_metric("train_loss", train_loss, step=epoch)
        mlflow.log_metric("train_accuracy", train_acc, step=epoch)
        mlflow.log_metric("val_loss", val_loss, step=epoch)
        mlflow.log_metric("val_accuracy", val_acc, step=epoch)

    # Log model
    mlflow.pytorch.log_model(model, "model")

    # Log artifacts (plots, configs, etc.)
    mlflow.log_artifact("training_curve.png")
```

### Launch MLflow UI

```bash
mlflow ui --port 5000
# Open http://localhost:5000
```

---

## Comparison: TensorBoard vs W&B vs MLflow

| Feature | TensorBoard | W&B | MLflow |
|---------|-------------|-----|--------|
| **Cost** | Free | Free tier + paid | Free (open-source) |
| **Setup** | Built into PyTorch | pip install + login | pip install |
| **Storage** | Local files | Cloud | Local or remote |
| **Collaboration** | Manual sharing | Built-in teams | Server deployment |
| **Hyperparameter sweeps** | No | Yes (Bayesian) | No (use Optuna) |
| **Model registry** | No | Yes | Yes |
| **Artifact tracking** | No | Yes | Yes |
| **Auto-logging** | No | Some | Some |
| **Custom dashboards** | Limited | Yes | Limited |
| **Best for** | Quick visualization | Full experiment management | Production ML |

**Recommendation:**
- **Just starting**: TensorBoard (zero setup)
- **Research/teams**: W&B (best UX, automatic comparisons)
- **Production/enterprise**: MLflow (self-hosted, model registry)

---

## Hyperparameter Sweeps

| Strategy | Approach | Best For |
|----------|----------|----------|
| Grid Search | Try every combination | Few parameters, small ranges |
| Random Search | Sample randomly | Many parameters, faster |
| Bayesian (Optuna) | Use past results to guide search | Expensive experiments |

```python
# Bayesian optimization with Optuna
import optuna

def objective(trial):
    config = {
        "lr": trial.suggest_float("lr", 1e-5, 1e-1, log=True),
        "batch_size": trial.suggest_categorical("batch_size", [32, 64, 128]),
        "dropout": trial.suggest_float("dropout", 0.0, 0.7),
        "num_layers": trial.suggest_int("num_layers", 2, 6),
    }
    val_acc = run_experiment(**config)
    return val_acc

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)
print(f"Best: {study.best_trial.params} → {study.best_value:.4f}")
```

---

## Best Practices

### 1. Always Set Random Seeds

```python
import torch, numpy as np, random

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
```

### 2. Log Everything, Filter Later

```python
wandb.log({
    "train/loss": train_loss,
    "val/accuracy": val_acc,
    "training/gradient_norm": grad_norm,
    "training/learning_rate": lr,
    "training/epoch_time_seconds": epoch_time,
})
```

### 3. Version Your Data and Code

```python
import subprocess

def get_git_info():
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"]).strip().decode()
    branch = subprocess.check_output(["git", "branch", "--show-current"]).strip().decode()
    return {"commit": commit, "branch": branch}

wandb.config.update({"git": get_git_info()})
```

### 4. Save Checkpoints with Metadata

```python
def save_checkpoint(model, optimizer, epoch, metrics, path):
    torch.save({
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "epoch": epoch,
        "metrics": metrics,
        "pytorch_version": torch.__version__,
    }, path)
```

---

## Complete Experiment Tracking Setup

Combine TensorBoard + W&B in a simple wrapper:

```python
import torch
import wandb
from torch.utils.tensorboard import SummaryWriter
from datetime import datetime
import os

class ExperimentTracker:
    """Unified tracking — TensorBoard locally, W&B in the cloud."""

    def __init__(self, project, name, config, use_wandb=False):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_dir = f"runs/{name}_{timestamp}"
        os.makedirs(self.run_dir, exist_ok=True)
        self.writer = SummaryWriter(self.run_dir)
        self.use_wandb = use_wandb
        self.best_metric = float("-inf")
        if use_wandb:
            wandb.init(project=project, name=name, config=config)

    def log(self, metrics, step):
        for key, value in metrics.items():
            self.writer.add_scalar(key, value, step)
        if self.use_wandb:
            wandb.log(metrics, step=step)

    def log_model(self, model, metric_value):
        if metric_value > self.best_metric:
            self.best_metric = metric_value
            torch.save(model.state_dict(), f"{self.run_dir}/best_model.pth")

    def finish(self):
        self.writer.close()
        if self.use_wandb:
            wandb.finish()

# Usage
tracker = ExperimentTracker("my-project", "resnet-exp", config={"lr": 0.001})
for epoch in range(50):
    tracker.log({"train/loss": train_loss, "val/accuracy": val_acc}, step=epoch)
    tracker.log_model(model, val_acc)
tracker.finish()
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| TensorBoard | Built-in, free, great for visualization |
| W&B | Cloud-based, best for teams and sweeps |
| MLflow | Open-source, good for production |
| Random seeds | Essential for reproducibility |
| Sweep search | Bayesian > Random > Grid for efficiency |
| Log everything | Easier to filter than to re-run |
| Checkpoints | Save model + metadata together |

---

## Try It Yourself

1. Add TensorBoard logging to an existing training script
2. Create a W&B account and log your first experiment
3. Run a hyperparameter sweep with Optuna or W&B Sweeps
4. Compare 5 runs side-by-side in TensorBoard
5. Save and reload a checkpoint with full metadata

---

## Further Reading

- TensorBoard documentation (tensorflow.org/tensorboard)
- Weights & Biases documentation (docs.wandb.ai)
- MLflow documentation (mlflow.org)
- Optuna: A Hyperparameter Optimization Framework
- "How to Unit Test Machine Learning Code" (Jeremy Jordan)
