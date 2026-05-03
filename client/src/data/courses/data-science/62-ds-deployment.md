---
title: Deploying Data Science Projects
---

# Deploying Data Science Projects

A model in a notebook is a prototype. A model in production is a product. This lesson covers the essential skills to move your data science work from a local environment to where others can use it — whether that's a REST API, a dashboard, or an automated pipeline.

---

## From Notebook to Production

The "last mile" problem in data science:

| Notebook | Production |
|----------|-----------|
| Run manually | Runs automatically |
| Single user | Many users simultaneously |
| Works on your machine | Works everywhere |
| No error handling | Graceful failure and recovery |
| Ad-hoc dependencies | Reproducible environment |

The deployment journey:

1. Train and validate model → 2. Serialize model → 3. Build API/app → 4. Containerize → 5. Deploy to cloud → 6. Monitor

---

## Model Serialization

Before deploying, you need to save your trained model to disk.

### Using joblib (Recommended for scikit-learn)

```python
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

# Train a model
X_train = np.random.randn(100, 5)
y_train = np.random.randint(0, 2, 100)

# Build a complete pipeline (preprocessing + model)
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])
pipeline.fit(X_train, y_train)

# Save the ENTIRE pipeline (not just the model)
joblib.dump(pipeline, 'model_pipeline.pkl')
print("Model saved successfully!")

# Load it back
loaded_pipeline = joblib.load('model_pipeline.pkl')

# Verify it works
X_new = np.random.randn(5, 5)
predictions = loaded_pipeline.predict(X_new)
print(f"Predictions: {predictions}")
```

### Versioning Your Models

```python
import joblib
from datetime import datetime
import json

def save_model_with_metadata(pipeline, metrics, version=None):
    """Save model with metadata for tracking."""
    if version is None:
        version = datetime.now().strftime("%Y%m%d_%H%M%S")

    model_path = f"models/model_v{version}.pkl"
    meta_path = f"models/model_v{version}_metadata.json"

    # Save model
    joblib.dump(pipeline, model_path)

    # Save metadata
    metadata = {
        "version": version,
        "created_at": datetime.now().isoformat(),
        "metrics": metrics,
        "features": list(getattr(pipeline, 'feature_names_in_', [])),
        "model_type": type(pipeline.named_steps.get('model', pipeline)).__name__
    }

    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved model v{version}")
    print(f"  Path: {model_path}")
    print(f"  Metrics: {metrics}")

    return model_path

# Usage
metrics = {"accuracy": 0.87, "f1": 0.83, "auc": 0.91}
save_model_with_metadata(pipeline, metrics, version="1.0.0")
```

---

## REST API with FastAPI

FastAPI is the modern choice for serving ML models — it's fast, has automatic docs, and built-in validation.

### Basic Model Serving

```python
# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np

# Initialize app
app = FastAPI(
    title="Churn Prediction API",
    description="Predict customer churn probability",
    version="1.0.0"
)

# Load model at startup
model = joblib.load("model_pipeline.pkl")


# Define input schema with validation
class CustomerFeatures(BaseModel):
    tenure: int = Field(..., ge=0, le=72, description="Months as customer")
    monthly_charges: float = Field(..., ge=0, description="Monthly bill amount")
    total_charges: float = Field(..., ge=0, description="Total amount billed")
    contract_type: int = Field(..., ge=0, le=2, description="0=month, 1=year, 2=two-year")
    internet_service: int = Field(..., ge=0, le=2, description="0=no, 1=DSL, 2=fiber")

    class Config:
        json_schema_extra = {
            "example": {
                "tenure": 24,
                "monthly_charges": 65.5,
                "total_charges": 1572.0,
                "contract_type": 1,
                "internet_service": 2
            }
        }


# Define output schema
class PredictionResponse(BaseModel):
    churn_probability: float
    prediction: str
    risk_level: str


@app.get("/health")
def health_check():
    """Check if the API is running."""
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerFeatures):
    """Predict churn probability for a customer."""
    try:
        # Convert input to array
        features = np.array([[
            customer.tenure,
            customer.monthly_charges,
            customer.total_charges,
            customer.contract_type,
            customer.internet_service
        ]])

        # Get prediction and probability
        probability = model.predict_proba(features)[0][1]
        prediction = "Churn" if probability >= 0.5 else "Stay"

        # Determine risk level
        if probability >= 0.7:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return PredictionResponse(
            churn_probability=round(float(probability), 4),
            prediction=prediction,
            risk_level=risk_level
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
def predict_batch(customers: list[CustomerFeatures]):
    """Predict churn for multiple customers."""
    results = []
    for customer in customers:
        result = predict_churn(customer)
        results.append(result)
    return results
```

