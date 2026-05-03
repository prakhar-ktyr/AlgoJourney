---
title: Multilingual NLP
---

# Multilingual NLP

The world speaks over 7,000 languages. English dominates NLP research, but real-world applications need to work across languages, scripts, and writing systems. **Multilingual NLP** bridges this gap.

---

## The Challenge

### Why Is Multilingual NLP Hard?

| Challenge | Example |
|-----------|---------|
| **Different scripts** | Latin (English), Cyrillic (Russian), Devanagari (Hindi), CJK (Chinese) |
| **Word boundaries** | Chinese and Japanese don't use spaces between words |
| **Morphology** | Turkish can pack an entire sentence into one word |
| **Word order** | English = SVO, Japanese = SOV, Arabic = VSO |
| **Low-resource** | Many languages have very little training data |
| **Code-switching** | People mix languages: "Let's grab some chai, it's cold na?" |

### The Resource Gap

| Tier | Examples | Available Data |
|------|----------|---------------|
| **High-resource** | English, Chinese, Spanish | Billions of tokens |
| **Medium-resource** | Hindi, Arabic, Turkish | Millions of tokens |
| **Low-resource** | Yoruba, Khmer, Quechua | Thousands of tokens |
| **Extremely low** | Many indigenous languages | Almost nothing |

> Over 90% of NLP research focuses on about **10 languages**. Most of the world's languages are severely underrepresented.

---

## Multilingual Models

### mBERT (Multilingual BERT)

- Trained on Wikipedia text from **104 languages**
- Same architecture as English BERT (12 layers, 110M params)
- Shared vocabulary of 110K WordPiece tokens
- Surprisingly good at cross-lingual transfer — even without explicit alignment

### XLM-R (XLM-RoBERTa)

- Trained on **CommonCrawl** data from **100 languages**
- Much more data than mBERT (2.5TB vs ~60GB)
- 270M (base) or 550M (large) parameters
- State-of-the-art multilingual model for most tasks

### Comparison

| Feature | mBERT | XLM-R |
|---------|-------|-------|
| Training data | Wikipedia | CommonCrawl |
| Languages | 104 | 100 |
| Data size | ~60 GB | 2.5 TB |
| Parameters | 110M | 270M / 550M |
| Performance | Good | Better |

```python
from transformers import pipeline

# XLM-R for multilingual sentiment analysis
classifier = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment",
)

texts = [
    ("English", "This movie was absolutely wonderful!"),
    ("French", "Ce film était absolument merveilleux !"),
    ("Spanish", "¡Esta película fue absolutamente maravillosa!"),
    ("German", "Dieser Film war absolut wunderbar!"),
    ("Japanese", "この映画は本当に素晴らしかった！"),
]

for lang, text in texts:
    result = classifier(text)[0]
    stars = result["label"]
    score = result["score"]
    print(f"[{lang:8s}] {stars} ({score:.3f})  {text}")
```

**Output:**
```
[English ] 5 stars (0.873)  This movie was absolutely wonderful!
[French  ] 5 stars (0.791)  Ce film était absolument merveilleux !
[Spanish ] 5 stars (0.834)  ¡Esta película fue absolutamente maravillosa!
[German  ] 5 stars (0.812)  Dieser Film war absolut wunderbar!
[Japanese] 4 stars (0.654)  この映画は本当に素晴らしかった！
```

---

## Cross-Lingual Transfer

The magic of multilingual models: **train on one language, apply to another**.

### How It Works

1. A multilingual model learns shared representations across languages
2. Fine-tune on English labeled data (abundant)
3. Apply directly to other languages (zero-shot cross-lingual transfer)

### Why Does It Work?

- **Shared vocabulary** — many languages share borrowed words, numbers, proper nouns
- **Structural similarity** — similar syntactic patterns get similar representations
- **Anchor points** — shared tokens align the embedding spaces

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load a model fine-tuned on English NLI
model_name = "joeddav/xlm-roberta-large-xnli"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

def zero_shot_classify(text, labels, lang="en"):
    """Zero-shot classification using cross-lingual NLI."""
    hypothesis_templates = {
        "en": "This text is about {}.",
        "fr": "Ce texte parle de {}.",
        "de": "Dieser Text handelt von {}.",
        "hi": "यह पाठ {} के बारे में है।",
    }
    template = hypothesis_templates.get(lang, hypothesis_templates["en"])

    scores = {}
    for label in labels:
        hypothesis = template.format(label)
        inputs = tokenizer(text, hypothesis, return_tensors="pt", truncation=True)

        with torch.no_grad():
            logits = model(**inputs).logits
            # entailment probability
            probs = torch.softmax(logits, dim=-1)
            scores[label] = probs[0][2].item()  # entailment index

    # Normalize
    total = sum(scores.values())
    return {k: v / total for k, v in scores.items()}

