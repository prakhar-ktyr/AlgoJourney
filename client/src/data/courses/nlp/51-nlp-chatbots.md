---
title: Building Chatbots
---

# Building Chatbots

A **chatbot** is a program that simulates human conversation. Chatbots are used in customer service, virtual assistants, education, and entertainment.

In this lesson, you will learn how to build chatbots using NLP techniques.

---

## Types of Chatbots

There are three main types of chatbots:

| Type | How It Works | Example |
|------|-------------|---------|
| **Rule-based** | Follows predefined rules and patterns | FAQ bots |
| **Retrieval-based** | Selects best response from a database | Customer support bots |
| **Generative** | Generates new responses using neural networks | ChatGPT, Bard |

---

## Rule-Based Chatbots

Rule-based chatbots use **pattern matching** to understand user input and respond with predefined answers.

### Key Concepts

- **Intents**: What the user wants (e.g., "greeting", "ask_price", "goodbye")
- **Entities**: Specific details in the input (e.g., product name, date, location)
- **Patterns**: Keywords or phrases that map to intents

### Simple Pattern Matching

```python
import re

# Define rules as (pattern, response) pairs
rules = [
    (r"hi|hello|hey", "Hello! How can I help you?"),
    (r"bye|goodbye", "Goodbye! Have a great day!"),
    (r"what is your name", "I'm a chatbot built with Python!"),
    (r"how are you", "I'm doing well, thank you for asking!"),
    (r"help", "I can answer questions about our products. Try asking about prices!"),
]

def rule_based_chat(user_input):
    """Match user input against rules."""
    user_input = user_input.lower().strip()

    for pattern, response in rules:
        if re.search(pattern, user_input):
            return response

    return "I'm sorry, I don't understand. Can you rephrase?"

# Test the chatbot
messages = ["Hello!", "What is your name?", "How are you?", "Tell me a joke"]
for msg in messages:
    print(f"User: {msg}")
    print(f"Bot: {rule_based_chat(msg)}")
    print()
```

**Output:**
```
User: Hello!
Bot: Hello! How can I help you?

User: What is your name?
Bot: I'm a chatbot built with Python!

User: How are you?
Bot: I'm doing well, thank you for asking!

User: Tell me a joke
Bot: I'm sorry, I don't understand. Can you rephrase?
```

---

## Intent Classification

A more robust approach uses **intent classification** — training a model to recognize what the user wants.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np

# Training data: (text, intent)
training_data = [
    ("hello", "greeting"),
    ("hi there", "greeting"),
    ("hey", "greeting"),
    ("good morning", "greeting"),
    ("what's up", "greeting"),
    ("bye", "goodbye"),
    ("goodbye", "goodbye"),
    ("see you later", "goodbye"),
    ("take care", "goodbye"),
    ("what is the price", "ask_price"),
    ("how much does it cost", "ask_price"),
    ("tell me the price", "ask_price"),
    ("what are your prices", "ask_price"),
    ("where are you located", "ask_location"),
    ("what is your address", "ask_location"),
    ("how do I find you", "ask_location"),
    ("what are your hours", "ask_hours"),
    ("when are you open", "ask_hours"),
    ("opening hours", "ask_hours"),
]

texts = [t[0] for t in training_data]
labels = [t[1] for t in training_data]

# Train intent classifier
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

classifier = LogisticRegression(max_iter=1000)
classifier.fit(X, labels)

def classify_intent(user_input):
    """Predict the intent of user input."""
    X_input = vectorizer.transform([user_input.lower()])
    intent = classifier.predict(X_input)[0]
    confidence = classifier.predict_proba(X_input).max()
    return intent, confidence

# Test
test_inputs = ["hi!", "what does it cost?", "where is your shop?"]
for inp in test_inputs:
    intent, conf = classify_intent(inp)
    print(f"Input: '{inp}' → Intent: {intent} (confidence: {conf:.2f})")
