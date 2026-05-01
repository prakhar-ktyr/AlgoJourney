---
title: HTML Geolocation API
---

# HTML Geolocation API

The Geolocation API lets you get the user's **geographic location** (with their permission).

---

## Getting the User's Position

```html
<button onclick="getLocation()">Get My Location</button>
<p id="location"></p>

<script>
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            document.getElementById("location").textContent =
                "Geolocation is not supported by this browser.";
        }
    }

    function showPosition(position) {
        const { latitude, longitude } = position.coords;
        document.getElementById("location").textContent =
            `Latitude: ${latitude}, Longitude: ${longitude}`;
    }

    function showError(error) {
        const messages = {
            1: "User denied the request for Geolocation.",
            2: "Location information is unavailable.",
            3: "The request to get user location timed out.",
        };
        document.getElementById("location").textContent =
            messages[error.code] || "An unknown error occurred.";
    }
</script>
```

---

## Position Data

The `position.coords` object contains:

| Property | Description |
|----------|-------------|
| `latitude` | Latitude in decimal degrees |
| `longitude` | Longitude in decimal degrees |
| `accuracy` | Accuracy in meters |
| `altitude` | Altitude in meters (if available) |
| `altitudeAccuracy` | Altitude accuracy (if available) |
| `heading` | Direction of travel in degrees (if available) |
| `speed` | Speed in meters/second (if available) |

---

## Watch Position (Continuous Tracking)

```html
<script>
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            console.log(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
    );

    // Stop watching
    // navigator.geolocation.clearWatch(watchId);
</script>
```

---

## Options

```html
<script>
    const options = {
        enableHighAccuracy: true,  // Use GPS (slower but more accurate)
        timeout: 5000,             // Max wait time in ms
        maximumAge: 0              // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
</script>
```

---

## Privacy

> [!IMPORTANT]
> The browser always **asks the user for permission** before sharing location data. Geolocation only works over **HTTPS** (or localhost). Never access location without a clear reason.

---

## Summary

- Use `navigator.geolocation.getCurrentPosition()` for one-time location
- Use `watchPosition()` for continuous tracking
- Always handle **errors** (permission denied, unavailable, timeout)
- Only works over **HTTPS** and requires **user consent**