# Classify French text using English-trained model
text_fr = "Le président a annoncé de nouvelles mesures économiques."
labels = ["politics", "sports", "technology", "entertainment"]

results = zero_shot_classify(text_fr, labels, lang="fr")
for label, score in sorted(results.items(), key=lambda x: -x[1]):
    bar = "█" * int(score * 40)
    print(f"  {label:<15} {score:.3f} {bar}")
```

**Output (approximate):**
```
  politics        0.724 █████████████████████████████
  entertainment   0.112 ████
  technology      0.098 ███
  sports          0.066 ██
```

> The model correctly classifies French political text — even though it was fine-tuned on English!

---

## Language Detection

Before processing multilingual text, you often need to **identify the language**.

```python
from langdetect import detect, detect_langs

texts = [
    "Hello, how are you today?",
    "Bonjour, comment allez-vous aujourd'hui ?",
    "Hola, ¿cómo estás hoy?",
    "こんにちは、お元気ですか？",
    "مرحبا، كيف حالك اليوم؟",
    "Привет, как ты сегодня?",
    "नमस्ते, आज आप कैसे हैं?",
    "안녕하세요, 오늘 어떠세요?",
]

print(f"{'Text':<45} {'Language':<10} {'Confidence'}")
print("-" * 70)
for text in texts:
    lang = detect(text)
    probs = detect_langs(text)
    confidence = probs[0].prob
    print(f"{text:<45} {lang:<10} {confidence:.3f}")
```

**Output:**
```
Text                                          Language   Confidence
----------------------------------------------------------------------
Hello, how are you today?                     en         0.999
Bonjour, comment allez-vous aujourd'hui ?     fr         0.999
Hola, ¿cómo estás hoy?                       es         0.999
こんにちは、お元気ですか？                       ja         0.999
مرحبا، كيف حالك اليوم؟                        ar         0.999
Привет, как ты сегодня?                        ru         0.999
नमस्ते, आज आप कैसे हैं?                        hi         0.999
안녕하세요, 오늘 어떠세요?                        ko         0.999
```

### Handling Short or Mixed Text

Language detection struggles with:
- **Very short texts** (< 10 characters)
- **Code-switched text** ("I went to the mercado")
- **Transliterated text** ("Namaste" written in Latin script)

```python
# Short text — less confident
short_texts = ["ok", "hello", "bon", "ja", "si"]

for text in short_texts:
    probs = detect_langs(text)
    top2 = probs[:2]
    print(f"'{text}' → {', '.join(f'{p.lang}:{p.prob:.2f}' for p in top2)}")
```

---

## Unicode & Script Handling

Working with multilingual text requires proper **Unicode** handling.

### Unicode Basics

- Every character has a **code point** (e.g., 'A' = U+0041, '中' = U+4E2D)
- Python 3 strings are Unicode by default
- **Normalization** ensures consistent representation

```python
import unicodedata

def analyze_text(text):
    """Analyze Unicode properties of text."""
    scripts = set()
    categories = {}

    for char in text:
        if not char.isspace():
            script = unicodedata.name(char, "UNKNOWN").split()[0]
            scripts.add(script)
            cat = unicodedata.category(char)
            categories[cat] = categories.get(cat, 0) + 1

    return scripts, categories

texts = {
    "English": "Hello World",
    "Hindi": "नमस्ते दुनिया",
    "Arabic": "مرحبا بالعالم",
    "Chinese": "你好世界",
    "Mixed": "Hello दुनिया 世界",
}

for lang, text in texts.items():
    scripts, _ = analyze_text(text)
    print(f"{lang:<10} '{text}' → scripts: {scripts}")
```

**Output:**
```
English    'Hello World' → scripts: {'LATIN'}
Hindi      'नमस्ते दुनिया' → scripts: {'DEVANAGARI'}
Arabic     'مرحبا بالعالم' → scripts: {'ARABIC'}
Chinese    '你好世界' → scripts: {'CJK'}
Mixed      'Hello दुनिया 世界' → scripts: {'LATIN', 'DEVANAGARI', 'CJK'}
```

### Unicode Normalization

The same character can have multiple representations. **Normalize** to ensure consistency:

```python
import unicodedata