```

---

## Entity Extraction

**Entities** are specific pieces of information in user input:

```python
import re

def extract_entities(text):
    """Extract common entities from text."""
    entities = {}

    # Extract email
    email_pattern = r"[\w.+-]+@[\w-]+\.[\w.-]+"
    emails = re.findall(email_pattern, text)
    if emails:
        entities["email"] = emails[0]

    # Extract phone number
    phone_pattern = r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"
    phones = re.findall(phone_pattern, text)
    if phones:
        entities["phone"] = phones[0]

    # Extract date
    date_pattern = r"\b\d{1,2}/\d{1,2}/\d{2,4}\b"
    dates = re.findall(date_pattern, text)
    if dates:
        entities["date"] = dates[0]

    # Extract numbers
    number_pattern = r"\b\d+\b"
    numbers = re.findall(number_pattern, text)
    if numbers:
        entities["numbers"] = numbers

    return entities

# Test
texts = [
    "My email is john@example.com and I need help",
    "Call me at 555-123-4567 tomorrow",
    "I want to book for 3 people on 12/25/2024",
]

for text in texts:
    print(f"Text: '{text}'")
    print(f"Entities: {extract_entities(text)}")
    print()
```

---

## Retrieval-Based Chatbots

Retrieval-based chatbots find the **best matching response** from a database of question-answer pairs.

The idea is simple:
1. Store a database of questions and answers
2. When a user asks something, find the most similar question
3. Return the corresponding answer

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Knowledge base: (question, answer) pairs
knowledge_base = [
    ("What are your business hours?", "We are open Monday to Friday, 9 AM to 5 PM."),
    ("How can I contact support?", "You can email us at support@example.com or call 555-0100."),
    ("What is your return policy?", "You can return items within 30 days of purchase."),
    ("Do you offer free shipping?", "Yes, we offer free shipping on orders over $50."),
    ("Where are you located?", "Our office is at 123 Main Street, New York."),
    ("How do I reset my password?", "Click 'Forgot Password' on the login page and follow the instructions."),
    ("What payment methods do you accept?", "We accept credit cards, PayPal, and bank transfers."),
    ("Can I cancel my order?", "You can cancel within 24 hours of placing the order."),
    ("Do you have a mobile app?", "Yes! Download our app from the App Store or Google Play."),
    ("How long does shipping take?", "Standard shipping takes 3-5 business days."),
]

questions = [q for q, a in knowledge_base]
answers = [a for q, a in knowledge_base]

# Build TF-IDF vectors for all questions
vectorizer = TfidfVectorizer()
question_vectors = vectorizer.fit_transform(questions)

def find_best_response(user_input, threshold=0.2):
    """Find the most similar question and return its answer."""
    user_vector = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vector, question_vectors)[0]

    best_idx = np.argmax(similarities)
    best_score = similarities[best_idx]

    if best_score < threshold:
        return "I'm not sure about that. Can you please rephrase your question?"

    return f"{answers[best_idx]} (confidence: {best_score:.2f})"

# Test the retrieval chatbot
test_questions = [
    "When are you open?",
    "How do I return a product?",
    "Is shipping free?",
    "What's the weather like?",
]

for q in test_questions:
    print(f"User: {q}")
    print(f"Bot: {find_best_response(q)}")
    print()
```

---

## Generative Chatbots

Generative chatbots create **new responses** using neural networks. They use:

- **Seq2Seq models**: Encoder reads input, decoder generates output
- **Transformer models**: Self-attention for better context understanding
- **Large Language Models**: GPT, LLaMA, etc.

### Architecture

The basic generative chatbot pipeline:

1. **Tokenize** user input
2. **Encode** the input into a representation
3. **Decode** to generate a response token by token
4. **Post-process** (remove special tokens, format)

