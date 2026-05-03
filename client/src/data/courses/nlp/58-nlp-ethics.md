---
title: Ethics & Bias in NLP
---

# Ethics & Bias in NLP

NLP models learn from human-generated text — and humans are biased. If the training data contains stereotypes, the model will reproduce and even amplify them. Building **fair, responsible, and transparent** NLP systems is not optional — it's essential.

---

## Bias in Training Data

### Where Does Bias Come From?

| Source | Example |
|--------|---------|
| **Historical text** | Older documents reflect outdated social norms |
| **Internet crawls** | Reddit, Twitter contain toxic and biased content |
| **Underrepresentation** | Minority languages and dialects have fewer samples |
| **Selection bias** | Data skewed toward English-speaking, Western cultures |
| **Label bias** | Annotators bring their own biases to labeling |

### The Data Reflects Society

If a model trains on news articles where "CEO" appears mostly with male pronouns and "nurse" appears mostly with female pronouns, the model learns those associations as if they were facts.

```python
# Demonstrating word co-occurrence bias (simplified)
corpus = [
    "The CEO announced his new strategy.",
    "The CEO presented his quarterly results.",
    "The nurse checked her patient records.",
    "The nurse updated her shift schedule.",
    "The CEO made his decision.",
    "The nurse completed her rounds.",
]

male_ceo = sum(1 for s in corpus if "CEO" in s and "his" in s)
female_nurse = sum(1 for s in corpus if "nurse" in s and "her" in s)

print(f"CEO + 'his':    {male_ceo}/{sum(1 for s in corpus if 'CEO' in s)}")
print(f"Nurse + 'her':  {female_nurse}/{sum(1 for s in corpus if 'nurse' in s)}")
```

**Output:**
```
CEO + 'his':    3/3
Nurse + 'her':  3/3
```

> The model "learns" that CEOs are male and nurses are female — not because it's true, but because the data says so.

---

## Gender Bias in Word Embeddings

One of the most famous demonstrations of bias in NLP comes from **word embeddings**.

### The Analogy Problem

Word2Vec and GloVe learn relationships like:

$$\text{king} - \text{man} + \text{woman} \approx \text{queen}$$

But they also learn:

$$\text{doctor} - \text{man} + \text{woman} \approx \text{nurse}$$

$$\text{computer\_programmer} - \text{man} + \text{woman} \approx \text{homemaker}$$

These reflect **societal stereotypes**, not facts.

### Measuring Gender Bias

We can measure bias by computing the **cosine similarity** between gendered words and profession words:

```python
import gensim.downloader as api
import numpy as np

# Load pre-trained GloVe embeddings
model = api.load("glove-wiki-gigaword-100")

def gender_bias_score(word, model):
    """Measure gender direction: positive = male bias, negative = female bias."""
    gender_direction = model["he"] - model["she"]
    word_vector = model[word]
    # Project onto gender direction
    score = np.dot(word_vector, gender_direction) / (
        np.linalg.norm(word_vector) * np.linalg.norm(gender_direction)
    )
    return score

professions = [
    "doctor", "nurse", "engineer", "teacher",
    "programmer", "receptionist", "scientist", "secretary",
    "CEO", "homemaker", "mathematician", "librarian",
]

print(f"{'Profession':<16} {'Bias Score':>10}  Direction")
print("-" * 45)
for prof in professions:
    if prof.lower() in model:
        score = gender_bias_score(prof.lower(), model)
        direction = "← female" if score < 0 else "male →"
        bar = "█" * int(abs(score) * 40)
        print(f"{prof:<16} {score:>+10.4f}  {direction} {bar}")
```

**Output (approximate):**
```
Profession        Bias Score  Direction
---------------------------------------------
doctor             +0.1312  male → █████
nurse              -0.1784  ← female ███████
engineer           +0.1521  male → ██████
teacher            -0.0876  ← female ███
programmer         +0.1198  male → ████
receptionist       -0.1645  ← female ██████
scientist          +0.0723  male → ██
secretary          -0.1432  ← female █████
CEO                +0.1876  male → ███████
homemaker          -0.2103  ← female ████████
mathematician      +0.1067  male → ████
librarian          -0.1289  ← female █████
```

---

## Racial and Cultural Bias

Bias extends far beyond gender.

### Examples in Language Models

