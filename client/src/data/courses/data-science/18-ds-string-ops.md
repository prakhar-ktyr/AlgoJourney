---
title: String Operations
---

# String Operations

Real-world data is messy — names have extra spaces, inconsistent capitalization, and embedded codes. pandas provides powerful string methods through the `.str` accessor to clean and transform text data efficiently.

---

## The String Accessor

Every pandas Series with string (object) dtype exposes the `.str` accessor, which gives you vectorized string operations:

```python
import pandas as pd

names = pd.Series(['  Alice Smith  ', 'BOB jones', 'charlie BROWN', 'Diana Prince'])

# Access string methods
print(names.str.lower())
```

Output:

```
0      alice smith  
1          bob jones
2    charlie brown
3      diana prince
dtype: object
```

> **Important**: `.str` methods return a new Series — the original is unchanged.

---

## Case Methods

Change the capitalization of text:

```python
s = pd.Series(['hello world', 'PYTHON PANDAS', 'Data Science'])

print("lower:", s.str.lower().tolist())
print("upper:", s.str.upper().tolist())
print("title:", s.str.title().tolist())
print("capitalize:", s.str.capitalize().tolist())
print("swapcase:", s.str.swapcase().tolist())
```

Output:

```
lower: ['hello world', 'python pandas', 'data science']
upper: ['HELLO WORLD', 'PYTHON PANDAS', 'DATA SCIENCE']
title: ['Hello World', 'Python Pandas', 'Data Science']
capitalize: ['Hello world', 'Python pandas', 'Data science']
swapcase: ['HELLO WORLD', 'python pandas', 'dATA sCIENCE']
```

### Practical Use: Standardize Names

```python
df = pd.DataFrame({
    'name': ['  john DOE  ', 'JANE smith', 'bob WILSON']
})

# Clean and standardize
df['name_clean'] = df['name'].str.strip().str.title()
print(df)
```

Output:

```
           name  name_clean
0    john DOE    John Doe
1    JANE smith  Jane Smith
2    bob WILSON  Bob Wilson
```

---

## Stripping Whitespace

Remove leading, trailing, or both whitespace characters:

```python
s = pd.Series(['  hello  ', '  world', 'python  ', '  data  '])

print("strip:", s.str.strip().tolist())
print("lstrip:", s.str.lstrip().tolist())
print("rstrip:", s.str.rstrip().tolist())
```

Output:

```
strip: ['hello', 'world', 'python', 'data']
lstrip: ['hello  ', 'world', 'python  ', 'data  ']
rstrip: ['  hello', '  world', 'python', '  data']
```

### Strip Specific Characters

```python
s = pd.Series(['##price##', '--name--', '**value**'])

print(s.str.strip('#').tolist())   # ['price##', '--name--', '**value**'] — only # stripped
print(s.str.strip('#-*').tolist()) # ['price', 'name', 'value']
```

---

## Contains and Matching

Search for patterns within strings:

### str.contains()

```python
df = pd.DataFrame({
    'email': ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com',
              'diana@outlook.com', 'eve@company.org']
})

# Find Gmail users
gmail_mask = df['email'].str.contains('gmail')
print(df[gmail_mask])
```

Output:

```
               email
0    alice@gmail.com
2  charlie@gmail.com
```

### Case Insensitive Search

```python
products = pd.Series(['iPhone 15', 'IPHONE 14', 'Samsung Galaxy', 'iphone SE'])

# Case insensitive contains
apple = products.str.contains('iphone', case=False)
print(products[apple].tolist())
# ['iPhone 15', 'IPHONE 14', 'iphone SE']
```

### Regex in contains

```python
# Find strings with digits
s = pd.Series(['abc', 'abc123', '456', 'def789ghi'])

has_digits = s.str.contains(r'\d+', regex=True)
print(s[has_digits].tolist())
# ['abc123', '456', 'def789ghi']
```

### startswith and endswith

```python
urls = pd.Series(['https://google.com', 'http://example.com',
                  'https://github.com', 'ftp://files.com'])

# HTTPS only
secure = urls.str.startswith('https://')
print(urls[secure].tolist())
# ['https://google.com', 'https://github.com']

# .com domains
com_domains = urls.str.endswith('.com')
print(urls[com_domains].tolist())
# All of them end with .com
```

### str.match()

`match()` tests if the string matches a regex **from the start**:

```python
codes = pd.Series(['AB-123', 'CD-456', '12-ABC', 'EF-789'])

# Match pattern: two letters, dash, three digits
pattern = r'[A-Z]{2}-\d{3}'
matched = codes.str.match(pattern)
print(codes[matched].tolist())
# ['AB-123', 'CD-456', 'EF-789']
```

---

## Replacing

### Simple Replace

