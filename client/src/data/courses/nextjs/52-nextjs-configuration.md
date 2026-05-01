---
title: Next.js Configuration
---

# Next.js Configuration

The `next.config.js` (or `next.config.mjs`) file at the root of your project configures Next.js behavior. This lesson covers the most important options.

## Basic configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // your options here
};

export default nextConfig;
```

## Common options

### Redirects

```javascript
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true, // 308
      },
      {
        source: "/blog/:slug",
        destination: "/posts/:slug",
        permanent: true,
      },
    ];
  },
};
```

### Rewrites

```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://external-api.com/:path*",
      },
    ];
  },
};
```

### Headers

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};
```

### Image domains

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.example.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};
```

### Base path

```javascript
const nextConfig = {
  basePath: "/app", // serve at example.com/app
};
```

### Environment variables

```javascript
const nextConfig = {
  env: {
    CUSTOM_KEY: "value", // available as process.env.CUSTOM_KEY
  },
};
```

### Turbopack (dev)

```javascript
const nextConfig = {
  // Turbopack is enabled via `next dev --turbopack`
  // Configuration for Turbopack:
  turbopack: {
    resolveAlias: {
      "custom-alias": "./src/lib/custom",
    },
  },
};
```

## Output modes

```javascript
const nextConfig = {
  // Default: server-rendered application
  // output: undefined,

  // Standalone: self-contained output for Docker
  output: "standalone",

  // Static: export as static HTML (no server features)
  // output: "export",
};
```

## Webpack customization

```javascript
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add custom webpack plugins or loaders
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
```

## TypeScript strict mode

```javascript
const nextConfig = {
  typescript: {
    // Warning: skips type checking during build
    ignoreBuildErrors: false, // keep false for safety
  },
};
```

## ESLint during build

```javascript
const nextConfig = {
  eslint: {
    // Warning: skips ESLint during build
    ignoreDuringBuilds: false, // keep false for safety
  },
};
```

## Experimental features

```javascript
const nextConfig = {
  experimental: {
    // Enable features that are still in development
    ppr: true,                    // Partial Prerendering
    serverActions: {
      bodySizeLimit: "2mb",       // Increase Server Action body limit
    },
  },
};
```

## Using plugins

```javascript
import bundleAnalyzer from "@next/bundle-analyzer";
import mdx from "@next/mdx";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = mdx({
  extension: /\.mdx?$/,
});

const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx"],
};

export default withBundleAnalyzer(withMDX(nextConfig));
```

## Complete example

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" },
    ],
  },

  async redirects() {
    return [
      { source: "/old", destination: "/new", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Key takeaways

- `next.config.js` is the central configuration file for Next.js.
- Configure redirects, rewrites, headers, and image domains here.
- Use `output: "standalone"` for Docker, `output: "export"` for static sites.
- Keep `ignoreBuildErrors` and `ignoreDuringBuilds` as `false` for safety.
- Chain plugins using function composition: `withPlugin(nextConfig)`.
- Most Next.js features work with zero configuration.
