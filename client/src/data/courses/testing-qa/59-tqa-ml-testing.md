---
title: Testing Machine Learning Systems
---

# Testing Machine Learning Systems

Machine learning systems introduce unique testing challenges. Models are non-deterministic, data-dependent, and their behavior evolves over time.

## ML Testing Challenges

### Non-Determinism

ML models can produce different outputs for the same input depending on:

- Random weight initialization
- Training data shuffling
- Hardware differences (GPU vs CPU floating point)
- Library version differences

### Data Dependency

- Training data quality directly impacts model quality
- Data distribution shifts cause silent failures
- Missing or corrupted features degrade predictions without errors

## Data Validation

### Schema Validation

Ensure incoming data matches expected structure before feeding it to models:

- Column presence and types
- Value ranges and distributions
- Null/missing value rates
- Categorical value sets

### Distribution Drift Detection

Monitor for shifts between training data and production data:

- **Feature drift**: input distribution changes
- **Label drift**: target variable distribution changes
- **Concept drift**: relationship between features and labels changes

Common techniques: Kolmogorov-Smirnov test, Chi-squared test, Population Stability Index (PSI).

## Model Validation Metrics

| Metric | Formula | Use Case |
|--------|---------|----------|
| Accuracy | (TP+TN)/(TP+TN+FP+FN) | Balanced classes |
| Precision | TP/(TP+FP) | Minimize false positives |
| Recall | TP/(TP+FN) | Minimize false negatives |
| F1 Score | 2*(P*R)/(P+R) | Balance precision/recall |

## Training Pipeline Testing

### Reproducibility

- Fix random seeds across all sources of randomness
- Version training data alongside model code
- Log hyperparameters and environment details
- Verify identical inputs produce identical outputs (within tolerance)

### Pipeline Integration Tests

- Test data preprocessing transforms in isolation
- Verify feature engineering produces expected shapes
- Test model serialization/deserialization roundtrip

## A/B Testing for Models

- Define clear success metrics before deployment
- Calculate required sample size for statistical significance
- Use proper randomization for user assignment
- Track prediction latency, error rates, and disparate impact
- Set automatic rollback thresholds

## Testing ML APIs

- Reject malformed requests early with meaningful errors
- Validate feature value ranges
- Verify response schema consistency
- Check confidence scores are properly calibrated
- Ensure predictions are within valid output ranges

## Code: Test ML Prediction Service + Data Validation

```python
import pytest
from unittest.mock import Mock
import numpy as np


class DataValidator:
    def __init__(self, schema):
        self.schema = schema

    def validate(self, features):
        if len(features) != self.schema["num_features"]:
            raise ValueError(
                f"Expected {self.schema['num_features']} features, got {len(features)}"
            )
        for i, (val, (low, high)) in enumerate(zip(features, self.schema["ranges"])):
            if not (low <= val <= high):
                raise ValueError(f"Feature {i} value {val} outside range [{low}, {high}]")
        return True

    def check_drift(self, data, ref_mean, ref_std):
        current_mean = np.mean(data, axis=0)
        z_scores = np.abs((current_mean - ref_mean) / ref_std)
        return z_scores < 3.0


class MLService:
    def __init__(self, model, validator):
        self.model = model
        self.validator = validator

    def predict(self, features):
        self.validator.validate(features)
        prediction = self.model.predict([features])[0]
        confidence = self.model.predict_proba([features])[0].max()
        return {"prediction": prediction, "confidence": confidence}


class TestDataValidator:
    def setup_method(self):
        self.validator = DataValidator({
            "num_features": 3,
            "ranges": [(0, 10), (0, 100), (-1, 1)],
        })

    def test_valid_features_pass(self):
        assert self.validator.validate([5.0, 50.0, 0.5])

    def test_wrong_count_raises(self):
        with pytest.raises(ValueError, match="Expected 3"):
            self.validator.validate([1.0, 2.0])

    def test_out_of_range_raises(self):
        with pytest.raises(ValueError, match="outside range"):
            self.validator.validate([15.0, 50.0, 0.5])


class TestMLService:
    def setup_method(self):
        self.mock_model = Mock()
        self.mock_model.predict.return_value = [0.85]
        self.mock_model.predict_proba.return_value = [np.array([0.15, 0.85])]
        validator = DataValidator({"num_features": 3, "ranges": [(0, 10)] * 3})
        self.service = MLService(self.mock_model, validator)

    def test_valid_prediction(self):
        result = self.service.predict([1.0, 2.0, 3.0])
        assert result["prediction"] == 0.85
        assert result["confidence"] == 0.85

    def test_invalid_input_rejected(self):
        with pytest.raises(ValueError):
            self.service.predict([99.0, 2.0, 3.0])
```

