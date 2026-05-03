---
title: Transfer Learning for NLP
---

# Transfer Learning for NLP

**Transfer learning** is the technique of taking knowledge learned from one task and applying it to a different but related task.

Instead of training from scratch every time, we can **reuse** what a model has already learned about language.

---

## What is Transfer Learning?

In traditional machine learning, each task is trained independently:

```
Traditional Approach:
Task A: Train from scratch → Model A
Task B: Train from scratch → Model B
Task C: Train from scratch → Model C

Transfer Learning Approach:
Pre-train on massive data → Foundation Model
                              ↓
                    Fine-tune for Task A → Model A
                    Fine-tune for Task B → Model B
                    Fine-tune for Task C → Model C
```

### Analogy

Think of it like human learning:

- A person who learned French finds it easier to learn Spanish
- A skilled chess player can learn Go faster than a beginner
- A Python developer can pick up JavaScript more quickly

The shared underlying knowledge **transfers** to new tasks.

---

## The Pre-train → Fine-tune Paradigm

This is the dominant paradigm in modern NLP:

### Step 1: Pre-training

Train a large model on **unlabeled** text data with a self-supervised objective.

$$\theta^* = \arg\min_\theta \mathcal{L}_{\text{pretrain}}(\theta; \mathcal{D}_{\text{large}})$$

- Dataset: Billions of words from books, web, Wikipedia
- Objective: Language modeling (predict masked/next words)
- Result: Model learns grammar, facts, reasoning

### Step 2: Fine-tuning

Adapt the pre-trained model to a **specific task** using a smaller labeled dataset.

$$\theta^{**} = \arg\min_\theta \mathcal{L}_{\text{task}}(\theta; \mathcal{D}_{\text{small}}) \quad \text{starting from } \theta^*$$

- Dataset: Hundreds to thousands of labeled examples
- Objective: Task-specific (classification, NER, etc.)
- Result: Specialized model for your task

```python
# The pre-train → fine-tune pipeline
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Step 1: Load pre-trained model (someone already did the expensive pre-training)
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=2  # Add task-specific classification head
)

# Step 2: Fine-tune on your task (much cheaper!)
# The model already understands language — it just needs to learn YOUR task
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
print(f"Pre-trained layers: transformer encoder")
print(f"New layers: classification head (768 → 2)")
```

---

## Why Transfer Learning Works

Language understanding has **shared structure** across tasks:

```
Layer 1-3:   Basic syntax, word relationships
Layer 4-6:   Phrase structure, local semantics
Layer 7-9:   Sentence meaning, coreference
Layer 10-12: Task-specific reasoning
```

### Shared Knowledge

| Knowledge Type | Example | Useful For |
|----------------|---------|------------|
| Syntax | Subject-verb agreement | All NLP tasks |
| Semantics | "happy" ≈ "glad" | Sentiment, similarity |
| World knowledge | "Paris is in France" | QA, NLI |
| Discourse | How paragraphs connect | Summarization |

This shared knowledge means a model pre-trained on general text already knows **most** of what it needs for specific tasks.

---

## Feature Extraction

Use the pre-trained model as a **fixed feature extractor** — don't update its weights.

```python
import torch
from transformers import AutoModel, AutoTokenizer

# Load pre-trained model
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

# Freeze all parameters (no gradient updates)
for param in model.parameters():
    param.requires_grad = False

def extract_features(text):
    """Use BERT as a fixed feature extractor."""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Use [CLS] token representation as sentence embedding
    cls_embedding = outputs.last_hidden_state[:, 0, :]  # Shape: (1, 768)
    return cls_embedding

# Extract features for classification
texts = [
    "This movie was fantastic!",
    "Terrible waste of time.",
    "An average film, nothing special."
]

features = []
for text in texts:
    feat = extract_features(text)
    features.append(feat)
    print(f"'{text}' → embedding shape: {feat.shape}")

# Stack features for downstream classifier
feature_matrix = torch.cat(features, dim=0)
print(f"\nFeature matrix shape: {feature_matrix.shape}")
```

### When to Use Feature Extraction