```python
s = pd.Series(['Hello World', 'Hello Python', 'Hello Pandas'])

result = s.str.replace('Hello', 'Hi')
print(result.tolist())
# ['Hi World', 'Hi Python', 'Hi Pandas']
```

### Regex Replace

```python
# Remove all digits
s = pd.Series(['abc123', 'def456', 'ghi789'])

result = s.str.replace(r'\d+', '', regex=True)
print(result.tolist())
# ['abc', 'def', 'ghi']
```

```python
# Standardize phone numbers
phones = pd.Series(['(123) 456-7890', '123-456-7890', '123.456.7890'])

# Remove all non-digit characters
clean = phones.str.replace(r'[^\d]', '', regex=True)
print(clean.tolist())
# ['1234567890', '1234567890', '1234567890']
```

### Replace Multiple Patterns

```python
# Chain replacements
s = pd.Series(['price: $100', 'cost: $200', 'value: $50'])

result = s.str.replace(r'[a-z]+:\s*', '', regex=True).str.replace('$', '', regex=False)
print(result.tolist())
# ['100', '200', '50']
```

---

## Splitting

### Basic Split

```python
names = pd.Series(['John Smith', 'Jane Doe', 'Bob Wilson Jr'])

# Split returns lists
split_names = names.str.split(' ')
print(split_names.tolist())
# [['John', 'Smith'], ['Jane', 'Doe'], ['Bob', 'Wilson', 'Jr']]
```

### Split with expand=True

Returns a DataFrame instead of lists:

```python
# Expand into separate columns
name_parts = names.str.split(' ', expand=True)
print(name_parts)
```

Output:

```
      0       1     2
0  John   Smith  None
1  Jane     Doe  None
2   Bob  Wilson    Jr
```

### Limit Number of Splits

```python
# Split only on first space
name_parts = names.str.split(' ', n=1, expand=True)
name_parts.columns = ['first_name', 'last_name']
print(name_parts)
```

Output:

```
  first_name   last_name
0       John       Smith
1       Jane         Doe
2        Bob   Wilson Jr
```

### Split from Right

```python
emails = pd.Series(['user@sub.domain.com', 'admin@site.org'])

# rsplit splits from the right
parts = emails.str.rsplit('.', n=1, expand=True)
print(parts)
```

---

## Extracting

### str.extract() — Regex Capture Groups

```python
# Extract numbers from strings
s = pd.Series(['Price: $45.99', 'Cost: $12.50', 'Value: $100.00'])

# Extract the number (capture group)
amounts = s.str.extract(r'\$(\d+\.\d+)')
print(amounts)
```

Output:

```
        0
0   45.99
1   12.50
2  100.00
```

### Multiple Capture Groups

```python
# Extract first and last name
full_names = pd.Series(['Smith, John', 'Doe, Jane', 'Wilson, Bob'])

extracted = full_names.str.extract(r'(\w+),\s*(\w+)')
extracted.columns = ['last', 'first']
print(extracted)
```

Output:

```
     last first
0   Smith  John
1     Doe  Jane
2  Wilson   Bob
```

### str.extractall() — All Matches

```python
# Extract all numbers
s = pd.Series(['a1b2c3', 'x4y5', 'no numbers'])

all_nums = s.str.extractall(r'(\d)')
print(all_nums)
```

Output:

```
         0
  match
0 0      1
  1      2
  2      3
1 0      4
  1      5
```

### String Slicing

```python
codes = pd.Series(['ABC-123-XY', 'DEF-456-ZW', 'GHI-789-AB'])

# First 3 characters
print(codes.str[0:3].tolist())
# ['ABC', 'DEF', 'GHI']

# Last 2 characters
print(codes.str[-2:].tolist())
# ['XY', 'ZW', 'AB']

# Middle portion
print(codes.str[4:7].tolist())
# ['123', '456', '789']
```

### Get Character by Index

```python
s = pd.Series(['hello', 'world', 'python'])

# First character
print(s.str.get(0).tolist())
# ['h', 'w', 'p']

# Last character
print(s.str.get(-1).tolist())
# ['o', 'd', 'n']
```

---

## Length

```python
s = pd.Series(['hi', 'hello', 'hey there', ''])

print(s.str.len().tolist())
# [2, 5, 9, 0]

# Filter by length
long_strings = s[s.str.len() > 3]
print(long_strings.tolist())
# ['hello', 'hey there']
```

---

## Padding and Filling

```python
nums = pd.Series(['1', '12', '123', '1234'])

# Zero-fill to 5 digits
print(nums.str.zfill(5).tolist())
# ['00001', '00012', '00123', '01234']

# Pad with spaces (right-align)
print(nums.str.pad(6, side='left', fillchar='_').tolist())
# ['_____1', '____12', '___123', '__1234']

# Center
print(nums.str.center(8, '-').tolist())
# ['---1----', '---12---', '--123---', '--1234--']
```