# 'é' can be represented two ways:
composed = "caf\u00e9"        # é as one code point
decomposed = "cafe\u0301"     # e + combining accent

print(f"Composed:   '{composed}' (len={len(composed)})")
print(f"Decomposed: '{decomposed}' (len={len(decomposed)})")
print(f"Equal?      {composed == decomposed}")

# Normalize both to NFC (composed form)
norm_c = unicodedata.normalize("NFC", decomposed)
print(f"\nAfter NFC:  '{norm_c}' (len={len(norm_c)})")
print(f"Equal now?  {composed == norm_c}")
```

**Output:**
```
Composed:   'café' (len=4)
Decomposed: 'café' (len=5)
Equal?      False

After NFC:  'café' (len=4)
Equal now?  True
```

> **Always normalize** text before processing. Use `NFC` for general text, `NFKC` for search/comparison.

---

## Tokenization for Non-Latin Scripts

Standard tokenizers may not work well for all scripts.

### CJK (Chinese, Japanese, Korean)

Chinese and Japanese don't use spaces between words:

```
English:  "I love natural language processing"
Chinese:  "我喜欢自然语言处理" (no spaces!)
Japanese: "私は自然言語処理が好きです" (no spaces!)
```

### Tokenizer Comparison

```python
from transformers import AutoTokenizer

tokenizers = {
    "BERT": "bert-base-uncased",
    "mBERT": "bert-base-multilingual-cased",
    "XLM-R": "xlm-roberta-base",
}

texts = {
    "English": "I love natural language processing",
    "Chinese": "我喜欢自然语言处理",
    "Arabic": "أنا أحب معالجة اللغات الطبيعية",
    "Hindi": "मुझे प्राकृतिक भाषा प्रसंस्करण पसंद है",
}

for tok_name, tok_model in tokenizers.items():
    tokenizer = AutoTokenizer.from_pretrained(tok_model)
    print(f"\n=== {tok_name} ===")
    for lang, text in texts.items():
        tokens = tokenizer.tokenize(text)
        print(f"  {lang:<10} ({len(tokens):2d} tokens): {tokens[:8]}{'...' if len(tokens) > 8 else ''}")
```

**Output (approximate):**
```
=== BERT ===
  English    ( 5 tokens): ['i', 'love', 'natural', 'language', 'processing']
  Chinese    (10 tokens): ['我', '喜', '欢', '自', '然', '语', '言', '处'...]
  Arabic     (18 tokens): ['ا', '##نا', 'ا', '##حب', 'م', '##عا', '##ل'...]
  Hindi      (22 tokens): ['म', '##ुझ', '##े', 'प', '##्रा', '##क', '##ृ'...]

=== mBERT ===
  English    ( 5 tokens): ['I', 'love', 'natural', 'language', 'processing']
  Chinese    ( 7 tokens): ['我', '喜欢', '自然', '语言', '处理']
  Arabic     ( 7 tokens): ['أنا', 'أحب', 'معالجة', 'اللغات', 'الطبيعية']
  Hindi      ( 8 tokens): ['मुझे', 'प्राकृतिक', 'भाषा', 'प्रसंस्करण', 'पसंद'...]

=== XLM-R ===
  English    ( 6 tokens): ['▁I', '▁love', '▁natural', '▁language', '▁processing']
  Chinese    ( 6 tokens): ['▁我', '喜欢', '自然', '语言', '处理']
  Arabic     ( 9 tokens): ['▁أنا', '▁أحب', '▁معالج', 'ة', '▁اللغ', 'ات'...]
  Hindi      ( 9 tokens): ['▁मुझे', '▁प्राकृतिक', '▁भाषा', '▁प्रसंस्करण'...]
