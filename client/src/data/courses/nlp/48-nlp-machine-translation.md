---
title: Machine Translation
---

# Machine Translation

**Machine Translation (MT)** is the task of automatically translating text from one language to another. It's one of the oldest and most impactful NLP applications.

---

## History of Machine Translation

Machine translation has evolved through several paradigms:

| Era | Approach | Period |
|-----|----------|--------|
| 1st | Rule-Based MT (RBMT) | 1950s–1990s |
| 2nd | Statistical MT (SMT) | 1990s–2014 |
| 3rd | Neural MT (NMT) | 2014–present |
| 4th | Transformer-based MT | 2017–present |

### Rule-Based MT

Early systems used hand-crafted linguistic rules:
1. Parse source sentence
2. Apply transfer rules (source → target grammar)
3. Generate target sentence

**Problems:** Required linguists for every language pair, couldn't handle ambiguity well, produced stilted translations.

---

## Statistical Machine Translation

**Statistical MT** learns translation patterns from parallel corpora (aligned sentence pairs).

### Key Ideas

**Translation model:** $P(\text{target} \mid \text{source})$ — what's the probable translation?

**Language model:** $P(\text{target})$ — is the translation fluent?

**Decoding:** Find the target sentence that maximizes:

$$\hat{e} = \arg\max_e P(e \mid f) = \arg\max_e P(f \mid e) \cdot P(e)$$

Where $e$ is English (target) and $f$ is foreign (source).

### Phrase-Based SMT

Instead of translating word by word, phrase-based models translate chunks:

```
Source: "Das ist ein gutes Buch"
Phrases: "Das ist" → "This is"
         "ein gutes" → "a good"
         "Buch" → "book"
Target: "This is a good book"
```

**Components:**
- Phrase table (translation probabilities for phrase pairs)
- Reordering model (handles word order differences)
- Language model (ensures fluency)

**Limitations:** Could not capture long-range dependencies, required extensive feature engineering.

---

## Neural Machine Translation

**Neural MT** uses a single neural network to directly model $P(\text{target} \mid \text{source})$.

### Encoder-Decoder Architecture

The foundational NMT architecture:

1. **Encoder:** Reads the source sentence and produces a context representation
2. **Decoder:** Generates the target sentence token by token, conditioned on the encoder output

```python
# Conceptual encoder-decoder
class EncoderDecoder:
    def translate(self, source_sentence):
        # Encode source into hidden states
        encoder_output = self.encoder(source_sentence)

        # Decode target token by token
        target_tokens = []
        hidden = encoder_output

        while True:
            token, hidden = self.decoder(hidden, target_tokens)
            if token == "<EOS>":
                break
            target_tokens.append(token)

        return target_tokens
```

### Attention Mechanism

The **attention mechanism** solved the bottleneck of compressing the entire source into a fixed vector. At each decoding step, the model looks back at all source positions:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

This allows the decoder to focus on relevant parts of the source sentence:
- Translating a noun? Attend to the corresponding source noun
- Translating a verb? Attend to the source verb

---

## Transformer-Based MT

The **Transformer** (2017) replaced RNNs entirely with self-attention, becoming the state of the art for MT.

### Why Transformers Dominate MT

| Feature | RNN-based NMT | Transformer NMT |
|---------|---------------|-----------------|
| Parallelization | Sequential | Fully parallel |
| Long-range dependencies | Difficult | Easy (self-attention) |
| Training speed | Slow | Fast |
| Translation quality | Good | Excellent |

### Architecture for Translation

```
Source: "Le chat est sur le tapis"
        ↓
   [Encoder: 6 layers of self-attention]
        ↓
   Encoder representations
        ↓
   [Decoder: 6 layers of self-attention + cross-attention]
        ↓
Target: "The cat is on the mat"
```

### Multi-Head Attention in MT

Each attention head can learn different linguistic relationships:
- Head 1: Subject alignment
- Head 2: Verb alignment
- Head 3: Adjective-noun agreement
- Head 4: Positional relationships

---

## Pre-trained Translation Models

### MarianMT

**MarianMT** provides over 1,000 pre-trained translation models covering most language pairs:

```python
from transformers import MarianMTModel, MarianTokenizer

# English to French
model_name = "Helsinki-NLP/opus-mt-en-fr"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

text = "Machine translation has come a long way."
inputs = tokenizer(text, return_tensors="pt", padding=True)
translated = model.generate(**inputs)
result = tokenizer.decode(translated[0], skip_special_tokens=True)
print(f"French: {result}")
# Output: "La traduction automatique a fait beaucoup de chemin."
```

### M2M-100 (Many-to-Many)

**M2M-100** can translate between any pair of 100 languages without pivoting through English:

