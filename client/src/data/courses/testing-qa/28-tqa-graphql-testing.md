---
title: GraphQL Testing
---

## GraphQL vs REST Testing Differences

GraphQL APIs differ fundamentally from REST in ways that affect testing strategy. Instead of multiple endpoints with fixed response shapes, GraphQL exposes a single endpoint where clients define exactly what data they need. This flexibility introduces unique testing challenges.

Key differences for testers:
- **Single endpoint**: All requests go to `/graphql` — you cannot rely on URL patterns to differentiate operations
- **Client-driven responses**: The response shape depends on the query, not the server alone
- **Type system**: GraphQL's schema provides built-in validation, but you still need to test business logic
- **Error handling**: GraphQL returns HTTP 200 even for errors, embedding them in an `errors` array
- **Over/under-fetching**: Clients request exactly what they need, so tests must verify field selection works correctly

Testing GraphQL requires validating:
1. Query correctness (syntax and semantics)
2. Resolver logic (business rules)
3. Authorization at the field level
4. Input validation for mutations
5. Error propagation and partial responses

## Testing Queries: Valid Query, Field Selection, Nested Data

### Basic Query Testing

Start by verifying that well-formed queries return the expected data structure:

```python
import httpx
import pytest

GRAPHQL_URL = "http://localhost:4000/graphql"

def test_basic_user_query():
    query = """
    query {
        user(id: "1") {
            id
            name
            email
        }
    }
    """
    response = httpx.post(GRAPHQL_URL, json={"query": query})
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    user = data["data"]["user"]
    assert user["id"] == "1"
    assert "name" in user
    assert "email" in user

def test_field_selection_returns_only_requested_fields():
    query = """
    query {
        user(id: "1") {
            name
        }
    }
    """
    response = httpx.post(GRAPHQL_URL, json={"query": query})
    data = response.json()["data"]["user"]
    assert "name" in data
    assert "email" not in data
    assert "id" not in data
```

