---
title: Few-Shot & Zero-Shot Learning
---

# Few-Shot & Zero-Shot Learning

Deep learning models typically need thousands of labeled examples per class to perform well. But what if you only have **a few labeled examples**? Few-shot and zero-shot learning tackle this data-scarce challenge.

---

## The Data Problem

Traditional image classifiers require massive datasets:

| Approach | Labels Needed | Example |
|----------|--------------|---------|
| Standard training | 1000+ per class | ImageNet |
| Few-shot learning | 1–5 per class | New species identification |
| Zero-shot learning | 0 per class | Novel category recognition |

**Real-world scenarios** where data is scarce:

- Rare diseases in medical imaging
- New product recognition in retail
- Identifying endangered species from photos
- Personalized face recognition (only a few selfies)

---

## Few-Shot Learning Basics

Few-shot learning trains models to **classify new classes using only K examples**.

### Terminology

- **K-shot**: K labeled examples per class
- **N-way**: N classes to distinguish between
- **N-way K-shot**: classify among N classes with K examples each

### Common Scenarios

```
1-shot 5-way: 1 example per class, 5 classes → pick the right one
5-shot 5-way: 5 examples per class, 5 classes → more data helps
1-shot 20-way: 1 example per class, 20 classes → very challenging
```

**Example**: Given 5 new bird species with 1 photo each, classify a query photo into one of the 5 species.

---

## Meta-Learning: Learning to Learn

The key insight: instead of training on one big classification task, train on **many small tasks** (episodes).

### Episode-Based Training

Each training episode mimics the test scenario:

```
Episode structure:
├── Support set: K examples × N classes (what you're given)
├── Query set: examples to classify (what you must label)
└── Goal: classify query items using only the support set
```

**Training process**:

1. Sample N classes from training data
2. Sample K examples per class → support set
3. Sample additional examples → query set
4. Train model to classify query using support
5. Repeat thousands of episodes

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import random

class EpisodeSampler:
    """Sample episodes for meta-learning training."""

    def __init__(self, dataset_labels, n_way, k_shot, q_query):
        self.labels = dataset_labels
        self.n_way = n_way
        self.k_shot = k_shot
        self.q_query = q_query

        # Group indices by class
        self.class_indices = {}
        for idx, label in enumerate(dataset_labels):
            if label not in self.class_indices:
                self.class_indices[label] = []
            self.class_indices[label].append(idx)

    def sample_episode(self):
        """Sample one N-way K-shot episode."""
        # Pick N random classes
        classes = random.sample(
            list(self.class_indices.keys()), self.n_way
        )

        support_indices = []
        query_indices = []

        for cls in classes:
            indices = random.sample(
                self.class_indices[cls],
                self.k_shot + self.q_query
            )
            support_indices.extend(indices[:self.k_shot])
            query_indices.extend(indices[self.k_shot:])

        return support_indices, query_indices, classes
```

---

## Prototypical Networks

**Prototypical Networks** (ProtoNets) are one of the simplest and most effective few-shot methods.

### Core Idea

1. Embed all images into a feature space using a CNN
2. Compute the **prototype** (mean embedding) for each class
3. Classify query images by **nearest prototype**

### The Math

For class $k$ with support set $S_k$, the prototype is:

$$c_k = \frac{1}{|S_k|}\sum_{x_i \in S_k} f_\theta(x_i)$$

Where $f_\theta$ is the embedding network.

Classification uses negative squared Euclidean distance:

$$p(y = k | x) = \frac{\exp(-\|f_\theta(x) - c_k\|^2)}{\sum_{k'} \exp(-\|f_\theta(x) - c_{k'}\|^2)}$$

### Implementation

```python
class ProtoNet(nn.Module):
    """Prototypical Network for few-shot classification."""

    def __init__(self, in_channels=1, hidden_dim=64, out_dim=64):
        super().__init__()
        # Simple CNN embedding network
        self.encoder = nn.Sequential(
            self._conv_block(in_channels, hidden_dim),
            self._conv_block(hidden_dim, hidden_dim),
            self._conv_block(hidden_dim, hidden_dim),
            self._conv_block(hidden_dim, out_dim),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten()
        )

    def _conv_block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )

    def forward(self, x):
        """Compute embedding for input images."""
        return self.encoder(x)

    def compute_prototypes(self, support, n_way, k_shot):
        """
        Compute class prototypes from support set embeddings.

        Args:
            support: (n_way * k_shot, embed_dim) support embeddings
            n_way: number of classes
            k_shot: examples per class

        Returns:
            prototypes: (n_way, embed_dim)
        """
        # Reshape: (n_way, k_shot, embed_dim)
        support = support.view(n_way, k_shot, -1)
        # Mean over k_shot dimension
        prototypes = support.mean(dim=1)  # (n_way, embed_dim)
        return prototypes

    def classify(self, query, prototypes):
        """
        Classify query samples by nearest prototype.

        Args:
            query: (n_query, embed_dim)
            prototypes: (n_way, embed_dim)

        Returns:
            log_probabilities: (n_query, n_way)
        """
        # Euclidean distance: (n_query, n_way)
        dists = torch.cdist(query, prototypes)
        # Negative distance as logits (closer = higher score)
        log_probs = F.log_softmax(-dists, dim=1)
        return log_probs