```javascript
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

class DataValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(features) {
    if (features.length !== this.schema.numFeatures) {
      throw new Error(`Expected ${this.schema.numFeatures} features, got ${features.length}`);
    }
    for (let i = 0; i < features.length; i++) {
      const [low, high] = this.schema.ranges[i];
      if (features[i] < low || features[i] > high) {
        throw new Error(`Feature ${i} outside range [${low}, ${high}]`);
      }
    }
  }
}

class MLService {
  constructor(model, validator) {
    this.model = model;
    this.validator = validator;
  }

  predict(features) {
    this.validator.validate(features);
    return {
      prediction: this.model.predict(features),
      confidence: this.model.predictProba(features),
    };
  }
}

describe("DataValidator", () => {
  const validator = new DataValidator({
    numFeatures: 3,
    ranges: [[0, 10], [0, 100], [-1, 1]],
  });

  it("accepts valid features", () => {
    assert.doesNotThrow(() => validator.validate([5, 50, 0.5]));
  });

  it("rejects wrong feature count", () => {
    assert.throws(() => validator.validate([1, 2]), /Expected 3/);
  });

  it("rejects out-of-range values", () => {
    assert.throws(() => validator.validate([15, 50, 0.5]), /outside range/);
  });
});

describe("MLService", () => {
  it("returns prediction and confidence", () => {
    const model = { predict: () => 0.85, predictProba: () => 0.92 };
    const validator = new DataValidator({ numFeatures: 3, ranges: [[0, 10], [0, 10], [0, 10]] });
    const service = new MLService(model, validator);
    const result = service.predict([1, 2, 3]);
    assert.equal(result.prediction, 0.85);
    assert.equal(result.confidence, 0.92);
  });
});
```

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class DataValidator {
    private final int numFeatures;
    private final double[][] ranges;

    DataValidator(int numFeatures, double[][] ranges) {
        this.numFeatures = numFeatures;
        this.ranges = ranges;
    }

    void validate(double[] features) {
        if (features.length != numFeatures)
            throw new IllegalArgumentException("Expected " + numFeatures + " features, got " + features.length);
        for (int i = 0; i < features.length; i++) {
            if (features[i] < ranges[i][0] || features[i] > ranges[i][1])
                throw new IllegalArgumentException("Feature " + i + " outside range");
        }
    }
}

interface MLModel {
    double predict(double[] features);
    double predictProba(double[] features);
}

record PredictionResult(double prediction, double confidence) {}

class MLService {
    private final MLModel model;
    private final DataValidator validator;

    MLService(MLModel model, DataValidator validator) {
        this.model = model;
        this.validator = validator;
    }

    PredictionResult predict(double[] features) {
        validator.validate(features);
        return new PredictionResult(model.predict(features), model.predictProba(features));
    }
}

class MLServiceTest {
    private MLService service;

    @BeforeEach
    void setup() {
        var validator = new DataValidator(3, new double[][]{{0, 10}, {0, 10}, {0, 10}});
        MLModel mock = new MLModel() {
            public double predict(double[] f) { return 0.85; }
            public double predictProba(double[] f) { return 0.92; }
        };
        service = new MLService(mock, validator);
    }

    @Test
    void validPrediction() {
        var result = service.predict(new double[]{1, 2, 3});
        assertEquals(0.85, result.prediction(), 0.001);
    }

    @Test
    void invalidFeatureCountThrows() {
        assertThrows(IllegalArgumentException.class, () -> service.predict(new double[]{1, 2}));
    }

    @Test
    void outOfRangeThrows() {
        assertThrows(IllegalArgumentException.class, () -> service.predict(new double[]{99, 2, 3}));
    }
}
```

```csharp
using Xunit;
using System;

public class DataValidator
{
    private readonly int _numFeatures;
    private readonly (double Low, double High)[] _ranges;

    public DataValidator(int numFeatures, (double, double)[] ranges)
    {
        _numFeatures = numFeatures;
        _ranges = ranges;
    }

    public void Validate(double[] features)
    {
        if (features.Length != _numFeatures)
            throw new ArgumentException($"Expected {_numFeatures} features, got {features.Length}");
        for (int i = 0; i < features.Length; i++)
            if (features[i] < _ranges[i].Low || features[i] > _ranges[i].High)
                throw new ArgumentException($"Feature {i} outside range");
    }
}

public interface IMLModel
{
    double Predict(double[] features);
    double PredictProba(double[] features);
}

public class MLService
{
    private readonly IMLModel _model;
    private readonly DataValidator _validator;

    public MLService(IMLModel model, DataValidator validator)
    {
        _model = model;
        _validator = validator;
    }

    public (double Prediction, double Confidence) Predict(double[] features)
    {
        _validator.Validate(features);
        return (_model.Predict(features), _model.PredictProba(features));
    }
}

public class MLServiceTests
{
    private readonly MLService _service;

    public MLServiceTests()
    {
        var ranges = new[] { (0.0, 10.0), (0.0, 10.0), (0.0, 10.0) };
        _service = new MLService(new MockModel(), new DataValidator(3, ranges));
    }

    [Fact]
    public void ValidPrediction()
    {
        var (pred, conf) = _service.Predict(new[] { 1.0, 2.0, 3.0 });
        Assert.Equal(0.85, pred, 3);
        Assert.Equal(0.92, conf, 3);
    }

    [Fact]
    public void InvalidCountThrows() =>
        Assert.Throws<ArgumentException>(() => _service.Predict(new[] { 1.0, 2.0 }));

    [Fact]
    public void OutOfRangeThrows() =>
        Assert.Throws<ArgumentException>(() => _service.Predict(new[] { 99.0, 2.0, 3.0 }));

    private class MockModel : IMLModel
    {
        public double Predict(double[] f) => 0.85;
        public double PredictProba(double[] f) => 0.92;
    }
}
```

## Key Takeaways

1. **ML testing requires multiple layers** — data validation, model metrics, pipeline integration, and API contract tests
2. **Non-determinism demands tolerance-based assertions** — use approximate equality and statistical bounds
3. **Data drift detection is continuous** — monitor production data against training distributions
4. **Set metric thresholds as quality gates** — fail deployments when model performance degrades
5. **A/B testing validates real-world impact** — lab metrics don't always translate to production value
