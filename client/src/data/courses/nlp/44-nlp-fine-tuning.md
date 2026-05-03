---
title: Fine-Tuning Pre-trained Models
---

# Fine-Tuning Pre-trained Models

**Fine-tuning** is the process of taking a pre-trained model and adapting it to your specific task by training it further on your labeled data.

This is the most practical and powerful technique in modern NLP.

---

## Fine-Tuning Workflow

The standard fine-tuning pipeline:

```
Step 1: Load Pre-trained Model
         ↓
Step 2: Prepare Your Dataset
         ↓
Step 3: Configure Training
         ↓
Step 4: Train (Fine-tune)
         ↓
Step 5: Evaluate
         ↓
Step 6: Save & Deploy
```

### Why Fine-Tune?

| Approach | Accuracy | Effort | Data Needed |
|----------|----------|--------|-------------|
| Train from scratch | Low-Medium | Very High | 100K+ |
| Feature extraction | Medium | Low | 100+ |
| Fine-tuning | **High** | Medium | 1K-10K |
| Prompt engineering | Varies | Low | 0 |

Fine-tuning gives the **best accuracy-to-effort ratio** for most tasks.

---

## Dataset Preparation

The most important (and often most tedious) step:

### Tokenization

```python
from transformers import AutoTokenizer
from datasets import load_dataset

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Load a dataset
dataset = load_dataset("imdb")
print(f"Train examples: {len(dataset['train'])}")
print(f"Test examples: {len(dataset['test'])}")

# Sample
print(f"\nSample text (first 200 chars):")
print(f"  {dataset['train'][0]['text'][:200]}...")
print(f"  Label: {dataset['train'][0]['label']}")
```

### Padding and Truncation

Models require fixed-length inputs. We handle variable-length text with:

- **Padding**: Add special `[PAD]` tokens to short sequences
- **Truncation**: Cut sequences longer than `max_length`

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Example: Different length texts
texts = [
    "Short.",
    "This is a medium sentence.",
    "This is a much longer sentence that contains many words and might exceed our maximum length limit."
]

# Without padding/truncation (variable lengths)
for text in texts:
    tokens = tokenizer(text)
    print(f"'{text[:30]}...' → {len(tokens['input_ids'])} tokens")

# With padding and truncation (fixed length)
batch = tokenizer(
    texts,
    padding="max_length",    # Pad to max_length
    truncation=True,         # Truncate if longer
    max_length=20,           # Fixed length
    return_tensors="pt"      # PyTorch tensors
)

print(f"\nBatch shape: {batch['input_ids'].shape}")  # (3, 20)
print(f"Attention mask shape: {batch['attention_mask'].shape}")

# Show padding
for i in range(len(texts)):
    tokens = tokenizer.convert_ids_to_tokens(batch["input_ids"][i])
    pad_count = tokens.count("[PAD]")
    print(f"Text {i + 1}: {len(tokens) - pad_count} real + {pad_count} padding")
```

### Dynamic Padding (More Efficient)

```python
from transformers import AutoTokenizer, DataCollatorWithPadding

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# DataCollator pads to the longest sequence in each BATCH
# (not max_length globally) — saves computation
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Tokenize without padding
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=512
        # No padding here! DataCollator handles it per-batch
    )

# The DataCollator will pad each batch to its longest sequence
print("DataCollator pads dynamically per batch — more efficient!")
```

---

## Hugging Face Trainer API

The `Trainer` class handles:
- Training loop
- Gradient accumulation
- Mixed precision (FP16)
- Distributed training
- Logging & checkpointing
- Evaluation

```python
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding,
)
from datasets import load_dataset
import numpy as np

# === 1. Load Data ===
dataset = load_dataset("imdb")

# Use subsets for demo (full dataset for production)
train_data = dataset["train"].shuffle(seed=42).select(range(5000))
eval_data = dataset["test"].shuffle(seed=42).select(range(1000))

# === 2. Tokenize ===
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def preprocess(examples):
    return tokenizer(examples["text"], truncation=True, max_length=256)

train_data = train_data.map(preprocess, batched=True)
eval_data = eval_data.map(preprocess, batched=True)

# === 3. Load Model ===
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=2
)

# === 4. Define Metrics ===
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = (predictions == labels).mean()
    return {"accuracy": accuracy}

# === 5. Configure Training ===
training_args = TrainingArguments(
    output_dir="./fine-tuned-bert",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    weight_decay=0.01,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
)

# === 6. Create Trainer ===
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    eval_dataset=eval_data,
    tokenizer=tokenizer,
    data_collator=DataCollatorWithPadding(tokenizer),
    compute_metrics=compute_metrics,
)

