---
title: Multimodal Learning
---

# Multimodal Learning

Humans understand the world through multiple senses simultaneously — we see, hear, and read. **Multimodal learning** teaches models to combine vision with other modalities like text and audio, enabling richer understanding.

---

## What Is Multimodal Learning?

A **modality** is a type of information:

| Modality | Examples |
|----------|----------|
| Vision | Images, video frames |
| Language | Text, captions, questions |
| Audio | Speech, music, sounds |
| Depth | 3D point clouds, depth maps |
| Tactile | Touch sensor data |

**Multimodal models** process two or more modalities together. The most common combination in CV is **vision + language**.

### Why Multimodal?

- Images alone lack semantic context ("What breed is this dog?")
- Text alone lacks visual grounding ("Show me what you mean")
- Combining them enables: captioning, VQA, text-to-image, visual search

---

## CLIP: Contrastive Language-Image Pre-training

**CLIP** (OpenAI, 2021) is the foundation of modern vision-language models. It learns to align images and text in a shared embedding space.

### Architecture

```
Image Encoder (ViT or ResNet) → Image embedding
Text Encoder (Transformer)    → Text embedding
                              ↕ Contrastive loss aligns them
```

### Training Objective

Given a batch of $N$ image-text pairs, CLIP maximizes similarity for matching pairs and minimizes it for non-matching pairs:

$$L = -\frac{1}{N}\sum_{i=1}^{N} \log\frac{\exp(I_i \cdot T_i / \tau)}{\sum_{j=1}^{N} \exp(I_i \cdot T_j / \tau)}$$

Where:
- $I_i$ = normalized image embedding for sample $i$
- $T_i$ = normalized text embedding for sample $i$
- $\tau$ = learnable temperature parameter

### CLIP Capabilities

```python
import torch
import open_clip
from PIL import Image

# Load CLIP model
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k"
)
tokenizer = open_clip.get_tokenizer("ViT-B-32")
model.eval()

# --- Zero-Shot Classification ---
image = preprocess(Image.open("photo.jpg")).unsqueeze(0)
classes = ["a photo of a cat", "a photo of a dog",
           "a photo of a bird", "a photo of a car"]
text = tokenizer(classes)

with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)

    # Normalize
    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    # Similarity
    similarity = (100.0 * image_features @ text_features.T)
    probs = similarity.softmax(dim=-1)

print("Predictions:")
for cls, prob in zip(classes, probs[0]):
    print(f"  {cls}: {prob:.1%}")


# --- Image-Text Retrieval ---
def find_best_caption(image_path, captions):
    """Find which caption best matches the image."""
    image = preprocess(Image.open(image_path)).unsqueeze(0)
    text = tokenizer(captions)

    with torch.no_grad():
        img_feat = model.encode_image(image)
        txt_feat = model.encode_text(text)
        img_feat /= img_feat.norm(dim=-1, keepdim=True)
        txt_feat /= txt_feat.norm(dim=-1, keepdim=True)
        scores = (img_feat @ txt_feat.T).squeeze()

    best_idx = scores.argmax().item()
    return captions[best_idx], scores[best_idx].item()
```

---

## BLIP / BLIP-2

**BLIP-2** (Salesforce, 2023) bridges frozen image encoders and frozen language models using a lightweight **Q-Former**.

### Architecture

```
Frozen Image Encoder (ViT) → Visual tokens
         ↓
Q-Former (learnable queries) → Condensed visual features
         ↓
Frozen LLM (OPT/FlanT5) → Text generation
```

### Capabilities

- **Image captioning**: generate descriptions
- **Visual QA**: answer questions about images
- **Image-text retrieval**: match images to text

```python
from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import torch

# Load BLIP-2
processor = Blip2Processor.from_pretrained(
    "Salesforce/blip2-opt-2.7b"
)
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16,
    device_map="auto"
)

image = Image.open("street_scene.jpg")

# --- Image Captioning ---
inputs = processor(images=image, return_tensors="pt").to(
    "cuda", torch.float16
)
generated_ids = model.generate(**inputs, max_new_tokens=50)
caption = processor.batch_decode(
    generated_ids, skip_special_tokens=True
)[0]
print(f"Caption: {caption}")

# --- Visual Question Answering ---
question = "How many people are in this image?"
inputs = processor(
    images=image, text=question, return_tensors="pt"
).to("cuda", torch.float16)
generated_ids = model.generate(**inputs, max_new_tokens=20)
answer = processor.batch_decode(
    generated_ids, skip_special_tokens=True
)[0]
print(f"Q: {question}")
print(f"A: {answer}")
```

