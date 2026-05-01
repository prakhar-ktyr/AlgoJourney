---
title: Next.js File Uploads
---

# Next.js File Uploads

Handling file uploads in Next.js involves processing multipart form data in Server Actions or Route Handlers. This lesson covers practical patterns for uploading files.

## Basic file upload with Server Actions

```javascript
// src/app/actions.js
"use server";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function uploadFile(formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed" };
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File must be under 5MB" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads directory
  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), "public/uploads", filename);
  await writeFile(path, buffer);

  return { success: true, path: `/uploads/${filename}` };
}
```

```javascript
// src/app/upload/page.js
"use client";

import { useState } from "react";
import { uploadFile } from "../actions";

export default function UploadPage() {
  const [result, setResult] = useState(null);

  async function handleSubmit(formData) {
    const res = await uploadFile(formData);
    setResult(res);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input type="file" name="file" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>

      {result?.error && <p className="text-red-500">{result.error}</p>}
      {result?.path && <img src={result.path} alt="Uploaded" className="mt-4 max-w-md" />}
    </div>
  );
}
```

## File upload via Route Handler

For API-style uploads:

```javascript
// src/app/api/upload/route.js
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), "public/uploads", filename);
  await writeFile(path, buffer);

  return NextResponse.json({ path: `/uploads/${filename}` });
}
```

## Multiple file uploads

```javascript
"use server";

export async function uploadMultiple(formData) {
  const files = formData.getAll("files");
  const results = [];

  for (const file of files) {
    if (file.size === 0) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), "public/uploads", filename);
    await writeFile(path, buffer);

    results.push({ name: file.name, path: `/uploads/${filename}` });
  }

  return { success: true, files: results };
}
```

```html
<input type="file" name="files" multiple accept="image/*" />
```

## Upload with progress (client-side)

Server Actions don't provide upload progress. Use `fetch` with `XMLHttpRequest` for progress tracking:

```javascript
"use client";

import { useState } from "react";

export default function UploadWithProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      setUploading(false);
      setProgress(100);
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  }

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {uploading && (
        <div className="w-full bg-gray-200 rounded mt-2">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

## Cloud storage upload (S3 example)

For production, upload to cloud storage instead of the local filesystem:

```javascript
"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function uploadToS3(formData) {
  const file = formData.get("file");
  const bytes = await file.arrayBuffer();

  const key = `uploads/${Date.now()}-${file.name}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: Buffer.from(bytes),
    ContentType: file.type,
  }));

  return { url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}` };
}
```

## Security considerations

- **Always validate** file types on the server (don't trust `accept` attribute).
- **Limit file size** — check `file.size` before processing.
- **Sanitize filenames** — remove special characters and path traversal attempts.
- **Don't store uploads in `public/`** in production — use cloud storage.
- **Set appropriate Content-Security-Policy** headers.

## Key takeaways

- Use `formData.get("file")` to access uploaded files in Server Actions or Route Handlers.
- Always **validate file type and size** on the server.
- Use `formData.getAll("files")` for multiple file uploads.
- Use `XMLHttpRequest` for upload progress tracking.
- In production, upload to **cloud storage** (S3, Cloudinary, etc.) instead of local filesystem.
- Sanitize filenames and restrict allowed file types for security.