# === 7. Train! ===
trainer.train()
```

---

## Training Arguments Explained

Key hyperparameters for fine-tuning:

### Learning Rate

The most important hyperparameter. For fine-tuning transformers:

$$\eta \in [1 \times 10^{-5}, \; 5 \times 10^{-5}]$$

```python
from transformers import TrainingArguments

# Recommended ranges for different model sizes
learning_rates = {
    "bert-base": 2e-5,
    "bert-large": 1e-5,
    "roberta-base": 2e-5,
    "gpt2": 5e-5,
    "t5-base": 3e-4,  # T5 uses higher LR
}
```

### Warmup

Gradually increase learning rate at the start to avoid destabilizing pre-trained weights:

```python
training_args = TrainingArguments(
    output_dir="./results",
    
    # Learning rate schedule
    learning_rate=2e-5,
    warmup_ratio=0.1,      # 10% of training steps for warmup
    # OR
    # warmup_steps=500,    # Fixed number of warmup steps
    
    # Training duration
    num_train_epochs=3,    # Usually 2-5 epochs for fine-tuning
    
    # Batch size
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    gradient_accumulation_steps=2,  # Effective batch = 16 * 2 = 32
    
    # Regularization
    weight_decay=0.01,     # L2 regularization
    max_grad_norm=1.0,     # Gradient clipping
    
    # Precision
    fp16=True,             # Mixed precision (faster, less memory)
    
    # Logging
    logging_steps=50,
    logging_dir="./logs",
    
    # Checkpointing
    save_strategy="epoch",
    save_total_limit=3,    # Keep only last 3 checkpoints
    
    # Evaluation
    eval_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    greater_is_better=True,
)
```

### Effective Batch Size

When GPU memory is limited, use gradient accumulation:

$$\text{Effective Batch Size} = \text{per\_device\_batch} \times \text{gradient\_accumulation\_steps} \times \text{num\_gpus}$$

```python
# Example: Want effective batch size of 64 with 8GB GPU
# per_device_train_batch_size=8  (fits in memory)
# gradient_accumulation_steps=8  (accumulate 8 mini-batches)
# Effective: 8 × 8 = 64
```

---

## Evaluation During Training

Monitor training progress to catch problems early:

```python
import numpy as np
from sklearn.metrics import precision_recall_fscore_support, accuracy_score

def compute_metrics(eval_pred):
    """Compute multiple metrics for evaluation."""
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    
    # Accuracy
    accuracy = accuracy_score(labels, predictions)
    
    # Precision, Recall, F1
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average="weighted"
    )
    
    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }
```

### Training Curves

What to look for during training:

```
Good Training:
  Train Loss: ▓▓▓▓░░ → decreasing steadily
  Eval Loss:  ▓▓▓░░░ → decreasing, then stable
  Gap:        Small gap between train and eval

Overfitting:
  Train Loss: ▓▓▓▓▓░ → keeps decreasing
  Eval Loss:  ▓▓░▓▓▓ → starts increasing ⚠️
  Gap:        Growing gap between train and eval

Underfitting:
  Train Loss: ▓▓▓▓▓▓ → still high, not decreasing
  Eval Loss:  ▓▓▓▓▓▓ → also high
  Fix:        Increase LR, epochs, or model capacity
```

---

## Saving and Loading Fine-Tuned Models

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# After training, save the model
trainer.save_model("./my-fine-tuned-model")
tokenizer.save_pretrained("./my-fine-tuned-model")

# Later, load it back
model = AutoModelForSequenceClassification.from_pretrained("./my-fine-tuned-model")
tokenizer = AutoTokenizer.from_pretrained("./my-fine-tuned-model")

# Use for inference
import torch

def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
    with torch.no_grad():
        outputs = model(**inputs)
    probabilities = torch.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probabilities, dim=-1).item()
    confidence = probabilities[0][predicted_class].item()
    return predicted_class, confidence

# Test predictions
test_texts = [
    "This movie was absolutely brilliant!",
    "I hated every minute of this film.",
    "It was an average movie, nothing special."
]

for text in test_texts:
    label, conf = predict(text)
    sentiment = "Positive" if label == 1 else "Negative"
    print(f"'{text}' → {sentiment} ({conf:.2%})")
```

### Push to Hugging Face Hub

```python
# Share your model with the world
trainer.push_to_hub("my-username/my-fine-tuned-bert-sentiment")

# Others can now use it:
# model = AutoModelForSequenceClassification.from_pretrained(
#     "my-username/my-fine-tuned-bert-sentiment"
# )
```

---

## Common Pitfalls

### 1. Overfitting

When the model memorizes training data instead of learning general patterns:

