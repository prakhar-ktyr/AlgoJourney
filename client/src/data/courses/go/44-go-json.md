---
title: Go JSON
---

# Go JSON

Go's `encoding/json` package handles JSON encoding (marshaling) and decoding (unmarshaling) with struct tags.

---

## Marshaling (Go → JSON)

```go
type User struct {
    Name  string `json:"name"`
    Age   int    `json:"age"`
    Email string `json:"email"`
}

user := User{Name: "Alice", Age: 30, Email: "alice@example.com"}

data, err := json.Marshal(user)
if err != nil {
    log.Fatal(err)
}
fmt.Println(string(data))
// {"name":"Alice","age":30,"email":"alice@example.com"}
```

### Pretty Print

```go
data, _ := json.MarshalIndent(user, "", "  ")
fmt.Println(string(data))
```

```json
{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com"
}
```

---

## Unmarshaling (JSON → Go)

```go
jsonStr := `{"name":"Bob","age":25,"email":"bob@example.com"}`

var user User
err := json.Unmarshal([]byte(jsonStr), &user)
if err != nil {
    log.Fatal(err)
}
fmt.Println(user.Name)  // Bob
fmt.Println(user.Age)   // 25
```

---

## Struct Tags

| Tag | Effect |
|-----|--------|
| `` `json:"name"` `` | Use "name" as the JSON key |
| `` `json:"name,omitempty"` `` | Omit if zero value |
| `` `json:"-"` `` | Never include in JSON |
| `` `json:",string"` `` | Encode number as JSON string |

```go
type Product struct {
    ID       int     `json:"id"`
    Name     string  `json:"name"`
    Price    float64 `json:"price,omitempty"`
    Internal string  `json:"-"`
}
```

---

## Nested Structs

```go
type Address struct {
    City    string `json:"city"`
    Country string `json:"country"`
}

type Person struct {
    Name    string  `json:"name"`
    Address Address `json:"address"`
}

p := Person{
    Name:    "Alice",
    Address: Address{City: "NYC", Country: "US"},
}

data, _ := json.MarshalIndent(p, "", "  ")
fmt.Println(string(data))
```

```json
{
  "name": "Alice",
  "address": {
    "city": "NYC",
    "country": "US"
  }
}
```

---

## Slices and Maps

```go
// Slices
tags := []string{"go", "programming", "tutorial"}
data, _ := json.Marshal(tags)
// ["go","programming","tutorial"]

// Maps
config := map[string]interface{}{
    "host": "localhost",
    "port": 8080,
    "debug": true,
}
data, _ = json.MarshalIndent(config, "", "  ")
```

---

## Dynamic JSON with `map[string]interface{}`

When you don't know the structure:

```go
var result map[string]interface{}
json.Unmarshal([]byte(jsonStr), &result)

name := result["name"].(string)
age := result["age"].(float64)  // JSON numbers are float64
```

---

## Streaming with Encoder/Decoder

For files and HTTP bodies, use `Encoder` and `Decoder`:

```go
// Write JSON to a file
f, _ := os.Create("data.json")
defer f.Close()
json.NewEncoder(f).Encode(user)

// Read JSON from a file
f2, _ := os.Open("data.json")
defer f2.Close()
var u User
json.NewDecoder(f2).Decode(&u)
```

---

## `json.RawMessage`

Delay parsing part of the JSON:

```go
type Event struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

var event Event
json.Unmarshal(data, &event)

// Parse payload based on type
switch event.Type {
case "user":
    var user User
    json.Unmarshal(event.Payload, &user)
}
```

---

## Complete Example

```go
package main

import (
    "encoding/json"
    "fmt"
)

type Task struct {
    ID        int      `json:"id"`
    Title     string   `json:"title"`
    Completed bool     `json:"completed"`
    Tags      []string `json:"tags,omitempty"`
}

func main() {
    // Marshal
    tasks := []Task{
        {ID: 1, Title: "Learn Go", Completed: true, Tags: []string{"go", "learning"}},
        {ID: 2, Title: "Build API", Completed: false},
        {ID: 3, Title: "Write tests", Completed: false, Tags: []string{"testing"}},
    }

    data, _ := json.MarshalIndent(tasks, "", "  ")
    fmt.Println("JSON Output:")
    fmt.Println(string(data))

    // Unmarshal
    jsonInput := `[{"id":4,"title":"Deploy","completed":false}]`
    var parsed []Task
    json.Unmarshal([]byte(jsonInput), &parsed)

    fmt.Printf("\nParsed: %+v\n", parsed[0])
}
```

---

Next: building HTTP servers and clients in Go.