### Running the API

```python
# Run from terminal:
# uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Then visit:
# http://localhost:8000/docs  → Interactive API documentation
# http://localhost:8000/health → Health check

# Test with curl:
# curl -X POST "http://localhost:8000/predict" \
#   -H "Content-Type: application/json" \
#   -d '{"tenure": 24, "monthly_charges": 65.5, "total_charges": 1572.0,
#         "contract_type": 1, "internet_service": 2}'
```

### Testing the API with Python

```python
import requests

# Test the prediction endpoint
url = "http://localhost:8000/predict"

test_customer = {
    "tenure": 2,
    "monthly_charges": 89.5,
    "total_charges": 179.0,
    "contract_type": 0,   # month-to-month
    "internet_service": 2  # fiber
}

response = requests.post(url, json=test_customer)
print(f"Status: {response.status_code}")
print(f"Result: {response.json()}")
# {'churn_probability': 0.7823, 'prediction': 'Churn', 'risk_level': 'High'}
```

---

## Docker: Reproducible Environments

Docker packages your app with all its dependencies into a container that runs the same everywhere.

### Dockerfile

```python
# Dockerfile
"""
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY model_pipeline.pkl .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
"""
```

### requirements.txt

```python
# requirements.txt
"""
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
joblib==1.3.2
numpy==1.26.2
pydantic==2.5.2
"""
```

### Building and Running

```python
# Build the Docker image
# docker build -t churn-predictor .

# Run the container
# docker run -p 8000:8000 churn-predictor

# Run in background (detached)
# docker run -d -p 8000:8000 --name churn-api churn-predictor

# Check logs
# docker logs churn-api

# Stop the container
# docker stop churn-api
```

### Docker Compose (with multiple services)

```python
# docker-compose.yml
"""
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/model_pipeline.pkl
    volumes:
      - ./models:/app/models
    restart: unless-stopped

  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
"""
```

---

## Cloud Deployment Options

### Streamlit Cloud (Dashboards — Free)

```python
# streamlit_app.py
import streamlit as st
import joblib
import numpy as np

st.title("Customer Churn Predictor")
st.write("Enter customer details to predict churn risk.")

# Input form
col1, col2 = st.columns(2)
with col1:
    tenure = st.slider("Tenure (months)", 0, 72, 12)
    monthly_charges = st.number_input("Monthly Charges ($)", 0.0, 200.0, 65.0)

with col2:
    contract = st.selectbox("Contract Type",
                           ["Month-to-Month", "One Year", "Two Year"])
    internet = st.selectbox("Internet Service",
                           ["No", "DSL", "Fiber Optic"])

# Convert inputs
contract_map = {"Month-to-Month": 0, "One Year": 1, "Two Year": 2}
internet_map = {"No": 0, "DSL": 1, "Fiber Optic": 2}

if st.button("Predict Churn"):
    model = joblib.load("model_pipeline.pkl")
    features = np.array([[
        tenure, monthly_charges, tenure * monthly_charges,
        contract_map[contract], internet_map[internet]
    ]])

    probability = model.predict_proba(features)[0][1]

    # Display result with color coding
    if probability >= 0.7:
        st.error(f"High Churn Risk: {probability:.1%}")
    elif probability >= 0.4:
        st.warning(f"Medium Churn Risk: {probability:.1%}")
    else:
        st.success(f"Low Churn Risk: {probability:.1%}")

# Deploy to Streamlit Cloud:
# 1. Push code to GitHub
# 2. Go to share.streamlit.io
# 3. Connect your repo
# 4. Select streamlit_app.py
# 5. Deploy!
```