```python
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")

# Spanish to Japanese (no English pivot!)
text = "La inteligencia artificial es fascinante."
tokenizer.src_lang = "es"
inputs = tokenizer(text, return_tensors="pt")

generated = model.generate(
    **inputs,
    forced_bos_token_id=tokenizer.get_lang_id("ja")
)
result = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
print(f"Japanese: {result}")
```

### NLLB (No Language Left Behind)

**NLLB-200** by Meta supports 200 languages, including many low-resource ones:

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# English to Swahili
text = "Artificial intelligence is transforming the world."
tokenizer.src_lang = "eng_Latn"
inputs = tokenizer(text, return_tensors="pt")

translated = model.generate(
    **inputs,
    forced_bos_token_id=tokenizer.convert_tokens_to_ids("swh_Latn")
)
result = tokenizer.batch_decode(translated, skip_special_tokens=True)[0]
print(f"Swahili: {result}")
```

### Model Comparison

| Model | Languages | Size | Best For |
|-------|-----------|------|----------|
| MarianMT | 1,000+ pairs | Small (300M) | Single language pairs |
| M2M-100 | 100 languages | Medium–Large | Many-to-many without pivot |
| NLLB-200 | 200 languages | Various | Low-resource languages |
| Google Translate | 130+ | Proprietary | Production use |

---

## BLEU Score: Evaluating Translation Quality

**BLEU** (Bilingual Evaluation Understudy) is the standard metric for evaluating machine translation quality.

### How BLEU Works

BLEU measures the overlap of n-grams between the machine translation (candidate) and human reference translations:

$$BLEU = BP \cdot \exp\left(\sum_{n=1}^{N} w_n \log p_n\right)$$

Where:
- $p_n$ = modified n-gram precision
- $w_n$ = weights (typically uniform: $w_n = 1/N$)
- $BP$ = brevity penalty
- $N$ = maximum n-gram order (usually 4)

### Modified N-gram Precision

For each n-gram in the candidate, count how many times it appears in the reference (clipped to reference count):

$$p_n = \frac{\sum_{\text{n-gram} \in C} \min(\text{count}(C), \text{count}(R))}{\sum_{\text{n-gram} \in C} \text{count}(C)}$$

### Brevity Penalty

Prevents very short translations from getting high precision scores:

$$BP = \begin{cases} 1 & \text{if } c > r \\ e^{1 - r/c} & \text{if } c \leq r \end{cases}$$

Where $c$ = candidate length, $r$ = reference length.

### Computing BLEU in Python

```python
from nltk.translate.bleu_score import sentence_bleu, corpus_bleu

# Single sentence BLEU
reference = [["the", "cat", "is", "on", "the", "mat"]]
candidate = ["the", "cat", "sits", "on", "the", "mat"]

score = sentence_bleu(reference, candidate)
print(f"Sentence BLEU: {score:.4f}")

# Corpus BLEU (multiple sentences)
references = [
    [["the", "cat", "is", "on", "the", "mat"]],
    [["there", "is", "a", "cat", "on", "the", "mat"]],
]
candidates = [
    ["the", "cat", "sits", "on", "the", "mat"],
    ["a", "cat", "is", "on", "the", "mat"],
]

corpus_score = corpus_bleu(references, candidates)
print(f"Corpus BLEU: {corpus_score:.4f}")
```

### Using SacreBLEU (Recommended)

```python
# pip install sacrebleu
import sacrebleu

refs = ["The cat is on the mat."]
sys = ["The cat sits on the mat."]

bleu = sacrebleu.corpus_bleu(sys, [refs])
print(f"BLEU: {bleu.score:.2f}")
print(f"Details: {bleu}")
```

### Interpreting BLEU Scores

| BLEU Score | Interpretation |
|------------|---------------|
| < 10 | Almost useless |
| 10–19 | Hard to understand |
| 20–29 | Understandable but errors |
| 30–39 | Good quality |
| 40–49 | High quality |
| 50+ | Very high quality (near human) |

### Limitations of BLEU

- Doesn't capture meaning (synonyms score 0)
- Favors short n-gram matches
- Doesn't handle word order well
- Multiple valid translations may score low

---

## Low-Resource Languages Challenge

Most of the world's 7,000+ languages have very limited parallel data:

### Challenges

- **Data scarcity:** Few translated texts available
- **Morphological complexity:** Some languages have rich morphology
- **Script diversity:** Different writing systems
- **Domain mismatch:** Available data may not match target domain

### Solutions

| Approach | Description |
|----------|-------------|
| Transfer learning | Pre-train on high-resource, fine-tune on low-resource |
| Back-translation | Generate synthetic parallel data |
| Multilingual models | Share parameters across languages |
| Cross-lingual embeddings | Map languages to shared space |
| Data augmentation | Paraphrase, synonym substitution |

```python
# Back-translation example (conceptual)
def back_translate(text, src_lang, tgt_lang, model):
    """Generate synthetic parallel data via back-translation."""
    # Translate source to target
    forward = model.translate(text, src_lang, tgt_lang)
    # Translate back to source (creates a paraphrase)
    backward = model.translate(forward, tgt_lang, src_lang)
    # Now we have a new (backward, forward) pair
    return backward, forward
