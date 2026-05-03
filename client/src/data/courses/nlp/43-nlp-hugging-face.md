---
title: Hugging Face & Transformers Library
---

# Hugging Face & Transformers Library

**Hugging Face** is the go-to platform for NLP and machine learning models. Think of it as the "GitHub for AI models."

The `transformers` library provides a simple, unified API to access thousands of pre-trained models.

---

## What is Hugging Face?

Hugging Face is an AI company and open-source community that provides:

| Component | Description |
|-----------|-------------|
| **Model Hub** | 200,000+ pre-trained models |
| **Datasets** | 50,000+ datasets ready to use |
| **Transformers** | Python library for using models |
| **Tokenizers** | Fast tokenization library |
| **Spaces** | Host ML demos for free |
| **Inference API** | Run models via API calls |

```
Hugging Face Ecosystem:
┌─────────────────────────────────────────────────┐
│                   Model Hub                      │
│  (BERT, GPT-2, T5, LLaMA, Whisper, DALL-E...)  │
├────────────┬────────────┬───────────────────────┤
│ transformers│  datasets  │     tokenizers        │
│  library   │  library   │      library          │
├────────────┴────────────┴───────────────────────┤
│              Trainer API / PEFT                   │
├─────────────────────────────────────────────────┤
│        Spaces / Inference API / Gradio           │
└─────────────────────────────────────────────────┘
```

---

## Installing the Transformers Library

```python
# Install the core library
# pip install transformers

# For PyTorch backend (most common)
# pip install transformers torch

# For full ecosystem
# pip install transformers datasets tokenizers evaluate accelerate
```

---

## The Pipeline API (Easiest Way)

The `pipeline` API is the simplest way to use pre-trained models — one line of code:

```python
from transformers import pipeline

# Sentiment Analysis
classifier = pipeline("sentiment-analysis")
result = classifier("I love learning about NLP!")
print(result)
# [{'label': 'POSITIVE', 'score': 0.9998}]
```

### Available Pipeline Tasks

```python
from transformers import pipeline

# 1. Sentiment Analysis
sentiment = pipeline("sentiment-analysis")
print(sentiment("This course is fantastic!"))
# [{'label': 'POSITIVE', 'score': 0.9998}]

# 2. Named Entity Recognition
ner = pipeline("ner", grouped_entities=True)
print(ner("Elon Musk founded SpaceX in California."))
# [{'entity_group': 'PER', 'word': 'Elon Musk', ...},
#  {'entity_group': 'ORG', 'word': 'SpaceX', ...},
#  {'entity_group': 'LOC', 'word': 'California', ...}]

# 3. Question Answering
qa = pipeline("question-answering")
result = qa(
    question="What is the capital of France?",
    context="France is a country in Europe. Its capital is Paris."
)
print(result)
# {'answer': 'Paris', 'score': 0.98, 'start': 52, 'end': 57}

# 4. Text Summarization
summarizer = pipeline("summarization")
long_text = """
Artificial intelligence has transformed many industries. 
Machine learning algorithms can now diagnose diseases, 
drive cars, translate languages, and generate creative content. 
The field continues to advance rapidly with new breakthroughs 
in natural language processing and computer vision.
"""
print(summarizer(long_text, max_length=50, min_length=20))

# 5. Translation
translator = pipeline("translation_en_to_fr")
print(translator("Hello, how are you today?"))
# [{'translation_text': 'Bonjour, comment allez-vous aujourd\'hui ?'}]

# 6. Text Generation
generator = pipeline("text-generation", model="gpt2")
print(generator("The future of AI is", max_length=50, num_return_sequences=1))
```

---

## AutoModel & AutoTokenizer

For more control, use `AutoModel` and `AutoTokenizer`:

```python
from transformers import AutoModel, AutoTokenizer
import torch

# Load model and tokenizer
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Tokenize input
text = "Hugging Face makes NLP easy!"
inputs = tokenizer(text, return_tensors="pt")

print(f"Input IDs: {inputs['input_ids']}")
print(f"Attention Mask: {inputs['attention_mask']}")
print(f"Tokens: {tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])}")

# Get model output
with torch.no_grad():
    outputs = model(**inputs)

# outputs.last_hidden_state: (batch, seq_len, hidden_size)
print(f"\nOutput shape: {outputs.last_hidden_state.shape}")
print(f"[CLS] embedding: {outputs.last_hidden_state[0, 0, :5]}...")
```

