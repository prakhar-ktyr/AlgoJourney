---
title: Node.js Request Body Parsing
---

# Node.js Request Body Parsing

When clients send data to your server (form submissions, JSON payloads, file uploads), it arrives in the request body. Express needs middleware to parse that body into something usable in `req.body`.

## JSON bodies

The most common format for APIs. Use `express.json()`:

```javascript
import express from "express";

const app = express();

app.use(express.json()); // parse JSON bodies

app.post("/api/users", (req, res) => {
  console.log(req.body); // { name: "Alice", email: "alice@example.com" }
  res.status(201).json(req.body);
});
```

Client sends:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

### Options

```javascript
app.use(express.json({
  limit: "10kb",    // max body size (default: 100kb)
  strict: true,     // only accept arrays and objects (default)
  type: "application/json", // content type to parse (default)
}));
```

### Handling invalid JSON

```javascript
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});
```

## URL-encoded form data

HTML forms submit data as `application/x-www-form-urlencoded`:

```html
<form method="POST" action="/login">
  <input name="username" value="alice">
  <input name="password" type="password">
  <button>Login</button>
</form>
```

Parse with `express.urlencoded()`:

```javascript
app.use(express.urlencoded({ extended: true }));

app.post("/login", (req, res) => {
  console.log(req.body); // { username: "alice", password: "..." }
  res.send("Logged in");
});
```

**`extended: true`** uses the `qs` library for rich objects and arrays. **`extended: false`** uses `querystring` for simple key-value pairs.

```javascript
// With extended: true, nested objects work
// username=alice&address[city]=NYC&address[zip]=10001
req.body = {
  username: "alice",
  address: { city: "NYC", zip: "10001" },
};
```

## Raw and text bodies

For non-standard content types:

```javascript
// Parse raw binary data
app.use(express.raw({ type: "application/octet-stream" }));

// Parse plain text
app.use(express.text({ type: "text/plain" }));

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  // req.body is a Buffer — useful for webhook signature verification
  const signature = req.headers["x-signature"];
  const body = req.body; // Buffer
  res.sendStatus(200);
});
```

## File uploads with multer

HTML forms with `enctype="multipart/form-data"` can upload files. Express doesn't handle this natively — use **multer**:

```bash
npm install multer
```

### Single file upload

```javascript
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("avatar"), (req, res) => {
  console.log(req.file);
  // {
  //   fieldname: 'avatar',
  //   originalname: 'photo.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: 'uploads/',
  //   filename: 'abc123def456',
  //   path: 'uploads/abc123def456',
  //   size: 123456
  // }

  console.log(req.body); // other form fields

  res.json({
    message: "File uploaded",
    filename: req.file.originalname,
    size: req.file.size,
  });
});
```

### Multiple file upload

```javascript
// Multiple files from one field
app.post("/gallery", upload.array("photos", 10), (req, res) => {
  console.log(req.files); // array of file objects
  res.json({ count: req.files.length });
});

// Multiple fields
const fields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);

app.post("/profile", fields, (req, res) => {
  console.log(req.files.avatar);    // array with 1 file
  console.log(req.files.documents); // array with up to 5 files
  res.json({ message: "Files uploaded" });
});
```

### Custom storage

```javascript
import path from "node:path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
    }
  },
});
```

### Memory storage (for processing without saving)

```javascript
const upload = multer({ storage: multer.memoryStorage() });

app.post("/process", upload.single("image"), (req, res) => {
  const buffer = req.file.buffer; // file data in memory
  // Process the buffer (resize, convert, etc.)
  res.json({ size: buffer.length });
});
```

## Handling upload errors

```javascript
app.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large" });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Success
    res.json({ file: req.file });
  });
});
```

## Content-Type detection

Check what type of data the client sent:

```javascript
app.post("/data", (req, res) => {
  if (req.is("json")) {
    // JSON body
  } else if (req.is("urlencoded")) {
    // Form data
  } else if (req.is("multipart")) {
    // File upload
  }
});
```

## Security considerations

1. **Limit body size** to prevent denial-of-service attacks:

```javascript
app.use(express.json({ limit: "10kb" }));
```

2. **Validate file types** — never trust the client:

```javascript
fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  cb(null, extOk && mimeOk);
};
```

3. **Store uploads outside the web root** — don't serve uploaded files directly from `public/`.

4. **Generate unique filenames** — never use the original filename directly (it could overwrite files or contain path traversal).

## Key takeaways

- `express.json()` for JSON bodies, `express.urlencoded()` for form data.
- Use `multer` for file uploads (multipart/form-data).
- Always set body size limits.
- Validate and sanitize file uploads (type, size, filename).
- Use `req.body` for parsed data, `req.file`/`req.files` for uploaded files.
