---
title: HTML Audio
---

# HTML Audio

The `<audio>` element lets you embed sound content in your web pages without any plugins.

---

## Basic Audio

```html
<audio controls>
    <source src="song.mp3" type="audio/mpeg">
    <source src="song.ogg" type="audio/ogg">
    Your browser does not support the audio element.
</audio>
```

The text between the tags is the **fallback** for browsers that don't support `<audio>`.

---

## Audio Attributes

| Attribute | Description |
|-----------|-------------|
| `controls` | Shows play/pause, volume, progress bar |
| `autoplay` | Starts playing automatically |
| `loop` | Restarts when finished |
| `muted` | Starts muted |
| `preload` | How to preload: `none`, `metadata`, `auto` |
| `src` | Audio file URL (alternative to `<source>`) |

```html
<!-- Auto-play background music (must be muted for autoplay to work) -->
<audio autoplay muted loop>
    <source src="background.mp3" type="audio/mpeg">
</audio>

<!-- Preload only metadata (duration, etc.) -->
<audio controls preload="metadata">
    <source src="podcast.mp3" type="audio/mpeg">
</audio>
```

> [!NOTE]
> Most browsers **block autoplay** with sound. Autoplay only works if the audio is `muted` or the user has previously interacted with the site.

---

## Audio Formats

| Format | MIME Type | Browser Support |
|--------|-----------|----------------|
| MP3 | `audio/mpeg` | All modern browsers |
| OGG | `audio/ogg` | Chrome, Firefox, Opera |
| WAV | `audio/wav` | All modern browsers |
| AAC | `audio/aac` | Chrome, Safari, Edge |
| WebM | `audio/webm` | Chrome, Firefox, Opera |

Provide multiple sources for maximum compatibility:

```html
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
</audio>
```

---

## JavaScript Audio Control

```html
<audio id="myAudio" src="song.mp3"></audio>

<button onclick="document.getElementById('myAudio').play()">▶ Play</button>
<button onclick="document.getElementById('myAudio').pause()">⏸ Pause</button>
```

---

## Summary

- Use `<audio>` with **`controls`** for user-visible players
- Provide **multiple formats** with `<source>` for compatibility
- **MP3** has universal support
- Autoplay requires **`muted`** on most browsers
- Use **`preload="metadata"`** to avoid downloading entire files upfront
