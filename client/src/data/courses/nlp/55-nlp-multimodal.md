---
title: Multimodal NLP
---

# Multimodal NLP

**Multimodal NLP** combines text with other modalities — images, audio, and video. Instead of processing language in isolation, multimodal models understand the connections between text and the visual/auditory world.

In this lesson, you will learn about vision-language models, image captioning, and how to use them in Python.

---

## What is Multimodal AI?

Traditional NLP processes only text. Multimodal AI processes **multiple types of input** simultaneously:

| Modality | Examples |
|----------|---------|
| **Text** | Sentences, documents, queries |
| **Image** | Photos, diagrams, screenshots |
| **Audio** | Speech, music, sound effects |
| **Video** | Clips combining visual + audio |

### Why Multimodal?

- Humans communicate using multiple modalities (we point at things, draw diagrams, show photos)
- Many tasks require understanding both text and images (e.g., "What color is the car in this photo?")
- Richer representations lead to better AI understanding

---

## Vision-Language Models

Vision-language models learn to understand both images and text in a shared representation space.

### CLIP (Contrastive Language-Image Pretraining)

**CLIP** by OpenAI learns to match images with their text descriptions:

- Trained on 400 million image-text pairs from the internet
- Learns a shared embedding space for images and text
- Can classify images using text descriptions (zero-shot)
- No task-specific training needed

#### How CLIP Works

1. **Image encoder**: Processes an image → image embedding
2. **Text encoder**: Processes text → text embedding
3. **Contrastive loss**: Matching pairs should be close; non-matching pairs should be far apart

The training objective maximizes:

$$\text{similarity}(image_i, text_i) \gg \text{similarity}(image_i, text_j) \quad \text{for } i \neq j$$

### BLIP (Bootstrapping Language-Image Pretraining)

BLIP extends CLIP with:
- Image captioning (generating text from images)
- Visual question answering
- Better noise handling in training data

### Flamingo

DeepMind's Flamingo handles:
- Few-shot visual learning
- Interleaved image-text inputs
- Multi-image reasoning

---

## CLIP for Image-Text Matching

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import numpy as np

# Load CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def clip_similarity(image_path, texts):
    """Calculate similarity between an image and multiple text descriptions."""
    # Load image
    image = Image.open(image_path)

    # Process inputs
    inputs = processor(
        text=texts,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    # Get embeddings
    with torch.no_grad():
        outputs = model(**inputs)
        image_embeds = outputs.image_embeds
        text_embeds = outputs.text_embeds

    # Normalize embeddings
    image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)
    text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)

    # Calculate cosine similarity
    similarities = (image_embeds @ text_embeds.T).squeeze(0)

    return similarities.numpy()

# Example: classify an image using text descriptions
image_path = "example_image.jpg"  # Provide your image
candidate_texts = [
    "a photo of a cat",
    "a photo of a dog",
    "a photo of a car",
    "a photo of a landscape",
    "a photo of food",
]

# scores = clip_similarity(image_path, candidate_texts)
# for text, score in zip(candidate_texts, scores):
#     print(f"  {score:.3f} | {text}")

print("CLIP model loaded successfully!")
print("Provide an image path to clip_similarity() for zero-shot classification.")
```

### Zero-Shot Image Classification

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

class ZeroShotClassifier:
    """Zero-shot image classifier using CLIP."""

    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()

    def classify(self, image, labels, template="a photo of a {}"):
        """
        Classify an image into one of the given labels.

        Args:
            image: PIL Image or path to image
            labels: list of class names
            template: text template for each label
        """
        if isinstance(image, str):
            image = Image.open(image)

        # Create text descriptions from labels
        texts = [template.format(label) for label in labels]

        # Process inputs
        inputs = self.processor(
            text=texts,
            images=image,
            return_tensors="pt",
            padding=True,
        )

        # Forward pass
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits_per_image  # image-text similarity

        # Convert to probabilities
        probs = logits.softmax(dim=1).squeeze(0).numpy()

        # Return sorted results
        results = sorted(
            zip(labels, probs),
            key=lambda x: x[1],
            reverse=True,
        )
        return results

    def search_images(self, images, query, top_k=5):
        """Search through images using a text query."""
        inputs = self.processor(
            text=[query],
            images=images,
            return_tensors="pt",
            padding=True,
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            similarities = outputs.logits_per_text.squeeze(0).numpy()

        ranked = similarities.argsort()[::-1][:top_k]
        return [(idx, similarities[idx]) for idx in ranked]


# Usage example
classifier = ZeroShotClassifier()
print("Zero-shot classifier ready!")
print()
print("Example usage:")
print("  results = classifier.classify(image, ['cat', 'dog', 'bird'])")
print("  for label, prob in results:")
print("      print(f'{label}: {prob:.1%}')")
```