def train_protonet_episode(model, support_images, query_images,
                           query_labels, n_way, k_shot, optimizer):
    """Train ProtoNet on one episode."""
    model.train()
    optimizer.zero_grad()

    # Embed support and query
    support_embeds = model(support_images)   # (n_way*k_shot, dim)
    query_embeds = model(query_images)       # (n_query, dim)

    # Compute prototypes
    prototypes = model.compute_prototypes(
        support_embeds, n_way, k_shot
    )

    # Classify queries
    log_probs = model.classify(query_embeds, prototypes)

    # Cross-entropy loss
    loss = F.nll_loss(log_probs, query_labels)
    loss.backward()
    optimizer.step()

    # Accuracy
    preds = log_probs.argmax(dim=1)
    acc = (preds == query_labels).float().mean()

    return loss.item(), acc.item()
```

---

## Matching Networks

**Matching Networks** use an attention-based approach instead of simple prototypes.

For each query, they compute a weighted sum over support set labels:

$$\hat{y} = \sum_{i=1}^{k} a(x, x_i) \cdot y_i$$

Where $a(x, x_i)$ is a softmax attention over cosine similarities:

$$a(x, x_i) = \frac{\exp(\cos(f(x), g(x_i)))}{\sum_j \exp(\cos(f(x), g(x_j)))}$$

Key differences from ProtoNet:
- Uses **cosine similarity** instead of Euclidean distance
- Compares query to **every** support example (not class means)
- Can use different encoders for support ($g$) and query ($f$)

---

## MAML: Model-Agnostic Meta-Learning

**MAML** learns a good **initialization** that can quickly adapt to new tasks.

### The Idea

Instead of learning features directly, learn initial weights that are **close to optimal for many tasks** — so a few gradient steps suffice for any new task.

### Algorithm

```
Outer loop (meta-update):
  For each task T_i:
    1. Inner loop: take a few gradient steps on T_i's support set
       θ'_i = θ - α * ∇_θ L(T_i_support, θ)
    2. Evaluate adapted θ'_i on T_i's query set
  Meta-update: θ = θ - β * ∇_θ Σ L(T_i_query, θ'_i)
```

```python
class MAML:
    """Simplified MAML for few-shot learning."""

    def __init__(self, model, inner_lr=0.01, outer_lr=0.001,
                 inner_steps=5):
        self.model = model
        self.inner_lr = inner_lr
        self.outer_lr = outer_lr
        self.inner_steps = inner_steps
        self.meta_optimizer = torch.optim.Adam(
            model.parameters(), lr=outer_lr
        )

    def inner_loop(self, support_x, support_y):
        """Adapt model to a single task (inner loop)."""
        fast_weights = {
            name: param.clone()
            for name, param in self.model.named_parameters()
        }

        for _ in range(self.inner_steps):
            preds = self.model.functional_forward(
                support_x, fast_weights
            )
            loss = F.cross_entropy(preds, support_y)
            grads = torch.autograd.grad(
                loss, fast_weights.values(), create_graph=True
            )
            fast_weights = {
                name: param - self.inner_lr * grad
                for (name, param), grad
                in zip(fast_weights.items(), grads)
            }
        return fast_weights

    def outer_step(self, tasks):
        """Meta-update across multiple tasks."""
        self.meta_optimizer.zero_grad()
        meta_loss = 0.0

        for support_x, support_y, query_x, query_y in tasks:
            fast_weights = self.inner_loop(support_x, support_y)
            query_preds = self.model.functional_forward(
                query_x, fast_weights
            )
            meta_loss += F.cross_entropy(query_preds, query_y)

        meta_loss /= len(tasks)
        meta_loss.backward()
        self.meta_optimizer.step()
        return meta_loss.item()
```

---

## Siamese Networks

**Siamese Networks** learn a **similarity function** between two images.

### Architecture

Two identical networks (shared weights) process two inputs and output a similarity score:

```python
class SiameseNetwork(nn.Module):
    """Siamese Network for one-shot learning."""

    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 64, 10), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 7), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128, 128, 4), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 4), nn.ReLU(), nn.Flatten()
        )
        self.classifier = nn.Sequential(
            nn.Linear(256 * 6 * 6, 4096), nn.Sigmoid(),
            nn.Linear(4096, 1), nn.Sigmoid()
        )

    def forward(self, x1, x2):
        """Compare two images. Output: similarity [0, 1]."""
        feat1 = self.features(x1)
        feat2 = self.features(x2)
        diff = torch.abs(feat1 - feat2)
        return self.classifier(diff)