```

---

## Code: Complete Translation Pipeline

```python
from transformers import MarianMTModel, MarianTokenizer
import sacrebleu

class Translator:
    """Simple translation pipeline using MarianMT."""

    def __init__(self, src_lang, tgt_lang):
        model_name = f"Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}"
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name)

    def translate(self, texts, num_beams=4, max_length=512):
        """Translate a list of texts."""
        if isinstance(texts, str):
            texts = [texts]

        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length,
        )

        translated = self.model.generate(
            **inputs,
            num_beams=num_beams,
            max_length=max_length,
        )

        results = self.tokenizer.batch_decode(
            translated,
            skip_special_tokens=True
        )
        return results

    def evaluate(self, predictions, references):
        """Compute BLEU score for translations."""
        bleu = sacrebleu.corpus_bleu(predictions, [references])
        return bleu

# --- Usage ---
# English to German
translator = Translator("en", "de")

sentences = [
    "Hello, how are you today?",
    "Machine learning is a subset of artificial intelligence.",
    "The weather is beautiful this morning.",
]

translations = translator.translate(sentences)
for src, tgt in zip(sentences, translations):
    print(f"EN: {src}")
    print(f"DE: {tgt}")
    print()

# Evaluate against references
references = [
    "Hallo, wie geht es Ihnen heute?",
    "Maschinelles Lernen ist ein Teilgebiet der künstlichen Intelligenz.",
    "Das Wetter ist heute Morgen wunderschön.",
]

bleu = translator.evaluate(translations, references)
print(f"BLEU Score: {bleu.score:.2f}")
```

---

## Code: Multi-Language Translation

```python
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

class MultilingualTranslator:
    """Translate between any pair of 100 languages."""

    def __init__(self, model_size="418M"):
        model_name = f"facebook/m2m100_{model_size}"
        self.tokenizer = M2M100Tokenizer.from_pretrained(model_name)
        self.model = M2M100ForConditionalGeneration.from_pretrained(model_name)

    def translate(self, text, src_lang, tgt_lang):
        """Translate text between any supported language pair."""
        self.tokenizer.src_lang = src_lang
        inputs = self.tokenizer(text, return_tensors="pt")

        generated = self.model.generate(
            **inputs,
            forced_bos_token_id=self.tokenizer.get_lang_id(tgt_lang),
            max_length=256,
        )

        result = self.tokenizer.batch_decode(
            generated, skip_special_tokens=True
        )[0]
        return result

# --- Usage ---
mt = MultilingualTranslator()

# Chain translation: English → French → German → Spanish
text = "Artificial intelligence will shape the future of humanity."

fr = mt.translate(text, "en", "fr")
de = mt.translate(fr, "fr", "de")
es = mt.translate(de, "de", "es")

print(f"English:  {text}")
print(f"French:   {fr}")
print(f"German:   {de}")
print(f"Spanish:  {es}")

# Direct translation (no pivot)
zh = mt.translate(text, "en", "zh")
ar = mt.translate(text, "en", "ar")
hi = mt.translate(text, "en", "hi")

print(f"\nChinese:  {zh}")
print(f"Arabic:   {ar}")
print(f"Hindi:    {hi}")
```

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Rule-Based MT | Hand-crafted linguistic rules |
| Statistical MT | Learn from parallel corpora |
| Neural MT | End-to-end encoder-decoder |
| Transformer MT | Self-attention, state of the art |
| Attention | Focus on relevant source tokens |
| BLEU | N-gram overlap metric |
| MarianMT | Pre-trained pair-specific models |
| M2M-100 | Many-to-many multilingual model |
| NLLB | Supports 200 languages including low-resource |

### Key Takeaways

1. Modern MT uses Transformer-based encoder-decoder models
2. Pre-trained models make translation accessible without training from scratch
3. BLEU is the standard evaluation metric but has limitations
4. Low-resource languages remain a challenge — multilingual models help
5. Quality depends on language pair, domain, and available training data

---

## Next Steps

Continue your NLP journey with:
- **Question Answering** — extracting answers from text
- **Text Summarization** — condensing documents
- **Prompt Engineering** — using LLMs for translation tasks