| Bias Type | Example |
|-----------|---------|
| **Racial** | Associating Black names with negative sentiment |
| **Religious** | Linking "Muslim" with violence in text completions |
| **Cultural** | Assuming Western norms as default |
| **Dialectal** | Marking African American Vernacular English as "incorrect" |
| **Age** | Associating "elderly" with incompetence |

### Measuring with Prompts

```python
# Demonstrating bias in text generation (pseudocode with a real LLM)
from transformers import pipeline

generator = pipeline("text-generation", model="gpt2", max_new_tokens=20)

prompts = [
    "The Christian man walked into",
    "The Muslim man walked into",
    "The Jewish man walked into",
]

for prompt in prompts:
    result = generator(prompt, num_return_sequences=1, do_sample=True)
    print(f"Prompt: {prompt}")
    print(f"  → {result[0]['generated_text']}\n")
```

> **Note:** Results vary per run, but studies consistently show that certain demographic groups receive more negative or stereotypical completions.

---

## Fairness Metrics

How do we **quantify** whether a model treats different groups fairly?

### Demographic Parity

The model's positive prediction rate should be equal across groups:

$$P(\hat{Y}=1 \mid A=0) = P(\hat{Y}=1 \mid A=1)$$

Where $A$ is the protected attribute (e.g., gender, race).

### Equalized Odds

The model should have equal **true positive rates** AND **false positive rates** across groups:

$$P(\hat{Y}=1 \mid Y=1, A=0) = P(\hat{Y}=1 \mid Y=1, A=1)$$
$$P(\hat{Y}=1 \mid Y=0, A=0) = P(\hat{Y}=1 \mid Y=0, A=1)$$

### Equal Opportunity

A relaxed version — only requires equal **true positive rates**:

$$P(\hat{Y}=1 \mid Y=1, A=0) = P(\hat{Y}=1 \mid Y=1, A=1)$$

```python
import numpy as np

def demographic_parity(predictions, group_labels):
    """Check if positive prediction rates are equal across groups."""
    groups = np.unique(group_labels)
    rates = {}
    for g in groups:
        mask = group_labels == g
        rates[g] = predictions[mask].mean()
    return rates

def equalized_odds(predictions, true_labels, group_labels):
    """Check TPR and FPR across groups."""
    groups = np.unique(group_labels)
    result = {}
    for g in groups:
        mask = group_labels == g
        positives = true_labels[mask] == 1
        negatives = true_labels[mask] == 0
        tpr = predictions[mask][positives].mean() if positives.sum() > 0 else 0
        fpr = predictions[mask][negatives].mean() if negatives.sum() > 0 else 0
        result[g] = {"TPR": tpr, "FPR": fpr}
    return result

# Simulated toxicity detection results
np.random.seed(42)
n = 1000
groups = np.random.choice(["Group A", "Group B"], n)
true_toxic = np.random.binomial(1, 0.1, n)

# Biased model: higher false positive rate for Group B
predictions = true_toxic.copy()
bias_mask = (groups == "Group B") & (true_toxic == 0)
predictions[bias_mask] = np.random.binomial(1, 0.08, bias_mask.sum())

print("=== Demographic Parity ===")
dp = demographic_parity(predictions, groups)
for group, rate in dp.items():
    print(f"  {group}: P(Y=1) = {rate:.4f}")

print(f"\n  Parity gap: {abs(list(dp.values())[0] - list(dp.values())[1]):.4f}")

print("\n=== Equalized Odds ===")
eo = equalized_odds(predictions, true_toxic, groups)
for group, metrics in eo.items():
    print(f"  {group}: TPR={metrics['TPR']:.4f}, FPR={metrics['FPR']:.4f}")
```

---

## Toxicity Detection & Content Moderation

NLP powers content moderation — but the models themselves can be biased.

### Known Issues

- Models flag **African American Vernacular English** as more toxic
- **Reclaimed slurs** used within communities get flagged
- **Context blindness** — "I'll kill it at the presentation" flagged as violent
- **Adversarial attacks** — simple misspellings bypass filters

### Better Approaches

1. Use **context-aware** models (not just keyword lists)
2. Train on **diverse, balanced** toxicity datasets
3. Include **counter-speech** examples (non-toxic uses of flagged words)
4. Regularly **audit** across demographic groups

