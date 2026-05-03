---
title: GPT Family
---

# GPT Family

The **GPT** (Generative Pre-trained Transformer) family from OpenAI represents one of the most influential series of language models ever created.

GPT models are **autoregressive**, meaning they generate text one token at a time, always looking left-to-right.

---

## What is GPT?

GPT stands for:

| Letter | Meaning |
|--------|---------|
| **G** | Generative — it generates new text |
| **P** | Pre-trained — trained on massive data before fine-tuning |
| **T** | Transformer — uses the transformer architecture |

Unlike BERT (which is bidirectional), GPT only looks at **previous tokens** to predict the next one.

---

## GPT Architecture: Decoder-Only Transformer

GPT uses only the **decoder** part of the original transformer architecture.

```
Input: "The cat sat on the"

GPT Decoder Stack:
┌─────────────────────────────┐
│  Token + Position Embedding │
├─────────────────────────────┤
│  Masked Self-Attention      │  ← Can only look LEFT
│  Feed-Forward Network       │
│  Layer Norm + Residual      │
├─────────────────────────────┤
│  ... (N layers) ...         │
├─────────────────────────────┤
│  Linear + Softmax           │
└─────────────────────────────┘
Output: probability distribution over vocabulary
        → "mat" (highest probability)
```

### Key Components

1. **Masked Self-Attention**: Each token can only attend to tokens **before** it (and itself)
2. **Feed-Forward Network**: Processes each position independently
3. **Layer Normalization**: Stabilizes training
4. **Residual Connections**: Helps gradient flow

---

## GPT vs BERT: Key Differences

| Feature | GPT | BERT |
|---------|-----|------|
| Architecture | Decoder-only | Encoder-only |
| Attention | Left-to-right (causal) | Bidirectional |
| Pre-training | Next token prediction | Masked LM + NSP |
| Best for | Text generation | Understanding/classification |
| Direction | Autoregressive | Non-autoregressive |

The attention mask in GPT ensures each position $i$ can only attend to positions $j \leq i$:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V$$

Where $M$ is the causal mask:

$$M_{ij} = \begin{cases} 0 & \text{if } j \leq i \\ -\infty & \text{if } j > i \end{cases}$$

---

## The GPT Scaling Timeline

### GPT-1 (2018)

- **Parameters**: 117 million
- **Training data**: BookCorpus (~5GB of text)
- **Layers**: 12 transformer blocks
- **Key contribution**: Showed that generative pre-training + fine-tuning works

```
GPT-1 Approach:
1. Pre-train on unlabeled text (generative)
2. Fine-tune on specific tasks with labeled data
```

### GPT-2 (2019)

- **Parameters**: 1.5 billion (largest variant)
- **Training data**: WebText (~40GB from Reddit links)
- **Layers**: 48 transformer blocks
- **Key contribution**: Zero-shot task performance without fine-tuning

OpenAI initially withheld the full model due to misuse concerns — this sparked debate about AI safety.

### GPT-3 (2020)

- **Parameters**: 175 billion
- **Training data**: ~570GB (Common Crawl, books, Wikipedia)
- **Layers**: 96 transformer blocks
- **Key contribution**: Few-shot learning via prompting (no fine-tuning needed)

The jump from GPT-2 to GPT-3:

$$\text{Scale factor} = \frac{175\text{B}}{1.5\text{B}} \approx 117\times$$

### GPT-4 (2023)

- **Parameters**: Not officially disclosed (estimated 1+ trillion)
- **Training data**: Undisclosed
- **Key contribution**: Multimodal (text + images), improved reasoning
- **Architecture**: Rumored Mixture of Experts (MoE)

---

## Pre-training: Next Token Prediction

GPT models are pre-trained with a simple objective — predict the next token:

$$\mathcal{L} = -\sum_{i=1}^{n} \log P(x_i \mid x_1, x_2, \ldots, x_{i-1}; \theta)$$

This means: for each position, maximize the probability of the correct next token given all previous tokens.

