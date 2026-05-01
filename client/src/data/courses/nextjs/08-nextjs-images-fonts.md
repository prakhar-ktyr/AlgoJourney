---
title: Next.js Images & Fonts
---

# Next.js Images & Fonts

Next.js provides built-in optimization for images and fonts. The `next/image` component automatically optimizes images (resizing, compression, modern formats), while `next/font` loads fonts with zero layout shift.

## next/image

The `Image` component extends HTML `<img>` with automatic optimization:

```javascript
import Image from "next/image";

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero banner"
      width={1200}
      height={600}
      priority
    />
  );
}
```

### What it does automatically

| Optimization | How |
|-------------|-----|
| Lazy loading | Images load when they enter the viewport |
| Responsive | Serves different sizes for different screens |
| Modern formats | Converts to WebP/AVIF when supported |
| Prevents CLS | Reserves space to prevent layout shift |
| On-demand | Optimizes at request time, not build time |

### Local images

```javascript
import Image from "next/image";
import profilePic from "@/assets/profile.jpg";

export default function Profile() {
  return (
    <Image
      src={profilePic}
      alt="Profile photo"
      // width and height are automatically inferred
      placeholder="blur" // shows blurred placeholder while loading
    />
  );
}
```

For local images (imported directly), Next.js automatically determines width, height, and generates a blur placeholder.

### Remote images

```javascript
<Image
  src="https://example.com/photo.jpg"
  alt="Remote photo"
  width={800}
  height={600}
/>
```

Remote images require `width` and `height` (since Next.js can't analyze them at build time). You must also allow the domain in `next.config.mjs`:

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};
export default nextConfig;
```

### Fill mode

When you don't know the exact dimensions, use `fill` to make the image fill its parent:

```javascript
<div className="relative w-full h-64">
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    className="object-cover rounded-lg"
  />
</div>
```

The parent must have `position: relative` (or `absolute`/`fixed`). The image fills the parent and you control fit with `object-cover`, `object-contain`, etc.

### Image sizes

Tell Next.js how large the image will be at different breakpoints:

```javascript
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

This generates a proper `srcset` so the browser downloads the right size.

### Priority images

For above-the-fold images (hero banners, LCP images), disable lazy loading:

```javascript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // disables lazy loading, preloads the image
/>
```

### Image component props

| Prop | Type | Description |
|------|------|-------------|
| `src` | string or import | Image source |
| `alt` | string | Alt text (required) |
| `width` | number | Width in pixels |
| `height` | number | Height in pixels |
| `fill` | boolean | Fill parent container |
| `sizes` | string | Responsive size hints |
| `priority` | boolean | Preload (above the fold) |
| `placeholder` | `"blur"` or `"empty"` | Placeholder while loading |
| `quality` | number (1-100) | Image quality (default: 75) |
| `loading` | `"lazy"` or `"eager"` | Loading strategy |

## next/font

`next/font` loads Google Fonts and local fonts with **zero layout shift** — fonts are downloaded at build time and self-hosted.

### Google Fonts

```javascript
// src/app/layout.js
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Using font variables with Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-roboto-mono)"],
      },
    },
  },
};
```

```javascript
<code className="font-mono">console.log("hello")</code>
```

### Font options

```javascript
const inter = Inter({
  subsets: ["latin"],          // required: which character sets to load
  weight: ["400", "700"],      // specific weights (optional for variable fonts)
  style: ["normal", "italic"], // font styles
  display: "swap",             // font-display CSS property
  variable: "--font-inter",    // CSS variable name
  preload: true,               // preload the font (default: true)
  fallback: ["system-ui"],     // fallback fonts
});
```

### Local fonts

```javascript
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-custom",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={myFont.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Multiple fonts

```javascript
import { Inter, Fira_Code } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
```

## Static assets in public/

Files in the `public/` folder are served at the root URL:

```
public/
├── favicon.ico        → /favicon.ico
├── robots.txt         → /robots.txt
├── og-image.png       → /og-image.png
└── images/
    └── logo.svg       → /images/logo.svg
```

```javascript
<Image src="/images/logo.svg" alt="Logo" width={120} height={40} />
```

## Key takeaways

- Use `next/image` for automatic image optimization — lazy loading, modern formats, responsive sizing.
- Use `fill` + `sizes` when image dimensions are unknown.
- Add `priority` to above-the-fold images (hero, LCP).
- Use `next/font` for Google or local fonts — zero layout shift, self-hosted.
- Configure `remotePatterns` in `next.config.mjs` for external image sources.
- Put static assets in `public/` — they're served at the root URL.
