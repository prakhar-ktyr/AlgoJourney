---
title: Request & Response Validation
---

## Request & Response Validation

Validating requests and responses ensures your API contract is honored. Schema validation catches malformed data at the boundary, preventing invalid state from propagating through your system.

### Schema Validation Approaches

Different ecosystems provide different validation tools:

| Language | Library | Style |
|----------|---------|-------|
| Python | Pydantic | Model-based |
| JavaScript | Joi / Zod | Schema builder |
| Java | Jakarta Validation | Annotation-based |
| C# | DataAnnotations / FluentValidation | Attribute + fluent |

### What to Validate

**Request validation:**
- Request body — required fields, types, constraints (min/max, patterns)
- Query parameters — valid values, numeric ranges, enum membership
- Path parameters — format (UUID, slug, numeric ID)
- Headers — required headers, valid formats

**Response validation:**
- Correct fields present (no missing, no extra)
- Correct types for each field
- Nested object structure matches expected shape
- Array items conform to item schema
- Null handling matches contract

### Contract-First vs Code-First

- **Contract-first**: Define OpenAPI/Swagger spec, then generate validators
- **Code-first**: Define models with validation decorators, generate spec

Contract-first catches drift between documentation and implementation.

### Snapshot Testing for APIs

Record a known-good response shape and compare future responses against it. Useful for detecting accidental breaking changes.

### Custom Validators

When built-in constraints aren't enough, create custom validators for domain logic (e.g., "end date must be after start date").

---

## Code Examples

### Python (Pydantic + pytest)

```python
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, field_validator, EmailStr
import pytest
import httpx


class CreateUserRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=13, le=150)
    role: str = Field(pattern=r"^(admin|user|moderator)$")

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v):
        if v.strip() == "":
            raise ValueError("Name cannot be blank")
        return v.strip()


class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=13, le=150)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    age: int
    role: str
    created_at: str


class PaginatedResponse(BaseModel):
    users: list[UserResponse]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    limit: int = Field(ge=1, le=100)


class ErrorResponse(BaseModel):
    error: str
    errors: Optional[list[dict]] = None


class TestRequestValidation:
    def test_valid_create_request(self):
        data = {
            "name": "Alice",
            "email": "alice@example.com",
            "age": 25,
            "role": "user",
        }
        user = CreateUserRequest(**data)
        assert user.name == "Alice"
        assert user.email == "alice@example.com"

    def test_missing_required_field(self):
        with pytest.raises(Exception) as exc_info:
            CreateUserRequest(name="Alice", age=25, role="user")
        assert "email" in str(exc_info.value)

    def test_invalid_email(self):
        with pytest.raises(Exception):
            CreateUserRequest(
                name="Alice", email="not-an-email", age=25, role="user"
            )

    def test_age_below_minimum(self):
        with pytest.raises(Exception) as exc_info:
            CreateUserRequest(
                name="Alice", email="a@b.com", age=5, role="user"
            )
        assert "age" in str(exc_info.value).lower()

    def test_invalid_role(self):
        with pytest.raises(Exception):
            CreateUserRequest(
                name="Alice", email="a@b.com", age=25, role="superadmin"
            )

    def test_blank_name_rejected(self):
        with pytest.raises(Exception):
            CreateUserRequest(
                name="   ", email="a@b.com", age=25, role="user"
            )

    def test_partial_update_allows_optional_fields(self):
        update = UpdateUserRequest(name="New Name")
        assert update.name == "New Name"
        assert update.email is None
        assert update.age is None


class TestResponseValidation:
    def test_valid_user_response(self):
        data = {
            "id": "abc-123",
            "name": "Alice",
            "email": "alice@example.com",
            "age": 25,
            "role": "user",
            "created_at": "2024-01-01T00:00:00Z",
        }
        user = UserResponse(**data)
        assert user.id == "abc-123"

    def test_response_missing_field_raises(self):
        data = {"id": "abc-123", "name": "Alice", "email": "a@b.com"}
        with pytest.raises(Exception):
            UserResponse(**data)

    def test_paginated_response_shape(self):
        data = {
            "users": [],
            "total": 0,
            "page": 1,
            "limit": 20,
        }
        response = PaginatedResponse(**data)
        assert response.users == []
        assert response.total == 0

    def test_invalid_pagination_values(self):
        with pytest.raises(Exception):
            PaginatedResponse(users=[], total=-1, page=0, limit=200)


class TestIntegrationValidation:
    def test_api_response_matches_schema(self):
        with httpx.Client(base_url="http://localhost:8000/api") as client:
            response = client.get("/users")
            if response.status_code == 200:
                validated = PaginatedResponse(**response.json())
                assert validated.page >= 1

    def test_error_response_matches_schema(self):
        with httpx.Client(base_url="http://localhost:8000/api") as client:
            response = client.get("/users/nonexistent-id")
            if response.status_code == 404:
                error = ErrorResponse(**response.json())
                assert error.error != ""
```

### JavaScript (Joi + Jest)