```python
# Conceptual training loop for GPT
# Input:  "The cat sat on"
# Target: "cat sat on the"  (shifted by 1)

import torch
import torch.nn as nn

# Simplified next-token prediction
def compute_loss(model, input_ids):
    # input_ids shape: (batch_size, sequence_length)
    
    # Shift: input is all tokens except last
    inputs = input_ids[:, :-1]
    # Target is all tokens except first
    targets = input_ids[:, 1:]
    
    # Get model predictions
    logits = model(inputs)  # (batch, seq_len-1, vocab_size)
    
    # Cross-entropy loss
    loss_fn = nn.CrossEntropyLoss()
    loss = loss_fn(
        logits.view(-1, logits.size(-1)),
        targets.view(-1)
    )
    return loss
```

---

## Few-Shot, One-Shot, Zero-Shot Learning

GPT-3 introduced a new paradigm: **in-context learning** without parameter updates.

### Zero-Shot

Give the model a task description only:

```
Translate English to French:
cheese →
```

### One-Shot

Give one example:

```
Translate English to French:
hello → bonjour
cheese →
```

### Few-Shot

Give a few examples:

```
Translate English to French:
hello → bonjour
goodbye → au revoir
thank you → merci
cheese →
```

The model learns the pattern from examples **without updating its weights**.

```python
# Few-shot prompting with GPT
prompt = """Classify the sentiment as positive or negative.

Review: "This movie was absolutely wonderful!"
Sentiment: positive

Review: "Terrible acting and boring plot."
Sentiment: negative

Review: "I loved every minute of this film."
Sentiment: positive

Review: "The food was cold and the service was slow."
Sentiment:"""

# GPT completes: " negative"
```

---

## Emergent Abilities at Scale

As models scale up, they develop abilities that smaller models don't have. These are called **emergent abilities**.

```
Model Size vs. Abilities:
──────────────────────────────────────────
Small (< 1B):     Basic text completion
Medium (1-10B):   Simple Q&A, summarization
Large (10-100B):  Few-shot learning, basic reasoning
Very Large (100B+): Chain-of-thought, code generation,
                    arithmetic, multilingual transfer
──────────────────────────────────────────
```

Examples of emergent abilities:

- **Chain-of-thought reasoning**: Breaking problems into steps
- **Code generation**: Writing functional programs from descriptions
- **Mathematical reasoning**: Solving word problems
- **Instruction following**: Performing novel tasks from instructions

The scaling law (Kaplan et al., 2020):

$$L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}$$

Where $L$ is loss, $N$ is parameter count, and $\alpha_N \approx 0.076$.

---

## GPT-2 with Hugging Face: Text Generation

Let's use GPT-2 for text generation:

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

# Load pre-trained GPT-2
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.eval()

# Encode input text
prompt = "Artificial intelligence will"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

print(f"Prompt: {prompt}")
print(f"Input token IDs: {input_ids[0].tolist()}")
print(f"Tokens: {tokenizer.convert_ids_to_tokens(input_ids[0])}")