### Task-Specific Auto Classes

```python
from transformers import (
    AutoModelForSequenceClassification,
    AutoModelForTokenClassification,
    AutoModelForQuestionAnswering,
    AutoModelForCausalLM,
    AutoModelForSeq2SeqLM,
    AutoModelForMaskedLM,
)

# Each adds a task-specific head on top of the base model
# Classification: base model + linear layer
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=3
)

# Causal LM (text generation): base model + LM head
model = AutoModelForCausalLM.from_pretrained("gpt2")

# Question Answering: base model + start/end position heads
model = AutoModelForQuestionAnswering.from_pretrained("bert-base-uncased")
```

---

## Model Hub: Exploring Models

The Model Hub hosts thousands of models for different tasks and languages:

```python
from huggingface_hub import list_models

# Search for models
models = list_models(
    filter="text-classification",
    sort="downloads",
    direction=-1,
    limit=5
)

for model in models:
    print(f"{model.id} — Downloads: {model.downloads:,}")
```

### Popular Models

| Model | Type | Best For |
|-------|------|----------|
| `bert-base-uncased` | Encoder | Classification, NER |
| `gpt2` | Decoder | Text generation |
| `t5-base` | Encoder-Decoder | Translation, summarization |
| `roberta-base` | Encoder | Better BERT |
| `distilbert-base-uncased` | Encoder | Fast BERT (60% faster) |
| `facebook/bart-large-cnn` | Encoder-Decoder | Summarization |
| `Helsinki-NLP/opus-mt-en-fr` | Encoder-Decoder | Translation |

---

## Loading Custom Models

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Load from Hugging Face Hub
model = AutoModelForSequenceClassification.from_pretrained(
    "nlptown/bert-base-multilingual-uncased-sentiment"
)
tokenizer = AutoTokenizer.from_pretrained(
    "nlptown/bert-base-multilingual-uncased-sentiment"
)

# This model rates reviews 1-5 stars
text = "This restaurant serves excellent food!"
inputs = tokenizer(text, return_tensors="pt")
outputs = model(**inputs)

import torch
predicted_class = torch.argmax(outputs.logits, dim=-1).item()
print(f"Rating: {predicted_class + 1} stars")
```

### Loading from Local Directory

```python
from transformers import AutoModel, AutoTokenizer

# Save a model locally
model_name = "bert-base-uncased"
model = AutoModel.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Save to disk
model.save_pretrained("./my_local_model")
tokenizer.save_pretrained("./my_local_model")

# Load from local directory
loaded_model = AutoModel.from_pretrained("./my_local_model")
loaded_tokenizer = AutoTokenizer.from_pretrained("./my_local_model")
print("Model loaded from local directory!")
```

---

## Tokenizers: AutoTokenizer

Tokenizers convert text to numbers that models understand:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Basic tokenization
text = "Hugging Face's tokenizers are incredibly fast!"
encoding = tokenizer(text)

print(f"Original text: {text}")
print(f"Token IDs: {encoding['input_ids']}")
print(f"Attention mask: {encoding['attention_mask']}")

# Convert back to tokens
tokens = tokenizer.convert_ids_to_tokens(encoding["input_ids"])
print(f"Tokens: {tokens}")

# Decode back to text
decoded = tokenizer.decode(encoding["input_ids"], skip_special_tokens=True)
print(f"Decoded: {decoded}")
```

### Batch Tokenization with Padding

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Multiple texts of different lengths
texts = [
    "Short text.",
    "This is a medium-length sentence for testing.",
    "And this is a much longer piece of text that contains more words."
]

# Tokenize with padding and truncation
batch_encoding = tokenizer(
    texts,
    padding=True,         # Pad to longest in batch
    truncation=True,      # Truncate if > max_length
    max_length=32,        # Maximum sequence length
    return_tensors="pt"   # Return PyTorch tensors
)

print(f"Input IDs shape: {batch_encoding['input_ids'].shape}")
print(f"Attention mask shape: {batch_encoding['attention_mask'].shape}")

