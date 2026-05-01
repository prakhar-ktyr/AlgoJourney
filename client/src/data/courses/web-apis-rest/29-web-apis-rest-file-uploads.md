---
title: File Uploads
---

# File Uploads

REST APIs often need to handle file uploads — profile pictures, documents, CSV imports. This lesson covers how to implement secure file uploads.

---

## Multipart Form Data

Files are uploaded using `multipart/form-data` encoding:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "avatar=@photo.jpg" \
  -F "name=Alice"
```

---

## Setup with Multer

**Multer** is the standard file upload middleware for Express:

```bash
npm install multer
```

### Basic Upload

```javascript
import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

app.post("/api/users/:id/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "Avatar uploaded",
    file: {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});
```

### Multiple Files

```javascript
app.post("/api/posts/:id/images", upload.array("images", 10), (req, res) => {
  res.json({
    uploaded: req.files.length,
    files: req.files.map((f) => ({
      filename: f.filename,
      size: f.size,
    })),
  });
});
```

---

## Custom Storage

Control filenames and destination:

```javascript
import { extname } from "path";
import { randomUUID } from "crypto";

const storage = multer.diskStorage({
  destination: "uploads/avatars/",
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
```

---

## Security Best Practices

```javascript
// 1. Always validate file type by MIME type AND extension
const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

function fileFilter(req, file, cb) {
  const ext = extname(file.originalname).toLowerCase();
  const mimeAllowed = ALLOWED_TYPES[file.mimetype];

  if (mimeAllowed && mimeAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
}

// 2. Limit file size
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5MB per file
    files: 10,                     // Max 10 files
  },
  fileFilter,
});

// 3. Never use the original filename (could contain path traversal)
// Always generate a new filename

// 4. Don't serve uploads from within your app directory
// Use a separate static file server or cloud storage

// 5. Scan files for malware in production
```

---

## Serving Uploaded Files

```javascript
import { join } from "path";

// Serve static files from uploads directory
app.use("/uploads", express.static(join(process.cwd(), "uploads")));

// Now accessible at: http://localhost:3000/uploads/avatars/abc-123.jpg
```

For production, use cloud storage (S3, Google Cloud Storage) instead of local disk.

---

## File Download

```javascript
app.get("/api/files/:filename", (req, res) => {
  const filePath = join(process.cwd(), "uploads", req.params.filename);
  res.download(filePath);
});
```

---

## Key Takeaways

- Use **Multer** for handling `multipart/form-data` uploads
- Always **validate** file type (MIME type + extension) and **limit** file size
- **Never use** the original filename — generate a unique name
- Use **cloud storage** (S3) in production instead of local disk
- Handle upload errors in your error middleware

---

Next, we'll learn about **API Versioning** — evolving your API without breaking clients →