# Generate text
with torch.no_grad():
    output = model.generate(
        input_ids,
        max_length=100,
        num_return_sequences=1,
        temperature=0.8,
        top_k=50,
        top_p=0.95,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

# Decode and print
generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
print(f"\nGenerated text:\n{generated_text}")
```

### Generation Strategies

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.eval()

prompt = "The future of technology is"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

# Strategy 1: Greedy (always pick highest probability)
greedy_output = model.generate(
    input_ids, max_length=50, do_sample=False
)
print("Greedy:", tokenizer.decode(greedy_output[0], skip_special_tokens=True))

# Strategy 2: Beam Search (explore multiple paths)
beam_output = model.generate(
    input_ids, max_length=50, num_beams=5,
    no_repeat_ngram_size=2, early_stopping=True
)
print("Beam:", tokenizer.decode(beam_output[0], skip_special_tokens=True))

# Strategy 3: Top-K Sampling (sample from top K tokens)
topk_output = model.generate(
    input_ids, max_length=50, do_sample=True,
    top_k=50, temperature=0.9
)
print("Top-K:", tokenizer.decode(topk_output[0], skip_special_tokens=True))

# Strategy 4: Nucleus (Top-P) Sampling
topp_output = model.generate(
    input_ids, max_length=50, do_sample=True,
    top_p=0.92, temperature=0.9
)
print("Top-P:", tokenizer.decode(topp_output[0], skip_special_tokens=True))
```

### Temperature Effect

Temperature controls randomness in generation:

$$P(x_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

| Temperature | Effect |
|-------------|--------|
| $T < 1$ | More focused, repetitive |
| $T = 1$ | Default distribution |
| $T > 1$ | More random, creative |

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

prompt = "Once upon a time"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

# Compare different temperatures
temperatures = [0.3, 0.7, 1.0, 1.5]
for temp in temperatures:
    output = model.generate(
        input_ids, max_length=40,
        do_sample=True, temperature=temp,
        pad_token_id=tokenizer.eos_token_id
    )
    text = tokenizer.decode(output[0], skip_special_tokens=True)
    print(f"Temperature {temp}: {text}\n")
```

---

## Ethical Concerns

GPT models raise significant ethical issues:

### 1. Misinformation
- Can generate convincing fake news articles
- Produces plausible but incorrect information ("hallucinations")

### 2. Deepfakes & Impersonation
- Can mimic writing styles
- Generate fake social media posts

### 3. Bias Amplification
- Training data contains societal biases
- Model reproduces and amplifies these biases

### 4. Environmental Cost

$$\text{GPT-3 training} \approx 1,287 \text{ MWh} \approx 552 \text{ tons CO}_2$$

### 5. Misuse Potential
- Automated spam and phishing
- Academic dishonesty
- Social engineering at scale

---

## Complete Code Example

```python
"""
GPT-2 Text Generation Demo
Demonstrates various generation techniques with GPT-2
"""

from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

def generate_text(prompt, strategy="top_p", max_length=100):
    """Generate text using GPT-2 with different strategies."""
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    model.eval()
    
    input_ids = tokenizer.encode(prompt, return_tensors="pt")
    
    generation_params = {
        "greedy": {
            "do_sample": False
        },
        "beam_search": {
            "num_beams": 5,
            "no_repeat_ngram_size": 2,
            "early_stopping": True
        },
        "top_k": {
            "do_sample": True,
            "top_k": 50,
            "temperature": 0.8
        },
        "top_p": {
            "do_sample": True,
            "top_p": 0.92,
            "temperature": 0.8
        }
    }
    
    params = generation_params.get(strategy, generation_params["top_p"])
    
    with torch.no_grad():
        output = model.generate(
            input_ids,
            max_length=max_length,
            pad_token_id=tokenizer.eos_token_id,
            **params
        )
    
    return tokenizer.decode(output[0], skip_special_tokens=True)


# Interactive story generation
def interactive_story():
    """Generate a story with multiple continuations."""
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    model.eval()
    
    story = "In a world where AI had become sentient,"
    print(f"Starting: {story}\n")
    
    for i in range(3):
        input_ids = tokenizer.encode(story, return_tensors="pt")
        
        with torch.no_grad():
            output = model.generate(
                input_ids,
                max_length=len(input_ids[0]) + 30,
                do_sample=True,
                top_p=0.9,
                temperature=0.8,
                pad_token_id=tokenizer.eos_token_id
            )
        
        story = tokenizer.decode(output[0], skip_special_tokens=True)
        print(f"Part {i + 1}: {story}\n")
    
    return story


if __name__ == "__main__":
    # Basic generation
    prompts = [
        "The meaning of life is",
        "In 2050, humans will",
        "The best programming language is",
    ]
    
    for prompt in prompts:
        result = generate_text(prompt, strategy="top_p", max_length=60)
        print(f"Prompt: {prompt}")
        print(f"Output: {result}\n")
    
    # Story generation
    print("=" * 50)
    print("Interactive Story:")
    print("=" * 50)
    interactive_story()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| GPT Architecture | Decoder-only, autoregressive transformer |
| Pre-training | Next token prediction (causal LM) |
| Scaling | GPT-1 (117M) → GPT-4 (1T+ estimated) |
| In-context learning | Zero/one/few-shot without fine-tuning |
| Emergent abilities | New capabilities appear at scale |
| Generation | Greedy, beam search, top-k, top-p sampling |
| Ethics | Bias, misinformation, environmental cost |

---

## Next Steps

Next, we'll explore **Transfer Learning for NLP** — the paradigm that made models like GPT possible.
