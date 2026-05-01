---
title: JavaScript Dates
---

# JavaScript Dates

JavaScript's built-in `Date` is the *original* 1995 implementation — it works, it's everywhere, and it has well-known design flaws. Modern code uses it for simple tasks and reaches for libraries (or the new **Temporal** API) for anything timezone-heavy.

## Creating a Date

```javascript
new Date();                       // now
new Date("2025-01-15");           // ISO string (UTC midnight)
new Date("2025-01-15T10:30:00");  // ISO string (local time)
new Date(2025, 0, 15);            // year, month (0-based!), day
new Date(2025, 0, 15, 10, 30);    // + hours, minutes
new Date(0);                      // 1970-01-01T00:00:00.000Z (Unix epoch)
new Date(1735689600000);          // milliseconds since epoch
```

The big gotcha: **months are 0-indexed** in the constructor. January is 0, December is 11. Days, hours, minutes, etc. are 1-indexed (or 0-23 for hours). Yes, that's inconsistent.

## The current time

```javascript
Date.now();         // 1735689600000  — milliseconds since 1970-01-01 UTC
new Date().getTime(); // same number, slower
+new Date();          // also same (unary plus calls valueOf)
```

Use `Date.now()` for timers, IDs, and `if (Date.now() < deadline)`.

## Reading parts of a Date

```javascript
const d = new Date("2025-01-15T10:30:45.123Z");

d.getFullYear();   // 2025
d.getMonth();      // 0   (January!)
d.getDate();       // 15  (day of month)
d.getDay();        // 3   (day of week, 0=Sunday)
d.getHours();      // 10  (in local time)
d.getMinutes();    // 30
d.getSeconds();    // 45
d.getMilliseconds(); // 123

// UTC variants — independent of the user's timezone
d.getUTCFullYear();
d.getUTCHours();
// ...
```

The plain `getXxx` methods always return the value **in the local timezone**. The `getUTCXxx` methods return UTC. Mixing them is the source of countless bugs.

## Modifying a Date (mutates)

```javascript
const d = new Date(2025, 0, 1);
d.setFullYear(2026);
d.setMonth(11);
d.setDate(d.getDate() + 7);  // advance one week
```

`Date` is mutable. To "modify" without changing the original, copy first:

```javascript
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
```

`set` methods overflow gracefully — `setMonth(13)` becomes January of the next year, `setDate(0)` becomes the last day of the previous month. That's actually useful for "last day of month":

```javascript
const lastDayOfJanuary = new Date(2025, 1, 0); // Feb month, day 0
```

## Formatting

The default `toString` is verbose and locale-dependent. Better choices:

```javascript
const d = new Date("2025-01-15T10:30:00Z");

d.toISOString();   // "2025-01-15T10:30:00.000Z"   ← always UTC, always the same
d.toJSON();        // same as toISOString
d.toDateString();  // "Wed Jan 15 2025"
d.toTimeString();  // "10:30:00 GMT+0000 (..."

// Locale formatting (modern, recommended)
d.toLocaleDateString("en-US"); // "1/15/2025"
d.toLocaleDateString("de-DE"); // "15.1.2025"
d.toLocaleString("en-US", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/New_York",
});
// "Wednesday, January 15, 2025 at 5:30 AM"
```

For complete control, use `Intl.DateTimeFormat`:

```javascript
const fmt = new Intl.DateTimeFormat("en-GB", {
  year: "numeric", month: "short", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
  timeZone: "Europe/London",
});
fmt.format(d); // "15 Jan 2025, 10:30"
```

This is the right way to display dates to users — it handles every locale on Earth and respects timezones.

## Comparing Dates

`Date` objects compare by reference with `===`, so use `<`, `>`, or `getTime()`:

```javascript
const a = new Date(2025, 0, 1);
const b = new Date(2025, 0, 1);

a === b;           // false  (two objects)
a.getTime() === b.getTime();  // true
a < b;             // false (Date coerces via valueOf → ms)
a - b;             // 0     (difference in ms)
```

## Time arithmetic

Math on dates means converting to milliseconds:

```javascript
const start = Date.now();
doWork();
const elapsedMs = Date.now() - start;

const oneDay = 1000 * 60 * 60 * 24;
const tomorrow = new Date(Date.now() + oneDay);
```

For "subtract 6 months" or "next Tuesday", reach for a library or `Temporal`.

## Timezones

`Date` always stores a single moment in time (UTC milliseconds since epoch). What changes is how it's displayed. There is no built-in way to construct a `Date` from "January 15 in Tokyo" without parsing or arithmetic — this is the single biggest reason teams adopt date libraries.

Display in a specific zone:

```javascript
new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
```

## Parsing user input

Avoid `new Date(string)` for anything but ISO 8601 — historical browsers parse other formats inconsistently.

```javascript
new Date("2025-01-15");          // ✅ ISO — reliable (treated as UTC)
new Date("2025-01-15T10:30:00"); // ✅ ISO — reliable (treated as local)
new Date("01/15/2025");          // ❌ ambiguous, locale-dependent
new Date("Jan 15, 2025");        // ❌ inconsistent across runtimes
```

For form input, parse explicitly with split/regex/library and then construct via `new Date(year, month, day, ...)`.

## The `Temporal` API (the future)

`Temporal` is a new built-in (stage 3 → coming) that replaces `Date` with a sane, immutable, timezone-aware design:

```javascript
// Coming soon
Temporal.Now.plainDateISO();        // "2025-01-15"
Temporal.PlainDate.from("2025-01-15").add({ months: 6 });
Temporal.ZonedDateTime.from("2025-01-15T10:30[Asia/Tokyo]");
```

Until it ships everywhere, use a polyfill or a library:

- **date-fns** — modular, immutable, tree-shakeable.
- **Day.js** — small (2 KB), Moment-compatible API.
- **Luxon** — opinionated, timezone-first.

## Common recipes

```javascript
// Today at midnight (local)
const today = new Date();
today.setHours(0, 0, 0, 0);

// Days between two dates (ignoring DST quirks)
const days = Math.round((b - a) / 86_400_000);

// Format as YYYY-MM-DD
const ymd = (d) => d.toISOString().slice(0, 10);

// "X minutes ago" with Intl
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
rtf.format(-3, "hour");   // "3 hours ago"
rtf.format( 1, "day");    // "tomorrow"
```

## Next step

Iterating sequences of values lazily is a recurring need. On to iterators and generators.