### AWS Lambda (Serverless)

```python
# lambda_function.py
import json
import joblib
import numpy as np
import boto3

# Load model from S3 (or package with Lambda)
s3 = boto3.client('s3')

def load_model():
    s3.download_file('my-bucket', 'models/model.pkl', '/tmp/model.pkl')
    return joblib.load('/tmp/model.pkl')

model = load_model()

def lambda_handler(event, context):
    """AWS Lambda handler for predictions."""
    try:
        body = json.loads(event.get('body', '{}'))

        features = np.array([[
            body['tenure'],
            body['monthly_charges'],
            body['total_charges'],
            body['contract_type'],
            body['internet_service']
        ]])

        probability = float(model.predict_proba(features)[0][1])

        return {
            'statusCode': 200,
            'body': json.dumps({
                'churn_probability': round(probability, 4),
                'prediction': 'Churn' if probability >= 0.5 else 'Stay'
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

---

## Batch vs Real-Time Predictions

### Batch Processing

For scheduled predictions on large datasets:

```python
import pandas as pd
import joblib
from datetime import datetime

def run_batch_predictions(input_path, output_path, model_path):
    """Run predictions on a batch of customers."""
    # Load
    model = joblib.load(model_path)
    df = pd.read_csv(input_path)

    print(f"Processing {len(df)} customers...")

    # Predict
    features = df[['tenure', 'monthly_charges', 'total_charges',
                   'contract_type', 'internet_service']]
    df['churn_probability'] = model.predict_proba(features)[:, 1]
    df['churn_prediction'] = (df['churn_probability'] >= 0.5).astype(int)
    df['risk_level'] = pd.cut(
        df['churn_probability'],
        bins=[0, 0.3, 0.6, 1.0],
        labels=['Low', 'Medium', 'High']
    )
    df['scored_at'] = datetime.now().isoformat()

    # Save results
    df.to_csv(output_path, index=False)
    print(f"Results saved to {output_path}")

    # Summary
    print(f"\nRisk Distribution:")
    print(df['risk_level'].value_counts())

    return df

# Usage: run nightly via cron or Airflow
# run_batch_predictions('customers.csv', 'predictions_20240115.csv', 'model.pkl')
```

### When to Use Each

| Criteria | Batch | Real-Time |
|----------|-------|-----------|
| Latency requirement | Hours/minutes OK | Milliseconds needed |
| Volume | Thousands/millions at once | One at a time |
| Use case | Reports, email campaigns | Web app, chat support |
| Infrastructure | Scheduled job (cron/Airflow) | API endpoint |
| Cost | Lower (runs periodically) | Higher (always on) |

---

## Monitoring in Production

Once deployed, you need to track model health:

### Performance Monitoring

```python
import logging
from datetime import datetime
import json

# Set up logging
logging.basicConfig(
    filename='predictions.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

def log_prediction(input_features, prediction, probability):
    """Log every prediction for monitoring."""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "features": input_features,
        "prediction": prediction,
        "probability": probability
    }
    logging.info(json.dumps(log_entry))


def check_data_drift(recent_predictions, baseline_stats):
    """
    Simple drift detection: compare recent feature
    distributions to training baseline.
    """
    import numpy as np

    alerts = []
    for feature, baseline in baseline_stats.items():
        recent_mean = np.mean(recent_predictions[feature])
        recent_std = np.std(recent_predictions[feature])

        # Alert if mean shifted more than 2 standard deviations
        if abs(recent_mean - baseline['mean']) > 2 * baseline['std']:
            alerts.append({
                "feature": feature,
                "baseline_mean": baseline['mean'],
                "current_mean": recent_mean,
                "drift_magnitude": abs(recent_mean - baseline['mean']) / baseline['std']
            })

    if alerts:
        logging.warning(f"DATA DRIFT DETECTED: {json.dumps(alerts)}")

    return alerts