class ContrastiveLoss(nn.Module):
    """Contrastive loss: pull same-class pairs, push different apart."""

    def __init__(self, margin=2.0):
        super().__init__()
        self.margin = margin

    def forward(self, output1, output2, label):
        dist = F.pairwise_distance(output1, output2)
        loss = label * dist.pow(2) + \
               (1 - label) * F.relu(self.margin - dist).pow(2)
        return loss.mean()
```

---

## Zero-Shot Learning

**Zero-shot learning** classifies classes **never seen during training** by leveraging semantic information.

### How It Works

Instead of learning visual features for each class, connect visual features to **semantic descriptions**:

- Class attributes (has stripes, can fly, four legs)
- Text descriptions ("a large cat with orange and black stripes")
- Word embeddings of class names

### CLIP: Connecting Vision and Language

**CLIP** (Contrastive Language-Image Pre-training) by OpenAI learns to align images and text in a shared embedding space.

**Zero-shot classification with CLIP**:

1. Encode candidate class names as text: "A photo of a [class]"
2. Encode the query image
3. Pick the class with highest image-text similarity

```python
import torch
import torch.nn.functional as F

# Using OpenAI's CLIP (pip install open_clip_torch)
import open_clip

def clip_zero_shot_classify(image, class_names, model, preprocess,
                            tokenizer, device="cuda"):
    """
    Zero-shot classification using CLIP.

    Args:
        image: PIL Image
        class_names: list of class name strings
        model: CLIP model
        preprocess: image preprocessing transform
        tokenizer: text tokenizer
    """
    # Prepare text prompts
    text_prompts = [f"A photo of a {name}" for name in class_names]
    text_tokens = tokenizer(text_prompts).to(device)

    # Prepare image
    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        # Encode image and text
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)

        # Normalize embeddings
        image_features = F.normalize(image_features, dim=-1)
        text_features = F.normalize(text_features, dim=-1)

        # Compute cosine similarity
        similarity = (image_features @ text_features.T) * 100

        # Convert to probabilities
        probs = similarity.softmax(dim=-1)

    # Return predictions
    results = {
        name: prob.item()
        for name, prob in zip(class_names, probs[0])
    }
    return results


# Example usage
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k"
)
tokenizer = open_clip.get_tokenizer("ViT-B-32")
model.eval()

# Classify without ANY training on these classes
class_names = ["cat", "dog", "bird", "fish", "horse"]
predictions = clip_zero_shot_classify(
    image, class_names, model, preprocess, tokenizer
)
print("Zero-shot predictions:", predictions)
```

---

## Few-Shot vs Transfer Learning

| Aspect | Transfer Learning | Few-Shot Learning |
|--------|------------------|-------------------|
| Approach | Fine-tune pretrained model | Meta-learn from episodes |
| Data needed | 100+ per class typical | 1–5 per class |
| New classes | Requires retraining | Handles at inference |
| Speed | Slower adaptation | Fast at test time |
| Best when | Moderate data available | Very few examples |

---

## Summary

| Method | Type | Key Idea |
|--------|------|----------|
| Prototypical Networks | Few-shot | Classify by nearest class mean |
| Matching Networks | Few-shot | Attention over support examples |
| MAML | Few-shot | Learn fast-adapting initialization |
| Siamese Networks | Few-shot | Learn pairwise similarity |
| CLIP | Zero-shot | Align vision and language embeddings |

**When to use what**:
- **1–5 examples available** → Prototypical Networks or MAML
- **Need similarity scores** → Siamese Networks
- **No examples at all** → CLIP zero-shot
- **Enough data (100+)** → Standard transfer learning

---

## Try It Yourself

1. Build a ProtoNet for 5-way 1-shot on Omniglot (handwritten characters)
2. Use CLIP to classify images into custom categories with no training
3. Compare ProtoNet accuracy: 1-shot vs 5-shot vs 10-shot
4. Implement a Siamese Network for signature verification

---

## Key Takeaways

- Few-shot learning handles scenarios with very limited labeled data
- Meta-learning trains on many small tasks to generalize to new ones
- Prototypical Networks are simple yet powerful: classify by nearest class mean
- MAML learns initializations that adapt quickly with a few gradient steps
- Zero-shot learning (CLIP) requires no task-specific examples at all
- These methods are crucial for real-world applications where data collection is expensive