```python
# Using a pre-trained model for generation (conceptual example)
from transformers import pipeline

# Load a conversational model
chatbot = pipeline("text-generation", model="microsoft/DialoGPT-small")

def generative_chat(user_input, chat_history=""):
    """Generate a response using a language model."""
    prompt = f"{chat_history}User: {user_input}\nBot:"
    response = chatbot(
        prompt,
        max_new_tokens=50,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
    )
    generated = response[0]["generated_text"]
    # Extract just the bot's response
    bot_response = generated.split("Bot:")[-1].strip()
    return bot_response
```

> **Note:** Running generative models requires significant compute. For learning, start with retrieval-based approaches.

---

## Dialog Management

Dialog management tracks **conversation state** across multiple turns:

```python
class DialogManager:
    """Simple dialog state tracker."""

    def __init__(self):
        self.state = {
            "intent": None,
            "entities": {},
            "context": [],
            "turn_count": 0,
        }
        self.slots = {}  # Information collected from user

    def update_state(self, intent, entities):
        """Update dialog state with new information."""
        self.state["intent"] = intent
        self.state["entities"].update(entities)
        self.state["turn_count"] += 1
        self.state["context"].append(intent)

        # Fill slots based on entities
        for key, value in entities.items():
            self.slots[key] = value

    def get_next_action(self):
        """Decide what to do next based on state."""
        intent = self.state["intent"]

        if intent == "book_restaurant":
            # Check required slots
            required = ["date", "time", "party_size"]
            missing = [s for s in required if s not in self.slots]

            if missing:
                return f"ask_for_{missing[0]}"
            else:
                return "confirm_booking"

        elif intent == "greeting":
            return "greet_back"

        return "fallback"

    def reset(self):
        """Reset dialog state."""
        self.state = {"intent": None, "entities": {}, "context": [], "turn_count": 0}
        self.slots = {}


# Example usage
dm = DialogManager()

# Turn 1: User wants to book
dm.update_state("book_restaurant", {})
print(f"Turn 1 - Next action: {dm.get_next_action()}")

# Turn 2: User provides date
dm.update_state("provide_info", {"date": "Friday"})
print(f"Turn 2 - Next action: {dm.get_next_action()}")

# Turn 3: User provides time
dm.update_state("provide_info", {"time": "7 PM"})
print(f"Turn 3 - Next action: {dm.get_next_action()}")

# Turn 4: User provides party size
dm.update_state("provide_info", {"party_size": "4"})
print(f"Turn 4 - Next action: {dm.get_next_action()}")
```

**Output:**
```
Turn 1 - Next action: ask_for_date
Turn 2 - Next action: ask_for_time
Turn 3 - Next action: ask_for_party_size
Turn 4 - Next action: confirm_booking
```

---

## Chatbot Frameworks

### Rasa (Open Source)

Rasa is a popular open-source framework for building chatbots:

- **Rasa NLU**: Intent classification and entity extraction
- **Rasa Core**: Dialog management with machine learning
- **Stories**: Define conversation flows
- **Actions**: Custom Python code for complex logic

### Google Dialogflow

Dialogflow is a cloud-based chatbot platform:

- Visual flow builder
- Pre-built agents for common use cases
- Integrations with Google Assistant, Slack, etc.
- Supports multiple languages

---

## Building a Complete Chatbot

Let's build a chatbot from scratch that combines intent classification, entity extraction, and response generation:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