- Very small dataset (< 100 examples)
- Limited computational resources
- Quick prototyping
- When the pre-trained model's domain matches your task

---

## Fine-Tuning

Update the pre-trained weights on your specific task:

```python
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

class FineTunedClassifier(nn.Module):
    """Fine-tune BERT for binary classification."""
    
    def __init__(self, model_name="bert-base-uncased", num_labels=2):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(768, num_labels)
    
    def forward(self, input_ids, attention_mask):
        # BERT encoding (weights ARE updated during training)
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        
        # Use [CLS] token output
        cls_output = outputs.last_hidden_state[:, 0, :]
        
        # Classification head
        x = self.dropout(cls_output)
        logits = self.classifier(x)
        return logits

# Create fine-tuned model
model = FineTunedClassifier(num_labels=2)

# All parameters are trainable
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total parameters: {total_params:,}")
print(f"Trainable parameters: {trainable_params:,}")

# Fine-tuning uses a LOWER learning rate than training from scratch
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)  # Note: 2e-5, not 1e-3
```

### Fine-Tuning Learning Rate

The learning rate for fine-tuning is typically much smaller than training from scratch:

$$\eta_{\text{fine-tune}} \approx 2 \times 10^{-5} \quad \text{vs} \quad \eta_{\text{scratch}} \approx 1 \times 10^{-3}$$

This prevents **catastrophic forgetting** — overwriting the useful pre-trained knowledge.

---

## Which Layers to Freeze vs Unfreeze

Different strategies for how much of the model to update:

```
Strategy 1: Feature Extraction (all frozen)
┌──────────────────┐
│ Classification   │  ← Trainable (new)
├──────────────────┤
│ Layer 12         │  ← FROZEN
│ Layer 11         │  ← FROZEN
│ ...              │  ← FROZEN
│ Layer 1          │  ← FROZEN
│ Embeddings       │  ← FROZEN
└──────────────────┘

Strategy 2: Partial Fine-tuning (top layers unfrozen)
┌──────────────────┐
│ Classification   │  ← Trainable (new)
├──────────────────┤
│ Layer 12         │  ← Trainable
│ Layer 11         │  ← Trainable
│ Layer 10         │  ← Trainable
│ ...              │  ← FROZEN
│ Layer 1          │  ← FROZEN
│ Embeddings       │  ← FROZEN
└──────────────────┘

Strategy 3: Full Fine-tuning (all trainable)
┌──────────────────┐
│ Classification   │  ← Trainable (new)
├──────────────────┤
│ Layer 12         │  ← Trainable
│ Layer 11         │  ← Trainable
│ ...              │  ← Trainable
│ Layer 1          │  ← Trainable
│ Embeddings       │  ← Trainable
└──────────────────┘
```

```python
from transformers import AutoModel

model = AutoModel.from_pretrained("bert-base-uncased")

# Strategy: Freeze all layers except the last 2
for name, param in model.named_parameters():
    # Freeze everything by default
    param.requires_grad = False

# Unfreeze last 2 encoder layers
for name, param in model.named_parameters():
    if "encoder.layer.10" in name or "encoder.layer.11" in name:
        param.requires_grad = True

# Count parameters
frozen = sum(p.numel() for p in model.parameters() if not p.requires_grad)
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Frozen parameters: {frozen:,}")
print(f"Trainable parameters: {trainable:,}")
print(f"Percentage trainable: {trainable / (frozen + trainable) * 100:.1f}%")
```

### Guidelines for Choosing

| Scenario | Strategy |
|----------|----------|
| Very small dataset (< 1K) | Feature extraction or freeze most layers |
| Small dataset (1K-10K) | Unfreeze top 2-4 layers |
| Medium dataset (10K-100K) | Full fine-tuning with low LR |
| Large dataset (100K+) | Full fine-tuning |
| Domain mismatch | Unfreeze more layers |
| Domain match | Fewer layers needed |

---

## ULMFiT: The Transfer Learning Breakthrough

**ULMFiT** (Universal Language Model Fine-tuning, Howard & Ruder, 2018) was the first paper to show transfer learning works effectively for NLP.

