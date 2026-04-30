---
title: Python Dates & Times
---

# Python Dates & Times

Date and time handling is messy in every language. Python's `datetime` module gets you most of the way; `zoneinfo` (Python 3.9+) handles time zones cleanly.

```python
from datetime import datetime, date, time, timedelta
```

## The four core types

| Type        | Holds                             |
| ----------- | --------------------------------- |
| `date`      | year, month, day                  |
| `time`      | hour, minute, second, microsecond |
| `datetime`  | both                              |
| `timedelta` | a duration                        |

## Creating values

```python
from datetime import date, time, datetime

today = date.today()
print(today)                       # 2025-01-15

now = datetime.now()
print(now)                         # 2025-01-15 12:34:56.789012

specific = date(2025, 1, 15)
noon = time(12, 0)
dt = datetime(2025, 1, 15, 12, 0, 0)
```

## Parsing strings — `strptime`

```python
dt = datetime.strptime("2025-01-15 12:00", "%Y-%m-%d %H:%M")
```

The format codes match C's `strftime`. Common ones:

| Code | Meaning          | Example     |
| ---- | ---------------- | ----------- |
| `%Y` | 4-digit year     | `2025`      |
| `%y` | 2-digit year     | `25`        |
| `%m` | month (01-12)    | `01`        |
| `%d` | day (01-31)      | `15`        |
| `%H` | hour 24h (00-23) | `13`        |
| `%I` | hour 12h         | `01`        |
| `%M` | minute           | `30`        |
| `%S` | second           | `45`        |
| `%p` | AM/PM            | `PM`        |
| `%A` | weekday name     | `Wednesday` |
| `%a` | abbr. weekday    | `Wed`       |
| `%B` | month name       | `January`   |
| `%b` | abbr. month      | `Jan`       |
| `%Z` | tz name          | `UTC`       |
| `%z` | tz offset        | `+0530`     |

## Formatting — `strftime`

```python
dt.strftime("%A, %B %d, %Y")       # 'Wednesday, January 15, 2025'
dt.strftime("%Y-%m-%d %H:%M:%S")   # '2025-01-15 12:00:00'
```

For ISO-8601 strings (the standard for APIs and JSON), use the dedicated helpers:

```python
dt.isoformat()                     # '2025-01-15T12:00:00'
datetime.fromisoformat("2025-01-15T12:00:00")
```

## `timedelta` — durations

```python
from datetime import timedelta

one_week = timedelta(days=7)
later = datetime.now() + one_week

delta = datetime(2025, 1, 1) - datetime(2024, 1, 1)
delta.days                         # 366  (2024 was a leap year)
delta.total_seconds()              # 31_622_400.0
```

`timedelta` accepts `days`, `hours`, `minutes`, `seconds`, `milliseconds`, `microseconds`, `weeks` — but not months/years (because their length varies).

For "add 1 month", use the third-party `dateutil`:

```python
# pip install python-dateutil
from dateutil.relativedelta import relativedelta
datetime(2025, 1, 31) + relativedelta(months=1)    # 2025-02-28
```

## Timezones — naive vs aware

A `datetime` with no `tzinfo` is **naive** (it doesn't know what zone it's in). One with `tzinfo` is **aware**. Mixing them raises `TypeError`.

```python
naive = datetime.now()                    # naive — local time, no tz info
aware = datetime.now().astimezone()       # naive → aware (uses system tz)
```

Always store and pass around **aware UTC** datetimes. Convert to local time only at display:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

now_utc = datetime.now(timezone.utc)
now_ny  = now_utc.astimezone(ZoneInfo("America/New_York"))
now_in  = now_utc.astimezone(ZoneInfo("Asia/Kolkata"))

print(now_utc.isoformat())     # 2025-01-15T17:00:00+00:00
print(now_ny.isoformat())      # 2025-01-15T12:00:00-05:00
print(now_in.isoformat())      # 2025-01-15T22:30:00+05:30
```

`ZoneInfo` reads from your OS's IANA timezone database — no third-party install needed (Python 3.9+).

## Unix timestamps

```python
import time
ts = time.time()                          # 1705331696.123 (seconds since 1970-01-01 UTC)

datetime.fromtimestamp(ts)                # local time
datetime.fromtimestamp(ts, tz=timezone.utc)   # aware UTC
datetime.now(tz=timezone.utc).timestamp() # back to a Unix timestamp
```

## The classic gotcha — `datetime.utcnow()` is naive

```python
datetime.utcnow()                          # naive! easy to misuse
datetime.now(timezone.utc)                 # aware — preferred
```

Python 3.12 deprecated `utcnow()`. Always use `datetime.now(timezone.utc)`.

## Comparing & sorting

Aware datetimes compare across zones correctly. Naive ones compare positionally — be careful.

```python
events = [datetime(2025, 1, 5), datetime(2025, 1, 1), datetime(2025, 1, 3)]
events.sort()
```

## Try it

```python
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

now_utc = datetime.now(timezone.utc)
deadline = now_utc + timedelta(days=14)

print("Now in UTC:    ", now_utc.isoformat(timespec="seconds"))
print("Now in Tokyo:  ", now_utc.astimezone(ZoneInfo("Asia/Tokyo")))
print("Deadline (NY): ", deadline.astimezone(ZoneInfo("America/New_York")))
```