---

## Joining and Concatenating

```python
# Join elements of a Series
s = pd.Series(['apple', 'banana', 'cherry'])

# Concatenate all values
result = s.str.cat(sep=', ')
print(result)
# 'apple, banana, cherry'

# Concatenate with another Series
s2 = pd.Series([' pie', ' split', ' tart'])
result = s.str.cat(s2)
print(result.tolist())
# ['apple pie', 'banana split', 'cherry tart']
```

---

## Finding and Counting

```python
s = pd.Series(['hello world', 'world hello world', 'no match here'])

# Find position of substring (-1 if not found)
print(s.str.find('world').tolist())
# [6, 0, -1]

# Count occurrences
print(s.str.count('world').tolist())
# [1, 2, 0]

# Count regex matches
emails = pd.Series(['a@b.com, c@d.com', 'e@f.org', 'g@h.com, i@j.com, k@l.com'])
print(emails.str.count(r'@').tolist())
# [2, 1, 3]
```

---

## Complete Example: Clean Messy Data

```python
import pandas as pd

# Messy customer data
customers = pd.DataFrame({
    'full_name': ['  JOHN doe  ', 'jane SMITH', ' Bob Wilson III ', 'alice-jones'],
    'phone': ['(555) 123-4567', '555.987.6543', '555-111-2222', '(555)444 5555'],
    'email': ['JOHN@Gmail.COM', 'jane@Yahoo.com', 'bob@outlook.COM', 'alice@COMPANY.org'],
    'address': ['123 Main St, Apt 4B', '456 Oak Ave', '789 Pine Rd, Suite 100', '321 Elm Blvd']
})

print("=== Original Data ===")
print(customers)

# 1. Clean names
customers['name_clean'] = (
    customers['full_name']
    .str.strip()
    .str.replace('-', ' ', regex=False)
    .str.title()
)

# 2. Standardize phone numbers (digits only, then format)
customers['phone_clean'] = (
    customers['phone']
    .str.replace(r'[^\d]', '', regex=True)
)
# Format as (XXX) XXX-XXXX
customers['phone_formatted'] = (
    customers['phone_clean']
    .str.replace(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', regex=True)
)

# 3. Lowercase emails
customers['email_clean'] = customers['email'].str.lower()

# 4. Extract email domain
customers['domain'] = customers['email_clean'].str.extract(r'@(.+)')

# 5. Parse address components
addr_parts = customers['address'].str.split(',', expand=True)
customers['street'] = addr_parts[0].str.strip()
customers['unit'] = addr_parts[1].str.strip() if 1 in addr_parts.columns else None

print("\n=== Cleaned Data ===")
print(customers[['name_clean', 'phone_formatted', 'email_clean', 'domain']].to_string())
```

---

## Example: Parse Product Codes

```python
import pandas as pd

# Product codes with embedded information
products = pd.DataFrame({
    'code': ['ELEC-TV-55-BLK-2024', 'FURN-SOFA-3S-GRY-2023',
             'ELEC-PHONE-PRO-WHT-2024', 'CLTH-SHIRT-L-BLU-2023']
})

# Extract components using split
parts = products['code'].str.split('-', expand=True)
parts.columns = ['category', 'item', 'variant', 'color', 'year']

print("Parsed product codes:")
print(parts)

# Filter electronics from 2024
mask = (parts['category'] == 'ELEC') & (parts['year'] == '2024')
print("\nElectronics 2024:")
print(parts[mask])

# Extract using regex
extracted = products['code'].str.extract(
    r'(?P<category>\w+)-(?P<item>\w+)-(?P<variant>\w+)-(?P<color>\w+)-(?P<year>\d{4})'
)
print("\nExtracted with named groups:")
print(extracted)
```

---

## String Method Reference

| Method | Description |
|--------|-------------|
| `.str.lower()` | Lowercase |
| `.str.upper()` | Uppercase |
| `.str.title()` | Title Case |
| `.str.strip()` | Remove whitespace |
| `.str.contains()` | Search for pattern |
| `.str.replace()` | Replace pattern |
| `.str.split()` | Split string |
| `.str.extract()` | Regex capture groups |
| `.str.len()` | String length |
| `.str.zfill()` | Zero-pad |
| `.str.cat()` | Concatenate strings |
| `.str.find()` | Find position |
| `.str.count()` | Count occurrences |
| `.str.startswith()` | Check prefix |
| `.str.endswith()` | Check suffix |

---

## Exercises

1. Clean a column of names: strip whitespace, convert to title case
2. Extract area codes from phone numbers using regex
3. Split a "City, State ZIP" column into three separate columns
4. Use `.str.contains()` to filter rows where description mentions "premium" or "deluxe"
5. Replace all special characters in a column with underscores