```python
from transformers import pipeline

toxicity = pipeline(
    "text-classification",
    model="unitary/toxic-bert",
)

texts = [
    "You are a wonderful person!",
    "I hate this product, it's terrible.",
    "This is an interesting approach to the problem.",
    "You are so stupid, I can't believe it.",
]

for text in texts:
    result = toxicity(text)[0]
    label = result["label"]
    score = result["score"]
    print(f"[{label:6s} {score:.3f}]  {text}")
```

**Output:**
```
[toxic  0.023]  You are a wonderful person!
[toxic  0.384]  I hate this product, it's terrible.
[toxic  0.012]  This is an interesting approach to the problem.
[toxic  0.967]  You are so stupid, I can't believe it.
```

---

## Privacy Concerns

### PII in Training Data

Large language models are trained on internet text that contains **Personally Identifiable Information** (PII):

- Names, emails, phone numbers
- Addresses, social security numbers
- Medical records, financial data

### Memorization Problem

Models can **memorize** and reproduce training data verbatim. Studies have extracted:

- Real email addresses from GPT-2
- Phone numbers from training data
- Code snippets with API keys

### Mitigation Strategies

| Strategy | Description |
|----------|-------------|
| **Data scrubbing** | Remove PII before training |
| **Differential privacy** | Add noise during training to prevent memorization |
| **Output filtering** | Detect and redact PII in model outputs |
| **Federated learning** | Train on data without centralizing it |
| **Right to be forgotten** | Allow users to request data removal |

```python
import re

def detect_pii(text):
    """Simple PII detection using regex patterns."""
    patterns = {
        "Email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "Phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
        "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
        "Credit Card": r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b",
    }

    findings = []
    for pii_type, pattern in patterns.items():
        matches = re.findall(pattern, text)
        for match in matches:
            findings.append({"type": pii_type, "value": match})
    return findings

def redact_pii(text):
    """Replace PII with redaction markers."""
    text = re.sub(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "[EMAIL REDACTED]", text
    )
    text = re.sub(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[PHONE REDACTED]", text)
    text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[SSN REDACTED]", text)
    return text

# Example
sample = "Contact John at john.doe@example.com or 555-123-4567. SSN: 123-45-6789."

print("Original:", sample)
print("\nPII Found:")
for item in detect_pii(sample):
    print(f"  {item['type']}: {item['value']}")
print("\nRedacted:", redact_pii(sample))
```

**Output:**
```
Original: Contact John at john.doe@example.com or 555-123-4567. SSN: 123-45-6789.

PII Found:
  Email: john.doe@example.com
  Phone: 555-123-4567
  SSN: 123-45-6789

Redacted: Contact John at [EMAIL REDACTED] or [PHONE REDACTED]. SSN: [SSN REDACTED].
```

---

## Environmental Impact

Training large language models has a significant **carbon footprint**.

### The Numbers

| Model | Parameters | Training CO₂ (tons) | Equivalent |
|-------|-----------|---------------------|------------|
| BERT-base | 110M | ~0.6 | 1 transatlantic flight |
| GPT-2 | 1.5B | ~2.9 | 5 transatlantic flights |
| GPT-3 | 175B | ~552 | 120 cars for a year |
| GPT-4 | ~1.8T (est.) | ~5,000+ (est.) | — |

### Reducing the Footprint

1. **Use smaller models** when possible — distilled models are often good enough
2. **Fine-tune** instead of training from scratch
3. **Use efficient architectures** (LoRA, adapters, quantization)
4. **Choose green data centers** powered by renewable energy
5. **Report carbon costs** in research papers

```python
# Estimating training cost (simplified)
def estimate_training_cost(
    gpu_hours,
    gpu_power_watts=300,
    pue=1.1,
    carbon_intensity_kg_per_kwh=0.429,  # US average
):
    """Estimate CO2 emissions from GPU training."""
    energy_kwh = (gpu_power_watts / 1000) * gpu_hours * pue
    carbon_kg = energy_kwh * carbon_intensity_kg_per_kwh
    return {
        "gpu_hours": gpu_hours,
        "energy_kwh": round(energy_kwh, 1),
        "carbon_kg": round(carbon_kg, 1),
        "equivalent_miles_driven": round(carbon_kg / 0.404 , 0),
    }

scenarios = [
    ("Fine-tune BERT", 8),
    ("Train small model", 500),
    ("Train GPT-2 size", 10_000),
    ("Train GPT-3 size", 3_500_000),
]

print(f"{'Scenario':<22} {'GPU-hrs':>10} {'kWh':>10} {'CO₂ (kg)':>10} {'Miles driven':>14}")
print("-" * 70)
for name, hours in scenarios:
    est = estimate_training_cost(hours)
    print(f"{name:<22} {est['gpu_hours']:>10,} {est['energy_kwh']:>10,.1f} "
          f"{est['carbon_kg']:>10,.1f} {est['equivalent_miles_driven']:>14,.0f}")
```

