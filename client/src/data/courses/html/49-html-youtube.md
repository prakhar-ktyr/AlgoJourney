---
title: HTML YouTube & Embeds
---

# HTML YouTube & Embeds

Embed YouTube videos and other external content in your web pages using `<iframe>`.

---

## Embedding YouTube Videos

```html
<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
</iframe>
```

Replace `VIDEO_ID` with the actual YouTube video ID (the part after `v=` in the URL).

> [!TIP]
> The easiest way: on YouTube, click **Share → Embed** and copy the provided iframe code.

---

## YouTube URL Formats

| URL Type | Format |
|----------|--------|
| Standard | `https://www.youtube.com/watch?v=VIDEO_ID` |
| Embed | `https://www.youtube.com/embed/VIDEO_ID` |
| Short | `https://youtu.be/VIDEO_ID` |

Always use the **embed** format for iframes.

---

## YouTube Parameters

Add parameters to the URL to customize behavior:

```html
<iframe
    src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&start=30&end=120&loop=1"
    width="560" height="315"
    title="Video" allowfullscreen>
</iframe>
```

| Parameter | Description |
|-----------|-------------|
| `autoplay=1` | Auto-play (requires `mute=1`) |
| `mute=1` | Start muted |
| `start=30` | Start at 30 seconds |
| `end=120` | Stop at 120 seconds |
| `loop=1` | Loop the video |
| `controls=0` | Hide player controls |
| `rel=0` | Don't show related videos |
| `modestbranding=1` | Minimal YouTube branding |

---

## Responsive YouTube Embed

```html
<style>
    .video-container {
        position: relative;
        padding-bottom: 56.25%; /* 16:9 aspect ratio */
        height: 0;
        overflow: hidden;
    }
    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="Responsive video"
        allowfullscreen>
    </iframe>
</div>
```

Or use modern CSS `aspect-ratio`:

```html
<style>
    .video-wrapper iframe {
        width: 100%;
        aspect-ratio: 16 / 9;
    }
</style>
```

---

## Privacy-Enhanced Mode

Use `youtube-nocookie.com` to prevent YouTube from tracking users before they play:

```html
<iframe
    src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
    title="Privacy-enhanced video"
    allowfullscreen>
</iframe>
```

---

## Embedding Other Platforms

### Google Maps

```html
<iframe
    src="https://www.google.com/maps/embed?pb=!1m18..."
    width="600" height="450"
    style="border:0;"
    allowfullscreen
    loading="lazy"
    title="Google Maps">
</iframe>
```

### CodePen

```html
<iframe
    height="400"
    style="width: 100%;"
    scrolling="no"
    title="CodePen Embed"
    src="https://codepen.io/username/embed/pen-id"
    allowfullscreen>
</iframe>
```

---

## Summary

- Use `<iframe>` with YouTube's **embed URL** format
- Add **URL parameters** to customize playback
- Wrap in a container with **`padding-bottom: 56.25%`** for responsive 16:9 ratio
- Use **`youtube-nocookie.com`** for privacy-enhanced embedding
- Always include a **`title`** attribute for accessibility
