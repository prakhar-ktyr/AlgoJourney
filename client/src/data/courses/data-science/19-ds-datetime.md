---
title: Date & Time Data
---

# Date & Time Data

Time is a fundamental dimension in data analysis. Understanding how to work with dates enables trend analysis, seasonality detection, forecasting, and time-based aggregation.

---

## Why DateTime Matters

- **Trends**: Is revenue growing month over month?
- **Seasonality**: Do sales peak in December?
- **Duration**: How long does each customer session last?
- **Comparison**: Same period last year vs this year

---

## Creating DateTime Objects

### pd.to_datetime()

The primary way to convert strings to datetime:

```python
import pandas as pd

# Single value
dt = pd.to_datetime('2024-01-15')
print(dt)
# 2024-01-15 00:00:00

# With time
dt = pd.to_datetime('2024-01-15 14:30:00')
print(dt)
# 2024-01-15 14:30:00
```

### Convert a Column

```python
df = pd.DataFrame({
    'date_str': ['2024-01-15', '2024-02-20', '2024-03-10'],
    'sales': [100, 150, 200]
})

# Convert string column to datetime
df['date'] = pd.to_datetime(df['date_str'])
print(df.dtypes)
```

Output:

```
date_str     object
sales         int64
date     datetime64[ns]
dtype: object
```

### Custom Format

When dates aren't in standard format, specify the format:

```python
# Day/Month/Year format
dates = pd.Series(['15/01/2024', '20/02/2024', '10/03/2024'])
parsed = pd.to_datetime(dates, format='%d/%m/%Y')
print(parsed.tolist())
```

Common format codes:

| Code | Meaning | Example |
|------|---------|---------|
| `%Y` | 4-digit year | 2024 |
| `%m` | Month (01–12) | 03 |
| `%d` | Day (01–31) | 15 |
| `%H` | Hour (00–23) | 14 |
| `%M` | Minute (00–59) | 30 |
| `%S` | Second (00–59) | 45 |
| `%B` | Full month name | January |
| `%b` | Abbreviated month | Jan |
| `%A` | Full weekday | Monday |

### Handling Invalid Dates

```python
dates = pd.Series(['2024-01-15', 'not a date', '2024-13-01', '2024-02-30'])

# errors='coerce' converts invalid dates to NaT (Not a Time)
parsed = pd.to_datetime(dates, errors='coerce')
print(parsed)
```

Output:

```
0   2024-01-15
1          NaT
2          NaT
3          NaT
dtype: datetime64[ns]
```

> **NaT** is the datetime equivalent of NaN — it represents missing datetime values.

---

## Timestamp Object

`pd.Timestamp` is pandas' scalar datetime type:

```python
ts = pd.Timestamp('2024-07-15 14:30:45')

# Access components
print(f"Year: {ts.year}")
print(f"Month: {ts.month}")
print(f"Day: {ts.day}")
print(f"Hour: {ts.hour}")
print(f"Minute: {ts.minute}")
print(f"Second: {ts.second}")
```

Output:

```
Year: 2024
Month: 7
Day: 15
Hour: 14
Minute: 30
Second: 45
```

### Day-of-Week and Names

```python
ts = pd.Timestamp('2024-07-15')  # A Monday

print(f"Day of week: {ts.dayofweek}")       # 0 = Monday
print(f"Day name: {ts.day_name()}")         # Monday
print(f"Month name: {ts.month_name()}")     # July
print(f"Quarter: {ts.quarter}")             # 3
print(f"Day of year: {ts.dayofyear}")       # 197
print(f"Is leap year: {ts.is_leap_year}")   # True (2024)
print(f"Week of year: {ts.isocalendar()[1]}")  # 29
```

---

## DatetimeIndex

Create a sequence of dates using `pd.date_range()`:

```python
# 30 consecutive days
dates = pd.date_range('2024-01-01', periods=30, freq='D')
print(dates[:5])
```

Output:

```
DatetimeIndex(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04',
               '2024-01-05'],
              dtype='datetime64[ns]', freq='D')
```

### Common Frequencies

| Code | Frequency | Example |
|------|-----------|---------|
| `D` | Calendar day | Every day |
| `B` | Business day | Mon–Fri only |
| `W` | Weekly | Every Sunday |
| `M` | Month end | Jan 31, Feb 28... |
| `MS` | Month start | Jan 1, Feb 1... |
| `Q` | Quarter end | Mar 31, Jun 30... |
| `Y` | Year end | Dec 31 |
| `H` | Hourly | Every hour |
| `T` or `min` | Minutely | Every minute |

