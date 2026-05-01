---
title: File Uploads
---

# File Uploads

GraphQL doesn't natively support file uploads, but there are established patterns to handle them.

---

## Approaches

| Approach | Complexity | Best For |
|----------|-----------|----------|
| Separate REST endpoint | Low | Simple uploads |
| Presigned URLs | Medium | Direct cloud upload |
| graphql-upload | Medium | GraphQL-native solution |

---

## Approach 1: Separate REST Endpoint (Recommended)

Keep file uploads in REST and reference in GraphQL:

```javascript
// REST endpoint for uploads
import multer from "multer";
const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.originalname });
});
```

```graphql
# GraphQL mutation references the uploaded URL
mutation UpdateAvatar($url: String!) {
  updateAvatar(url: $url) {
    id
    avatar
  }
}
```

Client workflow:
1. Upload file to `/api/upload` → get URL
2. Pass URL to GraphQL mutation

---

## Approach 2: Presigned URLs

Generate a presigned URL, client uploads directly to cloud storage:

```graphql
type Mutation {
  generateUploadUrl(filename: String!, contentType: String!): UploadUrl!
}

type UploadUrl {
  url: String!         # Presigned upload URL
  key: String!         # File key/path in storage
  publicUrl: String!   # Where the file will be accessible
}
```

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const resolvers = {
  Mutation: {
    generateUploadUrl: async (_, { filename, contentType }) => {
      const key = `uploads/${Date.now()}-${filename}`;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      return {
        url,
        key,
        publicUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
      };
    },
  },
};
```

Client workflow:
1. Call `generateUploadUrl` mutation → get presigned URL
2. `PUT` file directly to the presigned URL
3. Use `publicUrl` in subsequent mutations

---

## Approach 3: graphql-upload

Native multipart upload support:

```bash
npm install graphql-upload
```

```graphql
scalar Upload

type Mutation {
  uploadFile(file: Upload!): File!
}

type File {
  url: String!
  filename: String!
  mimetype: String!
}
```

```javascript
import { GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";

const resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    uploadFile: async (_, { file }) => {
      const { createReadStream, filename, mimetype } = await file;
      const stream = createReadStream();
      const path = `uploads/${Date.now()}-${filename}`;

      await new Promise((resolve, reject) => {
        stream
          .pipe(createWriteStream(path))
          .on("finish", resolve)
          .on("error", reject);
      });

      return { url: `/${path}`, filename, mimetype };
    },
  },
};
```

---

## Best Practices

- **Validate file type** and size on the server
- **Use cloud storage** (S3, GCS) in production, not local disk
- **Presigned URLs** are best for large files (no server bottleneck)
- **Set limits**: max file size, allowed MIME types
- **Separate REST endpoint** is simplest and most battle-tested

---

## Key Takeaways

- GraphQL doesn't have native file upload support
- **Presigned URLs** are best for production (scalable, direct-to-cloud)
- **Separate REST endpoint** is simplest for small apps
- **graphql-upload** provides native GraphQL support but adds complexity
- Always validate file type and size server-side

---

Next, we'll learn about **Middleware & Plugins** in Apollo Server →
