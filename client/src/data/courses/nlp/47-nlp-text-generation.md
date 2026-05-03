---
title: Text Generation
---

# Text Generation

**Text generation** is the task of producing coherent, contextually relevant text. Modern LLMs generate text one token at a time using **autoregressive** methods.

---

## How Autoregressive Generation Works

An autoregressive model predicts the **next token** given all previous tokens:

$$P(x_1, x_2, \ldots, x_T) = \prod_{t=1}^{T} P(x_t \mid x_1, \ldots, x_{t-1})$$

At each step:
1. The model takes the current sequence as input
2. Produces a probability distribution over the vocabulary
3. Selects the next token using a **decoding strategy**
4. Appends that token to the sequence
5. Repeats until a stop condition is met

```python
# Conceptual autoregressive loop
def generate(model, prompt_tokens, max_length):
    tokens = prompt_tokens.copy()

    for _ in range(max_length):
        # Get probability distribution for next token
        logits = model(tokens)
        next_token_probs = softmax(logits[-1])

        # Select next token (decoding strategy goes here)
        next_token = select_token(next_token_probs)

        # Stop if end-of-sequence token
        if next_token == EOS_TOKEN:
            break

        tokens.append(next_token)

    return tokens
```

---

## Decoding Strategy: Greedy Search

**Greedy decoding** always picks the token with the highest probability at each step.

$$x_t = \arg\max_{x} P(x \mid x_1, \ldots, x_{t-1})$$

### Pros and Cons

| Pros | Cons |
|------|------|
| Fast — single computation per step | Often produces repetitive text |
| Deterministic — same input → same output | Misses globally optimal sequences |
| Simple to implement | Tends to be boring and generic |

### Example

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

input_text = "The future of artificial intelligence"
input_ids = tokenizer.encode(input_text, return_tensors="pt")

# Greedy decoding
output = model.generate(
    input_ids,
    max_length=50,
    do_sample=False  # Greedy (no sampling)
)

print(tokenizer.decode(output[0], skip_special_tokens=True))
```

### The Problem with Greedy

Consider: "The cat sat on the ___"

- Greedy picks "mat" (highest probability)
- But "mat" might lead to a dead-end sequence
- A slightly less probable word like "windowsill" could lead to a much better overall sentence

---

## Decoding Strategy: Beam Search

**Beam search** maintains multiple candidate sequences (beams) simultaneously, keeping the top-$k$ most probable at each step.

### How It Works

1. Start with the prompt
2. At each step, expand each beam by all possible next tokens
3. Keep only the top-$k$ sequences by total log-probability
4. Continue until all beams produce an end token

$$\text{score}(y_1, \ldots, y_t) = \sum_{i=1}^{t} \log P(y_i \mid y_1, \ldots, y_{i-1})$$

### Length Normalization

Beam search favors shorter sequences (fewer terms in the sum). Fix with length penalty:

$$\text{score\_normalized} = \frac{1}{t^\alpha} \sum_{i=1}^{t} \log P(y_i \mid y_{<i})$$

Where $\alpha$ controls the penalty strength (typically 0.6–1.0).

```python
# Beam search with 5 beams
output = model.generate(
    input_ids,
    max_length=50,
    num_beams=5,
    early_stopping=True,
    no_repeat_ngram_size=2,  # Prevent repetition
    length_penalty=0.8,
)

print(tokenizer.decode(output[0], skip_special_tokens=True))
```

### Beam Search Properties

| Parameter | Effect |
|-----------|--------|
| `num_beams=1` | Same as greedy |
| `num_beams=5` | Good balance of quality and speed |
| `num_beams=20` | Higher quality but much slower |
| `no_repeat_ngram_size=2` | Prevents bigram repetition |

---

## Decoding Strategy: Random Sampling

**Sampling** randomly selects the next token from the probability distribution, introducing diversity:

$$x_t \sim P(x \mid x_1, \ldots, x_{t-1})$$

```python
# Pure random sampling
output = model.generate(
    input_ids,
    max_length=50,
    do_sample=True,
    top_k=0,   # Consider all tokens
    top_p=1.0, # No nucleus filtering
)

print(tokenizer.decode(output[0], skip_special_tokens=True))
```

### The Problem with Pure Sampling

Pure sampling can select very unlikely tokens, leading to incoherent text. If a token has probability 0.001, it might still get picked, derailing the generation.

---

## Decoding Strategy: Top-k Sampling

**Top-k sampling** restricts the selection to the $k$ most probable tokens, then redistributes probability among them.

### Algorithm

1. Compute probability distribution over vocabulary
2. Sort tokens by probability
3. Keep only the top $k$ tokens
4. Set probabilities of all other tokens to 0
5. Renormalize the remaining probabilities
6. Sample from this filtered distribution

$$P'(x_i) = \begin{cases} \frac{P(x_i)}{\sum_{j \in \text{top-k}} P(x_j)} & \text{if } x_i \in \text{top-k} \\ 0 & \text{otherwise} \end{cases}$$

```python
# Top-k sampling with k=50
output = model.generate(
    input_ids,
    max_length=50,
    do_sample=True,
    top_k=50,
)

