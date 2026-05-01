---
title: OpenAPI & Swagger
---

# OpenAPI & Swagger

**OpenAPI Specification (OAS)** is the standard way to describe REST APIs. **Swagger** provides tools to create, visualize, and test API documentation from OpenAPI specs.

---

## What is OpenAPI?

A YAML or JSON file that describes:

- Available endpoints and methods
- Request/response formats
- Authentication requirements
- Data models (schemas)

---

## Basic OpenAPI Document

```yaml
openapi: 3.0.3
info:
  title: Users API
  description: API for managing users
  version: 1.0.0
servers:
  - url: http://localhost:3000
    description: Development server

paths:
  /api/users:
    get:
      summary: List all users
      tags:
        - Users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        "200":
          description: A list of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  total:
                    type: integer

    post:
      summary: Create a user
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUser"
      responses:
        "201":
          description: User created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          description: Validation error

  /api/users/{id}:
    get:
      summary: Get a user by ID
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: A user
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          description: User not found

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time

    CreateUser:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## Adding Swagger UI to Express

```bash
npm install swagger-ui-express yamljs
```

```javascript
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();
const swaggerDoc = YAML.load("./openapi.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
// Visit http://localhost:3000/api-docs
```

---

## Auto-Generating Docs with JSDoc

Use `swagger-jsdoc` to generate specs from code comments:

```bash
npm install swagger-jsdoc
```

```javascript
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: { title: "My API", version: "1.0.0" },
  },
  apis: ["./routes/*.js"], // Files with JSDoc annotations
};

const spec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
```

```javascript
// routes/users.js

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get("/", async (req, res) => {
  // ...
});
```

---

## Key Takeaways

- **OpenAPI** is the industry standard for describing REST APIs
- **Swagger UI** provides interactive documentation from your spec
- Define **schemas** in `components` and reference them with `$ref`
- Use **swagger-jsdoc** to generate specs from code annotations
- Keep docs **in sync** with your code — automated generation helps

---

Next, we'll learn about **API Documentation Best Practices** →