```javascript
const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(13).max(150).required(),
  role: Joi.string().valid("admin", "user", "moderator").required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim(),
  email: Joi.string().email(),
  age: Joi.number().integer().min(13).max(150),
}).min(1);

const userResponseSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().required(),
  role: Joi.string().valid("admin", "user", "moderator").required(),
  createdAt: Joi.string().isoDate().required(),
});

const paginatedResponseSchema = Joi.object({
  users: Joi.array().items(userResponseSchema).required(),
  total: Joi.number().integer().min(0).required(),
  page: Joi.number().integer().min(1).required(),
  limit: Joi.number().integer().min(1).max(100).required(),
});

const errorResponseSchema = Joi.object({
  error: Joi.string().required(),
  errors: Joi.array()
    .items(
      Joi.object({
        field: Joi.string().required(),
        message: Joi.string().required(),
      })
    )
    .optional(),
});

describe("Request Validation", () => {
  describe("createUserSchema", () => {
    it("accepts valid input", () => {
      const input = {
        name: "Alice",
        email: "alice@example.com",
        age: 25,
        role: "user",
      };
      const { error } = createUserSchema.validate(input);
      expect(error).toBeUndefined();
    });

    it("rejects missing email", () => {
      const input = { name: "Alice", age: 25, role: "user" };
      const { error } = createUserSchema.validate(input);
      expect(error.details[0].path).toContain("email");
    });

    it("rejects invalid email format", () => {
      const input = {
        name: "Alice",
        email: "not-email",
        age: 25,
        role: "user",
      };
      const { error } = createUserSchema.validate(input);
      expect(error.details[0].type).toBe("string.email");
    });

    it("rejects age below minimum", () => {
      const input = {
        name: "Alice",
        email: "a@b.com",
        age: 5,
        role: "user",
      };
      const { error } = createUserSchema.validate(input);
      expect(error.details[0].path).toContain("age");
    });

    it("rejects invalid role", () => {
      const input = {
        name: "Alice",
        email: "a@b.com",
        age: 25,
        role: "superadmin",
      };
      const { error } = createUserSchema.validate(input);
      expect(error.details[0].type).toBe("any.only");
    });

    it("trims whitespace from name", () => {
      const input = {
        name: "  Alice  ",
        email: "a@b.com",
        age: 25,
        role: "user",
      };
      const { value } = createUserSchema.validate(input);
      expect(value.name).toBe("Alice");
    });
  });

  describe("updateUserSchema", () => {
    it("allows partial updates", () => {
      const { error } = updateUserSchema.validate({ name: "New" });
      expect(error).toBeUndefined();
    });

    it("rejects empty object", () => {
      const { error } = updateUserSchema.validate({});
      expect(error).toBeDefined();
    });
  });
});

describe("Response Validation", () => {
  it("validates correct user response", () => {
    const response = {
      id: "abc-123",
      name: "Alice",
      email: "alice@example.com",
      age: 25,
      role: "user",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    const { error } = userResponseSchema.validate(response);
    expect(error).toBeUndefined();
  });

  it("detects missing required field in response", () => {
    const response = { id: "abc", name: "Alice" };
    const { error } = userResponseSchema.validate(response);
    expect(error).toBeDefined();
  });

  it("validates paginated response", () => {
    const response = { users: [], total: 0, page: 1, limit: 20 };
    const { error } = paginatedResponseSchema.validate(response);
    expect(error).toBeUndefined();
  });

  it("validates error response shape", () => {
    const response = {
      error: "User not found",
      errors: [{ field: "id", message: "Invalid format" }],
    };
    const { error } = errorResponseSchema.validate(response);
    expect(error).toBeUndefined();
  });
});

describe("Snapshot Testing", () => {
  it("response shape matches snapshot", () => {
    const response = {
      id: expect.any(String),
      name: "Alice",
      email: "alice@example.com",
      age: 25,
      role: "user",
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
    };
    expect(response).toMatchSnapshot();
  });
});
```

### Java (Jakarta Validation + JUnit 5)

