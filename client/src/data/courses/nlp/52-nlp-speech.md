---
title: Speech Recognition & Text-to-Speech
---

# Speech Recognition & Text-to-Speech

**Speech Recognition** (ASR — Automatic Speech Recognition) converts spoken language into text. **Text-to-Speech** (TTS) does the opposite — it converts text into spoken audio.

In this lesson, you will learn how speech processing works and how to use Python libraries for ASR and TTS.

---

## The Speech Pipeline

Speech recognition follows this pipeline:

```
Audio Signal → Preprocessing → Feature Extraction → Acoustic Model → Language Model → Text
```

### Steps:

1. **Audio capture**: Record sound as a waveform
2. **Preprocessing**: Noise reduction, normalization
3. **Feature extraction**: Convert audio to numerical features
4. **Acoustic model**: Map features to phonemes/characters
5. **Language model**: Produce grammatically correct text

---

## Audio Basics

Sound is a **pressure wave** that can be represented digitally:

- **Sample rate**: Number of samples per second (e.g., 16,000 Hz)
- **Bit depth**: Precision of each sample (e.g., 16-bit)
- **Channels**: Mono (1) or Stereo (2)

A 16 kHz, 16-bit mono audio file stores 16,000 numbers per second, each between $-32768$ and $32767$.

```python
import numpy as np

# Simulate a simple audio signal (sine wave)
sample_rate = 16000  # 16 kHz
duration = 1.0  # 1 second
frequency = 440  # A4 note (440 Hz)

t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
audio = np.sin(2 * np.pi * frequency * t)

print(f"Sample rate: {sample_rate} Hz")
print(f"Duration: {duration} seconds")
print(f"Total samples: {len(audio)}")
print(f"Audio shape: {audio.shape}")
print(f"Sample values (first 5): {audio[:5]}")
```

**Output:**
```
Sample rate: 16000 Hz
Duration: 1.0 seconds
Total samples: 16000
Audio shape: (16000,)
Sample values (first 5): [0.         0.17258274 0.33873792 0.49213049 0.62698017]
```

---

## Audio Features

Raw audio waveforms are too complex for direct processing. We extract **features** that capture the important characteristics of speech.

### Mel Spectrograms

A **spectrogram** shows how frequencies change over time. The **mel scale** maps frequencies to how humans perceive pitch:

$$f_{mel} = 2595 \cdot \log_{10}\left(1 + \frac{f}{700}\right)$$

```python
import numpy as np

def hz_to_mel(hz):
    """Convert frequency in Hz to Mel scale."""
    return 2595 * np.log10(1 + hz / 700)

def mel_to_hz(mel):
    """Convert Mel scale back to Hz."""
    return 700 * (10 ** (mel / 2595) - 1)

# Example conversions
frequencies = [100, 500, 1000, 2000, 4000, 8000]
for f in frequencies:
    mel = hz_to_mel(f)
    print(f"{f:5d} Hz → {mel:.1f} Mel")
```

**Output:**
```
  100 Hz → 150.5 Mel
  500 Hz → 607.4 Mel
 1000 Hz → 999.9 Mel
 2000 Hz → 1521.1 Mel
 4000 Hz → 2146.1 Mel
 8000 Hz → 2840.0 Mel
```

Notice how the Mel scale compresses higher frequencies — humans are more sensitive to differences at lower frequencies.

### MFCCs (Mel-Frequency Cepstral Coefficients)

**MFCCs** are the most common features for speech recognition:

1. Apply a window to the audio signal
2. Compute the FFT (frequency spectrum)
3. Map to Mel scale using triangular filter banks
4. Take the log of the filter bank energies
5. Apply DCT (Discrete Cosine Transform)

