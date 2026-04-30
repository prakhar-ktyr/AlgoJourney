---
title: Python JSON
---

# Python JSON

**JSON** (JavaScript Object Notation) is the lingua franca of web APIs. Python's standard `json` module converts between Python values and JSON text.

## The mapping

| JSON            | Python  |
| --------------- | ------- |
| `object`        | `dict`  |
| `array`         | `list`  |
| `string`        | `str`   |
| `number` (int)  | `int`   |
| `number` (real) | `float` |
| `true`          | `True`  |
| `false`         | `False` |
| `null`          | `None`  |

## Encoding — Python → JSON

`json.dumps` returns a JSON **string**:

```python
import json

data = {
    "name": "Ada",
    "age": 36,
    "skills": ["math", "logic"],
    "active": True,
    "manager": None,
}

s = json.dumps(data)
print(s)
# {"name": "Ada", "age": 36, "skills": ["math", "logic"], "active": true, "manager": null}
```

Pretty-print with `indent`:

```python
print(json.dumps(data, indent=2, sort_keys=True))
```

```
{
  "active": true,
  "age": 36,
  "manager": null,
  "name": "Ada",
  "skills": [
    "math",
    "logic"
  ]
}
```

To handle non-ASCII characters as UTF-8 (instead of `\u00e9` escapes):

```python
json.dumps({"city": "São Paulo"}, ensure_ascii=False)
```

## Decoding — JSON → Python

`json.loads` parses a JSON string:

```python
text = '{"name": "Ada", "age": 36}'
obj = json.loads(text)
print(obj["name"])      # 'Ada'
```

A malformed string raises `json.JSONDecodeError`:

```python
try:
    json.loads("{ bad }")
except json.JSONDecodeError as e:
    print("invalid:", e)
```

## Reading & writing files

`json.dump(obj, file)` and `json.load(file)` work directly with file objects:

```python
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with open("data.json", encoding="utf-8") as f:
    loaded = json.load(f)
```

## Custom types

`json.dumps` only knows the built-in types listed above. For anything else, write a default function:

```python
import json
from datetime import datetime

def default(o):
    if isinstance(o, datetime):
        return o.isoformat()
    raise TypeError(f"can't serialize {type(o).__name__}")

print(json.dumps({"now": datetime.utcnow()}, default=default))
# {"now": "2025-01-15T12:34:56.789012"}
```

For dataclasses:

```python
from dataclasses import dataclass, asdict

@dataclass
class User:
    name: str
    age: int

u = User("Ada", 36)
print(json.dumps(asdict(u)))     # {"name": "Ada", "age": 36}
```

## Custom decoding

`json.loads(s, object_hook=...)` runs a function on every parsed object:

```python
import json
from datetime import datetime

def hook(d):
    for k, v in d.items():
        if isinstance(v, str) and len(v) == 19 and "T" in v:
            try:
                d[k] = datetime.fromisoformat(v)
            except ValueError:
                pass
    return d

text = '{"name": "Ada", "joined": "2020-05-01T10:00:00"}'
obj = json.loads(text, object_hook=hook)
print(type(obj["joined"]))     # <class 'datetime.datetime'>
```

## Talking to web APIs

The most common reason to use JSON. With the `requests` library (`pip install requests`):

```python
import requests

r = requests.get("https://api.github.com/repos/python/cpython")
r.raise_for_status()                  # raise on HTTP error
data = r.json()                       # parse the response body as JSON
print(data["full_name"], "★", data["stargazers_count"])
```

Posting JSON:

```python
r = requests.post(
    "https://httpbin.org/post",
    json={"name": "Ada", "role": "engineer"},   # auto-serializes + sets header
)
print(r.json()["json"])
```

For the standard library equivalent (no extra install), use `urllib.request` plus `json.loads`. `requests` is friendlier.

## Pitfalls

- **JSON keys must be strings.** Python lets dicts have any hashable key, but `json.dumps` will reject non-string keys (or coerce them with `skipkeys=True`).
- **JSON has no integers vs floats distinction by spec.** Most parsers preserve the difference, but be careful with very large ints.
- **JSON has no `datetime` type.** Pick a convention (usually ISO-8601 strings) and stick to it.
- **Watch out for circular references.** `json.dumps` will raise `RecursionError`.
- **Trailing commas are not allowed** in JSON, unlike Python.

## Try it — pretty-print API output

```python
import json
import urllib.request

with urllib.request.urlopen("https://api.github.com/repos/python/cpython") as r:
    data = json.load(r)

print(json.dumps(
    {"name": data["full_name"], "stars": data["stargazers_count"]},
    indent=2,
))
```

Output:

```
{
  "name": "python/cpython",
  "stars": 60000
}
```
