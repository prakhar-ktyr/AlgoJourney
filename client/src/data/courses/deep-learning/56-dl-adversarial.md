---
title: Adversarial Attacks & Robustness
---

# Adversarial Attacks & Robustness

Deep learning models can be fooled by tiny, imperceptible changes to their inputs. These **adversarial examples** expose critical vulnerabilities in neural networks.

---

## What Are Adversarial Examples?

An adversarial example is a carefully crafted input designed to cause a model to make a wrong prediction. The perturbation is so small that humans cannot notice it.

```
Original Image (Panda, 99.3% confidence)
    + tiny noise (imperceptible)
    = Adversarial Image (Gibbon, 99.7% confidence)
```

The model is highly confident in its *wrong* answer — that's what makes adversarial examples dangerous.

---

## Why Do They Matter?

Adversarial examples threaten safety-critical systems:

| Domain | Risk |
|--------|------|
| Self-driving cars | Stop sign misclassified as speed limit |
| Medical imaging | Tumor missed or false positive |
| Malware detection | Malicious code evades scanner |
| Face recognition | Unauthorized access granted |
| Spam filters | Phishing email bypasses filter |

If we deploy models in the real world, we **must** understand and defend against these attacks.

---

## Threat Models

Before discussing attacks, we define the attacker's knowledge:

| Threat Model | Attacker Knows | Example |
|--------------|----------------|---------|
| **White-box** | Model architecture, weights, gradients | Research setting |
| **Black-box** | Only model outputs (labels or scores) | Attacking an API |
| **Gray-box** | Partial knowledge (architecture but not weights) | Transfer attacks |

---

## White-Box Attacks

### FGSM (Fast Gradient Sign Method)

The simplest and fastest attack. It computes the gradient of the loss with respect to the input and takes one step in the direction that *increases* the loss.

$$x_{adv} = x + \epsilon \cdot \text{sign}(\nabla_x L(\theta, x, y))$$

Where:
- $x$ = original input
- $\epsilon$ = perturbation budget (e.g., 8/255 for images)
- $L$ = loss function
- $\theta$ = model parameters
- $y$ = true label

**Intuition:** Move each pixel in the direction that hurts the model most, but limit the change to $\epsilon$.

```python
import torch
import torch.nn as nn

def fgsm_attack(model, images, labels, epsilon):
    """
    Perform FGSM attack.

    Args:
        model: trained neural network
        images: input tensor (requires_grad=True)
        labels: true labels
        epsilon: perturbation budget

    Returns:
        adversarial images
    """
    # Enable gradient computation on input
    images.requires_grad = True

    # Forward pass
    outputs = model(images)
    loss = nn.CrossEntropyLoss()(outputs, labels)

    # Backward pass — compute gradient w.r.t. input
    model.zero_grad()
    loss.backward()

    # Create adversarial example
    perturbation = epsilon * images.grad.sign()
    adv_images = images + perturbation

    # Clamp to valid pixel range [0, 1]
    adv_images = torch.clamp(adv_images, 0, 1)

    return adv_images
```

---

### PGD (Projected Gradient Descent)

PGD is an **iterative** version of FGSM — stronger but slower. It takes many small steps and projects back into the allowed perturbation ball after each step.

$$x^{t+1} = \Pi_{x + S} \left( x^t + \alpha \cdot \text{sign}(\nabla_x L(\theta, x^t, y)) \right)$$

Where:
- $\alpha$ = step size (smaller than $\epsilon$)
- $\Pi_{x + S}$ = projection onto the $\epsilon$-ball around $x$
- Multiple iterations (typically 10–50)

```python
def pgd_attack(model, images, labels, epsilon, alpha, num_steps):
    """
    Perform PGD attack (iterative FGSM with projection).

    Args:
        model: trained neural network
        images: original input tensor
        labels: true labels
        epsilon: maximum perturbation (L-inf)
        alpha: step size per iteration
        num_steps: number of attack iterations

    Returns:
        adversarial images
    """
    # Start from random point within epsilon-ball
    adv_images = images.clone().detach()
    adv_images = adv_images + torch.empty_like(adv_images).uniform_(-epsilon, epsilon)
    adv_images = torch.clamp(adv_images, 0, 1).detach()

    for _ in range(num_steps):
        adv_images.requires_grad = True

        outputs = model(adv_images)
        loss = nn.CrossEntropyLoss()(outputs, labels)

        # Get gradients
        loss.backward()
        grad = adv_images.grad.detach()

        # FGSM step
        adv_images = adv_images.detach() + alpha * grad.sign()

        # Project back into epsilon-ball
        delta = torch.clamp(adv_images - images, -epsilon, epsilon)
        adv_images = torch.clamp(images + delta, 0, 1).detach()

    return adv_images
```