```python
# Weekly dates
weekly = pd.date_range('2024-01-01', periods=12, freq='W')
print(weekly[:4])

# Business days only
business = pd.date_range('2024-01-01', periods=10, freq='B')
print(business[:5])

# Monthly start
monthly = pd.date_range('2024-01-01', periods=6, freq='MS')
print(monthly)
```

### Start and End

```python
# All days between two dates
dates = pd.date_range(start='2024-01-01', end='2024-01-10')
print(len(dates))  # 10
```

---

## The dt Accessor

Access datetime properties on a Series using `.dt`:

```python
df = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=10, freq='D'),
    'sales': range(100, 110)
})

# Extract components
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['day_name'] = df['date'].dt.day_name()
df['is_weekend'] = df['date'].dt.dayofweek >= 5

print(df.head())
```

Output:

```
        date  sales  year  month  day   day_name  is_weekend
0 2024-01-01    100  2024      1    1     Monday       False
1 2024-01-02    101  2024      1    2    Tuesday       False
2 2024-01-03    102  2024      1    3  Wednesday       False
3 2024-01-04    103  2024      1    4   Thursday       False
4 2024-01-05    104  2024      1    5     Friday       False
```

### All dt Properties

```python
s = pd.Series(pd.date_range('2024-06-15', periods=3, freq='M'))

print(s.dt.year.tolist())         # [2024, 2024, 2024]
print(s.dt.month.tolist())        # [6, 7, 8]
print(s.dt.quarter.tolist())      # [2, 3, 3]
print(s.dt.dayofweek.tolist())    # [5, 2, 5] (0=Mon)
print(s.dt.day_name().tolist())   # ['Saturday', 'Wednesday', 'Saturday']
print(s.dt.month_name().tolist()) # ['June', 'July', 'August']
print(s.dt.days_in_month.tolist())# [30, 31, 31]
```

---

## Timedelta: Duration Between Dates

### Creating Timedeltas

```python
# From string
td = pd.Timedelta('5 days')
print(td)  # 5 days 00:00:00

# From keyword arguments
td = pd.Timedelta(days=5, hours=3, minutes=30)
print(td)  # 5 days 03:30:00

# From components
td = pd.Timedelta(weeks=2)
print(td)  # 14 days 00:00:00
```

### Date Arithmetic

```python
date = pd.Timestamp('2024-01-15')

# Add days
future = date + pd.Timedelta(days=7)
print(f"One week later: {future}")
# 2024-01-22 00:00:00

# Subtract days
past = date - pd.Timedelta(days=30)
print(f"30 days ago: {past}")
# 2023-12-16 00:00:00
```

### Duration Between Dates

```python
df = pd.DataFrame({
    'start': pd.to_datetime(['2024-01-01', '2024-02-15', '2024-03-01']),
    'end': pd.to_datetime(['2024-01-10', '2024-03-01', '2024-03-15'])
})

# Calculate duration
df['duration'] = df['end'] - df['start']
df['days'] = df['duration'].dt.days

print(df)
```

Output:

```
       start        end duration  days
0 2024-01-01 2024-01-10   9 days     9
1 2024-02-15 2024-03-01  15 days    15
2 2024-03-01 2024-03-15  14 days    14
```

---

## Period: Spans of Time

A Period represents a span (e.g., "January 2024") rather than a point in time:

```python
# Monthly period
p = pd.Period('2024-01', freq='M')
print(p)           # 2024-01
print(p.start_time)  # 2024-01-01
print(p.end_time)    # 2024-01-31 23:59:59.999999999

# Period range
periods = pd.period_range('2024-01', periods=6, freq='M')
print(periods)
```

Output:

```
PeriodIndex(['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
            dtype='period[M]')
```

---

## Resampling Time Series

Resampling aggregates data at a different time frequency:

```python
import numpy as np

# Daily sales data
dates = pd.date_range('2024-01-01', periods=90, freq='D')
daily_sales = pd.DataFrame({
    'sales': np.random.uniform(100, 500, 90).round(2)
}, index=dates)

print("Daily data (first 5):")
print(daily_sales.head())

# Monthly total
monthly = daily_sales.resample('M').sum()
print("\nMonthly totals:")
print(monthly)

# Weekly average
weekly = daily_sales.resample('W').mean()
print("\nWeekly averages (first 5):")
print(weekly.head())
```