### Three Key Innovations

#### 1. Discriminative Fine-tuning

Use different learning rates for different layers:

$$\eta^l = \eta^L \cdot \xi^{L-l}$$

Where $\eta^L$ is the learning rate of the last layer, and $\xi$ is a decay factor (typically 2.6).

```python
# Discriminative learning rates
# Lower layers get smaller learning rates
def get_discriminative_lr(model, base_lr=2e-5, decay=2.6):
    """Assign decreasing learning rates to deeper layers."""
    parameters = []
    num_layers = 12  # BERT has 12 layers
    
    # Embedding layer gets smallest LR
    parameters.append({
        "params": [p for n, p in model.named_parameters() 
                   if "embedding" in n],
        "lr": base_lr / (decay ** num_layers)
    })
    
    # Each encoder layer gets progressively larger LR
    for layer_idx in range(num_layers):
        layer_lr = base_lr / (decay ** (num_layers - layer_idx - 1))
        parameters.append({
            "params": [p for n, p in model.named_parameters() 
                       if f"layer.{layer_idx}." in n],
            "lr": layer_lr
        })
    
    # Classification head gets highest LR
    parameters.append({
        "params": [p for n, p in model.named_parameters() 
                   if "classifier" in n],
        "lr": base_lr
    })
    
    return parameters
```

#### 2. Slanted Triangular Learning Rate

A warmup schedule that increases then gradually decreases:

```python
def slanted_triangular_schedule(optimizer, num_training_steps, cut_frac=0.1):
    """Linearly increase then linearly decay learning rate."""
    cut = int(num_training_steps * cut_frac)
    
    def lr_lambda(step):
        if step < cut:
            # Linear warmup
            return step / cut
        else:
            # Linear decay
            return 1.0 - (step - cut) / (num_training_steps - cut)
    
    from torch.optim.lr_scheduler import LambdaLR
    return LambdaLR(optimizer, lr_lambda)
```

#### 3. Gradual Unfreezing

Unfreeze layers one at a time during training:

```python
def gradual_unfreeze(model, epoch, total_layers=12):
    """Unfreeze one more layer each epoch, starting from the top."""
    # First: freeze all
    for param in model.parameters():
        param.requires_grad = False
    
    # Always train the classification head
    for name, param in model.named_parameters():
        if "classifier" in name:
            param.requires_grad = True
    
    # Unfreeze layers from top to bottom
    layers_to_unfreeze = min(epoch + 1, total_layers)
    for layer_idx in range(total_layers - 1, total_layers - 1 - layers_to_unfreeze, -1):
        for name, param in model.named_parameters():
            if f"layer.{layer_idx}." in name:
                param.requires_grad = True
    
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Epoch {epoch}: {layers_to_unfreeze} layers unfrozen, "
          f"{trainable:,} trainable params")
```

---

## Domain Adaptation

When your target domain differs significantly from the pre-training data:

```
General Pre-training (Wikipedia, Books)
          ↓
Domain-Adaptive Pre-training (domain text)
          ↓
Fine-tuning (task-specific labeled data)
```

### Examples

| Base Model Domain | Target Domain | Solution |
|-------------------|---------------|----------|
| General English | Biomedical | BioBERT (pre-train on PubMed) |
| General English | Legal | LegalBERT (pre-train on legal docs) |
| General English | Scientific | SciBERT (pre-train on papers) |
| General English | Financial | FinBERT (pre-train on financial text) |

```python
from transformers import AutoModel, AutoTokenizer

# Domain-specific models available on Hugging Face
domain_models = {
    "biomedical": "dmis-lab/biobert-base-cased-v1.2",
    "scientific": "allenai/scibert_scivocab_uncased",
    "financial": "yiyanghkust/finbert-tone",
    "clinical": "emilyalsentzer/Bio_ClinicalBERT",
}

# Load a domain-specific model
domain = "biomedical"
model_name = domain_models[domain]

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# This model is better for biomedical tasks
text = "The patient presented with acute myocardial infarction."
inputs = tokenizer(text, return_tensors="pt")
outputs = model(**inputs)

print(f"Domain: {domain}")
print(f"Model: {model_name}")
print(f"Output shape: {outputs.last_hidden_state.shape}")
```

