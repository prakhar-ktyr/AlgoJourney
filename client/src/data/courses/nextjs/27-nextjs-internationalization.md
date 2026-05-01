---
title: Next.js Internationalization
---

# Next.js Internationalization

Internationalization (i18n) in Next.js lets you serve your application in multiple languages. The App Router doesn't have built-in i18n config like the Pages Router, but you can implement it cleanly with sub-path routing and middleware.

## Strategy: sub-path routing

Prefix routes with a locale: `/en/about`, `/fr/about`, `/de/about`.

```
src/app/
├── [locale]/
│   ├── layout.js
│   ├── page.js           ← /en, /fr, /de
│   ├── about/
│   │   └── page.js       ← /en/about, /fr/about
│   └── blog/
│       └── page.js       ← /en/blog, /fr/blog
```

## Step 1: Define supported locales

```javascript
// src/lib/i18n.js
export const locales = ["en", "fr", "de", "es"];
export const defaultLocale = "en";

export function isValidLocale(locale) {
  return locales.includes(locale);
}
```

## Step 2: Middleware for locale detection

```javascript
// src/middleware.js
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";

function getLocale(request) {
  // Check Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  const preferred = acceptLang.split(",")[0]?.split("-")[0];

  if (locales.includes(preferred)) return preferred;
  return defaultLocale;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the path already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (hasLocale) return NextResponse.next();

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
```

## Step 3: Translation dictionaries

```javascript
// src/lib/dictionaries/en.json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "blog": "Blog"
  },
  "home": {
    "title": "Welcome to our site",
    "description": "We build amazing products."
  }
}
```

```javascript
// src/lib/dictionaries/fr.json
{
  "nav": {
    "home": "Accueil",
    "about": "À propos",
    "blog": "Blog"
  },
  "home": {
    "title": "Bienvenue sur notre site",
    "description": "Nous créons des produits incroyables."
  }
}
```

## Step 4: Dictionary loader

```javascript
// src/lib/dictionaries.js
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
};

export async function getDictionary(locale) {
  return dictionaries[locale]();
}
```

## Step 5: Use in pages

```javascript
// src/app/[locale]/page.js
import { getDictionary } from "@/lib/dictionaries";

export default async function HomePage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
    </div>
  );
}
```

## Step 6: Locale-aware layout

```javascript
// src/app/[locale]/layout.js
import { locales } from "@/lib/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
```

## Language switcher component

```javascript
"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/lib/i18n";

export default function LanguageSwitcher({ currentLocale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale) {
    // Replace current locale in path
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={locale === currentLocale ? "font-bold" : ""}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

## Generating metadata per locale

```javascript
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.home.title,
    description: dict.home.description,
  };
}
```

## Key takeaways

- Use `[locale]` dynamic segment for sub-path routing (`/en/about`, `/fr/about`).
- Middleware detects locale from `Accept-Language` and redirects if missing.
- Store translations as JSON dictionaries — load them on the server.
- Use `generateStaticParams` to pre-render all locale variants.
- Set `<html lang={locale}>` in the locale layout.
- Consider libraries like `next-intl` for more advanced features (plurals, formatting, nested translations).