print(tokenizer.decode(output[0], skip_special_tokens=True))
```

### Choosing k

| k value | Behavior |
|---------|----------|
| 1 | Same as greedy (deterministic) |
| 10 | Very focused, consistent |
| 50 | Good balance (common default) |
| 100 | More diverse |
| Vocab size | Same as pure sampling |

### Limitation

Top-k uses a fixed number regardless of the distribution shape. If the model is very confident (one token has 95% probability), $k=50$ still allows 49 unlikely tokens.

---

## Decoding Strategy: Top-p (Nucleus) Sampling

**Top-p sampling** (also called **nucleus sampling**) dynamically selects the smallest set of tokens whose cumulative probability exceeds a threshold $p$.

### Algorithm

1. Sort tokens by probability in descending order
2. Compute cumulative probabilities
3. Find the smallest set where cumulative probability $\geq p$
4. Zero out everything else
5. Renormalize and sample

$$V_p = \min \left\{ V' \subseteq V : \sum_{x \in V'} P(x) \geq p \right\}$$

```python
# Top-p (nucleus) sampling with p=0.9
output = model.generate(
    input_ids,
    max_length=50,
    do_sample=True,
    top_p=0.9,
    top_k=0,  # Disable top-k to use only top-p
)

print(tokenizer.decode(output[0], skip_special_tokens=True))
```

### Why Top-p is Better than Top-k

Consider two scenarios:

**Scenario A:** Model is confident
- Token "the": 90%, "a": 5%, "an": 3%, others: 2%
- Top-p=0.9 → selects just 1 token ("the")
- Top-k=50 → selects 50 tokens including very unlikely ones

**Scenario B:** Model is uncertain
- Top 20 tokens each have ~5% probability
- Top-p=0.9 → selects ~18 tokens
- Top-k=5 → only allows 5, missing good options

Top-p **adapts** to the model's confidence at each step.

### Combining Top-k and Top-p

You can use both together — first filter by top-k, then by top-p:

```python
output = model.generate(
    input_ids,
    max_length=50,
    do_sample=True,
    top_k=50,
    top_p=0.92,
    temperature=0.8,
)
```

---

## Temperature

**Temperature** ($T$) scales the logits before softmax, controlling the "sharpness" of the distribution:

$$P(x_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

| Temperature | Effect |
|-------------|--------|
| $T \to 0$ | Approaches greedy (argmax) |
| $T = 1.0$ | Original distribution (default) |
| $T > 1.0$ | Flatter distribution (more random) |

### Visualization

```python
import numpy as np

def apply_temperature(logits, temperature):
    """Apply temperature scaling to logits."""
    scaled = logits / temperature
    exp_scaled = np.exp(scaled - np.max(scaled))  # Numerical stability
    return exp_scaled / exp_scaled.sum()

# Example logits for 5 tokens
logits = np.array([2.0, 1.5, 1.0, 0.5, 0.1])

print("T=0.5 (focused):", apply_temperature(logits, 0.5).round(3))
print("T=1.0 (default):", apply_temperature(logits, 1.0).round(3))
print("T=2.0 (diverse):", apply_temperature(logits, 2.0).round(3))
```

Output:
```
T=0.5 (focused): [0.576 0.285 0.095 0.032 0.012]
T=1.0 (default): [0.378 0.230 0.139 0.084 0.057]
T=2.0 (diverse): [0.275 0.238 0.186 0.164 0.137]
```

---

## Repetition Penalty

Language models often get stuck in loops. **Repetition penalty** reduces the probability of tokens that have already appeared:

$$\text{score}(x_i) = \begin{cases} z_i / \theta & \text{if } x_i \in \text{generated tokens and } z_i > 0 \\ z_i \times \theta & \text{if } x_i \in \text{generated tokens and } z_i < 0 \end{cases}$$

Where $\theta > 1$ is the penalty factor.

```python
# With repetition penalty
output = model.generate(
    input_ids,
    max_length=100,
    do_sample=True,
    top_p=0.92,
    temperature=0.8,
    repetition_penalty=1.2,  # Penalize repeated tokens
)
```

### Other Anti-Repetition Techniques

```python
output = model.generate(
    input_ids,
    max_length=100,
    do_sample=True,
    no_repeat_ngram_size=3,    # No 3-gram can repeat
    repetition_penalty=1.2,    # Reduce probability of seen tokens
    encoder_repetition_penalty=1.0,  # Penalty for input tokens
)
```

---

## Controlling Generation

### Max Length and Stop Tokens

```python
from transformers import StoppingCriteria, StoppingCriteriaList

# Simple max length
output = model.generate(input_ids, max_new_tokens=100)

# Custom stopping criteria
class StopOnNewline(StoppingCriteria):
    def __init__(self, tokenizer):
        self.newline_id = tokenizer.encode("\n")[0]

    def __call__(self, input_ids, scores, **kwargs):
        return input_ids[0, -1] == self.newline_id