### Common Resample Operations

```python
# Multiple aggregations
monthly_summary = daily_sales.resample('M').agg(['sum', 'mean', 'max', 'min'])
print(monthly_summary)
```

### Upsampling (Less Frequent → More Frequent)

```python
# Monthly to daily with forward fill
monthly_data = pd.DataFrame(
    {'value': [100, 110, 120]},
    index=pd.date_range('2024-01-01', periods=3, freq='MS')
)

daily = monthly_data.resample('D').ffill()
print(daily.head(10))
```

---

## Time Zones

### Localize (Assign a Time Zone)

```python
# Naive datetime (no time zone)
ts = pd.Timestamp('2024-07-15 12:00:00')
print(f"Naive: {ts}")

# Localize to UTC
ts_utc = ts.tz_localize('UTC')
print(f"UTC: {ts_utc}")
```

### Convert Between Time Zones

```python
# Convert UTC to US/Eastern
ts_eastern = ts_utc.tz_convert('US/Eastern')
print(f"Eastern: {ts_eastern}")

# Convert to Asia/Tokyo
ts_tokyo = ts_utc.tz_convert('Asia/Tokyo')
print(f"Tokyo: {ts_tokyo}")
```

### Time Zones on a Series

```python
df = pd.DataFrame({
    'timestamp': pd.date_range('2024-01-01', periods=5, freq='H', tz='UTC')
})

# Convert to different time zone
df['eastern'] = df['timestamp'].dt.tz_convert('US/Eastern')
df['london'] = df['timestamp'].dt.tz_convert('Europe/London')

print(df)
```

---

## Complete Example: Time-Based Analysis

```python
import pandas as pd
import numpy as np

# Simulated e-commerce order data
np.random.seed(42)
n = 500

orders = pd.DataFrame({
    'order_date': pd.date_range('2023-01-01', periods=n, freq='6H'),
    'revenue': np.random.uniform(20, 500, n).round(2),
    'category': np.random.choice(['Electronics', 'Clothing', 'Books', 'Food'], n)
})

print("=== Order Data (first 5) ===")
print(orders.head())

# 1. Extract date features
orders['year'] = orders['order_date'].dt.year
orders['month'] = orders['order_date'].dt.month
orders['day_name'] = orders['order_date'].dt.day_name()
orders['hour'] = orders['order_date'].dt.hour
orders['is_weekend'] = orders['order_date'].dt.dayofweek >= 5

# 2. Monthly revenue trend
orders_indexed = orders.set_index('order_date')
monthly_rev = orders_indexed['revenue'].resample('M').sum()
print("\n=== Monthly Revenue ===")
print(monthly_rev.head())

# 3. Day-of-week analysis
print("\n=== Revenue by Day of Week ===")
dow_revenue = orders.groupby('day_name')['revenue'].agg(['sum', 'mean', 'count'])
day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
print(dow_revenue.loc[day_order].round(2))

# 4. Weekend vs weekday
print("\n=== Weekend vs Weekday ===")
print(orders.groupby('is_weekend')['revenue'].agg(['mean', 'sum', 'count']))

# 5. Hour-of-day pattern
print("\n=== Revenue by Hour ===")
hourly = orders.groupby('hour')['revenue'].mean().round(2)
print(hourly)

# 6. Rolling average (7-day window)
daily = orders_indexed['revenue'].resample('D').sum()
daily_rolling = daily.rolling(window=7).mean()
print("\n=== 7-Day Rolling Average (last 10) ===")
print(daily_rolling.tail(10).round(2))

# 7. Year-over-year comparison
print("\n=== Year-over-Year Monthly Comparison ===")
monthly_by_year = orders_indexed['revenue'].groupby(
    [orders_indexed.index.year, orders_indexed.index.month]
).sum()
print(monthly_by_year.head(6).round(2))
```

---

## Date Math Formulas

Time difference in fractional years:

$$\Delta t = \frac{d_2 - d_1}{365.25}$$

Compound growth over time:

$$V_t = V_0 \cdot (1 + r)^t$$

where $V_0$ is the initial value, $r$ is the growth rate, and $t$ is time in periods.

---

## Exercises

1. Parse a column of dates in "DD-Mon-YYYY" format (e.g., "15-Jan-2024")
2. Create a DatetimeIndex of business days for a given month
3. Calculate the number of working days between two dates
4. Resample daily data to weekly and compute sum, mean, and count
5. Extract time features (hour, day of week, month) and analyze patterns