```python
import numpy as np

def compute_mfcc_simple(audio, sample_rate=16000, n_mfcc=13,
                         frame_size=0.025, frame_stride=0.01):
    """Simplified MFCC computation (educational)."""
    # Frame the signal
    frame_length = int(frame_size * sample_rate)
    frame_step = int(frame_stride * sample_rate)
    num_frames = (len(audio) - frame_length) // frame_step + 1

    # Create frames
    frames = np.zeros((num_frames, frame_length))
    for i in range(num_frames):
        start = i * frame_step
        frames[i] = audio[start:start + frame_length]

    # Apply Hamming window
    hamming = np.hamming(frame_length)
    frames *= hamming

    # FFT
    fft_size = 512
    magnitude = np.abs(np.fft.rfft(frames, n=fft_size))
    power_spectrum = magnitude ** 2 / fft_size

    return power_spectrum.shape

# Example
audio = np.random.randn(16000)  # 1 second of "audio"
shape = compute_mfcc_simple(audio)
print(f"Power spectrum shape: {shape}")
print(f"  → {shape[0]} frames, {shape[1]} frequency bins")
```

> **In practice**, use `librosa` for MFCC extraction:
> ```python
> import librosa
> mfccs = librosa.feature.mfcc(y=audio, sr=16000, n_mfcc=13)
> ```

---

## ASR Models

### CTC (Connectionist Temporal Classification)

CTC solves the problem of aligning audio frames to text characters without knowing the exact alignment:

- Input: sequence of audio features (e.g., 100 frames)
- Output: text (e.g., "hello" = 5 characters)
- CTC adds a **blank** token and allows repeated characters
- The model outputs a probability distribution over characters at each frame

The CTC loss marginalizes over all valid alignments:

$$P(Y|X) = \sum_{\pi \in \mathcal{B}^{-1}(Y)} \prod_{t=1}^{T} P(\pi_t | X)$$

where $\mathcal{B}^{-1}(Y)$ is the set of all paths that collapse to $Y$.

### Attention-Based Models

Attention-based ASR (Listen, Attend, and Spell):

1. **Encoder** (Listen): Processes audio features into hidden representations
2. **Attention** (Attend): Learns which parts of audio to focus on
3. **Decoder** (Spell): Generates text character by character

### Whisper

**OpenAI Whisper** is a state-of-the-art ASR model:

- Trained on 680,000 hours of multilingual audio
- Supports 99 languages
- Handles transcription + translation
- Robust to noise, accents, and technical language
- Transformer-based encoder-decoder architecture

---

## Speech Recognition with Whisper

```python
import whisper
import numpy as np

# Load the Whisper model
# Sizes: tiny, base, small, medium, large
model = whisper.load_model("base")

# Transcribe an audio file
result = model.transcribe("audio_sample.wav")

print("Transcription:")
print(result["text"])
print()

# Access detailed segments
print("Segments:")
for segment in result["segments"]:
    start = segment["start"]
    end = segment["end"]
    text = segment["text"]
    print(f"  [{start:.1f}s - {end:.1f}s]: {text}")
```

### Whisper with Different Options

```python
import whisper

model = whisper.load_model("small")

# Transcribe with options
result = model.transcribe(
    "audio_sample.wav",
    language="en",          # Force English
    task="transcribe",      # or "translate" for translation to English
    fp16=False,             # Use float32 (for CPU)
    verbose=True,           # Print progress
)

# Get word-level timestamps (Whisper large-v2+)
result_with_words = model.transcribe(
    "audio_sample.wav",
    word_timestamps=True,
)

for segment in result_with_words["segments"]:
    for word in segment.get("words", []):
        print(f"  {word['word']} [{word['start']:.2f}s - {word['end']:.2f}s]")
```

---

## Using SpeechRecognition Library

The `SpeechRecognition` library provides a simple interface to multiple ASR engines:

```python
import speech_recognition as sr

# Create a recognizer
recognizer = sr.Recognizer()

# From an audio file
with sr.AudioFile("speech.wav") as source:
    # Adjust for ambient noise
    recognizer.adjust_for_ambient_noise(source, duration=0.5)
    # Record audio
    audio = recognizer.record(source)

# Recognize using Google's free API
try:
    text = recognizer.recognize_google(audio)
    print(f"Google: {text}")
except sr.UnknownValueError:
    print("Could not understand audio")
except sr.RequestError as e:
    print(f"API error: {e}")

# From microphone
with sr.Microphone() as source:
    print("Speak now...")
    recognizer.adjust_for_ambient_noise(source)
    audio = recognizer.listen(source, timeout=5)

    try:
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")
    except sr.UnknownValueError:
        print("Could not understand")
```