```javascript
const request = require("supertest");
const app = require("../app");

describe("GraphQL Queries", () => {
  it("should return user data for valid query", async () => {
    const query = `
      query {
        user(id: "1") {
          id
          name
          email
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.user).toMatchObject({
      id: "1",
      name: expect.any(String),
      email: expect.any(String),
    });
  });

  it("should return only requested fields", async () => {
    const query = `
      query {
        user(id: "1") {
          name
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query })
      .expect(200);

    expect(res.body.data.user).toHaveProperty("name");
    expect(res.body.data.user).not.toHaveProperty("email");
  });
});
```

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureHttpGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.HttpGraphQlTester;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureHttpGraphQlTester
class UserQueryTest {

    @Autowired
    private HttpGraphQlTester graphQlTester;

    @Test
    void shouldReturnUserById() {
        graphQlTester.document("""
            query {
                user(id: "1") {
                    id
                    name
                    email
                }
            }
            """)
            .execute()
            .path("user.id").entity(String.class).isEqualTo("1")
            .path("user.name").entity(String.class).satisfies(name ->
                assertThat(name).isNotBlank()
            );
    }

    @Test
    void shouldReturnNestedData() {
        graphQlTester.document("""
            query {
                user(id: "1") {
                    name
                    posts {
                        title
                        comments {
                            text
                        }
                    }
                }
            }
            """)
            .execute()
            .path("user.posts[0].title").entity(String.class).satisfies(title ->
                assertThat(title).isNotBlank()
            )
            .path("user.posts[0].comments").entityList(Object.class).hasSizeGreaterThan(0);
    }
}
```

```csharp
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

public class GraphQlQueryTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GraphQlQueryTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task BasicQuery_ReturnsUserData()
    {
        var query = new
        {
            query = @"
                query {
                    user(id: ""1"") {
                        id
                        name
                        email
                    }
                }"
        };

        var response = await _client.PostAsJsonAsync("/graphql", query);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<JsonDocument>();
        var user = result.RootElement.GetProperty("data").GetProperty("user");

        Assert.Equal("1", user.GetProperty("id").GetString());
        Assert.False(string.IsNullOrEmpty(user.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task NestedQuery_ReturnsRelatedData()
    {
        var query = new
        {
            query = @"
                query {
                    user(id: ""1"") {
                        posts {
                            title
                            comments { text author { name } }
                        }
                    }
                }"
        };

        var response = await _client.PostAsJsonAsync("/graphql", query);
        var result = await response.Content.ReadFromJsonAsync<JsonDocument>();
        var posts = result.RootElement
            .GetProperty("data").GetProperty("user").GetProperty("posts");

        Assert.True(posts.GetArrayLength() > 0);
    }
}
```

## Testing Mutations: Create, Update, Delete

Mutations modify server-side data. Tests should verify the operation succeeds, returns the correct response, and produces the expected side effect.

```python
def test_create_post_mutation():
    mutation = """
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            id
            title
            content
            author { name }
        }
    }
    """
    variables = {
        "input": {
            "title": "Test Post",
            "content": "Testing GraphQL mutations",
            "authorId": "1"
        }
    }
    response = httpx.post(
        GRAPHQL_URL,
        json={"query": mutation, "variables": variables}
    )
    data = response.json()
    assert "errors" not in data
    post = data["data"]["createPost"]
    assert post["title"] == "Test Post"
    assert post["id"] is not None

def test_delete_post_mutation():
    mutation = """
    mutation {
        deletePost(id: "99") {
            success
            message
        }
    }
    """
    response = httpx.post(GRAPHQL_URL, json={"query": mutation})
    data = response.json()
    assert data["data"]["deletePost"]["success"] is True
```

```javascript
describe("GraphQL Mutations", () => {
  it("should create a new post", async () => {
    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          id
          title
          content
        }
      }
    `;
    const variables = {
      input: { title: "New Post", content: "Body text", authorId: "1" },
    };

    const res = await request(app)
      .post("/graphql")
      .send({ query: mutation, variables })
      .expect(200);

    expect(res.body.data.createPost.title).toBe("New Post");
    expect(res.body.data.createPost.id).toBeDefined();
  });

  it("should update an existing post", async () => {
    const mutation = `
      mutation {
        updatePost(id: "1", input: { title: "Updated Title" }) {
          id
          title
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query: mutation })
      .expect(200);

    expect(res.body.data.updatePost.title).toBe("Updated Title");
  });
});
```

```java
@Test
void shouldCreatePost() {
    graphQlTester.document("""
        mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
                id
                title
            }
        }
        """)
        .variable("input", Map.of(
            "title", "Spring GraphQL Post",
            "content", "Testing mutations",
            "authorId", "1"
        ))
        .execute()
        .path("createPost.title").entity(String.class).isEqualTo("Spring GraphQL Post")
        .path("createPost.id").entity(String.class).satisfies(id ->
            assertThat(id).isNotNull()
        );
}
```

```csharp
[Fact]
public async Task CreatePost_ReturnsNewPost()
{
    var mutation = new
    {
        query = @"
            mutation CreatePost($input: CreatePostInput!) {
                createPost(input: $input) { id title }
            }",
        variables = new
        {
            input = new { title = "C# Post", content = "Body", authorId = "1" }
        }
    };

    var response = await _client.PostAsJsonAsync("/graphql", mutation);
    var result = await response.Content.ReadFromJsonAsync<JsonDocument>();
    var post = result.RootElement.GetProperty("data").GetProperty("createPost");

    Assert.Equal("C# Post", post.GetProperty("title").GetString());
    Assert.False(string.IsNullOrEmpty(post.GetProperty("id").GetString()));
}
```

## Variable Testing and Input Validation

GraphQL variables allow parameterized queries. Test that invalid inputs are rejected properly:

```python
def test_invalid_variable_type_rejected():
    query = """
    query GetUser($id: ID!) {
        user(id: $id) { name }
    }
    """
    # Pass an array instead of a string
    variables = {"id": [1, 2, 3]}
    response = httpx.post(
        GRAPHQL_URL,
        json={"query": query, "variables": variables}
    )
    data = response.json()
    assert "errors" in data
    assert "Variable" in data["errors"][0]["message"]

def test_missing_required_variable():
    query = """
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) { id }
    }
    """
    response = httpx.post(GRAPHQL_URL, json={"query": query, "variables": {}})
    data = response.json()
    assert "errors" in data

def test_input_validation_rules():
    mutation = """
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) { id }
    }
    """
    variables = {"input": {"title": "", "content": "x", "authorId": "1"}}
    response = httpx.post(
        GRAPHQL_URL,
        json={"query": mutation, "variables": variables}
    )
    data = response.json()
    assert "errors" in data
    assert any("title" in str(e).lower() for e in data["errors"])
```

## Error Handling in GraphQL

GraphQL error handling is unique: the server returns HTTP 200 with an `errors` array. Partial responses are possible when some fields resolve successfully while others fail.

```javascript
describe("GraphQL Error Handling", () => {
  it("should return errors array for invalid query", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({ query: "{ invalidField }" })
      .expect(200);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0]).toHaveProperty("message");
    expect(res.body.errors[0]).toHaveProperty("locations");
  });

  it("should return partial data with errors", async () => {
    const query = `
      query {
        user(id: "1") { name }
        nonexistentUser: user(id: "99999") { name }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query })
      .expect(200);

    // Partial success: one field resolves, the other is null with error
    expect(res.body.data.user).not.toBeNull();
    expect(res.body.data.nonexistentUser).toBeNull();
    expect(res.body.errors).toBeDefined();
  });

  it("should include path in error for nested resolver failures", async () => {
    const query = `
      query {
        user(id: "1") {
          name
          restrictedField
        }
      }
    `;
    const res = await request(app)
      .post("/graphql")
      .send({ query })
      .expect(200);

    const error = res.body.errors[0];
    expect(error.path).toEqual(["user", "restrictedField"]);
    expect(error.extensions).toHaveProperty("code");
  });
});
```

## Introspection and Schema Testing

Introspection queries let you verify the API schema programmatically — useful in CI to catch breaking schema changes.

```java
@Test
void shouldExposeExpectedTypes() {
    graphQlTester.document("""
        {
            __schema {
                types {
                    name
                }
            }
        }
        """)
        .execute()
        .path("__schema.types[*].name")
        .entityList(String.class)
        .satisfies(types -> {
            assertThat(types).contains("User", "Post", "Comment");
            assertThat(types).contains("Query", "Mutation");
        });
}

@Test
void shouldHaveRequiredFieldsOnUserType() {
    graphQlTester.document("""
        {
            __type(name: "User") {
                fields {
                    name
                    type { name kind }
                }
            }
        }
        """)
        .execute()
        .path("__type.fields[*].name")
        .entityList(String.class)
        .satisfies(fields -> {
            assertThat(fields).contains("id", "name", "email", "posts");
        });
}
```

```csharp
[Fact]
public async Task Introspection_ReturnsSchemaTypes()
{
    var query = new
    {
        query = @"
        {
            __schema {
                queryType { name }
                mutationType { name }
                types { name kind }
            }
        }"
    };

    var response = await _client.PostAsJsonAsync("/graphql", query);
    var result = await response.Content.ReadFromJsonAsync<JsonDocument>();
    var schema = result.RootElement.GetProperty("data").GetProperty("__schema");

    Assert.Equal("Query", schema.GetProperty("queryType").GetProperty("name").GetString());
    Assert.Equal("Mutation", schema.GetProperty("mutationType").GetProperty("name").GetString());

    var typeNames = schema.GetProperty("types").EnumerateArray()
        .Select(t => t.GetProperty("name").GetString())
        .ToList();
    Assert.Contains("User", typeNames);
    Assert.Contains("Post", typeNames);
}
```

## Summary

GraphQL testing requires a mindset shift from REST testing:
- Always check for the `errors` array — HTTP status alone is insufficient
- Test field selection to ensure clients receive exactly what they request
- Validate mutations produce both the correct response and the correct side effect
- Use variables extensively and test edge cases around type coercion
- Leverage introspection queries for schema regression testing in CI
- Test authorization at the field level, not just the operation level