---

### C&W Attack (Carlini & Wagner)

The C&W attack is an optimization-based attack that finds the **smallest** perturbation that changes the prediction. It's stronger than PGD but much slower.

$$\min_\delta \|\delta\|_2 + c \cdot f(x + \delta)$$

Where $f$ is designed so that $f(x + \delta) \leq 0$ when the attack succeeds.

---

## Black-Box Attacks

When the attacker cannot access model internals:

### Transfer Attacks

1. Train a **substitute model** on similar data
2. Generate adversarial examples on the substitute
3. These often **transfer** to the target model

```python
# Transfer attack workflow
substitute_model = train_substitute(query_target_model)
adv_examples = pgd_attack(substitute_model, images, labels, epsilon=8/255, alpha=2/255, num_steps=20)
# These adversarial examples often fool the target model too!
```

### Query-Based Attacks

- Estimate gradients by querying the model many times
- Each query changes one pixel or uses random directions
- Slower but doesn't require a substitute model

---

## Targeted vs Untargeted Attacks

| Type | Goal | Loss Modification |
|------|------|-------------------|
| **Untargeted** | Any wrong class | Maximize $L(\theta, x, y_{true})$ |
| **Targeted** | Specific wrong class | Minimize $L(\theta, x, y_{target})$ |

```python
def targeted_fgsm(model, images, target_labels, epsilon):
    """FGSM targeted attack — fool model into predicting target class."""
    images.requires_grad = True

    outputs = model(images)
    # Minimize loss for TARGET class (note the negative sign)
    loss = nn.CrossEntropyLoss()(outputs, target_labels)

    model.zero_grad()
    loss.backward()

    # Subtract gradient (minimize loss for target)
    adv_images = images - epsilon * images.grad.sign()
    adv_images = torch.clamp(adv_images, 0, 1)

    return adv_images
```

---

## Defenses Against Adversarial Attacks

### 1. Adversarial Training

The most effective empirical defense: include adversarial examples during training.

$$\min_\theta \mathbb{E}_{(x,y)} \left[ \max_{\|\delta\| \leq \epsilon} L(\theta, x + \delta, y) \right]$$

```python
def adversarial_training_step(model, images, labels, optimizer, epsilon, alpha, num_steps):
    """
    One step of adversarial training using PGD.
    """
    model.eval()
    # Generate adversarial examples
    adv_images = pgd_attack(model, images, labels, epsilon, alpha, num_steps)

    model.train()
    # Train on adversarial examples
    optimizer.zero_grad()
    outputs = model(adv_images)
    loss = nn.CrossEntropyLoss()(outputs, labels)
    loss.backward()
    optimizer.step()

    return loss.item()
```

### 2. Input Preprocessing

Transform inputs to remove adversarial perturbations:

- **JPEG compression**: quantization removes high-frequency noise
- **Spatial smoothing**: blur the input slightly
- **Bit-depth reduction**: reduce color precision

```python
from torchvision import transforms

preprocessing_defense = transforms.Compose([
    transforms.Lambda(lambda x: jpeg_compress(x, quality=75)),
    transforms.GaussianBlur(kernel_size=3, sigma=0.5),
])
```

### 3. Certified Defenses

Provide **provable guarantees** that no attack within a budget can succeed.

### 4. Randomized Smoothing

Create a smoothed classifier by averaging predictions over noisy versions of the input:

$$g(x) = \arg\max_c \; P(\text{base classifier predicts } c \text{ when input is } x + \mathcal{N}(0, \sigma^2 I))$$

This provides a certified $\ell_2$ radius of robustness.

---

## Robustness vs Accuracy Tradeoff

A fundamental tension exists:

| Model | Clean Accuracy | Robust Accuracy (PGD) |
|-------|---------------|----------------------|
| Standard training | 95% | 0% |
| Adversarial training (ε=8/255) | 87% | 50% |
| Stronger adversarial training | 82% | 58% |