---

## LLaVA: Visual Instruction Tuning

**LLaVA** (Large Language and Vision Assistant) connects a vision encoder to an LLM, trained with visual instruction-following data.

### How It Works

1. Vision encoder (CLIP ViT) extracts image features
2. A projection layer maps visual tokens to LLM's input space
3. The LLM processes both visual and text tokens together
4. Result: you can **chat about images** naturally

### Example Interaction

```
User: [uploads image of a kitchen]
      What's wrong in this image? Give safety advice.

LLaVA: I can see a pot on the stove with the handle pointing
       outward. This is a safety hazard as someone could bump
       into it and spill hot contents. The handle should point
       inward or to the side, away from the edge of the stove.
```

---

## Visual Question Answering (VQA)

**VQA** requires understanding both an image and a natural language question to produce an answer.

### Task Format

```
Input:  Image + "What color is the car?" → "Red"
Input:  Image + "How many dogs are there?" → "3"
Input:  Image + "Is it raining?" → "Yes"
```

### VQA Architecture

```python
import torch
import torch.nn as nn
from torchvision.models import resnet50

class SimpleVQA(nn.Module):
    """Basic VQA model: image features + text features → answer."""

    def __init__(self, vocab_size, embed_dim=256,
                 hidden_dim=512, num_answers=3000):
        super().__init__()
        # Image encoder
        resnet = resnet50(pretrained=True)
        self.image_encoder = nn.Sequential(
            *list(resnet.children())[:-1],  # Remove FC
            nn.Flatten(),
            nn.Linear(2048, hidden_dim)
        )

        # Question encoder
        self.word_embed = nn.Embedding(vocab_size, embed_dim)
        self.question_encoder = nn.LSTM(
            embed_dim, hidden_dim, batch_first=True
        )

        # Fusion + answer prediction
        self.fusion = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, num_answers)
        )

    def forward(self, image, question):
        # Encode image
        img_feat = self.image_encoder(image)  # (B, hidden_dim)

        # Encode question
        q_embed = self.word_embed(question)
        _, (q_hidden, _) = self.question_encoder(q_embed)
        q_feat = q_hidden.squeeze(0)  # (B, hidden_dim)

        # Fuse and predict
        combined = torch.cat([img_feat, q_feat], dim=1)
        answer_logits = self.fusion(combined)
        return answer_logits
```

---

## Image Captioning

Generate a natural language description of an image.

### Show, Attend and Tell

The classic approach uses **attention** to focus on relevant image regions while generating each word:

```python
class CaptionDecoder(nn.Module):
    """Attention-based caption decoder."""

    def __init__(self, embed_dim, hidden_dim, vocab_size,
                 encoder_dim=2048, attention_dim=256):
        super().__init__()
        self.attention = nn.Sequential(
            nn.Linear(encoder_dim + hidden_dim, attention_dim),
            nn.ReLU(),
            nn.Linear(attention_dim, 1)
        )
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTMCell(embed_dim + encoder_dim, hidden_dim)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)

    def attend(self, encoder_out, hidden):
        """Compute attention over image regions."""
        # encoder_out: (B, num_regions, encoder_dim)
        # hidden: (B, hidden_dim)
        B, N, _ = encoder_out.shape
        hidden_expanded = hidden.unsqueeze(1).expand(-1, N, -1)

        combined = torch.cat(
            [encoder_out, hidden_expanded], dim=2
        )
        scores = self.attention(combined).squeeze(2)  # (B, N)
        weights = torch.softmax(scores, dim=1)

        # Weighted sum of encoder features
        context = (encoder_out * weights.unsqueeze(2)).sum(dim=1)
        return context, weights

    def forward_step(self, word, encoder_out, hidden, cell):
        """Generate one word."""
        embed = self.embedding(word)  # (B, embed_dim)
        context, attn_weights = self.attend(encoder_out, hidden)

        lstm_input = torch.cat([embed, context], dim=1)
        hidden, cell = self.lstm(lstm_input, (hidden, cell))

        output = self.fc_out(hidden)  # (B, vocab_size)
        return output, hidden, cell, attn_weights
```

---

## Text-to-Image Generation

Generate images from text descriptions — the reverse of captioning.

### Key Models