---

## Image Captioning

**Image captioning** generates natural language descriptions of images.

### Architecture

```
Image → CNN/ViT Encoder → Features → Transformer Decoder → "A cat sitting on a table"
```

### Using Hugging Face for Captioning

```python
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch

class ImageCaptioner:
    """Generate captions for images using BLIP."""

    def __init__(self, model_name="Salesforce/blip-image-captioning-base"):
        self.processor = BlipProcessor.from_pretrained(model_name)
        self.model = BlipForConditionalGeneration.from_pretrained(model_name)
        self.model.eval()

    def caption(self, image, num_captions=1, max_length=50):
        """
        Generate caption(s) for an image.

        Args:
            image: PIL Image or file path
            num_captions: number of captions to generate
            max_length: maximum caption length in tokens
        """
        if isinstance(image, str):
            image = Image.open(image).convert("RGB")

        inputs = self.processor(images=image, return_tensors="pt")

        captions = []
        for _ in range(num_captions):
            with torch.no_grad():
                output = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                )
            caption = self.processor.decode(output[0], skip_special_tokens=True)
            captions.append(caption)

        return captions if num_captions > 1 else captions[0]

    def conditional_caption(self, image, prefix):
        """Generate a caption conditioned on a text prefix."""
        if isinstance(image, str):
            image = Image.open(image).convert("RGB")

        inputs = self.processor(
            images=image,
            text=prefix,
            return_tensors="pt",
        )

        with torch.no_grad():
            output = self.model.generate(**inputs, max_length=50)

        caption = self.processor.decode(output[0], skip_special_tokens=True)
        return caption


# Usage
captioner = ImageCaptioner()
print("Image captioner ready!")
print()
print("Example:")
print("  caption = captioner.caption('photo.jpg')")
print("  print(caption)")
print("  # Output: 'a dog running on a beach'")
print()
print("Conditional captioning:")
print("  caption = captioner.conditional_caption('photo.jpg', 'a photograph of')")
print("  # Output: 'a photograph of a golden retriever playing in the waves'")
```

---

## Visual Question Answering (VQA)

**VQA** answers questions about images in natural language:

- Input: Image + Question ("What color is the car?")
- Output: Answer ("Red")

```python
from transformers import BlipProcessor, BlipForQuestionAnswering
from PIL import Image
import torch

class VisualQA:
    """Visual Question Answering using BLIP."""

    def __init__(self, model_name="Salesforce/blip-vqa-base"):
        self.processor = BlipProcessor.from_pretrained(model_name)
        self.model = BlipForQuestionAnswering.from_pretrained(model_name)
        self.model.eval()

    def answer(self, image, question):
        """
        Answer a question about an image.

        Args:
            image: PIL Image or file path
            question: question string about the image
        """
        if isinstance(image, str):
            image = Image.open(image).convert("RGB")

        inputs = self.processor(
            images=image,
            text=question,
            return_tensors="pt",
        )

        with torch.no_grad():
            output = self.model.generate(**inputs, max_length=20)

        answer = self.processor.decode(output[0], skip_special_tokens=True)
        return answer

    def batch_answer(self, image, questions):
        """Answer multiple questions about the same image."""
        results = {}
        for question in questions:
            results[question] = self.answer(image, question)
        return results


# Usage
vqa = VisualQA()
print("Visual QA model ready!")
print()
print("Example:")
print("  answer = vqa.answer('park.jpg', 'How many people are there?')")
print("  # Output: '3'")
print()
print("  answers = vqa.batch_answer('kitchen.jpg', [")
print("      'What room is this?',")
print("      'Is there food on the table?',")
print("      'What color are the walls?',")
print("  ])")
```

---

## Text-to-Image Generation

Text-to-image models generate images from text descriptions:

| Model | Creator | Key Feature |
|-------|---------|-------------|
| **DALL-E** | OpenAI | High-quality, creative images |
| **Stable Diffusion** | Stability AI | Open-source, customizable |
| **Midjourney** | Midjourney | Artistic, aesthetic focus |
| **Imagen** | Google | Photorealistic generation |

### How Diffusion Models Work

1. **Forward process**: Gradually add noise to an image until it becomes pure noise
2. **Reverse process**: Learn to remove noise step by step, guided by the text prompt

The model learns to predict the noise $\epsilon$ at each step:

$$L = \mathbb{E}_{t, x_0, \epsilon}\left[ \| \epsilon - \epsilon_\theta(x_t, t, c) \|^2 \right]$$

where $c$ is the text condition (prompt embedding).

```python
from diffusers import StableDiffusionPipeline
import torch

def generate_image(prompt, negative_prompt="", num_steps=50, guidance_scale=7.5):
    """Generate an image from a text prompt using Stable Diffusion."""
    # Load model (downloads ~4GB on first run)
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
    )
    pipe = pipe.to("cuda")  # Requires GPU

    # Generate image
    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=num_steps,
        guidance_scale=guidance_scale,
    ).images[0]

    return image

# Example prompts
prompts = [
    "A serene lake surrounded by mountains at sunset, digital art",
    "A robot reading a book in a cozy library, watercolor style",
    "An astronaut riding a horse on Mars, photorealistic",
]

print("Stable Diffusion pipeline example:")
for prompt in prompts:
    print(f"  Prompt: '{prompt}'")
    # image = generate_image(prompt)
    # image.save(f"generated_{i}.png")
print()
print("Note: Requires GPU with ~8GB VRAM. Install: pip install diffusers torch")
```

---

## Document Understanding: OCR + NLP

**Document AI** combines OCR (reading text from images) with NLP (understanding the text):

### LayoutLM

LayoutLM understands documents by combining:
- **Text content** (from OCR)
- **Layout information** (positions of text on the page)
- **Visual features** (font, color, formatting)

```python
from transformers import pipeline
from PIL import Image

class DocumentAnalyzer:
    """Analyze documents using OCR + NLP."""

    def __init__(self):
        # Document QA pipeline (uses LayoutLM internally)
        self.doc_qa = pipeline(
            "document-question-answering",
            model="impira/layoutlm-document-qa",
        )

    def answer_question(self, image_path, question):
        """Answer a question about a document image."""
        image = Image.open(image_path)
        result = self.doc_qa(image=image, question=question)
        return result

    def extract_fields(self, image_path, fields):
        """Extract specific fields from a document."""
        results = {}
        for field in fields:
            question = f"What is the {field}?"
            answer = self.answer_question(image_path, question)
            results[field] = answer[0]["answer"] if answer else None
        return results


# Usage example
analyzer = DocumentAnalyzer()
print("Document Analyzer ready!")
print()
print("Example - Extract info from an invoice image:")
print("  results = analyzer.extract_fields('invoice.png', [")
print("      'invoice number',")
print("      'date',")
print("      'total amount',")
print("      'company name',")
print("  ])")
print("  # Output: {'invoice number': 'INV-001', 'date': '2024-01-15', ...}")
```

### OCR with Pytesseract

```python
import pytesseract
from PIL import Image
import re

def extract_text_from_image(image_path):
    """Extract text from an image using OCR."""
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text

def extract_structured_data(image_path):
    """Extract text with bounding box information."""
    image = Image.open(image_path)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

    results = []
    for i in range(len(data["text"])):
        if data["text"][i].strip():
            results.append({
                "text": data["text"][i],
                "x": data["left"][i],
                "y": data["top"][i],
                "width": data["width"][i],
                "height": data["height"][i],
                "confidence": data["conf"][i],
            })
    return results

# Example
# text = extract_text_from_image("document.png")
# print(text)
print("OCR ready! Install: pip install pytesseract")
print("Also requires Tesseract OCR engine installed on system.")
```

---

## Audio + Text: Speech and NLP Combined

Combining speech recognition with NLP enables powerful applications:

```python
import whisper
from transformers import pipeline

class SpeechNLPPipeline:
    """Combine speech recognition with NLP analysis."""

    def __init__(self):
        self.asr_model = whisper.load_model("base")
        self.sentiment = pipeline("sentiment-analysis")
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    def transcribe(self, audio_path):
        """Transcribe audio to text."""
        result = self.asr_model.transcribe(audio_path)
        return result["text"]

    def analyze_speech(self, audio_path):
        """Transcribe and analyze speech."""
        # Step 1: Speech → Text
        text = self.transcribe(audio_path)
        print(f"Transcription: {text}")

        # Step 2: Sentiment Analysis
        sentiment = self.sentiment(text[:512])[0]
        print(f"Sentiment: {sentiment['label']} ({sentiment['score']:.2f})")

        # Step 3: Summarization (if text is long)
        if len(text.split()) > 50:
            summary = self.summarizer(
                text,
                max_length=50,
                min_length=10,
                do_sample=False,
            )[0]["summary_text"]
            print(f"Summary: {summary}")

        return {
            "text": text,
            "sentiment": sentiment,
        }

    def speech_search(self, audio_path, knowledge_base):
        """Transcribe speech and search a knowledge base."""
        query = self.transcribe(audio_path)
        print(f"Query (from speech): '{query}'")

        # Simple keyword search
        results = []
        query_words = set(query.lower().split())
        for doc in knowledge_base:
            doc_words = set(doc.lower().split())
            overlap = len(query_words & doc_words)
            if overlap > 0:
                results.append((doc, overlap))

        results.sort(key=lambda x: x[1], reverse=True)
        return results[:5]


# Usage
# pipeline = SpeechNLPPipeline()
# pipeline.analyze_speech("meeting_recording.wav")
print("Speech + NLP pipeline example ready.")
print("Requires: pip install openai-whisper transformers")
```