```

> Multilingual tokenizers (mBERT, XLM-R) handle non-Latin scripts much better than English-only BERT.

---

## Multilingual Sentence Embeddings

**Multilingual sentence transformers** map sentences from any language into the same vector space — making cross-lingual similarity search possible.

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# Same meaning in different languages
sentences = [
    ("en", "The weather is beautiful today."),
    ("fr", "Le temps est magnifique aujourd'hui."),
    ("de", "Das Wetter ist heute wunderschön."),
    ("es", "El clima está hermoso hoy."),
    ("ja", "今日は天気がいいですね。"),
    ("hi", "आज मौसम बहुत अच्छा है।"),
    ("en", "I like programming in Python."),  # different topic
]

embeddings = model.encode([s[1] for s in sentences])

# Compute similarity matrix
print("Similarity Matrix:")
print(f"{'':>6}", end="")
for i in range(len(sentences)):
    print(f"  {sentences[i][0]:>4}({i})", end="")
print()

for i in range(len(sentences)):
    print(f"{sentences[i][0]}({i})", end=" ")
    for j in range(len(sentences)):
        sim = np.dot(embeddings[i], embeddings[j]) / (
            np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j])
        )
        print(f"  {sim:6.3f}", end="")
    print()
```

**Output (approximate):**
```
Similarity Matrix:
         en(0)  fr(1)  de(2)  es(3)  ja(4)  hi(5)  en(6)
en(0)   1.000  0.932  0.921  0.934  0.871  0.884  0.213
fr(1)   0.932  1.000  0.912  0.924  0.852  0.867  0.198
de(2)   0.921  0.912  1.000  0.908  0.843  0.856  0.204
es(3)   0.934  0.924  0.908  1.000  0.861  0.871  0.201
ja(4)   0.871  0.852  0.843  0.861  1.000  0.839  0.187
hi(5)   0.884  0.867  0.856  0.871  0.839  1.000  0.192
en(6)   0.213  0.198  0.204  0.201  0.187  0.192  1.000
```

> "The weather is beautiful today" in 6 languages clusters together (similarity > 0.83), while "I like programming in Python" is far away (~0.2). The model understands meaning across languages.

---

## Machine Translation for Data Augmentation

When labeled data doesn't exist in a target language, **translate** it:

```python
from transformers import pipeline

translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-fr")

# English training data
training_examples = [
    {"text": "This product is amazing!", "label": "positive"},
    {"text": "Terrible quality, very disappointed.", "label": "negative"},
    {"text": "It works as expected, nothing special.", "label": "neutral"},
]

# Translate to French for data augmentation
augmented = []
for example in training_examples:
    translated = translator(example["text"])[0]["translation_text"]
    augmented.append({
        "text": translated,
        "label": example["label"],
        "source_lang": "en",
        "target_lang": "fr",
    })
    print(f"[{example['label']:>8}] EN: {example['text']}")
    print(f"{'':>10} FR: {translated}\n")
```

**Output:**
```
[positive] EN: This product is amazing!
           FR: Ce produit est incroyable !

[negative] EN: Terrible quality, very disappointed.
           FR: Qualité terrible, très déçu.

[ neutral] EN: It works as expected, nothing special.
           FR: Il fonctionne comme prévu, rien de spécial.
```

> **Translate-train**: translate English data → train a model on the target language. Often competitive with zero-shot cross-lingual transfer.

---

## Practical Tips

### Do's and Don'ts

| Do | Don't |
|----|-------|
| Normalize Unicode before processing | Assume ASCII is enough |
| Use multilingual tokenizers for non-English | Use English-only BERT for other languages |
| Test on multiple languages | Evaluate only on English |
| Handle right-to-left (RTL) text | Assume left-to-right |
| Consider code-switching | Treat each text as monolingual |
| Use sentence-level models for similarity | Compare word embeddings across languages |

### Language-Specific Considerations

| Language Family | Key Challenge | Approach |
|----------------|---------------|----------|
| CJK | No word boundaries | Use subword tokenizers (SentencePiece) |
| Arabic, Hebrew | Right-to-left + morphology | Use dedicated pre-processing |
| Agglutinative (Turkish, Finnish) | Very long words | Subword tokenization, morphological analysis |
| Tonal (Chinese, Thai, Vietnamese) | Tone changes meaning | Use audio features for speech, context for text |
| Low-resource | Little training data | Cross-lingual transfer, data augmentation |

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Multilingual models | mBERT, XLM-R work across 100+ languages |
| Cross-lingual transfer | Train on English, apply to other languages |
| Language detection | Identify language before processing |
| Unicode | Always normalize; handle multiple scripts |
| Tokenization | Multilingual tokenizers handle non-Latin scripts |
| Sentence embeddings | Map all languages to one shared vector space |
| Data augmentation | Translate training data to create multilingual datasets |

Multilingual NLP is not just about translation — it's about building AI that works for **everyone**, regardless of what language they speak.

---