| Model | Organization | Approach |
|-------|-------------|----------|
| DALL-E 2 | OpenAI | CLIP + Diffusion |
| Stable Diffusion | Stability AI | Latent Diffusion |
| Midjourney | Midjourney | Proprietary diffusion |
| Imagen | Google | T5 text encoder + Diffusion |

### How Stable Diffusion Works

```
Text prompt → CLIP Text Encoder → Text embeddings
                                        ↓
Random noise → U-Net (denoising, cross-attention to text) → Latent
                                        ↓
                              VAE Decoder → Generated image
```

**Cross-attention** injects text information into the image generation process:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Where $Q$ comes from image features and $K, V$ come from text embeddings.

---

## Grounding: Connecting Text to Image Regions

**Visual grounding** locates specific objects in an image based on text descriptions.

### Grounding DINO

Combines DINO (self-supervised ViT) with grounded detection — detect objects by text prompts:

```python
from groundingdino.util.inference import (
    load_model, load_image, predict, annotate
)

# Load model
model = load_model(
    "groundingdino/config/GroundingDINO_SwinT_OGC.py",
    "weights/groundingdino_swint_ogc.pth"
)

# Detect objects using text prompt
image_source, image = load_image("room.jpg")
TEXT_PROMPT = "chair . table . lamp . window"
BOX_THRESHOLD = 0.35
TEXT_THRESHOLD = 0.25

boxes, logits, phrases = predict(
    model=model,
    image=image,
    caption=TEXT_PROMPT,
    box_threshold=BOX_THRESHOLD,
    text_threshold=TEXT_THRESHOLD
)

# Visualize
annotated = annotate(
    image_source=image_source,
    boxes=boxes,
    logits=logits,
    phrases=phrases
)
print(f"Found: {phrases}")
# Output: Found: ['chair', 'chair', 'table', 'lamp', 'window']
```

### Open-Vocabulary Detection

Traditional detectors only find classes seen in training. Grounding models detect **anything you can describe in text**.

---

## Video + Language

Multimodal learning extends to video:

| Task | Input | Output |
|------|-------|--------|
| Video captioning | Video | Text description |
| Video QA | Video + question | Answer |
| Moment retrieval | Video + text query | Timestamp |
| Video summarization | Long video | Short highlights |

---

## Multimodal Model Comparison

| Model | Modalities | Key Capability | Size |
|-------|-----------|----------------|------|
| CLIP | Image + Text | Zero-shot classification, retrieval | 400M |
| BLIP-2 | Image + Text | Captioning, VQA, dialogue | 3–12B |
| LLaVA | Image + Text | Visual instruction following | 7–13B |
| GPT-4V | Image + Text | General multimodal reasoning | ~1T |
| Grounding DINO | Image + Text | Open-set detection | 172M |
| Stable Diffusion | Text → Image | Image generation | ~1B |
| ImageBind | 6 modalities | Cross-modal retrieval | 1.2B |

---

## Building a Multimodal Pipeline

```python
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

class MultimodalAssistant:
    """Multimodal assistant combining captioning and VQA."""

    def __init__(self, device="cuda"):
        self.device = device
        self.processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )
        self.model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        ).to(device)

    def caption(self, image_path):
        """Generate a caption for the image."""
        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(
            images=image, return_tensors="pt"
        ).to(self.device)
        out = self.model.generate(**inputs, max_length=50)
        return self.processor.decode(out[0], skip_special_tokens=True)


# Usage
assistant = MultimodalAssistant()
print(assistant.caption("beach_sunset.jpg"))
```

---

## Summary

| Task | Input → Output | Key Models |
|------|---------------|------------|
| Zero-shot classification | Image → class label | CLIP |
| Image captioning | Image → text | BLIP, BLIP-2 |
| VQA | Image + question → answer | BLIP-2, LLaVA |
| Text-to-image | Text → image | Stable Diffusion, DALL-E |
| Visual grounding | Image + text → bounding boxes | Grounding DINO |
| Visual chat | Image + conversation → response | LLaVA, GPT-4V |

---

## Try It Yourself

1. Use CLIP to build a custom image search engine (search images with text)
2. Generate captions for your photos using BLIP-2
3. Build a visual QA chatbot that answers questions about uploaded images
4. Use Grounding DINO to detect custom objects without training

---

## Key Takeaways

- Multimodal models bridge the gap between vision and language
- CLIP's contrastive training creates a universal vision-language embedding space
- BLIP-2 efficiently connects frozen vision and language models via Q-Former
- Visual grounding enables open-vocabulary object detection with text prompts
- These models power modern AI assistants that can see and reason about images