---

## Text-to-Speech (TTS)

TTS converts text into spoken audio. The pipeline:

```
Text → Text Analysis → Acoustic Model → Vocoder → Audio
```

### TTS Approaches

| Approach | Description | Quality |
|----------|-------------|---------|
| **Concatenative** | Joins pre-recorded speech units | Natural but limited |
| **Parametric** | Generates speech parameters (HMM-based) | Flexible but robotic |
| **Neural** | End-to-end deep learning | Most natural |

### Neural TTS Models

- **Tacotron 2**: Text → Mel spectrogram (attention-based)
- **WaveNet**: Mel spectrogram → waveform (autoregressive)
- **WaveGlow**: Fast parallel waveform generation
- **VITS**: End-to-end text-to-waveform

---

## Text-to-Speech with pyttsx3

`pyttsx3` is an offline TTS library that works across platforms:

```python
import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()

# Get available voices
voices = engine.getProperty("voices")
print("Available voices:")
for i, voice in enumerate(voices):
    print(f"  {i}: {voice.name} ({voice.languages})")

# Configure voice properties
engine.setProperty("rate", 150)      # Speed (words per minute)
engine.setProperty("volume", 0.9)    # Volume (0.0 to 1.0)

# Select a voice (0 = male, 1 = female on most systems)
if len(voices) > 1:
    engine.setProperty("voice", voices[1].id)  # Female voice

# Speak text
engine.say("Hello! I am a text-to-speech engine built with Python.")
engine.say("Natural language processing is fascinating.")

# Run the speech
engine.runAndWait()
print("Done speaking!")
```

### Save Speech to File

```python
import pyttsx3

engine = pyttsx3.init()
engine.setProperty("rate", 140)

# Save to audio file instead of speaking
text = "This is saved as an audio file for later playback."
engine.save_to_file(text, "output_speech.mp3")
engine.runAndWait()

print("Audio saved to output_speech.mp3")
```

---

## Building a Speech Assistant

Combine ASR and TTS to build a simple voice assistant:

```python
import speech_recognition as sr
import pyttsx3
import re

class VoiceAssistant:
    """Simple voice assistant combining ASR and TTS."""

    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 150)
        self.running = True

    def listen(self):
        """Listen for speech and convert to text."""
        with sr.Microphone() as source:
            print("Listening...")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.3)
            try:
                audio = self.recognizer.listen(source, timeout=5)
                text = self.recognizer.recognize_google(audio)
                print(f"You said: {text}")
                return text.lower()
            except (sr.UnknownValueError, sr.WaitTimeoutError):
                return None
            except sr.RequestError:
                self.speak("Sorry, the speech service is unavailable.")
                return None

    def speak(self, text):
        """Convert text to speech."""
        print(f"Assistant: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def process_command(self, command):
        """Process a voice command and respond."""
        if not command:
            return

        if "hello" in command or "hi" in command:
            self.speak("Hello! How can I help you?")

        elif "time" in command:
            from datetime import datetime
            now = datetime.now().strftime("%I:%M %p")
            self.speak(f"The current time is {now}")

        elif "date" in command:
            from datetime import datetime
            today = datetime.now().strftime("%B %d, %Y")
            self.speak(f"Today is {today}")

        elif "calculate" in command:
            # Extract numbers and operation
            numbers = re.findall(r"\d+", command)
            if "plus" in command and len(numbers) >= 2:
                result = int(numbers[0]) + int(numbers[1])
                self.speak(f"The answer is {result}")
            elif "minus" in command and len(numbers) >= 2:
                result = int(numbers[0]) - int(numbers[1])
                self.speak(f"The answer is {result}")
            else:
                self.speak("I can calculate additions and subtractions.")

        elif "stop" in command or "exit" in command:
            self.speak("Goodbye!")
            self.running = False

        else:
            self.speak("I'm not sure how to help with that.")

    def run(self):
        """Main loop for the voice assistant."""
        self.speak("Voice assistant ready. Say something!")

        while self.running:
            command = self.listen()
            self.process_command(command)


# To run: assistant = VoiceAssistant(); assistant.run()
print("Voice Assistant class ready.")
print("Call VoiceAssistant().run() to start (requires microphone).")
```