def monitor_model_performance(predictions_log, actual_outcomes):
    """
    Compare predictions to actual outcomes
    once ground truth becomes available.
    """
    from sklearn.metrics import accuracy_score, f1_score

    accuracy = accuracy_score(actual_outcomes, predictions_log['prediction'])
    f1 = f1_score(actual_outcomes, predictions_log['prediction'])

    metrics = {
        "accuracy": accuracy,
        "f1_score": f1,
        "evaluated_at": datetime.now().isoformat(),
        "sample_size": len(actual_outcomes)
    }

    # Alert if performance drops
    if f1 < 0.75:  # Threshold from training
        logging.critical(f"MODEL DEGRADATION: F1={f1:.3f} below threshold 0.75")

    return metrics
```

---

## MLOps Basics

MLOps brings DevOps practices to machine learning:

### Key Principles

```python
# MLOps checklist for data science projects

mlops_checklist = {
    "Version Control": {
        "code": "Git (GitHub, GitLab)",
        "data": "DVC (Data Version Control)",
        "models": "MLflow Model Registry",
        "experiments": "MLflow / Weights & Biases"
    },
    "CI/CD": {
        "tests": "Unit tests for data processing and model code",
        "validation": "Automated model validation before deployment",
        "deployment": "Automated deployment on merge to main"
    },
    "Monitoring": {
        "performance": "Track accuracy, latency, throughput",
        "data_quality": "Validate input data schema and distributions",
        "drift": "Detect feature drift and concept drift",
        "alerts": "Automated alerts when metrics degrade"
    },
    "Reproducibility": {
        "environment": "Docker, requirements.txt, conda.yml",
        "random_seeds": "Fixed seeds for reproducible training",
        "config": "Experiment configs in version control"
    }
}
```

### Project Structure for Production

```python
# Recommended project structure
"""
my_ml_project/
├── data/
│   ├── raw/              # Original data (never modify)
│   ├── processed/        # Cleaned data
│   └── features/         # Feature-engineered data
├── models/
│   ├── trained/          # Serialized models
│   └── metadata/         # Model metadata and metrics
├── src/
│   ├── data/             # Data loading and processing
│   ├── features/         # Feature engineering
│   ├── models/           # Model training and evaluation
│   └── api/              # API code (FastAPI)
├── tests/
│   ├── test_data.py      # Data processing tests
│   ├── test_features.py  # Feature engineering tests
│   └── test_api.py       # API endpoint tests
├── notebooks/            # Exploration notebooks
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── Makefile              # Common commands
└── README.md
"""
```

---

## Putting It All Together

```python
# Complete deployment script
"""
# Step 1: Train and save model
python src/models/train.py --config configs/production.yml

# Step 2: Run tests
pytest tests/ -v

# Step 3: Build Docker image
docker build -t churn-predictor:v1.0.0 .

# Step 4: Test locally
docker run -p 8000:8000 churn-predictor:v1.0.0
curl http://localhost:8000/health

# Step 5: Push to registry
docker tag churn-predictor:v1.0.0 myregistry/churn-predictor:v1.0.0
docker push myregistry/churn-predictor:v1.0.0

# Step 6: Deploy (example with Cloud Run)
gcloud run deploy churn-api \
    --image myregistry/churn-predictor:v1.0.0 \
    --port 8000 \
    --memory 2Gi \
    --allow-unauthenticated
"""
```

---

## Summary

Deploying data science projects bridges the gap between analysis and impact:

| Step | Tool | Purpose |
|------|------|---------|
| Serialize | joblib | Save model to disk |
| Serve | FastAPI | Create prediction API |
| Package | Docker | Reproducible environment |
| Deploy | Cloud (AWS/GCP/Azure) | Make accessible |
| Monitor | Logging + metrics | Track health |
| Automate | MLOps (CI/CD) | Continuous improvement |

Key takeaways:
- Always save the **entire pipeline** (preprocessing + model)
- Use **FastAPI** for modern, validated APIs
- **Docker** ensures your code runs the same everywhere
- Start simple (Streamlit Cloud), scale as needed
- Monitor everything — models degrade over time

Your model is only valuable when people can use it. Deploy early, iterate often.