stopping = StoppingCriteriaList([StopOnNewline(tokenizer)])
output = model.generate(
    input_ids,
    max_new_tokens=200,
    stopping_criteria=stopping,
)
```

### Common Control Parameters

| Parameter | Purpose | Typical Value |
|-----------|---------|---------------|
| `max_new_tokens` | Maximum tokens to generate | 50–2000 |
| `min_length` | Minimum output length | 10–50 |
| `eos_token_id` | Token ID that stops generation | Model-specific |
| `pad_token_id` | Padding token for batched generation | Model-specific |
| `forced_eos_token_id` | Force EOS at max_length | Model-specific |

---

## Comparison of Strategies

| Strategy | Quality | Diversity | Speed | Use Case |
|----------|---------|-----------|-------|----------|
| Greedy | Medium | None | Fast | Factual tasks |
| Beam Search | High | Low | Slow | Translation, summarization |
| Top-k | Good | Medium | Fast | Creative writing |
| Top-p | Good | Medium | Fast | General generation |
| Temperature + Top-p | Good | Tunable | Fast | Most applications |

---

## Code: Full Text Generation Pipeline

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model
model_name = "gpt2-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Set pad token (GPT-2 doesn't have one by default)
tokenizer.pad_token = tokenizer.eos_token

def generate_text(prompt, strategy="top_p", **kwargs):
    """Generate text with different decoding strategies."""
    input_ids = tokenizer.encode(prompt, return_tensors="pt")

    # Default parameters
    params = {
        "max_new_tokens": 100,
        "pad_token_id": tokenizer.eos_token_id,
    }

    if strategy == "greedy":
        params["do_sample"] = False

    elif strategy == "beam_search":
        params["do_sample"] = False
        params["num_beams"] = kwargs.get("num_beams", 5)
        params["no_repeat_ngram_size"] = 2
        params["length_penalty"] = kwargs.get("length_penalty", 0.8)
        params["early_stopping"] = True

    elif strategy == "top_k":
        params["do_sample"] = True
        params["top_k"] = kwargs.get("top_k", 50)
        params["temperature"] = kwargs.get("temperature", 0.8)

    elif strategy == "top_p":
        params["do_sample"] = True
        params["top_p"] = kwargs.get("top_p", 0.92)
        params["top_k"] = 0
        params["temperature"] = kwargs.get("temperature", 0.8)

    elif strategy == "combined":
        params["do_sample"] = True
        params["top_k"] = kwargs.get("top_k", 50)
        params["top_p"] = kwargs.get("top_p", 0.92)
        params["temperature"] = kwargs.get("temperature", 0.7)
        params["repetition_penalty"] = kwargs.get("repetition_penalty", 1.2)

    output = model.generate(input_ids, **params)
    generated = tokenizer.decode(output[0], skip_special_tokens=True)
    return generated

# --- Compare strategies ---
prompt = "In the year 2050, humanity discovered"

print("=== Greedy ===")
print(generate_text(prompt, strategy="greedy"))
print()

print("=== Beam Search (5 beams) ===")
print(generate_text(prompt, strategy="beam_search"))
print()

print("=== Top-k (k=50) ===")
print(generate_text(prompt, strategy="top_k"))
print()

print("=== Top-p (p=0.92) ===")
print(generate_text(prompt, strategy="top_p"))
print()

print("=== Combined (best practice) ===")
print(generate_text(prompt, strategy="combined"))
```

---

## Code: Batch Generation and Streaming

```python
from transformers import TextStreamer, TextIteratorStreamer
from threading import Thread

# --- Streaming generation (print tokens as they're generated) ---
streamer = TextStreamer(tokenizer, skip_special_tokens=True)

input_ids = tokenizer.encode(
    "Once upon a time in a land far away,",
    return_tensors="pt"
)

print("Streaming output:")
model.generate(
    input_ids,
    max_new_tokens=100,
    do_sample=True,
    top_p=0.92,
    temperature=0.8,
    streamer=streamer,
)

# --- Batch generation (multiple prompts at once) ---
prompts = [
    "The secret to happiness is",
    "Scientists recently discovered that",
    "The best programming language is",
]

tokenizer.padding_side = "left"
inputs = tokenizer(prompts, return_tensors="pt", padding=True)

outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    do_sample=True,
    top_p=0.92,
    temperature=0.7,
    pad_token_id=tokenizer.eos_token_id,
)

print("\nBatch results:")
for i, output in enumerate(outputs):
    text = tokenizer.decode(output, skip_special_tokens=True)
    print(f"\n[{i+1}] {text}")
```

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Autoregressive | Generate one token at a time, left to right |
| Greedy | Always pick highest probability |
| Beam Search | Track multiple candidate sequences |
| Top-k | Sample from top k tokens |
| Top-p (Nucleus) | Sample from smallest set exceeding probability p |
| Temperature | Scale logits to control randomness |
| Repetition Penalty | Reduce probability of already-generated tokens |

### Recommended Defaults

For most applications:
```python
params = {
    "do_sample": True,
    "top_p": 0.92,
    "temperature": 0.7,
    "repetition_penalty": 1.1,
    "max_new_tokens": 256,
}
```

---

## Next Steps

Continue your NLP journey with:
- **Machine Translation** — encoder-decoder generation for translation
- **Text Summarization** — applying generation techniques to summarization
- **Question Answering** — generating answers from context