---

## Advanced: Whisper + TTS Pipeline

```python
import whisper
import pyttsx3

def transcribe_and_respond(audio_path):
    """Transcribe audio and generate a spoken response."""
    # Step 1: Speech to text with Whisper
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    user_text = result["text"].strip()
    print(f"Transcribed: '{user_text}'")

    # Step 2: Simple response logic
    response = generate_response(user_text)
    print(f"Response: '{response}'")

    # Step 3: Text to speech
    engine = pyttsx3.init()
    engine.setProperty("rate", 140)
    engine.say(response)
    engine.runAndWait()

    return user_text, response

def generate_response(text):
    """Generate a simple response based on keywords."""
    text_lower = text.lower()

    if any(w in text_lower for w in ["hello", "hi", "hey"]):
        return "Hello! Nice to hear from you."
    elif "weather" in text_lower:
        return "I'm sorry, I don't have access to weather data."
    elif "name" in text_lower:
        return "I'm a Python-powered voice assistant."
    elif any(w in text_lower for w in ["thank", "thanks"]):
        return "You're welcome!"
    else:
        return f"You said: {text}. I'm still learning to respond to that."

# Example usage (requires audio file)
# transcribe_and_respond("question.wav")
print("Pipeline ready. Provide an audio file to transcribe_and_respond().")
```

---

## Evaluation Metrics for ASR

ASR systems are evaluated using:

### Word Error Rate (WER)

$$WER = \frac{S + D + I}{N}$$

Where:
- $S$ = Substitutions (wrong words)
- $D$ = Deletions (missing words)
- $I$ = Insertions (extra words)
- $N$ = Total words in reference

```python
def word_error_rate(reference, hypothesis):
    """Calculate Word Error Rate using dynamic programming."""
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()

    # Build distance matrix
    n = len(ref_words)
    m = len(hyp_words)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref_words[i - 1] == hyp_words[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(
                    dp[i - 1][j] + 1,      # Deletion
                    dp[i][j - 1] + 1,      # Insertion
                    dp[i - 1][j - 1] + 1,  # Substitution
                )

    wer = dp[n][m] / n if n > 0 else 0.0
    return wer

# Test
reference = "the cat sat on the mat"
hypothesis = "the cat sit on a mat"

wer = word_error_rate(reference, hypothesis)
print(f"Reference:  '{reference}'")
print(f"Hypothesis: '{hypothesis}'")
print(f"WER: {wer:.2%}")
```

**Output:**
```
Reference:  'the cat sat on the mat'
Hypothesis: 'the cat sit on a mat'
WER: 33.33%
```

---

## Summary

| Concept | Description |
|---------|-------------|
| ASR | Automatic Speech Recognition (audio → text) |
| TTS | Text-to-Speech (text → audio) |
| Mel Spectrogram | Frequency representation on human-perceived scale |
| MFCC | Compact audio features for speech |
| CTC | Alignment-free training for ASR |
| Whisper | OpenAI's multilingual ASR model |
| WER | Word Error Rate — ASR evaluation metric |
| pyttsx3 | Offline Python TTS library |

---

## Exercises

1. Record yourself saying a sentence and transcribe it with Whisper
2. Compare WER across different Whisper model sizes (tiny, base, small)
3. Build a TTS reader that reads a text file aloud paragraph by paragraph
4. Create a voice-controlled calculator using ASR + TTS
5. Implement a real-time transcription tool that prints text as you speak