---

## Complete Code: Fine-Tune for Custom Classification

```python
"""
Transfer Learning: Fine-tune a pre-trained model for custom text classification.
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import AutoModel, AutoTokenizer
from torch.optim import AdamW
from torch.optim.lr_scheduler import LinearLR

# Custom dataset
class TextClassificationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "label": torch.tensor(self.labels[idx], dtype=torch.long)
        }

# Model with transfer learning
class TransferLearningClassifier(nn.Module):
    def __init__(self, model_name, num_labels, freeze_base=False):
        super().__init__()
        self.base_model = AutoModel.from_pretrained(model_name)
        
        if freeze_base:
            for param in self.base_model.parameters():
                param.requires_grad = False
        
        hidden_size = self.base_model.config.hidden_size
        self.classifier = nn.Sequential(
            nn.Dropout(0.1),
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_labels)
        )
    
    def forward(self, input_ids, attention_mask):
        outputs = self.base_model(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        cls_output = outputs.last_hidden_state[:, 0, :]
        return self.classifier(cls_output)

def train_with_transfer_learning():
    """Full transfer learning pipeline."""
    # Sample data (in practice, load your dataset)
    train_texts = [
        "This product is amazing, I love it!",
        "Terrible quality, broke after one day.",
        "Best purchase I've ever made!",
        "Waste of money, do not buy.",
        "Exceeded all my expectations!",
        "Disappointing, not as described.",
        "Five stars, highly recommend!",
        "Awful customer service experience."
    ]
    train_labels = [1, 0, 1, 0, 1, 0, 1, 0]  # 1=positive, 0=negative
    
    # Setup
    model_name = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Create dataset and dataloader
    dataset = TextClassificationDataset(train_texts, train_labels, tokenizer)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
    
    # Create model with transfer learning
    model = TransferLearningClassifier(
        model_name=model_name,
        num_labels=2,
        freeze_base=False  # Full fine-tuning
    )
    
    # Optimizer with discriminative learning rates
    optimizer = AdamW([
        {"params": model.base_model.parameters(), "lr": 2e-5},
        {"params": model.classifier.parameters(), "lr": 1e-3}
    ])
    
    criterion = nn.CrossEntropyLoss()
    
    # Training loop
    model.train()
    num_epochs = 3
    
    for epoch in range(num_epochs):
        total_loss = 0
        correct = 0
        total = 0
        
        for batch in dataloader:
            optimizer.zero_grad()
            
            logits = model(
                input_ids=batch["input_ids"],
                attention_mask=batch["attention_mask"]
            )
            
            loss = criterion(logits, batch["label"])
            loss.backward()
            
            # Gradient clipping to prevent exploding gradients
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            
            total_loss += loss.item()
            predictions = torch.argmax(logits, dim=-1)
            correct += (predictions == batch["label"]).sum().item()
            total += len(batch["label"])
        
        accuracy = correct / total
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch + 1}/{num_epochs} — "
              f"Loss: {avg_loss:.4f}, Accuracy: {accuracy:.2%}")
    
    # Save fine-tuned model
    torch.save(model.state_dict(), "fine_tuned_model.pt")
    print("\nModel saved! Transfer learning complete.")
    
    return model

if __name__ == "__main__":
    model = train_with_transfer_learning()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Transfer Learning | Reuse knowledge from one task for another |
| Pre-train → Fine-tune | Dominant paradigm in modern NLP |
| Feature Extraction | Freeze model, use as fixed encoder |
| Fine-tuning | Update pre-trained weights with low LR |
| Layer Freezing | Freeze bottom layers, train top layers |
| ULMFiT | Discriminative LR + gradual unfreezing |
| Domain Adaptation | Further pre-train on domain-specific text |
| Catastrophic Forgetting | Low LR and gradual unfreezing prevent it |

---

## Next Steps

Next, we'll explore **Hugging Face & Transformers Library** — the ecosystem that makes transfer learning accessible to everyone.