class SimpleChatbot:
    """A complete intent-based chatbot with TF-IDF matching."""

    def __init__(self):
        self.intents = {
            "greeting": {
                "patterns": [
                    "hello", "hi", "hey", "good morning",
                    "good afternoon", "what's up", "howdy",
                ],
                "responses": [
                    "Hello! How can I help you today?",
                    "Hi there! What can I do for you?",
                    "Hey! How may I assist you?",
                ],
            },
            "goodbye": {
                "patterns": [
                    "bye", "goodbye", "see you", "take care",
                    "good night", "I'm leaving",
                ],
                "responses": [
                    "Goodbye! Have a wonderful day!",
                    "See you later! Take care!",
                    "Bye! Feel free to come back anytime!",
                ],
            },
            "thanks": {
                "patterns": [
                    "thanks", "thank you", "appreciate it",
                    "that's helpful", "thanks a lot",
                ],
                "responses": [
                    "You're welcome!",
                    "Happy to help!",
                    "Anytime! Let me know if you need more help.",
                ],
            },
            "ask_product": {
                "patterns": [
                    "what products do you have",
                    "show me products",
                    "what do you sell",
                    "product list",
                    "available items",
                ],
                "responses": [
                    "We offer laptops, phones, tablets, and accessories. What interests you?",
                ],
            },
            "ask_price": {
                "patterns": [
                    "how much", "what is the price",
                    "cost of", "pricing", "how expensive",
                ],
                "responses": [
                    "Our prices range from $99 to $1999. Which product are you interested in?",
                ],
            },
            "ask_shipping": {
                "patterns": [
                    "shipping", "delivery", "how long to ship",
                    "shipping cost", "free delivery",
                ],
                "responses": [
                    "We offer free shipping on orders over $50. Standard delivery takes 3-5 days.",
                ],
            },
        }

        # Build the TF-IDF model
        self._build_model()

    def _build_model(self):
        """Build TF-IDF vectors for all patterns."""
        self.all_patterns = []
        self.pattern_intents = []

        for intent, data in self.intents.items():
            for pattern in data["patterns"]:
                self.all_patterns.append(pattern)
                self.pattern_intents.append(intent)

        self.vectorizer = TfidfVectorizer()
        self.pattern_vectors = self.vectorizer.fit_transform(self.all_patterns)

    def predict_intent(self, user_input):
        """Predict intent using TF-IDF cosine similarity."""
        user_vector = self.vectorizer.transform([user_input.lower()])
        similarities = cosine_similarity(user_vector, self.pattern_vectors)[0]

        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]

        if best_score < 0.15:
            return "unknown", best_score

        return self.pattern_intents[best_idx], best_score

    def get_response(self, user_input):
        """Get chatbot response for user input."""
        intent, confidence = self.predict_intent(user_input)

        if intent == "unknown":
            return "I'm not sure I understand. Could you rephrase that?"

        responses = self.intents[intent]["responses"]
        response = np.random.choice(responses)
        return response

    def chat(self):
        """Interactive chat loop."""
        print("Chatbot: Hello! I'm here to help. Type 'quit' to exit.")
        print("-" * 50)

        while True:
            user_input = input("You: ").strip()
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Chatbot: Goodbye!")
                break

            response = self.get_response(user_input)
            print(f"Chatbot: {response}")
            print()


# Create and test the chatbot
bot = SimpleChatbot()

test_messages = [
    "Hello there!",
    "What products are available?",
    "How much do they cost?",
    "Do you have free shipping?",
    "Thank you so much!",
    "Bye bye!",
]

print("=" * 50)
print("CHATBOT DEMO")
print("=" * 50)
for msg in test_messages:
    response = bot.get_response(msg)
    print(f"User: {msg}")
    print(f"Bot: {response}")
    print()
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Rule-based | Pattern matching with regex |
| Retrieval-based | Find best match from knowledge base |
| Generative | Neural network creates new responses |
| Intent | What the user wants to do |
| Entity | Specific details (dates, names, numbers) |
| Dialog management | Tracking conversation state |
| TF-IDF matching | Finding similar text using vectors |

---

## Exercises

1. Add more intents to the `SimpleChatbot` (e.g., "ask_refund", "ask_warranty")
2. Implement entity extraction to handle "How much is the laptop?"
3. Add conversation memory so the bot remembers previous questions
4. Build a dialog flow for booking a flight (collect origin, destination, date)
5. Compare TF-IDF matching with sentence transformers for intent classification