# Show padding
for i, text in enumerate(texts):
    tokens = tokenizer.convert_ids_to_tokens(batch_encoding["input_ids"][i])
    non_pad = sum(batch_encoding["attention_mask"][i]).item()
    print(f"\nText {i + 1}: '{text}'")
    print(f"  Tokens (non-pad): {non_pad}")
    print(f"  First tokens: {tokens[:8]}")
```

### Special Tokens

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# BERT's special tokens
print(f"[CLS] token ID: {tokenizer.cls_token_id}")
print(f"[SEP] token ID: {tokenizer.sep_token_id}")
print(f"[PAD] token ID: {tokenizer.pad_token_id}")
print(f"[MASK] token ID: {tokenizer.mask_token_id}")
print(f"[UNK] token ID: {tokenizer.unk_token_id}")
print(f"Vocabulary size: {tokenizer.vocab_size}")

# Tokenize a sentence pair (for NLI, QA)
text_a = "How old are you?"
text_b = "I am 25 years old."

encoding = tokenizer(text_a, text_b, return_tensors="pt")
tokens = tokenizer.convert_ids_to_tokens(encoding["input_ids"][0])
print(f"\nSentence pair tokens: {tokens}")
# [CLS] how old are you ? [SEP] i am 25 years old . [SEP]
```

---

## Datasets Library

The `datasets` library makes loading and processing data easy:

```python
from datasets import load_dataset

# Load a popular dataset
dataset = load_dataset("imdb")
print(f"Dataset: {dataset}")
print(f"Train size: {len(dataset['train'])}")
print(f"Test size: {len(dataset['test'])}")

# Inspect a sample
sample = dataset["train"][0]
print(f"\nSample text (first 100 chars): {sample['text'][:100]}...")
print(f"Label: {sample['label']} ({'positive' if sample['label'] == 1 else 'negative'})")
```

### Processing Datasets

```python
from datasets import load_dataset
from transformers import AutoTokenizer

# Load dataset and tokenizer
dataset = load_dataset("imdb", split="train[:1000]")  # First 1000 samples
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Tokenize the entire dataset efficiently
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=256
    )

# Map applies the function to all examples (batched for speed)
tokenized_dataset = dataset.map(tokenize_function, batched=True)

print(f"Columns before: {dataset.column_names}")
print(f"Columns after: {tokenized_dataset.column_names}")
print(f"Sample keys: {list(tokenized_dataset[0].keys())}")

# Set format for PyTorch
tokenized_dataset.set_format("torch", columns=["input_ids", "attention_mask", "label"])
print(f"\nTensor shape: {tokenized_dataset[0]['input_ids'].shape}")
```

---

## Trainer API for Fine-Tuning

The `Trainer` API handles the entire training loop:

```python
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)
from datasets import load_dataset
import numpy as np

# Load data
dataset = load_dataset("imdb")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Tokenize
def tokenize(examples):
    return tokenizer(examples["text"], padding="max_length",
                     truncation=True, max_length=256)

train_dataset = dataset["train"].select(range(2000)).map(tokenize, batched=True)
eval_dataset = dataset["test"].select(range(500)).map(tokenize, batched=True)

# Load model
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=2
)

# Define metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = (predictions == labels).mean()
    return {"accuracy": accuracy}

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=50,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

# Create Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics,
)

# Train!
trainer.train()

# Evaluate
results = trainer.evaluate()
print(f"Evaluation results: {results}")
```

---

## Complete Example: Explore Multiple Pipelines

