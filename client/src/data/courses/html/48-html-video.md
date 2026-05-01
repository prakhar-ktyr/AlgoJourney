---
title: HTML Video
---

# HTML Video

The `<video>` element embeds video content directly in your web page without plugins.

---

## Basic Video

```html
<video controls width="640" height="360">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Your browser does not support the video element.
</video>
```

---

## Video Attributes

| Attribute | Description |
|-----------|-------------|
| `controls` | Shows play/pause, volume, fullscreen, progress |
| `autoplay` | Starts playing automatically (requires `muted`) |
| `loop` | Restarts when finished |
| `muted` | Starts muted |
| `poster` | Image shown before video plays |
| `preload` | `none`, `metadata`, or `auto` |
| `width` / `height` | Video dimensions |
| `playsinline` | Plays inline on iOS (not fullscreen) |

```html
<video controls poster="thumbnail.jpg" preload="metadata" width="100%">
    <source src="tutorial.mp4" type="video/mp4">
</video>
```

---

## The `poster` Attribute

Display a preview image before the video plays:

```html
<video controls poster="preview.jpg" width="640">
    <source src="demo.mp4" type="video/mp4">
</video>
```

---

## Video Formats

| Format | MIME Type | Best For |
|--------|-----------|----------|
| MP4 (H.264) | `video/mp4` | Universal compatibility |
| WebM (VP9) | `video/webm` | Better compression, open format |
| OGG (Theora) | `video/ogg` | Open format (less common) |

> [!TIP]
> **MP4** is the safest format with universal browser support. Provide **WebM** as an alternative for better compression.

---

## Responsive Video

```html
<style>
    video {
        width: 100%;
        max-width: 800px;
        height: auto;
    }
</style>

<video controls poster="thumb.jpg">
    <source src="video.mp4" type="video/mp4">
</video>
```

---

## Subtitles and Captions

Use `<track>` to add subtitles, captions, or descriptions:

```html
<video controls width="640">
    <source src="video.mp4" type="video/mp4">
    <track src="subtitles-en.vtt" kind="subtitles" srclang="en" label="English" default>
    <track src="subtitles-es.vtt" kind="subtitles" srclang="es" label="Spanish">
</video>
```

The `.vtt` (WebVTT) file format:

```
WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to this HTML tutorial.

00:00:05.000 --> 00:00:08.000
Today we'll learn about video elements.
```

| `kind` Value | Purpose |
|-------------|---------|
| `subtitles` | Translation of dialogue |
| `captions` | Dialogue + sound descriptions (for deaf/HoH) |
| `descriptions` | Text descriptions of visual content |
| `chapters` | Chapter titles for navigation |

---

## Background Video

```html
<style>
    .video-bg {
        position: relative;
        overflow: hidden;
        height: 100vh;
    }
    .video-bg video {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        min-width: 100%; min-height: 100%;
        object-fit: cover;
    }
    .video-bg .overlay {
        position: relative;
        z-index: 1;
        color: white;
        text-align: center;
        padding-top: 40vh;
    }
</style>

<div class="video-bg">
    <video autoplay muted loop playsinline>
        <source src="bg-video.mp4" type="video/mp4">
    </video>
    <div class="overlay">
        <h1>Welcome to My Site</h1>
    </div>
</div>
```

---

## Summary

- Use `<video>` with **`controls`** for user-controlled playback
- **`poster`** sets a preview image
- Provide **MP4 + WebM** for best compatibility
- Add **`<track>`** for subtitles and captions (accessibility!)
- Autoplay requires **`muted`**; add **`playsinline`** for iOS