```python
# Signs of overfitting:
# - Training accuracy: 99%+
# - Validation accuracy: stuck or decreasing

# Solutions:
training_args = TrainingArguments(
    output_dir="./results",
    weight_decay=0.01,        # L2 regularization
    num_train_epochs=3,       # Don't train too long
    per_device_train_batch_size=32,  # Larger batches help
    warmup_ratio=0.1,
    load_best_model_at_end=True,  # Early stopping effect
    
    # Add dropout in model (already in BERT by default: 0.1)
)
```

### 2. Catastrophic Forgetting

The model forgets pre-trained knowledge while learning the new task:

$$\text{Performance on pre-training tasks} \downarrow \text{ as fine-tuning progresses}$$

```python
# Solutions for catastrophic forgetting:

# 1. Lower learning rate
learning_rate = 2e-5  # Much smaller than training from scratch

# 2. Fewer epochs (2-4 is usually enough)
num_train_epochs = 3

# 3. Gradual unfreezing
def freeze_lower_layers(model, num_frozen_layers=8):
    """Freeze first N transformer layers."""
    for name, param in model.named_parameters():
        if "embeddings" in name:
            param.requires_grad = False
        for i in range(num_frozen_layers):
            if f"layer.{i}." in name:
                param.requires_grad = False

# 4. Learning rate warmup
warmup_ratio = 0.1  # Gentle start
```

### 3. Learning Rate Too High

```python
# Symptoms: loss spikes, NaN values, oscillating metrics
# Fix: reduce learning rate

# Good starting points:
# BERT/RoBERTa: 2e-5
# Large models: 1e-5
# If unstable: try 5e-6
```

---

## LoRA and PEFT: Efficient Fine-Tuning

When fine-tuning the entire model is too expensive, use **Parameter-Efficient Fine-Tuning (PEFT)**:

### LoRA (Low-Rank Adaptation)

Instead of updating all weights, LoRA adds small trainable matrices:

$$W' = W + \Delta W = W + BA$$

Where $B \in \mathbb{R}^{d \times r}$ and $A \in \mathbb{R}^{r \times k}$, with rank $r \ll \min(d, k)$.

```
Full Fine-tuning:      LoRA:
┌──────────────┐       ┌──────────────┐
│ W (d × k)    │       │ W (frozen)   │   ← Don't update
│ ALL trainable│       │ + B×A (tiny) │   ← Only train these
│              │       │              │
│ 110M params  │       │ 0.3M params  │   ← 300× fewer!
└──────────────┘       └──────────────┘
```

```python
from transformers import AutoModelForSequenceClassification
from peft import LoraConfig, get_peft_model, TaskType

# Load base model
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2
)

# Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.SEQ_CLS,
    r=8,                     # Rank (lower = fewer params, less capacity)
    lora_alpha=32,           # Scaling factor
    lora_dropout=0.1,        # Dropout on LoRA layers
    target_modules=["query", "value"],  # Which layers to adapt
)

# Apply LoRA
model = get_peft_model(model, lora_config)

# Check parameter count
model.print_trainable_parameters()
# Output: trainable params: 294,912 || all params: 109,777,410
#         || trainable%: 0.2686
```

### Benefits of PEFT

| Feature | Full Fine-tuning | LoRA/PEFT |
|---------|-----------------|-----------|
| Trainable params | 110M | ~300K |
| GPU memory | 8-16 GB | 2-4 GB |
| Training time | Hours | Minutes |
| Storage per task | Full model copy | Small adapter |
| Performance | Baseline | ~95-99% of full |

---

## Complete Code: Fine-Tune BERT for Sentiment