---

## Multimodal Embeddings

Create a unified embedding space for text and images:

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import numpy as np

class MultimodalIndex:
    """Index and search across text and images in a shared space."""

    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()

        self.embeddings = []
        self.metadata = []  # Track what each embedding represents

    def add_image(self, image_path, metadata=None):
        """Add an image to the index."""
        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            embedding = self.model.get_image_features(**inputs)
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        self.embeddings.append(embedding.numpy().flatten())
        self.metadata.append({"type": "image", "path": image_path, "info": metadata})

    def add_text(self, text, metadata=None):
        """Add text to the index."""
        inputs = self.processor(text=[text], return_tensors="pt", padding=True)

        with torch.no_grad():
            embedding = self.model.get_text_features(**inputs)
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        self.embeddings.append(embedding.numpy().flatten())
        self.metadata.append({"type": "text", "content": text, "info": metadata})

    def search_by_text(self, query, top_k=5):
        """Search the index using a text query."""
        inputs = self.processor(text=[query], return_tensors="pt", padding=True)

        with torch.no_grad():
            query_embed = self.model.get_text_features(**inputs)
            query_embed = query_embed / query_embed.norm(dim=-1, keepdim=True)

        query_np = query_embed.numpy().flatten()
        embeddings_np = np.array(self.embeddings)

        similarities = np.dot(embeddings_np, query_np)
        ranked = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in ranked:
            results.append({
                "score": similarities[idx],
                "metadata": self.metadata[idx],
            })
        return results

    def search_by_image(self, image_path, top_k=5):
        """Search the index using an image query."""
        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            query_embed = self.model.get_image_features(**inputs)
            query_embed = query_embed / query_embed.norm(dim=-1, keepdim=True)

        query_np = query_embed.numpy().flatten()
        embeddings_np = np.array(self.embeddings)

        similarities = np.dot(embeddings_np, query_np)
        ranked = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in ranked:
            results.append({
                "score": similarities[idx],
                "metadata": self.metadata[idx],
            })
        return results


# Usage
index = MultimodalIndex()
print("Multimodal index ready!")
print()
print("Example workflow:")
print("  # Index images and text")
print("  index.add_image('beach.jpg', metadata='vacation photo')")
print("  index.add_image('code.png', metadata='screenshot of code')")
print("  index.add_text('The beach was beautiful at sunset')")
print("  index.add_text('Python programming tutorial')")
print()
print("  # Search with text")
print("  results = index.search_by_text('ocean and sand')")
print("  # Returns both the beach image and beach text description!")
```

---

## Practical Applications

| Application | Modalities | Example |
|-------------|-----------|---------|
| Image search | Text → Image | "Find photos of sunset" |
| Alt-text generation | Image → Text | Accessibility for visually impaired |
| Content moderation | Image + Text | Detect harmful content |
| Product search | Text → Image | E-commerce visual search |
| Document digitization | Image → Structured text | Invoice processing |
| Video understanding | Video + Audio → Text | Auto-generated subtitles |
| Medical imaging | Image + Text | Radiology report generation |

---

## Summary

| Concept | Description |
|---------|-------------|
| Multimodal | Combining text with images, audio, video |
| CLIP | Shared embedding space for images and text |
| Image captioning | Generating text descriptions of images |
| VQA | Answering questions about images |
| Text-to-Image | Generating images from text (diffusion models) |
| LayoutLM | Document understanding with layout info |
| Zero-shot | Classify without task-specific training |
| Multimodal search | Find content across modalities |

---

## Exercises

1. Use CLIP to build an image search engine for your photo library
2. Generate captions for 10 images and evaluate their quality manually
3. Build a VQA system that answers questions about product images
4. Create a multimodal index combining your notes (text) with diagrams (images)
5. Experiment with Stable Diffusion prompts — what makes a good prompt?