```java
import jakarta.validation.*;
import jakarta.validation.constraints.*;
import org.junit.jupiter.api.*;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

record CreateUserRequest(
    @NotBlank @Size(min = 1, max = 100) String name,
    @NotBlank @Email String email,
    @NotNull @Min(13) @Max(150) Integer age,
    @NotBlank @Pattern(regexp = "^(admin|user|moderator)$") String role
) {}

record UpdateUserRequest(
    @Size(min = 1, max = 100) String name,
    @Email String email,
    @Min(13) @Max(150) Integer age
) {}

record UserResponse(
    @NotBlank String id,
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotNull Integer age,
    @NotBlank String role,
    @NotBlank String createdAt
) {}

class RequestResponseValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Nested
    class CreateRequestTests {

        @Test
        void validRequest_passesValidation() {
            var request = new CreateUserRequest(
                "Alice", "alice@example.com", 25, "user");
            Set<ConstraintViolation<CreateUserRequest>> violations =
                validator.validate(request);
            assertTrue(violations.isEmpty());
        }

        @Test
        void missingEmail_failsValidation() {
            var request = new CreateUserRequest("Alice", null, 25, "user");
            var violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("email")));
        }

        @Test
        void invalidEmail_failsValidation() {
            var request = new CreateUserRequest(
                "Alice", "not-email", 25, "user");
            var violations = validator.validate(request);
            assertFalse(violations.isEmpty());
        }

        @Test
        void ageBelowMinimum_failsValidation() {
            var request = new CreateUserRequest(
                "Alice", "a@b.com", 5, "user");
            var violations = validator.validate(request);
            assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("age")));
        }

        @Test
        void invalidRole_failsValidation() {
            var request = new CreateUserRequest(
                "Alice", "a@b.com", 25, "superadmin");
            var violations = validator.validate(request);
            assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("role")));
        }

        @Test
        void blankName_failsValidation() {
            var request = new CreateUserRequest("", "a@b.com", 25, "user");
            var violations = validator.validate(request);
            assertFalse(violations.isEmpty());
        }
    }

    @Nested
    class UpdateRequestTests {

        @Test
        void partialUpdate_passesValidation() {
            var request = new UpdateUserRequest("New Name", null, null);
            var violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }

        @Test
        void invalidEmailInUpdate_failsValidation() {
            var request = new UpdateUserRequest(null, "bad-email", null);
            var violations = validator.validate(request);
            assertFalse(violations.isEmpty());
        }
    }

    @Nested
    class ResponseValidationTests {

        @Test
        void validResponse_passesValidation() {
            var response = new UserResponse(
                "abc-123", "Alice", "alice@example.com",
                25, "user", "2024-01-01T00:00:00Z");
            var violations = validator.validate(response);
            assertTrue(violations.isEmpty());
        }

        @Test
        void responseMissingId_failsValidation() {
            var response = new UserResponse(
                "", "Alice", "alice@example.com",
                25, "user", "2024-01-01T00:00:00Z");
            var violations = validator.validate(response);
            assertFalse(violations.isEmpty());
        }
    }
}
```

### C# (DataAnnotations + FluentValidation + xUnit)

```csharp
using System.ComponentModel.DataAnnotations;
using FluentValidation;
using FluentValidation.TestHelper;
using Xunit;

public class CreateUserRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, Range(13, 150)]
    public int Age { get; set; }

    [Required, RegularExpression("^(admin|user|moderator)$")]
    public string Role { get; set; } = "";
}

public class UpdateUserRequest
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [Range(13, 150)]
    public int? Age { get; set; }
}

public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Name cannot be blank");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Age)
            .InclusiveBetween(13, 150);

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => new[] { "admin", "user", "moderator" }
                .Contains(role))
            .WithMessage("Invalid role");
    }
}

public class UserResponse
{
    [Required] public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public int Age { get; set; }
    [Required] public string Role { get; set; } = "";
    [Required] public string CreatedAt { get; set; } = "";
}

public class RequestValidationTests
{
    private readonly CreateUserValidator _validator = new();

    [Fact]
    public void ValidRequest_PassesValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "Alice", Email = "alice@example.com",
            Age = 25, Role = "user"
        };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void MissingEmail_FailsValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "Alice", Email = "", Age = 25, Role = "user"
        };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void InvalidEmail_FailsValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "Alice", Email = "not-email", Age = 25, Role = "user"
        };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void AgeBelowMinimum_FailsValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "Alice", Email = "a@b.com", Age = 5, Role = "user"
        };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Age);
    }

    [Fact]
    public void InvalidRole_FailsValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "Alice", Email = "a@b.com", Age = 25, Role = "superadmin"
        };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Role);
    }

    [Fact]
    public void BlankName_FailsValidation()
    {
        var request = new CreateUserRequest
        {
            Name = "   ", Email = "a@b.com", Age = 25, Role = "user"
        };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}

public class ResponseValidationTests
{
    [Fact]
    public void ValidResponse_PassesDataAnnotations()
    {
        var response = new UserResponse
        {
            Id = "abc-123", Name = "Alice",
            Email = "alice@example.com", Age = 25,
            Role = "user", CreatedAt = "2024-01-01T00:00:00Z"
        };

        var context = new ValidationContext(response);
        var results = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(
            response, context, results, validateAllProperties: true);

        Assert.True(isValid);
        Assert.Empty(results);
    }

    [Fact]
    public void ResponseMissingId_FailsValidation()
    {
        var response = new UserResponse
        {
            Id = "", Name = "Alice",
            Email = "alice@example.com", Age = 25,
            Role = "user", CreatedAt = "2024-01-01T00:00:00Z"
        };

        var context = new ValidationContext(response);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(
            response, context, results, validateAllProperties: true);

        Assert.NotEmpty(results);
    }
}
```

---

## Key Takeaways

- Validate at the boundary — reject invalid data before it enters your system
- Use schema validation libraries native to your ecosystem
- Test both valid and invalid inputs exhaustively
- Validate responses too — ensure your API never returns malformed data
- Snapshot tests catch accidental response shape changes
- Custom validators handle domain-specific business rules