Adversarial training **reduces** clean accuracy. The model must allocate capacity to handling perturbations.

---

## Complete Example: FGSM Attack + Adversarial Training

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Simple CNN for MNIST
class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool(x)
        x = self.relu(self.conv2(x))
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Load MNIST
transform = transforms.Compose([
    transforms.ToTensor(),
])
train_dataset = datasets.MNIST("./data", train=True, download=True, transform=transform)
test_dataset = datasets.MNIST("./data", train=False, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=128)

# Training with adversarial examples
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleCNN().to(device)
optimizer = optim.Adam(model.parameters(), lr=0.001)
epsilon = 0.3  # MNIST perturbation budget

def train_adversarial(model, loader, optimizer, epsilon, epochs=5):
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)

            # Generate adversarial examples
            adv_images = fgsm_attack(model, images, labels, epsilon)

            # Train on mix of clean and adversarial
            optimizer.zero_grad()

            # Loss on clean examples
            clean_out = model(images)
            clean_loss = nn.CrossEntropyLoss()(clean_out, labels)

            # Loss on adversarial examples
            adv_out = model(adv_images.detach())
            adv_loss = nn.CrossEntropyLoss()(adv_out, labels)

            # Combined loss
            loss = 0.5 * clean_loss + 0.5 * adv_loss
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(loader)
        print(f"Epoch {epoch+1}: Loss = {avg_loss:.4f}")

# Evaluate robustness
def evaluate_robustness(model, loader, epsilon):
    model.eval()
    correct_clean = 0
    correct_adv = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        # Clean accuracy
        clean_pred = model(images).argmax(dim=1)
        correct_clean += (clean_pred == labels).sum().item()

        # Adversarial accuracy
        adv_images = fgsm_attack(model, images, labels, epsilon)
        adv_pred = model(adv_images).argmax(dim=1)
        correct_adv += (adv_pred == labels).sum().item()

        total += labels.size(0)

    print(f"Clean Accuracy: {100 * correct_clean / total:.1f}%")
    print(f"FGSM Accuracy:  {100 * correct_adv / total:.1f}%")

# Run training
train_adversarial(model, train_loader, optimizer, epsilon, epochs=5)
evaluate_robustness(model, test_loader, epsilon)
```

---

## Evaluation: AutoAttack Benchmark

**AutoAttack** is the standard benchmark for evaluating adversarial robustness. It combines multiple attacks:

1. APGD-CE (Auto-PGD with cross-entropy loss)
2. APGD-DLR (Auto-PGD with DLR loss)
3. FAB attack (Fast Adaptive Boundary)
4. Square attack (black-box, query-based)

```python
# Using the autoattack library
# pip install autoattack
from autoattack import AutoAttack

adversary = AutoAttack(model, norm="Linf", eps=8/255, version="standard")
adv_images = adversary.run_standard_evaluation(images, labels)
```

---

## Real-World Adversarial Examples

Adversarial examples aren't just a digital phenomenon:

- **Adversarial patches**: printed stickers that fool classifiers in the physical world
- **Adversarial t-shirts**: patterns that make person detectors fail
- **Road sign attacks**: small stickers on stop signs cause misclassification
- **3D adversarial objects**: specially shaped objects fool depth sensors

These attacks survive changes in:
- Viewing angle
- Lighting conditions
- Camera resolution
- Distance

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| Adversarial examples | Small perturbations fool neural networks |
| FGSM | One-step attack using gradient sign |
| PGD | Iterative FGSM — stronger attack |
| Adversarial training | Best empirical defense |
| Robustness tradeoff | More robust = slightly less accurate |
| AutoAttack | Standard robustness benchmark |

---

## Try It Yourself

1. Implement FGSM on a pretrained CIFAR-10 model
2. Plot accuracy vs epsilon (robustness curve)
3. Compare standard vs adversarially trained model
4. Try targeted attacks — force a "cat" to be classified as "dog"
5. Experiment with different $\epsilon$ values

---

## Further Reading

- Goodfellow et al., "Explaining and Harnessing Adversarial Examples" (FGSM)
- Madry et al., "Towards Deep Learning Models Resistant to Adversarial Attacks" (PGD)
- Carlini & Wagner, "Towards Evaluating the Robustness of Neural Networks" (C&W)
- RobustBench leaderboard for state-of-the-art defenses