```python
"""
Hugging Face Pipelines Explorer
Demonstrates various NLP tasks using the pipeline API.
"""

from transformers import pipeline
import json

def explore_pipelines():
    """Run multiple NLP pipelines on sample inputs."""
    
    # === 1. Sentiment Analysis ===
    print("=" * 60)
    print("1. SENTIMENT ANALYSIS")
    print("=" * 60)
    
    sentiment = pipeline("sentiment-analysis")
    texts = [
        "I absolutely love this product!",
        "This is the worst experience ever.",
        "It's okay, nothing special.",
    ]
    for text in texts:
        result = sentiment(text)[0]
        print(f"  '{text}'")
        print(f"  → {result['label']} ({result['score']:.4f})\n")
    
    # === 2. Named Entity Recognition ===
    print("=" * 60)
    print("2. NAMED ENTITY RECOGNITION")
    print("=" * 60)
    
    ner = pipeline("ner", grouped_entities=True)
    text = "Apple CEO Tim Cook announced the new iPhone in San Francisco."
    entities = ner(text)
    print(f"  Text: '{text}'")
    for entity in entities:
        print(f"  → {entity['word']}: {entity['entity_group']} "
              f"(confidence: {entity['score']:.4f})")
    print()
    
    # === 3. Question Answering ===
    print("=" * 60)
    print("3. QUESTION ANSWERING")
    print("=" * 60)
    
    qa = pipeline("question-answering")
    context = """
    Python was created by Guido van Rossum and first released in 1991.
    It emphasizes code readability and supports multiple programming paradigms.
    Python is widely used in data science, web development, and AI.
    """
    questions = [
        "Who created Python?",
        "When was Python released?",
        "What is Python used for?",
    ]
    for question in questions:
        result = qa(question=question, context=context)
        print(f"  Q: {question}")
        print(f"  A: {result['answer']} (confidence: {result['score']:.4f})\n")
    
    # === 4. Text Summarization ===
    print("=" * 60)
    print("4. TEXT SUMMARIZATION")
    print("=" * 60)
    
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    article = """
    Machine learning is a subset of artificial intelligence that focuses on 
    building systems that learn from data. Unlike traditional programming where 
    rules are explicitly coded, machine learning algorithms identify patterns 
    in data and make decisions with minimal human intervention. The field has 
    seen tremendous growth in recent years, with applications ranging from 
    image recognition to natural language processing to autonomous vehicles.
    Deep learning, a subset of machine learning using neural networks with 
    many layers, has been particularly successful in handling complex tasks.
    """
    summary = summarizer(article, max_length=60, min_length=20)[0]
    print(f"  Original ({len(article.split())} words):")
    print(f"  {article.strip()[:100]}...")
    print(f"\n  Summary ({len(summary['summary_text'].split())} words):")
    print(f"  {summary['summary_text']}\n")
    
    # === 5. Text Generation ===
    print("=" * 60)
    print("5. TEXT GENERATION")
    print("=" * 60)
    
    generator = pipeline("text-generation", model="gpt2")
    prompts = [
        "The secret to happiness is",
        "In the year 2050, robots will",
    ]
    for prompt in prompts:
        result = generator(prompt, max_length=40, num_return_sequences=1,
                          do_sample=True, temperature=0.8)
        print(f"  Prompt: '{prompt}'")
        print(f"  Generated: '{result[0]['generated_text']}'\n")
    
    # === 6. Zero-Shot Classification ===
    print("=" * 60)
    print("6. ZERO-SHOT CLASSIFICATION")
    print("=" * 60)
    
    zero_shot = pipeline("zero-shot-classification")
    text = "The stock market crashed after the Federal Reserve raised interest rates."
    labels = ["politics", "finance", "sports", "technology", "health"]
    
    result = zero_shot(text, candidate_labels=labels)
    print(f"  Text: '{text}'")
    print(f"  Labels & scores:")
    for label, score in zip(result["labels"], result["scores"]):
        bar = "█" * int(score * 30)
        print(f"    {label:12s} {score:.4f} {bar}")
    print()
    
    # === 7. Fill-Mask (BERT's specialty) ===
    print("=" * 60)
    print("7. FILL-MASK")
    print("=" * 60)
    
    fill_mask = pipeline("fill-mask", model="bert-base-uncased")
    masked_text = "Python is a [MASK] programming language."
    results = fill_mask(masked_text)
    print(f"  Input: '{masked_text}'")
    print(f"  Top predictions:")
    for r in results[:5]:
        print(f"    '{r['token_str']}' — score: {r['score']:.4f}")


if __name__ == "__main__":
    explore_pipelines()
```

---

## Summary

| Component | Purpose | Key Function |
|-----------|---------|--------------|
| `pipeline()` | Easiest API for inference | One-line NLP tasks |
| `AutoTokenizer` | Text → token IDs | `from_pretrained()` |
| `AutoModel` | Load any pre-trained model | `from_pretrained()` |
| `datasets` | Load & process datasets | `load_dataset()` |
| `Trainer` | Full training loop | `trainer.train()` |
| Model Hub | Browse/share models | huggingface.co/models |

---

## Next Steps

Next, we'll dive deep into **Fine-Tuning Pre-trained Models** — building a complete fine-tuning pipeline from scratch.