```python
"""
Complete Fine-Tuning Pipeline
Fine-tune BERT for sentiment classification on IMDB dataset.
"""

from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding,
    EarlyStoppingCallback,
)
from datasets import load_dataset
import numpy as np
import torch

def main():
    # Configuration
    MODEL_NAME = "bert-base-uncased"
    NUM_LABELS = 2
    MAX_LENGTH = 256
    TRAIN_SIZE = 5000    # Use full dataset in production
    EVAL_SIZE = 1000
    OUTPUT_DIR = "./sentiment-bert"
    
    print("=" * 60)
    print("BERT Fine-Tuning for Sentiment Classification")
    print("=" * 60)
    
    # === Step 1: Load Dataset ===
    print("\n[1/6] Loading dataset...")
    dataset = load_dataset("imdb")
    
    train_data = dataset["train"].shuffle(seed=42).select(range(TRAIN_SIZE))
    eval_data = dataset["test"].shuffle(seed=42).select(range(EVAL_SIZE))
    
    print(f"  Train: {len(train_data)} examples")
    print(f"  Eval: {len(eval_data)} examples")
    
    # === Step 2: Tokenize ===
    print("\n[2/6] Tokenizing...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=MAX_LENGTH,
        )
    
    train_data = train_data.map(tokenize_function, batched=True)
    eval_data = eval_data.map(tokenize_function, batched=True)
    
    # Remove raw text column (not needed for training)
    train_data = train_data.remove_columns(["text"])
    eval_data = eval_data.remove_columns(["text"])
    
    print(f"  Tokenized! Max length: {MAX_LENGTH}")
    
    # === Step 3: Load Model ===
    print("\n[3/6] Loading pre-trained model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_LABELS,
    )
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"  Model: {MODEL_NAME}")
    print(f"  Parameters: {total_params:,}")
    print(f"  Labels: {NUM_LABELS}")
    
    # === Step 4: Configure Training ===
    print("\n[4/6] Configuring training...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        
        # Duration
        num_train_epochs=3,
        
        # Batch size
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        
        # Optimization
        learning_rate=2e-5,
        warmup_ratio=0.1,
        weight_decay=0.01,
        max_grad_norm=1.0,
        
        # Precision
        fp16=torch.cuda.is_available(),
        
        # Evaluation & saving
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        save_total_limit=2,
        
        # Logging
        logging_steps=25,
        logging_dir=f"{OUTPUT_DIR}/logs",
        report_to="none",  # Set to "wandb" for Weights & Biases
    )
    
    # === Step 5: Define Metrics ===
    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        
        accuracy = (predictions == labels).mean()
        
        # F1 score
        tp = ((predictions == 1) & (labels == 1)).sum()
        fp = ((predictions == 1) & (labels == 0)).sum()
        fn = ((predictions == 0) & (labels == 1)).sum()
        
        precision = tp / (tp + fp + 1e-8)
        recall = tp / (tp + fn + 1e-8)
        f1 = 2 * precision * recall / (precision + recall + 1e-8)
        
        return {
            "accuracy": accuracy,
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
        }
    
    # === Step 6: Train ===
    print("\n[5/6] Starting training...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_data,
        eval_dataset=eval_data,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer),
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )
    
    # Train the model
    train_result = trainer.train()
    
    print(f"\n  Training complete!")
    print(f"  Total steps: {train_result.global_step}")
    print(f"  Training loss: {train_result.training_loss:.4f}")
    
    # === Step 7: Evaluate ===
    print("\n[6/6] Final evaluation...")
    metrics = trainer.evaluate()
    
    print(f"  Accuracy:  {metrics['eval_accuracy']:.4f}")
    print(f"  Precision: {metrics['eval_precision']:.4f}")
    print(f"  Recall:    {metrics['eval_recall']:.4f}")
    print(f"  F1 Score:  {metrics['eval_f1']:.4f}")
    
    # Save the final model
    trainer.save_model(f"{OUTPUT_DIR}/final")
    tokenizer.save_pretrained(f"{OUTPUT_DIR}/final")
    print(f"\n  Model saved to {OUTPUT_DIR}/final")
    
    # === Inference Demo ===
    print("\n" + "=" * 60)
    print("INFERENCE DEMO")
    print("=" * 60)
    
    model.eval()
    test_texts = [
        "This is the best movie I have ever seen!",
        "Absolutely terrible. Don't waste your time.",
        "It was okay, had some good moments.",
        "A masterpiece of modern cinema.",
        "Boring, predictable, and poorly acted.",
    ]
    
    for text in test_texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True,
                          max_length=MAX_LENGTH)
        with torch.no_grad():
            outputs = model(**inputs)
        
        probs = torch.softmax(outputs.logits, dim=-1)
        pred = torch.argmax(probs, dim=-1).item()
        conf = probs[0][pred].item()
        
        label = "Positive" if pred == 1 else "Negative"
        print(f"  [{label:8s} {conf:.1%}] {text}")


if __name__ == "__main__":
    main()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Workflow | Load → Tokenize → Configure → Train → Evaluate → Save |
| Tokenization | Padding + truncation for fixed-length inputs |
| Learning rate | 2e-5 for BERT (much lower than scratch) |
| Epochs | 2-5 usually sufficient |
| Warmup | 10% of steps prevents instability |
| Overfitting | Weight decay, early stopping, fewer epochs |
| Catastrophic forgetting | Low LR, gradual unfreezing |
| PEFT/LoRA | Train 0.3% of params, get 95%+ performance |
| Trainer API | Handles training loop, evaluation, saving |

---

## Next Steps

Next, we'll explore **Modern Tokenization** — BPE, WordPiece, and SentencePiece algorithms that power these models.