**Output:**
```
Scenario               GPU-hrs        kWh   CO₂ (kg)   Miles driven
----------------------------------------------------------------------
Fine-tune BERT               8        2.6        1.1              3
Train small model          500      165.0       70.8            175
Train GPT-2 size        10,000    3,300.0    1,415.7          3,504
Train GPT-3 size     3,500,000 1,155,000.0  495,495.0      1,226,473
```

---

## Mitigation Strategies

### Debiasing Word Embeddings

The classic approach by Bolukbasi et al. (2016) projects out the gender direction:

```python
import numpy as np

def debias_embedding(word_vector, gender_direction):
    """Remove the gender component from a word embedding."""
    projection = (
        np.dot(word_vector, gender_direction)
        / np.dot(gender_direction, gender_direction)
    ) * gender_direction
    debiased = word_vector - projection
    return debiased / np.linalg.norm(debiased)

# Simplified example with random vectors
np.random.seed(42)
dim = 100
gender_dir = np.random.randn(dim)
gender_dir = gender_dir / np.linalg.norm(gender_dir)

# Simulate a biased "nurse" embedding
nurse_biased = np.random.randn(dim)
nurse_biased = nurse_biased / np.linalg.norm(nurse_biased)

# Debias it
nurse_debiased = debias_embedding(nurse_biased, gender_dir)

bias_before = abs(np.dot(nurse_biased, gender_dir))
bias_after = abs(np.dot(nurse_debiased, gender_dir))

print(f"Gender bias before debiasing: {bias_before:.6f}")
print(f"Gender bias after debiasing:  {bias_after:.6f}")
print(f"Reduction: {(1 - bias_after / bias_before) * 100:.1f}%")
```

**Output:**
```
Gender bias before debiasing: 0.058435
Gender bias after debiasing:  0.000000
Reduction: 100.0%
```

### Other Mitigation Approaches

| Approach | When to Use |
|----------|-------------|
| **Diverse training data** | Before training — ensure representation |
| **Data augmentation** | Swap gendered terms to balance the data |
| **Adversarial training** | Train model to not predict protected attributes |
| **Post-hoc debiasing** | After training — modify embeddings |
| **Human-in-the-loop** | Deploy with human review for edge cases |
| **Red teaming** | Actively try to find biases before release |

---

## Responsible AI Guidelines

### Key Principles

1. **Transparency** — disclose that content is AI-generated
2. **Fairness** — test across demographic groups
3. **Accountability** — have a process for addressing harms
4. **Privacy** — minimize data collection, protect PII
5. **Safety** — prevent harmful outputs
6. **Inclusivity** — design for diverse users and languages

### Practical Checklist

- [ ] Audit training data for known biases
- [ ] Test model outputs across demographic groups
- [ ] Implement content filtering for harmful outputs
- [ ] Provide clear documentation of limitations
- [ ] Create a feedback mechanism for users
- [ ] Monitor deployed systems for emerging biases
- [ ] Conduct regular fairness audits
- [ ] Report environmental costs

---

## Summary

| Topic | Key Takeaway |
|-------|-------------|
| Data bias | Models inherit biases from training text |
| Gender bias | Embeddings encode stereotypes (doctor→male, nurse→female) |
| Racial bias | Language models associate minorities with negative traits |
| Fairness metrics | Demographic parity, equalized odds, equal opportunity |
| Toxicity | Content moderation models can themselves be biased |
| Privacy | LLMs memorize and can leak PII from training data |
| Environment | Training large models emits tons of CO₂ |
| Mitigation | Diverse data, debiasing, auditing, human review |

Building NLP systems without considering ethics is like building a bridge without considering who walks on it. **Everyone deserves fair, safe, and respectful AI.**

---
